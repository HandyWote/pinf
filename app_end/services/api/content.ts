/**
 * 内容课堂接口
 */
import { api } from './client';
import type { ContentArticle, ContentPagination } from '@/types/content';

interface ApiListResponse<T> {
  status: string;
  message?: string;
  data: T;
  pagination: ContentPagination;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface ContentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
}

export const listArticles = async (params?: ContentListParams) => {
  const res = await api.get<ApiListResponse<ContentArticle[]>>('/content/articles', params);
  return res.data;
};

export const getArticleDetail = async (id: number) => {
  const res = await api.get<ApiResponse<ContentArticle>>(`/content/articles/${id}`);
  return res.data.data;
};
