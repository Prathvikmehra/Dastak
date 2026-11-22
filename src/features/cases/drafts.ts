import { Case, LadderStep } from './types';
import { formatRupees, parseAmount } from '../../lib/formatters';
import { toDisplay } from '../../lib/dates';
import { CallScriptCopy, DraftsCopy } from '../../copy/types/domain';
import { en } from '../../copy/en';

/**
 * Generates an honest, factual plain-text complaint draft with per-issue wording.
 * - Formats amounts with formatRupees (₹2,500, never ₹2500).
 * - Refund: "my order with {company}".
 * - Fraud: "an online payment fraud", receiver details if given.
 * - Bank: "my account or card with {company}".
 * - Insurance: "my claim or policy with {company}", never "transaction".
 * - If note is empty, omits the "Details" section entirely.
 * - If user has no name on file, ends with "Thank you." and no placeholder signature.
 * - Never prints "undefined", "null", empty brackets, or "Aggrieved Consumer".
 */
export function buildDraft(
  caseItem: Case,
  step: LadderStep,
  draftsCopy: DraftsCopy = en.drafts
): string {
  const parts: string[] = [];

  parts.push(draftsCopy.to(step.who));

  const company = caseItem.company?.trim() || '';

  if (caseItem.issueType === 'refund') {
    parts.push(draftsCopy.subjectRefund(company || undefined));
  } else if (caseItem.issueType === 'fraud') {
    parts.push(draftsCopy.subjectFraud(company || undefined));
  } else if (caseItem.issueType === 'bank') {
    parts.push(draftsCopy.subjectBank(company || undefined));
  } else {
    parts.push(draftsCopy.subjectInsurance(company || undefined));
  }

  parts.push('');
  parts.push(draftsCopy.salutation);
  parts.push('');

  const sentences: string[] = [];
  const parsedAmt = parseAmount(caseItem.amount);
  const amountStr = parsedAmt !== null ? formatRupees(parsedAmt) : '';
  const incidentDate = caseItem.incidentDate
    ? toDisplay(caseItem.incidentDate)
    : caseItem.legacyIncidentDate?.trim() || '';

  if (caseItem.issueType === 'refund') {
    sentences.push(draftsCopy.introRefund(company || undefined, amountStr || undefined));
  } else if (caseItem.issueType === 'fraud') {
    sentences.push(draftsCopy.introFraud(company || undefined, amountStr || undefined));
  } else if (caseItem.issueType === 'bank') {
    sentences.push(draftsCopy.introBank(company || undefined, amountStr || undefined));
  } else {
    sentences.push(draftsCopy.introInsurance(company || undefined, amountStr || undefined));
  }

  if (incidentDate) {
    sentences.push(draftsCopy.incidentDate(incidentDate));
  }

  parts.push(sentences.join(' '));

  if (caseItem.issueType === 'fraud' && company) {
    parts.push('');
    parts.push(draftsCopy.counterparty(company));
  }

  const reference = caseItem.reference?.trim() || '';
  if (reference) {
    parts.push('');
    if (caseItem.issueType === 'insurance') {
      parts.push(draftsCopy.referencePolicy(reference));
    } else if (caseItem.issueType === 'bank') {
      parts.push(draftsCopy.referenceAccount(reference));
    } else if (caseItem.issueType === 'refund') {
      parts.push(draftsCopy.referenceOrder(reference));
    } else {
      parts.push(draftsCopy.referenceTransaction(reference));
    }
  }

  const note = caseItem.note?.trim() || '';
  if (note) {
    parts.push('');
    parts.push(draftsCopy.detailsHeading);
    parts.push(note);
  }

  parts.push('');
  parts.push(draftsCopy.requestedActionHeading);
  parts.push(step.request);

  parts.push('');
  const userName = caseItem.userName?.trim() || '';
  if (userName) {
    parts.push(draftsCopy.sincerely);
    parts.push(userName);
  } else {
    parts.push(draftsCopy.thankYou);
  }

  return parts.join('\n');
}

/**
 * Builds a short call script (4 to 6 plain lines) for steps that have a phone number.
 * Uses only facts supplied by the user.
 */
export function buildCallScript(
  caseItem: Case,
  step: LadderStep,
  callScriptCopy: CallScriptCopy = en.callScript
): string {
  const lines: string[] = [];

  lines.push(callScriptCopy.openers[caseItem.issueType]);

  const parsedAmt = parseAmount(caseItem.amount);
  if (parsedAmt !== null) {
    lines.push(callScriptCopy.amount(formatRupees(parsedAmt)));
  }

  const company = caseItem.company?.trim();
  if (company) {
    lines.push(callScriptCopy.companies[caseItem.issueType](company));
  }

  const ref = caseItem.reference?.trim();
  if (ref) {
    lines.push(callScriptCopy.reference(ref));
  }

  const date = caseItem.incidentDate
    ? toDisplay(caseItem.incidentDate)
    : caseItem.legacyIncidentDate?.trim() || '';
  if (date) {
    lines.push(callScriptCopy.incidentDate(date));
  }

  if (lines.length === 1) {
    lines.push(callScriptCopy.generalFallback1);
    lines.push(callScriptCopy.generalFallback2);
  }

  if (caseItem.issueType === 'fraud') {
    lines.push(callScriptCopy.closers.fraud);
  } else if (step.phone === '1915') {
    lines.push(callScriptCopy.closers.nch);
  } else {
    lines.push(callScriptCopy.closers.general);
  }

  return lines.join('\n');
}
