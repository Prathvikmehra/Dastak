import { deleteAllUserData, DeleteAllServices } from './delete-all';
import { InMemoryCaseStore } from '../cases/storage-inmemory';
import { PreferencesStore, UserPreferences } from './preferences';

class FakePreferencesStore implements PreferencesStore {
  public prefs: UserPreferences = {
    remindersEnabled: true,
    language: 'hi',
    theme: 'dark',
  };
  public hadCorruptedData = false;

  async get(): Promise<UserPreferences> {
    return { ...this.prefs };
  }
  async set(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    this.prefs = { ...this.prefs, ...updates };
    return { ...this.prefs };
  }
  async reset(preserveLanguage = true): Promise<UserPreferences> {
    const lang = preserveLanguage ? this.prefs.language : 'en';
    this.prefs = {
      remindersEnabled: false,
      language: lang,
      theme: 'system',
    };
    return { ...this.prefs };
  }
}

describe('Delete all user data', () => {
  it('wipes cases, money, medicines, reminders and resets preferences preserving language', async () => {
    const caseStore = new InMemoryCaseStore();
    await caseStore.create({
      issueType: 'fraud',
      company: 'Fake App',
      amount: '5000',
    });
    expect((await caseStore.list()).length).toBe(1);

    let moneyCleared = false;
    const fakeMoneyStore = {
      clear: async () => {
        moneyCleared = true;
      },
    };

    let medicinesCleared = false;
    const fakeMedicineStore = {
      clear: async () => {
        medicinesCleared = true;
      },
    };

    let remindersCancelled = false;
    const fakeReminders = {
      cancelAll: async () => {
        remindersCancelled = true;
      },
    };

    const fakePrefs = new FakePreferencesStore();

    const services: DeleteAllServices = {
      caseStore,
      moneyStore: fakeMoneyStore,
      medicineStore: fakeMedicineStore,
      reminders: fakeReminders,
      preferencesStore: fakePrefs,
    };

    await deleteAllUserData(services);

    // Cases emptied
    expect((await caseStore.list()).length).toBe(0);

    // Money and medicines cleared
    expect(moneyCleared).toBe(true);
    expect(medicinesCleared).toBe(true);

    // Reminders cancelled
    expect(remindersCancelled).toBe(true);

    // Preferences reset, but language preserved
    const updatedPrefs = await fakePrefs.get();
    expect(updatedPrefs.remindersEnabled).toBe(false);
    expect(updatedPrefs.language).toBe('hi'); // preserved!
    expect(updatedPrefs.theme).toBe('system');
  });
});
