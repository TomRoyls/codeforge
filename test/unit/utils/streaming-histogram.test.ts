import { describe, it, expect } from 'vitest'
import { StreamingHistogram } from '../../../src/utils/streaming-histogram.js'

describe('StreamingHistogram', () => {
  describe('add', () => {
    it('adds values', () => {
      const sh = new StreamingHistogram()
      sh.add(10)
      sh.add(20)
      sh.add(30)
      expect(sh.count).toBe(3)
    })

    it('compresses when exceeding max bins', () => {
      const sh = new StreamingHistogram(5)
      for (let i = 0; i < 100; i++) {
        sh.add(i)
      }
      expect(sh.binCount).toBeLessThanOrEqual(6)
      expect(sh.count).toBe(100)
    })
  })

  describe('quantile', () => {
    it('computes median', () => {
      const sh = new StreamingHistogram()
      for (let i = 1; i <= 100; i++) sh.add(i)
      expect(sh.quantile(0.5)).toBe(50)
    })

    it('computes 90th percentile', () => {
      const sh = new StreamingHistogram()
      for (let i = 1; i <= 100; i++) sh.add(i)
      expect(sh.quantile(0.9)).toBe(90)
    })

    it('returns 0 for empty histogram', () => {
      const sh = new StreamingHistogram()
      expect(sh.quantile(0.5)).toBe(0)
    })
  })

  describe('min and max', () => {
    it('computes min', () => {
      const sh = new StreamingHistogram()
      sh.add(10)
      sh.add(5)
      sh.add(20)
      expect(sh.min).toBe(5)
    })

    it('computes max', () => {
      const sh = new StreamingHistogram()
      sh.add(10)
      sh.add(5)
      sh.add(20)
      expect(sh.max).toBe(20)
    })
  })

  describe('mean', () => {
    it('computes mean', () => {
      const sh = new StreamingHistogram()
      sh.add(10)
      sh.add(20)
      sh.add(30)
      expect(sh.mean).toBeCloseTo(20)
    })

    it('returns 0 for empty', () => {
      const sh = new StreamingHistogram()
      expect(sh.mean).toBe(0)
    })
  })

  describe('reset', () => {
    it('clears all data', () => {
      const sh = new StreamingHistogram()
      sh.add(10)
      sh.add(20)
      sh.reset()
      expect(sh.count).toBe(0)
      expect(sh.binCount).toBe(0)
    })
  })
})
