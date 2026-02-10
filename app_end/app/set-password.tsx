/**
 * 设置密码页面
 * 仅用于验证码登录后首次设置密码
 */

import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { OrganicBackground, OrganicCard, OrganicButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';
import { useFeedback } from '@/contexts/FeedbackContext';
import { setupPassword } from '@/services/api';
import { useAuthStore } from '@/store';

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { needSetPassword, setNeedSetPassword } = useAuthStore();
  const { notify } = useFeedback();

  const validatePassword = (value: string): boolean => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    return pattern.test(value);
  };

  const handleSubmit = async () => {
    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();
    setFormError('');

    if (!normalizedPassword || !normalizedConfirmPassword) {
      setFormError('请完整填写密码和确认密码');
      return;
    }

    if (!validatePassword(normalizedPassword)) {
      setFormError('密码需为8-16位字母+数字组合');
      return;
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[SetPassword] start request: /auth/password/setup');
      await setupPassword(normalizedPassword);
      console.log('[SetPassword] request success');
      setNeedSetPassword(false);
      notify('密码设置成功', 'success');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[SetPassword] request failed:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      notify(error?.response?.data?.message || '设置密码失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganicBackground variant="morning">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!needSetPassword && (
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.exitButton} onPress={() => router.replace('/profile')}>
                <IconSymbol name="chevron.left" size={organicTheme.iconSizes.xs} color={organicTheme.colors.text.secondary} />
                <Text style={styles.exitButtonText}>退出修改</Text>
              </TouchableOpacity>
            </View>
          )}

          <OrganicCard shadow style={styles.formContainer}>
            <Text style={styles.title}>设置登录密码</Text>
            <Text style={styles.subtitle}>为了账户安全，请设置8-16位字母+数字密码</Text>

            <Input
              label="密码"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (formError) setFormError('');
              }}
              placeholder="请输入8-16位字母+数字"
              secureTextEntry
              leftIcon={<IconSymbol name="lock.fill" size={organicTheme.iconSizes.xs} color={organicTheme.colors.text.secondary} />}
              required
            />

            <Input
              label="确认密码"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (formError) setFormError('');
              }}
              placeholder="请再次输入密码"
              secureTextEntry
              leftIcon={<IconSymbol name="lock.fill" size={organicTheme.iconSizes.xs} color={organicTheme.colors.text.secondary} />}
              required
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <OrganicButton
              title={isLoading ? '设置中...' : '确认设置'}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            />
          </OrganicCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </OrganicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: organicTheme.spacing.lg,
    justifyContent: 'center',
  },
  topActions: {
    marginBottom: organicTheme.spacing.md,
    alignItems: 'flex-start',
  },
  exitButton: {
    minHeight: 36,
    paddingHorizontal: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.pill,
    borderWidth: 1,
    borderColor: organicTheme.colors.border.default,
    backgroundColor: organicTheme.colors.background.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
  },
  exitButtonText: {
    color: organicTheme.colors.text.secondary,
    fontSize: organicTheme.typography.fontSize.sm,
    fontWeight: organicTheme.typography.fontWeight.medium,
  },
  formContainer: {
    borderRadius: organicTheme.shapes.borderRadius.soft,
    padding: organicTheme.spacing.xl,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.sm,
  },
  subtitle: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
    marginBottom: organicTheme.spacing.lg,
  },
  errorText: {
    marginTop: organicTheme.spacing.xs,
    color: '#C54A4A',
    fontSize: organicTheme.typography.fontSize.sm,
  },
  submitButton: {
    marginTop: organicTheme.spacing.md,
  },
});
