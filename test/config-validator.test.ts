import { describe, expect, it } from 'vitest'

import { CLIError } from '../src/utils/errors.js'

import { validateConfig } from '../src/config/validator.js'

// ─── validateConfig - basic type checks ────────────────────────────
describe('validateConfig basic type checks', () => {
  it('rejects null', () => {
    expect(() => validateConfig(null)).toThrow(CLIError)
  })

  it('rejects undefined', () => {
    expect(() => validateConfig(undefined)).toThrow(CLIError)
  })

  it('rejects string', () => {
    expect(() => validateConfig('config')).toThrow(CLIError)
  })

  it('rejects number', () => {
    expect(() => validateConfig(42)).toThrow(CLIError)
  })

  it('rejects boolean', () => {
    expect(() => validateConfig(true)).toThrow(CLIError)
  })

  it('rejects array', () => {
    expect(() => validateConfig([])).toThrow(CLIError)
  })

  it('accepts empty object', () => {
    expect(validateConfig({})).toEqual({})
  })

  it('rejects with correct error code', () => {
    try {
      validateConfig(null)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E003')
    }
  })

  it('array rejection message mentions array', () => {
    try {
      validateConfig([1, 2, 3])
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('array')
    }
  })
})

// ─── validateConfig - files field ──────────────────────────────────
describe('validateConfig files field', () => {
  it('validates valid files array', () => {
    const result = validateConfig({ files: ['**/*.ts', 'src/**/*.js'] })
    expect(result.files).toEqual(['**/*.ts', 'src/**/*.js'])
  })

  it('rejects non-array files', () => {
    expect(() => validateConfig({ files: '**/*.ts' })).toThrow(CLIError)
  })

  it('rejects files with non-string element', () => {
    expect(() => validateConfig({ files: ['**/*.ts', 42] })).toThrow(CLIError)
  })

  it('reports index of invalid element', () => {
    try {
      validateConfig({ files: ['valid', 123] })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('[1]')
    }
  })

  it('accepts empty files array', () => {
    const result = validateConfig({ files: [] })
    expect(result.files).toEqual([])
  })

  it('accepts files with glob patterns', () => {
    const patterns = ['**/*.ts', '!node_modules/**', 'src/**/{foo,bar}.ts']
    const result = validateConfig({ files: patterns })
    expect(result.files).toEqual(patterns)
  })

  it('includes field name in error message', () => {
    try {
      validateConfig({ files: 'not-array' })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('files')
    }
  })
})

// ─── validateConfig - ignore field ─────────────────────────────────
describe('validateConfig ignore field', () => {
  it('validates valid ignore array', () => {
    const result = validateConfig({ ignore: ['node_modules/**', 'dist/**'] })
    expect(result.ignore).toEqual(['node_modules/**', 'dist/**'])
  })

  it('rejects non-array ignore', () => {
    expect(() => validateConfig({ ignore: 'dist/**' })).toThrow(CLIError)
  })

  it('rejects ignore with non-string element', () => {
    expect(() => validateConfig({ ignore: ['dist/**', false] })).toThrow(CLIError)
  })

  it('accepts empty ignore array', () => {
    const result = validateConfig({ ignore: [] })
    expect(result.ignore).toEqual([])
  })

  it('includes field name in error message', () => {
    try {
      validateConfig({ ignore: 123 })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('ignore')
    }
  })
})

// ─── validateConfig - plugins field ────────────────────────────────
describe('validateConfig plugins field', () => {
  it('validates valid plugins array', () => {
    const result = validateConfig({ plugins: ['./plugin-a.js', './plugin-b.js'] })
    expect(result.plugins).toEqual(['./plugin-a.js', './plugin-b.js'])
  })

  it('rejects non-array plugins', () => {
    expect(() => validateConfig({ plugins: './plugin.js' })).toThrow(CLIError)
  })

  it('rejects plugins with non-string element', () => {
    expect(() => validateConfig({ plugins: ['./p.js', {}] })).toThrow(CLIError)
  })

  it('accepts empty plugins array', () => {
    const result = validateConfig({ plugins: [] })
    expect(result.plugins).toEqual([])
  })
})

