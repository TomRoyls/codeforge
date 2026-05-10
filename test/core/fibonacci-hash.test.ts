import { describe, it, expect } from "vitest";
import { FibonacciHashMap } from "../../src/core/fibonacci-hash/fibonacci-hash.js";

describe("FibonacciHashMap", () => {
  describe("construction", () => {
    it("creates with default options", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
      expect(map.capacity).toBe(16);
    });

    it("creates with custom capacity", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 32 });
      expect(map.capacity).toBe(32);
    });

    it("creates with custom loadFactor", () => {
      const map = new FibonacciHashMap<string, number>({ loadFactor: 0.5 });
      expect(map.isEmpty()).toBe(true);
    });

    it("creates with linear probing strategy", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "linear" });
      expect(map.size).toBe(0);
    });

    it("creates with quadratic probing strategy", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "quadratic" });
      expect(map.size).toBe(0);
    });

    it("creates with double hashing strategy", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "double" });
      expect(map.size).toBe(0);
    });

    it("creates with all custom options", () => {
      const map = new FibonacciHashMap<string, number>({
        capacity: 64,
        loadFactor: 0.6,
        probingStrategy: "quadratic",
      });
      expect(map.capacity).toBe(64);
    });
  });

  describe("set and get basics", () => {
    it("sets and gets a value", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      expect(map.get("a")).toBe(1);
    });

    it("returns undefined for missing key", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.get("missing")).toBeUndefined();
    });

    it("overwrites existing key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("a", 2);
      expect(map.get("a")).toBe(2);
      expect(map.size).toBe(1);
    });

    it("sets multiple key-value pairs", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
      expect(map.size).toBe(3);
    });

    it("handles numeric keys", () => {
      const map = new FibonacciHashMap<number, string>();
      map.set(1, "one");
      map.set(2, "two");
      expect(map.get(1)).toBe("one");
      expect(map.get(2)).toBe("two");
    });

    it("handles object-like keys via toString", () => {
      const map = new FibonacciHashMap<number, string>();
      map.set(42, "answer");
      expect(map.get(42)).toBe("answer");
    });

    it("set updates size correctly", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.size).toBe(0);
      map.set("x", 10);
      expect(map.size).toBe(1);
      map.set("y", 20);
      expect(map.size).toBe(2);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      expect(map.has("a")).toBe(true);
    });

    it("returns false for missing key", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.has("a")).toBe(false);
    });

    it("returns false after delete", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.has("a")).toBe(false);
    });
  });

  describe("delete", () => {
    it("deletes an existing key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      expect(map.delete("a")).toBe(true);
      expect(map.size).toBe(0);
      expect(map.get("a")).toBeUndefined();
    });

    it("returns false for missing key", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.delete("missing")).toBe(false);
    });

    it("delete only removes specified key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.get("b")).toBe(2);
      expect(map.size).toBe(1);
    });

    it("handles delete and reinsert", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.get("a")).toBeUndefined();
      map.set("a", 99);
      expect(map.get("a")).toBe(99);
      expect(map.size).toBe(1);
    });

    it("decrements size on delete", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      expect(map.size).toBe(2);
      map.delete("a");
      expect(map.size).toBe(1);
      map.delete("b");
      expect(map.size).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("returns true when empty", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.isEmpty()).toBe(true);
    });

    it("returns false when not empty", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      expect(map.isEmpty()).toBe(false);
    });

    it("returns true after clearing all entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("clear allows reinsertion", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.clear();
      map.set("a", 2);
      expect(map.get("a")).toBe(2);
      expect(map.size).toBe(1);
    });
  });

  describe("linear probing", () => {
    it("handles collisions with linear probing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0, probingStrategy: "linear" });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("deletes and retrieves with linear probing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0, probingStrategy: "linear" });
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.get("b")).toBe(2);
    });
  });

  describe("quadratic probing", () => {
    it("handles collisions with quadratic probing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 8, loadFactor: 1.0, probingStrategy: "quadratic" });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.set("d", 4);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
      expect(map.get("d")).toBe(4);
    });

    it("deletes and reinserts with quadratic probing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 8, loadFactor: 1.0, probingStrategy: "quadratic" });
      map.set("x", 10);
      map.set("y", 20);
      map.delete("x");
      map.set("x", 30);
      expect(map.get("x")).toBe(30);
      expect(map.get("y")).toBe(20);
    });
  });

  describe("double hashing", () => {
    it("handles collisions with double hashing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 8, loadFactor: 1.0, probingStrategy: "double" });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("deletes and looks up with double hashing", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 8, loadFactor: 1.0, probingStrategy: "double" });
      map.set("p", 100);
      map.set("q", 200);
      map.delete("p");
      expect(map.has("p")).toBe(false);
      expect(map.get("q")).toBe(200);
    });
  });

  describe("hash distribution", () => {
    it("distributes keys without extreme skew", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 64, loadFactor: 1.0 });
      for (let i = 0; i < 100; i++) {
        map.set(`key_${i}`, i);
      }
      const stats = map.getStatistics();
      expect(stats.maxProbeLength).toBeLessThan(20);
    });

    it("spreads keys across buckets", () => {
      const capacity = 64;
      const map = new FibonacciHashMap<string, number>({ capacity, loadFactor: 1.0 });
      for (let i = 0; i < 50; i++) {
        map.set(`spread_${i}`, i);
      }
      expect(map.size).toBe(50);
    });
  });

  describe("collision statistics", () => {
    it("tracks collisions", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0 });
      map.set("a", 1);
      map.set("b", 2);
      const stats = map.getStatistics();
      expect(typeof stats.collisions).toBe("number");
    });

    it("tracks resizes", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i);
      }
      const stats = map.getStatistics();
      expect(stats.resizes).toBeGreaterThan(0);
    });

    it("tracks tombstones", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 16, loadFactor: 0.75 });
      map.set("a", 1);
      map.delete("a");
      const stats = map.getStatistics();
      expect(stats.tombstones).toBe(1);
    });

    it("tracks max probe length", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0 });
      map.set("a", 1);
      const stats = map.getStatistics();
      expect(stats.maxProbeLength).toBeGreaterThanOrEqual(1);
    });

    it("tracks total probes", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.get("a");
      const stats = map.getStatistics();
      expect(stats.totalProbes).toBeGreaterThan(0);
    });

    it("returns zero stats for empty map", () => {
      const map = new FibonacciHashMap<string, number>();
      const stats = map.getStatistics();
      expect(stats.collisions).toBe(0);
      expect(stats.resizes).toBe(0);
      expect(stats.tombstones).toBe(0);
      expect(stats.maxProbeLength).toBe(0);
      expect(stats.totalProbes).toBe(0);
    });
  });

  describe("auto-resize", () => {
    it("resizes when loadFactor exceeded", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.capacity).toBeGreaterThan(4);
    });

    it("preserves entries after resize", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("increments resize count", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i);
      }
      expect(map.getStatistics().resizes).toBeGreaterThan(0);
    });
  });

  describe("tombstone handling", () => {
    it("skips tombstones on lookup", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0 });
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.get("b")).toBe(2);
    });

    it("allows reinsert after delete", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      map.set("a", 2);
      expect(map.get("a")).toBe(2);
    });

    it("tombstones count tracked correctly", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.delete("a");
      map.delete("b");
      expect(map.getStatistics().tombstones).toBe(2);
    });

    it("tombstones cleared on resize", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.5 });
      map.set("a", 1);
      map.delete("a");
      expect(map.getStatistics().tombstones).toBe(1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.getStatistics().tombstones).toBe(0);
    });

    it("has returns false for tombstoned key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.has("a")).toBe(false);
    });

    it("delete returns false for already deleted key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.delete("a")).toBe(false);
    });
  });

  describe("keys, values, entries", () => {
    it("returns all keys", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      const keys = map.keys();
      expect(keys).toHaveLength(3);
      expect(keys.sort()).toEqual(["a", "b", "c"]);
    });

    it("returns all values", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      const values = map.values();
      expect(values).toHaveLength(3);
      expect(values.sort()).toEqual([1, 2, 3]);
    });

    it("returns all entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const entries = map.entries();
      expect(entries).toHaveLength(2);
    });

    it("skips tombstones in keys", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.keys()).toHaveLength(1);
    });

    it("skips tombstones in values", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.values()).toHaveLength(1);
    });

    it("skips tombstones in entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.entries()).toHaveLength(1);
    });

    it("returns empty arrays for empty map", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe("forEach", () => {
    it("iterates all entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      const result: Array<[string, number]> = [];
      map.forEach((v, k) => result.push([k, v]));
      expect(result).toHaveLength(3);
    });

    it("skips tombstones", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      const result: Array<[string, number]> = [];
      map.forEach((v, k) => result.push([k, v]));
      expect(result).toHaveLength(1);
      expect(result[0]![0]).toBe("b");
    });

    it("passes map as third argument", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      let received: FibonacciHashMap<string, number> | undefined;
      map.forEach((_v, _k, m) => {
        received = m;
      });
      expect(received).toBe(map);
    });
  });

  describe("Symbol.iterator", () => {
    it("iterates entries", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const result: Array<[string, number]> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result).toHaveLength(2);
    });

    it("returns empty for empty map", () => {
      const map = new FibonacciHashMap<string, number>();
      const result: Array<[string, number]> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result).toHaveLength(0);
    });

    it("skips tombstones", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      const result: Array<[string, number]> = [];
      for (const entry of map) {
        result.push(entry);
      }
      expect(result).toHaveLength(1);
    });
  });

  describe("loadFactor property", () => {
    it("returns 0 for empty map", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.loadFactor).toBe(0);
    });

    it("increases with entries", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 16, loadFactor: 0.75 });
      map.set("a", 1);
      expect(map.loadFactor).toBeGreaterThan(0);
    });
  });

  describe("capacity property", () => {
    it("returns initial capacity", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 32 });
      expect(map.capacity).toBe(32);
    });

    it("increases after resize", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.capacity).toBeGreaterThan(4);
    });
  });

  describe("reserve", () => {
    it("pre-allocates capacity", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 16 });
      map.reserve(100);
      expect(map.capacity).toBeGreaterThanOrEqual(100);
    });

    it("does not shrink capacity", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 64 });
      map.reserve(10);
      expect(map.capacity).toBe(64);
    });

    it("allows filling reserved space", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4 });
      map.reserve(50);
      for (let i = 0; i < 50; i++) {
        map.set(`k${i}`, i);
      }
      expect(map.size).toBe(50);
    });
  });

  describe("edge cases", () => {
    it("handles empty map operations", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.get("x")).toBeUndefined();
      expect(map.has("x")).toBe(false);
      expect(map.delete("x")).toBe(false);
      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });

    it("handles single entry", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("only", 42);
      expect(map.size).toBe(1);
      expect(map.get("only")).toBe(42);
      expect(map.has("only")).toBe(true);
    });

    it("handles duplicate keys correctly", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("dup", 1);
      map.set("dup", 2);
      map.set("dup", 3);
      expect(map.size).toBe(1);
      expect(map.get("dup")).toBe(3);
    });

    it("handles empty string key", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("", 0);
      expect(map.get("")).toBe(0);
    });

    it("handles zero value", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("zero", 0);
      expect(map.get("zero")).toBe(0);
    });

    it("handles null-ish values", () => {
      const map = new FibonacciHashMap<string, number | null>();
      map.set("null", null);
      expect(map.get("null")).toBeNull();
    });

    it("handles undefined value", () => {
      const map = new FibonacciHashMap<string, string | undefined>();
      map.set("undef", undefined);
      expect(map.get("undef")).toBeUndefined();
      expect(map.has("undef")).toBe(true);
    });
  });

  describe("large-scale operations", () => {
    it("handles 200+ inserts with linear probing", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "linear" });
      for (let i = 0; i < 250; i++) {
        map.set(`key_${i}`, i);
      }
      expect(map.size).toBe(250);
      for (let i = 0; i < 250; i++) {
        expect(map.get(`key_${i}`)).toBe(i);
      }
    });

    it("handles 200+ inserts with quadratic probing", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "quadratic" });
      for (let i = 0; i < 250; i++) {
        map.set(`key_${i}`, i);
      }
      expect(map.size).toBe(250);
      for (let i = 0; i < 250; i++) {
        expect(map.get(`key_${i}`)).toBe(i);
      }
    });

    it("handles 200+ inserts with double hashing", () => {
      const map = new FibonacciHashMap<string, number>({ probingStrategy: "double" });
      for (let i = 0; i < 250; i++) {
        map.set(`key_${i}`, i);
      }
      expect(map.size).toBe(250);
      for (let i = 0; i < 250; i++) {
        expect(map.get(`key_${i}`)).toBe(i);
      }
    });

    it("handles mixed set/get/delete at scale", () => {
      const map = new FibonacciHashMap<number, string>();
      for (let i = 0; i < 200; i++) {
        map.set(i, `val_${i}`);
      }
      for (let i = 0; i < 100; i++) {
        map.delete(i);
      }
      expect(map.size).toBe(100);
      for (let i = 100; i < 200; i++) {
        expect(map.get(i)).toBe(`val_${i}`);
      }
    });
  });

  describe("probe length statistics", () => {
    it("updates maxProbeLength on operations", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 1.0 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      const stats = map.getStatistics();
      expect(stats.maxProbeLength).toBeGreaterThanOrEqual(1);
    });

    it("accumulates totalProbes", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.get("a");
      map.has("a");
      const stats = map.getStatistics();
      expect(stats.totalProbes).toBeGreaterThanOrEqual(3);
    });

    it("resets probe stats on clear", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.get("a");
      map.clear();
      const stats = map.getStatistics();
      expect(stats.maxProbeLength).toBe(0);
      expect(stats.totalProbes).toBe(0);
    });
  });

  describe("probing strategies comparison", () => {
    it("all strategies produce same final result", () => {
      const linear = new FibonacciHashMap<string, number>({ capacity: 16, probingStrategy: "linear" });
      const quadratic = new FibonacciHashMap<string, number>({ capacity: 16, probingStrategy: "quadratic" });
      const doubleHash = new FibonacciHashMap<string, number>({ capacity: 16, probingStrategy: "double" });

      const keys = ["alpha", "beta", "gamma", "delta", "epsilon"];
      keys.forEach((k, i) => {
        linear.set(k, i);
        quadratic.set(k, i);
        doubleHash.set(k, i);
      });

      keys.forEach((k, i) => {
        expect(linear.get(k)).toBe(i);
        expect(quadratic.get(k)).toBe(i);
        expect(doubleHash.get(k)).toBe(i);
      });
    });
  });

  describe("getStatistics after various operations", () => {
    it("tracks stats through set-delete-set cycle", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      map.set("a", 2);
      const stats = map.getStatistics();
      expect(stats.tombstones).toBe(0);
      expect(map.get("a")).toBe(2);
    });

    it("tracks stats through multiple resizes", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.5 });
      for (let i = 0; i < 100; i++) {
        map.set(`k${i}`, i);
      }
      const stats = map.getStatistics();
      expect(stats.resizes).toBeGreaterThan(0);
    });
  });

  describe("additional edge cases", () => {
    it("handles boolean keys", () => {
      const map = new FibonacciHashMap<boolean, string>();
      map.set(true, "yes");
      map.set(false, "no");
      expect(map.get(true)).toBe("yes");
      expect(map.get(false)).toBe("no");
    });

    it("handles overwriting value multiple times", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("k", 1);
      map.set("k", 2);
      map.set("k", 3);
      map.set("k", 4);
      expect(map.size).toBe(1);
      expect(map.get("k")).toBe(4);
    });

    it("clear resets all statistics", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.delete("a");
      map.clear();
      const stats = map.getStatistics();
      expect(stats.collisions).toBe(0);
      expect(stats.tombstones).toBe(0);
      expect(stats.maxProbeLength).toBe(0);
      expect(stats.totalProbes).toBe(0);
    });

    it("handles delete on empty map gracefully", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.delete("nothing")).toBe(false);
      expect(map.size).toBe(0);
    });

    it("handles get on empty map gracefully", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.get("nothing")).toBeUndefined();
    });

    it("handles has on empty map gracefully", () => {
      const map = new FibonacciHashMap<string, number>();
      expect(map.has("nothing")).toBe(false);
    });

    it("supports mixed type values", () => {
      const map = new FibonacciHashMap<string, number | string | boolean>();
      map.set("num", 42);
      map.set("str", "hello");
      map.set("bool", true);
      expect(map.get("num")).toBe(42);
      expect(map.get("str")).toBe("hello");
      expect(map.get("bool")).toBe(true);
    });

    it("forEach order covers all entries", () => {
      const map = new FibonacciHashMap<number, number>();
      for (let i = 0; i < 20; i++) {
        map.set(i, i * 10);
      }
      const result = new Map<number, number>();
      map.forEach((v, k) => result.set(k, v));
      expect(result.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(result.get(i)).toBe(i * 10);
      }
    });

    it("iterator produces correct entries after delete", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.delete("b");
      const result: Map<string, number> = new Map();
      for (const [k, v] of map) {
        result.set(k, v);
      }
      expect(result.size).toBe(2);
      expect(result.has("b")).toBe(false);
    });

    it("handles sequential delete and reinsert cycles", () => {
      const map = new FibonacciHashMap<string, number>();
      for (let round = 0; round < 5; round++) {
        map.set("x", round);
        expect(map.get("x")).toBe(round);
        map.delete("x");
        expect(map.has("x")).toBe(false);
      }
      expect(map.size).toBe(0);
    });

    it("reserve with exact capacity needed", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 4, loadFactor: 0.75 });
      map.reserve(6);
      expect(map.capacity).toBeGreaterThanOrEqual(8);
    });

    it("handles keys with similar hash codes", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 8, loadFactor: 0.75 });
      const similarKeys = ["aA", "Aa", "aAa", "AaA", "aa", "AA"];
      similarKeys.forEach((k, i) => map.set(k, i));
      similarKeys.forEach((k, i) => {
        expect(map.get(k)).toBe(i);
      });
      expect(map.size).toBe(similarKeys.length);
    });

    it("loadFactor reflects tombstones", () => {
      const map = new FibonacciHashMap<string, number>({ capacity: 16, loadFactor: 0.9 });
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.loadFactor).toBeGreaterThan(0);
    });

    it("handles numeric string keys distinctly", () => {
      const map = new FibonacciHashMap<string, number>();
      map.set("1", 1);
      map.set("2", 2);
      map.set("10", 10);
      expect(map.get("1")).toBe(1);
      expect(map.get("10")).toBe(10);
      expect(map.size).toBe(3);
    });
  });
});
