import { describe, it, expect } from 'vitest';
import { FenwickTree2 } from '../src/core/fenwick-tree-2/index.js';

describe('FenwickTree2', () => {
  describe('constructor', () => {
    it('should create empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });

    it('should create tree from array', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      expect(tree.size).toBe(5);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should create tree from empty array', () => {
      const tree = new FenwickTree2<number>([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should create tree with single element', () => {
      const tree = new FenwickTree2<number>([42]);
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(42);
    });
  });

  describe('query', () => {
    it('should return prefix sum', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      expect(tree.query(0)).toBe(1);
      expect(tree.query(1)).toBe(3);
      expect(tree.query(2)).toBe(6);
      expect(tree.query(3)).toBe(10);
      expect(tree.query(4)).toBe(15);
    });

    it('should return zero for first element', () => {
      const tree = new FenwickTree2<number>([10, 20, 30]);
      expect(tree.query(0)).toBe(10);
    });

    it('should return sum of all elements for last index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      expect(tree.query(3)).toBe(10);
    });

    it('should throw for negative index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.query(-1)).toThrow(RangeError);
      expect(() => tree.query(-10)).toThrow(RangeError);
    });

    it('should throw for out of bounds index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.query(3)).toThrow(RangeError);
      expect(() => tree.query(100)).toThrow(RangeError);
    });

    it('should throw when querying empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(() => tree.query(0)).toThrow(RangeError);
    });
  });

  describe('update', () => {
    it('should update element by delta', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.update(2, 10);
      expect(tree.get(2)).toBe(13);
      expect(tree.query(2)).toBe(16);
    });

    it('should handle negative delta', () => {
      const tree = new FenwickTree2<number>([10, 20, 30, 40]);
      tree.update(1, -5);
      expect(tree.get(1)).toBe(15);
      expect(tree.query(1)).toBe(25);
    });

    it('should update multiple times', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.update(0, 5);
      tree.update(1, 10);
      tree.update(2, 15);
      expect(tree.get(0)).toBe(6);
      expect(tree.get(1)).toBe(12);
      expect(tree.get(2)).toBe(18);
    });

    it('should throw for negative index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.update(-1, 10)).toThrow(RangeError);
    });

    it('should throw for out of bounds index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.update(3, 10)).toThrow(RangeError);
      expect(() => tree.update(100, 10)).toThrow(RangeError);
    });

    it('should throw when updating empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(() => tree.update(0, 10)).toThrow(RangeError);
    });
  });

  describe('rangeQuery', () => {
    it('should return sum of range', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      expect(tree.rangeQuery(1, 3)).toBe(9);
      expect(tree.rangeQuery(0, 4)).toBe(15);
      expect(tree.rangeQuery(2, 4)).toBe(12);
    });

    it('should return single element for same range', () => {
      const tree = new FenwickTree2<number>([10, 20, 30, 40]);
      expect(tree.rangeQuery(1, 1)).toBe(20);
      expect(tree.rangeQuery(3, 3)).toBe(40);
    });

    it('should handle range from start', () => {
      const tree = new FenwickTree2<number>([5, 10, 15, 20]);
      expect(tree.rangeQuery(0, 2)).toBe(30);
    });

    it('should handle range to end', () => {
      const tree = new FenwickTree2<number>([5, 10, 15, 20]);
      expect(tree.rangeQuery(1, 3)).toBe(45);
    });

    it('should throw for negative indices', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.rangeQuery(-1, 2)).toThrow(RangeError);
      expect(() => tree.rangeQuery(0, -1)).toThrow(RangeError);
    });

    it('should throw for out of bounds indices', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.rangeQuery(0, 3)).toThrow(RangeError);
      expect(() => tree.rangeQuery(10, 2)).toThrow(RangeError);
    });

    it('should throw when from greater than to', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.rangeQuery(2, 1)).toThrow(RangeError);
      expect(() => tree.rangeQuery(3, 2)).toThrow(RangeError);
    });
  });

  describe('set', () => {
    it('should set element value', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.set(2, 100);
      expect(tree.get(2)).toBe(100);
      expect(tree.query(2)).toBe(103);
    });

    it('should set multiple elements', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.set(0, 10);
      tree.set(1, 20);
      tree.set(3, 40);
      expect(tree.toArray()).toEqual([10, 20, 3, 40]);
    });

    it('should set to same value', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.set(1, 2);
      expect(tree.get(1)).toBe(2);
      expect(tree.query(1)).toBe(3);
    });

    it('should throw for negative index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.set(-1, 10)).toThrow(RangeError);
    });

    it('should throw for out of bounds index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.set(3, 10)).toThrow(RangeError);
      expect(() => tree.set(100, 10)).toThrow(RangeError);
    });

    it('should throw when setting on empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(() => tree.set(0, 10)).toThrow(RangeError);
    });
  });

  describe('get', () => {
    it('should get element by index', () => {
      const tree = new FenwickTree2<number>([10, 20, 30, 40]);
      expect(tree.get(0)).toBe(10);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(30);
      expect(tree.get(3)).toBe(40);
    });

    it('should get after update', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.update(1, 10);
      expect(tree.get(1)).toBe(12);
    });

    it('should get after set', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.set(2, 100);
      expect(tree.get(2)).toBe(100);
    });

    it('should throw for negative index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.get(-1)).toThrow(RangeError);
    });

    it('should throw for out of bounds index', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(() => tree.get(3)).toThrow(RangeError);
      expect(() => tree.get(100)).toThrow(RangeError);
    });

    it('should throw when getting from empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(() => tree.get(0)).toThrow(RangeError);
    });
  });

  describe('push', () => {
    it('should push element to end', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.push(4);
      expect(tree.size).toBe(4);
      expect(tree.get(3)).toBe(4);
      expect(tree.query(3)).toBe(10);
    });

    it('should push multiple elements', () => {
      const tree = new FenwickTree2<number>();
      tree.push(1);
      tree.push(2);
      tree.push(3);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should push to empty tree', () => {
      const tree = new FenwickTree2<number>();
      tree.push(42);
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(42);
    });

    it('should push negative numbers', () => {
      const tree = new FenwickTree2<number>();
      tree.push(-1);
      tree.push(-2);
      tree.push(-3);
      expect(tree.query(2)).toBe(-6);
    });

    it('should update prefix sums after push', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.push(4);
      expect(tree.query(0)).toBe(1);
      expect(tree.query(1)).toBe(3);
      expect(tree.query(2)).toBe(6);
      expect(tree.query(3)).toBe(10);
    });
  });

  describe('pop', () => {
    it('should pop element from end', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const popped = tree.pop();
      expect(popped).toBe(5);
      expect(tree.size).toBe(4);
      expect(tree.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should pop multiple elements', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4]);
      tree.pop();
      tree.pop();
      expect(tree.size).toBe(2);
      expect(tree.toArray()).toEqual([1, 2]);
    });

    it('should pop until empty', () => {
      const tree = new FenwickTree2<number>([1, 2]);
      tree.pop();
      tree.pop();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should throw when popping from empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(() => tree.pop()).toThrow(RangeError);
    });

    it('should update prefix sums after pop', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.pop();
      expect(tree.query(0)).toBe(1);
      expect(tree.query(1)).toBe(3);
      expect(tree.query(2)).toBe(6);
      expect(tree.query(3)).toBe(10);
    });
  });

  describe('size', () => {
    it('should return zero for empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(tree.size).toBe(0);
    });

    it('should return correct size after push', () => {
      const tree = new FenwickTree2<number>();
      expect(tree.size).toBe(0);
      tree.push(1);
      expect(tree.size).toBe(1);
      tree.push(2);
      expect(tree.size).toBe(2);
    });

    it('should return correct size after pop', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      expect(tree.size).toBe(3);
      tree.pop();
      expect(tree.size).toBe(2);
      tree.pop();
      expect(tree.size).toBe(1);
    });

    it('should track size correctly', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      expect(tree.size).toBe(5);
      tree.push(6);
      expect(tree.size).toBe(6);
      tree.pop();
      expect(tree.size).toBe(5);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false for non-empty tree', () => {
      const tree = new FenwickTree2<number>([1]);
      expect(tree.isEmpty).toBe(false);
    });

    it('should return true after popping all elements', () => {
      const tree = new FenwickTree2<number>([1, 2]);
      tree.pop();
      tree.pop();
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false after push', () => {
      const tree = new FenwickTree2<number>();
      tree.push(1);
      expect(tree.isEmpty).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });

    it('should clear empty tree', () => {
      const tree = new FenwickTree2<number>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should allow operations after clear', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.clear();
      tree.push(10);
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(10);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const arr = tree.toArray();
      expect(arr).toEqual([1, 2, 3, 4, 5]);
      expect(arr).toBeInstanceOf(Array);
    });

    it('should return empty array for empty tree', () => {
      const tree = new FenwickTree2<number>();
      expect(tree.toArray()).toEqual([]);
      expect(tree.toArray()).toBeInstanceOf(Array);
    });

    it('should not affect original tree', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      const arr = tree.toArray();
      arr.push(4);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should return copy of values', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      const arr1 = tree.toArray();
      const arr2 = tree.toArray();
      expect(arr1).toEqual(arr2);
      expect(arr1 === arr2).toBe(false);
    });
  });

  describe('clone', () => {
    it('should clone tree', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const clone = tree.clone();
      expect(clone.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(clone.size).toBe(5);
    });

    it('should clone empty tree', () => {
      const tree = new FenwickTree2<number>();
      const clone = tree.clone();
      expect(clone.size).toBe(0);
      expect(clone.isEmpty).toBe(true);
    });

    it('should create independent copy', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      const clone = tree.clone();
      clone.push(4);
      expect(tree.toArray()).toEqual([1, 2, 3]);
      expect(clone.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should have independent state after update', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      const clone = tree.clone();
      tree.update(1, 10);
      clone.update(1, 20);
      expect(tree.get(1)).toBe(12);
      expect(clone.get(1)).toBe(22);
    });

    it('should preserve prefix sums', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const clone = tree.clone();
      expect(clone.query(4)).toBe(15);
      expect(clone.query(2)).toBe(6);
    });
  });

  describe('fromArray', () => {
    it('should create tree from array', () => {
      const tree = FenwickTree2.fromArray([1, 2, 3, 4, 5]);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(tree.size).toBe(5);
    });

    it('should create from empty array', () => {
      const tree = FenwickTree2.fromArray([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should create from single element array', () => {
      const tree = FenwickTree2.fromArray([42]);
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(42);
    });

    it('should compute correct prefix sums', () => {
      const tree = FenwickTree2.fromArray([1, 2, 3, 4, 5]);
      expect(tree.query(0)).toBe(1);
      expect(tree.query(2)).toBe(6);
      expect(tree.query(4)).toBe(15);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should support spread operator', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const result = [...tree];
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should iterate over empty tree', () => {
      const tree = new FenwickTree2<number>();
      const result = [...tree];
      expect(result).toEqual([]);
    });

    it('should iterate in correct order', () => {
      const tree = new FenwickTree2<number>([10, 20, 30, 40]);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([10, 20, 30, 40]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      const values: number[] = [];
      const indices: number[] = [];
      tree.forEach((value, index) => {
        values.push(value);
        indices.push(index);
      });
      expect(values).toEqual([1, 2, 3, 4, 5]);
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it('should not iterate over empty tree', () => {
      const tree = new FenwickTree2<number>();
      let count = 0;
      tree.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate with single element', () => {
      const tree = new FenwickTree2<number>([42]);
      const values: number[] = [];
      const indices: number[] = [];
      tree.forEach((value, index) => {
        values.push(value);
        indices.push(index);
      });
      expect(values).toEqual([42]);
      expect(indices).toEqual([0]);
    });
  });

  describe('complex operations', () => {
    it('should handle mixed push and update', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.push(4);
      tree.update(1, 5);
      tree.push(5);
      expect(tree.size).toBe(5);
      expect(tree.get(1)).toBe(7);
      expect(tree.query(4)).toBe(20);
    });

    it('should handle mixed set and query', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.set(2, 10);
      expect(tree.rangeQuery(0, 2)).toBe(13);
      tree.set(0, 5);
      expect(tree.rangeQuery(0, 3)).toBe(21);
    });

    it('should handle push, update, pop sequence', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.push(4);
      tree.update(2, 10);
      expect(tree.query(3)).toBe(20);
      tree.pop();
      expect(tree.query(2)).toBe(16);
    });

    it('should handle multiple range queries', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      expect(tree.rangeQuery(0, 4)).toBe(15);
      expect(tree.rangeQuery(1, 3)).toBe(9);
      expect(tree.rangeQuery(2, 4)).toBe(12);
      expect(tree.rangeQuery(0, 2)).toBe(6);
    });
  });

  describe('edge cases', () => {
    it('should handle single element tree', () => {
      const tree = new FenwickTree2<number>([42]);
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(42);
      expect(tree.query(0)).toBe(42);
      expect(tree.rangeQuery(0, 0)).toBe(42);
    });

    it('should handle two element tree', () => {
      const tree = new FenwickTree2<number>([10, 20]);
      expect(tree.size).toBe(2);
      expect(tree.query(0)).toBe(10);
      expect(tree.query(1)).toBe(30);
      expect(tree.rangeQuery(0, 1)).toBe(30);
    });

    it('should handle large tree', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1);
      const tree = new FenwickTree2<number>(arr);
      expect(tree.size).toBe(100);
      expect(tree.query(99)).toBe(5050);
      expect(tree.query(49)).toBe(1275);
    });

    it('should handle zeros', () => {
      const tree = new FenwickTree2<number>([0, 0, 0, 0]);
      expect(tree.query(0)).toBe(0);
      expect(tree.query(2)).toBe(0);
      expect(tree.rangeQuery(0, 3)).toBe(0);
    });

    it('should handle negative numbers', () => {
      const tree = new FenwickTree2<number>([-1, -2, -3, -4]);
      expect(tree.query(0)).toBe(-1);
      expect(tree.query(3)).toBe(-10);
      expect(tree.rangeQuery(1, 2)).toBe(-5);
    });

    it('should handle push many elements', () => {
      const tree = new FenwickTree2<number>();
      for (let i = 1; i <= 100; i++) {
        tree.push(i);
      }
      expect(tree.size).toBe(100);
      expect(tree.query(99)).toBe(5050);
    });

    it('should handle pop many elements', () => {
      const tree = new FenwickTree2<number>(Array.from({ length: 100 }, (_, i) => i + 1));
      expect(tree.size).toBe(100);
      for (let i = 0; i < 99; i++) {
        tree.pop();
      }
      expect(tree.size).toBe(1);
      expect(tree.get(0)).toBe(1);
    });

    it('should handle update many elements', () => {
      const tree = new FenwickTree2<number>(Array.from({ length: 100 }, (_, i) => i + 1));
      for (let i = 0; i < 100; i++) {
        tree.update(i, 1);
      }
      expect(tree.query(99)).toBe(5150);
    });
  });

  describe('after operations state', () => {
    it('should maintain correct prefix sums after many updates', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.update(0, 5);
      tree.update(2, 10);
      tree.update(4, 15);
      expect(tree.query(4)).toBe(45);
      expect(tree.rangeQuery(1, 3)).toBe(19);
    });

    it('should maintain correct prefix sums after push and pop', () => {
      const tree = new FenwickTree2<number>([1, 2, 3]);
      tree.push(4);
      tree.push(5);
      tree.pop();
      expect(tree.query(3)).toBe(10);
      expect(tree.rangeQuery(0, 3)).toBe(10);
    });

    it('should maintain correct prefix sums after set operations', () => {
      const tree = new FenwickTree2<number>([1, 2, 3, 4, 5]);
      tree.set(0, 10);
      tree.set(2, 30);
      tree.set(4, 50);
      expect(tree.query(4)).toBe(96);
      expect(tree.rangeQuery(1, 3)).toBe(36);
    });
  });
});
