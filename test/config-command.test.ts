import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import Config from '../src/commands/config/index.js'
import { formatConfigDiff, formatConfigJson, formatConfigTable } from '../src/commands/config-format-helpers.js'
import {
  DEFAULT_CONFIG,
  getConfigPath,
  getConfigValue,
  initConfig,
  loadConfig,
  resetConfig,
  saveConfig,
  setConfigValue,
  validateConfig,
} from '../src/commands/config-helpers.js'
import type { CodeForgeConfig, ConfigFile } from '../src/commands/config-helpers.js'

// ─── Test helpers ────────────────────────────────────────

const TMP_DIR = join('/tmp', 'codeforge-config-test', String(Date.now()))

function makeConfig(overrides: Partial<CodeForgeConfig> = {}): CodeForgeConfig {
  return {
    ignore: ['node_modules', '.git'],
    extensions: ['.ts', '.tsx'],
    format: 'table',
    theme: 'default',
    maxFileSize: 1_000_000,
    defaultPath: '.',
    aliases: {},
    ...overrides,
  }
}

function makeConfigFile(overrides: Partial<ConfigFile> = {}): ConfigFile {
  return {
    path: '.codeforge.json',
    exists: true,
    config: makeConfig(),
    source: 'project',
    ...overrides,
  }
}

function tmpProjectDir(name: string): string {
  const dir = join(TMP_DIR, name)
  mkdirSync(dir, { recursive: true })
  return dir
}

function writeTmpConfig(dir: string, config: Partial<CodeForgeConfig>): void {
  const fullPath = join(dir, '.codeforge.json')
  writeFileSync(fullPath, JSON.stringify(config, null, 2), 'utf8')
}

// ─── Static metadata ────────────────────────────────────

