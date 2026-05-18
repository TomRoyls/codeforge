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
})
