import React from 'react';
import { Stack } from 'expo-router';
import { PersonForm } from '../../../src/features/money/components/PersonForm';
import { useCopy } from '../../../src/copy/context';

export default function PersonFormScreen() {
  const copy = useCopy();

  return (
    <>
      <Stack.Screen
        options={{
          title: copy.personForm.title,
          headerBackTitle: copy.common.back,
        }}
      />
      <PersonForm />
    </>
  );
}
