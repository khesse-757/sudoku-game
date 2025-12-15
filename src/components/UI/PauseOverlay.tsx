import { Play } from 'lucide-react';
import { useStore } from '../../store';
import styles from './PauseOverlay.module.css';

const PauseOverlay = () => {
  const isPaused = useStore((state) => state.game.isPaused);
  const isComplete = useStore((state) => state.game.isComplete);
  const resumeGame = useStore((state) => state.resumeGame);
  const timer = useStore((state) => state.game.timer);
  const difficulty = useStore((state) => state.game.difficulty);

  // Don't show if not paused or if game is complete
  if (!isPaused || isComplete) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.pauseIcon}>
          <div className={styles.pauseBars}>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <h2 className={styles.title}>Game Paused</h2>
        
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Difficulty</span>
            <span className={styles.infoValue}>{difficulty.toUpperCase()}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Time</span>
            <span className={styles.infoValue}>{formatTime(timer)}</span>
          </div>
        </div>

        <button onClick={resumeGame} className={styles.resumeButton}>
          <Play size={24} />
          <span>Resume</span>
        </button>
      </div>
    </div>
  );
};

export default PauseOverlay;