import { LocalDate } from '../../lib/dates';

export type IssueType = 'refund' | 'fraud' | 'bank' | 'insurance';

export interface Case {
  id: string;
  issueType: IssueType;
  company: string;
  amount: string;
  reference: string;
  incidentDate: LocalDate;
  legacyIncidentDate?: string;
  note: string;
  fraudWhen?: 'hour' | 'today' | 'yesterday' | 'earlier';
  createdAt: string; // ISO string
  evidence: Record<string, boolean>;
  userName?: string;
  resolvedAt?: string;
  recoveredAmount?: number;
}

export interface CaseInput {
  issueType: IssueType;
  company?: string;
  amount?: string;
  reference?: string;
  incidentDate?: LocalDate;
  legacyIncidentDate?: string;
  note?: string;
  userName?: string;
  fraudWhen?: 'hour' | 'today' | 'yesterday' | 'earlier';
}

export interface CaseStore {
  list(): Promise<Case[]>;
  get(id: string): Promise<Case | null>;
  create(input: CaseInput, now?: Date): Promise<Case>;
  update(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<Case>;
  resolve(id: string, recoveredAmount?: number, now?: Date): Promise<Case>;
  clear?(): Promise<void>;
}

export type ScriptId = 'cyber1930' | 'nch1915' | 'rbi14448';

export interface LadderStep {
  id: string;
  dayOffset: number;
  who: string;
  how: string;
  request: string;
  link?: string;
  phone?: string;
  scriptId?: ScriptId;
  draftRecipient?: string;
  verifiedOn?: '2026-11-26' | null;
  verifiedAgainst?: string | null;
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
