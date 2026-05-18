import { describe, it, expect, beforeEach } from 'vitest'
import { ModuleCache } from '../../src/plugins/module-cache.js'
import path from 'node:path'

// ─── track + get ───

describe('ModuleCache', () => {
  let cache: ModuleCache

  beforeEach(() => {
    cache = new ModuleCache()
  })

  it('tracks and retrieves a module', () => {
    const mod = { name: 'test' }
    cache.track('/fake/path/module.js', mod)
    expect(cache.get('/fake/path/module.js')).toBe(mod)
  })

  it('returns undefined for non-existent key', () => {
    expect(cache.get('/does/not/exist.js')).toBeUndefined()
  })

  // ─── invalidate ───

  it('invalidates an existing entry and returns true', () => {
    cache.track('/fake/a.js', { id: 'a' })
    expect(cache.invalidate('/fake/a.js')).toBe(true)
    expect(cache.get('/fake/a.js')).toBeUndefined()
  })

  it('returns false when invalidating non-existent entry', () => {
    expect(cache.invalidate('/no/such/file.js')).toBe(false)
  })

  // ─── invalidateAll ───

  it('clears all entries and returns the count', () => {
    cache.track('/fake/a.js', { id: 'a' })
    cache.track('/fake/b.js', { id: 'b' })
    cache.track('/fake/c.js', { id: 'c' })
    const count = cache.invalidateAll()
    expect(count).toBe(3)
    expect(cache.size).toBe(0)
    expect(cache.get('/fake/a.js')).toBeUndefined()
  })

  it('returns 0 when clearing an empty cache', () => {
    expect(cache.invalidateAll()).toBe(0)
  })

  // ─── has ───

  it('returns true for a tracked path', () => {
    cache.track('/fake/x.js', { id: 'x' })
    expect(cache.has('/fake/x.js')).toBe(true)
  })

  it('returns false for a non-tracked path', () => {
    expect(cache.has('/fake/missing.js')).toBe(false)
  })

  // ─── size ───

  it('reports correct size', () => {
    expect(cache.size).toBe(0)
    cache.track('/fake/a.js', { id: 'a' })
    expect(cache.size).toBe(1)
    cache.track('/fake/b.js', { id: 'b' })
    expect(cache.size).toBe(2)
  })

  it('decrements size after invalidate', () => {
    cache.track('/fake/a.js', { id: 'a' })
    cache.track('/fake/b.js', { id: 'b' })
    cache.invalidate('/fake/a.js')
    expect(cache.size).toBe(1)
  })

  // ─── path normalization ───

  it('resolves relative and absolute paths to the same key', () => {
    const absolutePath = path.resolve('relative/module.js')
    cache.track('relative/module.js', { normalized: true })
    expect(cache.get(absolutePath)).toEqual({ normalized: true })
  })

  it('normalizes dot-segments in paths', () => {
    const resolved = path.resolve('./././fake/mod.js')
    cache.track('./fake/mod.js', { dots: true })
    expect(cache.get(resolved)).toEqual({ dots: true })
  })

  it('overwrites existing entry when tracking same resolved path twice', () => {
    cache.track('/fake/dup.js', { version: 1 })
    cache.track('/fake/dup.js', { version: 2 })
    expect(cache.get('/fake/dup.js')).toEqual({ version: 2 })
    expect(cache.size).toBe(1)
  })
})
