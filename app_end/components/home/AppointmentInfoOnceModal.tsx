"use no memo";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSegments } from 'expo-router';

import { OrganicButton } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import { useAuthStore } from '@/store';
import { useAppointmentStore } from '@/store/appointmentStore';
import { formatAppointmentDateTime } from '@/utils/appointment';

const MAX_ITEMS = 6;
const AUTH_SEGMENTS = new Set(['login', 'set-password']);

export function AppointmentInfoOnceModal() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { appointments, fetch, loading } = useAppointmentStore();
  const [visible, setVisible] = useState(false);
  const shownInSessionRef = useRef(false);
  const currentSegment = segments[0] || '';
  const isAuthFlow = AUTH_SEGMENTS.has(currentSegment);

  useEffect(() => {
    if (!isAuthenticated || isAuthFlow) {
      shownInSessionRef.current = false;
      setVisible(false);
      return;
    }

    fetch().catch(() => {});
  }, [fetch, isAuthenticated, isAuthFlow]);

  const pendingAppointments = useMemo(() => {
    return appointments
      .filter((item) => item.status === 'pending')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, MAX_ITEMS);
  }, [appointments]);

  useEffect(() => {
    if (isLoading || loading || !isAuthenticated || isAuthFlow) return;
    if (shownInSessionRef.current) return;
    if (!pendingAppointments.length) return;

    shownInSessionRef.current = true;
    setVisible(true);
  }, [isAuthenticated, isLoading, isAuthFlow, loading, pendingAppointments]);

  if (!pendingAppointments.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.card}>
          <Text style={styles.title}>近期预约提醒</Text>
          <Text style={styles.subtitle}>以下是你当前待就诊的预约信息</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {pendingAppointments.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowTitle}>{item.clinic}</Text>
                <Text style={styles.rowMeta}>
                  {formatAppointmentDateTime(item.scheduledAt)} | {item.department}
                </Text>
              </View>
            ))}
          </ScrollView>

          <OrganicButton title="知道了" size="small" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: organicTheme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.accent,
    padding: organicTheme.spacing.lg,
    maxHeight: '72%',
    ...organicTheme.shadows.floating[1],
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  subtitle: {
    marginTop: organicTheme.spacing.xs,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    lineHeight: 20,
  },
  list: {
    marginTop: organicTheme.spacing.md,
    marginBottom: organicTheme.spacing.md,
  },
  listContent: {
    gap: organicTheme.spacing.sm,
  },
  row: {
    padding: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.background.cream,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.light,
  },
  rowTitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
  },
  rowMeta: {
    marginTop: 4,
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    lineHeight: 18,
  },
});
