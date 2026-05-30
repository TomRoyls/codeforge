import { describe, it, expect } from 'vitest'
import { ReservoirSampler } from '../../../src/utils/reservoir-sampler.js'

describe('ReservoirSampler', () => {
  describe('basic sampling', () => {
    it('returns all items when under capacity', () => {
      const rs = new ReservoirSampler<number>(10)
      rs.add(1)
      rs.add(2)
      rs.add(3)
      expect(rs.sample).toEqual([1, 2, 3])
    })

    it('limits sample to capacity', () => {
      const rs = new ReservoirSampler<number>(3)
      for (let i = 0; i < 100; i++) rs.add(i)
      expect(rs.sample.length).toBe(3)
    })

    it('tracks total seen', () => {
      const rs = new ReservoirSampler<number>(5)
      for (let i = 0; i < 50; i++) rs.add(i)
      expect(rs.totalSeen).toBe(50)
    })
  })

  describe('isFull', () => {
    it('returns false when not full', () => {
      const rs = new ReservoirSampler<number>(5)
      rs.add(1)
      expect(rs.isFull).toBe(false)
    })

    it('returns true when full', () => {
      const rs = new ReservoirSampler<number>(3)
      rs.add(1)
      rs.add(2)
      rs.add(3)
      expect(rs.isFull).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      const rs = new ReservoirSampler<number>(3)
      for (let i = 0; i < 10; i++) rs.add(i)
      rs.reset()
      expect(rs.sample).toEqual([])
      expect(rs.totalSeen).toBe(0)
      expect(rs.isFull).toBe(false)
    })
  })

  describe('statistical properties', () => {
    it('produces roughly uniform samples', () => {
      const rs = new ReservoirSampler<number>(100)
      for (let i = 0; i < 1000; i++) rs.add(i)
      const sample = rs.sample
      let below500 = 0
      for (const v of sample) {
        if (v < 500) below500++
      }
      expect(below500).toBeGreaterThan(30)
      expect(below500).toBeLessThan(70)
    })
  })

  describe('edge cases', () => {
    it('handles capacity of 1', () => {
      const rs = new ReservoirSampler<number>(1)
      rs.add(42)
      rs.add(99)
      expect(rs.sample.length).toBe(1)
    })

    it('handles empty sampler', () => {
      const rs = new ReservoirSampler<number>(10)
      expect(rs.sample).toEqual([])
      expect(rs.totalSeen).toBe(0)
    })
  })
})
