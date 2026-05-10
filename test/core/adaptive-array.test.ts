import { describe, it, expect } from "vitest";
import { AdaptiveArray } from "../../src/core/adaptive-array/adaptive-array.js";

describe("AdaptiveArray", () => {
  describe("constructor", () => {
    it("creates array with default capacity", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.capacity()).toBe(16);
    });

    it("creates array with custom initial capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 32 });
      expect(arr.capacity()).toBe(32);
    });

    it("starts empty", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.size()).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it("creates with custom growth factor", () => {
      const arr = new AdaptiveArray<number>({ growthFactor: 3 });
      expect(arr.getStrategy()).toBe("exponential");
    });

    it("creates with custom shrink threshold", () => {
      const arr = new AdaptiveArray<number>({ shrinkThreshold: 0.5 });
      expect(arr.isEmpty()).toBe(true);
    });

    it("creates with linear strategy", () => {
      const arr = new AdaptiveArray<number>({ strategy: "linear" });
      expect(arr.getStrategy()).toBe("linear");
    });

    it("creates with fibonacci strategy", () => {
      const arr = new AdaptiveArray<number>({ strategy: "fibonacci" });
      expect(arr.getStrategy()).toBe("fibonacci");
    });

    it("creates with fixed strategy", () => {
      const arr = new AdaptiveArray<number>({ strategy: "fixed" });
      expect(arr.getStrategy()).toBe("fixed");
    });
  });

  describe("push", () => {
    it("pushes a single element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.size()).toBe(1);
      expect(arr.get(0)).toBe(1);
    });

    it("pushes multiple elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it("triggers growth when exceeding capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.size()).toBe(3);
      expect(arr.capacity()).toBeGreaterThanOrEqual(3);
    });

    it("preserves elements after growth", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it("pushes strings", () => {
      const arr = new AdaptiveArray<string>();
      arr.push("hello");
      arr.push("world");
      expect(arr.toArray()).toEqual(["hello", "world"]);
    });

    it("pushes objects", () => {
      const arr = new AdaptiveArray<{ x: number }>();
      arr.push({ x: 1 });
      arr.push({ x: 2 });
      expect(arr.size()).toBe(2);
    });
  });

  describe("pop", () => {
    it("returns undefined on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.pop()).toBeUndefined();
    });

    it("pops last element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.pop()).toBe(2);
      expect(arr.size()).toBe(1);
    });

    it("pops all elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.pop()).toBe(2);
      expect(arr.pop()).toBe(1);
      expect(arr.pop()).toBeUndefined();
      expect(arr.isEmpty()).toBe(true);
    });

    it("maintains LIFO order", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.pop()).toBe(3);
      expect(arr.pop()).toBe(2);
      expect(arr.pop()).toBe(1);
    });
  });

  describe("get", () => {
    it("returns undefined for out-of-bounds", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(0)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
    });

    it("returns element at index", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it("returns undefined for negative index", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.get(-1)).toBeUndefined();
    });
  });

  describe("set", () => {
    it("sets value at valid index", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.set(0, 99)).toBe(true);
      expect(arr.get(0)).toBe(99);
    });

    it("returns false for invalid index", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.set(0, 1)).toBe(false);
      expect(arr.set(-1, 1)).toBe(false);
    });

    it("replaces existing value", () => {
      const arr = new AdaptiveArray<string>();
      arr.push("a");
      arr.push("b");
      arr.set(1, "c");
      expect(arr.toArray()).toEqual(["a", "c"]);
    });
  });

  describe("insert", () => {
    it("inserts at beginning", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(2);
      arr.push(3);
      expect(arr.insert(0, 1)).toBe(true);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts at end", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.insert(2, 3)).toBe(true);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts in middle", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(3);
      expect(arr.insert(1, 2)).toBe(true);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it("returns false for invalid index", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.insert(-1, 0)).toBe(false);
      expect(arr.insert(5, 0)).toBe(false);
    });

    it("inserts into empty array at index 0", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.insert(0, 42)).toBe(true);
      expect(arr.size()).toBe(1);
      expect(arr.get(0)).toBe(42);
    });

    it("triggers growth when needed", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2 });
      arr.push(1);
      arr.push(2);
      arr.insert(1, 3);
      expect(arr.size()).toBe(3);
      expect(arr.toArray()).toEqual([1, 3, 2]);
    });
  });

  describe("delete", () => {
    it("returns undefined for invalid index", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.delete(-1)).toBeUndefined();
      expect(arr.delete(0)).toBeUndefined();
    });

    it("deletes first element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.delete(0)).toBe(1);
      expect(arr.toArray()).toEqual([2, 3]);
    });

    it("deletes last element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.delete(2)).toBe(3);
      expect(arr.toArray()).toEqual([1, 2]);
    });

    it("deletes middle element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.delete(1)).toBe(2);
      expect(arr.toArray()).toEqual([1, 3]);
    });

    it("deletes all elements one by one", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.delete(0);
      arr.delete(0);
      expect(arr.isEmpty()).toBe(true);
    });
  });

  describe("size and capacity", () => {
    it("reports correct size", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.size()).toBe(0);
      arr.push(1);
      expect(arr.size()).toBe(1);
      arr.push(2);
      expect(arr.size()).toBe(2);
    });

    it("reports correct capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 });
      expect(arr.capacity()).toBe(8);
    });

    it("isEmpty is correct", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.isEmpty()).toBe(true);
      arr.push(1);
      expect(arr.isEmpty()).toBe(false);
    });

    it("clear empties the array", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.clear();
      expect(arr.size()).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it("clear preserves capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      arr.clear();
      expect(arr.capacity()).toBe(8);
    });
  });

  describe("growth strategies", () => {
    it("exponential doubles capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      expect(arr.capacity()).toBe(8);
    });

    it("linear adds fixed amount", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: "linear", growthFactor: 4 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      expect(arr.capacity()).toBe(8);
    });

    it("fibonacci grows with fibonacci sequence", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 1, strategy: "fibonacci" });
      arr.push(1);
      expect(arr.capacity()).toBe(1);
      arr.push(2);
      expect(arr.capacity()).toBeGreaterThanOrEqual(2);
    });

    it("fixed adds fixed amount like linear", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "fixed", growthFactor: 3 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.capacity()).toBe(5);
    });

    it("growth stats are tracked", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const stats = arr.getStatistics();
      expect(stats.growthCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("auto-shrink", () => {
    it("shrinks when usage drops below threshold", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16, shrinkThreshold: 0.25, growthFactor: 2 });
      for (let i = 0; i < 16; i++) {
        arr.push(i);
      }
      while (arr.size() > 2) {
        arr.pop();
      }
      const stats = arr.getStatistics();
      expect(stats.shrinkCount).toBeGreaterThanOrEqual(1);
    });

    it("does not shrink below current size", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16, shrinkThreshold: 0.25, growthFactor: 2 });
      for (let i = 0; i < 10; i++) {
        arr.push(i);
      }
      while (arr.size() > 5) {
        arr.pop();
      }
      expect(arr.capacity()).toBeGreaterThanOrEqual(arr.size());
    });
  });

  describe("statistics tracking", () => {
    it("tracks resize count", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const stats = arr.getStatistics();
      expect(stats.resizeCount).toBeGreaterThanOrEqual(1);
    });

    it("tracks copy count", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const stats = arr.getStatistics();
      expect(stats.copyCount).toBeGreaterThanOrEqual(1);
    });

    it("tracks total elements moved", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential", growthFactor: 2 });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const stats = arr.getStatistics();
      expect(stats.totalElementsMoved).toBeGreaterThanOrEqual(2);
    });

    it("tracks current capacity and size", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 8 });
      arr.push(1);
      arr.push(2);
      const stats = arr.getStatistics();
      expect(stats.currentCapacity).toBe(8);
      expect(stats.currentSize).toBe(2);
    });

    it("tracks strategy in stats", () => {
      const arr = new AdaptiveArray<number>({ strategy: "fibonacci" });
      expect(arr.getStatistics().strategy).toBe("fibonacci");
    });

    it("zero stats on fresh array", () => {
      const arr = new AdaptiveArray<number>();
      const stats = arr.getStatistics();
      expect(stats.resizeCount).toBe(0);
      expect(stats.copyCount).toBe(0);
      expect(stats.totalElementsMoved).toBe(0);
      expect(stats.growthCount).toBe(0);
      expect(stats.shrinkCount).toBe(0);
    });
  });

  describe("iterator protocol", () => {
    it("iterates over elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      for (const val of arr) {
        result.push(val);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it("works with spread operator", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(10);
      arr.push(20);
      expect([...arr]).toEqual([10, 20]);
    });

    it("handles empty array iteration", () => {
      const arr = new AdaptiveArray<number>();
      const result: number[] = [];
      for (const val of arr) {
        result.push(val);
      }
      expect(result).toEqual([]);
    });
  });

  describe("map", () => {
    it("maps elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const mapped = arr.map((x) => x * 2);
      expect(mapped.toArray()).toEqual([2, 4, 6]);
    });

    it("receives correct indices", () => {
      const arr = new AdaptiveArray<string>();
      arr.push("a");
      arr.push("b");
      const indices: number[] = [];
      arr.map((_val, idx) => {
        indices.push(idx);
        return _val;
      });
      expect(indices).toEqual([0, 1]);
    });

    it("returns new AdaptiveArray", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      const mapped = arr.map((x) => x.toString());
      expect(mapped).toBeInstanceOf(AdaptiveArray);
    });
  });

  describe("filter", () => {
    it("filters elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const filtered = arr.filter((x) => x % 2 === 0);
      expect(filtered.toArray()).toEqual([2, 4]);
    });

    it("returns empty when nothing matches", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(3);
      const filtered = arr.filter((x) => x % 2 === 0);
      expect(filtered.isEmpty()).toBe(true);
    });

    it("preserves all when all match", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(2);
      arr.push(4);
      const filtered = arr.filter((x) => x % 2 === 0);
      expect(filtered.toArray()).toEqual([2, 4]);
    });
  });

  describe("reduce", () => {
    it("reces elements to a sum", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.reduce((acc, x) => acc + x, 0)).toBe(6);
    });

    it("handles string concatenation", () => {
      const arr = new AdaptiveArray<string>();
      arr.push("a");
      arr.push("b");
      arr.push("c");
      expect(arr.reduce((acc, x) => acc + x, "")).toBe("abc");
    });

    it("returns initial value for empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.reduce((acc, x) => acc + x, 42)).toBe(42);
    });
  });

  describe("find", () => {
    it("finds first matching element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.find((x) => x > 1)).toBe(2);
    });

    it("returns undefined when not found", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.find((x) => x > 10)).toBeUndefined();
    });

    it("returns undefined on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.find((x) => x === 1)).toBeUndefined();
    });
  });

  describe("findIndex", () => {
    it("finds index of first matching element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.findIndex((x) => x > 1)).toBe(1);
    });

    it("returns -1 when not found", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.findIndex((x) => x > 10)).toBe(-1);
    });

    it("returns -1 on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.findIndex((x) => x === 1)).toBe(-1);
    });
  });

  describe("indexOf", () => {
    it("finds index of element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.indexOf(20)).toBe(1);
    });

    it("returns -1 for missing element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.indexOf(99)).toBe(-1);
    });

    it("returns first occurrence", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(1);
      expect(arr.indexOf(1)).toBe(0);
    });

    it("returns -1 on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.indexOf(1)).toBe(-1);
    });
  });

  describe("includes", () => {
    it("returns true for existing element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.includes(2)).toBe(true);
    });

    it("returns false for missing element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.includes(99)).toBe(false);
    });

    it("returns false on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.includes(1)).toBe(false);
    });
  });

  describe("lastIndexOf", () => {
    it("finds last occurrence", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(1);
      expect(arr.lastIndexOf(1)).toBe(2);
    });

    it("returns -1 for missing element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.lastIndexOf(99)).toBe(-1);
    });

    it("returns -1 on empty array", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.lastIndexOf(1)).toBe(-1);
    });
  });

  describe("slice", () => {
    it("slices with start and end", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
      expect(arr.slice(1, 4).toArray()).toEqual([2, 3, 4]);
    });

    it("slices with only start", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.slice(1).toArray()).toEqual([2, 3]);
    });

    it("slices with negative indices", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.slice(-2).toArray()).toEqual([3, 4]);
    });

    it("returns empty for invalid range", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.slice(5, 10).toArray()).toEqual([]);
    });

    it("clamps negative end index", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.slice(0, -1).toArray()).toEqual([1, 2]);
    });
  });

  describe("concat", () => {
    it("concats two arrays", () => {
      const a = new AdaptiveArray<number>();
      a.push(1);
      a.push(2);
      const b = new AdaptiveArray<number>();
      b.push(3);
      b.push(4);
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4]);
    });

    it("concats with empty array", () => {
      const a = new AdaptiveArray<number>();
      a.push(1);
      const b = new AdaptiveArray<number>();
      expect(a.concat(b).toArray()).toEqual([1]);
    });

    it("concats multiple arrays", () => {
      const a = new AdaptiveArray<number>();
      a.push(1);
      const b = new AdaptiveArray<number>();
      b.push(2);
      const c = new AdaptiveArray<number>();
      c.push(3);
      expect(a.concat(b, c).toArray()).toEqual([1, 2, 3]);
    });

    it("does not modify original", () => {
      const a = new AdaptiveArray<number>();
      a.push(1);
      const b = new AdaptiveArray<number>();
      b.push(2);
      a.concat(b);
      expect(a.toArray()).toEqual([1]);
    });
  });

  describe("splice", () => {
    it("removes elements from middle", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const removed = arr.splice(1, 2);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1, 4]);
    });

    it("removes from start", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(0, 1);
      expect(removed.toArray()).toEqual([1]);
      expect(arr.toArray()).toEqual([2, 3]);
    });

    it("removes from end", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(2, 1);
      expect(removed.toArray()).toEqual([3]);
      expect(arr.toArray()).toEqual([1, 2]);
    });

    it("handles negative start", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(-2, 1);
      expect(removed.toArray()).toEqual([2]);
    });

    it("defaults deleteCount to remaining", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(1);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1]);
    });

    it("inserts elements without removing", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(4);
      arr.splice(1, 0, 2, 3);
      expect(arr.toArray()).toEqual([1, 2, 3, 4]);
    });

    it("replaces elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.splice(1, 1, 20, 30);
      expect(arr.toArray()).toEqual([1, 20, 30, 3]);
    });
  });

  describe("reverse", () => {
    it("reverses elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.reverse();
      expect(arr.toArray()).toEqual([3, 2, 1]);
    });

    it("returns self", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.reverse()).toBe(arr);
    });

    it("handles single element", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.reverse();
      expect(arr.toArray()).toEqual([1]);
    });

    it("handles empty array", () => {
      const arr = new AdaptiveArray<number>();
      arr.reverse();
      expect(arr.isEmpty()).toBe(true);
    });
  });

  describe("sort", () => {
    it("sorts with default comparator", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(3);
      arr.push(1);
      arr.push(2);
      arr.sort();
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it("sorts with custom comparator", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.sort((a, b) => b - a);
      expect(arr.toArray()).toEqual([3, 2, 1]);
    });

    it("returns self", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      expect(arr.sort()).toBe(arr);
    });
  });

  describe("compact", () => {
    it("removes wasted capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 });
      arr.push(1);
      arr.push(2);
      arr.compact();
      expect(arr.capacity()).toBe(2);
    });

    it("does nothing if already compact", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2 });
      arr.push(1);
      arr.push(2);
      const capBefore = arr.capacity();
      arr.compact();
      expect(arr.capacity()).toBe(capBefore);
    });

    it("preserves elements", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 16 });
      arr.push(10);
      arr.push(20);
      arr.push(30);
      arr.compact();
      expect(arr.toArray()).toEqual([10, 20, 30]);
    });
  });

  describe("shrinkToFit", () => {
    it("shrinks to exact size", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 32 });
      arr.push(1);
      arr.push(2);
      arr.shrinkToFit();
      expect(arr.capacity()).toBe(2);
    });

    it("keeps minimum capacity of 1 when empty", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 32 });
      arr.shrinkToFit();
      expect(arr.capacity()).toBe(1);
    });
  });

  describe("reserve", () => {
    it("increases capacity", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 });
      arr.reserve(100);
      expect(arr.capacity()).toBe(100);
    });

    it("does nothing if already enough", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 50 });
      arr.reserve(10);
      expect(arr.capacity()).toBe(50);
    });

    it("preserves elements", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2 });
      arr.push(1);
      arr.push(2);
      arr.reserve(50);
      expect(arr.toArray()).toEqual([1, 2]);
    });
  });

  describe("resize", () => {
    it("grows the array", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4 });
      arr.push(1);
      arr.resize(10);
      expect(arr.size()).toBe(10);
      expect(arr.capacity()).toBeGreaterThanOrEqual(10);
    });

    it("shrinks the array", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.resize(1);
      expect(arr.size()).toBe(1);
      expect(arr.get(0)).toBe(1);
    });

    it("ignores negative size", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.resize(-1);
      expect(arr.size()).toBe(1);
    });

    it("does nothing for same size", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.resize(2);
      expect(arr.toArray()).toEqual([1, 2]);
    });
  });

  describe("strategy switching", () => {
    it("switches strategy mid-use", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 2, strategy: "exponential" });
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.setStrategy("linear");
      expect(arr.getStrategy()).toBe("linear");
      arr.push(4);
      arr.push(5);
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("updates stats strategy after switch", () => {
      const arr = new AdaptiveArray<number>();
      arr.setStrategy("fibonacci");
      expect(arr.getStatistics().strategy).toBe("fibonacci");
    });

    it("resets fibonacci state on strategy switch", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 1, strategy: "fibonacci" });
      arr.push(1);
      arr.push(2);
      arr.setStrategy("exponential");
      arr.setStrategy("fibonacci");
      expect(arr.getStrategy()).toBe("fibonacci");
    });
  });

  describe("forEach", () => {
    it("iterates with callback", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      arr.forEach((v) => result.push(v));
      expect(result).toEqual([1, 2, 3]);
    });

    it("provides correct index", () => {
      const arr = new AdaptiveArray<string>();
      arr.push("a");
      arr.push("b");
      const indices: number[] = [];
      arr.forEach((_v, i) => indices.push(i));
      expect(indices).toEqual([0, 1]);
    });

    it("does not call on empty", () => {
      const arr = new AdaptiveArray<number>();
      let called = false;
      arr.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe("toArray", () => {
    it("returns copy of elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      const result = arr.toArray();
      expect(result).toEqual([1, 2]);
      result.push(3);
      expect(arr.size()).toBe(2);
    });

    it("returns empty array for empty", () => {
      const arr = new AdaptiveArray<number>();
      expect(arr.toArray()).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("handles large sequence of pushes", () => {
      const arr = new AdaptiveArray<number>({ initialCapacity: 4, strategy: "exponential", growthFactor: 2 });
      for (let i = 0; i < 1000; i++) {
        arr.push(i);
      }
      expect(arr.size()).toBe(1000);
      expect(arr.get(0)).toBe(0);
      expect(arr.get(999)).toBe(999);
    });

    it("handles interleaved push and pop", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      expect(arr.pop()).toBe(2);
      arr.push(3);
      expect(arr.toArray()).toEqual([1, 3]);
    });

    it("handles push after clear", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.clear();
      arr.push(3);
      expect(arr.size()).toBe(1);
      expect(arr.get(0)).toBe(3);
    });

    it("handles splice with no arguments effectively", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const removed = arr.splice(1);
      expect(removed.toArray()).toEqual([2, 3]);
      expect(arr.toArray()).toEqual([1]);
    });

    it("works with null and undefined values via type parameter", () => {
      const arr = new AdaptiveArray<number | null>();
      arr.push(1);
      arr.push(null);
      arr.push(3);
      expect(arr.size()).toBe(3);
      expect(arr.get(1)).toBeNull();
    });

    it("slice with no args returns full copy", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.slice().toArray()).toEqual([1, 2, 3]);
    });

    it("handles reverse of two elements", () => {
      const arr = new AdaptiveArray<number>();
      arr.push(1);
      arr.push(2);
      arr.reverse();
      expect(arr.toArray()).toEqual([2, 1]);
    });
  });
});
