import { describe, expect, it } from 'vitest'
import { LRUKCache } from '../../../src/utils/lru-k-cache.js'

describe('LRUKCache', () => {
  it('should create cache with valid options', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.size).toBe(0)
  })

  it('should throw RangeError for capacity less than 1', () => {
    expect(() => new LRUKCache({ k: 2, capacity: 0 })).toThrow(RangeError)
  })

  it('should throw RangeError for capacity of 0', () => {
    expect(() => new LRUKCache({ k: 2, capacity: 0 })).toThrow('capacity must be >= 1')
  })

  it('should throw RangeError for negative capacity', () => {
    expect(() => new LRUKCache({ k: 2, capacity: -5 })).toThrow(RangeError)
  })

  it('should throw RangeError for k less than 1', () => {
    expect(() => new LRUKCache({ k: 0, capacity: 10 })).toThrow(RangeError)
  })

  it('should throw RangeError for k of 0', () => {
    expect(() => new LRUKCache({ k: 0, capacity: 10 })).toThrow()
  })

  it('should throw RangeError for negative k', () => {
    expect(() => new LRUKCache({ k: -1, capacity: 10 })).toThrow(RangeError)
  })

  it('should set and get a value', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for missing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('should update value for existing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    cache.set('key1', 'value2')
    expect(cache.get('key1')).toBe('value2')
  })

  it('should return correct size after insertions', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    expect(cache.size).toBe(3)
  })

  it('should have key after insertion', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)
  })

  it('should not have missing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.has('missing')).toBe(false)
  })

  it('should delete existing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    expect(cache.delete('key1')).toBe(true)
    expect(cache.has('key1')).toBe(false)
  })

  it('should return false when deleting missing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.delete('missing')).toBe(false)
  })

  it('should clear all entries', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should evict oldest key when capacity exceeded', () => {
    const cache = new LRUKCache({ k: 1, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    expect(cache.has('key1')).toBe(false)
    expect(cache.has('key2')).toBe(true)
    expect(cache.has('key3')).toBe(true)
  })

  it('should behave like LRU when k=1', () => {
    const cache = new LRUKCache({ k: 1, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.get('key1')
    cache.set('key3', 'value3')
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
    expect(cache.has('key3')).toBe(true)
  })

  it('should track access history for k=2', () => {
    const cache = new LRUKCache({ k: 2, capacity: 3 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.get('key1')
    cache.set('key3', 'value3')
    const history = cache.getAccessHistory('key1')
    expect(history.length).toBeGreaterThan(0)
  })

  it('should evict key with oldest k-th access', () => {
    const cache = new LRUKCache({ k: 2, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.get('key1')
    cache.get('key1')
    cache.get('key2')
    cache.set('key3', 'value3')
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
  })

  it('should handle number keys', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set(1, 'value1')
    cache.set(2, 'value2')
    expect(cache.get(1)).toBe('value1')
    expect(cache.get(2)).toBe('value2')
  })

  it('should handle object values', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    const obj1 = { name: 'test1' }
    const obj2 = { name: 'test2' }
    cache.set('key1', obj1)
    cache.set('key2', obj2)
    expect(cache.get('key1')).toBe(obj1)
    expect(cache.get('key2')).toBe(obj2)
  })

  it('should handle null values', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', null)
    expect(cache.get('key1')).toBeNull()
  })

  it('should handle undefined values', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', undefined)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should update access time on get', () => {
    const cache = new LRUKCache({ k: 2, capacity: 2 })
    cache.set('key1', 'value1')
    const history1 = cache.getAccessHistory('key1')
    cache.get('key1')
    const history2 = cache.getAccessHistory('key1')
    expect(history2.length).toBeGreaterThan(history1.length)
  })

  it('should store kValue', () => {
    const cache = new LRUKCache({ k: 3, capacity: 10 })
    expect(cache.kValue).toBe(3)
  })

  it('should store capacityValue', () => {
    const cache = new LRUKCache({ k: 2, capacity: 15 })
    expect(cache.capacityValue).toBe(15)
  })

  it('should return empty access history for missing key', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.getAccessHistory('missing')).toEqual([])
  })

  it('should limit access history to k entries', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    cache.set('key1', 'value1')
    cache.get('key1')
    cache.get('key1')
    cache.get('key1')
    cache.get('key1')
    const history = cache.getAccessHistory('key1')
    expect(history.length).toBeLessThanOrEqual(2)
  })

  it('should handle capacity of 1', () => {
    const cache = new LRUKCache({ k: 1, capacity: 1 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size).toBe(1)
    expect(cache.has('key2')).toBe(true)
  })

  it('should handle k larger than capacity', () => {
    const cache = new LRUKCache({ k: 10, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size).toBe(2)
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(true)
  })

  it('should evict least recently used when k=2 and capacity full', () => {
    const cache = new LRUKCache({ k: 2, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.get('key2')
    cache.set('key3', 'value3')
    expect(cache.has('key1')).toBe(false)
    expect(cache.has('key2')).toBe(true)
  })

  it('should handle duplicate keys with eviction', () => {
    const cache = new LRUKCache({ k: 1, capacity: 2 })
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key1', 'value1-updated')
    cache.set('key3', 'value3')
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
    expect(cache.has('key3')).toBe(true)
  })
})