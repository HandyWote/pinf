/**
 * 主题配置
 * 整合所有设计 token
 */

import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows, Fonts } from './tokens';

export const theme = {
  colors: Colors,
  gradients: Gradients,
  spacing: Spacing,
  borderRadius: BorderRadius,
  fontSizes: FontSizes,
  shadows: Shadows,
  fonts: Fonts,
} as const;

export type Theme = typeof theme;
