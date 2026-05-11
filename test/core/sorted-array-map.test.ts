import { describe, it, expect } from "vitest";
import { SortedArrayMap } from "../../src/core/sorted-array-map/index.js";

describe("SortedArrayMap", () => {
  describe("constructor", () => {
    it("creates empty map", () => {
      const map = new SortedArrayMap();
      expect(map.size).toBe(0);
    });

    it("creates map with custom comparator", () => {
      const map = new SortedArrayMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      map.set("banana", 2);
      map.set("apple", 1);
      expect(map.keys()).toEqual(["apple", "banana"]);
    });

    it("creates map with entries", () => {
      const map = new SortedArrayMap<number, string>(undefined, [
        { key: 3, value: "three" },
        { key: 1, value: "one" },
        { key: 2, value: "two" },
      ]);
      expect(map.size).toBe(3);
      expect(map.keys()).toEqual([1, 2, 3]);
    });

    it("creates map with comparator and entries", () => {
      const map = new SortedArrayMap<number, string>(
        { comparator: (a, b) => b - a },
        [{ key: 1, value: "a" }, { key: 3, value: "c" }, { key: 2, value: "b" }],
      );
      expect(map.keys()).toEqual([3, 2, 1]);
    });
  });

  describe("set", () => {
    it("adds a key-value pair", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      expect(map.get(1)).toBe("one");
    });

    it("maintains sorted order", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(3, "three");
      map.set(1, "one");
      map.set(2, "two");
      expect(map.keys()).toEqual([1, 2, 3]);
    });

    it("overwrites existing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      map.set(1, "uno");
      expect(map.get(1)).toBe("uno");
      expect(map.size).toBe(1);
    });

    it("returns this for chaining", () => {
      const map = new SortedArrayMap<number, string>();
      const result = map.set(1, "a");
      expect(result).toBe(map);
    });

    it("handles multiple sets on same key", () => {
      const map = new SortedArrayMap<number, number>();
      map.set(5, 50);
      map.set(5, 51);
      map.set(5, 52);
      expect(map.size).toBe(1);
      expect(map.get(5)).toBe(52);
    });

    it("handles negative keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(-1, "neg");
      map.set(0, "zero");
      map.set(1, "pos");
      expect(map.keys()).toEqual([-1, 0, 1]);
    });

    it("handles zero key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(0, "zero");
      expect(map.get(0)).toBe("zero");
    });

    it("handles floating point keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1.5, "a");
      map.set(1.1, "b");
      map.set(1.9, "c");
      expect(map.keys()).toEqual([1.1, 1.5, 1.9]);
    });

    it("handles string keys with custom comparator", () => {
      const map = new SortedArrayMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      map.set("cherry", 3);
      map.set("apple", 1);
      map.set("banana", 2);
      expect(map.keys()).toEqual(["apple", "banana", "cherry"]);
    });

    it("handles many insertions maintaining order", () => {
      const map = new SortedArrayMap<number, number>();
      for (let i = 100; i >= 1; i--) {
        map.set(i, i);
      }
      const keys = map.keys();
      for (let i = 0; i < keys.length - 1; i++) {
        expect(keys[i]).toBeLessThan(keys[i + 1]);
      }
    });
  });

  describe("get", () => {
    it("returns value for existing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      expect(map.get(1)).toBe("one");
    });

    it("returns undefined for missing key", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.get(1)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.get(42)).toBeUndefined();
    });

    it("returns updated value after overwrite", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "old");
      map.set(1, "new");
      expect(map.get(1)).toBe("new");
    });

    it("returns correct values for multiple keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.get(1)).toBe("a");
      expect(map.get(2)).toBe("b");
      expect(map.get(3)).toBe("c");
    });

    it("handles undefined values", () => {
      const map = new SortedArrayMap<number, string | undefined>();
      map.set(1, undefined);
      expect(map.get(1)).toBeUndefined();
      expect(map.has(1)).toBe(true);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      expect(map.has(1)).toBe(true);
    });

    it("returns false for missing key", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it("returns false on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it("returns false after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      map.delete(1);
      expect(map.has(1)).toBe(false);
    });

    it("returns true after overwrite", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(1, "b");
      expect(map.has(1)).toBe(true);
    });
  });

  describe("delete", () => {
    it("removes existing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "one");
      expect(map.delete(1)).toBe(true);
      expect(map.has(1)).toBe(false);
    });

    it("returns false for missing key", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.delete(1)).toBe(false);
    });

    it("deletes from beginning", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(1);
      expect(map.keys()).toEqual([2, 3]);
    });

    it("deletes from middle", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(2);
      expect(map.keys()).toEqual([1, 3]);
    });

    it("deletes from end", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(3);
      expect(map.keys()).toEqual([1, 2]);
    });

    it("maintains order after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.set(4, "d");
      map.delete(2);
      expect(map.keys()).toEqual([1, 3, 4]);
    });

    it("deletes all elements one by one", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(2);
      map.delete(1);
      map.delete(3);
      expect(map.size).toBe(0);
    });
  });

  describe("size", () => {
    it("returns 0 for empty map", () => {
      const map = new SortedArrayMap();
      expect(map.size).toBe(0);
    });

    it("returns correct count after additions", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      expect(map.size).toBe(2);
    });

    it("does not increase on overwrite", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(1, "b");
      expect(map.size).toBe(1);
    });

    it("decreases after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.delete(1);
      expect(map.size).toBe(1);
    });
  });

  describe("isEmpty", () => {
    it("returns true for empty map", () => {
      const map = new SortedArrayMap();
      expect(map.isEmpty()).toBe(true);
    });

    it("returns false after adding element", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      expect(map.isEmpty()).toBe(false);
    });

    it("returns true after clearing all elements", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("works on already empty map", () => {
      const map = new SortedArrayMap<number, string>();
      map.clear();
      expect(map.size).toBe(0);
    });

    it("allows reuse after clear", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.clear();
      map.set(2, "b");
      expect(map.size).toBe(1);
      expect(map.get(2)).toBe("b");
    });
  });

  describe("min", () => {
    it("returns undefined for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.min()).toBeUndefined();
    });

    it("returns smallest key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(3, "b");
      map.set(7, "c");
      expect(map.min()).toBe(3);
    });

    it("returns only key in single-entry map", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(42, "a");
      expect(map.min()).toBe(42);
    });

    it("updates after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.delete(1);
      expect(map.min()).toBe(2);
    });
  });

  describe("max", () => {
    it("returns undefined for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.max()).toBeUndefined();
    });

    it("returns largest key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(3, "b");
      map.set(7, "c");
      expect(map.max()).toBe(7);
    });

    it("returns only key in single-entry map", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(42, "a");
      expect(map.max()).toBe(42);
    });

    it("updates after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.delete(2);
      expect(map.max()).toBe(1);
    });
  });

  describe("floor", () => {
    it("returns key if exact match", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.floor(3)).toBe(3);
    });

    it("returns largest key less than target", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.floor(3)).toBe(1);
    });

    it("returns undefined if all keys greater", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(10, "b");
      expect(map.floor(3)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.floor(3)).toBeUndefined();
    });

    it("returns max when target exceeds all keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.floor(100)).toBe(5);
    });
  });

  describe("ceiling", () => {
    it("returns key if exact match", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.ceiling(3)).toBe(3);
    });

    it("returns smallest key greater than target", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.ceiling(3)).toBe(5);
    });

    it("returns undefined if all keys less", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.ceiling(10)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.ceiling(3)).toBeUndefined();
    });

    it("returns min when target below all keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(10, "b");
      expect(map.ceiling(0)).toBe(5);
    });
  });

  describe("lower", () => {
    it("returns key strictly less than target (exact exists)", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.lower(3)).toBe(1);
    });

    it("returns key strictly less than target (no exact)", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.lower(3)).toBe(1);
    });

    it("returns undefined if no lower key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      expect(map.lower(5)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.lower(3)).toBeUndefined();
    });

    it("returns key when target is above all", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      expect(map.lower(100)).toBe(3);
    });
  });

  describe("higher", () => {
    it("returns key strictly greater than target (exact exists)", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.higher(3)).toBe(5);
    });

    it("returns key strictly greater than target (no exact)", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.higher(3)).toBe(5);
    });

    it("returns undefined if no higher key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      expect(map.higher(5)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.higher(3)).toBeUndefined();
    });

    it("returns key when target is below all", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(10, "b");
      expect(map.higher(0)).toBe(5);
    });
  });

  describe("range", () => {
    it("returns entries within range inclusive", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.set(4, "d");
      map.set(5, "e");
      const result = map.range(2, 4);
      expect(result).toEqual([
        { key: 2, value: "b" },
        { key: 3, value: "c" },
        { key: 4, value: "d" },
      ]);
    });

    it("returns empty array for no matches", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      expect(map.range(2, 4)).toEqual([]);
    });

    it("returns empty array on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.range(1, 5)).toEqual([]);
    });

    it("returns single entry when lo equals hi", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.range(2, 2)).toEqual([{ key: 2, value: "b" }]);
    });

    it("returns all entries for full range", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.range(1, 3)).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("handles range beyond existing keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(2, "b");
      map.set(3, "c");
      expect(map.range(1, 10)).toEqual([
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("returns empty when lo > hi", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      expect(map.range(3, 1)).toEqual([]);
    });
  });

  describe("indexOf", () => {
    it("returns index of existing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(10, "a");
      map.set(20, "b");
      map.set(30, "c");
      expect(map.indexOf(10)).toBe(0);
      expect(map.indexOf(20)).toBe(1);
      expect(map.indexOf(30)).toBe(2);
    });

    it("returns -1 for missing key", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      expect(map.indexOf(2)).toBe(-1);
    });

    it("returns -1 on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.indexOf(1)).toBe(-1);
    });

    it("returns correct index after delete", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(1);
      expect(map.indexOf(2)).toBe(0);
      expect(map.indexOf(3)).toBe(1);
    });
  });

  describe("keys", () => {
    it("returns empty array for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.keys()).toEqual([]);
    });

    it("returns sorted keys", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.keys()).toEqual([1, 2, 3]);
    });

    it("returns a copy", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      const keys = map.keys();
      keys.push(999);
      expect(map.keys()).toEqual([1]);
    });
  });

  describe("values", () => {
    it("returns empty array for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.values()).toEqual([]);
    });

    it("returns values in key order", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.values()).toEqual(["a", "b", "c"]);
    });

    it("returns a copy", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      const vals = map.values();
      vals.push("x");
      expect(map.values()).toEqual(["a"]);
    });
  });

  describe("entries", () => {
    it("returns empty array for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect(map.entries()).toEqual([]);
    });

    it("returns key-value pairs in order", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.entries()).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("returns a copy", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      const entries = map.entries();
      entries.push({ key: 999, value: "x" });
      expect(map.entries()).toEqual([{ key: 1, value: "a" }]);
    });
  });

  describe("toArray", () => {
    it("returns same as entries", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      expect(map.toArray()).toEqual(map.entries());
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      const result: string[] = [];
      map.forEach((value, key) => {
        result.push(`${key}:${value}`);
      });
      expect(result).toEqual(["1:a", "2:b", "3:c"]);
    });

    it("passes map as third argument", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.forEach((_value, _key, m) => {
        expect(m).toBe(map);
      });
    });

    it("does not iterate on empty map", () => {
      const map = new SortedArrayMap<number, string>();
      let count = 0;
      map.forEach(() => { count++; });
      expect(count).toBe(0);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      const result = [...map];
      expect(result).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
      ]);
    });

    it("works with for...of", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      const result: string[] = [];
      for (const entry of map) {
        result.push(entry.value);
      }
      expect(result).toEqual(["a", "b"]);
    });

    it("produces no entries for empty map", () => {
      const map = new SortedArrayMap<number, string>();
      expect([...map]).toEqual([]);
    });

    it("produces independent iterators", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      const iter1 = map[Symbol.iterator]();
      const iter2 = map[Symbol.iterator]();
      expect(iter1.next()).toEqual({ value: { key: 1, value: "a" }, done: false });
      expect(iter2.next()).toEqual({ value: { key: 1, value: "a" }, done: false });
      expect(iter1.next()).toEqual({ value: { key: 2, value: "b" }, done: false });
      expect(iter2.next()).toEqual({ value: { key: 2, value: "b" }, done: false });
    });
  });

  describe("integration", () => {
    it("handles large dataset", () => {
      const map = new SortedArrayMap<number, number>();
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 10);
      }
      expect(map.size).toBe(1000);
      expect(map.min()).toBe(0);
      expect(map.max()).toBe(999);
      expect(map.get(500)).toBe(5000);
    });

    it("handles reverse comparator", () => {
      const map = new SortedArrayMap<number, string>({
        comparator: (a, b) => b - a,
      });
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.keys()).toEqual([3, 2, 1]);
      expect(map.min()).toBe(3);
      expect(map.max()).toBe(1);
    });

    it("handles string keys with reverse order", () => {
      const map = new SortedArrayMap<string, number>({
        comparator: (a, b) => b.localeCompare(a),
      });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.keys()).toEqual(["c", "b", "a"]);
    });

    it("supports mixed operations", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "five");
      map.set(1, "one");
      map.set(3, "three");
      map.delete(3);
      map.set(2, "two");
      map.set(4, "four");
      map.delete(1);
      expect(map.size).toBe(3);
      expect(map.keys()).toEqual([2, 4, 5]);
      expect(map.get(2)).toBe("two");
      expect(map.get(4)).toBe("four");
      expect(map.get(5)).toBe("five");
    });

    it("works with object values", () => {
      const map = new SortedArrayMap<number, { name: string }>();
      map.set(1, { name: "first" });
      map.set(2, { name: "second" });
      expect(map.get(1)?.name).toBe("first");
      expect(map.get(2)?.name).toBe("second");
    });

    it("works with null values", () => {
      const map = new SortedArrayMap<number, string | null>();
      map.set(1, null);
      expect(map.get(1)).toBeNull();
      expect(map.has(1)).toBe(true);
    });

    it("range works after deletes", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.set(4, "d");
      map.set(5, "e");
      map.delete(3);
      const result = map.range(2, 4);
      expect(result).toEqual([
        { key: 2, value: "b" },
        { key: 4, value: "d" },
      ]);
    });

    it("forEach respects insertion-independent order", () => {
      const map = new SortedArrayMap<number, number>();
      map.set(10, 10);
      map.set(1, 1);
      map.set(5, 5);
      const keys: number[] = [];
      map.forEach((_v, k) => keys.push(k));
      expect(keys).toEqual([1, 5, 10]);
    });

    it("binary search correctness with duplicates handling", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(5, "a");
      map.set(5, "b");
      map.set(5, "c");
      expect(map.size).toBe(1);
      expect(map.get(5)).toBe("c");
    });

    it("handles deleting non-existent keys between operations", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(1, "a");
      map.set(3, "c");
      expect(map.delete(2)).toBe(false);
      expect(map.size).toBe(2);
      expect(map.keys()).toEqual([1, 3]);
    });

    it("correct floor/ceiling with negative numbers", () => {
      const map = new SortedArrayMap<number, string>();
      map.set(-5, "a");
      map.set(0, "b");
      map.set(5, "c");
      expect(map.floor(-2)).toBe(-5);
      expect(map.ceiling(-2)).toBe(0);
      expect(map.lower(-2)).toBe(-5);
      expect(map.higher(-2)).toBe(0);
    });
  });
});
