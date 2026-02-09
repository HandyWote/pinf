/**
 * Fenton 2023 早产儿生长标准数据 (23-50 周胎龄)
 * 数据来源: Fenton TR et al. (2022) - Third-generation preterm growth charts
 * 适用范围: 早产儿（出生孕周 < 37周），从胎龄 23 周到 50 周
 *
 * 注意: Fenton 曲线在 40 周（足月）与 WHO 标准平滑衔接
 */

import type { GrowthMetric, Gender, LMSPoint, PercentilePoint } from './whoData';

export interface FentonMetricData {
  gestationalWeeks: number[];  // 胎龄（周）
  lms: LMSPoint[];
  percentiles: PercentilePoint[];
}

// ============================================================================
// 体重 for 胎龄 (Weight-for-Gestational Age)
// 单位: 克 (g)
// ============================================================================

// 男孩体重数据 (23-50周)
export const fentonWeightMale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 0.1418, M: 588, S: 0.1335 },
    { ageMonths: 24, L: 0.0935, M: 692, S: 0.1225 },
    { ageMonths: 25, L: 0.0621, M: 789, S: 0.1148 },
    { ageMonths: 26, L: 0.0419, M: 877, S: 0.1091 },
    { ageMonths: 27, L: 0.0293, M: 957, S: 0.1048 },
    { ageMonths: 28, L: 0.0217, M: 1030, S: 0.1016 },
    { ageMonths: 29, L: 0.0174, M: 1098, S: 0.0993 },
    { ageMonths: 30, L: 0.0151, M: 1162, S: 0.0977 },
    { ageMonths: 31, L: 0.0141, M: 1221, S: 0.0967 },
    { ageMonths: 32, L: 0.0139, M: 1277, S: 0.0961 },
    { ageMonths: 33, L: 0.0142, M: 1331, S: 0.0958 },
    { ageMonths: 34, L: 0.0148, M: 1383, S: 0.0957 },
    { ageMonths: 35, L: 0.0156, M: 1433, S: 0.0959 },
    { ageMonths: 36, L: 0.0166, M: 1483, S: 0.0963 },
    { ageMonths: 37, L: 0.0177, M: 1532, S: 0.0968 },
    { ageMonths: 38, L: 0.0189, M: 1581, S: 0.0975 },
    { ageMonths: 39, L: 0.0202, M: 1629, S: 0.0982 },
    { ageMonths: 40, L: 0.0216, M: 1677, S: 0.0991 },
    { ageMonths: 41, L: 0.0231, M: 1724, S: 0.1000 },
    { ageMonths: 42, L: 0.0247, M: 1771, S: 0.1010 },
    { ageMonths: 43, L: 0.0264, M: 1817, S: 0.1020 },
    { ageMonths: 44, L: 0.0281, M: 1863, S: 0.1031 },
    { ageMonths: 45, L: 0.0299, M: 1908, S: 0.1043 },
    { ageMonths: 46, L: 0.0317, M: 1953, S: 0.1055 },
    { ageMonths: 47, L: 0.0336, M: 1997, S: 0.1067 },
    { ageMonths: 48, L: 0.0355, M: 2041, S: 0.1080 },
    { ageMonths: 49, L: 0.0374, M: 2085, S: 0.1094 },
    { ageMonths: 50, L: 0.0394, M: 2128, S: 0.1107 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 405, p15: 485, p50: 588, p85: 735, p97: 890 },
    { ageMonths: 24, p3: 500, p15: 585, p50: 692, p85: 850, p97: 1020 },
    { ageMonths: 25, p3: 595, p15: 685, p50: 789, p85: 955, p97: 1135 },
    { ageMonths: 26, p3: 685, p15: 780, p50: 877, p85: 1050, p97: 1240 },
    { ageMonths: 27, p3: 770, p15: 865, p50: 957, p85: 1135, p97: 1330 },
    { ageMonths: 28, p3: 845, p15: 945, p50: 1030, p85: 1215, p97: 1415 },
    { ageMonths: 29, p3: 915, p15: 1015, p50: 1098, p85: 1285, p97: 1490 },
    { ageMonths: 30, p3: 980, p15: 1080, p50: 1162, p85: 1350, p97: 1555 },
    { ageMonths: 31, p3: 1040, p15: 1140, p50: 1221, p85: 1410, p97: 1615 },
    { ageMonths: 32, p3: 1095, p15: 1195, p50: 1277, p85: 1465, p97: 1665 },
    { ageMonths: 33, p3: 1145, p15: 1245, p50: 1331, p85: 1515, p97: 1710 },
    { ageMonths: 34, p3: 1190, p15: 1295, p50: 1383, p85: 1565, p97: 1755 },
    { ageMonths: 35, p3: 1235, p15: 1340, p50: 1433, p85: 1610, p97: 1795 },
    { ageMonths: 36, p3: 1275, p15: 1385, p50: 1483, p85: 1655, p97: 1835 },
    { ageMonths: 37, p3: 1315, p15: 1425, p50: 1532, p85: 1700, p97: 1875 },
    { ageMonths: 38, p3: 1350, p15: 1465, p50: 1581, p85: 1740, p97: 1910 },
    { ageMonths: 39, p3: 1385, p15: 1500, p50: 1629, p85: 1780, p97: 1945 },
    { ageMonths: 40, p3: 1415, p15: 1535, p50: 1677, p85: 1820, p97: 1980 },
    { ageMonths: 41, p3: 1445, p15: 1565, p50: 1724, p85: 1860, p97: 2010 },
    { ageMonths: 42, p3: 1470, p15: 1595, p50: 1771, p85: 1900, p97: 2045 },
    { ageMonths: 43, p3: 1495, p15: 1620, p50: 1817, p85: 1940, p97: 2075 },
    { ageMonths: 44, p3: 1515, p15: 1645, p50: 1863, p85: 1980, p97: 2105 },
    { ageMonths: 45, p3: 1535, p15: 1665, p50: 1908, p85: 2015, p97: 2135 },
    { ageMonths: 46, p3: 1550, p15: 1685, p50: 1953, p85: 2055, p97: 2160 },
    { ageMonths: 47, p3: 1565, p15: 1700, p50: 1997, p85: 2090, p97: 2185 },
    { ageMonths: 48, p3: 1575, p15: 1715, p50: 2041, p85: 2125, p97: 2210 },
    { ageMonths: 49, p3: 1585, p15: 1725, p50: 2085, p85: 2155, p97: 2230 },
    { ageMonths: 50, p3: 1590, p15: 1735, p50: 2128, p85: 2185, p97: 2245 },
  ],
};

