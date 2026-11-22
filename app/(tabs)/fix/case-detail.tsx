import React, { useState } from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, EmptyState } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCases } from '../../../src/features/cases/store';
import { getLocalizedLadder } from '../../../src/features/cases/ladders';
import {
  daysElapsed,
  currentStep,
  buildDraft,
  isFraudUrgent,
} from '../../../src/features/cases/engine';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { openPhone, openWeb } from '../../../src/lib/links';
import { toDisplay } from '../../../src/lib/dates';
import { useCopy } from '../../../src/copy/context';
import { UrgentBanner } from '../../../src/features/cases/components/UrgentBanner';
import { DoThisNowCard } from '../../../src/features/cases/components/DoThisNowCard';
import { EvidenceChecklist } from '../../../src/features/cases/components/EvidenceChecklist';
import { EscalationTimeline } from '../../../src/features/cases/components/EscalationTimeline';
import { ResolveCard } from '../../../src/features/cases/components/ResolveCard';

export default function CaseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, radius } = useTheme();
  const { getCase, updateCase, resolveCase } = useCases();
  const copy = useCopy();
  const [notice, setNotice] = useState<string | null>(null);

  const caseItem = params.id ? getCase(params.id) : undefined;

  if (!caseItem) {
    return (
      <Screen>
        <EmptyState
          iconName="alert-circle-outline"
          title={copy.caseDetail.emptyTitle}
          description={copy.caseDetail.emptyMessage}
          actionLabel={copy.common.back}
          onAction={() => router.push('/fix/my-cases')}
        />
      </Screen>
    );
  }

  const now = new Date();
  const elapsed = daysElapsed(caseItem, now);
  const ladder = getLocalizedLadder(caseItem.issueType, copy);
  const step = currentStep(caseItem, now, ladder);
  const isUrgent = isFraudUrgent(caseItem, now);

  const numericAmount = parseAmount(caseItem.amount);
  const displayAmount = numericAmount !== null ? formatRupees(numericAmount) : caseItem.amount;

  const handleToggleEvidence = async (item: string) => {
    const currentEvidence = caseItem.evidence || {};
    const updated = {
      ...currentEvidence,
      [item]: !currentEvidence[item],
    };
    await updateCase(caseItem.id, { evidence: updated });
  };

  const handleCall = (phoneNumber: string) => {
    openPhone(phoneNumber, (fallbackMsg) => setNotice(fallbackMsg));
  };

  const handleOpenWebsite = (url: string) => {
    openWeb(url, (fallbackMsg) => setNotice(fallbackMsg));
  };

  const handleShareDraft = async () => {
    const draft = buildDraft(caseItem, step);
    await Share.share({
      title: 'Formal grievance complaint draft',
      message: draft,
    });
  };

  const handleResolve = async (recoveredAmount?: number) => {
    await resolveCase(caseItem.id, recoveredAmount);
  };

  return (
    <Screen scrollable>
      {/* Top Header Card */}
      <Card style={styles.topCard}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.issueChip,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.button,
              },
            ]}
          >
            <Text size="caption" color="primary" style={styles.issueChipText}>
              {ladder.title}
            </Text>
          </View>
          <Text size="caption" color="muted">
            {copy.caseDetail.dayCount(elapsed)}
          </Text>
        </View>

        <Text size="title" color="ink" style={styles.companyName}>
          {caseItem.company || copy.common.grievanceCase}
        </Text>

        {displayAmount ? (
          <Text size="subtitle" color="action" style={styles.amountText}>
            {displayAmount}
          </Text>
        ) : null}

        {caseItem.reference &&
        caseItem.reference.trim() &&
        caseItem.reference.trim().toLowerCase() !== 'none' ? (
          <Text size="caption" color="muted" style={styles.referenceText}>
            {copy.caseDetail.refLabel(caseItem.reference.trim())}
          </Text>
        ) : null}

        {caseItem.resolvedAt ? (
          <View
            style={[
              styles.resolvedBanner,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.success,
                borderRadius: radius.button,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text size="caption" color="success" style={styles.resolvedBannerText}>
              {copy.caseDetail.resolve.resolvedBanner(
                toDisplay(caseItem.resolvedAt.slice(0, 10)),
                caseItem.recoveredAmount !== undefined
                  ? formatRupees(caseItem.recoveredAmount)
                  : undefined
              )}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* Notice fallback banner when dialing / browser link cannot open */}
      {notice ? (
        <Card style={styles.noticeCard}>
          <Text size="caption" color="danger">
            {notice}
          </Text>
        </Card>
      ) : null}

      {/* Fraud Urgent 24h Banner */}
      {isUrgent ? <UrgentBanner caseItem={caseItem} onCall1930={() => handleCall('1930')} /> : null}

      {/* "Do this now" Card */}
      <DoThisNowCard
        caseItem={caseItem}
        step={step}
        isUrgentBannerActive={isUrgent}
        onCall={handleCall}
        onOpenWebsite={handleOpenWebsite}
        onShareDraft={handleShareDraft}
      />

      {/* Evidence Checklist */}
      <EvidenceChecklist
        caseItem={caseItem}
        checklist={ladder.evidenceChecklist}
        onToggleItem={handleToggleEvidence}
      />

      {/* Vertical Timeline */}
      <EscalationTimeline
        steps={ladder.steps}
        activeStepId={step.id}
        activeDayOffset={step.dayOffset}
        elapsedDays={elapsed}
      />

      {/* Resolve Section */}
      <ResolveCard caseItem={caseItem} onResolve={handleResolve} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topCard: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  issueChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  issueChipText: {
    fontWeight: '600',
  },
  companyName: {
    marginBottom: 6,
  },
  amountText: {
    fontWeight: '700',
    marginBottom: 4,
  },
  referenceText: {
    marginTop: 2,
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
  },
  resolvedBannerText: {
    fontWeight: '600',
  },
  noticeCard: {
    marginBottom: 16,
    padding: 10,
  },
});
