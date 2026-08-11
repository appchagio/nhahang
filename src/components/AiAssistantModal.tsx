import React, { useState } from 'react';
import { Order, PermanentRevenueAggregate, MenuItem } from '../types';
import { GeminiService } from '../services/geminiService';
import {
  Bot,
  Sparkles,
  X,
  Send,
  BrainCircuit,
  TrendingUp,
  Package,
  MessageSquare,
  Lightbulb,
  Zap,
  AlertCircle
} from 'lucide-react';

interface AiAssistantModalProps {
  onClose: () => void;
  orders: Order[];
  revenueRecords: PermanentRevenueAggregate[];
  menu: MenuItem[];
  onOpenApiKeyModal?: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  onClose,
  orders,
  revenueRecords,
  menu,
  onOpenApiKeyModal,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'AI' | 'USER'; text: string; isError?: boolean }>>([
    {
      sender: 'AI',
      text: 'Xin chào! Tôi là Trợ Lý AI Quảng Ngãi (Gemini AI). Tôi có thể giúp bạn phân tích doanh thu, tư vấn combo bán hàng, và dự đoán nguyên liệu nhập hàng cho ngày mai!',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelUsedInfo, setModelUsedInfo] = useState<string>('');

  const totalRevenueToday = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrdersToday = orders.filter((o) => o.status === 'PAID').length;

  const handleSendQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    setMessages((prev) => [...prev, { sender: 'USER', text: query }]);
    setInputMsg('');
    setIsLoading(true);

    const apiKey = GeminiService.getApiKey();
    if (!apiKey) {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'Vui lòng nhập API Key để sử dụng app! Bấm nút "Lấy API key để sử dụng app" màu đỏ phía trên để cấu hình.',
          isError: true,
        },
      ]);
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    const systemContext = `Bạn là Trợ Lý Trí Tuệ Nhân Tạo chuyên nghiệp của nhà hàng CHẢ GIÒ QUẢNG NGÃI.
Dữ liệu kinh doanh hiện tại:
- Doanh thu hôm nay: ${totalRevenueToday.toLocaleString('vi-VN')} VNĐ (${totalOrdersToday} đơn hàng).
- Thực đơn các món: ${menu.map((m) => m.name + ' (' + m.price + 'đ)').join(', ')}.
Hãy đưa ra câu trả lời ngắn gọn, chuyên nghiệp, hỗ trợ đắc lực cho thu ngân và chủ quán.`;

    const response = await GeminiService.generateContentWithFallback(query, systemContext);
    setIsLoading(false);

    if (response.error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: response.error || 'Đã dừng do lỗi API.',
          isError: true,
        },
      ]);
    } else {
      setModelUsedInfo(response.modelUsed);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: response.text,
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Quảng Ngãi AI Assistant
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-purple-200/80 font-medium">
                Trợ lý trí tuệ nhân tạo phân tích doanh thu & tư vấn bán hàng
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick AI Action Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => handleSendQuery('Phân tích doanh thu hôm nay')}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-indigo-700 font-bold hover:bg-indigo-50 transition shrink-0 flex items-center space-x-1.5 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phân tích Doanh Thu</span>
          </button>

          <button
            onClick={() => handleSendQuery('Gợi ý combo tư vấn khách hàng')}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-purple-700 font-bold hover:bg-purple-50 transition shrink-0 flex items-center space-x-1.5 shadow-sm"
          >
            <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
            <span>Gợi ý Combo Upsell</span>
          </button>

          <button
            onClick={() => handleSendQuery('Dự báo nguyên liệu cần nhập')}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 font-bold hover:bg-emerald-50 transition shrink-0 flex items-center space-x-1.5 shadow-sm"
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dự báo Nguyên Liệu</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-100 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl ${
                  m.sender === 'USER'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : m.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none shadow-sm space-y-1 font-bold'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm space-y-1'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] font-bold opacity-80 mb-1">
                  {m.sender === 'AI' ? (
                    <span className={m.isError ? 'text-rose-700 flex items-center space-x-1 font-bold' : 'text-purple-600 flex items-center space-x-1'}>
                      {m.isError ? <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> : <Sparkles className="w-3 h-3" />}
                      <span>{m.isError ? 'Thông Báo Lỗi AI API' : 'Trợ Lý AI Quảng Ngãi'}</span>
                    </span>
                  ) : (
                    <span>Thu Ngân / Quản Lý</span>
                  )}
                </div>
                <div className="whitespace-pre-line leading-relaxed font-sans">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none text-slate-500 font-medium flex items-center space-x-2 shadow-sm">
                <BrainCircuit className="w-4 h-4 text-purple-600 animate-spin" />
                <span>AI đang phân tích dữ liệu bán hàng...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Hỏi AI bất kỳ điều gì về bán hàng, doanh thu hay menu..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputMsg)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button
            onClick={() => handleSendQuery(inputMsg)}
            disabled={!inputMsg.trim() || isLoading}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-bold transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
