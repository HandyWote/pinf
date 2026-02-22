import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export type PushRegisterFailReason =
  | 'web_not_supported'
  | 'not_physical_device'
  | 'permission_denied'
  | 'token_empty'
  | 'token_request_failed'
  | 'unknown';

export interface PushRegisterResult {
  token: string | null;
  reason?: PushRegisterFailReason;
  message?: string;
  projectId?: string | null;
  permissionStatus?: string;
}

let notificationHandlerRegistered = false;
let notificationChannelConfigured = false;

export function getExpoProjectId(): string | null {
  const fromEasConfig = Constants.easConfig?.projectId;
  if (fromEasConfig) return fromEasConfig;

  const extra = Constants.expoConfig?.extra as
    | {
        eas?: {
          projectId?: string;
        };
      }
    | undefined;

  return extra?.eas?.projectId || null;
}

async function ensureNotificationHandler() {
  if (notificationHandlerRegistered || Platform.OS === 'web') return;

  const Notifications = await import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  notificationHandlerRegistered = true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || notificationChannelConfigured) return;

  const Notifications = await import('expo-notifications');
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
  notificationChannelConfigured = true;
}

async function ensureNotificationPermission(): Promise<{ granted: boolean; status: string }> {
  const Notifications = await import('expo-notifications');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return { granted: finalStatus === 'granted', status: finalStatus };
}

async function requestExpoToken(projectId: string | null) {
  const Notifications = await import('expo-notifications');
  let lastError: unknown = null;

  if (projectId) {
    try {
      const tokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenObj.data?.trim();
      if (token) return { token };
    } catch (error) {
      lastError = error;
      console.warn('Push: getExpoPushTokenAsync(projectId) failed, fallback to legacy API', error);
    }
  }

  try {
    const tokenObj = await Notifications.getExpoPushTokenAsync();
    const token = tokenObj.data?.trim();
    if (token) return { token };
  } catch (error) {
    lastError = error;
    console.warn('Push: getExpoPushTokenAsync() fallback failed', error);
  }

  return { token: null as string | null, error: lastError };
}

export async function registerForPushNotificationsDetailedAsync(): Promise<PushRegisterResult> {
  try {
    if (Platform.OS === 'web') {
      return { token: null, reason: 'web_not_supported', message: 'Web 平台不支持 Expo Push token。' };
    }

    if (!Device.isDevice) {
      return { token: null, reason: 'not_physical_device', message: '请在真机上测试推送 token。' };
    }

    await ensureNotificationHandler();
    await ensureAndroidChannel();

    const permission = await ensureNotificationPermission();
    if (!permission.granted) {
      return {
        token: null,
        reason: 'permission_denied',
        message: '通知权限未授予。',
        permissionStatus: permission.status,
      };
    }

    const projectId = getExpoProjectId();
    const tokenResp = await requestExpoToken(projectId);
    const token = tokenResp.token?.trim() || null;
    if (!token) {
      const errMsg =
        tokenResp.error instanceof Error ? tokenResp.error.message : String(tokenResp.error || '');
      return {
        token: null,
        reason: tokenResp.error ? 'token_request_failed' : 'token_empty',
        message: errMsg || 'Expo 返回空 token，请检查网络、projectId 与构建配置。',
        projectId,
        permissionStatus: permission.status,
      };
    }

    try {
      const { STORAGE_KEYS } = await import('@/services/api/client');
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    } catch (error) {
      console.warn('store push token failed', error);
    }

    try {
      const devices = await import('@/services/api/devices');
      await devices.registerDevice({ token, platform: Platform.OS });
    } catch (error) {
      console.warn('device register failed (ignored)', error);
    }

    return {
      token,
      projectId,
      permissionStatus: permission.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('registerForPushNotificationsDetailedAsync error:', error);
    return {
      token: null,
      reason: 'unknown',
      message,
      projectId: getExpoProjectId(),
    };
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const result = await registerForPushNotificationsDetailedAsync();
  if (!result.token) {
    console.warn('Push token unavailable:', result);
  }
  return result.token;
}

export async function sendLocalTestNotificationAsync(title?: string, body?: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') return false;

    await ensureNotificationHandler();
    await ensureAndroidChannel();
    const permission = await ensureNotificationPermission();
    if (!permission.granted) {
      console.warn('Local notification blocked: permission not granted');
      return false;
    }

    const Notifications = await import('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || '本地测试通知',
        body: body || '这是一条本地通知，用于验证系统通知栏弹出。',
      },
      trigger: null,
    });
    return true;
  } catch (error) {
    console.warn('sendLocalTestNotificationAsync failed', error);
    return false;
  }
}
