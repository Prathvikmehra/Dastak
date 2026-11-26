import { LadderCopy, CallScriptCopy } from '../types/domain';

export const enLadders: Record<'refund' | 'fraud' | 'bank' | 'insurance', LadderCopy> = {
  refund: {
    title: 'Failed online refund',
    evidence: {
      orderId: 'Order ID',
      invoice: 'Invoice or screenshot',
      chat: 'Chat or email with seller',
      deliveryDate: 'Promised delivery date',
    },
    steps: {
      'refund-step-0': {
        who: 'Seller grievance officer',
        how: 'Send the complaint to the seller grievance officer and ask for resolution within 7 days. Keep a copy of your email or chat.',
        request: 'I request a full refund of the amount within 7 days.',
      },
      'refund-step-7': {
        who: 'National Consumer Helpline',
        how: 'Call 1915, send a message on WhatsApp to 8800001915, or register your dispute on the National Consumer Helpline portal. You can speak Hindi or Gujarati on 1915.',
        request: 'I request a full refund of the amount within 7 days.',
      },
      'refund-step-30': {
        who: 'e-Jagriti consumer commission',
        how: 'File a formal consumer dispute online through the government e-Jagriti portal, which can order a refund.',
        request: 'I request a full refund of the amount within 7 days.',
      },
    },
  },
  fraud: {
    title: 'UPI and payment fraud',
    evidence: {
      txId: 'Transaction ID',
      messages: 'Screenshots of messages or calls',
      scammerInfo: 'Scammer number or UPI ID',
      smsAlert: 'Bank SMS alert',
    },
    steps: {
      'fraud-step-0': {
        who: 'Cybercrime helpline',
        how: 'Call 1930 immediately today, then tell your bank. Reporting within 24 hours improves the chance of recovery before the scammer withdraws the money. Write down the acknowledgement number you are given. Also tell your bank. Reporting to 1930 does not replace telling your bank.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
      'fraud-step-1': {
        who: 'Cybercrime portal',
        how: 'Register your formal financial fraud complaint on the National Cyber Crime portal with transaction IDs and call screenshots.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
      'fraud-step-30': {
        who: 'RBI Ombudsman',
        how: 'Complain to your bank in writing and keep the proof. If they do not reply in 30 days (some fraud and card cases have longer limits), or you are not happy with the reply, you can complain to the RBI Ombudsman for free at cms.rbi.org.in. Do this within 90 days. Not every company is covered. For help, call RBI on 14448.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
    },
  },
  bank: {
    title: 'Bank account dispute',
    evidence: {
      accountRef: 'Account or card last 4 digits',
      bankStatement: 'Statement showing the issue',
      complaintRef: 'Complaint reference from the bank',
    },
    steps: {
      'bank-step-0': {
        who: 'Bank grievance team',
        how: 'Submit your written dispute to your bank grievance team or nodal desk and collect a reference ticket number.',
        request:
          'I request you to investigate this matter, correct the error, and reply to me in writing.',
      },
      'bank-step-30': {
        who: 'RBI Ombudsman',
        how: 'Complain to your bank in writing and keep the proof. If they do not reply in 30 days (some fraud and card cases have longer limits), or you are not happy with the reply, you can complain to the RBI Ombudsman for free at cms.rbi.org.in. Do this within 90 days. Not every company is covered. For help, call RBI on 14448.',
        request:
          'I request you to investigate this matter, correct the error, and reply to me in writing.',
      },
    },
  },
  insurance: {
    title: 'Insurance claim rejection',
    evidence: {
      policyNum: 'Policy number',
      claimNum: 'Claim number',
      rejectionLetter: 'Rejection letter',
      medicalBills: 'Medical or loss documents',
    },
    steps: {
      'insurance-step-0': {
        who: 'Insurer grievance officer',
        how: 'Send a formal reconsideration letter to your insurance company grievance officer quoting your policy number and doctor reports.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
      'insurance-step-15': {
        who: 'IRDAI Bima Bharosa',
        how: 'Register a complaint on the IRDAI Bima Bharosa portal if the insurer rejects without valid reason or does not respond within 15 days.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
      'insurance-step-45': {
        who: 'Insurance Ombudsman',
        how: 'File a complaint with the Insurance Ombudsman in your state for an independent hearing, which can order the insurer to pay.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
    },
  },
};

export const enCallScript: CallScriptCopy = {
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
    fraud:
      'Please help me record this complaint and freeze the recipient account. Write down the acknowledgement number you are given. Also tell your bank. Reporting to 1930 does not replace telling your bank.',
    nch: 'Please help me register this complaint with the National Consumer Helpline.',
    general: 'Please record my grievance and provide a complaint reference number.',
  },
};
