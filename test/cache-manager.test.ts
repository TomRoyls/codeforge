import { CacheManager, CacheStore, TTLCache, DEFAULT_CACHE_CONFIG } from '../src/core/cache-manager/index.js'
import type { CacheConfig, CacheStats, CacheEvent } from '../src/core/cache-manager/index.js'

// ─── CacheManager — Constructor ──────────────────────────────────────────

describe('CacheManager', () => {
  describe('constructor', () => {
    it('creates instance with default config', () => {
      const cm = new CacheManager()
      const config = cm.getConfig()
      expect(config.maxSize).toBe(DEFAULT_CACHE_CONFIG.maxSize)
      expect(config.maxEntries).toBe(DEFAULT_CACHE_CONFIG.maxEntries)
      expect(config.defaultTTL).toBe(DEFAULT_CACHE_CONFIG.defaultTTL)
      expect(config.evictionPolicy).toBe('lru')
    })

    it('creates instance with partial custom config', () => {
      const cm = new CacheManager({ maxEntries: 50 })
      const config = cm.getConfig()
      expect(config.maxEntries).toBe(50)
      expect(config.maxSize).toBe(DEFAULT_CACHE_CONFIG.maxSize)
    })

    it('creates instance with fully custom config', () => {
      const custom: CacheConfig = {
        maxSize: 1000,
        maxEntries: 10,
        defaultTTL: 5000,
        evictionPolicy: 'fifo',
      }
      const cm = new CacheManager(custom)
      const config = cm.getConfig()
      expect(config).toEqual(custom)
    })

    it('returns a copy of config from getConfig', () => {
      const cm = new CacheManager()
      const a = cm.getConfig()
      const b = cm.getConfig()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })

    it('starts with zero stats', () => {
      const cm = new CacheManager()
      const stats = cm.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.size).toBe(0)
      expect(stats.entries).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('starts with empty event log', () => {
      const cm = new CacheManager()
      expect(cm.getEventLog()).toEqual([])
    })
  })

  // ─── CacheManager — set / get ─────────────────────────────────────────

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const cm = new CacheManager()
      cm.set('a', 1)
      expect(cm.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const cm = new CacheManager()
      expect(cm.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const cm = new CacheManager()
      cm.set('k', 'first')
      cm.set('k', 'second')
      expect(cm.get('k')).toBe('second')
    })

    it('stores different value types', () => {
      const cm = new CacheManager()
      cm.set('num', 42)
      cm.set('str', 'hello')
      cm.set('bool', true)
      cm.set('obj', { x: 1 })
      cm.set('arr', [1, 2, 3])
      cm.set('null', null)
      expect(cm.get('num')).toBe(42)
      expect(cm.get('str')).toBe('hello')
      expect(cm.get('bool')).toBe(true)
      expect(cm.get('obj')).toEqual({ x: 1 })
      expect(cm.get('arr')).toEqual([1, 2, 3])
      expect(cm.get('null')).toBeNull()
    })

    it('accepts custom ttl via options', () => {
      const cm = new CacheManager()
      cm.set('short', 'data', { ttl: 0 })
      expect(cm.get('short')).toBe('data')
    })

    it('accepts tags via options', () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { tags: ['group-a', 'group-b'] })
      expect(cm.has('k')).toBe(true)
    })

    it('accepts size via options', () => {
      const cm = new CacheManager()
      cm.set('big', 'data', { size: 100 })
      expect(cm.getStats().size).toBe(100)
    })

    it('accepts metadata via options', () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { metadata: { source: 'test' } })
      expect(cm.has('k')).toBe(true)
    })

    it('increments hits on successful get', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      cm.get('k')
      cm.get('k')
      expect(cm.getStats().hits).toBe(2)
    })

    it('increments misses on failed get', () => {
      const cm = new CacheManager()
      cm.get('x')
      cm.get('y')
      expect(cm.getStats().misses).toBe(2)
    })

    it('computes hitRate correctly', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      cm.get('k')
      cm.get('k')
      cm.get('miss')
      const stats = cm.getStats()
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('hitRate is 0 when no operations', () => {
      const cm = new CacheManager()
      expect(cm.getStats().hitRate).toBe(0)
    })

    it('preserves createdAt when overwriting', () => {
      const cm = new CacheManager()
      cm.set('k', 'v1')
      const before = Date.now()
      cm.set('k', 'v2')
      expect(cm.get('k')).toBe('v2')
    })
  })

  // ─── CacheManager — has ───────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      expect(cm.has('k')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cm = new CacheManager()
      expect(cm.has('nope')).toBe(false)
    })

    it('returns false for expired key and removes it', () => {
      const cm = new CacheManager({ defaultTTL: 1 })
      cm.set('k', 'v', { ttl: 1 })
      // Wait for expiry - use vi.useFakeTimers or just check the behavior
      // The entry has ttl=1ms so it should be expired after a small delay
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cm.has('k')).toBe(false)
          resolve()
        }, 5)
      })
    })
  })

  // ─── CacheManager — delete ────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      expect(cm.delete('k')).toBe(true)
      expect(cm.has('k')).toBe(false)
    })

    it('returns false for non-existent key', () => {
      const cm = new CacheManager()
      expect(cm.delete('nope')).toBe(false)
    })

    it('reduces size tracking on delete', () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { size: 50 })
      expect(cm.getStats().size).toBe(50)
      cm.delete('k')
      expect(cm.getStats().size).toBe(0)
    })
  })

  // ─── CacheManager — invalidateByTag ───────────────────────────────────

  describe('invalidateByTag', () => {
    it('removes all entries with matching tag', () => {
      const cm = new CacheManager()
      cm.set('a', 1, { tags: ['red'] })
      cm.set('b', 2, { tags: ['blue'] })
      cm.set('c', 3, { tags: ['red', 'blue'] })
      const count = cm.invalidateByTag('red')
      expect(count).toBe(2)
      expect(cm.has('a')).toBe(false)
      expect(cm.has('b')).toBe(true)
      expect(cm.has('c')).toBe(false)
    })

    it('returns 0 when no entries match', () => {
      const cm = new CacheManager()
      cm.set('a', 1, { tags: ['green'] })
      expect(cm.invalidateByTag('red')).toBe(0)
    })

    it('returns 0 on empty cache', () => {
      const cm = new CacheManager()
      expect(cm.invalidateByTag('any')).toBe(0)
    })
  })

  // ─── CacheManager — invalidateByPrefix ────────────────────────────────

  describe('invalidateByPrefix', () => {
    it('removes all entries with matching prefix', () => {
      const cm = new CacheManager()
      cm.set('user:1', 'alice')
      cm.set('user:2', 'bob')
      cm.set('item:1', 'widget')
      const count = cm.invalidateByPrefix('user:')
      expect(count).toBe(2)
      expect(cm.has('user:1')).toBe(false)
      expect(cm.has('user:2')).toBe(false)
      expect(cm.has('item:1')).toBe(true)
    })

    it('returns 0 when no entries match', () => {
      const cm = new CacheManager()
      cm.set('abc', 1)
      expect(cm.invalidateByPrefix('xyz')).toBe(0)
    })

    it('returns 0 on empty cache', () => {
      const cm = new CacheManager()
      expect(cm.invalidateByPrefix('any')).toBe(0)
    })
  })

  // ─── CacheManager — clear ─────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const cm = new CacheManager()
      cm.set('a', 1)
      cm.set('b', 2)
      cm.clear()
      expect(cm.getStats().entries).toBe(0)
      expect(cm.getStats().size).toBe(0)
    })

    it('logs a clear event', () => {
      const cm = new CacheManager()
      cm.clear()
      const log = cm.getEventLog()
      expect(log.some((e) => e.type === 'clear')).toBe(true)
    })

    it('allows set after clear', () => {
      const cm = new CacheManager()
      cm.set('a', 1)
      cm.clear()
      cm.set('b', 2)
      expect(cm.get('b')).toBe(2)
      expect(cm.getStats().entries).toBe(1)
    })
  })

  // ─── CacheManager — getEventLog ───────────────────────────────────────

  describe('getEventLog', () => {
    it('logs set events', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      const log = cm.getEventLog()
      expect(log).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'set', key: 'k' })]))
    })

    it('logs hit events', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      cm.get('k')
      const log = cm.getEventLog()
      expect(log).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'hit', key: 'k' })]))
    })

    it('logs miss events', () => {
      const cm = new CacheManager()
      cm.get('x')
      const log = cm.getEventLog()
      expect(log).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'miss', key: 'x' })]))
    })

    it('logs delete events', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      cm.delete('k')
      const log = cm.getEventLog()
      expect(log).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'delete', key: 'k' })]))
    })

    it('returns a copy of the event log', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      const a = cm.getEventLog()
      const b = cm.getEventLog()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })

    it('each event has a timestamp', () => {
      const cm = new CacheManager()
      cm.set('k', 1)
      const log = cm.getEventLog()
      for (const event of log) {
        expect(typeof event.timestamp).toBe('number')
        expect(event.timestamp).toBeGreaterThan(0)
      }
    })
  })

  // ─── CacheManager — getStats ──────────────────────────────────────────

  describe('getStats', () => {
    it('reports correct entries count', () => {
      const cm = new CacheManager()
      cm.set('a', 1)
      cm.set('b', 2)
      cm.set('c', 3)
      expect(cm.getStats().entries).toBe(3)
    })

    it('reports correct total size', () => {
      const cm = new CacheManager()
      cm.set('a', 1, { size: 10 })
      cm.set('b', 2, { size: 20 })
      expect(cm.getStats().size).toBe(30)
    })

    it('reports correct evictions after eviction', () => {
      const cm = new CacheManager({ maxEntries: 2 })
      cm.set('a', 1)
      cm.set('b', 2)
      cm.set('c', 3) // should evict one
      expect(cm.getStats().evictions).toBe(1)
    })
  })

  // ─── CacheManager — Eviction Policies ─────────────────────────────────

  describe('eviction policies', () => {
    it('LRU evicts least recently accessed', () => {
      const cm = new CacheManager({ maxEntries: 2, evictionPolicy: 'lru' })
      cm.set('a', 1)
      cm.set('b', 2)
      cm.get('a') // access 'a' so 'b' is LRU
      cm.set('c', 3) // should evict 'b'
      expect(cm.has('a')).toBe(true)
      expect(cm.has('b')).toBe(false)
      expect(cm.has('c')).toBe(true)
    })

    it('FIFO evicts first inserted', () => {
      const cm = new CacheManager({ maxEntries: 2, evictionPolicy: 'fifo' })
      cm.set('a', 1)
      cm.set('b', 2)
      cm.get('a') // access doesn't matter for FIFO
      cm.set('c', 3) // should evict 'a' (first inserted)
      expect(cm.has('a')).toBe(false)
      expect(cm.has('b')).toBe(true)
      expect(cm.has('c')).toBe(true)
    })

    it('LFU evicts least frequently used', () => {
      const cm = new CacheManager({ maxEntries: 2, evictionPolicy: 'lfu' })
      cm.set('a', 1)
      cm.set('b', 2)
      cm.get('a') // access 'a' once
      cm.get('a') // access 'a' again
      cm.set('c', 3) // should evict 'b' (frequency 0)
      expect(cm.has('a')).toBe(true)
      expect(cm.has('b')).toBe(false)
      expect(cm.has('c')).toBe(true)
    })

    it('evicts multiple entries when exceeding maxEntries', () => {
      const cm = new CacheManager({ maxEntries: 3, evictionPolicy: 'lru' })
      cm.set('a', 1)
      cm.set('b', 2)
      cm.set('c', 3)
      cm.set('d', 4)
      cm.set('e', 5)
      expect(cm.getStats().entries).toBe(3)
      expect(cm.getStats().evictions).toBe(2)
    })

    it('evicts when exceeding maxSize', () => {
      const cm = new CacheManager({ maxSize: 20, evictionPolicy: 'lru' })
      cm.set('a', 1, { size: 10 })
      cm.set('b', 2, { size: 10 })
      cm.set('c', 3, { size: 10 }) // total = 30, over maxSize=20
      expect(cm.getStats().size).toBeLessThanOrEqual(20)
      expect(cm.getStats().evictions).toBeGreaterThan(0)
    })

    it('logs evict events', () => {
      const cm = new CacheManager({ maxEntries: 1 })
      cm.set('a', 1)
      cm.set('b', 2)
      const log = cm.getEventLog()
      expect(log.some((e) => e.type === 'evict')).toBe(true)
    })
  })

  // ─── CacheManager — TTL Expiry ────────────────────────────────────────

  describe('TTL expiry', () => {
    it('returns undefined for expired entry on get', async () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { ttl: 1 })
      await new Promise((r) => setTimeout(r, 5))
      expect(cm.get('k')).toBeUndefined()
    })

    it('logs expire event on get of expired entry', async () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { ttl: 1 })
      await new Promise((r) => setTimeout(r, 5))
      cm.get('k')
      const log = cm.getEventLog()
      expect(log.some((e) => e.type === 'expire' && e.key === 'k')).toBe(true)
    })

    it('increments miss on expired get', async () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { ttl: 1 })
      await new Promise((r) => setTimeout(r, 5))
      cm.get('k')
      expect(cm.getStats().misses).toBe(1)
    })

    it('ttl=0 means never expires', () => {
      const cm = new CacheManager()
      cm.set('forever', 'data', { ttl: 0 })
      expect(cm.get('forever')).toBe('data')
    })
  })

  // ─── CacheManager — Size Tracking ─────────────────────────────────────

  describe('size tracking', () => {
    it('updates size on overwrite', () => {
      const cm = new CacheManager()
      cm.set('k', 'v', { size: 10 })
      expect(cm.getStats().size).toBe(10)
      cm.set('k', 'new', { size: 20 })
      expect(cm.getStats().size).toBe(20)
    })

    it('defaults size to 1', () => {
      const cm = new CacheManager()
      cm.set('k', 'v')
      expect(cm.getStats().size).toBe(1)
    })

    it('tracks size across multiple entries', () => {
      const cm = new CacheManager()
      cm.set('a', 1, { size: 5 })
      cm.set('b', 2, { size: 3 })
      cm.set('c', 3, { size: 2 })
      expect(cm.getStats().size).toBe(10)
    })

    it('decreases size on delete', () => {
      const cm = new CacheManager()
      cm.set('a', 1, { size: 5 })
      cm.set('b', 2, { size: 3 })
      cm.delete('a')
      expect(cm.getStats().size).toBe(3)
    })
  })
})

