"use no memo";

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppointmentCard, AppointmentModal } from '@/components/home';
import { OrganicBackground, OrganicButton, OrganicCard } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useBabyStore } from '@/store/babyStore';
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from '@/types/appointment';
import {
  formatAppointmentDateBadge,
  formatAppointmentDateTime,
  getAppointmentUrgencyLabel,
  groupAppointments,
} from '@/utils/appointment';

const STATUS_META = {
  pending: { label: '待就诊', variant: 'accent' as const },
  completed: { label: '已完成', variant: 'muted' as const },
  overdue: { label: '已过期', variant: 'primary' as const },
};

type SectionKey = 'today' | 'upcoming' | 'later' | 'past';

const SECTION_META: Record<SectionKey, { title: string; empty: string }> = {
  today: { title: '今天的预约', empty: '今天没有待处理预约' },
  upcoming: { title: '近 3 天预约', empty: '未来 3 天暂无预约' },
  later: { title: '后续预约', empty: '还没有更晚的预约' },
  past: { title: '历史预约', empty: '暂无历史预约' },
};

export default function AppointmentPage() {
  const router = useRouter();
  const { appointments, fetch, remove, error, add, update } = useAppointmentStore();
  const { currentBaby } = useBabyStore();
  const { confirm, notify } = useFeedback();
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetch().catch(() => {});
  }, [fetch]);

  const filtered = useMemo(() => {
    if (!currentBaby) return appointments;
    return appointments.filter((item) => item.baby?.id === currentBaby.id);
  }, [appointments, currentBaby]);

  const grouped = useMemo(() => groupAppointments(filtered, 3), [filtered]);

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除预约',
      message: '确定删除该预约吗？',
      confirmText: '删除',
      cancelText: '取消',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await remove(id);
      notify('预约已删除', 'success');
    } catch {
      notify('删除失败，请重试', 'error');
    }
  };

  const handleOpenCreate = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: Appointment) => {
    setEditingAppointment(item);
    setShowModal(true);
  };

  const handleSubmit = async (payload: CreateAppointmentInput | UpdateAppointmentInput) => {
    if (editingAppointment) {
      await update(editingAppointment.id, payload as UpdateAppointmentInput);
      notify('预约已更新', 'success');
    } else {
      await add({ ...(payload as CreateAppointmentInput), babyId: currentBaby?.id });
      notify('预约已创建', 'success');
    }

    setEditingAppointment(null);
    setShowModal(false);
  };

  const renderSection = (key: SectionKey, items: Appointment[]) => {
    if (!items.length) return null;

    return (
      <View style={styles.section} key={key}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{SECTION_META[key].title}</Text>
          <Text style={styles.sectionCount}>{items.length} 条</Text>
        </View>
        <View style={styles.cardList}>
          {items.map((item) => {
            const badge = formatAppointmentDateBadge(item.scheduledAt);
            const statusMeta = STATUS_META[item.status];
            const remindText = item.remindAt
              ? `提醒：${formatAppointmentDateTime(item.remindAt)}`
              : '未设置提醒';

            return (
              <OrganicCard key={item.id} shadow style={styles.cardWrapper}>
                <AppointmentCard
                  clinic={item.clinic}
                  department={item.department}
                  dateText={formatAppointmentDateTime(item.scheduledAt)}
                  dateDay={badge.day}
                  dateMonth={badge.month}
                  remindText={remindText}
                  statusLabel={statusMeta.label}
                  statusVariant={statusMeta.variant}
                  actionLabel="编辑预约"
                  onAction={() => handleOpenEdit(item)}
                />
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    紧急程度：{getAppointmentUrgencyLabel(item.scheduledAt, 3)}
                  </Text>
                  {item.baby?.name ? (
                    <Text style={styles.metaText}>宝宝：{item.baby.name}</Text>
                  ) : null}
                  {item.note ? <Text style={styles.noteText}>备注：{item.note}</Text> : null}
                </View>
                <View style={styles.actionRow}>
                  <OrganicButton
                    title="编辑"
                    variant="soft"
                    size="small"
                    onPress={() => handleOpenEdit(item)}
                  />
                  <OrganicButton
                    title="删除"
                    variant="ghost"
                    size="small"
                    onPress={() => handleDelete(item.id)}
                  />
                </View>
              </OrganicCard>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <OrganicBackground variant="morning">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              size={organicTheme.iconSizes.md}
              name="chevron.left"
              color={organicTheme.colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>预约 / 复诊</Text>
          <View style={styles.placeholder} />
        </View>

        <OrganicCard shadow style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>今天</Text>
              <Text style={styles.summaryValue}>{grouped.today.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>近 3 天</Text>
              <Text style={styles.summaryValue}>{grouped.upcoming.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>全部</Text>
              <Text style={styles.summaryValue}>{filtered.length}</Text>
            </View>
          </View>
          {currentBaby ? (
            <Text style={styles.summaryHint}>当前宝宝：{currentBaby.name}</Text>
          ) : (
            <Text style={styles.summaryHint}>当前显示全部预约</Text>
          )}
        </OrganicCard>

        <View style={styles.topActions}>
          <OrganicButton title="+ 添加预约" onPress={handleOpenCreate} style={styles.addButton} />
        </View>

        {error ? (
          <OrganicCard variant="soft" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </OrganicCard>
        ) : null}

        {!filtered.length ? (
          <OrganicCard variant="ghost">
            <View style={styles.emptyBox}>
              <IconSymbol
                size={organicTheme.iconSizes.xl}
                name="calendar"
                color={organicTheme.colors.text.secondary}
              />
              <Text style={styles.emptyText}>暂无预约</Text>
              <Text style={styles.emptySubtext}>点击上方按钮添加复诊预约</Text>
            </View>
          </OrganicCard>
        ) : (
          <>
            {renderSection('today', grouped.today)}
            {renderSection('upcoming', grouped.upcoming)}
            {renderSection('later', grouped.later)}
            {renderSection('past', grouped.past)}
          </>
        )}

        <AppointmentModal
          visible={showModal}
          onClose={() => {
            setEditingAppointment(null);
            setShowModal(false);
          }}
          onSubmit={handleSubmit}
          initialValues={editingAppointment}
          title={editingAppointment ? '编辑预约' : '添加预约'}
          submitText={editingAppointment ? '保存修改' : '保存预约'}
        />
      </ScrollView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: organicTheme.spacing.lg,
    paddingTop: 44,
    paddingBottom: 100,
    gap: organicTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  summaryCard: {
    marginTop: organicTheme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: organicTheme.spacing.sm,
  },
  summaryItem: {
    flex: 1,
    paddingVertical: organicTheme.spacing.md,
    paddingHorizontal: organicTheme.spacing.sm,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: organicTheme.typography.fontSize.xl,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.primary.main,
  },
  summaryHint: {
    marginTop: organicTheme.spacing.md,
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  topActions: {
    marginTop: organicTheme.spacing.sm,
  },
  addButton: {
    width: '100%',
  },
  errorCard: {
    padding: organicTheme.spacing.md,
  },
  errorText: {
    color: '#D64545',
    fontSize: organicTheme.typography.fontSize.sm,
    textAlign: 'center',
  },
  section: {
    gap: organicTheme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: organicTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.semibold,
    color: organicTheme.colors.text.primary,
  },
  sectionCount: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.tertiary,
  },
  cardList: {
    gap: organicTheme.spacing.md,
  },
  cardWrapper: {
    gap: organicTheme.spacing.sm,
  },
  cardMeta: {
    gap: 4,
    paddingHorizontal: organicTheme.spacing.sm,
  },
  metaText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  noteText: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.primary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: organicTheme.spacing.sm,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: organicTheme.spacing['2xl'],
  },
  emptyText: {
    fontSize: organicTheme.typography.fontSize.md,
    fontWeight: organicTheme.typography.fontWeight.medium,
    color: organicTheme.colors.text.primary,
    marginTop: organicTheme.spacing.md,
  },
  emptySubtext: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    textAlign: 'center',
    marginTop: organicTheme.spacing.xs,
  },
});
