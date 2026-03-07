// Skip @testing-library/jest-native for now - causes issues in node environment
// import '@testing-library/jest-native/extend-expect';
import { vi } from 'vitest';

// Mock react-native
vi.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'ios' },
}));

// Mock expo modules
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

vi.mock('expo-font', () => ({
  isLoaded: vi.fn(() => true),
  loadAsync: vi.fn(),
}));

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn(() => Promise.resolve()),
    getItem: vi.fn(() => Promise.resolve(null)),
    multiGet: vi.fn(() => Promise.resolve([])),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));
