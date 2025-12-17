/**
 * Sudoku puzzle generation and validation utilities.
 * @module utils/sudoku
 */

import sudoku from 'sudoku';
import type { Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from './constants';

/**
 * Result of puzzle generation containing both the puzzle and its solution.
 */
interface PuzzleResult {
  /** The puzzle grid with some cells set to 0 (empty) */
  puzzle: number[][];
  /** The complete solution grid */
  solution: number[][];
}

/**
 * Generate a new Sudoku puzzle with the given difficulty.
 * 
 * Uses the `sudoku` npm package for generation, then converts
 * from its format (1D array, 0-8 values) to our format (2D array, 1-9 values).
 * 
 * @param difficulty - The difficulty level determining how many clues to provide
 * @returns Object containing both the puzzle and its solution
 * 
 * @example
 * const { puzzle, solution } = generatePuzzle('medium');
 * // puzzle[0][0] might be 0 (empty) or 1-9 (clue)
 * // solution[0][0] is always 1-9
 */
export const generatePuzzle = (difficulty: Difficulty): PuzzleResult => {
  // Generate a puzzle with the sudoku library
  const puzzleArray = sudoku.makepuzzle();
  const solutionArray = sudoku.solvepuzzle(puzzleArray);

  if (!solutionArray) {
    // Fallback: try again if solve fails
    return generatePuzzle(difficulty);
  }

  // Convert to 2D arrays (sudoku library uses 1D arrays with null for empty, 0-8 for values)
  const solution = arrayToGrid(solutionArray);
  
  // Create puzzle by removing cells based on difficulty
  const puzzle = createPuzzleFromSolution(solution, difficulty);

  return { puzzle, solution };
};

/**
 * Convert sudoku library format to our internal format.
 * 
 * @param puzzleArray - 1D array of 81 elements (0-8 or null)
 * @returns 2D 9×9 grid with values 1-9 (0 for empty)
 * @internal
 */
const arrayToGrid = (puzzleArray: (number | null)[]): number[][] => {
  const grid: number[][] = [];
  for (let i = 0; i < 9; i++) {
    const row: number[] = [];
    for (let j = 0; j < 9; j++) {
      const value = puzzleArray[i * 9 + j];
      // Convert from 0-8 to 1-9, null becomes 0
      row.push(value !== null ? value + 1 : 0);
    }
    grid.push(row);
  }
  return grid;
};

/**
 * Create a puzzle by removing numbers from a complete solution.
 * 
 * @param solution - Complete 9×9 solution grid
 * @param difficulty - Determines how many cells to remove
 * @returns Puzzle grid with some cells set to 0
 * @internal
 */
const createPuzzleFromSolution = (solution: number[][], difficulty: Difficulty): number[][] => {
  const puzzle = solution.map(row => [...row]);
  const config = DIFFICULTY_CONFIG[difficulty];
  const cellsToRemove = 81 - config.clues;

  // Get all cell positions
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions using Fisher-Yates
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove cells
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [r, c] = positions[i];
    puzzle[r][c] = 0;
  }

  return puzzle;
};

/**
 * Validate if a number can be placed at a position without conflicts.
 * 
 * Checks row, column, and 3×3 box for duplicates.
 * 
 * @param grid - Current grid state (values 0-9)
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @param num - Number to validate (1-9)
 * @returns True if the move is valid (no conflicts)
 * 
 * @example
 * if (isValidMove(grid, 0, 0, 5)) {
 *   // Safe to place 5 at position (0,0)
 * }
 */
export const isValidMove = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && grid[r][c] === num) return false;
    }
  }

  return true;
};

/**
 * Check if the puzzle is completely and correctly solved.
 * 
 * @param grid - Current user grid values
 * @param solution - Complete solution to compare against
 * @returns True if every cell matches the solution
 */
export const isPuzzleComplete = (grid: number[][], solution: number[][]): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
};