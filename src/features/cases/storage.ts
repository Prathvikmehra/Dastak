import AsyncStorage from '@react-native-async-storage/async-storage';
import { Case, CaseInput, CaseStore } from './types';
import { logger } from '../../lib/logger';
import { parseIsoDate, parseLocalDate, LocalDate } from '../../lib/dates';
import { backupCorruptData } from './storage-backup';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys?(): Promise<readonly string[]>;
}

export const asyncStorageAdapter: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  getAllKeys: () => AsyncStorage.getAllKeys(),
};

export const CASES_STORAGE_KEY = 'dastak_cases_v1';
export const CURRENT_STORAGE_VERSION = 1;

export { backupCorruptData };

export interface StoredCasesDocument {
  version: number;
  cases: Case[];
}

function migrateCaseItem(rawItem: unknown): Case | null {
  if (!rawItem || typeof rawItem !== 'object') return null;
  const item = rawItem as Record<string, unknown>;
  if (typeof item.id !== 'string') return null;

  const rawIncident = typeof item.incidentDate === 'string' ? item.incidentDate : '';
  const parsed = parseLocalDate(rawIncident);
  const incidentDate: LocalDate = parsed || '';
  const legacyIncidentDate =
    !parsed && rawIncident.trim()
      ? rawIncident.trim()
      : typeof item.legacyIncidentDate === 'string'
        ? item.legacyIncidentDate
        : undefined;

  return {
    ...(item as unknown as Case),
    incidentDate,
    legacyIncidentDate,
  };
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
    return raw.map(migrateCaseItem).filter((item): item is Case => item !== null);
  }
  // Object with version and cases
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.cases)) {
      return obj.cases.map(migrateCaseItem).filter((item): item is Case => item !== null);
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
 * - Keeps at most the 3 most recent corrupt backups.
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
        // Corrupt JSON: copy to backup key, prune older backups, and start empty
        await backupCorruptData(this.storage, this.storageKey, rawStr);
        this.hadCorruptedData = true;
        this.casesMap.clear();
      }
    } catch (err) {
      logger.error('Failed reading cases from storage', err);
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
      (a, b) => parseIsoDate(b.createdAt).getTime() - parseIsoDate(a.createdAt).getTime()
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
      incidentDate: input.incidentDate || '',
      legacyIncidentDate: input.legacyIncidentDate,
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

  async clear(): Promise<void> {
    await this.ensureInitialized();
    this.casesMap.clear();
    await this.storage.removeItem(this.storageKey);
  }
}
