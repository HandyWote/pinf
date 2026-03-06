import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { organicTheme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: organicTheme.colors.primary.main,
        tabBarInactiveTintColor: organicTheme.colors.text.tertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          height: 65,
          marginHorizontal: organicTheme.spacing.lg,
          marginBottom: organicTheme.spacing.lg,
          borderRadius: organicTheme.shapes.borderRadius.soft,
          backgroundColor: 'rgba(255, 254, 252, 0.95)',
          borderTopWidth: 0,
          paddingVertical: 10,
          ...organicTheme.shadows.floating[1],
        },
        tabBarLabelStyle: {
          fontSize: organicTheme.typography.fontSize.xs,
          fontWeight: organicTheme.typography.fontWeight.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={organicTheme.iconSizes.tab} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qa"
        options={{
          title: '问答',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={organicTheme.iconSizes.tab} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="class"
        options={{
          title: '课堂',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={organicTheme.iconSizes.tab} name="play.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
