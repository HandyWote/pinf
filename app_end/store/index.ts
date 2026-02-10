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
  needSetPassword?: boolean;
}

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needSetPassword: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string, needSetPassword: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setNeedSetPassword: (needSetPassword: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  needSetPassword: false,

  setUser: (user) => {
    AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)).catch(console.error);
    set({ user, isAuthenticated: !!user });
  },
  
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (user, token, needSetPassword) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)],
      [STORAGE_KEYS.NEED_SET_PASSWORD, String(needSetPassword)],
    ]);
    set({ user, token, isAuthenticated: true, needSetPassword });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.NEED_SET_PASSWORD,
    ]);
    set({ user: null, token: null, isAuthenticated: false, needSetPassword: false });
  },

  initialize: async () => {
    try {
      const [token, userJson, needSetPassword] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.NEED_SET_PASSWORD,
      ]);

      const storedToken = token[1];
      const storedUser: User | null = userJson[1] ? JSON.parse(userJson[1]) : null;
      const storedNeedSetPassword = needSetPassword[1];
      const normalizedNeedSetPassword =
        storedNeedSetPassword === null && storedUser?.needSetPassword !== undefined
          ? !!storedUser.needSetPassword
          : storedNeedSetPassword === 'true';

      set({
        token: storedToken,
        user: storedUser,
        isAuthenticated: !!(storedToken && storedUser),
        needSetPassword: normalizedNeedSetPassword,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      set({ isLoading: false });
    }
  },

  setNeedSetPassword: (needSetPassword) => {
    AsyncStorage.setItem(STORAGE_KEYS.NEED_SET_PASSWORD, String(needSetPassword)).catch(
      console.error
    );
    set({ needSetPassword });
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
