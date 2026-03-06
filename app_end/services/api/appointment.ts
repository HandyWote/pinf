/**
 * 预约接口
 */
import { api } from './client';
import type {
  Appointment,
  AppointmentSummary,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/types/appointment';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const listAppointments = async (): Promise<Appointment[]> => {
  const res = await api.get<ApiResponse<Appointment[]>>('/appointments');
  return res.data.data;
};

export const createAppointment = async (
  payload: CreateAppointmentInput
): Promise<Appointment> => {
  const res = await api.post<ApiResponse<Appointment>>('/appointments', payload);
  return res.data.data;
};

export const getAppointmentSummary = async (windowDays = 3): Promise<AppointmentSummary> => {
  const res = await api.get<ApiResponse<AppointmentSummary>>('/appointments/summary', { windowDays });
  return res.data.data;
};

export const updateAppointment = async (
  id: number,
  payload: UpdateAppointmentInput
): Promise<Appointment> => {
  const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
  return res.data.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await api.delete(`/appointments/${id}`);
};
