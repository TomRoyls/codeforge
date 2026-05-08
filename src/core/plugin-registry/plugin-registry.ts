import type { PluginMetadata, PluginEntry, PluginState, RegistryConfig } from './types.js'
import { PluginMetadataHelper } from './plugin-metadata.js'

const DEFAULT_CONFIG: RegistryConfig = {
  allowConflicts: false,
  maxPlugins: 100,
  autoResolve: true,
}

export class PluginRegistry {
  private plugins: Map<string, PluginEntry> = new Map()
  private config: RegistryConfig
  private helper: PluginMetadataHelper = new PluginMetadataHelper()

  constructor(config?: Partial<RegistryConfig>) {
    this.config = config
      ? { ...DEFAULT_CONFIG, ...config }
      : { ...DEFAULT_CONFIG }
  }

  register(metadata: PluginMetadata): PluginEntry {
    const errors = this.helper.validate(metadata)
    if (errors.length > 0) {
      throw new Error(errors.join(' '))
    }

    if (this.plugins.has(metadata.name) && !this.config.allowConflicts) {
      throw new Error(`Plugin "${metadata.name}" is already registered.`)
    }

    if (this.plugins.size >= this.config.maxPlugins) {
      throw new Error(`Maximum number of plugins (${this.config.maxPlugins}) reached.`)
    }

    const entry: PluginEntry = {
      metadata,
      state: 'discovered',
    }
    this.plugins.set(metadata.name, entry)
    return entry
  }

  unregister(name: string): boolean {
    return this.plugins.delete(name)
  }

  get(name: string): PluginEntry | undefined {
    return this.plugins.get(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  getAll(): PluginEntry[] {
    return Array.from(this.plugins.values())
  }

  getByState(state: PluginState): PluginEntry[] {
    return this.getAll().filter(entry => entry.state === state)
  }

  getByTag(tag: string): PluginEntry[] {
    return this.getAll().filter(entry => entry.metadata.tags.includes(tag))
  }

  updateState(name: string, state: PluginState, error?: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry) return false
    entry.state = state
    if (state === 'loaded') {
      entry.loadedAt = Date.now()
    }
    if (error !== undefined) {
      entry.error = error
    } else if (state !== 'error') {
      entry.error = undefined
    }
    return true
  }

  resolveDependencies(name: string): string[] {
    const entry = this.plugins.get(name)
    if (!entry) return []
    const missing: string[] = []
    for (const dep of entry.metadata.dependencies) {
      if (!this.plugins.has(dep)) {
        missing.push(dep)
      }
    }
    return missing
  }

  resolveAll(): Map<string, string[]> {
    const result = new Map<string, string[]>()
    for (const name of this.plugins.keys()) {
      result.set(name, this.resolveDependencies(name))
    }
    return result
  }

  getLoadOrder(): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []
    const circular: string[] = []

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        circular.push(name)
        return
      }

      visiting.add(name)
      const entry = this.plugins.get(name)
      if (entry) {
        for (const dep of entry.metadata.dependencies) {
          if (this.plugins.has(dep)) {
            visit(dep)
          }
        }
      }
      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    for (const name of this.plugins.keys()) {
      visit(name)
    }

    if (circular.length > 0) {
      throw new Error(`Circular dependency detected: ${circular.join(' -> ')}`)
    }

    return order
  }

  getConfig(): RegistryConfig {
    return { ...this.config }
  }
}
