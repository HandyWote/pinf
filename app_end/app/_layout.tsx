import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { FeedbackProvider } from '@/contexts/FeedbackContext';
import { useAuthStore } from '@/store';
import { useBabyStore } from '@/store/babyStore';
import { setUnauthorizedHandler } from '@/services/api/client';

// 忽略 react-native-svg-charts 在 Web 平台的已知警告
if (__DEV__) {
  LogBox.ignoreLogs([
    'Received `false` for a non-boolean attribute `animate`',
    'React does not recognize the `animationDuration` prop on a DOM element',
    'React does not recognize the `renderPlaceholder` prop on a DOM element',
  ]);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * 路由守卫：未登录重定向到登录页
 */
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, needSetPassword } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // 未登录且不在登录页，跳转到登录页
      router.replace('/login');
    } else if (isAuthenticated && needSetPassword && segments[0] !== 'set-password') {
      // 已登录但未设置密码，强制跳转设置密码页
      router.replace('/set-password');
    } else if (isAuthenticated && inAuthGroup && !needSetPassword) {
      // 已登录但在登录页，跳转到首页
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, needSetPassword, segments, router]);
}

export default function RootLayout() {
  const router = useRouter();
  const { initialize, logout, isAuthenticated, isLoading } = useAuthStore();
  const { initialize: initializeBabies } = useBabyStore();

  useEffect(() => {
    // 初始化认证状态
    initialize();
  }, [initialize]);

  useEffect(() => {
    // 注册 401 处理：清理登录态并跳转登录页
    setUnauthorizedHandler(async () => {
      await logout();
      router.replace('/login');
    });
  }, [logout, router]);

  useEffect(() => {
    // 认证完成且已登录后再初始化宝宝数据
    if (!isLoading && isAuthenticated) {
      initializeBabies();
    }
  }, [initializeBabies, isAuthenticated, isLoading]);

  // 应用路由守卫
  useProtectedRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <FeedbackProvider>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="growth/index" options={{ headerShown: false }} />
            <Stack.Screen name="appointments/index" options={{ headerShown: false }} />
            <Stack.Screen name="class-video/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="class-article/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="set-password" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </FeedbackProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
