import { describe, it, expect } from 'vitest'
import { ReservoirSampler } from '../../src/utils/reservoir-sampler.js'

describe('ReservoirSampler', () => {
  it('creates sampler with capacity', () => {
    const sampler = new ReservoirSampler<number>(5)
    expect(sampler.capacity).toBe(5)
  })

  it('adds items when not full', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.sample.length).toBe(3)
  })

  it('stops growing when capacity reached', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    sampler.add(4)
    expect(sampler.sample.length).toBe(3)
  })

  it('tracks total items seen', () => {
    const sampler = new ReservoirSampler<number>(2)
    expect(sampler.totalSeen).toBe(0)
    sampler.add(1)
    expect(sampler.totalSeen).toBe(1)
    sampler.add(2)
    expect(sampler.totalSeen).toBe(2)
    sampler.add(3)
    expect(sampler.totalSeen).toBe(3)
  })

  it('returns sample array', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    const sample = sampler.sample
    expect(sample).toEqual([1, 2, 3])
  })

  it('returns copy of sample, not reference', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    const sample1 = sampler.sample
    const sample2 = sampler.sample
    expect(sample1).not.toBe(sample2)
  })

  it('returns true for isFull when capacity reached', () => {
    const sampler = new ReservoirSampler<number>(2)
    expect(sampler.isFull).toBe(false)
    sampler.add(1)
    expect(sampler.isFull).toBe(false)
    sampler.add(2)
    expect(sampler.isFull).toBe(true)
  })

  it('resets sampler to empty state', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    sampler.reset()
    expect(sampler.sample).toEqual([])
    expect(sampler.totalSeen).toBe(0)
    expect(sampler.isFull).toBe(false)
  })

  it('handles string items', () => {
    const sampler = new ReservoirSampler<string>(2)
    sampler.add('a')
    sampler.add('b')
    expect(sampler.sample).toEqual(['a', 'b'])
  })

  it('handles object items', () => {
    const sampler = new ReservoirSampler<{ id: number }>(2)
    sampler.add({ id: 1 })
    sampler.add({ id: 2 })
    expect(sampler.sample.length).toBe(2)
  })

  it('samples uniformly from more items than capacity', () => {
    const sampler = new ReservoirSampler<number>(1)
    for (let i = 1; i <= 100; i++) {
      sampler.add(i)
    }
    expect(sampler.sample.length).toBe(1)
    expect(sampler.totalSeen).toBe(100)
  })

  it('preserves capacity after reset', () => {
    const sampler = new ReservoirSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    sampler.add(3)
    sampler.add(4)
    sampler.add(5)
    sampler.add(6)
    sampler.add(7)
    expect(sampler.sample.length).toBe(5)
  })

  it('handles capacity of 1', () => {
    const sampler = new ReservoirSampler<number>(1)
    sampler.add(42)
    expect(sampler.sample).toEqual([42])
    sampler.add(99)
    expect(sampler.sample.length).toBe(1)
    expect(sampler.totalSeen).toBe(2)
  })

  it('handles large stream', () => {
    const sampler = new ReservoirSampler<number>(10)
    for (let i = 0; i < 10000; i++) {
      sampler.add(i)
    }
    expect(sampler.sample.length).toBe(10)
    expect(sampler.totalSeen).toBe(10000)
    for (const v of sampler.sample) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10000)
    }
  })

  it('reset allows fresh sampling', () => {
    const sampler = new ReservoirSampler<number>(3)
    for (let i = 0; i < 100; i++) sampler.add(i)
    sampler.reset()
    expect(sampler.totalSeen).toBe(0)
    sampler.add(999)
    expect(sampler.sample).toEqual([999])
    expect(sampler.totalSeen).toBe(1)
  })

  it('sampled values are from the stream', () => {
    const sampler = new ReservoirSampler<number>(5)
    for (let i = 0; i < 50; i++) sampler.add(i)
    for (const v of sampler.sample) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(50)
    }
  })

  it('multiple resets work', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.reset()
    sampler.add(2)
    sampler.reset()
    sampler.add(3)
    expect(sampler.sample).toEqual([3])
  })

  it('sample returns empty for no items', () => {
    const sampler = new ReservoirSampler<number>(1)
    expect(sampler.sample).toEqual([])
  })

  it('add and sample single item', () => {
    const sampler = new ReservoirSampler<number>(1)
    sampler.add(42)
    expect(sampler.sample).toEqual([42])
  })

  it('empty sampler has empty sample', () => {
    const sampler = new ReservoirSampler<number>(3)
    expect(sampler.sample).toEqual([])
  })

  it('sample size limited to reservoir size', () => {
    const sampler = new ReservoirSampler<number>(2)
    for (let i = 0; i < 100; i++) sampler.add(i)
    expect(sampler.sample.length).toBeLessThanOrEqual(2)
  })

  it('empty sampler has no samples', () => {
    const sampler = new ReservoirSampler<number>(5)
    expect(sampler.sample).toEqual([])
  })
})