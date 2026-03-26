import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearEnvVars,
  isValidSeverity,
  parseArrayValue,
  parseEnvVars,
  parseRulesFromEnv,
} from '../../../src/config/env-parser.js'

describe('env-parser', () => {
  const originalEnv = process.env

  beforeEach(() => {
    clearEnvVars()
  })

  afterEach(() => {
    clearEnvVars()
  })

  describe('parseEnvVars', () => {
    it('returns empty config when no env vars set', () => {
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('parses CODEFORGE_FILES', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,**/*.tsx'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
    })

    it('parses CODEFORGE_IGNORE', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules,dist'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['node_modules', 'dist'])
    })

    it('parses CODEFORGE_RULES_* for rule severity', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'max-complexity': 'error' })
    })

    it('parses CODEFORGE_RULES_* with options', () => {
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS = '{"max": 5}'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'max-params': ['warning', { max: 5 }] })
    })

    it('parses multiple rules', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_NO_CONSOLE_LOG = 'warning'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': 'error',
        'no-console-log': 'warning',
      })
    })

    it('combines files, ignore, and rules', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      process.env.CODEFORGE_IGNORE = 'test/**'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['test/**'])
      expect(config.rules).toEqual({ 'max-complexity': 'error' })
    })

    it('handles invalid severity gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'invalid'
      const config = parseEnvVars()
      expect(config.rules).toBeUndefined()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid severity'))
      warnSpy.mockRestore()
    })
  })

  describe('parseArrayValue', () => {
    it('splits comma-separated values', () => {
      const result = parseArrayValue('a,b,c')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('trims whitespace from values', () => {
      const result = parseArrayValue('  a  ,  b  ,  c  ')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('filters empty values', () => {
      const result = parseArrayValue('a,,b,,,c')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('returns empty array for empty string', () => {
      const result = parseArrayValue('')
      expect(result).toEqual([])
    })

    it('returns empty array for whitespace-only string', () => {
      const result = parseArrayValue('   ,  ,  ')
      expect(result).toEqual([])
    })
  })

  describe('isValidSeverity', () => {
    it('returns true for error', () => {
      expect(isValidSeverity('error')).toBe(true)
    })

    it('returns true for warning', () => {
      expect(isValidSeverity('warning')).toBe(true)
    })

    it('returns true for info', () => {
      expect(isValidSeverity('info')).toBe(true)
    })

    it('returns false for invalid severity', () => {
      expect(isValidSeverity('critical')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidSeverity('')).toBe(false)
    })

    it('returns false for uppercase', () => {
      expect(isValidSeverity('ERROR')).toBe(false)
    })
  })

  describe('parseRulesFromEnv', () => {
    it('returns empty object when no rule env vars', () => {
      const rules = parseRulesFromEnv({})
      expect(rules).toEqual({})
    })

    it('converts rule name to lowercase with dashes', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_COMPLEXITY: 'error',
      })
      expect(rules).toEqual({ 'max-complexity': 'error' })
    })

    it('parses rule with JSON options', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_PARAMS: 'warning',
        CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}',
      })
      expect(rules).toEqual({ 'max-params': ['warning', { max: 5 }] })
    })

    it('falls back to severity-only on invalid JSON options', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_PARAMS: 'warning',
        CODEFORGE_RULES_MAX_PARAMS_OPTIONS: 'not valid json',
      })
      expect(rules).toEqual({ 'max-params': 'warning' })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('skips _OPTIONS vars without base var', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_MAX_PARAMS_OPTIONS: '{"max": 5}',
      })
      expect(rules).toEqual({})
    })

    it('handles complex rule names', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NO_UNUSED_EXPRESSIONS: 'error',
      })
      expect(rules).toEqual({ 'no-unused-expressions': 'error' })
    })
  })

  describe('clearEnvVars', () => {
    it('clears all CODEFORGE_* environment variables', () => {
      process.env.CODEFORGE_FILES = 'test'
      process.env.CODEFORGE_IGNORE = 'test'
      process.env.CODEFORGE_RULES_TEST = 'error'
      process.env.OTHER_VAR = 'keep'

      clearEnvVars()

      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_TEST).toBeUndefined()
      expect(process.env.OTHER_VAR).toBe('keep')
    })

    it('handles no CODEFORGE_* vars gracefully', () => {
      expect(() => clearEnvVars()).not.toThrow()
    })
  })
})
