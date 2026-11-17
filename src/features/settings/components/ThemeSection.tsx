import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';

export const ThemeSection: React.FC = () => {
  const { colors, mode, setMode, radius } = useTheme();
  const copy = useCopy();

  return (
    <Card style={styles.card}>
      <Text size="subtitle" color="ink" style={styles.heading}>
        {copy.settings.themeTitle}
      </Text>
      <Text size="body" color="muted" style={styles.subtitle}>
        {copy.settings.themeSubtitle}
      </Text>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMode('light')}
          style={[
            styles.button,
            {
              borderRadius: radius.button,
              borderColor: mode === 'light' ? colors.primary : colors.border,
              backgroundColor: mode === 'light' ? colors.surfaceAlt : colors.surface,
            },
          ]}
        >
          <Ionicons
            name="sunny-outline"
            size={20}
            color={mode === 'light' ? colors.primary : colors.ink}
          />
          <Text
            size="body"
            color={mode === 'light' ? 'primary' : 'ink'}
            style={{ fontWeight: mode === 'light' ? '600' : '400' }}
          >
            {copy.settings.themeLight}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setMode('dark')}
          style={[
            styles.button,
            {
              borderRadius: radius.button,
              borderColor: mode === 'dark' ? colors.primary : colors.border,
              backgroundColor: mode === 'dark' ? colors.surfaceAlt : colors.surface,
            },
          ]}
        >
          <Ionicons
            name="moon-outline"
            size={20}
            color={mode === 'dark' ? colors.primary : colors.ink}
          />
          <Text
            size="body"
            color={mode === 'dark' ? 'primary' : 'ink'}
            style={{ fontWeight: mode === 'dark' ? '600' : '400' }}
          >
            {copy.settings.themeDark}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  heading: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
