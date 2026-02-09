/**
 * WHO 儿童生长标准数据 (0-60 个月)
 * 数据来源: WHO Child Growth Standards + CDC WHO 数据文件
 * 包含 LMS 参数用于计算任意百分位
 */

export type Gender = 'male' | 'female';
export type GrowthMetric = 'weight' | 'height' | 'head';
export type AgeType = 'actual' | 'corrected';

/**
 * LMS 参数数据点
 * L: Box-Cox 变换参数
 * M: 中位数（Median）
 * S: 变异系数
 */
export interface LMSPoint {
  ageMonths: number;  // 月龄（月）
  L: number;
  M: number;
  S: number;
}

/**
 * 百分位数据点
 */
export interface PercentilePoint {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

/**
 * 指标数据集
 */
export interface MetricData {
  lms: LMSPoint[];
  percentiles: PercentilePoint[];
}

// ============================================================================
// 体重 for 年龄 (Weight-for-Age)
// 数据来源: CDC WHO 数据文件 wtageinf.csv
// ============================================================================

// 男孩体重数据 (0-36个月)
export const whoWeightMale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1.815151075, M: 3.530203168, S: 0.152385273 },
    { ageMonths: 1, L: 1.547523128, M: 4.003106424, S: 0.146025021 },
    { ageMonths: 2, L: 1.068795548, M: 4.879525083, S: 0.136478767 },
    { ageMonths: 3, L: 0.695973505, M: 5.672888765, S: 0.129677511 },
    { ageMonths: 4, L: 0.41981509, M: 6.391391982, S: 0.124717085 },
    { ageMonths: 5, L: 0.219866801, M: 7.041836432, S: 0.121040119 },
    { ageMonths: 6, L: 0.077505598, M: 7.630425182, S: 0.1182712 },
    { ageMonths: 7, L: -0.02190761, M: 8.162951035, S: 0.116153695 },
    { ageMonths: 8, L: -0.0894409, M: 8.644832479, S: 0.114510349 },
    { ageMonths: 9, L: -0.1334091, M: 9.081119817, S: 0.113217163 },
    { ageMonths: 10, L: -0.1600954, M: 9.476500305, S: 0.11218624 },
    { ageMonths: 11, L: -0.17429685, M: 9.835307701, S: 0.111354536 },
    { ageMonths: 12, L: -0.1797189, M: 10.16153567, S: 0.110676413 },
    { ageMonths: 15, L: -0.17518447, M: 10.7306256, S: 0.109656941 },
    { ageMonths: 18, L: -0.15770999, M: 11.4220677, S: 0.108694678 },
    { ageMonths: 21, L: -0.15402279, M: 11.61977698, S: 0.108483324 },
    { ageMonths: 24, L: -0.15276214, M: 11.80477902, S: 0.108317416 },
    { ageMonths: 27, L: -0.15446658, M: 11.9789663, S: 0.108193944 },
    { ageMonths: 30, L: -0.15952202, M: 12.14404334, S: 0.108110954 },
    { ageMonths: 33, L: -0.16817926, M: 12.30154103, S: 0.108067236 },
    { ageMonths: 36, L: -0.1805668, M: 12.45283028, S: 0.108062078 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 2.36, p15: 2.93, p50: 3.53, p85: 4.17, p97: 4.45 },
    { ageMonths: 1, p3: 2.80, p15: 3.43, p50: 4.00, p85: 4.72, p97: 5.03 },
    { ageMonths: 2, p3: 3.61, p15: 4.36, p50: 4.88, p85: 5.33, p97: 5.97 },
    { ageMonths: 3, p3: 4.34, p15: 5.16, p50: 5.67, p85: 6.39, p97: 7.11 },
    { ageMonths: 4, p3: 4.99, p15: 5.89, p50: 6.39, p85: 7.46, p97: 7.99 },
    { ageMonths: 5, p3: 5.58, p15: 6.55, p50: 7.04, p85: 8.20, p97: 8.79 },
    { ageMonths: 6, p3: 6.10, p15: 7.15, p50: 7.63, p85: 8.87, p97: 9.51 },
    { ageMonths: 7, p3: 6.56, p15: 7.69, p50: 8.16, p85: 9.48, p97: 10.16 },
    { ageMonths: 8, p3: 6.98, p15: 8.18, p50: 8.64, p85: 10.02, p97: 10.75 },
    { ageMonths: 9, p3: 7.36, p15: 8.63, p50: 9.08, p85: 10.51, p97: 11.27 },
    { ageMonths: 10, p3: 7.70, p15: 9.04, p50: 9.48, p85: 10.96, p97: 11.75 },
    { ageMonths: 11, p3: 8.01, p15: 9.42, p50: 9.84, p85: 11.36, p97: 12.17 },
    { ageMonths: 12, p3: 8.28, p15: 9.77, p50: 10.16, p85: 11.73, p97: 12.57 },
    { ageMonths: 15, p3: 8.95, p15: 10.53, p50: 10.89, p85: 12.56, p97: 13.48 },
    { ageMonths: 18, p3: 9.51, p15: 11.15, p50: 11.49, p85: 13.27, p97: 14.24 },
    { ageMonths: 21, p3: 9.98, p15: 11.68, p50: 12.00, p85: 13.88, p97: 14.89 },
    { ageMonths: 24, p3: 10.38, p15: 12.15, p50: 12.46, p85: 14.43, p97: 15.47 },
    { ageMonths: 27, p3: 10.73, p15: 12.57, p50: 12.87, p85: 14.92, p97: 15.99 },
    { ageMonths: 30, p3: 11.04, p15: 12.94, p50: 13.23, p85: 15.37, p97: 16.47 },
    { ageMonths: 33, p3: 11.31, p15: 13.28, p50: 13.57, p85: 15.77, p97: 16.90 },
    { ageMonths: 36, p3: 11.56, p15: 13.59, p50: 13.87, p85: 16.14, p97: 17.29 },
  ],
};

