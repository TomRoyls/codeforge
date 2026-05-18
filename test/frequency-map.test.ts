import { describe, it, expect, beforeEach } from 'vitest'
import { FrequencyMap } from '../src/utils/frequency-map.js'

// ─── Constructor ──────────────────────────────────────
describe('FrequencyMap constructor', () => {
  it('creates empty map', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.isEmpty).toBe(true)
    expect(fm.size).toBe(0)
  })

  it('accepts options', () => {
    const fm = new FrequencyMap<string>({ initialCapacity: 10 })
    expect(fm.isEmpty).toBe(true)
  })
})

// ─── add ──────────────────────────────────────────────
describe('FrequencyMap.add', () => {
  let fm: FrequencyMap<string>

  beforeEach(() => {
    fm = new FrequencyMap<string>()
  })

  it('adds a key with default count 1', () => {
    fm.add('a')
    expect(fm.get('a')).toBe(1)
  })

  it('adds with custom count', () => {
    fm.add('a', 5)
    expect(fm.get('a')).toBe(5)
  })

  it('increments existing key', () => {
    fm.add('a', 3)
    fm.add('a', 2)
    expect(fm.get('a')).toBe(5)
  })

  it('ignores count <= 0', () => {
    fm.add('a', 0)
    expect(fm.has('a')).toBe(false)
    fm.add('a', -1)
    expect(fm.has('a')).toBe(false)
  })

  it('updates totalObservations', () => {
    fm.add('a', 3)
    fm.add('b', 2)
    expect(fm.totalObservations).toBe(5)
  })

  it('tracks maxKey and maxCount', () => {
    fm.add('a', 2)
    fm.add('b', 5)
    expect(fm.maxKey).toBe('b')
    expect(fm.maxCount).toBe(5)
  })

  it('updates max when later addition exceeds', () => {
    fm.add('a', 3)
    fm.add('b', 2)
    fm.add('a', 5)
    expect(fm.maxKey).toBe('a')
    expect(fm.maxCount).toBe(8)
  })
})

// ─── remove ───────────────────────────────────────────
describe('FrequencyMap.remove', () => {
  let fm: FrequencyMap<string>

  beforeEach(() => {
    fm = new FrequencyMap<string>()
  })

  it('removes existing key and returns true', () => {
    fm.add('a')
    expect(fm.remove('a')).toBe(true)
    expect(fm.has('a')).toBe(false)
  })

  it('returns false for non-existing key', () => {
    expect(fm.remove('z')).toBe(false)
  })

  it('updates totalObservations', () => {
    fm.add('a', 5)
    fm.remove('a')
    expect(fm.totalObservations).toBe(0)
  })

  it('recomputes max after removing maxKey', () => {
    fm.add('a', 3)
    fm.add('b', 5)
    fm.remove('b')
    expect(fm.maxKey).toBe('a')
    expect(fm.maxCount).toBe(3)
  })
})

// ─── decrease ─────────────────────────────────────────
describe('FrequencyMap.decrease', () => {
  let fm: FrequencyMap<string>

  beforeEach(() => {
    fm = new FrequencyMap<string>()
  })

  it('decreases count', () => {
    fm.add('a', 5)
    fm.decrease('a', 2)
    expect(fm.get('a')).toBe(3)
  })

  it('removes key if count reaches zero', () => {
    fm.add('a', 3)
    fm.decrease('a', 3)
    expect(fm.has('a')).toBe(false)
  })

  it('removes key if count exceeds', () => {
    fm.add('a', 2)
    fm.decrease('a', 10)
    expect(fm.has('a')).toBe(false)
  })

  it('returns false for non-existing key', () => {
    expect(fm.decrease('z', 1)).toBe(false)
  })

  it('updates totalObservations', () => {
    fm.add('a', 5)
    fm.decrease('a', 2)
    expect(fm.totalObservations).toBe(3)
  })

  it('uses default count of 1', () => {
    fm.add('a', 3)
    fm.decrease('a')
    expect(fm.get('a')).toBe(2)
  })
})

// ─── get / has ────────────────────────────────────────
describe('FrequencyMap.get / has', () => {
  it('get returns 0 for missing key', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.get('missing')).toBe(0)
  })

  it('has returns false for missing key', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.has('missing')).toBe(false)
  })

  it('has returns true after add', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    expect(fm.has('a')).toBe(true)
  })
})

