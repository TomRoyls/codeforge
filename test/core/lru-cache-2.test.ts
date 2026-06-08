import { describe, it, expect, beforeEach } from 'vitest'
import { LRU2Cache } from '../../src/core/lru-cache-2/index.js'

describe('LRU2Cache', () => {
  describe('constructor', () => {
    it('creates cache with default maxSize of 100', () => {
      const cache = new LRU2Cache<string, number>()
      expect(cache.maxSize).toBe(100)
      expect(cache.size()).toBe(0)
    })

    it('creates cache with custom maxSize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 50 })
      expect(cache.maxSize).toBe(50)
    })

    it('creates cache with maxSize 1', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      expect(cache.maxSize).toBe(1)
    })

    it('creates empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 10 })
      expect(cache.isEmpty()).toBe(true)
      expect(cache.size()).toBe(0)
    })

    it('throws RangeError for maxSize 0', () => {
      expect(() => new LRU2Cache<string, number>({ maxSize: 0 })).toThrow(RangeError)
    })

    it('throws RangeError for negative maxSize', () => {
      expect(() => new LRU2Cache<string, number>({ maxSize: -1 })).toThrow(RangeError)
    })

    it('throws RangeError with descriptive message', () => {
      expect(() => new LRU2Cache<string, number>({ maxSize: 0 })).toThrow('maxSize must be at least 1')
    })

    it('accepts empty options object', () => {
      const cache = new LRU2Cache<string, number>({})
      expect(cache.maxSize).toBe(100)
    })
  })

  describe('get', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
    })

    it('returns value for existing key', () => {
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

    it('returns undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('updates access history on get', () => {
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history.length).toBe(2)
    })

    it('maintains at most 2 access timestamps', () => {
      cache.get('a')
      cache.get('a')
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history.length).toBe(2)
    })

    it('returns undefined after key is deleted', () => {
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })

    it('handles multiple gets of same key', () => {
      expect(cache.get('a')).toBe(1)
      expect(cache.get('a')).toBe(1)
      expect(cache.get('a')).toBe(1)
    })
  })

  describe('set', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 3 })
    })

    it('adds a new entry', () => {
      cache.set('a', 1)
      expect(cache.size()).toBe(1)
      expect(cache.get('a')).toBe(1)
    })

    it('adds multiple entries', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size()).toBe(3)
    })

    it('overwrites existing key value', () => {
      cache.set('a', 1)
      cache.set('a', 99)
      expect(cache.get('a')).toBe(99)
      expect(cache.size()).toBe(1)
    })

    it('overwrites update access history', () => {
      cache.set('a', 1)
      const h1 = cache.accessHistory('a')
      cache.set('a', 2)
      const h2 = cache.accessHistory('a')
      expect(h2.length).toBe(2)
      expect(h2[h2.length - 1]!).toBeGreaterThan(h1[0]!)
    })

    it('evicts when at capacity', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.size()).toBe(3)
    })

    it('records initial access timestamp on set', () => {
      cache.set('a', 1)
      const history = cache.accessHistory('a')
      expect(history.length).toBe(1)
      expect(history[0]).toBeGreaterThan(0)
    })

    it('evicts entry with oldest second-to-last access', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.get('c')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('does not increase size on overwrite', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      expect(cache.size()).toBe(1)
    })

    it('evicts based on first access when only 1 access recorded', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.size()).toBe(3)
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('has', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
    })

    it('returns true for existing key', () => {
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('returns false after delete', () => {
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('does not update access history', () => {
      const before = cache.accessHistory('a')
      cache.has('a')
      const after = cache.accessHistory('a')
      expect(before).toEqual(after)
    })

    it('returns true after overwrite', () => {
      cache.set('a', 99)
      expect(cache.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
    })

    it('returns true when key exists', () => {
      expect(cache.delete('a')).toBe(true)
    })

    it('returns false when key does not exist', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('removes the entry', () => {
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
      expect(cache.get('a')).toBeUndefined()
    })

    it('decreases size', () => {
      cache.delete('a')
      expect(cache.size()).toBe(1)
    })

    it('can delete all entries', () => {
      cache.delete('a')
      cache.delete('b')
      expect(cache.isEmpty()).toBe(true)
    })

    it('can delete same key only once', () => {
      expect(cache.delete('a')).toBe(true)
      expect(cache.delete('a')).toBe(false)
    })
  })

  describe('peek', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
    })

    it('returns value for existing key', () => {
      expect(cache.peek('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('does not update access history', () => {
      const before = cache.accessHistory('a')
      cache.peek('a')
      const after = cache.accessHistory('a')
      expect(before).toEqual(after)
    })

    it('returns updated value after set', () => {
      cache.set('a', 42)
      expect(cache.peek('a')).toBe(42)
    })

    it('returns undefined after delete', () => {
      cache.delete('a')
      expect(cache.peek('a')).toBeUndefined()
    })
  })

  describe('size', () => {
    it('returns 0 for new cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.size()).toBe(0)
    })

    it('returns correct size after adds', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size()).toBe(2)
    })

    it('returns correct size after deletes', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size()).toBe(1)
    })

    it('returns correct size after clear', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('does not exceed maxSize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.isEmpty()).toBe(true)
    })

    it('returns false after set', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      expect(cache.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('clears an already empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('allows set after clear', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.size()).toBe(1)
      expect(cache.get('b')).toBe(2)
    })

    it('does not affect maxSize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.clear()
      expect(cache.maxSize).toBe(5)
    })
  })

  describe('maxSize', () => {
    it('returns the configured maxSize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 42 })
      expect(cache.maxSize).toBe(42)
    })

    it('returns default maxSize when not specified', () => {
      const cache = new LRU2Cache<string, number>()
      expect(cache.maxSize).toBe(100)
    })
  })

  describe('resize', () => {
    let cache: LRU2Cache<string, number>

    beforeEach(() => {
      cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
    })

    it('updates maxSize', () => {
      cache.resize(10)
      expect(cache.maxSize).toBe(10)
    })

    it('evicts entries when shrinking', () => {
      cache.resize(3)
      expect(cache.size()).toBe(3)
    })

    it('throws RangeError for newSize 0', () => {
      expect(() => cache.resize(0)).toThrow(RangeError)
    })

    it('throws RangeError for negative newSize', () => {
      expect(() => cache.resize(-5)).toThrow(RangeError)
    })

    it('does not evict when growing', () => {
      cache.resize(10)
      expect(cache.size()).toBe(5)
    })

    it('evicts entries with lowest priority first', () => {
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.resize(2)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
    })

    it('can resize to 1', () => {
      cache.resize(1)
      expect(cache.size()).toBe(1)
      expect(cache.maxSize).toBe(1)
    })

    it('allows adding after resize to larger', () => {
      cache.resize(10)
      cache.set('f', 6)
      cache.set('g', 7)
      expect(cache.size()).toBe(7)
    })

    it('preserves entries when newSize equals current size', () => {
      cache.resize(5)
      expect(cache.size()).toBe(5)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.keys()).toEqual([])
    })

    it('returns keys in insertion order for new entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['a', 'b', 'c'])
    })

    it('moves key to end on get', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      expect(cache.keys()).toEqual(['b', 'c', 'a'])
    })

    it('moves key to end on set overwrite', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.keys()).toEqual(['b', 'c', 'a'])
    })

    it('does not include deleted keys', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.values()).toEqual([])
    })

    it('returns values in insertion order', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.values()).toEqual([1, 2, 3])
    })

    it('reflects updated order after get', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      expect(cache.values()).toEqual([2, 3, 1])
    })

    it('reflects updated values after overwrite', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 99)
      expect(cache.values()).toEqual([2, 99])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.entries()).toEqual([])
    })

    it('returns entries in insertion order', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.entries()).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('reflects updated order after get', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
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

    it('does not include deleted entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.entries()).toEqual([['b', 2]])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const result: Array<[string, number]> = []
      cache.forEach((value, key) => result.push([key, value]))
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('does not iterate over empty cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      let count = 0
      cache.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('provides correct key-value pairs', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('x', 10)
      let receivedKey: string | undefined
      let receivedValue: number | undefined
      cache.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(10)
    })
  })

  describe('accessHistory', () => {
    it('returns empty array for missing key', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      expect(cache.accessHistory('missing')).toEqual([])
    })

    it('returns single timestamp after set', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const history = cache.accessHistory('a')
      expect(history.length).toBe(1)
    })

    it('returns two timestamps after get', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history.length).toBe(2)
    })

    it('caps at 2 timestamps', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history.length).toBe(2)
    })

    it('timestamps are monotonically increasing', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history[0]!).toBeLessThan(history[1]!)
    })

    it('returns copy not reference', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const h1 = cache.accessHistory('a')
      h1.push(9999)
      const h2 = cache.accessHistory('a')
      expect(h2.length).toBe(1)
    })

    it('returns empty array after delete', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.accessHistory('a')).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      const cloned = cache.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('preserves maxSize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 42 })
      const cloned = cache.clone()
      expect(cloned.maxSize).toBe(42)
    })

    it('modifications to clone do not affect original', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const cloned = cache.clone()
      cloned.set('b', 2)
      expect(cache.size()).toBe(1)
      expect(cloned.size()).toBe(2)
    })

    it('modifications to original do not affect clone', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const cloned = cache.clone()
      cache.set('b', 2)
      expect(cloned.size()).toBe(1)
      expect(cache.size()).toBe(2)
    })

    it('clones access history', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      const cloned = cache.clone()
      expect(cloned.accessHistory('a')).toEqual(cache.accessHistory('a'))
    })

    it('clone of empty cache is empty', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      const cloned = cache.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.maxSize).toBe(5)
    })

    it('preserves values after overwrite', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('a', 99)
      const cloned = cache.clone()
      expect(cloned.peek('a')).toBe(99)
    })
  })

  describe('eviction behavior', () => {
    it('evicts entry with oldest second-to-last access', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('evicts correctly with single-access entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.size()).toBe(3)
    })

    it('prefers evicting entries with fewer accesses', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
    })

    it('evicts multiple when adding to full cache after resize', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      cache.resize(2)
      expect(cache.size()).toBe(2)
    })

    it('does not evict when under capacity', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size()).toBe(2)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
    })

    it('handles repeated access patterns', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      for (let i = 0; i < 10; i++) {
        cache.get('a')
        cache.get('b')
      }
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
    })
  })

  describe('edge case: size 1', () => {
    it('holds exactly one entry', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      expect(cache.size()).toBe(1)
      expect(cache.get('a')).toBe(1)
    })

    it('evicts on second set', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.size()).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('overwrite does not evict', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.set('a', 99)
      expect(cache.size()).toBe(1)
      expect(cache.get('a')).toBe(99)
    })

    it('get updates access then evict on new set', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.get('a')
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('delete makes cache empty', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty()).toBe(true)
    })

    it('clear on size 1 cache', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.clear()
      expect(cache.isEmpty()).toBe(true)
    })
  })

  describe('edge case: overwrites', () => {
    it('overwriting does not change size', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 10)
      expect(cache.size()).toBe(2)
    })

    it('overwriting updates value', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('a', 10)
      expect(cache.peek('a')).toBe(10)
      expect(cache.get('a')).toBe(10)
    })

    it('overwriting updates access history', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      const h1 = cache.accessHistory('a')
      cache.set('a', 2)
      const h2 = cache.accessHistory('a')
      expect(h2.length).toBe(2)
      expect(h2[h2.length - 1]!).toBeGreaterThan(h1[0]!)
    })

    it('overwriting moves key to end', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.keys()).toEqual(['b', 'c', 'a'])
    })
  })

  describe('large datasets', () => {
    it('handles 1000 entries', () => {
      const cache = new LRU2Cache<number, number>({ maxSize: 1000 })
      for (let i = 0; i < 1000; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size()).toBe(1000)
      expect(cache.get(500)).toBe(5000)
    })

    it('handles eviction at scale', () => {
      const cache = new LRU2Cache<number, number>({ maxSize: 100 })
      for (let i = 0; i < 200; i++) {
        cache.set(i, i)
      }
      expect(cache.size()).toBe(100)
      expect(cache.has(0)).toBe(false)
      expect(cache.has(99)).toBe(false)
      expect(cache.has(100)).toBe(true)
    })

    it('handles many accesses', () => {
      const cache = new LRU2Cache<number, number>({ maxSize: 100 })
      for (let i = 0; i < 100; i++) {
        cache.set(i, i)
      }
      for (let i = 0; i < 50; i++) {
        cache.get(i)
      }
      for (let i = 100; i < 150; i++) {
        cache.set(i, i)
      }
      expect(cache.size()).toBe(100)
      expect(cache.has(50)).toBe(false)
      expect(cache.has(0)).toBe(true)
      expect(cache.has(49)).toBe(true)
    })

    it('clear works on large cache', () => {
      const cache = new LRU2Cache<number, number>({ maxSize: 500 })
      for (let i = 0; i < 500; i++) {
        cache.set(i, i)
      }
      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })
  })

  describe('repeated access patterns', () => {
    it('hot keys survive eviction', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
    })

    it('cold keys get evicted first', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 4 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.set('e', 5)
      expect(cache.has('c')).toBe(false)
    })

    it('access pattern affects eviction order', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('b')
      cache.get('b')
      cache.get('c')
      cache.get('c')
      cache.get('a')
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('LRU-2 correctly prioritizes twice-accessed entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('a')).toBe(true)
    })

    it('second access time determines eviction among K=2 entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
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
      expect(cache.has('a')).toBe(false)
    })
  })

  describe('type support', () => {
    it('works with string keys and number values', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('one', 1)
      expect(cache.get('one')).toBe(1)
    })

    it('works with number keys and string values', () => {
      const cache = new LRU2Cache<number, string>({ maxSize: 5 })
      cache.set(1, 'one')
      expect(cache.get(1)).toBe('one')
    })

    it('works with object values', () => {
      const cache = new LRU2Cache<string, { name: string }>({ maxSize: 5 })
      cache.set('a', { name: 'test' })
      expect(cache.get('a')?.name).toBe('test')
    })

    it('works with complex key types', () => {
      const cache = new LRU2Cache<number, boolean>({ maxSize: 5 })
      cache.set(1, true)
      cache.set(2, false)
      expect(cache.get(1)).toBe(true)
      expect(cache.get(2)).toBe(false)
    })
  })

  describe('integration scenarios', () => {
    it('set, get, delete, set again cycle', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })

    it('multiple operations maintain consistency', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.delete('b')
      cache.set('d', 4)
      expect(cache.size()).toBe(3)
      expect(cache.keys()).toEqual(['c', 'a', 'd'])
    })

    it('clone after modifications preserves state', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      const cloned = cache.clone()
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cloned.size()).toBe(2)
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('resize after clone is independent', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      const cloned = cache.clone()
      cloned.resize(1)
      expect(cloned.size()).toBe(1)
      expect(cloned.maxSize).toBe(1)
      expect(cache.size()).toBe(2)
      expect(cache.maxSize).toBe(5)
    })

    it('forEach with eviction scenario', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const entries: Array<[string, number]> = []
      cache.forEach((v, k) => entries.push([k, v]))
      expect(entries.length).toBe(3)
    })

    it('access history for cloned cache is independent', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      const cloned = cache.clone()
      cloned.get('a')
      expect(cloned.accessHistory('a').length).toBe(2)
      expect(cache.accessHistory('a').length).toBe(2)
    })
  })
})
