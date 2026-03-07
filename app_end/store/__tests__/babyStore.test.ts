import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBabyStore } from '../babyStore';

// Mock the baby API
vi.mock('@/services/api/baby', () => ({
  getBabies: vi.fn(),
  createBaby: vi.fn(),
  updateBaby: vi.fn(),
  deleteBaby: vi.fn(),
}));

// Mock AsyncStorage - must return Promise
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn(() => Promise.resolve()),
    getItem: vi.fn(() => Promise.resolve(null)),
    multiGet: vi.fn(() => Promise.resolve([])),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));

import * as babyApi from '@/services/api/baby';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('babyStore', () => {
  beforeEach(() => {
    // Reset store state
    useBabyStore.setState({
      babies: [],
      currentBaby: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty babies list', () => {
      const state = useBabyStore.getState();
      expect(state.babies).toEqual([]);
      expect(state.currentBaby).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('selectBaby', () => {
    it('should set current baby', () => {
      const baby = { id: 1, name: 'Test', birthday: '2024-01-01', createdAt: '2024-01-01' };
      useBabyStore.setState({ babies: [baby] });

      useBabyStore.getState().selectBaby(1);

      expect(useBabyStore.getState().currentBaby).toEqual(baby);
    });

    it('should not change current baby if id not found', () => {
      const baby = { id: 1, name: 'Test', birthday: '2024-01-01', createdAt: '2024-01-01' };
      useBabyStore.setState({ babies: [baby] });

      useBabyStore.getState().selectBaby(999);

      expect(useBabyStore.getState().currentBaby).toBeNull();
    });
  });

  describe('fetchBabies', () => {
    it('should set loading while fetching', async () => {
      vi.mocked(babyApi.getBabies).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const fetchPromise = useBabyStore.getState().fetchBabies();

      expect(useBabyStore.getState().isLoading).toBe(true);

      await fetchPromise;

      expect(useBabyStore.getState().isLoading).toBe(false);
    });

    it('should load babies from API', async () => {
      const mockBabies = [
        { id: 1, name: 'Baby1', birthday: '2024-01-01', createdAt: '2024-01-01' },
        { id: 2, name: 'Baby2', birthday: '2024-02-01', createdAt: '2024-02-01' },
      ];

      vi.mocked(babyApi.getBabies).mockResolvedValue(mockBabies);

      await useBabyStore.getState().fetchBabies();

      expect(useBabyStore.getState().babies).toEqual(mockBabies);
    });

    it('should auto-select first baby if none selected', async () => {
      const mockBabies = [
        { id: 1, name: 'Baby1', birthday: '2024-01-01', createdAt: '2024-01-01' },
      ];

      vi.mocked(babyApi.getBabies).mockResolvedValue(mockBabies);

      await useBabyStore.getState().fetchBabies();

      expect(useBabyStore.getState().currentBaby).toEqual(mockBabies[0]);
    });

    it('should set error on failure', async () => {
      vi.mocked(babyApi.getBabies).mockRejectedValue(new Error('Network error'));

      await useBabyStore.getState().fetchBabies();

      expect(useBabyStore.getState().error).toBe('Network error');
    });
  });

  describe('createBaby', () => {
    it('should create baby and select it', async () => {
      const newBaby = { id: 1, name: 'NewBaby', birthday: '2024-01-01', createdAt: '2024-01-01' };

      vi.mocked(babyApi.createBaby).mockResolvedValue(newBaby as any);

      await useBabyStore.getState().createBaby({
        name: 'NewBaby',
        gender: '男',
        birthday: '2024-01-01',
      });

      expect(babyApi.createBaby).toHaveBeenCalledTimes(1);
      expect(useBabyStore.getState().babies).toContainEqual(newBaby);
      expect(useBabyStore.getState().currentBaby).toEqual(newBaby);
    });
  });

  describe('updateBaby', () => {
    it('should update baby in list', async () => {
      const existingBaby = { id: 1, name: 'OldName', birthday: '2024-01-01', createdAt: '2024-01-01' };
      const updatedBaby = { ...existingBaby, name: 'NewName' };

      useBabyStore.setState({ babies: [existingBaby] });

      vi.mocked(babyApi.updateBaby).mockResolvedValue(updatedBaby as any);

      await useBabyStore.getState().updateBaby(1, { name: 'NewName' });

      expect(useBabyStore.getState().babies[0].name).toBe('NewName');
    });

    it('should update current baby if it is the one being updated', async () => {
      const existingBaby = { id: 1, name: 'OldName', birthday: '2024-01-01', createdAt: '2024-01-01' };
      const updatedBaby = { ...existingBaby, name: 'NewName' };

      useBabyStore.setState({ babies: [existingBaby], currentBaby: existingBaby });

      vi.mocked(babyApi.updateBaby).mockResolvedValue(updatedBaby as any);

      await useBabyStore.getState().updateBaby(1, { name: 'NewName' });

      expect(useBabyStore.getState().currentBaby?.name).toBe('NewName');
    });
  });

  describe('deleteBaby', () => {
    it('should remove baby from list', async () => {
      const baby1 = { id: 1, name: 'Baby1', birthday: '2024-01-01', createdAt: '2024-01-01' };
      const baby2 = { id: 2, name: 'Baby2', birthday: '2024-02-01', createdAt: '2024-02-01' };

      useBabyStore.setState({ babies: [baby1, baby2] });

      vi.mocked(babyApi.deleteBaby).mockResolvedValue(undefined);

      await useBabyStore.getState().deleteBaby(1);

      expect(useBabyStore.getState().babies).toHaveLength(1);
      expect(useBabyStore.getState().babies[0].id).toBe(2);
    });

    it('should select another baby if current is deleted', async () => {
      const baby1 = { id: 1, name: 'Baby1', birthday: '2024-01-01', createdAt: '2024-01-01' };
      const baby2 = { id: 2, name: 'Baby2', birthday: '2024-02-01', createdAt: '2024-02-01' };

      useBabyStore.setState({ babies: [baby1, baby2], currentBaby: baby1 });

      vi.mocked(babyApi.deleteBaby).mockResolvedValue(undefined);

      await useBabyStore.getState().deleteBaby(1);

      expect(useBabyStore.getState().currentBaby?.id).toBe(2);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      useBabyStore.setState({ error: 'Some error' });

      useBabyStore.getState().clearError();

      expect(useBabyStore.getState().error).toBeNull();
    });
  });
});
