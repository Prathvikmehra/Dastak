import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Text, Card, Button } from '../src/components';
import { useTheme } from '../src/theme/ThemeContext';
import { useCases } from '../src/features/cases/store';
import { defaultReminders } from '../src/features/cases/reminders';

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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted' && caseItem) {
        await defaultReminders.schedule(caseItem);
      }
    } catch {
      // Safe fallback on environments without notification support
    }
    proceed();
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
    } catch {
      // Safe fallback
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
          Case reminders
        </Text>

        <Text size="body" color="muted" style={styles.subtitle}>
          We can remind you the day your case moves to the next step.
        </Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text size="body" color="ink" style={styles.infoText}>
              A quiet reminder at 9:00 AM on the day action is needed.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text size="body" color="ink" style={styles.infoText}>
              No spam or promotions. All data stays local to your phone.
            </Text>
          </View>
        </Card>

        <Button label="Enable reminders" onPress={handleEnable} style={styles.primaryButton} />

        <Button label="Not now" variant="quiet" onPress={handleSkip} />
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
