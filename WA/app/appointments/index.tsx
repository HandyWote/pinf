import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppointmentCard, AppointmentModal } from '@/components/home';
import { Button } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useBabyStore } from '@/store/babyStore';

export default function AppointmentPage() {
  const router = useRouter();
  const { appointments, fetch, remove, loading, error, add } = useAppointmentStore();
  const { currentBaby } = useBabyStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch().catch(() => {});
  }, [fetch]);

  const filtered = useMemo(() => {
    if (!currentBaby) return appointments;
    return appointments.filter((item) => item.baby?.id === currentBaby.id);
  }, [appointments, currentBaby]);

  const handleDelete = (id: number) => {
    Alert.alert('删除预约', '确定删除该预约吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await remove(id);
        },
      },
    ]);
  };

  const handleSubmit = async (payload: any) => {
    await add({ ...payload, babyId: currentBaby?.id });
    setShowModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Button title="返回" variant="text" onPress={() => router.back()} />
        <Text style={styles.title}>预约/复诊</Text>
      </View>
      {currentBaby && <Text style={styles.subtitle}>当前宝宝：{currentBaby.name}</Text>}
      <View style={styles.actionRow}>
        <Button title="添加预约" onPress={() => setShowModal(true)} />
        <Button title="刷新" variant="outline" onPress={() => fetch()} loading={loading} />
      </View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.muted}>暂无预约</Text>
        </View>
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
            <View key={item.id} style={styles.cardWrapper}>
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
            </View>
          );
        })
      )}

      <AppointmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBody,
  },
  content: {
    paddingHorizontal: theme.layout.pagePadding,
    paddingTop: theme.layout.safeTop,
    paddingBottom: theme.layout.safeBottom,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSub,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  errorBanner: {
    padding: theme.spacing.sm,
    backgroundColor: '#FDECEA',
    borderRadius: theme.borderRadius.medium,
  },
  errorText: {
    color: '#D64545',
  },
  emptyBox: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
  },
  muted: {
    color: theme.colors.textSub,
  },
  cardWrapper: {
    gap: theme.spacing.xs,
  },
  deleteLink: {
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: '#D64545',
    fontSize: theme.fontSizes.xs,
  },
});
