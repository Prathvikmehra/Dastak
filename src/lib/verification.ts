import { isLocalDate, toDisplay } from './dates';

export function isHttpsUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.trim().startsWith('https://');
}

export function isContactVerified(
  verifiedOn?: string | null,
  verifiedAgainst?: string | null
): boolean {
  if (!verifiedOn || !isLocalDate(verifiedOn)) return false;
  return isHttpsUrl(verifiedAgainst);
}

export function getVerificationLabel(
  verifiedOn: string | null | undefined,
  verifiedAgainst: string | null | undefined,
  copy: { checkedOn: (date: string) => string; notCheckedYet: string }
): string {
  if (isContactVerified(verifiedOn, verifiedAgainst) && verifiedOn) {
    return copy.checkedOn(toDisplay(verifiedOn));
  }
  return copy.notCheckedYet;
}
