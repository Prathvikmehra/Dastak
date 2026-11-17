import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';

export interface CorruptDataBannerProps {
  show: boolean;
}

export const CorruptDataBanner: React.FC<CorruptDataBannerProps> = ({ show }) => {
  const { colors } = useTheme();

  if (!show) {
    return null;
  }

  return (
    <Card
      style={[styles.card, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
    >
      <Text size="body" color="danger">
        We could not read your saved cases. A backup was kept.
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
