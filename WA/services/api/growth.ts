/**
 * 成长记录 API
 */
import { api } from './client';
import type { CreateGrowthInput, GrowthRecord, UpdateGrowthInput } from '@/types/growth';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const listGrowth = async (babyId: number): Promise<GrowthRecord[]> => {
  const res = await api.get<ApiResponse<GrowthRecord[]>>(`/babies/${babyId}/growth`);
  return res.data.data;
};

export const createGrowth = async (
  babyId: number,
  payload: CreateGrowthInput
): Promise<GrowthRecord> => {
  const res = await api.post<ApiResponse<GrowthRecord>>(`/babies/${babyId}/growth`, payload);
  return res.data.data;
};

export const updateGrowth = async (
  id: number,
  payload: UpdateGrowthInput
): Promise<GrowthRecord> => {
  const res = await api.put<ApiResponse<GrowthRecord>>(`/growth/${id}`, payload);
  return res.data.data;
};

export const deleteGrowth = async (id: number): Promise<void> => {
  await api.delete(`/growth/${id}`);
};
