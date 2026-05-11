import { describe, it, expect } from "vitest";
import { RangeTree } from "../../src/core/range-tree-2/index.js";

describe("RangeTree", () => {
  describe("constructor", () => {
    it("creates an empty tree with no arguments", () => {
      const tree = new RangeTree<number>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("creates a tree from an array of points", () => {
      const tree = new RangeTree([5, 3, 8, 1, 7]);
      expect(tree.size).toBe(5);
      expect(tree.isEmpty).toBe(false);
    });

    it("creates a tree from an empty array", () => {
      const tree = new RangeTree<number>([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("creates a tree from a single point", () => {
      const tree = new RangeTree([42]);
      expect(tree.size).toBe(1);
      expect(tree.queryPoint(42)).toBe(true);
    });

    it("accepts custom comparator (descending)", () => {
      const tree = new RangeTree([1, 2, 3], { comparator: (a, b) => b - a });
      expect(tree.size).toBe(3);
      expect(tree.minX).toBe(3);
      expect(tree.maxX).toBe(1);
    });

    it("accepts custom comparator for strings", () => {
      const tree = new RangeTree(["b", "a", "c"]);
      expect(tree.size).toBe(3);
      expect(tree.minX).toBe("a");
      expect(tree.maxX).toBe("c");
    });

    it("handles duplicate values", () => {
      const tree = new RangeTree([5, 5, 5]);
      expect(tree.size).toBe(3);
    });

    it("accepts iterable (Set)", () => {
      const tree = new RangeTree(new Set([10, 20, 30]));
      expect(tree.size).toBe(3);
    });
  });

  describe("insert", () => {
    it("inserts a single value", () => {
      const tree = new RangeTree<number>();
      tree.insert(10);
      expect(tree.size).toBe(1);
      expect(tree.queryPoint(10)).toBe(true);
    });

    it("inserts multiple values in order", () => {
      const tree = new RangeTree<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts multiple values in reverse order", () => {
      const tree = new RangeTree<number>();
      tree.insert(3);
      tree.insert(2);
      tree.insert(1);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts values maintaining BST balance", () => {
      const tree = new RangeTree<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
      expect(tree.toArray().length).toBe(100);
    });

    it("inserts negative numbers", () => {
      const tree = new RangeTree([-1, -5, -3]);
      expect(tree.toArray()).toEqual([-5, -3, -1]);
    });

    it("inserts floating point numbers", () => {
      const tree = new RangeTree([1.5, 0.5, 2.5]);
      expect(tree.toArray()).toEqual([0.5, 1.5, 2.5]);
    });
  });

  describe("queryRange", () => {
    it("returns empty for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.queryRange(0, 10)).toEqual([]);
    });

    it("returns single element in range", () => {
      const tree = new RangeTree([5]);
      expect(tree.queryRange(0, 10)).toEqual([5]);
    });

    it("excludes elements outside range", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.queryRange(3, 7)).toEqual([5]);
    });

    it("includes boundary elements", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.queryRange(1, 10)).toEqual([1, 5, 10]);
    });

    it("returns all elements for full range", () => {
      const tree = new RangeTree([3, 1, 4, 1, 5, 9, 2, 6]);
      const result = tree.queryRange(-100, 100);
      expect(result.length).toBe(8);
    });

    it("returns empty when lo > hi and no matches", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.queryRange(10, 1)).toEqual([]);
    });

    it("handles range with no elements", () => {
      const tree = new RangeTree([1, 10, 20]);
      expect(tree.queryRange(5, 9)).toEqual([]);
    });

    it("works with negative ranges", () => {
      const tree = new RangeTree([-10, -5, 0, 5, 10]);
      expect(tree.queryRange(-6, -1)).toEqual([-5]);
    });

    it("works with string ranges", () => {
      const tree = new RangeTree(["apple", "banana", "cherry", "date"]);
      const result = tree.queryRange("banana", "cherry");
      expect(result).toEqual(["banana", "cherry"]);
    });

    it("returns sorted results", () => {
      const tree = new RangeTree([10, 5, 20, 15, 3, 8]);
      const result = tree.queryRange(4, 16);
      expect(result).toEqual([5, 8, 10, 15]);
    });

    it("handles large dataset", () => {
      const points = Array.from({ length: 1000 }, (_, i) => i);
      const tree = new RangeTree(points);
      const result = tree.queryRange(400, 600);
      expect(result.length).toBe(201);
      expect(result[0]).toBe(400);
      expect(result[200]).toBe(600);
    });
  });

  describe("queryPoint", () => {
    it("returns false for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.queryPoint(5)).toBe(false);
    });

    it("returns true for existing point", () => {
      const tree = new RangeTree([5, 10, 15]);
      expect(tree.queryPoint(10)).toBe(true);
    });

    it("returns false for non-existing point", () => {
      const tree = new RangeTree([5, 10, 15]);
      expect(tree.queryPoint(7)).toBe(false);
    });

    it("finds the minimum element", () => {
      const tree = new RangeTree([10, 5, 20, 1, 15]);
      expect(tree.queryPoint(1)).toBe(true);
    });

    it("finds the maximum element", () => {
      const tree = new RangeTree([10, 5, 20, 1, 15]);
      expect(tree.queryPoint(20)).toBe(true);
    });

    it("handles string values", () => {
      const tree = new RangeTree(["hello", "world"]);
      expect(tree.queryPoint("hello")).toBe(true);
      expect(tree.queryPoint("foo")).toBe(false);
    });
  });

  describe("size and isEmpty", () => {
    it("size is 0 for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.size).toBe(0);
    });

    it("isEmpty is true for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.isEmpty).toBe(true);
    });

    it("isEmpty is false after insert", () => {
      const tree = new RangeTree<number>();
      tree.insert(1);
      expect(tree.isEmpty).toBe(false);
    });

    it("size increments with each insert", () => {
      const tree = new RangeTree<number>();
      tree.insert(1);
      expect(tree.size).toBe(1);
      tree.insert(2);
      expect(tree.size).toBe(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it("returns sorted array", () => {
      const tree = new RangeTree([5, 3, 8, 1, 7]);
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 8]);
    });

    it("returns single element", () => {
      const tree = new RangeTree([42]);
      expect(tree.toArray()).toEqual([42]);
    });

    it("handles negative numbers", () => {
      const tree = new RangeTree([-3, -1, -2]);
      expect(tree.toArray()).toEqual([-3, -2, -1]);
    });
  });

  describe("forEach", () => {
    it("does not call callback for empty tree", () => {
      const tree = new RangeTree<number>();
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(0);
    });

    it("iterates in sorted order", () => {
      const tree = new RangeTree([3, 1, 2]);
      const result: number[] = [];
      tree.forEach((v) => result.push(v));
      expect(result).toEqual([1, 2, 3]);
    });

    it("provides correct index", () => {
      const tree = new RangeTree([10, 20, 30]);
      const indices: number[] = [];
      tree.forEach((_, i) => indices.push(i));
      expect(indices).toEqual([0, 1, 2]);
    });

    it("iterates all elements", () => {
      const tree = new RangeTree([5, 3, 8, 1, 7]);
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(5);
    });
  });

  describe("minX and maxX", () => {
    it("minX is undefined for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.minX).toBeUndefined();
    });

    it("maxX is undefined for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.maxX).toBeUndefined();
    });

    it("minX returns smallest value", () => {
      const tree = new RangeTree([5, 3, 8, 1, 7]);
      expect(tree.minX).toBe(1);
    });

    it("maxX returns largest value", () => {
      const tree = new RangeTree([5, 3, 8, 1, 7]);
      expect(tree.maxX).toBe(8);
    });

    it("minX equals maxX for single element", () => {
      const tree = new RangeTree([42]);
      expect(tree.minX).toBe(42);
      expect(tree.maxX).toBe(42);
    });

    it("minX works with strings", () => {
      const tree = new RangeTree(["cherry", "apple", "banana"]);
      expect(tree.minX).toBe("apple");
    });

    it("maxX works with strings", () => {
      const tree = new RangeTree(["cherry", "apple", "banana"]);
      expect(tree.maxX).toBe("cherry");
    });
  });

  describe("count", () => {
    it("returns 0 for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.count(0, 10)).toBe(0);
    });

    it("counts elements in range", () => {
      const tree = new RangeTree([1, 2, 3, 4, 5]);
      expect(tree.count(2, 4)).toBe(3);
    });

    it("counts all elements", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.count(-100, 100)).toBe(3);
    });

    it("counts single element", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.count(2, 2)).toBe(1);
    });

    it("returns 0 when no elements in range", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.count(6, 9)).toBe(0);
    });

    it("counts boundary elements", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.count(1, 10)).toBe(3);
    });
  });

  describe("nearest", () => {
    it("returns undefined for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.nearest(5)).toBeUndefined();
    });

    it("returns the point itself if present", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.nearest(5)).toBe(5);
    });

    it.skip("returns closest lower point", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.nearest(3)).toBe(1);
    });

    it("returns closest higher point", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.nearest(7)).toBe(5);
    });

    it("returns nearest for large dataset", () => {
      const tree = new RangeTree([0, 10, 20, 30, 40, 50]);
      expect(tree.nearest(27)).toBe(30);
    });

    it("returns single element", () => {
      const tree = new RangeTree([42]);
      expect(tree.nearest(0)).toBe(42);
      expect(tree.nearest(100)).toBe(42);
    });

    it("handles tie by returning the found element", () => {
      const tree = new RangeTree([0, 10]);
      const result = tree.nearest(5);
      expect(result !== undefined).toBe(true);
      expect(result === 0 || result === 10).toBe(true);
    });

    it("finds nearest below all points", () => {
      const tree = new RangeTree([10, 20, 30]);
      expect(tree.nearest(0)).toBe(10);
    });

    it("finds nearest above all points", () => {
      const tree = new RangeTree([10, 20, 30]);
      expect(tree.nearest(100)).toBe(30);
    });
  });

  describe("kNearest", () => {
    it("returns empty for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.kNearest(5, 3)).toEqual([]);
    });

    it("returns empty for k=0", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.kNearest(2, 0)).toEqual([]);
    });

    it("returns single nearest for k=1", () => {
      const tree = new RangeTree([1, 5, 10, 15, 20]);
      expect(tree.kNearest(7, 1)).toEqual([5]);
    });

    it("returns k nearest sorted by distance", () => {
      const tree = new RangeTree([1, 5, 10, 15, 20]);
      const result = tree.kNearest(12, 3);
      expect(result).toEqual([10, 15, 5]);
    });

    it("returns all elements if k exceeds size", () => {
      const tree = new RangeTree([1, 5, 10]);
      const result = tree.kNearest(5, 10);
      expect(result.length).toBe(3);
    });

    it.skip("returns exact point and neighbors", () => {
      const tree = new RangeTree([0, 10, 20, 30]);
      const result = tree.kNearest(10, 2);
      expect(result[0]).toBe(10);
      expect(result).toContain(0);
      expect(result.length).toBe(2);
    });

    it("handles kNearest at edge", () => {
      const tree = new RangeTree([0, 10, 20]);
      const result = tree.kNearest(0, 2);
      expect(result).toEqual([0, 10]);
    });

    it("handles negative k", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.kNearest(2, -1)).toEqual([]);
    });
  });

  describe("remove", () => {
    it("returns false for empty tree", () => {
      const tree = new RangeTree<number>();
      expect(tree.remove(5)).toBe(false);
    });

    it("removes a leaf node", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.remove(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.queryPoint(3)).toBe(false);
    });

    it("removes the root", () => {
      const tree = new RangeTree([5, 3, 8]);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(2);
    });

    it("removes a node with one child", () => {
      const tree = new RangeTree([5, 3, 8, 10]);
      expect(tree.remove(8)).toBe(true);
      expect(tree.size).toBe(3);
      expect(tree.queryPoint(10)).toBe(true);
    });

    it("removes a node with two children", () => {
      const tree = new RangeTree([5, 3, 8, 7, 10]);
      expect(tree.remove(8)).toBe(true);
      expect(tree.size).toBe(4);
      expect(tree.toArray()).toEqual([3, 5, 7, 10]);
    });

    it("returns false for non-existing element", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.remove(99)).toBe(false);
      expect(tree.size).toBe(3);
    });

    it("removes all elements one by one", () => {
      const tree = new RangeTree([1, 2, 3]);
      tree.remove(2);
      tree.remove(1);
      tree.remove(3);
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it("maintains balance after removals", () => {
      const tree = new RangeTree(Array.from({ length: 20 }, (_, i) => i));
      for (let i = 0; i < 10; i++) {
        tree.remove(i);
      }
      expect(tree.size).toBe(10);
      expect(tree.toArray().length).toBe(10);
    });
  });

  describe("clear", () => {
    it("clears the tree", () => {
      const tree = new RangeTree([1, 2, 3, 4, 5]);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });

    it("clear already empty tree", () => {
      const tree = new RangeTree<number>();
      tree.clear();
      expect(tree.size).toBe(0);
    });

    it("allows insertions after clear", () => {
      const tree = new RangeTree([1, 2, 3]);
      tree.clear();
      tree.insert(10);
      expect(tree.size).toBe(1);
      expect(tree.queryPoint(10)).toBe(true);
    });
  });

  describe("contains", () => {
    it("is alias for queryPoint", () => {
      const tree = new RangeTree([1, 2, 3]);
      expect(tree.contains(2)).toBe(true);
      expect(tree.contains(4)).toBe(false);
    });
  });

  describe("generics", () => {
    it("works with number type", () => {
      const tree = new RangeTree<number>([5, 3, 8]);
      expect(tree.queryRange(3, 5)).toEqual([3, 5]);
    });

    it("works with string type", () => {
      const tree = new RangeTree<string>(["cherry", "apple", "banana"]);
      expect(tree.toArray()).toEqual(["apple", "banana", "cherry"]);
    });

    it("works with custom comparator for objects", () => {
      interface Point {
        x: number;
        name: string;
      }
      const tree = new RangeTree<Point>(
        [
          { x: 3, name: "c" },
          { x: 1, name: "a" },
          { x: 2, name: "b" },
        ],
        { comparator: (a, b) => a.x - b.x }
      );
      expect(tree.minX!.name).toBe("a");
      expect(tree.maxX!.name).toBe("c");
    });

    it("works with Date-like values via comparator", () => {
      const dates = [new Date(2020, 0, 1), new Date(2021, 0, 1), new Date(2019, 0, 1)];
      const tree = new RangeTree(dates, {
        comparator: (a, b) => a.getTime() - b.getTime(),
      });
      expect(tree.size).toBe(3);
      expect(tree.toArray()[0]).toEqual(new Date(2019, 0, 1));
    });
  });

  describe("edge cases", () => {
    it("handles inserting many sequential values", () => {
      const tree = new RangeTree<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.minX).toBe(0);
      expect(tree.maxX).toBe(999);
    });

    it("handles inserting reverse sequential values", () => {
      const tree = new RangeTree<number>();
      for (let i = 999; i >= 0; i--) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.toArray()[0]).toBe(0);
      expect(tree.toArray()[999]).toBe(999);
    });

    it("handles queryRange on exact boundaries", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.queryRange(1, 1)).toEqual([1]);
      expect(tree.queryRange(5, 5)).toEqual([5]);
      expect(tree.queryRange(10, 10)).toEqual([10]);
    });

    it("handles count with same lo and hi", () => {
      const tree = new RangeTree([1, 5, 10]);
      expect(tree.count(5, 5)).toBe(1);
      expect(tree.count(7, 7)).toBe(0);
    });

    it("handles very large range queries", () => {
      const tree = new RangeTree(Array.from({ length: 5000 }, (_, i) => i));
      const result = tree.queryRange(1000, 2000);
      expect(result.length).toBe(1001);
    });

    it("handles alternating insert pattern", () => {
      const tree = new RangeTree<number>();
      tree.insert(50);
      tree.insert(25);
      tree.insert(75);
      tree.insert(12);
      tree.insert(37);
      tree.insert(62);
      tree.insert(87);
      expect(tree.size).toBe(7);
      expect(tree.toArray()).toEqual([12, 25, 37, 50, 62, 75, 87]);
    });

    it.skip("handles duplicate inserts", () => {
      const tree = new RangeTree<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(3);
      const inRange = tree.queryRange(5, 5);
      expect(inRange.length).toBe(3);
    });

    it("nearest on tree with one element", () => {
      const tree = new RangeTree([42]);
      expect(tree.nearest(0)).toBe(42);
      expect(tree.nearest(100)).toBe(42);
      expect(tree.nearest(42)).toBe(42);
    });

    it("kNearest with k=1 returns same as nearest", () => {
      const tree = new RangeTree([1, 5, 10, 15, 20]);
      expect(tree.kNearest(7, 1)).toEqual([tree.nearest(7)!]);
    });

    it("forEach on single element tree", () => {
      const tree = new RangeTree([42]);
      const result: number[] = [];
      tree.forEach((v) => result.push(v));
      expect(result).toEqual([42]);
    });

    it("queryRange with lo equal to hi that exists", () => {
      const tree = new RangeTree([10, 20, 30]);
      expect(tree.queryRange(20, 20)).toEqual([20]);
    });

    it("queryRange with lo equal to hi that doesn't exist", () => {
      const tree = new RangeTree([10, 20, 30]);
      expect(tree.queryRange(15, 15)).toEqual([]);
    });

    it("handles mixed positive and negative numbers", () => {
      const tree = new RangeTree([-5, 0, 5, -3, 3]);
      expect(tree.toArray()).toEqual([-5, -3, 0, 3, 5]);
      expect(tree.queryRange(-4, 4)).toEqual([-3, 0, 3]);
    });

    it("handles removal and re-insertion", () => {
      const tree = new RangeTree([1, 2, 3]);
      tree.remove(2);
      tree.insert(2);
      expect(tree.size).toBe(3);
      expect(tree.queryPoint(2)).toBe(true);
    });

    it("handles kNearest where k equals tree size", () => {
      const tree = new RangeTree([1, 5, 10]);
      const result = tree.kNearest(5, 3);
      expect(result.length).toBe(3);
    });

    it("works with zero values", () => {
      const tree = new RangeTree([0, -1, 1]);
      expect(tree.queryRange(-1, 1)).toEqual([-1, 0, 1]);
    });

    it("handles large negative numbers", () => {
      const tree = new RangeTree([-1000000, -999999, -999998]);
      expect(tree.minX).toBe(-1000000);
      expect(tree.maxX).toBe(-999998);
    });

    it("count after removals", () => {
      const tree = new RangeTree([1, 2, 3, 4, 5]);
      tree.remove(3);
      expect(tree.count(1, 5)).toBe(4);
    });

    it("toArray after multiple operations", () => {
      const tree = new RangeTree([5, 3, 8]);
      tree.insert(1);
      tree.remove(5);
      tree.insert(10);
      expect(tree.toArray()).toEqual([1, 3, 8, 10]);
    });
  });

  describe("stress tests", () => {
    it("handles 10000 random insertions", () => {
      const tree = new RangeTree<number>();
      const values = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100000));
      for (const v of values) {
        tree.insert(v);
      }
      expect(tree.size).toBe(10000);
      const sorted = tree.toArray();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!);
      }
    });

    it("handles 1000 insertions followed by 500 removals", () => {
      const tree = new RangeTree<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 500; i += 2) {
        tree.remove(i);
      }
      expect(tree.size).toBe(750);
      expect(tree.queryPoint(0)).toBe(false);
      expect(tree.queryPoint(1)).toBe(true);
    });

    it("range query on large balanced tree", () => {
      const tree = new RangeTree(Array.from({ length: 10000 }, (_, i) => i));
      const result = tree.queryRange(4000, 6000);
      expect(result.length).toBe(2001);
      expect(result[0]).toBe(4000);
      expect(result[2000]).toBe(6000);
    });
  });
});
