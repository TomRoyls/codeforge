import { describe, it, expect } from 'vitest';
import { SparseSet3 } from '../src/core/sparse-set-3/index.js';

describe('SparseSet3 - Basic Operations', () => {
  it('should create an empty set', () => {
    const set = new SparseSet3(100);
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
  });

  it('should add a value', () => {
    const set = new SparseSet3(100);
    expect(set.add(5)).toBe(true);
    expect(set.has(5)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should return false when adding duplicate', () => {
    const set = new SparseSet3(100);
    expect(set.add(5)).toBe(true);
    expect(set.add(5)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should delete a value', () => {
    const set = new SparseSet3(100);
    set.add(5);
    expect(set.delete(5)).toBe(true);
    expect(set.has(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should return false when deleting non-existent value', () => {
    const set = new SparseSet3(100);
    expect(set.delete(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should return false when deleting out-of-bounds value', () => {
    const set = new SparseSet3(100);
    expect(set.delete(100)).toBe(false);
    expect(set.delete(-1)).toBe(false);
  });

  it('should check if value exists', () => {
    const set = new SparseSet3(100);
    expect(set.has(5)).toBe(false);
    set.add(5);
    expect(set.has(5)).toBe(true);
  });

  it('should check if value exists using contains', () => {
    const set = new SparseSet3(100);
    expect(set.contains(5)).toBe(false);
    set.add(5);
    expect(set.contains(5)).toBe(true);
  });

  it('should return false for out-of-bounds has', () => {
    const set = new SparseSet3(100);
    expect(set.has(-1)).toBe(false);
    expect(set.has(100)).toBe(false);
  });

  it('should return false for out-of-bounds contains', () => {
    const set = new SparseSet3(100);
    expect(set.contains(-1)).toBe(false);
    expect(set.contains(100)).toBe(false);
  });

  it('should track size correctly', () => {
    const set = new SparseSet3(100);
    expect(set.size).toBe(0);
    set.add(1);
    expect(set.size).toBe(1);
    set.add(2);
    expect(set.size).toBe(2);
    set.add(3);
    expect(set.size).toBe(3);
    set.delete(2);
    expect(set.size).toBe(2);
  });

  it('should check if empty', () => {
    const set = new SparseSet3(100);
    expect(set.isEmpty).toBe(true);
    set.add(1);
    expect(set.isEmpty).toBe(false);
    set.delete(1);
    expect(set.isEmpty).toBe(true);
  });

  it('should clear all values', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
    expect(set.has(1)).toBe(false);
    expect(set.has(2)).toBe(false);
    expect(set.has(3)).toBe(false);
  });
});

describe('SparseSet3 - Boundary Values', () => {
  it('should accept value 0', () => {
    const set = new SparseSet3(100);
    expect(set.add(0)).toBe(true);
    expect(set.has(0)).toBe(true);
  });

  it('should accept universeSize-1', () => {
    const set = new SparseSet3(100);
    expect(set.add(99)).toBe(true);
    expect(set.has(99)).toBe(true);
  });

  it('should reject negative values on add', () => {
    const set = new SparseSet3(100);
    expect(() => set.add(-1)).toThrow('Value must be non-negative');
  });

  it('should reject values >= universeSize on add', () => {
    const set = new SparseSet3(100);
    expect(() => set.add(100)).toThrow('Value must be non-negative and less than universe size');
  });

  it('should throw error for negative universe size', () => {
    expect(() => new SparseSet3(-1)).toThrow('Universe size must be non-negative');
  });

  it('should accept universe size of 0', () => {
    const set = new SparseSet3(0);
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
  });

  it('should reject any value when universe size is 0', () => {
    const set = new SparseSet3(0);
    expect(() => set.add(0)).toThrow('Value must be non-negative and less than universe size');
  });
});

describe('SparseSet3 - getTimeComplexity', () => {
  it('should return complexity info', () => {
    const set = new SparseSet3(100);
    const complexities = set.getTimeComplexity();
    expect(complexities).toBeInstanceOf(Array);
    expect(complexities.length).toBeGreaterThan(0);
  });

  it('should include all operations', () => {
    const set = new SparseSet3(100);
    const complexities = set.getTimeComplexity();
    const operations = complexities.map(c => c.operation);
    expect(operations).toContain('add');
    expect(operations).toContain('delete');
    expect(operations).toContain('has');
    expect(operations).toContain('contains');
    expect(operations).toContain('size');
    expect(operations).toContain('isEmpty');
    expect(operations).toContain('clear');
    expect(operations).toContain('forEach');
    expect(operations).toContain('filter');
    expect(operations).toContain('map');
    expect(operations).toContain('reduce');
    expect(operations).toContain('toArray');
    expect(operations).toContain('bulkInsert');
    expect(operations).toContain('union');
    expect(operations).toContain('intersection');
    expect(operations).toContain('difference');
  });
});

describe('SparseSet3 - forEach', () => {
  it('should not call callback on empty set', () => {
    const set = new SparseSet3(100);
    let called = false;
    set.forEach(() => { called = true; });
    expect(called).toBe(false);
  });

  it('should call callback for each value', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result: number[] = [];
    set.forEach(v => result.push(v));
    expect(result).toEqual([1, 2, 3]);
  });

  it('should iterate in insertion order', () => {
    const set = new SparseSet3(100);
    const values = [5, 10, 15, 20];
    values.forEach(v => set.add(v));
    const result: number[] = [];
    set.forEach(v => result.push(v));
    expect(result).toEqual(values);
  });
});

describe('SparseSet3 - filter', () => {
  it('should return empty set for empty set', () => {
    const set = new SparseSet3(100);
    const result = set.filter(() => true);
    expect(result.size).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should filter values based on predicate', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.add(4);
    set.add(5);
    const result = set.filter(v => v % 2 === 0);
    expect(result.size).toBe(2);
    expect(result.has(2)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(1)).toBe(false);
  });

  it('should preserve original set', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.filter(v => v > 1);
    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
  });
});

describe('SparseSet3 - map', () => {
  it('should return empty array for empty set', () => {
    const set = new SparseSet3(100);
    const result = set.map(v => v * 2);
    expect(result).toEqual([]);
  });

  it('should map values to new type', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result = set.map(v => v * 2);
    expect(result).toEqual([2, 4, 6]);
  });

  it('should map to string', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    const result = set.map(v => `val-${v}`);
    expect(result).toEqual(['val-1', 'val-2']);
  });
});

describe('SparseSet3 - reduce', () => {
  it('should return initial value for empty set', () => {
    const set = new SparseSet3(100);
    const result = set.reduce((acc, v) => acc + v, 0);
    expect(result).toBe(0);
  });

  it('should sum all values', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result = set.reduce((acc, v) => acc + v, 0);
    expect(result).toBe(6);
  });

  it('should compute product', () => {
    const set = new SparseSet3(100);
    set.add(2);
    set.add(3);
    set.add(4);
    const result = set.reduce((acc, v) => acc * v, 1);
    expect(result).toBe(24);
  });

  it('should reduce to string', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    const result = set.reduce((acc, v) => acc + v.toString(), '');
    expect(result).toBe('123');
  });
});