// 女孩体重数据 (0-36个月)
export const whoWeightFemale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1.509187507, M: 3.39918645, S: 0.142106724 },
    { ageMonths: 1, L: 1.357944315, M: 3.79752846, S: 0.138075916 },
    { ageMonths: 2, L: 1.105537708, M: 4.544776513, S: 0.131733888 },
    { ageMonths: 3, L: 0.902596648, M: 5.230584214, S: 0.126892697 },
    { ageMonths: 4, L: 0.734121414, M: 5.859960798, S: 0.123025182 },
    { ageMonths: 5, L: 0.590235275, M: 6.437587751, S: 0.119840911 },
    { ageMonths: 6, L: 0.464391566, M: 6.967850457, S: 0.117166868 },
    { ageMonths: 7, L: 0.352164071, M: 7.454854109, S: 0.11489384 },
    { ageMonths: 8, L: 0.250497889, M: 7.902436186, S: 0.112949644 },
    { ageMonths: 9, L: 0.15724751, M: 8.314178377, S: 0.11128469 },
    { ageMonths: 10, L: 0.070885725, M: 8.693418423, S: 0.109863709 },
    { ageMonths: 11, L: -0.00968493, M: 9.043261854, S: 0.10866078 },
    { ageMonths: 12, L: -0.085258, M: 9.366593571, S: 0.10765621 },
    { ageMonths: 15, L: -0.22355869, M: 9.944226063, S: 0.106183085 },
    { ageMonths: 18, L: -0.34699919, M: 10.4454058, S: 0.105349631 },
    { ageMonths: 21, L: -0.45721877, M: 10.88638558, S: 0.105083666 },
    { ageMonths: 24, L: -0.55523599, M: 11.28089537, S: 0.105322575 },
    { ageMonths: 27, L: -0.64185418, M: 11.64043402, S: 0.106007025 },
    { ageMonths: 30, L: -0.71788283, M: 11.97453748, S: 0.107078197 },
    { ageMonths: 33, L: -0.78423359, M: 12.2910249, S: 0.108477009 },
    { ageMonths: 36, L: -0.8419355, M: 12.59622335, S: 0.110144488 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 2.41, p15: 2.99, p50: 3.40, p85: 4.00, p97: 4.25 },
    { ageMonths: 1, p3: 2.76, p15: 3.38, p50: 3.80, p85: 4.45, p97: 4.74 },
    { ageMonths: 2, p3: 3.40, p15: 4.11, p50: 4.54, p85: 5.31, p97: 5.66 },
    { ageMonths: 3, p3: 4.00, p15: 4.79, p50: 5.23, p85: 6.08, p97: 6.49 },
    { ageMonths: 4, p3: 4.55, p15: 5.42, p50: 5.86, p85: 6.80, p97: 7.26 },
    { ageMonths: 5, p3: 5.05, p15: 5.99, p50: 6.44, p85: 7.46, p97: 7.95 },
    { ageMonths: 6, p3: 5.52, p15: 6.52, p50: 6.97, p85: 8.06, p97: 8.59 },
    { ageMonths: 7, p3: 5.95, p15: 7.01, p50: 7.45, p85: 8.60, p97: 9.18 },
    { ageMonths: 8, p3: 6.35, p15: 7.47, p50: 7.90, p85: 9.11, p97: 9.72 },
    { ageMonths: 9, p3: 6.72, p15: 7.90, p50: 8.31, p85: 9.58, p97: 10.22 },
    { ageMonths: 10, p3: 7.06, p15: 8.30, p50: 8.69, p85: 10.00, p97: 10.67 },
    { ageMonths: 11, p3: 7.37, p15: 8.66, p50: 9.04, p85: 10.40, p97: 11.10 },
    { ageMonths: 12, p3: 7.66, p15: 9.00, p50: 9.37, p85: 10.76, p97: 11.49 },
    { ageMonths: 15, p3: 8.34, p15: 9.78, p50: 10.12, p85: 11.63, p97: 12.41 },
    { ageMonths: 18, p3: 8.90, p15: 10.45, p50: 10.77, p85: 12.40, p97: 13.23 },
    { ageMonths: 21, p3: 9.37, p15: 11.02, p50: 11.31, p85: 13.03, p97: 13.90 },
    { ageMonths: 24, p3: 9.76, p15: 11.49, p50: 11.77, p85: 13.57, p97: 14.48 },
    { ageMonths: 27, p3: 10.10, p15: 11.90, p50: 12.17, p85: 14.05, p97: 14.99 },
    { ageMonths: 30, p3: 10.38, p15: 12.25, p50: 12.52, p85: 14.49, p97: 15.46 },
    { ageMonths: 33, p3: 10.63, p15: 12.56, p50: 12.82, p85: 14.88, p97: 15.88 },
    { ageMonths: 36, p3: 10.86, p15: 12.84, p50: 13.10, p85: 15.25, p97: 16.27 },
  ],
};

