import {
  daysElapsed,
  hoursSince,
  isFraudUrgent,
  currentStep,
  nextStep,
  daysUntilNext,
  evidenceProgress,
  hasEscalatedPastFirstStep,
  isOverdueForEscalation,
} from './engine';
import { LADDERS } from './ladders';
import { PLACE_DEFINITIONS } from '../money/places';
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
  describe('Fraud urgency (hoursSince, isFraudUrgent)', () => {
    it('created at 23:55 and checked at 00:05 next day is still urgent (10 mins elapsed)', () => {
      const created = new Date(2026, 10, 1, 23, 55, 0);
      const fraudCase = createMockCase({
        issueType: 'fraud',
        createdAt: created.toISOString(),
      });
      const now = new Date(2026, 10, 2, 0, 5, 0);

      expect(hoursSince(fraudCase, now)).toBeCloseTo(10 / 60, 2);
      expect(isFraudUrgent(fraudCase, now)).toBe(true);
    });

    it('checked at exactly 24h and at 24h+1min is no longer urgent', () => {
      const created = new Date(2026, 10, 1, 10, 0, 0);
      const fraudCase = createMockCase({
        issueType: 'fraud',
        createdAt: created.toISOString(),
      });

      // At exactly 24h
      const at24h = new Date(2026, 10, 2, 10, 0, 0);
      expect(hoursSince(fraudCase, at24h)).toBe(24);
      expect(isFraudUrgent(fraudCase, at24h)).toBe(false);

      // At 24h + 1min
      const at24h1m = new Date(2026, 10, 2, 10, 1, 0);
      expect(hoursSince(fraudCase, at24h1m)).toBeGreaterThan(24);
      expect(isFraudUrgent(fraudCase, at24h1m)).toBe(false);
    });

    it('resolved fraud case is never urgent even if created minutes ago', () => {
      const created = new Date(2026, 10, 1, 10, 0, 0);
      const resolvedFraud = createMockCase({
        issueType: 'fraud',
        createdAt: created.toISOString(),
        resolvedAt: new Date(2026, 10, 1, 10, 15, 0).toISOString(),
      });
      const now = new Date(2026, 10, 1, 10, 30, 0);

      expect(isFraudUrgent(resolvedFraud, now)).toBe(false);
    });

    it('non-fraud cases are never urgent under isFraudUrgent', () => {
      const refundCase = createMockCase({
        issueType: 'refund',
        createdAt: new Date().toISOString(),
      });
      expect(isFraudUrgent(refundCase, new Date())).toBe(false);
    });
  });

  describe('Day boundaries for Refund ladder', () => {
    const baseDate = new Date(2026, 10, 1, 10, 0, 0);
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
      const now = new Date(2026, 10, 7, 10, 0, 0);
      expect(daysElapsed(mockCase, now)).toBe(6);
      expect(currentStep(mockCase, now).who).toBe('Seller grievance officer');
      expect(daysUntilNext(mockCase, now)).toBe(1);
    });

    it('handles day boundary: day 7 (escalation milestone)', () => {
      const now = new Date(2026, 10, 8, 10, 0, 0);
      expect(daysElapsed(mockCase, now)).toBe(7);
      expect(currentStep(mockCase, now).who).toBe('National Consumer Helpline');
      expect(daysUntilNext(mockCase, now)).toBe(23);
    });

    it('handles day boundary: day 30 (final step reached)', () => {
      const now = new Date(2026, 11, 1, 10, 0, 0);
      expect(daysElapsed(mockCase, now)).toBe(30);
      expect(currentStep(mockCase, now).who).toBe('e-Jagriti consumer commission');
      expect(nextStep(mockCase, now)).toBeNull();
      expect(daysUntilNext(mockCase, now)).toBeNull();
    });
  });

  describe('Evidence progress checklist', () => {
    it('returns correct counts for evidence progress', () => {
      const c = createMockCase({
        issueType: 'refund',
        evidence: { 'Order ID': true, 'Invoice or screenshot': true },
      });
      const progress = evidenceProgress(c);
      expect(progress.done).toBe(2);
      expect(progress.total).toBe(4);
    });
  });

  describe('hasEscalatedPastFirstStep and isOverdueForEscalation', () => {
    const baseDate = new Date(2026, 10, 1, 10, 0, 0);

    it('returns false for refund on day 0 and day 6', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
      });
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 1, 10, 0, 0))).toBe(false);
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 7, 10, 0, 0))).toBe(false);
    });

    it('returns true for refund on day 7 (escalation milestone reached)', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
      });
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 8, 10, 0, 0))).toBe(true);
      expect(isOverdueForEscalation(c, new Date(2026, 10, 8, 10, 0, 0))).toBe(true);
    });

    it('returns false for fraud on day 0 AND day 1 (portal filing is NOT overdue)', () => {
      const c = createMockCase({
        issueType: 'fraud',
        createdAt: baseDate.toISOString(),
      });
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 1, 12, 0, 0))).toBe(false);
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 2, 12, 0, 0))).toBe(false);
    });

    it('returns true for fraud on day 30 (escalates past initial portal stage to RBI)', () => {
      const c = createMockCase({
        issueType: 'fraud',
        createdAt: baseDate.toISOString(),
      });
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 11, 1, 10, 0, 0))).toBe(true);
    });

    it('returns false when case has already been resolved', () => {
      const c = createMockCase({
        issueType: 'refund',
        createdAt: baseDate.toISOString(),
        resolvedAt: '2026-11-05T12:00:00.000Z',
      });
      expect(hasEscalatedPastFirstStep(c, new Date(2026, 10, 15, 10, 0, 0))).toBe(false);
    });
  });

  describe('Official Contacts Validation', () => {
    it('verifies all ladder links start with https:// and phone numbers are digits only', () => {
      const allSteps = Object.values(LADDERS).flatMap((ladder) => ladder.steps);
      allSteps
        .filter((s) => s.link !== undefined)
        .forEach((step) => {
          expect(step.link).toMatch(/^https:\/\//);
        });
      allSteps
        .filter((s) => s.phone !== undefined)
        .forEach((step) => {
          expect(step.phone).toMatch(/^\d+$/);
        });
    });

    it('verifies verifiedOn is either null or an ISO date, and non-null verifiedOn has verifiedAgainst URL starting with https://', () => {
      const allSteps = Object.values(LADDERS).flatMap((ladder) => ladder.steps);
      allSteps.forEach((step) => {
        if (step.verifiedOn !== null && step.verifiedOn !== undefined) {
          expect(step.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(step.verifiedAgainst).toMatch(/^https:\/\//);
        } else {
          expect(step.verifiedOn === null || step.verifiedOn === undefined).toBe(true);
        }
      });

      const allPlaces = PLACE_DEFINITIONS;
      allPlaces.forEach((place) => {
        if (place.verifiedOn !== null && place.verifiedOn !== undefined) {
          expect(place.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(place.verifiedAgainst).toMatch(/^https:\/\//);
        } else {
          expect(place.verifiedOn).toBeNull();
        }
      });
    });
  });
});
