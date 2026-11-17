import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Medicine } from '../types';
import { monthlySaving, refillDueIn, nextRefillDate } from '../helpers';
import { formatRupees, parseAmount } from '../../../lib/formatters';
import { defaultReminders } from '../../cases/reminders';
import { useCopy } from '../../../copy/context';

export interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onEdit, onDelete }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const m = copy.medicineSaver;

  const saving = monthlySaving(medicine);
  const brandAmt = parseAmount(medicine.brandPricePerStrip) ?? 0;
  const genericAmt = medicine.genericPricePerStrip
    ? parseAmount(medicine.genericPricePerStrip)
    : null;

  const dueDays = refillDueIn(medicine, new Date());
  const nextDate = nextRefillDate(medicine);

  const handleScheduleRefillReminder = async () => {
    if (!nextDate) {
      Alert.alert(m.refillDateNeededTitle, m.refillDateNeededMessage);
      return;
    }

    const res = await defaultReminders.scheduleFollowUp(
      medicine.id,
      m.refillReminderText(medicine.name),
      m.refillReminderText(medicine.name),
      nextDate
    );

    if (res.scheduled) {
      setReminderMsg(m.reminderScheduled(medicine.name));
    } else {
      Alert.alert(m.remindersOffTitle, m.remindersOffMessage);
    }
  };

  const confirmDelete = () => {
    Alert.alert(m.deleteConfirmTitle, m.deleteConfirmMessage(medicine.name), [
      { text: m.cancelAction, style: 'cancel' },
      {
        text: m.deleteAction,
        style: 'destructive',
        onPress: () => onDelete(medicine.id),
      },
    ]);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <Text size="subtitle" color="ink">
            {medicine.name}
          </Text>
          <Text size="caption" color="muted">
            {m.stripsPerMonthCount(medicine.stripsPerMonth)}
          </Text>
        </View>
        <Ionicons name="medkit-outline" size={24} color={colors.primary} />
      </View>

      {/* Prices comparison */}
      <View style={styles.priceRow}>
        <View style={styles.priceBox}>
          <Text size="body" color="ink" style={{ fontWeight: '600' }}>
            {m.brandPricePerStrip(formatRupees(brandAmt))}
          </Text>
        </View>

        {genericAmt !== null && (
          <View style={styles.priceBox}>
            <Text size="body" color="primary" style={{ fontWeight: '600' }}>
              {m.priceFoundPerStrip(formatRupees(genericAmt))}
            </Text>
          </View>
        )}
      </View>

      {/* Monthly difference if generic price entered */}
      {saving !== null && saving > 0 && (
        <View
          style={[
            styles.savingBadge,
            { backgroundColor: colors.surfaceAlt, borderRadius: radius.button },
          ]}
        >
          <Ionicons name="trending-down" size={16} color={colors.success} />
          <Text size="caption" color="success" style={{ fontWeight: '600' }}>
            {m.saveMonthlyAmount(formatRupees(saving))}
          </Text>
        </View>
      )}

      {/* Refill due information */}
      {dueDays !== null && nextDate !== null && (
        <View style={styles.refillRow}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text size="caption" color="muted">
            {dueDays <= 0 ? m.refillDueToday : m.refillDueInDays(dueDays)}
          </Text>
        </View>
      )}

      {medicine.legacyLastRefillDate ? (
        <Text size="caption" color="muted" style={styles.legacyText}>
          {copy.dateField.legacySaved} {medicine.legacyLastRefillDate}
        </Text>
      ) : null}

      {reminderMsg && (
        <Text size="caption" color="success" style={styles.reminderMsg}>
          {reminderMsg}
        </Text>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <Button
          label={m.remindMe}
          variant="quiet"
          onPress={handleScheduleRefillReminder}
          style={styles.actionBtn}
        />
        <Button
          label={copy.common.edit}
          variant="quiet"
          onPress={() => onEdit(medicine)}
          style={styles.actionBtn}
        />
        <Button
          label={copy.common.delete}
          variant="quiet"
          onPress={confirmDelete}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleBox: { flex: 1 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 10 },
  priceBox: { gap: 2 },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginBottom: 10,
  },
  refillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  legacyText: { marginBottom: 8, fontStyle: 'italic' },
  reminderMsg: { marginBottom: 10, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1 },
});
