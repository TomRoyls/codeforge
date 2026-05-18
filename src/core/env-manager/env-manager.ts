import type { EnvConfig, EnvDiff, EnvName, EnvValidationResult, EnvVariable } from './types.js'
import { EnvResolver } from './env-resolver.js'

export class EnvManager {
  private configs: Map<string, EnvConfig> = new Map()
  private currentEnv: EnvName
  private resolver: EnvResolver

  constructor(defaultEnv: EnvName = 'development') {
    this.currentEnv = defaultEnv
    this.resolver = new EnvResolver()
  }

  createEnv(name: EnvName, variables?: Record<string, string>, inherits?: EnvName): void {
    const now = Date.now()
    const config: EnvConfig = {
      name,
      variables: { ...(variables ?? {}) },
      inherits,
      locked: false,
      createdAt: now,
      updatedAt: now,
    }
    this.configs.set(name, config)
  }

  deleteEnv(name: EnvName): boolean {
    const config = this.configs.get(name)
    if (!config) return false
    if (config.locked) return false
    return this.configs.delete(name)
  }

  getEnv(name: EnvName): EnvConfig | null {
    return this.configs.get(name) ?? null
  }

  listEnvs(): EnvName[] {
    return Array.from(this.configs.keys())
  }

  setVariable(envName: EnvName, key: string, value: string): void {
    const config = this.configs.get(envName)
    if (!config) {
      throw new Error(`Environment "${envName}" not found`)
    }
    if (config.locked) {
      throw new Error(`Environment "${envName}" is locked`)
    }
    config.variables[key] = value
    config.updatedAt = Date.now()
  }

  getVariable(envName: EnvName, key: string): string | undefined {
    const config = this.configs.get(envName)
    if (!config) return undefined
    return config.variables[key]
  }

  removeVariable(envName: EnvName, key: string): boolean {
    const config = this.configs.get(envName)
    if (!config) return false
    if (config.locked) return false
    if (!(key in config.variables)) return false
    delete config.variables[key]
    config.updatedAt = Date.now()
    return true
  }

  resolve(envName?: EnvName): Record<string, string> {
    const target = envName ?? this.currentEnv
    const configArray = Array.from(this.configs.values())
    return this.resolver.resolve(configArray, target)
  }

  diff(from: EnvName, to: EnvName): EnvDiff[] {
    const fromVars = this.resolve(from)
    const toVars = this.resolve(to)
    const allKeys = new Set(Object.keys(fromVars))
    for (const key of Object.keys(toVars)) allKeys.add(key)
    const diffs: EnvDiff[] = []
    for (const key of allKeys) {
      const oldVal = fromVars[key]
      const newVal = toVars[key]
      if (oldVal === undefined && newVal !== undefined) {
        diffs.push({ key, oldValue: undefined, newValue: newVal, type: 'added' })
      } else if (oldVal !== undefined && newVal === undefined) {
        diffs.push({ key, oldValue: oldVal, newValue: undefined, type: 'removed' })
      } else if (oldVal !== newVal) {
        diffs.push({ key, oldValue: oldVal, newValue: newVal, type: 'changed' })
      }
    }
    return diffs
  }

  validate(envName: EnvName, schema: Record<string, EnvVariable>): EnvValidationResult {
    const resolved = this.resolve(envName)
    const missing: string[] = []
    const extra: string[] = []
    const conflicts: string[] = []
    const schemaKeys = new Set(Object.keys(schema))
    const resolvedKeys = new Set(Object.keys(resolved))

    for (const key of schemaKeys) {
      const varDef = schema[key]!
      const hasValue = key in resolved
      if (varDef.isRequired && !hasValue && !varDef.defaultValue) {
        missing.push(key)
      }
      if (hasValue) {
        const val = resolved[key]!
        if (varDef.isSecret && !this.looksSecret(val)) {
          conflicts.push(key)
        }
      }
    }

    for (const key of resolvedKeys) {
      if (!schemaKeys.has(key)) {
        extra.push(key)
      }
    }

    return {
      valid: missing.length === 0 && conflicts.length === 0,
      missing,
      extra,
      conflicts,
    }
  }

  getCurrentEnv(): EnvName {
    return this.currentEnv
  }

  setCurrentEnv(name: EnvName): void {
    if (!this.configs.has(name)) {
      throw new Error(`Environment "${name}" not found`)
    }
    this.currentEnv = name
  }

  exportEnv(envName: EnvName, format: 'json' | 'dotenv' | 'shell'): string {
    const vars = this.resolve(envName)
    if (format === 'json') {
      return JSON.stringify(vars, null, 2)
    }
    if (format === 'dotenv') {
      return Object.entries(vars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')
    }
    return Object.entries(vars)
      .map(([k, v]) => `export ${k}="${v}"`)
      .join('\n')
  }

  importEnv(name: EnvName, data: string, format: 'json' | 'dotenv'): void {
    let variables: Record<string, string>
    if (format === 'json') {
      variables = JSON.parse(data) as Record<string, string>
    } else {
      variables = {}
      for (const line of data.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        variables[key] = val
      }
    }
    const existing = this.configs.get(name)
    if (existing) {
      Object.assign(existing.variables, variables)
      existing.updatedAt = Date.now()
    } else {
      this.createEnv(name, variables)
    }
  }

  private looksSecret(value: string): boolean {
    const secretPatterns = [
      /^[A-Za-z0-9+/]{32,}={0,2}$/,
      /^[a-f0-9]{32,}$/i,
      /^sk[_-]/,
      /^pk[_-]/,
      /^AKIA/,
      /^eyJ/,
    ]
    return secretPatterns.some((p) => p.test(value))
  }
}
