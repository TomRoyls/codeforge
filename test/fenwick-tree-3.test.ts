import { describe, it, expect } from 'vitest';
import { FenwickTree3 } from '../src/core/fenwick-tree-3/index.js';

describe('FenwickTree3 - Constructor', () => {
  it('should create tree with given size', () => {
    const ft = new FenwickTree3(10);
    expect(ft.size).toBe(10);
  });

  it('should create empty tree with size 0', () => {
    const ft = new FenwickTree3(0);
    expect(ft.size).toBe(0);
  });

  it('should handle zero size tree', () => {
    const ft = new FenwickTree3(0);
    expect(ft.query(0)).toBe(0);
  });
});

describe('FenwickTree3 - Update', () => {
  it('should update single index', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    expect(ft.query(0)).toBe(10);
  });

  it('should handle multiple updates', () => {
    const ft = new FenwickTree3(10);
    ft.update(2, 5);
    ft.update(3, 7);
    ft.update(4, 3);
    expect(ft.query(4)).toBe(5 + 7 + 3);
  });

  it('should handle negative updates', () => {
    const ft = new FenwickTree3(5);
    ft.update(1, 10);
    ft.update(1, -3);
    expect(ft.get(1)).toBe(7);
  });

  it('should throw error for out of bounds update', () => {
    const ft = new FenwickTree3(5);
    expect(() => ft.update(5, 1)).toThrow(RangeError);
    expect(() => ft.update(-1, 1)).toThrow(RangeError);
  });
});

describe('FenwickTree3 - Query (Prefix Sum)', () => {
  it('should return 0 for empty tree', () => {
    const ft = new FenwickTree3(5);
    expect(ft.query(0)).toBe(0);
    expect(ft.query(4)).toBe(0);
  });

  it('should calculate prefix sum correctly', () => {
    const ft = new FenwickTree3(10);
    ft.update(0, 1);
    ft.update(1, 2);
    ft.update(2, 3);
    ft.update(3, 4);
    ft.update(4, 5);

    expect(ft.query(0)).toBe(1);
    expect(ft.query(1)).toBe(1 + 2);
    expect(ft.query(2)).toBe(1 + 2 + 3);
    expect(ft.query(3)).toBe(1 + 2 + 3 + 4);
    expect(ft.query(4)).toBe(1 + 2 + 3 + 4 + 5);
  });

  it('should handle index clamping', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    expect(ft.query(10)).toBe(10 + 20);
  });

  it('should return 0 for negative index', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    expect(ft.query(-1)).toBe(0);
  });

  it('should handle zero index', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 42);
    expect(ft.query(0)).toBe(42);
  });
});

describe('FenwickTree3 - Range Query', () => {
  it('should return 0 for invalid range', () => {
    const ft = new FenwickTree3(10);
    expect(ft.rangeQuery(5, 2)).toBe(0);
  });

  it('should calculate range sum correctly', () => {
    const ft = new FenwickTree3(10);
    for (let i = 0; i < 10; i++) {
      ft.update(i, i + 1);
    }

    expect(ft.rangeQuery(0, 4)).toBe(1 + 2 + 3 + 4 + 5);
    expect(ft.rangeQuery(2, 5)).toBe(3 + 4 + 5 + 6);
    expect(ft.rangeQuery(5, 9)).toBe(6 + 7 + 8 + 9 + 10);
  });

  it('should handle range from 0', () => {
    const ft = new FenwickTree3(10);
    ft.update(0, 5);
    ft.update(1, 10);
    expect(ft.rangeQuery(0, 1)).toBe(5 + 10);
  });

  it('should handle single element range', () => {
    const ft = new FenwickTree3(10);
    ft.update(3, 42);
    expect(ft.rangeQuery(3, 3)).toBe(42);
  });
});

describe('FenwickTree3 - Get', () => {
  it('should return value at index', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    ft.update(3, 40);
    ft.update(4, 50);

    expect(ft.get(0)).toBe(10);
    expect(ft.get(1)).toBe(20);
    expect(ft.get(2)).toBe(30);
    expect(ft.get(3)).toBe(40);
    expect(ft.get(4)).toBe(50);
  });

  it('should return 0 for unset index', () => {
    const ft = new FenwickTree3(5);
    expect(ft.get(0)).toBe(0);
    expect(ft.get(4)).toBe(0);
  });

  it('should throw error for out of bounds', () => {
    const ft = new FenwickTree3(5);
    expect(() => ft.get(5)).toThrow(RangeError);
    expect(() => ft.get(-1)).toThrow(RangeError);
  });
});

describe('FenwickTree3 - Set', () => {
  it('should set value at index', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.set(0, 100);
    expect(ft.get(0)).toBe(100);
  });

  it('should handle setting to zero', () => {
    const ft = new FenwickTree3(5);
    ft.update(1, 50);
    ft.set(1, 0);
    expect(ft.get(1)).toBe(0);
  });

  it('should handle multiple set operations', () => {
    const ft = new FenwickTree3(5);
    ft.update(2, 10);
    ft.set(2, 20);
    ft.set(2, 30);
    ft.set(2, 40);
    expect(ft.get(2)).toBe(40);
  });

  it('should maintain other values after set', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 1);
    ft.update(1, 2);
    ft.update(2, 3);
    ft.set(1, 20);

    expect(ft.get(0)).toBe(1);
    expect(ft.get(1)).toBe(20);
    expect(ft.get(2)).toBe(3);
  });
});

