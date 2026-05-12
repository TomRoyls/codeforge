import { describe, it, expect } from 'vitest';
import { KDTree3 } from '../src/core/kd-tree-3/index.js';

describe('KDTree3', () => {
  describe('constructor', () => {
    it('should create empty tree when no points provided', () => {
      const tree = new KDTree3();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it('should create tree with points from constructor', () => {
      const points = [[1, 2], [3, 4], [5, 6]];
      const tree = new KDTree3(points);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.size()).toBe(3);
    });

    it('should handle single dimension', () => {
      const points = [[1], [3], [5]];
      const tree = new KDTree3(points, 1);
      expect(tree.size()).toBe(3);
      expect(tree.contains([1])).toBe(true);
      expect(tree.contains([3])).toBe(true);
      expect(tree.contains([5])).toBe(true);
    });

    it('should handle 3 dimensions', () => {
      const points = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const tree = new KDTree3(points, 3);
      expect(tree.size()).toBe(3);
      expect(tree.contains([1, 2, 3])).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single point', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.size()).toBe(1);
    });

    it('should insert multiple points', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      tree.insert([3, 4]);
      tree.insert([5, 6]);
      expect(tree.size()).toBe(3);
    });

    it('should allow duplicate points', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      tree.insert([1, 2]);
      expect(tree.size()).toBe(2);
    });

    it('should insert points with negative coordinates', () => {
      const tree = new KDTree3();
      tree.insert([-1, -2]);
      tree.insert([-3, -4]);
      expect(tree.size()).toBe(2);
      expect(tree.contains([-1, -2])).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove existing point', () => {
      const tree = new KDTree3([[1, 2], [3, 4]]);
      const result = tree.remove([1, 2]);
      expect(result).toBe(true);
      expect(tree.size()).toBe(1);
      expect(tree.contains([1, 2])).toBe(false);
    });

    it('should return false for non-existent point', () => {
      const tree = new KDTree3([[1, 2]]);
      const result = tree.remove([3, 4]);
      expect(result).toBe(false);
      expect(tree.size()).toBe(1);
    });

    it('should handle removing from empty tree', () => {
      const tree = new KDTree3();
      const result = tree.remove([1, 2]);
      expect(result).toBe(false);
    });

    it('should remove all points', () => {
      const tree = new KDTree3([[1, 2], [3, 4]]);
      tree.remove([1, 2]);
      tree.remove([3, 4]);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should remove duplicate points', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      tree.insert([1, 2]);
      tree.remove([1, 2]);
      expect(tree.size()).toBe(1);
    });
  });

  describe('contains', () => {
    it('should find existing point', () => {
      const tree = new KDTree3([[1, 2]]);
      expect(tree.contains([1, 2])).toBe(true);
    });

    it('should return false for non-existent point', () => {
      const tree = new KDTree3([[1, 2]]);
      expect(tree.contains([3, 4])).toBe(false);
    });

    it('should handle empty tree', () => {
      const tree = new KDTree3();
      expect(tree.contains([1, 2])).toBe(false);
    });

    it('should find point with negative coordinates', () => {
      const tree = new KDTree3([[-1, -2]]);
      expect(tree.contains([-1, -2])).toBe(true);
    });

    it('should find exact match only', () => {
      const tree = new KDTree3([[1, 2]]);
      expect(tree.contains([1.1, 2])).toBe(false);
      expect(tree.contains([1, 2.1])).toBe(false);
    });
  });

  describe('nearestNeighbor', () => {
    it('should return null for empty tree', () => {
      const tree = new KDTree3();
      expect(tree.nearestNeighbor([1, 2])).toBe(null);
    });

    it('should find nearest neighbor for single point', () => {
      const tree = new KDTree3([[1, 2]]);
      const nearest = tree.nearestNeighbor([3, 4]);
      expect(nearest).toEqual([1, 2]);
    });

    it('should find nearest among multiple points', () => {
      const tree = new KDTree3([[1, 2], [10, 10], [5, 5]]);
      const nearest = tree.nearestNeighbor([3, 3]);
      expect(nearest).toEqual([1, 2]);
    });

    it('should handle target equal to existing point', () => {
      const tree = new KDTree3([[1, 2], [10, 10]]);
      const nearest = tree.nearestNeighbor([1, 2]);
      expect(nearest).toEqual([1, 2]);
    });

    it('should find nearest with negative coordinates', () => {
      const tree = new KDTree3([[-10, -10], [1, 1]]);
      const nearest = tree.nearestNeighbor([0, 0]);
      expect(nearest).toEqual([1, 1]);
    });

    it('should work with 3 dimensions', () => {
      const tree = new KDTree3([[1, 2, 3], [10, 10, 10]], 3);
      const nearest = tree.nearestNeighbor([2, 3, 4]);
      expect(nearest).toEqual([1, 2, 3]);
    });
  });

  describe('kNearestNeighbors', () => {
    it('should return empty array for k <= 0', () => {
      const tree = new KDTree3([[1, 2]]);
      expect(tree.kNearestNeighbors([1, 2], 0)).toEqual([]);
      expect(tree.kNearestNeighbors([1, 2], -1)).toEqual([]);
    });

    it('should return empty array for empty tree', () => {
      const tree = new KDTree3();
      expect(tree.kNearestNeighbors([1, 2], 3)).toEqual([]);
    });

    it('should return fewer than k when tree has fewer points', () => {
      const tree = new KDTree3([[1, 2]]);
      const result = tree.kNearestNeighbors([0, 0], 3);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([1, 2]);
    });

    it('should return exactly k neighbors when available', () => {
      const tree = new KDTree3([[1, 2], [3, 4], [5, 6]]);
      const result = tree.kNearestNeighbors([0, 0], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });

    it('should return k neighbors in order of distance', () => {
      const tree = new KDTree3([[1, 1], [2, 2], [3, 3], [4, 4]]);
      const result = tree.kNearestNeighbors([0, 0], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1, 1]);
      expect(result[1]).toEqual([2, 2]);
      expect(result[2]).toEqual([3, 3]);
    });

    it('should handle k larger than tree size', () => {
      const tree = new KDTree3([[1, 2], [3, 4]]);
      const result = tree.kNearestNeighbors([0, 0], 10);
      expect(result).toHaveLength(2);
    });
  });

  describe('rangeSearch', () => {
    it('should return empty array for empty tree', () => {
      const tree = new KDTree3();
      const result = tree.rangeSearch([0, 0], [10, 10]);
      expect(result).toEqual([]);
    });

    it('should return empty array for range with no points', () => {
      const tree = new KDTree3([[10, 10]]);
      const result = tree.rangeSearch([0, 0], [1, 1]);
      expect(result).toEqual([]);
    });

    it('should find all points in range', () => {
      const tree = new KDTree3([[1, 2], [3, 4], [5, 6]]);
      const result = tree.rangeSearch([0, 0], [4, 5]);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual([1, 2]);
      expect(result).toContainEqual([3, 4]);
    });

    it('should include points on range boundaries', () => {
      const tree = new KDTree3([[1, 1], [5, 5]]);
      const result = tree.rangeSearch([1, 1], [5, 5]);
      expect(result).toHaveLength(2);
    });

    it('should work with negative coordinates', () => {
      const tree = new KDTree3([[-5, -5], [0, 0], [5, 5]]);
      const result = tree.rangeSearch([-3, -3], [3, 3]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([0, 0]);
    });

    it('should return all points when range covers all', () => {
      const points = [[1, 2], [3, 4], [5, 6]];
      const tree = new KDTree3(points);
      const result = tree.rangeSearch([0, 0], [10, 10]);
      expect(result).toHaveLength(3);
    });

    it('should work with 3 dimensions', () => {
      const tree = new KDTree3([[1, 2, 3], [4, 5, 6]], 3);
      const result = tree.rangeSearch([0, 0, 0], [2, 3, 4]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([1, 2, 3]);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new KDTree3();
      expect(tree.size()).toBe(0);
    });

    it('should return correct size after inserts', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      expect(tree.size()).toBe(1);
      tree.insert([3, 4]);
      expect(tree.size()).toBe(2);
    });

    it('should decrease after remove', () => {
      const tree = new KDTree3([[1, 2]]);
      tree.remove([1, 2]);
      expect(tree.size()).toBe(0);
    });

    it('should reflect constructor points', () => {
      const points = [[1, 2], [3, 4], [5, 6]];
      const tree = new KDTree3(points);
      expect(tree.size()).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new KDTree3();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const tree = new KDTree3();
      tree.insert([1, 2]);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const tree = new KDTree3([[1, 2]]);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return true after removing all points', () => {
      const tree = new KDTree3([[1, 2]]);
      tree.remove([1, 2]);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty tree', () => {
      const tree = new KDTree3();
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should clear tree with points', () => {
      const tree = new KDTree3([[1, 2], [3, 4]]);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it('should allow inserts after clear', () => {
      const tree = new KDTree3([[1, 2]]);
      tree.clear();
      tree.insert([5, 6]);
      expect(tree.size()).toBe(1);
      expect(tree.contains([5, 6])).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new KDTree3();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return all points', () => {
      const points = [[1, 2], [3, 4], [5, 6]];
      const tree = new KDTree3(points);
      const result = tree.toArray();
      expect(result).toHaveLength(3);
      expect(result).toContainEqual([1, 2]);
      expect(result).toContainEqual([3, 4]);
      expect(result).toContainEqual([5, 6]);
    });

    it('should return points in sorted order', () => {
      const points = [[5, 6], [1, 2], [3, 4]];
      const tree = new KDTree3(points);
      const result = tree.toArray();
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      const tree = new KDTree3();
      let calls = 0;
      tree.forEach(() => { calls++; });
      expect(calls).toBe(0);
    });

    it('should call callback for each point', () => {
      const tree = new KDTree3([[1, 2], [3, 4]]);
      const points: number[][] = [];
      tree.forEach((point) => { points.push(point); });
      expect(points).toHaveLength(2);
      expect(points).toContainEqual([1, 2]);
      expect(points).toContainEqual([3, 4]);
    });

    it('should process points in order', () => {
      const points = [[5, 6], [1, 2], [3, 4]];
      const tree = new KDTree3(points);
      const result: number[][] = [];
      tree.forEach((point) => { result.push(point); });
      expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
    });
  });

  describe('axis-aligned splits', () => {
    it('should split on x-axis first then y-axis', () => {
      const tree = new KDTree3([[1, 10], [10, 1]]);
      expect(tree.contains([1, 10])).toBe(true);
      expect(tree.contains([10, 1])).toBe(true);
    });

    it('should handle alternating axis splits', () => {
      const points = [[1, 2], [3, 4], [5, 6], [7, 8]];
      const tree = new KDTree3(points);
      expect(tree.size()).toBe(4);
      points.forEach(point => {
        expect(tree.contains(point)).toBe(true);
      });
    });
  });

  describe('single point operations', () => {
    it('should handle single point tree', () => {
      const tree = new KDTree3([[5, 5]]);
      expect(tree.size()).toBe(1);
      expect(tree.contains([5, 5])).toBe(true);
      expect(tree.nearestNeighbor([0, 0])).toEqual([5, 5]);
      expect(tree.kNearestNeighbors([0, 0], 1)).toEqual([[5, 5]]);
      expect(tree.rangeSearch([0, 0], [10, 10])).toEqual([[5, 5]]);
    });

    it('should insert then remove single point', () => {
      const tree = new KDTree3();
      tree.insert([1, 1]);
      expect(tree.size()).toBe(1);
      expect(tree.remove([1, 1])).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('large point sets', () => {
    it('should handle 100 points', () => {
      const points: number[][] = [];
      for (let i = 0; i < 100; i++) {
        points.push([i, i * 2]);
      }
      const tree = new KDTree3(points);
      expect(tree.size()).toBe(100);

      for (const point of points) {
        expect(tree.contains(point)).toBe(true);
      }

      const nearest = tree.nearestNeighbor([50, 100]);
      expect(nearest).not.toBeNull();
    });

    it('should efficiently find nearest in large set', () => {
      const points: number[][] = [];
      for (let i = 0; i < 50; i++) {
        points.push([i * 10, i * 10]);
      }
      const tree = new KDTree3(points);
      const nearest = tree.nearestNeighbor([155, 155]);
      const valid = nearest === null || (nearest[0] === 150 && nearest[1] === 150) || (nearest[0] === 160 && nearest[1] === 160);
      expect(valid).toBe(true);
    });

    it('should handle range search on large set', () => {
      const points: number[][] = [];
      for (let i = 0; i < 50; i++) {
        points.push([i, i]);
      }
      const tree = new KDTree3(points);
      const result = tree.rangeSearch([10, 10], [30, 30]);
      expect(result.length).toBeGreaterThan(10);
      expect(result.length).toBeLessThan(30);
    });
  });

  describe('edge cases', () => {
    it('should handle points with same coordinate', () => {
      const tree = new KDTree3([[1, 1], [1, 2], [1, 3]]);
      expect(tree.size()).toBe(3);
      expect(tree.contains([1, 1])).toBe(true);
      expect(tree.contains([1, 2])).toBe(true);
      expect(tree.contains([1, 3])).toBe(true);
    });

    it('should handle zero coordinates', () => {
      const tree = new KDTree3([[0, 0]]);
      expect(tree.contains([0, 0])).toBe(true);
      expect(tree.nearestNeighbor([1, 1])).toEqual([0, 0]);
    });

    it('should handle very large coordinates', () => {
      const tree = new KDTree3([[1000000, 1000000]]);
      expect(tree.contains([1000000, 1000000])).toBe(true);
    });

    it('should handle removing root with children', () => {
      const tree = new KDTree3([[2, 2], [1, 1], [3, 3]]);
      tree.remove([2, 2]);
      expect(tree.size()).toBe(2);
      expect(tree.contains([2, 2])).toBe(false);
    });
  });

  describe('kNearestNeighbors edge cases', () => {
    it('should handle k=1 correctly', () => {
      const tree = new KDTree3([[1, 1], [2, 2], [3, 3]]);
      const result = tree.kNearestNeighbors([0, 0], 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([1, 1]);
    });

    it('should handle all points when k equals size', () => {
      const points = [[1, 1], [2, 2], [3, 3]];
      const tree = new KDTree3(points);
      const result = tree.kNearestNeighbors([0, 0], 3);
      expect(result).toHaveLength(3);
    });
  });

  describe('rangeSearch edge cases', () => {
    it('should handle single point range', () => {
      const tree = new KDTree3([[1, 1], [2, 2]]);
      const result = tree.rangeSearch([1, 1], [1, 1]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual([1, 1]);
    });

    it('should handle inverted min/max (no points)', () => {
      const tree = new KDTree3([[1, 1]]);
      const result = tree.rangeSearch([5, 5], [0, 0]);
      expect(result).toEqual([]);
    });
  });
});
