export type ConfigEnv2 = 'dev' | 'staging' | 'prod' | 'test'
export type ConfigFormat2 = 'json' | 'yaml' | 'env' | 'toml'

export interface ConfigVersion2 {
  version: number
  data: Record<string, unknown>
  checksum: string
  timestamp: number
  author: string
  changelog: string
}

export interface ConfigSubscriber2 {
  id: string
  key: string
  callback: (value: unknown, version: number) => void
  active: boolean
}

export class ConfigDistributor2 {
  private configs: Map<string, unknown> = new Map()
  private versions: Map<string, ConfigVersion2[]> = new Map()
  private subscribers: Map<string, ConfigSubscriber2[]> = new Map()
  private envOverrides: Map<string, Map<string, unknown>> = new Map()
  private listeners: Array<(event: string, data: unknown) => void> = []
  private versionCounter = 0
  private maxVersions: number = 50

  set(key: string, value: unknown, author: string = 'system', changelog: string = ''): number {
    const oldVal = this.configs.get(key)
    this.configs.set(key, value)
    const version = ++this.versionCounter
    const versionEntry: ConfigVersion2 = {
      version,
      data: { ...this.getAll() },
      checksum: this.checksum(value),
      timestamp: Date.now(),
      author,
      changelog: changelog || (oldVal === undefined ? 'initial' : 'updated'),
    }
    const versions = this.versions.get(key) || []
    versions.push(versionEntry)
    if (versions.length > this.maxVersions) versions.shift()
    this.versions.set(key, versions)
    this.notify('config-set', { key, version })
    this.notifySubscribers(key, value, version)
    return version
  }

  get<T = unknown>(key: string, env?: ConfigEnv2): T | undefined {
    const baseVal = this.configs.get(key)
    if (env) {
      const overrides = this.envOverrides.get(env)
      if (overrides && overrides.has(key)) return overrides.get(key) as T
    }
    return baseVal as T | undefined
  }

  getAll(env?: ConfigEnv2): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    this.configs.forEach((val, key) => {
      result[key] = val
    })
    if (env) {
      const overrides = this.envOverrides.get(env)
      if (overrides) overrides.forEach((val, key) => { result[key] = val })
    }
    return result
  }

  setEnvOverride(env: ConfigEnv2, key: string, value: unknown): this {
    let overrides = this.envOverrides.get(env)
    if (!overrides) { overrides = new Map(); this.envOverrides.set(env, overrides) }
    overrides.set(key, value)
    this.notify('env-override-set', { env, key })
    return this
  }

  removeEnvOverride(env: ConfigEnv2, key: string): boolean {
    const overrides = this.envOverrides.get(env)
    if (!overrides) return false
    return overrides.delete(key)
  }

  subscribe(key: string, callback: (value: unknown, version: number) => void): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const subscriber: ConfigSubscriber2 = { id, key, callback, active: true }
    const subs = this.subscribers.get(key) || []
    subs.push(subscriber)
    this.subscribers.set(key, subs)
    return id
  }

  unsubscribe(subId: string): boolean {
    for (const [key, subs] of this.subscribers.entries()) {
      const idx = subs.findIndex(s => s.id === subId)
      if (idx >= 0) {
        subs.splice(idx, 1)
        if (subs.length === 0) this.subscribers.delete(key)
        return true
      }
    }
    return false
  }

  private notifySubscribers(key: string, value: unknown, version: number): void {
    const subs = this.subscribers.get(key)
    if (!subs) return
    subs.forEach(s => { if (s.active) s.callback(value, version) })
  }

  getVersion(key: string): ConfigVersion2 | undefined {
    const versions = this.versions.get(key)
    if (!versions || versions.length === 0) return undefined
    return versions[versions.length - 1]
  }

  getHistory(key: string): ConfigVersion2[] { return this.versions.get(key) || [] }

  rollback(key: string, toVersion: number): boolean {
    const versions = this.versions.get(key)
    if (!versions) return false
    const target = versions.find(v => v.version === toVersion)
    if (!target) return false
    this.configs.set(key, target.data[key])
    this.notifySubscribers(key, target.data[key] || this.configs.get(key), target.version)
    this.notify('config-rolled-back', { key, toVersion })
    return true
  }

  delete(key: string): boolean {
    const existed = this.configs.delete(key)
    this.versions.delete(key)
    this.subscribers.delete(key)
    this.envOverrides.forEach(overrides => overrides.delete(key))
    if (existed) this.notify('config-deleted', { key })
    return existed
  }

  has(key: string): boolean { return this.configs.has(key) }
  keys(): string[] { return Array.from(this.configs.keys()) }

  private checksum(data: unknown): string {
    const str = JSON.stringify(data)
    let h = 0
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
    return `cs_${Math.abs(h).toString(16)}`
  }

  listen(fn: (event: string, data: unknown) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, data: unknown): void {
    this.listeners.forEach(fn => fn(event, data))
  }

  getStats(): { keys: number; versions: number; subscribers: number; envOverrides: number } {
    return {
      keys: this.configs.size,
      versions: Array.from(this.versions.values()).reduce((s, v) => s + v.length, 0),
      subscribers: Array.from(this.subscribers.values()).reduce((s, subs) => s + subs.length, 0),
      envOverrides: Array.from(this.envOverrides.values()).reduce((s, e) => s + e.size, 0),
    }
  }

  count(): number { return this.configs.size }

  toArray(): Array<[string, unknown]> { return Array.from(this.configs.entries()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getAll() }
  clone(): ConfigDistributor2 {
    const cd = new ConfigDistributor2()
    cd.versionCounter = this.versionCounter
    cd.maxVersions = this.maxVersions
    return cd
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConfigDistributor2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.configs.clear()
    this.versions.clear()
    this.subscribers.clear()
    this.envOverrides.clear()
    this.listeners = []
    this.versionCounter = 0
  }
}
