import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';
import { Tag } from '@/components/ui';

type Badge = { label: string };

type Props = {
  babyName: string;
  ageText: string;
  detailText: string;
  badges?: Badge[];
  actionLabel?: string;
  onAction?: () => void;
};

export const AgeCard: React.FC<Props> = ({
  babyName,
  ageText,
  detailText,
  badges = [],
  actionLabel,
  onAction,
}) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, '#86B3D1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.decorBig} />
      <View style={styles.decorSmall} />
      <Text style={styles.label}>宝宝年龄</Text>
      <Text style={styles.title}>{ageText}</Text>
      <Text style={styles.desc}>{detailText}</Text>
      <View style={styles.badgeRow}>
        {badges.map((badge) => (
          <Tag
            key={badge.label}
            label={badge.label}
            variant="primary"
            size="small"
            style={styles.badge}
            textStyle={styles.badgeText}
          />
        ))}
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAction ?? (() => {})}
        style={styles.linkRow}
      >
        <Text style={styles.linkText}>{actionLabel ?? `${babyName} 的成长记录`}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.card,
  },
  label: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.sm,
    opacity: 0.9,
  },
  title: {
    marginTop: 6,
    color: theme.colors.surface,
    fontSize: 32,
    fontWeight: '800',
  },
  desc: {
    marginTop: 6,
    color: theme.colors.surface,
    fontSize: theme.fontSizes.sm,
    opacity: 0.9,
  },
  decorBig: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -60,
    right: -20,
  },
  decorSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.14)',
    bottom: -40,
    left: 30,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
  },
  badgeText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  linkRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
});
