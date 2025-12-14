/**
 * 主题配置
 * 整合所有设计 token
 */

import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows, Fonts, Layout } from './tokens';

export const theme = {
  colors: Colors,
  gradients: Gradients,
  spacing: Spacing,
  borderRadius: BorderRadius,
  fontSizes: FontSizes,
  shadows: Shadows,
  fonts: Fonts,
  layout: Layout,
} as const;

export type Theme = typeof theme;

// 便于需要单独引用 token 的场景
export { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows, Fonts, Layout };
