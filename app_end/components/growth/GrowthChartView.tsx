import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { organicTheme } from '@/constants/theme';
import { buildGrowthCurveModel, type RangeMode, type StandardMode } from '@/domain/growthCurve';
import { calculateRecordAge } from '@/domain/growthCurve/age';
import type { Baby } from '@/types/baby';
import type { GrowthMetric, GrowthRecord } from '@/types/growth';
import { createGrowthChartPresentation } from './chartPresentation';

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

function formatDateSafe(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function interpolateUserSeries(xValues: number[], userPoints: { x: number; value: number }[]): number[] {
  if (userPoints.length === 0) return xValues.map(() => 0);
  if (userPoints.length === 1) {
    return xValues.map(() => userPoints[0].value);
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

    return userPoints[userPoints.length - 1].value;
  });
}

function interpolateSeries(xValues: number[], points: { x: number; value: number }[]): number[] {
  if (points.length === 0) return xValues.map(() => 0);
  if (points.length === 1) {
    return xValues.map(() => points[0].value);
  }

  return xValues.map((x) => {
    if (x <= points[0].x) return points[0].value;
    if (x >= points[points.length - 1].x) return points[points.length - 1].value;
    for (let i = 0; i < points.length - 1; i++) {
      const left = points[i];
      const right = points[i + 1];
      if (x >= left.x && x <= right.x) {
        const ratio = (x - left.x) / (right.x - left.x || 1);
        return left.value + (right.value - left.value) * ratio;
      }
    }
    return points[points.length - 1].value;
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
  const { width: windowWidth } = useWindowDimensions();

  const [standardMode, setStandardMode] = useState<StandardMode>('auto');
  const [manualStandard, setManualStandard] = useState<'WHO' | 'FENTON'>('WHO');
  const [rangeMode, setRangeMode] = useState<RangeMode>('smart');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
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
    [ageType, baby, manualStandard, metric, rangeMode, records, standardMode]
  );

  const meta = METRIC_META[metric];
  const sortedRecordsByWeek = useMemo(() => {
    return [...records]
      .filter((record) => record.metric === metric)
      .map((record) => {
        const ages = calculateRecordAge(baby, record.recordedAt);
        const actualWeeks = ages.actualMonths * 4.33;
        const week = ages.pmaWeeks ?? actualWeeks;
        return {
          ...record,
          week,
          weekType: ages.pmaWeeks !== null ? 'PMA' : '实际',
        };
      })
      .filter((record) => Number.isFinite(record.week))
      .sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
      });
  }, [baby, records, metric]);

  const xValues = useMemo(() => {
    const merged = [...model.standardPoints.map((p) => p.x), ...model.userPoints.map((p) => p.x)]
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => a - b);

    const deduped: number[] = [];
    for (const x of merged) {
      const last = deduped[deduped.length - 1];
      if (last === undefined || Math.abs(last - x) > 0.0001) {
        deduped.push(x);
      }
    }
    return deduped;
  }, [model.standardPoints, model.userPoints]);
  const labels = useMemo(() => buildSparseLabels(xValues, model.meta.axisUnit), [xValues, model.meta.axisUnit]);
  const userData = useMemo(() => interpolateUserSeries(xValues, model.userPoints), [xValues, model.userPoints]);
  const p97Data = useMemo(
    () => interpolateSeries(xValues, model.standardPoints.map((p) => ({ x: p.x, value: p.p97 }))),
    [xValues, model.standardPoints]
  );
  const p85Data = useMemo(
    () => interpolateSeries(xValues, model.standardPoints.map((p) => ({ x: p.x, value: p.p85 }))),
    [xValues, model.standardPoints]
  );
  const p50Data = useMemo(
    () => interpolateSeries(xValues, model.standardPoints.map((p) => ({ x: p.x, value: p.p50 }))),
    [xValues, model.standardPoints]
  );
  const p15Data = useMemo(
    () => interpolateSeries(xValues, model.standardPoints.map((p) => ({ x: p.x, value: p.p15 }))),
    [xValues, model.standardPoints]
  );
  const p3Data = useMemo(
    () => interpolateSeries(xValues, model.standardPoints.map((p) => ({ x: p.x, value: p.p3 }))),
    [xValues, model.standardPoints]
  );

  const chartData = useMemo(() => {
    const datasets: { data: number[]; color: (opacity?: number) => string; strokeWidth: number }[] = [];

    if (legend.p97) datasets.push({ data: p97Data, color: () => SERIES_COLORS.p97, strokeWidth: 1 });
    if (legend.p85) datasets.push({ data: p85Data, color: () => SERIES_COLORS.p85, strokeWidth: 1 });
    if (legend.p50) datasets.push({ data: p50Data, color: () => SERIES_COLORS.p50, strokeWidth: 2 });
    if (legend.p15) datasets.push({ data: p15Data, color: () => SERIES_COLORS.p15, strokeWidth: 1 });
    if (legend.p3) datasets.push({ data: p3Data, color: () => SERIES_COLORS.p3, strokeWidth: 1 });

    if (legend.user && model.userPoints.length > 0) {
      datasets.push({ data: userData, color: () => SERIES_COLORS.user, strokeWidth: 2 });
    }

    return { labels, datasets };
  }, [labels, legend, model.userPoints.length, p15Data, p3Data, p50Data, p85Data, p97Data, userData]);

  const fullscreenViewportWidth = Math.max(windowWidth - organicTheme.spacing.md * 2, 260);
  const fullscreenChartWidth = Math.max(fullscreenViewportWidth * zoom, fullscreenViewportWidth);
  const inlineChartWidth = Math.max(windowWidth - organicTheme.spacing.lg * 3, 260);
  const chartPresentation = createGrowthChartPresentation();

  const toggleLegend = (key: keyof LegendState) => {
    setLegend((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderChart = (width: number, height: number) => (
    <LineChart
      data={chartData}
      width={width}
      height={height}
      fromZero={false}
      bezier={model.userPoints.length > 1}
      withInnerLines
      withOuterLines
      withVerticalLines={false}
      withHorizontalLines
      withVerticalLabels
      withHorizontalLabels
      withDots
      yAxisInterval={1}
      yAxisSuffix={meta.unit}
      transparent={chartPresentation.transparent}
      chartConfig={chartPresentation.chartConfig}
      style={styles.chart}
      onDataPointClick={({ index, value, dataset }: any) => {
        const x = xValues[index];
        const unit = model.meta.axisUnit === 'month' ? '月' : '周';
        const seriesLabel = dataset?.color?.(1) === SERIES_COLORS.user ? '宝宝记录' : '标准曲线';
        setTooltipText(`${seriesLabel} · 年龄 ${toFixedSafe(x, 1)}${unit} · 数值 ${toFixedSafe(value, 2)}${meta.unit}`);
      }}
    />
  );

  const latestPercentileText =
    model.assessment.latestPercentile === null ? '--' : `P${Math.round(model.assessment.latestPercentile)}`;
  const trendHint =
    model.assessment.trend === '当前标准下无有效点'
      ? '请切换 WHO/Fenton 或检查记录日期、孕周与预产期设置'
      : '';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meta.label}曲线</Text>
          {loading && <ActivityIndicator size="small" color={organicTheme.colors.primary.main} />}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.helpBtn} onPress={() => setIsGuideVisible(true)}>
            <Text style={styles.helpText}>说明</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setIsFullscreen(true)}>
            <Text style={styles.fullscreenText}>全屏</Text>
          </TouchableOpacity>
        </View>
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
        {trendHint ? <Text style={styles.assessmentHint}>{trendHint}</Text> : null}
      </View>

      {standardMode === 'manual' && manualStandard === 'FENTON' && model.assessment.diagnostic && (
        <View style={styles.diagnosticCard}>
          <Text style={styles.diagnosticTitle}>Fenton 曲线诊断信息</Text>
          <Text style={styles.diagnosticText}>
            总记录：{model.assessment.diagnostic.totalRecords} 条
          </Text>
          <Text style={styles.diagnosticText}>
            Fenton有效点：{model.assessment.diagnostic.validFentonPoints} 条（PMA在22-50周）
          </Text>
          {model.assessment.diagnostic.outOfRangePoints > 0 && (
            <Text style={styles.diagnosticText}>
              超范围点：{model.assessment.diagnostic.outOfRangePoints} 条
            </Text>
          )}
          {model.assessment.diagnostic.missingPMAPoints > 0 && (
            <Text style={styles.diagnosticText}>
              缺少PMA字段：{model.assessment.diagnostic.missingPMAPoints} 条
            </Text>
          )}
          {model.assessment.diagnostic.invalidValuePoints > 0 && (
            <Text style={styles.diagnosticText}>
              数值非法：{model.assessment.diagnostic.invalidValuePoints} 条
            </Text>
          )}
          {model.assessment.diagnostic.futureRecordPoints > 0 && (
            <Text style={styles.diagnosticText}>
              记录日期异常：{model.assessment.diagnostic.futureRecordPoints} 条
            </Text>
          )}
          {model.assessment.diagnostic.validFentonPoints === 0 && (
            <Text style={styles.diagnosticHint}>建议查看 WHO 标准曲线</Text>
          )}
        </View>
      )}

      <View style={styles.chartWrapper}>
        {model.standardPoints.length > 0 ? (
          renderChart(inlineChartWidth, 240)
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

      <View style={styles.recordPanel}>
        <Text style={styles.recordPanelTitle}>全部成长记录（按周龄）</Text>
        {sortedRecordsByWeek.length === 0 ? (
          <Text style={styles.recordEmpty}>暂无成长记录</Text>
        ) : (
          sortedRecordsByWeek.map((record) => (
            <View key={`${record.id}-${record.metric}-${record.recordedAt}`} style={styles.recordRow}>
              <View style={styles.recordMain}>
                <Text style={styles.recordMetric}>{METRIC_META[record.metric].label}</Text>
                <Text style={styles.recordValue}>
                  {toFixedSafe(Number(record.value), record.metric === 'weight' ? 2 : 1)}
                  {record.unit}
                </Text>
              </View>
              <View style={styles.recordMeta}>
                <Text style={styles.recordWeek}>
                  {record.weekType} {toFixedSafe(record.week, 1)}周
                </Text>
                <Text style={styles.recordDate}>{formatDateSafe(record.recordedAt)}</Text>
              </View>
            </View>
          ))
        )}
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
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setZoom(1.5);
                }}
              >
                <Text style={styles.resetText}>重置</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsFullscreen(false)}>
                <Text style={styles.closeText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal contentContainerStyle={styles.fullscreenChartContent} showsHorizontalScrollIndicator>
            {renderChart(fullscreenChartWidth, 360)}
          </ScrollView>

          {tooltipText ? <Text style={styles.tooltipText}>{tooltipText}</Text> : null}
        </View>
      </RNModal>

      <RNModal visible={isGuideVisible} animationType="fade" transparent onRequestClose={() => setIsGuideVisible(false)}>
        <View style={styles.guideOverlay}>
          <View style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <Text style={styles.guideTitle}>生长曲线说明</Text>
              <TouchableOpacity style={styles.guideClose} onPress={() => setIsGuideVisible(false)}>
                <Text style={styles.guideCloseText}>关闭</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.guideSectionTitle}>1. 这张图怎么看</Text>
              <Text style={styles.guideText}>横轴是月龄/周龄，纵轴是当前指标数值。</Text>
              <Text style={styles.guideText}>红色“宝宝”线是你家宝宝的真实记录点并平滑连接。</Text>

              <Text style={styles.guideSectionTitle}>2. 百分位线含义</Text>
              <Text style={styles.guideText}>P50 代表同龄宝宝的中位数，P3/P97 是常见参考边界。</Text>
              <Text style={styles.guideText}>宝宝线长期明显低于 P3 或高于 P97，建议线下咨询医生。</Text>

              <Text style={styles.guideSectionTitle}>3. WHO 与 Fenton</Text>
              <Text style={styles.guideText}>WHO 常用于足月婴幼儿；Fenton 常用于早产儿早期评估。</Text>
              <Text style={styles.guideText}>你可在上方切换自动/手动标准查看不同参考口径。</Text>
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    padding: organicTheme.spacing.lg,
    ...organicTheme.shadows.soft[0],
    gap: organicTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
  },
  helpBtn: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    backgroundColor: organicTheme.colors.background.paper,
  },
  helpText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.sm,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  fullscreenBtn: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  fullscreenText: {
    color: organicTheme.colors.primary.main,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  metricSwitch: {
    flexDirection: 'row',
    gap: organicTheme.spacing.sm,
  },
  chip: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
    backgroundColor: organicTheme.colors.background.paper,
  },
  chipActive: {
    backgroundColor: organicTheme.colors.primary.main,
    borderColor: organicTheme.colors.border.accent,
  },
  chipText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
  },
  chipTextActive: {
    color: organicTheme.colors.background.paper,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  modeRow: {
    gap: organicTheme.spacing.xs,
  },
  inlineGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.xs,
  },
  smallChip: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 5,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
    backgroundColor: organicTheme.colors.background.paper,
  },
  smallChipActive: {
    backgroundColor: organicTheme.colors.primary.pale,
    borderColor: organicTheme.colors.border.accent,
  },
  smallChipText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  smallChipTextActive: {
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  ageTypeSwitch: {
    flexDirection: 'row',
    gap: organicTheme.spacing.xs,
  },
  metaText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  assessmentCard: {
    backgroundColor: organicTheme.colors.primary.pale,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    padding: organicTheme.spacing.sm,
    gap: 4,
  },
  assessmentText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
  },
  assessmentHint: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  diagnosticCard: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.subtle,
    padding: organicTheme.spacing.sm,
    gap: 4,
  },
  diagnosticTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  diagnosticText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
    lineHeight: 18,
  },
  diagnosticHint: {
    color: organicTheme.colors.primary.main,
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.medium,
    marginTop: 4,
  },
  chartWrapper: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.subtle,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
  },
  emptyState: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: organicTheme.colors.text.secondary,
  },
  tooltipText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: organicTheme.spacing.sm,
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
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  legendTextMuted: {
    opacity: 0.5,
  },
  recordPanel: {
    borderWidth: 1,
    borderColor: organicTheme.colors.border.subtle,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    padding: organicTheme.spacing.sm,
    gap: organicTheme.spacing.xs,
    backgroundColor: organicTheme.colors.background.paper,
  },
  recordPanelTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  recordEmpty: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  recordRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: organicTheme.colors.border.subtle,
    gap: 2,
  },
  recordMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordMetric: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
  },
  recordValue: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordWeek: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  recordDate: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.xs,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  refreshText: {
    color: organicTheme.colors.primary.main,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: organicTheme.colors.background.cream,
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.lg,
    gap: organicTheme.spacing.sm,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullscreenTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  fullscreenActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: organicTheme.colors.background.paper,
  },
  zoomText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  zoomLevel: {
    minWidth: 40,
    textAlign: 'center',
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  resetBtn: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    backgroundColor: organicTheme.colors.background.paper,
  },
  resetText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
  },
  closeBtn: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  closeText: {
    color: organicTheme.colors.primary.main,
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  fullscreenChartContent: {
    paddingRight: organicTheme.spacing.lg,
  },
  guideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: organicTheme.spacing.lg,
  },
  guideCard: {
    maxHeight: '80%',
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
    padding: organicTheme.spacing.lg,
    gap: organicTheme.spacing.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  guideClose: {
    paddingHorizontal: organicTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.primary.pale,
  },
  guideCloseText: {
    color: organicTheme.colors.primary.main,
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  guideSectionTitle: {
    marginTop: organicTheme.spacing.sm,
    marginBottom: 4,
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  guideText: {
    marginBottom: 2,
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: 20,
  },
});
