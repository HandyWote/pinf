import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';

type ActionItem = {
  id: string;
  title: string;
  icon: IconSymbolName;
  tint?: string;
  onPress?: () => void;
};

type Props = {
  items: ActionItem[];
};

export const ActionGrid: React.FC<Props> = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          style={[styles.card, { backgroundColor: item.tint ?? theme.colors.primaryLight }]}
          onPress={item.onPress}
        >
          <View style={styles.iconWrap}>
            <IconSymbol name={item.icon} size={22} color={theme.colors.surface} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.sm,
  },
  card: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
    ...theme.shadows.small,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
});
