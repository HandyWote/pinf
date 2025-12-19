import { create } from 'zustand';
import type { GrowthRecord, CreateGrowthInput, UpdateGrowthInput, GrowthMetric } from '@/types/growth';
import * as growthApi from '@/services/api/growth';

interface GrowthState {
  records: Record<number, GrowthRecord[]>;
  loading: boolean;
  error: string | null;

  fetch: (babyId: number) => Promise<void>;
  add: (babyId: number, payloads: Array<CreateGrowthInput>) => Promise<void>;
  update: (recordId: number, payload: UpdateGrowthInput) => Promise<void>;
  remove: (recordId: number, babyId: number) => Promise<void>;
  clear: () => void;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  records: {},
  loading: false,
  error: null,

  fetch: async (babyId: number) => {
    set({ loading: true, error: null });
    try {
      const list = await growthApi.listGrowth(babyId);
      const sorted = [...list].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );
      set((state) => ({ records: { ...state.records, [babyId]: sorted }, loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取成长记录失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  add: async (babyId: number, payloads: Array<CreateGrowthInput>) => {
    set({ loading: true, error: null });
    try {
      for (const payload of payloads) {
        await growthApi.createGrowth(babyId, payload);
      }
      await get().fetch(babyId);
    } catch (error) {
      const message = error instanceof Error ? error.message : '新增成长记录失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  update: async (recordId: number, payload: UpdateGrowthInput) => {
    set({ loading: true, error: null });
    try {
      const updated = await growthApi.updateGrowth(recordId, payload);
      set((state) => {
        const babyEntry = Object.entries(state.records).find(([, list]) =>
          list.some((item) => item.id === recordId)
        );
        if (!babyEntry) {
          return { loading: false };
        }
        const [babyId, list] = babyEntry;
        const next = list.map((item) => (item.id === recordId ? updated : item));
        return { records: { ...state.records, [Number(babyId)]: next }, loading: false };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新成长记录失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  remove: async (recordId: number, babyId: number) => {
    set({ loading: true, error: null });
    try {
      await growthApi.deleteGrowth(recordId);
      set((state) => {
        const list = state.records[babyId] || [];
        const next = list.filter((item) => item.id !== recordId);
        return { records: { ...state.records, [babyId]: next }, loading: false };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除成长记录失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clear: () => set({ records: {}, loading: false, error: null }),
}));
