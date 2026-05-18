import { describe, it, expect } from 'vitest'
import { ScoringEngine, QUALITY_DIMENSIONS, GRADE_THRESHOLDS } from '../src/core/scoring/index.js'

// ─── Constructor ───
describe('ScoringEngine constructor', () => {
  it('creates engine with default dimensions', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    expect(score.dimensions.length).toBe(QUALITY_DIMENSIONS.length)
  })

  it('creates engine with custom dimensions', () => {
    const engine = new ScoringEngine([QUALITY_DIMENSIONS[0]!])
    const score = engine.calculateScore({})
    expect(score.dimensions.length).toBe(1)
  })
})

// ─── Grade Calculation ───
describe('ScoringEngine grade', () => {
  it('returns A for >= 90', () => {
    const engine = new ScoringEngine()
    expect(engine.getGrade(95)).toBe('A')
    expect(engine.getGrade(90)).toBe('A')
  })

  it('returns B for >= 75', () => {
    const engine = new ScoringEngine()
    expect(engine.getGrade(80)).toBe('B')
    expect(engine.getGrade(75)).toBe('B')
  })

  it('returns C for >= 60', () => {
    const engine = new ScoringEngine()
    expect(engine.getGrade(65)).toBe('C')
  })

  it('returns D for >= 40', () => {
    const engine = new ScoringEngine()
    expect(engine.getGrade(50)).toBe('D')
  })

  it('returns F for < 40', () => {
    const engine = new ScoringEngine()
    expect(engine.getGrade(30)).toBe('F')
  })
})

// ─── Dimension Scores ───
describe('ScoringEngine dimension scores', () => {
  it('calculates complexity score with good metrics', () => {
    const engine = new ScoringEngine()
    const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 5, maxCyclomatic: 10 })
    expect(ds.score).toBe(100)
    expect(ds.grade).toBe('A')
  })

  it('penalizes high complexity', () => {
    const engine = new ScoringEngine()
    const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 15, maxCyclomatic: 25 })
    expect(ds.score).toBeLessThan(100)
    expect(ds.findings.some((f) => f.type === 'negative')).toBe(true)
  })

  it('calculates security score with no vulns', () => {
    const engine = new ScoringEngine()
    const ds = engine.calculateDimensionScore('security', {})
    expect(ds.score).toBe(100)
  })

  it('penalizes critical vulns', () => {
    const engine = new ScoringEngine()
    const ds = engine.calculateDimensionScore('security', { criticalVulns: 1 })
    expect(ds.score).toBeLessThan(100)
  })

  it('throws on unknown dimension', () => {
    const engine = new ScoringEngine()
    expect(() => engine.calculateDimensionScore('unknown', {})).toThrow('Unknown dimension')
  })
})

// ─── Overall Score ───
describe('ScoringEngine overall score', () => {
  it('calculates overall score', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    expect(score.overall).toBe(100)
    expect(score.percentage).toBe(100)
    expect(score.grade).toBe('A')
  })

  it('calculates score with filePath', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({}, 'test.ts')
    expect(score.filePath).toBe('test.ts')
  })
})

// ─── Recommendations ───
describe('ScoringEngine recommendations', () => {
  it('generates recommendations for low scores', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({ criticalVulns: 5 })
    const recs = engine.generateRecommendations(score)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0]!.priority).toBe('critical')
  })

  it('returns no recommendations for perfect score', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    const recs = engine.generateRecommendations(score)
    expect(recs.length).toBe(0)
  })
})

// ─── Reports and Snapshots ───
describe('ScoringEngine reports and snapshots', () => {
  it('creates report', () => {
    const engine = new ScoringEngine()
    const report = engine.createReport({})
    expect(report.score).toBeDefined()
    expect(report.recommendations).toBeDefined()
  })

  it('saves snapshots', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    const snap = engine.saveSnapshot(score)
    expect(snap.id).toContain('snap_')
    expect(engine.getSnapshots().length).toBe(1)
  })

  it('gets snapshots by tag', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    engine.saveSnapshot(score, { tags: ['v1'] })
    engine.saveSnapshot(score, { tags: ['v2'] })
    expect(engine.getSnapshotsByTag('v1').length).toBe(1)
  })

  it('gets snapshots by file', () => {
    const engine = new ScoringEngine()
    const score = engine.calculateScore({})
    engine.saveSnapshot(score, { filePath: 'a.ts' })
    engine.saveSnapshot(score, { filePath: 'b.ts' })
    expect(engine.getSnapshotsByFile('a.ts').length).toBe(1)
  })

  it('compares snapshots', () => {
    const engine = new ScoringEngine()
    const s1 = engine.saveSnapshot(engine.calculateScore({}))
    const s2 = engine.saveSnapshot(engine.calculateScore({ criticalVulns: 1 }))
    const diff = engine.compareSnapshots(s1, s2)
    expect(diff.declined.length).toBeGreaterThan(0)
  })

  it('clears history', () => {
    const engine = new ScoringEngine()
    engine.saveSnapshot(engine.calculateScore({}))
    engine.clearHistory()
    expect(engine.getSnapshots().length).toBe(0)
  })
})

// ─── Trend ───
describe('ScoringEngine trend', () => {
  it('returns stable trend for empty history', () => {
    const engine = new ScoringEngine()
    const trend = engine.getTrend()
    expect(trend.direction).toBe('stable')
  })

  it('detects improving trend', () => {
    const engine = new ScoringEngine()
    engine.saveSnapshot(engine.calculateScore({ criticalVulns: 10 }))
    engine.saveSnapshot(engine.calculateScore({ criticalVulns: 5 }))
    engine.saveSnapshot(engine.calculateScore({}))
    const trend = engine.getTrend()
    expect(trend.direction).toBe('improving')
  })
})

// ─── Constants ───
describe('ScoringEngine constants', () => {
  it('GRADE_THRESHOLDS has expected keys', () => {
    expect(GRADE_THRESHOLDS['A']).toBe(90)
    expect(GRADE_THRESHOLDS['F']).toBe(0)
  })

  it('QUALITY_DIMENSIONS has 6 entries', () => {
    expect(QUALITY_DIMENSIONS.length).toBe(6)
  })
})
