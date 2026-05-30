import { describe, expect, it, afterEach, vi } from 'vitest'

import { TTLCache } from '../../../src/utils/ttl-cache.js'

describe('TTLCache', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates defaultTTL is positive', () => {
    expect(() => new TTLCache({ defaultTTL: 0 })).toThrow(RangeError)
    expect(() => new TTLCache({ defaultTTL: -1 })).toThrow(RangeError)
  })

  it('stores and retrieves values', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.get('x')).toBeUndefined()
  })

  it('evicts expired entries on get', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(101)
    expect(cache.get('a')).toBeUndefined()
  })

  it('evicts expired entries on has', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(101)
    expect(cache.has('a')).toBe(false)
  })

  it('has returns true for non-expired', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('supports custom TTL per entry', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1, 50)
    cache.set('b', 2, 5000)
    vi.advanceTimersByTime(100)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
  })

  it('validates custom TTL is positive', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(() => cache.set('a', 1, 0)).toThrow(RangeError)
  })

  it('evicts oldest when maxSize exceeded', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000, maxSize: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('delete removes entry', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
  })

  it('peek returns value without affecting order', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    expect(cache.peek('a')).toBe(1)
  })

  it('getTTL returns remaining time', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 1000 })
    cache.set('a', 1)
    vi.advanceTimersByTime(400)
    const remaining = cache.getTTL('a')
    expect(remaining).toBeGreaterThan(500)
    expect(remaining).toBeLessThanOrEqual(600)
  })

  it('getTTL returns -1 for missing key', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.getTTL('x')).toBe(-1)
  })

  it('touch extends TTL', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(50)
    expect(cache.touch('a')).toBe(true)
    vi.advanceTimersByTime(60)
    expect(cache.get('a')).toBe(1)
  })

  it('touch returns false for missing key', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.touch('x')).toBe(false)
  })

  it('clear removes all entries', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('purgeExpired removes only expired entries', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string, number>({ defaultTTL: 100 })
    cache.set('a', 1)
    cache.set('b', 2)
    vi.advanceTimersByTime(101)
    cache.set('c', 3)
    const purged = cache.purgeExpired()
    expect(purged).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('size returns current entry count', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
  })

  it('isEmpty returns true when empty', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.isEmpty).toBe(true)
    cache.set('a', 1)
    expect(cache.isEmpty).toBe(false)
  })

  it('keys returns all keys', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    cache.set('b', 2)
    const keys = cache.keys()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('values returns non-expired values', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    cache.set('b', 2)
    const vals = cache.values()
    expect(vals).toHaveLength(2)
  })

  it('tracks hit and miss stats', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('x')
    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })

  it('hitRate is 0 with no accesses', () => {
    const cache = new TTLCache<string, number>({ defaultTTL: 5000 })
    expect(cache.getStats().hitRate).toBe(0)
  })
})
