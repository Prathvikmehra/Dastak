import { Case, LadderStep } from './types';
import { LADDERS } from './ladders';

export { buildDraft, buildCallScript } from './drafts';

/**
 * Calculates the number of calendar days elapsed between case creation and `now`
 * using calendar days in local time. Uses Math.round to avoid off-by-one errors across
 * daylight saving or slight midnight clock drift.
 */
export function daysElapsed(caseItem: Case, now: Date): number {
  const created = new Date(caseItem.createdAt);
  const startLocalMidnight = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate()
  ).getTime();

  const nowLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = nowLocalMidnight - startLocalMidnight;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates the number of real hours elapsed between case creation and `now`
 * using exact timestamps.
 */
export function hoursSince(caseItem: Case, now: Date): number {
  const createdMs = new Date(caseItem.createdAt).getTime();
  const nowMs = now.getTime();
  return Math.max(0, (nowMs - createdMs) / (1000 * 60 * 60));
}

/**
 * Returns true only for unresolved fraud cases under 24 real hours old.
 */
export function isFraudUrgent(caseItem: Case, now: Date): boolean {
  if (caseItem.issueType !== 'fraud' || caseItem.resolvedAt) {
    return false;
  }
  const hours = hoursSince(caseItem, now);
  return hours >= 0 && hours < 24;
}

/**
 * Returns the current ladder step for a case at time `now`.
 */
export function currentStep(caseItem: Case, now: Date): LadderStep {
  const ladder = LADDERS[caseItem.issueType];
  const elapsed = daysElapsed(caseItem, now);

  let active = ladder.steps[0];
  for (const step of ladder.steps) {
    if (step.dayOffset <= elapsed) {
      active = step;
    } else {
      break;
    }
  }
  return active;
}

/**
 * Returns the next ladder step if one exists, or null if the case is at or past the final step.
 */
export function nextStep(caseItem: Case, now: Date): LadderStep | null {
  const ladder = LADDERS[caseItem.issueType];
  const elapsed = daysElapsed(caseItem, now);

  for (const step of ladder.steps) {
    if (step.dayOffset > elapsed) {
      return step;
    }
  }
  return null;
}

/**
 * Returns the number of days until the next ladder step, or null if there is no next step.
 */
export function daysUntilNext(caseItem: Case, now: Date): number | null {
  const next = nextStep(caseItem, now);
  if (!next) {
    return null;
  }
  const elapsed = daysElapsed(caseItem, now);
  return Math.max(0, next.dayOffset - elapsed);
}

/**
 * Returns evidence checklist progress: { done, total }.
 */
export function evidenceProgress(caseItem: Case): { done: number; total: number } {
  const ladder = LADDERS[caseItem.issueType];
  const total = ladder.evidenceChecklist.length;
  const done = ladder.evidenceChecklist.filter((item) =>
    Boolean(caseItem.evidence && caseItem.evidence[item])
  ).length;

  return { done, total };
}

/**
 * Returns whether a case has escalated past its initial filing stage.
 * For fraud, day 1 is the initial cybercrime portal filing step, so day 1 is NOT overdue.
 * Fraud escalates to RBI complaint portal after day 30.
 * For other issues (refund, bank, insurance), it is true when current step dayOffset > 0.
 * Returns false if the case has already been resolved.
 */
export function hasEscalatedPastFirstStep(caseItem: Case, now: Date): boolean {
  if (caseItem.resolvedAt) {
    return false;
  }
  const elapsed = daysElapsed(caseItem, now);
  if (caseItem.issueType === 'fraud') {
    return elapsed >= 30;
  }
  const current = currentStep(caseItem, now);
  return current.dayOffset > 0;
}

// Backward-compatible alias
export const isOverdueForEscalation = hasEscalatedPastFirstStep;
