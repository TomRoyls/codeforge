import { describe, it, expect } from 'vitest'
import { PluginRegistry } from '../../src/core/plugin-lifecycle/plugin-registry.js'
import { VersionResolver } from '../../src/core/plugin-lifecycle/version-resolver.js'
import { LifecycleManager } from '../../src/core/plugin-lifecycle/lifecycle-manager.js'
import type { PluginInfo, PluginDependency, RegistryEntry, PluginEvent } from '../../src/core/plugin-lifecycle/types.js'

function createPlugin(overrides: Partial<PluginInfo> = {}): PluginInfo {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'test-author',
    dependencies: new Map(),
    entryPoint: './plugins/test-plugin/index.js',
    license: 'MIT',
    installedAt: Date.now(),
    updatedAt: Date.now(),
    state: 'installed',
    ...overrides,
  }
}

describe('PluginRegistry', () => {
  describe('register', () => {
    it('should register a new plugin', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      expect(registry.register(plugin)).toBe(true)
      expect(registry.getSize()).toBe(1)
    })

    it('should not register a duplicate plugin', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      registry.register(plugin)
      expect(registry.register(plugin)).toBe(false)
      expect(registry.getSize()).toBe(1)
    })

    it('should assign incrementing load order', () => {
      const registry = new PluginRegistry()
      const p1 = createPlugin({ name: 'plugin-a' })
      const p2 = createPlugin({ name: 'plugin-b' })
      const p3 = createPlugin({ name: 'plugin-c' })
      registry.register(p1)
      registry.register(p2)
      registry.register(p3)
      expect(registry.get('plugin-a')!.loadOrder).toBe(0)
      expect(registry.get('plugin-b')!.loadOrder).toBe(1)
      expect(registry.get('plugin-c')!.loadOrder).toBe(2)
    })

    it('should create entry with enabled=false and empty config', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      registry.register(plugin)
      const entry = registry.get('test-plugin')!
      expect(entry.enabled).toBe(false)
      expect(entry.config).toEqual({})
    })
  })

  describe('unregister', () => {
    it('should unregister an existing plugin', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      registry.register(plugin)
      expect(registry.unregister('test-plugin')).toBe(true)
      expect(registry.getSize()).toBe(0)
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.unregister('non-existent')).toBe(false)
    })

    it('should allow re-registering after unregister', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      registry.register(plugin)
      registry.unregister('test-plugin')
      expect(registry.register(plugin)).toBe(true)
    })
  })

  describe('get', () => {
    it('should return entry for existing plugin', () => {
      const registry = new PluginRegistry()
      const plugin = createPlugin()
      registry.register(plugin)
      const entry = registry.get('test-plugin')
      expect(entry).not.toBeNull()
      expect(entry!.plugin.name).toBe('test-plugin')
    })

    it('should return null for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.get('non-existent')).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return empty array for empty registry', () => {
      const registry = new PluginRegistry()
      expect(registry.getAll()).toEqual([])
    })

    it('should return all registered entries', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'a' }))
      registry.register(createPlugin({ name: 'b' }))
      expect(registry.getAll()).toHaveLength(2)
    })
  })

  describe('find', () => {
    it('should find entries matching predicate', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'plugin-a', version: '1.0.0' }))
      registry.register(createPlugin({ name: 'plugin-b', version: '2.0.0' }))
      const results = registry.find(e => e.plugin.version.startsWith('2'))
      expect(results).toHaveLength(1)
      expect(results[0]!.plugin.name).toBe('plugin-b')
    })

    it('should return empty array when nothing matches', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin())
      const results = registry.find(e => e.plugin.name === 'non-existent')
      expect(results).toEqual([])
    })

    it('should find all entries with a broad predicate', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'a' }))
      registry.register(createPlugin({ name: 'b' }))
      const results = registry.find(() => true)
      expect(results).toHaveLength(2)
    })
  })

  describe('exists', () => {
    it('should return true for existing plugin', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin())
      expect(registry.exists('test-plugin')).toBe(true)
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.exists('non-existent')).toBe(false)
    })
  })

  describe('getSize', () => {
    it('should return 0 for empty registry', () => {
      const registry = new PluginRegistry()
      expect(registry.getSize()).toBe(0)
    })

    it('should return correct count', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'a' }))
      registry.register(createPlugin({ name: 'b' }))
      registry.register(createPlugin({ name: 'c' }))
      expect(registry.getSize()).toBe(3)
    })
  })

  describe('updateEntry', () => {
    it('should update config', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin())
      registry.updateEntry('test-plugin', { config: { debug: true } })
      expect(registry.get('test-plugin')!.config).toEqual({ debug: true })
    })

    it('should update enabled', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin())
      registry.updateEntry('test-plugin', { enabled: true })
      expect(registry.get('test-plugin')!.enabled).toBe(true)
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.updateEntry('non-existent', { enabled: true })).toBe(false)
    })
  })

  describe('updatePlugin', () => {
    it('should update the plugin info', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin())
      const updated = createPlugin({ version: '2.0.0' })
      registry.updatePlugin('test-plugin', updated)
      expect(registry.get('test-plugin')!.plugin.version).toBe('2.0.0')
    })

    it('should return false for non-existent plugin', () => {
      const registry = new PluginRegistry()
      expect(registry.updatePlugin('non-existent', createPlugin())).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'a' }))
      registry.register(createPlugin({ name: 'b' }))
      registry.clear()
      expect(registry.getSize()).toBe(0)
    })

    it('should reset load order counter', () => {
      const registry = new PluginRegistry()
      registry.register(createPlugin({ name: 'a' }))
      registry.clear()
      registry.register(createPlugin({ name: 'b' }))
      expect(registry.get('b')!.loadOrder).toBe(0)
    })
  })
})

