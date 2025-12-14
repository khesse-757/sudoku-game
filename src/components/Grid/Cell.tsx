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
  const selectedCell = useStore((state) => state.game.selectedCell);
  const userGrid = useStore((state) => state.game.userGrid);
  const solution = useStore((state) => state.game.solution);
  const gameplay = useStore((state) => state.settings.gameplay);

  // Safe access to gameplay settings with defaults
  const highlightRowColumn = gameplay?.highlightRowColumn ?? true;
  const highlightBox = gameplay?.highlightBox ?? true;
  const highlightIdentical = gameplay?.highlightIdentical ?? true;
  const autoCheckMistakes = gameplay?.autoCheckMistakes ?? true;
  const highlightConflicts = gameplay?.highlightConflicts ?? true;

  // Determine if this cell should be highlighted
  let isHighlighted = false;
  
  if (selectedCell && !isSelected) {
    const [selRow, selCol] = selectedCell;
    
    // Highlight row and column
    if (highlightRowColumn && (row === selRow || col === selCol)) {
      isHighlighted = true;
    }
    
    // Highlight same 3x3 box
    if (highlightBox) {
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      const selBoxRow = Math.floor(selRow / 3);
      const selBoxCol = Math.floor(selCol / 3);
      
      if (boxRow === selBoxRow && boxCol === selBoxCol) {
        isHighlighted = true;
      }
    }
    
    // Highlight identical numbers
    if (highlightIdentical && value !== 0) {
      const selectedValue = userGrid[selRow][selCol].value;
      if (selectedValue !== 0 && value === selectedValue) {
        isHighlighted = true;
      }
    }
  }

  // Check if this is a mistake (wrong number)
  const isMistake = autoCheckMistakes && 
    value !== 0 && 
    !isGiven && 
    value !== solution[row][col];

  // Check for conflicts
  const hasConflict = highlightConflicts && 
    value !== 0 && 
    !isGiven && 
    checkForConflict(row, col, value, userGrid);

  // Determine if this cell has thick borders (3x3 grid lines)
  const hasRightBorder = col === 2 || col === 5;
  const hasBottomBorder = row === 2 || row === 5;

  const classNames = [
    styles.cell,
    isSelected && styles.selected,
    isHighlighted && styles.highlighted,
    isGiven && styles.given,
    (isMistake || hasConflict) && styles.mistake,
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

// Helper function to check for conflicts in row, column, or box
function checkForConflict(row: number, col: number, value: number, grid: { value: number }[][]): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return true;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return true;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        return true;
      }
    }
  }

  return false;
}

export default Cell;