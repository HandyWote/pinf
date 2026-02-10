import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import type { Baby } from '@/types/baby';
import type { GrowthMetric, GrowthRecord } from '@/types/growth';
import { buildGrowthCurveModel, type RangeMode, type StandardMode } from '@/domain/growthCurve';
import { theme } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;

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

const METRIC_META: Record<GrowthMetric, { label: string; unit: string }> = {
  weight: { label: '体重', unit: 'kg' },
  height: { label: '身高', unit: 'cm' },
  head: { label: '头围', unit: 'cm' },
};

const SERIES_COLORS = {
  p97: 'rgba(229, 115, 115, 0.7)',
  p85: 'rgba(255, 183, 77, 0.7)',
  p50: 'rgba(107, 154, 196, 1)',
  p15: 'rgba(129, 199, 132, 0.7)',
  p3: 'rgba(229, 115, 115, 0.7)',
  user: 'rgba(255, 107, 107, 1)',
};

function toFixedSafe(value: number, fraction = 1): string {
  return Number.isFinite(value) ? value.toFixed(fraction) : '--';
}

function interpolateUserSeries(xValues: number[], userPoints: { x: number; value: number }[]): number[] {
  if (userPoints.length === 0) return xValues.map(() => Number.NaN);
  if (userPoints.length === 1) {
    const target = userPoints[0];
    return xValues.map((x) => (Math.abs(x - target.x) < 0.51 ? target.value : target.value));
  }
  return xValues.map((x) => {
    if (x <= userPoints[0].x) return userPoints[0].value;
    if (x >= userPoints[userPoints.length - 1].x) return userPoints[userPoints.length - 1].value;
    for (let i = 0; i < userPoints.length - 1; i++) {
      const left = userPoints[i];
      const right = userPoints[i + 1];
      if (x >= left.x && x <= right.x) {
        const ratio = (x - left.x) / (right.x - left.x || 1);
        return left.value + (right.value - left.value) * ratio;
      }
    }
    return Number.NaN;
  });
}

function buildSparseLabels(xValues: number[], unit: 'month' | 'week', maxVisible = 8): string[] {
  if (xValues.length <= maxVisible) {
    return xValues.map((x) => `${Math.round(x * 10) / 10}${unit === 'month' ? '月' : '周'}`);
  }
  const step = Math.ceil(xValues.length / maxVisible);
  return xValues.map((x, idx) => (idx % step === 0 ? `${Math.round(x * 10) / 10}${unit === 'month' ? '月' : '周'}` : ''));
}

type LegendState = {
  p97: boolean;
  p85: boolean;
  p50: boolean;
  p15: boolean;
  p3: boolean;
  user: boolean;
};