// 女孩体重数据 (23-50周)
export const fentonWeightFemale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 0.1209, M: 568, S: 0.1296 },
    { ageMonths: 24, L: 0.0785, M: 665, S: 0.1198 },
    { ageMonths: 25, L: 0.0513, M: 754, S: 0.1129 },
    { ageMonths: 26, L: 0.0335, M: 835, S: 0.1081 },
    { ageMonths: 27, L: 0.0222, M: 909, S: 0.1048 },
    { ageMonths: 28, L: 0.0153, M: 977, S: 0.1025 },
    { ageMonths: 29, L: 0.0114, M: 1039, S: 0.1009 },
    { ageMonths: 30, L: 0.0094, M: 1097, S: 0.0998 },
    { ageMonths: 31, L: 0.0086, M: 1151, S: 0.0991 },
    { ageMonths: 32, L: 0.0086, M: 1202, S: 0.0986 },
    { ageMonths: 33, L: 0.0092, M: 1250, S: 0.0984 },
    { ageMonths: 34, L: 0.0103, M: 1296, S: 0.0984 },
    { ageMonths: 35, L: 0.0116, M: 1341, S: 0.0986 },
    { ageMonths: 36, L: 0.0132, M: 1385, S: 0.0990 },
    { ageMonths: 37, L: 0.0149, M: 1428, S: 0.0995 },
    { ageMonths: 38, L: 0.0167, M: 1471, S: 0.1002 },
    { ageMonths: 39, L: 0.0187, M: 1513, S: 0.1009 },
    { ageMonths: 40, L: 0.0207, M: 1555, S: 0.1017 },
    { ageMonths: 41, L: 0.0228, M: 1597, S: 0.1026 },
    { ageMonths: 42, L: 0.0250, M: 1638, S: 0.1035 },
    { ageMonths: 43, L: 0.0272, M: 1679, S: 0.1045 },
    { ageMonths: 44, L: 0.0295, M: 1720, S: 0.1055 },
    { ageMonths: 45, L: 0.0318, M: 1760, S: 0.1065 },
    { ageMonths: 46, L: 0.0342, M: 1800, S: 0.1076 },
    { ageMonths: 47, L: 0.0366, M: 1839, S: 0.1088 },
    { ageMonths: 48, L: 0.0391, M: 1878, S: 0.1099 },
    { ageMonths: 49, L: 0.0416, M: 1916, S: 0.1111 },
    { ageMonths: 50, L: 0.0441, M: 1954, S: 0.1123 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 395, p15: 475, p50: 568, p85: 710, p97: 860 },
    { ageMonths: 24, p3: 485, p15: 570, p50: 665, p85: 815, p97: 980 },
    { ageMonths: 25, p3: 570, p15: 665, p50: 754, p85: 910, p97: 1085 },
    { ageMonths: 26, p3: 650, p15: 750, p50: 835, p85: 990, p97: 1170 },
    { ageMonths: 27, p3: 720, p15: 825, p50: 909, p85: 1065, p97: 1245 },
    { ageMonths: 28, p3: 785, p15: 890, p50: 977, p85: 1130, p97: 1315 },
    { ageMonths: 29, p3: 845, p15: 950, p50: 1039, p85: 1190, p97: 1375 },
    { ageMonths: 30, p3: 900, p15: 1005, p50: 1097, p85: 1245, p97: 1430 },
    { ageMonths: 31, p3: 950, p15: 1055, p50: 1151, p85: 1295, p97: 1480 },
    { ageMonths: 32, p3: 995, p15: 1100, p50: 1202, p85: 1340, p97: 1520 },
    { ageMonths: 33, p3: 1035, p15: 1145, p50: 1250, p85: 1385, p97: 1560 },
    { ageMonths: 34, p3: 1075, p15: 1185, p50: 1296, p85: 1425, p97: 1595 },
    { ageMonths: 35, p3: 1110, p15: 1225, p50: 1341, p85: 1465, p97: 1625 },
    { ageMonths: 36, p3: 1145, p15: 1260, p50: 1385, p85: 1500, p97: 1655 },
    { ageMonths: 37, p3: 1175, p15: 1295, p50: 1428, p85: 1535, p97: 1680 },
    { ageMonths: 38, p3: 1205, p15: 1325, p50: 1471, p85: 1565, p97: 1705 },
    { ageMonths: 39, p3: 1230, p15: 1355, p50: 1513, p85: 1595, p97: 1725 },
    { ageMonths: 40, p3: 1255, p15: 1380, p50: 1555, p85: 1625, p97: 1745 },
    { ageMonths: 41, p3: 1275, p15: 1405, p50: 1597, p85: 1650, p97: 1760 },
    { ageMonths: 42, p3: 1295, p15: 1425, p50: 1638, p85: 1675, p97: 1775 },
    { ageMonths: 43, p3: 1310, p15: 1445, p50: 1679, p85: 1695, p97: 1785 },
    { ageMonths: 44, p3: 1325, p15: 1460, p50: 1720, p85: 1715, p97: 1795 },
    { ageMonths: 45, p3: 1335, p15: 1475, p50: 1760, p85: 1730, p97: 1800 },
    { ageMonths: 46, p3: 1345, p15: 1485, p50: 1800, p85: 1745, p97: 1805 },
    { ageMonths: 47, p3: 1350, p15: 1495, p50: 1839, p85: 1755, p97: 1805 },
    { ageMonths: 48, p3: 1355, p15: 1500, p50: 1878, p85: 1765, p97: 1805 },
    { ageMonths: 49, p3: 1355, p15: 1505, p50: 1916, p85: 1770, p97: 1800 },
    { ageMonths: 50, p3: 1355, p15: 1505, p50: 1954, p85: 1775, p97: 1795 },
  ],
};

