import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';

type Props = {
  icon?: React.ComponentProps<typeof IconSymbol>['name'];
  label?: string;
  onPress?: () => void;
  visible?: boolean;
  style?: ViewStyle;
};

export const FloatingActionButton: React.FC<Props> = ({
  icon = 'plus.circle.fill',
  label = '添加',
  onPress,
  visible = true,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        { transform: [{ scale: visible ? 1 : 0 }] },
        style,
      ]}
    >
      <IconSymbol name={icon} size={28} color={theme.colors.surface} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.layout.fab.bottom,
    width: theme.layout.fab.size,
    height: theme.layout.fab.size,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...theme.shadows.fab,
  },
  label: {
    color: theme.colors.surface,
    fontSize: 10,
    marginTop: 2,
  },
});
