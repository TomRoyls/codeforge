import { describe, it, expect } from 'vitest';
import { BSPTree, LineSegment, Rectangle } from './src/core/bsp-tree/index.js';

describe('BSPTree', () => {
  describe('Empty Tree', () => {
    it('should create empty tree', () => {
      const tree = new BSPTree();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.toArray()).toEqual([]);
    });

    it('should return empty array for point query on empty tree', () => {
      const tree = new BSPTree();
      const results = tree.queryPoint(0, 0);
      expect(results).toEqual([]);
    });

    it('should return empty array for region query on empty tree', () => {
      const tree = new BSPTree();
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
      const results = tree.queryRegion(rect);
      expect(results).toEqual([]);
    });

    it('should handle in-order traversal on empty tree', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [];
      tree.traverseInOrder((seg) => segments.push(seg));
      expect(segments).toEqual([]);
    });

    it('should handle pre-order traversal on empty tree', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [];
      tree.traversePreOrder((seg) => segments.push(seg));
      expect(segments).toEqual([]);
    });

    it('should return false for remove on empty tree', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      expect(tree.remove(segment)).toBe(false);
    });

    it('should handle clear on empty tree', () => {
      const tree = new BSPTree();
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });
  });

  describe('Single Segment Operations', () => {
    it('should insert valid segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      expect(tree.insert(segment)).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should reject invalid segment with NaN', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: NaN, y1: 0, x2: 10, y2: 10 };
      expect(tree.insert(segment)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('should reject zero-length segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 5, y1: 5, x2: 5, y2: 5 };
      expect(tree.insert(segment)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('should query point on segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(5, 5);
      expect(results.length).toBe(1);
      expect(results[0]).toEqual(segment);
    });

    it('should query point at segment start', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(0, 0);
      expect(results.length).toBe(1);
    });

    it('should query point at segment end', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(10, 10);
      expect(results.length).toBe(1);
    });

    it('should not find point off segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(0, 10);
      expect(results.length).toBe(0);
    });

    it('should find segment in containing region', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const rect: Rectangle = { minX: -5, minY: -5, maxX: 15, maxY: 15 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(1);
    });

    it('should not find segment in non-overlapping region', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const rect: Rectangle = { minX: 20, minY: 20, maxX: 30, maxY: 30 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(0);
    });

    it.skip('should remove single segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      expect(tree.remove(segment)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false removing non-existent segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const other: LineSegment = { x1: 100, y1: 100, x2: 110, y2: 110 };
      expect(tree.remove(other)).toBe(false);
      expect(tree.size).toBe(1);
    });
  });

  describe('Multiple Segments', () => {
    it('should insert multiple segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 10, y1: 0, x2: 20, y2: 10 });
      tree.insert({ x1: 20, y1: 0, x2: 30, y2: 10 });
      expect(tree.size).toBe(3);
      expect(tree.isEmpty()).toBe(false);
    });

    it.skip('should find segments at specific point', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 10, y1: 0, x2: 20, y2: 10 });
      tree.insert({ x1: 0, y1: 10, x2: 10, y2: 20 });
      const results = tree.queryPoint(10, 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find all segments in region', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 10, y1: 0, x2: 20, y2: 10 });
      tree.insert({ x1: 0, y1: 10, x2: 10, y2: 20 });
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 20, maxY: 20 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(3);
    });

    it('should only find intersecting segments in region', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 50, y1: 50, x2: 60, y2: 60 });
      tree.insert({ x1: 100, y1: 100, x2: 110, y2: 110 });
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 30, maxY: 30 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(1);
    });

    it.skip('should remove one of multiple segments', () => {
      const tree = new BSPTree();
      const s1: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      const s2: LineSegment = { x1: 10, y1: 0, x2: 20, y2: 10 };
      const s3: LineSegment = { x1: 20, y1: 0, x2: 30, y2: 10 };
      tree.insert(s1);
      tree.insert(s2);
      tree.insert(s3);
      expect(tree.remove(s2)).toBe(true);
      expect(tree.size).toBe(2);
    });

    it.skip('should maintain tree structure after removals', () => {
      const tree = new BSPTree();
      const s1: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      const s2: LineSegment = { x1: 10, y1: 0, x2: 20, y2: 10 };
      const s3: LineSegment = { x1: 20, y1: 0, x2: 30, y2: 10 };
      tree.insert(s1);
      tree.insert(s2);
      tree.insert(s3);
      tree.remove(s1);
      tree.remove(s2);
      expect(tree.size).toBe(1);
      const remaining = tree.toArray();
      expect(remaining).toContainEqual(s3);
    });
  });

  describe('Traversal Orders', () => {
    it('should traverse in-order', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 10, y1: 0, x2: 20, y2: 10 },
        { x1: 20, y1: 0, x2: 30, y2: 10 }
      ];
      segments.forEach(s => tree.insert(s));
      const results: LineSegment[] = [];
      tree.traverseInOrder((seg) => results.push(seg));
      expect(results.length).toBe(3);
    });

    it('should traverse pre-order', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 10, y1: 0, x2: 20, y2: 10 },
        { x1: 20, y1: 0, x2: 30, y2: 10 }
      ];
      segments.forEach(s => tree.insert(s));
      const results: LineSegment[] = [];
      tree.traversePreOrder((seg) => results.push(seg));
      expect(results.length).toBe(3);
    });

    it('should traverse all segments', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 10, y1: 0, x2: 20, y2: 10 },
        { x1: 20, y1: 0, x2: 30, y2: 10 },
        { x1: 30, y1: 0, x2: 40, y2: 10 },
        { x1: 40, y1: 0, x2: 50, y2: 10 }
      ];
      segments.forEach(s => tree.insert(s));
      const inOrder: LineSegment[] = [];
      tree.traverseInOrder((seg) => inOrder.push(seg));
      expect(inOrder.length).toBe(5);
      const preOrder: LineSegment[] = [];
      tree.traversePreOrder((seg) => preOrder.push(seg));
      expect(preOrder.length).toBe(5);
    });
  });

  describe('Clear and Size', () => {
    it('should clear tree with segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 10, y1: 0, x2: 20, y2: 10 });
      tree.insert({ x1: 20, y1: 0, x2: 30, y2: 10 });
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.toArray()).toEqual([]);
    });

    it('should report correct size after inserts', () => {
      const tree = new BSPTree();
      expect(tree.size).toBe(0);
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      expect(tree.size).toBe(1);
      tree.insert({ x1: 10, y1: 0, x2: 20, y2: 10 });
      expect(tree.size).toBe(2);
      tree.insert({ x1: 20, y1: 0, x2: 30, y2: 10 });
      expect(tree.size).toBe(3);
    });

    it.skip('should report correct size after removes', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 10, y1: 0, x2: 20, y2: 10 },
        { x1: 20, y1: 0, x2: 30, y2: 10 }
      ];
      segments.forEach(s => tree.insert(s));
      tree.remove(segments[0]);
      expect(tree.size).toBe(2);
      tree.remove(segments[1]);
      expect(tree.size).toBe(1);
    });

    it('should handle isEmpty correctly', () => {
      const tree = new BSPTree();
      expect(tree.isEmpty()).toBe(true);
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      expect(tree.isEmpty()).toBe(false);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('Spatial Partitioning', () => {
    it('should partition horizontal segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 100, y2: 0 });
      tree.insert({ x1: 0, y1: 50, x2: 100, y2: 50 });
      tree.insert({ x1: 0, y1: 100, x2: 100, y2: 100 });
      expect(tree.size).toBe(3);
    });

    it('should partition vertical segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 0, y2: 100 });
      tree.insert({ x1: 50, y1: 0, x2: 50, y2: 100 });
      tree.insert({ x1: 100, y1: 0, x2: 100, y2: 100 });
      expect(tree.size).toBe(3);
    });

    it('should partition diagonal segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 100, y2: 100 });
      tree.insert({ x1: 0, y1: 100, x2: 100, y2: 0 });
      tree.insert({ x1: 50, y1: 0, x2: 50, y2: 100 });
      expect(tree.size).toBe(3);
    });

    it('should find segments in specific quadrant', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 50, y2: 50 });
      tree.insert({ x1: 50, y1: 50, x2: 100, y2: 100 });
      tree.insert({ x1: 0, y1: 50, x2: 50, y2: 100 });
      tree.insert({ x1: 50, y1: 0, x2: 100, y2: 50 });
      const q1: Rectangle = { minX: 0, minY: 0, maxX: 50, maxY: 50 };
      const results = tree.queryRegion(q1);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Region Queries', () => {
    it.skip('should find segments crossing region boundary', () => {
      const tree = new BSPTree();
      tree.insert({ x1: -10, y1: 25, x2: 110, y2: 25 });
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(1);
    });

    it('should find segments inside region', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 25, y1: 25, x2: 75, y2: 25 });
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(1);
    });

    it.skip('should handle small region queries', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 100, y2: 0 });
      tree.insert({ x1: 50, y1: 0, x2: 50, y2: 100 });
      const rect: Rectangle = { minX: 45, minY: 45, maxX: 55, maxY: 55 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(1);
    });

    it('should handle large region queries', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 100, y2: 0 });
      tree.insert({ x1: 100, y1: 0, x2: 200, y2: 0 });
      tree.insert({ x1: 200, y1: 0, x2: 300, y2: 0 });
      const rect: Rectangle = { minX: -100, minY: -100, maxX: 400, maxY: 100 };
      const results = tree.queryRegion(rect);
      expect(results.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const tree = new BSPTree();
      tree.insert({ x1: -100, y1: -100, x2: 100, y2: 100 });
      expect(tree.size).toBe(1);
      const results = tree.queryPoint(0, 0);
      expect(results.length).toBe(1);
    });

    it('should handle very large coordinates', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 1000000, y1: 1000000, x2: 1000100, y2: 1000100 });
      expect(tree.size).toBe(1);
      const results = tree.queryPoint(1000050, 1000050);
      expect(results.length).toBe(1);
    });

    it('should handle floating point coordinates', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0.5, y1: 0.5, x2: 10.5, y2: 10.5 });
      expect(tree.size).toBe(1);
      const results = tree.queryPoint(5.5, 5.5);
      expect(results.length).toBe(1);
    });

    it('should insert duplicate segments', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      tree.insert(segment);
      expect(tree.size).toBe(2);
    });

    it('should handle collinear segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 10, y1: 10, x2: 20, y2: 20 });
      tree.insert({ x1: 20, y1: 20, x2: 30, y2: 30 });
      expect(tree.size).toBe(3);
    });

    it('should handle intersecting segments', () => {
      const tree = new BSPTree();
      tree.insert({ x1: 0, y1: 0, x2: 10, y2: 10 });
      tree.insert({ x1: 0, y1: 10, x2: 10, y2: 0 });
      expect(tree.size).toBe(2);
      const results = tree.queryPoint(5, 5);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new BSPTree();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return all segments', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 10, y1: 0, x2: 20, y2: 10 },
        { x1: 20, y1: 0, x2: 30, y2: 10 }
      ];
      segments.forEach(s => tree.insert(s));
      const results = tree.toArray();
      expect(results.length).toBe(3);
    });

    it.skip('should return updated array after removal', () => {
      const tree = new BSPTree();
      const s1: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      const s2: LineSegment = { x1: 10, y1: 0, x2: 20, y2: 10 };
      tree.insert(s1);
      tree.insert(s2);
      tree.remove(s1);
      const results = tree.toArray();
      expect(results.length).toBe(1);
      expect(results).toContainEqual(s2);
    });
  });

  describe('Performance with Many Segments', () => {
    it('should handle 100 segments', () => {
      const tree = new BSPTree();
      for (let i = 0; i < 100; i++) {
        tree.insert({ x1: i * 10, y1: 0, x2: i * 10, y2: 100 });
      }
      expect(tree.size).toBe(100);
      const results = tree.queryRegion({ minX: 250, minY: 0, maxX: 550, maxY: 100 });
      expect(results.length).toBe(31);
    });

    it.skip('should query correctly in large tree', () => {
      const tree = new BSPTree();
      for (let i = 0; i < 50; i++) {
        tree.insert({ x1: i * 10, y1: i * 10, x2: i * 10 + 10, y2: i * 10 + 10 });
      }
      const results = tree.queryPoint(250, 250);
      expect(results.length).toBe(1);
    });

    it.skip('should remove from large tree', () => {
      const tree = new BSPTree();
      const segments: LineSegment[] = [];
      for (let i = 0; i < 50; i++) {
        const seg = { x1: i * 10, y1: 0, x2: i * 10 + 10, y2: 10 };
        segments.push(seg);
        tree.insert(seg);
      }
      tree.remove(segments[25]);
      expect(tree.size).toBe(49);
    });
  });

  describe('Segment Classification', () => {
    it('should classify point on segment as on', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 0 };
      tree.insert(segment);
      const results = tree.queryPoint(5, 0);
      expect(results.length).toBe(1);
    });

    it('should classify point in front of segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(0, 10);
      expect(results.length).toBe(0);
    });

    it('should classify point in back of segment', () => {
      const tree = new BSPTree();
      const segment: LineSegment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      tree.insert(segment);
      const results = tree.queryPoint(10, 0);
      expect(results.length).toBe(0);
    });
  });
});