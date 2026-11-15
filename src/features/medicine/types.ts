export interface MedicineComparison {
  id: string;
  prescribedBrand: string;
  genericSalt: string;
  brandPrice: number;
  genericPrice: number;
  savingsPercentage: number;
}
