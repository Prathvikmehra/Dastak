import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    this.writeQueue = this.writeQueue.then(async () => {
      const doc: StoredMoneyDocument = {
        version: CURRENT_MONEY_VERSION,
        people: this.people,
        records: this.records,
      };
      await this.storage.setItem(this.storageKey, JSON.stringify(doc));
    });
    return this.writeQueue;
  }

  async listPeople(): Promise<Person[]> {
    await this.ensureInitialized();
    return [...this.people];
  }

  async addPerson(name: string, relationship?: Relationship): Promise<Person> {
    await this.ensureInitialized();
    const id = `person_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPerson: Person = {
      id,
      name: name.trim() || 'Family member',
      relationship,
    };
    this.people.push(newPerson);
    if (!this.records[id]) {
      this.records[id] = {};
    }
    await this.persist();
    return newPerson;
  }

  async getPersonRecords(personId: string): Promise<Record<string, PlaceRecord>> {
    await this.ensureInitialized();
    return this.records[personId] ? { ...this.records[personId] } : {};
  }

  async updatePlaceRecord(
    personId: string,
    placeId: string,
    updates: { status: MoneyPlaceStatus; amount?: string; note?: string }
  ): Promise<PlaceRecord> {
    await this.ensureInitialized();
    if (!this.records[personId]) {
      this.records[personId] = {};
    }
    const existing = this.records[personId][placeId] || {
      placeId,
      status: 'not_checked',
      updatedAt: new Date().toISOString(),
    };
    const updated: PlaceRecord = {
      ...existing,
      status: updates.status,
      amount: updates.amount !== undefined ? updates.amount.trim() : existing.amount,
      note: updates.note !== undefined ? updates.note.trim() : existing.note,
      updatedAt: new Date().toISOString(),
    };
    this.records[personId][placeId] = updated;
    await this.persist();
    return updated;
  }

  async getSummary(personId: string): Promise<MoneySummary> {
    await this.ensureInitialized();
    return summarize(this.records[personId]);
  }
}

export const defaultMoneyStore = new PersistentMoneyStore();

export interface MoneyContextValue {
  people: Person[];
  activePersonId: string;
  setActivePersonId: (id: string) => void;
  activePerson: Person;
  records: Record<string, PlaceRecord>;
  summary: MoneySummary;
  addPerson: (name: string, relationship?: Relationship) => Promise<Person>;
  updatePlace: (
    placeId: string,
    updates: { status: MoneyPlaceStatus; amount?: string; note?: string }
  ) => Promise<PlaceRecord>;
  refresh: () => Promise<void>;
}

const MoneyContext = createContext<MoneyContextValue | null>(null);

export function MoneyProvider({
  store = defaultMoneyStore,
  children,
}: {
  store?: PersistentMoneyStore;
  children: React.ReactNode;
}) {
  const [people, setPeople] = useState<Person[]>([{ ...DEFAULT_PERSON }]);
  const [activePersonId, setActivePersonId] = useState<string>('me');
  const [records, setRecords] = useState<Record<string, PlaceRecord>>({});

  const refresh = useCallback(async () => {
    const pList = await store.listPeople();
    setPeople(pList);
    const pRecs = await store.getPersonRecords(activePersonId);
    setRecords(pRecs);
  }, [store, activePersonId]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([store.listPeople(), store.getPersonRecords(activePersonId)]).then(
      ([pList, pRecs]) => {
        if (isMounted) {
          setPeople(pList);
          setRecords(pRecs);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [store, activePersonId]);

  const addPerson = useCallback(
    async (name: string, relationship?: Relationship) => {
      const p = await store.addPerson(name, relationship);
      await refresh();
      setActivePersonId(p.id);
      return p;
    },
    [store, refresh]
  );

  const updatePlace = useCallback(
    async (
      placeId: string,
      updates: { status: MoneyPlaceStatus; amount?: string; note?: string }
    ) => {
      const rec = await store.updatePlaceRecord(activePersonId, placeId, updates);
      await refresh();
      return rec;
    },
    [store, activePersonId, refresh]
  );

  const activePerson = people.find((p) => p.id === activePersonId) || people[0] || DEFAULT_PERSON;
  const summary = summarize(records);

  const value: MoneyContextValue = {
    people,
    activePersonId,
    setActivePersonId,
    activePerson,
    records,
    summary,
    addPerson,
    updatePlace,
    refresh,
  };

  return React.createElement(MoneyContext.Provider, { value }, children);
}

export function useMoney(): MoneyContextValue {
  const ctx = useContext(MoneyContext);
  if (!ctx) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return ctx;
}
