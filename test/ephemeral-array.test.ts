import { describe, it, expect, beforeEach } from 'vitest';
import { EphemeralArray } from '../src/core/ephemeral-array/index.js';

describe('EphemeralArray', () => {
  let arr: EphemeralArray<number>;

  beforeEach(() => {
    arr = new EphemeralArray([1, 2, 3, 4, 5]);
  });

  describe('constructor', () => {
    it('creates array from initial data', () => {
      const array = new EphemeralArray([1, 2, 3]);
      expect(array.size).toBe(3);
      expect(array.toArray()).toEqual([1, 2, 3]);
    });

    it('creates array with size and default value', () => {
      const array = new EphemeralArray(3, 0);
      expect(array.size).toBe(3);
      expect(array.toArray()).toEqual([0, 0, 0]);
    });

    it('creates array with size only', () => {
      const array = new EphemeralArray(3);
      expect(array.size).toBe(3);
      expect(array.toArray()).toEqual([undefined, undefined, undefined]);
    });

    it('creates empty array without arguments', () => {
      const array = new EphemeralArray();
      expect(array.size).toBe(0);
      expect(array.isEmpty).toBe(true);
    });

    it('creates array from empty initial data', () => {
      const array = new EphemeralArray([]);
      expect(array.size).toBe(0);
      expect(array.isEmpty).toBe(true);
    });

    it('creates root version 0', () => {
      const array = new EphemeralArray([1, 2, 3]);
      expect(array.getLatestVersion()).toBe(0);
      expect(array.hasVersion(0)).toBe(true);
    });
  });

  describe('get', () => {
    it('returns value at index for current version', () => {
      expect(arr.get(0)).toBe(1);
      expect(arr.get(2)).toBe(3);
      expect(arr.get(4)).toBe(5);
    });

    it('returns value at index for specific version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.get(0, 0)).toBe(1);
      expect(arr.get(0, v1)).toBe(10);
    });

    it('returns value for latest version when not specified', () => {
      const v1 = arr.set(0, 10);
      expect(arr.get(0)).toBe(10);
    });

    it('throws error for negative index', () => {
      expect(() => arr.get(-1)).toThrow(RangeError);
    });

    it('throws error for index out of bounds', () => {
      expect(() => arr.get(10)).toThrow(RangeError);
    });

    it('returns base value for unmodified index', () => {
      const v1 = arr.set(0, 10);
      expect(arr.get(1, v1)).toBe(2);
    });

    it('handles undefined values', () => {
      const array = new EphemeralArray(3);
      expect(array.get(0)).toBe(undefined);
    });
  });

  describe('set', () => {
    it('sets value and returns new version id', () => {
      const v1 = arr.set(0, 10);
      expect(typeof v1).toBe('number');
      expect(v1).toBeGreaterThan(0);
    });

    it('updates value in new version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.get(0, v1)).toBe(10);
      expect(arr.get(0, 0)).toBe(1);
    });

    it('increments version id on each set', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.set(2, 30);
      expect(v2).toBe(v1 + 1);
      expect(v3).toBe(v2 + 1);
    });

    it('updates current version after set', () => {
      const v1 = arr.set(0, 10);
      expect(arr.getLatestVersion()).toBe(v1);
    });

    it('throws error for negative index', () => {
      expect(() => arr.set(-1, 10)).toThrow(RangeError);
    });

    it('throws error for index out of bounds', () => {
      expect(() => arr.set(10, 10)).toThrow(RangeError);
    });

    it('allows setting same index multiple times', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(0, 20);
      expect(arr.get(0, v1)).toBe(10);
      expect(arr.get(0, v2)).toBe(20);
    });

    it('sets value without affecting other indices', () => {
      const v1 = arr.set(2, 30);
      expect(arr.get(0, v1)).toBe(1);
      expect(arr.get(1, v1)).toBe(2);
      expect(arr.get(3, v1)).toBe(4);
    });
  });

  describe('snapshot', () => {
    it('returns current version id', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      expect(arr.snapshot()).toBe(v2);
    });

    it('does not create new version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const snapshot = arr.snapshot();
      expect(arr.getLatestVersion()).toBe(v2);
      expect(snapshot).toBe(v2);
    });

    it('returns root version 0 for new array', () => {
      const array = new EphemeralArray([1, 2, 3]);
      expect(array.snapshot()).toBe(0);
    });
  });

  describe('getLatestVersion', () => {
    it('returns current version id', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      expect(arr.getLatestVersion()).toBe(v2);
    });

    it('returns 0 for new array', () => {
      const array = new EphemeralArray([1, 2, 3]);
      expect(array.getLatestVersion()).toBe(0);
    });

    it('returns version after multiple operations', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      arr.checkout(v1);
      const v3 = arr.set(2, 30);
      expect(arr.getLatestVersion()).toBe(v3);
    });
  });

  describe('getVersion', () => {
    it('returns version id if exists', () => {
      const v1 = arr.set(0, 10);
      expect(arr.getVersion(v1)).toBe(v1);
    });

    it('returns root version 0', () => {
      expect(arr.getVersion(0)).toBe(0);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.getVersion(999)).toThrow(RangeError);
    });

    it('throws error with descriptive message', () => {
      expect(() => arr.getVersion(999)).toThrow('Version 999 does not exist');
    });
  });

  describe('size', () => {
    it('returns array length', () => {
      expect(arr.size).toBe(5);
    });

    it('returns 0 for empty array', () => {
      const array = new EphemeralArray();
      expect(array.size).toBe(0);
    });

    it('returns size for array created with size parameter', () => {
      const array = new EphemeralArray(10);
      expect(array.size).toBe(10);
    });

    it('remains constant after operations', () => {
      const sizeBefore = arr.size;
      arr.set(0, 10);
      arr.set(1, 20);
      expect(arr.size).toBe(sizeBefore);
    });
  });

  describe('isEmpty', () => {
    it('returns false for non-empty array', () => {
      expect(arr.isEmpty).toBe(false);
    });

    it('returns true for empty array', () => {
      const array = new EphemeralArray();
      expect(array.isEmpty).toBe(true);
    });

    it('returns false for array with undefined values', () => {
      const array = new EphemeralArray(3);
      expect(array.isEmpty).toBe(false);
    });
  });

  describe('toArray', () => {
    it('returns array for current version', () => {
      expect(arr.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns array for specific version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.toArray(0)).toEqual([1, 2, 3, 4, 5]);
      expect(arr.toArray(v1)).toEqual([10, 2, 3, 4, 5]);
    });

    it('returns independent copy', () => {
      const arr1 = arr.toArray();
      arr1[0] = 100;
      expect(arr.get(0)).toBe(1);
    });

    it('returns empty array for empty array', () => {
      const array = new EphemeralArray();
      expect(array.toArray()).toEqual([]);
    });
  });

  describe('checkout', () => {
    it('sets current version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      arr.checkout(v1);
      expect(arr.getLatestVersion()).toBe(v1);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(2);
    });

    it('allows operations after checkout', () => {
      const v1 = arr.set(0, 10);
      arr.checkout(v1);
      const v2 = arr.set(1, 20);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.checkout(999)).toThrow(RangeError);
    });

    it('allows checkout to root version', () => {
      arr.set(0, 10);
      arr.set(1, 20);
      arr.checkout(0);
      expect(arr.getLatestVersion()).toBe(0);
      expect(arr.get(0)).toBe(1);
    });
  });

  describe('fork', () => {
    it('creates new version from existing version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(typeof v2).toBe('number');
      expect(v2).toBeGreaterThan(v1);
    });

    it('sets new version as current', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.getLatestVersion()).toBe(v2);
    });

    it('preserves data from forked version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.get(0, v2)).toBe(10);
      expect(arr.get(1, v2)).toBe(2);
    });

    it('allows independent modifications after fork', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const v3 = arr.set(1, 20);
      expect(arr.get(0, v3)).toBe(10);
      expect(arr.get(1, v3)).toBe(20);
      expect(arr.get(1, v2)).toBe(2);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.fork(999)).toThrow(RangeError);
    });

    it('creates version with empty deltas', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.get(0, v2)).toBe(10);
    });

    it('allows multiple forks from same version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const v3 = arr.fork(v1);
      expect(v2).not.toBe(v3);
      expect(arr.get(0, v2)).toBe(10);
      expect(arr.get(0, v3)).toBe(10);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const result: number[] = [];
      arr.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('provides index parameter', () => {
      const indices: number[] = [];
      arr.forEach((_, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it('iterates over specific version', () => {
      const v1 = arr.set(0, 10);
      const result: number[] = [];
      arr.forEach((value) => {
        result.push(value);
      }, v1);
      expect(result).toEqual([10, 2, 3, 4, 5]);
    });

    it('handles empty array', () => {
      const array = new EphemeralArray();
      let called = false;
      array.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('map', () => {
    it('transforms all elements', () => {
      const result = arr.map((value) => value * 2);
      expect(result).toEqual([2, 4, 6, 8, 10]);
    });

    it('provides index parameter', () => {
      const result = arr.map((value, index) => index);
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('maps specific version', () => {
      const v1 = arr.set(0, 10);
      const result = arr.map((value) => value, v1);
      expect(result).toEqual([10, 2, 3, 4, 5]);
    });

    it('handles empty array', () => {
      const array = new EphemeralArray();
      const result = array.map((value) => value);
      expect(result).toEqual([]);
    });

    it('supports different output type', () => {
      const result = arr.map((value) => value.toString());
      expect(result).toEqual(['1', '2', '3', '4', '5']);
    });
  });

  describe('versions', () => {
    it('returns count of versions', () => {
      expect(arr.versions).toBe(1);
      arr.set(0, 10);
      expect(arr.versions).toBe(2);
      arr.set(1, 20);
      expect(arr.versions).toBe(3);
    });

    it('includes root version', () => {
      const array = new EphemeralArray([1, 2, 3]);
      expect(array.versions).toBe(1);
    });

    it('tracks forks separately', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.versions).toBe(3);
    });
  });

  describe('parentOf', () => {
    it('returns parent id for version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      expect(arr.parentOf(v2)).toBe(v1);
    });

    it('returns null for root version', () => {
      expect(arr.parentOf(0)).toBe(null);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.parentOf(999)).toThrow(RangeError);
    });

    it('returns parent for forked version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.parentOf(v2)).toBe(v1);
    });
  });

  describe('hasVersion', () => {
    it('returns true for existing version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.hasVersion(v1)).toBe(true);
      expect(arr.hasVersion(0)).toBe(true);
    });

    it('returns false for non-existent version', () => {
      expect(arr.hasVersion(999)).toBe(false);
    });

    it('returns true for all versions in chain', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      expect(arr.hasVersion(0)).toBe(true);
      expect(arr.hasVersion(v1)).toBe(true);
      expect(arr.hasVersion(v2)).toBe(true);
    });
  });

  describe('versionExists', () => {
    it('returns true for existing version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.versionExists(v1)).toBe(true);
      expect(arr.versionExists(0)).toBe(true);
    });

    it('returns false for non-existent version', () => {
      expect(arr.versionExists(999)).toBe(false);
    });

    it('behaves same as hasVersion', () => {
      const v1 = arr.set(0, 10);
      expect(arr.versionExists(v1)).toBe(arr.hasVersion(v1));
      expect(arr.versionExists(0)).toBe(arr.hasVersion(0));
      expect(arr.versionExists(999)).toBe(arr.hasVersion(999));
    });
  });

  describe('equals', () => {
    it('returns true for identical versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.equals(v1, v2)).toBe(true);
    });

    it('returns false for different versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      expect(arr.equals(v1, v2)).toBe(false);
    });

    it('returns true for same version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.equals(v1, v1)).toBe(true);
    });

    it('compares root with modified version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.equals(0, v1)).toBe(false);
    });

    it('handles empty arrays', () => {
      const array = new EphemeralArray();
      expect(array.equals(0, 0)).toBe(true);
    });

    it('compares arrays with same values but different versions', () => {
      const v1 = arr.set(0, 1);
      const v2 = arr.set(0, 1);
      expect(arr.equals(v1, v2)).toBe(true);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.equals(0, 999)).toThrow(RangeError);
    });
  });

  describe('diff', () => {
    it('returns empty map for identical versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const diff = arr.diff(v1, v2);
      expect(diff.size).toBe(0);
    });

    it('returns differences between versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const diff = arr.diff(v1, v2);
      expect(diff.size).toBeGreaterThanOrEqual(1);
    });

    it('includes all changed indices', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(0, 100);
      const v3 = arr.set(2, 200);
      const diff = arr.diff(v2, v3);
      expect(diff.size).toBeGreaterThanOrEqual(1);
    });

    it('handles empty arrays', () => {
      const array = new EphemeralArray();
      const diff = array.diff(0, 0);
      expect(diff.size).toBe(0);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.diff(0, 999)).toThrow(RangeError);
    });
  });

  describe('reset', () => {
    it('resets to root version 0', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      arr.reset();
      expect(arr.getLatestVersion()).toBe(0);
      expect(arr.get(0)).toBe(1);
    });

    it('does not delete versions', () => {
      const v1 = arr.set(0, 10);
      arr.reset();
      expect(arr.hasVersion(v1)).toBe(true);
    });

    it('allows operations after reset', () => {
      const v1 = arr.set(0, 10);
      arr.reset();
      const v2 = arr.set(1, 20);
      expect(arr.getLatestVersion()).toBe(v2);
      expect(arr.get(0)).toBe(1);
      expect(arr.get(1)).toBe(20);
    });

    it('handles multiple resets', () => {
      const v1 = arr.set(0, 10);
      arr.reset();
      arr.reset();
      expect(arr.getLatestVersion()).toBe(0);
    });
  });

  describe('branch', () => {
    it('creates branch from version with modification', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.branch(v1, 1, 20);
      expect(typeof v2).toBe('number');
      expect(v2).toBeGreaterThan(v1);
    });

    it('does not update current version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.branch(v1, 1, 20);
      expect(arr.getLatestVersion()).toBe(v1);
    });

    it('applies modification at branch point', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.branch(v1, 1, 20);
      expect(arr.get(1, v2)).toBe(20);
    });

    it('preserves other values from branch version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.branch(v1, 1, 20);
      expect(arr.get(0, v2)).toBe(10);
      expect(arr.get(2, v2)).toBe(3);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.branch(999, 0, 10)).toThrow(RangeError);
    });

    it('throws error for invalid index', () => {
      const v1 = arr.set(0, 10);
      expect(() => arr.branch(v1, 10, 20)).toThrow(RangeError);
    });

    it('allows multiple branches from same version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.branch(v1, 1, 20);
      const v3 = arr.branch(v1, 2, 30);
      expect(arr.get(1, v2)).toBe(20);
      expect(arr.get(2, v3)).toBe(30);
    });
  });

  describe('lineage', () => {
    it('returns array of version ids from root to version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.set(2, 30);
      const lineage = arr.lineage(v3);
      expect(lineage).toEqual([v3, v2, v1, 0]);
    });

    it('includes root version 0', () => {
      const v1 = arr.set(0, 10);
      const lineage = arr.lineage(v1);
      expect(lineage).toContain(0);
      expect(lineage[lineage.length - 1]).toBe(0);
    });

    it('returns single element for root version', () => {
      const lineage = arr.lineage(0);
      expect(lineage).toEqual([0]);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.lineage(999)).toThrow(RangeError);
    });

    it('handles forks correctly', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const v3 = arr.set(1, 20);
      const lineage2 = arr.lineage(v2);
      const lineage3 = arr.lineage(v3);
      expect(lineage2).toContain(0);
      expect(lineage3).toContain(0);
    });
  });

  describe('childrenOf', () => {
    it('returns empty array for version with no children', () => {
      const v1 = arr.set(0, 10);
      const children = arr.childrenOf(v1);
      expect(children).toEqual([]);
    });

    it('returns child versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.fork(v1);
      const children1 = arr.childrenOf(v1);
      const children2 = arr.childrenOf(v2);
      expect(children1).toContain(v2);
      expect(children1).toContain(v3);
      expect(children2).toEqual([]);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.childrenOf(999)).toThrow(RangeError);
    });

    it('handles multiple children', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.fork(v1);
      const v4 = arr.fork(v1);
      const v5 = arr.fork(v1);
      const children = arr.childrenOf(v1);
      expect(children.length).toBe(4);
      expect(children).toContain(v2);
      expect(children).toContain(v3);
      expect(children).toContain(v4);
      expect(children).toContain(v5);
    });
  });

  describe('rootVersion', () => {
    it('returns 0', () => {
      expect(arr.rootVersion()).toBe(0);
    });

    it('returns 0 after operations', () => {
      arr.set(0, 10);
      arr.set(1, 20);
      arr.fork(0);
      expect(arr.rootVersion()).toBe(0);
    });

    it('returns 0 for empty array', () => {
      const array = new EphemeralArray();
      expect(array.rootVersion()).toBe(0);
    });
  });

  describe('isRoot', () => {
    it('returns true for root version', () => {
      expect(arr.isRoot(0)).toBe(true);
    });

    it('returns false for non-root version', () => {
      const v1 = arr.set(0, 10);
      expect(arr.isRoot(v1)).toBe(false);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.isRoot(999)).toThrow(RangeError);
    });

    it('returns false for forked version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.isRoot(v2)).toBe(false);
    });
  });

  describe('depthOf', () => {
    it('returns 0 for root version', () => {
      expect(arr.depthOf(0)).toBe(0);
    });

    it('returns depth of version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.set(2, 30);
      expect(arr.depthOf(v1)).toBe(1);
      expect(arr.depthOf(v2)).toBe(2);
      expect(arr.depthOf(v3)).toBe(3);
    });

    it('handles forks correctly', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      expect(arr.depthOf(v2)).toBe(2);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.depthOf(999)).toThrow(RangeError);
    });
  });

  describe('setMany', () => {
    it('sets multiple values and returns new version', () => {
      const v1 = arr.setMany([[0, 10], [2, 30]]);
      expect(typeof v1).toBe('number');
      expect(arr.get(0, v1)).toBe(10);
      expect(arr.get(2, v1)).toBe(30);
    });

    it('updates current version', () => {
      const v1 = arr.setMany([[0, 10], [1, 20]]);
      expect(arr.getLatestVersion()).toBe(v1);
    });

    it('preserves unmodified indices', () => {
      const v1 = arr.setMany([[0, 10], [2, 30]]);
      expect(arr.get(1, v1)).toBe(2);
      expect(arr.get(3, v1)).toBe(4);
    });

    it('handles empty updates array', () => {
      const v1 = arr.setMany([]);
      expect(typeof v1).toBe('number');
      expect(arr.toArray(v1)).toEqual(arr.toArray());
    });

    it('throws error for invalid index', () => {
      expect(() => arr.setMany([[0, 10], [10, 20]])).toThrow(RangeError);
    });

    it('handles multiple updates to same index', () => {
      const v1 = arr.setMany([[0, 10], [0, 20]]);
      expect(arr.get(0, v1)).toBe(20);
    });
  });

  describe('setAt', () => {
    it('sets value at specific version and returns new version', () => {
      const v1 = arr.setAt(0, 0, 10);
      expect(typeof v1).toBe('number');
      expect(arr.get(0, v1)).toBe(10);
    });

    it('does not update current version', () => {
      const v1 = arr.setAt(0, 0, 10);
      expect(arr.getLatestVersion()).toBe(0);
    });

    it('creates branch from specified version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.setAt(v1, 1, 20);
      expect(arr.parentOf(v2)).toBe(v1);
    });

    it('preserves values from base version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.setAt(v1, 1, 20);
      expect(arr.get(0, v2)).toBe(10);
      expect(arr.get(2, v2)).toBe(3);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.setAt(999, 0, 10)).toThrow(RangeError);
    });

    it('throws error for invalid index', () => {
      const v1 = arr.set(0, 10);
      expect(() => arr.setAt(v1, 10, 20)).toThrow(RangeError);
    });

    it('allows multiple setAt from same version', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.setAt(v1, 1, 20);
      const v3 = arr.setAt(v1, 2, 30);
      expect(arr.get(1, v2)).toBe(20);
      expect(arr.get(2, v3)).toBe(30);
    });
  });

  describe('toArrayAt', () => {
    it('returns array for specific version', () => {
      const v1 = arr.set(0, 10);
      const arr1 = arr.toArrayAt(v1);
      expect(arr1).toEqual([10, 2, 3, 4, 5]);
    });

    it('returns copy not reference', () => {
      const v1 = arr.set(0, 10);
      const arr1 = arr.toArrayAt(v1);
      const arr2 = arr.toArrayAt(v1);
      expect(arr1).not.toBe(arr2);
      arr1[0] = 100;
      expect(arr2[0]).toBe(10);
    });

    it('throws error for non-existent version', () => {
      expect(() => arr.toArrayAt(999)).toThrow(RangeError);
    });

    it('returns empty array for empty array', () => {
      const array = new EphemeralArray();
      expect(array.toArrayAt(0)).toEqual([]);
    });
  });

  describe('integration', () => {
    it('handles complex workflow with multiple versions', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.fork(v1);
      const v4 = arr.setAt(v3, 2, 30);

      expect(arr.get(0, v1)).toBe(10);
      expect(arr.get(0, v2)).toBe(10);
      expect(arr.get(1, v2)).toBe(20);
      expect(arr.get(0, v3)).toBe(10);
      expect(arr.get(2, v4)).toBe(30);

      expect(arr.versions).toBe(5);
      const children1 = arr.childrenOf(v1);
      expect(children1.length).toBe(2);
      expect(children1).toContain(v2);
      expect(children1).toContain(v3);
      expect(arr.parentOf(v4)).toBe(v3);
    });

    it('maintains consistency across branches', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const v3 = arr.fork(v1);
      const v4 = arr.setAt(v2, 1, 20);
      const v5 = arr.setAt(v3, 2, 30);

      expect(arr.equals(0, v1)).toBe(false);
      expect(arr.equals(v2, v3)).toBe(true);
      expect(arr.get(0, v4)).toBe(10);
      expect(arr.get(0, v5)).toBe(10);
    });

    it('handles long version chain', () => {
      let current = 0;
      for (let i = 0; i < 10; i++) {
        current = arr.set(i % 5, i * 10);
      }

      expect(arr.versions).toBe(11);
      expect(arr.depthOf(current)).toBe(10);
      expect(arr.lineage(current).length).toBe(11);
    });

    it('resets and rebuilds correctly', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.set(1, 20);
      const v3 = arr.set(2, 30);

      arr.reset();

      const v4 = arr.set(0, 100);
      const v5 = arr.set(1, 200);

      expect(arr.getLatestVersion()).toBe(v5);
      expect(arr.get(0)).toBe(100);
      expect(arr.get(1)).toBe(200);
      expect(arr.get(2)).toBe(3);

      expect(arr.hasVersion(v1)).toBe(true);
      expect(arr.hasVersion(v2)).toBe(true);
      expect(arr.hasVersion(v3)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles single element array', () => {
      const array = new EphemeralArray([1]);
      expect(array.size).toBe(1);
      expect(array.get(0)).toBe(1);
      const v1 = array.set(0, 10);
      expect(array.get(0, v1)).toBe(10);
    });

    it('handles large array', () => {
      const large = new EphemeralArray(new Array(100).fill(0).map((_, i) => i));
      expect(large.size).toBe(100);
      expect(large.get(0)).toBe(0);
      expect(large.get(99)).toBe(99);
    });

    it('handles undefined values', () => {
      const array = new EphemeralArray([1, undefined, 3]);
      expect(array.get(0)).toBe(1);
      expect(array.get(1)).toBe(undefined);
      expect(array.get(2)).toBe(3);
    });

    it('handles many versions', () => {
      let current = 0;
      for (let i = 0; i < 50; i++) {
        current = arr.set(i % 5, i);
      }
      expect(arr.versions).toBe(51);
    });

    it('handles complex branching structure', () => {
      const v1 = arr.set(0, 10);
      const v2 = arr.fork(v1);
      const v3 = arr.fork(v1);
      const v4 = arr.fork(v2);
      const v5 = arr.fork(v2);

      const children1 = arr.childrenOf(v1);
      const children2 = arr.childrenOf(v2);
      expect(children1.length).toBe(2);
      expect(children2.length).toBe(2);

      expect(arr.depthOf(v5)).toBe(3);
      const lineage5 = arr.lineage(v5);
      expect(lineage5).toContain(v2);
      expect(lineage5).toContain(v1);
      expect(lineage5).toContain(0);
    });
  });
});
