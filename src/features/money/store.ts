import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Person, PlaceRecord, MoneyPlaceStatus, Relationship, MoneySummary } from './types';
import { summarize } from './helpers';
import {
  PersistentMoneyStore,
  MONEY_STORAGE_KEY,
  CURRENT_MONEY_VERSION,
  DEFAULT_PERSON,
  StoredMoneyDocument,
  migrateMoneyData,
} from './storage';

export {
  PersistentMoneyStore,
  MONEY_STORAGE_KEY,
  CURRENT_MONEY_VERSION,
  DEFAULT_PERSON,
  StoredMoneyDocument,
  migrateMoneyData,
};

export interface MoneyContextValue {
  people: Person[];
  activePersonId: string;
  setActivePersonId: (id: string) => void;
  activePerson: Person;
  selectedPersonId: string;
  selectedPerson: Person;
  records: Record<string, PlaceRecord>;
  summary: MoneySummary;
  isLoading: boolean;
  hadCorruptedData: boolean;
  selectPerson: (id: string) => void;
  addPerson: (name: string, relationship?: Relationship) => Promise<Person>;
  removePerson: (id: string) => Promise<void>;
  updatePlace: (
    placeId: string,
    updates: {
      status: MoneyPlaceStatus;
      amount?: string;
      amountFound?: string;
      reference?: string;
      note?: string;
    }
  ) => Promise<PlaceRecord>;
  updateRecord: (
    placeId: string,
    data: {
      status: MoneyPlaceStatus;
      amount?: string;
      amountFound?: string;
      reference?: string;
      note?: string;
    }
  ) => Promise<PlaceRecord>;
  clearMoney: () => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultMoneyStore = new PersistentMoneyStore();
const MoneyContext = createContext<MoneyContextValue | null>(null);

export function MoneyProvider({
  store = defaultMoneyStore,
  children,
}: {
  store?: PersistentMoneyStore;
  children: React.ReactNode;
}) {
  const [people, setPeople] = useState<Person[]>([{ ...DEFAULT_PERSON }]);
  const [activePersonId, setActivePersonIdState] = useState<string>('me');
  const [records, setRecords] = useState<Record<string, PlaceRecord>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hadCorruptedData, setHadCorruptedData] = useState(false);

  const loadData = useCallback(async () => {
    const p = await store.listPeople();
    setPeople(p);
    const validPersonId = p.some((person) => person.id === activePersonId) ? activePersonId : 'me';
    setActivePersonIdState(validPersonId);
    const r = await store.getPersonRecords(validPersonId);
    setRecords(r);
    setHadCorruptedData(store.hadCorruptedData);
  }, [store, activePersonId]);

  useEffect(() => {
    let isMounted = true;
    store.listPeople().then((p) => {
      if (!isMounted) return;
      setPeople(p);
      store.getPersonRecords('me').then((r) => {
        if (!isMounted) return;
        setRecords(r);
        setHadCorruptedData(store.hadCorruptedData);
        setIsLoading(false);
      });
    });
    return () => {
      isMounted = false;
    };
  }, [store]);

  const setActivePersonId = useCallback(
    async (id: string) => {
      setActivePersonIdState(id);
      const r = await store.getPersonRecords(id);
      setRecords(r);
    },
    [store]
  );

  const addPerson = useCallback(
    async (name: string, relationship?: Relationship): Promise<Person> => {
      const created = await store.addPerson(name, relationship);
      await loadData();
      setActivePersonIdState(created.id);
      return created;
    },
    [store, loadData]
  );

  const removePerson = useCallback(
    async (id: string): Promise<void> => {
      await store.removePerson(id);
      if (activePersonId === id) {
        setActivePersonIdState('me');
      }
      await loadData();
    },
    [store, activePersonId, loadData]
  );

  const updatePlace = useCallback(
    async (
      placeId: string,
      updates: {
        status: MoneyPlaceStatus;
        amount?: string;
        amountFound?: string;
        reference?: string;
        note?: string;
      }
    ): Promise<PlaceRecord> => {
      const updated = await store.updatePlaceRecord(activePersonId, placeId, updates);
      const r = await store.getPersonRecords(activePersonId);
      setRecords(r);
      return updated;
    },
    [store, activePersonId]
  );

  const clearMoney = useCallback(async (): Promise<void> => {
    await store.clear();
    setPeople([{ ...DEFAULT_PERSON }]);
    setActivePersonIdState('me');
    setRecords({});
  }, [store]);

  const activePerson = people.find((p) => p.id === activePersonId) || people[0] || DEFAULT_PERSON;
  const summary = summarize(records);

  const value: MoneyContextValue = {
    people,
    activePersonId,
    setActivePersonId,
    activePerson,
    selectedPersonId: activePersonId,
    selectedPerson: activePerson,
    records,
    summary,
    isLoading,
    hadCorruptedData,
    selectPerson: setActivePersonId,
    addPerson,
    removePerson,
    updatePlace,
    updateRecord: updatePlace,
    clearMoney,
    refresh: loadData,
  };

  return React.createElement(MoneyContext.Provider, { value }, children);
}

export function useMoney(): MoneyContextValue {
  const ctx = useContext(MoneyContext);
  if (!ctx) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return ctx;
}
