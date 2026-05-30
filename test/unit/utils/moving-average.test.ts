import { describe, it, expect } from 'vitest'
import { MovingAverage } from '../../../src/utils/moving-average.js'

describe('MovingAverage', () => {
  describe('push and average', () => {
    it('computes average of values', () => {
      const ma = new MovingAverage(3)
      ma.push(10)
      ma.push(20)
      ma.push(30)
      expect(ma.average).toBeCloseTo(20)
    })

    it('slides window when full', () => {
      const ma = new MovingAverage(3)
      ma.push(10)
      ma.push(20)
      ma.push(30)
      ma.push(40)
      expect(ma.average).toBeCloseTo(30)
      expect(ma.size).toBe(3)
    })

    it('returns 0 for empty window', () => {
      const ma = new MovingAverage()
      expect(ma.average).toBe(0)
    })
  })

  describe('min and max', () => {
    it('returns min value', () => {
      const ma = new MovingAverage(5)
      ma.push(10)
      ma.push(5)
      ma.push(20)
      expect(ma.min).toBe(5)
    })

    it('returns max value', () => {
      const ma = new MovingAverage(5)
      ma.push(10)
      ma.push(5)
      ma.push(20)
      expect(ma.max).toBe(20)
    })

    it('returns 0 for empty', () => {
      const ma = new MovingAverage()
      expect(ma.min).toBe(0)
      expect(ma.max).toBe(0)
    })
  })

  describe('variance and stddev', () => {
    it('computes variance', () => {
      const ma = new MovingAverage(5)
      ma.push(4)
      ma.push(5)
      ma.push(5)
      ma.push(7)
      ma.push(9)
      expect(ma.variance).toBeCloseTo(3.2)
    })

    it('computes stddev', () => {
      const ma = new MovingAverage(5)
      ma.push(4)
      ma.push(5)
      ma.push(5)
      ma.push(7)
      ma.push(9)
      expect(ma.stddev).toBeCloseTo(Math.sqrt(3.2))
    })
  })

  describe('reset', () => {
    it('clears all data', () => {
      const ma = new MovingAverage(5)
      ma.push(10)
      ma.push(20)
      ma.reset()
      expect(ma.size).toBe(0)
      expect(ma.average).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns current window', () => {
      const ma = new MovingAverage(3)
      ma.push(1)
      ma.push(2)
      ma.push(3)
      ma.push(4)
      expect(ma.toArray()).toEqual([2, 3, 4])
    })
  })

  describe('windowSize', () => {
    it('returns configured window size', () => {
      const ma = new MovingAverage(7)
      expect(ma.windowSize).toBe(7)
    })
  })
})
