import { describe, it, expect, beforeEach } from 'vitest';
import { HollowHeap } from '../../src/core/hollow-heap/index.js';

describe('HollowHeap', () => {
  let heap: HollowHeap<number>;

  beforeEach(() => {
    heap = new HollowHeap();
  });

  describe('insert', () => {
    it('should insert a single element', () => {
      const node = heap.insert(5);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(node.value).toBe(5);
    });

    it('should insert multiple elements', () => {
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(1);
    });

    it('should insert elements in descending order', () => {
      heap.insert(5);
      heap.insert(4);
      heap.insert(3);
      heap.insert(2);
      heap.insert(1);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
    });

    it('should insert elements in ascending order', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);
      expect(heap.size).toBe(5);
      expect(heap.peek()).toBe(1);
    });

    it('should insert duplicate elements', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(5);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(5);
    });

    it('should insert negative numbers', () => {
      heap.insert(-1);
      heap.insert(-5);
      heap.insert(-3);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(-5);
    });

    it('should insert zero', () => {
      heap.insert(0);
      heap.insert(1);
      heap.insert(-1);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(-1);
    });

    it('should insert large numbers', () => {
      heap.insert(1000000);
      heap.insert(999999);
      heap.insert(1000001);
      expect(heap.size).toBe(3);
      expect(heap.peek()).toBe(999999);
    });

    it('should return node reference', () => {
      const node = heap.insert(42);
      expect(node).toBeDefined();
      expect(typeof node).toBe('object');
    });
  });

  describe('extractMin', () => {
    it('should extract minimum from single element', () => {
      heap.insert(5);
      const result = heap.extractMin();
      expect(result).toBe(5);
      expect(heap.size).toBe(0);
    });

    it('should extract minimum from multiple elements', () => {
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(1);
      heap.insert(5);
      const result = heap.extractMin();
      expect(result).toBe(1);
      expect(heap.size).toBe(4);
    });

    it('should extract elements in sorted order', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);

      const results: number[] = [];
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!);
      }

      expect(results).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return undefined from empty heap', () => {
      const result = heap.extractMin();
      expect(result).toBeUndefined();
    });

    it('should maintain heap property after multiple extractions', () => {
      heap.insert(10);
      heap.insert(5);
      heap.insert(8);
      heap.insert(3);
      heap.insert(6);

      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
      expect(heap.peek()).toBe(8);
    });

    it('should extract all elements correctly', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i);
      }

      const results: number[] = [];
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!);
      }

      expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle extraction after decreaseKey', () => {
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);

      heap.decreaseKey(node2, 5);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(30);
    });

    it('should handle extraction after delete', () => {
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);

      heap.delete(node2);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(30);
    });
  });

  describe('peek', () => {
    it('should return minimum element', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(4);
      expect(heap.peek()).toBe(3);
    });

    it('should return undefined from empty heap', () => {
      expect(heap.peek()).toBeUndefined();
    });

    it('should not remove element', () => {
      heap.insert(5);
      heap.peek();
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should return correct minimum after insertions', () => {
      expect(heap.insert(10));
      expect(heap.peek()).toBe(10);
      expect(heap.insert(5));
      expect(heap.peek()).toBe(5);
      expect(heap.insert(15));
      expect(heap.peek()).toBe(5);
    });

    it('should return correct minimum after deletions', () => {
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.extractMin();
      expect(heap.peek()).toBe(10);
    });

    it('should work with single element', () => {
      heap.insert(42);
      expect(heap.peek()).toBe(42);
      expect(heap.peek()).toBe(42);
    });

    it('should handle negative numbers', () => {
      heap.insert(-1);
      heap.insert(-5);
      heap.insert(0);
      expect(heap.peek()).toBe(-5);
    });
  });

  describe('meld', () => {
    it('should meld two empty heaps', () => {
      const other = new HollowHeap<number>();
      heap.meld(other);
      expect(heap.size).toBe(0);
      expect(other.size).toBe(0);
    });

    it('should meld empty heap with non-empty heap', () => {
      const other = new HollowHeap<number>();
      other.insert(5);
      heap.meld(other);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(5);
      expect(other.size).toBe(0);
    });

    it('should meld two non-empty heaps', () => {
      heap.insert(5);
      heap.insert(10);
      const other = new HollowHeap<number>();
      other.insert(3);
      other.insert(7);

      heap.meld(other);
      expect(heap.size).toBe(4);
      expect(heap.peek()).toBe(3);
      expect(other.size).toBe(0);
    });

    it('should preserve order after meld', () => {
      for (let i = 5; i >= 1; i--) {
        heap.insert(i * 2);
      }

      const other = new HollowHeap<number>();
      for (let i = 5; i >= 1; i--) {
        other.insert(i * 2 - 1);
      }

      heap.meld(other);

      const results: number[] = [];
      while (!heap.isEmpty()) {
        results.push(heap.extractMin()!);
      }

      expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle multiple melds', () => {
      const heap1 = new HollowHeap<number>();
      const heap2 = new HollowHeap<number>();
      const heap3 = new HollowHeap<number>();

      heap1.insert(10);
      heap2.insert(20);
      heap3.insert(15);

      heap1.meld(heap2);
      heap1.meld(heap3);

      expect(heap1.size).toBe(3);
      expect(heap1.extractMin()).toBe(10);
    });

    it('should clear source heap after meld', () => {
      heap.insert(5);
      const other = new HollowHeap<number>();
      other.insert(10);

      heap.meld(other);

      expect(other.isEmpty()).toBe(true);
      expect(other.peek()).toBeUndefined();
    });

    it('should work with duplicate values', () => {
      heap.insert(5);
      const other = new HollowHeap<number>();
      other.insert(5);

      heap.meld(other);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(5);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease key of node', () => {
      const node = heap.insert(10);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should throw error if new value is greater', () => {
      const node = heap.insert(5);
      expect(() => heap.decreaseKey(node, 10)).toThrow();
    });

    it('should allow same value', () => {
      const node = heap.insert(5);
      expect(() => heap.decreaseKey(node, 5)).not.toThrow();
      expect(heap.peek()).toBe(5);
    });

    it('should work with minimum element', () => {
      heap.insert(10);
      const minNode = heap.insert(5);
      heap.insert(15);

      heap.decreaseKey(minNode, 2);
      expect(heap.peek()).toBe(2);
    });

    it('should work with non-minimum element', () => {
      heap.insert(5);
      const node = heap.insert(20);
      heap.insert(10);

      heap.decreaseKey(node, 3);
      expect(heap.peek()).toBe(3);
    });

    it('should throw error on deleted node', () => {
      const node = heap.insert(10);
      heap.delete(node);
      expect(() => heap.decreaseKey(node, 5)).toThrow();
    });

    it('should handle multiple decreases', () => {
      const node = heap.insert(100);
      heap.decreaseKey(node, 50);
      heap.decreaseKey(node, 25);
      heap.decreaseKey(node, 10);

      expect(heap.peek()).toBe(10);
    });

    it('should maintain heap structure', () => {
      const node1 = heap.insert(30);
      const node2 = heap.insert(20);
      const node3 = heap.insert(10);

      heap.decreaseKey(node1, 5);
      heap.decreaseKey(node2, 7);

      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
      expect(heap.extractMin()).toBe(10);
    });

    it('should work with negative numbers', () => {
      const node = heap.insert(10);
      heap.decreaseKey(node, -5);
      expect(heap.peek()).toBe(-5);
    });

    it('should work with zero', () => {
      const node = heap.insert(10);
      heap.decreaseKey(node, 0);
      expect(heap.peek()).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete node', () => {
      const node = heap.insert(10);
      heap.delete(node);
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should delete from heap with multiple elements', () => {
      heap.insert(5);
      const node = heap.insert(10);
      heap.insert(15);

      heap.delete(node);
      expect(heap.size).toBe(2);
      expect(heap.toArray()).toEqual([5, 15]);
    });

    it('should delete minimum element', () => {
      heap.insert(10);
      const minNode = heap.insert(5);
      heap.insert(15);

      heap.delete(minNode);
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(10);
    });

    it('should handle deleting same node twice', () => {
      const node = heap.insert(10);
      heap.delete(node);
      heap.delete(node);
      expect(heap.size).toBe(0);
    });

    it('should work with decreaseKey before delete', () => {
      const node = heap.insert(20);
      heap.decreaseKey(node, 5);
      heap.delete(node);
      expect(heap.size).toBe(0);
    });

    it('should maintain heap property after delete', () => {
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);

      heap.delete(node2);
      expect(heap.extractMin()).toBe(10);
      expect(heap.extractMin()).toBe(30);
    });

    it('should work with multiple deletes', () => {
      const node1 = heap.insert(10);
      const node2 = heap.insert(20);
      const node3 = heap.insert(30);

      heap.delete(node1);
      heap.delete(node3);

      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(20);
    });

    it('should handle delete from empty heap after operations', () => {
      const node = heap.insert(10);
      heap.extractMin();
      heap.delete(node);
      expect(heap.size).toBe(0);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(heap.size).toBe(0);
    });

    it('should return 1 after single insert', () => {
      heap.insert(5);
      expect(heap.size).toBe(1);
    });

    it('should return correct size after multiple inserts', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      expect(heap.size).toBe(3);
    });

    it('should decrease after extractMin', () => {
      heap.insert(5);
      heap.insert(10);
      heap.extractMin();
      expect(heap.size).toBe(1);
    });

    it('should decrease after delete', () => {
      const node = heap.insert(5);
      heap.insert(10);
      heap.delete(node);
      expect(heap.size).toBe(1);
    });

    it('should increase after meld', () => {
      heap.insert(5);
      const other = new HollowHeap<number>();
      other.insert(10);
      heap.meld(other);
      expect(heap.size).toBe(2);
    });

    it('should not change after decreaseKey', () => {
      const node = heap.insert(10);
      heap.decreaseKey(node, 5);
      expect(heap.size).toBe(1);
    });

    it('should be 0 after clear', () => {
      heap.insert(5);
      heap.insert(10);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      heap.insert(5);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', () => {
      heap.insert(5);
      heap.insert(10);
      heap.extractMin();
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after deleting all elements', () => {
      const node1 = heap.insert(5);
      const node2 = heap.insert(10);
      heap.delete(node1);
      heap.delete(node2);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return true after clear', () => {
      heap.insert(5);
      heap.clear();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return false after meld', () => {
      const other = new HollowHeap<number>();
      other.insert(5);
      heap.meld(other);
      expect(heap.isEmpty()).toBe(false);
    });

    it('should handle multiple operations', () => {
      expect(heap.isEmpty()).toBe(true);
      heap.insert(5);
      expect(heap.isEmpty()).toBe(false);
      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty heap', () => {
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBeUndefined();
    });

    it('should clear heap with single element', () => {
      heap.insert(5);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should clear heap with multiple elements', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      heap.clear();
      expect(heap.size).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should allow operations after clear', () => {
      heap.insert(5);
      heap.insert(10);
      heap.clear();
      heap.insert(20);
      expect(heap.size).toBe(1);
      expect(heap.peek()).toBe(20);
    });

    it('should clear after extractMin', () => {
      heap.insert(5);
      heap.insert(10);
      heap.extractMin();
      heap.clear();
      expect(heap.size).toBe(0);
    });

    it('should work with decreaseKey before clear', () => {
      const node = heap.insert(10);
      heap.decreaseKey(node, 5);
      heap.clear();
      expect(heap.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([]);
    });

    it('should return array with single element', () => {
      heap.insert(5);
      expect(heap.toArray()).toEqual([5]);
    });

    it('should return sorted array', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should include duplicates', () => {
      heap.insert(5);
      heap.insert(5);
      heap.insert(3);
      expect(heap.toArray()).toEqual([3, 5, 5]);
    });

    it('should work with negative numbers', () => {
      heap.insert(-1);
      heap.insert(-5);
      heap.insert(0);
      expect(heap.toArray()).toEqual([-5, -1, 0]);
    });

    it('should not modify heap', () => {
      heap.insert(5);
      heap.insert(10);
      const array = heap.toArray();
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(5);
    });

    it('should work after operations', () => {
      heap.insert(10);
      heap.insert(5);
      heap.insert(15);
      heap.extractMin();
      expect(heap.toArray()).toEqual([10, 15]);
    });

    it('should handle large heap', () => {
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      const array = heap.toArray();
      expect(array.length).toBe(100);
      expect(array[0]).toBe(1);
      expect(array[99]).toBe(100);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty heap', () => {
      let called = false;
      heap.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should call callback once for single element', () => {
      heap.insert(5);
      let count = 0;
      heap.forEach(() => {
        count++;
      });
      expect(count).toBe(1);
    });

    it('should call callback for each element', () => {
      heap.insert(5);
      heap.insert(10);
      heap.insert(15);
      const values: number[] = [];
      heap.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([5, 10, 15]);
    });

    it('should pass values in sorted order', () => {
      heap.insert(5);
      heap.insert(3);
      heap.insert(1);
      heap.insert(4);
      heap.insert(2);
      const values: number[] = [];
      heap.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not modify heap', () => {
      heap.insert(5);
      heap.insert(10);
      heap.forEach(() => {});
      expect(heap.size).toBe(2);
      expect(heap.peek()).toBe(5);
    });

    it('should work with callback that captures values', () => {
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      const results: number[] = [];
      heap.forEach((value) => {
        results.push(value * 2);
      });
      expect(results).toEqual([2, 4, 6]);
    });

    it('should handle large heap', () => {
      for (let i = 100; i >= 1; i--) {
        heap.insert(i);
      }
      let count = 0;
      heap.forEach(() => {
        count++;
      });
      expect(count).toBe(100);
    });
  });

  describe('custom comparator', () => {
    it('should work with max heap', () => {
      const maxHeap = new HollowHeap<number>({
        comparator: (a, b) => (a > b ? -1 : a < b ? 1 : 0),
      });
      maxHeap.insert(5);
      maxHeap.insert(10);
      maxHeap.insert(15);
      expect(maxHeap.peek()).toBe(15);
      expect(maxHeap.extractMin()).toBe(15);
      expect(maxHeap.extractMin()).toBe(10);
      expect(maxHeap.extractMin()).toBe(5);
    });

    it('should work with string comparator', () => {
      const stringHeap = new HollowHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      });
      stringHeap.insert('banana');
      stringHeap.insert('apple');
      stringHeap.insert('cherry');
      expect(stringHeap.peek()).toBe('apple');
    });

    it('should work with object comparator', () => {
      interface Item {
        value: number;
      }
      const objectHeap = new HollowHeap<Item>({
        comparator: (a, b) => a.value - b.value,
      });
      objectHeap.insert({ value: 10 });
      objectHeap.insert({ value: 5 });
      objectHeap.insert({ value: 15 });
      expect(objectHeap.peek()!.value).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of inserts', () => {
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i);
      }
      expect(heap.size).toBe(1000);
      expect(heap.peek()).toBe(1);
    });

    it('should handle alternating insert and extract', () => {
      heap.insert(5);
      expect(heap.extractMin()).toBe(5);
      heap.insert(10);
      expect(heap.extractMin()).toBe(10);
      heap.insert(15);
      expect(heap.extractMin()).toBe(15);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle same value multiple times', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(5);
      }
      expect(heap.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(heap.extractMin()).toBe(5);
      }
    });

    it('should handle decreaseKey to same value', () => {
      const node = heap.insert(5);
      heap.decreaseKey(node, 5);
      heap.decreaseKey(node, 5);
      expect(heap.peek()).toBe(5);
    });

    it('should handle complex sequence', () => {
      const node1 = heap.insert(100);
      const node2 = heap.insert(50);
      heap.insert(150);

      heap.decreaseKey(node1, 25);
      heap.extractMin();

      heap.decreaseKey(node2, 10);
      expect(heap.peek()).toBe(10);
    });

    it('should handle multiple heaps and melds', () => {
      const heaps: HollowHeap<number>[] = [];
      for (let i = 0; i < 10; i++) {
        const h = new HollowHeap<number>();
        for (let j = 0; j < 10; j++) {
          h.insert(i * 10 + j);
        }
        heaps.push(h);
      }

      const main = new HollowHeap<number>();
      for (const h of heaps) {
        main.meld(h);
      }

      expect(main.size).toBe(100);
      const results: number[] = [];
      while (!main.isEmpty()) {
        results.push(main.extractMin()!);
      }

      for (let i = 0; i < 100; i++) {
        expect(results[i]).toBe(i);
      }
    });
  });

  describe('integration tests', () => {
    it('should handle dijkstra-like operations', () => {
      const nodes: { node: ReturnType<typeof heap.insert>; distance: number }[] = [];
      for (let i = 0; i < 10; i++) {
        nodes.push({ node: heap.insert(100 + i * 10), distance: 100 + i * 10 });
      }

      heap.decreaseKey(nodes[5].node, 5);
      heap.decreaseKey(nodes[3].node, 3);
      heap.decreaseKey(nodes[7].node, 7);

      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(7);
    });

    it('should handle prim-like operations', () => {
      const edges = [
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 3 },
        { from: 1, to: 2, weight: 5 },
        { from: 1, to: 3, weight: 2 },
        { from: 2, to: 3, weight: 7 },
      ];

      for (const edge of edges) {
        heap.insert(edge.weight);
      }

      const mst: number[] = [];
      while (mst.length < 5) {
        mst.push(heap.extractMin()!);
      }

      expect(mst).toEqual([2, 3, 4, 5, 7]);
    });

    it('should handle event simulation', () => {
      const events = [
        { time: 100, type: 'a' },
        { time: 50, type: 'b' },
        { time: 75, type: 'c' },
        { time: 25, type: 'd' },
        { time: 150, type: 'e' },
      ];

      const eventHeap = new HollowHeap<{ time: number; type: string }>({
        comparator: (a, b) => a.time - b.time,
      });

      for (const event of events) {
        eventHeap.insert(event);
      }

      const processed: string[] = [];
      while (!eventHeap.isEmpty()) {
        const event = eventHeap.extractMin()!;
        processed.push(event.type);
      }

      expect(processed).toEqual(['d', 'b', 'c', 'a', 'e']);
    });
  });
});
