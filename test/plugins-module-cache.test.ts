import { describe, it, expect } from 'vitest'
import { ModuleCache } from '../src/plugins/module-cache.js'

// ─── ModuleCache Constructor ──────────────────────────
describe('ModuleCache constructor', () => {
  it('creates empty cache', () => {
    const cache = new ModuleCache()
    expect(cache.size).toBe(0)
  })
})

// ─── ModuleCache.track / get ──────────────────────────
describe('ModuleCache.track / get', () => {
  it('tracks and retrieves a module', () => {
    const cache = new ModuleCache()
    const mod = { name: 'test' }
    cache.track('/path/to/mod.js', mod)
    expect(cache.get('/path/to/mod.js')).toBe(mod)
  })

  it('resolves paths before tracking', () => {
    const cache = new ModuleCache()
    cache.track('./mod.js', { v: 1 })
    expect(cache.get('./mod.js')).toBeDefined()
  })

  it('returns undefined for untracked path', () => {
    const cache = new ModuleCache()
    expect(cache.get('/nonexistent')).toBeUndefined()
  })
})

// ─── ModuleCache.has ──────────────────────────────────
describe('ModuleCache.has', () => {
  it('returns true for tracked path', () => {
    const cache = new ModuleCache()
    cache.track('/mod.js', {})
    expect(cache.has('/mod.js')).toBe(true)
  })

  it('returns false for untracked path', () => {
    const cache = new ModuleCache()
    expect(cache.has('/nonexistent')).toBe(false)
  })
})

// ─── ModuleCache.invalidate ───────────────────────────
describe('ModuleCache.invalidate', () => {
  it('removes tracked entry', () => {
    const cache = new ModuleCache()
    cache.track('/mod.js', {})
    expect(cache.invalidate('/mod.js')).toBe(true)
    expect(cache.has('/mod.js')).toBe(false)
  })

  it('returns false for untracked path', () => {
    const cache = new ModuleCache()
    expect(cache.invalidate('/nonexistent')).toBe(false)
  })
})

// ─── ModuleCache.invalidateAll ────────────────────────
describe('ModuleCache.invalidateAll', () => {
  it('removes all entries and returns count', () => {
    const cache = new ModuleCache()
    cache.track('/a.js', {})
    cache.track('/b.js', {})
    const count = cache.invalidateAll()
    expect(count).toBe(2)
    expect(cache.size).toBe(0)
  })

  it('returns 0 for empty cache', () => {
    const cache = new ModuleCache()
    expect(cache.invalidateAll()).toBe(0)
  })
})

// ─── ModuleCache.size ─────────────────────────────────
describe('ModuleCache.size', () => {
  it('tracks number of entries', () => {
    const cache = new ModuleCache()
    expect(cache.size).toBe(0)
    cache.track('/a.js', {})
    expect(cache.size).toBe(1)
    cache.track('/b.js', {})
    expect(cache.size).toBe(2)
  })
})
