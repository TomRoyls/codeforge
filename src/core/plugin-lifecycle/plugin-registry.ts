import type { PluginInfo, RegistryEntry } from './types.js'

export class PluginRegistry {
  private entries: Map<string, RegistryEntry> = new Map()
  private nextLoadOrder = 0

  register(plugin: PluginInfo): boolean {
    if (this.entries.has(plugin.name)) {
      return false
    }
    const entry: RegistryEntry = {
      plugin,
      config: {},
      enabled: false,
      loadOrder: this.nextLoadOrder++,
    }
    this.entries.set(plugin.name, entry)
    return true
  }

  unregister(name: string): boolean {
    return this.entries.delete(name)
  }

  get(name: string): RegistryEntry | null {
    return this.entries.get(name) ?? null
  }

  getAll(): RegistryEntry[] {
    return Array.from(this.entries.values())
  }

  find(predicate: (entry: RegistryEntry) => boolean): RegistryEntry[] {
    return this.getAll().filter(predicate)
  }

  exists(name: string): boolean {
    return this.entries.has(name)
  }

  getSize(): number {
    return this.entries.size
  }

  updateEntry(name: string, updates: Partial<Pick<RegistryEntry, 'config' | 'enabled' | 'loadOrder'>>): boolean {
    const entry = this.entries.get(name)
    if (!entry) return false
    if (updates.config !== undefined) entry.config = updates.config
    if (updates.enabled !== undefined) entry.enabled = updates.enabled
    if (updates.loadOrder !== undefined) entry.loadOrder = updates.loadOrder
    return true
  }

  updatePlugin(name: string, plugin: PluginInfo): boolean {
    const entry = this.entries.get(name)
    if (!entry) return false
    entry.plugin = plugin
    return true
  }

  clear(): void {
    this.entries.clear()
    this.nextLoadOrder = 0
  }
}
