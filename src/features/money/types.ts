export type Relationship = 'Parent' | 'Spouse' | 'Someone who has passed away' | 'Other';

export interface Person {
  id: string;
  name: string;
  relationship?: Relationship;
  isDefault?: boolean;
}

export type MoneyPlaceStatus =
  'not_checked' | 'checked_nothing' | 'found_money' | 'claim_started' | 'money_received';

export interface PlaceRecord {
  placeId: string;
  status: MoneyPlaceStatus;
  amount?: string;
  note?: string;
  updatedAt: string;
}

export type ContentStatus = 'checked-against-secondary-sources' | 'general-guidance';

export interface MoneyPlace {
  id: string;
  title: string;
  subtitle: string;
  portalName: string;
  source: string | null;
  verifiedOn: null;
  contentStatus: ContentStatus;
  covers: string;
  keepReady: string[];
  howToSearch: string[];
  howToClaim: string[];
}

export interface MoneySummary {
  checked: number;
  total: number;
  found: number;
  claimed: number;
  received: number;
}
