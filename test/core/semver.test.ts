import { describe, it, expect } from 'vitest'
import { SemVerParser } from '../../src/core/semver/semver-parser.js'
import { VersionManager } from '../../src/core/semver/version-manager.js'
import { ChangelogGenerator } from '../../src/core/semver/changelog-generator.js'
import type { ConventionalCommit, ReleaseNote } from '../../src/core/semver/types.js'
import { DEFAULT_VERSION_CONFIG, DEFAULT_CHANGELOG_CONFIG } from '../../src/core/semver/types.js'

describe('SemVerParser', () => {
  const parser = new SemVerParser()

  describe('parse', () => {
    it('should parse a basic semver string', () => {
      const sv = parser.parse('1.2.3')
      expect(sv.major).toBe(1)
      expect(sv.minor).toBe(2)
      expect(sv.patch).toBe(3)
      expect(sv.prerelease).toEqual([])
      expect(sv.buildMetadata).toEqual([])
      expect(sv.raw).toBe('1.2.3')
    })

    it('should parse a semver with prerelease', () => {
      const sv = parser.parse('1.2.3-alpha.1')
      expect(sv.major).toBe(1)
      expect(sv.minor).toBe(2)
      expect(sv.patch).toBe(3)
      expect(sv.prerelease).toEqual(['alpha', '1'])
    })

    it('should parse a semver with build metadata', () => {
      const sv = parser.parse('1.2.3+build.123')
      expect(sv.major).toBe(1)
      expect(sv.minor).toBe(2)
      expect(sv.patch).toBe(3)
      expect(sv.buildMetadata).toEqual(['build', '123'])
    })

    it('should parse a semver with both prerelease and build metadata', () => {
      const sv = parser.parse('1.2.3-beta.2+build.456')
      expect(sv.prerelease).toEqual(['beta', '2'])
      expect(sv.buildMetadata).toEqual(['build', '456'])
    })

    it('should throw on invalid semver', () => {
      expect(() => parser.parse('not-semver')).toThrow('Invalid semver')
      expect(() => parser.parse('')).toThrow('Invalid semver')
    })

    it('should handle leading v prefix via clean', () => {
      const sv = parser.parse('v1.2.3')
      expect(sv.major).toBe(1)
      expect(sv.minor).toBe(2)
      expect(sv.patch).toBe(3)
    })
  })

  describe('format', () => {
    it('should format a basic version', () => {
      const sv = parser.parse('1.2.3')
      expect(parser.format(sv)).toBe('1.2.3')
    })

    it('should format with prerelease and build metadata', () => {
      const sv = parser.parse('1.2.3-alpha.1+build.1')
      expect(parser.format(sv)).toBe('1.2.3-alpha.1+build.1')
    })
  })

  describe('compare', () => {
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

    it('should treat release as greater than prerelease', () => {
      const release = parser.parse('1.0.0')
      const pre = parser.parse('1.0.0-alpha')
      expect(parser.compare(release, pre)).toBe(1)
    })

    it('should compare equal versions as 0', () => {
      const a = parser.parse('1.2.3')
      const b = parser.parse('1.2.3')
      expect(parser.compare(a, b)).toBe(0)
    })
  })

  describe('comparison helpers', () => {
    it('equals', () => {
      expect(parser.equals(parser.parse('1.2.3'), parser.parse('1.2.3'))).toBe(true)
      expect(parser.equals(parser.parse('1.2.3'), parser.parse('1.2.4'))).toBe(false)
    })

    it('gt', () => {
      expect(parser.gt(parser.parse('2.0.0'), parser.parse('1.0.0'))).toBe(true)
      expect(parser.gt(parser.parse('1.0.0'), parser.parse('2.0.0'))).toBe(false)
    })

    it('gte', () => {
      expect(parser.gte(parser.parse('1.0.0'), parser.parse('1.0.0'))).toBe(true)
      expect(parser.gte(parser.parse('2.0.0'), parser.parse('1.0.0'))).toBe(true)
    })

    it('lt', () => {
      expect(parser.lt(parser.parse('1.0.0'), parser.parse('2.0.0'))).toBe(true)
      expect(parser.lt(parser.parse('2.0.0'), parser.parse('1.0.0'))).toBe(false)
    })

    it('lte', () => {
      expect(parser.lte(parser.parse('1.0.0'), parser.parse('1.0.0'))).toBe(true)
      expect(parser.lte(parser.parse('1.0.0'), parser.parse('2.0.0'))).toBe(true)
    })
  })

  describe('satisfies', () => {
    it('should handle caret range', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '^1.2.0')).toBe(true)
      expect(parser.satisfies(parser.parse('2.0.0'), '^1.2.0')).toBe(false)
    })

    it('should handle tilde range', () => {
      expect(parser.satisfies(parser.parse('1.2.5'), '~1.2.0')).toBe(true)
      expect(parser.satisfies(parser.parse('1.3.0'), '~1.2.0')).toBe(false)
    })

    it('should handle comparison operators', () => {
      expect(parser.satisfies(parser.parse('2.0.0'), '>=1.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('0.9.0'), '>=1.0.0')).toBe(false)
      expect(parser.satisfies(parser.parse('0.9.0'), '<1.0.0')).toBe(true)
    })

    it('should handle x-ranges', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '1.x')).toBe(true)
      expect(parser.satisfies(parser.parse('2.0.0'), '1.x')).toBe(false)
      expect(parser.satisfies(parser.parse('1.5.0'), '1.5.x')).toBe(true)
    })

    it('should handle OR ranges', () => {
      expect(parser.satisfies(parser.parse('1.0.0'), '^1.0.0 || ^2.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('2.5.0'), '^1.0.0 || ^2.0.0')).toBe(true)
      expect(parser.satisfies(parser.parse('3.0.0'), '^1.0.0 || ^2.0.0')).toBe(false)
    })

    it('should handle exact version', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '1.2.3')).toBe(true)
      expect(parser.satisfies(parser.parse('1.2.4'), '1.2.3')).toBe(false)
    })

    it('should handle star range', () => {
      expect(parser.satisfies(parser.parse('1.2.3'), '*')).toBe(true)
    })
  })

  describe('sort', () => {
    it('should sort versions ascending', () => {
      const versions = [parser.parse('2.0.0'), parser.parse('1.0.0'), parser.parse('1.5.0')]
      const sorted = parser.sort(versions)
      expect(sorted.map((v) => v.raw)).toEqual(['1.0.0', '1.5.0', '2.0.0'])
    })

    it('should sort versions with prereleases', () => {
      const versions = [
        parser.parse('1.0.0'),
        parser.parse('1.0.0-alpha'),
        parser.parse('1.0.0-beta'),
      ]
      const sorted = parser.sort(versions)
      expect(sorted[0]!.prerelease).toEqual(['alpha'])
      expect(sorted[1]!.prerelease).toEqual(['beta'])
      expect(sorted[2]!.prerelease).toEqual([])
    })
  })

  describe('increment', () => {
    it('should increment major', () => {
      const sv = parser.parse('1.2.3')
      const next = parser.increment(sv, 'major')
      expect(parser.format(next)).toBe('2.0.0')
    })

    it('should increment minor', () => {
      const sv = parser.parse('1.2.3')
      const next = parser.increment(sv, 'minor')
      expect(parser.format(next)).toBe('1.3.0')
    })

    it('should increment patch', () => {
      const sv = parser.parse('1.2.3')
      const next = parser.increment(sv, 'patch')
      expect(parser.format(next)).toBe('1.2.4')
    })

    it('should increment prerelease from release', () => {
      const sv = parser.parse('1.2.3')
      const next = parser.increment(sv, 'prerelease', 'rc')
      expect(parser.format(next)).toBe('1.2.4-rc.0')
    })

    it('should increment prerelease from existing prerelease', () => {
      const sv = parser.parse('1.2.3-rc.0')
      const next = parser.increment(sv, 'prerelease')
      expect(parser.format(next)).toBe('1.2.3-rc.1')
    })

    it('should return same version for none', () => {
      const sv = parser.parse('1.2.3')
      const next = parser.increment(sv, 'none')
      expect(parser.format(next)).toBe('1.2.3')
    })
  })

  describe('clean/isValid', () => {
    it('should strip leading v', () => {
      expect(parser.clean('v1.2.3')).toBe('1.2.3')
    })

    it('should strip leading =', () => {
      expect(parser.clean('=1.2.3')).toBe('1.2.3')
    })

    it('should validate semver strings', () => {
      expect(parser.isValid('1.2.3')).toBe(true)
      expect(parser.isValid('v1.2.3')).toBe(true)
      expect(parser.isValid('not-semver')).toBe(false)
      expect(parser.isValid('1.2.3-alpha.1')).toBe(true)
      expect(parser.isValid('1.2.3+build.1')).toBe(true)
    })
  })
})

