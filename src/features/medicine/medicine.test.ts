import { monthlySaving, calculateTotals, nextRefillDate, refillDueIn } from './helpers';
import { PersistentMedicineStore, migrateMedicinesData, MEDICINES_STORAGE_KEY } from './store';
import { Medicine } from './types';
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

describe('Medicine Saver pure helpers', () => {
  describe('monthlySaving', () => {
    it('calculates monthly saving as max(0, brand - generic) * strips', () => {
      const med: Medicine = {
        id: 'm1',
        personId: 'me',
        name: 'Telmisartan 40mg',
        brandPricePerStrip: '180',
        genericPricePerStrip: '25',
        stripsPerMonth: 2,
      };

      // (180 - 25) * 2 = 155 * 2 = 310
      expect(monthlySaving(med)).toBe(310);
    });

    it('returns null when generic price is undefined or empty', () => {
      const medWithoutGeneric: Medicine = {
        id: 'm2',
        personId: 'me',
        name: 'Amlodipine 5mg',
        brandPricePerStrip: '90',
        stripsPerMonth: 1,
      };

      expect(monthlySaving(medWithoutGeneric)).toBeNull();

      const medWithEmptyGeneric: Medicine = {
        ...medWithoutGeneric,
        genericPricePerStrip: '   ',
      };
      expect(monthlySaving(medWithEmptyGeneric)).toBeNull();
    });

    it('returns 0 when generic price is greater than brand price', () => {
      const med: Medicine = {
        id: 'm3',
        personId: 'me',
        name: 'Special Tonic',
        brandPricePerStrip: '50',
        genericPricePerStrip: '75',
        stripsPerMonth: 1,
      };

      expect(monthlySaving(med)).toBe(0);
    });
  });

  describe('calculateTotals', () => {
    it('aggregates spend and saving across medicines', () => {
      const list: Medicine[] = [
        {
          id: 'm1',
          personId: 'me',
          name: 'Med A',
          brandPricePerStrip: '200',
          genericPricePerStrip: '50',
          stripsPerMonth: 2,
        },
        {
          id: 'm2',
          personId: 'me',
          name: 'Med B',
          brandPricePerStrip: '100',
          stripsPerMonth: 1,
        },
      ];

      const totals = calculateTotals(list);
      // Spend: (200 * 2) + (100 * 1) = 500
      expect(totals.monthlySpend).toBe(500);
      // Saving: (200 - 50) * 2 = 300
      expect(totals.monthlySaving).toBe(300);
      expect(totals.yearlySaving).toBe(3600);
    });

    it('returns monthlySaving as null when no medicine has a generic price', () => {
      const list: Medicine[] = [
        {
          id: 'm1',
          personId: 'me',
          name: 'Med A',
          brandPricePerStrip: '150',
          stripsPerMonth: 1,
        },
      ];

      const totals = calculateTotals(list);
      expect(totals.monthlySpend).toBe(150);
      expect(totals.monthlySaving).toBeNull();
      expect(totals.yearlySaving).toBeNull();
    });
  });

  describe('nextRefillDate and refillDueIn', () => {
    it('calculates next refill date using refillEveryDays (defaulting to 30)', () => {
      const med: Medicine = {
        id: 'm1',
        personId: 'me',
        name: 'Med A',
        brandPricePerStrip: '100',
        stripsPerMonth: 1,
        lastRefillDate: '2026-11-01',
        refillEveryDays: 30,
      };

      const next = nextRefillDate(med);
      expect(next).not.toBeNull();
      expect(next?.getFullYear()).toBe(2026);
      expect(next?.getMonth()).toBe(11); // December (11-based 0 is Nov, so Nov 1 + 30 days = Dec 1)
      expect(next?.getDate()).toBe(1);
      expect(next?.getHours()).toBe(9);

      const now = new Date(2026, 10, 21, 9, 0, 0); // Nov 21 -> 10 days until Dec 1
      const dueDays = refillDueIn(med, now);
      expect(dueDays).toBe(10);
    });

    it('returns null when lastRefillDate is missing', () => {
      const med: Medicine = {
        id: 'm1',
        personId: 'me',
        name: 'Med A',
        brandPricePerStrip: '100',
        stripsPerMonth: 1,
      };

      expect(nextRefillDate(med)).toBeNull();
      expect(refillDueIn(med, new Date())).toBeNull();
    });
  });
});

describe('PersistentMedicineStore integration', () => {
  let fakeStorage: FakeKeyValueStorage;

  beforeEach(() => {
    fakeStorage = new FakeKeyValueStorage();
  });

  it('performs full round trip create, list, update, and delete', async () => {
    const store = new PersistentMedicineStore(fakeStorage);

    const created = await store.create({
      personId: 'me',
      name: 'Atorvastatin 10mg',
      brandPricePerStrip: '120',
      genericPricePerStrip: '18',
      stripsPerMonth: 1,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Atorvastatin 10mg');

    // Reload from storage
    const store2 = new PersistentMedicineStore(fakeStorage);
    const list = await store2.list('me');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);

    // Update
    await store2.update(created.id, { brandPricePerStrip: '130' });
    const updated = await store2.get(created.id);
    expect(updated?.brandPricePerStrip).toBe('130');

    // Delete
    await store2.delete(created.id);
    const emptyList = await store2.list('me');
    expect(emptyList).toHaveLength(0);
  });

  it('recovers safely from corrupt JSON by saving a backup and starting fresh', async () => {
    const corruptStr = '{"broken": true, medicines:';
    await fakeStorage.setItem(MEDICINES_STORAGE_KEY, corruptStr);

    const store = new PersistentMedicineStore(fakeStorage);
    const list = await store.list();

    expect(list).toEqual([]);
    expect(store.hadCorruptedData).toBe(true);

    const backupKeys = Array.from(fakeStorage.data.keys()).filter((k) =>
      k.startsWith(`${MEDICINES_STORAGE_KEY}_backup_`)
    );
    expect(backupKeys.length).toBe(1);
    expect(fakeStorage.data.get(backupKeys[0])).toBe(corruptStr);
  });

  it('migrates raw array or missing version document safely', () => {
    const raw = [
      {
        id: 'med-legacy-1',
        personId: 'me',
        name: 'Metformin 500mg',
        brandPricePerStrip: '40',
        stripsPerMonth: 2,
      },
    ];

    const migrated = migrateMedicinesData(raw);
    expect(migrated).toHaveLength(1);
    expect(migrated[0].id).toBe('med-legacy-1');
  });
});
