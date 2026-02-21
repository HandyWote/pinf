import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

/**
 * 在真机上请求推送权限并返回 Expo Push Token（或 null）
 * 最小侵入实现：供 Demo 与后续集成使用
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return null;
    }

    const Notifications = await import('expo-notifications');

    if (!Device.isDevice) {
      console.warn('Push: not a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push permission not granted');
      return null;
    }

    const tokenObj = await Notifications.getExpoPushTokenAsync();
    const token = tokenObj.data ?? null;

    // 持久化到本地 storage，便于后续随订阅上报
    try {
      const { STORAGE_KEYS } = await import('@/services/api/client');
      if (token) await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    } catch (err) {
      // 不影响主流程
      console.warn('store push token failed', err);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // 尝试向后端注册（若用户已登录且 API 可达）
    try {
      const devices = await import('@/services/api/devices');
      if (token) {
        await devices.registerDevice({ token, platform: Platform.OS });
      }
    } catch (err) {
      // 忽略注册失败（可能未登录或后端不可达）
      console.warn('device register failed (ignored)', err);
    }

    return token as string | null;
  } catch (err) {
    console.warn('registerForPushNotificationsAsync error:', err);
    return null;
  }
}