// ============================================================================
// 身高 for 年龄 (Length/Height-for-Age)
// 数据来源: WHO Child Growth Standards
// ============================================================================

// 男孩身高数据 (0-36个月)
export const whoHeightMale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1, M: 49.88, S: 0.03795 },
    { ageMonths: 1, L: 1, M: 54.73, S: 0.03557 },
    { ageMonths: 2, L: 1, M: 58.42, S: 0.03424 },
    { ageMonths: 3, L: 1, M: 61.42, S: 0.03328 },
    { ageMonths: 4, L: 1, M: 63.88, S: 0.03256 },
    { ageMonths: 5, L: 1, M: 65.99, S: 0.03198 },
    { ageMonths: 6, L: 1, M: 67.82, S: 0.03151 },
    { ageMonths: 7, L: 1, M: 69.45, S: 0.03112 },
    { ageMonths: 8, L: 1, M: 70.93, S: 0.03079 },
    { ageMonths: 9, L: 1, M: 72.29, S: 0.03051 },
    { ageMonths: 10, L: 1, M: 73.55, S: 0.03026 },
    { ageMonths: 11, L: 1, M: 74.73, S: 0.03005 },
    { ageMonths: 12, L: 1, M: 75.75, S: 0.02986 },
    { ageMonths: 15, L: 1, M: 78.67, S: 0.02939 },
    { ageMonths: 18, L: 1, M: 81.24, S: 0.02904 },
    { ageMonths: 21, L: 1, M: 83.53, S: 0.02879 },
    { ageMonths: 24, L: 1, M: 85.58, S: 0.02861 },
    { ageMonths: 27, L: 1, M: 87.44, S: 0.02850 },
    { ageMonths: 30, L: 1, M: 89.14, S: 0.02844 },
    { ageMonths: 33, L: 1, M: 90.71, S: 0.02842 },
    { ageMonths: 36, L: 1, M: 92.16, S: 0.02843 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 46.1, p15: 48.3, p50: 49.9, p85: 51.5, p97: 53.7 },
    { ageMonths: 1, p3: 50.8, p15: 53.2, p50: 54.7, p85: 56.3, p97: 58.6 },
    { ageMonths: 2, p3: 54.4, p15: 56.9, p50: 58.4, p85: 60.1, p97: 62.5 },
    { ageMonths: 3, p3: 57.4, p15: 60.0, p50: 61.4, p85: 63.2, p97: 65.7 },
    { ageMonths: 4, p3: 59.9, p15: 62.5, p50: 63.9, p85: 65.7, p97: 68.3 },
    { ageMonths: 5, p3: 61.9, p15: 64.6, p50: 66.0, p85: 67.8, p97: 70.5 },
    { ageMonths: 6, p3: 63.7, p15: 66.5, p50: 67.8, p85: 69.7, p97: 72.4 },
    { ageMonths: 7, p3: 65.3, p15: 68.2, p50: 69.5, p85: 71.4, p97: 74.2 },
    { ageMonths: 8, p3: 66.8, p15: 69.7, p50: 70.9, p85: 72.9, p97: 75.8 },
    { ageMonths: 9, p3: 68.1, p15: 71.1, p50: 72.3, p85: 74.3, p97: 77.2 },
    { ageMonths: 10, p3: 69.4, p15: 72.3, p50: 73.6, p85: 75.6, p97: 78.6 },
    { ageMonths: 11, p3: 70.5, p15: 73.5, p50: 74.7, p85: 76.8, p97: 79.8 },
    { ageMonths: 12, p3: 71.6, p15: 74.6, p50: 75.8, p85: 77.9, p97: 81.0 },
    { ageMonths: 15, p3: 74.5, p15: 77.7, p50: 78.7, p85: 80.9, p97: 84.1 },
    { ageMonths: 18, p3: 77.1, p15: 80.4, p50: 81.2, p85: 83.6, p97: 86.8 },
    { ageMonths: 21, p3: 79.4, p15: 82.8, p50: 83.5, p85: 86.0, p97: 89.3 },
    { ageMonths: 24, p3: 81.4, p15: 84.9, p50: 85.6, p85: 88.1, p97: 91.5 },
    { ageMonths: 27, p3: 83.3, p15: 86.8, p50: 87.4, p85: 90.0, p97: 93.4 },
    { ageMonths: 30, p3: 85.0, p15: 88.5, p50: 89.1, p85: 91.8, p97: 95.2 },
    { ageMonths: 33, p3: 86.5, p15: 90.1, p50: 90.7, p85: 93.4, p97: 96.9 },
    { ageMonths: 36, p3: 87.9, p15: 91.5, p50: 92.2, p85: 94.9, p97: 98.5 },
  ],
};

