import { guessIssue } from './router';

describe('Router phrase corpus across English, Hindi, and Gujarati', () => {
  describe('Fraud phrases (28 distinct phrases)', () => {
    const fraudCases = [
      'my money got debited, someone called for OTP',
      'received fake call from customs threatening arrest',
      'scammed via unknown link on WhatsApp',
      'digital arrest by fake police demanding transfer',
      'anydesk screen share fraud happened yesterday',
      'money debited but I did not do it',
      'खाते से पैसे कट गए ओटीपी मांगा था',
      'डिजिटल अरेस्ट की धमकी देकर रुपये ट्रांसफर करवाए',
      'ठगी हो गई फर्जी कॉल से लिंक पर क्लिक करवाया',
      'नकली कॉल आई थी सीबीआई अधिकारी बनकर',
      'अनधिकृत निकासी हुई खाते से',
      'paise kat gaye unauthorized debit from account',
      'dhokha ho gaya fake call caller asked for anydesk',
      'police dhamki digital arrest transfer money',
      'thagi ho gayi kisi ne otp lekar paise nikal liye',
      'પૈસા કપાઈ ગયા ઓટીપી આપ્યો હતો',
      'ડિજિટલ એરેસ્ટની ધમકી આપીને પૈસા પડાવ્યા',
      'છેતરપિંડી થઈ ગઈ અજાણી લિંકથી',
      'નકલી કૉલ આવ્યો હતો અને ખાતું હેક થઈ ગયું',
      'paisa kapai gaya otp lidho scammer e',
      'chhetarpindi thai gai nakli call thi',
      'lottery prize link clicked account debited',
      'kyc update scam fake call received',
      'apk file download karvayi fasa diya',
      'cyber helpline report karni hai chori ho gayi',
      'loot liya fake investment scheme me',
      'fasavat kari lidhi scammer e',
      'chhetra pindi thai gai paise kat gaye',
    ];

    test.each(fraudCases)('identifies fraud: "%s"', (phrase) => {
      const result = guessIssue(phrase);
      expect(result.issue).toBe('fraud');
      expect(result.candidates).toContain('fraud');
      expect(result.matched.length).toBeGreaterThan(0);
    });

    it('prioritizes fraud over refund when both signals are present', () => {
      const mixed1 = 'order not delivered on Flipkart but someone asked OTP and paise kat gaye';
      const r1 = guessIssue(mixed1);
      expect(r1.issue).toBe('fraud');

      const mixed2 = 'refund request turned into scam via fake link';
      const r2 = guessIssue(mixed2);
      expect(r2.issue).toBe('fraud');
    });

    it('prioritizes fraud over bank disputes when both signals are present', () => {
      const mixed = 'bank account blocked after digital arrest scam';
      const r = guessIssue(mixed);
      expect(r.issue).toBe('fraud');
    });
  });

  describe('Refund phrases (20 distinct phrases)', () => {
    const refundCases = [
      'order not delivered Flipkart',
      'wrong product received in parcel returned on Monday',
      'returned shoes but money not back from Amazon',
      'item missing from package seller refused replacement',
      'cancellation refund still pending for my order',
      'सामान नहीं मिला फ्लिपकार्ट से ऑर्डर किया था',
      'गलत सामान मिला था वापस किया पर रिफंड नहीं आया',
      'पैसे वापस नहीं आए ऑर्डर रद्द किया था',
      'order nahi mila amazon se parcel gayab',
      'galat saman mila return kiya paisa wapas nahi aaya',
      'paise wapas nahi aaye cancel kiya tha',
      'ઓર્ડર મળ્યો નથી પાર્સલ ક્યાં છે ખબર નથી',
      'ખોટો સામાન આવ્યો હતો પાછો આપ્યો રિફંડ બાકી',
      'પૈસા પાછા નથી મળ્યા ઓર્ડર રદ કર્યો હતો',
      'order nathi malyo flipkart mathi parcel',
      'khoto saman aavyo return karyo refund nathi aavyu',
      'pacche aapo maro saman nathi aavyo',
      'wapas nahi mile paise courier return kiya tha',
      'refund nahi aaya zomato delivery cancel',
      'samaan delivery boy ne nahi diya',
    ];

    test.each(refundCases)('identifies refund: "%s"', (phrase) => {
      const result = guessIssue(phrase);
      expect(result.issue).toBe('refund');
      expect(result.candidates).toEqual(['refund']);
      expect(result.matched.length).toBeGreaterThan(0);
    });
  });

  describe('Bank dispute phrases (18 distinct phrases)', () => {
    const bankCases = [
      'ATM cash failed transaction failed but no money came out',
      'wrong maintenance charge debited on debit card by bank',
      'account blocked without any prior notice from branch',
      'EMI deducted twice this month for my loan',
      'cash not dispensed at ATM passbook shows debit',
      'एटीएम से पैसे नहीं निकले लेकिन खाते से कट गए',
      'बैंक ने गलत चार्ज काट लिया खाते से',
      'खाता ब्लॉक कर दिया गया है बिना किसी नोटिस के',
      'atm se paise nahi nikle branch wale sun nahi rahe',
      'bank ne galat charge lagaya card par',
      'khata block ho gaya loan emi pending nahi thi',
      'એટીએમમાંથી રોકડ ન નીકળી ખાતામાંથી રકમ કપાઈ ગઈ',
      'બેંકે ખોટો ચાર્જ કાપ્યો છે કાર્ડ પર',
      'ખાતું બ્લોક કરી દીધું છે શાખામાં ગયા હતા',
      'atm mathi rokada na nikali bank passbook debit',
      'khatun block thai gayu che emi issue',
      'transaction failed and deduction made on net banking',
      'upi failed server down deduction made from branch account',
    ];

    test.each(bankCases)('identifies bank: "%s"', (phrase) => {
      const result = guessIssue(phrase);
      expect(result.issue).toBe('bank');
      expect(result.candidates).toEqual(['bank']);
      expect(result.matched.length).toBeGreaterThan(0);
    });
  });

  describe('Insurance dispute phrases (18 distinct phrases)', () => {
    const insuranceCases = [
      'health insurance cashless claim rejected at hospital',
      'policy claim denied without clear explanation',
      'mediclaim repudiated by TPA after discharge',
      'car insurance claim rejected citing wear and tear',
      'motor insurance premium paid but policy not issued',
      'स्वास्थ्य बीमा क्लेम खारिज कर दिया अस्पताल में',
      'मेडिक्लेम कैशलेस निरस्त कर दिया गया',
      'पॉलिसी क्लेम खारिज हो गया टीपीए द्वारा',
      'bima claim reject kar diya hospital me',
      'mediclaim cashless reject ho gaya company se',
      'policy premium kata par vimo renew nahi hua',
      'આરોગ્ય વીમો ક્લેમ નામંજૂર કર્યો હોસ્પિટલમાં',
      'મેડિક્લેમ કેશલેસ નામંજૂર થયો ટીપીએ દ્વારા',
      'પોલિસી પ્રીમિયમ ભર્યું પણ દાવો રદ કર્યો',
      'vimo claim namanjur thayo insurance company e',
      'mediclaim reject kari didho hospital discharge',
      'death claim rejected citing policy lapsed',
      'accident case reimbursement refused by surveyor',
    ];

    test.each(insuranceCases)('identifies insurance: "%s"', (phrase) => {
      const result = guessIssue(phrase);
      expect(result.issue).toBe('insurance');
      expect(result.candidates).toEqual(['insurance']);
      expect(result.matched.length).toBeGreaterThan(0);
    });
  });
});