describe('VersionManager', () => {
  const manager = new VersionManager()

  describe('determineBump', () => {
    it('should return minor for feat commits', () => {
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'add feature', breaking: false, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('minor')
    })

    it('should return patch for fix commits', () => {
      const commits: ConventionalCommit[] = [
        { type: 'fix', description: 'fix bug', breaking: false, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('patch')
    })

    it('should return major for breaking changes', () => {
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'breaking feature', breaking: true, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('major')
    })

    it('should return major when any commit is breaking even with minor types', () => {
      const commits: ConventionalCommit[] = [
        { type: 'fix', description: 'a fix', breaking: false, footers: {} },
        { type: 'feat', description: 'breaking feat', breaking: true, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('major')
    })

    it('should return none for empty commits', () => {
      expect(manager.determineBump([])).toBe('none')
    })

    it('should return none for only docs/chore/test', () => {
      const commits: ConventionalCommit[] = [
        { type: 'docs', description: 'update docs', breaking: false, footers: {} },
        { type: 'chore', description: 'cleanup', breaking: false, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('none')
    })

    it('should pick the highest bump from mixed commits', () => {
      const commits: ConventionalCommit[] = [
        { type: 'fix', description: 'fix bug', breaking: false, footers: {} },
        { type: 'feat', description: 'new feature', breaking: false, footers: {} },
      ]
      expect(manager.determineBump(commits)).toBe('minor')
    })
  })

  describe('computeNextVersion', () => {
    it('should compute next minor version for feat', () => {
      const current = new SemVerParser().parse('1.0.0')
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'new feature', breaking: false, footers: {} },
      ]
      const next = manager.computeNextVersion(current, commits)
      expect(new SemVerParser().format(next)).toBe('1.1.0')
    })

    it('should compute next major version for breaking', () => {
      const current = new SemVerParser().parse('1.5.3')
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'breaking change', breaking: true, footers: {} },
      ]
      const next = manager.computeNextVersion(current, commits)
      expect(new SemVerParser().format(next)).toBe('2.0.0')
    })

    it('should stay same for none bump', () => {
      const current = new SemVerParser().parse('1.0.0')
      const commits: ConventionalCommit[] = [
        { type: 'docs', description: 'update docs', breaking: false, footers: {} },
      ]
      const next = manager.computeNextVersion(current, commits)
      expect(new SemVerParser().format(next)).toBe('1.0.0')
    })
  })

  describe('parseConventionalCommit', () => {
    it('should parse a feat commit', () => {
      const result = manager.parseConventionalCommit('feat: add new feature')
      expect(result.type).toBe('feat')
      expect(result.description).toBe('add new feature')
      expect(result.breaking).toBe(false)
    })

    it('should parse a fix commit with scope', () => {
      const result = manager.parseConventionalCommit('fix(core): resolve crash')
      expect(result.type).toBe('fix')
      expect(result.scope).toBe('core')
      expect(result.description).toBe('resolve crash')
    })

    it('should parse a breaking change with ! marker', () => {
      const result = manager.parseConventionalCommit('feat!: redesign API')
      expect(result.type).toBe('feat')
      expect(result.breaking).toBe(true)
      expect(result.description).toBe('redesign API')
    })

    it('should parse a multi-line commit with body and footer', () => {
      const msg = 'feat: add new feature\n\nThis is the body.\n\nBREAKING CHANGE: API changed'
      const result = manager.parseConventionalCommit(msg)
      expect(result.type).toBe('feat')
      expect(result.description).toBe('add new feature')
      expect(result.body).toBe('This is the body.')
      expect(result.breaking).toBe(true)
      expect(result.footers['BREAKING CHANGE']).toBe('API changed')
    })

    it('should parse commit with footers', () => {
      const msg = 'feat: add feature\n\nSome description\n\nReviewed-by: John\nRefs: #123'
      const result = manager.parseConventionalCommit(msg)
      expect(result.footers['Reviewed-by']).toBe('John')
      expect(result.footers['Refs']).toBe('#123')
    })

    it('should handle non-conventional commits', () => {
      const result = manager.parseConventionalCommit('random commit message')
      expect(result.type).toBe('unknown')
      expect(result.description).toBe('random commit message')
      expect(result.breaking).toBe(false)
    })
  })

  describe('parseCommitMessages', () => {
    it('should batch parse multiple messages', () => {
      const messages = ['feat: add feature', 'fix: fix bug']
      const results = manager.parseCommitMessages(messages)
      expect(results).toHaveLength(2)
      expect(results[0]!.type).toBe('feat')
      expect(results[1]!.type).toBe('fix')
    })
  })

  describe('getBreakingChanges', () => {
    it('should extract breaking change descriptions from footers', () => {
      const commits: ConventionalCommit[] = [
        {
          type: 'feat',
          description: 'new feature',
          breaking: true,
          footers: { 'BREAKING CHANGE': 'API endpoint removed' },
        },
      ]
      const changes = manager.getBreakingChanges(commits)
      expect(changes).toEqual(['API endpoint removed'])
    })

    it('should fall back to description for breaking changes without footer', () => {
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'remove old API', breaking: true, footers: {} },
      ]
      const changes = manager.getBreakingChanges(commits)
      expect(changes).toEqual(['remove old API'])
    })

    it('should return empty array when no breaking changes', () => {
      const commits: ConventionalCommit[] = [
        { type: 'fix', description: 'fix bug', breaking: false, footers: {} },
      ]
      expect(manager.getBreakingChanges(commits)).toEqual([])
    })
  })

  describe('groupByType', () => {
    it('should group commits by type', () => {
      const commits: ConventionalCommit[] = [
        { type: 'feat', description: 'feature 1', breaking: false, footers: {} },
        { type: 'feat', description: 'feature 2', breaking: false, footers: {} },
        { type: 'fix', description: 'fix 1', breaking: false, footers: {} },
      ]
      const groups = manager.groupByType(commits)
      expect(groups).toHaveLength(2)
      const featGroup = groups.find((g) => g.type === 'feat')
      const fixGroup = groups.find((g) => g.type === 'fix')
      expect(featGroup!.commits).toHaveLength(2)
      expect(fixGroup!.commits).toHaveLength(1)
    })

    it('should handle empty commits', () => {
      expect(manager.groupByType([])).toEqual([])
    })
  })

  describe('prerelease handling', () => {
    it('should detect prerelease versions', () => {
      const pre = new SemVerParser().parse('1.0.0-rc.1')
      const release = new SemVerParser().parse('1.0.0')
      expect(manager.isPrerelease(pre)).toBe(true)
      expect(manager.isPrerelease(release)).toBe(false)
    })

    it('should promote prerelease to release', () => {
      const pre = new SemVerParser().parse('1.0.0-rc.1')
      const promoted = manager.promotePrerelease(pre)
      expect(promoted.prerelease).toEqual([])
      expect(new SemVerParser().format(promoted)).toBe('1.0.0')
    })
  })
})

