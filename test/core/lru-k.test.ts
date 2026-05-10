import { describe, expect, it } from 'vitest'
import { LruKCache } from '../../src/core/lru-k/lru-k.js'
import { DEFAULT_LRU_K_OPTIONS } from '../../src/core/lru-k/types.js'

describe('LruKCache', () => {
  describe('construction', () => {
    it('creates cache with default options', () => {
      const cache = new LruKCache()
      expect(cache.size).toBe(0)
      expect(cache.capacity).toBe(DEFAULT_LRU_K_OPTIONS.capacity)
      expect(cache.isEmpty).toBe(true)
    })

    it('creates cache with custom capacity', () => {
      const cache = new LruKCache({ capacity: 50 })
      expect(cache.capacity).toBe(50)
    })

    it('creates cache with custom k', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      expect(cache.size).toBe(0)
    })

    it('creates cache with k=1', () => {
      const cache = new LruKCache({ capacity: 10, k: 1 })
      expect(cache.capacity).toBe(10)
    })

    it('creates cache with large capacity', () => {
      const cache = new LruKCache({ capacity: 10000 })
      expect(cache.capacity).toBe(10000)
    })

    it('throws on capacity < 1', () => {
      expect(() => new LruKCache({ capacity: 0 })).toThrow(RangeError)
    })

    it('throws on negative capacity', () => {
      expect(() => new LruKCache({ capacity: -5 })).toThrow(RangeError)
    })

    it('throws on k < 1', () => {
      expect(() => new LruKCache({ capacity: 10, k: 0 })).toThrow(RangeError)
    })

    it('throws on negative k', () => {
      expect(() => new LruKCache({ capacity: 10, k: -1 })).toThrow(RangeError)
    })

    it('accepts empty options object', () => {
      const cache = new LruKCache({})
      expect(cache.capacity).toBe(DEFAULT_LRU_K_OPTIONS.capacity)
    })

    it('accepts no arguments', () => {
      const cache = new LruKCache()
      expect(cache.capacity).toBe(DEFAULT_LRU_K_OPTIONS.capacity)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const cache = new LruKCache<string>({ capacity: 10 })
      cache.set('a', 'hello')
      expect(cache.get('a')).toBe('hello')
    })

    it('returns undefined for missing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 'first')
      cache.set('a', 'second')
      expect(cache.get('a')).toBe('second')
    })

    it('tracks size correctly', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })

    it('isEmpty returns false after set', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      expect(cache.isEmpty).toBe(false)
    })

    it('stores different value types', () => {
      const numCache = new LruKCache<number>({ capacity: 10 })
      numCache.set('a', 42)
      expect(numCache.get('a')).toBe(42)

      const objCache = new LruKCache<{ x: number }>({ capacity: 10 })
      objCache.set('a', { x: 1 })
      expect(objCache.get('a')).toEqual({ x: 1 })
    })

    it('overwriting key does not increase size', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      expect(cache.size).toBe(1)
    })

    it('get records an access timestamp', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      const history1 = cache.getAccessHistory('a')
      expect(history1.length).toBe(1)
      cache.get('a')
      const history2 = cache.getAccessHistory('a')
      expect(history2.length).toBe(2)
    })

    it('set records an access timestamp', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      expect(cache.getAccessHistory('a').length).toBe(1)
      cache.set('a', 2)
      expect(cache.getAccessHistory('a').length).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('does not record access', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      const beforeLen = cache.getAccessHistory('a').length
      cache.has('a')
      const afterLen = cache.getAccessHistory('a').length
      expect(afterLen).toBe(beforeLen)
    })

    it('returns true after overwrite', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes an entry', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.get('a')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.delete('missing')).toBe(false)
    })

    it('decreases size', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('allows re-adding after delete', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.delete('a')
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })

    it('delete from empty cache returns false', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.delete('a')).toBe(false)
    })
  })

  describe('peek', () => {
    it('returns value without recording access', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      const histBefore = cache.getAccessHistory('a')
      const val = cache.peek('a')
      const histAfter = cache.getAccessHistory('a')
      expect(val).toBe(1)
      expect(histAfter.length).toBe(histBefore.length)
    })

    it('returns undefined for missing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('does not affect statistics', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.peek('a')
      cache.peek('a')
      cache.peek('a')
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('returns latest value after overwrite', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 'old')
      cache.set('a', 'new')
      expect(cache.peek('a')).toBe('new')
    })
  })

  describe('access history tracking', () => {
    it('tracks up to K timestamps', () => {
      const cache = new LruKCache({ capacity: 10, k: 2 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(2)
    })

    it('stores at most K entries in history', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(3)
    })

    it('timestamps are monotonically increasing', () => {
      const cache = new LruKCache({ capacity: 10, k: 5 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      const history = cache.getAccessHistory('a')
      for (let i = 1; i < history.length; i++) {
        expect(history[i]!).toBeGreaterThan(history[i - 1]!)
      }
    })

    it('returns empty array for missing key', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.getAccessHistory('missing')).toEqual([])
    })

    it('returns copy of history array', () => {
      const cache = new LruKCache({ capacity: 10, k: 3 })
      cache.set('a', 1)
      const h1 = cache.getAccessHistory('a')
      const h2 = cache.getAccessHistory('a')
      expect(h1).toEqual(h2)
      expect(h1).not.toBe(h2)
    })

    it('K=1 tracks single most recent access', () => {
      const cache = new LruKCache({ capacity: 10, k: 1 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(1)
    })

    it('set overwrites value but records access', () => {
      const cache = new LruKCache({ capacity: 10, k: 2 })
      cache.set('a', 1)
      cache.set('a', 2)
      const history = cache.getAccessHistory('a')
      expect(history.length).toBe(2)
    })
  })

  describe('eviction', () => {
    it('evicts when at capacity', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
    })

    it('evicts entry with oldest K-th access', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.has('d')).toBe(true)
      expect(cache.size).toBe(3)
    })

    it('evicts item with fewer accesses first', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('b')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('evicts oldest when all have same history length', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.get('a')
      cache.get('b')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.size).toBe(3)
      expect(cache.has('d')).toBe(true)
    })

    it('capacity 1 evicts on every new set', () => {
      const cache = new LruKCache({ capacity: 1 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('eviction increments eviction counter', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.getStatistics().evictions).toBe(1)
    })

    it('multiple evictions count correctly', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      expect(cache.getStatistics().evictions).toBe(3)
    })

    it('overwriting existing key does not trigger eviction', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 10)
      expect(cache.size).toBe(2)
      expect(cache.getStatistics().evictions).toBe(0)
    })
  })

  describe('LRU-1 behavior (k=1)', () => {
    it('behaves like standard LRU with k=1', () => {
      const cache = new LruKCache({ capacity: 3, k: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('evicts least recently used with k=1', () => {
      const cache = new LruKCache({ capacity: 3, k: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('accessing item prevents eviction with k=1', () => {
      const cache = new LruKCache({ capacity: 3, k: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
    })

    it('k=1 with capacity 1', () => {
      const cache = new LruKCache({ capacity: 1, k: 1 })
      cache.set('a', 1)
      cache.get('a')
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('k=1 only keeps most recent timestamp', () => {
      const cache = new LruKCache({ capacity: 10, k: 1 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(1)
    })
  })

  describe('LRU-2 behavior', () => {
    it('item needs 2 accesses to become hot', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
    })

    it('item with 2 accesses survives over item with 1', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
    })

    it('both accessed twice, evicts older K-th access', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.get('c')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.has('d')).toBe(true)
      expect(cache.size).toBe(3)
    })

    it('default k is 2', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      expect(cache.getAccessHistory('a').length).toBe(2)
    })

    it('newly set item preferred for eviction over twice-accessed', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('statistics', () => {
    it('starts with zero stats', () => {
      const cache = new LruKCache({ capacity: 10 })
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('counts hits on successful get', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      expect(cache.getStatistics().hits).toBe(2)
    })

    it('counts misses on failed get', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.get('missing1')
      cache.get('missing2')
      cache.get('missing3')
      expect(cache.getStatistics().misses).toBe(3)
    })

    it('counts evictions', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.getStatistics().evictions).toBe(1)
    })

    it('returns copy of statistics', () => {
      const cache = new LruKCache({ capacity: 10 })
      const s1 = cache.getStatistics()
      const s2 = cache.getStatistics()
      expect(s1).toEqual(s2)
      expect(s1).not.toBe(s2)
    })

    it('clear resets statistics', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('missing')
      cache.clear()
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('hit rate ratio makes sense', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('missing')
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
    })

    it('does not count has as hit or miss', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.has('a')
      cache.has('missing')
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('does not count peek as hit or miss', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.peek('a')
      const stats = cache.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns all keys', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['a', 'b', 'c'])
    })

    it('values returns all values', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.values()).toEqual([1, 2, 3])
    })

    it('entries returns key-value pairs', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('keys returns empty array for empty cache', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.keys()).toEqual([])
    })

    it('values returns empty array for empty cache', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.values()).toEqual([])
    })

    it('entries returns empty array for empty cache', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.entries()).toEqual([])
    })

    it('keys reflect insertion order', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('x', 1)
      cache.set('y', 2)
      cache.set('z', 3)
      expect(cache.keys()).toEqual(['x', 'y', 'z'])
    })

    it('keys update on overwrite (moved to end)', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 10)
      expect(cache.keys()).toEqual(['b', 'a'])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const result: [string, number][] = []
      cache.forEach((value, key) => {
        result.push([key, value])
      })
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('passes cache as third argument', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      let received: LruKCache<number> | undefined
      cache.forEach((_v, _k, c) => {
        received = c
      })
      expect(received).toBe(cache)
    })

    it('does not iterate on empty cache', () => {
      const cache = new LruKCache({ capacity: 10 })
      let count = 0
      cache.forEach(() => {
        count += 1
      })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      const result = [...cache]
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('works with for-of', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      const keys: string[] = []
      for (const [key] of cache) {
        keys.push(key)
      }
      expect(keys).toEqual(['a', 'b'])
    })

    it('returns empty iterator for empty cache', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect([...cache]).toEqual([])
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.isEmpty).toBe(true)
    })

    it('cache is reusable after clear', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('capacity unchanged after clear', () => {
      const cache = new LruKCache({ capacity: 50 })
      cache.set('a', 1)
      cache.clear()
      expect(cache.capacity).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('empty cache has size 0', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.size).toBe(0)
    })

    it('empty cache isEmpty is true', () => {
      const cache = new LruKCache({ capacity: 10 })
      expect(cache.isEmpty).toBe(true)
    })

    it('single item cache', () => {
      const cache = new LruKCache({ capacity: 1 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      expect(cache.size).toBe(1)
    })

    it('capacity 1 evicts previous item', () => {
      const cache = new LruKCache({ capacity: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('overwriting only item in capacity 1 cache', () => {
      const cache = new LruKCache({ capacity: 1 })
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(2)
      expect(cache.getStatistics().evictions).toBe(0)
    })

    it('delete non-existent key on full cache', () => {
      const cache = new LruKCache({ capacity: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.delete('c')).toBe(false)
      expect(cache.size).toBe(2)
    })

    it('set then delete then set same key', () => {
      const cache = new LruKCache({ capacity: 10 })
      cache.set('a', 1)
      cache.delete('a')
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('many operations on small cache', () => {
      const cache = new LruKCache({ capacity: 2, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })
  })

  describe('large-scale', () => {
    it('handles 200+ items with eviction', () => {
      const cache = new LruKCache<number>({ capacity: 100, k: 2 })
      for (let i = 0; i < 250; i++) {
        cache.set(`key-${i}`, i)
      }
      expect(cache.size).toBe(100)
      expect(cache.getStatistics().evictions).toBe(150)
    })

    it('accessed items survive eviction', () => {
      const cache = new LruKCache<number>({ capacity: 50, k: 2 })
      for (let i = 0; i < 50; i++) {
        cache.set(`key-${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        cache.get(`key-${i}`)
        cache.get(`key-${i}`)
      }
      for (let i = 50; i < 100; i++) {
        cache.set(`key-${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        expect(cache.has(`key-${i}`)).toBe(true)
      }
    })

    it('repeated access to same items', () => {
      const cache = new LruKCache<number>({ capacity: 10, k: 2 })
      for (let i = 0; i < 10; i++) {
        cache.set(`key-${i}`, i)
      }
      for (let round = 0; round < 20; round++) {
        for (let i = 0; i < 5; i++) {
          cache.get(`key-${i}`)
        }
      }
      for (let i = 10; i < 20; i++) {
        cache.set(`key-${i}`, i)
      }
      for (let i = 0; i < 5; i++) {
        expect(cache.has(`key-${i}`)).toBe(true)
      }
    })

    it('large k value works correctly', () => {
      const cache = new LruKCache<number>({ capacity: 10, k: 10 })
      cache.set('a', 1)
      for (let i = 0; i < 15; i++) {
        cache.get('a')
      }
      expect(cache.getAccessHistory('a').length).toBe(10)
    })

    it('stress test with mixed operations', () => {
      const cache = new LruKCache<number>({ capacity: 100, k: 3 })
      for (let i = 0; i < 200; i++) {
        cache.set(`k${i}`, i)
      }
      for (let i = 100; i < 200; i++) {
        cache.get(`k${i}`)
        cache.get(`k${i}`)
        cache.get(`k${i}`)
      }
      for (let i = 200; i < 300; i++) {
        cache.set(`k${i}`, i)
      }
      for (let i = 101; i < 200; i++) {
        expect(cache.has(`k${i}`)).toBe(true)
      }
      expect(cache.size).toBe(100)
    })
  })

  describe('access patterns', () => {
    it('frequently accessed items survive across multiple evictions', () => {
      const cache = new LruKCache({ capacity: 5, k: 2 })
      cache.set('hot', 'hot-value')
      cache.get('hot')
      cache.get('hot')
      for (let i = 0; i < 20; i++) {
        cache.set(`fill-${i}`, i)
      }
      expect(cache.has('hot')).toBe(true)
    })

    it('cold items get evicted first', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('cold', 1)
      cache.set('warm', 2)
      cache.set('hot', 3)
      cache.get('warm')
      cache.get('warm')
      cache.get('hot')
      cache.get('hot')
      cache.set('new', 4)
      expect(cache.has('cold')).toBe(false)
      expect(cache.has('warm')).toBe(true)
      expect(cache.has('hot')).toBe(true)
      expect(cache.has('new')).toBe(true)
    })

    it('items promoted through repeated access', () => {
      const cache = new LruKCache({ capacity: 3, k: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      cache.set('e', 5)
      expect(cache.has('a')).toBe(true)
    })

    it('eviction with all items having k accesses', () => {
      const cache = new LruKCache({ capacity: 3, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.get('c')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.size).toBe(3)
      expect(cache.has('d')).toBe(true)
    })

    it('get after eviction resets access history', () => {
      const cache = new LruKCache({ capacity: 2, k: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('b')).toBe(false)
      cache.set('b', 20)
      expect(cache.getAccessHistory('b').length).toBe(1)
    })

    it('interleaved get and set operations', () => {
      const cache = new LruKCache({ capacity: 4, k: 2 })
      cache.set('a', 1)
      cache.get('a')
      cache.set('b', 2)
      cache.get('a')
      cache.get('b')
      cache.set('c', 3)
      cache.set('d', 4)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.get('c')
      cache.get('c')
      cache.get('d')
      cache.get('d')
      cache.set('e', 5)
      expect(cache.size).toBe(4)
      expect(cache.has('e')).toBe(true)
    })
  })

  describe('DEFAULT_LRU_K_OPTIONS', () => {
    it('has capacity 100', () => {
      expect(DEFAULT_LRU_K_OPTIONS.capacity).toBe(100)
    })

    it('has k 2', () => {
      expect(DEFAULT_LRU_K_OPTIONS.k).toBe(2)
    })
  })
})
