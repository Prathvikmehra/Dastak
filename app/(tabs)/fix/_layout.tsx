import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCopy } from '../../../src/copy/context';
import { HeaderHelpButton } from '../../../src/components/HeaderActions';

export default function FixStackLayout() {
  const { colors } = useTheme();
  const copy = useCopy();

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
          title: copy.tabs.fix,
          headerRight: () => <HeaderHelpButton />,
        }}
      />
      <Stack.Screen
        name="new-case"
        options={{
          title: copy.newCase.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="case-detail"
        options={{
          title: copy.caseDetail.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="my-cases"
        options={{
          title: copy.myCases.title,
          headerBackTitle: copy.common.back,
        }}
      />
    </Stack>
  );
}