// ─── validateConfig - rules field ──────────────────────────────────
describe('validateConfig rules field', () => {
  it('validates rules with string severity', () => {
    const result = validateConfig({ rules: { 'max-complexity': 'error' } })
    expect(result.rules).toEqual({ 'max-complexity': 'error' })
  })

  it('validates rules with array config [severity, options]', () => {
    const result = validateConfig({ rules: { 'max-params': ['warning', { max: 5 }] } })
    expect(result.rules).toEqual({ 'max-params': ['warning', { max: 5 }] })
  })

  it('validates multiple rules', () => {
    const rules = {
      'max-complexity': 'error',
      'no-eval': 'warning',
      'no-console': 'info',
    }
    const result = validateConfig({ rules })
    expect(result.rules).toEqual(rules)
  })

  it('validates empty rules object', () => {
    const result = validateConfig({ rules: {} })
    expect(result.rules).toEqual({})
  })

  it('rejects non-object rules', () => {
    expect(() => validateConfig({ rules: 'error' })).toThrow(CLIError)
  })

  it('rejects null rules', () => {
    expect(() => validateConfig({ rules: null })).toThrow(CLIError)
  })

  it('rejects array rules', () => {
    expect(() => validateConfig({ rules: [] })).toThrow(CLIError)
  })

  it('rejects invalid severity in string rule', () => {
    expect(() => validateConfig({ rules: { 'foo': 'invalid' } })).toThrow(CLIError)
  })

  it('accepts "error" severity', () => {
    const result = validateConfig({ rules: { 'test-rule': 'error' } })
    expect(result.rules!['test-rule']).toBe('error')
  })

  it('accepts "warning" severity', () => {
    const result = validateConfig({ rules: { 'test-rule': 'warning' } })
    expect(result.rules!['test-rule']).toBe('warning')
  })

  it('accepts "info" severity', () => {
    const result = validateConfig({ rules: { 'test-rule': 'info' } })
    expect(result.rules!['test-rule']).toBe('info')
  })

  it('rejects "off" severity', () => {
    expect(() => validateConfig({ rules: { 'test-rule': 'off' } })).toThrow(CLIError)
  })

  it('rejects empty array rule config', () => {
    expect(() => validateConfig({ rules: { 'test-rule': [] } })).toThrow(CLIError)
  })

  it('rejects array rule config with more than 2 elements', () => {
    expect(() => validateConfig({ rules: { 'test-rule': ['error', { max: 5 }, 'extra'] } })).toThrow(CLIError)
  })

  it('rejects non-string severity in array rule', () => {
    expect(() => validateConfig({ rules: { 'test-rule': [123, {}] } })).toThrow(CLIError)
  })

  it('rejects invalid severity in array rule', () => {
    expect(() => validateConfig({ rules: { 'test-rule': ['invalid', {}] } })).toThrow(CLIError)
  })

  it('rejects array options (must be object)', () => {
    expect(() => validateConfig({ rules: { 'test-rule': ['error', [1, 2]] } })).toThrow(CLIError)
  })

  it('rejects null options', () => {
    expect(() => validateConfig({ rules: { 'test-rule': ['error', null] } })).toThrow(CLIError)
  })

  it('rejects number rule config', () => {
    expect(() => validateConfig({ rules: { 'test-rule': 42 } })).toThrow(CLIError)
  })

  it('accepts array rule with only severity (single element)', () => {
    const result = validateConfig({ rules: { 'test-rule': ['error'] } })
    expect(result.rules!['test-rule']).toEqual(['error'])
  })

  it('includes rule name in error messages', () => {
    try {
      validateConfig({ rules: { 'my-rule': 'invalid' } })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('my-rule')
    }
  })

  it('includes valid severities in suggestions', () => {
    try {
      validateConfig({ rules: { 'foo': 'bad' } })
      expect.unreachable('Should have thrown')
    } catch (error) {
      const suggestions = (error as CLIError).suggestions.join(' ')
      expect(suggestions).toContain('error')
      expect(suggestions).toContain('warning')
      expect(suggestions).toContain('info')
    }
  })
})

