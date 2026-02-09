/**
 * ChartContainer 组件
 * 图表容器组件，用于包裹生长曲线等图表
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { theme } from '@/constants/theme';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  style,
  height = 300,
}) => {
  return (
    <View style={[styles.container, { minHeight: height }, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.chartArea}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
