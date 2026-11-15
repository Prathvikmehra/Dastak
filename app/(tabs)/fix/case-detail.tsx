import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Button, EmptyState, Field } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCases } from '../../../src/features/cases/store';
import { LADDERS } from '../../../src/features/cases/ladders';
import {
  daysElapsed,
  currentStep,
  evidenceProgress,
  buildDraft,
} from '../../../src/features/cases/engine';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';

export default function CaseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, radius } = useTheme();
  const { getCase, updateCase, resolveCase } = useCases();

  const caseItem = params.id ? getCase(params.id) : undefined;
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [recoveredInput, setRecoveredInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!caseItem) {
    return (
      <Screen>
        <EmptyState
          iconName="alert-circle-outline"
          title="Case not found"
          description="We could not find the case you selected. It may have been removed or not saved yet."
          actionLabel="View all cases"
          onAction={() => router.push('/fix/my-cases')}
        />
      </Screen>
    );
  }

  const now = new Date();
  const elapsed = daysElapsed(caseItem, now);
  const ladder = LADDERS[caseItem.issueType];
  const step = currentStep(caseItem, now);
  const progress = evidenceProgress(caseItem);

  const isFraudUnder24h = caseItem.issueType === 'fraud' && elapsed === 0 && !caseItem.resolvedAt;

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
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleShareDraft = async () => {
    const draft = buildDraft(caseItem, step);
    await Share.share({
      title: 'Formal grievance complaint draft',
      message: draft,
    });
  };

  const handleConfirmResolve = async () => {
    setIsResolving(true);
    const parsed = parseAmount(recoveredInput);
    const finalAmount =
      parsed !== null ? parsed : numericAmount !== null ? numericAmount : undefined;

    await resolveCase(caseItem.id, finalAmount);
    setIsResolving(false);
    setShowResolveModal(false);
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
          {caseItem.company || 'Grievance Case'}
        </Text>

        {displayAmount ? (
          <Text size="subtitle" color="action" style={styles.amountText}>
            {displayAmount}
          </Text>
        ) : null}

        {caseItem.reference ? (
          <Text size="caption" color="muted" style={styles.referenceText}>
            Ref: {caseItem.reference}
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
                new Date(caseItem.resolvedAt).toLocaleDateString(),
                caseItem.recoveredAmount !== undefined
                  ? formatRupees(caseItem.recoveredAmount)
                  : undefined
              )}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* Fraud Urgent 24h Banner */}
      {isFraudUnder24h ? (
        <Card
          style={[
            styles.fraudBanner,
            {
              backgroundColor: '#FDF2F2',
              borderColor: colors.danger,
              borderRadius: radius.card,
            },
          ]}
        >
          <View style={styles.fraudBannerHeader}>
            <Ionicons name="warning" size={24} color={colors.danger} />
            <Text size="subtitle" color="danger" style={styles.fraudBannerTitle}>
              {copy.caseDetail.fraudUrgent.bannerTitle}
            </Text>
          </View>
          <Text size="body" color="ink" style={styles.fraudBannerBody}>
            {copy.caseDetail.fraudUrgent.bannerBody}
          </Text>
          {/* Primary action for urgent fraud */}
          <Button
            label={copy.caseDetail.fraudUrgent.callButton}
            onPress={() => handleCall('1930')}
            icon={<Ionicons name="call" size={20} color={colors.onAction} />}
            style={styles.call1930Button}
          />
        </Card>
      ) : null}

      {/* "Do this now" Card */}
      <Card style={styles.currentStepCard}>
        <View style={styles.stepTitleRow}>
          <View
            style={[
              styles.stepBadge,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.button,
              },
            ]}
          >
            <Text size="caption" color="primary" style={styles.stepBadgeText}>
              {copy.caseDetail.doThisNow.title}
            </Text>
          </View>
        </View>

        <Text size="subtitle" color="ink" style={styles.stepWho}>
          {step.who}
        </Text>

        <Text size="body" color="ink" style={styles.stepHow}>
          {step.how}
        </Text>

        <View style={styles.actionsContainer}>
          {/* If fraud under 24h has the primary button, make share draft quiet; otherwise it is the single primary action */}
          <Button
            label={copy.caseDetail.doThisNow.shareDraftButton}
            variant={isFraudUnder24h ? 'quiet' : 'primary'}
            onPress={handleShareDraft}
            icon={
              <Ionicons
                name="share-outline"
                size={20}
                color={isFraudUnder24h ? colors.primary : colors.onAction}
              />
            }
          />

          {step.phone ? (
            <Button
              label={copy.caseDetail.doThisNow.callButton(step.phone)}
              variant="quiet"
              onPress={() => handleCall(step.phone!)}
              icon={<Ionicons name="call-outline" size={18} color={colors.primary} />}
            />
          ) : null}

          {step.link ? (
            <Button
              label={copy.caseDetail.doThisNow.websiteButton}
              variant="quiet"
              onPress={() => handleOpenWebsite(step.link!)}
              icon={<Ionicons name="open-outline" size={18} color={colors.primary} />}
            />
          ) : null}
        </View>
      </Card>

      {/* Evidence Checklist */}
      <Card style={styles.evidenceCard}>
        <View style={styles.evidenceHeaderRow}>
          <Text size="subtitle" color="ink">
            {copy.caseDetail.evidence.title}
          </Text>
          <Text size="caption" color="primary" style={styles.progressText}>
            {copy.caseDetail.evidence.progress(progress.done, progress.total)}
          </Text>
        </View>

        {/* Visual Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: progress.done === progress.total ? colors.success : colors.primary,
                width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
              },
            ]}
          />
        </View>

        <Text size="caption" color="muted" style={styles.evidenceHint}>
          {copy.caseDetail.evidence.hint}
        </Text>

        <View style={styles.checklist}>
          {ladder.evidenceChecklist.map((item) => {
            const isChecked = Boolean(caseItem.evidence && caseItem.evidence[item]);
            return (
              <Pressable
                key={item}
                onPress={() => handleToggleEvidence(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={`${item}, ${isChecked ? 'ready' : 'not ready'}`}
                style={[
                  styles.checklistItem,
                  {
                    borderColor: isChecked ? colors.success : colors.border,
                    backgroundColor: isChecked ? colors.surfaceAlt : colors.surface,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <Ionicons
                  name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isChecked ? colors.success : colors.muted}
                />
                <Text
                  size="body"
                  color={isChecked ? 'ink' : 'muted'}
                  style={[styles.checklistLabel, isChecked && styles.checklistLabelDone]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Vertical Timeline of Ladder Steps */}
      <Card style={styles.timelineCard}>
        <Text size="subtitle" color="ink" style={styles.timelineTitle}>
          {copy.caseDetail.timeline.title}
        </Text>

        <View style={styles.timelineList}>
          {ladder.steps.map((s, index) => {
            const isCurrent = s.id === step.id;
            const isPast = s.dayOffset < step.dayOffset;
            const isFuture = s.dayOffset > step.dayOffset;
            const daysRemaining = s.dayOffset - elapsed;

            return (
              <View key={s.id} style={styles.timelineStepRow}>
                {/* Timeline connector dot and line */}
                <View style={styles.timelineAxis}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: isPast
                          ? colors.success
                          : isCurrent
                            ? colors.primary
                            : colors.border,
                        borderColor: isCurrent ? colors.surface : 'transparent',
                      },
                    ]}
                  >
                    {isPast ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
                  </View>
                  {index < ladder.steps.length - 1 ? (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isPast ? colors.success : colors.border,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                {/* Step content */}
                <View
                  style={[
                    styles.timelineStepCard,
                    isCurrent && {
                      borderColor: colors.primary,
                      borderWidth: 1.5,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.button,
                    },
                  ]}
                >
                  <View style={styles.stepHeaderRow}>
                    <Text
                      size="subtitle"
                      color={isCurrent ? 'primary' : isPast ? 'ink' : 'muted'}
                      style={styles.stepWhoText}
                    >
                      {s.who}
                    </Text>
                    {isCurrent ? (
                      <View
                        style={[
                          styles.activeBadge,
                          {
                            backgroundColor: colors.primary,
                            borderRadius: radius.button,
                          },
                        ]}
                      >
                        <Text size="caption" color="surface">
                          {copy.caseDetail.timeline.currentBadge}
                        </Text>
                      </View>
                    ) : isFuture ? (
                      <Text size="caption" color="muted">
                        {copy.caseDetail.timeline.inDays(daysRemaining)}
                      </Text>
                    ) : (
                      <Text size="caption" color="success">
                        {copy.caseDetail.timeline.completedBadge}
                      </Text>
                    )}
                  </View>
                  <Text size="caption" color={isCurrent ? 'ink' : 'muted'}>
                    Day {s.dayOffset}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Resolve Section */}
      {!caseItem.resolvedAt ? (
        <View style={styles.resolveSection}>
          {showResolveModal ? (
            <Card style={styles.resolveCard}>
              <Text size="subtitle" color="ink" style={styles.resolveCardTitle}>
                {copy.caseDetail.resolve.cardTitle}
              </Text>
              <Text size="body" color="muted" style={styles.resolveCardSubtitle}>
                {copy.caseDetail.resolve.cardSubtitle}
              </Text>

              <Field
                label={copy.caseDetail.resolve.amountLabel}
                placeholder={caseItem.amount || '0'}
                value={recoveredInput}
                onChangeText={setRecoveredInput}
                keyboardType="numeric"
                helper="Leave blank if the full amount was recovered"
              />

              <Button
                label={isResolving ? 'Resolving...' : copy.caseDetail.resolve.confirmButton}
                variant="primary"
                onPress={handleConfirmResolve}
                disabled={isResolving}
                style={styles.confirmResolveButton}
              />

              <Button
                label={copy.caseDetail.resolve.cancelButton}
                variant="quiet"
                onPress={() => setShowResolveModal(false)}
                disabled={isResolving}
              />
            </Card>
          ) : (
            <Button
              label={copy.caseDetail.resolve.button}
              variant="quiet"
              onPress={() => {
                setRecoveredInput(caseItem.amount || '');
                setShowResolveModal(true);
              }}
              style={styles.resolveTriggerButton}
            />
          )}
        </View>
      ) : null}
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
  fraudBanner: {
    borderWidth: 2,
    marginBottom: 16,
  },
  fraudBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fraudBannerTitle: {
    fontWeight: '700',
  },
  fraudBannerBody: {
    marginBottom: 14,
  },
  call1930Button: {
    width: '100%',
  },
  currentStepCard: {
    marginBottom: 16,
  },
  stepTitleRow: {
    marginBottom: 8,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepBadgeText: {
    fontWeight: '600',
  },
  stepWho: {
    marginBottom: 6,
    fontWeight: '700',
  },
  stepHow: {
    marginBottom: 16,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 10,
  },
  evidenceCard: {
    marginBottom: 16,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  evidenceHint: {
    marginBottom: 12,
  },
  checklist: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 48,
    borderWidth: 1,
    gap: 12,
  },
  checklistLabel: {
    flex: 1,
  },
  checklistLabelDone: {
    textDecorationLine: 'line-through',
  },
  timelineCard: {
    marginBottom: 20,
  },
  timelineTitle: {
    marginBottom: 16,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineStepRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineAxis: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineStepCard: {
    flex: 1,
    marginLeft: 8,
    padding: 10,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepWhoText: {
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resolveSection: {
    marginBottom: 32,
  },
  resolveCard: {
    marginBottom: 12,
  },
  resolveCardTitle: {
    marginBottom: 4,
  },
  resolveCardSubtitle: {
    marginBottom: 14,
  },
  confirmResolveButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  resolveTriggerButton: {
    marginTop: 4,
  },
});