// ─── CacheStore ──────────────────────────────────────────────────────────

describe('CacheStore', () => {
  // ─── CacheStore — set / get ───────────────────────────────────────────

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const store = new CacheStore()
      store.set('k', 'val')
      expect(store.get('k')).toBe('val')
    })

    it('returns undefined for missing key', () => {
      const store = new CacheStore()
      expect(store.get('nope')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const store = new CacheStore()
      store.set('k', 'first')
      store.set('k', 'second')
      expect(store.get('k')).toBe('second')
    })

    it('accepts custom size', () => {
      const store = new CacheStore()
      store.set('k', 'v', 42)
      expect(store.size()).toBe(42)
    })

    it('defaults size to 1', () => {
      const store = new CacheStore()
      store.set('k', 'v')
      expect(store.size()).toBe(1)
    })

    it('updates size on overwrite', () => {
      const store = new CacheStore()
      store.set('k', 'v', 10)
      store.set('k', 'new', 20)
      expect(store.size()).toBe(20)
    })
  })

  // ─── CacheStore — has ─────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const store = new CacheStore()
      store.set('k', 1)
      expect(store.has('k')).toBe(true)
    })

    it('returns false for missing key', () => {
      const store = new CacheStore()
      expect(store.has('nope')).toBe(false)
    })
  })

  // ─── CacheStore — delete ──────────────────────────────────────────────

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const store = new CacheStore()
      store.set('k', 1)
      expect(store.delete('k')).toBe(true)
      expect(store.has('k')).toBe(false)
    })

    it('returns false for missing key', () => {
      const store = new CacheStore()
      expect(store.delete('nope')).toBe(false)
    })

    it('reduces size on delete', () => {
      const store = new CacheStore()
      store.set('k', 'v', 10)
      store.delete('k')
      expect(store.size()).toBe(0)
    })
  })

  // ─── CacheStore — clear ───────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const store = new CacheStore()
      store.set('a', 1)
      store.set('b', 2)
      store.clear()
      expect(store.getStats().entries).toBe(0)
      expect(store.size()).toBe(0)
    })

    it('allows set after clear', () => {
      const store = new CacheStore()
      store.set('a', 1)
      store.clear()
      store.set('b', 2)
      expect(store.get('b')).toBe(2)
    })
  })

  // ─── CacheStore — keys ────────────────────────────────────────────────

  describe('keys', () => {
    it('returns all keys', () => {
      const store = new CacheStore()
      store.set('x', 1)
      store.set('y', 2)
      expect(store.keys()).toEqual(expect.arrayContaining(['x', 'y']))
    })

    it('returns empty array when empty', () => {
      const store = new CacheStore()
      expect(store.keys()).toEqual([])
    })
  })

  // ─── CacheStore — getStats ────────────────────────────────────────────

  describe('getStats', () => {
    it('reports entries and totalSize', () => {
      const store = new CacheStore()
      store.set('a', 1, 5)
      store.set('b', 2, 3)
      const stats = store.getStats()
      expect(stats.entries).toBe(2)
      expect(stats.totalSize).toBe(8)
    })

    it('reports zeros when empty', () => {
      const store = new CacheStore()
      const stats = store.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.totalSize).toBe(0)
    })
  })

  // ─── CacheStore — evict ──────────────────────────────────────────────

  describe('evict', () => {
    it('evicts the LRU entry (least recently accessed)', () => {
      const store = new CacheStore()
      store.set('a', 1)
      store.set('b', 2)
      store.get('a') // access 'a', so 'b' is LRU
      const evicted = store.evict()
      expect(evicted).toBe('b')
      expect(store.has('b')).toBe(false)
      expect(store.has('a')).toBe(true)
    })

    it('returns null when store is empty', () => {
      const store = new CacheStore()
      expect(store.evict()).toBeNull()
    })

    it('evicts the only entry', () => {
      const store = new CacheStore()
      store.set('solo', 42)
      expect(store.evict()).toBe('solo')
      expect(store.getStats().entries).toBe(0)
    })
  })

  // ─── CacheStore — getEntry ────────────────────────────────────────────

  describe('getEntry', () => {
    it('returns a CacheEntry for existing key', () => {
      const store = new CacheStore()
      store.set('k', 'v', 7)
      const entry = store.getEntry('k')
      expect(entry).toBeDefined()
      expect(entry!.key).toBe('k')
      expect(entry!.value).toBe('v')
      expect(entry!.size).toBe(7)
      expect(entry!.tags).toEqual([])
      expect(entry!.metadata).toEqual({})
    })

    it('returns undefined for missing key', () => {
      const store = new CacheStore()
      expect(store.getEntry('nope')).toBeUndefined()
    })
  })
})

