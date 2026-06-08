import { describe, it, expect } from 'vitest';
import { TopK } from './src/core/top-k/index.js';

describe('TopK', () => {
  describe('constructor', () => {
    it('should create TopK with k=3', () => {
      const topK = new TopK<string>(3);
      expect(topK.size).toBe(0);
      expect(topK.isEmpty).toBe(true);
    });

    it('should create TopK with k=1', () => {
      const topK = new TopK<number>(1);
      expect(topK.size).toBe(0);
    });

    it('should create TopK with k=10', () => {
      const topK = new TopK<number>(10);
      expect(topK.size).toBe(0);
    });

    it('should throw error for k=0', () => {
      expect(() => new TopK<string>(0)).toThrow('k must be positive');
    });

    it('should throw error for negative k', () => {
      expect(() => new TopK<number>(-1)).toThrow('k must be positive');
    });
  });

  describe('add', () => {
    it('should add single item', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.size).toBe(1);
      expect(topK.isEmpty).toBe(false);
    });

    it('should add multiple distinct items', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.size).toBe(3);
    });

    it('should increment count for duplicate items', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('a');
      topK.add('a');
      expect(topK.count('a')).toBe(3);
    });

    it('should handle items beyond k', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.size).toBe(2);
    });

    it('should track counts for all items', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.count('a')).toBe(2);
      expect(topK.count('b')).toBe(1);
      expect(topK.count('c')).toBe(1);
    });

    it('should add numbers', () => {
      const topK = new TopK<number>(3);
      topK.add(1);
      topK.add(2);
      expect(topK.size).toBe(2);
    });

    it('should add objects', () => {
      const topK = new TopK<{ id: number }>(2);
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      topK.add(obj1);
      topK.add(obj2);
      expect(topK.size).toBe(2);
    });

    it('should replace lower count with higher count', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      topK.add('c');
      expect(topK.size).toBe(2);
    });
  });

  describe('getTopK', () => {
    it('should return empty array for empty TopK', () => {
      const topK = new TopK<string>(3);
      expect(topK.getTopK()).toEqual([]);
    });

    it('should return single item', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      const result = topK.getTopK();
      expect(result).toEqual([['a', 1]]);
    });

    it('should return items sorted by count desc', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('a');
      topK.add('b');
      const result = topK.getTopK();
      expect(result[0][0]).toBe('a');
      expect(result[0][1]).toBe(2);
      expect(result[1][0]).toBe('b');
      expect(result[1][1]).toBe(1);
    });

    it('should return at most k items', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      const result = topK.getTopK();
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should track top items correctly', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('a');
      topK.add('a');
      topK.add('b');
      topK.add('b');
      topK.add('c');
      const result = topK.getTopK();
      expect(result.length).toBe(2);
      expect(result[0]).toEqual(['a', 3]);
      expect(result[1]).toEqual(['b', 2]);
    });

    it('should handle ties', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      const result = topK.getTopK();
      expect(result.length).toBe(3);
    });

    it('should return [item, count] pairs', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('a');
      const result = topK.getTopK();
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return false for empty TopK', () => {
      const topK = new TopK<string>(3);
      expect(topK.contains('a')).toBe(false);
    });

    it('should return true for existing item', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.contains('a')).toBe(true);
    });

    it('should return false for non-existing item', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.contains('b')).toBe(false);
    });

    it('should work with numbers', () => {
      const topK = new TopK<number>(3);
      topK.add(1);
      expect(topK.contains(1)).toBe(true);
      expect(topK.contains(2)).toBe(false);
    });

    it('should check heap items only', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.contains('c')).toBe(true);
    });
  });

  describe('count', () => {
    it('should return 0 for non-existing item', () => {
      const topK = new TopK<string>(3);
      expect(topK.count('a')).toBe(0);
    });

    it('should return correct count for added item', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.count('a')).toBe(1);
    });

    it('should return correct count after multiple adds', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('a');
      topK.add('a');
      expect(topK.count('a')).toBe(3);
    });

    it('should track counts for all items even beyond k', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      topK.add('c');
      expect(topK.count('a')).toBe(1);
      expect(topK.count('b')).toBe(1);
      expect(topK.count('c')).toBe(2);
    });

    it('should work with numbers', () => {
      const topK = new TopK<number>(3);
      topK.add(1);
      topK.add(1);
      expect(topK.count(1)).toBe(2);
    });
  });

  describe('size', () => {
    it('should return 0 for empty TopK', () => {
      const topK = new TopK<string>(3);
      expect(topK.size).toBe(0);
    });

    it('should return 1 after one add', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.size).toBe(1);
    });

    it('should return k after k adds', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.size).toBe(3);
    });

    it('should not exceed k', () => {
      const topK = new TopK<string>(2);
      topK.add('a');
      topK.add('b');
      topK.add('c');
      expect(topK.size).toBe(2);
    });

    it('should be a getter', () => {
      const topK = new TopK<string>(3);
      expect(typeof topK.size).toBe('number');
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty TopK', () => {
      const topK = new TopK<string>(3);
      expect(topK.isEmpty).toBe(true);
    });

    it('should return false after add', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      expect(topK.isEmpty).toBe(false);
    });

    it('should be a getter', () => {
      const topK = new TopK<string>(3);
      expect(typeof topK.isEmpty).toBe('boolean');
    });
  });

  describe('clear', () => {
    it('should clear empty TopK', () => {
      const topK = new TopK<string>(3);
      topK.clear();
      expect(topK.size).toBe(0);
      expect(topK.isEmpty).toBe(true);
    });

    it('should clear items', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('b');
      topK.clear();
      expect(topK.size).toBe(0);
      expect(topK.isEmpty).toBe(true);
    });

    it('should clear counts', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('a');
      topK.clear();
      expect(topK.count('a')).toBe(0);
    });

    it('should allow adding after clear', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.clear();
      topK.add('b');
      expect(topK.size).toBe(1);
      expect(topK.count('b')).toBe(1);
    });

    it('should getTopK empty after clear', () => {
      const topK = new TopK<string>(3);
      topK.add('a');
      topK.add('b');
      topK.clear();
      expect(topK.getTopK()).toEqual([]);
    });
  });

  describe('merge', () => {
    it('should merge empty TopK', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK1.merge(topK2);
      expect(topK1.size).toBe(0);
    });

    it('should merge single item', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK2.add('a');
      topK1.merge(topK2);
      expect(topK1.count('a')).toBe(1);
      expect(topK1.size).toBe(1);
    });

    it('should merge multiple items', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK2.add('a');
      topK2.add('b');
      topK1.merge(topK2);
      expect(topK1.count('a')).toBe(1);
      expect(topK1.count('b')).toBe(1);
    });

    it('should merge overlapping items', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK1.add('a');
      topK1.add('a');
      topK2.add('a');
      topK1.merge(topK2);
      expect(topK1.count('a')).toBe(3);
    });

    it('should merge different types', () => {
      const topK1 = new TopK<number>(3);
      const topK2 = new TopK<number>(3);
      topK1.add(1);
      topK2.add(2);
      topK1.merge(topK2);
      expect(topK1.count(1)).toBe(1);
      expect(topK1.count(2)).toBe(1);
    });

    it('should respect k limit', () => {
      const topK1 = new TopK<string>(2);
      const topK2 = new TopK<string>(3);
      topK2.add('a');
      topK2.add('b');
      topK2.add('c');
      topK1.merge(topK2);
      expect(topK1.size).toBe(2);
    });

    it('should keep original items', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK1.add('a');
      topK2.add('b');
      topK1.merge(topK2);
      expect(topK1.count('a')).toBe(1);
      expect(topK1.count('b')).toBe(1);
    });

    it('should not modify source TopK', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK2.add('a');
      const originalCount = topK2.count('a');
      topK1.merge(topK2);
      expect(topK2.count('a')).toBe(originalCount);
    });

    it('should handle multiple merges', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      const topK3 = new TopK<string>(3);
      topK2.add('a');
      topK3.add('b');
      topK1.merge(topK2);
      topK1.merge(topK3);
      expect(topK1.count('a')).toBe(1);
      expect(topK1.count('b')).toBe(1);
    });

    it('should merge after clear', () => {
      const topK1 = new TopK<string>(3);
      const topK2 = new TopK<string>(3);
      topK1.add('a');
      topK1.clear();
      topK2.add('b');
      topK1.merge(topK2);
      expect(topK1.count('b')).toBe(1);
    });
  });
});
