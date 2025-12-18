/**
 * HTTP 客户端封装
 * 基于 axios，实现 token 管理、请求拦截、错误处理
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储键常量
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  USER_PROFILE: 'user.profile',
  NEED_SET_PASSWORD: 'auth.need_set_password',
} as const;

// 配置
// Android 模拟器使用 10.0.2.2 访问宿主机的 localhost
// 真机或其他模拟器使用局域网 IP 192.168.8.101
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:5010/api' : 'https://api.example.com/api';
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve token from storage:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 401 和通用错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // 401 未授权：清除 token 并触发登出
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_PROFILE]);
        // 这里应该触发全局登出事件或导航到登录页
        // 可以通过 event emitter 或全局状态管理实现
        console.log('Token expired, user logged out');
      } catch (storageError) {
        console.error('Failed to clear storage on 401:', storageError);
      }

      return Promise.reject(error);
    }

    // 网络错误重试策略
    if (
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      !error.response
    ) {
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        
        // 指数退避
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClient(originalRequest);
      }
    }

    // 统一错误提示（这里简化处理，实际应该用 toast 组件）
    const errorMessage = extractErrorMessage(error);
    console.error('API Error:', errorMessage);

    return Promise.reject(error);
  }
);

/**
 * 提取错误信息
 */
function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || data.detail || 'Request failed';
  }
  
  if (error.message === 'Network Error') {
    return '网络连接失败，请检查网络设置';
  }
  
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试';
  }
  
  return error.message || '未知错误';
}

/**
 * API 方法封装
 */
export const api = {
  /**
   * GET 请求
   */
  get: <T = any>(url: string, params?: any) => {
    return apiClient.get<T>(url, { params });
  },

  /**
   * POST 请求
   */
  post: <T = any>(url: string, data?: any) => {
    return apiClient.post<T>(url, data);
  },

  /**
   * PUT 请求
   */
  put: <T = any>(url: string, data?: any) => {
    return apiClient.put<T>(url, data);
  },

  /**
   * DELETE 请求
   */
  delete: <T = any>(url: string, params?: any) => {
    return apiClient.delete<T>(url, { params });
  },

  /**
   * PATCH 请求
   */
  patch: <T = any>(url: string, data?: any) => {
    return apiClient.patch<T>(url, data);
  },
};

/**
 * Token 管理工具
 */
export const tokenManager = {
  /**
   * 保存 token
   */
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * 获取 token
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * 清除 token
   */
  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * 检查是否已登录
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};

export default apiClient;
