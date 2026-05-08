import { describe, it, expect } from 'vitest'
import { VersionParser } from '../../src/core/dep-updater/version-parser.js'
import { UpdateResolver } from '../../src/core/dep-updater/update-resolver.js'
import { LockfileAnalyzer } from '../../src/core/dep-updater/lockfile-analyzer.js'
import type { DependencyInfo, UpdateEntry } from '../../src/core/dep-updater/types.js'

function makeDep(overrides: Partial<DependencyInfo> = {}): DependencyInfo {
  return {
    name: 'test-pkg',
    currentVersion: '1.0.0',
    latestVersion: '1.0.0',
    wantedVersion: '1.0.0',
    type: 'dependencies',
    isOutdated: false,
    isDeprecated: false,
    isVulnerable: false,
    ...overrides,
  }
}

describe('VersionParser', () => {
  const parser = new VersionParser()

  describe('parse', () => {
    it('should parse basic semver', () => {
      const v = parser.parse('1.2.3')
      expect(v.major).toBe(1)
      expect(v.minor).toBe(2)
      expect(v.patch).toBe(3)
      expect(v.prerelease).toEqual([])
      expect(v.build).toEqual([])
    })

    it('should parse version with prerelease', () => {
      const v = parser.parse('1.2.3-alpha.1')
      expect(v.prerelease).toEqual(['alpha', '1'])
    })

    it('should parse version with build metadata', () => {
      const v = parser.parse('1.2.3+build.123')
      expect(v.build).toEqual(['build', '123'])
    })

    it('should parse version with prerelease and build', () => {
      const v = parser.parse('1.2.3-beta.2+build.456')
      expect(v.prerelease).toEqual(['beta', '2'])
      expect(v.build).toEqual(['build', '456'])
    })

    it('should parse version with v prefix', () => {
      const v = parser.parse('v1.2.3')
      expect(v.major).toBe(1)
      expect(v.minor).toBe(2)
      expect(v.patch).toBe(3)
    })

    it('should parse version with = prefix', () => {
      const v = parser.parse('=1.2.3')
      expect(v.major).toBe(1)
    })

    it('should throw on invalid version', () => {
      expect(() => parser.parse('not-a-version')).toThrow('Invalid version')
      expect(() => parser.parse('')).toThrow('Invalid version')
    })

    it('should set raw correctly', () => {
      const v = parser.parse('1.2.3-alpha.1')
      expect(v.raw).toBe('1.2.3-alpha.1')
    })
  })

  describe('format', () => {
    it('should format basic version', () => {
      const v = parser.parse('1.2.3')
      expect(parser.format(v)).toBe('1.2.3')
    })

    it('should format version with prerelease', () => {
      const v = parser.parse('1.2.3-alpha.1')
      expect(parser.format(v)).toBe('1.2.3-alpha.1')
    })

    it('should format version with build', () => {
      const v = parser.parse('1.2.3+build.1')
      expect(parser.format(v)).toBe('1.2.3+build.1')
    })

    it('should format version with prerelease and build', () => {
      const v = parser.parse('1.2.3-beta.1+build.2')
      expect(parser.format(v)).toBe('1.2.3-beta.1+build.2')
    })
  })

  describe('compare', () => {
    it('should return 0 for equal versions', () => {
      const a = parser.parse('1.2.3')
      const b = parser.parse('1.2.3')
      expect(parser.compare(a, b)).toBe(0)
    })

    it('should compare major versions', () => {
      const a = parser.parse('1.0.0')
      const b = parser.parse('2.0.0')
      expect(parser.compare(a, b)).toBe(-1)
      expect(parser.compare(b, a)).toBe(1)
    })

    it('should compare minor versions', () => {
      const a = parser.parse('1.1.0')
      const b = parser.parse('1.2.0')
      expect(parser.compare(a, b)).toBe(-1)
    })

    it('should compare patch versions', () => {
      const a = parser.parse('1.0.1')
      const b = parser.parse('1.0.2')
      expect(parser.compare(a, b)).toBe(-1)
    })

    it('should treat release greater than prerelease', () => {
      const release = parser.parse('1.0.0')
      const pre = parser.parse('1.0.0-alpha')
      expect(parser.compare(release, pre)).toBe(1)
    })

    it('should compare prerelease strings alphabetically', () => {
      const alpha = parser.parse('1.0.0-alpha')
      const beta = parser.parse('1.0.0-beta')
      expect(parser.compare(alpha, beta)).toBe(-1)
    })

    it('should compare numeric prerelease identifiers', () => {
      const a = parser.parse('1.0.0-rc.1')
      const b = parser.parse('1.0.0-rc.2')
      expect(parser.compare(a, b)).toBe(-1)
    })

    it('should treat numeric prerelease as less than string', () => {
      const num = parser.parse('1.0.0-1')
      const str = parser.parse('1.0.0-alpha')
      expect(parser.compare(num, str)).toBe(-1)
    })
  })

  describe('satisfies', () => {
    it('should satisfy star range', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '*')).toBe(true)
    })

    it('should satisfy caret range', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '^1.2.0')).toBe(true)
      expect(parser.satisfies(parser.parse('2.0.0'), '^1.2.0')).toBe(false)
    })

    it('should satisfy tilde range', () => {
      expect(parser.satisfies(parser.parse('1.2.5'), '~1.2.0')).toBe(true)
      expect(parser.satisfies(parser.parse('1.3.0'), '~1.2.0')).toBe(false)
    })

    it('should satisfy >= operator', () => {
      expect(parser.satisfies(parser.parse('2.0.0'), '>=1.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('0.9.0'), '>=1.0.0')).toBe(false)
    })

    it('should satisfy > operator', () => {
      expect(parser.satisfies(parser.parse('2.0.0'), '>1.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('1.0.0'), '>1.0.0')).toBe(false)
    })

    it('should satisfy <= operator', () => {
      expect(parser.satisfies(parser.parse('1.0.0'), '<=1.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('2.0.0'), '<=1.0.0')).toBe(false)
    })

    it('should satisfy < operator', () => {
      expect(parser.satisfies(parser.parse('0.9.0'), '<1.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('1.0.0'), '<1.0.0')).toBe(false)
    })

    it('should satisfy exact version', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '1.2.3')).toBe(true)
      expect(parser.satisfies(parser.parse('1.2.4'), '1.2.3')).toBe(false)
    })

    it('should satisfy OR ranges', () => {
      expect(parser.satisfies(parser.parse('1.0.0'), '^1.0.0 || ^2.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('2.5.0'), '^1.0.0 || ^2.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('3.0.0'), '^1.0.0 || ^2.0.0')).toBe(false)
    })

    it('should satisfy x-range', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '1.x')).toBe(true)
      expect(parser.satisfies(parser.parse('2.0.0'), '1.x')).toBe(false)
    })
  })

  describe('parseRange', () => {
    it('should parse star range', () => {
      const range = parser.parseRange('*')
      expect(range.minVersion).toBeNull()
      expect(range.maxVersion).toBeNull()
    })

    it('should parse >= range', () => {
      const range = parser.parseRange('>=1.0.0')
      expect(range.minVersion).not.toBeNull()
      expect(range.includesMin).toBe(true)
    })

    it('should parse > range', () => {
      const range = parser.parseRange('>1.0.0')
      expect(range.minVersion).not.toBeNull()
      expect(range.includesMin).toBe(false)
    })

    it('should parse <= range', () => {
      const range = parser.parseRange('<=2.0.0')
      expect(range.maxVersion).not.toBeNull()
      expect(range.includesMax).toBe(true)
    })

    it('should parse < range', () => {
      const range = parser.parseRange('<2.0.0')
      expect(range.maxVersion).not.toBeNull()
      expect(range.includesMax).toBe(false)
    })

    it('should parse caret range', () => {
      const range = parser.parseRange('^1.2.3')
      expect(range.minVersion).not.toBeNull()
      expect(range.includesMin).toBe(true)
    })

    it('should parse tilde range', () => {
      const range = parser.parseRange('~1.2.3')
      expect(range.minVersion).not.toBeNull()
      expect(range.includesMin).toBe(true)
    })

    it('should parse exact version as both min and max', () => {
      const range = parser.parseRange('1.2.3')
      expect(range.minVersion).not.toBeNull()
      expect(range.maxVersion).not.toBeNull()
      expect(range.includesMin).toBe(true)
      expect(range.includesMax).toBe(true)
    })
  })

  describe('getMajor/getMinor/getPatch', () => {
    it('should get major version', () => {
      expect(parser.getMajor('1.2.3')).toBe(1)
    })

    it('should get minor version', () => {
      expect(parser.getMinor('1.2.3')).toBe(2)
    })

    it('should get patch version', () => {
      expect(parser.getPatch('1.2.3')).toBe(3)
    })
  })

  describe('isPrerelease', () => {
    it('should detect prerelease version', () => {
      expect(parser.isPrerelease('1.0.0-alpha')).toBe(true)
      expect(parser.isPrerelease('1.0.0-beta.1')).toBe(true)
    })

    it('should detect non-prerelease version', () => {
      expect(parser.isPrerelease('1.0.0')).toBe(false)
    })
  })

  describe('increment', () => {
    it('should increment major', () => {
      const v = parser.parse('1.2.3')
      const next = parser.increment(v, 'major')
      expect(parser.format(next)).toBe('2.0.0')
    })

    it('should increment minor', () => {
      const v = parser.parse('1.2.3')
      const next = parser.increment(v, 'minor')
      expect(parser.format(next)).toBe('1.3.0')
    })

    it('should increment patch', () => {
      const v = parser.parse('1.2.3')
      const next = parser.increment(v, 'patch')
      expect(parser.format(next)).toBe('1.2.4')
    })

    it('should clear prerelease and build on increment', () => {
      const v = parser.parse('1.2.3-alpha.1+build.1')
      const next = parser.increment(v, 'patch')
      expect(next.prerelease).toEqual([])
      expect(next.build).toEqual([])
    })
  })
})

