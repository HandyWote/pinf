import { organicTheme } from '@/constants/theme';

export function createGrowthChartPresentation() {
  return {
    transparent: true,
    chartConfig: {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'transparent',
      backgroundGradientTo: 'transparent',
      decimalPlaces: 1,
      color: () => organicTheme.colors.primary.main,
      labelColor: () => organicTheme.colors.text.secondary,
      propsForDots: {
        r: '3',
        strokeWidth: '1',
        stroke: organicTheme.colors.background.paper,
      },
    },
  };
}
