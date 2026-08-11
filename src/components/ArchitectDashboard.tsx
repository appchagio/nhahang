import React, { useState } from 'react';
import { SystemMetrics, PermanentRevenueAggregate, Order } from '../types';
import { POSStorageEngine } from '../services/storageEngine';
import { GoogleSheetsService } from '../services/googleSheetsService';
import {
  Cpu,
  HardDrive,
  Trash2,
  Zap,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  Upload,
  Download
} from 'lucide-react';

interface ArchitectDashboardProps {
  metrics: SystemMetrics;
  cachedOrders: Order[];
  revenueRecords: PermanentRevenueAggregate[];
  onRefreshData: () => void;
  onOpenGoogleSheets: () => void;
}

export const ArchitectDashboard: React.FC<ArchitectDashboardProps> = ({
  metrics,
  cachedOrders,
  revenueRecords,
  onRefreshData,
  onOpenGoogleSheets,
}) => {
  const [purgeLogNotice, setPurgeLogNotice] = useState<{
    purgedCount: number;
    purgedBytesEst: number;
    purgeTime: string;
  } | null>(null);

  const handleManualAutoPurge = () => {
    const result = POSStorageEngine.executeAutoPurge();
    setPurgeLogNotice(result);
    onRefreshData();
  };

  const totalPermanentRevenue = revenueRecords.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalPermanentOrders = revenueRecords.reduce((acc, r) => acc + r.totalOrders, 0);

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200">
                Core Logic & Inspector
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold">
                Performance: Peak (0ms lag)
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2 flex items-center space-x-2">
              <Cpu className="w-7 h-7 text-blue-600" />
              <span>Kiến trúc Lưu trữ Phân cấp (Tiered Storage) & Auto-Purge</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Phân tách <strong>Doanh thu vĩnh viễn (Permanent Storage)</strong> và{' '}
              <strong>Bộ nhớ đệm hóa đơn trong ngày (Short-term Cache)</strong>. Cơ chế Auto-Purge chạy đúng 24:00 loại bỏ dữ liệu chi tiết rác để duy trì tốc độ tức thì.
            </p>
          </div>

          <button
            onClick={handleManualAutoPurge}
            className="py-3 px-5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 shrink-0"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
            <span>Chạy Auto-Purge 24:00 (Mô phỏng)</span>
          </button>
        </div>

        {/* Purge Notification Banner */}
        {purgeLogNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-900">
                  Đã thực thi Tiến trình Auto-Purge thành công!
                </p>
                <p className="text-emerald-700 font-mono mt-0.5">
                  Xóa sạch <strong>{purgeLogNotice.purgedCount} đơn đã thanh toán</strong> khỏi Cache ngắn hạn (Giải phóng ~{purgeLogNotice.purgedBytesEst} bytes). Tổng doanh thu vĩnh viễn được bảo vệ tuyệt đối!
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-slate-500 font-medium">
              {new Date(purgeLogNotice.purgeTime).toLocaleTimeString('vi-VN')}
            </span>
          </div>
        )}

        {/* System Architecture Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Độ trễ tính toán</span>
              <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600">
              {metrics.calculationLatencyMs} ms
            </div>
            <p className="text-[11px] text-slate-500">Real-time Calculation Engine</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Hóa đơn trong Cache</span>
              <HardDrive className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black font-mono text-blue-600">
              {metrics.cachedOrdersCount} đơn
            </div>
            <p className="text-[11px] text-slate-500">Log chi tiết xóa vào 24:00</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Tổng Doanh Thu Vĩnh Viễn</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {totalPermanentRevenue.toLocaleString('vi-VN')} đ
            </div>
            <p className="text-[11px] text-slate-500">Permanent Storage Protected</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Lần Auto-Purge gần nhất</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm font-bold font-mono text-slate-800 mt-1">
              {metrics.lastAutoPurgeAt
                ? new Date(metrics.lastAutoPurgeAt).toLocaleTimeString('vi-VN')
                : 'Chưa thực thi'}
            </div>
            <p className="text-[11px] text-slate-500">Background Job Schedule 24:00</p>
          </div>

        </div>

        {/* Tiered Data Comparison Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TIER 1: SHORT-TERM CACHE INSPECTOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span>Tier 1: Short-term Daily Order Cache</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ chi tiết topping, dòng món ăn trong ngày hiện tại
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">
                TEMPORARY
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {cachedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">{ord.code}</span>
                      <span className="text-slate-500">({ord.tableName})</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      {ord.items.length} món • {ord.items.map((i) => i.name).join(', ')}
                    </p>
                  </div>

                  <div className="text-right font-mono font-bold text-blue-600 text-sm">
                    {ord.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              ))}

              {cachedOrders.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Bộ nhớ đệm rỗng. Tất cả log đã được dọn dẹp gọn gàng!</p>
                </div>
              )}
            </div>
          </div>

          {/* TIER 2: PERMANENT REVENUE STORAGE INSPECTOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Tier 2: Permanent Revenue Storage</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doanh thu tổng hợp theo ngày, không bao giờ bị xóa bởi Auto-Purge
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                PERMANENT
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {revenueRecords.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800 font-mono">Ngày: {rec.date}</span>
                    <span className="font-mono text-blue-600 text-sm">
                      {rec.totalRevenue.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                    <div>Tiền mặt: {rec.cashRevenue.toLocaleString('vi-VN')} đ</div>
                    <div>VietQR: {rec.qrRevenue.toLocaleString('vi-VN')} đ</div>
                    <div>Thẻ POS: {rec.cardRevenue.toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GOOGLE SHEETS ONLINE DATABASE INSPECTOR CARD */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4 border border-emerald-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Cloud Integration
                </span>
                <span className="text-[11px] font-mono text-emerald-200">
                  Total Daily Revenue Sync
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-white mt-1 flex items-center space-x-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                <span>Cơ Sở Dữ Liệu Trực Tuyến Google Sheets</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Đồng bộ hóa trực tuyến tổng doanh thu theo ngày từ app <strong>CHẢ GIÒ QUẢNG NGÃI</strong> lên bảng tính Google Sheets của bạn.
              </p>
            </div>

            <button
              onClick={onOpenGoogleSheets}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2 shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mở Cấu Hình & Đồng Bộ Google Sheets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 font-medium">Trạng thái kết nối:</span>
              <p className="font-bold font-mono text-emerald-400 text-sm">
                {GoogleSheetsService.getConfig().status === 'CONNECTED' ? 'ĐÃ KẾT NỐI ONLINE' : 'CHƯA KẾT NỐI'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 font-medium">Tự động đồng bộ khi thanh toán:</span>
              <p className="font-bold font-mono text-blue-300 text-sm">
                {GoogleSheetsService.getConfig().autoSync ? 'BẬT (Auto-Sync)' : 'TẮT'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-slate-400 font-medium">Lần cập nhật gần nhất:</span>
              <p className="font-mono text-slate-200 text-xs truncate">
                {GoogleSheetsService.getConfig().lastSyncTime
                  ? new Date(GoogleSheetsService.getConfig().lastSyncTime!).toLocaleString('vi-VN')
                  : 'Chưa có nhật ký'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
