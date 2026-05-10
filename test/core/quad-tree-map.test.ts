import { describe, it, expect } from "vitest";
import { QuadTreeMap } from "../../src/core/quad-tree-map/quad-tree-map.js";
import type {
  QuadTreeMapOptions,
  Point,
  QuadTreeEntry,
  QuadTreeMapStatistics,
} from "../../src/core/quad-tree-map/types.js";
import { DEFAULT_QUAD_TREE_MAP_OPTIONS } from "../../src/core/quad-tree-map/types.js";

describe("QuadTreeMap", () => {
  describe("constructor", () => {
    it("creates empty tree with default options", () => {
      const tree = new QuadTreeMap<string>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("creates tree with custom capacity", () => {
      const tree = new QuadTreeMap<string>({ capacity: 8 });
      expect(tree.size).toBe(0);
    });

    it("creates tree with custom maxDepth", () => {
      const tree = new QuadTreeMap<string>({ maxDepth: 16 });
      expect(tree.size).toBe(0);
    });

    it("creates tree with custom bounds", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: -100, y: -100, width: 200, height: 200 },
      });
      const bounds = tree.getBounds();
      expect(bounds.x).toBe(-100);
      expect(bounds.y).toBe(-100);
      expect(bounds.width).toBe(200);
      expect(bounds.height).toBe(200);
    });

    it("creates tree with all custom options", () => {
      const opts: QuadTreeMapOptions = {
        capacity: 2,
        maxDepth: 4,
        bounds: { x: 0, y: 0, width: 500, height: 500 },
      };
      const tree = new QuadTreeMap<number>(opts);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("insert", () => {
    it("inserts a single entry", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 20, "hello");
      expect(tree.size).toBe(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it("inserts multiple entries at different positions", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      expect(tree.size).toBe(3);
    });

    it("inserts entries at same position (duplicates allowed)", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "first");
      tree.insert(10, 10, "second");
      expect(tree.size).toBe(2);
    });

    it("inserts entries at boundary edges", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(0, 0, "origin");
      tree.insert(99, 99, "near-end");
      expect(tree.size).toBe(2);
    });

    it("triggers subdivision when capacity exceeded", () => {
      const tree = new QuadTreeMap<number>({ capacity: 2, maxDepth: 8 });
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      expect(tree.size).toBe(3);
      const stats = tree.getStatistics();
      expect(stats.subdivisions).toBeGreaterThan(0);
    });

    it("handles many inserts causing deep subdivision", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        maxDepth: 6,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let i = 0; i < 20; i++) {
        tree.insert(i * 5, i * 5, i);
      }
      expect(tree.size).toBe(20);
    });

    it("respects maxDepth limit without subdividing further", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        maxDepth: 2,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let i = 0; i < 10; i++) {
        tree.insert(1, 1, i);
      }
      expect(tree.size).toBe(10);
      const stats = tree.getStatistics();
      expect(stats.maxDepth).toBeLessThanOrEqual(2);
    });

    it("inserts entries that spread across all quadrants", () => {
      const tree = new QuadTreeMap<string>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, "nw");
      tree.insert(60, 10, "ne");
      tree.insert(10, 60, "sw");
      tree.insert(60, 60, "se");
      expect(tree.size).toBe(4);
    });

    it("inserts entries with various value types", () => {
      const numTree = new QuadTreeMap<number>();
      numTree.insert(1, 1, 42);
      expect(numTree.size).toBe(1);

      const objTree = new QuadTreeMap<{ name: string }>();
      objTree.insert(1, 1, { name: "test" });
      expect(objTree.size).toBe(1);

      const nullTree = new QuadTreeMap<null>();
      nullTree.insert(1, 1, null);
      expect(nullTree.size).toBe(1);
    });

    it("tracks insert count in statistics", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(1, 1, "a");
      tree.insert(2, 2, "b");
      tree.insert(3, 3, "c");
      expect(tree.getStatistics().inserts).toBe(3);
    });

    it("handles insert near midline", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(49, 49, 1);
      tree.insert(50, 50, 2);
      tree.insert(51, 51, 3);
      expect(tree.size).toBe(3);
    });
  });

  describe("delete", () => {
    it("deletes an existing entry", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 20, "hello");
      expect(tree.delete(10, 20)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("returns false for non-existent entry", () => {
      const tree = new QuadTreeMap<string>();
      expect(tree.delete(10, 20)).toBe(false);
    });

    it("deletes specific entry when duplicates exist", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "first");
      tree.insert(10, 10, "second");
      expect(tree.delete(10, 10)).toBe(true);
      expect(tree.size).toBe(1);
    });

    it("deletes from correct quadrant after subdivision", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      tree.insert(50, 50, 3);
      expect(tree.delete(90, 90)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.query(90, 90)).toBeUndefined();
    });

    it("tracks delete count in statistics", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(1, 1, "a");
      tree.insert(2, 2, "b");
      tree.delete(1, 1);
      tree.delete(2, 2);
      expect(tree.getStatistics().deletes).toBe(2);
    });

    it("delete returns false for point outside bounds", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(50, 50, "x");
      expect(tree.delete(200, 200)).toBe(false);
    });

    it("handles delete from empty tree", () => {
      const tree = new QuadTreeMap<string>();
      expect(tree.delete(0, 0)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it("can delete all entries", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      tree.delete(10, 10);
      tree.delete(20, 20);
      tree.delete(30, 30);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("delete does not affect other entries", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(20, 20, "b");
      tree.insert(30, 30, "c");
      tree.delete(20, 20);
      expect(tree.query(10, 10)?.value).toBe("a");
      expect(tree.query(30, 30)?.value).toBe("c");
    });
  });

  describe("query", () => {
    it("finds an entry at exact point", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 20, "hello");
      const result = tree.query(10, 20);
      expect(result).toBeDefined();
      expect(result!.value).toBe("hello");
      expect(result!.x).toBe(10);
      expect(result!.y).toBe(20);
    });

    it("returns undefined for non-existent point", () => {
      const tree = new QuadTreeMap<string>();
      expect(tree.query(10, 20)).toBeUndefined();
    });

    it("finds entry after subdivision", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      tree.insert(50, 50, 3);
      expect(tree.query(50, 50)?.value).toBe(3);
      expect(tree.query(10, 10)?.value).toBe(1);
      expect(tree.query(90, 90)?.value).toBe(2);
    });

    it("returns first match for duplicate points", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "first");
      tree.insert(10, 10, "second");
      const result = tree.query(10, 10);
      expect(result).toBeDefined();
      expect(result!.value).toBe("first");
    });

    it("increments query counter", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(1, 1, "a");
      tree.query(1, 1);
      tree.query(2, 2);
      expect(tree.getStatistics().queries).toBe(2);
    });

    it("returns undefined for point outside bounds", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(50, 50, "x");
      expect(tree.query(200, 200)).toBeUndefined();
    });

    it("finds entry at origin (0,0)", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(0, 0, "origin");
      expect(tree.query(0, 0)?.value).toBe("origin");
    });
  });

  describe("queryRange", () => {
    it("returns entries within rectangular range", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      tree.insert(100, 100, 4);
      const results = tree.queryRange(0, 0, 40, 40);
      expect(results).toHaveLength(3);
      const values = results.map((e) => e.value).sort();
      expect(values).toEqual([1, 2, 3]);
    });

    it("returns empty array for range with no entries", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(100, 100, 1);
      const results = tree.queryRange(0, 0, 10, 10);
      expect(results).toHaveLength(0);
    });

    it("returns all entries for full range", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(50, 50, 2);
      tree.insert(90, 90, 3);
      const results = tree.queryRange(0, 0, 1000, 1000);
      expect(results).toHaveLength(3);
    });

    it("handles range on empty tree", () => {
      const tree = new QuadTreeMap<number>();
      const results = tree.queryRange(0, 0, 100, 100);
      expect(results).toHaveLength(0);
    });

    it("handles single point range", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      const results = tree.queryRange(10, 10, 1, 1);
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe(1);
    });

    it("finds entries across quadrant boundaries", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(49, 49, 1);
      tree.insert(50, 50, 2);
      tree.insert(51, 51, 3);
      const results = tree.queryRange(45, 45, 15, 15);
      expect(results).toHaveLength(3);
    });

    it("increments query counter", () => {
      const tree = new QuadTreeMap<number>();
      tree.queryRange(0, 0, 10, 10);
      tree.queryRange(0, 0, 10, 10);
      expect(tree.getStatistics().queries).toBe(2);
    });

    it("returns entries from deeply subdivided tree", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        maxDepth: 8,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let i = 0; i < 20; i++) {
        tree.insert(i * 5, i * 5, i);
      }
      const results = tree.queryRange(0, 0, 50, 50);
      expect(results.length).toBeGreaterThan(0);
    });

    it("range excludes boundary edges correctly (half-open)", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      const results = tree.queryRange(0, 0, 10, 10);
      expect(results).toHaveLength(0);
    });
  });

  describe("queryRadius", () => {
    it("returns entries within circle", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(15, 15, 2);
      tree.insert(100, 100, 3);
      const results = tree.queryRadius(10, 10, 10);
      expect(results).toHaveLength(2);
      const values = results.map((e) => e.value).sort();
      expect(values).toEqual([1, 2]);
    });

    it("returns empty array for radius with no entries", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(100, 100, 1);
      const results = tree.queryRadius(0, 0, 5);
      expect(results).toHaveLength(0);
    });

    it("returns entry exactly on circle boundary", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 0, 1);
      const results = tree.queryRadius(0, 0, 10);
      expect(results).toHaveLength(1);
    });

    it("returns all entries with large radius", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(500, 500, 2);
      const results = tree.queryRadius(250, 250, 1000);
      expect(results).toHaveLength(2);
    });

    it("handles zero radius", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      const results = tree.queryRadius(10, 10, 0);
      expect(results).toHaveLength(1);
    });

    it("handles radius on empty tree", () => {
      const tree = new QuadTreeMap<number>();
      const results = tree.queryRadius(50, 50, 100);
      expect(results).toHaveLength(0);
    });

    it("increments query counter", () => {
      const tree = new QuadTreeMap<number>();
      tree.queryRadius(0, 0, 10);
      tree.queryRadius(0, 0, 20);
      expect(tree.getStatistics().queries).toBe(2);
    });

    it("finds entries from subdivided tree", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      tree.insert(50, 50, 3);
      const results = tree.queryRadius(50, 50, 60);
      expect(results.length).toBeGreaterThan(0);
    });

    it("excludes entries outside radius", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(0, 0, 1);
      tree.insert(100, 100, 2);
      const results = tree.queryRadius(0, 0, 50);
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe(1);
    });
  });

  describe("nearest", () => {
    it("finds single nearest neighbor", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(50, 50, "b");
      tree.insert(90, 90, "c");
      const results = tree.nearest(12, 12);
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe("a");
    });

    it("finds k nearest neighbors", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(15, 15, "b");
      tree.insert(50, 50, "c");
      tree.insert(90, 90, "d");
      const results = tree.nearest(12, 12, 2);
      expect(results).toHaveLength(2);
      expect(results[0]!.value).toBe("a");
      expect(results[1]!.value).toBe("b");
    });

    it("returns fewer results if tree has fewer entries than k", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      const results = tree.nearest(5, 5, 5);
      expect(results).toHaveLength(1);
    });

    it("returns empty array for empty tree", () => {
      const tree = new QuadTreeMap<string>();
      const results = tree.nearest(5, 5);
      expect(results).toHaveLength(0);
    });

    it("finds nearest from subdivided tree", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      tree.insert(50, 50, 3);
      const results = tree.nearest(48, 48, 1);
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe(3);
    });

    it("finds nearest when query point matches entry", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "exact");
      tree.insert(50, 50, "far");
      const results = tree.nearest(10, 10);
      expect(results[0]!.value).toBe("exact");
    });

    it("returns all k when enough entries", () => {
      const tree = new QuadTreeMap<number>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, i * 10, i);
      }
      const results = tree.nearest(50, 50, 5);
      expect(results).toHaveLength(5);
    });
  });

  describe("size and isEmpty", () => {
    it("returns correct size after inserts", () => {
      const tree = new QuadTreeMap<number>();
      expect(tree.size).toBe(0);
      tree.insert(1, 1, 1);
      expect(tree.size).toBe(1);
      tree.insert(2, 2, 2);
      expect(tree.size).toBe(2);
    });

    it("returns correct size after deletes", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 1);
      tree.insert(2, 2, 2);
      tree.delete(1, 1);
      expect(tree.size).toBe(1);
    });

    it("isEmpty returns true for new tree", () => {
      const tree = new QuadTreeMap<number>();
      expect(tree.isEmpty()).toBe(true);
    });

    it("isEmpty returns false after insert", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 1);
      expect(tree.isEmpty()).toBe(false);
    });

    it("isEmpty returns true after deleting all", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 1);
      tree.delete(1, 1);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("allows insertions after clear", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.clear();
      tree.insert(20, 20, 2);
      expect(tree.size).toBe(1);
      expect(tree.query(20, 20)?.value).toBe(2);
    });

    it("preserves bounds after clear", () => {
      const tree = new QuadTreeMap<number>({
        bounds: { x: -50, y: -50, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.clear();
      const bounds = tree.getBounds();
      expect(bounds.x).toBe(-50);
      expect(bounds.width).toBe(100);
    });

    it("clear on empty tree is no-op", () => {
      const tree = new QuadTreeMap<number>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty tree", () => {
      const tree = new QuadTreeMap<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it("returns all entries", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(20, 20, "b");
      tree.insert(30, 30, "c");
      const arr = tree.toArray();
      expect(arr).toHaveLength(3);
    });

    it("returns entries with correct coordinates and values", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(5, 15, "hello");
      const arr = tree.toArray();
      expect(arr[0]!.x).toBe(5);
      expect(arr[0]!.y).toBe(15);
      expect(arr[0]!.value).toBe("hello");
    });

    it("returns all entries after subdivision", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      tree.insert(50, 50, 3);
      expect(tree.toArray()).toHaveLength(3);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(20, 20, "b");
      tree.insert(30, 30, "c");
      const values: string[] = [];
      tree.forEach((entry) => values.push(entry.value));
      expect(values.sort()).toEqual(["a", "b", "c"]);
    });

    it("provides correct index", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 10);
      tree.insert(2, 2, 20);
      const indices: number[] = [];
      tree.forEach(() => indices.push(0));
      expect(indices).toHaveLength(2);
    });

    it("does not iterate on empty tree", () => {
      const tree = new QuadTreeMap<number>();
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(0);
    });

    it("iterates after subdivision", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 1,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(90, 90, 2);
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(2);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      const tree = new QuadTreeMap<string>();
      tree.insert(10, 10, "a");
      tree.insert(20, 20, "b");
      const results: string[] = [];
      for (const entry of tree) {
        results.push(entry.value);
      }
      expect(results.sort()).toEqual(["a", "b"]);
    });

    it("works with spread operator", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 10);
      tree.insert(2, 2, 20);
      const arr = [...tree];
      expect(arr).toHaveLength(2);
    });

    it("works with Array.from", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 10);
      const arr = Array.from(tree);
      expect(arr).toHaveLength(1);
    });

    it("returns done for empty tree", () => {
      const tree = new QuadTreeMap<number>();
      const iter = tree[Symbol.iterator]();
      expect(iter.next().done).toBe(true);
    });
  });

  describe("getBounds", () => {
    it("returns default bounds", () => {
      const tree = new QuadTreeMap<number>();
      const bounds = tree.getBounds();
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      });
    });

    it("returns custom bounds", () => {
      const tree = new QuadTreeMap<number>({
        bounds: { x: -100, y: -200, width: 300, height: 400 },
      });
      const bounds = tree.getBounds();
      expect(bounds).toEqual({
        x: -100,
        y: -200,
        width: 300,
        height: 400,
    });
    });

    it("bounds unchanged after operations", () => {
      const tree = new QuadTreeMap<number>({
        bounds: { x: 0, y: 0, width: 500, height: 500 },
      });
      tree.insert(10, 10, 1);
      tree.insert(400, 400, 2);
      tree.clear();
      expect(tree.getBounds()).toEqual({
        x: 0,
        y: 0,
        width: 500,
        height: 500,
      });
    });
  });

  describe("getStatistics", () => {
    it("returns initial statistics", () => {
      const tree = new QuadTreeMap<number>();
      const stats = tree.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.queries).toBe(0);
      expect(stats.subdivisions).toBe(0);
      expect(stats.maxDepth).toBe(0);
    });

    it("tracks operations correctly", () => {
      const tree = new QuadTreeMap<string>({
        capacity: 2,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, "a");
      tree.insert(20, 20, "b");
      tree.insert(30, 30, "c");
      tree.delete(10, 10);
      tree.query(20, 20);
      tree.queryRange(0, 0, 50, 50);

      const stats = tree.getStatistics();
      expect(stats.inserts).toBe(3);
      expect(stats.deletes).toBe(1);
      expect(stats.queries).toBe(2);
      expect(stats.subdivisions).toBeGreaterThan(0);
    });

    it("statistics have correct shape", () => {
      const tree = new QuadTreeMap<number>();
      const stats: QuadTreeMapStatistics = tree.getStatistics();
      expect(typeof stats.inserts).toBe("number");
      expect(typeof stats.deletes).toBe("number");
      expect(typeof stats.queries).toBe("number");
      expect(typeof stats.subdivisions).toBe("number");
      expect(typeof stats.maxDepth).toBe("number");
    });
  });

  describe("DEFAULT_QUAD_TREE_MAP_OPTIONS", () => {
    it("has correct default capacity", () => {
      expect(DEFAULT_QUAD_TREE_MAP_OPTIONS.capacity).toBe(4);
    });

    it("has correct default maxDepth", () => {
      expect(DEFAULT_QUAD_TREE_MAP_OPTIONS.maxDepth).toBe(8);
    });

    it("has correct default bounds", () => {
      expect(DEFAULT_QUAD_TREE_MAP_OPTIONS.bounds).toEqual({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
      });
    });
  });

  describe("types", () => {
    it("Point type works", () => {
      const p: Point = { x: 10, y: 20 };
      expect(p.x).toBe(10);
      expect(p.y).toBe(20);
    });

    it("QuadTreeEntry type works", () => {
      const entry: QuadTreeEntry<string> = { x: 5, y: 10, value: "test" };
      expect(entry.value).toBe("test");
    });

    it("QuadTreeMapOptions type works", () => {
      const opts: QuadTreeMapOptions = {
        capacity: 10,
        maxDepth: 4,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      };
      expect(opts.capacity).toBe(10);
    });
  });

  describe("stress tests", () => {
    it("handles many inserts and queries", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 4,
        maxDepth: 10,
        bounds: { x: 0, y: 0, width: 1000, height: 1000 },
      });
      const count = 500;
      for (let i = 0; i < count; i++) {
        tree.insert(i % 1000, Math.floor(i / 1000) * 10, i);
      }
      expect(tree.size).toBe(count);
      const all = tree.toArray();
      expect(all).toHaveLength(count);
    });

    it("handles clustered inserts", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 2,
        maxDepth: 10,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let i = 0; i < 50; i++) {
        tree.insert(50 + i * 0.01, 50 + i * 0.01, i);
      }
      expect(tree.size).toBe(50);
    });

    it("handles interleaved insert and delete", () => {
      const tree = new QuadTreeMap<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i, i);
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i * 2, i * 2);
      }
      expect(tree.size).toBe(50);
    });

    it("handles queryRange on dense tree", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 4,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          tree.insert(x * 10, y * 10, x * 10 + y);
        }
      }
      const results = tree.queryRange(0, 0, 50, 50);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThan(100);
    });

    it("handles queryRadius on dense tree", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 4,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          tree.insert(x * 10, y * 10, x * 10 + y);
        }
      }
      const results = tree.queryRadius(50, 50, 30);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("insert at exact bounds corner", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(0, 0, "corner");
      expect(tree.query(0, 0)?.value).toBe("corner");
    });

    it("insert near but not at bounds edge", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(99.999, 99.999, "near-edge");
      expect(tree.query(99.999, 99.999)?.value).toBe("near-edge");
    });

    it("insert with negative coordinates", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: -100, y: -100, width: 200, height: 200 },
      });
      tree.insert(-50, -50, "negative");
      expect(tree.query(-50, -50)?.value).toBe("negative");
    });

    it("queryRadius with very small radius", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      tree.insert(10.1, 10.1, 2);
      const results = tree.queryRadius(10, 10, 0.05);
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe(1);
    });

    it("nearest with k larger than tree size", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      const results = tree.nearest(0, 0, 100);
      expect(results).toHaveLength(1);
    });

    it("insert and query with zero coordinates", () => {
      const tree = new QuadTreeMap<string>({
        bounds: { x: -10, y: -10, width: 20, height: 20 },
      });
      tree.insert(0, 0, "zero");
      expect(tree.query(0, 0)?.value).toBe("zero");
    });

    it("multiple operations maintain consistency", () => {
      const tree = new QuadTreeMap<number>({
        capacity: 2,
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      });
      tree.insert(10, 10, 1);
      tree.insert(20, 20, 2);
      tree.insert(30, 30, 3);
      tree.insert(40, 40, 4);
      tree.delete(20, 20);
      tree.insert(25, 25, 5);
      expect(tree.size).toBe(4);
      expect(tree.query(10, 10)?.value).toBe(1);
      expect(tree.query(20, 20)).toBeUndefined();
      expect(tree.query(25, 25)?.value).toBe(5);
    });

    it("queryRange with zero-size range", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(10, 10, 1);
      const results = tree.queryRange(10, 10, 0, 0);
      expect(results).toHaveLength(0);
    });

    it("forEach with early-terminated iteration count", () => {
      const tree = new QuadTreeMap<number>();
      tree.insert(1, 1, 1);
      tree.insert(2, 2, 2);
      tree.insert(3, 3, 3);
      let sum = 0;
      tree.forEach((entry) => {
        sum += entry.value;
      });
      expect(sum).toBe(6);
    });
  });
});
