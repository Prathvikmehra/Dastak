import {
  daysElapsed,
  currentStep,
  nextStep,
  daysUntilNext,
  evidenceProgress,
  isOverdueForEscalation,
  buildDraft,
} from './engine';
import { LADDERS } from './ladders';
import { Case } from './types';

function createMockCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'case-test-1',
    issueType: 'refund',
    company: 'Flipkart',
    amount: '1999',
    reference: 'OD123456789',
    incidentDate: '10 Nov 2026',
    note: 'Returned shoes on 5th Nov, refund not received.',
    createdAt: '2026-11-01T10:00:00.000Z',
    evidence: {},
    ...overrides,
  };
}

describe('Case Escalation Engine', () => {
  describe('Day boundaries for Refund ladder (days 0, 6, 7, 8, 29, 30, 31)', () => {
    const baseDate = new Date(2026, 10, 1, 10, 0, 0); // Nov 1, 2026 local
    const mockCase = createMockCase({
      issueType: 'refund',
      createdAt: baseDate.toISOString(),
    });

    it('handles day boundary: day 0', () => {
      const now = new Date(2026, 10, 1, 15, 0, 0);
      expect(daysElapsed(mockCase, now)).toBe(0);
      const current = currentStep(mockCase, now);
      expect(current.who).toBe('Seller grievance officer');
      expect(current.dayOffset).toBe(0);
      const next = nextStep(mockCase, now);
      expect(next?.who).toBe('National Consumer Helpline');
      expect(daysUntilNext(mockCase, now)).toBe(7);
    });

    it('handles day boundary: day 6', () => {
      const now = new Date(2026, 10, 7, 10, 0, 0); // 6 days later
      expect(daysElapsed(mockCase, now)).toBe(6);
      expect(currentStep(mockCase, now).who).toBe('Seller grievance officer');
      expect(daysUntilNext(mockCase, now)).toBe(1);
    });

    it('handles day boundary: day 7 (escalation milestone)', () => {
      const now = new Date(2026, 10, 8, 10, 0, 0); // 7 days later
      expect(daysElapsed(mockCase, now)).toBe(7);
      expect(currentStep(mockCase, now).who).toBe('National Consumer Helpline');
      expect(daysUntilNext(mockCase, now)).toBe(23); // 30 - 7
    });

    it('handles day boundary: day 8', () => {
      const now = new Date(2026, 10, 9, 10, 0, 0); // 8 days later
      expect(daysElapsed(mockCase, now)).toBe(8);
      expect(currentStep(mockCase, now).who).toBe('National Consumer Helpline');
      expect(daysUntilNext(mockCase, now)).toBe(22);
    });

    it('handles day boundary: day 29', () => {
      const now = new Date(2026, 10, 30, 10, 0, 0); // 29 days later
      expect(daysElapsed(mockCase, now)).toBe(29);
      expect(currentStep(mockCase, now).who).toBe('National Consumer Helpline');
      expect(daysUntilNext(mockCase, now)).toBe(1);
    });

    it('handles day boundary: day 30 (final step reached)', () => {
      const now = new Date(2026, 11, 1, 10, 0, 0); // 30 days later
      expect(daysElapsed(mockCase, now)).toBe(30);
      expect(currentStep(mockCase, now).who).toBe('e-Jagriti consumer commission');
      expect(nextStep(mockCase, now)).toBeNull();
      expect(daysUntilNext(mockCase, now)).toBeNull();
    });

    it('handles day boundary: day 31', () => {
      const now = new Date(2026, 11, 2, 10, 0, 0); // 31 days later
      expect(daysElapsed(mockCase, now)).toBe(31);
      expect(currentStep(mockCase, now).who).toBe('e-Jagriti consumer commission');
      expect(nextStep(mockCase, now)).toBeNull();
      expect(daysUntilNext(mockCase, now)).toBeNull();
    });
  });

  describe('Fraud ladder milestones (day 0 and day 1)', () => {
    const baseDate = new Date(2026, 10, 1, 9, 0, 0);
    const fraudCase = createMockCase({
      issueType: 'fraud',
      createdAt: baseDate.toISOString(),
    });

    it('handles fraud day 0: Cybercrime helpline (phone 1930)', () => {
      const now = new Date(2026, 10, 1, 18, 0, 0);
      expect(daysElapsed(fraudCase, now)).toBe(0);
      const current = currentStep(fraudCase, now);
      expect(current.who).toBe('Cybercrime helpline');
      expect(current.phone).toBe('1930');
      expect(nextStep(fraudCase, now)?.who).toBe('Cybercrime portal');
      expect(daysUntilNext(fraudCase, now)).toBe(1);
    });

    it('handles fraud day 1: Cybercrime portal', () => {
      const now = new Date(2026, 10, 2, 9, 30, 0);
      expect(daysElapsed(fraudCase, now)).toBe(1);
      const current = currentStep(fraudCase, now);
      expect(current.who).toBe('Cybercrime portal');
      expect(current.link).toBe('https://cybercrime.gov.in');
      expect(nextStep(fraudCase, now)?.who).toBe('RBI complaint portal');
      expect(daysUntilNext(fraudCase, now)).toBe(29);
    });
  });

  describe('Last ladder step behavior', () => {
    it('returns null for nextStep and daysUntilNext when on final step of bank ladder', () => {
      const baseDate = new Date(2026, 9, 1, 10, 0, 0);
      const bankCase = createMockCase({
        issueType: 'bank',
        createdAt: baseDate.toISOString(),
      });
      const now = new Date(2026, 10, 15, 10, 0, 0); // 45 days later
      expect(daysElapsed(bankCase, now)).toBe(45);
      expect(currentStep(bankCase, now).who).toBe('RBI complaint portal');
      expect(nextStep(bankCase, now)).toBeNull();
      expect(daysUntilNext(bankCase, now)).toBeNull();
    });
  });

  describe('Evidence progress checklist', () => {
    it('returns 0 done when no evidence is ticked', () => {
      const c = createMockCase({
        issueType: 'refund',
        evidence: {},
      });
      const progress = evidenceProgress(c);
      expect(progress.done).toBe(0);
      expect(progress.total).toBe(4);
    });

    it('returns correct count when some evidence items are ticked', () => {
      const c = createMockCase({
        issueType: 'refund',
        evidence: {
          'Order ID': true,
          'Invoice or screenshot': true,
          'Chat or email with seller': false,
        },
      });
      const progress = evidenceProgress(c);
      expect(progress.done).toBe(2);
      expect(progress.total).toBe(4);
    });

    it('returns full count when all evidence items are ticked', () => {
      const c = createMockCase({
        issueType: 'insurance',
        evidence: {
          'Policy number': true,
          'Claim number': true,
          'Rejection letter': true,
          'Medical or loss documents': true,
        },
      });
      const progress = evidenceProgress(c);
      expect(progress.done).toBe(4);
      expect(progress.total).toBe(4);
    });
  });

  describe('buildDraft', () => {
    const testStep = LADDERS.refund.steps[0];

    it('handles every field empty with sensible fallbacks and no undefined or empty brackets', () => {
      const emptyCase: Case = {
        id: 'empty-1',
        issueType: 'refund',
        company: '',
        amount: '',
        reference: '',
        incidentDate: '',
        note: '',
        createdAt: new Date().toISOString(),
        evidence: {},
      };

      const draft = buildDraft(emptyCase, testStep);

      expect(draft).not.toContain('undefined');
      expect(draft).not.toContain('null');
      expect(draft).not.toContain('[]');
      expect(draft).not.toContain('()');
      expect(draft).toContain('To: Seller grievance officer');
      expect(draft).toContain('the concerned company');
      expect(draft).toContain('Reference details to be provided');
    });

    it('correctly includes every field when all are filled', () => {
      const filledCase = createMockCase({
        company: 'Amazon India',
        amount: '4500',
        reference: 'AMZ-998877',
        incidentDate: '12 Nov 2026',
        note: 'Damaged phone delivered, replacement refused.',
      });

      const draft = buildDraft(filledCase, testStep);

      expect(draft).toContain('To: Seller grievance officer');
      expect(draft).toContain('Amazon India');
      expect(draft).toContain('₹4500');
      expect(draft).toContain('AMZ-998877');
      expect(draft).toContain('12 Nov 2026');
      expect(draft).toContain('Damaged phone delivered, replacement refused.');
    });
  });

  describe('Calendar day boundaries across midnight in local time', () => {
    it('accurately counts 1 day elapsed for case created at 11:59pm checked after midnight', () => {
      // Case created Nov 10, 2026 at 23:59:00 local time
      const created = new Date(2026, 10, 10, 23, 59, 0);
      const caseItem = createMockCase({
        createdAt: created.toISOString(),
      });

      // Checked same night at 23:59:30 local time -> 0 days
      const sameNight = new Date(2026, 10, 10, 23, 59, 30);
      expect(daysElapsed(caseItem, sameNight)).toBe(0);

      // Checked 2 minutes later on Nov 11, 2026 at 00:01:00 local time -> 1 day
      const afterMidnight = new Date(2026, 10, 11, 0, 1, 0);
      expect(daysElapsed(caseItem, afterMidnight)).toBe(1);
    });
  });

  describe('isOverdueForEscalation', () => {
    const baseDate = new Date(2026, 10, 1, 10, 0, 0);

    it('returns false on day 0 when within initial company resolution window', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
      });
      const now = new Date(2026, 10, 3, 10, 0, 0); // 2 days later
      expect(isOverdueForEscalation(c, now)).toBe(false);
    });

    it('returns true when deadline passes without resolution', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
      });
      const now = new Date(2026, 10, 9, 10, 0, 0); // 8 days later (past day 7)
      expect(isOverdueForEscalation(c, now)).toBe(true);
    });

    it('returns false when case has already been resolved', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
        resolvedAt: '2026-11-05T12:00:00.000Z',
      });
      const now = new Date(2026, 10, 15, 10, 0, 0); // 14 days later
      expect(isOverdueForEscalation(c, now)).toBe(false);
    });
  });

  describe('Official Contacts Validation', () => {
    it('verifies all ladder links start with https://', () => {
      const allSteps = Object.values(LADDERS).flatMap((ladder) => ladder.steps);
      const stepsWithLinks = allSteps.filter((s) => s.link !== undefined);

      expect(stepsWithLinks.length).toBeGreaterThan(0);
      stepsWithLinks.forEach((step) => {
        expect(step.link).toMatch(/^https:\/\//);
      });
    });

    it('verifies all ladder phone numbers contain digits only', () => {
      const allSteps = Object.values(LADDERS).flatMap((ladder) => ladder.steps);
      const stepsWithPhone = allSteps.filter((s) => s.phone !== undefined);

      expect(stepsWithPhone.length).toBeGreaterThan(0);
      stepsWithPhone.forEach((step) => {
        expect(step.phone).toMatch(/^\d+$/);
      });
    });
  });
});
