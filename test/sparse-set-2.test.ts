import { describe, it, expect } from 'vitest';
import { SparseSet2 } from '../src/core/sparse-set-2/index.js';

describe('SparseSet2 - Basic Operations', () => {
  it('should create an empty set', () => {
    const set = new SparseSet2(100);
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });

  it('should add a value', () => {
    const set = new SparseSet2(100);
    expect(set.add(5)).toBe(true);
    expect(set.has(5)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should return false when adding duplicate', () => {
    const set = new SparseSet2(100);
    expect(set.add(5)).toBe(true);
    expect(set.add(5)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should remove a value', () => {
    const set = new SparseSet2(100);
    set.add(5);
    expect(set.remove(5)).toBe(true);
    expect(set.has(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should return false when removing non-existent value', () => {
    const set = new SparseSet2(100);
    expect(set.remove(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should return false when removing out-of-bounds value', () => {
    const set = new SparseSet2(100);
    expect(set.remove(100)).toBe(false);
    expect(set.remove(-1)).toBe(false);
  });

  it('should check if value exists', () => {
    const set = new SparseSet2(100);
    expect(set.has(5)).toBe(false);
    set.add(5);
    expect(set.has(5)).toBe(true);
  });

  it('should return false for out-of-bounds has', () => {
    const set = new SparseSet2(100);
    expect(set.has(-1)).toBe(false);
    expect(set.has(100)).toBe(false);
  });

  it('should track size correctly', () => {
    const set = new SparseSet2(100);
    expect(set.size).toBe(0);
    set.add(1);
    expect(set.size).toBe(1);
    set.add(2);
    expect(set.size).toBe(2);
    set.add(3);
    expect(set.size).toBe(3);
    set.remove(2);
    expect(set.size).toBe(2);
  });

  it('should check if empty', () => {
    const set = new SparseSet2(100);
    expect(set.isEmpty()).toBe(true);
    set.add(1);
    expect(set.isEmpty()).toBe(false);
    set.remove(1);
    expect(set.isEmpty()).toBe(true);
  });

  it('should clear all values', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
    expect(set.has(1)).toBe(false);
    expect(set.has(2)).toBe(false);
    expect(set.has(3)).toBe(false);
  });
});

describe('SparseSet2 - Boundary Values', () => {
  it('should accept value 0', () => {
    const set = new SparseSet2(100);
    expect(set.add(0)).toBe(true);
    expect(set.has(0)).toBe(true);
  });

  it('should accept universeSize-1', () => {
    const set = new SparseSet2(100);
    expect(set.add(99)).toBe(true);
    expect(set.has(99)).toBe(true);
  });

  it('should reject negative values on add', () => {
    const set = new SparseSet2(100);
    expect(() => set.add(-1)).toThrow('Value must be non-negative');
  });

  it('should reject values >= universeSize on add', () => {
    const set = new SparseSet2(100);
    expect(() => set.add(100)).toThrow('Value must be non-negative and less than universe size');
  });

  it('should throw error for negative universe size', () => {
    expect(() => new SparseSet2(-1)).toThrow('Universe size must be non-negative');
  });

  it('should accept universe size of 0', () => {
    const set = new SparseSet2(0);
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });

  it('should reject any value when universe size is 0', () => {
    const set = new SparseSet2(0);
    expect(() => set.add(0)).toThrow('Value must be non-negative and less than universe size');
  });
});

describe('SparseSet2 - toArray', () => {
  it('should return empty array for empty set', () => {
    const set = new SparseSet2(100);
    expect(set.toArray()).toEqual([]);
  });

  it('should return array with all values', () => {
    const set = new SparseSet2(100);
    set.add(5);
    set.add(3);
    set.add(7);
    expect(set.toArray()).toEqual([5, 3, 7]);
  });

  it('should return array in insertion order', () => {
    const set = new SparseSet2(100);
    const values = [10, 20, 30, 40, 50];
    values.forEach(v => set.add(v));
    expect(set.toArray()).toEqual(values);
  });

  it('should maintain insertion order after remove', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.add(4);
    set.remove(2);
    expect(set.toArray()).toEqual([1, 4, 3]);
  });
});

describe('SparseSet2 - values', () => {
  it('should return empty array for empty set', () => {
    const set = new SparseSet2(100);
    expect(set.values()).toEqual([]);
  });

  it('should return same as toArray', () => {
    const set = new SparseSet2(100);
    set.add(5);
    set.add(3);
    set.add(7);
    expect(set.values()).toEqual(set.toArray());
  });
});

describe('SparseSet2 - forEach', () => {
  it('should not call callback on empty set', () => {
    const set = new SparseSet2(100);
    let called = false;
    set.forEach(() => { called = true; });
    expect(called).toBe(false);
  });

  it('should call callback for each value', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result: number[] = [];
    set.forEach(v => result.push(v));
    expect(result).toEqual([1, 2, 3]);
  });

  it('should iterate in insertion order', () => {
    const set = new SparseSet2(100);
    const values = [5, 10, 15, 20];
    values.forEach(v => set.add(v));
    const result: number[] = [];
    set.forEach(v => result.push(v));
    expect(result).toEqual(values);
  });
});

describe('SparseSet2 - Iterator', () => {
  it('should iterate over empty set', () => {
    const set = new SparseSet2(100);
    const result: number[] = [];
    for (const value of set) {
      result.push(value);
    }
    expect(result).toEqual([]);
  });

  it('should iterate over all values', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result: number[] = [];
    for (const value of set) {
      result.push(value);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  it('should iterate in insertion order', () => {
    const set = new SparseSet2(100);
    const values = [10, 20, 30];
    values.forEach(v => set.add(v));
    const result: number[] = [];
    for (const value of set) {
      result.push(value);
    }
    expect(result).toEqual(values);
  });

  it('should support spread operator', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    expect([...set]).toEqual([1, 2, 3]);
  });

  it('should work with Array.from', () => {
    const set = new SparseSet2(100);
    set.add(5);
    set.add(10);
    set.add(15);
    expect(Array.from(set)).toEqual([5, 10, 15]);
  });
});

describe('SparseSet2 - min', () => {
  it('should return undefined for empty set', () => {
    const set = new SparseSet2(100);
    expect(set.min()).toBeUndefined();
  });

  it('should return single value', () => {
    const set = new SparseSet2(100);
    set.add(42);
    expect(set.min()).toBe(42);
  });

  it('should return minimum of multiple values', () => {
    const set = new SparseSet2(100);
    set.add(10);
    set.add(5);
    set.add(15);
    set.add(3);
    expect(set.min()).toBe(3);
  });

  it('should work after removals', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.remove(1);
    expect(set.min()).toBe(2);
  });
});

describe('SparseSet2 - max', () => {
  it('should return undefined for empty set', () => {
    const set = new SparseSet2(100);
    expect(set.max()).toBeUndefined();
  });

  it('should return single value', () => {
    const set = new SparseSet2(100);
    set.add(42);
    expect(set.max()).toBe(42);
  });

  it('should return maximum of multiple values', () => {
    const set = new SparseSet2(100);
    set.add(10);
    set.add(5);
    set.add(15);
    set.add(3);
    expect(set.max()).toBe(15);
  });

  it('should work after removals', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.remove(3);
    expect(set.max()).toBe(2);
  });
});

describe('SparseSet2 - union', () => {
  it('should union two empty sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    const result = set1.union(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should union empty with non-empty', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set2.add(5);
    const result = set1.union(set2);
    expect(result.size).toBe(1);
    expect(result.has(5)).toBe(true);
  });

  it('should union non-empty with empty', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(5);
    const result = set1.union(set2);
    expect(result.size).toBe(1);
    expect(result.has(5)).toBe(true);
  });

  it('should union disjoint sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.union(set2);
    expect(result.size).toBe(4);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });

  it('should union overlapping sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set2.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.union(set2);
    expect(result.size).toBe(4);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });

  it('should not modify original sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set2.add(2);
    set1.union(set2);
    expect(set1.size).toBe(1);
    expect(set2.size).toBe(1);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(2)).toBe(false);
  });

  it('should throw error on different universe sizes', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(200);
    expect(() => set1.union(set2)).toThrow('Cannot union sets with different universe sizes');
  });
});

