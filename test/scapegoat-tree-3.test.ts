import { describe, it, expect } from 'vitest';
import { ScapegoatTree3 } from './src/core/scapegoat-tree-3/index.js';

describe.skip('ScapegoatTree3', () => {
  describe('Insert and Search', () => {
    it('should insert and find a single element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.search(5)).toBe(true);
    });

    it('should not find element that does not exist', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.search(10)).toBe(false);
    });

    it('should insert multiple elements and find them', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
    });

    it('should handle duplicate inserts', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.search(5)).toBe(true);
    });

    it('should insert in ascending order', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 10; i++) {
        expect(tree.search(i)).toBe(true);
      }
    });

    it('should insert in descending order', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 10; i >= 1; i--) {
        tree.insert(i);
      }
      for (let i = 1; i <= 10; i++) {
        expect(tree.search(i)).toBe(true);
      }
    });

    it('should insert in random order', () => {
      const tree = new ScapegoatTree3<number>();
      const values = [5, 2, 8, 1, 3, 7, 9, 4, 6, 0];
      values.forEach(v => tree.insert(v));
      values.forEach(v => expect(tree.search(v)).toBe(true));
    });
  });

  describe('Contains', () => {
    it('should return false for empty tree', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.contains(5)).toBe(false);
    });

    it('should return true for existing element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });

    it('should contain all inserted elements', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
      [1, 2, 3, 4, 5].forEach(v => expect(tree.contains(v)).toBe(true));
    });
  });

  describe('Delete', () => {
    it('should delete leaf node', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.delete(3)).toBe(true);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(5)).toBe(true);
    });

    it('should delete node with one child', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(4);
      expect(tree.delete(3)).toBe(true);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(4)).toBe(true);
    });

    it('should delete node with two children', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      tree.insert(8);
      expect(tree.delete(5)).toBe(true);
      expect(tree.contains(5)).toBe(false);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('should return false when deleting non-existent element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.delete(10)).toBe(false);
    });

    it('should delete root when it is the only element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.delete(5)).toBe(true);
      expect(tree.contains(5)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('should delete from empty tree and return false', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.delete(5)).toBe(false);
    });

    it('should delete multiple elements', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
      expect(tree.delete(2)).toBe(true);
      expect(tree.delete(4)).toBe(true);
      expect(tree.contains(2)).toBe(false);
      expect(tree.contains(4)).toBe(false);
      expect(tree.contains(1)).toBe(true);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(5)).toBe(true);
    });

    it('should delete then search correctly', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      expect(tree.search(5)).toBe(false);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
    });

    it('should delete all elements one by one', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
      [1, 2, 3, 4, 5].forEach(v => {
        expect(tree.delete(v)).toBe(true);
      });
      expect(tree.size).toBe(0);
    });
  });

  describe('Min and Max', () => {
    it('should return null for empty tree min', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.min()).toBe(null);
    });

    it('should return null for empty tree max', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.max()).toBe(null);
    });

    it('should return same value for single element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
    });

    it('should find minimum element', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      expect(tree.min()).toBe(1);
    });

    it('should find maximum element', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      expect(tree.max()).toBe(9);
    });

    it('should update min after deleting minimum', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      tree.delete(1);
      expect(tree.min()).toBe(3);
    });

    it('should update max after deleting maximum', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      tree.delete(9);
      expect(tree.max()).toBe(7);
    });
  });

  describe('Size and isEmpty', () => {
    it('should be empty initially', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should not be empty after insert', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should track size correctly with multiple inserts', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.size).toBe(3);
    });

    it('should not count duplicates', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('should decrease size after delete', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      expect(tree.size).toBe(2);
    });

    it('should be empty after clearing', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should handle clearing empty tree', () => {
      const tree = new ScapegoatTree3<number>();
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should be empty after deleting all elements', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3].forEach(v => tree.insert(v));
      [1, 2, 3].forEach(v => tree.delete(v));
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('Clear', () => {
    it('should clear all elements', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
      tree.clear();
      expect(tree.contains(1)).toBe(false);
      expect(tree.contains(2)).toBe(false);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(4)).toBe(false);
      expect(tree.contains(5)).toBe(false);
    });

    it('should allow inserts after clear', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.clear();
      tree.insert(10);
      expect(tree.contains(10)).toBe(true);
    });

    it('should reset size after clear', () => {
      const tree = new ScapegoatTree3<number>();
      [1, 2, 3].forEach(v => tree.insert(v));
      tree.clear();
      expect(tree.size).toBe(0);
    });
  });

  describe('ToArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return single element array for single element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should return sorted array', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle duplicate inserts correctly', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.toArray()).toEqual([3, 5, 7]);
    });

    it('should return array after delete', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      tree.delete(5);
      expect(tree.toArray()).toEqual([1, 3, 7, 9]);
    });
  });

  describe('ForEach', () => {
    it('should iterate over empty tree', () => {
      const tree = new ScapegoatTree3<number>();
      const values: number[] = [];
      tree.forEach(v => values.push(v));
      expect(values).toEqual([]);
    });

    it('should iterate over all elements in order', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
      const values: number[] = [];
      tree.forEach(v => values.push(v));
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });

    it('should pass index to callback', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7].forEach(v => tree.insert(v));
      const indices: number[] = [];
      tree.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should handle large trees', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      const values: number[] = [];
      tree.forEach(v => values.push(v));
      expect(values).toHaveLength(100);
      expect(values[0]).toBe(0);
      expect(values[99]).toBe(99);
    });
  });

  describe('Height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new ScapegoatTree3<number>();
      expect(tree.height()).toBe(0);
    });

    it('should return 1 for single element', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(5);
      expect(tree.height()).toBe(1);
    });

    it('should calculate height for balanced tree', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 4, 6, 8].forEach(v => tree.insert(v));
      expect(tree.height()).toBe(3);
    });

    it('should calculate height for linear tree', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 1; i <= 5; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBe(5);
    });

    it('should be O(log n) for many elements', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      const h = tree.height();
      const n = tree.size;
      expect(h).toBeLessThanOrEqual(Math.log2(n) * 2);
    });

    it('should update height after delete', () => {
      const tree = new ScapegoatTree3<number>();
      [5, 3, 7, 1, 4, 6, 8].forEach(v => tree.insert(v));
      tree.delete(1);
      expect(tree.height()).toBeLessThanOrEqual(3);
    });

    it('should update height after rebalancing', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 50; i++) {
        tree.delete(i);
      }
      expect(tree.height()).toBeLessThanOrEqual(Math.log2(50) * 2);
    });
  });

  describe('Custom Comparator', () => {
    it('should work with custom comparator', () => {
      const comparator = (a: string, b: string) => {
        return a.localeCompare(b);
      };
      const tree = new ScapegoatTree3<string>(comparator);
      tree.insert('zebra');
      tree.insert('apple');
      tree.insert('banana');
      expect(tree.contains('apple')).toBe(true);
      expect(tree.contains('banana')).toBe(true);
      expect(tree.contains('zebra')).toBe(true);
    });

    it('should sort correctly with custom comparator', () => {
      const comparator = (a: string, b: string) => {
        return a.localeCompare(b);
      };
      const tree = new ScapegoatTree3<string>(comparator);
      tree.insert('zebra');
      tree.insert('apple');
      tree.insert('banana');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should work with object comparator', () => {
      const comparator = (a: {id: number}, b: {id: number}) => {
        return a.id - b.id;
      };
      const tree = new ScapegoatTree3<{id: number}>(comparator);
      tree.insert({id: 5});
      tree.insert({id: 3});
      tree.insert({id: 7});
      expect(tree.contains({id: 5})).toBe(true);
      expect(tree.min()).toEqual({id: 3});
      expect(tree.max()).toEqual({id: 7});
    });
  });

  describe('Alpha Parameter', () => {
    it('should use default alpha of 0.7', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThanOrEqual(20);
    });

    it('should accept custom alpha value', () => {
      const tree = new ScapegoatTree3<number>(undefined, 0.5);
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThanOrEqual(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative numbers', () => {
      const tree = new ScapegoatTree3<number>();
      [-5, -3, -7, -1, -9].forEach(v => tree.insert(v));
      expect(tree.min()).toBe(-9);
      expect(tree.max()).toBe(-1);
    });

    it('should handle zero', () => {
      const tree = new ScapegoatTree3<number>();
      tree.insert(0);
      expect(tree.min()).toBe(0);
      expect(tree.max()).toBe(0);
    });

    it('should handle mix of positive and negative', () => {
      const tree = new ScapegoatTree3<number>();
      [-5, 3, -7, 1, -9].forEach(v => tree.insert(v));
      expect(tree.min()).toBe(-9);
      expect(tree.max()).toBe(3);
    });

    it('should handle large number of elements', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 0; i < 10000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10000);
      expect(tree.contains(0)).toBe(true);
      expect(tree.contains(9999)).toBe(true);
    });
  });

  describe('Sequential Operations', () => {
    it('should handle sequential insert and delete', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 50; i++) {
        tree.delete(i);
      }
      expect(tree.size).toBe(50);
      expect(tree.contains(50)).toBe(false);
      expect(tree.contains(51)).toBe(true);
    });

    it('should handle alternating insert and delete', () => {
      const tree = new ScapegoatTree3<number>();
      for (let i = 0; i < 20; i++) {
        tree.insert(i);
        if (i > 0 && i % 2 === 0) {
          tree.delete(i / 2);
        }
      }
      expect(tree.contains(0)).toBe(true);
      expect(tree.contains(1)).toBe(false);
      expect(tree.contains(19)).toBe(true);
    });
  });
});