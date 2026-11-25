import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Medicine, MedicineTotals } from './types';
import { calculateTotals } from './helpers';
import {
  PersistentMedicineStore,
  MEDICINES_STORAGE_KEY,
  CURRENT_MEDICINES_VERSION,
  StoredMedicinesDocument,
  migrateMedicinesData,
} from './storage';

export {
  PersistentMedicineStore,
  MEDICINES_STORAGE_KEY,
  CURRENT_MEDICINES_VERSION,
  StoredMedicinesDocument,
  migrateMedicinesData,
};

export interface MedicinesContextValue {
  medicines: Medicine[];
  totals: MedicineTotals;
  globalTotals: MedicineTotals;
  isLoading: boolean;
  hadCorruptedData: boolean;
  addMedicine: (item: Omit<Medicine, 'id'>) => Promise<Medicine>;
  updateMedicine: (
    id: string,
    updates: Partial<Omit<Medicine, 'id' | 'personId'>>
  ) => Promise<Medicine>;
  removeMedicine: (id: string) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  removeByPerson: (personId: string) => Promise<void>;
  getMedicinesForPerson: (personId: string) => Medicine[];
  personMedicines: (personId: string) => Medicine[];
  getTotalsForPerson: (personId: string) => MedicineTotals;
  personTotals: (personId: string) => MedicineTotals;
  refresh: () => Promise<void>;
}

export type MedicineContextValue = MedicinesContextValue;

const MedicinesContext = createContext<MedicinesContextValue | undefined>(undefined);

let globalMedicineStoreInstance: PersistentMedicineStore | null = null;
export function getPersistentMedicineStore(): PersistentMedicineStore {
  if (!globalMedicineStoreInstance) {
    globalMedicineStoreInstance = new PersistentMedicineStore();
  }
  return globalMedicineStoreInstance;
}

export const MedicinesProvider: React.FC<{
  children: React.ReactNode;
  initialStore?: PersistentMedicineStore;
  store?: PersistentMedicineStore;
}> = ({ children, initialStore, store: storeProp }) => {
  const [store] = useState(() => storeProp || initialStore || getPersistentMedicineStore());
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hadCorruptedData, setHadCorruptedData] = useState(false);

  const refresh = useCallback(async () => {
    const list = await store.getAll();
    setMedicines(list);
    setHadCorruptedData(store.hadCorruptedData);
  }, [store]);

  useEffect(() => {
    let isMounted = true;
    store.getAll().then((list) => {
      if (!isMounted) return;
      setMedicines(list);
      setHadCorruptedData(store.hadCorruptedData);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [store]);

  const addMedicine = useCallback(
    async (item: Omit<Medicine, 'id'>): Promise<Medicine> => {
      const created = await store.add(item);
      await refresh();
      return created;
    },
    [store, refresh]
  );

  const updateMedicine = useCallback(
    async (id: string, updates: Partial<Omit<Medicine, 'id' | 'personId'>>): Promise<Medicine> => {
      const updated = await store.update(id, updates);
      await refresh();
      return updated;
    },
    [store, refresh]
  );

  const removeMedicine = useCallback(
    async (id: string): Promise<void> => {
      await store.remove(id);
      await refresh();
    },
    [store, refresh]
  );

  const removeByPerson = useCallback(
    async (personId: string): Promise<void> => {
      await store.removeByPerson(personId);
      await refresh();
    },
    [store, refresh]
  );

  const getMedicinesForPerson = useCallback(
    (personId: string): Medicine[] => {
      return medicines.filter((m) => m.personId === personId);
    },
    [medicines]
  );

  const getTotalsForPerson = useCallback(
    (personId: string): MedicineTotals => {
      const personMeds = medicines.filter((m) => m.personId === personId);
      return calculateTotals(personMeds);
    },
    [medicines]
  );

  const totals = calculateTotals(medicines);

  return React.createElement(
    MedicinesContext.Provider,
    {
      value: {
        medicines,
        totals,
        globalTotals: totals,
        isLoading,
        hadCorruptedData,
        addMedicine,
        updateMedicine,
        removeMedicine,
        deleteMedicine: removeMedicine,
        removeByPerson,
        getMedicinesForPerson,
        personMedicines: getMedicinesForPerson,
        getTotalsForPerson,
        personTotals: getTotalsForPerson,
        refresh,
      },
    },
    children
  );
};

export const MedicineProvider = MedicinesProvider;

export const useMedicines = (): MedicinesContextValue => {
  const context = useContext(MedicinesContext);
  if (!context) {
    throw new Error('useMedicines must be used within a MedicinesProvider');
  }
  return context;
};
