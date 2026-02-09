import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { theme } from '@/constants/theme';
import type { GrowthRecord, GrowthMetric } from '@/types/growth';

type Props = {
  records: GrowthRecord[];
  loading?: boolean;
  error?: string | null;
  onAdd: () => void;
  onRefresh?: () => void;
};

const metricMeta: Record<GrowthMetric, { label: string; unit: string }> = {
  weight: { label: '体重', unit: 'kg' },
  height: { label: '身高', unit: 'cm' },
  head: { label: '头围', unit: 'cm' },
};

export const GrowthCard: React.FC<Props> = ({ records, loading, error, onAdd, onRefresh }) => {
  const [metric, setMetric] = useState<GrowthMetric>('weight');

  const filtered = useMemo(() => {
    const list = records
      .filter((item) => item.metric === metric)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    return list.slice(-5);
  }, [metric, records]);

  const chartData = useMemo(() => {
    if (filtered.length === 0) return [];
    const values = filtered.map((r) => r.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return filtered.map((item, index) => {
      const x = filtered.length === 1 ? 0.5 : index / (filtered.length - 1);
      const y = (item.value - min) / range;
      return { x, y, label: item.recordedAt, value: item.value };
    });
  }, [filtered]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>成长记录</Text>
        <View style={styles.metricSwitch}>
          {(Object.keys(metricMeta) as GrowthMetric[]).map((key) => {
            const active = metric === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.metricChip, active && styles.metricChipActive]}
                onPress={() => setMetric(key)}
              >
                <Text style={[styles.metricChipText, active && styles.metricChipTextActive]}>
                  {metricMeta[key].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ChartContainer
        title={`${metricMeta[metric].label}曲线`}
        subtitle="最近 5 条记录"
        height={240}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.mutedText}>加载中</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            {onRefresh && (
              <TouchableOpacity onPress={onRefresh}>
                <Text style={styles.retryText}>重试</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.mutedText}>暂无该指标的记录</Text>
            <Button title="添加记录" onPress={onAdd} size="small" />
          </View>
        ) : (
          <View style={styles.chartArea}>
            <View style={styles.gridRow} />
            <View style={[styles.gridRow, { top: '50%' }]} />
            <View style={[styles.gridRow, { bottom: 0 }]} />
            {chartData.map((point, index) => {
              const left = `${point.x * 100}%`;
              const top = `${(1 - point.y) * 100}%`;
              const next = chartData[index + 1];
              let lineStyle: any = null;
              if (next) {
                const dx = next.x - point.x;
                const dy = next.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const widthPercent = distance * 100;
                const angle = (Math.atan2(dy * -1, dx) * 180) / Math.PI;
                lineStyle = {
                  width: `${widthPercent}%`,
                  transform: [{ rotate: `${angle}deg` }],
                  top: '50%',
                  left: '0%',
                };
              }
              return (
                <React.Fragment key={point.label + index}>
                  {lineStyle && (
                    <View
                      style={[
                        styles.line,
                        {
                          position: 'absolute',
                          left,
                          top,
                          ...lineStyle,
                        },
                      ]}
                    />
                  )}
                  <View style={[styles.point, { left: left as any, top: top as any }]} />
                </React.Fragment>
              );
            })}
            <View style={styles.legendRow}>
              <Text style={styles.legendText}>
                {metricMeta[metric].label}（{metricMeta[metric].unit || '单位'}）
              </Text>
              <Text style={styles.legendText}>最近 {filtered.length} 条</Text>
            </View>
          </View>
        )}
      </ChartContainer>

      <Button title="添加记录" onPress={onAdd} variant="primary" size="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.layout.blockGap,
    marginTop: theme.layout.sectionGap,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chartArea: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: theme.colors.bgContent,
    position: 'relative',
  },
  gridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e5e5',
    top: '25%',
  },
  point: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
  line: {
    height: 2,
    backgroundColor: theme.colors.primary,
  },
  legendRow: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedText,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  mutedText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: '#D64545',
  },
  retryText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
