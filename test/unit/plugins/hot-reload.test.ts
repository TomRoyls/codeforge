import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ModuleCache } from '../../../src/plugins/module-cache.js'
import { PluginHotReloader } from '../../../src/plugins/hot-reload.js'

function createTempDir(prefix: string): string {
  const dir = path.join('/tmp', `hot-reload-test-${prefix}`, `${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

describe('PluginHotReloader', () => {
  let cache: ModuleCache
  let reloader: PluginHotReloader

  beforeEach(() => {
    cache = new ModuleCache()
  })

  afterEach(() => {
    reloader?.stop()
  })

  test('constructor uses default debounce of 100ms', () => {
    reloader = new PluginHotReloader(cache)
    expect(reloader.watchedPaths).toEqual([])
  })

  test('constructor accepts custom debounce', () => {
    reloader = new PluginHotReloader(cache, { debounceMs: 50 })
    expect(reloader.watchedPaths).toEqual([])
  })

  test('watch adds paths to watchedPaths', () => {
    const tmpDir = createTempDir('watch-add')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export default {};\n')

    reloader = new PluginHotReloader(cache)
    reloader.watch([tmpFile])
    expect(reloader.watchedPaths).toContain(path.resolve(tmpFile))

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('watch normalizes paths to absolute', () => {
    const tmpDir = createTempDir('watch-abs')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export default {};\n')
    const relPath = path.relative(process.cwd(), tmpFile)

    reloader = new PluginHotReloader(cache)
    reloader.watch([relPath])
    expect(reloader.watchedPaths).toContain(path.resolve(relPath))

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('watch does not add duplicates', () => {
    const tmpDir = createTempDir('watch-dup')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export default {};\n')

    reloader = new PluginHotReloader(cache)
    reloader.watch([tmpFile, tmpFile])
    expect(reloader.watchedPaths.length).toBe(1)

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('unwatch removes path from watchedPaths', () => {
    const tmpDir = createTempDir('unwatch')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export default {};\n')

    reloader = new PluginHotReloader(cache)
    reloader.watch([tmpFile])
    reloader.unwatch(tmpFile)
    expect(reloader.watchedPaths).not.toContain(path.resolve(tmpFile))

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('unwatch ignores non-watched path', () => {
    reloader = new PluginHotReloader(cache)
    expect(() => reloader.unwatch('/tmp/nonexistent.mjs')).not.toThrow()
  })

  test('stop clears all watchers', () => {
    const tmpDir = createTempDir('stop')
    const fileA = path.join(tmpDir, 'a.mjs')
    const fileB = path.join(tmpDir, 'b.mjs')
    writeFileSync(fileA, 'export default {};\n')
    writeFileSync(fileB, 'export default {};\n')

    reloader = new PluginHotReloader(cache)
    reloader.watch([fileA, fileB])
    expect(reloader.watchedPaths.length).toBe(2)

    reloader.stop()
    expect(reloader.watchedPaths.length).toBe(0)

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('onReload callback fires on file change', async () => {
    const tmpDir = createTempDir('reload-cb')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export const version = 1;\n')

    reloader = new PluginHotReloader(cache, { debounceMs: 50 })
    const onReload = vi.fn()
    reloader.onReload(onReload)
    reloader.watch([tmpFile])

    writeFileSync(tmpFile, 'export const version = 2;\n')

    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(onReload).toHaveBeenCalled()
    const [calledPath] = onReload.mock.calls[0]!
    expect(calledPath).toBe(path.resolve(tmpFile))

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('onError callback fires on invalid module', async () => {
    const tmpDir = createTempDir('error-cb')
    const tmpFile = path.join(tmpDir, 'bad.mjs')
    writeFileSync(tmpFile, 'export const version = 1;\n')

    reloader = new PluginHotReloader(cache, { debounceMs: 50 })
    const onError = vi.fn()
    reloader.onError(onError)
    reloader.watch([tmpFile])

    writeFileSync(tmpFile, 'this is not valid JavaScript !!!\n')

    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(onError).toHaveBeenCalled()
    const [calledPath, error] = onError.mock.calls[0]!
    expect(calledPath).toBe(path.resolve(tmpFile))
    expect(error).toBeInstanceOf(Error)

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('debounce collapses rapid changes into single reload', async () => {
    const tmpDir = createTempDir('debounce')
    const tmpFile = path.join(tmpDir, 'plugin.mjs')
    writeFileSync(tmpFile, 'export const version = 0;\n')

    reloader = new PluginHotReloader(cache, { debounceMs: 100 })
    const onReload = vi.fn()
    reloader.onReload(onReload)
    reloader.watch([tmpFile])

    for (let i = 1; i <= 5; i++) {
      writeFileSync(tmpFile, `export const version = ${i};\n`)
    }

    await new Promise((resolve) => setTimeout(resolve, 400))

    expect(onReload.mock.calls.length).toBeLessThanOrEqual(2)

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('watches multiple paths', async () => {
    const tmpDir = createTempDir('multi')
    const fileA = path.join(tmpDir, 'a.mjs')
    const fileB = path.join(tmpDir, 'b.mjs')
    writeFileSync(fileA, 'export const name = "a";\n')
    writeFileSync(fileB, 'export const name = "b";\n')

    reloader = new PluginHotReloader(cache, { debounceMs: 50 })
    const onReload = vi.fn()
    reloader.onReload(onReload)
    reloader.watch([fileA, fileB])

    writeFileSync(fileA, 'export const name = "a2";\n')

    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(onReload).toHaveBeenCalled()

    rmSync(tmpDir, { recursive: true, force: true })
  })
})
