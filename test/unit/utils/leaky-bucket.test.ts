import { describe, it, expect } from 'vitest'
import { LeakyBucket } from '../../../src/utils/leaky-bucket.js'

describe('LeakyBucket', () => {
  describe('pour', () => {
    it('accepts requests within capacity', () => {
      const lb = new LeakyBucket(10, 1)
      expect(lb.pour(1)).toBe(true)
      expect(lb.pour(5)).toBe(true)
    })

    it('rejects requests exceeding capacity', () => {
      const lb = new LeakyBucket(5, 1)
      lb.pour(5)
      expect(lb.pour(1)).toBe(false)
    })

    it('accepts single unit by default', () => {
      const lb = new LeakyBucket(10, 1)
      expect(lb.pour()).toBe(true)
    })
  })

  describe('level', () => {
    it('tracks current water level', () => {
      const lb = new LeakyBucket(10, 1)
      lb.pour(3)
      expect(lb.level).toBe(3)
    })

    it('starts at 0', () => {
      const lb = new LeakyBucket(10, 1)
      expect(lb.level).toBe(0)
    })
  })

  describe('available', () => {
    it('returns remaining capacity', () => {
      const lb = new LeakyBucket(10, 1)
      lb.pour(3)
      expect(lb.available).toBe(7)
    })
  })

  describe('isFull', () => {
    it('returns false when not full', () => {
      const lb = new LeakyBucket(10, 1)
      lb.pour(5)
      expect(lb.isFull).toBe(false)
    })

    it('returns true when full', () => {
      const lb = new LeakyBucket(5, 1)
      lb.pour(5)
      expect(lb.isFull).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears the bucket', () => {
      const lb = new LeakyBucket(10, 1)
      lb.pour(10)
      lb.reset()
      expect(lb.level).toBe(0)
      expect(lb.available).toBe(10)
    })
  })

  describe('leak behavior', () => {
    it('leaks over time', async () => {
      const lb = new LeakyBucket(10, 1000)
      lb.pour(10)
      await new Promise(r => setTimeout(r, 15))
      expect(lb.level).toBeLessThan(10)
    })
  })
})
