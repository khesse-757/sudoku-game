import { Trophy, Clock, RotateCcw, Play } from 'lucide-react';
import { useStore } from '../../store';
import type { Difficulty } from '../../types';
import styles from './VictoryModal.module.css';

const VictoryModal = () => {
  const isComplete = useStore((state) => state.game.isComplete);
  const timer = useStore((state) => state.game.timer);
  const difficulty = useStore((state) => state.game.difficulty);
  const mistakes = useStore((state) => state.game.mistakes);
  const stats = useStore((state) => state.stats);
  const startNewGame = useStore((state) => state.startNewGame);
  const resetPuzzle = useStore((state) => state.resetPuzzle);

  if (!isComplete) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isNewBestTime = stats.bestTimes[difficulty] === timer && timer > 0;

  const handleNewGame = (diff: Difficulty) => {
    startNewGame(diff);
  };

  const handleReplay = () => {
    resetPuzzle();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.trophyIcon}>
            <Trophy size={48} />
          </div>
          <h2 className={styles.title}>Puzzle Complete!</h2>
          {isNewBestTime && (
            <span className={styles.newBest}>🎉 New Best Time!</span>
          )}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Clock size={20} />
            <span className={styles.statLabel}>Time</span>
            <span className={styles.statValue}>{formatTime(timer)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Difficulty</span>
            <span className={styles.statValue}>{difficulty.toUpperCase()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Mistakes</span>
            <span className={styles.statValue}>{mistakes}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleReplay}
            className={styles.replayButton}
          >
            <RotateCcw size={18} />
            <span>Replay Puzzle</span>
          </button>
        </div>

        <div className={styles.newGameSection}>
          <span className={styles.newGameLabel}>Start New Game</span>
          <div className={styles.difficultyButtons}>
            <button 
              onClick={() => handleNewGame('easy')}
              className={`${styles.difficultyButton} ${difficulty === 'easy' ? styles.current : ''}`}
            >
              Easy
            </button>
            <button 
              onClick={() => handleNewGame('medium')}
              className={`${styles.difficultyButton} ${difficulty === 'medium' ? styles.current : ''}`}
            >
              Medium
            </button>
            <button 
              onClick={() => handleNewGame('hard')}
              className={`${styles.difficultyButton} ${difficulty === 'hard' ? styles.current : ''}`}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;