import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'

// ─── Interfaces ──────────────────────────────────────────

/**
 * Represents the CodeForge configuration structure.
 *
 * @example
 * ```ts
 * const config: CodeForgeConfig = {
 *   ignore: ['node_modules', '.git'],
 *   extensions: ['.ts', '.tsx'],
 *   format: 'table',
 *   theme: 'default',
 *   maxFileSize: 1_000_000,
 *   defaultPath: '.',
 *   aliases: {},
 * }
 * ```
 */
export interface CodeForgeConfig {
  /** Patterns to always ignore */
  ignore: string[]
  /** Default file extensions */
  extensions: string[]
  /** Default output format */
  format: string
  /** Color theme (default|dark|light|none) */
  theme: string
  /** Max file size to analyze (bytes) */
  maxFileSize: number
  /** Default analysis path */
  defaultPath: string
  /** Command aliases */
  aliases: Record<string, string>
}

/**
 * Represents a resolved configuration file with metadata.
 *
 * @example
 * ```ts
 * const configFile: ConfigFile = {
 *   path: '.codeforge.json',
 *   exists: true,
 *   config: { ... },
 *   source: 'project',
 * }
 * ```
 */
export interface ConfigFile {
  /** Resolved config file path */
  path: string
  /** Whether the config file exists on disk */
  exists: boolean
  /** The merged configuration */
  config: CodeForgeConfig
  /** Where the config came from */
  source: 'project' | 'global' | 'default'
}

// ─── Default config ─────────────────────────────────────

/**
 * Default configuration values used when no config file exists.
 *
 * @example
 * ```ts
 * const config = { ...DEFAULT_CONFIG, format: 'json' }
 * ```
 */
export const DEFAULT_CONFIG: CodeForgeConfig = {
  ignore: ['node_modules', '.git', 'dist', 'build', 'coverage', '.cache'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  format: 'table',
  theme: 'default',
  maxFileSize: 1_000_000,
  defaultPath: '.',
  aliases: {},
}

// ─── Config path resolution ─────────────────────────────

/**
 * Resolve the config file path based on scope.
 *
 * Project config: `.codeforge.json` in current directory
 * Global config: `~/.config/codeforge/config.json`
 *
 * @example
 * ```ts
 * const projectPath = getConfigPath(false) // '.codeforge.json'
 * const globalPath = getConfigPath(true)   // '/home/user/.config/codeforge/config.json'
 * ```
 *
 * @param global - Use global config instead of project config
 * @returns The resolved config file path
 */
export function getConfigPath(global: boolean): string {
  if (global) {
    return join(homedir(), '.config', 'codeforge', 'config.json')
  }
  return resolve('.codeforge.json')
}

// ─── Config loading ─────────────────────────────────────

/**
 * Deep merge a partial config with defaults.
 * Config values override defaults.
 *
 * @example
 * ```ts
 * const merged = deepMerge(DEFAULT_CONFIG, { format: 'json', theme: 'dark' })
 * ```
 */
function deepMerge(defaults: CodeForgeConfig, overrides: Partial<CodeForgeConfig>): CodeForgeConfig {
  const result: CodeForgeConfig = { ...defaults }

  for (const key of Object.keys(overrides) as Array<keyof CodeForgeConfig>) {
    const overrideVal = overrides[key]
    if (overrideVal !== undefined) {
      if (key === 'aliases' && typeof overrideVal === 'object' && overrideVal !== null) {
        result.aliases = { ...defaults.aliases, ...(overrideVal as Record<string, string>) }
      } else {
        (result[key] as typeof overrideVal) = overrideVal
      }
    }
  }

  return result
}

/**
 * Load and merge configuration from the appropriate path.
 *
 * Reads the config file, parses JSON, and deep-merges with DEFAULT_CONFIG.
 * If no file exists, returns DEFAULT_CONFIG with source 'default'.
 *
 * @example
 * ```ts
 * const configFile = loadConfig(false)
 * console.log(configFile.source)  // 'project' | 'global' | 'default'
 * console.log(configFile.config.format) // 'table'
 * ```
 *
 * @param global - Load global config instead of project config
 * @returns A ConfigFile with the loaded/merged config
 */
export function loadConfig(global: boolean): ConfigFile {
  const configPath = getConfigPath(global)

  if (!existsSync(configPath)) {
    return {
      config: { ...DEFAULT_CONFIG, aliases: { ...DEFAULT_CONFIG.aliases } },
      exists: false,
      path: configPath,
      source: 'default',
    }
  }

  try {
    const raw = readFileSync(configPath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<CodeForgeConfig>
    const merged = deepMerge(DEFAULT_CONFIG, parsed)

    return {
      config: merged,
      exists: true,
      path: configPath,
      source: global ? 'global' : 'project',
    }
  } catch {
    return {
      config: { ...DEFAULT_CONFIG, aliases: { ...DEFAULT_CONFIG.aliases } },
      exists: true,
      path: configPath,
      source: 'default',
    }
  }
}

// ─── Config saving ───────────────────────────────────────

/**
 * Write configuration to file.
 *
 * Creates the directory if needed, writes JSON with 2-space indent.
 *
 * @example
 * ```ts
 * const config = { ...DEFAULT_CONFIG, format: 'json' }
 * saveConfig(config, false)
 * ```
 *
 * @param config - The configuration to save
 * @param global - Save to global config path
 */
export function saveConfig(config: CodeForgeConfig, global: boolean): void {
  const configPath = getConfigPath(global)
  const dir = dirname(configPath)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
}

// ─── Get config value ───────────────────────────────────

/**
 * Get a nested config value by dot-notation key.
 *
 * @example
 * ```ts
 * getConfigValue(config, 'ignore')         // { found: true, value: ['node_modules', ...] }
 * getConfigValue(config, 'aliases.test')   // { found: true, value: 'count' }
 * getConfigValue(config, 'unknown')        // { found: false, value: undefined }
 * ```
 *
 * @param config - The configuration object
 * @param keyPath - Dot-notation key path
 * @returns An object with found status and value
 */
export function getConfigValue(config: CodeForgeConfig, keyPath: string): { found: boolean; value: unknown } {
  const parts = keyPath.split('.')
  let current: unknown = config

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return { found: false, value: undefined }
    }
    const record = current as unknown as Record<string, unknown>
    if (!(part in record)) {
      return { found: false, value: undefined }
    }
    current = record[part]
  }

  return { found: true, value: current }
}

