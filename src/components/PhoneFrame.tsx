import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Server, Wifi, BatteryCharging } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface PhoneFrameProps {
  children: React.ReactNode;
  onOpenDevCenter: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, onOpenDevCenter }) => {
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050508] text-white flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Top Bar for App Controls */}
      <header className="w-full max-w-md mb-2 sm:mb-3 px-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-white/80 tracking-wide">网巢 APP</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 font-mono">
            TP5 + MySQL 5.6
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Install PWA App Button */}
          <PWAInstallButton variant="badge" />

          {/* TP5 Backend Center Button */}
          <button
            id="btn-open-tp5-center"
            onClick={onOpenDevCenter}
            className="px-2.5 py-1 rounded-full bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-[11px] text-purple-200 font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title="查看 ThinkPHP 5 与 MySQL 5.6 源码与数据表"
          >
            <Server size={12} className="text-purple-300" />
            <span>TP5后端中心</span>
          </button>

          {/* Toggle Device Frame */}
          <button
            onClick={() => setIsPhoneMode(!isPhoneMode)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 transition"
            title={isPhoneMode ? '切换为全屏自适应视图' : '切换为手机外观壳模式'}
          >
            {isPhoneMode ? <Maximize2 size={13} /> : <Smartphone size={13} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isPhoneMode
            ? 'max-w-[420px] h-[100dvh] sm:h-[840px] sm:rounded-[44px] sm:border-[8px] sm:border-[#1e1e28] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_0_2px_rgba(255,255,255,0.08)] bg-[#0a0a0f] overflow-hidden'
            : 'max-w-2xl h-[100dvh] bg-[#0a0a0f] sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl'
        }`}
      >
        {/* Phone Status Bar */}
        <div className="h-10 px-6 pt-1 flex items-center justify-between text-xs font-semibold text-white/90 shrink-0 z-30 select-none bg-transparent">
          {/* Left Time */}
          <span className="font-mono text-[13px] tracking-tight">{timeStr}</span>

          {/* Center Dynamic Island Notch in Phone Mode */}
          {isPhoneMode && (
            <div className="w-24 h-4 bg-black rounded-full border border-white/10 flex items-center justify-end px-2 gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#151520]"></span>
              <span className="w-2 h-2 rounded-full bg-[#101025] border border-blue-900/50"></span>
            </div>
          )}

          {/* Right Signal & Battery */}
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-[11px] font-mono">5G</span>
            <Wifi size={13} />
            <div className="flex items-center gap-0.5">
              <BatteryCharging size={14} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content Viewport */}
        <main className="flex-1 relative overflow-hidden flex flex-col">{children}</main>

        {/* Bottom Virtual Home Indicator (iOS / Android Style) */}
        {isPhoneMode && (
          <div className="h-3 w-full shrink-0 flex items-center justify-center bg-transparent z-30 pointer-events-none">
            <div className="w-32 h-1 bg-white/20 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
