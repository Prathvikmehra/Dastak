import { KeyValueStorage, asyncStorageAdapter, backupCorruptData } from '../cases/storage';
import { Medicine } from './types';
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
    this.writeQueue = this.writeQueue
      .then(async () => {
        const doc: StoredMedicinesDocument = {
          version: CURRENT_MEDICINES_VERSION,
          medicines: this.medicines,
        };
        await this.storage.setItem(this.storageKey, JSON.stringify(doc));
      })
      .catch((err) => {
        logger.error('Failed writing medicines to storage', err);
      });

    await this.writeQueue;
  }

  async list(personId?: string): Promise<Medicine[]> {
    await this.ensureInitialized();
    if (!personId) {
      return [...this.medicines];
    }
    return this.medicines.filter((m) => m.personId === personId);
  }

  async getAll(): Promise<Medicine[]> {
    return this.list();
  }

  async get(id: string): Promise<Medicine | null> {
    await this.ensureInitialized();
    return this.medicines.find((m) => m.id === id) || null;
  }

  async create(input: Omit<Medicine, 'id'>, now: Date = new Date()): Promise<Medicine> {
    await this.ensureInitialized();
    const id = `med_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`;
    const created: Medicine = {
      ...input,
      id,
    };
    this.medicines = [...this.medicines, created];
    await this.persist();
    return created;
  }

  async add(input: Omit<Medicine, 'id'>, now?: Date): Promise<Medicine> {
    return this.create(input, now);
  }

  async update(id: string, updates: Partial<Omit<Medicine, 'id' | 'personId'>>): Promise<Medicine> {
    await this.ensureInitialized();
    const index = this.medicines.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine not found: ${id}`);
    }
    const updated: Medicine = {
      ...this.medicines[index],
      ...updates,
    };
    this.medicines = [
      ...this.medicines.slice(0, index),
      updated,
      ...this.medicines.slice(index + 1),
    ];
    await this.persist();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    this.medicines = this.medicines.filter((m) => m.id !== id);
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async removeByPerson(personId: string): Promise<void> {
    await this.ensureInitialized();
    this.medicines = this.medicines.filter((m) => m.personId !== personId);
    await this.persist();
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.medicines = [];
    await this.storage.removeItem(this.storageKey);
  }
}
