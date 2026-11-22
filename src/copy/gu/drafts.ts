import { DraftsCopy } from '../types/domain';

export const guDrafts: DraftsCopy = {
  to: (who: string) => `પ્રતિ: ${who}`,
  subjectRefund: (company?: string) =>
    company ? `વિષય: ${company} સાથેના ઓર્ડર અંગે ઔપચારિક ફરિયાદ` : 'વિષય: ઓર્ડર અંગે ઔપચારિક ફરિયાદ',
  subjectFraud: (company?: string) =>
    company
      ? `વિષય: ${company} સંલગ્ન ઓનલાઇન ચુકવણી છેતરપિંડી અંગે ફરિયાદ`
      : 'વિષય: ઓનલાઇન ચુકવણી છેતરપિંડી અંગે ઔપચારિક ફરિયાદ',
  subjectBank: (company?: string) =>
    company
      ? `વિષય: ${company} ના ખાતા અથવા કાર્ડ અંગે ઔપચારિક ફરિયાદ`
      : 'વિષય: બેંક ખાતા અથવા કાર્ડ અંગે ઔપચારિક ફરિયાદ',
  subjectInsurance: (company?: string) =>
    company
      ? `વિષય: ${company} સાથેના વીમા દાવા અંગે ઔપચારિક ફરિયાદ`
      : 'વિષય: વીમા દાવા અંગે ઔપચારિક ફરિયાદ',
  salutation: 'આદરણીય સાહેબ/મેડમ,',
  introRefund: (company?: string, amount?: string) => {
    if (company && amount) {
      return `હું ${company} સાથેના મારા ઓર્ડર અંગે ${amount} ની રકમ માટે આ ફરિયાદ રજૂ કરું છું.`;
    }
    if (company) {
      return `હું ${company} સાથેના મારા ઓર્ડર અંગે આ ફરિયાદ રજૂ કરું છું.`;
    }
    if (amount) {
      return `હું ${amount} ની રકમના ઓર્ડર અંગે આ ફરિયાદ રજૂ કરું છું.`;
    }
    return 'હું મારા ઓર્ડર અંગે આ ઔપચારિક ફરિયાદ રજૂ કરું છું.';
  },
  introFraud: (company?: string, amount?: string) => {
    if (company && amount) {
      return `હું ${company} સંલગ્ન ${amount} ની રકમની ઓનલાઇન ચુકવણી છેતરપિંડીની જાણ કરું છું.`;
    }
    if (company) {
      return `હું ${company} સંલગ્ન ઓનલાઇન ચુકવણી છેતરપિંડીની જાણ કરું છું.`;
    }
    if (amount) {
      return `હું ${amount} ની રકમની ઓનલાઇન ચુકવણી છેતરપિંડીની જાણ કરું છું.`;
    }
    return 'હું ઓનલાઇન ચુકવણી છેતરપિંડીની જાણ કરું છું.';
  },
  introBank: (company?: string, amount?: string) => {
    if (company && amount) {
      return `હું ${company} સાથેના મારા ખાતા અથવા કાર્ડ અંગે ${amount} ની રકમ માટે ફરિયાદ રજૂ કરું છું.`;
    }
    if (company) {
      return `હું ${company} સાથેના મારા ખાતા અથવા કાર્ડ અંગે આ ફરિયાદ રજૂ કરું છું.`;
    }
    if (amount) {
      return `હું ખાતા અથવા કાર્ડની સમસ્યા અંગે ${amount} ની રકમ માટે ફરિયાદ રજૂ કરું છું.`;
    }
    return 'હું મારા ખાતા અથવા કાર્ડ અંગે આ ઔપચારિક ફરિયાદ રજૂ કરું છું.';
  },
  introInsurance: (company?: string, amount?: string) => {
    if (company && amount) {
      return `હું ${company} સાથેના મારા દાવા અથવા પોલિસી અંગે ${amount} ની રકમ માટે ફરિયાદ રજૂ કરું છું.`;
    }
    if (company) {
      return `હું ${company} સાથેના મારા દાવા અથવા પોલિસી અંગે આ ફરિયાદ રજૂ કરું છું.`;
    }
    if (amount) {
      return `હું મારા દાવા અથવા પોલિસી અંગે ${amount} ની રકમ માટે ફરિયાદ રજૂ કરું છું.`;
    }
    return 'હું મારા દાવા અથવા પોલિસી અંગે આ ઔપચારિક ફરિયાદ રજૂ કરું છું.';
  },
  incidentDate: (date: string) => `આ ઘટના ${date} ના રોજ બની હતી.`,
  counterparty: (company: string) => `રિપોર્ટ કરેલ પક્ષ અથવા પ્રાપ્તકર્તા: ${company}`,
  referencePolicy: (ref: string) => `પોલિસી અથવા ક્લેમ સંદર્ભ: ${ref}`,
  referenceAccount: (ref: string) => `ખાતા અથવા વિવાદ સંદર્ભ: ${ref}`,
  referenceOrder: (ref: string) => `ઓર્ડર સંદર્ભ ID: ${ref}`,
  referenceTransaction: (ref: string) => `ટ્રાન્ઝેક્શન ID: ${ref}`,
  detailsHeading: 'વિગતો:',
  requestedActionHeading: 'વિનંતી કરેલ પગલું:',
  thankYou: 'આભાર.',
  sincerely: 'આપનો/આપની વિશ્વાસુ,',
};