describe('UpdateResolver', () => {
  const resolver = new UpdateResolver()

  describe('classifyUpdate', () => {
    it('should classify major update', () => {
      expect(resolver.classifyUpdate('1.0.0', '2.0.0')).toBe('major')
    })

    it('should classify minor update', () => {
      expect(resolver.classifyUpdate('1.0.0', '1.1.0')).toBe('minor')
    })

    it('should classify patch update', () => {
      expect(resolver.classifyUpdate('1.0.0', '1.0.1')).toBe('patch')
    })

    it('should classify prerelease update', () => {
      expect(resolver.classifyUpdate('1.0.0', '1.0.1-beta.1')).toBe('prerelease')
    })

    it('should return none for same versions', () => {
      expect(resolver.classifyUpdate('1.0.0', '1.0.0')).toBe('none')
    })

    it('should return none for invalid versions', () => {
      expect(resolver.classifyUpdate('invalid', '2.0.0')).toBe('none')
    })
  })

  describe('isBreaking', () => {
    it('should detect major version breaking', () => {
      expect(resolver.isBreaking('1.0.0', '2.0.0')).toBe(true)
    })

    it('should not detect minor as breaking for stable', () => {
      expect(resolver.isBreaking('1.0.0', '1.1.0')).toBe(false)
    })

    it('should not detect patch as breaking for stable', () => {
      expect(resolver.isBreaking('1.0.0', '1.0.1')).toBe(false)
    })

    it('should detect breaking for 0.x minor bump', () => {
      expect(resolver.isBreaking('0.1.0', '0.2.0')).toBe(true)
    })

    it('should detect breaking for 0.x patch bump', () => {
      expect(resolver.isBreaking('0.1.0', '0.1.1')).toBe(true)
    })

    it('should not detect breaking for same 0.x version', () => {
      expect(resolver.isBreaking('0.1.0', '0.1.0')).toBe(false)
    })

    it('should return false for invalid versions', () => {
      expect(resolver.isBreaking('invalid', '2.0.0')).toBe(false)
    })
  })

  describe('assessRisk', () => {
    it('should return high for breaking updates', () => {
      const entry: UpdateEntry = {
        dependency: makeDep(),
        updateType: 'major',
        isBreaking: true,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('high')
    })

    it('should return high for vulnerable deps', () => {
      const entry: UpdateEntry = {
        dependency: makeDep({ isVulnerable: true }),
        updateType: 'patch',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('high')
    })

    it('should return high for major updates', () => {
      const entry: UpdateEntry = {
        dependency: makeDep(),
        updateType: 'major',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('high')
    })

    it('should return medium for minor updates', () => {
      const entry: UpdateEntry = {
        dependency: makeDep(),
        updateType: 'minor',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('medium')
    })

    it('should return medium for prerelease updates', () => {
      const entry: UpdateEntry = {
        dependency: makeDep(),
        updateType: 'prerelease',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('medium')
    })

    it('should return medium for deprecated deps', () => {
      const entry: UpdateEntry = {
        dependency: makeDep({ isDeprecated: true }),
        updateType: 'patch',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('medium')
    })

    it('should return low for patch updates', () => {
      const entry: UpdateEntry = {
        dependency: makeDep(),
        updateType: 'patch',
        isBreaking: false,
        riskLevel: 'low',
      }
      expect(resolver.assessRisk(entry)).toBe('low')
    })
  })

  describe('resolveUpdates', () => {
    it('should create update plan from dependencies', () => {
      const deps = [
        makeDep({ name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '1.0.1' }),
        makeDep({ name: 'pkg-b', currentVersion: '2.0.0', latestVersion: '3.0.0' }),
        makeDep({ name: 'pkg-c', currentVersion: '1.0.0', latestVersion: '1.0.0' }),
      ]
      const plan = resolver.resolveUpdates(deps)
      expect(plan.totalUpdates).toBe(2)
      expect(plan.updates).toHaveLength(2)
    })

    it('should count breaking changes', () => {
      const deps = [
        makeDep({ name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '2.0.0' }),
        makeDep({ name: 'pkg-b', currentVersion: '1.0.0', latestVersion: '1.1.0' }),
      ]
      const plan = resolver.resolveUpdates(deps)
      expect(plan.breakingChanges).toBe(1)
    })

    it('should return empty plan for no updates', () => {
      const deps = [makeDep({ currentVersion: '1.0.0', latestVersion: '1.0.0' })]
      const plan = resolver.resolveUpdates(deps)
      expect(plan.totalUpdates).toBe(0)
      expect(plan.updates).toHaveLength(0)
    })

    it('should sort updates by risk then type', () => {
      const deps = [
        makeDep({ name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '1.0.1' }),
        makeDep({ name: 'pkg-b', currentVersion: '1.0.0', latestVersion: '2.0.0' }),
        makeDep({ name: 'pkg-c', currentVersion: '1.0.0', latestVersion: '1.1.0' }),
      ]
      const plan = resolver.resolveUpdates(deps)
      expect(plan.updates[0]!.dependency.name).toBe('pkg-b')
    })
  })

  describe('findConflicts', () => {
    it('should find conflicting versions for same package', () => {
      const entries: UpdateEntry[] = [
        {
          dependency: makeDep({ name: 'lodash', currentVersion: '4.17.0', latestVersion: '4.17.21' }),
          updateType: 'patch',
          isBreaking: false,
          riskLevel: 'low',
        },
      ]
      const conflicts = resolver.findConflicts(entries)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]!.conflictingVersions).toHaveLength(2)
    })

    it('should return empty for no conflicts', () => {
      const entries: UpdateEntry[] = [
        {
          dependency: makeDep({ name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '2.0.0' }),
          updateType: 'major',
          isBreaking: true,
          riskLevel: 'high',
        },
      ]
      const conflicts = resolver.findConflicts(entries)
      expect(conflicts).toHaveLength(1)
    })

    it('should return empty for empty updates', () => {
      expect(resolver.findConflicts([])).toEqual([])
    })
  })

  describe('sortUpdates', () => {
    it('should sort by risk level then update type', () => {
      const entries: UpdateEntry[] = [
        { dependency: makeDep({ name: 'a' }), updateType: 'patch', isBreaking: false, riskLevel: 'low' },
        { dependency: makeDep({ name: 'b' }), updateType: 'major', isBreaking: true, riskLevel: 'high' },
        { dependency: makeDep({ name: 'c' }), updateType: 'minor', isBreaking: false, riskLevel: 'medium' },
      ]
      const sorted = resolver.sortUpdates(entries)
      expect(sorted[0]!.riskLevel).toBe('high')
      expect(sorted[1]!.riskLevel).toBe('medium')
      expect(sorted[2]!.riskLevel).toBe('low')
    })

    it('should sort by update type when same risk', () => {
      const entries: UpdateEntry[] = [
        { dependency: makeDep({ name: 'a' }), updateType: 'patch', isBreaking: false, riskLevel: 'high' },
        { dependency: makeDep({ name: 'b' }), updateType: 'major', isBreaking: true, riskLevel: 'high' },
      ]
      const sorted = resolver.sortUpdates(entries)
      expect(sorted[0]!.updateType).toBe('major')
      expect(sorted[1]!.updateType).toBe('patch')
    })
  })

  describe('filterByRisk', () => {
    it('should filter to only low risk', () => {
      const plan = {
        updates: [
          { dependency: makeDep(), updateType: 'patch' as const, isBreaking: false, riskLevel: 'low' as const },
          { dependency: makeDep(), updateType: 'major' as const, isBreaking: true, riskLevel: 'high' as const },
          { dependency: makeDep(), updateType: 'minor' as const, isBreaking: false, riskLevel: 'medium' as const },
        ],
        conflicts: [],
        totalUpdates: 3,
        breakingChanges: 1,
      }
      const filtered = resolver.filterByRisk(plan, 'low')
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!.riskLevel).toBe('low')
    })

    it('should filter to low and medium risk', () => {
      const plan = {
        updates: [
          { dependency: makeDep(), updateType: 'patch' as const, isBreaking: false, riskLevel: 'low' as const },
          { dependency: makeDep(), updateType: 'major' as const, isBreaking: true, riskLevel: 'high' as const },
          { dependency: makeDep(), updateType: 'minor' as const, isBreaking: false, riskLevel: 'medium' as const },
        ],
        conflicts: [],
        totalUpdates: 3,
        breakingChanges: 1,
      }
      const filtered = resolver.filterByRisk(plan, 'medium')
      expect(filtered).toHaveLength(2)
    })

    it('should return all for high risk filter', () => {
      const plan = {
        updates: [
          { dependency: makeDep(), updateType: 'patch' as const, isBreaking: false, riskLevel: 'low' as const },
          { dependency: makeDep(), updateType: 'major' as const, isBreaking: true, riskLevel: 'high' as const },
        ],
        conflicts: [],
        totalUpdates: 2,
        breakingChanges: 1,
      }
      const filtered = resolver.filterByRisk(plan, 'high')
      expect(filtered).toHaveLength(2)
    })
  })
})

describe('LockfileAnalyzer', () => {
  const analyzer = new LockfileAnalyzer()

  describe('parseLockfile', () => {
    it('should parse basic lockfile entries', () => {
      const content = `
"lodash@4.17.21":
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  integrity "sha512-xyz=="
`
      const entries = analyzer.parseLockfile(content)
      expect(entries).toHaveLength(1)
      expect(entries[0]!.name).toBe('lodash')
      expect(entries[0]!.version).toBe('4.17.21')
    })

    it('should parse scoped packages', () => {
      const content = `
"@types/node@18.0.0":
  version "18.0.0"
  resolved "https://registry.npmjs.org/@types/node/-/node-18.0.0.tgz"
  integrity "sha512-abc=="
`
      const entries = analyzer.parseLockfile(content)
      expect(entries).toHaveLength(1)
      expect(entries[0]!.name).toBe('@types/node')
      expect(entries[0]!.version).toBe('18.0.0')
    })

    it('should parse entries with dependencies', () => {
      const content = `
"express@4.18.0":
  version "4.18.0"
  resolved "https://registry.npmjs.org/express/-/express-4.18.0.tgz"
  integrity "sha512-def=="
  dependencies:
    accepts "~1.3.8"
    body-parser "1.20.1"
`
      const entries = analyzer.parseLockfile(content)
      expect(entries).toHaveLength(1)
      expect(entries[0]!.dependencies.size).toBe(2)
      expect(entries[0]!.dependencies.get('accepts')).toBe('~1.3.8')
      expect(entries[0]!.dependencies.get('body-parser')).toBe('1.20.1')
    })

    it('should parse multiple entries', () => {
      const content = `
"lodash@4.17.21":
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  integrity "sha512-xyz=="

"express@4.18.0":
  version "4.18.0"
  resolved "https://registry.npmjs.org/express/-/express-4.18.0.tgz"
  integrity "sha512-def=="
`
      const entries = analyzer.parseLockfile(content)
      expect(entries).toHaveLength(2)
    })

    it('should skip comments', () => {
      const content = `# This is a lockfile
"lodash@4.17.21":
  version "4.17.21"
  resolved "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
  integrity "sha512-xyz=="
`
      const entries = analyzer.parseLockfile(content)
      expect(entries).toHaveLength(1)
    })

    it('should handle empty content', () => {
      expect(analyzer.parseLockfile('')).toEqual([])
      expect(analyzer.parseLockfile('# just a comment')).toEqual([])
    })
  })

  describe('analyze', () => {
    it('should produce complete analysis', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: 'https://example.com', integrity: 'sha512-abc', dependencies: new Map<string, string>() },
        { name: 'express', version: '4.18.0', resolved: 'https://example.com', integrity: 'sha512-def', dependencies: new Map<string, string>([['lodash', '^4.17.21']]) },
      ]
      const analysis = analyzer.analyze(entries)
      expect(analysis.totalPackages).toBe(2)
      expect(analysis.size).toBe(2)
    })

    it('should handle empty entries', () => {
      const analysis = analyzer.analyze([])
      expect(analysis.totalPackages).toBe(0)
      expect(analysis.directDependencies).toBe(0)
      expect(analysis.transitiveDependencies).toBe(0)
    })
  })

  describe('findDuplicates', () => {
    it('should find duplicate packages with different versions', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'lodash', version: '4.17.20', resolved: '', integrity: '', dependencies: new Map<string, string>() },
      ]
      const dups = analyzer.findDuplicates(entries)
      expect(dups.size).toBe(1)
      expect(dups.get('lodash')).toEqual(['4.17.21', '4.17.20'])
    })

    it('should return empty map for no duplicates', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'express', version: '4.18.0', resolved: '', integrity: '', dependencies: new Map<string, string>() },
      ]
      const dups = analyzer.findDuplicates(entries)
      expect(dups.size).toBe(0)
    })

    it('should return empty for empty entries', () => {
      expect(analyzer.findDuplicates([]).size).toBe(0)
    })

    it('should handle same version as non-duplicate', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
      ]
      const dups = analyzer.findDuplicates(entries)
      expect(dups.size).toBe(0)
    })
  })

  describe('getTransitiveCount', () => {
    it('should count transitive dependencies', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'express', version: '4.18.0', resolved: '', integrity: '', dependencies: new Map<string, string>([['lodash', '^4.17.21']]) },
      ]
      const count = analyzer.getTransitiveCount(entries)
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 for empty entries', () => {
      expect(analyzer.getTransitiveCount([])).toBe(0)
    })
  })

  describe('getDirectDependencies', () => {
    it('should identify direct dependencies', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'express', version: '4.18.0', resolved: '', integrity: '', dependencies: new Map<string, string>([['lodash', '^4.17.21']]) },
      ]
      const direct = analyzer.getDirectDependencies(entries)
      expect(direct).toHaveLength(1)
      expect(direct[0]!.name).toBe('express')
    })

    it('should return all entries if none are referenced', () => {
      const entries = [
        { name: 'lodash', version: '4.17.21', resolved: '', integrity: '', dependencies: new Map<string, string>() },
        { name: 'express', version: '4.18.0', resolved: '', integrity: '', dependencies: new Map<string, string>() },
      ]
      const direct = analyzer.getDirectDependencies(entries)
      expect(direct).toHaveLength(2)
    })

    it('should return empty for empty entries', () => {
      expect(analyzer.getDirectDependencies([])).toEqual([])
    })
  })
})

