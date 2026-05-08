import type { ConfigObject, ConfigValue } from './types.js'

function isConfigObject(value: ConfigValue): value is ConfigObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class ConfigReader {
  readJSON(jsonStr: string): ConfigObject {
    const parsed: unknown = JSON.parse(jsonStr)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('JSON config must be an object')
    }
    return parsed as ConfigObject
  }

  readENV(env: Record<string, string>, prefix: string): ConfigObject {
    const result: ConfigObject = {}
    const normalizedPrefix = prefix.endsWith('_') ? prefix : prefix + '_'
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith(normalizedPrefix)) {
        const configKey = key.slice(normalizedPrefix.length).toLowerCase()
        result[configKey] = this.parseENVValue(value)
      }
    }
    return result
  }

  private parseENVValue(value: string): ConfigValue {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null') return null
    if (value === 'undefined') return undefined
    if (/^-?\d+$/.test(value)) return parseInt(value, 10)
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
    return value
  }

  readArgs(args: string[]): ConfigObject {
    const result: ConfigObject = {}
    for (const arg of args) {
      if (arg.startsWith('--')) {
        const eqIndex = arg.indexOf('=')
        if (eqIndex !== -1) {
          const key = arg.slice(2, eqIndex)
          const value = arg.slice(eqIndex + 1)
          result[key] = this.parseArgValue(value)
        } else {
          const key = arg.slice(2)
          result[key] = true
        }
      }
    }
    return result
  }

  private parseArgValue(value: string): ConfigValue {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null') return null
    if (/^-?\d+$/.test(value)) return parseInt(value, 10)
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
    return value
  }

  merge(objects: ConfigObject[]): ConfigObject {
    const result: ConfigObject = {}
    for (const obj of objects) {
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          result[key] = value
        }
      }
    }
    return result
  }

  deepMerge(base: ConfigObject, override: ConfigObject): ConfigObject {
    const result: ConfigObject = { ...base }
    for (const [key, overrideValue] of Object.entries(override)) {
      if (key in result) {
        const baseValue = result[key]
        if (isConfigObject(baseValue) && isConfigObject(overrideValue)) {
          result[key] = this.deepMerge(baseValue, overrideValue)
        } else {
          result[key] = overrideValue
        }
      } else {
        result[key] = overrideValue
      }
    }
    return result
  }

  flatten(obj: ConfigObject, prefix = ''): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {}
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (isConfigObject(value)) {
        const nested = this.flatten(value, fullKey)
        for (const [nestedKey, nestedValue] of Object.entries(nested)) {
          result[nestedKey] = nestedValue
        }
      } else {
        result[fullKey] = value
      }
    }
    return result
  }

  unflatten(flat: Record<string, ConfigValue>): ConfigObject {
    const result: ConfigObject = {}
    for (const [key, value] of Object.entries(flat)) {
      this.setByPath(result, key, value)
    }
    return result
  }

  getByPath(obj: ConfigObject, path: string): ConfigValue {
    const parts = path.split('.')
    let current: ConfigValue = obj
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      if (isConfigObject(current)) {
        current = current[part]
      } else {
        return undefined
      }
    }
    return current
  }

  setByPath(obj: ConfigObject, path: string, value: ConfigValue): void {
    const parts = path.split('.')
    let current: ConfigObject = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (
        !(part in current) ||
        !isConfigObject(current[part])
      ) {
        current[part] = {}
      }
      current = current[part] as ConfigObject
    }
    const lastPart = parts[parts.length - 1]!
    current[lastPart] = value
  }
}
