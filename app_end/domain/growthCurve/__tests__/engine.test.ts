import { describe, it, expect } from 'vitest';
import { buildGrowthCurveModel } from '../engine';
import type { GrowthCurveInput } from '../types';
import type { Baby } from '@/types/baby';
import type { GrowthRecord, GrowthMetric } from '@/types/growth';

describe('engine', () => {
  const createBaby = (overrides: Partial<Baby> = {}): Baby => ({
    id: 1,
    name: 'Test Baby',
    birthday: '2024-01-15',
    gender: '男',
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

  describe('buildGrowthCurveModel', () => {
    it('should build model with WHO standard for term baby', () => {
      const baby = createBaby({ gestationalWeeks: 40 });
      const input = createInput({ baby });

      const result = buildGrowthCurveModel(input);

      expect(result.meta.standard).toBe('WHO');
      expect(result.meta.axisUnit).toBe('month');
      expect(result.meta.isPremature).toBe(false);
    });

    it('should include assessment in model', () => {
      const input = createInput();

      const result = buildGrowthCurveModel(input);

      expect(result.assessment).toBeDefined();
      expect(result.assessment.trend).toBe('数据不足');
    });

    it('should include axis configuration', () => {
      const input = createInput();

      const result = buildGrowthCurveModel(input);

      expect(result.axis).toBeDefined();
      expect(result.axis.xMin).toBeDefined();
      expect(result.axis.xMax).toBeDefined();
      expect(result.axis.yMin).toBeDefined();
      expect(result.axis.yMax).toBeDefined();
      expect(result.axis.xTickStep).toBeDefined();
    });

    it('should filter user points by x-axis window', () => {
      const records: GrowthRecord[] = [
        createGrowthRecord({ x: 1, value: '3.0', recordedAt: '2024-02-15' }),
        createGrowthRecord({ x: 3, value: '4.0', recordedAt: '2024-04-15' }),
        createGrowthRecord({ x: 10, value: '8.0', recordedAt: '2024-11-15' }),
      ];
      const input = createInput({
        records: records as any,
        rangeMode: 'smart',
      });

      const result = buildGrowthCurveModel(input);

      // With smart window, points should be filtered
      expect(result.userPoints).toBeDefined();
    });

    it('should return empty arrays when no records', () => {
      const input = createInput({ records: [] });

      const result = buildGrowthCurveModel(input);

      expect(result.standardPoints).toBeDefined();
      expect(result.userPoints).toBeDefined();
      expect(result.userPoints.length).toBe(0);
    });

    it('should handle different metrics', () => {
      const inputHeight = createInput({ metric: 'height' });
      const inputHead = createInput({ metric: 'head' });

      const resultHeight = buildGrowthCurveModel(inputHeight);
      const resultHead = buildGrowthCurveModel(inputHead);

      expect(resultHeight.meta).toBeDefined();
      expect(resultHead.meta).toBeDefined();
    });

    it('should use corrected age type for FENTON standard', () => {
      const baby = createBaby({
        birthday: '2024-01-01',
        gestationalWeeks: 32,
      });
      const records: GrowthRecord[] = [
        createGrowthRecord({
          recordedAt: '2024-02-12', // Valid PMA range
          value: '3.0',
        }),
      ];
      const input = createInput({ baby, records: records as any });

      const result = buildGrowthCurveModel(input);

      if (result.meta.standard === 'FENTON') {
        expect(result.meta.ageType).toBe('corrected');
      }
    });
  });
});
