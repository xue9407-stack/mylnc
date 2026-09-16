import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, Smartphone, CheckCircle, X, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'badge' | 'full' | 'icon';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'badge' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'badge' && (
        <button
          id="btn-pwa-install-badge"
          onClick={handleTrigger}
          className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/30 hover:from-pink-500/30 hover:to-purple-600/40 border border-pink-500/40 text-[11px] text-pink-200 font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          title="直接安装为手机桌面APP（免商店）"
        >
          <Download size={12} className="text-pink-400 animate-bounce" />
          <span>安装APP</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          id="btn-pwa-install-full"
          onClick={handleTrigger}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-medium text-sm flex items-center justify-between shadow-lg shadow-purple-900/30 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-xs text-white">直接添加到手机主屏幕</div>
              <div className="text-[10px] text-white/75">点开即用，独占全屏，无需在浏览器输入网址</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold text-white flex items-center gap-1">
            <Download size={12} /> 一键安装
          </span>
        </button>
      )}

      {variant === 'icon' && (
        <button
          id="btn-pwa-install-icon"
          onClick={handleTrigger}
          className="p-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition"
          title="安装到手机桌面"
        >
          <Download size={13} />
        </button>
      )}

      {/* Guide Modal for Browsers / iOS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-text">
          <div className="w-full max-w-sm rounded-2xl bg-[#12121a] border border-purple-500/30 p-5 shadow-2xl relative text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">添加到手机主屏幕（APP化）</h3>
                <p className="text-[11px] text-purple-300/80">无需下载 APK / 证书，像原生 APP 一样点击打开</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-white/80 bg-white/5 p-3.5 rounded-xl border border-white/10 mb-4">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-300 flex items-center justify-center text-[11px] shrink-0 font-bold">1</span>
                  <span>在苹果 Safari 浏览器底部，点击中间的 <strong>“分享”</strong> 图标 <Share2 size={13} className="inline mx-1 text-pink-400" />。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-300 flex items-center justify-center text-[11px] shrink-0 font-bold">2</span>
                  <span>在菜单向上滑动，点击 <strong>“添加到主屏幕”</strong>。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-300 flex items-center justify-center text-[11px] shrink-0 font-bold">3</span>
                  <span>右上角点击 <strong>“添加”</strong>，桌面即可直接点击启动 APP！</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-white/80 bg-white/5 p-3.5 rounded-xl border border-white/10 mb-4">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[11px] shrink-0 font-bold">1</span>
                  <span>在手机浏览器（Chrome / 华为 / 小米 / 夸克）点击右上角或底部 <strong>菜单「⋮」或「≡」</strong>。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[11px] shrink-0 font-bold">2</span>
                  <span>点击 <strong>“添加到主屏幕”</strong> 或 <strong>“安装应用”</strong>。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[11px] shrink-0 font-bold">3</span>
                  <span>手机桌面会出现「网巢AI」专属图标，点击秒开无广告、独占沉浸全屏！</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mb-4">
              <CheckCircle size={13} />
              <span>支持离线静态缓存、全屏独立运行、自动保存登录状态</span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};
