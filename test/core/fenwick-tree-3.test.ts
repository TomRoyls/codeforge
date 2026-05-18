import { describe, it, expect } from 'vitest'
import { FenwickTree3 } from '../../src/core/fenwick-tree-3/index.js'

// ─── Constructor ───

describe('FenwickTree3 - Constructor', () => {
  it('should create tree with given size', () => {
    const ft = new FenwickTree3(5)
    expect(ft.size).toBe(5)
  })

  it('should create tree with size 1', () => {
    const ft = new FenwickTree3(1)
    expect(ft.size).toBe(1)
  })

  it('should handle size 0', () => {
    const ft = new FenwickTree3(0)
    expect(ft.size).toBe(0)
  })

  it('should handle negative size', () => {
    const ft = new FenwickTree3(-5)
    expect(ft.size).toBe(0)
  })

  it('should create tree with large size', () => {
    const ft = new FenwickTree3(1000)
    expect(ft.size).toBe(1000)
  })
})

// ─── update ───

describe('FenwickTree3 - update', () => {
  it('should update a single index', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    expect(ft.query(0)).toBe(10)
  })

  it('should accumulate updates at same index', () => {
    const ft = new FenwickTree3(5)
    ft.update(2, 5)
    ft.update(2, 3)
    expect(ft.query(2)).toBe(8)
  })

  it('should update multiple indices', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.query(2)).toBe(6)
  })

  it('should throw RangeError for negative index', () => {
    const ft = new FenwickTree3(5)
    expect(() => ft.update(-1, 10)).toThrow(RangeError)
  })

  it('should throw RangeError for index >= size', () => {
    const ft = new FenwickTree3(5)
    expect(() => ft.update(5, 10)).toThrow(RangeError)
  })

  it('should handle negative delta', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    ft.update(0, -3)
    expect(ft.query(0)).toBe(7)
  })

  it('should update last valid index', () => {
    const ft = new FenwickTree3(5)
    ft.update(4, 42)
    expect(ft.query(4)).toBe(42)
  })
})

// ─── query ───

describe('FenwickTree3 - query', () => {
  it('should return 0 for empty tree', () => {
    const ft = new FenwickTree3(0)
    expect(ft.query(0)).toBe(0)
  })

  it('should return 0 for negative index', () => {
    const ft = new FenwickTree3(5)
    expect(ft.query(-1)).toBe(0)
  })

  it('should return prefix sum for single element', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    expect(ft.query(0)).toBe(10)
  })

  it('should return prefix sum across multiple elements', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    expect(ft.query(4)).toBe(15)
  })

  it('should return partial prefix sum', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.query(1)).toBe(3)
  })

  it('should clamp index beyond size', () => {
    const ft = new FenwickTree3(3)
    ft.update(0, 5)
    ft.update(1, 5)
    ft.update(2, 5)
    expect(ft.query(100)).toBe(15)
  })

  it('should return 0 when no updates', () => {
    const ft = new FenwickTree3(5)
    expect(ft.query(3)).toBe(0)
  })
})

// ─── rangeQuery ───

describe('FenwickTree3 - rangeQuery', () => {
  it('should return sum over a range', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    ft.update(3, 4)
    ft.update(4, 5)
    expect(ft.rangeQuery(1, 3)).toBe(9)
  })

  it('should return 0 when from > to', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    expect(ft.rangeQuery(3, 1)).toBe(0)
  })

  it('should return full range sum from 0', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 1)
    ft.update(1, 2)
    ft.update(2, 3)
    expect(ft.rangeQuery(0, 2)).toBe(6)
  })

  it('should return single element range', () => {
    const ft = new FenwickTree3(5)
    ft.update(2, 42)
    expect(ft.rangeQuery(2, 2)).toBe(42)
  })

  it('should handle range starting at negative index', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    ft.update(1, 20)
    expect(ft.rangeQuery(-1, 1)).toBe(30)
  })

  it('should return 0 for empty tree', () => {
    const ft = new FenwickTree3(0)
    expect(ft.rangeQuery(0, 2)).toBe(0)
  })
})

// ─── get ───

describe('FenwickTree3 - get', () => {
  it('should return value at updated index', () => {
    const ft = new FenwickTree3(5)
    ft.update(2, 42)
    expect(ft.get(2)).toBe(42)
  })

  it('should return 0 for uninitialized index', () => {
    const ft = new FenwickTree3(5)
    expect(ft.get(0)).toBe(0)
  })

  it('should throw RangeError for negative index', () => {
    const ft = new FenwickTree3(5)
    expect(() => ft.get(-1)).toThrow(RangeError)
  })

  it('should throw RangeError for out of bounds index', () => {
    const ft = new FenwickTree3(5)
    expect(() => ft.get(5)).toThrow(RangeError)
  })

  it('should return updated value after multiple updates', () => {
    const ft = new FenwickTree3(5)
    ft.update(0, 10)
    ft.update(0, 5)
    expect(ft.get(0)).toBe(15)
  })
})

// ─── set ───

describe('FenwickTree3 - set', () => {
  it('should set value at index', () => {
    const ft = new FenwickTree3(5)
    ft.set(0, 42)
    expect(ft.get(0)).toBe(42)
  })

  it('should overwrite previous value', () => {
    const ft = new FenwickTree3(5)
    ft.set(0, 10)
    ft.set(0, 20)
    expect(ft.get(0)).toBe(20)
  })

  it('should affect prefix sum correctly', () => {
    const ft = new FenwickTree3(3)
    ft.set(0, 1)
    ft.set(1, 2)
    ft.set(2, 3)
    expect(ft.query(2)).toBe(6)
  })

  it('should handle setting to zero', () => {
    const ft = new FenwickTree3(5)
    ft.set(0, 100)
    ft.set(0, 0)
    expect(ft.get(0)).toBe(0)
  })

  it('should handle setting negative values', () => {
    const ft = new FenwickTree3(5)
    ft.set(0, -10)
    expect(ft.get(0)).toBe(-10)
  })
})

// ─── size ───

describe('FenwickTree3 - size', () => {
  it('should return the constructor size', () => {
    const ft = new FenwickTree3(10)
    expect(ft.size).toBe(10)
  })

  it('should return 0 for zero-sized tree', () => {
    const ft = new FenwickTree3(0)
    expect(ft.size).toBe(0)
  })
})
