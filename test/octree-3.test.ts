import { describe, it, expect } from 'vitest';
import { Octree3 } from '../src/core/octree-3/index.js';

describe('Octree3', () => {
  describe('constructor', () => {
    it('should create octree with center and size', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const bounds = octree.getBounds();
      expect(bounds.center).toEqual({ x: 0, y: 0, z: 0 });
      expect(bounds.size).toBe(100);
    });

    it('should use default maxItems of 8', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 8; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      expect(octree.size).toBe(8);
    });

    it('should use custom maxItems', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 4; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      expect(octree.size).toBe(4);
    });

    it('should throw error for non-positive size', () => {
      expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 0)).toThrow('Size must be positive');
      expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, -10)).toThrow('Size must be positive');
    });

    it('should throw error for non-positive maxItems', () => {
      expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 0)).toThrow('maxItems must be positive');
      expect(() => new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, -5)).toThrow('maxItems must be positive');
    });
  });

  describe('insert', () => {
    it('should insert point and return true', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const result = octree.insert({ x: 10, y: 10, z: 10 }, 42);
      expect(result).toBe(true);
      expect(octree.size).toBe(1);
    });

    it('should insert multiple points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        expect(octree.insert({ x: i, y: i, z: i }, i)).toBe(true);
      }
      expect(octree.size).toBe(10);
    });

    it('should return false for out of bounds point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const result = octree.insert({ x: 100, y: 100, z: 100 }, 1);
      expect(result).toBe(false);
      expect(octree.size).toBe(0);
    });

    it('should insert point on exact boundary', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const result = octree.insert({ x: 50, y: 50, z: 50 }, 1);
      expect(result).toBe(true);
      expect(octree.size).toBe(1);
    });

    it('should handle many points causing subdivision', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 20; i++) {
        octree.insert({ x: i * 2, y: i * 2, z: i * 2 }, i);
      }
      expect(octree.size).toBe(20);
    });

    it('should allow duplicate points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: 10, y: 10, z: 10 }, 2);
      expect(octree.size).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove existing point and return true', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 42);
      const result = octree.remove({ x: 10, y: 10, z: 10 });
      expect(result).toBe(true);
      expect(octree.size).toBe(0);
    });

    it('should return false for non-existent point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const result = octree.remove({ x: 10, y: 10, z: 10 });
      expect(result).toBe(false);
    });

    it('should remove from multiple points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      expect(octree.remove({ x: 5, y: 5, z: 5 })).toBe(true);
      expect(octree.size).toBe(9);
    });

    it('should return false for out of bounds point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const result = octree.remove({ x: 100, y: 100, z: 100 });
      expect(result).toBe(false);
    });

    it('should handle removal from subdivided tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 20; i++) {
        octree.insert({ x: i * 2, y: i * 2, z: i * 2 }, i);
      }
      expect(octree.remove({ x: 10, y: 10, z: 10 })).toBe(true);
      expect(octree.size).toBe(19);
    });

    it('should remove only one instance of duplicate point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: 10, y: 10, z: 10 }, 2);
      octree.remove({ x: 10, y: 10, z: 10 });
      expect(octree.size).toBe(1);
      const items = octree.toArray();
      expect(items.some((item) => item.data === 1 || item.data === 2)).toBe(true);
    });
  });

  describe('query', () => {
    it('should find points within radius', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: 20, y: 20, z: 20 }, 2);
      octree.insert({ x: 30, y: 30, z: 30 }, 3);

      const results = octree.query({ x: 15, y: 15, z: 15 }, 15);
      expect(results.length).toBe(2);
      expect(results.some((item) => item.data === 1)).toBe(true);
      expect(results.some((item) => item.data === 2)).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);

      const results = octree.query({ x: 50, y: 50, z: 50 }, 10);
      expect(results.length).toBe(0);
    });

    it('should return all points for large radius', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i * 5, y: i * 5, z: i * 5 }, i);
      }

      const results = octree.query({ x: 0, y: 0, z: 0 }, 100);
      expect(results.length).toBe(10);
    });

    it('should handle empty tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      const results = octree.query({ x: 0, y: 0, z: 0 }, 50);
      expect(results.length).toBe(0);
    });

    it('should find exact boundary points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);

      const results = octree.query({ x: 0, y: 0, z: 0 }, Math.sqrt(300));
      expect(results.length).toBe(1);
    });

    it('should handle points exactly at radius boundary', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: 15, y: 15, z: 15 }, 2);

      const results = octree.query({ x: 0, y: 0, z: 0 }, Math.sqrt(300));
      expect(results.length).toBe(1);
      expect(results[0].data).toBe(1);
    });

    it('should query subdivided tree correctly', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 20; i++) {
        octree.insert({ x: i * 2, y: i * 2, z: i * 2 }, i);
      }

      const results = octree.query({ x: 20, y: 20, z: 20 }, 15);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((item) => {
        const dist = Math.sqrt(
          Math.pow(item.point.x - 20, 2) +
            Math.pow(item.point.y - 20, 2) +
            Math.pow(item.point.z - 20, 2)
        );
        return dist <= 15;
      })).toBe(true);
    });
  });

  describe('contains', () => {
    it('should return true for existing point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 42);
      expect(octree.contains({ x: 10, y: 10, z: 10 })).toBe(true);
    });

    it('should return false for non-existent point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 42);
      expect(octree.contains({ x: 20, y: 20, z: 20 })).toBe(false);
    });

    it('should return false for out of bounds point', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 42);
      expect(octree.contains({ x: 100, y: 100, z: 100 })).toBe(false);
    });

    it('should handle empty tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      expect(octree.contains({ x: 10, y: 10, z: 10 })).toBe(false);
    });

    it('should work after removal', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 42);
      octree.remove({ x: 10, y: 10, z: 10 });
      expect(octree.contains({ x: 10, y: 10, z: 10 })).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      expect(octree.size).toBe(0);
    });

    it('should return count after insertions', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      expect(octree.size).toBe(10);
    });

    it('should return count after removals', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      octree.remove({ x: 5, y: 5, z: 5 });
      expect(octree.size).toBe(9);
    });

    it('should handle many points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 100; i++) {
        octree.insert({ x: i % 20, y: i % 20, z: i % 20 }, i);
      }
      expect(octree.size).toBe(100);
    });
  });

  describe('clear', () => {
    it('should clear all points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      octree.clear();
      expect(octree.size).toBe(0);
      expect(octree.toArray().length).toBe(0);
    });

    it('should handle empty tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.clear();
      expect(octree.size).toBe(0);
    });

    it('should allow reuse after clear', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      for (let i = 0; i < 10; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }
      octree.clear();
      octree.insert({ x: 5, y: 5, z: 5 }, 42);
      expect(octree.size).toBe(1);
      expect(octree.contains({ x: 5, y: 5, z: 5 })).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      expect(octree.toArray()).toEqual([]);
    });

    it('should return all inserted items', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: 20, y: 20, z: 20 }, 2);
      octree.insert({ x: 30, y: 30, z: 30 }, 3);

      const items = octree.toArray();
      expect(items.length).toBe(3);
      expect(items.some((item) => item.data === 1)).toBe(true);
      expect(items.some((item) => item.data === 2)).toBe(true);
      expect(items.some((item) => item.data === 3)).toBe(true);
    });

    it('should include point and data in items', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 20, z: 30 }, 42);

      const items = octree.toArray();
      expect(items[0].point).toEqual({ x: 10, y: 20, z: 30 });
      expect(items[0].data).toBe(42);
    });

    it('should handle many points', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      for (let i = 0; i < 50; i++) {
        octree.insert({ x: i, y: i, z: i }, i);
      }

      const items = octree.toArray();
      expect(items.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(items.some((item) => item.data === i)).toBe(true);
      }
    });

    it('should return new array not reference', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);

      const items1 = octree.toArray();
      const items2 = octree.toArray();
      expect(items1).not.toBe(items2);
      expect(items1).toEqual(items2);
    });
  });

  describe('getBounds', () => {
    it('should return initial bounds', () => {
      const octree = new Octree3<number>({ x: 10, y: 20, z: 30 }, 100);
      const bounds = octree.getBounds();
      expect(bounds.center).toEqual({ x: 10, y: 20, z: 30 });
      expect(bounds.size).toBe(100);
    });

    it('should return copy not reference', () => {
      const octree = new Octree3<number>({ x: 10, y: 20, z: 30 }, 100);
      const bounds1 = octree.getBounds();
      const bounds2 = octree.getBounds();
      expect(bounds1).not.toBe(bounds2);
      expect(bounds1.center).not.toBe(bounds2.center);
      expect(bounds1).toEqual(bounds2);
    });

    it('should not change after operations', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.remove({ x: 10, y: 10, z: 10 });
      octree.clear();

      const bounds = octree.getBounds();
      expect(bounds.center).toEqual({ x: 0, y: 0, z: 0 });
      expect(bounds.size).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle many points causing multiple subdivisions', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      const count = 200;
      for (let i = 0; i < count; i++) {
        octree.insert({ x: i % 40, y: (i * 2) % 40, z: (i * 3) % 40 }, i);
      }
      expect(octree.size).toBe(count);
    });

    it('should handle points at octant boundaries', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 4);
      octree.insert({ x: 25, y: 25, z: 25 }, 1);
      octree.insert({ x: 25, y: 25, z: -25 }, 2);
      octree.insert({ x: 25, y: -25, z: 25 }, 3);
      octree.insert({ x: 25, y: -25, z: -25 }, 4);
      octree.insert({ x: -25, y: 25, z: 25 }, 5);
      octree.insert({ x: -25, y: 25, z: -25 }, 6);
      octree.insert({ x: -25, y: -25, z: 25 }, 7);
      octree.insert({ x: -25, y: -25, z: -25 }, 8);

      expect(octree.size).toBe(8);
      expect(octree.toArray().every((item) => item.data >= 1 && item.data <= 8)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: -10, y: -10, z: -10 }, 1);
      octree.insert({ x: -20, y: -20, z: -20 }, 2);
      octree.insert({ x: -30, y: -30, z: -30 }, 3);

      expect(octree.size).toBe(3);
      expect(octree.contains({ x: -10, y: -10, z: -10 })).toBe(true);
    });

    it('should handle mixed positive and negative coordinates', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);
      octree.insert({ x: -10, y: -10, z: -10 }, 2);
      octree.insert({ x: 10, y: -10, z: 0 }, 3);
      octree.insert({ x: -10, y: 10, z: 0 }, 4);

      expect(octree.size).toBe(4);
      expect(octree.contains({ x: 10, y: 10, z: 10 })).toBe(true);
      expect(octree.contains({ x: -10, y: -10, z: -10 })).toBe(true);
    });

    it('should handle very large tree', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 1000, 16);
      const count = 500;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 1000 - 500;
        const y = Math.random() * 1000 - 500;
        const z = Math.random() * 1000 - 500;
        octree.insert({ x, y, z }, i);
      }
      expect(octree.size).toBe(count);
    });

    it('should handle query radius of 0', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 1);

      const results = octree.query({ x: 10, y: 10, z: 10 }, 0);
      expect(results.length).toBe(1);
    });

    it('should handle data of different types', () => {
      const octree = new Octree3<string>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, 'hello');
      octree.insert({ x: 20, y: 20, z: 20 }, 'world');

      const items = octree.toArray();
      expect(items.some((item) => item.data === 'hello')).toBe(true);
      expect(items.some((item) => item.data === 'world')).toBe(true);
    });

    it('should handle object data', () => {
      const octree = new Octree3<{ id: number; name: string }>({ x: 0, y: 0, z: 0 }, 100);
      octree.insert({ x: 10, y: 10, z: 10 }, { id: 1, name: 'test' });

      const items = octree.toArray();
      expect(items[0].data).toEqual({ id: 1, name: 'test' });
    });

    it('should maintain consistency after many operations', () => {
      const octree = new Octree3<number>({ x: 0, y: 0, z: 0 }, 100, 8);
      const insertCount = 100;

      for (let i = 0; i < insertCount; i++) {
        octree.insert({ x: i % 30, y: (i * 2) % 30, z: (i * 3) % 30 }, i);
      }

      expect(octree.size).toBe(insertCount);

      const removeCount = 30;
      for (let i = 0; i < removeCount; i++) {
        octree.remove({ x: i % 30, y: (i * 2) % 30, z: (i * 3) % 30 });
      }

      expect(octree.size).toBe(insertCount - removeCount);

      const items = octree.toArray();
      expect(items.length).toBe(insertCount - removeCount);
      expect(items.every((item) => item.data >= removeCount)).toBe(true);
    });
  });
});
