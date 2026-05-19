import { describe, expect, it } from 'vitest'

import {
  type Contributor,
  type ContributorResult,
  type KnowledgeSilos,
  type ParsedCommit,
  buildContributorResult,
  buildContributors,
  computeBusFactor,
  computeContributorAreas,
  computeContributorStats,
  computeDistribution,
  computeExpertise,
  detectKnowledgeSilos,
  generateContributorRecommendations,
  parseGitLogForContributors,
  parseGitShortlog,
} from '../src/commands/contributor-helpers.js'
import {
  formatBusFactor,
  formatContributorCsv,
  formatContributorJson,
  formatContributorTable,
  formatDistributionChart,
  formatExpertiseMap,
  formatLeaderboard,
  formatSilos,
} from '../src/commands/contributor-format-helpers.js'

// ─── parseGitShortlog ─────────────────────────────────────────────────────────

describe('parseGitShortlog', () => {
  it('parses shortlog output', () => {
    const input = '  50\tAlice\n  30\tBob\n  20\tCharlie\n'
    const result = parseGitShortlog(input)
    expect(result).toEqual([
      { name: 'Alice', count: 50 },
      { name: 'Bob', count: 30 },
      { name: 'Charlie', count: 20 },
    ])
  })

  it('handles empty input', () => {
    expect(parseGitShortlog('')).toEqual([])
  })

  it('handles single contributor', () => {
    expect(parseGitShortlog('  10\tAlice\n')).toEqual([{ name: 'Alice', count: 10 }])
  })

  it('sorts by count descending', () => {
    const input = '  5\tZara\n  50\tAlice\n  20\tBob\n'
    const result = parseGitShortlog(input)
    expect(result[0]!.name).toBe('Alice')
    expect(result[1]!.name).toBe('Bob')
  })

  it('skips malformed lines', () => {
    const input = '  50\tAlice\nbad line\n  30\tBob\n'
    const result = parseGitShortlog(input)
    expect(result).toHaveLength(2)
  })
})

// ─── parseGitLogForContributors ───────────────────────────────────────────────

describe('parseGitLogForContributors', () => {
  it('parses commit with numstat', () => {
    const input = 'COMMIT|abc123|Alice|2024-01-15\n5\t2\tsrc/a.ts\n3\t0\tsrc/b.ts\n'
    const commits = parseGitLogForContributors(input)
    expect(commits).toHaveLength(1)
    expect(commits[0]!.hash).toBe('abc123')
    expect(commits[0]!.author).toBe('Alice')
    expect(commits[0]!.date).toBe('2024-01-15')
    expect(commits[0]!.files).toEqual([
      { file: 'src/a.ts', adds: 5, dels: 2 },
      { file: 'src/b.ts', adds: 3, dels: 0 },
    ])
  })

  it('handles multiple commits', () => {
    const input = 'COMMIT|h1|Alice|2024-01-01\n1\t0\ta.ts\nCOMMIT|h2|Bob|2024-01-02\n2\t1\tb.ts\n'
    const commits = parseGitLogForContributors(input)
    expect(commits).toHaveLength(2)
    expect(commits[0]!.author).toBe('Alice')
    expect(commits[1]!.author).toBe('Bob')
  })

  it('handles binary files (dashes)', () => {
    const input = 'COMMIT|h1|Alice|2024-01-01\n-\t-\timage.png\n'
    const commits = parseGitLogForContributors(input)
    expect(commits[0]!.files[0]!.adds).toBe(0)
    expect(commits[0]!.files[0]!.dels).toBe(0)
  })

  it('handles empty input', () => {
    expect(parseGitLogForContributors('')).toEqual([])
  })

  it('handles trailing commit without newline', () => {
    const input = 'COMMIT|h1|Alice|2024-01-01\n1\t0\ta.ts'
    const commits = parseGitLogForContributors(input)
    expect(commits).toHaveLength(1)
    expect(commits[0]!.files).toHaveLength(1)
  })
})

// ─── buildContributors ────────────────────────────────────────────────────────

