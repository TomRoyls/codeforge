import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LFUCache } from '../../src/core/lfu-cache/lfu-cache.js'
import type { LFUCacheOptions, LFUCacheEntry } from '../../src/core/lfu-cache/types.js'

describe('LFUCache', () => {
  describe('construction', () => {
    it('creates cache with maxSize', () => {
      const cache = new LFUCache({ maxSize: 10 })
      expect(cache.getMaxSize()).toBe(10)
      expect(cache.size()).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('creates cache with maxSize 1', () => {
      const cache = new LFUCache({ maxSize: 1 })
      expect(cache.getMaxSize()).toBe(1)
    })

    it('creates cache with maxSize 0', () => {
      const cache = new LFUCache({ maxSize: 0 })
      cache.set('a', 1)
      expect(cache.size()).toBe(0)
    })

    it('creates cache with onEvict callback', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache({ maxSize: 2, onEvict })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(onEvict).toHaveBeenCalled()
    })

    it('accepts number keys', () => {
      const cache = new LFUCache<number, string>({ maxSize: 5 })
      cache.set(1, 'one')
      expect(cache.get(1)).toBe('one')
    })

    it('accepts object keys', () => {
      const cache = new LFUCache<object, string>({ maxSize: 5 })
      const key = { id: 1 }
      cache.set(key, 'value')
      expect(cache.get(key)).toBe('value')
    })
  })

  describe('get/set', () => {
    let cache: LFUCache<string, number>

    beforeEach(() => {
      cache = new LFUCache({ maxSize: 5 })
    })

    it('sets and gets a value', () => {
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing value with set', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })

    it('updating existing key increments frequency', () => {
      cache.set('a', 1)
      expect(cache.getFrequency('a')).toBe(1)
      cache.set('a', 2)
      expect(cache.getFrequency('a')).toBe(2)
      expect(cache.get('a')).toBe(2)
      expect(cache.getFrequency('a')).toBe(3)
    })

    it('get increments frequency', () => {
      cache.set('a', 1)
      expect(cache.getFrequency('a')).toBe(1)
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(2)
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(3)
    })

    it('tracks size correctly', () => {
      expect(cache.size()).toBe(0)
      cache.set('a', 1)
      expect(cache.size()).toBe(1)
      cache.set('b', 2)
      expect(cache.size()).toBe(2)
    })

    it('size does not increase on overwrite', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.size()).toBe(1)
    })

    it('does not exceed maxSize', () => {
      const small = new LFUCache<string, number>({ maxSize: 2 })
      small.set('a', 1)
      small.set('b', 2)
      small.set('c', 3)
      expect(small.size()).toBe(2)
    })

    it('set with maxSize 0 does nothing', () => {
      const zero = new LFUCache<string, number>({ maxSize: 0 })
      zero.set('a', 1)
      expect(zero.size()).toBe(0)
    })
  })

  describe('has', () => {
    let cache: LFUCache<string, number>

    beforeEach(() => {
      cache = new LFUCache({ maxSize: 5 })
    })

    it('returns true for existing key', () => {
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('returns false after delete', () => {
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after eviction', () => {
      const small = new LFUCache<string, number>({ maxSize: 1 })
      small.set('a', 1)
      small.set('b', 2)
      expect(small.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    let cache: LFUCache<string, number>

    beforeEach(() => {
      cache = new LFUCache({ maxSize: 5 })
    })

    it('deletes existing key and returns true', () => {
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('deleting key adjusts size', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size()).toBe(1)
    })

    it('can delete and re-add', () => {
      cache.set('a', 1)
      cache.delete('a')
      cache.set('a', 2)
      expect(cache.peek('a')).toBe(2)
      expect(cache.getFrequency('a')).toBe(1)
    })
  })

  describe('frequency tracking', () => {
    let cache: LFUCache<string, number>

    beforeEach(() => {
      cache = new LFUCache({ maxSize: 10 })
    })

    it('new entry has frequency 1', () => {
      cache.set('a', 1)
      expect(cache.getFrequency('a')).toBe(1)
    })

    it('get increments frequency', () => {
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(3)
    })

    it('set on existing key increments frequency', () => {
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.getFrequency('a')).toBe(2)
    })

    it('returns 0 for missing key', () => {
      expect(cache.getFrequency('missing')).toBe(0)
    })

    it('multiple keys track independently', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      expect(cache.getFrequency('a')).toBe(3)
      expect(cache.getFrequency('b')).toBe(2)
    })
  })

  describe('eviction order', () => {
    it('evicts least frequently used', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a')
      cache.get('a')
      cache.get('b')

      cache.set('d', 4)

      expect(cache.has('c')).toBe(false)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('evicts LRU among same frequency (tiebreaker)', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a')
      cache.get('b')
      cache.get('c')

      cache.set('d', 4)

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('evicts correctly after frequency changes', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)

      cache.get('a')
      cache.set('c', 3)

      expect(cache.has('b')).toBe(false)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('evicts multiple when adding multiple', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)

      expect(cache.size()).toBe(2)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('maxSize=1 evicts immediately', () => {
      const cache = new LFUCache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      expect(cache.size()).toBe(1)
      cache.set('b', 2)
      expect(cache.size()).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('eviction after delete updates minFreq', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.get('b')

      cache.delete('a')

      cache.set('d', 4)
      cache.set('e', 5)

      expect(cache.has('c')).toBe(false)
    })

    it('evicts correctly when frequencies diverge widely', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      for (let i = 0; i < 100; i++) cache.get('a')
      for (let i = 0; i < 50; i++) cache.get('b')
      for (let i = 0; i < 25; i++) cache.get('c')

      cache.set('d', 4)

      expect(cache.has('c')).toBe(false)
    })

    it('re-evicts from new minFreq after eviction empties bucket', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('b')
      cache.get('c')

      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)

      cache.set('e', 5)
      expect(cache.has('d')).toBe(false)
    })
  })

  describe('onEvict callback', () => {
    it('calls onEvict when eviction occurs', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 2, onEvict })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(onEvict).toHaveBeenCalledWith('a', 1)
    })

    it('calls onEvict with correct key and value', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 2, onEvict })
      cache.set('a', 100)
      cache.set('b', 200)
      cache.get('a')
      cache.set('c', 300)

      expect(onEvict).toHaveBeenCalledWith('b', 200)
    })

    it('calls onEvict for each eviction', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 1, onEvict })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(onEvict).toHaveBeenCalledTimes(2)
    })

    it('does not call onEvict on manual delete', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 5, onEvict })
      cache.set('a', 1)
      cache.delete('a')

      expect(onEvict).not.toHaveBeenCalled()
    })

    it('does not call onEvict on resize eviction', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 5, onEvict })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.resize(1)

      expect(onEvict).toHaveBeenCalled()
    })
  })

  describe('peek', () => {
    it('returns value without incrementing frequency', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      expect(cache.peek('a')).toBe(1)
      expect(cache.getFrequency('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('peek does not affect eviction order', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.peek('a')
      cache.set('c', 3)

      expect(cache.has('a')).toBe(false)
    })

    it('multiple peeks do not change frequency', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.peek('a')
      cache.peek('a')
      cache.peek('a')
      expect(cache.getFrequency('a')).toBe(1)
    })
  })

  describe('keys/values/entries', () => {
    let cache: LFUCache<string, number>

    beforeEach(() => {
      cache = new LFUCache({ maxSize: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
    })

    it('keys returns sorted by frequency (lowest first)', () => {
      const keys = cache.keys()
      expect(keys).toEqual(['c', 'b', 'a'])
    })

    it('values returns values sorted by frequency', () => {
      const values = cache.values()
      expect(values).toEqual([3, 2, 1])
    })

    it('entries returns entries sorted by frequency', () => {
      const entries = cache.entries()
      expect(entries).toEqual([
        { key: 'c', value: 3, frequency: 1 },
        { key: 'b', value: 2, frequency: 2 },
        { key: 'a', value: 1, frequency: 3 },
      ])
    })

    it('keys returns empty array for empty cache', () => {
      const empty = new LFUCache<string, number>({ maxSize: 5 })
      expect(empty.keys()).toEqual([])
    })

    it('values returns empty array for empty cache', () => {
      const empty = new LFUCache<string, number>({ maxSize: 5 })
      expect(empty.values()).toEqual([])
    })

    it('entries returns empty array for empty cache', () => {
      const empty = new LFUCache<string, number>({ maxSize: 5 })
      expect(empty.entries()).toEqual([])
    })

    it('entries for single item', () => {
      const single = new LFUCache<string, number>({ maxSize: 5 })
      single.set('x', 42)
      expect(single.entries()).toEqual([{ key: 'x', value: 42, frequency: 1 }])
    })
  })

  describe('resize', () => {
    it('shrinks cache and evicts excess', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')

      cache.resize(2)

      expect(cache.size()).toBe(2)
      expect(cache.getMaxSize()).toBe(2)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
    })

    it('expand capacity', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.resize(5)
      cache.set('c', 3)
      cache.set('d', 4)

      expect(cache.size()).toBe(4)
    })

    it('resize to same size is no-op', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.resize(3)
      expect(cache.size()).toBe(3)
    })

    it('resize to 0 clears all', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.resize(0)
      expect(cache.size()).toBe(0)
    })

    it('resize to 1 keeps only one', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')

      cache.resize(1)
      expect(cache.size()).toBe(1)
      expect(cache.has('a')).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('clear allows re-use', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.size()).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

    it('clear on empty cache is safe', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries by frequency', () => {
      const cache = new LFUCache<string, number>({ maxSize: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')

      const result: Array<LFUCacheEntry<string, number>> = []
      cache.forEach((entry) => result.push(entry))

      expect(result).toEqual([
        { key: 'b', value: 2, frequency: 1 },
        { key: 'a', value: 1, frequency: 2 },
      ])
    })

    it('does nothing on empty cache', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      const fn = vi.fn()
      cache.forEach(fn)
      expect(fn).not.toHaveBeenCalled()
    })

    it('provides correct entry data', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('x', 42)

      cache.forEach((entry) => {
        expect(entry.key).toBe('x')
        expect(entry.value).toBe(42)
        expect(entry.frequency).toBe(1)
      })
    })
  })

  describe('iterator', () => {
    it('is iterable with for-of', () => {
      const cache = new LFUCache<string, number>({ maxSize: 10 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')

      const result: Array<LFUCacheEntry<string, number>> = []
      for (const entry of cache) {
        result.push(entry)
      }

      expect(result).toEqual([
        { key: 'b', value: 2, frequency: 1 },
        { key: 'a', value: 1, frequency: 2 },
      ])
    })

    it('empty cache yields nothing', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      const result: Array<LFUCacheEntry<string, number>> = []
      for (const entry of cache) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('spread works', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      const arr = [...cache]
      expect(arr).toHaveLength(2)
    })
  })

  describe('toArray', () => {
    it('returns entries as array', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.toArray()).toEqual(cache.entries())
    })

    it('returns empty array for empty cache', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      expect(cache.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')

      const cloned = cache.clone()

      expect(cloned.size()).toBe(cache.size())
      expect(cloned.getMaxSize()).toBe(cache.getMaxSize())
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('clone is independent', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)

      const cloned = cache.clone()
      cloned.set('b', 2)

      expect(cache.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('clone preserves frequencies', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')

      const cloned = cache.clone()
      expect(cloned.getFrequency('a')).toBe(3)
    })

    it('clone preserves onEvict', () => {
      const onEvict = vi.fn()
      const cache = new LFUCache<string, number>({ maxSize: 2, onEvict })
      cache.set('a', 1)
      cache.set('b', 2)

      const cloned = cache.clone()
      cloned.set('c', 3)

      expect(onEvict).toHaveBeenCalled()
    })

    it('modifying clone does not affect original', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)

      const cloned = cache.clone()
      cloned.delete('a')
      cloned.set('b', 2)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('clone empty cache', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      const cloned = cache.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('maxSize=1: basic operations', () => {
      const cache = new LFUCache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('maxSize=1: get then set', () => {
      const cache = new LFUCache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
    })

    it('update value preserves frequency progression', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(2)
      cache.set('a', 100)
      expect(cache.getFrequency('a')).toBe(3)
      expect(cache.get('a')).toBe(100)
    })

    it('same frequency LRU tiebreaker eviction order', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.set('d', 4)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)

      cache.set('e', 5)
      expect(cache.has('b')).toBe(false)
    })

    it('delete and re-insert resets frequency', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getFrequency('a')).toBe(4)
      cache.delete('a')
      cache.set('a', 10)
      expect(cache.getFrequency('a')).toBe(1)
    })

    it('rapid get/set cycle', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      for (let i = 0; i < 50; i++) {
        cache.get('a')
      }
      for (let i = 0; i < 30; i++) {
        cache.get('b')
      }

      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('a')).toBe(true)
    })

    it('undefined values', () => {
      const cache = new LFUCache<string, number | undefined>({ maxSize: 5 })
      cache.set('a', undefined)
      expect(cache.has('a')).toBe(true)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.getFrequency('a')).toBe(2)
    })

    it('null values', () => {
      const cache = new LFUCache<string, number | null>({ maxSize: 5 })
      cache.set('a', null)
      expect(cache.get('a')).toBe(null)
    })

    it('empty string key', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('', 42)
      expect(cache.get('')).toBe(42)
    })

    it('zero value', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 0)
      expect(cache.get('a')).toBe(0)
      expect(cache.has('a')).toBe(true)
    })

    it('false value', () => {
      const cache = new LFUCache<string, boolean>({ maxSize: 5 })
      cache.set('a', false)
      expect(cache.get('a')).toBe(false)
      expect(cache.has('a')).toBe(true)
    })

    it('delete from single entry', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.size()).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('clear then re-populate', () => {
      const cache = new LFUCache<string, number>({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      cache.set('d', 4)
      cache.set('e', 5)
      expect(cache.size()).toBe(2)
      expect(cache.get('d')).toBe(4)
    })
  })

  describe('additional edge cases', () => {
    it('maxSize=1 delete then set', () => {
      const cache = new LFUCache<string, number>({ maxSize: 1 })
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty()).toBe(true)
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size()).toBe(1)
    })

    it('entries maintains order after multiple get calls', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('c')
      cache.get('c')
      cache.get('b')
      const entries = cache.entries()
      expect(entries[0]!.key).toBe('a')
      expect(entries[1]!.key).toBe('b')
      expect(entries[2]!.key).toBe('c')
    })

    it('forEach does not mutate cache', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      const sizeBefore = cache.size()
      cache.forEach(() => {})
      expect(cache.size()).toBe(sizeBefore)
    })

    it('clone with varied frequencies', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.get('b')

      const cloned = cache.clone()
      const origEntries = cache.entries()
      const cloneEntries = cloned.entries()
      expect(cloneEntries).toEqual(origEntries)
    })

    it('multiple deletes do not corrupt state', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')
      cache.delete('a')
      expect(cache.size()).toBe(1)
      expect(cache.get('c')).toBe(3)
    })

    it('set after delete triggers eviction correctly', () => {
      const cache = new LFUCache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.delete('a')
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.size()).toBe(2)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('resize below current size preserves frequency order', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      cache.get('e')
      cache.get('e')
      cache.get('d')

      cache.resize(2)
      expect(cache.size()).toBe(2)
      expect(cache.has('e')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('object values stored and retrieved correctly', () => {
      const cache = new LFUCache<string, object>({ maxSize: 5 })
      const obj = { foo: 'bar', nested: { val: 42 } }
      cache.set('a', obj)
      expect(cache.get('a')).toBe(obj)
    })

    it('array values stored and retrieved', () => {
      const cache = new LFUCache<string, number[]>({ maxSize: 5 })
      cache.set('a', [1, 2, 3])
      expect(cache.get('a')).toEqual([1, 2, 3])
    })

    it('Symbol.iterator matches toArray', () => {
      const cache = new LFUCache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      expect([...cache]).toEqual(cache.toArray())
    })
  })

  describe('stress tests', () => {
    it('handles 1000 insertions', () => {
      const cache = new LFUCache<number, number>({ maxSize: 100 })
      for (let i = 0; i < 1000; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size()).toBe(100)
    })

    it('handles 1000 mixed operations', () => {
      const cache = new LFUCache<number, number>({ maxSize: 50 })
      for (let i = 0; i < 1000; i++) {
        cache.set(i, i)
        if (i > 10) {
          cache.get(i - 10)
        }
        if (i % 5 === 0 && cache.has(i)) {
          cache.delete(i)
        }
      }
      expect(cache.size()).toBeLessThanOrEqual(50)
    })

    it('frequency ordering under stress', () => {
      const cache = new LFUCache<number, number>({ maxSize: 10 })
      for (let i = 0; i < 10; i++) {
        cache.set(i, i)
      }
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j <= i; j++) {
          cache.get(i)
        }
      }

      const freqs = cache.entries().map((e) => e.frequency)
      for (let i = 1; i < freqs.length; i++) {
        expect(freqs[i]).toBeGreaterThanOrEqual(freqs[i - 1]!)
      }
    })

    it('handles rapid resize', () => {
      const cache = new LFUCache<number, number>({ maxSize: 100 })
      for (let i = 0; i < 100; i++) {
        cache.set(i, i)
      }
      cache.resize(10)
      expect(cache.size()).toBe(10)
      cache.resize(50)
      for (let i = 100; i < 150; i++) {
        cache.set(i, i)
      }
      expect(cache.size()).toBe(50)
    })

    it('onEvict called correctly under stress', () => {
      const evicted: Array<{ key: number; value: number }> = []
      const cache = new LFUCache<number, number>({
        maxSize: 10,
        onEvict: (key, value) => evicted.push({ key, value }),
      })

      for (let i = 0; i < 100; i++) {
        cache.set(i, i * 10)
      }

      expect(evicted.length).toBe(90)
      for (const e of evicted) {
        expect(e.value).toBe(e.key * 10)
      }
    })

    it('clone large cache', () => {
      const cache = new LFUCache<number, number>({ maxSize: 500 })
      for (let i = 0; i < 500; i++) {
        cache.set(i, i)
        for (let j = 0; j < i % 10; j++) {
          cache.get(i)
        }
      }

      const cloned = cache.clone()
      expect(cloned.size()).toBe(500)

      for (let i = 0; i < 500; i++) {
        if (cache.has(i)) {
          expect(cloned.has(i)).toBe(true)
          expect(cloned.getFrequency(i)).toBe(cache.getFrequency(i))
        }
      }
    })
  })
})
