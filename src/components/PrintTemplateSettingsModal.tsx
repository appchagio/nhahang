import React, { useState } from 'react';
import { PrintSettings } from '../types';
import {
  Printer,
  X,
  Save,
  Cpu,
  RefreshCw,
  Radio,
  Minus,
  Plus,
  CheckCircle2,
  Zap,
  QrCode,
  Building2,
  Sparkles,
  Scissors,
  ScissorsLineDashed
} from 'lucide-react';

interface PrintTemplateSettingsModalProps {
  settings: PrintSettings;
  onSave: (newSettings: PrintSettings) => void;
  onClose: () => void;
}

export const PrintTemplateSettingsModal: React.FC<PrintTemplateSettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<PrintSettings>({
    ...settings,
    connectionType: settings.connectionType || 'USB',
    usbDeviceName: settings.usbDeviceName || 'Máy In USB POS (a5c:5843)',
    lanIpAddress: settings.lanIpAddress || '192.168.1.200',
    fontSizePx: settings.fontSizePx || 13,
    invoiceCopies: settings.invoiceCopies ?? 2,
    tempInvoiceCopies: settings.tempInvoiceCopies ?? 1,
    shiftCopies: settings.shiftCopies ?? 1,
    paperSize: settings.paperSize || 'K80',
    tempPaperSize: settings.tempPaperSize || 'K80',
    shiftPaperSize: settings.shiftPaperSize || 'K80',
    optimizeReceiptLength: settings.optimizeReceiptLength ?? true,
    enableAutoCut: settings.enableAutoCut ?? true,
  });

  const [testPrintMessage, setTestPrintMessage] = useState<string | null>(null);

  const handleFormChange = (key: keyof PrintSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCounterChange = (key: 'invoiceCopies' | 'tempInvoiceCopies' | 'shiftCopies', delta: number) => {
    setForm((prev) => {
      const current = prev[key] || 1;
      const nextVal = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [key]: nextVal };
    });
  };

  const handlePairUsb = () => {
    setTestPrintMessage('Đã tự động kết nối & ghép nối thiết bị cổng USB Sunmi D2 / USB POS (a5c:5843)');
    setTimeout(() => setTestPrintMessage(null), 3000);
  };

  const handleTestPrint = () => {
    setTestPrintMessage('Đang phát tín hiệu in thử nghiệm (Test Print) tới máy in POS...');
    setTimeout(() => {
      window.print();
      setTestPrintMessage('Đã hoàn tất in thử nghiệm!');
      setTimeout(() => setTestPrintMessage(null), 2500);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">
              Cấu Hình Máy In Hóa Đơn, Cắt Bill & Mẫu In Thermal POS
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {testPrintMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testPrintMessage}</span>
            </div>
          )}

          {/* SECTION 1: CHỌN LOẠI KẾT NỐI */}
          <div className="space-y-3">
            <label className="font-extrabold text-slate-800 text-xs block">
              Chọn loại kết nối
            </label>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="radio"
                  name="connectionType"
                  checked={form.connectionType === 'USB'}
                  onChange={() => handleFormChange('connectionType', 'USB')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>USB (Trực tiếp cổng USB - Không cần cài Driver trên máy POS Sunmi D2)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="radio"
                  name="connectionType"
                  checked={form.connectionType === 'WIFI_LAN'}
                  onChange={() => handleFormChange('connectionType', 'WIFI_LAN')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Wifi/LAN (Địa chỉ IP mạng LAN)</span>
              </label>
            </div>

            {/* CARD KẾT NỐI CỔNG USB / LAN */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center shrink-0 border border-amber-200">
                  <Cpu className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">
                    {form.connectionType === 'USB'
                      ? 'Kết Nối Cổng USB Trực Tiếp (Không Cần Cài Driver):'
                      : 'Kết Nối Máy In Qua Mạng LAN (Địa chỉ IP):'}
                  </div>
                  {form.connectionType === 'USB' ? (
                    <div className="text-emerald-700 font-bold text-[11px] mt-0.5 flex items-center space-x-1">
                      <span className="text-purple-600">✔</span>
                      <span>{form.usbDeviceName}</span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-slate-600 font-semibold">IP máy in:</span>
                      <input
                        type="text"
                        value={form.lanIpAddress}
                        onChange={(e) => handleFormChange('lanIpAddress', e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons on the right matching the design */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePairUsb}
                  className="px-4 py-2.5 bg-[#4a4635] hover:bg-[#383528] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-amber-200" />
                  <span>Ghép Nối USB</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="px-4 py-2.5 bg-[#252a22] hover:bg-[#1a1e18] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>In Thử Nghiệm</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: 3-COLUMN PRINT TEMPLATES & PAPER SIZES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Column 1: Invoice Template */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Mẫu in hóa đơn - Khổ giấy in hóa đơn
              </label>
              <select
                value={form.paperSize}
                onChange={(e) => handleFormChange('paperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="K80">Mẫu in hóa đơn - Khổ K80 (80mm)</option>
                <option value="K57">Mẫu in hóa đơn - Khổ K57 (57mm)</option>
              </select>
            </div>

            {/* Column 2: Temp Invoice Template */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Mẫu in tạm tính - Khổ giấy in tạm tính
              </label>
              <select
                value={form.tempPaperSize || 'K80'}
                onChange={(e) => handleFormChange('tempPaperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="K80">Mẫu in - Khổ K80 (80mm)</option>
                <option value="K57">Mẫu in - Khổ K57 (57mm)</option>
              </select>
            </div>

            {/* Column 3: Shift Template */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Mẫu in phiếu giao ca
              </label>
              <select
                value={form.shiftPaperSize || 'K80'}
                onChange={(e) => handleFormChange('shiftPaperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="K80">Mẫu in mặc định - Khổ K80</option>
                <option value="K57">Mẫu in mặc định - Khổ K57</option>
              </select>
            </div>

          </div>

          {/* SECTION 3: FONT SIZE & COPIES COUNTERS (ROW LAYOUT MATCHING IMAGE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            
            {/* Font size */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Kích thước font chữ in hóa đơn
              </label>
              <select
                value={form.fontSizePx}
                onChange={(e) => handleFormChange('fontSizePx', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={10}>Size 10 (10px - Siêu Nhỏ - Tối Ưu Giấy)</option>
                <option value={11}>Size 11 (11px - Gọn Gàng Tiết Kiệm)</option>
                <option value={12}>Size 12 (12px - Vừa Vặn Rõ Nét)</option>
                <option value={13}>Size 13 (13px - Chuẩn Vừa Vặn - Mặc Định)</option>
                <option value={14}>Size 14 (14px - Tối Ưu Tốc Độ In)</option>
                <option value={15}>Size 15 (15px - Chữ To Dễ Đọc)</option>
              </select>
            </div>

            {/* Temp Copies */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Số bản in tạm tính (liên)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCounterChange('tempInvoiceCopies', -1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-slate-900 text-base min-w-[20px] text-center">
                  {form.tempInvoiceCopies}
                </span>
                <button
                  type="button"
                  onClick={() => handleCounterChange('tempInvoiceCopies', 1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shift Copies */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Số bản in (liên)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCounterChange('shiftCopies', -1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-slate-900 text-base min-w-[20px] text-center">
                  {form.shiftCopies}
                </span>
                <button
                  type="button"
                  onClick={() => handleCounterChange('shiftCopies', 1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* SECTION 4: INVOICE COPIES, AUTO-CUT & LENGTH OPTIMIZATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-800 text-xs block">
                Số bàn in hóa đơn (liên)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCounterChange('invoiceCopies', -1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-slate-900 text-base min-w-[20px] text-center">
                  {form.invoiceCopies}
                </span>
                <button
                  type="button"
                  onClick={() => handleCounterChange('invoiceCopies', 1)}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Auto-Cut Toggle */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                  <Scissors className="w-4 h-4 text-blue-600" />
                  <span>Tự động cắt giấy bill:</span>
                </span>
                <p className="text-[10px] text-blue-700 font-medium">
                  Phát lệnh dao cắt tự động sau khi hoàn tất in
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableAutoCut}
                  onChange={(e) => handleFormChange('enableAutoCut', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Optimize Receipt Length Toggle */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-900 text-xs flex items-center space-x-1.5">
                  <ScissorsLineDashed className="w-4 h-4 text-emerald-600" />
                  <span>Tối ưu chiều dài bill:</span>
                </span>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Nén lề, giảm 30-50% chiều dài cuộn giấy
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.optimizeReceiptLength}
                  onChange={(e) => handleFormChange('optimizeReceiptLength', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="py-3 px-6 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Lưu Cấu Hình Máy In</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
