import { describe, expect, it } from 'vitest'

import { SemVerParser } from '../../src/core/semver/semver-parser.js'

// ─── Helpers ───

const parser = new SemVerParser()

// ─── parse ───

describe('SemVerParser parse', () => {
  it('parses simple version', () => {
    const v = parser.parse('1.2.3')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(3)
  })

  it('parses version with v prefix', () => {
    const v = parser.parse('v1.2.3')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(3)
  })

  it('defaults minor and patch to 0', () => {
    const v = parser.parse('1')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })

  it('defaults patch to 0', () => {
    const v = parser.parse('1.2')
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(0)
  })

  it('parses prerelease', () => {
    const v = parser.parse('1.2.3-alpha.1')
    expect(v.prerelease).toEqual(['alpha', '1'])
  })

  it('parses build metadata', () => {
    const v = parser.parse('1.2.3+build.123')
    expect(v.buildMetadata).toEqual(['build', '123'])
  })

  it('parses prerelease and build metadata', () => {
    const v = parser.parse('1.2.3-beta.1+build.456')
    expect(v.prerelease).toEqual(['beta', '1'])
    expect(v.buildMetadata).toEqual(['build', '456'])
  })

  it('stores raw version', () => {
    const v = parser.parse('v1.2.3')
    expect(v.raw).toBe('v1.2.3')
  })

  it('throws for invalid version', () => {
    expect(() => parser.parse('not-a-version')).toThrow('Invalid semver')
  })

  it('parses zero version', () => {
    const v = parser.parse('0.0.0')
    expect(v.major).toBe(0)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })
})

// ─── format ───

describe('SemVerParser format', () => {
  it('formats basic version', () => {
    expect(parser.format({ major: 1, minor: 2, patch: 3, prerelease: [], buildMetadata: [], raw: '' })).toBe('1.2.3')
  })

  it('formats with prerelease', () => {
    expect(parser.format({ major: 1, minor: 2, patch: 3, prerelease: ['alpha', '1'], buildMetadata: [], raw: '' })).toBe('1.2.3-alpha.1')
  })

  it('formats with build metadata', () => {
    expect(parser.format({ major: 1, minor: 2, patch: 3, prerelease: [], buildMetadata: ['build', '42'], raw: '' })).toBe('1.2.3+build.42')
  })

  it('formats with prerelease and build metadata', () => {
    expect(parser.format({ major: 1, minor: 0, patch: 0, prerelease: ['rc', '1'], buildMetadata: ['sha', 'abc'], raw: '' })).toBe('1.0.0-rc.1+sha.abc')
  })
})

// ─── compare ───

