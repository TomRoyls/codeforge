import { describe, it, expect } from 'vitest'

import {
  buildChurnResultFromCommits,
  buildGitLogArgs,
  computeAuthorChurn,
  computeChurnScore,
  computeChurnStats,
  computeFileChurn,
  computeTimeChurn,
  generateChurnRecommendations,
  identifyHotspots,
  parseGitLog,
} from '../src/commands/churn-helpers.js'
import {
  formatAuthorChurnRow,
  formatChurnCsv,
  formatChurnJson,
  formatChurnStats,
  formatChurnTable,
  formatFileChurnRow,
  formatNetChange,
  formatTimeChart,
  hotspotBadge,
} from '../src/commands/churn-format-helpers.js'
import type { AuthorChurn, FileChurn, GitCommit, TimeChurn } from '../src/commands/churn-helpers.js'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleGitLog = [
  'COMMIT|abc123|Alice|2024-01-15T10:00:00+00:00',
  '10\t3\tsrc/core.ts',
  '5\t1\tsrc/utils.ts',
  'COMMIT|def456|Bob|2024-01-20T11:00:00+00:00',
  '20\t5\tsrc/core.ts',
  '8\t2\tsrc/helpers.ts',
  'COMMIT|ghi789|Alice|2024-02-01T09:00:00+00:00',
  '15\t8\tsrc/core.ts',
  '3\t0\tsrc/utils.ts',
  'COMMIT|jkl012|Charlie|2024-02-10T14:00:00+00:00',
  '50\t10\tsrc/core.ts',
  '10\t3\tsrc/helpers.ts',
  '5\t0\tsrc/new-feature.ts',
].join('\n')

// ─── parseGitLog ──────────────────────────────────────────────────────────────

describe('parseGitLog', () => {
  it('parses valid git log output', () => {
    const commits = parseGitLog(sampleGitLog)
    expect(commits).toHaveLength(4)
  })

  it('extracts commit metadata', () => {
    const commits = parseGitLog(sampleGitLog)
    expect(commits[0]!.hash).toBe('abc123')
    expect(commits[0]!.author).toBe('Alice')
    expect(commits[0]!.date).toContain('2024-01-15')
  })

  it('parses file changes', () => {
    const commits = parseGitLog(sampleGitLog)
    expect(commits[0]!.files).toHaveLength(2)
    expect(commits[0]!.files[0]).toEqual({ file: 'src/core.ts', additions: 10, deletions: 3 })
  })

  it('handles empty output', () => {
    expect(parseGitLog('')).toEqual([])
  })

  it('handles binary file entries with dashes', () => {
    const log = 'COMMIT|abc|Alice|2024-01-01\n-\t-\timage.png'
    const commits = parseGitLog(log)
    expect(commits[0]!.files).toHaveLength(1)
    expect(commits[0]!.files[0]!.additions).toBe(0)
    expect(commits[0]!.files[0]!.deletions).toBe(0)
  })

  it('handles single commit', () => {
    const log = 'COMMIT|abc|Alice|2024-01-01\n5\t2\tfile.ts'
    const commits = parseGitLog(log)
    expect(commits).toHaveLength(1)
    expect(commits[0]!.files[0]!.additions).toBe(5)
  })

  it('skips blank lines', () => {
    const log = '\n\nCOMMIT|abc|Alice|2024-01-01\n5\t2\tfile.ts\n\n'
    const commits = parseGitLog(log)
    expect(commits).toHaveLength(1)
  })

  it('handles filenames with spaces', () => {
    const log = 'COMMIT|abc|Alice|2024-01-01\n5\t2\tsrc/my file.ts'
    const commits = parseGitLog(log)
    expect(commits[0]!.files[0]!.file).toBe('src/my file.ts')
  })
})

// ─── buildGitLogArgs ──────────────────────────────────────────────────────────

