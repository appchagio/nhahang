// InvoicesLogView Component
import React, { useState } from 'react';
import { Order, PrintSettings } from '../types';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  QrCode,
  FileText
} from 'lucide-react';

interface InvoicesLogViewProps {
  orders: Order[];
  printSettings: PrintSettings;
  onPreviewInvoice: (order: Order) => void;
}

export const InvoicesLogView: React.FC<InvoicesLogViewProps> = ({
  orders,
  printSettings,
  onPreviewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.tableName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return ord.status === statusFilter;
  });

  const totalPaidRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Receipt className="w-6 h-6 text-blue-600" />
              <span>Sổ Hóa đơn & Nhật ký Giao dịch</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tra cứu hóa đơn, in lại chứng từ thanh toán K80/K57, kiểm tra trạng thái bếp
            </p>
          </div>

          <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-right">
            <span className="text-xs text-slate-500 block font-sans font-medium">Tổng Doanh Thu Hóa Đơn:</span>
            <span className="text-xl font-black text-blue-600">
              {totalPaidRevenue.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã HD hoặc tên bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            {['ALL', 'PREPARING', 'SERVED', 'PAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' && 'Tất cả đơn'}
                {st === 'PREPARING' && 'Đang chế biến'}
                {st === 'SERVED' && 'Đã lên món'}
                {st === 'PAID' && 'Đã thanh toán'}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Mã HD</th>
                  <th className="p-4">Bàn</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Chi tiết món</th>
                  <th className="p-4">Thanh toán</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">In / Mẫu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">{ord.code}</td>
                    <td className="p-4 font-bold text-slate-900">{ord.tableName}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                    <td className="p-4 text-xs max-w-xs">
                      <p className="line-clamp-1 text-slate-800 font-medium">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </td>
                    <td className="p-4 text-xs">
                      {ord.paymentMethod ? (
                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-slate-700 font-semibold">
                          {ord.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa TT</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {ord.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : ord.status === 'SERVED'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.status === 'PAID' && 'Đã TT'}
                        {ord.status === 'SERVED' && 'Đã lên món'}
                        {ord.status === 'PREPARING' && 'Đang làm'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onPreviewInvoice(ord)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center space-x-1 ml-auto border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Xem / In Hóa đơn</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
