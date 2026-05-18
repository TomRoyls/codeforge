import { describe, it, expect } from 'vitest';
import { SparseMatrix2 } from '../../src/core/sparse-matrix-2/index.js';

// ─── Constructor ───

describe('SparseMatrix2', () => {
  describe('constructor', () => {
    it('creates a matrix with given dimensions', () => {
      const m = new SparseMatrix2(3, 4);
      expect(m.rows()).toBe(3);
      expect(m.cols()).toBe(4);
    });

    it('creates a 1x1 matrix', () => {
      const m = new SparseMatrix2(1, 1);
      expect(m.rows()).toBe(1);
      expect(m.cols()).toBe(1);
    });

    it('initializes with zero non-zero elements', () => {
      const m = new SparseMatrix2(3, 3);
      expect(m.nonZeroCount()).toBe(0);
    });
  });

  // ─── get / set ───

  describe('get and set', () => {
    it('returns 0 for unset cells', () => {
      const m = new SparseMatrix2(3, 3);
      expect(m.get(0, 0)).toBe(0);
      expect(m.get(2, 2)).toBe(0);
    });

    it('sets and gets a value', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(1, 1, 5);
      expect(m.get(1, 1)).toBe(5);
    });

    it('overwrites an existing value', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(0, 0, 10);
      m.set(0, 0, 20);
      expect(m.get(0, 0)).toBe(20);
    });

    it('throws for out-of-bounds set', () => {
      const m = new SparseMatrix2(3, 3);
      expect(() => m.set(-1, 0, 1)).toThrow('Index out of bounds');
      expect(() => m.set(0, -1, 1)).toThrow('Index out of bounds');
      expect(() => m.set(3, 0, 1)).toThrow('Index out of bounds');
      expect(() => m.set(0, 3, 1)).toThrow('Index out of bounds');
    });

    it('setting value to 0 removes the entry', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(1, 1, 7);
      expect(m.nonZeroCount()).toBe(1);
      m.set(1, 1, 0);
      expect(m.nonZeroCount()).toBe(0);
      expect(m.get(1, 1)).toBe(0);
    });

    it('setting 0 to a non-existent cell is a no-op', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(0, 0, 0);
      expect(m.nonZeroCount()).toBe(0);
    });

    it('handles negative values', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(0, 0, -42);
      expect(m.get(0, 0)).toBe(-42);
    });

    it('handles multiple values in same row', () => {
      const m = new SparseMatrix2(1, 5);
      m.set(0, 0, 1);
      m.set(0, 2, 3);
      m.set(0, 4, 5);
      expect(m.get(0, 0)).toBe(1);
      expect(m.get(0, 1)).toBe(0);
      expect(m.get(0, 2)).toBe(3);
      expect(m.get(0, 3)).toBe(0);
      expect(m.get(0, 4)).toBe(5);
      expect(m.nonZeroCount()).toBe(3);
    });
  });

  // ─── nonZeroCount / density ───

  describe('nonZeroCount and density', () => {
    it('returns 0 density for empty matrix', () => {
      const m = new SparseMatrix2(3, 3);
      expect(m.density()).toBe(0);
    });

    it('calculates density correctly', () => {
      const m = new SparseMatrix2(2, 2);
      m.set(0, 0, 1);
      expect(m.density()).toBe(0.25);
    });

    it('returns 1 density for fully filled matrix', () => {
      const m = new SparseMatrix2(2, 2);
      m.set(0, 0, 1);
      m.set(0, 1, 2);
      m.set(1, 0, 3);
      m.set(1, 1, 4);
      expect(m.density()).toBe(1);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns zero-filled 2D array for empty matrix', () => {
      const m = new SparseMatrix2(2, 3);
      expect(m.toArray()).toEqual([
        [0, 0, 0],
        [0, 0, 0],
      ]);
    });

    it('returns filled 2D array', () => {
      const m = new SparseMatrix2(2, 2);
      m.set(0, 1, 5);
      m.set(1, 0, 10);
      expect(m.toArray()).toEqual([
        [0, 5],
        [10, 0],
      ]);
    });
  });

  // ─── multiplyVector ───

  describe('multiplyVector', () => {
    it('multiplies by a zero vector', () => {
      const m = new SparseMatrix2(2, 2);
      m.set(0, 0, 1);
      m.set(1, 1, 1);
      expect(m.multiplyVector([0, 0])).toEqual([0, 0]);
    });

    it('multiplies by identity-like vector', () => {
      const m = new SparseMatrix2(2, 2);
      m.set(0, 0, 2);
      m.set(0, 1, 3);
      m.set(1, 0, 4);
      m.set(1, 1, 5);
      expect(m.multiplyVector([1, 0])).toEqual([2, 4]);
    });

    it('multiplies correctly with sparse data', () => {
      const m = new SparseMatrix2(3, 3);
      m.set(0, 2, 2);
      m.set(1, 0, 3);
      m.set(2, 1, 4);
      expect(m.multiplyVector([1, 2, 3])).toEqual([6, 3, 8]);
    });

    it('throws if vector length does not match columns', () => {
      const m = new SparseMatrix2(2, 3);
      expect(() => m.multiplyVector([1, 2])).toThrow('Vector length must match matrix column count');
    });
  });

  // ─── transpose ───

  describe('transpose', () => {
    it('transposes an empty matrix', () => {
      const m = new SparseMatrix2(3, 2);
      const t = m.transpose();
      expect(t.rows()).toBe(2);
      expect(t.cols()).toBe(3);
      expect(t.nonZeroCount()).toBe(0);
    });

    it('transposes a non-square matrix', () => {
      const m = new SparseMatrix2(2, 3);
      m.set(0, 1, 5);
      m.set(1, 2, 10);
      const t = m.transpose();
      expect(t.rows()).toBe(3);
      expect(t.cols()).toBe(2);
      expect(t.get(1, 0)).toBe(5);
      expect(t.get(2, 1)).toBe(10);
    });

    it('transposing twice returns to original', () => {
      const m = new SparseMatrix2(2, 3);
      m.set(0, 1, 7);
      m.set(1, 0, 3);
      const tt = m.transpose().transpose();
      expect(tt.rows()).toBe(2);
      expect(tt.cols()).toBe(3);
      expect(tt.get(0, 1)).toBe(7);
      expect(tt.get(1, 0)).toBe(3);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element matrix', () => {
      const m = new SparseMatrix2(1, 1);
      m.set(0, 0, 42);
      expect(m.get(0, 0)).toBe(42);
      expect(m.nonZeroCount()).toBe(1);
      expect(m.toArray()).toEqual([[42]]);
    });

    it('handles large sparse matrix', () => {
      const m = new SparseMatrix2(100, 100);
      m.set(0, 0, 1);
      m.set(99, 99, 2);
      expect(m.nonZeroCount()).toBe(2);
      expect(m.get(50, 50)).toBe(0);
    });

    it('insertion maintains sorted column order within row', () => {
      const m = new SparseMatrix2(1, 5);
      m.set(0, 4, 4);
      m.set(0, 0, 0);
      m.set(0, 2, 2);
      expect(m.toArray()[0]).toEqual([0, 0, 2, 0, 4]);
    });

    it('remove middle element and re-add', () => {
      const m = new SparseMatrix2(1, 3);
      m.set(0, 0, 1);
      m.set(0, 1, 2);
      m.set(0, 2, 3);
      m.set(0, 1, 0);
      expect(m.nonZeroCount()).toBe(2);
      m.set(0, 1, 10);
      expect(m.nonZeroCount()).toBe(3);
      expect(m.get(0, 1)).toBe(10);
    });
  });
});
