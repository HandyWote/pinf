import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppointmentCard, AppointmentModal } from '@/components/home';
import { OrganicBackground, OrganicCard, OrganicButton } from '@/components/ui';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useBabyStore } from '@/store/babyStore';

export default function AppointmentPage() {
  const router = useRouter();
  const { appointments, fetch, remove, error, add } = useAppointmentStore();
  const { currentBaby } = useBabyStore();
  const { confirm, notify } = useFeedback();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch().catch(() => {});
  }, [fetch]);

  const filtered = useMemo(() => {
    if (!currentBaby) return appointments;
    return appointments.filter((item) => item.baby?.id === currentBaby.id);
  }, [appointments, currentBaby]);

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

  const handleSubmit = async (payload: any) => {
    await add({ ...payload, babyId: currentBaby?.id });
    setShowModal(false);
  };

  return (
    <OrganicBackground variant="morning">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 头部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color={organicTheme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>预约/复诊</Text>
          <View style={styles.placeholder} />
        </View>

        {currentBaby && (
          <View style={styles.babyInfo}>
            <IconSymbol size={16} name="figure.child" color={organicTheme.colors.primary.main} />
            <Text style={styles.babyName}>当前宝宝：{currentBaby.name}</Text>
          </View>
        )}

        {/* 操作按钮行 */}
        <View style={styles.actionRow}>
          <OrganicButton
            title="+ 添加预约"
            onPress={() => setShowModal(true)}
            style={styles.addButton}
          />
        </View>

        {error && (
          <OrganicCard variant="soft" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </OrganicCard>
        )}

        {filtered.length === 0 ? (
          <OrganicCard variant="ghost">
            <View style={styles.emptyBox}>
              <IconSymbol size={48} name="calendar" color={organicTheme.colors.text.secondary} />
              <Text style={styles.emptyText}>暂无预约</Text>
              <Text style={styles.emptySubtext}>点击上方按钮添加复诊预约</Text>
            </View>
          </OrganicCard>
        ) : (
          filtered.map((item) => {
            const date = new Date(item.scheduledAt);
            const dateDay = String(date.getDate()).padStart(2, '0');
            const dateMonth = `${date.getMonth() + 1}月`;
            const statusLabel =
              item.status === 'pending'
                ? '待就诊'
                : item.status === 'completed'
                  ? '已完成'
                  : '已过期';
            const statusVariant =
              item.status === 'pending'
                ? 'accent'
                : item.status === 'completed'
                  ? 'muted'
                  : 'primary';
            return (
              <OrganicCard key={item.id} shadow style={styles.cardWrapper}>
                <AppointmentCard
                  clinic={item.clinic}
                  department={item.department}
                  dateText={item.scheduledAt}
                  dateDay={dateDay}
                  dateMonth={dateMonth}
                  remindText={item.remindAt ? '已设置提醒' : '未设置提醒'}
                  statusLabel={statusLabel}
                  statusVariant={statusVariant}
                  onAction={() => handleDelete(item.id)}
                />
                <TouchableOpacity style={styles.deleteLink} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
              </OrganicCard>
            );
          })
        )}

        <AppointmentModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
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
    marginBottom: organicTheme.spacing.md,
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
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    marginBottom: organicTheme.spacing.md,
    paddingHorizontal: organicTheme.spacing.md,
    paddingVertical: organicTheme.spacing.sm,
    backgroundColor: organicTheme.colors.primary.pale,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  babyName: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  actionRow: {
    marginBottom: organicTheme.spacing.md,
  },
  addButton: {
    width: '100%',
  },
  errorCard: {
    padding: organicTheme.spacing.md,
    backgroundColor: organicTheme.colors.error,
  },
  errorText: {
    color: organicTheme.colors.text.primary,
    fontSize: organicTheme.typography.fontSize.sm,
    textAlign: 'center',
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
  cardWrapper: {
    gap: organicTheme.spacing.xs,
    marginBottom: organicTheme.spacing.md,
  },
  deleteLink: {
    alignSelf: 'flex-end',
    padding: organicTheme.spacing.sm,
  },
  deleteText: {
    color: organicTheme.colors.error,
    fontSize: organicTheme.typography.fontSize.xs,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
});
