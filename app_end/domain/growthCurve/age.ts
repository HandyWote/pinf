import type { Baby } from '@/types/baby';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.44;
const WEEKS_PER_MONTH = 4.33;

export interface RecordAge {
  actualMonths: number;
  correctedMonths: number;
  correctedWeeks: number;
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

  return {
    actualMonths,
    correctedMonths,
    correctedWeeks: correctedMonths * WEEKS_PER_MONTH,
  };
}
