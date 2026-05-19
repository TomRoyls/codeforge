import { describe, expect, it, vi } from 'vitest'

import Heatmap from '../src/commands/heatmap.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

import { execSync } from 'node:child_process'

import {
  getCommitActivity,
  getDayName,
  getHeatLevel,
  getPeriodDates,
  groupByAuthor,
  groupByDay,
  groupByHour,
  type CommitEntry,
  type DayActivity,
  type HeatmapResult,
} from '../src/commands/heatmap-helpers.js'
import { formatHeatmapJson, formatHeatmapText } from '../src/commands/heatmap-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeCommit(overrides: Partial<CommitEntry> = {}): CommitEntry {
  return {
    author: 'Alice',
    timestamp: 1748736000, // 2025-06-01 00:00:00 UTC
    ...overrides,
  }
}

const baseTimestamp = 1748736000 // 2025-06-01 00:00:00 UTC

const sampleCommits: CommitEntry[] = [
  makeCommit({ author: 'Alice', timestamp: baseTimestamp }),        // Jun 1, 00:00
  makeCommit({ author: 'Alice', timestamp: baseTimestamp + 3600 }), // Jun 1, 01:00
  makeCommit({ author: 'Bob', timestamp: baseTimestamp + 7200 }),   // Jun 1, 02:00
  makeCommit({ author: 'Alice', timestamp: baseTimestamp + 86400 }), // Jun 2, 00:00
  makeCommit({ author: 'Charlie', timestamp: baseTimestamp + 86400 }), // Jun 2, 00:00
  makeCommit({ author: 'Bob', timestamp: baseTimestamp + 172800 }),  // Jun 3, 00:00
  makeCommit({ author: 'Alice', timestamp: baseTimestamp + 172800 + 3600 * 14 }), // Jun 3, 14:00
  makeCommit({ author: 'Alice', timestamp: baseTimestamp + 259200 }), // Jun 4, 00:00
  makeCommit({ author: 'Bob', timestamp: baseTimestamp + 259200 + 3600 * 23 }),   // Jun 4, 23:00
  makeCommit({ author: 'Charlie', timestamp: baseTimestamp + 345600 }), // Jun 5, 00:00
]

function makeHeatmapResult(overrides: Partial<HeatmapResult> = {}): HeatmapResult {
  const days = groupByDay(sampleCommits)
  const hours = groupByHour(sampleCommits)
  const authors = groupByAuthor(sampleCommits)
  return {
    authors,
    days,
    endDate: '2025-06-05',
    hours,
    period: 'month',
    startDate: '2025-05-06',
    totalCommits: sampleCommits.length,
    ...overrides,
  }
}

// ─── groupByDay ──────────────────────────────────────────

describe('groupByDay', () => {
  it('groups commits by date', () => {
    const result = groupByDay(sampleCommits)
    expect(result.length).toBe(5)
    expect(result[0]!.date).toBe('2025-06-01')
    expect(result[0]!.commits).toBe(3)
    expect(result[1]!.date).toBe('2025-06-02')
    expect(result[1]!.commits).toBe(2)
  })

  it('handles multiple commits on the same day', () => {
    const commits = [
      makeCommit({ timestamp: baseTimestamp }),
      makeCommit({ timestamp: baseTimestamp + 3600 }),
      makeCommit({ timestamp: baseTimestamp + 7200 }),
    ]
    const result = groupByDay(commits)
    expect(result.length).toBe(1)
    expect(result[0]!.commits).toBe(3)
  })

  it('handles empty input', () => {
    const result = groupByDay([])
    expect(result).toEqual([])
  })

  it('sorts results by date', () => {
    const commits = [
      makeCommit({ timestamp: baseTimestamp + 86400 }), // Jun 2
      makeCommit({ timestamp: baseTimestamp }),          // Jun 1
      makeCommit({ timestamp: baseTimestamp + 172800 }), // Jun 3
    ]
    const result = groupByDay(commits)
    expect(result[0]!.date).toBe('2025-06-01')
    expect(result[1]!.date).toBe('2025-06-02')
    expect(result[2]!.date).toBe('2025-06-03')
  })

  it('tracks per-author breakdown', () => {
    const result = groupByDay(sampleCommits)
    const jun1 = result[0]!
    expect(jun1.authors.get('Alice')).toBe(2)
    expect(jun1.authors.get('Bob')).toBe(1)
  })

  it('sets dayOfWeek correctly', () => {
    // 2025-06-01 is a Sunday (dayOfWeek = 0)
    const result = groupByDay([makeCommit({ timestamp: baseTimestamp })])
    expect(result[0]!.dayOfWeek).toBe(0)
  })

  it('handles single commit', () => {
    const result = groupByDay([makeCommit()])
    expect(result.length).toBe(1)
    expect(result[0]!.commits).toBe(1)
    expect(result[0]!.authors.get('Alice')).toBe(1)
  })
})

