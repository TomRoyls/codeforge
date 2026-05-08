import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CacheStore } from '../../src/core/cache-manager/cache-store.js'
import { TTLCache } from '../../src/core/cache-manager/ttl-cache.js'
import { CacheManager } from '../../src/core/cache-manager/cache-manager.js'
import { DEFAULT_CACHE_CONFIG } from '../../src/core/cache-manager/types.js'

describe('CacheStore', () => {
  let store: CacheStore

  beforeEach(() => {
    store = new CacheStore()
  })

  describe('set', () => {
    it('should store a value by key', () => {
      store.set('key1', 'value1')
      expect(store.get('key1')).toBe('value1')
    })

    it('should overwrite an existing key', () => {
      store.set('key1', 'value1')
      store.set('key1', 'value2')
      expect(store.get('key1')).toBe('value2')
    })

    it('should track custom size', () => {
      store.set('key1', 'value1', 50)
      expect(store.size()).toBe(50)
    })

    it('should update size when overwriting', () => {
      store.set('key1', 'value1', 10)
      store.set('key1', 'value2', 20)
      expect(store.size()).toBe(20)
    })

    it('should handle multiple keys', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.set('c', 3)
      expect(store.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should store different value types', () => {
      store.set('str', 'hello')
      store.set('num', 42)
      store.set('obj', { foo: 'bar' })
      store.set('arr', [1, 2, 3])
      store.set('null', null)
      store.set('bool', true)
      expect(store.get('str')).toBe('hello')
      expect(store.get('num')).toBe(42)
      expect(store.get('obj')).toEqual({ foo: 'bar' })
      expect(store.get('arr')).toEqual([1, 2, 3])
      expect(store.get('null')).toBeNull()
      expect(store.get('bool')).toBe(true)
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(store.get('nonexistent')).toBeUndefined()
    })

    it('should return stored value', () => {
      store.set('key1', 'value1')
      expect(store.get('key1')).toBe('value1')
    })

    it('should update access order on get', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.get('a')
      expect(store.evict()).toBe('b')
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(store.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      store.set('key1', 'value1')
      expect(store.has('key1')).toBe(true)
    })

    it('should return false after delete', () => {
      store.set('key1', 'value1')
      store.delete('key1')
      expect(store.has('key1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(store.delete('missing')).toBe(false)
    })

    it('should remove entry and return true', () => {
      store.set('key1', 'value1')
      expect(store.delete('key1')).toBe(true)
      expect(store.has('key1')).toBe(false)
    })

    it('should reduce total size', () => {
      store.set('key1', 'value1', 100)
      store.delete('key1')
      expect(store.size()).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.set('c', 3)
      store.clear()
      expect(store.keys()).toEqual([])
      expect(store.size()).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for empty store', () => {
      expect(store.size()).toBe(0)
    })

    it('should return total size of entries', () => {
      store.set('a', 1, 10)
      store.set('b', 2, 20)
      expect(store.size()).toBe(30)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty store', () => {
      expect(store.keys()).toEqual([])
    })

    it('should return all keys', () => {
      store.set('x', 1)
      store.set('y', 2)
      expect(store.keys()).toEqual(['x', 'y'])
    })
  })

  describe('getStats', () => {
    it('should return empty stats', () => {
      expect(store.getStats()).toEqual({ entries: 0, totalSize: 0 })
    })

    it('should return correct stats', () => {
      store.set('a', 1, 5)
      store.set('b', 2, 10)
      expect(store.getStats()).toEqual({ entries: 2, totalSize: 15 })
    })
  })

  describe('evict', () => {
    it('should return null for empty store', () => {
      expect(store.evict()).toBeNull()
    })

    it('should evict least recently used entry', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.set('c', 3)
      expect(store.evict()).toBe('a')
      expect(store.has('a')).toBe(false)
      expect(store.has('b')).toBe(true)
    })

    it('should evict based on access order', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.get('a')
      expect(store.evict()).toBe('b')
    })

    it('should reduce total size on eviction', () => {
      store.set('a', 1, 50)
      store.evict()
      expect(store.size()).toBe(0)
    })

    it('should handle sequential evictions', () => {
      store.set('a', 1)
      store.set('b', 2)
      store.set('c', 3)
      store.evict()
      store.evict()
      expect(store.keys()).toEqual(['c'])
    })
  })
})

