/**
 * 年龄计算工具
 * 支持实际月龄和矫正月龄计算
 */

import type { AgeInfo, Baby } from '@/types/baby';

/**
 * 计算两个日期之间的月数和天数
 */
function calculateMonthsAndDays(fromDate: Date, toDate: Date): { months: number; days: number } {
  let months = 0;
  let days = 0;

  let current = new Date(fromDate.getTime());
  const target = new Date(toDate.getTime());

  // 计算完整的月数
  while (true) {
    const nextMonth = new Date(current.getTime());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (nextMonth <= target) {
      months++;
      current = nextMonth;
    } else {
      break;
    }
  }

  // 计算剩余天数
  days = Math.floor((target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

  return { months, days };
}

/**
 * 格式化年龄显示
 */
function formatAge(months: number, days: number): string {
  if (months === 0) {
    return `${days}天`;
  }
  const dayStr = days < 10 ? `0${days}` : `${days}`;
  return `${months}月 ${dayStr}天`;
}

/**
 * 计算宝宝年龄信息
 * @param baby 宝宝信息
 * @param referenceDate 参考日期（默认为当前日期）
 * @returns 年龄信息
 */
export function calculateBabyAge(baby: Baby, referenceDate: Date = new Date()): AgeInfo {
  const birthday = new Date(baby.birthday);
  
  // 计算实际月龄
  const actual = calculateMonthsAndDays(birthday, referenceDate);
  const actualText = formatAge(actual.months, actual.days);

  // 判断是否为早产儿（出生孕周 < 37周 或有预产期）
  const isPremature = (baby.gestationalWeeks && baby.gestationalWeeks < 37) || !!baby.dueDate;

  const result: AgeInfo = {
    actualMonths: actual.months,
    actualDays: actual.days,
    actualText,
    isPremature,
  };

  // 如果是早产儿，计算矫正月龄
  if (isPremature) {
    let correctedBirthday: Date;

    if (baby.dueDate) {
      // 方法1: 使用预产期计算矫正出生日期
      correctedBirthday = new Date(baby.dueDate);
    } else if (baby.gestationalWeeks) {
      // 方法2: 使用出生孕周计算矫正出生日期
      // 矫正出生日期 = 实际出生日期 + (40 - 出生孕周) 周
      const weeksToAdd = 40 - baby.gestationalWeeks;
      correctedBirthday = new Date(birthday.getTime());
      correctedBirthday.setDate(correctedBirthday.getDate() + weeksToAdd * 7);
    } else {
      correctedBirthday = birthday;
    }

    // 只有当矫正出生日期在参考日期之前时才计算矫正月龄
    if (correctedBirthday <= referenceDate) {
      const corrected = calculateMonthsAndDays(correctedBirthday, referenceDate);
      result.correctedMonths = corrected.months;
      result.correctedDays = corrected.days;
      result.correctedText = formatAge(corrected.months, corrected.days);
    } else {
      // 如果矫正日期还没到，显示为 0
      result.correctedMonths = 0;
      result.correctedDays = 0;
      result.correctedText = '0天';
    }

    // 计算出生时孕周和当前矫正孕周
    if (baby.gestationalWeeks) {
      result.birthGestationalWeeks = baby.gestationalWeeks;
      
      // 当前矫正孕周 = 出生孕周 + 实际周龄
      const actualWeeks = Math.floor(
        (referenceDate.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      result.currentCorrectedWeeks = baby.gestationalWeeks + actualWeeks;
    }
  }

  return result;
}

/**
 * 格式化详细年龄信息（用于显示）
 */
export function formatDetailedAge(ageInfo: AgeInfo): {
  mainText: string;
  detailText?: string;
  badges: Array<{ label: string }>;
} {
  const badges: Array<{ label: string }> = [];

  if (ageInfo.isPremature) {
    if (ageInfo.birthGestationalWeeks) {
      badges.push({ label: `出生 ${ageInfo.birthGestationalWeeks}周` });
    }
    if (ageInfo.currentCorrectedWeeks) {
      badges.push({ label: `矫正 ${ageInfo.currentCorrectedWeeks}周` });
    }

    return {
      mainText: ageInfo.actualText,
      detailText: ageInfo.correctedText ? `矫正月龄：${ageInfo.correctedText}` : undefined,
      badges,
    };
  }

  return {
    mainText: ageInfo.actualText,
    badges,
  };
}

/**
 * 验证日期格式 (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${monthStr}-${dayStr}`;
}
