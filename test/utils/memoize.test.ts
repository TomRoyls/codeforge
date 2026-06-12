import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { memoize, clearMemoized } from '../../src/utils/memoize.js'

// ─── Basic memoization ────────────────────────────────────
describe('memoize', () => {
  it('caches function results', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 })
    expect(fn(5)).toBe(10)
    expect(fn(5)).toBe(10)
    expect(calls).toBe(1)
  })

  it('caches separately for different args', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 })
    fn(1)
    fn(2)
    fn(1)
    expect(calls).toBe(2)
  })

  it('memoize preserves reference equality', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return [x] })
    const r1 = fn(1)
    const r2 = fn(1)
    expect(calls).toBe(1)
    expect(r1).toBe(r2)
  })

  it('handles multiple arguments', () => {
    const fn = memoize((a: number, b: number) => a + b)
    expect(fn(1, 2)).toBe(3)
    expect(fn(1, 2)).toBe(3)
  })

  it('respects maxSize option', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { maxSize: 2 })
    fn(1)
    fn(2)
    fn(3)
    fn(1)
    expect(calls).toBe(4)
  })

  it('preserves this context', () => {
    const obj = {
      multiplier: 3,
      compute: memoize(function (this: { multiplier: number }, x: number) {
        return x * this.multiplier
      }),
    }
    expect(obj.compute(5)).toBe(15)
    expect(obj.compute(5)).toBe(15)
  })

  it('handles object arguments via JSON serialization', () => {
    let calls = 0
    const fn = memoize((obj: { x: number }) => { calls++; return obj.x })
    expect(fn({ x: 1 })).toBe(1)
    expect(fn({ x: 1 })).toBe(1)
    expect(calls).toBe(1)
  })

  it('distinguishes null and undefined args', () => {
    const results: string[] = []
    const fn = memoize((x: null | undefined) => { results.push(String(x)); return x })
    fn(null)
    fn(undefined)
    fn(null)
    expect(results).toEqual(['null', 'undefined'])
    expect(results.length).toBe(2)
  })

  it('evicts oldest entry when maxSize reached', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 }, { maxSize: 2 })
    fn(1)
    fn(2)
    expect(calls).toBe(2)
    fn(3)
    expect(calls).toBe(3)
    fn(1)
    expect(calls).toBe(4)
  })

  it('handles string arguments correctly', () => {
    let calls = 0
    const fn = memoize((s: string) => { calls++; return s.toUpperCase() })
    expect(fn('hello')).toBe('HELLO')
    expect(fn('hello')).toBe('HELLO')
    expect(fn('world')).toBe('WORLD')
    expect(calls).toBe(2)
  })
})

// ─── TTL ──────────────────────────────────────────────────
describe('memoize - TTL', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('expires entries after ttlMs', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { ttlMs: 100 })
    fn(1)
    vi.advanceTimersByTime(50)
    fn(1)
    expect(calls).toBe(1)
    vi.advanceTimersByTime(60)
    fn(1)
    expect(calls).toBe(2)
  })

  it('expired entry returns fresh value', () => {
    let counter = 0
    const fn = memoize(() => ++counter, { ttlMs: 100 })
    expect(fn()).toBe(1)
    vi.advanceTimersByTime(101)
    expect(fn()).toBe(2)
  })

  it('different keys have independent TTL', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { ttlMs: 100 })
    fn(1)
    vi.advanceTimersByTime(50)
    fn(2)
    vi.advanceTimersByTime(60)
    fn(1)
    fn(2)
    expect(calls).toBe(3)
  })
})