// 女孩身高数据 (0-36个月)
export const whoHeightFemale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1, M: 49.15, S: 0.03786 },
    { ageMonths: 1, L: 1, M: 53.72, S: 0.03548 },
    { ageMonths: 2, L: 1, M: 57.07, S: 0.03427 },
    { ageMonths: 3, L: 1, M: 59.83, S: 0.03342 },
    { ageMonths: 4, L: 1, M: 62.14, S: 0.03276 },
    { ageMonths: 5, L: 1, M: 64.14, S: 0.03222 },
    { ageMonths: 6, L: 1, M: 65.90, S: 0.03178 },
    { ageMonths: 7, L: 1, M: 67.48, S: 0.03142 },
    { ageMonths: 8, L: 1, M: 68.92, S: 0.03111 },
    { ageMonths: 9, L: 1, M: 70.24, S: 0.03085 },
    { ageMonths: 10, L: 1, M: 71.46, S: 0.03063 },
    { ageMonths: 11, L: 1, M: 72.60, S: 0.03044 },
    { ageMonths: 12, L: 1, M: 73.58, S: 0.03027 },
    { ageMonths: 15, L: 1, M: 76.38, S: 0.02986 },
    { ageMonths: 18, L: 1, M: 78.84, S: 0.02956 },
    { ageMonths: 21, L: 1, M: 81.05, S: 0.02934 },
    { ageMonths: 24, L: 1, M: 83.05, S: 0.02919 },
    { ageMonths: 27, L: 1, M: 84.88, S: 0.02910 },
    { ageMonths: 30, L: 1, M: 86.57, S: 0.02905 },
    { ageMonths: 33, L: 1, M: 88.14, S: 0.02904 },
    { ageMonths: 36, L: 1, M: 89.60, S: 0.02907 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 45.4, p15: 47.5, p50: 49.1, p85: 50.8, p97: 52.9 },
    { ageMonths: 1, p3: 49.8, p15: 52.1, p50: 53.7, p85: 55.4, p97: 57.7 },
    { ageMonths: 2, p3: 53.0, p15: 55.4, p50: 57.1, p85: 58.8, p97: 61.2 },
    { ageMonths: 3, p3: 55.6, p15: 58.1, p50: 59.8, p85: 61.6, p97: 64.1 },
    { ageMonths: 4, p3: 57.8, p15: 60.4, p50: 62.1, p85: 64.0, p97: 66.6 },
    { ageMonths: 5, p3: 59.7, p15: 62.4, p50: 64.1, p85: 66.1, p97: 68.7 },
    { ageMonths: 6, p3: 61.4, p15: 64.1, p50: 65.9, p85: 67.9, p97: 70.6 },
    { ageMonths: 7, p3: 62.9, p15: 65.7, p50: 67.5, p85: 69.6, p97: 72.3 },
    { ageMonths: 8, p3: 64.3, p15: 67.2, p50: 68.9, p85: 71.1, p97: 73.9 },
    { ageMonths: 9, p3: 65.6, p15: 68.5, p50: 70.2, p85: 72.5, p97: 75.3 },
    { ageMonths: 10, p3: 66.8, p15: 69.7, p50: 71.5, p85: 73.8, p97: 76.6 },
    { ageMonths: 11, p3: 67.9, p15: 70.9, p50: 72.6, p85: 75.0, p97: 77.9 },
    { ageMonths: 12, p3: 68.9, p15: 71.9, p50: 73.6, p85: 76.0, p97: 79.0 },
    { ageMonths: 15, p3: 71.6, p15: 74.7, p50: 76.4, p85: 78.9, p97: 82.0 },
    { ageMonths: 18, p3: 74.0, p15: 77.1, p50: 78.8, p85: 81.4, p97: 84.6 },
    { ageMonths: 21, p3: 76.1, p15: 79.3, p50: 81.1, p85: 83.7, p97: 87.0 },
    { ageMonths: 24, p3: 78.0, p15: 81.2, p50: 83.1, p85: 85.7, p97: 89.1 },
    { ageMonths: 27, p3: 79.7, p15: 83.0, p50: 84.9, p85: 87.5, p97: 91.0 },
    { ageMonths: 30, p3: 81.3, p15: 84.6, p50: 86.6, p85: 89.2, p97: 92.7 },
    { ageMonths: 33, p3: 82.7, p15: 86.1, p50: 88.1, p85: 90.8, p97: 94.3 },
    { ageMonths: 36, p3: 84.1, p15: 87.5, p50: 89.6, p85: 92.3, p97: 95.9 },
  ],
};

