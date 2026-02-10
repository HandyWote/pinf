/**
 * 温暖有机 (Warm Organic) 设计 Token
 * 为早护通应用定制的柔和、自然美学
 */

export const OrganicColors = {
  // 晨曦渐变色系
  morningSky: {
    from: '#FFE5EC',
    via: '#FFF0E5',
    to: '#E8F4F8',
  },

  // 柔和主色
  primary: {
    main: '#FFB5A7',      // 珊瑚粉
    soft: '#FFD4CC',      // 浅珊瑚
    pale: '#FFF0EC',      // 极浅珊瑚
  },

  // 辅助色
  accent: {
    peach: '#FFCB9C',     // 蜜桃
    mint: '#C8E6C9',      // 薄荷绿
    lavender: '#E1D5E7',  // 淡紫
    sky: '#B8E0E8',       // 天蓝
  },

  // 文字色
  text: {
    primary: '#4A4A4A',   // 深灰（非纯黑）
    secondary: '#7A7A7A', // 中灰
    tertiary: '#AAAAAA',  // 浅灰
  },

  // 背景色
  background: {
    cream: '#FFF9F5',     // 奶油色
    paper: '#FFFEFC',     // 纸白
  },

  // 功能色（柔和版本）
  success: '#A5D6A7',
  warning: '#FFE0B2',
  error: '#FFCCCB',
  info: '#BBDEFB',
  // 边框分级
  border: {
    subtle: 'rgba(74, 74, 74, 0.06)',
    light: 'rgba(74, 74, 74, 0.12)',
    default: 'rgba(74, 74, 74, 0.18)',
    strong: 'rgba(74, 74, 74, 0.25)',
    accent: 'rgba(255, 181, 167, 0.45)',
    danger: 'rgba(197, 74, 74, 0.45)',
  },
} as const;

export const OrganicGradients = {
  // 晨曦渐变
  morningDawn: [
    { color: '#FFE5EC', offset: 0 },
    { color: '#FFF0E5', offset: 0.5 },
    { color: '#E8F4F8', offset: 1 },
  ],

  // 温暖日落
  warmSunset: [
    { color: '#FFB5A7', offset: 0 },
    { color: '#FFCB9C', offset: 0.5 },
    { color: '#FFD4CC', offset: 1 },
  ],

  // 薄荷清新
  mintFresh: [
    { color: '#E8F5E9', offset: 0 },
    { color: '#C8E6C9', offset: 0.5 },
    { color: '#A5D6A7', offset: 1 },
  ],

  // 天空柔和
  skyGentle: [
    { color: '#E3F2FD', offset: 0 },
    { color: '#B8E0E8', offset: 0.5 },
    { color: '#90CAF9', offset: 1 },
  ],
} as const;

export const OrganicShapes = {
  // 圆角 - 更加圆润
  borderRadius: {
    cozy: 16,
    soft: 24,
    pill: 999,
  },

  // 装饰性形状
  decoration: {
    blob: 'M50 0C61.5 0 72.2 4.7 80.4 12.8C88.5 20.9 94 31.5 94 42.5C94 53.5 88.5 64.1 80.4 72.2C72.2 80.3 61.5 85 50.5 85C39.5 85 28.8 80.3 20.6 72.2C12.5 64.1 7 53.5 7 42.5C7 31.5 12.5 20.9 20.6 12.8C28.8 4.7 39.5 0 50 0Z',
  },
} as const;

export const OrganicShadows = {
  // 柔和多层阴影
  soft: [
    { shadowColor: '#FFB5A7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 8 },
  ],

  // 浮动效果
  floating: [
    { shadowColor: '#FFB5A7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
    { shadowColor: '#000000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 16 },
  ],

  // 内阴影（凹陷效果）
  inset: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const OrganicAnimation = {
  // 弹性动画
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },

  // 缓动曲线
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // 持续时间
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;

export const OrganicTypography = {
  // 字体家族 - React Native 使用系统字体
  fontFamily: {
    // iOS
    ios: {
      regular: 'SF Pro Text',
      medium: 'SF Pro Text',
      semibold: 'SF Pro Display',
      bold: 'SF Pro Display',
      display: 'Avenir Next',
      mono: 'Menlo',
    },
    // Android
    android: {
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      semibold: 'sans-serif-medium',
      bold: 'sans-serif',
      display: 'sans-serif-medium',
      mono: 'monospace',
    },
  },

  // 字重
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // 字号
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },

  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // 字距
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    relaxed: 0.2,
    wide: 0.4,
  },
} as const;

export const OrganicSpacing = {
  // 间距系统 (8px 基准)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const OrganicIconSizes = {
  xxs: 14,
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  tab: 22,
} as const;
