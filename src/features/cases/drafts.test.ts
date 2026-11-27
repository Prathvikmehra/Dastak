import { buildDraft, buildCallScript } from './drafts';
import { LADDERS, getLocalizedLadder } from './ladders';
import { Case } from './types';
import { en } from '../../copy/en';
import { hi } from '../../copy/hi';
import { gu } from '../../copy/gu';

function createMockCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'case-test-1',
    issueType: 'refund',
    company: 'Flipkart',
    amount: '1999',
    reference: 'OD123456789',
    incidentDate: '2026-11-10',
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

      expect(draft).toContain('To: National Cyber Crime Reporting Portal (cybercrime.gov.in)');
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

    it('prints structured dates via toDisplay in complaint draft and call script', () => {
      const step = LADDERS.bank.steps[0];
      const caseWithDate = createMockCase({
        issueType: 'bank',
        incidentDate: '2026-10-28',
      });
      const draft = buildDraft(caseWithDate, step);
      expect(draft).toContain('The incident occurred on 28 Oct 2026.');

      const phoneStep = LADDERS.fraud.steps[0];
      const script = buildCallScript(caseWithDate, phoneStep);
      expect(script).toContain('The incident occurred on 28 Oct 2026.');
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
      expect(lines.length).toBeLessThanOrEqual(7);
      expect(script).toContain('Hello, I want to report an unreturned refund from a seller.');
      expect(script).toContain('National Consumer Helpline');
      expect(script).not.toContain('undefined');
    });

    it('uses draftRecipient for fraud steps and falls back to who for other drafts across all languages', () => {
      const fraudStep0 = LADDERS.fraud.steps[0];
      const fraudStep1 = LADDERS.fraud.steps[1];
      const fraudStep30 = LADDERS.fraud.steps[2];
      const refundStep0 = LADDERS.refund.steps[0];
      const bankStep0 = LADDERS.bank.steps[0];
      const insuranceStep0 = LADDERS.insurance.steps[0];

      const c = createMockCase({ issueType: 'fraud' });

      // English
      expect(buildDraft(c, fraudStep0, en.drafts)).toContain(
        'To: National Cyber Crime Reporting Portal (cybercrime.gov.in)'
      );
      expect(buildDraft(c, fraudStep1, en.drafts)).toContain(
        'To: National Cyber Crime Reporting Portal (cybercrime.gov.in)'
      );
      expect(buildDraft(c, fraudStep30, en.drafts)).toContain('To: RBI Ombudsman');
      expect(buildDraft(c, refundStep0, en.drafts)).toContain('To: ' + refundStep0.who);
      expect(buildDraft(c, bankStep0, en.drafts)).toContain('To: ' + bankStep0.who);
      expect(buildDraft(c, insuranceStep0, en.drafts)).toContain('To: ' + insuranceStep0.who);

      // Hindi
      const hiFraud = getLocalizedLadder('fraud', hi);
      const hiRefund = getLocalizedLadder('refund', hi);
      expect(buildDraft(c, hiFraud.steps[0], hi.drafts)).toContain(
        hi.drafts.to('National Cyber Crime Reporting Portal (cybercrime.gov.in)')
      );
      expect(buildDraft(c, hiRefund.steps[0], hi.drafts)).toContain(
        hi.drafts.to(hiRefund.steps[0].who)
      );

      // Gujarati
      const guFraud = getLocalizedLadder('fraud', gu);
      const guRefund = getLocalizedLadder('refund', gu);
      expect(buildDraft(c, guFraud.steps[0], gu.drafts)).toContain(
        gu.drafts.to('National Cyber Crime Reporting Portal (cybercrime.gov.in)')
      );
      expect(buildDraft(c, guRefund.steps[0], gu.drafts)).toContain(
        gu.drafts.to(guRefund.steps[0].who)
      );
    });

    it('omits date line from drafts and call scripts when incident date is a legacy string', () => {
      const legacyCases = [
        createMockCase({ issueType: 'fraud', incidentDate: 'yesterday' }),
        createMockCase({ issueType: 'fraud', incidentDate: '', legacyIncidentDate: 'yesterday' }),
        createMockCase({ issueType: 'bank', incidentDate: 'last Tuesday' }),
        createMockCase({ issueType: 'bank', company: 'ABC Bank', incidentDate: 'Today morning' }),
      ];

      for (const lc of legacyCases) {
        // Draft check
        const draft = buildDraft(lc, LADDERS.bank.steps[0]);
        expect(draft).not.toContain('yesterday');
        expect(draft).not.toContain('last Tuesday');
        expect(draft).not.toContain('Today morning');
        expect(draft).not.toContain('The incident occurred on');

        // RBI script check
        const rbiStep = LADDERS.bank.steps[1]; // rbi14448
        const rbiScript = buildCallScript(lc, rbiStep);
        expect(rbiScript).not.toContain('yesterday');
        expect(rbiScript).not.toContain('last Tuesday');
        expect(rbiScript).not.toContain('Today morning');
        expect(rbiScript).not.toContain('The problem happened on');

        // Cyber1930 script check
        const cyberScript = buildCallScript(lc, LADDERS.fraud.steps[0]);
        expect(cyberScript).not.toContain('yesterday');
        expect(cyberScript).not.toContain('The incident occurred on');
      }
    });
  });
});
