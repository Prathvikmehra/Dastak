import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          minHeight: 48, // 48dp minimum touch target
        },
      }}
    >
      <Tabs.Screen
        name="fix"
        options={{
          title: 'Fix',
          tabBarLabel: 'Fix',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              size={size}
              color={typeof color === 'string' ? color : colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          tabBarLabel: 'Find',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={typeof color === 'string' ? color : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
