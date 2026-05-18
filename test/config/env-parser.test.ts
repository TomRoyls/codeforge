import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearEnvVars,
  isValidSeverity,
  parseArrayValue,
  parseEnvVars,
  parseRulesFromEnv,
} from '../../src/config/env-parser.js'

// ─── parseArrayValue ───

describe('parseArrayValue', () => {
  it('splits comma-separated values', () => {
    expect(parseArrayValue('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace around values', () => {
    expect(parseArrayValue('  a , b ,  c  ')).toEqual(['a', 'b', 'c'])
  })

  it('filters out empty segments from leading/trailing commas', () => {
    expect(parseArrayValue(',a,b,')).toEqual(['a', 'b'])
  })

  it('filters out empty segments from consecutive commas', () => {
    expect(parseArrayValue('a,,b')).toEqual(['a', 'b'])
  })

  it('returns single value without commas', () => {
    expect(parseArrayValue('hello')).toEqual(['hello'])
  })

  it('returns empty array for empty string', () => {
    expect(parseArrayValue('')).toEqual([])
  })

  it('returns empty array for only commas', () => {
    expect(parseArrayValue(',,,')).toEqual([])
  })

  it('returns empty array for only whitespace and commas', () => {
    expect(parseArrayValue(' , , ')).toEqual([])
  })

  it('handles whitespace-only segments', () => {
    expect(parseArrayValue('a,  ,b')).toEqual(['a', 'b'])
  })
})

// ─── isValidSeverity ───

describe('isValidSeverity', () => {
  it('returns true for "error"', () => {
    expect(isValidSeverity('error')).toBe(true)
  })

  it('returns true for "warning"', () => {
    expect(isValidSeverity('warning')).toBe(true)
  })

  it('returns true for "info"', () => {
    expect(isValidSeverity('info')).toBe(true)
  })

  it('returns false for "ERROR" (uppercase)', () => {
    expect(isValidSeverity('ERROR')).toBe(false)
  })

  it('returns false for "Warning" (mixed case)', () => {
    expect(isValidSeverity('Warning')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidSeverity('')).toBe(false)
  })

  it('returns false for "debug"', () => {
    expect(isValidSeverity('debug')).toBe(false)
  })

  it('returns false for "off"', () => {
    expect(isValidSeverity('off')).toBe(false)
  })

  it('returns false for arbitrary string', () => {
    expect(isValidSeverity('something-else')).toBe(false)
  })
})

// ─── parseRulesFromEnv ───

describe('parseRulesFromEnv', () => {
  it('parses severity-only rule', () => {
    const env = { CODEFORGE_RULES_MAX_COMPLEXITY: 'error' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({ 'max-complexity': 'error' })
  })

  it('parses rule with severity and OPTIONS', () => {
    const env = {
      CODEFORGE_RULES_MAX_PARAMS: 'warning',
      CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({ 'max-params': ['warning', { max: 5 }] })
  })

  it('skips rule with invalid severity', () => {
    const env = { CODEFORGE_RULES_NO_EVAL: 'critical' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('skips rule with empty severity', () => {
    const env = { CODEFORGE_RULES_NO_EVAL: '' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('falls back to severity-only when OPTIONS has bad JSON', () => {
    const env = {
      CODEFORGE_RULES_NO_CONSOLE: 'info',
      CODEFORGE_RULES_NO_CONSOLE_OPTIONS: 'not-json',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({ 'no-console': 'info' })
  })

  it('ignores standalone _OPTIONS key without matching rule', () => {
    const env = { CODEFORGE_RULES_FOO_OPTIONS: '{"max": 1}' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('parses multiple rules simultaneously', () => {
    const env = {
      CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
      CODEFORGE_RULES_NO_EVAL: 'warning',
      CODEFORGE_RULES_PREFER_CONST: 'info',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({
      'max-complexity': 'error',
      'no-eval': 'warning',
      'prefer-const': 'info',
    })
  })

  it('converts underscores in rule name to hyphens', () => {
    const env = { CODEFORGE_RULES_NO_UNUSED_VARS: 'warning' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({ 'no-unused-vars': 'warning' })
  })

  it('converts rule name to lowercase', () => {
    const env = { CODEFORGE_RULES_MY_CUSTOM_RULE: 'error' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({ 'my-custom-rule': 'error' })
  })

  it('returns empty object when no CODEFORGE_RULES_ vars present', () => {
    const env = { CODEFORGE_FILES: '**/*.ts' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('handles OPTIONS with complex JSON value', () => {
    const env = {
      CODEFORGE_RULES_MAX_FILE_LENGTH: 'error',
      CODEFORGE_RULES_MAX_FILE_LENGTH_OPTIONS: '{"max": 300, "exclude": ["test/**"]}',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({
      'max-file-length': ['error', { max: 300, exclude: ['test/**'] }],
    })
  })
})

// ─── parseEnvVars ───

describe('parseEnvVars', () => {
  afterEach(() => {
    clearEnvVars()
  })

  it('parses CODEFORGE_FILES into files array', () => {
    process.env.CODEFORGE_FILES = '**/*.ts,**/*.tsx'
    const config = parseEnvVars()
    expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
  })

  it('parses CODEFORGE_IGNORE into ignore array', () => {
    process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
    const config = parseEnvVars()
    expect(config.ignore).toEqual(['node_modules/**', 'dist/**'])
  })

  it('parses CODEFORGE_RULES_* into rules object', () => {
    process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
    const config = parseEnvVars()
    expect(config.rules).toEqual({ 'max-complexity': 'error' })
  })

  it('parses all three config sections together', () => {
    process.env.CODEFORGE_FILES = 'src/**/*.ts'
    process.env.CODEFORGE_IGNORE = 'dist/**'
    process.env.CODEFORGE_RULES_NO_EVAL = 'warning'
    const config = parseEnvVars()
    expect(config.files).toEqual(['src/**/*.ts'])
    expect(config.ignore).toEqual(['dist/**'])
    expect(config.rules).toEqual({ 'no-eval': 'warning' })
  })

  it('returns empty object when no CODEFORGE_ env vars set', () => {
    const config = parseEnvVars()
    expect(config).toEqual({})
  })

  it('does not include rules key when no valid rules found', () => {
    process.env.CODEFORGE_FILES = '**/*.ts'
    process.env.CODEFORGE_RULES_NO_EVAL = 'invalid'
    const config = parseEnvVars()
    expect(config.files).toEqual(['**/*.ts'])
    expect(config.rules).toBeUndefined()
  })

  it('handles rule with OPTIONS in full parse', () => {
    process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
    process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS = '{"max": 3}'
    const config = parseEnvVars()
    expect(config.rules).toEqual({ 'max-params': ['warning', { max: 3 }] })
  })
})

// ─── clearEnvVars ───

describe('clearEnvVars', () => {
  it('removes all CODEFORGE_ prefixed env vars', () => {
    process.env.CODEFORGE_FILES = '**/*.ts'
    process.env.CODEFORGE_IGNORE = 'dist/**'
    process.env.CODEFORGE_RULES_NO_EVAL = 'error'
    process.env.CODEFORGE_CUSTOM_VAR = 'value'

    clearEnvVars()

    expect(process.env.CODEFORGE_FILES).toBeUndefined()
    expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
    expect(process.env.CODEFORGE_RULES_NO_EVAL).toBeUndefined()
    expect(process.env.CODEFORGE_CUSTOM_VAR).toBeUndefined()
  })

  it('does not remove non-CODEFORGE env vars', () => {
    process.env.CODEFORGE_FILES = '**/*.ts'
    process.env.PATH = '/usr/bin'

    clearEnvVars()

    expect(process.env.CODEFORGE_FILES).toBeUndefined()
    expect(process.env.PATH).toBe('/usr/bin')
  })

  it('is safe to call when no CODEFORGE_ vars exist', () => {
    clearEnvVars()
    // No error means success
    expect(true).toBe(true)
  })
})
