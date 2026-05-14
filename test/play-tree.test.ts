import { describe, it, expect, beforeEach } from 'vitest';
import { PlayTree } from '../src/core/play-tree/index.js';

describe('PlayTree', () => {
  let tree: PlayTree<number>;

  beforeEach(() => {
    tree = new PlayTree<number>();
  });

  describe('Empty tree', () => {
    it('should create empty tree', () => {
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.count()).toBe(0);
    });

    it('should return undefined for min on empty tree', () => {
      expect(tree.min()).toBeUndefined();
      expect(tree.first()).toBeUndefined();
    });

    it('should return undefined for max on empty tree', () => {
      expect(tree.max()).toBeUndefined();
      expect(tree.last()).toBeUndefined();
    });

    it('should return false for has on empty tree', () => {
      expect(tree.has(5)).toBe(false);
      expect(tree.contains(5)).toBe(false);
    });

    it('should return empty array for toArray on empty tree', () => {
      expect(tree.toArray()).toEqual([]);
      expect(tree.toArraySorted()).toEqual([]);
    });

    it('should not throw error on forEach with empty tree', () => {
      tree.forEach(() => {});
    });

    it('should delete from empty tree and return false', () => {
      expect(tree.delete(5)).toBe(false);
    });

    it('should return undefined for lowerBound on empty tree', () => {
      expect(tree.lowerBound(5)).toBeUndefined();
    });

    it('should return undefined for upperBound on empty tree', () => {
      expect(tree.upperBound(5)).toBeUndefined();
    });

    it('should return undefined for predecessor on empty tree', () => {
      expect(tree.predecessor(5)).toBeUndefined();
    });

    it('should return undefined for successor on empty tree', () => {
      expect(tree.successor(5)).toBeUndefined();
    });

    it('should return 0 for rank on empty tree', () => {
      expect(tree.rank(5)).toBe(0);
    });

    it('should return undefined for select on empty tree', () => {
      expect(tree.select(0)).toBeUndefined();
    });

    it('should split empty tree', () => {
      const [left, right] = tree.split(5);
      expect(left.size).toBe(0);
      expect(right.size).toBe(0);
    });

    it('should return empty array for rangeQuery on empty tree', () => {
      expect(tree.rangeQuery(1, 10)).toEqual([]);
    });

    it('should return 0 for depth on empty tree', () => {
      expect(tree.depth()).toBe(0);
    });

    it('should not iterate empty tree', () => {
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([]);
    });
  });

  describe('Single element', () => {
    it('should insert single element', () => {
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
    });

    it('should not insert duplicate single element', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('should find single element after insert', () => {
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
      expect(tree.contains(5)).toBe(true);
    });

    it('should not find element not in single element tree', () => {
      tree.insert(5);
      expect(tree.has(10)).toBe(false);
      expect(tree.contains(10)).toBe(false);
    });

    it('should return same value for min and max with single element', () => {
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
      expect(tree.first()).toBe(5);
      expect(tree.last()).toBe(5);
    });

    it('should delete single element', () => {
      tree.insert(5);
      expect(tree.delete(5)).toBe(true);
      expect(tree.isEmpty).toBe(true);
    });

    it('should clear single element tree', () => {
      tree.insert(5);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
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

    it('should return element at index 0', () => {
      tree.insert(5);
      expect(tree.select(0)).toBe(5);
    });

    it('should clone single element', () => {
      tree.insert(5);
      const clone = tree.clone();
      expect(clone.size).toBe(1);
      expect(clone.has(5)).toBe(true);
    });

    it('should support spread operator', () => {
      tree.insert(5);
      const arr = [...tree];
      expect(arr).toEqual([5]);
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

    it('should maintain order after inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      expect(tree.toArray()).toEqual([1, 3, 5, 7]);
    });

    it('should insert negative numbers', () => {
      tree.insert(-3);
      tree.insert(-1);
      tree.insert(-2);
      expect(tree.toArray()).toEqual([-3, -2, -1]);
    });
  });

  describe('Delete operations', () => {
    it('should delete element from middle', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(2)).toBe(true);
      expect(tree.size).toBe(2);
    });

    it('should delete min element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(1)).toBe(true);
      expect(tree.min()).toBe(2);
    });

    it('should delete max element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(3)).toBe(true);
      expect(tree.max()).toBe(2);
    });

    it('should return false when deleting non-existent element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(10)).toBe(false);
      expect(tree.size).toBe(3);
    });

    it('should delete all elements one by one', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(1)).toBe(true);
      expect(tree.delete(2)).toBe(true);
      expect(tree.delete(3)).toBe(true);
      expect(tree.isEmpty).toBe(true);
    });

    it('should not find element after delete', () => {
      tree.insert(5);
      tree.delete(5);
      expect(tree.has(5)).toBe(false);
    });

    it('should find remaining elements after delete', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.delete(2);
      expect(tree.has(1)).toBe(true);
      expect(tree.has(3)).toBe(true);
    });

    it('should maintain correct structure after multiple deletes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      tree.delete(5);
      tree.delete(7);
      expect(tree.has(5)).toBe(false);
      expect(tree.has(7)).toBe(false);
      expect(tree.has(6)).toBe(true);
      expect(tree.has(8)).toBe(true);
    });
  });

  describe('Has/Contains operations', () => {
    it('should return true for has when element exists', () => {
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
    });

    it('should return false for has when element does not exist', () => {
      tree.insert(5);
      expect(tree.has(10)).toBe(false);
    });

    it('should return true for contains when element exists', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should return false for contains when element does not exist', () => {
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });

    it('should find element after duplicate insert', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
      expect(tree.contains(5)).toBe(true);
    });
  });

  describe('Size operations', () => {
    it('should report correct size after inserts', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
        expect(tree.size).toBe(i + 1);
      }
    });

    it('should report correct size using count()', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      expect(tree.count()).toBe(10);
    });

    it('should report correct size after deletes', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      tree.delete(5);
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
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false after insert', () => {
      tree.insert(1);
      expect(tree.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      tree.insert(1);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('Clear operation', () => {
    it('should clear all elements', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow inserts after clear', () => {
      tree.insert(1);
      tree.clear();
      tree.insert(2);
      expect(tree.has(2)).toBe(true);
      expect(tree.size).toBe(1);
    });
  });

  describe('Min/First operation', () => {
    it('should return correct min after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
    });

    it('should return correct first after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.first()).toBe(3);
    });

    it('should return correct min after delete', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.delete(1);
      expect(tree.min()).toBe(2);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined();
      expect(tree.first()).toBeUndefined();
    });

    it('should return min without duplicates', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(5);
      expect(tree.min()).toBe(3);
    });
  });

  describe('Max/Last operation', () => {
    it('should return correct max after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.max()).toBe(7);
    });

    it('should return correct last after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.last()).toBe(7);
    });

    it('should return correct max after delete', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.delete(3);
      expect(tree.max()).toBe(2);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined();
      expect(tree.last()).toBeUndefined();
    });

    it('should return max without duplicates', () => {
      tree.insert(5);
      tree.insert(7);
      tree.insert(5);
      expect(tree.max()).toBe(7);
    });
  });

  describe('ToArray operations', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
      expect(tree.toArraySorted()).toEqual([]);
    });

    it('should return sorted array', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      expect(tree.toArray()).toEqual([1, 2, 3]);
      expect(tree.toArraySorted()).toEqual([1, 2, 3]);
    });

    it('should work with many elements', () => {
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      values.forEach(v => tree.insert(v));
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(tree.toArraySorted()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return new array on each call', () => {
      tree.insert(1);
      const arr1 = tree.toArray();
      const arr2 = tree.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not include duplicates', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
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

    it('should pass tree to callback', () => {
      tree.insert(1);
      tree.insert(2);
      const trees: PlayTree<number>[] = [];
      tree.forEach((_, t) => trees.push(t));
      expect(trees.length).toBe(2);
      expect(trees[0]).toBe(tree);
      expect(trees[1]).toBe(tree);
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

    it('should not include duplicates', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      const values: number[] = [];
      tree.forEach((v) => values.push(v));
      expect(values).toEqual([1, 2]);
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

    it('should not include duplicates in iteration', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([1, 2, 3]);
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
      expect(tree.has(3)).toBe(false);
      expect(clone.has(3)).toBe(true);
    });

    it('should clone without duplicates', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      const clone = tree.clone();
      expect(clone.size).toBe(2);
      expect(clone.toArray()).toEqual([1, 2]);
    });
  });

  describe('FromArray static method', () => {
    it('should create tree from array', () => {
      const result = PlayTree.fromArray([1, 2, 3]);
      expect(result.size).toBe(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should create tree from unsorted array', () => {
      const result = PlayTree.fromArray([5, 3, 7, 1, 9]);
      expect(result.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should create empty tree from empty array', () => {
      const result = PlayTree.fromArray([]);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('should create tree without duplicates', () => {
      const result = PlayTree.fromArray([1, 2, 2, 3]);
      expect(result.size).toBe(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should accept custom comparator', () => {
      const result = PlayTree.fromArray([1, 2, 3], { comparator: (a, b) => b - a });
      expect(result.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('LowerBound operation', () => {
    it('should return element when exact match exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(3)).toBe(3);
    });

    it('should return first element >= value when no exact match', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(4)).toBe(5);
    });

    it('should return min when value below all elements', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.lowerBound(2)).toBe(3);
    });

    it('should return undefined when value above all elements', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(10)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.lowerBound(5)).toBeUndefined();
    });

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(3);
      tree.insert(5);
      expect(tree.lowerBound(3)).toBe(3);
    });
  });

  describe('UpperBound operation', () => {
    it('should return first element > value when exact match exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(3)).toBe(5);
    });

    it('should return first element > value when no exact match', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(4)).toBe(5);
    });

    it('should return min when value below all elements', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.upperBound(2)).toBe(3);
    });

    it('should return undefined when value above all elements', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(10)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.upperBound(5)).toBeUndefined();
    });

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(3)).toBe(5);
    });

    it('should return undefined when value is max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.upperBound(5)).toBeUndefined();
    });
  });

  describe('Predecessor operation', () => {
    it('should return element < value when element exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(3)).toBe(1);
    });

    it('should return element < value when no exact match', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(4)).toBe(3);
    });

    it('should return undefined when value at or below min', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.predecessor(3)).toBeUndefined();
      expect(tree.predecessor(2)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.predecessor(5)).toBeUndefined();
    });

    it('should return max when value above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(10)).toBe(5);
    });

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(3);
      tree.insert(5);
      expect(tree.predecessor(3)).toBe(1);
    });
  });

  describe('Successor operation', () => {
    it('should return element > value when element exists', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(3)).toBe(5);
    });

    it('should return element > value when no exact match', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(4)).toBe(5);
    });

    it('should return undefined when value at or above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(5)).toBeUndefined();
      expect(tree.successor(6)).toBeUndefined();
    });

    it('should return undefined for empty tree', () => {
      expect(tree.successor(5)).toBeUndefined();
    });

    it('should return min when value below min', () => {
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      expect(tree.successor(2)).toBe(3);
    });

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(3);
      tree.insert(5);
      expect(tree.successor(3)).toBe(5);
    });
  });

  describe('Rank operation', () => {
    it('should return correct rank for element', () => {
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

    it('should return count of elements less than value when not found', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.rank(4)).toBe(2);
    });

    it('should return 0 for value below min', () => {
      tree.insert(3);
      tree.insert(5);
      expect(tree.rank(1)).toBe(0);
    });

    it('should return size for value above max', () => {
      tree.insert(1);
      tree.insert(3);
      tree.insert(5);
      expect(tree.rank(10)).toBe(3);
    });

    it('should return 0 for empty tree', () => {
      expect(tree.rank(5)).toBe(0);
    });

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      expect(tree.rank(2)).toBe(1);
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

    it('should work without duplicates', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      expect(tree.select(1)).toBe(2);
      expect(tree.select(2)).toBe(3);
    });
  });

  describe('Split operation', () => {
    it('should split tree at value', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      const [left, right] = tree.split(5);
      expect(left.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(right.toArray()).toEqual([6, 7, 8, 9, 10]);
    });

    it('should split tree at non-existent value', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      const [left, right] = tree.split(5.5);
      expect(left.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(right.toArray()).toEqual([6, 7, 8, 9, 10]);
    });

    it('should split empty tree', () => {
      const [left, right] = tree.split(5);
      expect(left.size).toBe(0);
      expect(right.size).toBe(0);
    });

    it('should split with all elements in left', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const [left, right] = tree.split(10);
      expect(left.toArray()).toEqual([1, 2, 3]);
      expect(right.size).toBe(0);
    });

    it('should split with all elements in right', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const [left, right] = tree.split(0);
      expect(left.size).toBe(0);
      expect(right.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify original tree', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const originalSize = tree.size;
      tree.split(2);
      expect(tree.size).toBe(originalSize);
    });

    it('should not have duplicates in split', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      const [left, right] = tree.split(2);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3]);
    });
  });

  describe('Merge operation', () => {
    it('should merge two non-overlapping trees', () => {
      const other = new PlayTree<number>();
      tree.insert(1);
      tree.insert(2);
      other.insert(3);
      other.insert(4);
      tree.merge(other);
      expect(tree.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should merge two overlapping trees', () => {
      const other = new PlayTree<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      other.insert(2);
      other.insert(3);
      other.insert(4);
      tree.merge(other);
      expect(tree.size).toBe(4);
    });

    it('should merge with empty tree', () => {
      tree.insert(1);
      tree.insert(2);
      const other = new PlayTree<number>();
      tree.merge(other);
      expect(tree.toArray()).toEqual([1, 2]);
    });

    it('should merge empty tree with non-empty tree', () => {
      const other = new PlayTree<number>();
      other.insert(1);
      other.insert(2);
      tree.merge(other);
      expect(tree.toArray()).toEqual([1, 2]);
    });

    it('should not modify other tree during merge', () => {
      const other = new PlayTree<number>();
      other.insert(1);
      other.insert(2);
      const otherSize = other.size;
      tree.merge(other);
      expect(other.size).toBe(otherSize);
    });

    it('should merge without duplicates', () => {
      const other = new PlayTree<number>();
      tree.insert(1);
      tree.insert(2);
      other.insert(2);
      other.insert(3);
      tree.merge(other);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('RangeQuery operation', () => {
    it('should return values in range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.rangeQuery(3, 7)).toEqual([3, 4, 5, 6, 7]);
    });

    it('should return empty array when no values in range', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i);
      }
      expect(tree.rangeQuery(10, 20)).toEqual([]);
    });

    it('should handle range at boundaries', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.rangeQuery(5, 5)).toEqual([5]);
    });

    it('should return all values when range covers all', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i);
      }
      expect(tree.rangeQuery(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return empty array for empty tree', () => {
      expect(tree.rangeQuery(1, 10)).toEqual([]);
    });

    it('should not include duplicates in range', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      tree.insert(3);
      expect(tree.rangeQuery(1, 3)).toEqual([1, 2, 3]);
    });
  });

  describe('Depth operation', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.depth()).toBe(0);
    });

    it('should return 1 for single element', () => {
      tree.insert(5);
      expect(tree.depth()).toBe(1);
    });

    it('should return depth for multiple elements', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.depth()).toBeGreaterThan(1);
    });

    it('should handle many elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.depth()).toBeGreaterThan(1);
    });

    it('should return 0 after clear', () => {
      tree.insert(1);
      tree.insert(2);
      tree.clear();
      expect(tree.depth()).toBe(0);
    });
  });

  describe('Custom comparator', () => {
    it('should work with reverse comparator', () => {
      const revTree = new PlayTree<number>({ comparator: (a, b) => b - a });
      revTree.insert(1);
      revTree.insert(2);
      revTree.insert(3);
      expect(revTree.toArray()).toEqual([3, 2, 1]);
    });

    it('should work with string comparator', () => {
      const strTree = new PlayTree<string>({ comparator: (a, b) => a.localeCompare(b) });
      strTree.insert('banana');
      strTree.insert('apple');
      strTree.insert('cherry');
      expect(strTree.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should clone with custom comparator', () => {
      const revTree = new PlayTree<number>({ comparator: (a, b) => b - a });
      revTree.insert(1);
      revTree.insert(2);
      const clone = revTree.clone();
      expect(clone.toArray()).toEqual([2, 1]);
    });

    it('should work with object comparator', () => {
      interface Person {
        id: number;
        name: string;
      }
      const personTree = new PlayTree<Person>({ comparator: (a, b) => a.id - b.id });
      personTree.insert({ id: 2, name: 'Bob' });
      personTree.insert({ id: 1, name: 'Alice' });
      personTree.insert({ id: 3, name: 'Charlie' });
      expect(personTree.size).toBe(3);
      expect(personTree.min()).toEqual({ id: 1, name: 'Alice' });
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
        expect(tree.has(i)).toBe(true);
      }
    });

    it('should delete all elements from large tree', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.isEmpty).toBe(true);
    });

    it('should handle large dataset', () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
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
      tree.delete(5);
      tree.insert(1);
      tree.insert(9);
      tree.delete(3);
      expect(tree.toArray()).toEqual([1, 7, 9]);
    });

    it('should allow inserting after delete', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.delete(2);
      tree.insert(4);
      expect(tree.size).toBe(3);
      expect(tree.has(4)).toBe(true);
    });

    it('should handle repeated insert and delete', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
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

    it('should handle rank at boundaries', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.rank(1)).toBe(0);
      expect(tree.rank(5)).toBe(1);
      expect(tree.rank(10)).toBe(2);
    });

    it('should handle range with single element', () => {
      tree.insert(5);
      expect(tree.rangeQuery(5, 5)).toEqual([5]);
    });

    it('should handle lower and upper with exact match', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.lowerBound(5)).toBe(5);
      expect(tree.upperBound(5)).toBe(10);
    });

    it('should handle predecessor and successor with exact match', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      expect(tree.predecessor(5)).toBe(1);
      expect(tree.successor(5)).toBe(10);
    });

    it('should handle same value for split', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      const [left, right] = tree.split(5);
      expect(left.toArray()).toEqual([1, 5]);
      expect(right.toArray()).toEqual([10]);
    });
  });
});