import { describe, it, expect } from 'vitest'
import { ApproximateSet } from '../../../src/utils/approximate-set.js'

describe('ApproximateSet', () => {
  describe('construction', () => {
    it('creates with defaults', () => {
      const bs = new ApproximateSet()
      expect(bs.count).toBe(0)
      expect(bs.bitSize).toBeGreaterThan(0)
    })

    it('creates with custom params', () => {
      const bs = new ApproximateSet(100, 0.001)
      expect(bs.bitSize).toBeGreaterThan(0)
    })
  })

  describe('add and has', () => {
    it('finds added items', () => {
      const bs = new ApproximateSet()
      bs.add('hello')
      expect(bs.has('hello')).toBe(true)
    })

    it('correctly reports missing items', () => {
      const bs = new ApproximateSet()
      bs.add('hello')
      expect(bs.has('world')).toBe(false)
    })

    it('handles many items', () => {
      const bs = new ApproximateSet(1000)
      for (let i = 0; i < 500; i++) bs.add(`item-${i}`)
      expect(bs.count).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(bs.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('false positive rate', () => {
    it('maintains reasonable false positive rate', () => {
      const bs = new ApproximateSet(1000, 0.01)
      for (let i = 0; i < 1000; i++) bs.add(`item-${i}`)
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (bs.has(`nonexistent-${i}`)) falsePositives++
      }
      const rate = falsePositives / trials
      expect(rate).toBeLessThan(0.1)
    })
  })

  describe('count', () => {
    it('tracks added count', () => {
      const bs = new ApproximateSet()
      expect(bs.count).toBe(0)
      bs.add('a')
      expect(bs.count).toBe(1)
      bs.add('b')
      expect(bs.count).toBe(2)
    })
  })

  describe('estimatedFalsePositiveRate', () => {
    it('increases with more items', () => {
      const bs = new ApproximateSet(100, 0.01)
      const rate1 = bs.estimatedFalsePositiveRate
      for (let i = 0; i < 50; i++) bs.add(`item-${i}`)
      const rate2 = bs.estimatedFalsePositiveRate
      expect(rate2).toBeGreaterThanOrEqual(rate1)
    })
  })
})
