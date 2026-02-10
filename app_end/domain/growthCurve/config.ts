import type { GrowthMetric } from '@/types/growth';
import type { AxisUnit, ChartStandard } from './types';

export const AXIS_LIMITS: Record<ChartStandard, { min: number; max: number; unit: AxisUnit }> = {
  WHO: { min: 0, max: 60, unit: 'month' },
  FENTON: { min: 22, max: 50, unit: 'week' },
};

export const SMART_WINDOW_BUFFER: Record<AxisUnit, number> = {
  month: 3,
  week: 3,
};

export const SMART_WINDOW_MIN_SPAN: Record<AxisUnit, number> = {
  month: 6,
  week: 8,
};

export const X_TICK_STEP: Record<AxisUnit, number> = {
  month: 1,
  week: 2,
};

export const TREND_THRESHOLD: Record<GrowthMetric, number> = {
  weight: 0.15,
  height: 0.6,
  head: 0.3,
};
