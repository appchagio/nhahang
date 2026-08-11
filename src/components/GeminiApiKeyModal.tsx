import React, { useState } from 'react';
import { GeminiService, GEMINI_MODELS } from '../services/geminiService';
import {
  Key,
  X,
  ExternalLink,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ShieldCheck
} from 'lucide-react';

interface GeminiApiKeyModalProps {
  onClose: () => void;
  isMandatory?: boolean;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  onClose,
  isMandatory = false,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => GeminiService.getApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => GeminiService.getSelectedModel());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setErrorMessage('Vui lòng nhập API Key từ Google AI Studio để tiếp tục.');
      return;
    }

    GeminiService.saveApiKey(apiKeyInput.trim());
    GeminiService.saveSelectedModel(selectedModel);
    setSavedSuccess(true);
    setErrorMessage('');

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Key className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Thiết Lập Model & API Key AI
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Google Gemini AI
                </span>
              </div>
              <p className="text-xs text-purple-200/90 font-medium">
                Cấu hình API key và chọn mô hình trí tuệ nhân tạo
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button onClick={onClose} className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5 text-xs max-h-[80vh]">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Đã lưu Gemini API Key & Model thành công!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Model Selection Cards */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Danh Sách Mô Hình AI (Model Cards):</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {GEMINI_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-600 shadow-sm ring-1 ring-purple-500'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{model.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            model.isDefault
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="mt-1">
                      <input
                        type="radio"
                        name="geminiModel"
                        checked={isSelected}
                        onChange={() => setSelectedModel(model.id)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Nhập Google Gemini API Key:</span>
              </label>

              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 hover:text-rose-700 font-black hover:underline flex items-center space-x-1 text-xs bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg animate-pulse"
              >
                <span>Lấy API key để sử dụng app</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-mono text-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
            <p className="text-[11px] text-slate-500">
              API key sẽ được lưu trữ an toàn trong <code>localStorage</code> trình duyệt của bạn.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 font-bold"
              >
                Hủy
              </button>
            )}

            <button
              type="submit"
              className="py-3 px-6 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình API Key</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
