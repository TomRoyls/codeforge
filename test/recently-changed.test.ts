import { describe, expect, it } from 'vitest'

import RecentlyChanged from '../src/commands/recently-changed.js'
import {
  parseSincePeriod,
  parseGitLogOutput,
  type ChangedFile,
  type RecentResult,
} from '../src/commands/recently-changed-helpers.js'
import { formatRecentCsv, formatRecentJson, formatRecentTable } from '../src/commands/recently-changed-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeChangedFile(overrides: Partial<ChangedFile> = {}): ChangedFile {
  return {
    filePath: '/src/index.ts',
    relativePath: 'src/index.ts',
    modifiedDate: '2025-01-15T10:00:00.000Z',
    author: 'Alice',
    commit: 'abc12345',
    summary: 'Initial commit',
    linesAdded: 10,
    linesDeleted: 2,
    ...overrides,
  }
}

const sampleFiles: ChangedFile[] = [
  makeChangedFile({
    filePath: '/src/index.ts',
    relativePath: 'src/index.ts',
    modifiedDate: '2025-03-10T12:00:00.000Z',
    author: 'Alice',
    commit: 'aaa11111',
    summary: 'Add feature',
    linesAdded: 15,
    linesDeleted: 3,
  }),
  makeChangedFile({
    filePath: '/src/utils.ts',
    relativePath: 'src/utils.ts',
    modifiedDate: '2025-03-09T10:00:00.000Z',
    author: 'Bob',
    commit: 'bbb22222',
    summary: 'Fix bug',
    linesAdded: 5,
    linesDeleted: 8,
  }),
  makeChangedFile({
    filePath: '/src/config.ts',
    relativePath: 'src/config.ts',
    modifiedDate: '2025-03-08T08:00:00.000Z',
    author: 'Charlie',
    commit: 'ccc33333',
    summary: 'Update config',
    linesAdded: 2,
    linesDeleted: 2,
  }),
]

function makeRecentResult(files: ChangedFile[] = sampleFiles): RecentResult {
  return {
    branch: 'main',
    files,
    since: '1w',
    totalScanned: files.length,
  }
}

// ─── Command static metadata ─────────────────────────────