describe('SparseSet3 - toArray', () => {
  it('should return empty array for empty set', () => {
    const set = new SparseSet3(100);
    expect(set.toArray()).toEqual([]);
  });

  it('should return array with all values', () => {
    const set = new SparseSet3(100);
    set.add(5);
    set.add(3);
    set.add(7);
    expect(set.toArray()).toEqual([5, 3, 7]);
  });

  it('should return array in insertion order', () => {
    const set = new SparseSet3(100);
    const values = [10, 20, 30, 40, 50];
    values.forEach(v => set.add(v));
    expect(set.toArray()).toEqual(values);
  });

  it('should maintain insertion order after delete', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.add(4);
    set.delete(2);
    expect(set.toArray()).toEqual([1, 4, 3]);
  });
});

describe('SparseSet3 - bulkInsert', () => {
  it('should insert all valid values', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([1, 2, 3, 4, 5]);
    expect(set.size).toBe(5);
    expect(set.has(1)).toBe(true);
    expect(set.has(5)).toBe(true);
  });

  it('should handle empty array', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([]);
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
  });

  it('should skip out-of-bounds values', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([1, -1, 2, 100, 3]);
    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.has(-1)).toBe(false);
    expect(set.has(100)).toBe(false);
  });

  it('should handle duplicates', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([1, 2, 1, 3, 2, 4]);
    expect(set.size).toBe(4);
  });
});

describe('SparseSet3 - union', () => {
  it('should union two empty sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    const result = set1.union(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should union empty with non-empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set2.add(5);
    const result = set1.union(set2);
    expect(result.size).toBe(1);
    expect(result.has(5)).toBe(true);
  });

  it('should union non-empty with empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(5);
    const result = set1.union(set2);
    expect(result.size).toBe(1);
    expect(result.has(5)).toBe(true);
  });

  it('should union disjoint sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
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
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
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
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set2.add(2);
    set1.union(set2);
    expect(set1.size).toBe(1);
    expect(set2.size).toBe(1);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(2)).toBe(false);
  });

  it('should throw error on different universe sizes', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(200);
    expect(() => set1.union(set2)).toThrow('Cannot union sets with different universe sizes');
  });
});

