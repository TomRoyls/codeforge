import { describe, expect, it } from 'vitest'

import {
  resolveConfigFileName,
  generateJsonContent,
  generateJsContent,
  filterValidRules,
  detectExistingConfig,
} from '../../src/commands/init-helpers.js'

// ─── resolveConfigFileName ───

describe('resolveConfigFileName', () => {
  it('returns JSON config name for json format', () => {
    expect(resolveConfigFileName('json')).toBe('.codeforgerc.json')
  })

  it('returns JS config name for js format', () => {
    expect(resolveConfigFileName('js')).toBe('codeforge.config.js')
  })
})

// ─── generateJsonContent ───

describe('generateJsonContent', () => {
  it('serializes config as formatted JSON', () => {
    const config = { files: ['**/*.ts'], ignore: ['node_modules'] }
    const result = generateJsonContent(config as any)
    expect(result).toContain('"files"')
    expect(result).toContain('**/*.ts')
    expect(JSON.parse(result)).toEqual(config)
  })
})

// ─── generateJsContent ───

describe('generateJsContent', () => {
  it('generates JS module with type annotation', () => {
    const config = { files: ['**/*.ts'] }
    const result = generateJsContent(config as any)
    expect(result).toContain("@type {import('codeforge').CodeForgeConfig}")
    expect(result).toContain('export default')
    expect(result).toContain('**/*.ts')
  })

  it('uses JSON.stringify for body', () => {
    const config = { rules: { 'no-eval': 'error' } }
    const result = generateJsContent(config as any)
    expect(result).toContain('"no-eval"')
    expect(result).toContain('"error"')
  })
})

// ─── filterValidRules ───

describe('filterValidRules', () => {
  const validIds = ['no-eval', 'max-params', 'prefer-const']

  it('splits and validates comma-separated rules', () => {
    const result = filterValidRules('no-eval, max-params', validIds)
    expect(result.valid).toEqual(['no-eval', 'max-params'])
    expect(result.invalid).toEqual([])
  })

  it('is case-insensitive', () => {
    const result = filterValidRules('NO-EVAL, Max-Params', validIds)
    expect(result.valid).toEqual(['no-eval', 'max-params'])
  })

  it('separates valid from invalid', () => {
    const result = filterValidRules('no-eval, bogus-rule, max-params', validIds)
    expect(result.valid).toEqual(['no-eval', 'max-params'])
    expect(result.invalid).toEqual(['bogus-rule'])
  })

  it('handles empty input', () => {
    const result = filterValidRules('', validIds)
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  it('handles whitespace-only input', () => {
    const result = filterValidRules('  ,  ,  ', validIds)
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })
})

// ─── detectExistingConfig ───

describe('detectExistingConfig', () => {
  it('returns first existing config file', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      (fp) => fp === '/project/.codeforgerc.json',
    )
    expect(result).toBe('/project/.codeforgerc.json')
  })

  it('returns second config file if first does not exist', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      (fp) => fp === '/project/codeforge.config.js',
    )
    expect(result).toBe('/project/codeforge.config.js')
  })

  it('returns null when no config exists', () => {
    const result = detectExistingConfig(
      '/project',
      ['.codeforgerc.json', 'codeforge.config.js'],
      () => false,
    )
    expect(result).toBeNull()
  })

  it('handles empty config files list', () => {
    const result = detectExistingConfig('/project', [], () => true)
    expect(result).toBeNull()
  })
})