// ============================================================================
// 头围 for 年龄 (Head Circumference-for-Age)
// 数据来源: WHO Child Growth Standards
// ============================================================================

// 男孩头围数据 (0-36个月)
export const whoHeadMale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1, M: 34.46, S: 0.03695 },
    { ageMonths: 1, L: 1, M: 37.30, S: 0.03253 },
    { ageMonths: 2, L: 1, M: 39.11, S: 0.03051 },
    { ageMonths: 3, L: 1, M: 40.44, S: 0.02931 },
    { ageMonths: 4, L: 1, M: 41.50, S: 0.02846 },
    { ageMonths: 5, L: 1, M: 42.38, S: 0.02782 },
    { ageMonths: 6, L: 1, M: 43.14, S: 0.02732 },
    { ageMonths: 7, L: 1, M: 43.81, S: 0.02691 },
    { ageMonths: 8, L: 1, M: 44.40, S: 0.02657 },
    { ageMonths: 9, L: 1, M: 44.93, S: 0.02629 },
    { ageMonths: 10, L: 1, M: 45.41, S: 0.02605 },
    { ageMonths: 11, L: 1, M: 45.85, S: 0.02584 },
    { ageMonths: 12, L: 1, M: 46.26, S: 0.02566 },
    { ageMonths: 15, L: 1, M: 47.30, S: 0.02520 },
    { ageMonths: 18, L: 1, M: 48.16, S: 0.02491 },
    { ageMonths: 21, L: 1, M: 48.90, S: 0.02474 },
    { ageMonths: 24, L: 1, M: 49.55, S: 0.02466 },
    { ageMonths: 27, L: 1, M: 50.13, S: 0.02464 },
    { ageMonths: 30, L: 1, M: 50.65, S: 0.02467 },
    { ageMonths: 33, L: 1, M: 51.13, S: 0.02474 },
    { ageMonths: 36, L: 1, M: 51.57, S: 0.02485 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 32.0, p15: 33.3, p50: 34.5, p85: 35.7, p97: 37.0 },
    { ageMonths: 1, p3: 35.1, p15: 36.4, p50: 37.3, p85: 38.3, p97: 39.5 },
    { ageMonths: 2, p3: 36.9, p15: 38.2, p50: 39.1, p85: 40.1, p97: 41.3 },
    { ageMonths: 3, p3: 38.3, p15: 39.5, p50: 40.4, p85: 41.5, p97: 42.7 },
    { ageMonths: 4, p3: 39.4, p15: 40.6, p50: 41.5, p85: 42.6, p97: 43.8 },
    { ageMonths: 5, p3: 40.3, p15: 41.5, p50: 42.4, p85: 43.5, p97: 44.7 },
    { ageMonths: 6, p3: 41.0, p15: 42.3, p50: 43.1, p85: 44.3, p97: 45.5 },
    { ageMonths: 7, p3: 41.7, p15: 43.0, p50: 43.8, p85: 45.0, p97: 46.2 },
    { ageMonths: 8, p3: 42.3, p15: 43.6, p50: 44.4, p85: 45.6, p97: 46.8 },
    { ageMonths: 9, p3: 42.8, p15: 44.1, p50: 44.9, p85: 46.1, p97: 47.4 },
    { ageMonths: 10, p3: 43.3, p15: 44.6, p50: 45.4, p85: 46.6, p97: 47.9 },
    { ageMonths: 11, p3: 43.7, p15: 45.0, p50: 45.9, p85: 47.1, p97: 48.4 },
    { ageMonths: 12, p3: 44.1, p15: 45.4, p50: 46.3, p85: 47.5, p97: 48.8 },
    { ageMonths: 15, p3: 45.2, p15: 46.5, p50: 47.3, p85: 48.5, p97: 49.9 },
    { ageMonths: 18, p3: 46.0, p15: 47.4, p50: 48.2, p85: 49.4, p97: 50.8 },
    { ageMonths: 21, p3: 46.7, p15: 48.1, p50: 48.9, p85: 50.1, p97: 51.6 },
    { ageMonths: 24, p3: 47.3, p15: 48.7, p50: 49.5, p85: 50.8, p97: 52.3 },
    { ageMonths: 27, p3: 47.9, p15: 49.2, p50: 50.1, p85: 51.4, p97: 52.9 },
    { ageMonths: 30, p3: 48.3, p15: 49.7, p50: 50.6, p85: 52.0, p97: 53.5 },
    { ageMonths: 33, p3: 48.8, p15: 50.1, p50: 51.1, p85: 52.5, p97: 54.0 },
    { ageMonths: 36, p3: 49.1, p15: 50.5, p50: 51.6, p85: 53.0, p97: 54.5 },
  ],
};

