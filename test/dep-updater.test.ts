import { describe, it, expect } from 'vitest'
import { VersionParser } from '../src/core/dep-updater/version-parser.js'
import { UpdateResolver } from '../src/core/dep-updater/update-resolver.js'
import { LockfileAnalyzer } from '../src/core/dep-updater/lockfile-analyzer.js'
import type {
  PackageVersion,
  DependencyInfo,
  UpdateEntry,
  LockfileEntry,
} from '../src/core/dep-updater/types.js'

// ─── VersionParser – parse ──────────────────────────────────────────
describe('VersionParser.parse', () => {
  const parser = new VersionParser()

  it('parses a simple version', () => {
    const v = parser.parse('1.2.3')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(3)
    expect(v.prerelease).toEqual([])
    expect(v.build).toEqual([])
  })

  it('parses version with v prefix', () => {
    const v = parser.parse('v2.0.1')
    expect(v.major).toBe(2)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(1)
  })

  it('parses version with = prefix', () => {
    const v = parser.parse('=3.1.4')
    expect(v.major).toBe(3)
    expect(v.minor).toBe(1)
    expect(v.patch).toBe(4)
  })

  it('parses version with v and = combined (v first)', () => {
    const v = parser.parse('v=1.0.0')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })

  it('parses major only (no minor/patch)', () => {
    const v = parser.parse('5')
    expect(v.major).toBe(5)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })

  it('parses major.minor only', () => {
    const v = parser.parse('1.2')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(0)
  })

  it('parses zero version', () => {
    const v = parser.parse('0.0.0')
    expect(v.major).toBe(0)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })

  it('parses version with prerelease', () => {
    const v = parser.parse('1.2.3-alpha')
    expect(v.prerelease).toEqual(['alpha'])
  })

  it('parses version with dotted prerelease', () => {
    const v = parser.parse('1.2.3-alpha.1.beta')
    expect(v.prerelease).toEqual(['alpha', '1', 'beta'])
  })

  it('parses version with build metadata', () => {
    const v = parser.parse('1.2.3+build.123')
    expect(v.build).toEqual(['build', '123'])
  })

  it('parses version with prerelease and build', () => {
    const v = parser.parse('1.2.3-beta.1+build.456')
    expect(v.prerelease).toEqual(['beta', '1'])
    expect(v.build).toEqual(['build', '456'])
  })

  it('sets raw to normalized form', () => {
    const v = parser.parse('1.2.3')
    expect(v.raw).toBe('1.2.3')
  })

  it('sets raw with prerelease included', () => {
    const v = parser.parse('1.0.0-alpha.1')
    expect(v.raw).toBe('1.0.0-alpha.1')
  })

  it('sets raw with build included', () => {
    const v = parser.parse('2.0.0+build.99')
    expect(v.raw).toBe('2.0.0+build.99')
  })

  it('throws on empty string', () => {
    expect(() => parser.parse('')).toThrow('Invalid version')
  })

  it('throws on non-version string', () => {
    expect(() => parser.parse('not-a-version')).toThrow('Invalid version')
  })

  it('throws on random text', () => {
    expect(() => parser.parse('hello world')).toThrow('Invalid version')
  })

  it('parses large version numbers', () => {
    const v = parser.parse('100.200.300')
    expect(v.major).toBe(100)
    expect(v.minor).toBe(200)
    expect(v.patch).toBe(300)
  })

  it('strips leading v before = ', () => {
    const v = parser.parse('v10.0.0')
    expect(v.major).toBe(10)
  })
})

// ─── VersionParser – format ─────────────────────────────────────────
describe('VersionParser.format', () => {
  const parser = new VersionParser()

  it('formats basic version', () => {
    const v: PackageVersion = { major: 1, minor: 2, patch: 3, prerelease: [], build: [], raw: '' }
    expect(parser.format(v)).toBe('1.2.3')
  })

  it('formats version with prerelease', () => {
    const v: PackageVersion = { major: 1, minor: 0, patch: 0, prerelease: ['beta', '2'], build: [], raw: '' }
    expect(parser.format(v)).toBe('1.0.0-beta.2')
  })

  it('formats version with build', () => {
    const v: PackageVersion = { major: 2, minor: 1, patch: 0, prerelease: [], build: ['build', '42'], raw: '' }
    expect(parser.format(v)).toBe('2.1.0+build.42')
  })

  it('formats version with prerelease and build', () => {
    const v: PackageVersion = { major: 3, minor: 0, patch: 1, prerelease: ['rc', '1'], build: ['sha', 'abc'], raw: '' }
    expect(parser.format(v)).toBe('3.0.1-rc.1+sha.abc')
  })

  it('formats zero version', () => {
    const v: PackageVersion = { major: 0, minor: 0, patch: 0, prerelease: [], build: [], raw: '' }
    expect(parser.format(v)).toBe('0.0.0')
  })

  it('round-trips parse then format', () => {
    const parser2 = new VersionParser()
    const original = '1.2.3-alpha.1+build.2'
    const v = parser2.parse(original)
    expect(parser2.format(v)).toBe('1.2.3-alpha.1+build.2')
  })
})

