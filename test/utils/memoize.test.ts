import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { memoize } from '../../src/utils/memoize.js'

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

  it('handles no arguments', () => {
    let calls = 0
    const fn = memoize(() => { calls++; return 42 })
    fn()
    fn()
    expect(calls).toBe(1)
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
})
