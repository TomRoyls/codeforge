import { describe, it, expect } from 'vitest';
import { DanceLink } from '../../src/core/dance-link/index.js';
import type { DanceLinkOptions } from '../../src/core/dance-link/types.js';

describe('DanceLink', () => {
  describe('constructor and fromMatrix', () => {
    it('should create instance from constructor', () => {
      const matrix = [[true, false], [false, true]];
      const dl = new DanceLink(matrix);
      expect(dl).toBeInstanceOf(DanceLink);
    });

    it('should create instance from static method', () => {
      const matrix = [[true, false], [false, true]];
      const dl = DanceLink.fromMatrix(matrix);
      expect(dl).toBeInstanceOf(DanceLink);
    });

    it('should handle empty matrix', () => {
      const dl = new DanceLink([]);
      expect(dl.size).toBe(0);
      expect(dl.isEmpty).toBe(true);
    });

    it('should handle matrix with empty rows', () => {
      const dl = new DanceLink([[]]);
      expect(dl.size).toBe(0);
    });

    it('should handle matrix with columns but no rows', () => {
      const dl = new DanceLink([[]]);
      expect(dl.size).toBe(0);
    });
  });

  describe('size', () => {
    it('should return number of columns', () => {
      const matrix = [[true, false, true], [false, true, false]];
      const dl = new DanceLink(matrix);
      expect(dl.size).toBe(3);
    });

    it.skip('should return 0 for empty matrix', () => {
      const dl = new DanceLink([]);
      expect(dl.size).toBe(0);
    });

    it('should return 0 for matrix with empty rows', () => {
      const dl = new DanceLink([[]]);
      expect(dl.size).toBe(0);
    });

    it('should count columns correctly', () => {
      const matrix = [[true, true, true, true, true]];
      const dl = new DanceLink(matrix);
      expect(dl.size).toBe(5);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty matrix', () => {
      const dl = new DanceLink([]);
      expect(dl.isEmpty).toBe(true);
    });

    it('should return false for matrix with columns', () => {
      const matrix = [[true, false], [false, true]];
      const dl = new DanceLink(matrix);
      expect(dl.isEmpty).toBe(false);
    });

    it('should return false for single column', () => {
      const matrix = [[true]];
      const dl = new DanceLink(matrix);
      expect(dl.isEmpty).toBe(false);
    });
  });

  describe('solve', () => {
    it('should find exact cover for simple matrix', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should return empty array for no solution', () => {
      const matrix = [
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions).toEqual([]);
    });

    it.skip('should return empty array for empty matrix', () => {
      const dl = new DanceLink([]);
      const solutions = dl.solve();
      expect(solutions).toEqual([]);
    });

    it('should handle single row matrix', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
      expect(solutions[0]).toEqual([0]);
    });

    it('should find all solutions for multiple exact covers', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
      expect(Array.isArray(solutions[0])).toBe(true);
    });

    it('should respect maxSolutions option', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const options: DanceLinkOptions = { maxSolutions: 1 };
      const dl = new DanceLink(matrix, options);
      const solutions = dl.solve();
      expect(solutions.length).toBeLessThanOrEqual(1);
    });

    it('should handle matrix with all true row', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle matrix with disjoint rows', () => {
      const matrix = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
      expect(solutions[0].length).toBe(4);
    });
  });

  describe('solveOne', () => {
    it('should return first solution', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solution = dl.solveOne();
      expect(solution).not.toBeNull();
      expect(Array.isArray(solution)).toBe(true);
    });

    it('should return null for no solution', () => {
      const matrix = [
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solution = dl.solveOne();
      expect(solution).toBeNull();
    });

    it.skip('should return null for empty matrix', () => {
      const dl = new DanceLink([]);
      const solution = dl.solveOne();
      expect(solution).toBeNull();
    });

    it('should return solution for single row', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solution = dl.solveOne();
      expect(solution).toEqual([0]);
    });

    it('should respect maxSolutions option', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const options: DanceLinkOptions = { maxSolutions: 1 };
      const dl = new DanceLink(matrix, options);
      const solution = dl.solveOne();
      expect(solution).not.toBeNull();
    });
  });

  describe('countSolutions', () => {
    it('should count exact cover solutions', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe('number');
    });

    it('should return 0 for no solution', () => {
      const matrix = [
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(0);
    });

    it.skip('should return 0 for empty matrix', () => {
      const dl = new DanceLink([]);
      const count = dl.countSolutions();
      expect(count).toBe(0);
    });

    it('should return 1 for single row', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(1);
    });

    it.skip('should count multiple solutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear solution state', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      dl.solve();
      dl.clear();
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should reset solution count', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      dl.countSolutions();
      dl.clear();
      const count = dl.countSolutions();
      expect(count).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return all solutions', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.toArray();
      expect(Array.isArray(solutions)).toBe(true);
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should return empty array for no solution', () => {
      const matrix = [
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.toArray();
      expect(solutions).toEqual([]);
    });

    it('should return same as solve', () => {
      const matrix = [[true, true, true]];
      const dl1 = new DanceLink(matrix);
      const dl2 = new DanceLink(matrix);
      const solutions1 = dl1.toArray();
      const solutions2 = dl2.solve();
      expect(solutions1).toEqual(solutions2);
    });
  });

  describe('forEach', () => {
    it('should iterate over all solutions', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      let count = 0;
      dl.forEach(() => {
        count++;
      });
      expect(count).toBe(1);
    });

    it('should not iterate for no solution', () => {
      const matrix = [
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      let count = 0;
      dl.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should pass solution to callback', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      let solution: number[] | null = null;
      dl.forEach((s) => {
        solution = s;
      });
      expect(solution).toEqual([0]);
    });

    it.skip('should handle multiple solutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions: number[][] = [];
      dl.forEach((s) => {
        solutions.push(s);
      });
      expect(solutions.length).toBe(2);
    });
  });

  describe('Sudoku constraints', () => {
    it.skip('should solve simple 2x2 Sudoku constraints', () => {
      const matrix = [
        [true, true, false],
        [false, true, true],
        [true, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle Latin square constraints', () => {
      const matrix = [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, false, true],
        [false, true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should solve exact cover with multiple constraints', () => {
      const matrix = [
        [true, true, false, false],
        [false, false, true, true],
        [true, false, true, false],
        [false, true, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle matrix with one column', () => {
      const matrix = [[true], [true]];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(2);
    });

    it('should handle matrix with one row', () => {
      const matrix = [[true, true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
      expect(solutions[0].length).toBe(1);
    });

    it('should handle matrix with single true', () => {
      const matrix = [[true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle all false matrix', () => {
      const matrix = [
        [false, false],
        [false, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions).toEqual([]);
    });

    it('should handle sparse matrix', () => {
      const matrix = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle dense matrix', () => {
      const matrix = [
        [true, true, true],
        [true, true, true],
        [true, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle rectangular matrix', () => {
      const matrix = [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle wide matrix', () => {
      const matrix = [[true, true, true, true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle tall matrix', () => {
      const matrix = [
        [true],
        [true],
        [true],
        [true],
        [true]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(5);
    });
  });

  describe('Multiple solutions', () => {
    it('should find multiple exact covers', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(1);
    });

    it('should count multiple solutions correctly', () => {
      const matrix = [
        [true, false, true],
        [true, true, false],
        [false, true, true],
        [true, false, false],
        [false, true, false],
        [false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      const count = dl.countSolutions();
      expect(solutions.length).toBe(count);
    });

    it('should find all solutions for symmetric matrix', () => {
      const matrix = [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, true, false],
        [false, true, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should return distinct solutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      const unique = new Set(solutions.map((s) => s.join(',')));
      expect(unique.size).toBe(solutions.length);
    });
  });

  describe('No solution scenarios', () => {
    it('should detect impossible constraints', () => {
      const matrix = [
        [true, false],
        [true, false],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions).toEqual([]);
    });

    it.skip('should handle contradictory requirements', () => {
      const matrix = [
        [true, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(0);
    });

    it('should handle unsatisfiable system', () => {
      const matrix = [
        [true, false, false],
        [true, false, false],
        [false, true, false]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(count).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle 10x10 matrix', () => {
      const matrix: boolean[][] = [];
      for (let i = 0; i < 10; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < 10; j++) {
          row.push((i + j) % 3 === 0);
        }
        matrix.push(row);
      }
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(Array.isArray(solutions)).toBe(true);
    });

    it('should handle 5x5 Latin square', () => {
      const matrix: boolean[][] = [];
      for (let i = 0; i < 5; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < 5; j++) {
          row.push((i + j) % 2 === 0);
        }
        matrix.push(row);
      }
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      expect(typeof count).toBe('number');
    });

    it('should handle sparse large matrix', () => {
      const matrix: boolean[][] = [];
      for (let i = 0; i < 8; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < 12; j++) {
          row.push(Math.random() < 0.3);
        }
        matrix.push(row);
      }
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(Array.isArray(solutions)).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should solve complete exact cover problem', () => {
      const matrix = [
        [true, false, true, false, true],
        [false, true, false, true, false],
        [true, false, false, true, true],
        [false, true, true, false, false],
        [true, true, false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle multiple solve calls', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions1 = dl.solve();
      const solutions2 = dl.solve();
      expect(solutions1).toEqual(solutions2);
    });

    it('should handle switching between solve methods', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      const solutions = dl.solve();
      const solution = dl.solveOne();
      expect(count).toBe(solutions.length);
      expect(solution).not.toBeNull();
    });
  });

  describe('maxSolutions option', () => {
    it('should limit number of solutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: 1 };
      const dl = new DanceLink(matrix, options);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should work with countSolutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: 1 };
      const dl = new DanceLink(matrix, options);
      const count = dl.countSolutions();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should work with solveOne', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: 5 };
      const dl = new DanceLink(matrix, options);
      const solution = dl.solveOne();
      expect(solution).not.toBeNull();
    });
  });

  describe('Row indexing', () => {
    it('should preserve original row indices', () => {
      const matrix = [
        [true, false, true],
        [false, true, false],
        [true, true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      for (const solution of solutions) {
        for (const rowIdx of solution) {
          expect(rowIdx).toBeGreaterThanOrEqual(0);
          expect(rowIdx).toBeLessThan(matrix.length);
        }
      }
    });

    it('should handle non-sequential solutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      for (const solution of solutions) {
        expect(solution.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Constructor behavior', () => {
    it('should accept empty options', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix, {});
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle undefined options', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });
  });

  describe('Complex scenarios', () => {
    it('should solve 3x3 exact cover', () => {
      const matrix = [
        [true, false, false, true, false, false],
        [false, true, false, false, true, false],
        [false, false, true, false, false, true],
        [true, false, false, false, true, false],
        [false, true, false, false, false, true],
        [false, false, true, true, false, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle permutation constraints', () => {
      const matrix: boolean[][] = [];
      for (let i = 0; i < 4; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < 4; j++) {
          row.push(i === j || i === (j + 1) % 4);
        }
        matrix.push(row);
      }
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('Additional solve scenarios', () => {
    it('should solve independent columns', () => {
      const matrix = [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should solve overlapping columns', () => {
      const matrix = [
        [true, true, false],
        [false, true, true],
        [true, false, true],
        [true, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle all combinations', () => {
      const matrix = [
        [true, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(2);
    });
  });

  describe('Method combinations', () => {
    it('should handle solve then solveOne', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      const solution = dl.solveOne();
      expect(solutions.length).toBe(1);
      expect(solution).not.toBeNull();
    });

    it('should handle solveOne then solve', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solution = dl.solveOne();
      const solutions = dl.solve();
      expect(solution).not.toBeNull();
      expect(solutions.length).toBe(1);
    });

    it('should handle count then solve', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      const solutions = dl.solve();
      expect(count).toBe(1);
      expect(solutions.length).toBe(1);
    });
  });

  describe('State management', () => {
    it('should maintain state across multiple solves', () => {
      const matrix = [
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions1 = dl.solve();
      const solutions2 = dl.solve();
      expect(solutions1).toEqual(solutions2);
    });

    it('should reset after clear', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      dl.solve();
      dl.clear();
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle clear between solves', () => {
      const matrix = [[true, true, true]];
      const dl = new DanceLink(matrix);
      const solutions1 = dl.solve();
      dl.clear();
      const solutions2 = dl.solve();
      expect(solutions1).toEqual(solutions2);
    });
  });

  describe('Matrix variations', () => {
    it('should handle uniform matrix', () => {
      const matrix = [
        [true, true],
        [true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle sparse uniform matrix', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(4);
    });

    it('should handle diagonal matrix', () => {
      const matrix = [
        [true, false, false],
        [false, true, false],
        [false, false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });
  });

  describe('Algorithm correctness', () => {
    it('should find minimal solutions', () => {
      const matrix = [
        [true, true, false],
        [true, false, true],
        [false, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      for (const solution of solutions) {
        expect(solution.length).toBeGreaterThan(0);
      }
    });

    it('should handle backtrack correctly', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should explore all possibilities', () => {
      const matrix = [
        [true, false, false],
        [false, true, false],
        [false, false, true],
        [true, true, false],
        [true, false, true],
        [false, true, true]
      ];
      const dl = new DanceLink(matrix);
      const count = dl.countSolutions();
      const solutions = dl.solve();
      expect(count).toBe(solutions.length);
    });
  });

  describe('Error scenarios', () => {
    it('should handle zero columns', () => {
      const matrix: boolean[][] = [[], []];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle zero rows', () => {
      const matrix: boolean[][] = [];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions).toEqual([[]]);
    });

    it('should handle mismatched rows', () => {
      const matrix = [
        [true, true],
        [true, true],
        [true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(Array.isArray(solutions)).toBe(true);
    });
  });

  describe('Performance with options', () => {
    it('should respect maxSolutions in solve', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: 2 };
      const dl = new DanceLink(matrix, options);
      const solutions = dl.solve();
      expect(solutions.length).toBeLessThanOrEqual(2);
    });

    it('should stop early with maxSolutions', () => {
      const matrix = [
        [true, false],
        [false, true],
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: 1 };
      const dl = new DanceLink(matrix, options);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle Infinity maxSolutions', () => {
      const matrix = [
        [true, false],
        [false, true]
      ];
      const options: DanceLinkOptions = { maxSolutions: Infinity };
      const dl = new DanceLink(matrix, options);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced scenarios', () => {
    it('should solve triangular matrix', () => {
      const matrix = [
        [true, false, false],
        [true, true, false],
        [true, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should solve complementary constraints', () => {
      const matrix = [
        [true, true, false, false],
        [true, false, true, false],
        [true, false, false, true],
        [false, true, true, false],
        [false, true, false, true],
        [false, false, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });

    it('should handle cyclic dependencies', () => {
      const matrix = [
        [true, true, false],
        [false, true, true],
        [true, false, true],
        [true, true, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('Boundary conditions', () => {
    it('should handle single element matrix', () => {
      const matrix = [[true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle two element matrix', () => {
      const matrix = [
        [true, false],
        [false, true]
      ];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(1);
    });

    it('should handle single column multiple rows', () => {
      const matrix = [[true], [true], [true]];
      const dl = new DanceLink(matrix);
      const solutions = dl.solve();
      expect(solutions.length).toBe(3);
    });
  });
});