// ─── groupByHour ─────────────────────────────────────────

describe('groupByHour', () => {
  it('groups commits by hour', () => {
    const result = groupByHour(sampleCommits)
    // 00:00: base, +86400, +172800, +259200, +345600, +86400 (Bob Jun2) = 6 commits
    expect(result[0]!.commits).toBe(6)
    expect(result[1]!.commits).toBe(1) // 01:00
    expect(result[2]!.commits).toBe(1) // 02:00
  })

  it('returns all 24 hours even with no commits', () => {
    const result = groupByHour([])
    expect(result.length).toBe(24)
    for (const hour of result) {
      expect(hour.commits).toBe(0)
    }
  })

  it('handles empty input with all 24 hours', () => {
    const result = groupByHour([])
    expect(result.length).toBe(24)
    expect(result[0]!.hour).toBe(0)
    expect(result[23]!.hour).toBe(23)
  })

  it('counts correctly across hours', () => {
    const commits = [
      makeCommit({ timestamp: baseTimestamp }),       // 00:00
      makeCommit({ timestamp: baseTimestamp + 3600 }), // 01:00
      makeCommit({ timestamp: baseTimestamp + 3600 }), // 01:00
      makeCommit({ timestamp: baseTimestamp + 7200 }), // 02:00
    ]
    const result = groupByHour(commits)
    expect(result[0]!.commits).toBe(1)
    expect(result[1]!.commits).toBe(2)
    expect(result[2]!.commits).toBe(1)
    expect(result[3]!.commits).toBe(0)
  })

  it('sorts hours 0 through 23', () => {
    const result = groupByHour(sampleCommits)
    for (let i = 0; i < 24; i++) {
      expect(result[i]!.hour).toBe(i)
    }
  })

  it('handles late night commits (23:00)', () => {
    const commits = [makeCommit({ timestamp: baseTimestamp + 3600 * 23 })]
    const result = groupByHour(commits)
    expect(result[23]!.commits).toBe(1)
    expect(result[0]!.commits).toBe(0)
  })
})

// ─── groupByAuthor ───────────────────────────────────────

describe('groupByAuthor', () => {
  it('groups by author name', () => {
    const result = groupByAuthor(sampleCommits)
    const names = Array.from(result).map((a) => a.author)
    expect(names).toContain('Alice')
    expect(names).toContain('Bob')
    expect(names).toContain('Charlie')
  })

  it('tracks first and last commit dates', () => {
    const result = groupByAuthor(sampleCommits)
    const alice = result.find((a) => a.author === 'Alice')!
    expect(alice.firstCommit).toBe('2025-06-01')
    expect(alice.lastCommit).toBe('2025-06-04')
  })

  it('sorts by commit count descending', () => {
    const result = groupByAuthor(sampleCommits)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.commits).toBeGreaterThanOrEqual(result[i]!.commits)
    }
  })

  it('handles single author', () => {
    const commits = [
      makeCommit({ author: 'Alice', timestamp: baseTimestamp }),
      makeCommit({ author: 'Alice', timestamp: baseTimestamp + 86400 }),
    ]
    const result = groupByAuthor(commits)
    expect(result.length).toBe(1)
    expect(result[0]!.author).toBe('Alice')
    expect(result[0]!.commits).toBe(2)
  })

  it('handles empty input', () => {
    const result = groupByAuthor([])
    expect(result).toEqual([])
  })

  it('correctly counts per-author commits', () => {
    const result = groupByAuthor(sampleCommits)
    const alice = result.find((a) => a.author === 'Alice')!
    expect(alice.commits).toBe(5)
  })
})

// ─── getDayName ──────────────────────────────────────────

