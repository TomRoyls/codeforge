import { describe, expect, it } from 'vitest'
import { SquareDecomp } from '../../src/core/square-decomp/index.js'

// ─── Constructor ───

describe('SquareDecomp – constructor', () => {
  it('creates decomposition from an array', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5])
    expect(sd.size).toBe(5)
  })

  it('handles empty array', () => {
    const sd = new SquareDecomp([])
    expect(sd.size).toBe(0)
    expect(sd.toArray()).toEqual([])
  })

  it('handles single element', () => {
    const sd = new SquareDecomp([42])
    expect(sd.size).toBe(1)
    expect(sd.get(0)).toBe(42)
  })

  it('computes blockSize and blockCount correctly', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.blockSize).toBe(3)
    expect(sd.blockCount).toBe(3)
  })

  it('computes blockSize for non-square length', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5])
    expect(sd.blockSize).toBe(2)
    expect(sd.blockCount).toBe(3)
  })

  it('does not mutate the original array', () => {
    const original = [1, 2, 3]
    const sd = new SquareDecomp(original)
    sd.update(0, 99)
    expect(original[0]).toBe(1)
  })
})

// ─── get ───

describe('SquareDecomp – get', () => {
  it('returns element at index', () => {
    const sd = new SquareDecomp([10, 20, 30])
    expect(sd.get(0)).toBe(10)
    expect(sd.get(1)).toBe(20)
    expect(sd.get(2)).toBe(30)
  })

  it('returns 0 for out-of-bounds index', () => {
    const sd = new SquareDecomp([1, 2, 3])
    expect(sd.get(99)).toBe(0)
  })

  it('returns 0 for negative index', () => {
    const sd = new SquareDecomp([1, 2, 3])
    expect(sd.get(-1)).toBe(0)
  })
})

// ─── update ───

describe('SquareDecomp – update', () => {
  it('updates a value and reflects in get', () => {
    const sd = new SquareDecomp([1, 2, 3])
    sd.update(1, 20)
    expect(sd.get(1)).toBe(20)
  })

  it('updates sum after modification', () => {
    const sd = new SquareDecomp([1, 2, 3, 4])
    sd.update(1, 10)
    expect(sd.queryRangeSum(0, 3)).toBe(1 + 10 + 3 + 4)
  })

  it('updates min after modification', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9])
    sd.update(4, -1)
    expect(sd.queryRangeMin(3, 5)).toBe(-1)
  })

  it('updates max after modification', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9])
    sd.update(4, 100)
    expect(sd.queryRangeMax(3, 5)).toBe(100)
  })

  it('updates to negative value', () => {
    const sd = new SquareDecomp([1, 2, 3])
    sd.update(1, -5)
    expect(sd.get(1)).toBe(-5)
    expect(sd.queryRangeSum(0, 2)).toBe(-1)
  })

  it('updates to zero', () => {
    const sd = new SquareDecomp([1, 2, 3])
    sd.update(0, 0)
    expect(sd.get(0)).toBe(0)
    expect(sd.queryRangeSum(0, 2)).toBe(5)
  })
})

// ─── queryRange / queryRangeSum ───

describe('SquareDecomp – queryRangeSum', () => {
  it('returns sum of single element range', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5])
    expect(sd.queryRangeSum(2, 2)).toBe(3)
  })

  it('returns sum of full range', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5])
    expect(sd.queryRangeSum(0, 4)).toBe(15)
  })

  it('returns sum within a single block', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.queryRangeSum(0, 2)).toBe(6)
  })

  it('returns sum across multiple blocks', () => {
    const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(sd.queryRangeSum(0, 8)).toBe(45)
  })

  it('queryRange delegates to queryRangeSum', () => {
    const sd = new SquareDecomp([10, 20, 30])
    expect(sd.queryRange(0, 2)).toBe(sd.queryRangeSum(0, 2))
  })

  it('handles range with negatives', () => {
    const sd = new SquareDecomp([-1, -2, 3, -4, 5])
    expect(sd.queryRangeSum(0, 4)).toBe(1)
  })

  it('handles range of all zeros', () => {
    const sd = new SquareDecomp([0, 0, 0, 0])
    expect(sd.queryRangeSum(0, 3)).toBe(0)
  })
})

// ─── queryRangeMin ───

