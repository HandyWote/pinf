/**
 * Card 组件
 * 基于应用原型设计的卡片组件
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'lg',
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
  },
  default: {
    ...theme.shadows.card,
  },
  elevated: {
    ...theme.shadows.card,
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 15,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
});
