import { describe, expect, it } from 'vitest'

import {
  analyzeCommitTiming,
  buildAlmanacResult,
  buildSeasonCharacteristics,
  buildSegment,
  classifyCommitAction,
  classifyMonthActivity,
  computeAlmanacStats,
  computeConsistency,
  detectRhythms,
  detectSeasons,
  findUpcomingSeason,
  formatHour,
  generateAlmanacRecommendations,
  generatePredictions,
  getSeasonalPrefix,
  groupMonthSegments,
  parseAlmanacLog,
  type LogEntry,
} from '../src/commands/almanac-helpers.js'

import {
  extractSeasonType,
  formatActionBadge,
  formatActivityMap,
  formatAlmanacJSON,
  formatAlmanacStats,
  formatAlmanacTable,
  formatConfidenceMeter,
  formatHourlyChart,
  formatPredictionCards,
  formatRecommendations,
  formatRhythmSummary,
  formatSeasonTable,
  formatWeeklyChart,
  getSeasonColor,
} from '../src/commands/almanac-format-helpers.js'

// ─── parseAlmanacLog ──────────────────────────────────────────────────────────

describe('parseAlmanacLog', () => {
  it('parses valid git log entries', () => {
    const log = 'abc123|2025-03-15 10:30:00 +0100|feat: add login|10|5\ndef456|2025-03-14 14:00:00 +0100|fix: typo|2|1'
    const entries = parseAlmanacLog(log)
    expect(entries).toHaveLength(2)
    expect(entries[0]!.hash).toBe('abc123')
    expect(entries[0]!.message).toBe('feat: add login')
    expect(entries[0]!.insertions).toBe(10)
    expect(entries[0]!.deletions).toBe(5)
    expect(entries[1]!.hash).toBe('def456')
  })

  it('returns empty for empty input', () => {
    expect(parseAlmanacLog('')).toHaveLength(0)
    expect(parseAlmanacLog('   ')).toHaveLength(0)
  })

  it('skips malformed lines', () => {
    const log = 'abc|2025-01-01|msg|5\nbadline\nxyz|2025-01-02|msg2|3|2'
    const entries = parseAlmanacLog(log)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.hash).toBe('xyz')
  })

  it('handles entries with zero insertions/deletions', () => {
    const log = 'a1|2025-01-01 00:00:00|init|0|0'
    const entries = parseAlmanacLog(log)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.insertions).toBe(0)
    expect(entries[0]!.deletions).toBe(0)
  })
})

// ─── analyzeCommitTiming ──────────────────────────────────────────────────────

