import { useStore } from '../../store';
import { Trophy, Clock } from 'lucide-react';
import styles from './VictoryModal.module.css';

const VictoryModal = () => {
  const isComplete = useStore((state) => state.game.isComplete);
  const timer = useStore((state) => state.game.timer);
  const difficulty = useStore((state) => state.game.difficulty);
  const mistakes = useStore((state) => state.game.mistakes);
  const startNewGame = useStore((state) => state.startNewGame);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  if (!isComplete) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.trophy}>
          <Trophy size={64} />
        </div>
        
        <h2 className={styles.title}>PUZZLE COMPLETE!</h2>
        
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Clock size={20} />
            <span className={styles.label}>Time:</span>
            <span className={styles.value}>{formatTime(timer)}</span>
          </div>
          
          <div className={styles.stat}>
            <span className={styles.label}>Difficulty:</span>
            <span className={styles.value}>{difficulty.toUpperCase()}</span>
          </div>
          
          <div className={styles.stat}>
            <span className={styles.label}>Mistakes:</span>
            <span className={styles.value}>{mistakes}</span>
          </div>
        </div>

        <div className={styles.buttons}>
          <button 
            onClick={() => startNewGame(difficulty)}
            className={styles.button}
          >
            Play Again ({difficulty})
          </button>
          <button 
            onClick={() => startNewGame('easy')}
            className={`${styles.button} ${styles.secondary}`}
          >
            Easy
          </button>
          <button 
            onClick={() => startNewGame('medium')}
            className={`${styles.button} ${styles.secondary}`}
          >
            Medium
          </button>
          <button 
            onClick={() => startNewGame('hard')}
            className={`${styles.button} ${styles.secondary}`}
          >
            Hard
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;