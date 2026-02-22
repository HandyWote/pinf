import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import * as appointmentApi from '@/services/api/appointment';
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from '@/types/appointment';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  add: (payload: CreateAppointmentInput) => Promise<void>;
  update: (id: number, payload: UpdateAppointmentInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  subscribe: (appointmentId: number, remindTime: string) => Promise<void>;
  unsubscribe: (id: number) => Promise<void>;
  clear: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const list = await appointmentApi.listAppointments();
      const sorted = [...list].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
      set({ appointments: sorted, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  add: async (payload: CreateAppointmentInput) => {
    set({ loading: true, error: null });
    try {
      await appointmentApi.createAppointment(payload);
      await get().fetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  update: async (id: number, payload: UpdateAppointmentInput) => {
    set({ loading: true, error: null });
    try {
      await appointmentApi.updateAppointment(id, payload);
      await get().fetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  remove: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await appointmentApi.deleteAppointment(id);
      await get().fetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  subscribe: async (appointmentId: number, remindTimeIso: string) => {
    set({ loading: true, error: null });
    try {
      const { STORAGE_KEYS } = await import('@/services/api/client');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
      if (!token) {
        throw new Error('未获取到推送 Token，请先授权通知权限');
      }

      const notifications = await import('@/services/api/notifications');
      const payload = {
        appointmentId,
        remindTime: remindTimeIso,
        channel: 'push',
        token,
      };

      await notifications.createSubscription(payload);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订阅失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  unsubscribe: async (subscriptionId: number) => {
    set({ loading: true, error: null });
    try {
      const notifications = await import('@/services/api/notifications');
      await notifications.deleteSubscription(subscriptionId);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消订阅失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clear: () => set({ appointments: [], loading: false, error: null }),
}));
