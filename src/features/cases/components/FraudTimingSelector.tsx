import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';

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