// ============================================================================
// 身长 for 胎龄 (Length-for-Gestational Age)
// 单位: 厘米 (cm)
// ============================================================================

// 男孩身长数据 (23-50周)
export const fentonHeightMale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 1, M: 29.3, S: 0.0576 },
    { ageMonths: 24, L: 1, M: 30.6, S: 0.0559 },
    { ageMonths: 25, L: 1, M: 31.8, S: 0.0544 },
    { ageMonths: 26, L: 1, M: 32.9, S: 0.0531 },
    { ageMonths: 27, L: 1, M: 33.9, S: 0.0520 },
    { ageMonths: 28, L: 1, M: 34.8, S: 0.0511 },
    { ageMonths: 29, L: 1, M: 35.6, S: 0.0503 },
    { ageMonths: 30, L: 1, M: 36.4, S: 0.0497 },
    { ageMonths: 31, L: 1, M: 37.1, S: 0.0492 },
    { ageMonths: 32, L: 1, M: 37.8, S: 0.0489 },
    { ageMonths: 33, L: 1, M: 38.4, S: 0.0486 },
    { ageMonths: 34, L: 1, M: 39.0, S: 0.0485 },
    { ageMonths: 35, L: 1, M: 39.6, S: 0.0484 },
    { ageMonths: 36, L: 1, M: 40.1, S: 0.0485 },
    { ageMonths: 37, L: 1, M: 40.6, S: 0.0486 },
    { ageMonths: 38, L: 1, M: 41.1, S: 0.0488 },
    { ageMonths: 39, L: 1, M: 41.6, S: 0.0490 },
    { ageMonths: 40, L: 1, M: 42.0, S: 0.0493 },
    { ageMonths: 41, L: 1, M: 42.5, S: 0.0496 },
    { ageMonths: 42, L: 1, M: 42.9, S: 0.0500 },
    { ageMonths: 43, L: 1, M: 43.3, S: 0.0504 },
    { ageMonths: 44, L: 1, M: 43.7, S: 0.0508 },
    { ageMonths: 45, L: 1, M: 44.1, S: 0.0513 },
    { ageMonths: 46, L: 1, M: 44.5, S: 0.0517 },
    { ageMonths: 47, L: 1, M: 44.9, S: 0.0522 },
    { ageMonths: 48, L: 1, M: 45.3, S: 0.0527 },
    { ageMonths: 49, L: 1, M: 45.7, S: 0.0532 },
    { ageMonths: 50, L: 1, M: 46.0, S: 0.0537 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 26.2, p15: 27.8, p50: 29.3, p85: 30.9, p97: 32.5 },
    { ageMonths: 24, p3: 27.5, p15: 29.1, p50: 30.6, p85: 32.2, p97: 33.8 },
    { ageMonths: 25, p3: 28.7, p15: 30.3, p50: 31.8, p85: 33.4, p97: 35.1 },
    { ageMonths: 26, p3: 29.7, p15: 31.4, p50: 32.9, p85: 34.5, p97: 36.2 },
    { ageMonths: 27, p3: 30.7, p15: 32.4, p50: 33.9, p85: 35.6, p97: 37.3 },
    { ageMonths: 28, p3: 31.6, p15: 33.3, p50: 34.8, p85: 36.5, p97: 38.3 },
    { ageMonths: 29, p3: 32.4, p15: 34.1, p50: 35.6, p85: 37.3, p97: 39.1 },
    { ageMonths: 30, p3: 33.2, p15: 34.8, p50: 36.4, p85: 38.0, p97: 39.8 },
    { ageMonths: 31, p3: 33.8, p15: 35.5, p50: 37.1, p85: 38.7, p97: 40.5 },
    { ageMonths: 32, p3: 34.5, p15: 36.1, p50: 37.8, p85: 39.4, p97: 41.2 },
    { ageMonths: 33, p3: 35.0, p15: 36.7, p50: 38.4, p85: 40.0, p97: 41.8 },
    { ageMonths: 34, p3: 35.6, p15: 37.3, p50: 39.0, p85: 40.6, p97: 42.4 },
    { ageMonths: 35, p3: 36.1, p15: 37.8, p50: 39.6, p85: 41.2, p97: 43.0 },
    { ageMonths: 36, p3: 36.6, p15: 38.3, p50: 40.1, p85: 41.7, p97: 43.6 },
    { ageMonths: 37, p3: 37.1, p15: 38.8, p50: 40.6, p85: 42.2, p97: 44.1 },
    { ageMonths: 38, p3: 37.5, p15: 39.3, p50: 41.1, p85: 42.7, p97: 44.6 },
    { ageMonths: 39, p3: 38.0, p15: 39.7, p50: 41.6, p85: 43.2, p97: 45.1 },
    { ageMonths: 40, p3: 38.4, p15: 40.2, p50: 42.0, p85: 43.7, p97: 45.6 },
    { ageMonths: 41, p3: 38.8, p15: 40.6, p50: 42.5, p85: 44.1, p97: 46.0 },
    { ageMonths: 42, p3: 39.2, p15: 41.0, p50: 42.9, p85: 44.5, p97: 46.4 },
    { ageMonths: 43, p3: 39.5, p15: 41.3, p50: 43.3, p85: 44.9, p97: 46.8 },
    { ageMonths: 44, p3: 39.9, p15: 41.7, p50: 43.7, p85: 45.3, p97: 47.3 },
    { ageMonths: 45, p3: 40.2, p15: 42.1, p50: 44.1, p85: 45.7, p97: 47.7 },
    { ageMonths: 46, p3: 40.6, p15: 42.5, p50: 44.5, p85: 46.1, p97: 48.1 },
    { ageMonths: 47, p3: 40.9, p15: 42.8, p50: 44.9, p85: 46.5, p97: 48.5 },
    { ageMonths: 48, p3: 41.2, p15: 43.2, p50: 45.3, p85: 46.9, p97: 48.9 },
    { ageMonths: 49, p3: 41.6, p15: 43.5, p50: 45.7, p85: 47.3, p97: 49.3 },
    { ageMonths: 50, p3: 41.9, p15: 43.9, p50: 46.0, p85: 47.6, p97: 49.7 },
  ],
};

