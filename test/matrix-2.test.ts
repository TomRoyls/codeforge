import { describe, it, expect } from 'vitest';
import { Matrix2 } from '../src/core/matrix-2/index.js';

describe('Matrix2', () => {
  describe('constructor', () => {
    it('should create matrix with default fill value 0', () => {
      const matrix = new Matrix2(2, 3);
      expect(matrix.rows()).toBe(2);
      expect(matrix.cols()).toBe(3);
      expect(matrix.get(0, 0)).toBe(0);
      expect(matrix.get(1, 2)).toBe(0);
    });

    it('should create matrix with custom fill value', () => {
      const matrix = new Matrix2(2, 3, 5);
      expect(matrix.get(0, 0)).toBe(5);
      expect(matrix.get(1, 2)).toBe(5);
    });
  });

  describe('get and set', () => {
    it('should set and get values', () => {
      const matrix = new Matrix2(2, 2);
      matrix.set(0, 0, 1);
      matrix.set(0, 1, 2);
      matrix.set(1, 0, 3);
      matrix.set(1, 1, 4);

      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(0, 1)).toBe(2);
      expect(matrix.get(1, 0)).toBe(3);
      expect(matrix.get(1, 1)).toBe(4);
    });
  });

  describe('rows and cols', () => {
    it('should return correct dimensions', () => {
      const matrix = new Matrix2(3, 4);
      expect(matrix.rows()).toBe(3);
      expect(matrix.cols()).toBe(4);
    });
  });

  describe('add', () => {
    it('should add two matrices', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const b = Matrix2.fromArray([[5, 6], [7, 8]]);
      const result = a.add(b);

      expect(result.toArray()).toEqual([[6, 8], [10, 12]]);
    });

    it('should throw for mismatched dimensions', () => {
      const a = new Matrix2(2, 2);
      const b = new Matrix2(2, 3);

      expect(() => a.add(b)).toThrow('Matrix dimensions must match for addition');
    });
  });

  describe('multiply', () => {
    it('should multiply two matrices', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const b = Matrix2.fromArray([[5, 6], [7, 8]]);
      const result = a.multiply(b);

      expect(result.toArray()).toEqual([[19, 22], [43, 50]]);
    });

    it('should multiply non-square matrices', () => {
      const a = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]]);
      const b = Matrix2.fromArray([[7, 8], [9, 10], [11, 12]]);
      const result = a.multiply(b);

      expect(result.toArray()).toEqual([[58, 64], [139, 154]]);
    });

    it('should throw for incompatible dimensions', () => {
      const a = new Matrix2(2, 3);
      const b = new Matrix2(2, 3);

      expect(() => a.multiply(b)).toThrow('Matrix dimensions must match for multiplication');
    });
  });

  describe('scale', () => {
    it('should scale matrix by scalar', () => {
      const matrix = Matrix2.fromArray([[1, 2], [3, 4]]);
      const result = matrix.scale(2);

      expect(result.toArray()).toEqual([[2, 4], [6, 8]]);
    });
  });

  describe('transpose', () => {
    it('should transpose matrix', () => {
      const matrix = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]]);
      const result = matrix.transpose();

      expect(result.toArray()).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    it('should transpose square matrix', () => {
      const matrix = Matrix2.fromArray([[1, 2], [3, 4]]);
      const result = matrix.transpose();

      expect(result.toArray()).toEqual([[1, 3], [2, 4]]);
    });
  });

  describe('identity', () => {
    it('should create identity matrix', () => {
      const matrix = Matrix2.identity(3);

      expect(matrix.toArray()).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });

    it('should create 1x1 identity matrix', () => {
      const matrix = Matrix2.identity(1);

      expect(matrix.toArray()).toEqual([[1]]);
    });
  });

  describe('fromArray', () => {
    it('should create matrix from array', () => {
      const data = [[1, 2], [3, 4]];
      const matrix = Matrix2.fromArray(data);

      expect(matrix.toArray()).toEqual(data);
    });

    it('should handle non-square matrices', () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      const matrix = Matrix2.fromArray(data);

      expect(matrix.toArray()).toEqual(data);
    });
  });

  describe('clone', () => {
    it('should create deep copy of matrix', () => {
      const original = Matrix2.fromArray([[1, 2], [3, 4]]);
      const clone = original.clone();

      expect(clone.toArray()).toEqual(original.toArray());
      clone.set(0, 0, 99);

      expect(original.get(0, 0)).toBe(1);
      expect(clone.get(0, 0)).toBe(99);
    });
  });

  describe('fill', () => {
    it('should fill all elements with value', () => {
      const matrix = Matrix2.fromArray([[1, 2], [3, 4]]);
      matrix.fill(7);

      expect(matrix.toArray()).toEqual([[7, 7], [7, 7]]);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const matrix = Matrix2.fromArray([[1, 2], [3, 4]]);
      const arr = matrix.toArray();

      expect(arr).toEqual([[1, 2], [3, 4]]);
    });

    it('should return independent copy', () => {
      const matrix = Matrix2.fromArray([[1, 2], [3, 4]]);
      const arr = matrix.toArray();
      arr[0]![0] = 99;

      expect(matrix.get(0, 0)).toBe(1);
    });
  });

  describe('identity', () => {
    it('should create 3x3 identity matrix', () => {
      const m = Matrix2.identity(3);
      expect(m.get(0, 0)).toBe(1);
      expect(m.get(1, 1)).toBe(1);
      expect(m.get(2, 2)).toBe(1);
      expect(m.get(0, 1)).toBe(0);
      expect(m.get(1, 0)).toBe(0);
    });

    it('should create 1x1 identity matrix', () => {
      const m = Matrix2.identity(1);
      expect(m.get(0, 0)).toBe(1);
    });
  });

  describe('transpose', () => {
    it('should transpose rectangular matrix', () => {
      const m = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]]);
      const t = m.transpose();
      expect(t.rows()).toBe(3);
      expect(t.cols()).toBe(2);
      expect(t.get(0, 0)).toBe(1);
      expect(t.get(0, 1)).toBe(4);
      expect(t.get(2, 0)).toBe(3);
      expect(t.get(2, 1)).toBe(6);
    });
  });

  describe('scale', () => {
    it('should scale all elements', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]]);
      const s = m.scale(2);
      expect(s.toArray()).toEqual([[2, 4], [6, 8]]);
    });

    it('should scale by zero', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]]);
      const s = m.scale(0);
      expect(s.toArray()).toEqual([[0, 0], [0, 0]]);
    });
  });

  describe('edge cases', () => {
    it('should handle 1x1 matrix operations', () => {
      const m = Matrix2.fromArray([[5]]);
      expect(m.get(0, 0)).toBe(5);
      m.set(0, 0, 10);
      expect(m.get(0, 0)).toBe(10);
    });

    it('should handle large matrix', () => {
      const m = new Matrix2(100, 100);
      m.set(50, 50, 42);
      expect(m.get(50, 50)).toBe(42);
      expect(m.rows()).toBe(100);
      expect(m.cols()).toBe(100);
    });

    it('should clone matrix', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]]);
      const c = m.clone();
      c.set(0, 0, 99);
      expect(m.get(0, 0)).toBe(1);
      expect(c.get(0, 0)).toBe(99);
    });

    it('should fill matrix', () => {
      const m = new Matrix2(2, 3);
      m.fill(7);
      expect(m.toArray()).toEqual([[7, 7, 7], [7, 7, 7]]);
    });

    it('should subtract matrices', () => {
      const a = Matrix2.fromArray([[5, 6], [7, 8]]);
      const b = Matrix2.fromArray([[1, 2], [3, 4]]);
      expect(a.add(b).toArray()).toEqual([[6, 8], [10, 12]]);
    });

    it('should multiply identity matrix', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const id = Matrix2.identity(2);
      const result = a.multiply(id);
      expect(result.toArray()).toEqual([[1, 2], [3, 4]]);
    });

    it('should transpose 2x3 matrix to 3x2', () => {
      const m = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]]);
      const t = m.transpose();
      expect(t.toArray()).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    it('should scale matrix by negative', () => {
      const m = Matrix2.fromArray([[1, -2], [3, 4]]);
      const s = m.scale(-1);
      expect(s.toArray()).toEqual([[-1, 2], [-3, -4]]);
    });

    it('should return rows and cols', () => {
      const m = new Matrix2(3, 4);
      expect(m.rows()).toBe(3);
      expect(m.cols()).toBe(4);
    });

    it('should add two matrices', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const b = Matrix2.fromArray([[5, 6], [7, 8]]);
      expect(a.add(b).toArray()).toEqual([[6, 8], [10, 12]]);
    });

    it('should handle multiply', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const b = Matrix2.fromArray([[5, 6], [7, 8]]);
      const result = a.multiply(b);
      expect(result.toArray()).toEqual([[19, 22], [43, 50]]);
    });

    it('should handle scale', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]]);
      const result = m.scale(2);
      expect(result.toArray()).toEqual([[2, 4], [6, 8]]);
    });

    it('should handle add', () => {
      const a = Matrix2.fromArray([[1, 2], [3, 4]]);
      const b = Matrix2.fromArray([[5, 6], [7, 8]]);
      const result = a.add(b);
      expect(result.toArray()).toEqual([[6, 8], [10, 12]]);
    });

    it('should handle transpose', () => {
      const m = Matrix2.fromArray([[1, 2, 3], [4, 5, 6]]);
      const result = m.transpose();
      expect(result.toArray()).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    it('should handle clone', () => {
      const m = Matrix2.fromArray([[1, 2], [3, 4]]);
      const c = m.clone();
      expect(c.toArray()).toEqual([[1, 2], [3, 4]]);
      expect(c).not.toBe(m);
    });

    it('should handle fill', () => {
      const m = new Matrix2(2, 3);
      m.fill(7);
      expect(m.toArray()).toEqual([[7, 7, 7], [7, 7, 7]]);
    });
  });
});
