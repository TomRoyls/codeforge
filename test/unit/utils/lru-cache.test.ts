import { describe, test, expect, beforeEach } from 'vitest'
import { LRUCache } from '../../../src/utils/lru-cache'

describe('LRUCache', () => {
  let cache: LRUCache<string, number>

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3 })
  })

  describe('constructor', () => {
    test('creates cache with specified maxSize', () => {
      const newCache = new LRUCache({ maxSize: 5 })
      expect(newCache.size).toBe(0)
    })

    test('creates empty cache', () => {
      expect(cache.size).toBe(0)
    })
  })

  describe('get', () => {
    test('returns value for existing key', () => {
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    test('returns undefined for non-existing key', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    test('updates access order on hit', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to update its position
      cache.get('a')

      // Add new item to trigger eviction
      cache.set('d', 4)

      // 'b' should be evicted (oldest), 'a' should still be there
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('does not update access order on miss', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      // Get non-existent key
      cache.get('x')

      // Add new item
      cache.set('c', 3)
      cache.set('d', 4)

      // 'a' should be evicted (oldest)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })
  })

  describe('set', () => {
    test('adds new entry', () => {
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      expect(cache.size).toBe(1)
    })

    test('updates existing entry', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })

    test('updates access order when updating existing entry', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Update 'a'
      cache.set('a', 10)

      // Add new item
      cache.set('d', 4)

      // 'b' should be evicted (oldest), 'a' should be there
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('evicts oldest entry when at capacity', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Adding 'd' should evict 'a'
      cache.set('d', 4)

      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('has', () => {
    test('returns true for existing key', () => {
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    test('returns false for non-existing key', () => {
      expect(cache.has('nonexistent')).toBe(false)
    })

    test('returns false for empty cache', () => {
      expect(cache.has('anything')).toBe(false)
    })
  })

  describe('delete', () => {
    test('deletes existing key and returns true', () => {
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.size).toBe(0)
    })

    test('returns false for non-existing key', () => {
      expect(cache.delete('nonexistent')).toBe(false)
      expect(cache.size).toBe(0)
    })

    test('removes key from access order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')

      // Add two new items to fill cache and test eviction
      cache.set('d', 4)
      cache.set('e', 5)

      // 'a' should be evicted (oldest), 'b' was deleted, 'c', 'd', and 'e' remain
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })
  })

  describe('clear', () => {
    test('clears all entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(false)
    })

    test('clears empty cache', () => {
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('size property', () => {
    test('returns 0 for empty cache', () => {
      expect(cache.size).toBe(0)
    })

    test('returns correct size after additions', () => {
      cache.set('a', 1)
      expect(cache.size).toBe(1)

      cache.set('b', 2)
      expect(cache.size).toBe(2)

      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })

    test('returns correct size after deletions', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    test('maintains size after eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Should evict 'a'
      cache.set('d', 4)

      expect(cache.size).toBe(3)
    })
  })

  describe('forEach', () => {
    test('iterates over all entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => {
        entries.push([key, value])
      })

      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
    })

    test('does not iterate over empty cache', () => {
      const calls: Array<[string, number]> = []
      cache.forEach((value, key) => {
        calls.push([key, value])
      })

      expect(calls).toHaveLength(0)
    })
  })

  describe('entries', () => {
    test('returns iterable of key-value pairs', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const entries = Array.from(cache.entries())
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
    })

    test('returns empty iterable for empty cache', () => {
      const entries = Array.from(cache.entries())
      expect(entries).toHaveLength(0)
    })
  })

  describe('keys', () => {
    test('returns iterable of keys', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const keys = Array.from(cache.keys())
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    test('returns empty iterable for empty cache', () => {
      const keys = Array.from(cache.keys())
      expect(keys).toHaveLength(0)
    })
  })

  describe('values', () => {
    test('returns iterable of values', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const values = Array.from(cache.values())
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    test('returns empty iterable for empty cache', () => {
      const values = Array.from(cache.values())
      expect(values).toHaveLength(0)
    })
  })

  describe('getOrDefault', () => {
    test('returns value for existing key', () => {
      cache.set('a', 1)
      expect(cache.getOrDefault('a', 99)).toBe(1)
    })

    test('returns default for non-existing key', () => {
      expect(cache.getOrDefault('nonexistent', 99)).toBe(99)
    })

    test('updates access order on hit', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to update its position
      cache.getOrDefault('a', 99)

      // Add new item to trigger eviction
      cache.set('d', 4)

      // 'b' should be evicted (oldest), 'a' should still be there
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('LRU eviction behavior', () => {
    test('evicts oldest entry when cache is full', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // This should evict 'a' (oldest)
      cache.set('d', 4)

      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('get updates access order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to make it most recently used
      cache.get('a')

      // Add 'd' - should evict 'b' (now oldest)
      cache.set('d', 4)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('set updates access order for existing key', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Update 'a' to make it most recently used
      cache.set('a', 10)

      // Add 'd' - should evict 'b' (now oldest)
      cache.set('d', 4)

      expect(cache.get('a')).toBe(10)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('getOrDefault updates access order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' via getOrDefault
      cache.getOrDefault('a', 99)

      // Add 'd' - should evict 'b' (now oldest)
      cache.set('d', 4)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('handles empty cache operations', () => {
      expect(cache.size).toBe(0)
      expect(cache.get('key')).toBeUndefined()
      expect(cache.has('key')).toBe(false)
      expect(cache.delete('key')).toBe(false)
      expect(Array.from(cache.keys())).toHaveLength(0)
      expect(Array.from(cache.values())).toHaveLength(0)
      expect(Array.from(cache.entries())).toHaveLength(0)
    })

    test('handles single item cache', () => {
      const singleCache = new LRUCache({ maxSize: 1 })

      singleCache.set('a', 1)
      expect(singleCache.size).toBe(1)
      expect(singleCache.get('a')).toBe(1)

      singleCache.set('b', 2)
      expect(singleCache.size).toBe(1)
      expect(singleCache.has('a')).toBe(false)
      expect(singleCache.get('b')).toBe(2)
    })

    test('handles maxSize of 1 with repeated updates', () => {
      const singleCache = new LRUCache({ maxSize: 1 })

      singleCache.set('a', 1)
      expect(singleCache.get('a')).toBe(1)

      singleCache.set('a', 2)
      expect(singleCache.get('a')).toBe(2)
      expect(singleCache.size).toBe(1)

      singleCache.set('b', 3)
      expect(singleCache.has('a')).toBe(false)
      expect(singleCache.get('b')).toBe(3)
    })

    test('handles clearing then adding new items', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      cache.clear()

      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)

      expect(cache.size).toBe(3)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('handles deleting then adding new items', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')

      cache.set('d', 4)

      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('handles null and undefined values', () => {
      cache.set('a', null as unknown as number)
      expect(cache.get('a')).toBeNull()

      cache.set('b', undefined as unknown as number)
      expect(cache.get('b')).toBeUndefined()
    })

    test('handles string keys', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)

      expect(cache.get('key1')).toBe(1)
      expect(cache.get('key2')).toBe(2)
    })

    test('handles numeric keys', () => {
      const numericCache = new LRUCache<number, string>({ maxSize: 3 })

      numericCache.set(1, 'one')
      numericCache.set(2, 'two')

      expect(numericCache.get(1)).toBe('one')
      expect(numericCache.get(2)).toBe('two')
    })
  })

  describe('type safety', () => {
    test('works with string keys and number values', () => {
      cache.set('a', 1)
      const value: number | undefined = cache.get('a')
      expect(typeof value).toBe('number')
    })

    test('works with number keys and string values', () => {
      const numericCache = new LRUCache<number, string>({ maxSize: 3 })
      numericCache.set(1, 'one')
      const value: string | undefined = numericCache.get(1)
      expect(typeof value).toBe('string')
    })
  })

  describe('constructor variations', () => {
    test('creates cache with maxSize 0', () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 })
      expect(zeroCache.size).toBe(0)
    })

    test('cache with maxSize 0 allows first set then evicts on second', () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 })
      zeroCache.set('a', 1)
      expect(zeroCache.size).toBe(1)
      zeroCache.set('b', 2)
      expect(zeroCache.size).toBe(1)
      expect(zeroCache.has('a')).toBe(false)
    })

    test('cache with maxSize 0 evicts oldest on each new set', () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 })
      zeroCache.set('a', 1)
      zeroCache.set('b', 2)
      zeroCache.set('c', 3)
      expect(zeroCache.size).toBe(1)
      expect(zeroCache.has('a')).toBe(false)
      expect(zeroCache.has('b')).toBe(false)
      expect(zeroCache.has('c')).toBe(true)
    })

    test('creates cache with large maxSize', () => {
      const largeCache = new LRUCache<number, string>({ maxSize: 10000 })
      expect(largeCache.size).toBe(0)
    })

    test('multiple instances are independent', () => {
      const cache1 = new LRUCache<string, number>({ maxSize: 3 })
      const cache2 = new LRUCache<string, number>({ maxSize: 3 })

      cache1.set('a', 1)
      cache2.set('b', 2)

      expect(cache1.has('a')).toBe(true)
      expect(cache1.has('b')).toBe(false)
      expect(cache2.has('a')).toBe(false)
      expect(cache2.has('b')).toBe(true)
    })

    test('creates cache with maxSize 2', () => {
      const twoCache = new LRUCache<string, number>({ maxSize: 2 })
      twoCache.set('a', 1)
      twoCache.set('b', 2)
      expect(twoCache.size).toBe(2)

      twoCache.set('c', 3)
      expect(twoCache.size).toBe(2)
      expect(twoCache.has('a')).toBe(false)
    })
  })

  describe('get - extended', () => {
    test('returns undefined after eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts 'a'

      expect(cache.get('a')).toBeUndefined()
    })

    test('returns updated value after overwrite', () => {
      cache.set('a', 1)
      cache.set('a', 100)
      expect(cache.get('a')).toBe(100)
    })

    test('returns correct value after multiple overwrites', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      cache.set('a', 4)
      expect(cache.get('a')).toBe(4)
      expect(cache.size).toBe(1)
    })

    test('returns undefined after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.get('a')).toBeUndefined()
    })

    test('returns undefined after delete', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })

    test('get same key multiple times returns same value', () => {
      cache.set('a', 42)
      expect(cache.get('a')).toBe(42)
      expect(cache.get('a')).toBe(42)
      expect(cache.get('a')).toBe(42)
    })

    test('get on empty cache returns undefined', () => {
      expect(cache.get('anything')).toBeUndefined()
    })

    test('get after multiple evictions returns correct values', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a
      cache.set('e', 5) // evicts b

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
      expect(cache.get('e')).toBe(5)
    })

    test('get with empty string key', () => {
      cache.set('', 99)
      expect(cache.get('')).toBe(99)
    })

    test('get with key containing special characters', () => {
      const specialCache = new LRUCache<string, number>({ maxSize: 5 })
      specialCache.set('key-with-dashes', 1)
      specialCache.set('key_with_underscores', 2)
      specialCache.set('key.with.dots', 3)
      specialCache.set('key/with/slashes', 4)

      expect(specialCache.get('key-with-dashes')).toBe(1)
      expect(specialCache.get('key_with_underscores')).toBe(2)
      expect(specialCache.get('key.with.dots')).toBe(3)
      expect(specialCache.get('key/with/slashes')).toBe(4)
    })
  })

  describe('set - extended', () => {
    test('set with zero value', () => {
      cache.set('a', 0)
      expect(cache.get('a')).toBe(0)
      expect(cache.has('a')).toBe(true)
    })

    test('set with negative value', () => {
      cache.set('a', -1)
      expect(cache.get('a')).toBe(-1)
    })

    test('set with very large number', () => {
      cache.set('a', Number.MAX_SAFE_INTEGER)
      expect(cache.get('a')).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('set with NaN value', () => {
      cache.set('a', NaN)
      expect(cache.get('a')).toBeNaN()
    })

    test('set with Infinity value', () => {
      cache.set('a', Infinity)
      expect(cache.get('a')).toBe(Infinity)
    })

    test('set with -Infinity value', () => {
      cache.set('a', -Infinity)
      expect(cache.get('a')).toBe(-Infinity)
    })

    test('set with empty string key', () => {
      cache.set('', 42)
      expect(cache.get('')).toBe(42)
      expect(cache.size).toBe(1)
    })

    test('set same key does not increase size', () => {
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      cache.set('a', 2)
      expect(cache.size).toBe(1)
      cache.set('a', 3)
      expect(cache.size).toBe(1)
    })

    test('set after clear works correctly', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      cache.set('d', 4)

      expect(cache.size).toBe(1)
      expect(cache.get('d')).toBe(4)
    })

    test('set after delete uses freed slot', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')

      cache.set('d', 4)
      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('set triggers exactly one eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Only 'a' should be evicted
      cache.set('d', 4)
      expect(cache.size).toBe(3)
    })

    test('set below capacity does not evict', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
    })

    test('set at exactly capacity does not evict', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      // At capacity but no eviction yet
      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(true)
    })

    test('set with object values', () => {
      const objCache = new LRUCache<string, Record<string, unknown>>({ maxSize: 3 })
      objCache.set('a', { name: 'test', count: 1 })
      const result = objCache.get('a')
      expect(result).toEqual({ name: 'test', count: 1 })
    })

    test('set with array values', () => {
      const arrCache = new LRUCache<string, number[]>({ maxSize: 3 })
      arrCache.set('a', [1, 2, 3])
      expect(arrCache.get('a')).toEqual([1, 2, 3])
    })

    test('overwriting value does not change size', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const sizeBefore = cache.size
      cache.set('a', 100)
      expect(cache.size).toBe(sizeBefore)
    })

    test('set with boolean keys', () => {
      const boolCache = new LRUCache<boolean, string>({ maxSize: 3 })
      boolCache.set(true, 'yes')
      boolCache.set(false, 'no')
      expect(boolCache.get(true)).toBe('yes')
      expect(boolCache.get(false)).toBe('no')
    })

    test('set with numeric key 0', () => {
      const numCache = new LRUCache<number, string>({ maxSize: 3 })
      numCache.set(0, 'zero')
      expect(numCache.get(0)).toBe('zero')
    })

    test('set with numeric key negative', () => {
      const numCache = new LRUCache<number, string>({ maxSize: 3 })
      numCache.set(-1, 'negative')
      expect(numCache.get(-1)).toBe('negative')
    })

    test('set with numeric key float', () => {
      const numCache = new LRUCache<number, string>({ maxSize: 3 })
      numCache.set(3.14, 'pi')
      expect(numCache.get(3.14)).toBe('pi')
    })
  })

  describe('eviction - extended patterns', () => {
    test('multiple sequential evictions', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a
      cache.set('e', 5) // evicts b
      cache.set('f', 6) // evicts c

      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
      expect(cache.has('f')).toBe(true)
    })

    test('eviction with interspersed gets', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a') // a is now most recent
      cache.set('d', 4) // evicts b

      cache.get('c') // c is now most recent
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('eviction after delete creates room', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b') // size is now 2
      cache.set('d', 4) // no eviction needed, size is 3
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
      expect(cache.size).toBe(3)
    })

    test('eviction respects access order after multiple gets', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a') // order: b, c, a
      cache.get('b') // order: c, a, b
      cache.get('c') // order: a, b, c

      cache.set('d', 4) // evicts a (LRU)

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('eviction of first element when no gets', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      expect(cache.has('a')).toBe(false)
    })

    test('eviction preserves recently accessed middle element', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('b') // b is now most recent
      cache.set('d', 4) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    test('full cycle: fill, evict, access, evict', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      cache.get('b') // b is now most recent
      cache.set('e', 5) // evicts c

      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
    })

    test('rapid eviction with maxSize 1', () => {
      const single = new LRUCache<string, number>({ maxSize: 1 })
      for (let i = 0; i < 10; i++) {
        single.set(`key${i}`, i)
      }
      expect(single.size).toBe(1)
      expect(single.get('key9')).toBe(9)
      expect(single.has('key0')).toBe(false)
    })

    test('eviction with maxSize 2', () => {
      const two = new LRUCache<string, number>({ maxSize: 2 })
      two.set('a', 1)
      two.set('b', 2)
      two.set('c', 3) // evicts a

      expect(two.has('a')).toBe(false)
      expect(two.has('b')).toBe(true)
      expect(two.has('c')).toBe(true)
      expect(two.size).toBe(2)
    })

    test('eviction after repeated overwrites', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Overwrite 'a' many times
      for (let i = 0; i < 5; i++) {
        cache.set('a', i)
      }

      // a is most recent, b is LRU
      cache.set('d', 4) // evicts b

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.get('a')).toBe(4)
    })

    test('eviction cascade: fill, clear, fill, evict', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      cache.set('x', 10)
      cache.set('y', 20)
      cache.set('z', 30)

      // Old keys should not be present
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)

      cache.set('w', 40) // evicts x
      expect(cache.has('x')).toBe(false)
      expect(cache.has('z')).toBe(true)
    })
  })

  describe('has - extended', () => {
    test('returns false after eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      expect(cache.has('a')).toBe(false)
    })

    test('returns false after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.has('a')).toBe(false)
    })

    test('returns false after delete', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    test('returns true after overwrite', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.has('a')).toBe(true)
    })

    test('returns false for key never added', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.has('c')).toBe(false)
    })

    test('returns true for numeric key', () => {
      const numCache = new LRUCache<number, string>({ maxSize: 3 })
      numCache.set(42, 'answer')
      expect(numCache.has(42)).toBe(true)
      expect(numCache.has(99)).toBe(false)
    })

    test('returns true for boolean key true', () => {
      const boolCache = new LRUCache<boolean, string>({ maxSize: 3 })
      boolCache.set(true, 'yes')
      expect(boolCache.has(true)).toBe(true)
    })

    test('returns true for boolean key false', () => {
      const boolCache = new LRUCache<boolean, string>({ maxSize: 3 })
      boolCache.set(false, 'no')
      expect(boolCache.has(false)).toBe(true)
    })
  })

  describe('delete - extended', () => {
    test('delete first inserted item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.delete('a')).toBe(true)
      expect(cache.size).toBe(2)
      expect(cache.has('a')).toBe(false)
    })

    test('delete last inserted item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.delete('c')).toBe(true)
      expect(cache.size).toBe(2)
      expect(cache.has('c')).toBe(false)
    })

    test('delete middle item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.delete('b')).toBe(true)
      expect(cache.size).toBe(2)
      expect(cache.has('b')).toBe(false)
    })

    test('delete already deleted key returns false', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.delete('a')).toBe(false)
    })

    test('delete after eviction returns false for evicted key', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      expect(cache.delete('a')).toBe(false)
    })

    test('delete after clear returns false', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.delete('a')).toBe(false)
    })

    test('multiple deletes reduce size correctly', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('a')
      expect(cache.size).toBe(2)
      cache.delete('b')
      expect(cache.size).toBe(1)
      cache.delete('c')
      expect(cache.size).toBe(0)
    })

    test('delete allows re-insertion of same key', () => {
      cache.set('a', 1)
      cache.delete('a')
      cache.set('a', 2)

      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(2)
    })

    test('delete from empty cache returns false', () => {
      expect(cache.delete('nonexistent')).toBe(false)
    })

    test('delete maintains access order for remaining items', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')

      // Now fill to capacity and add one more
      cache.set('d', 4) // a, c, d
      cache.set('e', 5) // evicts a (oldest)

      expect(cache.has('a')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('delete only item leaves empty cache', () => {
      const single = new LRUCache<string, number>({ maxSize: 3 })
      single.set('a', 1)
      single.delete('a')
      expect(single.size).toBe(0)
      expect(single.has('a')).toBe(false)
    })

    test('delete all items one by one', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')
      cache.delete('a')
      cache.delete('c')

      expect(cache.size).toBe(0)
    })
  })

  describe('clear - extended', () => {
    test('clear twice in a row', () => {
      cache.set('a', 1)
      cache.clear()
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('clear after partial eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(false)
    })

    test('clear then fill again', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()

      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)

      expect(cache.size).toBe(3)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('size after clear is 0', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
    })

    test('keys after clear is empty', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(Array.from(cache.keys())).toHaveLength(0)
    })

    test('values after clear is empty', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(Array.from(cache.values())).toHaveLength(0)
    })

    test('entries after clear is empty', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(Array.from(cache.entries())).toHaveLength(0)
    })

    test('clear allows fresh start without eviction artifacts', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a
      cache.clear()

      // New items should work normally
      cache.set('x', 10)
      cache.set('y', 20)
      expect(cache.size).toBe(2)
      expect(cache.has('x')).toBe(true)
    })
  })

  describe('size - extended', () => {
    test('size after multiple overwrites stays at 1', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      expect(cache.size).toBe(1)
    })

    test('size after eviction chain stays at maxSize', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      cache.set('f', 6)
      expect(cache.size).toBe(3)
    })

    test('size after delete and add', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')
      cache.set('d', 4)
      expect(cache.size).toBe(3)
    })

    test('size after delete below capacity', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    test('size decreases with each delete', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('c')
      expect(cache.size).toBe(2)
      cache.delete('b')
      expect(cache.size).toBe(1)
      cache.delete('a')
      expect(cache.size).toBe(0)
    })

    test('size does not exceed maxSize', () => {
      for (let i = 0; i < 20; i++) {
        cache.set(`key${i}`, i)
      }
      expect(cache.size).toBe(3)
    })

    test('size for maxSize 0 cache grows then caps', () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 })
      zeroCache.set('a', 1)
      zeroCache.set('b', 2)
      zeroCache.set('c', 3)
      expect(zeroCache.size).toBe(1)
    })
  })

  describe('forEach - extended', () => {
    test('forEach with single item', () => {
      cache.set('a', 1)
      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => entries.push([key, value]))

      expect(entries).toHaveLength(1)
      expect(entries[0]).toEqual(['a', 1])
    })

    test('forEach after eviction reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => entries.push([key, value]))

      expect(entries).toHaveLength(3)
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
      expect(entries).toContainEqual(['d', 4])
    })

    test('forEach after delete reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')

      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => entries.push([key, value]))

      expect(entries).toHaveLength(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['c', 3])
    })

    test('forEach after clear and refill', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      cache.set('c', 3)

      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => entries.push([key, value]))

      expect(entries).toHaveLength(1)
      expect(entries).toContainEqual(['c', 3])
    })

    test('forEach count matches size', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      let count = 0
      cache.forEach(() => count++)
      expect(count).toBe(cache.size)
    })

    test('forEach with overwritten values reflects latest', () => {
      cache.set('a', 1)
      cache.set('a', 100)

      const entries: Array<[string, number]> = []
      cache.forEach((value, key) => entries.push([key, value]))

      expect(entries).toContainEqual(['a', 100])
    })

    test('forEach receives correct argument order', () => {
      cache.set('x', 42)

      let receivedValue: number | undefined
      let receivedKey: string | undefined
      cache.forEach((v, k) => {
        receivedValue = v
        receivedKey = k
      })

      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })

    test('forEach with two items iterates both', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      const keys: string[] = []
      cache.forEach((_value, key) => keys.push(key))

      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toHaveLength(2)
    })
  })

  describe('entries - extended', () => {
    test('entries after eviction reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      const entries = Array.from(cache.entries())
      expect(entries).toHaveLength(3)
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
      expect(entries).toContainEqual(['d', 4])
    })

    test('entries after delete reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')

      const entries = Array.from(cache.entries())
      expect(entries).toHaveLength(1)
      expect(entries).toContainEqual(['b', 2])
    })

    test('entries count matches size', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const entries = Array.from(cache.entries())
      expect(entries.length).toBe(cache.size)
    })

    test('entries after overwrite has updated value', () => {
      cache.set('a', 1)
      cache.set('a', 99)

      const entries = Array.from(cache.entries())
      expect(entries).toContainEqual(['a', 99])
      expect(entries).toHaveLength(1)
    })

    test('entries returns iterator protocol', () => {
      cache.set('a', 1)
      const iter = cache.entries()
      expect(typeof iter.next).toBe('function')
      const first = iter.next()
      expect(first.done).toBe(false)
      expect(first.value).toEqual(['a', 1])
    })

    test('entries with single item', () => {
      cache.set('only', 42)
      const entries = Array.from(cache.entries())
      expect(entries).toEqual([['only', 42]])
    })
  })

  describe('keys - extended', () => {
    test('keys after eviction reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      const keys = Array.from(cache.keys())
      expect(keys).toHaveLength(3)
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(keys).toContain('d')
    })

    test('keys after delete reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')

      const keys = Array.from(cache.keys())
      expect(keys).toEqual(['b'])
    })

    test('keys count matches size', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      const keys = Array.from(cache.keys())
      expect(keys.length).toBe(cache.size)
    })

    test('keys returns iterator protocol', () => {
      cache.set('a', 1)
      const iter = cache.keys()
      expect(typeof iter.next).toBe('function')
      const first = iter.next()
      expect(first.done).toBe(false)
      expect(first.value).toBe('a')
    })

    test('keys with single item', () => {
      cache.set('only', 1)
      const keys = Array.from(cache.keys())
      expect(keys).toEqual(['only'])
    })

    test('keys with numeric keys', () => {
      const numCache = new LRUCache<number, string>({ maxSize: 3 })
      numCache.set(1, 'a')
      numCache.set(2, 'b')

      const keys = Array.from(numCache.keys())
      expect(keys).toContain(1)
      expect(keys).toContain(2)
    })
  })

  describe('values - extended', () => {
    test('values after eviction reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      const values = Array.from(cache.values())
      expect(values).toHaveLength(3)
      expect(values).toContain(2)
      expect(values).toContain(3)
      expect(values).toContain(4)
    })

    test('values after delete reflects current state', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')

      const values = Array.from(cache.values())
      expect(values).toEqual([2])
    })

    test('values count matches size', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      const values = Array.from(cache.values())
      expect(values.length).toBe(cache.size)
    })

    test('values contain updated values after overwrite', () => {
      cache.set('a', 1)
      cache.set('a', 100)

      const values = Array.from(cache.values())
      expect(values).toContain(100)
      expect(values).not.toContain(1)
    })

    test('values returns iterator protocol', () => {
      cache.set('a', 1)
      const iter = cache.values()
      expect(typeof iter.next).toBe('function')
      const first = iter.next()
      expect(first.done).toBe(false)
      expect(first.value).toBe(1)
    })

    test('values with single item', () => {
      cache.set('only', 42)
      const values = Array.from(cache.values())
      expect(values).toEqual([42])
    })
  })

  describe('getOrDefault - extended', () => {
    test('returns default after eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      expect(cache.getOrDefault('a', 999)).toBe(999)
    })

    test('returns default after clear', () => {
      cache.set('a', 1)
      cache.clear()
      expect(cache.getOrDefault('a', 999)).toBe(999)
    })

    test('returns default after delete', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.getOrDefault('a', 999)).toBe(999)
    })

    test('does not insert default into cache', () => {
      cache.getOrDefault('nonexistent', 99)
      expect(cache.has('nonexistent')).toBe(false)
      expect(cache.size).toBe(0)
    })

    test('returns default of 0', () => {
      expect(cache.getOrDefault('missing', 0)).toBe(0)
    })

    test('returns default of negative number', () => {
      expect(cache.getOrDefault('missing', -1)).toBe(-1)
    })

    test('returns stored 0 value not default', () => {
      cache.set('a', 0)
      expect(cache.getOrDefault('a', 99)).toBe(0)
    })

    test('returns value for key added then overwritten', () => {
      cache.set('a', 1)
      cache.set('a', 50)
      expect(cache.getOrDefault('a', 99)).toBe(50)
    })

    test('access order updated by getOrDefault affects eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.getOrDefault('a', 0) // a is now MRU
      cache.set('d', 4) // evicts b

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  describe('object key types', () => {
    test('object keys use reference equality', () => {
      const objCache = new LRUCache<object, string>({ maxSize: 3 })
      const key1 = { id: 1 }
      const key2 = { id: 1 } // same shape but different reference

      objCache.set(key1, 'first')
      expect(objCache.get(key1)).toBe('first')
      expect(objCache.get(key2)).toBeUndefined()
    })

    test('same object reference works for get', () => {
      const objCache = new LRUCache<object, string>({ maxSize: 3 })
      const key = { id: 1 }

      objCache.set(key, 'value')
      expect(objCache.get(key)).toBe('value')
      expect(objCache.has(key)).toBe(true)
    })

    test('object key can be deleted', () => {
      const objCache = new LRUCache<object, string>({ maxSize: 3 })
      const key = { id: 1 }

      objCache.set(key, 'value')
      expect(objCache.delete(key)).toBe(true)
      expect(objCache.has(key)).toBe(false)
    })

    test('object keys eviction works correctly', () => {
      const objCache = new LRUCache<object, number>({ maxSize: 2 })
      const k1 = { id: 1 }
      const k2 = { id: 2 }
      const k3 = { id: 3 }

      objCache.set(k1, 1)
      objCache.set(k2, 2)
      objCache.set(k3, 3) // evicts k1

      expect(objCache.has(k1)).toBe(false)
      expect(objCache.get(k2)).toBe(2)
      expect(objCache.get(k3)).toBe(3)
    })
  })

  describe('various value types', () => {
    test('works with object values', () => {
      const objCache = new LRUCache<string, { name: string; age: number }>({ maxSize: 3 })
      objCache.set('user', { name: 'Alice', age: 30 })
      expect(objCache.get('user')).toEqual({ name: 'Alice', age: 30 })
    })

    test('works with array values', () => {
      const arrCache = new LRUCache<string, number[]>({ maxSize: 3 })
      arrCache.set('nums', [1, 2, 3])
      expect(arrCache.get('nums')).toEqual([1, 2, 3])
    })

    test('works with string values', () => {
      const strCache = new LRUCache<string, string>({ maxSize: 3 })
      strCache.set('a', 'hello')
      strCache.set('b', 'world')
      expect(strCache.get('a')).toBe('hello')
      expect(strCache.get('b')).toBe('world')
    })

    test('works with boolean values', () => {
      const boolValCache = new LRUCache<string, boolean>({ maxSize: 3 })
      boolValCache.set('a', true)
      boolValCache.set('b', false)
      expect(boolValCache.get('a')).toBe(true)
      expect(boolValCache.get('b')).toBe(false)
    })

    test('works with nested object values', () => {
      const nestedCache = new LRUCache<string, { data: { nested: number } }>({ maxSize: 3 })
      nestedCache.set('a', { data: { nested: 42 } })
      expect(nestedCache.get('a')).toEqual({ data: { nested: 42 } })
    })

    test('works with empty object value', () => {
      const emptyObjCache = new LRUCache<string, Record<string, never>>({ maxSize: 3 })
      emptyObjCache.set('a', {})
      expect(emptyObjCache.get('a')).toEqual({})
    })

    test('works with empty array value', () => {
      const emptyArrCache = new LRUCache<string, number[]>({ maxSize: 3 })
      emptyArrCache.set('a', [])
      expect(emptyArrCache.get('a')).toEqual([])
    })

    test('works with empty string value', () => {
      const strCache = new LRUCache<string, string>({ maxSize: 3 })
      strCache.set('a', '')
      expect(strCache.get('a')).toBe('')
      expect(strCache.has('a')).toBe(true)
    })
  })

  describe('complex access patterns', () => {
    test('access pattern: set, get, set, get, evict', () => {
      cache.set('a', 1)
      cache.get('a')
      cache.set('b', 2)
      cache.get('b')
      cache.set('c', 3)
      cache.set('d', 4) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    test('access pattern: alternating get and set', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a')
      cache.set('d', 4) // evicts b
      cache.get('c')
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('access pattern: fill, clear, refill, evict', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      cache.set('x', 10)
      cache.set('y', 20)
      cache.set('z', 30)
      cache.set('w', 40) // evicts x

      expect(cache.has('x')).toBe(false)
      expect(cache.has('y')).toBe(true)
      expect(cache.has('z')).toBe(true)
      expect(cache.has('w')).toBe(true)
    })

    test('access pattern: delete middle then fill', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b') // size 2

      cache.set('d', 4) // size 3
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('access pattern: all operations combined', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      cache.delete('b')
      cache.set('d', 4)
      cache.getOrDefault('c', 0)
      cache.set('e', 5) // evicts a

      expect(cache.size).toBe(3)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('access pattern: overwrite makes key most recent', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 100) // a is now MRU
      cache.set('d', 4) // evicts b

      expect(cache.get('a')).toBe(100)
      expect(cache.has('b')).toBe(false)
    })

    test('rapid set cycle', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, i)
      }
      // Only last 3 should remain
      expect(cache.size).toBe(3)
      expect(cache.has('key97')).toBe(true)
      expect(cache.has('key98')).toBe(true)
      expect(cache.has('key99')).toBe(true)
      expect(cache.has('key0')).toBe(false)
    })

    test('rapid get after fill', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Rapid gets
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('a')).toBe(1)
    })
  })

  describe('sequential eviction cycles', () => {
    test('fill and evict multiple times', () => {
      const small = new LRUCache<string, number>({ maxSize: 2 })

      small.set('a', 1)
      small.set('b', 2)
      small.set('c', 3) // evicts a
      small.set('d', 4) // evicts b
      small.set('e', 5) // evicts c

      expect(small.size).toBe(2)
      expect(small.get('d')).toBe(4)
      expect(small.get('e')).toBe(5)
    })

    test('access pattern changes eviction order mid-stream', () => {
      const small = new LRUCache<string, number>({ maxSize: 2 })

      small.set('a', 1)
      small.set('b', 2)
      small.get('a') // a is MRU
      small.set('c', 3) // evicts b
      small.get('a') // a still MRU
      small.set('d', 4) // evicts c

      expect(small.has('a')).toBe(true)
      expect(small.has('b')).toBe(false)
      expect(small.has('c')).toBe(false)
      expect(small.has('d')).toBe(true)
    })

    test('eviction cascade with gets preserving items', () => {
      const small = new LRUCache<string, number>({ maxSize: 2 })

      small.set('a', 1)
      small.set('b', 2)
      small.get('a')
      small.get('b')
      small.set('c', 3) // evicts a (since b was accessed after a)

      expect(small.has('a')).toBe(false)
      expect(small.has('b')).toBe(true)
      expect(small.has('c')).toBe(true)
    })

    test('large number of operations', () => {
      const bigCache = new LRUCache<number, number>({ maxSize: 50 })

      for (let i = 0; i < 200; i++) {
        bigCache.set(i, i * 2)
      }

      expect(bigCache.size).toBe(50)
      // Last 50 keys should be present
      for (let i = 150; i < 200; i++) {
        expect(bigCache.has(i)).toBe(true)
        expect(bigCache.get(i)).toBe(i * 2)
      }
      // First keys should be gone
      expect(bigCache.has(0)).toBe(false)
      expect(bigCache.has(100)).toBe(false)
    })
  })

  describe('getOrDefault - no side effects', () => {
    test('getOrDefault miss does not change size', () => {
      expect(cache.size).toBe(0)
      cache.getOrDefault('missing', 0)
      expect(cache.size).toBe(0)
    })

    test('getOrDefault miss does not add key', () => {
      cache.getOrDefault('missing', 42)
      expect(cache.has('missing')).toBe(false)
    })

    test('getOrDefault miss does not affect eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.getOrDefault('nonexistent', 0)

      // Eviction should still work normally
      cache.set('d', 4) // evicts a
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('integration scenarios', () => {
    test('cache behaves as file path cache', () => {
      const pathCache = new LRUCache<string, string>({ maxSize: 5 })
      pathCache.set('/src/index.ts', 'content1')
      pathCache.set('/src/utils.ts', 'content2')
      pathCache.set('/src/types.ts', 'content3')
      pathCache.set('/src/config.ts', 'content4')
      pathCache.set('/src/main.ts', 'content5')

      expect(pathCache.size).toBe(5)
      expect(pathCache.get('/src/index.ts')).toBe('content1')

      // Add one more, evicts oldest (index.ts not accessed recently)
      pathCache.set('/src/new.ts', 'content6')
      // Actually index.ts was accessed via get, so /src/utils.ts is evicted
      expect(pathCache.has('/src/utils.ts')).toBe(false)
    })

    test('cache behaves as result cache', () => {
      const resultCache = new LRUCache<string, number[]>({ maxSize: 3 })

      resultCache.set('query1', [1, 2, 3])
      resultCache.set('query2', [4, 5, 6])
      resultCache.set('query3', [7, 8, 9])

      // Re-access query1
      resultCache.get('query1')

      // New query evicts query2
      resultCache.set('query4', [10, 11, 12])

      expect(resultCache.has('query1')).toBe(true)
      expect(resultCache.has('query2')).toBe(false)
    })

    test('cache survives many operations', () => {
      const stressCache = new LRUCache<number, number>({ maxSize: 10 })

      // Fill
      for (let i = 0; i < 10; i++) {
        stressCache.set(i, i)
      }
      expect(stressCache.size).toBe(10)

      // Overwrite
      for (let i = 0; i < 10; i++) {
        stressCache.set(i, i * 10)
      }
      expect(stressCache.size).toBe(10)

      // Get all
      for (let i = 0; i < 10; i++) {
        expect(stressCache.get(i)).toBe(i * 10)
      }

      // Add more to trigger eviction
      for (let i = 10; i < 20; i++) {
        stressCache.set(i, i)
      }
      expect(stressCache.size).toBe(10)

      // Old items evicted
      for (let i = 0; i < 10; i++) {
        expect(stressCache.has(i)).toBe(false)
      }

      // New items present
      for (let i = 10; i < 20; i++) {
        expect(stressCache.has(i)).toBe(true)
      }
    })

    test('cache with string-based record-like data', () => {
      type Record = { id: string; value: number }
      const recordCache = new LRUCache<string, Record>({ maxSize: 3 })

      recordCache.set('rec1', { id: 'rec1', value: 100 })
      recordCache.set('rec2', { id: 'rec2', value: 200 })
      recordCache.set('rec3', { id: 'rec3', value: 300 })

      const rec = recordCache.get('rec2')
      expect(rec?.value).toBe(200)

      recordCache.set('rec4', { id: 'rec4', value: 400 })
      expect(recordCache.has('rec1')).toBe(false)
    })

    test('deleting and re-adding maintains correct LRU order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b')
      cache.set('b', 20) // b is now MRU

      cache.set('d', 4) // evicts a
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    test('clear and reuse multiple times', () => {
      for (let round = 0; round < 5; round++) {
        cache.set('a', round)
        cache.set('b', round + 1)
        cache.set('c', round + 2)
        expect(cache.size).toBe(3)
        cache.clear()
        expect(cache.size).toBe(0)
      }
    })
  })

  describe('numeric key edge cases', () => {
    test('distinguishes between number and string key "1"', () => {
      const mixed = new LRUCache<string | number, string>({ maxSize: 5 })
      mixed.set(1, 'numeric')
      mixed.set('1', 'string')

      expect(mixed.get(1)).toBe('numeric')
      expect(mixed.get('1')).toBe('string')
    })

    test('negative numbers as keys', () => {
      const neg = new LRUCache<number, string>({ maxSize: 3 })
      neg.set(-1, 'minus-one')
      neg.set(-2, 'minus-two')
      neg.set(-3, 'minus-three')

      expect(neg.get(-1)).toBe('minus-one')
      expect(neg.get(-2)).toBe('minus-two')
      expect(neg.get(-3)).toBe('minus-three')
    })

    test('very large numbers as keys', () => {
      const large = new LRUCache<number, string>({ maxSize: 3 })
      large.set(Number.MAX_SAFE_INTEGER, 'max')
      large.set(Number.MIN_SAFE_INTEGER, 'min')

      expect(large.get(Number.MAX_SAFE_INTEGER)).toBe('max')
      expect(large.get(Number.MIN_SAFE_INTEGER)).toBe('min')
    })
  })

  describe('boundary conditions', () => {
    test('maxSize 1: set, get, set new evicts old', () => {
      const one = new LRUCache<string, number>({ maxSize: 1 })
      one.set('a', 1)
      one.get('a')
      one.set('b', 2)

      expect(one.has('a')).toBe(false)
      expect(one.get('b')).toBe(2)
    })

    test('maxSize 1: overwrite does not evict', () => {
      const one = new LRUCache<string, number>({ maxSize: 1 })
      one.set('a', 1)
      one.set('a', 2)
      expect(one.size).toBe(1)
      expect(one.get('a')).toBe(2)
    })

    test('maxSize 1: delete then add', () => {
      const one = new LRUCache<string, number>({ maxSize: 1 })
      one.set('a', 1)
      one.delete('a')
      expect(one.size).toBe(0)
      one.set('b', 2)
      expect(one.size).toBe(1)
      expect(one.get('b')).toBe(2)
    })

    test('maxSize 1: clear then add', () => {
      const one = new LRUCache<string, number>({ maxSize: 1 })
      one.set('a', 1)
      one.clear()
      one.set('b', 2)
      expect(one.size).toBe(1)
      expect(one.get('b')).toBe(2)
    })

    test('maxSize 1: forEach after overwrite', () => {
      const one = new LRUCache<string, number>({ maxSize: 1 })
      one.set('a', 1)
      one.set('a', 2)
      const entries: Array<[string, number]> = []
      one.forEach((v, k) => entries.push([k, v]))
      expect(entries).toEqual([['a', 2]])
    })

    test('at capacity: get before set prevents eviction', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a') // a is MRU
      cache.set('d', 4) // evicts b, not a

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    test('at capacity: multiple gets reorder correctly', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a')
      cache.get('b')
      cache.get('c')

      // Order is a, b, c (all accessed in order)
      cache.set('d', 4) // evicts a
      expect(cache.has('a')).toBe(false)

      cache.set('e', 5) // evicts b
      expect(cache.has('b')).toBe(false)

      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })
  })

  describe('iterator exhaustion', () => {
    test('entries iterator can be consumed fully', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      const iter = cache.entries()
      const result1 = iter.next()
      const result2 = iter.next()
      const result3 = iter.next()

      expect(result3.done).toBe(true)
      expect(result3.value).toBeUndefined()
    })

    test('keys iterator can be consumed fully', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      const iter = cache.keys()
      iter.next()
      iter.next()
      const result = iter.next()

      expect(result.done).toBe(true)
    })

    test('values iterator can be consumed fully', () => {
      cache.set('a', 1)
      cache.set('b', 2)

      const iter = cache.values()
      iter.next()
      iter.next()
      const result = iter.next()

      expect(result.done).toBe(true)
    })
  })

  describe('mixed key types in generic cache', () => {
    test('string and number keys coexist', () => {
      const mixed = new LRUCache<string | number, string>({ maxSize: 5 })
      mixed.set('hello', 'world')
      mixed.set(42, 'answer')

      expect(mixed.get('hello')).toBe('world')
      expect(mixed.get(42)).toBe('answer')
    })

    test('boolean and string keys coexist', () => {
      const mixed = new LRUCache<string | boolean, number>({ maxSize: 5 })
      mixed.set('key', 1)
      mixed.set(true, 2)

      expect(mixed.get('key')).toBe(1)
      expect(mixed.get(true)).toBe(2)
    })
  })

  describe('repeated operations', () => {
    test('set same key 100 times', () => {
      for (let i = 0; i < 100; i++) {
        cache.set('a', i)
      }
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(99)
    })

    test('get same key 100 times', () => {
      cache.set('a', 42)
      for (let i = 0; i < 100; i++) {
        expect(cache.get('a')).toBe(42)
      }
    })

    test('delete and re-add same key repeatedly', () => {
      for (let i = 0; i < 10; i++) {
        cache.set('a', i)
        expect(cache.delete('a')).toBe(true)
        expect(cache.size).toBe(0)
      }
    })

    test('clear and refill repeatedly', () => {
      for (let round = 0; round < 10; round++) {
        cache.set('a', round)
        cache.set('b', round)
        cache.set('c', round)
        expect(cache.size).toBe(3)
        cache.clear()
        expect(cache.size).toBe(0)
      }
    })
  })

  describe('delete effects on access order', () => {
    test('delete LRU item then add new item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('a') // delete LRU

      cache.set('d', 4)
      cache.set('e', 5) // evicts b

      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('delete MRU item then add new item', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('c') // delete MRU

      cache.set('d', 4)
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })

    test('delete from middle then verify eviction order', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.delete('b') // delete middle

      // Only a and c remain
      cache.set('d', 4) // size 3, no eviction
      cache.set('e', 5) // evicts a

      expect(cache.has('a')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
      expect(cache.has('e')).toBe(true)
    })
  })

  describe('size tracking accuracy', () => {
    test('size is accurate after set-get-delete cycle', () => {
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      cache.get('a')
      expect(cache.size).toBe(1)
      cache.delete('a')
      expect(cache.size).toBe(0)
    })

    test('size is accurate after fill-evict cycle', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      expect(cache.size).toBe(3)
    })

    test('size is accurate after partial delete and refill', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('a')
      expect(cache.size).toBe(2)
      cache.set('d', 4)
      expect(cache.size).toBe(3)
      cache.set('e', 5)
      expect(cache.size).toBe(3)
    })

    test('size after has operation unchanged', () => {
      cache.set('a', 1)
      const sizeBefore = cache.size
      cache.has('a')
      cache.has('b')
      expect(cache.size).toBe(sizeBefore)
    })

    test('size after get operation unchanged', () => {
      cache.set('a', 1)
      const sizeBefore = cache.size
      cache.get('a')
      cache.get('b')
      expect(cache.size).toBe(sizeBefore)
    })

    test('size after getOrDefault operation unchanged', () => {
      cache.set('a', 1)
      const sizeBefore = cache.size
      cache.getOrDefault('a', 0)
      cache.getOrDefault('b', 0)
      expect(cache.size).toBe(sizeBefore)
    })
  })
})
