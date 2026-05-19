import { describe, expect, it } from 'vitest'

import Trends from '../src/commands/trends.js'
import {
  buildTrendsResult,
  calculateTrendSummary,
  executeGit,
  getPeriodKey,
  parseFileChurn,
  parseGitLogForPeriods,
  type PeriodData,
  type TrendsOptions,
} from '../src/commands/trends-helpers.js'
import {
  formatGrowthRate,
  formatSparkline,
  formatTrendsCsv,
  formatTrendsJson,
  formatTrendsTable,
} from '../src/commands/trends-format-helpers.js'
import type { TrendsResult } from '../src/commands/trends-helpers.js'

// ─── Test data factories ────────────────────────────────

function makePeriodData(overrides: Partial<PeriodData> = {}): PeriodData {
  return {
    commits: 5,
    contributors: 2,
    filesChanged: 10,
    linesAdded: 100,
    linesDeleted: 50,
    netLines: 50,
    period: '2024-W01',
    ...overrides,
  }
}

function makeTrendsResult(overrides: Partial<TrendsResult> = {}): TrendsResult {
  const period = makePeriodData()
  return {
    fileChurn: [],
    periods: [period],
    summary: calculateTrendSummary([period]),
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Trends command - static metadata', () => {
  it('has a description', () => {
    expect(Trends.description).toBe('Analyze codebase trends over time')
  })

  it('has examples array', () => {
    expect(Array.isArray(Trends.examples)).toBe(true)
    expect(Trends.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Trends.args.path).toBeDefined()
    expect(Trends.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Trends.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Trends command - flags', () => {
  it('has format flag with options', () => {
    expect(Trends.flags.format.options).toContain('json')
    expect(Trends.flags.format.options).toContain('table')
    expect(Trends.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Trends.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Trends.flags.output).toBeDefined()
  })

  it('has period flag defaulting to week', () => {
    expect(Trends.flags.period.default).toBe('week')
  })

  it('has period options', () => {
    expect(Trends.flags.period.options).toContain('day')
    expect(Trends.flags.period.options).toContain('week')
    expect(Trends.flags.period.options).toContain('month')
  })

  it('has since flag', () => {
    expect(Trends.flags.since).toBeDefined()
  })

  it('has until flag', () => {
    expect(Trends.flags.until).toBeDefined()
  })

  it('has top flag defaulting to 10', () => {
    expect(Trends.flags.top.default).toBe(10)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Trends.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Trends command - class structure', () => {
  it('exports a default class', () => {
    expect(Trends).toBeDefined()
    expect(typeof Trends).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Trends.prototype.run).toBe('function')
  })
})

// ─── getPeriodKey ───────────────────────────────────────

describe('getPeriodKey', () => {
  it('returns YYYY-MM-DD for day period', () => {
    expect(getPeriodKey('2024-01-15T10:30:00Z', 'day')).toBe('2024-01-15')
  })

  it('returns YYYY-MM for month period', () => {
    expect(getPeriodKey('2024-01-15T10:30:00Z', 'month')).toBe('2024-01')
  })

  it('returns YYYY-WNN for week period', () => {
    const key = getPeriodKey('2024-01-15T10:30:00Z', 'week')
    expect(key).toMatch(/^2024-W\d{2}$/)
  })

  it('handles edge case: Jan 1 as week 1', () => {
    const key = getPeriodKey('2024-01-01T00:00:00Z', 'week')
    expect(key).toBe('2024-W01')
  })

  it('handles invalid date string', () => {
    expect(getPeriodKey('not-a-date', 'day')).toBe('unknown')
  })

  it('handles day period with single-digit month', () => {
    expect(getPeriodKey('2024-03-05T10:00:00Z', 'day')).toBe('2024-03-05')
  })
})

// ─── parseGitLogForPeriods ──────────────────────────────

describe('parseGitLogForPeriods', () => {
  it('parses daily period grouping', () => {
    const log = '2024-01-15T10:00:00Z|Alice\n5\t3\tsrc/index.ts'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result).toHaveLength(1)
    expect(result[0]!.period).toBe('2024-01-15')
  })

  it('parses weekly period grouping', () => {
    const log = '2024-01-15T10:00:00Z|Alice\n5\t3\tsrc/index.ts'
    const result = parseGitLogForPeriods(log, 'week')
    expect(result).toHaveLength(1)
    expect(result[0]!.period).toMatch(/^2024-W/)
  })

  it('parses monthly period grouping', () => {
    const log = '2024-03-15T10:00:00Z|Alice\n5\t3\tsrc/index.ts'
    const result = parseGitLogForPeriods(log, 'month')
    expect(result).toHaveLength(1)
    expect(result[0]!.period).toBe('2024-03')
  })

  it('groups multiple commits in same period', () => {
    const log =
      '\x002024-01-15T10:00:00Z|Alice\n5\t3\tsrc/a.ts\n' +
      '\x002024-01-15T14:00:00Z|Bob\n2\t1\tsrc/b.ts'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result).toHaveLength(1)
    expect(result[0]!.commits).toBe(2)
    expect(result[0]!.contributors).toBe(2)
    expect(result[0]!.linesAdded).toBe(7)
    expect(result[0]!.linesDeleted).toBe(4)
  })

  it('handles empty log', () => {
    expect(parseGitLogForPeriods('', 'day')).toHaveLength(0)
    expect(parseGitLogForPeriods('   ', 'day')).toHaveLength(0)
  })

  it('handles missing fields gracefully', () => {
    const log = '\x00'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result).toHaveLength(0)
  })

  it('computes netLines correctly', () => {
    const log = '2024-01-15T10:00:00Z|Alice\n10\t3\tsrc/index.ts'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result[0]!.netLines).toBe(7)
  })

  it('sorts periods chronologically', () => {
    const log =
      '\x002024-02-15T10:00:00Z|Alice\n5\t3\tsrc/a.ts\n' +
      '\x002024-01-15T10:00:00Z|Bob\n2\t1\tsrc/b.ts'
    const result = parseGitLogForPeriods(log, 'month')
    expect(result[0]!.period).toBe('2024-01')
    expect(result[1]!.period).toBe('2024-02')
  })

  it('counts unique contributors', () => {
    const log =
      '2024-01-15T10:00:00Z|Alice\n1\t0\tsrc/a.ts\n' +
      '\x002024-01-15T14:00:00Z|Alice\n1\t0\tsrc/b.ts'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result[0]!.contributors).toBe(1)
  })

  it('handles binary files (shown as -)', () => {
    const log = '2024-01-15T10:00:00Z|Alice\n-\t-\timage.png'
    const result = parseGitLogForPeriods(log, 'day')
    expect(result[0]!.linesAdded).toBe(0)
    expect(result[0]!.linesDeleted).toBe(0)
    expect(result[0]!.filesChanged).toBe(1)
  })
})

