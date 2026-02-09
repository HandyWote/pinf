/**
 * 成长曲线图表组件 - 使用 react-native-svg-charts
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-svg-charts';
import { Circle } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { calculateBabyAge } from '@/utils/ageCalculator';
import type { Baby } from '@/types/baby';
import type { GrowthRecord, GrowthMetric } from '@/types/growth';
import { getWHOMetricData, type Gender, zScoreToPercentile } from '@/utils/whoData';
import { getFentonMetricData, shouldUseFentonData } from '@/utils/fentonData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - theme.layout.pagePadding * 2;
const CHART_HEIGHT = 240;

interface GrowthChartProps {
  baby: Baby;
  metric: GrowthMetric;
  records: GrowthRecord[];
  ageType: 'actual' | 'corrected';
  onMetricChange: (metric: GrowthMetric) => void;
  onAgeTypeChange?: (type: 'actual' | 'corrected') => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const METRIC_META: Record<GrowthMetric, { label: string; unit: string; color: string }> = {
  weight: { label: '体重', unit: 'kg', color: '#6B9AC4' },
  height: { label: '身高', unit: 'cm', color: '#FF9B73' },
  head: { label: '头围', unit: 'cm', color: '#9B87B8' },
};

const PERCENTILE_COLORS = {
  p97: '#E57373',
  p85: '#FFB74D',
  p50: '#6B9AC4',
  p15: '#81C784',
  p3: '#E57373',
  user: '#FF6B6B',
};

export const GrowthChart: React.FC<GrowthChartProps> = ({
  baby,
  metric,
  records,
  ageType,
  onMetricChange,
  onAgeTypeChange,
  onRefresh,
  loading = false,
}) => {
  // 计算宝宝年龄信息
  const ageInfo = useMemo(() => calculateBabyAge(baby), [baby]);
  const isPremature = ageInfo.isPremature;

  // 确定使用的月龄
  const effectiveMonths = ageType === 'corrected' && ageInfo.correctedMonths !== undefined
    ? ageInfo.correctedMonths + (ageInfo.correctedDays || 0) / 30
    : ageInfo.actualMonths + (ageInfo.actualDays || 0) / 30;

  // 判断使用哪种标准数据
  const useFenton = shouldUseFentonData(baby.gestationalWeeks, effectiveMonths);
  const gender: Gender = baby.gender === '男' ? 'male' : 'female';

  // 获取标准数据
  const standardData = useMemo(() => {
    if (useFenton) {
      const fentonData = getFentonMetricData(gender, metric);
      return fentonData.percentiles.map(p => ({
        ageMonths: (p.ageMonths as number) / 4.33,
        p3: p.p3,
        p15: p.p15,
        p50: p.p50,
        p85: p.p85,
        p97: p.p97,
      }));
    } else {
      return getWHOMetricData(gender, metric).percentiles;
    }
  }, [useFenton, gender, metric]);

  // 准备图表数据
  const chartData = useMemo(() => {
    const filteredRecords = records
      .filter(r => r.metric === metric)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    const recordsWithAge = filteredRecords.map(record => {
      const recordDate = new Date(record.recordedAt);
      const birthDate = new Date(baby.birthday);
      const ageInDays = Math.floor((recordDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInMonths = ageInDays / 30.44;

      return {
        ...record,
        ageMonths: ageInMonths,
      };
    });

    return { recordsWithAge, standardData };
  }, [records, metric, baby.birthday, standardData]);

  // 计算最新数据的百分位
  const latestPercentile = useMemo(() => {
    if (chartData.recordsWithAge.length === 0) return null;

    const latest = chartData.recordsWithAge[chartData.recordsWithAge.length - 1];
    const lmsData = getWHOMetricData(gender, metric).lms;
    const nearestLMS = lmsData.reduce((prev, curr) =>
      Math.abs(curr.ageMonths - latest.ageMonths) < Math.abs(prev.ageMonths - latest.ageMonths) ? curr : prev
    );

    const zScore = (Math.pow(latest.value / nearestLMS.M, nearestLMS.L) - 1) / (nearestLMS.L * nearestLMS.S);
    const percentile = zScoreToPercentile(zScore);

    return {
      value: latest.value,
      percentile: percentile,
      ageMonths: latest.ageMonths,
    };
  }, [chartData.recordsWithAge, gender, metric]);

  // 构建图表数据
  const lineChartData = useMemo(() => {
    // 使用标准数据作为 X 轴
    const xAxisLabels = standardData.map(d => Math.round(d.ageMonths));

    // Y 轴范围
    const allValues = [
      ...standardData.flatMap(d => [d.p3, d.p97]),
      ...chartData.recordsWithAge.map(r => r.value),
    ];
    const yMin = Math.floor(Math.min(...allValues) * 0.95);
    const yMax = Math.ceil(Math.max(...allValues) * 1.05);

    return {
      labels: xAxisLabels,
      yMin,
      yMax,
    };
  }, [standardData, chartData.recordsWithAge]);

  // 构建数据集
  const dataSets = useMemo(() => {
    // P50 中位数
    const p50Data = standardData.map(d => d.p50);
    // P97 和 P3
    const p97Data = standardData.map(d => d.p97);
    const p3Data = standardData.map(d => d.p3);
    // 用户数据
    const userData = standardData.map((d, i) => {
      const userPoint = chartData.recordsWithAge.find(r => Math.abs(r.ageMonths - d.ageMonths) < 0.5);
      return userPoint?.value ?? null;
    });

    return { p50Data, p97Data, p3Data, userData };
  }, [standardData, chartData.recordsWithAge]);

  const meta = METRIC_META[metric];

  return (
    <View style={styles.container}>
      {/* 头部控制区 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meta.label}曲线</Text>
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        {/* 指标切换 */}
        <View style={styles.metricSwitch}>
          {(Object.keys(METRIC_META) as GrowthMetric[]).map((key) => {
            const active = metric === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.metricChip, active && styles.metricChipActive]}
                onPress={() => onMetricChange(key)}
              >
                <Text style={[styles.metricChipText, active && styles.metricChipTextActive]}>
                  {METRIC_META[key].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 月龄类型切换（仅早产儿） */}
        {isPremature && onAgeTypeChange && (
          <View style={styles.ageTypeSwitch}>
            <TouchableOpacity
              style={[styles.ageTypeChip, ageType === 'actual' && styles.ageTypeChipActive]}
              onPress={() => onAgeTypeChange('actual')}
            >
              <Text style={[styles.ageTypeText, ageType === 'actual' && styles.ageTypeTextActive]}>
                实际月龄
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ageTypeChip, ageType === 'corrected' && styles.ageTypeChipActive]}
              onPress={() => onAgeTypeChange('corrected')}
            >
              <Text style={[styles.ageTypeText, ageType === 'corrected' && styles.ageTypeTextActive]}>
                矫正月龄
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 百分位说明 */}
      {latestPercentile && (
        <View style={styles.percentileBadge}>
          <Text style={styles.percentileText}>
            当前: {latestPercentile.value}{meta.unit} (P{Math.round(latestPercentile.percentile)})
          </Text>
          <Text style={styles.ageText}>
            {ageType === 'corrected' ? '矫正' : '实际'}月龄: {Math.round(latestPercentile.ageMonths * 10) / 10}个月
          </Text>
        </View>
      )}

      {/* 图表区域 */}
      <View style={styles.chartWrapper}>
        {chartData.standardData.length > 0 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={dataSets.p50Data}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              svg={{
                stroke: PERCENTILE_COLORS.p50,
                strokeWidth: 2,
              }}
              contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
              style={styles.chart}
              yMin={lineChartData.yMin}
              yMax={lineChartData.yMax}
            />

            {/* P97 曲线 */}
            <LineChart
              data={dataSets.p97Data}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              svg={{
                stroke: PERCENTILE_COLORS.p97,
                strokeWidth: 1,
                strokeOpacity: 0.5,
              }}
              contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
              style={{ position: 'absolute', top: 0, left: 0 }}
              yMin={lineChartData.yMin}
              yMax={lineChartData.yMax}
            />

            {/* P3 曲线 */}
            <LineChart
              data={dataSets.p3Data}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              svg={{
                stroke: PERCENTILE_COLORS.p3,
                strokeWidth: 1,
                strokeOpacity: 0.5,
              }}
              contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
              style={{ position: 'absolute', top: 0, left: 0 }}
              yMin={lineChartData.yMin}
              yMax={lineChartData.yMax}
            />

            {/* 用户数据点 */}
            {dataSets.userData.filter((v): v is number => v !== null).map((value, index) => {
              if (value === null) return null;
              return (
                <Circle
                  key={`user-${index}`}
                  cx={10 + (index / (dataSets.userData.length - 1)) * (CHART_WIDTH - 20)}
                  cy={CHART_HEIGHT - 20 - ((value - lineChartData.yMin) / (lineChartData.yMax - lineChartData.yMin)) * (CHART_HEIGHT - 40)}
                  r={6}
                  fill={PERCENTILE_COLORS.user}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无标准数据</Text>
          </View>
        )}
      </View>

      {/* 图例说明 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PERCENTILE_COLORS.p50 }]} />
          <Text style={styles.legendText}>中位数 P50</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PERCENTILE_COLORS.p97 }]} />
          <Text style={styles.legendText}>P97 / P3</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PERCENTILE_COLORS.user }]} />
          <Text style={styles.legendText}>宝宝数据</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.layout.blockGap,
    marginTop: theme.layout.sectionGap,
  },
  header: {
    gap: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  metricSwitch: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  metricChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.mutedBg,
  },
  metricChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  metricChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  metricChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  ageTypeSwitch: {
    flexDirection: 'row',
    backgroundColor: theme.colors.mutedBg,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  ageTypeChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.small,
  },
  ageTypeChipActive: {
    backgroundColor: theme.colors.bgContent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ageTypeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  ageTypeTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  percentileBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  percentileText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  ageText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  chartWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  chartContainer: {
    position: 'relative',
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    padding: theme.spacing.md,
  },
  chart: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
});
