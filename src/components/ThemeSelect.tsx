import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import type { ThemePreference } from '../lib/theme';
export function ThemeSelect() {
  const { preference, setTheme } = useTheme();
  const Icon = preference === 'system' ? Monitor : preference === 'light' ? Sun : Moon;
  return (
    <label className="appearance-select">
      <Icon size={14} />
      <select
        aria-label="Тема интерфейса"
        value={preference}
        onChange={(e) => setTheme(e.target.value as ThemePreference)}
      >
        <option value="system">Системная</option>
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </select>
    </label>
  );
}
