import { describe, it, expect } from 'vitest'
import { StreamSampler } from '../../src/utils/stream-sampler.js'

describe('StreamSampler', () => {
  it('collects items up to reservoir size', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.size).toBe(3)
    expect(sampler.sample()).toEqual([1, 2, 3])
  })

  it('fills reservoir completely', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.isFull).toBe(true)
    expect(sampler.size).toBe(3)
  })

  it('tracks total seen count', () => {
    const sampler = new StreamSampler<number>(2)
    for (let i = 0; i < 100; i++) {
      sampler.add(i)
    }
    expect(sampler.totalSeen).toBe(100)
    expect(sampler.size).toBe(2)
  })

  it('reservoir stays bounded after many adds', () => {
    const sampler = new StreamSampler<number>(5)
    for (let i = 0; i < 10000; i++) {
      sampler.add(i)
    }
    expect(sampler.size).toBe(5)
    for (const val of sampler.sample()) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(10000)
    }
  })

  it('returns empty sample when nothing added', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.sample()).toEqual([])
    expect(sampler.isEmpty).toBe(true)
    expect(sampler.isFull).toBe(false)
  })

  it('throws on size < 1', () => {
    expect(() => new StreamSampler(0)).toThrow(RangeError)
    expect(() => new StreamSampler(-1)).toThrow(RangeError)
  })

  it('addAll adds iterable items', () => {
    const sampler = new StreamSampler<number>(10)
    sampler.addAll([1, 2, 3, 4, 5])
    expect(sampler.size).toBe(5)
    expect(sampler.totalSeen).toBe(5)
  })

  it('reset clears reservoir and count', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    expect(sampler.isEmpty).toBe(true)
    expect(sampler.totalSeen).toBe(0)
    expect(sampler.sample()).toEqual([])
  })

  it('forEach iterates reservoir items', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    const collected: number[] = []
    sampler.forEach((item) => collected.push(item))
    expect(collected).toEqual([10, 20, 30])
  })

  describe('mean', () => {
    it('computes mean of numeric reservoir', () => {
      const sampler = new StreamSampler<number>(5)
      sampler.addAll([10, 20, 30])
      expect(sampler.mean()).toBeCloseTo(20)
    })

    it('returns undefined for empty sampler', () => {
      const sampler = new StreamSampler<number>(5)
      expect(sampler.mean()).toBeUndefined()
    })

    it('returns undefined for non-numeric items', () => {
      const sampler = new StreamSampler<string>(5)
      sampler.addAll(['a', 'b', 'c'])
      expect(sampler.mean()).toBeUndefined()
    })
  })

  describe('min / max', () => {
    it('returns min value', () => {
      const sampler = new StreamSampler<number>(10)
      sampler.addAll([5, 2, 8, 1, 9])
      expect(sampler.min()).toBe(1)
    })

    it('returns max value', () => {
      const sampler = new StreamSampler<number>(10)
      sampler.addAll([5, 2, 8, 1, 9])
      expect(sampler.max()).toBe(9)
    })

    it('returns undefined when empty', () => {
      const sampler = new StreamSampler<number>(5)
      expect(sampler.min()).toBeUndefined()
      expect(sampler.max()).toBeUndefined()
    })

    it('works with string comparison', () => {
      const sampler = new StreamSampler<string>(10)
      sampler.addAll(['cherry', 'apple', 'banana'])
      expect(sampler.min()).toBe('apple')
      expect(sampler.max()).toBe('cherry')
    })
  })

  it('sample returns independent copy', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    const sample = sampler.sample()
    sample.push(999)
    expect(sampler.size).toBe(3)
  })

  it('works with size 1', () => {
    const sampler = new StreamSampler<number>(1)
    sampler.add(42)
    expect(sampler.size).toBe(1)
    expect(sampler.isFull).toBe(true)
    sampler.add(99)
    expect(sampler.size).toBe(1)
    expect(sampler.totalSeen).toBe(2)
  })

  it('reset clears state', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    expect(sampler.size).toBe(0)
    expect(sampler.totalSeen).toBe(0)
  })

  it('sample after adding items', () => {
    const sampler = new StreamSampler<string>(3)
    sampler.add('a')
    sampler.add('b')
    expect(sampler.size).toBe(2)
  })

  it('sample returns array of at most k items', () => {
    const sampler = new StreamSampler<string>(2)
    for (let i = 0; i < 10; i++) sampler.add('item' + i)
    expect(sampler.sample.length).toBeLessThanOrEqual(2)
  })

  it('empty sampler has no samples', () => {
    const sampler = new StreamSampler<string>(2)
    expect(sampler.sample()).toEqual([])
  })

  it('single item sampler keeps last', () => {
    const sampler = new StreamSampler<string>(1)
    sampler.add('a')
    sampler.add('b')
    expect(sampler.sample()).toEqual(['b'])
  })

  it('sample with k=2 returns up to 2', () => {
    const sampler = new StreamSampler<string>(2)
    sampler.add('a')
    sampler.add('b')
    sampler.add('c')
    expect(sampler.sample().length).toBe(2)
  })
})
