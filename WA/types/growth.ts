export type GrowthMetric = 'weight' | 'height' | 'head';

export interface GrowthRecord {
  id: number;
  metric: GrowthMetric;
  value: number;
  unit: string;
  recordedAt: string; // ISO string
  note?: string;
}

export interface CreateGrowthInput {
  metric: GrowthMetric;
  value: number;
  unit: string;
  recordedAt?: string;
  note?: string;
}

export interface UpdateGrowthInput {
  metric?: GrowthMetric;
  value?: number;
  unit?: string;
  recordedAt?: string;
  note?: string;
}