// ─── parseFileChurn ─────────────────────────────────────

describe('parseFileChurn', () => {
  it('computes single file churn', () => {
    const output = '\x00\n10\t5\tsrc/index.ts'
    const result = parseFileChurn(output)
    expect(result).toHaveLength(1)
    expect(result[0]!.filePath).toBe('src/index.ts')
    expect(result[0]!.linesAdded).toBe(10)
    expect(result[0]!.linesDeleted).toBe(5)
    expect(result[0]!.churnScore).toBe(15)
  })

  it('handles multiple files', () => {
    const output =
      '\x00\n10\t5\tsrc/a.ts\n3\t1\tsrc/b.ts'
    const result = parseFileChurn(output)
    expect(result).toHaveLength(2)
  })

  it('handles binary files (shown as -)', () => {
    const output = '\x00\n-\t-\timage.png'
    const result = parseFileChurn(output)
    expect(result).toHaveLength(1)
    expect(result[0]!.linesAdded).toBe(0)
    expect(result[0]!.linesDeleted).toBe(0)
    expect(result[0]!.churnScore).toBe(0)
  })

  it('handles empty input', () => {
    expect(parseFileChurn('')).toHaveLength(0)
    expect(parseFileChurn('   ')).toHaveLength(0)
  })

  it('sorts by churnScore descending', () => {
    const output =
      '\x00\n5\t1\tsrc/small.ts\n50\t20\tsrc/big.ts'
    const result = parseFileChurn(output)
    expect(result[0]!.filePath).toBe('src/big.ts')
    expect(result[1]!.filePath).toBe('src/small.ts')
  })

  it('accumulates churn across commits', () => {
    const output =
      '\x00\n10\t5\tsrc/index.ts\n' +
      '\x00\n3\t2\tsrc/index.ts'
    const result = parseFileChurn(output)
    expect(result).toHaveLength(1)
    expect(result[0]!.linesAdded).toBe(13)
    expect(result[0]!.linesDeleted).toBe(7)
    expect(result[0]!.churnScore).toBe(20)
    expect(result[0]!.periodsActive).toBe(2)
  })

  it('tracks totalChanges per file', () => {
    const output =
      '\x00\n10\t5\tsrc/a.ts\n3\t1\tsrc/b.ts\n2\t0\tsrc/a.ts'
    const result = parseFileChurn(output)
    const fileA = result.find((f) => f.filePath === 'src/a.ts')
    expect(fileA!.totalChanges).toBe(2)
  })
})