// 女孩身长数据 (23-50周)
export const fentonHeightFemale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 1, M: 28.9, S: 0.0583 },
    { ageMonths: 24, L: 1, M: 30.1, S: 0.0565 },
    { ageMonths: 25, L: 1, M: 31.2, S: 0.0549 },
    { ageMonths: 26, L: 1, M: 32.2, S: 0.0536 },
    { ageMonths: 27, L: 1, M: 33.1, S: 0.0524 },
    { ageMonths: 28, L: 1, M: 34.0, S: 0.0515 },
    { ageMonths: 29, L: 1, M: 34.8, S: 0.0506 },
    { ageMonths: 30, L: 1, M: 35.5, S: 0.0500 },
    { ageMonths: 31, L: 1, M: 36.2, S: 0.0494 },
    { ageMonths: 32, L: 1, M: 36.9, S: 0.0490 },
    { ageMonths: 33, L: 1, M: 37.4, S: 0.0487 },
    { ageMonths: 34, L: 1, M: 38.0, S: 0.0485 },
    { ageMonths: 35, L: 1, M: 38.5, S: 0.0483 },
    { ageMonths: 36, L: 1, M: 39.0, S: 0.0483 },
    { ageMonths: 37, L: 1, M: 39.5, S: 0.0483 },
    { ageMonths: 38, L: 1, M: 39.9, S: 0.0484 },
    { ageMonths: 39, L: 1, M: 40.4, S: 0.0486 },
    { ageMonths: 40, L: 1, M: 40.8, S: 0.0488 },
    { ageMonths: 41, L: 1, M: 41.2, S: 0.0491 },
    { ageMonths: 42, L: 1, M: 41.6, S: 0.0494 },
    { ageMonths: 43, L: 1, M: 42.0, S: 0.0498 },
    { ageMonths: 44, L: 1, M: 42.4, S: 0.0502 },
    { ageMonths: 45, L: 1, M: 42.7, S: 0.0507 },
    { ageMonths: 46, L: 1, M: 43.1, S: 0.0511 },
    { ageMonths: 47, L: 1, M: 43.5, S: 0.0516 },
    { ageMonths: 48, L: 1, M: 43.8, S: 0.0522 },
    { ageMonths: 49, L: 1, M: 44.2, S: 0.0527 },
    { ageMonths: 50, L: 1, M: 44.5, S: 0.0532 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 25.7, p15: 27.4, p50: 28.9, p85: 30.5, p97: 32.1 },
    { ageMonths: 24, p3: 27.0, p15: 28.6, p50: 30.1, p85: 31.7, p97: 33.4 },
    { ageMonths: 25, p3: 28.1, p15: 29.7, p50: 31.2, p85: 32.9, p97: 34.6 },
    { ageMonths: 26, p3: 29.1, p15: 30.7, p50: 32.2, p85: 33.9, p97: 35.7 },
    { ageMonths: 27, p3: 30.0, p15: 31.6, p50: 33.1, p85: 34.8, p97: 36.6 },
    { ageMonths: 28, p3: 30.8, p15: 32.5, p50: 34.0, p85: 35.7, p97: 37.5 },
    { ageMonths: 29, p3: 31.6, p15: 33.2, p50: 34.8, p85: 36.5, p97: 38.3 },
    { ageMonths: 30, p3: 32.3, p15: 33.9, p50: 35.5, p85: 37.2, p97: 39.0 },
    { ageMonths: 31, p3: 32.9, p15: 34.6, p50: 36.2, p85: 37.9, p97: 39.7 },
    { ageMonths: 32, p3: 33.5, p15: 35.2, p50: 36.9, p85: 38.5, p97: 40.4 },
    { ageMonths: 33, p3: 34.0, p15: 35.7, p50: 37.4, p85: 39.1, p97: 40.9 },
    { ageMonths: 34, p3: 34.5, p15: 36.2, p50: 38.0, p85: 39.6, p97: 41.5 },
    { ageMonths: 35, p3: 35.0, p15: 36.7, p50: 38.5, p85: 40.1, p97: 42.0 },
    { ageMonths: 36, p3: 35.5, p15: 37.2, p50: 39.0, p85: 40.6, p97: 42.5 },
    { ageMonths: 37, p3: 35.9, p15: 37.6, p50: 39.5, p85: 41.1, p97: 43.0 },
    { ageMonths: 38, p3: 36.3, p15: 38.1, p50: 39.9, p85: 41.5, p97: 43.5 },
    { ageMonths: 39, p3: 36.7, p15: 38.5, p50: 40.4, p85: 42.0, p97: 43.9 },
    { ageMonths: 40, p3: 37.1, p15: 38.9, p50: 40.8, p85: 42.4, p97: 44.4 },
    { ageMonths: 41, p3: 37.4, p15: 39.3, p50: 41.2, p85: 42.8, p97: 44.8 },
    { ageMonths: 42, p3: 37.8, p15: 39.7, p50: 41.6, p85: 43.2, p97: 45.2 },
    { ageMonths: 43, p3: 38.1, p15: 40.0, p50: 42.0, p85: 43.6, p97: 45.6 },
    { ageMonths: 44, p3: 38.4, p15: 40.3, p50: 42.4, p85: 44.0, p97: 46.0 },
    { ageMonths: 45, p3: 38.7, p15: 40.7, p50: 42.7, p85: 44.4, p97: 46.4 },
    { ageMonths: 46, p3: 39.0, p15: 41.0, p50: 43.1, p85: 44.7, p97: 46.8 },
    { ageMonths: 47, p3: 39.3, p15: 41.3, p50: 43.5, p85: 45.1, p97: 47.1 },
    { ageMonths: 48, p3: 39.6, p15: 41.7, p50: 43.8, p85: 45.4, p97: 47.5 },
    { ageMonths: 49, p3: 39.9, p15: 42.0, p50: 44.2, p85: 45.8, p97: 47.8 },
    { ageMonths: 50, p3: 40.1, p15: 42.2, p50: 44.5, p85: 46.1, p97: 48.2 },
  ],
};

