import { describe, it, expect } from 'vitest';
import { SpatialHash2 } from '../src/core/spatial-hash-2/index.js';

describe('SpatialHash2', () => {
  describe('constructor', () => {
    it('creates empty hash with cell size', () => {
      const hash = new SpatialHash2<number>(10);
      expect(hash.size).toBe(0);
    });

    it('throws on non-positive cell size', () => {
      expect(() => new SpatialHash2<number>(0)).toThrow('cellSize must be positive');
      expect(() => new SpatialHash2<number>(-5)).toThrow('cellSize must be positive');
    });
  });

  describe('insert', () => {
    it('inserts single entry', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      expect(hash.size).toBe(1);
      expect(hash.has('a')).toBe(true);
    });

    it('inserts multiple entries', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 5);
      hash.insert('c', 5, 15);
      expect(hash.size).toBe(3);
      expect(hash.has('a')).toBe(true);
      expect(hash.has('b')).toBe(true);
      expect(hash.has('c')).toBe(true);
    });

    it('inserts entries with values', () => {
      const hash = new SpatialHash2<{ data: string }>(10);
      hash.insert('a', 5, 5, { data: 'test' });
      const result = hash.query(5, 5, 1);
      expect(result.length).toBe(1);
      expect(result[0]!.value).toEqual({ data: 'test' });
    });

    it('replaces existing entry with same id', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5, 1);
      hash.insert('a', 15, 15, 2);
      expect(hash.size).toBe(1);
      const result = hash.query(15, 15, 1);
      expect(result.length).toBe(1);
      expect(result[0]!.value).toBe(2);
    });
  });

  describe('query', () => {
    it('queries by radius', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 0, 0);
      hash.insert('b', 5, 0);
      hash.insert('c', 10, 0);
      hash.insert('d', 0, 5);

      const result = hash.query(5, 0, 6);
      expect(result.length).toBe(3);
      const ids = result.map((e) => e.id).sort();
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('returns empty array for no matches', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 100, 100);
      const result = hash.query(0, 0, 5);
      expect(result.length).toBe(0);
    });

    it('queries across cell boundaries', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 4, 4);
      hash.insert('b', 6, 4);
      hash.insert('c', 4, 6);
      hash.insert('d', 6, 6);

      const result = hash.query(5, 5, 3);
      expect(result.length).toBe(4);
    });
  });

  describe('queryCell', () => {
    it('queries entries in specific cell', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 5);
      hash.insert('c', 5, 15);
      hash.insert('d', 15, 15);

      const result = hash.queryCell(0, 0);
      expect(result.length).toBe(1);
      expect(result[0]!.id).toBe('a');
    });

    it('returns empty array for empty cell', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      const result = hash.queryCell(10, 10);
      expect(result.length).toBe(0);
    });

    it('queries entries from different cells', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 5);

      const cell0 = hash.queryCell(0, 0);
      expect(cell0.length).toBe(1);
      expect(cell0[0]!.id).toBe('a');

      const cell1 = hash.queryCell(1, 0);
      expect(cell1.length).toBe(1);
      expect(cell1[0]!.id).toBe('b');
    });
  });

  describe('remove', () => {
    it('removes existing entry', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 15);
      const removed = hash.remove('a');
      expect(removed).toBe(true);
      expect(hash.size).toBe(1);
      expect(hash.has('a')).toBe(false);
      expect(hash.has('b')).toBe(true);
    });

    it('returns false for non-existent entry', () => {
      const hash = new SpatialHash2<number>(10);
      const removed = hash.remove('a');
      expect(removed).toBe(false);
      expect(hash.size).toBe(0);
    });

    it('cleans up empty cells', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.remove('a');
      const result = hash.queryCell(0, 0);
      expect(result.length).toBe(0);
    });
  });

  describe('update', () => {
    it('updates position of existing entry', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      const updated = hash.update('a', 15, 15);
      expect(updated).toBe(true);

      const oldCell = hash.queryCell(0, 0);
      expect(oldCell.length).toBe(0);

      const newCell = hash.queryCell(1, 1);
      expect(newCell.length).toBe(1);
      expect(newCell[0]!.id).toBe('a');
    });

    it('returns false for non-existent entry', () => {
      const hash = new SpatialHash2<number>(10);
      const updated = hash.update('a', 15, 15);
      expect(updated).toBe(false);
    });

    it('handles update within same cell', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      const updated = hash.update('a', 8, 8);
      expect(updated).toBe(true);

      const cell = hash.queryCell(0, 0);
      expect(cell.length).toBe(1);
      expect(cell[0]!.id).toBe('a');
      expect(cell[0]!.x).toBe(8);
      expect(cell[0]!.y).toBe(8);
    });
  });

  describe('size', () => {
    it('returns 0 for empty hash', () => {
      const hash = new SpatialHash2<number>(10);
      expect(hash.size).toBe(0);
    });

    it('returns correct count after insertions', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 15);
      hash.insert('c', 25, 25);
      expect(hash.size).toBe(3);
    });

    it('updates after removal', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 15);
      hash.remove('a');
      expect(hash.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('clears all entries', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 15, 15);
      hash.insert('c', 25, 25);

      hash.clear();

      expect(hash.size).toBe(0);
      expect(hash.has('a')).toBe(false);
      expect(hash.has('b')).toBe(false);
      expect(hash.has('c')).toBe(false);

      const result = hash.query(10, 10, 20);
      expect(result.length).toBe(0);
    });

    it('handles insert after clear', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.clear();
      hash.insert('b', 15, 15);
      expect(hash.size).toBe(1);
      expect(hash.has('b')).toBe(true);
    });

    it('handles update position', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('item', 5, 5);
      hash.update('item', 25, 25);
      const near5 = hash.query(5, 5, 5);
      expect(near5.length).toBe(0);
      const near25 = hash.query(25, 25, 5);
      expect(near25.length).toBe(1);
    });

    it('handles remove non-existent', () => {
      const hash = new SpatialHash2<number>(10);
      expect(hash.remove('nonexistent')).toBe(false);
      expect(hash.size).toBe(0);
    });
  });

  describe('additional coverage', () => {
    it('should handle negative coordinates', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', -5, -5);
      expect(hash.has('a')).toBe(true);
      const result = hash.query(-5, -5, 2);
      expect(result).toHaveLength(1);
    });

    it('should handle zero radius query', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      const result = hash.query(5, 5, 0);
      expect(result).toHaveLength(1);
    });

    it('should handle large cell size', () => {
      const hash = new SpatialHash2<number>(1000);
      hash.insert('a', 5, 5);
      hash.insert('b', 500, 500);
      expect(hash.size).toBe(2);
      const result = hash.query(5, 5, 10);
      expect(result).toHaveLength(1);
    });

    it('should handle remove then re-insert', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.remove('a');
      hash.insert('a', 10, 10);
      expect(hash.has('a')).toBe(true);
      const result = hash.query(10, 10, 2);
      expect(result).toHaveLength(1);
    });

    it('should handle update to same position', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.update('a', 5, 5);
      expect(hash.size).toBe(1);
      const result = hash.query(5, 5, 2);
      expect(result).toHaveLength(1);
    });

    it('should handle remove on non-existent key', () => {
      const hash = new SpatialHash2<number>(10);
      hash.remove('nonexistent');
      expect(hash.size).toBe(0);
    });

    it('should handle query returning nothing', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 100, 100);
      const result = hash.query(0, 0, 5);
      expect(result).toHaveLength(0);
    });

    it('should handle has check', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 50, 50);
      expect(hash.has('a')).toBe(true);
      expect(hash.has('b')).toBe(false);
    });

    it('should handle remove', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 50, 50);
      expect(hash.remove('a')).toBe(true);
      expect(hash.has('a')).toBe(false);
    });

    it('should track size and handle clear', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 50, 50);
      hash.insert('b', 60, 60);
      expect(hash.size).toBe(2);
      hash.clear();
      expect(hash.size).toBe(0);
    });

    it('should handle query in empty hash', () => {
      const hash = new SpatialHash2<number>(10);
      const results = hash.query(45, 45, 55, 55);
      expect(results).toEqual([]);
    });

    it('should handle multiple inserts and removes', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 50, 50);
      hash.insert('b', 60, 60);
      hash.insert('c', 70, 70);
      expect(hash.size).toBe(3);
      hash.remove('b');
      expect(hash.size).toBe(2);
      expect(hash.has('b')).toBe(false);
    });

    it('should handle clear', () => {
      const hash = new SpatialHash2<{x: number; y: number}>();
      hash.insert('a', {x: 0, y: 0});
      hash.insert('b', {x: 10, y: 10});
      hash.clear();
      expect(hash.size).toBe(0);
    });

    it('should handle update', () => {
      const hash = new SpatialHash2<{x: number; y: number}>();
      hash.insert('a', 0, 0);
      hash.update('a', 10, 10);
      expect(hash.has('a')).toBe(true);
    });

    it('should handle query', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 50, 50);
      const results = hash.query(5, 5, 10);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle remove', () => {
      const hash = new SpatialHash2<number>(10);
      hash.insert('a', 5, 5);
      hash.insert('b', 10, 10);
      expect(hash.remove('a')).toBe(true);
      expect(hash.has('a')).toBe(false);
      expect(hash.size).toBe(1);
    });
  });

  it('should handle clear', () => {
    const hash = new SpatialHash2<number>(10);
    hash.insert('a', 5, 5);
    hash.insert('b', 10, 10);
    hash.clear();
    expect(hash.size).toBe(0);
  });
  it('should handle remove', () => {
    const hash = new SpatialHash2<string>(10);
    hash.insert('a', 5, 5);
    expect(hash.remove('a')).toBe(true);
    expect(hash.remove('a')).toBe(false);
  });
});
