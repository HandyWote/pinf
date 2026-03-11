import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Pressable, Platform } from 'react-native';

// PlatformPressable 在 Web 上需要导航主题，改用 Pressable
export function HapticTab(props: BottomTabBarButtonProps) {
  // Web 环境下使用普通 Pressable 避免主题问题
  if (Platform.OS === 'web') {
    return (
      <Pressable
        {...props}
        onPressIn={(ev) => {
          props.onPressIn?.(ev);
        }}
      />
    );
  }

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
