import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { CacheStore, hashContent, InvalidationManager, InvalidationStrategy } from '../src/cache/index.js'

describe('hashContent', () => {
  it('produces consistent sha256 hex', () => {
    expect(hashContent('hello')).toBe(hashContent('hello'))
  })

  it('produces different hashes for different content', () => {
    expect(hashContent('hello')).not.toBe(hashContent('world'))
  })

  it('returns 64-char hex string', () => {
    expect(hashContent('test')).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('CacheStore', () => {
  let tmpDir: string
  let store: CacheStore

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `cache-test-${Date.now()}`)
    await mkdir(tmpDir, { recursive: true })
    store = new CacheStore(tmpDir)
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('sets and gets a value', async () => {
    await store.set('key1', { name: 'test' })
    const result = await store.get<{ name: string }>('key1')
    expect(result).toEqual({ name: 'test' })
  })

  it('returns null for missing key', async () => {
    expect(await store.get('nonexistent')).toBeNull()
  })

  it('checks has correctly', async () => {
    expect(await store.has('key1')).toBe(false)
    await store.set('key1', 'value')
    expect(await store.has('key1')).toBe(true)
  })

  it('deletes a key', async () => {
    await store.set('key1', 'value')
    expect(await store.delete('key1')).toBe(true)
    expect(await store.get('key1')).toBeNull()
  })

  it('returns false for deleting missing key', async () => {
    expect(await store.delete('nonexistent')).toBe(false)
  })

  it('reports stats', async () => {
    await store.set('a', 1)
    await store.set('b', 2)
    const stats = await store.getStats()
    expect(stats.entries).toBe(2)
    expect(stats.size).toBeGreaterThan(0)
  })

  it('clears all entries', async () => {
    await store.set('a', 1)
    await store.set('b', 2)
    await store.clear()
    const stats = await store.getStats()
    expect(stats.entries).toBe(0)
  })

  it('respects TTL', async () => {
    await store.set('ttl-key', 'value', 1)
    await new Promise((r) => setTimeout(r, 50))
    const result = await store.get('ttl-key')
    expect(result).toBeNull()
  })

  it('stores primitives', async () => {
    await store.set('num', 42)
    await store.set('str', 'hello')
    await store.set('bool', true)
    expect(await store.get('num')).toBe(42)
    expect(await store.get('str')).toBe('hello')
    expect(await store.get('bool')).toBe(true)
  })

  it('overwrites existing key', async () => {
    await store.set('key', 'old')
    await store.set('key', 'new')
    expect(await store.get('key')).toBe('new')
  })
})

describe('InvalidationManager', () => {
  it('detects version change', () => {
    const mgr = new InvalidationManager({} as CacheStore, '1.0.0')
    expect(mgr.invalidateOnVersionChange('2.0.0')).toBe(true)
    expect(mgr.invalidateOnVersionChange('1.0.0')).toBe(false)
  })

  it('shouldInvalidate returns false for content-based by default', async () => {
    const mgr = new InvalidationManager({} as CacheStore, '1.0.0')
    expect(await mgr.shouldInvalidate('key', InvalidationStrategy.ContentBased)).toBe(false)
  })

  it('shouldInvalidate returns false for version-based by default', async () => {
    const mgr = new InvalidationManager({} as CacheStore, '1.0.0')
    expect(await mgr.shouldInvalidate('key', InvalidationStrategy.VersionBased)).toBe(false)
  })
})
