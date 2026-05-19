import { describe, expect, it } from 'vitest'

import Ages from '../src/commands/ages.js'
import {
  buildFileAges,
  categorizeAge,
  computeAgeInDays,
  computeAgeStats,
  parseGitLogDates,
  parseGitLogNumstat,
  type FileAge,
  type AgeStats,
} from '../src/commands/ages-helpers.js'
import { formatAge, formatAgesCsv, formatAgesJson, formatAgesTable, getAgeColor } from '../src/commands/ages-format-helpers.js'
import type { AgesResult } from '../src/commands/ages-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileAge(overrides: Partial<FileAge> = {}): FileAge {
  return {
    ageCategory: 'stable',
    ageInDays: 60,
    authors: ['alice'],
    filePath: 'src/index.ts',
    lastModified: '2024-06-01T10:00:00.000Z',
    linesAdded: 100,
    linesDeleted: 20,
    relativePath: 'src/index.ts',
    totalChanges: 5,
    ...overrides,
  }
}

function makeAgesResult(overrides: Partial<AgesResult> = {}): AgesResult {
  const file = makeFileAge()
  return {
    files: [file],
    highChurnFiles: [],
    staleFiles: [],
    stats: {
      ancientCount: 0,
      averageAge: 60,
      freshCount: 0,
      medianAge: 60,
      newestFile: file,
      oldestFile: file,
      recentCount: 0,
      stableCount: 1,
      staleCount: 0,
      totalFiles: 1,
    },
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Ages command - static metadata', () => {
  it('has a description', () => {
    expect(Ages.description).toBe('Analyze file ages and staleness using git history')
  })

  it('has examples array', () => {
    expect(Array.isArray(Ages.examples)).toBe(true)
    expect(Ages.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Ages.args.path).toBeDefined()
    expect(Ages.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Ages.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Ages command - flags', () => {
  it('has format flag with options', () => {
    expect(Ages.flags.format.options).toContain('json')
    expect(Ages.flags.format.options).toContain('table')
    expect(Ages.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Ages.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Ages.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Ages.flags.ignore).toBeDefined()
    expect(Ages.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with default', () => {
    expect(Ages.flags.ext).toBeDefined()
    expect(Ages.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has stale-days flag defaulting to 180', () => {
    expect(Ages.flags['stale-days'].default).toBe(180)
  })

  it('has top flag defaulting to 20', () => {
    expect(Ages.flags['top'].default).toBe(20)
  })

  it('has sort flag defaulting to oldest', () => {
    expect(Ages.flags['sort'].default).toBe('oldest')
  })

  it('has sort options', () => {
    expect(Ages.flags['sort'].options).toContain('oldest')
    expect(Ages.flags['sort'].options).toContain('newest')
    expect(Ages.flags['sort'].options).toContain('changes')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Ages.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Ages command - class structure', () => {
  it('exports a default class', () => {
    expect(Ages).toBeDefined()
    expect(typeof Ages).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Ages.prototype.run).toBe('function')
  })
})

// ─── computeAgeInDays ────────────────────────────────────

describe('computeAgeInDays', () => {
  it('computes days for recent date', () => {
    const now = new Date('2024-06-15T10:00:00.000Z')
    const date = new Date('2024-06-10T10:00:00.000Z')
    expect(computeAgeInDays(date, now)).toBe(5)
  })

  it('computes days for old date', () => {
    const now = new Date('2024-06-15T10:00:00.000Z')
    const date = new Date('2023-06-15T10:00:00.000Z')
    expect(computeAgeInDays(date, now)).toBe(366)
  })

  it('returns 0 for same day', () => {
    const now = new Date('2024-06-15T10:00:00.000Z')
    const date = new Date('2024-06-15T08:00:00.000Z')
    expect(computeAgeInDays(date, now)).toBe(0)
  })

  it('floors fractional days', () => {
    const now = new Date('2024-06-15T12:00:00.000Z')
    const date = new Date('2024-06-14T00:00:00.000Z')
    const result = computeAgeInDays(date, now)
    expect(result).toBe(1)
  })
})

// ─── categorizeAge ───────────────────────────────────────

describe('categorizeAge', () => {
  it('returns fresh for < 7 days', () => {
    expect(categorizeAge(0)).toBe('fresh')
    expect(categorizeAge(3)).toBe('fresh')
    expect(categorizeAge(6)).toBe('fresh')
  })

  it('returns recent for 7-30 days', () => {
    expect(categorizeAge(7)).toBe('recent')
    expect(categorizeAge(15)).toBe('recent')
    expect(categorizeAge(30)).toBe('recent')
  })

  it('returns stable for 31-90 days', () => {
    expect(categorizeAge(31)).toBe('stable')
    expect(categorizeAge(60)).toBe('stable')
    expect(categorizeAge(90)).toBe('stable')
  })

  it('returns stale for 91-365 days', () => {
    expect(categorizeAge(91)).toBe('stale')
    expect(categorizeAge(180)).toBe('stale')
    expect(categorizeAge(365)).toBe('stale')
  })

  it('returns ancient for > 365 days', () => {
    expect(categorizeAge(366)).toBe('ancient')
    expect(categorizeAge(1000)).toBe('ancient')
  })

  it('handles boundary value 7', () => {
    expect(categorizeAge(7)).toBe('recent')
  })

  it('handles boundary value 8', () => {
    expect(categorizeAge(8)).toBe('recent')
  })

  it('handles boundary value 30', () => {
    expect(categorizeAge(30)).toBe('recent')
  })

  it('handles boundary value 31', () => {
    expect(categorizeAge(31)).toBe('stable')
  })

  it('handles boundary value 90', () => {
    expect(categorizeAge(90)).toBe('stable')
  })

  it('handles boundary value 91', () => {
    expect(categorizeAge(91)).toBe('stale')
  })

  it('handles boundary value 365', () => {
    expect(categorizeAge(365)).toBe('stale')
  })

  it('handles boundary value 366', () => {
    expect(categorizeAge(366)).toBe('ancient')
  })
})

// ─── parseGitLogDates ────────────────────────────────────

describe('parseGitLogDates', () => {
  it('parses single file, single commit', () => {
    const output = '2024-01-15T10:00:00+00:00\nsrc/index.ts\n'
    const map = parseGitLogDates(output)
    expect(map.size).toBe(1)
    const entry = map.get('src/index.ts')
    expect(entry).toBeDefined()
    expect(entry!.totalChanges).toBe(1)
  })

  it('parses multiple files', () => {
    const output = '2024-01-15T10:00:00+00:00\nsrc/index.ts\nsrc/utils.ts\n'
    const map = parseGitLogDates(output)
    expect(map.size).toBe(2)
    expect(map.has('src/index.ts')).toBe(true)
    expect(map.has('src/utils.ts')).toBe(true)
  })

  it('picks latest date from multiple commits', () => {
    const output =
      '2024-01-15T10:00:00+00:00\nsrc/index.ts\n\n2024-06-15T10:00:00+00:00\nsrc/index.ts\n'
    const map = parseGitLogDates(output)
    const entry = map.get('src/index.ts')
    expect(entry).toBeDefined()
    expect(entry!.totalChanges).toBe(2)
    expect(entry!.lastModified.toISOString()).toContain('2024-06-15')
  })

  it('collects authors', () => {
    const output = '2024-01-15T10:00:00+00:00\n@alice\nsrc/index.ts\n'
    const map = parseGitLogDates(output)
    const entry = map.get('src/index.ts')
    expect(entry).toBeDefined()
    expect(entry!.authors).toContain('alice')
  })

  it('handles empty input', () => {
    const map = parseGitLogDates('')
    expect(map.size).toBe(0)
  })

  it('handles whitespace-only input', () => {
    const map = parseGitLogDates('   \n  \n')
    expect(map.size).toBe(0)
  })
})

// ─── parseGitLogNumstat ─────────────────────────────────

describe('parseGitLogNumstat', () => {
  it('parses single file', () => {
    const output = '10\t5\tsrc/index.ts\n'
    const map = parseGitLogNumstat(output)
    expect(map.size).toBe(1)
    const entry = map.get('src/index.ts')
    expect(entry).toBeDefined()
    expect(entry!.linesAdded).toBe(10)
    expect(entry!.linesDeleted).toBe(5)
  })

  it('parses multiple files', () => {
    const output = '10\t5\tsrc/index.ts\n20\t3\tsrc/utils.ts\n'
    const map = parseGitLogNumstat(output)
    expect(map.size).toBe(2)
  })

  it('handles binary files with dashes', () => {
    const output = '-\t-\tsrc/image.png\n'
    const map = parseGitLogNumstat(output)
    expect(map.size).toBe(1)
    const entry = map.get('src/image.png')
    expect(entry).toBeDefined()
    expect(entry!.linesAdded).toBe(0)
    expect(entry!.linesDeleted).toBe(0)
  })

  it('handles empty input', () => {
    const map = parseGitLogNumstat('')
    expect(map.size).toBe(0)
  })

  it('accumulates stats for same file across commits', () => {
    const output = '10\t5\tsrc/index.ts\n20\t3\tsrc/index.ts\n'
    const map = parseGitLogNumstat(output)
    const entry = map.get('src/index.ts')
    expect(entry).toBeDefined()
    expect(entry!.linesAdded).toBe(30)
    expect(entry!.linesDeleted).toBe(8)
  })

  it('skips lines with fewer than 3 tab-separated parts', () => {
    const output = 'invalid-line\n10\t5\tsrc/index.ts\n'
    const map = parseGitLogNumstat(output)
    expect(map.size).toBe(1)
  })
})

// ─── buildFileAges ───────────────────────────────────────

describe('buildFileAges', () => {
  it('merges date and numstat data correctly', () => {
    const dateMap = parseGitLogDates('2024-01-15T10:00:00+00:00\nsrc/index.ts\n')
    const numstatMap = parseGitLogNumstat('10\t5\tsrc/index.ts\n')
    const files = buildFileAges(dateMap, numstatMap, 180, '/repo')
    expect(files).toHaveLength(1)
    expect(files[0]!.filePath).toBe('src/index.ts')
    expect(files[0]!.linesAdded).toBe(10)
    expect(files[0]!.linesDeleted).toBe(5)
    expect(files[0]!.totalChanges).toBe(1)
  })

  it('categorizes stale files correctly', () => {
    const now = new Date()
    const oldDate = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000)
    const dateMap = parseGitLogDates(`${oldDate.toISOString()}\nsrc/old.ts\n`)
    const numstatMap = new Map()
    const files = buildFileAges(dateMap, numstatMap, 180, '/repo')
    expect(files[0]!.ageCategory).toBe('ancient')
  })

  it('defaults numstat to zero when not found', () => {
    const dateMap = parseGitLogDates('2024-01-15T10:00:00+00:00\nsrc/index.ts\n')
    const numstatMap = new Map()
    const files = buildFileAges(dateMap, numstatMap, 180, '/repo')
    expect(files[0]!.linesAdded).toBe(0)
    expect(files[0]!.linesDeleted).toBe(0)
  })

  it('computes relative path', () => {
    const dateMap = parseGitLogDates('2024-01-15T10:00:00+00:00\nsrc/index.ts\n')
    const numstatMap = new Map()
    const files = buildFileAges(dateMap, numstatMap, 180, '.')
    expect(files[0]!.relativePath).toBeDefined()
  })
})

// ─── computeAgeStats ────────────────────────────────────

describe('computeAgeStats', () => {
  it('computes correct averages', () => {
    const files = [
      makeFileAge({ ageInDays: 10, ageCategory: 'recent' }),
      makeFileAge({ ageInDays: 50, ageCategory: 'stable', filePath: 'src/b.ts' }),
      makeFileAge({ ageInDays: 90, ageCategory: 'stable', filePath: 'src/c.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.totalFiles).toBe(3)
    expect(stats.averageAge).toBeCloseTo(50, 0)
  })

  it('computes median for odd count', () => {
    const files = [
      makeFileAge({ ageInDays: 10, ageCategory: 'recent' }),
      makeFileAge({ ageInDays: 50, ageCategory: 'stable', filePath: 'src/b.ts' }),
      makeFileAge({ ageInDays: 90, ageCategory: 'stable', filePath: 'src/c.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.medianAge).toBe(50)
  })

  it('computes median for even count', () => {
    const files = [
      makeFileAge({ ageInDays: 10, ageCategory: 'recent' }),
      makeFileAge({ ageInDays: 30, ageCategory: 'recent', filePath: 'src/b.ts' }),
      makeFileAge({ ageInDays: 50, ageCategory: 'stable', filePath: 'src/c.ts' }),
      makeFileAge({ ageInDays: 70, ageCategory: 'stable', filePath: 'src/d.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.medianAge).toBe(40)
  })

  it('finds oldest file', () => {
    const files = [
      makeFileAge({ ageInDays: 10, ageCategory: 'recent' }),
      makeFileAge({ ageInDays: 200, ageCategory: 'stale', filePath: 'src/old.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.oldestFile).toBeDefined()
    expect(stats.oldestFile!.filePath).toBe('src/old.ts')
  })

  it('finds newest file', () => {
    const files = [
      makeFileAge({ ageInDays: 3, ageCategory: 'fresh', filePath: 'src/new.ts' }),
      makeFileAge({ ageInDays: 200, ageCategory: 'stale', filePath: 'src/old.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.newestFile).toBeDefined()
    expect(stats.newestFile!.filePath).toBe('src/new.ts')
  })

  it('counts categories correctly', () => {
    const files = [
      makeFileAge({ ageInDays: 3, ageCategory: 'fresh' }),
      makeFileAge({ ageInDays: 15, ageCategory: 'recent', filePath: 'src/b.ts' }),
      makeFileAge({ ageInDays: 60, ageCategory: 'stable', filePath: 'src/c.ts' }),
      makeFileAge({ ageInDays: 200, ageCategory: 'stale', filePath: 'src/d.ts' }),
      makeFileAge({ ageInDays: 400, ageCategory: 'ancient', filePath: 'src/e.ts' }),
    ]
    const stats = computeAgeStats(files)
    expect(stats.freshCount).toBe(1)
    expect(stats.recentCount).toBe(1)
    expect(stats.stableCount).toBe(1)
    expect(stats.staleCount).toBe(1)
    expect(stats.ancientCount).toBe(1)
  })

  it('handles empty files', () => {
    const stats = computeAgeStats([])
    expect(stats.totalFiles).toBe(0)
    expect(stats.averageAge).toBe(0)
    expect(stats.medianAge).toBe(0)
    expect(stats.oldestFile).toBeNull()
    expect(stats.newestFile).toBeNull()
  })
})

// ─── formatAge ───────────────────────────────────────────

describe('formatAge', () => {
  it('formats days', () => {
    expect(formatAge(0)).toBe('0 days')
    expect(formatAge(1)).toBe('1 day')
    expect(formatAge(3)).toBe('3 days')
    expect(formatAge(6)).toBe('6 days')
  })

  it('formats weeks', () => {
    expect(formatAge(7)).toBe('1 week')
    expect(formatAge(14)).toBe('2 weeks')
    expect(formatAge(27)).toBe('3 weeks')
  })

  it('formats months', () => {
    expect(formatAge(30)).toBe('1 month')
    expect(formatAge(60)).toBe('2 months')
    expect(formatAge(90)).toBe('3 months')
    expect(formatAge(180)).toBe('6 months')
  })

  it('formats years', () => {
    expect(formatAge(365)).toBe('1 year')
    expect(formatAge(730)).toBe('2 years')
    expect(formatAge(1000)).toBe('2 years')
  })
})

// ─── getAgeColor ─────────────────────────────────────────

describe('getAgeColor', () => {
  it('returns a function for fresh', () => {
    const fn = getAgeColor('fresh')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  it('returns a function for ancient', () => {
    const fn = getAgeColor('ancient')
    expect(typeof fn).toBe('function')
  })

  it('returns a function for unknown category', () => {
    const fn = getAgeColor('unknown')
    expect(typeof fn).toBe('function')
  })
})

// ─── formatAgesTable ────────────────────────────────────

describe('formatAgesTable', () => {
  it('contains header with column names', () => {
    const result = makeAgesResult()
    const output = formatAgesTable(result, false)
    expect(output).toContain('File')
    expect(output).toContain('Age')
    expect(output).toContain('Category')
    expect(output).toContain('Changes')
    expect(output).toContain('Last Modified')
  })

  it('contains summary stats', () => {
    const result = makeAgesResult()
    const output = formatAgesTable(result, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Total files')
    expect(output).toContain('Average age')
    expect(output).toContain('Median age')
  })

  it('contains category distribution', () => {
    const result = makeAgesResult()
    const output = formatAgesTable(result, false)
    expect(output).toContain('Category Distribution')
    expect(output).toContain('Fresh')
    expect(output).toContain('Ancient')
  })

  it('shows stale files warning when present', () => {
    const staleFile = makeFileAge({ ageCategory: 'stale', ageInDays: 200 })
    const result = makeAgesResult({ staleFiles: [staleFile] })
    const output = formatAgesTable(result, false)
    expect(output).toContain('stale file')
  })

  it('shows high-churn section when present', () => {
    const churnFile = makeFileAge({ totalChanges: 50, filePath: 'src/hot.ts', relativePath: 'src/hot.ts' })
    const result = makeAgesResult({ files: [churnFile], highChurnFiles: [churnFile] })
    const output = formatAgesTable(result, false)
    expect(output).toContain('High Churn')
    expect(output).toContain('src/hot.ts')
  })

  it('shows authors in verbose mode', () => {
    const file = makeFileAge({ authors: ['alice', 'bob'] })
    const result = makeAgesResult({ files: [file] })
    const output = formatAgesTable(result, true)
    expect(output).toContain('alice')
    expect(output).toContain('bob')
  })

  it('handles empty files', () => {
    const emptyStats: AgeStats = {
      ancientCount: 0,
      averageAge: 0,
      freshCount: 0,
      medianAge: 0,
      newestFile: null,
      oldestFile: null,
      recentCount: 0,
      stableCount: 0,
      staleCount: 0,
      totalFiles: 0,
    }
    const result = makeAgesResult({ files: [], stats: emptyStats })
    const output = formatAgesTable(result, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Total files: 0')
  })
})

// ─── formatAgesCsv ──────────────────────────────────────

describe('formatAgesCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeAgesResult({ files: [] })
    const output = formatAgesCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toContain('File')
    expect(lines[0]).toContain('Category')
    expect(lines[0]).toContain('Changes')
  })

  it('includes data rows for files', () => {
    const result = makeAgesResult()
    const output = formatAgesCsv(result)
    expect(output).toContain('src/index.ts')
    expect(output).toContain('stable')
  })

  it('escapes commas in file paths', () => {
    const file = makeFileAge({ filePath: 'src/my,file.ts', relativePath: 'src/my,file.ts' })
    const result = makeAgesResult({ files: [file] })
    const output = formatAgesCsv(result)
    expect(output).toContain('"src/my,file.ts"')
  })

  it('handles empty files', () => {
    const emptyStats: AgeStats = {
      ancientCount: 0,
      averageAge: 0,
      freshCount: 0,
      medianAge: 0,
      newestFile: null,
      oldestFile: null,
      recentCount: 0,
      stableCount: 0,
      staleCount: 0,
      totalFiles: 0,
    }
    const result = makeAgesResult({ files: [], stats: emptyStats })
    const output = formatAgesCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toContain('File')
  })
})

// ─── formatAgesJson ─────────────────────────────────────

describe('formatAgesJson', () => {
  it('produces valid JSON', () => {
    const result = makeAgesResult()
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeAgesResult()
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makeAgesResult()
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('contains staleFiles and highChurnFiles', () => {
    const result = makeAgesResult()
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.staleFiles).toBeDefined()
    expect(parsed.highChurnFiles).toBeDefined()
  })

  it('handles empty results', () => {
    const emptyStats: AgeStats = {
      ancientCount: 0,
      averageAge: 0,
      freshCount: 0,
      medianAge: 0,
      newestFile: null,
      oldestFile: null,
      recentCount: 0,
      stableCount: 0,
      staleCount: 0,
      totalFiles: 0,
    }
    const result = makeAgesResult({ files: [], stats: emptyStats })
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('preserves file data accurately', () => {
    const file = makeFileAge({
      ageInDays: 42,
      ageCategory: 'stable',
      filePath: 'src/app.ts',
      totalChanges: 15,
    })
    const result = makeAgesResult({ files: [file] })
    const output = formatAgesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].ageInDays).toBe(42)
    expect(parsed.files[0].ageCategory).toBe('stable')
    expect(parsed.files[0].filePath).toBe('src/app.ts')
    expect(parsed.files[0].totalChanges).toBe(15)
  })
})
