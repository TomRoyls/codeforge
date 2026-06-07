import { describe, it, expect } from 'vitest'
import { LRUCache } from '../src/utils/lru-cache.js'

// ─── Constructor ───

describe('LRUCache', () => {
  it('creates with valid maxSize', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.maxSize).toBe(5)
    expect(cache.size).toBe(0)
    expect(cache.isEmpty).toBe(true)
  })

  it('throws for negative maxSize', () => {
    expect(() => new LRUCache(-1)).toThrow(RangeError)
  })

  // ─── Get / Set ───

  it('set and get work', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set overwrites existing key', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('a', 99)
    expect(cache.get('a')).toBe(99)
    expect(cache.size).toBe(1)
  })

  // ─── Eviction ───

  it('evicts LRU when full', () => {
    const cache = new LRUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('d')).toBe(true)
    expect(cache.size).toBe(3)
  })

  it('get promotes to most recent', () => {
    const cache = new LRUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  // ─── Has / Delete ───

  it('has checks without promoting', () => {
    const cache = new LRUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
  })

  it('delete removes entry', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
    expect(cache.delete('a')).toBe(false)
  })

  // ─── Peek ───

  it('peek returns value without promoting', () => {
    const cache = new LRUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.peek('a')).toBe(1)
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
  })

  it('peek returns undefined for missing', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.peek('x')).toBeUndefined()
  })

  // ─── Keys / Values / Entries ───

  it('keys returns in LRU order', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(Array.from(cache.keys())).toEqual(['a', 'b', 'c'])
  })

  it('values returns in LRU order', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(Array.from(cache.values())).toEqual([1, 2])
  })

  it('entries returns key-value pairs', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(Array.from(cache.entries())).toEqual([['a', 1], ['b', 2]])
  })

  // ─── ForEach ───

  it('forEach iterates entries', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    const result: [string, number][] = []
    cache.forEach((v, k) => result.push([k, v]))
    expect(result).toEqual([['a', 1], ['b', 2]])
  })

  // ─── Clear ───

  it('clear resets cache and stats', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.isEmpty).toBe(true)
    const stats = cache.stats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })

  // ─── Stats ───

  it('stats tracks hits and misses', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.get('a')
    cache.get('missing')
    const stats = cache.stats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.5)
  })

  it('stats tracks evictions', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.stats().evictions).toBe(1)
  })

  it('stats hitRate is 0 with no accesses', () => {
    const cache = new LRUCache<string, number>(5)
    expect(cache.stats().hitRate).toBe(0)
  })

  // ─── Resize ───

  it('resize shrinks cache', () => {
    const cache = new LRUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.resize(2)
    expect(cache.maxSize).toBe(2)
    expect(cache.size).toBe(2)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('resize throws for negative size', () => {
    const cache = new LRUCache<string, number>(5)
    expect(() => cache.resize(-1)).toThrow(RangeError)
  })

  // ─── Edge cases ───

  it('maxSize 1 cache', () => {
    const cache = new LRUCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('b')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('handles complex value types', () => {
    const cache = new LRUCache<string, { data: number[] }>(5)
    cache.set('a', { data: [1, 2, 3] })
    const val = cache.get('a')
    expect(val?.data).toEqual([1, 2, 3])
  })

  it('set-delete-set cycle', () => {
    const cache = new LRUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    cache.set('c', 3)
    expect(cache.size).toBe(2)
    expect(Array.from(cache.keys())).toEqual(['b', 'c'])
  })
})
