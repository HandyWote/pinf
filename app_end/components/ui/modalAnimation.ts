import { Platform } from 'react-native';

export function getUseNativeDriver(): boolean {
  return Platform.OS !== 'web';
}
