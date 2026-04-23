import type { HookContext, Logger, Plugin, PluginConfig, RuleDefinition } from './types.js'

import { createDefaultLogger } from './context.js'
import { PluginRegistry } from './registry.js'
import { HookExecutionError, PluginLoadError } from './types.js'

export interface PluginManagerOptions {
  logger?: Logger
  registry?: PluginRegistry
  workspaceRoot: string
}

export interface PluginLoadOptions {
  config?: PluginConfig
}

export class PluginManager {
  private readonly loadedPlugins: Map<string, Plugin> = new Map()
  private readonly logger: Logger
  private readonly pluginConfigs: Map<string, PluginConfig> = new Map()
  private readonly registry: PluginRegistry
  private readonly workspaceRoot: string

  constructor(options: PluginManagerOptions) {
    this.registry = options.registry ?? new PluginRegistry()
    this.logger = options.logger ?? createDefaultLogger()
    this.workspaceRoot = options.workspaceRoot
  }

  async executeHook(hookName: keyof NonNullable<Plugin['hooks']>, data?: unknown): Promise<void>
  async executeHook(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown,
  ): Promise<void>
  async executeHook(
    pluginOrHookName: keyof NonNullable<Plugin['hooks']> | Plugin,
    hookNameOrData?: keyof NonNullable<Plugin['hooks']> | unknown,
    data?: unknown,
  ): Promise<void> {
    await (typeof pluginOrHookName === 'string'
      ? this.executeHookOnAllPlugins(pluginOrHookName, hookNameOrData)
      : this.executeSingleHook(
          pluginOrHookName,
          hookNameOrData as keyof NonNullable<Plugin['hooks']>,
          data,
        ))
  }

  getAllPlugins(): Plugin[] {
    return [...this.loadedPlugins.values()]
  }

