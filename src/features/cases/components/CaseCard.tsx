import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Case } from '../types';
import { getLocalizedLadder } from '../ladders';
import {
  daysElapsed,
  currentStep,
  nextStep,
  daysUntilNext,
  hasEscalatedPastFirstStep,
} from '../engine';
import { formatRupees, parseAmount } from '../../../lib/formatters';
import { useCopy } from '../../../copy/context';

export interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
  now?: Date;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onPress, now = new Date() }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const ladder = getLocalizedLadder(caseItem.issueType, copy);
  const isResolved = Boolean(caseItem.resolvedAt);

  const parsed = parseAmount(caseItem.amount);
  const amountText = parsed !== null ? formatRupees(parsed) : caseItem.amount;

  if (isResolved) {
    const recoveredAmount =
      caseItem.recoveredAmount !== undefined ? formatRupees(caseItem.recoveredAmount) : undefined;

    return (
      <Card
        onPress={onPress}
        style={styles.card}
        accessibilityLabel={`Resolved case for ${caseItem.company}`}
      >
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.issueChip,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.button,
              },
            ]}
          >
            <Text size="caption" color="muted" style={styles.chipText}>
              {ladder.title}
            </Text>
          </View>
          <View
            style={[
              styles.resolvedBadge,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.success,
                borderRadius: radius.button,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text size="caption" color="success" style={styles.resolvedBadgeText}>
              {copy.myCases.resolvedBadge}
            </Text>
          </View>
        </View>

        <Text size="subtitle" color="ink" style={styles.cardCompany}>
          {caseItem.company || 'Grievance Case'}
        </Text>

        {recoveredAmount ? (
          <Text size="body" color="success" style={styles.cardAmount}>
            {copy.myCases.recoveredBadge(recoveredAmount)}
          </Text>
        ) : amountText ? (
          <Text size="body" color="muted" style={styles.cardAmount}>
            {amountText}
          </Text>
        ) : null}
      </Card>
    );
  }

  // Open case
  const elapsed = daysElapsed(caseItem, now);
  const step = currentStep(caseItem, now, ladder);
  const next = nextStep(caseItem, now, ladder);
  const remaining = daysUntilNext(caseItem, now);
  const isOverdue = hasEscalatedPastFirstStep(caseItem, now);

  let nextStepText = '';
  if (isOverdue) {
    nextStepText = copy.myCases.overdueStep(step.who);
  } else if (next && remaining !== null) {
    nextStepText = copy.myCases.nextStep(next.who, remaining);
  } else {
    nextStepText = `Active: ${step.who}`;
  }

  return (
    <Card
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`Case for ${caseItem.company || 'unknown'}, ${amountText}`}
    >
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.issueChip,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.button,
            },
          ]}
        >
          <Text size="caption" color="primary" style={styles.chipText}>
            {ladder.title}
          </Text>
        </View>
        <Text size="caption" color="muted">
          {copy.myCases.daysOpen(elapsed)}
        </Text>
      </View>

      <Text size="subtitle" color="ink" style={styles.cardCompany}>
        {caseItem.company || 'Grievance Case'}
      </Text>

      {amountText ? (
        <Text size="body" color="action" style={styles.cardAmount}>
          {amountText}
        </Text>
      ) : null}

      <View style={styles.nextStepRow}>
        <Ionicons
          name={isOverdue ? 'alert-circle' : 'arrow-forward-circle'}
          size={16}
          color={isOverdue ? colors.danger : colors.primary}
        />
        <Text
          size="caption"
          color={isOverdue ? 'danger' : 'muted'}
          style={styles.nextStepText}
          numberOfLines={1}
        >
          {nextStepText}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontWeight: '600',
  },
  cardCompany: {
    marginBottom: 4,
    fontWeight: '600',
  },
  cardAmount: {
    fontWeight: '700',
    marginBottom: 8,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  nextStepText: {
    flex: 1,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  resolvedBadgeText: {
    fontWeight: '600',
  },
});
