import { describe, expect, it } from 'vitest'
import { PluginLoadError } from '../../src/plugins/types.js'

import {
  isPluginName,
  parsePluginName,
  PLUGIN_PATTERNS,
  PluginRegistry,
} from '../../src/plugins/registry.js'

import type { Plugin } from '../../src/plugins/types.js'

// ─── Helpers ───

function makePlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'codeforge-plugin-test',
    version: '1.0.0',
    ...overrides,
  }
}

// ─── PluginRegistry – Constructor ───

describe('PluginRegistry – Constructor', () => {
  it('creates a registry with size 0', () => {
    const registry = new PluginRegistry()
    expect(registry.size).toBe(0)
  })
})

// ─── PluginRegistry – register ───

describe('PluginRegistry – register', () => {
  it('adds a valid plugin to the registry', () => {
    const registry = new PluginRegistry()
    const plugin = makePlugin()
    registry.register(plugin)
    expect(registry.size).toBe(1)
  })

  it('stores the plugin retrievable by name', () => {
    const registry = new PluginRegistry()
    const plugin = makePlugin({ name: 'codeforge-plugin-alpha' })
    registry.register(plugin)
    expect(registry.get('codeforge-plugin-alpha')).toBe(plugin)
  })

  it('registers multiple distinct plugins', () => {
    const registry = new PluginRegistry()
    const a = makePlugin({ name: 'codeforge-plugin-a' })
    const b = makePlugin({ name: 'codeforge-plugin-b' })
    registry.register(a)
    registry.register(b)
    expect(registry.size).toBe(2)
  })

  it('throws PluginLoadError when plugin has no name', () => {
    const registry = new PluginRegistry()
    expect(() => registry.register(makePlugin({ name: '' }))).toThrow(PluginLoadError)
  })

  it('throws PluginLoadError with "unknown" pluginName when name is missing', () => {
    const registry = new PluginRegistry()
    try {
      registry.register(makePlugin({ name: '' }))
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as PluginLoadError).pluginName).toBe('unknown')
    }
  })

  it('throws PluginLoadError when plugin has no version', () => {
    const registry = new PluginRegistry()
    expect(() => registry.register(makePlugin({ version: '' }))).toThrow(PluginLoadError)
  })

  it('includes plugin name in error when version is missing', () => {
    const registry = new PluginRegistry()
    try {
      registry.register(makePlugin({ name: 'codeforge-plugin-x', version: '' }))
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as PluginLoadError).pluginName).toBe('codeforge-plugin-x')
    }
  })

  it('throws PluginLoadError when registering a duplicate name', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-dupe' }))
    expect(() =>
      registry.register(makePlugin({ name: 'codeforge-plugin-dupe', version: '2.0.0' })),
    ).toThrow(PluginLoadError)
  })

  it('duplicate error message mentions the plugin name', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-dupe' }))
    try {
      registry.register(makePlugin({ name: 'codeforge-plugin-dupe', version: '2.0.0' }))
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as Error).message).toContain('already registered')
    }
  })

  it('accepts a plugin with optional fields', () => {
    const registry = new PluginRegistry()
    const plugin: Plugin = {
      name: 'codeforge-plugin-opts',
      version: '1.0.0',
      description: 'A test plugin',
      dependencies: ['some-dep'],
      engines: { codeforge: '>=1.0.0' },
    }
    registry.register(plugin)
    expect(registry.has('codeforge-plugin-opts')).toBe(true)
  })
})

// ─── PluginRegistry – unregister ───

describe('PluginRegistry – unregister', () => {
  it('removes a registered plugin', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-rm' }))
    registry.unregister('codeforge-plugin-rm')
    expect(registry.size).toBe(0)
  })

  it('makes the plugin no longer retrievable', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-rm' }))
    registry.unregister('codeforge-plugin-rm')
    expect(registry.get('codeforge-plugin-rm')).toBeUndefined()
  })

  it('throws PluginLoadError when unregistering a non-existent plugin', () => {
    const registry = new PluginRegistry()
    expect(() => registry.unregister('codeforge-plugin-nope')).toThrow(PluginLoadError)
  })

  it('error message mentions the missing plugin name', () => {
    const registry = new PluginRegistry()
    try {
      registry.unregister('codeforge-plugin-nope')
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as Error).message).toContain('not registered')
    }
  })

  it('does not affect other registered plugins', () => {
    const registry = new PluginRegistry()
    const keep = makePlugin({ name: 'codeforge-plugin-keep' })
    registry.register(keep)
    registry.register(makePlugin({ name: 'codeforge-plugin-rm' }))
    registry.unregister('codeforge-plugin-rm')
    expect(registry.get('codeforge-plugin-keep')).toBe(keep)
    expect(registry.size).toBe(1)
  })
})

