import { describe, it, expect } from "vitest";
import { ExtendibleHash } from "../../src/core/extendible-hash/extendible-hash.js";

describe("ExtendibleHash - Construction", () => {
  it("creates with default options", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.size).toBe(0);
    expect(h.isEmpty()).toBe(true);
    expect(h.getDirectoryDepth()).toBe(1);
    expect(h.getBucketCount()).toBe(2);
    expect(h.getBucketCapacity()).toBe(4);
  });

  it("creates with custom bucketCapacity", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    expect(h.getBucketCapacity()).toBe(2);
    expect(h.getBucketCount()).toBe(2);
  });

  it("creates with custom initialDepth", () => {
    const h = new ExtendibleHash<string, number>({ initialDepth: 3 });
    expect(h.getDirectoryDepth()).toBe(3);
    expect(h.getBucketCount()).toBe(8);
  });

  it("creates with both custom options", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 3, initialDepth: 2 });
    expect(h.getBucketCapacity()).toBe(3);
    expect(h.getDirectoryDepth()).toBe(2);
    expect(h.getBucketCount()).toBe(4);
  });

  it("creates with empty options object", () => {
    const h = new ExtendibleHash<string, number>({});
    expect(h.getBucketCapacity()).toBe(4);
    expect(h.getDirectoryDepth()).toBe(1);
  });

  it("can work with number keys", () => {
    const h = new ExtendibleHash<number, string>();
    h.set(1, "one");
    expect(h.get(1)).toBe("one");
  });

  it("can work with object values", () => {
    const h = new ExtendibleHash<string, { a: number }>();
    h.set("x", { a: 1 });
    expect(h.get("x")!.a).toBe(1);
  });
});

describe("ExtendibleHash - set/get basic", () => {
  it("sets and gets a value", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("hello", 42);
    expect(h.get("hello")).toBe(42);
  });

  it("returns undefined for missing key", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.get("missing")).toBeUndefined();
  });

  it("overwrites existing key", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("key", 1);
    h.set("key", 2);
    expect(h.get("key")).toBe(2);
    expect(h.size).toBe(1);
  });

  it("sets multiple keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    expect(h.get("a")).toBe(1);
    expect(h.get("b")).toBe(2);
    expect(h.get("c")).toBe(3);
    expect(h.size).toBe(3);
  });

  it("handles falsy values", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("zero", 0);
    expect(h.get("zero")).toBe(0);
  });

  it("handles empty string key", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("", 99);
    expect(h.get("")).toBe(99);
  });

  it("handles null-like string keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("null", 1);
    h.set("undefined", 2);
    expect(h.get("null")).toBe(1);
    expect(h.get("undefined")).toBe(2);
  });
});

describe("ExtendibleHash - has", () => {
  it("returns true for existing key", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    expect(h.has("x")).toBe(true);
  });

  it("returns false for missing key", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.has("x")).toBe(false);
  });

  it("returns false after delete", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.delete("x");
    expect(h.has("x")).toBe(false);
  });

  it("returns true after overwrite", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.set("x", 2);
    expect(h.has("x")).toBe(true);
  });
});

describe("ExtendibleHash - delete", () => {
  it("deletes an existing key", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    expect(h.delete("a")).toBe(true);
    expect(h.get("a")).toBeUndefined();
    expect(h.size).toBe(0);
  });

  it("returns false for missing key", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.delete("missing")).toBe(false);
  });

  it("deletes from middle of bucket", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 10 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.delete("b");
    expect(h.get("a")).toBe(1);
    expect(h.get("b")).toBeUndefined();
    expect(h.get("c")).toBe(3);
    expect(h.size).toBe(2);
  });

  it("delete and re-insert", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.delete("x");
    h.set("x", 2);
    expect(h.get("x")).toBe(2);
    expect(h.size).toBe(1);
  });

  it("delete multiple keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.delete("a");
    h.delete("c");
    expect(h.size).toBe(1);
    expect(h.get("b")).toBe(2);
  });
});

