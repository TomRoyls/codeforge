import { describe, it, expect } from 'vitest'
import { StreamingQuantile } from '../../../src/utils/streaming-quantile.js'

describe('StreamingQuantile', () => {
  describe('empty state', () => {
    it('returns 0 for empty quantile', () => {
      const sq = new StreamingQuantile()
      expect(sq.quantile(0.5)).toBe(0)
    })

    it('returns 0 for empty min/max', () => {
      const sq = new StreamingQuantile()
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(0)
    })

    it('reports 0 count', () => {
      expect(new StreamingQuantile().count).toBe(0)
    })
  })

  describe('quantile', () => {
    it('computes median of odd count', () => {
      const sq = new StreamingQuantile()
      sq.push(1)
      sq.push(2)
      sq.push(3)
      expect(sq.median()).toBe(2)
    })

    it('computes median of even count', () => {
      const sq = new StreamingQuantile()
      sq.push(1)
      sq.push(2)
      sq.push(3)
      sq.push(4)
      expect(sq.median()).toBe(2.5)
    })

    it('computes p90', () => {
      const sq = new StreamingQuantile()
      for (let i = 1; i <= 100; i++) sq.push(i)
      expect(sq.p90()).toBeCloseTo(90, 0)
    })

    it('computes p95', () => {
      const sq = new StreamingQuantile()
      for (let i = 1; i <= 100; i++) sq.push(i)
      expect(sq.p95()).toBeCloseTo(95, 0)
    })

    it('computes p99', () => {
      const sq = new StreamingQuantile()
      for (let i = 1; i <= 100; i++) sq.push(i)
      expect(sq.p99()).toBeCloseTo(99, 0)
    })

    it('handles q=0 as min', () => {
      const sq = new StreamingQuantile()
      sq.push(5)
      sq.push(10)
      sq.push(15)
      expect(sq.quantile(0)).toBe(5)
    })

    it('handles q=1 as max', () => {
      const sq = new StreamingQuantile()
      sq.push(5)
      sq.push(10)
      sq.push(15)
      expect(sq.quantile(1)).toBe(15)
    })
  })

  describe('min and max', () => {
    it('tracks min', () => {
      const sq = new StreamingQuantile()
      sq.push(10)
      sq.push(5)
      sq.push(15)
      expect(sq.min()).toBe(5)
    })

    it('tracks max', () => {
      const sq = new StreamingQuantile()
      sq.push(10)
      sq.push(5)
      sq.push(15)
      expect(sq.max()).toBe(15)
    })
  })

  describe('capacity management', () => {
    it('respects max size', () => {
      const sq = new StreamingQuantile(100)
      for (let i = 0; i < 200; i++) sq.push(i)
      expect(sq.count).toBeLessThanOrEqual(100)
    })

    it('reports capacity', () => {
      const sq = new StreamingQuantile(500)
      expect(sq.capacity).toBe(500)
    })

    it('still computes reasonable quantiles after compaction', () => {
      const sq = new StreamingQuantile(100)
      for (let i = 0; i < 200; i++) sq.push(i)
      expect(sq.min()).toBeGreaterThanOrEqual(50)
      expect(sq.max()).toBe(199)
    })

    it('does not bias quantiles after compaction', () => {
      const sq = new StreamingQuantile(100)
      for (let i = 0; i < 200; i++) sq.push(i)
      expect(sq.median()).toBeGreaterThanOrEqual(140)
      expect(sq.median()).toBeLessThanOrEqual(160)
    })

    it('drops oldest values not smallest values', () => {
      const sq = new StreamingQuantile(10)
      for (let i = 0; i < 20; i++) sq.push(i)
      expect(sq.min()).toBe(10)
      expect(sq.max()).toBe(19)
      expect(sq.count).toBe(10)
    })
  })

  describe('out of order insertion', () => {
    it('handles reverse order', () => {
      const sq = new StreamingQuantile()
      sq.push(10)
      sq.push(5)
      sq.push(1)
      sq.push(15)
      expect(sq.min()).toBe(1)
      expect(sq.max()).toBe(15)
      expect(sq.median()).toBeCloseTo(7.5, 0)
    })

    it('handles random order', () => {
      const sq = new StreamingQuantile()
      const values = [42, 17, 93, 5, 88, 31, 76, 54]
      for (const v of values) sq.push(v)
      expect(sq.count).toBe(8)
      expect(sq.min()).toBe(5)
      expect(sq.max()).toBe(93)
    })
  })

  describe('repeated values', () => {
    it('handles duplicates', () => {
      const sq = new StreamingQuantile()
      sq.push(5)
      sq.push(5)
      sq.push(5)
      expect(sq.median()).toBe(5)
      expect(sq.min()).toBe(5)
      expect(sq.max()).toBe(5)
    })
  })
})