// ─── VersionParser – compare ────────────────────────────────────────
describe('VersionParser.compare', () => {
  const parser = new VersionParser()

  it('returns 0 for equal versions', () => {
    const a = parser.parse('1.2.3')
    const b = parser.parse('1.2.3')
    expect(parser.compare(a, b)).toBe(0)
  })

  it('returns 1 when major is greater', () => {
    const a = parser.parse('2.0.0')
    const b = parser.parse('1.0.0')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('returns -1 when major is less', () => {
    const a = parser.parse('1.0.0')
    const b = parser.parse('2.0.0')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('returns 1 when minor is greater (same major)', () => {
    const a = parser.parse('1.3.0')
    const b = parser.parse('1.2.0')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('returns -1 when minor is less (same major)', () => {
    const a = parser.parse('1.1.0')
    const b = parser.parse('1.2.0')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('returns 1 when patch is greater (same major/minor)', () => {
    const a = parser.parse('1.2.4')
    const b = parser.parse('1.2.3')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('returns -1 when patch is less (same major/minor)', () => {
    const a = parser.parse('1.2.2')
    const b = parser.parse('1.2.3')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('release version is greater than prerelease', () => {
    const release = parser.parse('1.2.3')
    const pre = parser.parse('1.2.3-alpha')
    expect(parser.compare(release, pre)).toBe(1)
  })

  it('prerelease version is less than release', () => {
    const pre = parser.parse('1.2.3-alpha')
    const release = parser.parse('1.2.3')
    expect(parser.compare(pre, release)).toBe(-1)
  })

  it('compares prerelease identifiers lexicographically', () => {
    const a = parser.parse('1.0.0-beta')
    const b = parser.parse('1.0.0-alpha')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('numeric prerelease identifiers are less than string', () => {
    const num = parser.parse('1.0.0-1')
    const str = parser.parse('1.0.0-alpha')
    expect(parser.compare(num, str)).toBe(-1)
  })

  it('compares numeric prerelease identifiers numerically', () => {
    const a = parser.parse('1.0.0-2')
    const b = parser.parse('1.0.0-1')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('shorter prerelease is less when prefix matches', () => {
    const a = parser.parse('1.0.0-alpha')
    const b = parser.parse('1.0.0-alpha.1')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('longer prerelease is greater when prefix matches', () => {
    const a = parser.parse('1.0.0-alpha.1')
    const b = parser.parse('1.0.0-alpha')
    expect(parser.compare(a, b)).toBe(1)
  })

  it('both prerelease empty returns 0', () => {
    const a = parser.parse('1.0.0')
    const b = parser.parse('1.0.0')
    expect(parser.compare(a, b)).toBe(0)
  })
})

// ─── VersionParser – satisfies ──────────────────────────────────────
describe('VersionParser.satisfies', () => {
  const parser = new VersionParser()

  it('* matches any version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '*')).toBe(true)
  })

  it('empty string matches any version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '')).toBe(true)
  })

  it('exact match satisfies', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '1.2.3')).toBe(true)
  })

  it('non-matching exact does not satisfy', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '1.2.4')).toBe(false)
  })

  it('^ matches same major with higher minor/patch', () => {
    const v = parser.parse('1.5.0')
    expect(parser.satisfies(v, '^1.2.0')).toBe(true)
  })

  it('^ does not match different major', () => {
    const v = parser.parse('2.0.0')
    expect(parser.satisfies(v, '^1.2.0')).toBe(false)
  })

  it('^0.x pins to same minor', () => {
    const v = parser.parse('0.2.5')
    expect(parser.satisfies(v, '^0.2.0')).toBe(true)
  })

  it('^0.x does not match different minor', () => {
    const v = parser.parse('0.3.0')
    expect(parser.satisfies(v, '^0.2.0')).toBe(false)
  })

  it('^0.0.x pins to exact patch', () => {
    const v = parser.parse('0.0.3')
    expect(parser.satisfies(v, '^0.0.3')).toBe(true)
  })

  it('^0.0.x does not match different patch', () => {
    const v = parser.parse('0.0.4')
    expect(parser.satisfies(v, '^0.0.3')).toBe(false)
  })

  it('^ does not match prerelease', () => {
    const v = parser.parse('1.3.0-beta')
    expect(parser.satisfies(v, '^1.2.0')).toBe(false)
  })

  it('~ matches same major.minor with higher patch', () => {
    const v = parser.parse('1.2.5')
    expect(parser.satisfies(v, '~1.2.3')).toBe(true)
  })

  it('~ does not match different minor', () => {
    const v = parser.parse('1.3.0')
    expect(parser.satisfies(v, '~1.2.3')).toBe(false)
  })

  it('~ does not match lower patch', () => {
    const v = parser.parse('1.2.2')
    expect(parser.satisfies(v, '~1.2.3')).toBe(false)
  })

  it('~ does not match prerelease', () => {
    const v = parser.parse('1.2.4-beta')
    expect(parser.satisfies(v, '~1.2.3')).toBe(false)
  })

  it('>= matches equal version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '>=1.2.3')).toBe(true)
  })

  it('>= matches greater version', () => {
    const v = parser.parse('1.3.0')
    expect(parser.satisfies(v, '>=1.2.3')).toBe(true)
  })

  it('>= does not match lesser version', () => {
    const v = parser.parse('1.2.2')
    expect(parser.satisfies(v, '>=1.2.3')).toBe(false)
  })

  it('> matches greater version', () => {
    const v = parser.parse('1.2.4')
    expect(parser.satisfies(v, '>1.2.3')).toBe(true)
  })

  it('> does not match equal version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '>1.2.3')).toBe(false)
  })

  it('<= matches equal version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '<=1.2.3')).toBe(true)
  })

  it('<= matches lesser version', () => {
    const v = parser.parse('1.2.2')
    expect(parser.satisfies(v, '<=1.2.3')).toBe(true)
  })

  it('<= does not match greater version', () => {
    const v = parser.parse('1.2.4')
    expect(parser.satisfies(v, '<=1.2.3')).toBe(false)
  })

  it('< matches lesser version', () => {
    const v = parser.parse('1.2.2')
    expect(parser.satisfies(v, '<1.2.3')).toBe(true)
  })

  it('< does not match equal version', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '<1.2.3')).toBe(false)
  })

  it('1.x matches any minor/patch in major 1', () => {
    const v = parser.parse('1.9.9')
    expect(parser.satisfies(v, '1.x')).toBe(true)
  })

  it('1.x does not match different major', () => {
    const v = parser.parse('2.0.0')
    expect(parser.satisfies(v, '1.x')).toBe(false)
  })

  it('1.2.x matches any patch in major.minor', () => {
    const v = parser.parse('1.2.99')
    expect(parser.satisfies(v, '1.2.x')).toBe(true)
  })

  it('1.2.x does not match different minor', () => {
    const v = parser.parse('1.3.0')
    expect(parser.satisfies(v, '1.2.x')).toBe(false)
  })

  it('|| OR range matches if any part matches', () => {
    const v = parser.parse('2.0.0')
    expect(parser.satisfies(v, '^1.0.0 || ^2.0.0')).toBe(true)
  })

  it('|| OR range fails if no part matches', () => {
    const v = parser.parse('3.0.0')
    expect(parser.satisfies(v, '^1.0.0 || ^2.0.0')).toBe(false)
  })

  it('whitespace-trimmed range works', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, '  1.2.3  ')).toBe(true)
  })

  it('invalid range returns false', () => {
    const v = parser.parse('1.2.3')
    expect(parser.satisfies(v, 'not-a-range')).toBe(false)
  })
})

// ─── VersionParser – parseRange ─────────────────────────────────────
describe('VersionParser.parseRange', () => {
  const parser = new VersionParser()

  it('parses * as null bounds', () => {
    const range = parser.parseRange('*')
    expect(range.minVersion).toBeNull()
    expect(range.maxVersion).toBeNull()
    expect(range.includesMin).toBe(false)
    expect(range.includesMax).toBe(false)
  })

  it('parses empty string as null bounds', () => {
    const range = parser.parseRange('')
    expect(range.minVersion).toBeNull()
    expect(range.maxVersion).toBeNull()
  })

  it('parses >= range', () => {
    const range = parser.parseRange('>=1.2.0')
    expect(range.minVersion).not.toBeNull()
    expect(range.minVersion!.major).toBe(1)
    expect(range.includesMin).toBe(true)
    expect(range.maxVersion).toBeNull()
  })

  it('parses > range', () => {
    const range = parser.parseRange('>1.0.0')
    expect(range.minVersion).not.toBeNull()
    expect(range.minVersion!.major).toBe(1)
    expect(range.includesMin).toBe(false)
  })

  it('parses <= range', () => {
    const range = parser.parseRange('<=2.0.0')
    expect(range.maxVersion).not.toBeNull()
    expect(range.maxVersion!.major).toBe(2)
    expect(range.includesMax).toBe(true)
    expect(range.minVersion).toBeNull()
  })

  it('parses < range', () => {
    const range = parser.parseRange('<3.0.0')
    expect(range.maxVersion).not.toBeNull()
    expect(range.maxVersion!.major).toBe(3)
    expect(range.includesMax).toBe(false)
  })

  it('parses ^ range', () => {
    const range = parser.parseRange('^1.2.3')
    expect(range.minVersion).not.toBeNull()
    expect(range.minVersion!.major).toBe(1)
    expect(range.includesMin).toBe(true)
  })

  it('parses ~ range', () => {
    const range = parser.parseRange('~1.2.3')
    expect(range.minVersion).not.toBeNull()
    expect(range.minVersion!.minor).toBe(2)
    expect(range.includesMin).toBe(true)
  })

  it('parses exact version', () => {
    const range = parser.parseRange('1.2.3')
    expect(range.minVersion).not.toBeNull()
    expect(range.maxVersion).not.toBeNull()
    expect(range.minVersion!.major).toBe(1)
    expect(range.maxVersion!.major).toBe(1)
    expect(range.includesMin).toBe(true)
    expect(range.includesMax).toBe(true)
  })

  it('preserves raw value', () => {
    const range = parser.parseRange('^1.2.3')
    expect(range.raw).toBe('^1.2.3')
  })

  it('trims whitespace', () => {
    const range = parser.parseRange('  >=1.0.0  ')
    expect(range.minVersion).not.toBeNull()
    expect(range.minVersion!.major).toBe(1)
  })
})

// ─── VersionParser – getMajor / getMinor / getPatch ─────────────────
describe('VersionParser getters', () => {
  const parser = new VersionParser()

  it('getMajor returns major', () => {
    expect(parser.getMajor('3.1.2')).toBe(3)
  })

  it('getMinor returns minor', () => {
    expect(parser.getMinor('3.1.2')).toBe(1)
  })

  it('getPatch returns patch', () => {
    expect(parser.getPatch('3.1.2')).toBe(2)
  })

  it('getMajor works with v prefix', () => {
    expect(parser.getMajor('v5.0.0')).toBe(5)
  })

  it('getPatch works with zero', () => {
    expect(parser.getPatch('1.2.0')).toBe(0)
  })
})

// ─── VersionParser – isPrerelease ───────────────────────────────────
describe('VersionParser.isPrerelease', () => {
  const parser = new VersionParser()

  it('returns true for prerelease', () => {
    expect(parser.isPrerelease('1.0.0-alpha')).toBe(true)
  })

  it('returns true for dotted prerelease', () => {
    expect(parser.isPrerelease('2.0.0-beta.1')).toBe(true)
  })

  it('returns false for release version', () => {
    expect(parser.isPrerelease('1.0.0')).toBe(false)
  })

  it('returns false for version with only build metadata', () => {
    expect(parser.isPrerelease('1.0.0+build.1')).toBe(false)
  })
})

// ─── VersionParser – increment ──────────────────────────────────────
describe('VersionParser.increment', () => {
  const parser = new VersionParser()

  it('increments major resetting minor and patch', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'major')
    expect(next.major).toBe(2)
    expect(next.minor).toBe(0)
    expect(next.patch).toBe(0)
    expect(next.prerelease).toEqual([])
    expect(next.build).toEqual([])
  })

  it('increments minor resetting patch', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'minor')
    expect(next.major).toBe(1)
    expect(next.minor).toBe(3)
    expect(next.patch).toBe(0)
    expect(next.prerelease).toEqual([])
  })

  it('increments patch keeping major/minor', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'patch')
    expect(next.major).toBe(1)
    expect(next.minor).toBe(2)
    expect(next.patch).toBe(4)
    expect(next.prerelease).toEqual([])
  })

  it('increments from zero', () => {
    const v = parser.parse('0.0.0')
    const next = parser.increment(v, 'patch')
    expect(next.patch).toBe(1)
  })

  it('sets raw correctly for major increment', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'major')
    expect(next.raw).toBe('2.0.0')
  })

  it('sets raw correctly for minor increment', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'minor')
    expect(next.raw).toBe('1.3.0')
  })

  it('sets raw correctly for patch increment', () => {
    const v = parser.parse('1.2.3')
    const next = parser.increment(v, 'patch')
    expect(next.raw).toBe('1.2.4')
  })

  it('clears prerelease on increment', () => {
    const v = parser.parse('1.0.0-alpha')
    const next = parser.increment(v, 'patch')
    expect(next.prerelease).toEqual([])
  })

  it('clears build on increment', () => {
    const v = parser.parse('1.0.0+build.1')
    const next = parser.increment(v, 'minor')
    expect(next.build).toEqual([])
  })
})

