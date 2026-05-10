import { describe, it, expect } from "vitest";
import { MinMaxFibonacciHeap } from "../../src/core/min-max-fibonacci/min-max-fibonacci.js";
import type { FibNode } from "../../src/core/min-max-fibonacci/types.js";

describe("MinMaxFibonacciHeap", () => {
  describe("constructor", () => {
    it("creates empty heap with default options", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty).toBe(true);
    });

    it("creates heap with custom comparator", () => {
      const heap = new MinMaxFibonacciHeap<number>({
        comparator: (a, b) => b - a,
      });
      heap.insert(5);
      heap.insert(3);
      expect(heap.peekMin()).toBe(5);
      expect(heap.peekMax()).toBe(3);
    });

    it("creates heap with empty options object", () => {
      const heap = new MinMaxFibonacciHeap<number>({});
      heap.insert(1);
      expect(heap.size).toBe(1);
    });
  });

  describe("insert", () => {
    it("inserts a single value", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.size).toBe(1);
      expect(heap.isEmpty).toBe(false);
      expect(heap.peekMin()).toBe(42);
      expect(heap.peekMax()).toBe(42);
    });

    it("inserts multiple values in ascending order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.size).toBe(3);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(3);
    });

    it("inserts multiple values in descending order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(3);
      heap.insert(2);
      heap.insert(1);
      expect(heap.size).toBe(3);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(3);
    });

    it("inserts duplicate values", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peekMin()).toBe(5);
      expect(heap.peekMax()).toBe(5);
    });

    it("inserts negative numbers", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(-5);
      heap.insert(-10);
      heap.insert(-1);
      expect(heap.peekMin()).toBe(-10);
      expect(heap.peekMax()).toBe(-1);
    });

    it("inserts zero", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(0);
      expect(heap.peekMin()).toBe(0);
      expect(heap.peekMax()).toBe(0);
    });

    it("inserts floating point numbers", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(3.14);
      heap.insert(2.71);
      heap.insert(1.41);
      expect(heap.peekMin()).toBe(1.41);
      expect(heap.peekMax()).toBe(3.14);
    });

    it("returns a node reference", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(10);
      expect(node).toBeDefined();
      expect(node.value).toBe(10);
      expect(node.degree).toBe(0);
      expect(node.marked).toBe(false);
      expect(node.parent).toBeNull();
    });

    it("inserts many elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
      }
      expect(heap.size).toBe(100);
      expect(heap.peekMin()).toBe(0);
      expect(heap.peekMax()).toBe(99);
    });

    it("inserts strings via comparator", () => {
      const heap = new MinMaxFibonacciHeap<string>({
        comparator: (a, b) => a.toString().localeCompare(b.toString()),
      });
      heap.insert("banana");
      heap.insert("apple");
      heap.insert("cherry");
      expect(heap.peekMin()).toBe("apple");
      expect(heap.peekMax()).toBe("cherry");
    });

    it("inserts in random order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const values = [7, 2, 9, 1, 5, 3, 8, 4, 6];
      for (const v of values) {
        heap.insert(v);
      }
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(9);
    });
  });

  describe("extractMin", () => {
    it("returns undefined on empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it("extracts the only element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty).toBe(true);
    });

    it("extracts minimum from two elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.peekMin()).toBe(5);
    });

    it("extracts all elements in sorted order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      for (const v of values) heap.insert(v);
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extractMin()!);
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("handles duplicates correctly", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(3);
      heap.insert(3);
      heap.insert(1);
      heap.insert(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
    });

    it("maintains max pointer after extractMin", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.extractMin();
      expect(heap.peekMax()).toBe(5);
    });

    it("extracts from large heap correctly", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n = 200;
      for (let i = n; i >= 1; i--) heap.insert(i);
      for (let i = 1; i <= n; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe("extractMax", () => {
    it("returns undefined on empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.extractMax()).toBeUndefined();
    });

    it("extracts the only element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.extractMax()).toBe(42);
      expect(heap.isEmpty).toBe(true);
    });

    it("extracts maximum from two elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMax()).toBe(5);
      expect(heap.peekMax()).toBe(3);
    });

    it("extracts all elements in descending order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      for (const v of values) heap.insert(v);
      const sorted: number[] = [];
      while (!heap.isEmpty) {
        sorted.push(heap.extractMax()!);
      }
      expect(sorted).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    });

    it("handles duplicates correctly", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(3);
      heap.insert(3);
      heap.insert(5);
      heap.insert(5);
      expect(heap.extractMax()).toBe(5);
      expect(heap.extractMax()).toBe(5);
      expect(heap.extractMax()).toBe(3);
      expect(heap.extractMax()).toBe(3);
    });

    it("maintains min pointer after extractMax", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      heap.extractMax();
      expect(heap.peekMin()).toBe(1);
    });

    it("extracts from large heap correctly in descending order", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n = 200;
      for (let i = 1; i <= n; i++) heap.insert(i);
      for (let i = n; i >= 1; i--) {
        expect(heap.extractMax()).toBe(i);
      }
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe("peekMin and peekMax", () => {
    it("peekMin returns undefined on empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.peekMin()).toBeUndefined();
    });

    it("peekMax returns undefined on empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.peekMax()).toBeUndefined();
    });

    it("peekMin does not remove the element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(10);
      expect(heap.peekMin()).toBe(10);
      expect(heap.size).toBe(1);
      expect(heap.peekMin()).toBe(10);
    });

    it("peekMax does not remove the element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(10);
      expect(heap.peekMax()).toBe(10);
      expect(heap.size).toBe(1);
      expect(heap.peekMax()).toBe(10);
    });

    it("same element is both min and max for single element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.peekMin()).toBe(42);
      expect(heap.peekMax()).toBe(42);
    });
  });

  describe("delete", () => {
    it("deletes the only node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(42);
      heap.delete(node);
      expect(heap.isEmpty).toBe(true);
    });

    it("deletes a middle node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n1 = heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.delete(n1);
      expect(heap.size).toBe(2);
      expect(heap.peekMin()).toBe(2);
    });

    it("deletes the max node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const n3 = heap.insert(3);
      heap.delete(n3);
      expect(heap.size).toBe(2);
      expect(heap.peekMax()).toBe(2);
    });

    it("deletes from a large heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const nodes: FibNode<number>[] = [];
      for (let i = 0; i < 50; i++) {
        nodes.push(heap.insert(i));
      }
      heap.delete(nodes[25]!);
      expect(heap.size).toBe(49);
      expect(heap.toArray().includes(25)).toBe(false);
    });

    it("deletes multiple nodes", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n1 = heap.insert(10);
      const n2 = heap.insert(20);
      const n3 = heap.insert(30);
      heap.delete(n2);
      expect(heap.size).toBe(2);
      heap.delete(n1);
      expect(heap.size).toBe(1);
      heap.delete(n3);
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe("decreaseKey", () => {
    it("decreases key of a node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      const node = heap.insert(10);
      heap.insert(5);
      heap.decreaseKey(node, 0);
      expect(heap.peekMin()).toBe(0);
    });

    it("does nothing if new value is greater", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 10);
      expect(node.value).toBe(5);
    });

    it("does nothing if new value is equal", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      expect(node.value).toBe(5);
    });

    it("decreases key to become new min", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      const node = heap.insert(10);
      heap.decreaseKey(node, -5);
      expect(heap.peekMin()).toBe(-5);
    });

    it("decreases key triggering cascading cut", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const values = [10, 20, 30, 40, 50];
      const nodes: FibNode<number>[] = [];
      for (const v of values) nodes.push(heap.insert(v));
      heap.extractMin();
      heap.decreaseKey(nodes[4]!, 1);
      expect(heap.peekMin()).toBe(1);
    });

    it("decreases key of root level node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(100);
      heap.insert(1);
      heap.decreaseKey(node, 0);
      expect(heap.peekMin()).toBe(0);
    });
  });

  describe("increaseKey", () => {
    it("increases key of a node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(1);
      heap.insert(5);
      heap.insert(10);
      heap.increaseKey(node, 100);
      expect(heap.peekMax()).toBe(100);
    });

    it("does nothing if new value is smaller", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(10);
      heap.increaseKey(node, 5);
      expect(node.value).toBe(10);
    });

    it("does nothing if new value is equal", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(5);
      heap.increaseKey(node, 5);
      expect(node.value).toBe(5);
    });

    it("increases key to become new max", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(10);
      const node = heap.insert(1);
      heap.increaseKey(node, 100);
      expect(heap.peekMax()).toBe(100);
    });

    it("increases key of root level node", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(10);
      const node = heap.insert(5);
      heap.increaseKey(node, 50);
      expect(heap.peekMax()).toBe(50);
    });
  });

  describe("size and isEmpty", () => {
    it("size is 0 for new heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.size).toBe(0);
    });

    it("isEmpty is true for new heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.isEmpty).toBe(true);
    });

    it("size increments on insert", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      expect(heap.size).toBe(1);
      heap.insert(2);
      expect(heap.size).toBe(2);
    });

    it("size decrements on extractMin", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it("size decrements on extractMax", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMax();
      expect(heap.size).toBe(1);
    });

    it("size decrements on delete", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(1);
      heap.delete(node);
      expect(heap.size).toBe(0);
    });
  });

  describe("clear", () => {
    it("clears a populated heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      expect(heap.size).toBe(0);
      expect(heap.peekMin()).toBeUndefined();
      expect(heap.peekMax()).toBeUndefined();
    });

    it("clear on empty heap does nothing", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.clear();
      expect(heap.isEmpty).toBe(true);
    });

    it("clear resets statistics", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.clear();
      const stats = heap.getStatistics();
      expect(stats.inserts).toBe(0);
    });

    it("heap is usable after clear", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(100);
      heap.clear();
      heap.insert(1);
      heap.insert(2);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(2);
    });
  });

  describe("merge", () => {
    it("merges two non-empty heaps", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      heap1.insert(1);
      heap1.insert(3);
      heap2.insert(2);
      heap2.insert(4);
      heap1.merge(heap2);
      expect(heap1.size).toBe(4);
      expect(heap1.peekMin()).toBe(1);
      expect(heap1.peekMax()).toBe(4);
      expect(heap2.isEmpty).toBe(true);
    });

    it("merges into empty heap", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      heap2.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
      expect(heap1.peekMin()).toBe(5);
    });

    it("merges empty heap into non-empty", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      heap1.insert(5);
      heap1.merge(heap2);
      expect(heap1.size).toBe(1);
    });

    it("merges two empty heaps", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      heap1.merge(heap2);
      expect(heap1.isEmpty).toBe(true);
    });

    it("clears source heap after merge", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      heap2.insert(10);
      heap2.insert(20);
      heap1.merge(heap2);
      expect(heap2.isEmpty).toBe(true);
      expect(heap2.size).toBe(0);
    });

    it("merges heaps with overlapping ranges", () => {
      const heap1 = new MinMaxFibonacciHeap<number>();
      const heap2 = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 5; i++) heap1.insert(i);
      for (let i = 3; i < 8; i++) heap2.insert(i);
      heap1.merge(heap2);
      expect(heap1.size).toBe(10);
      expect(heap1.peekMin()).toBe(0);
      expect(heap1.peekMax()).toBe(7);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect(heap.toArray()).toEqual([]);
    });

    it("returns single element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.toArray()).toEqual([42]);
    });

    it("returns all elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const arr = heap.toArray();
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3]);
    });

    it("does not modify heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.toArray();
      expect(heap.size).toBe(2);
      expect(heap.peekMin()).toBe(1);
    });
  });

  describe("forEach", () => {
    it("does not call callback on empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      let count = 0;
      heap.forEach(() => count++);
      expect(count).toBe(0);
    });

    it("iterates all elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const values: number[] = [];
      heap.forEach((v) => values.push(v));
      expect(values.sort((a, b) => a - b)).toEqual([1, 2, 3]);
    });

    it("provides correct indices", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(10);
      heap.insert(20);
      const indices: number[] = [];
      heap.forEach((_v, i) => indices.push(i));
      expect(indices.sort((a, b) => a - b)).toEqual([0, 1]);
    });
  });

  describe("Symbol.iterator", () => {
    it("returns empty iterator for empty heap", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      expect([...heap]).toEqual([]);
    });

    it("iterates all elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const values = [...heap].sort((a, b) => a - b);
      expect(values).toEqual([1, 2, 3]);
    });

    it("works with for...of", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(5);
      heap.insert(3);
      const values: number[] = [];
      for (const v of heap) values.push(v);
      expect(values.sort((a, b) => a - b)).toEqual([3, 5]);
    });
  });

  describe("getStatistics", () => {
    it("returns initial statistics", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const stats = heap.getStatistics();
      expect(stats.inserts).toBe(0);
      expect(stats.deleteMins).toBe(0);
      expect(stats.deleteMaxs).toBe(0);
      expect(stats.consolidateCount).toBe(0);
    });

    it("tracks inserts", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.getStatistics().inserts).toBe(3);
    });

    it("tracks deleteMins", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMin();
      expect(heap.getStatistics().deleteMins).toBe(1);
    });

    it("tracks deleteMaxs", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.extractMax();
      expect(heap.getStatistics().deleteMaxs).toBe(1);
    });

    it("tracks consolidateCount", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.extractMin();
      expect(heap.getStatistics().consolidateCount).toBeGreaterThan(0);
    });

    it("returns a copy", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      const stats = heap.getStatistics();
      stats.inserts = 999;
      expect(heap.getStatistics().inserts).toBe(1);
    });
  });

  describe("alternating extractMin and extractMax", () => {
    it("correctly alternates", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 1; i <= 10; i++) heap.insert(i);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMax()).toBe(10);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMax()).toBe(9);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMax()).toBe(8);
    });

    it("empties heap via alternating extracts", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.extractMin();
      heap.extractMax();
      heap.extractMin();
      heap.extractMax();
      expect(heap.isEmpty).toBe(true);
    });

    it("handles odd number of elements", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMax()).toBe(3);
      expect(heap.extractMin()).toBe(2);
      expect(heap.isEmpty).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles extractMin then extractMax on single element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.extractMax()).toBeUndefined();
    });

    it("handles extractMax then extractMin on single element", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(42);
      expect(heap.extractMax()).toBe(42);
      expect(heap.extractMin()).toBeUndefined();
    });

    it("handles many inserts then many extracts", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 500; i++) heap.insert(i);
      for (let i = 0; i < 250; i++) {
        expect(heap.extractMin()).toBe(i);
      }
      for (let i = 499; i >= 250; i--) {
        expect(heap.extractMax()).toBe(i);
      }
      expect(heap.isEmpty).toBe(true);
    });

    it("handles negative and positive numbers", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(-100);
      heap.insert(0);
      heap.insert(100);
      expect(heap.extractMin()).toBe(-100);
      expect(heap.extractMax()).toBe(100);
      expect(heap.extractMin()).toBe(0);
    });

    it("handles very large numbers", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(Number.MAX_SAFE_INTEGER);
      heap.insert(Number.MIN_SAFE_INTEGER);
      expect(heap.peekMin()).toBe(Number.MIN_SAFE_INTEGER);
      expect(heap.peekMax()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("handles insert after all extracts", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.extractMin();
      expect(heap.isEmpty).toBe(true);
      heap.insert(2);
      expect(heap.peekMin()).toBe(2);
      expect(heap.size).toBe(1);
    });

    it("handles clear then reuse", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 100; i++) heap.insert(i);
      heap.clear();
      expect(heap.isEmpty).toBe(true);
      heap.insert(42);
      expect(heap.peekMin()).toBe(42);
      expect(heap.peekMax()).toBe(42);
    });
  });

  describe("FibNode structure", () => {
    it("inserted node has correct initial state", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const node = heap.insert(10);
      expect(node.value).toBe(10);
      expect(node.degree).toBe(0);
      expect(node.marked).toBe(false);
      expect(node.parent).toBeNull();
      expect(node.child).toBeNull();
      expect(node.left).toBe(node);
      expect(node.right).toBe(node);
    });

    it("two nodes form circular list", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n1 = heap.insert(1);
      const n2 = heap.insert(2);
      expect(n1.left).toBe(n2);
      expect(n1.right).toBe(n2);
      expect(n2.left).toBe(n1);
      expect(n2.right).toBe(n1);
    });

    it("three nodes form circular list", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n1 = heap.insert(1);
      const n2 = heap.insert(2);
      const n3 = heap.insert(3);
      expect(n1.left).not.toBe(n1);
      expect(n1.right).not.toBe(n1);
      expect(n2.left).not.toBe(n2);
      expect(n2.right).not.toBe(n2);
      expect(n3.left).not.toBe(n3);
      expect(n3.right).not.toBe(n3);
      const nodes = new Set([n1, n2, n3]);
      for (const n of nodes) {
        expect(nodes.has(n.left)).toBe(true);
        expect(nodes.has(n.right)).toBe(true);
      }
      const visited = new Set<FibNode<number>>();
      let cur = n1;
      do {
        expect(visited.has(cur)).toBe(false);
        visited.add(cur);
        cur = cur.right;
      } while (cur !== n1);
      expect(visited.size).toBe(3);
    });
  });

  describe("consolidation", () => {
    it("consolidates after extractMin", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 20; i++) heap.insert(i);
      heap.extractMin();
      expect(heap.getStatistics().consolidateCount).toBeGreaterThan(0);
    });

    it("consolidates after extractMax", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 20; i++) heap.insert(i);
      heap.extractMax();
      expect(heap.getStatistics().consolidateCount).toBeGreaterThan(0);
    });

    it("maintains correctness after many consolidations", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n = 100;
      for (let i = 0; i < n; i++) heap.insert(i);
      for (let i = 0; i < n / 2; i++) {
        heap.extractMin();
      }
      expect(heap.peekMin()).toBe(50);
      expect(heap.peekMax()).toBe(99);
    });
  });

  describe("decreaseKey and increaseKey combined", () => {
    it("decrease then increase different nodes", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n1 = heap.insert(10);
      const n2 = heap.insert(20);
      heap.decreaseKey(n1, 1);
      heap.increaseKey(n2, 100);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(100);
    });

    it("multiple decrease keys", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const nodes: FibNode<number>[] = [];
      for (let i = 10; i < 20; i++) nodes.push(heap.insert(i));
      heap.decreaseKey(nodes[5]!, -10);
      heap.decreaseKey(nodes[3]!, -20);
      expect(heap.peekMin()).toBe(-20);
    });

    it("multiple increase keys", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const nodes: FibNode<number>[] = [];
      for (let i = 0; i < 10; i++) nodes.push(heap.insert(i));
      heap.increaseKey(nodes[5]!, 100);
      heap.increaseKey(nodes[3]!, 200);
      expect(heap.peekMax()).toBe(200);
    });
  });

  describe("merge and extract combined", () => {
    it("merge then extractMin", () => {
      const h1 = new MinMaxFibonacciHeap<number>();
      const h2 = new MinMaxFibonacciHeap<number>();
      h1.insert(5);
      h1.insert(10);
      h2.insert(1);
      h2.insert(20);
      h1.merge(h2);
      expect(h1.extractMin()).toBe(1);
      expect(h1.extractMin()).toBe(5);
    });

    it("merge then extractMax", () => {
      const h1 = new MinMaxFibonacciHeap<number>();
      const h2 = new MinMaxFibonacciHeap<number>();
      h1.insert(5);
      h1.insert(10);
      h2.insert(1);
      h2.insert(20);
      h1.merge(h2);
      expect(h1.extractMax()).toBe(20);
      expect(h1.extractMax()).toBe(10);
    });

    it("merge multiple heaps sequentially", () => {
      const h1 = new MinMaxFibonacciHeap<number>();
      const h2 = new MinMaxFibonacciHeap<number>();
      const h3 = new MinMaxFibonacciHeap<number>();
      h1.insert(10);
      h2.insert(20);
      h3.insert(30);
      h1.merge(h2);
      h1.merge(h3);
      expect(h1.size).toBe(3);
      expect(h1.extractMin()).toBe(10);
      expect(h1.extractMax()).toBe(30);
    });
  });

  describe("stress tests", () => {
    it("handles 1000 inserts and extracts", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const n = 1000;
      for (let i = 0; i < n; i++) heap.insert(Math.random() * 10000);
      const minVal = heap.peekMin()!;
      const maxVal = heap.peekMax()!;
      expect(minVal).toBeLessThanOrEqual(maxVal);
      expect(heap.extractMin()!).toBe(minVal);
      expect(heap.extractMax()!).toBe(maxVal);
      expect(heap.size).toBe(n - 2);
    });

    it("handles sequential insert-extract pattern", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      for (let i = 0; i < 50; i++) {
        heap.insert(i);
        heap.extractMin();
      }
      expect(heap.isEmpty).toBe(true);
    });

    it("handles interleaved operations", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(3);
      heap.insert(7);
      heap.insert(1);
      expect(heap.extractMax()).toBe(7);
      expect(heap.peekMin()).toBe(1);
      expect(heap.peekMax()).toBe(5);
    });

    it("sorted extraction verification", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      const values = [42, 17, 89, 3, 56, 71, 23, 95, 11, 68];
      for (const v of values) heap.insert(v);
      const fromMin: number[] = [];
      const fromMax: number[] = [];
      for (let i = 0; i < 5; i++) fromMin.push(heap.extractMin()!);
      for (let i = 0; i < 5; i++) fromMax.push(heap.extractMax()!);
      expect(fromMin).toEqual([3, 11, 17, 23, 42]);
      expect(fromMax).toEqual([95, 89, 71, 68, 56]);
    });
  });

  describe("statistics accuracy", () => {
    it("accurately counts operations", () => {
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);
      heap.extractMin();
      heap.extractMin();
      heap.extractMax();
      const stats = heap.getStatistics();
      expect(stats.inserts).toBe(5);
      expect(stats.deleteMins).toBe(2);
      expect(stats.deleteMaxs).toBe(1);
    });

    it("statistics reflect merge operations", () => {
      const h1 = new MinMaxFibonacciHeap<number>();
      const h2 = new MinMaxFibonacciHeap<number>();
      h2.insert(1);
      h2.insert(2);
      h1.merge(h2);
      expect(h1.getStatistics().inserts).toBe(2);
    });
  });

  describe("custom comparator", () => {
    it("reverse comparator sorts descending", () => {
      const heap = new MinMaxFibonacciHeap<number>({
        comparator: (a, b) => b - a,
      });
      heap.insert(1);
      heap.insert(5);
      heap.insert(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMax()).toBe(1);
    });

    it("comparator with objects via default numeric comparison", () => {
      interface Item {
        priority: number;
        name: string;
      }
      const heap = new MinMaxFibonacciHeap<number>();
      heap.insert(3);
      heap.insert(1);
      heap.insert(2);
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
    });
  });
});
