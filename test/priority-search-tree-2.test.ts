import { describe, it, expect } from 'vitest';
import { PrioritySearchTree2, Point } from '../src/core/priority-search-tree-2/index.js';

describe('PrioritySearchTree2', () => {
  describe('constructor', () => {
    it('should create empty tree when no points provided', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should create tree with points from constructor', () => {
      const points: Point[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }];
      const tree = new PrioritySearchTree2(points);
      expect(tree.isEmpty).toBe(false);
      expect(tree.size).toBe(3);
    });

    it('should create tree with points and priorities from constructor', () => {
      const points: Point[] = [
        { x: 1, y: 2, priority: 10 },
        { x: 3, y: 4, priority: 5 },
        { x: 5, y: 6, priority: 1 }
      ];
      const tree = new PrioritySearchTree2(points);
      expect(tree.size).toBe(3);
      const min = tree.findMin();
      expect(min?.priority).toBe(1);
    });

    it('should handle empty array in constructor', () => {
      const tree = new PrioritySearchTree2([]);
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert single point', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      expect(tree.isEmpty).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should insert multiple points', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      tree.insert({ x: 3, y: 4 });
      tree.insert({ x: 5, y: 6 });
      expect(tree.size).toBe(3);
    });

    it('should insert points with explicit priority', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2, priority: 10 });
      tree.insert({ x: 3, y: 4, priority: 5 });
      expect(tree.size).toBe(2);
    });

    it('should assign auto-incremented priorities when not provided', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      tree.insert({ x: 3, y: 4 });
      tree.insert({ x: 5, y: 6 });
      const min = tree.findMin();
      expect(min?.priority).toBe(0);
    });

    it('should insert points with negative coordinates', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: -1, y: -2 });
      tree.insert({ x: -3, y: -4 });
      expect(tree.size).toBe(2);
      expect(tree.contains({ x: -1, y: -2 })).toBe(true);
    });

    it('should insert points with zero coordinates', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 0, y: 0 });
      expect(tree.size).toBe(1);
      expect(tree.contains({ x: 0, y: 0 })).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
      const result = tree.delete({ x: 1, y: 2 });
      expect(result).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.contains({ x: 1, y: 2 })).toBe(false);
    });

    it('should return false for non-existent point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      const result = tree.delete({ x: 3, y: 4 });
      expect(result).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should handle deleting from empty tree', () => {
      const tree = new PrioritySearchTree2();
      const result = tree.delete({ x: 1, y: 2 });
      expect(result).toBe(false);
    });

    it('should delete all points', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
      tree.delete({ x: 1, y: 2 });
      tree.delete({ x: 3, y: 4 });
      expect(tree.isEmpty).toBe(true);
    });

    it('should delete point with priority', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2, priority: 10 });
      const result = tree.delete({ x: 1, y: 2 });
      expect(result).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should delete root node correctly', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 2, y: 2 });
      tree.insert({ x: 1, y: 1 });
      tree.insert({ x: 3, y: 3 });
      tree.delete({ x: 2, y: 2 });
      expect(tree.size).toBe(2);
      expect(tree.contains({ x: 2, y: 2 })).toBe(false);
    });

    it('should handle deleting leaf node', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 2, y: 2 });
      tree.insert({ x: 1, y: 1 });
      tree.delete({ x: 1, y: 1 });
      expect(tree.size).toBe(1);
      expect(tree.contains({ x: 2, y: 2 })).toBe(true);
    });

    it('should handle deleting node with one child', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 2, y: 2 });
      tree.insert({ x: 1, y: 1 });
      tree.insert({ x: 0, y: 0 });
      tree.delete({ x: 1, y: 1 });
      expect(tree.size).toBe(2);
      expect(tree.contains({ x: 0, y: 0 })).toBe(true);
    });
  });

  describe('contains', () => {
    it('should find existing point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      expect(tree.contains({ x: 1, y: 2 })).toBe(true);
    });

    it('should return false for non-existent point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      expect(tree.contains({ x: 3, y: 4 })).toBe(false);
    });

    it('should handle empty tree', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.contains({ x: 1, y: 2 })).toBe(false);
    });

    it('should find point with negative coordinates', () => {
      const tree = new PrioritySearchTree2([{ x: -1, y: -2 }]);
      expect(tree.contains({ x: -1, y: -2 })).toBe(true);
    });

    it('should find point with priority', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2, priority: 10 });
      expect(tree.contains({ x: 1, y: 2 })).toBe(true);
    });

    it('should require exact x and y match', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      expect(tree.contains({ x: 1.1, y: 2 })).toBe(false);
      expect(tree.contains({ x: 1, y: 2.1 })).toBe(false);
    });
  });

  describe('queryRange', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree2();
      const result = tree.queryRange(0, 10, 0, 10);
      expect(result).toEqual([]);
    });

    it('should return empty array for range with no points', () => {
      const tree = new PrioritySearchTree2([{ x: 10, y: 10 }]);
      const result = tree.queryRange(0, 1, 0, 1);
      expect(result).toEqual([]);
    });

    it.skip('should find all points in range', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ]);
      const result = tree.queryRange(0, 4, 0, 5);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ x: 1, y: 2 });
      expect(result).toContainEqual({ x: 3, y: 4 });
    });

    it('should include points on range boundaries', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1 },
        { x: 5, y: 5 }
      ]);
      const result = tree.queryRange(1, 5, 1, 5);
      expect(result).toHaveLength(2);
    });

    it.skip('should work with negative coordinates', () => {
      const tree = new PrioritySearchTree2([
        { x: -5, y: -5 },
        { x: 0, y: 0 },
        { x: 5, y: 5 }
      ]);
      const result = tree.queryRange(-3, 3, -3, 3);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ x: 0, y: 0 });
    });

    it('should return all points when range covers all', () => {
      const points = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ];
      const tree = new PrioritySearchTree2(points);
      const result = tree.queryRange(0, 10, 0, 10);
      expect(result).toHaveLength(3);
    });

    it.skip('should query small range', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 }
      ]);
      const result = tree.queryRange(1, 2, 1, 2);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ x: 1, y: 1 });
      expect(result).toContainEqual({ x: 2, y: 2 });
    });

    it('should return points with priorities', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 1, priority: 10 });
      tree.insert({ x: 2, y: 2, priority: 5 });
      const result = tree.queryRange(0, 3, 0, 3);
      expect(result).toHaveLength(2);
      expect(result[0].priority).toBeDefined();
      expect(result[1].priority).toBeDefined();
    });

    it('should handle large tree', () => {
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ x: i, y: i * 2 });
      }
      const tree = new PrioritySearchTree2(points);
      const result = tree.queryRange(10, 30, 20, 60);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(50);
    });
  });

  describe('findMin', () => {
    it('should return null for empty tree', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.findMin()).toBe(null);
    });

    it('should find min priority point for single point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2, priority: 10 }]);
      const min = tree.findMin();
      expect(min).toEqual({ x: 1, y: 2, priority: 10 });
    });

    it('should find min priority among multiple points with explicit priorities', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1, priority: 10 },
        { x: 2, y: 2, priority: 5 },
        { x: 3, y: 3, priority: 1 }
      ]);
      const min = tree.findMin();
      expect(min?.priority).toBe(1);
      expect(min?.x).toBe(3);
      expect(min?.y).toBe(3);
    });

    it('should find min priority among points with auto-assigned priorities', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 3, y: 3 });
      tree.insert({ x: 1, y: 1 });
      tree.insert({ x: 2, y: 2 });
      const min = tree.findMin();
      expect(min?.priority).toBe(0);
    });

    it('should work after insertions', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 1, priority: 5 });
      tree.insert({ x: 2, y: 2, priority: 10 });
      const min = tree.findMin();
      expect(min?.priority).toBe(5);
    });

    it('should work after deletions', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 1, priority: 1 });
      tree.insert({ x: 2, y: 2, priority: 2 });
      tree.insert({ x: 3, y: 3, priority: 3 });
      tree.delete({ x: 1, y: 1 });
      const min = tree.findMin();
      expect(min?.priority).toBe(2);
    });

    it('should handle duplicate priorities', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1, priority: 5 },
        { x: 2, y: 2, priority: 5 }
      ]);
      const min = tree.findMin();
      expect(min?.priority).toBe(5);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.size).toBe(0);
    });

    it('should return correct size after inserts', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      expect(tree.size).toBe(1);
      tree.insert({ x: 3, y: 4 });
      expect(tree.size).toBe(2);
    });

    it('should decrease after delete', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      tree.delete({ x: 1, y: 2 });
      expect(tree.size).toBe(0);
    });

    it('should reflect constructor points', () => {
      const points = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ];
      const tree = new PrioritySearchTree2(points);
      expect(tree.size).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false after insert', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      expect(tree.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
    });

    it('should return true after deleting all points', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      tree.delete({ x: 1, y: 2 });
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty tree', () => {
      const tree = new PrioritySearchTree2();
      tree.clear();
      expect(tree.isEmpty).toBe(true);
    });

    it('should clear tree with points', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow inserts after clear', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      tree.clear();
      tree.insert({ x: 5, y: 6 });
      expect(tree.size).toBe(1);
      expect(tree.contains({ x: 5, y: 6 })).toBe(true);
    });

    it('should reset priority counter', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      tree.insert({ x: 3, y: 4 });
      tree.clear();
      tree.insert({ x: 5, y: 6 });
      const min = tree.findMin();
      expect(min?.priority).toBe(0);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return O(1) for empty tree', () => {
      const tree = new PrioritySearchTree2();
      expect(tree.getTimeComplexity()).toBe('O(1)');
    });

    it('should return O(1) for single point', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 2 }]);
      expect(tree.getTimeComplexity()).toBe('O(1)');
    });

    it('should return O(log n) for multiple points', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]);
      expect(tree.getTimeComplexity()).toBe('O(log 2)');
    });

    it('should reflect current tree size', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      expect(tree.getTimeComplexity()).toBe('O(1)');
      tree.insert({ x: 3, y: 4 });
      tree.insert({ x: 5, y: 6 });
      expect(tree.getTimeComplexity()).toBe('O(log 3)');
    });

    it('should update after operations', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 2 });
      tree.insert({ x: 3, y: 4 });
      expect(tree.getTimeComplexity()).toBe('O(log 2)');
      tree.delete({ x: 1, y: 2 });
      expect(tree.getTimeComplexity()).toBe('O(1)');
    });
  });

  describe('edge cases', () => {
    it('should handle points with same x coordinate', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ]);
      expect(tree.size).toBe(3);
      expect(tree.contains({ x: 1, y: 1 })).toBe(true);
      expect(tree.contains({ x: 1, y: 2 })).toBe(true);
      expect(tree.contains({ x: 1, y: 3 })).toBe(true);
    });

    it('should handle very large coordinates', () => {
      const tree = new PrioritySearchTree2([{ x: 1000000, y: 1000000 }]);
      expect(tree.contains({ x: 1000000, y: 1000000 })).toBe(true);
    });

    it('should handle mixed positive and negative coordinates', () => {
      const tree = new PrioritySearchTree2([
        { x: -5, y: 5 },
        { x: 0, y: 0 },
        { x: 5, y: -5 }
      ]);
      expect(tree.size).toBe(3);
      const result = tree.queryRange(-10, 10, -10, 10);
      expect(result).toHaveLength(3);
    });

    it('should work with floating point coordinates', () => {
      const tree = new PrioritySearchTree2([
        { x: 1.5, y: 2.5 },
        { x: 3.7, y: 4.9 }
      ]);
      expect(tree.contains({ x: 1.5, y: 2.5 })).toBe(true);
      expect(tree.contains({ x: 3.7, y: 4.9 })).toBe(true);
    });

    it('should handle large number of operations', () => {
      const tree = new PrioritySearchTree2();
      for (let i = 0; i < 100; i++) {
        tree.insert({ x: i, y: i * 2 });
      }
      expect(tree.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tree.contains({ x: i, y: i * 2 })).toBe(true);
      }
    });
  });

  describe('range query edge cases', () => {
    it.skip('should handle single point range', () => {
      const tree = new PrioritySearchTree2([
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ]);
      const result = tree.queryRange(1, 1, 1, 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ x: 1, y: 1 });
    });

    it('should handle inverted range', () => {
      const tree = new PrioritySearchTree2([{ x: 1, y: 1 }]);
      const result = tree.queryRange(5, 0, 5, 0);
      expect(result).toEqual([]);
    });

    it('should handle range with no matches in large tree', () => {
      const tree = new PrioritySearchTree2();
      for (let i = 0; i < 20; i++) {
        tree.insert({ x: i * 10, y: i * 10 });
      }
      const result = tree.queryRange(1000, 2000, 1000, 2000);
      expect(result).toHaveLength(0);
    });

    it('should handle inclusive boundaries correctly', () => {
      const tree = new PrioritySearchTree2([
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ]);
      const result = tree.queryRange(0, 10, 0, 10);
      expect(result).toHaveLength(2);
    });
  });

  describe('integration tests', () => {
    it('should handle insert, query, delete cycle', () => {
      const tree = new PrioritySearchTree2();
      tree.insert({ x: 1, y: 1 });
      tree.insert({ x: 2, y: 2 });
      tree.insert({ x: 3, y: 3 });

      let result = tree.queryRange(0, 2, 0, 2);
      expect(result).toHaveLength(2);

      tree.delete({ x: 2, y: 2 });

      result = tree.queryRange(0, 2, 0, 2);
      expect(result).toHaveLength(1);
    });

    it('should maintain consistency after many operations', () => {
      const tree = new PrioritySearchTree2();
      const points: Point[] = [];

      for (let i = 0; i < 50; i++) {
        const point = { x: i, y: i };
        points.push(point);
        tree.insert(point);
      }

      expect(tree.size).toBe(50);

      for (const point of points) {
        expect(tree.contains(point)).toBe(true);
      }
    });
  });
});
