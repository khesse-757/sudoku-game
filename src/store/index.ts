import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, SettingsState, Statistics, Difficulty, ThemeName, FontFamily, Cell } from '../types';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { generatePuzzle, isPuzzleComplete } from '../utils/sudoku';

interface Store {
  game: GameState;
  settings: SettingsState;
  stats: Statistics;
  history: Cell[][][];
  historyIndex: number;
  startNewGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  setNumber: (num: number) => void;
  toggleNote: (num: number) => void;
  clearCell: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  incrementTimer: () => void;
  setTheme: (theme: ThemeName) => void;
  setFont: (font: FontFamily) => void;
  toggleAnimation: (key: keyof SettingsState['animations']) => void;
  setAudioVolume: (type: 'sfx' | 'music', volume: number) => void;
  toggleAudio: (type: 'sfx' | 'music') => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  useHint: () => void;
}

const createEmptyGrid = (): Cell[][] => {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      notes: []
    }))
  );
};

// Helper to deep clone grid
const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
};

const initialGameState: GameState = {
  puzzle: Array(9).fill(null).map(() => Array(9).fill(0)),
  solution: Array(9).fill(null).map(() => Array(9).fill(0)),
  userGrid: createEmptyGrid(),
  selectedCell: null,
  difficulty: 'medium',
  timer: 0,
  isPaused: false,
  isComplete: false,
  mistakes: 0,
  hintsRemaining: 3
};

const initialSettingsState: SettingsState = {
  theme: 'green',
  font: 'jetbrains',
  animations: {
    cellHighlight: true,
    numberPlacement: true,
    transitions: true
  },
  audio: {
    sfxEnabled: true,
    sfxVolume: 0.5,
    musicEnabled: false,
    musicVolume: 0.3
  },
  mistakeHighlight: true
};

