import { describe, expect, test } from 'vitest'

import {
  checkPluginCompatibility,
  compareSemVer,
  formatSemVer,
  parseConstraint,
  parseSemVer,
  satisfiesConstraint,
  validateManifest,
} from '../../../src/plugins/version-checker.js'
import type { PluginManifest } from '../../../src/plugins/version-types.js'

describe('parseSemVer', () => {
  test('parses "1.0.0"', () => {
    expect(parseSemVer('1.0.0')).toEqual({ major: 1, minor: 0, patch: 0 })
  })

  test('parses "0.0.1"', () => {
    expect(parseSemVer('0.0.1')).toEqual({ major: 0, minor: 0, patch: 1 })
  })

  test('parses "10.20.30"', () => {
    expect(parseSemVer('10.20.30')).toEqual({ major: 10, minor: 20, patch: 30 })
  })

  test('parses "1.0.0-alpha"', () => {
    expect(parseSemVer('1.0.0-alpha')).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: 'alpha',
    })
  })

  test('parses "1.0.0-alpha.1"', () => {
    expect(parseSemVer('1.0.0-alpha.1')).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: 'alpha.1',
    })
  })

  test('parses "0.1.0"', () => {
    expect(parseSemVer('0.1.0')).toEqual({ major: 0, minor: 1, patch: 0 })
  })

  test('returns null for empty string', () => {
    expect(parseSemVer('')).toBeNull()
  })

  test('returns null for "abc"', () => {
    expect(parseSemVer('abc')).toBeNull()
  })

  test('returns null for "1.0"', () => {
    expect(parseSemVer('1.0')).toBeNull()
  })

  test('returns null for "1.0.0."', () => {
    expect(parseSemVer('1.0.0.')).toBeNull()
  })

  test('returns null for "v1.0.0"', () => {
    expect(parseSemVer('v1.0.0')).toBeNull()
  })

  test('returns null for "1.0.0.0"', () => {
    expect(parseSemVer('1.0.0.0')).toBeNull()
  })

  test('trims whitespace', () => {
    expect(parseSemVer('  1.2.3  ')).toEqual({ major: 1, minor: 2, patch: 3 })
  })
})

describe('formatSemVer', () => {
  test('formats simple version', () => {
    expect(formatSemVer({ major: 1, minor: 2, patch: 3 })).toBe('1.2.3')
  })

  test('formats prerelease version', () => {
    expect(formatSemVer({ major: 1, minor: 0, patch: 0, prerelease: 'beta.2' })).toBe(
      '1.0.0-beta.2',
    )
  })

  test('roundtrip parse→format', () => {
    const v = '10.20.30'
    expect(formatSemVer(parseSemVer(v)!)).toBe(v)
  })

  test('roundtrip with prerelease', () => {
    const v = '1.0.0-alpha.1'
    expect(formatSemVer(parseSemVer(v)!)).toBe(v)
  })
})

describe('compareSemVer', () => {
  test('equal versions return 0', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 3 }, { major: 1, minor: 2, patch: 3 })).toBe(0)
  })

  test('major difference: a < b returns -1', () => {
    expect(compareSemVer({ major: 1, minor: 9, patch: 9 }, { major: 2, minor: 0, patch: 0 })).toBe(-1)
  })

  test('major difference: a > b returns 1', () => {
    expect(compareSemVer({ major: 3, minor: 0, patch: 0 }, { major: 2, minor: 9, patch: 9 })).toBe(1)
  })

  test('minor difference when major same', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 9 }, { major: 1, minor: 3, patch: 0 })).toBe(-1)
  })

  test('patch difference when major and minor same', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 3 }, { major: 1, minor: 2, patch: 4 })).toBe(-1)
  })

  test('prerelease version is less than release', () => {
    expect(
      compareSemVer(
        { major: 1, minor: 0, patch: 0, prerelease: 'alpha' },
        { major: 1, minor: 0, patch: 0 },
      ),
    ).toBe(-1)
  })

  test('release version is greater than prerelease', () => {
    expect(
      compareSemVer(
        { major: 1, minor: 0, patch: 0 },
        { major: 1, minor: 0, patch: 0, prerelease: 'alpha' },
      ),
    ).toBe(1)
  })

  test('prerelease string comparison', () => {
    expect(
      compareSemVer(
        { major: 1, minor: 0, patch: 0, prerelease: 'alpha' },
        { major: 1, minor: 0, patch: 0, prerelease: 'beta' },
      ),
    ).toBe(-1)
  })

  test('equal prerelease returns 0', () => {
    expect(
      compareSemVer(
        { major: 1, minor: 0, patch: 0, prerelease: 'alpha' },
        { major: 1, minor: 0, patch: 0, prerelease: 'alpha' },
      ),
    ).toBe(0)
  })
})

