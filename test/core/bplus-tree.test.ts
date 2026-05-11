import { describe, it, expect } from "vitest";
import { BPlusTree } from "../../src/core/bplus-tree/index.js";

describe("BPlusTree", () => {
  describe("constructor", () => {
    it("creates empty tree with default options", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("creates tree with numeric order", () => {
      const tree = new BPlusTree<number, string>(4);
      expect(tree.size).toBe(0);
    });

    it("creates tree with options object", () => {
      const tree = new BPlusTree<number, string>({ order: 8 });
      expect(tree.size).toBe(0);
    });

    it("creates tree with custom comparator", () => {
      const tree = new BPlusTree<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      expect(tree.size).toBe(0);
    });

    it("creates tree with order and comparator", () => {
      const tree = new BPlusTree<string, number>({
        order: 4,
        comparator: (a, b) => a.localeCompare(b),
      });
      expect(tree.size).toBe(0);
    });

    it("throws on order less than 3", () => {
      expect(() => new BPlusTree<number, string>(2)).toThrow(RangeError);
    });

    it("throws on order of 1", () => {
      expect(() => new BPlusTree<number, string>(1)).toThrow(RangeError);
    });

    it("accepts order of 3", () => {
      const tree = new BPlusTree<number, string>(3);
      tree.insert(1, "a");
      tree.insert(2, "b");
      expect(tree.size).toBe(2);
    });

    it("accepts order of 4", () => {
      const tree = new BPlusTree<number, string>(4);
      tree.insert(1, "a");
      expect(tree.get(1)).toBe("a");
    });
  });

  describe("insert and get", () => {
    it("inserts and gets a single entry", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      expect(tree.get(1)).toBe("one");
    });

    it("returns undefined for missing key", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.get(99)).toBeUndefined();
    });

    it("overwrites existing key", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      tree.insert(1, "uno");
      expect(tree.get(1)).toBe("uno");
      expect(tree.size).toBe(1);
    });

    it("inserts multiple entries in order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      expect(tree.get(1)).toBe("a");
      expect(tree.get(2)).toBe("b");
      expect(tree.get(3)).toBe("c");
      expect(tree.size).toBe(3);
    });

    it("inserts multiple entries in reverse order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(2, "b");
      tree.insert(1, "a");
      expect(tree.get(1)).toBe("a");
      expect(tree.get(2)).toBe("b");
      expect(tree.get(3)).toBe("c");
    });

    it("inserts entries in random order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(5, "e");
      tree.insert(1, "a");
      tree.insert(3, "c");
      tree.insert(2, "b");
      tree.insert(4, "d");
      expect(tree.get(1)).toBe("a");
      expect(tree.get(2)).toBe("b");
      expect(tree.get(3)).toBe("c");
      expect(tree.get(4)).toBe("d");
      expect(tree.get(5)).toBe("e");
    });

    it("handles duplicate keys correctly", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "first");
      tree.insert(1, "second");
      tree.insert(1, "third");
      expect(tree.get(1)).toBe("third");
      expect(tree.size).toBe(1);
    });

    it("inserts with small order (3)", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 1; i <= 10; i++) {
        expect(tree.get(i)).toBe(`v${i}`);
      }
      expect(tree.size).toBe(10);
    });

    it("inserts with order 4", () => {
      const tree = new BPlusTree<number, string>(4);
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 1; i <= 20; i++) {
        expect(tree.get(i)).toBe(`v${i}`);
      }
      expect(tree.size).toBe(20);
    });

    it("inserts many elements with default order", () => {
      const tree = new BPlusTree<number, number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 10);
      }
      expect(tree.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tree.get(i)).toBe(i * 10);
      }
    });

    it("inserts many elements with small order", () => {
      const tree = new BPlusTree<number, number>(3);
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 5);
      }
      expect(tree.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(tree.get(i)).toBe(i * 5);
      }
    });

    it("inserts in reverse with small order", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 20; i >= 1; i--) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.size).toBe(20);
      for (let i = 1; i <= 20; i++) {
        expect(tree.get(i)).toBe(`v${i}`);
      }
    });

    it("handles string keys", () => {
      const tree = new BPlusTree<string, number>();
      tree.insert("apple", 1);
      tree.insert("banana", 2);
      tree.insert("cherry", 3);
      expect(tree.get("apple")).toBe(1);
      expect(tree.get("banana")).toBe(2);
      expect(tree.get("cherry")).toBe(3);
    });

    it("handles object values", () => {
      const tree = new BPlusTree<number, { name: string }>();
      tree.insert(1, { name: "one" });
      tree.insert(2, { name: "two" });
      expect(tree.get(1)).toEqual({ name: "one" });
      expect(tree.get(2)).toEqual({ name: "two" });
    });

    it("handles null and undefined values", () => {
      const tree = new BPlusTree<number, string | null | undefined>();
      tree.insert(1, null);
      tree.insert(2, undefined);
      tree.insert(3, "hello");
      expect(tree.get(1)).toBeNull();
      expect(tree.get(2)).toBeUndefined();
      expect(tree.get(3)).toBe("hello");
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      expect(tree.has(1)).toBe(true);
    });

    it("returns false for missing key", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.has(1)).toBe(false);
    });

    it("returns false after delete", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      tree.delete(1);
      expect(tree.has(1)).toBe(false);
    });

    it("returns true for multiple existing keys", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      expect(tree.has(1)).toBe(true);
      expect(tree.has(2)).toBe(true);
      expect(tree.has(3)).toBe(true);
      expect(tree.has(4)).toBe(false);
    });

    it("works with small order", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 20; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.has(i)).toBe(true);
      }
      expect(tree.has(20)).toBe(false);
    });
  });

  describe("update", () => {
    it("updates existing value", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      expect(tree.update(1, "uno")).toBe(true);
      expect(tree.get(1)).toBe("uno");
    });

    it("returns false for missing key", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.update(99, "not found")).toBe(false);
    });

    it("does not change size on update", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      tree.insert(2, "two");
      tree.update(1, "uno");
      expect(tree.size).toBe(2);
    });

    it("updates value at various positions", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.update(i, `u${i}`)).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.get(i)).toBe(`u${i}`);
      }
    });
  });

  describe("delete", () => {
    it("deletes a single entry", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      expect(tree.delete(1)).toBe(true);
      expect(tree.get(1)).toBeUndefined();
      expect(tree.size).toBe(0);
    });

    it("returns false for missing key", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.delete(99)).toBe(false);
    });

    it("deletes from tree with multiple entries", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      expect(tree.delete(2)).toBe(true);
      expect(tree.get(2)).toBeUndefined();
      expect(tree.size).toBe(2);
      expect(tree.get(1)).toBe("a");
      expect(tree.get(3)).toBe("c");
    });

    it("deletes all entries one by one", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("deletes in reverse order", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.size).toBe(0);
    });

    it("deletes from tree with small order", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 20; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.size).toBe(0);
    });

    it("deletes alternating entries", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 10; i += 2) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.size).toBe(5);
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          expect(tree.has(i)).toBe(false);
        } else {
          expect(tree.has(i)).toBe(true);
        }
      }
    });

    it("deletes and re-inserts", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      tree.delete(1);
      tree.insert(1, "new one");
      expect(tree.get(1)).toBe("new one");
      expect(tree.size).toBe(1);
    });

    it("handles deleting only element", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(42, "answer");
      expect(tree.delete(42)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });

    it("deletes from tree with order 3 and many elements", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 1; i <= 30; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 15; i <= 25; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.size).toBe(19);
      for (let i = 1; i <= 30; i++) {
        if (i >= 15 && i <= 25) {
          expect(tree.has(i)).toBe(false);
        } else {
          expect(tree.has(i)).toBe(true);
        }
      }
    });

    it("deletes first element", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.delete(0)).toBe(true);
      expect(tree.get(0)).toBeUndefined();
      expect(tree.size).toBe(9);
    });

    it("deletes last element", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.delete(9)).toBe(true);
      expect(tree.get(9)).toBeUndefined();
      expect(tree.size).toBe(9);
    });
  });

  describe("size and isEmpty", () => {
    it("returns correct size after inserts", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.size).toBe(0);
      tree.insert(1, "a");
      expect(tree.size).toBe(1);
      tree.insert(2, "b");
      expect(tree.size).toBe(2);
    });

    it("isEmpty returns correct state", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.isEmpty()).toBe(true);
      tree.insert(1, "a");
      expect(tree.isEmpty()).toBe(false);
      tree.delete(1);
      expect(tree.isEmpty()).toBe(true);
    });

    it("size does not change on overwrite", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(1, "b");
      expect(tree.size).toBe(1);
    });
  });

  describe("clear", () => {
    it("clears the tree", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `v${i}`);
      }
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("allows inserts after clear", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.clear();
      tree.insert(2, "b");
      expect(tree.size).toBe(1);
      expect(tree.get(2)).toBe("b");
      expect(tree.get(1)).toBeUndefined();
    });

    it("clear on empty tree is no-op", () => {
      const tree = new BPlusTree<number, string>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("min and max", () => {
    it("returns undefined for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
    });

    it("returns min and max for single entry", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(5, "five");
      expect(tree.min()).toEqual({ key: 5, value: "five" });
      expect(tree.max()).toEqual({ key: 5, value: "five" });
    });

    it("returns correct min and max", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(1, "a");
      tree.insert(5, "e");
      tree.insert(2, "b");
      tree.insert(4, "d");
      expect(tree.min()).toEqual({ key: 1, value: "a" });
      expect(tree.max()).toEqual({ key: 5, value: "e" });
    });

    it("updates min after deletion", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      tree.delete(1);
      expect(tree.min()).toEqual({ key: 2, value: "b" });
    });

    it("updates max after deletion", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      tree.delete(3);
      expect(tree.max()).toEqual({ key: 2, value: "b" });
    });

    it("returns min and max with small order", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 10; i <= 20; i++) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.min()).toEqual({ key: 10, value: "v10" });
      expect(tree.max()).toEqual({ key: 20, value: "v20" });
    });
  });

  describe("range", () => {
    it("returns empty for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.range(1, 5)).toEqual([]);
    });

    it("returns entries in range", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(3, 7);
      expect(result).toHaveLength(5);
      expect(result[0]!).toEqual({ key: 3, value: "v3" });
      expect(result[4]!).toEqual({ key: 7, value: "v7" });
    });

    it("returns single entry range", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(5, 5);
      expect(result).toHaveLength(1);
      expect(result[0]!).toEqual({ key: 5, value: "v5" });
    });

    it("returns empty when range has no matches", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.range(15, 20)).toEqual([]);
    });

    it("returns full range", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 1; i <= 5; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(1, 5);
      expect(result).toHaveLength(5);
    });

    it("works with small order", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(5, 15);
      expect(result).toHaveLength(11);
      expect(result[0]!).toEqual({ key: 5, value: "v5" });
      expect(result[10]!).toEqual({ key: 15, value: "v15" });
    });

    it("handles partial overlap at start", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 5; i <= 15; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(1, 7);
      expect(result).toHaveLength(3);
    });

    it("handles partial overlap at end", () => {
      const tree = new BPlusTree<number, string>();
      for (let i = 5; i <= 15; i++) {
        tree.insert(i, `v${i}`);
      }
      const result = tree.range(13, 20);
      expect(result).toHaveLength(3);
    });
  });

  describe("keys, values, entries", () => {
    it("keys returns all keys in order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(1, "a");
      tree.insert(2, "b");
      expect(tree.keys()).toEqual([1, 2, 3]);
    });

    it("values returns all values in key order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(1, "a");
      tree.insert(2, "b");
      expect(tree.values()).toEqual(["a", "b", "c"]);
    });

    it("entries returns all entries in key order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(1, "a");
      tree.insert(2, "b");
      expect(tree.entries()).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("returns empty arrays for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.keys()).toEqual([]);
      expect(tree.values()).toEqual([]);
      expect(tree.entries()).toEqual([]);
    });

    it("works with many elements", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 50; i++) {
        tree.insert(i, `v${i}`);
      }
      const keys = tree.keys();
      const values = tree.values();
      expect(keys).toHaveLength(50);
      expect(values).toHaveLength(50);
      for (let i = 0; i < 50; i++) {
        expect(keys[i]).toBe(i);
        expect(values[i]).toBe(`v${i}`);
      }
    });
  });

  describe("forEach", () => {
    it("iterates all entries in order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(3, "c");
      tree.insert(1, "a");
      tree.insert(2, "b");
      const result: [number, string][] = [];
      tree.forEach((v, k) => result.push([k, v]));
      expect(result).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"],
      ]);
    });

    it("does not iterate empty tree", () => {
      const tree = new BPlusTree<number, string>();
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(0);
    });

    it("passes tree reference", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      let ref: BPlusTree<number, string> | undefined;
      tree.forEach((_v, _k, t) => {
        ref = t;
      });
      expect(ref).toBe(tree);
    });
  });

  describe("toArray", () => {
    it("returns entries as array", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      expect(tree.toArray()).toEqual(tree.entries());
    });

    it("returns empty array for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe("Symbol.iterator", () => {
    it("iterates all entries in order", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(2, "b");
      tree.insert(1, "a");
      tree.insert(3, "c");
      const result = [...tree];
      expect(result).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("yields nothing for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect([...tree]).toEqual([]);
    });

    it("works with for-of loop", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(2, "b");
      const keys: number[] = [];
      for (const entry of tree) {
        keys.push(entry.key);
      }
      expect(keys).toEqual([1, 2]);
    });

    it("works with many elements", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 30; i++) {
        tree.insert(i, `v${i}`);
      }
      const entries = [...tree];
      expect(entries).toHaveLength(30);
      for (let i = 0; i < 30; i++) {
        expect(entries[i]!.key).toBe(i);
      }
    });
  });

  describe("findFirstKey", () => {
    it("finds exact key", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(3, "c");
      tree.insert(5, "e");
      expect(tree.findFirstKey(3)).toEqual({ key: 3, value: "c" });
    });

    it("finds next key when exact not present", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(3, "c");
      tree.insert(5, "e");
      expect(tree.findFirstKey(2)).toEqual({ key: 3, value: "c" });
    });

    it("returns undefined when all keys are smaller", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(3, "c");
      expect(tree.findFirstKey(10)).toBeUndefined();
    });

    it("returns first key when searching for smaller value", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(5, "e");
      tree.insert(10, "j");
      expect(tree.findFirstKey(0)).toEqual({ key: 5, value: "e" });
    });

    it("returns undefined for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.findFirstKey(1)).toBeUndefined();
    });
  });

  describe("findLastKey", () => {
    it("finds exact key", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(3, "c");
      tree.insert(5, "e");
      expect(tree.findLastKey(3)).toEqual({ key: 3, value: "c" });
    });

    it("finds previous key when exact not present", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "a");
      tree.insert(3, "c");
      tree.insert(5, "e");
      expect(tree.findLastKey(4)).toEqual({ key: 3, value: "c" });
    });

    it("returns undefined when all keys are larger", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(5, "e");
      tree.insert(10, "j");
      expect(tree.findLastKey(1)).toBeUndefined();
    });

    it("returns last key when searching for larger value", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(5, "e");
      tree.insert(10, "j");
      expect(tree.findLastKey(100)).toEqual({ key: 10, value: "j" });
    });

    it("returns undefined for empty tree", () => {
      const tree = new BPlusTree<number, string>();
      expect(tree.findLastKey(1)).toBeUndefined();
    });
  });

  describe("custom comparator", () => {
    it("works with reverse comparator", () => {
      const tree = new BPlusTree<number, string>({
        comparator: (a, b) => b - a,
      });
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      expect(tree.get(1)).toBe("a");
      expect(tree.get(2)).toBe("b");
      expect(tree.get(3)).toBe("c");
      expect(tree.size).toBe(3);
    });

    it("works with string comparator", () => {
      const tree = new BPlusTree<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      tree.insert("banana", 2);
      tree.insert("apple", 1);
      tree.insert("cherry", 3);
      expect(tree.keys()).toEqual(["apple", "banana", "cherry"]);
    });
  });

  describe("stress tests", () => {
    it("handles sequential insert and delete", () => {
      const tree = new BPlusTree<number, number>(3);
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i);
      }
      expect(tree.size).toBe(100);
      for (let i = 0; i < 50; i++) {
        tree.delete(i);
      }
      expect(tree.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(tree.has(i)).toBe(false);
      }
      for (let i = 50; i < 100; i++) {
        expect(tree.has(i)).toBe(true);
      }
    });

    it("handles random order insert and delete", () => {
      const tree = new BPlusTree<number, number>(4);
      const items = Array.from({ length: 50 }, (_, i) => i);
      for (const i of items.sort(() => Math.random() - 0.5)) {
        tree.insert(i, i);
      }
      expect(tree.size).toBe(50);
      const toDelete = items.slice(0, 25).sort(() => Math.random() - 0.5);
      for (const i of toDelete) {
        tree.delete(i);
      }
      expect(tree.size).toBe(25);
    });

    it("handles insert-delete-reinsert cycle", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 20; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i);
      }
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `new${i}`);
      }
      expect(tree.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        if (i < 10) {
          expect(tree.get(i)).toBe(`new${i}`);
        } else {
          expect(tree.get(i)).toBe(`v${i}`);
        }
      }
    });

    it("maintains sorted order after many operations", () => {
      const tree = new BPlusTree<number, number>(3);
      for (let i = 0; i < 30; i++) {
        tree.insert(i * 2, i);
      }
      for (let i = 0; i < 15; i++) {
        tree.delete(i * 4);
      }
      const keys = tree.keys();
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true);
      }
    });

    it("handles large sequential insert", () => {
      const tree = new BPlusTree<number, number>(4);
      for (let i = 0; i < 200; i++) {
        tree.insert(i, i * 2);
      }
      expect(tree.size).toBe(200);
      expect(tree.min()).toEqual({ key: 0, value: 0 });
      expect(tree.max()).toEqual({ key: 199, value: 398 });
    });

    it("range query after deletions", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 30; i++) {
        tree.insert(i, `v${i}`);
      }
      for (let i = 10; i < 20; i++) {
        tree.delete(i);
      }
      const result = tree.range(5, 25);
      expect(result.length).toBe(11);
    });

    it("clear and rebuild", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 50; i++) {
        tree.insert(i, `v${i}`);
      }
      tree.clear();
      expect(tree.size).toBe(0);
      for (let i = 100; i < 110; i++) {
        tree.insert(i, `v${i}`);
      }
      expect(tree.size).toBe(10);
      for (let i = 100; i < 110; i++) {
        expect(tree.get(i)).toBe(`v${i}`);
      }
    });
  });

  describe("edge cases", () => {
    it("handles negative keys", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(-5, "neg5");
      tree.insert(0, "zero");
      tree.insert(5, "pos5");
      expect(tree.get(-5)).toBe("neg5");
      expect(tree.get(0)).toBe("zero");
      expect(tree.get(5)).toBe("pos5");
      expect(tree.min()).toEqual({ key: -5, value: "neg5" });
      expect(tree.max()).toEqual({ key: 5, value: "pos5" });
    });

    it("handles float keys", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1.5, "a");
      tree.insert(2.5, "b");
      tree.insert(0.5, "c");
      expect(tree.keys()).toEqual([0.5, 1.5, 2.5]);
    });

    it("handles boolean keys with comparator", () => {
      const tree = new BPlusTree<boolean, string>({
        comparator: (a, b) => (a === b ? 0 : a ? 1 : -1),
      });
      tree.insert(false, "no");
      tree.insert(true, "yes");
      expect(tree.get(false)).toBe("no");
      expect(tree.get(true)).toBe("yes");
    });

    it("handles single element operations", () => {
      const tree = new BPlusTree<number, string>();
      tree.insert(1, "one");
      expect(tree.has(1)).toBe(true);
      expect(tree.get(1)).toBe("one");
      expect(tree.min()).toEqual({ key: 1, value: "one" });
      expect(tree.max()).toEqual({ key: 1, value: "one" });
      expect(tree.delete(1)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });

    it("handles overwrite at boundary", () => {
      const tree = new BPlusTree<number, string>(3);
      tree.insert(1, "a");
      tree.insert(2, "b");
      tree.insert(3, "c");
      tree.insert(1, "new_a");
      expect(tree.get(1)).toBe("new_a");
      expect(tree.size).toBe(3);
    });
  });

  describe("linked leaf traversal", () => {
    it("keys maintains order through leaf links", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 20; i++) {
        tree.insert(i, `v${i}`);
      }
      const keys = tree.keys();
      for (let i = 0; i < keys.length - 1; i++) {
        expect(keys[i]! < keys[i + 1]!).toBe(true);
      }
    });

    it("entries are sorted via leaf chain after deletions", () => {
      const tree = new BPlusTree<number, string>(3);
      for (let i = 0; i < 20; i++) {
        tree.insert(i, `v${i}`);
      }
      tree.delete(5);
      tree.delete(10);
      tree.delete(15);
      const entries = tree.entries();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i]!.key > entries[i - 1]!.key).toBe(true);
      }
    });
  });

  describe("type safety", () => {
    it("works with complex value types", () => {
      const tree = new BPlusTree<number, { id: number; data: string[] }>();
      tree.insert(1, { id: 1, data: ["a", "b"] });
      tree.insert(2, { id: 2, data: ["c", "d"] });
      const entry = tree.get(1);
      expect(entry).toEqual({ id: 1, data: ["a", "b"] });
    });

    it("works with union value types", () => {
      const tree = new BPlusTree<string, number | string>();
      tree.insert("num", 42);
      tree.insert("str", "hello");
      expect(tree.get("num")).toBe(42);
      expect(tree.get("str")).toBe("hello");
    });
  });
});
