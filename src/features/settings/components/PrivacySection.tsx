import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { copy } from '../../../copy/en';

export const PrivacySection: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.settings.privacyTitle}
        </Text>
      </View>
      <Text size="body" color="ink" style={styles.description}>
        {copy.settings.privacySubtitle}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 22,
  },
});
