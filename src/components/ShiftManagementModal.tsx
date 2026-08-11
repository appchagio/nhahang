import React, { useState, useEffect } from 'react';
import { ShiftRecord, Order } from '../types';
import { POSShiftEngine } from '../services/shiftEngine';
import {
  Banknote,
  X,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Calculator,
  Save,
  Printer
} from 'lucide-react';

interface ShiftManagementModalProps {
  onClose: () => void;
  orders: Order[];
}

export const ShiftManagementModal: React.FC<ShiftManagementModalProps> = ({
  onClose,
  orders,
}) => {
  const [activeShift, setActiveShift] = useState<ShiftRecord | null>(() => POSShiftEngine.getActiveShift());
  const [shiftHistory, setShiftHistory] = useState<ShiftRecord[]>(() => POSShiftEngine.getShiftHistory());
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');

  // Form for Opening Shift
  const [cashierName, setCashierName] = useState<string>('Thu Ngân 01');
  const [initialCashInput, setInitialCashInput] = useState<string>('500000');

  // Form for Closing Shift
  const [actualCashDrawerInput, setActualCashDrawerInput] = useState<string>('');
  const [shiftNote, setShiftNote] = useState<string>('');
  const [closedNotice, setClosedNotice] = useState<ShiftRecord | null>(null);

  // Compute live expected cash for active shift
  const shiftStartTime = activeShift ? new Date(activeShift.startTime).getTime() : Date.now();
  const shiftPaidOrders = orders.filter(
    (o) => o.status === 'PAID' && o.paidAt && new Date(o.paidAt).getTime() >= shiftStartTime
  );

  const shiftCashRevenue = shiftPaidOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const shiftTotalRevenue = shiftPaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const expectedTotalCashDrawer = (activeShift?.initialCash || 0) + shiftCashRevenue;
  const actualCashDrawerNum = Number(actualCashDrawerInput) || 0;
  const liveDifference = actualCashDrawerInput ? actualCashDrawerNum - expectedTotalCashDrawer : 0;

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift = POSShiftEngine.openShift(cashierName, Number(initialCashInput) || 0);
    setActiveShift(newShift);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const result = POSShiftEngine.closeShift(actualCashDrawerNum, orders, shiftNote);
    setClosedNotice(result);
    setActiveShift(null);
    setShiftHistory(POSShiftEngine.getShiftHistory());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Banknote className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Quản Lý Giao Ca & Kiểm Két Tiền Mặt
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  CHẢ GIÒ QUẢNG NGÃI
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Kiểm soát két tiền mặt, đối soát doanh thu và chốt ca thu ngân
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('CURRENT')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-b-2 ${
              activeTab === 'CURRENT'
                ? 'bg-white border-slate-900 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Ca Hiện Tại & Bàn Giao</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-b-2 ${
              activeTab === 'HISTORY'
                ? 'bg-white border-slate-900 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch Sử Các Ca Đã Chốt ({shiftHistory.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {closedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
              <p className="font-bold text-sm text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Đã chốt ca làm việc thành công!</span>
              </p>
              <p className="text-emerald-800">
                Thu ngân: <strong>{closedNotice.cashierName}</strong> • Doanh thu ca:{' '}
                <strong>{closedNotice.totalShiftRevenue.toLocaleString('vi-VN')} đ</strong> • Chênh lệch két:{' '}
                <strong className={closedNotice.difference < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {closedNotice.difference.toLocaleString('vi-VN')} đ
                </strong>
              </p>
            </div>
          )}

          {activeTab === 'CURRENT' && (
            <div>
              {!activeShift ? (
                /* OPEN SHIFT FORM */
                <form onSubmit={handleOpenShift} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                    <Unlock className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">Khai Báo Mở Ca Làm Việc Mới</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Tên Thu Ngân Trực Ca:</label>
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Tiền Quỹ Tiền Mặt Đầu Ca (Tiền Thối):</label>
                    <input
                      type="number"
                      value={initialCashInput}
                      onChange={(e) => setInitialCashInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-emerald-600 text-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Mở Ca Thu Ngân Ngay</span>
                  </button>
                </form>
              ) : (
                /* CLOSE SHIFT FORM & LIVE METRICS */
                <form onSubmit={handleCloseShift} className="space-y-4">
                  {/* Shift status banner */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm">{activeShift.cashierName}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        CA ĐANG MỞ
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Giờ mở ca:</span>
                        <span className="font-bold">{new Date(activeShift.startTime).toLocaleTimeString('vi-VN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Quỹ đầu ca:</span>
                        <span className="font-bold text-emerald-400">{activeShift.initialCash.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Số đơn ca này:</span>
                        <span className="font-bold text-blue-400">{shiftPaidOrders.length} đơn</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Doanh thu ca:</span>
                        <span className="font-bold text-amber-400">{shiftTotalRevenue.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash breakdown */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Đối Soát Két Tiền Mặt
                    </h4>

                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[10px] block">Doanh thu Tiền mặt trong ca:</span>
                        <span className="text-emerald-700 font-bold text-sm">+{shiftCashRevenue.toLocaleString('vi-VN')} đ</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-500 text-[10px] block">Tiền két lý thuyết:</span>
                        <span className="text-slate-900 font-bold text-sm">{expectedTotalCashDrawer.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="font-bold text-slate-800 block">
                        Số Tiền Đếm Thực Tế Trong Két Cuối Ca (VNĐ):
                      </label>
                      <input
                        type="number"
                        placeholder="Nhập số tiền mặt thu ngân đếm được..."
                        value={actualCashDrawerInput}
                        onChange={(e) => setActualCashDrawerInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono font-black text-base focus:ring-2 focus:ring-slate-900 outline-none"
                        required
                      />
                    </div>

                    {actualCashDrawerInput && (
                      <div
                        className={`p-3 rounded-xl border font-bold flex items-center justify-between font-mono ${
                          liveDifference === 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : liveDifference < 0
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <span>Chênh lệch (Thực tế - Lý thuyết):</span>
                        <span className="text-sm">
                          {liveDifference > 0 ? '+' : ''}
                          {liveDifference.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">Ghi chú giao ca:</label>
                      <input
                        type="text"
                        placeholder="Ghi chú lý do thừa/thiếu tiền (nếu có)..."
                        value={shiftNote}
                        onChange={(e) => setShiftNote(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Chốt Ca & Bàn Giao Két Tiền Mặt</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shiftHistory.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                    <span className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span>{s.cashierName}</span>
                    </span>
                    <span className="text-emerald-700 text-sm">
                      {s.totalShiftRevenue.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>Mở ca: {new Date(s.startTime).toLocaleString('vi-VN')}</div>
                    <div>Chốt ca: {s.endTime ? new Date(s.endTime).toLocaleString('vi-VN') : 'N/A'}</div>
                    <div>Số đơn: {s.totalOrdersInShift} đơn</div>
                    <div>
                      Chênh lệch két:{' '}
                      <strong className={s.difference < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {s.difference.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </div>
              ))}

              {shiftHistory.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có ca làm việc nào được chốt trong lịch sử.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-500 font-mono text-[11px]">
          <div>CHẢ GIÒ QUẢNG NGÃI • Shift Closure Engine</div>
          <button onClick={onClose} className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
