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
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1814' : '#f8f3e8');
    }
    
    // Persist to localStorage
    localStorage.setItem(THEME_KEY, theme);
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

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