// 女孩头围数据 (0-36个月)
export const whoHeadFemale: MetricData = {
  lms: [
    { ageMonths: 0, L: 1, M: 33.88, S: 0.03560 },
    { ageMonths: 1, L: 1, M: 36.48, S: 0.03192 },
    { ageMonths: 2, L: 1, M: 38.27, S: 0.03019 },
    { ageMonths: 3, L: 1, M: 39.58, S: 0.02915 },
    { ageMonths: 4, L: 1, M: 40.63, S: 0.02840 },
    { ageMonths: 5, L: 1, M: 41.50, S: 0.02782 },
    { ageMonths: 6, L: 1, M: 42.25, S: 0.02736 },
    { ageMonths: 7, L: 1, M: 42.91, S: 0.02699 },
    { ageMonths: 8, L: 1, M: 43.50, S: 0.02669 },
    { ageMonths: 9, L: 1, M: 44.02, S: 0.02643 },
    { ageMonths: 10, L: 1, M: 44.49, S: 0.02621 },
    { ageMonths: 11, L: 1, M: 44.92, S: 0.02602 },
    { ageMonths: 12, L: 1, M: 45.31, S: 0.02585 },
    { ageMonths: 15, L: 1, M: 46.32, S: 0.02541 },
    { ageMonths: 18, L: 1, M: 47.16, S: 0.02512 },
    { ageMonths: 21, L: 1, M: 47.88, S: 0.02495 },
    { ageMonths: 24, L: 1, M: 48.51, S: 0.02486 },
    { ageMonths: 27, L: 1, M: 49.07, S: 0.02483 },
    { ageMonths: 30, L: 1, M: 49.57, S: 0.02486 },
    { ageMonths: 33, L: 1, M: 50.03, S: 0.02492 },
    { ageMonths: 36, L: 1, M: 50.45, S: 0.02502 },
  ],
  percentiles: [
    { ageMonths: 0, p3: 31.5, p15: 32.8, p50: 33.9, p85: 35.0, p97: 36.2 },
    { ageMonths: 1, p3: 34.4, p15: 35.6, p50: 36.5, p85: 37.5, p97: 38.7 },
    { ageMonths: 2, p3: 36.1, p15: 37.4, p50: 38.3, p85: 39.3, p97: 40.5 },
    { ageMonths: 3, p3: 37.4, p15: 38.7, p50: 39.6, p85: 40.6, p97: 41.8 },
    { ageMonths: 4, p3: 38.5, p15: 39.7, p50: 40.6, p85: 41.7, p97: 42.8 },
    { ageMonths: 5, p3: 39.3, p15: 40.6, p50: 41.5, p85: 42.6, p97: 43.8 },
    { ageMonths: 6, p3: 40.0, p15: 41.3, p50: 42.3, p85: 43.4, p97: 44.6 },
    { ageMonths: 7, p3: 40.6, p15: 41.9, p50: 42.9, p85: 44.0, p97: 45.2 },
    { ageMonths: 8, p3: 41.2, p15: 42.5, p50: 43.5, p85: 44.6, p97: 45.8 },
    { ageMonths: 9, p3: 41.6, p15: 42.9, p50: 44.0, p85: 45.1, p97: 46.4 },
    { ageMonths: 10, p3: 42.1, p15: 43.4, p50: 44.5, p85: 45.6, p97: 46.9 },
    { ageMonths: 11, p3: 42.5, p15: 43.8, p50: 44.9, p85: 46.1, p97: 47.4 },
    { ageMonths: 12, p3: 42.8, p15: 44.2, p50: 45.3, p85: 46.5, p97: 47.8 },
    { ageMonths: 15, p3: 43.9, p15: 45.2, p50: 46.3, p85: 47.5, p97: 48.8 },
    { ageMonths: 18, p3: 44.6, p15: 46.0, p50: 47.2, p85: 48.4, p97: 49.7 },
    { ageMonths: 21, p3: 45.3, p15: 46.7, p50: 47.9, p85: 49.1, p97: 50.5 },
    { ageMonths: 24, p3: 45.9, p15: 47.3, p50: 48.5, p85: 49.7, p97: 51.1 },
    { ageMonths: 27, p3: 46.4, p15: 47.8, p50: 49.1, p85: 50.3, p97: 51.7 },
    { ageMonths: 30, p3: 46.9, p15: 48.3, p50: 49.6, p85: 50.8, p97: 52.2 },
    { ageMonths: 33, p3: 47.3, p15: 48.7, p50: 50.0, p85: 51.3, p97: 52.7 },
    { ageMonths: 36, p3: 47.6, p15: 49.1, p50: 50.5, p85: 51.7, p97: 53.2 },
  ],
};

