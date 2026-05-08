import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LRUCache } from '../../src/core/lru-cache/lru-cache.js'
import { DEFAULT_LRU_CACHE_OPTIONS } from '../../src/core/lru-cache/types.js'
import type { LRUNode, LRUCacheOptions, LRUCacheStats } from '../../src/core/lru-cache/types.js'

describe('LRUCache', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache<string>()
  })

  describe('constructor', () => {
    it('should create a cache with default options', () => {
      const c = new LRUCache<number>()
      expect(c.size()).toBe(0)
    })

    it('should accept custom maxSize option', () => {
      const c = new LRUCache<string>({ maxSize: 5 })
      expect(c.getStats().maxSize).toBe(5)
    })

    it('should accept custom ttlMs option', () => {
      const c = new LRUCache<string>({ ttlMs: 1000 })
      expect(c.getStats().size).toBe(0)
    })

    it('should accept partial options', () => {
      const c = new LRUCache<string>({ maxSize: 50 })
      expect(c.getStats().maxSize).toBe(50)
    })

    it('should accept all options combined', () => {
      const c = new LRUCache<string>({ maxSize: 10, ttlMs: 5000 })
      expect(c.getStats().maxSize).toBe(10)
    })
  })

  describe('get and set', () => {
    it('should return undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      cache.set('a', 'value-a')
      expect(cache.get('a')).toBe('value-a')
    })

    it('should overwrite existing key', () => {
      cache.set('a', 'old')
      cache.set('a', 'new')
      expect(cache.get('a')).toBe('new')
    })

    it('should not increase size when overwriting', () => {
      cache.set('a', 'old')
      cache.set('a', 'new')
      expect(cache.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      expect(cache.get('a')).toBe('1')
      expect(cache.get('b')).toBe('2')
      expect(cache.get('c')).toBe('3')
    })

    it('should move accessed key to front', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'c', 'b'])
    })
  })

  describe('LRU eviction', () => {
    it('should evict oldest item when capacity exceeded', () => {
      const c = new LRUCache<string>({ maxSize: 2 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      expect(c.has('a')).toBe(false)
      expect(c.has('b')).toBe(true)
      expect(c.has('c')).toBe(true)
    })

    it('should evict least recently used item', () => {
      const c = new LRUCache<string>({ maxSize: 3 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      c.get('a')
      c.set('d', '4')
      expect(c.has('a')).toBe(true)
      expect(c.has('b')).toBe(false)
      expect(c.has('c')).toBe(true)
      expect(c.has('d')).toBe(true)
    })

    it('should track evictions in stats', () => {
      const c = new LRUCache<string>({ maxSize: 2 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      expect(c.getStats().evictions).toBe(1)
    })

    it('should track multiple evictions', () => {
      const c = new LRUCache<string>({ maxSize: 1 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      expect(c.getStats().evictions).toBe(2)
    })

    it('should evict correctly with capacity 1', () => {
      const c = new LRUCache<string>({ maxSize: 1 })
      c.set('a', '1')
      expect(c.get('a')).toBe('1')
      c.set('b', '2')
      expect(c.has('a')).toBe(false)
      expect(c.get('b')).toBe('2')
    })
  })

  describe('TTL expiration', () => {
    it('should not expire items when ttlMs is 0', () => {
      const c = new LRUCache<string>({ ttlMs: 0 })
      c.set('a', 'value')
      expect(c.get('a')).toBe('value')
    })

    it('should expire items after ttlMs', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      expect(c.get('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('should return fresh items before ttlMs', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 1000 })
      c.set('a', 'value')
      vi.advanceTimersByTime(500)
      expect(c.get('a')).toBe('value')
      vi.useRealTimers()
    })

    it('should count expired get as miss', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      c.get('a')
      expect(c.getStats().misses).toBe(1)
      vi.useRealTimers()
    })

    it('should remove expired item from cache on get', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      c.get('a')
      expect(c.size()).toBe(0)
      vi.useRealTimers()
    })

    it('should detect expired items in has', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      expect(c.has('a')).toBe(false)
      vi.useRealTimers()
    })

    it('should detect expired items in peek', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      expect(c.peek('a')).toBeUndefined()
      vi.useRealTimers()
    })

    it('should skip expired items in keys', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      c.set('b', 'value-b')
      vi.advanceTimersByTime(101)
      expect(c.keys()).toEqual([])
      vi.useRealTimers()
    })

    it('should skip expired items in values', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      expect(c.values()).toEqual([])
      vi.useRealTimers()
    })

    it('should skip expired items in entries', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      expect(c.entries()).toEqual([])
      vi.useRealTimers()
    })

    it('should handle TTL expiration on set overwrite', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100, maxSize: 2 })
      c.set('a', 'value')
      vi.advanceTimersByTime(101)
      c.set('a', 'new-value')
      expect(c.get('a')).toBe('new-value')
      vi.useRealTimers()
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      cache.set('a', 'value')
      expect(cache.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      cache.set('a', 'value')
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
    })

    it('should not move item to front', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.has('a')
      expect(cache.keys()).toEqual(['b', 'a'])
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      cache.set('a', 'value')
      expect(cache.delete('a')).toBe(true)
    })

    it('should remove item from cache', () => {
      cache.set('a', 'value')
      cache.delete('a')
      expect(cache.size()).toBe(0)
    })

    it('should remove item from linked list', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      cache.delete('b')
      expect(cache.keys()).toEqual(['c', 'a'])
    })

    it('should handle deleting head', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.delete('b')
      expect(cache.keys()).toEqual(['a'])
    })

    it('should handle deleting tail', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.delete('a')
      expect(cache.keys()).toEqual(['b'])
    })

    it('should handle deleting only item', () => {
      cache.set('a', '1')
      cache.delete('a')
      expect(cache.size()).toBe(0)
      expect(cache.keys()).toEqual([])
    })
  })

  describe('peek', () => {
    it('should return undefined for missing key', () => {
      expect(cache.peek('missing')).toBeUndefined()
    })

    it('should return value without moving to front', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      expect(cache.peek('a')).toBe('1')
      expect(cache.keys()).toEqual(['b', 'a'])
    })

    it('should return value for existing key', () => {
      cache.set('a', 'value')
      expect(cache.peek('a')).toBe('value')
    })

    it('should not count as hit or miss', () => {
      cache.set('a', 'value')
      cache.peek('a')
      cache.peek('missing')
      expect(cache.getStats().hits).toBe(0)
      expect(cache.getStats().misses).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0)
    })

    it('should return correct size after sets', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      expect(cache.size()).toBe(2)
    })

    it('should return correct size after deletes', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.delete('a')
      expect(cache.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      cache.set('a', '1')
      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('should allow set after clear', () => {
      cache.set('a', '1')
      cache.clear()
      cache.set('b', '2')
      expect(cache.get('b')).toBe('2')
    })

    it('should handle clearing empty cache', () => {
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('should not reset stats counters', () => {
      cache.set('a', '1')
      cache.get('a')
      cache.clear()
      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.keys()).toEqual([])
    })

    it('should return keys in LRU order', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      expect(cache.keys()).toEqual(['c', 'b', 'a'])
    })

    it('should update order after get', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.get('a')
      expect(cache.keys()).toEqual(['a', 'b'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.values()).toEqual([])
    })

    it('should return values in LRU order', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      expect(cache.values()).toEqual(['3', '2', '1'])
    })

    it('should update order after get', () => {
      cache.set('a', 'val-a')
      cache.set('b', 'val-b')
      cache.get('a')
      expect(cache.values()).toEqual(['val-a', 'val-b'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty cache', () => {
      expect(cache.entries()).toEqual([])
    })

    it('should return entries in LRU order', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      expect(cache.entries()).toEqual([['b', '2'], ['a', '1']])
    })

    it('should update order after get', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.get('a')
      expect(cache.entries()).toEqual([['a', '1'], ['b', '2']])
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty cache', () => {
      const stats = cache.getStats()
      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(100)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('should track hits', () => {
      cache.set('a', '1')
      cache.get('a')
      cache.get('a')
      expect(cache.getStats().hits).toBe(2)
    })

    it('should track misses', () => {
      cache.get('missing')
      cache.get('also-missing')
      expect(cache.getStats().misses).toBe(2)
    })

    it('should calculate hit rate', () => {
      cache.set('a', '1')
      cache.get('a')
      cache.get('a')
      cache.get('missing')
      expect(cache.getStats().hitRate).toBeCloseTo(2 / 3)
    })

    it('should return 0 hit rate with no operations', () => {
      expect(cache.getStats().hitRate).toBe(0)
    })

    it('should track evictions', () => {
      const c = new LRUCache<string>({ maxSize: 2 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      expect(c.getStats().evictions).toBe(1)
    })

    it('should reflect current size', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      expect(cache.getStats().size).toBe(2)
    })

    it('should reflect custom maxSize', () => {
      const c = new LRUCache<string>({ maxSize: 10 })
      expect(c.getStats().maxSize).toBe(10)
    })
  })

  describe('resize', () => {
    it('should change maxSize', () => {
      cache.resize(50)
      expect(cache.getStats().maxSize).toBe(50)
    })

    it('should evict items when shrinking below current size', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      cache.resize(1)
      expect(cache.size()).toBe(1)
      expect(cache.has('c')).toBe(true)
    })

    it('should allow more items when growing', () => {
      const c = new LRUCache<string>({ maxSize: 2 })
      c.set('a', '1')
      c.set('b', '2')
      c.resize(5)
      c.set('c', '3')
      c.set('d', '4')
      expect(c.size()).toBe(4)
    })

    it('should track evictions when shrinking', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      cache.resize(1)
      expect(cache.getStats().evictions).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty cache', () => {
      const items: string[] = []
      cache.forEach((value) => items.push(value))
      expect(items).toEqual([])
    })

    it('should iterate over all items', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      const items: [string, string][] = []
      cache.forEach((value, key) => items.push([key, value]))
      expect(items).toEqual([['b', '2'], ['a', '1']])
    })

    it('should iterate in LRU order', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.get('a')
      const items: string[] = []
      cache.forEach((value) => items.push(value))
      expect(items).toEqual(['1', '2'])
    })

    it('should skip expired items', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 100 })
      c.set('a', '1')
      c.set('b', '2')
      vi.advanceTimersByTime(101)
      const items: string[] = []
      c.forEach((value) => items.push(value))
      expect(items).toEqual([])
      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle empty cache operations', () => {
      expect(cache.get('a')).toBeUndefined()
      expect(cache.delete('a')).toBe(false)
      expect(cache.peek('a')).toBeUndefined()
      expect(cache.has('a')).toBe(false)
    })

    it('should handle single item', () => {
      cache.set('only', 'value')
      expect(cache.get('only')).toBe('value')
      expect(cache.has('only')).toBe(true)
      expect(cache.size()).toBe(1)
      expect(cache.keys()).toEqual(['only'])
    })

    it('should handle capacity of 1', () => {
      const c = new LRUCache<string>({ maxSize: 1 })
      c.set('a', '1')
      c.set('b', '2')
      expect(c.has('a')).toBe(false)
      expect(c.get('b')).toBe('2')
      expect(c.size()).toBe(1)
    })

    it('should handle TTL of 0', () => {
      const c = new LRUCache<string>({ ttlMs: 0 })
      c.set('a', 'value')
      expect(c.get('a')).toBe('value')
    })

    it('should handle overwriting existing key with fresh TTL', () => {
      vi.useFakeTimers()
      const c = new LRUCache<string>({ ttlMs: 200 })
      c.set('a', 'old')
      vi.advanceTimersByTime(150)
      c.set('a', 'new')
      vi.advanceTimersByTime(150)
      expect(c.get('a')).toBe('new')
      vi.useRealTimers()
    })

    it('should handle numeric values', () => {
      const c = new LRUCache<number>()
      c.set('a', 42)
      expect(c.get('a')).toBe(42)
    })

    it('should handle object values', () => {
      const c = new LRUCache<{ id: number }>()
      const obj = { id: 1 }
      c.set('a', obj)
      expect(c.get('a')?.id).toBe(1)
    })

    it('should handle null values', () => {
      const c = new LRUCache<string | null>()
      c.set('a', null)
      expect(c.get('a')).toBeNull()
    })

    it('should handle many items', () => {
      const c = new LRUCache<string>({ maxSize: 100 })
      for (let i = 0; i < 100; i++) {
        c.set(`key-${i}`, `val-${i}`)
      }
      expect(c.size()).toBe(100)
      expect(c.get('key-0')).toBe('val-0')
    })

    it('should handle multiple get operations on same key', () => {
      cache.set('a', 'value')
      cache.get('a')
      cache.get('a')
      cache.get('a')
      expect(cache.getStats().hits).toBe(3)
    })

    it('should handle get after delete', () => {
      cache.set('a', 'value')
      cache.delete('a')
      expect(cache.get('a')).toBeUndefined()
    })

    it('should handle set-delete-set cycle', () => {
      cache.set('a', '1')
      cache.delete('a')
      cache.set('a', '2')
      expect(cache.get('a')).toBe('2')
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_LRU_CACHE_OPTIONS', () => {
      expect(DEFAULT_LRU_CACHE_OPTIONS.maxSize).toBe(100)
      expect(DEFAULT_LRU_CACHE_OPTIONS.ttlMs).toBe(0)
    })

    it('should re-export types from lru-cache module', () => {
      const node: LRUNode<string> = {
        key: 'test',
        value: 'value',
        createdAt: Date.now(),
      }
      expect(node.key).toBe('test')

      const opts: LRUCacheOptions = {
        maxSize: 50,
        ttlMs: 1000,
      }
      expect(opts.maxSize).toBe(50)

      const stats: LRUCacheStats = {
        size: 0,
        maxSize: 50,
        hits: 0,
        misses: 0,
        hitRate: 0,
        evictions: 0,
      }
      expect(stats.size).toBe(0)
    })

    it('should allow creating LRUNode with different types', () => {
      const numNode: LRUNode<number> = {
        key: 'num',
        value: 42,
        createdAt: Date.now(),
      }
      expect(numNode.value).toBe(42)
    })

    it('should support LRUCacheOptions type values', () => {
      const opts: LRUCacheOptions = {
        maxSize: 200,
        ttlMs: 5000,
      }
      expect(opts.maxSize).toBe(200)
      expect(opts.ttlMs).toBe(5000)
    })
  })

  describe('statistics tracking', () => {
    it('should track hits and misses correctly', () => {
      cache.set('a', '1')
      cache.get('a')
      cache.get('a')
      cache.get('missing')
      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('should track evictions across multiple operations', () => {
      const c = new LRUCache<string>({ maxSize: 2 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      c.set('d', '4')
      expect(c.getStats().evictions).toBe(2)
    })

    it('should maintain stats across clear', () => {
      cache.set('a', '1')
      cache.get('a')
      cache.clear()
      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.size).toBe(0)
    })

    it('should track 100% hit rate', () => {
      cache.set('a', '1')
      cache.get('a')
      expect(cache.getStats().hitRate).toBe(1)
    })

    it('should track 0% hit rate after only misses', () => {
      cache.get('missing')
      expect(cache.getStats().hitRate).toBe(0)
    })
  })

  describe('linked list integrity', () => {
    it('should maintain correct order after multiple operations', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.set('c', '3')
      cache.get('a')
      cache.delete('b')
      expect(cache.keys()).toEqual(['a', 'c'])
    })

    it('should handle delete and reinsert', () => {
      cache.set('a', '1')
      cache.set('b', '2')
      cache.delete('a')
      cache.set('a', '3')
      expect(cache.keys()).toEqual(['a', 'b'])
    })

    it('should handle eviction after get reorder', () => {
      const c = new LRUCache<string>({ maxSize: 3 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      c.get('a')
      c.set('d', '4')
      expect(c.has('b')).toBe(false)
      expect(c.keys()).toEqual(['d', 'a', 'c'])
    })

    it('should maintain correct entries after complex operations', () => {
      const c = new LRUCache<string>({ maxSize: 3 })
      c.set('a', '1')
      c.set('b', '2')
      c.set('c', '3')
      c.get('a')
      c.set('d', '4')
      c.delete('a')
      c.set('e', '5')
      expect(c.entries()).toEqual([['e', '5'], ['d', '4'], ['c', '3']])
    })
  })
})
