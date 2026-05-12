import { describe, it, expect } from "vitest";
import { GrailSort, isSorted } from "../../src/core/grail-sort/index.js";

interface TestObject {
  id: number;
  value: string;
}

describe("GrailSort", () => {
  describe("empty array", () => {
    it("sorts empty array", () => {
      const arr: number[] = [];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([]);
      expect(result).toBe(arr);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts empty array with comparator", () => {
      const arr: number[] = [];
      const result = GrailSort.sort(arr, (a, b) => a - b);
      expect(result).toEqual([]);
      expect(result).toBe(arr);
    });

    it("isSorted returns true for empty array", () => {
      expect(isSorted([])).toBe(true);
    });
  });

  describe("single element", () => {
    it("sorts single element array", () => {
      const arr = [42];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([42]);
      expect(result).toBe(arr);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts single element array with comparator", () => {
      const arr = [1];
      const result = GrailSort.sort(arr, (a, b) => a - b);
      expect(result).toEqual([1]);
      expect(result).toBe(arr);
    });

    it("isSorted returns true for single element", () => {
      expect(isSorted([1])).toBe(true);
    });
  });

  describe("two elements", () => {
    it("sorts two elements in order", () => {
      const arr = [1, 2];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts two elements out of order", () => {
      const arr = [2, 1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts two equal elements", () => {
      const arr = [1, 1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 1]);
      expect(isSorted(result)).toBe(true);
    });
  });

  describe("already sorted arrays", () => {
    it("sorts already sorted small array", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts already sorted medium array", () => {
      const arr = Array.from({ length: 20 }, (_, i) => i);
      const result = GrailSort.sort(arr);
      expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i));
      expect(isSorted(result)).toBe(true);
    });

    it("sorts already sorted large array", () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const result = GrailSort.sort(arr);
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
      expect(isSorted(result)).toBe(true);
    });

    it("sorts already sorted array with duplicates", () => {
      const arr = [1, 1, 2, 2, 3, 3];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 1, 2, 2, 3, 3]);
      expect(isSorted(result)).toBe(true);
    });
  });

  describe("reverse sorted arrays", () => {
    it("sorts reverse sorted small array", () => {
      const arr = [5, 4, 3, 2, 1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts reverse sorted medium array", () => {
      const arr = Array.from({ length: 20 }, (_, i) => 20 - i);
      const result = GrailSort.sort(arr);
      expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
      expect(isSorted(result)).toBe(true);
    });

    it("sorts reverse sorted large array", () => {
      const arr = Array.from({ length: 100 }, (_, i) => 100 - i);
      const result = GrailSort.sort(arr);
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
      expect(isSorted(result)).toBe(true);
    });
  });

  describe("random numbers", () => {
    it("sorts random small array", () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts random medium array", () => {
      const arr = [7, 2, 8, 5, 1, 9, 4, 6, 3, 0];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts random array with duplicates", () => {
      const arr = [5, 3, 5, 2, 5, 3, 1, 2];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2, 2, 3, 3, 5, 5, 5]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts random negative numbers", () => {
      const arr = [-3, 1, -4, 1, 5, -9, 2, 6];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([-9, -4, -3, 1, 1, 2, 5, 6]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts random large array", () => {
      const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
      const sorted = GrailSort.sort(arr);
      expect(isSorted(sorted)).toBe(true);
      expect(sorted).toHaveLength(50);
    });
  });

  describe("duplicates", () => {
    it("sorts array with all duplicates", () => {
      const arr = [5, 5, 5, 5, 5];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([5, 5, 5, 5, 5]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts array with many duplicates", () => {
      const arr = [1, 2, 1, 2, 1, 2, 1, 2];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 1, 1, 1, 2, 2, 2, 2]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts array with mostly duplicates", () => {
      const arr = [3, 3, 3, 1, 3, 3, 3, 2];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 2, 3, 3, 3, 3, 3, 3]);
      expect(isSorted(result)).toBe(true);
    });
  });

  describe("strings", () => {
    it("sorts empty string array", () => {
      const arr: string[] = [];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts string array", () => {
      const arr = ["banana", "apple", "cherry"];
      const result = GrailSort.sort(arr);
      expect(result).toEqual(["apple", "banana", "cherry"]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts string array with duplicates", () => {
      const arr = ["apple", "banana", "apple"];
      const result = GrailSort.sort(arr);
      expect(result).toEqual(["apple", "apple", "banana"]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts mixed case strings", () => {
      const arr = ["Apple", "banana", "Cherry"];
      const result = GrailSort.sort(arr);
      expect(result).toEqual(["Apple", "Cherry", "banana"]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts strings with custom comparator", () => {
      const arr = ["banana", "Apple", "cherry"];
      const result = GrailSort.sort(arr, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      expect(result).toEqual(["Apple", "banana", "cherry"]);
      expect(isSorted(result, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))).toBe(true);
    });

    it("sorts single character strings", () => {
      const arr = ["z", "a", "m", "b"];
      const result = GrailSort.sort(arr);
      expect(result).toEqual(["a", "b", "m", "z"]);
      expect(isSorted(result)).toBe(true);
    });

    it("sorts strings by length", () => {
      const arr = ["aaaa", "aa", "aaa", "a"];
      const result = GrailSort.sort(arr, (a, b) => a.length - b.length);
      expect(result).toEqual(["a", "aa", "aaa", "aaaa"]);
      expect(isSorted(result, (a, b) => a.length - b.length)).toBe(true);
    });

    it("sorts reverse alphabetical", () => {
      const arr = ["apple", "banana", "cherry"];
      const result = GrailSort.sort(arr, (a, b) => b.localeCompare(a));
      expect(result).toEqual(["cherry", "banana", "apple"]);
    });
  });

  describe("objects with comparator", () => {
    it("sorts objects by id", () => {
      const arr: TestObject[] = [
        { id: 3, value: "c" },
        { id: 1, value: "a" },
        { id: 2, value: "b" }
      ];
      const result = GrailSort.sort(arr, (a, b) => a.id - b.id);
      expect(result).toEqual([
        { id: 1, value: "a" },
        { id: 2, value: "b" },
        { id: 3, value: "c" }
      ]);
      expect(isSorted(result, (a, b) => a.id - b.id)).toBe(true);
    });

    it("sorts objects by value", () => {
      const arr: TestObject[] = [
        { id: 1, value: "cherry" },
        { id: 2, value: "apple" },
        { id: 3, value: "banana" }
      ];
      const result = GrailSort.sort(arr, (a, b) => a.value.localeCompare(b.value));
      expect(result).toEqual([
        { id: 2, value: "apple" },
        { id: 3, value: "banana" },
        { id: 1, value: "cherry" }
      ]);
    });

    it("sorts objects with same id", () => {
      const arr: TestObject[] = [
        { id: 1, value: "b" },
        { id: 1, value: "a" },
        { id: 2, value: "c" }
      ];
      const result = GrailSort.sort(arr, (a, b) => a.id - b.id);
      expect(result[0]).toEqual({ id: 1, value: "b" });
      expect(result[1]).toEqual({ id: 1, value: "a" });
      expect(result[2]).toEqual({ id: 2, value: "c" });
    });

    it("sorts empty object array", () => {
      const arr: TestObject[] = [];
      const result = GrailSort.sort(arr, (a, b) => a.id - b.id);
      expect(result).toEqual([]);
    });

    it("sorts single object", () => {
      const arr: TestObject[] = [{ id: 1, value: "a" }];
      const result = GrailSort.sort(arr, (a, b) => a.id - b.id);
      expect(result).toEqual([{ id: 1, value: "a" }]);
    });
  });

  describe("stability", () => {
    it("preserves order of equal elements", () => {
      const arr = [
        { id: 1, value: "a", originalIndex: 0 },
        { id: 1, value: "b", originalIndex: 1 },
        { id: 1, value: "c", originalIndex: 2 },
        { id: 1, value: "d", originalIndex: 3 }
      ];
      GrailSort.sort(arr, (a, b) => a.id - b.id);
      expect(arr[0].originalIndex).toBe(0);
      expect(arr[1].originalIndex).toBe(1);
      expect(arr[2].originalIndex).toBe(2);
      expect(arr[3].originalIndex).toBe(3);
    });

    it("preserves order of equal numbers", () => {
      const arr = [1, 1, 1, 1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1, 1, 1, 1]);
    });

    it("preserves order of equal strings", () => {
      const arr = ["a", "a", "b", "b"];
      const result = GrailSort.sort(arr);
      expect(result).toEqual(["a", "a", "b", "b"]);
    });

    it("preserves order with comparator", () => {
      const arr = [
        { value: 1, index: 0 },
        { value: 2, index: 1 },
        { value: 1, index: 2 },
        { value: 2, index: 3 }
      ];
      GrailSort.sort(arr, (a, b) => a.value - b.value);
      expect(arr[0].index).toBe(0);
      expect(arr[1].index).toBe(2);
      expect(arr[2].index).toBe(1);
      expect(arr[3].index).toBe(3);
    });

    it("preserves order in complex case", () => {
      const arr = [
        { priority: 1, order: 0 },
        { priority: 2, order: 1 },
        { priority: 1, order: 2 },
        { priority: 3, order: 3 },
        { priority: 2, order: 4 },
        { priority: 1, order: 5 }
      ];
      GrailSort.sort(arr, (a, b) => a.priority - b.priority);
      expect(arr[0].order).toBe(0);
      expect(arr[1].order).toBe(2);
      expect(arr[2].order).toBe(5);
      expect(arr[3].order).toBe(1);
      expect(arr[4].order).toBe(4);
      expect(arr[5].order).toBe(3);
    });
  });

  describe("large arrays", () => {
    it("sorts 1000 elements", () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(1000);
    });

    it("sorts 2000 elements", () => {
      const arr = Array.from({ length: 2000 }, () => Math.floor(Math.random() * 2000));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(2000);
    });

    it("sorts 5000 elements", () => {
      const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 5000));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(5000);
    });

    it("sorts 10000 elements", () => {
      const arr = Array.from({ length: 10000 }, (_, i) => 10000 - i);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toEqual(Array.from({ length: 10000 }, (_, i) => i + 1));
    });

    it("sorts large array with many duplicates", () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(1000);
    });

    it("sorts large array of strings", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => `item${1000 - i}`);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result[0]).toBe("item1");
      expect(result[999]).toBe("item999");
    });

    it("sorts large array with negative numbers", () => {
      const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 2000) - 1000);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(1000);
    });
  });

  describe("edge cases", () => {
    it("handles very small negative numbers", () => {
      const arr = [-1, -2, -3, -4, -5];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([-5, -4, -3, -2, -1]);
      expect(isSorted(result)).toBe(true);
    });

    it("handles very large positive numbers", () => {
      const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER - 1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([0, Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER]);
      expect(isSorted(result)).toBe(true);
    });

    it("handles zeros", () => {
      const arr = [0, 0, 0, 0, 0];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([0, 0, 0, 0, 0]);
      expect(isSorted(result)).toBe(true);
    });

    it("handles mixed with zeros", () => {
      const arr = [1, 0, -1, 0, 1, -1];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([-1, -1, 0, 0, 1, 1]);
      expect(isSorted(result)).toBe(true);
    });

    it("handles floating point numbers", () => {
      const arr = [1.5, 1.2, 1.8, 1.1, 1.9];
      const result = GrailSort.sort(arr);
      expect(result).toEqual([1.1, 1.2, 1.5, 1.8, 1.9]);
      expect(isSorted(result)).toBe(true);
    });

    it("handles array with undefined values", () => {
      const arr: (number | undefined)[] = [undefined, 1, undefined, 2];
      const result = GrailSort.sort(arr);
      expect(result).toHaveLength(4);
    });

    it("handles array with null values", () => {
      const arr: (number | null)[] = [null, 1, null, 2];
      const result = GrailSort.sort(arr) as (number | null)[];
      expect(result[0]).toBe(null);
      expect(result[1]).toBe(null);
    });
  });

  describe("in-place modification", () => {
    it("modifies original array", () => {
      const arr = [3, 1, 2];
      const originalRef = arr;
      GrailSort.sort(arr);
      expect(arr).toEqual([1, 2, 3]);
      expect(arr).toBe(originalRef);
    });

    it("returns same reference", () => {
      const arr = [3, 1, 2];
      const result = GrailSort.sort(arr);
      expect(result).toBe(arr);
    });

    it("modifies array with comparator", () => {
      const arr = ["c", "a", "b"];
      const originalRef = arr;
      GrailSort.sort(arr, (a, b) => a.localeCompare(b));
      expect(arr).toEqual(["a", "b", "c"]);
      expect(arr).toBe(originalRef);
    });

    it("empty array returns same reference", () => {
      const arr: number[] = [];
      const result = GrailSort.sort(arr);
      expect(result).toBe(arr);
    });

    it("single element returns same reference", () => {
      const arr = [1];
      const result = GrailSort.sort(arr);
      expect(result).toBe(arr);
    });
  });

  describe("isSorted utility", () => {
    it("returns true for empty array", () => {
      expect(isSorted([])).toBe(true);
    });

    it("returns true for single element", () => {
      expect(isSorted([1])).toBe(true);
    });

    it("returns true for sorted array", () => {
      expect(isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it("returns false for unsorted array", () => {
      expect(isSorted([1, 3, 2, 4, 5])).toBe(false);
    });

    it("returns true for sorted strings", () => {
      expect(isSorted(["a", "b", "c"])).toBe(true);
    });

    it("returns false for unsorted strings", () => {
      expect(isSorted(["c", "a", "b"])).toBe(false);
    });

    it("returns true with comparator", () => {
      expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true);
    });

    it("returns false with comparator", () => {
      expect(isSorted([1, 2, 3, 4, 5], (a, b) => b - a)).toBe(false);
    });

    it("returns true for array with duplicates", () => {
      expect(isSorted([1, 1, 2, 2, 3, 3])).toBe(true);
    });

    it("returns false for array with out of order duplicates", () => {
      expect(isSorted([1, 2, 1, 2, 3, 3])).toBe(false);
    });

    it("returns true for large sorted array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      expect(isSorted(arr)).toBe(true);
    });

    it("returns false for large unsorted array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      expect(isSorted(arr)).toBe(false);
    });

    it("returns true for all equal elements", () => {
      expect(isSorted([1, 1, 1, 1, 1])).toBe(true);
    });
  });

  describe("threshold behavior", () => {
    it("sorts array at threshold", () => {
      const arr = Array.from({ length: 32 }, () => Math.floor(Math.random() * 100));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(32);
    });

    it("sorts array just above threshold", () => {
      const arr = Array.from({ length: 33 }, () => Math.floor(Math.random() * 100));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(33);
    });

    it("sorts array just below threshold", () => {
      const arr = Array.from({ length: 31 }, () => Math.floor(Math.random() * 100));
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toHaveLength(31);
    });
  });

  describe("multiple sorts", () => {
    it("can sort array multiple times", () => {
      const arr = [3, 1, 2];
      GrailSort.sort(arr);
      expect(arr).toEqual([1, 2, 3]);
      GrailSort.sort(arr);
      expect(arr).toEqual([1, 2, 3]);
      GrailSort.sort(arr, (a, b) => b - a);
      expect(arr).toEqual([3, 2, 1]);
    });

    it("can sort with different comparators", () => {
      const arr = [1, 2, 3, 4, 5];
      GrailSort.sort(arr, (a, b) => b - a);
      expect(arr).toEqual([5, 4, 3, 2, 1]);
      GrailSort.sort(arr, (a, b) => a - b);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("performance with specific patterns", () => {
    it("handles already sorted large array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
    });

    it("handles reverse sorted large array", () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
    });

    it("handles alternating pattern", () => {
      const arr = [1, 1000, 2, 999, 3, 998];
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
    });

    it("handles single value repeated", () => {
      const arr = Array(100).fill(42);
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result.every((v) => v === 42)).toBe(true);
    });

    it("handles two values alternating", () => {
      const arr = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
      const result = GrailSort.sort(arr);
      expect(isSorted(result)).toBe(true);
      expect(result).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
    });
  });
});
