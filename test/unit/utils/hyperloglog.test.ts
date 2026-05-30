import { describe, it, expect } from 'vitest'
import { HyperLogLog } from '../../../src/utils/hyperloglog.js'

describe('HyperLogLog', () => {
  describe('construction', () => {
    it('creates with default precision', () => {
      const hll = new HyperLogLog()
      expect(hll.count()).toBe(0)
    })

    it('creates with custom precision', () => {
      const hll = new HyperLogLog(10)
      expect(hll.registerCount).toBe(1024)
    })

    it('exposes precision', () => {
      const hll = new HyperLogLog(12)
      expect(hll.precision).toBe(12)
    })
  })

  describe('cardinality estimation', () => {
    it('estimates cardinality of small set', () => {
      const hll = new HyperLogLog(10)
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })

    it('estimates cardinality of empty set', () => {
      const hll = new HyperLogLog()
      expect(hll.count()).toBe(0)
    })

    it('handles duplicate adds', () => {
      const hll = new HyperLogLog(10)
      for (let i = 0; i < 1000; i++) {
        hll.add('same-value')
      }
      const estimate = hll.count()
      expect(estimate).toBeLessThan(10)
    })

    it('estimates larger cardinality', () => {
      const hll = new HyperLogLog(14)
      for (let i = 0; i < 10000; i++) {
        hll.add(`unique-${i}`)
      }
      const estimate = hll.count()
      const error = Math.abs(estimate - 10000) / 10000
      expect(error).toBeLessThan(0.15)
    })
  })

  describe('merge', () => {
    it('merges two sketches', () => {
      const hll1 = new HyperLogLog(10)
      const hll2 = new HyperLogLog(10)
      for (let i = 0; i < 100; i++) hll1.add(`set1-${i}`)
      for (let i = 0; i < 100; i++) hll2.add(`set2-${i}`)
      hll1.merge(hll2)
      const estimate = hll1.count()
      expect(estimate).toBeGreaterThan(100)
      expect(estimate).toBeLessThan(300)
    })
  })

  describe('register count', () => {
    it('returns correct register count', () => {
      const hll = new HyperLogLog(8)
      expect(hll.registerCount).toBe(256)
    })
  })
})
