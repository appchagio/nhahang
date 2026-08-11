import React, { useState } from 'react';
import { PrintSettings } from '../types';
import { Settings, Printer, Save, X, Building2, QrCode } from 'lucide-react';

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
  const [form, setForm] = useState<PrintSettings>(settings);

  const handleFormChange = (key: keyof PrintSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBankChange = (key: keyof PrintSettings['bankAccount'], value: string) => {
    setForm((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <span>Cấu hình Mẫu In Hóa đơn K80/K57</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Restaurant info */}
          <div className="space-y-3">
            <h4 className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">
              Thông tin Thương hiệu
            </h4>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Tên Nhà Hàng / Quán:</label>
              <input
                type="text"
                value={form.restaurantName}
                onChange={(e) => handleFormChange('restaurantName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Địa chỉ:</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Số điện thoại liên hệ:</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Paper format & preferences */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">
              Tùy chọn Khổ Giấy In
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFormChange('paperSize', 'K80')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  form.paperSize === 'K80'
                    ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Khổ Giấy K80 (80mm)
              </button>

              <button
                type="button"
                onClick={() => handleFormChange('paperSize', 'K57')}
                className={`p-3 rounded-xl border font-bold text-center transition ${
                  form.paperSize === 'K57'
                    ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Khổ Giấy K57 (57mm)
              </button>
            </div>
          </div>

          {/* VietQR Bank Details */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-blue-600 uppercase tracking-wider text-[11px] flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Cấu hình Chuyển khoản VietQR</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Ngân hàng:</label>
                <input
                  type="text"
                  value={form.bankAccount.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold block">Số tài khoản:</label>
                <input
                  type="text"
                  value={form.bankAccount.accountNo}
                  onChange={(e) => handleBankChange('accountNo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-blue-600 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold block">Tên chủ tài khoản:</label>
              <input
                type="text"
                value={form.bankAccount.accountName}
                onChange={(e) => handleBankChange('accountName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 uppercase font-mono"
              />
            </div>
          </div>

          {/* Footer note */}
          <div className="space-y-1 pt-2">
            <label className="text-slate-500 font-semibold block">Lời cảm ơn chân trang:</label>
            <input
              type="text"
              value={form.footerNote}
              onChange={(e) => handleFormChange('footerNote', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu hình Mẫu In</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
