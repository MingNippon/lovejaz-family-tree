import React, { createContext, useContext, useState, useEffect } from 'react';
import { VisualThemeId, ThemeConfig } from '../types/theme';
import { THEMES } from '../engine/themes';

export interface ThemeContextType {
  theme: VisualThemeId;
  setTheme: (theme: VisualThemeId) => void;
  themeConfig: ThemeConfig;
  isDark: boolean;
  isPink: boolean;
  isLight: boolean;
  isNavy: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = 'lovejaz_active_theme';

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: VisualThemeId;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
}) => {
  const [theme, setThemeState] = useState<VisualThemeId>(() => {
    if (initialTheme && THEMES[initialTheme]) {
      return initialTheme;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as VisualThemeId;
        if (saved && THEMES[saved]) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return 'dark'; // default theme
  });

  const setTheme = (newTheme: VisualThemeId) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch {
          // ignore
        }
      }
    }
  };

  const themeConfig = THEMES[theme] || THEMES.dark;
  const isDark = themeConfig.isDark;
  const isPink = theme === 'pink';
  const isLight = theme === 'minimalist';
  const isNavy = theme === 'navy';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'minimalist' || theme === 'vintage') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig,
        isDark,
        isPink,
        isLight,
        isNavy,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return fallback if outside provider
    const fallbackTheme: VisualThemeId = 'dark';
    return {
      theme: fallbackTheme,
      setTheme: () => {},
      themeConfig: THEMES[fallbackTheme],
      isDark: true,
      isPink: false,
      isLight: false,
      isNavy: false,
    };
  }
  return context;
}
