import { create } from 'zustand';
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatus,
} from '@/types/appointment';
import * as appointmentApi from '@/services/api/appointment';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  add: (payload: CreateAppointmentInput) => Promise<void>;
  update: (id: number, payload: UpdateAppointmentInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
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

  clear: () => set({ appointments: [], loading: false, error: null }),
}));
