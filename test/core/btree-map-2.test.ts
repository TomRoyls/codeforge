import { describe, it, expect } from "vitest";
import { BTreeMap } from "../../src/core/btree-map-2/index.js";

describe("BTreeMap", () => {
  describe("constructor", () => {
    it("creates empty map with default order", () => {
      const map = new BTreeMap<number, string>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("creates map with numeric order", () => {
      const map = new BTreeMap<number, string>(4);
      expect(map.size).toBe(0);
    });

    it("creates map with options object", () => {
      const map = new BTreeMap<number, string>({ order: 8 });
      expect(map.size).toBe(0);
    });

    it("creates map with custom comparator", () => {
      const map = new BTreeMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      expect(map.size).toBe(0);
    });

    it("throws on order less than 2", () => {
      expect(() => new BTreeMap<number, string>(1)).toThrow(RangeError);
    });

    it("accepts order of 2", () => {
      const map = new BTreeMap<number, string>(2);
      map.set(1, "a");
      expect(map.get(1)).toBe("a");
    });

    it("accepts order of 3", () => {
      const map = new BTreeMap<number, string>(3);
      map.set(1, "a");
      map.set(2, "b");
      expect(map.size).toBe(2);
    });
  });

  describe("set and get", () => {
    it("sets and gets a single entry", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "one");
      expect(map.get(1)).toBe("one");
    });

    it("returns undefined for missing key", () => {
      const map = new BTreeMap<number, string>();
      expect(map.get(99)).toBeUndefined();
    });

    it("overwrites existing key", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "one");
      map.set(1, "uno");
      expect(map.get(1)).toBe("uno");
      expect(map.size).toBe(1);
    });

    it("sets multiple keys", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.get(1)).toBe("a");
      expect(map.get(2)).toBe("b");
      expect(map.get(3)).toBe("c");
    });

    it("sets keys in reverse order", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "c");
      map.set(2, "b");
      map.set(1, "a");
      expect(map.get(1)).toBe("a");
      expect(map.get(2)).toBe("b");
      expect(map.get(3)).toBe("c");
    });

    it("handles string keys", () => {
      const map = new BTreeMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
    });

    it("handles many insertions causing splits", () => {
      const map = new BTreeMap<number, number>(4);
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it("handles reverse order insertions", () => {
      const map = new BTreeMap<number, number>(4);
      for (let i = 99; i >= 0; i--) {
        map.set(i, i * 10);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it("handles random order insertions", () => {
      const map = new BTreeMap<number, number>(4);
      const nums = Array.from({ length: 100 }, (_, i) => i);
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      for (const n of nums) {
        map.set(n, n * 10);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it("sets with default order 32", () => {
      const map = new BTreeMap<number, string>();
      for (let i = 0; i < 50; i++) {
        map.set(i, `val${i}`);
      }
      expect(map.size).toBe(50);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "one");
      expect(map.has(1)).toBe(true);
    });

    it("returns false for missing key", () => {
      const map = new BTreeMap<number, string>();
      expect(map.has(1)).toBe(false);
    });

    it("returns false after key is deleted", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "one");
      map.delete(1);
      expect(map.has(1)).toBe(false);
    });
  });

  describe("size and isEmpty", () => {
    it("tracks size correctly", () => {
      const map = new BTreeMap<number, string>();
      expect(map.size).toBe(0);
      map.set(1, "a");
      expect(map.size).toBe(1);
      map.set(2, "b");
      expect(map.size).toBe(2);
    });

    it("does not increment size on overwrite", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(1, "b");
      expect(map.size).toBe(1);
    });

    it("isEmpty returns false after insert", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.isEmpty()).toBe(false);
    });

    it("isEmpty returns true after clear", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.clear();
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe("delete", () => {
    it("deletes a key from leaf", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.delete(1)).toBe(true);
      expect(map.get(1)).toBeUndefined();
      expect(map.size).toBe(0);
    });

    it("returns false for missing key", () => {
      const map = new BTreeMap<number, string>();
      expect(map.delete(1)).toBe(false);
    });

    it("deletes from map with multiple entries", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(2);
      expect(map.get(2)).toBeUndefined();
      expect(map.size).toBe(2);
    });

    it("deletes all entries", () => {
      const map = new BTreeMap<number, string>(4);
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`);
      }
      for (let i = 0; i < 20; i++) {
        expect(map.delete(i)).toBe(true);
      }
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("deletes in reverse order", () => {
      const map = new BTreeMap<number, string>(4);
      for (let i = 0; i < 20; i++) {
        map.set(i, `v${i}`);
      }
      for (let i = 19; i >= 0; i--) {
        expect(map.delete(i)).toBe(true);
      }
      expect(map.size).toBe(0);
    });

    it("maintains remaining entries after deletion", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(2);
      expect(map.get(1)).toBe("a");
      expect(map.get(3)).toBe("c");
    });

    it("handles delete from empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.delete(1)).toBe(false);
    });

    it("handles delete with small order causing merges", () => {
      const map = new BTreeMap<number, string>(3);
      for (let i = 1; i <= 10; i++) {
        map.set(i, `v${i}`);
      }
      expect(map.size).toBe(10);
      map.delete(5);
      expect(map.get(5)).toBeUndefined();
      expect(map.size).toBe(9);
      for (let i = 1; i <= 10; i++) {
        if (i !== 5) {
          expect(map.get(i)).toBe(`v${i}`);
        }
      }
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("allows set after clear", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.clear();
      map.set(2, "b");
      expect(map.get(2)).toBe("b");
      expect(map.size).toBe(1);
    });
  });

  describe("min and max", () => {
    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.min()).toBeUndefined();
      expect(map.max()).toBeUndefined();
    });

    it("returns min key", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      map.set(3, "b");
      map.set(7, "c");
      expect(map.min()).toEqual({ key: 3, value: "b" });
    });

    it("returns max key", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      map.set(3, "b");
      map.set(7, "c");
      expect(map.max()).toEqual({ key: 7, value: "c" });
    });

    it("returns same min and max for single entry", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.min()).toEqual({ key: 1, value: "a" });
      expect(map.max()).toEqual({ key: 1, value: "a" });
    });

    it("updates min after deletion", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(1);
      expect(map.min()).toEqual({ key: 2, value: "b" });
    });

    it("updates max after deletion", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      map.delete(3);
      expect(map.max()).toEqual({ key: 2, value: "b" });
    });
  });

  describe("floor", () => {
    it("returns exact match", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.floor(5)).toEqual({ key: 5, value: "a" });
    });

    it("returns floor value", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "a");
      map.set(7, "b");
      expect(map.floor(5)).toEqual({ key: 3, value: "a" });
    });

    it("returns undefined when no floor exists", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.floor(3)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.floor(5)).toBeUndefined();
    });

    it("returns last element when key is larger than all", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.floor(10)).toEqual({ key: 3, value: "c" });
    });
  });

  describe("ceiling", () => {
    it("returns exact match", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.ceiling(5)).toEqual({ key: 5, value: "a" });
    });

    it("returns ceiling value", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "a");
      map.set(7, "b");
      expect(map.ceiling(5)).toEqual({ key: 7, value: "b" });
    });

    it("returns undefined when no ceiling exists", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.ceiling(10)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.ceiling(5)).toBeUndefined();
    });

    it("returns first element when key is smaller than all", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      map.set(10, "b");
      expect(map.ceiling(1)).toEqual({ key: 5, value: "a" });
    });
  });

  describe("lower", () => {
    it("returns the greatest key strictly less than given key", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.lower(4)).toEqual({ key: 3, value: "b" });
    });

    it("returns undefined when no lower key exists", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.lower(3)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.lower(5)).toBeUndefined();
    });

    it("does not return exact match", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      map.set(3, "b");
      expect(map.lower(5)).toEqual({ key: 3, value: "b" });
    });
  });

  describe("higher", () => {
    it("returns the smallest key strictly greater than given key", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(3, "b");
      map.set(5, "c");
      expect(map.higher(2)).toEqual({ key: 3, value: "b" });
    });

    it("returns undefined when no higher key exists", () => {
      const map = new BTreeMap<number, string>();
      map.set(5, "a");
      expect(map.higher(10)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.higher(5)).toBeUndefined();
    });

    it("does not return exact match", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "a");
      map.set(5, "b");
      expect(map.higher(3)).toEqual({ key: 5, value: "b" });
    });
  });

  describe("range", () => {
    it("returns entries in range inclusive", () => {
      const map = new BTreeMap<number, string>();
      for (let i = 0; i < 10; i++) {
        map.set(i, `v${i}`);
      }
      const result = map.range(3, 7);
      expect(result).toEqual([
        { key: 3, value: "v3" },
        { key: 4, value: "v4" },
        { key: 5, value: "v5" },
        { key: 6, value: "v6" },
        { key: 7, value: "v7" },
      ]);
    });

    it("returns empty array for no matches", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(10, "b");
      expect(map.range(5, 8)).toEqual([]);
    });

    it("returns single entry range", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(5, "b");
      map.set(10, "c");
      expect(map.range(5, 5)).toEqual([{ key: 5, value: "b" }]);
    });

    it("returns empty array on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.range(1, 10)).toEqual([]);
    });

    it("returns full range", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.range(1, 3)).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("handles range with small order", () => {
      const map = new BTreeMap<number, string>(3);
      for (let i = 1; i <= 20; i++) {
        map.set(i, `v${i}`);
      }
      const result = map.range(5, 10);
      expect(result.length).toBe(6);
      expect(result[0]).toEqual({ key: 5, value: "v5" });
      expect(result[5]).toEqual({ key: 10, value: "v10" });
    });
  });

  describe("indexOf", () => {
    it("returns correct index for key", () => {
      const map = new BTreeMap<number, string>();
      map.set(10, "a");
      map.set(20, "b");
      map.set(30, "c");
      expect(map.indexOf(10)).toBe(0);
      expect(map.indexOf(20)).toBe(1);
      expect(map.indexOf(30)).toBe(2);
    });

    it("returns -1 for missing key", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.indexOf(99)).toBe(-1);
    });

    it("returns -1 on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.indexOf(1)).toBe(-1);
    });

    it("returns correct index with many entries", () => {
      const map = new BTreeMap<number, number>(4);
      for (let i = 0; i < 50; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 50; i++) {
        expect(map.indexOf(i)).toBe(i);
      }
    });
  });

  describe("at", () => {
    it("returns entry at index", () => {
      const map = new BTreeMap<number, string>();
      map.set(10, "a");
      map.set(20, "b");
      map.set(30, "c");
      expect(map.at(0)).toEqual({ key: 10, value: "a" });
      expect(map.at(1)).toEqual({ key: 20, value: "b" });
      expect(map.at(2)).toEqual({ key: 30, value: "c" });
    });

    it("returns undefined for out of bounds", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.at(-1)).toBeUndefined();
      expect(map.at(1)).toBeUndefined();
    });

    it("returns undefined on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.at(0)).toBeUndefined();
    });
  });

  describe("keys, values, entries", () => {
    it("returns keys in sorted order", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.keys()).toEqual([1, 2, 3]);
    });

    it("returns values in key order", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.values()).toEqual(["a", "b", "c"]);
    });

    it("returns entries in key order", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      expect(map.entries()).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
        { key: 3, value: "c" },
      ]);
    });

    it("returns empty arrays on empty map", () => {
      const map = new BTreeMap<number, string>();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe("toArray", () => {
    it("returns entries as array", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      expect(map.toArray()).toEqual([
        { key: 1, value: "a" },
        { key: 2, value: "b" },
      ]);
    });
  });

  describe("forEach", () => {
    it("iterates all entries in order", () => {
      const map = new BTreeMap<number, string>();
      map.set(3, "c");
      map.set(1, "a");
      map.set(2, "b");
      const collected: string[] = [];
      map.forEach((v, k) => {
        collected.push(`${k}:${v}`);
      });
      expect(collected).toEqual(["1:a", "2:b", "3:c"]);
    });

    it("passes map as third argument", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      let received: BTreeMap<number, string> | undefined;
      map.forEach((_v, _k, m) => {
        received = m;
      });
      expect(received).toBe(map);
    });

    it("does not iterate on empty map", () => {
      const map = new BTreeMap<number, string>();
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe("iterator", () => {
    it("iterates all entries with for-of", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      const collected: string[] = [];
      for (const entry of map) {
        collected.push(`${entry.key}:${entry.value}`);
      }
      expect(collected).toEqual(["1:a", "2:b", "3:c"]);
    });

    it("returns nothing for empty map", () => {
      const map = new BTreeMap<number, string>();
      const collected: string[] = [];
      for (const entry of map) {
        collected.push(`${entry.key}`);
      }
      expect(collected).toEqual([]);
    });

    it("iterator method returns same as Symbol.iterator", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      const iter = map.iterator();
      expect(iter.next()).toEqual({ value: { key: 1, value: "a" }, done: false });
      expect(iter.next().done).toBe(true);
    });
  });

  describe("custom comparator", () => {
    it("uses custom comparator for string keys", () => {
      const map = new BTreeMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      });
      map.set("banana", 2);
      map.set("apple", 1);
      map.set("cherry", 3);
      expect(map.keys()).toEqual(["apple", "banana", "cherry"]);
    });

    it("uses reverse comparator", () => {
      const map = new BTreeMap<number, string>({
        comparator: (a, b) => b - a,
      });
      map.set(1, "a");
      map.set(2, "b");
      map.set(3, "c");
      expect(map.keys()).toEqual([3, 2, 1]);
    });
  });

  describe("stress tests", () => {
    it("handles 1000 insertions and lookups", () => {
      const map = new BTreeMap<number, number>(4);
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 10);
      }
      expect(map.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(map.get(i)).toBe(i * 10);
      }
    });

    it("handles 500 insertions and deletions", () => {
      const map = new BTreeMap<number, number>(4);
      for (let i = 0; i < 500; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 250; i++) {
        map.delete(i);
      }
      expect(map.size).toBe(250);
      for (let i = 250; i < 500; i++) {
        expect(map.get(i)).toBe(i);
      }
      for (let i = 0; i < 250; i++) {
        expect(map.get(i)).toBeUndefined();
      }
    });

    it("entries remain sorted after mixed operations", () => {
      const map = new BTreeMap<number, string>(4);
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`);
      }
      for (let i = 10; i < 30; i++) {
        map.delete(i);
      }
      const keys = map.keys();
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1]!);
      }
    });
  });

  describe("edge cases", () => {
    it("handles zero as key", () => {
      const map = new BTreeMap<number, string>();
      map.set(0, "zero");
      expect(map.get(0)).toBe("zero");
    });

    it("handles negative keys", () => {
      const map = new BTreeMap<number, string>();
      map.set(-1, "neg");
      map.set(0, "zero");
      map.set(1, "pos");
      expect(map.keys()).toEqual([-1, 0, 1]);
    });

    it("handles object values", () => {
      const map = new BTreeMap<number, { name: string }>();
      map.set(1, { name: "test" });
      expect(map.get(1)?.name).toBe("test");
    });

    it("handles null values", () => {
      const map = new BTreeMap<number, string | null>();
      map.set(1, null);
      expect(map.get(1)).toBeNull();
    });

    it("handles undefined values", () => {
      const map = new BTreeMap<number, string | undefined>();
      map.set(1, undefined);
      expect(map.has(1)).toBe(true);
      expect(map.get(1)).toBeUndefined();
    });

    it("delete from map with single element", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      expect(map.delete(1)).toBe(true);
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("set after delete works", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.delete(1);
      map.set(1, "b");
      expect(map.get(1)).toBe("b");
      expect(map.size).toBe(1);
    });
  });

  describe("generics with different types", () => {
    it("works with number keys and boolean values", () => {
      const map = new BTreeMap<number, boolean>();
      map.set(1, true);
      map.set(2, false);
      expect(map.get(1)).toBe(true);
      expect(map.get(2)).toBe(false);
    });

    it("works with string keys and array values", () => {
      const map = new BTreeMap<string, number[]>();
      map.set("a", [1, 2, 3]);
      map.set("b", [4, 5, 6]);
      expect(map.get("a")).toEqual([1, 2, 3]);
    });
  });

  describe("duplicate key handling", () => {
    it("updates value on duplicate key without size change", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "first");
      map.set(1, "second");
      map.set(1, "third");
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe("third");
    });

    it("preserves other entries on overwrite", () => {
      const map = new BTreeMap<number, string>();
      map.set(1, "a");
      map.set(2, "b");
      map.set(1, "c");
      expect(map.size).toBe(2);
      expect(map.get(1)).toBe("c");
      expect(map.get(2)).toBe("b");
    });
  });

  describe("large range queries", () => {
    it("range returns correct subset across nodes", () => {
      const map = new BTreeMap<number, number>(3);
      for (let i = 1; i <= 30; i++) {
        map.set(i, i * 100);
      }
      const result = map.range(10, 20);
      expect(result.length).toBe(11);
      expect(result[0]).toEqual({ key: 10, value: 1000 });
      expect(result[10]).toEqual({ key: 20, value: 2000 });
    });

    it("indexOf and at are consistent", () => {
      const map = new BTreeMap<number, string>(4);
      for (let i = 0; i < 30; i++) {
        map.set(i, `v${i}`);
      }
      for (let i = 0; i < 30; i++) {
        const idx = map.indexOf(i);
        expect(idx).toBe(i);
        const entry = map.at(idx);
        expect(entry).toEqual({ key: i, value: `v${i}` });
      }
    });
  });

  describe("order variants", () => {
    it("works with order 5", () => {
      const map = new BTreeMap<number, string>(5);
      for (let i = 0; i < 50; i++) {
        map.set(i, `v${i}`);
      }
      expect(map.size).toBe(50);
      expect(map.min()?.key).toBe(0);
      expect(map.max()?.key).toBe(49);
    });

    it("works with order 64", () => {
      const map = new BTreeMap<number, string>(64);
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`);
      }
      expect(map.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(map.has(i)).toBe(true);
      }
    });
  });
});
