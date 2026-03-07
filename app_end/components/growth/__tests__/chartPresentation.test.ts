import { createGrowthChartPresentation } from '../chartPresentation';

describe('createGrowthChartPresentation', () => {
  it('enables transparent chart background on native chart', () => {
    const presentation = createGrowthChartPresentation();

    expect(presentation.transparent).toBe(true);
    expect(presentation.chartConfig.backgroundGradientFrom).toBe('transparent');
    expect(presentation.chartConfig.backgroundGradientTo).toBe('transparent');
  });
});
