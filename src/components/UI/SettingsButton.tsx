import { Menu } from 'lucide-react';
import styles from './SettingsButton.module.css';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <button 
      className={styles.settingsButton}
      onClick={onClick}
      aria-label="Settings"
    >
      <Menu size={24} />
    </button>
  );
};

export default SettingsButton;