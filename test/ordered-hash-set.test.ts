import { describe, it, expect, beforeEach } from 'vitest';
import { OrderedHashSet } from '../src/core/ordered-hash-set/index.js';

describe('OrderedHashSet', () => {
  let set: OrderedHashSet<number>;

  beforeEach(() => {
    set = new OrderedHashSet<number>();
  });

  describe('Empty set', () => {
    it('should create empty set', () => {
      expect(set.size).toBe(0);
      expect(set.isEmpty).toBe(true);
    });

    it('should return false for has on empty set', () => {
      expect(set.has(5)).toBe(false);
    });

    it('should return false for contains on empty set', () => {
      expect(set.contains(5)).toBe(false);
    });

    it('should return false for delete on empty set', () => {
      expect(set.delete(5)).toBe(false);
    });

    it('should return empty array for toArray on empty set', () => {
      expect(set.toArray()).toEqual([]);
    });

    it('should not throw error on forEach with empty set', () => {
      const callback = vi.fn();
      set.forEach(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw RangeError for first on empty set', () => {
      expect(() => set.first()).toThrow(RangeError);
    });

    it('should throw RangeError for last on empty set', () => {
      expect(() => set.last()).toThrow(RangeError);
    });

    it('should throw RangeError for at on empty set', () => {
      expect(() => set.at(0)).toThrow(RangeError);
    });

    it('should return -1 for indexOf on empty set', () => {
      expect(set.indexOf(5)).toBe(-1);
    });

    it('should return empty string for join on empty set', () => {
      expect(set.join()).toBe('');
    });

    it('should return true for isSubsetOf with any set', () => {
      const other = new OrderedHashSet<number>();
      other.add(1);
      other.add(2);
      expect(set.isSubsetOf(other)).toBe(true);
    });

    it('should return true for isSupersetOf with empty set', () => {
      expect(set.isSupersetOf(set)).toBe(true);
    });

    it('should return true for isDisjointFrom with any set', () => {
      const other = new OrderedHashSet<number>();
      other.add(1);
      other.add(2);
      expect(set.isDisjointFrom(other)).toBe(true);
    });

    it('should return true for equals with empty set', () => {
      const other = new OrderedHashSet<number>();
      expect(set.equals(other)).toBe(true);
    });

    it('should return empty set for filter on empty set', () => {
      const result = set.filter(() => true);
      expect(result.size).toBe(0);
    });

    it('should return empty set for map on empty set', () => {
      const result = set.map((x) => x * 2);
      expect(result.size).toBe(0);
    });

    it('should return true for every on empty set', () => {
      expect(set.every(() => false)).toBe(true);
    });

    it('should return false for some on empty set', () => {
      expect(set.some(() => true)).toBe(false);
    });

    it('should return initial value for reduce on empty set', () => {
      expect(set.reduce((acc, x) => acc + x, 10)).toBe(10);
    });

    it('should clone empty set', () => {
      const clone = set.clone();
      expect(clone.size).toBe(0);
      expect(clone.isEmpty).toBe(true);
    });
  });

  describe('Single element', () => {
    it('should add single element', () => {
      expect(set.add(5)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.isEmpty).toBe(false);
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

    it('should return same value for first and last with single element', () => {
      set.add(5);
      expect(set.first()).toBe(5);
      expect(set.last()).toBe(5);
    });

    it('should delete single element', () => {
      set.add(5);
      expect(set.delete(5)).toBe(true);
      expect(set.isEmpty).toBe(true);
    });

    it('should clear single element set', () => {
      set.add(5);
      set.clear();
      expect(set.isEmpty).toBe(true);
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

    it('should return string representation for single element', () => {
      set.add(5);
      expect(set.join()).toBe('5');
    });

    it('should return string with custom separator for single element', () => {
      set.add(5);
      expect(set.join('|')).toBe('5');
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

    it('should maintain insertion order after adds', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      expect(set.toArray()).toEqual([5, 3, 7, 1]);
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

    it('should delete first element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(1)).toBe(true);
      expect(set.first()).toBe(2);
      expect(set.toArray()).toEqual([2, 3]);
    });

    it('should delete last element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(3)).toBe(true);
      expect(set.last()).toBe(2);
      expect(set.toArray()).toEqual([1, 2]);
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
      expect(set.isEmpty).toBe(true);
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
      expect(set.has(2)).toBe(false);
    });

    it('should maintain order after delete from middle', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.delete(2);
      expect(set.toArray()).toEqual([1, 3, 4]);
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

    it('should find element after multiple operations', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.has(1)).toBe(true);
      expect(set.has(3)).toBe(true);
      expect(set.has(2)).toBe(false);
    });
  });

  describe('Contains operation', () => {
    it('should return true for contains when element exists', () => {
      set.add(5);
      expect(set.contains(5)).toBe(true);
    });

    it('should return false for contains when element does not exist', () => {
      set.add(5);
      expect(set.contains(10)).toBe(false);
    });

    it('should behave same as has', () => {
      set.add(5);
      set.add(10);
      expect(set.contains(5)).toBe(set.has(5));
      expect(set.contains(10)).toBe(set.has(10));
      expect(set.contains(15)).toBe(set.has(15));
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
      expect(set.isEmpty).toBe(true);
    });

    it('should return false after add', () => {
      set.add(1);
      expect(set.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      set.add(1);
      set.clear();
      expect(set.isEmpty).toBe(true);
    });

    it('should return true after deleting all elements', () => {
      set.add(1);
      set.add(2);
      set.delete(1);
      set.delete(2);
      expect(set.isEmpty).toBe(true);
    });
  });

  describe('Clear operation', () => {
    it('should clear all elements', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.isEmpty).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should allow adds after clear', () => {
      set.add(1);
      set.clear();
      set.add(2);
      expect(set.has(2)).toBe(true);
      expect(set.size).toBe(1);
    });

    it('should clear empty set without error', () => {
      set.clear();
      expect(set.isEmpty).toBe(true);
    });

    it('should allow multiple clears', () => {
      set.add(1);
      set.clear();
      set.clear();
      expect(set.isEmpty).toBe(true);
    });
  });

  describe('First operation', () => {
    it('should return first added element', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      expect(set.first()).toBe(5);
    });

    it('should update first after deleting first element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(1);
      expect(set.first()).toBe(2);
    });

    it('should throw RangeError for empty set', () => {
      expect(() => set.first()).toThrow(RangeError);
    });

    it('should return last element when only one element', () => {
      set.add(5);
      expect(set.first()).toBe(set.last());
    });
  });

  describe('Last operation', () => {
    it('should return last added element', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      expect(set.last()).toBe(7);
    });

    it('should update last after deleting last element', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(3);
      expect(set.last()).toBe(2);
    });

    it('should throw RangeError for empty set', () => {
      expect(() => set.last()).toThrow(RangeError);
    });

    it('should return first element when only one element', () => {
      set.add(5);
      expect(set.last()).toBe(set.first());
    });
  });

  describe('ToArray operation', () => {
    it('should return empty array for empty set', () => {
      expect(set.toArray()).toEqual([]);
    });

    it('should return array in insertion order', () => {
      set.add(3);
      set.add(1);
      set.add(2);
      expect(set.toArray()).toEqual([3, 1, 2]);
    });

    it('should work with many elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach(v => set.add(v));
      expect(set.toArray()).toEqual(values);
    });

    it('should return new array on each call', () => {
      set.add(1);
      const arr1 = set.toArray();
      const arr2 = set.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should maintain order after deletions', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.delete(2);
      expect(set.toArray()).toEqual([1, 3, 4]);
    });
  });

  describe('Clone operation', () => {
    it('should clone empty set', () => {
      const clone = set.clone();
      expect(clone.size).toBe(0);
      expect(clone.isEmpty).toBe(true);
      expect(clone.toArray()).toEqual([]);
    });

    it('should clone non-empty set', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const clone = set.clone();
      expect(clone.size).toBe(3);
      expect(clone.toArray()).toEqual([1, 2, 3]);
    });

    it('should create independent clone', () => {
      set.add(1);
      set.add(2);
      const clone = set.clone();
      clone.add(3);
      expect(set.size).toBe(2);
      expect(clone.size).toBe(3);
      expect(set.has(3)).toBe(false);
      expect(clone.has(3)).toBe(true);
    });

    it('should maintain order in clone', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      const clone = set.clone();
      expect(clone.toArray()).toEqual([5, 3, 7]);
    });

    it('should not be affected by original modifications', () => {
      set.add(1);
      set.add(2);
      const clone = set.clone();
      set.delete(1);
      expect(clone.has(1)).toBe(true);
      expect(set.has(1)).toBe(false);
    });
  });

  describe('FromArray static method', () => {
    it('should create set from empty array', () => {
      const result = OrderedHashSet.fromArray([]);
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('should create set from array with elements', () => {
      const result = OrderedHashSet.fromArray([1, 2, 3]);
      expect(result.size).toBe(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle duplicates in array', () => {
      const result = OrderedHashSet.fromArray([1, 2, 2, 3, 1]);
      expect(result.size).toBe(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should maintain order from array', () => {
      const result = OrderedHashSet.fromArray([5, 3, 7, 1]);
      expect(result.toArray()).toEqual([5, 3, 7, 1]);
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

    it('should iterate in insertion order', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      set.add(9);
      const values: number[] = [];
      set.forEach((v) => values.push(v));
      expect(values).toEqual([5, 3, 7, 1, 9]);
    });

    it('should pass both value and index to callback', () => {
      set.add('a');
      set.add('b');
      set.add('c');
      const results: [string, number][] = [];
      set.forEach((v, i) => results.push([v, i]));
      expect(results).toEqual([['a', 0], ['b', 1], ['c', 2]]);
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

    it('should iterate in insertion order', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      set.add(1);
      set.add(9);
      const values: number[] = [];
      for (const v of set) {
        values.push(v);
      }
      expect(values).toEqual([5, 3, 7, 1, 9]);
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

    it('should support destructuring', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const [first, second, third] = set;
      expect(first).toBe(1);
      expect(second).toBe(2);
      expect(third).toBe(3);
    });
  });

  describe('Union operation', () => {
    it('should union two non-overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should union two overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should not modify original sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set2.add(2);
      const size1 = set1.size;
      const size2 = set2.size;
      set1.union(set2);
      expect(set1.size).toBe(size1);
      expect(set2.size).toBe(size2);
    });

    it('should maintain order from first set then second', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(3);
      set2.add(2);
      set2.add(4);
      const result = set1.union(set2);
      expect(result.toArray()).toEqual([1, 3, 2, 4]);
    });
  });

  describe('Intersection operation', () => {
    it('should intersect two overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should intersect with empty set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should not modify original sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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

    it('should maintain order from first set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(3);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      const result = set1.intersection(set2);
      expect(result.toArray()).toEqual([3, 2]);
    });
  });

  describe('Difference operation', () => {
    it('should difference two overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should return empty set when subtracting all', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should return empty set when subtracting from empty set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set2.difference(set1);
      expect(result.toArray()).toEqual([]);
    });

    it('should not modify original sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
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

    it('should maintain order from first set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(3);
      set1.add(2);
      set2.add(2);
      const result = set1.difference(set2);
      expect(result.toArray()).toEqual([1, 3]);
    });
  });

  describe('SymmetricDifference operation', () => {
    it('should compute symmetric difference of overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([1, 4]);
    });

    it('should return both sets for non-overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should return empty set for identical sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([]);
    });

    it('should return first set when second is empty', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should return second set when first is empty', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set2.add(1);
      set2.add(2);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should not modify original sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      const size1 = set1.size;
      const size2 = set2.size;
      set1.symmetricDifference(set2);
      expect(set1.size).toBe(size1);
      expect(set2.size).toBe(size2);
    });

    it('should maintain order from first then second', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(3);
      set2.add(2);
      set2.add(4);
      const result = set1.symmetricDifference(set2);
      expect(result.toArray()).toEqual([1, 3, 2, 4]);
    });
  });

  describe('IsSubsetOf operation', () => {
    it('should return true for proper subset', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      set2.add(3);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });

    it('should return true for equal sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });

    it('should return false for non-subset', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(false);
    });

    it('should return true for empty set as subset', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set2.add(1);
      set2.add(2);
      expect(set1.isSubsetOf(set2)).toBe(true);
    });

    it('should return true for empty sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      expect(set1.isSubsetOf(set2)).toBe(true);
    });
  });

  describe('IsSupersetOf operation', () => {
    it('should return true for proper superset', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set1.add(3);
      set2.add(1);
      set2.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });

    it('should return true for equal sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });

    it('should return false for non-superset', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      set2.add(3);
      expect(set1.isSupersetOf(set2)).toBe(false);
    });

    it('should return true for any set as superset of empty set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      expect(set1.isSupersetOf(set2)).toBe(true);
    });

    it('should return true for empty sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      expect(set1.isSupersetOf(set2)).toBe(true);
    });
  });

  describe('IsDisjointFrom operation', () => {
    it('should return true for disjoint sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(3);
      set2.add(4);
      expect(set1.isDisjointFrom(set2)).toBe(true);
    });

    it('should return false for overlapping sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      expect(set1.isDisjointFrom(set2)).toBe(false);
    });

    it('should return true for empty set with any set', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set2.add(1);
      set2.add(2);
      expect(set1.isDisjointFrom(set2)).toBe(true);
    });

    it('should return true for two empty sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      expect(set1.isDisjointFrom(set2)).toBe(true);
    });

    it('should return false for identical non-empty sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.isDisjointFrom(set2)).toBe(false);
    });
  });

  describe('Equals operation', () => {
    it('should return true for equal sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.equals(set2)).toBe(true);
    });

    it('should return false for different size sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set2.add(1);
      set2.add(2);
      expect(set1.equals(set2)).toBe(false);
    });

    it('should return false for different element sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(2);
      set2.add(3);
      expect(set1.equals(set2)).toBe(false);
    });

    it('should return true for two empty sets', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      expect(set1.equals(set2)).toBe(true);
    });

    it('should consider same set as equal', () => {
      set.add(1);
      set.add(2);
      expect(set.equals(set)).toBe(true);
    });

    it('should be symmetric', () => {
      const set1 = new OrderedHashSet<number>();
      const set2 = new OrderedHashSet<number>();
      set1.add(1);
      set1.add(2);
      set2.add(1);
      set2.add(2);
      expect(set1.equals(set2)).toBe(set2.equals(set1));
    });
  });

  describe('Filter operation', () => {
    it('should filter with true predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.filter(() => true);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should filter with false predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.filter(() => false);
      expect(result.toArray()).toEqual([]);
    });

    it('should filter with custom predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      const result = set.filter((x) => x % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });

    it('should maintain order in filtered result', () => {
      set.add(5);
      set.add(1);
      set.add(3);
      set.add(7);
      set.add(2);
      const result = set.filter((x) => x > 2);
      expect(result.toArray()).toEqual([5, 3, 7]);
    });

    it('should pass index to predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.filter((_, i) => i % 2 === 0);
      expect(result.toArray()).toEqual([1, 3]);
    });

    it('should not modify original set', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const size = set.size;
      set.filter(() => false);
      expect(set.size).toBe(size);
      expect(set.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('Map operation', () => {
    it('should map with identity function', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.map((x) => x);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should map with transformation', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should maintain order in mapped result', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      const result = set.map((x) => x + 10);
      expect(result.toArray()).toEqual([15, 13, 17]);
    });

    it('should handle different types', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.map((x) => `num${x}`);
      expect(result.toArray()).toEqual(['num1', 'num2', 'num3']);
    });

    it('should pass index to mapper', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.map((x, i) => x + i);
      expect(result.toArray()).toEqual([1, 3, 5]);
    });

    it('should not modify original set', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const size = set.size;
      set.map((x) => x * 2);
      expect(set.size).toBe(size);
      expect(set.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('Every operation', () => {
    it('should return true for all elements satisfying predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.every((x) => x > 0)).toBe(true);
    });

    it('should return false when one element fails predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.every((x) => x > 1)).toBe(false);
    });

    it('should return true for empty set', () => {
      expect(set.every(() => false)).toBe(true);
    });

    it('should short-circuit on first failure', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const calls: number[] = [];
      set.every((x) => {
        calls.push(x);
        return x > 2;
      });
      expect(calls).toEqual([1]);
    });

    it('should pass index to predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.every((_, i) => i >= 0)).toBe(true);
    });
  });

  describe('Some operation', () => {
    it('should return true when one element satisfies predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.some((x) => x === 2)).toBe(true);
    });

    it('should return false when no element satisfies predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.some((x) => x > 10)).toBe(false);
    });

    it('should return false for empty set', () => {
      expect(set.some(() => true)).toBe(false);
    });

    it('should short-circuit on first success', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const calls: number[] = [];
      set.some((x) => {
        calls.push(x);
        return x === 2;
      });
      expect(calls).toEqual([1, 2]);
    });

    it('should pass index to predicate', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.some((_, i) => i === 1)).toBe(true);
    });
  });

  describe('Reduce operation', () => {
    it('should reduce with sum', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.reduce((acc, x) => acc + x, 0)).toBe(6);
    });

    it('should reduce with product', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.reduce((acc, x) => acc * x, 1)).toBe(6);
    });

    it('should return initial value for empty set', () => {
      expect(set.reduce((acc, x) => acc + x, 10)).toBe(10);
    });

    it('should build array with reduce', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.reduce<number[]>((acc, x) => [...acc, x], []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should pass index to reducer', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const result = set.reduce((acc, x, i) => acc + x + i, 0);
      expect(result).toBe(9);
    });

    it('should use initial value as accumulator', () => {
      set.add(1);
      set.add(2);
      const result = set.reduce((acc, x) => acc.concat([x]), ['start']);
      expect(result).toEqual(['start', 1, 2]);
    });
  });

  describe('Join operation', () => {
    it('should join with default separator', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.join()).toBe('1,2,3');
    });

    it('should join with custom separator', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.join('|')).toBe('1|2|3');
    });

    it('should join strings', () => {
      const strSet = new OrderedHashSet<string>();
      strSet.add('hello');
      strSet.add('world');
      expect(strSet.join(' ')).toBe('hello world');
    });

    it('should return empty string for empty set', () => {
      expect(set.join()).toBe('');
    });

    it('should return single element for one-element set', () => {
      set.add(5);
      expect(set.join('-')).toBe('5');
    });

    it('should handle custom separator as empty string', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.join('')).toBe('123');
    });

    it('should maintain insertion order', () => {
      set.add(3);
      set.add(1);
      set.add(2);
      expect(set.join('-')).toBe('3-1-2');
    });
  });

  describe('At operation', () => {
    it('should return element at valid index', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.at(0)).toBe(1);
      expect(set.at(1)).toBe(2);
      expect(set.at(2)).toBe(3);
    });

    it('should support negative indexing', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.at(-1)).toBe(3);
      expect(set.at(-2)).toBe(2);
      expect(set.at(-3)).toBe(1);
    });

    it('should throw RangeError for out of bounds positive index', () => {
      set.add(1);
      expect(() => set.at(10)).toThrow(RangeError);
    });

    it('should throw RangeError for out of bounds negative index', () => {
      set.add(1);
      expect(() => set.at(-10)).toThrow(RangeError);
    });

    it('should throw RangeError for index equal to size', () => {
      set.add(1);
      expect(() => set.at(1)).toThrow(RangeError);
    });

    it('should throw RangeError for empty set', () => {
      expect(() => set.at(0)).toThrow(RangeError);
    });

    it('should throw RangeError for negative index on empty set', () => {
      expect(() => set.at(-1)).toThrow(RangeError);
    });

    it('should maintain insertion order', () => {
      set.add(5);
      set.add(3);
      set.add(7);
      expect(set.at(0)).toBe(5);
      expect(set.at(1)).toBe(3);
      expect(set.at(2)).toBe(7);
    });
  });

  describe('IndexOf operation', () => {
    it('should return correct index for element', () => {
      set.add(3);
      set.add(1);
      set.add(5);
      set.add(2);
      set.add(4);
      expect(set.indexOf(3)).toBe(0);
      expect(set.indexOf(1)).toBe(1);
      expect(set.indexOf(5)).toBe(2);
      expect(set.indexOf(2)).toBe(3);
      expect(set.indexOf(4)).toBe(4);
    });

    it('should return -1 for non-existent element', () => {
      set.add(1);
      set.add(3);
      expect(set.indexOf(2)).toBe(-1);
    });

    it('should return -1 for empty set', () => {
      expect(set.indexOf(5)).toBe(-1);
    });

    it('should return first occurrence index for hash collisions', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      const index1 = set.indexOf(2);
      set.delete(2);
      set.add(4);
      expect(index1).toBe(1);
    });

    it('should maintain index after deletion', () => {
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.indexOf(1)).toBe(0);
      expect(set.indexOf(3)).toBe(1);
    });
  });

  describe('Custom hash function', () => {
    it('should work with custom hash function', () => {
      const customSet = new OrderedHashSet<string>({ hash: (s) => s.length });
      customSet.add('ab');
      customSet.add('cd');
      expect(customSet.size).toBe(1);
    });

    it('should use custom hash for add and delete', () => {
      const customSet = new OrderedHashSet<number>({ hash: (n) => n % 2 });
      expect(customSet.add(1)).toBe(true);
      expect(customSet.add(3)).toBe(false);
      expect(customSet.size).toBe(1);
    });
  });

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        expect(set.add(i)).toBe(true);
      }
      expect(set.size).toBe(100);
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
      expect(set.isEmpty).toBe(true);
    });

    it('should maintain order with large dataset', () => {
      const values = [50, 25, 75, 12, 37, 62, 87];
      values.forEach(v => set.add(v));
      expect(set.toArray()).toEqual(values);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      set.add(-3);
      set.add(-1);
      set.add(-2);
      expect(set.toArray()).toEqual([-3, -1, -2]);
      expect(set.first()).toBe(-3);
      expect(set.last()).toBe(-2);
    });

    it('should handle mixed positive and negative numbers', () => {
      set.add(-2);
      set.add(0);
      set.add(2);
      set.add(-1);
      set.add(1);
      expect(set.toArray()).toEqual([-2, 0, 2, -1, 1]);
    });

    it('should handle zero', () => {
      set.add(0);
      set.add(1);
      set.add(-1);
      expect(set.has(0)).toBe(true);
      expect(set.indexOf(0)).toBe(0);
    });

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
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
      expect(set.toArray()).toEqual([7, 1, 9]);
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
    });

    it('should handle delete and add same value', () => {
      set.add(1);
      set.add(2);
      set.delete(1);
      expect(set.add(1)).toBe(true);
      expect(set.size).toBe(2);
      expect(set.indexOf(1)).toBe(1);
    });

    it('should handle union with itself', () => {
      set.add(1);
      set.add(2);
      const result = set.union(set);
      expect(result.size).toBe(2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should handle intersection with itself', () => {
      set.add(1);
      set.add(2);
      const result = set.intersection(set);
      expect(result.size).toBe(2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('should handle difference with itself', () => {
      set.add(1);
      set.add(2);
      const result = set.difference(set);
      expect(result.size).toBe(0);
    });

    it('should handle symmetric difference with itself', () => {
      set.add(1);
      set.add(2);
      const result = set.symmetricDifference(set);
      expect(result.size).toBe(0);
    });
  });
});