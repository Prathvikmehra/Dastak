import { buildDraft, buildCallScript } from './drafts';
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

describe('Complaint Drafts and Call Scripts', () => {
  describe('buildDraft per-issue wording and formatting', () => {
    it('formats amount with formatRupees (₹2,500) and uses per-issue wording for refund', () => {
      const step = LADDERS.refund.steps[0];
      const c = createMockCase({
        issueType: 'refund',
        company: 'Flipkart',
        amount: '2500',
        note: '',
      });
      const draft = buildDraft(c, step);

      expect(draft).toContain('Subject: Formal grievance regarding order with Flipkart');
      expect(draft).toContain('my order with Flipkart for an amount of ₹2,500');
      expect(draft).not.toContain('₹2500');
      expect(draft).not.toContain('Details:');
    });

    it('uses per-issue wording for fraud and includes counterparty details', () => {
      const step = LADDERS.fraud.steps[0];
      const c = createMockCase({
        issueType: 'fraud',
        company: 'UPI 9876543210',
        amount: '100000',
        reference: 'UTR123456789012',
      });
      const draft = buildDraft(c, step);

      expect(draft).toContain('Subject: Formal complaint regarding online payment fraud');
      expect(draft).toContain('an online payment fraud');
      expect(draft).toContain('₹1,00,000');
      expect(draft).toContain('Reported counterparty or recipient: UPI 9876543210');
      expect(draft).toContain('Transaction ID: UTR123456789012');
    });

    it('uses per-issue wording for bank', () => {
      const step = LADDERS.bank.steps[0];
      const c = createMockCase({
        issueType: 'bank',
        company: 'State Bank of India',
        amount: '5000',
      });
      const draft = buildDraft(c, step);

      expect(draft).toContain(
        'Subject: Formal grievance regarding account or card with State Bank of India'
      );
      expect(draft).toContain('my account or card with State Bank of India');
      expect(draft).toContain('₹5,000');
    });

    it('uses per-issue wording for insurance and never contains transaction', () => {
      const step = LADDERS.insurance.steps[0];
      const c = createMockCase({
        issueType: 'insurance',
        company: 'Star Health',
        amount: '45000',
      });
      const draft = buildDraft(c, step);

      expect(draft).toContain(
        'Subject: Formal grievance regarding insurance claim with Star Health'
      );
      expect(draft).toContain('my claim or policy with Star Health');
      expect(draft.toLowerCase()).not.toContain('transaction');
      expect(draft).toContain('₹45,000');
    });

    it('handles all empty fields with honest fallbacks and no undefined', () => {
      const step = LADDERS.refund.steps[0];
      const emptyCase = createMockCase({
        company: '',
        amount: '',
        reference: '',
        incidentDate: '',
        note: '',
        userName: '',
      });
      const draft = buildDraft(emptyCase, step);

      expect(draft).not.toContain('undefined');
      expect(draft).not.toContain('null');
      expect(draft).not.toContain('[]');
      expect(draft).not.toContain('Details:');
      expect(draft).toMatch(/Thank you\.$/);
    });
  });

  describe('buildCallScript (4 to 6 lines for phone steps)', () => {
    it('builds a 4 to 6 line call script for fraud helpline 1930 with supplied facts', () => {
      const step = LADDERS.fraud.steps[0];
      const c = createMockCase({
        issueType: 'fraud',
        company: 'UPI scammer 9876543210',
        amount: '2500',
        reference: 'UTR123456',
        incidentDate: 'Today morning',
      });
      const script = buildCallScript(c, step);
      const lines = script.split('\n').filter((l) => l.trim().length > 0);

      expect(lines.length).toBeGreaterThanOrEqual(4);
      expect(lines.length).toBeLessThanOrEqual(6);
      expect(script).toContain('Hello, I want to report an online payment fraud.');
      expect(script).toContain('₹2,500');
      expect(script).toContain('UPI scammer 9876543210');
      expect(script).toContain('UTR123456');
      expect(script).toContain('freeze the recipient account');
      expect(script).not.toContain('undefined');
    });

    it('builds a 4 to 6 line call script for refund helpline 1915 with all empty fields', () => {
      const step = LADDERS.refund.steps[1];
      const emptyCase = createMockCase({
        issueType: 'refund',
        company: '',
        amount: '',
        reference: '',
        incidentDate: '',
      });
      const script = buildCallScript(emptyCase, step);
      const lines = script.split('\n').filter((l) => l.trim().length > 0);

      expect(lines.length).toBeGreaterThanOrEqual(4);
      expect(lines.length).toBeLessThanOrEqual(6);
      expect(script).toContain('Hello, I want to report an unreturned refund from a seller.');
      expect(script).toContain('National Consumer Helpline');
      expect(script).not.toContain('undefined');
    });
  });
});
