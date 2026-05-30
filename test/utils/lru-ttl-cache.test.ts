import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { LRUTTLCache } from '../../src/utils/lru-ttl-cache.js'

describe('LRUTTLCache', () => {
  it('sets and gets values', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('evicts LRU when size exceeded', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 2, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('evicts expired entries on get', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    expect(cache.get('a')).toBeUndefined()
    vi.useRealTimers()
  })

  it('has returns false for expired entries', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    expect(cache.has('a')).toBe(false)
    vi.useRealTimers()
  })

  it('has returns true for valid entries', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('delete removes entries', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
  })

  it('clear removes all entries', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('tracks hits and misses', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    expect(cache.hits).toBe(1)
    expect(cache.misses).toBe(1)
  })

  it('computes hitRate', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('a')
    cache.get('missing')
    expect(cache.hitRate).toBeCloseTo(2 / 3)
  })

  it('custom TTL per entry', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('short', 1, 50)
    cache.set('long', 2, 200)
    vi.advanceTimersByTime(100)
    expect(cache.get('short')).toBeUndefined()
    expect(cache.get('long')).toBe(2)
    vi.useRealTimers()
  })

  it('overwriting key resets TTL and LRU position', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 2, defaultTTL: 100 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('a', 10)
    vi.advanceTimersByTime(50)
    cache.set('c', 3)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe(10)
    vi.useRealTimers()
  })

  it('throws for invalid maxSize', () => {
    expect(() => new LRUTTLCache<string, number>({ maxSize: 0, defaultTTL: 100 })).toThrow()
  })

  it('throws for invalid TTL', () => {
    expect(() => new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 0 })).toThrow()
  })

  it('get refreshes LRU position', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 2, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeUndefined()
  })

  it('eviction counter tracks all evictions', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 1, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.evictions).toBe(2)
  })
})
