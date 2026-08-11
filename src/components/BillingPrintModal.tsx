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
  Building2
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
  const [paperFormat, setPaperFormat] = useState<'K80' | 'K57'>(printSettings.paperSize);

  // Generate VietQR URL dynamically based on bank account, amount, and order code
  const vietQrUrl = `https://img.vietqr.io/image/${printSettings.bankAccount.bankName}-${printSettings.bankAccount.accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`TT ${order.code}`)}&accountName=${encodeURIComponent(printSettings.bankAccount.accountName)}`;

  // Handle Async Payment & Instant Thermal Print Dispatch
  const handleExecutePayment = () => {
    setIsProcessing(true);

    // Simulate async parallel non-blocking execution (0.2s)
    setTimeout(() => {
      onConfirmPayment(order.id, paymentMethod);
      onMarkPrinted(order.id, 'INVOICE');
      setIsProcessing(false);
      setIsSuccess(true);
    }, 250);
  };

  const handlePrintTrigger = () => {
    onMarkPrinted(order.id, mode === 'KITCHEN_TICKET' ? 'KITCHEN' : 'INVOICE');
    window.print();
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
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs">Chuyển khoản QR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'CASH'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="text-xs">Tiền mặt</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Thẻ POS</span>
                  </button>
                </div>
              </div>

              {/* Dynamic VietQR Display */}
              {paymentMethod === 'VIETQR' && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-4">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Payment"
                    className="w-28 h-28 object-contain bg-white p-1 rounded-lg border border-slate-200"
                  />
                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-slate-900 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{printSettings.bankAccount.bankName}</span>
                    </p>
                    <p className="font-mono text-blue-600 font-bold">
                      STK: {printSettings.bankAccount.accountNo}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Chủ TK: {printSettings.bankAccount.accountName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Nội dung: TT {order.code}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Payment Action Button */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                disabled={isProcessing}
                onClick={handleExecutePayment}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận Thanh toán & In Hóa đơn (Async)'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center text-center bg-white border-r border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Thanh toán thành công!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hóa đơn {order.code} đã được thanh toán và lưu vào doanh thu vĩnh viễn.
            </p>

            <button
              onClick={onClose}
              className="mt-6 py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition"
            >
              Đóng cửa sổ
            </button>
          </div>
        )}

        {/* RIGHT COLUMN: Realistic Thermal Receipt Paper Preview (K80/K57) */}
        <div className="flex-1 p-6 bg-slate-100 flex flex-col justify-between overflow-y-auto">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Printer className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase">
                {mode === 'KITCHEN_TICKET' ? 'Xem trước Phiếu Bếp' : 'Xem trước Hóa đơn In Khổ'}
              </span>
            </div>

            {/* Paper Size selector */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                onClick={() => setPaperFormat('K80')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  paperFormat === 'K80'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                K80 (80mm)
              </button>
              <button
                onClick={() => setPaperFormat('K57')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  paperFormat === 'K57'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                K57 (57mm)
              </button>
            </div>
          </div>

              {/* Thermal Receipt Paper Card */}
              <div className="my-2 flex-1 overflow-y-auto flex justify-center">
                <div
                  id="printable-receipt"
                  className={`bg-white text-black font-mono shadow-xl rounded-sm transition-all border border-slate-200 ${
                    paperFormat === 'K80' ? 'w-[320px]' : 'w-[240px]'
                  } ${
                    printSettings.optimizeReceiptLength
                      ? 'p-2.5 leading-tight space-y-1'
                      : 'p-4 leading-relaxed space-y-2'
                  }`}
                  style={{
                    fontSize: `${printSettings.fontSizePx || 13}px`,
                    minHeight: printSettings.optimizeReceiptLength ? '260px' : '360px',
                  }}
                >
                  
                  {/* Header */}
                  <div className={`text-center border-b border-dashed border-gray-400 ${
                    printSettings.optimizeReceiptLength ? 'pb-1 space-y-0' : 'pb-2 space-y-0.5'
                  }`}>
                    <h4 className="font-bold text-sm tracking-tight">{printSettings.restaurantName}</h4>
                    <p className="text-[10px] text-gray-700">{printSettings.address}</p>
                    <p className="text-[10px] text-gray-700">SĐT: {printSettings.phone}</p>
                  </div>

                  {/* Invoice Title & Compact Header */}
                  <div className={`text-center ${printSettings.optimizeReceiptLength ? 'my-1 space-y-0' : 'my-2 space-y-0.5'}`}>
                    <h3 className="font-extrabold text-sm uppercase">
                      {mode === 'KITCHEN_TICKET' ? 'PHIẾU IN BẾP / BAR' : 'HÓA ĐƠN THANH TOÁN'}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-800">
                      Bàn: {order.tableName} • Mã HD: {order.code}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {new Date().toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Items List Table */}
                  <div className={`border-t border-b border-dashed border-gray-400 text-[11px] ${
                    printSettings.optimizeReceiptLength ? 'py-1 my-1 space-y-0.5' : 'py-2 my-2 space-y-1'
                  }`}>
                    <div className="flex justify-between font-bold border-b border-gray-300 pb-0.5">
                      <span>Món</span>
                      <span>SL x Giá</span>
                    </div>

                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-0">
                        <div className="flex justify-between font-bold">
                          <span className="line-clamp-1">{item.name}</span>
                          <span>{item.quantity} x {item.unitPrice.toLocaleString('vi-VN')}</span>
                        </div>

                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                          <div className="pl-2 text-[10px] text-gray-600">
                            {item.selectedToppings.map((st, i) => (
                              <p key={i}>+ {st.topping?.name || 'Topping'}</p>
                            ))}
                          </div>
                        )}

                        {item.note && (
                          <p className="pl-2 text-[10px] text-gray-600 italic">Ghi chú: {item.note}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Summary calculations */}
                  {mode !== 'KITCHEN_TICKET' && (
                    <div className={`text-[11px] ${printSettings.optimizeReceiptLength ? 'space-y-0.5 pt-0.5' : 'space-y-1 pt-1'}`}>
                      <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{order.subtotal.toLocaleString('vi-VN')} đ</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Giảm giá ({order.discountPercent}%):</span>
                          <span>-{order.discountAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      )}
                      {printSettings.showVat && (
                        <div className="flex justify-between">
                          <span>Thuế VAT ({order.taxPercent}%):</span>
                          <span>{order.taxAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      )}

                      <div className={`flex justify-between font-bold text-sm border-t border-black ${
                        printSettings.optimizeReceiptLength ? 'pt-1 mt-1' : 'pt-2 mt-2'
                      }`}>
                        <span>TỔNG CỘNG:</span>
                        <span>{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className={`text-center border-t border-dashed border-gray-400 text-[10px] text-gray-700 ${
                    printSettings.optimizeReceiptLength ? 'mt-1 pt-1 space-y-0' : 'mt-4 pt-2 space-y-1'
                  }`}>
                    <p>{printSettings.footerNote}</p>
                    <p className="font-bold">Cảm ơn & Hẹn gặp lại quý khách!</p>
                  </div>

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
              <span>In Ngay (Thật/Mô phỏng)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
