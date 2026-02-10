import Animated from 'react-native-reanimated';
import { IconSymbol } from './ui/icon-symbol';
import { organicTheme } from '@/constants/theme';

export function HelloWave() {
  return (
    <Animated.View
      style={{
        width: 32,
        height: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      <IconSymbol size={organicTheme.iconSizes.lg} name="hand.wave.fill" color={organicTheme.colors.text.primary} />
    </Animated.View>
  );
}
