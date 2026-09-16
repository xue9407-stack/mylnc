import React, { useState, useEffect } from 'react';
import { Role, Conversation, ChatMessage, UserProfile, AppPage } from './types';
import { api } from './services/api';
import { PhoneFrame } from './components/PhoneFrame';
import { DetailModal } from './components/DetailModal';
import { ChatView } from './components/ChatView';
import { Tp5DevModal } from './components/Tp5DevModal';
import { CreateRoleModal } from './components/CreateRoleModal';
import { RechargeModal } from './components/RechargeModal';
import { Toast } from './components/Toast';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  Home,
  MessageSquare,
  User,
  Search,
  ChevronRight,
  Heart,
  Crown,
  Wallet,
  Star,
  PenTool,
  Settings,
  HelpCircle,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Bell,
  Trash2,
  Server,
} from 'lucide-react';

const CATEGORIES = ['全部', '霸总', '温柔', '邻家', '病娇', '御姐', '学姐'];

export default function App() {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [detailRole, setDetailRole] = useState<Role | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('currentUser') || '网巢用户';
  });
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');
  const [loginTip, setLoginTip] = useState('');

  // Data States
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [homeSearchKeyword, setHomeSearchKeyword] = useState<string>('');
  const [exploreKeyword, setExploreKeyword] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [follows, setFollows] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('follows') || '["lujingchen", "linxiaorou"]');
    } catch {
      return ['lujingchen', 'linxiaorou'];
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 10086,
    username: 'admin',
    nickname: '网巢体验官',
    avatar: '😊',
    money: 128.5,
    score: 328,
    vip_level: 1,
    vip_text: '💎 黄金会员',
  });

  // Modals & Tools
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);

  // Helper: Toast Message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // Initial Load from API
  useEffect(() => {
    async function loadData() {
      const fetchedRoles = await api.getRoles();
      if (fetchedRoles && fetchedRoles.length > 0) {
        setRoles(fetchedRoles);
      }
      const convs = await api.getConversations();
      if (convs && convs.length > 0) {
        setConversations(convs);
      } else {
        const savedConvs = localStorage.getItem('conversations');
        if (savedConvs) {
          try {
            setConversations(JSON.parse(savedConvs));
          } catch (e) {
            console.error(e);
          }
        }
      }
      const profile = await api.getUserProfile();
      if (profile && profile.user) {
        setUserProfile(profile.user);
      }
    }
    loadData();
  }, []);

  // Sync follows to LocalStorage
  useEffect(() => {
    localStorage.setItem('follows', JSON.stringify(follows));
  }, [follows]);

  // Sync conversations to LocalStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Load chat messages when entering chat with a role
  useEffect(() => {
    if (activeRole) {
      async function loadChat() {
        if (!activeRole) return;
        const history = await api.getChatHistory(activeRole.id);
        if (history && history.length > 0) {
          setChatMessages(history);
        } else {
          // fallback to localStorage
          const localAll = JSON.parse(localStorage.getItem('chatHistories') || '{}');
          const localHistory = localAll[activeRole.id] || [];
          setChatMessages(localHistory);
        }
      }
      loadChat();
    }
  }, [activeRole]);

  // Auth Handler
  const handleAuth = async () => {
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginTip('请输入用户名和密码');
      return;
    }

    if (loginMode === 'register') {
      if (passwordInput !== confirmPwdInput) {
        setLoginTip('两次输入的密码不一致');
        return;
      }
      const res = await api.register(usernameInput.trim(), passwordInput.trim());
      if (res) {
        showToast('注册成功！');
        setLoginMode('login');
        setLoginTip('');
      } else {
        // Local simulation fallback
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[usernameInput]) {
          setLoginTip('用户名已存在');
          return;
        }
        users[usernameInput] = { password: passwordInput };
        localStorage.setItem('users', JSON.stringify(users));
        showToast('注册成功！欢迎加入网巢');
        setLoginMode('login');
        setLoginTip('');
      }
      return;
    }

    // Login
    const res = await api.login(usernameInput.trim(), passwordInput.trim());
    if (res) {
      setCurrentUser(res.nickname || usernameInput.trim());
      localStorage.setItem('currentUser', res.nickname || usernameInput.trim());
      showToast('登录成功，欢迎回来！');
      setCurrentPage('home');
      setUsernameInput('');
      setPasswordInput('');
    } else {
      // Local fallback for smooth testing
      setCurrentUser(usernameInput.trim());
      localStorage.setItem('currentUser', usernameInput.trim());
      showToast('登录成功！');
      setCurrentPage('home');
      setUsernameInput('');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    showToast('已安全退出登录');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // Chat Sending Handler
  const handleSendMessage = async (text: string) => {
    if (!activeRole) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: Date.now(),
      roleId: activeRole.id,
      sender: 'user',
      text,
      time: timeStr,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Call API (Express / ThinkPHP 5 + Gemini or Persona Fallback)
    const result = await api.sendChatMessage(activeRole.id, text);

    let roleReply = '';
    if (result && result.reply) {
      roleReply = result.reply;
    } else {
      // Fallback
      roleReply = `我一直都在认真听你说话呢。关于“${text}”，我觉得你说的很有意思。`;
    }

    setTimeout(() => {
      setIsTyping(false);
      const roleMsg: ChatMessage = {
        id: Date.now() + 1,
        roleId: activeRole.id,
        sender: 'role',
        text: roleReply,
        time: timeStr,
        timestamp: Date.now() + 1,
      };
      setChatMessages((prev) => {
        const updated = [...prev, roleMsg];
        // Save to local cache
        const allHist = JSON.parse(localStorage.getItem('chatHistories') || '{}');
        allHist[activeRole.id] = updated;
        localStorage.setItem('chatHistories', JSON.stringify(allHist));
        return updated;
      });

      // Update conversations
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.roleId === activeRole.id);
        const newConv: Conversation = {
          name: activeRole.name,
          roleId: activeRole.id,
          emoji: activeRole.emoji,
          cover: activeRole.cover,
          lastMsg: roleReply,
          time: timeStr,
          unread: 0,
          updatedAt: Date.now(),
        };
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy.splice(existingIdx, 1);
          return [newConv, ...copy];
        } else {
          return [newConv, ...prev];
        }
      });
    }, 900);
  };

  // Follow / Unfollow Toggle
  const handleToggleFollow = async (roleId: string) => {
    await api.toggleFollow(roleId);
    setFollows((prev) => {
      const isAlready = prev.includes(roleId);
      if (isAlready) {
        showToast('已取消关注');
        return prev.filter((id) => id !== roleId);
      } else {
        showToast('关注成功！');
        return [...prev, roleId];
      }
    });
  };

  // Start chat with a role
  const startChatWithRole = (role: Role) => {
    setActiveRole(role);
    setDetailRole(null);
    setCurrentPage('chat');
  };

  // Filtered Roles for Home
  const filteredHomeRoles = roles.filter((r) => {
    const matchCategory =
      selectedCategory === '全部' ||
      r.tags.includes(selectedCategory) ||
      r.title.includes(selectedCategory);
    const matchSearch =
      !homeSearchKeyword ||
      r.name.includes(homeSearchKeyword) ||
      r.title.includes(homeSearchKeyword) ||
      r.desc.includes(homeSearchKeyword);
    return matchCategory && matchSearch;
  });

  // Filtered Roles for Explore Plaza
  const filteredExploreRoles = roles.filter((r) => {
    const matchCategory =
      selectedCategory === '全部' ||
      r.tags.includes(selectedCategory) ||
      r.title.includes(selectedCategory);
    const matchSearch =
      !exploreKeyword ||
      r.name.includes(exploreKeyword) ||
      r.title.includes(exploreKeyword) ||
      r.tags.some((t) => t.includes(exploreKeyword));
    return matchCategory && matchSearch;
  });

  return (
    <PhoneFrame onOpenDevCenter={() => setShowDevModal(true)}>
      <Toast message={toastMessage} />

      {/* 1. LOGIN / REGISTER PAGE */}
      {currentPage === 'login' && (
        <div id="page-login" className="h-full flex flex-col justify-between px-6 pt-10 pb-8 bg-gradient-to-b from-[#24133b] via-[#150a24] to-[#0a0a0f]">
          <div className="text-center pt-8">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl bg-purple-600/30 border border-purple-500/40 shadow-xl mb-4">
              💜
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">网巢</h1>
            <p className="text-xs text-purple-300/60 mt-1">遇见你的心动AI伴侣 · 智能拟真社交</p>
          </div>

          <div className="w-full my-auto space-y-4">
            <div className="space-y-3">
              <div className="flex items-center border-b border-white/20 pb-2.5 px-1">
                <span className="text-base mr-3 opacity-60">👤</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="用户名 / 手机号"
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
                />
              </div>

              <div className="flex items-center border-b border-white/20 pb-2.5 px-1">
                <span className="text-base mr-3 opacity-60">🔒</span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
                />
              </div>

              {loginMode === 'register' && (
                <div className="flex items-center border-b border-white/20 pb-2.5 px-1 animate-fade-in">
                  <span className="text-base mr-3 opacity-60">🔑</span>
                  <input
                    type="password"
                    value={confirmPwdInput}
                    onChange={(e) => setConfirmPwdInput(e.target.value)}
                    placeholder="请再次确认密码"
                    className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
                  />
                </div>
              )}
            </div>

            {loginTip && <div className="text-xs text-red-400 text-center">{loginTip}</div>}

            <button
              id="btn-login-submit"
              onClick={handleAuth}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition"
            >
              {loginMode === 'login' ? '登 录' : '注 册 账 号'}
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setLoginMode(loginMode === 'login' ? 'register' : 'login');
                  setLoginTip('');
                }}
                className="text-xs text-purple-300 hover:text-purple-200 transition"
              >
                {loginMode === 'login' ? '还没有账号？立即免费注册' : '已有网巢账号？直接登录'}
              </button>
            </div>
          </div>

          <div className="text-center pt-4">
            <div className="text-[11px] text-white/30 mb-3">其他第三方快捷体验</div>
            <div className="flex justify-center items-center gap-6">
              <button
                onClick={() => showToast('已模拟微信快捷一键登录')}
                className="w-10 h-10 rounded-full bg-[#07C160]/90 text-white flex items-center justify-center text-lg active:scale-90 transition shadow-sm"
              >
                💬
              </button>
              <button
                onClick={() => showToast('已模拟QQ快捷一键登录')}
                className="w-10 h-10 rounded-full bg-[#12B7F5]/90 text-white flex items-center justify-center text-lg active:scale-90 transition shadow-sm"
              >
                🐧
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOME PAGE */}
      {currentPage === 'home' && (
        <div id="page-home" className="h-full flex flex-col bg-gradient-to-b from-[#180e33] via-[#0b0a13] to-[#0a0a0f] overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-3 pb-2 shrink-0">
            <div className="text-xs text-purple-300/60 font-medium">✨ 欢迎来到网巢</div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200 tracking-tight">
              网巢
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-5 mb-3 shrink-0">
            <div className="flex items-center bg-white/8 hover:bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-md transition">
              <Search size={15} className="text-white/40 mr-2" />
              <input
                type="text"
                value={homeSearchKeyword}
                onChange={(e) => setHomeSearchKeyword(e.target.value)}
                placeholder="搜索角色名字、性格、标签..."
                className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="px-5 mb-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition font-medium ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm shadow-purple-500/25'
                    : 'bg-white/8 text-white/60 hover:text-white hover:bg-white/12'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Header */}
          <div className="px-5 py-1 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-white tracking-wide">为你推荐</h2>
            <button
              onClick={() => setCurrentPage('explore')}
              className="text-xs text-purple-300/80 hover:text-purple-200 flex items-center gap-0.5"
            >
              <span>查看全部</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Role Cards List */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 pb-24">
            {filteredHomeRoles.length === 0 ? (
              <div className="text-center py-16 text-white/40 text-xs">
                没有找到匹配的角色，试试其他标签或关键词
              </div>
            ) : (
              filteredHomeRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setDetailRole(role)}
                  className="flex bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition group shadow-sm"
                >
                  {/* Left Cover Banner */}
                  <div
                    className={`w-24 shrink-0 flex items-center justify-center text-4xl select-none ${role.cover}`}
                  >
                    {role.emoji}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                          {role.name}
                        </h3>
                        <span className="text-[11px] text-purple-300/80 bg-purple-500/15 px-2 py-0.5 rounded-md font-medium">
                          {role.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 mt-1.5 leading-relaxed font-light">
                        {role.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[11px] text-white/40">
                        {role.tags.slice(0, 2).map((t) => `#${t} `)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startChatWithRole(role);
                        }}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-[11px] text-white font-medium shadow-sm hover:opacity-90 active:scale-95 transition"
                      >
                        聊一聊
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. EXPLORE / ROLE SQUARE PAGE */}
      {currentPage === 'explore' && (
        <div id="page-explore" className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 shrink-0">
            <button
              onClick={() => setCurrentPage('home')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">角色广场</h2>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <div className="flex items-center bg-white/8 rounded-2xl px-3 py-2 border border-white/10">
              <Search size={14} className="text-white/40 mr-2" />
              <input
                type="text"
                value={exploreKeyword}
                onChange={(e) => setExploreKeyword(e.target.value)}
                placeholder="搜索角色名或性格标签..."
                className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="px-4 py-1 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-white/8 text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dual Column Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 pb-24">
            {filteredExploreRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => setDetailRole(role)}
                className="h-64 rounded-2xl overflow-hidden relative cursor-pointer group active:scale-95 transition border border-white/5 shadow-md flex flex-col justify-end"
              >
                {/* Cover with Emoji */}
                <div
                  className={`absolute inset-0 flex items-center justify-center text-7xl select-none ${role.cover}`}
                >
                  {role.emoji}
                </div>

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-[10px] text-white/90 border border-white/10">
                  {role.title}
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <h4 className="text-sm font-bold text-white">{role.name}</h4>
                  <div className="text-[10px] text-white/60 line-clamp-1 mt-0.5">
                    {role.tags.join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MESSAGES / CONVERSATIONS PAGE */}
      {currentPage === 'messages' && (
        <div id="page-messages" className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
          <div className="px-5 pt-3 pb-2 shrink-0">
            <h1 className="text-2xl font-black text-white tracking-wide">消息</h1>
            <p className="text-xs text-white/40 mt-0.5">随时与关注的心动角色畅聊</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 pb-24">
            {conversations.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-sm font-medium">暂无会话记录</div>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="mt-3 px-4 py-1.5 rounded-full bg-purple-600/30 text-purple-300 text-xs border border-purple-500/40 hover:bg-purple-600/50 transition"
                >
                  去首页挑选角色聊聊
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.roleId}
                  onClick={() => {
                    const found = roles.find((r) => r.id === conv.roleId);
                    if (found) startChatWithRole(found);
                  }}
                  className="flex items-center px-5 py-3.5 hover:bg-white/5 active:bg-white/8 cursor-pointer transition"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-3.5 shrink-0 select-none shadow-sm ${conv.cover}`}
                  >
                    {conv.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white truncate">{conv.name}</span>
                      <span className="text-[11px] text-white/40 font-mono">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/55 truncate pr-2">{conv.lastMsg}</p>
                      {conv.unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. PROFILE PAGE */}
      {currentPage === 'profile' && (
        <div id="page-profile" className="h-full overflow-y-auto pb-28 bg-[#0a0a0f] space-y-3.5">
          {/* Top Profile Card */}
          <div className="pt-6 pb-6 px-5 text-center bg-gradient-to-b from-[#2d1b4e] to-[#0a0a0f] border-b border-white/5">
            <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-2.5 border-2 border-white/20 shadow-xl">
              {userProfile.avatar}
            </div>
            <h2 className="text-lg font-bold text-white">{currentUser || userProfile.nickname}</h2>
            <div className="text-[11px] text-white/40 mt-0.5 font-mono">ID: {userProfile.id}</div>
            <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
              {userProfile.vip_text}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mx-4 bg-white/5 border border-white/10 rounded-2xl p-3 flex divide-x divide-white/10 backdrop-blur-md">
            <div className="flex-1 text-center">
              <div className="text-base font-bold text-purple-300">{roles.length}</div>
              <div className="text-[11px] text-white/40 mt-0.5">我的角色</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-bold text-pink-300">36</div>
              <div className="text-[11px] text-white/40 mt-0.5">对话天数</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-bold text-emerald-300">1.2w</div>
              <div className="text-[11px] text-white/40 mt-0.5">消息数</div>
            </div>
          </div>

          {/* Menu Section 1 */}
          <div className="mx-4 bg-white/[0.04] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
            <div
              onClick={() => setCurrentPage('follows')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <Heart size={17} className="text-pink-400" />
                <span className="text-xs font-medium text-white">我的关注</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-[11px]">
                  {follows.length}
                </span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div
              onClick={() => setCurrentPage('vip')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <Crown size={17} className="text-amber-400" />
                <span className="text-xs font-medium text-white">会员中心</span>
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <span className="text-[11px] text-amber-300/80">尊享特权</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div
              onClick={() => setCurrentPage('wallet')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <Wallet size={17} className="text-emerald-400" />
                <span className="text-xs font-medium text-white">我的钱包</span>
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <span className="text-[11px] text-emerald-400 font-mono">
                  ¥ {userProfile.money.toFixed(2)}
                </span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div
              onClick={() => setCurrentPage('favorites')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <Star size={17} className="text-yellow-400" />
                <span className="text-xs font-medium text-white">我的收藏</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </div>
          </div>

          {/* PWA Direct Install Card */}
          <div className="mx-4">
            <PWAInstallButton variant="full" />
          </div>

          {/* Menu Section 2 */}
          <div className="mx-4 bg-white/[0.04] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
            <div
              onClick={() => setCurrentPage('creator')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <PenTool size={17} className="text-indigo-400" />
                <span className="text-xs font-medium text-white">创作中心</span>
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                  创建新角色
                </span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div
              onClick={() => setShowDevModal(true)}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition bg-purple-950/20"
            >
              <div className="flex items-center gap-3">
                <Server size={17} className="text-purple-400" />
                <div>
                  <span className="text-xs font-semibold text-purple-200">
                    ThinkPHP 5 与 MySQL 5.6 源码
                  </span>
                  <div className="text-[10px] text-white/40">查看SQL建表与控制器代码</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-purple-300" />
            </div>

            <div
              onClick={() => setCurrentPage('settings')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <Settings size={17} className="text-gray-400" />
                <span className="text-xs font-medium text-white">设置</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </div>

            <div
              onClick={() => setCurrentPage('help')}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={17} className="text-blue-400" />
                <span className="text-xs font-medium text-white">帮助与反馈</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center justify-between p-3.5 hover:bg-red-500/10 cursor-pointer transition text-red-400"
            >
              <div className="flex items-center gap-3">
                <LogOut size={17} />
                <span className="text-xs font-medium">退出登录</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-PAGE: FOLLOWS */}
      {currentPage === 'follows' && (
        <div className="h-full flex flex-col bg-[#0a0a0f]">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 shrink-0">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">我的关注</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-28">
            {follows.length === 0 ? (
              <div className="text-center py-20 text-white/40 text-xs">
                还没有关注任何角色，快去首页发现心动角色吧
              </div>
            ) : (
              follows.map((id) => {
                const role = roles.find((r) => r.id === id);
                if (!role) return null;
                return (
                  <div
                    key={role.id}
                    onClick={() => startChatWithRole(role)}
                    className="flex items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-3 ${role.cover}`}
                    >
                      {role.emoji}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{role.name}</h4>
                      <p className="text-xs text-white/50">{role.title}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFollow(role.id);
                      }}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs hover:bg-red-500/20 hover:text-red-300 transition"
                    >
                      已关注
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 7. SUB-PAGE: VIP CENTER */}
      {currentPage === 'vip' && (
        <div className="h-full overflow-y-auto p-4 pb-28 bg-[#0a0a0f] space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">会员中心</h2>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider">💎 黄金终身会员</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-bold">
                生效中
              </span>
            </div>
            <div className="text-xl font-extrabold mt-3">有效期至 2026-12-31</div>
            <p className="text-[11px] text-black/80 mt-1">无限畅聊 · 专属拟真人格 · 解锁11位角色 · 纯净体验</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider">尊享权益清单</h3>
            <div className="space-y-2 text-xs text-white/75 leading-relaxed">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>无限次对话，不限字数与频率</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>解锁全部 11 位官方自研性格角色</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>支持创建自定义角色并入驻广场</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>优先体验拟真角色情感记忆库</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SUB-PAGE: WALLET */}
      {currentPage === 'wallet' && (
        <div className="h-full overflow-y-auto p-4 pb-28 bg-[#0a0a0f] space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">我的钱包</h2>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl">
            <div className="text-xs text-white/70">可用余额（元）</div>
            <div className="text-3xl font-extrabold my-2 font-mono">
              ¥ {userProfile.money.toFixed(2)}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowRechargeModal(true)}
                className="px-4 py-1.5 rounded-full bg-white text-purple-700 text-xs font-bold hover:bg-white/90 active:scale-95 transition"
              >
                充值
              </button>
              <button
                onClick={() => showToast('当前体验环境暂不开放提现')}
                className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition"
              >
                提现
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white font-mono">¥ 56.00</div>
              <div className="text-[11px] text-white/40 mt-0.5">创作分成待提</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white font-mono">{userProfile.score}</div>
              <div className="text-[11px] text-white/40 mt-0.5">可用互动积分</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-white/70 mb-2">最近交易明细 (MySQL 5.6)</h4>
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>10-01 会员充值返现</span>
                <span className="text-emerald-400 font-mono">+¥30.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>09-28 打赏角色咖啡</span>
                <span className="text-pink-400 font-mono">-¥6.00</span>
              </div>
              <div className="flex justify-between py-1">
                <span>09-25 微信快捷充值</span>
                <span className="text-emerald-400 font-mono">+¥68.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SUB-PAGE: FAVORITES */}
      {currentPage === 'favorites' && (
        <div className="h-full flex flex-col bg-[#0a0a0f] p-4 pb-28">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">我的收藏</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40 py-16">
            <div className="text-4xl mb-3">⭐</div>
            <div className="text-sm font-medium">还没有收藏内容</div>
            <p className="text-xs text-white/30 mt-1 max-w-xs">
              在与心动角色聊天时，点击更多操作即可收藏精彩对话语录
            </p>
          </div>
        </div>
      )}

      {/* 10. SUB-PAGE: CREATOR CENTER */}
      {currentPage === 'creator' && (
        <div className="h-full overflow-y-auto p-4 pb-28 bg-[#0a0a0f] space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">创作中心</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 hover:bg-purple-900/20 text-center transition"
            >
              <div className="text-3xl mb-1">✨</div>
              <div className="text-sm font-bold text-white">创建新角色</div>
              <div className="text-[10px] text-purple-300/60 mt-0.5">自定义人设与开场</div>
            </button>
            <button
              onClick={() => showToast('已展示你已上架的自制角色')}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-center transition"
            >
              <div className="text-3xl mb-1">📚</div>
              <div className="text-sm font-bold text-white">我的作品</div>
              <div className="text-[10px] text-white/40 mt-0.5">共上架 2 个角色</div>
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs text-white/60 mb-1">创作收益 (ThinkPHP 5 资金流水)</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">¥ 328.50</div>
            <div className="text-xs text-white/40 mt-1">已累计被聊 1.2w 次，获得打赏 42 次</div>
          </div>
        </div>
      )}

      {/* 11. SUB-PAGE: SETTINGS */}
      {currentPage === 'settings' && (
        <div className="h-full overflow-y-auto p-4 pb-28 bg-[#0a0a0f] space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">设置</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 text-xs text-white">
            <div className="p-3.5 flex items-center justify-between">
              <span>消息即时通知</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                已开启
              </span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span>应用深色外观</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                已开启
              </span>
            </div>
            <div
              onClick={() => showToast('本地缓存数据已清理完毕')}
              className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
            >
              <span>清除应用缓存</span>
              <span className="text-white/40 flex items-center gap-1">
                23.5 MB <ChevronRight size={13} />
              </span>
            </div>
            <div
              onClick={() => showToast('网巢移动端 APP v1.0.0 (TP5 + MySQL 5.6)')}
              className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
            >
              <span>关于网巢</span>
              <span className="text-white/40">v1.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* 12. SUB-PAGE: HELP & FEEDBACK */}
      {currentPage === 'help' && (
        <div className="h-full overflow-y-auto p-4 pb-28 bg-[#0a0a0f] space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-white">帮助与反馈</h2>
          </div>

          <div className="space-y-2.5">
            <div
              onClick={() => showToast('Q: 如何解锁更多角色？\nA: 在角色广场直接点击即可随时畅聊。')}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer transition"
            >
              <div className="text-xs font-bold text-white">📖 常见问题</div>
              <div className="text-[11px] text-white/40 mt-1">聊天没有回复？积分怎么获取？</div>
            </div>
            <div
              onClick={() => showToast('感谢你的反馈，我们将在下个版本持续优化！')}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer transition"
            >
              <div className="text-xs font-bold text-white">✉️ 意见反馈</div>
              <div className="text-[11px] text-white/40 mt-1">告诉我们你的使用建议或Bug</div>
            </div>
            <div
              onClick={() => showToast('网巢客服在线中 (工作日 9:00 - 18:00)')}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer transition"
            >
              <div className="text-xs font-bold text-white">💬 联系客服</div>
              <div className="text-[11px] text-white/40 mt-1">工作日 9:00 - 18:00 全程守候</div>
            </div>
          </div>
        </div>
      )}

      {/* 13. CHAT VIEW */}
      {currentPage === 'chat' && activeRole && (
        <ChatView
          role={activeRole}
          onBack={() => {
            setActiveRole(null);
            setCurrentPage('home');
          }}
          onSendMessage={handleSendMessage}
          messages={chatMessages}
          isTyping={isTyping}
          onShowToast={showToast}
          onClearHistory={() => {
            setChatMessages([]);
            const allHist = JSON.parse(localStorage.getItem('chatHistories') || '{}');
            delete allHist[activeRole.id];
            localStorage.setItem('chatHistories', JSON.stringify(allHist));
            showToast('已清空聊天记录');
          }}
        />
      )}

      {/* BOTTOM TAB BAR (Hidden in Chat and Login) */}
      {currentPage !== 'chat' && currentPage !== 'login' && (
        <nav
          id="app-bottom-tab-bar"
          className="absolute bottom-0 left-0 right-0 h-16 bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 z-40"
        >
          <button
            id="tab-home"
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center justify-center transition ${
              currentPage === 'home' ? 'text-purple-400 scale-105' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-1 font-medium">首页</span>
          </button>

          <button
            id="tab-messages"
            onClick={() => setCurrentPage('messages')}
            className={`flex flex-col items-center justify-center transition relative ${
              currentPage === 'messages' ? 'text-purple-400 scale-105' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-[10px] mt-1 font-medium">消息</span>
          </button>

          <button
            id="tab-profile"
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center justify-center transition ${
              currentPage === 'profile' ? 'text-purple-400 scale-105' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">我的</span>
          </button>
        </nav>
      )}

      {/* OVERLAY MODALS */}
      <DetailModal
        role={detailRole}
        isOpen={Boolean(detailRole)}
        isFollowed={detailRole ? follows.includes(detailRole.id) : false}
        onClose={() => setDetailRole(null)}
        onToggleFollow={() => {
          if (detailRole) handleToggleFollow(detailRole.id);
        }}
        onStartChat={startChatWithRole}
        onShowToast={showToast}
      />

      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSuccess={(newRole) => {
          setRoles((prev) => [newRole, ...prev]);
          setFollows((prev) => [newRole.id, ...prev]);
        }}
        onShowToast={showToast}
      />

      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRechargeSuccess={(amt) => {
          setUserProfile((prev) => ({
            ...prev,
            money: prev.money + amt,
          }));
        }}
        onShowToast={showToast}
      />

      <Tp5DevModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onShowToast={showToast}
      />
    </PhoneFrame>
  );
}
