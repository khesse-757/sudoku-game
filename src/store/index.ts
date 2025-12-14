import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cell, Difficulty, ThemeName, GameplaySettings } from '../types';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { generatePuzzle } from '../utils/sudoku';

// Current schema version - increment when making breaking changes
const STORAGE_VERSION = 2;

interface GameState {
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

interface SettingsState {
  theme: ThemeName;
  font: string;
  gameplay: GameplaySettings;
}

interface Statistics {
  gamesCompleted: number;
  bestTimes: Record<Difficulty, number>;
  totalPlayTime: number;
}

interface Store {
  _version: number;
  game: GameState;
  settings: SettingsState;
  stats: Statistics;
  history: Cell[][][];
  historyIndex: number;

  // Game actions
  startNewGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  setNumber: (num: number) => void;
  clearCell: () => void;
  toggleNote: (num: number) => void;
  incrementTimer: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  useHint: () => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Settings actions
  setTheme: (theme: ThemeName) => void;
  setGameplaySetting: <K extends keyof GameplaySettings>(key: K, value: GameplaySettings[K]) => void;
}

const createEmptyGrid = (): Cell[][] => {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      notes: [],
    }))
  );
};

const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({
    ...cell,
    notes: [...cell.notes],
  })));
};

const checkWin = (userGrid: Cell[][], solution: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (userGrid[row][col].value !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

const defaultGameplaySettings: GameplaySettings = {
  autoCheckMistakes: true,
  highlightConflicts: true,
  highlightRowColumn: true,
  highlightBox: true,
  highlightIdentical: true,
  showTimer: true,
  showMistakes: true,
};

const getInitialState = () => ({
  _version: STORAGE_VERSION,
  game: {
    puzzle: Array(9).fill(null).map(() => Array(9).fill(0)),
    solution: Array(9).fill(null).map(() => Array(9).fill(0)),
    userGrid: createEmptyGrid(),
    selectedCell: null,
    difficulty: 'medium' as Difficulty,
    timer: 0,
    isPaused: false,
    isComplete: false,
    mistakes: 0,
    hintsRemaining: 3,
  },
  settings: {
    theme: 'clean' as ThemeName,
    font: 'jetbrains',
    gameplay: defaultGameplaySettings,
  },
  stats: {
    gamesCompleted: 0,
    bestTimes: { easy: 0, medium: 0, hard: 0 },
    totalPlayTime: 0,
  },
  history: [] as Cell[][][],
  historyIndex: -1,
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      startNewGame: (difficulty) => {
        const { puzzle, solution } = generatePuzzle(difficulty);
        const userGrid = createEmptyGrid();

        // Fill in the given numbers
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (puzzle[row][col] !== 0) {
              userGrid[row][col] = {
                value: puzzle[row][col],
                isGiven: true,
                notes: [],
              };
            }
          }
        }

        set({
          game: {
            puzzle,
            solution,
            userGrid,
            selectedCell: null,
            difficulty,
            timer: 0,
            isPaused: false,
            isComplete: false,
            mistakes: 0,
            hintsRemaining: DIFFICULTY_CONFIG[difficulty].hintsAllowed,
          },
          history: [cloneGrid(userGrid)],
          historyIndex: 0,
        });
      },

      selectCell: (row, col) => {
        set((state) => ({
          game: { ...state.game, selectedCell: [row, col] },
        }));
      },

      setNumber: (num) => {
        const state = get();
        const { selectedCell, userGrid, solution, isComplete } = state.game;
        const autoCheckMistakes = state.settings.gameplay?.autoCheckMistakes ?? true;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven) return;

        const newGrid = cloneGrid(userGrid);
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: num,
          notes: [],
        };

        // Check if the number is wrong
        let newMistakes = state.game.mistakes;
        if (autoCheckMistakes && num !== solution[row][col]) {
          newMistakes++;
        }

        // Check for win
        const hasWon = checkWin(newGrid, solution);

        // Update history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...state.game,
            userGrid: newGrid,
            isComplete: hasWon,
            mistakes: newMistakes,
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        // Update stats if won
        if (hasWon) {
          const currentTime = state.game.timer;
          const bestTime = state.stats.bestTimes[state.game.difficulty];
          set((s) => ({
            stats: {
              ...s.stats,
              gamesCompleted: s.stats.gamesCompleted + 1,
              bestTimes: {
                ...s.stats.bestTimes,
                [state.game.difficulty]:
                  bestTime === 0 ? currentTime : Math.min(bestTime, currentTime),
              },
            },
          }));
        }
      },

      clearCell: () => {
        const state = get();
        const { selectedCell, userGrid, isComplete } = state.game;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven) return;

        const newGrid = cloneGrid(userGrid);
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: 0,
          notes: [],
        };

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: { ...state.game, userGrid: newGrid },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      toggleNote: (num) => {
        const state = get();
        const { selectedCell, userGrid, isComplete } = state.game;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven || userGrid[row][col].value !== 0) return;

        const newGrid = cloneGrid(userGrid);
        const notes = [...newGrid[row][col].notes];

        if (notes.includes(num)) {
          notes.splice(notes.indexOf(num), 1);
        } else {
          notes.push(num);
          notes.sort();
        }

        newGrid[row][col] = { ...newGrid[row][col], notes };

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: { ...state.game, userGrid: newGrid },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      incrementTimer: () => {
        set((state) => {
          if (state.game.isPaused || state.game.isComplete) return state;
          return {
            game: { ...state.game, timer: state.game.timer + 1 },
          };
        });
      },

      pauseGame: () => {
        set((state) => ({
          game: { ...state.game, isPaused: true },
        }));
      },

      resumeGame: () => {
        set((state) => ({
          game: { ...state.game, isPaused: false },
        }));
      },

      useHint: () => {
        const state = get();
        const { userGrid, solution, hintsRemaining, isComplete, difficulty } = state.game;

        if (isComplete || hintsRemaining <= 0 || difficulty === 'hard') return;

        // Find an empty cell to fill
        let targetRow = -1;
        let targetCol = -1;

        // First try the selected cell
        const selected = state.game.selectedCell;
        if (selected) {
          const [row, col] = selected;
          if (userGrid[row][col].value === 0 || userGrid[row][col].value !== solution[row][col]) {
            targetRow = row;
            targetCol = col;
          }
        }

        // Otherwise find the first empty/wrong cell
        if (targetRow === -1) {
          for (let row = 0; row < 9 && targetRow === -1; row++) {
            for (let col = 0; col < 9; col++) {
              if (userGrid[row][col].value !== solution[row][col]) {
                targetRow = row;
                targetCol = col;
                break;
              }
            }
          }
        }

        if (targetRow === -1) return;

        const newGrid = cloneGrid(userGrid);
        newGrid[targetRow][targetCol] = {
          value: solution[targetRow][targetCol],
          isGiven: false,
          notes: [],
        };

        const hasWon = checkWin(newGrid, solution);

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...state.game,
            userGrid: newGrid,
            hintsRemaining: hintsRemaining - 1,
            isComplete: hasWon,
            selectedCell: [targetRow, targetCol],
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        if (hasWon) {
          const currentTime = state.game.timer;
          const bestTime = state.stats.bestTimes[state.game.difficulty];
          set((s) => ({
            stats: {
              ...s.stats,
              gamesCompleted: s.stats.gamesCompleted + 1,
              bestTimes: {
                ...s.stats.bestTimes,
                [state.game.difficulty]:
                  bestTime === 0 ? currentTime : Math.min(bestTime, currentTime),
              },
            },
          }));
        }
      },

      undo: () => {
        const state = get();
        if (state.historyIndex <= 0) return;

        const newIndex = state.historyIndex - 1;
        set({
          game: {
            ...state.game,
            userGrid: cloneGrid(state.history[newIndex]),
          },
          historyIndex: newIndex,
        });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;

        const newIndex = state.historyIndex + 1;
        set({
          game: {
            ...state.game,
            userGrid: cloneGrid(state.history[newIndex]),
          },
          historyIndex: newIndex,
        });
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      setGameplaySetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            gameplay: {
              ...(state.settings.gameplay ?? defaultGameplaySettings),
              [key]: value,
            },
          },
        }));
      },
    }),
    {
      name: 'sudoku-storage',
      version: STORAGE_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        // If version is old or missing, reset to fresh state
        if (version < STORAGE_VERSION) {
          console.log(`Migrating storage from version ${version} to ${STORAGE_VERSION}`);
          return getInitialState();
        }
        return persistedState as Store;
      },
      partialize: (state) => ({
        _version: state._version,
        game: state.game,
        settings: state.settings,
        stats: state.stats,
        history: state.history,
        historyIndex: state.historyIndex,
      }),
    }
  )
);