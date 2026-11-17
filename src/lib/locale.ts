import { AppLanguage } from '../copy/types';

/**
 * Detects device language using the standard Intl API.
 * Defaults to 'en' if undetectable or not supported.
 */
export function detectDeviceLanguage(): AppLanguage {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
      if (locale.startsWith('hi')) return 'hi';
      if (locale.startsWith('gu')) return 'gu';
    }
  } catch {
    // Ignore and fallback
  }
  return 'en';
}
