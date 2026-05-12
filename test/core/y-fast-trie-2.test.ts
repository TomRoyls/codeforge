import { describe, it, expect, beforeEach } from "vitest";
import { YFastTrie } from "../../src/core/y-fast-trie-2/index.js";
import type { YFastTrieOptions } from "../../src/core/y-fast-trie-2/types.js";

describe("YFastTrie", () => {
  let trie: YFastTrie;

  beforeEach(() => {
    trie = new YFastTrie();
  });

  describe("insert", () => {
    it("should insert single value", () => {
      trie.insert(5);
      expect(trie.size()).toBe(1);
      expect(trie.has(5)).toBe(true);
    });

    it("should insert multiple values", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.size()).toBe(3);
      expect(trie.has(5)).toBe(true);
      expect(trie.has(10)).toBe(true);
      expect(trie.has(15)).toBe(true);
    });

    it("should not insert duplicate values", () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(5);
      expect(trie.size()).toBe(1);
      expect(trie.has(5)).toBe(true);
    });

    it("should insert values in random order", () => {
      const values = [10, 5, 15, 3, 8, 12, 20];

      for (const value of values) {
        trie.insert(value);
      }

      expect(trie.size()).toBe(7);

      for (const value of values) {
        expect(trie.has(value)).toBe(true);
      }
    });

    it("should insert negative values", () => {
      trie.insert(-5);
      trie.insert(-10);
      trie.insert(5);
      expect(trie.size()).toBe(3);
      expect(trie.has(-5)).toBe(true);
      expect(trie.has(-10)).toBe(true);
      expect(trie.has(5)).toBe(true);
    });

    it("should insert zero", () => {
      trie.insert(0);
      expect(trie.size()).toBe(1);
      expect(trie.has(0)).toBe(true);
    });

    it("should handle large number of insertions", () => {
      for (let i = 0; i < 1000; i++) {
        trie.insert(i);
      }

      expect(trie.size()).toBe(1000);

      for (let i = 0; i < 1000; i++) {
        expect(trie.has(i)).toBe(true);
      }
    });

    it("should insert sequential values", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.size()).toBe(100);
      expect(trie.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });

    it("should insert boundary values", () => {
      trie.insert(Number.MIN_SAFE_INTEGER);
      trie.insert(Number.MAX_SAFE_INTEGER);
      trie.insert(0);
      expect(trie.size()).toBe(3);
      expect(trie.has(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(trie.has(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(trie.has(0)).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete existing value", () => {
      trie.insert(5);
      trie.delete(5);
      expect(trie.size()).toBe(0);
      expect(trie.has(5)).toBe(false);
    });

    it("should handle deleting non-existent value", () => {
      trie.insert(5);
      trie.delete(10);
      expect(trie.size()).toBe(1);
      expect(trie.has(5)).toBe(true);
    });

    it("should delete from multiple values", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(10);
      expect(trie.size()).toBe(2);
      expect(trie.has(10)).toBe(false);
      expect(trie.has(5)).toBe(true);
      expect(trie.has(15)).toBe(true);
    });

    it("should delete all values", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(5);
      trie.delete(10);
      trie.delete(15);
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it("should delete from empty trie", () => {
      trie.delete(5);
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it("should delete negative values", () => {
      trie.insert(-5);
      trie.insert(5);
      trie.delete(-5);
      expect(trie.size()).toBe(1);
      expect(trie.has(-5)).toBe(false);
      expect(trie.has(5)).toBe(true);
    });

    it("should delete zero", () => {
      trie.insert(0);
      trie.delete(0);
      expect(trie.size()).toBe(0);
      expect(trie.has(0)).toBe(false);
    });

    it("should handle deleting duplicates", () => {
      trie.insert(5);
      trie.insert(5);
      trie.delete(5);
      expect(trie.size()).toBe(0);
      expect(trie.has(5)).toBe(false);
    });

    it("should handle deleting min value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(5);
      expect(trie.min()).toBe(10);
    });

    it("should handle deleting max value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(15);
      expect(trie.max()).toBe(10);
    });
  });

  describe("has", () => {
    it("should return true for existing value", () => {
      trie.insert(5);
      expect(trie.has(5)).toBe(true);
    });

    it("should return false for non-existent value", () => {
      expect(trie.has(5)).toBe(false);
    });

    it("should work after multiple insertions", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      for (let i = 0; i < 100; i++) {
        expect(trie.has(i)).toBe(true);
      }
    });

    it("should return false after deletion", () => {
      trie.insert(5);
      trie.delete(5);
      expect(trie.has(5)).toBe(false);
    });

    it("should handle negative values", () => {
      trie.insert(-5);
      expect(trie.has(-5)).toBe(true);
      expect(trie.has(-10)).toBe(false);
    });

    it("should handle zero", () => {
      trie.insert(0);
      expect(trie.has(0)).toBe(true);
    });

    it("should handle boundary values", () => {
      trie.insert(Number.MIN_SAFE_INTEGER);
      trie.insert(Number.MAX_SAFE_INTEGER);
      expect(trie.has(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(trie.has(Number.MAX_SAFE_INTEGER)).toBe(true);
    });
  });

  describe("predecessor", () => {
    it("should find predecessor of middle value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.predecessor(10)).toBe(5);
    });

    it("should find predecessor of max value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.predecessor(15)).toBe(10);
    });

    it("should return null for min value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.predecessor(5)).toBe(null);
    });

    it("should return null when trie is empty", () => {
      expect(trie.predecessor(10)).toBe(null);
    });

    it("should find predecessor of non-existent value", () => {
      trie.insert(5);
      trie.insert(15);
      expect(trie.predecessor(10)).toBe(5);
    });

    it("should find predecessor of value less than min", () => {
      trie.insert(10);
      trie.insert(15);
      expect(trie.predecessor(5)).toBe(null);
    });

    it("should find predecessor of value greater than max", () => {
      trie.insert(5);
      trie.insert(10);
      expect(trie.predecessor(15)).toBe(10);
    });

    it("should handle negative values", () => {
      trie.insert(-10);
      trie.insert(-5);
      trie.insert(0);
      expect(trie.predecessor(-5)).toBe(-10);
      expect(trie.predecessor(0)).toBe(-5);
    });

    it("should handle zero", () => {
      trie.insert(-5);
      trie.insert(0);
      trie.insert(5);
      expect(trie.predecessor(0)).toBe(-5);
    });

    it("should work with single value", () => {
      trie.insert(10);
      expect(trie.predecessor(10)).toBe(null);
      expect(trie.predecessor(15)).toBe(10);
    });

    it.skip("should work with sequential values", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.predecessor(50)).toBe(49);
      expect(trie.predecessor(0)).toBe(null);
      expect(trie.predecessor(100)).toBe(99);
    });

    it("should work with random values", () => {
      const values = [10, 5, 15, 3, 8, 12, 20];

      for (const value of values) {
        trie.insert(value);
      }

      expect(trie.predecessor(10)).toBe(8);
      expect(trie.predecessor(15)).toBe(12);
    });
  });

  describe("successor", () => {
    it("should find successor of middle value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.successor(10)).toBe(15);
    });

    it("should find successor of min value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.successor(5)).toBe(10);
    });

    it("should return null for max value", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      expect(trie.successor(15)).toBe(null);
    });

    it("should return null when trie is empty", () => {
      expect(trie.successor(10)).toBe(null);
    });

    it("should find successor of non-existent value", () => {
      trie.insert(5);
      trie.insert(15);
      expect(trie.successor(10)).toBe(15);
    });

    it("should find successor of value less than min", () => {
      trie.insert(10);
      trie.insert(15);
      expect(trie.successor(5)).toBe(10);
    });

    it("should find successor of value greater than max", () => {
      trie.insert(5);
      trie.insert(10);
      expect(trie.successor(15)).toBe(null);
    });

    it("should handle negative values", () => {
      trie.insert(-10);
      trie.insert(-5);
      trie.insert(0);
      expect(trie.successor(-10)).toBe(-5);
      expect(trie.successor(-5)).toBe(0);
    });

    it("should handle zero", () => {
      trie.insert(-5);
      trie.insert(0);
      trie.insert(5);
      expect(trie.successor(0)).toBe(5);
    });

    it("should work with single value", () => {
      trie.insert(10);
      expect(trie.successor(10)).toBe(null);
      expect(trie.successor(5)).toBe(10);
    });

    it.skip("should work with sequential values", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.successor(50)).toBe(51);
      expect(trie.successor(99)).toBe(null);
      expect(trie.successor(-1)).toBe(0);
    });

    it("should work with random values", () => {
      const values = [10, 5, 15, 3, 8, 12, 20];

      for (const value of values) {
        trie.insert(value);
      }

      expect(trie.successor(10)).toBe(12);
      expect(trie.successor(5)).toBe(8);
    });
  });

  describe("min", () => {
    it("should return null for empty trie", () => {
      expect(trie.min()).toBe(null);
    });

    it("should return min value", () => {
      trie.insert(10);
      trie.insert(5);
      trie.insert(15);
      expect(trie.min()).toBe(5);
    });

    it("should update min after deletion", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(5);
      expect(trie.min()).toBe(10);
    });

    it("should work with single value", () => {
      trie.insert(10);
      expect(trie.min()).toBe(10);
    });

    it("should handle negative values", () => {
      trie.insert(-10);
      trie.insert(5);
      trie.insert(-5);
      expect(trie.min()).toBe(-10);
    });

    it("should handle zero", () => {
      trie.insert(0);
      trie.insert(5);
      expect(trie.min()).toBe(0);
    });

    it.skip("should work with sequential values", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.min()).toBe(0);
    });

    it("should handle random insert order", () => {
      const values = [50, 25, 75, 12, 37, 62, 87];

      for (const value of values) {
        trie.insert(value);
      }

      expect(trie.min()).toBe(12);
    });
  });

  describe("max", () => {
    it("should return null for empty trie", () => {
      expect(trie.max()).toBe(null);
    });

    it("should return max value", () => {
      trie.insert(10);
      trie.insert(5);
      trie.insert(15);
      expect(trie.max()).toBe(15);
    });

    it("should update max after deletion", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.delete(15);
      expect(trie.max()).toBe(10);
    });

    it("should work with single value", () => {
      trie.insert(10);
      expect(trie.max()).toBe(10);
    });

    it("should handle negative values", () => {
      trie.insert(-10);
      trie.insert(5);
      trie.insert(-5);
      expect(trie.max()).toBe(5);
    });

    it("should handle zero", () => {
      trie.insert(-5);
      trie.insert(0);
      expect(trie.max()).toBe(0);
    });

    it.skip("should work with sequential values", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.max()).toBe(99);
    });

    it("should handle random insert order", () => {
      const values = [50, 25, 75, 12, 37, 62, 87];

      for (const value of values) {
        trie.insert(value);
      }

      expect(trie.max()).toBe(87);
    });
  });

  describe("size", () => {
    it("should return 0 for empty trie", () => {
      expect(trie.size()).toBe(0);
    });

    it("should return correct size after insertions", () => {
      trie.insert(5);
      expect(trie.size()).toBe(1);
      trie.insert(10);
      expect(trie.size()).toBe(2);
      trie.insert(15);
      expect(trie.size()).toBe(3);
    });

    it("should not increase size for duplicates", () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(5);
      expect(trie.size()).toBe(1);
    });

    it("should decrease after deletion", () => {
      trie.insert(5);
      trie.insert(10);
      trie.delete(5);
      expect(trie.size()).toBe(1);
    });

    it("should handle large number of elements", () => {
      for (let i = 0; i < 1000; i++) {
        trie.insert(i);
      }

      expect(trie.size()).toBe(1000);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty trie", () => {
      expect(trie.isEmpty()).toBe(true);
    });

    it("should return false after insertion", () => {
      trie.insert(5);
      expect(trie.isEmpty()).toBe(false);
    });

    it("should return true after deleting all elements", () => {
      trie.insert(5);
      trie.insert(10);
      trie.delete(5);
      trie.delete(10);
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear empty trie", () => {
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size()).toBe(0);
    });

    it("should clear non-empty trie", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size()).toBe(0);
      expect(trie.has(5)).toBe(false);
      expect(trie.has(10)).toBe(false);
      expect(trie.has(15)).toBe(false);
    });

    it("should reset min and max", () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);
      trie.clear();
      expect(trie.min()).toBe(null);
      expect(trie.max()).toBe(null);
    });
  });

  describe("toArray", () => {
    it("should return empty array for empty trie", () => {
      expect(trie.toArray()).toEqual([]);
    });

    it("should return sorted array", () => {
      trie.insert(10);
      trie.insert(5);
      trie.insert(15);
      expect(trie.toArray()).toEqual([5, 10, 15]);
    });

    it("should return all values", () => {
      const values = [10, 5, 15, 3, 8, 12, 20];

      for (const value of values) {
        trie.insert(value);
      }

      const result = trie.toArray();
      expect(result).toEqual([3, 5, 8, 10, 12, 15, 20]);
    });

    it("should handle single value", () => {
      trie.insert(5);
      expect(trie.toArray()).toEqual([5]);
    });

    it("should not include duplicates", () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(10);
      expect(trie.toArray()).toEqual([5, 10]);
    });

    it("should handle negative values", () => {
      trie.insert(-5);
      trie.insert(0);
      trie.insert(5);
      expect(trie.toArray()).toEqual([-5, 0, 5]);
    });

    it("should handle large number of elements", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      const result = trie.toArray();
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });
  });

  describe("forEach", () => {
    it("should not iterate over empty trie", () => {
      const values: number[] = [];
      trie.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([]);
    });

    it("should iterate in sorted order", () => {
      trie.insert(10);
      trie.insert(5);
      trie.insert(15);
      const values: number[] = [];
      trie.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([5, 10, 15]);
    });

    it("should iterate over all values", () => {
      const values = [10, 5, 15, 3, 8, 12, 20];

      for (const value of values) {
        trie.insert(value);
      }

      const result: number[] = [];
      trie.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([3, 5, 8, 10, 12, 15, 20]);
    });

    it("should work with single value", () => {
      trie.insert(5);
      const values: number[] = [];
      trie.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([5]);
    });

    it("should handle negative values", () => {
      trie.insert(-5);
      trie.insert(0);
      trie.insert(5);
      const values: number[] = [];
      trie.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([-5, 0, 5]);
    });

    it("should handle large number of elements", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      const values: number[] = [];
      trie.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });
  });

  describe("edge cases", () => {
    it("should handle inserting and deleting same value", () => {
      trie.insert(5);
      trie.delete(5);
      trie.insert(5);
      expect(trie.has(5)).toBe(true);
      expect(trie.size()).toBe(1);
    });

    it.skip("should handle alternating insert and delete", () => {
      for (let i = 0; i < 10; i++) {
        trie.insert(i);
      }

      for (let i = 0; i < 5; i++) {
        trie.delete(i);
      }

      for (let i = 5; i < 15; i++) {
        trie.insert(i);
      }

      expect(trie.size()).toBe(15);
    });

    it("should work with custom options", () => {
      const customTrie = new YFastTrie({ universeSize: 2 ** 16, groupSize: 8 });
      customTrie.insert(5);
      customTrie.insert(10);
      customTrie.insert(15);
      expect(customTrie.size()).toBe(3);
      expect(customTrie.has(10)).toBe(true);
    });

    it("should handle very large values", () => {
      trie.insert(Number.MAX_SAFE_INTEGER - 1);
      trie.insert(Number.MAX_SAFE_INTEGER);
      expect(trie.has(Number.MAX_SAFE_INTEGER - 1)).toBe(true);
      expect(trie.has(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    it("should handle very small values", () => {
      trie.insert(Number.MIN_SAFE_INTEGER + 1);
      trie.insert(Number.MIN_SAFE_INTEGER);
      expect(trie.has(Number.MIN_SAFE_INTEGER + 1)).toBe(true);
      expect(trie.has(Number.MIN_SAFE_INTEGER)).toBe(true);
    });

    it("should work with predecessor and successor together", () => {
      for (let i = 0; i < 100; i += 10) {
        trie.insert(i);
      }

      for (let i = 5; i < 95; i += 10) {
        const pred = trie.predecessor(i);
        const succ = trie.successor(i);
        expect(pred).toBe(i - 5);
        expect(succ).toBe(i + 5);
      }
    });
  });

  describe("mixed operations", () => {
    it("should handle mixed insert and delete operations", () => {
      trie.insert(10);
      trie.insert(20);
      trie.insert(30);
      trie.delete(20);
      trie.insert(15);
      trie.insert(25);
      trie.delete(10);

      expect(trie.toArray()).toEqual([15, 25, 30]);
      expect(trie.min()).toBe(15);
      expect(trie.max()).toBe(30);
    });

    it.skip("should maintain invariants after many operations", () => {
      const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93];

      for (const value of values) {
        trie.insert(value);
      }

      const arr = trie.toArray();
      expect(arr).toEqual([...arr].sort((a, b) => a - b));
      expect(trie.min()).toBe(Math.min(...values));
      expect(trie.max()).toBe(Math.max(...values));

      for (let i = 0; i < values.length; i += 2) {
        trie.delete(values[i]);
      }

      const remaining = values.filter((_, i) => i % 2 === 1);
      expect(trie.toArray()).toEqual(remaining.sort((a, b) => a - b));
      expect(trie.size()).toBe(remaining.length);
    });

    it("should handle complex predecessor/successor scenarios", () => {
      trie.insert(10);
      trie.insert(30);
      trie.insert(50);
      trie.insert(70);
      trie.insert(90);

      expect(trie.predecessor(50)).toBe(30);
      expect(trie.successor(50)).toBe(70);
      expect(trie.predecessor(40)).toBe(30);
      expect(trie.successor(40)).toBe(50);
      expect(trie.predecessor(5)).toBe(null);
      expect(trie.successor(95)).toBe(null);
    });
  });

  describe("bucket management", () => {
    it("should split buckets when they get too large", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      expect(trie.size()).toBe(100);
      expect(trie.toArray().length).toBe(100);
    });

    it.skip("should merge buckets when they get too small", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      for (let i = 50; i < 100; i++) {
        trie.delete(i);
      }

      expect(trie.size()).toBe(50);
      expect(trie.toArray().length).toBe(50);
    });

    it("should maintain sorted order after bucket operations", () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(i);
      }

      const arr = trie.toArray();
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i] < arr[i + 1]).toBe(true);
      }
    });
  });
});