describe("ExtendibleHash - clear", () => {
  it("clears all entries", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.clear();
    expect(h.size).toBe(0);
    expect(h.isEmpty()).toBe(true);
    expect(h.get("a")).toBeUndefined();
  });

  it("clear resets to initial state", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.set("d", 4);
    h.set("e", 5);
    h.clear();
    expect(h.getDirectoryDepth()).toBe(1);
    expect(h.getBucketCount()).toBe(2);
    expect(h.getStatistics().splits).toBe(0);
    expect(h.getStatistics().directoryDoublings).toBe(0);
  });

  it("can use after clear", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.clear();
    h.set("b", 2);
    expect(h.get("b")).toBe(2);
    expect(h.size).toBe(1);
  });
});

describe("ExtendibleHash - Bucket splitting", () => {
  it("splits bucket when full", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("c", 2);
    expect(h.getBucketCount()).toBe(2);
    h.set("e", 3);
    expect(h.getStatistics().splits).toBeGreaterThan(0);
  });

  it("entries accessible after split", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("c", 2);
    h.set("e", 3);
    expect(h.get("a")).toBe(1);
    expect(h.get("c")).toBe(2);
    expect(h.get("e")).toBe(3);
  });

  it("multiple splits with small bucket", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 0);
    h.set("c", 1);
    for (let i = 2; i < 10; i++) {
      h.set(`key${i}`, i);
    }
    expect(h.size).toBe(10);
    expect(h.get("a")).toBe(0);
    expect(h.get("c")).toBe(1);
    for (let i = 2; i < 10; i++) {
      expect(h.get(`key${i}`)).toBe(i);
    }
  });

  it("split increases bucket count", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2, initialDepth: 1 });
    const initialBuckets = h.getBucketCount();
    h.set("a", 1);
    h.set("c", 2);
    h.set("e", 3);
    h.set("g", 4);
    h.set("i", 5);
    expect(h.getBucketCount()).toBeGreaterThan(initialBuckets);
  });
});

describe("ExtendibleHash - Directory doubling", () => {
  it("doubles directory when localDepth > globalDepth", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 1, initialDepth: 1 });
    h.set("a", 1);
    h.set("c", 2);
    expect(h.getDirectoryDepth()).toBeGreaterThan(1);
    expect(h.getStatistics().directoryDoublings).toBeGreaterThan(0);
  });

  it("directory size doubles correctly", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 1, initialDepth: 1 });
    h.set("a", 1);
    expect(h.getDirectoryDepth()).toBe(1);
    h.set("c", 2);
    expect(h.getDirectoryDepth()).toBe(2);
    h.set("e", 3);
    expect(h.getDirectoryDepth()).toBeGreaterThanOrEqual(2);
  });

  it("entries survive directory doubling", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 1, initialDepth: 1 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.set("d", 4);
    expect(h.get("a")).toBe(1);
    expect(h.get("b")).toBe(2);
    expect(h.get("c")).toBe(3);
    expect(h.get("d")).toBe(4);
  });
});

describe("ExtendibleHash - Statistics", () => {
  it("initial statistics are zero", () => {
    const h = new ExtendibleHash<string, number>();
    const stats = h.getStatistics();
    expect(stats.splits).toBe(0);
    expect(stats.directoryDoublings).toBe(0);
    expect(stats.totalBuckets).toBe(2);
    expect(stats.totalEntries).toBe(0);
  });

  it("tracks splits accurately", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("c", 2);
    h.set("e", 3);
    const stats = h.getStatistics();
    expect(stats.splits).toBeGreaterThan(0);
    expect(stats.totalEntries).toBe(3);
  });

  it("tracks totalEntries", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    expect(h.getStatistics().totalEntries).toBe(2);
    h.delete("a");
    expect(h.getStatistics().totalEntries).toBe(1);
  });

  it("tracks totalBuckets", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 1, initialDepth: 1 });
    expect(h.getStatistics().totalBuckets).toBe(2);
    h.set("a", 1);
    h.set("c", 2);
    h.set("e", 3);
    expect(h.getStatistics().totalBuckets).toBeGreaterThan(2);
  });

  it("statistics reset after clear", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.clear();
    const stats = h.getStatistics();
    expect(stats.splits).toBe(0);
    expect(stats.directoryDoublings).toBe(0);
    expect(stats.totalEntries).toBe(0);
  });
});

