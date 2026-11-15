import { planReminders, FakeReminders } from './reminders';
import { Case } from './types';

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

describe('planReminders pure function', () => {
  it('schedules reminders for future ladder steps at 9:00 local time on that step day', () => {
    // Created on Nov 1 at 10:00 local time
    const c = createMockCase({
      issueType: 'refund',
      company: 'Acme Mart',
      createdAt: new Date(2026, 10, 1, 10, 0, 0).toISOString(),
    });

    // Checked on Nov 1 at 11:00 local time (Day 0 9:00 has already passed)
    const now = new Date(2026, 10, 1, 11, 0, 0);
    const planned = planReminders(c, now);

    // Refund ladder has 3 steps: day 0, day 7, day 30
    // Day 0 (Nov 1 9:00) is past -> 2 future reminders remaining (day 7 and day 30)
    expect(planned).toHaveLength(2);

    // Day 7 reminder
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

    // Day 30 reminder
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
    // 60 days later
    const now = new Date(2026, 11, 1, 10, 0, 0);

    const planned = planReminders(c, now);
    expect(planned).toEqual([]);
  });
});

describe('FakeReminders implementation', () => {
  it('schedules and cancels reminders correctly', async () => {
    const fakeReminders = new FakeReminders();
    const c = createMockCase({ id: 'case-test-xyz' });
    const now = new Date(2026, 10, 1, 11, 0, 0);

    await fakeReminders.schedule(c, now);
    expect(fakeReminders.scheduled.get('case-test-xyz')).toHaveLength(2);

    await fakeReminders.cancel('case-test-xyz');
    expect(fakeReminders.scheduled.has('case-test-xyz')).toBe(false);
  });
});
