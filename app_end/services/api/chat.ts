import { api } from './client';
import type { ChatMessage, ChatPagination, SendChatPayload } from '@/types/chat';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface ChatSendData {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}

interface ChatHistoryApiResponse extends ApiResponse<ChatMessage[]> {
  pagination: ChatPagination;
}

export interface ChatHistoryParams {
  page?: number;
  per_page?: number;
  babyId?: number;
}

export const sendChatMessage = async (payload: SendChatPayload): Promise<ChatSendData> => {
  const res = await api.post<ApiResponse<ChatSendData>>('/chat/send', payload);
  return res.data.data;
};

export const getChatHistory = async (
  params?: ChatHistoryParams
): Promise<{ messages: ChatMessage[]; pagination: ChatPagination }> => {
  const res = await api.get<ChatHistoryApiResponse>('/chat/history', params);
  return {
    messages: res.data.data,
    pagination: res.data.pagination,
  };
};

export const clearChatHistory = async (params?: Pick<ChatHistoryParams, 'babyId'>): Promise<void> => {
  await api.delete('/chat/history', params);
};
