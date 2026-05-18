import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginManager } from '../src/plugins/manager.js'
import { PluginRegistry } from '../src/plugins/registry.js'
import { PluginLoadError, HookExecutionError } from '../src/plugins/types.js'
import type { Plugin, Logger, RuleDefinition } from '../src/plugins/types.js'
import { createSilentLogger } from '../src/plugins/context.js'

// ─── Helpers ──────────────────────────────────────────
function makeRule(): RuleDefinition {
  return {
    meta: { description: 'test rule', severity: 'warning' },
    create: vi.fn(() => ({})),
  }
}

function makePlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    name: 'test-plugin',
    version: '1.0.0',
    ...overrides,
  }
}

function makeManagerWithRegistry(registry?: PluginRegistry, logger?: Logger): PluginManager {
  return new PluginManager({
    logger: logger ?? createSilentLogger(),
    registry: registry ?? new PluginRegistry(),
    workspaceRoot: '/project',
  })
}

function makeManagerWithPlugin(plugin?: Plugin): { manager: PluginManager; registry: PluginRegistry; plugin: Plugin } {
  const registry = new PluginRegistry()
  const p = plugin ?? makePlugin()
  registry.register(p)
  const manager = makeManagerWithRegistry(registry)
  return { manager, registry, plugin: p }
}

