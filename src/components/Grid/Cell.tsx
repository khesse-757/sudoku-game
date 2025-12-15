import { useStore } from '../../store';
import styles from './Cell.module.css';

const defaultGameplay = {
  autoCheckMistakes: true,
  highlightConflicts: true,
  highlightRowColumn: true,
  highlightBox: true,
  highlightIdentical: true,
  showTimer: true,
  showMistakes: true,
  autoNotes: false,
};

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
  const selectedCell = useStore((state) => state.game.selectedCell);
  const userGrid = useStore((state) => state.game.userGrid);
  const solution = useStore((state) => state.game.solution);
  const gameplay = useStore((state) => state.settings.gameplay) ?? defaultGameplay;
  const getConflicts = useStore((state) => state.getConflicts);

  // Determine highlighting states
  let isInRowOrColumn = false;
  let isInBox = false;
  let isIdentical = false;
  
  if (selectedCell && !isSelected) {
    const [selRow, selCol] = selectedCell;
    
    // Check row and column
    if (gameplay.highlightRowColumn && (row === selRow || col === selCol)) {
      isInRowOrColumn = true;
    }
    
    // Check same 3x3 box
    if (gameplay.highlightBox) {
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      const selBoxRow = Math.floor(selRow / 3);
      const selBoxCol = Math.floor(selCol / 3);
      
      if (boxRow === selBoxRow && boxCol === selBoxCol) {
        isInBox = true;
      }
    }
    
    // Check identical numbers
    if (gameplay.highlightIdentical && value !== 0) {
      const selectedValue = userGrid[selRow][selCol].value;
      if (selectedValue !== 0 && value === selectedValue) {
        isIdentical = true;
      }
    }
  }

  const isHighlighted = isInRowOrColumn || isInBox;

  // Check if this is a mistake (wrong number)
  const isMistake = gameplay.autoCheckMistakes && 
    value !== 0 && 
    !isGiven && 
    value !== solution[row][col];

  // Check for conflicts
  let hasConflict = false;
  if (gameplay.highlightConflicts && selectedCell) {
    const [selRow, selCol] = selectedCell;
    const conflicts = getConflicts ? getConflicts(selRow, selCol) : [];
    hasConflict = conflicts.some(([r, c]) => r === row && c === col);
  }

  // Determine if this cell has thick borders (3x3 grid lines)
  const hasRightBorder = col === 2 || col === 5;
  const hasBottomBorder = row === 2 || row === 5;

  // Build class names - order matters for CSS specificity
  const classNames = [
    styles.cell,
    // Base states
    isGiven && styles.given,
    // Highlighting layers (can combine)
    isHighlighted && styles.highlighted,
    isHighlighted && isGiven && styles.givenHighlighted,
    // Identical number highlight
    isIdentical && styles.identical,
    isIdentical && isGiven && styles.givenIdentical,
    // Selected (highest priority)
    isSelected && styles.selected,
    // Error states
    isMistake && styles.mistake,
    hasConflict && styles.conflict,
    // Borders
    hasRightBorder && styles.rightBorder,
    hasBottomBorder && styles.bottomBorder,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {value !== 0 ? (
        <span className={styles.value}>{value}</span>
      ) : notes.length > 0 ? (
        <div className={styles.notes}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={notes.includes(n) ? styles.noteActive : styles.noteInactive}
            >
              {notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Cell;