import { describe, it, expect } from 'vitest';
import { IntervalTree4 } from './src/core/interval-tree-4/index.js';

describe('IntervalTree4', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('inserts single interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 10)).toBe(true);
    });

    it('inserts multiple intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(15, 20);
      tree.insert(25, 30);
      expect(tree.size).toBe(3);
      expect(tree.contains(5, 10)).toBe(true);
      expect(tree.contains(15, 20)).toBe(true);
      expect(tree.contains(25, 30)).toBe(true);
    });

    it('inserts non-overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(true);
      expect(tree.search(20, 25)).toBe(true);
    });

    it('inserts overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 10);
      tree.insert(5, 15);
      tree.insert(10, 20);
      expect(tree.size).toBe(3);
      expect(tree.search(1, 10)).toBe(true);
      expect(tree.search(5, 15)).toBe(true);
      expect(tree.search(10, 20)).toBe(true);
    });

    it('inserts same interval multiple times', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      expect(tree.size).toBe(3);
      const result = tree.toArray();
      expect(result.length).toBe(3);
      expect(result).toEqual([[5, 10], [5, 10], [5, 10]]);
    });

    it('throws on invalid interval (low > high)', () => {
      const tree = new IntervalTree4();
      expect(() => tree.insert(10, 5)).toThrow(RangeError);
    });

    it('inserts intervals with zero length', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 5);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 5)).toBe(true);
    });

    it('inserts intervals with negative values', () => {
      const tree = new IntervalTree4();
      tree.insert(-10, -5);
      tree.insert(-5, 0);
      tree.insert(0, 5);
      expect(tree.size).toBe(3);
      expect(tree.contains(-10, -5)).toBe(true);
      expect(tree.contains(-5, 0)).toBe(true);
      expect(tree.contains(0, 5)).toBe(true);
    });
  });

  describe('delete', () => {
    it('deletes existing interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(15, 20);
      const deleted = tree.delete(5, 10);
      expect(deleted).toBe(true);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 10)).toBe(false);
      expect(tree.contains(15, 20)).toBe(true);
    });

    it('deletes non-existing interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      const deleted = tree.delete(15, 20);
      expect(deleted).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('deletes from empty tree', () => {
      const tree = new IntervalTree4();
      const deleted = tree.delete(5, 10);
      expect(deleted).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('deletes one of multiple same intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      const deleted = tree.delete(5, 10);
      expect(deleted).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.toArray().length).toBe(2);
    });

    it('throws on invalid interval (low > high)', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(() => tree.delete(10, 5)).toThrow(RangeError);
    });
  });

  describe('search', () => {
    it('finds exact interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.search(5, 10)).toBe(true);
    });

    it('does not find non-existing interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.search(15, 20)).toBe(false);
    });

    it('searches empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.search(5, 10)).toBe(false);
    });
  });

  describe('contains', () => {
    it('returns true for exact interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.contains(5, 10)).toBe(true);
    });

    it('returns false for non-existing interval', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.contains(15, 20)).toBe(false);
    });

    it('returns false for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.contains(5, 10)).toBe(false);
    });
  });

  describe('min', () => {
    it('returns minimum low value', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(15, 20);
      tree.insert(1, 5);
      expect(tree.min()).toBe(1);
    });

    it('returns undefined for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.min()).toBe(undefined);
    });

    it('returns min for single interval', () => {
      const tree = new IntervalTree4();
      tree.insert(10, 20);
      expect(tree.min()).toBe(10);
    });
  });

  describe('max', () => {
    it('returns maximum high value', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(15, 30);
      tree.insert(1, 5);
      expect(tree.max()).toBe(30);
    });

    it('returns undefined for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.max()).toBe(undefined);
    });

    it('returns max for single interval', () => {
      const tree = new IntervalTree4();
      tree.insert(10, 20);
      expect(tree.max()).toBe(20);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.toArray()).toEqual([]);
    });

    it('returns sorted intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(15, 20);
      tree.insert(5, 10);
      tree.insert(25, 30);
      expect(tree.toArray()).toEqual([[5, 10], [15, 20], [25, 30]]);
    });

    it('returns all intervals including duplicates', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.insert(5, 10);
      tree.insert(5, 10);
      const result = tree.toArray();
      expect(result.length).toBe(3);
      expect(result).toEqual([[5, 10], [5, 10], [5, 10]]);
    });
  });

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.size).toBe(0);
    });

    it('returns 1 after single insert', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.size).toBe(1);
    });

    it('returns correct size after multiple inserts', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.size).toBe(3);
    });

    it('decreases after delete', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.delete(1, 5);
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      const tree = new IntervalTree4();
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns false after insert', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      expect(tree.isEmpty()).toBe(false);
    });

    it('returns true after clear', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns true after deleting all intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(5, 10);
      tree.delete(5, 10);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty tree', () => {
      const tree = new IntervalTree4();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('clears tree with intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('allows insert after clear', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.clear();
      tree.insert(10, 15);
      expect(tree.size).toBe(1);
      expect(tree.contains(10, 15)).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('returns complexity object', () => {
      const tree = new IntervalTree4();
      const complexity = tree.getTimeComplexity();
      expect(complexity).toHaveProperty('insert');
      expect(complexity).toHaveProperty('delete');
      expect(complexity).toHaveProperty('search');
      expect(complexity).toHaveProperty('min');
      expect(complexity).toHaveProperty('max');
      expect(complexity).toHaveProperty('toArray');
      expect(complexity).toHaveProperty('forEach');
      expect(complexity).toHaveProperty('bulkInsert');
      expect(complexity).toHaveProperty('mergeOverlapping');
      expect(complexity).toHaveProperty('splitAt');
    });

    it('returns correct complexity for max', () => {
      const tree = new IntervalTree4();
      const complexity = tree.getTimeComplexity();
      expect(complexity.max).toBe('O(1)');
    });
  });

  describe('forEach', () => {
    it('calls callback with no intervals', () => {
      const tree = new IntervalTree4();
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results).toEqual([]);
    });

    it('calls callback for each interval', () => {
      const tree = new IntervalTree4();
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
      const tree = new IntervalTree4();
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
      const tree = new IntervalTree4();
      tree.insert(15, 20);
      tree.insert(5, 10);
      tree.insert(25, 30);
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results).toEqual([[5, 10], [15, 20], [25, 30]]);
    });
  });

  describe('mergeOverlapping', () => {
    it('returns empty tree for empty tree', () => {
      const tree = new IntervalTree4();
      const merged = tree.mergeOverlapping();
      expect(merged.size).toBe(0);
      expect(merged.toArray()).toEqual([]);
    });

    it('returns same tree for non-overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 5], [10, 15], [20, 25]]);
    });

    it('merges overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(4, 8);
      tree.insert(7, 10);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 10]]);
    });

    it('merges adjacent intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(5, 10);
      tree.insert(10, 15);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 15]]);
    });

    it('merges partially overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 10);
      tree.insert(5, 15);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 15]]);
    });

    it('merges nested intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 20);
      tree.insert(5, 10);
      tree.insert(8, 15);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 20]]);
    });

    it('merges mixed overlapping and non-overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(4, 8);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const merged = tree.mergeOverlapping();
      expect(merged.toArray()).toEqual([[1, 8], [10, 15], [20, 25]]);
    });
  });

  describe('splitAt', () => {
    it('returns empty trees for empty tree', () => {
      const tree = new IntervalTree4();
      const { left, right } = tree.splitAt(10);
      expect(left.size).toBe(0);
      expect(right.size).toBe(0);
    });

    it('splits intervals at point with all left', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      const { left, right } = tree.splitAt(20);
      expect(left.size).toBe(2);
      expect(right.size).toBe(0);
      expect(left.toArray()).toEqual([[1, 5], [10, 15]]);
    });

    it('splits intervals at point with all right', () => {
      const tree = new IntervalTree4();
      tree.insert(10, 15);
      tree.insert(20, 25);
      const { left, right } = tree.splitAt(5);
      expect(left.size).toBe(0);
      expect(right.size).toBe(2);
      expect(right.toArray()).toEqual([[10, 15], [20, 25]]);
    });

    it('splits intervals at point with both sides', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      const { left, right } = tree.splitAt(12);
      expect(left.size).toBe(2);
      expect(right.size).toBe(2);
      expect(left.toArray()).toEqual([[1, 5], [10, 12]]);
      expect(right.toArray()).toEqual([[12, 15], [20, 25]]);
    });

    it('splits intervals that contain the point', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 20);
      const { left, right } = tree.splitAt(10);
      expect(left.size).toBe(1);
      expect(right.size).toBe(1);
      expect(left.toArray()).toEqual([[1, 10]]);
      expect(right.toArray()).toEqual([[10, 20]]);
    });

    it('splits multiple intervals that contain the point', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 20);
      tree.insert(5, 25);
      tree.insert(30, 40);
      const { left, right } = tree.splitAt(15);
      expect(left.size).toBe(2);
      expect(right.size).toBe(3);
      expect(left.toArray()).toEqual([[1, 15], [5, 15]]);
      expect(right.toArray()).toEqual([[15, 20], [15, 25], [30, 40]]);
    });

    it('handles intervals at boundary', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(5, 10);
      tree.insert(10, 15);
      const { left, right } = tree.splitAt(5);
      expect(left.toArray()).toEqual([[1, 5], [5, 5]]);
      expect(right.toArray()).toEqual([[5, 10], [10, 15]]);
    });
  });

  describe('bulkInsert', () => {
    it('inserts empty array', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([]);
      expect(tree.size).toBe(0);
    });

    it('inserts single interval', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[5, 10]]);
      expect(tree.size).toBe(1);
      expect(tree.contains(5, 10)).toBe(true);
    });

    it('inserts multiple intervals', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 5], [10, 15], [20, 25]]);
      expect(tree.size).toBe(3);
      expect(tree.contains(1, 5)).toBe(true);
      expect(tree.contains(10, 15)).toBe(true);
      expect(tree.contains(20, 25)).toBe(true);
    });

    it('inserts overlapping intervals', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 10], [5, 15], [10, 20]]);
      expect(tree.size).toBe(3);
      expect(tree.toArray().length).toBe(3);
    });

    it('inserts duplicate intervals', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[5, 10], [5, 10], [5, 10]]);
      expect(tree.size).toBe(3);
      const result = tree.toArray();
      expect(result.length).toBe(3);
    });

    it('handles large bulk insert', () => {
      const tree = new IntervalTree4();
      const intervals: [number, number][] = [];
      for (let i = 0; i < 100; i++) {
        intervals.push([i, i + 10]);
      }
      tree.bulkInsert(intervals);
      expect(tree.size).toBe(100);
    });
  });

  describe('combined operations', () => {
    it('inserts and searches correctly', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(true);
      expect(tree.search(20, 25)).toBe(true);
      expect(tree.search(5, 10)).toBe(false);
    });

    it('inserts, deletes, and searches', () => {
      const tree = new IntervalTree4();
      tree.insert(1, 5);
      tree.insert(10, 15);
      tree.insert(20, 25);
      tree.delete(10, 15);
      expect(tree.search(1, 5)).toBe(true);
      expect(tree.search(10, 15)).toBe(false);
      expect(tree.search(20, 25)).toBe(true);
    });

    it('bulk inserts and then merges', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 5], [4, 8], [7, 10], [15, 20]]);
      expect(tree.size).toBe(4);
      const merged = tree.mergeOverlapping();
      expect(merged.size).toBe(2);
      expect(merged.toArray()).toEqual([[1, 10], [15, 20]]);
    });

    it('splits and then bulk inserts back', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 10], [15, 20], [25, 30]]);
      const { left, right } = tree.splitAt(18);
      expect(left.size).toBe(2);
      expect(right.size).toBe(2);

      const combined = new IntervalTree4();
      combined.bulkInsert(left.toArray());
      combined.bulkInsert(right.toArray());
      expect(combined.size).toBe(4);
    });

    it('merges multiple times', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 5], [4, 8], [10, 15], [14, 18]]);
      const merged1 = tree.mergeOverlapping();
      expect(merged1.size).toBe(2);
      const merged2 = merged1.mergeOverlapping();
      expect(merged2.toArray()).toEqual(merged1.toArray());
    });

    it('clears after bulk insert', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[1, 5], [10, 15], [20, 25]]);
      expect(tree.size).toBe(3);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('forEach after bulk insert', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[15, 20], [5, 10], [25, 30]]);
      const results: [number, number][] = [];
      tree.forEach((interval, index) => {
        results.push(interval);
      });
      expect(results).toEqual([[5, 10], [15, 20], [25, 30]]);
    });

    it('min and max after bulk insert', () => {
      const tree = new IntervalTree4();
      tree.bulkInsert([[10, 20], [1, 5], [30, 40]]);
      expect(tree.min()).toBe(1);
      expect(tree.max()).toBe(40);
    });
  });

  describe('edge cases', () => {
    it('handles large number of intervals', () => {
      const tree = new IntervalTree4();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i + 10);
      }
      expect(tree.size).toBe(100);
      expect(tree.min()).toBe(0);
      expect(tree.max()).toBe(109);
    });

    it('handles intervals with large values', () => {
      const tree = new IntervalTree4();
      tree.insert(1000000, 2000000);
      tree.insert(3000000, 4000000);
      expect(tree.size).toBe(2);
      expect(tree.contains(1000000, 2000000)).toBe(true);
      expect(tree.contains(3000000, 4000000)).toBe(true);
    });

    it('handles intervals with floating point values', () => {
      const tree = new IntervalTree4();
      tree.insert(1.5, 5.5);
      tree.insert(10.5, 15.5);
      expect(tree.size).toBe(2);
      expect(tree.contains(1.5, 5.5)).toBe(true);
      expect(tree.contains(10.5, 15.5)).toBe(true);
    });
  });
});
