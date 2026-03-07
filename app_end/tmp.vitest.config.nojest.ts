import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node', globals: true, setupFiles: ['./tmp.vitest.setup.nojest.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}','**/*.test.{ts,tsx}']
  },
  resolve: { alias: { 'react-native': 'react-native-web' } },
});
