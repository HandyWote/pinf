/**
 * 温暖有机风格的背景装饰组件
 * 使用柔和的渐变和有机形状创建温馨氛围
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { organicTheme } from '@/constants/theme';

interface OrganicBackgroundProps {
  children?: React.ReactNode;
  variant?: 'morning' | 'sunset' | 'mint' | 'sky';
}

export const OrganicBackground: React.FC<OrganicBackgroundProps> = ({
  children,
  variant = 'morning',
}) => {
  const gradientColors = organicTheme.gradients[`${variant}Dawn` as keyof typeof organicTheme.gradients] ||
    organicTheme.gradients.morningDawn;

  return (
    <View style={styles.container}>
      {/* 主渐变背景 */}
      <LinearGradient
        colors={[gradientColors[0].color, gradientColors[1].color, gradientColors[2].color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* 装饰性有机形状 - 左上 */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blobSmall, styles.blobSmallTopLeft]} />

      {/* 装饰性有机形状 - 右下 */}
      <View style={[styles.blob, styles.blobBottomRight]} />
      <View style={[styles.blobSmall, styles.blobSmallBottomRight]} />

      {/* 内容层 */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: organicTheme.colors.background.cream,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: organicTheme.colors.primary.pale,
    opacity: 0.4,
    filter: 'blur(40px)',
  },
  blobSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: organicTheme.colors.accent.peach,
    opacity: 0.3,
    filter: 'blur(20px)',
  },
  blobTopLeft: {
    top: -80,
    left: -60,
  },
  blobSmallTopLeft: {
    top: 120,
    left: -30,
  },
  blobBottomRight: {
    bottom: -100,
    right: -80,
  },
  blobSmallBottomRight: {
    bottom: 150,
    right: -40,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

/**
 * 卡片式有机背景装饰
 */
export const OrganicCardDecoration: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.glow} />
      <View style={cardStyles.content}>
        {children}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    backgroundColor: organicTheme.colors.primary.pale,
    opacity: 0.3,
    filter: 'blur(8px)',
    zIndex: -1,
  },
  content: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    overflow: 'hidden',
  },
});