// ─── calculateTrendSummary ──────────────────────────────

describe('calculateTrendSummary', () => {
  it('computes basic stats', () => {
    const periods = [
      makePeriodData({ commits: 5, linesAdded: 100, linesDeleted: 50, netLines: 50, period: '2024-W01' }),
      makePeriodData({ commits: 10, linesAdded: 200, linesDeleted: 80, netLines: 120, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.totalPeriods).toBe(2)
    expect(summary.totalCommits).toBe(15)
    expect(summary.totalLinesAdded).toBe(300)
    expect(summary.totalLinesDeleted).toBe(130)
  })

  it('identifies peak period by commits', () => {
    const periods = [
      makePeriodData({ commits: 3, period: '2024-W01' }),
      makePeriodData({ commits: 20, period: '2024-W02' }),
      makePeriodData({ commits: 7, period: '2024-W03' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.peakPeriod).toBeDefined()
    expect(summary.peakPeriod!.period).toBe('2024-W02')
    expect(summary.peakPeriod!.commits).toBe(20)
  })

  it('calculates positive growth rate', () => {
    const periods = [
      makePeriodData({ netLines: 100, period: '2024-W01' }),
      makePeriodData({ netLines: 200, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.growthRate).toBe(100)
  })

  it('calculates negative growth rate', () => {
    const periods = [
      makePeriodData({ netLines: 200, period: '2024-W01' }),
      makePeriodData({ netLines: 100, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.growthRate).toBe(-50)
  })

  it('handles zero first period net lines', () => {
    const periods = [
      makePeriodData({ netLines: 0, period: '2024-W01' }),
      makePeriodData({ netLines: 50, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.growthRate).toBe(100)
  })

  it('handles zero first and last period net lines', () => {
    const periods = [
      makePeriodData({ netLines: 0, period: '2024-W01' }),
      makePeriodData({ netLines: 0, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.growthRate).toBe(0)
  })

  it('handles single period', () => {
    const periods = [makePeriodData({ netLines: 50, period: '2024-W01' })]
    const summary = calculateTrendSummary(periods)
    expect(summary.totalPeriods).toBe(1)
    expect(summary.totalCommits).toBe(5)
    expect(summary.growthRate).toBe(0)
  })

  it('handles empty periods', () => {
    const summary = calculateTrendSummary([])
    expect(summary.totalPeriods).toBe(0)
    expect(summary.totalCommits).toBe(0)
    expect(summary.peakPeriod).toBeNull()
    expect(summary.growthRate).toBe(0)
  })

  it('computes average commits per period', () => {
    const periods = [
      makePeriodData({ commits: 10, period: '2024-W01' }),
      makePeriodData({ commits: 20, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.averageCommitsPerPeriod).toBe(15)
  })
})

// ─── formatSparkline ────────────────────────────────────

describe('formatSparkline', () => {
  it('maps various values to sparkline chars', () => {
    const result = formatSparkline([0, 1, 2, 3, 4, 5, 6, 7, 8], 8)
    expect(result).toHaveLength(9)
    expect(result).toContain('█')
    expect(result).toContain('▁')
  })

  it('handles all same values', () => {
    const result = formatSparkline([5, 5, 5], 5)
    expect(result).toBe('███')
  })

  it('handles single value', () => {
    const result = formatSparkline([42], 42)
    expect(result).toBe('█')
  })

  it('handles empty array', () => {
    expect(formatSparkline([], 1)).toBe('')
  })

  it('uses max from data when max not provided', () => {
    const result = formatSparkline([0, 5])
    expect(result).toContain('▁')
    expect(result).toContain('█')
  })

  it('handles all zeros', () => {
    const result = formatSparkline([0, 0, 0], 0)
    expect(result).toBe('▁▁▁')
  })

  it('handles all zeros without max', () => {
    const result = formatSparkline([0, 0, 0])
    expect(result).toBe('▁▁▁')
  })
})

// ─── formatGrowthRate ───────────────────────────────────

describe('formatGrowthRate', () => {
  it('formats positive growth', () => {
    const result = formatGrowthRate(15.5)
    expect(result).toContain('↑')
    expect(result).toContain('+15.5%')
  })

  it('formats negative growth', () => {
    const result = formatGrowthRate(-10.3)
    expect(result).toContain('↓')
    expect(result).toContain('-10.3%')
  })

  it('formats zero growth', () => {
    const result = formatGrowthRate(0)
    expect(result).toContain('→')
    expect(result).toContain('0.0%')
  })
})

// ─── formatTrendsTable ──────────────────────────────────

describe('formatTrendsTable', () => {
  it('contains header row with column names', () => {
    const result = makeTrendsResult()
    const output = formatTrendsTable(result, false)
    expect(output).toContain('Period')
    expect(output).toContain('Commits')
    expect(output).toContain('Net')
  })

  it('contains period data', () => {
    const result = makeTrendsResult({
      periods: [makePeriodData({ period: '2024-W01', commits: 5 })],
    })
    const output = formatTrendsTable(result, false)
    expect(output).toContain('2024-W01')
  })

  it('shows activity sparkline', () => {
    const result = makeTrendsResult()
    const output = formatTrendsTable(result, false)
    expect(output).toContain('Activity Sparkline')
  })

  it('shows summary section', () => {
    const result = makeTrendsResult()
    const output = formatTrendsTable(result, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Growth Rate')
  })

  it('shows file churn in verbose mode', () => {
    const result = makeTrendsResult({
      fileChurn: [{ filePath: 'src/hot.ts', totalChanges: 10, linesAdded: 50, linesDeleted: 20, churnScore: 70, periodsActive: 5 }],
    })
    const output = formatTrendsTable(result, true)
    expect(output).toContain('src/hot.ts')
    expect(output).toContain('Churn Score')
  })

  it('handles empty periods gracefully', () => {
    const result: TrendsResult = {
      fileChurn: [],
      periods: [],
      summary: { totalPeriods: 0, totalCommits: 0, totalLinesAdded: 0, totalLinesDeleted: 0, averageCommitsPerPeriod: 0, averageLinesPerPeriod: 0, peakPeriod: null, growthRate: 0 },
    }
    const output = formatTrendsTable(result, false)
    expect(output).toContain('No git history found')
  })

  it('shows peak period in summary', () => {
    const periods = [
      makePeriodData({ commits: 3, period: '2024-W01' }),
      makePeriodData({ commits: 10, period: '2024-W02' }),
    ]
    const result = makeTrendsResult({
      periods,
      summary: calculateTrendSummary(periods),
    })
    const output = formatTrendsTable(result, false)
    expect(output).toContain('Peak Period')
    expect(output).toContain('2024-W02')
  })
})

// ─── formatTrendsCsv ────────────────────────────────────

describe('formatTrendsCsv', () => {
  it('produces CSV with period headers', () => {
    const result = makeTrendsResult()
    const output = formatTrendsCsv(result)
    expect(output).toContain('Period,Commits,Lines Added,Lines Deleted,Net Lines,Files Changed,Contributors')
  })

  it('produces CSV with file churn headers', () => {
    const result = makeTrendsResult()
    const output = formatTrendsCsv(result)
    expect(output).toContain('File,Changes,Added,Deleted,Churn Score,Periods Active')
  })

  it('includes period data rows', () => {
    const result = makeTrendsResult({
      periods: [makePeriodData({ period: '2024-W01', commits: 5, linesAdded: 100 })],
    })
    const output = formatTrendsCsv(result)
    expect(output).toContain('2024-W01')
  })

  it('escapes commas in file paths', () => {
    const result = makeTrendsResult({
      fileChurn: [{ filePath: 'path/with,comma.ts', totalChanges: 1, linesAdded: 1, linesDeleted: 0, churnScore: 1, periodsActive: 1 }],
    })
    const output = formatTrendsCsv(result)
    expect(output).toContain('"path/with,comma.ts"')
  })

  it('handles empty result', () => {
    const result: TrendsResult = {
      fileChurn: [],
      periods: [],
      summary: { totalPeriods: 0, totalCommits: 0, totalLinesAdded: 0, totalLinesDeleted: 0, averageCommitsPerPeriod: 0, averageLinesPerPeriod: 0, peakPeriod: null, growthRate: 0 },
    }
    const output = formatTrendsCsv(result)
    expect(output).toContain('Period,Commits')
    expect(output).toContain('File,Changes')
  })
})

// ─── formatTrendsJson ───────────────────────────────────

describe('formatTrendsJson', () => {
  it('produces valid JSON', () => {
    const result = makeTrendsResult()
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains periods array', () => {
    const result = makeTrendsResult()
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.periods).toBeDefined()
    expect(Array.isArray(parsed.periods)).toBe(true)
  })

  it('contains fileChurn array', () => {
    const result = makeTrendsResult()
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.fileChurn).toBeDefined()
    expect(Array.isArray(parsed.fileChurn)).toBe(true)
  })

  it('contains summary object', () => {
    const result = makeTrendsResult()
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.summary).toBeDefined()
    expect(parsed.summary.totalCommits).toBe(5)
  })

  it('handles empty results', () => {
    const result: TrendsResult = {
      fileChurn: [],
      periods: [],
      summary: { totalPeriods: 0, totalCommits: 0, totalLinesAdded: 0, totalLinesDeleted: 0, averageCommitsPerPeriod: 0, averageLinesPerPeriod: 0, peakPeriod: null, growthRate: 0 },
    }
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.periods).toHaveLength(0)
    expect(parsed.fileChurn).toHaveLength(0)
  })

  it('preserves data accurately', () => {
    const result = makeTrendsResult({
      periods: [makePeriodData({ period: '2024-03', commits: 42, linesAdded: 500 })],
    })
    const output = formatTrendsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.periods[0].period).toBe('2024-03')
    expect(parsed.periods[0].commits).toBe(42)
    expect(parsed.periods[0].linesAdded).toBe(500)
  })
})

// ─── executeGit ─────────────────────────────────────────

describe('executeGit', () => {
  it('returns string output for valid git command', () => {
    const output = executeGit(['--version'], process.cwd())
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('returns empty string for invalid command', () => {
    const output = executeGit(['nonexistent-arg-xyz'], process.cwd())
    expect(output).toBe('')
  })
})

// ─── buildTrendsResult ──────────────────────────────────

describe('buildTrendsResult', () => {
  it('returns a TrendsResult with correct shape', () => {
    const result = buildTrendsResult(process.cwd(), { period: 'week', top: 5 })
    expect(result).toHaveProperty('periods')
    expect(result).toHaveProperty('fileChurn')
    expect(result).toHaveProperty('summary')
    expect(Array.isArray(result.periods)).toBe(true)
    expect(Array.isArray(result.fileChurn)).toBe(true)
  })

  it('respects top option for file churn', () => {
    const result = buildTrendsResult(process.cwd(), { period: 'week', top: 3 })
    expect(result.fileChurn.length).toBeLessThanOrEqual(3)
  })

  it('passes since option to git', () => {
    const result = buildTrendsResult(process.cwd(), { period: 'week', top: 5, since: '2024-01-01' })
    expect(result).toHaveProperty('periods')
  })

  it('passes until option to git', () => {
    const result = buildTrendsResult(process.cwd(), { period: 'week', top: 5, until: '2099-01-01' })
    expect(result).toHaveProperty('periods')
  })
})

// ─── Integration: summary matches periods ───────────────

describe('Integration: summary consistency', () => {
  it('summary totalCommits matches sum of period commits', () => {
    const periods = [
      makePeriodData({ commits: 3, period: '2024-W01' }),
      makePeriodData({ commits: 7, period: '2024-W02' }),
      makePeriodData({ commits: 5, period: '2024-W03' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.totalCommits).toBe(15)
  })

  it('summary totalLinesAdded matches sum of period linesAdded', () => {
    const periods = [
      makePeriodData({ linesAdded: 100, period: '2024-W01' }),
      makePeriodData({ linesAdded: 200, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.totalLinesAdded).toBe(300)
  })

  it('summary totalLinesDeleted matches sum of period linesDeleted', () => {
    const periods = [
      makePeriodData({ linesDeleted: 50, period: '2024-W01' }),
      makePeriodData({ linesDeleted: 30, period: '2024-W02' }),
    ]
    const summary = calculateTrendSummary(periods)
    expect(summary.totalLinesDeleted).toBe(80)
  })
})
