import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Screen, Text, Card, Button } from '../src/components';
import { useTheme } from '../src/theme/ThemeContext';
import { useCases } from '../src/features/cases/store';
import { defaultReminders } from '../src/features/cases/reminders';

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
  const { hadCorruptedData, openCases } = useCases();
  const [selectedLang, setSelectedLang] = useState('en');
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then((perm) => {
        setRemindersEnabled(perm.status === 'granted');
      })
      .catch(() => {
        setRemindersEnabled(false);
      });
  }, []);

  const handleToggleReminders = async (val: boolean) => {
    if (val) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === 'granted';
        setRemindersEnabled(granted);
        if (granted) {
          for (const c of openCases) {
            await defaultReminders.schedule(c);
          }
        }
      } catch {
        setRemindersEnabled(false);
      }
    } else {
      setRemindersEnabled(false);
      for (const c of openCases) {
        await defaultReminders.cancel(c.id);
      }
    }
  };

  return (
    <Screen scrollable>
      {/* Calm notice if corrupted data was recovered and backed up */}
      {hadCorruptedData ? (
        <Card
          style={[
            styles.sectionCard,
            { borderColor: colors.danger, backgroundColor: colors.dangerSurface },
          ]}
        >
          <Text size="body" color="danger">
            We could not read your saved cases. A backup was kept.
          </Text>
        </Card>
      ) : null}

      {/* Escalation Reminders Toggle */}
      <Card style={styles.sectionCard}>
        <View style={styles.remindersHeaderRow}>
          <View style={styles.remindersTextContainer}>
            <Text size="subtitle" color="ink" style={styles.sectionHeading}>
              Escalation reminders
            </Text>
            <Text size="body" color="muted">
              Remind you at 9:00 AM on the day your case moves to the next step.
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
            accessibilityLabel="Toggle escalation reminders"
          />
        </View>
      </Card>

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

      {/* Close button that never traps the user */}
      <View style={styles.closeContainer}>
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
  remindersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  remindersTextContainer: {
    flex: 1,
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
  closeContainer: {
    marginBottom: 32,
  },
});
