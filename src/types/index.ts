/**
 * Core type definitions for the Sudoku Terminal game.
 * @module types
 */

/**
 * Difficulty level for puzzle generation.
 * Controls the number of pre-filled cells (clues).
 * 
 * | Level | Clues | Hints Allowed |
 * |-------|-------|---------------|
 * | easy | 45 | 5 |
 * | medium | 35 | 3 |
 * | hard | 28 | 0 |
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Available color themes.
 * Each theme defines colors for all UI elements via CSS custom properties.
 */
export type ThemeName = 'light' | 'dark' | 'green' | 'amber' | 'paper' | 'monochrome' | 'ocean' | 'clean';

/**
 * Available monospace font families.
 */
export type FontFamily = 'jetbrains' | 'fira' | 'ibm' | 'courier';

/**
 * Represents a single cell in the Sudoku grid.
 * 
 * @example
 * // Empty cell with pencil marks
 * const cell: Cell = {
 *   value: 0,
 *   isGiven: false,
 *   notes: [1, 4, 7]
 * };
 * 
 * @example
 * // Pre-filled cell (part of puzzle)
 * const given: Cell = {
 *   value: 5,
 *   isGiven: true,
 *   notes: []
 * };
 */
export interface Cell {
  /** Cell value: 0 = empty, 1-9 = filled */
  value: number;
  /** True if this cell was part of the original puzzle (cannot be edited) */
  isGiven: boolean;
  /** Pencil marks / candidate numbers */
  notes: number[];
}

/**
 * User-configurable gameplay settings.
 * All settings are persisted to localStorage.
 */
export interface GameplaySettings {
  /** Highlight incorrect numbers in red as they're entered */
  autoCheckMistakes: boolean;
  /** Highlight cells that conflict with the selected cell */
  highlightConflicts: boolean;
  /** Highlight all cells in the same row and column as selection */
  highlightRowColumn: boolean;
  /** Highlight all cells in the same 3×3 box as selection */
  highlightBox: boolean;
  /** Highlight all cells with the same number as selection */
  highlightIdentical: boolean;
  /** Show the game timer */
  showTimer: boolean;
  /** Show the mistake counter */
  showMistakes: boolean;
  /** Automatically calculate and display pencil marks */
  autoNotes: boolean;
}

/**
 * Current game state.
 * This state is reset when starting a new game.
 */
export interface GameState {
  /** Original puzzle grid (9×9 array, 0 = empty) */
  puzzle: number[][];
  /** Complete solution grid (9×9 array) */
  solution: number[][];
  /** Current user-editable grid with cell metadata */
  userGrid: Cell[][];
  /** Currently selected cell as [row, col] or null if none selected */
  selectedCell: [number, number] | null;
  /** Current difficulty level */
  difficulty: Difficulty;
  /** Elapsed time in seconds */
  timer: number;
  /** Whether the game is currently paused */
  isPaused: boolean;
  /** Whether the puzzle has been completed */
  isComplete: boolean;
  /** Number of incorrect entries made */
  mistakes: number;
  /** Remaining hints available */
  hintsRemaining: number;
}

/**
 * User settings state.
 * Persisted to localStorage and restored on app load.
 */
export interface SettingsState {
  /** Current color theme */
  theme: ThemeName;
  /** Current font family */
  font: FontFamily;
  /** Gameplay-related settings */
  gameplay: GameplaySettings;
}

/**
 * Persistent game statistics.
 * Tracks player progress across sessions.
 */
export interface Statistics {
  /** Total number of puzzles completed */
  gamesCompleted: number;
  /** Best completion time (in seconds) for each difficulty */
  bestTimes: Record<Difficulty, number>;
  /** Total time spent playing (in seconds) */
  totalPlayTime: number;
}