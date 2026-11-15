import { Case, LadderStep } from './types';
import { LADDERS } from './ladders';

/**
 * Calculates the number of calendar days elapsed between case creation and `now`
 * using calendar days in local time.
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
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
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
 * Returns whether a case is overdue for escalation.
 * A case is overdue if it has passed its initial company resolution deadline (dayOffset > 0)
 * and has not yet been resolved.
 */
export function isOverdueForEscalation(caseItem: Case, now: Date): boolean {
  if (caseItem.resolvedAt) {
    return false;
  }
  const current = currentStep(caseItem, now);
  return current.dayOffset > 0;
}

/**
 * Generates a clean, plain-text complaint draft with sensible fallbacks when fields are empty.
 * Never outputs "undefined", "null", or empty brackets.
 */
export function buildDraft(caseItem: Case, step: LadderStep): string {
  const company =
    caseItem.company && caseItem.company.trim() ? caseItem.company.trim() : 'the concerned company';

  const rawAmount = caseItem.amount ? caseItem.amount.trim().replace(/^₹/, '') : '';
  const amountText = rawAmount ? `of ₹${rawAmount}` : 'in dispute';

  const refText =
    caseItem.reference && caseItem.reference.trim()
      ? caseItem.reference.trim()
      : 'Reference details to be provided';

  const incidentDate =
    caseItem.incidentDate && caseItem.incidentDate.trim()
      ? caseItem.incidentDate.trim()
      : 'recently';

  const userNote =
    caseItem.note && caseItem.note.trim()
      ? caseItem.note.trim()
      : 'I have not received the rightful refund or resolution despite multiple requests.';

  const lines: string[] = [
    `To: ${step.who}`,
    `Subject: Formal grievance regarding issue with ${company}`,
    '',
    'Respected Sir/Madam,',
    '',
    `I am submitting this grievance regarding an issue with ${company} involving an amount ${amountText}. The incident occurred on or around ${incidentDate}.`,
    '',
    `Reference ID / Account: ${refText}`,
    '',
    'Details of the problem:',
    userNote,
    '',
    'Requested action:',
    step.how,
    '',
    'I request your prompt intervention to resolve this matter.',
    '',
    'Yours sincerely,',
    'Aggrieved Consumer / Account Holder',
  ];

  return lines.join('\n');
}
