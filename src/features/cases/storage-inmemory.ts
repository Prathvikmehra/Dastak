import { Case, CaseInput, CaseStore } from './types';

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

  async create(input: CaseInput, now: Date = new Date()): Promise<Case> {
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

  async resolve(id: string, recoveredAmount?: number, now: Date = new Date()): Promise<Case> {
    const existing = this.cases.get(id);
    if (!existing) {
      throw new Error(`Case with id ${id} not found`);
    }
    const updated: Case = {
      ...existing,
      resolvedAt: now.toISOString(),
      recoveredAmount: recoveredAmount !== undefined ? recoveredAmount : undefined,
    };
    this.cases.set(id, updated);
    return updated;
  }
}
