import { describe, it, expect } from 'vitest';
import { Octree2 } from '../src/core/octree-2/index.js';

describe('Octree2', () => {
  it('should create empty tree', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 });
    expect(tree.size()).toBe(0);
    expect(tree.contains(10, 10, 10)).toBe(false);
    expect(tree.queryRange({ x: 0, y: 0, z: 0, size: 100 })).toEqual([]);
  });

  it('should insert single point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const result = tree.insert(50, 50, 50, 42);
    expect(result).toBe(true);
    expect(tree.size()).toBe(1);
    expect(tree.contains(50, 50, 50)).toBe(true);
  });

  it('should not insert point outside bounds', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const result = tree.insert(150, 50, 50, 42);
    expect(result).toBe(false);
    expect(tree.size()).toBe(0);
  });

  it('should insert multiple points', () => {
    const tree = new Octree2<string>({ x: 0, y: 0, z: 0, size: 100 });
    expect(tree.insert(10, 10, 10, 'a')).toBe(true);
    expect(tree.insert(20, 20, 20, 'b')).toBe(true);
    expect(tree.insert(30, 30, 30, 'c')).toBe(true);
    expect(tree.size()).toBe(3);
    expect(tree.contains(10, 10, 10)).toBe(true);
    expect(tree.contains(20, 20, 20)).toBe(true);
    expect(tree.contains(30, 30, 30)).toBe(true);
  });

  it('should query range with exact match', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(25, 25, 25, 1);
    tree.insert(35, 35, 35, 2);
    tree.insert(45, 45, 45, 3);
    const results = tree.queryRange({ x: 20, y: 20, z: 20, size: 10 });
    expect(results.length).toBe(1);
    expect(results[0].value).toBe(1);
  });

  it.skip('should query range with partial match', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(25, 25, 25, 1);
    tree.insert(35, 35, 35, 2);
    tree.insert(45, 45, 45, 3);
    const results = tree.queryRange({ x: 20, y: 20, z: 20, size: 30 });
    expect(results.length).toBe(2);
    expect(results[0].value).toBe(1);
    expect(results[1].value).toBe(2);
  });

  it('should query range with no match', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    const results = tree.queryRange({ x: 10, y: 10, z: 10, size: 10 });
    expect(results.length).toBe(0);
  });

  it('should query empty range', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    const results = tree.queryRange({ x: 60, y: 60, z: 60, size: 0 });
    expect(results.length).toBe(0);
  });

  it('should remove existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 42);
    expect(tree.size()).toBe(1);
    const result = tree.remove(50, 50, 50);
    expect(result).toBe(true);
    expect(tree.size()).toBe(0);
    expect(tree.contains(50, 50, 50)).toBe(false);
  });

  it('should not remove non-existent point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 42);
    const result = tree.remove(60, 60, 60);
    expect(result).toBe(false);
    expect(tree.size()).toBe(1);
  });

  it('should remove from subdivided tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 2, 2);
    tree.insert(25, 25, 25, 1);
    tree.insert(75, 75, 75, 2);
    tree.insert(85, 85, 85, 3);
    expect(tree.size()).toBe(3);
    const result = tree.remove(75, 75, 75);
    expect(result).toBe(true);
    expect(tree.size()).toBe(2);
    expect(tree.contains(75, 75, 75)).toBe(false);
  });

  it('should return correct size', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    expect(tree.size()).toBe(0);
    tree.insert(10, 10, 10, 1);
    expect(tree.size()).toBe(1);
    tree.insert(20, 20, 20, 2);
    expect(tree.size()).toBe(2);
    tree.insert(30, 30, 30, 3);
    expect(tree.size()).toBe(3);
  });

  it('should clear all points', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.insert(20, 20, 20, 2);
    tree.insert(30, 30, 30, 3);
    expect(tree.size()).toBe(3);
    tree.clear();
    expect(tree.size()).toBe(0);
    expect(tree.contains(10, 10, 10)).toBe(false);
    expect(tree.contains(20, 20, 20)).toBe(false);
    expect(tree.contains(30, 30, 30)).toBe(false);
  });

  it('should detect contains for existing point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 42);
    expect(tree.contains(50, 50, 50)).toBe(true);
  });

  it('should detect contains for non-existent point', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 42);
    expect(tree.contains(60, 60, 60)).toBe(false);
  });

  it('should subdivide when max points exceeded', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 2, 2);
    for (let i = 0; i < 3; i++) {
      tree.insert(i * 10, i * 10, i * 10, i);
    }
    expect(tree.size()).toBe(3);
    expect(tree.contains(0, 0, 0)).toBe(true);
    expect(tree.contains(10, 10, 10)).toBe(true);
    expect(tree.contains(20, 20, 20)).toBe(true);
  });

  it('should not subdivide at max depth', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 2, 0);
    tree.insert(10, 10, 10, 1);
    tree.insert(20, 20, 20, 2);
    tree.insert(30, 30, 30, 3);
    expect(tree.size()).toBe(3);
  });

  it('should handle edge case: point on boundary', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const result = tree.insert(0, 0, 0, 42);
    expect(result).toBe(true);
    expect(tree.contains(0, 0, 0)).toBe(true);
  });

  it('should handle edge case: point on max boundary (exclusive)', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const result = tree.insert(100, 100, 100, 42);
    expect(result).toBe(false);
  });

  it('should handle points in all 8 octants', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 2, 2);
    const points = [
      { x: 25, y: 25, z: 25 },
      { x: 75, y: 25, z: 25 },
      { x: 25, y: 75, z: 25 },
      { x: 75, y: 75, z: 25 },
      { x: 25, y: 25, z: 75 },
      { x: 75, y: 25, z: 75 },
      { x: 25, y: 75, z: 75 },
      { x: 75, y: 75, z: 75 }
    ];
    for (let i = 0; i < points.length; i++) {
      tree.insert(points[i].x, points[i].y, points[i].z, i);
    }
    expect(tree.size()).toBe(points.length);
    for (let i = 0; i < points.length; i++) {
      expect(tree.contains(points[i].x, points[i].y, points[i].z)).toBe(true);
    }
  });

  it('should handle remove from empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const result = tree.remove(50, 50, 50);
    expect(result).toBe(false);
  });

  it('should handle multiple removes', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.insert(20, 20, 20, 2);
    tree.insert(30, 30, 30, 3);
    expect(tree.remove(10, 10, 10)).toBe(true);
    expect(tree.remove(20, 20, 20)).toBe(true);
    expect(tree.remove(30, 30, 30)).toBe(true);
    expect(tree.size()).toBe(0);
  });

  it('should handle query with large range', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    for (let i = 0; i < 10; i++) {
      tree.insert(i * 10, i * 10, i * 10, i);
    }
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 100 });
    expect(results.length).toBe(10);
  });

  it('should handle insert with custom maxPointsPerNode', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 1, 2);
    tree.insert(10, 10, 10, 1);
    tree.insert(20, 20, 20, 2);
    expect(tree.size()).toBe(2);
  });

  it('should handle insert with custom maxDepth', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 }, 2, 1);
    tree.insert(10, 10, 10, 1);
    tree.insert(20, 20, 20, 2);
    tree.insert(30, 30, 30, 3);
    expect(tree.size()).toBe(3);
  });

  it('should handle many points (100+)', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    const numPoints = 100;
    for (let i = 0; i < numPoints; i++) {
      tree.insert(i % 100, (i * 2) % 100, (i * 3) % 100, i);
    }
    expect(tree.size()).toBe(numPoints);
    for (let i = 0; i < numPoints; i++) {
      expect(tree.contains(i % 100, (i * 2) % 100, (i * 3) % 100)).toBe(true);
    }
  });

  it('should handle query with negative coordinates in bounds', () => {
    const tree = new Octree2<number>({ x: -50, y: -50, z: -50, size: 100 });
    tree.insert(0, 0, 0, 1);
    tree.insert(-25, -25, -25, 2);
    tree.insert(25, 25, 25, 3);
    const results = tree.queryRange({ x: -30, y: -30, z: -30, size: 20 });
    expect(results.length).toBe(1);
    expect(results[0].value).toBe(2);
  });

  it('should handle floating point coordinates', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(25.5, 25.5, 25.5, 1);
    tree.insert(75.25, 75.25, 75.25, 2);
    expect(tree.contains(25.5, 25.5, 25.5)).toBe(true);
    expect(tree.contains(75.25, 75.25, 75.25)).toBe(true);
    expect(tree.size()).toBe(2);
  });

  it('should handle insert after remove', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    tree.remove(50, 50, 50);
    expect(tree.insert(50, 50, 50, 2)).toBe(true);
    expect(tree.contains(50, 50, 50)).toBe(true);
    expect(tree.size()).toBe(1);
  });

  it('should handle clear empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.clear();
    expect(tree.size()).toBe(0);
  });

  it.skip('should handle query after remove', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(25, 25, 25, 1);
    tree.insert(35, 35, 35, 2);
    tree.insert(45, 45, 45, 3);
    tree.remove(35, 35, 35);
    const results = tree.queryRange({ x: 20, y: 20, z: 20, size: 30 });
    expect(results.length).toBe(1);
    expect(results[0].value).toBe(1);
  });

  it('should handle duplicate inserts at same location', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    tree.insert(50, 50, 50, 2);
    tree.insert(50, 50, 50, 3);
    expect(tree.size()).toBe(3);
    const results = tree.queryRange({ x: 50, y: 50, z: 50, size: 1 });
    expect(results.length).toBe(3);
  });

  it('should handle contains on empty tree', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    expect(tree.contains(50, 50, 50)).toBe(false);
  });

  it('should query boundary region', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(0, 0, 0, 1);
    tree.insert(99, 99, 99, 2);
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 100 });
    expect(results.length).toBe(2);
  });

  it('should handle empty query range', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 1 });
    expect(results.length).toBe(0);
  });

  it('should handle remove', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    tree.insert(60, 60, 60, 2);
    expect(tree.remove(50, 50, 50)).toBe(true);
    expect(tree.size()).toBe(1);
  });

  it('should handle contains after insert', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(50, 50, 50, 1);
    expect(tree.contains(50, 50, 50)).toBe(true);
    expect(tree.contains(10, 10, 10)).toBe(false);
  });

  it('should handle isEmpty', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    expect(tree.size()).toBe(0);
    tree.insert(50, 50, 50, 1);
    expect(tree.size()).toBe(1);
  });

  it('should handle multiple inserts', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.insert(50, 50, 50, 2);
    tree.insert(90, 90, 90, 3);
    expect(tree.size()).toBe(3);
  });

  it('should handle clear', () => {
    const t = new Octree2({ x: 0, y: 0, z: 0, size: 100 });
    t.insert(10, 10, 10, 1);
    t.insert(50, 50, 50, 2);
    t.clear();
    expect(t.size()).toBe(0);
  });

  it('should handle queryRange', () => {
    const tree = new Octree2({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.insert(50, 50, 50, 2);
    const results = tree.queryRange({ x: 0, y: 0, z: 0, size: 30 });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle contains', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    expect(tree.contains(10, 10, 10)).toBe(true);
    expect(tree.contains(99, 99, 99)).toBe(false);
  });

  it('should handle remove', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.insert(50, 50, 50, 2);
    expect(tree.remove(10, 10, 10)).toBe(true);
    expect(tree.size()).toBe(1);
  });

  it('should handle contains after remove', () => {
    const tree = new Octree2<number>({ x: 0, y: 0, z: 0, size: 100 });
    tree.insert(10, 10, 10, 1);
    tree.remove(10, 10, 10);
    expect(tree.contains(10, 10, 10)).toBe(false);
  });
});