describe('FenwickTree3 - Multiple Updates', () => {
  it('should handle many updates efficiently', () => {
    const ft = new FenwickTree3(100);
    for (let i = 0; i < 100; i++) {
      ft.update(i, i + 1);
    }

    expect(ft.query(99)).toBe((100 * 101) / 2);
    expect(ft.get(50)).toBe(51);
  });

  it('should handle overlapping updates', () => {
    const ft = new FenwickTree3(10);
    ft.update(0, 5);
    ft.update(1, 5);
    ft.update(0, 3);
    ft.update(1, 7);

    expect(ft.get(0)).toBe(8);
    expect(ft.get(1)).toBe(12);
  });
});

describe('FenwickTree3 - Cumulative Sums', () => {
  it('should maintain correct cumulative sums after updates', () => {
    const ft = new FenwickTree3(10);
    ft.update(0, 1);
    ft.update(1, 2);
    ft.update(2, 3);

    expect(ft.query(0)).toBe(1);
    expect(ft.query(1)).toBe(3);
    expect(ft.query(2)).toBe(6);

    ft.update(1, 5);
    expect(ft.query(1)).toBe(8);
    expect(ft.query(2)).toBe(11);
  });

  it('should calculate cumulative sum for all elements', () => {
    const ft = new FenwickTree3(10);
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < 10; i++) {
      ft.update(i, arr[i]!);
    }

    let expectedSum = 0;
    for (let i = 0; i < 10; i++) {
      expectedSum += arr[i]!;
      expect(ft.query(i)).toBe(expectedSum);
    }
  });

  it('should handle cumulative sum with large values', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 1000);
    ft.update(1, 2000);
    ft.update(2, 3000);
    ft.update(3, 4000);
    ft.update(4, 5000);

    expect(ft.query(4)).toBe(15000);
    expect(ft.rangeQuery(1, 3)).toBe(9000);
  });
});

describe('FenwickTree3 - Edge Cases', () => {
  it('should handle size 1 tree', () => {
    const ft = new FenwickTree3(1);
    ft.update(0, 42);
    expect(ft.get(0)).toBe(42);
    expect(ft.query(0)).toBe(42);
  });

  it('should handle negative delta in update', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(0, -10);
    expect(ft.get(0)).toBe(0);
  });

  it('should handle zero delta in update', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(0, 0);
    expect(ft.get(0)).toBe(10);
  });

  it('should maintain size property', () => {
    const ft = new FenwickTree3(10);
    expect(ft.size).toBe(10);
    ft.update(0, 5);
    expect(ft.size).toBe(10);
    ft.set(0, 100);
    expect(ft.size).toBe(10);
  });

  it('should handle rangeQuery on single element', () => {
    const ft = new FenwickTree3(5);
    ft.update(2, 42);
    expect(ft.rangeQuery(2, 2)).toBe(42);
  });

  it('should handle rangeQuery over full range', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 1);
    ft.update(1, 2);
    ft.update(2, 3);
    ft.update(3, 4);
    ft.update(4, 5);
    expect(ft.rangeQuery(0, 4)).toBe(15);
  });

  it('should handle set then get', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.set(0, 20);
    expect(ft.get(0)).toBe(20);
  });

  it('should handle single element', () => {
    const ft = new FenwickTree3(1);
    ft.update(0, 42);
    expect(ft.rangeQuery(0, 0)).toBe(42);
  });

  it('should handle get method', () => {
    const ft = new FenwickTree3(3);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    expect(ft.get(0)).toBe(10);
    expect(ft.get(1)).toBe(20);
    expect(ft.get(2)).toBe(30);
  });

  it('should handle get size', () => {
    const ft = new FenwickTree3(10);
    expect(ft.size).toBe(10);
  });

  it('should handle range query', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    const total = ft.query(2);
    expect(total).toBe(60);
  });

  it('should handle point query', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    expect(ft.get(2)).toBe(30);
  });

  it('should handle rangeQuery', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    ft.update(3, 40);
    expect(ft.rangeQuery(1, 3)).toBe(90);
  });

  it('should handle set', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.set(0, 99);
    expect(ft.get(0)).toBe(99);
  });
  it('should handle rangeQuery full range', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    ft.update(3, 40);
    ft.update(4, 50);
    expect(ft.rangeQuery(0, 4)).toBe(150);
  });
  it('should handle get method', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    expect(ft.get(0)).toBe(10);
    expect(ft.get(1)).toBe(20);
  });
  it('should handle set method', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.set(0, 50);
    expect(ft.get(0)).toBe(50);
  });
  it('should handle rangeQuery', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    expect(ft.rangeQuery(0, 2)).toBe(60);
  });
  it('should handle prefix query', () => {
    const ft = new FenwickTree3(5);
    ft.update(0, 10);
    ft.update(1, 20);
    ft.update(2, 30);
    expect(ft.query(2)).toBe(60);
  });
});
