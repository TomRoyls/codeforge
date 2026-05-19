import { describe, it, expect } from 'vitest'

import {
  countDecisionPoints,
  computeFunctionComplexity,
  computeFileComplexity,
  computeHotspotScore,
  classifyRisk,
  computeDistribution,
  findTopHotspots,
  computeHotspotStats,
  generateHotspotRecommendations,
  buildHotspotResult,
  type FileCommitData,
  type HotspotEntry,
  type HotspotStats,
} from '../src/commands/hotspot-helpers.js'

import {
  formatHotspotTable,
  formatDistributionChart,
  formatTopHotspotsDetail,
  formatHotspotResultTable,
  formatHotspotJson,
  formatHotspotCsv,
} from '../src/commands/hotspot-format-helpers.js'

// ─── countDecisionPoints ──────────────────────────────────────────────────────

describe('countDecisionPoints', () => {
  it('returns 0 for empty code', () => {
    expect(countDecisionPoints('')).toBe(0)
  })

  it('counts if statements', () => {
    expect(countDecisionPoints('if (x) { }')).toBe(1)
  })

  it('counts else if as both else-if and if', () => {
    expect(countDecisionPoints('if (a) { } else if (b) { }')).toBe(3)
  })

  it('counts for loops', () => {
    expect(countDecisionPoints('for (let i = 0; i < n; i++) { }')).toBe(1)
  })

  it('counts while loops', () => {
    expect(countDecisionPoints('while (x) { }')).toBe(1)
  })

  it('counts switch case', () => {
    expect(countDecisionPoints('switch(x) { case 1: break; case 2: break; }')).toBe(2)
  })

  it('counts catch blocks', () => {
    expect(countDecisionPoints('try { } catch(e) { }')).toBe(1)
  })

  it('counts logical AND', () => {
    expect(countDecisionPoints('a && b')).toBe(1)
  })

  it('counts logical OR', () => {
    expect(countDecisionPoints('a || b')).toBe(1)
  })

  it('counts nullish coalescing', () => {
    expect(countDecisionPoints('a ?? b')).toBe(1)
  })

  it('counts optional chaining', () => {
    expect(countDecisionPoints('a?.b')).toBe(1)
  })

  it('counts multiple patterns', () => {
    const code = 'if (a) { } for (let i = 0; i < n; i++) { } x && y'
    expect(countDecisionPoints(code)).toBe(3)
  })

  it('counts double match for if inside else if', () => {
    expect(countDecisionPoints('else if (x) { }')).toBe(2)
  })

  it('handles complex nesting', () => {
    const code = 'if (a) { if (b) { for (let i = 0; i < n; i++) { x && y } } }'
    expect(countDecisionPoints(code)).toBe(4)
  })

  it('counts only case keyword not default in switch', () => {
    expect(countDecisionPoints('switch(x) { case 1: break; default: break; }')).toBe(1)
  })
})

// ─── computeFunctionComplexity ────────────────────────────────────────────────

