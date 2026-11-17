import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { defaultPreferencesStore } from '../preferences';
import { logger } from '../../../lib/logger';
import { copy } from '../../../copy/en';

const LANGUAGES = [
  { id: 'en', native: 'English' },
  { id: 'hi', native: 'हिन्दी' },
  { id: 'gu', native: 'ગુજરાતી' },
];

export const LanguageSection: React.FC = () => {
  const { colors, radius } = useTheme();
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    let isMounted = true;
    defaultPreferencesStore
      .get()
      .then((prefs) => {
        if (isMounted) {
          setSelectedLang(prefs.language || 'en');
        }
      })
      .catch((err) => {
        logger.warn('Failed loading language preference', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = async (langId: string) => {
    setSelectedLang(langId);
    try {
      await defaultPreferencesStore.set({ language: langId });
    } catch (err) {
      logger.error('Failed saving language preference', err);
    }
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
          const isSelected = selectedLang === lang.id;
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
