import { describe, it, expect } from 'vitest'

import {
  parseGitLog,
  classifyCommit,
  extractScope,
  detectBreaking,
  groupByType,
  groupByVersion,
  type CommitInfo,
  type ChangelogsResult,
  type VersionGroup,
} from '../src/commands/changelogs-helpers.js'

import {
  formatConventional,
  formatSimple,
  formatDetailed,
  formatChangelogJson,
} from '../src/commands/changelogs-format-helpers.js'

import Changelogs from '../src/commands/changelogs.js'

// ─── Test helpers ─────────────────────────────────────────

function makeCommit(overrides: Partial<CommitInfo> = {}): CommitInfo {
  return {
    author: 'Alice',
    body: '',
    breaking: false,
    date: '2024-01-15T10:00:00Z',
    hash: 'abc123def456789012345678901234567890abcd',
    message: 'feat: add feature',
    scope: '',
    shortHash: 'abc123d',
    type: 'feat',
    ...overrides,
  }
}

function makeResult(overrides: Partial<ChangelogsResult> = {}): ChangelogsResult {
  return {
    authors: [],
    dateRange: '',
    totalCommits: 0,
    versions: [],
    ...overrides,
  }
}

const SAMPLE_GIT_LOG = [
  'abc123def456789012345678901234567890abcd|abc123d|2024-01-15T10:00:00Z|Alice|feat: add login',
  'def456abc789012345678901234567890abcdef12|def456a|2024-01-14T09:00:00Z|Bob|fix: null pointer',
  '789012345678901234567890abcdef12abcdef34|7890123|2024-01-13T08:00:00Z|Alice|docs: update readme',
].join('\n')

// ─── classifyCommit ───────────────────────────────────────

describe('classifyCommit', () => {
  it('should classify feat:', () => {
    expect(classifyCommit('feat: add login')).toBe('feat')
  })

  it('should classify fix:', () => {
    expect(classifyCommit('fix: null pointer')).toBe('fix')
  })

  it('should classify refactor:', () => {
    expect(classifyCommit('refactor: clean up module')).toBe('refactor')
  })

  it('should classify docs:', () => {
    expect(classifyCommit('docs: update readme')).toBe('docs')
  })

  it('should classify doc: as docs', () => {
    expect(classifyCommit('doc: add comments')).toBe('docs')
  })

  it('should classify test:', () => {
    expect(classifyCommit('test: add unit tests')).toBe('test')
  })

  it('should classify chore:', () => {
    expect(classifyCommit('chore: update deps')).toBe('chore')
  })

  it('should classify style:', () => {
    expect(classifyCommit('style: fix formatting')).toBe('style')
  })

  it('should classify perf:', () => {
    expect(classifyCommit('perf: optimize loop')).toBe('perf')
  })

  it('should classify build:', () => {
    expect(classifyCommit('build: update webpack')).toBe('build')
  })

  it('should classify ci:', () => {
    expect(classifyCommit('ci: add github action')).toBe('ci')
  })

  it('should classify revert:', () => {
    expect(classifyCommit('revert: bad commit')).toBe('revert')
  })

  it('should detect type with scope', () => {
    expect(classifyCommit('feat(auth): add OAuth')).toBe('feat')
  })

  it('should detect type with breaking !', () => {
    expect(classifyCommit('feat!: new API')).toBe('feat')
  })

  it('should classify by keyword: fix', () => {
    expect(classifyCommit('fix typo in code')).toBe('fix')
  })

  it('should classify by keyword: add', () => {
    expect(classifyCommit('add new feature')).toBe('feat')
  })

  it('should classify merge commits as other', () => {
    expect(classifyCommit('merge branch into main')).toBe('other')
  })

  it('should return other for unrecognized', () => {
    expect(classifyCommit('random update')).toBe('other')
  })
})

// ─── extractScope ─────────────────────────────────────────