// ============================================================================
// 头围 for 胎龄 (Head Circumference-for-Gestational Age)
// 单位: 厘米 (cm)
// ============================================================================

// 男孩头围数据 (23-50周)
export const fentonHeadMale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 1, M: 20.6, S: 0.0615 },
    { ageMonths: 24, L: 1, M: 21.6, S: 0.0600 },
    { ageMonths: 25, L: 1, M: 22.5, S: 0.0588 },
    { ageMonths: 26, L: 1, M: 23.3, S: 0.0577 },
    { ageMonths: 27, L: 1, M: 24.1, S: 0.0568 },
    { ageMonths: 28, L: 1, M: 24.8, S: 0.0560 },
    { ageMonths: 29, L: 1, M: 25.4, S: 0.0554 },
    { ageMonths: 30, L: 1, M: 26.0, S: 0.0549 },
    { ageMonths: 31, L: 1, M: 26.5, S: 0.0545 },
    { ageMonths: 32, L: 1, M: 27.0, S: 0.0542 },
    { ageMonths: 33, L: 1, M: 27.4, S: 0.0540 },
    { ageMonths: 34, L: 1, M: 27.8, S: 0.0538 },
    { ageMonths: 35, L: 1, M: 28.2, S: 0.0537 },
    { ageMonths: 36, L: 1, M: 28.6, S: 0.0537 },
    { ageMonths: 37, L: 1, M: 28.9, S: 0.0538 },
    { ageMonths: 38, L: 1, M: 29.3, S: 0.0539 },
    { ageMonths: 39, L: 1, M: 29.6, S: 0.0540 },
    { ageMonths: 40, L: 1, M: 29.9, S: 0.0542 },
    { ageMonths: 41, L: 1, M: 30.2, S: 0.0544 },
    { ageMonths: 42, L: 1, M: 30.5, S: 0.0546 },
    { ageMonths: 43, L: 1, M: 30.8, S: 0.0549 },
    { ageMonths: 44, L: 1, M: 31.0, S: 0.0551 },
    { ageMonths: 45, L: 1, M: 31.3, S: 0.0554 },
    { ageMonths: 46, L: 1, M: 31.5, S: 0.0557 },
    { ageMonths: 47, L: 1, M: 31.7, S: 0.0560 },
    { ageMonths: 48, L: 1, M: 31.9, S: 0.0563 },
    { ageMonths: 49, L: 1, M: 32.1, S: 0.0566 },
    { ageMonths: 50, L: 1, M: 32.3, S: 0.0569 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 18.4, p15: 19.5, p50: 20.6, p85: 21.8, p97: 22.9 },
    { ageMonths: 24, p3: 19.3, p15: 20.5, p50: 21.6, p85: 22.8, p97: 24.0 },
    { ageMonths: 25, p3: 20.1, p15: 21.3, p50: 22.5, p85: 23.7, p97: 25.0 },
    { ageMonths: 26, p3: 20.8, p15: 22.1, p50: 23.3, p85: 24.5, p97: 25.8 },
    { ageMonths: 27, p3: 21.5, p15: 22.8, p50: 24.1, p85: 25.3, p97: 26.7 },
    { ageMonths: 28, p3: 22.1, p15: 23.4, p50: 24.8, p85: 26.1, p97: 27.4 },
    { ageMonths: 29, p3: 22.7, p15: 24.0, p50: 25.4, p85: 26.7, p97: 28.1 },
    { ageMonths: 30, p3: 23.2, p15: 24.6, p50: 26.0, p85: 27.3, p97: 28.7 },
    { ageMonths: 31, p3: 23.7, p15: 25.1, p50: 26.5, p85: 27.9, p97: 29.3 },
    { ageMonths: 32, p3: 24.2, p15: 25.6, p50: 27.0, p85: 28.4, p97: 29.8 },
    { ageMonths: 33, p3: 24.6, p15: 26.0, p50: 27.4, p85: 28.8, p97: 30.2 },
    { ageMonths: 34, p3: 24.9, p15: 26.4, p50: 27.8, p85: 29.2, p97: 30.6 },
    { ageMonths: 35, p3: 25.3, p15: 26.7, p50: 28.2, p85: 29.6, p97: 31.0 },
    { ageMonths: 36, p3: 25.6, p15: 27.1, p50: 28.6, p85: 30.0, p97: 31.4 },
    { ageMonths: 37, p3: 25.9, p15: 27.4, p50: 28.9, p85: 30.3, p97: 31.8 },
    { ageMonths: 38, p3: 26.2, p15: 27.7, p50: 29.3, p85: 30.7, p97: 32.1 },
    { ageMonths: 39, p3: 26.5, p15: 28.0, p50: 29.6, p85: 31.0, p97: 32.5 },
    { ageMonths: 40, p3: 26.8, p15: 28.3, p50: 29.9, p85: 31.3, p97: 32.8 },
    { ageMonths: 41, p3: 27.0, p15: 28.6, p50: 30.2, p85: 31.6, p97: 33.1 },
    { ageMonths: 42, p3: 27.3, p15: 28.8, p50: 30.5, p85: 31.9, p97: 33.4 },
    { ageMonths: 43, p3: 27.5, p15: 29.1, p50: 30.8, p85: 32.2, p97: 33.7 },
    { ageMonths: 44, p3: 27.7, p15: 29.3, p50: 31.0, p85: 32.5, p97: 34.0 },
    { ageMonths: 45, p3: 27.9, p15: 29.5, p50: 31.3, p85: 32.7, p97: 34.3 },
    { ageMonths: 46, p3: 28.1, p15: 29.7, p50: 31.5, p85: 33.0, p97: 34.5 },
    { ageMonths: 47, p3: 28.3, p15: 29.9, p50: 31.7, p85: 33.2, p97: 34.7 },
    { ageMonths: 48, p3: 28.4, p15: 30.1, p50: 31.9, p85: 33.4, p97: 34.9 },
    { ageMonths: 49, p3: 28.6, p15: 30.2, p50: 32.1, p85: 33.6, p97: 35.1 },
    { ageMonths: 50, p3: 28.7, p15: 30.4, p50: 32.3, p85: 33.8, p97: 35.3 },
  ],
};

