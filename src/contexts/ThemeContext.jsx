import React, { createContext, useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'theme-preference';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

/**
 * Theme Provider component that manages light/dark mode
 * - Persists preference to localStorage
 * - Respects prefers-color-scheme on first visit
 * - Sets data-theme attribute on document root
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      // First, check if inline script already set data-theme (prevents flash)
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      if (htmlTheme === 'dark' || htmlTheme === 'light') {
        return htmlTheme;
      }
      // Fallback: check localStorage
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      // Fall back to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1814' : '#f8f9fc');
    }
    
    // Enable transitions after initial theme is applied
    // This prevents gradient flash on page load
    if (!root.classList.contains('theme-ready')) {
      // Use requestAnimationFrame to ensure the theme is fully painted
      // before enabling transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.add('theme-ready');
        });
      });
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem(THEME_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Only an explicit toggle is persisted; until then the site follows the OS setting
  // (persisting on every mount made the system-preference listener above dead code).
  const toggleTheme = useCallback(() => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
