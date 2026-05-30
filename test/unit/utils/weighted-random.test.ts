import { describe, it, expect } from 'vitest'
import { WeightedRandom } from '../../../src/utils/weighted-random.js'

describe('WeightedRandom', () => {
  describe('add and sample', () => {
    it('returns undefined for empty sampler', () => {
      const wr = new WeightedRandom<string>()
      expect(wr.sample()).toBeUndefined()
    })

    it('returns the only item', () => {
      const wr = new WeightedRandom<string>()
      wr.add('only', 1)
      expect(wr.sample()).toBe('only')
    })

    it('samples from multiple items', () => {
      const wr = new WeightedRandom<string>()
      wr.add('a', 1)
      wr.add('b', 1)
      wr.add('c', 1)
      const result = wr.sample()
      expect(['a', 'b', 'c']).toContain(result)
    })

    it('ignores zero weight', () => {
      const wr = new WeightedRandom<string>()
      wr.add('a', 0)
      expect(wr.size).toBe(0)
    })
  })

  describe('weighted sampling', () => {
    it('favors higher weights', () => {
      const wr = new WeightedRandom<string>()
      wr.add('heavy', 100)
      wr.add('light', 1)
      const samples = wr.sampleN(1000)
      const heavyCount = samples.filter(s => s === 'heavy').length
      expect(heavyCount).toBeGreaterThan(900)
    })
  })

  describe('sampleN', () => {
    it('returns correct number of samples', () => {
      const wr = new WeightedRandom<number>()
      wr.add(1, 1)
      wr.add(2, 1)
      expect(wr.sampleN(5).length).toBe(5)
    })
  })

  describe('size and total', () => {
    it('tracks size', () => {
      const wr = new WeightedRandom<number>()
      wr.add(1, 5)
      wr.add(2, 10)
      expect(wr.size).toBe(2)
    })

    it('tracks total weight', () => {
      const wr = new WeightedRandom<number>()
      wr.add(1, 5)
      wr.add(2, 10)
      expect(wr.total).toBe(15)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const wr = new WeightedRandom<number>()
      wr.add(1, 5)
      wr.add(2, 10)
      wr.clear()
      expect(wr.size).toBe(0)
      expect(wr.total).toBe(0)
      expect(wr.sample()).toBeUndefined()
    })
  })
})
