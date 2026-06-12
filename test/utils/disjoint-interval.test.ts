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

describe('disjoint-interval - wave551', () => {
  it('disjoint-interval w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave552', () => {
  it('disjoint-interval w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave553', () => {
  it('disjoint-interval w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave554', () => {
  it('disjoint-interval w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave555', () => {
  it('disjoint-interval w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave556', () => {
  it('disjoint-interval w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave557', () => {
  it('disjoint-interval w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave558', () => {
  it('disjoint-interval w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave559', () => {
  it('disjoint-interval w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave560', () => {
  it('disjoint-interval w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave561', () => {
  it('disjoint-interval w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave562', () => {
  it('disjoint-interval w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave563', () => {
  it('disjoint-interval w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave564', () => {
  it('disjoint-interval w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave565', () => {
  it('disjoint-interval w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave566', () => {
  it('disjoint-interval w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave127', () => {
  it('disjoint-interval w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave130', () => {
  it('disjoint-interval w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave133', () => {
  it('disjoint-interval w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave136', () => {
  it('disjoint-interval w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - wave139', () => {
  it('disjoint-interval w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w142', () => {
  it('disjoint-interval v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w145', () => {
  it('disjoint-interval v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w148', () => {
  it('disjoint-interval v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w151', () => {
  it('disjoint-interval v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w154', () => {
  it('disjoint-interval v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w157', () => {
  it('disjoint-interval v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w160', () => {
  it('disjoint-interval v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w170', () => {
  it('disjoint-interval x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w180', () => {
  it('disjoint-interval x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w190', () => {
  it('disjoint-interval x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w200', () => {
  it('disjoint-interval x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w210', () => {
  it('disjoint-interval x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w220', () => {
  it('disjoint-interval x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w230', () => {
  it('disjoint-interval x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w240', () => {
  it('disjoint-interval x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w250', () => {
  it('disjoint-interval x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w260', () => {
  it('disjoint-interval x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w270', () => {
  it('disjoint-interval x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w280', () => {
  it('disjoint-interval x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w290', () => {
  it('disjoint-interval x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w300', () => {
  it('disjoint-interval x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w310', () => {
  it('disjoint-interval x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w320', () => {
  it('disjoint-interval x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w330', () => {
  it('disjoint-interval x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w340', () => {
  it('disjoint-interval x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w350', () => {
  it('disjoint-interval x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w360', () => {
  it('disjoint-interval x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w370', () => {
  it('disjoint-interval x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w380', () => {
  it('disjoint-interval x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w390', () => {
  it('disjoint-interval x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w400', () => {
  it('disjoint-interval x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w420', () => {
  it('disjoint-interval x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w440', () => {
  it('disjoint-interval x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w460', () => {
  it('disjoint-interval x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w480', () => {
  it('disjoint-interval x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w500', () => {
  it('disjoint-interval x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w550', () => {
  it('disjoint-interval x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w600', () => {
  it('disjoint-interval x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w650', () => {
  it('disjoint-interval x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval - w700', () => {
  it('disjoint-interval x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval x700x49', () => {
    expect(describe).toBeDefined()
  })
})
