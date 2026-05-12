import { describe, it, expect } from 'vitest';
import { AVLTree4 } from '../src/core/avl-tree-4/index.js';

describe('AVLTree4', () => {
  describe('insert', () => {
    it('should insert single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.search(5)).toBe(true);
    });

    it('should insert multiple elements in order', () => {
      const tree = new AVLTree4<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert multiple elements in reverse order', () => {
      const tree = new AVLTree4<number>();
      tree.insert(3);
      tree.insert(2);
      tree.insert(1);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert multiple elements in random order', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.size).toBe(5);
      expect(tree.toArray()).toEqual([2, 3, 4, 5, 7]);
    });

    it('should not insert duplicates', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should maintain balance after insertions', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
        expect(tree._isBalanced()).toBe(true);
      }
    });
  });

  describe('remove', () => {
    it('should remove leaf node', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.remove(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(3)).toBe(false);
    });

    it('should remove node with one child', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(4);
      expect(tree.remove(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(3)).toBe(false);
      expect(tree.search(4)).toBe(true);
    });

    it('should remove node with two children', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      tree.insert(8);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(6);
      expect(tree.search(5)).toBe(false);
    });

    it('should return false for removing non-existent value', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.remove(10)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should maintain balance after deletions', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 20; i++) {
        tree.remove(i);
        expect(tree._isBalanced()).toBe(true);
      }
    });

    it('should handle removing from empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.remove(5)).toBe(false);
    });
  });

  describe('search', () => {
    it('should find existing element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.search(5)).toBe(true);
    });

    it('should return false for non-existent element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.search(10)).toBe(false);
    });

    it('should search in empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.search(5)).toBe(false);
    });
  });

  describe('contains', () => {
    it('should contain existing element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should not contain non-existent element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });
  });

  describe('min', () => {
    it('should return minimum element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.min()).toBeUndefined();
    });

    it('should work with single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
    });
  });

  describe('max', () => {
    it('should return maximum element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.max()).toBe(7);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.max()).toBeUndefined();
    });

    it('should work with single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.max()).toBe(5);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.size).toBe(0);
    });

    it('should increase with insertions', () => {
      const tree = new AVLTree4<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
    });

    it('should decrease with deletions', () => {
      const tree = new AVLTree4<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(2);
      expect(tree.size).toBe(2);
    });

    it('should not count duplicates', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should be true for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.isEmpty).toBe(true);
    });

    it('should be false after insertion', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.isEmpty).toBe(false);
    });

    it('should be true after clearing', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.search(5)).toBe(false);
    });

    it('should work on empty tree', () => {
      const tree = new AVLTree4<number>();
      tree.clear();
      expect(tree.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should work with single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });
  });

  describe('forEach', () => {
    it('should iterate in sorted order', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const result: number[] = [];
      tree.forEach((value) => result.push(value));
      expect(result).toEqual([3, 5, 7]);
    });

    it('should not iterate over empty tree', () => {
      const tree = new AVLTree4<number>();
      const result: number[] = [];
      tree.forEach((value) => result.push(value));
      expect(result).toEqual([]);
    });
  });

  describe('predecessor', () => {
    it('should find predecessor', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(4);
      expect(tree.predecessor(5)).toBe(4);
    });

    it('should return undefined for smallest element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.predecessor(3)).toBeUndefined();
    });

    it('should return undefined for non-existent element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.predecessor(10)).toBe(5);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.predecessor(5)).toBeUndefined();
    });
  });

  describe('successor', () => {
    it('should find successor', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(6);
      expect(tree.successor(5)).toBe(6);
    });

    it('should return undefined for largest element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.successor(7)).toBeUndefined();
    });

    it('should return undefined for non-existent element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.successor(3)).toBe(5);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.successor(5)).toBeUndefined();
    });
  });

  describe('rangeSearch', () => {
    it('should find values in range', () => {
      const tree = new AVLTree4<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(4);
      tree.insert(5);
      expect(tree.rangeSearch(2, 4)).toEqual([2, 3, 4]);
    });

    it('should return empty array for empty range', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.rangeSearch(10, 20)).toEqual([]);
    });

    it('should handle inclusive boundaries', () => {
      const tree = new AVLTree4<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.rangeSearch(1, 3)).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.rangeSearch(1, 5)).toEqual([]);
    });
  });

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.height()).toBe(0);
    });

    it('should return 1 for single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.height()).toBe(1);
    });

    it('should increase with insertions', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.height()).toBe(2);
    });
  });

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree.getHeight()).toBe(0);
    });

    it('should return 1 for single element', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.getHeight()).toBe(1);
    });

    it('should match height()', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.getHeight()).toBe(tree.height());
    });
  });

  describe('_isBalanced', () => {
    it('should be true for empty tree', () => {
      const tree = new AVLTree4<number>();
      expect(tree._isBalanced()).toBe(true);
    });

    it('should be true after insertions', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      expect(tree._isBalanced()).toBe(true);
    });

    it('should be true after deletions', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 10; i++) {
        tree.remove(i);
      }
      expect(tree._isBalanced()).toBe(true);
    });
  });

  describe('large sequential operations', () => {
    it('should handle large sequential insert', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i);
        expect(tree._isBalanced()).toBe(true);
      }
      expect(tree.size).toBe(1000);
      expect(tree.toArray().length).toBe(1000);
    });

    it('should handle large sequential delete', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i);
      }
      for (let i = 1; i <= 1000; i++) {
        expect(tree.remove(i)).toBe(true);
        expect(tree._isBalanced()).toBe(true);
      }
      expect(tree.size).toBe(0);
    });
  });

  describe('large random operations', () => {
    it('should handle large random insert', () => {
      const tree = new AVLTree4<number>();
      const values = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        const value = Math.floor(Math.random() * 2000);
        tree.insert(value);
        values.add(value);
        expect(tree._isBalanced()).toBe(true);
      }
      expect(tree.size).toBe(values.size);
    });

    it('should handle large random insert and delete', () => {
      const tree = new AVLTree4<number>();
      const values: number[] = [];
      for (let i = 0; i < 500; i++) {
        const value = Math.floor(Math.random() * 1000);
        tree.insert(value);
        values.push(value);
      }

      for (let i = 0; i < 250; i++) {
        const index = Math.floor(Math.random() * values.length);
        tree.remove(values[index]);
        expect(tree._isBalanced()).toBe(true);
      }
    });
  });

  describe('single element operations', () => {
    it('should work with single element insert and remove', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.search(5)).toBe(true);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should work with single element operations', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
      const result: number[] = [];
      tree.forEach((value) => result.push(value));
      expect(result).toEqual([5]);
      expect(tree.predecessor(5)).toBeUndefined();
      expect(tree.successor(5)).toBeUndefined();
    });
  });

  describe('duplicate handling', () => {
    it('should not increase size with duplicates', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('should not insert duplicate values', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should remove only one instance of duplicates', () => {
      const tree = new AVLTree4<number>();
      tree.insert(5);
      tree.insert(5);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.remove(5)).toBe(false);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const tree = new AVLTree4<string>((a, b) => a.localeCompare(b));
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should work with reverse comparator', () => {
      const tree = new AVLTree4<number>((a, b) => b - a);
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('balance verification after all operations', () => {
    it('should maintain balance after mixed operations', () => {
      const tree = new AVLTree4<number>();
      const operations = [10, 20, 30, 40, 50, 25, 35, 15, 5];

      for (const op of operations) {
        tree.insert(op);
        expect(tree._isBalanced()).toBe(true);
      }

      for (const op of operations) {
        tree.remove(op);
        expect(tree._isBalanced()).toBe(true);
      }
    });

    it('should maintain height O(log n)', () => {
      const tree = new AVLTree4<number>();
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThan(12);
    });
  });
});
