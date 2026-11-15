import AsyncStorage from '@react-native-async-storage/async-storage';
import { Case, CaseInput, CaseStore } from './types';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const asyncStorageAdapter: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const CASES_STORAGE_KEY = 'dastak_cases_v1';
export const CURRENT_STORAGE_VERSION = 1;

export interface StoredCasesDocument {
  version: number;
  cases: Case[];
}

/**
 * Migrates raw stored data from older, missing, or future versions into a typed Case array.
 */
export function migrateStoredData(raw: unknown): Case[] {
  if (!raw) {
    return [];
  }
  // Missing version: raw is directly an array of cases
  if (Array.isArray(raw)) {
    return raw.filter((item): item is Case => Boolean(item && typeof item.id === 'string'));
  }
  // Object with version and cases
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.cases)) {
      return obj.cases.filter((item): item is Case => Boolean(item && typeof item.id === 'string'));
    }
  }
  return [];
}

/**
 * Storage-backed implementation of CaseStore.
 * - Keeps existing CaseStore interface.
 * - Persists all cases as a single versioned JSON document.
 * - Serializes writes to guarantee concurrent write safety.
 * - Backs up corrupt JSON to a backup key without crashing or wiping silently.
 */
export class PersistentCaseStore implements CaseStore {
  private storage: KeyValueStorage;
  private storageKey: string;
  private casesMap: Map<string, Case> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  public hadCorruptedData = false;

  constructor(storage: KeyValueStorage = asyncStorageAdapter, storageKey = CASES_STORAGE_KEY) {
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
        this.isInitialized = true;
        return;
      }
      try {
        const parsed = JSON.parse(rawStr);
        const cases = migrateStoredData(parsed);
        this.casesMap.clear();
        for (const c of cases) {
          this.casesMap.set(c.id, c);
        }
      } catch {
        // Corrupt JSON! Copy to backup key and start empty
        const backupKey = `dastak_cases_backup_${Date.now()}`;
        await this.storage.setItem(backupKey, rawStr);
        this.hadCorruptedData = true;
        this.casesMap.clear();
      }
    } catch {
      this.casesMap.clear();
    } finally {
      this.isInitialized = true;
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const doc: StoredCasesDocument = {
        version: CURRENT_STORAGE_VERSION,
        cases: Array.from(this.casesMap.values()),
      };
      await this.storage.setItem(this.storageKey, JSON.stringify(doc));
    });
    return this.writeQueue;
  }

  async list(): Promise<Case[]> {
    await this.ensureInitialized();
    return Array.from(this.casesMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async get(id: string): Promise<Case | null> {
    await this.ensureInitialized();
    return this.casesMap.get(id) || null;
  }

  async create(input: CaseInput, now: Date = new Date()): Promise<Case> {
    await this.ensureInitialized();
    const id = `case_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`;
    const newCase: Case = {
      id,
      issueType: input.issueType,
      company: input.company?.trim() || '',
      amount: input.amount?.trim() || '',
      reference: input.reference?.trim() || '',
      incidentDate: input.incidentDate?.trim() || '',
      note: input.note?.trim() || '',
      userName: input.userName?.trim() || '',
      fraudWhen: input.fraudWhen,
      createdAt: now.toISOString(),
      evidence: {},
    };
    this.casesMap.set(id, newCase);
    await this.persist();
    return newCase;
  }

  async update(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<Case> {
    await this.ensureInitialized();
    const existing = this.casesMap.get(id);
    if (!existing) {
      throw new Error(`Case with id ${id} not found`);
    }
    const updated: Case = {
      ...existing,
      ...updates,
      evidence: updates.evidence
        ? { ...existing.evidence, ...updates.evidence }
        : existing.evidence,
    };
    this.casesMap.set(id, updated);
    await this.persist();
    return updated;
  }

  async resolve(id: string, recoveredAmount?: number, now: Date = new Date()): Promise<Case> {
    await this.ensureInitialized();
    const existing = this.casesMap.get(id);
    if (!existing) {
      throw new Error(`Case with id ${id} not found`);
    }
    const updated: Case = {
      ...existing,
      resolvedAt: now.toISOString(),
      recoveredAmount: recoveredAmount !== undefined ? recoveredAmount : undefined,
    };
    this.casesMap.set(id, updated);
    await this.persist();
    return updated;
  }
}
