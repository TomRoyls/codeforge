import { describe, it, expect } from 'vitest';
import { IntervalTree3 } from './src/core/interval-tree-3/index.js';

describe('IntervalTree3', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('inserts single interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 10)).toBe(true);
    });

    it('inserts multiple intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(15, 20);
      tree.insert(25, 30);
      expect(tree.size).toBe(3);
      expect(tree.contains(5, 10)).toBe(true);
      expect(tree.contains(15, 20)).toBe(true);
      expect(tree.contains(25, 30)).toBe(true);
    });

    it('inserts non-overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(true);
      expect(tree.search(20, 25)).toBe(true);
    });

    it('inserts overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 10)).toBe(true);
      expect(tree.search(5, 15)).toBe(true);
      expect(tree.search(10, 20)).toBe(true);
    });

    it('inserts nested intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      tree.insert(5, 15);
      tree.insert(8, 12);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 20)).toBe(true);
      expect(tree.search(5, 15)).toBe(true);
      expect(tree.search(8, 12)).toBe(true);
    });

    it('inserts adjacent intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(5, 10);
      tree.insert(10, 15);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(5, 10)).toBe(true);
      expect(tree.search(10, 15)).toBe(true);
    });

    it('inserts same interval multiple times', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.size).toBe(3);
      const result = tree.searchAll(5, 10);
      expect(result.length).toBe(3);
      expect(result).toEqual([[5, 10], [5, 10], [5, 10]]);
    });

    it('throws on invalid interval (low > high)', () => {
      const tree = new IntervalTree3();
      expect(() => tree.insert(10, 5)).toThrow(RangeError);
    });

    it('inserts intervals with zero length', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 5);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 5)).toBe(true);
    });

    it('inserts intervals with negative values', () => {
      const tree = new IntervalTree3();
      tree.insert(-10, -5);
      tree.insert(-5, 0);
      tree.insert(0, 5);
      expect(tree.size).toBe(3);
      expect(tree.contains(-10, -5)).toBe(true);
      expect(tree.contains(-5, 0)).toBe(true);
      expect(tree.contains(0, 5)).toBe(true);
    });

    it('inserts intervals with same low value', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 15);
      tree.insert(5, 20);
      expect(tree.size).toBe(3);
      expect(tree.searchAll(5, 10).length).toBe(3);
    });

    it('inserts intervals with same high value', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 20);
      tree.insert(10, 20);
      tree.insert(15, 20);
      expect(tree.size).toBe(3);
      expect(tree.searchAll(5, 20).length).toBe(3);
    });
  });

  describe('remove', () => {
    it('removes existing interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(15, 20);
      const removed = tree.remove(5, 10);
      expect(removed).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 10)).toBe(false);
      expect(tree.contains(15, 20)).toBe(true);
    });

    it('removes non-existing interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      const removed = tree.remove(15, 20);
      expect(removed).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('removes from empty tree', () => {
      const tree = new IntervalTree3();
      const removed = tree.remove(5, 10);
      expect(removed).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('removes multiple intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.remove(1, 5)).toBe(true);
      expect(tree.remove(10, 15)).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.contains(20, 25)).toBe(true);
    });

    it('removes one of multiple same intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      const removed = tree.remove(5, 10);
      expect(removed).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.searchAll(5, 10).length).toBe(2);
    });

    it('removes all same intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.remove(5, 10);
      tree.remove(5, 10);
      tree.remove(5, 10);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('removes interval from nested intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      tree.insert(5, 15);
      tree.insert(8, 12);
      expect(tree.remove(5, 15)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.contains(1, 20)).toBe(true);
      expect(tree.contains(5, 15)).toBe(false);
      expect(tree.contains(8, 12)).toBe(true);
    });

    it('removes interval from overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      expect(tree.remove(5, 15)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.contains(1, 10)).toBe(true);
      expect(tree.contains(5, 15)).toBe(false);
      expect(tree.contains(10, 20)).toBe(true);
    });

    it('throws on invalid interval (low > high)', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(() => tree.remove(10, 5)).toThrow(RangeError);
    });
  });

  describe('search', () => {
    it('finds exact interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.search(5, 10)).toBe(true);
    });

    it('does not find non-existing interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.search(15, 20)).toBe(false);
    });

    it('finds interval with same low but different high', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.search(5, 15)).toBe(false);
    });

    it('finds interval with same high but different low', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.search(1, 10)).toBe(false);
    });

    it('searches empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.search(5, 10)).toBe(false);
    });
  });

  describe('searchPoint', () => {
    it('finds intervals containing point', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const result = tree.searchPoint(12);
      expect(result).toEqual([[10, 15]]);
    });

    it('finds multiple intervals containing point', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      tree.insert(5, 15);
      tree.insert(8, 12);
      const result = tree.searchPoint(10);
      expect(result.length).toBe(3);
      expect(result).toContainEqual([1, 20]);
      expect(result).toContainEqual([5, 15]);
      expect(result).toContainEqual([8, 12]);
    });

    it('returns empty array for point not in any interval', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      const result = tree.searchPoint(7);
      expect(result).toEqual([]);
    });

    it('finds interval with point at low bound', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      const result = tree.searchPoint(5);
      expect(result).toEqual([[5, 10]]);
    });

    it('finds interval with point at high bound', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      const result = tree.searchPoint(10);
      expect(result).toEqual([[5, 10]]);
    });

    it('finds interval with point in middle', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      const result = tree.searchPoint(7);
      expect(result).toEqual([[5, 10]]);
    });

    it('returns empty array for empty tree', () => {
      const tree = new IntervalTree3();
      const result = tree.searchPoint(5);
      expect(result).toEqual([]);
    });

    it('finds intervals with zero length containing point', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 5);
      const result = tree.searchPoint(5);
      expect(result).toEqual([[5, 5]]);
    });

    it('finds intervals containing negative point', () => {
      const tree = new IntervalTree3();
      tree.insert(-10, -5);
      tree.insert(0, 5);
      const result = tree.searchPoint(-7);
      expect(result).toEqual([[-10, -5]]);
    });
  });

  describe('searchAll', () => {
    it('finds all overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(3, 7);
      tree.insert(5, 9);
      const result = tree.searchAll(4, 6);
      expect(result.length).toBe(3);
      expect(result).toContainEqual([1, 5]);
      expect(result).toContainEqual([3, 7]);
      expect(result).toContainEqual([5, 9]);
    });

    it('returns empty array for non-overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      const result = tree.searchAll(6, 9);
      expect(result).toEqual([]);
    });

    it('finds nested intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      tree.insert(5, 15);
      tree.insert(8, 12);
      const result = tree.searchAll(1, 20);
      expect(result.length).toBe(3);
    });

    it('finds adjacent intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(5, 10);
      tree.insert(10, 15);
      const result = tree.searchAll(1, 15);
      expect(result.length).toBe(3);
    });

    it('searches overlapping range', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(3, 7);
      tree.insert(5, 9);
      tree.insert(7, 11);
      const result = tree.searchAll(4, 8);
      expect(result.length).toBe(4);
    });

    it('returns empty array for empty tree', () => {
      const tree = new IntervalTree3();
      const result = tree.searchAll(5, 10);
      expect(result).toEqual([]);
    });

    it('finds interval that completely contains search range', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      const result = tree.searchAll(5, 10);
      expect(result).toEqual([[1, 20]]);
    });

    it('finds intervals with zero length', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 5);
      tree.insert(5, 10);
      const result = tree.searchAll(5, 10);
      expect(result.length).toBe(2);
    });
  });

  describe('overlaps', () => {
    it('returns true for overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 10);
      expect(tree.overlaps(5, 15)).toBe(true);
    });

    it('returns true for contained intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 20);
      expect(tree.overlaps(5, 15)).toBe(true);
    });

    it('returns true for containing intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 15);
      expect(tree.overlaps(1, 20)).toBe(true);
    });

    it('returns true for adjacent intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      expect(tree.overlaps(5, 10)).toBe(true);
    });

    it('returns false for non-overlapping intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      expect(tree.overlaps(10, 15)).toBe(false);
    });

    it('returns false for empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.overlaps(5, 10)).toBe(false);
    });

    it('returns true for overlapping at point', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.overlaps(10, 15)).toBe(true);
    });
  });

  describe('contains', () => {
    it('returns true for exact interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.contains(5, 10)).toBe(true);
    });

    it('returns false for non-existing interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.contains(15, 20)).toBe(false);
    });

    it('returns false for overlapping interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.contains(7, 15)).toBe(false);
    });

    it('returns false for empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.contains(5, 10)).toBe(false);
    });
  });

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.size).toBe(0);
    });

    it('returns 1 after single insert', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
    });

    it('returns correct size after multiple inserts', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.size).toBe(3);
    });

    it('decreases after remove', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.remove(1, 5);
      expect(tree.size).toBe(1);
    });

    it('counts duplicate intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.size).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns false after insert', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      expect(tree.isEmpty()).toBe(false);
    });

    it('returns true after clear', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns true after removing all intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.remove(5, 10);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty tree', () => {
      const tree = new IntervalTree3();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('clears tree with intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('allows insert after clear', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.clear();
      tree.insert(10, 15);
      expect(tree.size).toBe(1);
      expect(tree.contains(10, 15)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new IntervalTree3();
      expect(tree.toArray()).toEqual([]);
    });

    it('returns sorted intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(15, 20);
      tree.insert(5, 10);
      tree.insert(25, 30);
      expect(tree.toArray()).toEqual([[5, 10], [15, 20], [25, 30]]);
    });

    it('returns intervals in order of insertion for same low', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 15);
      tree.insert(5, 20);
      const result = tree.toArray();
      expect(result.length).toBe(3);
      expect(result).toContainEqual([5, 10]);
      expect(result).toContainEqual([5, 15]);
      expect(result).toContainEqual([5, 20]);
    });

    it('returns all intervals including duplicates', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      const result = tree.toArray();
      expect(result.length).toBe(3);
      expect(result).toEqual([[5, 10], [5, 10], [5, 10]]);
    });

    it('returns intervals after removal', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      tree.remove(10, 15);
      expect(tree.toArray()).toEqual([[1, 5], [20, 25]]);
    });
  });

  describe('forEach', () => {
    it('calls callback with no intervals', () => {
      const tree = new IntervalTree3();
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results).toEqual([]);
    });

    it('calls callback for each interval', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(15, 20);
      tree.insert(25, 30);
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results.length).toBe(3);
      expect(results).toContainEqual([5, 10]);
      expect(results).toContainEqual([15, 20]);
      expect(results).toContainEqual([25, 30]);
    });

    it('provides correct index', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(15, 20);
      tree.insert(25, 30);
      const indices: number[] = [];
      tree.forEach((interval, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('iterates in sorted order by low', () => {
      const tree = new IntervalTree3();
      tree.insert(15, 20);
      tree.insert(5, 10);
      tree.insert(25, 30);
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results).toEqual([[5, 10], [15, 20], [25, 30]]);
    });

    it('includes duplicate intervals', () => {
      const tree = new IntervalTree3();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('handles large number of intervals', () => {
      const tree = new IntervalTree3();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i + 10);
      }
      expect(tree.size).toBe(100);
      expect(tree.searchPoint(50).length).toBeGreaterThan(0);
    });

    it('handles intervals with large values', () => {
      const tree = new IntervalTree3();
      tree.insert(1000000, 2000000);
      tree.insert(3000000, 4000000);
      expect(tree.size).toBe(2);
      expect(tree.contains(1000000, 2000000)).toBe(true);
      expect(tree.contains(3000000, 4000000)).toBe(true);
    });

    it('handles intervals with floating point values', () => {
      const tree = new IntervalTree3();
      tree.insert(1.5, 5.5);
      tree.insert(10.5, 15.5);
      expect(tree.size).toBe(2);
      expect(tree.contains(1.5, 5.5)).toBe(true);
      expect(tree.contains(10.5, 15.5)).toBe(true);
    });
  });

  describe('combined operations', () => {
    it('inserts and searches correctly', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(true);
      expect(tree.search(20, 25)).toBe(true);
      expect(tree.search(5, 10)).toBe(false);
    });

    it('inserts, removes, and searches', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      tree.remove(10, 15);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(false);
      expect(tree.search(20, 25)).toBe(true);
    });

    it('performs multiple searchPoint operations', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      expect(tree.searchPoint(5).length).toBe(2);
      expect(tree.searchPoint(10).length).toBe(3);
      expect(tree.searchPoint(15).length).toBe(2);
    });

    it('performs multiple searchAll operations', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 5);
      tree.insert(3, 7);
      tree.insert(5, 9);
      expect(tree.searchAll(1, 9).length).toBe(3);
      expect(tree.searchAll(3, 7).length).toBe(3);
      expect(tree.searchAll(5, 9).length).toBe(3);
    });

    it('checks overlaps after operations', () => {
      const tree = new IntervalTree3();
      tree.insert(1, 10);
      tree.insert(15, 20);
      expect(tree.overlaps(5, 15)).toBe(true);
      tree.remove(1, 10);
      expect(tree.overlaps(5, 15)).toBe(true);
    });
  });
});