describe('SquareDecomp – queryRangeMin', () => {
  it('returns min of single element', () => {
    const sd = new SquareDecomp([5, 3, 7])
    expect(sd.queryRangeMin(1, 1)).toBe(3)
  })

  it('returns min of full range', () => {
    const sd = new SquareDecomp([5, 3, 7, 1, 9])
    expect(sd.queryRangeMin(0, 4)).toBe(1)
  })

  it('returns min within a single block', () => {
    const sd = new SquareDecomp([9, 2, 5, 8, 1, 7, 3, 6, 4])
    expect(sd.queryRangeMin(0, 2)).toBe(2)
  })

  it('returns min across multiple blocks', () => {
    const sd = new SquareDecomp([9, 2, 5, 8, 1, 7, 3, 6, 4])
    expect(sd.queryRangeMin(0, 8)).toBe(1)
  })

  it('handles negative values', () => {
    const sd = new SquareDecomp([1, -5, 3, -10, 2])
    expect(sd.queryRangeMin(0, 4)).toBe(-10)
  })
})

// ─── queryRangeMax ───

describe('SquareDecomp – queryRangeMax', () => {
  it('returns max of single element', () => {
    const sd = new SquareDecomp([5, 3, 7])
    expect(sd.queryRangeMax(1, 1)).toBe(3)
  })

  it('returns max of full range', () => {
    const sd = new SquareDecomp([5, 3, 7, 1, 9])
    expect(sd.queryRangeMax(0, 4)).toBe(9)
  })

  it('returns max within a single block', () => {
    const sd = new SquareDecomp([9, 2, 5, 8, 1, 7, 3, 6, 4])
    expect(sd.queryRangeMax(0, 2)).toBe(9)
  })

  it('returns max across multiple blocks', () => {
    const sd = new SquareDecomp([9, 2, 5, 8, 1, 7, 3, 6, 4])
    expect(sd.queryRangeMax(0, 8)).toBe(9)
  })

  it('handles negative values', () => {
    const sd = new SquareDecomp([-1, -5, -3, -10, -2])
    expect(sd.queryRangeMax(0, 4)).toBe(-1)
  })
})

// ─── toArray ───

describe('SquareDecomp – toArray', () => {
  it('returns a copy of the array', () => {
    const sd = new SquareDecomp([1, 2, 3])
    const arr = sd.toArray()
    expect(arr).toEqual([1, 2, 3])
    arr[0] = 99
    expect(sd.get(0)).toBe(1)
  })

  it('reflects updates', () => {
    const sd = new SquareDecomp([1, 2, 3])
    sd.update(1, 20)
    expect(sd.toArray()).toEqual([1, 20, 3])
  })
})

// ─── Edge cases ───

describe('SquareDecomp – edge cases', () => {
  it('handles large array', () => {
    const n = 1000
    const arr = Array.from({ length: n }, (_, i) => i + 1)
    const sd = new SquareDecomp(arr)
    expect(sd.size).toBe(n)
    expect(sd.queryRangeSum(0, n - 1)).toBe((n * (n + 1)) / 2)
    expect(sd.queryRangeMin(0, n - 1)).toBe(1)
    expect(sd.queryRangeMax(0, n - 1)).toBe(n)
  })

  it('handles array of all same values', () => {
    const sd = new SquareDecomp([5, 5, 5, 5, 5])
    expect(sd.queryRangeSum(0, 4)).toBe(25)
    expect(sd.queryRangeMin(0, 4)).toBe(5)
    expect(sd.queryRangeMax(0, 4)).toBe(5)
  })

  it('handles single element queries after update', () => {
    const sd = new SquareDecomp([10])
    sd.update(0, 99)
    expect(sd.queryRangeSum(0, 0)).toBe(99)
    expect(sd.queryRangeMin(0, 0)).toBe(99)
    expect(sd.queryRangeMax(0, 0)).toBe(99)
  })

  it('handles two-element array', () => {
    const sd = new SquareDecomp([3, 7])
    expect(sd.queryRangeSum(0, 1)).toBe(10)
    expect(sd.queryRangeMin(0, 1)).toBe(3)
    expect(sd.queryRangeMax(0, 1)).toBe(7)
  })

  it('handles all negative array', () => {
    const sd = new SquareDecomp([-5, -3, -8, -1, -4])
    expect(sd.queryRangeSum(0, 4)).toBe(-21)
    expect(sd.queryRangeMin(0, 4)).toBe(-8)
    expect(sd.queryRangeMax(0, 4)).toBe(-1)
  })
})
