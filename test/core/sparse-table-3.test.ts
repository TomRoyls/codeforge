import { describe, it, expect } from 'vitest'
import { SparseTable3 } from '../../src/core/sparse-table-3/index.js'

// ─── Constructor ───

describe('SparseTable3 constructor', () => {
  it('should build with default query type (min)', () => {
    const st = new SparseTable3([3, 1, 4])
    expect(st.size()).toBe(3)
  })

  it('should build with min query type', () => {
    const st = new SparseTable3([5, 2, 8], 'min')
    expect(st.query(0, 2)).toBe(2)
  })

  it('should build with max query type', () => {
    const st = new SparseTable3([5, 2, 8], 'max')
    expect(st.query(0, 2)).toBe(8)
  })

  it('should build with gcd query type', () => {
    const st = new SparseTable3([12, 18, 24], 'gcd')
    expect(st.query(0, 2)).toBe(6)
  })

  it('should build with sum query type', () => {
    const st = new SparseTable3([1, 2, 3], 'sum')
    expect(st.query(0, 2)).toBe(6)
  })

  it('should throw on empty array', () => {
    expect(() => new SparseTable3([])).toThrow('Array cannot be empty')
    expect(() => new SparseTable3([], 'max')).toThrow('Array cannot be empty')
  })

  it('should handle single element', () => {
    expect(new SparseTable3([42]).query(0, 0)).toBe(42)
    expect(new SparseTable3([42], 'max').query(0, 0)).toBe(42)
    expect(new SparseTable3([42], 'gcd').query(0, 0)).toBe(42)
    expect(new SparseTable3([42], 'sum').query(0, 0)).toBe(42)
  })
})

// ─── Min queries ───

describe('SparseTable3 min queries', () => {
  const st = new SparseTable3([3, 1, 4, 1, 5, 9, 2, 6], 'min')

  it('should find minimum over full range', () => {
    expect(st.query(0, 7)).toBe(1)
  })

  it('should find minimum over partial ranges', () => {
    expect(st.query(0, 2)).toBe(1)
    expect(st.query(2, 4)).toBe(1)
    expect(st.query(4, 7)).toBe(2)
    expect(st.query(5, 7)).toBe(2)
  })

  it('should return single element for length-1 range', () => {
    expect(st.query(0, 0)).toBe(3)
    expect(st.query(5, 5)).toBe(9)
  })

  it('should handle negatives', () => {
    const st2 = new SparseTable3([-5, -1, -3, -2], 'min')
    expect(st2.query(0, 3)).toBe(-5)
    expect(st2.query(1, 3)).toBe(-3)
  })

  it('should handle duplicates', () => {
    const st2 = new SparseTable3([7, 7, 7, 7], 'min')
    expect(st2.query(0, 3)).toBe(7)
    expect(st2.query(1, 2)).toBe(7)
  })
})

// ─── Max queries ───

describe('SparseTable3 max queries', () => {
  const st = new SparseTable3([3, 1, 4, 1, 5, 9, 2, 6], 'max')

  it('should find maximum over full range', () => {
    expect(st.query(0, 7)).toBe(9)
  })

  it('should find maximum over partial ranges', () => {
    expect(st.query(0, 2)).toBe(4)
    expect(st.query(2, 4)).toBe(5)
    expect(st.query(0, 3)).toBe(4)
    expect(st.query(5, 7)).toBe(9)
  })

  it('should return single element for length-1 range', () => {
    expect(st.query(0, 0)).toBe(3)
    expect(st.query(3, 3)).toBe(1)
  })

  it('should handle negatives', () => {
    const st2 = new SparseTable3([-5, -1, -3, -2], 'max')
    expect(st2.query(0, 3)).toBe(-1)
  })
})

// ─── GCD queries ───

