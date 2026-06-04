import { describe, expect, it } from 'vitest'
import { LRUEvictionCache } from '../../src/utils/lru-eviction-cache.js'

describe('LRUEvictionCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('evicts oldest when capacity exceeded', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('calls onEvict callback', () => {
    const evicted: [string, number][] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key, value) => evicted.push([key, value]),
    })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(evicted).toEqual([['a', 1]])
  })

  it('get refreshes access order', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('returns undefined for missing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('updates existing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('delete removes entry', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.delete('missing')).toBe(false)
  })

  it('size returns current count', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('clear removes all entries', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('throws for non-positive capacity', () => {
    expect(() => new LRUEvictionCache(0)).toThrow()
    expect(() => new LRUEvictionCache(-1)).toThrow()
  })

  it('keys returns in LRU order', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect([...cache.keys()]).toEqual(['a', 'b', 'c'])
  })

  it('onEvict not called on delete', () => {
    let evictCount = 0
    const cache = new LRUEvictionCache<string, number>(3, {
      onEvict: () => evictCount++,
    })
    cache.set('a', 1)
    cache.delete('a')
    expect(evictCount).toBe(0)
  })

  it('handles capacity of 1', () => {
    const cache = new LRUEvictionCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('b')).toBe(2)
  })

  it('set does not evict if updating existing key', () => {
    const evicted: string[] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key) => evicted.push(key),
    })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('a', 10)
    expect(evicted).toEqual([])
    expect(cache.get('a')).toBe(10)
  })

  it('clear removes all entries', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
  })

  it('handles re-access updating recency', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('delete removes key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.delete('a')
    expect(cache.has('a')).toBe(false)
  })

  it('size tracks entries', () => {
    const cache = new LRUEvictionCache<string, number>({ maxSize: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('evicts when over capacity', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })
})
