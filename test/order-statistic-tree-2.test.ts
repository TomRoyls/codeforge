import { describe, it, expect } from 'vitest';
import { OrderStatisticTree2 } from '../src/core/order-statistic-tree-2/index.js';

describe('OrderStatisticTree2', () => {
  describe('insert', () => {
    it('should insert single element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.has(5)).toBe(true);
    });

    it('should insert multiple elements in order', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert multiple elements in reverse order', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(3);
      tree.insert(2);
      tree.insert(1);
      expect(tree.size).toBe(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should insert multiple elements in random order', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.size).toBe(5);
      expect(tree.toArray()).toEqual([2, 3, 4, 5, 7]);
    });

    it('should not insert duplicates', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });
  });

  describe('has', () => {
    it('should find existing element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
    });

    it('should return false for non-existent element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.has(3)).toBe(false);
    });

    it('should return false for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.has(5)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete leaf node', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(2);
      tree.insert(1);
      tree.insert(3);
      expect(tree.delete(1)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.has(1)).toBe(false);
      expect(tree.toArray()).toEqual([2, 3]);
    });

    it('should delete node with one child', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(2);
      tree.insert(1);
      tree.insert(3);
      tree.insert(4);
      expect(tree.delete(3)).toBe(true);
      expect(tree.size).toBe(3);
      expect(tree.has(3)).toBe(false);
      expect(tree.toArray()).toEqual([1, 2, 4]);
    });

    it('should delete node with two children', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(2);
      tree.insert(1);
      tree.insert(3);
      expect(tree.delete(2)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.has(2)).toBe(false);
      expect(tree.toArray()).toEqual([1, 3]);
    });

    it('should return false when deleting non-existent element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.delete(3)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should return false when deleting from empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.delete(5)).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.size).toBe(0);
    });

    it('should return correct size after insertions', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
    });

    it('should return correct size after deletions', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.delete(2);
      expect(tree.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false for non-empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all elements', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.has(1)).toBe(false);
      expect(tree.has(2)).toBe(false);
      expect(tree.has(3)).toBe(false);
    });

    it('should handle clearing empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('rank', () => {
    it('should return 1-based rank of element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.rank(2)).toBe(1);
      expect(tree.rank(3)).toBe(2);
      expect(tree.rank(4)).toBe(3);
      expect(tree.rank(5)).toBe(4);
      expect(tree.rank(7)).toBe(5);
    });

    it('should return 0 for non-existent element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      expect(tree.rank(10)).toBe(0);
    });

    it('should return 0 for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.rank(5)).toBe(0);
    });

    it('should work with single element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.rank(5)).toBe(1);
    });

    it('should work after deletions', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(4);
      tree.delete(2);
      expect(tree.rank(1)).toBe(1);
      expect(tree.rank(3)).toBe(2);
      expect(tree.rank(4)).toBe(3);
    });
  });

  describe('select', () => {
    it('should return k-th smallest element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.select(1)).toBe(2);
      expect(tree.select(2)).toBe(3);
      expect(tree.select(3)).toBe(4);
      expect(tree.select(4)).toBe(5);
      expect(tree.select(5)).toBe(7);
    });

    it('should return undefined for k < 1', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      expect(tree.select(0)).toBe(undefined);
      expect(tree.select(-1)).toBe(undefined);
    });

    it('should return undefined for k > size', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      expect(tree.select(3)).toBe(undefined);
      expect(tree.select(10)).toBe(undefined);
    });

    it('should return undefined for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.select(1)).toBe(undefined);
    });

    it('should work with single element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.select(1)).toBe(5);
    });

    it('should work after deletions', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(4);
      tree.delete(2);
      expect(tree.select(1)).toBe(1);
      expect(tree.select(2)).toBe(3);
      expect(tree.select(3)).toBe(4);
    });
  });

  describe('min', () => {
    it('should return minimum element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.min()).toBe(2);
    });

    it('should return undefined for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.min()).toBe(undefined);
    });

    it('should work with single element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
    });
  });

  describe('max', () => {
    it('should return maximum element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.max()).toBe(7);
    });

    it('should return undefined for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.max()).toBe(undefined);
    });

    it('should work with single element', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      expect(tree.max()).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return sorted array', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.toArray()).toEqual([2, 3, 4, 5, 7]);
    });

    it('should return sorted array after deletions', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(4);
      tree.delete(2);
      tree.delete(4);
      expect(tree.toArray()).toEqual([1, 3]);
    });
  });

  describe('forEach', () => {
    it('should traverse in-order', async () => {
      const tree = new OrderStatisticTree2<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      const result: number[] = [];
      tree.forEach((value) => result.push(value));
      expect(result).toEqual([2, 3, 4, 5, 7]);
    });

    it('should handle empty tree', async () => {
      const tree = new OrderStatisticTree2<number>();
      const result: number[] = [];
      tree.forEach((value) => result.push(value));
      expect(result).toEqual([]);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for strings', async () => {
      const tree = new OrderStatisticTree2<string>((a, b) => a.localeCompare(b));
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should work with reverse comparator', async () => {
      const tree = new OrderStatisticTree2<number>((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      });
      tree.insert(2);
      tree.insert(1);
      tree.insert(3);
      expect(tree.toArray()).toEqual([3, 2, 1]);
      expect(tree.select(1)).toBe(3);
      expect(tree.select(3)).toBe(1);
    });

    it('should work with objects', async () => {
      interface Item {
        key: number;
        value: string;
      }
      const tree = new OrderStatisticTree2<Item>((a, b) => a.key - b.key);
      tree.insert({ key: 2, value: 'b' });
      tree.insert({ key: 1, value: 'a' });
      tree.insert({ key: 3, value: 'c' });
      expect(tree.toArray()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ]);
      expect(tree.select(2)!.value).toBe('b');
    });
  });

  describe('edge cases', () => {
    it('should handle alternating insert and delete', async () => {
      const tree = new OrderStatisticTree2<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 100; i += 2) {
        tree.delete(i);
      }
      expect(tree.size).toBe(50);
      expect(tree.toArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => 2 * i + 1)
      );
    });

    it('should handle large dataset', async () => {
      const tree = new OrderStatisticTree2<number>();
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      values.forEach((v) => tree.insert(v));
      const sorted = [...new Set(values)].sort((a, b) => a - b);
      expect(tree.size).toBe(sorted.length);
      expect(tree.toArray()).toEqual(sorted);
      sorted.forEach((v, i) => {
        expect(tree.rank(v)).toBe(i + 1);
      });
      sorted.forEach((v, i) => {
        expect(tree.select(i + 1)).toBe(v);
      });
    });

    it('should handle rank and select consistency', async () => {
      const tree = new OrderStatisticTree2<number>();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach((v) => tree.insert(v));
      const sorted = values.sort((a, b) => a - b);
      sorted.forEach((v, i) => {
        expect(tree.rank(v)).toBe(i + 1);
        expect(tree.select(i + 1)).toBe(v);
      });
    });
  });
});
