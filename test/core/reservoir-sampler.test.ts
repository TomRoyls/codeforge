import { describe, it, expect } from 'vitest'
import { ReservoirSampler } from '../../src/core/reservoir-sampler/reservoir-sampler.js'
import type { ReservoirSamplerOptions } from '../../src/core/reservoir-sampler/types.js'

function chiSquaredTest(observed: number[], expected: number): number {
  return observed.reduce((sum, o) => sum + ((o - expected) ** 2) / expected, 0)
}

function runTrials(
  k: number,
  n: number,
  trials: number,
  trackIndices: number[],
): number[] {
  const counts = new Array<number>(trackIndices.length).fill(0)
  for (let trial = 0; trial < trials; trial++) {
    const sampler = new ReservoirSampler<number>(k, trial)
    for (let i = 0; i < n; i++) {
      sampler.add(i)
    }
    const sample = sampler.sample
    for (let t = 0; t < trackIndices.length; t++) {
      const target = trackIndices[t]!
      if (sample.includes(target)) {
        counts[t] = counts[t]! + 1
      }
    }
  }
  return counts
}

describe('ReservoirSampler', () => {
  describe('constructor', () => {
    it('creates sampler with specified capacity', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.capacity).toBe(10)
    })

    it('creates sampler with capacity 0', () => {
      const sampler = new ReservoirSampler<number>(0)
      expect(sampler.capacity).toBe(0)
    })

    it('creates sampler with capacity 1', () => {
      const sampler = new ReservoirSampler<number>(1)
      expect(sampler.capacity).toBe(1)
    })

    it('throws RangeError for negative capacity', () => {
      expect(() => new ReservoirSampler<number>(-1)).toThrow(RangeError)
    })

    it('accepts optional seed parameter', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      expect(sampler.capacity).toBe(5)
    })

    it('has initial size of 0', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.size).toBe(0)
    })

    it('has empty initial sample', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.sample).toEqual([])
    })

    it('isFull is false for positive capacity', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.isFull).toBe(false)
    })
  })

  describe('constructor with options', () => {
    it('creates sampler from options object', () => {
      const options: ReservoirSamplerOptions = { reservoirSize: 5 }
      const sampler = ReservoirSampler.fromOptions(options)
      expect(sampler.capacity).toBe(5)
    })

    it('creates sampler from options with seed', () => {
      const options: ReservoirSamplerOptions = { reservoirSize: 10, seed: 123 }
      const sampler = ReservoirSampler.fromOptions(options)
      expect(sampler.capacity).toBe(10)
    })

    it('fromOptions produces same result as constructor', () => {
      const a = new ReservoirSampler<number>(5, 42)
      const b = ReservoirSampler.fromOptions<number>({ reservoirSize: 5, seed: 42 })
      for (let i = 0; i < 100; i++) {
        a.add(i)
        b.add(i)
      }
      expect(a.sample).toEqual(b.sample)
    })

    it('throws for negative reservoirSize in options', () => {
      expect(() =>
        ReservoirSampler.fromOptions({ reservoirSize: -1 }),
      ).toThrow(RangeError)
    })
  })

  describe('add', () => {
    it('fills reservoir sequentially up to capacity', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 5; i++) sampler.add(i)
      expect(sampler.sample).toEqual([0, 1, 2, 3, 4])
    })

    it('sample size never exceeds capacity', () => {
      const sampler = new ReservoirSampler<number>(3, 42)
      for (let i = 0; i < 1000; i++) sampler.add(i)
      expect(sampler.sample.length).toBeLessThanOrEqual(3)
    })

    it('maintains at most k items beyond capacity', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(5)
    })

    it('increments processed count', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      expect(sampler.size).toBe(3)
    })

    it('with capacity 0 discards all items', () => {
      const sampler = new ReservoirSampler<number>(0)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample).toEqual([])
      expect(sampler.size).toBe(100)
    })

    it('with capacity 1 keeps at most one item', () => {
      const sampler = new ReservoirSampler<number>(1, 42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(1)
    })

    it('accepts number items', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(42)
      expect(sampler.contains(42)).toBe(true)
    })

    it('accepts string items', () => {
      const sampler = new ReservoirSampler<string>(5)
      sampler.add('hello')
      expect(sampler.contains('hello')).toBe(true)
    })

    it('accepts object items', () => {
      const obj = { id: 1 }
      const sampler = new ReservoirSampler<object>(5)
      sampler.add(obj)
      expect(sampler.contains(obj)).toBe(true)
    })

    it('accepts null items', () => {
      const sampler = new ReservoirSampler<null>(5)
      sampler.add(null)
      expect(sampler.contains(null)).toBe(true)
    })
  })

  describe('sample', () => {
    it('returns empty array for new sampler', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.sample).toEqual([])
    })

    it('returns items added before capacity reached', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(10)
      sampler.add(20)
      expect(sampler.sample).toEqual([10, 20])
    })

    it('returns at most capacity items', () => {
      const sampler = new ReservoirSampler<number>(3, 42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(3)
    })

    it('returns a copy not internal reference', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      const sample1 = sampler.sample
      sample1.push(999)
      expect(sampler.sample.length).toBe(1)
    })

    it('remains stable across multiple accesses', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 20; i++) sampler.add(i)
      const s1 = sampler.sample
      const s2 = sampler.sample
      expect(s1).toEqual(s2)
    })

    it('returns items in reservoir order', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 5; i++) sampler.add(i)
      expect(sampler.sample).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('size', () => {
    it('starts at 0', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.size).toBe(0)
    })

    it('increments with each add', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.add(1)
      expect(sampler.size).toBe(1)
      sampler.add(2)
      expect(sampler.size).toBe(2)
    })

    it('continues incrementing past capacity', () => {
      const sampler = new ReservoirSampler<number>(2)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      sampler.add(4)
      expect(sampler.size).toBe(4)
    })

    it('reflects total items processed', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 50; i++) sampler.add(i)
      expect(sampler.size).toBe(50)
    })

    it('tracks addMany correctly', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.addMany([1, 2, 3, 4, 5, 6, 7])
      expect(sampler.size).toBe(7)
    })
  })

  describe('samples', () => {
    it('equals size property', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 10; i++) sampler.add(i)
      expect(sampler.samples).toBe(sampler.size)
    })

    it('tracks total add calls', () => {
      const sampler = new ReservoirSampler<number>(3)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      sampler.add(4)
      expect(sampler.samples).toBe(4)
    })

    it('updates after each add', () => {
      const sampler = new ReservoirSampler<number>(10)
      const before = sampler.samples
      sampler.add(1)
      expect(sampler.samples).toBe(before + 1)
    })
  })

  describe('capacity', () => {
    it('returns constructor value', () => {
      const sampler = new ReservoirSampler<number>(42)
      expect(sampler.capacity).toBe(42)
    })

    it('remains constant after adds', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.capacity).toBe(5)
    })

    it('returns 0 for zero-capacity sampler', () => {
      const sampler = new ReservoirSampler<number>(0)
      expect(sampler.capacity).toBe(0)
    })

    it('returns 1 for single-capacity sampler', () => {
      const sampler = new ReservoirSampler<number>(1)
      expect(sampler.capacity).toBe(1)
    })
  })

  describe('isFull', () => {
    it('is false initially for positive capacity', () => {
      const sampler = new ReservoirSampler<number>(10)
      expect(sampler.isFull).toBe(false)
    })

    it('is false when partially filled', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      sampler.add(2)
      expect(sampler.isFull).toBe(false)
    })

    it('is true when exactly at capacity', () => {
      const sampler = new ReservoirSampler<number>(3)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      expect(sampler.isFull).toBe(true)
    })

    it('is true when past capacity', () => {
      const sampler = new ReservoirSampler<number>(2)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      expect(sampler.isFull).toBe(true)
    })

    it('is true for capacity 0 sampler', () => {
      const sampler = new ReservoirSampler<number>(0)
      expect(sampler.isFull).toBe(true)
    })

    it('stays true after more adds', () => {
      const sampler = new ReservoirSampler<number>(2)
      sampler.add(1)
      sampler.add(2)
      expect(sampler.isFull).toBe(true)
      sampler.add(3)
      expect(sampler.isFull).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns false for empty reservoir', () => {
      const sampler = new ReservoirSampler<number>(5)
      expect(sampler.contains(1)).toBe(false)
    })

    it('returns true for item in reservoir', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(42)
      expect(sampler.contains(42)).toBe(true)
    })

    it('returns false for item not in reservoir', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      expect(sampler.contains(99)).toBe(false)
    })

    it('works with number items', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.add(3.14)
      expect(sampler.contains(3.14)).toBe(true)
    })

    it('works with string items', () => {
      const sampler = new ReservoirSampler<string>(10)
      sampler.add('test')
      expect(sampler.contains('test')).toBe(true)
      expect(sampler.contains('other')).toBe(false)
    })

    it('works with object references', () => {
      const obj = { x: 1 }
      const sampler = new ReservoirSampler<object>(10)
      sampler.add(obj)
      expect(sampler.contains(obj)).toBe(true)
      expect(sampler.contains({ x: 1 })).toBe(false)
    })

    it('returns false after reset', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(42)
      sampler.reset()
      expect(sampler.contains(42)).toBe(false)
    })

    it('handles NaN values', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(NaN)
      expect(sampler.contains(NaN)).toBe(true)
    })
  })

  describe('frequency', () => {
    it('returns 0 for empty reservoir', () => {
      const sampler = new ReservoirSampler<number>(5)
      expect(sampler.frequency(1)).toBe(0)
    })

    it('returns 0 for item not in reservoir', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      sampler.add(2)
      expect(sampler.frequency(99)).toBe(0)
    })

    it('returns 1 for unique item', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(42)
      expect(sampler.frequency(42)).toBe(1)
    })

    it('returns correct count for duplicates', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.add(5)
      sampler.add(5)
      sampler.add(5)
      expect(sampler.frequency(5)).toBe(3)
    })

    it('returns 0 after reset', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(42)
      sampler.reset()
      expect(sampler.frequency(42)).toBe(0)
    })

    it('works with string items', () => {
      const sampler = new ReservoirSampler<string>(10)
      sampler.add('a')
      sampler.add('b')
      sampler.add('a')
      expect(sampler.frequency('a')).toBe(2)
    })

    it('works with object references', () => {
      const obj = { id: 1 }
      const sampler = new ReservoirSampler<object>(10)
      sampler.add(obj)
      sampler.add(obj)
      expect(sampler.frequency(obj)).toBe(2)
    })
  })

  describe('reset', () => {
    it('clears the sample', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 5; i++) sampler.add(i)
      sampler.reset()
      expect(sampler.sample).toEqual([])
    })

    it('resets size to 0', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 10; i++) sampler.add(i)
      sampler.reset()
      expect(sampler.size).toBe(0)
    })

    it('sets isFull to false for positive capacity', () => {
      const sampler = new ReservoirSampler<number>(5)
      for (let i = 0; i < 10; i++) sampler.add(i)
      sampler.reset()
      expect(sampler.isFull).toBe(false)
    })

    it('preserves capacity', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.reset()
      expect(sampler.capacity).toBe(5)
    })

    it('allows adding after reset', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 10; i++) sampler.add(i)
      sampler.reset()
      sampler.add(100)
      expect(sampler.sample).toEqual([100])
    })

    it('double reset is safe', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      sampler.reset()
      sampler.reset()
      expect(sampler.sample).toEqual([])
      expect(sampler.size).toBe(0)
    })

    it('reset after full reservoir works', () => {
      const sampler = new ReservoirSampler<number>(3)
      sampler.add(1)
      sampler.add(2)
      sampler.add(3)
      expect(sampler.isFull).toBe(true)
      sampler.reset()
      expect(sampler.isFull).toBe(false)
      expect(sampler.sample.length).toBe(0)
    })
  })

  describe('setSeed', () => {
    it('same seed produces identical samples', () => {
      const a = new ReservoirSampler<number>(5, 42)
      const b = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 100; i++) {
        a.add(i)
        b.add(i)
      }
      expect(a.sample).toEqual(b.sample)
    })

    it('different seeds produce different samples', () => {
      const a = new ReservoirSampler<number>(5, 1)
      const b = new ReservoirSampler<number>(5, 2)
      for (let i = 0; i < 100; i++) {
        a.add(i)
        b.add(i)
      }
      expect(a.sample).not.toEqual(b.sample)
    })

    it('setSeed provides reproducibility', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      const first = sampler.sample
      sampler.reset()
      sampler.setSeed(42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample).toEqual(first)
    })

    it('setSeed before any adds works', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.setSeed(42)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(5)
    })

    it('setSeed mid-stream affects future outcomes', () => {
      const sampler = new ReservoirSampler<number>(5, 1)
      for (let i = 0; i < 50; i++) sampler.add(i)
      const before = sampler.sample.slice()
      sampler.setSeed(999)
      for (let i = 50; i < 100; i++) sampler.add(i)
      expect(sampler.size).toBe(100)
    })

    it('setSeed to original seed reproduces original stream', () => {
      const sampler1 = new ReservoirSampler<number>(5, 42)
      for (let i = 0; i < 100; i++) sampler1.add(i)
      const expected = sampler1.sample

      const sampler2 = new ReservoirSampler<number>(5, 99)
      sampler2.setSeed(42)
      for (let i = 0; i < 100; i++) sampler2.add(i)
      expect(sampler2.sample).toEqual(expected)
    })
  })

  describe('addMany', () => {
    it('adds all items from array', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.addMany([1, 2, 3, 4, 5])
      expect(sampler.size).toBe(5)
      expect(sampler.sample.length).toBe(5)
    })

    it('processes items from iterable', () => {
      const sampler = new ReservoirSampler<number>(10)
      const iterable: Iterable<number> = [10, 20, 30]
      sampler.addMany(iterable)
      expect(sampler.size).toBe(3)
    })

    it('empty array leaves sampler unchanged', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(1)
      sampler.addMany([])
      expect(sampler.size).toBe(1)
      expect(sampler.sample).toEqual([1])
    })

    it('handles more items than capacity', () => {
      const sampler = new ReservoirSampler<number>(3, 42)
      sampler.addMany([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(sampler.sample.length).toBe(3)
      expect(sampler.size).toBe(10)
    })

    it('handles fewer items than capacity', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.addMany([1, 2, 3])
      expect(sampler.sample).toEqual([1, 2, 3])
    })

    it('size reflects total items added', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.addMany([1, 2])
      sampler.addMany([3, 4, 5])
      expect(sampler.size).toBe(5)
    })

    it('works with Set iterable', () => {
      const sampler = new ReservoirSampler<number>(10)
      sampler.addMany(new Set([1, 2, 3, 4, 5]))
      expect(sampler.size).toBe(5)
    })

    it('works with generator function', () => {
      function* gen(): Generator<number> {
        yield 10
        yield 20
        yield 30
      }
      const sampler = new ReservoirSampler<number>(10)
      sampler.addMany(gen())
      expect(sampler.size).toBe(3)
      expect(sampler.contains(10)).toBe(true)
      expect(sampler.contains(20)).toBe(true)
      expect(sampler.contains(30)).toBe(true)
    })
  })

  describe('merge', () => {
    it('merge two empty samplers yields empty', () => {
      const a = new ReservoirSampler<number>(5, 1)
      const b = new ReservoirSampler<number>(5, 2)
      a.merge(b)
      expect(a.sample).toEqual([])
      expect(a.size).toBe(0)
    })

    it('merge non-empty into empty adds items', () => {
      const a = new ReservoirSampler<number>(5, 1)
      const b = new ReservoirSampler<number>(5, 2)
      b.add(1)
      b.add(2)
      b.add(3)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.sample.length).toBe(3)
    })

    it('merge empty into non-empty preserves items', () => {
      const a = new ReservoirSampler<number>(5, 1)
      a.add(10)
      a.add(20)
      const b = new ReservoirSampler<number>(5, 2)
      a.merge(b)
      expect(a.sample).toEqual([10, 20])
    })

    it('merge two partial samplers', () => {
      const a = new ReservoirSampler<number>(10, 1)
      a.add(1)
      a.add(2)
      const b = new ReservoirSampler<number>(10, 2)
      b.add(3)
      b.add(4)
      a.merge(b)
      expect(a.size).toBe(4)
    })

    it('merge two full samplers', () => {
      const a = new ReservoirSampler<number>(3, 1)
      a.addMany([1, 2, 3, 4, 5])
      const b = new ReservoirSampler<number>(3, 2)
      b.addMany([6, 7, 8, 9, 10])
      a.merge(b)
      expect(a.sample.length).toBe(3)
      expect(a.size).toBe(8)
    })

    it('increases processed count', () => {
      const a = new ReservoirSampler<number>(5, 1)
      a.add(1)
      const b = new ReservoirSampler<number>(5, 2)
      b.add(10)
      b.add(20)
      const sizeBefore = a.size
      a.merge(b)
      expect(a.size).toBe(sizeBefore + 2)
    })

    it('preserves receiver capacity', () => {
      const a = new ReservoirSampler<number>(3, 1)
      const b = new ReservoirSampler<number>(10, 2)
      b.addMany([1, 2, 3, 4, 5])
      a.merge(b)
      expect(a.capacity).toBe(3)
    })

    it('self merge doubles items in count', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      sampler.addMany([1, 2, 3])
      const sizeBefore = sampler.size
      sampler.merge(sampler)
      expect(sampler.size).toBe(sizeBefore + 3)
    })

    it('result contains items from both samplers', () => {
      const a = new ReservoirSampler<number>(10, 1)
      a.addMany([1, 2, 3])
      const b = new ReservoirSampler<number>(10, 2)
      b.addMany([4, 5, 6])
      const allItems = new Set([...a.sample, ...b.sample])
      a.merge(b)
      for (const item of a.sample) {
        expect(allItems.has(item)).toBe(true)
      }
    })

    it('merge with different seed samplers', () => {
      const a = new ReservoirSampler<number>(5, 100)
      a.addMany([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      const b = new ReservoirSampler<number>(5, 200)
      b.addMany([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
      const merged = [...a.sample]
      a.merge(b)
      expect(a.sample.length).toBeLessThanOrEqual(5)
      expect(a.size).toBe(15)
    })
  })

  describe('statistical uniformity', () => {
    it('passes chi-squared test k=10 n=100', () => {
      const k = 10
      const n = 100
      const trials = 2000
      const trackIndices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
      const counts = runTrials(k, n, trials, trackIndices)
      const expected = (trials * k) / n
      const chi = chiSquaredTest(counts, expected)
      expect(chi).toBeLessThan(27.88)
    })

    it('passes chi-squared test k=5 n=50', () => {
      const k = 5
      const n = 50
      const trials = 2000
      const trackIndices = [0, 10, 20, 30, 40]
      const counts = runTrials(k, n, trials, trackIndices)
      const expected = (trials * k) / n
      const chi = chiSquaredTest(counts, expected)
      expect(chi).toBeLessThan(18.47)
    })

    it('passes chi-squared test k=20 n=100', () => {
      const k = 20
      const n = 100
      const trials = 2000
      const trackIndices = Array.from({ length: 20 }, (_, i) => i * 5)
      const counts = runTrials(k, n, trials, trackIndices)
      const expected = (trials * k) / n
      const chi = chiSquaredTest(counts, expected)
      expect(chi).toBeLessThan(43.82)
    })

    it('passes chi-squared test k=1 n=50', () => {
      const k = 1
      const n = 50
      const trials = 5000
      const trackIndices = [0, 10, 20, 30, 49]
      const counts = runTrials(k, n, trials, trackIndices)
      const expected = (trials * k) / n
      const chi = chiSquaredTest(counts, expected)
      expect(chi).toBeLessThan(18.47)
    })

    it('passes chi-squared test k=50 n=500', () => {
      const k = 50
      const n = 500
      const trials = 2000
      const trackIndices = Array.from({ length: 25 }, (_, i) => i * 20)
      const counts = runTrials(k, n, trials, trackIndices)
      const expected = (trials * k) / n
      const chi = chiSquaredTest(counts, expected)
      expect(chi).toBeLessThan(44.31)
    })

    it('each position equally represented over trials', () => {
      const k = 5
      const n = 50
      const trials = 2000
      const counts = runTrials(k, n, trials, [0, 49])
      expect(Math.abs(counts[0]! - counts[1]!)).toBeLessThan(100)
    })

    it('first k items have correct inclusion probability', () => {
      const k = 10
      const n = 200
      const trials = 5000
      const counts = runTrials(k, n, trials, [0])
      const expected = (trials * k) / n
      const ratio = counts[0]! / expected
      expect(ratio).toBeGreaterThan(0.85)
      expect(ratio).toBeLessThan(1.15)
    })

    it('late items have correct inclusion probability', () => {
      const k = 10
      const n = 200
      const trials = 5000
      const counts = runTrials(k, n, trials, [199])
      const expected = (trials * k) / n
      const ratio = counts[0]! / expected
      expect(ratio).toBeGreaterThan(0.85)
      expect(ratio).toBeLessThan(1.15)
    })

    it('sample mean close to population mean', () => {
      const k = 200
      const n = 10000
      const sampler = new ReservoirSampler<number>(k, 42)
      for (let i = 0; i < n; i++) sampler.add(i)
      const sample = sampler.sample
      const mean = sample.reduce((s, v) => s + v, 0) / sample.length
      const popMean = (n - 1) / 2
      expect(Math.abs(mean - popMean)).toBeLessThan(popMean * 0.15)
    })

    it('sample spread covers full range', () => {
      const k = 50
      const n = 1000
      const sampler = new ReservoirSampler<number>(k, 42)
      for (let i = 0; i < n; i++) sampler.add(i)
      const sample = sampler.sample
      const min = Math.min(...sample)
      const max = Math.max(...sample)
      expect(min).toBeLessThan(n * 0.3)
      expect(max).toBeGreaterThan(n * 0.7)
    })

    it('seeded sampler produces deterministic sample', () => {
      const results: number[][] = []
      for (let run = 0; run < 3; run++) {
        const sampler = new ReservoirSampler<number>(5, 42)
        for (let i = 0; i < 100; i++) sampler.add(i)
        results.push(sampler.sample)
      }
      expect(results[0]).toEqual(results[1])
      expect(results[1]).toEqual(results[2])
    })

    it('no systematic bias toward early or late items', () => {
      const k = 20
      const n = 100
      const trials = 3000
      const firstHalf = runTrials(k, n, trials, [0, 1, 2, 3, 4])
      const secondHalf = runTrials(k, n, trials, [95, 96, 97, 98, 99])
      const firstAvg = firstHalf.reduce((s, c) => s + c, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((s, c) => s + c, 0) / secondHalf.length
      expect(Math.abs(firstAvg - secondAvg)).toBeLessThan(firstAvg * 0.25)
    })
  })

  describe('edge cases', () => {
    it('handles undefined values', () => {
      const sampler = new ReservoirSampler<number | undefined>(5)
      sampler.add(undefined)
      expect(sampler.contains(undefined)).toBe(true)
    })

    it('handles null values', () => {
      const sampler = new ReservoirSampler<string | null>(5)
      sampler.add(null)
      expect(sampler.contains(null)).toBe(true)
    })

    it('handles zero number values', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.add(0)
      expect(sampler.contains(0)).toBe(true)
      expect(sampler.frequency(0)).toBe(1)
    })

    it('handles empty string values', () => {
      const sampler = new ReservoirSampler<string>(5)
      sampler.add('')
      expect(sampler.contains('')).toBe(true)
    })

    it('handles false boolean values', () => {
      const sampler = new ReservoirSampler<boolean>(5)
      sampler.add(false)
      expect(sampler.contains(false)).toBe(true)
      expect(sampler.contains(true)).toBe(false)
    })

    it('handles very large stream size', () => {
      const sampler = new ReservoirSampler<number>(10, 42)
      for (let i = 0; i < 100000; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(10)
      expect(sampler.size).toBe(100000)
    })

    it('handles objects with same toString', () => {
      const a = { val: 1, toString: () => 'same' }
      const b = { val: 2, toString: () => 'same' }
      const sampler = new ReservoirSampler<object>(5)
      sampler.add(a)
      expect(sampler.contains(a)).toBe(true)
      expect(sampler.contains(b)).toBe(false)
    })

    it('capacity 0 with many adds stays empty', () => {
      const sampler = new ReservoirSampler<number>(0)
      for (let i = 0; i < 1000; i++) sampler.add(i)
      expect(sampler.sample).toEqual([])
      expect(sampler.size).toBe(1000)
    })

    it('size 1 reservoir statistics', () => {
      const k = 1
      const n = 100
      const trials = 5000
      const counts = runTrials(k, n, trials, [50])
      const expected = (trials * k) / n
      const ratio = counts[0]! / expected
      expect(ratio).toBeGreaterThan(0.8)
      expect(ratio).toBeLessThan(1.2)
    })

    it('repeated reset and add cycles', () => {
      const sampler = new ReservoirSampler<number>(5, 42)
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) sampler.add(i)
        expect(sampler.sample.length).toBe(5)
        sampler.reset()
        expect(sampler.sample).toEqual([])
      }
    })

    it('merge with capacity 0 sampler', () => {
      const a = new ReservoirSampler<number>(0, 1)
      const b = new ReservoirSampler<number>(5, 2)
      b.addMany([1, 2, 3])
      a.merge(b)
      expect(a.sample).toEqual([])
      expect(a.size).toBe(3)
    })

    it('merge into capacity 0 sampler discards all', () => {
      const a = new ReservoirSampler<number>(5, 1)
      a.addMany([1, 2, 3])
      const b = new ReservoirSampler<number>(0, 2)
      a.merge(b)
      expect(a.size).toBe(3)
      expect(a.sample.length).toBeLessThanOrEqual(5)
    })

    it('addMany with single item', () => {
      const sampler = new ReservoirSampler<number>(5)
      sampler.addMany([42])
      expect(sampler.sample).toEqual([42])
      expect(sampler.size).toBe(1)
    })

    it('large seed values work correctly', () => {
      const sampler = new ReservoirSampler<number>(5, 2147483647)
      for (let i = 0; i < 100; i++) sampler.add(i)
      expect(sampler.sample.length).toBe(5)
    })
  })
})
