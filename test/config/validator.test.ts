import { describe, expect, it } from 'vitest'

import { CLIError } from '../../src/utils/errors.js'
import { validateConfig } from '../../src/config/validator.js'

// ─── validateConfig — valid configs ───

describe('validateConfig — valid configs', () => {
  it('accepts a valid complete config', () => {
    const config = {
      files: ['src/**/*.ts'],
      ignore: ['node_modules/**'],
      rules: {
        'max-complexity': 'error',
        'no-eval': ['warning', { allowIndirect: true }],
      },
    }

    const result = validateConfig(config)

    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['node_modules/**'])
    expect(result.rules).toEqual({
      'max-complexity': 'error',
      'no-eval': ['warning', { allowIndirect: true }],
    })
  })

  it('accepts a valid minimal config (empty object)', () => {
    const result = validateConfig({})
    expect(result).toEqual({})
  })

  it('accepts config with only files', () => {
    const result = validateConfig({ files: ['src/**/*.ts', 'lib/**/*.js'] })
    expect(result.files).toEqual(['src/**/*.ts', 'lib/**/*.js'])
    expect(result.ignore).toBeUndefined()
    expect(result.rules).toBeUndefined()
  })

  it('accepts config with only ignore', () => {
    const result = validateConfig({ ignore: ['dist/**'] })
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.files).toBeUndefined()
  })

  it('accepts config with only plugins', () => {
    const result = validateConfig({ plugins: ['./plugin-a.js'] })
    expect(result.plugins).toEqual(['./plugin-a.js'])
  })

  it('accepts config with only rules', () => {
    const result = validateConfig({ rules: { 'no-eval': 'error' } })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  it('returns a new object without mutating input', () => {
    const input = { files: ['src/**/*.ts'] }
    const result = validateConfig(input)
    expect(result).toEqual(input)
    expect(result).not.toBe(input)
  })
})

// ─── validateConfig — invalid top-level input ───

describe('validateConfig — invalid top-level input', () => {
  it('throws CLIError for null input', () => {
    expect(() => validateConfig(null)).toThrow()
    expect(() => validateConfig(null)).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for undefined input', () => {
    expect(() => validateConfig(undefined)).toThrow()
    expect(() => validateConfig(undefined)).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for number input', () => {
    expect(() => validateConfig(42)).toThrow()
    expect(() => validateConfig(42)).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for string input', () => {
    expect(() => validateConfig('config')).toThrow()
    expect(() => validateConfig('config')).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for boolean input', () => {
    expect(() => validateConfig(true)).toThrow()
    expect(() => validateConfig(true)).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for array input', () => {
    expect(() => validateConfig(['not', 'an', 'object'])).toThrow()
    expect(() => validateConfig(['not', 'an', 'object'])).toThrow(expect.any(CLIError))
  })

  it('includes helpful message for non-object input', () => {
    try {
      validateConfig(null)
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('must be an object')
    }
  })

  it('includes helpful message for array input', () => {
    try {
      validateConfig([1, 2, 3])
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('not an array')
    }
  })
})

// ─── validateConfig — files validation ───

