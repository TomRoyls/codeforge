import { describe, it, expect } from 'vitest'
import { FrequencyMap } from '../../src/utils/frequency-map.js'

// ─── Add and Get ──────────────────────────────────────────
describe('FrequencyMap - add and get', () => {
  it('adds and retrieves counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    fm.add('a')
    fm.add('b')
    expect(fm.get('a')).toBe(2)
    expect(fm.get('b')).toBe(1)
    expect(fm.get('c')).toBe(0)
  })

  it('adds with custom count', () => {
    const fm = new FrequencyMap<string>()
    fm.add('x', 5)
    expect(fm.get('x')).toBe(5)
  })

  it('ignores non-positive counts', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 0)
    fm.add('a', -1)
    expect(fm.get('a')).toBe(0)
  })

  it('tracks total observations', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 2)
    expect(fm.totalObservations).toBe(5)
  })
})

// ─── Has and Size ─────────────────────────────────────────
describe('FrequencyMap - has and size', () => {
  it('has returns true for existing keys', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    expect(fm.has('a')).toBe(true)
    expect(fm.has('b')).toBe(false)
  })

  it('size returns unique key count', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.size).toBe(0)
    fm.add('a')
    fm.add('b')
    fm.add('a')
    expect(fm.size).toBe(2)
  })

  it('isEmpty returns true when empty', () => {
    const fm = new FrequencyMap<string>()
    expect(fm.isEmpty).toBe(true)
    fm.add('a')
    expect(fm.isEmpty).toBe(false)
  })
})

// ─── Remove and Decrease ──────────────────────────────────
describe('FrequencyMap - remove and decrease', () => {
  it('removes a key', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 5)
    expect(fm.remove('a')).toBe(true)
    expect(fm.get('a')).toBe(0)
    expect(fm.remove('a')).toBe(false)
  })

  it('decreases count', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 5)
    fm.decrease('a', 3)
    expect(fm.get('a')).toBe(2)
  })

  it('decrease removes key when count reaches 0', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.decrease('a', 3)
    expect(fm.has('a')).toBe(false)
  })
})

// ─── Max tracking ─────────────────────────────────────────
describe('FrequencyMap - max tracking', () => {
  it('tracks maxKey and maxCount', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 7)
    fm.add('c', 2)
    expect(fm.maxKey).toBe('b')
    expect(fm.maxCount).toBe(7)
  })

  it('recomputes max after removal', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 7)
    fm.remove('b')
    expect(fm.maxKey).toBe('a')
    expect(fm.maxCount).toBe(3)
  })
})

// ─── Top and Bottom ───────────────────────────────────────
describe('FrequencyMap - top and bottom', () => {
  it('returns top k entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 3)
    fm.add('c', 2)
    const top = fm.top(2)
    expect(top).toHaveLength(2)
    expect(top[0]!.key).toBe('b')
    expect(top[1]!.key).toBe('c')
  })

  it('returns bottom k entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 3)
    fm.add('c', 2)
    const bottom = fm.bottom(2)
    expect(bottom).toHaveLength(2)
    expect(bottom[0]!.key).toBe('a')
  })
})

// ─── Above and Below ──────────────────────────────────────
describe('FrequencyMap - above and below', () => {
  it('returns entries above threshold', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 5)
    fm.add('c', 3)
    const above = fm.above(2)
    expect(above).toHaveLength(2)
  })

  it('returns entries below threshold', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 5)
    fm.add('c', 3)
    const below = fm.below(3)
    expect(below).toHaveLength(1)
    expect(below[0]!.key).toBe('a')
  })
})

// ─── Iteration and Conversion ─────────────────────────────
describe('FrequencyMap - iteration', () => {
  it('returns keys', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a')
    fm.add('b')
    expect(fm.keys()).toContain('a')
    expect(fm.keys()).toContain('b')
  })

  it('returns values', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    fm.add('b', 5)
    expect(fm.values()).toContain(3)
    expect(fm.values()).toContain(5)
  })

  it('returns entries', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 3)
    const entries = fm.entries()
    expect(entries).toHaveLength(1)
    expect(entries[0]!.key).toBe('a')
    expect(entries[0]!.count).toBe(3)
  })

  it('forEach iterates', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 1)
    fm.add('b', 2)
    const result: [string, number][] = []
    fm.forEach((key, count) => result.push([key, count]))
    expect(result).toHaveLength(2)
  })
})

// ─── Merge, Clone, Clear ──────────────────────────────────
describe('FrequencyMap - merge, clone, clear', () => {
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

  it('clones independently', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 5)
    const copy = fm.clone()
    fm.add('a', 10)
    expect(copy.get('a')).toBe(5)
  })

  it('clears all data', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 5)
    fm.clear()
    expect(fm.size).toBe(0)
    expect(fm.totalObservations).toBe(0)
    expect(fm.maxCount).toBe(0)
  })
})

// ─── Statistics ───────────────────────────────────────────
describe('FrequencyMap - statistics', () => {
  it('returns correct statistics', () => {
    const fm = new FrequencyMap<string>()
    fm.add('a', 2)
    fm.add('b', 5)
    fm.add('c', 1)
    const stats = fm.getStatistics()
    expect(stats.uniqueKeys).toBe(3)
    expect(stats.totalObservations).toBe(8)
    expect(stats.maxCount).toBe(5)
    expect(stats.minCount).toBe(1)
    expect(stats.topKey).toBe('b')
  })

  it('returns zero stats for empty map', () => {
    const fm = new FrequencyMap<string>()
    const stats = fm.getStatistics()
    expect(stats.uniqueKeys).toBe(0)
    expect(stats.minCount).toBe(0)
  })
})
