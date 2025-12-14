import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  name: string;
  ageText: string;
  note?: string;
  avatarLabel?: string;
  onPress?: () => void;
};

export const BabySwitcher: React.FC<Props> = ({
  name,
  ageText,
  note,
  avatarLabel = '👶',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarLabel}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{note ? `${ageText} · ${note}` : ageText}</Text>
      </View>
      <Text style={styles.chevron}>⌄</Text>
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
  avatarText: {
    fontSize: 18,
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
  chevron: {
    fontSize: 16,
    color: theme.colors.textSub,
    marginLeft: 8,
  },
});
