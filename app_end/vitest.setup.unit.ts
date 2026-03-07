import { vi } from 'vitest';

// Mock react-native - lightweight for unit tests
vi.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'ios' },
}));

// Mock expo modules - lightweight for unit tests
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

vi.mock('expo-font', () => ({
  isLoaded: vi.fn(() => true),
  loadAsync: vi.fn(),
}));

// Mock AsyncStorage with Promise contract
vi.mock('@react-native-async-storage/async-storage', () => {
  const mockPromise = () => Promise.resolve(undefined);
  return {
    default: {
      setItem: mockPromise,
      getItem: mockPromise,
      multiGet: () => Promise.resolve([]),
      removeItem: mockPromise,
    },
  };
});
