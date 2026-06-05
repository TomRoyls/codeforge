import { describe, it, expect, vi } from 'vitest'
import { migrateESLintConfig, readESLintConfig, detectESLintConfig } from '../../src/core/migrators/eslint.js'
import type { MigrationResult } from '../../src/core/migrators/eslint.js'
import {
  convertTSLintSeverity,
  migrateTSLintConfig,
  readTSLintConfig,
  detectTSLintConfig,
} from '../../src/core/migrators/tslint.js'
import type { TSLintMigrationResult } from '../../src/core/migrators/tslint.js'
import {
  convertBiomeSeverity,
  migrateBiomeConfig,
  readBiomeConfig,
  detectBiomeConfig,
} from '../../src/core/migrators/biome.js'
import type { BiomeMigrationResult } from '../../src/core/migrators/biome.js'
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const TMP_DIR = join('/tmp', 'migrators-test-' + process.pid)

async function setupTmpDir() {
  await mkdir(TMP_DIR, { recursive: true })
}

async function cleanupTmpDir() {
  await rm(TMP_DIR, { recursive: true, force: true })
}

describe('ESLint Migrator', () => {
  describe('migrateESLintConfig', () => {
    it('returns empty rules and unmapped for empty config', () => {
      const result = migrateESLintConfig({})
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('eslint')
    })

    it('returns empty rules when rules is empty object', () => {
      const result = migrateESLintConfig({ rules: {} })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    it('maps a single known rule with numeric severity 2 (error)', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 2 } })
      expect(result.rules['no-eval']).toBe('error')
      expect(result.unmapped).toEqual([])
    })

    it('maps a single known rule with numeric severity 1 (warning)', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 1 } })
      expect(result.rules['no-eval']).toBe('warning')
    })

    it('skips disabled rules with numeric severity 0', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 0 } })
      expect(result.rules['no-eval']).toBeUndefined()
      expect(result.unmapped).toEqual([])
    })

    it('maps rule with string severity "error"', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 'error' } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps rule with string severity "warn"', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-const': 'warn' } })
      expect(result.rules['prefer-const']).toBe('warning')
    })

    it('maps rule with string severity "warning"', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-const': 'warning' } })
      expect(result.rules['prefer-const']).toBe('warning')
    })

    it('maps rule with string severity "2"', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': '2' } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps rule with string severity "1"', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-const': '1' } })
      expect(result.rules['prefer-const']).toBe('warning')
    })

    it('skips rule with string severity "off"', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 'off' } })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('skips rule with string severity "0"', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': '0' } })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('maps rule with array config [severity]', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': ['error'] } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps rule with array config [severity, options]', () => {
      const result = migrateESLintConfig({
        rules: { 'max-params': ['error', { max: 4 }] },
      })
      expect(result.rules['max-params']).toEqual(['error', { max: 4 }])
    })

    it('maps rule with array config [severity, options] warning level', () => {
      const result = migrateESLintConfig({
        rules: { 'max-lines': ['warn', { max: 300 }] },
      })
      expect(result.rules['max-lines']).toEqual(['warning', { max: 300 }])
    })

    it('does not include options when options object is empty', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': ['error', {}] },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('skips disabled rule with array config ["off"]', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': ['off'] } })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('reports unmapped rules', () => {
      const result = migrateESLintConfig({
        rules: { 'unknown-rule': 'error', 'another-unknown': 2 },
      })
      expect(result.unmapped).toContain('unknown-rule')
      expect(result.unmapped).toContain('another-unknown')
      expect(result.rules).toEqual({})
    })

    it('separates mapped and unmapped rules', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': 'error', 'totally-made-up': 2 },
      })
      expect(result.rules['no-eval']).toBe('error')
      expect(result.unmapped).toEqual(['totally-made-up'])
    })

    it('maps @typescript-eslint prefixed rules', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-explicit-any': 'error' },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    it('maps @typescript-eslint/no-unsafe-assignment', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-assignment': 2 },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    it('maps @typescript-eslint/no-unsafe-call', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-call': 'warn' },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('warning')
    })

    it('maps @typescript-eslint/no-unsafe-member-access', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-member-access': 'error' },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    it('maps @typescript-eslint/no-unsafe-return', () => {
      const result = migrateESLintConfig({
        rules: { '@typescript-eslint/no-unsafe-return': 2 },
      })
      expect(result.rules['no-unsafe-type-assertion']).toBe('error')
    })

    it('maps complexity rule', () => {
      const result = migrateESLintConfig({ rules: { complexity: 'error' } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    it('maps max-depth rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-depth': 'warn' } })
      expect(result.rules['max-depth']).toBe('warning')
    })

    it('maps max-lines rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-lines': 'error' } })
      expect(result.rules['max-lines']).toBe('error')
    })

    it('maps max-lines-per-function rule', () => {
      const result = migrateESLintConfig({
        rules: { 'max-lines-per-function': 'error' },
      })
      expect(result.rules['max-lines-per-function']).toBe('error')
    })

    it('maps max-params rule', () => {
      const result = migrateESLintConfig({ rules: { 'max-params': 'error' } })
      expect(result.rules['max-params']).toBe('error')
    })

    it('maps no-await-in-loop rule', () => {
      const result = migrateESLintConfig({ rules: { 'no-await-in-loop': 'error' } })
      expect(result.rules['no-await-in-loop']).toBe('error')
    })

    it('maps no-implied-eval to no-eval', () => {
      const result = migrateESLintConfig({ rules: { 'no-implied-eval': 2 } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps no-new-func to no-eval', () => {
      const result = migrateESLintConfig({ rules: { 'no-new-func': 2 } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps no-sync-in-async rule', () => {
      const result = migrateESLintConfig({ rules: { 'no-sync-in-async': 'error' } })
      expect(result.rules['no-sync-in-async']).toBe('error')
    })

    it('maps prefer-object-spread rule', () => {
      const result = migrateESLintConfig({ rules: { 'prefer-object-spread': 'error' } })
      expect(result.rules['prefer-object-spread']).toBe('error')
    })

    it('maps prefer-optional-chaining to prefer-optional-chain', () => {
      const result = migrateESLintConfig({
        rules: { 'prefer-optional-chaining': 'error' },
      })
      expect(result.rules['prefer-optional-chain']).toBe('error')
    })

    it('merges rules from overrides', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': 'warn' },
        overrides: [{ rules: { 'prefer-const': 'error' } }],
      })
      expect(result.rules['no-eval']).toBe('warning')
      expect(result.rules['prefer-const']).toBe('error')
    })

    it('override rules take precedence over base rules', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': 'warn' },
        overrides: [{ rules: { 'no-eval': 'error' } }],
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('merges rules from multiple overrides', () => {
      const result = migrateESLintConfig({
        overrides: [
          { rules: { 'no-eval': 'error' } },
          { rules: { 'prefer-const': 'warn' } },
        ],
      })
      expect(result.rules['no-eval']).toBe('error')
      expect(result.rules['prefer-const']).toBe('warning')
    })

    it('handles overrides without rules', () => {
      const result = migrateESLintConfig({
        overrides: [{ }],
      })
      expect(result.rules).toEqual({})
    })

    it('handles null severity by skipping the rule', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': 'some-unknown-value' },
      })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('handles undefined rule config', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': undefined },
      })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('handles numeric severity 3 as null', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': 3 } })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('handles negative numeric severity', () => {
      const result = migrateESLintConfig({ rules: { 'no-eval': -1 } })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('handles array config with non-object second element', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': ['error', 'string-not-object'] },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('handles single-element array config', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': [2] },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps multiple rules simultaneously', () => {
      const result = migrateESLintConfig({
        rules: {
          'no-eval': 2,
          'prefer-const': 'error',
          'max-params': ['warn', { max: 5 }],
          'unknown-rule': 'error',
        },
      })
      expect(result.rules['no-eval']).toBe('error')
      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['max-params']).toEqual(['warning', { max: 5 }])
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    it('source is always eslint', () => {
      const result = migrateESLintConfig({})
      expect(result.source).toBe('eslint')
    })

    it('later override overwrites earlier override for same rule', () => {
      const result = migrateESLintConfig({
        overrides: [
          { rules: { 'no-eval': 'error' } },
          { rules: { 'no-eval': 'off' } },
        ],
      })
      expect(result.rules['no-eval']).toBeUndefined()
    })

    it('handles array config with nested array as first element', () => {
      const result = migrateESLintConfig({
        rules: { 'no-eval': [['error']] },
      })
      expect(result.rules['no-eval']).toBe('error')
    })
  })

  describe('readESLintConfig', () => {
    it('reads and parses JSON config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.json')
      await writeFile(configPath, JSON.stringify({ rules: { 'no-eval': 2 } }))
      const config = await readESLintConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.rules).toEqual({ 'no-eval': 2 })
      await cleanupTmpDir()
    })

    it('returns null for JS config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.js')
      await writeFile(configPath, 'module.exports = { rules: {} }')
      const config = await readESLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('returns null for CJS config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.cjs')
      await writeFile(configPath, 'module.exports = { rules: {} }')
      const config = await readESLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('returns null for MJS config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.mjs')
      await writeFile(configPath, 'export default { rules: {} }')
      const config = await readESLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('returns null for non-existent file', async () => {
      const config = await readESLintConfig('/tmp/does-not-exist-test-' + Date.now())
      expect(config).toBeNull()
    })

    it('parses YAML config returning config object', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.yaml')
      await writeFile(configPath, 'rules:\n  no-eval: 2\n  prefer-const: error\n')
      const config = await readESLintConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.rules).toBeDefined()
      await cleanupTmpDir()
    })

    it('parses YML config returning config object', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.yml')
      await writeFile(configPath, 'rules:\n  no-eval: error\n')
      const config = await readESLintConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.rules).toBeDefined()
      await cleanupTmpDir()
    })

    it('returns null for invalid JSON', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'bad.json')
      await writeFile(configPath, 'not valid json{')
      const config = await readESLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('returns null for file with unknown extension', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'config.toml')
      await writeFile(configPath, 'content = "test"')
      const config = await readESLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('handles JSON config with overrides', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, '.eslintrc.json')
      await writeFile(
        configPath,
        JSON.stringify({
          rules: { 'no-eval': 1 },
          overrides: [{ rules: { 'prefer-const': 2 } }],
        }),
      )
      const config = await readESLintConfig(configPath)
      expect(config!.rules).toEqual({ 'no-eval': 1 })
      expect(config!.overrides).toEqual([{ rules: { 'prefer-const': 2 } }])
      await cleanupTmpDir()
    })
  })

  describe('detectESLintConfig', () => {
    it('detects .eslintrc.json', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, '.eslintrc.json'), '{}')
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, '.eslintrc.json'))
      await cleanupTmpDir()
    })

    it('detects .eslintrc.js', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, '.eslintrc.js'), '')
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, '.eslintrc.js'))
      await cleanupTmpDir()
    })

    it('detects .eslintrc.yaml', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, '.eslintrc.yaml'), '')
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, '.eslintrc.yaml'))
      await cleanupTmpDir()
    })

    it('prefers .eslintrc.json over .eslintrc.js', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, '.eslintrc.json'), '{}')
      await writeFile(join(TMP_DIR, '.eslintrc.js'), '')
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, '.eslintrc.json'))
      await cleanupTmpDir()
    })

    it('returns null when no config found', async () => {
      await setupTmpDir()
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBeNull()
      await cleanupTmpDir()
    })

    it('detects package.json with eslintConfig', async () => {
      await setupTmpDir()
      await writeFile(
        join(TMP_DIR, 'package.json'),
        JSON.stringify({ eslintConfig: { rules: {} } }),
      )
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, 'package.json'))
      await cleanupTmpDir()
    })

    it('does not detect package.json without eslintConfig', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, 'package.json'), JSON.stringify({ name: 'test' }))
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBeNull()
      await cleanupTmpDir()
    })

    it('detects .eslintrc (no extension)', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, '.eslintrc'), '{}')
      const detected = await detectESLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, '.eslintrc'))
      await cleanupTmpDir()
    })
  })
})

