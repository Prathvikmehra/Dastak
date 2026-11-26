import React from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { LanguageProvider, useCopy, useLanguage } from '../src/copy/context';
import { CasesProvider, useCases } from '../src/features/cases/store';
import { MoneyProvider, useMoney } from '../src/features/money/store';
import { MedicineProvider, useMedicines } from '../src/features/medicine/store';
import { ErrorBoundary } from '../src/components';
import { useAppReady } from '../src/lib/useAppReady';
import { logger } from '../src/lib/logger';

// Prevent native splash screen from hiding automatically until the app is fully ready
SplashScreen.preventAutoHideAsync().catch((err) => {
  logger.warn('Failed to prevent auto-hide splash screen', err);
});

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
  const { colors, isLoaded: themeLoaded } = useTheme();
  const copy = useCopy();
  const { isLoaded: languageLoaded } = useLanguage();
  const { loading: casesLoading } = useCases();
  const { isLoading: moneyLoading } = useMoney();
  const { isLoading: medicinesLoading } = useMedicines();
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  useAppReady({
    isFontsReady: fontsLoaded || Boolean(fontError),
    isPreferencesReady: themeLoaded && languageLoaded,
    isCasesReady: !casesLoading,
    isMoneyReady: !moneyLoading,
    isMedicinesReady: !medicinesLoading,
  });

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
          title: copy.settings.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="notification-prompt"
        options={{
          presentation: 'modal',
          title: copy.notificationPrompt.title,
          headerBackTitle: copy.common.back,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <CasesProvider>
            <MoneyProvider>
              <MedicineProvider>
                <RootLayoutContent />
              </MedicineProvider>
            </MoneyProvider>
          </CasesProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}
