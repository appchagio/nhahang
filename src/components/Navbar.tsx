import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  LayoutGrid,
  BookOpen,
  Receipt,
  Cpu,
  Settings,
  Zap,
  Printer,
  Clock,
  HardDrive,
  FileSpreadsheet,
  BarChart3,
  Bot,
  Banknote,
  Gamepad2,
  Key,
  ExternalLink
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface NavbarProps {
  activeTab: 'ORDERING' | 'TABLES' | 'MENU' | 'INVOICES' | 'ARCHITECT' | 'ANALYTICS';
  setActiveTab: (tab: 'ORDERING' | 'TABLES' | 'MENU' | 'INVOICES' | 'ARCHITECT' | 'ANALYTICS') => void;
  metrics: SystemMetrics;
  onOpenSettings: () => void;
  onOpenGoogleSheets: () => void;
  onOpenAiAssistant: () => void;
  onOpenShiftManager: () => void;
  onOpenSpeedGame: () => void;
  onOpenGeminiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onOpenSettings,
  onOpenGoogleSheets,
  onOpenAiAssistant,
  onOpenShiftManager,
  onOpenSpeedGame,
  onOpenGeminiKeyModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  CHẢ GIÒ QUẢNG NGÃI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Online Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Hệ Thống Quản Lý Bán Hàng & Doanh Thu Google Sheets
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('ORDERING')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'ORDERING'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden md:inline">Gọi món (One-Touch)</span>
              <span className="md:hidden">Order</span>
            </button>

            <button
              onClick={() => setActiveTab('TABLES')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'TABLES'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Sơ đồ Bàn</span>
              <span className="md:hidden">Bàn</span>
            </button>

            <button
              onClick={() => setActiveTab('MENU')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'MENU'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Thực đơn</span>
              <span className="md:hidden">Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'INVOICES'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline">Hóa đơn</span>
              <span className="md:hidden">Sổ HD</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'ANALYTICS'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Báo Cáo & Analytics</span>
              <span className="md:hidden">Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('ARCHITECT')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'ARCHITECT'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden lg:inline">Kiến trúc & Tiered Storage</span>
              <span className="lg:hidden">Hệ thống</span>
            </button>
          </nav>

          {/* System Telemetry & Quick Tool Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              title="Mở Trợ Lý Trí Tuệ Nhân Tạo AI"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition shadow-sm"
            >
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="hidden xl:inline">Trợ Lý AI</span>
            </button>

            {/* Shift Manager Button */}
            <button
              onClick={onOpenShiftManager}
              title="Quản Lý Ca Làm Việc & Kiểm Két Tiền Mặt"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition shadow-sm"
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline">Giao Ca</span>
            </button>

            {/* Speed Game Button */}
            <button
              onClick={onOpenSpeedGame}
              title="Minigame Luyện Gõ Order 60s Cho Nhân Viên Mới"
              className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-600" />
            </button>

            {/* Gemini API Key Button with Red Note */}
            <button
              onClick={onOpenGeminiKeyModal}
              title="Cấu hình Model AI & API Key Gemini"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition shadow-sm animate-pulse"
            >
              <Key className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline font-bold">Lấy API key để sử dụng app</span>
            </button>

            {/* Google Sheets DB Button */}
            <button
              onClick={onOpenGoogleSheets}
              title="Cấu hình & Đồng bộ Database Google Sheets"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Google Sheets DB</span>
            </button>

            {/* Print Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Cấu hình Mẫu In K80/K57"
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition"
            >
              <Printer className="w-4 h-4 text-slate-600 hover:text-blue-600" />
            </button>

            {/* Clock */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{timeStr || '00:00:00'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