describe('TSLint Migrator', () => {
  describe('convertTSLintSeverity', () => {
    it('returns error for true', () => {
      expect(convertTSLintSeverity(true)).toBe('error')
    })

    it('returns null for false', () => {
      expect(convertTSLintSeverity(false)).toBeNull()
    })

    it('returns error for "error"', () => {
      expect(convertTSLintSeverity('error')).toBe('error')
    })

    it('returns warning for "warning"', () => {
      expect(convertTSLintSeverity('warning')).toBe('warning')
    })

    it('returns warning for "warn"', () => {
      expect(convertTSLintSeverity('warn')).toBe('warning')
    })

    it('returns null for "off"', () => {
      expect(convertTSLintSeverity('off')).toBeNull()
    })

    it('returns null for unknown string', () => {
      expect(convertTSLintSeverity('something')).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(convertTSLintSeverity(undefined)).toBeNull()
    })

    it('returns null for number', () => {
      expect(convertTSLintSeverity(42)).toBeNull()
    })

    it('handles array with boolean true', () => {
      expect(convertTSLintSeverity([true])).toBe('error')
    })

    it('handles array with boolean false', () => {
      expect(convertTSLintSeverity([false])).toBeNull()
    })

    it('handles array with string severity', () => {
      expect(convertTSLintSeverity(['error'])).toBe('error')
    })

    it('handles array with "warn"', () => {
      expect(convertTSLintSeverity(['warn'])).toBe('warning')
    })

    it('returns null for empty array', () => {
      expect(convertTSLintSeverity([])).toBeNull()
    })

    it('handles nested array', () => {
      expect(convertTSLintSeverity([['error']])).toBe('error')
    })

    it('returns null for array with number', () => {
      expect(convertTSLintSeverity([1])).toBeNull()
    })
  })

  describe('migrateTSLintConfig', () => {
    it('returns empty result for empty config', () => {
      const result = migrateTSLintConfig({})
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('tslint')
    })

    it('returns empty result for config with no rules', () => {
      const result = migrateTSLintConfig({ rulesDirectory: ['node_modules/tslint-microsoft-contrib'] })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    it('maps curly rule', () => {
      const result = migrateTSLintConfig({ rules: { curly: true } })
      expect(result.rules['curly']).toBe('error')
    })

    it('maps cyclomatic-complexity to max-complexity', () => {
      const result = migrateTSLintConfig({ rules: { 'cyclomatic-complexity': true } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    it('maps max-file-line-count to max-lines', () => {
      const result = migrateTSLintConfig({ rules: { 'max-file-line-count': true } })
      expect(result.rules['max-lines']).toBe('error')
    })

    it('maps max-line-length to max-lines', () => {
      const result = migrateTSLintConfig({ rules: { 'max-line-length': true } })
      expect(result.rules['max-lines']).toBe('error')
    })

    it('maps member-access to explicit-module-boundary-types', () => {
      const result = migrateTSLintConfig({ rules: { 'member-access': true } })
      expect(result.rules['explicit-module-boundary-types']).toBe('error')
    })

    it('maps no-angle-bracket-type-assertion to no-unnecessary-type-assertion', () => {
      const result = migrateTSLintConfig({ rules: { 'no-angle-bracket-type-assertion': true } })
      expect(result.rules['no-unnecessary-type-assertion']).toBe('error')
    })

    it('maps no-any to no-explicit-any', () => {
      const result = migrateTSLintConfig({ rules: { 'no-any': true } })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('maps no-console to no-console', () => {
      const result = migrateTSLintConfig({ rules: { 'no-console': true } })
      expect(result.rules['no-console']).toBe('error')
    })

    it('maps no-debugger to no-debugger', () => {
      const result = migrateTSLintConfig({ rules: { 'no-debugger': true } })
      expect(result.rules['no-debugger']).toBe('error')
    })

    it('maps no-empty to no-empty', () => {
      const result = migrateTSLintConfig({ rules: { 'no-empty': true } })
      expect(result.rules['no-empty']).toBe('error')
    })

    it('maps no-eval to no-eval', () => {
      const result = migrateTSLintConfig({ rules: { 'no-eval': true } })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps no-inferrable-types to no-inferrable-types', () => {
      const result = migrateTSLintConfig({ rules: { 'no-inferrable-types': true } })
      expect(result.rules['no-inferrable-types']).toBe('error')
    })

    it('maps no-internal-module to no-namespace', () => {
      const result = migrateTSLintConfig({ rules: { 'no-internal-module': true } })
      expect(result.rules['no-namespace']).toBe('error')
    })

    it('maps no-magic-numbers to no-magic-numbers', () => {
      const result = migrateTSLintConfig({ rules: { 'no-magic-numbers': true } })
      expect(result.rules['no-magic-numbers']).toBe('error')
    })

    it('maps no-namespace to no-namespace', () => {
      const result = migrateTSLintConfig({ rules: { 'no-namespace': true } })
      expect(result.rules['no-namespace']).toBe('error')
    })

    it('maps no-require-imports to no-require-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'no-require-imports': true } })
      expect(result.rules['no-require-imports']).toBe('error')
    })

    it('maps no-shadowed-variable to no-shadow', () => {
      const result = migrateTSLintConfig({ rules: { 'no-shadowed-variable': true } })
      expect(result.rules['no-shadow']).toBe('error')
    })

    it('maps no-string-throw to no-throw-literal', () => {
      const result = migrateTSLintConfig({ rules: { 'no-string-throw': true } })
      expect(result.rules['no-throw-literal']).toBe('error')
    })

    it('maps no-unnecessary-initializer to no-unnecessary-initialization', () => {
      const result = migrateTSLintConfig({ rules: { 'no-unnecessary-initializer': true } })
      expect(result.rules['no-unnecessary-initialization']).toBe('error')
    })

    it('maps no-use-before-declare to no-invalid-use-before-def', () => {
      const result = migrateTSLintConfig({ rules: { 'no-use-before-declare': true } })
      expect(result.rules['no-invalid-use-before-def']).toBe('error')
    })

    it('maps no-var-keyword to prefer-const', () => {
      const result = migrateTSLintConfig({ rules: { 'no-var-keyword': true } })
      expect(result.rules['prefer-const']).toBe('error')
    })

    it('maps no-var-requires to no-cjs-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'no-var-requires': true } })
      expect(result.rules['no-cjs-imports']).toBe('error')
    })

    it('maps only-arrow-functions to prefer-arrow-callback', () => {
      const result = migrateTSLintConfig({ rules: { 'only-arrow-functions': true } })
      expect(result.rules['prefer-arrow-callback']).toBe('error')
    })

    it('maps ordered-imports to consistent-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'ordered-imports': true } })
      expect(result.rules['consistent-imports']).toBe('error')
    })

    it('maps prefer-const to prefer-const', () => {
      const result = migrateTSLintConfig({ rules: { 'prefer-const': true } })
      expect(result.rules['prefer-const']).toBe('error')
    })

    it('maps prefer-for-of to prefer-for-of', () => {
      const result = migrateTSLintConfig({ rules: { 'prefer-for-of': true } })
      expect(result.rules['prefer-for-of']).toBe('error')
    })

    it('maps triple-equals to eq-eq-eq', () => {
      const result = migrateTSLintConfig({ rules: { 'triple-equals': true } })
      expect(result.rules['eq-eq-eq']).toBe('error')
    })

    it('maps typedef to explicit-return-type', () => {
      const result = migrateTSLintConfig({ rules: { typedef: true } })
      expect(result.rules['explicit-return-type']).toBe('error')
    })

    it('maps ban-ts-ignore to no-explicit-any', () => {
      const result = migrateTSLintConfig({ rules: { 'ban-ts-ignore': true } })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('maps class-name to strict-boolean-expressions', () => {
      const result = migrateTSLintConfig({ rules: { 'class-name': true } })
      expect(result.rules['strict-boolean-expressions']).toBe('error')
    })

    it('maps array-type to prefer-array-find', () => {
      const result = migrateTSLintConfig({ rules: { 'array-type': true } })
      expect(result.rules['prefer-array-find']).toBe('error')
    })

    it('skips disabled rules (false)', () => {
      const result = migrateTSLintConfig({ rules: { curly: false } })
      expect(result.rules['curly']).toBeUndefined()
    })

    it('reports unmapped rules', () => {
      const result = migrateTSLintConfig({
        rules: { 'made-up-rule': true, 'another-fake': 'error' },
      })
      expect(result.unmapped).toContain('made-up-rule')
      expect(result.unmapped).toContain('another-fake')
    })

    it('handles rule with options array', () => {
      const result = migrateTSLintConfig({
        rules: { 'cyclomatic-complexity': [true, { maxComplexity: 10 }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { maxComplexity: 10 }])
    })

    it('skips options when options is not an object', () => {
      const result = migrateTSLintConfig({
        rules: { curly: [true, 'not-an-object'] },
      })
      expect(result.rules['curly']).toBe('error')
    })

    it('handles rule with array options where second element is null', () => {
      const result = migrateTSLintConfig({
        rules: { curly: [true, null] },
      })
      expect(result.rules['curly']).toBe('error')
    })

    it('handles rule with empty options object', () => {
      const result = migrateTSLintConfig({
        rules: { curly: [true, {}] },
      })
      expect(result.rules['curly']).toBe('error')
    })

    it('skips rules with off severity', () => {
      const result = migrateTSLintConfig({ rules: { curly: 'off' } })
      expect(result.rules['curly']).toBeUndefined()
    })

    it('handles string severity "warning"', () => {
      const result = migrateTSLintConfig({ rules: { curly: 'warning' } })
      expect(result.rules['curly']).toBe('warning')
    })

    it('handles string severity "warn"', () => {
      const result = migrateTSLintConfig({ rules: { curly: 'warn' } })
      expect(result.rules['curly']).toBe('warning')
    })

    it('source is always tslint', () => {
      const result = migrateTSLintConfig({})
      expect(result.source).toBe('tslint')
    })

    it('maps multiple rules with mixed configs', () => {
      const result = migrateTSLintConfig({
        rules: {
          curly: true,
          'no-console': 'warning',
          'no-debugger': [true],
          'unknown-rule': true,
        },
      })
      expect(result.rules['curly']).toBe('error')
      expect(result.rules['no-console']).toBe('warning')
      expect(result.rules['no-debugger']).toBe('error')
      expect(result.unmapped).toEqual(['unknown-rule'])
    })

    it('skips rules with null severity from unknown types', () => {
      const result = migrateTSLintConfig({ rules: { curly: 42 } })
      expect(result.rules['curly']).toBeUndefined()
    })
  })

  describe('readTSLintConfig', () => {
    it('reads and parses valid JSON config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'tslint.json')
      await writeFile(configPath, JSON.stringify({ rules: { curly: true } }))
      const config = await readTSLintConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.rules).toEqual({ curly: true })
      await cleanupTmpDir()
    })

    it('returns null for non-existent file', async () => {
      const config = await readTSLintConfig('/tmp/nope-tslint-' + Date.now())
      expect(config).toBeNull()
    })

    it('returns null for invalid JSON', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'bad-tslint.json')
      await writeFile(configPath, '{ broken json')
      const config = await readTSLintConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('reads config with rulesDirectory', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'tslint.json')
      await writeFile(
        configPath,
        JSON.stringify({
          rulesDirectory: ['custom-rules'],
          rules: { curly: true },
        }),
      )
      const config = await readTSLintConfig(configPath)
      expect(config!.rulesDirectory).toEqual(['custom-rules'])
      await cleanupTmpDir()
    })
  })

  describe('detectTSLintConfig', () => {
    it('detects tslint.json', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, 'tslint.json'), '{}')
      const detected = await detectTSLintConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, 'tslint.json'))
      await cleanupTmpDir()
    })

    it('returns null when no tslint.json exists', async () => {
      await setupTmpDir()
      const detected = await detectTSLintConfig(TMP_DIR)
      expect(detected).toBeNull()
      await cleanupTmpDir()
    })
  })
})

