import { describe, it, expect } from 'vitest'
import { ExponentialMovingAverage, DoubleExponentialMovingAverage } from '../../../src/utils/exponential-moving-average.js'

describe('ExponentialMovingAverage', () => {
  describe('construction', () => {
    it('creates with default alpha', () => {
      const ema = new ExponentialMovingAverage()
      expect(ema.value).toBe(0)
      expect(ema.count).toBe(0)
    })

    it('rejects invalid alpha', () => {
      expect(() => new ExponentialMovingAverage(0)).toThrow()
      expect(() => new ExponentialMovingAverage(1.5)).toThrow()
    })

    it('accepts alpha = 1', () => {
      const ema = new ExponentialMovingAverage(1)
      ema.push(42)
      expect(ema.value).toBe(42)
    })
  })

  describe('push', () => {
    it('first value becomes the EMA', () => {
      const ema = new ExponentialMovingAverage(0.5)
      ema.push(100)
      expect(ema.value).toBe(100)
    })

    it('smooths subsequent values', () => {
      const ema = new ExponentialMovingAverage(0.5)
      ema.push(100)
      ema.push(200)
      expect(ema.value).toBe(150)
    })

    it('higher alpha responds faster', () => {
      const fast = new ExponentialMovingAverage(0.5)
      const slow = new ExponentialMovingAverage(0.1)
      fast.push(100)
      fast.push(200)
      slow.push(100)
      slow.push(200)
      expect(fast.value).toBeGreaterThan(slow.value)
    })

    it('tracks count', () => {
      const ema = new ExponentialMovingAverage()
      ema.push(1)
      ema.push(2)
      ema.push(3)
      expect(ema.count).toBe(3)
    })
  })

  describe('reset', () => {
    it('clears state', () => {
      const ema = new ExponentialMovingAverage()
      ema.push(42)
      ema.reset()
      expect(ema.value).toBe(0)
      expect(ema.count).toBe(0)
    })
  })
})

describe('DoubleExponentialMovingAverage', () => {
  describe('push', () => {
    it('computes level and trend', () => {
      const dema = new DoubleExponentialMovingAverage(0.5)
      dema.push(100)
      dema.push(110)
      dema.push(120)
      expect(dema.level).toBeGreaterThan(100)
      expect(dema.trend).toBeGreaterThan(0)
    })
  })

  describe('forecast', () => {
    it('projects future values', () => {
      const dema = new DoubleExponentialMovingAverage(0.5)
      dema.push(100)
      dema.push(110)
      dema.push(120)
      const forecast = dema.forecast(2)
      expect(forecast).toBeGreaterThan(120)
    })
  })

  describe('reset', () => {
    it('clears state', () => {
      const dema = new DoubleExponentialMovingAverage()
      dema.push(100)
      dema.reset()
      expect(dema.count).toBe(0)
    })
  })
})
