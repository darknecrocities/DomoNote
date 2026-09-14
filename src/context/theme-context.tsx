import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface Point {
  x: number;
  y: number;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isTransitioning: boolean;
  transitionTheme: ThemeMode | null;
  transitionOrigin: Point | null;
  setTheme: (theme: ThemeMode, origin?: Point) => void;
  toggleTheme: (origin?: Point) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('domonote_theme') as ThemeMode;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark'; // Dark mode is default
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState<ThemeMode | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<Point | null>(null);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const applyThemeToDOM = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode, origin?: Point) => {
      // Clear any pending transition timers
      timerRef.current.forEach(clearTimeout);
      timerRef.current = [];

      // Determine origin (defaults to top-right if not provided)
      const defaultOrigin: Point = {
        x: typeof window !== 'undefined' ? window.innerWidth - 60 : 100,
        y: 28,
      };
      const finalOrigin = origin || defaultOrigin;

      // Start circular liquid wave
      setTransitionOrigin(finalOrigin);
      setTransitionTheme(newTheme);
      setIsTransitioning(true);

      // Halfway through expansion: apply new theme to DOM
      const domTimer = setTimeout(() => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
          localStorage.setItem('domonote_theme', newTheme);
          applyThemeToDOM(newTheme);
        }
      }, 260);

      // Clean up wave after full expansion and fade
      const endTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionTheme(null);
      }, 820);

      timerRef.current = [domTimer, endTimer];
    },
    [applyThemeToDOM]
  );

  const toggleTheme = useCallback(
    (origin?: Point) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme, origin);
    },
    [theme, setTheme]
  );

  useEffect(() => {
    applyThemeToDOM(theme);
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [theme, applyThemeToDOM]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      isTransitioning,
      transitionTheme,
      transitionOrigin,
      setTheme,
      toggleTheme,
    }),
    [theme, isTransitioning, transitionTheme, transitionOrigin, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
