import { useStore } from '../../store';
import HintButton from './HintButton';
import styles from './GameControls.module.css';

const GameControls = () => {
  const startNewGame = useStore((state) => state.startNewGame);
  const difficulty = useStore((state) => state.game.difficulty);

  const handleNewGame = () => {
    if (confirm('Start a new game? Current progress will be lost.')) {
      startNewGame(difficulty);
    }
  };

  const handleDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    if (confirm(`Start a new ${diff} game? Current progress will be lost.`)) {
      startNewGame(diff);
    }
  };

  return (
    <div className={styles.controls}>
      <button onClick={handleNewGame} className={styles.button}>
        New Game
      </button>
      <div className={styles.difficulty}>
        <button 
          onClick={() => handleDifficulty('easy')} 
          className={`${styles.diffButton} ${difficulty === 'easy' ? styles.active : ''}`}
        >
          Easy
        </button>
        <button 
          onClick={() => handleDifficulty('medium')} 
          className={`${styles.diffButton} ${difficulty === 'medium' ? styles.active : ''}`}
        >
          Medium
        </button>
        <button 
          onClick={() => handleDifficulty('hard')} 
          className={`${styles.diffButton} ${difficulty === 'hard' ? styles.active : ''}`}
        >
          Hard
        </button>
      </div>
      <HintButton />
    </div>
  );
};

export default GameControls;