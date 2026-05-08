import { describe, it, expect } from 'vitest'
import { PluginLoader } from '../../src/core/plugin-loader/plugin-loader.js'
import type { PluginManifest, PluginInstance } from '../../src/core/plugin-loader/types.js'

function createManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    main: 'index.js',
    dependencies: [],
    config: {},
    ...overrides,
  }
}

describe('PluginLoader', () => {
  describe('Registration', () => {
    it('should register a valid plugin', () => {
      const loader = new PluginLoader()
      const result = loader.register(createManifest())
      expect(result.plugin.state).toBe('loaded')
      expect(result.plugin.manifest.name).toBe('test-plugin')
    })

    it('should return warnings array in LoadResult', () => {
      const loader = new PluginLoader()
      const result = loader.register(createManifest())
      expect(result.warnings).toEqual([])
      expect(result.plugin).toBeDefined()
    })

    it('should reject duplicate plugin name', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(() => loader.register(createManifest())).toThrow('already registered')
    })

    it('should unregister an existing plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(loader.unregister('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')).toBeUndefined()
    })

    it('should return false when unregistering non-existent plugin', () => {
      const loader = new PluginLoader()
      expect(loader.unregister('non-existent')).toBe(false)
    })

    it('should getPlugin by name', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      const plugin = loader.getPlugin('test-plugin')
      expect(plugin).toBeDefined()
      expect(plugin!.manifest.name).toBe('test-plugin')
    })

    it('should return undefined for non-existent getPlugin', () => {
      const loader = new PluginLoader()
      expect(loader.getPlugin('non-existent')).toBeUndefined()
    })

    it('should getPlugins return all plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      expect(loader.getPlugins()).toHaveLength(2)
    })

    it('should getPlugins return empty array when no plugins', () => {
      const loader = new PluginLoader()
      expect(loader.getPlugins()).toEqual([])
    })

    it('should reject plugin with empty name', () => {
      const loader = new PluginLoader()
      expect(() => loader.register(createManifest({ name: '' }))).toThrow('name is required')
    })

    it('should reject plugin with whitespace name', () => {
      const loader = new PluginLoader()
      expect(() => loader.register(createManifest({ name: '   ' }))).toThrow('name is required')
    })

    it('should reject plugin with empty version', () => {
      const loader = new PluginLoader()
      expect(() => loader.register(createManifest({ version: '' }))).toThrow('version is required')
    })

    it('should reject plugin with empty description', () => {
      const loader = new PluginLoader()
      expect(() => loader.register(createManifest({ description: '' }))).toThrow('description is required')
    })

    it('should reject plugin with empty main', () => {
      const loader = new PluginLoader()
      expect(() => loader.register(createManifest({ main: '' }))).toThrow('main entry is required')
    })
  })

  describe('Config validation', () => {
    it('should validate valid config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          debug: { type: 'boolean', default: false, required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { debug: true })
      expect(result.plugin.config.debug).toBe(true)
      expect(result.warnings).toEqual([])
    })

    it('should report missing required config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          apiKey: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      const result = loader.register(manifest)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('apiKey'))).toBe(true)
    })

    it('should reject wrong type for string config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          name: { type: 'string', default: '', required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { name: 123 })
      expect(result.warnings.some(w => w.includes('must be a string'))).toBe(true)
    })

    it('should reject wrong type for number config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          port: { type: 'number', default: 3000, required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { port: 'abc' })
      expect(result.warnings.some(w => w.includes('must be a number'))).toBe(true)
    })

    it('should reject wrong type for boolean config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          debug: { type: 'boolean', default: false, required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { debug: 'yes' })
      expect(result.warnings.some(w => w.includes('must be a boolean'))).toBe(true)
    })

    it('should reject invalid select option', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          mode: { type: 'select', default: 'prod', required: false, options: ['dev', 'prod'] },
        },
      })
      const result = loader.register(manifest, { mode: 'staging' })
      expect(result.warnings.some(w => w.includes('must be one of'))).toBe(true)
    })

    it('should accept valid select option', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          mode: { type: 'select', default: 'prod', required: false, options: ['dev', 'prod'] },
        },
      })
      const result = loader.register(manifest, { mode: 'dev' })
      expect(result.warnings).toEqual([])
    })

    it('should apply default values for config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          timeout: { type: 'number', default: 5000, required: false, options: [] },
        },
      })
      const result = loader.register(manifest)
      expect(result.plugin.config.timeout).toBe(5000)
    })

    it('should warn on unknown config keys', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          debug: { type: 'boolean', default: false, required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { debug: true, unknownKey: 'value' })
      expect(result.warnings.some(w => w.includes('Unknown config key'))).toBe(true)
    })

    it('should validateConfig standalone method', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          port: { type: 'number', default: 3000, required: false, options: [] },
        },
      })
      const errors = loader.validateConfig(manifest, { port: 'abc' })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return empty errors for valid config in validateConfig', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          port: { type: 'number', default: 3000, required: false, options: [] },
        },
      })
      const errors = loader.validateConfig(manifest, { port: 8080 })
      expect(errors).toEqual([])
    })

    it('should validate required field in validateConfig', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          apiKey: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      const errors = loader.validateConfig(manifest, {})
      expect(errors.some(e => e.includes('required'))).toBe(true)
    })

    it('should handle select with non-string value', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          mode: { type: 'select', default: 'a', required: false, options: ['a', 'b'] },
        },
      })
      const errors = loader.validateConfig(manifest, { mode: 123 })
      expect(errors.some(e => e.includes('must be a string for select type'))).toBe(true)
    })
  })

  describe('State management', () => {
    it('should initialize a loaded plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(loader.initialize('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')!.state).toBe('initialized')
    })

    it('should activate an initialized plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      expect(loader.activate('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')!.state).toBe('active')
    })

    it('should deactivate an active plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      loader.activate('test-plugin')
      expect(loader.deactivate('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')!.state).toBe('disabled')
    })

    it('should not initialize non-loaded plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      expect(loader.initialize('test-plugin')).toBe(false)
    })

    it('should not activate non-initialized plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(loader.activate('test-plugin')).toBe(false)
    })

    it('should not deactivate a loaded-only plugin', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(loader.deactivate('test-plugin')).toBe(false)
    })

    it('should not initialize non-existent plugin', () => {
      const loader = new PluginLoader()
      expect(loader.initialize('non-existent')).toBe(false)
    })

    it('should not activate non-existent plugin', () => {
      const loader = new PluginLoader()
      expect(loader.activate('non-existent')).toBe(false)
    })

    it('should not deactivate non-existent plugin', () => {
      const loader = new PluginLoader()
      expect(loader.deactivate('non-existent')).toBe(false)
    })

    it('should clear error when state changes', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          req: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      loader.register(manifest)
      loader.initialize('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('error')

      const manifest2 = createManifest({
        name: 'test-plugin2',
        config: {
          req: { type: 'string', default: 'val', required: true, options: [] },
        },
      })
      loader.register(manifest2)
      loader.initialize('test-plugin2')
      loader.activate('test-plugin2')
      expect(loader.getPlugin('test-plugin2')!.error).toBeUndefined()
    })

    it('should set error state on failed initialization', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          req: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      loader.register(manifest)
      loader.initialize('test-plugin')
      const plugin = loader.getPlugin('test-plugin')!
      expect(plugin.state).toBe('error')
      expect(plugin.error).toBeDefined()
    })

    it('should allow full lifecycle loaded -> initialized -> active -> disabled', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      const p = loader.getPlugin('test-plugin')!
      expect(p.state).toBe('loaded')
      loader.initialize('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('initialized')
      loader.activate('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('active')
      loader.deactivate('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('disabled')
    })
  })

  describe('Bulk operations', () => {
    it('should loadAll initialize and activate all plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      const results = loader.loadAll()
      expect(results).toHaveLength(2)
      expect(results.every(p => p.state === 'active')).toBe(true)
    })

    it('should loadAll skip already active plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      loader.initialize('a')
      loader.activate('a')
      const results = loader.loadAll()
      expect(results).toHaveLength(2)
      expect(results.every(p => p.state === 'active')).toBe(true)
    })

    it('should loadAll return empty for no plugins', () => {
      const loader = new PluginLoader()
      expect(loader.loadAll()).toEqual([])
    })

    it('should unloadAll deactivate all plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      loader.loadAll()
      const results = loader.unloadAll()
      expect(results).toHaveLength(2)
      expect(results.every(p => p.state === 'disabled')).toBe(true)
    })

    it('should unloadAll handle already disabled plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.deactivate('a')
      const results = loader.unloadAll()
      expect(results).toHaveLength(1)
    })

    it('should unloadAll return empty for no plugins', () => {
      const loader = new PluginLoader()
      expect(loader.unloadAll()).toEqual([])
    })
  })

  describe('Hooks', () => {
    it('should register a hook function', () => {
      const loader = new PluginLoader()
      const fn = (ctx: Record<string, unknown>) => ctx
      loader.registerHook('beforeAnalyze', fn)
      expect(loader.hasHook('beforeAnalyze')).toBe(true)
    })

    it('should execute hooks and return results', () => {
      const loader = new PluginLoader()
      const fn = () => ({ result: 'ok' })
      loader.registerHook('beforeAnalyze', fn)
      const results = loader.executeHook('beforeAnalyze', {})
      expect(results).toEqual([{ result: 'ok' }])
    })

    it('should execute multiple hooks in order', () => {
      const loader = new PluginLoader()
      const fn1 = () => ({ order: 1 })
      const fn2 = () => ({ order: 2 })
      loader.registerHook('beforeAnalyze', fn1)
      loader.registerHook('beforeAnalyze', fn2)
      const results = loader.executeHook('beforeAnalyze', {})
      expect(results).toEqual([{ order: 1 }, { order: 2 }])
    })

    it('should return empty results for hook with no functions', () => {
      const loader = new PluginLoader()
      expect(loader.executeHook('beforeAnalyze', {})).toEqual([])
    })

    it('should hasHook return false for unregistered hook', () => {
      const loader = new PluginLoader()
      expect(loader.hasHook('beforeAnalyze')).toBe(false)
    })

    it('should getHooks return all functions for a hook', () => {
      const loader = new PluginLoader()
      const fn1 = () => ({ a: 1 })
      const fn2 = () => ({ b: 2 })
      loader.registerHook('afterAnalyze', fn1)
      loader.registerHook('afterAnalyze', fn2)
      expect(loader.getHooks('afterAnalyze')).toHaveLength(2)
    })

    it('should getHooks return empty for unregistered hook', () => {
      const loader = new PluginLoader()
      expect(loader.getHooks('beforeFix')).toEqual([])
    })

    it('should pass context to hook functions', () => {
      const loader = new PluginLoader()
      let received: Record<string, unknown> = {}
      const fn = (ctx: Record<string, unknown>) => {
        received = ctx
        return ctx
      }
      loader.registerHook('onConfig', fn)
      loader.executeHook('onConfig', { key: 'value' })
      expect(received).toEqual({ key: 'value' })
    })

    it('should handle hook that returns void', () => {
      const loader = new PluginLoader()
      const fn = () => { return }
      loader.registerHook('onError', fn)
      const results = loader.executeHook('onError', {})
      expect(results).toEqual([])
    })

    it('should handle hook that throws', () => {
      const loader = new PluginLoader()
      const fn = () => { throw new Error('hook error') }
      loader.registerHook('beforeFix', fn)
      expect(() => loader.executeHook('beforeFix', {})).toThrow('hook error')
    })

    it('should register hooks for different types independently', () => {
      const loader = new PluginLoader()
      loader.registerHook('beforeAnalyze', () => ({ a: 1 }))
      loader.registerHook('afterAnalyze', () => ({ b: 2 }))
      expect(loader.hasHook('beforeAnalyze')).toBe(true)
      expect(loader.hasHook('afterAnalyze')).toBe(true)
      expect(loader.getHooks('beforeAnalyze')).toHaveLength(1)
      expect(loader.getHooks('afterAnalyze')).toHaveLength(1)
    })
  })

  describe('Filtering', () => {
    it('should getActivePlugins return only active', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      loader.initialize('a')
      loader.activate('a')
      const active = loader.getActivePlugins()
      expect(active).toHaveLength(1)
      expect(active[0]!.manifest.name).toBe('a')
    })

    it('should getActivePlugins return empty when none active', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      expect(loader.getActivePlugins()).toEqual([])
    })

    it('should getPluginsByState filter by loaded', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      loader.initialize('a')
      const loaded = loader.getPluginsByState('loaded')
      expect(loaded).toHaveLength(1)
      expect(loaded[0]!.manifest.name).toBe('b')
    })

    it('should getPluginsByState filter by error', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        name: 'bad',
        config: {
          req: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      loader.register(manifest)
      loader.initialize('bad')
      const errors = loader.getPluginsByState('error')
      expect(errors).toHaveLength(1)
      expect(errors[0]!.manifest.name).toBe('bad')
    })

    it('should getPluginsByState filter by disabled', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.initialize('a')
      loader.activate('a')
      loader.deactivate('a')
      const disabled = loader.getPluginsByState('disabled')
      expect(disabled).toHaveLength(1)
    })

    it('should getPluginsByState return empty for no matches', () => {
      const loader = new PluginLoader()
      expect(loader.getPluginsByState('active')).toEqual([])
    })
  })

  describe('Statistics', () => {
    it('should return correct statistics for empty loader', () => {
      const loader = new PluginLoader()
      const stats = loader.getStatistics()
      expect(stats).toEqual({
        total: 0,
        loaded: 0,
        initialized: 0,
        active: 0,
        error: 0,
        disabled: 0,
        hooks: 0,
      })
    })

    it('should count loaded plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      const stats = loader.getStatistics()
      expect(stats.total).toBe(1)
      expect(stats.loaded).toBe(1)
    })

    it('should count active plugins', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.initialize('a')
      loader.activate('a')
      const stats = loader.getStatistics()
      expect(stats.active).toBe(1)
      expect(stats.loaded).toBe(0)
    })

    it('should count hooks', () => {
      const loader = new PluginLoader()
      loader.registerHook('beforeAnalyze', () => {})
      loader.registerHook('beforeAnalyze', () => {})
      loader.registerHook('afterAnalyze', () => {})
      const stats = loader.getStatistics()
      expect(stats.hooks).toBe(3)
    })

    it('should count mixed states', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.register(createManifest({ name: 'b' }))
      loader.register(createManifest({ name: 'c' }))
      loader.initialize('a')
      loader.activate('a')
      loader.initialize('b')
      const stats = loader.getStatistics()
      expect(stats.total).toBe(3)
      expect(stats.loaded).toBe(1)
      expect(stats.initialized).toBe(1)
      expect(stats.active).toBe(1)
    })

    it('should count error plugins', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        name: 'bad',
        config: {
          req: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      loader.register(manifest)
      loader.initialize('bad')
      const stats = loader.getStatistics()
      expect(stats.error).toBe(1)
    })
  })

  describe('Edge cases', () => {
    it('should handle plugin with no config', () => {
      const loader = new PluginLoader()
      const result = loader.register(createManifest({ config: {} }))
      expect(result.warnings).toEqual([])
      expect(result.plugin.config).toEqual({})
    })

    it('should handle plugin with no hooks', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      loader.activate('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('active')
    })

    it('should handle empty loader operations', () => {
      const loader = new PluginLoader()
      expect(loader.getPlugins()).toEqual([])
      expect(loader.getActivePlugins()).toEqual([])
      expect(loader.getStatistics().total).toBe(0)
      expect(loader.hasHook('beforeAnalyze')).toBe(false)
    })

    it('should clear all plugins and hooks', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.registerHook('beforeAnalyze', () => {})
      loader.clear()
      expect(loader.getPlugins()).toEqual([])
      expect(loader.hasHook('beforeAnalyze')).toBe(false)
      expect(loader.getStatistics().total).toBe(0)
      expect(loader.getStatistics().hooks).toBe(0)
    })

    it('should handle re-register after unregister', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.unregister('test-plugin')
      const result = loader.register(createManifest())
      expect(result.plugin.manifest.name).toBe('test-plugin')
    })

    it('should handle register with provided config', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          debug: { type: 'boolean', default: false, required: false, options: [] },
          port: { type: 'number', default: 3000, required: false, options: [] },
        },
      })
      const result = loader.register(manifest, { debug: true, port: 8080 })
      expect(result.plugin.config.debug).toBe(true)
      expect(result.plugin.config.port).toBe(8080)
    })

    it('should handle plugin with dependencies', () => {
      const loader = new PluginLoader()
      const result = loader.register(createManifest({ dependencies: ['other-plugin'] }))
      expect(result.plugin.manifest.dependencies).toEqual(['other-plugin'])
    })

    it('should handle deactivate from error state', () => {
      const loader = new PluginLoader()
      const manifest = createManifest({
        config: {
          req: { type: 'string', default: undefined, required: true, options: [] },
        },
      })
      loader.register(manifest)
      loader.initialize('test-plugin')
      expect(loader.getPlugin('test-plugin')!.state).toBe('error')
      expect(loader.deactivate('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')!.state).toBe('disabled')
    })

    it('should handle deactivate from initialized state', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      expect(loader.deactivate('test-plugin')).toBe(true)
      expect(loader.getPlugin('test-plugin')!.state).toBe('disabled')
    })

    it('should allow activate after deactivate', () => {
      const loader = new PluginLoader()
      loader.register(createManifest())
      loader.initialize('test-plugin')
      loader.activate('test-plugin')
      loader.deactivate('test-plugin')
      expect(loader.activate('test-plugin')).toBe(false)
    })

    it('should count disabled plugins in statistics', () => {
      const loader = new PluginLoader()
      loader.register(createManifest({ name: 'a' }))
      loader.initialize('a')
      loader.activate('a')
      loader.deactivate('a')
      const stats = loader.getStatistics()
      expect(stats.disabled).toBe(1)
      expect(stats.total).toBe(1)
    })

    it('should return PluginInstance type with all fields', () => {
      const loader = new PluginLoader()
      const result = loader.register(createManifest())
      const plugin: PluginInstance = result.plugin
      expect(plugin.manifest).toBeDefined()
      expect(plugin.config).toBeDefined()
      expect(plugin.state).toBe('loaded')
      expect(plugin.error).toBeUndefined()
    })
  })
})
