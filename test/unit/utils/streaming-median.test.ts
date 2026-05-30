import { describe, it, expect } from 'vitest'
import { StreamingMedian } from '../../../src/utils/streaming-median.js'

describe('StreamingMedian', () => {
  describe('empty state', () => {
    it('returns 0 for empty median', () => {
      const sm = new StreamingMedian()
      expect(sm.median()).toBe(0)
    })

    it('returns 0 for empty mean', () => {
      const sm = new StreamingMedian()
      expect(sm.mean()).toBe(0)
    })

    it('returns 0 count', () => {
      const sm = new StreamingMedian()
      expect(sm.count).toBe(0)
    })
  })

  describe('median', () => {
    it('returns single value as median', () => {
      const sm = new StreamingMedian()
      sm.push(5)
      expect(sm.median()).toBe(5)
    })

    it('computes median of two values', () => {
      const sm = new StreamingMedian()
      sm.push(1)
      sm.push(9)
      expect(sm.median()).toBe(5)
    })

    it('computes median of odd count', () => {
      const sm = new StreamingMedian()
      sm.push(3)
      sm.push(1)
      sm.push(5)
      expect(sm.median()).toBe(3)
    })

    it('computes median of even count', () => {
      const sm = new StreamingMedian()
      sm.push(1)
      sm.push(3)
      sm.push(5)
      sm.push(7)
      expect(sm.median()).toBe(4)
    })

    it('handles values in reverse order', () => {
      const sm = new StreamingMedian()
      sm.push(7)
      sm.push(5)
      sm.push(3)
      sm.push(1)
      expect(sm.median()).toBe(4)
    })

    it('handles duplicate values', () => {
      const sm = new StreamingMedian()
      sm.push(5)
      sm.push(5)
      sm.push(5)
      expect(sm.median()).toBe(5)
    })
  })

  describe('statistics', () => {
    it('tracks count', () => {
      const sm = new StreamingMedian()
      sm.push(1)
      sm.push(2)
      sm.push(3)
      expect(sm.count).toBe(3)
    })

    it('tracks sum', () => {
      const sm = new StreamingMedian()
      sm.push(10)
      sm.push(20)
      sm.push(30)
      expect(sm.sum).toBe(60)
    })

    it('computes mean', () => {
      const sm = new StreamingMedian()
      sm.push(2)
      sm.push(4)
      sm.push(6)
      expect(sm.mean()).toBe(4)
    })

    it('computes min', () => {
      const sm = new StreamingMedian()
      sm.push(5)
      sm.push(1)
      sm.push(9)
      expect(sm.min()).toBe(1)
    })

    it('computes max', () => {
      const sm = new StreamingMedian()
      sm.push(5)
      sm.push(1)
      sm.push(9)
      expect(sm.max()).toBe(9)
    })

    it('handles negative values', () => {
      const sm = new StreamingMedian()
      sm.push(-5)
      sm.push(-1)
      sm.push(-3)
      expect(sm.median()).toBe(-3)
      expect(sm.mean()).toBe(-3)
    })
  })

  describe('streaming', () => {
    it('maintains median across many pushes', () => {
      const sm = new StreamingMedian()
      const values = [42, 17, 93, 5, 88, 31, 76, 54]
      for (const v of values) {
        sm.push(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      const expected = (sorted[3]! + sorted[4]!) / 2
      expect(sm.median()).toBe(expected)
    })

    it('handles sequential values', () => {
      const sm = new StreamingMedian()
      for (let i = 1; i <= 100; i++) {
        sm.push(i)
      }
      expect(sm.median()).toBe(50.5)
      expect(sm.mean()).toBe(50.5)
    })
  })
})
