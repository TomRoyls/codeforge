import { describe, it, expect } from "vitest";
import { IntervalTree } from "../../src/core/interval-tree-2/index.js";

describe("IntervalTree", () => {
  describe("constructor and basic properties", () => {
    it("creates an empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("isEmpty returns false after insert", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.isEmpty).toBe(false);
    });

    it("size increments with each insert", () => {
      const tree = new IntervalTree();
      expect(tree.size).toBe(0);
      tree.insert(0, 10);
      expect(tree.size).toBe(1);
      tree.insert(5, 15);
      expect(tree.size).toBe(2);
      tree.insert(20, 30);
      expect(tree.size).toBe(3);
    });
  });

  describe("insert", () => {
    it("inserts a single interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.query(7)).toHaveLength(1);
    });

    it("inserts intervals with same low bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 15);
      tree.insert(5, 20);
      expect(tree.size).toBe(3);
    });

    it("inserts intervals with negative values", () => {
      const tree = new IntervalTree();
      tree.insert(-10, -5);
      tree.insert(-3, 3);
      tree.insert(5, 10);
      expect(tree.size).toBe(3);
      expect(tree.query(-7)).toHaveLength(1);
      expect(tree.query(0)).toHaveLength(1);
    });

    it("inserts zero-width interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 5);
      expect(tree.size).toBe(1);
      expect(tree.query(5)).toHaveLength(1);
      expect(tree.query(4)).toHaveLength(0);
    });

    it("inserts large number of intervals", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i + 10);
      }
      expect(tree.size).toBe(1000);
    });

    it("throws when lo > hi", () => {
      const tree = new IntervalTree();
      expect(() => tree.insert(10, 5)).toThrow(RangeError);
    });

    it("inserts with value", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "hello");
      const results = tree.query(5);
      expect(results[0]!.value).toBe("hello");
    });

    it("inserts with undefined value (default)", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      const results = tree.query(5);
      expect(results[0]!.value).toBeUndefined();
    });

    it("inserts duplicate intervals", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.size).toBe(2);
      expect(tree.query(7)).toHaveLength(2);
    });

    it("inserts floating point intervals", () => {
      const tree = new IntervalTree();
      tree.insert(1.5, 3.7);
      expect(tree.query(2.5)).toHaveLength(1);
    });
  });

  describe("query (point stabbing)", () => {
    it("returns empty for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.query(5)).toEqual([]);
    });

    it("finds interval containing point", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(10)).toHaveLength(1);
    });

    it("finds interval at low bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(5)).toHaveLength(1);
    });

    it("finds interval at high bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(15)).toHaveLength(1);
    });

    it("does not find point below interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(4)).toHaveLength(0);
    });

    it("does not find point above interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(16)).toHaveLength(0);
    });

    it("finds multiple overlapping intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.insert(8, 20);
      expect(tree.query(9)).toHaveLength(3);
    });

    it("finds partial overlaps at point", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(5, 10);
      expect(tree.query(5)).toHaveLength(2);
    });

    it("finds no matches when point is between disjoint intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      expect(tree.query(7)).toHaveLength(0);
    });

    it("handles negative point queries", () => {
      const tree = new IntervalTree();
      tree.insert(-20, -10);
      expect(tree.query(-15)).toHaveLength(1);
      expect(tree.query(-5)).toHaveLength(0);
    });

    it("handles query at origin", () => {
      const tree = new IntervalTree();
      tree.insert(-5, 5);
      expect(tree.query(0)).toHaveLength(1);
    });

    it.skip("returns correct results for large dataset", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 500; i++) {
        tree.insert(i * 2, i * 2 + 1);
      }
      expect(tree.query(100)).toHaveLength(1);
      expect(tree.query(1001)).toHaveLength(0);
    });
  });

  describe("queryRange", () => {
    it("returns empty for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.queryRange(0, 10)).toEqual([]);
    });

    it("finds fully contained interval", () => {
      const tree = new IntervalTree();
      tree.insert(2, 8);
      expect(tree.queryRange(0, 10)).toHaveLength(1);
    });

    it("finds interval that overlaps at start", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(3, 10)).toHaveLength(1);
    });

    it("finds interval that overlaps at end", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.queryRange(0, 8)).toHaveLength(1);
    });

    it("does not find non-overlapping interval", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(6, 10)).toHaveLength(0);
    });

    it("finds interval touching at boundary", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(5, 10)).toHaveLength(1);
    });

    it("finds multiple overlapping intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(3, 8);
      tree.insert(7, 12);
      tree.insert(15, 20);
      expect(tree.queryRange(4, 9)).toHaveLength(3);
    });

    it("handles range containing all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(1, 3);
      tree.insert(5, 7);
      tree.insert(9, 11);
      expect(tree.queryRange(0, 20)).toHaveLength(3);
    });

    it("handles zero-width range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.queryRange(5, 5)).toHaveLength(1);
    });

    it("handles negative ranges", () => {
      const tree = new IntervalTree();
      tree.insert(-15, -5);
      expect(tree.queryRange(-12, -8)).toHaveLength(1);
    });

    it("finds interval that fully encloses query range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 100);
      expect(tree.queryRange(40, 60)).toHaveLength(1);
    });
  });

  describe("overlaps", () => {
    it("returns false for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.overlaps(0, 10)).toBe(false);
    });

    it("returns true when overlap exists", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.overlaps(10, 20)).toBe(true);
    });

    it("returns true when interval fully contains range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 100);
      expect(tree.overlaps(20, 30)).toBe(true);
    });

    it("returns true when range fully contains interval", () => {
      const tree = new IntervalTree();
      tree.insert(40, 60);
      expect(tree.overlaps(0, 100)).toBe(true);
    });

    it("returns true at boundary touch", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.overlaps(10, 20)).toBe(true);
    });

    it("returns false when no overlap", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.overlaps(6, 10)).toBe(false);
    });

    it("returns false for gap between intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(15, 20);
      expect(tree.overlaps(7, 12)).toBe(false);
    });
  });

  describe("remove", () => {
    it("returns false for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.remove(0, 10)).toBe(false);
    });

    it("removes existing interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("returns false for non-existing interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.remove(5, 20)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it("removes from tree with multiple intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.remove(10, 15)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.query(12)).toHaveLength(0);
    });

    it("removes duplicate intervals one at a time", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(0);
    });

    it("maintains tree integrity after removal", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      tree.remove(5, 15);
      expect(tree.query(7)).toHaveLength(1);
      expect(tree.query(12)).toHaveLength(1);
      expect(tree.size).toBe(2);
    });

    it("handles removing root node", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      tree.insert(25, 30);
      expect(tree.remove(10, 20)).toBe(true);
      expect(tree.query(15)).toHaveLength(0);
      expect(tree.size).toBe(2);
    });

    it("handles removing leaf node", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      expect(tree.remove(0, 5)).toBe(true);
      expect(tree.size).toBe(1);
    });

    it("can remove all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.remove(0, 5);
      tree.remove(10, 15);
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });
  });

  describe("clear", () => {
    it("clears empty tree", () => {
      const tree = new IntervalTree();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("clears tree with intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.query(5)).toEqual([]);
    });

    it("allows insertion after clear", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.clear();
      tree.insert(20, 30);
      expect(tree.size).toBe(1);
      expect(tree.query(25)).toHaveLength(1);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.toArray()).toEqual([]);
    });

    it("returns intervals in order", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      tree.insert(5, 10);
      const arr = tree.toArray();
      expect(arr[0]!.lo).toBe(0);
      expect(arr[1]!.lo).toBe(5);
      expect(arr[2]!.lo).toBe(10);
    });

    it("returns all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.toArray()).toHaveLength(3);
    });

    it("preserves values", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 5, "a");
      tree.insert(10, 15, "b");
      const arr = tree.toArray();
      expect(arr[0]!.value).toBe("a");
      expect(arr[1]!.value).toBe("b");
    });

    it("returns duplicate intervals separately", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.toArray()).toHaveLength(2);
    });
  });

  describe("forEach", () => {
    it("does not call callback for empty tree", () => {
      const tree = new IntervalTree();
      let count = 0;
      tree.forEach(() => { count++; });
      expect(count).toBe(0);
    });

    it("iterates all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      let count = 0;
      tree.forEach(() => { count++; });
      expect(count).toBe(3);
    });

    it("provides correct index", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const indices: number[] = [];
      tree.forEach((_interval, index) => { indices.push(index); });
      expect(indices).toEqual([0, 1, 2]);
    });

    it("provides interval objects", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "test");
      tree.forEach((interval) => {
        expect(interval.lo).toBe(0);
        expect(interval.hi).toBe(10);
        expect(interval.value).toBe("test");
      });
    });

    it("iterates in sorted order", () => {
      const tree = new IntervalTree();
      tree.insert(20, 25);
      tree.insert(0, 5);
      tree.insert(10, 15);
      const lows: number[] = [];
      tree.forEach((interval) => { lows.push(interval.lo); });
      expect(lows).toEqual([0, 10, 20]);
    });
  });

  describe("generic values", () => {
    it("stores number values", () => {
      const tree = new IntervalTree<number>();
      tree.insert(0, 10, 42);
      const results = tree.query(5);
      expect(results[0]!.value).toBe(42);
    });

    it("stores object values", () => {
      const tree = new IntervalTree<{ name: string }>();
      tree.insert(0, 10, { name: "test" });
      const results = tree.query(5);
      expect(results[0]!.value.name).toBe("test");
    });

    it("stores array values", () => {
      const tree = new IntervalTree<number[]>();
      tree.insert(0, 10, [1, 2, 3]);
      const results = tree.query(5);
      expect(results[0]!.value).toEqual([1, 2, 3]);
    });

    it("stores null values", () => {
      const tree = new IntervalTree<null>();
      tree.insert(0, 10, null);
      const results = tree.query(5);
      expect(results[0]!.value).toBeNull();
    });

    it("stores boolean values", () => {
      const tree = new IntervalTree<boolean>();
      tree.insert(0, 10, true);
      tree.insert(15, 25, false);
      expect(tree.query(5)[0]!.value).toBe(true);
      expect(tree.query(20)[0]!.value).toBe(false);
    });
  });

  describe("AVL tree balancing", () => {
    it("handles sequential right inserts", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i + 5);
      }
      expect(tree.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(tree.query(i).length).toBeGreaterThanOrEqual(1);
      }
    });

    it("handles sequential left inserts", () => {
      const tree = new IntervalTree();
      for (let i = 50; i >= 0; i--) {
        tree.insert(i, i + 5);
      }
      expect(tree.size).toBe(51);
    });

    it("handles alternating inserts", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 20; i++) {
        tree.insert(i * 2, i * 2 + 1);
        tree.insert(-i * 2 - 1, -i * 2);
      }
      expect(tree.size).toBe(40);
    });

    it("handles removal triggering rebalance", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i + 5);
      }
      for (let i = 0; i < 20; i++) {
        tree.remove(i, i + 5);
      }
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles very large values", () => {
      const tree = new IntervalTree();
      tree.insert(Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER);
      expect(tree.query(Number.MAX_SAFE_INTEGER - 5)).toHaveLength(1);
    });

    it("handles very small negative values", () => {
      const tree = new IntervalTree();
      tree.insert(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER + 10);
      expect(tree.query(-Number.MAX_SAFE_INTEGER + 5)).toHaveLength(1);
    });

    it("handles single point intervals", () => {
      const tree = new IntervalTree();
      tree.insert(5, 5);
      tree.insert(10, 10);
      expect(tree.query(5)).toHaveLength(1);
      expect(tree.query(10)).toHaveLength(1);
      expect(tree.query(7)).toHaveLength(0);
    });

    it("handles interval covering entire number line", () => {
      const tree = new IntervalTree();
      tree.insert(-1e9, 1e9);
      expect(tree.query(0)).toHaveLength(1);
      expect(tree.query(-1e9)).toHaveLength(1);
      expect(tree.query(1e9)).toHaveLength(1);
    });

    it("handles many overlapping intervals at same point", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(0, 100);
      }
      expect(tree.query(50)).toHaveLength(100);
    });

    it("query on point just outside all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(20, 30);
      expect(tree.query(15)).toHaveLength(0);
      expect(tree.query(-1)).toHaveLength(0);
      expect(tree.query(31)).toHaveLength(0);
    });

    it("remove non-existent does not affect existing", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.remove(0, 5);
      tree.remove(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.query(5)).toHaveLength(1);
    });

    it("insert after removal works correctly", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.remove(0, 10);
      tree.insert(5, 15);
      expect(tree.size).toBe(1);
      expect(tree.query(10)).toHaveLength(1);
    });

    it("handles interleaved insert and remove", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.remove(0, 5);
      tree.insert(20, 25);
      tree.remove(10, 15);
      expect(tree.size).toBe(1);
      expect(tree.query(22)).toHaveLength(1);
    });

    it("queryRange with full range returns all", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(30, 40);
      tree.insert(50, 60);
      expect(tree.queryRange(0, 100)).toHaveLength(3);
    });

    it("queryRange with disjoint range returns none", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(20, 25);
      expect(tree.queryRange(8, 15)).toHaveLength(0);
    });

    it("toArray after multiple operations", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      tree.insert(30, 40);
      tree.remove(10, 20);
      const arr = tree.toArray();
      expect(arr).toHaveLength(2);
      expect(arr[0]!.lo).toBe(0);
      expect(arr[1]!.lo).toBe(30);
    });

    it("forEach after clear and reinsert", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "old");
      tree.clear();
      tree.insert(5, 15, "new");
      let result = "";
      tree.forEach((interval) => { result = interval.value; });
      expect(result).toBe("new");
    });

    it("overlaps returns correct after removal", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(20, 30);
      expect(tree.overlaps(5, 25)).toBe(true);
      tree.remove(0, 10);
      expect(tree.overlaps(5, 15)).toBe(false);
      expect(tree.overlaps(15, 25)).toBe(true);
    });

    it("handles deeply nested tree via sequential removal", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i + 1);
      }
      for (let i = 0; i < 50; i++) {
        tree.remove(i, i + 1);
      }
      expect(tree.size).toBe(50);
      expect(tree.query(75)).toHaveLength(2);
      expect(tree.query(25)).toHaveLength(0);
    });
  });
});
