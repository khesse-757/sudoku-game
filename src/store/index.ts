import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cell, Difficulty, ThemeName, GameplaySettings } from '../types';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { generatePuzzle } from '../utils/sudoku';

// Current schema version - increment when making breaking changes to STATE structure
const STORAGE_VERSION = 5;

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

  // Game check actions
  checkCell: () => { correct: boolean; checked: boolean };
  checkPuzzle: () => { total: number; correct: number; incorrect: number };
  revealCell: () => boolean;
  revealPuzzle: () => void;
  resetPuzzle: () => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Settings actions
  setTheme: (theme: ThemeName) => void;
  setGameplaySetting: <K extends keyof GameplaySettings>(key: K, value: GameplaySettings[K]) => void;

  // Stats actions
  resetStats: () => void;

  // Helper to get conflicts for a cell
  getConflicts: (row: number, col: number) => [number, number][];
}

const createEmptyGrid = (): Cell[][] => {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      manualNotes: [],
      autoNotes: [],
      userEditedInAuto: [],
    }))
  );
};

const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({
    ...cell,
    manualNotes: [...cell.manualNotes],
    autoNotes: [...cell.autoNotes],
    userEditedInAuto: [...cell.userEditedInAuto],
  })));
};

const checkWin = (userGrid: Cell[][], solution: number[][]): boolean => {
  // Don't consider it a win if the solution is empty/all zeros
  const hasSolution = solution.some(row => row.some(cell => cell !== 0));
  if (!hasSolution) return false;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (userGrid[row][col].value !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Calculate auto notes for a cell based on what's possible
const calculateAutoNotes = (grid: Cell[][], row: number, col: number): number[] => {
  if (grid[row][col].value !== 0) return [];
  
  const used = new Set<number>();
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c].value !== 0) {
      used.add(grid[row][c].value);
    }
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col].value !== 0) {
      used.add(grid[r][col].value);
    }
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c].value !== 0) {
        used.add(grid[r][c].value);
      }
    }
  }
  
  // Return numbers that aren't used
  const possible: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) {
      possible.push(n);
    }
  }
  return possible;
};

// Check if placing a number at a position creates a conflict
const hasConflictAt = (grid: Cell[][], row: number, col: number, value: number): boolean => {
  if (value === 0) return false;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) return true;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) return true;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) return true;
    }
  }

  return false;
};

// Prune a specific number from peer cells' autoNotes when a pen value is placed
// Only prunes if the number is NOT user-edited in that cell
const pruneAutoNotesForPeers = (
  grid: Cell[][],
  placedRow: number,
  placedCol: number,
  placedValue: number
): Cell[][] => {
  const newGrid = cloneGrid(grid);

  // Get all peer cells (same row, column, or box)
  const peers: [number, number][] = [];

  // Row peers
  for (let c = 0; c < 9; c++) {
    if (c !== placedCol) peers.push([placedRow, c]);
  }

  // Column peers
  for (let r = 0; r < 9; r++) {
    if (r !== placedRow) peers.push([r, placedCol]);
  }

  // Box peers
  const boxRow = Math.floor(placedRow / 3) * 3;
  const boxCol = Math.floor(placedCol / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== placedRow || c !== placedCol) {
        // Avoid duplicates
        if (!peers.some(([pr, pc]) => pr === r && pc === c)) {
          peers.push([r, c]);
        }
      }
    }
  }

  // Prune the placed value from each peer's autoNotes (if not user-edited)
  for (const [r, c] of peers) {
    const cell = newGrid[r][c];
    if (cell.value === 0 && !cell.userEditedInAuto.includes(placedValue)) {
      cell.autoNotes = cell.autoNotes.filter(n => n !== placedValue);
    }
  }

  return newGrid;
};

