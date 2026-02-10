import Ionicons from '@expo/vector-icons/Ionicons';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { ICON_SYMBOL_MAP, type IconSymbolName } from './icon-symbol-map';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return <Ionicons color={color} size={size} name={ICON_SYMBOL_MAP[name]} style={style} />;
}
