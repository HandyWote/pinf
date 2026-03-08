"use no memo";

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppointmentCompletionPrompt } from '@/components/home';
import { FeedbackProvider } from '@/contexts/FeedbackContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { setUnauthorizedHandler } from '@/services/api/client';
import { useAuthStore } from '@/store';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useBabyStore } from '@/store/babyStore';

if (__DEV__) {
  LogBox.ignoreLogs([
    'Received `false` for a non-boolean attribute `animate`',
    'React does not recognize the `animationDuration` prop on a DOM element',
    'React does not recognize the `renderPlaceholder` prop on a DOM element',
    'Invalid DOM property `transform-origin`',
    'Unknown event handler property `onStartShouldSetResponder`',
    'Unknown event handler property `onResponderTerminationRequest`',
    'Unknown event handler property `onResponderGrant`',
    'Unknown event handler property `onResponderMove`',
    'Unknown event handler property `onResponderRelease`',
    'Unknown event handler property `onResponderTerminate`',
  ]);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, needSetPassword } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] || '';
    const inAuthGroup = currentSegment === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && needSetPassword && currentSegment !== 'set-password') {
      router.replace('/set-password');
      return;
    }

    if (isAuthenticated && inAuthGroup && !needSetPassword) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, needSetPassword, router, segments]);
}

export default function RootLayout() {
  const router = useRouter();
  const { initialize, logout, isAuthenticated, isLoading } = useAuthStore();
  const clearAppointments = useAppointmentStore((state) => state.clear);
  const { initialize: initializeBabies } = useBabyStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      clearAppointments();
      await logout();
      router.replace('/login');
    });
  }, [clearAppointments, logout, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      initializeBabies();
    }
  }, [initializeBabies, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearAppointments();
    }
  }, [clearAppointments, isAuthenticated, isLoading]);

  useProtectedRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <FeedbackProvider>
          <AppointmentCompletionPrompt />
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="growth/index" options={{ headerShown: false }} />
            <Stack.Screen name="appointments/index" options={{ headerShown: false }} />
            <Stack.Screen name="class-article/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="webview" options={{ headerShown: false }} />
            <Stack.Screen name="set-password" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </FeedbackProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