// ─── Set config value ───────────────────────────────────

/**
 * Set a nested config value by dot-notation key.
 *
 * Validates that the key exists in DEFAULT_CONFIG.
 * For array values, parses comma-separated strings.
 *
 * @example
 * ```ts
 * const updated = setConfigValue(config, 'format', 'json')
 * const updated2 = setConfigValue(config, 'extensions', '.py,.rs')
 * const updated3 = setConfigValue(config, 'aliases.test', 'count')
 * ```
 *
 * @param config - The current configuration
 * @param keyPath - Dot-notation key path
 * @param value - The value to set (string or parsed value)
 * @returns Updated config, or original if key is unknown
 */
export function setConfigValue(config: CodeForgeConfig, keyPath: string, value: string): CodeForgeConfig {
  const parts = keyPath.split('.')

  // Validate: top-level key must exist in DEFAULT_CONFIG
  const topLevelKey = parts[0]
  if (!topLevelKey || !(topLevelKey in DEFAULT_CONFIG)) {
    return config
  }

  // Clone config for immutability
  const updated: CodeForgeConfig = {
    ...config,
    aliases: { ...config.aliases },
    ignore: [...config.ignore],
    extensions: [...config.extensions],
  }

  if (parts.length === 1) {
    // Top-level key
    const key = parts[0]!
    const defaultValue = (DEFAULT_CONFIG as unknown as Record<string, unknown>)[key]
    const parsedValue = parseValue(value, defaultValue)
    ;(updated as unknown as Record<string, unknown>)[key] = parsedValue
  } else {
    // Nested key (e.g., aliases.test)
    const parentKey = parts[0]!
    const childKey = parts[1] ?? ''
    const parent = (updated as unknown as Record<string, unknown>)[parentKey]

    if (typeof parent === 'object' && parent !== null) {
      ;(parent as Record<string, string>)[childKey] = value
    }
  }

  return updated
}

