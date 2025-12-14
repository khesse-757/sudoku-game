import { useStore } from '../../store';
import { Trophy, Clock, Target } from 'lucide-react';
import styles from './StatsPanel.module.css';

const StatsPanel = () => {
  const stats = useStore((state) => state.stats);
  const mistakes = useStore((state) => state.game.mistakes);
  const difficulty = useStore((state) => state.game.difficulty);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.statsPanel}>
      <div className={styles.stat}>
        <Trophy size={18} className={styles.icon} />
        <div className={styles.statContent}>
          <span className={styles.label}>Games Won</span>
          <span className={styles.value}>{stats.gamesCompleted}</span>
        </div>
      </div>

      <div className={styles.stat}>
        <Clock size={18} className={styles.icon} />
        <div className={styles.statContent}>
          <span className={styles.label}>Best Time ({difficulty})</span>
          <span className={styles.value}>{formatTime(stats.bestTimes[difficulty])}</span>
        </div>
      </div>

      <div className={styles.stat}>
        <Target size={18} className={styles.icon} />
        <div className={styles.statContent}>
          <span className={styles.label}>Mistakes</span>
          <span className={styles.value}>{mistakes}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;