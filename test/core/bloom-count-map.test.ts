import { describe, it, expect, beforeEach } from 'vitest'
import { BloomCountMap } from '../../src/core/bloom-count-map/bloom-count-map.js'
import { DEFAULT_BLOOM_COUNT_MAP_OPTIONS } from '../../src/core/bloom-count-map/types.js'
import type { BloomCountMapOptions } from '../../src/core/bloom-count-map/types.js'

describe('BloomCountMap', () => {
  let bcm: BloomCountMap<number>

  beforeEach(() => {
    bcm = new BloomCountMap()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const m = new BloomCountMap<string>()
      expect(m.size).toBe(0)
      expect(m.capacity).toBe(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity)
    })

    it('should create with custom capacity', () => {
      const m = new BloomCountMap<string>({ capacity: 5000 })
      expect(m.capacity).toBe(5000)
    })

    it('should create with custom errorRate', () => {
      const m = new BloomCountMap<string>({ errorRate: 0.001 })
      expect(m.size).toBe(0)
    })

    it('should create with both options', () => {
      const m = new BloomCountMap<string>({ capacity: 500, errorRate: 0.05 })
      expect(m.capacity).toBe(500)
    })

    it('should start empty', () => {
      expect(bcm.size).toBe(0)
      expect(bcm.approximateSize).toBe(0)
    })

    it('should return configured capacity from getter', () => {
      const m = new BloomCountMap<number>({ capacity: 200 })
      expect(m.capacity).toBe(200)
    })

    it('should return default capacity when not specified', () => {
      expect(bcm.capacity).toBe(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity)
    })

    it('should create independent instances', () => {
      const m1 = new BloomCountMap<number>()
      const m2 = new BloomCountMap<number>()
      m1.set('key', 1)
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(0)
    })

    it('should handle empty options object', () => {
      const m = new BloomCountMap<string>({})
      expect(m.capacity).toBe(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity)
      expect(m.size).toBe(0)
    })

    it('should support BloomCountMapOptions interface', () => {
      const opts: BloomCountMapOptions = {
        capacity: 500,
        errorRate: 0.05,
      }
      const m = new BloomCountMap<string>(opts)
      expect(m.capacity).toBe(500)
    })
  })

  describe('set', () => {
    it('should add a new key-value pair', () => {
      bcm.set('key', 42)
      expect(bcm.get('key')).toBe(42)
    })

    it('should set default count of 1 for new key', () => {
      bcm.set('key', 1)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should set explicit count for new key', () => {
      bcm.set('key', 1, 5)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should overwrite existing value', () => {
      bcm.set('key', 1)
      bcm.set('key', 2)
      expect(bcm.get('key')).toBe(2)
    })

    it('should preserve count when updating value without count', () => {
      bcm.set('key', 1, 3)
      bcm.set('key', 2)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should update count when provided on existing key', () => {
      bcm.set('key', 1, 2)
      bcm.set('key', 2, 5)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should reduce bloom count when set to lower count', () => {
      bcm.set('key', 1, 5)
      const countBefore = bcm.count('key')
      bcm.set('key', 2, 1)
      const countAfter = bcm.count('key')
      expect(countAfter).toBeLessThanOrEqual(countBefore)
    })

    it('should handle empty string key', () => {
      bcm.set('', 0)
      expect(bcm.get('')).toBe(0)
      expect(bcm.has('')).toBe(true)
    })

    it('should handle unicode keys', () => {
      bcm.set('日本語', 1)
      bcm.set('🎉🚀', 2)
      expect(bcm.get('日本語')).toBe(1)
      expect(bcm.get('🎉🚀')).toBe(2)
    })

    it('should handle multiple different keys', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      expect(bcm.size).toBe(3)
    })

    it('should handle large count value', () => {
      bcm.set('key', 1, 100)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
      expect(bcm.get('key')).toBe(1)
    })

    it('should handle overwriting value multiple times', () => {
      bcm.set('key', 1)
      bcm.set('key', 2)
      bcm.set('key', 3)
      expect(bcm.get('key')).toBe(3)
      expect(bcm.size).toBe(1)
    })

    it('should handle special character keys', () => {
      bcm.set('hello\nworld\t!', 1)
      bcm.set('path/to/file.ts', 2)
      expect(bcm.get('hello\nworld\t!')).toBe(1)
      expect(bcm.get('path/to/file.ts')).toBe(2)
    })

    it('should handle very long keys', () => {
      const longKey = 'x'.repeat(10000)
      bcm.set(longKey, 99)
      expect(bcm.get(longKey)).toBe(99)
    })

    it('should handle set with count 0', () => {
      bcm.set('key', 1, 0)
      expect(bcm.has('key')).toBe(true)
      expect(bcm.get('key')).toBe(1)
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      bcm.set('key', 42)
      expect(bcm.get('key')).toBe(42)
    })

    it('should return undefined for non-existing key', () => {
      expect(bcm.get('missing')).toBeUndefined()
    })

    it('should return updated value after set', () => {
      bcm.set('key', 1)
      bcm.set('key', 2)
      expect(bcm.get('key')).toBe(2)
    })

    it('should return undefined after delete', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      expect(bcm.get('key')).toBeUndefined()
    })

    it('should return undefined on empty map', () => {
      expect(bcm.get('anything')).toBeUndefined()
    })

    it('should handle empty string key', () => {
      bcm.set('', 0)
      expect(bcm.get('')).toBe(0)
    })

    it('should handle unicode key', () => {
      bcm.set('日本語', 42)
      expect(bcm.get('日本語')).toBe(42)
    })

    it('should work with string values', () => {
      const m = new BloomCountMap<string>()
      m.set('key', 'hello')
      expect(m.get('key')).toBe('hello')
    })

    it('should work with object values', () => {
      const m = new BloomCountMap<{ name: string }>()
      const obj = { name: 'test' }
      m.set('key', obj)
      expect(m.get('key')).toBe(obj)
    })

    it('should return correct value among many entries', () => {
      for (let i = 0; i < 100; i++) {
        bcm.set(`key-${i}`, i)
      }
      expect(bcm.get('key-0')).toBe(0)
      expect(bcm.get('key-50')).toBe(50)
      expect(bcm.get('key-99')).toBe(99)
    })
  })

  describe('count', () => {
    it('should return 0 for non-existing key', () => {
      expect(bcm.count('missing')).toBe(0)
    })

    it('should return approximate count for existing key', () => {
      bcm.set('key', 1)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 on empty map', () => {
      expect(bcm.count('anything')).toBe(0)
    })

    it('should increase after increment', () => {
      bcm.set('key', 1)
      const before = bcm.count('key')
      bcm.increment('key')
      expect(bcm.count('key')).toBeGreaterThanOrEqual(before)
    })

    it('should decrease after decrement', () => {
      bcm.set('key', 1, 5)
      const before = bcm.count('key')
      bcm.decrement('key')
      expect(bcm.count('key')).toBeLessThanOrEqual(before)
    })

    it('should reflect set with count', () => {
      bcm.set('key', 1, 3)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 after delete', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      expect(bcm.count('key')).toBe(0)
    })

    it('should handle multiple increments', () => {
      bcm.set('key', 1)
      for (let i = 0; i < 5; i++) {
        bcm.increment('key')
      }
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should handle unicode keys', () => {
      bcm.set('🎉', 1)
      expect(bcm.count('🎉')).toBeGreaterThanOrEqual(1)
    })

    it('should handle empty string key', () => {
      bcm.set('', 1)
      expect(bcm.count('')).toBeGreaterThanOrEqual(1)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      bcm.set('key', 1)
      expect(bcm.has('key')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(bcm.has('missing')).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(bcm.has('anything')).toBe(false)
    })

    it('should return true after set', () => {
      bcm.set('key', 1)
      expect(bcm.has('key')).toBe(true)
    })

    it('should return false after delete', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      expect(bcm.has('key')).toBe(false)
    })

    it('should handle empty string key', () => {
      bcm.set('', 1)
      expect(bcm.has('')).toBe(true)
    })

    it('should handle unicode key', () => {
      bcm.set('日本語', 1)
      expect(bcm.has('日本語')).toBe(true)
    })

    it('should be case sensitive', () => {
      bcm.set('Hello', 1)
      expect(bcm.has('Hello')).toBe(true)
      expect(bcm.has('hello')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should remove existing key and return true', () => {
      bcm.set('key', 1)
      expect(bcm.delete('key')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(bcm.delete('missing')).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(bcm.delete('anything')).toBe(false)
    })

    it('should decrease size after delete', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      expect(bcm.size).toBe(2)
      bcm.delete('a')
      expect(bcm.size).toBe(1)
    })

    it('should make get return undefined', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      expect(bcm.get('key')).toBeUndefined()
    })

    it('should make has return false', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      expect(bcm.has('key')).toBe(false)
    })

    it('should only delete specified key', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.delete('a')
      expect(bcm.has('a')).toBe(false)
      expect(bcm.has('b')).toBe(true)
    })

    it('should handle deleting all entries', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.delete('a')
      bcm.delete('b')
      expect(bcm.size).toBe(0)
    })

    it('should allow re-adding after delete', () => {
      bcm.set('key', 1)
      bcm.delete('key')
      bcm.set('key', 2)
      expect(bcm.get('key')).toBe(2)
      expect(bcm.size).toBe(1)
    })

    it('should handle unicode key delete', () => {
      bcm.set('日本語', 1)
      expect(bcm.delete('日本語')).toBe(true)
      expect(bcm.has('日本語')).toBe(false)
    })
  })

  describe('increment', () => {
    it('should return true for existing key', () => {
      bcm.set('key', 1)
      expect(bcm.increment('key')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(bcm.increment('missing')).toBe(false)
    })

    it('should increase bloom count', () => {
      bcm.set('key', 1)
      const before = bcm.count('key')
      bcm.increment('key')
      expect(bcm.count('key')).toBeGreaterThanOrEqual(before)
    })

    it('should work multiple times', () => {
      bcm.set('key', 1)
      for (let i = 0; i < 5; i++) {
        expect(bcm.increment('key')).toBe(true)
      }
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should return false on empty map', () => {
      expect(bcm.increment('key')).toBe(false)
    })

    it('should work after set with explicit count', () => {
      bcm.set('key', 1, 3)
      expect(bcm.increment('key')).toBe(true)
      expect(bcm.count('key')).toBeGreaterThanOrEqual(1)
    })

    it('should preserve value', () => {
      bcm.set('key', 42)
      bcm.increment('key')
      expect(bcm.get('key')).toBe(42)
    })

    it('should not change size', () => {
      bcm.set('key', 1)
      expect(bcm.size).toBe(1)
      bcm.increment('key')
      expect(bcm.size).toBe(1)
    })

    it('should handle unicode key', () => {
      bcm.set('🎉', 1)
      expect(bcm.increment('🎉')).toBe(true)
    })

    it('should handle empty string key', () => {
      bcm.set('', 1)
      expect(bcm.increment('')).toBe(true)
    })
  })

  describe('decrement', () => {
    it('should return true for key with count > 1', () => {
      bcm.set('key', 1, 3)
      expect(bcm.decrement('key')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(bcm.decrement('missing')).toBe(false)
    })

    it('should return false when count is 1', () => {
      bcm.set('key', 1)
      expect(bcm.decrement('key')).toBe(false)
    })

    it('should decrease bloom count', () => {
      bcm.set('key', 1, 5)
      const before = bcm.count('key')
      bcm.decrement('key')
      expect(bcm.count('key')).toBeLessThanOrEqual(before)
    })

    it('should return false on empty map', () => {
      expect(bcm.decrement('key')).toBe(false)
    })

    it('should work multiple times when count allows', () => {
      bcm.set('key', 1, 5)
      expect(bcm.decrement('key')).toBe(true)
      expect(bcm.decrement('key')).toBe(true)
      expect(bcm.decrement('key')).toBe(true)
    })

    it('should stop returning true at count 1', () => {
      bcm.set('key', 1, 3)
      expect(bcm.decrement('key')).toBe(true)
      expect(bcm.decrement('key')).toBe(true)
      expect(bcm.decrement('key')).toBe(false)
    })

    it('should preserve value', () => {
      bcm.set('key', 42, 3)
      bcm.decrement('key')
      expect(bcm.get('key')).toBe(42)
    })

    it('should not change size', () => {
      bcm.set('key', 1, 3)
      expect(bcm.size).toBe(1)
      bcm.decrement('key')
      expect(bcm.size).toBe(1)
    })

    it('should handle unicode key', () => {
      bcm.set('🎉', 1, 3)
      expect(bcm.decrement('🎉')).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for new map', () => {
      expect(bcm.size).toBe(0)
    })

    it('should return 1 after one set', () => {
      bcm.set('key', 1)
      expect(bcm.size).toBe(1)
    })

    it('should increase with multiple unique sets', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      expect(bcm.size).toBe(3)
    })

    it('should not increase when overwriting', () => {
      bcm.set('key', 1)
      bcm.set('key', 2)
      expect(bcm.size).toBe(1)
    })

    it('should decrease after delete', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.delete('a')
      expect(bcm.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.size).toBe(0)
    })

    it('should handle many entries', () => {
      for (let i = 0; i < 100; i++) {
        bcm.set(`key-${i}`, i)
      }
      expect(bcm.size).toBe(100)
    })
  })

  describe('capacity', () => {
    it('should return default capacity', () => {
      expect(bcm.capacity).toBe(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity)
    })

    it('should return custom capacity', () => {
      const m = new BloomCountMap<number>({ capacity: 5000 })
      expect(m.capacity).toBe(5000)
    })

    it('should be unchanged after operations', () => {
      const cap = bcm.capacity
      bcm.set('key', 1)
      expect(bcm.capacity).toBe(cap)
    })

    it('should be unchanged after clear', () => {
      const cap = bcm.capacity
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.capacity).toBe(cap)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      bcm.clear()
      expect(bcm.size).toBe(0)
    })

    it('should make has return false', () => {
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.has('key')).toBe(false)
    })

    it('should make get return undefined', () => {
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.get('key')).toBeUndefined()
    })

    it('should allow adding after clear', () => {
      bcm.set('first', 1)
      bcm.clear()
      bcm.set('second', 2)
      expect(bcm.size).toBe(1)
      expect(bcm.get('second')).toBe(2)
    })

    it('should reset approximateSize', () => {
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.approximateSize).toBe(0)
    })

    it('should handle clearing empty map', () => {
      bcm.clear()
      expect(bcm.size).toBe(0)
      expect(bcm.approximateSize).toBe(0)
    })

    it('should reset count for all keys', () => {
      bcm.set('a', 1, 5)
      bcm.set('b', 2, 10)
      bcm.clear()
      expect(bcm.count('a')).toBe(0)
      expect(bcm.count('b')).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(bcm.keys()).toEqual([])
    })

    it('should return all keys', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      const k = bcm.keys()
      expect(k).toContain('a')
      expect(k).toContain('b')
      expect(k).toContain('c')
    })

    it('should return keys in insertion order', () => {
      bcm.set('x', 1)
      bcm.set('y', 2)
      bcm.set('z', 3)
      expect(bcm.keys()).toEqual(['x', 'y', 'z'])
    })

    it('should reflect removals', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.delete('a')
      expect(bcm.keys()).toEqual(['b'])
    })

    it('should handle many keys', () => {
      for (let i = 0; i < 50; i++) {
        bcm.set(`key-${i}`, i)
      }
      expect(bcm.keys().length).toBe(50)
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(bcm.values()).toEqual([])
    })

    it('should return all values', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      const v = bcm.values()
      expect(v).toContain(1)
      expect(v).toContain(2)
    })

    it('should return values in insertion order', () => {
      bcm.set('x', 10)
      bcm.set('y', 20)
      bcm.set('z', 30)
      expect(bcm.values()).toEqual([10, 20, 30])
    })

    it('should reflect updated values', () => {
      bcm.set('key', 1)
      bcm.set('key', 99)
      expect(bcm.values()).toEqual([99])
    })

    it('should handle many values', () => {
      for (let i = 0; i < 50; i++) {
        bcm.set(`key-${i}`, i)
      }
      expect(bcm.values().length).toBe(50)
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(bcm.entries()).toEqual([])
    })

    it('should return all entries', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      const e = bcm.entries()
      expect(e.length).toBe(2)
    })

    it('should match keys and values', () => {
      bcm.set('x', 10)
      bcm.set('y', 20)
      const e = bcm.entries()
      expect(e[0]).toEqual(['x', 10])
      expect(e[1]).toEqual(['y', 20])
    })

    it('should reflect updates', () => {
      bcm.set('key', 1)
      bcm.set('key', 42)
      expect(bcm.entries()).toEqual([['key', 42]])
    })

    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        bcm.set(`key-${i}`, i)
      }
      expect(bcm.entries().length).toBe(50)
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      const result: [string, number][] = []
      bcm.forEach((value, key) => {
        result.push([key, value])
      })
      expect(result.length).toBe(2)
    })

    it('should provide correct value and key', () => {
      bcm.set('key', 42)
      bcm.forEach((value, key) => {
        expect(key).toBe('key')
        expect(value).toBe(42)
      })
    })

    it('should not iterate on empty map', () => {
      let calls = 0
      bcm.forEach(() => {
        calls++
      })
      expect(calls).toBe(0)
    })

    it('should iterate in insertion order', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      const keys: string[] = []
      bcm.forEach((_value, key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['a', 'b', 'c'])
    })

    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        bcm.set(`key-${i}`, i)
      }
      let count = 0
      bcm.forEach(() => {
        count++
      })
      expect(count).toBe(50)
    })
  })

  describe('approximateSize', () => {
    it('should be 0 for empty map', () => {
      expect(bcm.approximateSize).toBe(0)
    })

    it('should increase with set', () => {
      bcm.set('key', 1)
      expect(bcm.approximateSize).toBeGreaterThanOrEqual(1)
    })

    it('should reflect total bloom operations', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.set('c', 3)
      expect(bcm.approximateSize).toBeGreaterThanOrEqual(3)
    })

    it('should reflect count in approximate size', () => {
      bcm.set('key', 1, 5)
      expect(bcm.approximateSize).toBeGreaterThanOrEqual(5)
    })

    it('should reset with clear', () => {
      bcm.set('key', 1)
      bcm.clear()
      expect(bcm.approximateSize).toBe(0)
    })

    it('should reflect increment operations', () => {
      bcm.set('key', 1)
      const before = bcm.approximateSize
      bcm.increment('key')
      expect(bcm.approximateSize).toBeGreaterThan(before)
    })
  })

  describe('integration', () => {
    it('should handle mixed set, increment, decrement', () => {
      bcm.set('key', 1, 5)
      bcm.increment('key')
      bcm.decrement('key')
      expect(bcm.has('key')).toBe(true)
      expect(bcm.get('key')).toBe(1)
    })

    it('should handle unicode throughout lifecycle', () => {
      bcm.set('日本語🎉', 1)
      expect(bcm.has('日本語🎉')).toBe(true)
      bcm.increment('日本語🎉')
      bcm.decrement('日本語🎉')
      expect(bcm.get('日本語🎉')).toBe(1)
      bcm.delete('日本語🎉')
      expect(bcm.has('日本語🎉')).toBe(false)
    })

    it('should handle numeric string keys', () => {
      bcm.set('123', 1)
      bcm.set('456', 2)
      expect(bcm.get('123')).toBe(1)
      expect(bcm.get('456')).toBe(2)
    })

    it('should handle rapid set and delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        bcm.set('key', cycle)
        expect(bcm.has('key')).toBe(true)
        bcm.delete('key')
        expect(bcm.has('key')).toBe(false)
      }
      expect(bcm.size).toBe(0)
    })

    it('should handle large number of entries', () => {
      const m = new BloomCountMap<number>({ capacity: 10000 })
      for (let i = 0; i < 1000; i++) {
        m.set(`key-${i}`, i)
      }
      expect(m.size).toBe(1000)
      expect(m.get('key-0')).toBe(0)
      expect(m.get('key-999')).toBe(999)
    })

    it('should handle set-delete-readd cycle', () => {
      bcm.set('key', 1, 5)
      bcm.delete('key')
      bcm.set('key', 2, 3)
      expect(bcm.get('key')).toBe(2)
      expect(bcm.has('key')).toBe(true)
    })

    it('should handle increment-decrement cycles', () => {
      bcm.set('key', 1, 5)
      for (let i = 0; i < 3; i++) {
        bcm.increment('key')
        bcm.decrement('key')
      }
      expect(bcm.has('key')).toBe(true)
      expect(bcm.get('key')).toBe(1)
    })

    it('should work with object values', () => {
      interface Item {
        id: number
        name: string
      }
      const m = new BloomCountMap<Item>()
      m.set('item1', { id: 1, name: 'first' })
      m.set('item2', { id: 2, name: 'second' })
      expect(m.get('item1')?.name).toBe('first')
      expect(m.get('item2')?.id).toBe(2)
    })

    it('should work with array values', () => {
      const m = new BloomCountMap<number[]>()
      m.set('list', [1, 2, 3])
      expect(m.get('list')).toEqual([1, 2, 3])
    })

    it('should handle interleaved operations on multiple keys', () => {
      bcm.set('a', 1, 2)
      bcm.set('b', 2, 3)
      bcm.increment('a')
      bcm.decrement('b')
      bcm.set('c', 3)
      expect(bcm.size).toBe(3)
      expect(bcm.has('a')).toBe(true)
      expect(bcm.has('b')).toBe(true)
      expect(bcm.has('c')).toBe(true)
    })

    it('should handle forEach after complex operations', () => {
      bcm.set('a', 1)
      bcm.set('b', 2)
      bcm.delete('a')
      bcm.set('c', 3)
      const keys: string[] = []
      bcm.forEach((_value, key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['b', 'c'])
    })

    it('should export DEFAULT_BLOOM_COUNT_MAP_OPTIONS', () => {
      expect(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity).toBe(1000)
      expect(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.errorRate).toBe(0.01)
    })

    it('should handle whitespace-only keys', () => {
      bcm.set('   ', 1)
      bcm.set('\t', 2)
      bcm.set('\n', 3)
      expect(bcm.size).toBe(3)
      expect(bcm.get('   ')).toBe(1)
      expect(bcm.get('\t')).toBe(2)
      expect(bcm.get('\n')).toBe(3)
    })

    it('should handle keys with null characters', () => {
      bcm.set('before\0after', 1)
      expect(bcm.get('before\0after')).toBe(1)
      expect(bcm.has('before\0after')).toBe(true)
    })
  })
})