const defaultGameplaySettings: GameplaySettings = {
  autoCheckMistakes: true,
  highlightConflicts: true,
  highlightRowColumn: true,
  highlightBox: true,
  highlightIdentical: true,
  showTimer: true,
  showMistakes: true,
  autoNotes: false,
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
    theme: 'light' as ThemeName,
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

const defaultStats = {
  gamesCompleted: 0,
  bestTimes: { easy: 0, medium: 0, hard: 0 },
  totalPlayTime: 0,
};

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
                manualNotes: [],
                autoNotes: [],
                userEditedInAuto: [],
              };
            }
          }
        }

        // If auto notes is enabled, calculate initial candidates
        const autoNotesEnabled = get().settings.gameplay?.autoNotes ?? false;
        if (autoNotesEnabled) {
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              if (userGrid[row][col].value === 0) {
                userGrid[row][col].autoNotes = calculateAutoNotes(userGrid, row, col);
              }
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
        const autoNotesEnabled = state.settings.gameplay?.autoNotes ?? false;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven) return;

        let newGrid = cloneGrid(userGrid);
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: num,
          // Clear auto layer on placed cell, but preserve manual notes (passive layer)
          autoNotes: [],
          userEditedInAuto: [],
        };

        // If auto notes is enabled, prune this number from peer cells
        if (autoNotesEnabled && num !== 0) {
          newGrid = pruneAutoNotesForPeers(newGrid, row, col, num);
        }

        // Check if the number creates a conflict (duplicate in row, column, or box)
        let newMistakes = state.game.mistakes;
        if (hasConflictAt(newGrid, row, col, num)) {
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
        const autoNotesEnabled = state.settings.gameplay?.autoNotes ?? false;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven) return;

        const newGrid = cloneGrid(userGrid);

        // Clear value and reset auto layer, but preserve manual notes
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: 0,
          autoNotes: autoNotesEnabled ? calculateAutoNotes(newGrid, row, col) : [],
          userEditedInAuto: [],
          // manualNotes preserved from spread
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
        const autoNotesEnabled = state.settings.gameplay?.autoNotes ?? false;

        if (!selectedCell || isComplete) return;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven || userGrid[row][col].value !== 0) return;

        const newGrid = cloneGrid(userGrid);
        const cell = newGrid[row][col];

        if (autoNotesEnabled) {
          // Toggle in autoNotes layer and track as user-edited
          const autoNotes = [...cell.autoNotes];
          const userEdited = [...cell.userEditedInAuto];

          if (autoNotes.includes(num)) {
            // Remove from autoNotes
            autoNotes.splice(autoNotes.indexOf(num), 1);
          } else {
            // Add to autoNotes
            autoNotes.push(num);
            autoNotes.sort((a, b) => a - b);
          }

          // Track this number as user-edited (protects from auto-pruning)
          if (!userEdited.includes(num)) {
            userEdited.push(num);
            userEdited.sort((a, b) => a - b);
          }

          newGrid[row][col] = { ...cell, autoNotes, userEditedInAuto: userEdited };
        } else {
          // Toggle in manualNotes layer
          const manualNotes = [...cell.manualNotes];

          if (manualNotes.includes(num)) {
            manualNotes.splice(manualNotes.indexOf(num), 1);
          } else {
            manualNotes.push(num);
            manualNotes.sort((a, b) => a - b);
          }

          newGrid[row][col] = { ...cell, manualNotes };
        }

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
        const autoNotes = state.settings.gameplay?.autoNotes ?? false;

        if (isComplete || hintsRemaining <= 0 || difficulty === 'hard') return;

        let targetRow = -1;
        let targetCol = -1;

        const selected = state.game.selectedCell;
        if (selected) {
          const [row, col] = selected;
          if (userGrid[row][col].value === 0 || userGrid[row][col].value !== solution[row][col]) {
            targetRow = row;
            targetCol = col;
          }
        }

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

        let newGrid = cloneGrid(userGrid);
        const hintValue = solution[targetRow][targetCol];
        newGrid[targetRow][targetCol] = {
          ...newGrid[targetRow][targetCol],
          value: hintValue,
          // Preserve manual notes (passive layer)
          autoNotes: [],
          userEditedInAuto: [],
        };

        // Prune this value from peer cells' autoNotes
        if (autoNotes && hintValue !== 0) {
          newGrid = pruneAutoNotesForPeers(newGrid, targetRow, targetCol, hintValue);
        }

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

      checkCell: () => {
        const state = get();
        const { selectedCell, userGrid, solution } = state.game;

        if (!selectedCell) {
          return { correct: false, checked: false };
        }

        const [row, col] = selectedCell;
        const cell = userGrid[row][col];

        if (cell.value === 0) {
          return { correct: false, checked: false };
        }

        const isCorrect = cell.value === solution[row][col];
        return { correct: isCorrect, checked: true };
      },

      checkPuzzle: () => {
        const state = get();
        const { userGrid, solution } = state.game;

        let total = 0;
        let correct = 0;
        let incorrect = 0;

        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            const cell = userGrid[row][col];
            if (cell.value !== 0 && !cell.isGiven) {
              total++;
              if (cell.value === solution[row][col]) {
                correct++;
              } else {
                incorrect++;
              }
            }
          }
        }

        return { total, correct, incorrect };
      },

      revealCell: () => {
        const state = get();
        const { selectedCell, userGrid, solution, isComplete } = state.game;
        const autoNotes = state.settings.gameplay?.autoNotes ?? false;

        if (!selectedCell || isComplete) return false;

        const [row, col] = selectedCell;
        if (userGrid[row][col].isGiven) return false;
        if (userGrid[row][col].value === solution[row][col]) return false;

        let newGrid = cloneGrid(userGrid);
        const revealedValue = solution[row][col];
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: revealedValue,
          // Preserve manual notes (passive layer)
          autoNotes: [],
          userEditedInAuto: [],
        };

        // Prune this value from peer cells' autoNotes
        if (autoNotes && revealedValue !== 0) {
          newGrid = pruneAutoNotesForPeers(newGrid, row, col, revealedValue);
        }

        const hasWon = checkWin(newGrid, solution);

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...state.game,
            userGrid: newGrid,
            isComplete: hasWon,
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

        return true;
      },

      revealPuzzle: () => {
        const state = get();
        const { solution, isComplete } = state.game;

        if (isComplete) return;

        const newGrid = createEmptyGrid();
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            newGrid[row][col] = {
              value: solution[row][col],
              isGiven: state.game.userGrid[row][col].isGiven,
              manualNotes: [],
              autoNotes: [],
              userEditedInAuto: [],
            };
          }
        }

        set({
          game: {
            ...state.game,
            userGrid: newGrid,
            isComplete: true,
          },
        });
      },

      resetPuzzle: () => {
        const state = get();
        const { puzzle } = state.game;
        const autoNotesEnabled = state.settings.gameplay?.autoNotes ?? false;

        const userGrid = createEmptyGrid();
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (puzzle[row][col] !== 0) {
              userGrid[row][col] = {
                value: puzzle[row][col],
                isGiven: true,
                manualNotes: [],
                autoNotes: [],
                userEditedInAuto: [],
              };
            }
          }
        }

        // If auto notes is enabled, initialize candidates for empty cells
        if (autoNotesEnabled) {
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              if (userGrid[row][col].value === 0) {
                userGrid[row][col].autoNotes = calculateAutoNotes(userGrid, row, col);
              }
            }
          }
        }

        set({
          game: {
            ...state.game,
            userGrid,
            selectedCell: null,
            isComplete: false,
            mistakes: 0,
            timer: 0,
          },
          history: [cloneGrid(userGrid)],
          historyIndex: 0,
        });
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
        set((s) => ({
          settings: {
            ...s.settings,
            gameplay: {
              ...(s.settings.gameplay ?? defaultGameplaySettings),
              [key]: value,
            },
          },
        }));

        // If auto notes was just turned on, initialize autoNotes for all empty cells
        if (key === 'autoNotes' && value === true) {
          const currentState = get();
          const newGrid = cloneGrid(currentState.game.userGrid);
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              if (newGrid[row][col].value === 0) {
                const cell = newGrid[row][col];
                const validCandidates = calculateAutoNotes(newGrid, row, col);
                const userEdited = cell.userEditedInAuto;

                if (userEdited.length > 0) {
                  // Preserve user edits: start with calculated candidates,
                  // then restore user-edited numbers to their previous state
                  const previousAutoNotes = cell.autoNotes;
                  // Remove user-edited numbers from calculated set
                  const base = validCandidates.filter(n => !userEdited.includes(n));
                  // Add back user-edited numbers that were in previous autoNotes
                  for (const num of userEdited) {
                    if (previousAutoNotes.includes(num)) {
                      base.push(num);
                    }
                  }
                  base.sort((a, b) => a - b);
                  newGrid[row][col].autoNotes = base;
                  // Keep userEditedInAuto preserved from cloneGrid
                } else {
                  // No user edits, just use calculated candidates
                  newGrid[row][col].autoNotes = validCandidates;
                }
              }
            }
          }
          set({
            game: {
              ...currentState.game,
              userGrid: newGrid,
            },
          });
        }
        // When turning off autoNotes, keep both layers as-is
        // User can switch back and forth without losing either layer's data
      },

      resetStats: () => {
        set({ stats: defaultStats });
      },

      // Get all cells that conflict with the given cell
      getConflicts: (row: number, col: number): [number, number][] => {
        const state = get();
        const { userGrid } = state.game;
        const value = userGrid[row][col].value;
        
        if (value === 0) return [];
        
        const conflicts: [number, number][] = [];
        
        // Check row
        for (let c = 0; c < 9; c++) {
          if (c !== col && userGrid[row][c].value === value) {
            conflicts.push([row, c]);
          }
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
          if (r !== row && userGrid[r][col].value === value) {
            conflicts.push([r, col]);
          }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if ((r !== row || c !== col) && userGrid[r][c].value === value) {
              // Avoid duplicates (cell might already be added from row/col check)
              if (!conflicts.some(([cr, cc]) => cr === r && cc === c)) {
                conflicts.push([r, c]);
              }
            }
          }
        }
        
        return conflicts;
      },
    }),
    {
      name: 'sudoku-storage',
      version: STORAGE_VERSION,
      migrate: (persistedState: unknown, version: number) => {
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