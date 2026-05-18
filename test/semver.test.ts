import { describe, it, expect } from 'vitest'
import { SemVerParser, VersionManager, ChangelogGenerator, DEFAULT_VERSION_CONFIG, DEFAULT_CHANGELOG_CONFIG } from '../src/core/semver/index.js'

// ─── SemVerParser ───
describe('SemVerParser parse', () => {
  const parser = new SemVerParser()

  it('parses basic version', () => {
    const v = parser.parse('1.2.3')
    expect(v.major).toBe(1)
    expect(v.minor).toBe(2)
    expect(v.patch).toBe(3)
  })

  it('parses version with v prefix', () => {
    const v = parser.parse('v1.2.3')
    expect(v.major).toBe(1)
  })

  it('parses prerelease', () => {
    const v = parser.parse('1.0.0-alpha.1')
    expect(v.prerelease).toEqual(['alpha', '1'])
  })

  it('parses build metadata', () => {
    const v = parser.parse('1.0.0+build.123')
    expect(v.buildMetadata).toEqual(['build', '123'])
  })

  it('throws on invalid version', () => {
    expect(() => parser.parse('not-a-version')).toThrow('Invalid semver')
  })
})

// ─── SemVerParser format ───
describe('SemVerParser format', () => {
  const parser = new SemVerParser()

  it('formats basic version', () => {
    expect(parser.format({ major: 1, minor: 2, patch: 3, prerelease: [], buildMetadata: [], raw: '' })).toBe('1.2.3')
  })

  it('formats with prerelease', () => {
    expect(parser.format({ major: 1, minor: 0, patch: 0, prerelease: ['rc', '1'], buildMetadata: [], raw: '' })).toBe('1.0.0-rc.1')
  })
})

// ─── SemVerParser compare ───
describe('SemVerParser compare', () => {
  const parser = new SemVerParser()

  it('compares major versions', () => {
    expect(parser.compare(parser.parse('2.0.0'), parser.parse('1.0.0'))).toBe(1)
    expect(parser.compare(parser.parse('1.0.0'), parser.parse('2.0.0'))).toBe(-1)
  })

  it('compares equal versions', () => {
    expect(parser.compare(parser.parse('1.2.3'), parser.parse('1.2.3'))).toBe(0)
  })

  it('gt, lt, gte, lte, equals', () => {
    const a = parser.parse('2.0.0')
    const b = parser.parse('1.0.0')
    expect(parser.gt(a, b)).toBe(true)
    expect(parser.lt(b, a)).toBe(true)
    expect(parser.gte(a, b)).toBe(true)
    expect(parser.lte(b, a)).toBe(true)
    expect(parser.equals(a, a)).toBe(true)
  })
})

// ─── SemVerParser satisfies ───
describe('SemVerParser satisfies', () => {
  const parser = new SemVerParser()

  it('satisfies exact version', () => {
    expect(parser.satisfies(parser.parse('1.2.3'), '1.2.3')).toBe(true)
  })

  it('satisfies caret range', () => {
    expect(parser.satisfies(parser.parse('1.2.5'), '^1.2.0')).toBe(true)
    expect(parser.satisfies(parser.parse('2.0.0'), '^1.2.0')).toBe(false)
  })

  it('satisfies tilde range', () => {
    expect(parser.satisfies(parser.parse('1.2.5'), '~1.2.0')).toBe(true)
    expect(parser.satisfies(parser.parse('1.3.0'), '~1.2.0')).toBe(false)
  })

  it('satisfies OR ranges', () => {
    expect(parser.satisfies(parser.parse('1.0.0'), '1.0.0 || 2.0.0')).toBe(true)
    expect(parser.satisfies(parser.parse('2.0.0'), '1.0.0 || 2.0.0')).toBe(true)
    expect(parser.satisfies(parser.parse('3.0.0'), '1.0.0 || 2.0.0')).toBe(false)
  })
})

// ─── SemVerParser sort ───
describe('SemVerParser sort', () => {
  it('sorts versions', () => {
    const parser = new SemVerParser()
    const sorted = parser.sort([parser.parse('3.0.0'), parser.parse('1.0.0'), parser.parse('2.0.0')])
    expect(sorted.map((v) => v.major)).toEqual([1, 2, 3])
  })
})

// ─── SemVerParser isValid / clean / increment ───
describe('SemVerParser isValid, clean, increment', () => {
  const parser = new SemVerParser()

  it('isValid checks version', () => {
    expect(parser.isValid('1.2.3')).toBe(true)
    expect(parser.isValid('v1.2.3')).toBe(true)
    expect(parser.isValid('abc')).toBe(false)
  })

  it('clean removes prefix', () => {
    expect(parser.clean('v1.2.3')).toBe('1.2.3')
    expect(parser.clean('=1.2.3')).toBe('1.2.3')
  })

  it('increments major', () => {
    const v = parser.increment(parser.parse('1.2.3'), 'major')
    expect(v.major).toBe(2)
    expect(v.minor).toBe(0)
    expect(v.patch).toBe(0)
  })

  it('increments minor', () => {
    const v = parser.increment(parser.parse('1.2.3'), 'minor')
    expect(v.minor).toBe(3)
    expect(v.patch).toBe(0)
  })

  it('increments patch', () => {
    const v = parser.increment(parser.parse('1.2.3'), 'patch')
    expect(v.patch).toBe(4)
  })

  it('increments none returns copy', () => {
    const orig = parser.parse('1.2.3')
    const v = parser.increment(orig, 'none')
    expect(v.major).toBe(1)
  })
})

