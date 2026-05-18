import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PluginManager } from '../../src/plugins/manager.js'
import { HookExecutionError, PluginLoadError } from '../../src/plugins/types.js'

import type { Logger, Plugin, PluginConfig, RuleDefinition, TransformDefinition } from '../../src/plugins/types.js'

// ─── Stubs & Helpers ───

const silentLogger: Logger = {
  debug: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
}

class MockRegistry {
  private readonly plugins: Map<string, Plugin> = new Map()

  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  loadFromNodeModules(_name: string, _workspaceRoot: string): Promise<Plugin> {
    return Promise.reject(new Error('Not found'))
  }

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin)
  }
}

function makeRuleMeta(overrides: Partial<RuleDefinition['meta']> = {}): RuleDefinition['meta'] {
  return {
    severity: 'error',
    type: 'problem',
    docs: { description: 'A test rule' },
    ...overrides,
  }
}

function makeRule(overrides: Partial<RuleDefinition> = {}): RuleDefinition {
  return {
    meta: makeRuleMeta(),
    create: () => ({}),
    ...overrides,
  }
}

function makeTransform(overrides: Partial<TransformDefinition> = {}): TransformDefinition {
  return {
    name: 'test-transform',
    transform: async (source: string) => source,
    ...overrides,
  }
}

function makePlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  }
}

function createManager(registry?: MockRegistry, logger?: Logger): PluginManager {
  return new PluginManager({
    workspaceRoot: '/test/workspace',
    logger: logger ?? silentLogger,
    registry: registry ?? new MockRegistry(),
  })
}

// ─── Constructor ───

describe('PluginManager – Constructor', () => {
  it('creates a manager with the given workspaceRoot', () => {
    const manager = createManager()
    expect(manager.getWorkspaceRoot()).toBe('/test/workspace')
  })

  it('returns an empty list of loaded plugins initially', () => {
    const manager = createManager()
    expect(manager.getAllPlugins()).toEqual([])
    expect(manager.getLoadedPluginNames()).toEqual([])
  })

  it('reports no plugin as loaded initially', () => {
    const manager = createManager()
    expect(manager.isLoaded('anything')).toBe(false)
  })

  it('uses the provided logger', async () => {
    const registry = new MockRegistry()
    const plugin = makePlugin()
    registry.register(plugin)
    const logs: string[] = []
    const capturingLogger: Logger = {
      debug: () => {},
      error: () => {},
      info: (msg: string) => {
        logs.push(msg)
      },
      warn: () => {},
    }
    const manager = createManager(registry, capturingLogger)
    await manager.loadPlugin('test-plugin')
    expect(logs.length).toBeGreaterThan(0)
  })

  it('exposes the registry via getRegistry', () => {
    const registry = new MockRegistry()
    const manager = createManager(registry)
    expect(manager.getRegistry()).toBe(registry)
  })
})

// ─── isLoaded / getPlugin / getAllPlugins / getLoadedPluginNames ───

describe('PluginManager – Query Methods (empty state)', () => {
  it('isLoaded returns false for unknown plugins', () => {
    const manager = createManager()
    expect(manager.isLoaded('nonexistent')).toBe(false)
  })

  it('getPlugin returns undefined for unknown plugins', () => {
    const manager = createManager()
    expect(manager.getPlugin('nonexistent')).toBeUndefined()
  })

  it('getAllPlugins returns empty array when nothing loaded', () => {
    const manager = createManager()
    expect(manager.getAllPlugins()).toEqual([])
  })

  it('getLoadedPluginNames returns empty array when nothing loaded', () => {
    const manager = createManager()
    expect(manager.getLoadedPluginNames()).toEqual([])
  })
})

// ─── loadPlugin ───

