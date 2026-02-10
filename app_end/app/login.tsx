/**
 * 登录页面
 * 手机号 + 验证码登录
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { sendPhoneCode, phoneLogin, passwordLogin } from '@/services/api';
import { OrganicBackground, OrganicCard, OrganicButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';

type LoginMode = 'code' | 'password';

export default function LoginScreen() {
  const [loginMode, setLoginMode] = useState<LoginMode>('code');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [debugCode, setDebugCode] = useState(''); // 开发模式下显示验证码
  
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { login } = useAuthStore();

  // 验证手机号格式
  const validatePhone = (phone: string): boolean => {
    const pattern = /^1[3-9]\d{9}$/;
    return pattern.test(phone);
  };

  const validatePassword = (value: string): boolean => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    return pattern.test(value);
  };

  // 开始倒计时
  const startCountdown = (seconds: number = 60) => {
    setCountdown(seconds);
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (countdown > 0) {
      return;
    }

    setIsSendingCode(true);
    setDebugCode('');

    try {
      const response = await sendPhoneCode(phone);
      
      // 开发模式下显示验证码
      if (response.data.code) {
        setDebugCode(response.data.code);
        Alert.alert(
          '验证码已发送',
          `开发模式：验证码为 ${response.data.code}\n\n生产环境中验证码将通过短信发送`,
          [{ text: '知道了' }]
        );
      } else {
        Alert.alert('成功', '验证码已发送，请查收短信');
      }
      
      startCountdown(60);
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      Alert.alert('错误', error.response?.data?.message || '发送验证码失败，请重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (loginMode === 'code') {
      if (!code || code.length !== 6) {
        Alert.alert('提示', '请输入6位验证码');
        return;
      }
    } else {
      if (!validatePassword(password)) {
        Alert.alert('提示', '密码需为8-16位字母+数字组合');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response =
        loginMode === 'code'
          ? await phoneLogin(phone, code)
          : await passwordLogin(phone, password);
      
      // 保存 token 和用户信息
      await login(response.data.user, response.data.token, response.data.need_set_password);
      
      if (response.data.need_set_password) {
        router.replace('/set-password');
      } else {
        // 跳转到首页
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      const fallbackMessage =
        loginMode === 'code'
          ? '登录失败，请检查验证码是否正确'
          : '登录失败，请检查密码是否正确';
      Alert.alert('登录失败', error.response?.data?.message || fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

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
          {/* Logo 区域 */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <IconSymbol name="figure.child" size={40} color={organicTheme.colors.primary.main} />
            </View>
            <Text style={styles.appName}>早护通</Text>
            <Text style={styles.appSlogan}>专业的早产儿护理助手</Text>
          </View>

          {/* 表单区域 */}
          <OrganicCard shadow style={styles.formContainer}>
            <Text style={styles.title}>手机号登录</Text>

            <View style={styles.modeSwitch}>
              <TouchableOpacity
                style={[styles.modeButton, loginMode === 'code' && styles.modeButtonActive]}
                onPress={() => setLoginMode('code')}
              >
                <Text style={[styles.modeText, loginMode === 'code' && styles.modeTextActive]}>
                  验证码登录
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, loginMode === 'password' && styles.modeButtonActive]}
                onPress={() => setLoginMode('password')}
              >
                <Text style={[styles.modeText, loginMode === 'password' && styles.modeTextActive]}>
                  密码登录
                </Text>
              </TouchableOpacity>
            </View>

            {/* 手机号输入 */}
            <Input
              label="手机号"
              value={phone}
              onChangeText={setPhone}
              placeholder="请输入手机号"
              keyboardType="phone-pad"
              maxLength={11}
              leftIcon={<IconSymbol name="iphone" size={18} color={organicTheme.colors.text.secondary} />}
              required
            />

            {loginMode === 'code' ? (
              <>
                {/* 验证码输入 */}
                <View style={styles.codeInputContainer}>
                  <View style={styles.codeInputWrapper}>
                    <Input
                      label="验证码"
                      value={code}
                      onChangeText={setCode}
                      placeholder="请输入6位验证码"
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon={<IconSymbol name="key.fill" size={18} color={organicTheme.colors.text.secondary} />}
                      required
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.codeButton,
                      (countdown > 0 || isSendingCode) && styles.codeButtonDisabled,
                    ]}
                    onPress={handleSendCode}
                    disabled={countdown > 0 || isSendingCode}
                  >
                    <Text style={[
                      styles.codeButtonText,
                      (countdown > 0 || isSendingCode) && styles.codeButtonTextDisabled,
                    ]}>
                      {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Input
                label="密码"
                value={password}
                onChangeText={setPassword}
                placeholder="8-16位字母+数字"
                secureTextEntry
                leftIcon={<IconSymbol name="lock.fill" size={18} color={organicTheme.colors.text.secondary} />}
                required
              />
            )}

            {/* 开发模式调试信息 */}
            {loginMode === 'code' && debugCode && (
              <View style={styles.debugContainer}>
                <View style={styles.debugRow}>
                  <IconSymbol name="wrench.and.screwdriver" size={14} color={organicTheme.colors.primary.main} />
                  <Text style={styles.debugLabel}> 开发模式验证码：</Text>
                </View>
                <Text style={styles.debugCode}>{debugCode}</Text>
              </View>
            )}

            {/* 登录按钮 */}
            <OrganicButton
              title={isLoading ? '登录中...' : '登录'}
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
              style={styles.loginButton}
            />

            {/* 提示信息 */}
            <Text style={styles.hint}>
              登录即表示同意《用户协议》和《隐私政策》
            </Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: organicTheme.spacing['5xl'],
    marginBottom: organicTheme.spacing['3xl'],
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: organicTheme.spacing.md,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: organicTheme.typography.fontSize['3xl'],
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.primary.main,
    marginBottom: organicTheme.spacing.sm,
  },
  appSlogan: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  formContainer: {
    borderRadius: organicTheme.shapes.borderRadius.soft,
    padding: organicTheme.spacing.xl,
  },
  title: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.text.primary,
    marginBottom: organicTheme.spacing.lg,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: organicTheme.colors.primary.pale,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    padding: 4,
    marginBottom: organicTheme.spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: organicTheme.spacing.sm,
    alignItems: 'center',
    borderRadius: organicTheme.shapes.borderRadius.cozy,
  },
  modeButtonActive: {
    backgroundColor: organicTheme.colors.background.paper,
    ...organicTheme.shadows.soft[0],
  },
  modeText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.text.secondary,
  },
  modeTextActive: {
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: organicTheme.spacing.sm,
    marginBottom: organicTheme.spacing.md,
  },
  codeInputWrapper: {
    flex: 1,
  },
  codeButton: {
    marginBottom: organicTheme.spacing.xs,
    minWidth: 100,
    height: 48,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    backgroundColor: organicTheme.colors.primary.pale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.main,
  },
  codeButtonDisabled: {
    backgroundColor: organicTheme.colors.background.cream,
    borderColor: organicTheme.colors.text.tertiary,
  },
  codeButtonText: {
    fontSize: organicTheme.typography.fontSize.sm,
    color: organicTheme.colors.primary.main,
    fontWeight: organicTheme.typography.fontWeight.semibold,
  },
  codeButtonTextDisabled: {
    color: organicTheme.colors.text.tertiary,
  },
  debugContainer: {
    backgroundColor: organicTheme.colors.primary.pale,
    padding: organicTheme.spacing.md,
    borderRadius: organicTheme.shapes.borderRadius.cozy,
    marginBottom: organicTheme.spacing.md,
    borderWidth: 1,
    borderColor: organicTheme.colors.primary.main,
    borderStyle: 'dashed',
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: organicTheme.spacing.xs,
    marginBottom: organicTheme.spacing.xs,
  },
  debugLabel: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
  },
  debugCode: {
    fontSize: organicTheme.typography.fontSize.lg,
    fontWeight: organicTheme.typography.fontWeight.bold,
    color: organicTheme.colors.primary.main,
    letterSpacing: 4,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: organicTheme.spacing.md,
  },
  hint: {
    fontSize: organicTheme.typography.fontSize.xs,
    color: organicTheme.colors.text.secondary,
    textAlign: 'center',
    marginTop: organicTheme.spacing.lg,
    lineHeight: 18,
  },
});
