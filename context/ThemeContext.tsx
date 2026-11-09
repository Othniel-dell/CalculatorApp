import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from '../constants/Colors';

const THEME_STORAGE_KEY = '@calculator/theme';

type ThemeMode = 'dark' | 'light';

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
        }
      })
      .catch((err) => {
        console.error('Failed to load saved theme preference:', err);
      });
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch((err) => {
      console.error('Failed to save theme preference:', err);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((err) => {
        console.error('Failed to save theme preference:', err);
      });
      return next;
    });
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        colors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