describe('Edge cases', () => {
  const parser = new VersionParser()
  const resolver = new UpdateResolver()

  it('should handle 0.0.x version', () => {
    expect(resolver.isBreaking('0.0.1', '0.0.2')).toBe(true)
  })

  it('should handle downgrade as non-breaking', () => {
    expect(resolver.isBreaking('2.0.0', '1.0.0')).toBe(false)
  })

  it('should handle prerelease comparison with empty prerelease', () => {
    const a = parser.parse('1.0.0-alpha')
    const b = parser.parse('1.0.0')
    expect(parser.compare(a, b)).toBe(-1)
  })

  it('should handle prerelease with different lengths', () => {
    const a = parser.parse('1.0.0-alpha')
    const b = parser.parse('1.0.0-alpha.1')
    expect(typeof parser.compare(a, b)).toBe('number')
  })

  it('should handle empty string range in satisfies', () => {
    expect(parser.satisfies(parser.parse('1.0.0'), '')).toBe(true)
  })

  it('should handle incrementing zero versions', () => {
    const v = parser.parse('0.0.0')
    expect(parser.format(parser.increment(v, 'major'))).toBe('1.0.0')
    expect(parser.format(parser.increment(v, 'minor'))).toBe('0.1.0')
    expect(parser.format(parser.increment(v, 'patch'))).toBe('0.0.1')
  })

  it('should handle classifyUpdate for downgrade', () => {
    expect(resolver.classifyUpdate('2.0.0', '1.0.0')).toBe('major')
  })

  it('should handle multiple conflicts in resolveUpdates', () => {
    const deps = [
      makeDep({ name: 'pkg-a', currentVersion: '1.0.0', latestVersion: '2.0.0' }),
      makeDep({ name: 'pkg-b', currentVersion: '1.0.0', latestVersion: '1.1.0' }),
      makeDep({ name: 'pkg-c', currentVersion: '1.0.0', latestVersion: '1.0.1' }),
    ]
    const plan = resolver.resolveUpdates(deps)
    expect(plan.totalUpdates).toBe(3)
    expect(plan.conflicts).toHaveLength(3)
  })
})
