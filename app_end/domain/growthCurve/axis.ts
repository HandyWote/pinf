import { AXIS_LIMITS, SMART_WINDOW_BUFFER, SMART_WINDOW_MIN_SPAN, X_TICK_STEP } from './config';
import type { AxisUnit, AxisWindow, ChartStandard, RangeMode, StandardPercentilePoint, UserPoint } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeXAxisWindow(
  standard: ChartStandard,
  unit: AxisUnit,
  rangeMode: RangeMode,
  userPoints: UserPoint[]
): { xMin: number; xMax: number; xTickStep: number } {
  const limits = AXIS_LIMITS[standard];
  if (rangeMode === 'full') {
    return { xMin: limits.min, xMax: limits.max, xTickStep: X_TICK_STEP[unit] };
  }

  const latestX = userPoints.length > 0 ? userPoints[userPoints.length - 1].x : limits.min;
  const minSpan = SMART_WINDOW_MIN_SPAN[unit];
  const buffer = SMART_WINDOW_BUFFER[unit];
  const rawMax = Math.max(limits.min + minSpan, latestX + buffer);

  return {
    xMin: limits.min,
    xMax: clamp(rawMax, limits.min + minSpan, limits.max),
    xTickStep: X_TICK_STEP[unit],
  };
}

export function filterPointsByXWindow(points: StandardPercentilePoint[], xMin: number, xMax: number): StandardPercentilePoint[] {
  return points.filter((p) => p.x >= xMin && p.x <= xMax);
}

export function computeYAxisWindow(standardPoints: StandardPercentilePoint[], userPoints: UserPoint[]): Pick<AxisWindow, 'yMin' | 'yMax'> {
  const values: number[] = [];
  standardPoints.forEach((p) => {
    values.push(p.p3, p.p97);
  });
  userPoints.forEach((p) => values.push(p.value));

  if (values.length === 0) {
    return { yMin: 0, yMax: 100 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.08;
  return {
    yMin: Math.floor((min - padding) * 10) / 10,
    yMax: Math.ceil((max + padding) * 10) / 10,
  };
}