describe('getDayName', () => {
  it('returns Sun for 0', () => {
    expect(getDayName(0)).toBe('Sun')
  })

  it('returns Mon for 1', () => {
    expect(getDayName(1)).toBe('Mon')
  })

  it('returns Tue for 2', () => {
    expect(getDayName(2)).toBe('Tue')
  })

  it('returns Wed for 3', () => {
    expect(getDayName(3)).toBe('Wed')
  })

  it('returns Thu for 4', () => {
    expect(getDayName(4)).toBe('Thu')
  })

  it('returns Fri for 5', () => {
    expect(getDayName(5)).toBe('Fri')
  })

  it('returns Sat for 6', () => {
    expect(getDayName(6)).toBe('Sat')
  })

  it('returns ??? for invalid input', () => {
    expect(getDayName(7)).toBe('???')
    expect(getDayName(-1)).toBe('???')
  })
})

// ─── getHeatLevel ────────────────────────────────────────

describe('getHeatLevel', () => {
  it('returns 0 for zero commits', () => {
    expect(getHeatLevel(0, 10)).toBe(0)
  })

  it('returns 0 for zero max', () => {
    expect(getHeatLevel(0, 0)).toBe(0)
  })

  it('returns 4 for max commits', () => {
    expect(getHeatLevel(10, 10)).toBe(4)
  })

  it('returns 4 when count exceeds max', () => {
    expect(getHeatLevel(15, 10)).toBe(4)
  })

  it('returns 1 for low activity (0-25%)', () => {
    expect(getHeatLevel(1, 10)).toBe(1)
    expect(getHeatLevel(2, 10)).toBe(1)
  })

  it('returns 2 for moderate activity (25-50%)', () => {
    expect(getHeatLevel(3, 10)).toBe(2)
    expect(getHeatLevel(4, 10)).toBe(2)
  })

  it('returns 3 for high activity (50-75%)', () => {
    expect(getHeatLevel(5, 10)).toBe(3)
    expect(getHeatLevel(6, 10)).toBe(3)
    expect(getHeatLevel(7, 10)).toBe(3)
  })

  it('returns 4 for very high activity (75%+)', () => {
    expect(getHeatLevel(8, 10)).toBe(4)
    expect(getHeatLevel(9, 10)).toBe(4)
  })

  it('handles single commit as max', () => {
    expect(getHeatLevel(1, 1)).toBe(4)
  })
})

// ─── getPeriodDates ──────────────────────────────────────

describe('getPeriodDates', () => {
  it('returns startDate before endDate', () => {
    const { startDate, endDate } = getPeriodDates('month')
    expect(startDate < endDate).toBe(true)
  })

  it('week period has 7 day span', () => {
    const { startDate, endDate } = getPeriodDates('week')
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
    expect(diffDays).toBe(7)
  })

  it('year period has 365 day span', () => {
    const { startDate, endDate } = getPeriodDates('year')
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
    expect(diffDays).toBe(365)
  })

  it('defaults to month for unknown period', () => {
    const { startDate, endDate } = getPeriodDates('unknown')
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
    expect(diffDays).toBe(30)
  })
})

// ─── getCommitActivity ───────────────────────────────────

describe('getCommitActivity', () => {
  it('returns empty array on execSync failure', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repo')
    })
    const result = getCommitActivity('/tmp/nonexistent', 'month')
    expect(result).toEqual([])
  })

  it('returns empty array for empty output', () => {
    vi.mocked(execSync).mockReturnValue('')
    const result = getCommitActivity('/tmp/test', 'month')
    expect(result).toEqual([])
  })

  it('parses git log output correctly', () => {
    vi.mocked(execSync).mockReturnValue('1748736000|Alice\n1748739600|Bob\n')
    const result = getCommitActivity('/tmp/test', 'month')
    expect(result.length).toBe(2)
    expect(result[0]!.author).toBe('Alice')
    expect(result[1]!.author).toBe('Bob')
  })

  it('skips malformed lines', () => {
    vi.mocked(execSync).mockReturnValue('notanumber|Alice\n1748736000|Bob\n')
    const result = getCommitActivity('/tmp/test', 'month')
    expect(result.length).toBe(1)
    expect(result[0]!.author).toBe('Bob')
  })

  it('adds author filter when provided', () => {
    vi.mocked(execSync).mockClear()
    vi.mocked(execSync).mockReturnValue('1748736000|Alice\n')
    getCommitActivity('/tmp/test', 'month', 'Alice')
    const calledWith = vi.mocked(execSync).mock.calls[0]![0] as string
    expect(calledWith).toContain('--author="Alice"')
  })
})

