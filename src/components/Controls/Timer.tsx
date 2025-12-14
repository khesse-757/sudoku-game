import { useEffect } from 'react';
import { useStore } from '../../store';
import styles from './Timer.module.css';

const Timer = () => {
  const timer = useStore((state) => state.game.timer);
  const isPaused = useStore((state) => state.game.isPaused);
  const incrementTimer = useStore((state) => state.incrementTimer);
  const pauseGame = useStore((state) => state.pauseGame);
  const resumeGame = useStore((state) => state.resumeGame);

  useEffect(() => {
    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [incrementTimer]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.timer}>
      <div className={styles.display}>
        <span className={styles.label}>TIME:</span>
        <span className={styles.time}>{formatTime(timer)}</span>
      </div>
      <button 
        onClick={isPaused ? resumeGame : pauseGame}
        className={styles.pauseButton}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default Timer;