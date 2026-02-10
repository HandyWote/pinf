import { shouldUseFentonData } from '@/utils/fentonData';
import type { AgeType, ChartStandard, GrowthCurveInput } from './types';
import { getCurrentCorrectedMonthsFloat, isPrematureBaby } from './age';

export interface ResolvedStandard {
  standard: ChartStandard;
  ageType: AgeType;
  isPremature: boolean;
  description: string;
}

export function resolveStandard(input: GrowthCurveInput): ResolvedStandard {
  const { baby, standardMode, manualStandard, ageType } = input;
  const isPremature = isPrematureBaby(baby);

  if (!isPremature) {
    return {
      standard: standardMode === 'manual' && manualStandard ? manualStandard : 'WHO',
      ageType: 'actual',
      isPremature: false,
      description: standardMode === 'manual' && manualStandard ? '手动标准 · 实际月龄' : '自动标准 · 实际月龄',
    };
  }

  const correctedMonthsNow = getCurrentCorrectedMonthsFloat(baby, new Date());
  const autoStandard: ChartStandard = shouldUseFentonData(baby.gestationalWeeks, correctedMonthsNow) ? 'FENTON' : 'WHO';
  const standard = standardMode === 'manual' && manualStandard ? manualStandard : autoStandard;
  const resolvedAgeType: AgeType = standard === 'FENTON' ? 'corrected' : ageType;

  return {
    standard,
    ageType: resolvedAgeType,
    isPremature: true,
    description:
      standardMode === 'manual'
        ? `手动标准 · ${resolvedAgeType === 'corrected' ? '矫正' : '实际'}${resolvedAgeType === 'corrected' ? '周龄/月龄' : '月龄'}`
        : `自动标准(${standard}) · ${resolvedAgeType === 'corrected' ? '矫正口径' : '实际口径'}`,
  };
}
