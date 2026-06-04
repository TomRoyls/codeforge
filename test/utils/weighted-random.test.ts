import { describe, it, expect } from 'vitest'
import { WeightedRandom } from '../../src/utils/weighted-random.js'

describe('WeightedRandom', () => {
  it('throws when sampling empty sampler', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.build()
    sampler.clear()
    expect(() => sampler.sample()).toThrow()
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
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.build()

    const counts = { a: 0, b: 0 }
    for (let i = 0; i < 1000; i++) {
      const result = sampler.sample()
      counts[result as keyof typeof counts]++
    }

    expect(counts.a).toBeGreaterThan(400)
    expect(counts.b).toBeGreaterThan(400)
    expect(counts.a + counts.b).toBe(1000)
  })

  it('two items with unequal weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('heavy', 9)
    sampler.add('light', 1)
    sampler.build()

    const counts = { heavy: 0, light: 0 }
    for (let i = 0; i < 1000; i++) {
      const result = sampler.sample()
      counts[result as keyof typeof counts]++
    }

    expect(counts.heavy).toBeGreaterThan(850)
    expect(counts.light).toBeLessThan(150)
    expect(counts.heavy + counts.light).toBe(1000)
  })

  it('many items distribution check', () => {
    const sampler = new WeightedRandom()
    const items = Array.from({ length: 20 }, (_, i) => `item${i}`)
    items.forEach((item, i) => sampler.add(item, i + 1))
    sampler.build()

    const counts: Record<string, number> = {}
    items.forEach((item) => {
      counts[item] = 0
    })

    for (let i = 0; i < 10000; i++) {
      const result = sampler.sample()
      counts[result]++
    }

    for (let i = 0; i < 20; i++) {
      const item = `item${i}`
      const expectedProb = (i + 1) / 210
      const actualProb = counts[item]! / 10000
      expect(Math.abs(actualProb - expectedProb)).toBeLessThan(0.02)
    }
  })

  it('tracks size correctly', () => {
    const sampler = new WeightedRandom()
    expect(sampler.size).toBe(0)

    sampler.add('a', 1)
    expect(sampler.size).toBe(1)

    sampler.add('b', 2)
    sampler.add('c', 3)
    expect(sampler.size).toBe(3)

    sampler.build()
    expect(sampler.size).toBe(3)
  })

  it('tracks totalWeight correctly', () => {
    const sampler = new WeightedRandom()
    expect(sampler.totalWeight).toBe(0)

    sampler.add('a', 1)
    expect(sampler.totalWeight).toBe(1)

    sampler.add('b', 2)
    expect(sampler.totalWeight).toBe(3)

    sampler.add('c', 3)
    expect(sampler.totalWeight).toBe(6)

    sampler.build()
    expect(sampler.totalWeight).toBe(6)
  })

  it('probability returns correct values', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.add('b', 2)
    sampler.add('c', 3)
    sampler.build()

    expect(sampler.probability('a')).toBeCloseTo(1 / 6)
    expect(sampler.probability('b')).toBeCloseTo(2 / 6)
    expect(sampler.probability('c')).toBeCloseTo(3 / 6)
    expect(sampler.probability('d')).toBe(0)
  })

  it('clear resets everything', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.add('b', 2)
    sampler.build()

    sampler.clear()
    expect(sampler.size).toBe(0)
    expect(sampler.totalWeight).toBe(0)
  })

  it('build required before sample', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    expect(() => sampler.sample()).toThrow('Must call build() before sample()')
  })

  it('sampleMultiple returns correct count', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.build()

    const samples = sampler.sampleMultiple(100)
    expect(samples.length).toBe(100)
    samples.forEach((sample) => {
      expect(['a', 'b']).toContain(sample)
    })
  })

  it('zero weight throws', () => {
    const sampler = new WeightedRandom()
    expect(() => sampler.add('a', 0)).toThrow('Weight must be greater than 0')
    expect(() => sampler.add('b', -1)).toThrow('Weight must be greater than 0')
  })

  it('add after clear works', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.build()

    sampler.clear()
    sampler.add('b', 2)
    sampler.add('c', 3)
    sampler.build()

    expect(sampler.size).toBe(2)
    expect(sampler.totalWeight).toBe(5)
  })

  it('all same weight items equally likely', () => {
    const sampler = new WeightedRandom()
    const items = ['a', 'b', 'c', 'd', 'e']
    items.forEach((item) => sampler.add(item, 1))
    sampler.build()

    const counts: Record<string, number> = {}
    items.forEach((item) => {
      counts[item] = 0
    })

    for (let i = 0; i < 5000; i++) {
      const result = sampler.sample()
      counts[result]++
    }

    for (const item of items) {
      const expectedProb = 1 / 5
      const actualProb = counts[item]! / 5000
      expect(Math.abs(actualProb - expectedProb)).toBeLessThan(0.02)
    }
  })

  it('sampleMultiple returns correct distribution', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.add('b', 3)
    sampler.build()
    const samples = sampler.sampleMultiple(1000)
    const countA = samples.filter(s => s === 'a').length
    expect(countA).toBeGreaterThan(150)
    expect(countA).toBeLessThan(450)
  })

  it('handles very large weights', () => {
    const sampler = new WeightedRandom()
    sampler.add('big', 1000000)
    sampler.add('small', 1)
    sampler.build()
    let bigCount = 0
    for (let i = 0; i < 100; i++) {
      if (sampler.sample() === 'big') bigCount++
    }
    expect(bigCount).toBe(100)
  })

  it('sampleMultiple returns correct count', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.add('c', 1)
    sampler.build()
    const samples = sampler.sampleMultiple(3)
    expect(samples.length).toBe(3)
  })

  it('single item always samples that item', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('only', 1.0)
    sampler.build()
    expect(sampler.sample()).toBe('only')
  })

  it('sample returns one of added items', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.build()
    const result = sampler.sample()
    expect(['a', 'b']).toContain(result)
  })

  it('single item always returns it', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('only', 10)
    sampler.build()
    for (let i = 0; i < 5; i++) {
      expect(sampler.sample()).toBe('only')
    }
  })

  it('single weighted item always sampled', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('x', 10)
    sampler.build()
    expect(sampler.sample()).toBe('x')
  })

  it('sample with multiple items returns one', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.build()
    const result = sampler.sample()
    expect(['a', 'b']).toContain(result)
  })

  it('sample from single item returns that item', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('only', 10)
    sampler.build()
    expect(sampler.sample()).toBe('only')
  })

  it('sample with equal weights', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('a', 1)
    sampler.add('b', 1)
    sampler.build()
    const result = sampler.sample()
    expect(['a', 'b']).toContain(result)
  })
})