import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node', globals: true, include: ['utils/__tests__/ageCalculator.test.ts'] },
  resolve: { alias: { 'react-native': 'react-native-web' } },
});
