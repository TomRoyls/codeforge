import { describe, it, expect } from "vitest";
import { SplitOrderedList } from "../../src/core/split-ordered-list/index.js";

describe("SplitOrderedList", () => {
  describe("insert", () => {
    it("inserts single element", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(1, "one")).toBe(true);
      expect(list.size).toBe(1);
    });

    it("inserts multiple elements", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(1, "one")).toBe(true);
      expect(list.insert(2, "two")).toBe(true);
      expect(list.insert(3, "three")).toBe(true);
      expect(list.size).toBe(3);
    });

    it("returns false when inserting duplicate key", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(1, "one")).toBe(true);
      expect(list.insert(1, "one-dup")).toBe(false);
      expect(list.size).toBe(1);
    });

    it("updates value on duplicate key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(1, "updated");
      expect(list.get(1)).toBe("updated");
    });

    it("inserts elements in order", () => {
      const list = new SplitOrderedList<number>();
      list.insert(3, 3);
      list.insert(1, 1);
      list.insert(2, 2);
      expect(list.size).toBe(3);
    });

    it("handles negative keys", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(-1, "negative")).toBe(true);
      expect(list.has(-1)).toBe(true);
    });

    it("handles zero key", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(0, "zero")).toBe(true);
      expect(list.has(0)).toBe(true);
    });

    it("handles large keys", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(999999, "large")).toBe(true);
      expect(list.has(999999)).toBe(true);
    });

    it("inserts string values", () => {
      const list = new SplitOrderedList<string>();
      expect(list.insert(1, "hello")).toBe(true);
      expect(list.get(1)).toBe("hello");
    });

    it("inserts number values", () => {
      const list = new SplitOrderedList<number>();
      expect(list.insert(1, 42)).toBe(true);
      expect(list.get(1)).toBe(42);
    });

    it("inserts object values", () => {
      const list = new SplitOrderedList<{ name: string }>();
      const obj = { name: "test" };
      expect(list.insert(1, obj)).toBe(true);
      expect(list.get(1)).toEqual(obj);
    });

    it("inserts null values", () => {
      const list = new SplitOrderedList<null>();
      expect(list.insert(1, null)).toBe(true);
      expect(list.get(1)).toBe(null);
    });

    it("inserts undefined values", () => {
      const list = new SplitOrderedList<undefined>();
      expect(list.insert(1, undefined)).toBe(true);
      expect(list.get(1)).toBe(undefined);
    });

    it("inserts many elements", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 100; i++) {
        expect(list.insert(i, i)).toBe(true);
      }
      expect(list.size).toBe(100);
    });
  });

  describe("delete", () => {
    it("deletes existing element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.delete(1)).toBe(true);
      expect(list.size).toBe(0);
      expect(list.has(1)).toBe(false);
    });

    it("returns false when deleting non-existent element", () => {
      const list = new SplitOrderedList<string>();
      expect(list.delete(1)).toBe(false);
    });

    it("deletes from beginning", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.delete(1)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.has(1)).toBe(false);
    });

    it("deletes from middle", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.delete(2)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.has(2)).toBe(false);
    });

    it("deletes from end", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.delete(3)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.has(3)).toBe(false);
    });

    it("deletes all elements", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.delete(1)).toBe(true);
      expect(list.delete(2)).toBe(true);
      expect(list.delete(3)).toBe(true);
      expect(list.size).toBe(0);
    });

    it("deletes negative key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(-1, "negative");
      expect(list.delete(-1)).toBe(true);
      expect(list.has(-1)).toBe(false);
    });

    it("deletes zero key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(0, "zero");
      expect(list.delete(0)).toBe(true);
      expect(list.has(0)).toBe(false);
    });

    it("deletes from empty list", () => {
      const list = new SplitOrderedList<string>();
      expect(list.delete(1)).toBe(false);
      expect(list.size).toBe(0);
    });

    it("deletes same element twice", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.delete(1)).toBe(true);
      expect(list.delete(1)).toBe(false);
    });
  });

  describe("has", () => {
    it("returns true for existing element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.has(1)).toBe(true);
    });

    it("returns false for non-existent element", () => {
      const list = new SplitOrderedList<string>();
      expect(list.has(1)).toBe(false);
    });

    it("finds first element", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.has(1)).toBe(true);
    });

    it("finds last element", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.has(3)).toBe(true);
    });

    it("finds middle element", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.has(2)).toBe(true);
    });

    it("handles negative keys", () => {
      const list = new SplitOrderedList<string>();
      list.insert(-1, "negative");
      expect(list.has(-1)).toBe(true);
    });

    it("handles zero key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(0, "zero");
      expect(list.has(0)).toBe(true);
    });

    it("returns false after deletion", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.delete(1);
      expect(list.has(1)).toBe(false);
    });
  });

  describe("get", () => {
    it("returns value for existing element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.get(1)).toBe("one");
    });

    it("returns null for non-existent element", () => {
      const list = new SplitOrderedList<string>();
      expect(list.get(1)).toBe(null);
    });

    it("returns updated value", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(1, "updated");
      expect(list.get(1)).toBe("updated");
    });

    it("returns first element value", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.get(1)).toBe(1);
    });

    it("returns last element value", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.get(3)).toBe(3);
    });

    it("returns middle element value", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      expect(list.get(2)).toBe(2);
    });

    it("handles negative keys", () => {
      const list = new SplitOrderedList<string>();
      list.insert(-1, "negative");
      expect(list.get(-1)).toBe("negative");
    });

    it("handles zero key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(0, "zero");
      expect(list.get(0)).toBe("zero");
    });

    it("returns null after deletion", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.delete(1);
      expect(list.get(1)).toBe(null);
    });

    it("returns complex object value", () => {
      const list = new SplitOrderedList<{ a: number; b: string }>();
      const obj = { a: 1, b: "test" };
      list.insert(1, obj);
      expect(list.get(1)).toEqual(obj);
    });
  });

  describe("size", () => {
    it("returns zero for empty list", () => {
      const list = new SplitOrderedList<string>();
      expect(list.size).toBe(0);
    });

    it("returns correct size after insert", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.size).toBe(1);
      list.insert(2, "two");
      expect(list.size).toBe(2);
    });

    it("returns correct size after delete", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.delete(1);
      expect(list.size).toBe(1);
    });

    it("does not increase on duplicate insert", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(1, "dup");
      expect(list.size).toBe(1);
    });

    it("handles many elements", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i, i);
      }
      expect(list.size).toBe(50);
    });
  });

  describe("isEmpty", () => {
    it("returns true for empty list", () => {
      const list = new SplitOrderedList<string>();
      expect(list.isEmpty()).toBe(true);
    });

    it("returns false after insert", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.isEmpty()).toBe(false);
    });

    it("returns true after clearing", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.clear();
      expect(list.isEmpty()).toBe(true);
    });

    it("returns true after deleting all elements", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.delete(1);
      list.delete(2);
      expect(list.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears empty list", () => {
      const list = new SplitOrderedList<string>();
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it("clears single element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.clear();
      expect(list.size).toBe(0);
      expect(list.has(1)).toBe(false);
    });

    it("clears multiple elements", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.insert(3, "three");
      list.clear();
      expect(list.size).toBe(0);
      expect(list.has(1)).toBe(false);
      expect(list.has(2)).toBe(false);
      expect(list.has(3)).toBe(false);
    });

    it("clears many elements", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(i, i);
      }
      list.clear();
      expect(list.size).toBe(0);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty list", () => {
      const list = new SplitOrderedList<string>();
      expect(list.toArray()).toEqual([]);
    });

    it("returns array with single element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      expect(list.toArray()).toEqual([[1, "one"]]);
    });

    it("returns array with multiple elements", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      const arr = list.toArray();
      expect(arr.length).toBe(3);
    });

    it("returns key-value pairs", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      const arr = list.toArray();
      expect(arr.some(([k, v]) => k === 1 && v === "one")).toBe(true);
      expect(arr.some(([k, v]) => k === 2 && v === "two")).toBe(true);
    });

    it("handles many elements", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i, i);
      }
      const arr = list.toArray();
      expect(arr.length).toBe(50);
    });
  });

  describe("forEach", () => {
    it("does not call callback on empty list", () => {
      const list = new SplitOrderedList<string>();
      let called = false;
      list.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it("calls callback once for single element", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(1);
    });

    it("calls callback for each element", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(3);
    });

    it("passes correct value and key to callback", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      const results: Array<{ value: string; key: number }> = [];
      list.forEach((value, key) => {
        results.push({ value, key });
      });
      expect(results[0]).toEqual({ value: "one", key: 1 });
    });

    it("handles many elements", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i, i);
      }
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(50);
    });
  });

  describe("edge cases", () => {
    it("handles maximum safe integer key", () => {
      const list = new SplitOrderedList<string>();
      const maxKey = Number.MAX_SAFE_INTEGER;
      expect(list.insert(maxKey, "max")).toBe(true);
      expect(list.has(maxKey)).toBe(true);
    });

    it("handles minimum safe integer key", () => {
      const list = new SplitOrderedList<string>();
      const minKey = Number.MIN_SAFE_INTEGER;
      expect(list.insert(minKey, "min")).toBe(true);
      expect(list.has(minKey)).toBe(true);
    });

    it("inserts and deletes same key repeatedly", () => {
      const list = new SplitOrderedList<string>();
      for (let i = 0; i < 10; i++) {
        expect(list.insert(1, `value-${i}`)).toBe(true);
        expect(list.delete(1)).toBe(true);
      }
      expect(list.size).toBe(0);
    });

    it("handles alternating insert and delete", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.delete(1);
      list.insert(3, 3);
      list.delete(2);
      list.insert(4, 4);
      expect(list.size).toBe(2);
      expect(list.has(3)).toBe(true);
      expect(list.has(4)).toBe(true);
    });

    it("clears and reinserts elements", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.clear();
      list.insert(1, 1);
      list.insert(2, 2);
      expect(list.size).toBe(2);
    });
  });

  describe("large datasets", () => {
    it("handles 1000 inserts", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 1000; i++) {
        expect(list.insert(i, i)).toBe(true);
      }
      expect(list.size).toBe(1000);
    });

    it("finds elements in large dataset", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 500; i++) {
        list.insert(i, i);
      }
      for (let i = 0; i < 500; i++) {
        expect(list.has(i)).toBe(true);
      }
    });

    it("deletes elements from large dataset", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 500; i++) {
        list.insert(i, i);
      }
      for (let i = 0; i < 250; i++) {
        expect(list.delete(i)).toBe(true);
      }
      expect(list.size).toBe(250);
    });

    it("forEach on large dataset", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 500; i++) {
        list.insert(i, i);
      }
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(500);
    });

    it("toArray on large dataset", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 300; i++) {
        list.insert(i, i);
      }
      const arr = list.toArray();
      expect(arr.length).toBe(300);
    });
  });

  describe("hash collisions", () => {
    it("handles keys with same hash pattern", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.insert(4, "four");
      expect(list.size).toBe(3);
      expect(list.has(1)).toBe(true);
      expect(list.has(2)).toBe(true);
      expect(list.has(4)).toBe(true);
    });

    it("updates correct key on collision", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.insert(1, "one-updated");
      expect(list.get(1)).toBe("one-updated");
      expect(list.get(2)).toBe("two");
    });

    it("deletes correct key on collision", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.insert(4, "four");
      expect(list.delete(2)).toBe(true);
      expect(list.has(1)).toBe(true);
      expect(list.has(2)).toBe(false);
      expect(list.has(4)).toBe(true);
    });

    it("finds correct key on collision", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.insert(4, "four");
      expect(list.get(1)).toBe("one");
      expect(list.get(2)).toBe("two");
      expect(list.get(4)).toBe("four");
    });
  });

  describe("complex operations", () => {
    it("inserts after delete", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.delete(1);
      list.insert(1, "one-new");
      expect(list.size).toBe(2);
      expect(list.get(1)).toBe("one-new");
    });

    it("inserts in ascending order", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 10; i++) {
        list.insert(i, i);
      }
      expect(list.size).toBe(10);
    });

    it("inserts in descending order", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 9; i >= 0; i--) {
        list.insert(i, i);
      }
      expect(list.size).toBe(10);
    });

    it("inserts in random order", () => {
      const list = new SplitOrderedList<number>();
      const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0];
      for (const key of keys) {
        list.insert(key, key);
      }
      expect(list.size).toBe(10);
    });

    it("updates and deletes same key", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(1, "two");
      list.insert(1, "three");
      expect(list.delete(1)).toBe(true);
      expect(list.has(1)).toBe(false);
    });

    it("forEach after mutations", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(2);
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(2);
    });

    it("toArray after mutations", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(2);
      list.insert(4, 4);
      const arr = list.toArray();
      expect(arr.length).toBe(3);
    });
  });
});

  it("has loadFactor of 0.75", () => {
    expect(DEFAULT_SPLIT_ORDERED_LIST_OPTIONS.loadFactor).toBe(0.75);
  });
});

