import { describe, it, expect } from 'vitest';
import { resolveStandard, type ResolvedStandard } from '../standardResolver';
import type { GrowthCurveInput } from '../types';
import type { Baby } from '@/types/baby';
import type { GrowthRecord, GrowthMetric } from '@/types/growth';

describe('standardResolver', () => {
  const createBaby = (overrides: Partial<Baby> = {}): Baby => ({
    id: 1,
    name: 'Test Baby',
    birthday: '2024-01-15',
    createdAt: '2024-01-15',
    ...overrides,
  });

  const createGrowthRecord = (overrides: Partial<GrowthRecord> = {}): GrowthRecord => ({
    id: 1,
    babyId: 1,
    metric: 'weight' as GrowthMetric,
    value: '5.5',
    recordedAt: '2024-03-15',
    ...overrides,
  });

  const createInput = (overrides: Partial<GrowthCurveInput> = {}): GrowthCurveInput => ({
    baby: createBaby(),
    metric: 'weight',
    records: [],
    ageType: 'actual',
    rangeMode: 'smart',
    standardMode: 'auto',
    ...overrides,
  });

  describe('resolveStandard', () => {
    it('should use WHO for term baby', () => {
      const baby = createBaby({ gestationalWeeks: 40 });
      const input = createInput({ baby });

      const result = resolveStandard(input);

      expect(result.standard).toBe('WHO');
      expect(result.ageType).toBe('actual');
      expect(result.isPremature).toBe(false);
    });

    it('should use WHO for baby at exactly 37 weeks', () => {
      const baby = createBaby({ gestationalWeeks: 37 });
      const input = createInput({ baby });

      const result = resolveStandard(input);

      expect(result.standard).toBe('WHO');
      expect(result.isPremature).toBe(false);
    });

    it('should auto-select FENTON for premature baby with valid PMA records', () => {
      const baby = createBaby({
        birthday: '2024-01-01',
        gestationalWeeks: 32,
      });
      const records: GrowthRecord[] = [
        createGrowthRecord({
          recordedAt: '2024-02-12', // ~6 weeks old = 32 + 6 = 38 PMA weeks (valid FENTON range)
          value: '3.0',
        }),
      ];
      const input = createInput({ baby, records });

      const result = resolveStandard(input);

      expect(result.standard).toBe('FENTON');
      expect(result.ageType).toBe('corrected');
      expect(result.isPremature).toBe(true);
      expect(result.diagnostic?.validFentonPoints).toBe(1);
    });

    it('should use WHO for premature baby without valid FENTON records', () => {
      const baby = createBaby({
        birthday: '2024-01-01',
        gestationalWeeks: 32,
      });
      // Record at 10 months old - outside FENTON range
      const records: GrowthRecord[] = [
        createGrowthRecord({
          recordedAt: '2024-11-01',
          value: '8.0',
        }),
      ];
      const input = createInput({ baby, records });

      const result = resolveStandard(input);

      expect(result.standard).toBe('WHO');
      expect(result.ageType).toBe('actual');
      expect(result.isPremature).toBe(true);
    });

    it('should use manual standard when specified', () => {
      const baby = createBaby({ gestationalWeeks: 32 });
      const input = createInput({
        baby,
        standardMode: 'manual',
        manualStandard: 'WHO',
      });

      const result = resolveStandard(input);

      expect(result.standard).toBe('WHO');
    });

    it('should generate correct description for term baby', () => {
      const baby = createBaby({ gestationalWeeks: 40 });
      const input = createInput({ baby, standardMode: 'auto' });

      const result = resolveStandard(input);

      expect(result.description).toContain('实际月龄');
    });

    it('should detect prematurity from dueDate', () => {
      const baby = createBaby({
        birthday: '2024-01-01',
        dueDate: '2024-03-01', // Born 2 months before due date
      });
      const input = createInput({ baby });

      const result = resolveStandard(input);

      expect(result.isPremature).toBe(true);
    });

    it('should handle future records in diagnostic', () => {
      const baby = createBaby({ gestationalWeeks: 32 });
      const records: GrowthRecord[] = [
        createGrowthRecord({
          recordedAt: '2030-01-01', // Future date
          value: '5.0',
        }),
      ];
      const input = createInput({ baby, records });

      const result = resolveStandard(input);

      expect(result.diagnostic?.futureRecordPoints).toBe(1);
    });

    it('should handle invalid values in diagnostic', () => {
      const baby = createBaby({ gestationalWeeks: 32 });
      const records: GrowthRecord[] = [
        createGrowthRecord({
          value: 'invalid',
        }),
      ];
      const input = createInput({ baby, records });

      const result = resolveStandard(input);

      expect(result.diagnostic?.invalidValuePoints).toBe(1);
    });
  });
});
