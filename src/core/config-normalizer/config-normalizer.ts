import type {
  ConfigArray,
  ConfigObject,
  ConfigSource,
  ConfigValue,
  NormalizeOptions,
  NormalizedConfig,
  SchemaProperty,
} from './types.js'
import { ConfigReader } from './config-reader.js'
import { sortedBy } from '../../utils/array-helpers.js'

const DEFAULT_OPTIONS: NormalizeOptions = {
  camelCase: false,
  envPrefix: 'APP',
  defaults: {},
  aliases: {},
  allowUnknown: true,
  requiredKeys: [],
}

function isConfigObject(value: ConfigValue): value is ConfigObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isConfigArray(value: ConfigValue): value is ConfigArray {
  return Array.isArray(value)
}

export class ConfigNormalizer {
  private reader = new ConfigReader()

  normalize(
    sources: ConfigSource[],
    options?: Partial<NormalizeOptions>,
  ): NormalizedConfig {
    const opts: NormalizeOptions = { ...DEFAULT_OPTIONS, ...options }
    const warnings: string[] = []

    const sorted = sortedBy(sources, s => s.priority)
    const overridden = this.resolveOverrides(sorted)

    let merged: ConfigObject = {}
    for (const source of sorted) {
      merged = this.reader.deepMerge(merged, source.data)
    }

    merged = this.applyAliases(merged, opts.aliases)

    const { data: withDefaults, applied: appliedDefaults } =
      this.applyDefaults(merged, opts.defaults)

    if (!opts.allowUnknown) {
      const knownKeys = Object.keys(opts.defaults)
      const { data: stripped, stripped: removed } = this.stripUnknown(
        withDefaults,
        knownKeys,
      )
      for (const key of removed) {
        warnings.push(`Unknown key stripped: ${key}`)
      }
      merged = stripped
    } else {
      merged = withDefaults
    }

    const missingRequired = this.validateRequired(merged, opts.requiredKeys)
    for (const key of missingRequired) {
      warnings.push(`Missing required key: ${key}`)
    }

    if (opts.camelCase) {
      merged = this.convertCase(merged, true)
    }

    return {
      data: merged,
      sources: sorted.map((s) => s.name),
      appliedDefaults,
      overridden,
      warnings,
    }
  }

  applyDefaults(
    data: ConfigObject,
    defaults: ConfigObject,
  ): { data: ConfigObject; applied: string[] } {
    const result: ConfigObject = { ...data }
    const applied: string[] = []
    for (const [key, value] of Object.entries(defaults)) {
      if (!(key in result)) {
        result[key] = value
        applied.push(key)
      }
    }
    return { data: result, applied }
  }

  applyAliases(
    data: ConfigObject,
    aliases: Record<string, string>,
  ): ConfigObject {
    const result: ConfigObject = { ...data }
    for (const [alias, target] of Object.entries(aliases)) {
      if (alias in result && !(target in result)) {
        result[target] = result[alias]
        delete result[alias]
      } else if (alias in result && target in result) {
        delete result[alias]
      }
    }
    return result
  }

  convertCase(obj: ConfigObject, camelCase: boolean): ConfigObject {
    const result: ConfigObject = {}
    for (const [key, value] of Object.entries(obj)) {
      const newKey = camelCase ? this.toCamelCase(key) : this.toSnakeCase(key)
      if (isConfigObject(value)) {
        result[newKey] = this.convertCase(value, camelCase)
      } else if (isConfigArray(value)) {
        result[newKey] = value.map((item) =>
          isConfigObject(item)
            ? this.convertCase(item, camelCase)
            : item,
        )
      } else {
        result[newKey] = value
      }
    }
    return result
  }

  private toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
  }

  validateRequired(data: ConfigObject, required: string[]): string[] {
    const missing: string[] = []
    for (const key of required) {
      if (!(key in data) || data[key] === undefined || data[key] === null) {
        missing.push(key)
      }
    }
    return missing
  }

  validateSchema(
    data: ConfigObject,
    schema: Record<string, SchemaProperty>,
  ): string[] {
    const errors: string[] = []
    for (const [key, prop] of Object.entries(schema)) {
      const value = data[key]

      if (value === undefined || value === null) {
        if (prop.required) {
          errors.push(`Missing required key: ${key}`)
        }
        continue
      }

      const actualType = this.getValueType(value)
      if (actualType !== prop.type) {
        errors.push(
          `Key "${key}" expected type "${prop.type}" but got "${actualType}"`,
        )
        continue
      }

      if (prop.enum && !prop.enum.includes(value)) {
        errors.push(
          `Key "${key}" value must be one of: ${prop.enum.join(', ')}`,
        )
      }
    }
    return errors
  }

  private getValueType(
    value: ConfigValue,
  ): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array'
    if (isConfigObject(value)) return 'object'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    return 'string'
  }

  resolveOverrides(
    sources: ConfigSource[],
  ): Record<string, { from: string; to: string; key: string }> {
    const result: Record<string, { from: string; to: string; key: string }> =
      {}
    const sorted = sortedBy(sources, s => s.priority)

    const firstSeen: Record<string, string> = {}
    for (const source of sorted) {
      for (const key of Object.keys(source.data)) {
        if (!(key in firstSeen)) {
          firstSeen[key] = source.name
        } else {
          result[key] = {
            from: firstSeen[key]!,
            to: source.name,
            key,
          }
        }
      }
    }
    return result
  }

  stripUnknown(
    data: ConfigObject,
    knownKeys: string[],
  ): { data: ConfigObject; stripped: string[] } {
    const result: ConfigObject = {}
    const stripped: string[] = []
    const knownSet = new Set(knownKeys)
    for (const [key, value] of Object.entries(data)) {
      if (knownSet.has(key)) {
        result[key] = value
      } else {
        stripped.push(key)
      }
    }
    return { data: result, stripped }
  }
}
