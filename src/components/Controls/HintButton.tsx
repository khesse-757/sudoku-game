import { useStore } from '../../store';
import { Lightbulb } from 'lucide-react';
import styles from './HintButton.module.css';

const HintButton = () => {
  const useHint = useStore((state) => state.useHint);
  const hintsRemaining = useStore((state) => state.game.hintsRemaining);
  const difficulty = useStore((state) => state.game.difficulty);

  // Hard mode has no hints
  const hintsDisabled = difficulty === 'hard' || hintsRemaining <= 0;

  return (
    <button
      onClick={useHint}
      disabled={hintsDisabled}
      className={styles.hintButton}
      title={difficulty === 'hard' ? 'No hints in Hard mode' : `${hintsRemaining} hints remaining`}
    >
      <Lightbulb size={20} />
      <span>Hint</span>
      {difficulty !== 'hard' && (
        <span className={styles.count}>({hintsRemaining})</span>
      )}
    </button>
  );
};

export default HintButton;