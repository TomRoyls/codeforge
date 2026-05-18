import { describe, expect, it } from 'vitest'
import { PluginRegistry } from '../../../src/core/plugin-lifecycle/plugin-registry.js'
import type { PluginInfo } from '../../../src/core/plugin-lifecycle/types.js'

// ─── Helpers ───

function makePlugin(overrides: Partial<PluginInfo> & { name: string }): PluginInfo {
  return {
    version: overrides.version ?? '1.0.0',
    description: overrides.description ?? `Plugin ${overrides.name}`,
    author: overrides.author ?? 'test',
    dependencies: overrides.dependencies ?? new Map(),
    entryPoint: overrides.entryPoint ?? './index.js',
    homepage: overrides.homepage,
    license: overrides.license ?? 'MIT',
    installedAt: overrides.installedAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now(),
    state: overrides.state ?? 'installed',
    ...overrides,
  }
}

// ─── Construction ───

describe('PluginRegistry construction', () => {
  it('starts empty', () => {
    const reg = new PluginRegistry()
    expect(reg.getSize()).toBe(0)
  })

  it('getAll returns empty array when empty', () => {
    const reg = new PluginRegistry()
    expect(reg.getAll()).toEqual([])
  })

  it('exists returns false for any name', () => {
    const reg = new PluginRegistry()
    expect(reg.exists('anything')).toBe(false)
  })
})

// ─── register() ───

describe('PluginRegistry register', () => {
  it('registers a plugin and returns true', () => {
    const reg = new PluginRegistry()
    const result = reg.register(makePlugin({ name: 'alpha' }))
    expect(result).toBe(true)
    expect(reg.getSize()).toBe(1)
  })

  it('stores plugin with default config and disabled state', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    const entry = reg.get('alpha')!
    expect(entry.plugin.name).toBe('alpha')
    expect(entry.config).toEqual({})
    expect(entry.enabled).toBe(false)
    expect(entry.loadOrder).toBe(0)
  })

  it('rejects duplicate registration returning false', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    expect(reg.register(makePlugin({ name: 'alpha' }))).toBe(false)
    expect(reg.getSize()).toBe(1)
  })

  it('assigns incrementing loadOrder', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    reg.register(makePlugin({ name: 'c' }))
    expect(reg.get('a')!.loadOrder).toBe(0)
    expect(reg.get('b')!.loadOrder).toBe(1)
    expect(reg.get('c')!.loadOrder).toBe(2)
  })

  it('preserves plugin data', () => {
    const reg = new PluginRegistry()
    const deps = new Map([['core', '^2.0.0']])
    reg.register(makePlugin({ name: 'alpha', version: '3.1.0', author: 'me', dependencies: deps, license: 'Apache-2.0' }))
    const entry = reg.get('alpha')!
    expect(entry.plugin.version).toBe('3.1.0')
    expect(entry.plugin.author).toBe('me')
    expect(entry.plugin.dependencies).toBe(deps)
    expect(entry.plugin.license).toBe('Apache-2.0')
  })
})

// ─── unregister() ───

describe('PluginRegistry unregister', () => {
  it('removes a plugin and returns true', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    expect(reg.unregister('alpha')).toBe(true)
    expect(reg.getSize()).toBe(0)
    expect(reg.get('alpha')).toBeNull()
  })

  it('returns false for non-existent plugin', () => {
    const reg = new PluginRegistry()
    expect(reg.unregister('missing')).toBe(false)
  })

  it('does not affect other plugins', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    reg.unregister('a')
    expect(reg.exists('a')).toBe(false)
    expect(reg.exists('b')).toBe(true)
  })
})

// ─── get() ───

describe('PluginRegistry get', () => {
  it('returns entry for registered plugin', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    const entry = reg.get('alpha')
    expect(entry).not.toBeNull()
    expect(entry!.plugin.name).toBe('alpha')
  })

  it('returns null for non-existent plugin', () => {
    const reg = new PluginRegistry()
    expect(reg.get('nope')).toBeNull()
  })

  it('returns null after unregister', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    reg.unregister('alpha')
    expect(reg.get('alpha')).toBeNull()
  })
})

// ─── getAll() ───

describe('PluginRegistry getAll', () => {
  it('returns all registered entries', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    const all = reg.getAll()
    expect(all).toHaveLength(2)
    expect(all.map((e) => e.plugin.name)).toContain('a')
    expect(all.map((e) => e.plugin.name)).toContain('b')
  })

  it('returns empty after clear', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.clear()
    expect(reg.getAll()).toEqual([])
  })
})

// ─── find() ───

