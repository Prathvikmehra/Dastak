import { guessIssue, buildRouteParams, FRAUD_SHORTCUT_PARAMS } from './router';

describe('guessIssue pure function routing', () => {
  describe('Mandatory tiering and edge-case tests', () => {
    it('handles ATM did not give cash but account debited as candidates [bank, fraud], issue null', () => {
      const res = guessIssue('ATM did not give cash but account debited');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['bank', 'fraud']);
    });

    it('handles bank deducted my EMI twice as bank', () => {
      const res = guessIssue('bank deducted my EMI twice');
      expect(res.issue).toBe('bank');
      expect(res.candidates).toEqual(['bank']);
    });

    it('handles bank ne EMI ke paise do baar kaat liye as bank', () => {
      const res = guessIssue('bank ne EMI ke paise do baar kaat liye');
      expect(res.issue).toBe('bank');
      expect(res.candidates).toEqual(['bank']);
    });

    it('handles someone called asking for OTP and money got debited as fraud', () => {
      const res = guessIssue('someone called asking for OTP and money got debited');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('handles Flipkart order nahi mila parcel gayab as refund', () => {
      const res = guessIssue('Flipkart order nahi mila parcel gayab');
      expect(res.issue).toBe('refund');
      expect(res.candidates).toEqual(['refund']);
    });

    it('handles refund scam call asked me to install an app as fraud', () => {
      const res = guessIssue('refund scam call asked me to install an app');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('handles CBI officer on video call said I am under digital arrest as fraud', () => {
      const res = guessIssue('CBI officer on video call said I am under digital arrest');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    const nonMatching = [
      'stupid cupid',
      'photo copy of the hotpot receipt',
      'treatment was good',
      'hello good morning',
      '',
    ];

    test.each(nonMatching)('returns null with no candidates for: "%s"', (text) => {
      const res = guessIssue(text);
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual([]);
    });
  });

  describe('10+ mixed-language ties and weak/strong combinations', () => {
    it('1. Hindi refund + weak fraud -> candidates [refund, fraud]', () => {
      const res = guessIssue('फ्लिपकार्ट सामान नहीं मिला पैसे कट गए');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['refund', 'fraud']);
    });

    it('2. Gujarati refund + weak fraud -> candidates [refund, fraud]', () => {
      const res = guessIssue('ઓર્ડર રદ કર્યો પણ પૈસા કપાઈ ગયા');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['refund', 'fraud']);
    });

    it('3. Hindi bank + weak fraud -> candidates [bank, fraud]', () => {
      const res = guessIssue('एटीएम से पैसे नहीं निकले खाते से पैसे कट गए');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['bank', 'fraud']);
    });

    it('4. Gujarati bank + weak fraud -> candidates [bank, fraud]', () => {
      const res = guessIssue('એટીએમમાંથી રોકડ ન નીકળી અને ખાતામાંથી પૈસા કપાઈ ગયા');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['bank', 'fraud']);
    });

    it('5. Insurance + weak fraud -> candidates [insurance, fraud]', () => {
      const res = guessIssue('hospital claim reimbursement paise kat gaye');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(['insurance', 'fraud']);
    });

    it('6. Weak fraud alone in English -> fraud', () => {
      const res = guessIssue('5000 debited from my account money gone');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('7. Weak fraud alone in Hindi -> fraud', () => {
      const res = guessIssue('खाते से पैसे कट गए');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('8. Weak fraud alone in Gujarati -> fraud', () => {
      const res = guessIssue('પૈસા કપાઈ ગયા');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('9. Strong fraud overrules refund signal -> fraud', () => {
      const res = guessIssue('amazon delivery parcel scam otp asked');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('10. Strong fraud overrules bank signal -> fraud', () => {
      const res = guessIssue('bank branch account blocked threatening police arrest');
      expect(res.issue).toBe('fraud');
      expect(res.candidates).toEqual(['fraud']);
    });

    it('11. Non-fraud tie between bank and refund -> candidates [refund, bank] or [bank, refund]', () => {
      const res = guessIssue('bank return');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(expect.arrayContaining(['bank', 'refund']));
    });

    it('12. Non-fraud tie between insurance and bank -> candidates [insurance, bank]', () => {
      const res = guessIssue('bank policy');
      expect(res.issue).toBeNull();
      expect(res.candidates).toEqual(expect.arrayContaining(['bank', 'insurance']));
    });
  });

  describe('Standard Door Detection and Shortcuts', () => {
    it('detects strong fraud across languages', () => {
      expect(guessIssue('डिजिटल अरेस्ट की धमकी देकर रुपये ट्रांसफर करवाए').issue).toBe('fraud');
      expect(guessIssue('છેતરપિંડી થઈ ગઈ અજાણી લિંકથી').issue).toBe('fraud');
      expect(guessIssue('anydesk screen share apk download').issue).toBe('fraud');
    });

    it('detects refund across languages', () => {
      expect(guessIssue('wrong product received in parcel returned').issue).toBe('refund');
      expect(guessIssue('ખોટો સામાન આવ્યો હતો પાછો આપ્યો રિફંડ બાકી').issue).toBe('refund');
    });

    it('detects bank across languages', () => {
      expect(guessIssue('wrong maintenance charge debited on debit card by bank').issue).toBe(
        'bank'
      );
      expect(guessIssue('બેંકે ખોટો ચાર્જ કાપ્યો છે કાર્ડ પર').issue).toBe('bank');
    });

    it('detects insurance across languages', () => {
      expect(guessIssue('health insurance cashless claim rejected at hospital').issue).toBe(
        'insurance'
      );
      expect(guessIssue('આરોગ્ય વીમો ક્લેમ નામંજૂર કર્યો હોસ્પિટલમાં').issue).toBe('insurance');
    });

    it('buildRouteParams handles matched single issue', () => {
      const res = buildRouteParams('Flipkart order nahi mila');
      expect(res.routed).toBe('true');
      expect(res.issueType).toBe('refund');
      expect(res.candidates).toBe('refund');
    });

    it('buildRouteParams handles two candidates tie', () => {
      const res = buildRouteParams('ATM did not give cash but account debited');
      expect(res.routed).toBe('true');
      expect(res.issueType).toBeUndefined();
      expect(res.candidates).toBe('bank,fraud');
    });

    it('buildRouteParams handles unrouted text', () => {
      const res = buildRouteParams('hello good morning');
      expect(res.routed).toBe('false');
      expect(res.issueType).toBeUndefined();
    });

    it('exposes FRAUD_SHORTCUT_PARAMS', () => {
      expect(FRAUD_SHORTCUT_PARAMS).toEqual({
        issueType: 'fraud',
        fraudWhen: 'hour',
      });
    });
  });
});
