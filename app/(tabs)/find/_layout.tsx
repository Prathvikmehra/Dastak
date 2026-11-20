import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCopy } from '../../../src/copy/context';
import { HeaderHelpButton } from '../../../src/components/HeaderActions';

export default function FindStackLayout() {
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
          title: copy.tabs.find,
          headerRight: () => <HeaderHelpButton />,
        }}
      />
      <Stack.Screen
        name="money-radar"
        options={{
          title: copy.moneyRadar.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="medicine-saver"
        options={{
          title: copy.medicineSaver.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="place-detail"
        options={{
          title: copy.placeDetail.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="medicine-form"
        options={{
          title: copy.medicineForm.addTitle,
          headerBackTitle: copy.common.back,
        }}
      />
      <Stack.Screen
        name="person-form"
        options={{
          title: copy.personForm.title,
          headerBackTitle: copy.common.back,
        }}
      />
    </Stack>
  );
}
