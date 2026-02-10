import React from 'react';

import type { Baby } from '@/types/baby';
import type { GrowthMetric, GrowthRecord } from '@/types/growth';

import { GrowthChartView } from './GrowthChartView';

interface GrowthChartProps {
  baby: Baby;
  metric: GrowthMetric;
  records: GrowthRecord[];
  ageType: 'actual' | 'corrected';
  onMetricChange: (metric: GrowthMetric) => void;
  onAgeTypeChange?: (type: 'actual' | 'corrected') => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const GrowthChart: React.FC<GrowthChartProps> = (props) => {
  return <GrowthChartView {...props} />;
};
