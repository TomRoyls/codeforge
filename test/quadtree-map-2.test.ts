import { describe, it, expect } from 'vitest';
import { QuadTreeMap2 } from '../src/core/quadtree-map-2/index.js';

describe('QuadTreeMap2', () => {
  describe('empty tree', () => {
    it('should create empty tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      expect(tree.size()).toBe(0);
    });

    it('should query empty tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const results = tree.query({ x: 0, y: 0, width: 100, height: 100 });
      expect(results).toHaveLength(0);
    });

    it('should return false for contains on empty tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      expect(tree.contains(50, 50)).toBe(false);
    });

    it('should return false for remove on empty tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      expect(tree.remove(50, 50)).toBe(false);
    });
  });

  describe('insert single point', () => {
    it('should insert single point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(50, 50, 'value');
      expect(result).toBe(true);
      expect(tree.size()).toBe(1);
    });

    it('should find inserted point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'value');
      expect(tree.contains(50, 50)).toBe(true);
    });

    it('should reject point outside bounds', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(150, 150, 'value');
      expect(result).toBe(false);
      expect(tree.size()).toBe(0);
    });
  });

  describe('insert multiple points', () => {
    it('should insert multiple points', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.insert(20, 20, 'b');
      tree.insert(30, 30, 'c');
      tree.insert(40, 40, 'd');
      expect(tree.size()).toBe(4);
    });

    it('should find all inserted points', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.insert(20, 20, 'b');
      tree.insert(30, 30, 'c');
      expect(tree.contains(10, 10)).toBe(true);
      expect(tree.contains(20, 20)).toBe(true);
      expect(tree.contains(30, 30)).toBe(true);
    });

    it('should handle duplicate insertions', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'first');
      tree.insert(50, 50, 'second');
      expect(tree.size()).toBe(2);
    });
  });

  describe('query region', () => {
    beforeEach(() => {
      this.tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      this.tree.insert(10, 10, 'nw');
      this.tree.insert(60, 10, 'ne');
      this.tree.insert(10, 60, 'sw');
      this.tree.insert(60, 60, 'se');
    });

    it('should query entire bounds - exact match', () => {
      const results = this.tree.query({ x: 0, y: 0, width: 100, height: 100 });
      expect(results).toHaveLength(4);
    });

    it('should query northwest quadrant', () => {
      const results = this.tree.query({ x: 0, y: 0, width: 50, height: 50 });
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe('nw');
    });

    it('should query northeast quadrant', () => {
      const results = this.tree.query({ x: 50, y: 0, width: 50, height: 50 });
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe('ne');
    });

    it('should query southwest quadrant', () => {
      const results = this.tree.query({ x: 0, y: 50, width: 50, height: 50 });
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe('sw');
    });

    it('should query southeast quadrant', () => {
      const results = this.tree.query({ x: 50, y: 50, width: 50, height: 50 });
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe('se');
    });

    it('should query partial region', () => {
      const results = this.tree.query({ x: 5, y: 5, width: 20, height: 20 });
      expect(results).toHaveLength(1);
      expect(results[0]!.value).toBe('nw');
    });

    it('should query region with no points', () => {
      const results = this.tree.query({ x: 80, y: 80, width: 10, height: 10 });
      expect(results).toHaveLength(0);
    });

    it('should query region outside bounds', () => {
      const results = this.tree.query({ x: 100, y: 100, width: 10, height: 10 });
      expect(results).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should remove existing point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'value');
      const result = tree.remove(50, 50);
      expect(result).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.contains(50, 50)).toBe(false);
    });

    it('should remove from non-empty node', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 2, 8);
      tree.insert(10, 10, 'a');
      tree.insert(20, 10, 'b');
      tree.insert(10, 20, 'c');
      const result = tree.remove(10, 10);
      expect(result).toBe(true);
      expect(tree.size()).toBe(2);
    });

    it('should return false for non-existent point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'value');
      const result = tree.remove(60, 60);
      expect(result).toBe(false);
      expect(tree.size()).toBe(1);
    });

    it('should remove point outside bounds', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.remove(150, 150);
      expect(result).toBe(false);
    });
  });

  describe('contains', () => {
    it('should return true for existing point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'value');
      expect(tree.contains(50, 50)).toBe(true);
    });

    it('should return false for non-existent point', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'value');
      expect(tree.contains(60, 60)).toBe(false);
    });

    it('should return false for point outside bounds', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      expect(tree.contains(150, 150)).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      expect(tree.size()).toBe(0);
    });

    it('should return count after inserts', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.insert(20, 20, 'b');
      tree.insert(30, 30, 'c');
      expect(tree.size()).toBe(3);
    });

    it('should update after remove', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.insert(20, 20, 'b');
      tree.insert(30, 30, 'c');
      tree.remove(20, 20);
      expect(tree.size()).toBe(2);
    });

    it('should count duplicates', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(50, 50, 'first');
      tree.insert(50, 50, 'second');
      expect(tree.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear tree', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.insert(20, 20, 'b');
      tree.insert(30, 30, 'c');
      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.contains(10, 10)).toBe(false);
    });

    it('should allow insert after clear', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      tree.insert(10, 10, 'a');
      tree.clear();
      const result = tree.insert(20, 20, 'b');
      expect(result).toBe(true);
      expect(tree.size()).toBe(1);
    });
  });

  describe('subdivision behavior', () => {
    it('should subdivide when maxPointsPerNode exceeded', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 2, 8);
      tree.insert(10, 10, 'a');
      tree.insert(20, 10, 'b');
      tree.insert(10, 20, 'c');
      tree.insert(20, 20, 'd');
      tree.insert(15, 15, 'e');
      expect(tree.size()).toBe(5);
    });

    it('should respect maxDepth limit', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 2, 2);
      for (let i = 0; i < 20; i++) {
        tree.insert(50, 50, `value-${i}`);
      }
      expect(tree.size()).toBe(20);
    });
  });

  describe('edge cases - boundary points', () => {
    it('should insert point on left boundary', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(0, 50, 'boundary');
      expect(result).toBe(true);
      expect(tree.contains(0, 50)).toBe(true);
    });

    it('should insert point on top boundary', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(50, 0, 'boundary');
      expect(result).toBe(true);
      expect(tree.contains(50, 0)).toBe(true);
    });

    it('should reject point on right boundary', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(100, 50, 'boundary');
      expect(result).toBe(false);
    });

    it('should reject point on bottom boundary', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(50, 100, 'boundary');
      expect(result).toBe(false);
    });

    it('should insert point on center boundary', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 });
      const result = tree.insert(50, 50, 'boundary');
      expect(result).toBe(true);
      expect(tree.contains(50, 50)).toBe(true);
    });
  });

  describe('many points', () => {
    it('should handle 100+ points', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 4, 8);
      const count = 100;

      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        tree.insert(x, y, `value-${i}`);
      }

      expect(tree.size()).toBe(count);
    });

    it('should query correctly with many points', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 4, 8);

      for (let i = 0; i < 100; i++) {
        tree.insert(i, i, `value-${i}`);
      }

      const results = tree.query({ x: 0, y: 0, width: 50, height: 50 });
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(51);
    });

    it('should remove correctly with many points', () => {
      const tree = new QuadTreeMap2({ x: 0, y: 0, width: 100, height: 100 }, 4, 8);

      for (let i = 0; i < 100; i++) {
        tree.insert(i, i, `value-${i}`);
      }

      for (let i = 0; i < 50; i++) {
        tree.remove(i, i);
      }

      expect(tree.size()).toBe(50);
    });
  });

  it('should handle contains', () => {
    const tree = new QuadTreeMap2<string>({ x: 0, y: 0, width: 100, height: 100 });
    tree.insert(10, 10, 'val');
    expect(tree.contains(10, 10)).toBe(true);
    expect(tree.contains(99, 99)).toBe(false);
  });
});
