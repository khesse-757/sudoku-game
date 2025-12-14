import { useStore } from '../../store';
import { Palette } from 'lucide-react';
import type { ThemeName } from '../../types';
import styles from './ThemeSwitcher.module.css';

const ThemeSwitcher = () => {
  const theme = useStore((state) => state.settings.theme);
  const setTheme = useStore((state) => state.setTheme);

  const themes: { name: ThemeName; label: string }[] = [
    { name: 'clean', label: 'Clean' },
    { name: 'green', label: 'Green' },
    { name: 'amber', label: 'Amber' },
    { name: 'paper', label: 'Paper' },
    { name: 'monochrome', label: 'Mono' },
  ];

  return (
    <div className={styles.themeSwitcher}>
      <div className={styles.label}>
        <Palette size={16} />
        <span>THEME</span>
      </div>
      <div className={styles.themes}>
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`${styles.themeButton} ${theme === t.name ? styles.active : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;