describe('buildGitLogArgs', () => {
  it('builds basic args', () => {
    const args = buildGitLogArgs()
    expect(args).toContain('log')
    expect(args).toContain('--numstat')
    expect(args[2]).toContain('COMMIT')
  })

  it('adds since flag', () => {
    const args = buildGitLogArgs({ since: '2024-01-01' })
    expect(args.some((a) => a.includes('--since'))).toBe(true)
  })

  it('adds until flag', () => {
    const args = buildGitLogArgs({ until: '2024-12-31' })
    expect(args.some((a) => a.includes('--until'))).toBe(true)
  })

  it('combines both flags', () => {
    const args = buildGitLogArgs({ since: '2024-01', until: '2024-06' })
    expect(args.some((a) => a.includes('--since'))).toBe(true)
    expect(args.some((a) => a.includes('--until'))).toBe(true)
  })
})

// ─── computeFileChurn ─────────────────────────────────────────────────────────

describe('computeFileChurn', () => {
  const commits = parseGitLog(sampleGitLog)

  it('aggregates per file', () => {
    const churn = computeFileChurn(commits)
    const core = churn.find((f) => f.file === 'src/core.ts')
    expect(core).toBeDefined()
    expect(core!.commitCount).toBe(4)
    expect(core!.totalAdditions).toBe(95)
    expect(core!.totalDeletions).toBe(26)
  })

  it('sorts by churn score descending', () => {
    const churn = computeFileChurn(commits)
    for (let i = 1; i < churn.length; i++) {
      expect(churn[i - 1]!.churnScore).toBeGreaterThanOrEqual(churn[i]!.churnScore)
    }
  })

  it('tracks authors per file', () => {
    const churn = computeFileChurn(commits)
    const core = churn.find((f) => f.file === 'src/core.ts')
    expect(core!.authors).toContain('Alice')
    expect(core!.authors).toContain('Bob')
    expect(core!.authors).toContain('Charlie')
    expect(core!.authorCount).toBe(3)
  })

  it('computes net change', () => {
    const churn = computeFileChurn(commits)
    const core = churn.find((f) => f.file === 'src/core.ts')
    expect(core!.netChange).toBe(69)
  })

  it('tracks first and last changed dates', () => {
    const churn = computeFileChurn(commits)
    const core = churn.find((f) => f.file === 'src/core.ts')
    expect(core!.firstChanged).toContain('2024-01-15')
    expect(core!.lastChanged).toContain('2024-02-10')
  })

  it('handles empty commits', () => {
    expect(computeFileChurn([])).toEqual([])
  })

  it('initializes hotspots to false', () => {
    const churn = computeFileChurn(commits)
    for (const fc of churn) {
      expect(fc.hotspots).toBe(false)
    }
  })
})

// ─── computeAuthorChurn ───────────────────────────────────────────────────────