// ─── UpdateResolver – classifyUpdate ────────────────────────────────
describe('UpdateResolver.classifyUpdate', () => {
  const resolver = new UpdateResolver()

  it('returns "none" for same versions', () => {
    expect(resolver.classifyUpdate('1.2.3', '1.2.3')).toBe('none')
  })

  it('returns "major" for major change', () => {
    expect(resolver.classifyUpdate('1.0.0', '2.0.0')).toBe('major')
  })

  it('returns "minor" for minor change', () => {
    expect(resolver.classifyUpdate('1.2.0', '1.3.0')).toBe('minor')
  })

  it('returns "patch" for patch change', () => {
    expect(resolver.classifyUpdate('1.2.3', '1.2.4')).toBe('patch')
  })

  it('returns "prerelease" when latest has prerelease', () => {
    expect(resolver.classifyUpdate('1.2.3', '2.0.0-beta')).toBe('prerelease')
  })

  it('returns "major" for 0.x to 1.x', () => {
    expect(resolver.classifyUpdate('0.5.0', '1.0.0')).toBe('major')
  })

  it('returns "none" for invalid current version', () => {
    expect(resolver.classifyUpdate('invalid', '1.0.0')).toBe('none')
  })

  it('returns "none" for invalid latest version', () => {
    expect(resolver.classifyUpdate('1.0.0', 'bad')).toBe('none')
  })

  it('returns "minor" when both major and minor differ', () => {
    expect(resolver.classifyUpdate('1.2.0', '2.3.0')).toBe('major')
  })
})

// ─── UpdateResolver – isBreaking ────────────────────────────────────
describe('UpdateResolver.isBreaking', () => {
  const resolver = new UpdateResolver()

  it('major bump is breaking', () => {
    expect(resolver.isBreaking('1.0.0', '2.0.0')).toBe(true)
  })

  it('minor bump is not breaking', () => {
    expect(resolver.isBreaking('1.2.0', '1.3.0')).toBe(false)
  })

  it('patch bump is not breaking', () => {
    expect(resolver.isBreaking('1.2.3', '1.2.4')).toBe(false)
  })

  it('0.x minor bump is breaking', () => {
    expect(resolver.isBreaking('0.1.0', '0.2.0')).toBe(true)
  })

  it('0.x patch bump is breaking', () => {
    expect(resolver.isBreaking('0.1.0', '0.1.1')).toBe(true)
  })

  it('0.x same minor and patch is not breaking', () => {
    expect(resolver.isBreaking('0.1.0', '0.1.0')).toBe(false)
  })

  it('0.x to 1.x is breaking', () => {
    expect(resolver.isBreaking('0.9.0', '1.0.0')).toBe(true)
  })

  it('returns false for invalid versions', () => {
    expect(resolver.isBreaking('bad', '1.0.0')).toBe(false)
  })

  it('downgrade is not breaking', () => {
    expect(resolver.isBreaking('2.0.0', '1.0.0')).toBe(false)
  })
})