// ─── validateConfig - reporters field ──────────────────────────────
describe('validateConfig reporters field', () => {
  it('validates valid reporter config', () => {
    const reporters = [{ name: 'slack', path: './reporters/slack.js' }]
    const result = validateConfig({ reporters })
    expect(result.reporters).toEqual(reporters)
  })

  it('validates reporter with options', () => {
    const reporters = [
      { name: 'custom', path: './reporter.js', options: { webhookUrl: 'https://example.com' } },
    ]
    const result = validateConfig({ reporters })
    expect(result.reporters).toEqual(reporters)
  })

  it('rejects non-array reporters', () => {
    expect(() => validateConfig({ reporters: 'slack' })).toThrow(CLIError)
  })

  it('rejects reporter entry that is not an object', () => {
    expect(() => validateConfig({ reporters: ['not-object'] })).toThrow(CLIError)
  })

  it('rejects reporter entry that is null', () => {
    expect(() => validateConfig({ reporters: [null] })).toThrow(CLIError)
  })

  it('rejects reporter entry that is an array', () => {
    expect(() => validateConfig({ reporters: [[]] })).toThrow(CLIError)
  })

  it('rejects reporter without name', () => {
    expect(() => validateConfig({ reporters: [{ path: './reporter.js' }] })).toThrow(CLIError)
  })

  it('rejects reporter with empty name', () => {
    expect(() => validateConfig({ reporters: [{ name: '', path: './reporter.js' }] })).toThrow(CLIError)
  })

  it('rejects reporter without path', () => {
    expect(() => validateConfig({ reporters: [{ name: 'slack' }] })).toThrow(CLIError)
  })

  it('rejects reporter with empty path', () => {
    expect(() => validateConfig({ reporters: [{ name: 'slack', path: '' }] })).toThrow(CLIError)
  })

  it('rejects reporter with non-string name', () => {
    expect(() => validateConfig({ reporters: [{ name: 123, path: './r.js' }] })).toThrow(CLIError)
  })

  it('rejects reporter with non-string path', () => {
    expect(() => validateConfig({ reporters: [{ name: 'slack', path: true }] })).toThrow(CLIError)
  })

  it('rejects reporter with non-object options', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: 'string' }] }),
    ).toThrow(CLIError)
  })

  it('rejects reporter with null options', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: null }] }),
    ).toThrow(CLIError)
  })

  it('rejects reporter with array options', () => {
    expect(() =>
      validateConfig({ reporters: [{ name: 'slack', path: './r.js', options: [1, 2] }] }),
    ).toThrow(CLIError)
  })

  it('accepts reporter without options field', () => {
    const result = validateConfig({ reporters: [{ name: 'slack', path: './r.js' }] })
    expect(result.reporters?.[0]?.options).toBeUndefined()
  })

  it('validates multiple reporters', () => {
    const reporters = [
      { name: 'slack', path: './slack.js' },
      { name: 'teams', path: './teams.js', options: { url: 'https://example.com' } },
    ]
    const result = validateConfig({ reporters })
    expect(result.reporters).toHaveLength(2)
  })

  it('includes index in error message for invalid reporter', () => {
    try {
      validateConfig({ reporters: [{ name: 'ok', path: './ok.js' }, { name: '', path: './bad.js' }] })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect((error as CLIError).message).toContain('[1]')
    }
  })
})

// ─── validateConfig - combined fields ──────────────────────────────
describe('validateConfig combined fields', () => {
  it('validates config with all fields', () => {
    const config = {
      files: ['**/*.ts'],
      ignore: ['dist/**'],
      plugins: ['./p.js'],
      reporters: [{ name: 'custom', path: './r.js' }],
      rules: { 'max-complexity': 'error' },
    }
    const result = validateConfig(config)
    expect(result).toEqual(config)
  })

  it('omits fields not present in input', () => {
    const result = validateConfig({ files: ['**/*.ts'] })
    expect(result.files).toEqual(['**/*.ts'])
    expect(result.ignore).toBeUndefined()
    expect(result.plugins).toBeUndefined()
    expect(result.reporters).toBeUndefined()
    expect(result.rules).toBeUndefined()
  })

  it('ignores unknown fields', () => {
    const result = validateConfig({ unknown: 'field', files: ['**/*.ts'] })
    expect(result.files).toEqual(['**/*.ts'])
    expect('unknown' in (result as Record<string, unknown>)).toBe(false)
  })
})

// ─── validateConfig - error details ────────────────────────────────
describe('validateConfig error details', () => {
  it('all errors include suggestions', () => {
    const invalidConfigs: unknown[] = [
      null,
      'string',
      42,
      true,
      [],
      { files: 'not-array' },
      { rules: 'not-object' },
    ]

    for (const cfg of invalidConfigs) {
      try {
        validateConfig(cfg)
        expect.unreachable(`Should have thrown for: ${JSON.stringify(cfg)}`)
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError)
        expect((error as CLIError).suggestions.length).toBeGreaterThan(0)
      }
    }
  })
})
