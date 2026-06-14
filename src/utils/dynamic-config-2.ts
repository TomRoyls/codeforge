export type ConfigSource2 = 'file' | 'env' | 'remote' | 'memory' | 'override'
export type ConfigValueType2 = 'string' | 'number' | 'boolean' | 'json' | 'array'

export interface ConfigBinding2 {
  key: string
  source: ConfigSource2
  value: unknown
  type: ConfigValueType2
  updatedAt: number
  version: number
  sensitive: boolean
  overridden: boolean
}

export interface ConfigProvider2 {
  name: string
  source: ConfigSource2
  priority: number
  loaded: boolean
  load: () => Record<string, unknown>
  watch: ((callback: (changes: Record<string, unknown>) => void) => void) | null
}

export class DynamicConfig2 {
  private bindings: Map<string, ConfigBinding2> = new Map()
  private providers: Map<string, ConfigProvider2> = new Map()
  private watchers: Array<(key: string, newValue: unknown, oldValue: unknown) => void> = []
  private version: number = 0
  private listeners: Array<(event: string, data: unknown) => void> = []

  registerProvider(name: string, source: ConfigSource2, load: () => Record<string, unknown>, priority = 0, watch: ((cb: (changes: Record<string, unknown>) => void) => void) | null = null): this {
    this.providers.set(name, { name, source, priority, load, watch, loaded: false })
    const sorted = Array.from(this.providers.values()).sort((a, b) => b.priority - a.priority)
    this.providers.clear()
    sorted.forEach(p => this.providers.set(p.name, p))
    return this
  }

  loadAll(): void {
    const sorted = Array.from(this.providers.values()).sort((a, b) => b.priority - a.priority)
    for (const provider of sorted) {
      const values = provider.load()
      provider.loaded = true
      for (const [key, value] of Object.entries(values)) {
        this.setBinding(key, value, provider.source)
      }
      this.notify('provider-loaded', provider)
    }
    this.version++
  }

  loadProvider(name: string): boolean {
    const provider = this.providers.get(name)
    if (!provider) return false
    const values = provider.load()
    provider.loaded = true
    for (const [key, value] of Object.entries(values)) {
      this.setBinding(key, value, provider.source)
    }
    this.version++
    this.notify('provider-loaded', provider)
    return true
  }

  private setBinding(key: string, value: unknown, source: ConfigSource2): void {
    const existing = this.bindings.get(key)
    if (existing && existing.source !== 'override') {
      if (this.sourcePriority(existing.source) > this.sourcePriority(source)) return
    }
    const type = this.inferType(value)
    this.bindings.set(key, {
      key, value, source, type,
      updatedAt: Date.now(),
      version: this.version + 1,
      sensitive: this.isSensitive(key),
      overridden: source === 'override',
    })
  }

  private sourcePriority(source: ConfigSource2): number {
    const order: Record<ConfigSource2, number> = {
      override: 100, memory: 50, remote: 30, env: 20, file: 10,
    }
    return order[source]
  }

  private inferType(value: unknown): ConfigValueType2 {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'json'
    return 'string'
  }

  private isSensitive(key: string): boolean {
    const sensitive = ['password', 'secret', 'key', 'token', 'credential']
    return sensitive.some(s => key.toLowerCase().includes(s))
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    const binding = this.bindings.get(key)
    return (binding?.value as T) ?? (defaultValue as T)
  }

  getString(key: string, defaultValue?: string): string {
    return String(this.get(key, defaultValue))
  }

  getNumber(key: string, defaultValue?: number): number {
    return Number(this.get(key, defaultValue))
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    return Boolean(this.get(key, defaultValue))
  }

  getJSON<T = unknown>(key: string): T | undefined {
    const value = this.get(key)
    return typeof value === 'object' ? value as T : undefined
  }

  setOverride(key: string, value: unknown): void {
    const old = this.bindings.get(key)
    this.bindings.set(key, {
      key, value, source: 'override',
      type: this.inferType(value),
      updatedAt: Date.now(),
      version: this.version + 1,
      sensitive: old?.sensitive ?? this.isSensitive(key),
      overridden: true,
    })
    this.notify('override-set', { key, value, oldValue: old?.value })
    this.watchers.forEach(fn => fn(key, value, old?.value))
  }

  removeOverride(key: string): boolean {
    const binding = this.bindings.get(key)
    if (!binding || binding.source !== 'override') return false
    this.bindings.delete(key)
    this.notify('override-removed', { key })
    this.watchers.forEach(fn => fn(key, undefined, binding.value))
    return true
  }

  has(key: string): boolean { return this.bindings.has(key) }
  getBinding(key: string): ConfigBinding2 | undefined { return this.bindings.get(key) }

  keys(): string[] { return Array.from(this.bindings.keys()) }

  watch(fn: (key: string, newValue: unknown, oldValue: unknown) => void): this {
    this.watchers.push(fn)
    return this
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getVersion(): number { return this.version }

  getStats(): { bindings: number; providers: number; overrides: number; sensitive: number; loaded: number } {
    const all = Array.from(this.bindings.values())
    return {
      bindings: all.length,
      providers: this.providers.size,
      overrides: all.filter(b => b.overridden).length,
      sensitive: all.filter(b => b.sensitive).length,
      loaded: Array.from(this.providers.values()).filter(p => p.loaded).length,
    }
  }

  count(): number { return this.bindings.size }

  toArray(): ConfigBinding2[] { return Array.from(this.bindings.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.bindings.forEach((b, key) => {
      result[key] = b.sensitive ? '***' : b.value
    })
    return result
  }
  clone(): DynamicConfig2 {
    const dc = new DynamicConfig2()
    dc.version = this.version
    this.bindings.forEach((b, k) => dc.bindings.set(k, { ...b }))
    return dc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DynamicConfig2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.bindings.clear()
    this.providers.clear()
    this.watchers = []
    this.listeners = []
    this.version = 0
  }
}
