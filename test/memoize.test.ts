import { beforeEach, describe, expect, it, vi } from 'vitest'

import { memoize, type MemoizeOptions } from '../src/utils/memoize.js'

// ─── basic memoization ────────────────────────────────
describe('memoize basic', () => {
  it('caches function results', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(5)).toBe(10)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('caches different arguments separately', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(1)).toBe(2)
    expect(memoized(2)).toBe(4)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('handles multi-argument functions', () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const memoized = memoize(fn)

    expect(memoized(1, 2)).toBe(3)
    expect(memoized(1, 2)).toBe(3)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

// ─── TTL expiration ───────────────────────────────────
describe('memoize TTL', () => {
  it('recomputes after TTL expires', () => {
    vi.useFakeTimers()
    const fn = vi.fn((x: number) => x * 3)
    const memoized = memoize(fn, { ttlMs: 100 })

    expect(memoized(5)).toBe(15)
    vi.advanceTimersByTime(101)
    expect(memoized(5)).toBe(15)
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('returns cached value within TTL', () => {
    vi.useFakeTimers()
    const fn = vi.fn((x: number) => x)
    const memoized = memoize(fn, { ttlMs: 1000 })

    memoized(1)
    vi.advanceTimersByTime(500)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

// ─── maxSize eviction ─────────────────────────────────
describe('memoize maxSize', () => {
  it('evicts oldest entry when maxSize exceeded', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn, { maxSize: 2 })

    memoized(1)
    memoized(2)
    memoized(3)

    expect(fn).toHaveBeenCalledTimes(3)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(4)
  })
})

// ─── edge cases ───────────────────────────────────────
describe('memoize edge cases', () => {
  it('handles object arguments', () => {
    const fn = vi.fn((obj: { x: number }) => obj.x)
    const memoized = memoize(fn)

    expect(memoized({ x: 1 })).toBe(1)
    expect(memoized({ x: 1 })).toBe(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('handles null and undefined arguments', () => {
    const fn = vi.fn((x: unknown) => String(x))
    const memoized = memoize(fn)

    expect(memoized(null)).toBe('null')
    expect(memoized(undefined)).toBe('undefined')
  })

  it('preserves this context', () => {
    const obj = {
      multiplier: 10,
      compute(this: { multiplier: number }, x: number) {
        return x * this.multiplier
      },
    }
    const memoized = memoize(obj.compute.bind(obj))
    expect(memoized(5)).toBe(50)
  })
})
