import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';
import { useCopy } from '../copy/context';

export interface DateCustomInputsProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (text: string) => void;
  onMonthChange: (text: string) => void;
  onYearChange: (text: string) => void;
  dayInputRef: React.RefObject<React.ElementRef<typeof TextInput> | null>;
  monthInputRef: React.RefObject<React.ElementRef<typeof TextInput> | null>;
  yearInputRef: React.RefObject<React.ElementRef<typeof TextInput> | null>;
  inlineError: string | null;
}

export const DateCustomInputs: React.FC<DateCustomInputsProps> = ({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  dayInputRef,
  monthInputRef,
  yearInputRef,
  inlineError,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const c = copy.dateField;

  const boxInputStyle = [
    styles.input,
    {
      color: colors.ink,
      backgroundColor: colors.surface,
      borderColor: inlineError ? colors.danger : colors.border,
      borderRadius: radius.button,
    },
  ];

  return (
    <>
      <View style={styles.inputsRow}>
        <View style={styles.partBox}>
          <Text size="caption" color="muted" style={styles.boxLabel}>
            {c.dayLabel}
          </Text>
          <TextInput
            ref={dayInputRef}
            style={boxInputStyle}
            placeholder={c.dayPlaceholder}
            placeholderTextColor={colors.muted}
            value={day}
            maxLength={2}
            keyboardType="number-pad"
            onChangeText={onDayChange}
            accessibilityLabel={c.dayLabel}
          />
        </View>

        <View style={styles.partBox}>
          <Text size="caption" color="muted" style={styles.boxLabel}>
            {c.monthLabel}
          </Text>
          <TextInput
            ref={monthInputRef}
            style={boxInputStyle}
            placeholder={c.monthPlaceholder}
            placeholderTextColor={colors.muted}
            value={month}
            maxLength={2}
            keyboardType="number-pad"
            onChangeText={onMonthChange}
            accessibilityLabel={c.monthLabel}
          />
        </View>

        <View style={[styles.partBox, { flex: 1.5 }]}>
          <Text size="caption" color="muted" style={styles.boxLabel}>
            {c.yearLabel}
          </Text>
          <TextInput
            ref={yearInputRef}
            style={boxInputStyle}
            placeholder={c.yearPlaceholder}
            placeholderTextColor={colors.muted}
            value={year}
            maxLength={4}
            keyboardType="number-pad"
            onChangeText={onYearChange}
            accessibilityLabel={c.yearLabel}
          />
        </View>
      </View>

      {inlineError ? (
        <Text size="caption" color="danger" style={styles.errorText}>
          {inlineError}
        </Text>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  partBox: {
    flex: 1,
  },
  boxLabel: {
    marginBottom: 4,
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 6,
    fontWeight: '600',
  },
});
