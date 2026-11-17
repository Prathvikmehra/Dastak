import { Medicine, MedicineTotals } from './types';
import { parseAmount } from '../../lib/formatters';

/**
 * Calculates monthly saving for a medicine:
 * max(0, brand - generic) * stripsPerMonth.
 * Returns null if no generic price was supplied or parsed.
 */
export function monthlySaving(medicine: Medicine): number | null {
  if (medicine.genericPricePerStrip === undefined || medicine.genericPricePerStrip.trim() === '') {
    return null;
  }

  const brand = parseAmount(medicine.brandPricePerStrip);
  const generic = parseAmount(medicine.genericPricePerStrip);

  if (generic === null || brand === null) {
    return null;
  }

  const strips = Math.max(0, Number(medicine.stripsPerMonth) || 0);
  const diff = Math.max(0, brand - generic);
  return diff * strips;
}

/**
 * Aggregates monthly spend, monthly saving, and yearly saving across a list of medicines.
 * If no medicine has a generic price, monthlySaving is null.
 */
export function calculateTotals(medicines: Medicine[]): MedicineTotals {
  let totalSpend = 0;
  let totalSaving = 0;
  let hasAnyGenericPrice = false;

  for (const med of medicines) {
    const brand = parseAmount(med.brandPricePerStrip) ?? 0;
    const strips = Math.max(0, Number(med.stripsPerMonth) || 0);
    totalSpend += brand * strips;

    const saving = monthlySaving(med);
    if (saving !== null) {
      hasAnyGenericPrice = true;
      totalSaving += saving;
    }
  }

  const monthly = hasAnyGenericPrice ? totalSaving : null;
  const yearly = monthly !== null ? monthly * 12 : null;

  return {
    monthlySpend: totalSpend,
    monthlySaving: monthly,
    yearlySaving: yearly,
  };
}

/**
 * Calculates the next expected refill date at 9:00 AM local time.
 * If lastRefillDate is missing or unparseable, returns null.
 */
export function nextRefillDate(medicine: Medicine): Date | null {
  if (!medicine.lastRefillDate || !medicine.lastRefillDate.trim()) {
    return null;
  }

  const last = new Date(medicine.lastRefillDate);
  if (isNaN(last.getTime())) {
    return null;
  }

  const days = medicine.refillEveryDays ?? 30;
  return new Date(last.getFullYear(), last.getMonth(), last.getDate() + days, 9, 0, 0, 0);
}

/**
 * Returns number of whole days until refill is due (negative if past due).
 * Returns null if lastRefillDate is not set.
 */
export function refillDueIn(medicine: Medicine, now: Date): number | null {
  const next = nextRefillDate(medicine);
  if (!next) {
    return null;
  }

  const diffMs = next.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
