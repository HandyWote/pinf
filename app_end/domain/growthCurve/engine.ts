import { getFentonMetricData } from '@/utils/fentonData';
import { getWHOMetricData, type Gender } from '@/utils/whoData';
import { calculateRecordAge } from './age';
import { computeXAxisWindow, computeYAxisWindow, filterPointsByXWindow } from './axis';
import { buildAssessment } from './assessment';
import { AXIS_LIMITS } from './config';
import { resolveStandard } from './standardResolver';
import type { AxisUnit, DiagnosticInfo, GrowthCurveInput, GrowthCurveModel, StandardPercentilePoint, UserPoint } from './types';
import type { GrowthMetric } from '@/types/growth';
import type { Baby } from '@/types/baby';

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

  const weightScale = input.metric === 'weight' ? 1000 : 1;
  return getFentonMetricData(gender, input.metric).percentiles.map((p) => ({
    x: unit === 'week' ? p.ageMonths : p.ageMonths / 4.33,
    // Fenton 体重原始单位为 g，这里统一折算为 kg，与前端录入单位保持一致
    p3: p.p3 / weightScale,
    p15: p.p15 / weightScale,
    p50: p.p50 / weightScale,
    p85: p.p85 / weightScale,
    p97: p.p97 / weightScale,
  }));
}

function buildUserPoints(input: GrowthCurveInput, standard: 'WHO' | 'FENTON', ageType: 'actual' | 'corrected', axisUnit: AxisUnit): UserPoint[] {
  const points = input.records
    .filter((r) => r.metric === input.metric)
    .map((record) => {
      const ages = calculateRecordAge(input.baby, record.recordedAt);
      const value = Number(record.value);
      const x =
        standard === 'FENTON'
          ? ages.pmaWeeks
          : ageType === 'corrected'
            ? ages.correctedMonths
            : ages.actualMonths;
      return { x, value, recordedAt: record.recordedAt };
    })
    .filter((p) => Number.isFinite(p.value))
    .filter((p) => p.x !== null && p.x >= 0)
    .map((p) => ({ ...p, x: Number(p.x) }))
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
  const rawMetricRecordsCount = input.records.filter((r) => r.metric === input.metric).length;

  const standardPointsAll = buildStandardPoints(input, resolved.standard, axisUnit);
  const userPointsAll = buildUserPoints(input, resolved.standard, resolved.ageType, axisUnit);

  const xAxis = computeXAxisWindow(resolved.standard, axisUnit, input.rangeMode, userPointsAll);
  const standardPoints = filterPointsByXWindow(standardPointsAll, xAxis.xMin, xAxis.xMax);
  const userPoints = userPointsAll.filter((p) => p.x >= xAxis.xMin && p.x <= xAxis.xMax);

  const yAxis = computeYAxisWindow(standardPoints, userPoints);
  const assessment = buildAssessment(input.metric, standardPointsAll, userPointsAll, rawMetricRecordsCount, resolved.diagnostic);

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
