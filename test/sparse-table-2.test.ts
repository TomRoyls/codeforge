import { describe, it, expect } from "vitest";
import { SparseTable } from "../src/core/sparse-table-2/index";

describe("SparseTable", () => {
  describe("constructor", () => {
    it("should throw on empty array", () => {
      expect(() => new SparseTable([])).toThrow("Array cannot be empty");
    });

    it("should handle single element array", () => {
      const st = new SparseTable([5]);
      expect(st.getSize()).toBe(1);
      expect(st.query(0, 0)).toBe(5);
    });
  });

  describe("rangeMinQuery", () => {
    it("should return min for single element range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMinQuery(2, 2)).toBe(7);
    });

    it("should return min for two element range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMinQuery(0, 1)).toBe(3);
      expect(st.rangeMinQuery(3, 4)).toBe(2);
    });

    it("should return min for full range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMinQuery(0, 4)).toBe(2);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable([1, 4, 2, 5, 3]);
      expect(st.rangeMinQuery(0, 4)).toBe(1);
      expect(st.rangeMinQuery(1, 3)).toBe(2);
      expect(st.rangeMinQuery(2, 4)).toBe(2);
    });

    it("should throw on invalid range", () => {
      const st = new SparseTable([1, 2, 3]);
      expect(() => st.rangeMinQuery(-1, 0)).toThrow("Invalid range");
      expect(() => st.rangeMinQuery(0, 3)).toThrow("Invalid range");
      expect(() => st.rangeMinQuery(2, 1)).toThrow("Invalid range");
    });
  });

  describe("rangeMaxQuery", () => {
    it("should return max for single element range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMaxQuery(2, 2)).toBe(7);
    });

    it("should return max for two element range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMaxQuery(0, 1)).toBe(5);
      expect(st.rangeMaxQuery(3, 4)).toBe(9);
    });

    it("should return max for full range", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.rangeMaxQuery(0, 4)).toBe(9);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable([1, 4, 2, 5, 3]);
      expect(st.rangeMaxQuery(0, 4)).toBe(5);
      expect(st.rangeMaxQuery(1, 3)).toBe(5);
      expect(st.rangeMaxQuery(2, 4)).toBe(5);
    });

    it("should throw on invalid range", () => {
      const st = new SparseTable([1, 2, 3]);
      expect(() => st.rangeMaxQuery(-1, 0)).toThrow("Invalid range");
      expect(() => st.rangeMaxQuery(0, 3)).toThrow("Invalid range");
      expect(() => st.rangeMaxQuery(2, 1)).toThrow("Invalid range");
    });
  });

  describe("query (alias for rangeMinQuery)", () => {
    it("should behave like rangeMinQuery", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      expect(st.query(0, 2)).toBe(st.rangeMinQuery(0, 2));
      expect(st.query(1, 4)).toBe(st.rangeMinQuery(1, 4));
    });
  });

  describe("overlapping queries", () => {
    it("should handle overlapping ranges", () => {
      const st = new SparseTable([5, 3, 7, 2, 9, 1, 6]);
      const result1 = st.rangeMinQuery(1, 3);
      const result2 = st.rangeMinQuery(2, 4);
      const result3 = st.rangeMinQuery(1, 4);
      expect(result1).toBe(2);
      expect(result2).toBe(2);
      expect(result3).toBe(2);
    });
  });

  describe("large arrays", () => {
    it("should handle array of size 1000", () => {
      const array = new Array(1000);
      for (let i = 0; i < 1000; i++) {
        array[i] = i % 100;
      }
      const st = new SparseTable(array);
      expect(st.rangeMinQuery(0, 999)).toBe(0);
      expect(st.rangeMaxQuery(0, 999)).toBe(99);
      expect(st.rangeMinQuery(150, 250)).toBe(0);
      expect(st.rangeMaxQuery(450, 550)).toBe(99);
    });

    it("should handle array of size 10000", () => {
      const array = new Array(10000);
      for (let i = 0; i < 10000; i++) {
        array[i] = i % 1000;
      }
      const st = new SparseTable(array);
      expect(st.rangeMinQuery(0, 9999)).toBe(0);
      expect(st.rangeMaxQuery(0, 9999)).toBe(999);
      expect(st.rangeMinQuery(1500, 2500)).toBe(0);
      expect(st.rangeMaxQuery(4500, 5500)).toBe(999);
    });
  });

  describe("getSize", () => {
    it("should return correct size", () => {
      const st = new SparseTable([1, 2, 3, 4, 5]);
      expect(st.getSize()).toBe(5);
    });
  });

  describe("getTable", () => {
    it("should return the sparse table", () => {
      const st = new SparseTable([5, 3, 7, 2, 9]);
      const table = st.getTable();
      expect(table.length).toBeGreaterThan(0);
      expect(table[0]![0]).toBe(5);
      expect(table[0]![1]).toBe(3);
    });
  });

  describe("toArray", () => {
    it("should return the original array", () => {
      const original = [5, 3, 7, 2, 9];
      const st = new SparseTable(original);
      expect(st.toArray()).toEqual(original);
    });
  });

  describe("getTimeComplexity", () => {
    it("should return complexity string", () => {
      const st = new SparseTable([1, 2, 3]);
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(1)");
    });
  });

  describe("edge cases", () => {
    it("should handle array with all same values", () => {
      const st = new SparseTable([5, 5, 5, 5]);
      expect(st.rangeMinQuery(0, 3)).toBe(5);
      expect(st.rangeMaxQuery(0, 3)).toBe(5);
    });

    it("should handle sorted ascending array", () => {
      const st = new SparseTable([1, 2, 3, 4, 5]);
      expect(st.rangeMinQuery(0, 4)).toBe(1);
      expect(st.rangeMaxQuery(0, 4)).toBe(5);
    });

    it("should handle sorted descending array", () => {
      const st = new SparseTable([5, 4, 3, 2, 1]);
      expect(st.rangeMinQuery(0, 4)).toBe(1);
      expect(st.rangeMaxQuery(0, 4)).toBe(5);
    });

    it("should handle array with negative numbers", () => {
      const st = new SparseTable([-5, -3, -7, -2, -9]);
      expect(st.rangeMinQuery(0, 4)).toBe(-9);
      expect(st.rangeMaxQuery(0, 4)).toBe(-2);
    });

    it("should handle array with zeros", () => {
      const st = new SparseTable([5, 0, 7, 0, 9]);
      expect(st.rangeMinQuery(0, 4)).toBe(0);
      expect(st.rangeMaxQuery(0, 4)).toBe(9);
    });

    it("should handle power-of-two length array", () => {
      const st = new SparseTable([3, 1, 4, 1, 5, 9, 2, 6]);
      expect(st.rangeMinQuery(0, 7)).toBe(1);
      expect(st.rangeMaxQuery(0, 7)).toBe(9);
      expect(st.rangeMinQuery(2, 5)).toBe(1);
      expect(st.rangeMaxQuery(2, 5)).toBe(9);
    });

    it("should handle alternating high low values", () => {
      const st = new SparseTable([10, 1, 10, 1, 10]);
      expect(st.rangeMinQuery(0, 4)).toBe(1);
      expect(st.rangeMaxQuery(0, 4)).toBe(10);
      expect(st.rangeMinQuery(1, 3)).toBe(1);
      expect(st.rangeMaxQuery(1, 3)).toBe(10);
    });

    it("should handle single negative element", () => {
      const st = new SparseTable([-42]);
      expect(st.query(0, 0)).toBe(-42);
      expect(st.rangeMaxQuery(0, 0)).toBe(-42);
    });

    it("should handle sub-range queries correctly", () => {
      const st = new SparseTable([8, 2, 5, 1, 9, 3, 7, 4]);
      expect(st.rangeMinQuery(0, 3)).toBe(1);
      expect(st.rangeMinQuery(4, 7)).toBe(3);
      expect(st.rangeMaxQuery(0, 3)).toBe(8);
      expect(st.rangeMaxQuery(4, 7)).toBe(9);
    });

    it("should handle adjacent element queries", () => {
      const st = new SparseTable([5, 3, 8, 1]);
      expect(st.rangeMinQuery(0, 1)).toBe(3);
      expect(st.rangeMaxQuery(1, 2)).toBe(8);
    });

    it("should handle two-element array", () => {
      const st = new SparseTable([10, 20]);
      expect(st.rangeMinQuery(0, 1)).toBe(10);
      expect(st.rangeMaxQuery(0, 1)).toBe(20);
    });

    it("should report correct size", () => {
      const st = new SparseTable([5, 3, 8, 1]);
      expect(st.getSize()).toBe(4);
    });

    it("should handle toArray", () => {
      const st = new SparseTable([5, 3, 8, 1]);
      expect(st.toArray()).toEqual([5, 3, 8, 1]);
    });

    it("should handle getTimeComplexity", () => {
      const st = new SparseTable([5, 3, 8, 1]);
      expect(typeof st.getTimeComplexity()).toBe('string');
    });

    it("should handle getTable", () => {
      const st = new SparseTable([5, 3, 8, 1]);
      const table = st.getTable();
      expect(Array.isArray(table)).toBe(true);
      expect(table.length).toBeGreaterThan(0);
    });

    it("should handle single element", () => {
      const st = new SparseTable([42]);
      expect(st.rangeMinQuery(0, 0)).toBe(42);
      expect(st.rangeMaxQuery(0, 0)).toBe(42);
    });

    it("should handle two elements min and max", () => {
      const st = new SparseTable([10, 20]);
      expect(st.rangeMinQuery(0, 1)).toBe(10);
      expect(st.rangeMaxQuery(0, 1)).toBe(20);
    });

    it('should handle rangeMinQuery on longer array', () => {
      const st = new SparseTable([5, 3, 7, 1, 4]);
      expect(st.rangeMinQuery(0, 4)).toBe(1);
      expect(st.rangeMaxQuery(0, 4)).toBe(7);
    });

    it('should handle single element', () => {
      const st = new SparseTable([42]);
      expect(st.rangeMinQuery(0, 0)).toBe(42);
      expect(st.rangeMaxQuery(0, 0)).toBe(42);
    });

    it('should handle getSize', () => {
      const st = new SparseTable([1, 2, 3, 4, 5]);
      expect(st.getSize()).toBe(5);
    });

    it('should handle toArray', () => {
      const st = new SparseTable([3, 1, 4, 1, 5]);
      expect(st.toArray()).toEqual([3, 1, 4, 1, 5]);
    });
  });

  it('should handle rangeMinQuery on range', () => {
    const st = new SparseTable([5, 2, 8, 1, 9]);
    expect(st.rangeMinQuery(1, 3)).toBe(1);
    expect(st.rangeMaxQuery(1, 3)).toBe(8);
  });
});
