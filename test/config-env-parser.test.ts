import { afterEach, describe, expect, it } from 'vitest'

import {
  clearEnvVars,
  isValidSeverity,
  parseArrayValue,
  parseEnvVars,
  parseRulesFromEnv,
} from '../src/config/env-parser.js'

// ─── parseArrayValue ───────────────────────────────────────────────
describe('parseArrayValue', () => {
  it('splits comma-separated values', () => {
    expect(parseArrayValue('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace from values', () => {
    expect(parseArrayValue('  a , b , c  ')).toEqual(['a', 'b', 'c'])
  })

  it('filters empty strings', () => {
    expect(parseArrayValue('a,,b,')).toEqual(['a', 'b'])
  })

  it('handles single value', () => {
    expect(parseArrayValue('single')).toEqual(['single'])
  })

  it('handles empty string after trim', () => {
    expect(parseArrayValue('   ')).toEqual([])
  })

  it('handles value with only commas', () => {
    expect(parseArrayValue(',,,')).toEqual([])
  })

  it('preserves values with spaces inside', () => {
    expect(parseArrayValue('hello world, foo bar')).toEqual(['hello world', 'foo bar'])
  })

  it('handles glob patterns', () => {
    expect(parseArrayValue('**/*.ts,**/*.js, !node_modules')).toEqual([
      '**/*.ts',
      '**/*.js',
      '!node_modules',
    ])
  })

  it('handles value with internal commas escaped scenarios', () => {
    expect(parseArrayValue('a')).toEqual(['a'])
  })
})

// ─── isValidSeverity ───────────────────────────────────────────────
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

  it('returns false for "off"', () => {
    expect(isValidSeverity('off')).toBe(false)
  })

  it('returns false for "debug"', () => {
    expect(isValidSeverity('debug')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidSeverity('')).toBe(false)
  })

  it('returns false for uppercase "Error"', () => {
    expect(isValidSeverity('Error')).toBe(false)
  })

  it('returns false for "ERROR"', () => {
    expect(isValidSeverity('ERROR')).toBe(false)
  })

  it('acts as type guard', () => {
    const value: string = 'error'
    if (isValidSeverity(value)) {
      const severity: 'error' | 'warning' | 'info' = value
      expect(severity).toBe('error')
    }
  })
})

// ─── parseRulesFromEnv ─────────────────────────────────────────────
describe('parseRulesFromEnv', () => {
  afterEach(() => {
    clearEnvVars()
  })

  it('returns empty object for no CODEFORGE_RULES_ vars', () => {
    expect(parseRulesFromEnv({})).toEqual({})
  })

  it('parses simple severity rule', () => {
    const env = { CODEFORGE_RULES_MAX_COMPLEXITY: 'error' }
    expect(parseRulesFromEnv(env)).toEqual({ 'max-complexity': 'error' })
  })

  it('converts underscores to hyphens in rule name', () => {
    const env = { CODEFORGE_RULES_NO_EVAL: 'warning' }
    expect(parseRulesFromEnv(env)).toEqual({ 'no-eval': 'warning' })
  })

  it('converts to lowercase', () => {
    const env = { CODEFORGE_RULES_MAX_PARAMS: 'info' }
    expect(parseRulesFromEnv(env)).toEqual({ 'max-params': 'info' })
  })

  it('skips invalid severity values', () => {
    const env = { CODEFORGE_RULES_FOO: 'invalid' }
    expect(parseRulesFromEnv(env)).toEqual({})
  })

  it('skips empty severity', () => {
    const env = { CODEFORGE_RULES_FOO: '' }
    expect(parseRulesFromEnv(env)).toEqual({})
  })

  it('skips undefined severity', () => {
    const env = { CODEFORGE_RULES_FOO: undefined }
    expect(parseRulesFromEnv(env)).toEqual({})
  })

  it('parses rule with options', () => {
    const env = {
      CODEFORGE_RULES_MAX_PARAMS: 'error',
      CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}',
    }
    expect(parseRulesFromEnv(env)).toEqual({ 'max-params': ['error', { max: 5 }] })
  })

  it('falls back to severity when options JSON is invalid', () => {
    const env = {
      CODEFORGE_RULES_MAX_PARAMS: 'warning',
      CODEFORGE_RULES_MAX_PARAMS_OPTIONS: 'not-json',
    }
    expect(parseRulesFromEnv(env)).toEqual({ 'max-params': 'warning' })
  })

  it('skips _OPTIONS vars without matching rule', () => {
    const env = { CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}' }
    expect(parseRulesFromEnv(env)).toEqual({})
  })

  it('parses multiple rules', () => {
    const env = {
      CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
      CODEFORGE_RULES_NO_EVAL: 'warning',
      CODEFORGE_RULES_NO_CONSOLE: 'info',
    }
    expect(parseRulesFromEnv(env)).toEqual({
      'max-complexity': 'error',
      'no-console': 'info',
      'no-eval': 'warning',
    })
  })

  it('ignores non-CODEFORGE_ prefixed vars', () => {
    const env = { OTHER_VAR: 'error', PATH: '/usr/bin' }
    expect(parseRulesFromEnv(env)).toEqual({})
  })

  it('handles complex multi-word rule names', () => {
    const env = { CODEFORGE_RULES_NO_CIRCULAR_DEPS: 'error' }
    expect(parseRulesFromEnv(env)).toEqual({ 'no-circular-deps': 'error' })
  })
})

