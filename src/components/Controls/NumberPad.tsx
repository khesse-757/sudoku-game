import { useMemo } from 'react';
import { useStore } from '../../store';
import { Eraser, Edit3, RotateCcw, RefreshCw, Wand2 } from 'lucide-react';
import styles from './NumberPad.module.css';

interface NumberPadProps {
  isPencilMode: boolean;
  setIsPencilMode: (value: boolean) => void;
}

const NumberPad = ({ isPencilMode, setIsPencilMode }: NumberPadProps) => {
  const setNumber = useStore((state) => state.setNumber);
  const clearCell = useStore((state) => state.clearCell);
  const selectedCell = useStore((state) => state.game.selectedCell);
  const toggleNote = useStore((state) => state.toggleNote);
  const isPaused = useStore((state) => state.game.isPaused);
  const isComplete = useStore((state) => state.game.isComplete);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const canUndo = useStore((state) => state.canUndo());
  const canRedo = useStore((state) => state.canRedo());
  const resetPuzzle = useStore((state) => state.resetPuzzle);
  const setGameplaySetting = useStore((state) => state.setGameplaySetting);
  const userGrid = useStore((state) => state.game.userGrid);

  // Get autoNotes setting - when enabled, always enter numbers (notes are automatic)
  const autoNotes = useStore((state) => state.settings.gameplay?.autoNotes ?? false);

  // Count occurrences of each number to determine which are complete (9 instances)
  const completedNumbers = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;

    for (const row of userGrid) {
      for (const cell of row) {
        if (cell.value >= 1 && cell.value <= 9) {
          counts[cell.value]++;
        }
      }
    }

    const completed = new Set<number>();
    for (let i = 1; i <= 9; i++) {
      if (counts[i] >= 9) completed.add(i);
    }
    return completed;
  }, [userGrid]);

  // In notes mode, don't fade any numbers since they can all be candidates
  const isInNotesMode = isPencilMode;

  // Disable all inputs when paused or complete
  const isDisabled = isPaused || isComplete;

  const handleNumberClick = (num: number) => {
    if (!selectedCell || isDisabled) return;

    // In pencil mode, toggle notes (works with either layer based on autoNotes setting)
    // In pen mode, set the number
    if (isPencilMode) {
      toggleNote(num);
    } else {
      setNumber(num);
    }
  };

  const handleClear = () => {
    if (!selectedCell || isDisabled) return;
    clearCell();
  };

  const handleTogglePencilMode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setIsPencilMode(!isPencilMode);
  };

  const handleUndo = () => {
    if (isDisabled) return;
    undo();
  };

  const handleRedo = () => {
    if (isDisabled) return;
    redo();
  };

  const handleReset = () => {
    if (confirm('Reset the puzzle? All your progress will be cleared.')) {
      resetPuzzle();
    }
  };

  const handleToggleAutoNotes = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setGameplaySetting('autoNotes', !autoNotes);
  };

  // Notes button allows toggling candidates in either layer
  const notesDisabled = isDisabled;
  const notesActive = isPencilMode;

  return (
    <div className={styles.numberPad}>
      {/* Desktop: 3x3 grid with buttons */}
      <div className={styles.desktopPad}>
        <div className={styles.numbers}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isCompleted = !isInNotesMode && completedNumbers.has(num);
            const positionClass = isInNotesMode ? styles[`pos${num}`] : '';
            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                onMouseDown={(e) => e.preventDefault()}
                className={`${styles.numberButton} ${isCompleted ? styles.completed : ''} ${positionClass}`}
                disabled={!selectedCell || isDisabled}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleTogglePencilMode}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.actionButton} ${styles.notesButton} ${notesActive ? styles.active : ''}`}
            disabled={notesDisabled}
            title={autoNotes ? 'Notes are automatic' : 'Toggle notes mode'}
          >
            <Edit3 size={20} />
            <span>Notes</span>
          </button>
          <button
            onClick={handleToggleAutoNotes}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.actionButton} ${styles.autoButton} ${autoNotes ? styles.active : ''}`}
            disabled={isDisabled}
            title={autoNotes ? 'Auto notes on' : 'Auto notes off'}
          >
            <Wand2 size={20} />
            <span>Auto</span>
          </button>
          <button
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.actionButton} ${styles.eraseButton}`}
            disabled={!selectedCell || isDisabled}
          >
            <Eraser size={20} />
            <span>Erase</span>
          </button>
        </div>
        <div className={styles.secondaryActions}>
          <button
            onClick={handleUndo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.secondaryButton}
            disabled={!canUndo || isDisabled}
          >
            <RotateCcw size={16} />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.secondaryButton}
            disabled={!canRedo || isDisabled}
          >
            <RotateCcw size={16} style={{ transform: 'scaleX(-1)' }} />
            <span>Redo</span>
          </button>
          <button
            onClick={handleReset}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.secondaryButton}
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile: Row 1 (1-5), Row 2 (6-9 + erase), Row 3 (notes + auto + undo + redo + reset) */}
      <div className={styles.mobilePad}>
        <div className={styles.mobileRow}>
          {[1, 2, 3, 4, 5].map((num) => {
            const isCompleted = !isInNotesMode && completedNumbers.has(num);
            const positionClass = isInNotesMode ? styles[`pos${num}`] : '';
            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                onMouseDown={(e) => e.preventDefault()}
                className={`${styles.numberButton} ${isCompleted ? styles.completed : ''} ${positionClass}`}
                disabled={!selectedCell || isDisabled}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className={styles.mobileRow}>
          {[6, 7, 8, 9].map((num) => {
            const isCompleted = !isInNotesMode && completedNumbers.has(num);
            const positionClass = isInNotesMode ? styles[`pos${num}`] : '';
            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                onMouseDown={(e) => e.preventDefault()}
                className={`${styles.numberButton} ${isCompleted ? styles.completed : ''} ${positionClass}`}
                disabled={!selectedCell || isDisabled}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.numberButton} ${styles.actionButton} ${styles.eraseButton}`}
            disabled={!selectedCell || isDisabled}
          >
            <Eraser size={18} />
          </button>
        </div>
        <div className={styles.mobileActionsRow}>
          <button
            onClick={handleTogglePencilMode}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.mobileActionButton} ${styles.notesButton} ${notesActive ? styles.active : ''}`}
            disabled={notesDisabled}
          >
            <Edit3 size={16} />
            <span>Notes</span>
          </button>
          <button
            onClick={handleToggleAutoNotes}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.mobileActionButton} ${styles.autoButton} ${autoNotes ? styles.active : ''}`}
            disabled={isDisabled}
          >
            <Wand2 size={16} />
            <span>Auto</span>
          </button>
          <button
            onClick={handleUndo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileActionButton}
            disabled={!canUndo || isDisabled}
          >
            <RotateCcw size={16} />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileActionButton}
            disabled={!canRedo || isDisabled}
          >
            <RotateCcw size={16} style={{ transform: 'scaleX(-1)' }} />
            <span>Redo</span>
          </button>
          <button
            onClick={handleReset}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileActionButton}
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;