import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from './colors';
import { typography } from './typography';
import { spacing, minTouchTarget } from './spacing';
import { radius } from './radius';

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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Light by default as specified in requirements
  const [mode, setMode] = useState<ColorSchemeMode>('light');
  const deviceScheme = useDeviceColorScheme();

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
    [colors, isDark, mode]
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
