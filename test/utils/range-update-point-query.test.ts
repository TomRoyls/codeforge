import { describe, it, expect } from 'vitest'
import { RangeUpdatePointQuery } from '../../src/utils/range-update-point-query.js'

describe('RangeUpdatePointQuery', () => {
  it('adds to single point', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addPoint(2, 10)
    expect(rq.get(2)).toBe(10)
    expect(rq.get(1)).toBe(0)
  })

  it('adds to range', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(1, 3, 5)
    expect(rq.get(0)).toBe(0)
    expect(rq.get(1)).toBe(5)
    expect(rq.get(2)).toBe(5)
    expect(rq.get(3)).toBe(5)
    expect(rq.get(4)).toBe(0)
  })

  it('multiple ranges accumulate', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 1)
    rq.addRange(1, 3, 2)
    expect(rq.get(0)).toBe(1)
    expect(rq.get(1)).toBe(3)
    expect(rq.get(2)).toBe(3)
    expect(rq.get(3)).toBe(3)
    expect(rq.get(4)).toBe(1)
  })

  it('build returns full array', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(1, 3, 7)
    expect(rq.build()).toEqual([0, 7, 7, 7, 0])
  })

  it('handles empty operations', () => {
    const rq = new RangeUpdatePointQuery(3)
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('reset clears all updates', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 5)
    rq.reset()
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('ignores out of bounds range', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(-1, 5, 10)
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('handles negative values', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, -5)
    expect(rq.build()).toEqual([-5, -5, -5])
  })

  it('handles single element', () => {
    const rq = new RangeUpdatePointQuery(1)
    rq.addPoint(0, 42)
    expect(rq.get(0)).toBe(42)
  })

  it('get returns 0 for out of bounds', () => {
    const rq = new RangeUpdatePointQuery(3)
    expect(rq.get(-1)).toBe(0)
    expect(rq.get(5)).toBe(0)
  })

  it('overlapping ranges with different values', () => {
    const rq = new RangeUpdatePointQuery(10)
    rq.addRange(0, 5, 1)
    rq.addRange(3, 8, 2)
    rq.addRange(5, 9, 3)
    const result = rq.build()
    expect(result[2]).toBe(1)
    expect(result[4]).toBe(3)
    expect(result[6]).toBe(5)
    expect(result[9]).toBe(3)
  })

  it('length property is correct', () => {
    const rq = new RangeUpdatePointQuery(42)
    expect(rq.length).toBe(42)
  })

  it('handles large number of updates', () => {
    const rq = new RangeUpdatePointQuery(100)
    for (let i = 0; i < 50; i++) {
      rq.addRange(i, i + 50, 1)
    }
    const result = rq.build()
    expect(result[25]).toBe(26)
  })

  it('addPoint is equivalent to single-element range', () => {
    const rq1 = new RangeUpdatePointQuery(5)
    const rq2 = new RangeUpdatePointQuery(5)
    rq1.addPoint(2, 10)
    rq2.addRange(2, 2, 10)
    expect(rq1.build()).toEqual(rq2.build())
  })

  it('multiple resets work correctly', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 1)
    rq.reset()
    rq.addRange(1, 3, 5)
    expect(rq.build()).toEqual([0, 5, 5, 5, 0])
    rq.reset()
    expect(rq.build()).toEqual([0, 0, 0, 0, 0])
  })

  it('handles zero value updates', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 0)
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('overlapping range updates accumulate', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 1)
    rq.addRange(2, 4, 3)
    const result = rq.build()
    expect(result[0]).toBe(1)
    expect(result[2]).toBe(4)
  })

  it('multiple points', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addPoint(0, 1)
    rq.addPoint(1, 2)
    rq.addPoint(2, 3)
    const result = rq.build()
    expect(result).toEqual([1, 2, 3])
  })

  it('empty build returns empty', () => {
    const rq = new RangeUpdatePointQuery(0)
    expect(rq.build()).toEqual([])
  })

  it('multiple updates accumulate', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 1)
    rq.addRange(1, 2, 2)
    expect(rq.build()).toEqual([1, 3, 3])
  })

  it('single point update via range', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(1, 1, 10)
    expect(rq.build()).toEqual([0, 10, 0])
  })

  it('ignores l > r', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(2, 1, 5)
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('add negative then positive cancels', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 10)
    rq.addRange(0, 4, -10)
    expect(rq.build()).toEqual([0, 0, 0, 0, 0])
  })

  it('get after multiple point updates', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addPoint(2, 5)
    rq.addPoint(2, 3)
    rq.addPoint(2, -1)
    expect(rq.get(2)).toBe(7)
  })

  it('build after reset and new updates', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 100)
    rq.reset()
    rq.addRange(2, 3, 1)
    expect(rq.build()).toEqual([0, 0, 1, 1, 0])
  })

  it('handles single point at start', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addPoint(0, 7)
    expect(rq.build()).toEqual([7, 0, 0, 0, 0])
  })

  it('handles single point at end', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addPoint(4, 7)
    expect(rq.build()).toEqual([0, 0, 0, 0, 7])
  })

  it('handles full range update', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 3)
    expect(rq.build()).toEqual([3, 3, 3, 3, 3])
  })

  it('handles adjacent non-overlapping ranges', () => {
    const rq = new RangeUpdatePointQuery(6)
    rq.addRange(0, 2, 1)
    rq.addRange(3, 5, 2)
    expect(rq.build()).toEqual([1, 1, 1, 2, 2, 2])
  })

  it('handles large values', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, Number.MAX_SAFE_INTEGER)
    expect(rq.get(1)).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles float values', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 1.5)
    expect(rq.get(1)).toBe(1.5)
  })

  it('get after range update matches build', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(1, 3, 7)
    const built = rq.build()
    for (let i = 0; i < 5; i++) {
      expect(rq.get(i)).toBe(built[i])
    }
  })

  it('length 0 has length 0', () => {
    const rq = new RangeUpdatePointQuery(0)
    expect(rq.length).toBe(0)
  })

  it('length 1 works', () => {
    const rq = new RangeUpdatePointQuery(1)
    expect(rq.length).toBe(1)
    rq.addPoint(0, 5)
    expect(rq.get(0)).toBe(5)
  })

  it('staggered ranges', () => {
    const rq = new RangeUpdatePointQuery(10)
    rq.addRange(0, 3, 1)
    rq.addRange(5, 8, 2)
    const result = rq.build()
    expect(result).toEqual([1, 1, 1, 1, 0, 2, 2, 2, 2, 0])
  })

  it('addPoint at boundary', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addPoint(0, 10)
    rq.addPoint(4, 20)
    expect(rq.build()).toEqual([10, 0, 0, 0, 20])
  })

  it('three overlapping ranges', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 1)
    rq.addRange(1, 3, 2)
    rq.addRange(2, 2, 3)
    expect(rq.build()).toEqual([1, 3, 6, 3, 1])
  })

  it('addPoint out of bounds does nothing', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addPoint(-1, 10)
    rq.addPoint(5, 10)
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('reset then get returns 0', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 5)
    rq.reset()
    expect(rq.get(0)).toBe(0)
    expect(rq.get(1)).toBe(0)
    expect(rq.get(2)).toBe(0)
  })

  it('many small point updates', () => {
    const rq = new RangeUpdatePointQuery(5)
    for (let i = 0; i < 5; i++) {
      rq.addPoint(i, i + 1)
    }
    expect(rq.build()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles same range added twice', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(1, 3, 5)
    rq.addRange(1, 3, 5)
    expect(rq.build()).toEqual([0, 10, 10, 10, 0])
  })

  it('negative point update', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addPoint(1, -7)
    expect(rq.build()).toEqual([0, -7, 0])
  })

  it('large array with single range', () => {
    const rq = new RangeUpdatePointQuery(1000)
    rq.addRange(0, 999, 1)
    expect(rq.get(0)).toBe(1)
    expect(rq.get(999)).toBe(1)
    expect(rq.get(500)).toBe(1)
  })

  it('update then reset then update', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 10)
    rq.reset()
    rq.addPoint(1, 5)
    expect(rq.build()).toEqual([0, 5, 0])
  })

  it('build matches sequential gets', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 2, 3)
    rq.addRange(3, 4, 7)
    const built = rq.build()
    for (let i = 0; i < 5; i++) {
      expect(rq.get(i)).toBe(built[i])
    }
  })

  it('overlapping ranges accumulate', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 1)
    rq.addRange(2, 4, 2)
    expect(rq.get(2)).toBe(3)
    expect(rq.get(0)).toBe(1)
  })

  it('get out of bounds returns 0', () => {
    const rq = new RangeUpdatePointQuery(3)
    expect(rq.get(5)).toBe(0)
    expect(rq.get(-1)).toBe(0)
  })

  it('multiple point updates on same index', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addPoint(1, 5)
    rq.addPoint(1, 3)
    expect(rq.get(1)).toBe(8)
  })

  it('reset clears all updates', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addRange(0, 2, 10)
    rq.reset()
    expect(rq.build()).toEqual([0, 0, 0])
  })

  it('length getter returns correct size', () => {
    const rq = new RangeUpdatePointQuery(7)
    expect(rq.length).toBe(7)
  })

  it('should handle single update', () => {
    const rq = new RangeUpdatePointQuery(5)
    rq.addRange(0, 4, 10)
    expect(rq.get(2)).toBe(10)
  })

  it('should handle point updates', () => {
    const rq = new RangeUpdatePointQuery(3)
    rq.addPoint(1, 5)
    expect(rq.get(1)).toBe(5)
  })
})