describe('parseConstraint', () => {
  test('parses "*"', () => {
    expect(parseConstraint('*')).toEqual({ range: '*' })
  })

  test('parses empty string as wildcard', () => {
    expect(parseConstraint('')).toEqual({ range: '*' })
  })

  test('parses "latest" as wildcard', () => {
    expect(parseConstraint('latest')).toEqual({ range: '*' })
  })

  test('parses "^1.2.3"', () => {
    const c = parseConstraint('^1.2.3')
    expect(c.range).toBe('^1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  test('parses "~1.2.3"', () => {
    const c = parseConstraint('~1.2.3')
    expect(c.range).toBe('~1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  test('parses ">=1.0.0"', () => {
    const c = parseConstraint('>=1.0.0')
    expect(c.range).toBe('>=1.0.0')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0 })
  })

  test('parses ">=1.0.0 <2.0.0"', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(c.range).toBe('>=1.0.0 <2.0.0')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0 })
    expect(c.max).toEqual({ major: 2, minor: 0, patch: 0 })
  })

  test('parses exact version "1.2.3"', () => {
    const c = parseConstraint('1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(c.max).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(c.range).toBe('1.2.3')
  })
})

describe('satisfiesConstraint', () => {
  test('wildcard always true', () => {
    expect(satisfiesConstraint({ major: 99, minor: 99, patch: 99 }, { range: '*' })).toBe(true)
  })

  test('caret: compatible within same major', () => {
    const c = parseConstraint('^1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 5, patch: 0 }, c)).toBe(true)
  })

  test('caret: incompatible different major', () => {
    const c = parseConstraint('^1.2.3')
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, c)).toBe(false)
  })

  test('caret: exact min version satisfies', () => {
    const c = parseConstraint('^1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 3 }, c)).toBe(true)
  })

  test('caret: version below min fails', () => {
    const c = parseConstraint('^1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 2 }, c)).toBe(false)
  })

  test('tilde: compatible within same minor', () => {
    const c = parseConstraint('~1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 9 }, c)).toBe(true)
  })

  test('tilde: incompatible different minor', () => {
    const c = parseConstraint('~1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 3, patch: 0 }, c)).toBe(false)
  })

  test('tilde: version below min fails', () => {
    const c = parseConstraint('~1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 2 }, c)).toBe(false)
  })

  test('min/max range: version in range', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(satisfiesConstraint({ major: 1, minor: 5, patch: 0 }, c)).toBe(true)
  })

  test('min/max range: version at min inclusive', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(satisfiesConstraint({ major: 1, minor: 0, patch: 0 }, c)).toBe(true)
  })

  test('min/max range: version at max exclusive', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, c)).toBe(false)
  })

  test('min/max range: version below min fails', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 9, patch: 9 }, c)).toBe(false)
  })

  test('>= constraint: version at min', () => {
    const c = parseConstraint('>=1.0.0')
    expect(satisfiesConstraint({ major: 1, minor: 0, patch: 0 }, c)).toBe(true)
  })

  test('>= constraint: version above min', () => {
    const c = parseConstraint('>=1.0.0')
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, c)).toBe(true)
  })

  test('>= constraint: version below min fails', () => {
    const c = parseConstraint('>=1.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 9, patch: 0 }, c)).toBe(false)
  })

  test('exact match: equal version satisfies', () => {
    const c = parseConstraint('1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 3 }, c)).toBe(true)
  })

  test('exact match: different version fails', () => {
    const c = parseConstraint('1.2.3')
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 4 }, c)).toBe(false)
  })
})

