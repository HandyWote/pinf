import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const ICON_SYMBOL_MAP = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'message.fill': 'chatbubble',
  'play.circle.fill': 'play-circle',
  'bell.fill': 'notifications',
  'person.circle.fill': 'person-circle',
  'person.crop.circle': 'person-circle-outline',
  'chart.bar.fill': 'bar-chart',
  calendar: 'calendar-outline',
  'folder.fill': 'folder',
  'rectangle.stack.fill': 'layers',
  magnifyingglass: 'search',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.left': 'chevron-back',
  'chevron.right': 'chevron-forward',
  'chevron.down': 'chevron-down',
  plus: 'add',
  'plus.circle.fill': 'add-circle',
  'xmark.circle.fill': 'close-circle',
  'figure.child': 'happy',
  iphone: 'phone-portrait',
  'key.fill': 'key',
  'lock.fill': 'lock-closed',
  'wrench.and.screwdriver': 'construct',
  'arrow.clockwise': 'refresh',
  'arrow.triangle.2.circlepath': 'sync',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'list.bullet': 'list',
  'checkmark.circle.fill': 'checkmark-circle',
  'sun.max': 'sunny',
  sun: 'sunny-outline',
  'hand.wave.fill': 'hand-left',
} as const satisfies Record<string, IoniconName>;

export type IconSymbolName = keyof typeof ICON_SYMBOL_MAP;
