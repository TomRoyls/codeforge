import { describe, it, expect } from 'vitest'
import {
  parseSemVer,
  formatSemVer,
  compareSemVer,
  parseConstraint,
  satisfiesConstraint,
  checkPluginCompatibility,
  validateManifest,
} from '../src/plugins/version-checker.js'

// ─── parseSemVer ──────────────────────────────────────
describe('parseSemVer', () => {
  it('parses standard semver', () => {
    expect(parseSemVer('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses semver with prerelease', () => {
    expect(parseSemVer('1.2.3-alpha.1')).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'alpha.1',
    })
  })

  it('parses 0.0.0', () => {
    expect(parseSemVer('0.0.0')).toEqual({ major: 0, minor: 0, patch: 0 })
  })

  it('parses large version numbers', () => {
    expect(parseSemVer('100.200.300')).toEqual({ major: 100, minor: 200, patch: 300 })
  })

  it('handles whitespace by trimming', () => {
    expect(parseSemVer('  1.2.3  ')).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses prerelease with hyphens and dots', () => {
    expect(parseSemVer('2.0.0-beta.1-rc2')).toEqual({
      major: 2,
      minor: 0,
      patch: 0,
      prerelease: 'beta.1-rc2',
    })
  })

  it('returns null for empty string', () => {
    expect(parseSemVer('')).toBeNull()
  })

  it('returns null for just numbers', () => {
    expect(parseSemVer('1')).toBeNull()
  })

  it('returns null for two-part version', () => {
    expect(parseSemVer('1.2')).toBeNull()
  })

  it('returns null for v-prefixed', () => {
    expect(parseSemVer('v1.2.3')).toBeNull()
  })

  it('returns null for random string', () => {
    expect(parseSemVer('not-a-version')).toBeNull()
  })

  it('returns null for text after version', () => {
    expect(parseSemVer('1.2.3extra')).toBeNull()
  })

  it('parses prerelease with underscores', () => {
    expect(parseSemVer('1.0.0-dev_build')).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: 'dev_build',
    })
  })
})

