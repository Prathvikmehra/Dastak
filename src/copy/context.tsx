import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Copy, AppLanguage } from './types';
import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';
import { defaultPreferencesStore } from '../features/settings/preferences';
import { logger } from '../lib/logger';
import { detectDeviceLanguage } from '../lib/locale';

export const COPY_MAP: Record<AppLanguage, Copy> = {
  en,
  hi,
  gu,
};

export { detectDeviceLanguage };

export interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  copy: Copy;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    defaultPreferencesStore
      .get()
      .then((prefs) => {
        if (!isMounted) return;
        const stored = prefs.language as AppLanguage;
        if (stored === 'en' || stored === 'hi' || stored === 'gu') {
          setLanguageState(stored);
        } else {
          const detected = detectDeviceLanguage();
          setLanguageState(detected);
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        logger.warn('Failed loading language preference', err);
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = async (newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      await defaultPreferencesStore.set({ language: newLang });
    } catch (err) {
      logger.error('Failed saving language preference', err);
    }
  };

  const copy = COPY_MAP[language] || en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, copy, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'en',
      setLanguage: async () => {},
      copy: en,
      isLoaded: true,
    };
  }
  return ctx;
}

export function useCopy(): Copy {
  const ctx = useContext(LanguageContext);
  return ctx ? ctx.copy : en;
}
