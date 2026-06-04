import { describe, it, expect } from 'vitest'
import { LRUKCache } from '../../src/utils/lru-k-cache.js'

describe('LRUKCache', () => {
  it('constructor with valid options', () => {
    const cache = new LRUKCache({ k: 2, capacity: 3 })
    expect(cache.kValue).toBe(2)
    expect(cache.capacityValue).toBe(3)
    expect(cache.size).toBe(0)
  })

  it('constructor throws on invalid capacity', () => {
    expect(() => new LRUKCache({ k: 2, capacity: 0 })).toThrow(RangeError)
    expect(() => new LRUKCache({ k: 2, capacity: -1 })).toThrow(RangeError)
  })

  it('constructor throws on invalid k', () => {
    expect(() => new LRUKCache({ k: 0, capacity: 3 })).toThrow(RangeError)
    expect(() => new LRUKCache({ k: -1, capacity: 3 })).toThrow(RangeError)
  })

  it('set and get basic operations', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
    expect(cache.size).toBe(1)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('has returns correct boolean', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('delete removes entry', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
    expect(cache.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.delete('missing')).toBe(false)
  })

  it('clear removes all entries', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })

  it('evicts least recently used when at capacity', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('get updates access history', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    expect(history1.length).toBe(1)
    cache.get('a')
    const history2 = cache.getAccessHistory('a')
    expect(history2.length).toBe(2)
  })

  it('set updates existing key value', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('getAccessHistory returns empty array for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.getAccessHistory('missing')).toEqual([])
  })

  it('LRU-K-2 evicts based on second-to-last access', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.get('b')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('overwrites update value', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('a', 99)
    expect(cache.get('a')).toBe(99)
    expect(cache.size).toBe(1)
  })

  it('handles k=1 as simple LRU', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('d', 4)
    expect(cache.has('b')).toBe(false)
    expect(cache.has('a')).toBe(true)
  })

  it('delete removes entry', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
    expect(cache.size).toBe(1)
  })

  it('delete returns false for missing', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.delete('missing')).toBe(false)
  })

  it('get returns value after set', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 42)
    expect(cache.get('a')).toBe(42)
  })

  it('has returns false for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.has('z')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })
})