import type { ConfigValue } from './types.js'

export class ConfigNormalizer {
  normalize(config: ConfigValue): ConfigValue {
    if (config === null) return null
    if (typeof config === 'string') {
      const trimmed = config.trim()
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        return Number(trimmed)
      }
      return trimmed
    }
    if (typeof config === 'number' || typeof config === 'boolean') {
      return config
    }
    if (Array.isArray(config)) {
      return config.map((item) => this.normalize(item))
    }
    if (typeof config === 'object') {
      const sorted: Record<string, ConfigValue> = {}
      const keys = Object.keys(config).sort()
      for (const key of keys) {
        sorted[key] = this.normalize(config[key]!)
      }
      return sorted
    }
    return config
  }

  normalizePath(path: string): string[] {
    return path.split('.')
  }

  flatten(config: Record<string, ConfigValue>, prefix?: string): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {}
    const currentPrefix = prefix ?? ''

    for (const key of Object.keys(config)) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key
      const value = config[key]!

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nested = this.flatten(value, fullKey)
        Object.assign(result, nested)
      } else {
        result[fullKey] = value
      }
    }

    return result
  }

  unflatten(flat: Record<string, ConfigValue>): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {}

    for (const key of Object.keys(flat)) {
      const parts = key.split('.')
      let current = result
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]!
        if (i === parts.length - 1) {
          current[part] = flat[key]!
        } else {
          const next = current[part]
          if (typeof next === 'object' && next !== null && !Array.isArray(next)) {
            current = next
          } else {
            const newObj: Record<string, ConfigValue> = {}
            current[part] = newObj
            current = newObj
          }
        }
      }
    }

    return result
  }

  matchesIgnorePattern(path: string[], patterns: string[]): boolean {
    const pathStr = path.join('.')
    for (const pattern of patterns) {
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$'
      const regex = new RegExp(regexStr)
      if (regex.test(pathStr)) return true
    }
    return false
  }
}
