import { describe, it, expect } from 'vitest'
import { Timer } from '../../src/utils/timer.js'

// ─── Basic timing ─────────────────────────────────────────
describe('Timer - basic', () => {
  it('measures elapsed time', () => {
    const timer = new Timer()
    const busy = 0; void busy
    for (let i = 0; i < 1000000; i++) { void i }
    const ms = timer.stop()
    expect(ms).toBeGreaterThanOrEqual(0)
  })

  it('stop returns same value on repeated calls', () => {
    const timer = new Timer()
    const first = timer.stop()
    const second = timer.stop()
    expect(second).toBe(first)
  })

  it('isRunning reflects state', () => {
    const timer = new Timer()
    expect(timer.isRunning()).toBe(true)
    timer.stop()
    expect(timer.isRunning()).toBe(false)
  })
})

// ─── Static measure ───────────────────────────────────────
describe('Timer - measure', () => {
  it('measure returns result and elapsed', () => {
    const { result, elapsed } = Timer.measure(() => 42)
    expect(result).toBe(42)
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('measureAsync returns result and elapsed', async () => {
    const { result, elapsed } = await Timer.measureAsync(async () => {
      return 'hello'
    })
    expect(result).toBe('hello')
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })
})

// ─── Utility methods ──────────────────────────────────────
describe('Timer - utility', () => {
  it('elapsedSeconds returns time in seconds', () => {
    const timer = new Timer()
    timer.stop()
    expect(timer.elapsedSeconds()).toBeGreaterThanOrEqual(0)
  })

  it('elapsedNanoseconds returns time in nanoseconds', () => {
    const timer = new Timer()
    timer.stop()
    expect(timer.elapsedNanoseconds()).toBeGreaterThanOrEqual(0)
  })

  it('reset restarts the timer', () => {
    const timer = new Timer()
    timer.stop()
    expect(timer.isRunning()).toBe(false)
    timer.reset()
    expect(timer.isRunning()).toBe(true)
  })

  it('elapsed works while running (not stopped)', () => {
    const timer = new Timer()
    const ms = timer.elapsed()
    expect(ms).toBeGreaterThanOrEqual(0)
    expect(timer.isRunning()).toBe(true)
  })

  it('elapsed after stop equals stop value', () => {
    const timer = new Timer()
    const stopped = timer.stop()
    expect(timer.elapsed()).toBe(stopped)
  })

  it('elapsedSeconds returns fraction of a second', () => {
    const timer = new Timer()
    timer.stop()
    const secs = timer.elapsedSeconds()
    expect(secs).toBeGreaterThanOrEqual(0)
    expect(typeof secs).toBe('number')
  })

  it('elapsedNanoseconds is 1e6 times elapsed ms', () => {
    const timer = new Timer()
    timer.stop()
    const ms = timer.elapsed()
    const ns = timer.elapsedNanoseconds()
    expect(ns).toBeCloseTo(ms * 1_000_000, -3)
  })

  it('measureAsync works with rejected promise', async () => {
    await expect(
      Timer.measureAsync(async () => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
  })

  it('multiple resets work correctly', () => {
    const timer = new Timer()
    timer.stop()
    timer.reset()
    timer.stop()
    timer.reset()
    expect(timer.isRunning()).toBe(true)
    const ms = timer.stop()
    expect(ms).toBeGreaterThanOrEqual(0)
  })

  it('measure captures synchronous work', () => {
    const { result, elapsed } = Timer.measure(() => {
      let sum = 0
      for (let i = 0; i < 10000; i++) sum += i
      return sum
    })
    expect(result).toBe(49995000)
    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('isRunning starts as true', () => {
    const timer = new Timer()
    expect(timer.isRunning()).toBe(true)
  })

  it('stop returns number', () => {
    const timer = new Timer()
    const ms = timer.stop()
    expect(typeof ms).toBe('number')
    expect(ms).toBeGreaterThanOrEqual(0)
  })

  it('reset allows re-measuring', () => {
    const timer = new Timer()
    timer.stop()
    timer.reset()
    const ms = timer.stop()
    expect(ms).toBeGreaterThanOrEqual(0)
  })

  it('elapsed returns time since start', () => {
    const timer = new Timer()
    const ms = timer.elapsed()
    expect(ms).toBeGreaterThanOrEqual(0)
  })
})
