import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

const DEFAULT_API_BASE_URL = 'https://backend.pinf.top/api';

const normalizeApiBaseUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed.replace(/\/+$/, '');
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.API_BASE_URL) || DEFAULT_API_BASE_URL;

  return {
    ...config,
    name: appJson.expo.name,
    owner: 'handywotes-organization',
    slug: appJson.expo.slug,
    version: process.env.APP_VERSION || appJson.expo.version,
    orientation: appJson.expo.orientation as ExpoConfig['orientation'],
    icon: appJson.expo.icon,
    scheme: appJson.expo.scheme,
    userInterfaceStyle: appJson.expo.userInterfaceStyle as ExpoConfig['userInterfaceStyle'],
    newArchEnabled: appJson.expo.newArchEnabled,
    ios: appJson.expo.ios,
    android: appJson.expo.android as ExpoConfig['android'],
    web: appJson.expo.web as ExpoConfig['web'],
    plugins: appJson.expo.plugins as ExpoConfig['plugins'],
    experiments: appJson.expo.experiments,
    extra: {
      // 构建时规范化，避免空白/尾斜杠/非法协议值进入运行时
      apiBaseUrl,
      eas: { projectId: "adb22529-846e-4b53-a8ab-78ead7c804f4" },
    },
  };
};
