export interface GeminiModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const GEMINI_MODELS: GeminiModelInfo[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định (Tốc độ cao)',
    description: 'Model mặc định với tốc độ phản hồi cực nhanh, tối ưu hóa cho ứng dụng bán hàng POS.',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Phân tích chuyên sâu',
    description: 'Model thông minh cao cấp cho khả năng phân tích dữ liệu kinh doanh phức tạp.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ổn định & Dự phòng',
    description: 'Model dự phòng đảm bảo hệ thống luôn hoạt động liên tục khi các model khác hết quota.',
  },
];

const API_KEY_STORAGE = 'pos_gemini_api_key_v1';
const SELECTED_MODEL_STORAGE = 'pos_gemini_selected_model_v1';

export class GeminiService {
  static getApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  }

  static saveApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  }

  static getSelectedModel(): string {
    return localStorage.getItem(SELECTED_MODEL_STORAGE) || 'gemini-3-flash-preview';
  }

  static saveSelectedModel(model: string): void {
    localStorage.setItem(SELECTED_MODEL_STORAGE, model);
  }

  /**
   * Gọi API Gemini với cơ chế tự động Fallback & Retry qua các model khi gặp lỗi
   */
  static async generateContentWithFallback(
    prompt: string,
    systemInstruction?: string
  ): Promise<{ text: string; modelUsed: string; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        text: '',
        modelUsed: '',
        error: 'CHƯA_CÓ_KEY: Vui lòng nhập Gemini API Key để sử dụng tính năng AI.',
      };
    }

    const preferredModel = this.getSelectedModel();
    // Reorder model attempt queue starting with user's selected model, then remaining fallback models
    const attemptModels = Array.from(
      new Set([preferredModel, 'gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'])
    );

    let lastErrorMsg = '';

    for (const modelId of attemptModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        
        const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
        const requestBody: any = { contents };
        
        if (systemInstruction) {
          requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          lastErrorMsg = `Model ${modelId} thất bại (${errMsg}). Đang thử lại với model dự phòng...`;
          console.warn(lastErrorMsg);
          continue; // Try next fallback model
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const resultText = candidate?.content?.parts?.[0]?.text;

        if (resultText) {
          return {
            text: resultText,
            modelUsed: modelId,
          };
        }
      } catch (err: any) {
        lastErrorMsg = `Lỗi kết nối model ${modelId}: ${err.message || 'Lỗi mạng'}`;
        console.warn(lastErrorMsg);
      }
    }

    return {
      text: '',
      modelUsed: '',
      error: `Tất cả các Model AI đều thất bại! Lỗi nguyên văn: ${lastErrorMsg || '429 RESOURCE_EXHAUSTED / Quá tải Quota'}. Trạng thái: Đã dừng do lỗi.`,
    };
  }
}