describe("ExtendibleHash - keys/values/entries", () => {
  it("keys returns all keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    const keys = h.keys();
    expect(keys.sort()).toEqual(["a", "b", "c"]);
  });

  it("values returns all values", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    const values = h.values();
    expect(values.sort()).toEqual([1, 2, 3]);
  });

  it("entries returns all key-value pairs", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    const entries = h.entries();
    expect(entries.length).toBe(2);
    const sorted = entries.sort((a, b) => a[0].localeCompare(b[0]));
    expect(sorted[0]).toEqual(["a", 1]);
    expect(sorted[1]).toEqual(["b", 2]);
  });

  it("keys returns empty array when empty", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.keys()).toEqual([]);
  });

  it("values returns empty array when empty", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.values()).toEqual([]);
  });

  it("entries returns empty array when empty", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.entries()).toEqual([]);
  });
});

describe("ExtendibleHash - forEach", () => {
  it("iterates over all entries", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    const result: Array<[string, number]> = [];
    h.forEach((v, k) => result.push([k, v]));
    expect(result.length).toBe(3);
  });

  it("passes correct arguments to callback", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 42);
    h.forEach((v, k, hash) => {
      expect(k).toBe("x");
      expect(v).toBe(42);
      expect(hash).toBe(h);
    });
  });

  it("does not call callback on empty hash", () => {
    const h = new ExtendibleHash<string, number>();
    let called = false;
    h.forEach(() => { called = true; });
    expect(called).toBe(false);
  });
});

describe("ExtendibleHash - Symbol.iterator", () => {
  it("is iterable", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    const result: Array<[string, number]> = [];
    for (const [k, v] of h) {
      result.push([k, v]);
    }
    expect(result.length).toBe(2);
  });

  it("spreads into array", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.set("b", 2);
    const arr = [...h];
    expect(arr.length).toBe(2);
  });

  it("works with empty hash", () => {
    const h = new ExtendibleHash<string, number>();
    const arr = [...h];
    expect(arr).toEqual([]);
  });
});

describe("ExtendibleHash - loadFactor", () => {
  it("returns 0 when empty", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.loadFactor).toBe(0);
  });

  it("returns correct load factor", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4, initialDepth: 1 });
    h.set("a", 1);
    h.set("b", 2);
    const lf = h.loadFactor;
    expect(lf).toBeGreaterThan(0);
    expect(lf).toBeLessThanOrEqual(1);
  });

  it("load factor increases with entries", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 10 });
    const lf1 = h.loadFactor;
    h.set("a", 1);
    const lf2 = h.loadFactor;
    expect(lf2).toBeGreaterThan(lf1);
  });

  it("load factor decreases after delete", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 10 });
    h.set("a", 1);
    h.set("b", 2);
    const lf1 = h.loadFactor;
    h.delete("a");
    const lf2 = h.loadFactor;
    expect(lf2).toBeLessThan(lf1);
  });
});

describe("ExtendibleHash - Duplicate keys (overwrite)", () => {
  it("overwriting does not increase size", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.set("x", 2);
    h.set("x", 3);
    expect(h.size).toBe(1);
  });

  it("overwriting preserves latest value", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.set("x", 99);
    expect(h.get("x")).toBe(99);
  });

  it("overwriting does not trigger split", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("a", 2);
    h.set("a", 3);
    expect(h.getStatistics().splits).toBe(0);
  });

  it("overwrite after delete and re-insert", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("x", 1);
    h.delete("x");
    h.set("x", 2);
    h.set("x", 3);
    expect(h.get("x")).toBe(3);
    expect(h.size).toBe(1);
  });
});

describe("ExtendibleHash - Large scale", () => {
  it("inserts 200 entries", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    for (let i = 0; i < 200; i++) {
      h.set(`key${i}`, i);
    }
    expect(h.size).toBe(200);
    for (let i = 0; i < 200; i++) {
      expect(h.get(`key${i}`)).toBe(i);
    }
  });

  it("200 inserts trigger many splits", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    for (let i = 0; i < 200; i++) {
      h.set(`key${i}`, i);
    }
    const stats = h.getStatistics();
    expect(stats.splits).toBeGreaterThan(10);
    expect(stats.totalEntries).toBe(200);
  });

  it("directory depth grows with many inserts", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2, initialDepth: 1 });
    for (let i = 0; i < 100; i++) {
      h.set(`key${i}`, i);
    }
    expect(h.getDirectoryDepth()).toBeGreaterThan(1);
  });

  it("insert 500 entries with small buckets", () => {
    const h = new ExtendibleHash<number, string>({ bucketCapacity: 2 });
    for (let i = 0; i < 500; i++) {
      h.set(i, `val${i}`);
    }
    expect(h.size).toBe(500);
    for (let i = 0; i < 500; i++) {
      expect(h.has(i)).toBe(true);
    }
  });
});

