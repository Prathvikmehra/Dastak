import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeContext';
import { HeaderHelpButton } from '../../../src/components/HeaderActions';

export default function FindStackLayout() {
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
          title: 'Find',
          headerRight: () => <HeaderHelpButton />,
        }}
      />
      <Stack.Screen
        name="money-radar"
        options={{
          title: 'Money radar',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="medicine-saver"
        options={{
          title: 'Medicine saver',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="place-detail"
        options={{
          title: 'Claim guide',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
