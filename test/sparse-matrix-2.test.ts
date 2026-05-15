import { describe, it, expect } from 'vitest';
import { SparseMatrix2 } from '../src/core/sparse-matrix-2/index.js';

describe('SparseMatrix2', () => {
  it('should create empty matrix', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(matrix.rows()).toBe(3);
    expect(matrix.cols()).toBe(4);
    expect(matrix.nonZeroCount()).toBe(0);
  });

  it('should get and set values', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    expect(matrix.get(0, 1)).toBe(5);
    expect(matrix.get(1, 2)).toBe(3);
    expect(matrix.get(2, 0)).toBe(2);
  });

  it('should return 0 for unset positions', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(matrix.get(0, 0)).toBe(0);
    expect(matrix.get(1, 1)).toBe(0);
    expect(matrix.get(2, 3)).toBe(0);
  });

  it('should update existing value', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 1, 10);
    expect(matrix.get(0, 1)).toBe(10);
    expect(matrix.nonZeroCount()).toBe(1);
  });

  it('should remove value when set to zero', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    expect(matrix.nonZeroCount()).toBe(1);
    matrix.set(0, 1, 0);
    expect(matrix.nonZeroCount()).toBe(0);
    expect(matrix.get(0, 1)).toBe(0);
  });

  it('should throw error for out of bounds', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(() => matrix.set(3, 0, 1)).toThrow('Index out of bounds');
    expect(() => matrix.set(0, 4, 1)).toThrow('Index out of bounds');
    expect(() => matrix.set(-1, 0, 1)).toThrow('Index out of bounds');
  });

  it('should count non-zero values', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 3, 1);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    expect(matrix.nonZeroCount()).toBe(4);
  });

  it('should calculate density', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 3, 1);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    expect(matrix.density()).toBe(4 / 12);
  });

  it('should convert to array', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 3, 1);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    const result = matrix.toArray();
    expect(result).toEqual([
      [0, 5, 0, 1],
      [0, 0, 3, 0],
      [2, 0, 0, 0],
    ]);
  });

  it('should convert empty matrix to array', () => {
    const matrix = new SparseMatrix2(2, 3);
    const result = matrix.toArray();
    expect(result).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  it('should multiply vector', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 3, 1);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    const vec = [1, 2, 3, 4];
    const result = matrix.multiplyVector(vec);

    expect(result).toEqual([5 * 2 + 1 * 4, 3 * 3, 2 * 1]);
    expect(result).toEqual([14, 9, 2]);
  });

  it('should throw error for vector length mismatch', () => {
    const matrix = new SparseMatrix2(3, 4);
    const vec = [1, 2, 3];

    expect(() => matrix.multiplyVector(vec)).toThrow('Vector length must match matrix column count');
  });

  it('should multiply empty vector', () => {
    const matrix = new SparseMatrix2(3, 4);
    const vec = [0, 0, 0, 0];
    const result = matrix.multiplyVector(vec);

    expect(result).toEqual([0, 0, 0]);
  });

  it('should transpose matrix', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 3, 1);
    matrix.set(1, 2, 3);
    matrix.set(2, 0, 2);

    const transposed = matrix.transpose();

    expect(transposed.rows()).toBe(4);
    expect(transposed.cols()).toBe(3);
    expect(transposed.get(1, 0)).toBe(5);
    expect(transposed.get(3, 0)).toBe(1);
    expect(transposed.get(2, 1)).toBe(3);
    expect(transposed.get(0, 2)).toBe(2);
  });

  it('should transpose empty matrix', () => {
    const matrix = new SparseMatrix2(3, 4);
    const transposed = matrix.transpose();

    expect(transposed.rows()).toBe(4);
    expect(transposed.cols()).toBe(3);
    expect(transposed.nonZeroCount()).toBe(0);
  });

  it('should not store zero values', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 0, 0);
    matrix.set(0, 1, 0);
    matrix.set(1, 2, 0);

    expect(matrix.nonZeroCount()).toBe(0);
    expect(matrix.toArray()).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  it('should maintain zero values after multiple sets', () => {
    const matrix = new SparseMatrix2(3, 4);
    matrix.set(0, 1, 5);
    matrix.set(0, 2, 0);
    matrix.set(1, 3, 7);
    matrix.set(1, 3, 0);

    expect(matrix.nonZeroCount()).toBe(1);
    expect(matrix.get(0, 1)).toBe(5);
    expect(matrix.get(0, 2)).toBe(0);
    expect(matrix.get(1, 3)).toBe(0);
  });

  it('should handle 1x1 matrix', () => {
    const matrix = new SparseMatrix2(1, 1);
    expect(matrix.nonZeroCount()).toBe(0);
    matrix.set(0, 0, 42);
    expect(matrix.get(0, 0)).toBe(42);
    expect(matrix.nonZeroCount()).toBe(1);
    matrix.set(0, 0, 0);
    expect(matrix.get(0, 0)).toBe(0);
    expect(matrix.nonZeroCount()).toBe(0);
  });

  it('should handle negative values', () => {
    const matrix = new SparseMatrix2(2, 2);
    matrix.set(0, 0, -5);
    matrix.set(1, 1, -10);
    expect(matrix.get(0, 0)).toBe(-5);
    expect(matrix.get(1, 1)).toBe(-10);
    expect(matrix.nonZeroCount()).toBe(2);
  });

  it('should handle transpose of symmetric matrix', () => {
    const matrix = new SparseMatrix2(2, 2);
    matrix.set(0, 1, 7);
    matrix.set(1, 0, 7);
    const t = matrix.transpose();
    expect(t.get(0, 1)).toBe(7);
    expect(t.get(1, 0)).toBe(7);
  });

  it('should compute density for empty matrix', () => {
    const matrix = new SparseMatrix2(5, 5);
    expect(matrix.density()).toBe(0);
  });

  it('should handle multiplyVector with all zeros', () => {
    const matrix = new SparseMatrix2(2, 3);
    matrix.set(0, 0, 5);
    matrix.set(1, 2, 3);
    const result = matrix.multiplyVector([0, 0, 0]);
    expect(result).toEqual([0, 0]);
  });

  it('should handle large sparse matrix', () => {
    const matrix = new SparseMatrix2(100, 100);
    matrix.set(0, 0, 1);
    matrix.set(50, 50, 2);
    matrix.set(99, 99, 3);
    expect(matrix.nonZeroCount()).toBe(3);
    expect(matrix.get(0, 0)).toBe(1);
    expect(matrix.get(50, 50)).toBe(2);
    expect(matrix.get(99, 99)).toBe(3);
    expect(matrix.density()).toBe(3 / 10000);
  });

  it('should overwrite value in same position', () => {
    const matrix = new SparseMatrix2(3, 3);
    matrix.set(1, 1, 5);
    matrix.set(1, 1, 10);
    expect(matrix.get(1, 1)).toBe(10);
    expect(matrix.nonZeroCount()).toBe(1);
  });

  it('should handle transpose round trip', () => {
    const matrix = new SparseMatrix2(2, 3);
    matrix.set(0, 1, 4);
    matrix.set(1, 2, 7);
    const roundTrip = matrix.transpose().transpose();
    expect(roundTrip.rows()).toBe(2);
    expect(roundTrip.cols()).toBe(3);
    expect(roundTrip.get(0, 1)).toBe(4);
    expect(roundTrip.get(1, 2)).toBe(7);
  });

  it('should set then remove then set again', () => {
    const matrix = new SparseMatrix2(3, 3);
    matrix.set(1, 1, 5);
    expect(matrix.nonZeroCount()).toBe(1);
    matrix.set(1, 1, 0);
    expect(matrix.nonZeroCount()).toBe(0);
    matrix.set(1, 1, 10);
    expect(matrix.get(1, 1)).toBe(10);
    expect(matrix.nonZeroCount()).toBe(1);
  });

  it('should handle forEach on empty matrix', () => {
    const matrix = new SparseMatrix2(3, 3);
    expect(matrix.nonZeroCount()).toBe(0);
    expect(matrix.rows()).toBe(3);
    expect(matrix.cols()).toBe(3);
  });

  it('should handle get on unset positions', () => {
    const matrix = new SparseMatrix2(3, 3);
    expect(matrix.get(0, 0)).toBe(0);
    expect(matrix.get(2, 2)).toBe(0);
  });

  it('should handle transpose of empty matrix', () => {
    const matrix = new SparseMatrix2(3, 5);
    const t = matrix.transpose();
    expect(t.rows()).toBe(5);
    expect(t.cols()).toBe(3);
    expect(t.nonZeroCount()).toBe(0);
  });

  it('should handle multiplyVector with identity-like matrix', () => {
    const matrix = new SparseMatrix2(2, 2);
    matrix.set(0, 0, 1);
    matrix.set(1, 1, 1);
    const result = matrix.multiplyVector([3, 7]);
    expect(result).toEqual([3, 7]);
  });

  it('should handle density on zero matrix', () => {
    const matrix = new SparseMatrix2(5, 5);
    expect(matrix.density()).toBe(0);
  });

  it('should handle rows and cols getters', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(matrix.rows()).toBe(3);
    expect(matrix.cols()).toBe(4);
  });

  it('should handle transpose', () => {
    const matrix = new SparseMatrix2(2, 3);
    matrix.set(0, 1, 5);
    matrix.set(1, 2, 10);
    const t = matrix.transpose();
    expect(t.rows()).toBe(3);
    expect(t.cols()).toBe(2);
    expect(t.get(1, 0)).toBe(5);
  });

  it('should handle multiplyVector', () => {
    const matrix = new SparseMatrix2(2, 3);
    matrix.set(0, 0, 1);
    matrix.set(0, 1, 2);
    matrix.set(0, 2, 3);
    matrix.set(1, 0, 4);
    matrix.set(1, 1, 5);
    matrix.set(1, 2, 6);
    const result = matrix.multiplyVector([1, 1, 1]);
    expect(result).toEqual([6, 15]);
  });

  it('should handle toArray', () => {
    const matrix = new SparseMatrix2(2, 2);
    matrix.set(0, 0, 1);
    matrix.set(0, 1, 2);
    matrix.set(1, 0, 3);
    matrix.set(1, 1, 4);
    const arr = matrix.toArray();
    expect(arr).toEqual([[1, 2], [3, 4]]);
  });

  it('should handle rows and cols', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(matrix.rows()).toBe(3);
    expect(matrix.cols()).toBe(4);
  });

  it('should handle get on unset position', () => {
    const matrix = new SparseMatrix2(3, 3);
    expect(matrix.get(0, 0)).toBe(0);
    matrix.set(1, 1, 42);
    expect(matrix.get(1, 1)).toBe(42);
    expect(matrix.get(2, 2)).toBe(0);
  });

  it('should handle rows and cols', () => {
    const matrix = new SparseMatrix2(3, 4);
    expect(matrix.rows()).toBe(3);
    expect(matrix.cols()).toBe(4);
  });

  it('should handle nonZeroCount', () => {
    const matrix = new SparseMatrix2(3, 3);
    matrix.set(0, 0, 1);
    matrix.set(1, 1, 2);
    expect(matrix.nonZeroCount()).toBe(2);
  });
});