describe('extractScope', () => {
  it('should extract scope from feat(scope):', () => {
    expect(extractScope('feat(auth): add OAuth')).toBe('auth')
  })

  it('should extract multi-word scope', () => {
    expect(extractScope('feat(user-management): update')).toBe('user-management')
  })

  it('should return empty for no scope', () => {
    expect(extractScope('feat: add login')).toBe('')
  })

  it('should return empty for non-conventional message', () => {
    expect(extractScope('update something')).toBe('')
  })

  it('should extract scope from fix(core):', () => {
    expect(extractScope('fix(core): null pointer')).toBe('core')
  })
})

// ─── detectBreaking ───────────────────────────────────────

describe('detectBreaking', () => {
  it('should detect ! after type', () => {
    expect(detectBreaking('feat!: new API', '')).toBe(true)
  })

  it('should detect ! after scope', () => {
    expect(detectBreaking('feat(auth)!: new OAuth', '')).toBe(true)
  })

  it('should not flag normal commits', () => {
    expect(detectBreaking('feat: add login', '')).toBe(false)
  })

  it('should detect BREAKING CHANGE in body', () => {
    expect(detectBreaking('feat: update', 'BREAKING CHANGE: drops old API')).toBe(true)
  })

  it('should detect BREAKING-CHANGE in body', () => {
    expect(detectBreaking('feat: update', 'BREAKING-CHANGE: drops old API')).toBe(true)
  })

  it('should not flag BREAKING in subject only', () => {
    expect(detectBreaking('feat: breaking bad', '')).toBe(false)
  })
})

// ─── parseGitLog ──────────────────────────────────────────

describe('parseGitLog', () => {
  it('should parse sample git log output', () => {
    const commits = parseGitLog(SAMPLE_GIT_LOG)
    expect(commits).toHaveLength(3)
  })

  it('should extract correct fields', () => {
    const commits = parseGitLog(SAMPLE_GIT_LOG)
    expect(commits[0].hash).toBe('abc123def456789012345678901234567890abcd')
    expect(commits[0].shortHash).toBe('abc123d')
    expect(commits[0].author).toBe('Alice')
    expect(commits[0].message).toBe('feat: add login')
    expect(commits[0].type).toBe('feat')
  })

  it('should classify commit types', () => {
    const commits = parseGitLog(SAMPLE_GIT_LOG)
    expect(commits[0].type).toBe('feat')
    expect(commits[1].type).toBe('fix')
    expect(commits[2].type).toBe('docs')
  })

  it('should extract scopes', () => {
    const log = 'abc|abc|2024-01-01T00:00:00Z|A|feat(core): add thing'
    const commits = parseGitLog(log)
    expect(commits[0].scope).toBe('core')
  })

  it('should return empty for empty input', () => {
    expect(parseGitLog('')).toHaveLength(0)
  })

  it('should skip malformed lines', () => {
    expect(parseGitLog('bad line')).toHaveLength(0)
  })

  it('should handle messages with pipes', () => {
    const log = 'abc|abc|2024-01-01T00:00:00Z|A|feat: add | pipe support'
    const commits = parseGitLog(log)
    expect(commits[0].message).toBe('feat: add | pipe support')
  })
})

// ─── groupByType ──────────────────────────────────────────

describe('groupByType', () => {
  it('should group commits by type', () => {
    const commits = [
      makeCommit({ type: 'feat', message: 'feat: a' }),
      makeCommit({ type: 'feat', message: 'feat: b' }),
      makeCommit({ type: 'fix', message: 'fix: c' }),
    ]
    const groups = groupByType(commits)
    expect(groups).toHaveLength(2)
    expect(groups[0].type).toBe('feat')
    expect(groups[0].commits).toHaveLength(2)
    expect(groups[1].type).toBe('fix')
    expect(groups[1].commits).toHaveLength(1)
  })

  it('should sort by importance (feat before fix)', () => {
    const commits = [
      makeCommit({ type: 'fix' }),
      makeCommit({ type: 'feat' }),
      makeCommit({ type: 'docs' }),
    ]
    const groups = groupByType(commits)
    expect(groups[0].type).toBe('feat')
    expect(groups[1].type).toBe('fix')
    expect(groups[2].type).toBe('docs')
  })

  it('should use correct titles', () => {
    const commits = [makeCommit({ type: 'feat' }), makeCommit({ type: 'fix' })]
    const groups = groupByType(commits)
    expect(groups[0].title).toBe('Features')
    expect(groups[1].title).toBe('Bug Fixes')
  })

  it('should return empty for empty input', () => {
    expect(groupByType([])).toHaveLength(0)
  })

  it('should handle single type', () => {
    const commits = [makeCommit({ type: 'chore' }), makeCommit({ type: 'chore' })]
    const groups = groupByType(commits)
    expect(groups).toHaveLength(1)
    expect(groups[0].commits).toHaveLength(2)
  })
})

