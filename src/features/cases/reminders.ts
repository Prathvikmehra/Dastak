import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Case } from './types';
import { LADDERS } from './ladders';

export interface PlannedReminder {
  stepId: string;
  fireAt: Date;
  title: string;
  body: string;
}

/**
 * Pure function returning planned reminders for future ladder steps.
 * Fires at 9:00 AM local time on that step's day.
 * Returns empty array for resolved cases or past dates.
 */
export function planReminders(caseItem: Case, now: Date): PlannedReminder[] {
  if (caseItem.resolvedAt) {
    return [];
  }

  const ladder = LADDERS[caseItem.issueType];
  if (!ladder) {
    return [];
  }

  const created = new Date(caseItem.createdAt);
  const company = caseItem.company?.trim() || 'the company';
  const results: PlannedReminder[] = [];

  for (const step of ladder.steps) {
    // 9:00 AM local time on created's calendar day + dayOffset
    const fireAt = new Date(
      created.getFullYear(),
      created.getMonth(),
      created.getDate() + step.dayOffset,
      9,
      0,
      0,
      0
    );

    // Future dates only: fireAt must be strictly after now
    if (fireAt.getTime() <= now.getTime()) {
      continue;
    }

    const title = 'Case update reminder';
    const body = `Your case with ${company} moves to the ${step.who} today.`;

    results.push({
      stepId: step.id,
      fireAt,
      title,
      body,
    });
  }

  return results;
}

export interface Reminders {
  schedule(caseItem: Case, now?: Date): Promise<void>;
  cancel(caseId: string): Promise<void>;
}

export class FakeReminders implements Reminders {
  public scheduled: Map<string, PlannedReminder[]> = new Map();

  async schedule(caseItem: Case, now: Date = new Date()): Promise<void> {
    const planned = planReminders(caseItem, now);
    this.scheduled.set(caseItem.id, planned);
  }

  async cancel(caseId: string): Promise<void> {
    this.scheduled.delete(caseId);
  }
}

export class ExpoNotificationsReminders implements Reminders {
  private channelCreated = false;

  private async ensureChannel(): Promise<void> {
    if (this.channelCreated || Platform.OS !== 'android') {
      return;
    }
    try {
      await Notifications.setNotificationChannelAsync('dastak_reminders', {
        name: 'Case Escalation Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1E4D8F',
      });
      this.channelCreated = true;
    } catch {
      // Safe fallback
    }
  }

  async schedule(caseItem: Case, now: Date = new Date()): Promise<void> {
    await this.cancel(caseItem.id);
    if (caseItem.resolvedAt) {
      return;
    }

    const planned = planReminders(caseItem, now);
    if (planned.length === 0) {
      return;
    }

    await this.ensureChannel();

    for (const r of planned) {
      const identifier = `dastak_${caseItem.id}_${r.stepId}`;
      const triggerSeconds = Math.max(1, Math.round((r.fireAt.getTime() - Date.now()) / 1000));
      try {
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: r.title,
            body: r.body,
            data: { caseId: caseItem.id, stepId: r.stepId },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerSeconds,
            repeats: false,
          },
        });
      } catch {
        // Safe catch on unsupported platform / permission denied
      }
    }
  }

  async cancel(caseId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const prefix = `dastak_${caseId}_`;
      for (const item of scheduled) {
        if (item.identifier && item.identifier.startsWith(prefix)) {
          await Notifications.cancelScheduledNotificationAsync(item.identifier);
        }
      }
    } catch {
      // Safe catch
    }
  }
}

export const defaultReminders: Reminders = new ExpoNotificationsReminders();
