import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PluginRegistry, isPluginName, parsePluginName, PLUGIN_PATTERNS } from '../src/plugins/registry.js'
import { PluginLoadError } from '../src/plugins/types.js'
import type { Plugin } from '../src/plugins/types.js'

// ─── Helpers ──────────────────────────────────────────
function makePlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  }
}

function makeTempDir(): string {
  const dir = join(tmpdir(), `registry-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

function makeRule() {
  return {
    meta: { description: 'test rule', severity: 'warning' as const },
    create: vi.fn(() => ({})),
  }
}

// ─── Constructor ──────────────────────────────────────
describe('PluginRegistry', () => {
  it('starts with size 0', () => {
    const reg = new PluginRegistry()
    expect(reg.size).toBe(0)
  })

  // ─── register ─────────────────────────────────────
  it('registers a plugin', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin())
    expect(reg.size).toBe(1)
  })

  it('stores plugin by name', () => {
    const reg = new PluginRegistry()
    const plugin = makePlugin({ name: 'my-plugin' })
    reg.register(plugin)
    expect(reg.get('my-plugin')).toBe(plugin)
  })

  it('throws for plugin without name', () => {
    const reg = new PluginRegistry()
    expect(() => reg.register({ version: '1.0.0' } as Plugin)).toThrow(PluginLoadError)
  })

  it('throws for plugin without version', () => {
    const reg = new PluginRegistry()
    expect(() => reg.register({ name: 'test' } as Plugin)).toThrow(PluginLoadError)
  })

  it('throws for duplicate registration', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin())
    expect(() => reg.register(makePlugin())).toThrow(PluginLoadError)
  })

  // ─── unregister ───────────────────────────────────
  it('unregisters a plugin', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'p1' }))
    reg.unregister('p1')
    expect(reg.size).toBe(0)
  })

  it('throws when unregistering non-existent plugin', () => {
    const reg = new PluginRegistry()
    expect(() => reg.unregister('nonexistent')).toThrow(PluginLoadError)
  })

  // ─── has ──────────────────────────────────────────
  it('has returns true for registered plugin', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin())
    expect(reg.has('test-plugin')).toBe(true)
  })

  it('has returns false for unregistered plugin', () => {
    const reg = new PluginRegistry()
    expect(reg.has('nonexistent')).toBe(false)
  })

  // ─── get ──────────────────────────────────────────
  it('get returns undefined for unregistered', () => {
    const reg = new PluginRegistry()
    expect(reg.get('nonexistent')).toBeUndefined()
  })

  // ─── getAll / getNames ────────────────────────────
  it('getAll returns all plugins', () => {
    const reg = new PluginRegistry()
    const p1 = makePlugin({ name: 'p1' })
    const p2 = makePlugin({ name: 'p2' })
    reg.register(p1)
    reg.register(p2)
    expect(reg.getAll()).toEqual([p1, p2])
  })

  it('getNames returns all names', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'p1' }))
    reg.register(makePlugin({ name: 'p2' }))
    expect(reg.getNames()).toEqual(['p1', 'p2'])
  })

  // ─── clear ────────────────────────────────────────
  it('clear removes all plugins', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'p1' }))
    reg.register(makePlugin({ name: 'p2' }))
    reg.clear()
    expect(reg.size).toBe(0)
  })

  // ─── discover ─────────────────────────────────────
  it('discover returns empty for directory without node_modules', async () => {
    const reg = new PluginRegistry()
    const tmp = makeTempDir()
    const result = await reg.discover(tmp)
    expect(result).toEqual([])
    rmSync(tmp, { recursive: true, force: true })
  })

  it('discover finds plugins in node_modules', async () => {
    const reg = new PluginRegistry()
    const tmp = makeTempDir()
    const nm = join(tmp, 'node_modules')
    mkdirSync(join(nm, 'codeforge-plugin-foo'), { recursive: true })
    writeFileSync(join(nm, 'codeforge-plugin-foo', 'package.json'), JSON.stringify({ name: 'codeforge-plugin-foo', version: '1.0.0', main: 'index.js' }))

    const result = await reg.discover(tmp)
    expect(result).toContain('codeforge-plugin-foo')

    rmSync(tmp, { recursive: true, force: true })
  })

  it('discover skips non-plugin packages', async () => {
    const reg = new PluginRegistry()
    const tmp = makeTempDir()
    const nm = join(tmp, 'node_modules')
    mkdirSync(join(nm, 'lodash'), { recursive: true })

    const result = await reg.discover(tmp)
    expect(result).not.toContain('lodash')

    rmSync(tmp, { recursive: true, force: true })
  })

  it('discover finds scoped plugins', async () => {
    const reg = new PluginRegistry()
    const tmp = makeTempDir()
    const nm = join(tmp, 'node_modules')
    mkdirSync(join(nm, '@myorg', 'codeforge-plugin-bar'), { recursive: true })
    writeFileSync(join(nm, '@myorg', 'codeforge-plugin-bar', 'package.json'), JSON.stringify({ name: '@myorg/codeforge-plugin-bar', version: '1.0.0', main: 'index.js' }))

    const result = await reg.discover(tmp)
    expect(result).toContain('@myorg/codeforge-plugin-bar')

    rmSync(tmp, { recursive: true, force: true })
  })

  it('discover skips already-registered plugins', async () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'codeforge-plugin-foo' }))
    const tmp = makeTempDir()
    const nm = join(tmp, 'node_modules')
    mkdirSync(join(nm, 'codeforge-plugin-foo'), { recursive: true })

    const result = await reg.discover(tmp)
    expect(result).not.toContain('codeforge-plugin-foo')

    rmSync(tmp, { recursive: true, force: true })
  })

  // ─── discoverAndValidate ──────────────────────────
  it('discoverAndValidate returns valid and invalid', async () => {
    const reg = new PluginRegistry()
    const tmp = makeTempDir()
    const nm = join(tmp, 'node_modules')

    mkdirSync(join(nm, 'codeforge-plugin-good'), { recursive: true })
    writeFileSync(join(nm, 'codeforge-plugin-good', 'package.json'), JSON.stringify({ name: 'codeforge-plugin-good', version: '1.0.0', main: 'index.js' }))

    mkdirSync(join(nm, 'codeforge-plugin-bad'), { recursive: true })
    writeFileSync(join(nm, 'codeforge-plugin-bad', 'package.json'), 'invalid json')

    const result = await reg.discoverAndValidate(tmp)
    expect(result.valid).toContain('codeforge-plugin-good')
    expect(result.invalid.some(i => i.name === 'codeforge-plugin-bad')).toBe(true)

    rmSync(tmp, { recursive: true, force: true })
  })
})

// ─── isPluginName (module-level) ──────────────────────
describe('isPluginName (registry)', () => {
  it('recognizes codeforge-plugin- prefix', () => {
    expect(isPluginName('codeforge-plugin-foo')).toBe(true)
  })

  it('recognizes scoped plugin', () => {
    expect(isPluginName('@scope/codeforge-plugin-bar')).toBe(true)
  })

  it('rejects random package', () => {
    expect(isPluginName('lodash')).toBe(false)
  })
})

// ─── parsePluginName (module-level) ───────────────────
describe('parsePluginName (registry)', () => {
  it('parses unscoped', () => {
    expect(parsePluginName('codeforge-plugin-foo')).toEqual({ name: 'codeforge-plugin-foo', scope: null })
  })

  it('parses scoped', () => {
    expect(parsePluginName('@scope/codeforge-plugin-foo')).toEqual({ name: 'codeforge-plugin-foo', scope: '@scope' })
  })

  it('throws for empty after slash', () => {
    expect(() => parsePluginName('@scope/')).toThrow(PluginLoadError)
  })
})

// ─── PLUGIN_PATTERNS (module-level) ───────────────────
describe('PLUGIN_PATTERNS (registry)', () => {
  it('has prefix', () => {
    expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
  })

  it('has scoped regex', () => {
    expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
  })
})