describe('computeFunctionComplexity', () => {
  it('returns empty array for non-function content', () => {
    expect(computeFunctionComplexity('const x = 1')).toEqual([])
  })

  it('detects exported function', () => {
    const result = computeFunctionComplexity('export function hello() { return 1 }')
    expect(result.length).toBe(1)
    expect(result[0]!.name).toBe('hello')
    expect(result[0]!.complexity).toBeGreaterThanOrEqual(1)
  })

  it('detects const arrow function via const assignment', () => {
    const result = computeFunctionComplexity('const greet = () => { return 1 }')
    expect(result.length).toBe(1)
    expect(result[0]!.name).toBe('greet')
  })

  it('detects async function', () => {
    const result = computeFunctionComplexity('async function fetchData() { }')
    expect(result.length).toBe(1)
    expect(result[0]!.name).toBe('fetchData')
  })

  it('counts complexity within function', () => {
    const code = 'function complex() { if (a) { for (let i = 0; i < n; i++) { } } }'
    const result = computeFunctionComplexity(code)
    expect(result.length).toBe(1)
    expect(result[0]!.complexity).toBeGreaterThanOrEqual(3)
  })

  it('sets lineStart to 1 for first line', () => {
    const result = computeFunctionComplexity('function foo() { }')
    expect(result[0]!.lineStart).toBe(1)
  })

  it('sets size to number of lines', () => {
    const code = 'function foo() {\n  const x = 1\n  return x\n}'
    const result = computeFunctionComplexity(code)
    expect(result[0]!.size).toBeGreaterThanOrEqual(4)
  })

  it('computes score from complexity and size', () => {
    const code = 'function foo() {\n  if (a) { }\n  if (b) { }\n  if (c) { }\n}'
    const result = computeFunctionComplexity(code)
    expect(result[0]!.complexity).toBeGreaterThanOrEqual(4)
    expect(result[0]!.score).toBeGreaterThan(0)
  })

  it('classifies risk level', () => {
    const simple = computeFunctionComplexity('function simple() { }')
    expect(simple[0]!.riskLevel).toBe('low')

    const complexCode = 'function complex() { ' + 'if (a) { } '.repeat(20) + '}'
    const complex = computeFunctionComplexity(complexCode)
    expect(complex[0]!.riskLevel).toBe('high')
  })

  it('handles multiple functions', () => {
    const code = 'function a() { }\nfunction b() { }'
    const result = computeFunctionComplexity(code)
    expect(result.length).toBe(2)
  })
})

// ─── computeFileComplexity ────────────────────────────────────────────────────

describe('computeFileComplexity', () => {
  it('returns 1 for empty file', () => {
    expect(computeFileComplexity('')).toBe(1)
  })

  it('counts complexity from functions', () => {
    const code = 'function a() { if (x) { } }\nfunction b() { for (let i = 0; i < n; i++) { } }'
    const result = computeFileComplexity(code)
    expect(result).toBeGreaterThanOrEqual(4)
  })

  it('returns complexity number', () => {
    const code = 'function foo() { if (a) { } }'
    expect(typeof computeFileComplexity(code)).toBe('number')
  })

  it('handles file with no functions', () => {
    const code = 'if (x) { }\nconst y = a && b'
    const result = computeFileComplexity(code)
    expect(result).toBeGreaterThanOrEqual(3)
  })

  it('handles single function file', () => {
    const code = 'export function main() { if (a) { return 1 } return 0 }'
    const result = computeFileComplexity(code)
    expect(result).toBeGreaterThanOrEqual(2)
  })
})

// ─── computeHotspotScore ──────────────────────────────────────────────────────