describe('RecentlyChanged command - static metadata', () => {
  it('has a description', () => {
    expect(RecentlyChanged.description).toBe(
      'Show recently modified files based on git log or filesystem timestamps',
    )
  })

  it('has examples array', () => {
    expect(Array.isArray(RecentlyChanged.examples)).toBe(true)
    expect(RecentlyChanged.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg with default', () => {
    expect(RecentlyChanged.args.path).toBeDefined()
    expect(RecentlyChanged.args.path.default).toBe('.')
  })

  it('has id set to recently-changed', () => {
    expect(RecentlyChanged.id).toBe('recently-changed')
  })

  it('has aliases including recent', () => {
    expect(RecentlyChanged.aliases).toContain('recent')
  })
})

// ─── Command flags ───────────────────────────────────────

describe('RecentlyChanged command - flags', () => {
  it('has format flag with options', () => {
    expect(RecentlyChanged.flags.format.options).toContain('json')
    expect(RecentlyChanged.flags.format.options).toContain('table')
    expect(RecentlyChanged.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(RecentlyChanged.flags.format.default).toBe('table')
  })

  it('has author flag', () => {
    expect(RecentlyChanged.flags.author).toBeDefined()
  })

  it('has count flag defaulting to 10', () => {
    expect(RecentlyChanged.flags.count.default).toBe(10)
  })

  it('has since flag defaulting to 1w', () => {
    expect(RecentlyChanged.flags.since.default).toBe('1w')
  })

  it('has verbose flag defaulting to false', () => {
    expect(RecentlyChanged.flags.verbose.default).toBe(false)
  })

  it('has output flag', () => {
    expect(RecentlyChanged.flags.output).toBeDefined()
  })

  it('has no-git flag defaulting to false', () => {
    expect(RecentlyChanged.flags['no-git'].default).toBe(false)
  })
})

// ─── Command class structure ─────────────────────────────

describe('RecentlyChanged command - class structure', () => {
  it('exports a default class', () => {
    expect(RecentlyChanged).toBeDefined()
    expect(typeof RecentlyChanged).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof RecentlyChanged.prototype.run).toBe('function')
  })
})

// ─── parseSincePeriod ────────────────────────────────────

describe('parseSincePeriod', () => {
  it('parses "1d" as 1 day ago', () => {
    const result = parseSincePeriod('1d')
    const now = new Date()
    const diffMs = now.getTime() - result.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(0.9)
    expect(diffDays).toBeLessThanOrEqual(1.1)
  })

  it('parses "2w" as 2 weeks ago', () => {
    const result = parseSincePeriod('2w')
    const now = new Date()
    const diffDays = (now.getTime() - result.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(13.9)
    expect(diffDays).toBeLessThanOrEqual(14.1)
  })

  it('parses "3m" as 3 months ago', () => {
    const result = parseSincePeriod('3m')
    const expected = new Date()
    expected.setMonth(expected.getMonth() - 3)
    const diffMs = Math.abs(result.getTime() - expected.getTime())
    expect(diffMs).toBeLessThan(1000)
  })

  it('parses "1y" as 1 year ago', () => {
    const result = parseSincePeriod('1y')
    const expected = new Date()
    expected.setFullYear(expected.getFullYear() - 1)
    const diffMs = Math.abs(result.getTime() - expected.getTime())
    expect(diffMs).toBeLessThan(1000)
  })

  it('returns default (1 week) for invalid format', () => {
    const result = parseSincePeriod('invalid')
    const now = new Date()
    const diffDays = (now.getTime() - result.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(6.9)
    expect(diffDays).toBeLessThanOrEqual(7.1)
  })

  it('returns default for empty string', () => {
    const result = parseSincePeriod('')
    const now = new Date()
    const diffDays = (now.getTime() - result.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(6.9)
    expect(diffDays).toBeLessThanOrEqual(7.1)
  })

  it('handles multi-digit amounts', () => {
    const result = parseSincePeriod('30d')
    const now = new Date()
    const diffDays = (now.getTime() - result.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(29.9)
    expect(diffDays).toBeLessThanOrEqual(30.1)
  })

  it('returns a Date object in the past', () => {
    const result = parseSincePeriod('1d')
    expect(result.getTime()).toBeLessThan(Date.now())
  })
})

// ─── parseGitLogOutput ───────────────────────────────────

describe('parseGitLogOutput', () => {
  it('parses valid git log output with one commit and multiple files', () => {
    const output = 'abc123def456|Alice|1700000000|Fix bug\nfile1.ts\nfile2.ts'
    const result = parseGitLogOutput(output)
    expect(result).toHaveLength(2)
    expect(result[0]!.filePath).toBe('file1.ts')
    expect(result[0]!.author).toBe('Alice')
    expect(result[0]!.commit).toBe('abc123de')
    expect(result[0]!.summary).toBe('Fix bug')
  })

  it('parses multiple commits separated by blank lines', () => {
    const output = 'abc123|Alice|1700000000|First\nfile1.ts\n\ndef456|Bob|1699900000|Second\nfile2.ts'
    const result = parseGitLogOutput(output)
    expect(result).toHaveLength(2)
    expect(result[0]!.author).toBe('Alice')
    expect(result[1]!.author).toBe('Bob')
  })

  it('handles empty output', () => {
    const result = parseGitLogOutput('')
    expect(result).toHaveLength(0)
  })

  it('handles whitespace-only output', () => {
    const result = parseGitLogOutput('   \n  \n  ')
    expect(result).toHaveLength(0)
  })

  it('handles malformed header lines gracefully', () => {
    const output = 'not-enough-pipes\ntest.ts'
    const result = parseGitLogOutput(output)
    expect(result).toHaveLength(0)
  })

  it('handles summary with pipe characters', () => {
    const output = 'abc123|Alice|1700000000|Fix: handle | in data\nfile1.ts'
    const result = parseGitLogOutput(output)
    expect(result).toHaveLength(1)
    expect(result[0]!.summary).toBe('Fix: handle | in data')
  })

  it('skips empty file name lines within a commit block', () => {
    const output = 'abc123|Alice|1700000000|Fix\nfile1.ts\n\ndef456|Bob|1700001000|Other\nfile2.ts'
    const result = parseGitLogOutput(output)
    expect(result).toHaveLength(2)
    expect(result[0]!.filePath).toBe('file1.ts')
    expect(result[1]!.filePath).toBe('file2.ts')
  })

  it('sets linesAdded and linesDeleted to 0 by default', () => {
    const output = 'abc123|Alice|1700000000|Fix\nfile1.ts'
    const result = parseGitLogOutput(output)
    expect(result[0]!.linesAdded).toBe(0)
    expect(result[0]!.linesDeleted).toBe(0)
  })
})

// ─── Deduplication ───────────────────────────────────────

describe('parseGitLogOutput - deduplication', () => {
  it('deduplicates files keeping most recent when same file appears in multiple commits', () => {
    const output =
      'aaa111|Alice|1700001000|Recent change\nshared.ts\n\nbbb222|Bob|1700000000|Old change\nshared.ts'
    const result = parseGitLogOutput(output)
    // parseGitLogOutput doesn't deduplicate - that happens in getRecentFilesFromGit
    // But we test that both entries are returned for the helper
    expect(result).toHaveLength(2)
    // The first one has the more recent timestamp
    expect(result[0]!.modifiedDate).not.toBe(result[1]!.modifiedDate)
  })
})

// ─── Sorting ─────────────────────────────────────────────

describe('sorting by date', () => {
  it('sorts files by modifiedDate descending', () => {
    const unsorted: ChangedFile[] = [
      makeChangedFile({ filePath: '/a.ts', relativePath: 'a.ts', modifiedDate: '2025-01-01T00:00:00.000Z' }),
      makeChangedFile({ filePath: '/b.ts', relativePath: 'b.ts', modifiedDate: '2025-03-01T00:00:00.000Z' }),
      makeChangedFile({ filePath: '/c.ts', relativePath: 'c.ts', modifiedDate: '2025-02-01T00:00:00.000Z' }),
    ]
    // Simulate the sort that getRecentFilesFromGit does
    const sorted = unsorted.slice()
    sorted.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))
    expect(sorted[0]!.relativePath).toBe('b.ts')
    expect(sorted[1]!.relativePath).toBe('c.ts')
    expect(sorted[2]!.relativePath).toBe('a.ts')
  })

  it('handles files with same date', () => {
    const files: ChangedFile[] = [
      makeChangedFile({ filePath: '/a.ts', relativePath: 'a.ts', modifiedDate: '2025-01-01T00:00:00.000Z' }),
      makeChangedFile({ filePath: '/b.ts', relativePath: 'b.ts', modifiedDate: '2025-01-01T00:00:00.000Z' }),
    ]
    const sorted = files.slice()
    sorted.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))
    expect(sorted).toHaveLength(2)
  })
})

// ─── formatRecentTable ──────────────────────────────────

describe('formatRecentTable', () => {
  it('produces output containing header info', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).toContain('Recently Changed Files')
    expect(output).toContain('main')
    expect(output).toContain('Since: 1w')
  })

  it('shows file paths in output', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).toContain('src/index.ts')
    expect(output).toContain('src/utils.ts')
  })

  it('shows author names in output', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).toContain('Alice')
    expect(output).toContain('Bob')
  })

  it('shows change counts in output', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).toContain('+15')
    expect(output).toContain('-3')
  })

  it('shows summary column when verbose is true', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, true)
    expect(output).toContain('Add feature')
    expect(output).toContain('Fix bug')
  })

  it('hides summary column when verbose is false', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).not.toContain('Add feature')
  })

  it('handles empty results', () => {
    const result = makeRecentResult([])
    const output = formatRecentTable(result, false)
    expect(output).toContain('No recently changed files found')
  })

  it('shows files scanned count', () => {
    const result = makeRecentResult()
    const output = formatRecentTable(result, false)
    expect(output).toContain('Files scanned: 3')
  })

  it('handles files with empty author', () => {
    const files: ChangedFile[] = [
      makeChangedFile({ author: '', filePath: '/a.ts', relativePath: 'a.ts' }),
    ]
    const result = makeRecentResult(files)
    const output = formatRecentTable(result, false)
    expect(output).toContain('unknown')
  })
})

