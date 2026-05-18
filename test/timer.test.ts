import { describe, it, expect } from 'vitest'
import { Timer } from '../src/utils/timer.js'

// ─── Timer Constructor ────────────────────────────────
describe('Timer constructor', () => {
  it('creates a running timer', () => {
    const timer = new Timer()
    expect(timer.isRunning()).toBe(true)
  })
})

// ─── Timer.stop ───────────────────────────────────────
describe('Timer.stop', () => {
  it('returns elapsed milliseconds', () => {
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

  it('returns same value on repeated calls', () => {
    const timer = new Timer()
    const first = timer.stop()
    const second = timer.stop()
    expect(first).toBe(second)
  })
})

// ─── Timer.elapsed ────────────────────────────────────
describe('Timer.elapsed', () => {
  it('returns elapsed while running', () => {
    const timer = new Timer()
    const elapsed = timer.elapsed()
    expect(typeof elapsed).toBe('number')
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('returns elapsed after stop', () => {
    const timer = new Timer()
    timer.stop()
    const elapsed = timer.elapsed()
    expect(typeof elapsed).toBe('number')
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })
})

// ─── Timer.elapsedSeconds ─────────────────────────────
describe('Timer.elapsedSeconds', () => {
  it('returns seconds', () => {
    const timer = new Timer()
    const secs = timer.elapsedSeconds()
    expect(typeof secs).toBe('number')
    expect(secs).toBeGreaterThanOrEqual(0)
  })

  it('is elapsed divided by 1000', () => {
    const timer = new Timer()
    const ms = timer.elapsed()
    const secs = timer.elapsedSeconds()
    expect(Math.abs(secs - ms / 1000)).toBeLessThan(0.01)
  })
})

// ─── Timer.elapsedNanoseconds ─────────────────────────
describe('Timer.elapsedNanoseconds', () => {
  it('returns nanoseconds', () => {
    const timer = new Timer()
    const ns = timer.elapsedNanoseconds()
    expect(typeof ns).toBe('number')
    expect(ns).toBeGreaterThanOrEqual(0)
  })

  it('is elapsed multiplied by 1_000_000', () => {
    const timer = new Timer()
    const ms = timer.elapsed()
    const ns = timer.elapsedNanoseconds()
    expect(Math.abs(ns - ms * 1_000_000)).toBeLessThan(1_000_000)
  })
})

// ─── Timer.reset ──────────────────────────────────────
describe('Timer.reset', () => {
  it('restarts the timer', () => {
    const timer = new Timer()
    timer.stop()
    expect(timer.isRunning()).toBe(false)
    timer.reset()
    expect(timer.isRunning()).toBe(true)
  })

  it('allows measuring again after reset', () => {
    const timer = new Timer()
    const first = timer.stop()
    timer.reset()
    const second = timer.stop()
    expect(typeof second).toBe('number')
    expect(second).toBeGreaterThanOrEqual(0)
  })
})

// ─── Timer.measure ────────────────────────────────────
describe('Timer.measure', () => {
  it('measures synchronous function', () => {
    const { elapsed, result } = Timer.measure(() => 42)
    expect(result).toBe(42)
    expect(typeof elapsed).toBe('number')
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('measures function that throws', () => {
    expect(() => Timer.measure(() => { throw new Error('boom') })).toThrow('boom')
  })

  it('returns elapsed time for slow function', () => {
    const { elapsed } = Timer.measure(() => {
      let sum = 0
      for (let i = 0; i < 1_000_000; i++) sum += i
      return sum
    })
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })
})

// ─── Timer.measureAsync ───────────────────────────────
describe('Timer.measureAsync', () => {
  it('measures async function', async () => {
    const { elapsed, result } = await Timer.measureAsync(async () => 'hello')
    expect(result).toBe('hello')
    expect(typeof elapsed).toBe('number')
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('measures async function with delay', async () => {
    const { elapsed } = await Timer.measureAsync(
      () => new Promise((resolve) => setTimeout(resolve, 10)),
    )
    expect(elapsed).toBeGreaterThanOrEqual(10)
  })
})
