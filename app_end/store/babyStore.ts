/**
 * 宝宝管理状态
 * 管理宝宝列表、当前选中的宝宝、本地缓存
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Baby, CreateBabyInput, UpdateBabyInput } from '@/types/baby';
import * as babyApi from '@/services/api/baby';

const STORAGE_KEY_BABIES_LIST = 'babies.list';
const STORAGE_KEY_CURRENT_BABY_ID = 'babies.currentId';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBabies: () => Promise<void>;
  selectBaby: (babyId: number) => void;
  createBaby: (data: CreateBabyInput) => Promise<Baby>;
  updateBaby: (id: number, data: UpdateBabyInput) => Promise<Baby>;
  deleteBaby: (id: number) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;

  // 内部辅助方法
  _syncToStorage: () => Promise<void>;
  _loadFromStorage: () => Promise<void>;
}

export const useBabyStore = create<BabyState>((set: any, get: any) => ({
  babies: [],
  currentBaby: null,
  isLoading: false,
  error: null,

  /**
   * 从服务器获取宝宝列表
   */
  fetchBabies: async () => {
    set({ isLoading: true, error: null });
    try {
      const babies = await babyApi.getBabies();
      set({ babies, isLoading: false });

      // 同步到本地缓存
      await get()._syncToStorage();

      // 如果当前没有选中的宝宝且列表不为空，自动选中第一个
      const { currentBaby } = get();
      if (!currentBaby && babies.length > 0) {
        get().selectBaby(babies[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取宝宝列表失败';
      set({ error: message, isLoading: false });
      console.error('Failed to fetch babies:', error);
      
      // 失败时尝试从缓存加载
      await get()._loadFromStorage();
    }
  },

  /**
   * 选择当前宝宝
   */
  selectBaby: (babyId: number) => {
    const { babies } = get();
    const baby = babies.find((b: Baby) => b.id === babyId);
    if (baby) {
      set({ currentBaby: baby });
      // 保存选择到本地
      AsyncStorage.setItem(STORAGE_KEY_CURRENT_BABY_ID, String(babyId)).catch(console.error);
    }
  },

  /**
   * 创建宝宝
   */
  createBaby: async (data: CreateBabyInput) => {
    set({ isLoading: true, error: null });
    try {
      const newBaby = await babyApi.createBaby(data);
      
      // 更新列表
      const babies = [newBaby, ...get().babies];
      set({ babies, isLoading: false });

      // 自动选中新创建的宝宝
      get().selectBaby(newBaby.id);

      // 同步到缓存
      await get()._syncToStorage();

      return newBaby;
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建宝宝失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * 更新宝宝信息
   */
  updateBaby: async (id: number, data: UpdateBabyInput) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBaby = await babyApi.updateBaby(id, data);
      
      // 更新列表中的宝宝
      const babies = get().babies.map((b: Baby) => (b.id === id ? updatedBaby : b));
      set({ babies, isLoading: false });

      // 如果更新的是当前选中的宝宝，也更新 currentBaby
      if (get().currentBaby?.id === id) {
        set({ currentBaby: updatedBaby });
      }

      // 同步到缓存
      await get()._syncToStorage();

      return updatedBaby;
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新宝宝失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * 删除宝宝
   */
  deleteBaby: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await babyApi.deleteBaby(id);
      
      // 从列表中移除
      const babies = get().babies.filter((b: Baby) => b.id !== id);
      set({ babies, isLoading: false });

      // 如果删除的是当前选中的宝宝，自动选中第一个
      if (get().currentBaby?.id === id) {
        if (babies.length > 0) {
          get().selectBaby(babies[0].id);
        } else {
          set({ currentBaby: null });
        }
      }

      // 同步到缓存
      await get()._syncToStorage();
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除宝宝失败';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * 初始化：从缓存加载，然后从服务器刷新
   */
  initialize: async () => {
    // 先从缓存加载
    await get()._loadFromStorage();
    
    // 然后从服务器刷新
    await get().fetchBabies();
  },

  /**
   * 清除错误信息
   */
  clearError: () => set({ error: null }),

  /**
   * 同步到本地存储
   */
  _syncToStorage: async () => {
    try {
      const { babies } = get();
      await AsyncStorage.setItem(STORAGE_KEY_BABIES_LIST, JSON.stringify(babies));
    } catch (error) {
      console.error('Failed to sync babies to storage:', error);
    }
  },

  /**
   * 从本地存储加载
   */
  _loadFromStorage: async () => {
    try {
      const [babiesJson, currentIdStr] = await AsyncStorage.multiGet([
        STORAGE_KEY_BABIES_LIST,
        STORAGE_KEY_CURRENT_BABY_ID,
      ]);

      const babies: Baby[] = babiesJson[1] ? JSON.parse(babiesJson[1]) : [];
      const currentId = currentIdStr[1] ? parseInt(currentIdStr[1], 10) : null;

      set({ babies });

      // 恢复选中的宝宝
      if (currentId && babies.length > 0) {
        const baby = babies.find((b: Baby) => b.id === currentId);
        if (baby) {
          set({ currentBaby: baby });
        } else if (babies.length > 0) {
          // 如果保存的 ID 找不到，默认选第一个
          set({ currentBaby: babies[0] });
        }
      } else if (babies.length > 0) {
        set({ currentBaby: babies[0] });
      }
    } catch (error) {
      console.error('Failed to load babies from storage:', error);
    }
  },
}));
