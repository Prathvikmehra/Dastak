import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { IssueType } from '../types';
import { useCopy } from '../../../copy/context';

export * from './FraudTimingSelector';

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
  highlighted?: IssueType[];
}

export const IssueSelector: React.FC<IssueSelectorProps> = ({
  selected,
  onSelect,
  error,
  highlighted = [],
}) => {
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
          const isHighlighted = highlighted.includes(opt.id);
          const borderColor = isSelected
            ? colors.primary
            : isHighlighted
              ? colors.primary
              : colors.border;
          const borderWidth = isSelected ? 2 : isHighlighted ? 2 : 1;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${opt.label}, ${opt.subtitle}`}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? colors.surfaceAlt
                    : isHighlighted
                      ? colors.surfaceAlt
                      : colors.surface,
                  borderColor,
                  borderWidth,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        isSelected || isHighlighted ? colors.surface : colors.surfaceAlt,
                      borderRadius: radius.button,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.iconName}
                    size={22}
                    color={isSelected || isHighlighted ? colors.primary : colors.muted}
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
});
