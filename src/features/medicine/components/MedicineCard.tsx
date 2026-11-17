import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Medicine } from '../types';
import { monthlySaving, refillDueIn, nextRefillDate } from '../helpers';
import { formatRupees, parseAmount } from '../../../lib/formatters';
import { defaultReminders } from '../../cases/reminders';
import { copy } from '../../../copy/en';

export interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onEdit, onDelete }) => {
  const { colors, radius } = useTheme();
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const saving = monthlySaving(medicine);
  const brandAmt = parseAmount(medicine.brandPricePerStrip) ?? 0;
  const genericAmt = medicine.genericPricePerStrip
    ? parseAmount(medicine.genericPricePerStrip)
    : null;

  const dueDays = refillDueIn(medicine, new Date());
  const nextDate = nextRefillDate(medicine);

  const handleScheduleRefillReminder = async () => {
    if (!nextDate) {
      Alert.alert(
        'Refill date needed',
        'Add your last refill date first so we know when your next refill is due.'
      );
      return;
    }

    const res = await defaultReminders.scheduleFollowUp(
      medicine.id,
      'Medicine refill reminder',
      copy.medicineSaver.refillReminderText(medicine.name),
      nextDate
    );

    if (res.scheduled) {
      const dateStr = nextDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      setReminderMsg(`Reminder set for 9:00 AM on ${dateStr}.`);
    } else {
      Alert.alert(
        'Reminders are off',
        'Turn on reminders in Settings to receive alerts on refill days.'
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete medicine',
      `Are you sure you want to remove ${medicine.name} from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(medicine.id),
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <Text size="subtitle" color="ink">
            {medicine.name}
          </Text>
          <Text size="caption" color="muted">
            {medicine.stripsPerMonth} strip{medicine.stripsPerMonth === 1 ? '' : 's'} / month
          </Text>
        </View>
        <Ionicons name="medkit-outline" size={24} color={colors.primary} />
      </View>

      {/* Prices comparison */}
      <View style={styles.priceRow}>
        <View style={styles.priceBox}>
          <Text size="caption" color="muted">
            Brand price
          </Text>
          <Text size="body" color="ink" style={{ fontWeight: '600' }}>
            {formatRupees(brandAmt)} / strip
          </Text>
        </View>

        {genericAmt !== null && (
          <View style={styles.priceBox}>
            <Text size="caption" color="muted">
              Price you found
            </Text>
            <Text size="body" color="primary" style={{ fontWeight: '600' }}>
              {formatRupees(genericAmt)} / strip
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
            Difference: save {formatRupees(saving)} / month
          </Text>
        </View>
      )}

      {/* Refill due information */}
      {dueDays !== null && nextDate !== null && (
        <View style={styles.refillRow}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text size="caption" color="muted">
            {dueDays <= 0
              ? 'Refill due now'
              : `Refill due in ${dueDays} day${dueDays === 1 ? '' : 's'}`}
          </Text>
        </View>
      )}

      {reminderMsg && (
        <Text size="caption" color="success" style={styles.reminderMsg}>
          {reminderMsg}
        </Text>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <Button
          label="Remind me for refill"
          variant="quiet"
          onPress={handleScheduleRefillReminder}
          style={styles.actionBtn}
        />
        <Button
          label="Edit"
          variant="quiet"
          onPress={() => onEdit(medicine)}
          style={styles.actionBtn}
        />
        <Button label="Delete" variant="quiet" onPress={confirmDelete} style={styles.actionBtn} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleBox: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  priceBox: {
    gap: 2,
  },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  refillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  reminderMsg: {
    fontWeight: '600',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  actionBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
  },
});
