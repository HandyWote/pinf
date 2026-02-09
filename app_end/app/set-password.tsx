/**
 * 设置密码页面
 * 仅用于验证码登录后首次设置密码
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/tokens';
import { setupPassword } from '@/services/api';
import { useAuthStore } from '@/store';

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setNeedSetPassword } = useAuthStore();

  const validatePassword = (value: string): boolean => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    return pattern.test(value);
  };

  const handleSubmit = async () => {
    if (!validatePassword(password)) {
      Alert.alert('提示', '密码需为8-16位字母+数字组合');
      return;
    }

    setIsLoading(true);
    try {
      await setupPassword(password);
      setNeedSetPassword(false);
      Alert.alert('成功', '密码设置成功');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('设置密码失败:', error);
      Alert.alert('失败', error.response?.data?.message || '设置密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>设置登录密码</Text>
          <Text style={styles.subtitle}>为了账户安全，请设置8-16位字母+数字密码</Text>

          <Input
            label="密码"
            value={password}
            onChangeText={setPassword}
            placeholder="请输入8-16位字母+数字"
            secureTextEntry
            leftIcon={<IconSymbol name="lock.fill" size={18} color={theme.colors.textSub} />}
            required
          />

          <Button
            title="完成"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBody,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSub,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
