import { describe, it, expect } from "vitest";
import { SparseTable3 } from "../src/core/sparse-table-3/index.js";

describe("SparseTable3", () => {
  describe("constructor", () => {
    it("should throw on empty array", () => {
      expect(() => new SparseTable3([])).toThrow("Array cannot be empty");
    });

    it("should handle single element array", () => {
      const st = new SparseTable3([5]);
      expect(st.size()).toBe(1);
      expect(st.query(0, 0)).toBe(5);
    });
  });

  describe("min query type", () => {
    it("should return min for single element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'min');
      expect(st.query(2, 2)).toBe(7);
    });

    it("should return min for two element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'min');
      expect(st.query(0, 1)).toBe(3);
      expect(st.query(3, 4)).toBe(2);
    });

    it("should return min for full range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'min');
      expect(st.query(0, 4)).toBe(2);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable3([1, 4, 2, 5, 3], 'min');
      expect(st.query(0, 4)).toBe(1);
      expect(st.query(1, 3)).toBe(2);
      expect(st.query(2, 4)).toBe(2);
    });
  });

  describe("max query type", () => {
    it("should return max for single element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'max');
      expect(st.query(2, 2)).toBe(7);
    });

    it("should return max for two element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'max');
      expect(st.query(0, 1)).toBe(5);
      expect(st.query(3, 4)).toBe(9);
    });

    it("should return max for full range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'max');
      expect(st.query(0, 4)).toBe(9);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable3([1, 4, 2, 5, 3], 'max');
      expect(st.query(0, 4)).toBe(5);
      expect(st.query(1, 3)).toBe(5);
      expect(st.query(2, 4)).toBe(5);
    });
  });

  describe("sum query type", () => {
    it("should return sum for single element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'sum');
      expect(st.query(2, 2)).toBe(7);
    });

    it("should return sum for two element range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'sum');
      expect(st.query(0, 1)).toBe(8);
      expect(st.query(3, 4)).toBe(11);
    });

    it("should return sum for full range", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9], 'sum');
      expect(st.query(0, 4)).toBe(26);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable3([1, 4, 2, 5, 3], 'sum');
      expect(st.query(0, 4)).toBe(15);
      expect(st.query(1, 3)).toBe(11);
      expect(st.query(2, 4)).toBe(10);
    });
  });

  describe("gcd query type", () => {
    it("should return gcd for single element range", () => {
      const st = new SparseTable3([6, 9, 12, 8, 10], 'gcd');
      expect(st.query(2, 2)).toBe(12);
    });

    it("should return gcd for two element range", () => {
      const st = new SparseTable3([6, 9, 12, 8, 10], 'gcd');
      expect(st.query(0, 1)).toBe(3);
      expect(st.query(3, 4)).toBe(2);
    });

    it("should return gcd for full range", () => {
      const st = new SparseTable3([6, 9, 12, 8, 10], 'gcd');
      expect(st.query(0, 4)).toBe(1);
    });

    it("should handle known array with verified results", () => {
      const st = new SparseTable3([4, 8, 12, 16, 20], 'gcd');
      expect(st.query(0, 4)).toBe(4);
      expect(st.query(1, 3)).toBe(4);
      expect(st.query(2, 4)).toBe(4);
    });

    it("should handle array with gcd > 1", () => {
      const st = new SparseTable3([6, 12, 18, 24, 30], 'gcd');
      expect(st.query(0, 4)).toBe(6);
      expect(st.query(1, 3)).toBe(6);
    });
  });

  describe("query method", () => {
    it("should throw on invalid range", () => {
      const st = new SparseTable3([1, 2, 3]);
      expect(() => st.query(-1, 0)).toThrow("Invalid range");
      expect(() => st.query(0, 3)).toThrow("Invalid range");
      expect(() => st.query(2, 1)).toThrow("Invalid range");
    });

    it("should handle overlapping ranges", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9, 1, 6], 'min');
      const result1 = st.query(1, 3);
      const result2 = st.query(2, 4);
      const result3 = st.query(1, 4);
      expect(result1).toBe(2);
      expect(result2).toBe(2);
      expect(result3).toBe(2);
    });
  });

  describe("default query type", () => {
    it("should default to min query type", () => {
      const st = new SparseTable3([5, 3, 7, 2, 9]);
      expect(st.query(0, 4)).toBe(2);
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(1)");
    });
  });

  describe("large arrays", () => {
    it("should handle array of size 1000", () => {
      const array = new Array(1000);
      for (let i = 0; i < 1000; i++) {
        array[i] = i % 100;
      }
      const st = new SparseTable3(array, 'min');
      expect(st.query(0, 999)).toBe(0);
      expect(st.query(150, 250)).toBe(0);
    });

    it("should handle array of size 10000", () => {
      const array = new Array(10000);
      for (let i = 0; i < 10000; i++) {
        array[i] = i % 1000;
      }
      const st = new SparseTable3(array, 'max');
      expect(st.query(0, 9999)).toBe(999);
      expect(st.query(4500, 5500)).toBe(999);
    });
  });

  describe("size", () => {
    it("should return correct size", () => {
      const st = new SparseTable3([1, 2, 3, 4, 5]);
      expect(st.size()).toBe(5);
    });
  });

  describe("toArray", () => {
    it("should return original array", () => {
      const original = [5, 3, 7, 2, 9];
      const st = new SparseTable3(original);
      expect(st.toArray()).toEqual(original);
    });
  });

  describe("getTimeComplexity", () => {
    it("should return complexity string for min", () => {
      const st = new SparseTable3([1, 2, 3], 'min');
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(1)");
    });

    it("should return complexity string for max", () => {
      const st = new SparseTable3([1, 2, 3], 'max');
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(1)");
    });

    it("should return complexity string for sum", () => {
      const st = new SparseTable3([1, 2, 3], 'sum');
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(log n)");
    });

    it("should return complexity string for gcd", () => {
      const st = new SparseTable3([1, 2, 3], 'gcd');
      expect(st.getTimeComplexity()).toBe("Preprocess: O(n log n), Query: O(log n * log(max))");
    });
  });

  describe("edge cases", () => {
    it("should handle array with all same values", () => {
      const st = new SparseTable3([5, 5, 5, 5]);
      expect(st.query(0, 3)).toBe(5);
    });

    it("should handle sorted ascending array", () => {
      const st = new SparseTable3([1, 2, 3, 4, 5], 'min');
      expect(st.query(0, 4)).toBe(1);
    });

    it("should handle sorted descending array", () => {
      const st = new SparseTable3([5, 4, 3, 2, 1], 'max');
      expect(st.query(0, 4)).toBe(5);
    });

    it("should handle array with negative numbers for min", () => {
      const st = new SparseTable3([-5, -3, -7, -2, -9], 'min');
      expect(st.query(0, 4)).toBe(-9);
    });

    it("should handle array with negative numbers for max", () => {
      const st = new SparseTable3([-5, -3, -7, -2, -9], 'max');
      expect(st.query(0, 4)).toBe(-2);
    });

    it("should handle array with zeros", () => {
      const st = new SparseTable3([5, 0, 7, 0, 9], 'min');
      expect(st.query(0, 4)).toBe(0);
    });

    it("should handle array with mixed positive and negative for sum", () => {
      const st = new SparseTable3([-5, 10, -3, 8, -2], 'sum');
      expect(st.query(0, 4)).toBe(8);
      expect(st.query(1, 3)).toBe(15);
    });

    it("should handle gcd with zeros", () => {
      const st = new SparseTable3([0, 6, 0, 12, 0], 'gcd');
      expect(st.query(0, 4)).toBe(6);
    });

    it("should handle gcd with one and any number", () => {
      const st = new SparseTable3([1, 2, 3, 4, 5], 'gcd');
      expect(st.query(0, 4)).toBe(1);
    });
  });

  describe("consistency across query types", () => {
    it("should give consistent results for single element", () => {
      const st1 = new SparseTable3([7], 'min');
      const st2 = new SparseTable3([7], 'max');
      const st3 = new SparseTable3([7], 'sum');
      const st4 = new SparseTable3([7], 'gcd');
      expect(st1.query(0, 0)).toBe(7);
      expect(st2.query(0, 0)).toBe(7);
      expect(st3.query(0, 0)).toBe(7);
      expect(st4.query(0, 0)).toBe(7);
    });

    it('should handle size', () => {
      const st = new SparseTable3([1, 2, 3, 4, 5]);
      expect(st.size()).toBe(5);
    });
  });

  it('should handle toArray', () => {
    const st = new SparseTable3([3, 1, 4, 1, 5], 'min');
    expect(st.toArray()).toEqual([3, 1, 4, 1, 5]);
  });
  it('should handle size', () => {
    const st = new SparseTable3([3, 1, 4, 1, 5], 'min');
    expect(st.size()).toBe(5);
  });
  it('should handle sum query', () => {
    const st = new SparseTable3([1, 2, 3, 4, 5], 'sum');
    expect(st.query(0, 4)).toBe(15);
    expect(st.query(1, 3)).toBe(9);
  });
  it('should handle toArray after construction', () => {
    const st = new SparseTable3([3, 1, 4], 'min');
    expect(st.toArray()).toEqual([3, 1, 4]);
  });
  it('should handle size', () => {
    const st = new SparseTable3([3, 1, 4], 'min');
    expect(st.size()).toBe(3);
  });
  it('should handle query', () => {
    const st = new SparseTable3([3, 1, 4, 1, 5], 'min');
    expect(st.query(0, 4)).toBe(1);
    expect(st.query(0, 0)).toBe(3);
  });
});
