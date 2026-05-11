import { describe, it, expect } from "vitest";
import { PrioritySearchTree } from "../../src/core/priority-search-tree/index.js";

describe("PrioritySearchTree", () => {
  describe("constructor", () => {
    it("creates empty tree with no options", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("creates tree with custom priority comparator", () => {
      const tree = new PrioritySearchTree<string, number>({
        priorityComparator: (a, b) => b - a,
      });
      tree.insert("a", 1);
      tree.insert("b", 5);
      expect(tree.peek().key).toBe("b");
    });

    it("creates tree with custom key comparator", () => {
      const tree = new PrioritySearchTree<string, number>({
        keyComparator: (a, b) => a.localeCompare(b),
      });
      expect(tree.isEmpty).toBe(true);
    });

    it("handles string priorities by default", () => {
      const tree = new PrioritySearchTree<string, string>();
      tree.insert("a", "alpha");
      tree.insert("b", "beta");
      expect(tree.size).toBe(2);
    });

    it("creates tree with both comparators", () => {
      const tree = new PrioritySearchTree<number, string>({
        priorityComparator: (a, b) => a.localeCompare(b),
        keyComparator: (a, b) => a - b,
      });
      tree.insert(1, "z");
      tree.insert(2, "a");
      expect(tree.peek().key).toBe(2);
    });
  });

  describe("insert", () => {
    it("inserts a single entry", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
    });

    it("inserts multiple entries", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 3);
      tree.insert("b", 1);
      tree.insert("c", 2);
      expect(tree.size).toBe(3);
    });

    it("maintains min-heap property", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.insert("c", 3);
      tree.insert("d", 2);
      tree.insert("e", 4);
      expect(tree.peek().key).toBe("b");
      expect(tree.peek().priority).toBe(1);
    });

    it("throws on duplicate key", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(() => tree.insert("a", 2)).toThrow("Duplicate key");
    });

    it("inserts with negative priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", -5);
      tree.insert("b", -10);
      tree.insert("c", 0);
      expect(tree.peek().key).toBe("b");
    });

    it("inserts with zero priority", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 0);
      tree.insert("b", 1);
      expect(tree.peek().key).toBe("a");
    });

    it("inserts with equal priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 1);
      tree.insert("c", 1);
      expect(tree.size).toBe(3);
      expect(tree.peek().priority).toBe(1);
    });

    it("inserts with number keys", () => {
      const tree = new PrioritySearchTree<number>();
      tree.insert(10, 5);
      tree.insert(20, 3);
      tree.insert(30, 1);
      expect(tree.peek().key).toBe(30);
    });

    it("inserts with string priorities", () => {
      const tree = new PrioritySearchTree<string, string>();
      tree.insert("x", "ccc");
      tree.insert("y", "aaa");
      tree.insert("z", "bbb");
      expect(tree.peek().key).toBe("y");
    });

    it("handles many insertions", () => {
      const tree = new PrioritySearchTree<number>();
      for (let i = 100; i >= 0; i--) {
        tree.insert(i, i);
      }
      expect(tree.size).toBe(101);
      expect(tree.peek().key).toBe(0);
    });
  });

  describe("delete", () => {
    it("deletes an entry by key", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      const entry = tree.delete("a");
      expect(entry.key).toBe("a");
      expect(entry.priority).toBe(1);
      expect(tree.size).toBe(0);
    });

    it("deletes from middle of heap", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.insert("c", 3);
      tree.insert("d", 2);
      tree.insert("e", 4);
      tree.delete("c");
      expect(tree.size).toBe(4);
      expect(tree.has("c")).toBe(false);
      expect(tree.peek().key).toBe("b");
    });

    it("deletes root element", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.insert("c", 3);
      const entry = tree.delete("a");
      expect(entry.key).toBe("a");
      expect(tree.peek().key).toBe("b");
    });

    it("deletes last element", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.delete("b");
      expect(tree.size).toBe(1);
      expect(tree.has("b")).toBe(false);
    });

    it("throws on missing key", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.delete("missing")).toThrow("Key not found");
    });

    it("maintains heap after multiple deletes", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 3);
      tree.insert("c", 1);
      tree.insert("d", 4);
      tree.insert("e", 2);
      tree.delete("c");
      tree.delete("e");
      expect(tree.peek().key).toBe("b");
    });

    it("deletes and reinserts", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.delete("b");
      tree.insert("b", 0);
      expect(tree.peek().key).toBe("b");
    });
  });

  describe("extractMin", () => {
    it("extracts minimum priority entry", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 3);
      tree.insert("b", 1);
      tree.insert("c", 2);
      const min = tree.extractMin();
      expect(min.key).toBe("b");
      expect(min.priority).toBe(1);
      expect(tree.size).toBe(2);
    });

    it("extracts all in order", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 3);
      tree.insert("b", 1);
      tree.insert("c", 2);
      const results = [tree.extractMin(), tree.extractMin(), tree.extractMin()];
      expect(results.map((e) => e.priority)).toEqual([1, 2, 3]);
    });

    it("throws on empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.extractMin()).toThrow("empty");
    });

    it("extracts single element", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      const entry = tree.extractMin();
      expect(entry.key).toBe("a");
      expect(tree.isEmpty).toBe(true);
    });

    it("handles duplicate priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 1);
      const min = tree.extractMin();
      expect(min.priority).toBe(1);
      expect(tree.size).toBe(1);
    });
  });

  describe("extractMax", () => {
    it("extracts maximum priority entry", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      const max = tree.extractMax();
      expect(max.key).toBe("b");
      expect(max.priority).toBe(5);
    });

    it("throws on empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.extractMax()).toThrow("empty");
    });

    it("removes max from tree", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      tree.extractMax();
      expect(tree.has("b")).toBe(false);
      expect(tree.size).toBe(2);
    });
  });

  describe("peek / peekMax", () => {
    it("peeks at min without removing", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 3);
      tree.insert("b", 1);
      expect(tree.peek().key).toBe("b");
      expect(tree.size).toBe(2);
    });

    it("peek throws on empty", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.peek()).toThrow("empty");
    });

    it("peekMax returns max without removing", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 3);
      tree.insert("b", 1);
      tree.insert("c", 5);
      expect(tree.peekMax().key).toBe("c");
      expect(tree.size).toBe(3);
    });

    it("peekMax throws on empty", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.peekMax()).toThrow("empty");
    });

    it("peek and peekMax same for single element", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 42);
      expect(tree.peek().priority).toBe(42);
      expect(tree.peekMax().priority).toBe(42);
    });
  });

  describe("get", () => {
    it("returns priority for existing key", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 42);
      expect(tree.get("a")).toBe(42);
    });

    it("returns undefined for missing key", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.get("missing")).toBeUndefined();
    });

    it("returns updated priority after updatePriority", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.updatePriority("a", 10);
      expect(tree.get("a")).toBe(10);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.has("a")).toBe(true);
    });

    it("returns false for missing key", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.has("a")).toBe(false);
    });

    it("returns false after deletion", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.delete("a");
      expect(tree.has("a")).toBe(false);
    });
  });

  describe("updatePriority", () => {
    it("increases priority (sink down)", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      tree.updatePriority("a", 10);
      expect(tree.peek().key).toBe("c");
    });

    it("decreases priority (bubble up)", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 3);
      tree.insert("c", 1);
      tree.updatePriority("b", 0);
      expect(tree.peek().key).toBe("b");
    });

    it("same priority no-op", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.updatePriority("a", 1);
      expect(tree.peek().key).toBe("a");
      expect(tree.size).toBe(2);
    });

    it("throws on missing key", () => {
      const tree = new PrioritySearchTree<string>();
      expect(() => tree.updatePriority("missing", 5)).toThrow("Key not found");
    });
  });

  describe("size and isEmpty", () => {
    it("size tracks insertions", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.size).toBe(0);
      tree.insert("a", 1);
      expect(tree.size).toBe(1);
      tree.insert("b", 2);
      expect(tree.size).toBe(2);
    });

    it("isEmpty reflects state", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.isEmpty).toBe(true);
      tree.insert("a", 1);
      expect(tree.isEmpty).toBe(false);
      tree.delete("a");
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.insert("c", 3);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it("clears empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      tree.clear();
      expect(tree.size).toBe(0);
    });

    it("allows operations after clear", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.clear();
      tree.insert("b", 2);
      expect(tree.size).toBe(1);
      expect(tree.peek().key).toBe("b");
    });
  });

  describe("toArray", () => {
    it("returns copy of entries", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      const arr = tree.toArray();
      expect(arr.length).toBe(2);
      expect(arr).toEqual(expect.arrayContaining([{ key: "a", priority: 1 }, { key: "b", priority: 2 }]));
    });

    it("modifying returned array does not affect tree", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      const arr = tree.toArray();
      arr.pop();
      expect(tree.size).toBe(1);
    });

    it("returns empty array for empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.insert("c", 3);
      const keys: string[] = [];
      tree.forEach((entry) => keys.push(entry.key));
      expect(keys.sort()).toEqual(["a", "b", "c"]);
    });

    it("provides correct indices", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      const indices: number[] = [];
      tree.forEach((_, idx) => indices.push(idx));
      expect(indices.sort()).toEqual([0, 1]);
    });

    it("does not iterate empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe("keys", () => {
    it("returns all keys", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.insert("c", 3);
      expect(tree.keys().sort()).toEqual(["a", "b", "c"]);
    });

    it("returns empty array for empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.keys()).toEqual([]);
    });
  });

  describe("values", () => {
    it("returns all priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 10);
      tree.insert("b", 20);
      expect(tree.values().sort()).toEqual([10, 20]);
    });

    it("returns empty array for empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.values()).toEqual([]);
    });
  });

  describe("entries", () => {
    it("returns all [key, priority] pairs", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      const entries = tree.entries();
      expect(entries.length).toBe(2);
      const keys = entries.map(([k]) => k).sort();
      expect(keys).toEqual(["a", "b"]);
    });
  });

  describe("sortByPriority", () => {
    it("returns entries sorted ascending", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.insert("c", 3);
      tree.insert("d", 2);
      tree.insert("e", 4);
      const sorted = tree.sortByPriority();
      expect(sorted.map((e) => e.priority)).toEqual([1, 2, 3, 4, 5]);
    });

    it("does not modify tree", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.sortByPriority();
      expect(tree.size).toBe(2);
    });

    it("returns empty for empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.sortByPriority()).toEqual([]);
    });
  });

  describe("findByPriority", () => {
    it("finds entries with exact priority", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 3);
      tree.insert("c", 5);
      const found = tree.findByPriority(5);
      expect(found.length).toBe(2);
      expect(found.map((e) => e.key).sort()).toEqual(["a", "c"]);
    });

    it("returns empty when no match", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.findByPriority(99)).toEqual([]);
    });
  });

  describe("findByPriorityRange", () => {
    it("finds entries in range inclusive", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 3);
      tree.insert("c", 5);
      tree.insert("d", 7);
      const found = tree.findByPriorityRange(3, 5);
      expect(found.length).toBe(2);
      expect(found.map((e) => e.key).sort()).toEqual(["b", "c"]);
    });

    it("includes boundaries", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 2);
      tree.insert("b", 4);
      const found = tree.findByPriorityRange(2, 4);
      expect(found.length).toBe(2);
    });

    it("returns empty for no matches", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.findByPriorityRange(10, 20)).toEqual([]);
    });
  });

  describe("drain", () => {
    it("extracts all in sorted order", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.insert("c", 3);
      const drained = tree.drain();
      expect(drained.map((e) => e.priority)).toEqual([1, 3, 5]);
      expect(tree.isEmpty).toBe(true);
    });

    it("drains empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.drain()).toEqual([]);
    });
  });

  describe("merge", () => {
    it("merges entries from another tree", () => {
      const tree1 = new PrioritySearchTree<string>();
      tree1.insert("a", 1);
      tree1.insert("b", 2);
      const tree2 = new PrioritySearchTree<string>();
      tree2.insert("c", 3);
      tree2.insert("d", 0);
      tree1.merge(tree2);
      expect(tree1.size).toBe(4);
      expect(tree1.peek().key).toBe("d");
    });

    it("skips duplicate keys during merge", () => {
      const tree1 = new PrioritySearchTree<string>();
      tree1.insert("a", 1);
      const tree2 = new PrioritySearchTree<string>();
      tree2.insert("a", 10);
      tree2.insert("b", 5);
      tree1.merge(tree2);
      expect(tree1.size).toBe(2);
      expect(tree1.get("a")).toBe(1);
    });

    it("does not modify source tree", () => {
      const tree1 = new PrioritySearchTree<string>();
      tree1.insert("a", 1);
      const tree2 = new PrioritySearchTree<string>();
      tree2.insert("b", 2);
      tree1.merge(tree2);
      expect(tree2.size).toBe(1);
    });
  });

  describe("clone", () => {
    it("creates independent copy", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      const cloned = tree.clone();
      expect(cloned.size).toBe(2);
      expect(cloned.peek().key).toBe("a");
      cloned.delete("a");
      expect(tree.size).toBe(2);
    });

    it("clone of empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      const cloned = tree.clone();
      expect(cloned.isEmpty).toBe(true);
    });
  });

  describe("containsAll / containsAny", () => {
    it("containsAll returns true when all present", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 2);
      tree.insert("c", 3);
      expect(tree.containsAll(["a", "b"])).toBe(true);
    });

    it("containsAll returns false when some missing", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.containsAll(["a", "b"])).toBe(false);
    });

    it("containsAll empty array returns true", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.containsAll([])).toBe(true);
    });

    it("containsAny returns true when any present", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.containsAny(["a", "z"])).toBe(true);
    });

    it("containsAny returns false when none present", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      expect(tree.containsAny(["x", "y"])).toBe(false);
    });

    it("containsAny empty array returns false", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.containsAny([])).toBe(false);
    });
  });

  describe("custom comparators", () => {
    it("max-heap via inverted comparator", () => {
      const tree = new PrioritySearchTree<string, number>({
        priorityComparator: (a, b) => b - a,
      });
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      expect(tree.peek().key).toBe("b");
      expect(tree.extractMin().priority).toBe(5);
    });

    it("string priority comparison", () => {
      const tree = new PrioritySearchTree<number, string>({
        priorityComparator: (a, b) => a.localeCompare(b),
      });
      tree.insert(1, "cherry");
      tree.insert(2, "apple");
      tree.insert(3, "banana");
      expect(tree.peek().key).toBe(2);
    });
  });

  describe("generics with various types", () => {
    it("works with number keys", () => {
      const tree = new PrioritySearchTree<number>();
      tree.insert(100, 50);
      tree.insert(200, 10);
      tree.insert(300, 30);
      expect(tree.peek().key).toBe(200);
    });

    it("works with object priorities", () => {
      interface Prio {
        level: number;
      }
      const tree = new PrioritySearchTree<string, Prio>({
        priorityComparator: (a, b) => a.level - b.level,
      });
      tree.insert("a", { level: 5 });
      tree.insert("b", { level: 1 });
      expect(tree.peek().key).toBe("b");
      expect(tree.peek().priority.level).toBe(1);
    });
  });

  describe("stress / edge cases", () => {
    it("handles many interleaved operations", () => {
      const tree = new PrioritySearchTree<number>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, 50 - i);
      }
      expect(tree.size).toBe(50);
      expect(tree.peek().priority).toBe(1);
      tree.delete(49);
      expect(tree.size).toBe(49);
      tree.updatePriority(0, 100);
      expect(tree.get(0)).toBe(100);
      const drained = tree.drain();
      expect(drained.length).toBe(49);
      let prev = -Infinity;
      for (const entry of drained) {
        expect(entry.priority).toBeGreaterThanOrEqual(prev);
        prev = entry.priority;
      }
    });

    it("handles alternating insert and extractMin", () => {
      const tree = new PrioritySearchTree<number>();
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i);
      }
      for (let i = 0; i < 10; i++) {
        const min = tree.extractMin();
        expect(min.priority).toBe(i);
      }
      expect(tree.size).toBe(10);
      expect(tree.peek().priority).toBe(10);
    });

    it("handles large dataset", () => {
      const tree = new PrioritySearchTree<number>();
      const n = 500;
      for (let i = n; i >= 1; i--) {
        tree.insert(i, i);
      }
      expect(tree.peek().priority).toBe(1);
      for (let i = 1; i <= n; i++) {
        const min = tree.extractMin();
        expect(min.priority).toBe(i);
      }
      expect(tree.isEmpty).toBe(true);
    });

    it("handles floating point priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 0.1);
      tree.insert("b", 0.01);
      tree.insert("c", 0.001);
      expect(tree.peek().key).toBe("c");
    });

    it("handles negative priorities", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", -100);
      tree.insert("b", -1);
      tree.insert("c", -50);
      const drained = tree.drain();
      expect(drained.map((e) => e.priority)).toEqual([-100, -50, -1]);
    });

    it("handles single element edge case", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("only", 42);
      expect(tree.peek().key).toBe("only");
      expect(tree.peekMax().key).toBe("only");
      expect(tree.extractMin().key).toBe("only");
      expect(tree.isEmpty).toBe(true);
    });

    it("handles two elements", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 2);
      tree.insert("b", 1);
      expect(tree.extractMin().key).toBe("b");
      expect(tree.extractMin().key).toBe("a");
    });
  });

  describe("re-exports", () => {
    it("re-exports types", async () => {
      const mod = await import("../../src/core/priority-search-tree/index.js");
      expect(mod.PrioritySearchTree).toBeDefined();
      expect(typeof mod.PrioritySearchTree).toBe("function");
    });
  });

  describe("additional edge cases", () => {
    it("insert many then delete root repeatedly", () => {
      const tree = new PrioritySearchTree<number>();
      for (let i = 0; i < 10; i++) tree.insert(i, i);
      for (let i = 0; i < 10; i++) {
        expect(tree.extractMin().priority).toBe(i);
      }
      expect(tree.isEmpty).toBe(true);
    });

    it("insert reverse sorted then drain", () => {
      const tree = new PrioritySearchTree<number>();
      for (let i = 9; i >= 0; i--) tree.insert(i, i);
      const drained = tree.drain();
      expect(drained.map((e) => e.priority)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("update priority of only element", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.updatePriority("a", 10);
      expect(tree.get("a")).toBe(10);
      expect(tree.peek().priority).toBe(10);
    });

    it("delete after updatePriority", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.updatePriority("a", 10);
      const entry = tree.delete("a");
      expect(entry.priority).toBe(10);
      expect(tree.peek().key).toBe("b");
    });

    it("extractMin then extractMax", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      expect(tree.extractMin().key).toBe("a");
      expect(tree.extractMax().key).toBe("b");
      expect(tree.extractMin().key).toBe("c");
    });

    it("clone preserves comparator", () => {
      const tree = new PrioritySearchTree<string, number>({
        priorityComparator: (a, b) => b - a,
      });
      tree.insert("a", 1);
      tree.insert("b", 5);
      const cloned = tree.clone();
      expect(cloned.peek().priority).toBe(5);
    });

    it("merge with empty tree", () => {
      const tree1 = new PrioritySearchTree<string>();
      tree1.insert("a", 1);
      const tree2 = new PrioritySearchTree<string>();
      tree1.merge(tree2);
      expect(tree1.size).toBe(1);
    });

    it("merge empty into non-empty", () => {
      const tree1 = new PrioritySearchTree<string>();
      const tree2 = new PrioritySearchTree<string>();
      tree2.insert("a", 1);
      tree1.merge(tree2);
      expect(tree1.size).toBe(1);
    });

    it("findByPriority on empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.findByPriority(1)).toEqual([]);
    });

    it("findByPriorityRange on empty tree", () => {
      const tree = new PrioritySearchTree<string>();
      expect(tree.findByPriorityRange(1, 5)).toEqual([]);
    });

    it("get returns undefined after delete", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.delete("a");
      expect(tree.get("a")).toBeUndefined();
    });

    it("insert after drain", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.drain();
      tree.insert("b", 2);
      expect(tree.size).toBe(1);
      expect(tree.peek().key).toBe("b");
    });

    it("multiple updates to same key", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 10);
      tree.insert("b", 5);
      tree.insert("c", 1);
      tree.updatePriority("a", 0);
      expect(tree.peek().key).toBe("a");
      tree.updatePriority("a", 100);
      expect(tree.peek().key).toBe("c");
    });

    it("toArray after modifications", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 5);
      tree.insert("b", 1);
      tree.insert("c", 3);
      tree.delete("b");
      const arr = tree.toArray();
      expect(arr.length).toBe(2);
      expect(arr.map((e) => e.key).sort()).toEqual(["a", "c"]);
    });

    it("sortByPriority with max-heap comparator", () => {
      const tree = new PrioritySearchTree<string, number>({
        priorityComparator: (a, b) => b - a,
      });
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      const sorted = tree.sortByPriority();
      expect(sorted.map((e) => e.priority)).toEqual([5, 3, 1]);
    });

    it("forEach provides correct entry data", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("x", 42);
      tree.forEach((entry, idx) => {
        expect(entry.key).toBe("x");
        expect(entry.priority).toBe(42);
        expect(idx).toBe(0);
      });
    });

    it("peekMax after extractMin updates", () => {
      const tree = new PrioritySearchTree<string>();
      tree.insert("a", 1);
      tree.insert("b", 5);
      tree.insert("c", 3);
      tree.extractMin();
      expect(tree.peekMax().priority).toBe(5);
    });
  });
});