// ─── Constructor ──────────────────────────────────────
describe('PluginManager', () => {
  it('creates with required options', () => {
    const mgr = new PluginManager({ workspaceRoot: '/test' })
    expect(mgr.getWorkspaceRoot()).toBe('/test')
  })

  it('creates with custom logger', () => {
    const logger = createSilentLogger()
    const mgr = new PluginManager({ workspaceRoot: '/test', logger })
    expect(mgr.getWorkspaceRoot()).toBe('/test')
  })

  it('creates with custom registry', () => {
    const reg = new PluginRegistry()
    const mgr = new PluginManager({ workspaceRoot: '/test', registry: reg })
    expect(mgr.getRegistry()).toBe(reg)
  })

  // ─── loadPlugin ───────────────────────────────────
  it('loads a registered plugin', async () => {
    const { manager, plugin } = makeManagerWithPlugin()
    const loaded = await manager.loadPlugin('test-plugin')
    expect(loaded).toBe(plugin)
    expect(manager.isLoaded('test-plugin')).toBe(true)
  })

  it('loadPlugin returns cached if already loaded', async () => {
    const { manager, plugin } = makeManagerWithPlugin()
    const first = await manager.loadPlugin('test-plugin')
    const second = await manager.loadPlugin('test-plugin')
    expect(first).toBe(second)
  })

  it('loadPlugin throws for non-existent plugin', async () => {
    const manager = makeManagerWithRegistry()
    await expect(manager.loadPlugin('nonexistent')).rejects.toThrow(PluginLoadError)
  })

  it('loadPlugin stores plugin config', async () => {
    const { manager } = makeManagerWithPlugin()
    const config = { options: { verbose: true }, rules: {}, transforms: [] }
    await manager.loadPlugin('test-plugin', { config })
    expect(manager.getPluginConfig('test-plugin')).toBe(config)
  })

  it('loadPlugin uses default config if none provided', async () => {
    const { manager } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    const config = manager.getPluginConfig('test-plugin')
    expect(config).toBeDefined()
    expect(config!.options).toEqual({})
  })

  // ─── unloadPlugin ─────────────────────────────────
  it('unloadPlugin removes plugin', async () => {
    const { manager } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    manager.unloadPlugin('test-plugin')
    expect(manager.isLoaded('test-plugin')).toBe(false)
  })

  it('unloadPlugin removes config', async () => {
    const { manager } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    manager.unloadPlugin('test-plugin')
    expect(manager.getPluginConfig('test-plugin')).toBeUndefined()
  })

  it('unloadPlugin is no-op for non-loaded plugin', () => {
    const { manager } = makeManagerWithPlugin()
    expect(() => manager.unloadPlugin('nonexistent')).not.toThrow()
  })

  // ─── unloadAll ────────────────────────────────────
  it('unloadAll removes all plugins', async () => {
    const registry = new PluginRegistry()
    const p1 = makePlugin({ name: 'p1' })
    const p2 = makePlugin({ name: 'p2' })
    registry.register(p1)
    registry.register(p2)
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    await manager.loadPlugin('p2')
    manager.unloadAll()

    expect(manager.isLoaded('p1')).toBe(false)
    expect(manager.isLoaded('p2')).toBe(false)
  })

  // ─── reloadPlugin ─────────────────────────────────
  it('reloadPlugin unloads then loads', async () => {
    const { manager, plugin } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    const reloaded = await manager.reloadPlugin('test-plugin')
    expect(reloaded.name).toBe(plugin.name)
    expect(manager.isLoaded('test-plugin')).toBe(true)
  })

  // ─── getPlugin / getLoadedPluginNames / getAllPlugins
  it('getPlugin returns loaded plugin', async () => {
    const { manager, plugin } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    expect(manager.getPlugin('test-plugin')).toBe(plugin)
  })

  it('getPlugin returns undefined for unloaded', () => {
    const manager = makeManagerWithRegistry()
    expect(manager.getPlugin('nonexistent')).toBeUndefined()
  })

  it('getLoadedPluginNames returns all loaded names', async () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'p1' }))
    registry.register(makePlugin({ name: 'p2' }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    await manager.loadPlugin('p2')
    expect(manager.getLoadedPluginNames()).toEqual(['p1', 'p2'])
  })

  it('getAllPlugins returns all loaded plugins', async () => {
    const registry = new PluginRegistry()
    const p1 = makePlugin({ name: 'p1' })
    const p2 = makePlugin({ name: 'p2' })
    registry.register(p1)
    registry.register(p2)
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    await manager.loadPlugin('p2')
    expect(manager.getAllPlugins()).toEqual([p1, p2])
  })

  // ─── setPluginConfig ──────────────────────────────
  it('setPluginConfig updates config for loaded plugin', async () => {
    const { manager } = makeManagerWithPlugin()
    await manager.loadPlugin('test-plugin')
    const newConfig = { options: { debug: true }, rules: {}, transforms: [] }
    manager.setPluginConfig('test-plugin', newConfig)
    expect(manager.getPluginConfig('test-plugin')).toBe(newConfig)
  })

  it('setPluginConfig throws for unloaded plugin', () => {
    const manager = makeManagerWithRegistry()
    expect(() => manager.setPluginConfig('nonexistent', {})).toThrow(PluginLoadError)
  })

  // ─── getRules / getRule ───────────────────────────
  it('getRules returns empty object when no plugins loaded', () => {
    const manager = makeManagerWithRegistry()
    expect(manager.getRules()).toEqual({})
  })

  it('getRules returns qualified rules from loaded plugins', async () => {
    const rule = makeRule()
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'p1', rules: { 'my-rule': rule } }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    const rules = manager.getRules()
    expect(rules['p1/my-rule']).toBe(rule)
  })

  it('getRule returns specific qualified rule', async () => {
    const rule = makeRule()
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'p1', rules: { 'my-rule': rule } }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    expect(manager.getRule('p1/my-rule')).toBe(rule)
  })

  it('getRule returns undefined for invalid qualified name', async () => {
    const manager = makeManagerWithRegistry()
    expect(manager.getRule('invalid')).toBeUndefined()
  })

  it('getRule handles scoped plugin names', async () => {
    const rule = makeRule()
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: '@scope/p1', rules: { 'my-rule': rule } }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('@scope/p1')
    expect(manager.getRule('@scope/p1/my-rule')).toBe(rule)
  })

  // ─── getPluginRules ───────────────────────────────
  it('getPluginRules returns rules for loaded plugin', async () => {
    const rule = makeRule()
    const registry = new PluginRegistry()
    registry.register(makePlugin({ name: 'p1', rules: { 'r1': rule } }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    expect(manager.getPluginRules('p1')).toEqual({ r1: rule })
  })

  it('getPluginRules returns undefined for unloaded plugin', () => {
    const manager = makeManagerWithRegistry()
    expect(manager.getPluginRules('nonexistent')).toBeUndefined()
  })

  // ─── executeHook ──────────────────────────────────
  it('executeHook runs on all loaded plugins', async () => {
    const hookFn = vi.fn()
    const registry = new PluginRegistry()
    registry.register(makePlugin({
      name: 'p1',
      hooks: { onLoad: hookFn },
    }))
    const manager = makeManagerWithRegistry(registry)

    await manager.loadPlugin('p1')
    await manager.executeHook('onLoad')

    expect(hookFn).toHaveBeenCalled()
  })

  it('executeHook on single plugin', async () => {
    const hookFn = vi.fn()
    const plugin = makePlugin({ name: 'p1', hooks: { onLoad: hookFn } })
    const { manager } = makeManagerWithPlugin(plugin)

    await manager.loadPlugin('p1')
    await manager.executeHook(plugin, 'onLoad')

    expect(hookFn).toHaveBeenCalled()
  })

  // ─── validatePlugin ───────────────────────────────
  it('loadPlugin rejects plugin with invalid rules', async () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({
      name: 'bad-plugin',
      rules: { 'bad-rule': { meta: undefined, create: vi.fn() } as unknown as RuleDefinition },
    }))
    const manager = makeManagerWithRegistry(registry)

    await expect(manager.loadPlugin('bad-plugin')).rejects.toThrow(PluginLoadError)
  })

  it('loadPlugin rejects plugin with invalid transforms', async () => {
    const registry = new PluginRegistry()
    registry.register(makePlugin({
      name: 'bad-plugin',
      transforms: { 'bad-transform': { transform: undefined } as unknown as any },
    }))
    const manager = makeManagerWithRegistry(registry)

    await expect(manager.loadPlugin('bad-plugin')).rejects.toThrow(PluginLoadError)
  })

  // ─── isLoaded ─────────────────────────────────────
  it('isLoaded returns false before loading', () => {
    const manager = makeManagerWithRegistry()
    expect(manager.isLoaded('nonexistent')).toBe(false)
  })

  // ─── getWorkspaceRoot ─────────────────────────────
  it('getWorkspaceRoot returns configured path', () => {
    const manager = makeManagerWithRegistry()
    expect(manager.getWorkspaceRoot()).toBe('/project')
  })
})
