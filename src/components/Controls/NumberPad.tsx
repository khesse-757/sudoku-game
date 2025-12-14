import { useStore } from '../../store';
import { Eraser, Edit3 } from 'lucide-react';
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

  const handleNumberClick = (num: number) => {
    if (!selectedCell) return;
    
    if (isPencilMode) {
      toggleNote(num);
    } else {
      setNumber(num);
    }
  };

  const handleClear = () => {
    if (!selectedCell) return;
    clearCell();
  };

  const handleTogglePencilMode = () => {
    setIsPencilMode(!isPencilMode);
  };

  return (
    <div className={styles.numberPad}>
      {/* Desktop: 3x3 grid with buttons */}
      <div className={styles.desktopPad}>
        <div className={styles.numbers}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={styles.numberButton}
              disabled={!selectedCell}
            >
              {num}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleTogglePencilMode}
            className={`${styles.toggleButton} ${isPencilMode ? styles.active : ''}`}
          >
            <Edit3 size={20} />
            <span>Notes</span>
          </button>
          <button
            onClick={handleClear}
            className={styles.actionButton}
            disabled={!selectedCell}
          >
            <Eraser size={20} />
            <span>Erase</span>
          </button>
        </div>
      </div>

      {/* Mobile: 2 rows (1-5, 6-9 + actions) */}
      <div className={styles.mobilePad}>
        <div className={styles.mobileRow}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={styles.numberButton}
              disabled={!selectedCell}
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
              className={styles.numberButton}
              disabled={!selectedCell}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleTogglePencilMode}
            className={`${styles.numberButton} ${styles.toggleButton} ${isPencilMode ? styles.active : ''}`}
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={handleClear}
            className={`${styles.numberButton} ${styles.actionButton}`}
            disabled={!selectedCell}
          >
            <Eraser size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;