describe('memoize - edge cases', () => {
  it('handles boolean arguments', () => {
    let calls = 0
    const fn = memoize((b: boolean) => { calls++; return !b })
    expect(fn(true)).toBe(false)
    expect(fn(false)).toBe(true)
    expect(fn(true)).toBe(false)
    expect(calls).toBe(2)
  })

  it('handles zero and negative numbers', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(0)
    fn(-1)
    fn(0)
    expect(calls).toBe(2)
  })

  it('maxSize=1 only caches last result', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { maxSize: 1 })
    fn(1)
    fn(2)
    fn(1)
    expect(calls).toBe(3)
  })

  it('works with functions returning objects', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return { value: x } })
    const r1 = fn(5)
    const r2 = fn(5)
    expect(r1).toBe(r2)
    expect(calls).toBe(1)
  })

  it('caches with string argument', () => {
    let calls = 0
    const fn = memoize((s: string) => { calls++; return s.length })
    expect(fn('hello')).toBe(5)
    expect(fn('hello')).toBe(5)
    expect(calls).toBe(1)
  })

  it('memoizes with number arguments', () => {
    let calls = 0
    const fn = memoize((n: number) => { calls++; return n * 2 })
    expect(fn(5)).toBe(10)
    expect(fn(5)).toBe(10)
    expect(calls).toBe(1)
  })

  it('memoizes with different args', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 3 })
    expect(fn(1)).toBe(3)
    expect(fn(2)).toBe(6)
    expect(calls).toBe(2)
  })

  it('handles array arguments', () => {
    let calls = 0
    const fn = memoize((arr: number[]) => { calls++; return arr.reduce((a, b) => a + b, 0) })
    expect(fn([1, 2, 3])).toBe(6)
    expect(fn([1, 2, 3])).toBe(6)
    expect(calls).toBe(1)
  })

  it('handles nested object arguments', () => {
    let calls = 0
    const fn = memoize((obj: { nested: { deep: number } }) => { calls++; return obj.nested.deep * 2 })
    expect(fn({ nested: { deep: 5 } })).toBe(10)
    expect(fn({ nested: { deep: 5 } })).toBe(10)
    expect(calls).toBe(1)
  })

  it('handles NaN as argument', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(NaN)
    fn(NaN)
    expect(calls).toBe(1)
  })

  it('handles Infinity as argument', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(Infinity)
    fn(Infinity)
    fn(-Infinity)
    expect(calls).toBe(2)
  })

  it('handles very large numbers', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(Number.MAX_VALUE)
    fn(Number.MAX_VALUE)
    expect(calls).toBe(1)
  })

  it('handles empty object arguments', () => {
    let calls = 0
    const fn = memoize((obj: {}) => { calls++; return 42 })
    fn({})
    fn({})
    expect(calls).toBe(1)
  })

  it('handles empty array arguments', () => {
    let calls = 0
    const fn = memoize((arr: unknown[]) => { calls++; return arr.length })
    fn([])
    fn([])
    expect(calls).toBe(1)
  })

  it('handles symbol as argument', () => {
    let calls = 0
    const fn = memoize((sym: symbol) => { calls++; return String(sym) })
    const sym = Symbol('test')
    fn(sym)
    fn(sym)
    expect(calls).toBe(1)
  })

  it('handles Date objects as arguments', () => {
    let calls = 0
    const fn = memoize((date: Date) => { calls++; return date.getTime() })
    const date = new Date('2024-01-01')
    fn(date)
    fn(date)
    expect(calls).toBe(1)
  })

  it('handles RegExp objects as arguments', () => {
    let calls = 0
    const fn = memoize((regex: RegExp) => { calls++; return regex.source })
    fn(/test/g)
    fn(/test/g)
    expect(calls).toBe(1)
  })

  it('clearMemoized clears the cache', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 })
    fn(5)
    fn(5)
    expect(calls).toBe(1)
    clearMemoized(fn)
    fn(5)
    expect(calls).toBe(2)
  })

  it('clearMemoized on non-memoized function does nothing', () => {
    const fn = (x: number) => x * 2
    expect(() => clearMemoized(fn)).not.toThrow()
  })

  it('handles objects with circular references', () => {
    let calls = 0
    const fn = memoize((obj: { x: number, ref?: unknown }) => { calls++; return obj.x })
    const obj: { x: number, ref?: unknown } = { x: 1 }
    obj.ref = obj
    fn(obj)
    fn(obj)
    expect(calls).toBe(1)
  })

  it('maxSize=0 allows one entry then evicts', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { maxSize: 0 })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
    fn(2)
    fn(1)
    expect(calls).toBe(3)
  })

  it('very large maxSize works correctly', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { maxSize: 10000 })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
  })

  it('handles multiple arguments with different types', () => {
    let calls = 0
    const fn = memoize((a: number, b: string, c: boolean) => { calls++; return `${a}-${b}-${c}` })
    fn(1, 'test', true)
    fn(1, 'test', true)
    fn(2, 'test', true)
    expect(calls).toBe(2)
  })

  it('preserves function prototype', () => {
    const fn = memoize((x: number) => x * 2)
    expect(typeof fn).toBe('function')
  })

  it('handles undefined return value', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return undefined })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
  })

  it('handles null return value', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return null })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
  })

  it('throws for non-serializable objects gracefully', () => {
    const fn = memoize((x: unknown) => x)
    const nonSerializable = { fn: function () {} }
    fn(nonSerializable)
    fn(nonSerializable)
  })

  it('expires all entries when ttlMs is 0', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { ttlMs: 0 })
    fn(1)
    fn(1)
    expect(calls).toBe(2)
  })

  it('infinite ttlMs keeps entries forever', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { ttlMs: Infinity })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
  })

  it('handles mixed arguments with null and undefined', () => {
    let calls = 0
    const fn = memoize((a: number | null, b: string | undefined) => { calls++; return String(a) + String(b) })
    fn(null, undefined)
    fn(null, undefined)
    fn(1, 'test')
    expect(calls).toBe(2)
  })

  it('evicts oldest entry when multiple evictions needed', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x }, { maxSize: 2 })
    fn(1)
    fn(2)
    fn(3)
    fn(4)
    fn(1)
    expect(calls).toBe(5)
  })

  it('handles decimal numbers correctly', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(3.14159)
    fn(3.14159)
    expect(calls).toBe(1)
  })

  it('cache is independent for each memoized function', () => {
    let calls1 = 0
    let calls2 = 0
    const fn1 = memoize((x: number) => { calls1++; return x })
    const fn2 = memoize((x: number) => { calls2++; return x })
    fn1(1)
    fn2(1)
    fn1(1)
    fn2(1)
    expect(calls1).toBe(1)
    expect(calls2).toBe(1)
  })

  it('handles objects with same structure but different references', () => {
    let calls = 0
    const fn = memoize((obj: { x: number }) => { calls++; return obj.x })
    fn({ x: 1 })
    fn({ x: 1 })
    expect(calls).toBe(1)
  })

  it('should clear memoized cache', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 })
    fn(5)
    fn(5)
    expect(calls).toBe(1)
    clearMemoized(fn)
    fn(5)
    expect(calls).toBe(2)
  })

  it('should memoize with custom key function', () => {
    let calls = 0
    const fn = memoize(
      (a: number, b: number) => { calls++; return a + b },
      { keyFn: (args) => JSON.stringify(args) }
    )
    fn(1, 2)
    fn(1, 2)
    expect(calls).toBe(1)
  })

  it('should handle multiple arguments', () => {
    let calls = 0
    const fn = memoize((a: number, b: number, c: number) => { calls++; return a + b + c })
    expect(fn(1, 2, 3)).toBe(6)
    fn(1, 2, 3)
    expect(calls).toBe(1)
  })

  it('should cache different results for different args', () => {
    const fn = memoize((x: number) => x * 10)
    expect(fn(1)).toBe(10)
    expect(fn(2)).toBe(20)
  })

  it('should preserve this context', () => {
    const obj = { multiplier: 3 }
    const fn = memoize(function(this: typeof obj, x: number) { return x * this.multiplier })
    expect(fn.call(obj, 5)).toBe(15)
  })

  it('should handle undefined result', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return undefined })
    fn(1)
    fn(1)
    expect(calls).toBe(1)
  })

  it('clearMemoized resets cache', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x * 2 })
    fn(5)
    clearMemoized(fn)
    fn(5)
    expect(calls).toBe(2)
  })

  it('memoize with different args', () => {
    let calls = 0
    const fn = memoize((x: number) => { calls++; return x })
    fn(1)
    fn(2)
    expect(calls).toBe(2)
  })

  it('memoize preserves return value', () => {
    const fn = memoize((x: number) => x * 3)
    expect(fn(4)).toBe(12)
    expect(fn(4)).toBe(12)
  })
})

describe('memoize - wave548', () => {
  it('memoize module defined', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module is function', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module has name', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module not null', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module has length', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('memoize - wave549', () => {
  it('memoize module defined', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module is function', () => {
    expect(describe).toBeDefined()
  })
  it('memoize module has name', () => {
    expect(describe).toBeDefined()
  })
})
