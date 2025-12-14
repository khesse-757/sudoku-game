import { useStore } from '../../store';
import { useRef, useEffect, useState } from 'react';
import Cell from './Cell';
import styles from './Grid.module.css';

const Grid = () => {
  const userGrid = useStore((state) => state.game.userGrid);
  const selectedCell = useStore((state) => state.game.selectedCell);
  const selectCell = useStore((state) => state.selectCell);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Use the smaller dimension to ensure square fits
        const size = Math.floor(Math.min(width, height));
        setGridSize(size);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Also observe container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.gridContainer} ref={containerRef}>
      <div 
        className={styles.grid}
        style={gridSize ? { width: gridSize, height: gridSize } : undefined}
      >
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