export class EnvReader2 {
  private env: Record<string, string>
  private defaults: Record<string, string> = {}

  constructor(env: Record<string, string> = {}) {
    this.env = { ...env }
  }

  get(key: string, fallback?: string): string | undefined {
    return this.env[key] ?? this.defaults[key] ?? fallback
  }

  getString(key: string, fallback?: string): string | undefined {
    return this.get(key, fallback)
  }

  getInt(key: string, fallback?: number): number | undefined {
    const val = this.get(key)
    if (val === undefined) return fallback
    const num = parseInt(val, 10)
    return isNaN(num) ? fallback : num
  }

  getFloat(key: string, fallback?: number): number | undefined {
    const val = this.get(key)
    if (val === undefined) return fallback
    const num = parseFloat(val)
    return isNaN(num) ? fallback : num
  }

  getBool(key: string, fallback?: boolean): boolean | undefined {
    const val = this.get(key)
    if (val === undefined) return fallback
    return val === 'true' || val === '1' || val === 'yes' || val === 'on'
  }

  getList(key: string, separator = ',', fallback?: string[]): string[] | undefined {
    const val = this.get(key)
    if (val === undefined) return fallback
    return val.split(separator).map(s => s.trim()).filter(s => s)
  }

  getJSON<T = unknown>(key: string, fallback?: T): T | undefined {
    const val = this.get(key)
    if (val === undefined) return fallback
    try { return JSON.parse(val) as T } catch { return fallback }
  }

  set(key: string, value: string): this {
    this.env[key] = value
    return this
  }

  setDefaults(defaults: Record<string, string>): this {
    this.defaults = { ...defaults }
    return this
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  require(key: string): string {
    const val = this.get(key)
    if (val === undefined) throw new Error(`Missing required env: ${key}`)
    return val
  }

  requireInt(key: string): number {
    return parseInt(this.require(key), 10)
  }

  requireBool(key: string): boolean {
    return this.getBool(key, false)!
  }

  keys(): string[] {
    return Array.from(new Set([...Object.keys(this.env), ...Object.keys(this.defaults)]))
  }

  filterByPrefix(prefix: string, stripPrefix = true): Record<string, string> {
    const result: Record<string, string> = {}
    for (const key of this.keys()) {
      if (key.startsWith(prefix)) {
        const value = this.get(key)!
        const resultKey = stripPrefix ? key.substring(prefix.length) : key
        result[resultKey] = value
      }
    }
    return result
  }

  toObject(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const key of this.keys()) {
      result[key] = this.get(key)!
    }
    return result
  }

  toArray(): string[] { return this.keys() }
  toString(): string { return JSON.stringify(this.toObject()) }
  toJSON(): Record<string, string> { return this.toObject() }
  clone(): EnvReader2 {
    const e = new EnvReader2(this.env)
    e.defaults = { ...this.defaults }
    return e
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EnvReader2)) return false
    return JSON.stringify(this.toObject()) === JSON.stringify(other.toObject())
  }
}
