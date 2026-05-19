import { describe, expect, it } from 'vitest'

import Contributors from '../src/commands/contributors.js'
import {
  buildContributors,
  buildContributorsResult,
  calculateBusFactor,
  parseGitLogByFile,
  parseGitLogDates,
  parseGitLogNumstat,
  parseGitLogShort,
  type Contributor,
} from '../src/commands/contributors-helpers.js'
import type { FileContributor } from '../src/commands/contributors-helpers.js'
import { formatCommitBar, formatContributorsCsv, formatContributorsJson, formatContributorsTable } from '../src/commands/contributors-format-helpers.js'
import type { ContributorsResult } from '../src/commands/contributors-helpers.js'

// ─── Test data factories ────────────────────────────────

function makeContributor(overrides: Partial<Contributor> = {}): Contributor {
  return {
    activeDays: 10,
    commits: 50,
    email: 'alice@example.com',
    filesTouched: 20,
    firstCommit: '2024-01-15T10:00:00+00:00',
    lastCommit: '2024-06-20T14:00:00+00:00',
    linesAdded: 1000,
    linesDeleted: 200,
    name: 'Alice Smith',
    ...overrides,
  }
}

function makeContributorsResult(overrides: Partial<ContributorsResult> = {}): ContributorsResult {
  const contributor = makeContributor()
  return {
    busFactor: 1,
    byFile: [],
    contributors: [contributor],
    dateRange: { first: '2024-01-15T10:00:00+00:00', last: '2024-06-20T14:00:00+00:00' },
    totalCommits: 50,
    totalLinesAdded: 1000,
    totalLinesDeleted: 200,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Contributors command - static metadata', () => {
  it('has a description', () => {
    expect(Contributors.description).toBe('Analyze git contributors and commit patterns')
  })

  it('has examples array', () => {
    expect(Array.isArray(Contributors.examples)).toBe(true)
    expect(Contributors.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Contributors.args.path).toBeDefined()
    expect(Contributors.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Contributors.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Contributors command - flags', () => {
  it('has format flag with options', () => {
    expect(Contributors.flags.format.options).toContain('json')
    expect(Contributors.flags.format.options).toContain('table')
    expect(Contributors.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Contributors.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Contributors.flags.output).toBeDefined()
  })

  it('has since flag', () => {
    expect(Contributors.flags.since).toBeDefined()
  })

  it('has until flag', () => {
    expect(Contributors.flags.until).toBeDefined()
  })

  it('has by-file flag defaulting to false', () => {
    expect(Contributors.flags['by-file'].default).toBe(false)
  })

  it('has top flag', () => {
    expect(Contributors.flags.top).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Contributors.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Contributors command - class structure', () => {
  it('exports a default class', () => {
    expect(Contributors).toBeDefined()
    expect(typeof Contributors).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Contributors.prototype.run).toBe('function')
  })
})

// ─── parseGitLogShort ───────────────────────────────────

describe('parseGitLogShort', () => {
  it('parses single contributor', () => {
    const result = parseGitLogShort('Alice Smith|alice@example.com')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Alice Smith')
    expect(result[0]!.email).toBe('alice@example.com')
    expect(result[0]!.commits).toBe(1)
  })

  it('parses multiple contributors', () => {
    const input = 'Alice|alice@example.com\nBob|bob@example.com'
    const result = parseGitLogShort(input)
    expect(result).toHaveLength(2)
  })

  it('merges same email with different names', () => {
    const input = 'Alice Smith|alice@example.com\nA. Smith|alice@example.com\nAlice|alice@example.com'
    const result = parseGitLogShort(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.commits).toBe(3)
  })

  it('handles empty input', () => {
    expect(parseGitLogShort('')).toHaveLength(0)
    expect(parseGitLogShort('   ')).toHaveLength(0)
  })

  it('counts commits correctly per contributor', () => {
    const input = 'Alice|alice@example.com\nBob|bob@example.com\nAlice|alice@example.com'
    const result = parseGitLogShort(input)
    const alice = result.find((c) => c.email === 'alice@example.com')
    const bob = result.find((c) => c.email === 'bob@example.com')
    expect(alice!.commits).toBe(2)
    expect(bob!.commits).toBe(1)
  })

  it('skips blank lines', () => {
    const input = 'Alice|alice@example.com\n\nBob|bob@example.com\n'
    const result = parseGitLogShort(input)
    expect(result).toHaveLength(2)
  })

  it('skips lines without pipe separator', () => {
    const input = 'Alice|alice@example.com\nno-pipe-here'
    const result = parseGitLogShort(input)
    expect(result).toHaveLength(1)
  })
})

// ─── parseGitLogNumstat ─────────────────────────────────

describe('parseGitLogNumstat', () => {
  it('parses basic numstat output', () => {
    const input = 'COMMIT:Alice|alice@example.com\n10\t5\tfile.ts'
    const result = parseGitLogNumstat(input)
    const entry = result.get('alice@example.com')
    expect(entry).toBeDefined()
    expect(entry!.linesAdded).toBe(10)
    expect(entry!.linesDeleted).toBe(5)
    expect(entry!.filesTouched).toBe(1)
  })

  it('handles binary files shown as dash', () => {
    const input = 'COMMIT:Alice|alice@example.com\n-\t-\timage.png'
    const result = parseGitLogNumstat(input)
    const entry = result.get('alice@example.com')
    expect(entry).toBeDefined()
    expect(entry!.linesAdded).toBe(0)
    expect(entry!.linesDeleted).toBe(0)
    expect(entry!.filesTouched).toBe(1)
  })

  it('handles multiple commits from same author', () => {
    const input = 'COMMIT:Alice|alice@example.com\n10\t5\tfile1.ts\nCOMMIT:Alice|alice@example.com\n3\t1\tfile2.ts'
    const result = parseGitLogNumstat(input)
    const entry = result.get('alice@example.com')
    expect(entry!.linesAdded).toBe(13)
    expect(entry!.linesDeleted).toBe(6)
    expect(entry!.filesTouched).toBe(2)
  })

  it('handles multiple contributors', () => {
    const input = 'COMMIT:Alice|alice@example.com\n10\t5\tfile.ts\nCOMMIT:Bob|bob@example.com\n3\t1\tfile.ts'
    const result = parseGitLogNumstat(input)
    expect(result.size).toBe(2)
  })

  it('handles empty input', () => {
    const result = parseGitLogNumstat('')
    expect(result.size).toBe(0)
  })

  it('handles empty lines in output', () => {
    const input = 'COMMIT:Alice|alice@example.com\n\n10\t5\tfile.ts\n'
    const result = parseGitLogNumstat(input)
    const entry = result.get('alice@example.com')
    expect(entry!.linesAdded).toBe(10)
  })
})

// ─── parseGitLogDates ───────────────────────────────────

describe('parseGitLogDates', () => {
  it('parses date entries', () => {
    const input = 'alice@example.com|2024-01-15T10:00:00+00:00'
    const result = parseGitLogDates(input)
    const entry = result.get('alice@example.com')
    expect(entry).toBeDefined()
    expect(entry!.firstCommit).toBe('2024-01-15T10:00:00+00:00')
    expect(entry!.lastCommit).toBe('2024-01-15T10:00:00+00:00')
  })

  it('calculates active days correctly', () => {
    const input = 'alice@example.com|2024-01-15T10:00:00+00:00\nalice@example.com|2024-01-16T14:00:00+00:00\nalice@example.com|2024-01-15T08:00:00+00:00'
    const result = parseGitLogDates(input)
    const entry = result.get('alice@example.com')
    expect(entry!.activeDays).toBe(2)
  })

  it('tracks first and last commit dates', () => {
    const input = 'alice@example.com|2024-06-20T14:00:00+00:00\nalice@example.com|2024-01-15T10:00:00+00:00'
    const result = parseGitLogDates(input)
    const entry = result.get('alice@example.com')
    expect(entry!.firstCommit).toBe('2024-01-15T10:00:00+00:00')
    expect(entry!.lastCommit).toBe('2024-06-20T14:00:00+00:00')
  })

  it('handles empty input', () => {
    expect(parseGitLogDates('').size).toBe(0)
    expect(parseGitLogDates('   ').size).toBe(0)
  })

  it('handles multiple contributors', () => {
    const input = 'alice@example.com|2024-01-15T10:00:00+00:00\nbob@example.com|2024-02-20T14:00:00+00:00'
    const result = parseGitLogDates(input)
    expect(result.size).toBe(2)
  })
})

// ─── buildContributors ──────────────────────────────────

describe('buildContributors', () => {
  it('merges data correctly', () => {
    const shortLog = [{ commits: 5, email: 'alice@example.com', name: 'Alice' }]
    const numstat = new Map([
      ['alice@example.com', { email: 'alice@example.com', filesTouched: 3, linesAdded: 100, linesDeleted: 20 }],
    ])
    const dates = new Map([
      ['alice@example.com', { activeDays: 5, firstCommit: '2024-01-01T00:00:00+00:00', lastCommit: '2024-06-01T00:00:00+00:00' }],
    ])

    const result = buildContributors(shortLog, numstat, dates)
    expect(result).toHaveLength(1)
    expect(result[0]!.commits).toBe(5)
    expect(result[0]!.linesAdded).toBe(100)
    expect(result[0]!.linesDeleted).toBe(20)
    expect(result[0]!.filesTouched).toBe(3)
    expect(result[0]!.activeDays).toBe(5)
  })

  it('sorts by commits descending', () => {
    const shortLog = [
      { commits: 3, email: 'alice@example.com', name: 'Alice' },
      { commits: 10, email: 'bob@example.com', name: 'Bob' },
    ]
    const result = buildContributors(shortLog, new Map(), new Map())
    expect(result[0]!.name).toBe('Bob')
    expect(result[1]!.name).toBe('Alice')
  })

  it('handles missing numstat and date data', () => {
    const shortLog = [{ commits: 5, email: 'alice@example.com', name: 'Alice' }]
    const result = buildContributors(shortLog, new Map(), new Map())
    expect(result[0]!.linesAdded).toBe(0)
    expect(result[0]!.linesDeleted).toBe(0)
    expect(result[0]!.filesTouched).toBe(0)
    expect(result[0]!.activeDays).toBe(0)
    expect(result[0]!.firstCommit).toBe('')
    expect(result[0]!.lastCommit).toBe('')
  })

  it('handles empty input', () => {
    const result = buildContributors([], new Map(), new Map())
    expect(result).toHaveLength(0)
  })
})

// ─── calculateBusFactor ─────────────────────────────────

describe('calculateBusFactor', () => {
  it('returns 0 for empty contributors', () => {
    expect(calculateBusFactor([])).toBe(0)
  })

  it('returns 1 for single contributor', () => {
    expect(calculateBusFactor([{ commits: 100 }])).toBe(1)
  })

  it('returns 1 when one contributor has majority', () => {
    expect(calculateBusFactor([{ commits: 80 }, { commits: 15 }, { commits: 5 }])).toBe(1)
  })

  it('returns 2 for equal contributors with 4 total', () => {
    expect(
      calculateBusFactor([
        { commits: 25 },
        { commits: 25 },
        { commits: 25 },
        { commits: 25 },
      ]),
    ).toBe(2)
  })

  it('handles many contributors', () => {
    const contributors = Array.from({ length: 10 }, () => ({ commits: 10 }))
    expect(calculateBusFactor(contributors)).toBe(5)
  })

  it('returns 0 when total commits is zero', () => {
    expect(calculateBusFactor([{ commits: 0 }, { commits: 0 }])).toBe(0)
  })

  it('returns correct factor for two dominant contributors', () => {
    expect(calculateBusFactor([{ commits: 40 }, { commits: 40 }, { commits: 10 }, { commits: 10 }])).toBe(2)
  })
})

// ─── parseGitLogByFile ──────────────────────────────────

describe('parseGitLogByFile', () => {
  it('parses file contributors', () => {
    const input = 'COMMIT:Alice\nfile1.ts\nfile2.ts\nCOMMIT:Bob\nfile1.ts'
    const result = parseGitLogByFile(input)
    expect(result.length).toBeGreaterThanOrEqual(2)

    const file1 = result.find((f) => f.filePath === 'file1.ts')
    expect(file1).toBeDefined()
    expect(file1!.contributors).toHaveLength(2)
  })

  it('counts commits per file per contributor', () => {
    const input = 'COMMIT:Alice\nfile1.ts\nCOMMIT:Alice\nfile1.ts'
    const result = parseGitLogByFile(input)
    const file1 = result.find((f) => f.filePath === 'file1.ts')
    expect(file1!.contributors[0]!.commits).toBe(2)
  })

  it('handles empty input', () => {
    expect(parseGitLogByFile('')).toHaveLength(0)
    expect(parseGitLogByFile('   ')).toHaveLength(0)
  })

  it('sorts files by contributor count desc', () => {
    const input = 'COMMIT:Alice\nfile1.ts\nCOMMIT:Bob\nfile1.ts\nCOMMIT:Charlie\nfile1.ts\nCOMMIT:Alice\nfile2.ts'
    const result = parseGitLogByFile(input)
    expect(result[0]!.filePath).toBe('file1.ts')
  })
})

// ─── buildContributorsResult ────────────────────────────

describe('buildContributorsResult', () => {
  it('computes totals correctly', () => {
    const contributors = [
      makeContributor({ commits: 30, linesAdded: 500, linesDeleted: 100 }),
      makeContributor({ commits: 20, linesAdded: 300, linesDeleted: 50, email: 'bob@example.com', name: 'Bob' }),
    ]
    const result = buildContributorsResult(contributors, [])
    expect(result.totalCommits).toBe(50)
    expect(result.totalLinesAdded).toBe(800)
    expect(result.totalLinesDeleted).toBe(150)
  })

  it('computes date range', () => {
    const contributors = [
      makeContributor({ firstCommit: '2024-06-01T00:00:00+00:00', lastCommit: '2024-08-01T00:00:00+00:00' }),
      makeContributor({ firstCommit: '2024-01-01T00:00:00+00:00', lastCommit: '2024-12-01T00:00:00+00:00', email: 'bob@example.com' }),
    ]
    const result = buildContributorsResult(contributors, [])
    expect(result.dateRange.first).toBe('2024-01-01T00:00:00+00:00')
    expect(result.dateRange.last).toBe('2024-12-01T00:00:00+00:00')
  })

  it('computes bus factor', () => {
    const contributors = [
      makeContributor({ commits: 80 }),
      makeContributor({ commits: 15, email: 'bob@example.com' }),
    ]
    const result = buildContributorsResult(contributors, [])
    expect(result.busFactor).toBe(1)
  })

  it('includes by-file data', () => {
    const byFile: FileContributor[] = [
      { filePath: 'file.ts', contributors: [{ commits: 5, linesChanged: 100, name: 'Alice' }] },
    ]
    const result = buildContributorsResult([makeContributor()], byFile)
    expect(result.byFile).toHaveLength(1)
    expect(result.byFile[0]!.filePath).toBe('file.ts')
  })

  it('handles empty contributors', () => {
    const result = buildContributorsResult([], [])
    expect(result.totalCommits).toBe(0)
    expect(result.busFactor).toBe(0)
    expect(result.dateRange.first).toBe('')
    expect(result.dateRange.last).toBe('')
  })
})

// ─── formatCommitBar ────────────────────────────────────

describe('formatCommitBar', () => {
  it('renders full bar for max commits', () => {
    const bar = formatCommitBar(100, 100, 20)
    expect(bar).toBe('█'.repeat(20))
  })

  it('renders empty bar for zero commits', () => {
    const bar = formatCommitBar(0, 100, 20)
    expect(bar).toBe('░'.repeat(20))
  })

  it('renders proportional bar', () => {
    const bar = formatCommitBar(50, 100, 20)
    expect(bar).toBe('█'.repeat(10) + '░'.repeat(10))
  })

  it('renders empty bar when maxCommits is zero', () => {
    const bar = formatCommitBar(0, 0, 20)
    expect(bar).toBe('░'.repeat(20))
  })

  it('uses default width of 20', () => {
    const bar = formatCommitBar(50, 100)
    expect(bar.length).toBe(20)
  })

  it('respects custom width', () => {
    const bar = formatCommitBar(50, 100, 10)
    expect(bar.length).toBe(10)
  })
})

// ─── formatContributorsTable ────────────────────────────

describe('formatContributorsTable', () => {
  it('contains header row with column names', () => {
    const result = makeContributorsResult()
    const output = formatContributorsTable(result, false, false)
    expect(output).toContain('Contributor')
    expect(output).toContain('Commits')
    expect(output).toContain('Lines +')
    expect(output).toContain('Lines -')
    expect(output).toContain('Files')
    expect(output).toContain('Days')
  })

  it('contains contributor data', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ name: 'Alice Smith', commits: 50 })],
    })
    const output = formatContributorsTable(result, false, false)
    expect(output).toContain('Alice Smith')
    expect(output).toContain('50')
  })

  it('contains bus factor', () => {
    const result = makeContributorsResult()
    const output = formatContributorsTable(result, false, false)
    expect(output).toContain('Bus factor')
  })

  it('contains total commits', () => {
    const result = makeContributorsResult({ totalCommits: 42 })
    const output = formatContributorsTable(result, false, false)
    expect(output).toContain('Total commits')
    expect(output).toContain('42')
  })

  it('shows active dates in verbose mode', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ firstCommit: '2024-01-15T10:00:00+00:00', lastCommit: '2024-06-20T14:00:00+00:00' })],
    })
    const output = formatContributorsTable(result, true, false)
    expect(output).toContain('2024-01-15')
    expect(output).toContain('2024-06-20')
  })

  it('hides active dates in non-verbose mode', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ firstCommit: '2024-01-15T10:00:00+00:00', lastCommit: '2024-06-20T14:00:00+00:00' })],
    })
    const output = formatContributorsTable(result, false, false)
    expect(output).not.toContain('first:')
  })

  it('shows by-file breakdown when enabled', () => {
    const result = makeContributorsResult({
      byFile: [{ filePath: 'src/index.ts', contributors: [{ commits: 5, linesChanged: 100, name: 'Alice' }] }],
    })
    const output = formatContributorsTable(result, false, true)
    expect(output).toContain('src/index.ts')
    expect(output).toContain('Per-File Contributors')
  })

  it('hides by-file breakdown when disabled', () => {
    const result = makeContributorsResult({
      byFile: [{ filePath: 'src/index.ts', contributors: [{ commits: 5, linesChanged: 100, name: 'Alice' }] }],
    })
    const output = formatContributorsTable(result, false, false)
    expect(output).not.toContain('Per-File Contributors')
  })

  it('handles empty contributors', () => {
    const result = makeContributorsResult({ contributors: [], totalCommits: 0, totalLinesAdded: 0, totalLinesDeleted: 0, busFactor: 0, dateRange: { first: '', last: '' } })
    const output = formatContributorsTable(result, false, false)
    expect(output).toContain('No contributors found')
  })
})

