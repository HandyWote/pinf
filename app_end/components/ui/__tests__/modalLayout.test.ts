import { getModalScrollViewStyle, modalScrollFlexStyle } from '../modalLayout';

describe('getModalScrollViewStyle', () => {
  it('does not force ScrollView flex in auto-height modal', () => {
    const currentStyle = { paddingBottom: 12 };

    expect(getModalScrollViewStyle(currentStyle, true)).toBe(currentStyle);
  });

  it('appends flex style for fixed-height modal', () => {
    const currentStyle = { paddingBottom: 12 };

    expect(getModalScrollViewStyle(currentStyle, false)).toEqual([
      currentStyle,
      modalScrollFlexStyle,
    ]);
  });
});