describe('ChangelogGenerator', () => {
  const generator = new ChangelogGenerator()

  const sampleCommits: ConventionalCommit[] = [
    { type: 'feat', description: 'add new feature', breaking: false, footers: {} },
    { type: 'fix', description: 'fix crash', breaking: false, footers: {} },
    {
      type: 'feat',
      description: 'redesign API',
      breaking: true,
      footers: { 'BREAKING CHANGE': 'old API removed' },
    },
  ]

  describe('generate', () => {
    it('should generate full changelog with multiple releases', () => {
      const releases: ReleaseNote[] = [
        {
          version: '2.0.0',
          date: '2024-01-15',
          title: '2.0.0',
          sections: [
            { type: 'feat', title: 'Features', commits: [sampleCommits[0]!] },
          ],
          breakingChanges: [],
          summary: '1 feature',
        },
        {
          version: '1.0.0',
          date: '2024-01-01',
          title: '1.0.0',
          sections: [
            { type: 'fix', title: 'Bug Fixes', commits: [sampleCommits[1]!] },
          ],
          breakingChanges: [],
          summary: '1 fix',
        },
      ]
      const changelog = generator.generate(releases)
      expect(changelog).toContain('# Changelog')
      expect(changelog).toContain('## 2.0.0 (2024-01-15)')
      expect(changelog).toContain('## 1.0.0 (2024-01-01)')
      expect(changelog).toContain('add new feature')
      expect(changelog).toContain('fix crash')
    })

    it('should generate empty changelog for no releases', () => {
      const changelog = generator.generate([])
      expect(changelog).toContain('# Changelog')
    })
  })

  describe('generateRelease', () => {
    it('should generate single release section with breaking changes', () => {
      const note: ReleaseNote = {
        version: '2.0.0',
        date: '2024-01-15',
        title: '2.0.0',
        sections: [
          { type: 'feat', title: 'Features', commits: [sampleCommits[0]!] },
        ],
        breakingChanges: ['old API removed'],
        summary: '1 feature, 1 breaking change',
      }
      const release = generator.generateRelease(note)
      expect(release).toContain('## 2.0.0 (2024-01-15)')
      expect(release).toContain('### BREAKING CHANGES')
      expect(release).toContain('old API removed')
      expect(release).toContain('### Features')
    })

    it('should generate release without breaking changes section when empty', () => {
      const note: ReleaseNote = {
        version: '1.1.0',
        date: '2024-02-01',
        title: '1.1.0',
        sections: [
          { type: 'feat', title: 'Features', commits: [sampleCommits[0]!] },
        ],
        breakingChanges: [],
        summary: '',
      }
      const release = generator.generateRelease(note)
      expect(release).not.toContain('### BREAKING CHANGES')
    })
  })

  describe('generateSection', () => {
    it('should render commit group as markdown', () => {
      const group = {
        type: 'feat',
        title: 'Features',
        commits: [
          { type: 'feat', description: 'add feature A', breaking: false, footers: {} },
          { type: 'feat', description: 'add feature B', breaking: false, footers: {} },
        ],
      }
      const section = generator.generateSection(group)
      expect(section).toContain('### Features')
      expect(section).toContain('* add feature A')
      expect(section).toContain('* add feature B')
    })

    it('should handle empty group', () => {
      const group = {
        type: 'fix',
        title: 'Bug Fixes',
        commits: [],
      }
      const section = generator.generateSection(group)
      expect(section).toContain('### Bug Fixes')
    })
  })

  describe('formatCommit', () => {
    it('should format commit with scope', () => {
      const commit: ConventionalCommit = {
        type: 'fix',
        scope: 'core',
        description: 'fix crash',
        breaking: false,
        footers: {},
      }
      expect(generator.formatCommit(commit)).toBe('**core:** fix crash')
    })

    it('should format breaking commit', () => {
      const commit: ConventionalCommit = {
        type: 'feat',
        description: 'redesign API',
        breaking: true,
        footers: {},
      }
      expect(generator.formatCommit(commit)).toBe('redesign API (**BREAKING**)')
    })

    it('should format commit without scope', () => {
      const commit: ConventionalCommit = {
        type: 'fix',
        description: 'fix bug',
        breaking: false,
        footers: {},
      }
      expect(generator.formatCommit(commit)).toBe('fix bug')
    })
  })

  describe('createReleaseNote', () => {
    it('should create a release note from commits', () => {
      const note = generator.createReleaseNote('1.0.0', sampleCommits, '2024-01-01')
      expect(note.version).toBe('1.0.0')
      expect(note.date).toBe('2024-01-01')
      expect(note.sections).toHaveLength(2)
      expect(note.breakingChanges).toContain('old API removed')
    })

    it('should use current date when not provided', () => {
      const note = generator.createReleaseNote('1.0.0', [])
      expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle empty commits', () => {
      const note = generator.createReleaseNote('1.0.0', [])
      expect(note.sections).toEqual([])
      expect(note.breakingChanges).toEqual([])
      expect(note.summary).toBe('')
    })
  })

  describe('generateSummary', () => {
    it('should summarize mixed commits', () => {
      const summary = generator.generateSummary(sampleCommits)
      expect(summary).toContain('2 features')
      expect(summary).toContain('1 fix')
      expect(summary).toContain('1 breaking change')
    })

    it('should return empty string for no commits', () => {
      expect(generator.generateSummary([])).toBe('')
    })

    it('should summarize only fixes', () => {
      const commits: ConventionalCommit[] = [
        { type: 'fix', description: 'fix 1', breaking: false, footers: {} },
        { type: 'fix', description: 'fix 2', breaking: false, footers: {} },
      ]
      const summary = generator.generateSummary(commits)
      expect(summary).toBe('2 fixes')
    })

    it('should handle unknown types', () => {
      const commits: ConventionalCommit[] = [
        { type: 'style', description: 'format', breaking: false, footers: {} },
      ]
      const summary = generator.generateSummary(commits)
      expect(summary).toContain('1 commit')
    })
  })

  describe('compareVersions', () => {
    it('should generate diff between releases', () => {
      const from: ReleaseNote = {
        version: '1.0.0',
        date: '2024-01-01',
        title: '1.0.0',
        sections: [
          { type: 'fix', title: 'Bug Fixes', commits: [sampleCommits[1]!] },
        ],
        breakingChanges: [],
        summary: '',
      }
      const to: ReleaseNote = {
        version: '2.0.0',
        date: '2024-02-01',
        title: '2.0.0',
        sections: [
          { type: 'feat', title: 'Features', commits: [sampleCommits[0]!] },
        ],
        breakingChanges: ['old API removed'],
        summary: '',
      }
      const diff = generator.compareVersions(from, to)
      expect(diff).toContain('Changes from 1.0.0 to 2.0.0')
      expect(diff).toContain('New sections: feat')
      expect(diff).toContain('Removed sections: fix')
    })
  })
})

