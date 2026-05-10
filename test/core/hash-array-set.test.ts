import { describe, it, expect } from "vitest";
import { HashArraySet } from "../../src/core/hash-array-set/hash-array-set.js";

describe("HashArraySet", () => {
  describe("constructor", () => {
    it("creates with default capacity and load factor", () => {
      const set = new HashArraySet<number>();
      expect(set.capacity).toBe(16);
      expect(set.loadFactorValue).toBe(0.75);
      expect(set.size).toBe(0);
    });

    it("creates with custom capacity and load factor via positional args", () => {
      const set = new HashArraySet<number>(32, 0.5);
      expect(set.capacity).toBe(32);
      expect(set.loadFactorValue).toBe(0.5);
    });

    it("creates with options object", () => {
      const set = new HashArraySet<number>({ capacity: 64, loadFactor: 0.6 });
      expect(set.capacity).toBe(64);
      expect(set.loadFactorValue).toBe(0.6);
    });

    it("creates with partial options - only capacity", () => {
      const set = new HashArraySet<number>({ capacity: 8 });
      expect(set.capacity).toBe(8);
      expect(set.loadFactorValue).toBe(0.75);
    });

    it("creates with partial options - only loadFactor", () => {
      const set = new HashArraySet<number>({ loadFactor: 0.9 });
      expect(set.capacity).toBe(16);
      expect(set.loadFactorValue).toBe(0.9);
    });

    it("creates with empty options", () => {
      const set = new HashArraySet<number>({});
      expect(set.capacity).toBe(16);
      expect(set.loadFactorValue).toBe(0.75);
    });

    it("defaults to empty set", () => {
      const set = new HashArraySet<string>();
      expect(set.isEmpty).toBe(true);
      expect(set.size).toBe(0);
    });
  });

  describe("add", () => {
    it("adds an item and increases size", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.size).toBe(1);
    });

    it("returns this for chaining", () => {
      const set = new HashArraySet<number>();
      const result = set.add(1);
      expect(result).toBe(set);
    });

    it("does not add duplicates", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(1).add(1);
      expect(set.size).toBe(1);
    });

    it("adds multiple distinct items", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      expect(set.size).toBe(3);
    });

    it("handles string items", () => {
      const set = new HashArraySet<string>();
      set.add("hello").add("world");
      expect(set.size).toBe(2);
    });

    it("handles null values", () => {
      const set = new HashArraySet<null>();
      set.add(null);
      expect(set.size).toBe(1);
      expect(set.has(null)).toBe(true);
    });

    it("handles undefined values", () => {
      const set = new HashArraySet<undefined>();
      set.add(undefined);
      expect(set.size).toBe(1);
      expect(set.has(undefined)).toBe(true);
    });

    it("handles boolean values", () => {
      const set = new HashArraySet<boolean>();
      set.add(true).add(false);
      expect(set.size).toBe(2);
    });

    it("handles object references", () => {
      const set = new HashArraySet<object>();
      const obj = { key: "value" };
      set.add(obj);
      expect(set.has(obj)).toBe(true);
      expect(set.size).toBe(1);
    });

    it("different object references are distinct items", () => {
      const set = new HashArraySet<object>();
      set.add({ key: "a" }).add({ key: "b" });
      expect(set.size).toBe(2);
    });

    it("adds zero correctly", () => {
      const set = new HashArraySet<number>();
      set.add(0);
      expect(set.has(0)).toBe(true);
    });

    it("adds empty string correctly", () => {
      const set = new HashArraySet<string>();
      set.add("");
      expect(set.has("")).toBe(true);
    });
  });

  describe("delete", () => {
    it("removes an existing item", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.delete(1)).toBe(true);
      expect(set.size).toBe(0);
    });

    it("returns false for non-existent item", () => {
      const set = new HashArraySet<number>();
      expect(set.delete(1)).toBe(false);
    });

    it("removes item and leaves others intact", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      set.delete(2);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(false);
      expect(set.has(3)).toBe(true);
      expect(set.size).toBe(2);
    });

    it("does not affect duplicate delete calls", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.delete(1)).toBe(true);
      expect(set.delete(1)).toBe(false);
    });

    it("removes string items", () => {
      const set = new HashArraySet<string>();
      set.add("hello");
      expect(set.delete("hello")).toBe(true);
      expect(set.has("hello")).toBe(false);
    });

    it("removes boolean items", () => {
      const set = new HashArraySet<boolean>();
      set.add(true);
      expect(set.delete(true)).toBe(true);
      expect(set.has(true)).toBe(false);
    });
  });

  describe("has", () => {
    it("returns true for existing item", () => {
      const set = new HashArraySet<number>();
      set.add(42);
      expect(set.has(42)).toBe(true);
    });

    it("returns false for non-existent item", () => {
      const set = new HashArraySet<number>();
      expect(set.has(42)).toBe(false);
    });

    it("returns false after item deleted", () => {
      const set = new HashArraySet<number>();
      set.add(5);
      set.delete(5);
      expect(set.has(5)).toBe(false);
    });

    it("works with string items", () => {
      const set = new HashArraySet<string>();
      set.add("test");
      expect(set.has("test")).toBe(true);
      expect(set.has("other")).toBe(false);
    });

    it("works with null", () => {
      const set = new HashArraySet<null>();
      set.add(null);
      expect(set.has(null)).toBe(true);
    });

    it("works with undefined", () => {
      const set = new HashArraySet<undefined>();
      set.add(undefined);
      expect(set.has(undefined)).toBe(true);
    });
  });

  describe("size", () => {
    it("returns 0 for empty set", () => {
      const set = new HashArraySet<number>();
      expect(set.size).toBe(0);
    });

    it("tracks size correctly after adds", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      expect(set.size).toBe(3);
    });

    it("tracks size correctly after deletes", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      set.delete(2);
      expect(set.size).toBe(2);
    });

    it("tracks size correctly after clear", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2);
      set.clear();
      expect(set.size).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("returns true for new set", () => {
      const set = new HashArraySet<number>();
      expect(set.isEmpty).toBe(true);
    });

    it("returns false after add", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.isEmpty).toBe(false);
    });

    it("returns true after deleting all items", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      set.delete(1);
      expect(set.isEmpty).toBe(true);
    });

    it("returns true after clear", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      set.clear();
      expect(set.isEmpty).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all items", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty).toBe(true);
    });

    it("works on already empty set", () => {
      const set = new HashArraySet<number>();
      set.clear();
      expect(set.size).toBe(0);
    });

    it("allows adding after clear", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      set.clear();
      set.add(2);
      expect(set.size).toBe(1);
      expect(set.has(2)).toBe(true);
      expect(set.has(1)).toBe(false);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty set", () => {
      const set = new HashArraySet<number>();
      expect(set.toArray()).toEqual([]);
    });

    it("returns all items", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      const arr = set.toArray();
      expect(arr).toHaveLength(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });

    it("returns new array each call", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      const a = set.toArray();
      const b = set.toArray();
      expect(a).not.toBe(b);
    });

    it("reflects mutations", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2);
      set.delete(1);
      const arr = set.toArray();
      expect(arr).toHaveLength(1);
      expect(arr).toContain(2);
    });
  });

  describe("forEach", () => {
    it("iterates all items", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      const collected: number[] = [];
      set.forEach((item) => collected.push(item));
      expect(collected).toHaveLength(3);
      expect(collected).toContain(1);
      expect(collected).toContain(2);
      expect(collected).toContain(3);
    });

    it("provides correct indices", () => {
      const set = new HashArraySet<number>();
      set.add(10).add(20).add(30);
      const indices: number[] = [];
      set.forEach((_item, idx) => indices.push(idx));
      expect(indices).toEqual([0, 1, 2]);
    });

    it("does nothing for empty set", () => {
      const set = new HashArraySet<number>();
      let called = false;
      set.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2);
      const result = [...set];
      expect(result).toHaveLength(2);
      expect(result).toContain(1);
      expect(result).toContain(2);
    });

    it("works with for-of", () => {
      const set = new HashArraySet<number>();
      set.add(10).add(20);
      const collected: number[] = [];
      for (const item of set) {
        collected.push(item);
      }
      expect(collected).toHaveLength(2);
    });

    it("works with empty set", () => {
      const set = new HashArraySet<number>();
      const result = [...set];
      expect(result).toEqual([]);
    });

    it("works with spread in array", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2).add(3);
      const arr = [...set];
      expect(arr).toHaveLength(3);
    });

    it("works with Array.from", () => {
      const set = new HashArraySet<number>();
      set.add(5).add(6);
      const arr = Array.from(set);
      expect(arr).toHaveLength(2);
    });
  });

  describe("addMany", () => {
    it("adds multiple items from array", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      expect(set.size).toBe(3);
    });

    it("ignores duplicates", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 1, 2, 2, 3]);
      expect(set.size).toBe(3);
    });

    it("returns this for chaining", () => {
      const set = new HashArraySet<number>();
      const result = set.addMany([1, 2]);
      expect(result).toBe(set);
    });

    it("works with empty iterable", () => {
      const set = new HashArraySet<number>();
      set.addMany([]);
      expect(set.size).toBe(0);
    });

    it("works with another set", () => {
      const a = new HashArraySet<number>();
      a.add(1).add(2);
      const b = new HashArraySet<number>();
      b.addMany(a);
      expect(b.size).toBe(2);
    });

    it("works with generator", () => {
      function* gen() {
        yield 10;
        yield 20;
        yield 30;
      }
      const set = new HashArraySet<number>();
      set.addMany(gen());
      expect(set.size).toBe(3);
    });
  });

  describe("deleteMany", () => {
    it("removes multiple items", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3, 4, 5]);
      const result = set.deleteMany([1, 3, 5]);
      expect(result).toBe(true);
      expect(set.size).toBe(2);
      expect(set.has(2)).toBe(true);
      expect(set.has(4)).toBe(true);
    });

    it("returns false if nothing was removed", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.deleteMany([2, 3])).toBe(false);
    });

    it("returns true if at least one removed", () => {
      const set = new HashArraySet<number>();
      set.add(1).add(2);
      expect(set.deleteMany([1, 99])).toBe(true);
    });

    it("works with empty iterable", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      expect(set.deleteMany([])).toBe(false);
    });
  });

  describe("union", () => {
    it("returns union of two sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4, 5]);
      const result = a.union(b);
      expect(result.size).toBe(5);
    });

    it("does not modify original sets", () => {
      const a = new HashArraySet<number>();
      a.add(1);
      const b = new HashArraySet<number>();
      b.add(2);
      a.union(b);
      expect(a.size).toBe(1);
      expect(b.size).toBe(1);
    });

    it("union with empty set returns copy", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      const result = a.union(b);
      expect(result.size).toBe(2);
    });

    it("empty set union with non-empty", () => {
      const a = new HashArraySet<number>();
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      const result = a.union(b);
      expect(result.size).toBe(3);
    });

    it("union of identical sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      const result = a.union(b);
      expect(result.size).toBe(3);
    });
  });

  describe("intersection", () => {
    it("returns intersection of two sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3, 4]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4, 5, 6]);
      const result = a.intersection(b);
      expect(result.size).toBe(2);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);
    });

    it("returns empty for disjoint sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4]);
      const result = a.intersection(b);
      expect(result.isEmpty).toBe(true);
    });

    it("does not modify original sets", () => {
      const a = new HashArraySet<number>();
      a.add(1);
      const b = new HashArraySet<number>();
      b.add(1);
      a.intersection(b);
      expect(a.size).toBe(1);
      expect(b.size).toBe(1);
    });

    it("intersection with empty set returns empty", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      const result = a.intersection(b);
      expect(result.isEmpty).toBe(true);
    });

    it("identical sets intersection returns same items", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      const result = a.intersection(b);
      expect(result.size).toBe(3);
    });
  });

  describe("difference", () => {
    it("returns items in a but not b", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3, 4]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4, 5]);
      const result = a.difference(b);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });

    it("returns copy when no overlap", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4]);
      const result = a.difference(b);
      expect(result.size).toBe(2);
    });

    it("returns empty when a is subset of b", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3, 4]);
      const result = a.difference(b);
      expect(result.isEmpty).toBe(true);
    });

    it("does not modify original sets", () => {
      const a = new HashArraySet<number>();
      a.add(1);
      const b = new HashArraySet<number>();
      b.add(1);
      a.difference(b);
      expect(a.size).toBe(1);
      expect(b.size).toBe(1);
    });
  });

  describe("isSubsetOf", () => {
    it("returns true for subset", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3, 4]);
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("returns true for equal sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2]);
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("returns false for non-subset", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 5]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      expect(a.isSubsetOf(b)).toBe(false);
    });

    it("empty set is subset of any set", () => {
      const a = new HashArraySet<number>();
      const b = new HashArraySet<number>();
      b.addMany([1, 2]);
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("empty set is subset of empty set", () => {
      const a = new HashArraySet<number>();
      const b = new HashArraySet<number>();
      expect(a.isSubsetOf(b)).toBe(true);
    });
  });

  describe("isSupersetOf", () => {
    it("returns true for superset", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3, 4]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2]);
      expect(a.isSupersetOf(b)).toBe(true);
    });

    it("returns true for equal sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2]);
      expect(a.isSupersetOf(b)).toBe(true);
    });

    it("returns false for non-superset", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      expect(a.isSupersetOf(b)).toBe(false);
    });

    it("any set is superset of empty set", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      expect(a.isSupersetOf(b)).toBe(true);
    });
  });

  describe("equals", () => {
    it("returns true for equal sets", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different sizes", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([1, 2, 3]);
      expect(a.equals(b)).toBe(false);
    });

    it("returns false for same size different items", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2]);
      const b = new HashArraySet<number>();
      b.addMany([3, 4]);
      expect(a.equals(b)).toBe(false);
    });

    it("empty sets are equal", () => {
      const a = new HashArraySet<number>();
      const b = new HashArraySet<number>();
      expect(a.equals(b)).toBe(true);
    });

    it("order does not matter", () => {
      const a = new HashArraySet<number>();
      a.add(1).add(2).add(3);
      const b = new HashArraySet<number>();
      b.add(3).add(2).add(1);
      expect(a.equals(b)).toBe(true);
    });
  });

  describe("map", () => {
    it("transforms items", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      const result = set.map((x) => x * 2);
      expect(result.size).toBe(3);
      expect(result.has(2)).toBe(true);
      expect(result.has(4)).toBe(true);
      expect(result.has(6)).toBe(true);
    });

    it("deduplicates mapped values", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, -1, 2, -2]);
      const result = set.map((x) => Math.abs(x));
      expect(result.size).toBe(2);
    });

    it("does not modify original", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2]);
      set.map((x) => x * 10);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
    });

    it("works with type transformation", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      const result = set.map((x) => `item-${x}`);
      expect(result.has("item-1")).toBe(true);
      expect(result.has("item-2")).toBe(true);
    });

    it("handles empty set", () => {
      const set = new HashArraySet<number>();
      const result = set.map((x) => x * 2);
      expect(result.isEmpty).toBe(true);
    });
  });

  describe("filter", () => {
    it("filters items by predicate", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3, 4, 5]);
      const result = set.filter((x) => x % 2 === 0);
      expect(result.size).toBe(2);
      expect(result.has(2)).toBe(true);
      expect(result.has(4)).toBe(true);
    });

    it("returns empty when nothing matches", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 3, 5]);
      const result = set.filter((x) => x % 2 === 0);
      expect(result.isEmpty).toBe(true);
    });

    it("does not modify original", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      set.filter((x) => x > 1);
      expect(set.size).toBe(3);
    });

    it("handles empty set", () => {
      const set = new HashArraySet<number>();
      const result = set.filter(() => true);
      expect(result.isEmpty).toBe(true);
    });

    it("returns copy when all match", () => {
      const set = new HashArraySet<number>();
      set.addMany([2, 4, 6]);
      const result = set.filter((x) => x % 2 === 0);
      expect(result.size).toBe(3);
    });
  });

  describe("capacity and loadFactor", () => {
    it("capacity returns current capacity", () => {
      const set = new HashArraySet<number>({ capacity: 32 });
      expect(set.capacity).toBe(32);
    });

    it("loadFactorValue returns configured load factor", () => {
      const set = new HashArraySet<number>({ loadFactor: 0.5 });
      expect(set.loadFactorValue).toBe(0.5);
    });
  });

  describe("bucketCount", () => {
    it("returns 0 for empty set", () => {
      const set = new HashArraySet<number>();
      expect(set.bucketCount).toBe(0);
    });

    it("returns number of non-empty buckets", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      const bc = set.bucketCount;
      expect(bc).toBeGreaterThan(0);
      expect(bc).toBeLessThanOrEqual(set.capacity);
    });

    it("decreases when items deleted", () => {
      const set = new HashArraySet<number>();
      set.add(1);
      const before = set.bucketCount;
      set.delete(1);
      const after = set.bucketCount;
      expect(after).toBeLessThan(before);
    });
  });

  describe("resize", () => {
    it("resizes to new capacity", () => {
      const set = new HashArraySet<number>({ capacity: 4 });
      set.addMany([1, 2, 3]);
      set.resize(32);
      expect(set.capacity).toBe(32);
      expect(set.size).toBe(3);
    });

    it("preserves all items after resize", () => {
      const set = new HashArraySet<number>({ capacity: 4 });
      set.addMany([1, 2, 3, 4, 5, 6, 7, 8]);
      set.resize(64);
      expect(set.size).toBe(8);
      for (let i = 1; i <= 8; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it("resize to smaller capacity", () => {
      const set = new HashArraySet<number>({ capacity: 32 });
      set.addMany([1, 2, 3]);
      set.resize(8);
      expect(set.capacity).toBe(8);
      expect(set.size).toBe(3);
    });

    it("resize to same capacity is no-op on items", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3]);
      set.resize(16);
      expect(set.size).toBe(3);
    });
  });

  describe("auto-resize", () => {
    it("auto-resizes when load factor exceeded", () => {
      const set = new HashArraySet<number>({ capacity: 4, loadFactor: 0.75 });
      set.addMany([1, 2, 3, 4]);
      expect(set.capacity).toBeGreaterThan(4);
    });

    it("preserves items across auto-resize", () => {
      const set = new HashArraySet<number>({ capacity: 2, loadFactor: 0.75 });
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true);
      }
    });
  });

  describe("stress tests", () => {
    it("handles large number of items", () => {
      const set = new HashArraySet<number>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        set.add(i);
      }
      expect(set.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it("handles add and delete cycle", () => {
      const set = new HashArraySet<number>();
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      for (let i = 0; i < 50; i++) {
        set.delete(i);
      }
      expect(set.size).toBe(50);
      for (let i = 50; i < 100; i++) {
        expect(set.has(i)).toBe(true);
      }
      for (let i = 0; i < 50; i++) {
        expect(set.has(i)).toBe(false);
      }
    });

    it("handles mixed operations", () => {
      const set = new HashArraySet<number>();
      set.addMany([1, 2, 3, 4, 5]);
      set.delete(3);
      set.add(6);
      set.delete(1);
      set.add(7);
      expect(set.size).toBe(5);
      expect(set.has(2)).toBe(true);
      expect(set.has(4)).toBe(true);
      expect(set.has(5)).toBe(true);
      expect(set.has(6)).toBe(true);
      expect(set.has(7)).toBe(true);
    });

    it("set algebra chain", () => {
      const a = new HashArraySet<number>();
      a.addMany([1, 2, 3, 4, 5]);
      const b = new HashArraySet<number>();
      b.addMany([4, 5, 6, 7, 8]);
      const u = a.union(b);
      expect(u.size).toBe(8);
      const inter = a.intersection(b);
      expect(inter.size).toBe(2);
      const diff = a.difference(b);
      expect(diff.size).toBe(3);
      expect(diff.isSubsetOf(a)).toBe(true);
      expect(a.isSupersetOf(diff)).toBe(true);
    });
  });
});
