import { describe, it, expect, beforeEach } from 'vitest'
import { ScoringEngine } from '../../src/core/scoring/scoring-engine.js'
import {
  QUALITY_DIMENSIONS,
  GRADE_THRESHOLDS,
} from '../../src/core/scoring/types.js'
import type { QualityDimension } from '../../src/core/scoring/types.js'

describe('ScoringEngine', () => {
  let engine: ScoringEngine

  beforeEach(() => {
    engine = new ScoringEngine()
  })

  describe('constructor', () => {
    it('uses default dimensions when none provided', () => {
      const e = new ScoringEngine()
      const score = e.calculateScore({})
      expect(score.dimensions).toHaveLength(QUALITY_DIMENSIONS.length)
    })

    it('uses custom dimensions when provided', () => {
      const custom: QualityDimension[] = [
        { id: 'custom', name: 'Custom', weight: 100, maxScore: 100, description: 'Test' },
      ]
      const e = new ScoringEngine(custom)
      const score = e.calculateScore({})
      expect(score.dimensions).toHaveLength(1)
    })
  })

  describe('calculateScore', () => {
    it('returns perfect score for clean metrics', () => {
      const metrics = { coverage: 100 }
      const score = engine.calculateScore(metrics)
      expect(score.overall).toBeGreaterThan(0)
      expect(score.percentage).toBeGreaterThan(0)
      expect(score.maxScore).toBe(100)
    })

    it('includes all dimensions in score', () => {
      const score = engine.calculateScore({})
      expect(score.dimensions).toHaveLength(6)
    })

    it('sets timestamp on score', () => {
      const before = Date.now()
      const score = engine.calculateScore({})
      const after = Date.now()
      expect(score.timestamp).toBeGreaterThanOrEqual(before)
      expect(score.timestamp).toBeLessThanOrEqual(after)
    })

    it('sets optional filePath when provided', () => {
      const score = engine.calculateScore({}, 'src/test.ts')
      expect(score.filePath).toBe('src/test.ts')
    })

    it('sets filePath to undefined when not provided', () => {
      const score = engine.calculateScore({})
      expect(score.filePath).toBeUndefined()
    })

    it('initializes metadata as empty object', () => {
      const score = engine.calculateScore({})
      expect(score.metadata).toEqual({})
    })

    it('assigns a grade to the overall score', () => {
      const score = engine.calculateScore({})
      expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade)
    })

    it('calculates overall as weighted average of dimension percentages', () => {
      const metrics = { coverage: 100, criticalVulns: 0, highVulns: 0, mediumVulns: 0, lowVulns: 0 }
      const score = engine.calculateScore(metrics)
      expect(score.percentage).toBeGreaterThan(50)
    })

    it('handles all zero metrics', () => {
      const score = engine.calculateScore({})
      expect(score.overall).toBeGreaterThanOrEqual(0)
    })

    it('handles worst-case metrics', () => {
      const metrics = {
        avgCyclomatic: 50,
        maxCyclomatic: 100,
        avgCognitive: 100,
        longFunctions: 20,
        anyPercent: 80,
        implicitAny: 30,
        typeAssertions: 30,
        nonNullAssertions: 30,
        criticalVulns: 5,
        highVulns: 5,
        mediumVulns: 30,
        lowVulns: 30,
        circularDeps: 20,
        deadModules: 20,
        coupling: 50,
        unusedExports: 30,
        syncFileReads: 20,
        unboundedLoops: 10,
        memoryLeaks: 10,
        blockingCalls: 20,
        coverage: 10,
        skippedTests: 20,
      }
      const score = engine.calculateScore(metrics)
      expect(score.percentage).toBeLessThan(40)
      expect(score.grade).toBe('F')
    })
  })

  describe('calculateDimensionScore', () => {
    it('throws for unknown dimension', () => {
      expect(() => engine.calculateDimensionScore('unknown', {})).toThrow('Unknown dimension: unknown')
    })

    it('calculates complexity dimension', () => {
      const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 5 })
      expect(ds.dimension.id).toBe('complexity')
      expect(ds.score).toBe(100)
    })

    it('penalizes high average cyclomatic complexity', () => {
      const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 15 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes high max cyclomatic complexity', () => {
      const ds = engine.calculateDimensionScore('complexity', { maxCyclomatic: 30 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes high average cognitive complexity', () => {
      const ds = engine.calculateDimensionScore('complexity', { avgCognitive: 20 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes long functions', () => {
      const ds = engine.calculateDimensionScore('complexity', { longFunctions: 3 })
      expect(ds.score).toBeLessThan(100)
    })

    it('calculates type-safety dimension', () => {
      const ds = engine.calculateDimensionScore('type-safety', { anyPercent: 2 })
      expect(ds.dimension.id).toBe('type-safety')
      expect(ds.score).toBe(100)
    })

    it('penalizes high any percentage', () => {
      const ds = engine.calculateDimensionScore('type-safety', { anyPercent: 10 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes implicit any usage', () => {
      const ds = engine.calculateDimensionScore('type-safety', { implicitAny: 5 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes type assertions', () => {
      const ds = engine.calculateDimensionScore('type-safety', { typeAssertions: 10 })
      expect(ds.score).toBeLessThan(100)
    })

    it('penalizes non-null assertions', () => {
      const ds = engine.calculateDimensionScore('type-safety', { nonNullAssertions: 5 })
      expect(ds.score).toBeLessThan(100)
    })

    it('calculates security dimension', () => {
      const ds = engine.calculateDimensionScore('security', {})
      expect(ds.dimension.id).toBe('security')
      expect(ds.score).toBe(100)
    })

    it('penalizes critical vulnerabilities', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 2 })
      expect(ds.score).toBe(50)
    })

    it('penalizes high vulnerabilities', () => {
      const ds = engine.calculateDimensionScore('security', { highVulns: 3 })
      expect(ds.score).toBe(55)
    })

    it('penalizes medium vulnerabilities', () => {
      const ds = engine.calculateDimensionScore('security', { mediumVulns: 4 })
      expect(ds.score).toBe(80)
    })

    it('penalizes low vulnerabilities', () => {
      const ds = engine.calculateDimensionScore('security', { lowVulns: 5 })
      expect(ds.score).toBe(90)
    })

    it('calculates maintainability dimension', () => {
      const ds = engine.calculateDimensionScore('maintainability', {})
      expect(ds.dimension.id).toBe('maintainability')
      expect(ds.score).toBe(100)
    })

    it('penalizes circular dependencies', () => {
      const ds = engine.calculateDimensionScore('maintainability', { circularDeps: 3 })
      expect(ds.score).toBe(70)
    })

    it('penalizes dead modules', () => {
      const ds = engine.calculateDimensionScore('maintainability', { deadModules: 4 })
      expect(ds.score).toBe(80)
    })

    it('penalizes high coupling', () => {
      const ds = engine.calculateDimensionScore('maintainability', { coupling: 15 })
      expect(ds.score).toBe(85)
    })

    it('penalizes unused exports', () => {
      const ds = engine.calculateDimensionScore('maintainability', { unusedExports: 5 })
      expect(ds.score).toBeLessThan(100)
    })

    it('calculates performance dimension', () => {
      const ds = engine.calculateDimensionScore('performance', {})
      expect(ds.dimension.id).toBe('performance')
      expect(ds.score).toBe(100)
    })

    it('penalizes sync file reads', () => {
      const ds = engine.calculateDimensionScore('performance', { syncFileReads: 3 })
      expect(ds.score).toBe(70)
    })

    it('penalizes unbounded loops', () => {
      const ds = engine.calculateDimensionScore('performance', { unboundedLoops: 2 })
      expect(ds.score).toBe(70)
    })

    it('penalizes memory leaks', () => {
      const ds = engine.calculateDimensionScore('performance', { memoryLeaks: 2 })
      expect(ds.score).toBe(60)
    })

    it('penalizes blocking calls', () => {
      const ds = engine.calculateDimensionScore('performance', { blockingCalls: 4 })
      expect(ds.score).toBe(80)
    })

    it('calculates testing dimension with good coverage', () => {
      const ds = engine.calculateDimensionScore('testing', { coverage: 90 })
      expect(ds.dimension.id).toBe('testing')
      expect(ds.score).toBe(100)
    })

    it('penalizes coverage below 80', () => {
      const ds = engine.calculateDimensionScore('testing', { coverage: 70 })
      expect(ds.score).toBe(80)
    })

    it('penalizes coverage below 60', () => {
      const ds = engine.calculateDimensionScore('testing', { coverage: 50 })
      expect(ds.score).toBe(70)
    })

    it('penalizes coverage below 40', () => {
      const ds = engine.calculateDimensionScore('testing', { coverage: 30 })
      expect(ds.score).toBe(60)
    })

    it('penalizes skipped tests', () => {
      const ds = engine.calculateDimensionScore('testing', { coverage: 100, skippedTests: 5 })
      expect(ds.score).toBe(85)
    })

    it('clamps score to 0 minimum', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 100 })
      expect(ds.score).toBe(0)
    })

    it('clamps score to maxScore maximum', () => {
      const ds = engine.calculateDimensionScore('security', {})
      expect(ds.score).toBeLessThanOrEqual(100)
    })

    it('calculates percentage correctly', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 2 })
      expect(ds.percentage).toBe(50)
    })

    it('assigns grade to dimension', () => {
      const ds = engine.calculateDimensionScore('security', {})
      expect(['A', 'B', 'C', 'D', 'F']).toContain(ds.grade)
    })

    it('populates findings array', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 1 })
      expect(ds.findings.length).toBeGreaterThan(0)
    })
  })

  describe('getGrade', () => {
    it('returns A for 90+', () => {
      expect(engine.getGrade(95)).toBe('A')
    })

    it('returns A for exactly 90', () => {
      expect(engine.getGrade(90)).toBe('A')
    })

    it('returns B for 75-89', () => {
      expect(engine.getGrade(80)).toBe('B')
    })

    it('returns B for exactly 75', () => {
      expect(engine.getGrade(75)).toBe('B')
    })

    it('returns C for 60-74', () => {
      expect(engine.getGrade(65)).toBe('C')
    })

    it('returns C for exactly 60', () => {
      expect(engine.getGrade(60)).toBe('C')
    })

    it('returns D for 40-59', () => {
      expect(engine.getGrade(50)).toBe('D')
    })

    it('returns D for exactly 40', () => {
      expect(engine.getGrade(40)).toBe('D')
    })

    it('returns F for below 40', () => {
      expect(engine.getGrade(30)).toBe('F')
    })

    it('returns F for 0', () => {
      expect(engine.getGrade(0)).toBe('F')
    })
  })

  describe('calculateOverallScore', () => {
    it('returns weighted average of dimension percentages', () => {
      const score = engine.calculateScore({ coverage: 80 })
      const dimScores = score.dimensions
      const overall = engine.calculateOverallScore(dimScores)
      expect(overall).toBeGreaterThan(0)
      expect(overall).toBeLessThanOrEqual(100)
    })

    it('handles empty dimension scores', () => {
      const overall = engine.calculateOverallScore([])
      expect(overall).toBe(0)
    })
  })

  describe('generateRecommendations', () => {
    it('generates recommendations for dimensions below 80', () => {
      const metrics = { coverage: 30 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      expect(recs.length).toBeGreaterThan(0)
    })

    it('generates no recommendations for perfect scores', () => {
      const perfectMetrics = {
        coverage: 100,
        avgCyclomatic: 5,
        maxCyclomatic: 10,
        avgCognitive: 5,
        anyPercent: 0,
        coupling: 5,
      }
      const score = engine.calculateScore(perfectMetrics)
      const recs = engine.generateRecommendations(score)
      expect(recs.length).toBe(0)
    })

    it('assigns critical priority for scores below 40', () => {
      const metrics = { criticalVulns: 5, highVulns: 5 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      const criticalRecs = recs.filter((r) => r.priority === 'critical')
      expect(criticalRecs.length).toBeGreaterThan(0)
    })

    it('assigns high priority for scores below 60', () => {
      const metrics = { coverage: 30, skippedTests: 5 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      const highRecs = recs.filter((r) => r.priority === 'high')
      expect(highRecs.length).toBeGreaterThan(0)
    })

    it('assigns medium priority for scores between 60 and 80', () => {
      const metrics = { coverage: 50 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      const medRecs = recs.filter((r) => r.priority === 'medium')
      expect(medRecs.length).toBeGreaterThan(0)
    })

    it('sorts recommendations by priority', () => {
      const metrics = { criticalVulns: 2, coverage: 50 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      const priorities = recs.map((r) => r.priority)
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      for (let i = 1; i < priorities.length; i++) {
        expect(order[priorities[i]!]!).toBeGreaterThanOrEqual(order[priorities[i - 1]!]!)
      }
    })

    it('includes dimension name in recommendation', () => {
      const metrics = { coverage: 30 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      expect(recs.some((r) => r.dimension === 'testing')).toBe(true)
    })

    it('includes impact in recommendation', () => {
      const metrics = { coverage: 30 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      for (const rec of recs) {
        expect(rec.impact).toBeGreaterThan(0)
      }
    })

    it('includes suggestion text in recommendation', () => {
      const metrics = { coverage: 30 }
      const score = engine.calculateScore(metrics)
      const recs = engine.generateRecommendations(score)
      for (const rec of recs) {
        expect(rec.suggestion.length).toBeGreaterThan(0)
      }
    })
  })

  describe('createReport', () => {
    it('creates a report with score and recommendations', () => {
      const report = engine.createReport({ coverage: 50 })
      expect(report.score).toBeDefined()
      expect(report.recommendations).toBeDefined()
    })

    it('does not include trends when history is empty', () => {
      const report = engine.createReport({})
      expect(report.trends).toBeUndefined()
    })

    it('includes trends when history exists', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score)
      const report = engine.createReport({})
      expect(report.trends).toBeDefined()
    })
  })

  describe('saveSnapshot', () => {
    it('creates snapshot with unique id', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score)
      expect(snap.id).toMatch(/^snap_\d+_/)
    })

    it('stores score in snapshot', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score)
      expect(snap.score).toBe(score)
    })

    it('stores createdAt timestamp', () => {
      const before = Date.now()
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score)
      expect(snap.createdAt).toBeGreaterThanOrEqual(before)
    })

    it('stores optional filePath', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score, { filePath: 'src/test.ts' })
      expect(snap.filePath).toBe('src/test.ts')
    })

    it('stores tags', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score, { tags: ['v1', 'release'] })
      expect(snap.tags).toEqual(['v1', 'release'])
    })

    it('defaults tags to empty array', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score)
      expect(snap.tags).toEqual([])
    })

    it('stores optional branch', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score, { branch: 'main' })
      expect(snap.branch).toBe('main')
    })

    it('stores optional commit', () => {
      const score = engine.calculateScore({})
      const snap = engine.saveSnapshot(score, { commit: 'abc123' })
      expect(snap.commit).toBe('abc123')
    })

    it('adds snapshot to history', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score)
      expect(engine.getSnapshots()).toHaveLength(1)
    })
  })

  describe('getTrend', () => {
    it('returns stable trend for empty history', () => {
      engine.clearHistory()
      const trend = engine.getTrend()
      expect(trend.direction).toBe('stable')
      expect(trend.changeRate).toBe(0)
      expect(trend.snapshots).toHaveLength(0)
    })

    it('returns stable for single snapshot', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score)
      const trend = engine.getTrend()
      expect(trend.direction).toBe('stable')
    })

    it('detects improving trend', () => {
      const lowMetrics = { coverage: 30, criticalVulns: 3 }
      const highMetrics = { coverage: 95, criticalVulns: 0 }

      engine.saveSnapshot(engine.calculateScore(lowMetrics))
      engine.saveSnapshot(engine.calculateScore(highMetrics))

      const trend = engine.getTrend()
      expect(trend.direction).toBe('improving')
      expect(trend.changeRate).toBeGreaterThan(2)
    })

    it('detects declining trend', () => {
      const highMetrics = { coverage: 95, criticalVulns: 0 }
      const lowMetrics = { coverage: 20, criticalVulns: 4 }

      engine.saveSnapshot(engine.calculateScore(highMetrics))
      engine.saveSnapshot(engine.calculateScore(lowMetrics))

      const trend = engine.getTrend()
      expect(trend.direction).toBe('declining')
      expect(trend.changeRate).toBeLessThan(-2)
    })

    it('detects stable trend', () => {
      const metrics = { coverage: 75 }
      engine.saveSnapshot(engine.calculateScore(metrics))
      engine.saveSnapshot(engine.calculateScore(metrics))

      const trend = engine.getTrend()
      expect(trend.direction).toBe('stable')
    })

    it('calculates average score', () => {
      engine.saveSnapshot(engine.calculateScore({ coverage: 50 }))
      engine.saveSnapshot(engine.calculateScore({ coverage: 90 }))

      const trend = engine.getTrend()
      expect(trend.averageScore).toBeGreaterThan(0)
    })

    it('finds best and worst scores', () => {
      engine.saveSnapshot(engine.calculateScore({ coverage: 30 }))
      engine.saveSnapshot(engine.calculateScore({ coverage: 95 }))

      const trend = engine.getTrend()
      expect(trend.worstScore).toBeLessThan(trend.bestScore)
    })

    it('filters by period', () => {
      const score1 = engine.calculateScore({ coverage: 50 })
      engine.saveSnapshot(score1)

      const afterFirst = Date.now() + 1000

      const score2 = engine.calculateScore({ coverage: 90 })
      engine.saveSnapshot(score2)

      const trend = engine.getTrend({ from: afterFirst, to: Date.now() + 5000 })
      expect(trend.snapshots.length).toBeLessThanOrEqual(1)
    })

    it('sets period from snapshot timestamps', () => {
      engine.saveSnapshot(engine.calculateScore({}))
      engine.saveSnapshot(engine.calculateScore({}))

      const trend = engine.getTrend()
      expect(trend.period.from).toBeGreaterThan(0)
      expect(trend.period.to).toBeGreaterThanOrEqual(trend.period.from)
    })
  })

  describe('getSnapshots', () => {
    it('returns copy of history', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score)
      const snaps = engine.getSnapshots()
      expect(snaps).toHaveLength(1)
      snaps.length = 0
      expect(engine.getSnapshots()).toHaveLength(1)
    })
  })

  describe('getSnapshotsByTag', () => {
    it('filters snapshots by tag', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score, { tags: ['release'] })
      engine.saveSnapshot(score, { tags: ['dev'] })

      const release = engine.getSnapshotsByTag('release')
      expect(release).toHaveLength(1)
    })

    it('returns empty for non-existent tag', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score, { tags: ['release'] })

      expect(engine.getSnapshotsByTag('nonexistent')).toHaveLength(0)
    })
  })

  describe('getSnapshotsByFile', () => {
    it('filters snapshots by file path', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score, { filePath: 'src/a.ts' })
      engine.saveSnapshot(score, { filePath: 'src/b.ts' })

      const aSnaps = engine.getSnapshotsByFile('src/a.ts')
      expect(aSnaps).toHaveLength(1)
    })

    it('returns empty for non-existent file', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score, { filePath: 'src/a.ts' })

      expect(engine.getSnapshotsByFile('src/other.ts')).toHaveLength(0)
    })
  })

  describe('compareSnapshots', () => {
    it('detects improved dimensions', () => {
      const oldScore = engine.calculateScore({ coverage: 30 })
      const newScore = engine.calculateScore({ coverage: 95 })
      const oldSnap = engine.saveSnapshot(oldScore)
      const newSnap = engine.saveSnapshot(newScore)

      const diff = engine.compareSnapshots(oldSnap, newSnap)
      expect(diff.improved).toContain('testing')
    })

    it('detects declined dimensions', () => {
      const oldScore = engine.calculateScore({ coverage: 95 })
      const newScore = engine.calculateScore({ coverage: 30 })
      const oldSnap = engine.saveSnapshot(oldScore)
      const newSnap = engine.saveSnapshot(newScore)

      const diff = engine.compareSnapshots(oldSnap, newSnap)
      expect(diff.declined).toContain('testing')
    })

    it('detects unchanged dimensions', () => {
      const score = engine.calculateScore({})
      const snap1 = engine.saveSnapshot(score)
      const snap2 = engine.saveSnapshot(score)

      const diff = engine.compareSnapshots(snap1, snap2)
      expect(diff.unchanged.length).toBeGreaterThan(0)
    })

    it('handles multiple dimension changes', () => {
      const oldScore = engine.calculateScore({ coverage: 30, criticalVulns: 3 })
      const newScore = engine.calculateScore({ coverage: 95, criticalVulns: 0 })
      const oldSnap = engine.saveSnapshot(oldScore)
      const newSnap = engine.saveSnapshot(newScore)

      const diff = engine.compareSnapshots(oldSnap, newSnap)
      expect(diff.improved.length).toBeGreaterThan(0)
    })
  })

  describe('clearHistory', () => {
    it('removes all snapshots', () => {
      const score = engine.calculateScore({})
      engine.saveSnapshot(score)
      engine.saveSnapshot(score)
      expect(engine.getSnapshots()).toHaveLength(2)

      engine.clearHistory()
      expect(engine.getSnapshots()).toHaveLength(0)
    })
  })

  describe('findings', () => {
    it('generates positive findings for good metrics', () => {
      const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 5 })
      const positive = ds.findings.filter((f) => f.type === 'positive')
      expect(positive.length).toBeGreaterThan(0)
    })

    it('generates negative findings for bad metrics', () => {
      const ds = engine.calculateDimensionScore('complexity', { avgCyclomatic: 15, maxCyclomatic: 30 })
      const negative = ds.findings.filter((f) => f.type === 'negative')
      expect(negative.length).toBeGreaterThan(0)
    })

    it('includes impact in findings', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 2 })
      for (const f of ds.findings) {
        expect(typeof f.impact).toBe('number')
      }
    })

    it('includes message in findings', () => {
      const ds = engine.calculateDimensionScore('security', { criticalVulns: 1 })
      for (const f of ds.findings) {
        expect(f.message.length).toBeGreaterThan(0)
      }
    })
  })

  describe('GRADE_THRESHOLDS constant', () => {
    it('has correct threshold values', () => {
      expect(GRADE_THRESHOLDS.A).toBe(90)
      expect(GRADE_THRESHOLDS.B).toBe(75)
      expect(GRADE_THRESHOLDS.C).toBe(60)
      expect(GRADE_THRESHOLDS.D).toBe(40)
      expect(GRADE_THRESHOLDS.F).toBe(0)
    })
  })

  describe('QUALITY_DIMENSIONS constant', () => {
    it('has 6 dimensions', () => {
      expect(QUALITY_DIMENSIONS).toHaveLength(6)
    })

    it('has weights that sum to 100', () => {
      const totalWeight = QUALITY_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)
      expect(totalWeight).toBe(100)
    })

    it('each dimension has required fields', () => {
      for (const dim of QUALITY_DIMENSIONS) {
        expect(dim.id).toBeTruthy()
        expect(dim.name).toBeTruthy()
        expect(dim.weight).toBeGreaterThan(0)
        expect(dim.maxScore).toBe(100)
        expect(dim.description).toBeTruthy()
      }
    })

    it('contains expected dimension ids', () => {
      const ids = QUALITY_DIMENSIONS.map((d) => d.id)
      expect(ids).toContain('complexity')
      expect(ids).toContain('type-safety')
      expect(ids).toContain('security')
      expect(ids).toContain('maintainability')
      expect(ids).toContain('performance')
      expect(ids).toContain('testing')
    })
  })
})