// ─── formatContributorsCsv ──────────────────────────────

describe('formatContributorsCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeContributorsResult({ contributors: [] })
    const output = formatContributorsCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Name,Email,Commits,Lines Added,Lines Deleted,Files Touched,Active Days,First Commit,Last Commit')
  })

  it('includes contributor data rows', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ name: 'Alice', email: 'alice@example.com' })],
    })
    const output = formatContributorsCsv(result)
    expect(output).toContain('Alice')
    expect(output).toContain('alice@example.com')
  })

  it('escapes commas in names', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ name: 'Smith, Alice' })],
    })
    const output = formatContributorsCsv(result)
    expect(output).toContain('"Smith, Alice"')
  })

  it('handles empty contributors', () => {
    const result = makeContributorsResult({ contributors: [] })
    const output = formatContributorsCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(1)
  })
})

// ─── formatContributorsJson ─────────────────────────────

describe('formatContributorsJson', () => {
  it('produces valid JSON', () => {
    const result = makeContributorsResult()
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains contributors array', () => {
    const result = makeContributorsResult()
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.contributors).toBeDefined()
    expect(Array.isArray(parsed.contributors)).toBe(true)
  })

  it('contains totals', () => {
    const result = makeContributorsResult({ totalCommits: 50, totalLinesAdded: 1000, totalLinesDeleted: 200 })
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalCommits).toBe(50)
    expect(parsed.totalLinesAdded).toBe(1000)
    expect(parsed.totalLinesDeleted).toBe(200)
  })

  it('contains bus factor', () => {
    const result = makeContributorsResult({ busFactor: 2 })
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.busFactor).toBe(2)
  })

  it('contains date range', () => {
    const result = makeContributorsResult()
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dateRange).toBeDefined()
    expect(parsed.dateRange.first).toBeDefined()
    expect(parsed.dateRange.last).toBeDefined()
  })

  it('handles empty results', () => {
    const result = makeContributorsResult({ contributors: [], totalCommits: 0, totalLinesAdded: 0, totalLinesDeleted: 0, busFactor: 0, dateRange: { first: '', last: '' } })
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.contributors).toHaveLength(0)
  })

  it('preserves contributor data accurately', () => {
    const result = makeContributorsResult({
      contributors: [makeContributor({ name: 'Bob', commits: 42, linesAdded: 500, email: 'bob@test.com' })],
    })
    const output = formatContributorsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.contributors[0].name).toBe('Bob')
    expect(parsed.contributors[0].commits).toBe(42)
    expect(parsed.contributors[0].linesAdded).toBe(500)
  })
})
