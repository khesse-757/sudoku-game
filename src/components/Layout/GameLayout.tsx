import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { THEMES, FONTS } from '../../utils/constants';
import { useKeyboard } from '../../hooks/useKeyboard';
import NumberPad from '../Controls/NumberPad';
import VictoryModal from '../UI/VictoryModal';
import SettingsButton from '../UI/SettingsButton';
import SettingsPanel from '../UI/SettingsPanel';
import Grid from '../Grid/Grid';
import { Play, Pause, AlertCircle } from 'lucide-react';
import styles from './GameLayout.module.css';

const GameLayout = () => {
  const theme = useStore((state) => state.settings.theme);
  const font = useStore((state) => state.settings.font);
  const difficulty = useStore((state) => state.game.difficulty);
  const timer = useStore((state) => state.game.timer);
  const isPaused = useStore((state) => state.game.isPaused);
  const mistakes = useStore((state) => state.game.mistakes);
  const gameplay = useStore((state) => state.settings.gameplay);
  const startNewGame = useStore((state) => state.startNewGame);
  const incrementTimer = useStore((state) => state.incrementTimer);
  const pauseGame = useStore((state) => state.pauseGame);
  const resumeGame = useStore((state) => state.resumeGame);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Safe access to gameplay settings with defaults
  const showTimer = gameplay?.showTimer ?? true;
  const showMistakes = gameplay?.showMistakes ?? true;

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [incrementTimer]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const renderGameInfo = (iconSize: number) => (
    <div className={styles.gameInfoBar}>
      <span className={styles.difficulty}>{difficulty.toUpperCase()}</span>
      
      {showMistakes && mistakes > 0 && (
        <div className={styles.mistakesCounter}>
          <AlertCircle size={iconSize} />
          <span>{mistakes}</span>
        </div>
      )}
      
      {showTimer && (
        <div className={styles.timerSection}>
          <button 
            onClick={togglePause}
            className={styles.pauseButton}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={iconSize} /> : <Pause size={iconSize} />}
          </button>
          <span className={styles.timer}>{formatTime(timer)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.layout}>
      <VictoryModal />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <header className={styles.header}>
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        <h1 className={styles.title}>SUDOKU.TERMINAL</h1>
        <div className={styles.spacer}></div>
      </header>
      
      <main className={styles.main}>
        {/* Mobile: Stacked layout */}
        <div className={styles.mobileLayout}>
          {renderGameInfo(16)}
          <div className={styles.gridContainer}>
            <Grid />
          </div>
          <div className={styles.controls}>
            <NumberPad isPencilMode={isPencilMode} setIsPencilMode={setIsPencilMode} />
          </div>
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className={styles.desktopLayout}>
          <div className={styles.gridSection}>
            {renderGameInfo(18)}
            <Grid />
          </div>
          <div className={styles.numberPadSection}>
            <NumberPad isPencilMode={isPencilMode} setIsPencilMode={setIsPencilMode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameLayout;