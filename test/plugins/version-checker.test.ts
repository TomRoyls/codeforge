import { describe, it, expect } from 'vitest'
import {
  parseSemVer,
  formatSemVer,
  compareSemVer,
  parseConstraint,
  satisfiesConstraint,
  checkPluginCompatibility,
  validateManifest,
} from '../../src/plugins/version-checker.js'
import type { SemVer, VersionConstraint, PluginManifest } from '../../src/plugins/version-types.js'

// ─── parseSemVer ───

describe('parseSemVer', () => {
  it('parses a basic semver string', () => {
    const result = parseSemVer('1.2.3')
    expect(result).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses 0.0.0', () => {
    const result = parseSemVer('0.0.0')
    expect(result).toEqual({ major: 0, minor: 0, patch: 0 })
  })

  it('parses a version with prerelease tag', () => {
    const result = parseSemVer('1.2.3-alpha.1')
    expect(result).toEqual({ major: 1, minor: 2, patch: 3, prerelease: 'alpha.1' })
  })

  it('parses a version with complex prerelease', () => {
    const result = parseSemVer('2.0.0-beta.2.build.42')
    expect(result).toEqual({ major: 2, minor: 0, patch: 0, prerelease: 'beta.2.build.42' })
  })

  it('parses a version with hyphenated prerelease', () => {
    const result = parseSemVer('3.1.4-rc-1')
    expect(result).toEqual({ major: 3, minor: 1, patch: 4, prerelease: 'rc-1' })
  })

  it('trims whitespace before parsing', () => {
    const result = parseSemVer('  1.2.3  ')
    expect(result).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('returns null for empty string', () => {
    expect(parseSemVer('')).toBeNull()
  })

  it('returns null for letters only', () => {
    expect(parseSemVer('abc')).toBeNull()
  })

  it('returns null for missing patch version', () => {
    expect(parseSemVer('1.2')).toBeNull()
  })

  it('returns null for missing minor and patch', () => {
    expect(parseSemVer('1')).toBeNull()
  })

  it('returns null for extra dot segments', () => {
    expect(parseSemVer('1.2.3.4')).toBeNull()
  })

  it('returns null for spaces within version', () => {
    expect(parseSemVer('1 .2.3')).toBeNull()
  })

  it('returns null for "v" prefix', () => {
    expect(parseSemVer('v1.2.3')).toBeNull()
  })
})

// ─── formatSemVer ───

describe('formatSemVer', () => {
  it('formats a basic version', () => {
    const ver: SemVer = { major: 1, minor: 2, patch: 3 }
    expect(formatSemVer(ver)).toBe('1.2.3')
  })

  it('formats a version with prerelease', () => {
    const ver: SemVer = { major: 2, minor: 0, patch: 1, prerelease: 'beta.3' }
    expect(formatSemVer(ver)).toBe('2.0.1-beta.3')
  })

  it('formats 0.0.0', () => {
    const ver: SemVer = { major: 0, minor: 0, patch: 0 }
    expect(formatSemVer(ver)).toBe('0.0.0')
  })
})

// ─── compareSemVer ───

describe('compareSemVer', () => {
  it('returns 0 for equal versions', () => {
    const a: SemVer = { major: 1, minor: 2, patch: 3 }
    const b: SemVer = { major: 1, minor: 2, patch: 3 }
    expect(compareSemVer(a, b)).toBe(0)
  })

  it('returns -1 when major is less', () => {
    const a: SemVer = { major: 1, minor: 9, patch: 9 }
    const b: SemVer = { major: 2, minor: 0, patch: 0 }
    expect(compareSemVer(a, b)).toBe(-1)
  })

  it('returns 1 when major is greater', () => {
    const a: SemVer = { major: 3, minor: 0, patch: 0 }
    const b: SemVer = { major: 2, minor: 9, patch: 9 }
    expect(compareSemVer(a, b)).toBe(1)
  })

  it('returns -1 when minor is less (same major)', () => {
    const a: SemVer = { major: 1, minor: 1, patch: 9 }
    const b: SemVer = { major: 1, minor: 2, patch: 0 }
    expect(compareSemVer(a, b)).toBe(-1)
  })

  it('returns 1 when minor is greater (same major)', () => {
    const a: SemVer = { major: 1, minor: 3, patch: 0 }
    const b: SemVer = { major: 1, minor: 2, patch: 9 }
    expect(compareSemVer(a, b)).toBe(1)
  })

  it('returns -1 when patch is less (same major, minor)', () => {
    const a: SemVer = { major: 1, minor: 2, patch: 2 }
    const b: SemVer = { major: 1, minor: 2, patch: 3 }
    expect(compareSemVer(a, b)).toBe(-1)
  })

  it('returns 1 when patch is greater (same major, minor)', () => {
    const a: SemVer = { major: 1, minor: 2, patch: 4 }
    const b: SemVer = { major: 1, minor: 2, patch: 3 }
    expect(compareSemVer(a, b)).toBe(1)
  })

  it('orders release greater than prerelease', () => {
    const release: SemVer = { major: 1, minor: 2, patch: 3 }
    const pre: SemVer = { major: 1, minor: 2, patch: 3, prerelease: 'alpha' }
    expect(compareSemVer(release, pre)).toBe(1)
    expect(compareSemVer(pre, release)).toBe(-1)
  })

  it('orders alpha before beta', () => {
    const alpha: SemVer = { major: 1, minor: 0, patch: 0, prerelease: 'alpha' }
    const beta: SemVer = { major: 1, minor: 0, patch: 0, prerelease: 'beta' }
    expect(compareSemVer(alpha, beta)).toBe(-1)
    expect(compareSemVer(beta, alpha)).toBe(1)
  })

  it('returns 0 for equal prerelease strings', () => {
    const a: SemVer = { major: 1, minor: 0, patch: 0, prerelease: 'rc.1' }
    const b: SemVer = { major: 1, minor: 0, patch: 0, prerelease: 'rc.1' }
    expect(compareSemVer(a, b)).toBe(0)
  })
})

// ─── parseConstraint ───

describe('parseConstraint', () => {
  it('parses "*" as wildcard', () => {
    expect(parseConstraint('*')).toEqual({ range: '*' })
  })

  it('parses empty string as wildcard', () => {
    expect(parseConstraint('')).toEqual({ range: '*' })
  })

  it('parses "latest" as wildcard', () => {
    expect(parseConstraint('latest')).toEqual({ range: '*' })
  })

  it('parses caret constraint', () => {
    const result = parseConstraint('^1.2.3')
    expect(result.range).toBe('^1.2.3')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(result.max).toBeUndefined()
  })

  it('parses tilde constraint', () => {
    const result = parseConstraint('~1.2.3')
    expect(result.range).toBe('~1.2.3')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(result.max).toBeUndefined()
  })

  it('parses gte constraint', () => {
    const result = parseConstraint('>=1.2.3')
    expect(result.range).toBe('>=1.2.3')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3 })
  })

  it('parses range constraint ">=1.2.3 <2.0.0"', () => {
    const result = parseConstraint('>=1.2.3 <2.0.0')
    expect(result.range).toBe('>=1.2.3 <2.0.0')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(result.max).toEqual({ major: 2, minor: 0, patch: 0 })
  })

  it('parses exact version as min == max', () => {
    const result = parseConstraint('1.2.3')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(result.max).toEqual({ major: 1, minor: 2, patch: 3 })
    expect(result.range).toBe('1.2.3')
  })

  it('trims whitespace from input', () => {
    expect(parseConstraint('  *  ')).toEqual({ range: '*' })
  })

  it('returns raw range for unrecognized strings', () => {
    const result = parseConstraint('not-a-version')
    expect(result.range).toBe('not-a-version')
    expect(result.min).toBeUndefined()
    expect(result.max).toBeUndefined()
  })

  it('parses caret constraint with prerelease', () => {
    const result = parseConstraint('^1.2.3-beta.1')
    expect(result.min).toEqual({ major: 1, minor: 2, patch: 3, prerelease: 'beta.1' })
  })

  it('parses tilde constraint with prerelease', () => {
    const result = parseConstraint('~2.0.0-alpha')
    expect(result.min).toEqual({ major: 2, minor: 0, patch: 0, prerelease: 'alpha' })
  })
})

// ─── satisfiesConstraint ───

describe('satisfiesConstraint', () => {
  it('returns true for wildcard constraint', () => {
    const ver: SemVer = { major: 99, minor: 99, patch: 99 }
    expect(satisfiesConstraint(ver, { range: '*' })).toBe(true)
  })

  it('returns true for "latest" range', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    expect(satisfiesConstraint(ver, { range: 'latest' })).toBe(true)
  })

  it('returns true for empty range', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    expect(satisfiesConstraint(ver, { range: '' })).toBe(true)
  })

  it('matches exact version constraint', () => {
    const ver: SemVer = { major: 1, minor: 2, patch: 3 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      max: { major: 1, minor: 2, patch: 3 },
      range: '1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
  })

  it('rejects non-matching exact version', () => {
    const ver: SemVer = { major: 1, minor: 2, patch: 4 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      max: { major: 1, minor: 2, patch: 3 },
      range: '1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('caret: matches same major, higher minor', () => {
    const ver: SemVer = { major: 1, minor: 5, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '^1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
  })

  it('caret: rejects different major', () => {
    const ver: SemVer = { major: 2, minor: 0, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '^1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('caret: rejects version below minimum', () => {
    const ver: SemVer = { major: 1, minor: 1, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '^1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('tilde: matches same major.minor, higher patch', () => {
    const ver: SemVer = { major: 1, minor: 2, patch: 9 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '~1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
  })

  it('tilde: rejects different minor', () => {
    const ver: SemVer = { major: 1, minor: 3, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '~1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('gte: satisfies version equal or above', () => {
    const ver: SemVer = { major: 2, minor: 0, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '>=1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
    expect(satisfiesConstraint({ major: 1, minor: 2, patch: 3 }, constraint)).toBe(true)
  })

  it('gte: rejects version below minimum', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      range: '>=1.2.3',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('range: satisfies version within range', () => {
    const ver: SemVer = { major: 1, minor: 5, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      max: { major: 2, minor: 0, patch: 0 },
      range: '>=1.2.3 <2.0.0',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
  })

  it('range: rejects version at or above max', () => {
    const ver: SemVer = { major: 2, minor: 0, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      max: { major: 2, minor: 0, patch: 0 },
      range: '>=1.2.3 <2.0.0',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('range: rejects version below min', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 3 },
      max: { major: 2, minor: 0, patch: 0 },
      range: '>=1.2.3 <2.0.0',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('prerelease within caret range', () => {
    const ver: SemVer = { major: 1, minor: 3, patch: 0, prerelease: 'beta' }
    const constraint: VersionConstraint = {
      min: { major: 1, minor: 2, patch: 0 },
      range: '^1.2.0',
    }
    expect(satisfiesConstraint(ver, constraint)).toBe(true)
  })

  it('returns false when caret constraint has no min', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    const constraint: VersionConstraint = { range: '^' }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })

  it('returns false when tilde constraint has no min', () => {
    const ver: SemVer = { major: 1, minor: 0, patch: 0 }
    const constraint: VersionConstraint = { range: '~' }
    expect(satisfiesConstraint(ver, constraint)).toBe(false)
  })
})

// ─── checkPluginCompatibility ───

describe('checkPluginCompatibility', () => {
  const codeforgeVersion: SemVer = { major: 1, minor: 5, patch: 0 }

  it('returns compatible result for matching version', () => {
    const manifest: PluginManifest = {
      name: 'test-plugin',
      version: '1.0.0',
      codeforgeVersion: '^1.0.0',
      description: 'A test plugin',
      main: 'index.js',
      dependencies: {},
    }
    const result = checkPluginCompatibility(manifest, codeforgeVersion)
    expect(result.compatible).toBe(true)
    expect(result.pluginVersion).toEqual({ major: 1, minor: 0, patch: 0 })
    expect(result.message).toContain('test-plugin')
    expect(result.message).toContain('compatible')
  })

  it('returns incompatible result for non-matching version', () => {
    const manifest: PluginManifest = {
      name: 'bad-plugin',
      version: '2.0.0',
      codeforgeVersion: '^2.0.0',
      description: 'Requires v2',
      main: 'index.js',
      dependencies: {},
    }
    const result = checkPluginCompatibility(manifest, codeforgeVersion)
    expect(result.compatible).toBe(false)
    expect(result.message).toContain('requires')
    expect(result.message).toContain('^2.0.0')
    expect(result.message).toContain('1.5.0')
  })

  it('formats message with plugin name and version', () => {
    const manifest: PluginManifest = {
      name: 'my-plugin',
      version: '3.1.4',
      codeforgeVersion: '*',
      description: 'desc',
      main: 'index.js',
      dependencies: {},
    }
    const result = checkPluginCompatibility(manifest, codeforgeVersion)
    expect(result.message).toContain('"my-plugin"')
    expect(result.message).toContain('v3.1.4')
  })

  it('uses fallback version 0.0.0 for invalid plugin version', () => {
    const manifest: PluginManifest = {
      name: 'bad-ver',
      version: 'not-semver',
      codeforgeVersion: '*',
      description: 'desc',
      main: 'index.js',
      dependencies: {},
    }
    const result = checkPluginCompatibility(manifest, codeforgeVersion)
    expect(result.pluginVersion).toEqual({ major: 0, minor: 0, patch: 0 })
  })
})

// ─── validateManifest ───

describe('validateManifest', () => {
  const validManifest: PluginManifest = {
    name: 'my-plugin',
    version: '1.0.0',
    codeforgeVersion: '^1.0.0',
    description: 'A great plugin',
    main: 'dist/index.js',
    dependencies: { lodash: '^4.0.0' },
  }

  it('validates a correct manifest', () => {
    const result = validateManifest(validManifest)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('returns error for null input', () => {
    const result = validateManifest(null)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Manifest must be an object')
  })

  it('returns error for undefined input', () => {
    const result = validateManifest(undefined)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Manifest must be an object')
  })

  it('returns error for string input', () => {
    const result = validateManifest('not-an-object')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Manifest must be an object')
  })

  it('reports missing name field', () => {
    const result = validateManifest({ ...validManifest, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('name must be a non-empty string')
  })

  it('reports missing version field', () => {
    const result = validateManifest({ ...validManifest, version: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('version must be a valid semver string')
  })

  it('reports invalid version format', () => {
    const result = validateManifest({ ...validManifest, version: 'abc' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('version must be a valid semver string')
  })

  it('reports missing codeforgeVersion', () => {
    const result = validateManifest({ ...validManifest, codeforgeVersion: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('codeforgeVersion must be a non-empty string')
  })

  it('reports missing description', () => {
    const result = validateManifest({ ...validManifest, description: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('description must be a non-empty string')
  })

  it('reports missing main', () => {
    const result = validateManifest({ ...validManifest, main: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('main must be a non-empty string')
  })

  it('reports null dependencies', () => {
    const result = validateManifest({ ...validManifest, dependencies: null })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('dependencies must be an object')
  })

  it('reports non-string dependency values', () => {
    const result = validateManifest({
      ...validManifest,
      dependencies: { lodash: 4 },
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('must have a string version constraint'))).toBe(true)
  })

  it('collects multiple errors at once', () => {
    const result = validateManifest({})
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(5)
  })
})
