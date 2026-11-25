import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Case, CaseInput, CaseStore } from './types';
import { PersistentCaseStore } from './storage';
import { Reminders, defaultReminders } from './reminders';

export { CaseInput, CaseStore } from './types';
export { InMemoryCaseStore } from './storage-inmemory';

// Global default persistent store singleton for app session
export const defaultCaseStore = new PersistentCaseStore();

export interface CasesContextValue {
  cases: Case[];
  loading: boolean;
  hadCorruptedData: boolean;
  hasStorageError: boolean;
  clearStorageError: () => void;
  getCase: (id: string) => Case | undefined;
  createCase: (input: CaseInput, now?: Date) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>) => Promise<Case>;
  resolveCase: (id: string, recoveredAmount?: number, now?: Date) => Promise<Case>;
  clearCases: () => Promise<void>;
  refresh: () => Promise<void>;
  totalRecovered: number;
  openCases: Case[];
  resolvedCases: Case[];
}

const CasesContext = createContext<CasesContextValue | null>(null);

export interface CasesProviderProps {
  store?: CaseStore;
  reminders?: Reminders;
  children: React.ReactNode;
}

export function CasesProvider({
  store = defaultCaseStore,
  reminders = defaultReminders,
  children,
}: CasesProviderProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasStorageError, setHasStorageError] = useState<boolean>(false);
  const hadCorruptedData = store instanceof PersistentCaseStore ? store.hadCorruptedData : false;

  const clearStorageError = useCallback(() => setHasStorageError(false), []);

  const refresh = useCallback(async () => {
    const list = await store.list();
    setCases(list);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    let isMounted = true;
    store.list().then((list) => {
      if (isMounted) {
        setCases(list);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [store]);

  const getCase = useCallback(
    (id: string) => {
      return cases.find((c) => c.id === id);
    },
    [cases]
  );

  const createCase = useCallback(
    async (input: CaseInput, now: Date = new Date()) => {
      try {
        const created = await store.create(input, now);
        await reminders.schedule(created, now);
        await refresh();
        setHasStorageError(false);
        return created;
      } catch (err) {
        setHasStorageError(true);
        throw err;
      }
    },
    [store, reminders, refresh]
  );

  const updateCase = useCallback(
    async (id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>) => {
      try {
        const updated = await store.update(id, updates);
        await reminders.schedule(updated);
        await refresh();
        setHasStorageError(false);
        return updated;
      } catch (err) {
        setHasStorageError(true);
        throw err;
      }
    },
    [store, reminders, refresh]
  );

  const resolveCase = useCallback(
    async (id: string, recoveredAmount?: number, now: Date = new Date()) => {
      try {
        const resolved = await store.resolve(id, recoveredAmount, now);
        await reminders.cancel(id);
        await refresh();
        setHasStorageError(false);
        return resolved;
      } catch (err) {
        setHasStorageError(true);
        throw err;
      }
    },
    [store, reminders, refresh]
  );

  const clearCases = useCallback(async () => {
    try {
      if (store.clear) {
        await store.clear();
      }
      setCases([]);
      setHasStorageError(false);
    } catch (err) {
      setHasStorageError(true);
      throw err;
    }
  }, [store]);

  const openCases = cases.filter((c) => !c.resolvedAt);
  const resolvedCases = cases.filter((c) => Boolean(c.resolvedAt));
  const totalRecovered = resolvedCases.reduce((sum, c) => sum + (c.recoveredAmount || 0), 0);

  const value: CasesContextValue = {
    cases,
    loading,
    hadCorruptedData,
    hasStorageError,
    clearStorageError,
    getCase,
    createCase,
    updateCase,
    resolveCase,
    clearCases,
    refresh,
    totalRecovered,
    openCases,
    resolvedCases,
  };

  return React.createElement(CasesContext.Provider, { value }, children);
}

export function useCases(): CasesContextValue {
  const ctx = useContext(CasesContext);
  if (!ctx) {
    throw new Error('useCases must be used within a CasesProvider');
  }
  return ctx;
}
