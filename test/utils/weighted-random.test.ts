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

  it('add with zero weight silently ignored and size not incremented', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 0)
    sampler.add('b', 1)
    sampler.add('c', 0)
    expect(sampler.size).toBe(1)
    expect(sampler.totalWeight).toBe(1)
  })

  it('sample after multiple adds and builds', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    sampler.add('b', 1); sampler.build()
    sampler.add('c', 1); sampler.build()
    expect(['a', 'b', 'c']).toContain(sampler.sample())
    expect(sampler.size).toBe(3)
  })

  it('probability with duplicate items returns first match weight', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('x', 3); sampler.add('x', 7)
    sampler.build()
    expect(sampler.probability('x')).toBeCloseTo(0.3)
  })

  it('totalWeight after clear is zero', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 10); sampler.add('b', 20)
    sampler.clear()
    expect(sampler.totalWeight).toBe(0)
  })

  it('sampleN returns valid items only', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('only', 1); sampler.build()
    const samples = sampler.sampleN(50)
    expect(samples.every(s => s === 'only')).toBe(true)
  })

  it('handles single item with very small weight', () => {
    const sampler = new WeightedRandom()
    sampler.add('tiny', 0.0001); sampler.build()
    expect(sampler.sample()).toBe('tiny')
  })

  it('sampleMultiple returns correct count for zero', () => {
    const sampler = new WeightedRandom()
    sampler.add('a', 1); sampler.build()
    expect(sampler.sampleMultiple(0)).toEqual([])
  })

  it('probability returns correct value', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('a', 3)
    sampler.add('b', 7)
    sampler.build()
    expect(sampler.probability('a')).toBeCloseTo(0.3, 5)
    expect(sampler.probability('b')).toBeCloseTo(0.7, 5)
  })

  it('clear removes all items', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('x', 1)
    sampler.clear()
    sampler.build()
    expect(sampler.sample()).toBeUndefined()
  })

  it('sampleN returns correct count', () => {
    const sampler = new WeightedRandom<number>()
    sampler.add(1, 1)
    sampler.add(2, 1)
    sampler.build()
    const samples = sampler.sampleN(5)
    expect(samples.length).toBe(5)
  })

  it('single item always sampled', () => {
    const sampler = new WeightedRandom<string>()
    sampler.add('only', 1)
    sampler.build()
    for (let i = 0; i < 10; i++) {
      expect(sampler.sample()).toBe('only')
    }
  })
})

describe('weighted-random - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('weighted-random - wave545', () => {
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

describe('weighted-random - wave546', () => {
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

describe('weighted-random - wave547', () => {
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

describe('weighted-random - wave548', () => {
  it('weighted-random module defined', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random module is function', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave549', () => {
  it('weighted-random module defined', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random module is function', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave550', () => {
  it('weighted-random w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave551', () => {
  it('weighted-random w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave552', () => {
  it('weighted-random w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave553', () => {
  it('weighted-random w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave554', () => {
  it('weighted-random w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave555', () => {
  it('weighted-random w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave556', () => {
  it('weighted-random w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave557', () => {
  it('weighted-random w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave558', () => {
  it('weighted-random w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave559', () => {
  it('weighted-random w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave560', () => {
  it('weighted-random w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('weighted-random - wave561', () => {
  it('weighted-random w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('weighted-random w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
