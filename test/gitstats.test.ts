import { describe, expect, test } from 'vitest'

import {
  computeBusFactor,
  computeContributorStats,
  computeDailyActivity,
  computeHourlyActivity,
  computePeakDay,
  computePeakHour,
  computeWeeklyActivity,
  parseAuthorLog,
  parseLogStats,
  parseShortlog,
} from '../src/commands/gitstats-helpers.js'
import { formatBarChart, formatGitStatsJson, formatGitStatsTable, formatNumber } from '../src/commands/gitstats-format-helpers.js'

// ─── parseShortlog ───────────────────────────────────────

describe('parseShortlog', () => {
  test('parses single contributor', () => {
    const input = '  42\tAlice <alice@example.com>\n'
    const result = parseShortlog(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Alice')
    expect(result[0]!.email).toBe('alice@example.com')
    expect(result[0]!.commits).toBe(42)
  })

  test('parses multiple contributors', () => {
    const input = '  100\tAlice <alice@example.com>\n  50\tBob <bob@example.com>\n  10\tCharlie <charlie@example.com>\n'
    const result = parseShortlog(input)
    expect(result).toHaveLength(3)
    expect(result[0]!.commits).toBe(100)
    expect(result[1]!.commits).toBe(50)
    expect(result[2]!.commits).toBe(10)
  })

  test('parses space-separated format', () => {
    const input = '  42  Alice <alice@example.com>\n'
    const result = parseShortlog(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Alice')
    expect(result[0]!.commits).toBe(42)
  })

  test('returns empty array for empty input', () => {
    expect(parseShortlog('')).toEqual([])
    expect(parseShortlog('   ')).toEqual([])
    expect(parseShortlog('\n\n')).toEqual([])
  })

  test('skips malformed lines', () => {
    const input = '  not a valid line\n  42\tAlice <alice@example.com>\n'
    const result = parseShortlog(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Alice')
  })

  test('handles names with spaces', () => {
    const input = '  99\tAlice Bob Smith <alice.smith@example.com>\n'
    const result = parseShortlog(input)
    expect(result[0]!.name).toBe('Alice Bob Smith')
    expect(result[0]!.email).toBe('alice.smith@example.com')
  })

  test('handles large commit counts', () => {
    const input = '  999999\tPower User <power@example.com>\n'
    const result = parseShortlog(input)
    expect(result[0]!.commits).toBe(999999)
  })
})

// ─── parseLogStats ───────────────────────────────────────

describe('parseLogStats', () => {
  test('parses single commit', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n10\t5\tfile.ts\n'
    const result = parseLogStats(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.date).toContain('2024-01-15')
    expect(result[0]!.additions).toBe(10)
    expect(result[0]!.deletions).toBe(5)
    expect(result[0]!.files).toBe(1)
  })

  test('parses multiple commits', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n10\t5\tfile.ts\n2024-01-16T12:00:00+00:00\n\n3\t0\tother.ts\n2\t1\tmore.ts\n'
    const result = parseLogStats(input)
    expect(result).toHaveLength(2)
    expect(result[0]!.files).toBe(1)
    expect(result[1]!.files).toBe(2)
    expect(result[1]!.additions).toBe(5)
    expect(result[1]!.deletions).toBe(1)
  })

  test('handles binary files (marked as - -)', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n-\t-\timage.png\n5\t2\tcode.ts\n'
    const result = parseLogStats(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.files).toBe(2)
    expect(result[0]!.additions).toBe(5)
    expect(result[0]!.deletions).toBe(2)
  })

  test('returns empty array for empty input', () => {
    expect(parseLogStats('')).toEqual([])
    expect(parseLogStats('   ')).toEqual([])
  })

  test('handles commit with no files', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n'
    const result = parseLogStats(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.files).toBe(0)
    expect(result[0]!.additions).toBe(0)
    expect(result[0]!.deletions).toBe(0)
  })

  test('aggregates additions and deletions across files', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n10\t5\ta.ts\n20\t3\tb.ts\n30\t0\tc.ts\n'
    const result = parseLogStats(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.additions).toBe(60)
    expect(result[0]!.deletions).toBe(8)
    expect(result[0]!.files).toBe(3)
  })
})

// ─── computeHourlyActivity ───────────────────────────────

