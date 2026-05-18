import { describe, expect, it } from 'vitest'

import { Timer } from '../../../src/utils/timer.js'

describe('Timer', () => {
  describe('constructor', () => {
    it('starts timing immediately', () => {
      const timer = new Timer()
      expect(timer.isRunning()).toBe(true)
    })
  })

  describe('stop', () => {
    it('returns elapsed time in milliseconds', () => {
      const timer = new Timer()
      const elapsed = timer.stop()
      expect(typeof elapsed).toBe('number')
      expect(elapsed).toBeGreaterThanOrEqual(0)
    })

    it('stops the timer', () => {
      const timer = new Timer()
      timer.stop()
      expect(timer.isRunning()).toBe(false)
    })

    it('returns consistent values on multiple calls', () => {
      const timer = new Timer()
      const first = timer.stop()
      const second = timer.stop()
      expect(first).toBe(second)
    })
  })

  describe('elapsed', () => {
    it('returns time without stopping', () => {
      const timer = new Timer()
      const elapsed = timer.elapsed()
      expect(timer.isRunning()).toBe(true)
      expect(typeof elapsed).toBe('number')
      expect(elapsed).toBeGreaterThanOrEqual(0)
    })

    it('returns same value as stop after stopping', () => {
      const timer = new Timer()
      const stopped = timer.stop()
      const elapsed = timer.elapsed()
      expect(elapsed).toBe(stopped)
    })
  })

  describe('elapsedSeconds', () => {
    it('converts milliseconds to seconds', () => {
      const timer = new Timer()
      timer.stop()
      const seconds = timer.elapsedSeconds()
      expect(typeof seconds).toBe('number')
      expect(seconds).toBeGreaterThanOrEqual(0)
    })
  })

  describe('elapsedNanoseconds', () => {
    it('converts to nanoseconds', () => {
      const timer = new Timer()
      timer.stop()
      const ns = timer.elapsedNanoseconds()
      expect(typeof ns).toBe('number')
      expect(ns).toBeGreaterThanOrEqual(0)
      expect(ns).toBe(timer.elapsed() * 1_000_000)
    })
  })

  describe('reset', () => {
    it('restarts the timer', () => {
      const timer = new Timer()
      timer.stop()
      expect(timer.isRunning()).toBe(false)
      timer.reset()
      expect(timer.isRunning()).toBe(true)
    })
  })

  describe('Timer.measure', () => {
    it('measures synchronous function execution', () => {
      const { elapsed, result } = Timer.measure(() => 42)
      expect(result).toBe(42)
      expect(typeof elapsed).toBe('number')
      expect(elapsed).toBeGreaterThanOrEqual(0)
    })

    it('measures function that throws', () => {
      expect(() =>
        Timer.measure(() => {
          throw new Error('boom')
        }),
      ).toThrow('boom')
    })

    it('measures function with object result', () => {
      const { result } = Timer.measure(() => ({ name: 'test', value: 123 }))
      expect(result).toEqual({ name: 'test', value: 123 })
    })
  })

  describe('Timer.measureAsync', () => {
    it('measures async function execution', async () => {
      const { elapsed, result } = await Timer.measureAsync(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1))
        return 'done'
      })
      expect(result).toBe('done')
      expect(elapsed).toBeGreaterThanOrEqual(0)
    })

    it('measures async function that rejects', async () => {
      await expect(
        Timer.measureAsync(async () => {
          throw new Error('async boom')
        }),
      ).rejects.toThrow('async boom')
    })
  })
})
