import { describe, expect, it } from 'vitest'

import { WaveletMatrix } from '../src/core/wavelet-matrix/index.js'

// ─── Construction ────────────────────────────────────────
describe('WaveletMatrix construction', () => {
  it('creates matrix from values', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
    expect(wm.size()).toBe(8)
    expect(wm.isEmpty()).toBe(false)
    expect(wm.maxValue()).toBe(9)
  })

  it('creates empty matrix', () => {
    const wm = new WaveletMatrix([])
    expect(wm.size()).toBe(0)
    expect(wm.isEmpty()).toBe(true)
  })

  it('creates with explicit maxValue', () => {
    const wm = new WaveletMatrix([1, 2, 3], 15)
    expect(wm.maxValue()).toBe(15)
  })
})

// ─── Access ──────────────────────────────────────────────
describe('WaveletMatrix access', () => {
  it('accesses individual elements', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5])
    expect(wm.access(0)).toBe(3)
    expect(wm.access(1)).toBe(1)
    expect(wm.access(2)).toBe(4)
    expect(wm.access(3)).toBe(1)
    expect(wm.access(4)).toBe(5)
  })

  it('throws for out-of-bounds access', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(() => wm.access(-1)).toThrow(RangeError)
    expect(() => wm.access(3)).toThrow(RangeError)
  })
})

// ─── Rank ────────────────────────────────────────────────
describe('WaveletMatrix rank', () => {
  it('counts occurrences of value', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
    expect(wm.rank(1, 8)).toBe(2)
    expect(wm.rank(3, 8)).toBe(1)
    expect(wm.rank(7, 8)).toBe(0)
  })

  it('returns 0 for empty matrix', () => {
    const wm = new WaveletMatrix([])
    expect(wm.rank(1, 0)).toBe(0)
  })

  it('returns 0 for value out of range', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(wm.rank(10, 3)).toBe(0)
  })

  it('rankRange counts in subrange', () => {
    const wm = new WaveletMatrix([1, 2, 1, 3, 1])
    expect(wm.rankRange(1, 1, 5)).toBe(2)
    expect(wm.rankRange(1, 0, 5)).toBe(3)
  })
})

// ─── Select ──────────────────────────────────────────────
describe('WaveletMatrix select', () => {
  it('finds position of k-th occurrence', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5])
    expect(wm.select(1, 0)).toBe(1)
    expect(wm.select(1, 1)).toBe(3)
  })

  it('returns -1 for non-existent occurrence', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(wm.select(5, 0)).toBe(-1)
  })

  it('returns -1 for negative k', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(wm.select(1, -1)).toBe(-1)
  })
})

// ─── Quantile ────────────────────────────────────────────
describe('WaveletMatrix quantile', () => {
  it('finds k-th smallest in range', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
    expect(wm.quantile(0, 8, 0)).toBe(1)
    expect(wm.quantile(0, 8, 7)).toBe(9)
  })

  it('kthSmallest is alias for quantile', () => {
    const wm = new WaveletMatrix([5, 2, 8, 1])
    expect(wm.kthSmallest(0, 4, 0)).toBe(1)
    expect(wm.kthSmallest(0, 4, 3)).toBe(8)
  })

  it('kthLargest returns reverse order', () => {
    const wm = new WaveletMatrix([5, 2, 8, 1])
    expect(wm.kthLargest(0, 4, 0)).toBe(8)
    expect(wm.kthLargest(0, 4, 3)).toBe(1)
  })

  it('throws for invalid quantile query', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(() => wm.quantile(0, 3, -1)).toThrow(RangeError)
    expect(() => wm.quantile(0, 3, 3)).toThrow(RangeError)
  })
})

// ─── RangeCount ──────────────────────────────────────────
describe('WaveletMatrix rangeCount', () => {
  it('counts values in range', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6])
    expect(wm.rangeCount(0, 8, 1, 3)).toBe(4) // 1,1,2,3
    expect(wm.rangeCount(0, 8, 5, 9)).toBe(3) // 5,9,6
  })

  it('returns 0 for empty intersection', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(wm.rangeCount(0, 3, 10, 20)).toBe(0)
  })
})

// ─── RangeList ───────────────────────────────────────────
describe('WaveletMatrix rangeList', () => {
  it('lists values in range', () => {
    const wm = new WaveletMatrix([3, 1, 4, 1, 5])
    const result = wm.rangeList(0, 5, 1, 3)
    expect(result.sort((a, b) => a - b)).toEqual([1, 1, 3])
  })

  it('returns empty for no match', () => {
    const wm = new WaveletMatrix([1, 2, 3])
    expect(wm.rangeList(0, 3, 10, 20)).toEqual([])
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('WaveletMatrix toArray', () => {
  it('reconstructs original array', () => {
    const original = [3, 1, 4, 1, 5, 9, 2, 6]
    const wm = new WaveletMatrix(original)
    expect(wm.toArray()).toEqual(original)
  })

  it('handles single element', () => {
    const wm = new WaveletMatrix([42])
    expect(wm.toArray()).toEqual([42])
  })

  it('handles all same values', () => {
    const wm = new WaveletMatrix([5, 5, 5])
    expect(wm.toArray()).toEqual([5, 5, 5])
  })
})