describe('SparseSet2 - intersection', () => {
  it('should intersect two empty sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should intersect empty with non-empty', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set2.add(5);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect non-empty with empty', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(5);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect disjoint sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect overlapping sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set2.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.intersection(set2);
    expect(result.size).toBe(2);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(1)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should intersect identical sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set2.add(1);
    set2.add(2);
    set2.add(3);
    const result = set1.intersection(set2);
    expect(result.size).toBe(3);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
  });

  it('should not modify original sets', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(100);
    set1.add(1);
    set1.add(2);
    set2.add(2);
    set2.add(3);
    set1.intersection(set2);
    expect(set1.size).toBe(2);
    expect(set2.size).toBe(2);
    expect(set1.has(1)).toBe(true);
    expect(set2.has(3)).toBe(true);
  });

  it('should throw error on different universe sizes', () => {
    const set1 = new SparseSet2(100);
    const set2 = new SparseSet2(200);
    expect(() => set1.intersection(set2)).toThrow('Cannot intersect sets with different universe sizes');
  });
});

describe('SparseSet2 - Large Sets', () => {
  it('should handle large number of values', () => {
    const set = new SparseSet2(10000);
    for (let i = 0; i < 1000; i++) {
      set.add(i);
    }
    expect(set.size).toBe(1000);
    for (let i = 0; i < 1000; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should handle large union', () => {
    const set1 = new SparseSet2(10000);
    const set2 = new SparseSet2(10000);
    for (let i = 0; i < 500; i++) {
      set1.add(i);
    }
    for (let i = 500; i < 1000; i++) {
      set2.add(i);
    }
    const result = set1.union(set2);
    expect(result.size).toBe(1000);
  });

  it('should handle large intersection', () => {
    const set1 = new SparseSet2(10000);
    const set2 = new SparseSet2(10000);
    for (let i = 0; i < 500; i++) {
      set1.add(i);
      set2.add(i);
    }
    const result = set1.intersection(set2);
    expect(result.size).toBe(500);
  });
});

describe('SparseSet2 - Edge Cases', () => {
  it('should handle add after clear', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.clear();
    expect(set.add(3)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle remove all values', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.remove(1);
    set.remove(2);
    set.remove(3);
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should handle adding after removing', () => {
    const set = new SparseSet2(100);
    set.add(1);
    set.remove(1);
    expect(set.add(1)).toBe(true);
    expect(set.has(1)).toBe(true);
  });

  it('should handle alternating add and remove', () => {
    const set = new SparseSet2(100);
    for (let i = 0; i < 10; i++) {
      set.add(i);
    }
    for (let i = 0; i < 5; i++) {
      set.remove(i);
    }
    for (let i = 10; i < 15; i++) {
      set.add(i);
    }
    expect(set.size).toBe(10);
    for (let i = 5; i < 15; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should iterate correctly after many operations', () => {
    const set = new SparseSet2(100);
    for (let i = 0; i < 20; i++) {
      set.add(i);
    }
    for (let i = 0; i < 10; i++) {
      set.remove(i * 2);
    }
    const arr = set.toArray();
    expect(arr.length).toBe(10);
    arr.forEach(v => {
      expect(v % 2).toBe(1);
    });
  });
});
