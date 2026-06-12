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

  it('flush calls immediately', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced.flush()
    expect(fn).toHaveBeenCalled()
    vi.useRealTimers()
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

  // ─── Debounce edge cases ─────────────────────────────────────
  describe('debounce edge cases', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('cancel when not active (no pending call) - should be safe no-op', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.cancel()
      expect(fn).not.toHaveBeenCalled()
    })

    it('cancel before any debounce call - safe no-op', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.cancel()
      debounced()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('multiple cancels in succession - all safe', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.cancel()
      debounced.cancel()
      debounced.cancel()
      expect(fn).not.toHaveBeenCalled()
    })

    it('cancel after flush - safe no-op', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('test')
      debounced.flush()
      expect(fn).toHaveBeenCalledTimes(1)
      debounced.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('call after cancel - should work normally', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('first')
      debounced.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
      debounced('second')
      vi.advanceTimersByTime(150)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')
    })

    it('multiple flushes - second flush should be no-op', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('test')
      debounced.flush()
      expect(fn).toHaveBeenCalledTimes(1)
      debounced.flush()
      expect(fn).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('flush before any call - safe no-op', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.flush()
      expect(fn).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
    })

    it('rapid cancel/flush/cancel sequence', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('test')
      debounced.cancel()
      debounced.flush()
      debounced.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
    })

    it('debounce with 0ms delay', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 0)
      debounced('test')
      vi.runAllTimers()
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('test')
    })

    it('debounce preserves latest arguments through multiple calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('a', 1)
      debounced('b', 2)
      debounced('c', 3)
      debounced('d', 4)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('d', 4)
    })

    it('debounce with function that throws', () => {
      const fn = vi.fn()
      fn.mockImplementationOnce(() => { throw new Error('Test error') })
      const debounced = debounce(fn, 100)
      debounced()
      expect(() => vi.advanceTimersByTime(100)).toThrow('Test error')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Throttle edge cases ────────────────────────────────────
  describe('throttle edge cases', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('cancel when not throttled (no active timer) - safe no-op', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled.cancel()
      expect(fn).not.toHaveBeenCalled()
    })

    it('cancel before any throttle call - safe no-op', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled.cancel()
      throttled()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('multiple cancels - all safe', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled()
      throttled.cancel()
      throttled.cancel()
      throttled.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('call after cancel - should work normally (fresh start)', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('first')
      throttled('second')
      throttled.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
      throttled('third')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('third')
    })

    it('throttle with 0ms interval', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 0)
      throttled('a')
      throttled('b')
      throttled('c')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('throttle with multiple rapid calls then wait - trailing call fires', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('a')
      throttled('b')
      throttled('c')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('a')
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('b')
    })

    it('throttle cancel mid-interval stops trailing call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('first')
      throttled('second')
      expect(fn).toHaveBeenCalledTimes(1)
      throttled.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('throttle with function that throws', () => {
      const fn = vi.fn()
      fn.mockImplementationOnce(() => { throw new Error('Test error') })
      const throttled = throttle(fn, 100)
      expect(() => throttled()).toThrow('Test error')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('throttle exact boundary timing', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('first')
      expect(fn).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(100)
      throttled('second')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  // ─── Integration tests ───────────────────────────────────────
  describe('integration', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('multiple debounce instances dont interfere', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const debounced1 = debounce(fn1, 100)
      const debounced2 = debounce(fn2, 50)

      debounced1('a')
      debounced2('b')

      vi.advanceTimersByTime(50)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(fn1).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
    })

    it('multiple throttle instances dont interfere', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const throttled1 = throttle(fn1, 100)
      const throttled2 = throttle(fn2, 50)

      throttled1('a')
      throttled2('b')
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)

      throttled1('c')
      throttled2('d')

      vi.advanceTimersByTime(50)
      expect(fn2).toHaveBeenCalledTimes(2)
      expect(fn1).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      expect(fn1).toHaveBeenCalledTimes(2)
    })

    it('debounce and throttle on same function work independently', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      const throttled = throttle(fn, 50)

      debounced('debounce1')
      throttled('throttle1')

      expect(fn).toHaveBeenCalledTimes(1) // throttle fires immediately
      expect(fn).toHaveBeenCalledWith('throttle1')

      vi.advanceTimersByTime(50)
      throttled('throttle2')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('throttle2')

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(3)
      expect(fn).toHaveBeenLastCalledWith('debounce1')
    })
  })

  // ─── Additional behavior tests ───────────────────────────────
  describe('additional behaviors', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('flush after cancel with pending arguments uses latest args', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('first')
      debounced.cancel()
      debounced('second')
      debounced.flush()
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')
    })

    it('throttle cancel clears timer completely', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('first')
      throttled('second')
      throttled.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1) // Only first immediate call
    })

    it('debounce with very long delay eventually executes', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 10000)
      debounced('test')
      vi.advanceTimersByTime(5000)
      expect(fn).not.toHaveBeenCalled()
      vi.advanceTimersByTime(5000)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('test')
    })

    it('throttle rapid cancel and restart waits for interval', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('first')
      expect(fn).toHaveBeenCalledTimes(1)
      throttled('second')
      throttled.cancel()
      throttled('third')
      expect(fn).toHaveBeenCalledTimes(1) // Not called yet due to throttle
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith('third')
    })

    it('debounce with object arguments', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      const obj1 = { key: 'value1' }
      const obj2 = { key: 'value2' }
      debounced(obj1)
      debounced(obj2)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(obj2)
    })

    it('throttle with object arguments', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      const obj1 = { key: 'value1' }
      const obj2 = { key: 'value2' }
      throttled(obj1)
      expect(fn).toHaveBeenCalledWith(obj1)
      throttled(obj2)
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith(obj2)
    })
  })

  describe('debounce cancel', () => {
    it('should cancel pending debounced call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('a')
      debounced.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('debounce flush', () => {
    it('should flush pending call immediately', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('a')
      debounced.flush()
      expect(fn).toHaveBeenCalledWith('a')
    })

    it('should not call fn on flush if no pending', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced.flush()
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('throttle cancel', () => {
    it('should cancel pending throttled call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)
      throttled('a')
      expect(fn).toHaveBeenCalledTimes(1)
      throttled('b')
      throttled.cancel()
      vi.advanceTimersByTime(200)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('multiple debounce calls', () => {
    it('should use latest args', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)
      debounced('first')
      debounced('second')
      debounced('third')
      vi.advanceTimersByTime(150)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('third')
    })
  })
})
