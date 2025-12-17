/**
 * 宝宝管理 API 服务
 */

import { api } from './client';
import type { Baby, CreateBabyInput, UpdateBabyInput } from '@/types/baby';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * 获取宝宝列表
 */
export const getBabies = async (): Promise<Baby[]> => {
  const response = await api.get<ApiResponse<Baby[]>>('/babies');
  return response.data.data;
};

/**
 * 获取单个宝宝信息
 */
export const getBabyById = async (id: number): Promise<Baby> => {
  const response = await api.get<ApiResponse<Baby>>(`/babies/${id}`);
  return response.data.data;
};

/**
 * 创建宝宝
 */
export const createBaby = async (data: CreateBabyInput): Promise<Baby> => {
  const response = await api.post<ApiResponse<Baby>>('/babies', data);
  return response.data.data;
};

/**
 * 更新宝宝信息
 */
export const updateBaby = async (id: number, data: UpdateBabyInput): Promise<Baby> => {
  const response = await api.put<ApiResponse<Baby>>(`/babies/${id}`, data);
  return response.data.data;
};

/**
 * 删除宝宝
 */
export const deleteBaby = async (id: number): Promise<void> => {
  await api.delete(`/babies/${id}`);
};
