import type { Baby } from '@/types/baby';
import type { PrematurityResult } from './types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.44;
const WEEKS_PER_MONTH = 4.33;

export interface RecordAge {
  actualMonths: number;
  correctedMonths: number;
  correctedWeeks: number;
  pmaWeeks: number | null;
}

function resolveCorrectedBirthday(baby: Baby): Date {
  const birthday = new Date(baby.birthday);
  if (baby.dueDate) {
    return new Date(baby.dueDate);
  }
  if (baby.gestationalWeeks !== undefined) {
    const corrected = new Date(birthday.getTime());
    corrected.setDate(corrected.getDate() + (40 - baby.gestationalWeeks) * 7);
    return corrected;
  }
  return birthday;
}

export function resolvePrematurity(baby: Baby): PrematurityResult {
  const MS_PER_WEEK = MS_PER_DAY * 7;

  if (baby.gestationalWeeks !== undefined && baby.gestationalWeeks >= 20 && baby.gestationalWeeks <= 45) {
    return {
      isPremature: baby.gestationalWeeks < 37,
      isEstimated: false,
      source: 'gestationalWeeks',
      birthWeeks: baby.gestationalWeeks,
    };
  }

  if (baby.dueDate) {
    const birthday = new Date(baby.birthday);
    const dueDate = new Date(baby.dueDate);
    const weeksBeforeDue = (dueDate.getTime() - birthday.getTime()) / MS_PER_WEEK;
    const birthWeeks = 40 - weeksBeforeDue;
    return {
      isPremature: birthWeeks < 37,
      isEstimated: true,
      source: 'dueDate',
      birthWeeks: Number.isFinite(birthWeeks) ? birthWeeks : null,
    };
  }

  return {
    isPremature: false,
    isEstimated: false,
    source: null,
    birthWeeks: null,
  };
}

export function isPrematureBaby(baby: Baby): boolean {
  return (baby.gestationalWeeks !== undefined && baby.gestationalWeeks < 37) || !!baby.dueDate;
}

export function getCurrentCorrectedMonthsFloat(baby: Baby, referenceDate: Date): number {
  const correctedBirthday = resolveCorrectedBirthday(baby);
  if (correctedBirthday > referenceDate) {
    return 0;
  }
  const diffDays = (referenceDate.getTime() - correctedBirthday.getTime()) / MS_PER_DAY;
  return Math.max(0, diffDays / DAYS_PER_MONTH);
}

export function calculateRecordAge(baby: Baby, recordedAt: string): RecordAge {
  const recordDate = new Date(recordedAt);
  const birthday = new Date(baby.birthday);
  const actualDays = (recordDate.getTime() - birthday.getTime()) / MS_PER_DAY;
  const actualMonths = Math.max(0, actualDays / DAYS_PER_MONTH);

  const correctedBirthday = resolveCorrectedBirthday(baby);
  const correctedDays = correctedBirthday > recordDate ? 0 : (recordDate.getTime() - correctedBirthday.getTime()) / MS_PER_DAY;
  const correctedMonths = Math.max(0, correctedDays / DAYS_PER_MONTH);
  const actualWeeks = actualDays / 7;

  let pmaWeeks: number | null = null;
  // Fenton 横轴采用 PMA 周龄，与官方标准数据口径保持一致
  if (Number.isFinite(actualWeeks) && actualWeeks >= 0) {
    if (baby.gestationalWeeks !== undefined && baby.gestationalWeeks >= 20 && baby.gestationalWeeks <= 45) {
      pmaWeeks = baby.gestationalWeeks + actualWeeks;
    } else if (baby.dueDate) {
      const dueDate = new Date(baby.dueDate);
      if (!Number.isNaN(dueDate.getTime())) {
        const postTermWeeks = (recordDate.getTime() - dueDate.getTime()) / MS_PER_DAY / 7;
        pmaWeeks = 40 + postTermWeeks;
      }
    }
  }

  return {
    actualMonths,
    correctedMonths,
    correctedWeeks: correctedMonths * WEEKS_PER_MONTH,
    pmaWeeks,
  };
}
