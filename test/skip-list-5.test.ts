import { describe, it, expect } from 'vitest';
import { SkipList } from '../src/core/skip-list-5/index.js';

describe('SkipList5', () => {
  describe('insert and search', () => {
    it('should insert a single value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      expect(list.size()).toBe(1);
      expect(list.contains(5)).toBe(true);
    });

    it('should insert multiple values', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.size()).toBe(4);
      expect(list.contains(1)).toBe(true);
      expect(list.contains(3)).toBe(true);
      expect(list.contains(5)).toBe(true);
      expect(list.contains(7)).toBe(true);
    });

    it('should maintain ordering after multiple inserts', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should use custom comparator', () => {
      const list = new SkipList<{ id: number }>((a, b) => a.id - b.id);
      list.insert({ id: 5 });
      list.insert({ id: 3 });
      list.insert({ id: 7 });
      expect(list.contains({ id: 3 })).toBe(true);
      expect(list.contains({ id: 5 })).toBe(true);
      expect(list.contains({ id: 7 })).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete an existing value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.delete(5)).toBe(true);
      expect(list.size()).toBe(2);
      expect(list.contains(5)).toBe(false);
    });

    it('should return false when deleting non-existent value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      expect(list.delete(7)).toBe(false);
      expect(list.size()).toBe(2);
    });

    it('should handle deleting from empty list', () => {
      const list = new SkipList<number>();
      expect(list.delete(5)).toBe(false);
      expect(list.size()).toBe(0);
    });

    it('should delete all elements one by one', () => {
      const list = new SkipList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.delete(1)).toBe(true);
      expect(list.delete(2)).toBe(true);
      expect(list.delete(3)).toBe(true);
      expect(list.size()).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('should delete middle element correctly', () => {
      const list = new SkipList<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.insert(9);
      expect(list.delete(5)).toBe(true);
      expect(list.toArray()).toEqual([1, 3, 7, 9]);
    });
  });

  describe('search', () => {
    it('should find existing value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(5)).toBe(true);
      expect(list.search(3)).toBe(true);
      expect(list.search(7)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(10)).toBe(false);
      expect(list.search(0)).toBe(false);
    });

    it('should return false in empty list', () => {
      const list = new SkipList<number>();
      expect(list.search(5)).toBe(false);
    });
  });

  describe('min', () => {
    it('should return minimum value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.min()).toBe(1);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList<number>();
      expect(list.min()).toBe(undefined);
    });

    it('should update after deletion of min', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(1);
      expect(list.min()).toBe(3);
    });
  });

  describe('max', () => {
    it('should return maximum value', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.max()).toBe(7);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList<number>();
      expect(list.max()).toBe(undefined);
    });

    it('should update after deletion of max', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(7);
      expect(list.max()).toBe(5);
    });
  });

  describe('size and isEmpty', () => {
    it('should return 0 for empty list', () => {
      const list = new SkipList<number>();
      expect(list.size()).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('should track size correctly', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.size()).toBe(3);
      expect(list.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should empty the list', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.clear();
      expect(list.size()).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.clear();
      list.insert(10);
      list.insert(20);
      expect(list.size()).toBe(2);
      expect(list.contains(10)).toBe(true);
      expect(list.contains(20)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should return correct array after deletes', () => {
      const list = new SkipList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(5);
      list.delete(1);
      expect(list.toArray()).toEqual([3, 7]);
    });
  });

  describe('ordering invariant', () => {
    it('should maintain sorted order with random inserts', () => {
      const list = new SkipList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(Math.floor(Math.random() * 1000));
      }
      const arr = list.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
      }
    });
  });

  describe('large insert', () => {
    it('should handle large number of inserts', () => {
      const list = new SkipList<number>();
      const size = 10000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      expect(list.size()).toBe(size);
      expect(list.min()).toBe(0);
      expect(list.max()).toBe(size - 1);
    });

    it('should find all elements after large insert', () => {
      const list = new SkipList<number>();
      const size = 5000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      for (let i = 0; i < size; i++) {
        expect(list.contains(i)).toBe(true);
      }
    });
  });

  describe('single element', () => {
    it('should handle single element operations', () => {
      const list = new SkipList<number>();
      list.insert(5);
      expect(list.size()).toBe(1);
      expect(list.min()).toBe(5);
      expect(list.max()).toBe(5);
      expect(list.contains(5)).toBe(true);
      list.delete(5);
      expect(list.size()).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const list = new SkipList<number>();
      expect(list.getTimeComplexity()).toContain('O(log n)');
    });
  });

  describe('additional coverage', () => {
    it('should handle delete on missing element', () => {
      const list = new SkipList<number>();
      list.insert(1);
      expect(list.delete(99)).toBe(false);
    });

    it('should handle toArray', () => {
      const list = new SkipList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle min and max', () => {
      const list = new SkipList<number>();
      list.insert(10);
      list.insert(5);
      list.insert(20);
      expect(list.min()).toBe(5);
      expect(list.max()).toBe(20);
    });

    it('should handle clear', () => {
      const list = new SkipList<number>();
      list.insert(1);
      list.insert(2);
      list.clear();
      expect(list.size()).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });
  });
});