describe('computeHourlyActivity', () => {
  test('returns all 24 hours', () => {
    const result = computeHourlyActivity([])
    expect(result).toHaveLength(24)
    for (let i = 0; i < 24; i++) {
      expect(result[i]!.hour).toBe(i)
      expect(result[i]!.count).toBe(0)
    }
  })

  test('distributes commits to correct hours', () => {
    const commits = [
      { date: '2024-01-15T10:30:00' },
      { date: '2024-01-15T14:00:00' },
      { date: '2024-01-15T10:45:00' },
    ]
    const result = computeHourlyActivity(commits)
    expect(result[10]!.count).toBe(2)
    expect(result[14]!.count).toBe(1)
    expect(result[0]!.count).toBe(0)
  })

  test('empty input returns all zeros', () => {
    const result = computeHourlyActivity([])
    expect(result.every((h) => h.count === 0)).toBe(true)
  })

  test('midnight hour works', () => {
    const commits = [{ date: '2024-01-15T00:00:00' }]
    const result = computeHourlyActivity(commits)
    expect(result[0]!.count).toBe(1)
  })

  test('late night hour works', () => {
    const commits = [{ date: '2024-01-15T23:59:59' }]
    const result = computeHourlyActivity(commits)
    expect(result[23]!.count).toBe(1)
  })
})

// ─── computeDailyActivity ────────────────────────────────

describe('computeDailyActivity', () => {
  test('returns all 7 days in Mon-Sun order', () => {
    const result = computeDailyActivity([])
    expect(result).toHaveLength(7)
    expect(result[0]!.day).toBe('Mon')
    expect(result[1]!.day).toBe('Tue')
    expect(result[2]!.day).toBe('Wed')
    expect(result[3]!.day).toBe('Thu')
    expect(result[4]!.day).toBe('Fri')
    expect(result[5]!.day).toBe('Sat')
    expect(result[6]!.day).toBe('Sun')
  })

  test('correct distribution across days', () => {
    // 2024-01-15 is a Monday
    const commits = [
      { date: '2024-01-15T10:00:00' },
      { date: '2024-01-15T14:00:00' },
      { date: '2024-01-17T10:00:00' }, // Wednesday
    ]
    const result = computeDailyActivity(commits)
    expect(result[0]!.count).toBe(2) // Mon
    expect(result[2]!.count).toBe(1) // Wed
    expect(result[1]!.count).toBe(0) // Tue
  })

  test('empty input returns all zeros', () => {
    const result = computeDailyActivity([])
    expect(result.every((d) => d.count === 0)).toBe(true)
  })

  test('Sunday distribution', () => {
    // 2024-01-14 is a Sunday
    const commits = [{ date: '2024-01-14T10:00:00' }]
    const result = computeDailyActivity(commits)
    expect(result[6]!.count).toBe(1) // Sun is last
  })

  test('Saturday distribution', () => {
    // 2024-01-13 is a Saturday
    const commits = [{ date: '2024-01-13T10:00:00' }]
    const result = computeDailyActivity(commits)
    expect(result[5]!.count).toBe(1) // Sat is 6th
  })
})

// ─── computeWeeklyActivity ───────────────────────────────