// ─── formatSemVer ─────────────────────────────────────
describe('formatSemVer', () => {
  it('formats standard version', () => {
    expect(formatSemVer({ major: 1, minor: 2, patch: 3 })).toBe('1.2.3')
  })

  it('formats version with prerelease', () => {
    expect(formatSemVer({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' })).toBe('1.0.0-alpha')
  })

  it('formats 0.0.0', () => {
    expect(formatSemVer({ major: 0, minor: 0, patch: 0 })).toBe('0.0.0')
  })

  it('round-trips with parseSemVer for standard versions', () => {
    const ver = parseSemVer('3.14.159')!
    expect(formatSemVer(ver)).toBe('3.14.159')
  })

  it('round-trips with parseSemVer for prerelease', () => {
    const ver = parseSemVer('1.0.0-beta.2')!
    expect(formatSemVer(ver)).toBe('1.0.0-beta.2')
  })
})

// ─── compareSemVer ────────────────────────────────────
describe('compareSemVer', () => {
  it('returns 0 for equal versions', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 3 }, { major: 1, minor: 2, patch: 3 })).toBe(0)
  })

  it('returns -1 when a.major < b.major', () => {
    expect(compareSemVer({ major: 1, minor: 9, patch: 9 }, { major: 2, minor: 0, patch: 0 })).toBe(-1)
  })

  it('returns 1 when a.major > b.major', () => {
    expect(compareSemVer({ major: 3, minor: 0, patch: 0 }, { major: 2, minor: 9, patch: 9 })).toBe(1)
  })

  it('returns -1 when a.minor < b.minor (same major)', () => {
    expect(compareSemVer({ major: 1, minor: 1, patch: 9 }, { major: 1, minor: 2, patch: 0 })).toBe(-1)
  })

  it('returns 1 when a.minor > b.minor (same major)', () => {
    expect(compareSemVer({ major: 1, minor: 3, patch: 0 }, { major: 1, minor: 2, patch: 9 })).toBe(1)
  })

  it('returns -1 when a.patch < b.patch (same major, minor)', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 0 }, { major: 1, minor: 2, patch: 1 })).toBe(-1)
  })

  it('returns 1 when a.patch > b.patch (same major, minor)', () => {
    expect(compareSemVer({ major: 1, minor: 2, patch: 5 }, { major: 1, minor: 2, patch: 3 })).toBe(1)
  })

  it('release version is greater than prerelease', () => {
    expect(compareSemVer({ major: 1, minor: 0, patch: 0 }, { major: 1, minor: 0, patch: 0, prerelease: 'alpha' })).toBe(1)
  })

  it('prerelease is less than release', () => {
    expect(compareSemVer({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' }, { major: 1, minor: 0, patch: 0 })).toBe(-1)
  })

  it('compares prerelease strings lexicographically', () => {
    expect(compareSemVer({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' }, { major: 1, minor: 0, patch: 0, prerelease: 'beta' })).toBe(-1)
  })

  it('returns 0 for same prerelease', () => {
    expect(compareSemVer({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' }, { major: 1, minor: 0, patch: 0, prerelease: 'alpha' })).toBe(0)
  })

  it('sorts array of versions correctly', () => {
    const versions = [
      { major: 2, minor: 0, patch: 0 },
      { major: 1, minor: 0, patch: 0 },
      { major: 1, minor: 1, patch: 0 },
      { major: 1, minor: 0, patch: 1 },
    ]
    const sorted = versions.sort(compareSemVer)
    expect(sorted.map(v => formatSemVer(v))).toEqual(['1.0.0', '1.0.1', '1.1.0', '2.0.0'])
  })
})

// ─── parseConstraint ──────────────────────────────────
describe('parseConstraint', () => {
  it('parses wildcard *', () => {
    expect(parseConstraint('*')).toEqual({ range: '*' })
  })

  it('parses empty string as wildcard', () => {
    expect(parseConstraint('')).toEqual({ range: '*' })
  })

  it('parses "latest" as wildcard', () => {
    expect(parseConstraint('latest')).toEqual({ range: '*' })
  })

  it('parses caret constraint', () => {
    const c = parseConstraint('^1.2.3')
    expect(c.range).toBe('^1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses tilde constraint', () => {
    const c = parseConstraint('~1.2.3')
    expect(c.range).toBe('~1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses range constraint >=1.0.0 <2.0.0', () => {
    const c = parseConstraint('>=1.0.0 <2.0.0')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0 })
    expect(c.max).toEqual({ major: 2, minor: 0, patch: 0 })
  })

  it('parses >= constraint', () => {
    const c = parseConstraint('>=1.0.0')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0 })
    expect(c.max).toBeUndefined()
  })

  it('parses exact version as both min and max', () => {
    const c = parseConstraint('1.2.3')
    expect(c.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(c.max).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('handles whitespace', () => {
    const c = parseConstraint('  ^1.2.3  ')
    expect(c.range).toBe('^1.2.3')
  })

  it('handles unrecognized range', () => {
    const c = parseConstraint('some-random-string')
    expect(c.range).toBe('some-random-string')
    expect(c.min).toBeUndefined()
  })

  it('parses range with prerelease', () => {
    const c = parseConstraint('>=1.0.0-alpha <2.0.0-beta')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' })
    expect(c.max).toEqual({ major: 2, minor: 0, patch: 0, prerelease: 'beta' })
  })

  it('parses caret with prerelease', () => {
    const c = parseConstraint('^1.0.0-alpha')
    expect(c.min).toEqual({ major: 1, minor: 0, patch: 0, prerelease: 'alpha' })
  })
})

// ─── satisfiesConstraint ──────────────────────────────
describe('satisfiesConstraint', () => {
  it('wildcard always satisfies', () => {
    expect(satisfiesConstraint({ major: 99, minor: 99, patch: 99 }, { range: '*' })).toBe(true)
  })

  it('caret: satisfies same major, equal minor/patch', () => {
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 3 }, parseConstraint('^1.2.3'))).toBe(true)
  })

  it('caret: satisfies same major, higher minor', () => {
    expect(satisfiesConstraint({ major: 1, minor: 5, patch: 0 }, parseConstraint('^1.2.0'))).toBe(true)
  })

  it('caret: rejects different major', () => {
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, parseConstraint('^1.2.0'))).toBe(false)
  })

  it('caret: rejects lower version same major', () => {
    expect(satisfiesConstraint({ major: 1, minor: 1, patch: 0 }, parseConstraint('^1.2.0'))).toBe(false)
  })

  it('tilde: satisfies same major.minor, higher patch', () => {
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 5 }, parseConstraint('~1.2.0'))).toBe(true)
  })

  it('tilde: rejects different minor', () => {
    expect(satisfiesConstraint({ major: 1, minor: 3, patch: 0 }, parseConstraint('~1.2.0'))).toBe(false)
  })

  it('range: satisfies within range', () => {
    expect(satisfiesConstraint({ major: 1, minor: 5, patch: 0 }, parseConstraint('>=1.0.0 <2.0.0'))).toBe(true)
  })

  it('range: rejects below min', () => {
    expect(satisfiesConstraint({ major: 0, minor: 9, patch: 0 }, parseConstraint('>=1.0.0 <2.0.0'))).toBe(false)
  })

  it('range: rejects at max (exclusive)', () => {
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, parseConstraint('>=1.0.0 <2.0.0'))).toBe(false)
  })

  it('gte: satisfies equal version', () => {
    expect(satisfiesConstraint({ major: 1, minor: 0, patch: 0 }, parseConstraint('>=1.0.0'))).toBe(true)
  })

  it('gte: satisfies higher version', () => {
    expect(satisfiesConstraint({ major: 2, minor: 0, patch: 0 }, parseConstraint('>=1.0.0'))).toBe(true)
  })

  it('gte: rejects lower version', () => {
    expect(satisfiesConstraint({ major: 0, minor: 9, patch: 0 }, parseConstraint('>=1.0.0'))).toBe(false)
  })

  it('exact: satisfies exact match', () => {
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 3 }, parseConstraint('1.2.3'))).toBe(true)
  })

  it('exact: rejects different version', () => {
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 4 }, parseConstraint('1.2.3'))).toBe(false)
  })

  it('unrecognized range returns false', () => {
    expect(satisfiesConstraint({ major: 1, minor: 0, patch: 0 }, { range: 'xyz' })).toBe(false)
  })
})

