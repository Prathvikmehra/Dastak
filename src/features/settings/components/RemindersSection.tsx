import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Pressable } from 'react-native';
import * as Linking from 'expo-linking';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCases } from '../../cases/store';
import { defaultReminders } from '../../cases/reminders';
import { defaultPreferencesStore } from '../preferences';
import { defaultNotificationsPort, PermissionStatus } from '../../../lib/notificationsPort';
import { logger } from '../../../lib/logger';

export const RemindersSection: React.FC = () => {
  const { colors } = useTheme();
  const { openCases } = useCases();
  const [prefEnabled, setPrefEnabled] = useState(false);
  const [osPermission, setOsPermission] = useState<PermissionStatus>('undetermined');
  const [hasSchedulingFailure, setHasSchedulingFailure] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([defaultPreferencesStore.get(), defaultNotificationsPort.getPermission()])
      .then(([prefs, perm]) => {
        if (isMounted) {
          setPrefEnabled(prefs.remindersEnabled);
          setOsPermission(perm);
        }
      })
      .catch((err) => {
        logger.warn('Failed to load initial reminder settings', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Switch shows ON only if preference is true AND OS permission is granted
  const switchValue = prefEnabled && osPermission === 'granted';

  const handleToggle = async (val: boolean) => {
    if (val) {
      try {
        const perm = await defaultNotificationsPort.requestPermission();
        setOsPermission(perm);
        if (perm === 'granted') {
          await defaultPreferencesStore.set({ remindersEnabled: true });
          setPrefEnabled(true);
          let failureOccurred = false;
          for (const c of openCases) {
            const res = await defaultReminders.schedule(c);
            if (res.failed > 0) {
              failureOccurred = true;
            }
          }
          setHasSchedulingFailure(failureOccurred);
        } else {
          // If OS permission denied, switch is off
          await defaultPreferencesStore.set({ remindersEnabled: false });
          setPrefEnabled(false);
        }
      } catch (err) {
        logger.error('Failed toggling reminders on', err);
        setPrefEnabled(false);
        setHasSchedulingFailure(true);
      }
    } else {
      // Switching OFF persists false and cancels all scheduled reminders
      try {
        await defaultPreferencesStore.set({ remindersEnabled: false });
        setPrefEnabled(false);
        setHasSchedulingFailure(false);
        await defaultReminders.cancelAll();
      } catch (err) {
        logger.error('Failed toggling reminders off', err);
      }
    }
  };

  const showRemindersOffNotice =
    osPermission === 'denied' ||
    hasSchedulingFailure ||
    (!prefEnabled && osPermission !== 'granted');

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.textContainer}>
          <Text size="subtitle" color="ink" style={styles.heading}>
            Escalation reminders
          </Text>
          <Text size="body" color="muted">
            Remind you at 9:00 AM on the day your case moves to the next step.
          </Text>
        </View>
        <Switch
          value={switchValue}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
          accessibilityLabel="Toggle escalation reminders"
        />
      </View>

      {/* Calm fallback line when reminders are off or permission denied */}
      {showRemindersOffNotice && (
        <View style={styles.noticeContainer}>
          <Text size="body" color="muted" style={styles.noticeText}>
            Reminders are off. You can still see your next step inside the app.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open phone settings"
            onPress={() => Linking.openSettings()}
            style={styles.settingsButton}
          >
            <Text size="body" color="primary" style={styles.settingsButtonText}>
              Open phone settings
            </Text>
          </Pressable>
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  noticeContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  noticeText: {
    lineHeight: 22,
    marginBottom: 8,
  },
  settingsButton: {
    minHeight: 48,
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontWeight: '600',
  },
});