/**
 * Parse a string value based on the default value's type.
 */
function parseValue(value: string, defaultValue: unknown): unknown {
  if (Array.isArray(defaultValue)) {
    return value.split(',').map((v) => v.trim()).filter(Boolean)
  }
  if (typeof defaultValue === 'number') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? defaultValue : parsed
  }
  return value
}

// ─── Config validation ──────────────────────────────────

/**
 * Validate configuration structure.
 *
 * Checks all keys are known, types match, and values are within
 * acceptable ranges.
 *
 * @example
 * ```ts
 * const result = validateConfig(config)
 * if (!result.valid) {
 *   console.error(result.errors)
 * }
 * ```
 *
 * @param config - The configuration to validate
 * @returns Validation result with errors array
 */
export function validateConfig(config: CodeForgeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for unknown keys
  const knownKeys = new Set(Object.keys(DEFAULT_CONFIG))
  for (const key of Object.keys(config)) {
    if (!knownKeys.has(key)) {
      errors.push(`Unknown config key: "${key}"`)
    }
  }

  // Check types match DEFAULT_CONFIG types
  for (const key of Object.keys(DEFAULT_CONFIG) as Array<keyof CodeForgeConfig>) {
    const configVal = config[key]
    const defaultVal = DEFAULT_CONFIG[key]
    const configType = Array.isArray(configVal) ? 'array' : typeof configVal
    const defaultType = Array.isArray(defaultVal) ? 'array' : typeof defaultVal

    if (configType !== defaultType) {
      errors.push(`Key "${key}" has wrong type: expected ${defaultType}, got ${configType}`)
    }
  }

  // Check ignore is string array
  if (Array.isArray(config.ignore)) {
    for (const item of config.ignore) {
      if (typeof item !== 'string') {
        errors.push('ignore must contain only strings')
        break
      }
    }
  }

  // Check extensions start with '.'
  if (Array.isArray(config.extensions)) {
    for (const ext of config.extensions) {
      if (typeof ext !== 'string' || !ext.startsWith('.')) {
        errors.push(`Extension "${ext}" must start with "."`)
      }
    }
  }

  // Check format is valid
  const validFormats = ['table', 'json', 'csv']
  if (!validFormats.includes(config.format)) {
    errors.push(`Invalid format: "${config.format}". Must be one of: ${validFormats.join(', ')}`)
  }

  // Check theme is valid
  const validThemes = ['default', 'dark', 'light', 'none']
  if (!validThemes.includes(config.theme)) {
    errors.push(`Invalid theme: "${config.theme}". Must be one of: ${validThemes.join(', ')}`)
  }

  // Check maxFileSize is positive
  if (typeof config.maxFileSize === 'number' && config.maxFileSize <= 0) {
    errors.push(`maxFileSize must be a positive number, got ${config.maxFileSize}`)
  }

  return { errors, valid: errors.length === 0 }
}

// ─── Init config ─────────────────────────────────────────

/**
 * Create initial configuration file with defaults.
 *
 * Writes DEFAULT_CONFIG to the config path.
 *
 * @example
 * ```ts
 * const configFile = initConfig(false)
 * console.log(configFile.exists) // true
 * ```
 *
 * @param global - Initialize global config
 * @returns The newly created ConfigFile
 */
export function initConfig(global: boolean): ConfigFile {
  const configPath = getConfigPath(global)
  saveConfig(DEFAULT_CONFIG, global)

  return {
    config: { ...DEFAULT_CONFIG, aliases: { ...DEFAULT_CONFIG.aliases } },
    exists: true,
    path: configPath,
    source: global ? 'global' : 'project',
  }
}

// ─── Reset config ────────────────────────────────────────

/**
 * Reset configuration to defaults.
 *
 * Same as initConfig but explicitly overwrites existing config.
 *
 * @example
 * ```ts
 * const configFile = resetConfig(false)
 * // Config file now contains DEFAULT_CONFIG values
 * ```
 *
 * @param global - Reset global config
 * @returns The reset ConfigFile
 */
export function resetConfig(global: boolean): ConfigFile {
  return initConfig(global)
}
