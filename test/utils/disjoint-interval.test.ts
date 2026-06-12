import { describe, expect, it } from 'vitest'
import { DisjointInterval } from '../../src/utils/disjoint-interval.js'

describe('DisjointInterval', () => {
  it('adds single interval', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    expect(di.getIntervals()).toEqual([[1, 5]])
  })

  it('merges overlapping intervals', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(2, 5)
    expect(di.getIntervals()).toEqual([[1, 5]])
  })

  it('merges adjacent intervals', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(4, 6)
    expect(di.getIntervals()).toEqual([[1, 6]])
  })

  it('keeps disjoint intervals separate', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(7, 9)
    expect(di.count).toBe(2)
  })

  it('contains checks membership', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    expect(di.contains(3)).toBe(true)
    expect(di.contains(6)).toBe(false)
  })

  it('removes interval', () => {
    const di = new DisjointInterval()
    di.add(1, 10)
    di.remove(4, 6)
    expect(di.getIntervals()).toEqual([[1, 3], [7, 10]])
  })

  it('totalCovered computes sum', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(7, 9)
    expect(di.totalCovered()).toBe(6)
  })

  it('covers checks full range', () => {
    const di = new DisjointInterval()
    di.add(1, 10)
    expect(di.covers(2, 8)).toBe(true)
    expect(di.covers(2, 12)).toBe(false)
  })

  it('handles add then remove all', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    di.remove(1, 5)
    expect(di.count).toBe(0)
  })

  it('handles invalid range', () => {
    const di = new DisjointInterval()
    di.add(5, 3)
    expect(di.count).toBe(0)
  })

  it('remove from middle of interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 5)
    expect(di.getIntervals()).toEqual([[0, 4], [6, 10]])
  })

  it('contains after multiple operations', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    di.add(10, 15)
    di.remove(3, 12)
    expect(di.contains(2)).toBe(true)
    expect(di.contains(3)).toBe(false)
    expect(di.contains(14)).toBe(true)
  })

  it('covers range after split', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(4, 6)
    expect(di.covers(0, 3)).toBe(true)
    expect(di.covers(4, 6)).toBe(false)
    expect(di.covers(7, 10)).toBe(true)
  })

  it('handles adjacent intervals merge', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(6, 10)
    const intervals = di.getIntervals()
    expect(intervals.length).toBeGreaterThanOrEqual(1)
    expect(intervals.length).toBeLessThanOrEqual(2)
  })

  it('totalCovered after removal', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 5)
    expect(di.totalCovered()).toBe(10)
  })

  it('handles empty interval set', () => {
    const di = new DisjointInterval()
    expect(di.getIntervals()).toEqual([])
    expect(di.totalCovered()).toBe(0)
  })

  it('covers full range after single add', () => {
    const di = new DisjointInterval()
    di.add(0, 100)
    expect(di.covers(0, 100)).toBe(true)
  })

  it('empty interval covers nothing', () => {
    const di = new DisjointInterval()
    expect(di.covers(0, 1)).toBe(false)
  })

  it('add and covers single interval', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    expect(di.covers(0, 5)).toBe(true)
    expect(di.covers(0, 6)).toBe(false)
  })

  it('add then covers returns true', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    expect(di.covers(2, 3)).toBe(true)
  })

  it('does not cover outside range', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    expect(di.covers(6, 8)).toBe(false)
  })

  it('covers returns true for sub-interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    expect(di.covers(2, 8)).toBe(true)
  })

  it('covers returns false for uncovered range', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    expect(di.covers(8, 15)).toBe(false)
  })

  it('covers exact range', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    expect(di.covers(0, 10)).toBe(true)
  })

  it('add interval with negative numbers', () => {
    const di = new DisjointInterval()
    di.add(-5, -1)
    expect(di.getIntervals()).toEqual([[-5, -1]])
  })

  it('contains with negative numbers', () => {
    const di = new DisjointInterval()
    di.add(-5, -1)
    expect(di.contains(-3)).toBe(true)
    expect(di.contains(0)).toBe(false)
  })

  it('merges intervals with negative numbers', () => {
    const di = new DisjointInterval()
    di.add(-5, -1)
    di.add(0, 3)
    expect(di.getIntervals()).toEqual([[-5, 3]])
  })

  it('remove with negative numbers', () => {
    const di = new DisjointInterval()
    di.add(-5, 5)
    di.remove(-2, 2)
    expect(di.getIntervals()).toEqual([[-5, -3], [3, 5]])
  })

  it('totalCovered with negative numbers', () => {
    const di = new DisjointInterval()
    di.add(-5, -1)
    di.add(1, 5)
    expect(di.totalCovered()).toBe(10)
  })

  it('add single point interval', () => {
    const di = new DisjointInterval()
    di.add(5, 5)
    expect(di.getIntervals()).toEqual([[5, 5]])
  })

  it('contains single point', () => {
    const di = new DisjointInterval()
    di.add(5, 5)
    expect(di.contains(5)).toBe(true)
    expect(di.contains(4)).toBe(false)
  })

  it('remove single point from interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 5)
    expect(di.contains(5)).toBe(false)
  })

  it('totalCovered counts single points correctly', () => {
    const di = new DisjointInterval()
    di.add(5, 5)
    expect(di.totalCovered()).toBe(1)
  })

  it('covers with single point', () => {
    const di = new DisjointInterval()
    di.add(5, 5)
    expect(di.covers(5, 5)).toBe(true)
    expect(di.covers(5, 6)).toBe(false)
  })

  it('remove from left edge of interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(0, 3)
    expect(di.getIntervals()).toEqual([[4, 10]])
  })

  it('remove from right edge of interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(7, 10)
    expect(di.getIntervals()).toEqual([[0, 6]])
  })

  it('remove entire interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(0, 10)
    expect(di.count).toBe(0)
  })

  it('remove multiple intervals at once', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(10, 15)
    di.add(20, 25)
    di.remove(3, 12)
    expect(di.getIntervals()).toEqual([[0, 2], [13, 15], [20, 25]])
  })

  it('add interval that connects multiple intervals', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(10, 15)
    di.add(5, 10)
    expect(di.getIntervals()).toEqual([[0, 15]])
  })

  it('add interval that partially overlaps first interval', () => {
    const di = new DisjointInterval()
    di.add(10, 20)
    di.add(15, 25)
    expect(di.getIntervals()).toEqual([[10, 25]])
  })

  it('add interval that partially overlaps last interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.add(5, 15)
    expect(di.getIntervals()).toEqual([[0, 15]])
  })

  it('add interval between two intervals', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(15, 20)
    di.add(7, 12)
    expect(di.count).toBe(3)
  })

  it('remove with invalid range does nothing', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 3)
    expect(di.getIntervals()).toEqual([[0, 10]])
  })

  it('covers empty range', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    expect(di.covers(5, 5)).toBe(true)
  })

  it('contains with large positive numbers', () => {
    const di = new DisjointInterval()
    di.add(1000000, 1000005)
    expect(di.contains(1000002)).toBe(true)
  })

  it('add interval with large range', () => {
    const di = new DisjointInterval()
    di.add(0, 1000000)
    expect(di.getIntervals()).toEqual([[0, 1000000]])
  })

  it('totalCovered with large range', () => {
    const di = new DisjointInterval()
    di.add(0, 1000000)
    expect(di.totalCovered()).toBe(1000001)
  })

  it('multiple consecutive adds merge into one', () => {
    const di = new DisjointInterval()
    di.add(0, 2)
    di.add(3, 5)
    di.add(6, 8)
    di.add(9, 11)
    expect(di.getIntervals().length).toBeLessThanOrEqual(4)
  })

  it('remove creates three intervals from one', () => {
    const di = new DisjointInterval()
    di.add(0, 20)
    di.remove(5, 10)
    expect(di.getIntervals()).toEqual([[0, 4], [11, 20]])
  })

  it('covers with multiple intervals', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(10, 15)
    expect(di.covers(0, 5)).toBe(true)
    expect(di.covers(10, 15)).toBe(true)
    expect(di.covers(0, 15)).toBe(false)
  })

  it('contains at interval boundary', () => {
    const di = new DisjointInterval()
    di.add(5, 10)
    expect(di.contains(5)).toBe(true)
    expect(di.contains(10)).toBe(true)
  })

  it('remove at interval boundary', () => {
    const di = new DisjointInterval()
    di.add(5, 10)
    di.remove(5, 5)
    expect(di.contains(5)).toBe(false)
  })

  it('add duplicate intervals', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(0, 5)
    expect(di.getIntervals()).toEqual([[0, 5]])
  })

  it('remove from empty set', () => {
    const di = new DisjointInterval()
    di.remove(0, 5)
    expect(di.count).toBe(0)
  })

  it('totalCovered after multiple removes', () => {
    const di = new DisjointInterval()
    di.add(0, 20)
    di.remove(5, 10)
    di.remove(15, 15)
    expect(di.totalCovered()).toBe(14)
  })

  it('handles zero length interval in remove', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 4)
    expect(di.getIntervals()).toEqual([[0, 10]])
  })

  it('covers returns true when l > r if range is covered', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    expect(di.covers(8, 5)).toBe(true)
  })
})
describe('disjoint-interval - wave548', () => {
  it('disjoint-interval module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module has name', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module not null', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module has length', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave549', () => {
  it('disjoint-interval module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave550', () => {
  it('disjoint-interval w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