  getLoadedPluginNames(): string[] {
    return [...this.loadedPlugins.keys()]
  }

  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name)
  }

  getPluginConfig(name: string): PluginConfig | undefined {
    return this.pluginConfigs.get(name)
  }

  getPluginRules(pluginName: string): Record<string, RuleDefinition> | undefined {
    const plugin = this.loadedPlugins.get(pluginName)
    return plugin?.rules
  }

  getRegistry(): PluginRegistry {
    return this.registry
  }

  getRule(qualifiedName: string): RuleDefinition | undefined {
    const [pluginName, ruleName] = this.parseQualifiedName(qualifiedName)
    if (!pluginName || !ruleName) {
      return undefined
    }

    const plugin = this.loadedPlugins.get(pluginName)
    return plugin?.rules?.[ruleName]
  }

  getRules(): Record<string, RuleDefinition> {
    const rules: Record<string, RuleDefinition> = {}

    for (const [pluginName, plugin] of this.loadedPlugins) {
      if (plugin.rules) {
        for (const [ruleName, ruleDefinition] of Object.entries(plugin.rules)) {
          const qualifiedName = `${pluginName}/${ruleName}`
          rules[qualifiedName] = ruleDefinition
        }
      }
    }

    return rules
  }

  getWorkspaceRoot(): string {
    return this.workspaceRoot
  }

  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name)
  }

  async loadPlugin(name: string, options?: PluginLoadOptions): Promise<Plugin> {
    const existingPlugin = this.loadedPlugins.get(name)
    if (existingPlugin) {
      return existingPlugin
    }

    let plugin = this.registry.get(name)
    if (!plugin) {
      try {
        plugin = await this.registry.loadFromNodeModules(name, this.workspaceRoot)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new PluginLoadError(
          name,
          `Plugin "${name}" not found in registry and could not be loaded from node_modules: ${message}`,
        )
      }
    }

    this.validatePlugin(plugin)

    const config: PluginConfig = options?.config ?? { options: {}, rules: {}, transforms: [] }
    this.pluginConfigs.set(name, config)

    try {
      await this.executeSingleHook(plugin, 'onLoad')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new PluginLoadError(name, `Failed to execute onLoad hook: ${message}`)
    }

    this.loadedPlugins.set(name, plugin)
    this.logger.info(`Plugin "${name}" v${plugin.version} loaded successfully`)

    return plugin
  }

  async reloadPlugin(name: string, options?: PluginLoadOptions): Promise<Plugin> {
    this.unloadPlugin(name)
    return this.loadPlugin(name, options)
  }

  setPluginConfig(name: string, config: PluginConfig): void {
    if (!this.loadedPlugins.has(name)) {
      throw new PluginLoadError(name, `Cannot set config for unloaded plugin "${name}"`)
    }

    this.pluginConfigs.set(name, config)
  }

  unloadAll(): void {
    const pluginNames = [...this.loadedPlugins.keys()]
    for (const name of pluginNames) {
      this.unloadPlugin(name)
    }
  }

  unloadPlugin(name: string): void {
    const plugin = this.loadedPlugins.get(name)
    if (!plugin) {
      this.logger.warn(`Plugin "${name}" is not loaded`)
      return
    }

    try {
      this.executeHookSync(plugin, 'onUnload')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Error during unloading plugin "${name}": ${message}`)
    }

    this.loadedPlugins.delete(name)
    this.pluginConfigs.delete(name)
    this.logger.info(`Plugin "${name}" unloaded`)
  }

  private async executeHookOnAllPlugins(
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown,
  ): Promise<void> {
    const errors: Array<{ error: Error; plugin: string }> = []

    for (const [pluginName, plugin] of this.loadedPlugins) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.executeSingleHook(plugin, hookName, data)
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error : new Error('Unknown error'),
          plugin: pluginName,
        })
      }
    }

    if (errors.length > 0) {
      const messages = errors.map((e) => `${e.plugin}: ${e.error.message}`).join('; ')
      this.logger.warn(`Some hooks failed during "${hookName}": ${messages}`)
    }
  }

  private executeHookSync(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown,
  ): void {
    const { hooks } = plugin
    if (!hooks) {
      return
    }

    const hookContext: HookContext = {
      data,
      logger: this.logger,
      timestamp: new Date(),
    }

    let result: Promise<void> | undefined | void

    if (hookName === 'onUnload' && hooks.onUnload) {
      result = hooks.onUnload(hookContext)
    } else {
      const hook = hooks[hookName]
      if (typeof hook === 'function') {
        result = (hook as (ctx: HookContext) => Promise<void> | void)(hookContext)
      }
    }

    if (result instanceof Promise) {
      result.catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error'
        this.logger.error(`Async hook "${hookName}" failed for plugin "${plugin.name}": ${message}`)
      })
    }
  }

  private async executeSingleHook(
    plugin: Plugin,
    hookName: keyof NonNullable<Plugin['hooks']>,
    data?: unknown,
  ): Promise<void> {
    const { hooks } = plugin
    if (!hooks) {
      return
    }

    const hookContext: HookContext = {
      data,
      logger: this.logger,
      timestamp: new Date(),
    }

    try {
      if (hookName === 'onError' && hooks.onError) {
        const error = data instanceof Error ? data : new Error(String(data ?? 'Unknown error'))
        await hooks.onError(error, hookContext)
      } else {
        const hook = hooks[hookName]
        if (typeof hook === 'function') {
          await (hook as (ctx: HookContext) => Promise<void> | void)(hookContext)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new HookExecutionError(
        plugin.name,
        hookName,
        message,
        error instanceof Error ? error : undefined,
      )
    }
  }

  private parseQualifiedName(
    qualifiedName: string,
  ): [pluginName: null | string, name: null | string] {
    if (qualifiedName.startsWith('@')) {
      const match = /^(@[^/]+\/[^/]+)\/(.+)$/.exec(qualifiedName)
      if (match && match[1] && match[2]) {
        return [match[1], match[2]]
      }
    } else {
      const parts = qualifiedName.split('/')
      if (parts.length === 2 && parts[0] && parts[1]) {
        return [parts[0], parts[1]]
      }
    }

    return [null, null]
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new PluginLoadError('unknown', 'Plugin must have a valid name property')
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new PluginLoadError(plugin.name, 'Plugin must have a valid version property')
    }

    if (plugin.rules) {
      for (const [ruleName, ruleDefinition] of Object.entries(plugin.rules)) {
        if (!ruleDefinition.meta) {
          throw new PluginLoadError(plugin.name, `Rule "${ruleName}" must have meta property`)
        }

        if (!ruleDefinition.create || typeof ruleDefinition.create !== 'function') {
          throw new PluginLoadError(plugin.name, `Rule "${ruleName}" must have create function`)
        }
      }
    }

    if (plugin.transforms) {
      for (const [transformName, transformDefinition] of Object.entries(plugin.transforms)) {
        if (!transformDefinition.transform || typeof transformDefinition.transform !== 'function') {
          throw new PluginLoadError(
            plugin.name,
            `Transform "${transformName}" must have transform function`,
          )
        }
      }
    }
  }
}
