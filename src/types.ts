export interface Role {
  id: string;
  name: string;
  title: string;
  emoji: string;
  cover: string;
  desc: string;
  tags: string[];
  topics: string[];
  users: string;
  follows: string;
  rating: number;
  is_official?: number;
  is_followed?: boolean;
}

export interface Conversation {
  name: string;
  roleId: string;
  emoji: string;
  cover: string;
  lastMsg: string;
  time: string;
  unread: number;
  updatedAt?: number;
}

export interface ChatMessage {
  id: number;
  roleId: string;
  sender: 'user' | 'role';
  text: string;
  time: string;
  timestamp: number;
}

export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  money: number;
  score: number;
  vip_level: number;
  vip_text: string;
}

export interface UserStats {
  roles_count: number;
  chat_days: number;
  messages_count: string | number;
  follows_count: number;
}

export interface WalletData {
  balance: string;
  withdrawable: string;
  score: number;
  logs: Array<{
    id: number;
    type: string;
    amount: number;
    remark: string;
    date: string;
  }>;
}

export interface TP5ExportData {
  sql: string;
  dbConfig: string;
  routes: string;
  chatController: string;
  deployGuide: string;
}

export type AppPage =
  | 'login'
  | 'home'
  | 'explore'
  | 'messages'
  | 'profile'
  | 'chat'
  | 'follows'
  | 'vip'
  | 'wallet'
  | 'favorites'
  | 'creator'
  | 'settings'
  | 'help';