const initialStats: Statistics = {
  gamesCompleted: 0,
  bestTimes: {
    easy: 0,
    medium: 0,
    hard: 0
  },
  totalPlayTime: 0
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      game: initialGameState,
      settings: initialSettingsState,
      stats: initialStats,
      history: [],
      historyIndex: -1,

      startNewGame: (difficulty) => {
        const { puzzle, solution } = generatePuzzle(difficulty);
        const userGrid = createEmptyGrid();
        
        puzzle.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val !== 0) {
              userGrid[r][c] = {
                value: val,
                isGiven: true,
                notes: []
              };
            }
          });
        });

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
            hintsRemaining: DIFFICULTY_CONFIG[difficulty].hintsAllowed
          },
          history: [cloneGrid(userGrid)],
          historyIndex: 0
        });
      },

      selectCell: (row, col) => {
        const { game } = get();
        set({
          game: {
            ...game,
            selectedCell: [row, col]
          }
        });
      },

      setNumber: (num) => {
        const { game, history, historyIndex } = get();
        if (!game.selectedCell || game.isPaused || game.isComplete) return;

        const [row, col] = game.selectedCell;
        const cell = game.userGrid[row][col];

        if (cell.isGiven) return;

        const newGrid = cloneGrid(game.userGrid);
        newGrid[row][col] = {
          ...cell,
          value: num,
          notes: []
        };

        const isCorrect = num === game.solution[row][col];
        const newMistakes = !isCorrect && num !== 0 ? game.mistakes + 1 : game.mistakes;
        
        // Convert Cell[][] to number[][] for isPuzzleComplete
        const numberGrid = newGrid.map(row => row.map(cell => cell.value));
        const isComplete = isPuzzleComplete(numberGrid, game.solution);

        // Add to history (remove any future history if we're not at the end)
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...game,
            userGrid: newGrid,
            mistakes: newMistakes,
            isComplete
          },
          history: newHistory,
          historyIndex: newHistory.length - 1
        });

        if (isComplete) {
          const { stats } = get();
          const currentBest = stats.bestTimes[game.difficulty];
          const newBest = currentBest === 0 || game.timer < currentBest ? game.timer : currentBest;
          
          set({
            stats: {
              ...stats,
              gamesCompleted: stats.gamesCompleted + 1,
              bestTimes: {
                ...stats.bestTimes,
                [game.difficulty]: newBest
              }
            }
          });
        }
      },

      toggleNote: (num) => {
        const { game, history, historyIndex } = get();
        if (!game.selectedCell || game.isPaused || game.isComplete) return;

        const [row, col] = game.selectedCell;
        const cell = game.userGrid[row][col];

        if (cell.isGiven || cell.value !== 0) return;

        const newGrid = cloneGrid(game.userGrid);
        const notes = [...cell.notes];
        
        if (notes.includes(num)) {
          newGrid[row][col].notes = notes.filter(n => n !== num);
        } else {
          newGrid[row][col].notes = [...notes, num].sort();
        }

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...game,
            userGrid: newGrid
          },
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
      },

      clearCell: () => {
        const { game, history, historyIndex } = get();
        if (!game.selectedCell || game.isPaused || game.isComplete) return;

        const [row, col] = game.selectedCell;
        const cell = game.userGrid[row][col];

        if (cell.isGiven) return;

        const newGrid = cloneGrid(game.userGrid);
        newGrid[row][col] = {
          value: 0,
          isGiven: false,
          notes: []
        };

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneGrid(newGrid));

        set({
          game: {
            ...game,
            userGrid: newGrid
          },
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
      },

      useHint: () => {
        const { game, history, historyIndex } = get();
        
        // Can't use hint if no hints remaining, paused, or complete
        if (game.hintsRemaining <= 0 || game.isPaused || game.isComplete) return;

        // If a cell is selected and it's empty, fill it
        if (game.selectedCell) {
          const [row, col] = game.selectedCell;
          const cell = game.userGrid[row][col];

          if (!cell.isGiven && cell.value === 0) {
            const newGrid = cloneGrid(game.userGrid);
            newGrid[row][col] = {
              value: game.solution[row][col],
              isGiven: false,
              notes: []
            };

            // Add to history
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(cloneGrid(newGrid));

            // Convert Cell[][] to number[][] for isPuzzleComplete
            const numberGrid = newGrid.map(row => row.map(cell => cell.value));
            const isComplete = isPuzzleComplete(numberGrid, game.solution);

            set({
              game: {
                ...game,
                userGrid: newGrid,
                hintsRemaining: game.hintsRemaining - 1,
                isComplete
              },
              history: newHistory,
              historyIndex: newHistory.length - 1
            });

            if (isComplete) {
              const { stats } = get();
              const currentBest = stats.bestTimes[game.difficulty];
              const newBest = currentBest === 0 || game.timer < currentBest ? game.timer : currentBest;
              
              set({
                stats: {
                  ...stats,
                  gamesCompleted: stats.gamesCompleted + 1,
                  bestTimes: {
                    ...stats.bestTimes,
                    [game.difficulty]: newBest
                  }
                }
              });
            }
            return;
          }
        }

        // If no cell selected or selected cell is filled, find first empty cell
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const cell = game.userGrid[r][c];
            if (!cell.isGiven && cell.value === 0) {
              const newGrid = cloneGrid(game.userGrid);
              newGrid[r][c] = {
                value: game.solution[r][c],
                isGiven: false,
                notes: []
              };

              // Add to history
              const newHistory = history.slice(0, historyIndex + 1);
              newHistory.push(cloneGrid(newGrid));

              // Convert Cell[][] to number[][] for isPuzzleComplete
              const numberGrid = newGrid.map(row => row.map(cell => cell.value));
              const isComplete = isPuzzleComplete(numberGrid, game.solution);

              set({
                game: {
                  ...game,
                  userGrid: newGrid,
                  hintsRemaining: game.hintsRemaining - 1,
                  selectedCell: [r, c],
                  isComplete
                },
                history: newHistory,
                historyIndex: newHistory.length - 1
              });

              if (isComplete) {
                const { stats } = get();
                const currentBest = stats.bestTimes[game.difficulty];
                const newBest = currentBest === 0 || game.timer < currentBest ? game.timer : currentBest;
                
                set({
                  stats: {
                    ...stats,
                    gamesCompleted: stats.gamesCompleted + 1,
                    bestTimes: {
                      ...stats.bestTimes,
                      [game.difficulty]: newBest
                    }
                  }
                });
              }
              return;
            }
          }
        }
      },

      undo: () => {
        const { game, history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const previousGrid = cloneGrid(history[newIndex]);

        set({
          game: {
            ...game,
            userGrid: previousGrid
          },
          historyIndex: newIndex
        });
      },

      redo: () => {
        const { game, history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const nextGrid = cloneGrid(history[newIndex]);

        set({
          game: {
            ...game,
            userGrid: nextGrid
          },
          historyIndex: newIndex
        });
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      pauseGame: () => {
        const { game } = get();
        set({
          game: {
            ...game,
            isPaused: true
          }
        });
      },

      resumeGame: () => {
        const { game } = get();
        set({
          game: {
            ...game,
            isPaused: false
          }
        });
      },

      incrementTimer: () => {
        const { game } = get();
        if (!game.isPaused && !game.isComplete) {
          set({
            game: {
              ...game,
              timer: game.timer + 1
            }
          });
        }
      },

      setTheme: (theme) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            theme
          }
        });
      },

      setFont: (font) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            font
          }
        });
      },

      toggleAnimation: (key) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            animations: {
              ...settings.animations,
              [key]: !settings.animations[key]
            }
          }
        });
      },

      setAudioVolume: (type, volume) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            audio: {
              ...settings.audio,
              [`${type}Volume`]: volume
            }
          }
        });
      },

      toggleAudio: (type) => {
        const { settings } = get();
        const key = `${type}Enabled` as const;
        set({
          settings: {
            ...settings,
            audio: {
              ...settings.audio,
              [key]: !settings.audio[key]
            }
          }
        });
      }
    }),
    {
      name: 'sudoku-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);