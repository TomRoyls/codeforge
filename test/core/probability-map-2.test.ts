import { describe, it, expect } from 'vitest'
import { ProbabilityMap2 } from '../../src/core/probability-map-2/index.js'

// ─── set / get ───

describe('ProbabilityMap2 set and get', () => {
  it('sets and gets a single key', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    expect(pm.get('a')).toBe(1)
  })

  it('returns undefined for non-existing key', () => {
    const pm = new ProbabilityMap2()
    expect(pm.get('z')).toBeUndefined()
  })

  it('returns probability as fraction of total weight', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 30)
    pm.set('b', 70)
    expect(pm.get('a')).toBeCloseTo(0.3)
    expect(pm.get('b')).toBeCloseTo(0.7)
  })

  it('updates existing key and adjusts total', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    pm.set('b', 10)
    pm.set('a', 30)
    expect(pm.totalWeight()).toBe(40)
    expect(pm.get('a')).toBeCloseTo(0.75)
  })

  it('returns undefined when total weight is zero', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 0)
    expect(pm.get('a')).toBeUndefined()
  })
})

// ─── getWeight ───

describe('ProbabilityMap2 getWeight', () => {
  it('returns raw weight for key', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 42)
    expect(pm.getWeight('a')).toBe(42)
  })

  it('returns undefined for non-existing key', () => {
    const pm = new ProbabilityMap2()
    expect(pm.getWeight('z')).toBeUndefined()
  })
})

// ─── has ───

describe('ProbabilityMap2 has', () => {
  it('returns false for non-existing key', () => {
    const pm = new ProbabilityMap2()
    expect(pm.has('a')).toBe(false)
  })

  it('returns true for existing key', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    expect(pm.has('a')).toBe(true)
  })

  it('returns true even if weight is zero', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 0)
    expect(pm.has('a')).toBe(true)
  })
})

// ─── delete ───

describe('ProbabilityMap2 delete', () => {
  it('deletes existing key and returns true', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    expect(pm.delete('a')).toBe(true)
    expect(pm.has('a')).toBe(false)
  })

  it('returns false for non-existing key', () => {
    const pm = new ProbabilityMap2()
    expect(pm.delete('z')).toBe(false)
  })

  it('adjusts total weight on delete', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 30)
    pm.set('b', 70)
    pm.delete('a')
    expect(pm.totalWeight()).toBe(70)
    expect(pm.get('b')).toBe(1)
  })
})

// ─── sample ───

describe('ProbabilityMap2 sample', () => {
  it('returns undefined for empty map', () => {
    const pm = new ProbabilityMap2()
    expect(pm.sample()).toBeUndefined()
  })

  it('returns one of the keys', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 50)
    pm.set('b', 50)
    const result = pm.sample()
    expect(result === 'a' || result === 'b').toBe(true)
  })

  it('returns the only key for single-entry map', () => {
    const pm = new ProbabilityMap2()
    pm.set('only', 100)
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      results.add(pm.sample()!)
    }
    expect(results.has('only')).toBe(true)
  })

  it('sample distribution is biased by weight', () => {
    const pm = new ProbabilityMap2()
    pm.set('heavy', 99)
    pm.set('light', 1)
    let heavyCount = 0
    for (let i = 0; i < 1000; i++) {
      if (pm.sample() === 'heavy') heavyCount++
    }
    expect(heavyCount).toBeGreaterThan(800)
  })
})

// ─── size ───

describe('ProbabilityMap2 size', () => {
  it('returns 0 for empty map', () => {
    const pm = new ProbabilityMap2()
    expect(pm.size).toBe(0)
  })

  it('returns correct count', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 1)
    pm.set('b', 2)
    pm.set('c', 3)
    expect(pm.size).toBe(3)
  })
})

// ─── totalWeight ───

describe('ProbabilityMap2 totalWeight', () => {
  it('returns 0 for empty map', () => {
    const pm = new ProbabilityMap2()
    expect(pm.totalWeight()).toBe(0)
  })

  it('sums all weights', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    pm.set('b', 20)
    pm.set('c', 30)
    expect(pm.totalWeight()).toBe(60)
  })

  it('handles zero weights', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 0)
    pm.set('b', 10)
    expect(pm.totalWeight()).toBe(10)
  })

  it('handles negative weights', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    pm.set('b', -3)
    expect(pm.totalWeight()).toBe(7)
  })
})

// ─── keys ───

describe('ProbabilityMap2 keys', () => {
  it('returns empty array for empty map', () => {
    const pm = new ProbabilityMap2()
    expect(pm.keys()).toEqual([])
  })

  it('returns all keys', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 1)
    pm.set('b', 2)
    const keys = pm.keys()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toHaveLength(2)
  })
})

// ─── entries ───

describe('ProbabilityMap2 entries', () => {
  it('returns empty array for empty map', () => {
    const pm = new ProbabilityMap2()
    expect(pm.entries()).toEqual([])
  })

  it('returns entries with weight and probability', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 30)
    pm.set('b', 70)
    const entries = pm.entries()
    expect(entries).toHaveLength(2)
    const aEntry = entries.find((e) => e[0] === 'a')
    const bEntry = entries.find((e) => e[0] === 'b')
    expect(aEntry![1].weight).toBe(30)
    expect(aEntry![1].probability).toBeCloseTo(0.3)
    expect(bEntry![1].weight).toBe(70)
    expect(bEntry![1].probability).toBeCloseTo(0.7)
  })
})

// ─── clear ───

describe('ProbabilityMap2 clear', () => {
  it('clears all entries', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 10)
    pm.set('b', 20)
    pm.clear()
    expect(pm.size).toBe(0)
    expect(pm.totalWeight()).toBe(0)
    expect(pm.keys()).toEqual([])
  })
})

// ─── normalize ───

describe('ProbabilityMap2 normalize', () => {
  it('normalizes weights so total is 1', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 30)
    pm.set('b', 70)
    pm.normalize()
    expect(pm.totalWeight()).toBeCloseTo(1)
    expect(pm.getWeight('a')).toBeCloseTo(0.3)
    expect(pm.getWeight('b')).toBeCloseTo(0.7)
  })

  it('does nothing on empty map', () => {
    const pm = new ProbabilityMap2()
    pm.normalize()
    expect(pm.totalWeight()).toBe(0)
    expect(pm.size).toBe(0)
  })

  it('preserves probability ratios after normalization', () => {
    const pm = new ProbabilityMap2()
    pm.set('a', 1)
    pm.set('b', 3)
    pm.normalize()
    expect(pm.get('a')).toBeCloseTo(0.25)
    expect(pm.get('b')).toBeCloseTo(0.75)
  })
})
