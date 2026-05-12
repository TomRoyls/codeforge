import { describe, it, expect } from 'vitest';
import { SkipList4 } from '../src/core/skip-list-4/index.js';

describe('SkipList4', () => {
  describe('insert', () => {
    it('should insert a single value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.contains(5)).toBe(true);
    });

    it('should insert multiple values', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.size).toBe(4);
      expect(list.contains(1)).toBe(true);
      expect(list.contains(3)).toBe(true);
      expect(list.contains(5)).toBe(true);
      expect(list.contains(7)).toBe(true);
    });

    it('should maintain ordering after multiple inserts', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      list.insert(2);
      const arr = list.toArray();
      expect(arr).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should handle string values', () => {
      const list = new SkipList4<string>();
      list.insert('banana');
      list.insert('apple');
      list.insert('cherry');
      expect(list.size).toBe(3);
      expect(list.contains('apple')).toBe(true);
      expect(list.contains('banana')).toBe(true);
      expect(list.contains('cherry')).toBe(true);
    });

    it('should use custom comparator', () => {
      const list = new SkipList4<{ id: number }>((a, b) => a.id - b.id);
      list.insert({ id: 5 });
      list.insert({ id: 3 });
      list.insert({ id: 7 });
      expect(list.contains({ id: 3 })).toBe(true);
      expect(list.contains({ id: 5 })).toBe(true);
      expect(list.contains({ id: 7 })).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove an existing value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.remove(5)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.contains(5)).toBe(false);
    });

    it('should return false when removing non-existent value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      expect(list.remove(7)).toBe(false);
      expect(list.size).toBe(2);
    });

    it('should handle removing from empty list', () => {
      const list = new SkipList4<number>();
      expect(list.remove(5)).toBe(false);
      expect(list.size).toBe(0);
    });

    it('should remove all elements one by one', () => {
      const list = new SkipList4<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.remove(1)).toBe(true);
      expect(list.remove(2)).toBe(true);
      expect(list.remove(3)).toBe(true);
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('should remove middle element correctly', () => {
      const list = new SkipList4<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.insert(9);
      expect(list.remove(5)).toBe(true);
      expect(list.toArray()).toEqual([1, 3, 7, 9]);
    });
  });

  describe('search', () => {
    it('should find existing value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(5)).toBe(true);
      expect(list.search(3)).toBe(true);
      expect(list.search(7)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(10)).toBe(false);
      expect(list.search(0)).toBe(false);
    });

    it('should return false in empty list', () => {
      const list = new SkipList4<number>();
      expect(list.search(5)).toBe(false);
    });
  });

  describe('contains', () => {
    it('should be equivalent to search', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.contains(5)).toBe(list.search(5));
      expect(list.contains(10)).toBe(list.search(10));
    });
  });

  describe('min', () => {
    it('should return minimum value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.min()).toBe(1);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.min()).toBe(undefined);
    });

    it('should update after removal of min', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.remove(1);
      expect(list.min()).toBe(3);
    });
  });

  describe('max', () => {
    it('should return maximum value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.max()).toBe(7);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.max()).toBe(undefined);
    });

    it('should update after removal of max', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.remove(7);
      expect(list.max()).toBe(5);
    });
  });

  describe('size', () => {
    it('should return 0 for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.size).toBe(0);
    });

    it('should increment on insert', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      list.insert(3);
      expect(list.size).toBe(2);
      list.insert(7);
      expect(list.size).toBe(3);
    });

    it('should decrement on remove', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.remove(5);
      expect(list.size).toBe(2);
      list.remove(3);
      expect(list.size).toBe(1);
    });

    it('should not change on duplicate insert', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(5);
      list.insert(5);
      expect(list.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      expect(list.isEmpty()).toBe(false);
    });

    it('should return true after removing all elements', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.remove(5);
      list.remove(3);
      list.remove(7);
      expect(list.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should empty the list', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('should reset min and max', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.clear();
      expect(list.min()).toBe(undefined);
      expect(list.max()).toBe(undefined);
    });

    it('should allow reuse after clear', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.clear();
      list.insert(10);
      list.insert(20);
      expect(list.size).toBe(2);
      expect(list.contains(10)).toBe(true);
      expect(list.contains(20)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should return correct array after removes', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.remove(5);
      list.remove(1);
      expect(list.toArray()).toEqual([3, 7]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      const result: number[] = [];
      list.forEach((value) => result.push(value));
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should pass correct index', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      const indices: number[] = [];
      list.forEach((value, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not iterate over empty list', () => {
      const list = new SkipList4<number>();
      let count = 0;
      list.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('predecessor', () => {
    it('should return predecessor of value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.predecessor(5)).toBe(3);
      expect(list.predecessor(3)).toBe(1);
      expect(list.predecessor(1)).toBe(undefined);
    });

    it('should return undefined for value less than min', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.predecessor(1)).toBe(undefined);
    });

    it('should return max for value greater than max', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.predecessor(10)).toBe(7);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.predecessor(5)).toBe(undefined);
    });
  });

  describe('successor', () => {
    it('should return successor of value', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.successor(5)).toBe(7);
      expect(list.successor(3)).toBe(5);
      expect(list.successor(7)).toBe(undefined);
    });

    it('should return undefined for value greater than max', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.successor(10)).toBe(undefined);
    });

    it('should return min for value less than min', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.successor(1)).toBe(3);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.successor(5)).toBe(undefined);
    });
  });

  describe('rangeSearch', () => {
    it('should return values in range', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      list.insert(2);
      expect(list.rangeSearch(3, 7)).toEqual([3, 5, 7]);
    });

    it('should return empty array for no values in range', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.rangeSearch(10, 20)).toEqual([]);
    });

    it('should handle range at start', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.rangeSearch(1, 3)).toEqual([1, 3]);
    });

    it('should handle range at end', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.rangeSearch(5, 7)).toEqual([5, 7]);
    });

    it('should return all values when range covers all', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.rangeSearch(0, 10)).toEqual([1, 3, 5, 7]);
    });

    it('should return empty array for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.rangeSearch(3, 7)).toEqual([]);
    });
  });

  describe('height', () => {
    it('should return 0 for empty list', () => {
      const list = new SkipList4<number>();
      expect(list.height()).toBe(0);
    });

    it('should increase with more elements', () => {
      const list = new SkipList4<number>();
      const initialHeight = list.height();
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.height()).toBeGreaterThan(initialHeight);
    });

    it('should decrease when elements are removed', () => {
      const list = new SkipList4<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i);
      }
      const heightBeforeClear = list.height();
      list.clear();
      expect(list.height()).toBe(0);
    });
  });

  describe('ordering invariant', () => {
    it('should maintain sorted order', () => {
      const list = new SkipList4<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(Math.floor(Math.random() * 1000));
      }
      const arr = list.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
      }
    });

    it('should maintain order after insert and remove', () => {
      const list = new SkipList4<number>();
      const values = [50, 25, 75, 12, 37, 62, 87];
      values.forEach(v => list.insert(v));
      list.remove(25);
      list.remove(75);
      const arr = list.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
      }
    });
  });

  describe('large insert', () => {
    it('should handle large number of inserts', () => {
      const list = new SkipList4<number>();
      const size = 10000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      expect(list.size).toBe(size);
      expect(list.min()).toBe(0);
      expect(list.max()).toBe(size - 1);
    });

    it('should find all elements after large insert', () => {
      const list = new SkipList4<number>();
      const size = 5000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      for (let i = 0; i < size; i++) {
        expect(list.contains(i)).toBe(true);
      }
    });
  });

  describe('random insert/delete', () => {
    it('should handle random operations', () => {
      const list = new SkipList4<number>();
      const values = new Set<number>();
      const size = 1000;
      for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 10000);
        list.insert(value);
        values.add(value);
      }
      expect(list.size).toBe(values.size);
      values.forEach(v => {
        expect(list.contains(v)).toBe(true);
      });
    });

    it('should handle random deletes', () => {
      const list = new SkipList4<number>();
      const values = new Set<number>();
      for (let i = 0; i < 500; i++) {
        const value = Math.floor(Math.random() * 10000);
        list.insert(value);
        values.add(value);
      }
      const valuesArray = Array.from(values);
      const toDelete = valuesArray.slice(0, Math.min(250, valuesArray.length));
      toDelete.forEach(v => list.remove(v));
      expect(list.size).toBe(valuesArray.length - toDelete.length);
      toDelete.forEach(v => {
        expect(list.contains(v)).toBe(false);
      });
    });
  });

  describe('single element', () => {
    it('should handle single element operations', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.min()).toBe(5);
      expect(list.max()).toBe(5);
      expect(list.contains(5)).toBe(true);
      list.remove(5);
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });
  });

  describe('duplicates', () => {
    it('should not insert duplicate values', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(5);
      list.insert(5);
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.toArray()).toEqual([5]);
    });

    it('should handle duplicate removal', () => {
      const list = new SkipList4<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.remove(5);
      list.remove(5);
      list.remove(5);
      expect(list.size).toBe(2);
      expect(list.toArray()).toEqual([3, 7]);
    });
  });

  describe('custom maxHeight', () => {
    it('should respect custom maxHeight', () => {
      const list = new SkipList4<number>(undefined, 5);
      expect(list.height()).toBe(0);
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.height()).toBeLessThanOrEqual(5);
    });
  });
});
