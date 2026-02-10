import { TREND_THRESHOLD } from './config';
import type { GrowthMetric } from '@/types/growth';
import type { Assessment, StandardPercentilePoint, TrendLabel, UserPoint, ZoneLabel } from './types';

function interpolateStandardPoint(points: StandardPercentilePoint[], x: number): StandardPercentilePoint | null {
  if (points.length === 0) return null;
  if (x <= points[0].x) return points[0];
  if (x >= points[points.length - 1].x) return points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];
    if (x >= left.x && x <= right.x) {
      const ratio = (x - left.x) / (right.x - left.x || 1);
      return {
        x,
        p3: left.p3 + (right.p3 - left.p3) * ratio,
        p15: left.p15 + (right.p15 - left.p15) * ratio,
        p50: left.p50 + (right.p50 - left.p50) * ratio,
        p85: left.p85 + (right.p85 - left.p85) * ratio,
        p97: left.p97 + (right.p97 - left.p97) * ratio,
      };
    }
  }
  return points[points.length - 1];
}

function percentileByBands(value: number, point: StandardPercentilePoint): number {
  if (value <= point.p3) return 3;
  if (value <= point.p15) return 3 + ((value - point.p3) / (point.p15 - point.p3 || 1)) * 12;
  if (value <= point.p50) return 15 + ((value - point.p15) / (point.p50 - point.p15 || 1)) * 35;
  if (value <= point.p85) return 50 + ((value - point.p50) / (point.p85 - point.p50 || 1)) * 35;
  if (value <= point.p97) return 85 + ((value - point.p85) / (point.p97 - point.p85 || 1)) * 12;
  return 97;
}

function zoneByPercentile(percentile: number): ZoneLabel {
  if (percentile < 3) return '偏低';
  if (percentile > 85) return '偏高';
  return '正常';
}

function resolveTrend(metric: GrowthMetric, userPoints: UserPoint[]): TrendLabel {
  if (userPoints.length < 3) return '数据不足';
  const latest3 = userPoints.slice(-3);
  const start = latest3[0].value;
  const end = latest3[2].value;
  const delta = end - start;
  const threshold = TREND_THRESHOLD[metric];
  if (delta > threshold) return '上升';
  if (delta < -threshold) return '下降';
  return '平稳';
}

export function buildAssessment(metric: GrowthMetric, standardPoints: StandardPercentilePoint[], userPoints: UserPoint[]): Assessment {
  if (userPoints.length === 0) {
    return {
      latestPercentile: null,
      zone: null,
      trend: '数据不足',
    };
  }

  const latest = userPoints[userPoints.length - 1];
  const standardAtLatest = interpolateStandardPoint(standardPoints, latest.x);
  if (!standardAtLatest) {
    return {
      latestPercentile: null,
      zone: null,
      trend: resolveTrend(metric, userPoints),
    };
  }

  const latestPercentile = percentileByBands(latest.value, standardAtLatest);
  return {
    latestPercentile,
    zone: zoneByPercentile(latestPercentile),
    trend: resolveTrend(metric, userPoints),
  };
}
