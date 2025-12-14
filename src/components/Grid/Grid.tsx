import { useStore } from '../../store';
import Cell from './Cell';
import styles from './Grid.module.css';

const Grid = () => {
  const userGrid = useStore((state) => state.game.userGrid);
  const selectedCell = useStore((state) => state.game.selectedCell);
  const selectCell = useStore((state) => state.selectCell);

  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {userGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell.value}
              notes={cell.notes}
              isGiven={cell.isGiven}
              isSelected={
                selectedCell !== null &&
                selectedCell[0] === rowIndex &&
                selectedCell[1] === colIndex
              }
              row={rowIndex}
              col={colIndex}
              onClick={() => selectCell(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Grid;