describe('computeWeeklyActivity', () => {
  test('groups commits into weeks', () => {
    const commits = [
      { date: '2024-01-15T10:00:00Z', additions: 10, deletions: 5 },
      { date: '2024-01-16T10:00:00Z', additions: 3, deletions: 1 },
    ]
    const result = computeWeeklyActivity(commits)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]!.count).toBe(2)
    expect(result[0]!.additions).toBe(13)
    expect(result[0]!.deletions).toBe(6)
  })

  test('sorts chronologically', () => {
    const commits = [
      { date: '2024-02-15T10:00:00Z', additions: 1, deletions: 0 },
      { date: '2024-01-15T10:00:00Z', additions: 1, deletions: 0 },
    ]
    const result = computeWeeklyActivity(commits)
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0]!.date.localeCompare(result[1]!.date)).toBeLessThanOrEqual(0)
  })

  test('empty input returns empty array', () => {
    expect(computeWeeklyActivity([])).toEqual([])
  })

  test('separates commits from different weeks', () => {
    const commits = [
      { date: '2024-01-01T10:00:00Z', additions: 5, deletions: 0 },
      { date: '2024-02-01T10:00:00Z', additions: 10, deletions: 0 },
    ]
    const result = computeWeeklyActivity(commits)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── computeContributorStats ─────────────────────────────

describe('computeContributorStats', () => {
  test('computes correct stats per contributor', () => {
    const shortlogData = [
      { name: 'Alice', email: 'alice@example.com', commits: 2 },
    ]
    const logByAuthor = new Map<string, { date: string; additions: number; deletions: number }[]>([
      ['alice@example.com', [
        { date: '2024-01-15T10:00:00Z', additions: 10, deletions: 5 },
        { date: '2024-01-16T12:00:00Z', additions: 20, deletions: 3 },
      ]],
    ])

    const result = computeContributorStats(shortlogData, logByAuthor)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Alice')
    expect(result[0]!.additions).toBe(30)
    expect(result[0]!.deletions).toBe(8)
    expect(result[0]!.commits).toBe(2)
    expect(result[0]!.activeDays).toBe(2)
  })

  test('counts active days correctly (same day = 1)', () => {
    const shortlogData = [
      { name: 'Bob', email: 'bob@example.com', commits: 3 },
    ]
    const logByAuthor = new Map<string, { date: string; additions: number; deletions: number }[]>([
      ['bob@example.com', [
        { date: '2024-01-15T10:00:00Z', additions: 5, deletions: 0 },
        { date: '2024-01-15T14:00:00Z', additions: 3, deletions: 0 },
        { date: '2024-01-15T18:00:00Z', additions: 1, deletions: 0 },
      ]],
    ])

    const result = computeContributorStats(shortlogData, logByAuthor)
    expect(result[0]!.activeDays).toBe(1)
  })

  test('handles contributor with no log data', () => {
    const shortlogData = [
      { name: 'Ghost', email: 'ghost@example.com', commits: 0 },
    ]
    const logByAuthor = new Map()

    const result = computeContributorStats(shortlogData, logByAuthor)
    expect(result[0]!.activeDays).toBe(0)
    expect(result[0]!.additions).toBe(0)
    expect(result[0]!.deletions).toBe(0)
  })

  test('sets first and last commit dates', () => {
    const shortlogData = [
      { name: 'Alice', email: 'alice@example.com', commits: 2 },
    ]
    const logByAuthor = new Map<string, { date: string; additions: number; deletions: number }[]>([
      ['alice@example.com', [
        { date: '2024-01-10T10:00:00Z', additions: 5, deletions: 0 },
        { date: '2024-01-20T10:00:00Z', additions: 3, deletions: 0 },
      ]],
    ])

    const result = computeContributorStats(shortlogData, logByAuthor)
    expect(result[0]!.firstCommit).toContain('2024-01-10')
    expect(result[0]!.lastCommit).toContain('2024-01-20')
  })
})

// ─── computeBusFactor ────────────────────────────────────

describe('computeBusFactor', () => {
  test('single contributor returns factor 1', () => {
    const stats = [
      { name: 'Alice', email: 'a@x.com', commits: 100, additions: 1000, deletions: 100, firstCommit: '', lastCommit: '', activeDays: 10 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(1)
    expect(result.totalContributors).toBe(1)
    expect(result.coverage).toBe(100)
  })

  test('two equal contributors returns factor 1', () => {
    const stats = [
      { name: 'Alice', email: 'a@x.com', commits: 50, additions: 500, deletions: 50, firstCommit: '', lastCommit: '', activeDays: 5 },
      { name: 'Bob', email: 'b@x.com', commits: 50, additions: 500, deletions: 50, firstCommit: '', lastCommit: '', activeDays: 5 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(1)
    expect(result.totalContributors).toBe(2)
    expect(result.coverage).toBe(50)
  })

  test('dominant contributor returns factor 1', () => {
    const stats = [
      { name: 'Alice', email: 'a@x.com', commits: 80, additions: 800, deletions: 80, firstCommit: '', lastCommit: '', activeDays: 10 },
      { name: 'Bob', email: 'b@x.com', commits: 20, additions: 200, deletions: 20, firstCommit: '', lastCommit: '', activeDays: 5 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(1)
    expect(result.coverage).toBe(80)
    expect(result.topContributors).toContain('Alice')
  })

  test('many equal contributors returns correct factor', () => {
    const stats = [
      { name: 'A', email: 'a@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'B', email: 'b@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'C', email: 'c@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'D', email: 'd@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'E', email: 'e@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
    ]
    const result = computeBusFactor(stats)
    // 3 contributors needed for >= 50% of 100 (3*20=60 >= 50)
    expect(result.factor).toBe(3)
    expect(result.totalContributors).toBe(5)
  })

  test('empty input returns factor 0', () => {
    const result = computeBusFactor([])
    expect(result.factor).toBe(0)
    expect(result.totalContributors).toBe(0)
    expect(result.coverage).toBe(0)
    expect(result.topContributors).toEqual([])
  })

  test('all zero commits returns factor 0', () => {
    const stats = [
      { name: 'A', email: 'a@x.com', commits: 0, additions: 0, deletions: 0, firstCommit: '', lastCommit: '', activeDays: 0 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(0)
  })
})

// ─── computePeakHour ─────────────────────────────────────

describe('computePeakHour', () => {
  test('returns correct peak hour', () => {
    const data = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: i === 14 ? 50 : 5 }))
    expect(computePeakHour(data)).toBe(14)
  })

  test('returns 0 for all zeros', () => {
    const data = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    expect(computePeakHour(data)).toBe(0)
  })

  test('returns first hour on tie', () => {
    const data = [
      { hour: 8, count: 10 },
      { hour: 16, count: 10 },
    ]
    expect(computePeakHour(data)).toBe(8)
  })
})

// ─── computePeakDay ──────────────────────────────────────

describe('computePeakDay', () => {
  test('returns correct peak day', () => {
    const data = [
      { day: 'Mon', count: 5 },
      { day: 'Tue', count: 50 },
      { day: 'Wed', count: 10 },
      { day: 'Thu', count: 8 },
      { day: 'Fri', count: 12 },
      { day: 'Sat', count: 3 },
      { day: 'Sun', count: 2 },
    ]
    expect(computePeakDay(data)).toBe('Tue')
  })

  test('returns first day on tie', () => {
    const data = [
      { day: 'Mon', count: 10 },
      { day: 'Tue', count: 10 },
    ]
    expect(computePeakDay(data)).toBe('Mon')
  })

  test('defaults to Mon for all zeros', () => {
    const data = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
    ]
    expect(computePeakDay(data)).toBe('Mon')
  })
})

// ─── formatNumber ────────────────────────────────────────

describe('formatNumber', () => {
  test('formats small numbers', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(42)).toBe('42')
  })

  test('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  test('formats large numbers', () => {
    expect(formatNumber(1000000000)).toBe('1,000,000,000')
  })
})

// ─── formatBarChart ──────────────────────────────────────

describe('formatBarChart', () => {
  test('returns empty string for empty data', () => {
    expect(formatBarChart([])).toBe('')
  })

  test('renders single bar', () => {
    const result = formatBarChart([{ label: 'Mon', value: 10 }], 10, 3)
    expect(result).toContain('Mon')
    expect(result).toContain('10')
  })

  test('renders multiple bars', () => {
    const data = [
      { label: 'Mon', value: 10 },
      { label: 'Tue', value: 5 },
      { label: 'Wed', value: 8 },
    ]
    const result = formatBarChart(data, 10, 3)
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('Mon')
    expect(lines[1]).toContain('Tue')
    expect(lines[2]).toContain('Wed')
  })

  test('zero value renders empty bar', () => {
    const result = formatBarChart([{ label: 'Mon', value: 0 }, { label: 'Tue', value: 10 }], 10, 3)
    expect(result).toContain('Mon')
    expect(result).toContain('0')
  })
})

// ─── formatGitStatsJson ──────────────────────────────────

describe('formatGitStatsJson', () => {
  const sampleResult = {
    totalCommits: 100,
    totalAuthors: 5,
    firstCommitDate: '2024-01-01',
    lastCommitDate: '2024-06-01',
    activeDays: 45,
    totalAdditions: 5000,
    totalDeletions: 1000,
    commitsPerDay: 0.91,
    commitsPerWeek: 4.17,
    commitsPerMonth: 16.67,
    currentBranch: 'main',
    totalBranches: 3,
    totalTags: 2,
    contributorStats: [],
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: i === 10 ? 20 : 0 })),
    dailyActivity: [
      { day: 'Mon', count: 20 },
      { day: 'Tue', count: 15 },
      { day: 'Wed', count: 25 },
      { day: 'Thu', count: 10 },
      { day: 'Fri', count: 18 },
      { day: 'Sat', count: 7 },
      { day: 'Sun', count: 5 },
    ],
    weeklyActivity: [],
    busFactor: { factor: 2, totalContributors: 5, coverage: 60, topContributors: ['Alice', 'Bob'] },
    peakHour: 10,
    peakDay: 'Wed',
  }

  test('produces valid JSON', () => {
    const json = formatGitStatsJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.totalCommits).toBe(100)
    expect(parsed.totalAuthors).toBe(5)
  })

  test('includes all fields', () => {
    const json = formatGitStatsJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('totalCommits')
    expect(parsed).toHaveProperty('busFactor')
    expect(parsed).toHaveProperty('hourlyActivity')
    expect(parsed).toHaveProperty('dailyActivity')
    expect(parsed).toHaveProperty('contributorStats')
  })
})

