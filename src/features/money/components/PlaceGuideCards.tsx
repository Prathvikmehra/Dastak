import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { MoneyPlace } from '../types';
import { copy } from '../../../copy/en';

export interface PlaceGuideCardsProps {
  place: MoneyPlace;
}

export const PlaceGuideCards: React.FC<PlaceGuideCardsProps> = ({ place }) => {
  const { colors } = useTheme();

  return (
    <>
      {/* What this covers */}
      <Card style={styles.card}>
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.placeDetail.whatThisCovers}
        </Text>
        <Text size="body" color="muted" style={styles.body}>
          {place.covers}
        </Text>
      </Card>

      {/* What to keep ready */}
      <Card style={styles.card}>
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.placeDetail.whatToKeepReady}
        </Text>
        {place.keepReady.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text size="body" color="ink" style={styles.bulletText}>
              {item}
            </Text>
          </View>
        ))}
      </Card>

      {/* How to search */}
      <Card style={styles.card}>
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.placeDetail.howToSearch}
        </Text>
        {place.howToSearch.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <Text size="body" color="primary" style={styles.stepNumber}>
              {`${idx + 1}.`}
            </Text>
            <Text size="body" color="ink" style={styles.bulletText}>
              {step}
            </Text>
          </View>
        ))}
      </Card>

      {/* How to claim */}
      <Card style={styles.card}>
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.placeDetail.howToClaim}
        </Text>
        {place.howToClaim.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <Text size="body" color="primary" style={styles.stepNumber}>
              {`${idx + 1}.`}
            </Text>
            <Text size="body" color="ink" style={styles.bulletText}>
              {step}
            </Text>
          </View>
        ))}
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  body: {
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontWeight: '700',
    minWidth: 18,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
});
