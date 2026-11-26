import React from 'react';
import { View, Text, Alert } from 'react-native';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { deleteAllUserData } from './delete-all';
import { PersistentCaseStore, CASES_STORAGE_KEY, KeyValueStorage } from '../cases/storage';
import { PersistentMoneyStore, MONEY_STORAGE_KEY } from '../money/storage';
import { PersistentMedicineStore, MEDICINES_STORAGE_KEY } from '../medicine/storage';
import { PersistentPreferencesStore, PREFERENCES_STORAGE_KEY } from './preferences';
import { CasesProvider, useCases } from '../cases/store';
import { MoneyProvider, useMoney } from '../money/store';
import { MedicinesProvider, useMedicines } from '../medicine/store';
import { Button } from '../../components/Button';
import { PrivacySection } from './components/PrivacySection';
import { LanguageProvider } from '../../copy/context';
import { ThemeProvider } from '../../theme/ThemeContext';

class FakeKeyValueStorage implements KeyValueStorage {
  public data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
  async getAllKeys(): Promise<readonly string[]> {
    return Array.from(this.data.keys());
  }
}

describe('Delete all user data (fail-closed, complete purge)', () => {
  it('purges all real stores, legacy keys, and corrupt backups, preserving only language', async () => {
    const storage = new FakeKeyValueStorage();
    const caseStore = new PersistentCaseStore(storage);
    const moneyStore = new PersistentMoneyStore(storage);
    const medicineStore = new PersistentMedicineStore(storage);
    const preferencesStore = new PersistentPreferencesStore(storage);
    const reminders = { cancelAll: jest.fn().mockResolvedValue(undefined) };

    // 1. Seed actual data in all real stores
    await caseStore.create({
      issueType: 'fraud',
      company: 'Fake App',
      amount: '5000',
    });
    await moneyStore.addPerson('Ramesh', 'Parent');
    await moneyStore.updatePlaceRecord('me', 'epfo', { status: 'found_money', amount: '12000' });
    await medicineStore.add({
      personId: 'me',
      name: 'Aspirin',
      brandPricePerStrip: '100',
      stripsPerMonth: 1,
    });
    await preferencesStore.set({ language: 'gu', remindersEnabled: true, theme: 'dark' });

    // 2. Seed corrupt-data backup keys for all four stores
    await storage.setItem(`${CASES_STORAGE_KEY}_backup_20261125_0001`, '{"corrupt": true}');
    await storage.setItem(`${MONEY_STORAGE_KEY}_backup_20261125_0001`, '{"corrupt": true}');
    await storage.setItem(`${MEDICINES_STORAGE_KEY}_backup_20261125_0001`, '{"corrupt": true}');
    await storage.setItem(`${PREFERENCES_STORAGE_KEY}_backup_20261125_0001`, '{"corrupt": true}');

    // 3. Seed legacy key and notification prompt key
    await storage.setItem('dastak_legacy_v0_data', '{"old": 123}');
    await storage.setItem('dastak_notifications_prompted', 'true');

    // Verify storage has multiple keys before delete
    const keysBefore = await storage.getAllKeys();
    expect(keysBefore.length).toBeGreaterThanOrEqual(8);

    // 4. Run delete-all
    const result = await deleteAllUserData({
      caseStore,
      moneyStore,
      medicineStore,
      preferencesStore,
      reminders,
      storage,
    });

    expect(result.ok).toBe(true);
    expect(result.failed).toEqual([]);
    expect(reminders.cancelAll).toHaveBeenCalledTimes(1);

    // 5. Assert fake storage contains ONLY the language preference
    const keysAfter = await storage.getAllKeys();
    expect(keysAfter).toEqual([PREFERENCES_STORAGE_KEY]);

    const prefsRaw = await storage.getItem(PREFERENCES_STORAGE_KEY);
    expect(prefsRaw).not.toBeNull();
    const prefsDoc = JSON.parse(prefsRaw!);
    expect(prefsDoc.preferences.language).toBe('gu');
    expect(prefsDoc.preferences.remindersEnabled).toBe(false);

    // Verify stores themselves are empty
    expect((await caseStore.list()).length).toBe(0);
    expect((await medicineStore.getAll()).length).toBe(0);
  });

  it('runs all steps even if one clear throws, collects failures, and reports ok=false', async () => {
    const storage = new FakeKeyValueStorage();
    const caseStore = new PersistentCaseStore(storage);
    const moneyStore = new PersistentMoneyStore(storage);
    const medicineStore = new PersistentMedicineStore(storage);
    const preferencesStore = new PersistentPreferencesStore(storage);
    const reminders = { cancelAll: jest.fn().mockResolvedValue(undefined) };

    const moneyClearSpy = jest.spyOn(moneyStore, 'clear');
    const medicineClearSpy = jest.spyOn(medicineStore, 'clear');

    // Force caseStore.clear to throw an error
    jest.spyOn(caseStore, 'clear').mockRejectedValue(new Error('Simulated disk error'));

    const result = await deleteAllUserData({
      caseStore,
      moneyStore,
      medicineStore,
      preferencesStore,
      reminders,
      storage,
    });

    expect(result.ok).toBe(false);
    expect(result.failed).toContain('caseStore');

    // Verify subsequent steps still ran
    expect(moneyClearSpy).toHaveBeenCalledTimes(1);
    expect(medicineClearSpy).toHaveBeenCalledTimes(1);
    expect(reminders.cancelAll).toHaveBeenCalledTimes(1);
  });

  it('updates in-memory React contexts to empty state immediately after delete without restart', async () => {
    const storage = new FakeKeyValueStorage();
    const caseStore = new PersistentCaseStore(storage);
    const moneyStore = new PersistentMoneyStore(storage);
    const medicineStore = new PersistentMedicineStore(storage);

    // Seed data
    await caseStore.create({ issueType: 'fraud', company: 'Test App' });
    await medicineStore.add({
      personId: 'me',
      name: 'Metformin',
      brandPricePerStrip: '50',
      stripsPerMonth: 1,
    });

    const ConsumerComponent = () => {
      const { cases, clearCases } = useCases();
      const { medicines, clearMedicines } = useMedicines();
      const { people, clearMoney } = useMoney();

      return (
        <View>
          <Text testID="cases-count">{cases.length}</Text>
          <Text testID="meds-count">{medicines.length}</Text>
          <Text testID="people-count">{people.length}</Text>
          <Button
            label="Trigger Delete"
            onPress={async () => {
              await clearCases();
              await clearMedicines();
              await clearMoney();
            }}
          />
        </View>
      );
    };

    await render(
      <CasesProvider store={caseStore}>
        <MoneyProvider store={moneyStore}>
          <MedicinesProvider initialStore={medicineStore}>
            <ConsumerComponent />
          </MedicinesProvider>
        </MoneyProvider>
      </CasesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cases-count').props.children).toBe(1);
      expect(screen.getByTestId('meds-count').props.children).toBe(1);
      expect(screen.getByTestId('people-count').props.children).toBe(1);
    });

    fireEvent.press(screen.getByText('Trigger Delete'));

    await waitFor(() => {
      expect(screen.getByTestId('cases-count').props.children).toBe(0);
      expect(screen.getByTestId('meds-count').props.children).toBe(0);
      expect(screen.getByTestId('people-count').props.children).toBe(1); // Reset to default 'me'
    });
  });

  it('fails closed when storage lacks getAllKeys and UI displays failure alert', async () => {
    const storageWithoutGetAllKeys: KeyValueStorage = {
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };

    const caseStore = new PersistentCaseStore(storageWithoutGetAllKeys);
    const moneyStore = new PersistentMoneyStore(storageWithoutGetAllKeys);
    const medicineStore = new PersistentMedicineStore(storageWithoutGetAllKeys);
    const preferencesStore = new PersistentPreferencesStore(storageWithoutGetAllKeys);
    const reminders = { cancelAll: jest.fn().mockResolvedValue(undefined) };

    const services = {
      caseStore,
      moneyStore,
      medicineStore,
      preferencesStore,
      reminders,
      storage: storageWithoutGetAllKeys,
    };

    const result = await deleteAllUserData(services);
    expect(result.ok).toBe(false);
    expect(result.failed).toContain('storage:getAllKeysMissing');

    const alertSpy = jest.spyOn(Alert, 'alert');

    await render(
      <LanguageProvider>
        <ThemeProvider>
          <CasesProvider store={caseStore}>
            <MoneyProvider store={moneyStore}>
              <MedicinesProvider initialStore={medicineStore}>
                <PrivacySection services={services} />
              </MedicinesProvider>
            </MoneyProvider>
          </CasesProvider>
        </ThemeProvider>
      </LanguageProvider>
    );

    fireEvent.press(screen.getByText('Delete everything'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete all data?',
      'This cannot be undone. All your saved complaints, notes, and records will be permanently removed.',
      expect.any(Array)
    );

    const alertButtons = alertSpy.mock.calls[0][2] as {
      text: string;
      style?: string;
      onPress?: () => Promise<void> | void;
    }[];
    const confirmButton = alertButtons.find((b) => b.style === 'destructive');
    expect(confirmButton).toBeDefined();

    await confirmButton?.onPress?.();

    expect(alertSpy).toHaveBeenLastCalledWith(
      'OK',
      'We could not delete everything. Please try again.'
    );
  });
});