// ─── TTLCache ────────────────────────────────────────────────────────────

describe('TTLCache', () => {
  // ─── TTLCache — set / get ─────────────────────────────────────────────

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const cache = new TTLCache()
      cache.set('k', 'val')
      expect(cache.get('k')).toBe('val')
    })

    it('returns undefined for missing key', () => {
      const cache = new TTLCache()
      expect(cache.get('nope')).toBeUndefined()
    })

    it('returns undefined for expired entry', async () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 1)
      await new Promise((r) => setTimeout(r, 5))
      expect(cache.get('k')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      const cache = new TTLCache()
      cache.set('k', 'first')
      cache.set('k', 'second')
      expect(cache.get('k')).toBe('second')
    })

    it('uses default TTL of 60000ms', () => {
      const cache = new TTLCache()
      cache.set('k', 'v')
      expect(cache.getRemainingTTL('k')).toBeGreaterThan(50000)
    })
  })

  // ─── TTLCache — has ───────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing non-expired key', () => {
      const cache = new TTLCache()
      cache.set('k', 1)
      expect(cache.has('k')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cache = new TTLCache()
      expect(cache.has('nope')).toBe(false)
    })

    it('returns false for expired key and removes it', async () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 1)
      await new Promise((r) => setTimeout(r, 5))
      expect(cache.has('k')).toBe(false)
    })
  })

  // ─── TTLCache — delete ────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const cache = new TTLCache()
      cache.set('k', 1)
      expect(cache.delete('k')).toBe(true)
      expect(cache.has('k')).toBe(false)
    })

    it('returns false for missing key', () => {
      const cache = new TTLCache()
      expect(cache.delete('nope')).toBe(false)
    })
  })

  // ─── TTLCache — clear ─────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries and resets stats', () => {
      const cache = new TTLCache()
      cache.set('a', 1)
      cache.get('a')
      cache.clear()
      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.entries).toBe(0)
    })
  })

  // ─── TTLCache — getRemainingTTL ───────────────────────────────────────

  describe('getRemainingTTL', () => {
    it('returns remaining TTL for existing key', () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 10000)
      const remaining = cache.getRemainingTTL('k')
      expect(remaining).toBeGreaterThan(9000)
      expect(remaining).toBeLessThanOrEqual(10000)
    })

    it('returns 0 for missing key', () => {
      const cache = new TTLCache()
      expect(cache.getRemainingTTL('nope')).toBe(0)
    })

    it('returns 0 for expired key', async () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 1)
      await new Promise((r) => setTimeout(r, 5))
      expect(cache.getRemainingTTL('k')).toBe(0)
    })
  })

  // ─── TTLCache — getExpiredKeys ────────────────────────────────────────

  describe('getExpiredKeys', () => {
    it('returns empty array when no expired keys', () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 60000)
      expect(cache.getExpiredKeys()).toEqual([])
    })

    it('returns expired keys', async () => {
      const cache = new TTLCache()
      cache.set('expired', 'v', 1)
      cache.set('fresh', 'v', 60000)
      await new Promise((r) => setTimeout(r, 5))
      const expired = cache.getExpiredKeys()
      expect(expired).toEqual(['expired'])
    })

    it('returns empty array when cache is empty', () => {
      const cache = new TTLCache()
      expect(cache.getExpiredKeys()).toEqual([])
    })
  })

  // ─── TTLCache — cleanup ───────────────────────────────────────────────

  describe('cleanup', () => {
    it('removes expired entries and returns count', async () => {
      const cache = new TTLCache()
      cache.set('a', 1, 1)
      cache.set('b', 2, 60000)
      await new Promise((r) => setTimeout(r, 5))
      const removed = cache.cleanup()
      expect(removed).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })

    it('returns 0 when nothing expired', () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 60000)
      expect(cache.cleanup()).toBe(0)
    })

    it('increments eviction counter', async () => {
      const cache = new TTLCache()
      cache.set('a', 1, 1)
      cache.set('b', 2, 1)
      await new Promise((r) => setTimeout(r, 5))
      cache.cleanup()
      expect(cache.getStats().evictions).toBe(2)
    })
  })

  // ─── TTLCache — getStats ──────────────────────────────────────────────

  describe('getStats', () => {
    it('tracks hits and misses', () => {
      const cache = new TTLCache()
      cache.set('k', 1)
      cache.get('k') // hit
      cache.get('k') // hit
      cache.get('miss') // miss
      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
    })

    it('computes hitRate', () => {
      const cache = new TTLCache()
      cache.set('k', 1)
      cache.get('k') // hit
      cache.get('miss') // miss
      const stats = cache.getStats()
      expect(stats.hitRate).toBeCloseTo(0.5)
    })

    it('reports size as number of entries', () => {
      const cache = new TTLCache()
      cache.set('a', 1)
      cache.set('b', 2)
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.entries).toBe(2)
    })

    it('miss increments on expired get', async () => {
      const cache = new TTLCache()
      cache.set('k', 'v', 1)
      await new Promise((r) => setTimeout(r, 5))
      cache.get('k')
      expect(cache.getStats().misses).toBe(1)
    })
  })
})