describe('VersionResolver', () => {
  describe('resolve', () => {
    it('should resolve required dependencies', () => {
      const resolver = new VersionResolver()
      const deps: PluginDependency[] = [
        { name: 'lodash', versionRange: '4.17.0', required: true },
      ]
      const result = resolver.resolve(deps)
      expect(result.get('lodash')).toBe('4.17.0')
    })

    it('should resolve multiple dependencies', () => {
      const resolver = new VersionResolver()
      const deps: PluginDependency[] = [
        { name: 'lodash', versionRange: '4.17.0', required: true },
        { name: 'chalk', versionRange: '5.0.0', required: true },
      ]
      const result = resolver.resolve(deps)
      expect(result.get('lodash')).toBe('4.17.0')
      expect(result.get('chalk')).toBe('5.0.0')
    })

    it('should pick highest version for duplicate required deps', () => {
      const resolver = new VersionResolver()
      const deps: PluginDependency[] = [
        { name: 'lodash', versionRange: '4.16.0', required: true },
        { name: 'lodash', versionRange: '4.17.0', required: true },
      ]
      const result = resolver.resolve(deps)
      expect(result.get('lodash')).toBe('4.17.0')
    })

    it('should resolve optional deps when no required', () => {
      const resolver = new VersionResolver()
      const deps: PluginDependency[] = [
        { name: 'lodash', versionRange: '4.17.0', required: false },
      ]
      const result = resolver.resolve(deps)
      expect(result.get('lodash')).toBe('4.17.0')
    })

    it('should return empty map for empty deps', () => {
      const resolver = new VersionResolver()
      const result = resolver.resolve([])
      expect(result.size).toBe(0)
    })
  })

  describe('checkConflicts', () => {
    it('should detect version conflicts', () => {
      const resolver = new VersionResolver()
      const plugins: PluginInfo[] = [
        createPlugin({ name: 'a', dependencies: new Map([['shared', '1.0.0']]) }),
        createPlugin({ name: 'b', dependencies: new Map([['shared', '2.0.0']]) }),
      ]
      const conflicts = resolver.checkConflicts(plugins)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]!.dependency).toBe('shared')
      expect(conflicts[0]!.versionA).toBe('1.0.0')
      expect(conflicts[0]!.versionB).toBe('2.0.0')
    })

    it('should return empty when no conflicts', () => {
      const resolver = new VersionResolver()
      const plugins: PluginInfo[] = [
        createPlugin({ name: 'a', dependencies: new Map([['shared', '1.0.0']]) }),
        createPlugin({ name: 'b', dependencies: new Map([['shared', '1.0.0']]) }),
      ]
      const conflicts = resolver.checkConflicts(plugins)
      expect(conflicts).toHaveLength(0)
    })

    it('should detect multiple conflicts', () => {
      const resolver = new VersionResolver()
      const plugins: PluginInfo[] = [
        createPlugin({ name: 'a', dependencies: new Map([['lib1', '1.0.0'], ['lib2', '2.0.0']]) }),
        createPlugin({ name: 'b', dependencies: new Map([['lib1', '2.0.0'], ['lib2', '3.0.0']]) }),
      ]
      const conflicts = resolver.checkConflicts(plugins)
      expect(conflicts).toHaveLength(2)
    })

    it('should return empty for plugins with no dependencies', () => {
      const resolver = new VersionResolver()
      const plugins: PluginInfo[] = [
        createPlugin({ name: 'a', dependencies: new Map() }),
        createPlugin({ name: 'b', dependencies: new Map() }),
      ]
      const conflicts = resolver.checkConflicts(plugins)
      expect(conflicts).toHaveLength(0)
    })

    it('should return empty for single plugin', () => {
      const resolver = new VersionResolver()
      const plugins: PluginInfo[] = [
        createPlugin({ name: 'a', dependencies: new Map([['lib', '1.0.0']]) }),
      ]
      const conflicts = resolver.checkConflicts(plugins)
      expect(conflicts).toHaveLength(0)
    })
  })

  describe('isCompatible', () => {
    it('should match exact version', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.0', '1.0.0')).toBe(true)
    })

    it('should reject non-matching exact version', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.0', '2.0.0')).toBe(false)
    })

    it('should handle >= range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('2.0.0', '>=1.0.0')).toBe(true)
      expect(resolver.isCompatible('1.0.0', '>=1.0.0')).toBe(true)
      expect(resolver.isCompatible('0.9.0', '>=1.0.0')).toBe(false)
    })

    it('should handle <= range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.0', '<=2.0.0')).toBe(true)
      expect(resolver.isCompatible('2.0.0', '<=2.0.0')).toBe(true)
      expect(resolver.isCompatible('3.0.0', '<=2.0.0')).toBe(false)
    })

    it('should handle > range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('2.0.0', '>1.0.0')).toBe(true)
      expect(resolver.isCompatible('1.0.0', '>1.0.0')).toBe(false)
    })

    it('should handle < range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.0', '<2.0.0')).toBe(true)
      expect(resolver.isCompatible('2.0.0', '<2.0.0')).toBe(false)
    })

    it('should handle ^ caret range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.5.0', '^1.0.0')).toBe(true)
      expect(resolver.isCompatible('2.0.0', '^1.0.0')).toBe(false)
      expect(resolver.isCompatible('1.0.0', '^1.0.0')).toBe(true)
    })

    it('should handle ~ tilde range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.5', '~1.0.0')).toBe(true)
      expect(resolver.isCompatible('1.1.0', '~1.0.0')).toBe(false)
      expect(resolver.isCompatible('1.0.0', '~1.0.0')).toBe(true)
    })

    it('should handle || or range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.0.0', '1.0.0 || 2.0.0')).toBe(true)
      expect(resolver.isCompatible('2.0.0', '1.0.0 || 2.0.0')).toBe(true)
      expect(resolver.isCompatible('3.0.0', '1.0.0 || 2.0.0')).toBe(false)
    })

    it('should handle hyphen range', () => {
      const resolver = new VersionResolver()
      expect(resolver.isCompatible('1.5.0', '1.0.0 - 2.0.0')).toBe(true)
      expect(resolver.isCompatible('1.0.0', '1.0.0 - 2.0.0')).toBe(true)
      expect(resolver.isCompatible('2.0.0', '1.0.0 - 2.0.0')).toBe(true)
      expect(resolver.isCompatible('3.0.0', '1.0.0 - 2.0.0')).toBe(false)
    })
  })

  describe('getLatestCompatible', () => {
    it('should return latest matching version', () => {
      const resolver = new VersionResolver()
      const available = ['1.0.0', '1.1.0', '1.2.0', '2.0.0']
      expect(resolver.getLatestCompatible('^1.0.0', available)).toBe('1.2.0')
    })

    it('should return null when no version matches', () => {
      const resolver = new VersionResolver()
      const available = ['2.0.0', '3.0.0']
      expect(resolver.getLatestCompatible('^1.0.0', available)).toBeNull()
    })

    it('should return exact match', () => {
      const resolver = new VersionResolver()
      const available = ['1.0.0', '1.1.0']
      expect(resolver.getLatestCompatible('1.0.0', available)).toBe('1.0.0')
    })

    it('should return null for empty available', () => {
      const resolver = new VersionResolver()
      expect(resolver.getLatestCompatible('^1.0.0', [])).toBeNull()
    })
  })

  describe('sortVersions', () => {
    it('should sort versions ascending', () => {
      const resolver = new VersionResolver()
      const versions = ['2.0.0', '1.0.0', '3.0.0']
      expect(resolver.sortVersions(versions)).toEqual(['1.0.0', '2.0.0', '3.0.0'])
    })

    it('should sort by major, minor, patch', () => {
      const resolver = new VersionResolver()
      const versions = ['1.2.1', '1.2.0', '1.1.0', '2.0.0']
      expect(resolver.sortVersions(versions)).toEqual(['1.1.0', '1.2.0', '1.2.1', '2.0.0'])
    })

    it('should not mutate original array', () => {
      const resolver = new VersionResolver()
      const original = ['3.0.0', '1.0.0', '2.0.0']
      const sorted = resolver.sortVersions([...original])
      expect(sorted).toEqual(['1.0.0', '2.0.0', '3.0.0'])
      expect(original).toEqual(['3.0.0', '1.0.0', '2.0.0'])
    })

    it('should handle single version', () => {
      const resolver = new VersionResolver()
      expect(resolver.sortVersions(['1.0.0'])).toEqual(['1.0.0'])
    })

    it('should handle empty array', () => {
      const resolver = new VersionResolver()
      expect(resolver.sortVersions([])).toEqual([])
    })
  })
})

