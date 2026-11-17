import { planReminders, RemindersService } from './reminders';
import { Case } from './types';
import { FakeNotificationsPort } from '../../lib/notificationsPort';
import { PreferencesStore, UserPreferences } from '../settings/preferences';

function createMockCase(overrides: Partial<Case> = {}): Case {
  return {
    id: 'rem-case-1',
    issueType: 'refund',
    company: 'Acme Mart',
    amount: '1999',
    reference: 'OD-111',
    incidentDate: '1 Nov 2026',
    note: '',
    createdAt: new Date(2026, 10, 1, 10, 0, 0).toISOString(),
    evidence: {},
    ...overrides,
  };
}

class FakePreferencesStore implements PreferencesStore {
  public prefs: UserPreferences;
  public hadCorruptedData = false;

  constructor(initial: UserPreferences = { remindersEnabled: true, language: 'en' }) {
    this.prefs = { ...initial };
  }

  async get(): Promise<UserPreferences> {
    return { ...this.prefs };
  }

  async set(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    this.prefs = { ...this.prefs, ...updates };
    return { ...this.prefs };
  }
}

describe('planReminders pure function', () => {
  it('schedules reminders for future ladder steps at 9:00 local time on that step day', () => {
    const c = createMockCase({
      issueType: 'refund',
      company: 'Acme Mart',
      createdAt: new Date(2026, 10, 1, 10, 0, 0).toISOString(),
    });

    // Checked on Nov 1 at 11:00 local time (Day 0 9:00 is already past)
    const now = new Date(2026, 10, 1, 11, 0, 0);
    const planned = planReminders(c, now);

    // Refund ladder has 3 steps: day 0, day 7, day 30
    // Day 0 (Nov 1 9:00) is past -> 2 future reminders remaining (day 7 and day 30)
    expect(planned).toHaveLength(2);

    const day7 = planned[0];
    expect(day7.stepId).toBe('refund-step-7');
    expect(day7.fireAt.getFullYear()).toBe(2026);
    expect(day7.fireAt.getMonth()).toBe(10);
    expect(day7.fireAt.getDate()).toBe(8); // Nov 1 + 7 days = Nov 8
    expect(day7.fireAt.getHours()).toBe(9);
    expect(day7.fireAt.getMinutes()).toBe(0);
    expect(day7.body).toContain(
      'Your case with Acme Mart moves to the National Consumer Helpline today'
    );

    const day30 = planned[1];
    expect(day30.stepId).toBe('refund-step-30');
    expect(day30.fireAt.getHours()).toBe(9);
    expect(day30.body).toContain('e-Jagriti consumer commission');
  });

  it('returns empty array when case has already been resolved', () => {
    const c = createMockCase({
      issueType: 'refund',
      resolvedAt: new Date(2026, 10, 5).toISOString(),
    });
    const now = new Date(2026, 10, 2, 10, 0, 0);
    const planned = planReminders(c, now);
    expect(planned).toEqual([]);
  });

  it('returns empty array when all step dates have passed', () => {
    const c = createMockCase({
      issueType: 'refund',
      createdAt: new Date(2026, 9, 1, 10, 0, 0).toISOString(),
    });
    const now = new Date(2026, 11, 1, 10, 0, 0);
    const planned = planReminders(c, now);
    expect(planned).toEqual([]);
  });
});

describe('RemindersService integration with FakeNotificationsPort', () => {
  let fakePort: FakeNotificationsPort;
  let fakePrefs: FakePreferencesStore;
  let service: RemindersService;

  beforeEach(() => {
    fakePort = new FakeNotificationsPort();
    fakePrefs = new FakePreferencesStore({ remindersEnabled: true, language: 'en' });
    service = new RemindersService(fakePort, fakePrefs);
  });

  it('schedules using absolute DATE trigger shape and proper identifiers', async () => {
    const c = createMockCase({
      id: 'case-date-1',
      createdAt: new Date(2026, 10, 1, 10, 0, 0).toISOString(),
    });
    const now = new Date(2026, 10, 1, 11, 0, 0);

    const result = await service.schedule(c, now);

    expect(result.permission).toBe('granted');
    expect(result.scheduled).toBe(2);
    expect(result.skipped).toBe(1); // Day 0 (Nov 1 09:00) is past
    expect(result.failed).toBe(0);

    // Verify scheduled items in fake port
    const scheduledList = Array.from(fakePort.scheduled.values());
    expect(scheduledList).toHaveLength(2);

    for (const req of scheduledList) {
      expect(req.identifier).toMatch(/^dastak_case-date-1_refund-step-/);
      // Absolute DATE trigger, never TIME_INTERVAL
      expect(req.trigger.type).toBe('date');
      expect(req.trigger.date).toBeInstanceOf(Date);
      expect(req.trigger.date.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it('skips scheduling when preference is false', async () => {
    fakePrefs.prefs.remindersEnabled = false;
    const c = createMockCase({ id: 'case-pref-false' });
    const now = new Date(2026, 10, 1, 11, 0, 0);

    const result = await service.schedule(c, now);

    expect(result.scheduled).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failed).toBe(0);
    expect(fakePort.scheduled.size).toBe(0);
  });

  it('cancels all scheduled reminders on toggle OFF', async () => {
    const c = createMockCase({ id: 'case-cancel-all' });
    const now = new Date(2026, 10, 1, 11, 0, 0);

    await service.schedule(c, now);
    expect(fakePort.scheduled.size).toBe(2);

    await service.cancelAll();
    expect(fakePort.scheduled.size).toBe(0);
  });

  it('correctly tracks skipped past reminders', async () => {
    // Created 40 days ago, so day 0, day 7, day 30 have all passed
    const c = createMockCase({
      issueType: 'refund',
      createdAt: new Date(2026, 8, 1, 10, 0, 0).toISOString(),
    });
    const now = new Date(2026, 10, 1, 10, 0, 0);

    const result = await service.schedule(c, now);

    expect(result.scheduled).toBe(0);
    expect(result.skipped).toBe(3);
    expect(result.failed).toBe(0);
    expect(fakePort.scheduled.size).toBe(0);
  });

  it('reports failure instead of swallowing errors when port throws', async () => {
    fakePort.shouldFailSchedule = true;
    const c = createMockCase({ id: 'case-failure-report' });
    const now = new Date(2026, 10, 1, 11, 0, 0);

    const result = await service.schedule(c, now);

    expect(result.failed).toBe(2);
    expect(result.scheduled).toBe(0);
  });

  it('returns denied permission without scheduling when OS permission is denied', async () => {
    fakePort.permission = 'denied';
    const c = createMockCase();
    const now = new Date(2026, 10, 1, 11, 0, 0);

    const result = await service.schedule(c, now);

    expect(result.permission).toBe('denied');
    expect(result.scheduled).toBe(0);
    expect(fakePort.scheduled.size).toBe(0);
  });
});
