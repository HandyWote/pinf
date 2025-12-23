import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: appJson.expo.name,
    slug: appJson.expo.slug,
    version: appJson.expo.version,
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
      apiBaseUrl: process.env.API_BASE_URL || 'http://10.0.2.2:5010/api',
    },
  };
};
