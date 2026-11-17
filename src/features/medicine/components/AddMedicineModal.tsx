import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Card, Text, Field, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Medicine } from '../types';
import { copy } from '../../../copy/en';

export interface AddMedicineModalProps {
  visible: boolean;
  personId: string;
  onClose: () => void;
  onSave: (input: Omit<Medicine, 'id'>) => Promise<void>;
  initialMedicine?: Medicine | null;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  visible,
  personId,
  onClose,
  onSave,
  initialMedicine,
}) => {
  const { colors, radius } = useTheme();

  const [name, setName] = useState(initialMedicine?.name || '');
  const [brandPrice, setBrandPrice] = useState(initialMedicine?.brandPricePerStrip || '');
  const [genericPrice, setGenericPrice] = useState(initialMedicine?.genericPricePerStrip || '');
  const [strips, setStrips] = useState(String(initialMedicine?.stripsPerMonth || '1'));
  const [lastRefill, setLastRefill] = useState(initialMedicine?.lastRefillDate || '');
  const [refillDays, setRefillDays] = useState(String(initialMedicine?.refillEveryDays ?? 30));
  const [note, setNote] = useState(initialMedicine?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !brandPrice.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        personId,
        name: name.trim(),
        brandPricePerStrip: brandPrice.trim(),
        genericPricePerStrip: genericPrice.trim() || undefined,
        stripsPerMonth: Math.max(1, Number(strips) || 1),
        lastRefillDate: lastRefill.trim() || undefined,
        refillEveryDays: Math.max(1, Number(refillDays) || 30),
        note: note.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.modalCard}>
          <Text size="subtitle" color="ink" style={styles.title}>
            {initialMedicine ? 'Edit medicine' : 'Add a medicine'}
          </Text>

          {/* Mandatory doctor safety disclaimer */}
          <Card
            style={[
              styles.safetyNotice,
              { backgroundColor: colors.surfaceAlt, borderRadius: radius.card },
            ]}
          >
            <Text size="caption" color="ink" style={{ lineHeight: 18 }}>
              {copy.medicineSaver.safetyNotice}
            </Text>
          </Card>

          <Field
            label="Medicine name"
            placeholder="e.g. Telmisartan 40mg"
            value={name}
            onChangeText={setName}
          />

          <Field
            label="Brand price per strip (₹)"
            placeholder="e.g. 180"
            value={brandPrice}
            onChangeText={setBrandPrice}
            helper="Price you currently pay per strip"
          />

          <Field
            label="Generic price per strip (₹) (optional)"
            placeholder="e.g. 25"
            value={genericPrice}
            onChangeText={setGenericPrice}
            helper={copy.medicineSaver.genericHelper}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Field
                label="Strips / month"
                placeholder="1"
                value={strips}
                onChangeText={setStrips}
              />
            </View>
            <View style={styles.halfCol}>
              <Field
                label="Refill every (days)"
                placeholder="30"
                value={refillDays}
                onChangeText={setRefillDays}
              />
            </View>
          </View>

          <Field
            label="Last refill date (optional)"
            placeholder="e.g. 1 Nov 2026"
            value={lastRefill}
            onChangeText={setLastRefill}
            helper="Used to calculate your next refill date"
          />

          <Field
            label="Note (optional)"
            placeholder="e.g. After breakfast, or doctor instructions"
            value={note}
            onChangeText={setNote}
          />

          <Button
            label="Save medicine"
            onPress={handleSubmit}
            disabled={!name.trim() || !brandPrice.trim() || isSubmitting}
            style={styles.saveBtn}
          />
          <Button label="Cancel" variant="quiet" onPress={onClose} />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    maxHeight: '92%',
  },
  title: {
    marginBottom: 8,
  },
  safetyNotice: {
    marginBottom: 12,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 8,
  },
});
