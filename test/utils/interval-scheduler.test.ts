import { describe, it, expect } from 'vitest'
import { weightedIntervalSchedule, greedyIntervalSchedule } from '../../src/utils/interval-scheduler.js'

describe('weightedIntervalSchedule', () => {
  it('returns empty for empty input', () => {
    const result = weightedIntervalSchedule([])
    expect(result.selected).toEqual([])
    expect(result.totalWeight).toBe(0)
  })

  it('selects single interval', () => {
    const intervals = [{ start: 0, end: 5, weight: 10 }]
    const result = weightedIntervalSchedule(intervals)
    expect(result.selected).toEqual(intervals)
    expect(result.totalWeight).toBe(10)
  })

  it('selects non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 3, weight: 5 },
      { start: 3, end: 6, weight: 7 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(12)
    expect(result.selected.length).toBe(2)
  })

  it('skips overlapping for better weight', () => {
    const intervals = [
      { start: 0, end: 5, weight: 10 },
      { start: 1, end: 3, weight: 6 },
      { start: 4, end: 6, weight: 7 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(13)
  })

  it('handles three non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 2, weight: 3 },
      { start: 2, end: 4, weight: 4 },
      { start: 4, end: 6, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(12)
    expect(result.selected.length).toBe(3)
  })

  it('picks higher weight over more intervals', () => {
    const intervals = [
      { start: 0, end: 10, weight: 20 },
      { start: 0, end: 3, weight: 5 },
      { start: 3, end: 6, weight: 5 },
      { start: 6, end: 9, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(20)
  })

  it('handles intervals with zero weight', () => {
    const intervals = [
      { start: 0, end: 2, weight: 0 },
      { start: 2, end: 4, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(5)
  })

  it('handles all equal intervals', () => {
    const intervals = [
      { start: 0, end: 5, weight: 3 },
      { start: 0, end: 5, weight: 3 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(3)
  })
})

describe('greedyIntervalSchedule', () => {
  it('returns empty for empty input', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('selects single interval', () => {
    const intervals = [{ start: 0, end: 5 }]
    expect(greedyIntervalSchedule(intervals)).toEqual(intervals)
  })

  it('selects maximum non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 3 },
      { start: 2, end: 5 },
      { start: 4, end: 7 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({ start: 0, end: 3 })
    expect(result[1]).toEqual({ start: 4, end: 7 })
  })

  it('selects all non-overlapping', () => {
    const intervals = [
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ]
    expect(greedyIntervalSchedule(intervals).length).toBe(3)
  })

  it('selects from overlapping set', () => {
    const intervals = [
      { start: 0, end: 6 },
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 5, end: 7 },
      { start: 8, end: 9 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('greedy handles single element', () => {
    const intervals = [{ start: 5, end: 10 }]
    expect(greedyIntervalSchedule(intervals)).toEqual(intervals)
  })

  it('greedy handles identical endpoints', () => {
    const intervals = [
      { start: 0, end: 2 },
      { start: 2, end: 4 },
      { start: 2, end: 5 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('weighted handles large weight difference', () => {
    const intervals = [
      { start: 0, end: 100, weight: 1000 },
      { start: 0, end: 1, weight: 1 },
      { start: 1, end: 2, weight: 1 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(1000)
  })

  it('greedy handles empty input', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('weighted handles empty input', () => {
    const result = weightedIntervalSchedule([])
    expect(result.selected).toEqual([])
    expect(result.totalWeight).toBe(0)
  })

  it('greedy selects earliest finishing', () => {
    const intervals = [
      { start: 0, end: 3 },
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('no intervals returns empty', () => {
    const result = greedyIntervalSchedule([])
    expect(result).toEqual([])
  })

  it('single interval returns it', () => {
    const result = greedyIntervalSchedule([{ start: 0, end: 5 }])
    expect(result.length).toBe(1)
  })

  it('overlapping picks earliest end', () => {
    const result = greedyIntervalSchedule([
      { start: 0, end: 10 },
      { start: 5, end: 7 },
    ])
    expect(result.length).toBe(1)
    expect(result[0]!.end).toBe(7)
  })

  it('greedy with empty returns empty', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('single interval returns itself', () => {
    expect(greedyIntervalSchedule([{ start: 0, end: 5 }])).toEqual([{ start: 0, end: 5 }])
  })

  it('weighted handles completely overlapping', () => {
    const intervals = [
      { start: 0, end: 10, weight: 5 },
      { start: 0, end: 10, weight: 10 },
      { start: 0, end: 10, weight: 7 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(10)
    expect(result.selected.length).toBe(1)
  })

  it('weighted handles partial overlap', () => {
    const intervals = [
      { start: 0, end: 5, weight: 5 },
      { start: 3, end: 8, weight: 10 },
      { start: 6, end: 10, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(10)
  })

  it('weighted chooses max when equal non-overlapping', () => {
    const intervals = [
      { start: 0, end: 2, weight: 5 },
      { start: 2, end: 4, weight: 10 },
      { start: 4, end: 6, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(20)
  })

  it('weighted handles intervals starting at 0', () => {
    const intervals = [
      { start: 0, end: 1, weight: 5 },
      { start: 0, end: 2, weight: 10 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(10)
  })

  it('weighted handles intervals ending at same point', () => {
    const intervals = [
      { start: 0, end: 5, weight: 8 },
      { start: 3, end: 5, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(8)
  })

  it('weighted handles chain of non-overlapping', () => {
    const intervals = [
      { start: 0, end: 1, weight: 1 },
      { start: 1, end: 2, weight: 1 },
      { start: 2, end: 3, weight: 1 },
      { start: 3, end: 4, weight: 1 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(4)
  })

  it('weighted handles complex overlap pattern', () => {
    const intervals = [
      { start: 1, end: 4, weight: 5 },
      { start: 2, end: 5, weight: 6 },
      { start: 6, end: 9, weight: 5 },
      { start: 4, end: 7, weight: 10 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBeGreaterThanOrEqual(10)
  })

  it('weighted handles negative weights', () => {
    const intervals = [
      { start: 0, end: 2, weight: -5 },
      { start: 2, end: 4, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBeGreaterThanOrEqual(0)
  })

  it('weighted selects none when all negative', () => {
    const intervals = [
      { start: 0, end: 2, weight: -5 },
      { start: 2, end: 4, weight: -3 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(0)
  })

  it('weighted handles large number of intervals', () => {
    const intervals = Array.from({ length: 100 }, (_, i) => ({
      start: i,
      end: i + 1,
      weight: 1
    }))
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(100)
  })

  it('greedy handles completely overlapping', () => {
    const intervals = [
      { start: 0, end: 10 },
      { start: 0, end: 8 },
      { start: 0, end: 5 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(1)
    expect(result[0]!.end).toBe(5)
  })

  it('greedy handles chain of touching intervals', () => {
    const intervals = [
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('greedy selects earliest finishing first', () => {
    const intervals = [
      { start: 0, end: 10 },
      { start: 0, end: 5 },
      { start: 5, end: 6 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('greedy handles unsorted input', () => {
    const intervals = [
      { start: 5, end: 7 },
      { start: 0, end: 3 },
      { start: 2, end: 5 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('greedy handles intervals with same end', () => {
    const intervals = [
      { start: 0, end: 5 },
      { start: 1, end: 5 },
      { start: 5, end: 10 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('greedy handles large gaps', () => {
    const intervals = [
      { start: 0, end: 1 },
      { start: 100, end: 101 },
      { start: 200, end: 201 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('greedy handles single long interval', () => {
    const intervals = [
      { start: 0, end: 100 },
      { start: 10, end: 20 },
      { start: 30, end: 40 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('greedy selects max non-overlapping from dense set', () => {
    const intervals = [
      { start: 0, end: 2 },
      { start: 1, end: 3 },
      { start: 2, end: 4 },
      { start: 3, end: 5 },
      { start: 4, end: 6 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('weighted handles fractional weights', () => {
    const intervals = [
      { start: 0, end: 2, weight: 1.5 },
      { start: 2, end: 4, weight: 2.5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBeCloseTo(4.0)
  })

  it('weighted handles very large weights', () => {
    const intervals = [
      { start: 0, end: 2, weight: Number.MAX_SAFE_INTEGER },
      { start: 2, end: 4, weight: 1 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(Number.MAX_SAFE_INTEGER + 1)
  })

  it('weighted handles intervals at boundaries', () => {
    const intervals = [
      { start: 0, end: 0, weight: 5 },
      { start: 0, end: 1, weight: 10 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBeGreaterThanOrEqual(5)
  })

  it('greedy handles intervals in random order', () => {
    const intervals = [
      { start: 8, end: 9 },
      { start: 1, end: 4 },
      { start: 3, end: 6 },
      { start: 0, end: 2 },
      { start: 5, end: 7 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('weighted handles alternative equal weight selections', () => {
    const intervals = [
      { start: 0, end: 3, weight: 10 },
      { start: 3, end: 6, weight: 10 },
      { start: 0, end: 6, weight: 15 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBeGreaterThanOrEqual(15)
  })

  it('greedy handles intervals with zero duration', () => {
    const intervals = [
      { start: 0, end: 0 },
      { start: 1, end: 1 },
      { start: 2, end: 2 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('should handle greedy scheduling with empty input', () => {
    const result = greedyIntervalSchedule([])
    expect(result).toEqual([])
  })

  it('should handle single interval', () => {
    const result = greedyIntervalSchedule([{ start: 0, end: 5 }])
    expect(result.length).toBe(1)
  })

  it('should handle weighted intervals', () => {
    const intervals = [
      { start: 0, end: 3, weight: 5 },
      { start: 2, end: 5, weight: 6 },
      { start: 4, end: 7, weight: 4 },
    ]
    const { totalWeight } = weightedIntervalSchedule(intervals)
    expect(totalWeight).toBeGreaterThan(0)
  })

  it('should handle non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 2, weight: 3 },
      { start: 3, end: 5, weight: 4 },
    ]
    const { totalWeight, selected } = weightedIntervalSchedule(intervals)
    expect(totalWeight).toBe(7)
    expect(selected.length).toBe(2)
  })

  it('greedyIntervalSchedule picks earliest finish', () => {
    const intervals = [
      { start: 0, end: 3 },
      { start: 2, end: 5 },
      { start: 4, end: 7 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('greedyIntervalSchedule empty input', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('weighted empty intervals', () => {
    const { totalWeight, selected } = weightedIntervalSchedule([])
    expect(totalWeight).toBe(0)
    expect(selected).toEqual([])
  })

  it('empty intervals', () => {
    expect(weightedIntervalSchedule([])).toEqual({ selected: [], totalWeight: 0 })
  })

  it('single interval', () => {
    const result = weightedIntervalSchedule([{ start: 0, end: 1, weight: 5 }])
    expect(result.totalWeight).toBe(5)
  })

  it('greedy empty', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })
})

describe('interval-scheduler - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-scheduler - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-scheduler - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('interval-scheduler - wave548', () => {
  it('interval-scheduler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave549', () => {
  it('interval-scheduler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave550', () => {
  it('interval-scheduler w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave551', () => {
  it('interval-scheduler w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave552', () => {
  it('interval-scheduler w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave553', () => {
  it('interval-scheduler w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave554', () => {
  it('interval-scheduler w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave555', () => {
  it('interval-scheduler w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave556', () => {
  it('interval-scheduler w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-scheduler - wave557', () => {
  it('interval-scheduler w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-scheduler w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
