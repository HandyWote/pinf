import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const orientation = (appJson.expo?.orientation as ExpoConfig['orientation']) || 'portrait';

  return {
    ...config,
    ...appJson.expo,
    orientation,
    extra: {
      ...(appJson.expo?.extra || {}),
      apiBaseUrl: process.env.API_BASE_URL || 'http://10.0.2.2:5010/api',
    },
  };
};
