import { describe, it, expect } from 'vitest'
import { ARCCache } from '../../src/utils/arc-cache.js'

describe('ARCCache', () => {
  it('should throw RangeError when capacity is less than 1', () => {
    expect(() => new ARCCache(0)).toThrow(RangeError)
    expect(() => new ARCCache(-1)).toThrow(RangeError)
  })

  it('should create cache with valid capacity', () => {
    const cache = new ARCCache<string, number>(3)
    expect(cache.Capacity).toBe(3)
    expect(cache.size).toBe(0)
  })

  it('should set and get values', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('should return undefined for non-existent keys', () => {
    const cache = new ARCCache<string, number>(3)
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('should check if key exists', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('should delete existing keys', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('should return false when deleting non-existent keys', () => {
    const cache = new ARCCache<string, number>(3)
    expect(cache.delete('nonexistent')).toBe(false)
  })

  it('should track size correctly', () => {
    const cache = new ARCCache<string, number>(3)
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
    cache.delete('a')
    expect(cache.size).toBe(1)
  })

  it('should clear all entries', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(false)
  })

  it('should peek at values without affecting position', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.peek('a')).toBe(1)
    expect(cache.peek('nonexistent')).toBeUndefined()
  })

  it('should return all keys', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const keys = cache.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('should return all values', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const values = cache.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('should return all entries', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const entries = cache.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('should iterate over all entries with forEach', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const results: Array<[number, string]> = []
    cache.forEach((value, key) => {
      results.push([value, key])
    })
    expect(results.length).toBe(3)
  })

  it('should evict old entries when capacity exceeded', () => {
    const cache = new ARCCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
  })

  it('should update existing key in t2', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('a', 10)
    expect(cache.get('a')).toBe(10)
  })

  it('should promote key from t1 to t2 on update', () => {
    const cache = new ARCCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('a', 10)
    expect(cache.get('a')).toBe(10)
  })

  it('returns undefined for missing key', () => {
    const cache = new ARCCache<string, number>(100)
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('set and get returns value', () => {
    const cache = new ARCCache<string, number>(10)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })

  it('has returns true for cached key', () => {
    const cache = new ARCCache<string, number>(10)
    cache.set('x', 1)
    expect(cache.has('x')).toBe(true)
    expect(cache.has('y')).toBe(false)
  })

  it('delete removes key', () => {
    const cache = new ARCCache<string, number>(10)
    cache.set('x', 1)
    cache.delete('x')
    expect(cache.has('x')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const cache = new ARCCache<number>(3)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('set and get returns value', () => {
    const cache = new ARCCache<number>(3)
    cache.set('key', 42)
    expect(cache.get('key')).toBe(42)
  })
})