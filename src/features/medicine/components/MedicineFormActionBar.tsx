import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';

export interface MedicineFormActionBarProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  bottomInset: number;
}

export const MedicineFormActionBar: React.FC<MedicineFormActionBarProps> = ({
  isEditing,
  isSubmitting,
  onSubmit,
  onCancel,
  bottomInset,
}) => {
  const { colors } = useTheme();
  const copy = useCopy();
  const m = copy.medicineForm;

  return (
    <View
      style={[
        styles.actionBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(bottomInset, 12),
        },
      ]}
    >
      <Button
        label={isEditing ? m.saveButtonEdit : m.saveButtonAdd}
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.actionBtn}
      />
      <Button label={m.cancelButton} variant="quiet" onPress={onCancel} disabled={isSubmitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  actionBtn: { marginBottom: 8 },
});
