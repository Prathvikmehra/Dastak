import React from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { CasesProvider } from '../src/features/cases/store';

// Set notification handler once at app start with current SDK 58 types
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutContent() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.ink,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings-and-help"
        options={{
          presentation: 'modal',
          title: 'Settings and help',
        }}
      />
      <Stack.Screen
        name="notification-prompt"
        options={{
          presentation: 'modal',
          title: 'Reminders',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CasesProvider>
        <RootLayoutContent />
      </CasesProvider>
    </ThemeProvider>
  );
}
