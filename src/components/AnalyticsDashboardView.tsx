// AnalyticsDashboardView Component
import React, { useState } from 'react';
import { PermanentRevenueAggregate, Order, MenuItem, PrintSettings } from '../types';
import { DocxExportService } from '../services/docxExportService';
import { POSStorageEngine } from '../services/storageEngine';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  Award,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  revenueRecords: PermanentRevenueAggregate[];
  orders: Order[];
  menu: MenuItem[];
  printSettings: PrintSettings;
  onUpdateRevenueRecords?: (records: PermanentRevenueAggregate[]) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  revenueRecords,
  orders,
  menu,
  printSettings,
  onUpdateRevenueRecords,
}) => {
  const [recordsState, setRecordsState] = useState<PermanentRevenueAggregate[]>(revenueRecords);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const activeRecords = recordsState;

  const totalRevenue = activeRecords.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalOrders = activeRecords.reduce((acc, r) => acc + r.totalOrders, 0);
  const totalCash = activeRecords.reduce((acc, r) => acc + r.cashRevenue, 0);
  const totalQr = activeRecords.reduce((acc, r) => acc + r.qrRevenue, 0);
  const totalCard = activeRecords.reduce((acc, r) => acc + r.cardRevenue, 0);

  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Compute item sales counts across orders
  const itemSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      const existing = itemSalesMap.get(item.name) || { name: item.name, qty: 0, revenue: 0 };
      itemSalesMap.set(item.name, {
        name: item.name,
        qty: existing.qty + item.quantity,
        revenue: existing.revenue + item.totalPrice,
      });
    });
  });

  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxQty = topSellingItems.length > 0 ? topSellingItems[0].qty : 1;
  const maxDailyRevenue = Math.max(...activeRecords.map((r) => r.totalRevenue), 1);

  // Export handlers
  const handleExportRevenueDocx = () => {
    DocxExportService.exportRevenueReportDocx(activeRecords, printSettings);
  };

  const handleExportMenuDocx = () => {
    DocxExportService.exportMenuCatalogDocx(menu, printSettings);
  };

  // Delete handlers
  const handleDeleteMonthRevenue = () => {
    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu doanh thu Tháng ${selectedMonth}?\n\nHành động này sẽ xóa vĩnh viễn khỏi hệ thống và KHÔNG THỂ KHÔI PHỤC!`
    );

    if (confirmed) {
      const updated = POSStorageEngine.deleteRevenueByMonth(selectedMonth);
      setRecordsState(updated);
      if (onUpdateRevenueRecords) onUpdateRevenueRecords(updated);

      setDeleteMessage(`Đã xóa sạch toàn bộ dữ liệu doanh thu Tháng ${selectedMonth} thành công.`);
      setTimeout(() => setDeleteMessage(null), 4000);
    }
  };

  const handleDeleteYearRevenue = () => {
    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu doanh thu Năm ${selectedYear}?\n\nHành động này sẽ xóa vĩnh viễn khỏi hệ thống và KHÔNG THỂ KHÔI PHỤC!`
    );

    if (confirmed) {
      const updated = POSStorageEngine.deleteRevenueByYear(selectedYear);
      setRecordsState(updated);
      if (onUpdateRevenueRecords) onUpdateRevenueRecords(updated);

      setDeleteMessage(`Đã xóa sạch toàn bộ dữ liệu doanh thu Năm ${selectedYear} thành công.`);
      setTimeout(() => setDeleteMessage(null), 4000);
    }
  };

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Delete Success Alert */}
        {deleteMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs flex items-center justify-between shadow-sm animate-in fade-in">
            <span>{deleteMessage}</span>
            <button onClick={() => setDeleteMessage(null)} className="text-emerald-600 font-extrabold hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Visual Analytics & Báo Cáo Doanh Thu
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold">
                Trực quan hóa dữ liệu real-time
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2 flex items-center space-x-2">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              <span>Thống Kê Doanh Thu & Xu Hướng Bán Hàng</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Phân tích doanh thu tổng hợp, tỷ trọng thanh toán VietQR / Tiền mặt / Thẻ và món bán chạy nhất của thương hiệu <strong>CHẢ GIÒ QUẢNG NGÃI</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportRevenueDocx}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Xuất Báo Cáo (.docx)</span>
            </button>

            <button
              onClick={handleExportMenuDocx}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Xuất Thực Đơn (.docx)</span>
            </button>
          </div>
        </div>

        {/* SECTION: VÙNG QUẢN LÝ NGUY HIỂM - XÓA DOANH THU THEO THÁNG / NĂM (MATCHING UPLOADED IMAGE) */}
        <div className="bg-[#fff1f2] border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
          
          <div className="space-y-1">
            <h3 className="font-black text-sm md:text-base text-[#9f0e31] flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#be123c] shrink-0" />
              <span>VÙNG QUẢN LÝ NGUY HIỂM: XÓA DOANH THU THEO THÁNG HOẶC THEO NĂM</span>
            </h3>
            <p className="text-xs text-[#be123c] font-medium pl-7">
              Chỉ dùng khi chủ quán muốn reset hoặc xóa sạch dữ liệu doanh thu của một Tháng hoặc một Năm cụ thể.
            </p>
          </div>

          {/* Grid Boxes Matching Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            
            {/* Box 1: Delete Month Revenue */}
            <div className="bg-white border border-rose-200 rounded-full px-4 py-2 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-xs text-[#881337]">
                <span>Tháng:</span>
                <span className="font-extrabold text-slate-900 font-mono">August 2026</span>
                <Calendar className="w-4 h-4 text-slate-600 ml-1" />
              </div>

              <button
                onClick={handleDeleteMonthRevenue}
                className="px-4 py-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-extrabold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-200" />
                <span>Xóa Doanh Thu Tháng 2026-08</span>
              </button>
            </div>

            {/* Box 2: Delete Year Revenue */}
            <div className="bg-white border border-rose-200 rounded-full px-4 py-2 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-xs text-[#881337]">
                <span>Năm:</span>
                <span className="font-extrabold text-slate-900 font-mono">2026</span>
              </div>

              <button
                onClick={handleDeleteYearRevenue}
                className="px-4 py-2 bg-[#881337] hover:bg-[#70102e] text-white font-extrabold text-xs rounded-full shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-200" />
                <span>Xóa Doanh Thu Năm 2026</span>
              </button>
            </div>

          </div>

        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tổng Doanh Thu</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Tích lũy từ tất cả đơn hàng</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tổng Đơn Hàng</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalOrders.toLocaleString('vi-VN')} đơn
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Đã thanh toán thành công</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Giá Trị Trung Bình/Đơn</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {averageOrderValue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-[11px] text-slate-500 font-medium">AOV (Average Order Value)</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tỷ Lệ VietQR</span>
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600 font-mono">
              {totalRevenue > 0 ? Math.round((totalQr / totalRevenue) * 100) : 0}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Chuyển khoản QR ngân hàng</p>
          </div>

        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Biểu Đồ Doanh Thu Theo Ngày</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi biến động doanh thu theo mốc thời gian</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                {activeRecords.length} ngày lưu trữ
              </span>
            </div>

            {/* D3 style bar rendering */}
            <div className="h-64 flex items-end gap-3 pt-6 border-b border-slate-200 pb-2 overflow-x-auto">
              {activeRecords.map((rec, idx) => {
                const heightPercent = Math.round((rec.totalRevenue / maxDailyRevenue) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[40px] group">
                    <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono bg-slate-800 text-white px-1.5 py-0.5 rounded shadow">
                      {(rec.totalRevenue / 1000).toFixed(0)}k
                    </div>
                    <div
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t-lg transition duration-200 relative"
                    />
                    <span className="text-[10px] font-mono text-slate-500 truncate w-full text-center">
                      {rec.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Đơn vị: VNĐ</span>
              <span className="font-medium text-indigo-600 font-mono">Tự động cập nhật từ Database</span>
            </div>
          </div>

          {/* Payment Breakdown Pie */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <span>Cơ Cấu Phương Thức Thanh Toán</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tỷ trọng các hình thức thanh toán</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-blue-600">
                    <QrCode className="w-4 h-4" />
                    <span>VietQR Chuyển khoản</span>
                  </span>
                  <span className="font-mono">{totalQr.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalRevenue ? Math.round((totalQr / totalRevenue) * 100) : 0}%` }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-emerald-600">
                    <Banknote className="w-4 h-4" />
                    <span>Tiền mặt (Cash)</span>
                  </span>
                  <span className="font-mono">{totalCash.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalRevenue ? Math.round((totalCash / totalRevenue) * 100) : 0}%` }}
                    className="bg-emerald-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-purple-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Thẻ POS (Card)</span>
                  </span>
                  <span className="font-mono">{totalCard.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalRevenue ? Math.round((totalCard / totalRevenue) * 100) : 0}%` }}
                    className="bg-purple-600 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Top Sellers Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Top 5 Món Bán Chạy Nhất</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dựa trên tổng số lượng suất bán ra</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              RANKING
            </span>
          </div>

          <div className="space-y-3">
            {topSellingItems.map((item, idx) => {
              const percent = Math.round((item.qty / maxQty) * 100);
              return (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-mono text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-800">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-slate-600">{item.qty} phần</span>
                      <span className="text-indigo-600 font-bold">{item.revenue.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}

            {topSellingItems.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có dữ liệu đơn hàng trong ngày.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
