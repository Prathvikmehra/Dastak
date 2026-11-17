import { summarize, followUpDate } from './helpers';
import { PersistentMoneyStore, migrateMoneyData, DEFAULT_PERSON, MONEY_STORAGE_KEY } from './store';
import { PlaceRecord } from './types';
import { KeyValueStorage } from '../cases/storage';

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

describe('Money radar pure helpers', () => {
  describe('summarize pure function', () => {
    it('returns zeroes when records are empty or undefined', () => {
      const empty = summarize(undefined);
      expect(empty).toEqual({
        checked: 0,
        total: 6,
        found: 0,
        claimed: 0,
        received: 0,
      });
    });

    it('correctly tallies checked places and aggregates amounts using parseAmount', () => {
      const records: Record<string, PlaceRecord> = {
        udgam: {
          placeId: 'udgam',
          status: 'found_money',
          amount: '₹ 12,500',
          updatedAt: new Date().toISOString(),
        },
        bimabharosa: {
          placeId: 'bimabharosa',
          status: 'claim_started',
          amount: '5000',
          updatedAt: new Date().toISOString(),
        },
        mfcentral: {
          placeId: 'mfcentral',
          status: 'money_received',
          amount: 'Rs. 2,000',
          updatedAt: new Date().toISOString(),
        },
        iepf: {
          placeId: 'iepf',
          status: 'checked_nothing',
          updatedAt: new Date().toISOString(),
        },
        epfo: {
          placeId: 'epfo',
          status: 'not_checked',
          updatedAt: new Date().toISOString(),
        },
      };

      const res = summarize(records);

      // 4 places checked (udgam, bimabharosa, mfcentral, iepf)
      expect(res.checked).toBe(4);
      expect(res.total).toBe(6);
      expect(res.found).toBe(12500);
      expect(res.claimed).toBe(5000);
      expect(res.received).toBe(2000);
    });
  });

  describe('followUpDate pure function', () => {
    it('returns 9:00 AM local time exactly N days in the future', () => {
      const now = new Date(2026, 10, 15, 14, 30, 0); // Nov 15
      const followUp = followUpDate(now, 7);

      expect(followUp.getFullYear()).toBe(2026);
      expect(followUp.getMonth()).toBe(10);
      expect(followUp.getDate()).toBe(22); // Nov 15 + 7 = Nov 22
      expect(followUp.getHours()).toBe(9);
      expect(followUp.getMinutes()).toBe(0);
      expect(followUp.getSeconds()).toBe(0);
    });
  });
});

describe('PersistentMoneyStore integration', () => {
  let fakeStorage: FakeKeyValueStorage;

  beforeEach(() => {
    fakeStorage = new FakeKeyValueStorage();
  });

  it('performs complete round trip save, reload, and verification', async () => {
    const store1 = new PersistentMoneyStore(fakeStorage);
    const people = await store1.listPeople();
    expect(people).toHaveLength(1);
    expect(people[0]).toEqual(DEFAULT_PERSON);

    await store1.updatePlaceRecord('me', 'udgam', {
      status: 'found_money',
      amount: '15000',
      note: 'Found in SBI',
    });

    const store2 = new PersistentMoneyStore(fakeStorage);
    const recs = await store2.getPersonRecords('me');

    expect(recs.udgam).toBeDefined();
    expect(recs.udgam.status).toBe('found_money');
    expect(recs.udgam.amount).toBe('15000');
    expect(recs.udgam.note).toBe('Found in SBI');
  });

  it('safely migrates corrupt JSON by keeping backup and starting fresh', async () => {
    const corruptStr = '{"broken": true, records:';
    await fakeStorage.setItem(MONEY_STORAGE_KEY, corruptStr);

    const store = new PersistentMoneyStore(fakeStorage);
    const people = await store.listPeople();

    expect(people).toHaveLength(1);
    expect(people[0]).toEqual(DEFAULT_PERSON);
    expect(store.hadCorruptedData).toBe(true);

    const backupKeys = Array.from(fakeStorage.data.keys()).filter((k) =>
      k.startsWith(`${MONEY_STORAGE_KEY}_backup_`)
    );
    expect(backupKeys.length).toBe(1);
    expect(fakeStorage.data.get(backupKeys[0])).toBe(corruptStr);
  });

  it('migrates legacy or missing structure safely', () => {
    const raw = {
      people: [{ id: 'p1', name: 'Father', relationship: 'Parent' }],
      records: { p1: { udgam: { placeId: 'udgam', status: 'checked_nothing' } } },
    };
    const migrated = migrateMoneyData(raw);

    // Guaranteed to include default "Me" plus the migrated person
    expect(migrated.people.some((p) => p.id === 'me')).toBe(true);
    expect(migrated.people.some((p) => p.id === 'p1')).toBe(true);
    expect(migrated.records.p1.udgam.status).toBe('checked_nothing');
  });

  it('keeps records for two separate people completely isolated', async () => {
    const store = new PersistentMoneyStore(fakeStorage);

    const me = (await store.listPeople())[0];
    const father = await store.addPerson('Father', 'Parent');

    // Update place for Me
    await store.updatePlaceRecord(me.id, 'udgam', {
      status: 'found_money',
      amount: '25000',
    });

    // Update place for Father
    await store.updatePlaceRecord(father.id, 'udgam', {
      status: 'checked_nothing',
    });

    const meSummary = await store.getSummary(me.id);
    const fatherSummary = await store.getSummary(father.id);

    expect(meSummary.found).toBe(25000);
    expect(fatherSummary.found).toBe(0);
    expect(fatherSummary.checked).toBe(1);
  });
});
