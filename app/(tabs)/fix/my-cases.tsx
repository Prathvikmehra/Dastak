import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, EmptyState, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCases } from '../../../src/features/cases/store';
import { Case } from '../../../src/features/cases/types';
import { LADDERS } from '../../../src/features/cases/ladders';
import {
  daysElapsed,
  currentStep,
  nextStep,
  daysUntilNext,
  hasEscalatedPastFirstStep,
} from '../../../src/features/cases/engine';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';

export default function MyCasesScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { openCases, resolvedCases, cases } = useCases();

  const handleOpenDetail = (caseItem: Case) => {
    router.push({
      pathname: '/fix/case-detail',
      params: { id: caseItem.id },
    });
  };

  const handleStartNew = () => {
    router.push('/fix/new-case');
  };

  const now = new Date();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          {copy.myCases.title}
        </Text>
        <Text size="body" color="muted">
          {copy.myCases.subtitle}
        </Text>
      </View>

      {cases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            iconName="folder-open-outline"
            title={copy.myCases.emptyTitle}
            description={copy.myCases.emptySubtitle}
            actionLabel={copy.myCases.startCaseButton}
            onAction={handleStartNew}
          />
        </View>
      ) : (
        <View style={styles.content}>
          {/* In Progress Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text size="subtitle" color="ink">
                {copy.myCases.inProgressSection} ({openCases.length})
              </Text>
              {/* Primary action button */}
              <Button label={copy.myCases.startCaseButton} onPress={handleStartNew} />
            </View>

            {openCases.length === 0 ? (
              <Card style={styles.emptySectionCard}>
                <Text size="body" color="muted">
                  No active cases in progress.
                </Text>
              </Card>
            ) : (
              openCases.map((c) => {
                const ladder = LADDERS[c.issueType];
                const elapsed = daysElapsed(c, now);
                const step = currentStep(c, now);
                const next = nextStep(c, now);
                const remaining = daysUntilNext(c, now);
                const isOverdue = hasEscalatedPastFirstStep(c, now);

                const parsed = parseAmount(c.amount);
                const amountText = parsed !== null ? formatRupees(parsed) : c.amount;

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
                    key={c.id}
                    onPress={() => handleOpenDetail(c)}
                    style={styles.caseCard}
                    accessibilityLabel={`Case for ${c.company || 'unknown'}, ${amountText}`}
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
                      {c.company || 'Grievance Case'}
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
              })
            )}
          </View>

          {/* Resolved Section */}
          {resolvedCases.length > 0 ? (
            <View style={styles.section}>
              <Text size="subtitle" color="ink" style={styles.resolvedSectionHeader}>
                {copy.myCases.resolvedSection} ({resolvedCases.length})
              </Text>

              {resolvedCases.map((c) => {
                const ladder = LADDERS[c.issueType];
                const parsed = parseAmount(c.amount);
                const originalAmount = parsed !== null ? formatRupees(parsed) : c.amount;
                const recoveredAmount =
                  c.recoveredAmount !== undefined ? formatRupees(c.recoveredAmount) : undefined;

                return (
                  <Card
                    key={c.id}
                    onPress={() => handleOpenDetail(c)}
                    style={styles.caseCard}
                    accessibilityLabel={`Resolved case for ${c.company}`}
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
                      {c.company || 'Grievance Case'}
                    </Text>

                    {recoveredAmount ? (
                      <Text size="body" color="success" style={styles.cardAmount}>
                        {copy.myCases.recoveredBadge(recoveredAmount)}
                      </Text>
                    ) : originalAmount ? (
                      <Text size="body" color="muted" style={styles.cardAmount}>
                        {originalAmount}
                      </Text>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 6,
  },
  emptyContainer: {
    paddingTop: 36,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptySectionCard: {
    padding: 16,
    alignItems: 'center',
  },
  caseCard: {
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
  resolvedSectionHeader: {
    marginBottom: 12,
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
