import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { theme } from '@/constants/theme';

type MetricInput = {
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
};

type Props = {
  onSave?: () => void;
};

const metricInputs: MetricInput[] = [
  { label: '体重 (kg)', placeholder: '0.0', keyboardType: 'numeric' },
  { label: '身高 (cm)', placeholder: '0.0', keyboardType: 'numeric' },
  { label: '头围 (cm)', placeholder: '0.0', keyboardType: 'numeric' },
];

export const GrowthCard: React.FC<Props> = ({ onSave }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>成长记录</Text>
      <ChartContainer
        title="成长曲线"
        subtitle="叠加宝宝数据与标准曲线"
        height={220}
      >
        <View style={styles.chartArea}>
          <View style={styles.gridRow} />
          <View style={[styles.gridRow, { top: '50%' }]} />
          <View style={[styles.gridRow, { bottom: 0 }]} />
          <View style={styles.chartLine} />
          <View style={[styles.point, { left: '10%', top: '65%' }]} />
          <View style={[styles.point, { left: '45%', top: '55%' }]} />
          <View style={[styles.point, { left: '80%', top: '35%' }]} />
          <Text style={styles.axisLabelLeft}>0月</Text>
          <Text style={styles.axisLabelRight}>12月</Text>
        </View>
      </ChartContainer>

      <View style={styles.formGrid}>
        {metricInputs.map((item) => (
          <View style={styles.formItem} key={item.label}>
            <Text style={styles.formLabel}>{item.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              keyboardType={item.keyboardType}
              placeholderTextColor={theme.colors.mutedText}
            />
          </View>
        ))}
      </View>

      <Button
        title="保存记录"
        onPress={onSave ?? (() => {})}
        variant="primary"
        size="medium"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.layout.blockGap,
    marginTop: theme.layout.sectionGap,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
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
  chartLine: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    height: 2,
    backgroundColor: theme.colors.primary,
    top: '55%',
    transform: [{ rotate: '-10deg' }],
  },
  point: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  axisLabelLeft: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedText,
  },
  axisLabelRight: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.mutedText,
  },
  formGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  formItem: {
    flex: 1,
    gap: 6,
  },
  formLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMain,
  },
  input: {
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
