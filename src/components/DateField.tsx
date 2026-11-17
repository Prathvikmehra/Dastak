import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeContext';
import { useCopy } from '../copy/context';
import { LocalDate, today, addDays, isValidParts } from '../lib/dates';

export interface DateFieldProps {
  label: string;
  value: LocalDate | '';
  onChange: (date: LocalDate) => void;
  maxDate?: LocalDate;
  helper?: string;
  legacyValue?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  maxDate = today(),
  helper,
  legacyValue,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const c = copy.dateField;

  const todayStr = today();
  const yesterdayStr = addDays(todayStr, -1);
  const weekAgoStr = addDays(todayStr, -7);

  const getMode = (val: string): 'today' | 'yesterday' | 'week' | 'custom' => {
    if (val === todayStr) return 'today';
    if (val === yesterdayStr) return 'yesterday';
    if (val === weekAgoStr) return 'week';
    return 'custom';
  };

  const [activeChip, setActiveChip] = useState<'today' | 'yesterday' | 'week' | 'custom'>(
    getMode(value)
  );

  const parts = value.split('-');
  const [day, setDay] = useState(parts.length === 3 ? parts[2] : '');
  const [month, setMonth] = useState(parts.length === 3 ? parts[1] : '');
  const [year, setYear] = useState(parts.length === 3 ? parts[0] : '');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setActiveChip(getMode(value));
    const p = value.split('-');
    setDay(p.length === 3 ? p[2] : '');
    setMonth(p.length === 3 ? p[1] : '');
    setYear(p.length === 3 ? p[0] : '');
  }

  const handleChip = (chip: 'today' | 'yesterday' | 'week' | 'custom') => {
    setActiveChip(chip);
    setInlineError(null);
    if (chip === 'today') onChange(todayStr);
    else if (chip === 'yesterday') onChange(yesterdayStr);
    else if (chip === 'week') onChange(weekAgoStr);
  };

  const handlePart = (dStr: string, mStr: string, yStr: string) => {
    setDay(dStr);
    setMonth(mStr);
    setYear(yStr);

    if (!dStr || !mStr || !yStr) {
      setInlineError(null);
      return;
    }

    const dNum = parseInt(dStr, 10);
    const mNum = parseInt(mStr, 10);
    const yNum = parseInt(yStr, 10);

    if (!isValidParts(dNum, mNum, yNum)) {
      setInlineError(c.invalidError);
      return;
    }

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const iso = `${yNum}-${pad(mNum)}-${pad(dNum)}`;

    if (maxDate && iso > maxDate) {
      setInlineError(c.invalidError);
      return;
    }

    setInlineError(null);
    onChange(iso);
  };

  const chips = [
    { id: 'today' as const, label: c.today },
    { id: 'yesterday' as const, label: c.yesterday },
    { id: 'week' as const, label: c.weekAgo },
    { id: 'custom' as const, label: c.pickDate },
  ];

  return (
    <View style={styles.container}>
      <Text size="caption" color="ink" style={styles.label}>
        {label}
      </Text>

      {legacyValue ? (
        <Card style={[styles.legacyCard, { backgroundColor: colors.surfaceAlt }]}>
          <Text size="caption" color="muted">
            {c.legacySaved} {legacyValue}
          </Text>
        </Card>
      ) : null}

      <View style={styles.chipRow}>
        {chips.map((item) => {
          const selected = activeChip === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => handleChip(item.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                  borderRadius: radius.button,
                },
              ]}
            >
              <Text size="caption" color={selected ? 'surface' : 'ink'} style={styles.chipText}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeChip === 'custom' && (
        <View style={styles.inputsRow}>
          <TextInput
            style={[
              styles.input,
              styles.partInput,
              {
                color: colors.ink,
                backgroundColor: colors.surface,
                borderColor: inlineError ? colors.danger : colors.border,
                borderRadius: radius.button,
              },
            ]}
            placeholder={c.dayPlaceholder}
            placeholderTextColor={colors.muted}
            value={day}
            maxLength={2}
            keyboardType="number-pad"
            onChangeText={(txt) => handlePart(txt, month, year)}
          />
          <Text size="body" color="muted" style={styles.slash}>
            {'/'}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.partInput,
              {
                color: colors.ink,
                backgroundColor: colors.surface,
                borderColor: inlineError ? colors.danger : colors.border,
                borderRadius: radius.button,
              },
            ]}
            placeholder={c.monthPlaceholder}
            placeholderTextColor={colors.muted}
            value={month}
            maxLength={2}
            keyboardType="number-pad"
            onChangeText={(txt) => handlePart(day, txt, year)}
          />
          <Text size="body" color="muted" style={styles.slash}>
            {'/'}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.yearInput,
              {
                color: colors.ink,
                backgroundColor: colors.surface,
                borderColor: inlineError ? colors.danger : colors.border,
                borderRadius: radius.button,
              },
            ]}
            placeholder={c.yearPlaceholder}
            placeholderTextColor={colors.muted}
            value={year}
            maxLength={4}
            keyboardType="number-pad"
            onChangeText={(txt) => handlePart(day, month, txt)}
          />
        </View>
      )}

      {inlineError ? (
        <Text size="caption" color="danger" style={styles.errorText}>
          {inlineError}
        </Text>
      ) : helper ? (
        <Text size="caption" color="muted" style={styles.helperText}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6, fontWeight: '500' },
  legacyCard: { padding: 10, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  chipText: { fontWeight: '500' },
  inputsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  partInput: { width: 60 },
  yearInput: { width: 84 },
  input: { height: 48, borderWidth: 1, paddingHorizontal: 12, fontSize: 16, textAlign: 'center' },
  slash: { fontWeight: 'bold' },
  errorText: { marginTop: 4 },
  helperText: { marginTop: 4 },
});