describe('PluginRegistry find', () => {
  it('filters entries by predicate', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a', author: 'alice' }))
    reg.register(makePlugin({ name: 'b', author: 'bob' }))
    reg.register(makePlugin({ name: 'c', author: 'alice' }))
    const alice = reg.find((e) => e.plugin.author === 'alice')
    expect(alice).toHaveLength(2)
    expect(alice.every((e) => e.plugin.author === 'alice')).toBe(true)
  })

  it('returns empty array when no matches', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    expect(reg.find((e) => e.plugin.name === 'missing')).toEqual([])
  })

  it('finds by enabled state', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    reg.updateEntry('a', { enabled: true })
    const enabled = reg.find((e) => e.enabled)
    expect(enabled).toHaveLength(1)
    expect(enabled[0]!.plugin.name).toBe('a')
  })
})

// ─── exists() ───

describe('PluginRegistry exists', () => {
  it('returns true for registered plugin', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    expect(reg.exists('alpha')).toBe(true)
  })

  it('returns false before registration', () => {
    const reg = new PluginRegistry()
    expect(reg.exists('alpha')).toBe(false)
  })

  it('returns false after unregister', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'alpha' }))
    reg.unregister('alpha')
    expect(reg.exists('alpha')).toBe(false)
  })
})

// ─── getSize() ───

describe('PluginRegistry getSize', () => {
  it('tracks size across operations', () => {
    const reg = new PluginRegistry()
    expect(reg.getSize()).toBe(0)
    reg.register(makePlugin({ name: 'a' }))
    expect(reg.getSize()).toBe(1)
    reg.register(makePlugin({ name: 'b' }))
    expect(reg.getSize()).toBe(2)
    reg.unregister('a')
    expect(reg.getSize()).toBe(1)
  })
})

// ─── updateEntry() ───

describe('PluginRegistry updateEntry', () => {
  it('updates config', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    expect(reg.updateEntry('a', { config: { debug: true } })).toBe(true)
    expect(reg.get('a')!.config).toEqual({ debug: true })
  })

  it('updates enabled', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    expect(reg.updateEntry('a', { enabled: true })).toBe(true)
    expect(reg.get('a')!.enabled).toBe(true)
  })

  it('updates loadOrder', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    expect(reg.updateEntry('a', { loadOrder: 99 })).toBe(true)
    expect(reg.get('a')!.loadOrder).toBe(99)
  })

  it('updates multiple fields at once', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.updateEntry('a', { enabled: true, config: { x: 1 }, loadOrder: 42 })
    const entry = reg.get('a')!
    expect(entry.enabled).toBe(true)
    expect(entry.config).toEqual({ x: 1 })
    expect(entry.loadOrder).toBe(42)
  })

  it('returns false for non-existent plugin', () => {
    const reg = new PluginRegistry()
    expect(reg.updateEntry('missing', { enabled: true })).toBe(false)
  })

  it('only updates provided fields', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.updateEntry('a', { enabled: true })
    const entry = reg.get('a')!
    expect(entry.enabled).toBe(true)
    expect(entry.config).toEqual({})
    expect(entry.loadOrder).toBe(0)
  })
})

// ─── updatePlugin() ───

describe('PluginRegistry updatePlugin', () => {
  it('replaces plugin info', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a', version: '1.0.0' }))
    const updated = makePlugin({ name: 'a', version: '2.0.0' })
    expect(reg.updatePlugin('a', updated)).toBe(true)
    expect(reg.get('a')!.plugin.version).toBe('2.0.0')
  })

  it('preserves entry config and enabled state', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.updateEntry('a', { enabled: true, config: { k: 'v' } })
    reg.updatePlugin('a', makePlugin({ name: 'a', version: '2.0.0' }))
    const entry = reg.get('a')!
    expect(entry.enabled).toBe(true)
    expect(entry.config).toEqual({ k: 'v' })
    expect(entry.plugin.version).toBe('2.0.0')
  })

  it('returns false for non-existent plugin', () => {
    const reg = new PluginRegistry()
    expect(reg.updatePlugin('missing', makePlugin({ name: 'missing' }))).toBe(false)
  })
})

// ─── clear() ───

describe('PluginRegistry clear', () => {
  it('removes all entries', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    reg.clear()
    expect(reg.getSize()).toBe(0)
    expect(reg.getAll()).toEqual([])
  })

  it('resets loadOrder counter', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.register(makePlugin({ name: 'b' }))
    reg.clear()
    reg.register(makePlugin({ name: 'c' }))
    expect(reg.get('c')!.loadOrder).toBe(0)
  })

  it('allows re-registration after clear', () => {
    const reg = new PluginRegistry()
    reg.register(makePlugin({ name: 'a' }))
    reg.clear()
    expect(reg.register(makePlugin({ name: 'a' }))).toBe(true)
  })
})
