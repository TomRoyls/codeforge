import { describe, expect, it } from 'vitest'

import {
  analyzeTrends,
  assessCurrentState,
  buildTimeCapsuleResult,
  captureSnapshot,
  classifyMaturity,
  computeComplexity,
  computeConsistencyIndex,
  computeCouplingIndex,
  computeDocumentation,
  computeMaturityIndex,
  computeResilience,
  countExports,
  countFunctions,
  countImports,
  countLines,
  generatePredictions,
  generateRecommendations,
  isTestFile,
  measureGrowth,
  type CapsuleStats,
  type CurrentState,
  type GrowthMetrics,
  type Prediction,
  type TrendIndicator,
} from '../src/commands/time-capsule-helpers.js'

import {
  formatCapsuleStats,
  formatMetricsDashboard,
  formatPredictions,
  formatRecommendations,
  formatStatePortrait,
  formatTimeCapsuleJSON,
  formatTimeCapsuleTable,
  formatTrends,
} from '../src/commands/time-capsule-format-helpers.js'

// ─── countLines ─────────────────────────────────────────────────────────────────

describe('countLines', () => {
  it('counts lines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('counts single line', () => {
    expect(countLines('hello')).toBe(1)
  })

  it('counts empty string', () => {
    expect(countLines('')).toBe(1)
  })

  it('counts trailing newline', () => {
    expect(countLines('a\n')).toBe(2)
  })
})

// ─── countFunctions ─────────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function foo() {} function bar() {}')).toBe(2)
  })

  it('counts async functions', () => {
    expect(countFunctions('async function run() {}')).toBe(1)
  })

  it('counts exported functions', () => {
    expect(countFunctions('export function pub() {}')).toBe(1)
  })

  it('returns 0 for no functions', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })
})

// ─── countExports ───────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts named exports', () => {
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('counts function exports', () => {
    expect(countExports('export function foo() {}')).toBe(1)
  })

  it('counts destructured exports', () => {
    expect(countExports('export { foo, bar }')).toBe(1)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── countImports ───────────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts imports', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
  })

  it('counts multiple imports', () => {
    expect(countImports('import { a } from "x"\nimport { b } from "y"')).toBe(2)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

// ─── computeComplexity ──────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('increases with branches', () => {
    const simple = computeComplexity('const x = 1')
    const complex = computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
    expect(complex).toBeGreaterThan(simple)
  })

  it('counts switch cases', () => {
    const c = computeComplexity('switch(x) { case 1: break; case 2: break; }')
    expect(c).toBeGreaterThanOrEqual(3)
  })
})

// ─── computeDocumentation ───────────────────────────────────────────────────────

describe('computeDocumentation', () => {
  it('returns 0 for empty', () => {
    expect(computeDocumentation('')).toBe(0)
  })

  it('counts JSDoc comments', () => {
    const doc = computeDocumentation('/** docs */\nfunction foo() {}')
    expect(doc).toBeGreaterThan(0)
  })

  it('counts inline comments', () => {
    const doc = computeDocumentation('// comment\nconst x = 1')
    expect(doc).toBeGreaterThan(0)
  })

  it('returns 0 for no comments', () => {
    expect(computeDocumentation('const x = 1\nreturn x')).toBe(0)
  })

  it('caps at 100', () => {
    const allComments = Array.from({ length: 50 }, () => '// comment').join('\n')
    expect(computeDocumentation(allComments)).toBeLessThanOrEqual(100)
  })
})

// ─── isTestFile ─────────────────────────────────────────────────────────────────

describe('isTestFile', () => {
  it('detects .test.ts', () => {
    expect(isTestFile('foo.test.ts')).toBe(true)
  })

  it('detects .spec.js', () => {
    expect(isTestFile('bar.spec.js')).toBe(true)
  })

  it('returns false for normal files', () => {
    expect(isTestFile('foo.ts')).toBe(false)
  })

  it('returns false for non-test in name', () => {
    expect(isTestFile('testify.ts')).toBe(false)
  })
})