describe("ExtendibleHash - Delete + re-insert patterns", () => {
  it("delete all then re-insert", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.delete("a");
    h.delete("b");
    h.delete("c");
    expect(h.size).toBe(0);
    h.set("a", 10);
    h.set("b", 20);
    expect(h.get("a")).toBe(10);
    expect(h.get("b")).toBe(20);
  });

  it("interleaved delete and insert", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.set("a", 1);
    h.set("b", 2);
    h.delete("a");
    h.set("c", 3);
    h.delete("b");
    h.set("d", 4);
    expect(h.size).toBe(2);
    expect(h.has("c")).toBe(true);
    expect(h.has("d")).toBe(true);
    expect(h.has("a")).toBe(false);
    expect(h.has("b")).toBe(false);
  });

  it("delete non-existent does not affect state", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.delete("nonexistent");
    expect(h.size).toBe(1);
    expect(h.get("a")).toBe(1);
  });

  it("repeatedly insert and delete same key", () => {
    const h = new ExtendibleHash<string, number>();
    for (let i = 0; i < 20; i++) {
      h.set("x", i);
      if (i % 2 === 0) {
        h.delete("x");
      }
    }
    expect(h.has("x")).toBe(true);
    expect(h.get("x")).toBe(19);
  });
});

describe("ExtendibleHash - reserve", () => {
  it("reserve pre-allocates directory space", () => {
    const h = new ExtendibleHash<string, number>({ initialDepth: 1 });
    h.reserve(100);
    expect(h.getDirectoryDepth()).toBeGreaterThan(1);
  });

  it("reserve does not shrink directory", () => {
    const h = new ExtendibleHash<string, number>({ initialDepth: 3 });
    h.reserve(2);
    expect(h.getDirectoryDepth()).toBe(3);
  });

  it("reserve with zero does nothing", () => {
    const h = new ExtendibleHash<string, number>();
    const depthBefore = h.getDirectoryDepth();
    h.reserve(0);
    expect(h.getDirectoryDepth()).toBe(depthBefore);
  });

  it("can insert into pre-allocated space", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.reserve(50);
    for (let i = 0; i < 50; i++) {
      h.set(`k${i}`, i);
    }
    expect(h.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(h.get(`k${i}`)).toBe(i);
    }
  });
});

describe("ExtendibleHash - Edge cases", () => {
  it("single entry", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("only", 42);
    expect(h.size).toBe(1);
    expect(h.get("only")).toBe(42);
    expect(h.has("only")).toBe(true);
    expect(h.isEmpty()).toBe(false);
  });

  it("delete only entry", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("only", 42);
    h.delete("only");
    expect(h.size).toBe(0);
    expect(h.isEmpty()).toBe(true);
  });

  it("get from empty hash", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.get("anything")).toBeUndefined();
  });

  it("delete from empty hash", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.delete("anything")).toBe(false);
  });

  it("has on empty hash", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.has("anything")).toBe(false);
  });

  it("overwrites maintain correct size under pressure", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.set("a", 10);
    h.set("b", 20);
    expect(h.size).toBe(3);
    expect(h.get("a")).toBe(10);
    expect(h.get("b")).toBe(20);
    expect(h.get("c")).toBe(3);
  });
});

describe("ExtendibleHash - Number keys", () => {
  it("works with number keys", () => {
    const h = new ExtendibleHash<number, string>();
    for (let i = 0; i < 50; i++) {
      h.set(i, `val${i}`);
    }
    for (let i = 0; i < 50; i++) {
      expect(h.get(i)).toBe(`val${i}`);
    }
  });

  it("handles negative numbers", () => {
    const h = new ExtendibleHash<number, string>();
    h.set(-1, "neg1");
    h.set(-2, "neg2");
    expect(h.get(-1)).toBe("neg1");
    expect(h.get(-2)).toBe("neg2");
  });
});

