import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RuleSeverity } from '../../../src/rules/types.js'
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
        'no-console': 'warning',
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

    it('returns object without files when CODEFORGE_FILES is empty string', () => {
      process.env.CODEFORGE_FILES = ''
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
    })

    it('returns object without ignore when CODEFORGE_IGNORE is empty string', () => {
      process.env.CODEFORGE_IGNORE = ''
      const config = parseEnvVars()
      expect(config.ignore).toBeUndefined()
    })

    it('parses CODEFORGE_FILES with single value', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('parses CODEFORGE_FILES with trailing comma', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('parses CODEFORGE_FILES with leading comma', () => {
      process.env.CODEFORGE_FILES = ',**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
    })

    it('parses CODEFORGE_IGNORE with single value', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['node_modules'])
    })

    it('parses CODEFORGE_IGNORE with trailing comma', () => {
      process.env.CODEFORGE_IGNORE = 'node_modules,'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['node_modules'])
    })

    it('parses only CODEFORGE_FILES without ignore or rules', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toBeUndefined()
    })

    it('parses only CODEFORGE_IGNORE without files or rules', () => {
      process.env.CODEFORGE_IGNORE = 'dist/**'
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toEqual(['dist/**'])
      expect(config.rules).toBeUndefined()
    })

    it('parses only rules without files or ignore', () => {
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'warning'
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toEqual({ 'no-console': 'warning' })
    })

    it('ignores non-CODEFORGE environment variables', () => {
      process.env.NODE_ENV = 'test'
      process.env.PATH = '/usr/bin'
      process.env.HOME = '/home/user'
      const config = parseEnvVars()
      expect(config).toEqual({})
    })

    it('ignores CODEFORGE_ vars that are not FILES/IGNORE/RULES', () => {
      process.env.CODEFORGE_CUSTOM = 'value'
      process.env.CODEFORGE_DEBUG = 'true'
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toBeUndefined()
    })

    it('parses rules with info severity', () => {
      process.env.CODEFORGE_RULES_NO_DEBUGGER = 'info'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'no-debugger': 'info' })
    })

    it('parses rules with warning severity', () => {
      process.env.CODEFORGE_RULES_NO_EVAL = 'warning'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'no-eval': 'warning' })
    })

    it('handles multiple invalid severities producing multiple warnings', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.CODEFORGE_RULES_RULE_A = 'bad1'
      process.env.CODEFORGE_RULES_RULE_B = 'bad2'
      const config = parseEnvVars()
      expect(config.rules).toBeUndefined()
      expect(warnSpy).toHaveBeenCalledTimes(2)
      warnSpy.mockRestore()
    })

    it('combines files and rules without ignore', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'error'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toBeUndefined()
      expect(config.rules).toEqual({ 'no-console': 'error' })
    })

    it('combines ignore and rules without files', () => {
      process.env.CODEFORGE_IGNORE = 'vendor/**'
      process.env.CODEFORGE_RULES_NO_EVAL = 'warning'
      const config = parseEnvVars()
      expect(config.files).toBeUndefined()
      expect(config.ignore).toEqual(['vendor/**'])
      expect(config.rules).toEqual({ 'no-eval': 'warning' })
    })

    it('combines files and ignore without rules', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      process.env.CODEFORGE_IGNORE = 'test/**'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/*.ts'])
      expect(config.ignore).toEqual(['test/**'])
      expect(config.rules).toBeUndefined()
    })

    it('handles rules with options alongside files and ignore', () => {
      process.env.CODEFORGE_FILES = '**/*.ts'
      process.env.CODEFORGE_IGNORE = 'dist/**'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 10}'
      const config = parseEnvVars()
      expect(config.files).toEqual(['**/*.ts'])
      expect(config.ignore).toEqual(['dist/**'])
      expect(config.rules).toEqual({ 'max-complexity': ['error', { max: 10 }] })
    })

    it('parses all three severity types in rules', () => {
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

    it('does not include files key when not set', () => {
      process.env.CODEFORGE_IGNORE = 'dist'
      const config = parseEnvVars()
      expect(Object.keys(config)).not.toContain('files')
    })

    it('does not include ignore key when not set', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      const config = parseEnvVars()
      expect(Object.keys(config)).not.toContain('ignore')
    })

    it('does not include rules key when no valid rules set', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts'
      const config = parseEnvVars()
      expect(Object.keys(config)).not.toContain('rules')
    })

    it('handles CODEFORGE_FILES with whitespace-only value', () => {
      process.env.CODEFORGE_FILES = '   '
      const config = parseEnvVars()
      expect(config.files).toEqual([])
    })

    it('handles CODEFORGE_IGNORE with whitespace-only value', () => {
      process.env.CODEFORGE_IGNORE = '   '
      const config = parseEnvVars()
      expect(config.ignore).toEqual([])
    })

    it('returns fresh object on each call', () => {
      process.env.CODEFORGE_FILES = 'a.ts'
      const config1 = parseEnvVars()
      const config2 = parseEnvVars()
      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })

    it('parses files with complex glob patterns', () => {
      process.env.CODEFORGE_FILES = 'src/**/*.ts,!src/**/*.d.ts'
      const config = parseEnvVars()
      expect(config.files).toEqual(['src/**/*.ts', '!src/**/*.d.ts'])
    })

    it('parses ignore with complex glob patterns', () => {
      process.env.CODEFORGE_IGNORE = '**/node_modules/**,**/dist/**,**/*.spec.ts'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**', '**/*.spec.ts'])
    })

    it('handles many CODEFORGE_RULES_* at once', () => {
      process.env.CODEFORGE_RULES_RULE_A = 'error'
      process.env.CODEFORGE_RULES_RULE_B = 'warning'
      process.env.CODEFORGE_RULES_RULE_C = 'info'
      process.env.CODEFORGE_RULES_RULE_D = 'error'
      process.env.CODEFORGE_RULES_RULE_E = 'warning'
      const config = parseEnvVars()
      expect(Object.keys(config.rules ?? {})).toHaveLength(5)
    })

    it('handles CODEFORGE_FILES with spaces around commas', () => {
      process.env.CODEFORGE_FILES = ' a.ts , b.ts , c.ts '
      const config = parseEnvVars()
      expect(config.files).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    it('handles CODEFORGE_IGNORE with spaces around commas', () => {
      process.env.CODEFORGE_IGNORE = ' dist , coverage , .cache '
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['dist', 'coverage', '.cache'])
    })

    it('does not include rules when all rules have invalid severities', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.CODEFORGE_RULES_RULE_A = 'invalid'
      const config = parseEnvVars()
      expect(config.rules).toBeUndefined()
      warnSpy.mockRestore()
    })

    it('preserves valid rules when some have invalid severities', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.CODEFORGE_RULES_RULE_A = 'invalid'
      process.env.CODEFORGE_RULES_RULE_B = 'error'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'rule-b': 'error' })
      warnSpy.mockRestore()
    })

    it('handles CODEFORGE_FILES with mixed empty and valid values', () => {
      process.env.CODEFORGE_FILES = ',a.ts,,b.ts,'
      const config = parseEnvVars()
      expect(config.files).toEqual(['a.ts', 'b.ts'])
    })

    it('handles CODEFORGE_IGNORE with mixed empty and valid values', () => {
      process.env.CODEFORGE_IGNORE = ',dist,,coverage,'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['dist', 'coverage'])
    })

    it('reflects changes to env between calls', () => {
      process.env.CODEFORGE_FILES = 'a.ts'
      const config1 = parseEnvVars()
      expect(config1.files).toEqual(['a.ts'])

      process.env.CODEFORGE_FILES = 'b.ts,c.ts'
      const config2 = parseEnvVars()
      expect(config2.files).toEqual(['b.ts', 'c.ts'])
    })

    it('handles rules with options and rules without options together', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY_OPTIONS = '{"max": 20}'
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'warning'
      const config = parseEnvVars()
      expect(config.rules).toEqual({
        'max-complexity': ['error', { max: 20 }],
        'no-console': 'warning',
      })
    })

    it('handles CODEFORGE_FILES with dots and extensions', () => {
      process.env.CODEFORGE_FILES = '.ts,.tsx,.js,.jsx'
      const config = parseEnvVars()
      expect(config.files).toEqual(['.ts', '.tsx', '.js', '.jsx'])
    })

    it('handles CODEFORGE_FILES with only commas producing empty array', () => {
      process.env.CODEFORGE_FILES = ',,,'
      const config = parseEnvVars()
      expect(config.files).toEqual([])
    })

    it('handles CODEFORGE_IGNORE with only commas producing empty array', () => {
      process.env.CODEFORGE_IGNORE = ',,,'
      const config = parseEnvVars()
      expect(config.ignore).toEqual([])
    })

    it('reflects cleared rules after env var removal', () => {
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'error'
      const config1 = parseEnvVars()
      expect(config1.rules).toEqual({ 'no-console': 'error' })

      delete process.env.CODEFORGE_RULES_NO_CONSOLE
      const config2 = parseEnvVars()
      expect(config2.rules).toBeUndefined()
    })

    it('parses rules with options through parseEnvVars', () => {
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS = '{"max": 3}'
      const config = parseEnvVars()
      expect(config.rules).toEqual({ 'max-params': ['warning', { max: 3 }] })
    })

    it('handles CODEFORGE_FILES with absolute paths', () => {
      process.env.CODEFORGE_FILES = '/home/user/src/**/*.ts,/usr/local/lib/*.js'
      const config = parseEnvVars()
      expect(config.files).toEqual(['/home/user/src/**/*.ts', '/usr/local/lib/*.js'])
    })

    it('handles CODEFORGE_FILES with Windows-style paths', () => {
      process.env.CODEFORGE_FILES = 'C:\\Users\\src\\*.ts,D:\\projects\\*.js'
      const config = parseEnvVars()
      expect(config.files).toEqual(['C:\\Users\\src\\*.ts', 'D:\\projects\\*.js'])
    })

    it('handles CODEFORGE_IGNORE with relative parent paths', () => {
      process.env.CODEFORGE_IGNORE = '../dist,../../node_modules,./coverage'
      const config = parseEnvVars()
      expect(config.ignore).toEqual(['../dist', '../../node_modules', './coverage'])
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

    it('returns single-element array for value with no commas', () => {
      const result = parseArrayValue('hello')
      expect(result).toEqual(['hello'])
    })

    it('handles leading comma', () => {
      const result = parseArrayValue(',a,b')
      expect(result).toEqual(['a', 'b'])
    })

    it('handles trailing comma', () => {
      const result = parseArrayValue('a,b,')
      expect(result).toEqual(['a', 'b'])
    })

    it('handles multiple consecutive commas', () => {
      const result = parseArrayValue('a,,,,b')
      expect(result).toEqual(['a', 'b'])
    })

    it('handles tab characters', () => {
      const result = parseArrayValue('\ta\t,\tb\t')
      expect(result).toEqual(['a', 'b'])
    })

    it('handles special characters in values', () => {
      const result = parseArrayValue('@#$,%,^&')
      expect(result).toEqual(['@#$', '%', '^&'])
    })

    it('handles glob patterns with double asterisks', () => {
      const result = parseArrayValue('**/*.ts,src/**/*.js')
      expect(result).toEqual(['**/*.ts', 'src/**/*.js'])
    })

    it('handles file paths with dots and slashes', () => {
      const result = parseArrayValue('./src/file.ts,../test/file.ts')
      expect(result).toEqual(['./src/file.ts', '../test/file.ts'])
    })

    it('handles values with dashes', () => {
      const result = parseArrayValue('no-console,no-debugger')
      expect(result).toEqual(['no-console', 'no-debugger'])
    })

    it('handles values with underscores', () => {
      const result = parseArrayValue('no_unused,no_debug')
      expect(result).toEqual(['no_unused', 'no_debug'])
    })

    it('handles numeric string values', () => {
      const result = parseArrayValue('1,2,3')
      expect(result).toEqual(['1', '2', '3'])
    })

    it('handles values with equal signs', () => {
      const result = parseArrayValue('a=1,b=2')
      expect(result).toEqual(['a=1', 'b=2'])
    })

    it('handles values with colons', () => {
      const result = parseArrayValue('a:b,c:d')
      expect(result).toEqual(['a:b', 'c:d'])
    })

    it('handles values with semicolons', () => {
      const result = parseArrayValue('a;b,c;d')
      expect(result).toEqual(['a;b', 'c;d'])
    })

    it('handles values with parentheses', () => {
      const result = parseArrayValue('(a),(b)')
      expect(result).toEqual(['(a)', '(b)'])
    })

    it('handles values with brackets', () => {
      const result = parseArrayValue('[a],[b]')
      expect(result).toEqual(['[a]', '[b]'])
    })

    it('handles values with double quotes', () => {
      const result = parseArrayValue('"a","b"')
      expect(result).toEqual(['"a"', '"b"'])
    })

    it('handles values with single quotes', () => {
      const result = parseArrayValue("'a','b'")
      expect(result).toEqual(["'a'", "'b'"])
    })

    it('handles single character values', () => {
      const result = parseArrayValue('a,b,c')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('handles many comma-separated values', () => {
      const result = parseArrayValue('1,2,3,4,5,6,7,8,9,10')
      expect(result).toHaveLength(10)
      expect(result[0]).toBe('1')
      expect(result[9]).toBe('10')
    })

    it('handles unicode characters', () => {
      const result = parseArrayValue('α,β,γ')
      expect(result).toEqual(['α', 'β', 'γ'])
    })

    it('handles values with forward slashes', () => {
      const result = parseArrayValue('a/b,c/d')
      expect(result).toEqual(['a/b', 'c/d'])
    })

    it('handles values with backslashes', () => {
      const result = parseArrayValue('a\\b,c\\d')
      expect(result).toEqual(['a\\b', 'c\\d'])
    })

    it('handles negation patterns', () => {
      const result = parseArrayValue('*.ts,!*.d.ts')
      expect(result).toEqual(['*.ts', '!*.d.ts'])
    })

    it('handles brace expansion patterns', () => {
      const result = parseArrayValue('foo/*.ts,bar/*.ts')
      expect(result).toEqual(['foo/*.ts', 'bar/*.ts'])
    })

    it('handles long string value', () => {
      const longValue = 'a'.repeat(1000)
      const result = parseArrayValue(longValue)
      expect(result).toEqual([longValue])
    })

    it('handles mixed whitespace types', () => {
      const result = parseArrayValue(' a , \tb\t , c ')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('handles values with newline characters', () => {
      const result = parseArrayValue('a\n,b\n,c')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('handles values with carriage return characters', () => {
      const result = parseArrayValue('a\r,\r\nb,c\r')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('handles emoji characters', () => {
      const result = parseArrayValue('🔥,✅,🚀')
      expect(result).toEqual(['🔥', '✅', '🚀'])
    })

    it('preserves mixed case in values', () => {
      const result = parseArrayValue('CamelCase,snake_case,UPPER')
      expect(result).toEqual(['CamelCase', 'snake_case', 'UPPER'])
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

    it('returns false for capitalized Error', () => {
      expect(isValidSeverity('Error')).toBe(false)
    })

    it('returns false for capitalized Warning', () => {
      expect(isValidSeverity('Warning')).toBe(false)
    })

    it('returns false for capitalized Info', () => {
      expect(isValidSeverity('Info')).toBe(false)
    })

    it('returns false for WARNING all caps', () => {
      expect(isValidSeverity('WARNING')).toBe(false)
    })

    it('returns false for INFO all caps', () => {
      expect(isValidSeverity('INFO')).toBe(false)
    })

    it('returns false for partial err', () => {
      expect(isValidSeverity('err')).toBe(false)
    })

    it('returns false for partial warn', () => {
      expect(isValidSeverity('warn')).toBe(false)
    })

    it('returns false for partial inf', () => {
      expect(isValidSeverity('inf')).toBe(false)
    })

    it('returns false for off', () => {
      expect(isValidSeverity('off')).toBe(false)
    })

    it('returns false for on', () => {
      expect(isValidSeverity('on')).toBe(false)
    })

    it('returns false for debug', () => {
      expect(isValidSeverity('debug')).toBe(false)
    })

    it('returns false for notice', () => {
      expect(isValidSeverity('notice')).toBe(false)
    })

    it('returns false for numeric string 0', () => {
      expect(isValidSeverity('0')).toBe(false)
    })

    it('returns false for numeric string 1', () => {
      expect(isValidSeverity('1')).toBe(false)
    })

    it('returns false for numeric string 2', () => {
      expect(isValidSeverity('2')).toBe(false)
    })

    it('returns false for leading space', () => {
      expect(isValidSeverity(' error')).toBe(false)
    })

    it('returns false for trailing space', () => {
      expect(isValidSeverity('error ')).toBe(false)
    })

    it('returns false for plural errors', () => {
      expect(isValidSeverity('errors')).toBe(false)
    })

    it('returns false for plural warnings', () => {
      expect(isValidSeverity('warnings')).toBe(false)
    })

    it('returns false for plural infos', () => {
      expect(isValidSeverity('infos')).toBe(false)
    })

    it('returns false for boolean string true', () => {
      expect(isValidSeverity('true')).toBe(false)
    })

    it('returns false for boolean string false', () => {
      expect(isValidSeverity('false')).toBe(false)
    })

    it('returns false for null string', () => {
      expect(isValidSeverity('null')).toBe(false)
    })

    it('returns false for undefined string', () => {
      expect(isValidSeverity('undefined')).toBe(false)
    })

    it('narrows type correctly for error', () => {
      const value: string = 'error'
      if (isValidSeverity(value)) {
        const severity: RuleSeverity = value
        expect(severity).toBe('error')
      }
    })

    it('narrows type correctly for warning', () => {
      const value: string = 'warning'
      if (isValidSeverity(value)) {
        const severity: RuleSeverity = value
        expect(severity).toBe('warning')
      }
    })

    it('narrows type correctly for info', () => {
      const value: string = 'info'
      if (isValidSeverity(value)) {
        const severity: RuleSeverity = value
        expect(severity).toBe('info')
      }
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

    it('parses single severity error', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_TEST_RULE: 'error',
      })
      expect(rules).toEqual({ 'test-rule': 'error' })
    })

    it('parses single severity warning', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_TEST_RULE: 'warning',
      })
      expect(rules).toEqual({ 'test-rule': 'warning' })
    })

    it('parses single severity info', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_TEST_RULE: 'info',
      })
      expect(rules).toEqual({ 'test-rule': 'info' })
    })

    it('handles rule name with single segment', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NOEVAL: 'error',
      })
      expect(rules).toEqual({ noeval: 'error' })
    })

    it('handles rule name with three segments', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NO_UNUSED_VARS: 'warning',
      })
      expect(rules).toEqual({ 'no-unused-vars': 'warning' })
    })

    it('handles rule name with four segments', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NO_EXPLICIT_ANY_TYPE: 'error',
      })
      expect(rules).toEqual({ 'no-explicit-any-type': 'error' })
    })

    it('handles rule name with numbers', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_MAX2_PARAMS: 'warning',
      })
      expect(rules).toEqual({ 'max2-params': 'warning' })
    })

    it('handles all-lowercase single-word rule name', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_TODO: 'info',
      })
      expect(rules).toEqual({ todo: 'info' })
    })

    it('parses options with nested object', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_IMPORT_ORDER: 'error',
        CODEFORGE_RULES_IMPORT_ORDER_OPTIONS: '{"groups": [["a","b"]],"newlinesBetween": "always"}',
      })
      expect(rules).toEqual({
        'import-order': ['error', { groups: [['a', 'b']], newlinesBetween: 'always' }],
      })
    })

    it('parses options with array value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_CUSTOM_RULE: 'warning',
        CODEFORGE_RULES_CUSTOM_RULE_OPTIONS: '[1, 2, 3]',
      })
      expect(rules).toEqual({ 'custom-rule': ['warning', [1, 2, 3]] })
    })

    it('parses options with string value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NAMING: 'error',
        CODEFORGE_RULES_NAMING_OPTIONS: '"camelCase"',
      })
      expect(rules).toEqual({ naming: ['error', 'camelCase'] })
    })

    it('parses options with number value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_LIMIT: 'warning',
        CODEFORGE_RULES_LIMIT_OPTIONS: '42',
      })
      expect(rules).toEqual({ limit: ['warning', 42] })
    })

    it('parses options with boolean true value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_STRICT: 'error',
        CODEFORGE_RULES_STRICT_OPTIONS: 'true',
      })
      expect(rules).toEqual({ strict: ['error', true] })
    })

    it('parses options with boolean false value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_STRICT: 'error',
        CODEFORGE_RULES_STRICT_OPTIONS: 'false',
      })
      expect(rules).toEqual({ strict: ['error', false] })
    })

    it('parses options with null value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_OPTIONAL: 'warning',
        CODEFORGE_RULES_OPTIONAL_OPTIONS: 'null',
      })
      expect(rules).toEqual({ optional: ['warning', null] })
    })

    it('parses options with empty object', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{}',
      })
      expect(rules).toEqual({ 'rule-a': ['error', {}] })
    })

    it('parses options with empty array', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'warning',
        CODEFORGE_RULES_RULE_A_OPTIONS: '[]',
      })
      expect(rules).toEqual({ 'rule-a': ['warning', []] })
    })

    it('parses multiple rules each with options', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"x": 1}',
        CODEFORGE_RULES_RULE_B: 'warning',
        CODEFORGE_RULES_RULE_B_OPTIONS: '{"y": 2}',
      })
      expect(rules).toEqual({
        'rule-a': ['error', { x: 1 }],
        'rule-b': ['warning', { y: 2 }],
      })
    })

    it('handles mix of rules with and without options', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"x": 1}',
        CODEFORGE_RULES_RULE_B: 'warning',
      })
      expect(rules).toEqual({
        'rule-a': ['error', { x: 1 }],
        'rule-b': 'warning',
      })
    })

    it('handles invalid JSON with unbalanced brackets', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"key": "value"',
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('handles invalid JSON with trailing comma', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"key": "value",}',
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('handles invalid JSON with single quotes', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: "{'key': 'value'}",
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('handles OPTIONS key with empty string value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '',
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
    })

    it('handles OPTIONS key with undefined value', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: undefined,
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
    })

    it('skips empty string severity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: '',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('skips undefined severity', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: undefined,
      })
      expect(rules).toEqual({})
    })

    it('skips whitespace-only severity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: '   ',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('skips uppercase severity ERROR', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'ERROR',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('skips capitalized severity Error', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'Error',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('skips numeric string severity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: '2',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('warns with key name for invalid severity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      parseRulesFromEnv({
        CODEFORGE_RULES_MY_RULE: 'bad',
      })
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('CODEFORGE_RULES_MY_RULE'))
      warnSpy.mockRestore()
    })

    it('warns with severity value for invalid severity', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      parseRulesFromEnv({
        CODEFORGE_RULES_MY_RULE: 'terrible',
      })
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('terrible'))
      warnSpy.mockRestore()
    })

    it('ignores non-CODEFORGE_RULES_ keys', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_FILES: '**/*.ts',
        CODEFORGE_IGNORE: 'dist',
        OTHER_VAR: 'value',
      })
      expect(rules).toEqual({})
    })

    it('ignores OPTIONS key without matching base var', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"max": 10}',
      })
      expect(rules).toEqual({})
    })

    it('handles env with many keys but none matching RULES prefix', () => {
      const rules = parseRulesFromEnv({
        HOME: '/home/user',
        PATH: '/usr/bin',
        NODE_ENV: 'test',
        CODEFORGE_FILES: '**/*.ts',
      })
      expect(rules).toEqual({})
    })

    it('preserves valid rules when some are invalid', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_VALID_RULE: 'error',
        CODEFORGE_RULES_INVALID_RULE: 'bad',
      })
      expect(rules).toEqual({ 'valid-rule': 'error' })
      warnSpy.mockRestore()
    })

    it('handles OPTIONS with invalid severity on base var', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'bad',
        CODEFORGE_RULES_RULE_A_OPTIONS: '{"max": 10}',
      })
      expect(rules).toEqual({})
      warnSpy.mockRestore()
    })

    it('handles deeply nested JSON options', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_COMPLEX: 'error',
        CODEFORGE_RULES_COMPLEX_OPTIONS: '{"level1": {"level2": {"level3": "deep"}}}',
      })
      expect(rules).toEqual({
        complex: ['error', { level1: { level2: { level3: 'deep' } } }],
      })
    })

    it('handles JSON options with array of objects', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'warning',
        CODEFORGE_RULES_RULE_A_OPTIONS: '[{"id": 1}, {"id": 2}]',
      })
      expect(rules).toEqual({ 'rule-a': ['warning', [{ id: 1 }, { id: 2 }]] })
    })

    it('handles JSON options that are just a JSON string', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '"just a string"',
      })
      expect(rules).toEqual({ 'rule-a': ['error', 'just a string'] })
    })

    it('handles JSON options that are a number', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'info',
        CODEFORGE_RULES_RULE_A_OPTIONS: '3.14',
      })
      expect(rules).toEqual({ 'rule-a': ['info', 3.14] })
    })

    it('produces multiple warnings for multiple invalid rules', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'bad1',
        CODEFORGE_RULES_RULE_B: 'bad2',
        CODEFORGE_RULES_RULE_C: 'bad3',
      })
      expect(warnSpy).toHaveBeenCalledTimes(3)
      warnSpy.mockRestore()
    })

    it('handles OPTIONS key exactly equal to CODEFORGE_RULES_ with _OPTIONS', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES__OPTIONS: 'error',
      })
      expect(rules).toEqual({})
    })

    it('handles single-letter rule name', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_A: 'error',
      })
      expect(rules).toEqual({ a: 'error' })
    })

    it('handles two-letter rule name', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_A_B: 'warning',
      })
      expect(rules).toEqual({ 'a-b': 'warning' })
    })

    it('handles rule name that is already lowercase', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_todo: 'info',
      })
      expect(rules).toEqual({ todo: 'info' })
    })

    it('handles rule name with mixed case', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NoConsole_Log: 'error',
      })
      expect(rules).toEqual({ 'noconsole-log': 'error' })
    })

    it('returns same result regardless of key order', () => {
      const env1 = {
        CODEFORGE_RULES_A: 'error',
        CODEFORGE_RULES_B: 'warning',
      }
      const env2 = {
        CODEFORGE_RULES_B: 'warning',
        CODEFORGE_RULES_A: 'error',
      }
      expect(parseRulesFromEnv(env1)).toEqual(parseRulesFromEnv(env2))
    })

    it('handles env with only non-RULES CODEFORGE_ keys', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_FILES: '**/*.ts',
        CODEFORGE_IGNORE: 'dist',
        CODEFORGE_CUSTOM: 'value',
      })
      expect(rules).toEqual({})
    })

    it('warns about invalid JSON in OPTIONS with key name', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      parseRulesFromEnv({
        CODEFORGE_RULES_MY_RULE: 'error',
        CODEFORGE_RULES_MY_RULE_OPTIONS: '{invalid}',
      })
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('CODEFORGE_RULES_MY_RULE_OPTIONS'),
      )
      warnSpy.mockRestore()
    })

    it('handles OPTIONS with whitespace-only string as invalid JSON', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '   ',
      })
      expect(rules).toEqual({ 'rule-a': 'error' })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('handles OPTIONS with negative number', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'warning',
        CODEFORGE_RULES_RULE_A_OPTIONS: '-42',
      })
      expect(rules).toEqual({ 'rule-a': ['warning', -42] })
    })

    it('handles OPTIONS with zero', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'info',
        CODEFORGE_RULES_RULE_A_OPTIONS: '0',
      })
      expect(rules).toEqual({ 'rule-a': ['info', 0] })
    })

    it('handles rule name with consecutive underscores', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_NO__UNUSED: 'error',
      })
      expect(rules).toEqual({ 'no--unused': 'error' })
    })

    it('handles OPTIONS with deeply nested JSON arrays', () => {
      const rules = parseRulesFromEnv({
        CODEFORGE_RULES_RULE_A: 'error',
        CODEFORGE_RULES_RULE_A_OPTIONS: '[[1, 2], [3, [4, 5]]]',
      })
      expect(rules).toEqual({
        'rule-a': [
          'error',
          [
            [1, 2],
            [3, [4, 5]],
          ],
        ],
      })
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

    it('is safe to call multiple times in sequence', () => {
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      clearEnvVars()
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('clears CODEFORGE_FILES only', () => {
      process.env.CODEFORGE_FILES = 'test'
      process.env.OTHER_VAR = 'keep'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      expect(process.env.OTHER_VAR).toBe('keep')
    })

    it('clears CODEFORGE_IGNORE only', () => {
      process.env.CODEFORGE_IGNORE = 'test'
      process.env.OTHER_VAR = 'keep'
      clearEnvVars()
      expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
      expect(process.env.OTHER_VAR).toBe('keep')
    })

    it('clears CODEFORGE_RULES_* vars', () => {
      process.env.CODEFORGE_RULES_MAX_COMPLEXITY = 'error'
      process.env.CODEFORGE_RULES_NO_CONSOLE = 'warning'
      clearEnvVars()
      expect(process.env.CODEFORGE_RULES_MAX_COMPLEXITY).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_NO_CONSOLE).toBeUndefined()
    })

    it('clears custom CODEFORGE_ prefixed vars', () => {
      process.env.CODEFORGE_CUSTOM_VAR = 'value'
      process.env.CODEFORGE_ANOTHER = 'test'
      clearEnvVars()
      expect(process.env.CODEFORGE_CUSTOM_VAR).toBeUndefined()
      expect(process.env.CODEFORGE_ANOTHER).toBeUndefined()
    })

    it('preserves NODE_ENV', () => {
      process.env.NODE_ENV = 'test'
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect(process.env.NODE_ENV).toBe('test')
    })

    it('preserves PATH', () => {
      const pathValue = process.env.PATH
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect(process.env.PATH).toBe(pathValue)
    })

    it('preserves HOME', () => {
      const homeValue = process.env.HOME
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect(process.env.HOME).toBe(homeValue)
    })

    it('allows re-setting vars after clearing', () => {
      process.env.CODEFORGE_FILES = 'first'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      process.env.CODEFORGE_FILES = 'second'
      expect(process.env.CODEFORGE_FILES).toBe('second')
    })

    it('clears many CODEFORGE_ vars at once', () => {
      process.env.CODEFORGE_FILES = 'a'
      process.env.CODEFORGE_IGNORE = 'b'
      process.env.CODEFORGE_RULES_X = 'c'
      process.env.CODEFORGE_RULES_Y = 'd'
      process.env.CODEFORGE_RULES_Z = 'e'
      process.env.CODEFORGE_CUSTOM = 'f'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_X).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_Y).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_Z).toBeUndefined()
      expect(process.env.CODEFORGE_CUSTOM).toBeUndefined()
    })

    it('clears vars with special characters in values', () => {
      process.env.CODEFORGE_FILES = '**/*.ts,{foo,bar},!*.d.ts'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('clears vars set to empty string', () => {
      process.env.CODEFORGE_FILES = ''
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('clears CODEFORGE_RULES_*_OPTIONS vars', () => {
      process.env.CODEFORGE_RULES_MAX_PARAMS = 'warning'
      process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS = '{"max": 5}'
      clearEnvVars()
      expect(process.env.CODEFORGE_RULES_MAX_PARAMS).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_MAX_PARAMS_OPTIONS).toBeUndefined()
    })

    it('does not affect vars without CODEFORGE_ prefix', () => {
      process.env.MY_APP_CONFIG = 'value'
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect(process.env.MY_APP_CONFIG).toBe('value')
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('handles var names that start with CODEFORGE but lack underscore', () => {
      process.env.CODEFORGEFILE = 'not-a-codeforge-var'
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect((process.env as Record<string, string | undefined>).CODEFORGEFILE).toBe(
        'not-a-codeforge-var',
      )
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('clears var with very long value', () => {
      process.env.CODEFORGE_FILES = 'x'.repeat(10000)
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('does not clear vars that contain CODEFORGE in the middle', () => {
      process.env.MY_CODEFORGE_CONFIG = 'keep'
      process.env.CODEFORGE_FILES = 'test'
      clearEnvVars()
      expect((process.env as Record<string, string | undefined>).MY_CODEFORGE_CONFIG).toBe('keep')
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })

    it('clears many vars mixed with non-CODEFORGE vars', () => {
      process.env.CODEFORGE_FILES = 'a'
      process.env.APP_DEBUG = 'true'
      process.env.CODEFORGE_RULES_X = 'error'
      process.env.APP_MODE = 'dev'
      process.env.CODEFORGE_IGNORE = 'b'
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
      expect(process.env.CODEFORGE_RULES_X).toBeUndefined()
      expect(process.env.CODEFORGE_IGNORE).toBeUndefined()
      expect(process.env.APP_DEBUG).toBe('true')
      expect(process.env.APP_MODE).toBe('dev')
    })

    it('clears vars set to whitespace-only values', () => {
      process.env.CODEFORGE_FILES = '   '
      clearEnvVars()
      expect(process.env.CODEFORGE_FILES).toBeUndefined()
    })
  })
})
