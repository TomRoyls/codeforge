import type {
  PluginDefinition,
  PluginState,
  PluginContext,
  PluginLifecycle,
  ManagerConfig,
} from './types.js'
import { DEFAULT_MANAGER_CONFIG } from './types.js'

export type {
  PluginDefinition,
  PluginState,
  PluginContext,
  PluginLifecycle,
  ManagerConfig,
} from './types.js'
export { DEFAULT_MANAGER_CONFIG } from './types.js'

interface ManagedPlugin {
  definition: PluginDefinition
  lifecycle: PluginLifecycle
  state: PluginState
  error?: string
  priority: number
}

const DEFAULT_CONTEXT: PluginContext = {
  config: {},
  logger: {
    info: (_message: string) => {},
    warn: (_message: string) => {},
    error: (_message: string) => {},
  },
  api: {},
}

export class PluginManager {
  private plugins: Map<string, ManagedPlugin> = new Map()
  private hookCallbacks: Map<string, Array<(data: unknown) => unknown>> = new Map()
  private config: ManagerConfig

  constructor(config?: Partial<ManagerConfig>) {
    this.config = config ? { ...DEFAULT_MANAGER_CONFIG, ...config } : { ...DEFAULT_MANAGER_CONFIG }
  }

  register(definition: PluginDefinition, lifecycle?: PluginLifecycle): void {
    if (!definition.name || definition.name.trim().length === 0) {
      throw new Error('Plugin name is required and must be non-empty.')
    }

    if (this.plugins.has(definition.name)) {
      throw new Error(`Plugin "${definition.name}" is already registered.`)
    }

    const entry: ManagedPlugin = {
      definition,
      lifecycle: lifecycle ?? {},
      state: 'loading',
      priority: definition.priority ?? 0,
    }

    this.plugins.set(definition.name, entry)

    if (entry.lifecycle.onLoad) {
      try {
        entry.lifecycle.onLoad(DEFAULT_CONTEXT)
      } catch (e) {
        entry.state = 'error'
        entry.error = e instanceof Error ? e.message : String(e)
        return
      }
    }

    entry.state = 'loaded'

    if (this.config.autoEnable) {
      this.enable(definition.name)
    }
  }

  unregister(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry) return false

    if (entry.lifecycle.onDestroy) {
      entry.lifecycle.onDestroy(DEFAULT_CONTEXT)
    }

    return this.plugins.delete(name)
  }

  getPlugin(name: string): ManagedPlugin | undefined {
    return this.plugins.get(name)
  }

  getAll(): ManagedPlugin[] {
    return Array.from(this.plugins.values()).sort((a, b) => b.priority - a.priority)
  }

  getByState(state: PluginState): ManagedPlugin[] {
    return this.getAll().filter(entry => entry.state === state)
  }

  enable(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry) return false
    if (entry.state !== 'loaded' && entry.state !== 'disabled') return false

    const unsatisfied: string[] = []
    for (const dep of entry.definition.dependencies) {
      if (dep === name) {
        entry.state = 'error'
        entry.error = `Self-dependency detected: ${name}`
        return false
      }
      const depEntry = this.plugins.get(dep)
      if (!depEntry) {
        unsatisfied.push(dep)
      } else if (this.config.strictDeps && depEntry.state !== 'enabled') {
        unsatisfied.push(dep)
      }
    }

    if (unsatisfied.length > 0) {
      entry.state = 'error'
      entry.error = `Missing or disabled dependencies: ${unsatisfied.join(', ')}`
      return false
    }

    if (entry.lifecycle.onEnable) {
      try {
        entry.lifecycle.onEnable(DEFAULT_CONTEXT)
      } catch (e) {
        entry.state = 'error'
        entry.error = e instanceof Error ? e.message : String(e)
        return false
      }
    }

    entry.state = 'enabled'
    entry.error = undefined
    return true
  }

  disable(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry) return false
    if (entry.state !== 'enabled') return false

    if (entry.lifecycle.onDisable) {
      try {
        entry.lifecycle.onDisable(DEFAULT_CONTEXT)
      } catch (e) {
        entry.state = 'error'
        entry.error = e instanceof Error ? e.message : String(e)
        return false
      }
    }

    entry.state = 'disabled'
    entry.error = undefined
    return true
  }

  resolveDependencies(name: string): string[] {
    const entry = this.plugins.get(name)
    if (!entry) return []

    const missing: string[] = []
    for (const dep of entry.definition.dependencies) {
      if (!this.plugins.has(dep)) {
        missing.push(dep)
      }
    }
    return missing
  }

  registerHook(hookName: string, callback: (data: unknown) => unknown): void {
    const existing = this.hookCallbacks.get(hookName)
    if (existing) {
      existing.push(callback)
    } else {
      this.hookCallbacks.set(hookName, [callback])
    }
  }

  executeHook(hookName: string, data?: unknown): unknown[] {
    const callbacks = this.hookCallbacks.get(hookName)
    if (!callbacks) return []

    const results: unknown[] = []
    for (const cb of callbacks) {
      results.push(cb(data))
    }
    return results
  }

  getLoadOrder(): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []
    const circular: string[] = []

    const sortedPlugins = Array.from(this.plugins.entries()).sort(
      ([, a], [, b]) => b.priority - a.priority
    )

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        circular.push(name)
        return
      }

      visiting.add(name)
      const entry = this.plugins.get(name)
      if (entry) {
        for (const dep of entry.definition.dependencies) {
          if (this.plugins.has(dep)) {
            visit(dep)
          }
        }
      }
      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    for (const [name] of sortedPlugins) {
      visit(name)
    }

    if (circular.length > 0) {
      throw new Error(`Circular dependency detected: ${circular.join(' -> ')}`)
    }

    return order
  }

  getStatistics(): {
    total: number
    loading: number
    loaded: number
    enabled: number
    disabled: number
    error: number
  } {
    const plugins = Array.from(this.plugins.values())
    return {
      total: plugins.length,
      loading: plugins.filter(p => p.state === 'loading').length,
      loaded: plugins.filter(p => p.state === 'loaded').length,
      enabled: plugins.filter(p => p.state === 'enabled').length,
      disabled: plugins.filter(p => p.state === 'disabled').length,
      error: plugins.filter(p => p.state === 'error').length,
    }
  }

  clear(): void {
    this.plugins.clear()
    this.hookCallbacks.clear()
  }
}
