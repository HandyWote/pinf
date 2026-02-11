export type ChatRole = 'user' | 'ai' | 'system';
export type ChatMessageStatus = 'sent' | 'failed';

export interface ChatMessage {
  id: number;
  messageId: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  status: ChatMessageStatus;
}

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
  timestamp?: number;
  messageId?: string;
}

export interface ChatPagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SendChatPayload {
  content: string;
  babyId?: number;
  messageId?: string;
  history?: ChatHistoryItem[];
  metadata?: Record<string, unknown>;
  params?: Record<string, unknown>;
}
