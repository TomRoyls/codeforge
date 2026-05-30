import { describe, test, expect, vi, afterEach } from 'vitest'
import { debounce, throttle } from '../../../src/utils/debounce.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('debounce', () => {
  test('delays function execution by specified ms', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('test')
  })

  test('resets timer on subsequent calls (only last call executes)', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    debounced('second')
    debounced('third')

    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })

  test('cancel() prevents execution', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test')
    expect(fn).not.toHaveBeenCalled()

    debounced.cancel()

    vi.advanceTimersByTime(100)
    expect(fn).not.toHaveBeenCalled()
  })

  test('flush() executes immediately with last args', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test1')
    debounced('test2')

    expect(fn).not.toHaveBeenCalled()

    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('test2')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('flush() on non-pending timer does nothing', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced.flush()
    expect(fn).not.toHaveBeenCalled()

    debounced('test')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('handles multiple arguments', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 50)

    debounced('arg1', 'arg2', 'arg3')

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  test('cancel() and then calling again works', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test1')
    debounced.cancel()

    debounced('test2')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('test2')
  })

  test('flush() after cancel() does nothing', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('test')
    debounced.cancel()
    debounced.flush()

    expect(fn).not.toHaveBeenCalled()
  })
})

describe('throttle', () => {
  test('executes immediately on first call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('test')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('test')
  })

  test('does not execute more than once per interval', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('call1')
    expect(fn).toHaveBeenCalledTimes(1)

    throttled('call2')
    throttled('call3')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('queues a trailing call if called during cooldown', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
  })

  test('cancel() clears pending trailing call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    expect(fn).toHaveBeenCalledTimes(1)

    throttled.cancel()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('respects interval after first execution', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('call1')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50)
    throttled('call2')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('executes immediately when interval has passed', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('call1')
    vi.advanceTimersByTime(100)

    throttled('call2')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'call1')
    expect(fn).toHaveBeenNthCalledWith(2, 'call2')
  })

  test('handles multiple arguments', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 50)

    throttled('arg1', 'arg2', 'arg3')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  test('cancel() before interval ends works', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled.cancel()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('multiple calls during interval queue only first trailing call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    throttled('second')
    throttled('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
  })

  test('continues working after interval passes', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 50)

    throttled('call1')
    vi.advanceTimersByTime(50)

    throttled('call2')
    vi.advanceTimersByTime(50)

    throttled('call3')
    vi.advanceTimersByTime(50)

    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenNthCalledWith(1, 'call1')
    expect(fn).toHaveBeenNthCalledWith(2, 'call2')
    expect(fn).toHaveBeenNthCalledWith(3, 'call3')
  })
})