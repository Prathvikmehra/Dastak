export type IssueType = 'refund' | 'fraud' | 'bank' | 'insurance';

export interface Case {
  id: string;
  issueType: IssueType;
  company: string;
  amount: string;
  reference: string;
  incidentDate: string;
  note: string;
  createdAt: string; // ISO string
  evidence: Record<string, boolean>;
  resolvedAt?: string;
  recoveredAmount?: number;
}

export interface LadderStep {
  id: string;
  dayOffset: number;
  who: string;
  how: string;
  link?: string;
  phone?: string;
}

export interface IssueLadder {
  issueType: IssueType;
  title: string;
  evidenceChecklist: string[];
  steps: LadderStep[];
}

// Backward compatibility with Task 1 UI routes & components
export type CaseIssueType =
  IssueType | 'upi_fraud' | 'refund_failed' | 'bank_dispute' | 'insurance_claim';

export type CaseStatus = 'open' | 'in_progress' | 'action_needed' | 'resolved';

export interface CaseItem {
  id: string;
  issueType: CaseIssueType;
  title: string;
  description: string;
  amount?: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  nextStep: string;
}

export interface IssueDoor {
  id: CaseIssueType;
  title: string;
  description: string;
  iconName: 'flash-outline' | 'refresh-outline' | 'business-outline' | 'shield-checkmark-outline';
}

export const ISSUE_DOORS: IssueDoor[] = [
  {
    id: 'fraud',
    title: 'UPI and payment fraud',
    description: 'Money sent to wrong number or fake QR code',
    iconName: 'flash-outline',
  },
  {
    id: 'refund',
    title: 'Failed online refund',
    description: 'Order cancelled but money not returned',
    iconName: 'refresh-outline',
  },
  {
    id: 'bank',
    title: 'Bank account dispute',
    description: 'Wrong deduction or ATM failed transaction',
    iconName: 'business-outline',
  },
  {
    id: 'insurance',
    title: 'Insurance claim rejection',
    description: 'Hospital or vehicle claim stopped without reason',
    iconName: 'shield-checkmark-outline',
  },
];
