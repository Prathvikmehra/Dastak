import { DraftsCopy } from '../types/domain';

export const enDrafts: DraftsCopy = {
  to: (who: string) => `To: ${who}`,
  subjectRefund: (company?: string) =>
    company
      ? `Subject: Formal grievance regarding order with ${company}`
      : 'Subject: Formal grievance regarding order',
  subjectFraud: (company?: string) =>
    company
      ? `Subject: Formal complaint regarding online payment fraud involving ${company}`
      : 'Subject: Formal complaint regarding online payment fraud',
  subjectBank: (company?: string) =>
    company
      ? `Subject: Formal grievance regarding account or card with ${company}`
      : 'Subject: Formal grievance regarding bank account or card',
  subjectInsurance: (company?: string) =>
    company
      ? `Subject: Formal grievance regarding insurance claim with ${company}`
      : 'Subject: Formal grievance regarding insurance claim',
  salutation: 'Respected Sir/Madam,',
  introRefund: (company?: string, amount?: string) => {
    if (company && amount) {
      return `I am submitting this grievance regarding my order with ${company} for an amount of ${amount}.`;
    }
    if (company) {
      return `I am submitting this grievance regarding my order with ${company}.`;
    }
    if (amount) {
      return `I am submitting this grievance regarding an order for an amount of ${amount}.`;
    }
    return 'I am submitting this formal grievance regarding my order.';
  },
  introFraud: (company?: string, amount?: string) => {
    if (company && amount) {
      return `I am reporting an online payment fraud involving ${company} for an amount of ${amount}.`;
    }
    if (company) {
      return `I am reporting an online payment fraud involving ${company}.`;
    }
    if (amount) {
      return `I am reporting an online payment fraud for an amount of ${amount}.`;
    }
    return 'I am reporting an online payment fraud.';
  },
  introBank: (company?: string, amount?: string) => {
    if (company && amount) {
      return `I am submitting this grievance regarding my account or card with ${company} involving an amount of ${amount}.`;
    }
    if (company) {
      return `I am submitting this grievance regarding my account or card with ${company}.`;
    }
    if (amount) {
      return `I am submitting this grievance regarding an account or card issue involving an amount of ${amount}.`;
    }
    return 'I am submitting this formal grievance regarding my account or card.';
  },
  introInsurance: (company?: string, amount?: string) => {
    if (company && amount) {
      return `I am submitting this grievance regarding my claim or policy with ${company} for an amount of ${amount}.`;
    }
    if (company) {
      return `I am submitting this grievance regarding my claim or policy with ${company}.`;
    }
    if (amount) {
      return `I am submitting this grievance regarding my claim or policy for an amount of ${amount}.`;
    }
    return 'I am submitting this formal grievance regarding my claim or policy.';
  },
  incidentDate: (date: string) => `The incident occurred on ${date}.`,
  counterparty: (company: string) => `Reported counterparty or recipient: ${company}`,
  referencePolicy: (ref: string) => `Policy or claim reference: ${ref}`,
  referenceAccount: (ref: string) => `Account or dispute reference: ${ref}`,
  referenceOrder: (ref: string) => `Order reference ID: ${ref}`,
  referenceTransaction: (ref: string) => `Transaction ID: ${ref}`,
  detailsHeading: 'Details:',
  requestedActionHeading: 'Requested action:',
  thankYou: 'Thank you.',
  sincerely: 'Yours sincerely,',
};