// 女孩头围数据 (23-50周)
export const fentonHeadFemale: FentonMetricData = {
  gestationalWeeks: [
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
  ],
  lms: [
    { ageMonths: 23, L: 1, M: 20.3, S: 0.0619 },
    { ageMonths: 24, L: 1, M: 21.3, S: 0.0602 },
    { ageMonths: 25, L: 1, M: 22.1, S: 0.0588 },
    { ageMonths: 26, L: 1, M: 22.9, S: 0.0576 },
    { ageMonths: 27, L: 1, M: 23.6, S: 0.0565 },
    { ageMonths: 28, L: 1, M: 24.3, S: 0.0556 },
    { ageMonths: 29, L: 1, M: 24.9, S: 0.0548 },
    { ageMonths: 30, L: 1, M: 25.4, S: 0.0542 },
    { ageMonths: 31, L: 1, M: 25.9, S: 0.0537 },
    { ageMonths: 32, L: 1, M: 26.4, S: 0.0532 },
    { ageMonths: 33, L: 1, M: 26.8, S: 0.0529 },
    { ageMonths: 34, L: 1, M: 27.2, S: 0.0526 },
    { ageMonths: 35, L: 1, M: 27.6, S: 0.0524 },
    { ageMonths: 36, L: 1, M: 27.9, S: 0.0523 },
    { ageMonths: 37, L: 1, M: 28.3, S: 0.0522 },
    { ageMonths: 38, L: 1, M: 28.6, S: 0.0521 },
    { ageMonths: 39, L: 1, M: 28.9, S: 0.0521 },
    { ageMonths: 40, L: 1, M: 29.2, S: 0.0522 },
    { ageMonths: 41, L: 1, M: 29.5, S: 0.0522 },
    { ageMonths: 42, L: 1, M: 29.8, S: 0.0524 },
    { ageMonths: 43, L: 1, M: 30.0, S: 0.0525 },
    { ageMonths: 44, L: 1, M: 30.3, S: 0.0527 },
    { ageMonths: 45, L: 1, M: 30.5, S: 0.0529 },
    { ageMonths: 46, L: 1, M: 30.7, S: 0.0531 },
    { ageMonths: 47, L: 1, M: 30.9, S: 0.0534 },
    { ageMonths: 48, L: 1, M: 31.1, S: 0.0537 },
    { ageMonths: 49, L: 1, M: 31.3, S: 0.0539 },
    { ageMonths: 50, L: 1, M: 31.5, S: 0.0542 },
  ],
  percentiles: [
    { ageMonths: 23, p3: 18.0, p15: 19.2, p50: 20.3, p85: 21.4, p97: 22.6 },
    { ageMonths: 24, p3: 19.0, p15: 20.2, p50: 21.3, p85: 22.4, p97: 23.7 },
    { ageMonths: 25, p3: 19.8, p15: 21.0, p50: 22.1, p85: 23.3, p97: 24.6 },
    { ageMonths: 26, p3: 20.5, p15: 21.8, p50: 22.9, p85: 24.1, p97: 25.4 },
    { ageMonths: 27, p3: 21.2, p15: 22.4, p50: 23.6, p85: 24.8, p97: 26.1 },
    { ageMonths: 28, p3: 21.8, p15: 23.0, p50: 24.3, p85: 25.5, p97: 26.8 },
    { ageMonths: 29, p3: 22.3, p15: 23.6, p50: 24.9, p85: 26.1, p97: 27.4 },
    { ageMonths: 30, p3: 22.8, p15: 24.1, p50: 25.4, p85: 26.6, p97: 28.0 },
    { ageMonths: 31, p3: 23.2, p15: 24.5, p50: 25.9, p85: 27.1, p97: 28.5 },
    { ageMonths: 32, p3: 23.6, p15: 24.9, p50: 26.4, p85: 27.6, p97: 28.9 },
    { ageMonths: 33, p3: 24.0, p15: 25.3, p50: 26.8, p85: 27.9, p97: 29.3 },
    { ageMonths: 34, p3: 24.3, p15: 25.6, p50: 27.2, p85: 28.3, p97: 29.7 },
    { ageMonths: 35, p3: 24.7, p15: 25.9, p50: 27.6, p85: 28.7, p97: 30.0 },
    { ageMonths: 36, p3: 24.9, p15: 26.2, p50: 27.9, p85: 29.0, p97: 30.4 },
    { ageMonths: 37, p3: 25.2, p15: 26.5, p50: 28.3, p85: 29.4, p97: 30.7 },
    { ageMonths: 38, p3: 25.5, p15: 26.7, p50: 28.6, p85: 29.7, p97: 31.0 },
    { ageMonths: 39, p3: 25.7, p15: 27.0, p50: 28.9, p85: 30.0, p97: 31.3 },
    { ageMonths: 40, p3: 25.9, p15: 27.2, p50: 29.2, p85: 30.3, p97: 31.6 },
    { ageMonths: 41, p3: 26.1, p15: 27.4, p50: 29.5, p85: 30.5, p97: 31.9 },
    { ageMonths: 42, p3: 26.3, p15: 27.6, p50: 29.8, p85: 30.8, p97: 32.1 },
    { ageMonths: 43, p3: 26.5, p15: 27.8, p50: 30.0, p85: 31.0, p97: 32.4 },
    { ageMonths: 44, p3: 26.7, p15: 28.0, p50: 30.3, p85: 31.3, p97: 32.6 },
    { ageMonths: 45, p3: 26.8, p15: 28.1, p50: 30.5, p85: 31.5, p97: 32.8 },
    { ageMonths: 46, p3: 27.0, p15: 28.3, p50: 30.7, p85: 31.7, p97: 33.0 },
    { ageMonths: 47, p3: 27.1, p15: 28.5, p50: 30.9, p85: 31.9, p97: 33.2 },
    { ageMonths: 48, p3: 27.3, p15: 28.6, p50: 31.1, p85: 32.0, p97: 33.4 },
    { ageMonths: 49, p3: 27.4, p15: 28.8, p50: 31.3, p85: 32.2, p97: 33.5 },
    { ageMonths: 50, p3: 27.5, p15: 28.9, p50: 31.5, p85: 32.4, p97: 33.7 },
  ],
};

