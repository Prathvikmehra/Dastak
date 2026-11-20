import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MedicineForm } from '../../../src/features/medicine/components/MedicineForm';
import { useCopy } from '../../../src/copy/context';

export default function MedicineFormScreen() {
  const params = useLocalSearchParams<{ personId?: string; medicineId?: string }>();
  const copy = useCopy();

  const personId = params.personId || 'me';
  const medicineId = params.medicineId;
  const isEdit = Boolean(medicineId);

  const title = isEdit ? copy.medicineForm.editTitle : copy.medicineForm.addTitle;

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerBackTitle: copy.common.back,
        }}
      />
      <MedicineForm personId={personId} medicineId={medicineId} />
    </>
  );
}
