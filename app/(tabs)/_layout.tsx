import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useCopy } from '../../src/copy/context';

export function getTabBarBottomPadding(bottomInset: number): number {
  return Math.max(bottomInset, 8);
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const copy = useCopy();
  const insets = useSafeAreaInsets();
  const bottomInset = getTabBarBottomPadding(insets.bottom);

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
          paddingTop: 8,
          paddingBottom: bottomInset,
          minHeight: 48 + bottomInset,
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
          title: copy.tabs.fix,
          tabBarLabel: copy.tabs.fix,
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
          title: copy.tabs.find,
          tabBarLabel: copy.tabs.find,
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