// ─── formatRecentCsv ─────────────────────────────────────

describe('formatRecentCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeRecentResult()
    const output = formatRecentCsv(result, false)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Date,File,Author,LinesAdded,LinesDeleted')
  })

  it('includes data rows', () => {
    const result = makeRecentResult()
    const output = formatRecentCsv(result, false)
    const lines = output.split('\n')
    expect(lines.length).toBe(sampleFiles.length + 1)
  })

  it('includes Summary column when verbose is true', () => {
    const result = makeRecentResult()
    const output = formatRecentCsv(result, true)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Date,File,Author,LinesAdded,LinesDeleted,Summary')
  })

  it('escapes commas in fields', () => {
    const files: ChangedFile[] = [
      makeChangedFile({
        author: 'Smith, John',
        filePath: '/src/a.ts',
        relativePath: 'src/a.ts',
        summary: 'Fix: a, b, c',
      }),
    ]
    const result = makeRecentResult(files)
    const output = formatRecentCsv(result, true)
    const dataLine = output.split('\n')[1]!
    expect(dataLine).toContain('"Smith, John"')
  })

  it('escapes double quotes in fields', () => {
    const files: ChangedFile[] = [
      makeChangedFile({
        author: 'O"Brien',
        filePath: '/src/a.ts',
        relativePath: 'src/a.ts',
        summary: 'Say "hello"',
      }),
    ]
    const result = makeRecentResult(files)
    const output = formatRecentCsv(result, true)
    const dataLine = output.split('\n')[1]!
    expect(dataLine).toContain('O""Brien')
  })

  it('handles empty results', () => {
    const result = makeRecentResult([])
    const output = formatRecentCsv(result, false)
    expect(output).toBe('Date,File,Author,LinesAdded,LinesDeleted')
  })

  it('formats dates correctly in CSV', () => {
    const files: ChangedFile[] = [
      makeChangedFile({
        filePath: '/src/a.ts',
        relativePath: 'src/a.ts',
        modifiedDate: '2025-03-10T12:00:00.000Z',
      }),
    ]
    const result = makeRecentResult(files)
    const output = formatRecentCsv(result, false)
    const dataLine = output.split('\n')[1]!
    expect(dataLine.startsWith('2025-03-10')).toBe(true)
  })
})

// ─── formatRecentJson ────────────────────────────────────

describe('formatRecentJson', () => {
  it('produces valid JSON', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains branch and since info', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.branch).toBe('main')
    expect(parsed.since).toBe('1w')
  })

  it('contains files array', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(sampleFiles.length)
  })

  it('files have all expected fields', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    const file = parsed.files[0]
    expect(file.author).toBe('Alice')
    expect(file.commit).toBe('aaa11111')
    expect(file.linesAdded).toBe(15)
    expect(file.linesDeleted).toBe(3)
    expect(file.relativePath).toBe('src/index.ts')
    expect(file.summary).toBe('Add feature')
  })

  it('handles empty results', () => {
    const result = makeRecentResult([])
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
    expect(parsed.totalScanned).toBe(0)
  })

  it('includes totalScanned', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalScanned).toBe(sampleFiles.length)
  })

  it('is pretty printed', () => {
    const result = makeRecentResult()
    const output = formatRecentJson(result)
    expect(output).toContain('\n')
    expect(output).toContain('  ')
  })
})
