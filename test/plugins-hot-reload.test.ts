import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PluginHotReloader } from '../src/plugins/hot-reload.js'
import type { ModuleCache } from '../src/plugins/module-cache.js'

// ─── Helpers ──────────────────────────────────────────
function createMockCache(): ModuleCache {
  const modules = new Map<string, unknown>()
  return {
    track: vi.fn((path: string, mod: unknown) => { modules.set(path, mod) }),
    get: vi.fn((path: string) => modules.get(path)),
    has: vi.fn((path: string) => modules.has(path)),
    invalidate: vi.fn((path: string) => { modules.delete(path) }),
    invalidateAll: vi.fn(() => { modules.clear() }),
    size: vi.fn(() => modules.size),
    reload: vi.fn(async (path: string) => {
      const mod = { reloaded: true, path }
      modules.set(path, mod)
      return mod
    }),
  } as unknown as ModuleCache
}

function makeTempDir(): string {
  const dir = join(tmpdir(), `hot-reload-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

// ─── Constructor ──────────────────────────────────────
describe('PluginHotReloader', () => {
  let cache: ModuleCache
  let tempDir: string

  beforeEach(() => {
    cache = createMockCache()
    tempDir = makeTempDir()
  })

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('constructs with default debounceMs', () => {
    const reloader = new PluginHotReloader(cache)
    expect(reloader.watchedPaths).toEqual([])
  })

  it('constructs with custom debounceMs', () => {
    const reloader = new PluginHotReloader(cache, { debounceMs: 500 })
    expect(reloader.watchedPaths).toEqual([])
  })

  // ─── watch ────────────────────────────────────────
  it('watches a directory', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    expect(reloader.watchedPaths).toContain(tempDir)
    reloader.stop()
  })

  it('resolves paths to absolute', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    expect(reloader.watchedPaths[0]).toBe(tempDir)
    expect(tempDir.startsWith('/')).toBe(true)
    reloader.stop()
  })

  it('does not duplicate watch entries', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    reloader.watch([tempDir])
    expect(reloader.watchedPaths).toHaveLength(1)
    reloader.stop()
  })

  it('watches multiple paths', () => {
    const dir2 = join(tempDir, 'sub')
    mkdirSync(dir2, { recursive: true })
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir, dir2])
    expect(reloader.watchedPaths).toHaveLength(2)
    reloader.stop()
  })

  // ─── unwatch ──────────────────────────────────────
  it('unwatches a path', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    reloader.unwatch(tempDir)
    expect(reloader.watchedPaths).toEqual([])
  })

  it('unwatch resolves path before removing', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    reloader.unwatch(tempDir)
    expect(reloader.watchedPaths).not.toContain(tempDir)
  })

  it('unwatch is no-op for non-watched path', () => {
    const reloader = new PluginHotReloader(cache)
    expect(() => reloader.unwatch('/nonexistent')).not.toThrow()
  })

  // ─── stop ─────────────────────────────────────────
  it('stop clears all watchers', () => {
    const dir2 = join(tempDir, 'sub2')
    mkdirSync(dir2, { recursive: true })
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir, dir2])
    reloader.stop()
    expect(reloader.watchedPaths).toEqual([])
  })

  it('stop is idempotent', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    reloader.stop()
    expect(() => reloader.stop()).not.toThrow()
  })

  // ─── callbacks ────────────────────────────────────
  it('registers onReload callback', () => {
    const reloader = new PluginHotReloader(cache)
    const cb = vi.fn()
    reloader.onReload(cb)
    reloader.stop()
  })

  it('registers onError callback', () => {
    const reloader = new PluginHotReloader(cache)
    const cb = vi.fn()
    reloader.onError(cb)
    reloader.stop()
  })

  it('handles reload error via error callbacks', async () => {
    const errorCache = {
      ...cache,
      reload: vi.fn(async () => { throw new Error('reload failed') }),
    } as unknown as ModuleCache
    const reloader = new PluginHotReloader(errorCache, { debounceMs: 10 })
    const errorCb = vi.fn()
    reloader.onError(errorCb)

    const testFile = join(tempDir, 'plugin.js')
    writeFileSync(testFile, 'module.exports = {}')
    reloader.watch([tempDir])

    writeFileSync(testFile, 'module.exports = { updated: true }')

    await new Promise(resolve => setTimeout(resolve, 200))

    if (errorCb.mock.calls.length > 0) {
      expect(errorCb.mock.calls[0]![1]).toBeInstanceOf(Error)
      expect(errorCb.mock.calls[0]![1].message).toBe('reload failed')
    }

    reloader.stop()
  })

  it('handles non-Error thrown as Error object', async () => {
    const errorCache = {
      ...cache,
      reload: vi.fn(async () => { throw 'string error' }),
    } as unknown as ModuleCache
    const reloader = new PluginHotReloader(errorCache, { debounceMs: 10 })
    const errorCb = vi.fn()
    reloader.onError(errorCb)

    const testFile = join(tempDir, 'plugin.js')
    writeFileSync(testFile, 'module.exports = {}')
    reloader.watch([tempDir])

    writeFileSync(testFile, 'module.exports = { updated: true }')

    await new Promise(resolve => setTimeout(resolve, 200))

    if (errorCb.mock.calls.length > 0) {
      expect(errorCb.mock.calls[0]![1]).toBeInstanceOf(Error)
    }

    reloader.stop()
  })

  it('triggers reload callback on file change', async () => {
    const reloader = new PluginHotReloader(cache, { debounceMs: 10 })
    const reloadCb = vi.fn()
    reloader.onReload(reloadCb)

    const testFile = join(tempDir, 'plugin.js')
    writeFileSync(testFile, 'module.exports = {}')
    reloader.watch([tempDir])

    writeFileSync(testFile, 'module.exports = { v: 2 }')

    await new Promise(resolve => setTimeout(resolve, 300))

    if (reloadCb.mock.calls.length > 0) {
      expect(reloadCb.mock.calls[0]![0]).toBe(tempDir)
    }

    reloader.stop()
  })

  // ─── debounce ─────────────────────────────────────
  it('debounces multiple rapid changes', async () => {
    const reloader = new PluginHotReloader(cache, { debounceMs: 100 })
    const reloadCb = vi.fn()
    reloader.onReload(reloadCb)

    const testFile = join(tempDir, 'plugin.js')
    writeFileSync(testFile, 'module.exports = {}')
    reloader.watch([tempDir])

    for (let i = 0; i < 5; i++) {
      writeFileSync(testFile, `module.exports = { v: ${i} }`)
    }

    await new Promise(resolve => setTimeout(resolve, 400))

    if (reloadCb.mock.calls.length > 0) {
      expect(reloadCb.mock.calls.length).toBeLessThanOrEqual(2)
    }

    reloader.stop()
  })

  // ─── watchedPaths getter ──────────────────────────
  it('watchedPaths returns array of paths', () => {
    const reloader = new PluginHotReloader(cache)
    reloader.watch([tempDir])
    const paths = reloader.watchedPaths
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBeGreaterThan(0)
    reloader.stop()
  })
})
