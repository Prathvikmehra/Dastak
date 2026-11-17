import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Card, Text, Field, Button, DateField } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Medicine } from '../types';
import { useCopy } from '../../../copy/context';
import { LocalDate } from '../../../lib/dates';

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
  const copy = useCopy();
  const m = copy.addMedicineModal;

  const [name, setName] = useState(initialMedicine?.name || '');
  const [brandPrice, setBrandPrice] = useState(initialMedicine?.brandPricePerStrip || '');
  const [genericPrice, setGenericPrice] = useState(initialMedicine?.genericPricePerStrip || '');
  const [strips, setStrips] = useState(String(initialMedicine?.stripsPerMonth || '1'));
  const [lastRefill, setLastRefill] = useState<LocalDate | ''>(
    initialMedicine?.lastRefillDate || ''
  );
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
        lastRefillDate: lastRefill.trim() ? (lastRefill as LocalDate) : undefined,
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
            {initialMedicine ? m.titleEdit : m.titleAdd}
          </Text>

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
            label={m.nameLabel}
            placeholder={m.namePlaceholder}
            value={name}
            onChangeText={setName}
          />

          <Field
            label={m.brandPriceLabel}
            placeholder={m.brandPricePlaceholder}
            value={brandPrice}
            onChangeText={setBrandPrice}
          />

          <Field
            label={m.genericPriceLabel}
            placeholder={m.genericPricePlaceholder}
            value={genericPrice}
            onChangeText={setGenericPrice}
            helper={m.genericHelper}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Field
                label={m.stripsLabel}
                placeholder={m.stripsPlaceholder}
                value={strips}
                onChangeText={setStrips}
              />
            </View>
            <View style={styles.halfCol}>
              <Field
                label={m.refillDaysLabel}
                placeholder={m.refillDaysPlaceholder}
                value={refillDays}
                onChangeText={setRefillDays}
              />
            </View>
          </View>

          <DateField
            label={m.lastRefillLabel}
            value={lastRefill}
            onChange={setLastRefill}
            helper={m.lastRefillHelper}
            legacyValue={initialMedicine?.legacyLastRefillDate}
          />

          <Field
            label={m.noteLabel}
            placeholder={m.notePlaceholder}
            value={note}
            onChangeText={setNote}
          />

          <Button
            label={m.saveButton}
            onPress={handleSubmit}
            disabled={!name.trim() || !brandPrice.trim() || isSubmitting}
            style={styles.saveBtn}
          />
          <Button label={m.cancelButton} variant="quiet" onPress={onClose} />
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
