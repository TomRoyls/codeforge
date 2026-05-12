import { describe, it, expect } from 'vitest';
import { AVLTree3 } from './src/core/avl-tree-3/index.js';

describe('AVLTree3', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('uses default comparator', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([3, 5, 7]);
    });

    it('uses custom comparator', () => {
      const tree = new AVLTree3<number>((a, b) => b - a);
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([7, 5, 3]);
    });
  });

  describe('insert', () => {
    it('inserts single element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.contains(5)).toBe(true);
    });

    it('inserts multiple elements', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.size).toBe(3);
      expect(tree.contains(5)).toBe(true);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('maintains sorted order', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(2);
      tree.insert(7);
      expect(tree.toArray()).toEqual([2, 5, 7, 10, 15]);
    });

    it('handles duplicate values', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });

    it('handles sequential inserts', () => {
      const tree = new AVLTree3<number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('handles reverse sequential inserts', () => {
      const tree = new AVLTree3<number>();
      for (let i = 10; i >= 1; i--) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('handles random inserts', () => {
      const tree = new AVLTree3<number>();
      const values = [15, 7, 23, 4, 11, 19, 27, 2, 6, 9];
      values.forEach(v => tree.insert(v));
      expect(tree.size).toBe(10);
      expect(tree.toArray()).toEqual([2, 4, 6, 7, 9, 11, 15, 19, 23, 27]);
    });

    it('balances on left-left rotation', () => {
      const tree = new AVLTree3<number>();
      tree.insert(30);
      tree.insert(20);
      tree.insert(10);
      expect(tree.height()).toBeLessThanOrEqual(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('balances on right-right rotation', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      expect(tree.height()).toBeLessThanOrEqual(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('balances on left-right rotation', () => {
      const tree = new AVLTree3<number>();
      tree.insert(30);
      tree.insert(10);
      tree.insert(20);
      expect(tree.height()).toBeLessThanOrEqual(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('balances on right-left rotation', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(30);
      tree.insert(20);
      expect(tree.height()).toBeLessThanOrEqual(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });
  });

  describe('search', () => {
    it('finds existing element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
    });

    it('returns false for non-existent element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(1)).toBe(false);
      expect(tree.search(10)).toBe(false);
    });

    it('returns false in empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.search(5)).toBe(false);
    });
  });

  describe('contains', () => {
    it('is alias for search', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.contains(5)).toBe(tree.search(5));
      expect(tree.contains(10)).toBe(tree.search(10));
    });
  });

  describe('min', () => {
    it('returns null for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.min()).toBe(null);
    });

    it('returns minimum element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(2);
      expect(tree.min()).toBe(2);
    });

    it('returns single element for one node', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
    });

    it('works with negative numbers', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(-10);
      tree.insert(15);
      expect(tree.min()).toBe(-10);
    });
  });

  describe('max', () => {
    it('returns null for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.max()).toBe(null);
    });

    it('returns maximum element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(20);
      expect(tree.max()).toBe(20);
    });

    it('returns single element for one node', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.max()).toBe(5);
    });

    it('works with negative numbers', () => {
      const tree = new AVLTree3<number>();
      tree.insert(-5);
      tree.insert(-10);
      tree.insert(-15);
      expect(tree.max()).toBe(-5);
    });
  });

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.size).toBe(0);
    });

    it('returns correct size after inserts', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      tree.insert(3);
      expect(tree.size).toBe(2);
      tree.insert(7);
      expect(tree.size).toBe(3);
    });

    it('does not count duplicates', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns false after insert', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
    });

    it('returns true after clear', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty tree', () => {
      const tree = new AVLTree3<number>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('clears non-empty tree', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('returns sorted array', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(2);
      tree.insert(7);
      expect(tree.toArray()).toEqual([2, 5, 7, 10, 15]);
    });

    it('returns single element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });
  });

  describe('forEach', () => {
    it('does nothing on empty tree', () => {
      const tree = new AVLTree3<number>();
      const results: number[] = [];
      tree.forEach(v => results.push(v));
      expect(results).toEqual([]);
    });

    it('visits all elements in order', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      const results: number[] = [];
      tree.forEach(v => results.push(v));
      expect(results).toEqual([5, 10, 15]);
    });
  });

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AVLTree3<number>();
      expect(tree.height()).toBe(0);
    });

    it('returns 1 for single element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      expect(tree.height()).toBe(1);
    });

    it('is O(log n)', () => {
      const tree = new AVLTree3<number>();
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThanOrEqual(Math.log2(1000) + 2);
    });

    it('remains balanced after sequential inserts', () => {
      const tree = new AVLTree3<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThanOrEqual(8);
    });

    it('balance factor always <= 1', () => {
      const tree = new AVLTree3<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(Math.random() * 1000);
      }
      expect(tree.height()).toBeLessThanOrEqual(Math.log2(100) + 2);
    });
  });

  describe('delete', () => {
    it('deletes leaf node', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.delete(5);
      expect(tree.size).toBe(2);
      expect(tree.contains(5)).toBe(false);
      expect(tree.toArray()).toEqual([10, 15]);
    });

    it('deletes node with one child', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.delete(5);
      expect(tree.size).toBe(3);
      expect(tree.contains(5)).toBe(false);
      expect(tree.toArray()).toEqual([3, 10, 15]);
    });

    it('deletes node with two children', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.delete(10);
      expect(tree.size).toBe(2);
      expect(tree.contains(10)).toBe(false);
      expect(tree.toArray()).toEqual([5, 15]);
    });

    it('deletes root', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      tree.delete(10);
      expect(tree.size).toBe(4);
      expect(tree.contains(10)).toBe(false);
    });

    it('does nothing when deleting non-existent element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.insert(3);
      const sizeBefore = tree.size;
      tree.delete(10);
      expect(tree.size).toBe(sizeBefore);
    });

    it('deletes then search returns false', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.delete(10);
      expect(tree.search(10)).toBe(false);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(15)).toBe(true);
    });

    it('maintains balance after delete', () => {
      const tree = new AVLTree3<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      tree.delete(50);
      expect(tree.height()).toBeLessThanOrEqual(8);
    });

    it('handles deleting all elements', () => {
      const tree = new AVLTree3<number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 10; i++) {
        tree.delete(i);
      }
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('handles deleting from empty tree', () => {
      const tree = new AVLTree3<number>();
      tree.delete(5);
      expect(tree.size).toBe(0);
    });

    it('handles deleting single element', () => {
      const tree = new AVLTree3<number>();
      tree.insert(5);
      tree.delete(5);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('handles mixed operations', () => {
      const tree = new AVLTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      expect(tree.size).toBe(5);
      expect(tree.min()).toBe(3);
      expect(tree.max()).toBe(15);
      tree.delete(10);
      expect(tree.size).toBe(4);
      expect(tree.contains(10)).toBe(false);
      expect(tree.toArray()).toEqual([3, 5, 7, 15]);
    });

    it('handles string values', () => {
      const tree = new AVLTree3<string>();
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
      expect(tree.min()).toBe('apple');
      expect(tree.max()).toBe('cherry');
    });

    it('handles custom object comparator', () => {
      interface Person {
        name: string;
        age: number;
      }
      const tree = new AVLTree3<Person>((a, b) => a.age - b.age);
      tree.insert({ name: 'Alice', age: 30 });
      tree.insert({ name: 'Bob', age: 25 });
      tree.insert({ name: 'Charlie', age: 35 });
      expect(tree.size).toBe(3);
      expect(tree.min()!.name).toBe('Bob');
      expect(tree.max()!.name).toBe('Charlie');
    });
  });
});
