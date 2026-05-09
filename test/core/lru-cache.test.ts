import { describe, it, expect, beforeEach } from 'vitest'
import { LRUCache } from '../../src/core/lru-cache/lru-cache.js'

describe('LRUCache', () => {
  describe('constructor', () => {
    it('creates cache with given capacity', () => {
      const cache = new LRUCache<string, number>(10)
      expect(cache.capacity).toBe(10)
      expect(cache.size).toBe(0)
    })

    it('creates cache with capacity 1', () => {
      const cache = new LRUCache<string, number>(1)
      expect(cache.capacity).toBe(1)
      expect(cache.size).toBe(0)
    })

    it('creates cache with large capacity', () => {
      const cache = new LRUCache<string, number>(1000000)
      expect(cache.capacity).toBe(1000000)
    })

    it('creates empty cache', () => {
      const cache = new LRUCache<string, number>(5)
      expect(cache.isEmpty()).toBe(true)
    })

    it('creates cache with capacity 0', () => {
      const cache = new LRUCache<string, number>(0)
      expect(cache.capacity).toBe(0)
      expect(cache.size).toBe(0)
    })
  })

  describe('get', () => {
    let cache: LRUCache<string, number>

    beforeEach(() => {
      cache = new LRUCache<string, number>(3)
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

    it('moves accessed key to front', () => {
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'c', 'b'])
    })

    it('updates order on multiple gets', () => {
      cache.get('b')
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'b', 'c'])
    })

    it('getting most recent does not change order', () => {
      cache.get('c')
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('returns undefined after delete', () => {
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })

    it('returns undefined after clear', () => {
      cache.clear()
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
    })

    it('works with number keys', () => {
      const numCache = new LRUCache<number, string>(3)
      numCache.set(1, 'one')
      numCache.set(2, 'two')
      expect(numCache.get(1)).toBe('one')
    })

    it('works with object values', () => {
      const objCache = new LRUCache<string, { x: number }>(3)
      objCache.set('a', { x: 1 })
      expect(objCache.get('a')).toEqual({ x: 1 })
    })

    it('returns undefined on empty cache', () => {
      const empty = new LRUCache<string, number>(3)
      expect(empty.get('a')).toBeUndefined()
    })
  })

  describe('set', () => {
    it('stores a value', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined when not evicting', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.set('a', 1)).toBeUndefined()
    })

    it('returns evicted value when full', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      const evicted = cache.set('c', 3)
      expect(evicted).toBe(1)
    })

    it('returns undefined when updating existing key', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.set('a', 10)).toBeUndefined()
    })

    it('updates value for existing key', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('a', 10)
      expect(cache.get('a')).toBe(10)
    })

    it('moves updated key to front', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.keys()).toEqual(['a', 'c', 'b'])
    })

    it('evicts least recently used when full', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('evicts after get promotes a key', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })

    it('maintains correct size after evictions', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
    })

    it('returns undefined for capacity 0', () => {
      const cache = new LRUCache<string, number>(0)
      expect(cache.set('a', 1)).toBeUndefined()
      expect(cache.size).toBe(0)
    })

    it('fills to capacity exactly', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
      expect(cache.isFull()).toBe(true)
    })

    it('returns correct evicted value on multiple evictions', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      expect(cache.set('b', 2)).toBe(1)
      expect(cache.set('c', 3)).toBe(2)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('returns false after eviction', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
    })

    it('returns true after update', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.has('a')).toBe(true)
    })

    it('does not affect order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.has('a')
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })
  })

  describe('delete', () => {
    it('returns true when deleting existing key', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
    })

    it('returns false when deleting missing key', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.delete('a')).toBe(false)
    })

    it('removes the key from cache', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
      expect(cache.has('a')).toBe(false)
    })

    it('decrements size', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('deletes head node', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('b')
      expect(cache.keys()).toEqual(['a'])
    })

    it('deletes tail node', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })

    it('deletes middle node', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')
      expect(cache.keys()).toEqual(['c', 'a'])
    })

    it('deletes the only node', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.size).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('allows re-adding after delete', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['c', 'b'])
    })

    it('double delete returns false', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.delete('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty cache', () => {
      const cache = new LRUCache<string, number>(5)
      expect(cache.size).toBe(0)
    })

    it('increases on set', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
    })

    it('stays same on update', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.size).toBe(1)
    })

    it('decreases on delete', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })

    it('stays same on eviction', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
    })
  })

  describe('capacity', () => {
    it('returns constructor capacity', () => {
      const cache = new LRUCache<string, number>(42)
      expect(cache.capacity).toBe(42)
    })

    it('stays constant after operations', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.capacity).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new cache', () => {
      const cache = new LRUCache<string, number>(5)
      expect(cache.isEmpty()).toBe(true)
    })

    it('returns false after set', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      expect(cache.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.clear()
      expect(cache.isEmpty()).toBe(true)
    })

    it('returns true after deleting all', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('returns false for empty cache', () => {
      const cache = new LRUCache<string, number>(5)
      expect(cache.isFull()).toBe(false)
    })

    it('returns true when at capacity', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.isFull()).toBe(true)
    })

    it('returns false after delete from full', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.isFull()).toBe(false)
    })

    it('returns true after eviction keeps it full', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.isFull()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.isEmpty()).toBe(true)
    })

    it('allows adding after clear', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      cache.set('c', 3)
      expect(cache.size).toBe(1)
      expect(cache.get('c')).toBe(3)
    })

    it('does not affect capacity', () => {
      const cache = new LRUCache<string, number>(5)
      cache.clear()
      expect(cache.capacity).toBe(5)
    })

    it('clears empty cache without error', () => {
      const cache = new LRUCache<string, number>(5)
      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('clears head and tail pointers', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.peekMostRecent()).toBeUndefined()
      expect(cache.peekLeastRecent()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('returns value without updating order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.peek('a')
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('returns undefined for missing key', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 42)
      expect(cache.peek('a')).toBe(42)
    })

    it('does not affect eviction order', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.peek('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    it('returns updated value after set', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('a', 10)
      expect(cache.peek('a')).toBe(10)
    })
  })

  describe('peekLeastRecent', () => {
    it('returns LRU entry', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.peekLeastRecent()).toEqual(['a', 1])
    })

    it('returns undefined for empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.peekLeastRecent()).toBeUndefined()
    })

    it('updates after get', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      expect(cache.peekLeastRecent()).toEqual(['b', 2])
    })

    it('returns single entry when only one', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.peekLeastRecent()).toEqual(['a', 1])
    })

    it('returns same as peekMostRecent for single entry', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.peekLeastRecent()).toEqual(cache.peekMostRecent())
    })
  })

  describe('peekMostRecent', () => {
    it('returns MRU entry', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.peekMostRecent()).toEqual(['c', 3])
    })

    it('returns undefined for empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.peekMostRecent()).toBeUndefined()
    })

    it('updates after get', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      expect(cache.peekMostRecent()).toEqual(['a', 1])
    })

    it('returns single entry when only one', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      expect(cache.peekMostRecent()).toEqual(['a', 1])
    })
  })

  describe('forEach', () => {
    it('iterates MRU to LRU order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const result: [string, number][] = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('iterates empty cache without calling callback', () => {
      const cache = new LRUCache<string, number>(3)
      const result: [string, number][] = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([])
    })

    it('iterates single entry', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      const result: [string, number][] = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([['a', 1]])
    })

    it('passes value and key to callback in correct order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('x', 42)
      let receivedKey: string | undefined
      let receivedValue: number | undefined
      cache.forEach((v, k) => {
        receivedKey = k
        receivedValue = v
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })

    it('reflects current order after gets', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      const result: [string, number][] = []
      cache.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([['a', 1], ['c', 3], ['b', 2]])
    })
  })

  describe('keys', () => {
    it('returns keys in MRU to LRU order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('returns empty array for empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.keys()).toEqual([])
    })

    it('updates after get', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'c', 'b'])
    })

    it('updates after delete', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns values in MRU to LRU order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.values()).toEqual([3, 2, 1])
    })

    it('returns empty array for empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.values()).toEqual([])
    })

    it('updates after set update', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.values()).toEqual([10, 3, 2])
    })
  })

  describe('entries', () => {
    it('returns entries in MRU to LRU order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.entries()).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('returns empty array for empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      expect(cache.entries()).toEqual([])
    })

    it('returns correct entries after operations', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.delete('b')
      expect(cache.entries()).toEqual([['c', 3], ['a', 1]])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const cloned = cache.clone()
      expect(cloned.entries()).toEqual(cache.entries())
    })

    it('has same capacity', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      expect(cache.clone().capacity).toBe(5)
    })

    it('has same size', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.clone().size).toBe(2)
    })

    it('is independent from original', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const cloned = cache.clone()
      cache.set('c', 3)
      expect(cache.size).toBe(3)
      expect(cloned.size).toBe(2)
    })

    it('modifying clone does not affect original', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const cloned = cache.clone()
      cloned.delete('a')
      expect(cache.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('preserves order', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      const cloned = cache.clone()
      expect(cloned.keys()).toEqual(['a', 'c', 'b'])
    })

    it('clones empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      const cloned = cache.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone of clone works', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      const cloned = cache.clone().clone()
      expect(cloned.get('a')).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates MRU to LRU', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const result = [...cache]
      expect(result).toEqual([['c', 3], ['b', 2], ['a', 1]])
    })

    it('works with empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      const result = [...cache]
      expect(result).toEqual([])
    })

    it('works with for...of', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const result: [string, number][] = []
      for (const entry of cache) {
        result.push(entry)
      }
      expect(result).toEqual([['b', 2], ['a', 1]])
    })

    it('works with destructuring', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      const [first, second] = cache
      expect(first).toEqual(['b', 2])
      expect(second).toEqual(['a', 1])
    })

    it('yields correct count', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect([...cache].length).toBe(3)
    })
  })

  describe('resize', () => {
    it('shrinks and returns evicted entries', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const evicted = cache.resize(1)
      expect(evicted).toEqual([['a', 1], ['b', 2]])
      expect(cache.size).toBe(1)
    })

    it('expands without evicting', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      const evicted = cache.resize(5)
      expect(evicted).toEqual([])
      expect(cache.size).toBe(2)
    })

    it('updates capacity', () => {
      const cache = new LRUCache<string, number>(3)
      cache.resize(10)
      expect(cache.capacity).toBe(10)
    })

    it('resize to 0 evicts all', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const evicted = cache.resize(0)
      expect(evicted).toEqual([['a', 1], ['b', 2], ['c', 3]])
      expect(cache.size).toBe(0)
    })

    it('evicts LRU entries first', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      const evicted = cache.resize(2)
      expect(evicted).toEqual([['b', 2]])
      expect(cache.keys()).toEqual(['a', 'c'])
    })

    it('same size returns empty', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      const evicted = cache.resize(3)
      expect(evicted).toEqual([])
      expect(cache.size).toBe(2)
    })

    it('allows adding after expand', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.resize(3)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })

    it('evicts in LRU to MRU order', () => {
      const cache = new LRUCache<string, number>(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      cache.set('e', 5)
      const evicted = cache.resize(2)
      expect(evicted).toEqual([['a', 1], ['b', 2], ['c', 3]])
      expect(cache.keys()).toEqual(['e', 'd'])
    })

    it('resize empty cache', () => {
      const cache = new LRUCache<string, number>(3)
      const evicted = cache.resize(1)
      expect(evicted).toEqual([])
      expect(cache.capacity).toBe(1)
    })
  })

  describe('fromEntries', () => {
    it('creates cache from entries', () => {
      const cache = LRUCache.fromEntries([['a', 1], ['b', 2], ['c', 3]], 5)
      expect(cache.size).toBe(3)
      expect(cache.get('a')).toBe(1)
    })

    it('sets capacity', () => {
      const cache = LRUCache.fromEntries([['a', 1]], 10)
      expect(cache.capacity).toBe(10)
    })

    it('evicts when entries exceed capacity', () => {
      const cache = LRUCache.fromEntries([['a', 1], ['b', 2], ['c', 3]], 2)
      expect(cache.size).toBe(2)
      expect(cache.has('a')).toBe(false)
    })

    it('creates empty cache from empty entries', () => {
      const cache = LRUCache.fromEntries<string, number>([], 5)
      expect(cache.size).toBe(0)
    })

    it('last entry is most recent', () => {
      const cache = LRUCache.fromEntries([['a', 1], ['b', 2], ['c', 3]], 5)
      expect(cache.peekMostRecent()).toEqual(['c', 3])
      expect(cache.peekLeastRecent()).toEqual(['a', 1])
    })

    it('works with number keys', () => {
      const cache = LRUCache.fromEntries([[1, 'a'], [2, 'b']], 5)
      expect(cache.get(1)).toBe('a')
    })
  })

  describe('capacity 1 edge cases', () => {
    it('holds exactly one item', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(1)
    })

    it('evicts on second set', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      const evicted = cache.set('b', 2)
      expect(evicted).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('get on single item works', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.get('a')
      expect(cache.get('a')).toBe(1)
    })

    it('update does not evict', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.set('a', 10)
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(10)
    })

    it('delete on capacity 1', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.isEmpty()).toBe(true)
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
    })

    it('resize from 1 to larger', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.resize(3)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)
    })

    it('resize to 1', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      const evicted = cache.resize(1)
      expect(evicted).toEqual([['a', 1], ['b', 2]])
      expect(cache.size).toBe(1)
    })

    it('clear and reuse', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      cache.clear()
      cache.set('b', 2)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('peek on single item', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 42)
      expect(cache.peek('a')).toBe(42)
      expect(cache.peekMostRecent()).toEqual(['a', 42])
      expect(cache.peekLeastRecent()).toEqual(['a', 42])
    })

    it('clone capacity 1 cache', () => {
      const cache = new LRUCache<string, number>(1)
      cache.set('a', 1)
      const cloned = cache.clone()
      expect(cloned.size).toBe(1)
      expect(cloned.capacity).toBe(1)
      expect(cloned.get('a')).toBe(1)
    })
  })

  describe('generic types', () => {
    it('works with number keys', () => {
      const cache = new LRUCache<number, string>(3)
      cache.set(1, 'one')
      cache.set(2, 'two')
      expect(cache.get(1)).toBe('one')
      expect(cache.keys()).toEqual([1, 2])
    })

    it('works with object values', () => {
      const cache = new LRUCache<string, { id: number }>(3)
      cache.set('a', { id: 1 })
      cache.set('b', { id: 2 })
      expect(cache.get('a')).toEqual({ id: 1 })
    })

    it('works with boolean values', () => {
      const cache = new LRUCache<string, boolean>(3)
      cache.set('a', true)
      cache.set('b', false)
      expect(cache.get('a')).toBe(true)
      expect(cache.get('b')).toBe(false)
    })

    it('works with null values', () => {
      const cache = new LRUCache<string, number | null>(3)
      cache.set('a', null)
      cache.set('b', 1)
      expect(cache.get('a')).toBeNull()
    })
  })

  describe('linked list integrity', () => {
    it('maintains correct order after complex operations', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.delete('b')
      expect(cache.keys()).toEqual(['a', 'c'])
    })

    it('handles delete and reinsert', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      cache.set('a', 3)
      expect(cache.keys()).toEqual(['a', 'b'])
    })

    it('handles eviction after get reorder', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('b')).toBe(false)
      expect(cache.keys()).toEqual(['d', 'a', 'c'])
    })

    it('maintains correct entries after complex operations', () => {
      const cache = new LRUCache<string, number>(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.set('d', 4)
      cache.delete('a')
      cache.set('e', 5)
      expect(cache.entries()).toEqual([['e', 5], ['d', 4], ['c', 3]])
    })

    it('handles rapid set/get cycles', () => {
      const cache = new LRUCache<string, number>(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      cache.get('a')
      cache.set('d', 4)
      expect(cache.has('c')).toBe(false)
      expect(cache.keys()).toEqual(['d', 'a'])
    })
  })

  describe('O(1) operations stress test', () => {
    it('handles many operations', () => {
      const cache = new LRUCache<number, number>(100)
      for (let i = 0; i < 1000; i++) {
        cache.set(i, i * 10)
      }
      expect(cache.size).toBe(100)
      expect(cache.has(999)).toBe(true)
      expect(cache.has(900)).toBe(true)
      expect(cache.has(899)).toBe(false)
    })

    it('handles many gets and sets', () => {
      const cache = new LRUCache<number, number>(10)
      for (let i = 0; i < 100; i++) {
        cache.set(i, i)
      }
      for (let i = 90; i < 100; i++) {
        cache.get(i)
      }
      cache.set(100, 100)
      expect(cache.has(100)).toBe(true)
      expect(cache.has(99)).toBe(true)
      expect(cache.has(91)).toBe(true)
      expect(cache.has(90)).toBe(false)
    })
  })
})
