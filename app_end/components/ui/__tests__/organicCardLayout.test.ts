import {
  getOrganicCardContentStyle,
  organicCardContentFillStyle,
} from '../organicCardLayout';

describe('getOrganicCardContentStyle', () => {
  it('adds fill style when contentFill is enabled', () => {
    const currentStyle = { padding: 16 };
    const result = getOrganicCardContentStyle(currentStyle, true);
    expect(result).toEqual([currentStyle, organicCardContentFillStyle]);
  });

  it('keeps default style when contentFill is disabled', () => {
    const currentStyle = { padding: 16 };
    const result = getOrganicCardContentStyle(currentStyle, false);
    expect(result).toBe(currentStyle);
  });
});
