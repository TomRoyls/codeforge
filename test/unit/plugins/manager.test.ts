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

  // ===================================================================
  // EXPANSION: Plugin loading edge cases
  // ===================================================================
  describe('loadPlugin - edge cases', () => {
    test('loads plugin with only name and version', async () => {
      const minimalPlugin = createMockPlugin({ name: 'minimal' })
      registry.register(minimalPlugin)

      const loaded = await manager.loadPlugin('minimal')
      expect(loaded.name).toBe('minimal')
      expect(loaded.version).toBe('1.0.0')
    })

    test('loads plugin with no hooks', async () => {
      const noHooksPlugin = createMockPlugin({ name: 'no-hooks' })
      registry.register(noHooksPlugin)

      const loaded = await manager.loadPlugin('no-hooks')
      expect(loaded).toBeDefined()
      expect(manager.isLoaded('no-hooks')).toBe(true)
    })

    test('loads plugin with description', async () => {
      const descPlugin = createMockPlugin({
        name: 'described',
        description: 'A test plugin with description',
      })
      registry.register(descPlugin)

      const loaded = await manager.loadPlugin('described')
      expect(loaded.description).toBe('A test plugin with description')
    })

    test('loads plugin with engines field', async () => {
      const plugin = createMockPlugin({
        name: 'engined',
        engines: { codeforge: '^1.0.0' },
      })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('engined')
      expect(loaded.engines).toEqual({ codeforge: '^1.0.0' })
    })

    test('loads plugin with dependencies field', async () => {
      const plugin = createMockPlugin({
        name: 'dep-plugin',
        dependencies: ['other-plugin'],
      })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('dep-plugin')
      expect(loaded.dependencies).toEqual(['other-plugin'])
    })

    test('loads plugin with valid transforms', async () => {
      const plugin = createMockPlugin({
        name: 'transform-plugin',
        transforms: {
          'my-transform': {
            name: 'my-transform',
            description: 'A test transform',
            transform: vi.fn().mockReturnValue('transformed'),
          },
        },
      })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('transform-plugin')
      expect(loaded.transforms).toBeDefined()
      expect(loaded.transforms?.['my-transform']).toBeDefined()
    })

    test('loads multiple plugins in sequence', async () => {
      const p1 = createMockPlugin({ name: 'seq-1' })
      const p2 = createMockPlugin({ name: 'seq-2' })
      const p3 = createMockPlugin({ name: 'seq-3' })
      registry.register(p1)
      registry.register(p2)
      registry.register(p3)

      await manager.loadPlugin('seq-1')
      await manager.loadPlugin('seq-2')
      await manager.loadPlugin('seq-3')

      expect(manager.getLoadedPluginNames()).toHaveLength(3)
    })

    test('loads plugin with async onLoad hook', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const plugin = createMockPlugin({ name: 'async-load', hooks: { onLoad } })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('async-load')
      expect(loaded).toBeDefined()
      expect(onLoad).toHaveBeenCalled()
    })

    test('rejects when onLoad returns rejected promise', async () => {
      const plugin = createMockPlugin({
        name: 'reject-load',
        hooks: {
          onLoad: async () => {
            await Promise.resolve()
            throw new Error('Async rejection')
          },
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('reject-load')).rejects.toThrow(PluginLoadError)
      await expect(manager.loadPlugin('reject-load')).rejects.toThrow(/Async rejection/)
    })

    test('loads plugin with rules and hooks together', async () => {
      const plugin = createMockPlugin({
        name: 'full-plugin',
        rules: {
          'rule-a': createMockRule('rule-a'),
        },
        hooks: {
          onLoad: vi.fn(),
          beforeCheck: vi.fn(),
        },
      })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('full-plugin')
      expect(loaded.rules).toBeDefined()
      expect(loaded.rules?.['rule-a']).toBeDefined()
      expect(manager.isLoaded('full-plugin')).toBe(true)
    })

    test('does not add plugin to loaded list on validation failure', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'fail-plugin',
        rules: {
          bad: { create: vi.fn() } as unknown as RuleDefinition,
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('fail-plugin')).rejects.toThrow()
      expect(manager.isLoaded('fail-plugin')).toBe(false)
    })

    test('does not store config on load failure', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'fail-plugin-2',
        rules: {
          bad: { create: vi.fn() } as unknown as RuleDefinition,
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('fail-plugin-2')).rejects.toThrow()
      expect(manager.getPluginConfig('fail-plugin-2')).toBeUndefined()
    })

    test('loads plugin with scoped name', async () => {
      const scopedPlugin = createMockPlugin({ name: '@myorg/my-plugin' })
      registry.register(scopedPlugin)

      const loaded = await manager.loadPlugin('@myorg/my-plugin')
      expect(loaded.name).toBe('@myorg/my-plugin')
    })

    test('loads plugin with numeric-looking version string', async () => {
      const plugin = createMockPlugin({ name: 'ver-plugin', version: '0.0.1-beta.1' })
      registry.register(plugin)

      const loaded = await manager.loadPlugin('ver-plugin')
      expect(loaded.version).toBe('0.0.1-beta.1')
    })
  })

  // ===================================================================
  // EXPANSION: Plugin unload edge cases
  // ===================================================================
  describe('unloadPlugin - edge cases', () => {
    test('unloading plugin with no hooks does not throw', async () => {
      const plugin = createMockPlugin({ name: 'no-hooks-unload' })
      registry.register(plugin)
      await manager.loadPlugin('no-hooks-unload')

      expect(() => manager.unloadPlugin('no-hooks-unload')).not.toThrow()
      expect(manager.isLoaded('no-hooks-unload')).toBe(false)
    })

    test('unload then reload same plugin', async () => {
      const onLoad = vi.fn()
      const onUnload = vi.fn()
      const plugin = createMockPlugin({
        name: 'cycle-plugin',
        hooks: { onLoad, onUnload },
      })
      registry.register(plugin)

      await manager.loadPlugin('cycle-plugin')
      manager.unloadPlugin('cycle-plugin')
      expect(manager.isLoaded('cycle-plugin')).toBe(false)

      await manager.loadPlugin('cycle-plugin')
      expect(manager.isLoaded('cycle-plugin')).toBe(true)
      expect(onLoad).toHaveBeenCalledTimes(2)
      expect(onUnload).toHaveBeenCalledTimes(1)
    })

    test('unloading one plugin does not affect others', async () => {
      const p1 = createMockPlugin({ name: 'keep-1' })
      const p2 = createMockPlugin({ name: 'keep-2' })
      registry.register(p1)
      registry.register(p2)

      await manager.loadPlugin('keep-1')
      await manager.loadPlugin('keep-2')

      manager.unloadPlugin('keep-1')

      expect(manager.isLoaded('keep-1')).toBe(false)
      expect(manager.isLoaded('keep-2')).toBe(true)
    })

    test('calling unloadPlugin multiple times does not throw', async () => {
      const plugin = createMockPlugin({ name: 'multi-unload' })
      registry.register(plugin)
      await manager.loadPlugin('multi-unload')

      manager.unloadPlugin('multi-unload')
      expect(() => manager.unloadPlugin('multi-unload')).not.toThrow()
      expect(() => manager.unloadPlugin('multi-unload')).not.toThrow()
    })

    test('unloading plugin removes its rules from getRules', async () => {
      const plugin = createMockPlugin({
        name: 'rules-unload',
        rules: { 'my-rule': createMockRule('my-rule') },
      })
      registry.register(plugin)

      await manager.loadPlugin('rules-unload')
      expect(manager.getRules()).toHaveProperty('rules-unload/my-rule')

      manager.unloadPlugin('rules-unload')
      expect(manager.getRules()).not.toHaveProperty('rules-unload/my-rule')
    })

    test('unloading plugin clears config', async () => {
      const plugin = createMockPlugin({ name: 'config-clear' })
      registry.register(plugin)

      await manager.loadPlugin('config-clear', {
        config: { options: { foo: 'bar' } },
      })
      expect(manager.getPluginConfig('config-clear')).toBeDefined()

      manager.unloadPlugin('config-clear')
      expect(manager.getPluginConfig('config-clear')).toBeUndefined()
    })
  })

  // ===================================================================
  // EXPANSION: Plugin lifecycle (init, start, stop, destroy)
  // ===================================================================
  describe('plugin lifecycle hooks', () => {
    test('executes beforeCheck hook', async () => {
      const beforeCheck = vi.fn()
      const plugin = createMockPlugin({
        name: 'lifecycle-1',
        hooks: { beforeCheck },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-1')
      await manager.executeHook('beforeCheck')

      expect(beforeCheck).toHaveBeenCalled()
    })

    test('executes afterCheck hook', async () => {
      const afterCheck = vi.fn()
      const plugin = createMockPlugin({
        name: 'lifecycle-2',
        hooks: { afterCheck },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-2')
      await manager.executeHook('afterCheck')

      expect(afterCheck).toHaveBeenCalled()
    })

    test('executes beforeTransform hook', async () => {
      const beforeTransform = vi.fn()
      const plugin = createMockPlugin({
        name: 'lifecycle-3',
        hooks: { beforeTransform },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-3')
      await manager.executeHook('beforeTransform')

      expect(beforeTransform).toHaveBeenCalled()
    })

    test('executes afterTransform hook', async () => {
      const afterTransform = vi.fn()
      const plugin = createMockPlugin({
        name: 'lifecycle-4',
        hooks: { afterTransform },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-4')
      await manager.executeHook('afterTransform')

      expect(afterTransform).toHaveBeenCalled()
    })

    test('executes onError hook with error instance', async () => {
      let captured: Error | undefined
      const plugin = createMockPlugin({
        name: 'lifecycle-5',
        hooks: {
          onError: (err: Error) => {
            captured = err
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-5')
      const testErr = new Error('boom')
      await manager.executeHook('onError', testErr)

      expect(captured).toBe(testErr)
    })

    test('executes onError hook wrapping non-error data', async () => {
      let captured: Error | undefined
      const plugin = createMockPlugin({
        name: 'lifecycle-6',
        hooks: {
          onError: (err: Error) => {
            captured = err
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-6')
      await manager.executeHook('onError', 'string error')

      expect(captured).toBeInstanceOf(Error)
      expect(captured?.message).toBe('string error')
    })

    test('executes onError hook with undefined data', async () => {
      let captured: Error | undefined
      const plugin = createMockPlugin({
        name: 'lifecycle-7',
        hooks: {
          onError: (err: Error) => {
            captured = err
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('lifecycle-7')
      await manager.executeHook('onError', undefined)

      expect(captured).toBeInstanceOf(Error)
      expect(captured?.message).toBe('Unknown error')
    })

    test('skips hook when plugin has no hooks object', async () => {
      const plugin = createMockPlugin({ name: 'no-hooks-lifecycle' })
      registry.register(plugin)

      await manager.loadPlugin('no-hooks-lifecycle')
      await expect(manager.executeHook('beforeCheck')).resolves.toBeUndefined()
    })

    test('skips hook when hook is undefined on plugin', async () => {
      const plugin = createMockPlugin({
        name: 'partial-hooks',
        hooks: {
          onLoad: vi.fn(),
          // beforeCheck is deliberately not defined
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('partial-hooks')
      await expect(manager.executeHook('beforeCheck')).resolves.toBeUndefined()
    })

    test('passes correct data to beforeCheck', async () => {
      let received: unknown
      const plugin = createMockPlugin({
        name: 'data-check',
        hooks: {
          beforeCheck: (ctx: HookContext) => {
            received = ctx.data
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('data-check')
      await manager.executeHook('beforeCheck', { file: 'test.ts' })

      expect(received).toEqual({ file: 'test.ts' })
    })

    test('hook context includes timestamp', async () => {
      let ts: Date | undefined
      const plugin = createMockPlugin({
        name: 'ts-check',
        hooks: {
          afterCheck: (ctx: HookContext) => {
            ts = ctx.timestamp
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('ts-check')
      await manager.executeHook('afterCheck')

      expect(ts).toBeInstanceOf(Date)
      expect(ts!.getTime()).toBeLessThanOrEqual(Date.now())
    })

    test('hook context includes logger', async () => {
      let ctxLogger: Logger | undefined
      const plugin = createMockPlugin({
        name: 'logger-check',
        hooks: {
          beforeCheck: (ctx: HookContext) => {
            ctxLogger = ctx.logger
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('logger-check')
      await manager.executeHook('beforeCheck')

      expect(ctxLogger).toBe(mockLogger)
    })

    test('executes hook on single plugin (overload)', async () => {
      const beforeCheck = vi.fn()
      const plugin = createMockPlugin({
        name: 'single-hook',
        hooks: { beforeCheck },
      })
      registry.register(plugin)

      await manager.loadPlugin('single-hook')
      const loadedPlugin = manager.getPlugin('single-hook')

      expect(loadedPlugin).toBeDefined()
      await manager.executeHook(loadedPlugin!, 'beforeCheck')

      expect(beforeCheck).toHaveBeenCalledTimes(1)
    })
  })

  // ===================================================================
  // EXPANSION: Plugin discovery
  // ===================================================================
  describe('plugin discovery', () => {
    test('registry has method to register plugins', () => {
      expect(typeof registry.register).toBe('function')
    })

    test('registry has method to get plugins', () => {
      expect(typeof registry.get).toBe('function')
    })

    test('registry has method to check if plugin exists', () => {
      expect(typeof registry.has).toBe('function')
    })

    test('registry has method to get all plugins', () => {
      expect(typeof registry.getAll).toBe('function')
    })

    test('registry has method to get plugin names', () => {
      expect(typeof registry.getNames).toBe('function')
    })

    test('registry clear removes all plugins', () => {
      const p1 = createMockPlugin({ name: 'clear-1' })
      const p2 = createMockPlugin({ name: 'clear-2' })
      registry.register(p1)
      registry.register(p2)

      expect(registry.size).toBe(2)
      registry.clear()
      expect(registry.size).toBe(0)
    })

    test('registry size reflects registered count', () => {
      expect(registry.size).toBe(0)

      registry.register(createMockPlugin({ name: 'size-1' }))
      expect(registry.size).toBe(1)

      registry.register(createMockPlugin({ name: 'size-2' }))
      expect(registry.size).toBe(2)
    })

    test('registry returns plugin by name', () => {
      const p = createMockPlugin({ name: 'get-by-name' })
      registry.register(p)

      expect(registry.get('get-by-name')).toBe(p)
      expect(registry.get('nonexistent')).toBeUndefined()
    })

    test('registry has checks existence', () => {
      registry.register(createMockPlugin({ name: 'exists-check' }))

      expect(registry.has('exists-check')).toBe(true)
      expect(registry.has('nope')).toBe(false)
    })

    test('registry getNames returns all names', () => {
      registry.register(createMockPlugin({ name: 'names-1' }))
      registry.register(createMockPlugin({ name: 'names-2' }))

      const names = registry.getNames()
      expect(names).toContain('names-1')
      expect(names).toContain('names-2')
    })

    test('registry getAll returns all plugins', () => {
      registry.register(createMockPlugin({ name: 'all-1' }))
      registry.register(createMockPlugin({ name: 'all-2' }))

      const all = registry.getAll()
      expect(all).toHaveLength(2)
    })

    test('registry unregister removes plugin', () => {
      registry.register(createMockPlugin({ name: 'unreg-1' }))
      expect(registry.has('unreg-1')).toBe(true)

      registry.unregister('unreg-1')
      expect(registry.has('unreg-1')).toBe(false)
    })

    test('registry unregister throws for non-existent', () => {
      expect(() => registry.unregister('nonexistent')).toThrow(PluginLoadError)
    })

    test('registry register throws for duplicate', () => {
      registry.register(createMockPlugin({ name: 'dup-1' }))
      expect(() => registry.register(createMockPlugin({ name: 'dup-1' }))).toThrow(PluginLoadError)
    })
  })

  // ===================================================================
  // EXPANSION: Error handling edge cases
  // ===================================================================
  describe('error handling', () => {
    test('PluginLoadError has correct code', () => {
      const err = new PluginLoadError('test', 'msg')
      expect(err.code).toBe('PLUGIN_LOAD_ERROR')
    })

    test('PluginLoadError has correct name', () => {
      const err = new PluginLoadError('test', 'msg')
      expect(err.name).toBe('PluginLoadError')
    })

    test('PluginLoadError includes plugin name in message', () => {
      const err = new PluginLoadError('my-plugin', 'something bad')
      expect(err.message).toContain('my-plugin')
    })

    test('PluginLoadError stores cause', () => {
      const cause = new Error('root cause')
      const err = new PluginLoadError('p', 'msg', cause)
      expect(err.cause).toBe(cause)
    })

    test('HookExecutionError has correct code', () => {
      const err = new HookExecutionError('p', 'onLoad', 'msg')
      expect(err.code).toBe('HOOK_EXECUTION_ERROR')
    })

    test('HookExecutionError stores hookName', () => {
      const err = new HookExecutionError('p', 'beforeCheck', 'msg')
      expect(err.hookName).toBe('beforeCheck')
    })

    test('HookExecutionError stores pluginName', () => {
      const err = new HookExecutionError('my-plug', 'onLoad', 'msg')
      expect(err.pluginName).toBe('my-plug')
    })

    test('HookExecutionError includes hook name in message', () => {
      const err = new HookExecutionError('p', 'afterCheck', 'fail')
      expect(err.message).toContain('afterCheck')
    })

    test('executeHook on single plugin throws HookExecutionError', async () => {
      const plugin = createMockPlugin({
        name: 'thrower',
        hooks: {
          beforeCheck: () => {
            throw new Error('boom')
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('thrower')
      const loadedPlugin = manager.getPlugin('thrower')

      await expect(manager.executeHook(loadedPlugin!, 'beforeCheck')).rejects.toThrow(
        HookExecutionError,
      )
    })

    test('executeHook on all plugins logs warnings on failure', async () => {
      const plugin = createMockPlugin({
        name: 'all-thrower',
        hooks: {
          beforeCheck: () => {
            throw new Error('collective boom')
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('all-thrower')
      await manager.executeHook('beforeCheck')

      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Some hooks failed'))
    })

    test('loadPlugin wraps non-Error throw from onLoad', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'throw-string',
        hooks: {
          onLoad: () => {
            throw 'string error' // eslint-disable-line no-throw-literal
          },
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('throw-string')).rejects.toThrow(PluginLoadError)
    })

    test('unloadPlugin handles non-Error throw from onUnload', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'throw-string-unload',
        hooks: {
          onUnload: () => {
            throw 'string unload error' // eslint-disable-line no-throw-literal
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('throw-string-unload')
      expect(() => manager.unloadPlugin('throw-string-unload')).not.toThrow()
    })
  })

  // ===================================================================
  // EXPANSION: Plugin configuration edge cases
  // ===================================================================
  describe('plugin configuration edge cases', () => {
    test('config with empty options object', async () => {
      const plugin = createMockPlugin({ name: 'cfg-empty' })
      registry.register(plugin)

      await manager.loadPlugin('cfg-empty', { config: { options: {} } })
      expect(manager.getPluginConfig('cfg-empty')).toEqual({ options: {} })
    })

    test('config with complex options', async () => {
      const plugin = createMockPlugin({ name: 'cfg-complex' })
      registry.register(plugin)

      const complexConfig: PluginConfig = {
        options: {
          nested: { deep: true },
          array: [1, 2, 3],
          flag: false,
        },
        rules: { 'my-rule': ['error', { max: 5 }] as unknown as 'error' },
        transforms: ['t1', 't2'],
      }

      await manager.loadPlugin('cfg-complex', { config: complexConfig })
      expect(manager.getPluginConfig('cfg-complex')).toEqual(complexConfig)
    })

    test('setPluginConfig with empty config object', async () => {
      const plugin = createMockPlugin({ name: 'cfg-set-empty' })
      registry.register(plugin)

      await manager.loadPlugin('cfg-set-empty')
      manager.setPluginConfig('cfg-set-empty', {})

      expect(manager.getPluginConfig('cfg-set-empty')).toEqual({})
    })

    test('setPluginConfig overwrites previous config', async () => {
      const plugin = createMockPlugin({ name: 'cfg-overwrite' })
      registry.register(plugin)

      await manager.loadPlugin('cfg-overwrite', {
        config: { options: { first: true } },
      })

      manager.setPluginConfig('cfg-overwrite', { options: { second: true } })
      const config = manager.getPluginConfig('cfg-overwrite')

      expect(config).toEqual({ options: { second: true } })
    })

    test('config is available immediately after load', async () => {
      const plugin = createMockPlugin({ name: 'cfg-immediate' })
      registry.register(plugin)

      await manager.loadPlugin('cfg-immediate', {
        config: { options: { immediate: true } },
      })

      expect(manager.getPluginConfig('cfg-immediate')).toBeDefined()
    })

    test('multiple config updates', async () => {
      const plugin = createMockPlugin({ name: 'cfg-multi' })
      registry.register(plugin)

      await manager.loadPlugin('cfg-multi')

      for (let i = 0; i < 5; i++) {
        manager.setPluginConfig('cfg-multi', { options: { iteration: i } })
        expect(manager.getPluginConfig('cfg-multi')).toEqual({ options: { iteration: i } })
      }
    })
  })

  // ===================================================================
  // EXPANSION: Plugin ordering and priority
  // ===================================================================
  describe('plugin ordering', () => {
    test('getAllPlugins preserves insertion order', async () => {
      registry.clear()
      const p1 = createMockPlugin({ name: 'order-1' })
      const p2 = createMockPlugin({ name: 'order-2' })
      const p3 = createMockPlugin({ name: 'order-3' })

      registry.register(p1)
      registry.register(p2)
      registry.register(p3)

      await manager.loadPlugin('order-1')
      await manager.loadPlugin('order-2')
      await manager.loadPlugin('order-3')

      const names = manager.getLoadedPluginNames()
      expect(names).toEqual(['order-1', 'order-2', 'order-3'])
    })

    test('getRules preserves plugin order', async () => {
      registry.clear()
      const p1 = createMockPlugin({
        name: 'rules-order-1',
        rules: { r1: createMockRule('r1') },
      })
      const p2 = createMockPlugin({
        name: 'rules-order-2',
        rules: { r2: createMockRule('r2') },
      })

      registry.register(p1)
      registry.register(p2)

      await manager.loadPlugin('rules-order-1')
      await manager.loadPlugin('rules-order-2')

      const ruleKeys = Object.keys(manager.getRules())
      expect(ruleKeys[0]).toBe('rules-order-1/r1')
      expect(ruleKeys[1]).toBe('rules-order-2/r2')
    })

    test('getLoadedPluginNames returns new array each call', async () => {
      const plugin = createMockPlugin({ name: 'new-arr' })
      registry.register(plugin)
      await manager.loadPlugin('new-arr')

      const names1 = manager.getLoadedPluginNames()
      const names2 = manager.getLoadedPluginNames()

      expect(names1).not.toBe(names2)
      expect(names1).toEqual(names2)
    })

    test('unloading middle plugin preserves order of others', async () => {
      registry.clear()
      const p1 = createMockPlugin({ name: 'keep-a' })
      const p2 = createMockPlugin({ name: 'remove-b' })
      const p3 = createMockPlugin({ name: 'keep-c' })

      registry.register(p1)
      registry.register(p2)
      registry.register(p3)

      await manager.loadPlugin('keep-a')
      await manager.loadPlugin('remove-b')
      await manager.loadPlugin('keep-c')

      manager.unloadPlugin('remove-b')

      const names = manager.getLoadedPluginNames()
      expect(names).toEqual(['keep-a', 'keep-c'])
    })
  })

  // ===================================================================
  // EXPANSION: Concurrent operations
  // ===================================================================
  describe('concurrent operations', () => {
    test('concurrent loadPlugin calls return same plugin', async () => {
      const plugin = createMockPlugin({ name: 'concurrent-1' })
      registry.register(plugin)

      const [p1, p2, p3] = await Promise.all([
        manager.loadPlugin('concurrent-1'),
        manager.loadPlugin('concurrent-1'),
        manager.loadPlugin('concurrent-1'),
      ])

      expect(p1).toBe(p2)
      expect(p2).toBe(p3)
    })

    test('concurrent unload after load does not throw', async () => {
      const plugin = createMockPlugin({ name: 'concurrent-unload' })
      registry.register(plugin)

      await manager.loadPlugin('concurrent-unload')

      // Unload twice concurrently
      manager.unloadPlugin('concurrent-unload')
      manager.unloadPlugin('concurrent-unload')

      expect(manager.isLoaded('concurrent-unload')).toBe(false)
    })

    test('loading multiple different plugins concurrently', async () => {
      registry.clear()
      for (let i = 0; i < 5; i++) {
        registry.register(createMockPlugin({ name: `par-${i}` }))
      }

      await Promise.all([
        manager.loadPlugin('par-0'),
        manager.loadPlugin('par-1'),
        manager.loadPlugin('par-2'),
        manager.loadPlugin('par-3'),
        manager.loadPlugin('par-4'),
      ])

      expect(manager.getLoadedPluginNames()).toHaveLength(5)
    })

    test('executeHook on all with multiple plugins runs all', async () => {
      registry.clear()
      const hooks = [vi.fn(), vi.fn(), vi.fn()]

      for (let i = 0; i < 3; i++) {
        const p = createMockPlugin({
          name: `hook-par-${i}`,
          hooks: { beforeCheck: hooks[i] },
        })
        registry.register(p)
        await manager.loadPlugin(`hook-par-${i}`)
      }

      await manager.executeHook('beforeCheck')

      for (const h of hooks) {
        expect(h).toHaveBeenCalledTimes(1)
      }
    })
  })

  // ===================================================================
  // EXPANSION: Edge cases (empty, duplicates, self-ref, scoped)
  // ===================================================================
  describe('edge cases', () => {
    test('empty plugin list operations', () => {
      expect(manager.getAllPlugins()).toEqual([])
      expect(manager.getLoadedPluginNames()).toEqual([])
      expect(manager.getRules()).toEqual({})
      expect(manager.getLoadedPluginNames()).toHaveLength(0)
    })

    test('getRule with empty string returns undefined', () => {
      expect(manager.getRule('')).toBeUndefined()
    })

    test('getRule with single-segment name returns undefined', () => {
      expect(manager.getRule('just-a-name')).toBeUndefined()
    })

    test('getRule with triple-segment name returns undefined', async () => {
      const plugin = createMockPlugin({
        name: 'edge-1',
        rules: { 'my-rule': createMockRule('my-rule') },
      })
      registry.register(plugin)
      await manager.loadPlugin('edge-1')

      expect(manager.getRule('a/b/c')).toBeUndefined()
    })

    test('getRule with scoped plugin and rule', async () => {
      const plugin = createMockPlugin({
        name: '@scope/edge-plugin',
        rules: { 'scoped-rule': createMockRule('scoped-rule') },
      })
      registry.register(plugin)
      await manager.loadPlugin('@scope/edge-plugin')

      const rule = manager.getRule('@scope/edge-plugin/scoped-rule')
      expect(rule).toBeDefined()
    })

    test('getRule with scoped plugin wrong rule returns undefined', async () => {
      const plugin = createMockPlugin({
        name: '@scope/edge-plugin-2',
        rules: { 'rule-1': createMockRule('rule-1') },
      })
      registry.register(plugin)
      await manager.loadPlugin('@scope/edge-plugin-2')

      expect(manager.getRule('@scope/edge-plugin-2/nope')).toBeUndefined()
    })

    test('getRule with incomplete scoped name returns undefined', () => {
      expect(manager.getRule('@scope')).toBeUndefined()
    })

    test('getRule with only scope returns undefined', () => {
      expect(manager.getRule('@scope/')).toBeUndefined()
    })

    test('getPluginRules for plugin with empty rules object', async () => {
      const plugin = createMockPlugin({
        name: 'empty-rules',
        rules: {},
      })
      registry.register(plugin)
      await manager.loadPlugin('empty-rules')

      const rules = manager.getPluginRules('empty-rules')
      expect(rules).toEqual({})
    })

    test('reloadPlugin for never-loaded plugin', async () => {
      const plugin = createMockPlugin({ name: 'reload-new' })
      registry.register(plugin)

      // reloadPlugin calls unload first (which warns), then loads
      const reloaded = await manager.reloadPlugin('reload-new')
      expect(reloaded.name).toBe('reload-new')
      expect(manager.isLoaded('reload-new')).toBe(true)
    })

    test('unloadAll when already empty does nothing', () => {
      manager.unloadAll()
      manager.unloadAll()
      expect(manager.getAllPlugins()).toEqual([])
    })

    test('getRules after load and unload cycle', async () => {
      const plugin = createMockPlugin({
        name: 'cycle-rules',
        rules: { 'cycle-rule': createMockRule('cycle-rule') },
      })
      registry.register(plugin)

      await manager.loadPlugin('cycle-rules')
      expect(Object.keys(manager.getRules())).toHaveLength(1)

      manager.unloadPlugin('cycle-rules')
      expect(Object.keys(manager.getRules())).toHaveLength(0)
    })

    test('getWorkspaceRoot with different roots', () => {
      const m1 = new PluginManager({ workspaceRoot: '/root1', logger: mockLogger, registry })
      const m2 = new PluginManager({ workspaceRoot: '/root2', logger: mockLogger, registry })

      expect(m1.getWorkspaceRoot()).toBe('/root1')
      expect(m2.getWorkspaceRoot()).toBe('/root2')
    })

    test('multiple managers share same registry', () => {
      const sharedRegistry = new PluginRegistry()
      sharedRegistry.register(createMockPlugin({ name: 'shared-p' }))

      const m1 = new PluginManager({ workspaceRoot: '/w1', registry: sharedRegistry })
      const m2 = new PluginManager({ workspaceRoot: '/w2', registry: sharedRegistry })

      expect(m1.getRegistry()).toBe(m2.getRegistry())
    })

    test('plugin with many rules', async () => {
      const rules: Record<string, RuleDefinition> = {}
      for (let i = 0; i < 20; i++) {
        rules[`rule-${i}`] = createMockRule(`rule-${i}`)
      }
      const plugin = createMockPlugin({ name: 'many-rules', rules })
      registry.register(plugin)

      await manager.loadPlugin('many-rules')

      const allRules = manager.getRules()
      expect(Object.keys(allRules)).toHaveLength(20)
    })

    test('manager remains usable after errors', async () => {
      // First, try to load a missing plugin
      await expect(manager.loadPlugin('missing-1')).rejects.toThrow()

      // Then load a valid one
      const valid = createMockPlugin({ name: 'valid-after-err' })
      registry.register(valid)

      const loaded = await manager.loadPlugin('valid-after-err')
      expect(loaded.name).toBe('valid-after-err')
      expect(manager.isLoaded('valid-after-err')).toBe(true)
    })
  })

  // ===================================================================
  // EXPANSION: Validation edge cases
  // ===================================================================
  describe('validation edge cases', () => {
    test('plugin with non-string name type is caught by manager validation', async () => {
      const badPlugin = { name: 42, version: '1.0.0' } as unknown as Plugin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(registry as Record<string, unknown>)['plugins'] = new Map([['nonstr-name', badPlugin]])

      await expect(manager.loadPlugin('nonstr-name')).rejects.toThrow(PluginLoadError)
    })

    test('plugin with non-string version type is caught by manager validation', async () => {
      const badPlugin = { name: 'nonstr-ver', version: 1 } as unknown as Plugin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(registry as Record<string, unknown>)['plugins'] = new Map([['nonstr-ver', badPlugin]])

      await expect(manager.loadPlugin('nonstr-ver')).rejects.toThrow(PluginLoadError)
    })

    test('rule with meta but non-function create is rejected', async () => {
      registry.clear()
      const badPlugin = createMockPlugin({
        name: 'bad-create-type',
        rules: {
          badRule: {
            meta: { type: 'problem', severity: 'error', docs: { description: 'x' } },
            create: 'not-a-function',
          } as unknown as RuleDefinition,
        },
      })
      registry.register(badPlugin)

      await expect(manager.loadPlugin('bad-create-type')).rejects.toThrow(PluginLoadError)
    })

    test('transform with non-function transform is rejected', async () => {
      registry.clear()
      const badPlugin = createMockPlugin({
        name: 'bad-transform-type',
        transforms: {
          badT: {
            name: 'badT',
            transform: 42,
          } as unknown as TransformDefinition,
        },
      })
      registry.register(badPlugin)

      await expect(manager.loadPlugin('bad-transform-type')).rejects.toThrow(PluginLoadError)
    })

    test('valid plugin with multiple rules loads fine', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'multi-rules-valid',
        rules: {
          'rule-a': createMockRule('rule-a'),
          'rule-b': createMockRule('rule-b'),
          'rule-c': createMockRule('rule-c'),
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('multi-rules-valid')

      const pluginRules = manager.getPluginRules('multi-rules-valid')
      expect(Object.keys(pluginRules!)).toHaveLength(3)
    })

    test('valid plugin with multiple transforms loads fine', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'multi-transforms-valid',
        transforms: {
          't-1': {
            name: 't-1',
            transform: vi.fn().mockReturnValue(''),
          },
          't-2': {
            name: 't-2',
            transform: vi.fn().mockReturnValue(''),
          },
        },
      })
      registry.register(plugin)

      await manager.loadPlugin('multi-transforms-valid')
      expect(manager.isLoaded('multi-transforms-valid')).toBe(true)
    })

    test('error message for missing rule meta includes rule name', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'meta-err',
        rules: {
          'specific-rule': { create: vi.fn() } as unknown as RuleDefinition,
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('meta-err')).rejects.toThrow(/specific-rule/)
    })

    test('error message for missing rule create includes rule name', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'create-err',
        rules: {
          'another-rule': {
            meta: { type: 'problem', severity: 'error', docs: { description: 'x' } },
          } as unknown as RuleDefinition,
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('create-err')).rejects.toThrow(/another-rule/)
    })

    test('error message for missing transform fn includes transform name', async () => {
      registry.clear()
      const plugin = createMockPlugin({
        name: 'transform-err',
        transforms: {
          'broken-transform': { name: 'broken-transform' } as unknown as TransformDefinition,
        },
      })
      registry.register(plugin)

      await expect(manager.loadPlugin('transform-err')).rejects.toThrow(/broken-transform/)
    })
  })
})
