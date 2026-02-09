/**
 * GrowthChartView - 成长曲线图表组件
 * 使用 react-native-chart-kit 渲染 WHO/Fenton 标准曲线和用户数据
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '@/constants/theme';
import { calculateBabyAge } from '@/utils/ageCalculator';
import type { Baby } from '@/types/baby';
import type { GrowthRecord } from '@/types/growth';
import { getWHOMetricData, type GrowthMetric, type Gender, zScoreToPercentile } from '@/utils/whoData';
import { getFentonMetricData, shouldUseFentonData } from '@/utils/fentonData';

const screenWidth = Dimensions.get('window').width - theme.layout.pagePadding * 2;

interface GrowthChartViewProps {
  baby: Baby;
  metric: GrowthMetric;
  records: GrowthRecord[];
  ageType: 'actual' | 'corrected';
  onMetricChange: (metric: GrowthMetric) => void;
  onAgeTypeChange?: (type: 'actual' | 'corrected') => void;
  onRefresh?: () => void;
  loading?: boolean;
  style?: any;
}

const METRIC_META: Record<GrowthMetric, { label: string; unit: string; color: string }> = {
  weight: { label: '体重', unit: 'kg', color: '#6B9AC4' },
  height: { label: '身高', unit: 'cm', color: '#FF9B73' },
  head: { label: '头围', unit: 'cm', color: '#9B87B8' },
};

const PERCENTILE_COLORS = {
  p97: '#E57373', // 红 - 上限警戒
  p85: '#FFB74D', // 橙 - 偏高
  p50: '#6B9AC4', // 蓝 - 中位数
  p15: '#81C784', // 绿 - 偏低
  p3: '#E57373',  // 红 - 下限警戒
};

export const GrowthChartView: React.FC<GrowthChartViewProps> = ({
  baby,
  metric,
  records,
  ageType,
  onMetricChange,
  onAgeTypeChange,
  onRefresh,
  loading = false,
  style,
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
      // 转换 Fenton 数据（周龄转月龄）
      return fentonData.percentiles.map(p => ({
        ageMonths: (p.ageMonths as number) / 4.33, // 周转月
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
    // 过滤当前指标的记录
    const filteredRecords = records
      .filter(r => r.metric === metric)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    // 计算每个记录的月龄
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

    // 标准曲线数据点
    const standardPoints = standardData.map(p => ({
      x: Math.round(p.ageMonths * 10) / 10,
      y: {
        p97: p.p97,
        p85: p.p85,
        p50: p.p50,
        p15: p.p15,
        p3: p.p3,
      },
    }));

    // 用户数据点
    const userPoints = recordsWithAge.map(r => ({
      x: Math.round(r.ageMonths * 10) / 10,
      y: r.value,
      record: r,
    }));

    return { standardPoints, userPoints };
  }, [records, metric, baby.birthday, standardData]);

  // 计算最新数据的百分位
  const latestPercentile = useMemo(() => {
    if (chartData.userPoints.length === 0) return null;

    const latest = chartData.userPoints[chartData.userPoints.length - 1];
    const lmsData = getWHOMetricData(gender, metric).lms;
    const nearestLMS = lmsData.reduce((prev, curr) =>
      Math.abs(curr.ageMonths - latest.x) < Math.abs(prev.ageMonths - latest.x) ? curr : prev
    );

    // 计算 Z 分数和百分位
    const zScore = (Math.pow(latest.y / nearestLMS.M, nearestLMS.L) - 1) / (nearestLMS.L * nearestLMS.S);
    const percentile = zScoreToPercentile(zScore);

    return {
      value: latest.y,
      percentile: percentile,
      ageMonths: latest.x,
    };
  }, [chartData.userPoints, gender, metric]);

  // 构建图表数据集
  const lineChartData = useMemo(() => {
    const labels = chartData.standardPoints.map(p => `${p.x}月`);

    // 为用户数据创建填充数组（null 替换为上一个有效值或跳过）
    const userDataArray = chartData.standardPoints.map((_, i) => {
      const userPoint = chartData.userPoints.find(up => Math.abs(up.x - _.x) < 0.5);
      return userPoint?.y ?? NaN;
    });

    // 移除 NaN 值用于渲染
    const cleanUserData = userDataArray.map(v => Number.isNaN(v) ? 0 : v);

    return {
      labels,
      datasets: [
        // P97 曲线
        {
          data: chartData.standardPoints.map(p => p.y.p97),
          color: (opacity = 1) => `rgba(229, 115, 115, ${opacity * 0.3})`,
          strokeWidth: 1,
        },
        // P85 曲线
        {
          data: chartData.standardPoints.map(p => p.y.p85),
          color: (opacity = 1) => `rgba(255, 183, 77, ${opacity * 0.4})`,
          strokeWidth: 1,
        },
        // P50 中位数
        {
          data: chartData.standardPoints.map(p => p.y.p50),
          color: (opacity = 1) => `rgba(107, 154, 196, ${opacity * 0.5})`,
          strokeWidth: 2,
        },
        // P15 曲线
        {
          data: chartData.standardPoints.map(p => p.y.p15),
          color: (opacity = 1) => `rgba(129, 199, 132, ${opacity * 0.4})`,
          strokeWidth: 1,
        },
        // P3 曲线
        {
          data: chartData.standardPoints.map(p => p.y.p3),
          color: (opacity = 1) => `rgba(229, 115, 115, ${opacity * 0.3})`,
          strokeWidth: 1,
        },
        // 用户数据（用散点表示）
        ...(chartData.userPoints.length > 0 ? [{
          data: cleanUserData,
          color: (opacity = 1) => `rgba(107, 154, 196, ${opacity})`,
          strokeWidth: 2,
        }] : []),
      ],
    };
  }, [chartData]);

  // 计算 Y 轴范围
  const yAxisRange = useMemo(() => {
    const allValues = [
      ...chartData.standardPoints.flatMap(p => [p.y.p3, p.y.p97]),
      ...chartData.userPoints.map(p => p.y),
    ];
    const min = Math.floor(Math.min(...allValues) * 0.95);
    const max = Math.ceil(Math.max(...allValues) * 1.05);
    return [min, max];
  }, [chartData]);

  const meta = METRIC_META[metric];

  return (
    <View style={[styles.container, style]}>
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
        {chartData.standardPoints.length > 0 ? (
          <LineChart
            data={lineChartData}
            width={screenWidth - theme.layout.pagePadding * 2}
            height={240}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(107, 154, 196, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 154, 196, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles.chart}
            yAxisInterval={yAxisRange as any}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
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
          <View style={[styles.legendDot, { backgroundColor: PERCENTILE_COLORS.p85 }]} />
          <Text style={styles.legendText}>P85 / P15</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PERCENTILE_COLORS.p97 }]} />
          <Text style={styles.legendText}>P97 / P3</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>宝宝数据</Text>
        </View>
      </View>

      {/* 刷新按钮 */}
      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshText}>刷新</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  ageTypeChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.mutedBg,
  },
  ageTypeChipActive: {
    backgroundColor: theme.colors.accent + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  ageTypeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  ageTypeTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  percentileBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight + '30',
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
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: theme.borderRadius.medium,
  },
  emptyState: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  refreshButton: {
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.medium,
  },
  refreshText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
