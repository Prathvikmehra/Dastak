import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { useMedicines } from '../../../src/features/medicine/store';
import { formatRupees } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';

export default function FindHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { summary } = useMoney();
  const { globalTotals } = useMedicines();
  const f = copy.find;

  return (
    <Screen scrollable>
      <View style={styles.headerContainer}>
        <Text size="title" color="ink" style={styles.title}>
          {f.title}
        </Text>
        <Text size="body" color="muted">
          {f.subtitle}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Money Radar Card */}
        <Card
          onPress={() => router.push('/find/money-radar')}
          style={styles.featureCard}
          accessibilityLabel={f.openMoneyRadarAccessibility}
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
            {f.moneyRadarCardTitle}
          </Text>

          <Text size="body" color="muted" style={styles.cardDescription}>
            {f.moneyRadarCardDesc}
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
                {f.moneyRadarCheckedOfPlaces(summary.checked, summary.total)}
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
                  {f.moneyRadarFoundSoFar(formatRupees(summary.found))}
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
                  {f.moneyRadarReceived(formatRupees(summary.received))}
                </Text>
              </View>
            )}
          </View>

          {/* Plain truthful framing */}
          <Text size="caption" color="muted" style={styles.disclaimerText}>
            {f.moneyRadarUdgamNote}
          </Text>
        </Card>

        {/* Medicine Saver Card */}
        <Card
          onPress={() => router.push('/find/medicine-saver')}
          style={styles.featureCard}
          accessibilityLabel={f.openMedicineSaverAccessibility}
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
            {f.medicineSaverCardTitle}
          </Text>
          <Text size="body" color="muted" style={styles.cardDescription}>
            {f.medicineSaverCardDesc}
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
                  {f.spendingMonthly(formatRupees(globalTotals.monthlySpend))}
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
                  {f.couldSaveMonthly(formatRupees(globalTotals.monthlySaving))}
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
    marginBottom: 20,
  },
  title: {
    marginBottom: 6,
  },
  cardsContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  featureCard: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: 6,
  },
  cardDescription: {
    marginBottom: 14,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  disclaimerText: {
    marginTop: 6,
    lineHeight: 18,
  },
});
