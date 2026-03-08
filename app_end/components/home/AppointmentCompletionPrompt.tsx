"use no memo";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSegments } from 'expo-router';

import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAuthStore } from '@/store';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { Appointment } from '@/types/appointment';
import { getAppointmentEffectiveStatus } from '@/utils/appointment';

const AUTH_SEGMENTS = new Set(['login', 'set-password']);
const REFRESH_INTERVAL_MS = 60 * 1000;
const PROMPT_DELAY_MS = 400;

export function AppointmentCompletionPrompt() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { appointments, fetch, updateStatus, clear } = useAppointmentStore();
  const { notify } = useFeedback();
  const promptedIdsRef = useRef<Set<number>>(new Set());
  const promptInFlightRef = useRef(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentSegment = segments[0] || '';
  const hasResolvedRoute = segments.length > 0;
  const isAuthFlow = AUTH_SEGMENTS.has(currentSegment);
  const routeKey = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    if (!hasResolvedRoute || isLoading) {
      return;
    }

    if (!isAuthenticated || isAuthFlow) {
      promptedIdsRef.current.clear();
      promptInFlightRef.current = false;
      setActiveAppointment(null);
      clear();
    }
  }, [clear, hasResolvedRoute, isAuthenticated, isAuthFlow, isLoading]);

  useEffect(() => {
    if (!hasResolvedRoute || isLoading || !isAuthenticated || isAuthFlow) {
      return;
    }

    fetch({ silent: true }).catch(() => {});
  }, [fetch, hasResolvedRoute, isAuthenticated, isAuthFlow, isLoading, routeKey]);

  useEffect(() => {
    if (!hasResolvedRoute || isLoading || !isAuthenticated || isAuthFlow) {
      return;
    }

    const timer = setInterval(() => {
      fetch({ silent: true }).catch(() => {});
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [fetch, hasResolvedRoute, isAuthenticated, isAuthFlow, isLoading, routeKey]);

  useEffect(() => {
    if (!hasResolvedRoute || isLoading || !isAuthenticated || isAuthFlow) {
      return;
    }
    if (promptInFlightRef.current || activeAppointment) {
      return;
    }

    const now = new Date();
    const overdueItems = appointments.filter(
      (item) => getAppointmentEffectiveStatus(item, now) === 'overdue'
    );
    const nextOverdue = overdueItems.find((item) => !promptedIdsRef.current.has(item.id)) ?? null;

    if (!nextOverdue) {
      return;
    }

    promptInFlightRef.current = true;

    let active = true;
    const timer = setTimeout(() => {
      if (!active) {
        return;
      }

      promptedIdsRef.current.add(nextOverdue.id);
      setActiveAppointment(nextOverdue);
    }, PROMPT_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
      if (!activeAppointment) {
        promptInFlightRef.current = false;
      }
    };
  }, [activeAppointment, appointments, hasResolvedRoute, isAuthenticated, isAuthFlow, isLoading, routeKey]);

  const closePrompt = () => {
    setActiveAppointment(null);
    promptInFlightRef.current = false;
  };

  const handleDismiss = async () => {
    if (!activeAppointment || actionLoading) {
      return;
    }

    setActionLoading(true);
    try {
      if (activeAppointment.status === 'pending') {
        await updateStatus(activeAppointment.id, 'overdue');
      }
      closePrompt();
    } catch {
      promptedIdsRef.current.delete(activeAppointment.id);
      notify('更新就诊状态失败，请重试', 'error');
      closePrompt();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleted = async () => {
    if (!activeAppointment || actionLoading) {
      return;
    }

    setActionLoading(true);
    try {
      await updateStatus(activeAppointment.id, 'completed');
      notify('已标记为已就诊', 'success');
      closePrompt();
    } catch {
      promptedIdsRef.current.delete(activeAppointment.id);
      notify('更新就诊状态失败，请重试', 'error');
      closePrompt();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      visible={!!activeAppointment}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />
        <View style={styles.card}>
          <Text style={styles.title}>预约时间已过</Text>
          <Text style={styles.message}>
            {activeAppointment
              ? `“${activeAppointment.clinic} / ${activeAppointment.department}”已超过预约时间，是否已完成就诊？`
              : ''}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleDismiss}
              disabled={actionLoading}
            >
              <Text style={styles.secondaryText}>稍后处理</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCompleted}
              disabled={actionLoading}
            >
              <Text style={styles.primaryText}>已就诊</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: organicTheme.spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: organicTheme.colors.background.paper,
    borderRadius: organicTheme.shapes.borderRadius.soft,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.accent,
    padding: organicTheme.spacing.lg,
    ...organicTheme.shadows.floating[1],
  },
  title: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  message: {
    marginTop: organicTheme.spacing.sm,
    fontSize: organicTheme.typography.fontSize.sm,
    lineHeight: 22,
    color: organicTheme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: organicTheme.spacing.sm,
    marginTop: organicTheme.spacing.lg,
  },
  button: {
    minWidth: 96,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    paddingHorizontal: organicTheme.spacing.md,
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: organicTheme.colors.background.paper,
    borderColor: organicTheme.colors.border.light,
  },
  primaryButton: {
    backgroundColor: organicTheme.colors.primary.pale,
    borderColor: organicTheme.colors.border.accent,
  },
  secondaryText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  primaryText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
});
