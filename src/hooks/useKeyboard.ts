import { useEffect } from 'react';
import { useStore } from '../store';

export const useKeyboard = (isPencilMode: boolean, setIsPencilMode: (value: boolean) => void) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const state = useStore.getState();
      const selectedCell = state.game.selectedCell;
      
      // Undo with Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        state.undo();
        return;
      }

      // Redo with Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        state.redo();
        return;
      }

      // Toggle pencil mode with N or P key
      if (e.key === 'n' || e.key === 'N' || e.key === 'p' || e.key === 'P') {
        setIsPencilMode(!isPencilMode);
        return;
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        if (!selectedCell) {
          state.selectCell(0, 0);
          return;
        }

        const [row, col] = selectedCell;
        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }

        state.selectCell(newRow, newCol);
        return;
      }
      
      // Ignore if no cell is selected for number entry
      if (!selectedCell) return;

      // Numbers 1-9
      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key);
        if (isPencilMode) {
          state.toggleNote(num);
        } else {
          state.setNumber(num);
        }
      }

      // Backspace or Delete to clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        state.clearCell();
      }

      // 0 to clear (alternative)
      if (e.key === '0') {
        state.clearCell();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPencilMode, setIsPencilMode]);
};