describe('Biome Migrator', () => {
  describe('convertBiomeSeverity', () => {
    it('returns error for "error"', () => {
      expect(convertBiomeSeverity('error')).toBe('error')
    })

    it('returns warning for "warn"', () => {
      expect(convertBiomeSeverity('warn')).toBe('warning')
    })

    it('returns warning for "warning"', () => {
      expect(convertBiomeSeverity('warning')).toBe('warning')
    })

    it('returns info for "info"', () => {
      expect(convertBiomeSeverity('info')).toBe('info')
    })

    it('returns null for "off"', () => {
      expect(convertBiomeSeverity('off')).toBeNull()
    })

    it('returns null for unknown string', () => {
      expect(convertBiomeSeverity('something')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(convertBiomeSeverity('')).toBeNull()
    })
  })

  describe('migrateBiomeConfig', () => {
    it('returns empty result for empty config', () => {
      const result = migrateBiomeConfig({})
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('biome')
    })

    it('returns empty result when linter is undefined', () => {
      const result = migrateBiomeConfig({})
      expect(result.rules).toEqual({})
    })

    it('returns empty result when linter has no rules', () => {
      const result = migrateBiomeConfig({ linter: {} })
      expect(result.rules).toEqual({})
    })

    it('maps a rule with string severity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noExplicitAny: 'error' } } },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('maps a rule with warn severity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noDebugger: 'warn' } } },
      })
      expect(result.rules['no-debugger']).toBe('warning')
    })

    it('skips rules with off severity', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noExplicitAny: 'off' } } },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('maps a rule with object config containing level', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            complexity: { noExcessiveCognitiveComplexity: { level: 'error' } },
          },
        },
      })
      expect(result.rules['max-complexity']).toBe('error')
    })

    it('maps a rule with object config containing level and options', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            complexity: {
              noExcessiveCognitiveComplexity: {
                level: 'error',
                options: { maxComplexity: 15 },
              },
            },
          },
        },
      })
      expect(result.rules['max-complexity']).toEqual([
        'error',
        { maxComplexity: 15 },
      ])
    })

    it('maps a rule with flat key (category/rule)', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'suspicious/noExplicitAny': 'error' } },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('maps a rule with array config', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noDebugger: ['error'] } } },
      })
      expect(result.rules['no-debugger']).toBe('error')
    })

    it('skips array config with non-string first element', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noDebugger: [2] } } },
      })
      expect(result.rules['no-debugger']).toBeUndefined()
    })

    it('skips empty array config', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noDebugger: [] } } },
      })
      expect(result.rules['no-debugger']).toBeUndefined()
    })

    it('skips boolean rule config', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noExplicitAny: true } } },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('skips null rule config', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noExplicitAny: null } } },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('skips number rule config', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noExplicitAny: 2 } } },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('reports unmapped rules', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { custom: { unknownRule: 'error' } } },
      })
      expect(result.unmapped).toContain('custom/unknownRule')
    })

    it('maps multiple rules across categories', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            suspicious: { noExplicitAny: 'error', noDebugger: 'warn' },
            style: { useConst: 'error' },
          },
        },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
      expect(result.rules['no-debugger']).toBe('warning')
      expect(result.rules['prefer-const']).toBe('error')
    })

    it('maps complexity/noBannedImports to no-restricted-imports', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { complexity: { noBannedImports: 'error' } } },
      })
      expect(result.rules['no-restricted-imports']).toBe('error')
    })

    it('maps complexity/noExtraBooleanCast to no-unnecessary-boolean', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { complexity: { noExtraBooleanCast: 'error' } } },
      })
      expect(result.rules['no-unnecessary-boolean']).toBe('error')
    })

    it('maps complexity/noForEach to no-array-reduce', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { complexity: { noForEach: 'error' } } },
      })
      expect(result.rules['no-array-reduce']).toBe('error')
    })

    it('maps complexity/noStaticOnlyClass to no-unnecessary-class', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { complexity: { noStaticOnlyClass: 'error' } } },
      })
      expect(result.rules['no-unnecessary-class']).toBe('error')
    })

    it('maps complexity/useFlatMap to prefer-flat-map', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { complexity: { useFlatMap: 'error' } } },
      })
      expect(result.rules['prefer-flat-map']).toBe('error')
    })

    it('maps correctness/noConstAssign to no-const-assign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { correctness: { noConstAssign: 'error' } } },
      })
      expect(result.rules['no-const-assign']).toBe('error')
    })

    it('maps performance/noDelete to no-dynamic-delete', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { performance: { noDelete: 'error' } } },
      })
      expect(result.rules['no-dynamic-delete']).toBe('error')
    })

    it('maps security/noGlobalEval to no-eval', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { security: { noGlobalEval: 'error' } } },
      })
      expect(result.rules['no-eval']).toBe('error')
    })

    it('maps style/noNamespace to no-namespace', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { style: { noNamespace: 'error' } } },
      })
      expect(result.rules['no-namespace']).toBe('error')
    })

    it('maps suspicious/noDoubleEquals to eq-eq-eq', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noDoubleEquals: 'error' } } },
      })
      expect(result.rules['eq-eq-eq']).toBe('error')
    })

    it('maps suspicious/noConsoleLog to no-console', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noConsoleLog: 'error' } } },
      })
      expect(result.rules['no-console']).toBe('error')
    })

    it('source is always biome', () => {
      const result = migrateBiomeConfig({})
      expect(result.source).toBe('biome')
    })

    it('handles object config without level gracefully', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            suspicious: { noExplicitAny: { options: { foo: 'bar' } } },
          },
        },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('handles object config with non-string level', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            suspicious: { noExplicitAny: { level: 2 } },
          },
        },
      })
      expect(result.rules['no-explicit-any']).toBeUndefined()
    })

    it('handles object config with array options (ignores them)', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            suspicious: { noExplicitAny: { level: 'error', options: [1, 2] } },
          },
        },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('does not include empty options', () => {
      const result = migrateBiomeConfig({
        linter: {
          rules: {
            suspicious: { noExplicitAny: { level: 'error', options: {} } },
          },
        },
      })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    it('maps performance/noBarrelFile to no-barrel-imports', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { performance: { noBarrelFile: 'error' } } },
      })
      expect(result.rules['no-barrel-imports']).toBe('error')
    })

    it('maps performance/noReExportAll to no-barrel-imports', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { performance: { noReExportAll: 'error' } } },
      })
      expect(result.rules['no-barrel-imports']).toBe('error')
    })

    it('maps nursery/noAccidentalInfiniteLoops to no-approximate-constants', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { nursery: { noAccidentalInfiniteLoops: 'error' } } },
      })
      expect(result.rules['no-approximate-constants']).toBe('error')
    })

    it('maps suspicious/noApproximativeNumericConstant to no-approximate-constants', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noApproximativeNumericConstant: 'error' } } },
      })
      expect(result.rules['no-approximate-constants']).toBe('error')
    })

    it('maps style/noNamespaceImport to no-namespace', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { style: { noNamespaceImport: 'error' } } },
      })
      expect(result.rules['no-namespace']).toBe('error')
    })

    it('maps suspicious/useNamespaceKeyword to no-namespace', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { useNamespaceKeyword: 'error' } } },
      })
      expect(result.rules['no-namespace']).toBe('error')
    })

    it('handles flat key with unmapped rule', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { 'totally/fake': 'error' } },
      })
      expect(result.unmapped).toContain('totally/fake')
    })

    it('handles non-object value at top level of rules', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { someString: 'value' } },
      })
      expect(result.unmapped).toContain('someString')
    })

    it('maps suspicious/noAssignInExpressions to no-param-reassign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { suspicious: { noAssignInExpressions: 'error' } } },
      })
      expect(result.rules['no-param-reassign']).toBe('error')
    })

    it('maps style/noParameterAssign to no-param-reassign', () => {
      const result = migrateBiomeConfig({
        linter: { rules: { style: { noParameterAssign: 'error' } } },
      })
      expect(result.rules['no-param-reassign']).toBe('error')
    })
  })

  describe('readBiomeConfig', () => {
    it('reads and parses valid JSON config', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'biome.json')
      await writeFile(
        configPath,
        JSON.stringify({ linter: { rules: { suspicious: { noExplicitAny: 'error' } } } }),
      )
      const config = await readBiomeConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.linter!.rules).toEqual({ suspicious: { noExplicitAny: 'error' } })
      await cleanupTmpDir()
    })

    it('returns null for non-existent file', async () => {
      const config = await readBiomeConfig('/tmp/nope-biome-' + Date.now())
      expect(config).toBeNull()
    })

    it('returns null for invalid JSON', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'bad-biome.json')
      await writeFile(configPath, 'not valid{json')
      const config = await readBiomeConfig(configPath)
      expect(config).toBeNull()
      await cleanupTmpDir()
    })

    it('reads config without linter section', async () => {
      await setupTmpDir()
      const configPath = join(TMP_DIR, 'biome.json')
      await writeFile(configPath, JSON.stringify({ formatter: { lineWidth: 80 } }))
      const config = await readBiomeConfig(configPath)
      expect(config).not.toBeNull()
      expect(config!.linter).toBeUndefined()
      await cleanupTmpDir()
    })
  })

  describe('detectBiomeConfig', () => {
    it('detects biome.json', async () => {
      await setupTmpDir()
      await writeFile(join(TMP_DIR, 'biome.json'), '{}')
      const detected = await detectBiomeConfig(TMP_DIR)
      expect(detected).toBe(join(TMP_DIR, 'biome.json'))
      await cleanupTmpDir()
    })

    it('returns null when no biome.json exists', async () => {
      await setupTmpDir()
      const detected = await detectBiomeConfig(TMP_DIR)
      expect(detected).toBeNull()
      await cleanupTmpDir()
    })
  })
})

