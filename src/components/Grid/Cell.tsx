import { motion } from 'framer-motion';
import { useStore } from '../../store';
import styles from './Cell.module.css';

interface CellProps {
  value: number;
  notes: number[];
  isGiven: boolean;
  isSelected: boolean;
  row: number;
  col: number;
  onClick: () => void;
}

const Cell = ({ value, notes, isGiven, isSelected, row, col, onClick }: CellProps) => {
  const animationsEnabled = useStore((state) => state.settings.animations.cellHighlight);
  const mistakeHighlight = useStore((state) => state.settings.mistakeHighlight);
  const solution = useStore((state) => state.game.solution);
  const selectedCell = useStore((state) => state.game.selectedCell);
  const userGrid = useStore((state) => state.game.userGrid);

  // Check if this cell has a mistake
  const isMistake = !isGiven && value !== 0 && value !== solution[row][col];

  // Check if this cell should be highlighted
  const isHighlighted = selectedCell && !isSelected && (() => {
    const [selRow, selCol] = selectedCell;
    
    // Same row or column
    if (row === selRow || col === selCol) return true;
    
    // Same 3x3 box
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selBoxRow = Math.floor(selRow / 3);
    const selBoxCol = Math.floor(selCol / 3);
    if (boxRow === selBoxRow && boxCol === selBoxCol) return true;
    
    // Same number (if both cells have values)
    const selectedValue = userGrid[selRow][selCol].value;
    if (value !== 0 && selectedValue !== 0 && value === selectedValue) return true;
    
    return false;
  })();

  const cellClasses = [
    styles.cell,
    isGiven ? styles.given : '',
    isSelected ? styles.selected : '',
    isHighlighted ? styles.highlighted : '',
    isMistake && mistakeHighlight ? styles.mistake : '',
    col % 3 === 2 && col !== 8 ? styles.rightBorder : '',
    row % 3 === 2 && row !== 8 ? styles.bottomBorder : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cellClasses}
      onClick={onClick}
      whileHover={animationsEnabled ? { scale: 1.05 } : undefined}
      whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
    >
      {value !== 0 ? (
        <span className={styles.value}>{value}</span>
      ) : notes.length > 0 ? (
        <div className={styles.notes}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <span
              key={num}
              className={notes.includes(num) ? styles.noteActive : styles.noteInactive}
            >
              {notes.includes(num) ? num : ''}
            </span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
};

export default Cell;