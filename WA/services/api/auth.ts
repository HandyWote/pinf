/**
 * 认证相关 API 服务
 */

import { api } from './client';

export interface SendCodeResponse {
  status: string;
  message: string;
  data: {
    message: string;
    code?: string; // 开发模式下会返回验证码
    debug?: string;
  };
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      phone: string;
      wxOpenid?: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      needSetPassword?: boolean;
    };
    need_set_password: boolean;
  };
}

/**
 * 发送手机验证码
 */
export const sendPhoneCode = async (phone: string) => {
  const response = await api.post<SendCodeResponse>('/auth/phone/code', { phone });
  return response.data;
};

/**
 * 手机号验证码登录
 */
export const phoneLogin = async (phone: string, code: string) => {
  const response = await api.post<LoginResponse>('/auth/phone/login', { phone, code });
  return response.data;
};

/**
 * 手机号 + 密码登录
 */
export const passwordLogin = async (phone: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/password/login', { phone, password });
  return response.data;
};

/**
 * 设置登录密码
 */
export const setupPassword = async (password: string) => {
  const response = await api.post<{ status: string; message: string; data: { user: LoginResponse['data']['user'] } }>(
    '/auth/password/setup',
    { password }
  );
  return response.data;
};

/**
 * 微信登录（可选，暂时保留）
 */
export const wechatLogin = async (code: string) => {
  const response = await api.post<LoginResponse>('/auth/wechat', { code });
  return response.data;
};
