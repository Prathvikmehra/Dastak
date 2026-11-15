import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function CaseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    amount?: string;
    status?: string;
  }>();
  const { colors, radius } = useTheme();

  const caseId = params.id || 'CAS-1042';
  const title = params.title || 'UPI payment stuck between banks';
  const amount = params.amount || '2,500';

  return (
    <Screen scrollable>
      {/* Status banner */}
      <Card style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.button,
              },
            ]}
          >
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text size="caption" color="primary" style={styles.badgeText}>
              In progress
            </Text>
          </View>
          <Text size="caption" color="muted">
            Case number: {caseId}
          </Text>
        </View>

        <Text size="title" color="ink" style={styles.caseTitle}>
          {title}
        </Text>

        <Text size="subtitle" color="action" style={styles.amountText}>
          ₹{amount}
        </Text>
      </Card>

      {/* Recommended next step */}
      <Card style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
          <Text size="subtitle" color="ink" style={styles.stepTitle}>
            Next step for you
          </Text>
        </View>
        <Text size="body" color="ink" style={styles.stepDescription}>
          Submit this complaint to your bank grievance cell. We have prepared the letter for you.
        </Text>

        {/* The single primary action on this screen */}
        <Button
          label="Download complaint letter"
          onPress={() => {
            // Placeholder action - shares letter
          }}
          icon={<Ionicons name="download-outline" size={20} color={colors.onAction} />}
          style={styles.primaryAction}
        />

        <Button
          label="View all my cases"
          variant="quiet"
          onPress={() => router.push('/fix/my-cases')}
        />
      </Card>

      {/* Case timeline card */}
      <Card style={styles.timelineCard}>
        <Text size="subtitle" color="ink" style={styles.timelineHeading}>
          What happens next
        </Text>

        <View style={styles.timelineItem}>
          <Ionicons name="radio-button-on" size={18} color={colors.primary} />
          <View style={styles.timelineContent}>
            <Text size="body" color="ink" style={styles.timelineTitle}>
              Complaint drafted
            </Text>
            <Text size="caption" color="muted">
              Ready to send to bank branch or online nodal desk
            </Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <Ionicons name="radio-button-off" size={18} color={colors.muted} />
          <View style={styles.timelineContent}>
            <Text size="body" color="muted" style={styles.timelineTitle}>
              Bank acknowledgment (within 3 working days)
            </Text>
            <Text size="caption" color="muted">
              Bank will assign a reference ticket number
            </Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <Ionicons name="radio-button-off" size={18} color={colors.muted} />
          <View style={styles.timelineContent}>
            <Text size="body" color="muted" style={styles.timelineTitle}>
              RBI Ombudsman escalation
            </Text>
            <Text size="caption" color="muted">
              If bank does not solve within 30 days, we escalate directly to RBI
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  badgeText: {
    fontWeight: '600',
  },
  caseTitle: {
    marginBottom: 8,
  },
  amountText: {
    fontWeight: '700',
  },
  stepCard: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepTitle: {
    fontWeight: '600',
  },
  stepDescription: {
    marginBottom: 16,
  },
  primaryAction: {
    marginBottom: 10,
  },
  timelineCard: {
    marginBottom: 24,
  },
  timelineHeading: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
});
