// Core game types
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ThemeName = 'green' | 'amber' | 'paper' | 'monochrome';
export type FontFamily = 'jetbrains' | 'fira' | 'ibm' | 'courier';

export interface Cell {
  value: number; // 0 = empty, 1-9 = filled
  isGiven: boolean; // True if part of original puzzle
  notes: number[]; // Pencil marks
}

export interface GameState {
  puzzle: number[][];
  solution: number[][];
  userGrid: Cell[][];
  selectedCell: [number, number] | null;
  difficulty: Difficulty;
  timer: number;
  isPaused: boolean;
  isComplete: boolean;
  mistakes: number;
  hintsRemaining: number;
}

export interface SettingsState {
  theme: ThemeName;
  font: FontFamily;
  animations: {
    cellHighlight: boolean;
    numberPlacement: boolean;
    transitions: boolean;
  };
  audio: {
    sfxEnabled: boolean;
    sfxVolume: number;
    musicEnabled: boolean;
    musicVolume: number;
  };
  mistakeHighlight: boolean;
}

export interface Statistics {
  gamesCompleted: number;
  bestTimes: Record<Difficulty, number>;
  totalPlayTime: number;
}