// ─── groupByVersion ───────────────────────────────────────

describe('groupByVersion', () => {
  it('should group all commits as Unreleased', () => {
    const commits = [makeCommit(), makeCommit()]
    const versions = groupByVersion(commits, '.')
    expect(versions).toHaveLength(1)
    expect(versions[0].version).toBe('Unreleased')
  })

  it('should include date from first commit', () => {
    const commits = [makeCommit({ date: '2024-03-01T00:00:00Z' })]
    const versions = groupByVersion(commits, '.')
    expect(versions[0].date).toBe('2024-03-01')
  })

  it('should return empty for empty input', () => {
    expect(groupByVersion([], '.')).toHaveLength(0)
  })

  it('should include type groups', () => {
    const commits = [
      makeCommit({ type: 'feat' }),
      makeCommit({ type: 'fix' }),
    ]
    const versions = groupByVersion(commits, '.')
    expect(versions[0].groups.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── formatConventional ───────────────────────────────────

describe('formatConventional', () => {
  it('should contain Changelog heading', () => {
    const result = formatConventional(makeResult({
      versions: [{ version: '1.0.0', date: '2024-01-01', groups: [] }],
    }))
    expect(result).toContain('# Changelog')
  })

  it('should contain version heading', () => {
    const result = formatConventional(makeResult({
      versions: [{ version: '1.0.0', date: '2024-01-01', groups: [] }],
    }))
    expect(result).toContain('1.0.0')
    expect(result).toContain('2024-01-01')
  })

  it('should contain group titles', () => {
    const commits = [makeCommit({ message: 'feat: cool feature', type: 'feat' })]
    const result = formatConventional(makeResult({
      versions: [{
        version: 'Unreleased',
        date: '2024-01-15',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    expect(result).toContain('Features')
    expect(result).toContain('cool feature')
  })

  it('should show short hash', () => {
    const commits = [makeCommit({ shortHash: 'abc123d', message: 'feat: x', type: 'feat' })]
    const result = formatConventional(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    expect(result).toContain('abc123d')
  })

  it('should show BREAKING prefix for breaking changes', () => {
    const commits = [makeCommit({ message: 'feat!: new api', type: 'feat', breaking: true })]
    const result = formatConventional(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    expect(result).toContain('BREAKING')
  })

  it('should show scope when present', () => {
    const commits = [makeCommit({ message: 'feat(auth): login', type: 'feat', scope: 'auth' })]
    const result = formatConventional(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    expect(result).toContain('(auth)')
  })
})

// ─── formatSimple ─────────────────────────────────────────

describe('formatSimple', () => {
  it('should show flat list of commits', () => {
    const commits = [makeCommit({
      message: 'feat: x',
      type: 'feat',
      shortHash: 'abc123',
      date: '2024-01-15T10:00:00Z',
    })]
    const result = formatSimple(makeResult({
      versions: [{
        version: 'Unreleased',
        date: '2024-01-15',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    expect(result).toContain('feat: x')
    expect(result).toContain('abc123')
    expect(result).toContain('2024-01-15')
  })

  it('should show multiple commits', () => {
    const commits = [
      makeCommit({ message: 'feat: a', type: 'feat' }),
      makeCommit({ message: 'fix: b', type: 'fix' }),
    ]
    const result = formatSimple(makeResult({
      versions: [{
        version: 'Unreleased',
        date: '2024-01-15',
        groups: [
          { type: 'feat', title: 'Features', commits: [commits[0]] },
          { type: 'fix', title: 'Bug Fixes', commits: [commits[1]] },
        ],
      }],
    }))
    expect(result).toContain('feat: a')
    expect(result).toContain('fix: b')
  })

  it('should return empty for empty result', () => {
    const result = formatSimple(makeResult())
    expect(result).toBe('')
  })
})

// ─── formatDetailed ───────────────────────────────────────

describe('formatDetailed', () => {
  it('should show total commits', () => {
    const result = formatDetailed(makeResult({ totalCommits: 42 }), false)
    expect(result).toContain('42')
  })

  it('should show date range', () => {
    const result = formatDetailed(makeResult({ dateRange: '2024-01-01 to 2024-06-01' }), false)
    expect(result).toContain('2024-01-01 to 2024-06-01')
  })

  it('should show authors', () => {
    const result = formatDetailed(makeResult({ authors: ['Alice', 'Bob'] }), false)
    expect(result).toContain('Alice')
    expect(result).toContain('Bob')
  })

  it('should show author per commit', () => {
    const commits = [makeCommit({ author: 'Charlie', message: 'feat: x', type: 'feat' })]
    const result = formatDetailed(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }), false)
    expect(result).toContain('by Charlie')
  })

  it('should show type tag per commit', () => {
    const commits = [makeCommit({ message: 'feat: x', type: 'feat' })]
    const result = formatDetailed(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }), false)
    expect(result).toContain('feat')
  })

  it('should show body in verbose mode', () => {
    const commits = [makeCommit({
      message: 'feat: x',
      type: 'feat',
      body: 'This is the detailed body text',
    })]
    const result = formatDetailed(makeResult({
      versions: [{
        version: '1.0.0',
        date: '2024-01-01',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }), true)
    expect(result).toContain('detailed body text')
  })
})

// ─── formatChangelogJson ──────────────────────────────────

describe('formatChangelogJson', () => {
  it('should produce valid JSON', () => {
    const result = formatChangelogJson(makeResult())
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should contain totalCommits', () => {
    const result = formatChangelogJson(makeResult({ totalCommits: 15 }))
    const parsed = JSON.parse(result)
    expect(parsed.totalCommits).toBe(15)
  })

  it('should contain versions', () => {
    const versions: VersionGroup[] = [{
      version: '1.0.0',
      date: '2024-01-01',
      groups: [],
    }]
    const result = formatChangelogJson(makeResult({ versions }))
    const parsed = JSON.parse(result)
    expect(parsed.versions).toHaveLength(1)
    expect(parsed.versions[0].version).toBe('1.0.0')
  })

  it('should contain authors', () => {
    const result = formatChangelogJson(makeResult({ authors: ['Alice', 'Bob'] }))
    const parsed = JSON.parse(result)
    expect(parsed.authors).toEqual(['Alice', 'Bob'])
  })

  it('should contain dateRange', () => {
    const result = formatChangelogJson(makeResult({ dateRange: 'Jan to Jun' }))
    const parsed = JSON.parse(result)
    expect(parsed.dateRange).toBe('Jan to Jun')
  })

  it('should serialize commit info in groups', () => {
    const commits = [makeCommit({ message: 'feat: x', hash: 'abc' })]
    const result = formatChangelogJson(makeResult({
      versions: [{
        version: 'Unreleased',
        date: '2024-01-15',
        groups: [{ type: 'feat', title: 'Features', commits }],
      }],
    }))
    const parsed = JSON.parse(result)
    expect(parsed.versions[0].groups[0].commits[0].hash).toBe('abc')
  })
})

// ─── Command metadata ─────────────────────────────────────

describe('Changelogs command', () => {
  it('should have correct description', () => {
    expect(Changelogs.description).toContain('changelog')
  })

  it('should have path arg', () => {
    expect(Changelogs.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Changelogs.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Changelogs.flags.output).toBeDefined()
  })

  it('should have since flag', () => {
    expect(Changelogs.flags.since).toBeDefined()
  })

  it('should have until flag', () => {
    expect(Changelogs.flags.until).toBeDefined()
  })

  it('should have type flag', () => {
    expect(Changelogs.flags.type).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Changelogs.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Changelogs.examples.length).toBeGreaterThan(0)
  })
})
