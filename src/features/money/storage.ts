import { KeyValueStorage, asyncStorageAdapter, backupCorruptData } from '../cases/storage';
import { Person, PlaceRecord, MoneyPlaceStatus, Relationship, MoneySummary } from './types';
import { summarize } from './helpers';
import { logger } from '../../lib/logger';

export const MONEY_STORAGE_KEY = 'dastak_money_v1';
export const CURRENT_MONEY_VERSION = 1;

export const DEFAULT_PERSON: Person = {
  id: 'me',
  name: 'Me',
  isDefault: true,
};

export interface StoredMoneyDocument {
  version: number;
  people: Person[];
  records: Record<string, Record<string, PlaceRecord>>;
}

export function migrateMoneyData(raw: unknown): {
  people: Person[];
  records: Record<string, Record<string, PlaceRecord>>;
} {
  const fallback = {
    people: [{ ...DEFAULT_PERSON }],
    records: { me: {} },
  };

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const obj = raw as Record<string, unknown>;
  const rawPeople = Array.isArray(obj.people) ? obj.people : [];
  const validPeople: Person[] = rawPeople
    .filter((p): p is Person =>
      Boolean(p && typeof p.id === 'string' && typeof p.name === 'string')
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      relationship: p.relationship,
      isDefault: p.isDefault,
    }));

  if (!validPeople.some((p) => p.id === 'me')) {
    validPeople.unshift({ ...DEFAULT_PERSON });
  }

  const rawRecords =
    typeof obj.records === 'object' && obj.records !== null
      ? (obj.records as Record<string, Record<string, PlaceRecord>>)
      : {};

  return {
    people: validPeople,
    records: rawRecords,
  };
}

export class PersistentMoneyStore {
  private storage: KeyValueStorage;
  private storageKey: string;
  private people: Person[] = [{ ...DEFAULT_PERSON }];
  private records: Record<string, Record<string, PlaceRecord>> = { me: {} };
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  public hadCorruptedData = false;

  constructor(storage: KeyValueStorage = asyncStorageAdapter, storageKey = MONEY_STORAGE_KEY) {
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
        this.people = [{ ...DEFAULT_PERSON }];
        this.records = { me: {} };
        this.isInitialized = true;
        return;
      }
      try {
        const parsed = JSON.parse(rawStr);
        const migrated = migrateMoneyData(parsed);
        this.people = migrated.people;
        this.records = migrated.records;
      } catch {
        await backupCorruptData(this.storage, this.storageKey, rawStr);
        this.hadCorruptedData = true;
        this.people = [{ ...DEFAULT_PERSON }];
        this.records = { me: {} };
      }
    } catch (err) {
      logger.error('Failed reading money records from storage', err);
      this.people = [{ ...DEFAULT_PERSON }];
      this.records = { me: {} };
    } finally {
      this.isInitialized = true;
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue
      .then(async () => {
        const doc: StoredMoneyDocument = {
          version: CURRENT_MONEY_VERSION,
          people: this.people,
          records: this.records,
        };
        await this.storage.setItem(this.storageKey, JSON.stringify(doc));
      })
      .catch((err) => {
        logger.error('Failed writing money records to storage', err);
      });

    await this.writeQueue;
  }

  async listPeople(): Promise<Person[]> {
    await this.ensureInitialized();
    return [...this.people];
  }

  async addPerson(
    name: string,
    relationship?: Relationship,
    now: Date = new Date()
  ): Promise<Person> {
    await this.ensureInitialized();
    const id = `person_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`;
    const created: Person = {
      id,
      name: name.trim(),
      relationship,
    };
    this.people = [...this.people, created];
    if (!this.records[id]) {
      this.records[id] = {};
    }
    await this.persist();
    return created;
  }

  async deletePerson(id: string): Promise<void> {
    await this.ensureInitialized();
    if (id === 'me') {
      return;
    }
    this.people = this.people.filter((p) => p.id !== id);
    delete this.records[id];
    await this.persist();
  }

  async removePerson(id: string): Promise<void> {
    return this.deletePerson(id);
  }

  async getPersonRecords(personId: string): Promise<Record<string, PlaceRecord>> {
    await this.ensureInitialized();
    return { ...(this.records[personId] || {}) };
  }

  async getRecordsForPerson(personId: string): Promise<Record<string, PlaceRecord>> {
    return this.getPersonRecords(personId);
  }

  async getSummary(personId: string): Promise<MoneySummary> {
    await this.ensureInitialized();
    const records = this.records[personId] || {};
    return summarize(records);
  }

  async getPlaceRecord(personId: string, placeId: string): Promise<PlaceRecord | null> {
    await this.ensureInitialized();
    return this.records[personId]?.[placeId] || null;
  }

  async getRecord(personId: string, placeId: string): Promise<PlaceRecord | null> {
    return this.getPlaceRecord(personId, placeId);
  }

  async updatePlaceRecord(
    personId: string,
    placeId: string,
    updates: {
      status: MoneyPlaceStatus;
      amount?: string;
      amountFound?: string;
      reference?: string;
      note?: string;
    },
    now: Date = new Date()
  ): Promise<PlaceRecord> {
    await this.ensureInitialized();
    if (!this.records[personId]) {
      this.records[personId] = {};
    }
    const amountVal = updates.amountFound ?? updates.amount;
    const existing = this.records[personId][placeId];
    const record: PlaceRecord = {
      placeId,
      status: updates.status,
      amount: amountVal,
      note: updates.note ?? existing?.note,
      updatedAt: now.toISOString(),
    };
    this.records[personId][placeId] = record;
    await this.persist();
    return record;
  }

  async setRecord(
    personId: string,
    placeId: string,
    data: {
      status: MoneyPlaceStatus;
      amountFound?: string;
      amount?: string;
      reference?: string;
      note?: string;
    },
    now: Date = new Date()
  ): Promise<PlaceRecord> {
    return this.updatePlaceRecord(personId, placeId, data, now);
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.people = [{ ...DEFAULT_PERSON }];
    this.records = { me: {} };
    await this.storage.removeItem(this.storageKey);
  }
}
