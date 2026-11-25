import { defaultCaseStore } from '../cases/store';
import { getPersistentMedicineStore } from '../medicine/store';
import { defaultPreferencesStore, PreferencesStore } from './preferences';
import { defaultReminders } from '../cases/reminders';
import { PersistentMoneyStore } from '../money/storage';

export interface DeleteAllServices {
  caseStore?: { clear?: () => Promise<void> };
  moneyStore?: { clear?: () => Promise<void> };
  medicineStore?: { clear?: () => Promise<void> };
  preferencesStore?: PreferencesStore;
  reminders?: { cancelAll: () => Promise<void> };
  notificationsPort?: { cancelAllScheduled: () => Promise<void> };
}

export async function deleteAllUserData(services?: DeleteAllServices): Promise<void> {
  const caseStore = services?.caseStore ?? defaultCaseStore;
  const moneyStore = services?.moneyStore ?? new PersistentMoneyStore();
  const medicineStore = services?.medicineStore ?? getPersistentMedicineStore();
  const preferencesStore = services?.preferencesStore ?? defaultPreferencesStore;
  const reminders = services?.reminders ?? defaultReminders;

  if (caseStore?.clear) {
    await caseStore.clear();
  }
  if (moneyStore?.clear) {
    await moneyStore.clear();
  }
  if (medicineStore?.clear) {
    await medicineStore.clear();
  }
  if (reminders?.cancelAll) {
    await reminders.cancelAll();
  } else if (services?.notificationsPort?.cancelAllScheduled) {
    await services.notificationsPort.cancelAllScheduled();
  }
  if (preferencesStore?.reset) {
    await preferencesStore.reset(true);
  }
}
