import { useStore } from '../../store';
import { Eraser, Pencil } from 'lucide-react';
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

  return (
    <div className={styles.numberPad}>
      <div className={styles.numbers}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            onMouseDown={(e) => e.preventDefault()}
            className={styles.numberButton}
            disabled={!selectedCell}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={() => setIsPencilMode(!isPencilMode)}
        className={`${styles.modeButton} ${isPencilMode ? styles.active : ''}`}
      >
        <Pencil size={20} />
        <span>Notes {isPencilMode ? 'ON' : 'OFF'}</span>
      </button>
      <button
        onClick={handleClear}
        onMouseDown={(e) => e.preventDefault()}
        className={styles.clearButton}
        disabled={!selectedCell}
      >
        <Eraser size={20} />
        <span>Clear</span>
      </button>
    </div>
  );
};

export default NumberPad;