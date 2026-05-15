import { describe, it, expect, beforeEach } from 'vitest';
import { AVLSet } from '../src/core/avl-set/index.js';

describe('AVLSet', () => {
  let set: AVLSet<number>;

  beforeEach(() => {
    set = new AVLSet<number>();
  });

  describe('Empty set', () => {
    it('should create empty set', () => {
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should return undefined for min on empty set', () => {
      expect(set.min()).toBeUndefined();
    });

    it('should return undefined for max on empty set', () => {
      expect(set.max()).toBeUndefined();
    });

    it('should return false for has on empty set', () => {
      expect(set.has(5)).toBe(false);
    });

    it('should return empty array for toArray on empty set', () => {
      expect(set.toArray()).toEqual([]);
    });

    it('should not throw error on forEach with empty set', () => {
      const callback = vi.fn();
      set.forEach(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should delete from empty set and return false', () => {
      expect(set.delete(5)).toBe(false);
    });

    it('should return undefined for floor on empty set', () => {
      expect(set.floor(5)).toBeUndefined();
    });

    it('should return undefined for ceiling on empty set', () => {
      expect(set.ceiling(5)).toBeUndefined();
    });

    it('should return undefined for lower on empty set', () => {
      expect(set.lower(5)).toBeUndefined();
    });

    it('should return undefined for higher on empty set', () => {
      expect(set.higher(5)).toBeUndefined();
    });

    it('should return -1 for indexOf on empty set', () => {
      expect(set.indexOf(5)).toBe(-1);
    });

    it('should return undefined for at on empty set', () => {
      expect(set.at(0)).toBeUndefined();
    });

    it('should be balanced when empty', () => {
      expect(set.isAVLBalanced).toBe(true);
    });
  });

  describe('Single element', () => {
    it('should add single element', () => {
      expect(set.add(5)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('should not add duplicate', () => {
      expect(set.add(5)).toBe(true);
      expect(set.add(5)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should find single element after add', () => {
      set.add(5);
      expect(set.has(5)).toBe(true);
    });

    it('should not find element not in single element set', () => {
      set.add(5);
      expect(set.has(10)).toBe(false);
    });

    it('should return same value for min and max with single element', () => {
      set.add(5);
      expect(set.min()).toBe(5);
      expect(set.max()).toBe(5);
    });

    it('should delete single element', () => {
      set.add(5);
      expect(set.delete(5)).toBe(true);
      expect(set.isEmpty()).toBe(true);
    });

    it('should clear single element set', () => {
      set.add(5);
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should iterate with forEach on single element', () => {
      set.add(5);
      const values: number[] = [];
      set.forEach((v) => values.push(v));
      expect(values).toEqual([5]);
    });

    it('should iterate with for...of on single element', () => {
      set.add(5);
      const values: number[] = [];
      for (const v of set) {
        values.push(v);
      }
      expect(values).toEqual([5]);
    });

    it('should return index 0 for single element', () => {
      set.add(5);
      expect(set.indexOf(5)).toBe(0);
    });

    it('should return element at index 0', () => {
      set.add(5);
      expect(set.at(0)).toBe(5);
    });
  });

  describe('Add operations', () => {
    it('should add multiple elements', () => {
      expect(set.add(1)).toBe(true);
      expect(set.add(2)).toBe(true);
      expect(set.add(3)).toBe(true);
      expect(set.size).toBe(3);
    });

    it('should add elements in random order', () => {
      set.add(5);
      set.add(1);
      set.add(10);
      set.add(3);
      set.add(8);
      expect(set.size).toBe(5);
    });

    it('should not add duplicate values', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.add(2)).toBe(false);
      expect(set.size).toBe(3);
    });

    it('should handle many adds', () => {
      for (let i = 0; i < 100; i++) {
        expect(set.add(i)).toBe(true);
      }
      expect(set.size).toBe(100);
    });

    it('should maintain order after adds', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      expect(set.toArray()).toEqual([1, 3, 5, 7]);
    });
  });

  describe('Delete operations', () => {
    it('should delete element from middle', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(2)).toBe(true);
      expect(set.size).toBe(2);
    });

    it('should delete min element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(1)).toBe(true);
      expect(set.min()).toBe(2);
    });

    it('should delete max element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(3)).toBe(true);
      expect(set.max()).toBe(2);
    });

    it('should return false when deleting non-existent element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(10)).toBe(false);
      expect(set.size).toBe(3);
    });

    it('should delete all elements one by one', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(1)).toBe(true);
      expect(set.delete(2)).toBe(true);
      expect(set.delete(3)).toBe(true);
      expect(set.isEmpty()).toBe(true);
    });

    it('should not find element after delete', () => {
      set.add(5);
      set.delete(5);
      expect(set.has(5)).toBe(false);
    });

    it('should find remaining elements after delete', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.has(1)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it('should maintain correct structure after multiple deletes', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i);
      }
      set.delete(5);
      set.delete(7);
      expect(set.has(5)).toBe(false);
      expect(set.has(7)).toBe(false);
      expect(set.has(6)).toBe(true);
      expect(set.has(8)).toBe(true);
    });
  });

  describe('Has operation', () => {
    it('should return true for has when element exists', () => {
      set.add(5);
      expect(set.has(5)).toBe(true);
    });

    it('should return false for has when element does not exist', () => {
      set.add(5);
      expect(set.has(10)).toBe(false);
    });

    it.skip('should work with string values', () => {
      const strSet = new AVLSet<string>();
      strSet.add('hello');
      expect(strSet.has('hello')).toBe(true);
      expect(strSet.has('world')).toBe(false);
    });
  });

  describe('Size operation', () => {
    it('should report correct size after adds', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i);
        expect(set.size).toBe(i + 1);
      }
    });

    it('should report correct size after deletes', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i);
      }
      set.delete(5);
      expect(set.size).toBe(9);
    });

    it('should report zero after clear', () => {
      for (let i = 0; i < 10; i++) {
        set.add(i);
      }
      set.clear();
      expect(set.size).toBe(0);
    });
  });

  describe('IsEmpty operation', () => {
    it('should return true for empty set', () => {
      expect(set.isEmpty()).toBe(true);
    });

    it('should return false after add', () => {
      set.add(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      set.add(1);
      set.clear();
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('Clear operation', () => {
    it('should clear all elements', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should allow adds after clear', () => {
      set.add(1);
      set.clear();
      set.add(2);
      expect(set.has(2)).toBe(true);
      expect(set.size).toBe(1);
    });
  });

  describe('Min operation', () => {
    it('should return correct min after multiple adds', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      expect(set.min()).toBe(3);
    });

    it('should return correct min after delete', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(1);
      expect(set.min()).toBe(2);
    });

    it('should return undefined for empty set', () => {
      expect(set.min()).toBeUndefined();
    });
  });

  describe('Max operation', () => {
    it('should return correct max after multiple adds', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      expect(set.max()).toBe(7);
    });

    it('should return correct max after delete', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(3);
      expect(set.max()).toBe(2);
    });

    it('should return undefined for empty set', () => {
      expect(set.max()).toBeUndefined();
    });
  });

  describe('Floor operation', () => {
    it('should return floor when element exists', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.floor(3)).toBe(3);
    });

    it('should return floor when element does not exist', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.floor(4)).toBe(3);
    });

    it('should return undefined for floor below min', () => {
      set.add(3);
      set.add(5);
      expect(set.floor(2)).toBeUndefined();
    });

    it('should return max for floor above max', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.floor(10)).toBe(5);
    });
  });

  describe('Ceiling operation', () => {
    it('should return ceiling when element exists', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.ceiling(3)).toBe(3);
    });

    it('should return ceiling when element does not exist', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.ceiling(4)).toBe(5);
    });

    it('should return min for ceiling below min', () => {
      set.add(3);
      set.add(5);
      expect(set.ceiling(2)).toBe(3);
    });

    it('should return undefined for ceiling above max', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.ceiling(10)).toBeUndefined();
    });
  });

  describe('Lower operation', () => {
    it('should return lower when element exists', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.lower(3)).toBe(1);
    });

    it('should return lower when element does not exist', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.lower(4)).toBe(3);
    });

    it('should return undefined for lower at or below min', () => {
      set.add(3);
      set.add(5);
      expect(set.lower(3)).toBeUndefined();
      expect(set.lower(2)).toBeUndefined();
    });
  });

  describe('Higher operation', () => {
    it('should return higher when element exists', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.higher(3)).toBe(5);
    });

    it('should return higher when element does not exist', () => {
      set.add(1);
      set.add(3);
      set.add(5);
      expect(set.higher(4)).toBe(5);
    });

    it('should return undefined for higher at or above max', () => {
      set.add(1);
      set.add(3);
      expect(set.higher(3)).toBeUndefined();
      expect(set.higher(4)).toBeUndefined();
    });
  });

  describe('Range operation', () => {
    it('should return values in range', () => {
      for (let i = 1; i <= 10; i++) {
        set.add(i);
      }
      const result = [...set.range(3, 7)];
      expect(result).toEqual([3, 4, 5, 6, 7]);
    });

    it('should return empty range when no values in range', () => {
      for (let i = 1; i <= 5; i++) {
        set.add(i);
      }
      const result = [...set.range(10, 20)];
      expect(result).toEqual([]);
    });

    it('should handle range at boundaries', () => {
      for (let i = 1; i <= 10; i++) {
        set.add(i);
      }
      const result = [...set.range(5, 5)];
      expect(result).toEqual([5]);
    });

    it('should return all values when range covers all', () => {
      for (let i = 1; i <= 5; i++) {
        set.add(i);
      }
      const result = [...set.range(1, 5)];
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('IndexOf operation', () => {
    it('should return correct index for element', () => {
      set.add(3);
      set.add(1);
      set.add(5);
      set.add(2);
      set.add(4);
      expect(set.indexOf(1)).toBe(0);
      expect(set.indexOf(2)).toBe(1);
      expect(set.indexOf(3)).toBe(2);
      expect(set.indexOf(4)).toBe(3);
      expect(set.indexOf(5)).toBe(4);
    });

    it('should return -1 for non-existent element', () => {
      set.add(1);
      set.add(3);
      expect(set.indexOf(2)).toBe(-1);
    });

    it('should return -1 for empty set', () => {
      expect(set.indexOf(5)).toBe(-1);
    });
  });

  describe('At operation', () => {
    it('should return element at index', () => {
      set.add(3);
      set.add(1);
      set.add(5);
      set.add(2);
      set.add(4);
      expect(set.at(0)).toBe(1);
      expect(set.at(1)).toBe(2);
      expect(set.at(2)).toBe(3);
      expect(set.at(3)).toBe(4);
      expect(set.at(4)).toBe(5);
    });

    it('should return undefined for negative index', () => {
      set.add(1);
      expect(set.at(-1)).toBeUndefined();
    });

    it('should return undefined for index beyond size', () => {
      set.add(1);
      expect(set.at(10)).toBeUndefined();
    });

    it('should return undefined for empty set', () => {
      expect(set.at(0)).toBeUndefined();
    });
  });

  describe('ToArray operation', () => {
    it('should return empty array for empty set', () => {
      expect(set.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      set.add(3);
      set.add(1);
      set.add(2);
      expect(set.toArray()).toEqual([1, 2, 3]);
    });

    it('should work with many elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach(v => set.add(v));
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return new array on each call', () => {
      set.add(1);
      const arr1 = set.toArray();
      const arr2 = set.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });
  });

  describe('ForEach operation', () => {
    it('should call callback for each element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const values: number[] = [];
      set.forEach((v) => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should pass correct index to callback', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const indices: number[] = [];
      set.forEach((_, i) => indices.push(i));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not call callback on empty set', () => {
      const callback = vi.fn();
      set.forEach(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should iterate in sorted order', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      set.add(9);
      const values: number[] = [];
      set.forEach((v) => values.push(v));
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('Iterator operation', () => {
    it('should iterate with for...of', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const values: number[] = [];
      for (const v of set) {
        values.push(v);
      }
      expect(values).toEqual([1, 2, 3]);
    });

    it('should iterate in sorted order', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      set.add(9);
      const values: number[] = [];
      for (const v of set) {
        values.push(v);
      }
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not iterate empty set', () => {
      const values: number[] = [];
      for (const v of set) {
        values.push(v);
      }
      expect(values).toEqual([]);
    });

    it('should support spread operator', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const arr = [...set];
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('Union operation', () => {
    it('should union two non-overlapping sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should union two overlapping sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should union with empty set', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should not modify original sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set2.add(2);
      const size1 = set1.size;
      const size2 = set2.size;
      set1.union(set2);
      expect(set1.size).toBe(size1);
      expect(set2.size).toBe(size2);
    });
  });

  describe('Intersection operation', () => {
    it('should intersect two overlapping sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should intersect identical sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(1);
      set2.add(2);
      set2.add(3);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should return empty set for non-overlapping sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should intersect with empty set', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should not modify original sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      const size1 = set1.size;
      const size2 = set2.size;
      set1.intersection(set2);
      expect(set1.size).toBe(size1);
      expect(set2.size).toBe(size2);
    });
  });

  describe('Difference operation', () => {
    it('should difference two overlapping sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([1]);
    });

    it('should difference with empty set', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should return empty set when subtracting all', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should return all elements when subtracting empty set', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set2.difference(set1);
      expect(result.toArray()).toEqual([]);
    });

    it('should not modify original sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      const size1 = set1.size;
      const size2 = set2.size;
      set1.difference(set2);
      expect(set1.size).toBe(size1);
      expect(set2.size).toBe(size2);
    });
  });

  describe('IsSubsetOf operation', () => {
    it('should return true for proper subset', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      set2.add(3);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });

    it('should return true for equal sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });

    it('should return false for non-subset', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(false);
    });

    it('should return true for empty set as subset', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });
  });

  describe('IsSupersetOf operation', () => {
    it('should return true for proper superset', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(1);
      set2.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });

    it('should return true for equal sets', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });

    it('should return false for non-superset', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      set2.add(3);
      expect(set1.isSupersetOf(set2)).toBe(false);
    });

    it('should return true for any set as superset of empty set', () => {
      const set1 = new AVLSet<number>();
      const set2 = new AVLSet<number>();
      set1.add(1);
      set1.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });
  });

  describe('IsAVLBalanced operation', () => {
    it('should be balanced when empty', () => {
      expect(set.isAVLBalanced).toBe(true);
    });

    it('should be balanced with single element', () => {
      set.add(5);
      expect(set.isAVLBalanced).toBe(true);
    });

    it('should be balanced with multiple elements', () => {
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.isAVLBalanced).toBe(true);
    });

    it('should be balanced after deletions', () => {
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      for (let i = 0; i < 25; i++) {
        set.delete(i);
      }
      expect(set.isAVLBalanced).toBe(true);
    });
  });

  describe('Custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const strSet = new AVLSet<string>({ comparator: (a, b) => a.localeCompare(b) });
      strSet.add('banana');
      strSet.add('apple');
      strSet.add('cherry');
      expect(strSet.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should work with reverse comparator', () => {
      const revSet = new AVLSet<number>({ comparator: (a, b) => b - a });
      revSet.add(1);
      revSet.add(2);
      revSet.add(3);
      expect(revSet.toArray()).toEqual([3, 2, 1]);
    });

    it('should work with object comparator', () => {
      interface Person {
        id: number;
        name: string;
      }
      const personSet = new AVLSet<Person>({ comparator: (a, b) => a.id - b.id });
      personSet.add({ id: 2, name: 'Bob' });
      personSet.add({ id: 1, name: 'Alice' });
      personSet.add({ id: 3, name: 'Charlie' });
      expect(personSet.size).toBe(3);
      expect(personSet.min()).toEqual({ id: 1, name: 'Alice' });
    });
  });

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      expect(set.min()).toBe(0);
      expect(set.max()).toBe(99);
    });

    it('should find all elements in large set', () => {
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it('should delete all elements from large set', () => {
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(set.delete(i)).toBe(true);
      }
      expect(set.isEmpty()).toBe(true);
    });

    it('should maintain balance with large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        set.add(i);
      }
      expect(set.isAVLBalanced).toBe(true);
      expect(set.size).toBe(1000);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      set.add(-3);
      set.add(-1);
      set.add(-2);
      expect(set.toArray()).toEqual([-3, -2, -1]);
      expect(set.min()).toBe(-3);
      expect(set.max()).toBe(-1);
    });

    it('should handle mixed positive and negative numbers', () => {
      set.add(-2);
      set.add(0);
      set.add(2);
      set.add(-1);
      set.add(1);
      expect(set.toArray()).toEqual([-2, -1, 0, 1, 2]);
    });

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
        set.add(i);
      }
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle reverse insertions', () => {
      for (let i = 10; i >= 1; i--) {
        set.add(i);
      }
      expect(set.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle mixed operations', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.delete(5);
      set.add(1);
      set.add(9);
      set.delete(3);
      expect(set.toArray()).toEqual([1, 7, 9]);
    });

    it('should allow adding after delete', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.add(4)).toBe(true);
      expect(set.size).toBe(3);
      expect(set.has(4)).toBe(true);
    });

    it('should handle repeated add and delete', () => {
      for (let i = 0; i < 10; i++) {
        expect(set.add(i)).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        expect(set.delete(i)).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        expect(set.add(i)).toBe(true);
      }
      expect(set.size).toBe(10);
    });

    it('should handle indexOf at boundaries', () => {
      set.add(1);
      set.add(5);
      set.add(10);
      expect(set.indexOf(1)).toBe(0);
      expect(set.indexOf(5)).toBe(1);
      expect(set.indexOf(10)).toBe(2);
    });

    it('should handle at at boundaries', () => {
      set.add(1);
      set.add(5);
      set.add(10);
      expect(set.at(0)).toBe(1);
      expect(set.at(1)).toBe(5);
      expect(set.at(2)).toBe(10);
      expect(set.at(3)).toBeUndefined();
    });

    it('should handle range with single element', () => {
      set.add(5);
      const result = [...set.range(5, 5)];
      expect(result).toEqual([5]);
    });

    it('should handle floor and ceiling with exact match', () => {
      set.add(1);
      set.add(5);
      set.add(10);
      expect(set.floor(5)).toBe(5);
      expect(set.ceiling(5)).toBe(5);
    });

    it('should handle lower and higher with exact match', () => {
      set.add(1);
      set.add(5);
      set.add(10);
      expect(set.lower(5)).toBe(1);
      expect(set.higher(5)).toBe(10);
    });
  });
});
