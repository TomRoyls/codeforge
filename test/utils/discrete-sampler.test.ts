import { describe, it, expect, vi } from 'vitest'
import { DiscreteSampler } from '../../src/utils/discrete-sampler.js'

describe('DiscreteSampler', () => {
  it('constructor creates sampler with uniform weights', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    expect(sampler).toBeDefined()
  })

  it('constructor creates sampler with non-uniform weights', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    expect(sampler).toBeDefined()
  })

  it('sample returns valid index for uniform weights', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const index = sampler.sample()
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(3)
  })

  it('sample returns valid index for non-uniform weights', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const index = sampler.sample()
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(3)
  })

  it('sampleN returns array of correct length', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(10)
    expect(samples.length).toBe(10)
  })

  it('sampleN returns valid indices for all samples', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('sample distribution respects weights approximately', () => {
    const sampler = new DiscreteSampler([1, 9])
    const samples = sampler.sampleN(1000)
    const count0 = samples.filter(x => x === 0).length
    const count1 = samples.filter(x => x === 1).length
    expect(count0).toBeLessThan(count1)
  })

  it('handles single element weights', () => {
    const sampler = new DiscreteSampler([1])
    const sample = sampler.sample()
    expect(sample).toBe(0)
  })

  it('handles single element with sampleN', () => {
    const sampler = new DiscreteSampler([1])
    const samples = sampler.sampleN(10)
    expect(samples.every(x => x === 0)).toBe(true)
  })

  it('handles zero total weights without throwing', () => {
    expect(() => new DiscreteSampler([0, 0, 0])).not.toThrow()
  })

  it('sample with zero total weights returns valid index', () => {
    const sampler = new DiscreteSampler([0, 0, 0])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
  })

  it('sampleN with zero count returns empty array', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(0)
    expect(samples.length).toBe(0)
  })

  it('sampleN with large count performs efficiently', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const start = Date.now()
    sampler.sampleN(10000)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })

  it('sample with custom RNG through Math.random replacement', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.5)
    const sampler = new DiscreteSampler([1, 1, 1])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
    randomSpy.mockRestore()
  })

  it('handles very large weight differences', () => {
    const sampler = new DiscreteSampler([1, 1000000])
    const samples = sampler.sampleN(100)
    const count1 = samples.filter(x => x === 1).length
    expect(count1).toBeGreaterThan(80)
  })

  it('handles many samples without memory issues', () => {
    const sampler = new DiscreteSampler([1, 1, 1, 1, 1])
    const samples = sampler.sampleN(10000)
    expect(samples.length).toBe(10000)
  })

  it('all equal weights distribute roughly evenly', () => {
    const sampler = new DiscreteSampler([1, 1, 1, 1])
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < 4000; i++) {
      const s = sampler.sample()
      counts[s]!++
    }
    for (const c of counts) {
      expect(c).toBeGreaterThan(500)
    }
  })

  it('handles single item', () => {
    const sampler = new DiscreteSampler([1], [10])
    const result = sampler.sample()
    expect(result).toBe(0)
  })

  it('sample with equal weights', () => {
    const sampler = new DiscreteSampler([0, 1], [1, 1])
    const result = sampler.sample()
    expect(result === 0 || result === 1).toBe(true)
  })

  it('sample always returns valid index', () => {
    const sampler = new DiscreteSampler([1])
    for (let i = 0; i < 10; i++) {
      expect(sampler.sample()).toBe(0)
    }
  })
})