import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  PluginManager,
  type PluginManagerOptions,
  type PluginLoadOptions,
} from '../../../src/plugins/manager.js'
import { PluginRegistry } from '../../../src/plugins/registry.js'
import { createDefaultLogger, createSilentLogger } from '../../../src/plugins/context.js'
import type {
  Plugin,
  PluginConfig,
  RuleDefinition,
  Logger,
  HookContext,
  PluginHooks,
} from '../../../src/plugins/types.js'
import { PluginLoadError, HookExecutionError } from '../../../src/plugins/types.js'

function createMockPlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  }
}

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

function createMockRule(name: string): RuleDefinition {
  return {
    meta: {
      type: 'problem',
      severity: 'error',
      docs: {
        description: `Test rule ${name}`,
      },
    },
    create: vi.fn().mockReturnValue({}),
  }
}

describe('PluginManager', () => {
  let manager: PluginManager
  let registry: PluginRegistry
  let mockLogger: Logger

  beforeEach(() => {
    registry = new PluginRegistry()
    mockLogger = createMockLogger()
    manager = new PluginManager({
      workspaceRoot: '/workspace',
      logger: mockLogger,
      registry,
    })
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('creates manager with default registry', () => {
      const defaultManager = new PluginManager({
        workspaceRoot: '/workspace',
      })

      expect(defaultManager.getRegistry()).toBeInstanceOf(PluginRegistry)
    })

    test('creates manager with custom registry', () => {
      const customRegistry = new PluginRegistry()
      const customManager = new PluginManager({
        workspaceRoot: '/workspace',
        registry: customRegistry,
      })

      expect(customManager.getRegistry()).toBe(customRegistry)
    })

    test('creates manager with default logger', () => {
      const defaultManager = new PluginManager({
        workspaceRoot: '/workspace',
      })

      expect(typeof defaultManager).toBe('object')
    })

    test('creates manager with custom logger', () => {
      const customLogger = createSilentLogger()
      const customManager = new PluginManager({
        workspaceRoot: '/workspace',
        logger: customLogger,
      })

      expect(typeof customManager).toBe('object')
    })

    test('stores workspaceRoot', () => {
      expect(manager.getWorkspaceRoot()).toBe('/workspace')
    })

    test('starts with no loaded plugins', () => {
      expect(manager.getAllPlugins()).toEqual([])
      expect(manager.getLoadedPluginNames()).toEqual([])
    })
  })

  describe('loadPlugin', () => {
    beforeEach(() => {
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          onLoad: vi.fn(),
        },
      })
      registry.register(plugin)
    })

    describe('loads plugin from registry', () => {
      test('loads and returns plugin', async () => {
        const loadedPlugin = await manager.loadPlugin('test-plugin')

        expect(loadedPlugin.name).toBe('test-plugin')
        expect(loadedPlugin.version).toBe('1.0.0')
      })

      test('marks plugin as loaded', async () => {
        await manager.loadPlugin('test-plugin')

        expect(manager.isLoaded('test-plugin')).toBe(true)
      })

      test('adds to loaded plugins list', async () => {
        await manager.loadPlugin('test-plugin')

        expect(manager.getLoadedPluginNames()).toContain('test-plugin')
      })

      test('executes onLoad hook', async () => {
        const onLoad = vi.fn()
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: { onLoad },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')

        expect(onLoad).toHaveBeenCalled()
      })

      test('passes HookContext to onLoad', async () => {
        let receivedContext: HookContext | undefined
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onLoad: (ctx: HookContext) => {
              receivedContext = ctx
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')

        expect(receivedContext).toBeDefined()
        expect(receivedContext?.logger).toBe(mockLogger)
        expect(receivedContext?.timestamp).toBeInstanceOf(Date)
      })

      test('logs successful load', async () => {
        await manager.loadPlugin('test-plugin')

        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('loaded successfully'))
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('test-plugin'))
      })

      test('includes version in success log', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          version: '2.1.3',
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')

        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('2.1.3'))
      })
    })

    describe('handles duplicate loads', () => {
      test('returns cached plugin on second load', async () => {
        const plugin1 = await manager.loadPlugin('test-plugin')
        const plugin2 = await manager.loadPlugin('test-plugin')

        expect(plugin1).toBe(plugin2)
      })

      test('does not execute onLoad twice on duplicate load', async () => {
        const onLoad = vi.fn()
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: { onLoad },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')
        await manager.loadPlugin('test-plugin')

        expect(onLoad).toHaveBeenCalledTimes(1)
      })
    })

    describe('validates plugin structure', () => {
      test('throws for plugin without name', async () => {
        const invalidPlugin = { version: '1.0.0' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws for plugin with empty name', async () => {
        const invalidPlugin = createMockPlugin({ name: '' })

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws for plugin without version', async () => {
        const invalidPlugin = { name: 'no-version' } as Plugin

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws for plugin with empty version', async () => {
        const invalidPlugin = createMockPlugin({ version: '' })

        expect(() => registry.register(invalidPlugin)).toThrow(PluginLoadError)
      })

      test('throws for rule without meta', async () => {
        registry.clear()
        const invalidPlugin = createMockPlugin({
          rules: {
            'invalid-rule': {
              create: vi.fn(),
            } as unknown as RuleDefinition,
          },
        })
        registry.register(invalidPlugin)

        await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
      })

      test('throws for rule without create function', async () => {
        registry.clear()
        const invalidPlugin = createMockPlugin({
          rules: {
            'invalid-rule': {
              meta: {
                type: 'problem',
                severity: 'error',
                docs: { description: 'test' },
              },
            } as unknown as RuleDefinition,
          },
        })
        registry.register(invalidPlugin)

        await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
      })

      test('throws for transform without transform function', async () => {
        registry.clear()
        const invalidPlugin = createMockPlugin({
          transforms: {
            'invalid-transform': {
              name: 'invalid-transform',
            } as any,
          },
        })
        registry.register(invalidPlugin)

        await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
      })
    })

    describe('handles missing plugins', () => {
      test('throws for non-existent plugin', async () => {
        await expect(manager.loadPlugin('nonexistent')).rejects.toThrow(PluginLoadError)
      })

      test('error includes plugin name', async () => {
        await expect(manager.loadPlugin('missing-plugin')).rejects.toThrow(/missing-plugin/)
      })

      test('error indicates plugin not found', async () => {
        await expect(manager.loadPlugin('missing')).rejects.toThrow(/not found/)
      })
    })

    describe('handles hook errors', () => {
      test('throws if onLoad hook throws', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onLoad: () => {
              throw new Error('Hook failed')
            },
          },
        })
        registry.register(plugin)

        await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(PluginLoadError)
      })

      test('includes hook error message in thrown error', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onLoad: () => {
              throw new Error('Hook failed')
            },
          },
        })
        registry.register(plugin)

        await expect(manager.loadPlugin('test-plugin')).rejects.toThrow(/Hook failed/)
      })

      test('throws PluginLoadError not hook error', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onLoad: () => {
              throw new Error('Hook failed')
            },
          },
        })
        registry.register(plugin)

        try {
          await manager.loadPlugin('test-plugin')
          expect.fail('Should have thrown')
        } catch (error) {
          expect(error).toBeInstanceOf(PluginLoadError)
          expect(error).not.toBeInstanceOf(HookExecutionError)
        }
      })
    })

    describe('config handling', () => {
      test('stores default config if none provided', async () => {
        await manager.loadPlugin('test-plugin')

        const config = manager.getPluginConfig('test-plugin')
        expect(config).toBeDefined()
        expect(config).toEqual({ options: {}, rules: {}, transforms: [] })
      })

      test('stores custom config if provided', async () => {
        const customConfig: PluginConfig = {
          options: { verbose: true },
          rules: { 'test-rule': 'warn' },
          transforms: ['transform-1'],
        }

        await manager.loadPlugin('test-plugin', { config: customConfig })

        const config = manager.getPluginConfig('test-plugin')
        expect(config).toEqual(customConfig)
      })

      test('stores config before onLoad hook', async () => {
        let configDuringLoad: PluginConfig | undefined
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onLoad: () => {
              configDuringLoad = manager.getPluginConfig('test-plugin')
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')

        expect(configDuringLoad).toBeDefined()
      })
    })
  })

  describe('unloadPlugin', () => {
    beforeEach(() => {
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          onLoad: vi.fn(),
          onUnload: vi.fn(),
        },
      })
      registry.register(plugin)
    })

    describe('removes loaded plugin', () => {
      test('unloads loaded plugin', async () => {
        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(manager.isLoaded('test-plugin')).toBe(false)
      })

      test('removes from loaded plugins list', async () => {
        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(manager.getLoadedPluginNames()).not.toContain('test-plugin')
      })

      test('executes onUnload hook', async () => {
        const onUnload = vi.fn()
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: { onUnload },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(onUnload).toHaveBeenCalled()
      })

      test('logs unload', async () => {
        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('unloaded'))
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('test-plugin'))
      })

      test('removes plugin config', async () => {
        await manager.loadPlugin('test-plugin', {
          config: { options: { test: true } },
        })

        expect(manager.getPluginConfig('test-plugin')).toBeDefined()

        manager.unloadPlugin('test-plugin')

        expect(manager.getPluginConfig('test-plugin')).toBeUndefined()
      })
    })

    describe('handles missing plugins', () => {
      test('warns for non-existent plugin', () => {
        manager.unloadPlugin('nonexistent')

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('not loaded'))
      })

      test('does not throw for non-existent plugin', () => {
        expect(() => manager.unloadPlugin('nonexistent')).not.toThrow()
      })

      test('warns for already unloaded plugin', async () => {
        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        vi.clearAllMocks()
        manager.unloadPlugin('test-plugin')

        expect(mockLogger.warn).toHaveBeenCalled()
      })
    })

    describe('handles hook errors', () => {
      test('logs onUnload hook error', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onUnload: () => {
              throw new Error('Unload failed')
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error during unloading'),
        )
      })

      test('removes plugin even if onUnload fails', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onUnload: () => {
              throw new Error('Unload failed')
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        expect(manager.isLoaded('test-plugin')).toBe(false)
      })

      test('does not throw on onUnload error', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onUnload: () => {
              throw new Error('Unload failed')
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')

        expect(() => manager.unloadPlugin('test-plugin')).not.toThrow()
      })
    })

    describe('handles async onUnload', () => {
      test('catches async onUnload errors', async () => {
        registry.clear()
        const plugin = createMockPlugin({
          name: 'test-plugin',
          hooks: {
            onUnload: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10))
              throw new Error('Async unload failed')
            },
          },
        })
        registry.register(plugin)

        await manager.loadPlugin('test-plugin')
        manager.unloadPlugin('test-plugin')

        await new Promise((resolve) => setTimeout(resolve, 50))
        expect(mockLogger.error).toHaveBeenCalled()
      })
    })
  })

  describe('getPlugin', () => {
    beforeEach(() => {
      const plugin = createMockPlugin()
      registry.register(plugin)
    })

    test('returns loaded plugin', async () => {
      await manager.loadPlugin('test-plugin')

      const retrieved = manager.getPlugin('test-plugin')

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('test-plugin')
    })

    test('returns undefined for non-existent plugin', () => {
      const retrieved = manager.getPlugin('nonexistent')

      expect(retrieved).toBeUndefined()
    })

    test('returns undefined for unloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      const retrieved = manager.getPlugin('test-plugin')

      expect(retrieved).toBeUndefined()
    })

    test('returns same instance on multiple calls', async () => {
      await manager.loadPlugin('test-plugin')

      const plugin1 = manager.getPlugin('test-plugin')
      const plugin2 = manager.getPlugin('test-plugin')

      expect(plugin1).toBe(plugin2)
    })
  })

  describe('getAllPlugins', () => {
    test('returns empty array when no plugins loaded', () => {
      const all = manager.getAllPlugins()

      expect(all).toEqual([])
    })

    test('returns single loaded plugin', async () => {
      const plugin = createMockPlugin()
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')

      const all = manager.getAllPlugins()

      expect(all).toHaveLength(1)
      expect(all[0].name).toBe('test-plugin')
    })

    test('returns multiple loaded plugins', async () => {
      registry.clear()
      const plugin1 = createMockPlugin({ name: 'plugin-1' })
      const plugin2 = createMockPlugin({ name: 'plugin-2' })
      const plugin3 = createMockPlugin({ name: 'plugin-3' })

      registry.register(plugin1)
      registry.register(plugin2)
      registry.register(plugin3)

      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      await manager.loadPlugin('plugin-3')

      const all = manager.getAllPlugins()

      expect(all).toHaveLength(3)
      expect(all.map((p) => p.name)).toEqual(['plugin-1', 'plugin-2', 'plugin-3'])
    })

    test('excludes unloaded plugins', async () => {
      registry.clear()
      const plugin1 = createMockPlugin({ name: 'plugin-1' })
      const plugin2 = createMockPlugin({ name: 'plugin-2' })

      registry.register(plugin1)
      registry.register(plugin2)

      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      manager.unloadPlugin('plugin-1')

      const all = manager.getAllPlugins()

      expect(all).toHaveLength(1)
      expect(all[0].name).toBe('plugin-2')
    })

    test('returns new array on each call', async () => {
      const plugin = createMockPlugin()
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')

      const all1 = manager.getAllPlugins()
      const all2 = manager.getAllPlugins()

      expect(all1).not.toBe(all2)
      expect(all1).toEqual(all2)
    })
  })

  describe('getLoadedPluginNames', () => {
    test('returns empty array when no plugins loaded', () => {
      const names = manager.getLoadedPluginNames()

      expect(names).toEqual([])
    })

    test('returns single plugin name', async () => {
      const plugin = createMockPlugin()
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')

      const names = manager.getLoadedPluginNames()

      expect(names).toEqual(['test-plugin'])
    })

    test('returns multiple plugin names', async () => {
      registry.clear()
      const plugin1 = createMockPlugin({ name: 'plugin-a' })
      const plugin2 = createMockPlugin({ name: 'plugin-b' })
      const plugin3 = createMockPlugin({ name: 'plugin-c' })

      registry.register(plugin1)
      registry.register(plugin2)
      registry.register(plugin3)

      await manager.loadPlugin('plugin-a')
      await manager.loadPlugin('plugin-b')
      await manager.loadPlugin('plugin-c')

      const names = manager.getLoadedPluginNames()

      expect(names).toHaveLength(3)
      expect(names).toContain('plugin-a')
      expect(names).toContain('plugin-b')
      expect(names).toContain('plugin-c')
    })

    test('excludes unloaded plugin names', async () => {
      registry.clear()
      const plugin1 = createMockPlugin({ name: 'plugin-1' })
      const plugin2 = createMockPlugin({ name: 'plugin-2' })

      registry.register(plugin1)
      registry.register(plugin2)

      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      manager.unloadPlugin('plugin-1')

      const names = manager.getLoadedPluginNames()

      expect(names).toEqual(['plugin-2'])
    })
  })

  describe('isLoaded', () => {
    beforeEach(() => {
      const plugin = createMockPlugin()
      registry.register(plugin)
    })

    test('returns true for loaded plugin', async () => {
      await manager.loadPlugin('test-plugin')

      expect(manager.isLoaded('test-plugin')).toBe(true)
    })

    test('returns false for non-existent plugin', () => {
      expect(manager.isLoaded('nonexistent')).toBe(false)
    })

    test('returns false for unloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      expect(manager.isLoaded('test-plugin')).toBe(false)
    })

    test('returns false before loading', () => {
      expect(manager.isLoaded('test-plugin')).toBe(false)
    })
  })

  describe('getRules', () => {
    beforeEach(() => {
      const plugin1 = createMockPlugin({
        name: 'plugin-1',
        rules: {
          'rule-1': createMockRule('rule-1'),
          'rule-2': createMockRule('rule-2'),
        },
      })
      const plugin2 = createMockPlugin({
        name: 'plugin-2',
        rules: {
          'rule-a': createMockRule('rule-a'),
        },
      })
      registry.register(plugin1)
      registry.register(plugin2)
    })

    test('returns empty object when no plugins loaded', () => {
      const rules = manager.getRules()

      expect(rules).toEqual({})
    })

    test('returns rules from single plugin', async () => {
      await manager.loadPlugin('plugin-1')

      const rules = manager.getRules()

      expect(rules).toHaveProperty('plugin-1/rule-1')
      expect(rules).toHaveProperty('plugin-1/rule-2')
    })

    test('returns rules from multiple plugins', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')

      const rules = manager.getRules()

      expect(rules).toHaveProperty('plugin-1/rule-1')
      expect(rules).toHaveProperty('plugin-1/rule-2')
      expect(rules).toHaveProperty('plugin-2/rule-a')
    })

    test('uses qualified names', async () => {
      await manager.loadPlugin('plugin-1')

      const rules = manager.getRules()

      expect(Object.keys(rules)).toContain('plugin-1/rule-1')
      expect(Object.keys(rules)).not.toContain('rule-1')
    })

    test('excludes rules from unloaded plugins', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      manager.unloadPlugin('plugin-1')

      const rules = manager.getRules()

      expect(rules).not.toHaveProperty('plugin-1/rule-1')
      expect(rules).toHaveProperty('plugin-2/rule-a')
    })

    test('handles plugin without rules', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'no-rules-plugin',
      })
      registry.register(plugin)

      await manager.loadPlugin('no-rules-plugin')

      const rules = manager.getRules()

      expect(rules).toEqual({})
    })
  })

  describe('getPluginRules', () => {
    beforeEach(() => {
      const plugin = createMockPlugin({
        name: 'test-plugin',
        rules: {
          'rule-1': createMockRule('rule-1'),
          'rule-2': createMockRule('rule-2'),
        },
      })
      registry.register(plugin)
    })

    test('returns rules for loaded plugin', async () => {
      await manager.loadPlugin('test-plugin')

      const rules = manager.getPluginRules('test-plugin')

      expect(rules).toBeDefined()
      expect(rules).toHaveProperty('rule-1')
      expect(rules).toHaveProperty('rule-2')
    })

    test('returns undefined for non-existent plugin', () => {
      const rules = manager.getPluginRules('nonexistent')

      expect(rules).toBeUndefined()
    })

    test('returns undefined for unloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      const rules = manager.getPluginRules('test-plugin')

      expect(rules).toBeUndefined()
    })

    test('returns undefined for plugin without rules', async () => {
      registry.clear()
      const plugin = createMockPlugin({ name: 'no-rules' })
      registry.register(plugin)

      await manager.loadPlugin('no-rules')

      const rules = manager.getPluginRules('no-rules')

      expect(rules).toBeUndefined()
    })
  })

  describe('getRule', () => {
    beforeEach(() => {
      const plugin = createMockPlugin({
        name: 'test-plugin',
        rules: {
          'rule-1': createMockRule('rule-1'),
          'rule-2': createMockRule('rule-2'),
        },
      })
      registry.register(plugin)
    })

    test('returns rule by qualified name', async () => {
      const expectedRule = createMockRule('rule-1')
      registry.clear()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        rules: {
          'rule-1': expectedRule,
          'rule-2': createMockRule('rule-2'),
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')

      const rule = manager.getRule('test-plugin/rule-1')

      expect(rule).toBeDefined()
      expect(rule).toBe(expectedRule)
    })

    test('returns undefined for non-existent rule', async () => {
      await manager.loadPlugin('test-plugin')

      const rule = manager.getRule('test-plugin/nonexistent')

      expect(rule).toBeUndefined()
    })

    test('returns undefined for invalid qualified name', () => {
      const rule = manager.getRule('invalid')

      expect(rule).toBeUndefined()
    })

    test('returns undefined for unloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      const rule = manager.getRule('test-plugin/rule-1')

      expect(rule).toBeUndefined()
    })

    test('handles scoped plugin names', async () => {
      registry.clear()
      const scopedPlugin = createMockPlugin({
        name: '@scope/test-plugin',
        rules: {
          'rule-1': createMockRule('rule-1'),
        },
      })
      registry.register(scopedPlugin)

      await manager.loadPlugin('@scope/test-plugin')

      const rule = manager.getRule('@scope/test-plugin/rule-1')

      expect(rule).toBeDefined()
    })
  })

  describe('executeHook', () => {
    beforeEach(() => {
      const plugin1 = createMockPlugin({
        name: 'plugin-1',
        hooks: {
          beforeCheck: vi.fn(),
          afterCheck: vi.fn(),
        },
      })
      const plugin2 = createMockPlugin({
        name: 'plugin-2',
        hooks: {
          beforeCheck: vi.fn(),
        },
      })
      registry.register(plugin1)
      registry.register(plugin2)
    })

    test('executes hook on all loaded plugins', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')

      await manager.executeHook('beforeCheck')

      const plugin1Hooks = manager.getPlugin('plugin-1')?.hooks
      const plugin2Hooks = manager.getPlugin('plugin-2')?.hooks

      expect(plugin1Hooks?.beforeCheck).toHaveBeenCalled()
      expect(plugin2Hooks?.beforeCheck).toHaveBeenCalled()
    })

    test('executes hook on single plugin', async () => {
      await manager.loadPlugin('plugin-1')
      const plugin = manager.getPlugin('plugin-1')

      if (plugin) {
        await manager.executeHook(plugin, 'beforeCheck')
      }

      const hooks = manager.getPlugin('plugin-1')?.hooks

      expect(hooks?.beforeCheck).toHaveBeenCalledTimes(1)
    })

    test('passes data to hook', async () => {
      let receivedData: unknown
      registry.clear()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          beforeCheck: (ctx: HookContext) => {
            receivedData = ctx.data
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')
      await manager.executeHook('beforeCheck', { test: 'data' })

      expect(receivedData).toEqual({ test: 'data' })
    })

    test('handles hook that throws', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          beforeCheck: () => {
            throw new Error('Hook error')
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')
      await manager.executeHook('beforeCheck')

      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Some hooks failed'))
    })

    test('continues execution after one hook fails', async () => {
      registry.clear()
      const plugin1 = createMockPlugin({
        name: 'plugin-1',
        hooks: {
          beforeCheck: () => {
            throw new Error('Hook error')
          },
        },
      })
      const plugin2 = createMockPlugin({
        name: 'plugin-2',
        hooks: {
          beforeCheck: vi.fn(),
        },
      })
      registry.register(plugin1)
      registry.register(plugin2)

      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')

      await manager.executeHook('beforeCheck')

      const plugin2Hooks = manager.getPlugin('plugin-2')?.hooks
      expect(plugin2Hooks?.beforeCheck).toHaveBeenCalled()
    })

    test('handles onError hook with error data', async () => {
      let receivedError: Error | undefined
      registry.clear()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          onError: (error: Error, ctx: HookContext) => {
            receivedError = error
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')
      const testError = new Error('Test error')
      await manager.executeHook('onError', testError)

      expect(receivedError).toBe(testError)
    })
  })

  describe('getRegistry', () => {
    test('returns the registry', () => {
      const returnedRegistry = manager.getRegistry()

      expect(returnedRegistry).toBe(registry)
    })

    test('returns same instance on multiple calls', () => {
      const registry1 = manager.getRegistry()
      const registry2 = manager.getRegistry()

      expect(registry1).toBe(registry2)
    })
  })

  describe('getWorkspaceRoot', () => {
    test('returns workspace root', () => {
      const workspaceRoot = manager.getWorkspaceRoot()

      expect(workspaceRoot).toBe('/workspace')
    })

    test('returns same value on multiple calls', () => {
      const root1 = manager.getWorkspaceRoot()
      const root2 = manager.getWorkspaceRoot()

      expect(root1).toBe(root2)
    })
  })

  describe('unloadAll', () => {
    beforeEach(() => {
      const plugin1 = createMockPlugin({
        name: 'plugin-1',
        hooks: {
          onUnload: vi.fn(),
        },
      })
      const plugin2 = createMockPlugin({
        name: 'plugin-2',
        hooks: {
          onUnload: vi.fn(),
        },
      })
      const plugin3 = createMockPlugin({
        name: 'plugin-3',
        hooks: {
          onUnload: vi.fn(),
        },
      })
      registry.register(plugin1)
      registry.register(plugin2)
      registry.register(plugin3)
    })

    test('unloads all plugins', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      await manager.loadPlugin('plugin-3')

      manager.unloadAll()

      expect(manager.getAllPlugins()).toEqual([])
      expect(manager.getLoadedPluginNames()).toEqual([])
    })

    test('calls onUnload for all plugins', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')
      await manager.loadPlugin('plugin-3')

      const plugin1Hooks = manager.getPlugin('plugin-1')?.hooks
      const plugin2Hooks = manager.getPlugin('plugin-2')?.hooks
      const plugin3Hooks = manager.getPlugin('plugin-3')?.hooks

      manager.unloadAll()

      expect(plugin1Hooks?.onUnload).toHaveBeenCalled()
      expect(plugin2Hooks?.onUnload).toHaveBeenCalled()
      expect(plugin3Hooks?.onUnload).toHaveBeenCalled()
    })

    test('does nothing when no plugins loaded', () => {
      expect(() => manager.unloadAll()).not.toThrow()
    })

    test('handles single plugin', async () => {
      await manager.loadPlugin('plugin-1')

      manager.unloadAll()

      expect(manager.isLoaded('plugin-1')).toBe(false)
    })

    test('logs unload for each plugin', async () => {
      await manager.loadPlugin('plugin-1')
      await manager.loadPlugin('plugin-2')

      manager.unloadAll()

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('plugin-1'))
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('plugin-2'))
    })
  })

  describe('reloadPlugin', () => {
    beforeEach(() => {
      registry.clear()
      const onLoad = vi.fn()
      const onUnload = vi.fn()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          onLoad,
          onUnload,
        },
      })
      registry.register(plugin)
    })

    test('unloads and reloads plugin', async () => {
      await manager.loadPlugin('test-plugin')

      const reloaded = await manager.reloadPlugin('test-plugin')

      expect(reloaded.name).toBe('test-plugin')
      expect(manager.isLoaded('test-plugin')).toBe(true)
    })

    test('calls onUnload then onLoad', async () => {
      const onLoad = vi.fn()
      const onUnload = vi.fn()
      registry.clear()
      const plugin = createMockPlugin({
        name: 'test-plugin',
        hooks: {
          onLoad,
          onUnload,
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')
      await manager.reloadPlugin('test-plugin')

      expect(onUnload).toHaveBeenCalled()
      expect(onLoad).toHaveBeenCalled()
    })

    test('applies new config', async () => {
      await manager.loadPlugin('test-plugin')

      const newConfig: PluginConfig = {
        options: { newOption: true },
      }

      await manager.reloadPlugin('test-plugin', { config: newConfig })

      expect(manager.getPluginConfig('test-plugin')).toEqual(newConfig)
    })

    test('throws for non-existent plugin', async () => {
      await expect(manager.reloadPlugin('nonexistent')).rejects.toThrow(PluginLoadError)
    })

    test('returns reloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')

      const reloaded = await manager.reloadPlugin('test-plugin')

      expect(reloaded).toBeDefined()
      expect(reloaded.name).toBe('test-plugin')
    })
  })

  describe('getPluginConfig', () => {
    test('returns undefined for non-existent plugin', () => {
      const config = manager.getPluginConfig('nonexistent')

      expect(config).toBeUndefined()
    })

    test('returns config for loaded plugin', async () => {
      const plugin = createMockPlugin()
      registry.register(plugin)

      const customConfig: PluginConfig = {
        options: { test: true },
        rules: { 'test-rule': 'warn' },
      }

      await manager.loadPlugin('test-plugin', { config: customConfig })

      const config = manager.getPluginConfig('test-plugin')

      expect(config).toEqual(customConfig)
    })

    test('returns default config if none set', async () => {
      const plugin = createMockPlugin()
      registry.register(plugin)

      await manager.loadPlugin('test-plugin')

      const config = manager.getPluginConfig('test-plugin')

      expect(config).toEqual({ options: {}, rules: {}, transforms: [] })
    })
  })

  describe('setPluginConfig', () => {
    beforeEach(() => {
      const plugin = createMockPlugin()
      registry.register(plugin)
    })

    test('sets config for loaded plugin', async () => {
      await manager.loadPlugin('test-plugin')

      const newConfig: PluginConfig = {
        options: { newOption: true },
      }

      manager.setPluginConfig('test-plugin', newConfig)

      expect(manager.getPluginConfig('test-plugin')).toEqual(newConfig)
    })

    test('replaces existing config', async () => {
      await manager.loadPlugin('test-plugin', {
        config: { options: { old: true } },
      })

      const newConfig: PluginConfig = {
        options: { new: true },
      }

      manager.setPluginConfig('test-plugin', newConfig)

      expect(manager.getPluginConfig('test-plugin')).toEqual(newConfig)
      expect(manager.getPluginConfig('test-plugin')).not.toEqual({
        options: { old: true },
      })
    })

    test('throws for non-existent plugin', () => {
      expect(() => manager.setPluginConfig('nonexistent', {})).toThrow(PluginLoadError)
    })

    test('throws for unloaded plugin', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      expect(() => manager.setPluginConfig('test-plugin', {})).toThrow(PluginLoadError)
    })

    test('error includes plugin name', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      expect(() => manager.setPluginConfig('test-plugin', {})).toThrow(/test-plugin/)
    })

    test('error indicates plugin not loaded', async () => {
      await manager.loadPlugin('test-plugin')
      manager.unloadPlugin('test-plugin')

      expect(() => manager.setPluginConfig('test-plugin', {})).toThrow(/unloaded/)
    })
  })
})
