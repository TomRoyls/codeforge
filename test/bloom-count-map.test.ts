import { describe, it, expect } from 'vitest'
import { BloomCountMap, DEFAULT_BLOOM_COUNT_MAP_OPTIONS } from '../src/core/bloom-count-map/bloom-count-map.js'

describe('BloomCountMap', () => {
  describe('constructor', () => {
    it('should create a map with default options', () => {
      const map = new BloomCountMap<string>()
      expect(map.size).toBe(0)
      expect(map.capacity).toBe(DEFAULT_BLOOM_COUNT_MAP_OPTIONS.capacity)
    })

    it('should create a map with custom capacity', () => {
      const map = new BloomCountMap<string>({ capacity: 500 })
      expect(map.capacity).toBe(500)
    })

    it('should create a map with custom error rate', () => {
      const map = new BloomCountMap<string>({ capacity: 2000, errorRate: 0.001 })
      expect(map.capacity).toBe(2000)
    })

    it('should start empty', () => {
      const map = new BloomCountMap<number>()
      expect(map.size).toBe(0)
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })
  })

  describe('set and get', () => {
    it('should set and get a value', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.get('key1')).toBe('value1')
    })

    it('should return undefined for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('should overwrite existing value', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      map.set('key1', 'value2')
      expect(map.get('key1')).toBe('value2')
      expect(map.size).toBe(1)
    })

    it('should set with explicit count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      expect(map.count('key1')).toBe(5)
    })

    it('should set multiple keys', () => {
      const map = new BloomCountMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('should handle different value types', () => {
      const numMap = new BloomCountMap<number>()
      numMap.set('k', 42)
      expect(numMap.get('k')).toBe(42)

      const objMap = new BloomCountMap<{ name: string }>()
      objMap.set('k', { name: 'test' })
      expect(objMap.get('k')!.name).toBe('test')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.has('key1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.has('missing')).toBe(false)
    })

    it('should return false after deletion', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      map.delete('key1')
      expect(map.has('key1')).toBe(false)
    })
  })

  describe('count', () => {
    it('should return 1 for default count on new key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.count('key1')).toBe(1)
    })

    it('should return 0 for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.count('missing')).toBe(0)
    })

    it('should reflect explicit count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 10)
      expect(map.count('key1')).toBe(10)
    })

    it('should update count when setting same key with different count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      expect(map.count('key1')).toBe(5)

      map.set('key1', 'value2', 3)
      expect(map.count('key1')).toBe(3)
    })

    it('should preserve count when overwriting value without specifying count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      map.set('key1', 'value2')
      expect(map.count('key1')).toBe(5)
    })
  })

  describe('increment', () => {
    it('should increment count for existing key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.increment('key1')).toBe(true)
      expect(map.count('key1')).toBe(2)
    })

    it('should return false for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.increment('missing')).toBe(false)
    })

    it('should increment multiple times', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      map.increment('key1')
      map.increment('key1')
      map.increment('key1')
      expect(map.count('key1')).toBe(4)
    })

    it('should work after setting explicit count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      map.increment('key1')
      expect(map.count('key1')).toBe(6)
    })
  })

  describe('decrement', () => {
    it('should decrement count for existing key with count > 1', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      expect(map.decrement('key1')).toBe(true)
      expect(map.count('key1')).toBe(4)
    })

    it('should return false when count would reach zero', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.decrement('key1')).toBe(false)
      expect(map.count('key1')).toBe(1)
    })

    it('should return false for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.decrement('missing')).toBe(false)
    })

    it('should decrement multiple times but not below 1', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 3)
      expect(map.decrement('key1')).toBe(true)
      expect(map.count('key1')).toBe(2)
      expect(map.decrement('key1')).toBe(true)
      expect(map.count('key1')).toBe(1)
      expect(map.decrement('key1')).toBe(false)
      expect(map.count('key1')).toBe(1)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1')
      expect(map.delete('key1')).toBe(true)
      expect(map.has('key1')).toBe(false)
      expect(map.size).toBe(0)
    })

    it('should return false for non-existent key', () => {
      const map = new BloomCountMap<string>()
      expect(map.delete('missing')).toBe(false)
    })

    it('should remove bloom filter entries for the key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      map.delete('key1')
      expect(map.count('key1')).toBe(0)
    })

    it('should only delete the specified key', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      map.set('c', 'vc')
      map.delete('b')
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(false)
      expect(map.has('c')).toBe(true)
      expect(map.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      map.set('c', 'vc')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(false)
      expect(map.has('c')).toBe(false)
    })

    it('should reset count tracking', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 10)
      map.clear()
      map.set('key1', 'value1')
      expect(map.count('key1')).toBe(1)
    })
  })

  describe('keys, values, entries', () => {
    it('should return all keys', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      map.set('c', 'vc')
      expect(map.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should return all values', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      map.set('c', 'vc')
      expect(map.values()).toEqual(['va', 'vb', 'vc'])
    })

    it('should return all entries', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      expect(map.entries()).toEqual([
        ['a', 'va'],
        ['b', 'vb'],
      ])
    })

    it('should return empty arrays when map is empty', () => {
      const map = new BloomCountMap<string>()
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const map = new BloomCountMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const collected: [string, number][] = []
      map.forEach((value, key) => {
        collected.push([key, value])
      })
      expect(collected).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should not iterate on empty map', () => {
      const map = new BloomCountMap<string>()
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })
  })

  describe('size and capacity', () => {
    it('should track size correctly', () => {
      const map = new BloomCountMap<string>()
      expect(map.size).toBe(0)
      map.set('a', 'va')
      expect(map.size).toBe(1)
      map.set('b', 'vb')
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('should not increase size when overwriting', () => {
      const map = new BloomCountMap<string>()
      map.set('key', 'v1')
      map.set('key', 'v2')
      expect(map.size).toBe(1)
    })

    it('should return configured capacity', () => {
      const map = new BloomCountMap<string>({ capacity: 500 })
      expect(map.capacity).toBe(500)
    })
  })

  describe('approximateSize', () => {
    it('should start at 0', () => {
      const map = new BloomCountMap<string>()
      expect(map.approximateSize).toBe(0)
    })

    it('should reflect added items', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va')
      map.set('b', 'vb')
      expect(map.approximateSize).toBe(2)
    })

    it('should account for explicit counts', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 3)
      expect(map.approximateSize).toBe(3)
    })

    it('should decrease after delete', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va', 2)
      map.set('b', 'vb')
      map.delete('a')
      expect(map.approximateSize).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const map = new BloomCountMap<string>()
      map.set('', 'empty')
      expect(map.get('')).toBe('empty')
      expect(map.has('')).toBe(true)
      expect(map.count('')).toBe(1)
    })

    it('should handle large explicit count', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 100)
      expect(map.count('key1')).toBe(100)
    })

    it('should handle increment and decrement sequence', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 3)
      map.increment('key1')
      expect(map.count('key1')).toBe(4)
      map.decrement('key1')
      map.decrement('key1')
      expect(map.count('key1')).toBe(2)
    })

    it('should handle set with count on existing key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 3)
      map.set('key1', 'value2', 7)
      expect(map.get('key1')).toBe('value2')
      expect(map.count('key1')).toBe(7)
    })

    it('should handle many operations on same key', () => {
      const map = new BloomCountMap<number>()
      map.set('x', 1, 10)
      for (let i = 0; i < 5; i++) map.decrement('x')
      expect(map.count('x')).toBe(5)
      for (let i = 0; i < 3; i++) map.increment('x')
      expect(map.count('x')).toBe(8)
      map.delete('x')
      expect(map.has('x')).toBe(false)
      expect(map.count('x')).toBe(0)
    })

    it('should handle re-adding deleted key', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 5)
      map.delete('key1')
      map.set('key1', 'newValue', 3)
      expect(map.get('key1')).toBe('newValue')
      expect(map.count('key1')).toBe(3)
      expect(map.size).toBe(1)
    })

    it('should handle set with count=1 same as default', () => {
      const map = new BloomCountMap<string>()
      map.set('key1', 'value1', 1)
      expect(map.count('key1')).toBe(1)
    })

    it('should maintain separate counts per key', () => {
      const map = new BloomCountMap<string>()
      map.set('a', 'va', 2)
      map.set('b', 'vb', 7)
      map.set('c', 'vc', 1)
      expect(map.count('a')).toBe(2)
      expect(map.count('b')).toBe(7)
      expect(map.count('c')).toBe(1)
    })
  })
})
