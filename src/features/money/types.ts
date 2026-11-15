export type UnclaimedCategory = 'bank_deposit' | 'insurance_policy' | 'provident_fund';

export interface UnclaimedAsset {
  id: string;
  source: string;
  category: UnclaimedCategory;
  holderName: string;
  estimatedAmount: number;
  status: 'found' | 'in_claim';
}

export interface MoneyRadarCardInfo {
  title: string;
  description: string;
  iconName: 'search-outline';
}