// ─── formatHeatmapText ───────────────────────────────────

describe('formatHeatmapText', () => {
  it('shows daily view by default', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: false, byHour: false })
    expect(text).toContain('Commit Activity Heatmap')
    expect(text).toContain('Summary')
    expect(text).toContain('Total commits')
  })

  it('shows no commits message for empty days', () => {
    const result = makeHeatmapResult({ days: [], totalCommits: 0 })
    const text = formatHeatmapText(result, { byAuthor: false, byHour: false })
    expect(text).toContain('No commits found')
  })

  it('shows hourly view with byHour flag', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: false, byHour: true })
    expect(text).toContain('Hourly Commit Distribution')
    expect(text).toContain('00:00')
    expect(text).toContain('23:00')
  })

  it('shows author view with byAuthor flag', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: true, byHour: false })
    expect(text).toContain('Commit Activity by Author')
    expect(text).toContain('Alice')
    expect(text).toContain('Bob')
  })

  it('shows no commits in author view for empty data', () => {
    const result = makeHeatmapResult({ authors: [], totalCommits: 0 })
    const text = formatHeatmapText(result, { byAuthor: true, byHour: false })
    expect(text).toContain('No commits found')
  })

  it('includes peak hour in hourly summary', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: false, byHour: true })
    expect(text).toContain('Peak hour')
  })

  it('includes most active day in daily summary', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: false, byHour: false })
    expect(text).toContain('Most active day')
  })

  it('includes legend in daily view', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: false, byHour: false })
    expect(text).toContain('Less')
    expect(text).toContain('More')
  })

  it('includes contributor count in author view', () => {
    const result = makeHeatmapResult()
    const text = formatHeatmapText(result, { byAuthor: true, byHour: false })
    expect(text).toContain('Contributors')
  })
})

// ─── formatHeatmapJson ───────────────────────────────────

describe('formatHeatmapJson', () => {
  it('produces valid JSON', () => {
    const result = makeHeatmapResult()
    const json = formatHeatmapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.totalCommits).toBe(sampleCommits.length)
  })

  it('includes all required fields', () => {
    const result = makeHeatmapResult()
    const json = formatHeatmapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('days')
    expect(parsed).toHaveProperty('hours')
    expect(parsed).toHaveProperty('authors')
    expect(parsed).toHaveProperty('totalCommits')
    expect(parsed).toHaveProperty('period')
    expect(parsed).toHaveProperty('startDate')
    expect(parsed).toHaveProperty('endDate')
  })

  it('serializes author maps as objects', () => {
    const result = makeHeatmapResult()
    const json = formatHeatmapJson(result)
    const parsed = JSON.parse(json)
    const firstDay = parsed.days[0]
    expect(typeof firstDay.authors).toBe('object')
    expect(firstDay.authors).not.toBeNull()
  })

  it('preserves hour data for all 24 hours', () => {
    const result = makeHeatmapResult()
    const json = formatHeatmapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.hours.length).toBe(24)
  })
})

// ─── Command metadata ────────────────────────────────────

describe('Heatmap command', () => {
  it('has correct description', () => {
    expect(Heatmap.description).toBe('Show git commit activity heatmap')
  })

  it('has examples defined', () => {
    expect(Heatmap.examples).toBeDefined()
    expect(Heatmap.examples!.length).toBeGreaterThan(0)
  })

  it('has period flag with correct options', () => {
    const periodFlag = Heatmap.flags!.period
    expect(periodFlag).toBeDefined()
  })

  it('has format flag with text and json options', () => {
    const formatFlag = Heatmap.flags!.format
    expect(formatFlag).toBeDefined()
  })

  it('has author filter flag', () => {
    const authorFlag = Heatmap.flags!.author
    expect(authorFlag).toBeDefined()
  })

  it('has by-hour flag', () => {
    const byHourFlag = Heatmap.flags!['by-hour']
    expect(byHourFlag).toBeDefined()
  })

  it('has by-author flag', () => {
    const byAuthorFlag = Heatmap.flags!['by-author']
    expect(byAuthorFlag).toBeDefined()
  })

  it('has output flag', () => {
    const outputFlag = Heatmap.flags!.output
    expect(outputFlag).toBeDefined()
  })
})
