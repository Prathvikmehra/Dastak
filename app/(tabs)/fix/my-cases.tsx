import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, EmptyState, Button } from '../../../src/components';
import { useCases } from '../../../src/features/cases/store';
import { Case } from '../../../src/features/cases/types';
import { copy } from '../../../src/copy/en';
import { CaseCard } from '../../../src/features/cases/components/CaseCard';

export default function MyCasesScreen() {
  const router = useRouter();
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
                {copy.myCases.activeCount(openCases.length)}
              </Text>
              <Button label={copy.myCases.startCaseButton} onPress={handleStartNew} />
            </View>

            {openCases.length === 0 ? (
              <Card style={styles.emptySectionCard}>
                <Text size="body" color="muted">
                  {copy.myCases.emptyMessage}
                </Text>
              </Card>
            ) : (
              openCases.map((c) => (
                <CaseCard key={c.id} caseItem={c} now={now} onPress={() => handleOpenDetail(c)} />
              ))
            )}
          </View>

          {/* Resolved Section */}
          {resolvedCases.length > 0 ? (
            <View style={styles.section}>
              <Text size="subtitle" color="ink" style={styles.resolvedSectionHeader}>
                {copy.myCases.resolvedCount(resolvedCases.length)}
              </Text>

              {resolvedCases.map((c) => (
                <CaseCard key={c.id} caseItem={c} now={now} onPress={() => handleOpenDetail(c)} />
              ))}
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
  resolvedSectionHeader: {
    marginBottom: 12,
  },
});
