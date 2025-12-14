/**
 * 全局状态管理
 * 使用 Zustand 管理应用状态
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/services/api';

// 用户信息类型
export interface User {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
}

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (user, token) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)],
    ]);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_PROFILE,
    ]);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const [token, userJson] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
      ]);

      const storedToken = token[1];
      const storedUser = userJson[1] ? JSON.parse(userJson[1]) : null;

      set({
        token: storedToken,
        user: storedUser,
        isAuthenticated: !!(storedToken && storedUser),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      set({ isLoading: false });
    }
  },
}));

// 应用配置状态
interface AppState {
  isOnline: boolean;
  lastSyncTime: number | null;
  
  setOnline: (isOnline: boolean) => void;
  updateSyncTime: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  lastSyncTime: null,

  setOnline: (isOnline) => set({ isOnline }),
  
  updateSyncTime: () => set({ lastSyncTime: Date.now() }),
}));
