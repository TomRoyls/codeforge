import { describe, it, expect } from 'vitest'
import { PrioritySampling } from '../../src/core/priority-sampling/priority-sampling.js'
import type { PrioritySamplingOptions } from '../../src/core/priority-sampling/types.js'
import { DEFAULT_PRIORITY_SAMPLING_OPTIONS } from '../../src/core/priority-sampling/types.js'

describe('PrioritySampling', () => {
  describe('constructor', () => {
    it('creates with default options', () => {
      const ps = new PrioritySampling<number>()
      expect(ps.reservoirSize).toBe(100)
    })

    it('creates with custom reservoirSize', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 50 })
      expect(ps.reservoirSize).toBe(50)
    })

    it('creates with custom seed', () => {
      const ps = new PrioritySampling<number>({ seed: 42 })
      expect(ps.reservoirSize).toBe(100)
    })

    it('creates with both options', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      expect(ps.reservoirSize).toBe(10)
    })

    it('creates with empty options', () => {
      const ps = new PrioritySampling<number>({})
      expect(ps.reservoirSize).toBe(100)
    })

    it('creates with reservoirSize 0', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 0 })
      expect(ps.reservoirSize).toBe(0)
    })

    it('creates with reservoirSize 1', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 1 })
      expect(ps.reservoirSize).toBe(1)
    })

    it('throws RangeError for negative reservoirSize', () => {
      expect(() => new PrioritySampling<number>({ reservoirSize: -1 })).toThrow(RangeError)
    })

    it('throws RangeError for negative reservoirSize with message', () => {
      expect(() => new PrioritySampling<number>({ reservoirSize: -5 })).toThrow(
        'reservoirSize must be non-negative',
      )
    })

    it('has initial size 0', () => {
      const ps = new PrioritySampling<number>()
      expect(ps.size).toBe(0)
    })

    it('is initially empty', () => {
      const ps = new PrioritySampling<number>()
      expect(ps.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('adds item to reservoir when not full', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10 })
      ps.add(1, 1)
      expect(ps.size).toBe(1)
      expect(ps.contains(1)).toBe(true)
    })

    it('adds multiple items up to reservoir capacity', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      for (let i = 0; i < 5; i++) {
        ps.add(i, 1)
      }
      expect(ps.size).toBe(5)
    })

    it('does not exceed reservoir capacity', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 3, seed: 42 })
      for (let i = 0; i < 100; i++) {
        ps.add(i, 1)
      }
      expect(ps.size).toBe(3)
    })

    it('throws RangeError for zero weight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10 })
      expect(() => ps.add(1, 0)).toThrow(RangeError)
    })

    it('throws RangeError for negative weight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10 })
      expect(() => ps.add(1, -1)).toThrow(RangeError)
    })

    it('throws with correct message for zero weight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10 })
      expect(() => ps.add(1, 0)).toThrow('weight must be positive')
    })

    it('tracks adds in statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 1 })
      ps.add(1, 1)
      ps.add(2, 2)
      ps.add(3, 3)
      expect(ps.getStatistics().adds).toBe(3)
    })

    it('tracks totalWeight in statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 1 })
      ps.add(1, 1)
      ps.add(2, 2.5)
      ps.add(3, 3.7)
      expect(ps.totalWeight()).toBeCloseTo(7.2)
    })

    it('tracks overflows when reservoir is full', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 2, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      ps.add(3, 1)
      expect(ps.getStatistics().overflows).toBe(1)
    })

    it('tracks multiple overflows', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 2, seed: 42 })
      for (let i = 0; i < 10; i++) {
        ps.add(i, 1)
      }
      expect(ps.getStatistics().overflows).toBe(8)
    })

    it('works with string items', () => {
      const ps = new PrioritySampling<string>({ reservoirSize: 5, seed: 42 })
      ps.add('a', 1)
      ps.add('b', 2)
      ps.add('c', 3)
      expect(ps.size).toBe(3)
    })

    it('works with object items', () => {
      const ps = new PrioritySampling<{ id: number }>({ reservoirSize: 5, seed: 42 })
      ps.add({ id: 1 }, 1)
      ps.add({ id: 2 }, 2)
      expect(ps.size).toBe(2)
    })

    it('handles very small weights', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 0.001)
      expect(ps.size).toBe(1)
    })

    it('handles very large weights', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1000000)
      expect(ps.size).toBe(1)
    })

    it('handles reservoirSize 0', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 0, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 2)
      expect(ps.size).toBe(0)
      expect(ps.getStatistics().adds).toBe(2)
    })

    it('items with higher weight are more likely to be sampled', () => {
      const counts = { high: 0, low: 0 }
      const trials = 1000
      for (let t = 0; t < trials; t++) {
        const ps = new PrioritySampling<string>({ reservoirSize: 1, seed: t })
        ps.add('low', 1)
        ps.add('high', 100)
        const r = ps.reservoir()
        if (r.includes('high')) counts.high++
        else counts.low++
      }
      expect(counts.high).toBeGreaterThan(counts.low * 5)
    })
  })

  describe('sample', () => {
    it('returns empty array when reservoir is empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.sample()).toEqual([])
    })

    it('returns all items when n is undefined', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      ps.add(3, 1)
      const result = ps.sample()
      expect(result.length).toBe(3)
    })

    it('returns n items when n is specified', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      for (let i = 0; i < 10; i++) ps.add(i, 1)
      const result = ps.sample(5)
      expect(result.length).toBe(5)
    })

    it('returns at most reservoir.length items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 3, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      const result = ps.sample(10)
      expect(result.length).toBe(2)
    })

    it('returns n=0 items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(ps.sample(0)).toEqual([])
    })

    it('tracks samples in statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.sample()
      ps.sample()
      ps.sample()
      expect(ps.getStatistics().samples).toBe(3)
    })

    it('returns items from the reservoir', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      for (let i = 0; i < 5; i++) ps.add(i, 1)
      const result = ps.sample(5)
      for (const item of result) {
        expect(item).toBeGreaterThanOrEqual(0)
        expect(item).toBeLessThan(5)
      }
    })

    it('handles sample with single item in reservoir', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(42, 1)
      expect(ps.sample(1)).toEqual([42])
    })

    it('handles sample with single item and no n', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(42, 1)
      expect(ps.sample()).toEqual([42])
    })
  })

  describe('reset', () => {
    it('clears the reservoir', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 2)
      ps.reset()
      expect(ps.size).toBe(0)
      expect(ps.isEmpty).toBe(true)
    })

    it('resets statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 2)
      ps.sample()
      ps.reset()
      const stats = ps.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.samples).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.overflows).toBe(0)
      expect(stats.totalWeight).toBe(0)
    })

    it('allows adding after reset', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.reset()
      ps.add(2, 1)
      expect(ps.size).toBe(1)
      expect(ps.contains(2)).toBe(true)
    })

    it('resets totalWeight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 10)
      ps.add(2, 20)
      ps.reset()
      expect(ps.totalWeight()).toBe(0)
    })
  })

  describe('reservoir', () => {
    it('returns empty array when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.reservoir()).toEqual([])
    })

    it('returns items in the reservoir', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      ps.add(3, 1)
      const items = ps.reservoir()
      expect(items.length).toBe(3)
      expect(items).toContain(1)
      expect(items).toContain(2)
      expect(items).toContain(3)
    })

    it('returns a copy', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      const arr = ps.reservoir()
      arr.push(999)
      expect(ps.size).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.size).toBe(0)
    })

    it('returns current number of items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      expect(ps.size).toBe(2)
    })

    it('does not exceed reservoirSize', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 3, seed: 42 })
      for (let i = 0; i < 100; i++) ps.add(i, 1)
      expect(ps.size).toBe(3)
    })
  })

  describe('reservoirSize', () => {
    it('returns the configured reservoir size', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 42 })
      expect(ps.reservoirSize).toBe(42)
    })

    it('returns default when not specified', () => {
      const ps = new PrioritySampling<number>()
      expect(ps.reservoirSize).toBe(100)
    })

    it('returns 0 for zero reservoir', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 0 })
      expect(ps.reservoirSize).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.isEmpty).toBe(true)
    })

    it('returns false after adding item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(ps.isEmpty).toBe(false)
    })

    it('returns true after reset', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.reset()
      expect(ps.isEmpty).toBe(true)
    })

    it('returns false when reservoirSize is 0', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 0, seed: 42 })
      expect(ps.isEmpty).toBe(true)
    })
  })

  describe('totalWeight', () => {
    it('returns 0 when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.totalWeight()).toBe(0)
    })

    it('returns sum of all added weights', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 2)
      ps.add(3, 3)
      expect(ps.totalWeight()).toBe(6)
    })

    it('tracks weight even for overflowed items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 1, seed: 42 })
      ps.add(1, 10)
      ps.add(2, 20)
      expect(ps.totalWeight()).toBe(30)
    })

    it('handles fractional weights', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      ps.add(1, 0.5)
      ps.add(2, 1.5)
      expect(ps.totalWeight()).toBeCloseTo(2.0)
    })
  })

  describe('contains', () => {
    it('returns false when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.contains(1)).toBe(false)
    })

    it('returns true for contained item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(ps.contains(1)).toBe(true)
    })

    it('returns false for non-contained item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(ps.contains(2)).toBe(false)
    })

    it('handles NaN correctly', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(NaN, 1)
      expect(ps.contains(NaN)).toBe(true)
    })

    it('handles undefined items', () => {
      const ps = new PrioritySampling<undefined>({ reservoirSize: 5, seed: 42 })
      ps.add(undefined, 1)
      expect(ps.contains(undefined)).toBe(true)
    })

    it('handles null items', () => {
      const ps = new PrioritySampling<null>({ reservoirSize: 5, seed: 42 })
      ps.add(null, 1)
      expect(ps.contains(null)).toBe(true)
    })

    it('uses Object.is semantics for -0 and +0', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(-0, 1)
      expect(ps.contains(-0)).toBe(true)
      expect(ps.contains(+0)).toBe(false)
    })
  })

  describe('getWeight', () => {
    it('returns undefined when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.getWeight(1)).toBeUndefined()
    })

    it('returns weight for contained item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 3.5)
      expect(ps.getWeight(1)).toBe(3.5)
    })

    it('returns undefined for non-contained item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 3.5)
      expect(ps.getWeight(2)).toBeUndefined()
    })

    it('returns updated weight after updateWeight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 3.5)
      ps.updateWeight(1, 7.0)
      expect(ps.getWeight(1)).toBe(7.0)
    })
  })

  describe('updateWeight', () => {
    it('updates weight of existing item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      const result = ps.updateWeight(1, 5)
      expect(result).toBe(true)
      expect(ps.getWeight(1)).toBe(5)
    })

    it('returns false for non-existent item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      const result = ps.updateWeight(2, 5)
      expect(result).toBe(false)
    })

    it('returns false when reservoir is empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.updateWeight(1, 5)).toBe(false)
    })

    it('throws RangeError for zero weight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(() => ps.updateWeight(1, 0)).toThrow(RangeError)
    })

    it('throws RangeError for negative weight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(() => ps.updateWeight(1, -1)).toThrow(RangeError)
    })

    it('tracks updates in statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.updateWeight(1, 2)
      ps.updateWeight(1, 3)
      expect(ps.getStatistics().updates).toBe(2)
    })

    it('updates totalWeight correctly', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 3)
      ps.updateWeight(1, 7)
      expect(ps.totalWeight()).toBe(7)
    })

    it('maintains item in reservoir after update', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.updateWeight(1, 10)
      expect(ps.contains(1)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      expect(ps.toArray()).toEqual([])
    })

    it('returns all items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      ps.add(3, 1)
      const arr = ps.toArray()
      expect(arr.length).toBe(3)
    })

    it('returns a copy', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      const arr = ps.toArray()
      arr.push(999)
      expect(ps.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('does not call callback when empty', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      let count = 0
      ps.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each item', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 10)
      ps.add(2, 20)
      ps.add(3, 30)
      const items: number[] = []
      const weights: number[] = []
      const indices: number[] = []
      ps.forEach((item, weight, index) => {
        items.push(item)
        weights.push(weight)
        indices.push(index)
      })
      expect(items.length).toBe(3)
      expect(weights.length).toBe(3)
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct weights', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 5)
      ps.add(2, 10)
      const weights: number[] = []
      ps.forEach((_item, weight) => {
        weights.push(weight)
      })
      expect(weights).toContain(5)
      expect(weights).toContain(10)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      const stats = ps.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.samples).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.totalWeight).toBe(0)
      expect(stats.overflows).toBe(0)
    })

    it('tracks adds', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      expect(ps.getStatistics().adds).toBe(2)
    })

    it('tracks samples', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.sample()
      ps.sample()
      expect(ps.getStatistics().samples).toBe(2)
    })

    it('tracks updates', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.updateWeight(1, 2)
      expect(ps.getStatistics().updates).toBe(1)
    })

    it('tracks totalWeight', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 3)
      ps.add(2, 7)
      expect(ps.getStatistics().totalWeight).toBe(10)
    })

    it('tracks overflows', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 1, seed: 42 })
      ps.add(1, 1)
      ps.add(2, 1)
      ps.add(3, 1)
      expect(ps.getStatistics().overflows).toBe(2)
    })

    it('returns a snapshot', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      const stats = ps.getStatistics()
      ps.add(2, 1)
      expect(stats.adds).toBe(1)
      expect(ps.getStatistics().adds).toBe(2)
    })
  })

  describe('deterministic behavior', () => {
    it('produces same results with same seed', () => {
      const ps1 = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      const ps2 = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      for (let i = 0; i < 20; i++) {
        ps1.add(i, i + 1)
        ps2.add(i, i + 1)
      }
      expect(ps1.reservoir()).toEqual(ps2.reservoir())
    })

    it('produces different results with different seeds', () => {
      const ps1 = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      const ps2 = new PrioritySampling<number>({ reservoirSize: 5, seed: 99 })
      for (let i = 0; i < 20; i++) {
        ps1.add(i, 1)
        ps2.add(i, 1)
      }
      expect(ps1.reservoir()).not.toEqual(ps2.reservoir())
    })

    it('sample is deterministic with same seed', () => {
      const ps1 = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      const ps2 = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      for (let i = 0; i < 10; i++) {
        ps1.add(i, 1)
        ps2.add(i, 1)
      }
      expect(ps1.sample(5)).toEqual(ps2.sample(5))
    })
  })

  describe('weighted sampling behavior', () => {
    it('higher weight items appear more often in reservoir', () => {
      const heavyCount = { appeared: 0, total: 0 }
      const trials = 500
      for (let t = 0; t < trials; t++) {
        const ps = new PrioritySampling<string>({ reservoirSize: 1, seed: t })
        ps.add('light', 1)
        ps.add('heavy', 50)
        heavyCount.total++
        if (ps.contains('heavy')) heavyCount.appeared++
      }
      expect(heavyCount.appeared).toBeGreaterThan(trials * 0.8)
    })

    it('equal weights produce roughly equal distribution', () => {
      const counts = [0, 0, 0]
      const trials = 3000
      for (let t = 0; t < trials; t++) {
        const ps = new PrioritySampling<number>({ reservoirSize: 1, seed: t })
        ps.add(0, 1)
        ps.add(1, 1)
        ps.add(2, 1)
        const r = ps.reservoir()
        if (r.length > 0) counts[r[0]!]!++
      }
      for (const count of counts) {
        expect(count).toBeGreaterThan(trials * 0.2)
      }
    })
  })

  describe('edge cases', () => {
    it('handles reservoir size 1', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 1, seed: 42 })
      ps.add(1, 1)
      expect(ps.size).toBe(1)
      ps.add(2, 100)
      expect(ps.size).toBe(1)
    })

    it('handles single add', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      ps.add(42, 1)
      expect(ps.size).toBe(1)
      expect(ps.contains(42)).toBe(true)
      expect(ps.getWeight(42)).toBe(1)
    })

    it('handles duplicate items', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      ps.add(1, 2)
      expect(ps.size).toBe(2)
    })

    it('handles very large reservoir size', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10000, seed: 42 })
      for (let i = 0; i < 5000; i++) {
        ps.add(i, 1)
      }
      expect(ps.size).toBe(5000)
    })

    it('handles weight of exactly 1', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 1)
      expect(ps.getWeight(1)).toBe(1)
    })

    it('handles weight with many decimal places', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      ps.add(1, 0.123456789)
      expect(ps.getWeight(1)).toBeCloseTo(0.123456789)
    })

    it('handles adding items after many overflows', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 2, seed: 42 })
      for (let i = 0; i < 1000; i++) {
        ps.add(i, 1)
      }
      expect(ps.size).toBe(2)
      expect(ps.getStatistics().overflows).toBe(998)
    })
  })

  describe('types import', () => {
    it('exports DEFAULT_PRIORITY_SAMPLING_OPTIONS', () => {
      expect(DEFAULT_PRIORITY_SAMPLING_OPTIONS.reservoirSize).toBe(100)
    })

    it('DEFAULT_PRIORITY_SAMPLING_OPTIONS has correct structure', () => {
      expect(DEFAULT_PRIORITY_SAMPLING_OPTIONS).toEqual({
        reservoirSize: 100,
        seed: 0,
      })
    })

    it('can use PrioritySamplingOptions type', () => {
      const opts: PrioritySamplingOptions = { reservoirSize: 10, seed: 42 }
      const ps = new PrioritySampling<number>(opts)
      expect(ps.reservoirSize).toBe(10)
    })

    it('can use partial PrioritySamplingOptions', () => {
      const opts: PrioritySamplingOptions = { seed: 42 }
      const ps = new PrioritySampling<number>(opts)
      expect(ps.reservoirSize).toBe(100)
    })
  })

  describe('generics', () => {
    it('works with string type', () => {
      const ps = new PrioritySampling<string>({ reservoirSize: 5, seed: 42 })
      ps.add('hello', 1)
      ps.add('world', 2)
      expect(ps.contains('hello')).toBe(true)
      expect(ps.getWeight('world')).toBe(2)
    })

    it('works with object type', () => {
      const ps = new PrioritySampling<{ name: string }>({ reservoirSize: 5, seed: 42 })
      const obj = { name: 'test' }
      ps.add(obj, 1)
      expect(ps.contains(obj)).toBe(true)
      expect(ps.getWeight(obj)).toBe(1)
    })

    it('works with array type', () => {
      const ps = new PrioritySampling<number[]>({ reservoirSize: 5, seed: 42 })
      ps.add([1, 2, 3], 1)
      expect(ps.size).toBe(1)
    })

    it('works with boolean type', () => {
      const ps = new PrioritySampling<boolean>({ reservoirSize: 5, seed: 42 })
      ps.add(true, 1)
      ps.add(false, 1)
      expect(ps.size).toBe(2)
    })
  })

  describe('integration scenarios', () => {
    it('full workflow: add, sample, update, reset', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 10, seed: 42 })
      for (let i = 0; i < 20; i++) ps.add(i, i + 1)
      expect(ps.size).toBe(10)
      expect(ps.getStatistics().adds).toBe(20)
      const sampled = ps.sample(5)
      expect(sampled.length).toBe(5)
      expect(ps.getStatistics().samples).toBe(1)
      ps.updateWeight(sampled[0]!, 100)
      expect(ps.getStatistics().updates).toBe(1)
      ps.reset()
      expect(ps.isEmpty).toBe(true)
      expect(ps.getStatistics().adds).toBe(0)
    })

    it('multiple rounds of operations', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 5, seed: 42 })
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 10; i++) ps.add(round * 10 + i, i + 1)
        ps.sample(3)
        ps.reset()
      }
      expect(ps.isEmpty).toBe(true)
    })

    it('large scale sampling', () => {
      const ps = new PrioritySampling<number>({ reservoirSize: 100, seed: 42 })
      for (let i = 0; i < 10000; i++) ps.add(i, 1)
      expect(ps.size).toBe(100)
      expect(ps.getStatistics().adds).toBe(10000)
      expect(ps.getStatistics().overflows).toBe(9900)
    })
  })
})
