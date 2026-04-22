import { describe, test, expect } from 'vitest'
import { validateConfig } from '../../../src/config/validator'
import { CLIError } from '../../../src/utils/errors'

describe('validateConfig', () => {
  describe('valid configs', () => {
    test('accepts valid empty config', () => {
      const config = {}
      const result = validateConfig(config)
      expect(result).toEqual({})
    })

    test('accepts valid rules config', () => {
      const config = {
        rules: {
          'max-complexity': 'error',
          'no-eval': 'warning',
          'prefer-const': 'info',
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'max-complexity': 'error',
        'no-eval': 'warning',
        'prefer-const': 'info',
      })
    })

    test('accepts rules with options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', { max: 15 }],
          'max-lines': ['warning', { max: 500 }],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'max-complexity': ['error', { max: 15 }],
        'max-lines': ['warning', { max: 500 }],
      })
    })

    test('accepts rules with empty options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', {}],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'max-complexity': ['error', {}],
      })
    })

    test('accepts valid files array', () => {
      const config = {
        files: ['src/**/*.ts', 'lib/**/*.js', '**/*.tsx'],
      }
      const result = validateConfig(config)
      expect(result.files).toEqual(['src/**/*.ts', 'lib/**/*.js', '**/*.tsx'])
    })

    test('accepts valid ignore array', () => {
      const config = {
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(['node_modules/**', 'dist/**', 'coverage/**'])
    })

    test('accepts empty files array', () => {
      const config = { files: [] }
      const result = validateConfig(config)
      expect(result.files).toEqual([])
    })

    test('accepts empty ignore array', () => {
      const config = { ignore: [] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual([])
    })

    test('accepts complete valid config', () => {
      const config = {
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
        rules: {
          'max-complexity': ['error', { max: 10 }],
          'no-eval': 'error',
        },
      }
      const result = validateConfig(config)
      expect(result).toEqual(config)
    })
  })

  describe('rejects invalid config types', () => {
    test('rejects non-object config (null)', () => {
      expect(() => validateConfig(null)).toThrowCLIError('E003')
    })

    test('rejects non-object config (string)', () => {
      expect(() => validateConfig('config')).toThrowCLIError('E003')
    })

    test('rejects non-object config (number)', () => {
      expect(() => validateConfig(123)).toThrowCLIError('E003')
    })

    test('rejects array config', () => {
      expect(() => validateConfig(['error'])).toThrowCLIError('E003')
    })

    test('rejects boolean config (true)', () => {
      expect(() => validateConfig(true)).toThrowCLIError('E003')
    })

    test('rejects boolean config (false)', () => {
      expect(() => validateConfig(false)).toThrowCLIError('E003')
    })

    test('rejects undefined config', () => {
      expect(() => validateConfig(undefined)).toThrowCLIError('E003')
    })

    test('rejects function as config', () => {
      expect(() => validateConfig(() => {})).toThrowCLIError('E003')
    })

    test('accepts Number object as config (treated as empty object)', () => {
      const result = validateConfig(new Number(1))
      expect(result).toEqual({})
    })

    test('accepts String object as config (treated as empty object)', () => {
      const result = validateConfig(new String('config'))
      expect(result).toEqual({})
    })

    test('accepts Date object as config (treated as empty object)', () => {
      const result = validateConfig(new Date())
      expect(result).toEqual({})
    })

    test('accepts RegExp as config (treated as empty object)', () => {
      const result = validateConfig(/test/)
      expect(result).toEqual({})
    })

    test('accepts Map as config (treated as empty object)', () => {
      const result = validateConfig(new Map())
      expect(result).toEqual({})
    })

    test('accepts Set as config (treated as empty object)', () => {
      const result = validateConfig(new Set())
      expect(result).toEqual({})
    })
  })

  describe('rejects invalid severity', () => {
    test('rejects invalid severity string', () => {
      const config = {
        rules: {
          'max-complexity': 'critical',
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects invalid severity in array', () => {
      const config = {
        rules: {
          'max-complexity': ['fatal', { max: 10 }],
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "off"', () => {
      const config = { rules: { 'max-complexity': 'off' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "Error" (case sensitive)', () => {
      const config = { rules: { 'max-complexity': 'Error' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "WARNING" (uppercase)', () => {
      const config = { rules: { 'max-complexity': 'WARNING' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects empty string as severity', () => {
      const config = { rules: { 'max-complexity': '' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "off" in array form', () => {
      const config = { rules: { 'max-complexity': ['off', { max: 10 }] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "ERROR" (all caps)', () => {
      const config = { rules: { r: 'ERROR' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "Warning" (capitalized)', () => {
      const config = { rules: { r: 'Warning' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "Info" (capitalized)', () => {
      const config = { rules: { r: 'Info' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "err" (partial)', () => {
      const config = { rules: { r: 'err' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "warn" (partial)', () => {
      const config = { rules: { r: 'warn' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "information" (full word)', () => {
      const config = { rules: { r: 'information' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity with leading whitespace', () => {
      const config = { rules: { r: ' error' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity with trailing whitespace', () => {
      const config = { rules: { r: 'error ' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "ERROR" in array form', () => {
      const config = { rules: { r: ['ERROR'] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects severity "Off" in array form', () => {
      const config = { rules: { r: ['Off', {}] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })
  })

  describe('rejects invalid rule config type', () => {
    test('rejects number rule config', () => {
      const config = {
        rules: {
          'max-complexity': 1,
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects object rule config', () => {
      const config = {
        rules: {
          'max-complexity': { severity: 'error' },
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null rule config', () => {
      const config = {
        rules: {
          'max-complexity': null,
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array with wrong length (empty)', () => {
      const config = {
        rules: {
          'max-complexity': [],
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array with wrong length (too many)', () => {
      const config = {
        rules: {
          'max-complexity': ['error', { max: 10 }, 'extra'],
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects non-string severity in array', () => {
      const config = {
        rules: {
          'max-complexity': [1, { max: 10 }],
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', [1, 2, 3]],
        },
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean true rule config', () => {
      const config = { rules: { 'max-complexity': true } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean false rule config', () => {
      const config = { rules: { 'max-complexity': false } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null options in rule array', () => {
      const config = { rules: { 'max-complexity': ['error', null] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects number options in rule array', () => {
      const config = { rules: { 'max-complexity': ['error', 42] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects string options in rule array', () => {
      const config = { rules: { 'max-complexity': ['error', 'opts'] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean options in rule array', () => {
      const config = { rules: { 'max-complexity': ['error', true] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array with 4 elements', () => {
      const config = { rules: { 'my-rule': ['error', {}, 'extra', 'item'] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array with 5 elements', () => {
      const config = { rules: { 'my-rule': ['error', {}, 1, 2, 3] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean true as severity in array', () => {
      const config = { rules: { 'my-rule': [true] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean false as severity in array', () => {
      const config = { rules: { 'my-rule': [false] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects number as severity in array', () => {
      const config = { rules: { 'my-rule': [0] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null as severity in array', () => {
      const config = { rules: { 'my-rule': [null] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects object as severity in array', () => {
      const config = { rules: { 'my-rule': [{ severity: 'error' }] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects array as severity in array', () => {
      const config = { rules: { 'my-rule': [['error']] } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('accepts Date object as rule options (treated as valid object)', () => {
      const config = { rules: { r: ['error', new Date()] } }
      const result = validateConfig(config)
      expect(result.rules).toBeDefined()
    })

    test('accepts RegExp as rule options (treated as valid object)', () => {
      const config = { rules: { r: ['error', /pattern/] } }
      const result = validateConfig(config)
      expect(result.rules).toBeDefined()
    })
  })

  describe('rejects invalid files', () => {
    test('rejects non-array files', () => {
      const config = {
        files: 'src/**/*.ts',
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects non-string in files array (number)', () => {
      const config = {
        files: ['src/**/*.ts', 123],
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects non-string in files array (object)', () => {
      const config = {
        files: ['src/**/*.ts', { pattern: 'lib/**/*.js' }],
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects non-string in files array (null)', () => {
      const config = {
        files: ['src/**/*.ts', null],
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects number as files value', () => {
      const config = { files: 42 }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean as files value', () => {
      const config = { files: true }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects object as files value', () => {
      const config = { files: { pattern: 'src/**/*.ts' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null as files value', () => {
      const config = { files: null }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean element in files array', () => {
      const config = { files: [true] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects undefined element in files array', () => {
      const config = { files: [undefined] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects function element in files array', () => {
      const config = { files: [() => 'test'] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })
  })

  describe('rejects invalid ignore', () => {
    test('rejects non-array ignore', () => {
      const config = {
        ignore: 'node_modules/**',
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects non-string in ignore array', () => {
      const config = {
        ignore: ['node_modules/**', 456],
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects number as ignore value', () => {
      const config = { ignore: 42 }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean as ignore value', () => {
      const config = { ignore: false }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects object as ignore value', () => {
      const config = { ignore: { pattern: 'node_modules/**' } }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null as ignore value', () => {
      const config = { ignore: null }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects object element in ignore array', () => {
      const config = { ignore: [{ pattern: 'node_modules/**' }] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null element in ignore array', () => {
      const config = { ignore: [null] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean element in ignore array', () => {
      const config = { ignore: [false] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects function element in ignore array', () => {
      const config = { ignore: [() => 'test'] }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })
  })

  describe('rejects invalid rules type', () => {
    test('rejects array rules', () => {
      const config = {
        rules: ['error', 'warning'],
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects null rules', () => {
      const config = {
        rules: null,
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects string rules', () => {
      const config = {
        rules: 'error',
      }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects number rules', () => {
      const config = { rules: 42 }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('rejects boolean rules', () => {
      const config = { rules: true }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })
  })

  describe('valid rules edge cases', () => {
    test('accepts single-element rule array (severity only)', () => {
      const config = {
        rules: {
          'max-complexity': ['error'],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'max-complexity': ['error'] })
    })

    test('accepts empty rules object', () => {
      const config = { rules: {} }
      const result = validateConfig(config)
      expect(result.rules).toEqual({})
    })

    test('accepts rules with deeply nested options', () => {
      const config = {
        rules: {
          'max-complexity': ['error', { max: 10, thresholds: { warn: 8, info: 5 } }],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'max-complexity': ['error', { max: 10, thresholds: { warn: 8, info: 5 } }],
      })
    })

    test('accepts multiple rules mixing string and array styles', () => {
      const config = {
        rules: {
          'max-complexity': 'error',
          'no-eval': ['warning'],
          'prefer-const': ['info', { destructuring: 'all' }],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'max-complexity': 'error',
        'no-eval': ['warning'],
        'prefer-const': ['info', { destructuring: 'all' }],
      })
    })

    test('accepts rule with warning severity', () => {
      const config = { rules: { 'no-eval': 'warning' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'no-eval': 'warning' })
    })

    test('accepts rule with info severity', () => {
      const config = { rules: { 'prefer-const': 'info' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'prefer-const': 'info' })
    })

    test('accepts rule with all three valid severities as strings', () => {
      const config = {
        rules: {
          'rule-a': 'error',
          'rule-b': 'warning',
          'rule-c': 'info',
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'rule-a': 'error',
        'rule-b': 'warning',
        'rule-c': 'info',
      })
    })

    test('accepts rule array with undefined as second element', () => {
      const config = { rules: { 'max-complexity': ['error', undefined] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'max-complexity': ['error', undefined] })
    })

    test('accepts severity error in single-element array', () => {
      const config = { rules: { 'my-rule': ['error'] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'my-rule': ['error'] })
    })

    test('accepts severity warning in single-element array', () => {
      const config = { rules: { 'my-rule': ['warning'] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'my-rule': ['warning'] })
    })

    test('accepts severity info in single-element array', () => {
      const config = { rules: { 'my-rule': ['info'] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'my-rule': ['info'] })
    })
  })

  describe('valid severity in both string and array forms for each level', () => {
    test('"error" as string', () => {
      expect(validateConfig({ rules: { r: 'error' } }).rules).toEqual({ r: 'error' })
    })

    test('"error" in single-element array', () => {
      expect(validateConfig({ rules: { r: ['error'] } }).rules).toEqual({ r: ['error'] })
    })

    test('"error" in two-element array with options', () => {
      expect(validateConfig({ rules: { r: ['error', {}] } }).rules).toEqual({ r: ['error', {}] })
    })

    test('"warning" as string', () => {
      expect(validateConfig({ rules: { r: 'warning' } }).rules).toEqual({ r: 'warning' })
    })

    test('"warning" in single-element array', () => {
      expect(validateConfig({ rules: { r: ['warning'] } }).rules).toEqual({ r: ['warning'] })
    })

    test('"warning" in two-element array with options', () => {
      expect(validateConfig({ rules: { r: ['warning', {}] } }).rules).toEqual({
        r: ['warning', {}],
      })
    })

    test('"info" as string', () => {
      expect(validateConfig({ rules: { r: 'info' } }).rules).toEqual({ r: 'info' })
    })

    test('"info" in single-element array', () => {
      expect(validateConfig({ rules: { r: ['info'] } }).rules).toEqual({ r: ['info'] })
    })

    test('"info" in two-element array with options', () => {
      expect(validateConfig({ rules: { r: ['info', {}] } }).rules).toEqual({ r: ['info', {}] })
    })
  })

  describe('valid config combinations', () => {
    test('accepts config with only files field', () => {
      const config = { files: ['src/**/*.ts'] }
      const result = validateConfig(config)
      expect(result).toEqual({ files: ['src/**/*.ts'] })
      expect(result).not.toHaveProperty('rules')
      expect(result).not.toHaveProperty('ignore')
    })

    test('accepts config with only ignore field', () => {
      const config = { ignore: ['dist/**'] }
      const result = validateConfig(config)
      expect(result).toEqual({ ignore: ['dist/**'] })
      expect(result).not.toHaveProperty('files')
      expect(result).not.toHaveProperty('rules')
    })

    test('accepts config with only rules field', () => {
      const config = { rules: { 'no-eval': 'error' } }
      const result = validateConfig(config)
      expect(result).toEqual({ rules: { 'no-eval': 'error' } })
      expect(result).not.toHaveProperty('files')
      expect(result).not.toHaveProperty('ignore')
    })

    test('ignores unknown config properties', () => {
      const config = {
        files: ['src/**/*.ts'],
        unknownProp: 'should be ignored',
        anotherExtra: 42,
      }
      const result = validateConfig(config)
      expect(result).toEqual({ files: ['src/**/*.ts'] })
      expect(result).not.toHaveProperty('unknownProp')
      expect(result).not.toHaveProperty('anotherExtra')
    })

    test('accepts files and ignore together', () => {
      const config = {
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
      }
      const result = validateConfig(config)
      expect(result).toEqual({ files: ['src/**/*.ts'], ignore: ['node_modules/**'] })
    })

    test('accepts files and rules together', () => {
      const config = {
        files: ['src/**/*.ts'],
        rules: { 'no-eval': 'error' },
      }
      const result = validateConfig(config)
      expect(result).toEqual({ files: ['src/**/*.ts'], rules: { 'no-eval': 'error' } })
      expect(result).not.toHaveProperty('ignore')
    })

    test('accepts ignore and rules together', () => {
      const config = {
        ignore: ['dist/**'],
        rules: { 'max-complexity': 'warning' },
      }
      const result = validateConfig(config)
      expect(result).toEqual({ ignore: ['dist/**'], rules: { 'max-complexity': 'warning' } })
      expect(result).not.toHaveProperty('files')
    })

    test('returns empty object when only unknown props provided', () => {
      const config = { foo: 'bar', baz: 42 }
      const result = validateConfig(config)
      expect(result).toEqual({})
    })

    test('strips unknown props but keeps valid ones', () => {
      const config = {
        rules: { 'no-eval': 'error' },
        extra: true,
      }
      const result = validateConfig(config)
      expect(result).toEqual({ rules: { 'no-eval': 'error' } })
      expect(result).not.toHaveProperty('extra')
    })

    test('plugins field is ignored (not in validator)', () => {
      const config = {
        files: ['src/**/*.ts'],
        plugins: ['plugin-a', 'plugin-b'],
      }
      const result = validateConfig(config)
      expect(result).toEqual({ files: ['src/**/*.ts'] })
      expect(result).not.toHaveProperty('plugins')
    })

    test('plugins field is stripped alongside valid fields', () => {
      const config = {
        files: ['src/**/*.ts'],
        ignore: ['dist/**'],
        plugins: ['my-plugin'],
        rules: { 'no-eval': 'error' },
      }
      const result = validateConfig(config)
      expect(result).toEqual({
        files: ['src/**/*.ts'],
        ignore: ['dist/**'],
        rules: { 'no-eval': 'error' },
      })
      expect(result).not.toHaveProperty('plugins')
    })

    test('config with only plugins returns empty object', () => {
      const config = { plugins: ['plugin'] }
      const result = validateConfig(config)
      expect(result).toEqual({})
    })

    test('strips unknown props from complete config', () => {
      const config = {
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'error' },
        extends: 'recommended',
        env: { browser: true },
        parser: 'typescript',
      }
      const result = validateConfig(config)
      expect(result).toEqual({
        files: ['src/**/*.ts'],
        ignore: ['node_modules/**'],
        rules: { 'no-eval': 'error' },
      })
      expect(result).not.toHaveProperty('extends')
      expect(result).not.toHaveProperty('env')
      expect(result).not.toHaveProperty('parser')
    })
  })

  describe('rule names with various formats', () => {
    test('accepts rule name with underscores', () => {
      const config = { rules: { no_eval: 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ no_eval: 'error' })
    })

    test('accepts rule name with dots', () => {
      const config = { rules: { 'security.no-eval': 'warning' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'security.no-eval': 'warning' })
    })

    test('accepts rule name with colons', () => {
      const config = { rules: { 'plugin:rule': 'info' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'plugin:rule': 'info' })
    })

    test('accepts rule name with slashes', () => {
      const config = { rules: { 'core/security': 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'core/security': 'error' })
    })

    test('accepts rule name with @ symbol', () => {
      const config = { rules: { '@org/plugin-rule': 'warning' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ '@org/plugin-rule': 'warning' })
    })

    test('accepts rule name with numbers', () => {
      const config = { rules: { 'rule-123': 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'rule-123': 'error' })
    })

    test('accepts rule name that is a single character', () => {
      const config = { rules: { r: 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ r: 'error' })
    })

    test('accepts rule name that is empty string', () => {
      const config = { rules: { '': 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ '': 'error' })
    })

    test('accepts rule name with unicode characters', () => {
      const config = { rules: { ルール: 'warning' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ ルール: 'warning' })
    })

    test('error for invalid rule type includes the special rule name', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { '@scope/my-rule': 42 } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('@scope/my-rule')
    })

    test('error for invalid severity includes the special rule name', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'plugin:rule': 'bad' } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('plugin:rule')
    })
  })

  describe('valid files and ignore patterns', () => {
    test('accepts files with single element', () => {
      const config = { files: ['*.ts'] }
      const result = validateConfig(config)
      expect(result.files).toEqual(['*.ts'])
    })

    test('accepts ignore with single element', () => {
      const config = { ignore: ['*.spec.ts'] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(['*.spec.ts'])
    })

    test('accepts files with complex glob patterns', () => {
      const config = { files: ['src/**/{index,main}.ts', '!**/*.d.ts'] }
      const result = validateConfig(config)
      expect(result.files).toEqual(['src/**/{index,main}.ts', '!**/*.d.ts'])
    })

    test('accepts ignore with complex glob patterns', () => {
      const config = { ignore: ['**/fixtures/**', 'temp_*'] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(['**/fixtures/**', 'temp_*'])
    })

    test('accepts files with empty string pattern', () => {
      const config = { files: [''] }
      const result = validateConfig(config)
      expect(result.files).toEqual([''])
    })

    test('accepts ignore with empty string pattern', () => {
      const config = { ignore: [''] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual([''])
    })

    test('accepts files with unicode patterns', () => {
      const config = { files: ['src/文件/**/*.ts'] }
      const result = validateConfig(config)
      expect(result.files).toEqual(['src/文件/**/*.ts'])
    })

    test('accepts ignore with unicode patterns', () => {
      const config = { ignore: ['数据/**'] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(['数据/**'])
    })

    test('accepts files with many patterns', () => {
      const patterns = Array.from({ length: 50 }, (_, i) => `dir${i}/**/*.ts`)
      const config = { files: patterns }
      const result = validateConfig(config)
      expect(result.files).toEqual(patterns)
      expect(result.files).toHaveLength(50)
    })

    test('accepts ignore with many patterns', () => {
      const patterns = Array.from({ length: 50 }, (_, i) => `ignore${i}/**`)
      const config = { ignore: patterns }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(patterns)
      expect(result.ignore).toHaveLength(50)
    })
  })

  describe('valid rules with various option shapes', () => {
    test('accepts rule with numeric option values', () => {
      const config = {
        rules: { 'max-lines': ['error', { max: 500 }] },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'max-lines': ['error', { max: 500 }] })
    })

    test('accepts rule with string option values', () => {
      const config = {
        rules: { 'naming-convention': ['warning', { format: 'camelCase' }] },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'naming-convention': ['warning', { format: 'camelCase' }] })
    })

    test('accepts rule with boolean option values', () => {
      const config = {
        rules: { 'strict-mode': ['info', { enforce: true }] },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'strict-mode': ['info', { enforce: true }] })
    })

    test('accepts rule with array option values', () => {
      const config = {
        rules: { 'import-whitelist': ['error', { patterns: ['@org/*', 'lodash'] }] },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'import-whitelist': ['error', { patterns: ['@org/*', 'lodash'] }],
      })
    })

    test('accepts rule with mixed option value types', () => {
      const config = {
        rules: {
          'complex-rule': ['warning', { count: 5, name: 'test', active: false, items: [1, 2] }],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        'complex-rule': ['warning', { count: 5, name: 'test', active: false, items: [1, 2] }],
      })
    })

    test('accepts options with many properties', () => {
      const opts: Record<string, number> = {}
      for (let i = 0; i < 20; i++) {
        opts[`prop${i}`] = i
      }
      const config = { rules: { 'my-rule': ['error', opts] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ 'my-rule': ['error', opts] })
    })

    test('accepts options with nested arrays', () => {
      const config = { rules: { r: ['error', { list: [1, 2, 3] }] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ r: ['error', { list: [1, 2, 3] }] })
    })

    test('accepts options with deeply nested objects', () => {
      const config = {
        rules: {
          r: ['error', { level1: { level2: { level3: { value: 'deep' } } } }],
        },
      }
      const result = validateConfig(config)
      expect(result.rules).toEqual({
        r: ['error', { level1: { level2: { level3: { value: 'deep' } } } }],
      })
    })

    test('accepts options with null values inside object', () => {
      const config = { rules: { r: ['error', { value: null }] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ r: ['error', { value: null }] })
    })

    test('accepts options with undefined values inside object', () => {
      const config = { rules: { r: ['error', { value: undefined }] } }
      const result = validateConfig(config)
      expect(result.rules).toEqual({ r: ['error', { value: undefined }] })
    })
  })

  describe('error messages for files array elements include index', () => {
    test('error for invalid files[1] includes index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: ['valid.ts', 123] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('files[1]')
    })

    test('error for invalid files[0] includes index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: [false, 'valid.ts'] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('files[0]')
    })

    test('error for invalid ignore[2] includes index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: ['a', 'b', 99] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('ignore[2]')
    })

    test('error for invalid ignore[0] includes index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: [42] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('ignore[0]')
    })

    test('error for invalid files[5] includes correct index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: ['a', 'b', 'c', 'd', 'e', 42] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('files[5]')
    })

    test('error for invalid ignore[3] includes correct index', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: ['a', 'b', 'c', false] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('ignore[3]')
    })
  })

  describe('error messages mention field name', () => {
    test('files error message mentions "files"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: 'not-array' })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('files')
    })

    test('ignore error message mentions "ignore"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: 123 })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('ignore')
    })

    test('rules type error message mentions "rules"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: 'not-object' })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('rules')
    })
  })

  describe('error message for rule config type includes type info', () => {
    test('error for number rule config mentions typeof', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': 42 } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('my-rule')
      expect(thrown!.message).toContain('number')
    })

    test('error for array length 0 mentions 1-2 elements', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': [] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('1-2 elements')
    })

    test('error for array length 3 mentions 1-2 elements', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': ['error', {}, 'extra'] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('1-2 elements')
    })

    test('error for boolean severity mentions typeof string', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: [true] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('string')
    })

    test('error for number severity in 2-element array mentions typeof', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: [42, {}] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('number')
    })

    test('error for function rule config mentions function type', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: () => {} } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('r')
      expect(thrown!.message).toContain('function')
    })

    test('error for invalid rule config mentions the type received', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: true } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('boolean')
    })
  })

  describe('error message for non-string severity in array', () => {
    test('mentions the rule name and severity type', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'test-rule': [42, {}] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('test-rule')
      expect(thrown!.message).toContain('string')
    })
  })

  describe('error message for invalid options type', () => {
    test('mentions array when options is an array', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': ['error', [1, 2]] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('array')
    })

    test('mentions type when options is a number', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': ['error', 42] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('my-rule')
      expect(thrown!.message).toContain('object')
    })

    test('null options error mentions "object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: ['error', null] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('object')
    })

    test('array options error mentions "array"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: ['error', [1]] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('array')
    })

    test('invalid options type error mentions rule name', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'opts-rule': ['error', 'bad'] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('opts-rule')
    })
  })

  describe('error message includes valid severities', () => {
    test('severity error for string rule mentions the invalid value', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': 'bad' } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('bad')
      expect(thrown!.message).toContain('my-rule')
    })

    test('severity error for array rule mentions the invalid value', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': ['bad', {}] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('bad')
      expect(thrown!.message).toContain('my-rule')
    })

    test('invalid severity suggestions contain valid severities list', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: 'bad' } })
      } catch (e) {
        thrown = e as CLIError
      }
      const allText = thrown!.suggestions.join(' ')
      expect(allText).toContain('error, warning, info')
    })

    test('string severity error suggestions list all valid severities', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: 'invalid' } })
      } catch (e) {
        thrown = e as CLIError
      }
      const allText = [thrown!.message, ...thrown!.suggestions].join(' ')
      expect(allText).toContain('error')
      expect(allText).toContain('warning')
      expect(allText).toContain('info')
    })

    test('array severity error suggestions list all valid severities', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: ['invalid', {}] } })
      } catch (e) {
        thrown = e as CLIError
      }
      const allText = [thrown!.message, ...thrown!.suggestions].join(' ')
      expect(allText).toContain('error')
      expect(allText).toContain('warning')
      expect(allText).toContain('info')
    })
  })

  describe('error messages are descriptive', () => {
    test('null config error mentions "must be an object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('must be an object')
    })

    test('array config error mentions "not an array"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(['item'])
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('not an array')
    })

    test('invalid severity error mentions the invalid value', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'max-complexity': 'critical' } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('critical')
      expect(thrown!.message).toContain('max-complexity')
    })

    test('non-object config message mentions "object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(42)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('object')
    })

    test('files non-array message mentions field name in quotes', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: 42 })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('"files"')
    })

    test('ignore non-array message mentions field name in quotes', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: true })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('"ignore"')
    })

    test('files element type message includes the actual type', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: [123] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('number')
    })

    test('ignore element type message includes the actual type', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: [true] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('boolean')
    })

    test('invalid rules type message mentions "object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: 'string' })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('object')
    })

    test('null rules type message mentions "object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: null })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('object')
    })

    test('array rules type message mentions "object"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: ['error'] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.message).toContain('object')
    })
  })

  describe('error suggestions are populated', () => {
    test('null config error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('array config error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(['item'])
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('non-array files error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: 'bad' })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('non-string files element error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: [123] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('invalid rules type error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: [] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('invalid rule config type error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': 42 } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('empty rule array error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': [] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('non-string severity in array error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': [42, {}] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('invalid options type error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': ['error', 'bad'] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('invalid severity string error has suggestions', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { 'my-rule': 'bad' } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.suggestions.length).toBeGreaterThan(0)
    })

    test('null config error suggestions mention config format', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.suggestions).toEqual(
        expect.arrayContaining([expect.stringContaining('config')]),
      )
    })

    test('array config error suggestions mention wrapping in object', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(['item'])
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.suggestions).toEqual(
        expect.arrayContaining([expect.stringContaining('object')]),
      )
    })
  })

  describe('CLIError code is E003 for all validation failures', () => {
    test('non-object config has code E003', () => {
      expect(() => validateConfig('bad')).toThrowCLIError('E003')
    })

    test('array config has code E003', () => {
      expect(() => validateConfig([1])).toThrowCLIError('E003')
    })

    test('invalid files has code E003', () => {
      expect(() => validateConfig({ files: 'bad' })).toThrowCLIError('E003')
    })

    test('invalid files element has code E003', () => {
      expect(() => validateConfig({ files: [1] })).toThrowCLIError('E003')
    })

    test('invalid ignore has code E003', () => {
      expect(() => validateConfig({ ignore: 'bad' })).toThrowCLIError('E003')
    })

    test('invalid ignore element has code E003', () => {
      expect(() => validateConfig({ ignore: [1] })).toThrowCLIError('E003')
    })

    test('invalid rules type has code E003', () => {
      expect(() => validateConfig({ rules: [] })).toThrowCLIError('E003')
    })

    test('invalid rule config has code E003', () => {
      expect(() => validateConfig({ rules: { r: 1 } })).toThrowCLIError('E003')
    })

    test('invalid severity has code E003', () => {
      expect(() => validateConfig({ rules: { r: 'bad' } })).toThrowCLIError('E003')
    })

    test('invalid options has code E003', () => {
      expect(() => validateConfig({ rules: { r: ['error', 'bad'] } })).toThrowCLIError('E003')
    })
  })

  describe('CLIError properties on validation errors', () => {
    test('error has name "CLIError"', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.name).toBe('CLIError')
    })

    test('error code is "E003" for files element error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: [123] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error code is "E003" for ignore element error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ ignore: [456] })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error code is "E003" for rules type error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: 42 })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error code is "E003" for rule config type error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: false } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error code is "E003" for severity error in array', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: ['bad'] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error code is "E003" for options type error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules: { r: ['error', 42] } })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.code).toBe('E003')
    })

    test('error has suggestions array', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({ files: 'bad' })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(Array.isArray(thrown!.suggestions)).toBe(true)
    })

    test('error has empty context object', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown!.context).toEqual({})
    })

    test('error is instance of both CLIError and Error', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown).toBeInstanceOf(Error)
    })

    test('error has toJSON method', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      expect(typeof thrown!.toJSON).toBe('function')
    })

    test('toJSON returns expected shape', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig(null)
      } catch (e) {
        thrown = e as CLIError
      }
      const json = thrown!.toJSON()
      expect(json).toHaveProperty('name', 'CLIError')
      expect(json).toHaveProperty('code', 'E003')
      expect(json).toHaveProperty('message')
      expect(json).toHaveProperty('suggestions')
    })
  })

  describe('returned result object is a new object', () => {
    test('result is not the same reference as input', () => {
      const config = { files: ['*.ts'] }
      const result = validateConfig(config)
      expect(result).not.toBe(config)
    })

    test('result files equals input files', () => {
      const config = { files: ['*.ts'] }
      const result = validateConfig(config)
      expect(result.files).toEqual(config.files)
    })

    test('result rules equals input rules', () => {
      const config = { rules: { 'no-eval': 'error' } }
      const result = validateConfig(config)
      expect(result.rules).toEqual(config.rules)
    })

    test('result files shares reference with input files', () => {
      const config = { files: ['*.ts'] }
      const result = validateConfig(config)
      expect(result.files).toBe(config.files)
    })

    test('modifying result rules does not affect original', () => {
      const config = { rules: { r: 'error' } }
      const result = validateConfig(config)
      result.rules!['new-rule'] = 'warning'
      expect(config.rules).toEqual({ r: 'error' })
    })

    test('result ignore equals input ignore', () => {
      const config = { ignore: ['dist/**'] }
      const result = validateConfig(config)
      expect(result.ignore).toEqual(config.ignore)
    })

    test('empty config result has no enumerable keys from unknown props', () => {
      const config = { unknown: true, extra: 'data' }
      const result = validateConfig(config)
      const keys = Object.keys(result)
      expect(keys).toHaveLength(0)
    })
  })

  describe('large config validation', () => {
    test('accepts config with 20 rules', () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 20; i++) {
        rules[`rule-${i}`] = i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info'
      }
      const config = { rules }
      const result = validateConfig(config)
      expect(Object.keys(result.rules!)).toHaveLength(20)
    })

    test('accepts config with 50 rules mixing string and array', () => {
      const rules: Record<string, string | [string, Record<string, unknown>]> = {}
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          rules[`rule-${i}`] = 'error'
        } else {
          rules[`rule-${i}`] = ['warning', { threshold: i }]
        }
      }
      const config = { rules }
      const result = validateConfig(config)
      expect(Object.keys(result.rules!)).toHaveLength(50)
    })

    test('rejects large config with one invalid rule among many', () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 19; i++) {
        rules[`rule-${i}`] = 'error'
      }
      rules['bad-rule'] = 'invalid'
      const config = { rules }
      expect(() => validateConfig(config)).toThrowCLIError('E003')
    })

    test('error for invalid rule among many mentions the specific rule', () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 10; i++) {
        rules[`rule-${i}`] = 'error'
      }
      rules['specific-bad-rule'] = 'nope'
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('specific-bad-rule')
    })
  })

  describe('mixed valid and invalid rules', () => {
    test('stops at first invalid rule (object config)', () => {
      let thrown: CLIError | undefined
      try {
        validateConfig({
          rules: {
            'valid-rule': 'error',
            'bad-rule': { severity: 'error' },
          },
        })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('bad-rule')
    })

    test('validates rules in object iteration order', () => {
      const rules: Record<string, string> = {}
      rules['first-bad'] = 'nope'
      rules['second-bad'] = 'also-nope'
      let thrown: CLIError | undefined
      try {
        validateConfig({ rules })
      } catch (e) {
        thrown = e as CLIError
      }
      expect(thrown).toBeInstanceOf(CLIError)
      expect(thrown!.message).toContain('first-bad')
    })
  })
})

expect.extend({
  toThrowCLIError(received: () => void, code: string) {
    try {
      received()
      return {
        pass: false,
        message: () =>
          `Expected function to throw CLIError with code ${code}, but it did not throw`,
      }
    } catch (error) {
      if (error instanceof CLIError) {
        const pass = error.code === code
        return {
          pass,
          message: () =>
            pass
              ? `Expected function not to throw CLIError with code ${code}`
              : `Expected CLIError code ${code}, got ${(error as CLIError).code}`,
        }
      }
      return {
        pass: false,
        message: () => `Expected CLIError, got ${(error as Error).constructor.name}`,
      }
    }
  },
})

declare module 'vitest' {
  interface Assertion {
    toThrowCLIError(code: string): void
  }
}
