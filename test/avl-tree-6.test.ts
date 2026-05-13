import { describe, it, expect } from 'vitest';
import { AVLTree6 } from '../src/core/avl-tree-6/index.js';

describe('AVLTree6', () => {
  describe('empty tree', () => {
    it('should create empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.height()).toBe(0);
      expect(tree.min()).toBe(undefined);
      expect(tree.max()).toBe(undefined);
      expect(tree.search(1)).toBe(false);
      expect(tree.contains(1)).toBe(false);
      expect(tree.toArray()).toEqual([]);
    });

    it('should clear tree', () => {
      const tree = new AVLTree6<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.height()).toBe(0);
    });

    it('should return undefined for rank in empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.rank(5)).toBe(0);
    });

    it('should return undefined for select in empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.select(1)).toBe(undefined);
    });

    it('should split empty tree', () => {
      const tree = new AVLTree6<number>();
      const { left, right } = tree.split(5);
      expect(left.size).toBe(0);
      expect(right.size).toBe(0);
    });

    it('should merge empty trees', () => {
      const tree1 = new AVLTree6<number>();
      const tree2 = new AVLTree6<number>();
      const merged = tree1.merge(tree2);
      expect(merged.size).toBe(0);
      expect(merged.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.search(5)).toBe(true);
      expect(tree.height()).toBe(1);
    });

    it('should insert multiple elements', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      expect(tree.size).toBe(6);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
      expect(tree.search(2)).toBe(true);
      expect(tree.search(4)).toBe(true);
      expect(tree.search(6)).toBe(true);
    });

    it('should handle duplicates', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should handle large dataset', () => {
      const tree = new AVLTree6<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.height()).toBeLessThan(20);
    });
  });

  describe('delete', () => {
    it('should delete single element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      expect(tree.delete(5)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.search(5)).toBe(false);
    });

    it('should delete non-existent element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      expect(tree.delete(10)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should delete leaf node', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.delete(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(3)).toBe(false);
    });

    it('should delete node with one child', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(6);
      expect(tree.delete(7)).toBe(true);
      expect(tree.size).toBe(3);
      expect(tree.search(7)).toBe(false);
      expect(tree.search(6)).toBe(true);
    });

    it('should delete node with two children', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      tree.insert(8);
      expect(tree.delete(5)).toBe(true);
      expect(tree.size).toBe(6);
      expect(tree.search(5)).toBe(false);
      expect(tree.toArray()).toEqual([2, 3, 4, 6, 7, 8]);
    });

    it('should delete all elements', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(3);
      tree.delete(5);
      tree.delete(7);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });
  });

  describe('search and contains', () => {
    it('should find existing element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('should not find non-existent element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(10)).toBe(false);
      expect(tree.contains(0)).toBe(false);
    });

    it('should search in empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.search(5)).toBe(false);
      expect(tree.contains(5)).toBe(false);
    });
  });

  describe('min and max', () => {
    it('should return min value', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.min()).toBe(2);
    });

    it('should return max value', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.max()).toBe(7);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.min()).toBe(undefined);
      expect(tree.max()).toBe(undefined);
    });

    it('should handle single element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return in-order array', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([3, 5, 7]);
    });

    it('should return empty array for empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('balance', () => {
    it('should maintain balance on left-left rotation', () => {
      const tree = new AVLTree6<number>();
      tree.insert(30);
      tree.insert(20);
      tree.insert(10);
      expect(tree.height()).toBe(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on right-right rotation', () => {
      const tree = new AVLTree6<number>();
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      expect(tree.height()).toBe(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on left-right rotation', () => {
      const tree = new AVLTree6<number>();
      tree.insert(30);
      tree.insert(10);
      tree.insert(20);
      expect(tree.height()).toBe(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on right-left rotation', () => {
      const tree = new AVLTree6<number>();
      tree.insert(10);
      tree.insert(30);
      tree.insert(20);
      expect(tree.height()).toBe(2);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should stay balanced after multiple operations', () => {
      const tree = new AVLTree6<number>();
      const values = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
      for (const v of values) {
        tree.insert(v);
      }
      expect(tree.height()).toBeLessThan(5);
      expect(tree.toArray()).toEqual([...values].sort((a, b) => a - b));
    });

    it('should stay balanced after deletes', () => {
      const tree = new AVLTree6<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      tree.delete(10);
      tree.delete(5);
      tree.delete(15);
      expect(tree.height()).toBeLessThan(6);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return correct time complexity string', () => {
      const tree = new AVLTree6<number>();
      expect(tree.getTimeComplexity()).toBe('O(log n) for insert, delete, search, min, max, rank, select, split, merge; O(n) for traversals');
    });
  });

  describe('rank', () => {
    it('should return rank of existing element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.rank(1)).toBe(1);
      expect(tree.rank(3)).toBe(2);
      expect(tree.rank(5)).toBe(3);
      expect(tree.rank(7)).toBe(4);
      expect(tree.rank(9)).toBe(5);
    });

    it('should return 0 for non-existent element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.rank(10)).toBe(0);
    });

    it('should handle rank in empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.rank(5)).toBe(0);
    });

    it('should handle rank of min and max', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.rank(3)).toBe(1);
      expect(tree.rank(7)).toBe(3);
    });
  });

  describe('select', () => {
    it('should return kth smallest element', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.select(1)).toBe(1);
      expect(tree.select(2)).toBe(3);
      expect(tree.select(3)).toBe(5);
      expect(tree.select(4)).toBe(7);
      expect(tree.select(5)).toBe(9);
    });

    it('should return undefined for invalid k', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.select(0)).toBe(undefined);
      expect(tree.select(10)).toBe(undefined);
    });

    it('should handle select in empty tree', () => {
      const tree = new AVLTree6<number>();
      expect(tree.select(1)).toBe(undefined);
    });

    it('should handle select of first and last', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.select(1)).toBe(3);
      expect(tree.select(3)).toBe(7);
    });

    it('should maintain rank-select relationship', () => {
      const tree = new AVLTree6<number>();
      const values = [10, 20, 30, 40, 50];
      for (const v of values) {
        tree.insert(v);
      }
      for (let i = 1; i <= values.length; i++) {
        const selected = tree.select(i);
        expect(selected).toBeDefined();
        expect(tree.rank(selected!)).toBe(i);
      }
    });
  });

  describe('split', () => {
    it('should split tree at key', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const { left, right } = tree.split(5);
      expect(left.toArray()).toEqual([1, 3]);
      expect(right.toArray()).toEqual([5, 7, 9]);
    });

    it('should split empty tree', () => {
      const tree = new AVLTree6<number>();
      const { left, right } = tree.split(5);
      expect(left.isEmpty()).toBe(true);
      expect(right.isEmpty()).toBe(true);
    });

    it('should split all to left', () => {
      const tree = new AVLTree6<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const { left, right } = tree.split(10);
      expect(left.toArray()).toEqual([1, 2, 3]);
      expect(right.toArray()).toEqual([]);
    });

    it('should split all to right', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      tree.insert(6);
      tree.insert(7);
      const { left, right } = tree.split(1);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([5, 6, 7]);
    });

    it('should split single element tree', () => {
      const tree = new AVLTree6<number>();
      tree.insert(5);
      const { left, right } = tree.split(5);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([5]);
    });

    it('should preserve balanced trees after split', () => {
      const tree = new AVLTree6<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      const { left, right } = tree.split(10);
      expect(left.height()).toBeLessThan(5);
      expect(right.height()).toBeLessThan(5);
      expect(left.size + right.size).toBe(20);
    });
  });

  describe('merge', () => {
    it('should merge two trees', () => {
      const tree1 = new AVLTree6<number>();
      tree1.insert(1);
      tree1.insert(3);
      tree1.insert(5);
      const tree2 = new AVLTree6<number>();
      tree2.insert(2);
      tree2.insert(4);
      tree2.insert(6);
      const merged = tree1.merge(tree2);
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should merge with empty tree', () => {
      const tree1 = new AVLTree6<number>();
      tree1.insert(1);
      tree1.insert(3);
      tree1.insert(5);
      const tree2 = new AVLTree6<number>();
      const merged = tree1.merge(tree2);
      expect(merged.toArray()).toEqual([1, 3, 5]);
    });

    it('should merge two empty trees', () => {
      const tree1 = new AVLTree6<number>();
      const tree2 = new AVLTree6<number>();
      const merged = tree1.merge(tree2);
      expect(merged.isEmpty()).toBe(true);
    });

    it('should preserve balance after merge', () => {
      const tree1 = new AVLTree6<number>();
      for (let i = 1; i <= 10; i++) {
        tree1.insert(i);
      }
      const tree2 = new AVLTree6<number>();
      for (let i = 11; i <= 20; i++) {
        tree2.insert(i);
      }
      const merged = tree1.merge(tree2);
      expect(merged.size).toBe(20);
      expect(merged.height()).toBeLessThan(6);
      expect(merged.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    });

    it('should not modify original trees', () => {
      const tree1 = new AVLTree6<number>();
      tree1.insert(1);
      tree1.insert(3);
      const tree2 = new AVLTree6<number>();
      tree2.insert(2);
      tree2.insert(4);
      tree1.merge(tree2);
      expect(tree1.toArray()).toEqual([1, 3]);
      expect(tree2.toArray()).toEqual([2, 4]);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const tree = new AVLTree6<string>((a, b) => a.localeCompare(b));
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
      expect(tree.min()).toBe('apple');
      expect(tree.max()).toBe('cherry');
    });

    it('should work with reverse comparator', () => {
      const tree = new AVLTree6<number>((a, b) => b - a);
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(7);
      expect(tree.max()).toBe(3);
    });
  });

  describe('stress tests', () => {
    it('should handle 10000 random operations', () => {
      const tree = new AVLTree6<number>();
      const values: number[] = [];
      for (let i = 0; i < 10000; i++) {
        const value = Math.floor(Math.random() * 10000);
        values.push(value);
        tree.insert(value);
      }
      expect(tree.size).toBe(new Set(values).size);
      expect(tree.height()).toBeLessThan(30);
    });

    it('should handle large sorted insertion', () => {
      const tree = new AVLTree6<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.height()).toBeLessThan(20);
      for (let i = 0; i < 1000; i++) {
        expect(tree.search(i)).toBe(true);
      }
    });
  });
});
