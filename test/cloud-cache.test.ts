import { describe, it, expect, beforeEach } from 'vitest'
import { CloudCacheClient, DEFAULT_CLOUD_CACHE_CONFIG } from '../src/core/cloud-cache/index.js'

// ─── CloudCacheClient Construction ───

describe('CloudCacheClient', () => {
  let client: CloudCacheClient

  beforeEach(() => {
    client = new CloudCacheClient()
  })

  describe('construction', () => {
    it('should use default config when none provided', () => {
      const c = new CloudCacheClient()
      const stats = c.getStats()
      expect(stats.size).toBe(0)
    })

    it('should accept partial config overrides', () => {
      const c = new CloudCacheClient({ ttl: 1000 })
      expect(c).toBeDefined()
    })
  })

  // ─── Set & Get ───

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      await client.set('key1', 'value1')
      const result = await client.get<string>('key1')
      expect(result.found).toBe(true)
      expect(result.entry!.value).toBe('value1')
      expect(result.fromCloud).toBe(false)
    })

    it('should return not found for missing key', async () => {
      const result = await client.get('nonexistent')
      expect(result.found).toBe(false)
      expect(result.entry).toBeUndefined()
    })

    it('should store complex objects', async () => {
      const data = { name: 'test', items: [1, 2, 3] }
      await client.set('obj1', data)
      const result = await client.get<typeof data>('obj1')
      expect(result.found).toBe(true)
      expect(result.entry!.value).toEqual(data)
    })

    it('should overwrite existing key and increment evictions', async () => {
      await client.set('key1', 'v1')
      await client.set('key1', 'v2')
      const result = await client.get<string>('key1')
      expect(result.entry!.value).toBe('v2')
      const stats = client.getStats()
      expect(stats.evictions).toBe(1)
    })

    it('should reject values exceeding maxEntrySize', async () => {
      const smallClient = new CloudCacheClient({ maxEntrySize: 10 })
      const result = await smallClient.set('big', 'x'.repeat(100))
      expect(result).toBe(false)
    })

    it('should use custom TTL from options', async () => {
      await client.set('short', 'val', { ttl: 1 })
      // Wait a bit for it to expire
      await new Promise((r) => setTimeout(r, 5))
      const result = await client.get('short')
      expect(result.found).toBe(false)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('should return true for existing non-expired key', async () => {
      await client.set('key1', 'val')
      expect(await client.has('key1')).toBe(true)
    })

    it('should return false for missing key', async () => {
      expect(await client.has('missing')).toBe(false)
    })

    it('should return false for expired key', async () => {
      await client.set('exp', 'val', { ttl: 1 })
      await new Promise((r) => setTimeout(r, 5))
      expect(await client.has('exp')).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing key', async () => {
      await client.set('key1', 'val')
      expect(client.delete('key1')).toBe(true)
      const result = await client.get('key1')
      expect(result.found).toBe(false)
    })

    it('should return false for non-existent key', () => {
      expect(client.delete('nonexistent')).toBe(false)
    })
  })

  // ─── Tags ───

  describe('deleteByTags', () => {
    it('should delete entries matching any tag', async () => {
      await client.set('a', 1, { tags: ['alpha', 'common'] })
      await client.set('b', 2, { tags: ['beta'] })
      await client.set('c', 3, { tags: ['common'] })
      const count = await client.deleteByTags(['common'])
      expect(count).toBe(2)
      expect(await client.has('a')).toBe(false)
      expect(await client.has('b')).toBe(true)
      expect(await client.has('c')).toBe(false)
    })

    it('should return 0 when no entries match tags', async () => {
      await client.set('a', 1, { tags: ['alpha'] })
      const count = await client.deleteByTags(['beta'])
      expect(count).toBe(0)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', async () => {
      await client.set('a', 1)
      await client.set('b', 2)
      await client.clear()
      expect(client.getStats().size).toBe(0)
    })
  })

  // ─── Stats ───

  describe('getStats', () => {
    it('should track hits, misses, stores, evictions', async () => {
      await client.set('a', 1)
      await client.get('a') // hit
      await client.get('missing') // miss
      const stats = client.getStats()
      expect(stats.stores).toBe(1)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.evictions).toBe(0)
    })

    it('should calculate hit rate', async () => {
      await client.set('a', 1)
      await client.get('a')
      await client.get('a')
      const stats = client.getStats()
      expect(stats.hitRate).toBe(1)
    })

    it('should return 0 hit rate when no lookups', () => {
      const stats = client.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should reset stats', async () => {
      await client.set('a', 1)
      await client.get('a')
      client.resetStats()
      const stats = client.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.stores).toBe(0)
    })
  })

  // ─── Sync ───

  describe('sync', () => {
    it('should clean expired entries during sync', async () => {
      await client.set('exp', 'val', { ttl: 1 })
      await new Promise((r) => setTimeout(r, 5))
      const result = await client.sync()
      expect(result.downloaded).toBe(1)
    })

    it('should report uploaded count as current cache size', async () => {
      await client.set('a', 1)
      await client.set('b', 2)
      const result = await client.sync()
      expect(result.uploaded).toBe(2)
    })
  })

  // ─── getKeys ───

  describe('getKeys', () => {
    it('should return all cache keys', async () => {
      await client.set('a', 1)
      await client.set('b', 2)
      const keys = client.getKeys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('should return empty array when cache is empty', () => {
      expect(client.getKeys()).toEqual([])
    })
  })

  // ─── Metadata and Tags on entries ───

  describe('entry metadata', () => {
    it('should store tags and metadata on entries', async () => {
      await client.set('key', 'val', {
        tags: ['tag1'],
        metadata: { source: 'test' },
      })
      const result = await client.get<string>('key')
      expect(result.entry!.tags).toEqual(['tag1'])
      expect(result.entry!.metadata).toEqual({ source: 'test' })
    })
  })
})
