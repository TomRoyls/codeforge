import { describe, it, expect } from "vitest";
import {
  PartitionedHashMap,
} from "../../src/core/partitioned-hash/partitioned-hash.js";
import {
  DEFAULT_PARTITIONED_HASH_OPTIONS,
} from "../../src/core/partitioned-hash/types.js";

describe("PartitionedHashMap", () => {
  describe("constructor", () => {
    it("creates with default options", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.getPartitionCount()).toBe(DEFAULT_PARTITIONED_HASH_OPTIONS.partitionCount);
    });

    it("creates with custom partitionCount", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      expect(map.getPartitionCount()).toBe(4);
    });

    it("creates with partitionCount of 1", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 1 });
      expect(map.getPartitionCount()).toBe(1);
    });

    it("creates with partitionCount of 64", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 64 });
      expect(map.getPartitionCount()).toBe(64);
    });

    it("throws for partitionCount of 0", () => {
      expect(() => new PartitionedHashMap({ partitionCount: 0 })).toThrow(RangeError);
    });

    it("throws for negative partitionCount", () => {
      expect(() => new PartitionedHashMap({ partitionCount: -1 })).toThrow(RangeError);
    });

    it("throws for non-integer partitionCount", () => {
      expect(() => new PartitionedHashMap({ partitionCount: 3.5 })).toThrow(RangeError);
    });

    it("throws for loadFactor of 0", () => {
      expect(() => new PartitionedHashMap({ loadFactor: 0 })).toThrow(RangeError);
    });

    it("throws for loadFactor greater than 1", () => {
      expect(() => new PartitionedHashMap({ loadFactor: 1.5 })).toThrow(RangeError);
    });

    it("throws for negative loadFactor", () => {
      expect(() => new PartitionedHashMap({ loadFactor: -0.5 })).toThrow(RangeError);
    });

    it("accepts valid loadFactor at boundary 1", () => {
      const map = new PartitionedHashMap({ loadFactor: 1 });
      expect(map.getPartitionCount()).toBe(DEFAULT_PARTITIONED_HASH_OPTIONS.partitionCount);
    });

    it("accepts valid loadFactor near 0", () => {
      const map = new PartitionedHashMap({ loadFactor: 0.01 });
      expect(map.getPartitionCount()).toBe(DEFAULT_PARTITIONED_HASH_OPTIONS.partitionCount);
    });

    it("creates empty map by default", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.size).toBe(0);
    });

    it("isEmpty is true for new map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.isEmpty).toBe(true);
    });
  });

  describe("set and get", () => {
    it("sets and gets a value", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      expect(map.get("a")).toBe(1);
    });

    it("gets undefined for missing key", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.get("missing")).toBeUndefined();
    });

    it("overwrites existing key", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("a", 2);
      expect(map.get("a")).toBe(2);
    });

    it("overwriting does not increase size", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("a", 2);
      expect(map.size).toBe(1);
    });

    it("sets multiple keys", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.size).toBe(3);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("returns this from set for chaining", () => {
      const map = new PartitionedHashMap<string, number>();
      const result = map.set("a", 1);
      expect(result).toBe(map);
    });

    it("supports chaining multiple sets", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1).set("b", 2).set("c", 3);
      expect(map.size).toBe(3);
    });

    it("works with number keys", () => {
      const map = new PartitionedHashMap<number, string>();
      map.set(1, "one");
      map.set(2, "two");
      expect(map.get(1)).toBe("one");
      expect(map.get(2)).toBe("two");
    });

    it("works with object keys", () => {
      const map = new PartitionedHashMap<object, number>();
      const key = { id: 1 };
      map.set(key, 42);
      expect(map.get(key)).toBe(42);
    });

    it("works with null values", () => {
      const map = new PartitionedHashMap<string, null>();
      map.set("a", null);
      expect(map.get("a")).toBeNull();
    });

    it("works with undefined values", () => {
      const map = new PartitionedHashMap<string, undefined>();
      map.set("a", undefined);
      expect(map.get("a")).toBeUndefined();
      expect(map.has("a")).toBe(true);
    });

    it("distributes keys across partitions", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i);
      }
      let usedPartitions = 0;
      for (let i = 0; i < 4; i++) {
        if (map.getPartitionSize(i) > 0) usedPartitions++;
      }
      expect(usedPartitions).toBeGreaterThan(1);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      expect(map.has("a")).toBe(true);
    });

    it("returns false for missing key", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.has("a")).toBe(false);
    });

    it("returns false after delete", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.has("a")).toBe(false);
    });

    it("returns true for null value", () => {
      const map = new PartitionedHashMap<string, null>();
      map.set("a", null);
      expect(map.has("a")).toBe(true);
    });
  });

  describe("delete", () => {
    it("deletes existing key", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      expect(map.delete("a")).toBe(true);
      expect(map.get("a")).toBeUndefined();
    });

    it("returns false for missing key", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.delete("missing")).toBe(false);
    });

    it("decrements size", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.size).toBe(1);
    });

    it("can delete all entries", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      map.delete("b");
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it("delete then re-add works", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      map.set("a", 2);
      expect(map.get("a")).toBe(2);
      expect(map.size).toBe(1);
    });
  });

  describe("size and isEmpty", () => {
    it("size is 0 for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.size).toBe(0);
    });

    it("size increases with inserts", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      expect(map.size).toBe(1);
      map.set("b", 2);
      expect(map.size).toBe(2);
    });

    it("size decreases with deletes", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.delete("a");
      expect(map.size).toBe(1);
    });

    it("isEmpty toggles correctly", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.isEmpty).toBe(true);
      map.set("a", 1);
      expect(map.isEmpty).toBe(false);
      map.delete("a");
      expect(map.isEmpty).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it("clear resets get results", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.clear();
      expect(map.get("a")).toBeUndefined();
    });

    it("clear on empty map is safe", () => {
      const map = new PartitionedHashMap<string, number>();
      map.clear();
      expect(map.size).toBe(0);
    });

    it("clear resets statistics", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.get("a");
      map.delete("a");
      map.clear();
      const stats = map.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.lookups).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.rebalances).toBe(0);
    });

    it("can add after clear", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.clear();
      map.set("b", 2);
      expect(map.size).toBe(1);
      expect(map.get("b")).toBe(2);
    });
  });

  describe("keys, values, entries", () => {
    it("keys returns all keys", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const allKeys = [...map.keys()];
      expect(allKeys).toHaveLength(2);
      expect(allKeys).toContain("a");
      expect(allKeys).toContain("b");
    });

    it("values returns all values", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const allValues = [...map.values()];
      expect(allValues).toHaveLength(2);
      expect(allValues).toContain(1);
      expect(allValues).toContain(2);
    });

    it("entries returns all entries", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const allEntries = [...map.entries()];
      expect(allEntries).toHaveLength(2);
    });

    it("keys returns empty for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect([...map.keys()]).toHaveLength(0);
    });

    it("values returns empty for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect([...map.values()]).toHaveLength(0);
    });

    it("entries returns empty for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect([...map.entries()]).toHaveLength(0);
    });
  });

  describe("forEach", () => {
    it("iterates all entries", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      const collected: [string, number][] = [];
      map.forEach((v, k) => collected.push([k, v]));
      expect(collected).toHaveLength(3);
    });

    it("passes map as third argument", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      let received: PartitionedHashMap<string, number> | undefined;
      map.forEach((_v, _k, m) => {
        received = m;
      });
      expect(received).toBe(map);
    });

    it("does not iterate empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      let count = 0;
      map.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const result = [...map];
      expect(result).toHaveLength(2);
    });

    it("works with for-of", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      const collected: [string, number][] = [];
      for (const entry of map) {
        collected.push(entry);
      }
      expect(collected).toHaveLength(2);
    });
  });

  describe("getPartition", () => {
    it("returns a valid partition index", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      const idx = map.getPartition("hello");
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(4);
    });

    it("returns consistent partition for same key", () => {
      const map = new PartitionedHashMap<string, number>();
      const idx1 = map.getPartition("key");
      const idx2 = map.getPartition("key");
      expect(idx1).toBe(idx2);
    });

    it("different keys may map to same partition", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 1 });
      expect(map.getPartition("a")).toBe(map.getPartition("b"));
    });

    it("returns integer", () => {
      const map = new PartitionedHashMap<string, number>();
      const idx = map.getPartition("test");
      expect(Number.isInteger(idx)).toBe(true);
    });
  });

  describe("getPartitionSize", () => {
    it("returns 0 for empty partition", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 4; i++) {
        expect(map.getPartitionSize(i)).toBe(0);
      }
    });

    it("returns size after inserts", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      map.set("a", 1);
      const partition = map.getPartition("a");
      expect(map.getPartitionSize(partition)).toBe(1);
    });

    it("throws for negative index", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      expect(() => map.getPartitionSize(-1)).toThrow(RangeError);
    });

    it("throws for index >= partitionCount", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      expect(() => map.getPartitionSize(4)).toThrow(RangeError);
    });

    it("sum of partition sizes equals total size", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 20; i++) {
        map.set(`key${i}`, i);
      }
      let sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += map.getPartitionSize(i);
      }
      expect(sum).toBe(map.size);
    });
  });

  describe("getPartitionCount", () => {
    it("returns configured count", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 8 });
      expect(map.getPartitionCount()).toBe(8);
    });

    it("returns default count", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.getPartitionCount()).toBe(DEFAULT_PARTITIONED_HASH_OPTIONS.partitionCount);
    });
  });

  describe("rebalance", () => {
    it("preserves all entries", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      const sizeBefore = map.size;
      map.rebalance();
      expect(map.size).toBe(sizeBefore);
    });

    it("preserves key-value pairs", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i);
      }
      map.rebalance();
      for (let i = 0; i < 10; i++) {
        expect(map.get(`key${i}`)).toBe(i);
      }
    });

    it("increments rebalance count", () => {
      const map = new PartitionedHashMap<string, number>();
      map.rebalance();
      expect(map.getStatistics().rebalances).toBe(1);
      map.rebalance();
      expect(map.getStatistics().rebalances).toBe(2);
    });

    it("rebalance on empty map is safe", () => {
      const map = new PartitionedHashMap<string, number>();
      map.rebalance();
      expect(map.size).toBe(0);
    });

    it("rebalance does not affect non-rebalance stats", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      const insertsBefore = map.getStatistics().inserts;
      map.rebalance();
      expect(map.getStatistics().inserts).toBe(insertsBefore);
    });
  });

  describe("getStatistics", () => {
    it("returns zero stats for new map", () => {
      const map = new PartitionedHashMap<string, number>();
      const stats = map.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.lookups).toBe(0);
      expect(stats.rebalances).toBe(0);
      expect(stats.maxPartitionSize).toBe(0);
      expect(stats.minPartitionSize).toBe(0);
    });

    it("tracks inserts", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("b", 2);
      expect(map.getStatistics().inserts).toBe(2);
    });

    it("does not double count overwrites", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.set("a", 2);
      expect(map.getStatistics().inserts).toBe(1);
    });

    it("tracks deletes", () => {
      const map = new PartitionedHashMap<string, number>();
      map.set("a", 1);
      map.delete("a");
      expect(map.getStatistics().deletes).toBe(1);
    });

    it("does not count failed deletes", () => {
      const map = new PartitionedHashMap<string, number>();
      map.delete("missing");
      expect(map.getStatistics().deletes).toBe(0);
    });

    it("tracks lookups from get", () => {
      const map = new PartitionedHashMap<string, number>();
      map.get("a");
      map.get("b");
      expect(map.getStatistics().lookups).toBe(2);
    });

    it("tracks lookups from has", () => {
      const map = new PartitionedHashMap<string, number>();
      map.has("a");
      expect(map.getStatistics().lookups).toBe(1);
    });

    it("tracks combined lookups from get and has", () => {
      const map = new PartitionedHashMap<string, number>();
      map.get("a");
      map.has("a");
      expect(map.getStatistics().lookups).toBe(2);
    });

    it("computes maxPartitionSize", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 2 });
      map.set("a", 1);
      const stats = map.getStatistics();
      expect(stats.maxPartitionSize).toBeGreaterThanOrEqual(1);
    });

    it("computes minPartitionSize", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 2 });
      map.set("a", 1);
      const stats = map.getStatistics();
      expect(stats.minPartitionSize).toBeLessThanOrEqual(stats.maxPartitionSize);
    });

    it("maxPartitionSize equals minPartitionSize for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      const stats = map.getStatistics();
      expect(stats.maxPartitionSize).toBe(0);
      expect(stats.minPartitionSize).toBe(0);
    });
  });

  describe("loadFactor", () => {
    it("is 0 for empty map", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.loadFactor).toBe(0);
    });

    it("increases with inserts", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      const initial = map.loadFactor;
      map.set("a", 1);
      expect(map.loadFactor).toBeGreaterThan(initial);
    });

    it("is size divided by partitionCount", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.set("d", 4);
      expect(map.loadFactor).toBe(1);
    });

    it("can exceed 1", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 2 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.loadFactor).toBe(1.5);
    });

    it("decreases after delete", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      map.set("a", 1);
      map.set("b", 2);
      const before = map.loadFactor;
      map.delete("a");
      expect(map.loadFactor).toBeLessThan(before);
    });
  });

  describe("DEFAULT_PARTITIONED_HASH_OPTIONS", () => {
    it("has partitionCount of 16", () => {
      expect(DEFAULT_PARTITIONED_HASH_OPTIONS.partitionCount).toBe(16);
    });

    it("has loadFactor of 0.75", () => {
      expect(DEFAULT_PARTITIONED_HASH_OPTIONS.loadFactor).toBe(0.75);
    });
  });

  describe("stress tests", () => {
    it("handles many inserts", () => {
      const map = new PartitionedHashMap<number, number>({ partitionCount: 8 });
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2);
      }
      expect(map.size).toBe(1000);
    });

    it("handles many lookups", () => {
      const map = new PartitionedHashMap<number, number>({ partitionCount: 8 });
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i);
      }
    });

    it("handles mixed operations", () => {
      const map = new PartitionedHashMap<number, number>({ partitionCount: 4 });
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i);
      }
      expect(map.size).toBe(50);
      for (let i = 50; i < 100; i++) {
        expect(map.get(i)).toBe(i);
      }
    });

    it("handles large number of rebalances", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 4 });
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i);
      }
      for (let i = 0; i < 10; i++) {
        map.rebalance();
      }
      expect(map.getStatistics().rebalances).toBe(10);
      expect(map.size).toBe(50);
    });

    it("clear and refill many times", () => {
      const map = new PartitionedHashMap<string, number>();
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 50; i++) {
          map.set(`key${i}`, i);
        }
        expect(map.size).toBe(50);
        map.clear();
        expect(map.size).toBe(0);
      }
    });

    it("iterators work with many entries", () => {
      const map = new PartitionedHashMap<number, number>({ partitionCount: 8 });
      for (let i = 0; i < 200; i++) {
        map.set(i, i * 10);
      }
      expect([...map.keys()]).toHaveLength(200);
      expect([...map.values()]).toHaveLength(200);
      expect([...map.entries()]).toHaveLength(200);
    });

    it("forEach visits all entries with many items", () => {
      const map = new PartitionedHashMap<number, number>({ partitionCount: 8 });
      for (let i = 0; i < 200; i++) {
        map.set(i, i);
      }
      let count = 0;
      map.forEach(() => count++);
      expect(count).toBe(200);
    });

    it("single partition works like a regular Map", () => {
      const map = new PartitionedHashMap<string, number>({ partitionCount: 1 });
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      expect(map.size).toBe(3);
      expect(map.getPartition("a")).toBe(0);
      expect(map.getPartition("b")).toBe(0);
      expect(map.getPartitionSize(0)).toBe(3);
    });

    it("boolean keys work", () => {
      const map = new PartitionedHashMap<boolean, string>();
      map.set(true, "yes");
      map.set(false, "no");
      expect(map.get(true)).toBe("yes");
      expect(map.get(false)).toBe("no");
    });

    it("undefined key works", () => {
      const map = new PartitionedHashMap<undefined, string>();
      map.set(undefined, "val");
      expect(map.get(undefined)).toBe("val");
    });

    it("getMaxLoadFactor returns configured value", () => {
      const map = new PartitionedHashMap<string, number>({ loadFactor: 0.5 });
      expect(map.getMaxLoadFactor()).toBe(0.5);
    });

    it("getMaxLoadFactor returns default", () => {
      const map = new PartitionedHashMap<string, number>();
      expect(map.getMaxLoadFactor()).toBe(DEFAULT_PARTITIONED_HASH_OPTIONS.loadFactor);
    });
  });
});