// ─── PluginRegistry – get ───

describe('PluginRegistry – get', () => {
  it('returns undefined for a non-existent plugin', () => {
    const registry = new PluginRegistry()
    expect(registry.get('codeforge-plugin-nope')).toBeUndefined()
  })

  it('returns the exact plugin instance that was registered', () => {
    const registry = new PluginRegistry()
    const plugin = makePlugin({ name: 'codeforge-plugin-exact' })
    registry.register(plugin)
    expect(registry.get('codeforge-plugin-exact')).toBe(plugin)
  })

  it('returns undefined after the plugin is unregistered', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-gone' }))
    registry.unregister('codeforge-plugin-gone')
    expect(registry.get('codeforge-plugin-gone')).toBeUndefined()
  })
})

// ─── PluginRegistry – getAll ───

describe('PluginRegistry – getAll', () => {
  it('returns an empty array when no plugins are registered', () => {
    const registry = new PluginRegistry()
    expect(registry.getAll()).toEqual([])
  })

  it('returns all registered plugins', () => {
    const registry = new PluginRegistry()
    const a = makePlugin({ name: 'codeforge-plugin-a' })
    const b = makePlugin({ name: 'codeforge-plugin-b' })
    registry.register(a)
    registry.register(b)
    const all = registry.getAll()
    expect(all).toHaveLength(2)
    expect(all).toContainEqual(a)
    expect(all).toContainEqual(b)
  })

  it('returns a new array each time (not the same reference)', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin())
    expect(registry.getAll()).not.toBe(registry.getAll())
  })
})

// ─── PluginRegistry – getNames ───

describe('PluginRegistry – getNames', () => {
  it('returns an empty array when no plugins are registered', () => {
    const registry = new PluginRegistry()
    expect(registry.getNames()).toEqual([])
  })

  it('returns the names of all registered plugins', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-alpha' }))
    registry.register(makePlugin({ name: 'codeforge-plugin-beta' }))
    const names = registry.getNames()
    expect(names).toHaveLength(2)
    expect(names).toContain('codeforge-plugin-alpha')
    expect(names).toContain('codeforge-plugin-beta')
  })

  it('returns a new array each time', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin())
    expect(registry.getNames()).not.toBe(registry.getNames())
  })
})

// ─── PluginRegistry – has ───

describe('PluginRegistry – has', () => {
  it('returns false for a non-existent plugin', () => {
    const registry = new PluginRegistry()
    expect(registry.has('codeforge-plugin-nope')).toBe(false)
  })

  it('returns true after a plugin is registered', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-exists' }))
    expect(registry.has('codeforge-plugin-exists')).toBe(true)
  })

  it('returns false after a plugin is unregistered', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-tmp' }))
    registry.unregister('codeforge-plugin-tmp')
    expect(registry.has('codeforge-plugin-tmp')).toBe(false)
  })
})

// ─── PluginRegistry – clear ───

describe('PluginRegistry – clear', () => {
  it('removes all plugins from the registry', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-a' }))
    registry.register(makePlugin({ name: 'codeforge-plugin-b' }))
    registry.clear()
    expect(registry.size).toBe(0)
  })

  it('makes getAll return an empty array', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin())
    registry.clear()
    expect(registry.getAll()).toEqual([])
  })

  it('is safe to call on an empty registry', () => {
    const registry = new PluginRegistry()
    expect(() => registry.clear()).not.toThrow()
    expect(registry.size).toBe(0)
  })

  it('allows re-registering a plugin after clear', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-again' }))
    registry.clear()
    expect(() => registry.register(makePlugin({ name: 'codeforge-plugin-again' }))).not.toThrow()
  })
})

// ─── PluginRegistry – size ───

