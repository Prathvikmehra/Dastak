import { KeyValueStorage, asyncStorageAdapter } from '../cases/storage';
import { defaultCaseStore } from '../cases/store';
import { getPersistentMedicineStore } from '../medicine/store';
import { defaultPreferencesStore, PREFERENCES_STORAGE_KEY, UserPreferences } from './preferences';
import { defaultReminders } from '../cases/reminders';
import { PersistentMoneyStore } from '../money/storage';
import { logger } from '../../lib/logger';

export interface ClearableStore {
  clear: () => Promise<void>;
}

export interface PreferencesResettable {
  get: () => Promise<UserPreferences>;
  set: (updates: Partial<UserPreferences>) => Promise<UserPreferences>;
  reset: (preserveLanguage?: boolean) => Promise<UserPreferences>;
}

export interface RemindersCancelable {
  cancelAll: () => Promise<void>;
}

export interface DeleteAllResult {
  ok: boolean;
  failed: string[];
}

export interface DeleteAllServices {
  caseStore?: ClearableStore;
  moneyStore?: ClearableStore;
  medicineStore?: ClearableStore;
  preferencesStore?: PreferencesResettable;
  reminders?: RemindersCancelable;
  storage?: KeyValueStorage;
}

/**
 * Completely purges all user data from the device:
 * 1. Executes per-store clears across cases, money, medicines, reminders, preferences.
 * 2. Runs ALL steps even if one fails, collecting any failures.
 * 3. Removes EVERY AsyncStorage key starting with "dastak_" (including corrupt backups).
 * 4. Writes back ONLY the preserved language preference.
 * 5. Re-reads all keys to verify that no "dastak_" keys remain except the prefs key.
 * 6. Returns { ok: boolean, failed: string[] }.
 */
export async function deleteAllUserData(services?: DeleteAllServices): Promise<DeleteAllResult> {
  const caseStore: ClearableStore = services?.caseStore ?? defaultCaseStore;
  const moneyStore: ClearableStore = services?.moneyStore ?? new PersistentMoneyStore();
  const medicineStore: ClearableStore = services?.medicineStore ?? getPersistentMedicineStore();
  const preferencesStore: PreferencesResettable =
    services?.preferencesStore ?? defaultPreferencesStore;
  const reminders: RemindersCancelable = services?.reminders ?? defaultReminders;
  const storage: KeyValueStorage = services?.storage ?? asyncStorageAdapter;

  const failed: string[] = [];

  // Step 0: Save current language preference so it can be restored
  let preservedLanguage = 'en';
  try {
    const prefs = await preferencesStore.get();
    if (prefs?.language) {
      preservedLanguage = prefs.language;
    }
  } catch (err) {
    logger.warn('Failed to read language preference prior to delete-all', err);
  }

  // Step 1: Run per-store clears (run ALL even if one fails)
  try {
    await caseStore.clear();
  } catch (err) {
    logger.error('Failed clearing case store during delete-all', err);
    failed.push('caseStore');
  }

  try {
    await moneyStore.clear();
  } catch (err) {
    logger.error('Failed clearing money store during delete-all', err);
    failed.push('moneyStore');
  }

  try {
    await medicineStore.clear();
  } catch (err) {
    logger.error('Failed clearing medicine store during delete-all', err);
    failed.push('medicineStore');
  }

  try {
    await reminders.cancelAll();
  } catch (err) {
    logger.error('Failed cancelling reminders during delete-all', err);
    failed.push('reminders');
  }

  try {
    await preferencesStore.reset(true);
  } catch (err) {
    logger.error('Failed resetting preferences during delete-all', err);
    failed.push('preferencesStore');
  }

  // Step 2: Delete EVERY AsyncStorage key that starts with "dastak_"
  try {
    if (storage.getAllKeys) {
      const allKeys = await storage.getAllKeys();
      const dastakKeys = allKeys.filter((k) => k.startsWith('dastak_'));
      for (const key of dastakKeys) {
        await storage.removeItem(key);
      }
    }
  } catch (err) {
    logger.error('Failed wiping dastak_ keys from storage during delete-all', err);
    failed.push('storage:clean');
  }

  // Step 3: Write back only the language preference
  try {
    await preferencesStore.set({ language: preservedLanguage });
  } catch (err) {
    logger.error('Failed writing back language preference after delete-all', err);
    failed.push('preferences:writeBack');
  }

  // Step 4: Re-read getAllKeys and verify nothing starting with "dastak_" remains except prefs
  try {
    if (storage.getAllKeys) {
      const remainingKeys = await storage.getAllKeys();
      const nonPrefsDastakKeys = remainingKeys.filter(
        (k) => k.startsWith('dastak_') && k !== PREFERENCES_STORAGE_KEY
      );
      if (nonPrefsDastakKeys.length > 0) {
        logger.error(
          'Keys starting with dastak_ still remain after delete-all',
          nonPrefsDastakKeys
        );
        failed.push('storage:remaining');
      }
    }
  } catch (err) {
    logger.error('Failed verifying storage keys after delete-all', err);
    failed.push('storage:verify');
  }

  return {
    ok: failed.length === 0,
    failed,
  };
}