describe("ExtendibleHash - Consistency after operations", () => {
  it("keys, values, entries all agree", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 3 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.set("d", 4);
    h.set("e", 5);
    expect(h.keys().length).toBe(h.values().length);
    expect(h.entries().length).toBe(h.size);
  });

  it("forEach visits same count as size", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    for (let i = 0; i < 20; i++) {
      h.set(`k${i}`, i);
    }
    let count = 0;
    h.forEach(() => { count++; });
    expect(count).toBe(h.size);
  });

  it("iterator count matches size", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    for (let i = 0; i < 30; i++) {
      h.set(`k${i}`, i);
    }
    let count = 0;
    for (const _ of h) {
      count++;
    }
    expect(count).toBe(h.size);
  });
});

describe("ExtendibleHash - Stress: 200+ inserts triggering splits", () => {
  it("insert 200 entries with bucketCapacity 2", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2, initialDepth: 1 });
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i);
    }
    expect(h.size).toBe(200);
    expect(h.getStatistics().splits).toBeGreaterThan(20);
    for (let i = 0; i < 200; i++) {
      expect(h.get(`k${i}`)).toBe(i);
    }
  });

  it("insert 200 entries then delete half", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 3, initialDepth: 1 });
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i);
    }
    for (let i = 0; i < 100; i++) {
      h.delete(`k${i}`);
    }
    expect(h.size).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(h.has(`k${i}`)).toBe(false);
    }
    for (let i = 100; i < 200; i++) {
      expect(h.get(`k${i}`)).toBe(i);
    }
  });

  it("insert 200 then overwrite all", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4, initialDepth: 1 });
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i);
    }
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i * 10);
    }
    expect(h.size).toBe(200);
    for (let i = 0; i < 200; i++) {
      expect(h.get(`k${i}`)).toBe(i * 10);
    }
  });

  it("insert 300 with number keys", () => {
    const h = new ExtendibleHash<number, string>({ bucketCapacity: 3, initialDepth: 2 });
    for (let i = 0; i < 300; i++) {
      h.set(i, `v${i}`);
    }
    expect(h.size).toBe(300);
    expect(h.getStatistics().totalEntries).toBe(300);
    for (let i = 0; i < 300; i++) {
      expect(h.get(i)).toBe(`v${i}`);
    }
  });
});

describe("ExtendibleHash - Delete + re-insert patterns extended", () => {
  it("delete and re-insert triggers no duplicate entries", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.set("x", 1);
    h.delete("x");
    h.set("x", 2);
    h.delete("x");
    h.set("x", 3);
    expect(h.size).toBe(1);
    expect(h.get("x")).toBe(3);
  });

  it("churn: repeated insert/delete cycles", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < 20; i++) {
        h.set(`k${i}`, round * 100 + i);
      }
      for (let i = 0; i < 10; i++) {
        h.delete(`k${i}`);
      }
    }
    expect(h.size).toBe(10);
    for (let i = 10; i < 20; i++) {
      expect(h.has(`k${i}`)).toBe(true);
    }
  });

  it("delete from different buckets", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4, initialDepth: 2 });
    for (let i = 0; i < 20; i++) {
      h.set(`k${i}`, i);
    }
    for (let i = 0; i < 20; i += 2) {
      h.delete(`k${i}`);
    }
    expect(h.size).toBe(10);
    for (let i = 1; i < 20; i += 2) {
      expect(h.has(`k${i}`)).toBe(true);
    }
  });
});