describe('validateConfig — files validation', () => {
  it('throws CLIError when files is not an array', () => {
    expect(() => validateConfig({ files: 'src/**/*.ts' })).toThrow()
    expect(() => validateConfig({ files: 'src/**/*.ts' })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when files contains non-string entries', () => {
    expect(() => validateConfig({ files: ['src/**/*.ts', 42] })).toThrow()
    expect(() => validateConfig({ files: ['src/**/*.ts', 42] })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when files contains null entries', () => {
    expect(() => validateConfig({ files: [null] })).toThrow()
  })

  it('reports the invalid index in the error message', () => {
    try {
      validateConfig({ files: ['ok', 42, 'also-ok'] })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('files[1]')
    }
  })

  it('accepts an empty files array', () => {
    const result = validateConfig({ files: [] })
    expect(result.files).toEqual([])
  })

  it('accepts a valid files string array', () => {
    const result = validateConfig({ files: ['**/*.ts', '**/*.js', 'src/**/*.tsx'] })
    expect(result.files).toEqual(['**/*.ts', '**/*.js', 'src/**/*.tsx'])
  })
})

// ─── validateConfig — ignore validation ───

describe('validateConfig — ignore validation', () => {
  it('throws CLIError when ignore is not an array', () => {
    expect(() => validateConfig({ ignore: 'dist/**' })).toThrow()
    expect(() => validateConfig({ ignore: 'dist/**' })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when ignore contains non-string entries', () => {
    expect(() => validateConfig({ ignore: [123] })).toThrow()
    expect(() => validateConfig({ ignore: [123] })).toThrow(expect.any(CLIError))
  })

  it('reports the invalid index in the error message', () => {
    try {
      validateConfig({ ignore: [false] })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('ignore[0]')
    }
  })

  it('accepts a valid ignore string array', () => {
    const result = validateConfig({ ignore: ['node_modules/**', 'dist/**'] })
    expect(result.ignore).toEqual(['node_modules/**', 'dist/**'])
  })
})

// ─── validateConfig — plugins validation ───

describe('validateConfig — plugins validation', () => {
  it('throws CLIError when plugins is not an array', () => {
    expect(() => validateConfig({ plugins: './plugin.js' })).toThrow()
    expect(() => validateConfig({ plugins: './plugin.js' })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when plugins contains non-string entries', () => {
    expect(() => validateConfig({ plugins: [42] })).toThrow()
  })

  it('accepts a valid plugins string array', () => {
    const result = validateConfig({ plugins: ['./plugin-a.js', './plugin-b.js'] })
    expect(result.plugins).toEqual(['./plugin-a.js', './plugin-b.js'])
  })
})

// ─── validateConfig — rules validation ───

describe('validateConfig — rules validation', () => {
  it('throws CLIError when rules is not an object', () => {
    expect(() => validateConfig({ rules: 'error' })).toThrow()
    expect(() => validateConfig({ rules: 'error' })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when rules is null', () => {
    expect(() => validateConfig({ rules: null })).toThrow()
  })

  it('throws CLIError when rules is an array', () => {
    expect(() => validateConfig({ rules: ['error'] })).toThrow()
  })

  it('accepts a valid rules object', () => {
    const result = validateConfig({ rules: { 'no-eval': 'error' } })
    expect(result.rules).toEqual({ 'no-eval': 'error' })
  })

  it('accepts an empty rules object', () => {
    const result = validateConfig({ rules: {} })
    expect(result.rules).toEqual({})
  })
})

// ─── validateConfig — rule severity strings ───

describe('validateConfig — rule severity strings', () => {
  it('accepts "error" severity', () => {
    const result = validateConfig({ rules: { 'my-rule': 'error' } })
    expect(result.rules).toEqual({ 'my-rule': 'error' })
  })

  it('accepts "warning" severity', () => {
    const result = validateConfig({ rules: { 'my-rule': 'warning' } })
    expect(result.rules).toEqual({ 'my-rule': 'warning' })
  })

  it('accepts "info" severity', () => {
    const result = validateConfig({ rules: { 'my-rule': 'info' } })
    expect(result.rules).toEqual({ 'my-rule': 'info' })
  })

  it('throws CLIError for invalid severity string', () => {
    expect(() => validateConfig({ rules: { 'my-rule': 'critical' } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': 'critical' } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for empty string severity', () => {
    expect(() => validateConfig({ rules: { 'my-rule': '' } })).toThrow()
  })

  it('includes valid severities in error suggestions', () => {
    try {
      validateConfig({ rules: { 'my-rule': 'fatal' } })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      const cliErr = error as CLIError
      expect(cliErr.suggestions).toEqual(
        expect.arrayContaining([
          expect.stringContaining('error, warning, info'),
        ]),
      )
    }
  })
})

// ─── validateConfig — rule array config [severity, options] ───

describe('validateConfig — rule array config [severity, options]', () => {
  it('accepts [severity] single-element array', () => {
    const result = validateConfig({ rules: { 'my-rule': ['error'] } })
    expect(result.rules).toEqual({ 'my-rule': ['error'] })
  })

  it('accepts [severity, options] two-element array', () => {
    const result = validateConfig({ rules: { 'my-rule': ['warning', { max: 10 }] } })
    expect(result.rules).toEqual({ 'my-rule': ['warning', { max: 10 }] })
  })

  it('accepts [severity, {}] with empty options', () => {
    const result = validateConfig({ rules: { 'my-rule': ['info', {}] } })
    expect(result.rules).toEqual({ 'my-rule': ['info', {}] })
  })

  it('throws CLIError for empty array config', () => {
    expect(() => validateConfig({ rules: { 'my-rule': [] } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': [] } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for >2 element array config', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['error', {}, 'extra'] } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': ['error', {}, 'extra'] } })).toThrow(
      expect.any(CLIError),
    )
  })

  it('throws CLIError when severity in array is not a string', () => {
    expect(() => validateConfig({ rules: { 'my-rule': [42, {}] } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': [42, {}] } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when severity in array is null', () => {
    expect(() => validateConfig({ rules: { 'my-rule': [null] } })).toThrow()
  })

  it('throws CLIError for invalid severity in array', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['fatal', {}] } })).toThrow()
  })

  it('throws CLIError when options is not an object (number)', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['error', 42] } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': ['error', 42] } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when options is not an object (string)', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['error', 'opts'] } })).toThrow()
  })

  it('throws CLIError when options is null', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['error', null] } })).toThrow()
  })

  it('throws CLIError when options is an array', () => {
    expect(() => validateConfig({ rules: { 'my-rule': ['error', [1, 2]] } })).toThrow()
  })

  it('reports array type in error message for array options', () => {
    try {
      validateConfig({ rules: { 'my-rule': ['error', [1, 2]] } })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('array')
    }
  })
})

// ─── validateConfig — rule with non-string/non-array config ───

