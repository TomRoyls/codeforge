import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CloudCacheClient } from '../../src/core/cloud-cache/cloud-cache-client.js'
import type { CloudCacheConfig, CacheEntry, CacheLookupResult } from '../../src/core/cloud-cache/types.js'
import { DEFAULT_CLOUD_CACHE_CONFIG } from '../../src/core/cloud-cache/types.js'

describe('CloudCacheClient', () => {
  let client: CloudCacheClient

  beforeEach(() => {
    client = new CloudCacheClient()
  })

  describe('constructor', () => {
    it('should create client with default config', () => {
      const c = new CloudCacheClient()
      expect(c).toBeInstanceOf(CloudCacheClient)
    })

    it('should merge partial config with defaults', () => {
      const c = new CloudCacheClient({ region: 'eu-west-1' })
      const stats = c.getStats()
      expect(stats.size).toBe(0)
    })

    it('should accept empty config', () => {
      const c = new CloudCacheClient({})
      expect(c).toBeInstanceOf(CloudCacheClient)
    })
  })

  describe('set', () => {
    it('should store a value and return true', async () => {
      const result = await client.set('key1', { data: 'test' })
      expect(result).toBe(true)
    })

    it('should store value with custom TTL', async () => {
      const result = await client.set('key1', 'value', { ttl: 60000 })
      expect(result).toBe(true)
    })

    it('should store value with tags', async () => {
      const result = await client.set('key1', 'value', { tags: ['tag1', 'tag2'] })
      expect(result).toBe(true)
    })

    it('should store value with metadata', async () => {
      const result = await client.set('key1', 'value', { metadata: { source: 'test' } })
      expect(result).toBe(true)
    })

    it('should reject entries exceeding maxEntrySize', async () => {
      const small = new CloudCacheClient({ maxEntrySize: 10 })
      const result = await small.set('key1', 'a very long string that exceeds 10 bytes')
      expect(result).toBe(false)
    })

    it('should overwrite existing key', async () => {
      await client.set('key1', 'value1')
      await client.set('key1', 'value2')
      const lookup = await client.get<string>('key1')
      expect(lookup.found).toBe(true)
      expect(lookup.entry?.value).toBe('value2')
    })

    it('should increment stores stat', async () => {
      await client.set('key1', 'value')
      const stats = client.getStats()
      expect(stats.stores).toBe(1)
    })

    it('should increment evictions on overwrite', async () => {
      await client.set('key1', 'value1')
      await client.set('key1', 'value2')
      const stats = client.getStats()
      expect(stats.evictions).toBe(1)
    })
  })

  describe('get', () => {
    it('should return found result for existing key', async () => {
      await client.set('key1', 'value')
      const result = await client.get<string>('key1')
      expect(result.found).toBe(true)
      expect(result.entry?.value).toBe('value')
    })

    it('should return not found for missing key', async () => {
      const result = await client.get('missing')
      expect(result.found).toBe(false)
      expect(result.entry).toBeUndefined()
    })

    it('should return not found for expired entry', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'value', { ttl: 100 })
      vi.advanceTimersByTime(200)
      const result = await client.get('key1')
      expect(result.found).toBe(false)
      vi.useRealTimers()
    })

    it('should include latency in result', async () => {
      await client.set('key1', 'value')
      const result = await client.get('key1')
      expect(result.latency).toBeGreaterThanOrEqual(0)
    })

    it('should include fromCloud flag', async () => {
      await client.set('key1', 'value')
      const result = await client.get('key1')
      expect(result.fromCloud).toBe(false)
    })

    it('should increment hits on cache hit', async () => {
      await client.set('key1', 'value')
      await client.get('key1')
      const stats = client.getStats()
      expect(stats.hits).toBe(1)
    })

    it('should increment misses on cache miss', async () => {
      await client.get('missing')
      const stats = client.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should increment evictions on expired read', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'value', { ttl: 100 })
      vi.advanceTimersByTime(200)
      await client.get('key1')
      const stats = client.getStats()
      expect(stats.evictions).toBe(1)
      vi.useRealTimers()
    })

    it('should return entry with correct checksum', async () => {
      await client.set('key1', { hello: 'world' })
      const result = await client.get('key1')
      expect(result.entry?.checksum).toBeTruthy()
      expect(typeof result.entry?.checksum).toBe('string')
    })

    it('should return entry with correct size', async () => {
      await client.set('key1', 'test')
      const result = await client.get('key1')
      expect(result.entry?.size).toBeGreaterThan(0)
    })
  })

  describe('has', () => {
    it('should return true for existing key', async () => {
      await client.set('key1', 'value')
      const result = await client.has('key1')
      expect(result).toBe(true)
    })

    it('should return false for missing key', async () => {
      const result = await client.has('missing')
      expect(result).toBe(false)
    })

    it('should return false for expired key', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'value', { ttl: 100 })
      vi.advanceTimersByTime(200)
      const result = await client.has('key1')
      expect(result).toBe(false)
      vi.useRealTimers()
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', async () => {
      await client.set('key1', 'value')
      const result = client.delete('key1')
      expect(result).toBe(true)
      const lookup = await client.get('key1')
      expect(lookup.found).toBe(false)
    })

    it('should return false for missing key', () => {
      const result = client.delete('missing')
      expect(result).toBe(false)
    })
  })

  describe('deleteByTags', () => {
    it('should delete entries matching tags', async () => {
      await client.set('key1', 'v1', { tags: ['a', 'b'] })
      await client.set('key2', 'v2', { tags: ['b', 'c'] })
      await client.set('key3', 'v3', { tags: ['d'] })
      const count = await client.deleteByTags(['b'])
      expect(count).toBe(2)
    })

    it('should return 0 when no entries match', async () => {
      await client.set('key1', 'v1', { tags: ['a'] })
      const count = await client.deleteByTags(['z'])
      expect(count).toBe(0)
    })

    it('should handle empty tags array', async () => {
      await client.set('key1', 'v1')
      const count = await client.deleteByTags([])
      expect(count).toBe(0)
    })

    it('should delete entries matching any of multiple tags', async () => {
      await client.set('key1', 'v1', { tags: ['x'] })
      await client.set('key2', 'v2', { tags: ['y'] })
      await client.set('key3', 'v3', { tags: ['z'] })
      const count = await client.deleteByTags(['x', 'z'])
      expect(count).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all entries', async () => {
      await client.set('key1', 'v1')
      await client.set('key2', 'v2')
      await client.clear()
      const stats = client.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return initial stats with zero values', () => {
      const stats = client.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.stores).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.size).toBe(0)
    })

    it('should calculate hit rate correctly', async () => {
      await client.set('key1', 'v')
      await client.get('key1')
      await client.get('missing')
      const stats = client.getStats()
      expect(stats.hitRate).toBe(0.5)
    })

    it('should reflect cache size', async () => {
      await client.set('key1', 'v1')
      await client.set('key2', 'v2')
      const stats = client.getStats()
      expect(stats.size).toBe(2)
    })
  })

  describe('sync', () => {
    it('should return upload and download counts', async () => {
      await client.set('key1', 'v1')
      const result = await client.sync()
      expect(result.uploaded).toBe(1)
      expect(typeof result.downloaded).toBe('number')
    })

    it('should remove expired entries during sync', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'v1', { ttl: 100 })
      vi.advanceTimersByTime(200)
      const result = await client.sync()
      expect(result.downloaded).toBe(1)
      vi.useRealTimers()
    })
  })

  describe('getKeys', () => {
    it('should return all cache keys', async () => {
      await client.set('a', 1)
      await client.set('b', 2)
      const keys = client.getKeys()
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('should return empty array for empty cache', () => {
      const keys = client.getKeys()
      expect(keys).toEqual([])
    })
  })

  describe('resetStats', () => {
    it('should reset all stats to zero', async () => {
      await client.set('key1', 'v')
      await client.get('key1')
      client.resetStats()
      const stats = client.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.stores).toBe(0)
      expect(stats.evictions).toBe(0)
    })

    it('should not affect cached entries', async () => {
      await client.set('key1', 'v')
      client.resetStats()
      const lookup = await client.get('key1')
      expect(lookup.found).toBe(true)
    })
  })

  describe('TTL expiry', () => {
    it('should expire entry based on custom TTL', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'value', { ttl: 50 })
      vi.advanceTimersByTime(60)
      const result = await client.get('key1')
      expect(result.found).toBe(false)
      vi.useRealTimers()
    })

    it('should not expire entry before TTL', async () => {
      vi.useFakeTimers()
      await client.set('key1', 'value', { ttl: 5000 })
      vi.advanceTimersByTime(1000)
      const result = await client.get('key1')
      expect(result.found).toBe(true)
      vi.useRealTimers()
    })

    it('should use default TTL when not specified', async () => {
      vi.useFakeTimers()
      const c = new CloudCacheClient({ ttl: 100 })
      await c.set('key1', 'value')
      vi.advanceTimersByTime(150)
      const result = await c.get('key1')
      expect(result.found).toBe(false)
      vi.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle storing undefined value', async () => {
      const result = await client.set('key1', undefined)
      expect(result).toBe(true)
    })

    it('should handle storing null value', async () => {
      const result = await client.set('key1', null)
      expect(result).toBe(true)
    })

    it('should handle storing large object', async () => {
      const largeObj: Record<string, string> = {}
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = `value${i}`
      }
      const result = await client.set('key1', largeObj)
      expect(result).toBe(true)
    })

    it('should handle special characters in keys', async () => {
      await client.set('key/with/slashes', 'value')
      const result = await client.get('key/with/slashes')
      expect(result.found).toBe(true)
    })

    it('should handle numeric values', async () => {
      await client.set('key1', 42)
      const result = await client.get<number>('key1')
      expect(result.entry?.value).toBe(42)
    })

    it('should handle boolean values', async () => {
      await client.set('key1', true)
      const result = await client.get<boolean>('key1')
      expect(result.entry?.value).toBe(true)
    })
  })
})