// ─── size / isEmpty / totalObservations ───────────────
describe('FrequencyMap.size / isEmpty / totalObservations', () => {
  it('size returns unique key count', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    fm.add('b')
    fm.add('a')
    expect(fm.size).toBe(2)
  })

  it('isEmpty reflects state', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.isEmpty).toBe(true)
    fm.add('a')
    expect(fm.isEmpty).toBe(false)
  })

  it('totalObservations sums all counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 7)
    expect(fm.totalObservations).toBe(10)
  })
})

// ─── clear ────────────────────────────────────────────
describe('FrequencyMap.clear', () => {
  it('clears all data', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 5)
    fm.clear()
    expect(fm.isEmpty).toBe(true)
    expect(fm.totalObservations).toBe(0)
    expect(fm.maxCount).toBe(0)
    expect(fm.maxKey).toBeUndefined()
  })
})

// ─── keys / values / entries ──────────────────────────
describe('FrequencyMap.keys / values / entries', () => {
  it('keys returns all unique keys', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    fm.add('b')
    expect(fm.keys()).toContain('a')
    expect(fm.keys()).toContain('b')
  })

  it('values returns all counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 7)
    expect(fm.values()).toContain(3)
    expect(fm.values()).toContain(7)
  })

  it('entries returns key-count pairs', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    const entries = fm.entries()
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual({ key: 'a', count: 3 })
  })
})

// ─── forEach ──────────────────────────────────────────
describe('FrequencyMap.forEach', () => {
  it('iterates all entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 2)
    fm.add('b', 3)
    const result: Array<[string, number]> = []
    fm.forEach((key, count) => result.push([key, count]))
    expect(result).toHaveLength(2)
  })
})

// ─── top / bottom ─────────────────────────────────────
describe('FrequencyMap.top / bottom', () => {
  it('top returns highest counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 5)
    fm.add('c', 3)
    const top = fm.top(2)
    expect(top).toHaveLength(2)
    expect(top[0]!.count).toBe(5)
    expect(top[1]!.count).toBe(3)
  })

  it('bottom returns lowest counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 5)
    fm.add('c', 3)
    const bottom = fm.bottom(2)
    expect(bottom).toHaveLength(2)
    expect(bottom[0]!.count).toBe(1)
    expect(bottom[1]!.count).toBe(3)
  })

  it('top clamps to available entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    expect(fm.top(10)).toHaveLength(1)
  })

  it('top returns empty for empty map', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.top(5)).toEqual([])
  })
})

// ─── above / below ────────────────────────────────────
describe('FrequencyMap.above / below', () => {
  it('above returns entries with count > threshold', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 2)
    fm.add('b', 5)
    fm.add('c', 1)
    const above = fm.above(2)
    expect(above).toHaveLength(1)
    expect(above[0]!.key).toBe('b')
  })

  it('below returns entries with count < threshold', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 2)
    fm.add('b', 5)
    fm.add('c', 1)
    const below = fm.below(3)
    expect(below).toHaveLength(2)
  })

  it('above returns empty for empty map', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.above(0)).toEqual([])
  })
})

// ─── merge ────────────────────────────────────────────
describe('FrequencyMap.merge', () => {
  it('merges another FrequencyMap', () => {
    const fm1 = new FrequencyMap<string>()
    fm1.add('a', 3)
    const fm2 = new FrequencyMap<string>()
    fm2.add('a', 2)
    fm2.add('b', 1)
    fm1.merge(fm2)
    expect(fm1.get('a')).toBe(5)
    expect(fm1.get('b')).toBe(1)
  })
})

// ─── clone ────────────────────────────────────────────
describe('FrequencyMap.clone', () => {
  it('creates independent copy', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    const copy = fm.clone()
    copy.add('a', 2)
    expect(fm.get('a')).toBe(3)
    expect(copy.get('a')).toBe(5)
  })
})

// ─── toArray ──────────────────────────────────────────
describe('FrequencyMap.toArray', () => {
  it('returns entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 2)
    expect(fm.toArray()).toEqual([{ key: 'a', count: 2 }])
  })
})

// ─── getStatistics ────────────────────────────────────
describe('FrequencyMap.getStatistics', () => {
  it('returns zeros for empty map', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.getStatistics()).toEqual({
      uniqueKeys: 0,
      totalObservations: 0,
      maxCount: 0,
      minCount: 0,
      topKey: undefined,
    })
  })

  it('returns correct stats', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 1)
    fm.add('c', 5)
    const stats = fm.getStatistics()
    expect(stats.uniqueKeys).toBe(3)
    expect(stats.totalObservations).toBe(9)
    expect(stats.maxCount).toBe(5)
    expect(stats.minCount).toBe(1)
    expect(stats.topKey).toBe('c')
  })
})