// ─── UpdateResolver – assessRisk ────────────────────────────────────
describe('UpdateResolver.assessRisk', () => {
  const resolver = new UpdateResolver()

  function makeEntry(overrides: Partial<UpdateEntry> = {}): UpdateEntry {
    return {
      dependency: {
        name: 'test-pkg',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        wantedVersion: '1.1.0',
        type: 'dependencies',
        isOutdated: true,
        isDeprecated: false,
        isVulnerable: false,
      },
      updateType: 'minor',
      isBreaking: false,
      riskLevel: 'low',
      ...overrides,
    }
  }

  it('returns "high" for breaking update', () => {
    const entry = makeEntry({ isBreaking: true, updateType: 'major' })
    expect(resolver.assessRisk(entry)).toBe('high')
  })

  it('returns "high" for vulnerable dependency', () => {
    const entry = makeEntry({
      dependency: {
        name: 'test-pkg',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        wantedVersion: '1.1.0',
        type: 'dependencies',
        isOutdated: true,
        isDeprecated: false,
        isVulnerable: true,
      },
    })
    expect(resolver.assessRisk(entry)).toBe('high')
  })

  it('returns "high" for major update type', () => {
    const entry = makeEntry({ updateType: 'major' })
    expect(resolver.assessRisk(entry)).toBe('high')
  })

  it('returns "medium" for minor update type', () => {
    const entry = makeEntry({ updateType: 'minor' })
    expect(resolver.assessRisk(entry)).toBe('medium')
  })

  it('returns "medium" for prerelease update type', () => {
    const entry = makeEntry({ updateType: 'prerelease' })
    expect(resolver.assessRisk(entry)).toBe('medium')
  })

  it('returns "medium" for deprecated dependency', () => {
    const entry = makeEntry({
      dependency: {
        name: 'test-pkg',
        currentVersion: '1.0.0',
        latestVersion: '1.0.1',
        wantedVersion: '1.0.1',
        type: 'dependencies',
        isOutdated: true,
        isDeprecated: true,
        isVulnerable: false,
      },
    })
    expect(resolver.assessRisk(entry)).toBe('medium')
  })

  it('returns "low" for patch update', () => {
    const entry = makeEntry({ updateType: 'patch' })
    expect(resolver.assessRisk(entry)).toBe('low')
  })
})

// ─── UpdateResolver – findConflicts ─────────────────────────────────
describe('UpdateResolver.findConflicts', () => {
  const resolver = new UpdateResolver()

  function makeEntry(name: string, current: string, latest: string): UpdateEntry {
    return {
      dependency: {
        name,
        currentVersion: current,
        latestVersion: latest,
        wantedVersion: latest,
        type: 'dependencies',
        isOutdated: true,
        isDeprecated: false,
        isVulnerable: false,
      },
      updateType: 'minor',
      isBreaking: false,
      riskLevel: 'low',
    }
  }

  it('reports each update as a conflict (current != latest)', () => {
    const updates = [
      makeEntry('pkg-a', '1.0.0', '1.1.0'),
      makeEntry('pkg-b', '2.0.0', '2.1.0'),
    ]
    const conflicts = resolver.findConflicts(updates)
    expect(conflicts).toHaveLength(2)
    expect(conflicts[0]!.dependency).toBe('pkg-a')
    expect(conflicts[1]!.dependency).toBe('pkg-b')
  })

  it('detects conflict when same package appears with different versions', () => {
    const updates = [
      makeEntry('pkg-a', '1.0.0', '1.1.0'),
      makeEntry('pkg-a', '1.0.0', '1.2.0'),
    ]
    const conflicts = resolver.findConflicts(updates)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.dependency).toBe('pkg-a')
    expect(conflicts[0]!.conflictingVersions).toContain('1.0.0')
    expect(conflicts[0]!.conflictingVersions).toContain('1.1.0')
    expect(conflicts[0]!.conflictingVersions).toContain('1.2.0')
  })

  it('returns empty for empty updates', () => {
    expect(resolver.findConflicts([])).toEqual([])
  })

  it('still reports conflict when latest versions match (current differs)', () => {
    const updates = [
      makeEntry('pkg-a', '1.0.0', '1.1.0'),
      makeEntry('pkg-a', '1.0.0', '1.1.0'),
    ]
    const conflicts = resolver.findConflicts(updates)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.conflictingVersions).toContain('1.0.0')
    expect(conflicts[0]!.conflictingVersions).toContain('1.1.0')
  })
})

