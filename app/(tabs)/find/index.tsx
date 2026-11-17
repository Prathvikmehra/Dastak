import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { useMedicines } from '../../../src/features/medicine/store';
import { formatRupees } from '../../../src/lib/formatters';

export default function FindHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { summary } = useMoney();
  const { globalTotals } = useMedicines();

  return (
    <Screen scrollable>
      <View style={styles.headerContainer}>
        <Text size="title" color="ink" style={styles.title}>
          Find money you are owed or can save
        </Text>
        <Text size="body" color="muted">
          Check forgotten deposits or find lower-cost medicines.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Money Radar Card */}
        <Card
          onPress={() => router.push('/find/money-radar')}
          style={styles.featureCard}
          accessibilityLabel="Open Money radar"
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Ionicons name="search" size={28} color={colors.primary} />
            </View>
            <Ionicons name="arrow-forward" size={22} color={colors.primary} />
          </View>

          <Text size="subtitle" color="ink" style={styles.cardTitle}>
            Money radar
          </Text>

          <Text size="body" color="muted" style={styles.cardDescription}>
            Search old bank accounts, inactive fixed deposits, unclaimed life insurance, and
            forgotten provident fund money.
          </Text>

          {/* Progress and recovery tracker */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.button,
                },
              ]}
            >
              <Text size="caption" color="primary" style={{ fontWeight: '600' }}>
                Checked {summary.checked} of {summary.total} places
              </Text>
            </View>

            {summary.found > 0 && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <Text size="caption" color="primary" style={{ fontWeight: '600' }}>
                  Found so far {formatRupees(summary.found)}
                </Text>
              </View>
            )}

            {summary.received > 0 && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <Text size="caption" color="success" style={{ fontWeight: '600' }}>
                  Received {formatRupees(summary.received)}
                </Text>
              </View>
            )}
          </View>

          {/* Plain truthful framing */}
          <Text size="caption" color="muted" style={styles.disclaimerText}>
            Note: RBI UDGAM covers participating banks only. It does not search post office savings,
            EPF, or insurance.
          </Text>
        </Card>

        {/* Medicine Saver Card */}
        <Card
          onPress={() => router.push('/find/medicine-saver')}
          style={styles.featureCard}
          accessibilityLabel="Open Medicine saver"
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Ionicons name="medkit-outline" size={28} color={colors.primary} />
            </View>
            <Ionicons name="arrow-forward" size={22} color={colors.primary} />
          </View>

          <Text size="subtitle" color="ink" style={styles.cardTitle}>
            Medicine saver
          </Text>
          <Text size="body" color="muted" style={styles.cardDescription}>
            Keep track of your monthly medicine expenses and see the difference when using generic
            alternatives with the same salt.
          </Text>

          {/* Spend and potential saving metrics */}
          <View style={styles.statusRow}>
            {globalTotals.monthlySpend > 0 && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <Text size="caption" color="primary" style={{ fontWeight: '600' }}>
                  Spending {formatRupees(globalTotals.monthlySpend)} a month
                </Text>
              </View>
            )}

            {globalTotals.monthlySaving !== null && globalTotals.monthlySaving > 0 && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.button,
                  },
                ]}
              >
                <Text size="caption" color="success" style={{ fontWeight: '600' }}>
                  You could save {formatRupees(globalTotals.monthlySaving)} a month
                </Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    paddingVertical: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: 6,
  },
  cardDescription: {
    lineHeight: 22,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  disclaimerText: {
    lineHeight: 18,
    marginTop: 4,
  },
});