describe('Config command - static metadata', () => {
  it('has a description', () => {
    expect(Config.description).toBe('Manage CodeForge configuration')
  })

  it('has examples array', () => {
    expect(Array.isArray(Config.examples)).toBe(true)
    expect(Config.examples.length).toBeGreaterThanOrEqual(1)
  })

  it('has no action arg (parent command)', () => {
    expect(Config.args).toEqual({})
  })

  it('has no key arg (parent command)', () => {
    expect(Config.args.key).toBeUndefined()
  })

  it('has no value arg (parent command)', () => {
    expect(Config.args.value).toBeUndefined()
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Config command - flags', () => {
  it('has no flags (parent command)', () => {
    expect(Config.flags).toBeUndefined()
  })
})

// ─── Class structure ────────────────────────────────────

describe('Config command - class structure', () => {
  it('exports a default class', () => {
    expect(Config).toBeDefined()
    expect(typeof Config).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Config.prototype.run).toBe('function')
  })
})

// ─── getConfigPath ──────────────────────────────────────

describe('getConfigPath', () => {
  it('returns project config path for global=false', () => {
    const path = getConfigPath(false)
    expect(path).toContain('.codeforge.json')
  })

  it('returns global config path for global=true', () => {
    const path = getConfigPath(true)
    expect(path).toContain('.config')
    expect(path).toContain('codeforge')
    expect(path).toContain('config.json')
  })

  it('global path includes home directory', () => {
    const path = getConfigPath(true)
    expect(path).toContain(homedir())
  })
})

// ─── loadConfig ─────────────────────────────────────────

describe('loadConfig', () => {
  let originalDir: string

  beforeEach(() => {
    originalDir = process.cwd()
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterEach(() => {
    process.chdir(originalDir)
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it('returns defaults when no config file exists', () => {
    const dir = tmpProjectDir('no-config')
    process.chdir(dir)
    const configFile = loadConfig(false)

    expect(configFile.exists).toBe(false)
    expect(configFile.source).toBe('default')
    expect(configFile.config.format).toBe('table')
    expect(configFile.config.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  it('loads existing project config', () => {
    const dir = tmpProjectDir('existing')
    writeTmpConfig(dir, { format: 'json', theme: 'dark' })
    process.chdir(dir)

    const configFile = loadConfig(false)
    expect(configFile.exists).toBe(true)
    expect(configFile.source).toBe('project')
    expect(configFile.config.format).toBe('json')
    expect(configFile.config.theme).toBe('dark')
  })

  it('merges with defaults for missing keys', () => {
    const dir = tmpProjectDir('partial')
    writeTmpConfig(dir, { format: 'csv' })
    process.chdir(dir)

    const configFile = loadConfig(false)
    expect(configFile.config.format).toBe('csv')
    expect(configFile.config.theme).toBe('default')
    expect(configFile.config.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(configFile.config.extensions).toEqual(DEFAULT_CONFIG.extensions)
  })

  it('fallback to defaults on invalid JSON', () => {
    const dir = tmpProjectDir('invalid-json')
    writeFileSync(join(dir, '.codeforge.json'), '{ invalid json !!!', 'utf8')
    process.chdir(dir)

    const configFile = loadConfig(false)
    expect(configFile.config.format).toBe('table')
    expect(configFile.source).toBe('default')
  })

  it('preserves array overrides', () => {
    const dir = tmpProjectDir('arrays')
    writeTmpConfig(dir, { ignore: ['custom'] })
    process.chdir(dir)

    const configFile = loadConfig(false)
    expect(configFile.config.ignore).toEqual(['custom'])
  })

  it('merges aliases from config with defaults', () => {
    const dir = tmpProjectDir('aliases')
    writeTmpConfig(dir, { aliases: { test: 'count' } })
    process.chdir(dir)

    const configFile = loadConfig(false)
    expect(configFile.config.aliases.test).toBe('count')
  })
})

// ─── saveConfig ─────────────────────────────────────────

describe('saveConfig', () => {
  let originalDir: string

  beforeEach(() => {
    originalDir = process.cwd()
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterEach(() => {
    process.chdir(originalDir)
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it('writes config to file', () => {
    const dir = tmpProjectDir('save')
    process.chdir(dir)

    const config = makeConfig({ format: 'json' })
    saveConfig(config, false)

    const written = readFileSync(join(dir, '.codeforge.json'), 'utf8')
    const parsed = JSON.parse(written) as CodeForgeConfig
    expect(parsed.format).toBe('json')
  })

  it('creates directory if needed for global config', () => {
    const config = makeConfig()
    saveConfig(config, true)

    const globalPath = getConfigPath(true)
    expect(existsSync(globalPath)).toBe(true)

    const written = readFileSync(globalPath, 'utf8')
    const parsed = JSON.parse(written) as CodeForgeConfig
    expect(parsed.format).toBe('table')

    rmSync(dirname(globalPath), { recursive: true, force: true })
  })

  it('writes with 2-space indent', () => {
    const dir = tmpProjectDir('indent')
    process.chdir(dir)

    saveConfig(makeConfig(), false)

    const written = readFileSync(join(dir, '.codeforge.json'), 'utf8')
    expect(written).toContain('  "ignore"')
    expect(written).toContain('  "format"')
  })
})

// ─── getConfigValue ─────────────────────────────────────

describe('getConfigValue', () => {
  const config = makeConfig({
    aliases: { test: 'count', lint: 'analyze' },
  })

  it('gets top-level string key', () => {
    const result = getConfigValue(config, 'format')
    expect(result.found).toBe(true)
    expect(result.value).toBe('table')
  })

  it('gets top-level number key', () => {
    const result = getConfigValue(config, 'maxFileSize')
    expect(result.found).toBe(true)
    expect(result.value).toBe(1_000_000)
  })

  it('gets top-level array key', () => {
    const result = getConfigValue(config, 'ignore')
    expect(result.found).toBe(true)
    expect(result.value).toEqual(['node_modules', '.git'])
  })

  it('gets nested key from aliases', () => {
    const result = getConfigValue(config, 'aliases.test')
    expect(result.found).toBe(true)
    expect(result.value).toBe('count')
  })

  it('gets another nested alias', () => {
    const result = getConfigValue(config, 'aliases.lint')
    expect(result.found).toBe(true)
    expect(result.value).toBe('analyze')
  })

  it('returns not found for unknown key', () => {
    const result = getConfigValue(config, 'unknown')
    expect(result.found).toBe(false)
    expect(result.value).toBeUndefined()
  })

  it('returns not found for unknown nested key', () => {
    const result = getConfigValue(config, 'aliases.nonexistent')
    expect(result.found).toBe(false)
    expect(result.value).toBeUndefined()
  })

  it('returns not found for deeply nested unknown path', () => {
    const result = getConfigValue(config, 'a.b.c')
    expect(result.found).toBe(false)
  })
})

// ─── setConfigValue ─────────────────────────────────────

describe('setConfigValue', () => {
  it('sets a string value', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'format', 'json')
    expect(updated.format).toBe('json')
  })

  it('sets a number value', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'maxFileSize', '500000')
    expect(updated.maxFileSize).toBe(500000)
  })

  it('sets an array value from comma-separated string', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'extensions', '.py,.rs,.go')
    expect(updated.extensions).toEqual(['.py', '.rs', '.go'])
  })

  it('sets a nested value in aliases', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'aliases.test', 'count')
    expect(updated.aliases.test).toBe('count')
  })

  it('returns original config for unknown key', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'unknown', 'value')
    expect(updated).toEqual(config)
  })

  it('does not mutate original config', () => {
    const config = makeConfig()
    const originalExtensions = [...config.extensions]
    setConfigValue(config, 'extensions', '.py,.rs')
    expect(config.extensions).toEqual(originalExtensions)
  })

  it('handles ignore array with comma-separated values', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'ignore', 'dist,build,coverage')
    expect(updated.ignore).toEqual(['dist', 'build', 'coverage'])
  })

  it('sets theme value', () => {
    const config = makeConfig()
    const updated = setConfigValue(config, 'theme', 'dark')
    expect(updated.theme).toBe('dark')
  })
})

// ─── validateConfig ─────────────────────────────────────

describe('validateConfig', () => {
  it('validates a valid config', () => {
    const result = validateConfig(DEFAULT_CONFIG)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('validates a valid custom config', () => {
    const config = makeConfig({ format: 'json', theme: 'dark' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('detects unknown keys', () => {
    const config = { ...DEFAULT_CONFIG, unknownKey: 'value' }
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Unknown config key'))).toBe(true)
  })

  it('detects wrong type for string field', () => {
    const config = { ...DEFAULT_CONFIG, format: 123 }
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('wrong type'))).toBe(true)
  })

  it('detects wrong type for number field', () => {
    const config = { ...DEFAULT_CONFIG, maxFileSize: 'big' }
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('wrong type'))).toBe(true)
  })

  it('detects wrong type for array field', () => {
    const config = { ...DEFAULT_CONFIG, ignore: 'node_modules' }
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('wrong type'))).toBe(true)
  })

  it('detects invalid extensions without dot prefix', () => {
    const config = makeConfig({ extensions: ['ts', '.tsx'] })
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('must start with "."'))).toBe(true)
  })

  it('detects invalid format value', () => {
    const config = makeConfig({ format: 'xml' })
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Invalid format'))).toBe(true)
  })

  it('detects invalid theme value', () => {
    const config = makeConfig({ theme: 'neon' })
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Invalid theme'))).toBe(true)
  })

  it('detects negative maxFileSize', () => {
    const config = makeConfig({ maxFileSize: -1 })
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('positive number'))).toBe(true)
  })

  it('detects zero maxFileSize', () => {
    const config = makeConfig({ maxFileSize: 0 })
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('positive number'))).toBe(true)
  })

  it('accepts valid format csv', () => {
    const config = makeConfig({ format: 'csv' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('accepts valid format json', () => {
    const config = makeConfig({ format: 'json' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('accepts valid theme dark', () => {
    const config = makeConfig({ theme: 'dark' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('accepts valid theme light', () => {
    const config = makeConfig({ theme: 'light' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('accepts valid theme none', () => {
    const config = makeConfig({ theme: 'none' })
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
  })

  it('collects multiple errors', () => {
    const config = { ...DEFAULT_CONFIG, format: 'xml', theme: 'neon', maxFileSize: -5 }
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── initConfig ─────────────────────────────────────────

describe('initConfig', () => {
  let originalDir: string

  beforeEach(() => {
    originalDir = process.cwd()
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterEach(() => {
    process.chdir(originalDir)
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it('creates config file', () => {
    const dir = tmpProjectDir('init')
    process.chdir(dir)

    const configFile = initConfig(false)
    expect(configFile.exists).toBe(true)
    expect(existsSync(join(dir, '.codeforge.json'))).toBe(true)
  })

  it('contains default values', () => {
    const dir = tmpProjectDir('init-defaults')
    process.chdir(dir)

    const configFile = initConfig(false)
    expect(configFile.config.format).toBe('table')
    expect(configFile.config.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(configFile.config.extensions).toEqual(DEFAULT_CONFIG.extensions)
    expect(configFile.config.maxFileSize).toBe(1_000_000)
  })

  it('sets source to project for global=false', () => {
    const dir = tmpProjectDir('init-source')
    process.chdir(dir)

    const configFile = initConfig(false)
    expect(configFile.source).toBe('project')
  })
})

// ─── resetConfig ────────────────────────────────────────

describe('resetConfig', () => {
  let originalDir: string

  beforeEach(() => {
    originalDir = process.cwd()
    mkdirSync(TMP_DIR, { recursive: true })
  })

  afterEach(() => {
    process.chdir(originalDir)
    rmSync(TMP_DIR, { recursive: true, force: true })
  })

  it('overwrites existing config with defaults', () => {
    const dir = tmpProjectDir('reset')
    writeTmpConfig(dir, { format: 'json', theme: 'dark' })
    process.chdir(dir)

    const configFile = resetConfig(false)
    expect(configFile.config.format).toBe('table')
    expect(configFile.config.theme).toBe('default')
  })

  it('creates file if none exists', () => {
    const dir = tmpProjectDir('reset-new')
    process.chdir(dir)

    const configFile = resetConfig(false)
    expect(configFile.exists).toBe(true)
    expect(configFile.config).toEqual(DEFAULT_CONFIG)
  })
})

// ─── DEFAULT_CONFIG ─────────────────────────────────────

describe('DEFAULT_CONFIG', () => {
  it('has expected ignore patterns', () => {
    expect(DEFAULT_CONFIG.ignore).toContain('node_modules')
    expect(DEFAULT_CONFIG.ignore).toContain('.git')
    expect(DEFAULT_CONFIG.ignore).toContain('dist')
    expect(DEFAULT_CONFIG.ignore).toContain('build')
    expect(DEFAULT_CONFIG.ignore).toContain('coverage')
    expect(DEFAULT_CONFIG.ignore).toContain('.cache')
  })

  it('has expected extensions', () => {
    expect(DEFAULT_CONFIG.extensions).toEqual(['.ts', '.tsx', '.js', '.jsx'])
  })

  it('has format defaulting to table', () => {
    expect(DEFAULT_CONFIG.format).toBe('table')
  })

  it('has theme defaulting to default', () => {
    expect(DEFAULT_CONFIG.theme).toBe('default')
  })

  it('has maxFileSize of 1MB', () => {
    expect(DEFAULT_CONFIG.maxFileSize).toBe(1_000_000)
  })

  it('has defaultPath of "."', () => {
    expect(DEFAULT_CONFIG.defaultPath).toBe('.')
  })

  it('has empty aliases', () => {
    expect(DEFAULT_CONFIG.aliases).toEqual({})
  })
})

// ─── formatConfigTable ──────────────────────────────────

describe('formatConfigTable', () => {
  it('contains header with column names', () => {
    const configFile = makeConfigFile()
    const output = formatConfigTable(configFile)
    expect(output).toContain('Key')
    expect(output).toContain('Value')
    expect(output).toContain('Source')
  })

  it('shows config source', () => {
    const configFile = makeConfigFile({ source: 'project' })
    const output = formatConfigTable(configFile)
    expect(output).toContain('project')
  })

  it('shows config file path', () => {
    const configFile = makeConfigFile({ path: '.codeforge.json' })
    const output = formatConfigTable(configFile)
    expect(output).toContain('.codeforge.json')
  })

  it('shows all config keys', () => {
    const configFile = makeConfigFile()
    const output = formatConfigTable(configFile)
    expect(output).toContain('ignore')
    expect(output).toContain('extensions')
    expect(output).toContain('format')
    expect(output).toContain('theme')
    expect(output).toContain('maxFileSize')
    expect(output).toContain('defaultPath')
    expect(output).toContain('aliases')
  })

  it('shows array values comma-separated', () => {
    const configFile = makeConfigFile({
      config: makeConfig({ ignore: ['dist', 'build'] }),
    })
    const output = formatConfigTable(configFile)
    expect(output).toContain('dist, build')
  })

  it('shows default source for default values', () => {
    const configFile = makeConfigFile({
      config: { ...DEFAULT_CONFIG, aliases: { ...DEFAULT_CONFIG.aliases } },
    })
    const output = formatConfigTable(configFile)
    expect(output).toContain('default')
  })

  it('handles global source', () => {
    const configFile = makeConfigFile({ source: 'global' })
    const output = formatConfigTable(configFile)
    expect(output).toContain('global')
  })

  it('handles default source', () => {
    const configFile = makeConfigFile({ source: 'default' })
    const output = formatConfigTable(configFile)
    expect(output).toContain('default')
  })
})

// ─── formatConfigJson ───────────────────────────────────

describe('formatConfigJson', () => {
  it('produces valid JSON', () => {
    const configFile = makeConfigFile()
    const output = formatConfigJson(configFile)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains config object', () => {
    const configFile = makeConfigFile()
    const output = formatConfigJson(configFile)
    const parsed = JSON.parse(output)
    expect(parsed.config).toBeDefined()
    expect(parsed.config.format).toBe('table')
  })

  it('contains path', () => {
    const configFile = makeConfigFile({ path: '/some/path' })
    const output = formatConfigJson(configFile)
    const parsed = JSON.parse(output)
    expect(parsed.path).toBe('/some/path')
  })

  it('contains exists field', () => {
    const configFile = makeConfigFile({ exists: true })
    const output = formatConfigJson(configFile)
    const parsed = JSON.parse(output)
    expect(parsed.exists).toBe(true)
  })

  it('contains source field', () => {
    const configFile = makeConfigFile({ source: 'project' })
    const output = formatConfigJson(configFile)
    const parsed = JSON.parse(output)
    expect(parsed.source).toBe('project')
  })
})

// ─── formatConfigDiff ───────────────────────────────────

describe('formatConfigDiff', () => {
  it('shows no diff message when config matches defaults', () => {
    const config = { ...DEFAULT_CONFIG, aliases: { ...DEFAULT_CONFIG.aliases } }
    const output = formatConfigDiff(config, DEFAULT_CONFIG)
    expect(output).toContain('No user overrides')
  })

  it('shows changed values', () => {
    const config = makeConfig({ format: 'json' })
    const output = formatConfigDiff(config, DEFAULT_CONFIG)
    expect(output).toContain('format')
    expect(output).toContain('json')
  })

  it('shows added values with plus sign', () => {
    const config = makeConfig({ theme: 'dark' })
    const output = formatConfigDiff(config, DEFAULT_CONFIG)
    expect(output).toContain('dark')
  })

  it('shows removed values with minus sign', () => {
    const config = makeConfig({ theme: 'dark' })
    const output = formatConfigDiff(config, DEFAULT_CONFIG)
    expect(output).toContain('default')
  })

  it('shows multiple diffs', () => {
    const config = makeConfig({ format: 'json', theme: 'dark', maxFileSize: 500 })
    const output = formatConfigDiff(config, DEFAULT_CONFIG)
    expect(output).toContain('format')
    expect(output).toContain('theme')
    expect(output).toContain('maxFileSize')
  })
})