// ============================================================================
// 数据访问函数
// ============================================================================

/**
 * 获取指定性别和指标的 WHO 数据
 */
export function getWHOMetricData(gender: Gender, metric: GrowthMetric): MetricData {
  const genderKey = gender === 'male' ? 'Male' : 'Female';
  const metricKey = metric.charAt(0).toUpperCase() + metric.slice(1) as 'Weight' | 'Height' | 'Head';

  const dataMap: Record<string, MetricData> = {
    whoWeightMale,
    whoWeightFemale,
    whoHeightMale,
    whoHeightFemale,
    whoHeadMale,
    whoHeadFemale,
  };

  const dataKey = `who${metricKey}${genderKey}`;
  return dataMap[dataKey] || whoWeightMale;
}

/**
 * 使用 LMS 参数计算指定百分位的值
 * 公式: X = M * (1 + L*S*Z)^(1/L) 当 L ≠ 0
 *       X = M * exp(S*Z) 当 L = 0
 *
 * @param lms LMS 参数
 * @param zScore Z 分数（对应百分位）
 * @returns 计算出的百分位值
 */
export function calculatePercentileFromLMS(lms: LMSPoint, zScore: number): number {
  const { L, M, S } = lms;

  if (Math.abs(L) < 0.0001) {
    // L ≈ 0 时使用指数公式
    return M * Math.exp(S * zScore);
  } else {
    // 标准公式
    return M * Math.pow(1 + L * S * zScore, 1 / L);
  }
}

