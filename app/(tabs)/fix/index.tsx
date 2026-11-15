import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCases } from '../../../src/features/cases/store';
import { IssueType } from '../../../src/features/cases/types';
import {
  currentStep,
  daysUntilNext,
  hasEscalatedPastFirstStep,
} from '../../../src/features/cases/engine';
import { formatRupees } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';

interface DoorItem {
  id: IssueType;
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const DOORS: DoorItem[] = [
  {
    id: 'refund',
    title: copy.fixHome.doors.refund.title,
    description: copy.fixHome.doors.refund.subtitle,
    iconName: 'cart-outline',
  },
  {
    id: 'fraud',
    title: copy.fixHome.doors.fraud.title,
    description: copy.fixHome.doors.fraud.subtitle,
    iconName: 'alert-circle-outline',
  },
  {
    id: 'bank',
    title: copy.fixHome.doors.bank.title,
    description: copy.fixHome.doors.bank.subtitle,
    iconName: 'business-outline',
  },
  {
    id: 'insurance',
    title: copy.fixHome.doors.insurance.title,
    description: copy.fixHome.doors.insurance.subtitle,
    iconName: 'shield-outline',
  },
];

export default function FixHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { openCases, totalRecovered } = useCases();
  const [description, setDescription] = useState('');

  const now = new Date();

  // Find most urgent next step among open cases
  let urgentNextText = '';
  if (openCases.length > 0) {
    let minDays = Infinity;
    for (const c of openCases) {
      const isOverdue = hasEscalatedPastFirstStep(c, now);
      const step = currentStep(c, now);
      const remaining = daysUntilNext(c, now);

      if (isOverdue) {
        urgentNextText = `Action needed: ${step.who}`;
        break;
      } else if (remaining !== null && remaining < minDays) {
        minDays = remaining;
        urgentNextText =
          remaining === 0 ? `Today: ${step.who}` : `Next: ${step.who} in ${remaining}d`;
      } else if (!urgentNextText) {
        urgentNextText = `Next: ${step.who}`;
      }
    }
  }

  const handleStartCase = () => {
    router.push({
      pathname: '/fix/new-case',
      params: { note: description },
    });
  };

  const handleSelectDoor = (doorId: IssueType) => {
    router.push({
      pathname: '/fix/new-case',
      params: { issueType: doorId },
    });
  };

  return (
    <Screen scrollable>
      {/* Recovered Banner if any money has been recovered */}
      {totalRecovered > 0 ? (
        <View
          style={[
            styles.recoveredBanner,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.success,
              borderRadius: radius.card,
            },
          ]}
        >
          <Ionicons name="sparkles" size={20} color={colors.success} />
          <Text size="subtitle" color="success" style={styles.recoveredText}>
            {copy.fixHome.recoveredBanner(formatRupees(totalRecovered))}
          </Text>
        </View>
      ) : null}

      {/* Open Cases Summary Card (when open cases exist) */}
      {openCases.length > 0 ? (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryBadge}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text size="subtitle" color="ink" style={styles.summaryTitle}>
                {copy.fixHome.summaryTitle(openCases.length)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View my cases"
              onPress={() => router.push('/fix/my-cases')}
              style={styles.quietLink}
            >
              <Text size="body" color="primary" style={styles.linkText}>
                {copy.fixHome.viewMyCases}
              </Text>
            </Pressable>
          </View>

          {urgentNextText ? (
            <View style={styles.urgentRow}>
              <Ionicons name="arrow-forward-circle" size={16} color={colors.primary} />
              <Text size="body" color="muted" numberOfLines={1} style={styles.urgentText}>
                {urgentNextText}
              </Text>
            </View>
          ) : null}

          <Button
            label={copy.fixHome.viewMyCases}
            variant="quiet"
            onPress={() => router.push('/fix/my-cases')}
            style={styles.summaryButton}
          />
        </Card>
      ) : null}

      {/* What happened? input box */}
      <Card style={styles.promptCard}>
        <Text size="subtitle" color="ink" style={styles.cardHeader}>
          {copy.fixHome.title}
        </Text>
        <Text size="body" color="muted" style={styles.cardSubtitle}>
          {copy.fixHome.subtitle}
        </Text>

        <Field
          label="Describe your problem"
          placeholder="For example: 2,000 rupees cut from bank via UPI but shopkeeper did not receive it"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          inputStyle={styles.multilineInput}
        />

        {/* The single primary action on this screen */}
        <Button
          label="Start a case"
          onPress={handleStartCase}
          icon={<Ionicons name="arrow-forward" size={20} color={colors.onAction} />}
        />
      </Card>

      {/* 4 Issue Doors */}
      <View style={styles.sectionHeaderRow}>
        <Text size="subtitle" color="ink">
          Common problems
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View my cases"
          onPress={() => router.push('/fix/my-cases')}
          style={styles.quietLink}
        >
          <Text size="body" color="primary" style={styles.linkText}>
            {copy.myCases.title}
          </Text>
        </Pressable>
      </View>

      <View style={styles.doorsList}>
        {DOORS.map((door) => (
          <Card
            key={door.id}
            onPress={() => handleSelectDoor(door.id)}
            style={styles.doorCard}
            accessibilityLabel={door.title}
          >
            <View style={styles.doorRow}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <Ionicons name={door.iconName} size={24} color={colors.primary} />
              </View>

              <View style={styles.doorTextContainer}>
                <Text size="subtitle" color="ink">
                  {door.title}
                </Text>
                <Text size="body" color="muted">
                  {door.description}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  recoveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  recoveredText: {
    fontWeight: '700',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontWeight: '600',
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  urgentText: {
    flex: 1,
  },
  summaryButton: {
    marginTop: 4,
  },
  promptCard: {
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 6,
  },
  cardSubtitle: {
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quietLink: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  linkText: {
    fontWeight: '600',
  },
  doorsList: {
    gap: 12,
    marginBottom: 24,
  },
  doorCard: {
    paddingVertical: 14,
  },
  doorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  doorTextContainer: {
    flex: 1,
    marginRight: 8,
  },
});
