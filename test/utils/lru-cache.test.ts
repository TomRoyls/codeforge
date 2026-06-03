import { describe, it, expect } from 'vitest'
import { LRUCache } from '../../src/utils/lru-cache.js'

// ─── Constructor ──────────────────────────────────────────
describe('LRUCache - constructor', () => {
  it('creates cache with given maxSize', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.maxSize).toBe(5)
    expect(cache.size).toBe(0)
  })

  it('throws on maxSize < 1', () => {
    expect(() => new LRUCache(0)).toThrow(RangeError)
  })
})

// ─── Set and Get ──────────────────────────────────────────
describe('LRUCache - set and get', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for missing keys', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('evicts LRU item when full', () => {
    const cache = new LRUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('updates existing key without eviction', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('a', 10)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
    expect(cache.get('a')).toBe(10)
  })

  it('promotes key on get', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })
})

// ─── Has, Delete, Clear ───────────────────────────────────
describe('LRUCache - has, delete, clear', () => {
  it('has returns true for existing key', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('delete removes key', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('clear empties the cache', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.isEmpty).toBe(true)
  })
})

// ─── Iteration ────────────────────────────────────────────
describe('LRUCache - iteration', () => {
  it('returns keys in LRU order', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.keys()).toEqual(['a', 'b', 'c'])
  })

  it('returns values', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.values()).toEqual([1, 2])
  })

  it('returns entries', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.entries()).toEqual([['a', 1], ['b', 2]])
  })

  it('forEach iterates all entries', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    const entries: [string, number][] = []
    cache.forEach((v, k) => entries.push([k, v]))
    expect(entries).toEqual([['a', 1], ['b', 2]])
  })
})

// ─── Stats ────────────────────────────────────────────────
describe('LRUCache - stats', () => {
  it('tracks hits and misses', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    const stats = cache.stats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })

  it('tracks evictions', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.stats().evictions).toBe(1)
  })

  it('resets stats on clear', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    cache.clear()
    const stats = cache.stats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})

// ─── Resize ───────────────────────────────────────────────
describe('LRUCache - resize', () => {
  it('evicts items when shrinking', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.resize(2)
    expect(cache.size).toBe(2)
    expect(cache.maxSize).toBe(2)
    expect(cache.has('a')).toBe(false)
  })

  it('throws on resize to 0', () => {
    const cache = new LRUCache<string, number>(5)
    expect(() => cache.resize(0)).toThrow(RangeError)
  })
})

// ─── Peek ─────────────────────────────────────────────────
describe('LRUCache - peek', () => {
  it('returns value without affecting LRU order', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.peek('a')).toBe(1)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUCache<string, number>(2)
    expect(cache.get('missing')).toBeUndefined()
  })
})