describe("SplitOrderedList", () => {
  let list: SplitOrderedList<string, number>;

  beforeEach(() => {
    list = new SplitOrderedList<string, number>();
  });

  describe("constructor", () => {
    it("creates instance with default options", () => {
      const l = new SplitOrderedList<string, number>();
      expect(l.size).toBe(0);
      expect(l.isEmpty).toBe(true);
      expect(l.bucketCount).toBe(16);
    });

    it("creates instance with custom initialBuckets", () => {
      const l = new SplitOrderedList<string, number>({ initialBuckets: 32 });
      expect(l.bucketCount).toBe(32);
    });

    it("creates instance with custom loadFactor", () => {
      const l = new SplitOrderedList<string, number>({ loadFactor: 0.5 });
      expect(l.loadFactor).toBe(0);
    });

    it("creates instance with both options", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 8,
        loadFactor: 0.9,
      });
      expect(l.bucketCount).toBe(8);
    });

    it("handles initialBuckets of 1", () => {
      const l = new SplitOrderedList<string, number>({ initialBuckets: 1 });
      expect(l.bucketCount).toBe(1);
    });

    it("clamps initialBuckets to minimum of 1", () => {
      const l = new SplitOrderedList<string, number>({ initialBuckets: 0 });
      expect(l.bucketCount).toBe(1);
    });

    it("handles negative initialBuckets", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: -5,
      });
      expect(l.bucketCount).toBe(1);
    });
  });

  describe("set / get", () => {
    it("sets and gets a value", () => {
      list.set("a", 1);
      expect(list.get("a")).toBe(1);
    });

    it("returns undefined for missing key", () => {
      expect(list.get("missing")).toBeUndefined();
    });

    it("overwrites existing key", () => {
      list.set("a", 1);
      list.set("a", 2);
      expect(list.get("a")).toBe(2);
      expect(list.size).toBe(1);
    });

    it("handles multiple keys", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      expect(list.get("a")).toBe(1);
      expect(list.get("b")).toBe(2);
      expect(list.get("c")).toBe(3);
    });

    it("handles numeric string keys", () => {
      list.set("0", 10);
      list.set("1", 20);
      expect(list.get("0")).toBe(10);
      expect(list.get("1")).toBe(20);
    });

    it("handles empty string key", () => {
      list.set("", 42);
      expect(list.get("")).toBe(42);
    });

    it("handles long string keys", () => {
      const longKey = "a".repeat(1000);
      list.set(longKey, 99);
      expect(list.get(longKey)).toBe(99);
    });

    it("handles special character keys", () => {
      list.set("key with spaces", 1);
      list.set("key\nwith\nnewlines", 2);
      list.set("key\twith\ttabs", 3);
      expect(list.get("key with spaces")).toBe(1);
      expect(list.get("key\nwith\nnewlines")).toBe(2);
      expect(list.get("key\twith\ttabs")).toBe(3);
    });

    it("handles unicode keys", () => {
      list.set("日本語", 1);
      list.set("🎉", 2);
      list.set("café", 3);
      expect(list.get("日本語")).toBe(1);
      expect(list.get("🎉")).toBe(2);
      expect(list.get("café")).toBe(3);
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      list.set("a", 1);
      expect(list.has("a")).toBe(true);
    });

    it("returns false for missing key", () => {
      expect(list.has("missing")).toBe(false);
    });

    it("returns false after delete", () => {
      list.set("a", 1);
      list.delete("a");
      expect(list.has("a")).toBe(false);
    });

    it("returns true after overwrite", () => {
      list.set("a", 1);
      list.set("a", 2);
      expect(list.has("a")).toBe(true);
    });
  });

  describe("delete", () => {
    it("deletes an existing key", () => {
      list.set("a", 1);
      expect(list.delete("a")).toBe(true);
      expect(list.get("a")).toBeUndefined();
      expect(list.size).toBe(0);
    });

    it("returns false for missing key", () => {
      expect(list.delete("missing")).toBe(false);
    });

    it("does not affect other keys", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.delete("a");
      expect(list.get("b")).toBe(2);
      expect(list.size).toBe(1);
    });

    it("handles delete and re-insert", () => {
      list.set("a", 1);
      list.delete("a");
      list.set("a", 2);
      expect(list.get("a")).toBe(2);
      expect(list.size).toBe(1);
    });

    it("handles deleting all keys", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      list.delete("a");
      list.delete("b");
      list.delete("c");
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe("size / isEmpty", () => {
    it("returns correct size after inserts", () => {
      expect(list.size).toBe(0);
      list.set("a", 1);
      expect(list.size).toBe(1);
      list.set("b", 2);
      expect(list.size).toBe(2);
    });

    it("size does not increase on overwrite", () => {
      list.set("a", 1);
      list.set("a", 2);
      expect(list.size).toBe(1);
    });

    it("size decreases on delete", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.delete("a");
      expect(list.size).toBe(1);
    });

    it("isEmpty returns true when empty", () => {
      expect(list.isEmpty).toBe(true);
    });

    it("isEmpty returns false when not empty", () => {
      list.set("a", 1);
      expect(list.isEmpty).toBe(false);
    });

    it("isEmpty returns true after clearing all items", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.delete("a");
      list.delete("b");
      expect(list.isEmpty).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it("allows set after clear", () => {
      list.set("a", 1);
      list.clear();
      list.set("b", 2);
      expect(list.get("b")).toBe(2);
      expect(list.size).toBe(1);
    });

    it("preserves bucket count", () => {
      const bc = list.bucketCount;
      list.set("a", 1);
      list.clear();
      expect(list.bucketCount).toBe(bc);
    });
  });

  describe("keys / values / entries", () => {
    it("returns all keys", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      const keys = list.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys).toContain("c");
    });

    it("returns all values", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      const values = list.values();
      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it("returns all entries", () => {
      list.set("a", 1);
      list.set("b", 2);
      const entries = list.entries();
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(["a", 1]);
      expect(entries).toContainEqual(["b", 2]);
    });

    it("returns empty arrays when empty", () => {
      expect(list.keys()).toEqual([]);
      expect(list.values()).toEqual([]);
      expect(list.entries()).toEqual([]);
    });

    it("entries contain correct key-value pairs after overwrite", () => {
      list.set("a", 1);
      list.set("a", 99);
      const entries = list.entries();
      expect(entries).toEqual([["a", 99]]);
    });

    it("keys do not include deleted entries", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.delete("a");
      const keys = list.keys();
      expect(keys).toEqual(["b"]);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      const result: Array<[string, number]> = [];
      list.forEach((v, k) => {
        result.push([k, v]);
      });
      expect(result.length).toBe(3);
      expect(result).toContainEqual(["a", 1]);
      expect(result).toContainEqual(["b", 2]);
      expect(result).toContainEqual(["c", 3]);
    });

    it("passes the list instance as third argument", () => {
      list.set("a", 1);
      let ref: SplitOrderedList<string, number> | undefined;
      list.forEach((_v, _k, m) => {
        ref = m;
      });
      expect(ref).toBe(list);
    });

    it("does not iterate when empty", () => {
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      list.set("a", 1);
      list.set("b", 2);
      const result = [...list];
      expect(result.length).toBe(2);
      expect(result).toContainEqual(["a", 1]);
      expect(result).toContainEqual(["b", 2]);
    });

    it("works with for...of", () => {
      list.set("x", 10);
      list.set("y", 20);
      const result: Array<[string, number]> = [];
      for (const entry of list) {
        result.push(entry);
      }
      expect(result.length).toBe(2);
    });

    it("yields nothing when empty", () => {
      const result = [...list];
      expect(result).toEqual([]);
    });
  });

  describe("loadFactor / bucketCount", () => {
    it("loadFactor is 0 when empty", () => {
      expect(list.loadFactor).toBe(0);
    });

    it("loadFactor increases with inserts", () => {
      list.set("a", 1);
      expect(list.loadFactor).toBeGreaterThan(0);
    });

    it("bucketCount matches initial buckets", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 8,
      });
      expect(l.bucketCount).toBe(8);
    });

    it("bucketCount doubles on resize", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 4,
        loadFactor: 0.5,
      });
      for (let i = 0; i < 10; i++) {
        l.set(`key${i}`, i);
      }
      expect(l.bucketCount).toBeGreaterThan(4);
    });
  });

  describe("getStatistics", () => {
    it("returns initial statistics", () => {
      const stats = list.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.lookups).toBe(0);
      expect(stats.resizes).toBe(0);
      expect(stats.bucketCount).toBe(16);
    });

    it("tracks inserts", () => {
      list.set("a", 1);
      list.set("b", 2);
      expect(list.getStatistics().inserts).toBe(2);
    });

    it("tracks overwrites as inserts", () => {
      list.set("a", 1);
      list.set("a", 2);
      expect(list.getStatistics().inserts).toBe(2);
    });

    it("tracks deletes", () => {
      list.set("a", 1);
      list.delete("a");
      expect(list.getStatistics().deletes).toBe(1);
    });

    it("tracks lookups from get", () => {
      list.set("a", 1);
      list.get("a");
      list.get("missing");
      expect(list.getStatistics().lookups).toBe(2);
    });

    it("tracks lookups from has", () => {
      list.set("a", 1);
      list.has("a");
      list.has("missing");
      expect(list.getStatistics().lookups).toBe(2);
    });

    it("tracks deletes even for missing keys", () => {
      list.delete("missing");
      expect(list.getStatistics().deletes).toBe(1);
    });

    it("resets statistics on clear", () => {
      list.set("a", 1);
      list.get("a");
      list.delete("a");
      list.clear();
      const stats = list.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.lookups).toBe(0);
      expect(stats.resizes).toBe(0);
    });

    it("returns a copy (not reference)", () => {
      const stats1 = list.getStatistics();
      stats1.inserts = 999;
      const stats2 = list.getStatistics();
      expect(stats2.inserts).toBe(0);
    });

    it("tracks resizes", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 2,
        loadFactor: 0.5,
      });
      for (let i = 0; i < 20; i++) {
        l.set(`key${i}`, i);
      }
      expect(l.getStatistics().resizes).toBeGreaterThan(0);
    });

    it("bucketCount in stats matches bucketCount getter", () => {
      list.set("a", 1);
      expect(list.getStatistics().bucketCount).toBe(list.bucketCount);
    });
  });

  describe("reserve", () => {
    it("pre-allocates buckets", () => {
      list.reserve(100);
      expect(list.bucketCount).toBeGreaterThanOrEqual(
        Math.ceil(100 / 0.75),
      );
    });

    it("does not shrink buckets", () => {
      const initial = list.bucketCount;
      list.reserve(0);
      expect(list.bucketCount).toBe(initial);
    });

    it("works on empty list", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 4,
      });
      l.reserve(50);
      expect(l.bucketCount).toBeGreaterThanOrEqual(4);
    });

    it("preserves existing entries", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.reserve(200);
      expect(list.get("a")).toBe(1);
      expect(list.get("b")).toBe(2);
      expect(list.size).toBe(2);
    });

    it("increments resizes in statistics", () => {
      list.reserve(100);
      expect(list.getStatistics().resizes).toBeGreaterThan(0);
    });
  });

  describe("resize behavior", () => {
    it("maintains data integrity after resize", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 2,
        loadFactor: 0.5,
      });
      const keys = [];
      for (let i = 0; i < 50; i++) {
        l.set(`key${i}`, i);
        keys.push(`key${i}`);
      }
      for (const key of keys) {
        expect(l.get(key)).toBeDefined();
      }
      expect(l.size).toBe(50);
    });

    it("can delete after resize", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 2,
        loadFactor: 0.5,
      });
      for (let i = 0; i < 20; i++) {
        l.set(`key${i}`, i);
      }
      for (let i = 0; i < 20; i++) {
        expect(l.delete(`key${i}`)).toBe(true);
      }
      expect(l.size).toBe(0);
    });

    it("can overwrite after resize", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 2,
        loadFactor: 0.5,
      });
      for (let i = 0; i < 20; i++) {
        l.set(`key${i}`, i);
      }
      for (let i = 0; i < 20; i++) {
        l.set(`key${i}`, i * 10);
      }
      expect(l.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(l.get(`key${i}`)).toBe(i * 10);
      }
    });
  });

  describe("number keys", () => {
    it("works with number keys", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(1, "one");
      l.set(2, "two");
      l.set(3, "three");
      expect(l.get(1)).toBe("one");
      expect(l.get(2)).toBe("two");
      expect(l.get(3)).toBe("three");
    });

    it("handles number key collisions", () => {
      const l = new SplitOrderedList<number, number>();
      l.set(1, 10);
      l.set(1, 20);
      expect(l.get(1)).toBe(20);
      expect(l.size).toBe(1);
    });

    it("deletes number keys", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(42, "answer");
      expect(l.delete(42)).toBe(true);
      expect(l.get(42)).toBeUndefined();
    });
  });

  describe("object values", () => {
    it("stores object values", () => {
      const l = new SplitOrderedList<string, { x: number }>();
      const obj = { x: 42 };
      l.set("a", obj);
      expect(l.get("a")).toBe(obj);
      expect(l.get("a")!.x).toBe(42);
    });

    it("stores null values", () => {
      const l = new SplitOrderedList<string, string | null>();
      l.set("a", null);
      expect(l.get("a")).toBeNull();
      expect(l.size).toBe(1);
    });

    it("stores undefined values", () => {
      const l = new SplitOrderedList<string, string | undefined>();
      l.set("a", undefined);
      expect(l.get("a")).toBeUndefined();
      expect(l.size).toBe(1);
      expect(l.has("a")).toBe(true);
    });
  });

  describe("stress tests", () => {
    it("handles many insertions", () => {
      const l = new SplitOrderedList<number, number>({
        initialBuckets: 4,
        loadFactor: 0.75,
      });
      for (let i = 0; i < 200; i++) {
        l.set(i, i * 2);
      }
      expect(l.size).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(l.get(i)).toBe(i * 2);
      }
    });

    it("handles mixed operations", () => {
      const l = new SplitOrderedList<number, number>({
        initialBuckets: 4,
      });
      for (let i = 0; i < 100; i++) {
        l.set(i, i);
      }
      for (let i = 0; i < 50; i++) {
        l.delete(i);
      }
      expect(l.size).toBe(50);
      for (let i = 50; i < 100; i++) {
        expect(l.get(i)).toBe(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(l.get(i)).toBeUndefined();
      }
    });

    it("handles insert-delete-reinsert cycles", () => {
      for (let i = 0; i < 20; i++) {
        list.set(`key${i}`, i);
      }
      for (let i = 0; i < 20; i++) {
        list.delete(`key${i}`);
      }
      expect(list.size).toBe(0);
      for (let i = 0; i < 20; i++) {
        list.set(`key${i}`, i + 100);
      }
      expect(list.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(list.get(`key${i}`)).toBe(i + 100);
      }
    });

    it("handles large number of unique keys", () => {
      const l = new SplitOrderedList<string, number>({
        initialBuckets: 2,
      });
      for (let i = 0; i < 500; i++) {
        l.set(`unique_key_${i}`, i);
      }
      expect(l.size).toBe(500);
      for (let i = 0; i < 500; i++) {
        expect(l.has(`unique_key_${i}`)).toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    it("handles case-sensitive keys", () => {
      list.set("Key", 1);
      list.set("key", 2);
      list.set("KEY", 3);
      expect(list.get("Key")).toBe(1);
      expect(list.get("key")).toBe(2);
      expect(list.get("KEY")).toBe(3);
      expect(list.size).toBe(3);
    });

    it("handles keys that differ by whitespace", () => {
      list.set("key", 1);
      list.set("key ", 2);
      list.set(" key", 3);
      expect(list.get("key")).toBe(1);
      expect(list.get("key ")).toBe(2);
      expect(list.get(" key")).toBe(3);
    });

    it("handles boolean-like string keys", () => {
      list.set("true", 1);
      list.set("false", 2);
      list.set("null", 3);
      list.set("undefined", 4);
      expect(list.get("true")).toBe(1);
      expect(list.get("false")).toBe(2);
      expect(list.get("null")).toBe(3);
      expect(list.get("undefined")).toBe(4);
    });

    it("handles single character keys", () => {
      for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(97 + i);
        list.set(ch, i);
      }
      expect(list.size).toBe(26);
      for (let i = 0; i < 26; i++) {
        const ch = String.fromCharCode(97 + i);
        expect(list.get(ch)).toBe(i);
      }
    });

    it("clear and reuse multiple times", () => {
      for (let round = 0; round < 5; round++) {
        list.set("a", round);
        list.set("b", round);
        expect(list.size).toBe(2);
        list.clear();
        expect(list.size).toBe(0);
      }
    });

    it("entries returns correct count after complex operations", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      list.delete("b");
      list.set("d", 4);
      list.set("a", 10);
      expect(list.entries().length).toBe(3);
    });
  });

  describe("type safety", () => {
    it("works with generic types", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(1, "one");
      const val: string | undefined = l.get(1);
      expect(val).toBe("one");
    });

    it("works with complex value types", () => {
      const l = new SplitOrderedList<string, number[]>();
      l.set("a", [1, 2, 3]);
      l.set("b", [4, 5, 6]);
      expect(l.get("a")).toEqual([1, 2, 3]);
      expect(l.get("b")).toEqual([4, 5, 6]);
    });

    it("works with Map values", () => {
      const l = new SplitOrderedList<string, Map<string, number>>();
      const m = new Map([["x", 1]]);
      l.set("a", m);
      expect(l.get("a")).toBe(m);
      expect(l.get("a")!.get("x")).toBe(1);
    });
  });

  describe("additional edge cases", () => {
    it("handles boolean key true", () => {
      const l = new SplitOrderedList<boolean, string>();
      l.set(true, "yes");
      l.set(false, "no");
      expect(l.get(true)).toBe("yes");
      expect(l.get(false)).toBe("no");
    });

    it("handles zero as a number key", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(0, "zero");
      expect(l.get(0)).toBe("zero");
    });

    it("handles negative number keys", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(-1, "neg1");
      l.set(-100, "neg100");
      expect(l.get(-1)).toBe("neg1");
      expect(l.get(-100)).toBe("neg100");
    });

    it("handles float number keys", () => {
      const l = new SplitOrderedList<number, string>();
      l.set(1.5, "one-point-five");
      l.set(0.1, "zero-point-one");
      expect(l.get(1.5)).toBe("one-point-five");
      expect(l.get(0.1)).toBe("zero-point-one");
    });

    it("handles very large string keys", () => {
      const key = "x".repeat(10000);
      list.set(key, 42);
      expect(list.get(key)).toBe(42);
    });

    it("handles delete of only item", () => {
      list.set("only", 1);
      expect(list.delete("only")).toBe(true);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it("handles get on empty list", () => {
      expect(list.get("nothing")).toBeUndefined();
    });

    it("handles has on empty list", () => {
      expect(list.has("nothing")).toBe(false);
    });

    it("handles delete on empty list", () => {
      expect(list.delete("nothing")).toBe(false);
    });

    it("handles keys after partial delete", () => {
      for (let i = 0; i < 10; i++) {
        list.set(`k${i}`, i);
      }
      for (let i = 0; i < 10; i += 2) {
        list.delete(`k${i}`);
      }
      const keys = list.keys();
      expect(keys.length).toBe(5);
      expect(keys).toContain("k1");
      expect(keys).toContain("k3");
      expect(keys).toContain("k5");
      expect(keys).toContain("k7");
      expect(keys).toContain("k9");
    });

    it("handles values after partial delete", () => {
      for (let i = 0; i < 10; i++) {
        list.set(`k${i}`, i * 10);
      }
      list.delete("k0");
      list.delete("k5");
      const vals = list.values();
      expect(vals.length).toBe(8);
      expect(vals).toContain(10);
      expect(vals).toContain(90);
    });

    it("forEach visits correct count", () => {
      let count = 0;
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(3);
    });

    it("iterator yields correct count", () => {
      list.set("a", 1);
      list.set("b", 2);
      list.set("c", 3);
      let count = 0;
      for (const _ of list) {
        count++;
      }
      expect(count).toBe(3);
    });
  });
});