describe('SparseTable3 gcd queries', () => {
  it('should compute gcd over range', () => {
    const st = new SparseTable3([12, 18, 24, 36], 'gcd')
    expect(st.query(0, 3)).toBe(6)
    expect(st.query(0, 1)).toBe(6)
    expect(st.query(1, 2)).toBe(6)
    expect(st.query(2, 3)).toBe(12)
  })

  it('should return the element itself for single-element range', () => {
    const st = new SparseTable3([12, 18, 24], 'gcd')
    expect(st.query(1, 1)).toBe(18)
  })

  it('should handle coprime numbers returning 1', () => {
    const st = new SparseTable3([7, 13, 19], 'gcd')
    expect(st.query(0, 2)).toBe(1)
  })

  it('should handle gcd with negatives', () => {
    const st = new SparseTable3([-12, -18], 'gcd')
    expect(st.query(0, 1)).toBe(6)
  })

  it('should handle gcd where one element divides another', () => {
    const st = new SparseTable3([4, 8, 16], 'gcd')
    expect(st.query(0, 2)).toBe(4)
  })
})

// ─── Sum queries ───

describe('SparseTable3 sum queries', () => {
  it('should compute sum over full range', () => {
    const st = new SparseTable3([1, 2, 3, 4, 5], 'sum')
    expect(st.query(0, 4)).toBe(15)
  })

  it('should compute sum over partial ranges', () => {
    const st = new SparseTable3([1, 2, 3, 4, 5], 'sum')
    expect(st.query(0, 2)).toBe(6)
    expect(st.query(2, 4)).toBe(12)
    expect(st.query(1, 3)).toBe(9)
  })

  it('should return single element for length-1 range', () => {
    const st = new SparseTable3([10, 20, 30], 'sum')
    expect(st.query(1, 1)).toBe(20)
  })

  it('should handle negative numbers in sum', () => {
    const st = new SparseTable3([-1, 2, -3, 4], 'sum')
    expect(st.query(0, 3)).toBe(2)
    expect(st.query(0, 1)).toBe(1)
  })

  it('should handle zeros', () => {
    const st = new SparseTable3([0, 0, 0], 'sum')
    expect(st.query(0, 2)).toBe(0)
  })
})

// ─── Invalid ranges ───

describe('SparseTable3 invalid ranges', () => {
  const st = new SparseTable3([1, 2, 3])

  it('should throw on start < 0', () => {
    expect(() => st.query(-1, 2)).toThrow('Invalid range')
  })

  it('should throw on end >= length', () => {
    expect(() => st.query(0, 3)).toThrow('Invalid range')
  })

  it('should throw on start > end', () => {
    expect(() => st.query(2, 1)).toThrow('Invalid range')
  })

  it('should throw for all query types', () => {
    const stMax = new SparseTable3([1, 2], 'max')
    expect(() => stMax.query(-1, 0)).toThrow('Invalid range')

    const stGcd = new SparseTable3([1, 2], 'gcd')
    expect(() => stGcd.query(1, 0)).toThrow('Invalid range')

    const stSum = new SparseTable3([1, 2], 'sum')
    expect(() => stSum.query(0, 5)).toThrow('Invalid range')
  })
})

// ─── Accessor methods ───

describe('SparseTable3 accessor methods', () => {
  it('toArray should return original array', () => {
    const st = new SparseTable3([3, 1, 4])
    expect(st.toArray()).toEqual([3, 1, 4])
  })

  it('size should return array length', () => {
    expect(new SparseTable3([1]).size()).toBe(1)
    expect(new SparseTable3([1, 2, 3, 4]).size()).toBe(4)
  })

  it('getTimeComplexity should return O(1) for min/max', () => {
    expect(new SparseTable3([1], 'min').getTimeComplexity()).toBe(
      'Preprocess: O(n log n), Query: O(1)'
    )
    expect(new SparseTable3([1], 'max').getTimeComplexity()).toBe(
      'Preprocess: O(n log n), Query: O(1)'
    )
  })

  it('getTimeComplexity should return O(log n) for sum', () => {
    expect(new SparseTable3([1], 'sum').getTimeComplexity()).toBe(
      'Preprocess: O(n log n), Query: O(log n)'
    )
  })

  it('getTimeComplexity should return O(log n * log(max)) for gcd', () => {
    expect(new SparseTable3([1], 'gcd').getTimeComplexity()).toBe(
      'Preprocess: O(n log n), Query: O(log n * log(max))'
    )
  })
})
