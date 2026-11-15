import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Case, IssueType } from './types';

export interface CaseInput {
  issueType: IssueType;
  company?: string;
  amount?: string;
  reference?: string;
  incidentDate?: string;
  note?: string;
  userName?: string;
}

export interface CaseStore {
  list(): Promise<Case[]>;
  get(id: string): Promise<Case | null>;
  create(input: CaseInput): Promise<Case>;
  update(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<Case>;
  resolve(id: string, recoveredAmount?: number): Promise<Case>;
}

/**
 * In-memory implementation of CaseStore.
 * Storage-agnostic; will be swapped with SQLite in future steps.
 */
export class InMemoryCaseStore implements CaseStore {
  private cases: Map<string, Case> = new Map();

  constructor(initialCases: Case[] = []) {
    for (const c of initialCases) {
      this.cases.set(c.id, c);
    }
  }

  async list(): Promise<Case[]> {
    return Array.from(this.cases.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async get(id: string): Promise<Case | null> {
    return this.cases.get(id) || null;
  }

  async create(input: CaseInput): Promise<Case> {
    const id = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newCase: Case = {
      id,
      issueType: input.issueType,
      company: input.company?.trim() || '',
      amount: input.amount?.trim() || '',
      reference: input.reference?.trim() || '',
      incidentDate: input.incidentDate?.trim() || '',
      note: input.note?.trim() || '',
      userName: input.userName?.trim() || '',
      createdAt: new Date().toISOString(),
      evidence: {},
    };
    this.cases.set(id, newCase);
    return newCase;
  }

  async update(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<Case> {
    const existing = this.cases.get(id);
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
    this.cases.set(id, updated);
    return updated;
  }

  async resolve(id: string, recoveredAmount?: number): Promise<Case> {
    const existing = this.cases.get(id);
    if (!existing) {
      throw new Error(`Case with id ${id} not found`);
    }
    const updated: Case = {
      ...existing,
      resolvedAt: new Date().toISOString(),
      recoveredAmount: recoveredAmount !== undefined ? recoveredAmount : undefined,
    };
    this.cases.set(id, updated);
    return updated;
  }
}

// Global default in-memory store singleton for app session
export const defaultCaseStore = new InMemoryCaseStore();

export interface CasesContextValue {
  cases: Case[];
  loading: boolean;
  getCase: (id: string) => Case | undefined;
  createCase: (input: CaseInput) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>) => Promise<Case>;
  resolveCase: (id: string, recoveredAmount?: number) => Promise<Case>;
  refresh: () => Promise<void>;
  totalRecovered: number;
  openCases: Case[];
  resolvedCases: Case[];
}

const CasesContext = createContext<CasesContextValue | null>(null);

export interface CasesProviderProps {
  store?: CaseStore;
  children: React.ReactNode;
}

export function CasesProvider({ store = defaultCaseStore, children }: CasesProviderProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    async (input: CaseInput) => {
      const created = await store.create(input);
      await refresh();
      return created;
    },
    [store, refresh]
  );

  const updateCase = useCallback(
    async (id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>) => {
      const updated = await store.update(id, updates);
      await refresh();
      return updated;
    },
    [store, refresh]
  );

  const resolveCase = useCallback(
    async (id: string, recoveredAmount?: number) => {
      const resolved = await store.resolve(id, recoveredAmount);
      await refresh();
      return resolved;
    },
    [store, refresh]
  );

  const openCases = cases.filter((c) => !c.resolvedAt);
  const resolvedCases = cases.filter((c) => Boolean(c.resolvedAt));
  const totalRecovered = resolvedCases.reduce((sum, c) => sum + (c.recoveredAmount || 0), 0);

  const value: CasesContextValue = {
    cases,
    loading,
    getCase,
    createCase,
    updateCase,
    resolveCase,
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
