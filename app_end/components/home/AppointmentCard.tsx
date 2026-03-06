import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Tag } from '@/components/ui';
import { theme } from '@/constants/theme';

type StatusVariant = 'primary' | 'accent' | 'muted';

type Props = {
  clinic: string;
  department: string;
  dateText: string;
  remindText?: string;
  statusLabel?: string;
  statusVariant?: StatusVariant;
  dateDay?: string;
  dateMonth?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const AppointmentCard: React.FC<Props> = ({
  clinic,
  department,
  dateText,
  remindText,
  statusLabel = '待就诊',
  statusVariant = 'primary',
  dateDay,
  dateMonth,
  actionLabel = '查看详情',
  onAction,
}) => {
  const tagVariant =
    statusVariant === 'accent'
      ? 'accent'
      : statusVariant === 'muted'
        ? 'muted'
        : 'primary';

  return (
    <View style={styles.container}>
      <View style={styles.datePill}>
        <Text style={styles.dateDay}>{dateDay ?? dateText.split('-')[2]?.slice(0, 2)}</Text>
        <Text style={styles.dateMonth}>{dateMonth ?? `${dateText.split('-')[1]}月`}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{clinic}</Text>
          <Tag label={statusLabel} variant={tagVariant} size="small" />
        </View>
        <Text style={styles.subtitle}>{department}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{dateText}</Text>
          {remindText ? <Text style={styles.meta}>{remindText}</Text> : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction ?? (() => {})}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  datePill: {
    width: 60,
    height: 70,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  dateMonth: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  meta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSub,
  },
  linkRow: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
});
