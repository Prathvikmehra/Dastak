import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { PLACES } from '../../../src/features/money/places';
import { MoneyPlaceStatus } from '../../../src/features/money/types';
import { STATUS_LABELS, followUpDate } from '../../../src/features/money/helpers';
import { PlaceGuideCards } from '../../../src/features/money/components/PlaceGuideCards';
import { openWeb } from '../../../src/lib/links';
import { defaultReminders } from '../../../src/features/cases/reminders';

const STATUS_OPTIONS: MoneyPlaceStatus[] = [
  'not_checked',
  'checked_nothing',
  'found_money',
  'claim_started',
  'money_received',
];

export default function PlaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId?: string; personId?: string }>();
  const { colors, radius, minTouchTarget } = useTheme();
  const { activePerson, records, updatePlace } = useMoney();

  const placeId = params.placeId || 'udgam';
  const place = PLACES.find((p) => p.id === placeId) || PLACES[0];
  const currentRecord = records[place.id];

  const [status, setStatus] = useState<MoneyPlaceStatus>(currentRecord?.status || 'not_checked');
  const [amount, setAmount] = useState(currentRecord?.amount || '');
  const [note, setNote] = useState(currentRecord?.note || '');
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const showAmountField =
    status === 'found_money' || status === 'claim_started' || status === 'money_received';

  const handleOpenSite = async () => {
    if (place.source) {
      await openWeb(place.source);
    }
  };

  const handleScheduleReminder = async () => {
    const targetDate = followUpDate(new Date(), 7);
    const dateFormatted = targetDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const res = await defaultReminders.scheduleFollowUp(
      place.id,
      `Check ${place.title}`,
      `Follow up on your unclaimed records search with ${place.portalName}.`,
      targetDate
    );
    if (res.scheduled) {
      setReminderMessage(`Reminder set for 9:00 AM on ${dateFormatted}.`);
    } else {
      Alert.alert(
        'Reminders are off',
        'Turn on reminders in Settings to receive alerts on follow-up days.'
      );
    }
  };

  const handleSave = async () => {
    await updatePlace(place.id, {
      status,
      amount: showAmountField ? amount : '',
      note,
    });
    router.back();
  };

  return (
    <Screen scrollable>
      {/* Header Info */}
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          {place.title}
        </Text>
        <Text size="body" color="primary" style={styles.portalSubtitle}>
          Official portal: {place.portalName}
        </Text>
        <Text size="body" color="muted">
          Tracking records for: {activePerson.name}
        </Text>
      </View>

      {/* Official website button if source URL exists */}
      {place.source && (
        <Card style={styles.actionCard}>
          <Text size="body" color="ink" style={styles.actionText}>
            Visit the official portal to search for records:
          </Text>
          <Button label={`Open ${place.portalName}`} variant="quiet" onPress={handleOpenSite} />
        </Card>
      )}

      {/* Guide Cards (covers, keep ready, how to search, how to claim) */}
      <PlaceGuideCards place={place} />

      {/* Status Picker & Update Form */}
      <Card style={styles.sectionCard}>
        <Text size="subtitle" color="ink" style={styles.sectionTitle}>
          Your check status
        </Text>
        <View style={styles.statusOptions}>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = status === opt;
            return (
              <Pressable
                key={opt}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={STATUS_LABELS[opt]}
                onPress={() => setStatus(opt)}
                style={[
                  styles.statusOptionPill,
                  {
                    minHeight: minTouchTarget,
                    borderRadius: radius.button,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                  },
                ]}
              >
                <Text
                  size="body"
                  color={isSelected ? 'primary' : 'ink'}
                  style={{ fontWeight: isSelected ? '600' : '400' }}
                >
                  {STATUS_LABELS[opt]}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        {showAmountField && (
          <Field
            label="Amount (if known)"
            placeholder="e.g. 15000"
            value={amount}
            onChangeText={setAmount}
            helper="Enter numbers only. Formatted as rupees."
          />
        )}

        <Field
          label="Notes (optional)"
          placeholder="e.g. Visited branch, token number 42"
          value={note}
          onChangeText={setNote}
          helper="Keep record of reference numbers or branch contacts"
        />

        <Button
          label="Remind me in 7 days to check again"
          variant="quiet"
          onPress={handleScheduleReminder}
          style={styles.reminderButton}
        />

        {reminderMessage && (
          <Text size="caption" color="success" style={styles.reminderFeedback}>
            {reminderMessage}
          </Text>
        )}
      </Card>

      {/* Single primary action on screen */}
      <View style={styles.footer}>
        <Button label="Save update" onPress={handleSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  portalSubtitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  actionCard: {
    marginBottom: 16,
    gap: 12,
  },
  actionText: {
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusOptions: {
    gap: 8,
    marginBottom: 16,
  },
  statusOptionPill: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderButton: {
    marginTop: 8,
    marginBottom: 4,
  },
  reminderFeedback: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 32,
  },
});
