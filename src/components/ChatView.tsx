import React, { useState, useEffect, useRef } from 'react';
import { Role, ChatMessage } from '../types';
import { ChevronLeft, Send, Sparkles, Volume2, Trash2 } from 'lucide-react';

interface ChatViewProps {
  role: Role;
  onBack: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messages: ChatMessage[];
  isTyping: boolean;
  onShowToast: (msg: string) => void;
  onClearHistory: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  role,
  onBack,
  onSendMessage,
  messages,
  isTyping,
  onShowToast,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isTyping) return;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div id="chat-view-container" className="h-full flex flex-col bg-[#08080d] relative overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-4 bg-[#0d0d14]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            id="btn-chat-back"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-purple-300 hover:bg-white/10 active:scale-95 transition"
            aria-label="返回"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-lg select-none shadow-sm ${role.cover}`}
            >
              {role.emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">{role.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-medium">
                  {role.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>拟真在线</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 text-white/60">
          <button
            onClick={() => onShowToast('正在调用拟真角色语音合成...')}
            className="p-2 rounded-full hover:bg-white/5 hover:text-white transition"
            title="语音朗读"
          >
            <Volume2 size={17} />
          </button>
          <button
            onClick={onClearHistory}
            className="p-2 rounded-full hover:bg-white/5 hover:text-red-400 transition"
            title="清空聊天记录"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* If no message, show Persona Card & Topics */}
        {messages.length === 0 && (
          <div className="text-center py-6 px-3 bg-white/[0.02] border border-white/5 rounded-2xl my-2">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg mb-3 ${role.cover}`}
            >
              {role.emoji}
            </div>
            <h3 className="text-base font-bold text-white">{role.name}</h3>
            <p className="text-xs text-white/50 max-w-xs mx-auto mt-1 leading-relaxed">{role.desc}</p>

            <div className="mt-5 text-left">
              <div className="text-xs text-purple-300/80 font-medium flex items-center gap-1 mb-2">
                <Sparkles size={13} />
                <span>试试点击以下开场白：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.topics.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendMessage(t);
                    }}
                    className="text-left text-xs bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-xl transition active:scale-95"
                  >
                    “{t}”
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 select-none shadow-sm ${
                  isUser ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white' : role.cover
                }`}
              >
                {isUser ? '😊' : role.emoji}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[74%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-xs font-normal'
                      : 'bg-white/10 text-white/95 rounded-bl-xs border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-white/30 px-1 mt-1 font-mono">{msg.time}</span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 animate-fade-in">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 select-none shadow-sm ${role.cover}`}
            >
              {role.emoji}
            </div>
            <div className="bg-white/10 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-dot-1"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-dot-2"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-dot-3"></span>
              <span className="text-xs text-white/40 ml-1">正在输入...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips (if messages exist) */}
      {messages.length > 0 && (
        <div className="px-4 py-1 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSendMessage('你现在在忙什么呢？')}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-white/60 hover:text-white hover:bg-white/10 border border-white/5 transition"
          >
            你现在在忙什么？
          </button>
          <button
            onClick={() => onSendMessage('今天遇到开心的事了！')}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-white/60 hover:text-white hover:bg-white/10 border border-white/5 transition"
          >
            遇到开心的事了
          </button>
          <button
            onClick={() => onSendMessage('今晚想听你讲个故事')}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-white/60 hover:text-white hover:bg-white/10 border border-white/5 transition"
          >
            讲个故事吧
          </button>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 pb-6 bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/5 flex items-center gap-2 z-20">
        <input
          id="chat-message-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`对 ${role.name} 说点什么...`}
          className="flex-1 bg-white/8 hover:bg-white/10 focus:bg-white/12 border border-white/10 focus:border-purple-500/60 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition"
        />

        <button
          id="btn-chat-send"
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-500/30 active:scale-95 transition"
          aria-label="发送"
        >
          <Send size={16} className="-ml-0.5" />
        </button>
      </div>
    </div>
  );
};
