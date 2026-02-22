import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { organicTheme, theme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import {
  getExpoProjectId,
  registerForPushNotificationsDetailedAsync,
  sendLocalTestNotificationAsync,
} from '@/utils/push';

export default function TestNotifications() {
  const feedback = useFeedback();

  const [pushToken, setPushToken] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<string>('未获取');
  const [tokenDiagnostics, setTokenDiagnostics] = useState<string>('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [sendingLocal, setSendingLocal] = useState(false);

  const handleGetToken = async () => {
    if (loadingToken) return;
    setLoadingToken(true);
    setTokenDiagnostics('');
    try {
      const result = await registerForPushNotificationsDetailedAsync();
      if (result.token) {
        setPushToken(result.token);
        setTokenStatus('已获取');
        setTokenDiagnostics(
          `projectId=${result.projectId || getExpoProjectId() || 'N/A'} / permission=${result.permissionStatus || 'granted'}`
        );
        feedback.notify('Push Token 获取成功', 'success');
        return;
      }

      setPushToken(null);
      setTokenStatus('获取失败');
      setTokenDiagnostics(
        `reason=${result.reason || 'unknown'} / projectId=${result.projectId || getExpoProjectId() || 'N/A'} / permission=${result.permissionStatus || 'unknown'}`
      );
      feedback.notify(result.message || 'Push Token 获取失败', 'error');
    } catch (error) {
      console.warn(error);
      setPushToken(null);
      setTokenStatus('获取失败');
      setTokenDiagnostics(`reason=exception / projectId=${getExpoProjectId() || 'N/A'}`);
      feedback.notify('Push Token 获取异常', 'error');
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSendLocal = async () => {
    if (sendingLocal) return;
    if (!pushToken) {
      feedback.notify('请先获取 Push Token 再测试通知', 'error');
      return;
    }
    setSendingLocal(true);
    try {
      const ok = await sendLocalTestNotificationAsync('通知测试', '本地通知已触发，请查看系统通知栏');
      if (ok) {
        feedback.notify('本地通知发送成功', 'success');
      } else {
        feedback.notify('本地通知发送失败，请检查权限', 'error');
      }
    } finally {
      setSendingLocal(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>通知功能最小测试页</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Token 状态：{tokenStatus}</Text>
        <Text style={styles.label}>
          Token：{pushToken ? `${pushToken.slice(0, 16)}***${pushToken.slice(-8)}` : 'N/A'}
        </Text>
        {!!tokenDiagnostics && <Text style={styles.debugText}>{tokenDiagnostics}</Text>}
      </View>

      <View style={styles.actions}>
        <Button title={loadingToken ? '获取中...' : '1) 获取 Push Token'} onPress={handleGetToken} disabled={loadingToken} />
        <Button
          title={sendingLocal ? '发送中...' : '2) 发送本地通知'}
          onPress={handleSendLocal}
          disabled={!pushToken || sendingLocal}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.bgBody,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.subtle,
    backgroundColor: theme.colors.surface,
    gap: 6,
  },
  label: {
    color: theme.colors.textMain,
    fontSize: 14,
  },
  debugText: {
    color: theme.colors.textSub,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
});
