import { describe, expect, it, vi } from 'vitest'

import Changelog from '../src/commands/changelog.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

import { execSync } from 'node:child_process'

import {
  categorizeCommits,
  getTags,
  parseConventionalCommit,
  type CommitInfo,
  type ChangelogGroup,
  type ChangelogResult,
} from '../src/commands/changelog-helpers.js'
import { formatChangelogJson, formatChangelogMarkdown, formatChangelogText } from '../src/commands/changelog-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeCommit(overrides: Partial<CommitInfo> = {}): CommitInfo {
  return {
    author: 'Alice',
    breaking: false,
    date: '2025-06-01',
    hash: 'abcdef1234567890abcdef1234567890abcdef12',
    shortHash: 'abcdef1',
    subject: 'add something',
    type: 'feat',
    ...overrides,
  }
}

const sampleCommits: CommitInfo[] = [
  makeCommit({ type: 'feat', subject: 'add login', scope: 'auth', shortHash: 'aaaa111', hash: '1111111111111111111111111111111111111111' }),
  makeCommit({ type: 'feat', subject: 'add dashboard', shortHash: 'aaaa222', hash: '2222222222222222222222222222222222222222' }),
  makeCommit({ type: 'fix', subject: 'fix crash on logout', shortHash: 'bbbb111', hash: '3333333333333333333333333333333333333333' }),
  makeCommit({ type: 'perf', subject: 'optimize query', shortHash: 'cccc111', hash: '4444444444444444444444444444444444444444' }),
  makeCommit({ type: 'refactor', subject: 'restructure utils', shortHash: 'dddd111', hash: '5555555555555555555555555555555555555555' }),
  makeCommit({ type: 'docs', subject: 'update readme', shortHash: 'eeee111', hash: '6666666666666666666666666666666666666666' }),
  makeCommit({ type: 'test', subject: 'add auth tests', shortHash: 'ffff111', hash: '7777777777777777777777777777777777777777' }),
  makeCommit({ type: 'chore', subject: 'update deps', shortHash: 'gggg111', hash: '8888888888888888888888888888888888888888' }),
  makeCommit({ type: 'other', subject: 'random change', shortHash: 'hhhh111', hash: '9999999999999999999999999999999999999999' }),
]

function makeChangelogResult(overrides: Partial<ChangelogResult> = {}): ChangelogResult {
  const groups = categorizeCommits(sampleCommits)
  return {
    generatedAt: '2025-06-19T12:00:00.000Z',
    groups,
    totalCommits: sampleCommits.length,
    to: 'HEAD',
    ...overrides,
  }
}

// ─── parseConventionalCommit ─────────────────────────────

describe('parseConventionalCommit', () => {
  it('parses feat commit', () => {
    const result = parseConventionalCommit('feat: add new feature')
    expect(result.type).toBe('feat')
    expect(result.subject).toBe('add new feature')
    expect(result.scope).toBeUndefined()
    expect(result.breaking).toBe(false)
  })

  it('parses fix commit', () => {
    const result = parseConventionalCommit('fix: resolve crash')
    expect(result.type).toBe('fix')
    expect(result.subject).toBe('resolve crash')
  })

  it('parses perf commit', () => {
    const result = parseConventionalCommit('perf: speed up render')
    expect(result.type).toBe('perf')
    expect(result.subject).toBe('speed up render')
  })

  it('parses refactor commit', () => {
    const result = parseConventionalCommit('refactor: simplify logic')
    expect(result.type).toBe('refactor')
  })

  it('parses docs commit', () => {
    const result = parseConventionalCommit('docs: update readme')
    expect(result.type).toBe('docs')
  })

  it('parses test commit', () => {
    const result = parseConventionalCommit('test: add unit tests')
    expect(result.type).toBe('test')
  })

  it('parses chore commit', () => {
    const result = parseConventionalCommit('chore: bump version')
    expect(result.type).toBe('chore')
  })

  it('parses commit with scope', () => {
    const result = parseConventionalCommit('feat(auth): add login')
    expect(result.type).toBe('feat')
    expect(result.scope).toBe('auth')
    expect(result.subject).toBe('add login')
  })

  it('parses commit without scope', () => {
    const result = parseConventionalCommit('fix: patch leak')
    expect(result.scope).toBeUndefined()
  })

  it('parses breaking change with bang', () => {
    const result = parseConventionalCommit('fix!: breaking API change')
    expect(result.breaking).toBe(true)
    expect(result.subject).toBe('breaking API change')
  })

  it('parses breaking change with scope and bang', () => {
    const result = parseConventionalCommit('feat(api)!: redesign endpoints')
    expect(result.type).toBe('feat')
    expect(result.scope).toBe('api')
    expect(result.breaking).toBe(true)
    expect(result.subject).toBe('redesign endpoints')
  })

  it('handles non-conventional messages', () => {
    const result = parseConventionalCommit('update something random')
    expect(result.type).toBe('other')
    expect(result.subject).toBe('update something random')
    expect(result.breaking).toBe(false)
  })

  it('handles empty string', () => {
    const result = parseConventionalCommit('')
    expect(result.type).toBe('other')
    expect(result.subject).toBe('')
  })

  it('handles "feat:" with empty subject', () => {
    const result = parseConventionalCommit('feat:')
    expect(result.type).toBe('feat')
    expect(result.subject).toBe('')
  })

  it('handles "fix!: " with space and empty subject', () => {
    const result = parseConventionalCommit('fix!: ')
    expect(result.type).toBe('fix')
    expect(result.breaking).toBe(true)
    expect(result.subject).toBe('')
  })

  it('handles subject containing colons', () => {
    const result = parseConventionalCommit('feat: support http://urls')
    expect(result.type).toBe('feat')
    expect(result.subject).toBe('support http://urls')
  })
})

