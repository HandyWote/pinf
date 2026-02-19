import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '@/components/ui';
import { theme, organicTheme } from '@/constants/theme';
import { useAppointmentStore } from '@/store/appointmentStore';
import * as notificationsApi from '@/services/api/notifications';
import type { NotificationSubscription } from '../../types/notification';
import type { Appointment } from '@/types/appointment';
import { useFeedback } from '@/contexts/FeedbackContext';
import { registerForPushNotificationsAsync } from '@/utils/push';

export default function TestNotifications() {
  const { appointments, fetch: fetchAppointments } = useAppointmentStore();
  const [apiSubscriptions, setApiSubscriptions] = useState<NotificationSubscription[]>([]);
  const [localSubscriptions, setLocalSubscriptions] = useState<NotificationSubscription[]>([]);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const feedback = useFeedback();
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetchAppointments().catch(() => {});
    loadSubscriptions();

    // 注册 Expo Push token（真机）——最小侵入：客户端注册并在创建订阅时随 payload 一起发送
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) setPushToken(token);
      } catch (err) {
        console.warn('push token register failed', err);
      }
    })();

    return () => {
      // 清理所有定时器以防内存泄漏
      Object.values(timersRef.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscriptions = async () => {
    try {
      const list = await notificationsApi.listSubscriptions();
      setApiSubscriptions(list || []);
    } catch (error) {
      console.warn(error);
      // 后端可能未启用，保持本地 mock 可用
      feedback.notify('无法加载订阅（后端不可用），将使用本地 mock');
    }
  };

  const handleSubscribe = async (appointmentId: number, scheduledAt: string) => {
    // 如果是本地 mock appointment（id < 0），只在本地创建订阅
    if (appointmentId < 0) {
      const scheduled = new Date(scheduledAt);
      const remind = new Date(scheduled.getTime() - 24 * 60 * 60 * 1000);
      const mockSub: NotificationSubscription = {
        id: -(Date.now()),
        appointmentId,
        remindTime: remind.toISOString(),
        channel: 'push',
        status: 'pending',
      } as NotificationSubscription;
      setLocalSubscriptions((s) => [mockSub, ...s]);
      // 安排 5 秒后发送（模拟即时推送）
      const timer = setTimeout(() => {
        handleTestSend(mockSub.id);
        delete timersRef.current[mockSub.id];
      }, 5000);
      timersRef.current[mockSub.id] = timer;
      feedback.notify('本地 Mock 订阅已创建（5s 后自动发送）');
      return;
    }

    // 否则尝试通过后端 API 创建订阅
    try {
      const scheduled = new Date(scheduledAt);
      const remind = new Date(scheduled.getTime() - 24 * 60 * 60 * 1000);
      const payload: any = {
        appointmentId,
        remindTime: remind.toISOString(),
        channel: 'push',
      };
      if (pushToken) payload.token = pushToken;
      const sub = await notificationsApi.createSubscription(payload);
      feedback.notify('订阅创建成功');
      setApiSubscriptions((s) => [sub, ...s]);
    } catch (error) {
      console.warn(error);
      feedback.notify('创建订阅失败（后端不可用），已在本地创建 Mock 订阅');
      // 后端不可用时回退到本地 mock
      const fallback: NotificationSubscription = {
        id: -(Date.now()),
        appointmentId,
        remindTime: new Date(new Date(scheduledAt).getTime() - 24 * 60 * 60 * 1000).toISOString(),
        channel: 'push',
        status: 'pending',
      } as NotificationSubscription;
      setLocalSubscriptions((s) => [fallback, ...s]);
    }
  };

  const handleCancel = async (id: number) => {
    // mock 本地订阅
    if (id < 0) {
      // 清除定时器（如果存在）
      const t = timersRef.current[id];
      if (t) {
        clearTimeout(t as any);
        delete timersRef.current[id];
      }
      setLocalSubscriptions((s) => s.filter((x) => x.id !== id));
      feedback.notify('本地 mock 订阅已取消');
      return;
    }

    try {
      await notificationsApi.deleteSubscription(id);
      feedback.notify('订阅已取消');
      setApiSubscriptions((s) => s.filter((x) => x.id !== id));
    } catch (error) {
      console.warn(error);
      feedback.notify('取消订阅失败');
    }
  };

  const handleTestSend = async (id: number) => {
    // 本地 mock
    if (id < 0) {
      setLocalSubscriptions((s) => s.map((sub) => (sub.id === id ? { ...sub, status: 'sent', sentAt: new Date().toISOString() } : sub)));
      feedback.notify('本地 mock：已标记为 sent');
      return;
    }

    try {
      await notificationsApi.testSendSubscription(id);
      feedback.notify('已记录模拟发送（后端标记为 sent）');
      loadSubscriptions();
    } catch (error) {
      console.warn(error);
      feedback.notify('测试发送失败');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>通知 / 订阅 Demo（可删除）</Text>

      <Button title="创建本地测试预约" onPress={() => {
        // 若已存在本地 mock，就不重复创建
        if (localAppointments.length > 0) return;
        const mock: Appointment = {
          id: -Date.now(),
          clinic: '测试诊所',
          department: '儿科',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        } as Appointment;
        setLocalAppointments([mock]);
        // 自动为本地 mock 预约创建订阅并在 5 秒后触发模拟发送（满足你的测试需求）
        setTimeout(() => handleSubscribe(mock.id, mock.scheduledAt), 0);
      }} variant="outline" />

      <Text style={styles.sectionTitle}>你的预约</Text>
      <FlatList
        data={[...localAppointments, ...appointments]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appTitle}>{item.clinic} · {item.department}</Text>
              <Text style={styles.appSub}>{new Date(item.scheduledAt).toLocaleString()}</Text>
            </View>
            <Button title="订阅提醒" onPress={() => handleSubscribe(item.id, item.scheduledAt)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无预约</Text>}
      />

      <Text style={styles.sectionTitle}>当前订阅</Text>
      <FlatList
        data={[...localSubscriptions, ...apiSubscriptions]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.subRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appTitle}>预约 ID: {item.appointmentId} — {item.status} {item.id < 0 ? '(mock)' : ''}</Text>
              <Text style={styles.appSub}>提醒时间: {new Date(item.remindTime).toLocaleString()}</Text>
            </View>
            <View style={styles.actionCol}>
              <Button title="测试发送" onPress={() => handleTestSend(item.id)} variant="outline" />
              <Button title="取消" onPress={() => handleCancel(item.id)} variant="text" />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无订阅</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: theme.colors.bgBody },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { marginTop: 12, marginBottom: 8, color: theme.colors.textSub },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: organicTheme.colors.border.subtle },
  subRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: organicTheme.colors.border.light },
  appTitle: { fontSize: 16, fontWeight: '600' },
  appSub: { color: theme.colors.textSub, marginTop: 4 },
  empty: { color: theme.colors.textSub, paddingVertical: 8 },
  actionCol: { gap: 6, alignItems: 'flex-end' },
});
