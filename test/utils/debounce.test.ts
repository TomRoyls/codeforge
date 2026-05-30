import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle } from '../../src/utils/debounce.js'

// ─── Debounce ─────────────────────────────────────────────
describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('does not call function immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    expect(fn).not.toHaveBeenCalled()
  })

  it('calls function after delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a')
    debounced('b')
    debounced('c')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('cancel prevents execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })

  it('flush executes immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('hello')
    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('hello')
    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('flush does nothing if no pending call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced.flush()
    expect(fn).not.toHaveBeenCalled()
  })
})

// ─── Throttle ─────────────────────────────────────────────
describe('throttle', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not call again within interval', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls again after interval', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('cancel prevents trailing call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    throttled.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttle passes arguments', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('arg1', 'arg2')
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('throttle trailing call uses latest args', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled('first')
    throttled('second')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('second')
  })

  it('debounce works with multiple arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('a', 'b', 'c')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('a', 'b', 'c')
  })

  it('debounce can be called again after flush', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('first')
    debounced.flush()
    debounced('second')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('throttle handles rapid calls correctly', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 50)
    throttled()
    throttled()
    throttled()
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('debounce cancel prevents execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced('test')
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })
})
