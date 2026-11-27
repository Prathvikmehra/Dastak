import { buildCallScript } from './drafts';
import { LADDERS, getLocalizedLadder } from './ladders';
import { Case, IssueType } from './types';
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
    note: '',
    createdAt: '2026-11-01T10:00:00.000Z',
    evidence: {},
    ...overrides,
  };
}

describe('Call scripts tied to ladder step scriptId', () => {
  it('shows a script only when scriptId is set for every ladder step in every issue type', () => {
    const issues: IssueType[] = ['refund', 'fraud', 'bank', 'insurance'];
    const mockCase = createMockCase({
      company: 'Test Bank',
      amount: '1000',
      reference: 'REF123',
      incidentDate: '2026-10-28',
    });

    for (const issue of issues) {
      const ladder = getLocalizedLadder(issue);
      for (const step of ladder.steps) {
        const script = buildCallScript(mockCase, step);
        if (step.scriptId) {
          expect(script.trim().length).toBeGreaterThan(0);
        } else {
          expect(script).toBe('');
        }
      }
    }
  });

  it('builds rbi14448 script that never contains "fraud", "freeze" or "1930"', () => {
    const rbiSteps = [LADDERS.bank.steps[1], LADDERS.fraud.steps[2]];
    for (const step of rbiSteps) {
      expect(step.scriptId).toBe('rbi14448');
      const c = createMockCase({
        issueType: 'fraud',
        company: 'ABC Payments',
        amount: '5000',
        reference: 'TXN999',
        incidentDate: '2026-10-15',
      });
      const script = buildCallScript(c, step);
      expect(script.toLowerCase()).not.toContain('fraud');
      expect(script.toLowerCase()).not.toContain('freeze');
      expect(script).not.toContain('1930');
      expect(script).toContain('RBI Ombudsman');
      expect(script).toContain('ABC Payments');
      expect(script).toContain('15 Oct 2026');
      expect(script).toContain('TXN999');
    }
  });

  it('builds cyber1930 script that never contains "Ombudsman"', () => {
    const step = LADDERS.fraud.steps[0];
    const c = createMockCase({
      issueType: 'fraud',
      company: 'Fake Seller',
      amount: '2000',
      reference: 'REF888',
      incidentDate: '2026-10-20',
    });
    const script = buildCallScript(c, step);
    expect(script.toLowerCase()).not.toContain('ombudsman');
    expect(script).toContain('1930');
    expect(script).toContain('freeze the recipient account');
  });

  it('never produces undefined or empty braces when fields are empty', () => {
    const emptyCase = createMockCase({
      company: '',
      amount: '',
      reference: '',
      incidentDate: '',
    });
    const phoneSteps = [
      LADDERS.fraud.steps[0],
      LADDERS.refund.steps[1],
      LADDERS.bank.steps[1],
      LADDERS.fraud.steps[2],
    ];
    for (const step of phoneSteps) {
      const script = buildCallScript(emptyCase, step);
      expect(script).not.toContain('undefined');
      expect(script).not.toContain('null');
      expect(script).not.toContain('()');
      expect(script).not.toContain('{}');
      expect(script).not.toContain('{');
      expect(script).not.toContain('}');
      expect(script).not.toContain('(reference )');
    }
  });

  it('includes language suggestion line in nch1915 script', () => {
    const step = LADDERS.refund.steps[1];
    const c = createMockCase({ issueType: 'refund', company: 'ABC Retail' });
    const script = buildCallScript(c, step, en.callScript);
    expect(script).toContain('I would like to speak in Hindi or Gujarati.');

    const scriptHi = buildCallScript(c, step, hi.callScript);
    expect(scriptHi).toContain('मैं हिंदी में बात करना चाहता हूं।');

    const scriptGu = buildCallScript(c, step, gu.callScript);
    expect(scriptGu).toContain('હું ગુજરાતીમાં વાત કરવા માંગુ છું.');
  });

  it('verifies en, hi, gu all have the new call script strings and website button', () => {
    const languages = [
      { lang: 'en', copy: en },
      { lang: 'hi', copy: hi },
      { lang: 'gu', copy: gu },
    ];
    for (const { copy } of languages) {
      expect(copy.callScript.nchLanguagePreference).toBeTruthy();
      expect(copy.callScript.rbi.guideOmbudsman).toBeTruthy();
      expect(copy.callScript.rbi.complaintAgainst('TEST_CO')).toContain('TEST_CO');
      expect(copy.callScript.rbi.incidentDate('15 Oct 2026')).toContain('15 Oct 2026');
      expect(copy.callScript.rbi.complaintStatus('REF123')).toContain('REF123');
      expect(copy.callScript.rbi.complaintStatus()).toBeTruthy();
      expect(copy.caseDetail.doThisNow.openCmsRbiButton).toBeTruthy();
    }
  });

  it('tests all 8 combinations of fields in rbi14448 script without unstated facts', () => {
    const step = LADDERS.bank.steps[1];
    const combinations = [
      { company: 'State Bank of India', incidentDate: '2026-10-15', reference: 'REF123' },
      { company: 'State Bank of India', incidentDate: '2026-10-15', reference: '' },
      { company: 'State Bank of India', incidentDate: '', reference: 'REF123' },
      { company: 'State Bank of India', incidentDate: '', reference: '' },
      { company: '', incidentDate: '2026-10-15', reference: 'REF123' },
      { company: '', incidentDate: '2026-10-15', reference: '' },
      { company: '', incidentDate: '', reference: 'REF123' },
      { company: '', incidentDate: '', reference: '' },
    ];

    expect(combinations).toHaveLength(8);

    for (const combo of combinations) {
      const c = createMockCase({
        issueType: 'bank',
        company: combo.company,
        incidentDate: combo.incidentDate,
        reference: combo.reference,
      });
      const script = buildCallScript(c, step, en.callScript);

      expect(script).not.toContain('undefined');
      expect(script).not.toContain('null');
      expect(script).not.toContain('()');
      expect(script).not.toContain('{}');
      expect(script).not.toContain('{');
      expect(script).not.toContain('}');
      expect(script).not.toContain('30 days');
      expect(script).not.toContain('complained to them on');
      expect(script.toLowerCase()).not.toContain('fraud');
      expect(script.toLowerCase()).not.toContain('freeze');
      expect(script).not.toContain('1930');

      const lines = script.split('\n');
      if (combo.incidentDate) {
        const dateLines = lines.filter((l) => l.includes('15 Oct 2026'));
        expect(dateLines).toHaveLength(1);
        expect(dateLines[0]).toBe('The problem happened on 15 Oct 2026.');
      } else {
        expect(script).not.toContain('The problem happened on');
      }

      if (combo.reference) {
        expect(script).toContain(
          'I complained to them (reference REF123) and I have not received a satisfactory reply.'
        );
      } else {
        expect(script).toContain(
          'I complained to them and I have not received a satisfactory reply.'
        );
      }

      expect(lines[lines.length - 1]).toBe(
        'Please guide me on how to complain to the RBI Ombudsman.'
      );
    }
  });

  it('matches expected exact text for full case across all three languages', () => {
    const step = LADDERS.bank.steps[1];
    const fullCase = createMockCase({
      issueType: 'bank',
      company: 'State Bank of India',
      incidentDate: '2026-10-15',
      reference: 'REF123',
    });

    const expectedEn = [
      'Hello, I have a complaint against State Bank of India.',
      'The problem happened on 15 Oct 2026.',
      'I complained to them (reference REF123) and I have not received a satisfactory reply.',
      'Please guide me on how to complain to the RBI Ombudsman.',
    ].join('\n');
    expect(buildCallScript(fullCase, step, en.callScript)).toBe(expectedEn);

    const expectedHi = [
      'नमस्ते, मेरी State Bank of India के खिलाफ एक शिकायत है।',
      'यह समस्या 15 Oct 2026 को हुई थी।',
      'मैंने उन्हें शिकायत की थी (संदर्भ REF123) और मुझे संतोषजनक जवाब नहीं मिला है।',
      'कृपया मुझे मार्गदर्शन दें कि RBI Ombudsman से शिकायत कैसे करें।',
    ].join('\n');
    expect(buildCallScript(fullCase, step, hi.callScript)).toBe(expectedHi);

    const expectedGu = [
      'નમસ્તે, મારી State Bank of India સામે એક ફરિયાદ છે.',
      'આ સમસ્યા 15 Oct 2026 ના રોજ બની હતી.',
      'મેં તેમને ફરિયાદ કરી હતી (સંદર્ભ REF123) અને મને સંતોષકારક જવાબ મળ્યો નથી.',
      'કૃપા કરીને મને માર્ગદર્શન આપો કે RBI Ombudsman ને ફરિયાદ કેવી રીતે કરવી.',
    ].join('\n');
    expect(buildCallScript(fullCase, step, gu.callScript)).toBe(expectedGu);
  });
});
