import { describe, it, expect, afterEach } from 'vitest'
import { parseArrayValue, isValidSeverity, parseRulesFromEnv, clearEnvVars } from '../src/config/env-parser.js'

describe('parseArrayValue', () => {
  it('splits comma-separated values', () => {
    expect(parseArrayValue('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace', () => {
    expect(parseArrayValue(' a , b , c ')).toEqual(['a', 'b', 'c'])
  })

  it('filters empty values', () => {
    expect(parseArrayValue('a,,b,')).toEqual(['a', 'b'])
  })

  it('handles single value', () => {
    expect(parseArrayValue('hello')).toEqual(['hello'])
  })
})

describe('isValidSeverity', () => {
  it('accepts valid severities', () => {
    expect(isValidSeverity('error')).toBe(true)
    expect(isValidSeverity('warning')).toBe(true)
    expect(isValidSeverity('info')).toBe(true)
  })

  it('rejects invalid severities', () => {
    expect(isValidSeverity('debug')).toBe(false)
    expect(isValidSeverity('')).toBe(false)
    expect(isValidSeverity('ERROR')).toBe(false)
  })
})

describe('parseRulesFromEnv', () => {
  afterEach(() => clearEnvVars())

  it('parses rule severity', () => {
    const env = { CODEFORGE_RULES_MAX_COMPLEXITY: 'error' }
    const rules = parseRulesFromEnv(env)
    expect(rules['max-complexity']).toBe('error')
  })

  it('parses rule with options', () => {
    const env = {
      CODEFORGE_RULES_MAX_PARAMS: 'warning',
      CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules['max-params']).toEqual(['warning', { max: 5 }])
  })

  it('skips invalid severity', () => {
    const env = { CODEFORGE_RULES_FOO: 'invalid' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('skips _OPTIONS vars alone', () => {
    const env = { CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}' }
    const rules = parseRulesFromEnv(env)
    expect(rules).toEqual({})
  })

  it('falls back to severity on invalid JSON options', () => {
    const env = {
      CODEFORGE_RULES_MAX_PARAMS: 'warning',
      CODEFORGE_RULES_MAX_PARAMS_OPTIONS: 'not-json',
    }
    const rules = parseRulesFromEnv(env)
    expect(rules['max-params']).toBe('warning')
  })

  it('returns empty for no env vars', () => {
    expect(parseRulesFromEnv({})).toEqual({})
  })
})

describe('clearEnvVars', () => {
  it('removes CODEFORGE_ prefixed vars', () => {
    process.env.CODEFORGE_TEST_VAR = 'hello'
    process.env.OTHER_VAR = 'kept'
    clearEnvVars()
    expect(process.env.CODEFORGE_TEST_VAR).toBeUndefined()
    expect(process.env.OTHER_VAR).toBe('kept')
    delete process.env.OTHER_VAR
  })
})
