/**
 * 宝宝相关类型定义
 */

export interface Baby {
  id: number;
  name: string;
  gender?: '男' | '女';
  birthday: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD (预产期，用于矫正月龄)
  gestationalWeeks?: number; // 出生孕周 (20-45)
  note?: string;
  createdAt: string;
}

export interface CreateBabyInput {
  name: string;
  gender: '男' | '女';
  birthday: string; // YYYY-MM-DD
  dueDate?: string;
}

export interface UpdateBabyInput {
  name?: string;
  gender?: '男' | '女';
  birthday?: string;
  dueDate?: string;
}

export interface AgeInfo {
  // 实际月龄
  actualMonths: number;
  actualDays: number;
  actualText: string; // "3月 12天"
  
  // 矫正月龄（仅早产儿）
  correctedMonths?: number;
  correctedDays?: number;
  correctedText?: string; // "2月 05天"
  
  // 出生时孕周
  birthGestationalWeeks?: number; // 34周
  
  // 当前矫正孕周（出生孕周 + 实际周龄）
  currentCorrectedWeeks?: number; // 38周
  
  isPremature: boolean; // 是否早产儿 (<37周)
}
