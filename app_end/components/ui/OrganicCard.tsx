/**
 * 温暖有机风格的卡片组件
 * 柔和的边缘、浮动效果和微妙的动画
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { organicTheme } from '@/constants/theme';

interface OrganicCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'soft' | 'ghost';
  onPress?: () => void;
  style?: ViewStyle;
  shadow?: boolean;
}

export const OrganicCard: React.FC<OrganicCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  shadow = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: organicTheme.animation.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 2,
        duration: organicTheme.animation.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: organicTheme.animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: organicTheme.animation.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const cardContent = (
    <>
      {variant === 'gradient' && (
        <LinearGradient
          colors={[
            organicTheme.colors.primary.pale,
            organicTheme.colors.background.paper,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />
      )}

      {variant === 'glass' && (
        <View style={styles.glassOverlay} />
      )}

      {variant === 'soft' && (
        <View style={styles.softOverlay} />
      )}

      {variant === 'ghost' && (
        <View style={styles.ghostOverlay} />
      )}

      <View style={styles.content}>
        {children}
      </View>
    </>
  );

  const containerStyle = [
    styles.card,
    shadow && styles.shadow,
    variant === 'glass' && styles.glassCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={containerStyle}
      >
        <Animated.View
          style={[
            { transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] },
          ]}
        >
          {cardContent}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.pale,
  },
  shadow: {
    shadowColor: organicTheme.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: organicTheme.colors.primary.pale,
    opacity: 0.3,
  },
  ghostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    padding: organicTheme.spacing.lg,
  },
});

/**
 * 简洁的卡片标题组件
 */
export const OrganicCardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.textContainer}>
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle && (
          <Text style={headerStyles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {action && <View style={headerStyles.action}>{action}</View>}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: organicTheme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.xs,
  },
  subtitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  action: {
    marginLeft: organicTheme.spacing.md,
  },
});
