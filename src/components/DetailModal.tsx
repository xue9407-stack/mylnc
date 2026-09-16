import React from 'react';
import { Role } from '../types';
import { X, Share2, MoreHorizontal, Heart, MessageCircle, Star } from 'lucide-react';

interface DetailModalProps {
  role: Role | null;
  isOpen: boolean;
  isFollowed: boolean;
  onClose: () => void;
  onToggleFollow: () => void;
  onStartChat: (role: Role) => void;
  onShowToast: (msg: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  role,
  isOpen,
  isFollowed,
  onClose,
  onToggleFollow,
  onStartChat,
  onShowToast,
}) => {
  if (!isOpen || !role) return null;

  return (
    <div
      id="role-detail-modal"
      className="absolute inset-0 z-50 bg-[#0a0a0f] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top Cover */}
      <div className={`relative h-72 w-full flex items-center justify-center ${role.cover}`}>
        {/* Close button */}
        <button
          id="btn-close-detail"
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-10 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition active:scale-95 z-10"
        >
          <X size={18} />
        </button>

        {/* Top Actions */}
        <div className="absolute top-10 right-4 flex items-center gap-2.5 z-10">
          <button
            id="btn-share-role"
            onClick={() => onShowToast('分享链接已复制到剪贴板')}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition active:scale-95"
            aria-label="分享"
          >
            <Share2 size={16} />
          </button>
          <button
            id="btn-more-role"
            onClick={() => onShowToast('已添加至角色收藏夹')}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition active:scale-95"
            aria-label="更多"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Huge Emoji / Character Avatar */}
        <div className="text-8xl drop-shadow-2xl select-none transform hover:scale-105 transition duration-300">
          {role.emoji}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 bg-[#0a0a0f] rounded-t-3xl -mt-6 px-6 pt-5 pb-24 overflow-y-auto relative z-10 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">{role.name}</h2>
            <p className="text-xs text-purple-300/80 font-medium mt-0.5">
              {role.title} · {role.is_official ? '网巢官方自研角色' : '创作者自建'}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-xs font-semibold">
            <Star size={12} className="fill-yellow-400" />
            <span>{role.rating || 4.9}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 my-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{role.users}</div>
            <div className="text-[11px] text-white/40 mt-0.5">聊过的人</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{role.follows}</div>
            <div className="text-[11px] text-white/40 mt-0.5">已关注</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">99.8%</div>
            <div className="text-[11px] text-white/40 mt-0.5">好评率</div>
          </div>
        </div>

        {/* Description Bio */}
        <div className="my-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">角色人设</h3>
          <p className="text-sm text-white/75 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
            {role.desc}
          </p>
        </div>

        {/* Tags */}
        <div className="my-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">性格标签</h3>
          <div className="flex flex-wrap gap-2">
            {role.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white/8 text-white/80 text-xs font-medium border border-white/5 hover:border-purple-500/40 transition"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Opening Starter Prompts */}
        <div className="my-4">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>💡 专属开场话题</span>
          </h3>
          <div className="space-y-2">
            {role.topics.map((topic, i) => (
              <div
                key={i}
                onClick={() => onStartChat(role)}
                className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 text-xs leading-normal hover:bg-purple-900/30 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <span>“{topic}”</span>
                <span className="text-purple-400 text-xs group-hover:translate-x-0.5 transition">聊这个 ›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 flex gap-3 z-20">
        <button
          id="btn-toggle-follow"
          onClick={onToggleFollow}
          className={`flex-1 py-3.5 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border transition active:scale-95 ${
            isFollowed
              ? 'bg-white/15 border-white/20 text-white'
              : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
          }`}
        >
          <Heart size={16} className={isFollowed ? 'fill-pink-500 text-pink-500' : ''} />
          <span>{isFollowed ? '已关注' : '+ 关注'}</span>
        </button>

        <button
          id="btn-start-chat-modal"
          onClick={() => onStartChat(role)}
          className="flex-[2] py-3.5 px-5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-95 hover:opacity-95 transition"
        >
          <MessageCircle size={16} />
          <span>开始聊天</span>
        </button>
      </div>
    </div>
  );
};
