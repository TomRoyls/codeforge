import { describe, expect, it } from 'vitest'
import { LRUEvictionCache } from '../../src/utils/lru-eviction-cache.js'

describe('LRUEvictionCache - constructor', () => {
  it('creates cache with given capacity', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.capacity).toBe(3)
    expect(cache.size).toBe(0)
  })

  it('throws for non-positive capacity', () => {
    expect(() => new LRUEvictionCache(0)).toThrow()
    expect(() => new LRUEvictionCache(-1)).toThrow()
  })

  it('accepts options with onEvict callback', () => {
    const evicted: [string, number][] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key, value) => evicted.push([key, value]),
    })
    expect(cache.capacity).toBe(2)
  })
})
