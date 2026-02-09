// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'message.fill': 'chat-bubble',
  'play.circle.fill': 'play-circle',
  'bell.fill': 'notifications',
  'person.circle.fill': 'person',
  'person.crop.circle': 'account-circle',
  'chart.bar.fill': 'insights',
  'calendar': 'calendar-today',
  'folder.fill': 'folder',
  'rectangle.stack.fill': 'layers',
  'magnifyingglass': 'search',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.down': 'expand-more',
  'plus.circle.fill': 'add-circle',
  'xmark.circle.fill': 'cancel',
  'figure.child': 'child-care',
  'iphone': 'phone',
  'key.fill': 'vpn-key',
  'lock.fill': 'lock',
  'wrench.and.screwdriver': 'build',
  'arrow.clockwise': 'refresh',
  'arrow.triangle.2.circlepath': 'sync',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'list.bullet': 'list',
  'checkmark.circle.fill': 'check-circle',
  'sun.max': 'wb-sunny',
  'sun': 'light-mode',
  'event': 'event',
  'event.note': 'event-note',
  'waving.hand': 'front-hand',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
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
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
