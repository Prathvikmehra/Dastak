import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeContext';
import { HeaderHelpButton } from '../../../src/components/HeaderActions';

export default function FixStackLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Fix',
          headerRight: () => <HeaderHelpButton />,
        }}
      />
      <Stack.Screen
        name="new-case"
        options={{
          title: 'New case',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="case-detail"
        options={{
          title: 'Case detail',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="my-cases"
        options={{
          title: 'My cases',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
