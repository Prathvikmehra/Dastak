import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Text, Card, Button } from '../src/components';
import { useTheme } from '../src/theme/ThemeContext';
import { useCases } from '../src/features/cases/store';
import { defaultReminders } from '../src/features/cases/reminders';
import { defaultPreferencesStore } from '../src/features/settings/preferences';
import { defaultNotificationsPort } from '../src/lib/notificationsPort';
import { logger } from '../src/lib/logger';
import { copy } from '../src/copy/en';

export const NOTIFICATION_ASKED_KEY = 'dastak_notifications_prompted';

export default function NotificationPromptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, radius } = useTheme();
  const { getCase } = useCases();

  const caseId = params.id;
  const caseItem = caseId ? getCase(caseId) : undefined;

  const handleEnable = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
      await defaultPreferencesStore.set({ remindersEnabled: true });
      const status = await defaultNotificationsPort.requestPermission();
      if (status === 'granted' && caseItem) {
        await defaultReminders.schedule(caseItem);
      }
    } catch (err) {
      logger.warn('Failed to enable notifications in prompt', err);
    }
    proceed();
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
      await defaultPreferencesStore.set({ remindersEnabled: false });
    } catch (err) {
      logger.warn('Failed to record notification skip', err);
    }
    proceed();
  };

  const proceed = () => {
    if (caseId) {
      router.replace({
        pathname: '/fix/case-detail',
        params: { id: caseId },
      });
    } else {
      router.back();
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.card,
            },
          ]}
        >
          <Ionicons name="notifications-outline" size={40} color={colors.primary} />
        </View>

        <Text size="title" color="ink" style={styles.title}>
          {copy.notificationPrompt.title}
        </Text>

        <Text size="body" color="muted" style={styles.subtitle}>
          {copy.notificationPrompt.subtitle}
        </Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text size="body" color="ink" style={styles.infoText}>
              {copy.notificationPrompt.explanation}
            </Text>
          </View>
        </Card>

        <Button
          label={copy.notificationPrompt.enableButton}
          onPress={handleEnable}
          style={styles.primaryButton}
        />

        <Button label={copy.notificationPrompt.skipButton} variant="quiet" onPress={handleSkip} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  infoCard: {
    width: '100%',
    marginBottom: 28,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    lineHeight: 22,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
  },
});
