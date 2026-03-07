import { describe, it, expect } from 'vitest';
import {
  calculateBabyAge,
  formatDetailedAge,
  isValidDateString,
  formatDateString,
} from '../ageCalculator';

describe('ageCalculator', () => {
  describe('calculateBabyAge', () => {
    it('should calculate actual months and days correctly', () => {
      const baby = {
        id: 1,
        name: 'Test Baby',
        birthday: '2024-01-15',
        createdAt: '2024-01-15',
      };
      const referenceDate = new Date('2024-04-20');

      const result = calculateBabyAge(baby, referenceDate);

      expect(result.actualMonths).toBe(3);
      expect(result.actualDays).toBe(5);
      expect(result.actualText).toBe('3月 05天');
      expect(result.isPremature).toBe(false);
    });

    it('should return days only for less than 1 month', () => {
      const baby = {
        id: 1,
        name: 'Test Baby',
        birthday: '2024-04-01',
        createdAt: '2024-04-01',
      };
      const referenceDate = new Date('2024-04-20');

      const result = calculateBabyAge(baby, referenceDate);

      expect(result.actualMonths).toBe(0);
      expect(result.actualDays).toBe(19);
      expect(result.actualText).toBe('19天');
    });

    it('should calculate corrected age for premature baby with dueDate', () => {
      const baby = {
        id: 1,
        name: 'Premature Baby',
        birthday: '2024-02-01', // Born early
        dueDate: '2024-03-01', // Due date
        gestationalWeeks: 35,
        createdAt: '2024-02-01',
      };
      const referenceDate = new Date('2024-04-01');

      const result = calculateBabyAge(baby, referenceDate);

      expect(result.isPremature).toBe(true);
      expect(result.birthGestationalWeeks).toBe(35);
      expect(result.correctedMonths).toBe(1);
      expect(result.currentCorrectedWeeks).toBeGreaterThan(35);
    });

    it('should calculate corrected age using gestational weeks', () => {
      const baby = {
        id: 1,
        name: 'Premature Baby',
        birthday: '2024-01-15',
        gestationalWeeks: 32, // 32 weeks gestational age
        createdAt: '2024-01-15',
      };
      const referenceDate = new Date('2024-04-15');

      const result = calculateBabyAge(baby, referenceDate);

      expect(result.isPremature).toBe(true);
      expect(result.birthGestationalWeeks).toBe(32);
      // Corrected age should be less than actual age
      expect(result.correctedMonths! < result.actualMonths).toBe(true);
    });

    it('should handle baby born at exactly 37 weeks (not premature)', () => {
      const baby = {
        id: 1,
        name: 'Term Baby',
        birthday: '2024-01-15',
        gestationalWeeks: 37,
        createdAt: '2024-01-15',
      };

      const result = calculateBabyAge(baby, new Date('2024-04-15'));

      expect(result.isPremature).toBe(false);
    });
  });

  describe('formatDetailedAge', () => {
    it('should format non-premature baby correctly', () => {
      const ageInfo = {
        actualMonths: 3,
        actualDays: 5,
        actualText: '3月 05天',
        isPremature: false,
      };

      const result = formatDetailedAge(ageInfo);

      expect(result.mainText).toBe('3月 05天');
      expect(result.detailText).toBeUndefined();
      expect(result.badges).toHaveLength(0);
    });

    it('should format premature baby with badges', () => {
      const ageInfo = {
        actualMonths: 4,
        actualDays: 10,
        actualText: '4月 10天',
        correctedMonths: 3,
        correctedDays: 15,
        correctedText: '3月 15天',
        birthGestationalWeeks: 32,
        currentCorrectedWeeks: 40,
        isPremature: true,
      };

      const result = formatDetailedAge(ageInfo);

      expect(result.mainText).toBe('4月 10天');
      expect(result.detailText).toBe('矫正月龄：3月 15天');
      expect(result.badges).toHaveLength(2);
      expect(result.badges[0].label).toBe('出生 32周');
      expect(result.badges[1].label).toBe('矫正 40周');
    });
  });

  describe('isValidDateString', () => {
    it('should validate correct date strings', () => {
      expect(isValidDateString('2024-01-15')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateString('2024-1-15')).toBe(false);
      expect(isValidDateString('2024-01-5')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString('')).toBe(false);
    });
  });

  describe('formatDateString', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-05T12:30:00');
      expect(formatDateString(date)).toBe('2024-03-05');
    });

    it('should pad single digits', () => {
      const date = new Date('2024-01-09T08:05:00');
      expect(formatDateString(date)).toBe('2024-01-09');
    });
  });
});
