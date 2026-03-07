import { vi } from 'vitest';
vi.mock('react-native', () => ({ NativeModules: {}, Platform: { OS: 'ios' } }));
vi.mock('expo-haptics', () => ({ impactAsync: vi.fn(), ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' } }));
vi.mock('expo-font', () => ({ isLoaded: vi.fn(() => true), loadAsync: vi.fn() }));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: { setItem: vi.fn(), getItem: vi.fn(), multiGet: vi.fn(), removeItem: vi.fn() } }));
