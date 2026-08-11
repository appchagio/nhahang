import React, { useState } from 'react';
import { PermanentRevenueAggregate, Order, MenuItem, PrintSettings } from '../types';
import { DocxExportService } from '../services/docxExportService';
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
  Banknote
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  revenueRecords: PermanentRevenueAggregate[];
  orders: Order[];
  menu: MenuItem[];
  printSettings: PrintSettings;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  revenueRecords,
  orders,
  menu,
  printSettings,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'THIS_WEEK'>('ALL');

  const totalRevenue = revenueRecords.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalOrders = revenueRecords.reduce((acc, r) => acc + r.totalOrders, 0);
  const totalCash = revenueRecords.reduce((acc, r) => acc + r.cashRevenue, 0);
  const totalQr = revenueRecords.reduce((acc, r) => acc + r.qrRevenue, 0);
  const totalCard = revenueRecords.reduce((acc, r) => acc + r.cardRevenue, 0);

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

  // Max revenue record for bar height scaling
  const maxDailyRevenue = Math.max(...revenueRecords.map((r) => r.totalRevenue), 1);

  // Export handlers
  const handleExportRevenueDocx = () => {
    DocxExportService.exportRevenueReportDocx(revenueRecords, printSettings);
  };

  const handleExportMenuDocx = () => {
    DocxExportService.exportMenuCatalogDocx(menu, printSettings);
  };

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Visual Analytics & D3 Charts
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
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Báo Cáo Doanh Thu (.docx)</span>
            </button>

            <button
              onClick={handleExportMenuDocx}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Xuất Menu Bảng Giá (.docx)</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tổng Doanh Thu</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-700">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-[11px] text-slate-500">Đã bao gồm tất cả các ca</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tổng Số Đơn Hàng</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-700">
              {totalOrders} đơn
            </div>
            <p className="text-[11px] text-slate-500">Đã thanh toán thành công</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Giá Trị Trung Bình / Đơn</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {averageOrderValue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-[11px] text-slate-500">Chỉ số AOV (Average Order Value)</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Phương Thức Chuộng Nhất</span>
              <QrCode className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-extrabold text-blue-600 mt-1">
              {totalQr > totalCash ? 'Chuyển khoản VietQR' : 'Tiền mặt tại két'}
            </div>
            <p className="text-[11px] text-slate-500">Dựa trên tỷ lệ doanh thu thực tế</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Biểu Đồ Doanh Thu Theo Ngày (Revenue Bar Chart)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  So sánh tổng doanh thu thực tế giữa các ngày trong hệ thống
                </p>
              </div>
            </div>

            <div className="h-64 flex items-end justify-around gap-3 pt-8 pb-4 px-2 bg-slate-50 rounded-xl border border-slate-200">
              {revenueRecords.map((r, idx) => {
                const heightPercent = Math.max(12, Math.round((r.totalRevenue / maxDailyRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 mb-1">
                      {r.totalRevenue.toLocaleString('vi-VN')} đ
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-emerald-500 group-hover:to-teal-400 rounded-t-lg transition-all shadow-sm"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-600 mt-2">
                      {r.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Breakdown Donut/Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                <span>Cơ Cấu Thanh Toán</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ hình thức thanh toán của khách</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-2 text-slate-700">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Tiền mặt</span>
                  </span>
                  <span className="font-mono text-emerald-700">{totalCash.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalRevenue ? Math.round((totalCash / totalRevenue) * 100) : 0}%` }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-2 text-slate-700">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Chuyển khoản VietQR</span>
                  </span>
                  <span className="font-mono text-blue-700">{totalQr.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalRevenue ? Math.round((totalQr / totalRevenue) * 100) : 0}%` }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-2 text-slate-700">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Thẻ POS</span>
                  </span>
                  <span className="font-mono text-purple-700">{totalCard.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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
                <span>Top 5 Món Ăn & Đồ Uống Bán Chạy Nhất</span>
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