describe("ExtendibleHash - Additional edge cases", () => {
  it("getBucketCount with shared buckets", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4, initialDepth: 3 });
    h.set("a", 1);
    const count = h.getBucketCount();
    expect(count).toBeLessThanOrEqual(8);
    expect(count).toBeGreaterThan(0);
  });

  it("loadFactor stays within bounds during growth", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    for (let i = 0; i < 100; i++) {
      h.set(`k${i}`, i);
      expect(h.loadFactor).toBeGreaterThan(0);
      expect(h.loadFactor).toBeLessThanOrEqual(1);
    }
  });

  it("reserve then fill to exactly that amount", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.reserve(40);
    for (let i = 0; i < 40; i++) {
      h.set(`k${i}`, i);
    }
    expect(h.size).toBe(40);
    expect(h.getStatistics().totalEntries).toBe(40);
  });

  it("overwriting after many splits", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2 });
    for (let i = 0; i < 50; i++) {
      h.set(`k${i}`, i);
    }
    for (let i = 0; i < 50; i++) {
      h.set(`k${i}`, i + 1000);
    }
    expect(h.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(h.get(`k${i}`)).toBe(i + 1000);
    }
  });

  it("clear after heavy use restores defaults", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 2, initialDepth: 1 });
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i);
    }
    h.clear();
    expect(h.size).toBe(0);
    expect(h.isEmpty()).toBe(true);
    expect(h.getDirectoryDepth()).toBe(1);
    expect(h.getBucketCount()).toBe(2);
    expect(h.getStatistics().splits).toBe(0);
    expect(h.getStatistics().directoryDoublings).toBe(0);
  });

  it("keys/values/entries after deletes are correct", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 3 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.set("d", 4);
    h.delete("b");
    expect(h.keys().sort()).toEqual(["a", "c", "d"]);
    expect(h.values().sort()).toEqual([1, 3, 4]);
    expect(h.entries().length).toBe(3);
  });

  it("forEach after deletes skips deleted keys", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.delete("b");
    const keys: string[] = [];
    h.forEach((_v, k) => keys.push(k));
    expect(keys.sort()).toEqual(["a", "c"]);
  });

  it("iterator after deletes", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.set("a", 1);
    h.set("b", 2);
    h.set("c", 3);
    h.delete("b");
    const entries = [...h];
    expect(entries.length).toBe(2);
  });

  it("multiple clears in sequence", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("a", 1);
    h.clear();
    expect(h.size).toBe(0);
    h.clear();
    expect(h.size).toBe(0);
    h.set("b", 2);
    h.clear();
    expect(h.size).toBe(0);
  });

  it("size property is readonly accurate", () => {
    const h = new ExtendibleHash<string, number>();
    expect(h.size).toBe(0);
    h.set("a", 1);
    expect(h.size).toBe(1);
    h.set("a", 2);
    expect(h.size).toBe(1);
    h.set("b", 3);
    expect(h.size).toBe(2);
    h.delete("a");
    expect(h.size).toBe(1);
    h.delete("b");
    expect(h.size).toBe(0);
  });

  it("statistics track directoryDoublings correctly", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 1, initialDepth: 1 });
    expect(h.getStatistics().directoryDoublings).toBe(0);
    h.set("a", 1);
    h.set("c", 2);
    const doublings = h.getStatistics().directoryDoublings;
    expect(doublings).toBeGreaterThan(0);
  });

  it("reserve larger than current entries", () => {
    const h = new ExtendibleHash<string, number>({ bucketCapacity: 4 });
    h.set("a", 1);
    h.set("b", 2);
    h.reserve(1000);
    expect(h.getDirectoryDepth()).toBeGreaterThan(1);
    expect(h.get("a")).toBe(1);
    expect(h.get("b")).toBe(2);
    expect(h.size).toBe(2);
  });

  it("handles special character keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("!@#$%^&*()", 1);
    h.set("hello world", 2);
    h.set("🎉", 3);
    expect(h.get("!@#$%^&*()")).toBe(1);
    expect(h.get("hello world")).toBe(2);
    expect(h.get("🎉")).toBe(3);
  });

  it("boolean-like string keys", () => {
    const h = new ExtendibleHash<string, number>();
    h.set("true", 1);
    h.set("false", 0);
    expect(h.get("true")).toBe(1);
    expect(h.get("false")).toBe(0);
  });

  it("very long string keys", () => {
    const h = new ExtendibleHash<string, number>();
    const longKey = "x".repeat(1000);
    h.set(longKey, 42);
    expect(h.get(longKey)).toBe(42);
    expect(h.has(longKey)).toBe(true);
  });

  it("getBucketCapacity returns constructor value", () => {
    const h1 = new ExtendibleHash<string, number>({ bucketCapacity: 7 });
    expect(h1.getBucketCapacity()).toBe(7);
    const h2 = new ExtendibleHash<string, number>();
    expect(h2.getBucketCapacity()).toBe(4);
  });

  it("getDirectoryDepth matches initial", () => {
    const h = new ExtendibleHash<string, number>({ initialDepth: 5 });
    expect(h.getDirectoryDepth()).toBe(5);
  });

  it("entries maintain type safety", () => {
    const h = new ExtendibleHash<string, { id: number; name: string }>();
    h.set("user1", { id: 1, name: "Alice" });
    h.set("user2", { id: 2, name: "Bob" });
    const user1 = h.get("user1");
    expect(user1!.id).toBe(1);
    expect(user1!.name).toBe("Alice");
  });
});
