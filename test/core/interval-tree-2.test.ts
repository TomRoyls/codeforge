import { describe, it, expect } from "vitest";
import { IntervalTree } from "../../src/core/interval-tree-2/index.js";

describe("IntervalTree", () => {
  describe("constructor and basic properties", () => {
    it.skip("creates an empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it.skip("isEmpty returns false after insert", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.isEmpty).toBe(false);
    });

    it.skip("size increments with each insert", () => {
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
    it.skip("inserts a single interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.query(7)).toHaveLength(1);
    });

    it.skip("inserts intervals with same low bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 15);
      tree.insert(5, 20);
      expect(tree.size).toBe(3);
    });

    it.skip("inserts intervals with negative values", () => {
      const tree = new IntervalTree();
      tree.insert(-10, -5);
      tree.insert(-3, 3);
      tree.insert(5, 10);
      expect(tree.size).toBe(3);
      expect(tree.query(-7)).toHaveLength(1);
      expect(tree.query(0)).toHaveLength(1);
    });

    it.skip("inserts zero-width interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 5);
      expect(tree.size).toBe(1);
      expect(tree.query(5)).toHaveLength(1);
      expect(tree.query(4)).toHaveLength(0);
    });

    it.skip("inserts large number of intervals", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i + 10);
      }
      expect(tree.size).toBe(1000);
    });

    it.skip("throws when lo > hi", () => {
      const tree = new IntervalTree();
      expect(() => tree.insert(10, 5)).toThrow(RangeError);
    });

    it.skip("inserts with value", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "hello");
      const results = tree.query(5);
      expect(results[0]!.value).toBe("hello");
    });

    it.skip("inserts with undefined value (default)", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      const results = tree.query(5);
      expect(results[0]!.value).toBeUndefined();
    });

    it.skip("inserts duplicate intervals", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.size).toBe(2);
      expect(tree.query(7)).toHaveLength(2);
    });

    it.skip("inserts floating point intervals", () => {
      const tree = new IntervalTree();
      tree.insert(1.5, 3.7);
      expect(tree.query(2.5)).toHaveLength(1);
    });
  });

  describe("query (point stabbing)", () => {
    it.skip("returns empty for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.query(5)).toEqual([]);
    });

    it.skip("finds interval containing point", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(10)).toHaveLength(1);
    });

    it.skip("finds interval at low bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(5)).toHaveLength(1);
    });

    it.skip("finds interval at high bound", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(15)).toHaveLength(1);
    });

    it.skip("does not find point below interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(4)).toHaveLength(0);
    });

    it.skip("does not find point above interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.query(16)).toHaveLength(0);
    });

    it.skip("finds multiple overlapping intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.insert(8, 20);
      expect(tree.query(9)).toHaveLength(3);
    });

    it.skip("finds partial overlaps at point", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(5, 10);
      expect(tree.query(5)).toHaveLength(2);
    });

    it.skip("finds no matches when point is between disjoint intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      expect(tree.query(7)).toHaveLength(0);
    });

    it.skip("handles negative point queries", () => {
      const tree = new IntervalTree();
      tree.insert(-20, -10);
      expect(tree.query(-15)).toHaveLength(1);
      expect(tree.query(-5)).toHaveLength(0);
    });

    it.skip("handles query at origin", () => {
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
    it.skip("returns empty for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.queryRange(0, 10)).toEqual([]);
    });

    it.skip("finds fully contained interval", () => {
      const tree = new IntervalTree();
      tree.insert(2, 8);
      expect(tree.queryRange(0, 10)).toHaveLength(1);
    });

    it.skip("finds interval that overlaps at start", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(3, 10)).toHaveLength(1);
    });

    it.skip("finds interval that overlaps at end", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.queryRange(0, 8)).toHaveLength(1);
    });

    it.skip("does not find non-overlapping interval", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(6, 10)).toHaveLength(0);
    });

    it.skip("finds interval touching at boundary", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.queryRange(5, 10)).toHaveLength(1);
    });

    it.skip("finds multiple overlapping intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(3, 8);
      tree.insert(7, 12);
      tree.insert(15, 20);
      expect(tree.queryRange(4, 9)).toHaveLength(3);
    });

    it.skip("handles range containing all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(1, 3);
      tree.insert(5, 7);
      tree.insert(9, 11);
      expect(tree.queryRange(0, 20)).toHaveLength(3);
    });

    it.skip("handles zero-width range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.queryRange(5, 5)).toHaveLength(1);
    });

    it.skip("handles negative ranges", () => {
      const tree = new IntervalTree();
      tree.insert(-15, -5);
      expect(tree.queryRange(-12, -8)).toHaveLength(1);
    });

    it.skip("finds interval that fully encloses query range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 100);
      expect(tree.queryRange(40, 60)).toHaveLength(1);
    });
  });

  describe("overlaps", () => {
    it.skip("returns false for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.overlaps(0, 10)).toBe(false);
    });

    it.skip("returns true when overlap exists", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      expect(tree.overlaps(10, 20)).toBe(true);
    });

    it.skip("returns true when interval fully contains range", () => {
      const tree = new IntervalTree();
      tree.insert(0, 100);
      expect(tree.overlaps(20, 30)).toBe(true);
    });

    it.skip("returns true when range fully contains interval", () => {
      const tree = new IntervalTree();
      tree.insert(40, 60);
      expect(tree.overlaps(0, 100)).toBe(true);
    });

    it.skip("returns true at boundary touch", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      expect(tree.overlaps(10, 20)).toBe(true);
    });

    it.skip("returns false when no overlap", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      expect(tree.overlaps(6, 10)).toBe(false);
    });

    it.skip("returns false for gap between intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(15, 20);
      expect(tree.overlaps(7, 12)).toBe(false);
    });
  });

  describe("remove", () => {
    it.skip("returns false for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.remove(0, 10)).toBe(false);
    });

    it.skip("removes existing interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it.skip("returns false for non-existing interval", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      expect(tree.remove(5, 20)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it.skip("removes from tree with multiple intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.remove(10, 15)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.query(12)).toHaveLength(0);
    });

    it.skip("removes duplicate intervals one at a time", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.remove(5, 10)).toBe(true);
      expect(tree.size).toBe(0);
    });

    it.skip("maintains tree integrity after removal", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      tree.remove(5, 15);
      expect(tree.query(7)).toHaveLength(1);
      expect(tree.query(12)).toHaveLength(1);
      expect(tree.size).toBe(2);
    });

    it.skip("handles removing root node", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      tree.insert(25, 30);
      expect(tree.remove(10, 20)).toBe(true);
      expect(tree.query(15)).toHaveLength(0);
      expect(tree.size).toBe(2);
    });

    it.skip("handles removing leaf node", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      expect(tree.remove(0, 5)).toBe(true);
      expect(tree.size).toBe(1);
    });

    it.skip("can remove all intervals", () => {
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
    it.skip("clears empty tree", () => {
      const tree = new IntervalTree();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it.skip("clears tree with intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.query(5)).toEqual([]);
    });

    it.skip("allows insertion after clear", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.clear();
      tree.insert(20, 30);
      expect(tree.size).toBe(1);
      expect(tree.query(25)).toHaveLength(1);
    });
  });

  describe("toArray", () => {
    it.skip("returns empty array for empty tree", () => {
      const tree = new IntervalTree();
      expect(tree.toArray()).toEqual([]);
    });

    it.skip("returns intervals in order", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(0, 5);
      tree.insert(5, 10);
      const arr = tree.toArray();
      expect(arr[0]!.lo).toBe(0);
      expect(arr[1]!.lo).toBe(5);
      expect(arr[2]!.lo).toBe(10);
    });

    it.skip("returns all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.toArray()).toHaveLength(3);
    });

    it.skip("preserves values", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 5, "a");
      tree.insert(10, 15, "b");
      const arr = tree.toArray();
      expect(arr[0]!.value).toBe("a");
      expect(arr[1]!.value).toBe("b");
    });

    it.skip("returns duplicate intervals separately", () => {
      const tree = new IntervalTree();
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.toArray()).toHaveLength(2);
    });
  });

  describe("forEach", () => {
    it.skip("does not call callback for empty tree", () => {
      const tree = new IntervalTree();
      let count = 0;
      tree.forEach(() => { count++; });
      expect(count).toBe(0);
    });

    it.skip("iterates all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      let count = 0;
      tree.forEach(() => { count++; });
      expect(count).toBe(3);
    });

    it.skip("provides correct index", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const indices: number[] = [];
      tree.forEach((_interval, index) => { indices.push(index); });
      expect(indices).toEqual([0, 1, 2]);
    });

    it.skip("provides interval objects", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "test");
      tree.forEach((interval) => {
        expect(interval.lo).toBe(0);
        expect(interval.hi).toBe(10);
        expect(interval.value).toBe("test");
      });
    });

    it.skip("iterates in sorted order", () => {
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
    it.skip("stores number values", () => {
      const tree = new IntervalTree<number>();
      tree.insert(0, 10, 42);
      const results = tree.query(5);
      expect(results[0]!.value).toBe(42);
    });

    it.skip("stores object values", () => {
      const tree = new IntervalTree<{ name: string }>();
      tree.insert(0, 10, { name: "test" });
      const results = tree.query(5);
      expect(results[0]!.value.name).toBe("test");
    });

    it.skip("stores array values", () => {
      const tree = new IntervalTree<number[]>();
      tree.insert(0, 10, [1, 2, 3]);
      const results = tree.query(5);
      expect(results[0]!.value).toEqual([1, 2, 3]);
    });

    it.skip("stores null values", () => {
      const tree = new IntervalTree<null>();
      tree.insert(0, 10, null);
      const results = tree.query(5);
      expect(results[0]!.value).toBeNull();
    });

    it.skip("stores boolean values", () => {
      const tree = new IntervalTree<boolean>();
      tree.insert(0, 10, true);
      tree.insert(15, 25, false);
      expect(tree.query(5)[0]!.value).toBe(true);
      expect(tree.query(20)[0]!.value).toBe(false);
    });
  });

  describe("AVL tree balancing", () => {
    it.skip("handles sequential right inserts", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i + 5);
      }
      expect(tree.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(tree.query(i).length).toBeGreaterThanOrEqual(1);
      }
    });

    it.skip("handles sequential left inserts", () => {
      const tree = new IntervalTree();
      for (let i = 50; i >= 0; i--) {
        tree.insert(i, i + 5);
      }
      expect(tree.size).toBe(51);
    });

    it.skip("handles alternating inserts", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 20; i++) {
        tree.insert(i * 2, i * 2 + 1);
        tree.insert(-i * 2 - 1, -i * 2);
      }
      expect(tree.size).toBe(40);
    });

    it.skip("handles removal triggering rebalance", () => {
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
    it.skip("handles very large values", () => {
      const tree = new IntervalTree();
      tree.insert(Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER);
      expect(tree.query(Number.MAX_SAFE_INTEGER - 5)).toHaveLength(1);
    });

    it.skip("handles very small negative values", () => {
      const tree = new IntervalTree();
      tree.insert(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER + 10);
      expect(tree.query(-Number.MAX_SAFE_INTEGER + 5)).toHaveLength(1);
    });

    it.skip("handles single point intervals", () => {
      const tree = new IntervalTree();
      tree.insert(5, 5);
      tree.insert(10, 10);
      expect(tree.query(5)).toHaveLength(1);
      expect(tree.query(10)).toHaveLength(1);
      expect(tree.query(7)).toHaveLength(0);
    });

    it.skip("handles interval covering entire number line", () => {
      const tree = new IntervalTree();
      tree.insert(-1e9, 1e9);
      expect(tree.query(0)).toHaveLength(1);
      expect(tree.query(-1e9)).toHaveLength(1);
      expect(tree.query(1e9)).toHaveLength(1);
    });

    it.skip("handles many overlapping intervals at same point", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(0, 100);
      }
      expect(tree.query(50)).toHaveLength(100);
    });

    it.skip("query on point just outside all intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(20, 30);
      expect(tree.query(15)).toHaveLength(0);
      expect(tree.query(-1)).toHaveLength(0);
      expect(tree.query(31)).toHaveLength(0);
    });

    it.skip("remove non-existent does not affect existing", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.remove(0, 5);
      tree.remove(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.query(5)).toHaveLength(1);
    });

    it.skip("insert after removal works correctly", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.remove(0, 10);
      tree.insert(5, 15);
      expect(tree.size).toBe(1);
      expect(tree.query(10)).toHaveLength(1);
    });

    it.skip("handles interleaved insert and remove", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(10, 15);
      tree.remove(0, 5);
      tree.insert(20, 25);
      tree.remove(10, 15);
      expect(tree.size).toBe(1);
      expect(tree.query(22)).toHaveLength(1);
    });

    it.skip("queryRange with full range returns all", () => {
      const tree = new IntervalTree();
      tree.insert(10, 20);
      tree.insert(30, 40);
      tree.insert(50, 60);
      expect(tree.queryRange(0, 100)).toHaveLength(3);
    });

    it.skip("queryRange with disjoint range returns none", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(20, 25);
      expect(tree.queryRange(8, 15)).toHaveLength(0);
    });

    it.skip("toArray after multiple operations", () => {
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

    it.skip("forEach after clear and reinsert", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "old");
      tree.clear();
      tree.insert(5, 15, "new");
      let result = "";
      tree.forEach((interval) => { result = interval.value; });
      expect(result).toBe("new");
    });

    it.skip("overlaps returns correct after removal", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(20, 30);
      expect(tree.overlaps(5, 25)).toBe(true);
      tree.remove(0, 10);
      expect(tree.overlaps(5, 15)).toBe(false);
      expect(tree.overlaps(15, 25)).toBe(true);
    });

    it.skip("handles deeply nested tree via sequential removal", () => {
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

  describe("stress and correctness", () => {
    it.skip("handles random insert and query", () => {
      const tree = new IntervalTree<number>();
      const intervals: Array<[number, number, number]> = [];
      for (let i = 0; i < 200; i++) {
        const lo = Math.floor(Math.random() * 1000);
        const hi = lo + Math.floor(Math.random() * 50);
        tree.insert(lo, hi, i);
        intervals.push([lo, hi, i]);
      }
      for (let p = 0; p < 100; p += 7) {
        const expected = intervals.filter(([lo, hi]) => p >= lo && p <= hi);
        const actual = tree.query(p);
        expect(actual.length).toBe(expected.length);
      }
    });

    it.skip("handles alternating insert remove pattern", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i + 5);
        if (i % 3 === 0) {
          tree.remove(i, i + 5);
        }
      }
      expect(tree.size).toBeGreaterThanOrEqual(30);
    });

    it.skip("toArray length matches size", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i + 10);
      }
      expect(tree.toArray()).toHaveLength(tree.size);
      tree.remove(50, 60);
      expect(tree.toArray()).toHaveLength(tree.size);
    });

    it.skip("forEach count matches size after modifications", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(20, 30);
      tree.insert(40, 50);
      tree.remove(20, 30);
      let count = 0;
      tree.forEach(() => { count++; });
      expect(count).toBe(tree.size);
    });

    it.skip("overlaps is consistent with queryRange", () => {
      const tree = new IntervalTree();
      tree.insert(5, 15);
      tree.insert(25, 35);
      expect(tree.overlaps(10, 20)).toBe(tree.queryRange(10, 20).length > 0);
      expect(tree.overlaps(0, 3)).toBe(tree.queryRange(0, 3).length > 0);
      expect(tree.overlaps(30, 40)).toBe(tree.queryRange(30, 40).length > 0);
    });

    it.skip("query and queryRange consistency for single point", () => {
      const tree = new IntervalTree();
      tree.insert(0, 10);
      tree.insert(5, 15);
      tree.insert(20, 30);
      for (let p = 0; p <= 30; p += 5) {
        expect(tree.query(p)).toHaveLength(tree.queryRange(p, p).length);
      }
    });

    it.skip("handles many removals preserving structure", () => {
      const tree = new IntervalTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(i * 3, i * 3 + 2);
      }
      for (let i = 0; i < 50; i++) {
        tree.remove(i * 3, i * 3 + 2);
      }
      expect(tree.size).toBe(50);
      expect(tree.query(150 * 3)).toHaveLength(0);
      expect(tree.query(75 * 3)).toHaveLength(1);
    });

    it.skip("clear and rebuild preserves correctness", () => {
      const tree = new IntervalTree<string>();
      tree.insert(0, 10, "old");
      tree.clear();
      expect(tree.toArray()).toEqual([]);
      tree.insert(5, 15, "new1");
      tree.insert(20, 30, "new2");
      const arr = tree.toArray();
      expect(arr).toHaveLength(2);
      expect(arr[0]!.value).toBe("new1");
      expect(arr[1]!.value).toBe("new2");
    });

    it.skip("handles intervals with same lo different hi", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(0, 10);
      tree.insert(0, 15);
      expect(tree.query(3)).toHaveLength(3);
      expect(tree.query(12)).toHaveLength(1);
      tree.remove(0, 10);
      expect(tree.query(3)).toHaveLength(2);
      expect(tree.query(8)).toHaveLength(1);
    });

    it.skip("handles negative to positive spanning intervals", () => {
      const tree = new IntervalTree();
      tree.insert(-100, 100);
      tree.insert(-50, -10);
      tree.insert(10, 50);
      expect(tree.query(0)).toHaveLength(1);
      expect(tree.query(-30)).toHaveLength(2);
      expect(tree.query(30)).toHaveLength(2);
      expect(tree.query(80)).toHaveLength(1);
    });

    it.skip("forEach provides correct intervals after complex operations", () => {
      const tree = new IntervalTree<string>();
      tree.insert(10, 20, "b");
      tree.insert(0, 5, "a");
      tree.insert(30, 40, "d");
      tree.insert(25, 35, "c");
      tree.remove(10, 20);
      const values: string[] = [];
      tree.forEach((interval) => { values.push(interval.value); });
      expect(values).toEqual(["a", "c", "d"]);
    });

    it.skip("handles rapid insert clear insert cycles", () => {
      const tree = new IntervalTree();
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) {
          tree.insert(i, i + 5);
        }
        expect(tree.size).toBe(20);
        tree.clear();
        expect(tree.size).toBe(0);
      }
    });

    it.skip("queryRange returns correct overlapping boundary intervals", () => {
      const tree = new IntervalTree();
      tree.insert(0, 5);
      tree.insert(5, 10);
      tree.insert(10, 15);
      expect(tree.queryRange(5, 10)).toHaveLength(3);
      expect(tree.queryRange(0, 3)).toHaveLength(1);
      expect(tree.queryRange(12, 20)).toHaveLength(1);
    });
  });
});