// ─── categorizeCommits ──────────────────────────────────

describe('categorizeCommits', () => {
  it('groups commits by type', () => {
    const commits = [
      makeCommit({ type: 'feat', subject: 'a' }),
      makeCommit({ type: 'fix', subject: 'b' }),
      makeCommit({ type: 'feat', subject: 'c' }),
    ]
    const groups = categorizeCommits(commits)
    expect(groups).toHaveLength(2)
    const featGroup = groups.find((g) => g.type === 'feat')
    const fixGroup = groups.find((g) => g.type === 'fix')
    expect(featGroup!.commits).toHaveLength(2)
    expect(fixGroup!.commits).toHaveLength(1)
  })

  it('maintains type order: feat, fix, perf, refactor, docs, test, chore, other', () => {
    const groups = categorizeCommits(sampleCommits)
    const types = groups.map((g) => g.type)
    expect(types).toEqual(['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore', 'other'])
  })

  it('uses correct titles for each type', () => {
    const groups = categorizeCommits(sampleCommits)
    const titleMap: Record<string, string> = {}
    for (const g of groups) {
      titleMap[g.type] = g.title
    }
    expect(titleMap['feat']).toBe('Features')
    expect(titleMap['fix']).toBe('Bug Fixes')
    expect(titleMap['perf']).toBe('Performance')
    expect(titleMap['refactor']).toBe('Refactoring')
    expect(titleMap['docs']).toBe('Documentation')
    expect(titleMap['test']).toBe('Tests')
    expect(titleMap['chore']).toBe('Chores')
    expect(titleMap['other']).toBe('Other Changes')
  })

  it('handles empty commits array', () => {
    const groups = categorizeCommits([])
    expect(groups).toHaveLength(0)
  })

  it('handles all commits of same type', () => {
    const commits = [
      makeCommit({ type: 'fix', subject: 'a' }),
      makeCommit({ type: 'fix', subject: 'b' }),
      makeCommit({ type: 'fix', subject: 'c' }),
    ]
    const groups = categorizeCommits(commits)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.type).toBe('fix')
    expect(groups[0]!.commits).toHaveLength(3)
  })
})

// ─── getTags ────────────────────────────────────────────

describe('getTags', () => {
  it('parses tag output', () => {
    vi.mocked(execSync).mockReturnValue('v2.0.0\nv1.1.0\nv1.0.0\n')
    const tags = getTags('/fake/repo')
    expect(tags).toEqual(['v2.0.0', 'v1.1.0', 'v1.0.0'])
  })

  it('returns empty array on error', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repo')
    })
    const tags = getTags('/fake/repo')
    expect(tags).toEqual([])
  })

  it('returns empty array for empty output', () => {
    vi.mocked(execSync).mockReturnValue('')
    const tags = getTags('/fake/repo')
    expect(tags).toEqual([])
  })
})

// ─── formatChangelogMarkdown ────────────────────────────

