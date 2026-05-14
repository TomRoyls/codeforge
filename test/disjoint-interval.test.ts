import { describe, it, expect } from 'vitest';
import { DisjointIntervalSet } from '../src/core/disjoint-interval/index.js';

describe('DisjointIntervalSet', () => {
  describe('constructor', () => {
    it('should create empty set with default comparator', () => {
      const set = new DisjointIntervalSet();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
      expect(set.intervals()).toEqual([]);
    });

    it('should create empty set with custom comparator', () => {
      const set = new DisjointIntervalSet({ comparator: (a: number, b: number) => b - a });
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });
  });

  describe('add', () => {
    it('should add single interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      expect(set.size).toBe(1);
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should merge overlapping intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(3, 8);
      expect(set.size).toBe(1);
      expect(set.intervals()).toEqual([[1, 8]]);
    });

    it('should merge touching intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(5, 10);
      expect(set.size).toBe(1);
      expect(set.intervals()).toEqual([[1, 10]]);
    });

    it('should keep disjoint intervals separate', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.size).toBe(2);
      expect(set.intervals()).toEqual([[1, 5], [10, 15]]);
    });

    it('should handle invalid interval', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 1);
      expect(set.isEmpty()).toBe(true);
    });

    it('should handle interval with same start and end', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 5);
      expect(set.isEmpty()).toBe(true);
    });

    it('should maintain sorted order', () => {
      const set = new DisjointIntervalSet();
      set.add(10, 15);
      set.add(1, 5);
      set.add(20, 25);
      expect(set.intervals()).toEqual([[1, 5], [10, 15], [20, 25]]);
    });

    it('should merge multiple overlapping intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(3, 8);
      set.add(6, 10);
      expect(set.size).toBe(1);
      expect(set.intervals()).toEqual([[1, 10]]);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.add(-10, -5);
      set.add(-3, 0);
      expect(set.intervals()).toEqual([[-10, -5], [-3, 0]]);
    });

    it('should handle many intervals', () => {
      const set = new DisjointIntervalSet();
      for (let i = 0; i < 100; i += 2) {
        set.add(i, i + 1);
      }
      expect(set.size).toBe(50);
    });
  });

  describe('remove', () => {
    it('should remove single interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.remove(1, 5);
      expect(set.isEmpty()).toBe(true);
    });

    it('should remove part of interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      set.remove(4, 7);
      expect(set.intervals()).toEqual([[1, 4], [7, 10]]);
    });

    it('should remove from start of interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      set.remove(1, 5);
      expect(set.intervals()).toEqual([[5, 10]]);
    });

    it('should remove from end of interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      set.remove(5, 10);
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should remove overlapping intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.remove(3, 12);
      expect(set.intervals()).toEqual([[1, 3], [12, 15]]);
    });

    it('should do nothing for non-existent interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.remove(10, 15);
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should handle invalid interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.remove(10, 5);
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should remove all intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.add(20, 25);
      set.remove(0, 30);
      expect(set.isEmpty()).toBe(true);
    });

    it('should handle removal from empty set', () => {
      const set = new DisjointIntervalSet();
      set.remove(1, 5);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('contains', () => {
    it('should return true for point inside interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.contains(5)).toBe(true);
    });

    it('should return false for point outside interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.contains(15)).toBe(false);
    });

    it('should return true for point at start', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.contains(1)).toBe(true);
    });

    it('should return false for point at end', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.contains(10)).toBe(false);
    });

    it('should check multiple intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.contains(3)).toBe(true);
      expect(set.contains(12)).toBe(true);
      expect(set.contains(7)).toBe(false);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.add(-10, 0);
      expect(set.contains(-5)).toBe(true);
      expect(set.contains(5)).toBe(false);
    });
  });

  describe('containsInterval', () => {
    it('should return true for exact interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(1, 10)).toBe(true);
    });

    it('should return true for sub-interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(3, 7)).toBe(true);
    });

    it('should return false for super-interval', () => {
      const set = new DisjointIntervalSet();
      set.add(3, 7);
      expect(set.containsInterval(1, 10)).toBe(false);
    });

    it('should return false for overlapping interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(5, 15)).toBe(false);
    });

    it('should return false for non-overlapping interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(15, 20)).toBe(false);
    });

    it('should return false for invalid interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(10, 5)).toBe(false);
    });

    it('should return false for interval with same start and end', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.containsInterval(5, 5)).toBe(false);
    });
  });

  describe('overlaps', () => {
    it('should return true for overlapping intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.overlaps(5, 15)).toBe(true);
    });

    it('should return true for contained interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.overlaps(3, 7)).toBe(true);
    });

    it('should return true for containing interval', () => {
      const set = new DisjointIntervalSet();
      set.add(3, 7);
      expect(set.overlaps(1, 10)).toBe(true);
    });

    it('should return false for non-overlapping intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.overlaps(15, 20)).toBe(false);
    });

    it('should return false for adjacent intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.overlaps(10, 15)).toBe(false);
    });

    it('should return false for invalid interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.overlaps(10, 5)).toBe(false);
    });

    it('should check multiple intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.overlaps(3, 12)).toBe(true);
      expect(set.overlaps(6, 9)).toBe(false);
    });
  });

  describe('intervals', () => {
    it('should return copy of intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      const intervals = set.intervals();
      intervals[0][0] = 10;
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should return empty array for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.intervals()).toEqual([]);
    });

    it('should return all intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.add(20, 25);
      expect(set.intervals()).toEqual([[1, 5], [10, 15], [20, 25]]);
    });
  });

  describe('size', () => {
    it('should return 0 for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.size).toBe(0);
    });

    it('should return number of intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.size).toBe(2);
    });

    it('should update on add', () => {
      const set = new DisjointIntervalSet();
      expect(set.size).toBe(0);
      set.add(1, 5);
      expect(set.size).toBe(1);
      set.add(10, 15);
      expect(set.size).toBe(2);
    });

    it('should update on remove', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.size).toBe(2);
      set.remove(1, 5);
      expect(set.size).toBe(1);
    });

    it('should decrease on merge', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(3, 8);
      expect(set.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.isEmpty()).toBe(true);
    });

    it('should return false for non-empty set', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      expect(set.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.clear();
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.add(20, 25);
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should be idempotent', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.clear();
      set.clear();
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      set1.add(10, 15);
      const set2 = set1.clone();
      expect(set2.intervals()).toEqual([[1, 5], [10, 15]]);
    });

    it('should not share state', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = set1.clone();
      set2.add(10, 15);
      expect(set1.size).toBe(1);
      expect(set2.size).toBe(2);
    });

    it.skip('should preserve comparator', () => {
      const set1 = new DisjointIntervalSet({ comparator: (a: number, b: number) => b - a });
      set1.add(1, 5);
      const set2 = set1.clone();
      set2.add(3, 7);
      expect(set2.intervals()).toEqual([[1, 7]]);
    });
  });

  describe('union', () => {
    it('should union disjoint sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      set2.add(10, 15);
      const result = set1.union(set2);
      expect(result.intervals()).toEqual([[1, 5], [10, 15]]);
    });

    it('should union overlapping sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(5, 15);
      const result = set1.union(set2);
      expect(result.intervals()).toEqual([[1, 15]]);
    });

    it('should not modify original sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      set2.add(10, 15);
      set1.union(set2);
      expect(set1.intervals()).toEqual([[1, 5]]);
      expect(set2.intervals()).toEqual([[10, 15]]);
    });

    it('should union with empty set', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      const result = set1.union(set2);
      expect(result.intervals()).toEqual([[1, 5]]);
    });

    it('should union empty sets', () => {
      const set1 = new DisjointIntervalSet();
      const set2 = new DisjointIntervalSet();
      const result = set1.union(set2);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('intersect', () => {
    it('should intersect overlapping intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(5, 15);
      const result = set1.intersect(set2);
      expect(result.intervals()).toEqual([[5, 10]]);
    });

    it('should return empty for disjoint intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      set2.add(10, 15);
      const result = set1.intersect(set2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should intersect multiple intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      set1.add(10, 15);
      const set2 = new DisjointIntervalSet();
      set2.add(3, 7);
      set2.add(12, 18);
      const result = set1.intersect(set2);
      expect(result.intervals()).toEqual([[3, 5], [12, 15]]);
    });

    it('should not modify original sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(5, 15);
      set1.intersect(set2);
      expect(set1.intervals()).toEqual([[1, 10]]);
      expect(set2.intervals()).toEqual([[5, 15]]);
    });

    it('should intersect with empty set', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      const result = set1.intersect(set2);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('difference', () => {
    it('should remove overlapping intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(5, 15);
      const result = set1.difference(set2);
      expect(result.intervals()).toEqual([[1, 5]]);
    });

    it('should keep non-overlapping intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      set1.add(10, 15);
      const set2 = new DisjointIntervalSet();
      set2.add(3, 7);
      const result = set1.difference(set2);
      expect(result.intervals()).toEqual([[1, 3], [10, 15]]);
    });

    it('should return empty when fully covered', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(1, 10);
      const result = set1.difference(set2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should not modify original sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 10);
      const set2 = new DisjointIntervalSet();
      set2.add(5, 15);
      set1.difference(set2);
      expect(set1.intervals()).toEqual([[1, 10]]);
      expect(set2.intervals()).toEqual([[5, 15]]);
    });

    it('should difference with empty set', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      const result = set1.difference(set2);
      expect(result.intervals()).toEqual([[1, 5]]);
    });
  });

  describe('complement', () => {
    it('should return complement within bounds', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      const result = set.complement(0, 20);
      expect(result.intervals()).toEqual([[0, 5], [10, 20]]);
    });

    it('should return empty when set covers bounds', () => {
      const set = new DisjointIntervalSet();
      set.add(0, 20);
      const result = set.complement(0, 20);
      expect(result.isEmpty()).toBe(true);
    });

    it('should return full bounds for empty set', () => {
      const set = new DisjointIntervalSet();
      const result = set.complement(0, 20);
      expect(result.intervals()).toEqual([[0, 20]]);
    });

    it('should handle multiple intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      set.add(15, 20);
      const result = set.complement(0, 25);
      expect(result.intervals()).toEqual([[0, 5], [10, 15], [20, 25]]);
    });

    it('should handle interval at start', () => {
      const set = new DisjointIntervalSet();
      set.add(0, 10);
      const result = set.complement(0, 20);
      expect(result.intervals()).toEqual([[10, 20]]);
    });

    it('should handle interval at end', () => {
      const set = new DisjointIntervalSet();
      set.add(10, 20);
      const result = set.complement(0, 20);
      expect(result.intervals()).toEqual([[0, 10]]);
    });

    it('should return empty for invalid bounds', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      const result = set.complement(20, 10);
      expect(result.isEmpty()).toBe(true);
    });

    it('should handle negative bounds', () => {
      const set = new DisjointIntervalSet();
      set.add(-5, 5);
      const result = set.complement(-10, 10);
      expect(result.intervals()).toEqual([[-10, -5], [5, 10]]);
    });
  });

  describe('gaps', () => {
    it('should return gaps within bounds', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      const result = set.gaps(0, 20);
      expect(result.intervals()).toEqual([[0, 5], [10, 20]]);
    });

    it('should be same as complement', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      const complement = set.complement(0, 20);
      const gaps = set.gaps(0, 20);
      expect(complement.intervals()).toEqual(gaps.intervals());
    });
  });

  describe('length', () => {
    it('should return 0 for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.length).toBe(0);
    });

    it('should sum interval lengths', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.length).toBe(9);
    });

    it('should handle single interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.length).toBe(9);
    });

    it('should update on add', () => {
      const set = new DisjointIntervalSet();
      expect(set.length).toBe(0);
      set.add(1, 5);
      expect(set.length).toBe(4);
      set.add(10, 15);
      expect(set.length).toBe(9);
    });

    it('should update on remove', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 15);
      expect(set.length).toBe(14);
      set.remove(5, 10);
      expect(set.length).toBe(9);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.add(-10, -5);
      expect(set.length).toBe(5);
    });
  });

  describe('forEach', () => {
    it('should iterate over all intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.add(20, 25);
      const intervals: [number, number][] = [];
      set.forEach((from, to) => {
        intervals.push([from, to]);
      });
      expect(intervals).toEqual([[1, 5], [10, 15], [20, 25]]);
    });

    it('should provide correct index', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      const indices: number[] = [];
      set.forEach((from, to, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1]);
    });

    it('should not call for empty set', () => {
      const set = new DisjointIntervalSet();
      let called = false;
      set.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('iterator', () => {
    it('should iterate over all intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      const intervals = [...set];
      expect(intervals).toEqual([[1, 5], [10, 15]]);
    });

    it('should work with for-of', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      const result: [number, number][] = [];
      for (const interval of set) {
        result.push(interval);
      }
      expect(result).toEqual([[1, 5], [10, 15]]);
    });

    it('should return empty iterator for empty set', () => {
      const set = new DisjointIntervalSet();
      const intervals = [...set];
      expect(intervals).toEqual([]);
    });
  });

  describe('fromIntervals', () => {
    it('should create set from array of intervals', () => {
      const intervals: [number, number][] = [[1, 5], [10, 15], [20, 25]];
      const set = DisjointIntervalSet.fromIntervals(intervals);
      expect(set.intervals()).toEqual([[1, 5], [10, 15], [20, 25]]);
    });

    it('should merge overlapping intervals', () => {
      const intervals: [number, number][] = [[1, 5], [3, 8], [10, 15]];
      const set = DisjointIntervalSet.fromIntervals(intervals);
      expect(set.intervals()).toEqual([[1, 8], [10, 15]]);
    });

    it('should handle empty array', () => {
      const set = DisjointIntervalSet.fromIntervals([]);
      expect(set.isEmpty()).toBe(true);
    });

    it('should accept iterable', () => {
      const intervals = new Set<[number, number]>([[1, 5], [10, 15]]);
      const set = DisjointIntervalSet.fromIntervals(intervals);
      expect(set.intervals()).toEqual([[1, 5], [10, 15]]);
    });

    it.skip('should use custom comparator', () => {
      const intervals: [number, number][] = [[1, 5], [10, 15]];
      const set = DisjointIntervalSet.fromIntervals(intervals, {
        comparator: (a: number, b: number) => b - a,
      });
      expect(set.intervals()).toEqual([[1, 5], [10, 15]]);
    });
  });

  describe('min', () => {
    it('should return undefined for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.min()).toBe(undefined);
    });

    it('should return start of first interval', () => {
      const set = new DisjointIntervalSet();
      set.add(10, 15);
      set.add(1, 5);
      set.add(20, 25);
      expect(set.min()).toBe(1);
    });

    it('should handle single interval', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      expect(set.min()).toBe(5);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.add(-10, -5);
      set.add(1, 5);
      expect(set.min()).toBe(-10);
    });
  });

  describe('max', () => {
    it('should return undefined for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.max()).toBe(undefined);
    });

    it('should return end of last interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      set.add(20, 25);
      expect(set.max()).toBe(25);
    });

    it('should handle single interval', () => {
      const set = new DisjointIntervalSet();
      set.add(5, 10);
      expect(set.max()).toBe(10);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.add(-10, -5);
      set.add(1, 5);
      expect(set.max()).toBe(5);
    });
  });

  describe('encloses', () => {
    it('should return true for exact interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.encloses(1, 10)).toBe(true);
    });

    it('should return true for sub-interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.encloses(3, 7)).toBe(true);
    });

    it('should return false for super-interval', () => {
      const set = new DisjointIntervalSet();
      set.add(3, 7);
      expect(set.encloses(1, 10)).toBe(false);
    });

    it('should return false for overlapping interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.encloses(5, 15)).toBe(false);
    });

    it('should return false for non-overlapping interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.encloses(15, 20)).toBe(false);
    });

    it('should be same as containsInterval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.encloses(3, 7)).toBe(set.containsInterval(3, 7));
    });
  });

  describe('equals', () => {
    it('should return true for equal sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      set1.add(10, 15);
      const set2 = new DisjointIntervalSet();
      set2.add(1, 5);
      set2.add(10, 15);
      expect(set1.equals(set2)).toBe(true);
    });

    it('should return false for different sets', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      set1.add(10, 15);
      const set2 = new DisjointIntervalSet();
      set2.add(2, 6);
      set2.add(11, 16);
      expect(set1.equals(set2)).toBe(false);
    });

    it('should return false for different sizes', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      set2.add(1, 5);
      set2.add(10, 15);
      expect(set1.equals(set2)).toBe(false);
    });

    it('should return true for empty sets', () => {
      const set1 = new DisjointIntervalSet();
      const set2 = new DisjointIntervalSet();
      expect(set1.equals(set2)).toBe(true);
    });

    it('should handle different order but same intervals', () => {
      const set1 = new DisjointIntervalSet();
      set1.add(10, 15);
      set1.add(1, 5);
      const set2 = new DisjointIntervalSet();
      set2.add(1, 5);
      set2.add(10, 15);
      expect(set1.equals(set2)).toBe(true);
    });
  });

  describe('expand', () => {
    it('should add point as interval', () => {
      const set = new DisjointIntervalSet();
      set.expand(5);
      expect(set.contains(5)).toBe(true);
    });

    it('should merge with adjacent interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.expand(5);
      expect(set.intervals()).toEqual([[1, 6]]);
    });

    it('should merge with overlapping interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.expand(4);
      expect(set.intervals()).toEqual([[1, 5]]);
    });

    it('should create new interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.expand(10);
      expect(set.intervals()).toEqual([[1, 5], [10, 11]]);
    });

    it('should handle negative numbers', () => {
      const set = new DisjointIntervalSet();
      set.expand(-5);
      expect(set.contains(-5)).toBe(true);
    });
  });

  describe('intersectPoint', () => {
    it('should return point if in interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.intersectPoint(5)).toBe(5);
    });

    it('should return undefined if not in interval', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.intersectPoint(15)).toBe(undefined);
    });

    it('should return point at start', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.intersectPoint(1)).toBe(1);
    });

    it('should return undefined for point at end', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 10);
      expect(set.intersectPoint(10)).toBe(undefined);
    });

    it('should check multiple intervals', () => {
      const set = new DisjointIntervalSet();
      set.add(1, 5);
      set.add(10, 15);
      expect(set.intersectPoint(3)).toBe(3);
      expect(set.intersectPoint(12)).toBe(12);
      expect(set.intersectPoint(7)).toBe(undefined);
    });

    it('should return undefined for empty set', () => {
      const set = new DisjointIntervalSet();
      expect(set.intersectPoint(5)).toBe(undefined);
    });
  });

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const set = new DisjointIntervalSet({ comparator: (a: number, b: number) => b - a });
      set.add(15, 10);
      set.add(5, 1);
      expect(set.intervals()).toEqual([[15, 10], [5, 1]]);
    });

    it.skip('should maintain order with reverse comparator', () => {
      const set = new DisjointIntervalSet({ comparator: (a: number, b: number) => b - a });
      set.add(20, 10);
      set.add(30, 20);
      expect(set.intervals()).toEqual([[30, 20], [20, 10]]);
    });
  });

  describe('stress tests', () => {
    it('should handle many random intervals', () => {
      const set = new DisjointIntervalSet();
      for (let i = 0; i < 1000; i++) {
        const from = Math.floor(Math.random() * 1000);
        const to = from + Math.floor(Math.random() * 100) + 1;
        set.add(from, to);
      }
      expect(set.size).toBeLessThan(1000);
    });

    it('should handle many removes', () => {
      const set = new DisjointIntervalSet();
      for (let i = 0; i < 1000; i += 2) {
        set.add(i, i + 1);
      }
      expect(set.size).toBe(500);
      for (let i = 0; i < 500; i++) {
        set.remove(i * 2, i * 2 + 1);
      }
      expect(set.isEmpty()).toBe(true);
    });

    it.skip('should handle complex operations', () => {
      const set = new DisjointIntervalSet();
      for (let i = 0; i < 100; i++) {
        set.add(i * 10, i * 10 + 5);
      }
      for (let i = 0; i < 50; i++) {
        set.remove(i * 10 + 2, i * 10 + 3);
      }
      expect(set.size).toBe(100);
    });
  });
});
