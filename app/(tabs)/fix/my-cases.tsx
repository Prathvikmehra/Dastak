import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, EmptyState, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { CaseItem } from '../../../src/features/cases/types';

const INITIAL_CASES: CaseItem[] = [];

export default function MyCasesScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);

  const handleCreateNew = () => {
    router.push('/fix/new-case');
  };

  const handleOpenDetail = (item: CaseItem) => {
    router.push({
      pathname: '/fix/case-detail',
      params: {
        id: item.id,
        title: item.title,
        amount: item.amount || '0',
        status: item.status,
      },
    });
  };

  return (
    <Screen scrollable>
      {cases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            iconName="folder-open-outline"
            title="No cases yet"
            description="When you start a complaint for UPI fraud, refunds, or bank disputes, your progress will be tracked here."
            actionLabel="Start a case"
            onAction={handleCreateNew}
          />

          <View style={styles.demoNotice}>
            <Button
              label="Preview with a sample case"
              variant="quiet"
              onPress={() => {
                setCases([
                  {
                    id: 'CAS-1042',
                    issueType: 'upi_fraud',
                    title: 'UPI payment stuck between banks',
                    description: 'Money deducted from ICICI but merchant did not receive',
                    amount: '2,500',
                    status: 'in_progress',
                    createdAt: '2026-11-15',
                    updatedAt: '2026-11-15',
                    nextStep: 'Awaiting bank nodal officer response',
                  },
                ]);
              }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.headerRow}>
            <Text size="subtitle" color="ink">
              Your active complaints ({cases.length})
            </Text>
            {/* Single primary action on screen */}
            <Button label="New case" onPress={handleCreateNew} />
          </View>

          {cases.map((c) => (
            <Card
              key={c.id}
              onPress={() => handleOpenDetail(c)}
              style={styles.caseCard}
              accessibilityLabel={`Case ${c.id}: ${c.title}`}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.button,
                    },
                  ]}
                >
                  <Text size="caption" color="primary" style={styles.badgeText}>
                    In progress
                  </Text>
                </View>
                <Text size="caption" color="muted">
                  {c.id}
                </Text>
              </View>

              <Text size="subtitle" color="ink" style={styles.titleText}>
                {c.title}
              </Text>

              {c.amount ? (
                <Text size="body" color="action" style={styles.amountText}>
                  ₹{c.amount}
                </Text>
              ) : null}

              <Text size="body" color="muted" numberOfLines={2}>
                Next: {c.nextStep}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  demoNotice: {
    marginTop: 20,
    width: '100%',
    maxWidth: 280,
  },
  listContainer: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  caseCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  titleText: {
    marginBottom: 4,
  },
  amountText: {
    fontWeight: '700',
    marginBottom: 6,
  },
});
