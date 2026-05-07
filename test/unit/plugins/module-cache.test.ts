import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { ModuleCache } from '../../../src/plugins/module-cache.js'

describe('ModuleCache', () => {
  let cache: ModuleCache

  beforeEach(() => {
    cache = new ModuleCache()
  })

  test('tracks and retrieves a module', () => {
    cache.track('/tmp/test-module.ts', { value: 42 })
    expect(cache.get('/tmp/test-module.ts')).toEqual({ value: 42 })
  })

  test('returns undefined for untracked path', () => {
    expect(cache.get('/tmp/nonexistent.ts')).toBeUndefined()
  })

  test('invalidates a tracked module', () => {
    cache.track('/tmp/test-module.ts', { value: 1 })
    expect(cache.invalidate('/tmp/test-module.ts')).toBe(true)
    expect(cache.get('/tmp/test-module.ts')).toBeUndefined()
  })

  test('invalidate returns false for untracked path', () => {
    expect(cache.invalidate('/tmp/nonexistent.ts')).toBe(false)
  })

  test('invalidateAll clears all entries and returns count', () => {
    cache.track('/tmp/a.ts', 1)
    cache.track('/tmp/b.ts', 2)
    cache.track('/tmp/c.ts', 3)
    const count = cache.invalidateAll()
    expect(count).toBe(3)
    expect(cache.size).toBe(0)
  })

  test('invalidateAll returns 0 when empty', () => {
    expect(cache.invalidateAll()).toBe(0)
  })

  test('has returns true for tracked path', () => {
    cache.track('/tmp/test-module.ts', 'hello')
    expect(cache.has('/tmp/test-module.ts')).toBe(true)
  })

  test('has returns false for untracked path', () => {
    expect(cache.has('/tmp/nonexistent.ts')).toBe(false)
  })

  test('size returns number of tracked entries', () => {
    expect(cache.size).toBe(0)
    cache.track('/tmp/a.ts', 1)
    expect(cache.size).toBe(1)
    cache.track('/tmp/b.ts', 2)
    expect(cache.size).toBe(2)
  })

  test('tracking same path overwrites previous entry', () => {
    cache.track('/tmp/test-module.ts', 'first')
    cache.track('/tmp/test-module.ts', 'second')
    expect(cache.get('/tmp/test-module.ts')).toBe('second')
    expect(cache.size).toBe(1)
  })

  test('normalizes paths with path.resolve', () => {
    const absPath = path.resolve('/tmp/test-module.ts')
    cache.track(absPath, { v: 1 })
    expect(cache.get('/tmp/test-module.ts')).toEqual({ v: 1 })
    expect(cache.has('/tmp/test-module.ts')).toBe(true)
  })

  describe('reload', () => {
    let tmpCounter = 0

    function makeTmp(name: string): string {
      const dir = path.join('/tmp', 'module-cache-test', `${Date.now()}-${tmpCounter++}`)
      mkdirSync(dir, { recursive: true })
      return path.join(dir, name)
    }

    test('reloads a module from disk', async () => {
      const tmpFile = makeTmp('mod.mjs')
      writeFileSync(tmpFile, 'export const value = "alpha";\n')
      const result = await cache.reload(tmpFile)
      expect(result).toHaveProperty('value', 'alpha')
      expect(cache.has(tmpFile)).toBe(true)
      rmSync(path.dirname(tmpFile), { recursive: true, force: true })
    })

    test('re-imports after file modification', async () => {
      const tmpFile = makeTmp('mod.mjs')
      writeFileSync(tmpFile, 'export const value = "beta";\n')
      const first = await cache.reload(tmpFile)
      expect(first).toHaveProperty('value', 'beta')

      writeFileSync(tmpFile, 'export const value = "gamma";\n')
      const second = await cache.reload(tmpFile)
      expect(second).toHaveProperty('value', 'gamma')
      rmSync(path.dirname(tmpFile), { recursive: true, force: true })
    })

    test('throws on non-existent path', async () => {
      await expect(cache.reload('/tmp/no-such-file-at-all.mjs')).rejects.toThrow()
    })

    test('stores reloaded module in cache', async () => {
      const tmpFile = makeTmp('mod.mjs')
      writeFileSync(tmpFile, 'export const tag = "cached";\n')
      await cache.reload(tmpFile)
      const cached = cache.get(tmpFile)
      expect(cached).toHaveProperty('tag', 'cached')
      rmSync(path.dirname(tmpFile), { recursive: true, force: true })
    })
  })
})
