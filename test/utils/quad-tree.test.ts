import { describe, it, expect } from 'vitest';
import { QuadTree } from '../../src/utils/quad-tree.js';
import type { Point, Bounds } from '../../src/utils/quad-tree.js';

// ─── Empty Tree Operations ───

describe('QuadTree', () => {
  it('is empty on creation', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.size).toBe(0);
    expect(qt.isEmpty()).toBe(true);
    expect(qt.depth).toBe(0);
  });

  it('returns empty array from toArray on empty tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.toArray()).toEqual([]);
  });

  it('returns empty array from queryRange on empty tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })).toEqual([]);
  });

  it('returns undefined from nearestNeighbor on empty tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.nearestNeighbor({ x: 50, y: 50 })).toBeUndefined();
  });

  it('returns false for contains on empty tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.contains({ x: 50, y: 50 })).toBe(false);
  });

  // ─── Insert Operations ───

  it('inserts a single point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.insert({ x: 50, y: 50 })).toBe(true);
    expect(qt.size).toBe(1);
    expect(qt.isEmpty()).toBe(false);
  });

  it('rejects point outside bounds', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.insert({ x: 200, y: 200 })).toBe(false);
    expect(qt.size).toBe(0);
  });

  it('inserts multiple points', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    for (let i = 0; i < 10; i++) {
      qt.insert({ x: i * 10, y: i * 10 });
    }
    expect(qt.size).toBe(10);
  });

  it('subdivides when capacity exceeded', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 4);
    qt.insert({ x: 10, y: 90 });
    qt.insert({ x: 20, y: 80 });
    qt.insert({ x: 30, y: 70 });
    qt.insert({ x: 40, y: 60 });
    qt.insert({ x: 50, y: 50 });
    expect(qt.size).toBe(5);
    expect(qt.depth).toBeGreaterThan(0);
  });

  // ─── Contains Operations ───

  it('finds an existing point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 25, y: 75 });
    expect(qt.contains({ x: 25, y: 75 })).toBe(true);
  });

  it('does not find a non-existing point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 25, y: 75 });
    expect(qt.contains({ x: 99, y: 99 })).toBe(false);
  });

  // ─── Remove Operations ───

  it('removes an existing point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 25, y: 75 });
    expect(qt.remove({ x: 25, y: 75 })).toBe(true);
    expect(qt.size).toBe(0);
    expect(qt.contains({ x: 25, y: 75 })).toBe(false);
  });

  it('returns false when removing non-existing point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 25, y: 75 });
    expect(qt.remove({ x: 99, y: 99 })).toBe(false);
    expect(qt.size).toBe(1);
  });

  // ─── Range Query ───

  it('finds points in range query', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 10, y: 90 });
    qt.insert({ x: 50, y: 50 });
    qt.insert({ x: 90, y: 10 });

    const result = qt.queryRange({ x: 0, y: 40, width: 30, height: 60 });
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(10);
    expect(result[0].y).toBe(90);
  });

  it('returns empty for range with no results', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 50, y: 50 });
    const result = qt.queryRange({ x: 0, y: 0, width: 10, height: 10 });
    expect(result).toHaveLength(0);
  });

  // ─── Radius Query ───

  it('finds points within radius', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 50, y: 50 });
    qt.insert({ x: 52, y: 52 });
    qt.insert({ x: 90, y: 90 });

    const result = qt.queryRadius({ x: 50, y: 50 }, 5);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Nearest Neighbor ───

  it('finds nearest neighbor', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 10, y: 90 });
    qt.insert({ x: 50, y: 50 });
    qt.insert({ x: 90, y: 10 });

    const nn = qt.nearestNeighbor({ x: 48, y: 48 });
    expect(nn).toBeDefined();
    expect(nn!.x).toBe(50);
    expect(nn!.y).toBe(50);
  });

  // ─── Clear ───

  it('clears the tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 25, y: 75 });
    qt.insert({ x: 50, y: 50 });
    qt.clear();
    expect(qt.size).toBe(0);
    expect(qt.isEmpty()).toBe(true);
    expect(qt.depth).toBe(0);
  });

  // ─── toArray ───

  it('returns all points via toArray', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 10, y: 90 });
    qt.insert({ x: 50, y: 50 });
    qt.insert({ x: 90, y: 10 });
    expect(qt.toArray()).toHaveLength(3);
  });

  // ─── Large Dataset ───

  it('handles 200+ random points with correct queries', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 4);
    const points: Point[] = [];
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    };
    const rand = rng(42);

    for (let i = 0; i < 250; i++) {
      const p = { x: Math.floor(rand() * 1000), y: Math.floor(rand() * 1000) };
      points.push(p);
      qt.insert(p);
    }

    expect(qt.size).toBe(250);

    const allPoints = qt.toArray();
    expect(allPoints).toHaveLength(250);

    const range = qt.queryRange({ x: 200, y: 200, width: 200, height: 200 });
    const manual = points.filter(
      (p) => p.x >= 200 && p.x < 400 && p.y >= 200 && p.y < 400,
    );
    expect(range).toHaveLength(manual.length);

    const nn = qt.nearestNeighbor({ x: 500, y: 500 });
    expect(nn).toBeDefined();
  });

  // ─── Points at boundaries ───

  it('handles points at boundary edges', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    qt.insert({ x: 0, y: 0 });
    qt.insert({ x: 99, y: 0 });
    qt.insert({ x: 0, y: 99 });
    qt.insert({ x: 50, y: 50 });
    expect(qt.size).toBe(4);
    expect(qt.contains({ x: 0, y: 0 })).toBe(true);
    expect(qt.contains({ x: 99, y: 0 })).toBe(true);
  });

  // ─── Data attachment ───

  it('stores data with points', () => {
    const qt = new QuadTree<{ x: number; y: number; data?: string }>(
      { x: 0, y: 0, width: 100, height: 100 },
    );
    qt.insert({ x: 50, y: 50, data: 'center' });
    const result = qt.queryRange({ x: 0, y: 0, width: 100, height: 100 });
    expect(result[0].data).toBe('center');
  });
});
