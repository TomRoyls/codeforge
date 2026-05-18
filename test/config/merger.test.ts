import { describe, it, expect } from 'vitest'
import { mergeConfigs, mergeEnvConfig } from '../../src/config/merger.js'
import { DEFAULT_CONFIG } from '../../src/config/types.js'
import type { CodeForgeConfig } from '../../src/config/types.js'

// ─── mergeConfigs: CLI flags override file config ───

describe('mergeConfigs', () => {
  it('CLI files override file config files', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const cliFlags: Partial<CodeForgeConfig> = { files: ['lib/**/*.js'] }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.files).toEqual(['lib/**/*.js'])
  })

  it('CLI ignore overrides file config ignore', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['node_modules/**'] }
    const cliFlags: Partial<CodeForgeConfig> = { ignore: ['dist/**'] }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.ignore).toEqual(['dist/**'])
  })

  it('CLI rules override file config rules on conflict', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'max-complexity': 'error' } }
    const cliFlags: Partial<CodeForgeConfig> = { rules: { 'max-complexity': 'warning' } }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules['max-complexity']).toBe('warning')
  })

  // ─── File config used when no CLI flags ───

  it('uses file config files when CLI flags omitted', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const result = mergeConfigs(fileConfig, {})
    expect(result.files).toEqual(['src/**/*.ts'])
  })

  it('uses file config ignore when CLI flags omitted', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['vendor/**'] }
    const result = mergeConfigs(fileConfig, {})
    expect(result.ignore).toEqual(['vendor/**'])
  })

  it('uses file config rules when CLI flags omitted', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error' } }
    const result = mergeConfigs(fileConfig, {})
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  // ─── Defaults applied when both empty ───

  it('applies DEFAULT_CONFIG files when both empty', () => {
    const result = mergeConfigs({}, {})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
  })

  it('applies DEFAULT_CONFIG ignore when both empty', () => {
    const result = mergeConfigs({}, {})
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
  })

  it('returns empty rules when both empty', () => {
    const result = mergeConfigs({}, {})
    expect(result.rules).toEqual({})
  })

  // ─── Rules merge (file rules + CLI rules, CLI wins on conflict) ───

  it('merges file and CLI rules without overlap', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error', 'no-console': 'warning' } }
    const cliFlags: Partial<CodeForgeConfig> = { rules: { 'prefer-const': 'error' } }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'no-console': 'warning',
      'prefer-const': 'error',
    })
  })

  it('CLI rule wins on conflict over file rule', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error', 'max-params': 'warning' } }
    const cliFlags: Partial<CodeForgeConfig> = { rules: { 'no-eval': 'info' } }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules['no-eval']).toBe('info')
    expect(result.rules['max-params']).toBe('warning')
  })

  it('merges rules with array values (options)', () => {
    const fileConfig: CodeForgeConfig = {
      rules: { 'max-lines': ['error', { max: 500 }], 'no-eval': 'error' },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: { 'max-lines': ['warning', { max: 200 }], 'prefer-const': 'info' },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result.rules['max-lines']).toEqual(['warning', { max: 200 }])
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['prefer-const']).toBe('info')
  })

  // ─── Empty file config ───

  it('empty file config with CLI flags uses CLI flags', () => {
    const cliFlags: Partial<CodeForgeConfig> = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeConfigs({}, cliFlags)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  it('empty file config with no CLI flags uses defaults', () => {
    const result = mergeConfigs({})
    expect(result.files).toEqual(DEFAULT_CONFIG.files)
    expect(result.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(result.rules).toEqual({})
  })

  // ─── Empty CLI flags (default parameter) ───

  it('works with only file config argument (no CLI flags)', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['custom/**/*.ts'],
      ignore: ['build/**'],
      rules: { 'no-console': 'warning' },
    }
    const result = mergeConfigs(fileConfig)
    expect(result.files).toEqual(['custom/**/*.ts'])
    expect(result.ignore).toEqual(['build/**'])
    expect(result.rules).toEqual({ 'no-console': 'warning' })
  })

  // ─── Both configs have rules that don't overlap ───

  it('both configs have non-overlapping rules, all preserved', () => {
    const fileConfig: CodeForgeConfig = {
      rules: { 'no-eval': 'error', 'no-console': 'warning' },
    }
    const cliFlags: Partial<CodeForgeConfig> = {
      rules: { 'prefer-const': 'error', 'max-params': ['error', { max: 4 }] },
    }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(Object.keys(result.rules)).toHaveLength(4)
    expect(result.rules['no-eval']).toBe('error')
    expect(result.rules['no-console']).toBe('warning')
    expect(result.rules['prefer-const']).toBe('error')
    expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
  })

  // ─── CLI empty arrays override ───

  it('CLI empty files array overrides file config (not fallback)', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const result = mergeConfigs(fileConfig, { files: [] })
    expect(result.files).toEqual([])
  })

  it('CLI undefined files falls back to file config', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const result = mergeConfigs(fileConfig, { files: undefined })
    expect(result.files).toEqual(['src/**/*.ts'])
  })

  // ─── Return structure ───

  it('result always has files, ignore, rules keys', () => {
    const result = mergeConfigs({}, {})
    expect(Object.keys(result)).toEqual(['files', 'ignore', 'rules'])
  })

  it('result is a new object not referencing inputs', () => {
    const fileConfig: CodeForgeConfig = { files: ['a'] }
    const cliFlags: Partial<CodeForgeConfig> = { files: ['b'] }
    const result = mergeConfigs(fileConfig, cliFlags)
    expect(result).not.toBe(fileConfig)
    expect(result).not.toBe(cliFlags)
  })
})

