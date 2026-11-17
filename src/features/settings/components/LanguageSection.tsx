import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useLanguage } from '../../../copy/context';
import { AppLanguage } from '../../../copy/types';

const LANGUAGES: { id: AppLanguage; native: string }[] = [
  { id: 'en', native: 'English' },
  { id: 'hi', native: 'हिन्दी' },
  { id: 'gu', native: 'ગુજરાતી' },
];

export const LanguageSection: React.FC = () => {
  const { colors, radius } = useTheme();
  const { language, setLanguage, copy } = useLanguage();

  const handleSelect = (langId: AppLanguage) => {
    void setLanguage(langId);
  };

  return (
    <Card style={styles.card}>
      <Text size="subtitle" color="ink" style={styles.heading}>
        {copy.settings.languageTitle}
      </Text>
      <Text size="body" color="muted" style={styles.subtitle}>
        {copy.settings.languageSubtitle}
      </Text>

      <View style={styles.grid}>
        {LANGUAGES.map((lang) => {
          const isSelected = language === lang.id;
          return (
            <Pressable
              key={lang.id}
              onPress={() => handleSelect(lang.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={lang.native}
              style={[
                styles.pill,
                {
                  borderRadius: radius.button,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                },
              ]}
            >
              <Text
                size="body"
                color={isSelected ? 'primary' : 'ink'}
                style={{ fontWeight: isSelected ? '600' : '400' }}
              >
                {lang.native}
              </Text>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
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
  grid: {
    gap: 8,
  },
  pill: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
