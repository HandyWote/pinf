/**
 * 通知 / 订阅 API
 */
import { api } from './client';
import type { NotificationSubscription } from '../../types/notification';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const listSubscriptions = async (): Promise<NotificationSubscription[]> => {
  const res = await api.get<ApiResponse<NotificationSubscription[]>>('/notifications/subscriptions');
  return res.data.data;
};

export const createSubscription = async (payload: { appointmentId: number; remindTime: string; channel?: string; token?: string; }): Promise<NotificationSubscription> => {
  const res = await api.post<ApiResponse<NotificationSubscription>>('/notifications/subscriptions', payload);
  return res.data.data;
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await api.delete(`/notifications/subscriptions/${id}`);
};

export const testSendSubscription = async (subscriptionId: number): Promise<NotificationSubscription> => {
  const res = await api.post<ApiResponse<NotificationSubscription>>('/notifications/test-send', { subscriptionId });
  return res.data.data;
};
