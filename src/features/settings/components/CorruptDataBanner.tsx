import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';

export interface CorruptDataBannerProps {
  show: boolean;
}

export const CorruptDataBanner: React.FC<CorruptDataBannerProps> = ({ show }) => {
  const { colors } = useTheme();
  const copy = useCopy();

  if (!show) {
    return null;
  }

  return (
    <Card
      style={[styles.card, { borderColor: colors.danger, backgroundColor: colors.dangerSurface }]}
    >
      <Text size="body" color="danger">
        {copy.settings.corruptBanner}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});
