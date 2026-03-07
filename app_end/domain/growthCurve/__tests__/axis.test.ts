import { describe, it, expect } from 'vitest';
import {
  computeXAxisWindow,
  filterPointsByXWindow,
  computeYAxisWindow,
} from '../axis';
import type { StandardPercentilePoint, UserPoint } from '../types';

describe('axis', () => {
  describe('computeXAxisWindow', () => {
    it('should return full range in full mode', () => {
      const result = computeXAxisWindow('WHO', 'month', 'full', []);
      expect(result.xMin).toBe(0);
      expect(result.xMax).toBe(60);
      expect(result.xTickStep).toBe(1);
    });

    it('should return FENTON limits for FENTON standard', () => {
      const result = computeXAxisWindow('FENTON', 'week', 'full', []);
      expect(result.xMin).toBe(22);
      expect(result.xMax).toBe(50);
      expect(result.xTickStep).toBe(2);
    });

    it('should compute smart window with user points', () => {
      const userPoints: UserPoint[] = [
        { x: 12, value: 5.5, recordedAt: '2024-01-01' },
        { x: 18, value: 6.2, recordedAt: '2024-03-01' },
      ];

      const result = computeXAxisWindow('WHO', 'month', 'smart', userPoints);

      expect(result.xMin).toBe(0);
      expect(result.xMax).toBeGreaterThan(18);
      expect(result.xTickStep).toBe(1);
    });

    it('should handle empty user points in smart mode', () => {
      const result = computeXAxisWindow('WHO', 'month', 'smart', []);
      expect(result.xMin).toBe(0);
      expect(result.xMax).toBe(6); // min span
    });
  });

  describe('filterPointsByXWindow', () => {
    const points: StandardPercentilePoint[] = [
      { x: 0, p3: 2.5, p15: 3.0, p50: 3.5, p85: 4.0, p97: 4.5 },
      { x: 6, p3: 6.5, p15: 7.0, p50: 7.5, p85: 8.0, p97: 8.5 },
      { x: 12, p3: 8.5, p15: 9.0, p50: 9.5, p85: 10.0, p97: 10.5 },
    ];

    it('should filter points within window', () => {
      const result = filterPointsByXWindow(points, 5, 15);
      expect(result).toHaveLength(2);
      expect(result[0].x).toBe(6);
      expect(result[1].x).toBe(12);
    });

    it('should include boundary points', () => {
      const result = filterPointsByXWindow(points, 0, 6);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no points in window', () => {
      const result = filterPointsByXWindow(points, 100, 200);
      expect(result).toHaveLength(0);
    });
  });

  describe('computeYAxisWindow', () => {
    it('should return default range for empty points', () => {
      const result = computeYAxisWindow([], []);
      expect(result.yMin).toBe(0);
      expect(result.yMax).toBe(100);
    });

    it('should compute range from standard points', () => {
      const standardPoints: StandardPercentilePoint[] = [
        { x: 0, p3: 2.5, p15: 3.0, p50: 3.5, p85: 4.0, p97: 4.5 },
        { x: 6, p3: 6.5, p15: 7.0, p50: 7.5, p85: 8.0, p97: 8.5 },
      ];

      const result = computeYAxisWindow(standardPoints, []);

      expect(result.yMin).toBeLessThan(2.5);
      expect(result.yMax).toBeGreaterThan(8.5);
    });

    it('should include user points in range', () => {
      const standardPoints: StandardPercentilePoint[] = [
        { x: 0, p3: 2.5, p15: 3.0, p50: 3.5, p85: 4.0, p97: 4.5 },
      ];
      const userPoints: UserPoint[] = [
        { x: 3, value: 10.0, recordedAt: '2024-01-01' },
      ];

      const result = computeYAxisWindow(standardPoints, userPoints);

      expect(result.yMax).toBeGreaterThanOrEqual(10.0);
    });

    it('should add padding to range when values differ', () => {
      const standardPoints: StandardPercentilePoint[] = [
        { x: 0, p3: 3.0, p15: 4.0, p50: 5.0, p85: 6.0, p97: 7.0 },
      ];

      const result = computeYAxisWindow(standardPoints, []);

      expect(result.yMin).toBeLessThan(3.0);
      expect(result.yMax).toBeGreaterThan(7.0);
    });
  });
});