describe('computeHotspotScore', () => {
  it('returns 0 when normalized against max', () => {
    expect(computeHotspotScore(0, 0, 100, 100)).toBe(0)
  })

  it('returns higher score for high complexity and changes', () => {
    const low = computeHotspotScore(2, 1, 100, 100)
    const high = computeHotspotScore(80, 90, 100, 100)
    expect(high).toBeGreaterThan(low)
  })

  it('normalizes to 0-100 range', () => {
    const score = computeHotspotScore(50, 50, 100, 100)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('weights complexity and frequency equally', () => {
    const scoreA = computeHotspotScore(100, 0, 100, 100)
    const scoreB = computeHotspotScore(0, 100, 100, 100)
    expect(Math.abs(scoreA - scoreB)).toBeLessThanOrEqual(1)
  })

  it('maximizes at 100 for extreme values', () => {
    const score = computeHotspotScore(500, 500, 100, 100)
    expect(score).toBe(100)
  })

  it('handles zero max values', () => {
    const score = computeHotspotScore(10, 5, 0, 0)
    expect(score).toBe(0)
  })

  it('handles partial max values', () => {
    const score = computeHotspotScore(50, 0, 100, 0)
    expect(score).toBe(25)
  })

  it('rounds to one decimal', () => {
    const score = computeHotspotScore(33, 33, 100, 100)
    expect(String(score)).toMatch(/^\d+(\.\d)?$/)
  })
})

// ─── classifyRisk ─────────────────────────────────────────────────────────────

describe('classifyRisk', () => {
  it('classifies 0-24 as low', () => {
    expect(classifyRisk(0)).toBe('low')
    expect(classifyRisk(24)).toBe('low')
  })

  it('classifies 25-49 as medium', () => {
    expect(classifyRisk(25)).toBe('medium')
    expect(classifyRisk(49)).toBe('medium')
  })

  it('classifies 50-74 as high', () => {
    expect(classifyRisk(50)).toBe('high')
    expect(classifyRisk(74)).toBe('high')
  })

  it('classifies 75+ as critical', () => {
    expect(classifyRisk(75)).toBe('critical')
    expect(classifyRisk(100)).toBe('critical')
  })

  it('handles boundary at 25', () => {
    expect(classifyRisk(24)).toBe('low')
    expect(classifyRisk(25)).toBe('medium')
  })

  it('handles boundary at 50', () => {
    expect(classifyRisk(49)).toBe('medium')
    expect(classifyRisk(50)).toBe('high')
  })

  it('handles boundary at 75', () => {
    expect(classifyRisk(74)).toBe('high')
    expect(classifyRisk(75)).toBe('critical')
  })
})

// ─── computeDistribution ──────────────────────────────────────────────────────

describe('computeDistribution', () => {
  it('returns zeroed distribution for empty input', () => {
    const dist = computeDistribution([])
    expect(dist).toEqual({ low: 0, medium: 0, high: 0, critical: 0 })
  })

  it('counts risk levels correctly', () => {
    const entries = [
      { riskLevel: 'low' as const },
      { riskLevel: 'low' as const },
      { riskLevel: 'medium' as const },
      { riskLevel: 'high' as const },
      { riskLevel: 'critical' as const },
    ] as HotspotEntry[]
    const dist = computeDistribution(entries)
    expect(dist).toEqual({ low: 2, medium: 1, high: 1, critical: 1 })
  })

  it('handles all same risk level', () => {
    const entries = [{ riskLevel: 'low' as const }, { riskLevel: 'low' as const }] as HotspotEntry[]
    const dist = computeDistribution(entries)
    expect(dist).toEqual({ low: 2, medium: 0, high: 0, critical: 0 })
  })

  it('handles all critical', () => {
    const entries = [{ riskLevel: 'critical' as const }, { riskLevel: 'critical' as const }, { riskLevel: 'critical' as const }] as HotspotEntry[]
    const dist = computeDistribution(entries)
    expect(dist).toEqual({ low: 0, medium: 0, high: 0, critical: 3 })
  })
})

// ─── findTopHotspots ──────────────────────────────────────────────────────────

describe('findTopHotspots', () => {
  const makeEntry = (file: string, score: number): HotspotEntry => ({
    file,
    complexity: score,
    changeFrequency: score,
    linesOfCode: 50,
    hotspotScore: score,
    riskLevel: classifyRisk(score),
    functions: [],
    lastChanged: '',
    authors: [],
  })

  it('returns empty array for no hotspots', () => {
    expect(findTopHotspots([], 5)).toEqual([])
  })

  it('sorts by hotspotScore descending', () => {
    const entries = [makeEntry('a.ts', 60), makeEntry('b.ts', 90), makeEntry('c.ts', 75)]
    const result = findTopHotspots(entries, 10)
    expect(result[0].file).toBe('b.ts')
    expect(result[1].file).toBe('c.ts')
    expect(result[2].file).toBe('a.ts')
  })

  it('respects count parameter', () => {
    const entries = Array.from({ length: 20 }, (_, i) => makeEntry(`f${i}.ts`, 90 - i))
    const result = findTopHotspots(entries, 5)
    expect(result.length).toBe(5)
  })

  it('returns all when count exceeds length', () => {
    const entries = [makeEntry('a.ts', 80)]
    const result = findTopHotspots(entries, 10)
    expect(result.length).toBe(1)
  })
})

// ─── computeHotspotStats ──────────────────────────────────────────────────────

describe('computeHotspotStats', () => {
  const makeEntry = (score: number, risk: 'low' | 'medium' | 'high' | 'critical'): HotspotEntry => ({
    file: 'f.ts',
    complexity: 10,
    changeFrequency: 5,
    linesOfCode: 50,
    hotspotScore: score,
    riskLevel: risk,
    functions: [],
    lastChanged: '',
    authors: [],
  })

  it('returns zero stats for empty input', () => {
    const stats = computeHotspotStats([])
    expect(stats.totalFiles).toBe(0)
    expect(stats.hotspotFiles).toBe(0)
    expect(stats.criticalFiles).toBe(0)
    expect(stats.averageScore).toBe(0)
    expect(stats.maxScore).toBe(0)
    expect(stats.totalComplexity).toBe(0)
    expect(stats.averageChangeFrequency).toBe(0)
  })

  it('computes correct totals', () => {
    const entries = [
      makeEntry(80, 'critical'),
      makeEntry(60, 'high'),
      makeEntry(30, 'medium'),
    ]
    const stats = computeHotspotStats(entries)
    expect(stats.totalFiles).toBe(3)
    expect(stats.hotspotFiles).toBe(1)
    expect(stats.criticalFiles).toBe(1)
    expect(stats.averageScore).toBeCloseTo((80 + 60 + 30) / 3, 0)
    expect(stats.maxScore).toBe(80)
  })

  it('counts hotspotFiles as those >= threshold', () => {
    const entries = [
      makeEntry(90, 'critical'),
      makeEntry(70, 'high'),
      makeEntry(69, 'medium'),
    ]
    const stats = computeHotspotStats(entries)
    expect(stats.hotspotFiles).toBe(2)
  })

  it('counts criticalFiles as critical risk', () => {
    const entries = [
      makeEntry(80, 'critical'),
      makeEntry(80, 'critical'),
      makeEntry(60, 'high'),
    ]
    const stats = computeHotspotStats(entries)
    expect(stats.criticalFiles).toBe(2)
  })

  it('computes totalComplexity', () => {
    const e1: HotspotEntry = { ...makeEntry(50, 'high'), complexity: 20 }
    const e2: HotspotEntry = { ...makeEntry(50, 'high'), complexity: 30 }
    const stats = computeHotspotStats([e1, e2])
    expect(stats.totalComplexity).toBe(50)
  })

  it('computes averageChangeFrequency', () => {
    const e1: HotspotEntry = { ...makeEntry(50, 'high'), changeFrequency: 10 }
    const e2: HotspotEntry = { ...makeEntry(50, 'high'), changeFrequency: 20 }
    const stats = computeHotspotStats([e1, e2])
    expect(stats.averageChangeFrequency).toBe(15)
  })
})

// ─── generateHotspotRecommendations ───────────────────────────────────────────

describe('generateHotspotRecommendations', () => {
  const makeEntry = (file: string, score: number, complexity: number, changeFrequency: number): HotspotEntry => ({
    file,
    hotspotScore: score,
    riskLevel: classifyRisk(score),
    complexity,
    changeFrequency,
    linesOfCode: 100,
    functions: [],
    lastChanged: '',
    authors: [],
  })

  const emptyStats: HotspotStats = {
    totalFiles: 5,
    hotspotFiles: 0,
    averageScore: 0,
    maxScore: 0,
    criticalFiles: 0,
    totalComplexity: 0,
    averageChangeFrequency: 0,
  }

  it('returns default message for no critical hotspots', () => {
    const recs = generateHotspotRecommendations([], emptyStats)
    expect(recs).toEqual(['No critical hotspots detected. Codebase looks manageable.'])
  })

  it('recommends refactoring for critical hotspots', () => {
    const entries = [makeEntry('a.ts', 90, 30, 10)]
    const recs = generateHotspotRecommendations(entries, { ...emptyStats, criticalFiles: 1 })
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('recommends splitting complex and frequently changed files', () => {
    const entries = [makeEntry('big.ts', 80, 25, 10)]
    const recs = generateHotspotRecommendations(entries, { ...emptyStats, criticalFiles: 1 })
    expect(recs.some((r) => r.includes('splitting') || r.includes('complex and frequently'))).toBe(true)
  })

  it('recommends high-risk test coverage', () => {
    const entries = [makeEntry('high.ts', 60, 10, 5)]
    const recs = generateHotspotRecommendations(entries, emptyStats)
    expect(recs.some((r) => r.includes('high-risk') || r.includes('test coverage'))).toBe(true)
  })

  it('warns about too many critical hotspots', () => {
    const stats: HotspotStats = { totalFiles: 10, hotspotFiles: 0, averageScore: 0, maxScore: 0, criticalFiles: 3, totalComplexity: 0, averageChangeFrequency: 0 }
    const entries = [makeEntry('a.ts', 90, 20, 5), makeEntry('b.ts', 90, 20, 5), makeEntry('c.ts', 90, 20, 5)]
    const recs = generateHotspotRecommendations(entries, stats)
    expect(recs.some((r) => r.includes('20%') || r.includes('refactoring sprint'))).toBe(true)
  })

  it('limits critical recommendations to 3', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry(`f${i}.ts`, 90, 30, 10))
    const stats: HotspotStats = { totalFiles: 10, hotspotFiles: 10, averageScore: 90, maxScore: 90, criticalFiles: 10, totalComplexity: 300, averageChangeFrequency: 10 }
    const recs = generateHotspotRecommendations(entries, stats)
    const criticalRecs = recs.filter((r) => r.startsWith('Critical hotspot'))
    expect(criticalRecs.length).toBeLessThanOrEqual(3)
  })
})

// ─── buildHotspotResult ───────────────────────────────────────────────────────

describe('buildHotspotResult', () => {
  it('returns empty result for no files', () => {
    const result = buildHotspotResult([], [], [])
    expect(result.hotspots).toEqual([])
    expect(result.topHotspots).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes files and returns hotspots', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'function a() { if (x) { } if (y) { } if (z) { } }',
      'function b() { return 1 }',
    ]
    const commits: FileCommitData[] = [
      { file: 'a.ts', commitCount: 50, lastChanged: '2025-01-01', authors: ['alice'] },
      { file: 'b.ts', commitCount: 1, lastChanged: '2025-01-01', authors: ['bob'] },
    ]
    const result = buildHotspotResult(files, contents, commits)
    expect(result.hotspots.length).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('computes hotspot score from complexity and commits', () => {
    const files = ['complex.ts']
    const contents = ['function f() { ' + 'if (a) { } '.repeat(20) + '}']
    const commits: FileCommitData[] = [
      { file: 'complex.ts', commitCount: 100, lastChanged: '2025-01-01', authors: [] },
    ]
    const result = buildHotspotResult(files, contents, commits)
    expect(result.hotspots[0]!.hotspotScore).toBeGreaterThan(0)
  })

  it('includes distribution', () => {
    const files = ['a.ts']
    const contents = ['function a() { }']
    const commits: FileCommitData[] = [{ file: 'a.ts', commitCount: 0, lastChanged: '', authors: [] }]
    const result = buildHotspotResult(files, contents, commits)
    expect(result.distribution).toBeDefined()
    const total = result.distribution.low + result.distribution.medium + result.distribution.high + result.distribution.critical
    expect(total).toBe(1)
  })

  it('includes recommendations', () => {
    const files = ['hot.ts']
    const contents = ['function f() { ' + 'if (a) { } '.repeat(25) + '}']
    const commits: FileCommitData[] = [{ file: 'hot.ts', commitCount: 100, lastChanged: '', authors: [] }]
    const result = buildHotspotResult(files, contents, commits)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('maps commit data to change frequency', () => {
    const files = ['a.ts']
    const contents = ['function f() { }']
    const commits: FileCommitData[] = [{ file: 'a.ts', commitCount: 42, lastChanged: '', authors: [] }]
    const result = buildHotspotResult(files, contents, commits)
    expect(result.hotspots[0]!.changeFrequency).toBe(42)
  })

  it('topHotspots returns top 10 by score', () => {
    const files = Array.from({ length: 15 }, (_, i) => `f${i}.ts`)
    const contents = files.map((_, i) => `function f() { ${'if (a) { } '.repeat(i + 1)} }`)
    const commits: FileCommitData[] = files.map((f, i) => ({ file: f, commitCount: (15 - i) * 10, lastChanged: '', authors: [] }))
    const result = buildHotspotResult(files, contents, commits)
    expect(result.topHotspots.length).toBe(10)
  })

  it('handles files with no commit data', () => {
    const files = ['orphan.ts']
    const contents = ['function f() { }']
    const result = buildHotspotResult(files, contents, [])
    expect(result.hotspots[0]!.changeFrequency).toBe(0)
    expect(result.hotspots[0]!.lastChanged).toBe('')
    expect(result.hotspots[0]!.authors).toEqual([])
  })

  it('includes function-level data in hotspots', () => {
    const files = ['fn.ts']
    const contents = ['function foo() { if (a) { } }\nfunction bar() { }']
    const result = buildHotspotResult(files, contents, [])
    expect(result.hotspots[0]!.functions.length).toBe(2)
    expect(result.hotspots[0]!.functions[0]!.name).toBe('foo')
    expect(result.hotspots[0]!.functions[1]!.name).toBe('bar')
  })
})

// ─── formatHotspotTable ───────────────────────────────────────────────────────

describe('formatHotspotTable', () => {
  const makeEntry = (file: string, score: number): HotspotEntry => ({
    file,
    complexity: 10,
    changeFrequency: 5,
    linesOfCode: 100,
    hotspotScore: score,
    riskLevel: classifyRisk(score),
    functions: [],
    lastChanged: '',
    authors: [],
  })

  it('returns message for empty hotspots', () => {
    const output = formatHotspotTable([])
    expect(output).toContain('No hotspots')
  })

  it('renders table with headers', () => {
    const hotspots = [makeEntry('src/app.ts', 80)]
    const output = formatHotspotTable(hotspots)
    expect(output).toContain('Code Hotspots')
    expect(output).toContain('app.ts')
    expect(output).toContain('CRITICAL')
  })

  it('truncates long file paths', () => {
    const longPath = 'src/very/deeply/nested/directory/structure/that/is/long.ts'
    const hotspots = [makeEntry(longPath, 60)]
    const output = formatHotspotTable(hotspots)
    expect(output).toContain('...')
  })

  it('shows overflow message for 20+ hotspots', () => {
    const hotspots = Array.from({ length: 25 }, (_, i) => makeEntry(`f${i}.ts`, 80))
    const output = formatHotspotTable(hotspots)
    expect(output).toContain('and 5 more')
  })

  it('color-codes risk badges', () => {
    const hotspots = [makeEntry('a.ts', 30)]
    const output = formatHotspotTable(hotspots)
    expect(output).toContain('MED')
  })
})

// ─── formatDistributionChart ──────────────────────────────────────────────────

describe('formatDistributionChart', () => {
  it('returns empty string for zero distribution', () => {
    expect(formatDistributionChart({ low: 0, medium: 0, high: 0, critical: 0 })).toBe('')
  })

  it('renders chart with bars', () => {
    const output = formatDistributionChart({ low: 10, medium: 5, high: 3, critical: 1 })
    expect(output).toContain('Risk Distribution')
    expect(output).toContain('critical')
    expect(output).toContain('high')
    expect(output).toContain('medium')
    expect(output).toContain('low')
  })

  it('includes count labels', () => {
    const output = formatDistributionChart({ low: 10, medium: 0, high: 0, critical: 0 })
    expect(output).toContain('10')
  })

  it('uses block characters for bars', () => {
    const output = formatDistributionChart({ low: 5, medium: 0, high: 0, critical: 0 })
    expect(output).toContain('█')
  })
})

// ─── formatTopHotspotsDetail ──────────────────────────────────────────────────

describe('formatTopHotspotsDetail', () => {
  const makeEntry = (file: string, score: number): HotspotEntry => ({
    file,
    complexity: 10,
    changeFrequency: 5,
    linesOfCode: 100,
    hotspotScore: score,
    riskLevel: classifyRisk(score),
    functions: [
      { name: 'init', lineStart: 1, size: 10, complexity: 5, score: 50, riskLevel: 'high' },
      { name: 'render', lineStart: 11, size: 20, complexity: 8, score: 70, riskLevel: 'high' },
    ],
    lastChanged: '',
    authors: [],
  })

  it('returns empty string for no hotspots', () => {
    expect(formatTopHotspotsDetail([])).toBe('')
  })

  it('renders function breakdown', () => {
    const hotspots = [makeEntry('app.ts', 80)]
    const output = formatTopHotspotsDetail(hotspots)
    expect(output).toContain('app.ts')
    expect(output).toContain('init')
    expect(output).toContain('render')
  })

  it('limits to 5 hotspots', () => {
    const hotspots = Array.from({ length: 10 }, (_, i) => makeEntry(`f${i}.ts`, 80))
    const output = formatTopHotspotsDetail(hotspots)
    expect(output).toContain('f0.ts')
    expect(output).toContain('f4.ts')
  })

  it('shows overflow for functions', () => {
    const entry: HotspotEntry = {
      ...makeEntry('app.ts', 80),
      functions: Array.from({ length: 10 }, (_, i) => ({
        name: `fn${i}`,
        lineStart: i * 10,
        size: 5,
        complexity: 3,
        score: 30,
        riskLevel: 'medium' as const,
      })),
    }
    const output = formatTopHotspotsDetail([entry])
    expect(output).toContain('and 5 more functions')
  })
})

// ─── formatHotspotResultTable ─────────────────────────────────────────────────

describe('formatHotspotResultTable', () => {
  it('renders full result', () => {
    const result = buildHotspotResult(
      ['a.ts'],
      ['function f() { if(x){} if(y){} }'],
      [{ file: 'a.ts', commitCount: 10, lastChanged: '2025-01-01', authors: ['alice'] }],
    )
    const output = formatHotspotResultTable(result, false)
    expect(output).toContain('Code Hotspots')
    expect(output).toContain('Risk Distribution')
    expect(output).toContain('Files:')
  })

  it('includes verbose details when verbose=true', () => {
    const result = buildHotspotResult(
      ['a.ts'],
      ['function foo() { if(x){} if(y){} if(z){} }'],
      [{ file: 'a.ts', commitCount: 50, lastChanged: '2025-01-01', authors: [] }],
    )
    const output = formatHotspotResultTable(result, true)
    expect(output).toContain('Function Breakdown')
  })

  it('includes recommendations when present', () => {
    const result = buildHotspotResult(
      ['hot.ts'],
      ['function f() { ' + 'if (a) { } '.repeat(25) + '}'],
      [{ file: 'hot.ts', commitCount: 100, lastChanged: '', authors: [] }],
    )
    const output = formatHotspotResultTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatHotspotJson ────────────────────────────────────────────────────────

describe('formatHotspotJson', () => {
  it('returns valid JSON', () => {
    const result = buildHotspotResult([], [], [])
    const output = formatHotspotJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('hotspots')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('distribution')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('includes hotspot data', () => {
    const result = buildHotspotResult(
      ['a.ts'],
      ['function f() { if(x){} }'],
      [{ file: 'a.ts', commitCount: 5, lastChanged: '', authors: [] }],
    )
    const output = formatHotspotJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.hotspots.length).toBe(1)
    expect(parsed.hotspots[0].file).toBe('a.ts')
  })
})

// ─── formatHotspotCsv ─────────────────────────────────────────────────────────

describe('formatHotspotCsv', () => {
  it('includes header row', () => {
    const result = buildHotspotResult([], [], [])
    const output = formatHotspotCsv(result)
    expect(output).toContain('file,score,complexity,changeFrequency,riskLevel,linesOfCode')
  })

  it('includes data rows', () => {
    const result = buildHotspotResult(
      ['a.ts'],
      ['function f() { if(x){} }'],
      [{ file: 'a.ts', commitCount: 5, lastChanged: '', authors: [] }],
    )
    const output = formatHotspotCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[1]).toContain('a.ts')
  })

  it('handles multiple files', () => {
    const result = buildHotspotResult(
      ['a.ts', 'b.ts'],
      ['function f() { }', 'function g() { }'],
      [
        { file: 'a.ts', commitCount: 5, lastChanged: '', authors: [] },
        { file: 'b.ts', commitCount: 3, lastChanged: '', authors: [] },
      ],
    )
    const output = formatHotspotCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(3)
  })
})
