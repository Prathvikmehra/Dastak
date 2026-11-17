import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { LadderStep } from '../types';
import { copy } from '../../../copy/en';

export interface EscalationTimelineProps {
  steps: LadderStep[];
  activeStepId: string;
  activeDayOffset: number;
  elapsedDays: number;
}

export const EscalationTimeline: React.FC<EscalationTimelineProps> = ({
  steps,
  activeStepId,
  activeDayOffset,
  elapsedDays,
}) => {
  const { colors, radius } = useTheme();

  return (
    <Card style={styles.card}>
      <Text size="subtitle" color="ink" style={styles.title}>
        {copy.caseDetail.timeline.title}
      </Text>

      <View style={styles.timelineList}>
        {steps.map((s, index) => {
          const isCurrent = s.id === activeStepId;
          const isPast = s.dayOffset < activeDayOffset;
          const isFuture = s.dayOffset > activeDayOffset;
          const daysRemaining = s.dayOffset - elapsedDays;

          return (
            <View key={s.id} style={styles.timelineStepRow}>
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
                {index < steps.length - 1 ? (
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
                  {copy.caseDetail.daysCount(s.dayOffset)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  title: {
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
});