describe('Cross-migrator integration', () => {
  it('ESLint and Biome both map to no-eval', () => {
    const eslintResult = migrateESLintConfig({ rules: { 'no-eval': 'error' } })
    const biomeResult = migrateBiomeConfig({
      linter: { rules: { security: { noGlobalEval: 'error' } } },
    })
    expect(eslintResult.rules['no-eval']).toBe('error')
    expect(biomeResult.rules['no-eval']).toBe('error')
  })

  it('TSLint and Biome both map to no-namespace', () => {
    const tslintResult = migrateTSLintConfig({ rules: { 'no-namespace': true } })
    const biomeResult = migrateBiomeConfig({
      linter: { rules: { style: { noNamespace: 'error' } } },
    })
    expect(tslintResult.rules['no-namespace']).toBe('error')
    expect(biomeResult.rules['no-namespace']).toBe('error')
  })

  it('ESLint and TSLint both map to prefer-const', () => {
    const eslintResult = migrateESLintConfig({ rules: { 'prefer-const': 'error' } })
    const tslintResult = migrateTSLintConfig({ rules: { 'prefer-const': true } })
    expect(eslintResult.rules['prefer-const']).toBe('error')
    expect(tslintResult.rules['prefer-const']).toBe('error')
  })

  it('ESLint and Biome both map to eq-eq-eq', () => {
    const biomeResult = migrateBiomeConfig({
      linter: { rules: { suspicious: { noDoubleEquals: 'error' } } },
    })
    expect(biomeResult.rules['eq-eq-eq']).toBe('error')
  })

  it('all migrators return correct source type', () => {
    expect(migrateESLintConfig({}).source).toBe('eslint')
    expect(migrateTSLintConfig({}).source).toBe('tslint')
    expect(migrateBiomeConfig({}).source).toBe('biome')
  })

  it('all migrators handle empty config gracefully', () => {
    const eslintResult = migrateESLintConfig({})
    const tslintResult = migrateTSLintConfig({})
    const biomeResult = migrateBiomeConfig({})

    expect(eslintResult.rules).toEqual({})
    expect(eslintResult.unmapped).toEqual([])
    expect(tslintResult.rules).toEqual({})
    expect(tslintResult.unmapped).toEqual([])
    expect(biomeResult.rules).toEqual({})
    expect(biomeResult.unmapped).toEqual([])
  })
})

