import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: appJson.expo.name,
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
      apiBaseUrl: process.env.API_BASE_URL,
      eas: { projectId: "adb22529-846e-4b53-a8ab-78ead7c804f4" },
    },
  };
};
