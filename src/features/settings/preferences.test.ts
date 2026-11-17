import {
  PersistentPreferencesStore,
  migratePreferences,
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
} from './preferences';
import { KeyValueStorage, backupCorruptData } from '../cases/storage';

class FakeKeyValueStorage implements KeyValueStorage {
  public data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }

  async getAllKeys(): Promise<readonly string[]> {
    return Array.from(this.data.keys());
  }
}

describe('Preferences persistence and migration', () => {
  let fakeStorage: FakeKeyValueStorage;

  beforeEach(() => {
    fakeStorage = new FakeKeyValueStorage();
  });

  it('performs round trip save and restore of preferences', async () => {
    const store1 = new PersistentPreferencesStore(fakeStorage);
    await store1.set({ remindersEnabled: true, language: 'hi' });

    const store2 = new PersistentPreferencesStore(fakeStorage);
    const prefs = await store2.get();

    expect(prefs.remindersEnabled).toBe(true);
    expect(prefs.language).toBe('hi');
  });

  it('migrates raw object without version correctly', () => {
    const raw = { remindersEnabled: true, language: 'mr' };
    const migrated = migratePreferences(raw);
    expect(migrated.remindersEnabled).toBe(true);
    expect(migrated.language).toBe('mr');
  });

  it('handles null, undefined, or primitive corrupt inputs safely', () => {
    expect(migratePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(migratePreferences('broken')).toEqual(DEFAULT_PREFERENCES);
    expect(migratePreferences(1234)).toEqual(DEFAULT_PREFERENCES);
  });

  it('recovers from corrupt JSON, archives backup, and falls back to defaults', async () => {
    const corruptStr = '{"invalid_json": ';
    await fakeStorage.setItem(PREFERENCES_STORAGE_KEY, corruptStr);

    const store = new PersistentPreferencesStore(fakeStorage);
    const prefs = await store.get();

    expect(prefs).toEqual(DEFAULT_PREFERENCES);
    expect(store.hadCorruptedData).toBe(true);

    const backupKeys = Array.from(fakeStorage.data.keys()).filter((k) =>
      k.startsWith(`${PREFERENCES_STORAGE_KEY}_backup_`)
    );
    expect(backupKeys.length).toBe(1);
    expect(fakeStorage.data.get(backupKeys[0])).toBe(corruptStr);
  });

  it('keeps at most the 3 most recent corrupt backups per storage key and deletes older ones', async () => {
    const baseTime = 1700000000000;

    // Create 5 corrupt backups with increasing timestamps
    for (let i = 1; i <= 5; i++) {
      await backupCorruptData(
        fakeStorage,
        PREFERENCES_STORAGE_KEY,
        `corrupt_content_${i}`,
        baseTime + i * 1000
      );
    }

    const backupKeys = Array.from(fakeStorage.data.keys())
      .filter((k) => k.startsWith(`${PREFERENCES_STORAGE_KEY}_backup_`))
      .sort();

    // Exactly 3 backups must remain
    expect(backupKeys.length).toBe(3);

    // Oldest backups (1 and 2) must be deleted; 3, 4, 5 must remain
    const remainingValues = backupKeys.map((k) => fakeStorage.data.get(k));
    expect(remainingValues).toContain('corrupt_content_3');
    expect(remainingValues).toContain('corrupt_content_4');
    expect(remainingValues).toContain('corrupt_content_5');
    expect(remainingValues).not.toContain('corrupt_content_1');
    expect(remainingValues).not.toContain('corrupt_content_2');
  });
});
