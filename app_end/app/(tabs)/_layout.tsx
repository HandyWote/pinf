import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#B2BEC3',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          height: theme.layout.tab.height,
          marginHorizontal: theme.layout.tab.marginHorizontal,
          marginBottom: theme.layout.tab.marginBottom,
          borderRadius: theme.layout.tab.radius,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 0,
          paddingVertical: 10,
          ...theme.shadows.nav,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qa"
        options={{
          title: '问答',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={22} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="class"
        options={{
          title: '课堂',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={22} name="play.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
