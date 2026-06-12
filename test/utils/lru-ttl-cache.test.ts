import { describe, expect, it, vi } from 'vitest'
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

  it('delete returns false for missing key', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(cache.delete('missing')).toBe(false)
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

  it('hitRate is 0 when no operations', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(cache.hitRate).toBe(0)
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

  it('throws for negative maxSize', () => {
    expect(() => new LRUTTLCache<string, number>({ maxSize: -1, defaultTTL: 100 })).toThrow()
  })

  it('throws for invalid TTL in constructor', () => {
    expect(() => new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 0 })).toThrow()
  })

  it('throws for negative TTL in constructor', () => {
    expect(() => new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: -100 })).toThrow()
  })

  it('throws for invalid TTL in set', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(() => cache.set('a', 1, 0)).toThrow()
  })

  it('throws for negative TTL in set', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(() => cache.set('a', 1, -100)).toThrow()
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

  it('eviction counter includes expired entries', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    cache.get('a')
    expect(cache.evictions).toBe(1)
    vi.useRealTimers()
  })

  it('toString returns formatted string', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 1000 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.toString()).toBe('LRUTTLCache(2/5, ttl=1000)')
  })

  it('toString for empty cache', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 5000 })
    expect(cache.toString()).toBe('LRUTTLCache(0/10, ttl=5000)')
  })

  it('toJSON returns array of key-value pairs', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    const json = cache.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json).toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
  })

  it('toJSON for empty cache returns empty array', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(cache.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    const clone = cache.clone()
    clone.set('c', 3)
    expect(cache.get('c')).toBeUndefined()
    expect(clone.get('a')).toBe(1)
  })

  it('clone preserves TTL and configuration', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 3, defaultTTL: 500 })
    cache.set('a', 1)
    const clone = cache.clone()
    expect(clone.toString()).toBe('LRUTTLCache(1/3, ttl=500)')
  })

  it('clone returns true for equal caches', () => {
    const cache1 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache1.set('a', 1)
    cache1.set('b', 2)
    const cache2 = cache1.clone()
    expect(cache1.equals(cache2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const cache1 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache1.set('a', 1)
    const cache2 = new LRUTTLCache<string, number>({ maxSize: 3, defaultTTL: 10000 })
    cache2.set('a', 1)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for different TTL', () => {
    const cache1 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 1000 })
    const cache2 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 5000 })
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for different content', () => {
    const cache1 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache1.set('a', 1)
    const cache2 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache2.set('a', 2)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for non-cache objects', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    expect(cache.equals(null)).toBe(false)
    expect(cache.equals({})).toBe(false)
    expect(cache.equals(123)).toBe(false)
  })

  it('equals handles NaN values correctly', () => {
    const cache1 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache1.set('a', NaN)
    const cache2 = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache2.set('a', NaN)
    expect(cache1.equals(cache2)).toBe(true)
  })

  it('size counts only non-expired entries', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    cache.set('b', 2)
    vi.advanceTimersByTime(150)
    expect(cache.size).toBe(0)
    vi.useRealTimers()
  })

  it('size getter triggers eviction', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    cache.size
    expect(cache.evictions).toBe(1)
    vi.useRealTimers()
  })

  it('handles object values', () => {
    const cache = new LRUTTLCache<string, { x: number }>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('obj', { x: 42 })
    expect(cache.get('obj')).toEqual({ x: 42 })
  })

  it('handles null values', () => {
    const cache = new LRUTTLCache<string, null>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('null', null)
    expect(cache.get('null')).toBe(null)
  })

  it('handles undefined values', () => {
    const cache = new LRUTTLCache<string, undefined>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('undef', undefined)
    expect(cache.get('undef')).toBe(undefined)
  })

  it('multiple gets increment hits correctly', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('a')
    cache.get('a')
    expect(cache.hits).toBe(3)
    expect(cache.misses).toBe(0)
  })

  it('misses increment for expired entries', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    cache.get('a')
    expect(cache.misses).toBe(1)
    vi.useRealTimers()
  })

  it('evicts expired entries when reaching maxSize', () => {
    vi.useFakeTimers()
    const cache = new LRUTTLCache<string, number>({ maxSize: 2, defaultTTL: 100 })
    cache.set('a', 1)
    vi.advanceTimersByTime(150)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
    expect(cache.get('a')).toBeUndefined()
    vi.useRealTimers()
  })

  it('preserves insertion order in toJSON', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const json = cache.toJSON()
    expect(json).toEqual([['a', 1], ['b', 2], ['c', 3]])
  })

  it('handles number keys', () => {
    const cache = new LRUTTLCache<number, string>({ maxSize: 5, defaultTTL: 10000 })
    cache.set(1, 'one')
    cache.set(2, 'two')
    expect(cache.get(1)).toBe('one')
    expect(cache.get(2)).toBe('two')
  })

  it('has returns false for missing key', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 10000 })
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('should report hit rate', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.get('c')
    expect(cache.hitRate).toBeGreaterThan(0)
    expect(cache.hitRate).toBeLessThanOrEqual(1)
  })

  it('should report hits and misses', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    expect(cache.hits).toBe(1)
    expect(cache.misses).toBe(1)
  })

  it('should convert to string', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 5000 })
    expect(cache.toString()).toContain('LRUTTLCache')
  })

  it('should convert to JSON', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('x', 42)
    const json = cache.toJSON() as Array<[string, number]>
    expect(json).toEqual([['x', 42]])
  })

  it('should clone cache', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('a', 1)
    const cloned = cache.clone()
    expect(cloned.get('a')).toBe(1)
    expect(cloned.equals(cache)).toBe(true)
  })

  it('should check equality', () => {
    const c1 = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    const c2 = new LRUTTLCache<string, number>({ maxSize: 10, defaultTTL: 60000 })
    c1.set('a', 1)
    c2.set('a', 1)
    expect(c1.equals(c2)).toBe(true)
  })

  it('has returns false for missing', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 1000 })
    expect(cache.has('missing')).toBe(false)
  })

  it('delete removes entry', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 1000 })
    cache.set('a', 1)
    cache.delete('a')
    expect(cache.get('a')).toBeUndefined()
  })

  it('size tracks entries', () => {
    const cache = new LRUTTLCache<string, number>({ maxSize: 5, defaultTTL: 1000 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('get missing returns undefined', () => {
    const c = new LRUTTLCache<string, number>({ maxSize: 5, ttl: 1000 })
    expect(c.get('missing')).toBeUndefined()
  })

  it('has returns boolean', () => {
    const c = new LRUTTLCache<string, number>({ maxSize: 5, ttl: 1000 })
    expect(c.has('missing')).toBe(false)
  })

  it('set and get', () => {
    const c = new LRUTTLCache<string, number>({ maxSize: 5, ttl: 1000 })
    c.set('a', 1)
    expect(c.get('a')).toBe(1)
  })
})
