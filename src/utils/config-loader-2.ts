export class ConfigLoader2 {
  private config: Record<string, unknown> = {}
  private defaults: Record<string, unknown> = {}

  setDefaults(defaults: Record<string, unknown>): this {
    this.defaults = { ...defaults }
    return this
  }

  load(data: Record<string, unknown>): this {
    this.config = this.deepMerge(this.config, data)
    return this
  }

  get<T = unknown>(path: string, fallback?: T): T {
    const value = this.resolvePath(path)
    if (value === undefined) {
      const defaultVal = this.resolveDefault(path)
      return (defaultVal ?? fallback) as T
    }
    return value as T
  }

  set(path: string, value: unknown): this {
    const parts = path.split('.')
    let current = this.config
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {}
      }
      current = current[parts[i]] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
    return this
  }

  has(path: string): boolean {
    return this.resolvePath(path) !== undefined
  }

  remove(path: string): boolean {
    const parts = path.split('.')
    let current = this.config
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return false
      current = current[parts[i]] as Record<string, unknown>
    }
    const last = parts[parts.length - 1]
    if (current[last] === undefined) return false
    delete current[last]
    return true
  }

  keys(): string[] {
    return Object.keys(this.flatten(this.config))
  }

  clear(): void {
    this.config = {}
  }

  toJSON(): Record<string, unknown> {
    return { ...this.config }
  }

  flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flatten(value as Record<string, unknown>, path))
      } else {
        result[path] = value
      }
    }
    return result
  }

  private resolvePath(path: string): unknown {
    const parts = path.split('.')
    let current: unknown = this.config
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  private resolveDefault(path: string): unknown {
    const parts = path.split('.')
    let current: unknown = this.defaults
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target }
    for (const [key, value] of Object.entries(source)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(
          (result[key] as Record<string, unknown>) || {},
          value as Record<string, unknown>,
        )
      } else {
        result[key] = value
      }
    }
    return result
  }

  static fromJSON(json: string): ConfigLoader2 {
    const loader = new ConfigLoader2()
    try {
      loader.load(JSON.parse(json))
    } catch {}
    return loader
  }

  static fromEnv(prefix: string, env: Record<string, string>): ConfigLoader2 {
    const loader = new ConfigLoader2()
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith(prefix)) {
        const configKey = key.substring(prefix.length).toLowerCase().replace(/__/g, '.')
        loader.set(configKey, value)
      }
    }
    return loader
  }

  toArray(): string[] { return this.keys() }
  toString(): string { return JSON.stringify(this.config) }
  clone(): ConfigLoader2 {
    const c = new ConfigLoader2()
    c.config = JSON.parse(JSON.stringify(this.config))
    c.defaults = JSON.parse(JSON.stringify(this.defaults))
    return c
  }
  equals(other: unknown): boolean {
    if (!(other instanceof ConfigLoader2)) return false
    return JSON.stringify(this.config) === JSON.stringify(other.config)
  }
}
