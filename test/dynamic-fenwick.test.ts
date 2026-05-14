import { describe, it, expect } from 'vitest';
import { DynamicFenwick } from './src/core/dynamic-fenwick/index.js';

describe('DynamicFenwick', () => {
  describe('constructor', () => {
    it('should create empty fenwick tree with default options', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should create fenwick tree with custom options', () => {
      const tree = new DynamicFenwick<number>({
        combiner: (a, b) => a + b,
        identity: 0,
        subtractor: (a, b) => a - b,
      });
      expect(tree.size()).toBe(0);
    });

    it('should work with string type', () => {
      const tree = new DynamicFenwick<string>({
        combiner: (a, b) => a + b,
        identity: '',
        subtractor: (a, b) => a.replace(b, ''),
      });
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('update', () => {
    it('should throw error when updating empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(() => tree.update(0, 5)).toThrow('Index 0 out of bounds [0, -1]');
    });

    it('should update value after insert', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.update(0, 3);
      expect(tree.get(0)).toBe(8);
    });

    it('should update multiple values', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.update(0, 10);
      tree.update(2, 5);
      expect(tree.get(0)).toBe(11);
      expect(tree.get(1)).toBe(2);
      expect(tree.get(2)).toBe(8);
    });

    it('should update with negative delta', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 10);
      tree.update(0, -3);
      expect(tree.get(0)).toBe(7);
    });

    it('should update with zero delta', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.update(0, 0);
      expect(tree.get(0)).toBe(5);
    });
  });

  describe('query', () => {
    it('should return identity for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.query(0)).toBe(0);
    });

    it('should return identity for negative index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.query(-1)).toBe(0);
    });

    it('should return prefix sum', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.query(0)).toBe(1);
      expect(tree.query(1)).toBe(3);
      expect(tree.query(2)).toBe(6);
    });

    it('should clamp index to size', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      expect(tree.query(10)).toBe(3);
    });
  });

  describe('prefixSum', () => {
    it('should return identity for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.prefixSum(0)).toBe(0);
    });

    it('should return identity for negative index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.prefixSum(-1)).toBe(0);
    });

    it('should return correct prefix sums', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 3);
      tree.insert(2, 7);
      tree.insert(3, 2);
      expect(tree.prefixSum(0)).toBe(5);
      expect(tree.prefixSum(1)).toBe(8);
      expect(tree.prefixSum(2)).toBe(15);
      expect(tree.prefixSum(3)).toBe(17);
    });

    it('should work with single element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 42);
      expect(tree.prefixSum(0)).toBe(42);
    });

    it('should clamp index beyond size', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      expect(tree.prefixSum(5)).toBe(3);
    });
  });

  describe('rangeQuery', () => {
    it('should return identity for empty range', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.rangeQuery(0, 0)).toBe(0);
    });

    it('should return identity when lo > hi', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.rangeQuery(5, 2)).toBe(0);
    });

    it('should return prefixSum when lo <= 0', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.rangeQuery(0, 2)).toBe(6);
    });

    it('should return correct range sum', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.insert(3, 4);
      tree.insert(4, 5);
      expect(tree.rangeQuery(1, 3)).toBe(9);
      expect(tree.rangeQuery(2, 4)).toBe(12);
      expect(tree.rangeQuery(0, 4)).toBe(15);
    });

    it('should handle single element range', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 3);
      tree.insert(2, 7);
      expect(tree.rangeQuery(1, 1)).toBe(3);
    });

    it('should work with negative lo', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      expect(tree.rangeQuery(-5, 1)).toBe(3);
    });
  });

  describe('insert', () => {
    it('should insert at beginning', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.size()).toBe(1);
      expect(tree.get(0)).toBe(5);
    });

    it('should insert at end', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.size()).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert in middle', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 3);
      tree.insert(1, 2);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should throw error for negative index', () => {
      const tree = new DynamicFenwick<number>();
      expect(() => tree.insert(-1, 5)).toThrow('Insert index -1 out of bounds [0, 0]');
    });

    it('should throw error for index beyond size', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      expect(() => tree.insert(5, 5)).toThrow('Insert index 5 out of bounds [0, 1]');
    });

    it('should insert at exact size', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.size()).toBe(3);
    });

    it('should update fenwick tree correctly after insert', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      expect(tree.total()).toBe(15);
    });

    it('should work with multiple inserts', () => {
      const tree = new DynamicFenwick<number>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i);
      }
      expect(tree.size()).toBe(10);
      expect(tree.total()).toBe(45);
    });
  });

  describe('remove', () => {
    it('should throw error when removing from empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(() => tree.remove(0)).toThrow('Index 0 out of bounds [0, -1]');
    });

    it('should remove and return element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.insert(2, 15);
      const removed = tree.remove(1);
      expect(removed).toBe(10);
      expect(tree.size()).toBe(2);
      expect(tree.toArray()).toEqual([5, 15]);
    });

    it('should remove first element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      const removed = tree.remove(0);
      expect(removed).toBe(5);
      expect(tree.toArray()).toEqual([10]);
    });

    it('should remove last element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      const removed = tree.remove(1);
      expect(removed).toBe(10);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should remove only element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 42);
      const removed = tree.remove(0);
      expect(removed).toBe(42);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it('should clear tree when removing last element', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.remove(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.total()).toBe(0);
    });

    it('should throw error for negative index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.remove(-1)).toThrow('Index -1 out of bounds [0, 0]');
    });

    it('should throw error for out of bounds index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.remove(1)).toThrow('Index 1 out of bounds [0, 0]');
    });

    it('should update fenwick tree correctly after remove', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.insert(2, 15);
      tree.remove(1);
      expect(tree.total()).toBe(20);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.size()).toBe(0);
    });

    it('should return correct size after inserts', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.size()).toBe(0);
      tree.insert(0, 1);
      expect(tree.size()).toBe(1);
      tree.insert(1, 2);
      expect(tree.size()).toBe(2);
      tree.insert(2, 3);
      expect(tree.size()).toBe(3);
    });

    it('should return correct size after removes', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.remove(0);
      expect(tree.size()).toBe(2);
      tree.remove(0);
      expect(tree.size()).toBe(1);
    });

    it('should return correct size after clear', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.clear();
      expect(tree.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should be true for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should be false after insert', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should be true after removing all elements', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.remove(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should be true after clear', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty tree', () => {
      const tree = new DynamicFenwick<number>();
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it('should clear non-empty tree', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.total()).toBe(0);
    });

    it('should allow operations after clear', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.clear();
      tree.insert(0, 5);
      expect(tree.size()).toBe(1);
      expect(tree.get(0)).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return array with elements', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify tree', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      const arr = tree.toArray();
      arr.push(3);
      expect(tree.toArray()).toEqual([1, 2]);
    });

    it('should return copy after removes', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.remove(1);
      expect(tree.toArray()).toEqual([1, 3]);
    });
  });

  describe('total', () => {
    it('should return identity for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(tree.total()).toBe(0);
    });

    it('should return sum of all elements', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.total()).toBe(6);
    });

    it('should update after insert', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(tree.total()).toBe(5);
      tree.insert(1, 10);
      expect(tree.total()).toBe(15);
    });

    it('should update after remove', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.insert(2, 15);
      expect(tree.total()).toBe(30);
      tree.remove(1);
      expect(tree.total()).toBe(20);
    });

    it('should update after update', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      expect(tree.total()).toBe(15);
      tree.update(0, 5);
      expect(tree.total()).toBe(20);
    });

    it('should return identity after clear', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.clear();
      expect(tree.total()).toBe(0);
    });
  });

  describe('get', () => {
    it('should throw error for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(() => tree.get(0)).toThrow('Index 0 out of bounds [0, -1]');
    });

    it('should throw error for negative index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.get(-1)).toThrow('Index -1 out of bounds [0, 0]');
    });

    it('should throw error for out of bounds index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.get(1)).toThrow('Index 1 out of bounds [0, 0]');
    });

    it('should return element at index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.get(0)).toBe(1);
      expect(tree.get(1)).toBe(2);
      expect(tree.get(2)).toBe(3);
    });

    it('should work after remove', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.remove(1);
      expect(tree.get(0)).toBe(1);
      expect(tree.get(1)).toBe(3);
    });
  });

  describe('set', () => {
    it('should throw error for empty tree', () => {
      const tree = new DynamicFenwick<number>();
      expect(() => tree.set(0, 5)).toThrow('Index 0 out of bounds [0, -1]');
    });

    it('should throw error for negative index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.set(-1, 10)).toThrow('Index -1 out of bounds [0, 0]');
    });

    it('should throw error for out of bounds index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      expect(() => tree.set(1, 10)).toThrow('Index 1 out of bounds [0, 0]');
    });

    it('should set element at index', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.set(0, 10);
      expect(tree.get(0)).toBe(10);
    });

    it('should update fenwick tree correctly', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.insert(2, 15);
      tree.set(1, 20);
      expect(tree.get(0)).toBe(5);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(15);
      expect(tree.total()).toBe(40);
    });

    it('should set to lower value', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 10);
      tree.set(0, 5);
      expect(tree.get(0)).toBe(5);
      expect(tree.total()).toBe(5);
    });

    it('should set to same value', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.set(0, 5);
      expect(tree.get(0)).toBe(5);
      expect(tree.total()).toBe(5);
    });
  });

  describe('integration tests', () => {
    it('should handle complex sequence of operations', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      expect(tree.total()).toBe(6);
      tree.update(1, 5);
      expect(tree.total()).toBe(11);
      expect(tree.get(1)).toBe(7);
      tree.set(0, 10);
      expect(tree.total()).toBe(20);
      tree.remove(2);
      expect(tree.total()).toBe(17);
      expect(tree.toArray()).toEqual([10, 7]);
    });

    it('should handle many operations', () => {
      const tree = new DynamicFenwick<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i);
      }
      expect(tree.size()).toBe(100);
      expect(tree.total()).toBe(4950);
      expect(tree.prefixSum(50)).toBe(1275);
      expect(tree.rangeQuery(25, 75)).toBe(2550);
      for (let i = 0; i < 50; i++) {
        tree.remove(0);
      }
      expect(tree.size()).toBe(50);
      expect(tree.total()).toBe(3725);
    });

    it('should maintain correctness after inserts and removes', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.insert(3, 4);
      tree.insert(4, 5);
      tree.remove(2);
      tree.insert(2, 10);
      expect(tree.toArray()).toEqual([1, 2, 10, 4, 5]);
      expect(tree.total()).toBe(22);
      expect(tree.prefixSum(2)).toBe(13);
      expect(tree.rangeQuery(1, 3)).toBe(16);
    });

    it('should work with interleaved operations', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.update(0, 3);
      tree.insert(1, 2);
      tree.set(0, 10);
      tree.insert(1, 1);
      tree.remove(2);
      expect(tree.toArray()).toEqual([10, 1]);
      expect(tree.total()).toBe(11);
    });

    it('should handle clearing and rebuilding', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.insert(2, 3);
      tree.clear();
      tree.insert(0, 10);
      tree.insert(1, 20);
      expect(tree.toArray()).toEqual([10, 20]);
      expect(tree.total()).toBe(30);
    });
  });

  describe('custom combiner scenarios', () => {
    it('should work with multiplication', () => {
      const tree = new DynamicFenwick<number>({
        combiner: (a, b) => a * b,
        identity: 1,
        subtractor: (a, b) => a / b,
      });
      tree.insert(0, 2);
      tree.insert(1, 3);
      tree.insert(2, 4);
      expect(tree.prefixSum(0)).toBe(2);
      expect(tree.prefixSum(1)).toBe(6);
      expect(tree.prefixSum(2)).toBe(24);
    });

    it('should work with max operation', () => {
      const tree = new DynamicFenwick<number>({
        combiner: Math.max,
        identity: -Infinity,
        subtractor: () => -Infinity,
      });
      tree.insert(0, 5);
      tree.insert(1, 10);
      tree.insert(2, 7);
      expect(tree.prefixSum(2)).toBe(10);
    });

    it('should work with min operation', () => {
      const tree = new DynamicFenwick<number>({
        combiner: Math.min,
        identity: Infinity,
        subtractor: () => Infinity,
      });
      tree.insert(0, 5);
      tree.insert(1, 2);
      tree.insert(2, 7);
      expect(tree.prefixSum(2)).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle large number of updates', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 0);
      for (let i = 0; i < 1000; i++) {
        tree.update(0, 1);
      }
      expect(tree.get(0)).toBe(1000);
    });

    it('should handle alternating inserts and removes', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 1);
      tree.insert(1, 2);
      tree.remove(0);
      tree.insert(1, 3);
      tree.remove(0);
      tree.insert(0, 4);
      expect(tree.toArray()).toEqual([4, 3]);
    });

    it('should handle setting to zero', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 10);
      tree.set(0, 0);
      expect(tree.get(0)).toBe(0);
      expect(tree.total()).toBe(0);
    });

    it('should handle updating with zero', () => {
      const tree = new DynamicFenwick<number>();
      tree.insert(0, 5);
      tree.update(0, 0);
      expect(tree.get(0)).toBe(5);
    });
  });
});