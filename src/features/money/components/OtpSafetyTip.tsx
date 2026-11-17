import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { OTP_SAFETY_TIP } from '../places';

export const OtpSafetyTip: React.FC = () => {
  const { colors, radius } = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: colors.surfaceAlt, borderRadius: radius.card }]}>
      <View style={styles.row}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text size="caption" color="ink" style={styles.text}>
          {OTP_SAFETY_TIP}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});
