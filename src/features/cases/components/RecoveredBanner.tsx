import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';
import { formatRupees } from '../../../lib/formatters';

export interface RecoveredBannerProps {
  totalRecovered: number;
}

export const RecoveredBanner: React.FC<RecoveredBannerProps> = ({ totalRecovered }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  if (totalRecovered <= 0) return null;

  return (
    <View
      style={[
        styles.recoveredBanner,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.success,
          borderRadius: radius.card,
        },
      ]}
    >
      <Ionicons name="sparkles" size={20} color={colors.success} />
      <Text size="subtitle" color="success" style={styles.recoveredText}>
        {copy.fixHome.recoveredBanner(formatRupees(totalRecovered))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  recoveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  recoveredText: { fontWeight: '700' },
});