const defaultLegend: LegendState = {
  p97: true,
  p85: true,
  p50: true,
  p15: true,
  p3: true,
  user: true,
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
  const [standardMode, setStandardMode] = useState<StandardMode>('auto');
  const [manualStandard, setManualStandard] = useState<'WHO' | 'FENTON'>('WHO');
  const [rangeMode, setRangeMode] = useState<RangeMode>('smart');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.5);
  const [legend, setLegend] = useState<LegendState>(defaultLegend);
  const [tooltipText, setTooltipText] = useState('');

  const model = useMemo(
    () =>
      buildGrowthCurveModel({
        baby,
        metric,
        records,
        ageType,
        rangeMode,
        standardMode,
        manualStandard: standardMode === 'manual' ? manualStandard : undefined,
      }),
    [baby, metric, records, ageType, rangeMode, standardMode, manualStandard]
  );

  const meta = METRIC_META[metric];

  const xValues = useMemo(() => model.standardPoints.map((p) => p.x), [model.standardPoints]);
  const labels = useMemo(() => buildSparseLabels(xValues, model.meta.axisUnit), [xValues, model.meta.axisUnit]);
  const userData = useMemo(() => interpolateUserSeries(xValues, model.userPoints), [xValues, model.userPoints]);

  const chartData = useMemo(() => {
    const datasets: { data: number[]; color: (opacity?: number) => string; strokeWidth: number }[] = [];
    if (legend.p97) datasets.push({ data: model.standardPoints.map((p) => p.p97), color: () => SERIES_COLORS.p97, strokeWidth: 1 });
    if (legend.p85) datasets.push({ data: model.standardPoints.map((p) => p.p85), color: () => SERIES_COLORS.p85, strokeWidth: 1 });
    if (legend.p50) datasets.push({ data: model.standardPoints.map((p) => p.p50), color: () => SERIES_COLORS.p50, strokeWidth: 2 });
    if (legend.p15) datasets.push({ data: model.standardPoints.map((p) => p.p15), color: () => SERIES_COLORS.p15, strokeWidth: 1 });
    if (legend.p3) datasets.push({ data: model.standardPoints.map((p) => p.p3), color: () => SERIES_COLORS.p3, strokeWidth: 1 });
    if (legend.user && model.userPoints.length > 0) {
      datasets.push({ data: userData, color: () => SERIES_COLORS.user, strokeWidth: 2 });
    }
    return { labels, datasets };
  }, [labels, legend, model.standardPoints, model.userPoints.length, userData]);

  const toggleLegend = (key: keyof LegendState) => {
    setLegend((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderChart = (width: number, height: number) => (
    <LineChart
      data={chartData}
      width={width}
      height={height}
      fromZero={false}
      bezier={false}
      withInnerLines
      withOuterLines
      withVerticalLines={false}
      withHorizontalLines
      withVerticalLabels
      withHorizontalLabels
      yAxisInterval={1}
      yAxisSuffix=""
      chartConfig={{
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        decimalPlaces: 1,
        color: () => theme.colors.primary,
        labelColor: () => theme.colors.textSub,
        propsForDots: {
          r: '3',
          strokeWidth: '1',
          stroke: '#FFFFFF',
        },
      }}
      style={styles.chart}
      onDataPointClick={({ index, value }) => {
        const x = xValues[index];
        const unit = model.meta.axisUnit === 'month' ? '月' : '周';
        setTooltipText(`年龄 ${toFixedSafe(x, 1)}${unit} · 数值 ${toFixedSafe(value, 2)}${meta.unit}`);
      }}
    />
  );

  const latestPercentileText =
    model.assessment.latestPercentile === null ? '--' : `P${Math.round(model.assessment.latestPercentile)}`;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meta.label}曲线</Text>
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
        <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setIsFullscreen(true)}>
          <Text style={styles.fullscreenText}>全屏</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricSwitch}>
        {(Object.keys(METRIC_META) as GrowthMetric[]).map((key) => {
          const active = metric === key;
          return (
            <TouchableOpacity key={key} style={[styles.chip, active && styles.chipActive]} onPress={() => onMetricChange(key)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{METRIC_META[key].label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.modeRow}>
        <View style={styles.inlineGroup}>
          <TouchableOpacity
            style={[styles.smallChip, standardMode === 'auto' && styles.smallChipActive]}
            onPress={() => setStandardMode('auto')}
          >
            <Text style={[styles.smallChipText, standardMode === 'auto' && styles.smallChipTextActive]}>自动</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallChip, standardMode === 'manual' && styles.smallChipActive]}
            onPress={() => setStandardMode('manual')}
          >
            <Text style={[styles.smallChipText, standardMode === 'manual' && styles.smallChipTextActive]}>手动</Text>
          </TouchableOpacity>
          {standardMode === 'manual' && (
            <>
              <TouchableOpacity
                style={[styles.smallChip, manualStandard === 'WHO' && styles.smallChipActive]}
                onPress={() => setManualStandard('WHO')}
              >
                <Text style={[styles.smallChipText, manualStandard === 'WHO' && styles.smallChipTextActive]}>WHO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallChip, manualStandard === 'FENTON' && styles.smallChipActive]}
                onPress={() => setManualStandard('FENTON')}
              >
                <Text style={[styles.smallChipText, manualStandard === 'FENTON' && styles.smallChipTextActive]}>Fenton</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.inlineGroup}>
          <TouchableOpacity
            style={[styles.smallChip, rangeMode === 'smart' && styles.smallChipActive]}
            onPress={() => setRangeMode('smart')}
          >
            <Text style={[styles.smallChipText, rangeMode === 'smart' && styles.smallChipTextActive]}>智能视窗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallChip, rangeMode === 'full' && styles.smallChipActive]}
            onPress={() => setRangeMode('full')}
          >
            <Text style={[styles.smallChipText, rangeMode === 'full' && styles.smallChipTextActive]}>全程视图</Text>
          </TouchableOpacity>
        </View>
      </View>

      {model.meta.isPremature && onAgeTypeChange && model.meta.standard === 'WHO' && (
        <View style={styles.ageTypeSwitch}>
          <TouchableOpacity
            style={[styles.smallChip, ageType === 'actual' && styles.smallChipActive]}
            onPress={() => onAgeTypeChange('actual')}
          >
            <Text style={[styles.smallChipText, ageType === 'actual' && styles.smallChipTextActive]}>实际月龄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallChip, ageType === 'corrected' && styles.smallChipActive]}
            onPress={() => onAgeTypeChange('corrected')}
          >
            <Text style={[styles.smallChipText, ageType === 'corrected' && styles.smallChipTextActive]}>矫正月龄</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.metaText}>{model.meta.description}</Text>

      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentText}>最新百分位：{latestPercentileText}</Text>
        <Text style={styles.assessmentText}>区间标签：{model.assessment.zone ?? '--'}</Text>
        <Text style={styles.assessmentText}>近3次趋势：{model.assessment.trend}</Text>
      </View>

      <View style={styles.chartWrapper}>
        {model.standardPoints.length > 0 ? (
          renderChart(screenWidth - theme.layout.pagePadding * 3, 240)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无可展示的标准曲线数据</Text>
          </View>
        )}
      </View>

      {tooltipText ? <Text style={styles.tooltipText}>{tooltipText}</Text> : null}

      <View style={styles.legend}>
        {([
          ['p97', 'P97'],
          ['p85', 'P85'],
          ['p50', 'P50'],
          ['p15', 'P15'],
          ['p3', 'P3'],
          ['user', '宝宝'],
        ] as [keyof LegendState, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} style={styles.legendItem} onPress={() => toggleLegend(key)}>
            <View style={[styles.legendDot, { backgroundColor: SERIES_COLORS[key], opacity: legend[key] ? 1 : 0.3 }]} />
            <Text style={[styles.legendText, !legend[key] && styles.legendTextMuted]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {onRefresh && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshText}>刷新</Text>
        </TouchableOpacity>
      )}

      <RNModal visible={isFullscreen} animationType="slide" onRequestClose={() => setIsFullscreen(false)}>
        <View style={styles.fullscreenContainer}>
          <View style={styles.fullscreenHeader}>
            <Text style={styles.fullscreenTitle}>{meta.label}全屏曲线</Text>
            <View style={styles.fullscreenActions}>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setZoom((z) => Math.max(1, Math.round((z - 0.5) * 10) / 10))}
              >
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.zoomLevel}>{zoom.toFixed(1)}x</Text>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setZoom((z) => Math.min(3, Math.round((z + 0.5) * 10) / 10))}
              >
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsFullscreen(false)}>
                <Text style={styles.closeText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal contentContainerStyle={styles.fullscreenChartContent} showsHorizontalScrollIndicator>
            {renderChart(screenWidth * zoom, 360)}
          </ScrollView>

          {tooltipText ? <Text style={styles.tooltipText}>{tooltipText}</Text> : null}
        </View>
      </RNModal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  fullscreenBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  fullscreenText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  metricSwitch: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#DCE5EE',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSub,
    fontSize: theme.fontSizes.sm,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeRow: {
    gap: theme.spacing.xs,
  },
  inlineGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  smallChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: '#DCE5EE',
  },
  smallChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  smallChipText: {
    color: theme.colors.textSub,
    fontSize: theme.fontSizes.xs,
  },
  smallChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ageTypeSwitch: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.textSub,
    fontSize: theme.fontSizes.xs,
  },
  assessmentCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    gap: 4,
  },
  assessmentText: {
    color: theme.colors.textMain,
    fontSize: theme.fontSizes.sm,
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
  },
  emptyState: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.textSub,
  },
  tooltipText: {
    color: theme.colors.textSub,
    fontSize: theme.fontSizes.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  legendTextMuted: {
    opacity: 0.5,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primaryLight,
  },
  refreshText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullscreenTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  fullscreenActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: theme.colors.textMain,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },
  zoomLevel: {
    minWidth: 40,
    textAlign: 'center',
    color: theme.colors.textSub,
    fontSize: theme.fontSizes.xs,
  },
  closeBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  closeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
  },
  fullscreenChartContent: {
    paddingRight: theme.spacing.lg,
  },
});
