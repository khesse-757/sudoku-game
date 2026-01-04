import { describe, it, expect } from 'vitest';
import { generatePuzzle, isValidMove } from './sudoku';

describe('generatePuzzle', () => {
  it('should generate a valid puzzle and solution', () => {
    const { puzzle, solution } = generatePuzzle('easy');

    expect(puzzle).toHaveLength(9);
    expect(solution).toHaveLength(9);

    for (const row of solution) {
      expect(row).toHaveLength(9);
      for (const cell of row) {
        expect(cell).toBeGreaterThanOrEqual(1);
        expect(cell).toBeLessThanOrEqual(9);
      }
    }
  });
});

describe('isValidMove', () => {
  it('should return false for duplicate in row', () => {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    grid[0][0] = 5;

    expect(isValidMove(grid, 0, 8, 5)).toBe(false);
  });

  it('should return false for duplicate in column', () => {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    grid[0][0] = 5;

    expect(isValidMove(grid, 8, 0, 5)).toBe(false);
  });

  it('should return false for duplicate in 3x3 box', () => {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    grid[0][0] = 5;

    expect(isValidMove(grid, 1, 1, 5)).toBe(false);
  });

  it('should return true for valid placement', () => {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    grid[0][0] = 5;

    // (3,3) is in different row, column, and box
    expect(isValidMove(grid, 3, 3, 5)).toBe(true);
  });
});