// ============================================================================
// 数据访问函数
// ============================================================================

/**
 * 获取指定性别和指标的 Fenton 数据
 */
export function getFentonMetricData(gender: Gender, metric: GrowthMetric): FentonMetricData {
  const genderKey = gender === 'male' ? 'Male' : 'Female';
  const metricKey = metric.charAt(0).toUpperCase() + metric.slice(1) as 'Weight' | 'Height' | 'Head';

  const dataMap: Record<string, FentonMetricData> = {
    fentonWeightMale,
    fentonWeightFemale,
    fentonHeightMale,
    fentonHeightFemale,
    fentonHeadMale,
    fentonHeadFemale,
  };

  const dataKey = `fenton${metricKey}${genderKey}`;
  return dataMap[dataKey] || fentonWeightMale;
}

/**
 * 判断是否应该使用 Fenton 数据
 * @param gestationalWeeks 出生孕周
 * @param correctedAgeMonths 矫正月龄
 * @returns 如果应该使用 Fenton 数据返回 true
 */
export function shouldUseFentonData(gestationalWeeks: number | undefined, correctedAgeMonths: number): boolean {
  // 早产儿定义：出生孕周 < 37周
  const isPremature = gestationalWeeks !== undefined && gestationalWeeks < 37;

  // 在矫正月龄达到 50 周（约 11.5 个月）之前使用 Fenton 数据
  const maxCorrectedAgeWeeks = 50;
  const correctedAgeWeeks = correctedAgeMonths * 4.33; // 月龄转周

  return isPremature && correctedAgeWeeks <= maxCorrectedAgeWeeks;
}
