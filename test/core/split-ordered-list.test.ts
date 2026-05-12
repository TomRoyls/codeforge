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

  describe("additional insert tests", () => {
    it("handles consecutive keys", () => {
      const list = new SplitOrderedList<number>();
      list.insert(10, 10);
      list.insert(11, 11);
      list.insert(12, 12);
      expect(list.size).toBe(3);
      expect(list.get(10)).toBe(10);
      expect(list.get(11)).toBe(11);
      expect(list.get(12)).toBe(12);
    });

    it("handles widely spaced keys", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(100, 100);
      list.insert(1000, 1000);
      expect(list.size).toBe(3);
      expect(list.get(1)).toBe(1);
      expect(list.get(100)).toBe(100);
      expect(list.get(1000)).toBe(1000);
    });

    it("inserts after multiple deletes", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(1);
      list.delete(3);
      list.insert(4, 4);
      list.insert(5, 5);
      expect(list.size).toBe(3);
      expect(list.has(2)).toBe(true);
      expect(list.has(4)).toBe(true);
      expect(list.has(5)).toBe(true);
    });
  });

  describe("additional delete tests", () => {
    it("handles delete after clear", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.clear();
      expect(list.delete(1)).toBe(false);
    });

    it("handles delete and reinsert pattern", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 5; i++) {
        list.insert(i, i);
        list.delete(i);
      }
      expect(list.size).toBe(0);
      list.insert(0, 0);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(0);
    });

    it("handles interleaved insert and delete", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.delete(1);
      list.insert(3, 3);
      list.delete(2);
      list.insert(4, 4);
      list.delete(3);
      expect(list.size).toBe(1);
      expect(list.get(4)).toBe(4);
    });
  });

  describe("additional has tests", () => {
    it("has returns false after multiple deletes", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(1);
      list.delete(2);
      list.delete(3);
      expect(list.has(1)).toBe(false);
      expect(list.has(2)).toBe(false);
      expect(list.has(3)).toBe(false);
    });

    it("has returns true for all inserted keys", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 20; i++) {
        list.insert(i, i);
      }
      for (let i = 0; i < 20; i++) {
        expect(list.has(i)).toBe(true);
      }
    });

    it("has returns false for non-inserted keys", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      expect(list.has(3)).toBe(false);
      expect(list.has(4)).toBe(false);
      expect(list.has(5)).toBe(false);
    });
  });

  describe("additional get tests", () => {
    it("get returns correct values after clear and reinsert", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.clear();
      list.insert(1, 10);
      list.insert(2, 20);
      expect(list.get(1)).toBe(10);
      expect(list.get(2)).toBe(20);
    });

    it("get returns null for deleted keys", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      list.delete(1);
      expect(list.get(1)).toBe(null);
      expect(list.get(2)).toBe("two");
    });

    it("get handles sequential keys", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i, i * 2);
      }
      for (let i = 0; i < 50; i++) {
        expect(list.get(i)).toBe(i * 2);
      }
    });
  });

  describe("additional size tests", () => {
    it("size returns correct value after multiple operations", () => {
      const list = new SplitOrderedList<number>();
      expect(list.size).toBe(0);
      list.insert(1, 1);
      expect(list.size).toBe(1);
      list.insert(2, 2);
      expect(list.size).toBe(2);
      list.insert(1, 10);
      expect(list.size).toBe(2);
      list.delete(1);
      expect(list.size).toBe(1);
      list.insert(3, 3);
      expect(list.size).toBe(2);
    });

    it("size after insert-delete-insert", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.delete(1);
      list.insert(1, 1);
      expect(list.size).toBe(1);
    });

    it("size after multiple duplicate inserts", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(1, "two");
      list.insert(1, "three");
      list.insert(1, "four");
      list.insert(2, "two");
      expect(list.size).toBe(2);
    });
  });

  describe("additional isEmpty tests", () => {
    it("isEmpty after insert and delete all", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(1);
      list.delete(2);
      list.delete(3);
      expect(list.isEmpty()).toBe(true);
    });

    it("isEmpty after clear and insert", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.clear();
      list.insert(1, "one");
      expect(list.isEmpty()).toBe(false);
    });

    it("isEmpty handles single element", () => {
      const list = new SplitOrderedList<number>();
      expect(list.isEmpty()).toBe(true);
      list.insert(1, 1);
      expect(list.isEmpty()).toBe(false);
      list.delete(1);
      expect(list.isEmpty()).toBe(true);
    });
  });

  describe("additional clear tests", () => {
    it("clear handles large dataset", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 200; i++) {
        list.insert(i, i);
      }
      expect(list.size).toBe(200);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it("clear can be called multiple times", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.clear();
      list.clear();
      list.clear();
      expect(list.size).toBe(0);
    });

    it("clear after partial deletes", () => {
      const list = new SplitOrderedList<number>();
      for (let i = 0; i < 20; i++) {
        list.insert(i, i);
      }
      for (let i = 0; i < 10; i++) {
        list.delete(i);
      }
      list.clear();
      expect(list.size).toBe(0);
    });
  });

  describe("additional toArray tests", () => {
    it("toArray returns all elements after mutations", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(2);
      list.insert(4, 4);
      list.insert(5, 5);
      const arr = list.toArray();
      expect(arr.length).toBe(4);
    });

    it("toArray preserves key-value order", () => {
      const list = new SplitOrderedList<string>();
      list.insert(5, "five");
      list.insert(3, "three");
      list.insert(1, "one");
      const arr = list.toArray();
      expect(arr.length).toBe(3);
      expect(arr.some(([k, v]) => k === 5 && v === "five")).toBe(true);
      expect(arr.some(([k, v]) => k === 3 && v === "three")).toBe(true);
      expect(arr.some(([k, v]) => k === 1 && v === "one")).toBe(true);
    });

    it("toArray after clear", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.clear();
      expect(list.toArray()).toEqual([]);
    });
  });

  describe("additional forEach tests", () => {
    it("forEach visits all elements after mutations", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.insert(3, 3);
      list.delete(2);
      list.insert(4, 4);
      const visited: number[] = [];
      list.forEach((v, k) => {
        visited.push(k);
      });
      expect(visited.length).toBe(3);
      expect(visited).toContain(1);
      expect(visited).toContain(3);
      expect(visited).toContain(4);
    });

    it("forEach receives correct arguments", () => {
      const list = new SplitOrderedList<string>();
      list.insert(1, "one");
      list.insert(2, "two");
      const results: Array<{ key: number; value: string }> = [];
      list.forEach((value, key) => {
        results.push({ key, value });
      });
      expect(results.some((r) => r.key === 1 && r.value === "one")).toBe(true);
      expect(results.some((r) => r.key === 2 && r.value === "two")).toBe(true);
    });

    it("forEach after clear", () => {
      const list = new SplitOrderedList<number>();
      list.insert(1, 1);
      list.insert(2, 2);
      list.clear();
      let count = 0;
      list.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });
});
