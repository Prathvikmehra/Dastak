import { KeyValueStorage, asyncStorageAdapter, backupCorruptData } from '../cases/storage';
import { logger } from '../../lib/logger';
import { detectDeviceLanguage } from '../../lib/locale';

export interface UserPreferences {
  remindersEnabled: boolean;
  language: string;
}

export const PREFERENCES_STORAGE_KEY = 'dastak_prefs_v1';
export const CURRENT_PREFS_VERSION = 1;

export const DEFAULT_PREFERENCES: UserPreferences = {
  remindersEnabled: false,
  language: detectDeviceLanguage(),
};

export interface StoredPreferencesDocument {
  version: number;
  preferences: UserPreferences;
}

/**
 * Migrates raw stored preferences data safely into typed UserPreferences.
 */
export function migratePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PREFERENCES };
  }

  const obj = raw as Record<string, unknown>;
  const prefsSource =
    typeof obj.preferences === 'object' && obj.preferences !== null
      ? (obj.preferences as Record<string, unknown>)
      : obj;

  return {
    remindersEnabled: Boolean(prefsSource.remindersEnabled),
    language:
      typeof prefsSource.language === 'string' ? prefsSource.language : detectDeviceLanguage(),
  };
}

export interface PreferencesStore {
  get(): Promise<UserPreferences>;
  set(updates: Partial<UserPreferences>): Promise<UserPreferences>;
  hadCorruptedData: boolean;
}

export class PersistentPreferencesStore implements PreferencesStore {
  private storage: KeyValueStorage;
  private storageKey: string;
  private prefs: UserPreferences = { ...DEFAULT_PREFERENCES };
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  public hadCorruptedData = false;

  constructor(
    storage: KeyValueStorage = asyncStorageAdapter,
    storageKey = PREFERENCES_STORAGE_KEY
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    if (!this.initPromise) {
      this.initPromise = this.loadFromStorage();
    }
    await this.initPromise;
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const rawStr = await this.storage.getItem(this.storageKey);
      if (!rawStr) {
        this.prefs = { ...DEFAULT_PREFERENCES };
        this.isInitialized = true;
        return;
      }
      try {
        const parsed = JSON.parse(rawStr);
        this.prefs = migratePreferences(parsed);
      } catch {
        await backupCorruptData(this.storage, this.storageKey, rawStr);
        this.hadCorruptedData = true;
        this.prefs = { ...DEFAULT_PREFERENCES };
      }
    } catch (err) {
      logger.error('Failed reading user preferences from storage', err);
      this.prefs = { ...DEFAULT_PREFERENCES };
    } finally {
      this.isInitialized = true;
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const doc: StoredPreferencesDocument = {
        version: CURRENT_PREFS_VERSION,
        preferences: this.prefs,
      };
      await this.storage.setItem(this.storageKey, JSON.stringify(doc));
    });
    return this.writeQueue;
  }

  async get(): Promise<UserPreferences> {
    await this.ensureInitialized();
    return { ...this.prefs };
  }

  async set(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await this.ensureInitialized();
    this.prefs = {
      ...this.prefs,
      ...updates,
    };
    await this.persist();
    return { ...this.prefs };
  }
}

export const defaultPreferencesStore = new PersistentPreferencesStore();
