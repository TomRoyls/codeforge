import { describe, expect, it } from 'vitest'

import type { ModuleCache } from '../../src/plugins/module-cache.js'

import { PluginHotReloader } from '../../src/plugins/hot-reload.js'

// ─── Helpers ───

function createMockCache(): ModuleCache {
  return {
    reload: async () => ({ default: 'mock-module' }),
  } as unknown as ModuleCache
}

// ─── Constructor ───

describe('PluginHotReloader', () => {
  describe('constructor', () => {
    it('creates instance with default debounce time', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(reloader.watchedPaths).toEqual([])
    })

    it('creates instance with custom debounce time', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache, { debounceMs: 500 })
      expect(reloader.watchedPaths).toEqual([])
    })
  })

  // ─── watchedPaths ───

  describe('watchedPaths', () => {
    it('returns empty array when nothing is watched', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(reloader.watchedPaths).toEqual([])
    })
  })

  // ─── unwatch ───

  describe('unwatch', () => {
    it('does nothing for a path that is not watched', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(() => reloader.unwatch('/nonexistent.ts')).not.toThrow()
    })
  })

  // ─── stop ───

  describe('stop', () => {
    it('handles being called when nothing is watched', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(() => reloader.stop()).not.toThrow()
    })
  })

  // ─── onReload ───

  describe('onReload', () => {
    it('registers callback without error', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(() => reloader.onReload(() => {})).not.toThrow()
    })

    it('supports multiple callbacks', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      reloader.onReload(() => {})
      reloader.onReload(() => {})
    })
  })

  // ─── onError ───

  describe('onError', () => {
    it('registers callback without error', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      expect(() => reloader.onError(() => {})).not.toThrow()
    })

    it('supports multiple callbacks', () => {
      const cache = createMockCache()
      const reloader = new PluginHotReloader(cache)
      reloader.onError(() => {})
      reloader.onError(() => {})
    })
  })
})
