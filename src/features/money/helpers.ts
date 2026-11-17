import { MoneyPlaceStatus, MoneySummary, PlaceRecord } from './types';
import { PLACES } from './places';
import { parseAmount } from '../../lib/formatters';

export const STATUS_LABELS: Record<MoneyPlaceStatus, string> = {
  not_checked: 'Not checked yet',
  checked_nothing: 'Checked and found nothing',
  found_money: 'Found money',
  claim_started: 'Claim started',
  money_received: 'Money received',
};

/**
 * Pure function that computes summary counts and amounts for a person's radar records.
 */
export function summarize(records: Record<string, PlaceRecord> | undefined): MoneySummary {
  const total = PLACES.length;
  if (!records) {
    return {
      checked: 0,
      total,
      found: 0,
      claimed: 0,
      received: 0,
    };
  }

  let checked = 0;
  let found = 0;
  let claimed = 0;
  let received = 0;

  for (const place of PLACES) {
    const rec = records[place.id];
    if (rec && rec.status && rec.status !== 'not_checked') {
      checked++;
      const amt = (rec.amount ? parseAmount(rec.amount) : 0) ?? 0;
      if (rec.status === 'found_money') {
        found += amt;
      } else if (rec.status === 'claim_started') {
        claimed += amt;
      } else if (rec.status === 'money_received') {
        received += amt;
      }
    }
  }

  return {
    checked,
    total,
    found,
    claimed,
    received,
  };
}

/**
 * Pure function that calculates a follow-up reminder date at 9:00 AM local time N days ahead.
 */
export function followUpDate(now: Date, days: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 9, 0, 0, 0);
}
