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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { sendPhoneCode, phoneLogin } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/tokens';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
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

    if (!code || code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    setIsLoading(true);

    try {
      const response = await phoneLogin(phone, code);
      
      // 保存 token 和用户信息
      await login(response.data.user, response.data.token);
      
      // 跳转到首页
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('登录失败:', error);
      Alert.alert('登录失败', error.response?.data?.message || '登录失败，请检查验证码是否正确');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo 区域 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>👶</Text>
          </View>
          <Text style={styles.appName}>早护通</Text>
          <Text style={styles.appSlogan}>专业的早产儿护理助手</Text>
        </View>

        {/* 表单区域 */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>手机号登录</Text>
          
          {/* 手机号输入 */}
          <Input
            label="手机号"
            value={phone}
            onChangeText={setPhone}
            placeholder="请输入手机号"
            keyboardType="phone-pad"
            maxLength={11}
            leftIcon="📱"
            required
          />

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
                leftIcon="🔑"
                required
              />
            </View>
            
            <Button
              title={countdown > 0 ? `${countdown}s` : '获取验证码'}
              onPress={handleSendCode}
              variant="outline"
              size="medium"
              disabled={countdown > 0 || isSendingCode}
              loading={isSendingCode}
              style={styles.codeButton}
            />
          </View>

          {/* 开发模式调试信息 */}
          {debugCode && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugLabel}>🔧 开发模式验证码：</Text>
              <Text style={styles.debugCode}>{debugCode}</Text>
            </View>
          )}

          {/* 登录按钮 */}
          <Button
            title="登录"
            onPress={handleLogin}
            variant="primary"
            size="large"
            disabled={isLoading}
            loading={isLoading}
            style={styles.loginButton}
          />

          {/* 提示信息 */}
          <Text style={styles.hint}>
            登录即表示同意《用户协议》和《隐私政策》
          </Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl * 2,
    marginBottom: Spacing.xl * 2,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: FontSizes.lg * 1.5,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  appSlogan: {
    fontSize: FontSizes.sm,
    color: Colors.textSub,
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
    marginBottom: Spacing.lg,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeInputWrapper: {
    flex: 1,
  },
  codeButton: {
    marginBottom: Spacing.xs,
    minWidth: 100,
  },
  debugContainer: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  debugLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSub,
    marginBottom: Spacing.xs,
  },
  debugCode: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 4,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  hint: {
    fontSize: FontSizes.xs,
    color: Colors.textSub,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
