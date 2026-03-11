import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import * as appointmentApi from '@/services/api/appointment';
import { normalizeAppointmentStatus, parseAppointmentDate } from '@/utils/appointment';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/types/appointment';

const sortAppointments = (appointments: Appointment[]) =>
  [...appointments].sort((a, b) => {
    const left = parseAppointmentDate(a.scheduledAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const right = parseAppointmentDate(b.scheduledAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });

const normalizeAppointments = (appointments: Appointment[]) => {
  const now = new Date();
  return sortAppointments(appointments.map((item) => normalizeAppointmentStatus(item, now)));
};

interface FetchOptions {
  silent?: boolean;
}

type FetchArgs = FetchOptions | unknown;

const isFetchOptions = (value: FetchArgs): value is FetchOptions =>
  typeof value === 'object' && value !== null && 'silent' in value;

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;

  fetch: {
    (): Promise<void>;
    (options: FetchOptions): Promise<void>;
    (event: unknown): Promise<void>;
  };
  add: (payload: CreateAppointmentInput) => Promise<void>;
  update: (id: number, payload: UpdateAppointmentInput) => Promise<void>;
  updateStatus: (id: number, status: AppointmentStatus) => Promise<void>;
  remove: (id: number) => Promise<void>;
  subscribe: (appointmentId: number, remindTimeIso: string) => Promise<void>;
  unsubscribe: (subscriptionId: number) => Promise<void>;
  clear: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  loading: false,
  error: null,

  fetch: async (arg?: FetchArgs) => {
    const silent = isFetchOptions(arg) ? (arg.silent ?? false) : false;
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const list = await appointmentApi.listAppointments();
      const normalized = normalizeAppointments(list);

      set((state) => ({
        appointments: normalized,
        loading: silent ? state.loading : false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取预约失败';

      set((state) => ({
        error: message,
        loading: silent ? state.loading : false,
      }));
      throw error;
    }
  },

  add: async (payload) => {
    set({ loading: true, error: null });
    try {
      const created = await appointmentApi.createAppointment(payload);
      set((state) => ({
        appointments: normalizeAppointments([...state.appointments, created]),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  update: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await appointmentApi.updateAppointment(id, payload);
      set((state) => ({
        appointments: normalizeAppointments(
          state.appointments.map((item) => (item.id === id ? updated : item))
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updated = await appointmentApi.updateAppointmentStatus(id, status);
      set((state) => ({
        appointments: normalizeAppointments(
          state.appointments.map((item) => (item.id === id ? updated : item))
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新预约状态失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await appointmentApi.deleteAppointment(id);
      set((state) => ({
        appointments: state.appointments.filter((item) => item.id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除预约失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  subscribe: async (appointmentId, remindTimeIso) => {
    set({ loading: true, error: null });
    try {
      const { STORAGE_KEYS } = await import('@/services/api/client');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
      if (!token) {
        throw new Error('未获取到推送 Token，请先授权通知权限');
      }

      const notifications = await import('@/services/api/notifications');
      await notifications.createSubscription({
        appointmentId,
        remindTime: remindTimeIso,
        channel: 'push',
        token,
      });
      set({ loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建提醒订阅失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  unsubscribe: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const notifications = await import('@/services/api/notifications');
      await notifications.deleteSubscription(subscriptionId);
      set({ loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消提醒订阅失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clear: () => set({ appointments: [], loading: false, error: null }),
}));
