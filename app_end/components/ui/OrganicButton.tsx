/**
 * 温暖有机风格的按钮组件
 * 柔和的形状、渐变和触觉反馈动画
 */

import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { organicTheme } from '@/constants/theme';

interface OrganicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const OrganicButton: React.FC<OrganicButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  icon,
  iconPosition = 'left',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      ...organicTheme.animation.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...organicTheme.animation.spring,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: organicTheme.spacing.lg,
      paddingVertical: organicTheme.spacing.sm,
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: organicTheme.spacing.xl,
      paddingVertical: organicTheme.spacing.md,
      minHeight: 48,
    },
    large: {
      paddingHorizontal: organicTheme.spacing['2xl'],
      paddingVertical: organicTheme.spacing.lg,
      minHeight: 56,
    },
  };

  const fontSize = {
    small: organicTheme.typography.fontSize.sm,
    medium: organicTheme.typography.fontSize.base,
    large: organicTheme.typography.fontSize.md,
  };

  const getGradientColors = (): [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return [
          organicTheme.colors.primary.main,
          organicTheme.colors.primary.soft,
        ];
      case 'secondary':
        return [
          organicTheme.colors.accent.peach,
          organicTheme.colors.primary.pale,
        ];
      default:
        return ['#FFFFFF', '#FFFFFF'];
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return organicTheme.colors.primary.pale;
    if (variant === 'ghost') return 'transparent';
    if (variant === 'soft') return organicTheme.colors.primary.pale;
    return undefined;
  };

  const getTextColor = () => {
    if (disabled) return organicTheme.colors.text.secondary;
    if (variant === 'primary' || variant === 'secondary') return '#FFFFFF';
    return organicTheme.colors.text.primary;
  };

  const getBorderColor = () => {
    if (disabled) return organicTheme.colors.border.subtle;
    if (variant === 'ghost') return isPressed ? organicTheme.colors.border.strong : organicTheme.colors.border.accent;
    if (variant === 'soft') return isPressed ? organicTheme.colors.border.default : organicTheme.colors.border.light;
    return isPressed ? organicTheme.colors.border.strong : organicTheme.colors.border.default;
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              { fontSize: fontSize[size], color: getTextColor() },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </>
  );

  const buttonStyle = [
    styles.button,
    sizeStyles[size],
    getBackgroundColor() && { backgroundColor: getBackgroundColor() },
    {
      borderColor: getBorderColor() as string,
      borderWidth: 1,
    },
    style,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={buttonStyle}
      >
        {(variant === 'primary' || variant === 'secondary') && !disabled && (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.content}>{buttonContent}</View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: organicTheme.shapes.borderRadius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  text: {
    fontWeight: organicTheme.typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: organicTheme.spacing.sm,
  },
  iconRight: {
    marginLeft: organicTheme.spacing.sm,
  },
  loader: {
    position: 'absolute',
  },
});

/**
 * 胶囊标签按钮
 */
export const OrganicChipButton: React.FC<{
  label: string;
  active?: boolean;
  onPress: () => void;
}> = ({ label, active = false, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        chipStyles.container,
        active && chipStyles.active,
      ]}
    >
      <Text
        style={[
          chipStyles.text,
          active && chipStyles.activeText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  container: {
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    backgroundColor: organicTheme.colors.background.paper,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
  },
  active: {
    backgroundColor: organicTheme.colors.primary.main,
    borderColor: organicTheme.colors.border.strong,
  },
  text: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.secondary,
  },
  activeText: {
    color: '#FFFFFF',
  },
});
