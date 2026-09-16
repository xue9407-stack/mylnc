import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Role } from '../types';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (role: Role) => void;
  onShowToast: (msg: string) => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('治愈, 倾听, 陪伴');
  const [topic1, setTopic1] = useState('今天过得开心吗？');
  const [topic2, setTopic2] = useState('有什么想和我聊聊的吗？');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const emojiOptions = ['✨', '🦊', '🐱', '🌹', '👑', '🧙', '🎀', '☕', '🕶️', '🌙', '🎧'];

  const handleCreate = async () => {
    if (!name.trim() || !title.trim() || !desc.trim()) {
      onShowToast('请填写完整的角色名称、身份和人设！');
      return;
    }

    setLoading(true);
    const newRole: Role = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      title: title.trim(),
      emoji,
      cover: 'c-warm-senpai',
      desc: desc.trim(),
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      topics: [topic1.trim(), topic2.trim()].filter(Boolean),
      users: '1',
      follows: '0',
      rating: 5.0,
      is_official: 0,
      is_followed: true,
    };

    setTimeout(() => {
      setLoading(false);
      onCreateSuccess(newRole);
      onShowToast(`🎉 恭喜！新角色【${newRole.name}】已创建并上架！`);
      onClose();
    }, 400);
  };

  return (
    <div
      id="create-role-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#0f0f18] border border-white/10 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h3 className="text-base font-bold text-white">创作全新AI角色</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Avatar Emoji Select */}
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1.5">角色形象 (Emoji)</label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {emojiOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition ${
                    emoji === item
                      ? 'bg-purple-600/40 border-2 border-purple-500 scale-110'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1">角色姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 楚子航"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1">角色身份/头衔</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 冷酷杀手 / 首席法医"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60"
              />
            </div>
          </div>

          {/* Desc */}
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1">人设描述与自白</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="描述TA的性格、口癖、对用户的态度..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/60 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-white/60 block mb-1">性格标签 (逗号分隔)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="高冷, 护短, 禁欲"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60"
            />
          </div>

          {/* Opening Starters */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 block">开场备选话题</label>
            <input
              type="text"
              value={topic1}
              onChange={(e) => setTopic1(e.target.value)}
              placeholder="话题1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/60"
            />
            <input
              type="text"
              value={topic2}
              onChange={(e) => setTopic2(e.target.value)}
              placeholder="话题2"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/60"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-md shadow-purple-500/25 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? '发布中...' : '立即发布角色'}
          </button>
        </div>
      </div>
    </div>
  );
};
