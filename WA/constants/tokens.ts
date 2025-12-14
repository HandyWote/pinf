/**
 * 设计 Token 系统
 * 基于应用原型.html 的设计规范
 */

export const Colors = {
  // 主色系
  primary: '#6B9AC4',
  primaryLight: '#EBF4FA',
  accent: '#FF9F89',
  
  // 背景色
  bgBody: '#dfe6e9', // 机身背景
  bgContent: '#F0F4F8', // 内容背景
  surface: '#FFFFFF',
  
  // 文本色
  textMain: '#2D3436',
  textSub: '#8B9BB4',
  
  // 边框
  frameBorder: '#2D3436',
  
  // 中性色
  mutedBg: '#F0F0F0',
  mutedText: '#999999',
  divider: '#dddddd',
  iconMute: '#cccccc',
  tagBg: '#eeeeee',
} as const;

export const Gradients = {
  brand: 'linear-gradient(135deg, #6B9AC4 0%, #86B3D1 100%)',
  warm: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  purple: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  green: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  sunset: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
} as const;

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const BorderRadius = {
  small: 10,
  medium: 14,
  large: 20,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#6B9AC4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  frame: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 20,
  },
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;
