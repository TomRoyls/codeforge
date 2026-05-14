import { describe, it, expect, beforeEach } from 'vitest';
import { CoverTree, euclideanDistance2D, manhattanDistance2D } from '../src/core/cover-tree/index.js';
import type { Point2D } from '../src/core/cover-tree/index.js';

describe('CoverTree', () => {
  let tree: CoverTree<number>;

  beforeEach(() => {
    tree = new CoverTree<number>();
  });

  describe('Empty tree', () => {
    it('should create empty tree', () => {
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should return undefined for findNearest on empty tree', () => {
      expect(tree.findNearest(5)).toBeUndefined();
    });

    it('should return empty array for findKNearest on empty tree', () => {
      expect(tree.findKNearest(5, 3)).toEqual([]);
    });

    it('should return false for contains on empty tree', () => {
      expect(tree.contains(5)).toBe(false);
    });

    it('should return false for remove on empty tree', () => {
      expect(tree.remove(5)).toBe(false);
    });

    it('should return empty array for toArray on empty tree', () => {
      expect(tree.toArray()).toEqual([]);
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
      expect(tree.isEmpty).toBe(false);
    });

    it('should add duplicate as separate node when distance is 0', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(2);
      expect(tree.contains(5)).toBe(true);
    });

    it('should find nearest as single element', () => {
      tree.insert(5);
      expect(tree.findNearest(5)).toBe(5);
      expect(tree.findNearest(10)).toBe(5);
    });

    it('should find k nearest correctly for k=1', () => {
      tree.insert(5);
      const result = tree.findKNearest(5, 1);
      expect(result).toEqual([5]);
    });

    it('should find k nearest correctly for k>1', () => {
      tree.insert(5);
      const result = tree.findKNearest(5, 2);
      expect(result).toEqual([5]);
    });

    it('should return true for contains of inserted element', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should return false for contains of non-existent element', () => {
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });

    it('should remove single element', () => {
      tree.insert(5);
      expect(tree.remove(5)).toBe(true);
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false when removing non-existent element', () => {
      tree.insert(5);
      expect(tree.remove(10)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should clear single element tree', () => {
      tree.insert(5);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should toArray with single element', () => {
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should iterate with for...of on single element', () => {
      tree.insert(5);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values).toEqual([5]);
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

    it('should handle many inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
    });

    it('should allow duplicate inserts with zero distance', () => {
      tree.insert(1);
      tree.insert(1);
      tree.insert(2);
      tree.insert(2);
      expect(tree.size).toBe(4);
    });
  });

  describe('FindNearest operation', () => {
    it('should find exact match', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.findNearest(2)).toBe(2);
    });

    it('should find nearest neighbor', () => {
      tree.insert(1);
      tree.insert(10);
      tree.insert(20);
      expect(tree.findNearest(5)).toBe(1);
    });

    it('should find nearest among multiple points', () => {
      tree.insert(0);
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      expect(tree.findNearest(15)).toBe(10);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.findNearest(5)).toBeUndefined();
    });

    it('should work with negative numbers', () => {
      tree.insert(-10);
      tree.insert(-5);
      tree.insert(0);
      tree.insert(5);
      tree.insert(10);
      expect(tree.findNearest(-7)).toBe(-5);
    });

    it('should handle floating point numbers', () => {
      tree.insert(1.5);
      tree.insert(2.5);
      tree.insert(3.5);
      expect(tree.findNearest(2.0)).toBe(1.5);
    });
  });

  describe('FindKNearest operation', () => {
    it('should return empty array for k <= 0', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.findKNearest(2, 0)).toEqual([]);
      expect(tree.findKNearest(2, -1)).toEqual([]);
    });

    it('should return single element for k=1', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const result = tree.findKNearest(2, 1);
      expect(result).toEqual([2]);
    });

    it('should return k nearest elements', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(10);
      tree.insert(15);
      tree.insert(20);
      const result = tree.findKNearest(12, 3);
      expect(result).toContain(10);
      expect(result).toContain(15);
      expect(result).toContain(5);
      expect(result.length).toBe(3);
    });

    it('should return all elements when k > size', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const result = tree.findKNearest(2, 10);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result.length).toBe(3);
    });

    it('should return empty array for empty tree', () => {
      expect(tree.findKNearest(5, 3)).toEqual([]);
    });

    it('should sort results by distance', () => {
      tree.insert(0);
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      tree.insert(40);
      const result = tree.findKNearest(25, 3);
      expect(result).toContain(20);
      expect(result).toContain(30);
      expect(result).toContain(10);
      expect(result.length).toBe(3);
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

    it('should return true for duplicates', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('should work with negative numbers', () => {
      tree.insert(-5);
      tree.insert(-10);
      tree.insert(0);
      expect(tree.contains(-5)).toBe(true);
      expect(tree.contains(-10)).toBe(true);
      expect(tree.contains(0)).toBe(true);
    });
  });

  describe('Remove operation', () => {
    it('should remove element', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.remove(2)).toBe(true);
      expect(tree.contains(2)).toBe(false);
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
      expect(tree.isEmpty).toBe(true);
    });

    it('should reinsert orphaned points after remove', () => {
      tree.insert(5);
      tree.insert(10);
      tree.insert(15);
      tree.insert(5);
      tree.insert(5);
      const sizeBefore = tree.size;
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(sizeBefore - 1);
      expect(tree.contains(10)).toBe(true);
    });

    it('should remove from empty tree', () => {
      expect(tree.remove(5)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('should handle removing duplicates', () => {
      tree.insert(5);
      tree.insert(5);
      tree.insert(10);
      expect(tree.remove(5)).toBe(true);
      expect(tree.contains(5)).toBe(true);
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

    it('should account for duplicates', () => {
      tree.insert(1);
      tree.insert(1);
      tree.insert(1);
      expect(tree.size).toBe(3);
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

    it('should return false after removing all elements', () => {
      tree.insert(1);
      tree.insert(2);
      tree.remove(1);
      tree.remove(2);
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

    it('should clear empty tree', () => {
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow inserts after clear', () => {
      tree.insert(1);
      tree.clear();
      tree.insert(2);
      expect(tree.contains(2)).toBe(true);
      expect(tree.size).toBe(1);
    });

    it('should handle duplicates before clear', () => {
      tree.insert(1);
      tree.insert(1);
      tree.insert(2);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.contains(1)).toBe(false);
    });
  });

  describe('ToArray operation', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
    });

    it('should return array with inserted elements', () => {
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      const result = tree.toArray();
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result.length).toBe(3);
    });

    it('should return array with duplicates', () => {
      tree.insert(1);
      tree.insert(1);
      tree.insert(2);
      const result = tree.toArray();
      expect(result.filter((v) => v === 1).length).toBe(2);
    });

    it('should return new array on each call', () => {
      tree.insert(1);
      const arr1 = tree.toArray();
      const arr2 = tree.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should work with large dataset', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      const result = tree.toArray();
      expect(result.length).toBe(100);
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
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values.length).toBe(3);
    });

    it('should iterate over empty tree', () => {
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
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
      expect(arr.length).toBe(3);
    });

    it('should work with Array.from', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      const result = Array.from(tree);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result.length).toBe(3);
    });

    it('should iterate over duplicates', () => {
      tree.insert(1);
      tree.insert(1);
      tree.insert(2);
      const values: number[] = [];
      for (const v of tree) {
        values.push(v);
      }
      expect(values.filter((v) => v === 1).length).toBe(2);
    });
  });

  describe('FromPoints static method', () => {
    it('should create tree from array', () => {
      const arr = [5, 3, 7, 1, 9];
      const newTree = CoverTree.fromPoints(arr);
      expect(newTree.size).toBe(5);
      expect(newTree.toArray()).toContain(5);
      expect(newTree.toArray()).toContain(3);
      expect(newTree.toArray()).toContain(7);
      expect(newTree.toArray()).toContain(1);
      expect(newTree.toArray()).toContain(9);
    });

    it('should create empty tree from empty array', () => {
      const newTree = CoverTree.fromPoints([]);
      expect(newTree.size).toBe(0);
      expect(newTree.toArray()).toEqual([]);
    });

    it('should handle duplicates in array', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      const newTree = CoverTree.fromPoints(arr);
      expect(newTree.size).toBe(6);
    });

    it('should accept custom distance function', () => {
      const points: Point2D[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 }
      ];
      const newTree = CoverTree.fromPoints(points, {
        distance: euclideanDistance2D
      });
      expect(newTree.size).toBe(3);
    });

    it('should accept custom base', () => {
      const newTree = CoverTree.fromPoints([1, 2, 3], {
        base: 3
      });
      expect(newTree.size).toBe(3);
    });
  });

  describe('Custom distance function', () => {
    it('should work with 2D points using euclidean distance', () => {
      const tree2D = new CoverTree<Point2D>({
        distance: euclideanDistance2D
      });
      tree2D.insert({ x: 0, y: 0 });
      tree2D.insert({ x: 10, y: 0 });
      tree2D.insert({ x: 0, y: 10 });

      const nearest = tree2D.findNearest({ x: 5, y: 5 });
      expect(nearest).toEqual({ x: 0, y: 0 });
    });

    it('should work with 2D points using manhattan distance', () => {
      const tree2D = new CoverTree<Point2D>({
        distance: manhattanDistance2D
      });
      tree2D.insert({ x: 0, y: 0 });
      tree2D.insert({ x: 10, y: 0 });
      tree2D.insert({ x: 0, y: 10 });

      const nearest = tree2D.findNearest({ x: 5, y: 5 });
      expect(nearest).toEqual({ x: 0, y: 0 });
    });

    it('should find k nearest with custom distance', () => {
      const tree2D = new CoverTree<Point2D>({
        distance: euclideanDistance2D
      });
      tree2D.insert({ x: 0, y: 0 });
      tree2D.insert({ x: 10, y: 0 });
      tree2D.insert({ x: 0, y: 10 });
      tree2D.insert({ x: 10, y: 10 });

      const result = tree2D.findKNearest({ x: 5, y: 5 }, 2);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Custom base', () => {
    it('should work with base 3', () => {
      const customTree = new CoverTree<number>({ base: 3 });
      customTree.insert(1);
      customTree.insert(10);
      customTree.insert(100);
      expect(customTree.size).toBe(3);
    });

    it('should work with base 4', () => {
      const customTree = new CoverTree<number>({ base: 4 });
      customTree.insert(1);
      customTree.insert(2);
      customTree.insert(3);
      expect(customTree.size).toBe(3);
    });
  });

  describe('Many elements', () => {
    it('should handle 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
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
      expect(tree.isEmpty).toBe(true);
    });

    it('should find nearest in large tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i * 10);
      }
      const nearest = tree.findNearest(250);
      expect(nearest).toBe(250);
    });

    it('should find k nearest in large tree', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      const result = tree.findKNearest(25, 5);
      expect(result.length).toBe(5);
      expect(result).toContain(25);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      tree.insert(-3);
      tree.insert(-1);
      tree.insert(-2);
      expect(tree.toArray()).toContain(-3);
      expect(tree.toArray()).toContain(-1);
      expect(tree.toArray()).toContain(-2);
      expect(tree.size).toBe(3);
    });

    it('should handle mixed positive and negative numbers', () => {
      tree.insert(-2);
      tree.insert(0);
      tree.insert(2);
      tree.insert(-1);
      tree.insert(1);
      expect(tree.size).toBe(5);
    });

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
    });

    it('should handle reverse insertions', () => {
      for (let i = 10; i >= 1; i--) {
        tree.insert(i);
      }
      expect(tree.size).toBe(10);
    });

    it('should handle floating point numbers', () => {
      tree.insert(1.5);
      tree.insert(2.7);
      tree.insert(3.14);
      expect(tree.size).toBe(3);
      expect(tree.contains(2.7)).toBe(true);
    });

    it('should handle zero', () => {
      tree.insert(0);
      tree.insert(-0);
      expect(tree.size).toBe(2);
    });

    it('should handle very large values', () => {
      tree.insert(Number.MAX_SAFE_INTEGER);
      tree.insert(Number.MIN_SAFE_INTEGER);
      expect(tree.size).toBe(2);
      expect(tree.contains(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(tree.contains(Number.MIN_SAFE_INTEGER)).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should handle mixed operations', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.remove(5);
      tree.insert(1);
      tree.insert(9);
      tree.remove(3);
      expect(tree.contains(1)).toBe(true);
      expect(tree.contains(7)).toBe(true);
      expect(tree.contains(9)).toBe(true);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(5)).toBe(false);
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
  });
});
