import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store';

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

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'set-password';

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
  }, [isAuthenticated, isLoading, needSetPassword, segments]);
}

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // 初始化认证状态
    initialize();
  }, []);

  // 应用路由守卫
  useProtectedRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
