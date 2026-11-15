import { InMemoryCaseStore } from './store';
import { Case } from './types';

describe('InMemoryCaseStore', () => {
  let store: InMemoryCaseStore;

  beforeEach(() => {
    store = new InMemoryCaseStore();
  });

  it('starts with an empty list', async () => {
    const list = await store.list();
    expect(list).toEqual([]);
  });

  it('creates a new case with defaults and stores it', async () => {
    const created = await store.create({
      issueType: 'refund',
      company: 'Amazon',
      amount: '1999',
      reference: 'AMZ-123',
      incidentDate: '10 Nov 2026',
      note: 'Item not delivered',
    });

    expect(created.id).toBeDefined();
    expect(created.issueType).toBe('refund');
    expect(created.company).toBe('Amazon');
    expect(created.amount).toBe('1999');
    expect(created.evidence).toEqual({});
    expect(created.createdAt).toBeDefined();
    expect(created.resolvedAt).toBeUndefined();

    const fetched = await store.get(created.id);
    expect(fetched).toEqual(created);

    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it('updates an existing case', async () => {
    const created = await store.create({
      issueType: 'bank',
      company: 'HDFC Bank',
      amount: '5000',
    });

    const updated = await store.update(created.id, {
      reference: 'TXN-999',
      evidence: { 'Statement showing the issue': true },
    });

    expect(updated.reference).toBe('TXN-999');
    expect(updated.evidence['Statement showing the issue']).toBe(true);

    const fetched = await store.get(created.id);
    expect(fetched?.reference).toBe('TXN-999');
    expect(fetched?.evidence['Statement showing the issue']).toBe(true);
  });

  it('resolves a case with an optional recovered amount', async () => {
    const created = await store.create({
      issueType: 'fraud',
      company: 'UPI Scam',
      amount: '25000',
    });

    const resolved = await store.resolve(created.id, 20000);

    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.recoveredAmount).toBe(20000);

    const fetched = await store.get(created.id);
    expect(fetched?.resolvedAt).toBe(resolved.resolvedAt);
    expect(fetched?.recoveredAmount).toBe(20000);
  });

  it('throws an error when updating or resolving a non-existent case', async () => {
    await expect(store.update('non-existent', { company: 'Test' })).rejects.toThrow(
      'Case with id non-existent not found'
    );
    await expect(store.resolve('non-existent', 500)).rejects.toThrow(
      'Case with id non-existent not found'
    );
  });

  it('initializes with seed cases and sorts list by createdAt descending', async () => {
    const case1: Case = {
      id: 'c1',
      issueType: 'refund',
      company: 'Old Co',
      amount: '1000',
      reference: 'REF1',
      incidentDate: '1 Nov 2026',
      note: '',
      createdAt: '2026-11-01T10:00:00.000Z',
      evidence: {},
    };
    const case2: Case = {
      id: 'c2',
      issueType: 'bank',
      company: 'New Co',
      amount: '2000',
      reference: 'REF2',
      incidentDate: '10 Nov 2026',
      note: '',
      createdAt: '2026-11-10T10:00:00.000Z',
      evidence: {},
    };

    const seededStore = new InMemoryCaseStore([case1, case2]);
    const list = await seededStore.list();

    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('c2'); // newer first
    expect(list[1].id).toBe('c1');
  });
});
