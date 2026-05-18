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
})
