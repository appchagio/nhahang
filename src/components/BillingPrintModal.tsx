// BillingPrintModal Component
import React, { useState } from 'react';
import { Order, PaymentMethod, PrintSettings } from '../types';
import {
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  X,
  Copy,
  Receipt,
  Download,
  Zap,
  Building2,
  Minus,
  Plus,
  Scissors
} from 'lucide-react';

interface BillingPrintModalProps {
  order: Order;
  printSettings: PrintSettings;
  mode: 'CHECKOUT' | 'KITCHEN_TICKET' | 'INVOICE_PREVIEW';
  onClose: () => void;
  onConfirmPayment: (orderId: string, method: PaymentMethod) => void;
  onMarkPrinted: (orderId: string, type: 'KITCHEN' | 'INVOICE') => void;
}

export const BillingPrintModal: React.FC<BillingPrintModalProps> = ({
  order,
  printSettings,
  mode,
  onClose,
  onConfirmPayment,
  onMarkPrinted,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [paperFormat, setPaperFormat] = useState<'K80' | 'K57'>(printSettings.paperSize || 'K80');
  
  // Live font size & copy controls
  const [fontSizePx, setFontSizePx] = useState<number>(printSettings.fontSizePx || 13);
  const [copiesCount, setCopiesCount] = useState<number>(
    mode === 'KITCHEN_TICKET' ? 1 : (printSettings.invoiceCopies || 2)
  );
  const [isAutoCut, setIsAutoCut] = useState<boolean>(printSettings.enableAutoCut ?? true);
  const [optimizeLength, setOptimizeLength] = useState<boolean>(printSettings.optimizeReceiptLength ?? true);

  // Generate VietQR URL dynamically
  const vietQrUrl = `https://img.vietqr.io/image/${printSettings.bankAccount.bankName}-${printSettings.bankAccount.accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`TT ${order.code}`)}&accountName=${encodeURIComponent(printSettings.bankAccount.accountName)}`;

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayment(order.id, paymentMethod);
      onMarkPrinted(order.id, 'INVOICE');
      setIsProcessing(false);
      setIsSuccess(true);
    }, 250);
  };

  const handlePrintTrigger = () => {
    onMarkPrinted(order.id, mode === 'KITCHEN_TICKET' ? 'KITCHEN' : 'INVOICE');
    
    // Print according to configured copies
    for (let i = 0; i < copiesCount; i++) {
      setTimeout(() => {
        window.print();
      }, i * 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* LEFT COLUMN: Payment Method & Details (If CHECKOUT) */}
        {mode === 'CHECKOUT' && !isSuccess && (
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 bg-white">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Xử lý Thanh toán Hóa đơn</span>
                </h3>
                <span className="font-mono text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                  {order.code}
                </span>
              </div>

              {/* Table & Total Amount */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Bàn phục vụ:</span>
                  <span className="font-bold text-slate-800">{order.tableName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Thời gian tạo:</span>
                  <span className="font-mono text-slate-700">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500">CẦN THANH TOÁN:</span>
                  <span className="font-mono text-2xl font-black text-blue-600">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Phương thức thanh toán:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('VIETQR')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'VIETQR'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[11px] font-bold">VietQR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Tiền mặt</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-purple-50 border-purple-600 text-purple-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Thẻ POS</span>
                  </button>
                </div>
              </div>

              {/* Dynamic VietQR Display */}
              {paymentMethod === 'VIETQR' && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Payment"
                    className="w-24 h-24 object-contain rounded-lg border border-slate-200 bg-white"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">Quét mã VietQR Chuyển khoản</p>
                    <p className="text-slate-500">Ngân hàng: {printSettings.bankAccount.bankName}</p>
                    <p className="text-slate-500 font-mono">STK: {printSettings.bankAccount.accountNo}</p>
                    <p className="text-[10px] text-blue-600 font-bold">Tự động điền số tiền & nội dung</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold"
              >
                Hủy
              </button>

              <button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
              >
                {isProcessing ? (
                  <span>Đang ghi nhận...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận Đã Thanh Toán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Screen (If checkout complete) */}
        {mode === 'CHECKOUT' && isSuccess && (
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-200 bg-emerald-50/50">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Bàn <strong>{order.tableName}</strong> đã được chuyển sang trạng thái Trống.
              </p>
            </div>
            <button
              onClick={onClose}
              className="py-3 px-8 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              Hoàn Tất & Về Màn Hình Chính
            </button>
          </div>
        )}

        {/* RIGHT COLUMN: Thermal Print Receipt Preview & Live Settings Controls */}
        <div className="w-full md:w-1/2 p-6 bg-slate-100 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Bar with Live Settings */}
          <div className="space-y-3 pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {mode === 'KITCHEN_TICKET' ? 'Xem trước Phiếu Bếp' : 'Xem trước Hóa đơn In'}
                </span>
              </div>

              {/* Paper Format Switcher */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setPaperFormat('K80')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    paperFormat === 'K80' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  K80 (80mm)
                </button>
                <button
                  onClick={() => setPaperFormat('K57')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    paperFormat === 'K57' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  K57 (57mm)
                </button>
              </div>
            </div>

            {/* Quick Settings Controls Bar (Font size & Copies & Auto-cut) */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {/* Font size */}
              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold">Cỡ chữ:</span>
                <select
                  value={fontSizePx}
                  onChange={(e) => setFontSizePx(Number(e.target.value))}
                  className="bg-transparent font-mono font-bold text-slate-800 focus:outline-none"
                >
                  <option value={10}>10px</option>
                  <option value={11}>11px</option>
                  <option value={12}>12px</option>
                  <option value={13}>13px</option>
                  <option value={14}>14px</option>
                  <option value={15}>15px</option>
                </select>
              </div>

              {/* Copies count counter */}
              <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold">Số liên:</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCopiesCount((c) => Math.max(1, c - 1))}
                    className="p-0.5 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-slate-900">{copiesCount}</span>
                  <button
                    onClick={() => setCopiesCount((c) => Math.min(10, c + 1))}
                    className="p-0.5 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Auto cut toggle */}
              <button
                onClick={() => setIsAutoCut((prev) => !prev)}
                className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition ${
                  isAutoCut
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>Cắt: {isAutoCut ? 'Bật' : 'Tắt'}</span>
              </button>
            </div>
          </div>

          {/* Thermal Receipt Paper Card Container */}
          <div className="my-3 flex-1 overflow-y-auto flex justify-center">
            <div
              id="printable-receipt"
              className={`bg-white text-black font-serif shadow-xl rounded-sm transition-all border border-slate-200 ${
                paperFormat === 'K80' ? 'w-[320px]' : 'w-[240px]'
              } ${optimizeLength ? 'p-2.5 leading-tight space-y-1' : 'p-4 leading-relaxed space-y-2'}`}
              style={{
                fontSize: `${fontSizePx}px`,
                fontFamily: '"Times New Roman", Times, Georgia, serif',
                minHeight: optimizeLength ? '260px' : '360px',
              }}
            >
              
              {/* Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-1 mb-1">
                <h4 className="font-extrabold text-xs uppercase tracking-tight">{printSettings.restaurantName || 'CHẢ GIÒ BẮP QUẢNG NGÃI'}</h4>
                <p className="text-[10px] text-gray-800">{printSettings.address || '87, Hùng Vương, Phường Bà Rịa, TP. Hồ Chí Minh'}</p>
                <p className="text-[10px] text-gray-800 font-bold">SDT: {printSettings.phone || '0972371722'}</p>
                {printSettings.wifiName && (
                  <p className="text-[10px] text-gray-800 font-medium">Wifi: {printSettings.wifiName} - MK: {printSettings.wifiPassword || '0914683351'}</p>
                )}
              </div>

              {/* Invoice Title */}
              <div className="text-center my-1.5 space-y-0.5">
                <h3 className="font-black text-[1.5em] uppercase tracking-tight">
                  {mode === 'KITCHEN_TICKET' ? 'PHIẾU IN BẾP / BAR' : 'HÓA ĐƠN THANH TOÁN'}
                </h3>
                <p className="text-[11px] font-serif text-gray-800 font-bold">Mã HD: {order.code}</p>
                <p className="text-[10px] font-serif text-gray-600 font-bold">
                  Ngày: {new Date(order.createdAt).toLocaleTimeString('vi-VN')} {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Items List Table (HTML Grid Table matching user's drawing 100%) */}
              <table className="w-full border-collapse border-2 border-black text-black font-sans my-2 select-none text-[11px]">
                <thead>
                  <tr className="border-b-2 border-black font-normal">
                    <th className="border-r-2 border-black p-1 w-[45%] text-center font-normal">Ten mon</th>
                    <th className="border-r-2 border-black p-1 w-[15%] text-center font-normal">SL</th>
                    <th className="p-1 w-[40%] text-center font-normal">T.Tien</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx} className="border-b-2 border-black text-[1.55em] font-black uppercase">
                      <td className="border-r-2 border-black p-1 text-left font-black leading-tight tracking-tight uppercase">
                        {removeVietnameseAccents(item?.name || 'MON').toUpperCase()}
                      </td>
                      <td className="border-r-2 border-black p-1 text-center font-black">
                        {item?.quantity || 1}
                      </td>
                      <td className="p-1 text-right font-black">
                        {(item?.totalPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                  <tr className="text-[1.55em]">
                    <td className="border-r-2 border-black p-1"></td>
                    <td className="border-r-2 border-black p-1 text-right font-normal text-[0.8em] align-middle">Tổng</td>
                    <td className="p-1 text-right font-black text-[1.1em]">{(order.totalAmount || 0).toLocaleString('vi-VN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary calculations */}
              {mode !== 'KITCHEN_TICKET' && (
                <div className="text-right pt-1 font-extrabold text-sm border-t border-black mt-1">
                  <span>Tổng cộng: {order.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-3 pt-1 border-t border-dashed border-gray-400 font-bold text-[10px] uppercase tracking-tight text-gray-800">
                <p>{printSettings.footerNote || 'CAM ON VA HEN GAP LAI QUY KHACH!'}</p>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium"
            >
              Thoát
            </button>

            <button
              onClick={handlePrintTrigger}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 shadow-md"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>In {copiesCount} Liên ({fontSizePx}px - {paperFormat})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