describe('LifecycleManager', () => {
  describe('install', () => {
    it('should install a new plugin', () => {
      const manager = new LifecycleManager()
      const result = manager.install('my-plugin', { force: false, peerDeps: true })
      expect(result.success).toBe(true)
      expect(result.plugin).toBeDefined()
      expect(result.plugin!.name).toBe('my-plugin')
      expect(result.errors).toHaveLength(0)
    })

    it('should set installed state', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.getState('my-plugin')).toBe('installed')
    })

    it('should fail to install duplicate without force', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const result = manager.install('my-plugin', { force: false, peerDeps: true })
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should reinstall with force option', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const result = manager.install('my-plugin', { force: true, peerDeps: true })
      expect(result.success).toBe(true)
    })

    it('should use specified version', () => {
      const manager = new LifecycleManager()
      const result = manager.install('my-plugin', { force: false, peerDeps: true, version: '2.0.0' })
      expect(result.success).toBe(true)
      expect(result.plugin!.version).toBe('2.0.0')
    })

    it('should default to 1.0.0 when no version specified', () => {
      const manager = new LifecycleManager()
      const result = manager.install('my-plugin', { force: false, peerDeps: true })
      expect(result.plugin!.version).toBe('1.0.0')
    })

    it('should warn when peerDeps is false', () => {
      const manager = new LifecycleManager()
      const result = manager.install('my-plugin', { force: false, peerDeps: false })
      expect(result.warnings).toHaveLength(1)
    })

    it('should not warn when peerDeps is true', () => {
      const manager = new LifecycleManager()
      const result = manager.install('my-plugin', { force: false, peerDeps: true })
      expect(result.warnings).toHaveLength(0)
    })

    it('should log install event', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const events = manager.getEventLog()
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('install')
      expect(events[0]!.pluginName).toBe('my-plugin')
    })

    it('should log error event on duplicate install', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.install('my-plugin', { force: false, peerDeps: true })
      const events = manager.getEventLog()
      expect(events[1]!.type).toBe('error')
    })
  })

  describe('uninstall', () => {
    it('should uninstall an existing plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const result = manager.uninstall('my-plugin')
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail to uninstall non-existent plugin', () => {
      const manager = new LifecycleManager()
      const result = manager.uninstall('non-existent')
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should fail to uninstall plugin with dependents', () => {
      const manager = new LifecycleManager()
      manager.install('dep-plugin', { force: false, peerDeps: true })
      manager.install('main-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('main-plugin')!
      entry.plugin.dependencies.set('dep-plugin', '1.0.0')
      const result = manager.uninstall('dep-plugin')
      expect(result.success).toBe(false)
      expect(result.errors[0]).toContain('depend')
    })

    it('should log uninstall event', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.uninstall('my-plugin')
      const events = manager.getEventLog()
      expect(events[1]!.type).toBe('uninstall')
    })

    it('should remove plugin from registry after uninstall', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.uninstall('my-plugin')
      expect(manager.getState('my-plugin')).toBe('pending')
    })
  })

  describe('enable', () => {
    it('should enable an installed plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.enable('my-plugin')).toBe(true)
      expect(manager.getState('my-plugin')).toBe('enabled')
    })

    it('should return false for non-existent plugin', () => {
      const manager = new LifecycleManager()
      expect(manager.enable('non-existent')).toBe(false)
    })

    it('should return false for error-state plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('my-plugin')!
      entry.plugin = { ...entry.plugin, state: 'error' }
      expect(manager.enable('my-plugin')).toBe(false)
    })

    it('should fail when dependency not enabled', () => {
      const manager = new LifecycleManager()
      manager.install('dep-plugin', { force: false, peerDeps: true })
      manager.install('main-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('main-plugin')!
      entry.plugin.dependencies.set('dep-plugin', '1.0.0')
      expect(manager.enable('main-plugin')).toBe(false)
    })

    it('should succeed when all dependencies enabled', () => {
      const manager = new LifecycleManager()
      manager.install('dep-plugin', { force: false, peerDeps: true })
      manager.enable('dep-plugin')
      manager.install('main-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('main-plugin')!
      entry.plugin.dependencies.set('dep-plugin', '1.0.0')
      expect(manager.enable('main-plugin')).toBe(true)
    })

    it('should log enable event', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.enable('my-plugin')
      const events = manager.getEventLog()
      expect(events[1]!.type).toBe('enable')
    })
  })

  describe('disable', () => {
    it('should disable an enabled plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.enable('my-plugin')
      expect(manager.disable('my-plugin')).toBe(true)
      expect(manager.getState('my-plugin')).toBe('disabled')
    })

    it('should return false for non-existent plugin', () => {
      const manager = new LifecycleManager()
      expect(manager.disable('non-existent')).toBe(false)
    })

    it('should disable an installed but not enabled plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.disable('my-plugin')).toBe(true)
      expect(manager.getState('my-plugin')).toBe('disabled')
    })

    it('should log disable event', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.disable('my-plugin')
      const events = manager.getEventLog()
      expect(events[1]!.type).toBe('disable')
    })
  })

  describe('update', () => {
    it('should update plugin with auto-incremented version', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true, version: '1.0.0' })
      const result = manager.update('my-plugin')
      expect(result.success).toBe(true)
      expect(result.plugin!.version).toBe('1.0.1')
    })

    it('should update plugin to specified version', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const result = manager.update('my-plugin', '2.0.0')
      expect(result.success).toBe(true)
      expect(result.plugin!.version).toBe('2.0.0')
    })

    it('should fail for non-existent plugin', () => {
      const manager = new LifecycleManager()
      const result = manager.update('non-existent')
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should update updatedAt timestamp', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const before = manager.getRegistry().get('my-plugin')!.plugin.updatedAt
      const result = manager.update('my-plugin')
      expect(result.plugin!.updatedAt).toBeGreaterThanOrEqual(before)
    })

    it('should log update event', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.update('my-plugin')
      const events = manager.getEventLog()
      expect(events[1]!.type).toBe('update')
    })
  })

  describe('getState', () => {
    it('should return pending for non-existent plugin', () => {
      const manager = new LifecycleManager()
      expect(manager.getState('non-existent')).toBe('pending')
    })

    it('should return installed after install', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.getState('my-plugin')).toBe('installed')
    })

    it('should return enabled after enable', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.enable('my-plugin')
      expect(manager.getState('my-plugin')).toBe('enabled')
    })

    it('should return disabled after disable', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      manager.enable('my-plugin')
      manager.disable('my-plugin')
      expect(manager.getState('my-plugin')).toBe('disabled')
    })
  })

  describe('getDependencies', () => {
    it('should return empty array for plugin with no deps', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.getDependencies('my-plugin')).toEqual([])
    })

    it('should return dependency names', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('my-plugin')!
      entry.plugin.dependencies.set('dep-a', '1.0.0')
      entry.plugin.dependencies.set('dep-b', '2.0.0')
      expect(manager.getDependencies('my-plugin')).toEqual(['dep-a', 'dep-b'])
    })

    it('should return empty for non-existent plugin', () => {
      const manager = new LifecycleManager()
      expect(manager.getDependencies('non-existent')).toEqual([])
    })
  })

  describe('getDependents', () => {
    it('should return plugins that depend on the given plugin', () => {
      const manager = new LifecycleManager()
      manager.install('dep-plugin', { force: false, peerDeps: true })
      manager.install('main-plugin', { force: false, peerDeps: true })
      const entry = manager.getRegistry().get('main-plugin')!
      entry.plugin.dependencies.set('dep-plugin', '1.0.0')
      expect(manager.getDependents('dep-plugin')).toEqual(['main-plugin'])
    })

    it('should return empty when no dependents', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      expect(manager.getDependents('my-plugin')).toEqual([])
    })
  })

  describe('getEventLog', () => {
    it('should return empty log initially', () => {
      const manager = new LifecycleManager()
      expect(manager.getEventLog()).toEqual([])
    })

    it('should accumulate events', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      manager.install('b', { force: false, peerDeps: true })
      expect(manager.getEventLog()).toHaveLength(2)
    })

    it('should return a copy of the event log', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      const log1 = manager.getEventLog()
      const log2 = manager.getEventLog()
      expect(log1).not.toBe(log2)
      expect(log1).toEqual(log2)
    })

    it('should record correct event types', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      manager.enable('a')
      manager.disable('a')
      manager.uninstall('a')
      const types = manager.getEventLog().map(e => e.type)
      expect(types).toEqual(['install', 'enable', 'disable', 'uninstall'])
    })
  })

  describe('getLoadOrder', () => {
    it('should return empty when no enabled plugins', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      expect(manager.getLoadOrder()).toEqual([])
    })

    it('should return enabled plugins in load order', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      manager.install('b', { force: false, peerDeps: true })
      manager.enable('a')
      manager.enable('b')
      expect(manager.getLoadOrder()).toEqual(['a', 'b'])
    })

    it('should only include enabled plugins', () => {
      const manager = new LifecycleManager()
      manager.install('a', { force: false, peerDeps: true })
      manager.install('b', { force: false, peerDeps: true })
      manager.enable('a')
      expect(manager.getLoadOrder()).toEqual(['a'])
    })
  })

  describe('validate', () => {
    it('should validate a correct plugin', () => {
      const manager = new LifecycleManager()
      manager.install('my-plugin', { force: false, peerDeps: true })
      const result = manager.validate('my-plugin')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for non-existent plugin', () => {
      const manager = new LifecycleManager()
      const result = manager.validate('non-existent')
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should detect empty name', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: '' }))
      const result = manager.validate('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Plugin name is empty.')
    })

    it('should detect empty version', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: 'bad', version: '' }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
    })

    it('should detect invalid semver', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: 'bad', version: 'not-semver' }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('not a valid semver'))).toBe(true)
    })

    it('should detect empty entry point', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: 'bad', entryPoint: '' }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Plugin entry point is empty.')
    })

    it('should detect empty license', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: 'bad', license: '' }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Plugin license is empty.')
    })

    it('should detect empty dependency name', () => {
      const manager = new LifecycleManager()
      const deps = new Map<string, string>()
      deps.set('', '1.0.0')
      manager.getRegistry().register(createPlugin({ name: 'bad', dependencies: deps }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Dependency name is empty.')
    })

    it('should detect empty dependency version', () => {
      const manager = new LifecycleManager()
      const deps = new Map<string, string>()
      deps.set('dep', '')
      manager.getRegistry().register(createPlugin({ name: 'bad', dependencies: deps }))
      const result = manager.validate('bad')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Dependency "dep" has empty version.')
    })

    it('should collect multiple errors', () => {
      const manager = new LifecycleManager()
      manager.getRegistry().register(createPlugin({ name: 'bad', version: '', license: '', entryPoint: '' }))
      const result = manager.validate('bad')
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('constructor injection', () => {
    it('should accept custom registry and version resolver', () => {
      const registry = new PluginRegistry()
      const resolver = new VersionResolver()
      const manager = new LifecycleManager(registry, resolver)
      expect(manager.getRegistry()).toBe(registry)
      expect(manager.getVersionResolver()).toBe(resolver)
    })

    it('should create default instances when not provided', () => {
      const manager = new LifecycleManager()
      expect(manager.getRegistry()).toBeInstanceOf(PluginRegistry)
      expect(manager.getVersionResolver()).toBeInstanceOf(VersionResolver)
    })
  })

  describe('full lifecycle', () => {
    it('should handle install -> enable -> disable -> uninstall', () => {
      const manager = new LifecycleManager()
      const installResult = manager.install('lifecycle-test', { force: false, peerDeps: true })
      expect(installResult.success).toBe(true)
      expect(manager.getState('lifecycle-test')).toBe('installed')

      expect(manager.enable('lifecycle-test')).toBe(true)
      expect(manager.getState('lifecycle-test')).toBe('enabled')

      expect(manager.disable('lifecycle-test')).toBe(true)
      expect(manager.getState('lifecycle-test')).toBe('disabled')

      const uninstallResult = manager.uninstall('lifecycle-test')
      expect(uninstallResult.success).toBe(true)
      expect(manager.getState('lifecycle-test')).toBe('pending')
    })

    it('should handle install -> update -> enable cycle', () => {
      const manager = new LifecycleManager()
      manager.install('update-test', { force: false, peerDeps: true, version: '1.0.0' })
      const updateResult = manager.update('update-test', '2.0.0')
      expect(updateResult.success).toBe(true)
      expect(updateResult.plugin!.version).toBe('2.0.0')
      expect(manager.enable('update-test')).toBe(true)
      expect(manager.getState('update-test')).toBe('enabled')
    })

    it('should track all events in full lifecycle', () => {
      const manager = new LifecycleManager()
      manager.install('track', { force: false, peerDeps: true })
      manager.enable('track')
      manager.update('track')
      manager.disable('track')
      manager.uninstall('track')
      const events = manager.getEventLog()
      expect(events).toHaveLength(5)
      expect(events.map(e => e.type)).toEqual(['install', 'enable', 'update', 'disable', 'uninstall'])
    })
  })
})
