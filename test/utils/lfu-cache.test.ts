import { describe, it, expect } from 'vitest'
import { LFUCache } from '../../src/utils/lfu-cache.js'

describe('LFUCache', () => {
  it('creates instance with capacity', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.size).toBe(0)
    expect(cache.Capacity).toBe(3)
  })

  it('throws error for zero capacity', () => {
    expect(() => new LFUCache<string, number>(0)).toThrow(RangeError)
  })

  it('throws error for negative capacity', () => {
    expect(() => new LFUCache<string, number>(-1)).toThrow(RangeError)
  })

  it('sets and gets value', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.get('nonexistent')).toBe(undefined)
  })

  it('updates existing key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
  })

  it('evicts least frequently used key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.get('b')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(false)
    expect(cache.has('d')).toBe(true)
  })

  it('checks if key exists', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.has('a')).toBe(false)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('deletes key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    const result = cache.delete('a')
    expect(result).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('returns false when deleting non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    const result = cache.delete('nonexistent')
    expect(result).toBe(false)
  })

  it('clears all entries', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
  })

  it('peeks value without updating frequency', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.get('a')
    cache.peek('a')
    expect(cache.getFrequency('a')).toBe(2)
  })

  it('returns undefined when peeking non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.peek('nonexistent')).toBe(undefined)
  })

  it('returns correct frequency', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.getFrequency('a')).toBe(1)
    cache.get('a')
    cache.get('a')
    expect(cache.getFrequency('a')).toBe(3)
  })

  it('returns zero frequency for non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.getFrequency('nonexistent')).toBe(0)
  })

  it('returns all keys', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const keys = cache.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('returns all values', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const values = cache.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('returns all entries', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const entries = cache.entries()
    expect(entries).toHaveLength(2)
    const entryMap = new Map(entries)
    expect(entryMap.get('a')).toBe(1)
    expect(entryMap.get('b')).toBe(2)
  })

  it('iterates with forEach', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    const entries: Array<{ value: number; key: string; freq: number }> = []
    cache.forEach((value, key, freq) => {
      entries.push({ value, key, freq })
    })
    expect(entries).toHaveLength(2)
    expect(entries.some((e) => e.key === 'a' && e.value === 1 && e.freq === 2)).toBe(true)
  })

  it('converts to Map', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const map = cache.toMap()
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(2)
  })

  it('handles capacity of 1', () => {
    const cache = new LFUCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(1)
    expect(cache.get('a')).toBe(undefined)
    expect(cache.get('b')).toBe(2)
  })

  it('set updates existing key', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('a', 10)
    expect(cache.get('a')).toBe(10)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })
})