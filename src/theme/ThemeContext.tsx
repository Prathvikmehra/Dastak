import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from './colors';
import { typography } from './typography';
import { spacing, minTouchTarget } from './spacing';
import { radius } from './radius';
import { defaultPreferencesStore, PreferencesStore } from '../features/settings/preferences';
import { logger } from '../lib/logger';

export type ColorSchemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: ColorTokens;
  isDark: boolean;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  minTouchTarget: number;
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  preferencesStore?: PreferencesStore;
  initialMode?: ColorSchemeMode;
}> = ({ children, preferencesStore = defaultPreferencesStore, initialMode }) => {
  const [mode, setModeState] = useState<ColorSchemeMode>(initialMode || 'light');
  const deviceScheme = useDeviceColorScheme();

  useEffect(() => {
    let isMounted = true;
    if (initialMode) return;
    preferencesStore
      .get()
      .then((prefs) => {
        if (!isMounted) return;
        if (prefs.theme) {
          setModeState(prefs.theme);
        }
      })
      .catch((err) => {
        logger.warn('Failed loading theme preference', err);
      });

    return () => {
      isMounted = false;
    };
  }, [preferencesStore, initialMode]);

  const setMode = useCallback(
    (newMode: ColorSchemeMode) => {
      setModeState(newMode);
      preferencesStore.set({ theme: newMode }).catch((err) => {
        logger.warn('Failed saving theme preference', err);
      });
    },
    [preferencesStore]
  );

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return deviceScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, deviceScheme]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo<Theme>(
    () => ({
      colors,
      isDark,
      typography,
      spacing,
      radius,
      minTouchTarget,
      mode,
      setMode,
    }),
    [colors, isDark, mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      colors: lightColors,
      isDark: false,
      typography,
      spacing,
      radius,
      minTouchTarget,
      mode: 'light',
      setMode: () => {},
    };
  }
  return context;
};