describe('SemVerParser compare', () => {
  it('compares major version', () => {
    const a = parser.parse('2.0.0')
    const b = parser.parse('1.0.0')
    expect(parser.compare(a, b)).toBe(1)
    expect(parser.compare(b, a)).toBe(-1)
  })

  it('compares minor version', () => {
    const a = parser.parse('1.2.0')
    const b = parser.parse('1.1.0')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('compares patch version', () => {
    const a = parser.parse('1.0.2')
    const b = parser.parse('1.0.1')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('returns 0 for equal versions', () => {
    const a = parser.parse('1.2.3')
    const b = parser.parse('1.2.3')
    expect(parser.compare(a, b)).toBe(0)
  })

  it('prerelease has lower precedence', () => {
    const a = parser.parse('1.0.0')
    const b = parser.parse('1.0.0-alpha')
    expect(parser.compare(a, b)).toBe(1)
    expect(parser.compare(b, a)).toBe(-1)
  })

  it('numeric prerelease has lower precedence than string', () => {
    const a = parser.parse('1.0.0-alpha.1')
    const b = parser.parse('1.0.0-alpha.beta')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('compares numeric prerelease values', () => {
    const a = parser.parse('1.0.0-alpha.2')
    const b = parser.parse('1.0.0-alpha.1')
    expect(parser.compare(a, b)).toBe(1)
  })
})

// ─── equals, gt, gte, lt, lte ───

describe('SemVerParser comparison helpers', () => {
  const v1 = parser.parse('1.0.0')
  const v2 = parser.parse('2.0.0')
  const v3 = parser.parse('1.0.0')

  it('equals', () => {
    expect(parser.equals(v1, v3)).toBe(true)
    expect(parser.equals(v1, v2)).toBe(false)
  })

  it('gt', () => {
    expect(parser.gt(v2, v1)).toBe(true)
    expect(parser.gt(v1, v2)).toBe(false)
    expect(parser.gt(v1, v3)).toBe(false)
  })

  it('gte', () => {
    expect(parser.gte(v2, v1)).toBe(true)
    expect(parser.gte(v1, v3)).toBe(true)
    expect(parser.gte(v1, v2)).toBe(false)
  })

  it('lt', () => {
    expect(parser.lt(v1, v2)).toBe(true)
    expect(parser.lt(v2, v1)).toBe(false)
    expect(parser.lt(v1, v3)).toBe(false)
  })

  it('lte', () => {
    expect(parser.lte(v1, v2)).toBe(true)
    expect(parser.lte(v1, v3)).toBe(true)
    expect(parser.lte(v2, v1)).toBe(false)
  })
})

// ─── isValid ───

describe('SemVerParser isValid', () => {
  it('returns true for valid version', () => {
    expect(parser.isValid('1.2.3')).toBe(true)
  })

  it('returns true for v-prefixed version', () => {
    expect(parser.isValid('v1.2.3')).toBe(true)
  })

  it('returns false for invalid string', () => {
    expect(parser.isValid('not-a-version')).toBe(false)
  })

  it('returns true for version with prerelease', () => {
    expect(parser.isValid('1.0.0-alpha')).toBe(true)
  })

  it('returns true for version with build metadata', () => {
    expect(parser.isValid('1.0.0+build')).toBe(true)
  })
})

// ─── clean ───

describe('SemVerParser clean', () => {
  it('removes v prefix', () => {
    expect(parser.clean('v1.2.3')).toBe('1.2.3')
  })

  it('removes = prefix', () => {
    expect(parser.clean('=1.2.3')).toBe('1.2.3')
  })

  it('trims whitespace', () => {
    expect(parser.clean(' 1.2.3 ')).toBe('1.2.3')
  })

  it('removes multiple v prefixes', () => {
    expect(parser.clean('vv1.2.3')).toBe('1.2.3')
  })
})

// ─── sort ───

describe('SemVerParser sort', () => {
  it('sorts versions ascending', () => {
    const versions = [parser.parse('3.0.0'), parser.parse('1.0.0'), parser.parse('2.0.0')]
    const sorted = parser.sort(versions)
    expect(sorted[0].major).toBe(1)
    expect(sorted[1].major).toBe(2)
    expect(sorted[2].major).toBe(3)
  })

  it('handles already sorted', () => {
    const versions = [parser.parse('1.0.0'), parser.parse('2.0.0')]
    const sorted = parser.sort(versions)
    expect(sorted[0].major).toBe(1)
    expect(sorted[1].major).toBe(2)
  })

  it('does not mutate original', () => {
    const versions = [parser.parse('3.0.0'), parser.parse('1.0.0')]
    const sorted = parser.sort(versions)
    expect(versions[0].major).toBe(3)
    expect(sorted[0].major).toBe(1)
  })
})

// ─── increment ───

describe('SemVerParser increment', () => {
  it('increments major', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'major')
    expect(next.major).toBe(2)
    expect(next.minor).toBe(0)
    expect(next.patch).toBe(0)
  })

  it('increments minor', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'minor')
    expect(next.major).toBe(1)
    expect(next.minor).toBe(3)
    expect(next.patch).toBe(0)
  })

  it('increments patch', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'patch')
    expect(next.major).toBe(1)
    expect(next.minor).toBe(2)
    expect(next.patch).toBe(4)
  })

  it('increments prerelease from release', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'prerelease')
    expect(next.major).toBe(1)
    expect(next.minor).toBe(2)
    expect(next.patch).toBe(4)
    expect(next.prerelease).toEqual(['rc', '0'])
  })

  it('increments prerelease with numeric suffix', () => {
    const v = parser.parse('1.2.3-rc.1')
    const next = parser.increment(v, 'prerelease')
    expect(next.prerelease).toEqual(['rc', '2'])
  })

  it('none returns copy', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'none')
    expect(next).toEqual(v)
    expect(next).not.toBe(v)
  })

  it('increments prerelease with custom prefix', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'prerelease', 'beta')
    expect(next.prerelease).toEqual(['beta', '0'])
  })
})

// ─── satisfies ───

describe('SemVerParser satisfies', () => {
  it('satisfies exact version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '1.2.3')).toBe(true)
  })

  it('does not satisfy different version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '2.0.0')).toBe(false)
  })

  it('satisfies >= range', () => {
    const v = parser.parse('2.0.0')
    expect(parser.satisfies(v, '>=1.0.0')).toBe(true)
  })

  it('does not satisfy >= range', () => {
    const v = parser.parse('0.9.0')
    expect(parser.satisfies(v, '>=1.0.0')).toBe(false)
  })

  it('satisfies < range', () => {
    const v = parser.parse('0.9.0')
    expect(parser.satisfies(v, '<1.0.0')).toBe(true)
  })

  it('satisfies ^ range', () => {
    const v = parser.parse('1.2.5')
    expect(parser.satisfies(v, '^1.2.0')).toBe(true)
  })

  it('does not satisfy ^ range (different major)', () => {
    const v = parser.parse('2.0.0')
    expect(parser.satisfies(v, '^1.2.0')).toBe(false)
  })

  it('satisfies ~ range', () => {
    const v = parser.parse('1.2.5')
    expect(parser.satisfies(v, '~1.2.0')).toBe(true)
  })

  it('does not satisfy ~ range (different minor)', () => {
    const v = parser.parse('1.3.0')
    expect(parser.satisfies(v, '~1.2.0')).toBe(false)
  })

  it('satisfies * wildcard', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '*')).toBe(true)
  })

  it('satisfies x-range', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '1.x')).toBe(true)
  })

  it('satisfies OR range', () => {
    const v = parser.parse('1.0.0')
    expect(parser.satisfies(v, '1.0.0 || 2.0.0')).toBe(true)
  })
})