// ─── UpdateResolver – sortUpdates ───────────────────────────────────
describe('UpdateResolver.sortUpdates', () => {
  const resolver = new UpdateResolver()

  it('sorts high risk before low risk', () => {
    const updates: UpdateEntry[] = [
      { dependency: { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false }, updateType: 'patch', isBreaking: false, riskLevel: 'low' },
      { dependency: { name: 'b', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false }, updateType: 'major', isBreaking: true, riskLevel: 'high' },
    ]
    const sorted = resolver.sortUpdates(updates)
    expect(sorted[0]!.riskLevel).toBe('high')
    expect(sorted[1]!.riskLevel).toBe('low')
  })

  it('sorts by type when risk is equal', () => {
    const updates: UpdateEntry[] = [
      { dependency: { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.2', wantedVersion: '1.0.2', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false }, updateType: 'patch', isBreaking: false, riskLevel: 'low' },
      { dependency: { name: 'b', currentVersion: '1.0.0', latestVersion: '1.1.0', wantedVersion: '1.1.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false }, updateType: 'minor', isBreaking: false, riskLevel: 'medium' },
    ]
    const sorted = resolver.sortUpdates(updates)
    expect(sorted[0]!.updateType).toBe('minor')
    expect(sorted[1]!.updateType).toBe('patch')
  })

  it('does not mutate original array', () => {
    const updates: UpdateEntry[] = [
      { dependency: { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false }, updateType: 'patch', isBreaking: false, riskLevel: 'low' },
    ]
    const sorted = resolver.sortUpdates(updates)
    expect(sorted).not.toBe(updates)
  })
})

// ─── UpdateResolver – filterByRisk ──────────────────────────────────
describe('UpdateResolver.filterByRisk', () => {
  const resolver = new UpdateResolver()

  it('filters to low risk only', () => {
    const plan = resolver.resolveUpdates([
      { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'b', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ])
    const filtered = resolver.filterByRisk(plan, 'low')
    expect(filtered.every((e) => e.riskLevel === 'low')).toBe(true)
  })

  it('filters to medium risk (includes low)', () => {
    const plan = resolver.resolveUpdates([
      { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'b', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ])
    const filtered = resolver.filterByRisk(plan, 'medium')
    expect(filtered.every((e) => e.riskLevel !== 'high')).toBe(true)
  })

  it('high risk includes all', () => {
    const plan = resolver.resolveUpdates([
      { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'b', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ])
    const filtered = resolver.filterByRisk(plan, 'high')
    expect(filtered).toHaveLength(plan.updates.length)
  })
})

// ─── UpdateResolver – resolveUpdates ────────────────────────────────
describe('UpdateResolver.resolveUpdates', () => {
  const resolver = new UpdateResolver()

  it('returns empty plan for no dependencies', () => {
    const plan = resolver.resolveUpdates([])
    expect(plan.updates).toEqual([])
    expect(plan.totalUpdates).toBe(0)
    expect(plan.breakingChanges).toBe(0)
    expect(plan.conflicts).toEqual([])
  })

  it('skips up-to-date dependencies', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '1.0.0', wantedVersion: '1.0.0', type: 'dependencies', isOutdated: false, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.updates).toHaveLength(0)
    expect(plan.totalUpdates).toBe(0)
  })

  it('includes patch update', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.updates).toHaveLength(1)
    expect(plan.updates[0]!.updateType).toBe('patch')
  })

  it('includes minor update', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '1.1.0', wantedVersion: '1.1.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.updates).toHaveLength(1)
    expect(plan.updates[0]!.updateType).toBe('minor')
  })

  it('includes major update', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.updates).toHaveLength(1)
    expect(plan.updates[0]!.updateType).toBe('major')
  })

  it('counts breaking changes', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'pkg-b', currentVersion: '1.0.0', latestVersion: '1.1.0', wantedVersion: '1.1.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.breakingChanges).toBe(1)
  })

  it('handles multiple dependency types', () => {
    const deps: DependencyInfo[] = [
      { name: 'a', currentVersion: '1.0.0', latestVersion: '1.1.0', wantedVersion: '1.1.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'b', currentVersion: '2.0.0', latestVersion: '2.1.0', wantedVersion: '2.1.0', type: 'devDependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'c', currentVersion: '3.0.0', latestVersion: '3.1.0', wantedVersion: '3.1.0', type: 'peerDependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.totalUpdates).toBe(3)
  })

  it('sorts updates by risk level', () => {
    const deps: DependencyInfo[] = [
      { name: 'a', currentVersion: '1.0.0', latestVersion: '1.0.1', wantedVersion: '1.0.1', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'b', currentVersion: '1.0.0', latestVersion: '2.0.0', wantedVersion: '2.0.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.updates[0]!.riskLevel).toBe('high')
    expect(plan.updates[1]!.riskLevel).toBe('low')
  })

  it('detects conflicts in plan', () => {
    const deps: DependencyInfo[] = [
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '1.1.0', wantedVersion: '1.1.0', type: 'dependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
      { name: 'pkg', currentVersion: '1.0.0', latestVersion: '1.2.0', wantedVersion: '1.2.0', type: 'devDependencies', isOutdated: true, isDeprecated: false, isVulnerable: false },
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.conflicts.length).toBeGreaterThanOrEqual(1)
    expect(plan.conflicts[0]!.dependency).toBe('pkg')
  })
})

// ─── LockfileAnalyzer – parseLockfile ───────────────────────────────
describe('LockfileAnalyzer.parseLockfile', () => {
  const analyzer = new LockfileAnalyzer()

  it('parses empty content', () => {
    expect(analyzer.parseLockfile('')).toEqual([])
  })

  it('skips comment lines', () => {
    const content = '# This is a comment\n'
    expect(analyzer.parseLockfile(content)).toEqual([])
  })

  it('parses a single entry with version inline', () => {
    const content = `"lodash@4.17.21":
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  integrity "sha512-..."
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.name).toBe('lodash')
    expect(entries[0]!.version).toBe('4.17.21')
    expect(entries[0]!.resolved).toContain('registry.npmjs.org')
    expect(entries[0]!.integrity).toBe('sha512-...')
  })

  it('parses multiple entries', () => {
    const content = `"lodash@4.17.21":
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash"
  integrity "sha512-aaa"
"chalk@4.1.0":
  version "4.1.0"
  resolved "https://registry.npmjs.org/chalk"
  integrity "sha512-bbb"
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(2)
    expect(entries[0]!.name).toBe('lodash')
    expect(entries[1]!.name).toBe('chalk')
  })

  it('parses entry without inline version', () => {
    const content = `lodash:
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash"
  integrity "sha512-..."
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.name).toBe('lodash')
    expect(entries[0]!.version).toBe('4.17.21')
  })

  it('parses entry with dependencies', () => {
    const content = `"some-pkg@1.0.0":
  version "1.0.0"
  resolved "https://registry.npmjs.org/some-pkg"
  integrity "sha512-xxx"
  dependencies:
    lodash "^4.17.0"
    chalk "^4.0.0"
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.dependencies.get('lodash')).toBe('^4.17.0')
    expect(entries[0]!.dependencies.get('chalk')).toBe('^4.0.0')
  })

  it('parses scoped package', () => {
    const content = `"@babel/core@7.20.0":
  version "7.20.0"
  resolved "https://registry.npmjs.org/@babel/core"
  integrity "sha512-scope"
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.name).toBe('@babel/core')
  })

  it('skips blank lines', () => {
    const content = `\n\n"pkg@1.0.0":\n  version "1.0.0"\n  resolved "url"\n  integrity "hash"\n\n\n`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
  })

  it('includes entry with inline version but no properties', () => {
    const content = `"pkg@1.0.0":
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.name).toBe('pkg')
    expect(entries[0]!.version).toBe('1.0.0')
  })

  it('defaults resolved and integrity to empty string', () => {
    const content = `"pkg@1.0.0":
  version "1.0.0"
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.resolved).toBe('')
    expect(entries[0]!.integrity).toBe('')
    expect(entries[0]!.dependencies).toBeInstanceOf(Map)
  })
})

// ─── LockfileAnalyzer – findDuplicates ──────────────────────────────
describe('LockfileAnalyzer.findDuplicates', () => {
  const analyzer = new LockfileAnalyzer()

  it('returns empty map for no duplicates', () => {
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'b', version: '2.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const dups = analyzer.findDuplicates(entries)
    expect(dups.size).toBe(0)
  })

  it('finds duplicate packages with different versions', () => {
    const entries: LockfileEntry[] = [
      { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'lodash', version: '4.17.20', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const dups = analyzer.findDuplicates(entries)
    expect(dups.size).toBe(1)
    expect(dups.get('lodash')).toContain('4.17.21')
    expect(dups.get('lodash')).toContain('4.17.20')
  })

  it('does not report same version as duplicate', () => {
    const entries: LockfileEntry[] = [
      { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const dups = analyzer.findDuplicates(entries)
    expect(dups.size).toBe(0)
  })

  it('finds multiple packages with duplicates', () => {
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'a', version: '2.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'b', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'b', version: '1.1.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const dups = analyzer.findDuplicates(entries)
    expect(dups.size).toBe(2)
  })

  it('returns empty for empty entries', () => {
    expect(analyzer.findDuplicates([]).size).toBe(0)
  })

  it('handles three versions of same package', () => {
    const entries: LockfileEntry[] = [
      { name: 'pkg', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'pkg', version: '1.1.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'pkg', version: '2.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const dups = analyzer.findDuplicates(entries)
    expect(dups.get('pkg')).toHaveLength(3)
  })
})

// ─── LockfileAnalyzer – getDirectDependencies ───────────────────────
describe('LockfileAnalyzer.getDirectDependencies', () => {
  const analyzer = new LockfileAnalyzer()

  it('returns all entries when none reference others', () => {
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'b', version: '2.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const direct = analyzer.getDirectDependencies(entries)
    expect(direct).toHaveLength(2)
  })

  it('excludes entries referenced as dependencies', () => {
    const deps = new Map<string, string>()
    deps.set('b', '^2.0.0')
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: deps },
      { name: 'b', version: '2.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const direct = analyzer.getDirectDependencies(entries)
    expect(direct).toHaveLength(1)
    expect(direct[0]!.name).toBe('a')
  })

  it('handles empty entries', () => {
    expect(analyzer.getDirectDependencies([])).toEqual([])
  })

  it('handles multiple levels of references', () => {
    const depsA = new Map<string, string>()
    depsA.set('b', '^1.0.0')
    const depsB = new Map<string, string>()
    depsB.set('c', '^1.0.0')
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: depsA },
      { name: 'b', version: '1.0.0', resolved: '', integrity: '', dependencies: depsB },
      { name: 'c', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const direct = analyzer.getDirectDependencies(entries)
    expect(direct).toHaveLength(1)
    expect(direct[0]!.name).toBe('a')
  })
})

// ─── LockfileAnalyzer – getTransitiveCount ──────────────────────────
describe('LockfileAnalyzer.getTransitiveCount', () => {
  const analyzer = new LockfileAnalyzer()

  it('returns 0 for empty entries', () => {
    expect(analyzer.getTransitiveCount([])).toBe(0)
  })

  it('counts transitive dependencies', () => {
    const depsA = new Map<string, string>()
    depsA.set('b', '^1.0.0')
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: depsA },
      { name: 'b', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    // 'a' depends on 'b'. allDepNames={'b'}, direct=['a'], transitive=2-1=1
    const count = analyzer.getTransitiveCount(entries)
    expect(count).toBe(1)
  })

  it('returns 0 when all are direct', () => {
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    expect(analyzer.getTransitiveCount(entries)).toBe(0)
  })
})

// ─── LockfileAnalyzer – analyze ─────────────────────────────────────
describe('LockfileAnalyzer.analyze', () => {
  const analyzer = new LockfileAnalyzer()

  it('returns correct analysis for empty entries', () => {
    const analysis = analyzer.analyze([])
    expect(analysis.totalPackages).toBe(0)
    expect(analysis.directDependencies).toBe(0)
    expect(analysis.transitiveDependencies).toBe(0)
    expect(analysis.duplicates.size).toBe(0)
    expect(analysis.outdated).toEqual([])
    expect(analysis.size).toBe(0)
  })

  it('returns correct analysis for single entry', () => {
    const entries: LockfileEntry[] = [
      { name: 'lodash', version: '4.17.21', resolved: 'url', integrity: 'hash', dependencies: new Map() },
    ]
    const analysis = analyzer.analyze(entries)
    expect(analysis.totalPackages).toBe(1)
    expect(analysis.directDependencies).toBe(1)
    expect(analysis.size).toBe(1)
  })

  it('returns correct analysis for multiple entries with deps', () => {
    const deps = new Map<string, string>()
    deps.set('chalk', '^4.0.0')
    const entries: LockfileEntry[] = [
      { name: 'some-pkg', version: '1.0.0', resolved: '', integrity: '', dependencies: deps },
      { name: 'chalk', version: '4.1.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const analysis = analyzer.analyze(entries)
    expect(analysis.totalPackages).toBe(2)
    expect(analysis.directDependencies).toBe(1)
    expect(analysis.transitiveDependencies).toBe(1)
  })

  it('detects duplicates in analysis', () => {
    const entries: LockfileEntry[] = [
      { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map() },
      { name: 'lodash', version: '4.17.20', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const analysis = analyzer.analyze(entries)
    expect(analysis.duplicates.size).toBe(1)
    expect(analysis.duplicates.get('lodash')).toContain('4.17.21')
  })

  it('outdated is always empty in analyze (populated externally)', () => {
    const entries: LockfileEntry[] = [
      { name: 'a', version: '1.0.0', resolved: '', integrity: '', dependencies: new Map() },
    ]
    const analysis = analyzer.analyze(entries)
    expect(analysis.outdated).toEqual([])
  })
})

// ─── Integration – end-to-end workflow ──────────────────────────────
describe('Integration: full dep-updater workflow', () => {
  it('parses lockfile, finds duplicates, resolves updates', () => {
    const analyzer = new LockfileAnalyzer()
    const resolver = new UpdateResolver()
    const parser = new VersionParser()

    const lockfile = `"app@1.0.0":
  version "1.0.0"
  resolved "url"
  integrity "hash"
  dependencies:
    lodash "^4.0.0"
    express "^4.0.0"
"lodash@4.17.20":
  version "4.17.20"
  resolved "url"
  integrity "hash"
"lodash@4.17.21":
  version "4.17.21"
  resolved "url"
  integrity "hash"
"express@4.18.0":
  version "4.18.0"
  resolved "url"
  integrity "hash"
`
    const entries = analyzer.parseLockfile(lockfile)
    expect(entries.length).toBeGreaterThanOrEqual(4)

    const analysis = analyzer.analyze(entries)
    expect(analysis.duplicates.has('lodash')).toBe(true)

    const deps = entries
      .filter((e) => analysis.duplicates.has(e.name) === false)
      .map((e): DependencyInfo => ({
        name: e.name,
        currentVersion: e.version,
        latestVersion: parser.format(parser.increment(parser.parse(e.version), 'patch')),
        wantedVersion: e.version,
        type: 'dependencies',
        isOutdated: true,
        isDeprecated: false,
        isVulnerable: false,
      }))

    const plan = resolver.resolveUpdates(deps)
    expect(plan.totalUpdates).toBeGreaterThan(0)
  })

  it('handles lockfile with scoped packages and nested deps', () => {
    const analyzer = new LockfileAnalyzer()
    const content = `"@types/node@18.0.0":
  version "18.0.0"
  resolved "url"
  integrity "hash"
"@babel/core@7.20.0":
  version "7.20.0"
  resolved "url"
  integrity "hash"
  dependencies:
    lodash "^4.17.0"
    chalk "^4.0.0"
"@babel/parser@7.20.0":
  version "7.20.0"
  resolved "url"
  integrity "hash"
`
    const entries = analyzer.parseLockfile(content)
    expect(entries).toHaveLength(3)

    const babelCore = entries.find((e) => e.name === '@babel/core')
    expect(babelCore).toBeDefined()
    expect(babelCore!.dependencies.get('lodash')).toBe('^4.17.0')
    expect(babelCore!.dependencies.get('chalk')).toBe('^4.0.0')
  })

  it('version parsing and update classification chain', () => {
    const parser = new VersionParser()
    const resolver = new UpdateResolver()

    const scenarios: [string, string, string][] = [
      ['1.0.0', '1.0.1', 'patch'],
      ['1.0.0', '1.1.0', 'minor'],
      ['1.0.0', '2.0.0', 'major'],
      ['1.0.0', '2.0.0-alpha', 'prerelease'],
    ]

    for (const [current, latest, expected] of scenarios) {
      parser.parse(current)
      parser.parse(latest)
      expect(resolver.classifyUpdate(current, latest)).toBe(expected)
    }
  })
})