describe('PluginManager – loadPlugin', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('loads a plugin from the registry', async () => {
    const plugin = makePlugin()
    registry.register(plugin)
    const manager = createManager(registry)
    const loaded = await manager.loadPlugin('test-plugin')
    expect(loaded).toBe(plugin)
  })

  it('marks the plugin as loaded after loadPlugin', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(true)
  })

  it('returns the plugin via getPlugin after loading', async () => {
    const plugin = makePlugin()
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getPlugin('test-plugin')).toBe(plugin)
  })

  it('includes the plugin in getAllPlugins after loading', async () => {
    const plugin = makePlugin()
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getAllPlugins()).toEqual([plugin])
  })

  it('includes the plugin name in getLoadedPluginNames after loading', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getLoadedPluginNames()).toEqual(['test-plugin'])
  })

  it('stores a default config when no options are provided', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    const config = manager.getPluginConfig('test-plugin')
    expect(config).toBeDefined()
    expect(config!.options).toEqual({})
    expect(config!.rules).toEqual({})
    expect(config!.transforms).toEqual([])
  })

  it('stores the provided config', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    const config: PluginConfig = {
      options: { foo: 'bar' },
      rules: { 'my-rule': 'error' },
      transforms: ['transform-a'],
    }
    await manager.loadPlugin('test-plugin', { config })
    const stored = manager.getPluginConfig('test-plugin')
    expect(stored).toEqual(config)
  })

  it('returns the same plugin instance on duplicate load', async () => {
    const plugin = makePlugin()
    registry.register(plugin)
    const manager = createManager(registry)
    const first = await manager.loadPlugin('test-plugin')
    const second = await manager.loadPlugin('test-plugin')
    expect(first).toBe(second)
    expect(manager.getAllPlugins()).toHaveLength(1)
  })

  it('executes the onLoad hook during loading', async () => {
    let hookCalled = false
    const plugin = makePlugin({
      hooks: {
        onLoad: async () => {
          hookCalled = true
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(hookCalled).toBe(true)
  })

  it('throws PluginLoadError when plugin is not in registry and node_modules fails', async () => {
    const manager = createManager(registry)
    await expect(manager.loadPlugin('missing-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('throws PluginLoadError with plugin name when not found', async () => {
    const manager = createManager(registry)
    try {
      await manager.loadPlugin('missing-plugin')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as PluginLoadError).pluginName).toBe('missing-plugin')
    }
  })

  it('throws PluginLoadError when onLoad hook throws', async () => {
    const plugin = makePlugin({
      hooks: {
        onLoad: async () => {
          throw new Error('onLoad failed')
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('loads multiple plugins', async () => {
    const pluginA = makePlugin({ name: 'plugin-a' })
    const pluginB = makePlugin({ name: 'plugin-b' })
    registry.register(pluginA)
    registry.register(pluginB)
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    expect(manager.getLoadedPluginNames()).toEqual(['plugin-a', 'plugin-b'])
  })
})

// ─── loadPlugin – node_modules fallback ───

describe('PluginManager – loadPlugin from node_modules', () => {
  it('attempts loadFromNodeModules when registry has no plugin', async () => {
    let loadCalled = false
    const plugin = makePlugin({ name: 'npm-plugin' })
    const registry = new MockRegistry()
    registry.loadFromNodeModules = async (name: string) => {
      loadCalled = true
      if (name === 'npm-plugin') return plugin
      throw new Error('Not found')
    }
    const manager = createManager(registry)
    const loaded = await manager.loadPlugin('npm-plugin')
    expect(loadCalled).toBe(true)
    expect(loaded.name).toBe('npm-plugin')
  })
})

// ─── unloadPlugin ───

describe('PluginManager – unloadPlugin', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('removes a loaded plugin', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(true)
    manager.unloadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(false)
  })

  it('removes the plugin config when unloading', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin', {
      config: { options: { a: 1 } },
    })
    expect(manager.getPluginConfig('test-plugin')).toBeDefined()
    manager.unloadPlugin('test-plugin')
    expect(manager.getPluginConfig('test-plugin')).toBeUndefined()
  })

  it('executes onUnload hook during unload', async () => {
    let unloadCalled = false
    const plugin = makePlugin({
      hooks: {
        onUnload: async () => {
          unloadCalled = true
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    manager.unloadPlugin('test-plugin')
    // onUnload is called via executeHookSync which fires-and-forgets async hooks
    // Give microtask queue a chance to settle
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(unloadCalled).toBe(true)
  })

  it('does not throw when unloading a plugin that is not loaded', () => {
    const manager = createManager()
    expect(() => manager.unloadPlugin('not-loaded')).not.toThrow()
  })

  it('logs a warning when unloading a non-loaded plugin', () => {
    const warnings: string[] = []
    const capturingLogger: Logger = {
      ...silentLogger,
      warn: (msg: string) => {
        warnings.push(msg)
      },
    }
    const manager = createManager(new MockRegistry(), capturingLogger)
    manager.unloadPlugin('not-loaded')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('not loaded')
  })

  it('removes plugin from getAllPlugins after unload', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getAllPlugins()).toHaveLength(1)
    manager.unloadPlugin('test-plugin')
    expect(manager.getAllPlugins()).toHaveLength(0)
  })
})

// ─── unloadAll ───

describe('PluginManager – unloadAll', () => {
  it('unloads all loaded plugins', async () => {
    const registry = new MockRegistry()
    registry.register(makePlugin({ name: 'plugin-a' }))
    registry.register(makePlugin({ name: 'plugin-b' }))
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    expect(manager.getLoadedPluginNames()).toHaveLength(2)
    manager.unloadAll()
    expect(manager.getLoadedPluginNames()).toEqual([])
    expect(manager.getAllPlugins()).toEqual([])
  })

  it('removes all plugin configs', async () => {
    const registry = new MockRegistry()
    registry.register(makePlugin({ name: 'plugin-a' }))
    registry.register(makePlugin({ name: 'plugin-b' }))
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a', { config: { options: {} } })
    await manager.loadPlugin('plugin-b', { config: { options: {} } })
    manager.unloadAll()
    expect(manager.getPluginConfig('plugin-a')).toBeUndefined()
    expect(manager.getPluginConfig('plugin-b')).toBeUndefined()
  })

  it('is safe to call when no plugins are loaded', () => {
    const manager = createManager()
    expect(() => manager.unloadAll()).not.toThrow()
  })
})

// ─── reloadPlugin ───

describe('PluginManager – reloadPlugin', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('unloads and then loads the plugin', async () => {
    const plugin = makePlugin()
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(true)
    const reloaded = await manager.reloadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(true)
    expect(reloaded).toBe(plugin)
  })

  it('applies new config during reload', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin', {
      config: { options: { v: 1 } },
    })
    const newConfig: PluginConfig = { options: { v: 2 } }
    await manager.reloadPlugin('test-plugin', { config: newConfig })
    expect(manager.getPluginConfig('test-plugin')).toEqual(newConfig)
  })

  it('throws if plugin cannot be loaded during reload', async () => {
    const manager = createManager(registry)
    await expect(manager.reloadPlugin('missing')).rejects.toThrow(PluginLoadError)
  })
})

// ─── setPluginConfig / getPluginConfig ───

describe('PluginManager – Plugin Configuration', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('setPluginConfig updates the config of a loaded plugin', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    const newConfig: PluginConfig = { options: { x: 42 }, rules: {} }
    manager.setPluginConfig('test-plugin', newConfig)
    expect(manager.getPluginConfig('test-plugin')).toEqual(newConfig)
  })

  it('setPluginConfig throws PluginLoadError for unloaded plugin', () => {
    const manager = createManager()
    expect(() => manager.setPluginConfig('not-loaded', { options: {} })).toThrow(PluginLoadError)
  })

  it('setPluginConfig error mentions the plugin name', () => {
    const manager = createManager()
    try {
      manager.setPluginConfig('not-loaded', { options: {} })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(PluginLoadError)
      expect((error as PluginLoadError).pluginName).toBe('not-loaded')
    }
  })

  it('getPluginConfig returns undefined for unloaded plugin', () => {
    const manager = createManager()
    expect(manager.getPluginConfig('anything')).toBeUndefined()
  })
})