describe('checkPluginCompatibility', () => {
  const makeManifest = (overrides: Partial<PluginManifest> = {}): PluginManifest => ({
    name: 'test-plugin',
    version: '1.0.0',
    codeforgeVersion: '^1.0.0',
    description: 'A test plugin',
    main: 'index.js',
    dependencies: {},
    ...overrides,
  })

  test('compatible plugin', () => {
    const manifest = makeManifest()
    const result = checkPluginCompatibility(manifest, { major: 1, minor: 5, patch: 0 })
    expect(result.compatible).toBe(true)
    expect(result.message).toContain('compatible')
  })

  test('incompatible plugin', () => {
    const manifest = makeManifest({ codeforgeVersion: '^2.0.0' })
    const result = checkPluginCompatibility(manifest, { major: 1, minor: 0, patch: 0 })
    expect(result.compatible).toBe(false)
    expect(result.message).toContain('requires')
  })

  test('wildcard constraint always compatible', () => {
    const manifest = makeManifest({ codeforgeVersion: '*' })
    const result = checkPluginCompatibility(manifest, { major: 0, minor: 1, patch: 0 })
    expect(result.compatible).toBe(true)
  })

  test('result includes plugin version', () => {
    const manifest = makeManifest({ version: '2.3.4' })
    const result = checkPluginCompatibility(manifest, { major: 1, minor: 0, patch: 0 })
    expect(result.pluginVersion).toEqual({ major: 2, minor: 3, patch: 4 })
  })

  test('result includes constraint', () => {
    const manifest = makeManifest({ codeforgeVersion: '>=1.0.0 <2.0.0' })
    const result = checkPluginCompatibility(manifest, { major: 1, minor: 0, patch: 0 })
    expect(result.constraint.range).toBe('>=1.0.0 <2.0.0')
  })
})

describe('validateManifest', () => {
  const validManifest = {
    name: 'my-plugin',
    version: '1.0.0',
    codeforgeVersion: '^1.0.0',
    description: 'A plugin',
    main: 'index.js',
    dependencies: {},
  }

  test('valid manifest passes', () => {
    const result = validateManifest(validManifest)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('missing name fails', () => {
    const result = validateManifest({ ...validManifest, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('name must be a non-empty string')
  })

  test('non-string name fails', () => {
    const result = validateManifest({ ...validManifest, name: 123 })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('name'))).toBe(true)
  })

  test('invalid version fails', () => {
    const result = validateManifest({ ...validManifest, version: 'not-semver' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('version'))).toBe(true)
  })

  test('missing codeforgeVersion fails', () => {
    const result = validateManifest({ ...validManifest, codeforgeVersion: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('codeforgeVersion'))).toBe(true)
  })

  test('missing description fails', () => {
    const result = validateManifest({ ...validManifest, description: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('description'))).toBe(true)
  })

  test('missing main fails', () => {
    const result = validateManifest({ ...validManifest, main: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('main'))).toBe(true)
  })

  test('non-object dependencies fails', () => {
    const result = validateManifest({ ...validManifest, dependencies: 'invalid' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('dependencies'))).toBe(true)
  })

  test('null dependencies fails', () => {
    const result = validateManifest({ ...validManifest, dependencies: null })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('dependencies'))).toBe(true)
  })

  test('non-string dependency value fails', () => {
    const result = validateManifest({ ...validManifest, dependencies: { foo: 123 } })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('dependency'))).toBe(true)
  })

  test('valid dependencies with string values passes', () => {
    const result = validateManifest({
      ...validManifest,
      dependencies: { foo: '^1.0.0', bar: '>=2.0.0' },
    })
    expect(result.valid).toBe(true)
  })

  test('null input fails', () => {
    const result = validateManifest(null)
    expect(result.valid).toBe(false)
  })

  test('non-object input fails', () => {
    const result = validateManifest('string')
    expect(result.valid).toBe(false)
  })
})

describe('edge cases', () => {
  test('0.0.0 is valid', () => {
    expect(parseSemVer('0.0.0')).toEqual({ major: 0, minor: 0, patch: 0 })
  })

  test('0.0.1 is valid', () => {
    expect(parseSemVer('0.0.1')).toEqual({ major: 0, minor: 0, patch: 1 })
  })

  test('999.999.999 is valid', () => {
    expect(parseSemVer('999.999.999')).toEqual({ major: 999, minor: 999, patch: 999 })
  })

  test('0.0.0 satisfies ^0.0.0', () => {
    const c = parseConstraint('^0.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 0, patch: 0 }, c)).toBe(true)
  })

  test('0.1.0 satisfies ^0.0.0 (same major 0, >= 0.0.0)', () => {
    const c = parseConstraint('^0.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 1, patch: 0 }, c)).toBe(true)
  })

  test('0.0.1 does not satisfy ~0.0.0', () => {
    const c = parseConstraint('~0.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 1, patch: 0 }, c)).toBe(false)
  })

  test('0.0.1 does satisfy ~0.0.0 for patch', () => {
    const c = parseConstraint('~0.0.0')
    expect(satisfiesConstraint({ major: 0, minor: 0, patch: 1 }, c)).toBe(true)
  })
})
