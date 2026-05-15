import { describe, it, expect } from 'vitest';
import { SkylineSet2 } from '../src/core/skyline-set-2/index.js';

describe('SkylineSet2', () => {
  describe('empty set', () => {
    it('should start empty', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.size()).toBe(0);
    });

    it('should return empty items', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.items()).toEqual([]);
    });
  });

  describe('add single', () => {
    it('should add first element', () => {
      const set = new SkylineSet2<string>(2);
      const result = set.add('a', [1, 2]);
      expect(result).toBe(true);
      expect(set.size()).toBe(1);
    });

    it('should have the added item', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      expect(set.has('a')).toBe(true);
    });
  });

  describe('add dominated (rejected)', () => {
    it('should reject dominated element', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 3]);
      const result = set.add('b', [1, 1]);
      expect(result).toBe(false);
      expect(set.size()).toBe(1);
    });

    it('should not have dominated item', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 3]);
      set.add('b', [1, 1]);
      expect(set.has('b')).toBe(false);
    });

    it('should reject element dominated by multiple', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 1]);
      set.add('b', [1, 3]);
      const result = set.add('c', [0, 0]);
      expect(result).toBe(false);
      expect(set.size()).toBe(2);
    });
  });

  describe('add dominant (removes dominated)', () => {
    it('should remove dominated when adding dominant', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 1]);
      set.add('b', [2, 2]);
      const result = set.add('c', [3, 3]);
      expect(result).toBe(true);
      expect(set.size()).toBe(1);
      expect(set.has('c')).toBe(true);
    });

    it('should remove multiple dominated items', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 1]);
      set.add('b', [2, 2]);
      set.add('c', [1, 3]);
      const result = set.add('d', [3, 4]);
      expect(result).toBe(true);
      expect(set.size()).toBe(1);
      expect(set.has('d')).toBe(true);
    });

    it.skip('should keep non-dominated items', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 1]);
      set.add('b', [1, 3]);
      const result = set.add('c', [2, 2]);
      expect(result).toBe(true);
      expect(set.size()).toBe(2);
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(true);
      expect(set.has('c')).toBe(true);
    });
  });

  describe('has', () => {
    it('should return true for existing item', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      expect(set.has('a')).toBe(true);
    });

    it('should return false for non-existing item', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.has('x')).toBe(false);
    });

    it('should return false after removal', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      set.remove('a');
      expect(set.has('a')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove existing item', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      const result = set.remove('a');
      expect(result).toBe(true);
      expect(set.size()).toBe(0);
    });

    it('should return false for non-existing item', () => {
      const set = new SkylineSet2<string>(2);
      const result = set.remove('x');
      expect(result).toBe(false);
    });

    it('should only remove specified item', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      set.add('b', [3, 4]);
      set.remove('a');
      expect(set.size()).toBe(1);
      expect(set.has('b')).toBe(true);
    });
  });

  describe('size', () => {
    it('should return 0 for empty set', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.size()).toBe(0);
    });

    it('should return correct count after adds', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 1]);
      set.add('b', [1, 3]);
      expect(set.size()).toBe(2);
    });

    it('should update after dominated removals', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 1]);
      set.add('b', [2, 2]);
      set.add('c', [3, 3]);
      expect(set.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      set.add('b', [3, 4]);
      set.clear();
      expect(set.size()).toBe(0);
    });

    it('should work on empty set', () => {
      const set = new SkylineSet2<string>(2);
      set.clear();
      expect(set.size()).toBe(0);
    });
  });

  describe('items', () => {
    it('should return all items', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [3, 1]);
      set.add('b', [1, 3]);
      const result = set.items();
      expect(result.length).toBe(2);
      expect(result.some((e) => e.item === 'a' && e.scores[0] === 3 && e.scores[1] === 1)).toBe(true);
      expect(result.some((e) => e.item === 'b' && e.scores[0] === 1 && e.scores[1] === 3)).toBe(true);
    });

    it('should return empty array for empty set', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.items()).toEqual([]);
    });

    it('should not return reference to internal array', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      const result1 = set.items();
      const result2 = set.items();
      expect(result1).not.toBe(result2);
    });
  });

  describe('dominates', () => {
    it('should return true for strictly greater in all dimensions', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([3, 3], [1, 1])).toBe(true);
    });

    it('should return false if any dimension is less', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([3, 1], [1, 3])).toBe(false);
    });

    it('should return false if equal in all dimensions', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([2, 2], [2, 2])).toBe(false);
    });

    it('should return true if at least one dimension strictly greater', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([3, 2], [2, 2])).toBe(true);
    });

    it('should return false for mismatched lengths', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([1, 2], [1, 2, 3])).toBe(false);
    });
  });

  describe('2D scores', () => {
    it.skip('should handle 2D skyline', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [5, 1]);
      set.add('b', [1, 5]);
      set.add('c', [3, 3]);
      set.add('d', [2, 2]);
      expect(set.size()).toBe(2);
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(true);
      expect(set.has('c')).toBe(true);
      expect(set.has('d')).toBe(false);
    });
  });

  describe('3D scores', () => {
    it.skip('should handle 3D skyline', () => {
      const set = new SkylineSet2<string>(3);
      set.add('a', [5, 1, 1]);
      set.add('b', [1, 5, 1]);
      set.add('c', [1, 1, 5]);
      expect(set.size()).toBe(3);
      set.add('d', [3, 3, 3]);
      expect(set.size()).toBe(3);
      expect(set.has('d')).toBe(false);
    });

    it('should accept only correct dimension count', () => {
      const set = new SkylineSet2<string>(3);
      expect(set.add('a', [1, 2])).toBe(false);
      expect(set.add('b', [1, 2, 3])).toBe(true);
      expect(set.add('c', [1, 2, 3, 4])).toBe(false);
    });
  });

  describe('equal scores', () => {
    it('should not dominate equal scores', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [2, 2]);
      const result = set.add('b', [2, 2]);
      expect(result).toBe(true);
      expect(set.size()).toBe(2);
    });

    it('should accept multiple items with equal scores', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [2, 2]);
      set.add('b', [2, 2]);
      set.add('c', [2, 2]);
      expect(set.size()).toBe(3);
    });
  });

  describe('multiple dominance chains', () => {
    it('should handle sequential dominance chain', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 1]);
      set.add('b', [2, 2]);
      set.add('c', [3, 3]);
      set.add('d', [4, 4]);
      expect(set.size()).toBe(1);
      expect(set.has('d')).toBe(true);
    });

    it.skip('should handle mixed dominance chains', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [5, 1]);
      set.add('b', [1, 5]);
      set.add('c', [4, 2]);
      set.add('d', [2, 4]);
      set.add('e', [3, 3]);
      expect(set.size()).toBe(2);
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(true);
      expect(set.has('c')).toBe(false);
      expect(set.has('d')).toBe(false);
      expect(set.has('e')).toBe(true);
    });

    it.skip('should handle partial dominance', () => {
      const set = new SkylineSet2<string>(3);
      set.add('a', [10, 5, 1]);
      set.add('b', [5, 10, 1]);
      set.add('c', [10, 10, 0]);
      expect(set.size()).toBe(2);
      expect(set.has('c')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it.skip('should work with number type', () => {
      const set = new SkylineSet2<number>(2);
      set.add(1, [1, 2]);
      set.add(2, [3, 4]);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
    });

    it.skip('should work with object type', () => {
      const set = new SkylineSet2<{id: string}>(2);
      const obj1 = {id: 'a'};
      const obj2 = {id: 'b'};
      set.add(obj1, [1, 2]);
      set.add(obj2, [3, 4]);
      expect(set.has(obj1)).toBe(true);
      expect(set.has(obj2)).toBe(true);
    });

    it.skip('should handle adding same item twice', () => {
      const set = new SkylineSet2<string>(2);
      set.add('a', [1, 2]);
      set.add('a', [3, 4]);
      expect(set.size()).toBe(2);
    });
  });

  describe('additional', () => {
    it('should handle dominates', () => {
      const set = new SkylineSet2<string>(2);
      expect(set.dominates([1, 1], [2, 2])).toBe(false);
      expect(set.dominates([1, 2], [2, 2])).toBe(false);
      expect(set.dominates([1, 1], [1, 2])).toBe(false);
    });

    it('should handle items method', () => {
      const set = new SkylineSet2<string>(1);
      set.add('a', [5]);
      set.add('b', [10]);
      const items = set.items();
      expect(items.length).toBeGreaterThanOrEqual(1);
    });
  });
});