describe('buildContributors', () => {
  const commits: ParsedCommit[] = [
    { hash: 'h1', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/ui/a.tsx', adds: 10, dels: 2 }] },
    { hash: 'h2', author: 'Alice', date: '2024-01-02', files: [{ file: 'src/ui/b.tsx', adds: 5, dels: 1 }] },
    { hash: 'h3', author: 'Bob', date: '2024-01-03', files: [{ file: 'src/api/c.ts', adds: 20, dels: 0 }] },
  ]

  it('aggregates contributors', () => {
    const result = buildContributors(commits)
    expect(result).toHaveLength(2)
    expect(result.find((c) => c.name === 'Alice')).toBeDefined()
    expect(result.find((c) => c.name === 'Bob')).toBeDefined()
  })

  it('computes commit counts', () => {
    const result = buildContributors(commits)
    const alice = result.find((c) => c.name === 'Alice')!
    expect(alice.commitCount).toBe(2)
    const bob = result.find((c) => c.name === 'Bob')!
    expect(bob.commitCount).toBe(1)
  })

  it('computes additions and deletions', () => {
    const result = buildContributors(commits)
    const alice = result.find((c) => c.name === 'Alice')!
    expect(alice.additions).toBe(15)
    expect(alice.deletions).toBe(3)
    expect(alice.netChange).toBe(12)
  })

  it('computes files changed', () => {
    const result = buildContributors(commits)
    const alice = result.find((c) => c.name === 'Alice')!
    expect(alice.filesChanged).toBe(2)
  })

  it('tracks first and last commit', () => {
    const result = buildContributors(commits)
    const alice = result.find((c) => c.name === 'Alice')!
    expect(alice.firstCommit).toBe('2024-01-01')
    expect(alice.lastCommit).toBe('2024-01-02')
  })

  it('sorts by commit count descending', () => {
    const result = buildContributors(commits)
    expect(result[0]!.name).toBe('Alice')
  })

  it('handles empty commits', () => {
    expect(buildContributors([])).toEqual([])
  })

  it('computes active days', () => {
    const result = buildContributors(commits)
    const alice = result.find((c) => c.name === 'Alice')!
    expect(alice.activeDays).toBe(2)
  })
})

// ─── computeContributorAreas ──────────────────────────────────────────────────

describe('computeContributorAreas', () => {
  it('computes areas with percentages', () => {
    const areaMap = new Map([['src/ui', 10], ['src/api', 5]])
    const result = computeContributorAreas(areaMap, 15)
    expect(result).toHaveLength(2)
    expect(result[0]!.directory).toBe('src/ui')
    expect(result[0]!.percentage).toBe(0.67)
    expect(result[1]!.percentage).toBe(0.33)
  })

  it('handles empty input', () => {
    expect(computeContributorAreas(new Map(), 0)).toEqual([])
  })

  it('limits to 10 areas', () => {
    const areaMap = new Map(Array.from({ length: 15 }, (_, i) => [`dir${i}`, 1]))
    const result = computeContributorAreas(areaMap, 15)
    expect(result.length).toBeLessThanOrEqual(10)
  })
})

// ─── computeExpertise ─────────────────────────────────────────────────────────

describe('computeExpertise', () => {
  it('filters areas with >= 10% commits', () => {
    const areas = [
      { directory: 'src/ui', commits: 60, percentage: 0.6 },
      { directory: 'src/api', commits: 30, percentage: 0.3 },
      { directory: 'src/misc', commits: 5, percentage: 0.05 },
    ]
    const result = computeExpertise(areas)
    expect(result).toEqual(['src/ui', 'src/api'])
  })

  it('limits to 5 areas', () => {
    const areas = Array.from({ length: 8 }, (_, i) => ({
      directory: `dir${i}`, commits: 10, percentage: 0.125,
    }))
    expect(computeExpertise(areas).length).toBeLessThanOrEqual(5)
  })

  it('returns empty for no qualifying areas', () => {
    expect(computeExpertise([])).toEqual([])
  })
})

// ─── computeBusFactor ─────────────────────────────────────────────────────────

describe('computeBusFactor', () => {
  it('returns 1 for one dominant contributor', () => {
    expect(computeBusFactor([{ commitCount: 80 }, { commitCount: 10 }, { commitCount: 10 }])).toBe(1)
  })

  it('returns 2 for two equal contributors', () => {
    expect(computeBusFactor([{ commitCount: 40 }, { commitCount: 30 }, { commitCount: 30 }])).toBe(2)
  })

  it('returns 3 for three equal contributors', () => {
    expect(computeBusFactor([{ commitCount: 34 }, { commitCount: 33 }, { commitCount: 33 }])).toBe(2)
  })

  it('returns 0 for no contributors', () => {
    expect(computeBusFactor([])).toBe(0)
  })

  it('returns 0 for zero commits', () => {
    expect(computeBusFactor([{ commitCount: 0 }])).toBe(0)
  })

  it('handles single contributor', () => {
    expect(computeBusFactor([{ commitCount: 100 }])).toBe(1)
  })
})

// ─── computeDistribution ──────────────────────────────────────────────────────

describe('computeDistribution', () => {
  const contributors: Contributor[] = [
    { name: 'Alice', email: '', commitCount: 60, additions: 1000, deletions: 100, netChange: 900, filesChanged: 10, firstCommit: '2024-01-01', lastCommit: '2024-06-01', activeDays: 30, areas: [], expertise: [] },
    { name: 'Bob', email: '', commitCount: 30, additions: 500, deletions: 50, netChange: 450, filesChanged: 5, firstCommit: '2024-02-01', lastCommit: '2024-06-01', activeDays: 15, areas: [], expertise: [] },
    { name: 'Charlie', email: '', commitCount: 10, additions: 200, deletions: 20, netChange: 180, filesChanged: 3, firstCommit: '2024-05-01', lastCommit: '2024-06-01', activeDays: 5, areas: [], expertise: [] },
  ]

  it('computes total contributors', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.totalContributors).toBe(3)
  })

  it('computes top contributor percentage', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.topContributorPercentage).toBe(0.6)
  })

  it('computes bus factor', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.busFactor).toBe(1)
  })

  it('computes gini coefficient', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.giniCoefficient).toBeGreaterThan(0)
    expect(result.giniCoefficient).toBeLessThanOrEqual(1)
  })

  it('counts active contributors', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.activeContributors).toBe(3)
  })

  it('counts new contributors', () => {
    const result = computeDistribution(contributors, '2024-06-15')
    expect(result.newContributors).toBe(0)
  })

  it('handles empty contributors', () => {
    const result = computeDistribution([], '2024-06-15')
    expect(result.totalContributors).toBe(0)
    expect(result.busFactor).toBe(0)
  })
})

