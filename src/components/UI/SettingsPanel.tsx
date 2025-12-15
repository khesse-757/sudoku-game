import { useState } from 'react';
import { X, RotateCcw, Lightbulb, CheckCircle, AlertCircle, Eye, EyeOff, RefreshCw, Check, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { ThemeName, Difficulty } from '../../types';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const theme = useStore((state) => state.settings.theme);
  const setTheme = useStore((state) => state.setTheme);
  const gameplay = useStore((state) => state.settings.gameplay);
  const setGameplaySetting = useStore((state) => state.setGameplaySetting);
  const difficulty = useStore((state) => state.game.difficulty);
  const startNewGame = useStore((state) => state.startNewGame);
  const mistakes = useStore((state) => state.game.mistakes);
  const hintsRemaining = useStore((state) => state.game.hintsRemaining);
  const stats = useStore((state) => state.stats);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const canUndo = useStore((state) => state.canUndo());
  const canRedo = useStore((state) => state.canRedo());
  const useHint = useStore((state) => state.useHint);
  const checkCell = useStore((state) => state.checkCell);
  const checkPuzzle = useStore((state) => state.checkPuzzle);
  const revealCell = useStore((state) => state.revealCell);
  const revealPuzzle = useStore((state) => state.revealPuzzle);
  const resetPuzzle = useStore((state) => state.resetPuzzle);
  const resetStats = useStore((state) => state.resetStats);
  const selectedCell = useStore((state) => state.game.selectedCell);

  const [feedback, setFeedback] = useState<string | null>(null);

  // Safe access to gameplay settings with defaults
  const autoCheckMistakes = gameplay?.autoCheckMistakes ?? true;
  const highlightConflicts = gameplay?.highlightConflicts ?? true;
  const highlightRowColumn = gameplay?.highlightRowColumn ?? true;
  const highlightBox = gameplay?.highlightBox ?? true;
  const highlightIdentical = gameplay?.highlightIdentical ?? true;
  const showTimer = gameplay?.showTimer ?? true;
  const showMistakes = gameplay?.showMistakes ?? true;
  const autoNotes = gameplay?.autoNotes ?? false;

  const themes: { name: ThemeName; label: string }[] = [
    { name: 'light', label: 'Light' },
    { name: 'dark', label: 'Dark' },
    { name: 'clean', label: 'Clean' },
    { name: 'paper', label: 'Paper' },
    { name: 'green', label: 'Terminal Green' },
    { name: 'amber', label: 'Terminal Amber' },
    { name: 'ocean', label: 'Ocean' },
    { name: 'monochrome', label: 'Monochrome' },
  ];

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleNewGame = (diff: Difficulty) => {
    if (confirm(`Start a new ${diff} game? Current progress will be lost.`)) {
      startNewGame(diff);
      onClose();
    }
  };

  const handleCheckCell = () => {
    if (!selectedCell) {
      showFeedback('Select a cell first');
      return;
    }
    const result = checkCell();
    if (!result.checked) {
      showFeedback('Cell is empty');
    } else if (result.correct) {
      showFeedback('✓ Correct!');
    } else {
      showFeedback('✗ Incorrect');
    }
  };

  const handleCheckPuzzle = () => {
    const result = checkPuzzle();
    if (result.total === 0) {
      showFeedback('No cells to check');
    } else if (result.incorrect === 0) {
      showFeedback(`✓ All ${result.correct} entries correct!`);
    } else {
      showFeedback(`${result.correct} correct, ${result.incorrect} incorrect`);
    }
  };

  const handleRevealCell = () => {
    if (!selectedCell) {
      showFeedback('Select a cell first');
      return;
    }
    const revealed = revealCell();
    if (revealed) {
      showFeedback('Cell revealed');
    } else {
      showFeedback('Cell already correct');
    }
  };

  const handleRevealPuzzle = () => {
    if (confirm('Reveal the entire solution? This will end the game.')) {
      revealPuzzle();
      showFeedback('Puzzle revealed');
      onClose();
    }
  };

  const handleResetPuzzle = () => {
    if (confirm('Reset the puzzle? All your progress will be cleared.')) {
      resetPuzzle();
      showFeedback('Puzzle reset');
    }
  };

  const handleResetStats = () => {
    if (confirm('Reset all statistics? This cannot be undone.')) {
      resetStats();
      showFeedback('Statistics reset');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Menu</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Feedback Toast */}
        {feedback && (
          <div className={styles.feedback}>
            {feedback}
          </div>
        )}

        <div className={styles.content}>
          {/* New Game Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>New Game</h3>
            <div className={styles.buttonGroup}>
              <button 
                onClick={() => handleNewGame('easy')}
                className={`${styles.difficultyButton} ${difficulty === 'easy' ? styles.active : ''}`}
              >
                Easy
              </button>
              <button 
                onClick={() => handleNewGame('medium')}
                className={`${styles.difficultyButton} ${difficulty === 'medium' ? styles.active : ''}`}
              >
                Medium
              </button>
              <button 
                onClick={() => handleNewGame('hard')}
                className={`${styles.difficultyButton} ${difficulty === 'hard' ? styles.active : ''}`}
              >
                Hard
              </button>
            </div>
          </section>

          {/* Game Actions */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Game Actions</h3>
            <div className={styles.actionGrid}>
              <button 
                onClick={undo}
                disabled={!canUndo}
                className={styles.actionButton}
              >
                <RotateCcw size={18} />
                <span>Undo</span>
              </button>
              <button 
                onClick={redo}
                disabled={!canRedo}
                className={styles.actionButton}
              >
                <RotateCcw size={18} style={{ transform: 'scaleX(-1)' }} />
                <span>Redo</span>
              </button>
              <button 
                onClick={useHint}
                disabled={hintsRemaining <= 0 || difficulty === 'hard'}
                className={styles.actionButton}
                title={difficulty === 'hard' ? 'No hints in Hard mode' : `${hintsRemaining} hints remaining`}
              >
                <Lightbulb size={18} />
                <span>Hint ({difficulty === 'hard' ? 0 : hintsRemaining})</span>
              </button>
              <button 
                onClick={handleResetPuzzle}
                className={styles.actionButton}
              >
                <RefreshCw size={18} />
                <span>Reset</span>
              </button>
            </div>
          </section>

          {/* Check & Reveal */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Check & Reveal</h3>
            <div className={styles.actionGrid}>
              <button 
                onClick={handleCheckCell}
                className={styles.actionButton}
              >
                <Check size={18} />
                <span>Check Cell</span>
              </button>
              <button 
                onClick={handleCheckPuzzle}
                className={styles.actionButton}
              >
                <CheckCircle size={18} />
                <span>Check All</span>
              </button>
              <button 
                onClick={handleRevealCell}
                className={styles.actionButton}
              >
                <Eye size={18} />
                <span>Reveal Cell</span>
              </button>
              <button 
                onClick={handleRevealPuzzle}
                className={`${styles.actionButton} ${styles.dangerButton}`}
              >
                <EyeOff size={18} />
                <span>Reveal All</span>
              </button>
            </div>
          </section>

          {/* Gameplay Options */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Gameplay Options</h3>
            <div className={styles.toggleList}>
              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Auto notes</span>
                <input
                  type="checkbox"
                  checked={autoNotes}
                  onChange={(e) => setGameplaySetting('autoNotes', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Auto-check mistakes</span>
                <input
                  type="checkbox"
                  checked={autoCheckMistakes}
                  onChange={(e) => setGameplaySetting('autoCheckMistakes', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Highlight conflicts</span>
                <input
                  type="checkbox"
                  checked={highlightConflicts}
                  onChange={(e) => setGameplaySetting('highlightConflicts', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Highlight row & column</span>
                <input
                  type="checkbox"
                  checked={highlightRowColumn}
                  onChange={(e) => setGameplaySetting('highlightRowColumn', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Highlight box</span>
                <input
                  type="checkbox"
                  checked={highlightBox}
                  onChange={(e) => setGameplaySetting('highlightBox', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Highlight identical numbers</span>
                <input
                  type="checkbox"
                  checked={highlightIdentical}
                  onChange={(e) => setGameplaySetting('highlightIdentical', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Show timer</span>
                <input
                  type="checkbox"
                  checked={showTimer}
                  onChange={(e) => setGameplaySetting('showTimer', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleLabel}>Show mistakes counter</span>
                <input
                  type="checkbox"
                  checked={showMistakes}
                  onChange={(e) => setGameplaySetting('showMistakes', e.target.checked)}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSwitch}></span>
              </label>
            </div>
          </section>

          {/* Theme Selection */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Theme</h3>
            <div className={styles.themeGrid}>
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
          </section>

          {/* Statistics */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Games Won</div>
                  <div className={styles.statValue}>{stats.gamesCompleted}</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AlertCircle size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Mistakes</div>
                  <div className={styles.statValue}>{mistakes}</div>
                </div>
              </div>
            </div>
            <div className={styles.bestTimes}>
              <h4 className={styles.bestTimesTitle}>Best Times</h4>
              <div className={styles.bestTimesList}>
                <div className={styles.bestTime}>
                  <span>Easy:</span>
                  <span>{formatTime(stats.bestTimes.easy)}</span>
                </div>
                <div className={styles.bestTime}>
                  <span>Medium:</span>
                  <span>{formatTime(stats.bestTimes.medium)}</span>
                </div>
                <div className={styles.bestTime}>
                  <span>Hard:</span>
                  <span>{formatTime(stats.bestTimes.hard)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleResetStats}
              className={`${styles.resetStatsButton}`}
            >
              <Trash2 size={16} />
              <span>Reset Statistics</span>
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;