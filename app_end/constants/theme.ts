/**
 * 主题配置
 * 整合所有设计 token，支持温暖有机美学风格
 */

import { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows, Fonts, Layout } from './tokens';
import { OrganicColors, OrganicGradients, OrganicShapes, OrganicShadows, OrganicAnimation, OrganicTypography, OrganicSpacing } from './organic-tokens';

// 原有设计系统
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

// 温暖有机美学主题
export const organicTheme = {
  colors: OrganicColors,
  gradients: OrganicGradients,
  shapes: OrganicShapes,
  shadows: OrganicShadows,
  animation: OrganicAnimation,
  typography: OrganicTypography,
  spacing: OrganicSpacing,
} as const;

export type Theme = typeof theme;
export type OrganicTheme = typeof organicTheme;

// 便于需要单独引用 token 的场景
export { Colors, Gradients, Spacing, BorderRadius, FontSizes, Shadows, Fonts, Layout };
export { OrganicColors, OrganicGradients, OrganicShapes, OrganicShadows, OrganicAnimation, OrganicTypography, OrganicSpacing };
