import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function FindHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();

  return (
    <Screen scrollable>
      <View style={styles.headerContainer}>
        <Text size="title" color="ink" style={styles.title}>
          Find money you are owed or can save
        </Text>
        <Text size="body" color="muted">
          Choose a tool below to check forgotten deposits or reduce monthly pharmacy expenses.
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
            Check lower-cost generic alternatives with the exact same chemical salts. Cut up to 80%
            from monthly pharmacy bills.
          </Text>
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
  },
});
