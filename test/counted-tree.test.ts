import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CountedTree } from '../src/core/counted-tree/index.js';

describe('CountedTree', () => {
  let tree: CountedTree<number>;

  beforeEach(() => {
    tree = new CountedTree<number>();
  });

  describe('Empty tree', () => {
    it('should create empty tree', () => {
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return undefined for min on empty tree', () => {
      expect(tree.min()).toBeUndefined();
    });

    it('should return undefined for max on empty tree', () => {
      expect(tree.max()).toBeUndefined();
    });

    it('should return false for contains on empty tree', () => {
      expect(tree.contains(5)).toBe(false);
    });

    it('should return empty array for toArray on empty tree', () => {
      expect(tree.toArray()).toEqual([]);
    });

    it('should return empty array for toArraySorted on empty tree', () => {
      expect(tree.toArraySorted()).toEqual([]);
    });

    it('should not throw error on forEach with empty tree', () => {
      const callback = vi.fn();
      tree.forEach(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return false for remove on empty tree', () => {
      expect(tree.remove(5)).toBe(false);
    });

    it('should return undefined for predecessor on empty tree', () => {
      expect(tree.predecessor(5)).toBeUndefined();
    });

    it('should return undefined for successor on empty tree', () => {
      expect(tree.successor(5)).toBeUndefined();
    });

    it('should return undefined for lowerBound on empty tree', () => {
      expect(tree.lowerBound(5)).toBeUndefined();
    });

    it('should return undefined for upperBound on empty tree', () => {
      expect(tree.upperBound(5)).toBeUndefined();
    });

    it('should return 0 for rank on empty tree', () => {
      expect(tree.rank(5)).toBe(0);
    });

    it('should return undefined for select on empty tree', () => {
      expect(tree.select(0)).toBeUndefined();
    });

    it('should return -1 for indexOf on empty tree', () => {
      expect(tree.indexOf(5)).toBe(-1);
    });

    it('should return undefined for atIndex on empty tree', () => {
      expect(tree.atIndex(0)).toBeUndefined();
    });

    it('should return 0 for count on empty tree', () => {
      expect(tree.count(1, 10)).toBe(0);
    });

    it('should iterate empty tree with for...of', () => {
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([]);
    });
  });

  describe('Single element', () => {
    it('should add single element', () => {
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should not add duplicate', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('should find single element after insert', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should not find element not in single element tree', () => {
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });

    it('should return same value for min and max with single element', () => {
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
    });

    it('should remove single element', () => {
      tree.insert(5);
      expect(tree.remove(5)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false when removing non-existent element', () => {
      tree.insert(5);
      expect(tree.remove(10)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should clear single element tree', () => {
      tree.insert(5);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should iterate with forEach on single element', () => {
      tree.insert(5);
      const values: number[] = [];
      tree.forEach((v) => values.push(v));
      expect(values).toEqual([5]);
    });

    it('should iterate with for...of on single element', () => {
      tree.insert(5);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([5]);
    });

    it('should return rank 0 for single element', () => {
      tree.insert(5);
      expect(tree.rank(5)).toBe(0);
    });

    it('should return rank 1 for value greater than single element', () => {
      tree.insert(5);
      expect(tree.rank(10)).toBe(1);
    });

    it('should return element at index 0', () => {
      tree.insert(5);
      expect(tree.select(0)).toBe(5);
      expect(tree.atIndex(0)).toBe(5);
    });

    it('should return undefined for index beyond single element', () => {
      tree.insert(5);
      expect(tree.select(1)).toBeUndefined();
      expect(tree.atIndex(1)).toBeUndefined();
    });

    it('should return index 0 for single element', () => {
      tree.insert(5);
      expect(tree.indexOf(5)).toBe(0);
    });

    it('should return -1 for non-existent element in single element tree', () => {
      tree.insert(5);
      expect(tree.indexOf(10)).toBe(-1);
    });

    it('should return undefined for predecessor of single element', () => {
      tree.insert(5);
      expect(tree.predecessor(5)).toBeUndefined();
    });

    it('should return undefined for successor of single element', () => {
      tree.insert(5);
      expect(tree.successor(5)).toBeUndefined();
    });

    it('should return element for lowerBound of single element', () => {
      tree.insert(5);
      expect(tree.lowerBound(5)).toBe(5);
      expect(tree.lowerBound(3)).toBe(5);
      expect(tree.lowerBound(10)).toBeUndefined();
    });

    it('should return undefined for upperBound of single element', () => {
      tree.insert(5);
      expect(tree.upperBound(5)).toBeUndefined();
      expect(tree.upperBound(3)).toBe(5);
      expect(tree.upperBound(10)).toBeUndefined();
    });

    it('should count correctly for single element', () => {
      tree.insert(5);
      expect(tree.count(5, 5)).toBe(1);
      expect(tree.count(1, 10)).toBe(1);
      expect(tree.count(10, 20)).toBe(0);
    });
  });

  describe('Insert operations', () => {
    it('should insert multiple elements', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.size).toBe(3);
    });

    it('should insert elements in random order', () => {
      tree.insert(5);
      tree.insert(1);
      tree.insert(10);
      tree.insert(3);
      tree.insert(8);
      expect(tree.size).toBe(5);
    });

    it('should not insert duplicate values', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(2);
      expect(tree.size).toBe(3);
    });

    it('should handle many inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
    });

    it('should maintain sorted order after inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      expect(tree.toArray()).toEqual([1, 3, 5, 7]);
    });
  });

  describe('Remove operations', () => {
    it('should remove element from middle', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(2)).toBe(true);
      expect(tree.size).toBe(2);
    });

    it('should remove min element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(1)).toBe(true);
      expect(tree.min()).toBe(2);
    });

    it('should remove max element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(3)).toBe(true);
      expect(tree.max()).toBe(2);
    });

    it('should return false when removing non-existent element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(10)).toBe(false);
      expect(tree.size).toBe(3);
    });

    it('should remove all elements one by one', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(1)).toBe(true);
      expect(tree.remove(2)).toBe(true);
      expect(tree.remove(3)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should not find element after remove', () => {
      tree.insert(5);
      tree.remove(5);
      expect(tree.contains(5)).toBe(false);
    });

    it('should find remaining elements after remove', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(2);
      expect(tree.contains(1)).toBe(true);
      expect(tree.contains(3)).toBe(true);
    });

    it('should maintain correct structure after multiple removes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      tree.remove(5);
      tree.remove(7);
      expect(tree.contains(5)).toBe(false);
      expect(tree.contains(7)).toBe(false);
      expect(tree.contains(6)).toBe(true);
      expect(tree.contains(8)).toBe(true);
    });
  });

  describe('Contains operation', () => {
    it('should return true when element exists', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should return false when element does not exist', () => {
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });
  });

  describe('Size operation', () => {
    it('should report correct size after inserts', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
        expect(tree.size).toBe(i + 1);
      }
    });

    it('should report correct size after removes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      tree.remove(5);
      expect(tree.size).toBe(9);
    });

    it('should report zero after clear', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      tree.clear();
      expect(tree.size).toBe(0);
    });
  });

  describe('IsEmpty operation', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      tree.insert(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      tree.insert(1);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('Clear operation', () => {
    it('should clear all elements', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow inserts after clear', () => {
      tree.insert(1);
      tree.clear();
      tree.insert(2);
      expect(tree.contains(2)).toBe(true);
      expect(tree.size).toBe(1);
    });
  });

  describe('Min operation', () => {
    it('should return correct min after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
    });

    it('should return correct min after remove', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(1);
      expect(tree.min()).toBe(2);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined();
    });
  });

  describe('Max operation', () => {
    it('should return correct max after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.max()).toBe(7);
    });

    it('should return correct max after remove', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(3);
      expect(tree.max()).toBe(2);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined();
    });
  });

  describe('ToArray operation', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should work with many elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach(v => tree.insert(v));
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return new array on each call', () => {
      tree.insert(1);
      const arr1 = tree.toArray();
      const arr2 = tree.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });
  });

  describe('ToArraySorted operation', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArraySorted()).toEqual([]);
    });

    it('should return sorted array', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      expect(tree.toArraySorted()).toEqual([1, 2, 3]);
    });

    it('should return same as toArray', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      expect(tree.toArray()).toEqual(tree.toArraySorted());
    });
  });

  describe('ForEach operation', () => {
    it('should call callback for each element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const values: number[] = [];
      tree.forEach((v) => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should pass correct index to callback', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const indices: number[] = [];
      tree.forEach((_, i) => indices.push(i));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not call callback on empty tree', () => {
      const callback = vi.fn();
      tree.forEach(callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should iterate in sorted order', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const values: number[] = [];
      tree.forEach((v) => values.push(v));
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('Iterator operation', () => {
    it('should iterate with for...of', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([1, 2, 3]);
    });

    it('should iterate in sorted order', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not iterate empty tree', () => {
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([]);
    });

    it('should support spread operator', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const arr = [...tree];
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('Rank operation', () => {
    it('should return correct rank for elements', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(5);
      tree.insert(2);
      tree.insert(4);
      expect(tree.rank(1)).toBe(0);
      expect(tree.rank(2)).toBe(1);
      expect(tree.rank(3)).toBe(2);
      expect(tree.rank(4)).toBe(3);
      expect(tree.rank(5)).toBe(4);
    });

    it('should return correct rank for non-existent elements', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.rank(0)).toBe(0);
      expect(tree.rank(2)).toBe(1);
      expect(tree.rank(4)).toBe(2);
      expect(tree.rank(6)).toBe(3);
    });

    it('should return 0 for value smaller than min', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.rank(1)).toBe(0);
    });

    it('should return size for value larger than max', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.rank(10)).toBe(3);
    });
  });

  describe('Select operation', () => {
    it('should return element at index', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(5);
      tree.insert(2);
      tree.insert(4);
      expect(tree.select(0)).toBe(1);
      expect(tree.select(1)).toBe(2);
      expect(tree.select(2)).toBe(3);
      expect(tree.select(3)).toBe(4);
      expect(tree.select(4)).toBe(5);
    });

    it('should return undefined for negative index', () => {
      tree.insert(1);
      expect(tree.select(-1)).toBeUndefined();
    });

    it('should return undefined for index beyond size', () => {
      tree.insert(1);
      expect(tree.select(10)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.select(0)).toBeUndefined();
    });
  });

  describe('Predecessor operation', () => {
    it('should return undefined for predecessor of non-existent value', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(2)).toBeUndefined();
    });

    it('should return predecessor when element exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(3)).toBe(1);
    });

    it('should return undefined for predecessor of min', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.predecessor(3)).toBeUndefined();
    });

    it('should return undefined for predecessor of non-existent value above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(10)).toBeUndefined();
    });
  });

  describe('Successor operation', () => {
    it('should return undefined for successor of non-existent value', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(2)).toBeUndefined();
    });

    it('should return successor when element exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(3)).toBe(5);
    });

    it('should return undefined for successor of non-existent value below min', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.successor(2)).toBeUndefined();
    });

    it('should return undefined for successor above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(10)).toBeUndefined();
    });
  });

  describe('LowerBound operation', () => {
    it('should return element when value exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(3)).toBe(3);
    });

    it('should return next greater element', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(2)).toBe(3);
    });

    it('should return min for value below min', () => {
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(1)).toBe(3);
    });

    it('should return undefined for value above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(10)).toBeUndefined();
    });
  });

  describe('UpperBound operation', () => {
    it('should return next greater element', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(3)).toBe(5);
    });

    it('should return min for value below min', () => {
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(1)).toBe(3);
    });

    it('should return undefined for value at or above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(5)).toBeUndefined();
      expect(tree.upperBound(10)).toBeUndefined();
    });
  });

  describe('AtIndex operation', () => {
    it('should return element at index', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(5);
      tree.insert(2);
      tree.insert(4);
      expect(tree.atIndex(0)).toBe(1);
      expect(tree.atIndex(1)).toBe(2);
      expect(tree.atIndex(2)).toBe(3);
      expect(tree.atIndex(3)).toBe(4);
      expect(tree.atIndex(4)).toBe(5);
    });

    it('should return undefined for negative index', () => {
      tree.insert(1);
      expect(tree.atIndex(-1)).toBeUndefined();
    });

    it('should return undefined for index beyond size', () => {
      tree.insert(1);
      expect(tree.atIndex(10)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.atIndex(0)).toBeUndefined();
    });

    it('should behave same as select', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      for (let i = 0; i < tree.size; i++) {
        expect(tree.atIndex(i)).toBe(tree.select(i));
      }
    });
  });

  describe('IndexOf operation', () => {
    it('should return correct index for element', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(5);
      tree.insert(2);
      tree.insert(4);
      expect(tree.indexOf(1)).toBe(0);
      expect(tree.indexOf(2)).toBe(1);
      expect(tree.indexOf(3)).toBe(2);
      expect(tree.indexOf(4)).toBe(3);
      expect(tree.indexOf(5)).toBe(4);
    });

    it('should return -1 for non-existent element', () => {
      tree.insert(1);
      tree.insert(3);
      expect(tree.indexOf(2)).toBe(-1);
    });

    it('should return -1 for empty tree', () => {
      expect(tree.indexOf(5)).toBe(-1);
    });

    it('should behave same as rank for existing elements', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.indexOf(1)).toBe(tree.rank(1));
      expect(tree.indexOf(5)).toBe(tree.rank(5));
      expect(tree.indexOf(9)).toBe(tree.rank(9));
    });
  });

  describe('Count operation', () => {
    it('should return count of elements in range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.count(3, 7)).toBe(5);
    });

    it('should return 0 when no elements in range', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i);
      }
      expect(tree.count(10, 20)).toBe(0);
    });

    it('should handle single element range', () => {
      tree.insert(5);
      expect(tree.count(5, 5)).toBe(1);
    });

    it('should return all elements when range covers all', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i);
      }
      expect(tree.count(1, 5)).toBe(5);
    });

    it('should return 0 when lower bound greater than upper', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.count(5, 3)).toBe(0);
    });

    it('should count inclusive of bounds', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.count(1, 10)).toBe(10);
    });
  });

  describe('Clone operation', () => {
    it('should clone empty tree', () => {
      const clone = tree.clone();
      expect(clone.size).toBe(0);
      expect(clone.toArray()).toEqual([]);
    });

    it('should clone non-empty tree', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const clone = tree.clone();
      expect(clone.size).toBe(3);
      expect(clone.toArray()).toEqual([1, 2, 3]);
    });

    it('should create independent clone', () => {
      tree.insert(1);
      tree.insert(2);
      const clone = tree.clone();
      clone.insert(3);
      expect(tree.size).toBe(2);
      expect(clone.size).toBe(3);
      expect(tree.contains(3)).toBe(false);
      expect(clone.contains(3)).toBe(true);
    });

    it('should not affect original when clone is modified', () => {
      tree.insert(1);
      tree.insert(2);
      const clone = tree.clone();
      clone.remove(1);
      clone.insert(3);
      expect(tree.contains(1)).toBe(true);
      expect(tree.contains(3)).toBe(false);
      expect(clone.contains(1)).toBe(false);
      expect(clone.contains(3)).toBe(true);
    });
  });

  describe('FromArray static method', () => {
    it('should create tree from array', () => {
      const arr = [5, 3, 7, 1, 9];
      const newTree = CountedTree.fromArray(arr);
      expect(newTree.size).toBe(5);
      expect(newTree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should create empty tree from empty array', () => {
      const newTree = CountedTree.fromArray([]);
      expect(newTree.size).toBe(0);
      expect(newTree.toArray()).toEqual([]);
    });

    it('should handle duplicates in array', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      const newTree = CountedTree.fromArray(arr);
      expect(newTree.size).toBe(3);
      expect(newTree.toArray()).toEqual([1, 2, 3]);
    });

    it('should accept custom comparator', () => {
      const arr = [1, 2, 3];
      const newTree = CountedTree.fromArray(arr, {
        comparator: (a, b) => b - a
      });
      expect(newTree.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('Constructor with iterable', () => {
    it('should create tree from array', () => {
      const arr = [5, 3, 7, 1, 9];
      const newTree = new CountedTree(arr);
      expect(newTree.size).toBe(5);
      expect(newTree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should create tree from set', () => {
      const set = new Set([5, 3, 7, 1, 9]);
      const newTree = new CountedTree(set);
      expect(newTree.size).toBe(5);
      expect(newTree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should accept custom comparator in constructor', () => {
      const arr = [1, 2, 3];
      const newTree = new CountedTree(arr, {
        comparator: (a, b) => b - a
      });
      expect(newTree.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('Custom comparator', () => {
    it('should work with reverse comparator', () => {
      const revTree = new CountedTree<number>(undefined, {
        comparator: (a, b) => b - a
      });
      revTree.insert(1);
      revTree.insert(2);
      revTree.insert(3);
      expect(revTree.toArray()).toEqual([3, 2, 1]);
    });

    it('should work with custom comparator', () => {
      interface Person {
        id: number;
        name: string;
      }
      const personTree = new CountedTree<Person>(undefined, {
        comparator: (a, b) => a.id - b.id
      });
      personTree.insert({ id: 2, name: 'Bob' });
      personTree.insert({ id: 1, name: 'Alice' });
      personTree.insert({ id: 3, name: 'Charlie' });
      expect(personTree.size).toBe(3);
      expect(personTree.min()).toEqual({ id: 1, name: 'Alice' });
    });

    it('should work with comparator from constructor', () => {
      const customTree = new CountedTree<number>([5, 1, 3], {
        comparator: (a, b) => b - a
      });
      expect(customTree.toArray()).toEqual([5, 3, 1]);
    });
  });

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
      expect(tree.min()).toBe(0);
      expect(tree.max()).toBe(99);
    });

    it('should find all elements in large tree', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.contains(i)).toBe(true);
      }
    });

    it('should delete all elements from large tree', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.remove(i)).toBe(true);
      }
      expect(tree.isEmpty()).toBe(true);
    });

    it('should maintain correct structure with large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.min()).toBe(0);
      expect(tree.max()).toBe(999);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      tree.insert(-3);
      tree.insert(-1);
      tree.insert(-2);
      expect(tree.toArray()).toEqual([-3, -2, -1]);
      expect(tree.min()).toBe(-3);
      expect(tree.max()).toBe(-1);
    });

    it('should handle mixed positive and negative numbers', () => {
      tree.insert(-2);
      tree.insert(0);
      tree.insert(2);
      tree.insert(-1);
      tree.insert(1);
      expect(tree.toArray()).toEqual([-2, -1, 0, 1, 2]);
    });

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle reverse insertions', () => {
      for (let i = 10; i >= 1; i--) {
        tree.insert(i);
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle mixed operations', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.remove(5);
      tree.insert(1);
      tree.insert(9);
      tree.remove(3);
      expect(tree.toArray()).toEqual([1, 7, 9]);
    });

    it('should allow adding after delete', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(2);
      tree.insert(4);
      expect(tree.size).toBe(3);
      expect(tree.contains(4)).toBe(true);
    });

    it('should handle repeated add and remove', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.remove(i)).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
    });

    it('should handle rank at boundaries', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.rank(1)).toBe(0);
      expect(tree.rank(5)).toBe(1);
      expect(tree.rank(10)).toBe(2);
    });

    it('should handle select at boundaries', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.select(0)).toBe(1);
      expect(tree.select(1)).toBe(5);
      expect(tree.select(2)).toBe(10);
      expect(tree.select(3)).toBeUndefined();
    });

    it('should handle indexOf at boundaries', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.indexOf(1)).toBe(0);
      expect(tree.indexOf(5)).toBe(1);
      expect(tree.indexOf(10)).toBe(2);
    });

    it('should handle count with single element', () => {
      tree.insert(5);
      expect(tree.count(5, 5)).toBe(1);
    });

    it('should handle count with non-existent range', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.count(10, 20)).toBe(0);
    });

    it('should handle predecessor and successor with exact match', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.predecessor(5)).toBe(1);
      expect(tree.successor(5)).toBe(10);
    });

    it('should handle lowerBound and upperBound with exact match', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.lowerBound(5)).toBe(5);
      expect(tree.upperBound(5)).toBe(10);
    });
  });
});
