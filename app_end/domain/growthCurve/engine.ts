import { getFentonMetricData } from '@/utils/fentonData';
import { getWHOMetricData, type Gender } from '@/utils/whoData';
import { calculateRecordAge } from './age';
import { computeXAxisWindow, computeYAxisWindow, filterPointsByXWindow } from './axis';
import { buildAssessment } from './assessment';
import { AXIS_LIMITS } from './config';
import { resolveStandard } from './standardResolver';
import type { AxisUnit, GrowthCurveInput, GrowthCurveModel, StandardPercentilePoint, UserPoint } from './types';

function toGender(babyGender?: '男' | '女'): Gender {
  return babyGender === '女' ? 'female' : 'male';
}

function buildStandardPoints(input: GrowthCurveInput, standard: 'WHO' | 'FENTON', unit: AxisUnit): StandardPercentilePoint[] {
  const gender = toGender(input.baby.gender);
  if (standard === 'WHO') {
    return getWHOMetricData(gender, input.metric).percentiles.map((p) => ({
      x: p.ageMonths,
      p3: p.p3,
      p15: p.p15,
      p50: p.p50,
      p85: p.p85,
      p97: p.p97,
    }));
  }

  return getFentonMetricData(gender, input.metric).percentiles.map((p) => ({
    x: unit === 'week' ? p.ageMonths : p.ageMonths / 4.33,
    p3: p.p3,
    p15: p.p15,
    p50: p.p50,
    p85: p.p85,
    p97: p.p97,
  }));
}

function buildUserPoints(input: GrowthCurveInput, standard: 'WHO' | 'FENTON', ageType: 'actual' | 'corrected', axisUnit: AxisUnit): UserPoint[] {
  const points = input.records
    .filter((r) => r.metric === input.metric)
    .map((record) => {
      const ages = calculateRecordAge(input.baby, record.recordedAt);
      const x =
        standard === 'FENTON'
          ? ages.correctedWeeks
          : ageType === 'corrected'
            ? ages.correctedMonths
            : ages.actualMonths;
      return { x, value: record.value, recordedAt: record.recordedAt };
    })
    .filter((p) => p.x >= 0)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  if (standard === 'FENTON') {
    const limits = AXIS_LIMITS.FENTON;
    return points.filter((p) => p.x >= limits.min && p.x <= limits.max);
  }
  return points;
}

export function buildGrowthCurveModel(input: GrowthCurveInput): GrowthCurveModel {
  const resolved = resolveStandard(input);
  const axisUnit: AxisUnit = resolved.standard === 'FENTON' ? 'week' : 'month';

  const standardPointsAll = buildStandardPoints(input, resolved.standard, axisUnit);
  const userPointsAll = buildUserPoints(input, resolved.standard, resolved.ageType, axisUnit);

  const xAxis = computeXAxisWindow(resolved.standard, axisUnit, input.rangeMode, userPointsAll);
  const standardPoints = filterPointsByXWindow(standardPointsAll, xAxis.xMin, xAxis.xMax);
  const userPoints = userPointsAll.filter((p) => p.x >= xAxis.xMin && p.x <= xAxis.xMax);

  const yAxis = computeYAxisWindow(standardPoints, userPoints);
  const assessment = buildAssessment(input.metric, standardPointsAll, userPointsAll);

  return {
    meta: {
      standard: resolved.standard,
      standardMode: input.standardMode,
      ageType: resolved.ageType,
      axisUnit,
      isPremature: resolved.isPremature,
      description: resolved.description,
    },
    axis: {
      xMin: xAxis.xMin,
      xMax: xAxis.xMax,
      xTickStep: xAxis.xTickStep,
      yMin: yAxis.yMin,
      yMax: yAxis.yMax,
    },
    standardPoints,
    userPoints,
    assessment,
  };
}