// ─── VersionManager ───
describe('VersionManager', () => {
  it('determines bump from commits', () => {
    const vm = new VersionManager()
    expect(vm.determineBump([{ type: 'feat', description: 'new', breaking: false, footers: {} }])).toBe('minor')
    expect(vm.determineBump([{ type: 'fix', description: 'fix', breaking: false, footers: {} }])).toBe('patch')
    expect(vm.determineBump([{ type: 'feat', description: 'new', breaking: true, footers: {} }])).toBe('major')
    expect(vm.determineBump([])).toBe('none')
  })

  it('parses conventional commit', () => {
    const vm = new VersionManager()
    const c = vm.parseConventionalCommit('feat(auth): add login\n\nSome body\n\nBREAKING CHANGE: api changed')
    expect(c.type).toBe('feat')
    expect(c.scope).toBe('auth')
    expect(c.description).toBe('add login')
    expect(c.breaking).toBe(true)
  })

  it('parses commit with ! marker', () => {
    const vm = new VersionManager()
    const c = vm.parseConventionalCommit('feat!: big change')
    expect(c.breaking).toBe(true)
  })

  it('handles non-conventional commit', () => {
    const vm = new VersionManager()
    const c = vm.parseConventionalCommit('random message')
    expect(c.type).toBe('unknown')
  })

  it('computes next version', () => {
    const vm = new VersionManager()
    const parser = new SemVerParser()
    const next = vm.computeNextVersion(parser.parse('1.0.0'), [
      { type: 'feat', description: 'new', breaking: false, footers: {} },
    ])
    expect(next.minor).toBe(1)
  })

  it('getBreakingChanges', () => {
    const vm = new VersionManager()
    const changes = vm.getBreakingChanges([
      { type: 'feat', description: 'new api', breaking: true, footers: {} },
    ])
    expect(changes).toEqual(['new api'])
  })

  it('groupByType', () => {
    const vm = new VersionManager()
    const groups = vm.groupByType([
      { type: 'feat', description: 'a', breaking: false, footers: {} },
      { type: 'feat', description: 'b', breaking: false, footers: {} },
      { type: 'fix', description: 'c', breaking: false, footers: {} },
    ])
    expect(groups.length).toBe(2)
  })

  it('isPrerelease', () => {
    const vm = new VersionManager()
    const parser = new SemVerParser()
    expect(vm.isPrerelease(parser.parse('1.0.0-alpha.1'))).toBe(true)
    expect(vm.isPrerelease(parser.parse('1.0.0'))).toBe(false)
  })

  it('promotePrerelease', () => {
    const vm = new VersionManager()
    const parser = new SemVerParser()
    const v = vm.promotePrerelease(parser.parse('1.0.0-rc.1'))
    expect(v.prerelease).toEqual([])
  })
})

// ─── ChangelogGenerator ───
describe('ChangelogGenerator', () => {
  it('generates changelog', () => {
    const gen = new ChangelogGenerator()
    const note = gen.createReleaseNote('1.0.0', [
      { type: 'feat', description: 'new feature', breaking: false, footers: {} },
      { type: 'fix', description: 'bug fix', breaking: false, footers: {} },
    ], '2024-01-01')
    const changelog = gen.generate([note])
    expect(changelog).toContain('Changelog')
    expect(changelog).toContain('new feature')
    expect(changelog).toContain('bug fix')
  })

  it('formatCommit with scope', () => {
    const gen = new ChangelogGenerator()
    expect(gen.formatCommit({ type: 'feat', scope: 'auth', description: 'login', breaking: false, footers: {} })).toBe('**auth:** login')
  })

  it('formatCommit with breaking', () => {
    const gen = new ChangelogGenerator()
    expect(gen.formatCommit({ type: 'feat', description: 'api', breaking: true, footers: {} })).toContain('BREAKING')
  })

  it('generateSummary', () => {
    const gen = new ChangelogGenerator()
    expect(gen.generateSummary([
      { type: 'feat', description: 'a', breaking: false, footers: {} },
      { type: 'fix', description: 'b', breaking: false, footers: {} },
    ])).toContain('1 feature')
  })

  it('compareVersions', () => {
    const gen = new ChangelogGenerator()
    const from = gen.createReleaseNote('0.9.0', [], '2024-01-01')
    const to = gen.createReleaseNote('1.0.0', [{ type: 'feat', description: 'new', breaking: false, footers: {} }], '2024-01-02')
    const diff = gen.compareVersions(from, to)
    expect(diff).toContain('0.9.0')
    expect(diff).toContain('1.0.0')
  })
})

// ─── Constants ───
describe('semver constants', () => {
  it('DEFAULT_VERSION_CONFIG has expected bumpMap', () => {
    expect(DEFAULT_VERSION_CONFIG.bumpMap['feat']).toBe('minor')
    expect(DEFAULT_VERSION_CONFIG.bumpMap['fix']).toBe('patch')
  })

  it('DEFAULT_CHANGELOG_CONFIG has types', () => {
    expect(DEFAULT_CHANGELOG_CONFIG.types.length).toBeGreaterThan(0)
  })
})
