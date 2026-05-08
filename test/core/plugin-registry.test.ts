import { describe, it, expect } from 'vitest'
import { PluginMetadataHelper } from '../../src/core/plugin-registry/plugin-metadata.js'
import { PluginRegistry } from '../../src/core/plugin-registry/plugin-registry.js'
import type { PluginMetadata, PluginState } from '../../src/core/plugin-registry/types.js'

function createMetadata(overrides: Partial<PluginMetadata> = {}): PluginMetadata {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'test-author',
    dependencies: [],
    tags: [],
    license: 'MIT',
    ...overrides,
  }
}

describe('PluginMetadataHelper', () => {
  const helper = new PluginMetadataHelper()

  describe('validate', () => {
    it('should return no errors for valid metadata', () => {
      const errors = helper.validate(createMetadata())
      expect(errors).toHaveLength(0)
    })

    it('should return error for missing name', () => {
      const errors = helper.validate(createMetadata({ name: '' }))
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.includes('name'))).toBe(true)
    })

    it('should return error for undefined name', () => {
      const errors = helper.validate({ version: '1.0.0' })
      expect(errors.some(e => e.includes('name'))).toBe(true)
    })

    it('should return error for whitespace-only name', () => {
      const errors = helper.validate(createMetadata({ name: '   ' }))
      expect(errors.some(e => e.includes('name'))).toBe(true)
    })

    it('should return error for bad version format', () => {
      const errors = helper.validate(createMetadata({ version: 'not-semver' }))
      expect(errors.some(e => e.includes('semver'))).toBe(true)
    })

    it('should return error for missing version', () => {
      const errors = helper.validate({ name: 'test' })
      expect(errors.some(e => e.includes('Version'))).toBe(true)
    })

    it('should return error for two-part version', () => {
      const errors = helper.validate(createMetadata({ version: '1.0' }))
      expect(errors.some(e => e.includes('semver'))).toBe(true)
    })

    it('should return error for four-part version', () => {
      const errors = helper.validate(createMetadata({ version: '1.0.0.0' }))
      expect(errors.some(e => e.includes('semver'))).toBe(true)
    })

    it('should return error for empty dependency name', () => {
      const errors = helper.validate(createMetadata({ dependencies: ['', 'valid-dep'] }))
      expect(errors.some(e => e.includes('Dependency'))).toBe(true)
    })

    it('should return error for whitespace dependency', () => {
      const errors = helper.validate(createMetadata({ dependencies: ['  '] }))
      expect(errors.some(e => e.includes('Dependency'))).toBe(true)
    })

    it('should accept valid dependencies', () => {
      const errors = helper.validate(createMetadata({ dependencies: ['dep-a', 'dep-b'] }))
      expect(errors).toHaveLength(0)
    })

    it('should accept no dependencies', () => {
      const errors = helper.validate(createMetadata({ dependencies: [] }))
      expect(errors).toHaveLength(0)
    })

    it('should collect multiple errors at once', () => {
      const errors = helper.validate(createMetadata({ name: '', version: 'bad' }))
      expect(errors.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(helper.compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('should return -1 when first is lower major', () => {
      expect(helper.compareVersions('1.0.0', '2.0.0')).toBe(-1)
    })

    it('should return 1 when first is higher major', () => {
      expect(helper.compareVersions('2.0.0', '1.0.0')).toBe(1)
    })

    it('should return -1 when first is lower minor', () => {
      expect(helper.compareVersions('1.0.0', '1.1.0')).toBe(-1)
    })

    it('should return 1 when first is higher minor', () => {
      expect(helper.compareVersions('1.2.0', '1.1.0')).toBe(1)
    })

    it('should return -1 when first is lower patch', () => {
      expect(helper.compareVersions('1.0.0', '1.0.1')).toBe(-1)
    })

    it('should return 1 when first is higher patch', () => {
      expect(helper.compareVersions('1.0.2', '1.0.1')).toBe(1)
    })

    it('should handle major over minor', () => {
      expect(helper.compareVersions('2.0.0', '1.9.9')).toBe(1)
    })

    it('should handle minor over patch', () => {
      expect(helper.compareVersions('1.1.0', '1.0.9')).toBe(1)
    })
  })

  describe('satisfiesVersion', () => {
    it('should return true for exact match', () => {
      expect(helper.satisfiesVersion('1.0.0', '1.0.0')).toBe(true)
    })

    it('should return false for different major', () => {
      expect(helper.satisfiesVersion('1.0.0', '2.0.0')).toBe(false)
    })

    it('should return false for different minor', () => {
      expect(helper.satisfiesVersion('1.0.0', '1.1.0')).toBe(false)
    })

    it('should return false for different patch', () => {
      expect(helper.satisfiesVersion('1.0.0', '1.0.1')).toBe(false)
    })

    it('should return false for invalid required', () => {
      expect(helper.satisfiesVersion('not-valid', '1.0.0')).toBe(false)
    })

    it('should return false for invalid actual', () => {
      expect(helper.satisfiesVersion('1.0.0', 'not-valid')).toBe(false)
    })

    it('should return false for both invalid', () => {
      expect(helper.satisfiesVersion('bad', 'bad')).toBe(false)
    })
  })

  describe('extractDeps', () => {
    it('should return empty array for no dependencies', () => {
      const result = helper.extractDeps(createMetadata({ dependencies: [] }))
      expect(result).toEqual([])
    })

    it('should return copy of dependencies array', () => {
      const deps = ['dep-a', 'dep-b']
      const result = helper.extractDeps(createMetadata({ dependencies: deps }))
      expect(result).toEqual(['dep-a', 'dep-b'])
      expect(result).not.toBe(deps)
    })

    it('should return all dependencies', () => {
      const result = helper.extractDeps(createMetadata({ dependencies: ['a', 'b', 'c'] }))
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('createFromObject', () => {
    it('should create metadata with all defaults', () => {
      const result = helper.createFromObject({})
      expect(result).toEqual({
        name: '',
        version: '1.0.0',
        description: '',
        author: '',
        dependencies: [],
        tags: [],
        license: 'MIT',
      })
    })

    it('should preserve provided name', () => {
      const result = helper.createFromObject({ name: 'my-plugin' })
      expect(result.name).toBe('my-plugin')
    })

    it('should preserve provided version', () => {
      const result = helper.createFromObject({ version: '2.0.0' })
      expect(result.version).toBe('2.0.0')
    })

    it('should preserve provided description', () => {
      const result = helper.createFromObject({ description: 'desc' })
      expect(result.description).toBe('desc')
    })

    it('should preserve provided author', () => {
      const result = helper.createFromObject({ author: 'author' })
      expect(result.author).toBe('author')
    })

    it('should preserve provided dependencies', () => {
      const result = helper.createFromObject({ dependencies: ['a'] })
      expect(result.dependencies).toEqual(['a'])
    })

    it('should preserve provided tags', () => {
      const result = helper.createFromObject({ tags: ['tag1'] })
      expect(result.tags).toEqual(['tag1'])
    })

    it('should preserve provided homepage', () => {
      const result = helper.createFromObject({ homepage: 'https://example.com' })
      expect(result.homepage).toBe('https://example.com')
    })

    it('should not set homepage by default', () => {
      const result = helper.createFromObject({})
      expect(result.homepage).toBeUndefined()
    })

    it('should preserve provided license', () => {
      const result = helper.createFromObject({ license: 'Apache-2.0' })
      expect(result.license).toBe('Apache-2.0')
    })

    it('should create full metadata from partial', () => {
      const result = helper.createFromObject({ name: 'p', version: '3.0.0', tags: ['t'] })
      expect(result.name).toBe('p')
      expect(result.version).toBe('3.0.0')
      expect(result.tags).toEqual(['t'])
      expect(result.license).toBe('MIT')
    })
  })
})

describe('PluginRegistry', () => {
  describe('register', () => {
    it('should register a valid plugin', () => {
      const registry = new PluginRegistry()
      const entry = registry.register(createMetadata())
      expect(entry.state).toBe('discovered')
      expect(entry.metadata.name).toBe('test-plugin')
    })

    it('should throw on duplicate name without allowConflicts', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      expect(() => registry.register(createMetadata())).toThrow('already registered')
    })

    it('should allow duplicate with allowConflicts', () => {
      const registry = new PluginRegistry({ allowConflicts: true })
      registry.register(createMetadata())
      const entry = registry.register(createMetadata())
      expect(entry.metadata.name).toBe('test-plugin')
    })

    it('should throw on invalid metadata (empty name)', () => {
      const registry = new PluginRegistry()
      expect(() => registry.register(createMetadata({ name: '' }))).toThrow('name')
    })

    it('should throw on invalid version', () => {
      const registry = new PluginRegistry()
      expect(() => registry.register(createMetadata({ version: 'bad' }))).toThrow('semver')
    })

    it('should throw when maxPlugins reached', () => {
      const registry = new PluginRegistry({ maxPlugins: 2 })
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      expect(() => registry.register(createMetadata({ name: 'c' }))).toThrow('Maximum')
    })

    it('should set loadedAt when state is loaded', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      registry.updateState('test-plugin', 'loaded')
      const entry = registry.get('test-plugin')
      expect(entry!.loadedAt).toBeDefined()
      expect(entry!.loadedAt).toBeGreaterThan(0)
    })
  })

  describe('unregister', () => {
    it('should unregister an existing plugin', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      expect(registry.unregister('test-plugin')).toBe(true)
      expect(registry.has('test-plugin')).toBe(false)
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.unregister('non-existent')).toBe(false)
    })

    it('should allow re-registering after unregister', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      registry.unregister('test-plugin')
      const entry = registry.register(createMetadata())
      expect(entry.metadata.name).toBe('test-plugin')
    })
  })

  describe('get', () => {
    it('should return entry for existing plugin', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      const entry = registry.get('test-plugin')
      expect(entry).toBeDefined()
      expect(entry!.metadata.name).toBe('test-plugin')
    })

    it('should return undefined for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.get('non-existent')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing plugin', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      expect(registry.has('test-plugin')).toBe(true)
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.has('non-existent')).toBe(false)
    })
  })

  describe('getAll', () => {
    it('should return empty array for empty registry', () => {
      const registry = new PluginRegistry()
      expect(registry.getAll()).toEqual([])
    })

    it('should return all registered entries', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      expect(registry.getAll()).toHaveLength(2)
    })

    it('should return entries in insertion order', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'first' }))
      registry.register(createMetadata({ name: 'second' }))
      const all = registry.getAll()
      expect(all[0]!.metadata.name).toBe('first')
      expect(all[1]!.metadata.name).toBe('second')
    })
  })

  describe('getByState', () => {
    it('should filter by discovered state', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      registry.updateState('a', 'loaded')
      const discovered = registry.getByState('discovered')
      expect(discovered).toHaveLength(1)
      expect(discovered[0]!.metadata.name).toBe('b')
    })

    it('should filter by loaded state', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      registry.updateState('a', 'loaded')
      const loaded = registry.getByState('loaded')
      expect(loaded).toHaveLength(1)
      expect(loaded[0]!.metadata.name).toBe('a')
    })

    it('should return empty for state with no plugins', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      expect(registry.getByState('error')).toHaveLength(0)
    })

    it('should return all plugins matching state', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      registry.updateState('a', 'started')
      registry.updateState('b', 'started')
      expect(registry.getByState('started')).toHaveLength(2)
    })
  })

  describe('getByTag', () => {
    it('should filter by tag', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', tags: ['core'] }))
      registry.register(createMetadata({ name: 'b', tags: ['util'] }))
      const core = registry.getByTag('core')
      expect(core).toHaveLength(1)
      expect(core[0]!.metadata.name).toBe('a')
    })

    it('should return empty for non-existent tag', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ tags: ['core'] }))
      expect(registry.getByTag('nonexistent')).toHaveLength(0)
    })

    it('should return plugins with multiple tags matching one', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', tags: ['core', 'utils'] }))
      const result = registry.getByTag('utils')
      expect(result).toHaveLength(1)
    })

    it('should return multiple plugins with same tag', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', tags: ['shared'] }))
      registry.register(createMetadata({ name: 'b', tags: ['shared'] }))
      expect(registry.getByTag('shared')).toHaveLength(2)
    })
  })

  describe('updateState', () => {
    it('should update state', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      expect(registry.updateState('test-plugin', 'loaded')).toBe(true)
      expect(registry.get('test-plugin')!.state).toBe('loaded')
    })

    it('should set error on error state', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      registry.updateState('test-plugin', 'error', 'something broke')
      const entry = registry.get('test-plugin')!
      expect(entry.state).toBe('error')
      expect(entry.error).toBe('something broke')
    })

    it('should set loadedAt when transitioning to loaded', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      registry.updateState('test-plugin', 'loaded')
      expect(registry.get('test-plugin')!.loadedAt).toBeTypeOf('number')
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.updateState('non-existent', 'loaded')).toBe(false)
    })

    it('should clear error when transitioning away from error', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata())
      registry.updateState('test-plugin', 'error', 'fail')
      registry.updateState('test-plugin', 'stopped')
      expect(registry.get('test-plugin')!.error).toBeUndefined()
    })
  })

  describe('resolveDependencies', () => {
    it('should return empty for plugin with no deps', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      expect(registry.resolveDependencies('a')).toEqual([])
    })

    it('should return missing dependencies', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b', 'c'] }))
      expect(registry.resolveDependencies('a')).toEqual(['b', 'c'])
    })

    it('should return only deps not registered', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b', 'c'] }))
      registry.register(createMetadata({ name: 'b' }))
      expect(registry.resolveDependencies('a')).toEqual(['c'])
    })

    it('should return empty when all deps satisfied', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b' }))
      expect(registry.resolveDependencies('a')).toEqual([])
    })

    it('should return empty for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.resolveDependencies('non-existent')).toEqual([])
    })
  })

  describe('resolveAll', () => {
    it('should resolve all plugins', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b' }))
      const result = registry.resolveAll()
      expect(result.get('a')).toEqual([])
      expect(result.get('b')).toEqual([])
    })

    it('should show missing deps across all plugins', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b', dependencies: ['c'] }))
      const result = registry.resolveAll()
      expect(result.get('a')).toEqual([])
      expect(result.get('b')).toEqual(['c'])
    })

    it('should return empty map for empty registry', () => {
      const registry = new PluginRegistry()
      expect(registry.resolveAll().size).toBe(0)
    })
  })

  describe('getLoadOrder', () => {
    it('should return empty for empty registry', () => {
      const registry = new PluginRegistry()
      expect(registry.getLoadOrder()).toEqual([])
    })

    it('should return single plugin with no deps', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      expect(registry.getLoadOrder()).toEqual(['a'])
    })

    it('should order deps before dependents', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b' }))
      const order = registry.getLoadOrder()
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle chain dependencies', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b', dependencies: ['c'] }))
      registry.register(createMetadata({ name: 'c' }))
      const order = registry.getLoadOrder()
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle multiple independent plugins', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      const order = registry.getLoadOrder()
      expect(order).toHaveLength(2)
      expect(order).toContain('a')
      expect(order).toContain('b')
    })

    it('should handle diamond dependency', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b', 'c'] }))
      registry.register(createMetadata({ name: 'b', dependencies: ['d'] }))
      registry.register(createMetadata({ name: 'c', dependencies: ['d'] }))
      registry.register(createMetadata({ name: 'd' }))
      const order = registry.getLoadOrder()
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('c'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('a'))
    })

    it('should detect circular dependencies', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b', dependencies: ['a'] }))
      expect(() => registry.getLoadOrder()).toThrow('Circular dependency')
    })

    it('should detect longer circular dependency chain', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['b'] }))
      registry.register(createMetadata({ name: 'b', dependencies: ['c'] }))
      registry.register(createMetadata({ name: 'c', dependencies: ['a'] }))
      expect(() => registry.getLoadOrder()).toThrow('Circular dependency')
    })

    it('should ignore missing deps in load order', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a', dependencies: ['missing'] }))
      const order = registry.getLoadOrder()
      expect(order).toEqual(['a'])
    })

    it('should return all plugins regardless of deps for no-dep case', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'x' }))
      registry.register(createMetadata({ name: 'y' }))
      registry.register(createMetadata({ name: 'z' }))
      expect(registry.getLoadOrder()).toHaveLength(3)
    })
  })

  describe('getConfig', () => {
    it('should return default config', () => {
      const registry = new PluginRegistry()
      const config = registry.getConfig()
      expect(config.allowConflicts).toBe(false)
      expect(config.maxPlugins).toBe(100)
      expect(config.autoResolve).toBe(true)
    })

    it('should return custom config', () => {
      const registry = new PluginRegistry({ maxPlugins: 50, allowConflicts: true })
      const config = registry.getConfig()
      expect(config.maxPlugins).toBe(50)
      expect(config.allowConflicts).toBe(true)
      expect(config.autoResolve).toBe(true)
    })

    it('should return a copy of config', () => {
      const registry = new PluginRegistry()
      const config1 = registry.getConfig()
      const config2 = registry.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('should merge partial config with defaults', () => {
      const registry = new PluginRegistry({ maxPlugins: 10 })
      const config = registry.getConfig()
      expect(config.maxPlugins).toBe(10)
      expect(config.allowConflicts).toBe(false)
      expect(config.autoResolve).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty registry operations', () => {
      const registry = new PluginRegistry()
      expect(registry.getAll()).toEqual([])
      expect(registry.getByState('discovered')).toEqual([])
      expect(registry.getByTag('any')).toEqual([])
      expect(registry.resolveAll().size).toBe(0)
    })

    it('should handle maxPlugins of 1', () => {
      const registry = new PluginRegistry({ maxPlugins: 1 })
      registry.register(createMetadata({ name: 'only' }))
      expect(() => registry.register(createMetadata({ name: 'second' }))).toThrow('Maximum')
    })

    it('should handle plugin with many dependencies', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'main', dependencies: ['d1', 'd2', 'd3', 'd4'] }))
      registry.register(createMetadata({ name: 'd1' }))
      registry.register(createMetadata({ name: 'd2' }))
      const missing = registry.resolveDependencies('main')
      expect(missing).toEqual(['d3', 'd4'])
    })

    it('should handle register-unregister-reregister cycle', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'cycle' }))
      registry.updateState('cycle', 'loaded')
      registry.unregister('cycle')
      registry.register(createMetadata({ name: 'cycle' }))
      expect(registry.get('cycle')!.state).toBe('discovered')
    })

    it('should handle updateState through all states', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'lifecycle' }))
      const states: PluginState[] = ['discovered', 'loaded', 'initialized', 'started', 'stopped']
      for (const state of states) {
        registry.updateState('lifecycle', state)
        expect(registry.get('lifecycle')!.state).toBe(state)
      }
    })

    it('should handle plugin with empty tags', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'notags', tags: [] }))
      expect(registry.getByTag('any')).toHaveLength(0)
    })

    it('should handle multiple plugins with no dependencies load order', () => {
      const registry = new PluginRegistry()
      registry.register(createMetadata({ name: 'a' }))
      registry.register(createMetadata({ name: 'b' }))
      registry.register(createMetadata({ name: 'c' }))
      const order = registry.getLoadOrder()
      expect(order).toHaveLength(3)
      expect(order.sort()).toEqual(['a', 'b', 'c'])
    })
  })
})
