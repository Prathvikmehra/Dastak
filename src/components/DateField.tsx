import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput, LayoutChangeEvent } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeContext';
import { useCopy } from '../copy/context';
import { LocalDate, today, addDays, isValidParts } from '../lib/dates';
import { DateCustomInputs } from './DateCustomInputs';

export interface DateFieldProps {
  label: string;
  value: LocalDate | '';
  onChange: (date: LocalDate) => void;
  maxDate?: LocalDate;
  helper?: string;
  legacyValue?: string;
  onError?: (hasError: boolean) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  maxDate = today(),
  helper,
  legacyValue,
  onError,
  onLayout,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const c = copy.dateField;

  const dayInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const monthInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const yearInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

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
    onError?.(false);
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
      onError?.(false);
      return;
    }

    const dNum = parseInt(dStr, 10);
    const mNum = parseInt(mStr, 10);
    const yNum = parseInt(yStr, 10);
    if (!isValidParts(dNum, mNum, yNum)) {
      setInlineError(c.invalidError);
      onError?.(true);
      return;
    }

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const iso = `${yNum}-${pad(mNum)}-${pad(dNum)}`;
    if (maxDate && iso > maxDate) {
      setInlineError(c.invalidError);
      onError?.(true);
      return;
    }
    setInlineError(null);
    onError?.(false);
    onChange(iso);
  };

  const handleDayChange = (txt: string) => {
    const clean = txt.replace(/[^0-9]/g, '');
    handlePart(clean, month, year);
    if (clean.length === 2) {
      monthInputRef.current?.focus();
    }
  };

  const handleMonthChange = (txt: string) => {
    const clean = txt.replace(/[^0-9]/g, '');
    handlePart(day, clean, year);
    if (clean.length === 2) {
      yearInputRef.current?.focus();
    }
  };

  const handleYearChange = (txt: string) => {
    const clean = txt.replace(/[^0-9]/g, '');
    handlePart(day, month, clean);
  };

  const chips = [
    { id: 'today' as const, label: c.today },
    { id: 'yesterday' as const, label: c.yesterday },
    { id: 'week' as const, label: c.weekAgo },
    { id: 'custom' as const, label: c.pickDate },
  ];

  return (
    <View style={styles.container} onLayout={onLayout}>
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
        <DateCustomInputs
          day={day}
          month={month}
          year={year}
          onDayChange={handleDayChange}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          dayInputRef={dayInputRef}
          monthInputRef={monthInputRef}
          yearInputRef={yearInputRef}
          inlineError={inlineError}
        />
      )}

      {helper && !inlineError ? (
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
  helperText: { marginTop: 4 },
});
