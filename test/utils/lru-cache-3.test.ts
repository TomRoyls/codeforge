import { describe, it, expect, vi } from 'vitest'
import { LRUCache3 } from '../../src/utils/lru-cache-3.js'

describe('LRUCache3', () => {
  it('constructor sets maxSize', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    expect(cache.maxSize).toBe(5)
  })

  it('get and set work', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    cache.set('a', 'value')
    expect(cache.get('a')).toBe('value')
  })

  it('get returns undefined for missing', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('get updates recency', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('d', 4)
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeUndefined()
  })

  it('set evicts LRU when over capacity', () => {
    const cache = new LRUCache3<number>({ maxSize: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('has checks existence without updating recency', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    cache.set('d', 4)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
  })

  it('delete removes entry', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    cache.set('a', 'value')
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
  })

  it('peek returns value without updating recency', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.peek('a')).toBe(1)
    cache.set('d', 4)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
  })

  it('size tracking', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    expect(cache.size).toBe(0)
    cache.set('a', 'value')
    expect(cache.size).toBe(1)
    cache.set('b', 'value2')
    expect(cache.size).toBe(2)
  })

  it('clear resets', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    cache.set('a', 'value')
    cache.set('b', 'value2')
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })

  it('keys returns in recency order', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    expect(cache.keys()).toEqual(['b', 'c', 'a'])
  })

  it('values returns in recency order', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    expect(cache.values()).toEqual([2, 3, 1])
  })

  it('entries returns in recency order', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    expect(cache.entries()).toEqual([
      ['b', 2],
      ['c', 3],
      ['a', 1],
    ])
  })

  it('TTL expiration works', () => {
    vi.useFakeTimers()
    const cache = new LRUCache3<string>({ maxSize: 5, ttlMs: 100 })
    cache.set('a', 'value')
    expect(cache.get('a')).toBe('value')
    vi.advanceTimersByTime(150)
    expect(cache.get('a')).toBeUndefined()
    vi.useRealTimers()
  })

  it('purgeExpired removes expired entries', () => {
    vi.useFakeTimers()
    const cache = new LRUCache3<string>({ maxSize: 10, ttlMs: 100 })
    cache.set('a', 'value1')
    vi.advanceTimersByTime(50)
    cache.set('b', 'value2')
    vi.advanceTimersByTime(60)
    cache.set('c', 'value3')
    const removed = cache.purgeExpired()
    expect(removed).toBe(1)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('value2')
    expect(cache.get('c')).toBe('value3')
    vi.useRealTimers()
  })

  it('maxSize is readonly', () => {
    const cache = new LRUCache3<string>({ maxSize: 5 })
    expect(cache.maxSize).toBe(5)
  })

  it('size tracks entries', () => {
    const cache = new LRUCache3<number>({ maxSize: 3 })
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('delete removes entry', () => {
    const cache = new LRUCache3<number>({ maxSize: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.size).toBe(1)
  })

  it('clear empties cache', () => {
    const cache = new LRUCache3<string, number>({ maxSize: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('has returns true for existing key', () => {
    const cache = new LRUCache3<string, number>(5)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUCache3<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUCache3<string, number>(5)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUCache3<string, number>(5)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LRUCache3<string, number>(5)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })
})