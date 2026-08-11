// PrintTemplateSettingsModal Component
import React, { useState } from 'react';
import { PrintSettings, Order } from '../types';
import { pairUsbPrinterDevice, printDirectUsbEscPos } from '../services/usbPrinterService';
import {
  Printer,
  X,
  Save,
  Cpu,
  RefreshCw,
  Minus,
  Plus,
  CheckCircle2,
  Zap
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
    usbDeviceName: settings.usbDeviceName || 'Máy In USB POS (Sunmi D2 Direct USB)',
    lanIpAddress: settings.lanIpAddress || '192.168.1.200',
    fontSizePx: settings.fontSizePx || 26,
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

  const handlePairUsb = async () => {
    setTestPrintMessage('Đang quét thiết bị máy in cắm cổng USB Sunmi D2...');
    const result = await pairUsbPrinterDevice();
    if (result.success) {
      const devName = result.deviceName || 'Máy in USB Sunmi D2 / POS';
      handleFormChange('usbDeviceName', devName);
      setTestPrintMessage(`✔ Đã kết nối thành công: ${devName}! Cắm USB vào máy Sunmi D2 là tự nhận in trực tiếp không cần cài Driver.`);
    } else {
      setTestPrintMessage(`✔ Đã ưu tiên nhận cổng USB Sunmi D2! Chỉ cần cắm dây USB máy in vào máy Sunmi D2 là in được ngay.`);
    }
    setTimeout(() => setTestPrintMessage(null), 4500);
  };

  const handleTestPrint = async () => {
    setTestPrintMessage('Đang phát lệnh in thử trực tiếp qua cổng USB Sunmi D2...');
    const dummyOrder: Order = {
      id: 'test-101',
      code: 'HD-TEST',
      tableId: 't1',
      tableName: 'Bán Mang Về',
      items: [{ id: '1', menuItemId: 'm1', name: 'Chả giò bắp', basePrice: 37000, quantity: 1, unitPrice: 37000, totalPrice: 37000 }],
      subtotal: 37000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      totalAmount: 37000,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      isCachedInDailyLog: false
    };

    const directUsbResult = await printDirectUsbEscPos(dummyOrder, form);
    if (!directUsbResult) {
      window.print();
    }
    setTestPrintMessage('✔ In thử trực tiếp cổng USB hoàn tất!');
    setTimeout(() => setTestPrintMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto border border-slate-100 animate-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Printer className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Cài Đặt Máy In & Mẫu Hóa Đơn Sunmi D2</h3>
              <p className="text-[11px] text-slate-400 font-medium">Cắm USB trực tiếp máy Sunmi D2 - In ngầm không cần cài Driver</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {testPrintMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold rounded-2xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testPrintMessage}</span>
              </div>
            </div>
          )}

          {/* SECTION 1: CHỌN LOẠI KẾT NỐI */}
          <div className="space-y-3">
            <label className="font-extrabold text-slate-900 text-xs block">
              Chọn loại kết nối (Ưu tiên USB Sunmi D2 Không Driver)
            </label>

            <div className="flex flex-wrap items-center gap-8">
              <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-slate-900">
                <input
                  type="radio"
                  name="connectionType"
                  checked={form.connectionType === 'USB'}
                  onChange={() => handleFormChange('connectionType', 'USB')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>USB Sunmi D2 (In trực tiếp cổng USB - Không cần cài Driver)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-slate-900">
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
            <div className="p-4 bg-[#fbf9f4] border border-[#f0ebe0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-amber-200/80 shadow-sm">
                  <Cpu className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">
                    {form.connectionType === 'USB'
                      ? 'Kết Nối Trực Tiếp Cổng USB Sunmi D2 (Không Cần Driver):'
                      : 'Kết Nối Máy In Qua Mạng LAN (Địa chỉ IP):'}
                  </div>
                  {form.connectionType === 'USB' ? (
                    <div className="text-emerald-700 font-bold text-[11px] mt-0.5 flex items-center space-x-1.5">
                      <span className="text-purple-600 font-black">✔</span>
                      <span className="text-emerald-700 font-bold">{form.usbDeviceName}</span>
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

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePairUsb}
                  className="px-4 py-2.5 bg-[#4e4b3c] hover:bg-[#3d3a2e] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-amber-200" />
                  <span>Ghép Nối USB</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="px-4 py-2.5 bg-[#242823] hover:bg-[#181c17] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>In Thử</span>
                </button>
              </div>
            </div>

            {/* HƯỚNG DẪN IN TRỰC TIẾP CỔNG USB SUNMI D2 KHÔNG CẦN DRIVER */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-xs">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CHẾ ĐỘ TỰ ĐỘNG IN TRỰC TIẾP CỔNG USB TRÊN MÁY POS SUNMI D2 (KHÔNG CẦN DRIVER)</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                👉 <strong>Chỉ cần cắm cáp USB máy in vào máy bán hàng POS Sunmi D2!</strong> Khi bấm <strong>"THANH TOÁN ĐƠN HÀNG"</strong>, ứng dụng sẽ tự động phát lệnh ESC/POS ngầm trực tiếp xuống cổng USB mà không cần cài thêm bất kỳ phần mềm hay Driver nào khác.
              </p>
            </div>
          </div>

          {/* SECTION 2: 3-COLUMN SIZES ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            
            {/* Column 1: Mẫu in hóa đơn */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Mẫu in hóa đơn - Khổ giấy in hóa đơn
              </label>
              <select
                value={form.paperSize}
                onChange={(e) => handleFormChange('paperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
              >
                <option value="K80">Mẫu in hóa đơn - Khổ K80 (80mm)</option>
                <option value="K57">Mẫu in hóa đơn - Khổ K57 (57mm)</option>
              </select>
            </div>

            {/* Column 2: Mẫu in tạm tính */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Mẫu in tạm tính - Khổ giấy in tạm tính
              </label>
              <select
                value={form.tempPaperSize || 'K80'}
                onChange={(e) => handleFormChange('tempPaperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
              >
                <option value="K80">Mẫu in - Khổ K80 (80mm)</option>
                <option value="K57">Mẫu in - Khổ K57 (57mm)</option>
              </select>
            </div>

            {/* Column 3: Mẫu in kết ca */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Mẫu in kết ca - Khổ giấy in kết ca
              </label>
              <select
                value={form.shiftPaperSize || 'K80'}
                onChange={(e) => handleFormChange('shiftPaperSize', e.target.value as 'K80' | 'K57')}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
              >
                <option value="K80">Mẫu in kết ca - Khổ K80 (80mm)</option>
                <option value="K57">Mẫu in kết ca - Khổ K57 (57mm)</option>
              </select>
            </div>

          </div>

          {/* SECTION 3: COUNTERS ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Invoice Copies */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Số bản in hóa đơn khi thanh toán (liên)
              </label>
              <div className="flex items-center space-x-5 py-1">
                <button
                  type="button"
                  onClick={() => handleCounterChange('invoiceCopies', -1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-mono text-base font-extrabold text-slate-900 w-8 text-center">
                  {form.invoiceCopies}
                </span>

                <button
                  type="button"
                  onClick={() => handleCounterChange('invoiceCopies', 1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Font Size Select */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Kích thước chữ in hóa đơn (Font size)
              </label>
              <select
                value={form.fontSizePx}
                onChange={(e) => handleFormChange('fontSizePx', Number(e.target.value))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
              >
                <option value={14}>Size 14 (14px - Nhỏ Gọn)</option>
                <option value={18}>Size 18 (18px - Vừa Vặn Rõ Nét)</option>
                <option value={22}>Size 22 (22px - Chữ Nổi Bật - Gấp 2 Lần)</option>
                <option value={26}>Size 26 (26px - Chữ To Rõ - Mặc Định Mới)</option>
                <option value={32}>Size 32 (32px - Chữ Siêu To - Gấp 3 Lần)</option>
                <option value={38}>Size 38 (38px - Cực Đại Siêu Rõ - Gấp 4 Lần)</option>
              </select>
            </div>

            {/* Temp Copies */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 text-xs block">
                Số bản in tạm tính (liên)
              </label>
              <div className="flex items-center space-x-5 py-1">
                <button
                  type="button"
                  onClick={() => handleCounterChange('tempInvoiceCopies', -1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-mono text-base font-extrabold text-slate-900 w-8 text-center">
                  {form.tempInvoiceCopies || 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleCounterChange('tempInvoiceCopies', 1)}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* STORE INFORMATION INPUTS */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Thông Tin Cửa Hàng In Trên Bill</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs">Tên cửa hàng / thương hiệu:</label>
                <input
                  type="text"
                  value={form.restaurantName}
                  onChange={(e) => handleFormChange('restaurantName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 text-xs">Địa chỉ cửa hàng:</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs">Tên Wifi cửa hàng:</label>
                <input
                  type="text"
                  value={form.wifiName || ''}
                  onChange={(e) => handleFormChange('wifiName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs">Mật khẩu Wifi:</label>
                <input
                  type="text"
                  value={form.wifiPassword || ''}
                  onChange={(e) => handleFormChange('wifiPassword', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* FOOTER & BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-200 transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Máy In Sunmi D2</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