// ─── formatGitStatsTable ─────────────────────────────────

describe('formatGitStatsTable', () => {
  const sampleResult = {
    totalCommits: 100,
    totalAuthors: 5,
    firstCommitDate: '2024-01-01',
    lastCommitDate: '2024-06-01',
    activeDays: 45,
    totalAdditions: 5000,
    totalDeletions: 1000,
    commitsPerDay: 0.91,
    commitsPerWeek: 4.17,
    commitsPerMonth: 16.67,
    currentBranch: 'main',
    totalBranches: 3,
    totalTags: 2,
    contributorStats: [
      { name: 'Alice', email: 'alice@example.com', commits: 40, additions: 2000, deletions: 300, firstCommit: '2024-01-01T00:00:00.000Z', lastCommit: '2024-06-01T23:59:59.999Z', activeDays: 20 },
      { name: 'Bob', email: 'bob@example.com', commits: 30, additions: 1500, deletions: 200, firstCommit: '2024-01-15T00:00:00.000Z', lastCommit: '2024-05-20T23:59:59.999Z', activeDays: 15 },
    ],
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: i === 10 ? 20 : 0 })),
    dailyActivity: [
      { day: 'Mon', count: 20 },
      { day: 'Tue', count: 15 },
      { day: 'Wed', count: 25 },
      { day: 'Thu', count: 10 },
      { day: 'Fri', count: 18 },
      { day: 'Sat', count: 7 },
      { day: 'Sun', count: 5 },
    ],
    weeklyActivity: [
      { date: '2024-W01', count: 10, additions: 500, deletions: 50 },
      { date: '2024-W02', count: 15, additions: 700, deletions: 80 },
    ],
    busFactor: { factor: 2, totalContributors: 5, coverage: 60, topContributors: ['Alice', 'Bob'] },
    peakHour: 10,
    peakDay: 'Wed',
  }

  test('includes repository overview', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Repository Overview')
    expect(table).toContain('100')
  })

  test('includes activity section', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Activity')
    expect(table).toContain('Commits/Day')
  })

  test('includes peak times', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Peak Times')
    expect(table).toContain('10:00')
    expect(table).toContain('Wed')
  })

  test('includes top contributors', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Top Contributors')
    expect(table).toContain('Alice')
    expect(table).toContain('Bob')
  })

  test('includes hourly activity', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Hourly Activity')
  })

  test('includes daily activity', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Daily Activity')
    expect(table).toContain('Mon')
  })

  test('includes bus factor', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).toContain('Bus Factor')
  })

  test('verbose mode includes weekly activity', () => {
    const table = formatGitStatsTable(sampleResult, true)
    expect(table).toContain('Weekly Activity')
    expect(table).toContain('2024-W01')
  })

  test('non-verbose mode excludes weekly details', () => {
    const table = formatGitStatsTable(sampleResult, false)
    expect(table).not.toContain('Weekly Activity')
  })
})