describe('Edge cases and stress tests', () => {
  it('handles ESLint config with many rules', () => {
    const rules: Record<string, unknown> = {}
    const knownRules = [
      'no-eval',
      'prefer-const',
      'max-params',
      'max-lines',
      'max-depth',
      'complexity',
      'no-await-in-loop',
      'prefer-object-spread',
    ]
    for (const rule of knownRules) {
      rules[rule] = 'error'
    }
    for (let i = 0; i < 50; i++) {
      rules[`fake-rule-${i}`] = 'error'
    }
    const result = migrateESLintConfig({ rules })
    expect(Object.keys(result.rules)).toHaveLength(knownRules.length)
    expect(result.unmapped).toHaveLength(50)
  })

  it('handles TSLint config with many rules', () => {
    const rules: Record<string, unknown> = {}
    for (let i = 0; i < 100; i++) {
      rules[`unknown-${i}`] = true
    }
    const result = migrateTSLintConfig({ rules })
    expect(result.rules).toEqual({})
    expect(result.unmapped).toHaveLength(100)
  })

  it('handles Biome config with many categories', () => {
    const rules: Record<string, unknown> = {}
    for (let i = 0; i < 50; i++) {
      rules[`customCategory${i}`] = { ruleA: 'error', ruleB: 'warn' }
    }
    const result = migrateBiomeConfig({ linter: { rules } })
    expect(result.unmapped.length).toBe(100)
  })

  it('handles deeply nested array severity in ESLint', () => {
    const result = migrateESLintConfig({ rules: { 'no-eval': [[[2]]] } })
    expect(result.rules['no-eval']).toBe('error')
  })

  it('handles deeply nested array severity in TSLint', () => {
    const result = migrateTSLintConfig({ rules: { curly: [[[true]]] } })
    expect(result.rules['curly']).toBe('error')
  })

  it('migrateESLintConfig with all known rules mapped', () => {
    const result = migrateESLintConfig({
      rules: {
        '@typescript-eslint/no-explicit-any': 2,
        '@typescript-eslint/no-unsafe-assignment': 2,
        '@typescript-eslint/no-unsafe-call': 1,
        '@typescript-eslint/no-unsafe-member-access': 2,
        '@typescript-eslint/no-unsafe-return': 2,
        complexity: 2,
        'max-depth': 1,
        'max-lines': 2,
        'max-lines-per-function': 2,
        'max-params': ['error', { max: 4 }],
        'no-await-in-loop': 2,
        'no-eval': 2,
        'no-implied-eval': 2,
        'no-new-func': 2,
        'no-sync-in-async': 2,
        'prefer-const': 2,
        'prefer-object-spread': 2,
        'prefer-optional-chaining': 2,
      },
    })
    expect(Object.keys(result.rules)).toHaveLength(12)
    expect(result.unmapped).toEqual([])
  })

  it('detectESLintConfig does not throw on permission errors', async () => {
    const result = await detectESLintConfig('/proc/nonexistent-' + Date.now())
    expect(result).toBeNull()
  })

  it('detectTSLintConfig does not throw on permission errors', async () => {
    const result = await detectTSLintConfig('/proc/nonexistent-' + Date.now())
    expect(result).toBeNull()
  })

  it('detectBiomeConfig does not throw on permission errors', async () => {
    const result = await detectBiomeConfig('/proc/nonexistent-' + Date.now())
    expect(result).toBeNull()
  })

  it('readESLintConfig handles empty file gracefully', async () => {
    await setupTmpDir()
    const configPath = join(TMP_DIR, 'empty.json')
    await writeFile(configPath, '')
    const config = await readESLintConfig(configPath)
    expect(config).toBeNull()
    await cleanupTmpDir()
  })

  it('readTSLintConfig handles empty file gracefully', async () => {
    await setupTmpDir()
    const configPath = join(TMP_DIR, 'empty-tslint.json')
    await writeFile(configPath, '')
    const config = await readTSLintConfig(configPath)
    expect(config).toBeNull()
    await cleanupTmpDir()
  })

  it('readBiomeConfig handles empty file gracefully', async () => {
    await setupTmpDir()
    const configPath = join(TMP_DIR, 'empty-biome.json')
    await writeFile(configPath, '')
    const config = await readBiomeConfig(configPath)
    expect(config).toBeNull()
    await cleanupTmpDir()
  })
})
