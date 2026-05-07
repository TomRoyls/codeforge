import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateTSLintConfig,
  readTSLintConfig,
  detectTSLintConfig,
  convertTSLintSeverity,
  type TSLintMigrationResult,
} from '../../../../src/core/migrators/tslint.js'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('TSLint migrator', () => {
  describe('convertTSLintSeverity', () => {
    test('should convert boolean true to error', () => {
      expect(convertTSLintSeverity(true)).toBe('error')
    })

    test('should convert boolean false to null', () => {
      expect(convertTSLintSeverity(false)).toBeNull()
    })

    test('should convert string "error" to error', () => {
      expect(convertTSLintSeverity('error')).toBe('error')
    })

    test('should convert string "warning" to warning', () => {
      expect(convertTSLintSeverity('warning')).toBe('warning')
    })

    test('should convert string "warn" to warning', () => {
      expect(convertTSLintSeverity('warn')).toBe('warning')
    })

    test('should convert string "off" to null', () => {
      expect(convertTSLintSeverity('off')).toBeNull()
    })

    test('should return null for unknown string', () => {
      expect(convertTSLintSeverity('invalid')).toBeNull()
    })

    test('should return null for number', () => {
      expect(convertTSLintSeverity(2)).toBeNull()
    })

    test('should return null for null', () => {
      expect(convertTSLintSeverity(null)).toBeNull()
    })

    test('should return null for undefined', () => {
      expect(convertTSLintSeverity(undefined)).toBeNull()
    })

    test('should convert array with boolean true to error', () => {
      expect(convertTSLintSeverity([true, { option: 1 }])).toBe('error')
    })

    test('should convert array with boolean false to null', () => {
      expect(convertTSLintSeverity([false, { option: 1 }])).toBeNull()
    })

    test('should convert array with string severity', () => {
      expect(convertTSLintSeverity(['error', { max: 5 }])).toBe('error')
    })

    test('should convert empty array to null', () => {
      expect(convertTSLintSeverity([])).toBeNull()
    })
  })

  describe('migrateTSLintConfig', () => {
    test('should handle config with no rules', () => {
      const result = migrateTSLintConfig({})
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
      expect(result.source).toBe('tslint')
    })

    test('should migrate curly rule', () => {
      const result = migrateTSLintConfig({ rules: { curly: true } })
      expect(result.rules['curly']).toBe('error')
    })

    test('should migrate cyclomatic-complexity to max-complexity', () => {
      const result = migrateTSLintConfig({ rules: { 'cyclomatic-complexity': true } })
      expect(result.rules['max-complexity']).toBe('error')
    })

    test('should migrate no-console to no-console', () => {
      const result = migrateTSLintConfig({ rules: { 'no-console': true } })
      expect(result.rules['no-console']).toBe('error')
    })

    test('should migrate no-debugger to no-debugger', () => {
      const result = migrateTSLintConfig({ rules: { 'no-debugger': true } })
      expect(result.rules['no-debugger']).toBe('error')
    })

    test('should migrate no-empty to no-empty', () => {
      const result = migrateTSLintConfig({ rules: { 'no-empty': true } })
      expect(result.rules['no-empty']).toBe('error')
    })

    test('should migrate no-eval to no-eval', () => {
      const result = migrateTSLintConfig({ rules: { 'no-eval': true } })
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should migrate no-namespace to no-namespace', () => {
      const result = migrateTSLintConfig({ rules: { 'no-namespace': true } })
      expect(result.rules['no-namespace']).toBe('error')
    })

    test('should migrate no-var-keyword to prefer-const', () => {
      const result = migrateTSLintConfig({ rules: { 'no-var-keyword': true } })
      expect(result.rules['prefer-const']).toBe('error')
    })

    test('should migrate prefer-const to prefer-const', () => {
      const result = migrateTSLintConfig({ rules: { 'prefer-const': true } })
      expect(result.rules['prefer-const']).toBe('error')
    })

    test('should migrate triple-equals to eq-eq-eq', () => {
      const result = migrateTSLintConfig({ rules: { 'triple-equals': true } })
      expect(result.rules['eq-eq-eq']).toBe('error')
    })

    test('should migrate typedef to explicit-return-type', () => {
      const result = migrateTSLintConfig({ rules: { typedef: true } })
      expect(result.rules['explicit-return-type']).toBe('error')
    })

    test('should migrate no-shadowed-variable to no-shadow', () => {
      const result = migrateTSLintConfig({ rules: { 'no-shadowed-variable': true } })
      expect(result.rules['no-shadow']).toBe('error')
    })

    test('should migrate no-string-throw to no-throw-literal', () => {
      const result = migrateTSLintConfig({ rules: { 'no-string-throw': true } })
      expect(result.rules['no-throw-literal']).toBe('error')
    })

    test('should migrate no-require-imports to no-require-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'no-require-imports': true } })
      expect(result.rules['no-require-imports']).toBe('error')
    })

    test('should migrate ordered-imports to consistent-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'ordered-imports': true } })
      expect(result.rules['consistent-imports']).toBe('error')
    })

    test('should migrate prefer-for-of to prefer-for-of', () => {
      const result = migrateTSLintConfig({ rules: { 'prefer-for-of': true } })
      expect(result.rules['prefer-for-of']).toBe('error')
    })

    test('should migrate only-arrow-functions to prefer-arrow-callback', () => {
      const result = migrateTSLintConfig({ rules: { 'only-arrow-functions': true } })
      expect(result.rules['prefer-arrow-callback']).toBe('error')
    })

    test('should migrate no-inferrable-types to no-inferrable-types', () => {
      const result = migrateTSLintConfig({ rules: { 'no-inferrable-types': true } })
      expect(result.rules['no-inferrable-types']).toBe('error')
    })

    test('should migrate no-magic-numbers to no-magic-numbers', () => {
      const result = migrateTSLintConfig({ rules: { 'no-magic-numbers': true } })
      expect(result.rules['no-magic-numbers']).toBe('error')
    })

    test('should migrate no-var-requires to no-cjs-imports', () => {
      const result = migrateTSLintConfig({ rules: { 'no-var-requires': true } })
      expect(result.rules['no-cjs-imports']).toBe('error')
    })

    test('should migrate no-internal-module to no-namespace', () => {
      const result = migrateTSLintConfig({ rules: { 'no-internal-module': true } })
      expect(result.rules['no-namespace']).toBe('error')
    })

    test('should migrate member-access to explicit-module-boundary-types', () => {
      const result = migrateTSLintConfig({ rules: { 'member-access': true } })
      expect(result.rules['explicit-module-boundary-types']).toBe('error')
    })

    test('should migrate no-any to no-explicit-any', () => {
      const result = migrateTSLintConfig({ rules: { 'no-any': true } })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    test('should migrate ban-ts-ignore to no-explicit-any', () => {
      const result = migrateTSLintConfig({ rules: { 'ban-ts-ignore': true } })
      expect(result.rules['no-explicit-any']).toBe('error')
    })

    test('should skip disabled rules (false)', () => {
      const result = migrateTSLintConfig({ rules: { curly: false } })
      expect(result.rules['curly']).toBeUndefined()
    })

    test('should skip disabled rules (off)', () => {
      const result = migrateTSLintConfig({ rules: { curly: 'off' } })
      expect(result.rules['curly']).toBeUndefined()
    })

    test('should handle string severity warning', () => {
      const result = migrateTSLintConfig({ rules: { 'no-console': 'warning' } })
      expect(result.rules['no-console']).toBe('warning')
    })

    test('should handle array config with options', () => {
      const result = migrateTSLintConfig({
        rules: { 'cyclomatic-complexity': [true, { max: 10 }] },
      })
      expect(result.rules['max-complexity']).toEqual(['error', { max: 10 }])
    })

    test('should handle array config with no options', () => {
      const result = migrateTSLintConfig({ rules: { curly: [true] } })
      expect(result.rules['curly']).toBe('error')
    })

    test('should collect unmapped rules', () => {
      const result = migrateTSLintConfig({
        rules: { 'unknown-rule': true, 'another-unknown': true },
      })
      expect(result.unmapped).toContain('unknown-rule')
      expect(result.unmapped).toContain('another-unknown')
    })

    test('should handle config with all rules disabled', () => {
      const result = migrateTSLintConfig({
        rules: { curly: false, 'no-console': false, 'no-eval': false },
      })
      expect(Object.keys(result.rules)).toHaveLength(0)
    })

    test('should handle mixed enabled and disabled rules', () => {
      const result = migrateTSLintConfig({
        rules: { curly: true, 'no-console': false, 'no-eval': true },
      })
      expect(result.rules['curly']).toBe('error')
      expect(result.rules['no-console']).toBeUndefined()
      expect(result.rules['no-eval']).toBe('error')
    })

    test('should handle empty rules object', () => {
      const result = migrateTSLintConfig({ rules: {} })
      expect(result.rules).toEqual({})
      expect(result.unmapped).toEqual([])
    })

    test('should set source to tslint', () => {
      const result = migrateTSLintConfig({})
      expect(result.source).toBe('tslint')
    })

    test('should handle max-file-line-count to max-lines', () => {
      const result = migrateTSLintConfig({ rules: { 'max-file-line-count': [true, { limit: 500 }] } })
      expect(result.rules['max-lines']).toEqual(['error', { limit: 500 }])
    })

    test('should handle max-line-length to max-lines', () => {
      const result = migrateTSLintConfig({ rules: { 'max-line-length': true } })
      expect(result.rules['max-lines']).toBe('error')
    })

    test('should handle no-angle-bracket-type-assertion', () => {
      const result = migrateTSLintConfig({ rules: { 'no-angle-bracket-type-assertion': true } })
      expect(result.rules['no-unnecessary-type-assertion']).toBe('error')
    })

    test('should handle no-unnecessary-initializer', () => {
      const result = migrateTSLintConfig({ rules: { 'no-unnecessary-initializer': true } })
      expect(result.rules['no-unnecessary-initialization']).toBe('error')
    })

    test('should handle no-use-before-declare', () => {
      const result = migrateTSLintConfig({ rules: { 'no-use-before-declare': true } })
      expect(result.rules['no-invalid-use-before-def']).toBe('error')
    })

    test('should handle class-name', () => {
      const result = migrateTSLintConfig({ rules: { 'class-name': true } })
      expect(result.rules['strict-boolean-expressions']).toBe('error')
    })

    test('should handle array-type', () => {
      const result = migrateTSLintConfig({ rules: { 'array-type': true } })
      expect(result.rules['prefer-array-find']).toBe('error')
    })

    test('should handle full realistic TSLint config', () => {
      const result = migrateTSLintConfig({
        rules: {
          curly: true,
          'no-console': true,
          'no-debugger': true,
          'no-eval': true,
          'no-namespace': 'warning',
          'prefer-const': true,
          'triple-equals': [true, { allowNullCheck: true }],
          'cyclomatic-complexity': [true, { max: 20 }],
          'unknown-rule-x': true,
        },
      })
      expect(result.rules['curly']).toBe('error')
      expect(result.rules['no-console']).toBe('error')
      expect(result.rules['no-debugger']).toBe('error')
      expect(result.rules['no-eval']).toBe('error')
      expect(result.rules['no-namespace']).toBe('warning')
      expect(result.rules['prefer-const']).toBe('error')
      expect(result.rules['eq-eq-eq']).toEqual(['error', { allowNullCheck: true }])
      expect(result.rules['max-complexity']).toEqual(['error', { max: 20 }])
      expect(result.unmapped).toContain('unknown-rule-x')
    })
  })

  describe('detectTSLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-tslint-detect-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should find tslint.json', async () => {
      writeFileSync(join(testDir, 'tslint.json'), '{}')
      const result = await detectTSLintConfig(testDir)
      expect(result).toBe(join(testDir, 'tslint.json'))
    })

    test('should return null when no config found', async () => {
      const result = await detectTSLintConfig(testDir)
      expect(result).toBeNull()
    })
  })

  describe('readTSLintConfig', () => {
    const testDir = join(tmpdir(), 'codeforge-tslint-read-test')

    beforeEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
      mkdirSync(testDir, { recursive: true })
    })

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true })
      }
    })

    test('should read valid JSON config', async () => {
      const configPath = join(testDir, 'tslint.json')
      writeFileSync(configPath, JSON.stringify({ rules: { curly: true } }))
      const result = await readTSLintConfig(configPath)
      expect(result).not.toBeNull()
      expect(result?.rules?.curly).toBe(true)
    })

    test('should return null for non-existent file', async () => {
      const result = await readTSLintConfig('/non/existent/tslint.json')
      expect(result).toBeNull()
    })

    test('should return null for invalid JSON', async () => {
      const configPath = join(testDir, 'tslint.json')
      writeFileSync(configPath, 'not valid json')
      const result = await readTSLintConfig(configPath)
      expect(result).toBeNull()
    })

    test('should read config with rulesDirectory', async () => {
      const configPath = join(testDir, 'tslint.json')
      writeFileSync(configPath, JSON.stringify({ rules: {}, rulesDirectory: ['custom-rules'] }))
      const result = await readTSLintConfig(configPath)
      expect(result).not.toBeNull()
      expect(result?.rulesDirectory).toEqual(['custom-rules'])
    })

    test('should read empty config', async () => {
      const configPath = join(testDir, 'tslint.json')
      writeFileSync(configPath, '{}')
      const result = await readTSLintConfig(configPath)
      expect(result).not.toBeNull()
      expect(result).toEqual({})
    })
  })
})