// ─── parseEnvVars ──────────────────────────────────────────────────
describe('parseEnvVars', () => {
  afterEach(() => {
    clearEnvVars()
  })

  it('returns empty object when no env vars set', () => {
    clearEnvVars()
    expect(parseEnvVars()).toEqual({})
  })

  it('parses CODEFORGE_FILES', () => {
    process.env.CODEFORGE_FILES = '**/*.ts,**/*.js'
    expect(parseEnvVars().files).toEqual(['**/*.ts', '**/*.js'])
  })

  it('parses CODEFORGE_IGNORE', () => {
    process.env.CODEFORGE_IGNORE = 'node_modules/**,dist/**'
    expect(parseEnvVars().ignore).toEqual(['node_modules/**', 'dist/**'])
  })

  it('parses CODEFORGE_RULES_* into rules', () => {
    process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
    const result = parseEnvVars()
    expect(result.rules).toEqual({ 'max-complexity': 'error' })
  })

  it('combines files, ignore, and rules', () => {
    process.env.CODEFORGE_FILES = 'src/**/*.ts'
    process.env.CODEFORGE_IGNORE = 'dist/**'
    process.env.CODEFORGE_RULES_NO_EVAL = 'warning'
    const result = parseEnvVars()
    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.rules).toEqual({ 'no-eval': 'warning' })
  })

  it('does not set files when CODEFORGE_FILES not present', () => {
    const result = parseEnvVars()
    expect(result.files).toBeUndefined()
  })

  it('does not set ignore when CODEFORGE_IGNORE not present', () => {
    const result = parseEnvVars()
    expect(result.ignore).toBeUndefined()
  })

  it('does not set rules when no CODEFORGE_RULES_* present', () => {
    const result = parseEnvVars()
    expect(result.rules).toBeUndefined()
  })

  it('handles single file pattern', () => {
    process.env.CODEFORGE_FILES = '**/*.ts'
    expect(parseEnvVars().files).toEqual(['**/*.ts'])
  })
})

// ─── clearEnvVars ──────────────────────────────────────────────────
describe('clearEnvVars', () => {
  it('removes all CODEFORGE_ env vars', () => {
    process.env.CODEFORGE_FILES = '**/*.ts'
    process.env.CODEFORGE_RULES_FOO = 'error'
    process.env.CODEFORGE_IGNORE = 'dist/**'
    clearEnvVars()
    expect(process.env.CODEFORGE_FILES).toBeUndefined()
    expect(process.env.CODEFORGE_RULES_FOO).toBeUndefined()
    expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
  })

  it('does not remove non-CODEFORGE_ env vars', () => {
    process.env.PATH_ORIG = '/usr/bin'
    process.env.CODEFORGE_TEST = 'value'
    clearEnvVars()
    expect(process.env.PATH_ORIG).toBe('/usr/bin')
    delete process.env.PATH_ORIG
  })

  it('is safe to call when no CODEFORGE_ vars exist', () => {
    clearEnvVars()
    clearEnvVars()
  })
})

// ─── parseRulesFromEnv - edge cases ────────────────────────────────
describe('parseRulesFromEnv edge cases', () => {
  it('handles rule with single segment name', () => {
    const env = { CODEFORGE_RULES_FOO: 'error' }
    expect(parseRulesFromEnv(env)).toEqual({ foo: 'error' })
  })

  it('handles rule with many segments', () => {
    const env = { CODEFORGE_RULES_A_B_C_D: 'info' }
    expect(parseRulesFromEnv(env)).toEqual({ 'a-b-c-d': 'info' })
  })

  it('handles options with nested object', () => {
    const env = {
      CODEFORGE_RULES_TEST: 'error',
      CODEFORGE_RULES_TEST_OPTIONS: '{"nested": {"deep": true}}',
    }
    expect(parseRulesFromEnv(env)).toEqual({
      test: ['error', { nested: { deep: true } }],
    })
  })

  it('handles options with array value in JSON', () => {
    const env = {
      CODEFORGE_RULES_TEST: 'warning',
      CODEFORGE_RULES_TEST_OPTIONS: '[1, 2, 3]',
    }
    expect(parseRulesFromEnv(env)).toEqual({
      test: ['warning', [1, 2, 3]],
    })
  })

  it('handles severity "warning" correctly', () => {
    const env = { CODEFORGE_RULES_FOO: 'warning' }
    expect(parseRulesFromEnv(env)).toEqual({ foo: 'warning' })
  })

  it('handles severity "info" correctly', () => {
    const env = { CODEFORGE_RULES_FOO: 'info' }
    expect(parseRulesFromEnv(env)).toEqual({ foo: 'info' })
  })

  it('does not confuse OPTIONS key as a rule', () => {
    const env = { CODEFORGE_RULES_MY_OPTIONS: 'error' }
    expect(parseRulesFromEnv(env)).toEqual({})
  })
})
