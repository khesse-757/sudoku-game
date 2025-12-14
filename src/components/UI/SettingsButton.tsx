import { Menu } from 'lucide-react';
import styles from './SettingsButton.module.css';

const SettingsButton = () => {
  const handleClick = () => {
    // TODO: Open settings panel (Phase 2)
    console.log('Settings clicked - will implement in Phase 2');
  };

  return (
    <button 
      className={styles.settingsButton}
      onClick={handleClick}
      aria-label="Settings"
    >
      <Menu size={24} />
    </button>
  );
};

export default SettingsButton;
