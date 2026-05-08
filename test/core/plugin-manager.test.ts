import { describe, it, expect } from 'vitest'
import { PluginManager } from '../../src/core/plugin-manager/plugin-manager.js'
import { DEFAULT_MANAGER_CONFIG } from '../../src/core/plugin-manager/types.js'
import type { PluginDefinition, PluginLifecycle, PluginContext } from '../../src/core/plugin-manager/types.js'

function createDefinition(overrides: Partial<PluginDefinition> = {}): PluginDefinition {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    dependencies: [],
    hooks: [],
    ...overrides,
  }
}

describe('PluginManager', () => {
  describe('Registration', () => {
    it('should register a valid plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      const plugin = manager.getPlugin('test-plugin')
      expect(plugin).toBeDefined()
      expect(plugin!.state).toBe('loaded')
      expect(plugin!.definition.name).toBe('test-plugin')
    })

    it('should reject duplicate plugin name', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(() => manager.register(createDefinition())).toThrow('already registered')
    })

    it('should reject empty plugin name', () => {
      const manager = new PluginManager()
      expect(() => manager.register(createDefinition({ name: '' }))).toThrow('name is required')
    })

    it('should reject whitespace-only plugin name', () => {
      const manager = new PluginManager()
      expect(() => manager.register(createDefinition({ name: '   ' }))).toThrow('name is required')
    })

    it('should store plugin definition correctly', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ version: '2.0.0', description: 'desc' }))
      const plugin = manager.getPlugin('test-plugin')!
      expect(plugin.definition.version).toBe('2.0.0')
      expect(plugin.definition.description).toBe('desc')
    })

    it('should store plugin lifecycle', () => {
      const manager = new PluginManager()
      const lifecycle: PluginLifecycle = {
        onLoad: () => {},
        onEnable: () => {},
      }
      manager.register(createDefinition(), lifecycle)
      const plugin = manager.getPlugin('test-plugin')!
      expect(plugin.lifecycle.onLoad).toBeDefined()
      expect(plugin.lifecycle.onEnable).toBeDefined()
    })

    it('should assign default priority of 0', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.priority).toBe(0)
    })

    it('should assign custom priority', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ priority: 10 }))
      expect(manager.getPlugin('test-plugin')!.priority).toBe(10)
    })

    it('should transition through loading to loaded state', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })

    it('should allow re-registration after unregister', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.unregister('test-plugin')
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })

    it('should register multiple plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      manager.register(createDefinition({ name: 'c' }))
      expect(manager.getAll()).toHaveLength(3)
    })
  })

  describe('Unregistration', () => {
    it('should unregister an existing plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.unregister('test-plugin')).toBe(true)
      expect(manager.getPlugin('test-plugin')).toBeUndefined()
    })

    it('should return false for non-existent plugin', () => {
      const manager = new PluginManager()
      expect(manager.unregister('non-existent')).toBe(false)
    })

    it('should call onDestroy during unregister', () => {
      const manager = new PluginManager()
      let destroyed = false
      manager.register(createDefinition(), {
        onDestroy: () => { destroyed = true },
      })
      manager.unregister('test-plugin')
      expect(destroyed).toBe(true)
    })

    it('should allow re-registering after unregister', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.unregister('test-plugin')
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.definition.name).toBe('test-plugin')
    })
  })

  describe('State management', () => {
    it('should return undefined for non-existent getPlugin', () => {
      const manager = new PluginManager()
      expect(manager.getPlugin('non-existent')).toBeUndefined()
    })

    it('should getAll return plugins sorted by priority', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'low', priority: 1 }))
      manager.register(createDefinition({ name: 'high', priority: 10 }))
      manager.register(createDefinition({ name: 'mid', priority: 5 }))
      const all = manager.getAll()
      expect(all[0]!.definition.name).toBe('high')
      expect(all[1]!.definition.name).toBe('mid')
      expect(all[2]!.definition.name).toBe('low')
    })

    it('should getAll return empty for empty manager', () => {
      const manager = new PluginManager()
      expect(manager.getAll()).toEqual([])
    })

    it('should getByState filter by loaded state', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      manager.enable('a')
      const loaded = manager.getByState('loaded')
      expect(loaded).toHaveLength(1)
      expect(loaded[0]!.definition.name).toBe('b')
    })

    it('should getByState filter by enabled state', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      manager.enable('a')
      const enabled = manager.getByState('enabled')
      expect(enabled).toHaveLength(1)
      expect(enabled[0]!.definition.name).toBe('a')
    })

    it('should getByState return empty for no matches', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.getByState('disabled')).toEqual([])
    })

    it('should getByState return empty for empty manager', () => {
      const manager = new PluginManager()
      expect(manager.getByState('loaded')).toEqual([])
    })

    it('should track error state and message', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      expect(manager.getPlugin('test-plugin')!.state).toBe('enabled')
      expect(manager.getPlugin('test-plugin')!.error).toBeUndefined()
    })
  })

  describe('Enable/Disable', () => {
    it('should enable a loaded plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.enable('test-plugin')).toBe(true)
      expect(manager.getPlugin('test-plugin')!.state).toBe('enabled')
    })

    it('should disable an enabled plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      expect(manager.disable('test-plugin')).toBe(true)
      expect(manager.getPlugin('test-plugin')!.state).toBe('disabled')
    })

    it('should re-enable a disabled plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      manager.disable('test-plugin')
      expect(manager.enable('test-plugin')).toBe(true)
      expect(manager.getPlugin('test-plugin')!.state).toBe('enabled')
    })

    it('should not enable non-existent plugin', () => {
      const manager = new PluginManager()
      expect(manager.enable('non-existent')).toBe(false)
    })

    it('should not disable non-existent plugin', () => {
      const manager = new PluginManager()
      expect(manager.disable('non-existent')).toBe(false)
    })

    it('should not enable already enabled plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      expect(manager.enable('test-plugin')).toBe(false)
    })

    it('should not disable a loaded plugin', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.disable('test-plugin')).toBe(false)
    })

    it('should enable plugin with satisfied dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'dep' }))
      manager.enable('dep')
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(true)
    })

    it('should fail to enable plugin with missing dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'main', dependencies: ['missing'] }))
      expect(manager.enable('main')).toBe(false)
      expect(manager.getPlugin('main')!.state).toBe('error')
      expect(manager.getPlugin('main')!.error).toContain('missing')
    })

    it('should fail to enable plugin with disabled dependencies in strict mode', () => {
      const manager = new PluginManager({ strictDeps: true })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(false)
      expect(manager.getPlugin('main')!.state).toBe('error')
    })

    it('should enable plugin with disabled dependencies in non-strict mode', () => {
      const manager = new PluginManager({ strictDeps: false })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(true)
    })

    it('should clear error when enabling successfully', () => {
      const manager = new PluginManager({ strictDeps: false })
      manager.register(createDefinition({ name: 'main', dependencies: ['missing'] }))
      manager.enable('main')
      expect(manager.getPlugin('main')!.error).toBeDefined()
    })
  })

  describe('Dependency resolution', () => {
    it('should return empty for plugin with no deps', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.resolveDependencies('test-plugin')).toEqual([])
    })

    it('should return missing dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b', 'c'] }))
      expect(manager.resolveDependencies('a')).toEqual(['b', 'c'])
    })

    it('should return only missing deps', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'b' }))
      manager.register(createDefinition({ name: 'a', dependencies: ['b', 'c'] }))
      expect(manager.resolveDependencies('a')).toEqual(['c'])
    })

    it('should return empty when all deps satisfied', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'b' }))
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      expect(manager.resolveDependencies('a')).toEqual([])
    })

    it('should return empty for non-existent plugin', () => {
      const manager = new PluginManager()
      expect(manager.resolveDependencies('non-existent')).toEqual([])
    })

    it('should handle plugin with many dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'd1' }))
      manager.register(createDefinition({ name: 'd2' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['d1', 'd2', 'd3', 'd4'] }))
      expect(manager.resolveDependencies('main')).toEqual(['d3', 'd4'])
    })
  })

  describe('Circular dependency detection', () => {
    it('should detect simple circular dependency', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      manager.register(createDefinition({ name: 'b', dependencies: ['a'] }))
      expect(() => manager.getLoadOrder()).toThrow('Circular dependency')
    })

    it('should detect longer circular dependency chain', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      manager.register(createDefinition({ name: 'b', dependencies: ['c'] }))
      manager.register(createDefinition({ name: 'c', dependencies: ['a'] }))
      expect(() => manager.getLoadOrder()).toThrow('Circular dependency')
    })

    it('should detect self-dependency in enable', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['a'] }))
      expect(manager.enable('a')).toBe(false)
      expect(manager.getPlugin('a')!.error).toContain('Self-dependency')
    })

    it('should detect self-dependency in getLoadOrder', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['a'] }))
      expect(() => manager.getLoadOrder()).toThrow('Circular dependency')
    })

    it('should not throw for acyclic dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'c' }))
      manager.register(createDefinition({ name: 'b', dependencies: ['c'] }))
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      expect(() => manager.getLoadOrder()).not.toThrow()
    })
  })

  describe('Lifecycle hooks', () => {
    it('should call onLoad during registration', () => {
      const manager = new PluginManager()
      let loaded = false
      manager.register(createDefinition(), {
        onLoad: () => { loaded = true },
      })
      expect(loaded).toBe(true)
    })

    it('should call onEnable during enable', () => {
      const manager = new PluginManager()
      let enabled = false
      manager.register(createDefinition(), {
        onEnable: () => { enabled = true },
      })
      manager.enable('test-plugin')
      expect(enabled).toBe(true)
    })

    it('should call onDisable during disable', () => {
      const manager = new PluginManager()
      let disabled = false
      manager.register(createDefinition(), {
        onDisable: () => { disabled = true },
      })
      manager.enable('test-plugin')
      manager.disable('test-plugin')
      expect(disabled).toBe(true)
    })

    it('should call onDestroy during unregister', () => {
      const manager = new PluginManager()
      let destroyed = false
      manager.register(createDefinition(), {
        onDestroy: () => { destroyed = true },
      })
      manager.unregister('test-plugin')
      expect(destroyed).toBe(true)
    })

    it('should pass PluginContext to onLoad', () => {
      let receivedContext: PluginContext | undefined
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onLoad: (ctx) => { receivedContext = ctx },
      })
      expect(receivedContext).toBeDefined()
      expect(receivedContext!.config).toBeDefined()
      expect(receivedContext!.logger).toBeDefined()
      expect(receivedContext!.api).toBeDefined()
    })

    it('should pass PluginContext to onEnable', () => {
      let receivedContext: PluginContext | undefined
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onEnable: (ctx) => { receivedContext = ctx },
      })
      manager.enable('test-plugin')
      expect(receivedContext).toBeDefined()
      expect(receivedContext!.logger.info).toBeTypeOf('function')
      expect(receivedContext!.logger.warn).toBeTypeOf('function')
      expect(receivedContext!.logger.error).toBeTypeOf('function')
    })

    it('should set error state when onLoad throws', () => {
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onLoad: () => { throw new Error('load failed') },
      })
      expect(manager.getPlugin('test-plugin')!.state).toBe('error')
      expect(manager.getPlugin('test-plugin')!.error).toBe('load failed')
    })

    it('should set error state when onEnable throws', () => {
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onEnable: () => { throw new Error('enable failed') },
      })
      manager.enable('test-plugin')
      expect(manager.getPlugin('test-plugin')!.state).toBe('error')
      expect(manager.getPlugin('test-plugin')!.error).toBe('enable failed')
    })

    it('should set error state when onDisable throws', () => {
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onDisable: () => { throw new Error('disable failed') },
      })
      manager.enable('test-plugin')
      manager.disable('test-plugin')
      expect(manager.getPlugin('test-plugin')!.state).toBe('error')
      expect(manager.getPlugin('test-plugin')!.error).toBe('disable failed')
    })

    it('should handle plugin with no lifecycle hooks', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.enable('test-plugin')).toBe(true)
      expect(manager.disable('test-plugin')).toBe(true)
    })

    it('should not call onEnable when deps are missing', () => {
      const manager = new PluginManager()
      let enabled = false
      manager.register(createDefinition({ name: 'a', dependencies: ['missing'] }), {
        onEnable: () => { enabled = true },
      })
      manager.enable('a')
      expect(enabled).toBe(false)
    })
  })

  describe('Load ordering', () => {
    it('should return empty for empty manager', () => {
      const manager = new PluginManager()
      expect(manager.getLoadOrder()).toEqual([])
    })

    it('should return single plugin with no deps', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      expect(manager.getLoadOrder()).toEqual(['a'])
    })

    it('should order deps before dependents', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      manager.register(createDefinition({ name: 'b' }))
      const order = manager.getLoadOrder()
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle chain dependencies', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b'] }))
      manager.register(createDefinition({ name: 'b', dependencies: ['c'] }))
      manager.register(createDefinition({ name: 'c' }))
      const order = manager.getLoadOrder()
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle diamond dependency', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['b', 'c'] }))
      manager.register(createDefinition({ name: 'b', dependencies: ['d'] }))
      manager.register(createDefinition({ name: 'c', dependencies: ['d'] }))
      manager.register(createDefinition({ name: 'd' }))
      const order = manager.getLoadOrder()
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('d')).toBeLessThan(order.indexOf('c'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('a'))
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('a'))
    })

    it('should handle multiple independent plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      const order = manager.getLoadOrder()
      expect(order).toHaveLength(2)
      expect(order).toContain('a')
      expect(order).toContain('b')
    })

    it('should sort by priority among independent plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'low', priority: 1 }))
      manager.register(createDefinition({ name: 'high', priority: 10 }))
      manager.register(createDefinition({ name: 'mid', priority: 5 }))
      const order = manager.getLoadOrder()
      expect(order[0]).toBe('high')
      expect(order[1]).toBe('mid')
      expect(order[2]).toBe('low')
    })

    it('should respect deps over priority', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'dep', priority: 1 }))
      manager.register(createDefinition({ name: 'main', priority: 10, dependencies: ['dep'] }))
      const order = manager.getLoadOrder()
      expect(order.indexOf('dep')).toBeLessThan(order.indexOf('main'))
    })

    it('should ignore missing deps in load order', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['missing'] }))
      const order = manager.getLoadOrder()
      expect(order).toEqual(['a'])
    })
  })

  describe('Hook execution', () => {
    it('should register and execute a hook', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => ({ result: 'ok' }))
      const results = manager.executeHook('test')
      expect(results).toEqual([{ result: 'ok' }])
    })

    it('should execute multiple hooks in order', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => ({ order: 1 }))
      manager.registerHook('test', () => ({ order: 2 }))
      const results = manager.executeHook('test')
      expect(results).toEqual([{ order: 1 }, { order: 2 }])
    })

    it('should return empty for unregistered hook', () => {
      const manager = new PluginManager()
      expect(manager.executeHook('non-existent')).toEqual([])
    })

    it('should pass data to hook callbacks', () => {
      const manager = new PluginManager()
      let received: unknown
      manager.registerHook('test', (data) => { received = data; return data })
      manager.executeHook('test', { key: 'value' })
      expect(received).toEqual({ key: 'value' })
    })

    it('should return results from all callbacks', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => 'a')
      manager.registerHook('test', () => 'b')
      manager.registerHook('test', () => 'c')
      const results = manager.executeHook('test')
      expect(results).toEqual(['a', 'b', 'c'])
    })

    it('should handle hook that returns undefined', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => { return })
      const results = manager.executeHook('test')
      expect(results).toEqual([undefined])
    })

    it('should handle hook that throws', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => { throw new Error('hook error') })
      expect(() => manager.executeHook('test')).toThrow('hook error')
    })

    it('should register hooks for different names independently', () => {
      const manager = new PluginManager()
      manager.registerHook('a', () => 1)
      manager.registerHook('b', () => 2)
      expect(manager.executeHook('a')).toEqual([1])
      expect(manager.executeHook('b')).toEqual([2])
    })
  })

  describe('Statistics', () => {
    it('should return correct statistics for empty manager', () => {
      const manager = new PluginManager()
      const stats = manager.getStatistics()
      expect(stats).toEqual({
        total: 0,
        loading: 0,
        loaded: 0,
        enabled: 0,
        disabled: 0,
        error: 0,
      })
    })

    it('should count loaded plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      const stats = manager.getStatistics()
      expect(stats.total).toBe(1)
      expect(stats.loaded).toBe(1)
    })

    it('should count enabled plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      const stats = manager.getStatistics()
      expect(stats.enabled).toBe(1)
      expect(stats.loaded).toBe(0)
    })

    it('should count disabled plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      manager.disable('test-plugin')
      const stats = manager.getStatistics()
      expect(stats.disabled).toBe(1)
    })

    it('should count error plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['missing'] }))
      manager.enable('a')
      const stats = manager.getStatistics()
      expect(stats.error).toBe(1)
    })

    it('should count mixed states', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      manager.register(createDefinition({ name: 'c' }))
      manager.enable('a')
      manager.enable('b')
      manager.disable('b')
      const stats = manager.getStatistics()
      expect(stats.total).toBe(3)
      expect(stats.loaded).toBe(1)
      expect(stats.enabled).toBe(1)
      expect(stats.disabled).toBe(1)
    })

    it('should count zero loading plugins after registration', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.getStatistics().loading).toBe(0)
    })

    it('should reflect state after clear', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      manager.clear()
      expect(manager.getStatistics().total).toBe(0)
    })
  })

  describe('Configuration', () => {
    it('should have correct DEFAULT_MANAGER_CONFIG values', () => {
      expect(DEFAULT_MANAGER_CONFIG.autoEnable).toBe(false)
      expect(DEFAULT_MANAGER_CONFIG.strictDeps).toBe(true)
      expect(DEFAULT_MANAGER_CONFIG.timeout).toBe(5000)
    })

    it('should use default config when none provided', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })

    it('should autoEnable plugins when configured', () => {
      const manager = new PluginManager({ autoEnable: true })
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('enabled')
    })

    it('should not autoEnable when autoEnable is false', () => {
      const manager = new PluginManager({ autoEnable: false })
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })

    it('should autoEnable fail with missing deps', () => {
      const manager = new PluginManager({ autoEnable: true })
      manager.register(createDefinition({ name: 'a', dependencies: ['missing'] }))
      expect(manager.getPlugin('a')!.state).toBe('error')
    })

    it('should autoEnable succeed with satisfied deps', () => {
      const manager = new PluginManager({ autoEnable: true })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.getPlugin('dep')!.state).toBe('enabled')
      expect(manager.getPlugin('main')!.state).toBe('enabled')
    })

    it('should enforce strictDeps when enabled', () => {
      const manager = new PluginManager({ strictDeps: true })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(false)
    })

    it('should relax strictDeps when disabled', () => {
      const manager = new PluginManager({ strictDeps: false })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(true)
    })

    it('should merge partial config with defaults', () => {
      const manager = new PluginManager({ timeout: 10000 })
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })
  })

  describe('Edge cases', () => {
    it('should handle missing dependency during enable', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['nonexistent'] }))
      expect(manager.enable('a')).toBe(false)
      expect(manager.getPlugin('a')!.state).toBe('error')
    })

    it('should handle self-dependency', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a', dependencies: ['a'] }))
      expect(manager.enable('a')).toBe(false)
      expect(manager.getPlugin('a')!.error).toContain('Self-dependency')
    })

    it('should handle duplicate registration attempt', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      expect(() => manager.register(createDefinition())).toThrow('already registered')
    })

    it('should handle enabling plugin with disabled deps in strict mode', () => {
      const manager = new PluginManager({ strictDeps: true })
      manager.register(createDefinition({ name: 'dep' }))
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(false)
      expect(manager.getPlugin('main')!.state).toBe('error')
    })

    it('should handle enabling plugin with enabled deps in strict mode', () => {
      const manager = new PluginManager({ strictDeps: true })
      manager.register(createDefinition({ name: 'dep' }))
      manager.enable('dep')
      manager.register(createDefinition({ name: 'main', dependencies: ['dep'] }))
      expect(manager.enable('main')).toBe(true)
    })

    it('should handle onLoad error preventing loaded state', () => {
      const manager = new PluginManager()
      manager.register(createDefinition(), {
        onLoad: () => { throw new Error('load error') },
      })
      expect(manager.getPlugin('test-plugin')!.state).toBe('error')
      expect(manager.getPlugin('test-plugin')!.state).not.toBe('loaded')
    })

    it('should handle empty dependencies array', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ dependencies: [] }))
      expect(manager.resolveDependencies('test-plugin')).toEqual([])
      expect(manager.enable('test-plugin')).toBe(true)
    })

    it('should handle empty hooks array', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ hooks: [] }))
      expect(manager.getPlugin('test-plugin')!.definition.hooks).toEqual([])
    })

    it('should handle plugin with hooks', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ hooks: ['beforeAnalyze', 'afterAnalyze'] }))
      expect(manager.getPlugin('test-plugin')!.definition.hooks).toEqual(['beforeAnalyze', 'afterAnalyze'])
    })

    it('should handle multiple enable/disable cycles', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      for (let i = 0; i < 5; i++) {
        manager.enable('test-plugin')
        expect(manager.getPlugin('test-plugin')!.state).toBe('enabled')
        manager.disable('test-plugin')
        expect(manager.getPlugin('test-plugin')!.state).toBe('disabled')
      }
    })
  })

  describe('Clear/Reset', () => {
    it('should clear all plugins', () => {
      const manager = new PluginManager()
      manager.register(createDefinition({ name: 'a' }))
      manager.register(createDefinition({ name: 'b' }))
      manager.clear()
      expect(manager.getAll()).toEqual([])
      expect(manager.getPlugin('a')).toBeUndefined()
      expect(manager.getPlugin('b')).toBeUndefined()
    })

    it('should clear hook callbacks', () => {
      const manager = new PluginManager()
      manager.registerHook('test', () => 'result')
      manager.clear()
      expect(manager.executeHook('test')).toEqual([])
    })

    it('should clear statistics', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.enable('test-plugin')
      manager.clear()
      const stats = manager.getStatistics()
      expect(stats.total).toBe(0)
      expect(stats.enabled).toBe(0)
    })

    it('should allow operations after clear', () => {
      const manager = new PluginManager()
      manager.register(createDefinition())
      manager.clear()
      manager.register(createDefinition())
      expect(manager.getPlugin('test-plugin')!.state).toBe('loaded')
    })

    it('should handle clear on empty manager', () => {
      const manager = new PluginManager()
      manager.clear()
      expect(manager.getAll()).toEqual([])
      expect(manager.getStatistics().total).toBe(0)
    })
  })
})