// ─── parseAuthorLog ──────────────────────────────────────

describe('parseAuthorLog', () => {
  test('returns empty map for empty input', () => {
    const result = parseAuthorLog('')
    expect(result.size).toBe(0)
  })

  test('parses single author single commit', () => {
    const input = 'alice@example.com\n2024-01-15T10:00:00\n\n10\t5\tfile.ts\n'
    const result = parseAuthorLog(input)
    expect(result.size).toBe(1)
    expect(result.get('alice@example.com')).toHaveLength(1)
    expect(result.get('alice@example.com')![0]!.additions).toBe(10)
    expect(result.get('alice@example.com')![0]!.deletions).toBe(5)
  })

  test('parses multiple authors', () => {
    const input = 'alice@example.com\n2024-01-15T10:00:00\n\n10\t0\tfile.ts\n\nbob@example.com\n2024-01-16T10:00:00\n\n5\t2\tother.ts\n'
    const result = parseAuthorLog(input)
    expect(result.size).toBe(2)
    expect(result.get('alice@example.com')).toHaveLength(1)
    expect(result.get('bob@example.com')).toHaveLength(1)
  })

  test('handles binary files in author log', () => {
    const input = 'alice@example.com\n2024-01-15T10:00:00\n\n-\t-\timage.png\n5\t0\tcode.ts\n'
    const result = parseAuthorLog(input)
    const commits = result.get('alice@example.com')!
    expect(commits[0]!.additions).toBe(5)
    expect(commits[0]!.deletions).toBe(0)
  })
})

