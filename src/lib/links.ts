import { Linking } from 'react-native';
import { en } from '../copy/en';

export type UrlOpener = (url: string) => Promise<boolean | void>;

export interface LinkResult {
  success: boolean;
  url: string;
  fallbackMessage?: string;
}

/**
 * Attempts to open a phone dialer.
 * If opening fails, invokes onFail with a plain message containing the phone number
 * so the user can dial it manually.
 */
export async function openPhone(
  phoneNumber: string,
  onFail?: (fallbackMessage: string) => void,
  opener: UrlOpener = (url) => Linking.openURL(url)
): Promise<LinkResult> {
  const sanitized = phoneNumber.replace(/[^\d+]/g, '');
  const url = `tel:${sanitized}`;
  try {
    await opener(url);
    return { success: true, url };
  } catch {
    const fallbackMessage = en.common.couldNotOpenDialer(phoneNumber);
    if (onFail) {
      onFail(fallbackMessage);
    }
    return { success: false, url, fallbackMessage };
  }
}

/**
 * Attempts to open a web URL.
 * If opening fails, invokes onFail with a plain message containing the URL
 * so the user can visit it manually.
 */
export async function openWeb(
  webUrl: string,
  onFail?: (fallbackMessage: string) => void,
  opener: UrlOpener = (url) => Linking.openURL(url)
): Promise<LinkResult> {
  try {
    await opener(webUrl);
    return { success: true, url: webUrl };
  } catch {
    const fallbackMessage = en.common.couldNotOpenBrowser(webUrl);
    if (onFail) {
      onFail(fallbackMessage);
    }
    return { success: false, url: webUrl, fallbackMessage };
  }
}
