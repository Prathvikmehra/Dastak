import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Button } from '../src/components';
import { useTheme } from '../src/theme/ThemeContext';

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { id: 'te', label: 'Telugu', native: 'తెలుగు' },
  { id: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { colors, mode, setMode, radius } = useTheme();
  const [selectedLang, setSelectedLang] = useState('en');

  return (
    <Screen scrollable>
      {/* Language Selector */}
      <Card style={styles.sectionCard}>
        <Text size="subtitle" color="ink" style={styles.sectionHeading}>
          App language
        </Text>
        <Text size="body" color="muted" style={styles.sectionSubtitle}>
          Choose the language you prefer for complaint letters and guidance.
        </Text>

        <View style={styles.languageGrid}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <Pressable
                key={lang.id}
                onPress={() => setSelectedLang(lang.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${lang.label} - ${lang.native}`}
                style={[
                  styles.languagePill,
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
                  {lang.native} ({lang.label})
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Appearance / Theme */}
      <Card style={styles.sectionCard}>
        <Text size="subtitle" color="ink" style={styles.sectionHeading}>
          Display mode
        </Text>
        <Text size="body" color="muted" style={styles.sectionSubtitle}>
          Light mode is recommended for reading outdoors and in direct sunlight.
        </Text>

        <View style={styles.themeRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('light')}
            style={[
              styles.themeButton,
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
              Light
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('dark')}
            style={[
              styles.themeButton,
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
              Dark
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Privacy Guarantee */}
      <Card style={styles.sectionCard}>
        <View style={styles.privacyHeader}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text size="subtitle" color="ink" style={styles.privacyTitle}>
            Privacy guarantee
          </Text>
        </View>
        <Text size="body" color="ink" style={styles.privacyDescription}>
          No data leaves your device unless you choose to share a complaint letter. Your complaint
          drafts, case numbers, and name stay safely on your phone.
        </Text>
      </Card>

      {/* Help & FAQs */}
      <Card style={styles.sectionCard}>
        <Text size="subtitle" color="ink" style={styles.sectionHeading}>
          Frequently asked questions
        </Text>

        <View style={styles.faqItem}>
          <Text size="body" color="ink" style={styles.faqQuestion}>
            How much does Dastak charge?
          </Text>
          <Text size="body" color="muted">
            Dastak is completely free. We do not ask for card details or fees.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text size="body" color="ink" style={styles.faqQuestion}>
            Can bank officials see my drafts?
          </Text>
          <Text size="body" color="muted">
            Only when you share or send the generated letter to your bank branch or nodal desk.
          </Text>
        </View>
      </Card>

      {/* Close button that never traps the user */}
      <View style={styles.closeContainer}>
        {/* The single primary action on this screen */}
        <Button label="Back to app" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeading: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 14,
  },
  languageGrid: {
    gap: 8,
  },
  languagePill: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  privacyTitle: {
    fontWeight: '600',
  },
  privacyDescription: {
    lineHeight: 22,
  },
  faqItem: {
    marginBottom: 14,
  },
  faqQuestion: {
    fontWeight: '600',
    marginBottom: 2,
  },
  closeContainer: {
    marginBottom: 32,
  },
});
