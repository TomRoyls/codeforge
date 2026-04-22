import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  parseEnvVars,
  clearEnvVars,
  parseArrayValue,
  isValidSeverity,
  parseRulesFromEnv,
} from '../../../src/config/env-parser.js'
import { mergeEnvConfig } from '../../../src/config/merger.js'
import type { CodeForgeConfig } from '../../../src/config/types.js'

describe('Environment Variable Config', () => {
  beforeEach(() => {
    clearEnvVars()
  })

  afterEach(() => {
    clearEnvVars()
  })

  describe('parseEnvVars', () => {
    it('should parse CODEFORGE_FILES with comma-separated values', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.js'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.js'])
    })

    it('should parse CODEFORGE_IGNORE with comma-separated values', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
    })

    it('should parse CODEFORGE_RULES_<RULEID> for rule severity', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': 'error',
        'max-params': 'warning',
      })
    })

    it('should parse CODEFORGE_RULES_<RULEID>_OPTIONS as JSON', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 10}'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': ['error', { max: 10 }],
      })
    })

    it('should return empty config when no env vars set', () => {
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle single file pattern', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('should handle invalid JSON in options gracefully', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{invalid}'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': 'error',
      })
    })

    it('should convert underscore to hyphen in rule IDs', () => {
      process.env.CODEFORGE_RULES_MAX_LINES_PER_FUNCTION = 'error'
      const config = parseEnvVars()
      expect(config.rules).toHaveProperty('max-lines-per-function')
    })

    it('should trim whitespace from array values', () => {
      process.env.CODEFORGE_FILES = '  **/*.ts  ,  **/*.js  '
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.js'])
    })
  })

  describe('mergeEnvConfig', () => {
    it('should override file config with env config', () => {
      const fileConfig: CodeForgeConfig = {
        rules: {
          'max-complexity': 'warning',
        },
      }
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules?.['max-complexity']).toBe('error')
    })

    it('should merge arrays (files, ignore) from env', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
      }
      process.env.CODEFORGE_FILES = '**/*.js,**/*.ts'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.js', '**/*.ts'])
    })

    it('should use file config when env not set', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, parseEnvVars())
      expect(merged).toEqual(fileConfig)
    })

    it('should add new rules from env to existing rules', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'max-complexity': 'error' },
      }
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules).toEqual({
        'max-complexity': 'error',
        'max-params': 'warning',
      })
    })
  })

  describe('env var naming convention', () => {
    it('should only process CODEFORGE_ prefixed vars', () => {
      process.env.OTHER_VAR = 'value'
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toBeDefined()
    })

    it('should be case-sensitive (CODEFORGE_ not codeforge_)', () => {
      process.env.codeforge_files = '**/*.js'
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('should warn and skip invalid severity values', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'invalid'
      const config = parseEnvVars()
      expect(config.rules).toBeUndefined()
    })

    it('should warn and skip empty severity values', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = ''
      const config = parseEnvVars()
      expect(config.rules).toBeUndefined()
    })
  })

  describe('parseArrayValue', () => {
    it('should split comma-separated values into array', () => {
      expect(parseArrayValue('a,b,c')).toEqual(['a', 'b', 'c'])
    })

    it('should return single-element array for non-comma string', () => {
      expect(parseArrayValue('single')).toEqual(['single'])
    })

    it('should trim whitespace from each element', () => {
      expect(parseArrayValue('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c'])
    })

    it('should filter out empty strings after splitting', () => {
      expect(parseArrayValue('a,,b,,,c')).toEqual(['a', 'b', 'c'])
    })

    it('should filter out whitespace-only elements', () => {
      expect(parseArrayValue('a,   ,b')).toEqual(['a', 'b'])
    })

    it('should handle trailing comma', () => {
      expect(parseArrayValue('a,b,')).toEqual(['a', 'b'])
    })

    it('should handle leading comma', () => {
      expect(parseArrayValue(',a,b')).toEqual(['a', 'b'])
    })

    it('should handle only commas', () => {
      expect(parseArrayValue(',,,')).toEqual([])
    })

    it('should handle only whitespace and commas', () => {
      expect(parseArrayValue('  ,  ,  ')).toEqual([])
    })

    it('should handle empty string', () => {
      expect(parseArrayValue('')).toEqual([])
    })

    it('should handle string with only spaces', () => {
      expect(parseArrayValue('   ')).toEqual([])
    })

    it('should handle single comma', () => {
      expect(parseArrayValue(',')).toEqual([])
    })

    it('should preserve glob characters in patterns', () => {
      expect(parseArrayValue('**/*.ts,**/*.tsx')).toEqual(['**/*.ts', '**/*.tsx'])
    })

    it('should handle paths with special characters', () => {
      expect(parseArrayValue('./src/[id].ts,./src/[...slug].ts')).toEqual([
        './src/[id].ts',
        './src/[...slug].ts',
      ])
    })

    it('should handle values with spaces inside (trimmed)', () => {
      expect(parseArrayValue('a b , c d')).toEqual(['a b', 'c d'])
    })

    it('should handle many comma-separated values', () => {
      const input = Array.from({ length: 50 }, (_, i) => `pattern${i}`).join(',')
      const result = parseArrayValue(input)
      expect(result).toHaveLength(50)
      expect(result[0]).toBe('pattern0')
      expect(result[49]).toBe('pattern49')
    })

    it('should handle unicode characters', () => {
      expect(parseArrayValue('α,β,γ')).toEqual(['α', 'β', 'γ'])
    })

    it('should handle file extensions with dots', () => {
      expect(parseArrayValue('.ts,.tsx,.js,.jsx')).toEqual(['.ts', '.tsx', '.js', '.jsx'])
    })

    it('should preserve path separators', () => {
      expect(parseArrayValue('src/foo,src/bar')).toEqual(['src/foo', 'src/bar'])
    })

    it('should handle negation patterns', () => {
      expect(parseArrayValue('!node_modules/**,!dist/**')).toEqual(['!node_modules/**', '!dist/**'])
    })
  })

  describe('isValidSeverity', () => {
    it('should return true for "error"', () => {
      expect(isValidSeverity('error')).toBe(true)
    })

    it('should return true for "warning"', () => {
      expect(isValidSeverity('warning')).toBe(true)
    })

    it('should return true for "info"', () => {
      expect(isValidSeverity('info')).toBe(true)
    })

    it('should return false for "off"', () => {
      expect(isValidSeverity('off')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidSeverity('')).toBe(false)
    })

    it('should return false for "Error" (case-sensitive)', () => {
      expect(isValidSeverity('Error')).toBe(false)
    })

    it('should return false for "WARNING" (case-sensitive)', () => {
      expect(isValidSeverity('WARNING')).toBe(false)
    })

    it('should return false for "INFO" (case-sensitive)', () => {
      expect(isValidSeverity('INFO')).toBe(false)
    })

    it('should return false for "Error" with different casing', () => {
      expect(isValidSeverity('Error')).toBe(false)
    })

    it('should return false for "warn"', () => {
      expect(isValidSeverity('warn')).toBe(false)
    })

    it('should return false for numeric string "0"', () => {
      expect(isValidSeverity('0')).toBe(false)
    })

    it('should return false for numeric string "1"', () => {
      expect(isValidSeverity('1')).toBe(false)
    })

    it('should return false for numeric string "2"', () => {
      expect(isValidSeverity('2')).toBe(false)
    })

    it('should return false for string with whitespace "error "', () => {
      expect(isValidSeverity('error ')).toBe(false)
    })

    it('should return false for string with whitespace " error"', () => {
      expect(isValidSeverity(' error')).toBe(false)
    })

    it('should return false for "strict"', () => {
      expect(isValidSeverity('strict')).toBe(false)
    })

    it('should narrow type correctly for valid severity', () => {
      const value = 'error'
      if (isValidSeverity(value)) {
        const assignable: 'error' | 'info' | 'warning' = value
        expect(assignable).toBe('error')
      }
    })
  })

  describe('parseRulesFromEnv', () => {
    it('should return empty object when no CODEFORGE_RULES_* vars', () => {
      expect(parseRulesFromEnv({})).toEqual({})
    })

    it('should return empty object for unrelated env vars', () => {
      expect(parseRulesFromEnv({ CODEFORGE_FILES: '**/*.ts' })).toEqual({})
    })

    it('should parse single rule with severity "error"', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: 'error' })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should parse single rule with severity "warning"', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: 'warning' })
      expect(result).toEqual({ 'no-eval': 'warning' })
    })

    it('should parse single rule with severity "info"', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: 'info' })
      expect(result).toEqual({ 'no-eval': 'info' })
    })

    it('should parse multiple rules simultaneously', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_CONSOLE: 'warning',
        CODEFORGE_RULES_PREFER_CONST: 'info',
      })
      expect(result).toEqual({
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'info',
      })
    })

    it('should convert multi-word rule IDs with underscores to hyphens', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
      })
      expect(result).toHaveProperty('max-complexity')
      expect(result).not.toHaveProperty('max_complexity')
    })

    it('should handle single-word rule IDs', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NOEVAL: 'error' })
      expect(result).toHaveProperty('noeval')
    })

    it('should skip rules with invalid severity', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: 'critical' })
      expect(result).toEqual({})
    })

    it('should skip rules with empty severity', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: '' })
      expect(result).toEqual({})
    })

    it('should skip rules with undefined severity', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: undefined })
      expect(result).toEqual({})
    })

    it('should skip _OPTIONS vars when they appear without a severity', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS: '{"max": 10}',
      })
      expect(result).toEqual({})
    })

    it('should combine severity with valid JSON options', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
        CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS: '{"max": 10}',
      })
      expect(result).toEqual({
        'max-complexity': ['error', { max: 10 }],
      })
    })

    it('should fall back to severity only for invalid JSON options', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
        CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS: 'not json',
      })
      expect(result).toEqual({ 'max-complexity': 'error' })
    })

    it('should fall back to severity for malformed JSON options', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'warning',
        CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS: '{broken json}',
      })
      expect(result).toEqual({ 'max-complexity': 'warning' })
    })

    it('should use severity only when no options provided', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_NO_EVAL: 'error' })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with nested JSON objects', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'warning',
        CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS: '{"max": 10, "threshold": {"warn": 5}}',
      })
      expect(result).toEqual({
        'max-complexity': ['warning', { max: 10, threshold: { warn: 5 } }],
      })
    })

    it('should handle options with array values', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_IMPORT: 'error',
        CODEFORGE_RULES_NO_IMPORT_OPTIONS: '{"paths": ["lodash", "underscore"]}',
      })
      expect(result).toEqual({
        'no-import': ['error', { paths: ['lodash', 'underscore'] }],
      })
    })

    it('should handle options with boolean values', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_PREFER_CONST: 'error',
        CODEFORGE_RULES_PREFER_CONST_OPTIONS: '{"destructuring": true}',
      })
      expect(result).toEqual({
        'prefer-const': ['error', { destructuring: true }],
      })
    })

    it('should handle options with null values', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_PREFER_CONST: 'warning',
        CODEFORGE_RULES_PREFER_CONST_OPTIONS: '{"value": null}',
      })
      expect(result).toEqual({
        'prefer-const': ['warning', { value: null }],
      })
    })

    it('should handle options with numeric values', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_PARAMS: 'error',
        CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 3}',
      })
      expect(result).toEqual({
        'max-params': ['error', { max: 3 }],
      })
    })

    it('should handle options with string values', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_IMPORT: 'error',
        CODEFORGE_RULES_NO_IMPORT_OPTIONS: '{"message": "Do not use this"}',
      })
      expect(result).toEqual({
        'no-import': ['error', { message: 'Do not use this' }],
      })
    })

    it('should handle options with empty JSON object', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'info',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{}',
      })
      expect(result).toEqual({ 'no-eval': ['info', {}] })
    })

    it('should handle options with empty JSON array', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'info',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '[]',
      })
      expect(result).toEqual({ 'no-eval': ['info', []] })
    })

    it('should handle options as JSON number (not an object)', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '42',
      })
      expect(result).toEqual({ 'no-eval': ['error', 42] })
    })

    it('should handle options as JSON string value', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '"some string"',
      })
      expect(result).toEqual({ 'no-eval': ['error', 'some string'] })
    })

    it('should handle options as JSON boolean', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: 'true',
      })
      expect(result).toEqual({ 'no-eval': ['error', true] })
    })

    it('should handle options as JSON null', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: 'null',
      })
      expect(result).toEqual({ 'no-eval': ['error', null] })
    })

    it('should convert rule ID to lowercase', () => {
      const result = parseRulesFromEnv({ CODEFORGE_RULES_MY_RULE: 'error' })
      expect(result).toHaveProperty('my-rule')
    })

    it('should handle rule IDs with many underscores', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_A_B_C_D: 'warning',
      })
      expect(result).toHaveProperty('a-b-c-d')
    })

    it('should not include options key in the parsed rules', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"x": 1}',
      })
      const keys = Object.keys(result)
      expect(keys).not.toContain('no-eval-options')
      expect(keys).toEqual(['no-eval'])
    })

    it('should process valid rules and skip invalid ones in the same call', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_CONSOLE: 'bad-value',
        CODEFORGE_RULES_PREFER_CONST: 'info',
      })
      expect(result).toEqual({
        'no-eval': 'error',
        'prefer-const': 'info',
      })
      expect(result).not.toHaveProperty('no-console')
    })

    it('should ignore OPTIONS for a rule that has invalid severity', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'bad',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"max": 10}',
      })
      expect(result).toEqual({})
    })

    it('should handle options when env options value is empty string', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })
  })

  describe('parseEnvVars - extended coverage', () => {
    it('should return empty config with no CODEFORGE_ env vars at all', () => {
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should parse CODEFORGE_FILES only', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config).toEqual({ files: ['**/*.ts'] })
    })

    it('should parse CODEFORGE_IGNORE only', () => {
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const config = parseEnvVars()
      expect(config).toEqual({ ignore: ['dist/**'] })
    })

    it('should parse rules only', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      expect(config).toEqual({ rules: { 'no-eval': 'error' } })
    })

    it('should parse files, ignore, and rules simultaneously', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.js'
      process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.js'])
      expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should not include rules key when no rules parsed', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config).not.toHaveProperty('rules')
    })

    it('should not include files key when no files parsed', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      expect(config).not.toHaveProperty('files')
    })

    it('should not include ignore key when no ignore parsed', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      expect(config).not.toHaveProperty('ignore')
    })

    it('should ignore non-CODEFORGE env vars', () => {
      process.env.PATH = '/usr/bin'
      process.env.HOME = '/home/user'
      process.env.NODE_ENV = 'test'
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle CODEFORGE_ vars that are not files/ignore/rules', () => {
      process.env.CODEFORGE_SOMETHING_ELSE = 'value'
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle CODEFORGE_FILES with many patterns', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.mjs'
      const config = parseEnvVars()
      expect(config.files).toHaveLength(5)
    })

    it('should handle CODEFORGE_IGNORE with many patterns', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**,coverage/**,.git/**,build/**'
      const config = parseEnvVars()
      expect(config.ignore).toHaveLength(5)
    })

    it('should handle rule with all three severities across multiple rules', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'warning'
      process.env.CODEFORGE_RULES_PREFER_CONST = 'info'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'no-eval': 'error',
        'no-console': 'warning',
        'prefer-const': 'info',
      })
    })

    it('should handle CODEFORGE_FILES with empty string', () => {
      process.env.CODEFORGE_FILES = ''
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle CODEFORGE_IGNORE with empty string', () => {
      process.env.CODEFORGE_IGNORE = ''
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle CODEFORGE_FILES with only whitespace and commas', () => {
      process.env.CODEFORGE_FILES = '  ,  ,  '
      const config = parseEnvVars()
      expect(config.files).toEqual([])
    })

    it('should handle CODEFORGE_IGNORE with only whitespace and commas', () => {
      process.env.CODEFORGE_IGNORE = '  ,  ,  '
      const config = parseEnvVars()
      expect(config.ignore).toEqual([])
    })

    it('should handle CODEFORGE_FILES with complex glob patterns', () => {
      process.env.CODEFORGE_FILES = 'src/**/!(*.spec|*.test).ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/!(*.spec|*.test).ts'])
    })
  })

  describe('clearEnvVars', () => {
    it('should remove all CODEFORGE_ env vars', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      process.env.CODEFORGE_IGNORE = 'dist/**'
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_NO_EVAL).toBeUndefined()
    })

    it('should not affect non-CODEFORGE env vars', () => {
      process.env.PATH = '/usr/bin'
      process.env.CODEFORGE_FILES = '**/*.ts'
      clearEnvVars()
      expect(process.env.PATH).toBe('/usr/bin')
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('should be safe to call when no CODEFORGE_ vars exist', () => {
      expect(() => clearEnvVars()).not.toThrow()
    })

    it('should be safe to call multiple times in a row', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      clearEnvVars()
      clearEnvVars()
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('should remove CODEFORGE_RULES_* options vars', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 10}'
      clearEnvVars()
      expect(process.env.CODEFORGE_RULES_MAX_COMPLEXITY).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS).toBeUndefined()
    })

    it('should remove vars with any suffix after CODEFORGE_', () => {
      process.env.CODEFORGE_CUSTOM_VAR = 'test'
      process.env.CODEFORGE_ANOTHER = 'value'
      clearEnvVars()
      expect(process.env.CODEFORGE_CUSTOM_VAR).toBeUndefined()
      expect(process.env.CODEFORGE_ANOTHER).toBeUndefined()
    })
  })

  describe('mergeEnvConfig - extended coverage', () => {
    it('should override file config files with env config files', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
      }
      process.env.CODEFORGE_FILES = '**/*.js'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.js'])
    })

    it('should override file config ignore with env config ignore', () => {
      const fileConfig: CodeForgeConfig = {
        ignore: ['node_modules/**'],
      }
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.ignore).toEqual(['dist/**'])
    })

    it('should keep file config files when env has no files', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
      }
      const merged = mergeEnvConfig(fileConfig, {})
      expect(merged.files).toEqual(['**/*.ts'])
    })

    it('should keep file config ignore when env has no ignore', () => {
      const fileConfig: CodeForgeConfig = {
        ignore: ['node_modules/**'],
      }
      const merged = mergeEnvConfig(fileConfig, {})
      expect(merged.ignore).toEqual(['node_modules/**'])
    })

    it('should keep file config rules when env has no rules', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {})
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should override specific rule from env while keeping others from file', () => {
      const fileConfig: CodeForgeConfig = {
        rules: {
          'no-eval': 'error',
          'no-console': 'warning',
        },
      }
      process.env.CODEFORGE_RULES_NO_EVAL = 'info'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules?.['no-eval']).toBe('info')
      expect(merged.rules?.['no-console']).toBe('warning')
    })

    it('should handle both file and env having no config', () => {
      const merged = mergeEnvConfig({}, {})
      expect(merged.files).toBeUndefined()
      expect(merged.ignore).toBeUndefined()
      expect(merged.rules).toEqual({})
    })

    it('should handle empty fileConfig with env rules', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig({}, envConfig)
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should merge rule with options from env over file severity', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'max-complexity': 'warning' },
      }
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 10}'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules?.['max-complexity']).toEqual(['error', { max: 10 }])
    })

    it('should handle undefined envConfig parameter', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
      }
      const merged = mergeEnvConfig(fileConfig)
      expect(merged.files).toEqual(['**/*.ts'])
    })

    it('should handle empty file config with env files', () => {
      process.env.CODEFORGE_FILES = '**/*.js'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig({}, envConfig)
      expect(merged.files).toEqual(['**/*.js'])
    })

    it('should handle empty file config with env ignore', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules/**'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig({}, envConfig)
      expect(merged.ignore).toEqual(['node_modules/**'])
    })

    it('should merge complex scenario: files, ignore, and rules all from env', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'warning' },
      }
      process.env.CODEFORGE_FILES = '**/*.js'
      process.env.CODEFORGE_IGNORE = 'dist/**'
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'error'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.js'])
      expect(merged.ignore).toEqual(['dist/**'])
      expect(merged.rules?.['no-eval']).toBe('warning')
      expect(merged.rules?.['no-console']).toBe('error')
    })

    it('should use env files even when file config files is empty array', () => {
      const fileConfig: CodeForgeConfig = {
        files: [],
      }
      process.env.CODEFORGE_FILES = '**/*.ts'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.ts'])
    })

    it('should use env ignore even when file config ignore is empty array', () => {
      const fileConfig: CodeForgeConfig = {
        ignore: [],
      }
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.ignore).toEqual(['dist/**'])
    })

    it('should preserve file rules not overridden by env', () => {
      const fileConfig: CodeForgeConfig = {
        rules: {
          'no-eval': 'error',
          'no-console': 'warning',
          'prefer-const': 'info',
        },
      }
      process.env.CODEFORGE_RULES_NO_EVAL = 'info'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.rules).toEqual({
        'no-eval': 'info',
        'no-console': 'warning',
        'prefer-const': 'info',
      })
    })
  })

  describe('parseRulesFromEnv - rule ID edge cases', () => {
    it('should handle rule ID with trailing underscore segments', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_: 'error',
      })
      expect(result).toHaveProperty('no-')
    })

    it('should handle rule ID that is a single character', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_A: 'error',
      })
      expect(result).toHaveProperty('a')
    })

    it('should handle very long rule IDs', () => {
      const longId = 'A'.repeat(100)
      const env = { [`CODEFORGE_RULES_${longId}`]: 'error' }
      const result = parseRulesFromEnv(env)
      expect(result).toHaveProperty(longId.toLowerCase())
    })

    it('should handle rule ID with digits', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_123: 'warning',
      })
      expect(result).toHaveProperty('rule-123')
    })

    it('should handle rule ID that starts with number', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_123_RULE: 'error',
      })
      expect(result).toHaveProperty('123-rule')
    })

    it('should handle rule ID with consecutive underscores', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MY__RULE: 'error',
      })
      expect(result).toHaveProperty('my--rule')
    })
  })

  describe('parseRulesFromEnv - JSON options edge cases', () => {
    it('should handle options with deeply nested JSON', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"a": {"b": {"c": {"d": 1}}}}',
      })
      expect(result).toEqual({
        'no-eval': ['error', { a: { b: { c: { d: 1 } } } }],
      })
    })

    it('should handle options as valid JSON but unclosed bracket', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"key": "value"',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with extra closing bracket', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"key": "value"}}',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options as JavaScript-style comment (invalid JSON)', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"key": "value" /* comment */}',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with trailing comma (invalid JSON)', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"key": "value",}',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with single quotes (invalid JSON)', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: "{'key': 'value'}",
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options as just a string without quotes (invalid)', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: 'just text',
      })
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with floating point numbers', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"threshold": 3.14}',
      })
      expect(result).toEqual({ 'no-eval': ['error', { threshold: 3.14 }] })
    })

    it('should handle options with negative numbers', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"value": -1}',
      })
      expect(result).toEqual({ 'no-eval': ['error', { value: -1 }] })
    })

    it('should handle options with very large JSON object', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 100; i++) {
        obj[`key${i}`] = i
      }
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: JSON.stringify(obj),
      })
      expect(result['no-eval']).toEqual(['error', obj])
    })
  })

  describe('integration: full env parsing workflow', () => {
    it('should parse complete config from env vars', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.tsx'
      process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'warning'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 15}'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
      expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
      expect(config.rules).toEqual({
        'no-eval': 'error',
        'max-complexity': ['warning', { max: 15 }],
      })
    })

    it('should clear and re-parse cleanly', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      let config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
      clearEnvVars()
      config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should handle setting new env vars after clear', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      clearEnvVars()
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const config = parseEnvVars()
      expect(config).toEqual({ ignore: ['dist/**'] })
      expect(config.files).toBeUndefined()
    })

    it('should merge full config from file and env', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'warning', 'no-console': 'error' },
      }
      process.env.CODEFORGE_FILES = '**/*.js,**/*.jsx'
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      process.env.CODEFORGE_RULES_PREFER_CONST = 'info'
      const envConfig = parseEnvVars()
      const merged = mergeEnvConfig(fileConfig, envConfig)
      expect(merged.files).toEqual(['**/*.js', '**/*.jsx'])
      expect(merged.ignore).toEqual(['node_modules/**'])
      expect(merged.rules).toEqual({
        'no-eval': 'error',
        'no-console': 'error',
        'prefer-const': 'info',
      })
    })

    it('should parse severity "info" for rules', () => {
      process.env.CODEFORGE_RULES_NO_DEBUGGER = 'info'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'no-debugger': 'info' })
    })

    it('should handle CODEFORGE_FILES with negation patterns', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,!**/*.spec.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '!**/*.spec.ts'])
    })

    it('should handle CODEFORGE_IGNORE with nested directory patterns', () => {
      process.env.CODEFORGE_IGNORE = 'src/generated/**,test/fixtures/**'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['src/generated/**', 'test/fixtures/**'])
    })

    it('should produce stable results across multiple calls with same env', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const first = parseEnvVars()
      const second = parseEnvVars()
      expect(first).toEqual(second)
    })

    it('should handle only rules being set without files or ignore', () => {
      process.env.CODEFORGE_RULES_PREFER_CONST = 'warning'
      const config = parseEnvVars()
      expect(config).toEqual({ rules: { 'prefer-const': 'warning' } })
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
    })

    it('should handle env vars alongside unrelated system vars', () => {
      process.env.TERM = 'xterm-256color'
      process.env.LANG = 'en_US.UTF-8'
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle multiple rules with mixed valid/invalid options', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      process.env.CODEFORGE_RULES_NO_EVAL_OPTIONS = '{"strict": true}'
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS = 'bad json'
      process.env.CODEFORGE_RULES_PREFER_CONST = 'info'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'no-eval': ['error', { strict: true }],
        'max-params': 'warning',
        'prefer-const': 'info',
      })
    })
  })

  describe('parseEnvVars - multiple env interactions', () => {
    it('should be unaffected by CODEFORGE_ vars that are not recognized patterns', () => {
      process.env.CODEFORGE_DEBUG = 'true'
      process.env.CODEFORGE_VERBOSE = '1'
      process.env.CODEFORGE_LOG_LEVEL = 'debug'
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('should parse files with Windows-style paths', () => {
      process.env.CODEFORGE_FILES = 'src\\**\\*.ts,lib\\**\\*.js'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src\\**\\*.ts', 'lib\\**\\*.js'])
    })

    it('should handle CODEFORGE_RULES_ prefix with no rule ID after it', () => {
      process.env.CODEFORGE_RULES_ = 'error'
      const config = parseEnvVars()
      expect(config.rules).toHaveProperty('')
    })

    it('should not create duplicate entries for same rule', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'error'
      const config = parseEnvVars()
      const ruleKeys = Object.keys(config.rules ?? {})
      const noEvalCount = ruleKeys.filter((k) => k === 'no-eval').length
      expect(noEvalCount).toBe(1)
    })

    it('should handle all valid severities in a single parse call', () => {
      process.env.CODEFORGE_RULES_RULE_A = 'error'
      process.env.CODEFORGE_RULES_RULE_B = 'warning'
      process.env.CODEFORGE_RULES_RULE_C = 'info'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'rule-a': 'error',
        'rule-b': 'warning',
        'rule-c': 'info',
      })
    })
  })

  describe('mergeEnvConfig - edge cases', () => {
    it('should handle env config with empty rules object', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, { rules: {} })
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle file config with empty rules and env with rules', () => {
      const fileConfig: CodeForgeConfig = {
        rules: {},
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'no-eval': 'error' },
      })
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle both configs having the same rule (env wins)', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'no-eval': 'warning' },
      })
      expect(merged.rules?.['no-eval']).toBe('warning')
    })

    it('should handle file rule with options overridden by env severity', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'max-complexity': ['error', { max: 10 }] },
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'max-complexity': 'warning' },
      })
      expect(merged.rules?.['max-complexity']).toBe('warning')
    })

    it('should handle env rule with options overriding file severity', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'max-complexity': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'max-complexity': ['warning', { max: 5 }] },
      })
      expect(merged.rules?.['max-complexity']).toEqual(['warning', { max: 5 }])
    })

    it('should handle undefined values in env config gracefully', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {
        files: undefined,
        rules: undefined,
      })
      expect(merged.files).toEqual(['**/*.ts'])
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle file config with only ignore and env with only files', () => {
      const fileConfig: CodeForgeConfig = {
        ignore: ['node_modules/**'],
      }
      const merged = mergeEnvConfig(fileConfig, { files: ['**/*.js'] })
      expect(merged.files).toEqual(['**/*.js'])
      expect(merged.ignore).toEqual(['node_modules/**'])
    })

    it('should handle both file and env having empty files array', () => {
      const fileConfig: CodeForgeConfig = { files: [] }
      const merged = mergeEnvConfig(fileConfig, { files: [] })
      expect(merged.files).toEqual([])
    })
  })

  describe('parseArrayValue - additional edge cases', () => {
    it('should handle tab characters as whitespace', () => {
      expect(parseArrayValue('\ta\t,\tb\t')).toEqual(['a', 'b'])
    })

    it('should handle newline characters in value', () => {
      expect(parseArrayValue('a\n,\nb')).toEqual(['a', 'b'])
    })

    it('should handle carriage return in value', () => {
      expect(parseArrayValue('a\r,\r\nb')).toEqual(['a', 'b'])
    })

    it('should handle mixed tab and space whitespace', () => {
      expect(parseArrayValue(' \t a \t , \t b \t ')).toEqual(['a', 'b'])
    })

    it('should handle semicolons as literal characters (not separators)', () => {
      expect(parseArrayValue('a;b;c')).toEqual(['a;b;c'])
    })

    it('should handle pipe characters as literal', () => {
      expect(parseArrayValue('a|b|c')).toEqual(['a|b|c'])
    })

    it('should handle values with equals signs', () => {
      expect(parseArrayValue('key=value,other=123')).toEqual(['key=value', 'other=123'])
    })

    it('should handle URL-like values', () => {
      expect(parseArrayValue('https://a.com,https://b.com')).toEqual([
        'https://a.com',
        'https://b.com',
      ])
    })

    it('should handle empty parens and brackets', () => {
      expect(parseArrayValue('(),[],{}')).toEqual(['()', '[]', '{}'])
    })

    it('should handle emoji in values', () => {
      expect(parseArrayValue('🎉,🚀,✅')).toEqual(['🎉', '🚀', '✅'])
    })
  })

  describe('isValidSeverity - boundary conditions', () => {
    it('should return false for "error " with trailing newline', () => {
      expect(isValidSeverity('error\n')).toBe(false)
    })

    it('should return false for "error\r"', () => {
      expect(isValidSeverity('error\r')).toBe(false)
    })

    it('should return false for "error\t"', () => {
      expect(isValidSeverity('error\t')).toBe(false)
    })

    it('should return false for "errorwarning"', () => {
      expect(isValidSeverity('errorwarning')).toBe(false)
    })

    it('should return false for "error-info"', () => {
      expect(isValidSeverity('error-info')).toBe(false)
    })

    it('should return false for "error info" with space', () => {
      expect(isValidSeverity('error info')).toBe(false)
    })
  })

  describe('parseRulesFromEnv - additional scenarios', () => {
    it('should handle 20 rules simultaneously', () => {
      const env: Record<string, string> = {}
      for (let i = 0; i < 20; i++) {
        env[`CODEFORGE_RULES_RULE_${i}`] = i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info'
      }
      const result = parseRulesFromEnv(env)
      expect(Object.keys(result)).toHaveLength(20)
    })

    it('should handle options with unicode strings', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"msg": "エラー"}',
      })
      expect(result).toEqual({ 'no-eval': ['error', { msg: 'エラー' }] })
    })

    it('should handle options with scientific notation numbers', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EVAL: 'error',
        CODEFORGE_RULES_NO_EVAL_OPTIONS: '{"value": 1e5}',
      })
      expect(result).toEqual({ 'no-eval': ['error', { value: 100000 }] })
    })

    it('should handle env object with many non-CODEFORGE keys', () => {
      const env: Record<string, string | undefined> = {
        PATH: '/usr/bin',
        HOME: '/home/user',
        SHELL: '/bin/bash',
        NODE_ENV: 'test',
        CODEFORGE_RULES_NO_EVAL: 'error',
      }
      const result = parseRulesFromEnv(env)
      expect(result).toEqual({ 'no-eval': 'error' })
    })

    it('should handle options with zero value', () => {
      const result = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_PARAMS: 'error',
        CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 0}',
      })
      expect(result).toEqual({ 'max-params': ['error', { max: 0 }] })
    })
  })

  describe('clearEnvVars - additional scenarios', () => {
    it('should clear vars set between parseEnvVars calls', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      expect(parseEnvVars().files).toEqual(['**/*.ts'])
      clearEnvVars()
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toEqual(['dist/**'])
    })
  })

  describe('mergeEnvConfig - more merge combinations', () => {
    it('should handle file with files+ignore and env with rules only', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['dist/**'],
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'no-eval': 'error' },
      })
      expect(merged.files).toEqual(['**/*.ts'])
      expect(merged.ignore).toEqual(['dist/**'])
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle file with rules only and env with files+ignore', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {
        files: ['**/*.js'],
        ignore: ['build/**'],
      })
      expect(merged.files).toEqual(['**/*.js'])
      expect(merged.ignore).toEqual(['build/**'])
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle both having rules with overlapping keys', () => {
      const fileConfig: CodeForgeConfig = {
        rules: { 'rule-a': 'error', 'rule-b': 'warning' },
      }
      const merged = mergeEnvConfig(fileConfig, {
        rules: { 'rule-b': 'info', 'rule-c': 'error' },
      })
      expect(merged.rules).toEqual({
        'rule-a': 'error',
        'rule-b': 'info',
        'rule-c': 'error',
      })
    })

    it('should handle env config with only files undefined', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['dist/**'],
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, { files: undefined })
      expect(merged.files).toEqual(['**/*.ts'])
      expect(merged.ignore).toEqual(['dist/**'])
      expect(merged.rules).toEqual({ 'no-eval': 'error' })
    })

    it('should handle env config with only ignore undefined', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['dist/**'],
      }
      const merged = mergeEnvConfig(fileConfig, { ignore: undefined })
      expect(merged.ignore).toEqual(['dist/**'])
    })

    it('should handle file config with all fields and empty env config', () => {
      const fileConfig: CodeForgeConfig = {
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'error' },
      }
      const merged = mergeEnvConfig(fileConfig, {})
      expect(merged).toEqual({
        files: ['**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'error' },
      })
    })
  })

  describe('parseArrayValue - special input patterns', () => {
    it('should handle value with only one element and no comma', () => {
      expect(parseArrayValue('single-value')).toEqual(['single-value'])
    })

    it('should handle comma-adjacent values without spaces', () => {
      expect(parseArrayValue('a,b')).toEqual(['a', 'b'])
    })

    it('should handle value starting with exclamation mark', () => {
      expect(parseArrayValue('!foo,bar')).toEqual(['!foo', 'bar'])
    })

    it('should handle value with hash characters', () => {
      expect(parseArrayValue('#comment,#another')).toEqual(['#comment', '#another'])
    })

    it('should handle double-star glob patterns', () => {
      expect(parseArrayValue('**/*,**/test/**')).toEqual(['**/*', '**/test/**'])
    })

    it('should handle question mark glob patterns', () => {
      expect(parseArrayValue('file?.ts,test?.js')).toEqual(['file?.ts', 'test?.js'])
    })

    it('should handle bracket glob patterns', () => {
      expect(parseArrayValue('file[0-9].ts')).toEqual(['file[0-9].ts'])
    })
  })
})
