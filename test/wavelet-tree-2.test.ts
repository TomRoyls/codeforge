import { describe, it, expect } from "vitest";
import { WaveletTree } from "../src/core/wavelet-tree-2/index";

describe("WaveletTree", () => {
  describe("constructor", () => {
    it("should throw error for empty array", () => {
      expect(() => new WaveletTree([])).toThrow("Array cannot be empty");
    });

    it("should handle single element array", () => {
      const tree = new WaveletTree([5]);
      expect(tree.getSize()).toBe(1);
      expect(tree.access(0)).toBe(5);
    });

    it("should handle multiple same elements", () => {
      const tree = new WaveletTree([3, 3, 3, 3]);
      expect(tree.getSize()).toBe(4);
      expect(tree.access(0)).toBe(3);
      expect(tree.access(3)).toBe(3);
    });
  });

  describe("access", () => {
    it("should return correct element at index", () => {
      const tree = new WaveletTree([1, 5, 2, 9, 3, 7, 4, 8]);
      expect(tree.access(0)).toBe(1);
      expect(tree.access(3)).toBe(9);
      expect(tree.access(5)).toBe(7);
      expect(tree.access(7)).toBe(8);
    });

    it("should handle sorted array", () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8]);
      for (let i = 0; i < 8; i++) {
        expect(tree.access(i)).toBe(i + 1);
      }
    });

    it("should handle reverse sorted array", () => {
      const tree = new WaveletTree([8, 7, 6, 5, 4, 3, 2, 1]);
      for (let i = 0; i < 8; i++) {
        expect(tree.access(i)).toBe(8 - i);
      }
    });

    it("should handle large array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i * 2);
      const tree = new WaveletTree(arr);
      for (let i = 0; i < 1000; i++) {
        expect(tree.access(i)).toBe(i * 2);
      }
    });
  });

  describe("rank", () => {
    it("should count occurrences before position", () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(tree.rank(1, 0)).toBe(0);
      expect(tree.rank(1, 3)).toBe(1);
      expect(tree.rank(1, 11)).toBe(2);
      expect(tree.rank(3, 0)).toBe(0);
      expect(tree.rank(3, 2)).toBe(1);
      expect(tree.rank(3, 11)).toBe(2);
      expect(tree.rank(5, 0)).toBe(0);
      expect(tree.rank(5, 5)).toBe(1);
      expect(tree.rank(5, 11)).toBe(3);
    });

    it("should handle non-existent values", () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5]);
      expect(tree.rank(10, 5)).toBe(0);
      expect(tree.rank(0, 5)).toBe(0);
    });

    it("should handle all same values", () => {
      const tree = new WaveletTree([5, 5, 5, 5, 5]);
      expect(tree.rank(5, 0)).toBe(0);
      expect(tree.rank(5, 2)).toBe(2);
      expect(tree.rank(5, 5)).toBe(5);
      expect(tree.rank(3, 5)).toBe(0);
    });

    it("should handle position 0", () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5]);
      expect(tree.rank(3, 0)).toBe(0);
      expect(tree.rank(1, 0)).toBe(0);
    });

    it("should work with larger arrays", () => {
      const arr = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];
      const tree = new WaveletTree(arr);
      expect(tree.rank(1, 12)).toBe(4);
      expect(tree.rank(2, 12)).toBe(4);
      expect(tree.rank(3, 12)).toBe(4);
      expect(tree.rank(1, 6)).toBe(2);
      expect(tree.rank(2, 6)).toBe(2);
      expect(tree.rank(3, 6)).toBe(2);
    });
  });

  describe("rangeCount", () => {
    it("should count value in range", () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(tree.rangeCount(1, 0, 3)).toBe(1);
      expect(tree.rangeCount(5, 0, 5)).toBe(1);
      expect(tree.rangeCount(5, 4, 11)).toBe(3);
      expect(tree.rangeCount(3, 0, 11)).toBe(2);
    });

    it("should handle empty range", () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5]);
      expect(tree.rangeCount(3, 2, 2)).toBe(0);
    });

    it("should handle full array range", () => {
      const tree = new WaveletTree([1, 2, 3, 1, 2, 3]);
      expect(tree.rangeCount(1, 0, 6)).toBe(2);
      expect(tree.rangeCount(2, 0, 6)).toBe(2);
      expect(tree.rangeCount(3, 0, 6)).toBe(2);
    });

    it("should throw error when start > end", () => {
      const tree = new WaveletTree([1, 2, 3]);
      expect(() => tree.rangeCount(2, 3, 1)).toThrow("Start must be <= end");
    });

    it("should throw error when range out of bounds", () => {
      const tree = new WaveletTree([1, 2, 3]);
      expect(() => tree.rangeCount(2, -1, 2)).toThrow("Range out of bounds");
      expect(() => tree.rangeCount(2, 0, 4)).toThrow("Range out of bounds");
    });

    it("should handle complex array", () => {
      const arr = [10, 20, 30, 10, 20, 30, 10, 20, 30];
      const tree = new WaveletTree(arr);
      expect(tree.rangeCount(10, 0, 9)).toBe(3);
      expect(tree.rangeCount(20, 1, 8)).toBe(3);
      expect(tree.rangeCount(30, 2, 7)).toBe(2);
    });
  });

  describe("kthSmallest", () => {
    it("should find kth smallest in range", () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(tree.kthSmallest(1, 0, 11)).toBe(1);
      expect(tree.kthSmallest(2, 0, 11)).toBe(1);
      expect(tree.kthSmallest(3, 0, 11)).toBe(2);
      expect(tree.kthSmallest(4, 0, 11)).toBe(3);
      expect(tree.kthSmallest(5, 0, 11)).toBe(3);
      expect(tree.kthSmallest(6, 0, 11)).toBe(4);
      expect(tree.kthSmallest(11, 0, 11)).toBe(9);
    });

    it("should work on subranges", () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
      expect(tree.kthSmallest(1, 2, 5)).toBe(1);
      expect(tree.kthSmallest(1, 5, 8)).toBe(2);
      expect(tree.kthSmallest(2, 5, 8)).toBe(6);
    });

    it("should handle sorted array", () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      for (let k = 1; k <= 10; k++) {
        expect(tree.kthSmallest(k, 0, 10)).toBe(k);
      }
    });

    it("should handle reverse sorted array", () => {
      const tree = new WaveletTree([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
      expect(tree.kthSmallest(1, 0, 10)).toBe(1);
      expect(tree.kthSmallest(5, 0, 10)).toBe(5);
      expect(tree.kthSmallest(10, 0, 10)).toBe(10);
    });

    it("should throw error when k out of range", () => {
      const tree = new WaveletTree([1, 2, 3]);
      expect(() => tree.kthSmallest(0, 0, 3)).toThrow("k out of range");
      expect(() => tree.kthSmallest(4, 0, 3)).toThrow("k out of range");
    });

    it("should throw error when range out of bounds", () => {
      const tree = new WaveletTree([1, 2, 3]);
      expect(() => tree.kthSmallest(2, -1, 2)).toThrow("Range out of bounds");
      expect(() => tree.kthSmallest(2, 0, 4)).toThrow("Range out of bounds");
    });

    it("should handle duplicates", () => {
      const tree = new WaveletTree([1, 1, 2, 2, 3, 3]);
      expect(tree.kthSmallest(1, 0, 6)).toBe(1);
      expect(tree.kthSmallest(2, 0, 6)).toBe(1);
      expect(tree.kthSmallest(3, 0, 6)).toBe(2);
      expect(tree.kthSmallest(4, 0, 6)).toBe(2);
      expect(tree.kthSmallest(5, 0, 6)).toBe(3);
      expect(tree.kthSmallest(6, 0, 6)).toBe(3);
    });

    it("should handle large arrays", () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const tree = new WaveletTree(arr);
      expect(tree.kthSmallest(1, 0, 100)).toBe(0);
      expect(tree.kthSmallest(50, 0, 100)).toBe(49);
      expect(tree.kthSmallest(100, 0, 100)).toBe(99);
    });
  });

  describe("getSize", () => {
    it("should return correct size", () => {
      expect(new WaveletTree([1]).getSize()).toBe(1);
      expect(new WaveletTree([1, 2, 3]).getSize()).toBe(3);
      expect(new WaveletTree([1, 2, 3, 4, 5]).getSize()).toBe(5);
    });
  });

  describe("toArray", () => {
    it("should reconstruct original array", () => {
      const arr1 = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const tree1 = new WaveletTree(arr1);
      expect(tree1.toArray()).toEqual(arr1);

      const arr2 = [1, 2, 3, 4, 5];
      const tree2 = new WaveletTree(arr2);
      expect(tree2.toArray()).toEqual(arr2);

      const arr3 = [5, 4, 3, 2, 1];
      const tree3 = new WaveletTree(arr3);
      expect(tree3.toArray()).toEqual(arr3);
    });

    it("should handle large arrays", () => {
      const arr = Array.from({ length: 500 }, (_, i) => i % 10);
      const tree = new WaveletTree(arr);
      expect(tree.toArray()).toEqual(arr);
    });
  });

  describe("getTimeComplexity", () => {
    it("should return time complexity string", () => {
      const tree = new WaveletTree([1, 2, 3]);
      expect(tree.getTimeComplexity()).toBe("O(σ log n) build, O(log σ) rank/access/kthSmallest");
    });
  });

  describe("integration tests with known results", () => {
    it("should correctly handle array [4, 2, 4, 5, 4, 6, 7, 8]", () => {
      const tree = new WaveletTree([4, 2, 4, 5, 4, 6, 7, 8]);
      
      expect(tree.access(0)).toBe(4);
      expect(tree.access(3)).toBe(5);
      expect(tree.access(7)).toBe(8);
      
      expect(tree.rank(4, 0)).toBe(0);
      expect(tree.rank(4, 3)).toBe(2);
      expect(tree.rank(4, 8)).toBe(3);
      
      expect(tree.rangeCount(4, 0, 8)).toBe(3);
      expect(tree.rangeCount(6, 0, 8)).toBe(1);
      
      expect(tree.kthSmallest(1, 0, 8)).toBe(2);
      expect(tree.kthSmallest(3, 0, 8)).toBe(4);
      expect(tree.kthSmallest(8, 0, 8)).toBe(8);
    });

    it("should correctly handle array [1, 1, 1, 1]", () => {
      const tree = new WaveletTree([1, 1, 1, 1]);
      
      expect(tree.access(0)).toBe(1);
      expect(tree.access(3)).toBe(1);
      
      expect(tree.rank(1, 0)).toBe(0);
      expect(tree.rank(1, 2)).toBe(2);
      expect(tree.rank(1, 4)).toBe(4);
      
      expect(tree.rangeCount(1, 0, 4)).toBe(4);
      expect(tree.rangeCount(1, 1, 3)).toBe(2);
      
      expect(tree.kthSmallest(1, 0, 4)).toBe(1);
      expect(tree.kthSmallest(4, 0, 4)).toBe(1);
    });

    it("should correctly handle array [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]", () => {
      const tree = new WaveletTree([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
      
      expect(tree.toArray()).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
      
      for (let i = 0; i < 10; i++) {
        expect(tree.access(i)).toBe(10 - i);
      }
      
      for (let k = 1; k <= 10; k++) {
        expect(tree.kthSmallest(k, 0, 10)).toBe(k);
      }
    });
  });

  describe("large array tests", () => {
    it("should handle array of 1000 elements", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      const tree = new WaveletTree(arr);
      
      expect(tree.getSize()).toBe(1000);
      expect(tree.toArray()).toEqual(arr);
      
      expect(tree.kthSmallest(1, 0, 1000)).toBe(0);
      expect(tree.kthSmallest(500, 0, 1000)).toBe(499);
      expect(tree.kthSmallest(1000, 0, 1000)).toBe(999);
      
      expect(tree.rangeCount(0, 0, 1000)).toBe(1);
      expect(tree.rangeCount(500, 0, 1000)).toBe(1);
      expect(tree.rangeCount(999, 0, 1000)).toBe(1);
    });

    it("should handle array with many duplicates", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => Math.floor(i / 100));
      const tree = new WaveletTree(arr);
      
      expect(tree.getSize()).toBe(1000);
      
      for (let v = 0; v < 10; v++) {
        expect(tree.rangeCount(v, 0, 1000)).toBe(100);
      }
    });
  });

  it('should handle toArray', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.toArray()).toEqual([3, 1, 4, 1, 5]);
  });

  it('should handle getSize', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.getSize()).toBe(5);
  });

  it('should handle access', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.access(0)).toBe(3);
    expect(tree.access(2)).toBe(4);
  });

  it('should handle rank', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.rank(1, 4)).toBe(2);
  });

  it('should handle getSize', () => {
    const arr = [3, 1, 4, 1, 5, 9];
    const tree = new WaveletTree(arr);
    expect(tree.getSize()).toBe(6);
  });

  it('should handle access multiple', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.access(0)).toBe(3);
    expect(tree.access(3)).toBe(1);
    expect(tree.access(4)).toBe(5);
  });

  it('should handle rank for absent element', () => {
    const arr = [3, 1, 4, 1, 5];
    const tree = new WaveletTree(arr);
    expect(tree.rank(99, 5)).toBe(0);
  });
});
