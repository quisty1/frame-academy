import { useCallback, useEffect, useState } from 'react';
import {
  parseThemePreference,
  readThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
} from './theme';
import type { ThemePreference } from './theme';
function apply(preference: ThemePreference, systemDark: boolean) {
  const theme = resolveTheme(preference, systemDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#202020' : '#ffffff');
}
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => apply(preference, media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [preference]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null)
        setPreference(parseThemePreference(event.newValue));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    apply(next, matchMedia('(prefers-color-scheme: dark)').matches);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Appearance remains usable when storage is unavailable. */
    }
  }, []);
  return { preference, setTheme };
}
