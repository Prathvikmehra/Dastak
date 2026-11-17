import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { KeyValueStorage, asyncStorageAdapter, backupCorruptData } from '../cases/storage';
import { Medicine, MedicineTotals } from './types';
import { calculateTotals } from './helpers';
import { logger } from '../../lib/logger';
import { parseLocalDate } from '../../lib/dates';

export const MEDICINES_STORAGE_KEY = 'dastak_meds_v1';
export const CURRENT_MEDICINES_VERSION = 1;

export interface StoredMedicinesDocument {
  version: number;
  medicines: Medicine[];
}

function migrateMedicineItem(rawItem: unknown): Medicine | null {
  if (!rawItem || typeof rawItem !== 'object') return null;
  const item = rawItem as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    typeof item.personId !== 'string' ||
    typeof item.name !== 'string'
  ) {
    return null;
  }
  const rawRefill = typeof item.lastRefillDate === 'string' ? item.lastRefillDate : undefined;
  const parsed = parseLocalDate(rawRefill);
  const lastRefillDate = parsed || undefined;
  const legacyLastRefillDate =
    !parsed && rawRefill && rawRefill.trim()
      ? rawRefill.trim()
      : typeof item.legacyLastRefillDate === 'string'
        ? item.legacyLastRefillDate
        : undefined;

  return {
    ...(item as unknown as Medicine),
    lastRefillDate,
    legacyLastRefillDate,
  };
}

export function migrateMedicinesData(raw: unknown): Medicine[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }
  const obj = raw as Record<string, unknown>;
  const list = Array.isArray(obj.medicines)
    ? obj.medicines
    : Array.isArray(raw)
      ? (raw as unknown[])
      : [];

  return list.map(migrateMedicineItem).filter((item): item is Medicine => item !== null);
}

export class PersistentMedicineStore {
  private storage: KeyValueStorage;
  private storageKey: string;
  private medicines: Medicine[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  public hadCorruptedData = false;

  constructor(storage: KeyValueStorage = asyncStorageAdapter, storageKey = MEDICINES_STORAGE_KEY) {
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
        this.medicines = [];
        this.isInitialized = true;
        return;
      }
      try {
        const parsed = JSON.parse(rawStr);
        this.medicines = migrateMedicinesData(parsed);
      } catch {
        await backupCorruptData(this.storage, this.storageKey, rawStr);
        this.hadCorruptedData = true;
        this.medicines = [];
      }
    } catch (err) {
      logger.error('Failed reading medicines from storage', err);
      this.medicines = [];
    } finally {
      this.isInitialized = true;
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const doc: StoredMedicinesDocument = {
        version: CURRENT_MEDICINES_VERSION,
        medicines: this.medicines,
      };
      await this.storage.setItem(this.storageKey, JSON.stringify(doc));
    });
    return this.writeQueue;
  }

  async list(personId?: string): Promise<Medicine[]> {
    await this.ensureInitialized();
    if (!personId) {
      return [...this.medicines];
    }
    return this.medicines.filter((m) => m.personId === personId);
  }

  async get(id: string): Promise<Medicine | null> {
    await this.ensureInitialized();
    return this.medicines.find((m) => m.id === id) || null;
  }

  async create(input: Omit<Medicine, 'id'>, now: Date = new Date()): Promise<Medicine> {
    await this.ensureInitialized();
    const id = `med_${now.getTime()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMed: Medicine = {
      ...input,
      id,
      name: input.name.trim(),
      brandPricePerStrip: input.brandPricePerStrip.trim(),
      genericPricePerStrip: input.genericPricePerStrip?.trim() || undefined,
      stripsPerMonth: Math.max(1, Number(input.stripsPerMonth) || 1),
      refillEveryDays: input.refillEveryDays ?? 30,
      lastRefillDate: input.lastRefillDate?.trim() || undefined,
      note: input.note?.trim() || undefined,
    };
    this.medicines.push(newMed);
    await this.persist();
    return newMed;
  }

  async update(id: string, updates: Partial<Omit<Medicine, 'id' | 'personId'>>): Promise<Medicine> {
    await this.ensureInitialized();
    const idx = this.medicines.findIndex((m) => m.id === id);
    if (idx === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    const existing = this.medicines[idx];
    const updated: Medicine = {
      ...existing,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      brandPricePerStrip:
        updates.brandPricePerStrip !== undefined
          ? updates.brandPricePerStrip.trim()
          : existing.brandPricePerStrip,
      genericPricePerStrip:
        updates.genericPricePerStrip !== undefined
          ? updates.genericPricePerStrip.trim() || undefined
          : existing.genericPricePerStrip,
      stripsPerMonth:
        updates.stripsPerMonth !== undefined
          ? Math.max(1, Number(updates.stripsPerMonth) || 1)
          : existing.stripsPerMonth,
      refillEveryDays:
        updates.refillEveryDays !== undefined ? updates.refillEveryDays : existing.refillEveryDays,
      lastRefillDate:
        updates.lastRefillDate !== undefined
          ? updates.lastRefillDate.trim() || undefined
          : existing.lastRefillDate,
      note: updates.note !== undefined ? updates.note.trim() || undefined : existing.note,
    };
    this.medicines[idx] = updated;
    await this.persist();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    this.medicines = this.medicines.filter((m) => m.id !== id);
    await this.persist();
  }
}

export const defaultMedicineStore = new PersistentMedicineStore();

export interface MedicineContextValue {
  medicines: Medicine[];
  personMedicines: (personId: string) => Medicine[];
  globalTotals: MedicineTotals;
  personTotals: (personId: string) => MedicineTotals;
  addMedicine: (input: Omit<Medicine, 'id'>) => Promise<Medicine>;
  updateMedicine: (
    id: string,
    updates: Partial<Omit<Medicine, 'id' | 'personId'>>
  ) => Promise<Medicine>;
  deleteMedicine: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextValue | null>(null);

export function MedicineProvider({
  store = defaultMedicineStore,
  children,
}: {
  store?: PersistentMedicineStore;
  children: React.ReactNode;
}) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const refresh = useCallback(async () => {
    const list = await store.list();
    setMedicines(list);
  }, [store]);

  useEffect(() => {
    let isMounted = true;
    store.list().then((list) => {
      if (isMounted) {
        setMedicines(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [store]);

  const personMedicines = useCallback(
    (personId: string) => {
      return medicines.filter((m) => m.personId === personId);
    },
    [medicines]
  );

  const globalTotals = calculateTotals(medicines);

  const personTotals = useCallback(
    (personId: string) => {
      return calculateTotals(medicines.filter((m) => m.personId === personId));
    },
    [medicines]
  );

  const addMedicine = useCallback(
    async (input: Omit<Medicine, 'id'>) => {
      const created = await store.create(input);
      await refresh();
      return created;
    },
    [store, refresh]
  );

  const updateMedicine = useCallback(
    async (id: string, updates: Partial<Omit<Medicine, 'id' | 'personId'>>) => {
      const updated = await store.update(id, updates);
      await refresh();
      return updated;
    },
    [store, refresh]
  );

  const deleteMedicine = useCallback(
    async (id: string) => {
      await store.delete(id);
      await refresh();
    },
    [store, refresh]
  );

  const value: MedicineContextValue = {
    medicines,
    personMedicines,
    globalTotals,
    personTotals,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    refresh,
  };

  return React.createElement(MedicineContext.Provider, { value }, children);
}

export function useMedicines(): MedicineContextValue {
  const ctx = useContext(MedicineContext);
  if (!ctx) {
    throw new Error('useMedicines must be used within a MedicineProvider');
  }
  return ctx;
}
