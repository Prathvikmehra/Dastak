export type CaseIssueType = 'upi_fraud' | 'refund_failed' | 'bank_dispute' | 'insurance_claim';

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
    id: 'upi_fraud',
    title: 'UPI and payment fraud',
    description: 'Money sent to wrong number or fake QR code',
    iconName: 'flash-outline',
  },
  {
    id: 'refund_failed',
    title: 'Failed online refund',
    description: 'Order cancelled but money not returned',
    iconName: 'refresh-outline',
  },
  {
    id: 'bank_dispute',
    title: 'Bank account dispute',
    description: 'Wrong deduction or ATM failed transaction',
    iconName: 'business-outline',
  },
  {
    id: 'insurance_claim',
    title: 'Insurance claim rejection',
    description: 'Hospital or vehicle claim stopped without reason',
    iconName: 'shield-checkmark-outline',
  },
];
