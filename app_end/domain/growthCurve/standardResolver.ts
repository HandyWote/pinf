import type { AgeType, ChartStandard, DiagnosticInfo, GrowthCurveInput } from './types';
import { calculateRecordAge, resolvePrematurity } from './age';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_WEEK = 7;

export interface ResolvedStandard {
  standard: ChartStandard;
  ageType: AgeType;
  isPremature: boolean;
  description: string;
  diagnostic?: DiagnosticInfo;
}

function buildDiagnosticInfo(
  allRecords: import('@/types/growth').GrowthRecord[],
  metric: import('@/types/growth').GrowthMetric,
  baby: import('@/types/baby').Baby
): DiagnosticInfo {
  const metricRecords = allRecords.filter((r) => r.metric === metric);
  const birthday = new Date(baby.birthday);
  const now = new Date();

  let validFenton = 0,
    outOfRange = 0,
    missingPMA = 0,
    invalidValue = 0,
    futureRecord = 0;

  for (const record of metricRecords) {
    const recordDate = new Date(record.recordedAt);
    if (recordDate < birthday || recordDate > now) {
      futureRecord++;
      continue;
    }

    const value = Number(record.value);
    if (!Number.isFinite(value)) {
      invalidValue++;
      continue;
    }

    const ages = calculateRecordAge(baby, record.recordedAt);
    if (ages.pmaWeeks === null) {
      missingPMA++;
    } else if (ages.pmaWeeks >= 22 && ages.pmaWeeks <= 50) {
      validFenton++;
    } else {
      outOfRange++;
    }
  }

  return {
    totalRecords: metricRecords.length,
    validFentonPoints: validFenton,
    outOfRangePoints: outOfRange,
    missingPMAPoints: missingPMA,
    invalidValuePoints: invalidValue,
    futureRecordPoints: futureRecord,
  };
}

export function resolveStandard(input: GrowthCurveInput): ResolvedStandard {
  const { baby, standardMode, manualStandard, metric, records } = input;
  const prematurity = resolvePrematurity(baby);

  if (!prematurity.isPremature) {
    return {
      standard: standardMode === 'manual' && manualStandard ? manualStandard : 'WHO',
      ageType: 'actual',
      isPremature: false,
      description: standardMode === 'manual' && manualStandard ? '手动标准 · 实际月龄' : '自动标准 · 实际月龄',
    };
  }

  const diagnostic = buildDiagnosticInfo(records, metric, baby);
  const hasValidFentonPoints = diagnostic.validFentonPoints > 0;
  const autoStandard: ChartStandard = hasValidFentonPoints ? 'FENTON' : 'WHO';
  const standard = standardMode === 'manual' && manualStandard ? manualStandard : autoStandard;
  const resolvedAgeType: AgeType = standard === 'FENTON' ? 'corrected' : 'actual';

  return {
    standard,
    ageType: resolvedAgeType,
    isPremature: true,
    description:
      standardMode === 'manual'
        ? `手动标准 · ${resolvedAgeType === 'corrected' ? '矫正' : '实际'}${resolvedAgeType === 'corrected' ? '周龄/月龄' : '月龄'}`
        : `自动标准(${standard}) · ${resolvedAgeType === 'corrected' ? '矫正口径' : '实际口径'}`,
    diagnostic,
  };
}