describe('analyzeCommitTiming', () => {
  it('computes day-of-week distribution', () => {
    // 2025-03-15 is a Saturday (6)
    const entries: LogEntry[] = [
      { hash: 'a', date: '2025-03-15 10:00:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'b', date: '2025-03-15 11:00:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'c', date: '2025-03-17 09:00:00', message: 'test', insertions: 1, deletions: 0 }, // Monday
    ]
    const timing = analyzeCommitTiming(entries)
    expect(timing.commitsByDayOfWeek[6]).toBe(2) // Saturday
    expect(timing.commitsByDayOfWeek[1]).toBe(1) // Monday
    expect(timing.totalCommits).toBe(3)
  })

  it('computes hourly distribution', () => {
    const entries: LogEntry[] = [
      { hash: 'a', date: '2025-01-01 10:00:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'b', date: '2025-01-01 10:30:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'c', date: '2025-01-01 14:00:00', message: 'test', insertions: 1, deletions: 0 },
    ]
    const timing = analyzeCommitTiming(entries)
    expect(timing.commitsByHour[10]).toBe(2)
    expect(timing.commitsByHour[14]).toBe(1)
  })

  it('computes monthly distribution', () => {
    const entries: LogEntry[] = [
      { hash: 'a', date: '2025-01-15 10:00:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'b', date: '2025-01-20 10:00:00', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'c', date: '2025-06-10 10:00:00', message: 'test', insertions: 1, deletions: 0 },
    ]
    const timing = analyzeCommitTiming(entries)
    expect(timing.commitsByMonth[0]).toBe(2) // January
    expect(timing.commitsByMonth[5]).toBe(1) // June
  })

  it('handles empty entries', () => {
    const timing = analyzeCommitTiming([])
    expect(timing.totalCommits).toBe(0)
    expect(timing.commitsByDayOfWeek.every((c) => c === 0)).toBe(true)
  })

  it('skips invalid dates', () => {
    const entries: LogEntry[] = [
      { hash: 'a', date: 'invalid', message: 'test', insertions: 1, deletions: 0 },
      { hash: 'b', date: '2025-01-01 10:00:00', message: 'test', insertions: 1, deletions: 0 },
    ]
    const timing = analyzeCommitTiming(entries)
    expect(timing.totalCommits).toBe(2)
    expect(timing.commitsByMonth[0]).toBe(1)
  })
})

// ─── classifyCommitAction ─────────────────────────────────────────────────────

describe('classifyCommitAction', () => {
  it('classifies feature commits', () => {
    expect(classifyCommitAction('feat: add login')).toBe('feature')
    expect(classifyCommitAction('feature: new dashboard')).toBe('feature')
    expect(classifyCommitAction('add new endpoint')).toBe('feature')
  })

  it('classifies fix commits', () => {
    expect(classifyCommitAction('fix: null pointer')).toBe('fix')
    expect(classifyCommitAction('bug: crash on load')).toBe('fix')
    expect(classifyCommitAction('patch security issue')).toBe('fix')
  })

  it('classifies refactor commits', () => {
    expect(classifyCommitAction('refactor: simplify auth')).toBe('refactor')
    expect(classifyCommitAction('migrate to new API')).toBe('refactor')
  })

  it('classifies test commits', () => {
    expect(classifyCommitAction('test: add unit tests')).toBe('test')
    expect(classifyCommitAction('spec: update expectations')).toBe('test')
    expect(classifyCommitAction('increase coverage')).toBe('test')
  })

  it('classifies docs commits', () => {
    expect(classifyCommitAction('docs: update README')).toBe('docs')
    expect(classifyCommitAction('documentation: add API docs')).toBe('docs')
  })

  it('classifies chore commits', () => {
    expect(classifyCommitAction('chore: update deps')).toBe('chore')
    expect(classifyCommitAction('update CI config')).toBe('chore')
  })
})

// ─── classifyMonthActivity ────────────────────────────────────────────────────

describe('classifyMonthActivity', () => {
  const threshold = 10

  it('classifies high activity as harvest', () => {
    expect(classifyMonthActivity(20, 10, threshold)).toBe('harvest')
  })

  it('classifies low activity as fallow', () => {
    expect(classifyMonthActivity(2, 10, threshold)).toBe('fallow')
  })

  it('classifies growing activity as planting', () => {
    expect(classifyMonthActivity(8, 5, threshold)).toBe('planting')
  })

  it('classifies declining activity as storage', () => {
    expect(classifyMonthActivity(8, 12, threshold)).toBe('storage')
  })
})

// ─── getSeasonalPrefix ────────────────────────────────────────────────────────

describe('getSeasonalPrefix', () => {
  it('returns Spring for Mar-May', () => {
    expect(getSeasonalPrefix(2)).toBe('Spring')
    expect(getSeasonalPrefix(3)).toBe('Spring')
    expect(getSeasonalPrefix(4)).toBe('Spring')
  })

  it('returns Summer for Jun-Aug', () => {
    expect(getSeasonalPrefix(5)).toBe('Summer')
    expect(getSeasonalPrefix(6)).toBe('Summer')
    expect(getSeasonalPrefix(7)).toBe('Summer')
  })

  it('returns Autumn for Sep-Nov', () => {
    expect(getSeasonalPrefix(8)).toBe('Autumn')
    expect(getSeasonalPrefix(9)).toBe('Autumn')
    expect(getSeasonalPrefix(10)).toBe('Autumn')
  })

  it('returns Winter for Dec-Feb', () => {
    expect(getSeasonalPrefix(0)).toBe('Winter')
    expect(getSeasonalPrefix(1)).toBe('Winter')
    expect(getSeasonalPrefix(11)).toBe('Winter')
  })
})

// ─── buildSeasonCharacteristics ───────────────────────────────────────────────

describe('buildSeasonCharacteristics', () => {
  it('builds harvest characteristics', () => {
    const chars = buildSeasonCharacteristics('harvest', [3, 4], 50, 20)
    expect(chars).toContain('High development activity')
    expect(chars).toContain('25 commits/month')
  })

  it('builds fallow characteristics', () => {
    const chars = buildSeasonCharacteristics('fallow', [0, 1], 5, 20)
    expect(chars).toContain('Low development activity')
    expect(chars).toContain('Good time for planning')
  })

  it('builds planting characteristics', () => {
    const chars = buildSeasonCharacteristics('planting', [2], 15, 20)
    expect(chars).toContain('Growing activity')
    expect(chars).toContain('New features likely being started')
  })

  it('builds storage characteristics', () => {
    const chars = buildSeasonCharacteristics('storage', [10], 12, 20)
    expect(chars).toContain('Declining activity')
    expect(chars).toContain('Stabilization period')
  })

  it('adds peak characteristic for very high activity', () => {
    const chars = buildSeasonCharacteristics('harvest', [3], 100, 20)
    expect(chars).toContain('Peak development period')
  })

  it('adds dormant characteristic for very low activity', () => {
    const chars = buildSeasonCharacteristics('fallow', [0], 3, 20)
    expect(chars).toContain('Near-dormant period')
  })
})

// ─── buildSegment ─────────────────────────────────────────────────────────────

describe('buildSegment', () => {
  it('builds harvest segment with seasonal prefix', () => {
    const seg = buildSegment([5, 6], 'harvest', [0, 0, 0, 0, 0, 10, 15, 0, 0, 0, 0, 0])
    expect(seg.type).toBe('harvest')
    expect(seg.name).toContain('Summer')
    expect(seg.name).toContain('Harvest Season')
  })

  it('builds fallow segment', () => {
    const seg = buildSegment([0, 1], 'fallow', [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(seg.type).toBe('fallow')
    expect(seg.name).toContain('Winter')
    expect(seg.name).toContain('Fallow Season')
  })
})

// ─── groupMonthSegments ───────────────────────────────────────────────────────

describe('groupMonthSegments', () => {
  it('groups months into segments', () => {
    const commits = [2, 2, 5, 15, 20, 18, 10, 3, 2, 2, 3, 2]
    const segments = groupMonthSegments(commits, 8)
    expect(segments.length).toBeGreaterThanOrEqual(2)
  })

  it('returns at least one segment', () => {
    const segments = groupMonthSegments([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1)
    expect(segments.length).toBeGreaterThanOrEqual(1)
  })

  it('detects harvest months correctly', () => {
    const commits = [2, 2, 2, 2, 20, 20, 2, 2, 2, 2, 2, 2]
    const segments = groupMonthSegments(commits, 5)
    const harvest = segments.find((s) => s.type === 'harvest')
    expect(harvest).toBeDefined()
    expect(harvest!.months).toContain(4)
    expect(harvest!.months).toContain(5)
  })
})

// ─── detectSeasons ────────────────────────────────────────────────────────────

describe('detectSeasons', () => {
  it('detects seasons from monthly data', () => {
    const monthlyCommits = [2, 2, 5, 15, 20, 18, 10, 3, 2, 2, 3, 2]
    const entries: LogEntry[] = monthlyCommits.flatMap((count, month) =>
      Array.from({ length: count }, (_, i) => ({
        hash: `${month}-${i}`,
        date: `2025-${String(month + 1).padStart(2, '0')}-15 10:00:00`,
        message: 'feat: add feature',
        insertions: 10,
        deletions: 0,
      })),
    )
    const seasons = detectSeasons(monthlyCommits, entries)
    expect(seasons.length).toBeGreaterThanOrEqual(2)
  })

  it('assigns dominant action correctly', () => {
    const monthlyCommits = [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0]
    const entries: LogEntry[] = Array.from({ length: 10 }, (_, i) => ({
      hash: `h${i}`,
      date: `2025-04-${String(i + 1).padStart(2, '0')} 10:00:00`,
      message: 'fix: bug fix',
      insertions: 5,
      deletions: 2,
    }))
    const seasons = detectSeasons(monthlyCommits, entries)
    expect(seasons.some((s) => s.dominantAction === 'fix')).toBe(true)
  })

  it('handles all-zero months', () => {
    const seasons = detectSeasons([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [])
    expect(seasons.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── computeConsistency ───────────────────────────────────────────────────────

describe('computeConsistency', () => {
  it('returns 100 for perfect consistency', () => {
    expect(computeConsistency([10, 10, 10, 10])).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(computeConsistency([])).toBe(0)
  })

  it('returns 100 for single value', () => {
    expect(computeConsistency([42])).toBe(100)
  })

  it('returns lower consistency for variable data', () => {
    const consistency = computeConsistency([1, 50, 1, 50])
    expect(consistency).toBeLessThan(50)
  })

  it('returns 0 for all zeros', () => {
    expect(computeConsistency([0, 0, 0, 0])).toBe(0)
  })

  it('returns high consistency for slight variation', () => {
    const consistency = computeConsistency([10, 11, 10, 10, 9])
    expect(consistency).toBeGreaterThan(80)
  })
})

// ─── formatHour ───────────────────────────────────────────────────────────────

describe('formatHour', () => {
  it('formats midnight', () => {
    expect(formatHour(0)).toBe('12 AM')
  })

  it('formats morning hours', () => {
    expect(formatHour(6)).toBe('6 AM')
    expect(formatHour(11)).toBe('11 AM')
  })

  it('formats noon', () => {
    expect(formatHour(12)).toBe('12 PM')
  })

  it('formats afternoon hours', () => {
    expect(formatHour(13)).toBe('1 PM')
    expect(formatHour(23)).toBe('11 PM')
  })
})

// ─── detectRhythms ────────────────────────────────────────────────────────────

describe('detectRhythms', () => {
  it('detects weekly rhythm', () => {
    const timing = {
      commitsByDayOfWeek: [5, 20, 5, 5, 5, 5, 5],
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: new Array(12).fill(10),
      totalCommits: 50,
    }
    const rhythms = detectRhythms(timing)
    const weekly = rhythms.find((r) => r.type === 'weekly')
    expect(weekly).toBeDefined()
    expect(weekly!.peakDay).toBe(1)
    expect(weekly!.description).toContain('Monday')
  })

  it('detects daily rhythm', () => {
    const byHour = new Array(24).fill(1)
    byHour[14] = 30
    const timing = {
      commitsByDayOfWeek: new Array(7).fill(5),
      commitsByHour: byHour,
      commitsByMonth: new Array(12).fill(10),
      totalCommits: 50,
    }
    const rhythms = detectRhythms(timing)
    const daily = rhythms.find((r) => r.type === 'daily')
    expect(daily).toBeDefined()
    expect(daily!.peakHour).toBe(14)
    expect(daily!.description).toContain('2 PM')
  })

  it('detects monthly rhythm', () => {
    const byMonth = new Array(12).fill(5)
    byMonth[5] = 50
    const timing = {
      commitsByDayOfWeek: new Array(7).fill(5),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: byMonth,
      totalCommits: 50,
    }
    const rhythms = detectRhythms(timing)
    const monthly = rhythms.find((r) => r.type === 'monthly')
    expect(monthly).toBeDefined()
    expect(monthly!.description).toContain('June')
  })

  it('detects quarterly rhythm', () => {
    const byMonth = [0, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0]
    const timing = {
      commitsByDayOfWeek: new Array(7).fill(5),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: byMonth,
      totalCommits: 50,
    }
    const rhythms = detectRhythms(timing)
    const quarterly = rhythms.find((r) => r.type === 'quarterly')
    expect(quarterly).toBeDefined()
    expect(quarterly!.description).toContain('Q2')
  })

  it('returns empty for all-zero data', () => {
    const timing = {
      commitsByDayOfWeek: new Array(7).fill(0),
      commitsByHour: new Array(24).fill(0),
      commitsByMonth: new Array(12).fill(0),
      totalCommits: 0,
    }
    expect(detectRhythms(timing)).toHaveLength(0)
  })
})

// ─── generatePredictions ──────────────────────────────────────────────────────

describe('generatePredictions', () => {
  it('generates activity prediction', () => {
    const seasons = [{ name: 'Test Season', months: [0, 1], commitCount: 10, avgChangesPerCommit: 5, dominantAction: 'feature' as const, characteristics: [] }]
    const rhythms: import('../src/commands/almanac-helpers.js').Rhythm[] = []
    const stats = {
      totalCommits: 120,
      commitsByDayOfWeek: new Array(7).fill(10),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: new Array(12).fill(10),
      mostActiveDay: 'Tuesday',
      mostActiveHour: '10 AM',
      mostActiveMonth: 'June',
      avgCommitsPerDay: 5,
      busiestSeason: 'Test Season',
      quietestSeason: 'Test Season',
    }
    const predictions = generatePredictions(seasons, rhythms, stats)
    expect(predictions.length).toBeGreaterThanOrEqual(1)
    expect(predictions[0]!.category).toBe('activity')
  })

  it('includes productivity prediction with weekly rhythm', () => {
    const seasons: import('../src/commands/almanac-helpers.js').Season[] = []
    const rhythms: import('../src/commands/almanac-helpers.js').Rhythm[] = [{
      type: 'weekly',
      peakDay: 2,
      peakHour: 0,
      consistency: 80,
      description: 'Tuesday is the most active day',
    }]
    const stats = {
      totalCommits: 100,
      commitsByDayOfWeek: new Array(7).fill(10),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: new Array(12).fill(10),
      mostActiveDay: 'Tuesday',
      mostActiveHour: '10 AM',
      mostActiveMonth: 'June',
      avgCommitsPerDay: 5,
      busiestSeason: 'None',
      quietestSeason: 'None',
    }
    const predictions = generatePredictions(seasons, rhythms, stats)
    const prod = predictions.find((p) => p.category === 'productivity')
    expect(prod).toBeDefined()
    expect(prod!.prediction).toContain('Tuesday')
  })

  it('includes timing prediction with daily rhythm', () => {
    const rhythms: import('../src/commands/almanac-helpers.js').Rhythm[] = [{
      type: 'daily',
      peakDay: 0,
      peakHour: 14,
      consistency: 75,
      description: 'Peak at 2 PM',
    }]
    const stats = {
      totalCommits: 50,
      commitsByDayOfWeek: new Array(7).fill(5),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: new Array(12).fill(5),
      mostActiveDay: 'Monday',
      mostActiveHour: '2 PM',
      mostActiveMonth: 'January',
      avgCommitsPerDay: 3,
      busiestSeason: 'None',
      quietestSeason: 'None',
    }
    const predictions = generatePredictions([], rhythms, stats)
    const timing = predictions.find((p) => p.category === 'timing')
    expect(timing).toBeDefined()
    expect(timing!.prediction).toContain('2 PM')
  })
})

// ─── findUpcomingSeason ───────────────────────────────────────────────────────

describe('findUpcomingSeason', () => {
  it('finds matching season', () => {
    const seasons = [
      { name: 'A', months: [0, 1], commitCount: 10, avgChangesPerCommit: 5, dominantAction: 'feature' as const, characteristics: [] },
      { name: 'B', months: [5, 6], commitCount: 20, avgChangesPerCommit: 8, dominantAction: 'fix' as const, characteristics: [] },
    ]
    expect(findUpcomingSeason(seasons, 5)?.name).toBe('B')
  })

  it('returns undefined when no match', () => {
    const seasons = [
      { name: 'A', months: [0, 1], commitCount: 10, avgChangesPerCommit: 5, dominantAction: 'feature' as const, characteristics: [] },
    ]
    expect(findUpcomingSeason(seasons, 11)).toBeUndefined()
  })
})

// ─── computeAlmanacStats ──────────────────────────────────────────────────────

describe('computeAlmanacStats', () => {
  it('computes all stats correctly', () => {
    const timing = {
      commitsByDayOfWeek: [1, 2, 3, 4, 5, 6, 7],
      commitsByHour: new Array(24).fill(0).map((_, i) => i === 14 ? 50 : 1),
      commitsByMonth: [5, 5, 5, 5, 5, 50, 5, 5, 5, 5, 5, 5],
      totalCommits: 100,
    }
    const seasons = [
      { name: 'Busy Season', months: [5], commitCount: 50, avgChangesPerCommit: 10, dominantAction: 'feature' as const, characteristics: [] },
      { name: 'Slow Season', months: [0], commitCount: 5, avgChangesPerCommit: 2, dominantAction: 'chore' as const, characteristics: [] },
    ]
    const stats = computeAlmanacStats(timing, seasons)
    expect(stats.totalCommits).toBe(100)
    expect(stats.mostActiveDay).toBe('Saturday')
    expect(stats.mostActiveHour).toBe('2 PM')
    expect(stats.mostActiveMonth).toBe('June')
    expect(stats.busiestSeason).toBe('Busy Season')
    expect(stats.quietestSeason).toBe('Slow Season')
  })

  it('handles empty data', () => {
    const timing = {
      commitsByDayOfWeek: new Array(7).fill(0),
      commitsByHour: new Array(24).fill(0),
      commitsByMonth: new Array(12).fill(0),
      totalCommits: 0,
    }
    const stats = computeAlmanacStats(timing, [])
    expect(stats.totalCommits).toBe(0)
    expect(stats.avgCommitsPerDay).toBe(0)
  })
})

// ─── generateAlmanacRecommendations ──────────────────────────────────────────

describe('generateAlmanacRecommendations', () => {
  it('recommends review scheduling for peak periods', () => {
    const seasons = [{
      name: 'Harvest',
      months: [5, 6],
      commitCount: 50,
      avgChangesPerCommit: 10,
      dominantAction: 'feature' as const,
      characteristics: ['Peak development period'],
    }]
    const recs = generateAlmanacRecommendations(seasons, [], {
      totalCommits: 50, commitsByDayOfWeek: new Array(7).fill(5),
      commitsByHour: new Array(24).fill(1), commitsByMonth: new Array(12).fill(5),
      mostActiveDay: 'Monday', mostActiveHour: '10 AM', mostActiveMonth: 'June',
      avgCommitsPerDay: 3, busiestSeason: 'Harvest', quietestSeason: 'Harvest',
    })
    expect(recs.some((r) => r.includes('code reviews'))).toBe(true)
  })

  it('recommends refactoring during slow periods', () => {
    const seasons = [{
      name: 'Fallow',
      months: [0, 1],
      commitCount: 2,
      avgChangesPerCommit: 1,
      dominantAction: 'chore' as const,
      characteristics: ['Low development activity'],
    }]
    const recs = generateAlmanacRecommendations(seasons, [], {
      totalCommits: 10, commitsByDayOfWeek: new Array(7).fill(1),
      commitsByHour: new Array(24).fill(1), commitsByMonth: new Array(12).fill(1),
      mostActiveDay: 'Monday', mostActiveHour: '10 AM', mostActiveMonth: 'Jan',
      avgCommitsPerDay: 1, busiestSeason: 'Fallow', quietestSeason: 'Fallow',
    })
    expect(recs.some((r) => r.includes('refactoring'))).toBe(true)
  })

  it('recommends release planning with weekly rhythm', () => {
    const rhythms: import('../src/commands/almanac-helpers.js').Rhythm[] = [{
      type: 'weekly', peakDay: 2, peakHour: 0, consistency: 80,
      description: 'Tuesday is most active',
    }]
    const recs = generateAlmanacRecommendations([], rhythms, {
      totalCommits: 10, commitsByDayOfWeek: new Array(7).fill(1),
      commitsByHour: new Array(24).fill(1), commitsByMonth: new Array(12).fill(1),
      mostActiveDay: 'Tuesday', mostActiveHour: '10 AM', mostActiveMonth: 'Jan',
      avgCommitsPerDay: 1, busiestSeason: 'None', quietestSeason: 'None',
    })
    expect(recs.some((r) => r.includes('releases'))).toBe(true)
  })

  it('warns about high daily rate', () => {
    const recs = generateAlmanacRecommendations([], [], {
      totalCommits: 100, commitsByDayOfWeek: new Array(7).fill(15),
      commitsByHour: new Array(24).fill(5), commitsByMonth: new Array(12).fill(10),
      mostActiveDay: 'Monday', mostActiveHour: '10 AM', mostActiveMonth: 'June',
      avgCommitsPerDay: 15, busiestSeason: 'None', quietestSeason: 'None',
    })
    expect(recs.some((r) => r.includes('review capacity'))).toBe(true)
  })

  it('provides healthy message when nothing to flag', () => {
    const recs = generateAlmanacRecommendations([], [], {
      totalCommits: 10, commitsByDayOfWeek: new Array(7).fill(2),
      commitsByHour: new Array(24).fill(1), commitsByMonth: new Array(12).fill(1),
      mostActiveDay: 'Monday', mostActiveHour: '10 AM', mostActiveMonth: 'June',
      avgCommitsPerDay: 2, busiestSeason: 'None', quietestSeason: 'None',
    })
    expect(recs).toContain('Development patterns look healthy and consistent')
  })
})

// ─── buildAlmanacResult ───────────────────────────────────────────────────────

describe('buildAlmanacResult', () => {
  it('builds complete result from git log', () => {
    const log = [
      'a1|2025-06-15 10:00:00 +0100|feat: add login|10|5',
      'a2|2025-06-14 14:00:00 +0100|feat: add signup|15|3',
      'b1|2025-03-10 09:00:00 +0100|fix: crash|3|8',
    ].join('\n')
    const result = buildAlmanacResult(log)
    expect(result.stats.totalCommits).toBe(3)
    expect(result.seasons.length).toBeGreaterThanOrEqual(1)
    expect(result.rhythms.length).toBeGreaterThanOrEqual(1)
    expect(result.predictions.length).toBeGreaterThanOrEqual(1)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty git log', () => {
    const result = buildAlmanacResult('')
    expect(result.stats.totalCommits).toBe(0)
    expect(result.seasons.length).toBeGreaterThanOrEqual(1)
    expect(result.rhythms).toHaveLength(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('extractSeasonType', () => {
  it('extracts types from names', () => {
    expect(extractSeasonType('Summer Harvest Season')).toBe('harvest')
    expect(extractSeasonType('Winter Fallow Season')).toBe('fallow')
    expect(extractSeasonType('Spring Planting Season')).toBe('planting')
    expect(extractSeasonType('Autumn Storage Season')).toBe('storage')
    expect(extractSeasonType('Unknown Season')).toBe('fallow')
  })
})

describe('formatActionBadge', () => {
  it('formats badge for each action', () => {
    expect(formatActionBadge('feature')).toContain('FEATURE')
    expect(formatActionBadge('fix')).toContain('FIX')
    expect(formatActionBadge('refactor')).toContain('REFACTOR')
  })
})

describe('formatConfidenceMeter', () => {
  it('formats meter with correct length', () => {
    const meter = formatConfidenceMeter(75)
    expect(meter).toContain('█')
    expect(meter).toContain('░')
    expect(meter).toContain('75%')
  })

  it('handles 0 confidence', () => {
    const meter = formatConfidenceMeter(0)
    expect(meter).toContain('0%')
  })

  it('handles 100 confidence', () => {
    const meter = formatConfidenceMeter(100)
    expect(meter).toContain('100%')
  })
})

describe('formatActivityMap', () => {
  it('renders 12 month rows', () => {
    const map = formatActivityMap([5, 10, 15, 20, 25, 30, 25, 20, 15, 10, 5, 0])
    expect(map).toContain('January')
    expect(map).toContain('December')
    expect(map).toContain('Monthly Activity Map')
  })
})

describe('formatWeeklyChart', () => {
  it('renders 7 day rows', () => {
    const chart = formatWeeklyChart([10, 20, 15, 10, 25, 5, 3])
    expect(chart).toContain('Mon')
    expect(chart).toContain('Sun')
    expect(chart).toContain('Weekly Rhythm')
  })
})

describe('formatHourlyChart', () => {
  it('renders 24 hour rows', () => {
    const byHour = new Array(24).fill(5)
    byHour[14] = 50
    const chart = formatHourlyChart(byHour)
    expect(chart).toContain('Daily Rhythm')
    expect(chart).toContain('50')
  })
})

describe('formatSeasonTable', () => {
  it('renders seasons', () => {
    const seasons = [{
      name: 'Summer Harvest Season', months: [5, 6], commitCount: 50,
      avgChangesPerCommit: 10, dominantAction: 'feature' as const,
      characteristics: ['High development activity', '25 commits/month'],
    }]
    const table = formatSeasonTable(seasons)
    expect(table).toContain('Summer Harvest Season')
    expect(table).toContain('FEATURE')
    expect(table).toContain('Jun, Jul')
  })

  it('shows empty message for no seasons', () => {
    expect(formatSeasonTable([])).toContain('No seasons detected')
  })
})

describe('formatRhythmSummary', () => {
  it('renders rhythms', () => {
    const rhythms: import('../src/commands/almanac-helpers.js').Rhythm[] = [{
      type: 'weekly', peakDay: 2, peakHour: 0, consistency: 80,
      description: 'Tuesday is most active',
    }]
    const summary = formatRhythmSummary(rhythms)
    expect(summary).toContain('weekly')
    expect(summary).toContain('80%')
    expect(summary).toContain('Tuesday')
  })

  it('shows empty message for no rhythms', () => {
    expect(formatRhythmSummary([])).toContain('No rhythms detected')
  })
})

describe('formatPredictionCards', () => {
  it('renders predictions', () => {
    const predictions = [{
      category: 'activity', confidence: 75,
      prediction: 'Next month will be busy',
      basedOn: 'Historical patterns',
    }]
    const cards = formatPredictionCards(predictions)
    expect(cards).toContain('activity')
    expect(cards).toContain('75%')
    expect(cards).toContain('Next month will be busy')
    expect(cards).toContain('Historical patterns')
  })

  it('shows empty message for no predictions', () => {
    expect(formatPredictionCards([])).toContain('No predictions')
  })
})

describe('formatAlmanacStats', () => {
  it('renders all stat fields', () => {
    const stats = {
      totalCommits: 100,
      commitsByDayOfWeek: new Array(7).fill(10),
      commitsByHour: new Array(24).fill(1),
      commitsByMonth: new Array(12).fill(10),
      mostActiveDay: 'Tuesday',
      mostActiveHour: '2 PM',
      mostActiveMonth: 'June',
      avgCommitsPerDay: 5,
      busiestSeason: 'Summer Harvest',
      quietestSeason: 'Winter Fallow',
    }
    const output = formatAlmanacStats(stats)
    expect(output).toContain('100')
    expect(output).toContain('Tuesday')
    expect(output).toContain('2 PM')
    expect(output).toContain('June')
    expect(output).toContain('Summer Harvest')
    expect(output).toContain('Winter Fallow')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const output = formatRecommendations(['Do this', 'Do that'])
    expect(output).toContain('1. Do this')
    expect(output).toContain('2. Do that')
  })

  it('shows no recs message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatAlmanacTable', () => {
  it('renders full table with all sections', () => {
    const result = buildAlmanacResult([
      'a1|2025-06-15 10:00:00 +0100|feat: add login|10|5',
      'a2|2025-03-10 09:00:00 +0100|fix: bug|3|2',
    ].join('\n'))
    const table = formatAlmanacTable(result)
    expect(table).toContain('Code Almanac')
    expect(table).toContain('Monthly Activity Map')
    expect(table).toContain('Weekly Rhythm')
    expect(table).toContain('Daily Rhythm')
    expect(table).toContain('Recommendations')
  })
})

describe('formatAlmanacJSON', () => {
  it('produces valid JSON', () => {
    const result = buildAlmanacResult('a1|2025-01-01 10:00:00|test|1|0')
    const json = formatAlmanacJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalCommits).toBe(1)
    expect(parsed.seasons).toBeDefined()
    expect(parsed.rhythms).toBeDefined()
  })
})

describe('getSeasonColor', () => {
  it('returns color function for each type', () => {
    expect(typeof getSeasonColor('harvest')('test')).toBe('string')
    expect(typeof getSeasonColor('fallow')('test')).toBe('string')
    expect(typeof getSeasonColor('planting')('test')).toBe('string')
    expect(typeof getSeasonColor('storage')('test')).toBe('string')
    expect(typeof getSeasonColor('unknown')('test')).toBe('string')
  })
})
