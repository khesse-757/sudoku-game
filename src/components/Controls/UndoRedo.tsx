import { useStore } from '../../store';
import { Undo, Redo } from 'lucide-react';
import styles from './UndoRedo.module.css';

const UndoRedo = () => {
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const canUndo = useStore((state) => state.canUndo());
  const canRedo = useStore((state) => state.canRedo());

  return (
    <div className={styles.undoRedo}>
      <button
        onClick={undo}
        disabled={!canUndo}
        className={styles.button}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={20} />
        <span>Undo</span>
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={styles.button}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo size={20} />
        <span>Redo</span>
      </button>
    </div>
  );
};

export default UndoRedo;