// ─── mergeEnvConfig: Env config overrides file config ───

describe('mergeEnvConfig', () => {
  it('env config files override file config', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const envConfig: Partial<CodeForgeConfig> = { files: ['test/**/*.spec.ts'] }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.files).toEqual(['test/**/*.spec.ts'])
  })

  it('env config ignore overrides file config', () => {
    const fileConfig: CodeForgeConfig = { ignore: ['node_modules/**'] }
    const envConfig: Partial<CodeForgeConfig> = { ignore: ['coverage/**'] }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.ignore).toEqual(['coverage/**'])
  })

  // ─── File config used when no env config ───

  it('uses file config when env config is empty', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeEnvConfig(fileConfig, {})
    expect(result).toEqual(fileConfig)
  })

  it('uses file config when env config uses default parameter', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
    }
    const result = mergeEnvConfig(fileConfig)
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
  })

  // ─── Rules merge correctly ───

  it('env rules merge with file rules (different keys)', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error' } }
    const envConfig: Partial<CodeForgeConfig> = { rules: { 'prefer-const': 'warning' } }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'prefer-const': 'warning',
    })
  })

  it('env rules override file rules on conflict', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error' } }
    const envConfig: Partial<CodeForgeConfig> = { rules: { 'no-eval': 'warning' } }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.rules['no-eval']).toBe('warning')
  })

  it('env rules with options override file rules with options', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'max-params': ['error', { max: 3 }] } }
    const envConfig: Partial<CodeForgeConfig> = { rules: { 'max-params': ['warning', { max: 5 }] } }
    const result = mergeEnvConfig(fileConfig, envConfig)
    expect(result.rules['max-params']).toEqual(['warning', { max: 5 }])
  })

  it('empty env rules does not clear file rules', () => {
    const fileConfig: CodeForgeConfig = { rules: { 'no-eval': 'error' } }
    const result = mergeEnvConfig(fileConfig, { rules: {} })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  // ─── Empty env config returns file config as-is ───

  it('empty env config returns file config unchanged', () => {
    const fileConfig: CodeForgeConfig = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: { 'no-eval': 'error' },
    }
    const result = mergeEnvConfig(fileConfig, {})
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  // ─── No defaults applied (unlike mergeConfigs) ───

  it('does not apply DEFAULT_CONFIG files when both empty', () => {
    const result = mergeEnvConfig({}, {})
    expect(result.files).toBeUndefined()
  })

  it('does not apply DEFAULT_CONFIG ignore when both empty', () => {
    const result = mergeEnvConfig({}, {})
    expect(result.ignore).toBeUndefined()
  })

  it('does not apply DEFAULT_CONFIG when file has no files', () => {
    const result = mergeEnvConfig({ ignore: ['a'] }, {})
    expect(result.files).toBeUndefined()
  })

  it('does not apply DEFAULT_CONFIG when file has no ignore', () => {
    const result = mergeEnvConfig({ files: ['a'] }, {})
    expect(result.ignore).toBeUndefined()
  })

  it('env undefined files falls back to file config (not defaults)', () => {
    const fileConfig: CodeForgeConfig = { files: ['src/**/*.ts'] }
    const result = mergeEnvConfig(fileConfig, { files: undefined })
    expect(result.files).toEqual(['src/**/*.ts'])
  })

  // ─── Return structure ───

  it('result has files, ignore, rules keys', () => {
    const result = mergeEnvConfig({}, {})
    expect(Object.keys(result)).toEqual(['files', 'ignore', 'rules'])
  })

  it('result is not reference to file config', () => {
    const fileConfig: CodeForgeConfig = { files: ['a'] }
    const result = mergeEnvConfig(fileConfig, {})
    expect(result).not.toBe(fileConfig)
  })

  // ─── Difference from mergeConfigs ───

  it('mergeConfigs applies defaults, mergeEnvConfig does not', () => {
    const fileConfig: CodeForgeConfig = {}
    const withDefaults = mergeConfigs(fileConfig, {})
    const withoutDefaults = mergeEnvConfig(fileConfig, {})
    expect(withDefaults.files).toEqual(DEFAULT_CONFIG.files)
    expect(withDefaults.ignore).toEqual(DEFAULT_CONFIG.ignore)
    expect(withoutDefaults.files).toBeUndefined()
    expect(withoutDefaults.ignore).toBeUndefined()
  })
})
