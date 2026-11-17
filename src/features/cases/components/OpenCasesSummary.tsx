import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';

export interface OpenCasesSummaryProps {
  count: number;
  urgentText?: string;
  onViewCases: () => void;
}

export const OpenCasesSummary: React.FC<OpenCasesSummaryProps> = ({
  count,
  urgentText,
  onViewCases,
}) => {
  const { colors } = useTheme();
  const copy = useCopy();

  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryHeaderRow}>
        <View style={styles.summaryBadge}>
          <Ionicons name="time" size={18} color={colors.primary} />
          <Text size="subtitle" color="ink" style={styles.summaryTitle}>
            {copy.fixHome.summaryTitle(count)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.fixHome.viewMyCases}
          onPress={onViewCases}
          style={styles.quietLink}
        >
          <Text size="body" color="primary" style={styles.linkText}>
            {copy.fixHome.viewMyCases}
          </Text>
        </Pressable>
      </View>

      {urgentText ? (
        <View style={styles.urgentRow}>
          <Ionicons name="arrow-forward-circle" size={16} color={colors.primary} />
          <Text size="body" color="muted" numberOfLines={1} style={styles.urgentText}>
            {urgentText}
          </Text>
        </View>
      ) : null}

      <Button
        label={copy.fixHome.viewMyCases}
        variant="quiet"
        onPress={onViewCases}
        style={styles.summaryButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontWeight: '600',
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  urgentText: {
    flex: 1,
  },
  summaryButton: {
    marginTop: 4,
  },
  quietLink: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  linkText: {
    fontWeight: '600',
  },
});
