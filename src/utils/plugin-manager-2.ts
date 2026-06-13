export interface Plugin2 {
  name: string
  version: string
  install?: (manager: PluginManager2) => void
  uninstall?: (manager: PluginManager2) => void
  activate?: () => void
  deactivate?: () => void
}

export class PluginManager2 {
  private plugins: Map<string, { plugin: Plugin2; active: boolean }> = new Map()
  private api: Map<string, unknown> = new Map()

  register(plugin: Plugin2): boolean {
    if (this.plugins.has(plugin.name)) return false
    this.plugins.set(plugin.name, { plugin, active: false })
    if (plugin.install) plugin.install(this)
    return true
  }

  unregister(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry) return false
    if (entry.active && entry.plugin.deactivate) entry.plugin.deactivate()
    if (entry.plugin.uninstall) entry.plugin.uninstall(this)
    this.plugins.delete(name)
    return true
  }

  activate(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry || entry.active) return false
    entry.active = true
    if (entry.plugin.activate) entry.plugin.activate()
    return true
  }

  deactivate(name: string): boolean {
    const entry = this.plugins.get(name)
    if (!entry || !entry.active) return false
    entry.active = false
    if (entry.plugin.deactivate) entry.plugin.deactivate()
    return true
  }

  isActive(name: string): boolean {
    return this.plugins.get(name)?.active ?? false
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  get(name: string): Plugin2 | undefined {
    return this.plugins.get(name)?.plugin
  }

  getAll(): Plugin2[] {
    return Array.from(this.plugins.values()).map(e => e.plugin)
  }

  getActive(): Plugin2[] {
    return Array.from(this.plugins.values()).filter(e => e.active).map(e => e.plugin)
  }

  getInactive(): Plugin2[] {
    return Array.from(this.plugins.values()).filter(e => !e.active).map(e => e.plugin)
  }

  names(): string[] {
    return Array.from(this.plugins.keys())
  }

  count(): number { return this.plugins.size }
  activeCount(): number { return this.getActive().length }

  provide(key: string, value: unknown): this {
    this.api.set(key, value)
    return this
  }

  inject<T = unknown>(key: string): T | undefined {
    return this.api.get(key) as T | undefined
  }

  clear(): void {
    for (const [name, entry] of this.plugins) {
      if (entry.active && entry.plugin.deactivate) entry.plugin.deactivate()
      if (entry.plugin.uninstall) entry.plugin.uninstall(this)
    }
    this.plugins.clear()
    this.api.clear()
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify({ plugins: this.names(), active: this.activeCount() }) }
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.plugins.forEach((entry, name) => { result[name] = entry.active })
    return result
  }
  clone(): PluginManager2 {
    const m = new PluginManager2()
    this.api.forEach((v, k) => m.provide(k, v))
    return m
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PluginManager2)) return false
    return this.count() === other.count()
  }
}
