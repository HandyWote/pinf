import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme, theme } from '@/constants/theme';

type Props = {
  name: string;
  ageText: string;
  note?: string;
  avatarIcon?: React.ComponentProps<typeof IconSymbol>['name'];
  onPress?: () => void;
};

export const BabySwitcher: React.FC<Props> = ({
  name,
  ageText,
  note,
  avatarIcon = 'figure.child',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <IconSymbol name={avatarIcon} size={organicTheme.iconSizes.sm} color={theme.colors.textMain} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{note ? `${ageText} · ${note}` : ageText}</Text>
      </View>
      <IconSymbol name="chevron.down" size={organicTheme.iconSizes.xs} color={theme.colors.textSub} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    ...theme.shadows.small,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAA7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  meta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
    marginTop: 2,
  },
});
