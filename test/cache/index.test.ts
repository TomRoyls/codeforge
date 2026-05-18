import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CacheStore,
  InvalidationManager,
  InvalidationStrategy,
  createDefaultCache,
  createDefaultInvalidationManager,
  hashContent,
} from '../../src/cache/index.js'

// ─── hashContent ──────────────────────────────────────────
describe('hashContent', () => {
  it('produces deterministic SHA-256 hex digest', () => {
    const content = 'hello world'
    const expected = createHash('sha256').update(content).digest('hex')
    expect(hashContent(content)).toBe(expected)
  })

  it('hashes empty string', () => {
    const expected = createHash('sha256').update('').digest('hex')
    expect(hashContent('')).toBe(expected)
  })

  it('produces different hashes for different inputs', () => {
    expect(hashContent('foo')).not.toBe(hashContent('bar'))
  })
})

// ─── CacheStore ───────────────────────────────────────────
describe('CacheStore', () => {
  let cacheDir: string
  let store: CacheStore

  beforeEach(async () => {
    cacheDir = await mkdtemp(path.join(tmpdir(), 'codeforge-cache-test-'))
    store = new CacheStore(cacheDir)
  })

  afterEach(async () => {
    await rm(cacheDir, { recursive: true, force: true })
  })

  it('constructs without error', () => {
    expect(new CacheStore(cacheDir)).toBeInstanceOf(CacheStore)
  })

  it('round-trips a value via set + get', async () => {
    await store.set('my-key', { name: 'test', count: 42 })
    const result = await store.get<{ name: string; count: number }>('my-key')
    expect(result).toEqual({ name: 'test', count: 42 })
  })

  it('returns null for a missing key', async () => {
    const result = await store.get('nonexistent')
    expect(result).toBeNull()
  })

  it('reports has=true for an existing key', async () => {
    await store.set('exists', 'value')
    expect(await store.has('exists')).toBe(true)
  })

  it('reports has=false for a missing key', async () => {
    expect(await store.has('nope')).toBe(false)
  })

  it('deletes an existing key and returns true', async () => {
    await store.set('to-delete', 'value')
    expect(await store.delete('to-delete')).toBe(true)
    expect(await store.has('to-delete')).toBe(false)
  })

  it('returns false when deleting a missing key', async () => {
    expect(await store.delete('ghost')).toBe(false)
  })

  it('clears all entries', async () => {
    await store.set('a', 1)
    await store.set('b', 2)
    await store.clear()
    expect(await store.get('a')).toBeNull()
    expect(await store.get('b')).toBeNull()
  })

  it('reports accurate getStats', async () => {
    await store.set('k1', 'val1')
    await store.set('k2', 'val2')
    const stats = await store.getStats()
    expect(stats.entries).toBe(2)
    expect(stats.size).toBeGreaterThan(0)
  })

  it('returns zero stats for empty cache', async () => {
    const stats = await store.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('expires entries past their TTL', async () => {
    vi.useFakeTimers()
    try {
      await store.set('ttl-key', 'data', 1000)
      vi.advanceTimersByTime(999)
      expect(await store.get('ttl-key')).toBe('data')
      vi.advanceTimersByTime(2)
      expect(await store.get('ttl-key')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

// ─── InvalidationManager ──────────────────────────────────
describe('InvalidationManager', () => {
  let cacheDir: string
  let store: CacheStore

  beforeEach(async () => {
    cacheDir = await mkdtemp(path.join(tmpdir(), 'codeforge-inv-test-'))
    store = new CacheStore(cacheDir)
  })

  afterEach(async () => {
    await rm(cacheDir, { recursive: true, force: true })
  })

  it('invalidateOnVersionChange returns true for different version', () => {
    const manager = new InvalidationManager(store, '1.0.0')
    expect(manager.invalidateOnVersionChange('2.0.0')).toBe(true)
  })

  it('invalidateOnVersionChange returns false for same version', () => {
    const manager = new InvalidationManager(store, '1.0.0')
    expect(manager.invalidateOnVersionChange('1.0.0')).toBe(false)
  })

  it('shouldInvalidate returns false for ContentBased (placeholder)', async () => {
    const manager = new InvalidationManager(store, '1.0.0')
    const result = await manager.shouldInvalidate('key', InvalidationStrategy.ContentBased)
    expect(result).toBe(false)
  })

  it('shouldInvalidate returns false for VersionBased (placeholder)', async () => {
    const manager = new InvalidationManager(store, '1.0.0')
    const result = await manager.shouldInvalidate('key', InvalidationStrategy.VersionBased)
    expect(result).toBe(false)
  })

  it('shouldInvalidate with TimeBased returns true when no entry found', async () => {
    const manager = new InvalidationManager(store, '1.0.0')
    const result = await manager.shouldInvalidate('missing', InvalidationStrategy.TimeBased)
    expect(result).toBe(true)
  })

  it('shouldInvalidate with TimeBased returns true when TTL expired', async () => {
    vi.useFakeTimers()
    try {
      await store.set('timed', 'value', 500)
      vi.advanceTimersByTime(501)
      const manager = new InvalidationManager(store, '1.0.0')
      const result = await manager.shouldInvalidate('timed', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('shouldInvalidate with TimeBased returns false when entry is fresh', async () => {
    const manager = new InvalidationManager(store, '1.0.0')
    // checkTimeBased calls get<{ timestamp: number; ttl: number }> on the raw entry value
    await store.set('fresh', { timestamp: Date.now(), ttl: 60000 })
    const result = await manager.shouldInvalidate('fresh', InvalidationStrategy.TimeBased)
    expect(result).toBe(false)
  })
})

// ─── Factory Functions ────────────────────────────────────
describe('Factory functions', () => {
  it('createDefaultCache returns a CacheStore instance', () => {
    const cache = createDefaultCache()
    expect(cache).toBeInstanceOf(CacheStore)
  })

  it('createDefaultInvalidationManager returns an InvalidationManager', () => {
    const cache = createDefaultCache()
    const manager = createDefaultInvalidationManager(cache, '1.0.0')
    expect(manager).toBeInstanceOf(InvalidationManager)
  })
})