describe('Default configs', () => {
  it('should have correct default bump map', () => {
    expect(DEFAULT_VERSION_CONFIG.bumpMap['feat']).toBe('minor')
    expect(DEFAULT_VERSION_CONFIG.bumpMap['fix']).toBe('patch')
    expect(DEFAULT_VERSION_CONFIG.bumpMap['docs']).toBe('none')
    expect(DEFAULT_VERSION_CONFIG.bumpMap['breaking']).toBe('major')
  })

  it('should have correct default changelog config', () => {
    expect(DEFAULT_CHANGELOG_CONFIG.title).toBe('Changelog')
    expect(DEFAULT_CHANGELOG_CONFIG.types.length).toBeGreaterThan(0)
    expect(DEFAULT_CHANGELOG_CONFIG.renderOrder.length).toBeGreaterThan(0)
  })
})

describe('Edge cases', () => {
  const parser = new SemVerParser()
  const manager = new VersionManager()

  it('should handle all breaking commits', () => {
    const commits: ConventionalCommit[] = [
      { type: 'feat', description: 'a', breaking: true, footers: {} },
      { type: 'fix', description: 'b', breaking: true, footers: {} },
    ]
    expect(manager.determineBump(commits)).toBe('major')
  })

  it('should handle no breaking commits', () => {
    const commits: ConventionalCommit[] = [
      { type: 'feat', description: 'a', breaking: false, footers: {} },
      { type: 'fix', description: 'b', breaking: false, footers: {} },
    ]
    expect(manager.getBreakingChanges(commits)).toEqual([])
  })

  it('should order prerelease correctly: alpha < beta < release', () => {
    const alpha = parser.parse('1.0.0-alpha')
    const beta = parser.parse('1.0.0-beta')
    const release = parser.parse('1.0.0')
    expect(parser.lt(alpha, beta)).toBe(true)
    expect(parser.lt(beta, release)).toBe(true)
  })

  it('should handle numeric prerelease ordering', () => {
    const rc0 = parser.parse('1.0.0-rc.0')
    const rc1 = parser.parse('1.0.0-rc.1')
    const rc2 = parser.parse('1.0.0-rc.2')
    expect(parser.lt(rc0, rc1)).toBe(true)
    expect(parser.lt(rc1, rc2)).toBe(true)
  })

  it('should handle custom config in VersionManager', () => {
    const customManager = new VersionManager({ prereleasePrefix: 'beta', tagPrefix: 'release-' })
    const current = parser.parse('1.0.0')
    const commits: ConventionalCommit[] = [
      { type: 'feat', description: 'new feature', breaking: false, footers: {} },
    ]
    const next = customManager.computeNextVersion(current, commits)
    expect(parser.format(next)).toBe('1.1.0')
  })

  it('should handle custom changelog config', () => {
    const customGenerator = new ChangelogGenerator({ title: 'Release Notes' })
    const note: ReleaseNote = {
      version: '1.0.0',
      date: '2024-01-01',
      title: '1.0.0',
      sections: [],
      breakingChanges: [],
      summary: '',
    }
    const changelog = customGenerator.generate([note])
    expect(changelog).toContain('# Release Notes')
  })

  it('should parse version with only major', () => {
    const sv = parser.parse('1')
    expect(sv.major).toBe(1)
    expect(sv.minor).toBe(0)
    expect(sv.patch).toBe(0)
  })

  it('should handle breaking change via BREAKING-CHANGE footer', () => {
    const msg = 'feat: new API\n\nBREAKING-CHANGE: old API removed'
    const result = manager.parseConventionalCommit(msg)
    expect(result.breaking).toBe(true)
    expect(result.footers['BREAKING CHANGE']).toBe('old API removed')
  })
})
