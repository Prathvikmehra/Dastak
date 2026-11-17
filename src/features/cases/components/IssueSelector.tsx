import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { IssueType } from '../types';
import { useCopy } from '../../../copy/context';

interface IssueOption {
  id: IssueType;
  label: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export interface IssueSelectorProps {
  selected: IssueType | null;
  onSelect: (type: IssueType) => void;
  error?: string | null;
}

export const IssueSelector: React.FC<IssueSelectorProps> = ({ selected, onSelect, error }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  const issueOptions: IssueOption[] = [
    {
      id: 'refund',
      label: copy.fixHome.doors.refund.title,
      subtitle: copy.fixHome.doors.refund.subtitle,
      iconName: 'cart-outline',
    },
    {
      id: 'fraud',
      label: copy.fixHome.doors.fraud.title,
      subtitle: copy.fixHome.doors.fraud.subtitle,
      iconName: 'alert-circle-outline',
    },
    {
      id: 'bank',
      label: copy.fixHome.doors.bank.title,
      subtitle: copy.fixHome.doors.bank.subtitle,
      iconName: 'business-outline',
    },
    {
      id: 'insurance',
      label: copy.fixHome.doors.insurance.title,
      subtitle: copy.fixHome.doors.insurance.subtitle,
      iconName: 'shield-outline',
    },
  ];

  return (
    <View style={styles.section}>
      <Text size="subtitle" color="ink" style={styles.title}>
        {copy.newCase.issueTypeLabel}
      </Text>

      <View style={styles.grid}>
        {issueOptions.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isSelected ? colors.surface : colors.surfaceAlt,
                      borderRadius: radius.button,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.iconName}
                    size={22}
                    color={isSelected ? colors.primary : colors.muted}
                  />
                </View>
                <View style={styles.textBox}>
                  <Text size="subtitle" color="ink">
                    {opt.label}
                  </Text>
                  <Text size="caption" color="muted" numberOfLines={2}>
                    {opt.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? colors.primary : colors.muted,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color={colors.surface} />
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text size="caption" color="danger" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export type FraudWhenOption = 'hour' | 'today' | 'yesterday' | 'earlier';

export interface FraudTimingSelectorProps {
  selected: FraudWhenOption;
  onSelect: (val: FraudWhenOption) => void;
}

export const FraudTimingSelector: React.FC<FraudTimingSelectorProps> = ({ selected, onSelect }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  const timingOptions: { id: FraudWhenOption; label: string }[] = [
    { id: 'hour', label: copy.newCase.fraudTiming.hour },
    { id: 'today', label: copy.newCase.fraudTiming.today },
    { id: 'yesterday', label: copy.newCase.fraudTiming.yesterday },
    { id: 'earlier', label: copy.newCase.fraudTiming.earlier },
  ];

  return (
    <View style={styles.section}>
      <Text size="subtitle" color="ink" style={styles.title}>
        {copy.newCase.fraudTiming.label}
      </Text>
      <View style={styles.timingGrid}>
        {timingOptions.map((item) => {
          const isSelected = selected === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.timingCard,
                {
                  backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.card,
                },
              ]}
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? colors.primary : colors.muted}
              />
              <Text size="body" color={isSelected ? 'ink' : 'muted'} style={styles.timingLabel}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
  },
  grid: {
    gap: 10,
  },
  card: {
    minHeight: 64,
    padding: 14,
    borderWidth: 2,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBox: {
    flex: 1,
    marginRight: 8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontWeight: '600',
  },
  timingGrid: {
    gap: 8,
  },
  timingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  timingLabel: {
    flex: 1,
  },
});
