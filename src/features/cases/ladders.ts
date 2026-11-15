import { IssueLadder, IssueType } from './types';

export const LADDERS: Record<IssueType, IssueLadder> = {
  refund: {
    issueType: 'refund',
    title: 'Failed online refund',
    evidenceChecklist: [
      'Order ID',
      'Invoice or screenshot',
      'Chat or email with seller',
      'Promised delivery date',
    ],
    steps: [
      {
        id: 'refund-step-0',
        dayOffset: 0,
        who: 'Seller grievance officer',
        how: 'Send the complaint to the seller grievance officer and ask for resolution within 7 days. Keep a copy of your email or chat.',
        request: 'I request a full refund of the amount within 7 days.',
      },
      {
        id: 'refund-step-7',
        dayOffset: 7,
        who: 'National Consumer Helpline',
        phone: '1915',
        link: 'https://consumerhelpline.gov.in',
        how: 'Call 1915, send a message on WhatsApp to 8800001915, or register your dispute on the National Consumer Helpline portal.',
        request: 'I request a full refund of the amount within 7 days.',
      },
      {
        id: 'refund-step-30',
        dayOffset: 30,
        who: 'e-Jagriti consumer commission',
        link: 'https://e-jagriti.gov.in',
        how: 'File a formal consumer dispute online through the government e-Jagriti portal, which can order a refund.',
        request: 'I request a full refund of the amount within 7 days.',
      },
    ],
  },
  fraud: {
    issueType: 'fraud',
    title: 'UPI and payment fraud',
    evidenceChecklist: [
      'Transaction ID',
      'Screenshots of messages or calls',
      'Scammer number or UPI ID',
      'Bank SMS alert',
    ],
    steps: [
      {
        id: 'fraud-step-0',
        dayOffset: 0,
        who: 'Cybercrime helpline',
        phone: '1930',
        how: 'Call 1930 immediately today, then tell your bank. Reporting within 24 hours improves the chance of recovery before the scammer withdraws the money.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
      {
        id: 'fraud-step-1',
        dayOffset: 1,
        who: 'Cybercrime portal',
        link: 'https://cybercrime.gov.in',
        how: 'Register your formal financial fraud complaint on the National Cyber Crime portal with transaction IDs and call screenshots.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
      {
        id: 'fraud-step-30',
        dayOffset: 30,
        who: 'RBI complaint portal',
        link: 'https://cms.rbi.org.in',
        how: 'File a complaint with the Reserve Bank of India Ombudsman via CMS portal if your bank failed to reverse the fraudulent debit within 30 days.',
        request:
          'I request you to investigate this matter, freeze the receiving account where possible, and reverse the debit.',
      },
    ],
  },
  bank: {
    issueType: 'bank',
    title: 'Bank account dispute',
    evidenceChecklist: [
      'Account or card last 4 digits',
      'Statement showing the issue',
      'Complaint reference from the bank',
    ],
    steps: [
      {
        id: 'bank-step-0',
        dayOffset: 0,
        who: 'Bank grievance team',
        how: 'Submit your written dispute to your bank grievance team or nodal desk and collect a reference ticket number.',
        request:
          'I request you to investigate this matter, correct the error, and reply to me in writing.',
      },
      {
        id: 'bank-step-30',
        dayOffset: 30,
        who: 'RBI complaint portal',
        link: 'https://cms.rbi.org.in',
        how: 'Escalate to the Reserve Bank of India Ombudsman on the CMS portal if the bank does not resolve the dispute within 30 days.',
        request:
          'I request you to investigate this matter, correct the error, and reply to me in writing.',
      },
    ],
  },
  insurance: {
    issueType: 'insurance',
    title: 'Insurance claim rejection',
    evidenceChecklist: [
      'Policy number',
      'Claim number',
      'Rejection letter',
      'Medical or loss documents',
    ],
    steps: [
      {
        id: 'insurance-step-0',
        dayOffset: 0,
        who: 'Insurer grievance officer',
        how: 'Send a formal reconsideration letter to your insurance company grievance officer quoting your policy number and doctor reports.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
      {
        id: 'insurance-step-15',
        dayOffset: 15,
        who: 'IRDAI Bima Bharosa',
        link: 'https://bimabharosa.irdai.gov.in',
        how: 'Register a complaint on the IRDAI Bima Bharosa portal if the insurer rejects without valid reason or does not respond within 15 days.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
      {
        id: 'insurance-step-45',
        dayOffset: 45,
        who: 'Insurance Ombudsman',
        link: 'https://cioins.co.in',
        how: 'File a complaint with the Insurance Ombudsman in your state for an independent hearing, which can order the insurer to pay.',
        request:
          'I request you to reconsider and settle the claim, or provide in writing the specific policy clause relied on for rejection.',
      },
    ],
  },
};
