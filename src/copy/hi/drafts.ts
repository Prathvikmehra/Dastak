import { DraftsCopy } from '../types/domain';

export const hiDrafts: DraftsCopy = {
  to: (who: string) => `प्रति: ${who}`,
  subjectRefund: (company?: string) =>
    company
      ? `विषय: ${company} के साथ ऑर्डर के संबंध में औपचारिक शिकायत`
      : 'विषय: ऑर्डर के संबंध में औपचारिक शिकायत',
  subjectFraud: (company?: string) =>
    company
      ? `विषय: ${company} से जुड़े ऑनलाइन भुगतान धोखाधड़ी के संबंध में औपचारिक शिकायत`
      : 'विषय: ऑनलाइन भुगतान धोखाधड़ी के संबंध में औपचारिक शिकायत',
  subjectBank: (company?: string) =>
    company
      ? `विषय: ${company} के खाते या कार्ड के संबंध में औपचारिक शिकायत`
      : 'विषय: बैंक खाते या कार्ड के संबंध में औपचारिक शिकायत',
  subjectInsurance: (company?: string) =>
    company
      ? `विषय: ${company} के साथ बीमा दावे के संबंध में औपचारिक शिकायत`
      : 'विषय: बीमा दावे के संबंध में औपचारिक शिकायत',
  salutation: 'आदरणीय महोदय/महोदया,',
  introRefund: (company?: string, amount?: string) => {
    if (company && amount) {
      return `मैं ${company} के साथ अपने ऑर्डर के संबंध में ${amount} की राशि की औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (company) {
      return `मैं ${company} के साथ अपने ऑर्डर के संबंध में यह औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (amount) {
      return `मैं ${amount} की राशि के एक ऑर्डर के संबंध में यह औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    return 'मैं अपने ऑर्डर के संबंध में यह औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।';
  },
  introFraud: (company?: string, amount?: string) => {
    if (company && amount) {
      return `मैं ${company} से जुड़े ${amount} की राशि के ऑनलाइन भुगतान धोखाधड़ी की रिपोर्ट कर रहा/रही हूँ।`;
    }
    if (company) {
      return `मैं ${company} से जुड़े ऑनलाइन भुगतान धोखाधड़ी की रिपोर्ट कर रहा/रही हूँ।`;
    }
    if (amount) {
      return `मैं ${amount} की राशि के ऑनलाइन भुगतान धोखाधड़ी की रिपोर्ट कर रहा/रही हूँ।`;
    }
    return 'मैं एक ऑनलाइन भुगतान धोखाधड़ी की रिपोर्ट कर रहा/रही हूँ।';
  },
  introBank: (company?: string, amount?: string) => {
    if (company && amount) {
      return `मैं ${company} के साथ अपने खाते या कार्ड के संबंध में ${amount} की राशि की शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (company) {
      return `मैं ${company} के साथ अपने खाते या कार्ड के संबंध में यह शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (amount) {
      return `मैं खाते या कार्ड के मुद्दे के संबंध में ${amount} की राशि की शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    return 'मैं अपने खाते या कार्ड के संबंध में यह औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।';
  },
  introInsurance: (company?: string, amount?: string) => {
    if (company && amount) {
      return `मैं ${company} के साथ अपने दावे या पॉलिसी के संबंध में ${amount} की राशि की शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (company) {
      return `मैं ${company} के साथ अपने दावे या पॉलिसी के संबंध में यह शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    if (amount) {
      return `मैं अपने दावे या पॉलिसी के संबंध में ${amount} की राशि की शिकायत प्रस्तुत कर रहा/रही हूँ।`;
    }
    return 'मैं अपने दावे या पॉलिसी के संबंध में यह औपचारिक शिकायत प्रस्तुत कर रहा/रही हूँ।';
  },
  incidentDate: (date: string) => `यह घटना ${date} को हुई थी।`,
  counterparty: (company: string) => `रिपोर्ट किया गया पक्ष या प्राप्तकर्ता: ${company}`,
  referencePolicy: (ref: string) => `पॉलिसी या दावा संदर्भ: ${ref}`,
  referenceAccount: (ref: string) => `खाता या विवाद संदर्भ: ${ref}`,
  referenceOrder: (ref: string) => `ऑर्डर संदर्भ संख्या: ${ref}`,
  referenceTransaction: (ref: string) => `लेन-देन संदर्भ ID: ${ref}`,
  detailsHeading: 'विवरण:',
  requestedActionHeading: 'अनुरोधित कार्रवाई:',
  thankYou: 'धन्यवाद।',
  sincerely: 'भवदीय,',
};
