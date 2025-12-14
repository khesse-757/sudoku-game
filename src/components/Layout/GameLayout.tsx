import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { THEMES, FONTS } from '../../utils/constants';
import { useKeyboard } from '../../hooks/useKeyboard';
import GameControls from '../Controls/GameControls';
import Timer from '../Controls/Timer';
import NumberPad from '../Controls/NumberPad';
import UndoRedo from '../Controls/UndoRedo';
import ThemeSwitcher from '../UI/ThemeSwitcher';
import VictoryModal from '../UI/VictoryModal';
import StatsPanel from '../UI/StatsPanel';
import Grid from '../Grid/Grid';
import styles from './GameLayout.module.css';

const GameLayout = () => {
  const theme = useStore((state) => state.settings.theme);
  const font = useStore((state) => state.settings.font);
  const startNewGame = useStore((state) => state.startNewGame);
  const [isPencilMode, setIsPencilMode] = useState(false);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const themeConfig = THEMES[theme];
    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty('--color-primary', themeConfig.primary);
    root.style.setProperty('--color-secondary', themeConfig.secondary);
    root.style.setProperty('--color-background', themeConfig.background);
    root.style.setProperty('--color-surface', themeConfig.surface);
    root.style.setProperty('--color-text', themeConfig.text);
    root.style.setProperty('--color-text-dim', themeConfig.textDim);
    root.style.setProperty('--color-error', themeConfig.error);
    root.style.setProperty('--color-success', themeConfig.success);
    root.style.setProperty('--color-border', themeConfig.border);

    // Set font
    root.style.setProperty('--font-family', FONTS[font]);

    // Set theme class
    document.body.className = `theme-${theme}`;
  }, [theme, font]);

  // Start a game on mount if none exists
  useEffect(() => {
    const hasExistingGame = useStore.getState().game.puzzle.some(row => row.some(cell => cell !== 0));
    if (!hasExistingGame) {
      startNewGame('medium');
    }
  }, [startNewGame]);

  useKeyboard(isPencilMode, setIsPencilMode);

  return (
    <div className={styles.layout}>
      <VictoryModal />
      
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className="terminal-glow">SUDOKU.TERMINAL</span>
        </h1>
      </header>
      
      <main className={styles.main}>
        <div className={styles.gameArea}>
          <ThemeSwitcher />
          <StatsPanel />
          <Timer />
          <UndoRedo />
          <GameControls />
          <Grid />
          <NumberPad isPencilMode={isPencilMode} setIsPencilMode={setIsPencilMode} />
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Arrow keys to navigate • 1-9 to enter • N for notes • Ctrl+Z to undo
        </p>
      </footer>
    </div>
  );
};

export default GameLayout;