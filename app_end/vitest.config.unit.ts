import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.unit.ts'],
    include: [
      'domain/**/*.test.{ts,tsx}',
      'domain/**/*.test.ts',
      'store/**/*.test.{ts,tsx}',
      'services/**/*.test.{ts,tsx}',
      'utils/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'utils/**',
        'domain/**',
        'services/**',
        'store/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'react-native': 'react-native-web',
    },
  },
});
