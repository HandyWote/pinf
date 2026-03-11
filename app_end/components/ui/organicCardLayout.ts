import type { StyleProp, ViewStyle } from 'react-native';

export const organicCardContentFillStyle = { flex: 1 } as const;

export function getOrganicCardContentStyle(
  currentStyle: StyleProp<ViewStyle>,
  contentFill: boolean
): StyleProp<ViewStyle> {
  if (!contentFill) {
    return currentStyle;
  }

  if (currentStyle === undefined) {
    return [organicCardContentFillStyle];
  }

  return [currentStyle, organicCardContentFillStyle];
}
