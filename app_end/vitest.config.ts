import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '**/__tests__/**/*.test.{ts,tsx}',
      '**/*.test.{ts,tsx}',
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
      'react-native': 'react-native-web',
    },
  },
});