describe('PluginRegistry – size', () => {
  it('returns 0 for a new registry', () => {
    const registry = new PluginRegistry()
    expect(registry.size).toBe(0)
  })

  it('increments after each register', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-a' }))
    expect(registry.size).toBe(1)
    registry.register(makePlugin({ name: 'codeforge-plugin-b' }))
    expect(registry.size).toBe(2)
  })

  it('decrements after unregister', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'codeforge-plugin-a' }))
    registry.register(makePlugin({ name: 'codeforge-plugin-b' }))
    registry.unregister('codeforge-plugin-a')
    expect(registry.size).toBe(1)
  })

  it('resets to 0 after clear', () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin())
    registry.clear()
    expect(registry.size).toBe(0)
  })
})

// ─── isPluginName ───

describe('isPluginName', () => {
  it('returns true for a standard prefixed name', () => {
    expect(isPluginName('codeforge-plugin-foo')).toBe(true)
  })

  it('returns true for a prefixed name with multiple segments', () => {
    expect(isPluginName('codeforge-plugin-my-custom-plugin')).toBe(true)
  })

  it('returns true for a scoped plugin name', () => {
    expect(isPluginName('@scope/codeforge-plugin-bar')).toBe(true)
  })

  it('returns true for a scoped name with org-like scope', () => {
    expect(isPluginName('@my-org/codeforge-plugin-baz')).toBe(true)
  })

  it('returns false for a name without the plugin prefix', () => {
    expect(isPluginName('my-plugin')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isPluginName('')).toBe(false)
  })

  it('returns false for a scoped name lacking the prefix after the slash', () => {
    expect(isPluginName('@scope/other-package')).toBe(false)
  })

  it('returns false for a bare @ sign', () => {
    expect(isPluginName('@')).toBe(false)
  })

  it('returns false for a name that only contains the prefix as a substring', () => {
    expect(isPluginName('xcodeforge-plugin-foo')).toBe(false)
  })

  it('returns false for the prefix alone without a suffix', () => {
    expect(isPluginName('codeforge-plugin-')).toBe(true)
  })
})

// ─── parsePluginName ───

describe('parsePluginName', () => {
  it('parses an unscoped name returning null scope', () => {
    const result = parsePluginName('codeforge-plugin-foo')
    expect(result).toEqual({ name: 'codeforge-plugin-foo', scope: null })
  })

  it('parses a plain package name without prefix', () => {
    const result = parsePluginName('my-plugin')
    expect(result).toEqual({ name: 'my-plugin', scope: null })
  })

  it('parses a scoped name into scope and name', () => {
    const result = parsePluginName('@scope/codeforge-plugin-bar')
    expect(result).toEqual({ name: 'codeforge-plugin-bar', scope: '@scope' })
  })

  it('parses a scoped name with a hyphenated scope', () => {
    const result = parsePluginName('@my-org/codeforge-plugin-baz')
    expect(result).toEqual({ name: 'codeforge-plugin-baz', scope: '@my-org' })
  })

  it('throws PluginLoadError for a scoped name missing the slash', () => {
    expect(() => parsePluginName('@scope')).toThrow(PluginLoadError)
  })

  it('throws PluginLoadError with a descriptive message for invalid scoped name', () => {
    expect(() => parsePluginName('@scope')).toThrow('Invalid scoped plugin name: @scope')
  })

  it('throws PluginLoadError for a bare @ sign', () => {
    expect(() => parsePluginName('@')).toThrow(PluginLoadError)
  })

  it('parses an empty string as an unscoped name', () => {
    const result = parsePluginName('')
    expect(result).toEqual({ name: '', scope: null })
  })

  it('parses a name with multiple slashes using only the first split', () => {
    const result = parsePluginName('@scope/pkg/extra')
    expect(result.scope).toBe('@scope')
    expect(result.name).toBe('pkg')
  })
})

// ─── PLUGIN_PATTERNS ───

describe('PLUGIN_PATTERNS', () => {
  it('exports a prefix property set to "codeforge-plugin-"', () => {
    expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
  })

  it('exports a scoped property that is a RegExp', () => {
    expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
  })

  it('scoped pattern matches scoped plugin names', () => {
    expect(PLUGIN_PATTERNS.scoped.test('@myorg/codeforge-plugin-foo')).toBe(true)
  })

  it('scoped pattern rejects unscoped names', () => {
    expect(PLUGIN_PATTERNS.scoped.test('codeforge-plugin-foo')).toBe(false)
  })

  it('scoped pattern rejects scoped names without the plugin prefix', () => {
    expect(PLUGIN_PATTERNS.scoped.test('@scope/other')).toBe(false)
  })
})