describe('TTLCache', () => {
  let cache: TTLCache

  beforeEach(() => {
    cache = new TTLCache()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('set', () => {
    it('should store a value', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should accept custom TTL', () => {
      cache.set('key1', 'value1', 5000)
      vi.advanceTimersByTime(4999)
      expect(cache.get('key1')).toBe('value1')
      vi.advanceTimersByTime(1)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should overwrite existing key', () => {
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should return value before expiry', () => {
      cache.set('key1', 'value1', 10000)
      vi.advanceTimersByTime(5000)
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return undefined after expiry', () => {
      cache.set('key1', 'value1', 1000)
      vi.advanceTimersByTime(1000)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should track hits and misses', () => {
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('missing')
      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(cache.has('missing')).toBe(false)
    })

    it('should return true for non-expired key', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('should return false for expired key', () => {
      cache.set('key1', 'value1', 1000)
      vi.advanceTimersByTime(1000)
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('should remove and return true', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all entries and reset stats', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.clear()
      expect(cache.getStats().entries).toBe(0)
      expect(cache.getStats().hits).toBe(0)
      expect(cache.getStats().misses).toBe(0)
    })
  })

  describe('getRemainingTTL', () => {
    it('should return 0 for missing key', () => {
      expect(cache.getRemainingTTL('missing')).toBe(0)
    })

    it('should return remaining time', () => {
      cache.set('key1', 'value1', 10000)
      vi.advanceTimersByTime(3000)
      const remaining = cache.getRemainingTTL('key1')
      expect(remaining).toBeGreaterThanOrEqual(6999)
      expect(remaining).toBeLessThanOrEqual(7001)
    })

    it('should return 0 for expired key', () => {
      cache.set('key1', 'value1', 1000)
      vi.advanceTimersByTime(1000)
      expect(cache.getRemainingTTL('key1')).toBe(0)
    })
  })

  describe('getExpiredKeys', () => {
    it('should return empty array when none expired', () => {
      cache.set('a', 1, 10000)
      cache.set('b', 2, 10000)
      expect(cache.getExpiredKeys()).toEqual([])
    })

    it('should return expired keys', () => {
      cache.set('a', 1, 1000)
      cache.set('b', 2, 10000)
      vi.advanceTimersByTime(1000)
      const expired = cache.getExpiredKeys()
      expect(expired).toContain('a')
      expect(expired).not.toContain('b')
    })

    it('should return all expired keys', () => {
      cache.set('a', 1, 1000)
      cache.set('b', 2, 2000)
      vi.advanceTimersByTime(2000)
      const expired = cache.getExpiredKeys()
      expect(expired).toContain('a')
      expect(expired).toContain('b')
    })
  })

  describe('cleanup', () => {
    it('should return 0 when nothing to clean', () => {
      cache.set('a', 1, 10000)
      expect(cache.cleanup()).toBe(0)
    })

    it('should remove expired entries and return count', () => {
      cache.set('a', 1, 1000)
      cache.set('b', 2, 10000)
      vi.advanceTimersByTime(1000)
      expect(cache.cleanup()).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    it('should track evictions', () => {
      cache.set('a', 1, 1000)
      vi.advanceTimersByTime(1000)
      cache.cleanup()
      expect(cache.getStats().evictions).toBe(1)
    })
  })

  describe('getStats', () => {
    it('should return initial stats', () => {
      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.entries).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('should calculate hit rate', () => {
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('key1')
      cache.get('missing')
      const stats = cache.getStats()
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })
  })
})

describe('CacheManager', () => {
  let manager: CacheManager

  beforeEach(() => {
    manager = new CacheManager({ maxEntries: 5, maxSize: 100, defaultTTL: 60000 })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const m = new CacheManager()
      expect(m.getConfig()).toEqual(DEFAULT_CACHE_CONFIG)
    })

    it('should merge partial config', () => {
      const m = new CacheManager({ maxEntries: 50 })
      const config = m.getConfig()
      expect(config.maxEntries).toBe(50)
      expect(config.maxSize).toBe(DEFAULT_CACHE_CONFIG.maxSize)
    })
  })

  describe('set', () => {
    it('should store a value', () => {
      manager.set('key1', 'value1')
      expect(manager.get('key1')).toBe('value1')
    })

    it('should store with custom TTL', () => {
      manager.set('key1', 'value1', { ttl: 1000 })
      vi.advanceTimersByTime(999)
      expect(manager.get('key1')).toBe('value1')
      vi.advanceTimersByTime(1)
      expect(manager.get('key1')).toBeUndefined()
    })

    it('should store with tags', () => {
      manager.set('key1', 'value1', { tags: ['tag1', 'tag2'] })
      expect(manager.invalidateByTag('tag1')).toBe(1)
      expect(manager.has('key1')).toBe(false)
    })

    it('should log set event', () => {
      manager.set('key1', 'value1')
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'set' && e.key === 'key1')).toBe(true)
    })

    it('should store with custom size', () => {
      manager.set('key1', 'value1', { size: 50 })
      expect(manager.getStats().size).toBe(50)
    })

    it('should store with metadata', () => {
      manager.set('key1', 'value1', { metadata: { source: 'test' } })
      expect(manager.has('key1')).toBe(true)
    })

    it('should overwrite existing key', () => {
      manager.set('key1', 'value1')
      manager.set('key1', 'value2')
      expect(manager.get('key1')).toBe('value2')
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(manager.get('missing')).toBeUndefined()
    })

    it('should return stored value', () => {
      manager.set('key1', 'value1')
      expect(manager.get('key1')).toBe('value1')
    })

    it('should return undefined for expired entry', () => {
      manager.set('key1', 'value1', { ttl: 1000 })
      vi.advanceTimersByTime(1000)
      expect(manager.get('key1')).toBeUndefined()
    })

    it('should track hits and misses', () => {
      manager.set('key1', 'value1')
      manager.get('key1')
      manager.get('missing')
      const stats = manager.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })

    it('should log hit event', () => {
      manager.set('key1', 'value1')
      manager.get('key1')
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'hit' && e.key === 'key1')).toBe(true)
    })

    it('should log miss event', () => {
      manager.get('missing')
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'miss' && e.key === 'missing')).toBe(true)
    })

    it('should log expire event on expired get', () => {
      manager.set('key1', 'value1', { ttl: 1000 })
      vi.advanceTimersByTime(1000)
      manager.get('key1')
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'expire' && e.key === 'key1')).toBe(true)
    })

    it('should count expired as miss', () => {
      manager.set('key1', 'value1', { ttl: 1000 })
      vi.advanceTimersByTime(1000)
      manager.get('key1')
      expect(manager.getStats().misses).toBe(1)
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(manager.has('missing')).toBe(false)
    })

    it('should return true for existing non-expired key', () => {
      manager.set('key1', 'value1')
      expect(manager.has('key1')).toBe(true)
    })

    it('should return false for expired key', () => {
      manager.set('key1', 'value1', { ttl: 1000 })
      vi.advanceTimersByTime(1000)
      expect(manager.has('key1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(manager.delete('missing')).toBe(false)
    })

    it('should remove entry and return true', () => {
      manager.set('key1', 'value1')
      expect(manager.delete('key1')).toBe(true)
      expect(manager.has('key1')).toBe(false)
    })

    it('should log delete event', () => {
      manager.set('key1', 'value1')
      manager.delete('key1')
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'delete' && e.key === 'key1')).toBe(true)
    })

    it('should reduce size', () => {
      manager.set('key1', 'value1', { size: 50 })
      manager.delete('key1')
      expect(manager.getStats().size).toBe(0)
    })
  })

  describe('invalidateByTag', () => {
    it('should return 0 when no matching tags', () => {
      manager.set('key1', 'value1', { tags: ['tag1'] })
      expect(manager.invalidateByTag('tag2')).toBe(0)
    })

    it('should remove all entries with matching tag', () => {
      manager.set('key1', 'value1', { tags: ['shared'] })
      manager.set('key2', 'value2', { tags: ['shared'] })
      manager.set('key3', 'value3', { tags: ['other'] })
      expect(manager.invalidateByTag('shared')).toBe(2)
      expect(manager.has('key1')).toBe(false)
      expect(manager.has('key2')).toBe(false)
      expect(manager.has('key3')).toBe(true)
    })

    it('should handle entries with multiple tags', () => {
      manager.set('key1', 'value1', { tags: ['tag1', 'tag2'] })
      expect(manager.invalidateByTag('tag1')).toBe(1)
      expect(manager.has('key1')).toBe(false)
    })
  })

  describe('invalidateByPrefix', () => {
    it('should return 0 when no matching prefix', () => {
      manager.set('key1', 'value1')
      expect(manager.invalidateByPrefix('abc')).toBe(0)
    })

    it('should remove all entries matching prefix', () => {
      manager.set('api:users', 'data1')
      manager.set('api:posts', 'data2')
      manager.set('cache:items', 'data3')
      expect(manager.invalidateByPrefix('api:')).toBe(2)
      expect(manager.has('api:users')).toBe(false)
      expect(manager.has('api:posts')).toBe(false)
      expect(manager.has('cache:items')).toBe(true)
    })

    it('should handle exact match prefix', () => {
      manager.set('key', 'value1')
      manager.set('key1', 'value2')
      manager.set('key2', 'value3')
      expect(manager.invalidateByPrefix('key')).toBe(3)
    })
  })

  describe('getStats', () => {
    it('should return initial stats', () => {
      const stats = manager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.entries).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('should calculate hit rate correctly', () => {
      manager.set('key1', 'value1')
      manager.get('key1')
      manager.get('key1')
      manager.get('missing')
      const stats = manager.getStats()
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('should track entry count', () => {
      manager.set('a', 1)
      manager.set('b', 2)
      manager.set('c', 3)
      expect(manager.getStats().entries).toBe(3)
    })

    it('should track total size', () => {
      manager.set('a', 1, { size: 10 })
      manager.set('b', 2, { size: 20 })
      expect(manager.getStats().size).toBe(30)
    })
  })

  describe('getEventLog', () => {
    it('should return empty log initially', () => {
      expect(manager.getEventLog()).toEqual([])
    })

    it('should track all events', () => {
      manager.set('key1', 'value1')
      manager.get('key1')
      manager.get('missing')
      manager.delete('key1')
      const log = manager.getEventLog()
      expect(log.length).toBe(4)
      expect(log[0]!.type).toBe('set')
      expect(log[1]!.type).toBe('hit')
      expect(log[2]!.type).toBe('miss')
      expect(log[3]!.type).toBe('delete')
    })

    it('should include timestamps', () => {
      const before = Date.now()
      manager.set('key1', 'value1')
      const events = manager.getEventLog()
      expect(events[0]!.timestamp).toBeGreaterThanOrEqual(before)
    })

    it('should return a copy of the log', () => {
      manager.set('key1', 'value1')
      const log1 = manager.getEventLog()
      const log2 = manager.getEventLog()
      expect(log1).not.toBe(log2)
      expect(log1).toEqual(log2)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      manager.set('a', 1)
      manager.set('b', 2)
      manager.clear()
      expect(manager.getStats().entries).toBe(0)
      expect(manager.getStats().size).toBe(0)
    })

    it('should log clear event', () => {
      manager.clear()
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'clear')).toBe(true)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const config1 = manager.getConfig()
      const config2 = manager.getConfig()
      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })

    it('should return merged config', () => {
      const config = manager.getConfig()
      expect(config.maxEntries).toBe(5)
      expect(config.maxSize).toBe(100)
      expect(config.defaultTTL).toBe(60000)
    })
  })

  describe('eviction', () => {
    it('should evict LRU when maxEntries exceeded', () => {
      for (let i = 0; i < 6; i++) {
        manager.set(`key${i}`, `value${i}`)
      }
      expect(manager.getStats().entries).toBe(5)
      expect(manager.has('key0')).toBe(false)
      expect(manager.has('key5')).toBe(true)
    })

    it('should track evictions in stats', () => {
      for (let i = 0; i < 6; i++) {
        manager.set(`key${i}`, `value${i}`)
      }
      expect(manager.getStats().evictions).toBeGreaterThan(0)
    })

    it('should evict based on access order for LRU', () => {
      manager.set('a', 1)
      manager.set('b', 2)
      manager.set('c', 3)
      manager.set('d', 4)
      manager.set('e', 5)
      manager.get('a')
      manager.set('f', 6)
      expect(manager.has('a')).toBe(true)
      expect(manager.has('b')).toBe(false)
    })

    it('should log eviction events', () => {
      for (let i = 0; i < 6; i++) {
        manager.set(`key${i}`, `value${i}`)
      }
      const events = manager.getEventLog()
      expect(events.some(e => e.type === 'evict')).toBe(true)
    })

    it('should evict when maxSize exceeded', () => {
      const m = new CacheManager({ maxEntries: 100, maxSize: 10 })
      for (let i = 0; i < 5; i++) {
        m.set(`key${i}`, `value${i}`, { size: 3 })
      }
      expect(m.getStats().size).toBeLessThanOrEqual(10)
    })
  })

  describe('FIFO eviction', () => {
    it('should evict first inserted entry', () => {
      const m = new CacheManager({ maxEntries: 3, maxSize: 1000, defaultTTL: 60000, evictionPolicy: 'fifo' })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.get('a')
      m.set('d', 4)
      expect(m.has('a')).toBe(false)
      expect(m.has('b')).toBe(true)
    })
  })

  describe('LFU eviction (fallback)', () => {
    it('should evict least frequently accessed', () => {
      const m = new CacheManager({ maxEntries: 3, maxSize: 1000, defaultTTL: 0, evictionPolicy: 'lfu' })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.get('a')
      m.get('b')
      m.set('d', 4)
      expect(m.has('c')).toBe(false)
    })
  })

  describe('TTL expiry', () => {
    it('should expire entries based on TTL', () => {
      manager.set('key1', 'value1', { ttl: 5000 })
      vi.advanceTimersByTime(5000)
      expect(manager.get('key1')).toBeUndefined()
    })

    it('should not expire entries with TTL of 0', () => {
      manager.set('key1', 'value1', { ttl: 0 })
      vi.advanceTimersByTime(999999)
      expect(manager.get('key1')).toBe('value1')
    })

    it('should use default TTL when not specified', () => {
      const m = new CacheManager({ maxEntries: 100, maxSize: 1000, defaultTTL: 1000 })
      vi.useFakeTimers()
      m.set('key1', 'value1')
      vi.advanceTimersByTime(999)
      expect(m.get('key1')).toBe('value1')
      vi.advanceTimersByTime(1)
      expect(m.get('key1')).toBeUndefined()
      vi.useRealTimers()
    })
  })

  describe('complex scenarios', () => {
    it('should handle rapid set/get/delete cycle', () => {
      for (let i = 0; i < 100; i++) {
        manager.set(`key${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          manager.delete(`key${i}`)
        }
      }
      expect(manager.getStats().entries).toBeLessThanOrEqual(5)
    })

    it('should handle tag invalidation combined with prefix invalidation', () => {
      manager.set('api:users', 'data1', { tags: ['api'] })
      manager.set('api:posts', 'data2', { tags: ['api'] })
      manager.set('cache:users', 'data3', { tags: ['cache'] })
      manager.invalidateByPrefix('api:')
      expect(manager.has('cache:users')).toBe(true)
      expect(manager.getStats().entries).toBe(1)
    })

    it('should handle size-based eviction with tags', () => {
      const m = new CacheManager({ maxEntries: 100, maxSize: 20, defaultTTL: 60000 })
      m.set('a', 1, { size: 10, tags: ['group1'] })
      m.set('b', 2, { size: 10, tags: ['group1'] })
      m.set('c', 3, { size: 10, tags: ['group2'] })
      expect(m.getStats().size).toBeLessThanOrEqual(20)
      expect(m.getStats().evictions).toBeGreaterThan(0)
    })
  })
})

describe('DEFAULT_CACHE_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_CACHE_CONFIG.maxSize).toBe(1024 * 1024 * 100)
    expect(DEFAULT_CACHE_CONFIG.maxEntries).toBe(1000)
    expect(DEFAULT_CACHE_CONFIG.defaultTTL).toBe(60000)
    expect(DEFAULT_CACHE_CONFIG.evictionPolicy).toBe('lru')
  })
})
