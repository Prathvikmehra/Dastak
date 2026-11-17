import { IssueLadder, IssueType } from './types';
import { en } from '../../copy/en';
import { Copy } from '../../copy/types';

export interface LadderStepDefinition {
  id: string;
  dayOffset: number;
  phone?: string;
  link?: string;
}

export interface IssueLadderDefinition {
  issueType: IssueType;
  evidenceKeys: string[];
  steps: LadderStepDefinition[];
}

export const LADDER_DEFINITIONS: Record<IssueType, IssueLadderDefinition> = {
  refund: {
    issueType: 'refund',
    evidenceKeys: ['orderId', 'invoice', 'chat', 'deliveryDate'],
    steps: [
      { id: 'refund-step-0', dayOffset: 0 },
      {
        id: 'refund-step-7',
        dayOffset: 7,
        phone: '1915',
        link: 'https://consumerhelpline.gov.in',
      },
      { id: 'refund-step-30', dayOffset: 30, link: 'https://e-jagriti.gov.in' },
    ],
  },
  fraud: {
    issueType: 'fraud',
    evidenceKeys: ['txId', 'messages', 'scammerInfo', 'smsAlert'],
    steps: [
      { id: 'fraud-step-0', dayOffset: 0, phone: '1930' },
      { id: 'fraud-step-1', dayOffset: 1, link: 'https://cybercrime.gov.in' },
      { id: 'fraud-step-30', dayOffset: 30, link: 'https://cms.rbi.org.in' },
    ],
  },
  bank: {
    issueType: 'bank',
    evidenceKeys: ['accountRef', 'bankStatement', 'complaintRef'],
    steps: [
      { id: 'bank-step-0', dayOffset: 0 },
      { id: 'bank-step-30', dayOffset: 30, link: 'https://cms.rbi.org.in' },
    ],
  },
  insurance: {
    issueType: 'insurance',
    evidenceKeys: ['policyNum', 'claimNum', 'rejectionLetter', 'medicalBills'],
    steps: [
      { id: 'insurance-step-0', dayOffset: 0 },
      {
        id: 'insurance-step-15',
        dayOffset: 15,
        link: 'https://bimabharosa.irdai.gov.in',
      },
      { id: 'insurance-step-45', dayOffset: 45, link: 'https://cioins.co.in' },
    ],
  },
};

export function getLocalizedLadder(issueType: IssueType, copy: Copy = en): IssueLadder {
  const def = LADDER_DEFINITIONS[issueType];
  const ladderCopy = copy.ladders[issueType];
  return {
    issueType,
    title: ladderCopy.title,
    evidenceChecklist: def.evidenceKeys.map((key) => ladderCopy.evidence[key] || key),
    steps: def.steps.map((step) => {
      const stepCopy = ladderCopy.steps[step.id] || { who: '', how: '', request: '' };
      return {
        id: step.id,
        dayOffset: step.dayOffset,
        phone: step.phone,
        link: step.link,
        who: stepCopy.who,
        how: stepCopy.how,
        request: stepCopy.request,
      };
    }),
  };
}

export const LADDERS: Record<IssueType, IssueLadder> = {
  get refund() {
    return getLocalizedLadder('refund', en);
  },
  get fraud() {
    return getLocalizedLadder('fraud', en);
  },
  get bank() {
    return getLocalizedLadder('bank', en);
  },
  get insurance() {
    return getLocalizedLadder('insurance', en);
  },
};
