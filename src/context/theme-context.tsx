import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface Point {
  x: number;
  y: number;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
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
      const apply = () => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
          localStorage.setItem('domonote_theme', newTheme);
          applyThemeToDOM(newTheme);
        }
      };

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Native circular view transition optimized for smooth 60-120 FPS on all platforms (including Windows)
      if (
        !prefersReducedMotion &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document
      ) {
        const root = document.documentElement;
        root.classList.add('theme-transitioning');

        // Radiate directly from the click origin / toggle position
        const startX = origin?.x ?? window.innerWidth - 60;
        const startY = origin?.y ?? 50;

        const endRadius = Math.hypot(
          Math.max(startX, window.innerWidth - startX),
          Math.max(startY, window.innerHeight - startY)
        );

        const cleanup = () => {
          root.classList.remove('theme-transitioning');
        };

        try {
          const transition = (document as any).startViewTransition(() => {
            apply();
          });

          transition.ready.then(() => {
            const animation = root.animate(
              {
                clipPath: [
                  `circle(0px at ${startX}px ${startY}px)`,
                  `circle(${endRadius}px at ${startX}px ${startY}px)`,
                ],
              },
              {
                duration: 320,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                pseudoElement: '::view-transition-new(root)',
              }
            );

            animation.onfinish = cleanup;
            animation.oncancel = cleanup;
          });

          transition.finished.finally(cleanup);
        } catch {
          cleanup();
          apply();
        }
      } else {
        apply();
      }
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
  }, [theme, applyThemeToDOM]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
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
