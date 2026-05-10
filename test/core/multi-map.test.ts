import { describe, it, expect, beforeEach } from "vitest";
import { MultiMap } from "../../src/core/multi-map/multi-map.js";
import { DEFAULT_MULTI_MAP_OPTIONS } from "../../src/core/multi-map/types.js";
import type { MultiMapOptions, MultiMapStatistics } from "../../src/core/multi-map/types.js";

describe("MultiMap", () => {
  let mm: MultiMap<string, number>;

  beforeEach(() => {
    mm = new MultiMap<string, number>();
  });

  describe("constructor", () => {
    it("creates empty MultiMap with default options", () => {
      const m = new MultiMap<string, number>();
      expect(m.size).toBe(0);
      expect(m.valueCount).toBe(0);
      expect(m.isEmpty()).toBe(true);
    });

    it("accepts custom options", () => {
      const m = new MultiMap<string, number>({ allowDuplicateValues: true });
      expect(m.size).toBe(0);
    });

    it("accepts empty options object", () => {
      const m = new MultiMap<string, number>({});
      expect(m.size).toBe(0);
    });

    it("accepts undefined options", () => {
      const m = new MultiMap<string, number>(undefined);
      expect(m.size).toBe(0);
    });

    it("merges partial options with defaults", () => {
      const m = new MultiMap<string, number>({ allowDuplicateValues: true });
      m.set("a", 1);
      m.set("a", 1);
      expect(m.count("a")).toBe(2);
    });
  });

  describe("DEFAULT_MULTI_MAP_OPTIONS", () => {
    it("has allowDuplicateValues false by default", () => {
      expect(DEFAULT_MULTI_MAP_OPTIONS.allowDuplicateValues).toBe(false);
    });
  });

  describe("set", () => {
    it("adds a value for a new key", () => {
      mm.set("a", 1);
      expect(mm.get("a")).toEqual([1]);
    });

    it("adds multiple values for the same key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("a", 3);
      expect(mm.get("a")).toEqual([1, 2, 3]);
    });

    it("returns this for chaining", () => {
      const result = mm.set("a", 1);
      expect(result).toBe(mm);
    });

    it("supports chaining multiple sets", () => {
      mm.set("a", 1).set("b", 2).set("c", 3);
      expect(mm.size).toBe(3);
    });

    it("prevents duplicate values by default", () => {
      mm.set("a", 1);
      mm.set("a", 1);
      expect(mm.get("a")).toEqual([1]);
    });

    it("allows duplicate values when option is set", () => {
      const m = new MultiMap<string, number>({ allowDuplicateValues: true });
      m.set("a", 1);
      m.set("a", 1);
      expect(m.get("a")).toEqual([1, 1]);
    });

    it("allows different values for same key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      expect(mm.get("a")).toEqual([1, 2]);
    });

    it("works with object keys", () => {
      const m = new MultiMap<object, number>();
      const obj = { id: 1 };
      m.set(obj, 10);
      expect(m.get(obj)).toEqual([10]);
    });

    it("works with number keys", () => {
      const m = new MultiMap<number, string>();
      m.set(1, "one");
      m.set(2, "two");
      expect(m.size).toBe(2);
    });

    it("works with object values", () => {
      const m = new MultiMap<string, object>();
      m.set("a", { x: 1 });
      m.set("a", { x: 2 });
      expect(m.get("a")).toEqual([{ x: 1 }, { x: 2 }]);
    });
  });

  describe("get", () => {
    it("returns undefined for nonexistent key", () => {
      expect(mm.get("z")).toBeUndefined();
    });

    it("returns array copy for existing key", () => {
      mm.set("a", 1);
      const result = mm.get("a");
      expect(result).toEqual([1]);
    });

    it("returned array is a copy not reference", () => {
      mm.set("a", 1);
      const arr = mm.get("a");
      arr!.push(99);
      expect(mm.get("a")).toEqual([1]);
    });

    it("returns all values for key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("a", 3);
      expect(mm.get("a")).toEqual([1, 2, 3]);
    });
  });

  describe("delete", () => {
    it("removes entire key and all values", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      expect(mm.delete("a")).toBe(true);
      expect(mm.has("a")).toBe(false);
    });

    it("returns false for nonexistent key", () => {
      expect(mm.delete("z")).toBe(false);
    });

    it("returns true for existing key", () => {
      mm.set("a", 1);
      expect(mm.delete("a")).toBe(true);
    });

    it("does not affect other keys", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.delete("a");
      expect(mm.has("b")).toBe(true);
      expect(mm.has("a")).toBe(false);
    });
  });

  describe("deleteValue", () => {
    it("removes specific value from key's collection", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("a", 3);
      expect(mm.deleteValue("a", 2)).toBe(true);
      expect(mm.get("a")).toEqual([1, 3]);
    });

    it("returns false for nonexistent key", () => {
      expect(mm.deleteValue("z", 1)).toBe(false);
    });

    it("returns false for nonexistent value", () => {
      mm.set("a", 1);
      expect(mm.deleteValue("a", 99)).toBe(false);
    });

    it("removes key when last value is deleted", () => {
      mm.set("a", 1);
      mm.deleteValue("a", 1);
      expect(mm.has("a")).toBe(false);
    });

    it("does not affect other values", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.deleteValue("a", 1);
      expect(mm.get("a")).toEqual([2]);
    });

    it("does not affect other keys", () => {
      mm.set("a", 1);
      mm.set("b", 1);
      mm.deleteValue("a", 1);
      expect(mm.has("b")).toBe(true);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      mm.set("a", 1);
      expect(mm.has("a")).toBe(true);
    });

    it("returns false for nonexistent key", () => {
      expect(mm.has("z")).toBe(false);
    });

    it("returns false after delete", () => {
      mm.set("a", 1);
      mm.delete("a");
      expect(mm.has("a")).toBe(false);
    });

    it("returns false after all values removed", () => {
      mm.set("a", 1);
      mm.deleteValue("a", 1);
      expect(mm.has("a")).toBe(false);
    });
  });

  describe("hasValue", () => {
    it("returns true when key-value pair exists", () => {
      mm.set("a", 1);
      expect(mm.hasValue("a", 1)).toBe(true);
    });

    it("returns false when key exists but value does not", () => {
      mm.set("a", 1);
      expect(mm.hasValue("a", 99)).toBe(false);
    });

    it("returns false when key does not exist", () => {
      expect(mm.hasValue("z", 1)).toBe(false);
    });

    it("returns false after value is deleted", () => {
      mm.set("a", 1);
      mm.deleteValue("a", 1);
      expect(mm.hasValue("a", 1)).toBe(false);
    });

    it("finds value among multiple", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("a", 3);
      expect(mm.hasValue("a", 2)).toBe(true);
    });
  });

  describe("size", () => {
    it("returns 0 for empty map", () => {
      expect(mm.size).toBe(0);
    });

    it("returns number of unique keys", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("b", 3);
      expect(mm.size).toBe(2);
    });

    it("decreases after delete", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.delete("a");
      expect(mm.size).toBe(1);
    });

    it("returns 0 after clear", () => {
      mm.set("a", 1);
      mm.clear();
      expect(mm.size).toBe(0);
    });
  });

  describe("valueCount", () => {
    it("returns 0 for empty map", () => {
      expect(mm.valueCount).toBe(0);
    });

    it("counts all values across all keys", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("b", 3);
      expect(mm.valueCount).toBe(3);
    });

    it("decreases after deleteValue", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.deleteValue("a", 1);
      expect(mm.valueCount).toBe(1);
    });

    it("decreases after delete", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.delete("a");
      expect(mm.valueCount).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("returns true for empty map", () => {
      expect(mm.isEmpty()).toBe(true);
    });

    it("returns false after adding", () => {
      mm.set("a", 1);
      expect(mm.isEmpty()).toBe(false);
    });

    it("returns true after removing all", () => {
      mm.set("a", 1);
      mm.delete("a");
      expect(mm.isEmpty()).toBe(true);
    });

    it("returns true after clear", () => {
      mm.set("a", 1);
      mm.clear();
      expect(mm.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("removes all keys and values", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.clear();
      expect(mm.size).toBe(0);
      expect(mm.valueCount).toBe(0);
    });

    it("works on already empty map", () => {
      mm.clear();
      expect(mm.size).toBe(0);
    });

    it("allows adding after clear", () => {
      mm.set("a", 1);
      mm.clear();
      mm.set("b", 2);
      expect(mm.size).toBe(1);
      expect(mm.get("b")).toEqual([2]);
    });
  });

  describe("keys", () => {
    it("returns empty iterator for empty map", () => {
      const result = [...mm.keys()];
      expect(result).toEqual([]);
    });

    it("returns all keys", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.set("c", 3);
      const result = [...mm.keys()];
      expect(result.sort()).toEqual(["a", "b", "c"]);
    });

    it("returns unique keys only", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      const result = [...mm.keys()];
      expect(result).toEqual(["a"]);
    });
  });

  describe("values", () => {
    it("returns empty array for empty map", () => {
      expect(mm.values()).toEqual([]);
    });

    it("returns flattened values", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("b", 3);
      const result = mm.values();
      expect(result.sort()).toEqual([1, 2, 3]);
    });
  });

  describe("entries", () => {
    it("returns empty iterator for empty map", () => {
      const result = [...mm.entries()];
      expect(result).toEqual([]);
    });

    it("returns key-value array pairs", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      const result = [...mm.entries()];
      expect(result).toEqual([["a", [1, 2]]]);
    });

    it("returns copies of value arrays", () => {
      mm.set("a", 1);
      const [, arr] = [...mm.entries()][0]!;
      arr.push(99);
      expect(mm.get("a")).toEqual([1]);
    });
  });

  describe("forEach", () => {
    it("iterates over all keys", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      const keys: string[] = [];
      mm.forEach((key) => keys.push(key));
      expect(keys.sort()).toEqual(["a", "b"]);
    });

    it("provides values copy", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      let values: number[] = [];
      mm.forEach((_, v) => { values = v; });
      expect(values).toEqual([1, 2]);
    });

    it("provides map reference", () => {
      mm.set("a", 1);
      let ref: MultiMap<string, number> | undefined;
      mm.forEach((_, __, m) => { ref = m; });
      expect(ref).toBe(mm);
    });

    it("does not iterate on empty map", () => {
      let called = false;
      mm.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe("Symbol.iterator", () => {
    it("yields nothing for empty map", () => {
      expect([...mm]).toEqual([]);
    });

    it("yields individual key-value pairs", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("b", 3);
      const result = [...mm];
      expect(result).toEqual([
        ["a", 1],
        ["a", 2],
        ["b", 3],
      ]);
    });

    it("works with for-of", () => {
      mm.set("x", 10);
      mm.set("x", 20);
      const pairs: [string, number][] = [];
      for (const pair of mm) {
        pairs.push(pair);
      }
      expect(pairs).toEqual([["x", 10], ["x", 20]]);
    });

    it("works with destructuring in for-of", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      const result: string[] = [];
      for (const [key, val] of mm) {
        result.push(`${key}:${val}`);
      }
      expect(result).toEqual(["a:1", "b:2"]);
    });
  });

  describe("count", () => {
    it("returns 0 for nonexistent key", () => {
      expect(mm.count("z")).toBe(0);
    });

    it("returns number of values for key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("a", 3);
      expect(mm.count("a")).toBe(3);
    });

    it("returns 1 for single value", () => {
      mm.set("a", 1);
      expect(mm.count("a")).toBe(1);
    });

    it("decreases after deleteValue", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.deleteValue("a", 1);
      expect(mm.count("a")).toBe(1);
    });

    it("returns 0 after all values deleted", () => {
      mm.set("a", 1);
      mm.deleteValue("a", 1);
      expect(mm.count("a")).toBe(0);
    });
  });

  describe("replace", () => {
    it("replaces all values for existing key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.replace("a", [10, 20, 30]);
      expect(mm.get("a")).toEqual([10, 20, 30]);
    });

    it("creates new key if it does not exist", () => {
      mm.replace("a", [1, 2]);
      expect(mm.get("a")).toEqual([1, 2]);
    });

    it("returns this for chaining", () => {
      const result = mm.replace("a", [1]);
      expect(result).toBe(mm);
    });

    it("can replace with empty array", () => {
      mm.set("a", 1);
      mm.replace("a", []);
      expect(mm.get("a")).toEqual([]);
      expect(mm.has("a")).toBe(true);
    });

    it("stores a copy of the array", () => {
      const arr = [1, 2, 3];
      mm.replace("a", arr);
      arr.push(99);
      expect(mm.get("a")).toEqual([1, 2, 3]);
    });
  });

  describe("merge", () => {
    it("merges another MultiMap", () => {
      const other = new MultiMap<string, number>();
      other.set("a", 1);
      other.set("b", 2);
      mm.merge(other);
      expect(mm.get("a")).toEqual([1]);
      expect(mm.get("b")).toEqual([2]);
    });

    it("appends values for existing keys", () => {
      mm.set("a", 1);
      const other = new MultiMap<string, number>();
      other.set("a", 2);
      mm.merge(other);
      expect(mm.get("a")).toEqual([1, 2]);
    });

    it("returns this for chaining", () => {
      const other = new MultiMap<string, number>();
      const result = mm.merge(other);
      expect(result).toBe(mm);
    });

    it("merges empty MultiMap with no effect", () => {
      mm.set("a", 1);
      const other = new MultiMap<string, number>();
      mm.merge(other);
      expect(mm.size).toBe(1);
    });

    it("respects duplicate prevention during merge", () => {
      mm.set("a", 1);
      const other = new MultiMap<string, number>();
      other.set("a", 1);
      mm.merge(other);
      expect(mm.get("a")).toEqual([1]);
    });

    it("allows duplicates during merge when option is set", () => {
      const m = new MultiMap<string, number>({ allowDuplicateValues: true });
      m.set("a", 1);
      const other = new MultiMap<string, number>({ allowDuplicateValues: true });
      other.set("a", 1);
      m.merge(other);
      expect(m.get("a")).toEqual([1, 1]);
    });
  });

  describe("clone", () => {
    it("creates independent copy", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      const cloned = mm.clone();
      expect(cloned.size).toBe(mm.size);
      expect(cloned.get("a")).toEqual([1]);
      expect(cloned.get("b")).toEqual([2]);
    });

    it("modifications to clone do not affect original", () => {
      mm.set("a", 1);
      const cloned = mm.clone();
      cloned.set("a", 2);
      expect(mm.get("a")).toEqual([1]);
      expect(cloned.get("a")).toEqual([1, 2]);
    });

    it("modifications to original do not affect clone", () => {
      mm.set("a", 1);
      const cloned = mm.clone();
      mm.delete("a");
      expect(cloned.has("a")).toBe(true);
    });

    it("preserves options", () => {
      const m = new MultiMap<string, number>({ allowDuplicateValues: true });
      m.set("a", 1);
      const cloned = m.clone();
      cloned.set("a", 1);
      expect(cloned.get("a")).toEqual([1, 1]);
    });

    it("clones statistics", () => {
      mm.set("a", 1);
      mm.delete("a");
      const cloned = mm.clone();
      expect(cloned.getStatistics()).toEqual(mm.getStatistics());
    });

    it("statistics changes are independent", () => {
      mm.set("a", 1);
      const cloned = mm.clone();
      cloned.set("b", 2);
      expect(mm.getStatistics().valuesAdded).toBe(1);
      expect(cloned.getStatistics().valuesAdded).toBe(2);
    });
  });

  describe("getStatistics", () => {
    it("returns initial statistics", () => {
      const stats = mm.getStatistics();
      expect(stats.keysAdded).toBe(0);
      expect(stats.keysRemoved).toBe(0);
      expect(stats.valuesAdded).toBe(0);
      expect(stats.valuesRemoved).toBe(0);
    });

    it("tracks keysAdded", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      expect(mm.getStatistics().keysAdded).toBe(2);
    });

    it("does not increment keysAdded for same key", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      expect(mm.getStatistics().keysAdded).toBe(1);
    });

    it("tracks keysRemoved on delete", () => {
      mm.set("a", 1);
      mm.delete("a");
      expect(mm.getStatistics().keysRemoved).toBe(1);
    });

    it("tracks keysRemoved on last deleteValue", () => {
      mm.set("a", 1);
      mm.deleteValue("a", 1);
      expect(mm.getStatistics().keysRemoved).toBe(1);
    });

    it("tracks valuesAdded", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.set("b", 3);
      expect(mm.getStatistics().valuesAdded).toBe(3);
    });

    it("does not count duplicate prevention as add", () => {
      mm.set("a", 1);
      mm.set("a", 1);
      expect(mm.getStatistics().valuesAdded).toBe(1);
    });

    it("tracks valuesRemoved on deleteValue", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.deleteValue("a", 1);
      expect(mm.getStatistics().valuesRemoved).toBe(1);
    });

    it("tracks valuesRemoved on delete", () => {
      mm.set("a", 1);
      mm.set("a", 2);
      mm.delete("a");
      expect(mm.getStatistics().valuesRemoved).toBe(2);
    });

    it("tracks valuesRemoved on clear", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.clear();
      expect(mm.getStatistics().valuesRemoved).toBe(2);
    });

    it("tracks keysRemoved on clear", () => {
      mm.set("a", 1);
      mm.set("b", 2);
      mm.clear();
      expect(mm.getStatistics().keysRemoved).toBe(2);
    });

    it("returns a copy", () => {
      mm.set("a", 1);
      const stats = mm.getStatistics();
      mm.set("b", 2);
      expect(stats.keysAdded).toBe(1);
    });

    it("tracks replace adding new key", () => {
      mm.replace("a", [1, 2]);
      expect(mm.getStatistics().keysAdded).toBe(1);
      expect(mm.getStatistics().valuesAdded).toBe(2);
    });

    it("tracks replace of existing key", () => {
      mm.set("a", 1);
      mm.replace("a", [10, 20]);
      expect(mm.getStatistics().valuesRemoved).toBe(1);
      expect(mm.getStatistics().valuesAdded).toBe(3);
    });
  });

  describe("MultiMapStatistics type", () => {
    it("has correct shape", () => {
      const stats: MultiMapStatistics = {
        keysAdded: 0,
        keysRemoved: 0,
        valuesAdded: 0,
        valuesRemoved: 0,
      };
      expect(stats.keysAdded).toBe(0);
      expect(stats.keysRemoved).toBe(0);
      expect(stats.valuesAdded).toBe(0);
      expect(stats.valuesRemoved).toBe(0);
    });
  });

  describe("MultiMapOptions type", () => {
    it("has correct shape with allowDuplicateValues", () => {
      const opts: MultiMapOptions = { allowDuplicateValues: true };
      expect(opts.allowDuplicateValues).toBe(true);
    });

    it("allows empty object", () => {
      const opts: MultiMapOptions = {};
      expect(opts.allowDuplicateValues).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles null-like values correctly", () => {
      const m = new MultiMap<string, number | null>();
      m.set("a", null);
      expect(m.get("a")).toEqual([null]);
    });

    it("handles undefined values", () => {
      const m = new MultiMap<string, number | undefined>();
      m.set("a", undefined);
      expect(m.get("a")).toEqual([undefined]);
    });

    it("handles boolean values", () => {
      const m = new MultiMap<string, boolean>();
      m.set("a", true);
      m.set("a", false);
      expect(m.get("a")).toEqual([true, false]);
    });

    it("handles empty string keys", () => {
      mm.set("", 1);
      expect(mm.get("")).toEqual([1]);
    });

    it("handles zero keys", () => {
      const m = new MultiMap<number, string>();
      m.set(0, "zero");
      expect(m.get(0)).toEqual(["zero"]);
    });

    it("handles large number of values", () => {
      for (let i = 0; i < 100; i++) {
        mm.set("a", i);
      }
      expect(mm.count("a")).toBe(100);
    });

    it("handles large number of keys", () => {
      for (let i = 0; i < 100; i++) {
        mm.set(`key-${i}`, i);
      }
      expect(mm.size).toBe(100);
    });

    it("delete on empty map returns false", () => {
      expect(mm.delete("nonexistent")).toBe(false);
    });

    it("deleteValue on empty map returns false", () => {
      expect(mm.deleteValue("nonexistent", 1)).toBe(false);
    });

    it("repeated deleteValue returns false after first removal", () => {
      mm.set("a", 1);
      expect(mm.deleteValue("a", 1)).toBe(true);
      expect(mm.deleteValue("a", 1)).toBe(false);
    });
  });
});