// ─── detectKnowledgeSilos ─────────────────────────────────────────────────────

describe('detectKnowledgeSilos', () => {
  it('detects silos for files with one dominant author', () => {
    const commits: ParsedCommit[] = [
      { hash: 'h1', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/core.ts', adds: 5, dels: 0 }] },
      { hash: 'h2', author: 'Alice', date: '2024-01-02', files: [{ file: 'src/core.ts', adds: 3, dels: 0 }] },
      { hash: 'h3', author: 'Alice', date: '2024-01-03', files: [{ file: 'src/core.ts', adds: 2, dels: 0 }] },
    ]
    const silos = detectKnowledgeSilos(commits)
    expect(silos).toHaveLength(1)
    expect(silos[0]!.primaryAuthor).toBe('Alice')
    expect(silos[0]!.risk).toBe('high')
  })

  it('does not flag shared files', () => {
    const commits: ParsedCommit[] = [
      { hash: 'h1', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/shared.ts', adds: 5, dels: 0 }] },
      { hash: 'h2', author: 'Bob', date: '2024-01-02', files: [{ file: 'src/shared.ts', adds: 3, dels: 0 }] },
      { hash: 'h3', author: 'Charlie', date: '2024-01-03', files: [{ file: 'src/shared.ts', adds: 2, dels: 0 }] },
    ]
    const silos = detectKnowledgeSilos(commits)
    expect(silos).toHaveLength(0)
  })

  it('ignores files with fewer than 3 commits', () => {
    const commits: ParsedCommit[] = [
      { hash: 'h1', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/new.ts', adds: 1, dels: 0 }] },
    ]
    expect(detectKnowledgeSilos(commits)).toHaveLength(0)
  })

  it('assigns medium risk for 80-89%', () => {
    const commits: ParsedCommit[] = Array.from({ length: 5 }, (_, i) => ({
      hash: `h${i}`, author: i < 4 ? 'Alice' : 'Bob', date: '2024-01-01',
      files: [{ file: 'src/x.ts', adds: 1, dels: 0 }],
    }))
    const silos = detectKnowledgeSilos(commits)
    expect(silos[0]!.risk).toBe('medium')
  })

  it('assigns low risk for 70-79%', () => {
    const commits: ParsedCommit[] = Array.from({ length: 10 }, (_, i) => ({
      hash: `h${i}`, author: i < 7 ? 'Alice' : 'Bob', date: '2024-01-01',
      files: [{ file: 'src/y.ts', adds: 1, dels: 0 }],
    }))
    const silos = detectKnowledgeSilos(commits)
    expect(silos[0]!.risk).toBe('low')
  })

  it('sorts by percentage descending', () => {
    const commits: ParsedCommit[] = [
      ...Array.from({ length: 10 }, (_, i) => ({ hash: `h${i}a`, author: 'Alice', date: '2024-01-01', files: [{ file: 'src/a.ts', adds: 1, dels: 0 }] })),
      { hash: 'ha', author: 'Bob', date: '2024-01-01', files: [{ file: 'src/a.ts', adds: 1, dels: 0 }] },
      ...Array.from({ length: 8 }, (_, i) => ({ hash: `h${i}b`, author: 'Charlie', date: '2024-01-01', files: [{ file: 'src/b.ts', adds: 1, dels: 0 }] })),
      ...Array.from({ length: 3 }, (_, i) => ({ hash: `h${i}c`, author: 'Dave', date: '2024-01-01', files: [{ file: 'src/b.ts', adds: 1, dels: 0 }] })),
    ]
    const silos = detectKnowledgeSilos(commits)
    expect(silos.length).toBeGreaterThanOrEqual(2)
    expect(silos[0]!.primaryPercentage).toBeGreaterThanOrEqual(silos[1]!.primaryPercentage)
  })
})

// ─── computeContributorStats ──────────────────────────────────────────────────

describe('computeContributorStats', () => {
  const contributors: Contributor[] = [
    { name: 'Alice', email: '', commitCount: 50, additions: 1000, deletions: 100, netChange: 900, filesChanged: 10, firstCommit: '2024-01-01', lastCommit: '2024-06-01', activeDays: 30, areas: [], expertise: [] },
    { name: 'Bob', email: '', commitCount: 30, additions: 500, deletions: 50, netChange: 450, filesChanged: 5, firstCommit: '2024-03-01', lastCommit: '2024-06-01', activeDays: 15, areas: [], expertise: [] },
  ]

  it('computes total commits', () => {
    const stats = computeContributorStats(contributors)
    expect(stats.totalCommits).toBe(80)
  })

  it('finds most active contributor', () => {
    const stats = computeContributorStats(contributors)
    expect(stats.mostActiveContributor).toBe('Alice')
  })

  it('finds longest tenure', () => {
    const stats = computeContributorStats(contributors)
    expect(stats.longestTenure).toBe('Alice')
  })

  it('finds newest contributor', () => {
    const stats = computeContributorStats(contributors)
    expect(stats.newestContributor).toBe('Bob')
  })

  it('computes average commits', () => {
    const stats = computeContributorStats(contributors)
    expect(stats.averageCommitsPerContributor).toBe(40)
  })

  it('handles empty', () => {
    const stats = computeContributorStats([])
    expect(stats.totalCommits).toBe(0)
    expect(stats.mostActiveContributor).toBe('')
  })
})

// ─── generateContributorRecommendations ───────────────────────────────────────

describe('generateContributorRecommendations', () => {
  it('warns about bus factor 1', () => {
    const dist = { giniCoefficient: 0.3, topContributorPercentage: 0.6, busFactor: 1, totalContributors: 3, activeContributors: 3, newContributors: 1 }
    const recs = generateContributorRecommendations(dist, [])
    expect(recs.some((r) => r.includes('Bus factor is 1'))).toBe(true)
  })

  it('warns about bus factor 2', () => {
    const dist = { giniCoefficient: 0.3, topContributorPercentage: 0.4, busFactor: 2, totalContributors: 5, activeContributors: 5, newContributors: 1 }
    const recs = generateContributorRecommendations(dist, [])
    expect(recs.some((r) => r.includes('Bus factor is 2'))).toBe(true)
  })

  it('warns about high risk silos', () => {
    const dist = { giniCoefficient: 0.2, topContributorPercentage: 0.3, busFactor: 3, totalContributors: 5, activeContributors: 5, newContributors: 1 }
    const silos: KnowledgeSilos[] = [{ file: 'a.ts', primaryAuthor: 'X', primaryPercentage: 0.95, risk: 'high' }]
    const recs = generateContributorRecommendations(dist, silos)
    expect(recs.some((r) => r.includes('single dominant author'))).toBe(true)
  })

  it('warns about skewed distribution', () => {
    const dist = { giniCoefficient: 0.7, topContributorPercentage: 0.8, busFactor: 1, totalContributors: 5, activeContributors: 5, newContributors: 1 }
    const recs = generateContributorRecommendations(dist, [])
    expect(recs.some((r) => r.includes('heavily skewed'))).toBe(true)
  })

  it('suggests onboarding when no new contributors', () => {
    const dist = { giniCoefficient: 0.2, topContributorPercentage: 0.3, busFactor: 3, totalContributors: 5, activeContributors: 5, newContributors: 0 }
    const recs = generateContributorRecommendations(dist, [])
    expect(recs.some((r) => r.includes('onboarding'))).toBe(true)
  })

  it('praises good distribution', () => {
    const dist = { giniCoefficient: 0.2, topContributorPercentage: 0.3, busFactor: 4, totalContributors: 5, activeContributors: 5, newContributors: 2 }
    const recs = generateContributorRecommendations(dist, [])
    expect(recs.some((r) => r.includes('looks good'))).toBe(true)
  })
})

// ─── buildContributorResult ───────────────────────────────────────────────────

describe('buildContributorResult', () => {
  const commits: ParsedCommit[] = [
    { hash: 'h1', author: 'Alice', date: '2024-01-01', files: [{ file: 'src/ui/a.tsx', adds: 10, dels: 2 }] },
    { hash: 'h2', author: 'Alice', date: '2024-01-02', files: [{ file: 'src/ui/b.tsx', adds: 5, dels: 1 }] },
    { hash: 'h3', author: 'Bob', date: '2024-01-03', files: [{ file: 'src/api/c.ts', adds: 20, dels: 0 }] },
  ]

  it('returns complete result', () => {
    const result = buildContributorResult(commits)
    expect(result.contributors).toBeDefined()
    expect(result.distribution).toBeDefined()
    expect(result.silos).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('respects top option', () => {
    const result = buildContributorResult(commits, { top: 1 })
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0]!.name).toBe('Alice')
  })

  it('computes stats correctly', () => {
    const result = buildContributorResult(commits)
    expect(result.stats.totalCommits).toBe(3)
    expect(result.stats.totalContributors).toBe(2)
  })

  it('handles empty commits', () => {
    const result = buildContributorResult([])
    expect(result.contributors).toEqual([])
    expect(result.stats.totalCommits).toBe(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatLeaderboard', () => {
  it('handles empty contributors', () => {
    expect(formatLeaderboard([])).toContain('No contributors')
  })

  it('renders contributor rows', () => {
    const c: Contributor[] = [
      { name: 'Alice', email: '', commitCount: 50, additions: 1000, deletions: 100, netChange: 900, filesChanged: 10, firstCommit: '2024-01-01', lastCommit: '2024-06-01', activeDays: 30, areas: [], expertise: [] },
    ]
    const output = formatLeaderboard(c)
    expect(output).toContain('Alice')
    expect(output).toContain('50')
  })
})

describe('formatDistributionChart', () => {
  it('renders bars', () => {
    const c: Contributor[] = [
      { name: 'Alice', email: '', commitCount: 60, additions: 0, deletions: 0, netChange: 0, filesChanged: 0, firstCommit: '', lastCommit: '', activeDays: 0, areas: [], expertise: [] },
      { name: 'Bob', email: '', commitCount: 30, additions: 0, deletions: 0, netChange: 0, filesChanged: 0, firstCommit: '', lastCommit: '', activeDays: 0, areas: [], expertise: [] },
    ]
    const output = formatDistributionChart(c)
    expect(output).toContain('Alice')
    expect(output).toContain('67%')
  })

  it('returns empty for no contributors', () => {
    expect(formatDistributionChart([])).toBe('')
  })
})

describe('formatBusFactor', () => {
  it('shows CRITICAL for 1', () => {
    expect(formatBusFactor(1)).toContain('CRITICAL')
  })

  it('shows WARNING for 2', () => {
    expect(formatBusFactor(2)).toContain('WARNING')
  })

  it('shows OK for 3+', () => {
    expect(formatBusFactor(3)).toContain('OK')
  })
})

describe('formatSilos', () => {
  it('shows message for no silos', () => {
    expect(formatSilos([])).toContain('No knowledge silos')
  })

  it('renders silo warnings', () => {
    const silos: KnowledgeSilos[] = [
      { file: 'src/core.ts', primaryAuthor: 'Alice', primaryPercentage: 0.95, risk: 'high' },
    ]
    const output = formatSilos(silos)
    expect(output).toContain('src/core.ts')
    expect(output).toContain('Alice')
  })
})

describe('formatExpertiseMap', () => {
  it('renders expertise', () => {
    const c: Contributor[] = [
      { name: 'Alice', email: '', commitCount: 10, additions: 0, deletions: 0, netChange: 0, filesChanged: 0, firstCommit: '', lastCommit: '', activeDays: 0, areas: [], expertise: ['src/ui', 'src/components'] },
    ]
    const output = formatExpertiseMap(c)
    expect(output).toContain('Alice')
    expect(output).toContain('src/ui')
  })
})

describe('formatContributorTable', () => {
  it('renders full table output', () => {
    const result: ContributorResult = {
      contributors: [
        { name: 'Alice', email: '', commitCount: 10, additions: 100, deletions: 10, netChange: 90, filesChanged: 5, firstCommit: '2024-01-01', lastCommit: '2024-06-01', activeDays: 10, areas: [], expertise: ['src/ui'] },
      ],
      distribution: { giniCoefficient: 0.2, topContributorPercentage: 1, busFactor: 1, totalContributors: 1, activeContributors: 1, newContributors: 0 },
      silos: [],
      stats: { totalCommits: 10, totalContributors: 1, averageCommitsPerContributor: 10, mostActiveContributor: 'Alice', longestTenure: 'Alice', newestContributor: 'Alice' },
      recommendations: ['Looks good!'],
    }
    const output = formatContributorTable(result, true)
    expect(output).toContain('Alice')
    expect(output).toContain('Bus Factor')
    expect(output).toContain('Distribution')
  })
})

describe('formatContributorJson', () => {
  it('produces valid JSON', () => {
    const result: ContributorResult = {
      contributors: [],
      distribution: { giniCoefficient: 0, topContributorPercentage: 0, busFactor: 0, totalContributors: 0, activeContributors: 0, newContributors: 0 },
      silos: [],
      stats: { totalCommits: 0, totalContributors: 0, averageCommitsPerContributor: 0, mostActiveContributor: '', longestTenure: '', newestContributor: '' },
      recommendations: [],
    }
    const json = formatContributorJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalCommits).toBe(0)
  })
})

describe('formatContributorCsv', () => {
  it('produces CSV with headers', () => {
    const result: ContributorResult = {
      contributors: [
        { name: 'Alice', email: 'a@b.com', commitCount: 10, additions: 100, deletions: 10, netChange: 90, filesChanged: 5, firstCommit: '', lastCommit: '', activeDays: 5, areas: [], expertise: [] },
      ],
      distribution: { giniCoefficient: 0, topContributorPercentage: 0, busFactor: 0, totalContributors: 0, activeContributors: 0, newContributors: 0 },
      silos: [],
      stats: { totalCommits: 10, totalContributors: 1, averageCommitsPerContributor: 10, mostActiveContributor: 'Alice', longestTenure: 'Alice', newestContributor: 'Alice' },
      recommendations: [],
    }
    const csv = formatContributorCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('name')
    expect(lines[1]).toContain('Alice')
    expect(lines[1]).toContain('10')
  })
})
