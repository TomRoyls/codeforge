import type {
  PluginManifest,
  PluginInstance,
  PluginHook,
  PluginHookFn,
  LoadResult,
  PluginState,
} from './types.js'
import { append } from '../../utils/map-helpers.js'

export class PluginLoader {
  private plugins: Map<string, PluginInstance> = new Map()
  private hooks: Map<PluginHook, PluginHookFn[]> = new Map()
  private config: Record<string, Record<string, unknown>> = {}

  private validateManifest(manifest: PluginManifest): string[] {
    const errors: string[] = []
    if (!manifest.name || manifest.name.trim() === '') {
      errors.push('Plugin name is required')
    }
    if (!manifest.version || manifest.version.trim() === '') {
      errors.push('Plugin version is required')
    }
    if (!manifest.description || manifest.description.trim() === '') {
      errors.push('Plugin description is required')
    }
    if (!manifest.main || manifest.main.trim() === '') {
      errors.push('Plugin main entry is required')
    }
    if (!Array.isArray(manifest.dependencies)) {
      errors.push('Plugin dependencies must be an array')
    }
    if (!manifest.config || typeof manifest.config !== 'object') {
      errors.push('Plugin config must be an object')
    }
    return errors
  }

  validateConfig(manifest: PluginManifest, config: Record<string, unknown>): string[] {
    const errors: string[] = []
    for (const [key, schema] of Object.entries(manifest.config)) {
      if (schema.required && (config[key] === undefined || config[key] === null)) {
        errors.push(`Config "${key}" is required`)
        continue
      }
      const value = config[key] ?? schema.default
      if (value === undefined || value === null) {
        continue
      }
      if (schema.type === 'string' && typeof value !== 'string') {
        errors.push(`Config "${key}" must be a string`)
      }
      if (schema.type === 'number' && typeof value !== 'number') {
        errors.push(`Config "${key}" must be a number`)
      }
      if (schema.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Config "${key}" must be a boolean`)
      }
      if (schema.type === 'select') {
        if (typeof value !== 'string') {
          errors.push(`Config "${key}" must be a string for select type`)
        } else if (schema.options.length > 0 && !schema.options.includes(value)) {
          errors.push(`Config "${key}" must be one of: ${schema.options.join(', ')}`)
        }
      }
    }
    return errors
  }

  register(manifest: PluginManifest, config?: Record<string, unknown>): LoadResult {
    const manifestErrors = this.validateManifest(manifest)
    if (manifestErrors.length > 0) {
      throw new Error(manifestErrors.join('. '))
    }

    if (this.plugins.has(manifest.name)) {
      throw new Error(`Plugin "${manifest.name}" is already registered`)
    }

    const warnings: string[] = []
    const resolvedConfig: Record<string, unknown> = {}

    for (const [key, schema] of Object.entries(manifest.config)) {
      if (config && config[key] !== undefined) {
        resolvedConfig[key] = config[key]
      } else if (schema.default !== undefined) {
        resolvedConfig[key] = schema.default
      } else if (schema.required) {
        warnings.push(`Missing required config "${key}"`)
      }
    }

    if (config) {
      for (const key of Object.keys(config)) {
        if (!(key in manifest.config)) {
          warnings.push(`Unknown config key "${key}"`)
        }
      }
    }

    const configErrors = this.validateConfig(manifest, resolvedConfig)
    for (const err of configErrors) {
      warnings.push(err)
    }

    const plugin: PluginInstance = {
      manifest,
      config: resolvedConfig,
      state: 'loaded',
    }

    this.plugins.set(manifest.name, plugin)
    this.config[manifest.name] = resolvedConfig

    return { plugin, warnings }
  }

  unregister(name: string): boolean {
    this.config = Object.fromEntries(
      Object.entries(this.config).filter(([key]) => key !== name)
    )
    return this.plugins.delete(name)
  }

  getPlugin(name: string): PluginInstance | undefined {
    return this.plugins.get(name)
  }

  getPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values())
  }

  getActivePlugins(): PluginInstance[] {
    return this.getPluginsByState('active')
  }

  getPluginsByState(state: PluginState): PluginInstance[] {
    return this.getPlugins().filter(p => p.state === state)
  }

  initialize(name: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (plugin.state !== 'loaded') return false

    const configErrors = this.validateConfig(plugin.manifest, plugin.config)
    if (configErrors.length > 0) {
      plugin.state = 'error'
      plugin.error = configErrors.join('. ')
      return false
    }

    plugin.state = 'initialized'
    plugin.error = undefined
    return true
  }

  activate(name: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (plugin.state !== 'initialized') return false

    plugin.state = 'active'
    plugin.error = undefined
    return true
  }

  deactivate(name: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (plugin.state === 'loaded') return false

    plugin.state = 'disabled'
    return true
  }

  loadAll(): PluginInstance[] {
    const results: PluginInstance[] = []
    for (const plugin of this.plugins.values()) {
      if (plugin.state === 'loaded') {
        this.initialize(plugin.manifest.name)
      }
      if (plugin.state === 'initialized') {
        this.activate(plugin.manifest.name)
      }
      const current = this.plugins.get(plugin.manifest.name)
      if (current) {
        results.push(current)
      }
    }
    return results
  }

  unloadAll(): PluginInstance[] {
    const results: PluginInstance[] = []
    for (const plugin of this.plugins.values()) {
      if (plugin.state !== 'disabled') {
        this.deactivate(plugin.manifest.name)
      }
      const current = this.plugins.get(plugin.manifest.name)
      if (current) {
        results.push(current)
      }
    }
    return results
  }

  registerHook(hook: PluginHook, fn: PluginHookFn): void {
    append(this.hooks, hook, fn)
  }

  executeHook(hook: PluginHook, context: Record<string, unknown>): Record<string, unknown>[] {
    const fns = this.hooks.get(hook)
    if (!fns) return []

    const results: Record<string, unknown>[] = []
    for (const fn of fns) {
      const result = fn(context)
      if (result !== undefined) {
        results.push(result)
      }
    }
    return results
  }

  hasHook(hook: PluginHook): boolean {
    const fns = this.hooks.get(hook)
    return fns !== undefined && fns.length > 0
  }

  getHooks(hook: PluginHook): PluginHookFn[] {
    return this.hooks.get(hook) ?? []
  }

  getStatistics(): {
    total: number
    loaded: number
    initialized: number
    active: number
    error: number
    disabled: number
    hooks: number
  } {
    const plugins = this.getPlugins()
    let hookCount = 0
    for (const fns of this.hooks.values()) {
      hookCount += fns.length
    }
    let loaded = 0, initialized = 0, active = 0, errorCount = 0, disabledCount = 0
    for (let i = 0; i < plugins.length; i++) {
      const s = plugins[i]!.state
      if (s === 'loaded') loaded++
      else if (s === 'initialized') initialized++
      else if (s === 'active') active++
      else if (s === 'error') errorCount++
      else if (s === 'disabled') disabledCount++
    }
    return {
      total: plugins.length,
      loaded,
      initialized,
      active,
      error: errorCount,
      disabled: disabledCount,
      hooks: hookCount,
    }
  }

  clear(): void {
    this.plugins.clear()
    this.hooks.clear()
    this.config = {}
  }
}
