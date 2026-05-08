import type {
  ConfigSource,
  ConfigEntry,
  ConfigSnapshot,
  LoaderConfig,
} from './types.js'
import { DEFAULT_LOADER_CONFIG } from './types.js'

export type {
  ConfigSource,
  ConfigEntry,
  ConfigSnapshot,
  LoaderConfig,
} from './types.js'
export { DEFAULT_LOADER_CONFIG } from './types.js'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (isPlainObject(current)) {
      current = current[part]
    } else {
      return undefined
    }
  }
  return current
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    if (!isPlainObject(current[part])) {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }
  current[parts[parts.length - 1]!] = value
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Array<[string, unknown]> {
  const result: Array<[string, unknown]> = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (isPlainObject(value)) {
      result.push(...flattenObject(value, fullKey))
    } else {
      result.push([fullKey, value])
    }
  }
  return result
}

function deepMergeObjects(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...left }
  for (const [key, rightVal] of Object.entries(right)) {
    const leftVal = result[key]
    if (isPlainObject(leftVal) && isPlainObject(rightVal)) {
      result[key] = deepMergeObjects(leftVal, rightVal)
    } else {
      result[key] = rightVal
    }
  }
  return result
}

export class ConfigLoader {
  private sources: Map<string, ConfigSource> = new Map()
  private config: Record<string, unknown> = {}
  private entries: Map<string, ConfigEntry> = new Map()
  private overrideEntries: ConfigEntry[] = []
  private options: LoaderConfig
  private sourceIdCounter = 0
  private loadCount = 0

  constructor(options?: Partial<LoaderConfig>) {
    this.options = { ...DEFAULT_LOADER_CONFIG, ...options }
  }

  addSource(source: ConfigSource): string {
    const id = `source_${this.sourceIdCounter++}`
    this.sources.set(id, { ...source })
    return id
  }

  removeSource(id: string): void {
    this.sources.delete(id)
  }

  getSources(): ConfigSource[] {
    return [...this.sources.values()].sort(
      (a, b) => a.priority - b.priority,
    )
  }

  load(): void {
    this.config = {}
    this.entries.clear()
    this.overrideEntries = []
    this.loadCount++

    const sorted = [...this.sources.entries()].sort(
      ([, a], [, b]) => a.priority - b.priority,
    )

    for (const [sourceId, source] of sorted) {
      const processed = this.processSource(source)
      this.applyMerge(processed, sourceId)
    }
  }

  private applyMerge(
    processed: Record<string, unknown>,
    sourceId: string,
  ): void {
    if (this.options.mergeStrategy === 'replace' && this.entries.size > 0) {
      for (const entry of this.entries.values()) {
        this.overrideEntries.push({ ...entry, overridden: true })
      }
      this.entries.clear()
    }

    if (
      this.options.mergeStrategy === 'shallow' &&
      this.entries.size > 0
    ) {
      for (const topKey of Object.keys(processed)) {
        const keysToRemove: string[] = []
        for (const entryKey of this.entries.keys()) {
          if (entryKey === topKey || entryKey.startsWith(`${topKey}.`)) {
            keysToRemove.push(entryKey)
          }
        }
        for (const k of keysToRemove) {
          const existing = this.entries.get(k)
          if (existing) {
            this.overrideEntries.push({ ...existing, overridden: true })
            this.entries.delete(k)
          }
        }
      }
    }

    const flat = flattenObject(processed)
    for (const [key, value] of flat) {
      const existing = this.entries.get(key)
      if (existing) {
        this.overrideEntries.push({ ...existing, overridden: true })
      }
      this.entries.set(key, {
        key,
        value,
        source: sourceId,
        overridden: false,
      })
    }

    if (this.options.mergeStrategy === 'replace') {
      this.config = { ...processed }
    } else if (this.options.mergeStrategy === 'shallow') {
      this.config = { ...this.config, ...processed }
    } else {
      this.config = deepMergeObjects(this.config, processed)
    }
  }

  private processSource(
    source: ConfigSource,
  ): Record<string, unknown> {
    if (source.type === 'json') {
      return this.parseJsonData(source.data)
    }
    if (source.type === 'env') {
      return this.parseEnvData(source.data)
    }
    return source.data
  }

  private parseJsonData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      } else {
        result[key] = value
      }
    }
    return result
  }

  private parseEnvData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    const prefix = this.options.envPrefix

    for (const [key, value] of Object.entries(data)) {
      if (prefix && !key.startsWith(prefix)) continue

      let normalizedKey = prefix ? key.slice(prefix.length) : key
      for (const sep of this.options.separators) {
        normalizedKey = normalizedKey.replaceAll(sep, '.')
      }

      let parsedValue: unknown = value
      if (typeof value === 'string') {
        if (value === 'true') {
          parsedValue = true
        } else if (value === 'false') {
          parsedValue = false
        } else if (/^-?\d+$/.test(value)) {
          parsedValue = parseInt(value, 10)
        } else if (/^-?\d+\.\d+$/.test(value)) {
          parsedValue = parseFloat(value)
        }
      }

      const parts = normalizedKey.split('.')
      let current: Record<string, unknown> = result
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!
        if (!isPlainObject(current[part])) {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }
      current[parts[parts.length - 1]!] = parsedValue
    }

    return result
  }

  get(key: string): unknown {
    return getNestedValue(this.config, key)
  }

  set(key: string, value: unknown): void {
    setNestedValue(this.config, key, value)
    const existing = this.entries.get(key)
    this.entries.set(key, {
      key,
      value,
      source: 'manual',
      overridden: existing !== undefined,
    })
  }

  has(key: string): boolean {
    const parts = key.split('.')
    let current: unknown = this.config
    for (const part of parts) {
      if (current === null || current === undefined) return false
      if (isPlainObject(current)) {
        if (part in current) {
          current = current[part]
        } else {
          return false
        }
      } else {
        return false
      }
    }
    return true
  }

  getAll(): Record<string, unknown> {
    return { ...this.config }
  }

  getSnapshot(): ConfigSnapshot {
    return {
      entries: [...this.entries.values()],
      timestamp: new Date(),
      version: String(this.loadCount),
    }
  }

  getOverrides(): ConfigEntry[] {
    return [...this.overrideEntries]
  }

  resolve(key: string): unknown {
    const sorted = [...this.sources.entries()].sort(
      ([, a], [, b]) => b.priority - a.priority,
    )

    for (const [, source] of sorted) {
      const processed = this.processSource(source)
      const value = getNestedValue(processed, key)
      if (value !== undefined) return value
    }

    return undefined
  }

  getStatistics(): {
    totalKeys: number
    totalSources: number
    overrideCount: number
    sourceBreakdown: Record<string, number>
  } {
    const sourceBreakdown: Record<string, number> = {}
    for (const entry of this.entries.values()) {
      sourceBreakdown[entry.source] =
        (sourceBreakdown[entry.source] ?? 0) + 1
    }
    return {
      totalKeys: this.entries.size,
      totalSources: this.sources.size,
      overrideCount: this.overrideEntries.length,
      sourceBreakdown,
    }
  }

  clear(): void {
    this.sources.clear()
    this.config = {}
    this.entries.clear()
    this.overrideEntries = []
    this.sourceIdCounter = 0
  }
}