// ─── getPluginRules / getRule / getRules ───

describe('PluginManager – Rule Queries', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('getPluginRules returns rules for a loaded plugin', async () => {
    const rule = makeRule()
    const plugin = makePlugin({ rules: { 'my-rule': rule } })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getPluginRules('test-plugin')).toEqual({ 'my-rule': rule })
  })

  it('getPluginRules returns undefined for unloaded plugin', () => {
    const manager = createManager()
    expect(manager.getPluginRules('nonexistent')).toBeUndefined()
  })

  it('getPluginRules returns undefined when plugin has no rules', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getPluginRules('test-plugin')).toBeUndefined()
  })

  it('getRule resolves qualified name plugin/ruleName', async () => {
    const rule = makeRule()
    const plugin = makePlugin({ rules: { 'my-rule': rule } })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('test-plugin/my-rule')).toBe(rule)
  })

  it('getRule resolves scoped package @scope/plugin/ruleName', async () => {
    const rule = makeRule()
    const plugin = makePlugin({
      name: '@scope/codeforge-plugin-test',
      rules: { 'my-rule': rule },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('@scope/codeforge-plugin-test')
    expect(manager.getRule('@scope/codeforge-plugin-test/my-rule')).toBe(rule)
  })

  it('getRule returns undefined for unknown plugin', async () => {
    const manager = createManager()
    expect(manager.getRule('unknown/rule')).toBeUndefined()
  })

  it('getRule returns undefined for unknown rule', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('test-plugin/nonexistent')).toBeUndefined()
  })

  it('getRule returns undefined for malformed qualified name (no slash)', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('noproblems')).toBeUndefined()
  })

  it('getRule returns undefined for malformed qualified name (too many slashes unscoped)', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('a/b/c')).toBeUndefined()
  })

  it('getRule returns undefined for empty string', () => {
    const manager = createManager()
    expect(manager.getRule('')).toBeUndefined()
  })

  it('getRules aggregates all rules from all loaded plugins with qualified names', async () => {
    const ruleA = makeRule()
    const ruleB = makeRule()
    registry.register(makePlugin({ name: 'plugin-a', rules: { 'rule-a': ruleA } }))
    registry.register(makePlugin({ name: 'plugin-b', rules: { 'rule-b': ruleB } }))
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    const allRules = manager.getRules()
    expect(allRules['plugin-a/rule-a']).toBe(ruleA)
    expect(allRules['plugin-b/rule-b']).toBe(ruleB)
    expect(Object.keys(allRules)).toHaveLength(2)
  })

  it('getRules returns empty object when no plugins are loaded', () => {
    const manager = createManager()
    expect(manager.getRules()).toEqual({})
  })

  it('getRules skips plugins without rules', async () => {
    registry.register(makePlugin({ name: 'plugin-a' }))
    const ruleB = makeRule()
    registry.register(makePlugin({ name: 'plugin-b', rules: { 'rule-b': ruleB } }))
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    const allRules = manager.getRules()
    expect(Object.keys(allRules)).toEqual(['plugin-b/rule-b'])
  })
})

