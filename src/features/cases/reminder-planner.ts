import { Case } from './types';
import { LADDERS } from './ladders';
import { PermissionStatus } from '../../lib/notificationsPort';
import { parseIsoDate } from '../../lib/dates';
import { en } from '../../copy/en';

export interface PlannedReminder {
  stepId: string;
  fireAt: Date;
  title: string;
  body: string;
}

export interface ScheduleResult {
  scheduled: number;
  skipped: number;
  failed: number;
  permission: PermissionStatus;
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

  const created = parseIsoDate(caseItem.createdAt);
  const company = caseItem.company?.trim() || 'the company';
  const results: PlannedReminder[] = [];

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

    if (fireAt.getTime() <= now.getTime()) {
      continue;
    }

    const title = 'Case update reminder';
    const body = en.reminders.bodyMovesToday(company, step.who);

    results.push({
      stepId: step.id,
      fireAt,
      title,
      body,
    });
  }

  return results;
}
