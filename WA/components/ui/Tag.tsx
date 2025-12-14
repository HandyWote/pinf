/**
 * Tag 组件
 * 基于应用原型设计的标签组件
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface TagProps {
  label: string;
  variant?: 'default' | 'primary' | 'accent' | 'muted';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  size = 'small',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
  },
  
  // Variants
  default: {
    backgroundColor: theme.colors.tagBg,
  },
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  accent: {
    backgroundColor: '#FFEAA7',
  },
  muted: {
    backgroundColor: theme.colors.mutedBg,
  },

  // Sizes
  small: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },

  // Text styles
  text: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '500',
  },
  defaultText: {
    color: theme.colors.textMain,
  },
  primaryText: {
    color: theme.colors.primary,
  },
  accentText: {
    color: '#D35400',
  },
  mutedText: {
    color: theme.colors.mutedText,
  },
});
