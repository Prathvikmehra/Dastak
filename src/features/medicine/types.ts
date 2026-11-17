export interface Medicine {
  id: string;
  personId: string;
  name: string;
  brandPricePerStrip: string;
  genericPricePerStrip?: string;
  stripsPerMonth: number;
  lastRefillDate?: string;
  refillEveryDays?: number;
  note?: string;
}

export interface MedicineTotals {
  monthlySpend: number;
  monthlySaving: number | null;
  yearlySaving: number | null;
}
