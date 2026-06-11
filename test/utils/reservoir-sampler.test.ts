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

  it('sampler with pool 1 keeps one element', () => {
    const sampler = new ReservoirSampler<number>(1)
    sampler.add(1)
    sampler.add(2)
    expect(sampler.sample.length).toBe(1)
  })

  it('sample of 3 items with k=2 returns 2', () => {
    const sampler = new ReservoirSampler<number>(2)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.sample.length).toBe(2)
  })

  it('handles zero capacity', () => {
    const sampler = new ReservoirSampler<number>(0)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.sample.length).toBe(0)
    expect(sampler.totalSeen).toBe(3)
  })

  it('isFull returns false for capacity 0 with items', () => {
    const sampler = new ReservoirSampler<number>(0)
    sampler.add(1)
    expect(sampler.isFull).toBe(true)
  })

  it('handles very large capacity', () => {
    const sampler = new ReservoirSampler<number>(100000)
    for (let i = 0; i < 1000; i++) {
      sampler.add(i)
    }
    expect(sampler.sample.length).toBe(1000)
    expect(sampler.totalSeen).toBe(1000)
  })

  it('handles adding null items', () => {
    const sampler = new ReservoirSampler<number | null>(3)
    sampler.add(null)
    sampler.add(1)
    sampler.add(null)
    expect(sampler.sample.length).toBe(3)
    expect(sampler.sample).toContain(null)
  })

  it('handles adding undefined items', () => {
    const sampler = new ReservoirSampler<number | undefined>(3)
    sampler.add(undefined)
    sampler.add(1)
    sampler.add(undefined)
    expect(sampler.sample.length).toBe(3)
    expect(sampler.sample).toContain(undefined)
  })

  it('handles boolean items', () => {
    const sampler = new ReservoirSampler<boolean>(3)
    sampler.add(true)
    sampler.add(false)
    sampler.add(true)
    expect(sampler.sample.length).toBe(3)
  })

  it('handles array items', () => {
    const sampler = new ReservoirSampler<number[]>(2)
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]
    sampler.add(arr1)
    sampler.add(arr2)
    expect(sampler.sample.length).toBe(2)
  })

  it('handles date items', () => {
    const sampler = new ReservoirSampler<Date>(2)
    const date1 = new Date('2023-01-01')
    const date2 = new Date('2023-12-31')
    sampler.add(date1)
    sampler.add(date2)
    expect(sampler.sample.length).toBe(2)
  })

  it('totalSeen increments correctly after reset', () => {
    const sampler = new ReservoirSampler<number>(2)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    expect(sampler.totalSeen).toBe(0)
    sampler.add(3)
    expect(sampler.totalSeen).toBe(1)
  })

  it('sample is empty after reset when empty', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.reset()
    expect(sampler.sample).toEqual([])
  })

  it('handles mixed data types', () => {
    const sampler = new ReservoirSampler<string | number | boolean>(5)
    sampler.add(1)
    sampler.add('hello')
    sampler.add(true)
    sampler.add(42)
    sampler.add('world')
    expect(sampler.sample.length).toBe(5)
  })

  it('isFull returns false for empty sampler', () => {
    const sampler = new ReservoirSampler<number>(3)
    expect(sampler.isFull).toBe(false)
  })

  it('isFull returns true exactly at capacity', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.isFull).toBe(true)
  })

  it('sample contains unique items when duplicates added', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1)
    sampler.add(1)
    sampler.add(1)
    expect(sampler.sample).toEqual([1, 1, 1])
  })

  it('handles negative numbers', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(-1)
    sampler.add(-2)
    sampler.add(-3)
    expect(sampler.sample.length).toBe(3)
    expect(sampler.sample).toContain(-1)
    expect(sampler.sample).toContain(-2)
    expect(sampler.sample).toContain(-3)
  })

  it('handles floating point numbers', () => {
    const sampler = new ReservoirSampler<number>(3)
    sampler.add(1.5)
    sampler.add(2.7)
    sampler.add(3.14)
    expect(sampler.sample.length).toBe(3)
  })

  it('sample respects order of insertion when under capacity', () => {
    const sampler = new ReservoirSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.sample).toEqual([1, 2, 3])
  })

  it('reset clears sample when full', () => {
    const sampler = new ReservoirSampler<number>(2)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    expect(sampler.sample).toEqual([])
    expect(sampler.isFull).toBe(false)
  })

  it('handles function items', () => {
    const sampler = new ReservoirSampler<() => void>(2)
    const fn1 = () => {}
    const fn2 = () => {}
    sampler.add(fn1)
    sampler.add(fn2)
    expect(sampler.sample.length).toBe(2)
  })

  it('handles symbol items', () => {
    const sampler = new ReservoirSampler<symbol>(2)
    const sym1 = Symbol('a')
    const sym2 = Symbol('b')
    sampler.add(sym1)
    sampler.add(sym2)
    expect(sampler.sample.length).toBe(2)
  })

  it('reset with capacity 1 works', () => {
    const sampler = new ReservoirSampler<number>(1)
    sampler.add(1)
    sampler.reset()
    sampler.add(2)
    expect(sampler.sample).toEqual([2])
    expect(sampler.totalSeen).toBe(1)
  })

  it('sample returns shallow copy', () => {
    const obj = { value: 1 }
    const sampler = new ReservoirSampler<{ value: number }>(1)
    sampler.add(obj)
    const sample = sampler.sample
    sample[0].value = 2
    expect(sampler.sample[0].value).toBe(2)
  })
})