// ─── checkPluginCompatibility ─────────────────────────
describe('checkPluginCompatibility', () => {
  const baseManifest = {
    name: 'test-plugin',
    version: '1.0.0',
    codeforgeVersion: '^0.1.0',
    description: 'A test plugin',
    main: 'index.js',
    dependencies: {},
  }

  it('returns compatible when version satisfies', () => {
    const result = checkPluginCompatibility(baseManifest, { major: 0, minor: 1, patch: 0 })
    expect(result.compatible).toBe(true)
    expect(result.message).toContain('compatible')
  })

  it('returns incompatible when version does not satisfy', () => {
    const result = checkPluginCompatibility(baseManifest, { major: 1, minor: 0, patch: 0 })
    expect(result.compatible).toBe(false)
    expect(result.message).toContain('requires')
  })

  it('extracts pluginVersion from manifest', () => {
    const result = checkPluginCompatibility(baseManifest, { major: 0, minor: 1, patch: 0 })
    expect(result.pluginVersion).toEqual({ major: 1, minor: 0, patch: 0 })
  })

  it('handles invalid plugin version gracefully', () => {
    const manifest = { ...baseManifest, version: 'not-semver' }
    const result = checkPluginCompatibility(manifest, { major: 0, minor: 1, patch: 0 })
    expect(result.pluginVersion).toEqual({ major: 0, minor: 0, patch: 0 })
  })

  it('includes plugin name in message', () => {
    const result = checkPluginCompatibility(baseManifest, { major: 0, minor: 1, patch: 0 })
    expect(result.message).toContain('test-plugin')
  })

  it('includes CodeForge version in message', () => {
    const result = checkPluginCompatibility(baseManifest, { major: 0, minor: 5, patch: 3 })
    expect(result.message).toContain('0.5.3')
  })

  it('works with wildcard constraint', () => {
    const manifest = { ...baseManifest, codeforgeVersion: '*' }
    const result = checkPluginCompatibility(manifest, { major: 99, minor: 0, patch: 0 })
    expect(result.compatible).toBe(true)
  })
})

// ─── validateManifest ─────────────────────────────────
describe('validateManifest', () => {
  const validManifest = {
    name: 'test-plugin',
    version: '1.0.0',
    codeforgeVersion: '^0.1.0',
    description: 'A test plugin',
    main: 'index.js',
    dependencies: { lodash: '^4.0.0' },
  }

  it('validates correct manifest', () => {
    const result = validateManifest(validManifest)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects null', () => {
    const result = validateManifest(null)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Manifest must be an object')
  })

  it('rejects undefined', () => {
    const result = validateManifest(undefined)
    expect(result.valid).toBe(false)
  })

  it('rejects non-object', () => {
    const result = validateManifest('string')
    expect(result.valid).toBe(false)
  })

  it('rejects missing name', () => {
    const { name, ...noName } = validManifest
    const result = validateManifest(noName)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('name'))).toBe(true)
  })

  it('rejects empty name', () => {
    const result = validateManifest({ ...validManifest, name: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects non-string name', () => {
    const result = validateManifest({ ...validManifest, name: 123 })
    expect(result.valid).toBe(false)
  })

  it('rejects invalid version', () => {
    const result = validateManifest({ ...validManifest, version: 'abc' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('semver'))).toBe(true)
  })

  it('rejects missing codeforgeVersion', () => {
    const { codeforgeVersion, ...noCFV } = validManifest
    const result = validateManifest(noCFV)
    expect(result.valid).toBe(false)
  })

  it('rejects empty description', () => {
    const result = validateManifest({ ...validManifest, description: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects empty main', () => {
    const result = validateManifest({ ...validManifest, main: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects missing dependencies', () => {
    const { dependencies, ...noDeps } = validManifest
    const result = validateManifest(noDeps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('dependencies'))).toBe(true)
  })

  it('rejects non-string dependency value', () => {
    const result = validateManifest({ ...validManifest, dependencies: { foo: 123 } })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('foo'))).toBe(true)
  })

  it('collects multiple errors', () => {
    const result = validateManifest({})
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })

  it('accepts manifest with empty dependencies', () => {
    const result = validateManifest({ ...validManifest, dependencies: {} })
    expect(result.valid).toBe(true)
  })

  it('accepts whitespace-only name as invalid', () => {
    const result = validateManifest({ ...validManifest, name: '   ' })
    expect(result.valid).toBe(false)
  })
})
