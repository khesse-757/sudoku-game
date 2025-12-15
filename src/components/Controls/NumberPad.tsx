import { useStore } from '../../store';
import { Eraser, Edit3, RotateCcw, RefreshCw } from 'lucide-react';
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
  
  // Get autoNotes setting - when enabled, always enter numbers (notes are automatic)
  const autoNotes = useStore((state) => state.settings.gameplay?.autoNotes ?? false);

  // Disable all inputs when paused or complete
  const isDisabled = isPaused || isComplete;

  const handleNumberClick = (num: number) => {
    if (!selectedCell || isDisabled) return;
    
    // When autoNotes is ON, always set numbers (notes are managed automatically)
    // When autoNotes is OFF, respect isPencilMode
    if (isPencilMode && !autoNotes) {
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
    // Don't allow toggling pencil mode when autoNotes is on
    if (autoNotes) return;
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

  // Notes button disabled when autoNotes is on
  const notesDisabled = autoNotes || isDisabled;
  const notesActive = isPencilMode && !autoNotes;

  return (
    <div className={styles.numberPad}>
      {/* Desktop: 3x3 grid with buttons */}
      <div className={styles.desktopPad}>
        <div className={styles.numbers}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              onMouseDown={(e) => e.preventDefault()}
              className={styles.numberButton}
              disabled={!selectedCell || isDisabled}
            >
              {num}
            </button>
          ))}
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
            <span>{autoNotes ? 'Auto' : 'Notes'}</span>
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

      {/* Mobile: Row 1 (1-5), Row 2 (6-9 + notes + erase), Row 3 (undo + redo + reset) */}
      <div className={styles.mobilePad}>
        <div className={styles.mobileRow}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              onMouseDown={(e) => e.preventDefault()}
              className={styles.numberButton}
              disabled={!selectedCell || isDisabled}
            >
              {num}
            </button>
          ))}
        </div>
        <div className={styles.mobileRow}>
          {[6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              onMouseDown={(e) => e.preventDefault()}
              className={styles.numberButton}
              disabled={!selectedCell || isDisabled}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleTogglePencilMode}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.numberButton} ${styles.actionButton} ${styles.notesButton} ${notesActive ? styles.active : ''}`}
            disabled={notesDisabled}
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            className={`${styles.numberButton} ${styles.actionButton} ${styles.eraseButton}`}
            disabled={!selectedCell || isDisabled}
          >
            <Eraser size={18} />
          </button>
        </div>
        <div className={styles.mobileSecondaryRow}>
          <button
            onClick={handleUndo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileSecondaryButton}
            disabled={!canUndo || isDisabled}
          >
            <RotateCcw size={14} />
            <span>Undo</span>
          </button>
          <button
            onClick={handleRedo}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileSecondaryButton}
            disabled={!canRedo || isDisabled}
          >
            <RotateCcw size={14} style={{ transform: 'scaleX(-1)' }} />
            <span>Redo</span>
          </button>
          <button
            onClick={handleReset}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.mobileSecondaryButton}
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;