describe('formatChangelogMarkdown', () => {
  it('produces markdown header', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('# Changelog')
  })

  it('includes generated date', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain(result.generatedAt)
  })

  it('includes total commit count', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain(`**Total commits: ${result.totalCommits}**`)
  })

  it('includes group headings', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('### Features')
    expect(output).toContain('### Bug Fixes')
  })

  it('shows from..to when provided', () => {
    const result = makeChangelogResult({ from: 'v1.0.0', to: 'v2.0.0' })
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('## v1.0.0..v2.0.0')
  })

  it('omits from..to when from is undefined', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).not.toContain('..HEAD')
  })

  it('formats scope in bold', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('**auth**: add login')
  })

  it('shows short hash by default', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('(aaaa111)')
  })

  it('shows full hash in verbose mode', () => {
    const result = makeChangelogResult()
    const output = formatChangelogMarkdown(result, true)
    expect(output).toContain('(1111111111111111111111111111111111111111)')
  })

  it('marks breaking changes', () => {
    const commits = [makeCommit({ type: 'fix', breaking: true, subject: 'big change', shortHash: 'abc1234' })]
    const result: ChangelogResult = {
      generatedAt: '2025-06-19T12:00:00.000Z',
      groups: categorizeCommits(commits),
      totalCommits: 1,
      to: 'HEAD',
    }
    const output = formatChangelogMarkdown(result, false)
    expect(output).toContain('⚠️ BREAKING')
  })
})

// ─── formatChangelogText ───────────────────────────────

describe('formatChangelogText', () => {
  it('produces text header', () => {
    const result = makeChangelogResult()
    const output = formatChangelogText(result, false)
    expect(output).toContain('Changelog')
  })

  it('includes total commit count', () => {
    const result = makeChangelogResult()
    const output = formatChangelogText(result, false)
    expect(output).toContain(`Total commits: ${result.totalCommits}`)
  })

  it('shows from..to when provided', () => {
    const result = makeChangelogResult({ from: 'v1.0.0', to: 'v2.0.0' })
    const output = formatChangelogText(result, false)
    expect(output).toContain('v1.0.0..v2.0.0')
  })

  it('shows short hash by default', () => {
    const result = makeChangelogResult()
    const output = formatChangelogText(result, false)
    expect(output).toContain('(aaaa111)')
  })

  it('shows full hash in verbose mode', () => {
    const result = makeChangelogResult()
    const output = formatChangelogText(result, true)
    expect(output).toContain('(1111111111111111111111111111111111111111)')
  })

  it('handles empty groups', () => {
    const result: ChangelogResult = {
      generatedAt: '2025-06-19T12:00:00.000Z',
      groups: [],
      totalCommits: 0,
      to: 'HEAD',
    }
    const output = formatChangelogText(result, false)
    expect(output).toContain('Changelog')
    expect(output).toContain('Total commits: 0')
  })
})

// ─── formatChangelogJson ───────────────────────────────

describe('formatChangelogJson', () => {
  it('produces valid JSON', () => {
    const result = makeChangelogResult()
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalCommits', () => {
    const result = makeChangelogResult()
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalCommits).toBe(result.totalCommits)
  })

  it('contains groups array', () => {
    const result = makeChangelogResult()
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.groups)).toBe(true)
  })

  it('contains generatedAt', () => {
    const result = makeChangelogResult()
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.generatedAt).toBe(result.generatedAt)
  })

  it('contains from and to when from is set', () => {
    const result = makeChangelogResult({ from: 'v1.0.0', to: 'v2.0.0' })
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.from).toBe('v1.0.0')
    expect(parsed.to).toBe('v2.0.0')
  })

  it('handles empty groups', () => {
    const result: ChangelogResult = {
      generatedAt: '2025-06-19T12:00:00.000Z',
      groups: [],
      totalCommits: 0,
      to: 'HEAD',
    }
    const output = formatChangelogJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.groups).toHaveLength(0)
    expect(parsed.totalCommits).toBe(0)
  })
})

// ─── Command metadata ──────────────────────────────────

describe('Changelog command - static metadata', () => {
  it('has a description', () => {
    expect(Changelog.description).toBe('Generate a changelog from git commit history')
  })

  it('has examples array', () => {
    expect(Array.isArray(Changelog.examples)).toBe(true)
    expect(Changelog.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('exports a default class', () => {
    expect(Changelog).toBeDefined()
    expect(typeof Changelog).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Changelog.prototype.run).toBe('function')
  })
})

// ─── Command flags ─────────────────────────────────────

describe('Changelog command - flags', () => {
  it('has format flag with options', () => {
    expect(Changelog.flags.format.options).toContain('markdown')
    expect(Changelog.flags.format.options).toContain('json')
    expect(Changelog.flags.format.options).toContain('text')
  })

  it('defaults format to markdown', () => {
    expect(Changelog.flags.format.default).toBe('markdown')
  })

  it('defaults count to 50', () => {
    expect(Changelog.flags.count.default).toBe(50)
  })

  it('defaults to to HEAD', () => {
    expect(Changelog.flags.to.default).toBe('HEAD')
  })

  it('defaults verbose to false', () => {
    expect(Changelog.flags.verbose.default).toBe(false)
  })

  it('has output flag', () => {
    expect(Changelog.flags.output).toBeDefined()
  })

  it('has from flag', () => {
    expect(Changelog.flags.from).toBeDefined()
  })
})
