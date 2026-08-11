import React, { useState, useEffect } from 'react';
import { GoogleSheetsService, GoogleSheetsConfig } from '../services/googleSheetsService';
import { POSStorageEngine } from '../services/storageEngine';
import { PermanentRevenueAggregate } from '../types';
import {
  FileSpreadsheet,
  X,
  Save,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Database,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  onClose: () => void;
  onDataSyncSuccess?: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  onClose,
  onDataSyncSuccess,
}) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>(() => GoogleSheetsService.getConfig());
  const [webAppUrl, setWebAppUrl] = useState<string>(config.webAppUrl);
  const [autoSync, setAutoSync] = useState<boolean>(config.autoSync);
  const [activeTab, setActiveTab] = useState<'SYNC' | 'GUIDE'>('SYNC');
  
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const scriptCode = GoogleSheetsService.getAppsScriptTemplate();

  const handleSaveConfig = () => {
    const updated: GoogleSheetsConfig = {
      ...config,
      webAppUrl: webAppUrl.trim(),
      autoSync: autoSync,
    };
    GoogleSheetsService.saveConfig(updated);
    setConfig(updated);
    setActionMessage({ type: 'success', text: 'Đã lưu cấu hình kết nối Google Sheets thành công!' });
  };

  const handlePushData = async () => {
    handleSaveConfig();
    setIsPushing(true);
    setActionMessage({ type: 'info', text: 'Đang tải tổng doanh thu theo ngày lên Google Sheets...' });

    const localRevenue = POSStorageEngine.getPermanentRevenue();
    const result = await GoogleSheetsService.pushRevenueToGoogleSheets(localRevenue);

    setIsPushing(false);
    if (result.success) {
      setActionMessage({ type: 'success', text: result.message });
      setConfig(GoogleSheetsService.getConfig());
      if (onDataSyncSuccess) onDataSyncSuccess();
    } else {
      setActionMessage({ type: 'error', text: result.message });
      setConfig(GoogleSheetsService.getConfig());
    }
  };

  const handlePullData = async () => {
    handleSaveConfig();
    setIsPulling(true);
    setActionMessage({ type: 'info', text: 'Đang đọc danh sách doanh thu từ Google Sheets...' });

    const result = await GoogleSheetsService.pullRevenueFromGoogleSheets();
    setIsPulling(false);

    if (result.success && result.records) {
      // Merge records with local permanent revenue
      const localRevenue = POSStorageEngine.getPermanentRevenue();
      const mergedMap = new Map<string, PermanentRevenueAggregate>();

      localRevenue.forEach((r) => mergedMap.set(r.date, r));
      result.records.forEach((r) => {
        const existing = mergedMap.get(r.date);
        if (!existing) {
          mergedMap.set(r.date, r);
        } else {
          // Keep highest/updated total revenue
          mergedMap.set(r.date, {
            ...existing,
            totalRevenue: Math.max(existing.totalRevenue, r.totalRevenue),
            totalOrders: Math.max(existing.totalOrders, r.totalOrders),
            cashRevenue: Math.max(existing.cashRevenue, r.cashRevenue),
            qrRevenue: Math.max(existing.qrRevenue, r.qrRevenue),
            cardRevenue: Math.max(existing.cardRevenue, r.cardRevenue),
          });
        }
      });

      const mergedArray = Array.from(mergedMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      POSStorageEngine.savePermanentRevenue(mergedArray);

      setActionMessage({ type: 'success', text: `Đã cập nhật ${mergedArray.length} ngày doanh thu vào POS!` });
      setConfig(GoogleSheetsService.getConfig());
      if (onDataSyncSuccess) onDataSyncSuccess();
    } else {
      setActionMessage({ type: 'error', text: result.message });
      setConfig(GoogleSheetsService.getConfig());
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <FileSpreadsheet className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Database Trực Tuyến Google Sheets
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  CHẢ GIÒ QUẢNG NGÃI
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Đồng bộ & lưu trữ Tổng doanh thu theo ngày từ Google Sheets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('SYNC')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'SYNC'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Kết nối & Đồng bộ Doanh Thu</span>
          </button>

          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition border-b-2 ${
              activeTab === 'GUIDE'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hướng dẫn Tạo Google Apps Script (30s)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Action Message Banner */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : actionMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {actionMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {actionMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {actionMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                <span className="font-semibold">{actionMessage.text}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2">
                ×
              </button>
            </div>
          )}

          {activeTab === 'SYNC' && (
            <div className="space-y-5">
              
              {/* Status Card */}
              <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700">Trạng thái kết nối:</span>
                    {config.status === 'CONNECTED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Đã kết nối Google Sheets</span>
                      </span>
                    ) : config.status === 'ERROR' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center space-x-1">
                        <span>Lỗi kết nối</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                        Chưa kết nối
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Lần đồng bộ gần nhất:{' '}
                    {config.lastSyncTime
                      ? new Date(config.lastSyncTime).toLocaleString('vi-VN')
                      : 'Chưa thực hiện'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-slate-700 font-semibold text-xs">
                    Tự đồng bộ khi tính tiền
                  </span>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Google Apps Script Web App URL:</span>
                  <button
                    onClick={() => setActiveTab('GUIDE')}
                    className="text-emerald-600 hover:underline text-[11px] font-medium flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Cách lấy Web App URL?</span>
                  </button>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center space-x-1.5 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu URL</span>
                  </button>
                </div>
              </div>

              {/* Sync Actions Grid */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Thao tác Đồng bộ Doanh Thu
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePushData}
                    disabled={isPushing || isPulling}
                    className="p-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center space-x-2 text-xs"
                  >
                    <Upload className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                    <span>{isPushing ? 'Đang đẩy dữ liệu...' : 'Đẩy Doanh Thu POS lên Google Sheets'}</span>
                  </button>

                  <button
                    onClick={handlePullData}
                    disabled={isPushing || isPulling}
                    className="p-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center space-x-2 text-xs"
                  >
                    <Download className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
                    <span>{isPulling ? 'Đang tải dữ liệu...' : 'Tải Doanh Thu Google Sheets về POS'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'GUIDE' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <p className="font-bold text-sm text-emerald-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>3 Bước Tạo Database Doanh Thu Trực Tuyến Miễn Phí với Google Sheets</span>
                </p>
                <p className="mt-1 text-emerald-700">
                  Dữ liệu doanh thu tổng hợp theo ngày sẽ được tự động cập nhật vào trang tính của bạn mà không lo lắng về việc mất dữ liệu!
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-700 font-mono text-xs">Bước 1: Mở Google Sheets</span>
                  <p className="text-slate-600">
                    Truy cập{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline inline-flex items-center"
                    >
                      sheets.new <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>{' '}
                    để tạo một trang tính Google Sheets mới đặt tên là <strong>Doanh Thu Chả Giò Quảng Ngãi</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 font-mono text-xs">Bước 2: Mở Apps Script & Dán Mã</span>
                    <button
                      onClick={handleCopyScript}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 transition"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Đã Copy Mã!' : 'Copy Mã Apps Script'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600">
                    Trên Google Sheets, chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>. Xóa hết mã cũ và dán mã bên dưới vào:
                  </p>
                  <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-lg max-h-36 overflow-y-auto">
                    {scriptCode}
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-700 font-mono text-xs">Bước 3: Triển Khai Dưới Dạng Web App</span>
                  <p className="text-slate-600">
                    Bấm góc trên bên phải <strong>Triển khai (Deploy)</strong> &gt; <strong>Triển khai dưới dạng ứng dụng web (New deployment)</strong>:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 ml-2 font-medium">
                    <li>Thực thi dưới dạng: <strong>Tôi (Me)</strong></li>
                    <li>Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong></li>
                  </ul>
                  <p className="text-slate-600 mt-1">
                    Bấm <strong>Triển khai (Deploy)</strong>, sau đó copy đường dẫn <strong>Web App URL</strong> dán vào ô cấu hình ở tab Kết nối & Đồng bộ!
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-500 text-[11px] font-mono">
            CHẢ GIÒ QUẢNG NGÃI • Google Sheets Online Database Engine
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
