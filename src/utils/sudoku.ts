/**
 * Sudoku puzzle generation and validation utilities.
 * @module utils/sudoku
 */

import { generate, solve } from 'sudoku-core';
import type { Difficulty } from '../types';

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
 * Uses the `sudoku-core` package which generates puzzles solvable by
 * logic techniques (no guessing required). Difficulty is determined by
 * the solving strategies needed:
 * - easy: naked singles, hidden singles
 * - medium: + naked pairs, pointing pairs
 * - hard: + advanced techniques
 *
 * @param difficulty - The difficulty level determining required solving techniques
 * @returns Object containing both the puzzle and its solution
 *
 * @example
 * const { puzzle, solution } = generatePuzzle('medium');
 * // puzzle[0][0] might be 0 (empty) or 1-9 (clue)
 * // solution[0][0] is always 1-9
 */
export const generatePuzzle = (difficulty: Difficulty): PuzzleResult => {
  // generate() returns Board (81-element array, values 1-9 or null for empty)
  const board = generate(difficulty);

  // solve() returns { solved: boolean, board: Board }
  const result = solve(board);

  // Convert to our 2D grid format
  const puzzle = boardToGrid(board);
  const solution = boardToGrid(result.board!);

  return { puzzle, solution };
};

/**
 * Convert sudoku-core Board format to our internal 2D grid format.
 *
 * @param board - 81-element array (values 1-9 or null for empty)
 * @returns 2D 9x9 grid with values 1-9 (0 for empty)
 * @internal
 */
const boardToGrid = (board: (number | null)[]): number[][] => {
  const grid: number[][] = [];
  for (let i = 0; i < 9; i++) {
    const row: number[] = [];
    for (let j = 0; j < 9; j++) {
      row.push(board[i * 9 + j] ?? 0);
    }
    grid.push(row);
  }
  return grid;
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