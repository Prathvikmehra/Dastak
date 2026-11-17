import { Case, LadderStep } from './types';
import { formatRupees, parseAmount } from '../../lib/formatters';
import { toDisplay } from '../../lib/dates';
import { CallScriptCopy } from '../../copy/types/domain';
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
export function buildDraft(caseItem: Case, step: LadderStep): string {
  const parts: string[] = [];

  parts.push(`To: ${step.who}`);

  const company = caseItem.company?.trim() || '';

  if (caseItem.issueType === 'refund') {
    parts.push(
      company
        ? `Subject: Formal grievance regarding order with ${company}`
        : 'Subject: Formal grievance regarding order'
    );
  } else if (caseItem.issueType === 'fraud') {
    parts.push(
      company
        ? `Subject: Formal complaint regarding online payment fraud involving ${company}`
        : 'Subject: Formal complaint regarding online payment fraud'
    );
  } else if (caseItem.issueType === 'bank') {
    parts.push(
      company
        ? `Subject: Formal grievance regarding account or card with ${company}`
        : 'Subject: Formal grievance regarding bank account or card'
    );
  } else {
    parts.push(
      company
        ? `Subject: Formal grievance regarding insurance claim with ${company}`
        : 'Subject: Formal grievance regarding insurance claim'
    );
  }

  parts.push('');
  parts.push('Respected Sir/Madam,');
  parts.push('');

  const sentences: string[] = [];
  const parsedAmt = parseAmount(caseItem.amount);
  const amountStr = parsedAmt !== null ? formatRupees(parsedAmt) : '';
  const incidentDate = caseItem.incidentDate
    ? toDisplay(caseItem.incidentDate)
    : caseItem.legacyIncidentDate?.trim() || '';

  if (caseItem.issueType === 'refund') {
    if (company && amountStr) {
      sentences.push(
        `I am submitting this grievance regarding my order with ${company} for an amount of ${amountStr}.`
      );
    } else if (company) {
      sentences.push(`I am submitting this grievance regarding my order with ${company}.`);
    } else if (amountStr) {
      sentences.push(
        `I am submitting this grievance regarding an order for an amount of ${amountStr}.`
      );
    } else {
      sentences.push('I am submitting this formal grievance regarding my order.');
    }
  } else if (caseItem.issueType === 'fraud') {
    if (company && amountStr) {
      sentences.push(
        `I am reporting an online payment fraud involving ${company} for an amount of ${amountStr}.`
      );
    } else if (company) {
      sentences.push(`I am reporting an online payment fraud involving ${company}.`);
    } else if (amountStr) {
      sentences.push(`I am reporting an online payment fraud for an amount of ${amountStr}.`);
    } else {
      sentences.push('I am reporting an online payment fraud.');
    }
  } else if (caseItem.issueType === 'bank') {
    if (company && amountStr) {
      sentences.push(
        `I am submitting this grievance regarding my account or card with ${company} involving an amount of ${amountStr}.`
      );
    } else if (company) {
      sentences.push(
        `I am submitting this grievance regarding my account or card with ${company}.`
      );
    } else if (amountStr) {
      sentences.push(
        `I am submitting this grievance regarding an account or card issue involving an amount of ${amountStr}.`
      );
    } else {
      sentences.push('I am submitting this formal grievance regarding my account or card.');
    }
  } else {
    // insurance - never use the word transaction
    if (company && amountStr) {
      sentences.push(
        `I am submitting this grievance regarding my claim or policy with ${company} for an amount of ${amountStr}.`
      );
    } else if (company) {
      sentences.push(
        `I am submitting this grievance regarding my claim or policy with ${company}.`
      );
    } else if (amountStr) {
      sentences.push(
        `I am submitting this grievance regarding my claim or policy for an amount of ${amountStr}.`
      );
    } else {
      sentences.push('I am submitting this formal grievance regarding my claim or policy.');
    }
  }

  if (incidentDate) {
    sentences.push(`The incident occurred on ${incidentDate}.`);
  }

  parts.push(sentences.join(' '));

  if (caseItem.issueType === 'fraud' && company) {
    parts.push('');
    parts.push(`Reported counterparty or recipient: ${company}`);
  }

  const reference = caseItem.reference?.trim() || '';
  if (reference) {
    parts.push('');
    if (caseItem.issueType === 'insurance') {
      parts.push(`Policy or claim reference: ${reference}`);
    } else if (caseItem.issueType === 'bank') {
      parts.push(`Account or dispute reference: ${reference}`);
    } else if (caseItem.issueType === 'refund') {
      parts.push(`Order reference ID: ${reference}`);
    } else {
      parts.push(`Transaction ID: ${reference}`);
    }
  }

  const note = caseItem.note?.trim() || '';
  if (note) {
    parts.push('');
    parts.push('Details:');
    parts.push(note);
  }

  parts.push('');
  parts.push('Requested action:');
  parts.push(step.request);

  parts.push('');
  const userName = caseItem.userName?.trim() || '';
  if (userName) {
    parts.push('Yours sincerely,');
    parts.push(userName);
  } else {
    parts.push('Thank you.');
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
