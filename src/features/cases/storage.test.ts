import {
  PersistentCaseStore,
  KeyValueStorage,
  migrateStoredData,
  CASES_STORAGE_KEY,
} from './storage';
import { Case } from './types';

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

describe('PersistentCaseStore with KeyValueStorage', () => {
  let fakeStorage: FakeKeyValueStorage;

  beforeEach(() => {
    fakeStorage = new FakeKeyValueStorage();
  });

  it('performs complete round trip save and restore', async () => {
    const store1 = new PersistentCaseStore(fakeStorage);
    const fixedNow = new Date(2026, 10, 15, 14, 30, 0);

    const created = await store1.create(
      {
        issueType: 'refund',
        company: 'Swiggy',
        amount: '450',
      },
      fixedNow
    );

    expect(created.createdAt).toBe(fixedNow.toISOString());

    // Create a fresh store instance from same storage
    const store2 = new PersistentCaseStore(fakeStorage);
    const list = await store2.list();

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
    expect(list[0].company).toBe('Swiggy');
    expect(list[0].amount).toBe('450');
  });

  it('migrates from missing version (raw array of cases in storage)', async () => {
    const oldCases: Case[] = [
      {
        id: 'legacy-1',
        issueType: 'bank',
        company: 'ICICI Bank',
        amount: '1200',
        reference: 'TXN1',
        incidentDate: '10 Nov 2026',
        note: '',
        createdAt: '2026-11-10T10:00:00.000Z',
        evidence: {},
      },
    ];

    // Store directly as an array without version wrapper
    await fakeStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(oldCases));

    const store = new PersistentCaseStore(fakeStorage);
    const list = await store.list();

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('legacy-1');
    expect(list[0].company).toBe('ICICI Bank');
  });

  it('safely handles corrupt JSON by copying to backup key without crashing or wiping', async () => {
    const corruptString = '{ "invalid_json": true, cases: broken ';
    await fakeStorage.setItem(CASES_STORAGE_KEY, corruptString);

    const store = new PersistentCaseStore(fakeStorage);
    const list = await store.list();

    // Does not crash and returns calm empty list
    expect(list).toEqual([]);
    expect(store.hadCorruptedData).toBe(true);

    // Verifies backup key was created with the raw string
    const backupKeys = Array.from(fakeStorage.data.keys()).filter((k) =>
      k.startsWith(`${CASES_STORAGE_KEY}_backup_`)
    );
    expect(backupKeys.length).toBe(1);
    expect(fakeStorage.data.get(backupKeys[0])).toBe(corruptString);
  });

  it('keeps at most 3 corrupt backups for cases storage and removes older ones', async () => {
    // Repeatedly load corrupt JSON 5 times
    for (let i = 1; i <= 5; i++) {
      await fakeStorage.setItem(CASES_STORAGE_KEY, `corrupt_case_content_${i}`);
      const store = new PersistentCaseStore(fakeStorage);
      await store.list();
    }

    const backupKeys = Array.from(fakeStorage.data.keys()).filter((k) =>
      k.startsWith(`${CASES_STORAGE_KEY}_backup_`)
    );
    expect(backupKeys.length).toBe(3);
  });

  it('ensures concurrent writes do not lose data', async () => {
    const store = new PersistentCaseStore(fakeStorage);

    // Fire 5 concurrent case creations simultaneously
    const promises = [1, 2, 3, 4, 5].map((i) =>
      store.create({
        issueType: 'refund',
        company: `Company ${i}`,
        amount: `${i * 100}`,
      })
    );

    await Promise.all(promises);

    const list = await store.list();
    expect(list).toHaveLength(5);

    // Verify raw JSON document has all 5 cases
    const freshStore = new PersistentCaseStore(fakeStorage);
    const freshList = await freshStore.list();
    expect(freshList).toHaveLength(5);
  });

  it('persists recoveredAmount and resolvedAt with injected clock', async () => {
    const store = new PersistentCaseStore(fakeStorage);
    const created = await store.create({
      issueType: 'fraud',
      company: 'UPI Scam',
      amount: '50000',
    });

    const resolveTime = new Date(2026, 10, 20, 16, 0, 0);
    const resolved = await store.resolve(created.id, 45000, resolveTime);

    expect(resolved.resolvedAt).toBe(resolveTime.toISOString());
    expect(resolved.recoveredAmount).toBe(45000);

    const freshStore = new PersistentCaseStore(fakeStorage);
    const fetched = await freshStore.get(created.id);

    expect(fetched?.resolvedAt).toBe(resolveTime.toISOString());
    expect(fetched?.recoveredAmount).toBe(45000);
  });
});

describe('migrateStoredData helper', () => {
  it('returns empty array for null or undefined input', () => {
    expect(migrateStoredData(null)).toEqual([]);
    expect(migrateStoredData(undefined)).toEqual([]);
  });

  it('migrates standard version 1 document', () => {
    const doc = {
      version: 1,
      cases: [{ id: 'c1', issueType: 'refund' }],
    };
    const res = migrateStoredData(doc);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('c1');
  });

  it('converts parseable legacy date to LocalDate and preserves unparseable text in legacy field', () => {
    const doc = {
      version: 1,
      cases: [
        { id: 'c1', issueType: 'refund', incidentDate: '28 Oct 2026' },
        { id: 'c2', issueType: 'fraud', incidentDate: 'last Tuesday' },
      ],
    };
    const res = migrateStoredData(doc);
    expect(res).toHaveLength(2);
    expect(res[0].incidentDate).toBe('2026-10-28');
    expect(res[0].legacyIncidentDate).toBeUndefined();

    expect(res[1].incidentDate).toBe('');
    expect(res[1].legacyIncidentDate).toBe('last Tuesday');
  });
});
