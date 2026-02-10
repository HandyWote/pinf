import type { Baby } from '@/types/baby';
import type { GrowthMetric, GrowthRecord } from '@/types/growth';

export type ChartStandard = 'WHO' | 'FENTON';
export type StandardMode = 'auto' | 'manual';
export type AxisUnit = 'month' | 'week';
export type AgeType = 'actual' | 'corrected';
export type RangeMode = 'smart' | 'full';
export type ZoneLabel = '偏低' | '正常' | '偏高';
export type TrendLabel = '上升' | '平稳' | '下降' | '数据不足';

export interface StandardPercentilePoint {
  x: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface UserPoint {
  x: number;
  value: number;
  recordedAt: string;
}

export interface AxisWindow {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xTickStep: number;
}

export interface Assessment {
  latestPercentile: number | null;
  zone: ZoneLabel | null;
  trend: TrendLabel;
}

export interface CurveMeta {
  standard: ChartStandard;
  standardMode: StandardMode;
  ageType: AgeType;
  axisUnit: AxisUnit;
  isPremature: boolean;
  description: string;
}

export interface GrowthCurveModel {
  meta: CurveMeta;
  axis: AxisWindow;
  standardPoints: StandardPercentilePoint[];
  userPoints: UserPoint[];
  assessment: Assessment;
}

export interface GrowthCurveInput {
  baby: Baby;
  metric: GrowthMetric;
  records: GrowthRecord[];
  ageType: AgeType;
  rangeMode: RangeMode;
  standardMode: StandardMode;
  manualStandard?: ChartStandard;
}