describe('validateConfig — rule with invalid config types', () => {
  it('throws CLIError for number rule config', () => {
    expect(() => validateConfig({ rules: { 'my-rule': 42 } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': 42 } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for boolean rule config', () => {
    expect(() => validateConfig({ rules: { 'my-rule': true } })).toThrow()
    expect(() => validateConfig({ rules: { 'my-rule': true } })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError for null rule config', () => {
    expect(() => validateConfig({ rules: { 'my-rule': null } })).toThrow()
  })

  it('includes rule name in error message', () => {
    try {
      validateConfig({ rules: { 'specific-rule': 99 } })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('specific-rule')
    }
  })
})

// ─── validateConfig — reporters validation ───

describe('validateConfig — reporters validation', () => {
  it('accepts a valid reporters array', () => {
    const reporters = [{ name: 'slack', path: './reporters/slack.js' }]
    const result = validateConfig({ reporters })
    expect(result.reporters).toEqual(reporters)
  })

  it('accepts reporters with options', () => {
    const reporters = [{ name: 'custom', path: './reporter.js', options: { url: 'https://example.com' } }]
    const result = validateConfig({ reporters })
    expect(result.reporters).toEqual(reporters)
  })

  it('accepts reporters without options', () => {
    const reporters = [{ name: 'json', path: './json-reporter.js' }]
    const result = validateConfig({ reporters })
    expect(result.reporters).toEqual(reporters)
  })

  it('throws CLIError when reporters is not an array', () => {
    expect(() => validateConfig({ reporters: 'slack' })).toThrow()
    expect(() => validateConfig({ reporters: 'slack' })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when reporters is an object', () => {
    expect(() => validateConfig({ reporters: { name: 'slack', path: './x.js' } })).toThrow()
  })

  it('throws CLIError when reporter entry is not an object', () => {
    expect(() => validateConfig({ reporters: ['not-an-object'] })).toThrow()
    expect(() => validateConfig({ reporters: ['not-an-object'] })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when reporter entry is null', () => {
    expect(() => validateConfig({ reporters: [null] })).toThrow()
  })

  it('throws CLIError when reporter entry is an array', () => {
    expect(() => validateConfig({ reporters: [[1, 2]] })).toThrow()
  })

  it('throws CLIError when reporter entry has no name', () => {
    expect(() => validateConfig({ reporters: [{ path: './reporter.js' }] })).toThrow()
    expect(() => validateConfig({ reporters: [{ path: './reporter.js' }] })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when reporter name is empty string', () => {
    expect(() => validateConfig({ reporters: [{ name: '', path: './reporter.js' }] })).toThrow()
  })

  it('throws CLIError when reporter entry has no path', () => {
    expect(() => validateConfig({ reporters: [{ name: 'slack' }] })).toThrow()
    expect(() => validateConfig({ reporters: [{ name: 'slack' }] })).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when reporter path is empty string', () => {
    expect(() => validateConfig({ reporters: [{ name: 'slack', path: '' }] })).toThrow()
  })

  it('throws CLIError when reporter options is not an object', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: 'bad' }] }),
    ).toThrow()
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: 'bad' }] }),
    ).toThrow(expect.any(CLIError))
  })

  it('throws CLIError when reporter options is null', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: null }] }),
    ).toThrow()
  })

  it('throws CLIError when reporter options is an array', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: [1, 2] }] }),
    ).toThrow()
  })

  it('reports reporter index in error messages', () => {
    try {
      validateConfig({ reporters: [{ name: 'ok', path: './ok.js' }, 'bad'] })
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain('reporters[1]')
    }
  })
})

// ─── validateConfig — combined config ───

describe('validateConfig — combined config', () => {
  it('validates all fields together', () => {
    const config = {
      files: ['src/**/*.ts'],
      ignore: ['dist/**'],
      plugins: ['./my-plugin.js'],
      rules: {
        'no-eval': 'error',
        'max-complexity': ['warning', { max: 10 }],
        'no-console': 'info',
      },
      reporters: [{ name: 'slack', path: './reporters/slack.js', options: { url: 'https://hooks.slack.com' } }],
    }

    const result = validateConfig(config)

    expect(result.files).toEqual(['src/**/*.ts'])
    expect(result.ignore).toEqual(['dist/**'])
    expect(result.plugins).toEqual(['./my-plugin.js'])
    expect(result.rules).toEqual({
      'no-eval': 'error',
      'max-complexity': ['warning', { max: 10 }],
      'no-console': 'info',
    })
    expect(result.reporters).toEqual([
      { name: 'slack', path: './reporters/slack.js', options: { url: 'https://hooks.slack.com' } },
    ])
  })

  it('ignres unknown top-level keys (passes through)', () => {
    // validateConfig only extracts known fields; unknown keys are silently dropped
    const result = validateConfig({ files: ['src/**/*.ts'], unknownKey: 'value' })
    expect(result.files).toEqual(['src/**/*.ts'])
    expect((result as Record<string, unknown>).unknownKey).toBeUndefined()
  })
})
