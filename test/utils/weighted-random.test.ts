import { describe, it, expect } from 'vitest'
import { WeightedRandom } from '../../src/utils/weighted-random.js'

describe('WeightedRandom', () => {
  it('returns undefined when sampling empty', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.build()
    sampler.clear()
    expect(sampler.sample()).toBeUndefined()
  })

  it('single item always sampled', () => {
    const sampler = new WeightedRandom()
    sampler.add('only', 10)
    sampler.build()
    for (let i = 0; i < 100; i++) {
      expect(sampler.sample()).toBe('only')
    }
  })

  it('two items with equal weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 1)
    sampler.build()
    const counts = { a: 0, b: 0 }
    for (let i = 0; i < 1000; i++) counts[sampler.sample() as string]++
    expect(counts.a).toBeGreaterThan(400)
    expect(counts.b).toBeGreaterThan(400)
  })

  it('two items with unequal weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('heavy', 9); sampler.add('light', 1)
    sampler.build()
    const counts = { heavy: 0, light: 0 }
    for (let i = 0; i < 1000; i++) counts[sampler.sample() as string]++
    expect(counts.heavy).toBeGreaterThan(850)
    expect(counts.light).toBeLessThan(150)
  })

  it('many items distribution check', () => {
    const sampler = new WeightedRandom()
    const items = Array.from({ length: 20 }, (_, i) => `item${i}`)
    items.forEach((item, i) => sampler.add(item, i + 1))
    sampler.build()
    const counts: Record<string, number> = {}
    items.forEach(item => counts[item] = 0)
    for (let i = 0; i < 10000; i++) counts[sampler.sample()!]!++
    for (let i = 0; i < 20; i++) {
      const expectedProb = (i + 1) / 210
      expect(Math.abs(counts[`item${i}`]! / 10000 - expectedProb)).toBeLessThan(0.02)
    }
  })

  it('tracks size correctly', () => {
    const sampler = new WeightedRandom()
    expect(sampler.size).toBe(0)
    sampler.add('a', 1)
    expect(sampler.size).toBe(1)
    sampler.add('b', 2); sampler.add('c', 3)
    expect(sampler.size).toBe(3)
  })

  it('tracks totalWeight correctly', () => {
    const sampler = new WeightedRandom()
    expect(sampler.totalWeight).toBe(0)
    sampler.add('a', 1); expect(sampler.totalWeight).toBe(1)
    sampler.add('b', 2); expect(sampler.totalWeight).toBe(3)
    sampler.add('c', 3); expect(sampler.totalWeight).toBe(6)
  })

  it('probability returns correct values', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 2); sampler.add('c', 3)
    sampler.build()
    expect(sampler.probability('a')).toBeCloseTo(1 / 6)
    expect(sampler.probability('b')).toBeCloseTo(2 / 6)
    expect(sampler.probability('c')).toBeCloseTo(3 / 6)
    expect(sampler.probability('d')).toBe(0)
  })

  it('clear resets everything', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 2)
    sampler.build()
    sampler.clear()
    expect(sampler.size).toBe(0)
    expect(sampler.totalWeight).toBe(0)
  })

  it('auto-builds before sample when not built', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    expect(sampler.sample()).toBe('a')
  })

  it('sampleMultiple returns correct count', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 1)
    sampler.build()
    const samples = sampler.sampleMultiple(100)
    expect(samples.length).toBe(100)
    samples.forEach(s => expect(['a', 'b']).toContain(s))
  })

  it('zero weight is silently ignored', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 0); sampler.add('b', -1)
    expect(sampler.size).toBe(0)
  })

  it('add after clear works', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    sampler.clear()
    sampler.add('b', 2); sampler.add('c', 3)
    sampler.build()
    expect(sampler.size).toBe(2)
    expect(sampler.totalWeight).toBe(5)
  })

  it('all same weight items equally likely', () => {
    const sampler = new WeightedRandom()
    const items = ['a', 'b', 'c', 'd', 'e']
    items.forEach(item => sampler.add(item, 1))
    sampler.build()
    const counts: Record<string, number> = {}
    items.forEach(item => counts[item] = 0)
    for (let i = 0; i < 5000; i++) counts[sampler.sample()!]!++
    for (const item of items) {
      expect(Math.abs(counts[item]! / 5000 - 0.2)).toBeLessThan(0.02)
    }
  })

  it('handles very large weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('big', 1000000); sampler.add('small', 1)
    sampler.build()
    let bigCount = 0
    for (let i = 0; i < 100; i++) if (sampler.sample() === 'big') bigCount++
    expect(bigCount).toBe(100)
  })

  it('total is alias for totalWeight', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 3); sampler.add('b', 7)
    expect(sampler.total).toBe(sampler.totalWeight)
    expect(sampler.total).toBe(10)
  })

  it('probability on empty sampler returns 0', () => {
    expect(new WeightedRandom().probability('a')).toBe(0)
  })

  it('probability auto-builds', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    expect(sampler.probability('a')).toBeCloseTo(1)
  })

  it('sampleN returns empty for zero count', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    expect(sampler.sampleN(0)).toEqual([])
  })

  it('sampleMultiple is alias for sampleN', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    expect(sampler.sampleMultiple(5).length).toBe(5)
  })

  it('handles fractional weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 0.5); sampler.add('b', 0.5)
    sampler.build()
    expect(sampler.totalWeight).toBeCloseTo(1.0)
    expect(sampler.probability('a')).toBeCloseTo(0.5)
  })

  it('handles very small weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 0.001); sampler.add('b', 0.001)
    sampler.build()
    expect(sampler.sample()).toBeDefined()
  })

  it('probability for missing item returns 0', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 5); sampler.build()
    expect(sampler.probability('z')).toBe(0)
  })

  it('clear then add then sample works', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    sampler.clear()
    sampler.add('b', 10); sampler.build()
    expect(sampler.sample()).toBe('b')
  })

  it('three items distribution check', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 2); sampler.add('c', 3)
    sampler.build()
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
    for (let i = 0; i < 6000; i++) counts[sampler.sample() as string]++
    expect(counts.a).toBeGreaterThan(700)
    expect(counts.b).toBeGreaterThan(1400)
    expect(counts.c).toBeGreaterThan(2100)
  })

  it('numerical items work', () => {
    const sampler = new WeightedRandom<number>()
    sampler.add(1, 1); sampler.add(2, 1)
    sampler.build()
    const result = sampler.sample()
    expect([1, 2]).toContain(result)
  })

  it('rebuild after adding new item', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    sampler.add('b', 1); sampler.build()
    expect(sampler.size).toBe(2)
    const result = sampler.sample()
    expect(['a', 'b']).toContain(result)
  })

  it('sampleN with large count', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    const samples = sampler.sampleN(1000)
    expect(samples.length).toBe(1000)
    expect(samples.every(s => s === 'a')).toBe(true)
  })

  it('build does not throw for single item', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    expect(() => sampler.build()).not.toThrow()
  })

  it('sample returns one of added items', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('a', 1); sampler.add('b', 1)
    sampler.build()
    expect(['a', 'b']).toContain(sampler.sample())
  })

  it('handles weight of 1 for many items', () => {
    const sampler = new WeightedRandom()
    for (let i = 0; i < 100; i++) sampler.add(i, 1)
    sampler.build()
    expect(sampler.size).toBe(100)
    expect(sampler.totalWeight).toBe(100)
    expect(sampler.sample()).toBeDefined()
  })

  it('probability sums to approximately 1', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 2); sampler.add('b', 3); sampler.add('c', 5)
    sampler.build()
    const total = sampler.probability('a') + sampler.probability('b') + sampler.probability('c')
    expect(total).toBeCloseTo(1.0)
  })

  it('sampleMultiple distribution check', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 3)
    sampler.build()
    const samples = sampler.sampleMultiple(1000)
    const countA = samples.filter(s => s === 'a').length
    expect(countA).toBeGreaterThan(150)
    expect(countA).toBeLessThan(450)
  })

  it('negative weight is ignored', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', -5)
    expect(sampler.size).toBe(0)
    expect(sampler.totalWeight).toBe(0)
  })

  it('clear allows fresh start', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 100); sampler.build()
    sampler.clear()
    expect(sampler.size).toBe(0)
    sampler.add('b', 1); sampler.build()
    expect(sampler.sample()).toBe('b')
  })

  it('handles large number of items', () => {
    const sampler = new WeightedRandom()
    for (let i = 0; i < 1000; i++) sampler.add(i, 1)
    sampler.build()
    const result = sampler.sample()
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThan(1000)
  })

  it('object items work', () => {
    const sampler = new WeightedRandom<{ id: number }>()
    sampler.add({ id: 1 }, 1); sampler.add({ id: 2 }, 1)
    sampler.build()
    const result = sampler.sample()
    expect(result).toBeDefined()
    expect([1, 2]).toContain(result!.id)
  })

  it('build throws for empty sampler', () => {
    const sampler = new WeightedRandom()
    expect(() => sampler.build()).toThrow()
  })

  it('adding multiple items with same value', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('duplicate', 2); sampler.add('duplicate', 3)
    expect(sampler.size).toBe(2)
    expect(sampler.totalWeight).toBe(5)
    sampler.build()
    const result = sampler.sample()
    expect(result).toBe('duplicate')
  })

  it('distribution with very skewed weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('rare', 1); sampler.add('common', 999)
    sampler.build()
    let rareCount = 0
    for (let i = 0; i < 1000; i++) {
      if (sampler.sample() === 'rare') rareCount++
    }
    expect(rareCount).toBeLessThan(50)
  })

  it('clear followed by build throws', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    sampler.clear()
    expect(() => sampler.build()).toThrow()
  })

  it('multiple builds without modification work correctly', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.add('b', 2)
    sampler.build()
    sampler.build()
    sampler.build()
    expect(sampler.probability('a')).toBeCloseTo(1/3)
    expect(sampler.probability('b')).toBeCloseTo(2/3)
  })

  it('handles weight very close to zero', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', Number.MIN_VALUE); sampler.add('b', 1)
    sampler.build()
    expect(sampler.size).toBe(2)
    const result = sampler.sample()
    expect(['a', 'b']).toContain(result)
  })

  it('sampleN with negative count returns empty array', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    const result = sampler.sampleN(-5)
    expect(result).toEqual([])
  })
})