// ─── computeBusFactor edge cases ─────────────────────────

describe('computeBusFactor edge cases', () => {
  test('three contributors with one dominant', () => {
    const stats = [
      { name: 'A', email: 'a@x.com', commits: 60, additions: 600, deletions: 60, firstCommit: '', lastCommit: '', activeDays: 10 },
      { name: 'B', email: 'b@x.com', commits: 25, additions: 250, deletions: 25, firstCommit: '', lastCommit: '', activeDays: 5 },
      { name: 'C', email: 'c@x.com', commits: 15, additions: 150, deletions: 15, firstCommit: '', lastCommit: '', activeDays: 3 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(1) // A has 60% >= 50%
    expect(result.coverage).toBe(60)
    expect(result.topContributors).toEqual(['A'])
  })

  test('four contributors needing two for 50%', () => {
    const stats = [
      { name: 'A', email: 'a@x.com', commits: 30, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'B', email: 'b@x.com', commits: 25, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'C', email: 'c@x.com', commits: 25, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
      { name: 'D', email: 'd@x.com', commits: 20, additions: 100, deletions: 10, firstCommit: '', lastCommit: '', activeDays: 3 },
    ]
    const result = computeBusFactor(stats)
    expect(result.factor).toBe(2) // A+B = 55% >= 50%
    expect(result.topContributors).toEqual(['A', 'B'])
  })
})

// ─── formatNumber edge cases ─────────────────────────────

describe('formatNumber edge cases', () => {
  test('handles negative numbers', () => {
    const result = formatNumber(-1000)
    expect(result).toContain('1,000')
  })

  test('handles 1', () => {
    expect(formatNumber(1)).toBe('1')
  })
})

// ─── parseShortlog edge cases ────────────────────────────

describe('parseShortlog edge cases', () => {
  test('handles single-line input without trailing newline', () => {
    const input = '  42\tAlice <alice@example.com>'
    const result = parseShortlog(input)
    expect(result).toHaveLength(1)
    expect(result[0]!.commits).toBe(42)
  })
})

// ─── parseLogStats edge cases ────────────────────────────

describe('parseLogStats edge cases', () => {
  test('handles multiple binary files', () => {
    const input = '2024-01-15T10:30:00+00:00\n\n-\t-\timage1.png\n-\t-\timage2.png\n'
    const result = parseLogStats(input)
    expect(result[0]!.files).toBe(2)
    expect(result[0]!.additions).toBe(0)
    expect(result[0]!.deletions).toBe(0)
  })
})

// ─── Command metadata ────────────────────────────────────

describe('GitStats command metadata', () => {
  test('command module can be imported', async () => {
    const mod = await import('../src/commands/gitstats.js')
    expect(mod.default).toBeDefined()
    expect(mod.default.description).toBe('Display git repository statistics dashboard')
  })

  test('command has correct flags', async () => {
    const mod = await import('../src/commands/gitstats.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.format).toBeDefined()
    expect(mod.default.flags.output).toBeDefined()
    expect(mod.default.flags.since).toBeDefined()
    expect(mod.default.flags.until).toBeDefined()
    expect(mod.default.flags.branch).toBeDefined()
    expect(mod.default.flags.verbose).toBeDefined()
  })

  test('command has correct args', async () => {
    const mod = await import('../src/commands/gitstats.js')
    expect(mod.default.args).toBeDefined()
    expect(mod.default.args.path).toBeDefined()
  })

  test('exports helper functions', async () => {
    const mod = await import('../src/commands/gitstats.js')
    expect(mod.buildGitStatsResult).toBeDefined()
    expect(typeof mod.buildGitStatsResult).toBe('function')
  })

  test('exports interfaces as types', async () => {
    const mod = await import('../src/commands/gitstats.js')
    // Type exports are compile-time only, verify re-exports exist
    expect(mod.formatGitStatsJson).toBeDefined()
    expect(mod.formatGitStatsTable).toBeDefined()
  })
})