// ─── captureSnapshot ────────────────────────────────────────────────────────────

describe('captureSnapshot', () => {
  it('creates snapshot with timestamp', () => {
    const snap = captureSnapshot(5, '1.0.0')
    expect(snap.timestamp).toBeTruthy()
    expect(snap.version).toBe('1.0.0')
  })

  it('includes file count in summary', () => {
    const snap = captureSnapshot(42, '2.0.0')
    expect(snap.summary).toContain('42')
  })
})

// ─── classifyMaturity ───────────────────────────────────────────────────────────

describe('classifyMaturity', () => {
  it('classifies infant', () => {
    expect(classifyMaturity(0, 3, 2)).toBe('infant')
  })

  it('classifies child', () => {
    expect(classifyMaturity(30, 15, 3)).toBe('child')
  })

  it('classifies adolescent by size', () => {
    expect(classifyMaturity(0, 50, 5)).toBe('adolescent')
  })

  it('classifies adult', () => {
    expect(classifyMaturity(365, 200, 6)).toBe('adult')
  })

  it('classifies elder by age', () => {
    expect(classifyMaturity(800, 100, 5)).toBe('elder')
  })

  it('classifies elder by size', () => {
    expect(classifyMaturity(0, 600, 8)).toBe('elder')
  })
})

// ─── computeMaturityIndex ───────────────────────────────────────────────────────

describe('computeMaturityIndex', () => {
  it('returns low for young small codebase', () => {
    expect(computeMaturityIndex(0, 5, 2)).toBeLessThan(30)
  })

  it('returns high for mature codebase', () => {
    expect(computeMaturityIndex(365, 200, 8)).toBeGreaterThan(50)
  })

  it('caps at 100', () => {
    expect(computeMaturityIndex(1000, 1000, 20)).toBeLessThanOrEqual(100)
  })
})

// ─── computeCouplingIndex ───────────────────────────────────────────────────────

describe('computeCouplingIndex', () => {
  it('returns 0 for empty', () => {
    expect(computeCouplingIndex([])).toBe(0)
  })

  it('increases with imports', () => {
    const low = computeCouplingIndex(['const x = 1'])
    const high = computeCouplingIndex(['import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"'])
    expect(high).toBeGreaterThan(low)
  })
})

// ─── computeConsistencyIndex ────────────────────────────────────────────────────

describe('computeConsistencyIndex', () => {
  it('returns 0 for empty', () => {
    expect(computeConsistencyIndex([])).toBe(0)
  })

  it('returns base for single file', () => {
    expect(computeConsistencyIndex(['const x = 1'])).toBe(80)
  })

  it('rewards consistent patterns', () => {
    const files = [
      'export function foo(): string { return "hi" }\n/** docs */',
      'export function bar(): number { return 1 }\n/** docs */',
    ]
    const score = computeConsistencyIndex(files)
    expect(score).toBeGreaterThan(50)
  })
})

// ─── computeResilience ──────────────────────────────────────────────────────────

