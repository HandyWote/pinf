import { api } from './client';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const registerDevice = async (payload: { token: string; platform?: string }) => {
  const res = await api.post<ApiResponse<any>>('/devices', payload);
  return res.data.data;
};

export const listDevices = async () => {
  const res = await api.get<ApiResponse<any[]>>('/devices');
  return res.data.data;
};

export const unregisterDevice = async (id: number) => {
  await api.delete(`/devices/${id}`);
};