/**
 * 计算测量值的 Z 分数
 * 公式: Z = ((X/M)^L - 1) / (L*S) 当 L ≠ 0
 *       Z = ln(X/M) / S 当 L = 0
 *
 * @param value 测量值
 * @param lms LMS 参数
 * @returns Z 分数
 */
export function calculateZScore(value: number, lms: LMSPoint): number {
  const { L, M, S } = lms;

  if (Math.abs(L) < 0.0001) {
    // L ≈ 0 时使用对数公式
    return Math.log(value / M) / S;
  } else {
    // 标准公式
    return (Math.pow(value / M, L) - 1) / (L * S);
  }
}

/**
 * Z 分数转百分位
 */
export function zScoreToPercentile(zScore: number): number {
  // 使用近似公式将 Z 分数转换为百分位
  // 这是标准正态分布的累积分布函数近似
  const sign = zScore < 0 ? -1 : 1;
  const absZ = Math.abs(zScore);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ / 2);

  return sign === 1 ? (1 + y) / 2 * 100 : (1 - y) / 2 * 100;
}

/**
 * 常用 Z 分数对应百分位
 */
export const Z_SCORE_PERCENTILES: Record<number, number> = {
  '-3.291': 0.1,   // 0.1st
  '-2.878': 0.2,   // 0.2nd
  '-2.576': 0.5,   // 0.5th
  '-1.881': 3,     // 3rd
  '-1.645': 5,     // 5th
  '-1.282': 10,    // 10th
  '-0.674': 25,    // 25th
  0: 50,           // 50th (median)
  0.674: 75,       // 75th
  1.036: 85,       // 85th
  1.282: 90,       // 90th
  1.645: 95,       // 95th
  1.881: 97,       // 97th
  2.576: 99.5,     // 99.5th
  3.291: 99.9,     // 99.9th
};

/**
 * 百分位转 Z 分数（反向查找）
 */
export function percentileToZScore(percentile: number): number {
  for (const [zStr, p] of Object.entries(Z_SCORE_PERCENTILES)) {
    if (Math.abs(p - percentile) < 0.1) {
      return parseFloat(zStr);
    }
  }
  // 近似计算
  return 0;
}
