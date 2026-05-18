import { describe, expect, it } from 'vitest'
import { TTLCache } from '../../../src/core/cache-manager/ttl-cache.js'

// ─── Construction ───

describe('TTLCache construction', () => {
  it('creates an empty cache', () => {
    const cache = new TTLCache()
    expect(cache.getStats().size).toBe(0)
    expect(cache.getStats().entries).toBe(0)
  })

  it('starts with zero hits, misses, and evictions', () => {
    const cache = new TTLCache()
    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.evictions).toBe(0)
    expect(stats.hitRate).toBe(0)
  })
})

// ─── set() & get() ───

describe('TTLCache set & get', () => {
  it('stores and retrieves a value', () => {
    const cache = new TTLCache()
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('returns undefined for missing key', () => {
    const cache = new TTLCache()
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const cache = new TTLCache()
    cache.set('k', 'old')
    cache.set('k', 'new')
    expect(cache.get('k')).toBe('new')
  })

  it('stores various value types', () => {
    const cache = new TTLCache()
    cache.set('str', 'hello')
    cache.set('num', 42)
    cache.set('bool', true)
    cache.set('obj', { a: 1 })
    cache.set('arr', [1, 2, 3])
    cache.set('null', null)
    expect(cache.get('str')).toBe('hello')
    expect(cache.get('num')).toBe(42)
    expect(cache.get('bool')).toBe(true)
    expect(cache.get('obj')).toEqual({ a: 1 })
    expect(cache.get('arr')).toEqual([1, 2, 3])
    expect(cache.get('null')).toBeNull()
  })

  it('uses default TTL of 60000ms', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    const remaining = cache.getRemainingTTL('k')
    expect(remaining).toBeGreaterThan(59000)
    expect(remaining).toBeLessThanOrEqual(60000)
  })

  it('accepts custom TTL', () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 1000)
    const remaining = cache.getRemainingTTL('k')
    expect(remaining).toBeGreaterThan(900)
    expect(remaining).toBeLessThanOrEqual(1000)
  })

  it('increments misses for missing key', () => {
    const cache = new TTLCache()
    cache.get('missing')
    expect(cache.getStats().misses).toBe(1)
  })

  it('increments hits for existing key', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    cache.get('k')
    expect(cache.getStats().hits).toBe(1)
  })
})

// ─── Expiration ───

describe('TTLCache expiration', () => {
  it('returns undefined for expired entry', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    expect(cache.get('k')).toBeUndefined()
  })

  it('counts expired entry as a miss', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.get('k')
    expect(cache.getStats().misses).toBe(1)
  })

  it('removes expired entry from internal map on get', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.get('k')
    expect(cache.getStats().size).toBe(0)
  })
})

// ─── has() ───

describe('TTLCache has', () => {
  it('returns true for existing non-expired key', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    expect(cache.has('k')).toBe(true)
  })

  it('returns false for missing key', () => {
    const cache = new TTLCache()
    expect(cache.has('missing')).toBe(false)
  })

  it('returns false for expired key and removes it', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    expect(cache.has('k')).toBe(false)
    expect(cache.getStats().size).toBe(0)
  })

  it('does not affect hit/miss stats', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    cache.has('k')
    cache.has('missing')
    expect(cache.getStats().hits).toBe(0)
    expect(cache.getStats().misses).toBe(0)
  })
})

// ─── delete() ───

describe('TTLCache delete', () => {
  it('deletes an existing key and returns true', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    expect(cache.delete('k')).toBe(true)
    expect(cache.get('k')).toBeUndefined()
    expect(cache.getStats().size).toBe(0)
  })

  it('returns false for missing key', () => {
    const cache = new TTLCache()
    expect(cache.delete('missing')).toBe(false)
  })
})

// ─── clear() ───

describe('TTLCache clear', () => {
  it('removes all entries', () => {
    const cache = new TTLCache()
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.clear()
    expect(cache.getStats().size).toBe(0)
  })

  it('resets hit/miss/eviction counters', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    cache.get('k')
    cache.get('missing')
    cache.clear()
    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.evictions).toBe(0)
    expect(stats.hitRate).toBe(0)
  })
})

// ─── getRemainingTTL() ───

describe('TTLCache getRemainingTTL', () => {
  it('returns remaining TTL for existing key', () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 5000)
    const ttl = cache.getRemainingTTL('k')
    expect(ttl).toBeGreaterThan(4000)
    expect(ttl).toBeLessThanOrEqual(5000)
  })

  it('returns 0 for missing key', () => {
    const cache = new TTLCache()
    expect(cache.getRemainingTTL('missing')).toBe(0)
  })

  it('returns 0 for expired entry', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    expect(cache.getRemainingTTL('k')).toBe(0)
  })
})

// ─── getExpiredKeys() ───

describe('TTLCache getExpiredKeys', () => {
  it('returns empty array when no expired keys', () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 60000)
    expect(cache.getExpiredKeys()).toEqual([])
  })

  it('returns expired keys', async () => {
    const cache = new TTLCache()
    cache.set('expired', 'v', 10)
    cache.set('alive', 'v', 60000)
    await new Promise((r) => setTimeout(r, 50))
    const expired = cache.getExpiredKeys()
    expect(expired).toContain('expired')
    expect(expired).not.toContain('alive')
  })

  it('returns empty array for empty cache', () => {
    const cache = new TTLCache()
    expect(cache.getExpiredKeys()).toEqual([])
  })

  it('does not remove expired entries', async () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.getExpiredKeys()
    expect(cache.getStats().size).toBe(1)
  })
})

// ─── cleanup() ───

describe('TTLCache cleanup', () => {
  it('removes expired entries and returns count', async () => {
    const cache = new TTLCache()
    cache.set('a', 1, 10)
    cache.set('b', 2, 10)
    cache.set('c', 3, 60000)
    await new Promise((r) => setTimeout(r, 50))
    const removed = cache.cleanup()
    expect(removed).toBe(2)
    expect(cache.getStats().size).toBe(1)
    expect(cache.get('c')).toBe(3)
  })

  it('increments eviction counter', async () => {
    const cache = new TTLCache()
    cache.set('a', 1, 10)
    cache.set('b', 2, 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.cleanup()
    expect(cache.getStats().evictions).toBe(2)
  })

  it('returns 0 when nothing to clean', () => {
    const cache = new TTLCache()
    cache.set('k', 'v', 60000)
    expect(cache.cleanup()).toBe(0)
    expect(cache.getStats().evictions).toBe(0)
  })

  it('returns 0 for empty cache', () => {
    const cache = new TTLCache()
    expect(cache.cleanup()).toBe(0)
  })
})

// ─── getStats() ───

describe('TTLCache getStats', () => {
  it('computes hitRate correctly', () => {
    const cache = new TTLCache()
    cache.set('k', 'v')
    cache.get('k')
    cache.get('k')
    cache.get('missing')
    const stats = cache.getStats()
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(2 / 3)
  })

  it('hitRate is 0 when no accesses', () => {
    const cache = new TTLCache()
    expect(cache.getStats().hitRate).toBe(0)
  })

  it('reports current size', () => {
    const cache = new TTLCache()
    cache.set('a', 1)
    cache.set('b', 2)
    const stats = cache.getStats()
    expect(stats.size).toBe(2)
    expect(stats.entries).toBe(2)
  })

  it('tracks cumulative evictions across cleanups', async () => {
    const cache = new TTLCache()
    cache.set('a', 1, 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.cleanup()
    cache.set('b', 2, 10)
    await new Promise((r) => setTimeout(r, 50))
    cache.cleanup()
    expect(cache.getStats().evictions).toBe(2)
  })
})
