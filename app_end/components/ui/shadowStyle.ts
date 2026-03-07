import { Platform, type ViewStyle } from 'react-native';

type ShadowOffset = {
  width: number;
  height: number;
};

type ShadowTokens = {
  shadowColor: string;
  shadowOffset: ShadowOffset;
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number;
};

function toRgba(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;

    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  return color;
}

export function buildShadowStyle(shadow: ShadowTokens): ViewStyle {
  if (Platform.OS !== 'web') {
    return shadow;
  }

  return {
    boxShadow: `${shadow.shadowOffset.width}px ${shadow.shadowOffset.height}px ${shadow.shadowRadius}px ${toRgba(
      shadow.shadowColor,
      shadow.shadowOpacity
    )}`,
  };
}
