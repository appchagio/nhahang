import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import {
  Gamepad2,
  X,
  Trophy,
  Clock,
  Zap,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';

interface OrderSpeedGameModalProps {
  onClose: () => void;
  menu: MenuItem[];
}

export const OrderSpeedGameModal: React.FC<OrderSpeedGameModalProps> = ({
  onClose,
  menu,
}) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'ENDED'>('START');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('pos_game_highscore_v1') || 0);
  });

  const [currentPromptItem, setCurrentPromptItem] = useState<MenuItem | null>(null);
  const [promptQty, setPromptQty] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // Generate random challenge
  const nextChallenge = () => {
    if (menu.length === 0) return;
    const randomItem = menu[Math.floor(Math.random() * menu.length)];
    const randomQty = Math.floor(Math.random() * 3) + 1;
    setCurrentPromptItem(randomItem);
    setPromptQty(randomQty);
  };

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameState('PLAYING');
    nextChallenge();
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('ENDED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Update High Score on Game End
  useEffect(() => {
    if (gameState === 'ENDED') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('pos_game_highscore_v1', String(score));
      }
    }
  }, [gameState, score, highScore]);

  const handleItemClick = (selectedItem: MenuItem) => {
    if (gameState !== 'PLAYING' || !currentPromptItem) return;

    if (selectedItem.id === currentPromptItem.id) {
      const addedScore = 100 + streak * 20;
      setScore((prev) => prev + addedScore);
      setStreak((prev) => prev + 1);
      setFeedback({ type: 'correct', text: `+${addedScore} ĐIỂM! CHÍNH XÁC!` });
      setTimeout(() => setFeedback(null), 800);
      nextChallenge();
    } else {
      setStreak(0);
      setFeedback({ type: 'wrong', text: `SAI RỒI! ĐÂY LÀ ${selectedItem.name}` });
      setTimeout(() => setFeedback(null), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Gamepad2 className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Game Luyện Gõ Order 60 Giây
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/30 text-amber-100 border border-amber-300/30">
                  Staff Quiz Mode
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium">
                Tăng tốc độ thu ngân & thuộc vị trí các món chả giò / đồ uống
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-amber-100 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-6 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Thời gian:</span>
            <span className={`font-black text-sm ${timeLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Streak:</span>
            <span className="font-bold text-orange-400 text-sm">x{streak}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Điểm:</span>
            <span className="font-black text-yellow-300 text-sm">{score}</span>
          </div>
        </div>

        {/* Game Viewport */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100 text-xs flex flex-col items-center justify-center">
          
          {gameState === 'START' && (
            <div className="text-center space-y-4 max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-xl text-slate-900">Thử Thách Luyện Gõ Order</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Yêu cầu món của khách hàng sẽ xuất hiện liên tục trong 60 giây. Hãy bấm chọn đúng món ăn trên màn hình càng nhanh càng tốt!
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl font-mono font-bold text-amber-800 text-xs">
                Kỷ lục cao nhất: {highScore} Điểm
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>BẮT ĐẦU CHƠI NGAY (60s)</span>
              </button>
            </div>
          )}

          {gameState === 'PLAYING' && currentPromptItem && (
            <div className="w-full space-y-5">
              
              {/* Customer Prompt Banner */}
              <div className="p-5 bg-white border-2 border-amber-400 rounded-2xl shadow-md text-center space-y-1 relative">
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                  Khách Hàng Đang Gọi Món:
                </span>
                <div className="text-xl font-black text-slate-900 font-sans">
                  "{promptQty} suất <span className="text-orange-600 underline">{currentPromptItem.name}</span>"
                </div>

                {feedback && (
                  <div
                    className={`absolute inset-x-0 -bottom-4 mx-auto w-max px-4 py-1 rounded-full font-extrabold text-xs text-white shadow-md animate-bounce ${
                      feedback.type === 'correct' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {feedback.text}
                  </div>
                )}
              </div>

              {/* Menu Grid Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {menu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl transition shadow-sm flex flex-col items-center text-center space-y-1 group"
                  >
                    <span className="font-bold text-slate-800 text-xs group-hover:text-amber-700">
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                  </button>
                ))}
              </div>

            </div>
          )}

          {gameState === 'ENDED' && (
            <div className="text-center space-y-4 max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="font-black text-2xl text-slate-900">HẾT GIỜ!</h4>
              
              <div className="space-y-2">
                <p className="text-slate-600 text-xs">Tổng điểm bạn đạt được trong 60 giây:</p>
                <div className="text-3xl font-black font-mono text-amber-600">{score} ĐIỂM</div>
                {score >= highScore && score > 0 && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs inline-block">
                    🎉 KỶ LỤC MỚI CỦA THƯƠNG HIỆU!
                  </span>
                )}
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Thử Thách</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-500 font-mono text-[11px]">
          <div>CHẢ GIÒ QUẢNG NGÃI • Speed Order Quiz Game</div>
          <button onClick={onClose} className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