// ─── executeHook ───

describe('PluginManager – executeHook', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('executes a hook on all loaded plugins', async () => {
    const calls: string[] = []
    const pluginA = makePlugin({
      name: 'plugin-a',
      hooks: {
        beforeCheck: async () => {
          calls.push('a')
        },
      },
    })
    const pluginB = makePlugin({
      name: 'plugin-b',
      hooks: {
        beforeCheck: async () => {
          calls.push('b')
        },
      },
    })
    registry.register(pluginA)
    registry.register(pluginB)
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    await manager.executeHook('beforeCheck')
    expect(calls).toEqual(['a', 'b'])
  })

  it('executes a hook on a single plugin when plugin is passed', async () => {
    const calls: string[] = []
    const pluginA = makePlugin({
      name: 'plugin-a',
      hooks: {
        beforeCheck: async () => {
          calls.push('a')
        },
      },
    })
    const pluginB = makePlugin({
      name: 'plugin-b',
      hooks: {
        beforeCheck: async () => {
          calls.push('b')
        },
      },
    })
    registry.register(pluginA)
    registry.register(pluginB)
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    await manager.executeHook(pluginA, 'beforeCheck')
    expect(calls).toEqual(['a'])
  })

  it('does not throw when hook is not defined on plugin', async () => {
    registry.register(makePlugin({ hooks: {} }))
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    await expect(manager.executeHook('afterTransform')).resolves.toBeUndefined()
  })

  it('does not throw when plugin has no hooks at all', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    await expect(manager.executeHook('beforeCheck')).resolves.toBeUndefined()
  })

  it('throws HookExecutionError when a single-plugin hook throws', async () => {
    const plugin = makePlugin({
      name: 'failing-plugin',
      hooks: {
        beforeCheck: async () => {
          throw new Error('hook boom')
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('failing-plugin')
    await expect(manager.executeHook(plugin, 'beforeCheck')).rejects.toThrow(HookExecutionError)
  })

  it('HookExecutionError contains plugin name and hook name', async () => {
    const plugin = makePlugin({
      name: 'failing-plugin',
      hooks: {
        beforeCheck: async () => {
          throw new Error('hook boom')
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('failing-plugin')
    try {
      await manager.executeHook(plugin, 'beforeCheck')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(HookExecutionError)
      const hookErr = error as HookExecutionError
      expect(hookErr.pluginName).toBe('failing-plugin')
      expect(hookErr.hookName).toBe('beforeCheck')
    }
  })

  it('passes data to the hook context', async () => {
    let receivedData: unknown = null
    const plugin = makePlugin({
      name: 'data-plugin',
      hooks: {
        beforeCheck: async (ctx) => {
          receivedData = ctx.data
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('data-plugin')
    await manager.executeHook('beforeCheck', { key: 'value' })
    expect(receivedData).toEqual({ key: 'value' })
  })

  it('executeHook onError receives an Error object', async () => {
    let receivedMessage = ''
    const plugin = makePlugin({
      name: 'error-plugin',
      hooks: {
        onError: async (error: Error) => {
          receivedMessage = error.message
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('error-plugin')
    await manager.executeHook('onError', new Error('test error'))
    expect(receivedMessage).toBe('test error')
  })

  it('executeHook onError wraps non-Error data in Error', async () => {
    let receivedMessage = ''
    const plugin = makePlugin({
      name: 'error-plugin',
      hooks: {
        onError: async (error: Error) => {
          receivedMessage = error.message
        },
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await manager.loadPlugin('error-plugin')
    await manager.executeHook('onError', 'string-error')
    expect(receivedMessage).toBe('string-error')
  })

  it('continues executing hooks on other plugins when one fails (broadcast)', async () => {
    const calls: string[] = []
    const pluginA = makePlugin({
      name: 'plugin-a',
      hooks: {
        beforeCheck: async () => {
          throw new Error('fail')
        },
      },
    })
    const pluginB = makePlugin({
      name: 'plugin-b',
      hooks: {
        beforeCheck: async () => {
          calls.push('b')
        },
      },
    })
    registry.register(pluginA)
    registry.register(pluginB)
    const manager = createManager(registry)
    await manager.loadPlugin('plugin-a')
    await manager.loadPlugin('plugin-b')
    // Broadcast mode — should not throw, but continue to plugin-b
    await manager.executeHook('beforeCheck')
    expect(calls).toContain('b')
  })
})

// ─── validatePlugin (indirect tests) ───

describe('PluginManager – Plugin Validation', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('rejects a plugin with no name', async () => {
    const plugin = makePlugin({ name: '' })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a plugin with non-string name', async () => {
    const plugin = { ...makePlugin(), name: 42 as unknown as string }
    registry.get = (name: string) => (name === '42' ? plugin : undefined)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('42')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a plugin with no version', async () => {
    const plugin = makePlugin({ version: '' })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a plugin with non-string version', async () => {
    const plugin = { ...makePlugin(), version: 1 as unknown as string }
    registry.get = (name: string) => (name === 'test-plugin' ? plugin : undefined)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a rule without meta', async () => {
    const plugin = makePlugin({
      rules: {
        'bad-rule': { create: () => ({}) } as unknown as RuleDefinition,
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a rule without create function', async () => {
    const plugin = makePlugin({
      rules: {
        'bad-rule': { meta: makeRuleMeta() } as unknown as RuleDefinition,
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a rule with non-function create', async () => {
    const plugin = makePlugin({
      rules: {
        'bad-rule': {
          meta: makeRuleMeta(),
          create: 'not-a-function',
        } as unknown as RuleDefinition,
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a transform without transform function', async () => {
    const plugin = makePlugin({
      transforms: {
        'bad-transform': { name: 'bad-transform' } as unknown as TransformDefinition,
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('rejects a transform with non-function transform property', async () => {
    const plugin = makePlugin({
      transforms: {
        'bad-transform': {
          name: 'bad-transform',
          transform: 'not-a-function',
        } as unknown as TransformDefinition,
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('accepts a valid plugin with rules', async () => {
    const rule = makeRule()
    const plugin = makePlugin({ rules: { 'valid-rule': rule } })
    registry.register(plugin)
    const manager = createManager(registry)
    const loaded = await manager.loadPlugin('test-plugin')
    expect(loaded.rules!['valid-rule']).toBe(rule)
  })

  it('accepts a valid plugin with transforms', async () => {
    const transform = makeTransform()
    const plugin = makePlugin({ transforms: { 'valid-transform': transform } })
    registry.register(plugin)
    const manager = createManager(registry)
    const loaded = await manager.loadPlugin('test-plugin')
    expect(loaded.transforms!['valid-transform']).toBe(transform)
  })

  it('accepts a valid plugin with hooks', async () => {
    const plugin = makePlugin({
      hooks: {
        onLoad: async () => {},
        onUnload: async () => {},
      },
    })
    registry.register(plugin)
    const manager = createManager(registry)
    const loaded = await manager.loadPlugin('test-plugin')
    expect(loaded.hooks).toBeDefined()
  })
})

// ─── parseQualifiedName (indirect via getRule) ───

describe('PluginManager – Qualified Name Parsing', () => {
  let registry: MockRegistry

  beforeEach(() => {
    registry = new MockRegistry()
  })

  it('parses unscoped qualified name pluginName/ruleName', async () => {
    const rule = makeRule()
    registry.register(makePlugin({ name: 'my-plugin', rules: { 'my-rule': rule } }))
    const manager = createManager(registry)
    await manager.loadPlugin('my-plugin')
    expect(manager.getRule('my-plugin/my-rule')).toBe(rule)
  })

  it('parses scoped qualified name @scope/plugin/ruleName', async () => {
    const rule = makeRule()
    registry.register(
      makePlugin({ name: '@scope/my-plugin', rules: { 'my-rule': rule } }),
    )
    const manager = createManager(registry)
    await manager.loadPlugin('@scope/my-plugin')
    expect(manager.getRule('@scope/my-plugin/my-rule')).toBe(rule)
  })

  it('returns undefined for name with no slash', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('noslash')).toBeUndefined()
  })

  it('returns undefined for unscoped name with too many slashes', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('a/b/c')).toBeUndefined()
  })

  it('returns undefined for scoped name with missing rule part', async () => {
    registry.register(makePlugin())
    const manager = createManager(registry)
    await manager.loadPlugin('test-plugin')
    expect(manager.getRule('@scope/plugin')).toBeUndefined()
  })

  it('returns undefined for just @scope', async () => {
    const manager = createManager()
    expect(manager.getRule('@scope')).toBeUndefined()
  })

  it('returns undefined for @scope/ only', async () => {
    const manager = createManager()
    expect(manager.getRule('@scope/')).toBeUndefined()
  })
})

// ─── getWorkspaceRoot ───

describe('PluginManager – getWorkspaceRoot', () => {
  it('returns the workspace root provided in constructor', () => {
    const manager = new PluginManager({ workspaceRoot: '/custom/path' })
    expect(manager.getWorkspaceRoot()).toBe('/custom/path')
  })
})

// ─── getRegistry ───

describe('PluginManager – getRegistry', () => {
  it('returns the custom registry when provided', () => {
    const registry = new MockRegistry()
    const manager = createManager(registry)
    expect(manager.getRegistry()).toBe(registry)
  })
})
