"use no memo";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { OrganicButton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { getAppointmentSummary } from '@/services/api/appointment';
import { useAuthStore } from '@/store';
import type { AppointmentSummary } from '@/types/appointment';
import { formatAppointmentDateTime } from '@/utils/appointment';

const PREVIEW_LIMIT = 3;
const AUTH_SEGMENTS = new Set(['login', 'set-password']);

export function AppointmentReminderOverlay() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [visible, setVisible] = useState(false);
  const shownKeyRef = useRef('');

  const currentSegment = segments[0] || '';
  const isAuthFlow = AUTH_SEGMENTS.has(currentSegment);
  const routeKey = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || isAuthFlow) {
      shownKeyRef.current = '';
      setVisible(false);
      return;
    }

    const todayKey = `${user?.id ?? 'anonymous'}:${new Date().toDateString()}`;
    if (shownKeyRef.current === todayKey) {
      return;
    }

    let cancelled = false;
    getAppointmentSummary()
      .then((data) => {
        if (cancelled) return;

        if (data.counts.total <= 0) {
          setSummary(null);
          setVisible(false);
          return;
        }

        shownKeyRef.current = todayKey;
        setSummary(data);
        setVisible(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
          setVisible(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthFlow, isLoading, routeKey, user?.id]);

  const previewItems = useMemo(() => {
    if (!summary) return [];
    return [...summary.today, ...summary.upcoming].slice(0, PREVIEW_LIMIT);
  }, [summary]);

  if (!summary) return null;

  const headerText =
    summary.counts.today > 0
      ? `今天有 ${summary.counts.today} 个预约`
      : `未来 ${summary.windowDays} 天内有 ${summary.counts.upcoming} 个预约`;
  const subText =
    summary.counts.today > 0 && summary.counts.upcoming > 0
      ? `另外还有 ${summary.counts.upcoming} 个预约将在 ${summary.windowDays} 天内到来`
      : '建议尽早确认就诊时间和所需材料';

  const handleClose = () => setVisible(false);
  const handleViewAll = () => {
    setVisible(false);
    router.push('/appointments');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.titleRow}>
                <IconSymbol
                  size={organicTheme.iconSizes.sm}
                  name="calendar"
                  color={organicTheme.colors.primary.main}
                />
                <Text style={styles.title}>{headerText}</Text>
              </View>
              <Text style={styles.subtitle}>{subText}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={10}>
              <IconSymbol
                size={organicTheme.iconSizes.sm}
                name="xmark.circle.fill"
                color={organicTheme.colors.text.tertiary}
              />
            </Pressable>
          </View>

          <View style={styles.list}>
            {previewItems.map((item) => (
              <View key={item.id} style={styles.listRow}>
                <View style={styles.dot} />
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item.clinic}</Text>
                  <Text style={styles.listMeta}>
                    {formatAppointmentDateTime(item.scheduledAt)} · {item.department}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <OrganicButton title="稍后" variant="ghost" size="small" onPress={handleClose} />
            <OrganicButton title="查看预约" size="small" onPress={handleViewAll} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: organicTheme.spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  card: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.accent,
    padding: organicTheme.spacing.lg,
    ...organicTheme.shadows.floating[1],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: organicTheme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: organicTheme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
  },
  title: {
    flex: 1,
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  subtitle: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: 20,
  },
  list: {
    marginTop: organicTheme.spacing.md,
    gap: organicTheme.spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: organicTheme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: organicTheme.colors.primary.main,
    marginTop: 6,
  },
  listCopy: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  listMeta: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.xs,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: organicTheme.spacing.sm,
    marginTop: organicTheme.spacing.md,
  },
});
