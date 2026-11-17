import { LadderCopy } from '../types';

export const enLadders: Record<'refund' | 'fraud' | 'bank' | 'insurance', LadderCopy> = {
  refund: {
    title: 'Refund dispute',
    evidence: {
      orderId: 'Order ID',
      invoice: 'Invoice or screenshot',
      chatLog: 'Chat or email with seller',
      bankProof: 'Bank statement showing debit',
    },
    steps: {
      seller: {
        who: 'Seller support',
        how: 'Send a formal email or message through their app or support portal. Attach your order ID and invoice.',
        request: 'I request a full refund of the amount within 7 days.',
      },
      payment: {
        who: 'Payment app or gateway',
        how: 'Open the transaction in your payment app and tap report a problem. Quote the seller ticket number.',
        request:
          'I request your assistance in reversing this charge since goods were returned or not delivered.',
      },
      nch: {
        who: 'National Consumer Helpline',
        how: 'Call 1915 or register on consumerhelpline.gov.in. Keep your order and payment details ready.',
        request:
          'I request the helpline to register my grievance against the seller for non-refund.',
      },
      consumer_commission: {
        who: 'District Consumer Commission',
        how: 'File online via e-daakhil.nic.in. The commission can order a refund and compensation.',
        request: 'I request an order directing the seller to refund the disputed sum.',
      },
    },
  },
  fraud: {
    title: 'UPI or payment fraud',
    evidence: {
      utr: 'UTR or UPI reference number',
      screenshot: 'Screenshot of payment confirmation',
      passbook: 'Bank statement or passbook page',
      phone: 'Phone number or UPI ID fraudster used',
    },
    steps: {
      cybercell: {
        who: 'Cyber Crime Helpline 1930',
        how: 'Call 1930 immediately. Give the transaction ID, bank name, and time of debit so the beneficiary account can be frozen quickly.',
        request:
          'I request you to register this complaint, freeze the recipient account where possible, and record a fraud report.',
      },
      bank: {
        who: 'Your bank branch and fraud desk',
        how: 'Submit a written dispute form at your home branch. Quote the 1930 complaint number.',
        request:
          'I request you to investigate, freeze the receiving account where possible and reverse the debit.',
      },
      ncrp: {
        who: 'National Cyber Crime Reporting Portal',
        how: 'File on cybercrime.gov.in. Download the acknowledgment slip.',
        request: 'I request formal investigation and legal recording of this financial cybercrime.',
      },
      rbi_ombudsman: {
        who: 'RBI Ombudsman',
        how: 'If your bank rejects or does not reply within 30 days, complain at cms.rbi.org.in citing the limited liability guidelines for electronic transactions.',
        request:
          'I request the Banking Ombudsman to direct the bank to restore the disputed funds under RBI zero-liability norms.',
      },
    },
  },
  bank: {
    title: 'Bank or card dispute',
    evidence: {
      accountNum: 'Account or card number',
      statement: 'Bank statement showing error',
      atmSlip: 'ATM slip or transaction SMS',
      branchLetter: 'Copy of written complaint to branch',
    },
    steps: {
      branch: {
        who: 'Home branch manager',
        how: 'Submit a letter in person or by email. Get an acknowledgment stamp or ticket number.',
        request: 'I request you to investigate, correct the error and reply in writing.',
      },
      nodal: {
        who: 'Principal Nodal Officer',
        how: 'Escalate to the Principal Nodal Officer of your bank. Find their contact on the bank website.',
        request: 'I request an independent escalation review of my unresolved branch grievance.',
      },
      rbi_ombudsman: {
        who: 'RBI Ombudsman',
        how: 'Complain on cms.rbi.org.in 30 days after branch submission if unresolved. Can award up to ₹20 lakh compensation.',
        request:
          'I request the Ombudsman to investigate this dispute and direct the bank to correct the account balance.',
      },
    },
  },
  insurance: {
    title: 'Insurance claim dispute',
    evidence: {
      policyDoc: 'Policy document and schedule',
      rejectionLetter: 'Claim rejection letter or email',
      bills: 'Hospital or repair bills',
      discharge: 'Discharge summary or claim form',
    },
    steps: {
      gro: {
        who: 'Grievance Redressal Officer (GRO)',
        how: 'Submit a formal written grievance to the insurer GRO. The insurer must resolve within 14 days.',
        request:
          'I request you to reconsider and settle the claim, or give the specific policy clause relied on for rejection.',
      },
      bima_bharosa: {
        who: 'IRDAI Bima Bharosa',
        how: 'Register on bimabharosa.irdai.gov.in or call 155255. IRDAI tracks insurer turnaround times.',
        request:
          'I request IRDAI to record this claim grievance against the insurer for non-settlement.',
      },
      insurance_ombudsman: {
        who: 'Insurance Ombudsman',
        how: 'File with the Ombudsman for your region within one year of GRO rejection. Hearing is free and can order the insurer to pay.',
        request:
          'I request the Insurance Ombudsman to adjudicate this dispute and direct settlement of the claim.',
      },
    },
  },
};

export const enCallScript = {
  openers: {
    fraud: 'Hello, I want to report an online payment fraud.',
    refund: 'Hello, I want to report an unreturned refund from a seller.',
    bank: 'Hello, I want to dispute a transaction with my bank.',
    insurance: 'Hello, I am calling regarding a rejected insurance claim.',
  },
  amount: (amt: string) => `The disputed amount is ${amt}.`,
  companies: {
    fraud: (company: string) => `The suspected recipient or platform is ${company}.`,
    refund: (company: string) => `The order was placed with ${company}.`,
    bank: (company: string) => `The company or bank involved is ${company}.`,
    insurance: (company: string) => `The company or insurer involved is ${company}.`,
  },
  reference: (ref: string) => `The reference ID is ${ref}.`,
  incidentDate: (date: string) => `The incident occurred on ${date}.`,
  generalFallback1: 'I need to register this formal dispute on your helpline.',
  generalFallback2: 'I have my account and transaction records ready to share.',
  closers: {
    fraud: 'Please help me record this complaint and freeze the recipient account.',
    nch: 'Please help me register this complaint with the National Consumer Helpline.',
    general: 'Please record my grievance and provide a complaint reference number.',
  },
};
