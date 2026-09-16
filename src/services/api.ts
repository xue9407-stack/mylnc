import { Role, Conversation, ChatMessage, UserProfile, UserStats, WalletData, TP5ExportData } from '../types';

const BASE_URL = '/api/v1';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.code === 1) {
      return json.data as T;
    }
    return null;
  } catch (err) {
    console.warn(`API call ${endpoint} error:`, err);
    return null;
  }
}

export const api = {
  // 1. Roles
  async getRoles(category = '全部', keyword = ''): Promise<Role[]> {
    const params = new URLSearchParams();
    if (category && category !== '全部') params.set('category', category);
    if (keyword) params.set('keyword', keyword);
    const data = await fetchJson<Role[]>(`/role/list?${params.toString()}`);
    return data || [];
  },

  async getRoleDetail(id: string): Promise<Role | null> {
    return await fetchJson<Role>(`/role/detail/${id}`);
  },

  async toggleFollow(roleId: string): Promise<{ is_followed: boolean; total_follows: number } | null> {
    return await fetchJson<{ is_followed: boolean; total_follows: number }>('/role/follow', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId }),
    });
  },

  async createRole(roleData: Partial<Role>): Promise<Role | null> {
    return await fetchJson<Role>('/role/create', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  // 2. Chat
  async sendChatMessage(roleId: string, content: string): Promise<{ reply: string; time: string } | null> {
    return await fetchJson<{ reply: string; time: string }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId, content }),
    });
  },

  async getChatHistory(roleId: string): Promise<ChatMessage[]> {
    const data = await fetchJson<ChatMessage[]>(`/chat/history/${roleId}`);
    return data || [];
  },

  async getConversations(): Promise<Conversation[]> {
    const data = await fetchJson<Conversation[]>('/conversation/list');
    return data || [];
  },

  // 3. User & Wallet
  async login(username: string, password: string): Promise<any> {
    return await fetchJson<any>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(username: string, password: string): Promise<any> {
    return await fetchJson<any>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getUserProfile(): Promise<{ user: UserProfile; stats: UserStats } | null> {
    return await fetchJson<{ user: UserProfile; stats: UserStats }>('/user/profile');
  },

  async getWalletInfo(): Promise<WalletData | null> {
    return await fetchJson<WalletData>('/wallet/info');
  },

  async rechargeWallet(amount: number): Promise<{ new_balance: string } | null> {
    return await fetchJson<{ new_balance: string }>('/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // 4. Developer / TP5 Source Code Export
  async getTP5Export(): Promise<TP5ExportData | null> {
    return await fetchJson<TP5ExportData>('/tp5/export');
  },
};
