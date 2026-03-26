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
})