describe('SparseSet3 - intersection', () => {
  it('should intersect two empty sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should intersect empty with non-empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set2.add(5);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect non-empty with empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(5);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect disjoint sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set1.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect overlapping sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
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
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
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
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
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
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(200);
    expect(() => set1.intersection(set2)).toThrow('Cannot intersect sets with different universe sizes');
  });
});

describe('SparseSet3 - difference', () => {
  it('should compute difference of two empty sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should compute difference of empty and non-empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set2.add(5);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
  });

  it('should compute difference of non-empty and empty', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(5);
    const result = set1.difference(set2);
    expect(result.size).toBe(1);
    expect(result.has(5)).toBe(true);
  });

  it('should compute difference of disjoint sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set1.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.difference(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should compute difference of overlapping sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set2.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.difference(set2);
    expect(result.size).toBe(1);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(false);
    expect(result.has(3)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should compute difference of identical sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set2.add(1);
    set2.add(2);
    set2.add(3);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should not modify original sets', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(100);
    set1.add(1);
    set1.add(2);
    set2.add(2);
    set1.difference(set2);
    expect(set1.size).toBe(2);
    expect(set2.size).toBe(1);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(2)).toBe(true);
  });

  it('should throw error on different universe sizes', () => {
    const set1 = new SparseSet3(100);
    const set2 = new SparseSet3(200);
    expect(() => set1.difference(set2)).toThrow('Cannot compute difference of sets with different universe sizes');
  });
});

describe('SparseSet3 - Large Sets', () => {
  it('should handle large number of values', () => {
    const set = new SparseSet3(10000);
    for (let i = 0; i < 1000; i++) {
      set.add(i);
    }
    expect(set.size).toBe(1000);
    for (let i = 0; i < 1000; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should handle large bulk insert', () => {
    const set = new SparseSet3(10000);
    const values = Array.from({ length: 1000 }, (_, i) => i);
    set.bulkInsert(values);
    expect(set.size).toBe(1000);
  });

  it('should handle large union', () => {
    const set1 = new SparseSet3(10000);
    const set2 = new SparseSet3(10000);
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
    const set1 = new SparseSet3(10000);
    const set2 = new SparseSet3(10000);
    for (let i = 0; i < 500; i++) {
      set1.add(i);
      set2.add(i);
    }
    const result = set1.intersection(set2);
    expect(result.size).toBe(500);
  });

  it('should handle large difference', () => {
    const set1 = new SparseSet3(10000);
    const set2 = new SparseSet3(10000);
    for (let i = 0; i < 1000; i++) {
      set1.add(i);
    }
    for (let i = 500; i < 1000; i++) {
      set2.add(i);
    }
    const result = set1.difference(set2);
    expect(result.size).toBe(500);
  });
});

describe('SparseSet3 - Edge Cases', () => {
  it('should handle add after clear', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.clear();
    expect(set.add(3)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle delete all values', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.delete(1);
    set.delete(2);
    set.delete(3);
    expect(set.isEmpty).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should handle adding after deleting', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.delete(1);
    expect(set.add(1)).toBe(true);
    expect(set.has(1)).toBe(true);
  });

  it('should handle alternating add and delete', () => {
    const set = new SparseSet3(100);
    for (let i = 0; i < 10; i++) {
      set.add(i);
    }
    for (let i = 0; i < 5; i++) {
      set.delete(i);
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
    const set = new SparseSet3(100);
    for (let i = 0; i < 20; i++) {
      set.add(i);
    }
    for (let i = 0; i < 10; i++) {
      set.delete(i * 2);
    }
    const arr = set.toArray();
    expect(arr.length).toBe(10);
    arr.forEach(v => {
      expect(v % 2).toBe(1);
    });
  });

  it('should filter after operations', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    set.delete(2);
    set.delete(4);
    set.delete(6);
    set.delete(8);
    set.delete(10);
    const result = set.filter(v => v > 3);
    expect(result.size).toBe(3);
    expect(result.has(5)).toBe(true);
    expect(result.has(7)).toBe(true);
    expect(result.has(9)).toBe(true);
  });

  it('should map after operations', () => {
    const set = new SparseSet3(100);
    set.add(1);
    set.add(2);
    set.add(3);
    set.delete(2);
    const result = set.map(v => v * v);
    expect(result).toEqual([1, 9]);
  });

  it('should reduce after operations', () => {
    const set = new SparseSet3(100);
    set.bulkInsert([1, 2, 3, 4, 5]);
    set.delete(3);
    const result = set.reduce((acc, v) => acc + v, 0);
    expect(result).toBe(12);
  });
});