describe('computeResilience', () => {
  it('computes from metrics and state', () => {
    const metrics: GrowthMetrics = {
      totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
      avgComplexity: 3, avgDocumentation: 40, testRatio: 0.5, dependencyRatio: 2,
      couplingIndex: 20, consistencyScore: 70,
    }
    const state: CurrentState = {
      health: 75, maturity: 'adult', personality: [], strengths: [], weaknesses: [],
      achievements: [], concerns: [],
    }
    const resilience = computeResilience(metrics, state)
    expect(resilience).toBeGreaterThan(0)
    expect(resilience).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeTrends ──────────────────────────────────────────────────────────────

describe('analyzeTrends', () => {
  it('returns trends for all metrics', () => {
    const metrics: GrowthMetrics = {
      totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
      avgComplexity: 3, avgDocumentation: 40, testRatio: 0.5, dependencyRatio: 2,
      couplingIndex: 20, consistencyScore: 70,
    }
    const trends = analyzeTrends(metrics)
    expect(trends.length).toBe(5)
    expect(trends.map((t) => t.metric)).toContain('Complexity')
    expect(trends.map((t) => t.metric)).toContain('Documentation')
  })

  it('detects improving documentation', () => {
    const metrics: GrowthMetrics = {
      totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
      avgComplexity: 3, avgDocumentation: 50, testRatio: 0.5, dependencyRatio: 2,
      couplingIndex: 20, consistencyScore: 70,
    }
    const trends = analyzeTrends(metrics)
    const doc = trends.find((t) => t.metric === 'Documentation')
    expect(doc?.direction).toBe('improving')
  })

  it('detects declining complexity', () => {
    const metrics: GrowthMetrics = {
      totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
      avgComplexity: 12, avgDocumentation: 50, testRatio: 0.5, dependencyRatio: 2,
      couplingIndex: 20, consistencyScore: 70,
    }
    const trends = analyzeTrends(metrics)
    const comp = trends.find((t) => t.metric === 'Complexity')
    expect(comp?.direction).toBe('declining')
  })
})

// ─── generatePredictions ────────────────────────────────────────────────────────

describe('generatePredictions', () => {
  const baseState: CurrentState = {
    health: 75, maturity: 'adult', personality: [], strengths: [], weaknesses: [],
    achievements: [], concerns: [],
  }
  const baseMetrics: GrowthMetrics = {
    totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
    avgComplexity: 3, avgDocumentation: 50, testRatio: 0.5, dependencyRatio: 2,
    couplingIndex: 20, consistencyScore: 70,
  }

  it('predicts refactoring need for high complexity', () => {
    const metrics = { ...baseMetrics, avgComplexity: 10 }
    const trends: TrendIndicator[] = [{ metric: 'Complexity', direction: 'declining', velocity: -2, confidence: 60 }]
    const preds = generatePredictions(baseState, metrics, trends)
    expect(preds.some((p) => p.category === 'Maintenance')).toBe(true)
  })

  it('predicts regression risk for low tests', () => {
    const metrics = { ...baseMetrics, testRatio: 0.05 }
    const trends: TrendIndicator[] = [{ metric: 'Test Coverage', direction: 'declining', velocity: -3, confidence: 50 }]
    const preds = generatePredictions(baseState, metrics, trends)
    expect(preds.some((p) => p.category === 'Risk')).toBe(true)
  })

  it('predicts growth for healthy codebase', () => {
    const trends: TrendIndicator[] = []
    const preds = generatePredictions({ ...baseState, health: 80 }, baseMetrics, trends)
    expect(preds.some((p) => p.category === 'Growth')).toBe(true)
  })

  it('predicts architecture issues for high coupling', () => {
    const metrics = { ...baseMetrics, couplingIndex: 75 }
    const trends: TrendIndicator[] = []
    const preds = generatePredictions(baseState, metrics, trends)
    expect(preds.some((p) => p.category === 'Architecture')).toBe(true)
  })

  it('returns default for balanced metrics', () => {
    const preds = generatePredictions(baseState, baseMetrics, [])
    expect(preds.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseState: CurrentState = {
    health: 65, maturity: 'adult', personality: [], strengths: ['Documentation (80%)'], weaknesses: ['Testing (30%)'],
    achievements: [], concerns: [],
  }
  const baseMetrics: GrowthMetrics = {
    totalLines: 100, totalFiles: 5, totalFunctions: 10, totalExports: 8,
    avgComplexity: 3, avgDocumentation: 50, testRatio: 0.5, dependencyRatio: 2,
    couplingIndex: 20, consistencyScore: 70,
  }
  const baseTrends: TrendIndicator[] = []

  it('addresses declining trends', () => {
    const trends: TrendIndicator[] = [
      { metric: 'Complexity', direction: 'declining', velocity: -2, confidence: 60 },
      { metric: 'Documentation', direction: 'declining', velocity: -1, confidence: 55 },
    ]
    const recs = generateRecommendations(baseState, baseMetrics, trends, [])
    expect(recs.some((r) => r.includes('declining'))).toBe(true)
  })

  it('leverages strengths', () => {
    const recs = generateRecommendations(baseState, baseMetrics, baseTrends, [])
    expect(recs.some((r) => r.includes('strength') || r.includes('Documentation'))).toBe(true)
  })

  it('improves weaknesses', () => {
    const recs = generateRecommendations(baseState, baseMetrics, baseTrends, [])
    expect(recs.some((r) => r.includes('weakness') || r.includes('Testing'))).toBe(true)
  })

  it('warns about low health', () => {
    const state = { ...baseState, health: 35 }
    const recs = generateRecommendations(state, baseMetrics, baseTrends, [])
    expect(recs.some((r) => r.includes('health'))).toBe(true)
  })

  it('praises high health', () => {
    const state = { ...baseState, health: 80 }
    const recs = generateRecommendations(state, baseMetrics, baseTrends, [])
    expect(recs.some((r) => r.includes('Health') || r.includes('80%'))).toBe(true)
  })

  it('returns default when all is good', () => {
    const recs = generateRecommendations(baseState, baseMetrics, baseTrends, [])
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── measureGrowth ──────────────────────────────────────────────────────────────

describe('measureGrowth', () => {
  it('measures empty codebase', () => {
    const metrics = measureGrowth([], [])
    expect(metrics.totalFiles).toBe(0)
    expect(metrics.totalLines).toBe(0)
  })

  it('counts total lines', () => {
    const metrics = measureGrowth(['a.ts'], ['line1\nline2\nline3'])
    expect(metrics.totalLines).toBe(3)
  })

  it('counts functions and exports', () => {
    const metrics = measureGrowth(['a.ts'], ['export function foo() {} export const x = 1'])
    expect(metrics.totalFunctions).toBe(1)
    expect(metrics.totalExports).toBeGreaterThanOrEqual(1)
  })

  it('computes test ratio', () => {
    const metrics = measureGrowth(['a.ts', 'a.test.ts'], ['export const x = 1', 'import { x } from "./a"'])
    expect(metrics.testRatio).toBeGreaterThan(0)
  })
})

// ─── assessCurrentState ─────────────────────────────────────────────────────────

describe('assessCurrentState', () => {
  it('assesses empty codebase', () => {
    const state = assessCurrentState([], [])
    expect(state.maturity).toBe('infant')
    expect(state.health).toBeGreaterThanOrEqual(0)
  })

  it('assesses healthy codebase', () => {
    const content = [
      '/** docs */\nexport function foo(): string { return "hi" }',
      '/** test */\nimport { foo } from "./a"',
    ]
    const state = assessCurrentState(['a.ts', 'a.test.ts'], content)
    expect(state.health).toBeGreaterThan(0)
    expect(state.personality.length).toBeGreaterThan(0)
  })

  it('identifies concerns for poor code', () => {
    const content = [
      'import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"\nimport { d } from "w"\nimport { e } from "v"\nimport { f } from "u"\nimport { g } from "t"\nimport { h } from "s"',
    ]
    const state = assessCurrentState(['mod.ts'], content)
    expect(state.concerns.length).toBeGreaterThan(0)
  })
})

// ─── buildTimeCapsuleResult ─────────────────────────────────────────────────────

describe('buildTimeCapsuleResult', () => {
  it('handles empty files', () => {
    const result = buildTimeCapsuleResult([], [], {})
    expect(result.snapshot).toBeTruthy()
    expect(result.metrics.totalFiles).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('creates full result', () => {
    const result = buildTimeCapsuleResult(
      ['a.ts', 'b.ts'],
      ['export function foo(): string { return "hi" }', 'export const x: number = 1'],
      {},
    )
    expect(result.snapshot.timestamp).toBeTruthy()
    expect(result.state.health).toBeGreaterThan(0)
    expect(result.metrics.totalFiles).toBe(2)
    expect(result.trends.length).toBeGreaterThan(0)
    expect(result.predictions.length).toBeGreaterThan(0)
    expect(result.stats.maturityIndex).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('uses version from options', () => {
    const result = buildTimeCapsuleResult(['a.ts'], ['const x = 1'], { version: '3.0.0' })
    expect(result.snapshot.version).toBe('3.0.0')
  })

  it('computes resilience score', () => {
    const result = buildTimeCapsuleResult(
      ['a.ts', 'a.test.ts'],
      ['export function foo() { return 1 }', 'import { foo } from "./a"'],
      {},
    )
    expect(result.stats.resilienceScore).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatStatePortrait', () => {
  it('formats state', () => {
    const state: CurrentState = {
      health: 75, maturity: 'adult', personality: ['Balanced'],
      strengths: ['Testing (80%)'], weaknesses: [], achievements: [], concerns: [],
    }
    const output = formatStatePortrait(state)
    expect(output).toContain('75%')
    expect(output).toContain('Adult')
  })
})

describe('formatMetricsDashboard', () => {
  it('formats metrics', () => {
    const metrics: GrowthMetrics = {
      totalLines: 1000, totalFiles: 20, totalFunctions: 50, totalExports: 30,
      avgComplexity: 4, avgDocumentation: 35, testRatio: 0.3, dependencyRatio: 3,
      couplingIndex: 40, consistencyScore: 65,
    }
    const output = formatMetricsDashboard(metrics)
    expect(output).toContain('1,000')
    expect(output).toContain('20')
  })
})

describe('formatTrends', () => {
  it('shows no data message', () => {
    expect(formatTrends([])).toContain('No trend data')
  })

  it('formats trend arrows', () => {
    const trends: TrendIndicator[] = [
      { metric: 'Complexity', direction: 'improving', velocity: 2, confidence: 60 },
    ]
    const output = formatTrends(trends)
    expect(output).toContain('Complexity')
  })
})

describe('formatPredictions', () => {
  it('shows no predictions', () => {
    expect(formatPredictions([])).toContain('No predictions')
  })

  it('formats prediction details', () => {
    const preds: Prediction[] = [
      { category: 'Growth', prediction: 'Healthy codebase', confidence: 80, timeframe: '6+ months', basis: 'Health 75%' },
    ]
    const output = formatPredictions(preds)
    expect(output).toContain('Healthy codebase')
    expect(output).toContain('Growth')
  })
})

describe('formatCapsuleStats', () => {
  it('formats stats', () => {
    const stats: CapsuleStats = {
      capsuleDate: '2025-01-01', codebaseAge: 365, commitCount: 100, authorCount: 5,
      linesPerDay: 10, filesPerWeek: 2, healthTrend: 'stable',
      maturityIndex: 65, consistencyIndex: 70, resilienceScore: 60,
    }
    const output = formatCapsuleStats(stats)
    expect(output).toContain('2025-01-01')
    expect(output).toContain('65%')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatRecommendations(['Fix tests', 'Add docs'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })
})

describe('formatTimeCapsuleTable', () => {
  it('formats full result', () => {
    const result = buildTimeCapsuleResult(['a.ts'], ['export const x = 1'], {})
    const output = formatTimeCapsuleTable(result)
    expect(output).toContain('Time Capsule')
    expect(output).toContain('Current State')
  })
})

describe('formatTimeCapsuleJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildTimeCapsuleResult(['a.ts'], ['const x = 1'], {})
    const output = formatTimeCapsuleJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.snapshot).toBeTruthy()
    expect(parsed.metrics.totalFiles).toBe(1)
  })
})