describe('computeAuthorChurn', () => {
  const commits = parseGitLog(sampleGitLog)

  it('aggregates per author', () => {
    const churn = computeAuthorChurn(commits)
    const alice = churn.find((a) => a.author === 'Alice')
    expect(alice).toBeDefined()
    expect(alice!.commitCount).toBe(2)
  })

  it('computes additions and deletions', () => {
    const churn = computeAuthorChurn(commits)
    const alice = churn.find((a) => a.author === 'Alice')
    expect(alice!.additions).toBe(33)
    expect(alice!.deletions).toBe(12)
  })

  it('tracks files changed', () => {
    const churn = computeAuthorChurn(commits)
    const alice = churn.find((a) => a.author === 'Alice')
    expect(alice!.filesChanged).toBeGreaterThanOrEqual(2)
  })

  it('computes average change size', () => {
    const churn = computeAuthorChurn(commits)
    const alice = churn.find((a) => a.author === 'Alice')
    expect(alice!.averageChangeSize).toBeGreaterThan(0)
  })

  it('tracks most changed files', () => {
    const churn = computeAuthorChurn(commits)
    const alice = churn.find((a) => a.author === 'Alice')
    expect(alice!.mostChangedFiles.length).toBeGreaterThan(0)
  })

  it('sorts by total change descending', () => {
    const churn = computeAuthorChurn(commits)
    for (let i = 1; i < churn.length; i++) {
      const prev = churn[i - 1]!.additions + churn[i - 1]!.deletions
      const curr = churn[i]!.additions + churn[i]!.deletions
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('handles empty commits', () => {
    expect(computeAuthorChurn([])).toEqual([])
  })
})

// ─── computeTimeChurn ─────────────────────────────────────────────────────────

describe('computeTimeChurn', () => {
  const commits = parseGitLog(sampleGitLog)

  it('groups by month', () => {
    const churn = computeTimeChurn(commits)
    expect(churn.length).toBeGreaterThanOrEqual(2)
    const periods = churn.map((t) => t.period)
    expect(periods).toContain('2024-01')
    expect(periods).toContain('2024-02')
  })

  it('sorts chronologically', () => {
    const churn = computeTimeChurn(commits)
    for (let i = 1; i < churn.length; i++) {
      expect(churn[i]!.period > churn[i - 1]!.period).toBe(true)
    }
  })

  it('computes per-period stats', () => {
    const churn = computeTimeChurn(commits)
    const jan = churn.find((t) => t.period === '2024-01')
    expect(jan).toBeDefined()
    expect(jan!.commits).toBe(2)
    expect(jan!.additions).toBeGreaterThan(0)
  })

  it('tracks unique authors per period', () => {
    const churn = computeTimeChurn(commits)
    const jan = churn.find((t) => t.period === '2024-01')
    expect(jan!.authors).toBe(2)
  })

  it('handles empty commits', () => {
    expect(computeTimeChurn([])).toEqual([])
  })
})

// ─── computeChurnScore ────────────────────────────────────────────────────────

describe('computeChurnScore', () => {
  it('computes score', () => {
    expect(computeChurnScore(5, 100, 50)).toBe(750)
  })

  it('handles zero values', () => {
    expect(computeChurnScore(0, 100, 50)).toBe(0)
    expect(computeChurnScore(5, 0, 0)).toBe(0)
  })

  it('weights by commit count', () => {
    const low = computeChurnScore(1, 100, 50)
    const high = computeChurnScore(10, 100, 50)
    expect(high).toBeGreaterThan(low)
  })
})

// ─── identifyHotspots ─────────────────────────────────────────────────────────

describe('identifyHotspots', () => {
  it('identifies high churn files', () => {
    const fileChurn: FileChurn[] = [
      { file: 'a.ts', commitCount: 2, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 30, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false },
      { file: 'b.ts', commitCount: 2, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 30, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false },
      { file: 'c.ts', commitCount: 2, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 30, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false },
      { file: 'hot.ts', commitCount: 20, authorCount: 5, totalAdditions: 500, totalDeletions: 300, netChange: 200, churnScore: 16000, lastChanged: '2024-02', firstChanged: '2024-01', authors: ['A', 'B', 'C', 'D', 'E'], hotspots: false },
    ]
    const hotspots = identifyHotspots(fileChurn)
    expect(hotspots.length).toBeGreaterThan(0)
    expect(hotspots[0]!.hotspots).toBe(true)
  })

  it('returns empty for uniform data', () => {
    const fileChurn: FileChurn[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, commitCount: 1, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 15, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false,
    }))
    const hotspots = identifyHotspots(fileChurn)
    expect(hotspots).toEqual([])
  })

  it('returns empty for empty input', () => {
    expect(identifyHotspots([])).toEqual([])
  })

  it('sorts by churn score descending', () => {
    const fileChurn: FileChurn[] = [
      { file: 'a.ts', commitCount: 1, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 15, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false },
      { file: 'b.ts', commitCount: 1, authorCount: 1, totalAdditions: 10, totalDeletions: 5, netChange: 5, churnScore: 15, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: false },
      { file: 'hot.ts', commitCount: 50, authorCount: 10, totalAdditions: 1000, totalDeletions: 800, netChange: 200, churnScore: 90000, lastChanged: '2024-02', firstChanged: '2024-01', authors: ['A'], hotspots: false },
    ]
    const hotspots = identifyHotspots(fileChurn)
    for (let i = 1; i < hotspots.length; i++) {
      expect(hotspots[i - 1]!.churnScore).toBeGreaterThanOrEqual(hotspots[i]!.churnScore)
    }
  })
})

// ─── computeChurnStats ────────────────────────────────────────────────────────

describe('computeChurnStats', () => {
  it('computes aggregate stats', () => {
    const commits = parseGitLog(sampleGitLog)
    const fileChurn = computeFileChurn(commits)
    const authorChurn = computeAuthorChurn(commits)
    const stats = computeChurnStats(fileChurn, authorChurn, commits)
    expect(stats.totalCommits).toBe(4)
    expect(stats.totalAdditions).toBeGreaterThan(0)
    expect(stats.totalDeletions).toBeGreaterThan(0)
    expect(stats.totalFilesChanged).toBe(4)
  })

  it('finds most churned file', () => {
    const commits = parseGitLog(sampleGitLog)
    const fileChurn = computeFileChurn(commits)
    const authorChurn = computeAuthorChurn(commits)
    const stats = computeChurnStats(fileChurn, authorChurn, commits)
    expect(stats.mostChurnedFile).toBe('src/core.ts')
  })

  it('handles empty input', () => {
    const stats = computeChurnStats([], [], [])
    expect(stats.totalCommits).toBe(0)
    expect(stats.mostChurnedFile).toBe('')
  })
})

// ─── generateChurnRecommendations ─────────────────────────────────────────────

describe('generateChurnRecommendations', () => {
  it('warns about hotspots', () => {
    const hotspots: FileChurn[] = [{ file: 'hot.ts', commitCount: 10, authorCount: 3, totalAdditions: 100, totalDeletions: 80, netChange: 20, churnScore: 1800, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A', 'B', 'C'], hotspots: true }]
    const stats = { totalCommits: 10, totalAdditions: 100, totalDeletions: 80, totalFilesChanged: 5, hotspotFiles: 1, averageChurnScore: 100, mostChurnedFile: 'hot.ts', mostActiveAuthor: 'A' }
    const recs = generateChurnRecommendations(hotspots, stats, [])
    expect(recs.some((r) => r.includes('hotspot'))).toBe(true)
  })

  it('warns about high hotspot ratio', () => {
    const stats = { totalCommits: 10, totalAdditions: 100, totalDeletions: 80, totalFilesChanged: 5, hotspotFiles: 4, averageChurnScore: 100, mostChurnedFile: 'hot.ts', mostActiveAuthor: 'A' }
    const hotspots: FileChurn[] = Array.from({ length: 4 }, (_, i) => ({ file: `h${i}.ts`, commitCount: 5, authorCount: 1, totalAdditions: 50, totalDeletions: 30, netChange: 20, churnScore: 400, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: true }))
    const recs = generateChurnRecommendations(hotspots, stats, [])
    expect(recs.some((r) => r.includes('architectural'))).toBe(true)
  })

  it('detects increasing churn', () => {
    const timeChurn: TimeChurn[] = [
      { period: '2024-01', commits: 2, additions: 10, deletions: 5, filesChanged: 3, authors: 1, netChange: 5 },
      { period: '2024-02', commits: 2, additions: 10, deletions: 5, filesChanged: 3, authors: 1, netChange: 5 },
      { period: '2024-03', commits: 2, additions: 10, deletions: 5, filesChanged: 3, authors: 1, netChange: 5 },
      { period: '2024-04', commits: 20, additions: 100, deletions: 50, filesChanged: 10, authors: 5, netChange: 50 },
      { period: '2024-05', commits: 25, additions: 120, deletions: 60, filesChanged: 12, authors: 6, netChange: 60 },
      { period: '2024-06', commits: 30, additions: 150, deletions: 70, filesChanged: 15, authors: 7, netChange: 80 },
    ]
    const stats = { totalCommits: 81, totalAdditions: 400, totalDeletions: 200, totalFilesChanged: 20, hotspotFiles: 0, averageChurnScore: 50, mostChurnedFile: 'f.ts', mostActiveAuthor: 'A' }
    const recs = generateChurnRecommendations([], stats, timeChurn)
    expect(recs.some((r) => r.includes('increasing'))).toBe(true)
  })

  it('detects decreasing churn', () => {
    const timeChurn: TimeChurn[] = [
      { period: '2024-01', commits: 30, additions: 150, deletions: 70, filesChanged: 15, authors: 7, netChange: 80 },
      { period: '2024-02', commits: 25, additions: 120, deletions: 60, filesChanged: 12, authors: 6, netChange: 60 },
      { period: '2024-03', commits: 2, additions: 10, deletions: 5, filesChanged: 3, authors: 1, netChange: 5 },
      { period: '2024-04', commits: 1, additions: 5, deletions: 2, filesChanged: 1, authors: 1, netChange: 3 },
      { period: '2024-05', commits: 1, additions: 5, deletions: 2, filesChanged: 1, authors: 1, netChange: 3 },
      { period: '2024-06', commits: 1, additions: 5, deletions: 2, filesChanged: 1, authors: 1, netChange: 3 },
    ]
    const stats = { totalCommits: 60, totalAdditions: 300, totalDeletions: 150, totalFilesChanged: 20, hotspotFiles: 0, averageChurnScore: 50, mostChurnedFile: 'f.ts', mostActiveAuthor: 'A' }
    const recs = generateChurnRecommendations([], stats, timeChurn)
    expect(recs.some((r) => r.includes('stabilizing'))).toBe(true)
  })

  it('warns about high author count on hotspots', () => {
    const hotspots: FileChurn[] = [{ file: 'hot.ts', commitCount: 10, authorCount: 8, totalAdditions: 100, totalDeletions: 80, netChange: 20, churnScore: 1800, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], hotspots: true }]
    const stats = { totalCommits: 10, totalAdditions: 100, totalDeletions: 80, totalFilesChanged: 5, hotspotFiles: 1, averageChurnScore: 100, mostChurnedFile: 'hot.ts', mostActiveAuthor: 'A' }
    const recs = generateChurnRecommendations(hotspots, stats, [])
    expect(recs.some((r) => r.includes('coordination'))).toBe(true)
  })

  it('returns healthy message when clean', () => {
    const stats = { totalCommits: 10, totalAdditions: 50, totalDeletions: 20, totalFilesChanged: 5, hotspotFiles: 0, averageChurnScore: 10, mostChurnedFile: '', mostActiveAuthor: '' }
    const recs = generateChurnRecommendations([], stats, [])
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('healthy')
  })
})

// ─── buildChurnResultFromCommits ──────────────────────────────────────────────

describe('buildChurnResultFromCommits', () => {
  const commits = parseGitLog(sampleGitLog)

  it('returns complete result', () => {
    const result = buildChurnResultFromCommits(commits)
    expect(result.fileChurn.length).toBeGreaterThan(0)
    expect(result.authorChurn.length).toBeGreaterThan(0)
    expect(result.timeChurn.length).toBeGreaterThan(0)
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('respects top limit', () => {
    const result = buildChurnResultFromCommits(commits, { top: 2 })
    expect(result.fileChurn.length).toBeLessThanOrEqual(2)
  })

  it('marks hotspots', () => {
    const result = buildChurnResultFromCommits(commits)
    const hotspotCount = result.fileChurn.filter((f) => f.hotspots).length
    expect(result.hotspots.length).toBe(hotspotCount)
  })

  it('handles empty commits', () => {
    const result = buildChurnResultFromCommits([])
    expect(result.fileChurn).toEqual([])
    expect(result.stats.totalCommits).toBe(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('hotspotBadge', () => {
  it('returns fire for hotspot', () => {
    expect(hotspotBadge(true)).toContain('🔥')
  })
  it('returns blank for non-hotspot', () => {
    const badge = hotspotBadge(false)
    expect(badge.trim()).toBe('')
  })
})

describe('formatNetChange', () => {
  it('formats positive change', () => {
    expect(formatNetChange(50)).toContain('+50')
  })
  it('formats negative change', () => {
    expect(formatNetChange(-30)).toContain('-30')
  })
  it('formats zero', () => {
    expect(formatNetChange(0)).toContain('0')
  })
})

describe('formatTimeChart', () => {
  it('renders chart with data', () => {
    const tc: TimeChurn[] = [
      { period: '2024-01', commits: 5, additions: 50, deletions: 20, filesChanged: 3, authors: 2, netChange: 30 },
      { period: '2024-02', commits: 10, additions: 100, deletions: 40, filesChanged: 5, authors: 3, netChange: 60 },
    ]
    const chart = formatTimeChart(tc)
    expect(chart).toContain('2024-01')
    expect(chart).toContain('2024-02')
  })

  it('handles empty data', () => {
    const chart = formatTimeChart([])
    expect(chart).toContain('No time data')
  })
})

describe('formatChurnStats', () => {
  it('formats all stats', () => {
    const stats = { totalCommits: 50, totalAdditions: 1000, totalDeletions: 500, totalFilesChanged: 20, hotspotFiles: 3, averageChurnScore: 120, mostChurnedFile: 'core.ts', mostActiveAuthor: 'Alice' }
    const result = formatChurnStats(stats)
    expect(result).toContain('50')
    expect(result).toContain('1000')
    expect(result).toContain('core.ts')
  })
})

describe('formatFileChurnRow', () => {
  it('formats a file row', () => {
    const fc: FileChurn = { file: 'core.ts', commitCount: 8, authorCount: 3, totalAdditions: 100, totalDeletions: 50, netChange: 50, churnScore: 1200, lastChanged: '2024-01', firstChanged: '2024-01', authors: ['A'], hotspots: true }
    const row = formatFileChurnRow(fc)
    expect(row).toContain('core.ts')
    expect(row).toContain('1200')
  })
})

describe('formatAuthorChurnRow', () => {
  it('formats an author row', () => {
    const ac: AuthorChurn = { author: 'Alice', commitCount: 15, filesChanged: 10, additions: 500, deletions: 200, netChange: 300, averageChangeSize: 46, mostChangedFiles: ['core.ts'] }
    const row = formatAuthorChurnRow(ac)
    expect(row).toContain('Alice')
    expect(row).toContain('500')
  })
})

describe('formatChurnTable', () => {
  it('includes title and sections', () => {
    const commits = parseGitLog(sampleGitLog)
    const result = buildChurnResultFromCommits(commits)
    const table = formatChurnTable(result)
    expect(table).toContain('Code Churn Analysis')
    expect(table).toContain('Overview')
    expect(table).toContain('File Churn')
  })

  it('includes verbose author details', () => {
    const commits = parseGitLog(sampleGitLog)
    const result = buildChurnResultFromCommits(commits)
    const table = formatChurnTable(result, true)
    expect(table).toContain('Author Details')
  })
})

describe('formatChurnJson', () => {
  it('produces valid JSON', () => {
    const commits = parseGitLog(sampleGitLog)
    const result = buildChurnResultFromCommits(commits)
    const json = formatChurnJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

describe('formatChurnCsv', () => {
  it('includes header', () => {
    const commits = parseGitLog(sampleGitLog)
    const result = buildChurnResultFromCommits(commits)
    const csv = formatChurnCsv(result)
    expect(csv).toContain('file,commitCount')
  })

  it('includes file data rows', () => {
    const commits = parseGitLog(sampleGitLog)
    const result = buildChurnResultFromCommits(commits)
    const csv = formatChurnCsv(result)
    expect(csv).toContain('src/core.ts')
  })
})
