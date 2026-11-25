import { Case } from './types';
import { LADDERS } from './ladders';
import { NotificationsPort, defaultNotificationsPort } from '../../lib/notificationsPort';
import { PreferencesStore, defaultPreferencesStore } from '../settings/preferences';
import { logger } from '../../lib/logger';
import { parseIsoDate } from '../../lib/dates';
import { en } from '../../copy/en';
import { PlannedReminder, ScheduleResult, planReminders } from './reminder-planner';

export { PlannedReminder, ScheduleResult, planReminders };

export interface Reminders {
  schedule(caseItem: Case, now?: Date): Promise<ScheduleResult>;
  scheduleFollowUp(
    id: string,
    title: string,
    body: string,
    fireAt: Date
  ): Promise<{ scheduled: boolean; reason?: string }>;
  cancel(caseId: string): Promise<void>;
  cancelAll(): Promise<void>;
}

export class RemindersService implements Reminders {
  private port: NotificationsPort;
  private preferencesStore: PreferencesStore;

  constructor(
    port: NotificationsPort = defaultNotificationsPort,
    preferencesStore: PreferencesStore = defaultPreferencesStore
  ) {
    this.port = port;
    this.preferencesStore = preferencesStore;
  }

  async schedule(caseItem: Case, now: Date = new Date()): Promise<ScheduleResult> {
    const prefs = await this.preferencesStore.get();
    const perm = await this.port.getPermission();

    // If preference is off, do not schedule any reminder
    if (!prefs.remindersEnabled) {
      return {
        scheduled: 0,
        skipped: 0,
        failed: 0,
        permission: perm,
      };
    }

    // If permission is denied or undetermined, return status without scheduling
    if (perm !== 'granted') {
      return {
        scheduled: 0,
        skipped: 0,
        failed: 0,
        permission: perm,
      };
    }

    await this.cancel(caseItem.id);

    if (caseItem.resolvedAt) {
      return {
        scheduled: 0,
        skipped: 0,
        failed: 0,
        permission: perm,
      };
    }

    const ladder = LADDERS[caseItem.issueType];
    if (!ladder) {
      return {
        scheduled: 0,
        skipped: 0,
        failed: 0,
        permission: perm,
      };
    }

    await this.port.ensureChannel('dastak_reminders', 'Case Escalation Reminders');

    let scheduled = 0;
    let skipped = 0;
    let failed = 0;

    const created = parseIsoDate(caseItem.createdAt);
    const company = caseItem.company?.trim() || 'the company';

    for (const step of ladder.steps) {
      const fireAt = new Date(
        created.getFullYear(),
        created.getMonth(),
        created.getDate() + step.dayOffset,
        9,
        0,
        0,
        0
      );

      // Skip any reminder whose fireAt is not in the future
      if (fireAt.getTime() <= now.getTime()) {
        skipped++;
        continue;
      }

      const identifier = `dastak_${caseItem.id}_${step.id}`;
      const title = 'Case update reminder';
      const body = en.reminders.bodyMovesToday(company, step.who);

      try {
        await this.port.scheduleNotification({
          identifier,
          content: {
            title,
            body,
            data: { caseId: caseItem.id, stepId: step.id },
          },
          trigger: {
            type: 'date',
            date: fireAt,
            channelId: 'dastak_reminders',
          },
        });
        scheduled++;
      } catch (err) {
        logger.error(`Failed to schedule reminder ${identifier}`, err);
        failed++;
      }
    }

    return {
      scheduled,
      skipped,
      failed,
      permission: perm,
    };
  }

  async scheduleFollowUp(
    id: string,
    title: string,
    body: string,
    fireAt: Date
  ): Promise<{ scheduled: boolean; reason?: string }> {
    const prefs = await this.preferencesStore.get();
    if (!prefs.remindersEnabled) {
      return { scheduled: false, reason: 'Reminders are disabled in Settings' };
    }
    const perm = await this.port.getPermission();
    if (perm !== 'granted') {
      return { scheduled: false, reason: 'Notification permission is not granted' };
    }

    await this.port.ensureChannel('dastak_reminders', 'Case Escalation Reminders');
    const identifier = `dastak_followup_${id}`;
    try {
      await this.port.scheduleNotification({
        identifier,
        content: {
          title,
          body,
          data: { followUpId: id },
        },
        trigger: {
          type: 'date',
          date: fireAt,
          channelId: 'dastak_reminders',
        },
      });
      return { scheduled: true };
    } catch (err) {
      logger.error(`Failed to schedule follow-up reminder ${identifier}`, err);
      return { scheduled: false, reason: 'Scheduling failed' };
    }
  }

  async cancel(caseId: string): Promise<void> {
    try {
      const scheduled = await this.port.getAllScheduled();
      const prefix = `dastak_${caseId}_`;
      for (const item of scheduled) {
        if (item.identifier && item.identifier.startsWith(prefix)) {
          await this.port.cancelScheduledNotification(item.identifier);
        }
      }
    } catch (err) {
      logger.warn(`Failed to cancel reminders for case ${caseId}`, err);
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await this.port.cancelAllScheduled();
    } catch (err) {
      logger.warn('Failed to cancel all reminders', err);
    }
  }
}

export const defaultReminders: Reminders = new RemindersService();
