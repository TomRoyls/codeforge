import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { ComplexityCalculator } from '../../src/core/trends/complexity-calculator.js'
import { TrendStore } from '../../src/core/trends/trend-store.js'
import { TrendAnalyzer } from '../../src/core/trends/trend-analyzer.js'
import type {
  ComplexityMetrics,
  TrendSnapshot,
  TrendSummary,
  TrendConfig,
} from '../../src/core/trends/types.js'
import { DEFAULT_CONFIG } from '../../src/core/trends/types.js'

function makeMetrics(overrides: Partial<ComplexityMetrics> = {}): ComplexityMetrics {
  return {
    filePath: 'test.ts',
    cyclomaticComplexity: 5,
    cognitiveComplexity: 7,
    linesOfCode: 50,
    linesOfCodeEffective: 40,
    functionCount: 3,
    maxNestingDepth: 2,
    maintainabilityIndex: 80,
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeSummary(overrides: Partial<TrendSummary> = {}): TrendSummary {
  return {
    totalFiles: 1,
    avgCyclomatic: 5,
    avgCognitive: 7,
    avgMaintainability: 80,
    totalLOC: 50,
    totalEffectiveLOC: 40,
    totalFunctions: 3,
    maxComplexityFile: 'test.ts',
    complexityDistribution: { low: 1, medium: 0, high: 0, critical: 0 },
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<TrendSnapshot> = {}): TrendSnapshot {
  return {
    id: `snap-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    metrics: [makeMetrics()],
    summary: makeSummary(),
    ...overrides,
  }
}

// ============================================================
// ComplexityCalculator
// ============================================================
describe('ComplexityCalculator', () => {
  let calc: ComplexityCalculator

  beforeEach(() => {
    calc = new ComplexityCalculator()
  })

  // ---- countCyclomatic ----
  describe('countCyclomatic', () => {
    it('counts if/else if branches', () => {
      const code = `if (a) {} else if (b) {} else {}`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(3)
    })

    it('counts for and while loops', () => {
      const code = `for (let i = 0; i < 10; i++) {} while (true) {}`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(3)
    })

    it('counts switch cases', () => {
      const code = `switch(x) { case 1: break; case 2: break; default: break; }`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(3)
    })

    it('counts catch blocks', () => {
      const code = `try {} catch(e) {}`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(2)
    })

    it('counts ternary and nullish coalescing', () => {
      const code = `const a = x ? 1 : 2; const b = x ?? 0;`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(3)
    })

    it('counts logical AND/OR operators', () => {
      const code = `if (a && b || c) {}`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(4)
    })

    it('counts do-while loops', () => {
      const code = `do {} while (true);`
      expect(calc.countCyclomatic(code)).toBeGreaterThanOrEqual(2)
    })

    it('returns base complexity of 1 for empty code', () => {
      expect(calc.countCyclomatic('')).toBe(1)
    })
  })

  // ---- countCognitive ----
  describe('countCognitive', () => {
    it('adds nesting penalty for nested decisions', () => {
      const code = `if (a) { if (b) { } }`
      const cognitive = calc.countCognitive(code)
      expect(cognitive).toBeGreaterThan(2)
    })

    it('counts cognitive complexity with multiple nesting levels', () => {
      const code = `if (a) { if (b) { if (c) { } } }`
      const cognitive = calc.countCognitive(code)
      expect(cognitive).toBeGreaterThanOrEqual(6)
    })

    it('returns 0 for empty content', () => {
      expect(calc.countCognitive('')).toBe(0)
    })

    it('ignores comments', () => {
      const code = `// if this were real\n/* if (x) {} */`
      expect(calc.countCognitive(code)).toBe(0)
    })
  })

  // ---- countLinesOfCode ----
  describe('countLinesOfCode', () => {
    it('counts total and effective lines', () => {
      const code = `line1\n\nline3\n// comment\nline5`
      const result = calc.countLinesOfCode(code)
      expect(result.total).toBe(5)
      expect(result.effective).toBe(3)
    })

    it('handles empty content', () => {
      const result = calc.countLinesOfCode('')
      expect(result.total).toBe(1)
      expect(result.effective).toBe(0)
    })

    it('handles single line', () => {
      const result = calc.countLinesOfCode('const x = 1')
      expect(result.total).toBe(1)
      expect(result.effective).toBe(1)
    })

    it('excludes block comments', () => {
      const code = `const x = 1;\n/* block\ncomment */\nconst y = 2;`
      const result = calc.countLinesOfCode(code)
      expect(result.effective).toBe(2)
    })
  })

  // ---- countFunctions ----
  describe('countFunctions', () => {
    it('counts named function declarations', () => {
      const code = `function foo() {} function bar() {}`
      expect(calc.countFunctions(code)).toBeGreaterThanOrEqual(2)
    })

    it('counts arrow functions assigned to variables', () => {
      const code = `const fn = () => {}`
      expect(calc.countFunctions(code)).toBeGreaterThanOrEqual(1)
    })

    it('counts async functions', () => {
      const code = `async function foo() {} const bar = async () => {}`
      expect(calc.countFunctions(code)).toBeGreaterThanOrEqual(2)
    })

    it('returns 0 for content with no functions', () => {
      expect(calc.countFunctions('const x = 1')).toBe(0)
    })
  })

  // ---- calculateMaxNesting ----
  describe('calculateMaxNesting', () => {
    it('calculates maximum nesting depth', () => {
      const code = `function a() { if (x) { if (y) { } } }`
      expect(calc.calculateMaxNesting(code)).toBeGreaterThanOrEqual(3)
    })

    it('returns 0 for flat code', () => {
      expect(calc.calculateMaxNesting('const x = 1')).toBe(0)
    })

    it('handles deeply nested code', () => {
      const code = `{ { { { { } } } } }`
      expect(calc.calculateMaxNesting(code)).toBe(5)
    })

    it('handles empty content', () => {
      expect(calc.calculateMaxNesting('')).toBe(0)
    })
  })

  // ---- calculateMaintainabilityIndex ----
  describe('calculateMaintainabilityIndex', () => {
    it('returns a value between 0 and 100', () => {
      const metrics = makeMetrics({ linesOfCodeEffective: 50, cyclomaticComplexity: 10 })
      const mi = calc.calculateMaintainabilityIndex(metrics)
      expect(mi).toBeGreaterThanOrEqual(0)
      expect(mi).toBeLessThanOrEqual(100)
    })

    it('returns higher MI for simpler code', () => {
      const simple = makeMetrics({ linesOfCodeEffective: 10, cyclomaticComplexity: 1 })
      const complex = makeMetrics({ linesOfCodeEffective: 500, cyclomaticComplexity: 50 })
      expect(calc.calculateMaintainabilityIndex(simple)).toBeGreaterThan(
        calc.calculateMaintainabilityIndex(complex),
      )
    })

    it('returns 100 for zero effective LOC', () => {
      const metrics = makeMetrics({ linesOfCodeEffective: 0 })
      expect(calc.calculateMaintainabilityIndex(metrics)).toBe(100)
    })

    it('penalizes high cyclomatic complexity', () => {
      const lowCC = makeMetrics({ linesOfCodeEffective: 100, cyclomaticComplexity: 5 })
      const highCC = makeMetrics({ linesOfCodeEffective: 100, cyclomaticComplexity: 50 })
      expect(calc.calculateMaintainabilityIndex(lowCC)).toBeGreaterThan(
        calc.calculateMaintainabilityIndex(highCC),
      )
    })
  })

  // ---- calculateForFile ----
  describe('calculateForFile', () => {
    it('computes all metrics for a file', () => {
      const code = `function add(a, b) {\n  return a + b;\n}\n\nfunction complex(x) {\n  if (x > 0) {\n    for (let i = 0; i < x; i++) {\n      console.log(i);\n    }\n  }\n}`
      const metrics = calc.calculateForFile(code, 'math.ts')
      expect(metrics.filePath).toBe('math.ts')
      expect(metrics.linesOfCode).toBeGreaterThan(0)
      expect(metrics.cyclomaticComplexity).toBeGreaterThanOrEqual(1)
      expect(metrics.functionCount).toBeGreaterThanOrEqual(2)
    })

    it('handles empty file', () => {
      const metrics = calc.calculateForFile('', 'empty.ts')
      expect(metrics.filePath).toBe('empty.ts')
      expect(metrics.linesOfCode).toBe(1)
      expect(metrics.cyclomaticComplexity).toBe(1)
    })

    it('handles single-line file', () => {
      const metrics = calc.calculateForFile('const x = 1;', 'one.ts')
      expect(metrics.linesOfCode).toBe(1)
      expect(metrics.linesOfCodeEffective).toBe(1)
    })
  })

  // ---- calculateForFunction ----
  describe('calculateForFunction', () => {
    it('computes metrics for a function body', () => {
      const fn = `if (x) { for (let i = 0; i < 10; i++) {} }`
      const result = calc.calculateForFunction(fn)
      expect(result.cyclomatic).toBeGreaterThanOrEqual(3)
      expect(result.nesting).toBeGreaterThanOrEqual(2)
      expect(result.cognitive).toBeGreaterThan(0)
    })
  })
})

// ============================================================
// TrendStore
// ============================================================
describe('TrendStore', () => {
  let store: TrendStore
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trends-test-'))
    const config: TrendConfig = {
      ...DEFAULT_CONFIG,
      storagePath: tmpDir,
    }
    store = new TrendStore(config)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  // ---- save/load ----
  describe('saveSnapshot/loadSnapshots', () => {
    it('saves and loads a snapshot', async () => {
      const snapshot = makeSnapshot()
      await store.saveSnapshot(snapshot)
      const loaded = await store.loadSnapshots()
      expect(loaded).toHaveLength(1)
      expect(loaded[0]!.id).toBe(snapshot.id)
    })

    it('loads multiple snapshots sorted by timestamp', async () => {
      const snap1 = makeSnapshot({ timestamp: 1000 })
      const snap2 = makeSnapshot({ timestamp: 3000 })
      const snap3 = makeSnapshot({ timestamp: 2000 })
      await store.saveSnapshot(snap1)
      await store.saveSnapshot(snap2)
      await store.saveSnapshot(snap3)
      const loaded = await store.loadSnapshots()
      expect(loaded).toHaveLength(3)
      expect(loaded[0]!.timestamp).toBe(1000)
      expect(loaded[1]!.timestamp).toBe(2000)
      expect(loaded[2]!.timestamp).toBe(3000)
    })

    it('returns empty array when no snapshots exist', async () => {
      expect(await store.loadSnapshots()).toEqual([])
    })

    it('ignores invalid files in storage directory', async () => {
      fs.writeFileSync(path.join(tmpDir, 'snapshot-bad.json'), 'not json')
      const snap = makeSnapshot()
      await store.saveSnapshot(snap)
      const loaded = await store.loadSnapshots()
      expect(loaded).toHaveLength(1)
    })
  })

  // ---- getLatestSnapshot ----
  describe('getLatestSnapshot', () => {
    it('returns the most recent snapshot', async () => {
      await store.saveSnapshot(makeSnapshot({ timestamp: 1000 }))
      await store.saveSnapshot(makeSnapshot({ timestamp: 2000 }))
      await store.saveSnapshot(makeSnapshot({ timestamp: 3000 }))
      const latest = await store.getLatestSnapshot()
      expect(latest).not.toBeNull()
      expect(latest!.timestamp).toBe(3000)
    })

    it('returns null when no snapshots exist', async () => {
      expect(await store.getLatestSnapshot()).toBeNull()
    })
  })

  // ---- getSnapshotRange ----
  describe('getSnapshotRange', () => {
    it('returns snapshots within date range', async () => {
      await store.saveSnapshot(makeSnapshot({ timestamp: 1000 }))
      await store.saveSnapshot(makeSnapshot({ timestamp: 2000 }))
      await store.saveSnapshot(makeSnapshot({ timestamp: 3000 }))
      await store.saveSnapshot(makeSnapshot({ timestamp: 4000 }))
      const range = await store.getSnapshotRange(1500, 3500)
      expect(range).toHaveLength(2)
    })

    it('returns empty when no snapshots in range', async () => {
      await store.saveSnapshot(makeSnapshot({ timestamp: 1000 }))
      expect(await store.getSnapshotRange(5000, 6000)).toHaveLength(0)
    })
  })

  // ---- getSnapshotByCommit ----
  describe('getSnapshotByCommit', () => {
    it('finds snapshot by commit hash', async () => {
      await store.saveSnapshot(makeSnapshot({ commitHash: 'abc123' }))
      await store.saveSnapshot(makeSnapshot({ commitHash: 'def456' }))
      const found = await store.getSnapshotByCommit('abc123')
      expect(found).not.toBeNull()
      expect(found!.commitHash).toBe('abc123')
    })

    it('returns null when commit not found', async () => {
      await store.saveSnapshot(makeSnapshot({ commitHash: 'abc123' }))
      expect(await store.getSnapshotByCommit('nonexistent')).toBeNull()
    })
  })

  // ---- pruneSnapshots ----
  describe('pruneSnapshots', () => {
    it('keeps only the most recent N snapshots', async () => {
      for (let i = 0; i < 10; i++) {
        await store.saveSnapshot(makeSnapshot({ timestamp: i * 1000 }))
      }
      const pruned = await store.pruneSnapshots(5)
      expect(pruned).toBe(5)
      expect(await store.loadSnapshots()).toHaveLength(5)
    })

    it('returns 0 when no pruning needed', async () => {
      await store.saveSnapshot(makeSnapshot())
      expect(await store.pruneSnapshots(10)).toBe(0)
    })
  })

  // ---- export/import ----
  describe('exportToJSON/importFromJSON', () => {
    it('exports and imports snapshots correctly', () => {
      const snapshots = [makeSnapshot(), makeSnapshot()]
      const json = store.exportToJSON(snapshots)
      const imported = store.importFromJSON(json)
      expect(imported).toHaveLength(2)
      expect(imported[0]!.id).toBe(snapshots[0]!.id)
      expect(imported[1]!.id).toBe(snapshots[1]!.id)
    })

    it('throws on invalid JSON format', () => {
      expect(() => store.importFromJSON('not an array')).toThrow()
    })

    it('throws on invalid snapshot format', () => {
      expect(() => store.importFromJSON('[{"invalid": true}]')).toThrow()
    })

    it('handles round-trip with complex data', () => {
      const snapshot = makeSnapshot({
        metrics: [
          makeMetrics({ filePath: 'a.ts', cyclomaticComplexity: 15 }),
          makeMetrics({ filePath: 'b.ts', cyclomaticComplexity: 25 }),
        ],
        summary: makeSummary({ totalFiles: 2, avgCyclomatic: 20 }),
      })
      const json = store.exportToJSON([snapshot])
      const imported = store.importFromJSON(json)
      expect(imported).toHaveLength(1)
      expect(imported[0]!.metrics).toHaveLength(2)
    })
  })
})

// ============================================================
// TrendAnalyzer
// ============================================================
describe('TrendAnalyzer', () => {
  let analyzer: TrendAnalyzer

  beforeEach(() => {
    analyzer = new TrendAnalyzer()
  })

  function makeTrendSnapshots(metricValues: number[], metric: keyof TrendSummary = 'avgCyclomatic'): TrendSnapshot[] {
    return metricValues.map((value, i) => {
      const summary = makeSummary({ [metric]: value })
      return makeSnapshot({
        timestamp: 1000 + i * 1000,
        summary,
      })
    })
  }

  // ---- analyzeTrend ----
  describe('analyzeTrend', () => {
    it('detects improving trend (decreasing complexity)', () => {
      const snapshots = makeTrendSnapshots([20, 18, 15, 12, 10])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.direction).toBe('improving')
      expect(analysis.dataPoints).toHaveLength(5)
    })

    it('detects degrading trend (increasing complexity)', () => {
      const snapshots = makeTrendSnapshots([10, 15, 20, 25, 30])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.direction).toBe('degrading')
    })

    it('detects stable trend', () => {
      const snapshots = makeTrendSnapshots([10, 10, 11, 10, 10])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.direction).toBe('stable')
    })

    it('detects improving maintainability (increasing MI)', () => {
      const snapshots = makeTrendSnapshots([50, 60, 70, 80], 'avgMaintainability')
      const analysis = analyzer.analyzeTrend(snapshots, 'avgMaintainability')
      expect(analysis.direction).toBe('improving')
    })

    it('handles volatile data', () => {
      const snapshots = makeTrendSnapshots([10, 50, 5, 60, 8])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.direction).toBeDefined()
      expect(analysis.anomalies).toBeDefined()
    })

    it('returns stable for single snapshot', () => {
      const snapshots = makeTrendSnapshots([10])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.changePercent).toBe(0)
    })
  })

  // ---- calculateChangeRate ----
  describe('calculateChangeRate', () => {
    it('calculates positive change rate for increasing values', () => {
      const points = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 20 },
        { timestamp: 3, value: 30 },
      ]
      const rate = analyzer.calculateChangeRate(points)
      expect(rate).toBeGreaterThan(0)
    })

    it('calculates negative change rate for decreasing values', () => {
      const points = [
        { timestamp: 1, value: 30 },
        { timestamp: 2, value: 20 },
        { timestamp: 3, value: 10 },
      ]
      const rate = analyzer.calculateChangeRate(points)
      expect(rate).toBeLessThan(0)
    })

    it('returns 0 for single data point', () => {
      const rate = analyzer.calculateChangeRate([{ timestamp: 1, value: 10 }])
      expect(rate).toBe(0)
    })

    it('returns 0 for empty array', () => {
      expect(analyzer.calculateChangeRate([])).toBe(0)
    })
  })

  // ---- detectAnomalies ----
  describe('detectAnomalies', () => {
    it('detects anomalous spikes', () => {
      const snapshots = makeTrendSnapshots([10, 10, 10, 100, 10, 10, 10])
      const anomalies = analyzer.detectAnomalies(snapshots, 'avgCyclomatic', 2)
      expect(anomalies.length).toBeGreaterThan(0)
      expect(anomalies[0]!.actualValue).toBe(100)
    })

    it('returns empty for stable data', () => {
      const snapshots = makeTrendSnapshots([10, 10, 10, 10, 10])
      const anomalies = analyzer.detectAnomalies(snapshots, 'avgCyclomatic', 2)
      expect(anomalies).toHaveLength(0)
    })

    it('returns empty for fewer than 3 snapshots', () => {
      const snapshots = makeTrendSnapshots([10, 100])
      const anomalies = analyzer.detectAnomalies(snapshots, 'avgCyclomatic', 2)
      expect(anomalies).toHaveLength(0)
    })

    it('includes deviation in anomaly', () => {
      const snapshots = makeTrendSnapshots([10, 10, 10, 100, 10, 10, 10])
      const anomalies = analyzer.detectAnomalies(snapshots, 'avgCyclomatic', 2)
      if (anomalies.length > 0) {
        expect(anomalies[0]!.deviation).toBeGreaterThan(2)
        expect(anomalies[0]!.metric).toBe('avgCyclomatic')
      }
    })
  })

  // ---- forecast ----
  describe('forecast', () => {
    it('generates forecast data points', () => {
      const snapshots = makeTrendSnapshots([10, 12, 14, 16, 18])
      const forecast = analyzer.forecast(snapshots, 'avgCyclomatic', 3)
      expect(forecast).toHaveLength(3)
      expect(forecast[0]!.value).toBeGreaterThan(0)
    })

    it('produces increasing forecast for increasing data', () => {
      const snapshots = makeTrendSnapshots([10, 20, 30, 40])
      const forecast = analyzer.forecast(snapshots, 'avgCyclomatic', 2)
      expect(forecast[0]!.value).toBeGreaterThan(snapshots[snapshots.length - 1]!.summary.avgCyclomatic)
    })

    it('returns empty for single snapshot', () => {
      const snapshots = makeTrendSnapshots([10])
      const forecast = analyzer.forecast(snapshots, 'avgCyclomatic', 3)
      expect(forecast).toHaveLength(0)
    })

    it('includes labels in forecast points', () => {
      const snapshots = makeTrendSnapshots([10, 20, 30])
      const forecast = analyzer.forecast(snapshots, 'avgCyclomatic', 2)
      expect(forecast[0]!.label).toContain('Forecast')
    })
  })

  // ---- compareSnapshots ----
  describe('compareSnapshots', () => {
    it('compares two snapshots and returns metric comparisons', () => {
      const a = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 10, avgCognitive: 15, totalLOC: 100 }),
      })
      const b = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 20, avgCognitive: 25, totalLOC: 200 }),
      })
      const comparisons = analyzer.compareSnapshots(a, b)
      expect(comparisons.length).toBeGreaterThan(0)

      const ccComparison = comparisons.find(c => c.metric === 'avgCyclomatic')
      expect(ccComparison).toBeDefined()
      expect(ccComparison!.previous).toBe(10)
      expect(ccComparison!.current).toBe(20)
      expect(ccComparison!.change).toBe(10)
      expect(ccComparison!.direction).toBe('degrading')
    })

    it('detects improving metrics', () => {
      const a = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 20 }),
      })
      const b = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 10 }),
      })
      const comparisons = analyzer.compareSnapshots(a, b)
      const cc = comparisons.find(c => c.metric === 'avgCyclomatic')
      expect(cc!.direction).toBe('improving')
    })

    it('detects stable metrics', () => {
      const a = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 10 }),
      })
      const b = makeSnapshot({
        summary: makeSummary({ avgCyclomatic: 10.01 }),
      })
      const comparisons = analyzer.compareSnapshots(a, b)
      const cc = comparisons.find(c => c.metric === 'avgCyclomatic')
      expect(cc!.direction).toBe('stable')
    })

    it('correctly handles maintainability as positive metric', () => {
      const a = makeSnapshot({
        summary: makeSummary({ avgMaintainability: 50 }),
      })
      const b = makeSnapshot({
        summary: makeSummary({ avgMaintainability: 80 }),
      })
      const comparisons = analyzer.compareSnapshots(a, b)
      const mi = comparisons.find(c => c.metric === 'avgMaintainability')
      expect(mi!.direction).toBe('improving')
    })
  })

  // ---- getTopDegradingFiles ----
  describe('getTopDegradingFiles', () => {
    it('returns files that got worse', () => {
      const firstMetrics = [
        makeMetrics({ filePath: 'good.ts', cyclomaticComplexity: 5 }),
        makeMetrics({ filePath: 'bad.ts', cyclomaticComplexity: 5 }),
      ]
      const lastMetrics = [
        makeMetrics({ filePath: 'good.ts', cyclomaticComplexity: 5 }),
        makeMetrics({ filePath: 'bad.ts', cyclomaticComplexity: 20 }),
      ]
      const snapshots = [
        makeSnapshot({ timestamp: 1000, metrics: firstMetrics }),
        makeSnapshot({ timestamp: 2000, metrics: lastMetrics }),
      ]
      const degrading = analyzer.getTopDegradingFiles(snapshots)
      expect(degrading.length).toBeGreaterThan(0)
      expect(degrading[0]!.filePath).toBe('bad.ts')
      expect(degrading[0]!.change).toBe(15)
    })

    it('respects the limit parameter', () => {
      const firstMetrics = [
        makeMetrics({ filePath: 'a.ts', cyclomaticComplexity: 5 }),
        makeMetrics({ filePath: 'b.ts', cyclomaticComplexity: 5 }),
        makeMetrics({ filePath: 'c.ts', cyclomaticComplexity: 5 }),
      ]
      const lastMetrics = [
        makeMetrics({ filePath: 'a.ts', cyclomaticComplexity: 20 }),
        makeMetrics({ filePath: 'b.ts', cyclomaticComplexity: 15 }),
        makeMetrics({ filePath: 'c.ts', cyclomaticComplexity: 10 }),
      ]
      const snapshots = [
        makeSnapshot({ timestamp: 1000, metrics: firstMetrics }),
        makeSnapshot({ timestamp: 2000, metrics: lastMetrics }),
      ]
      const degrading = analyzer.getTopDegradingFiles(snapshots, 2)
      expect(degrading).toHaveLength(2)
    })
  })

  // ---- getTopImprovingFiles ----
  describe('getTopImprovingFiles', () => {
    it('returns files that got better', () => {
      const firstMetrics = [
        makeMetrics({ filePath: 'improving.ts', cyclomaticComplexity: 20 }),
        makeMetrics({ filePath: 'stable.ts', cyclomaticComplexity: 5 }),
      ]
      const lastMetrics = [
        makeMetrics({ filePath: 'improving.ts', cyclomaticComplexity: 5 }),
        makeMetrics({ filePath: 'stable.ts', cyclomaticComplexity: 5 }),
      ]
      const snapshots = [
        makeSnapshot({ timestamp: 1000, metrics: firstMetrics }),
        makeSnapshot({ timestamp: 2000, metrics: lastMetrics }),
      ]
      const improving = analyzer.getTopImprovingFiles(snapshots)
      expect(improving.length).toBeGreaterThan(0)
      expect(improving[0]!.filePath).toBe('improving.ts')
      expect(improving[0]!.change).toBe(-15)
    })

    it('returns empty for single snapshot', () => {
      const snapshots = [makeSnapshot()]
      expect(analyzer.getTopImprovingFiles(snapshots)).toHaveLength(0)
    })
  })

  // ---- getComplexityDistribution ----
  describe('getComplexityDistribution', () => {
    it('distributes files into complexity buckets', () => {
      const snapshot = makeSnapshot({
        metrics: [
          makeMetrics({ filePath: 'low.ts', cyclomaticComplexity: 5 }),
          makeMetrics({ filePath: 'medium.ts', cyclomaticComplexity: 15 }),
          makeMetrics({ filePath: 'high.ts', cyclomaticComplexity: 25 }),
          makeMetrics({ filePath: 'critical.ts', cyclomaticComplexity: 35 }),
        ],
      })
      const dist = analyzer.getComplexityDistribution(snapshot)
      expect(dist['low']).toBe(1)
      expect(dist['medium']).toBe(1)
      expect(dist['high']).toBe(1)
      expect(dist['critical']).toBe(1)
    })

    it('handles empty metrics', () => {
      const snapshot = makeSnapshot({ metrics: [] })
      const dist = analyzer.getComplexityDistribution(snapshot)
      expect(dist['low']).toBe(0)
      expect(dist['medium']).toBe(0)
      expect(dist['high']).toBe(0)
      expect(dist['critical']).toBe(0)
    })

    it('puts boundary values in correct bucket', () => {
      const snapshot = makeSnapshot({
        metrics: [
          makeMetrics({ cyclomaticComplexity: 10 }),
          makeMetrics({ cyclomaticComplexity: 20 }),
          makeMetrics({ cyclomaticComplexity: 30 }),
        ],
      })
      const dist = analyzer.getComplexityDistribution(snapshot)
      expect(dist['low']).toBe(1)
      expect(dist['medium']).toBe(1)
      expect(dist['high']).toBe(1)
    })
  })

  // ---- Edge cases ----
  describe('edge cases', () => {
    it('handles snapshots with identical values', () => {
      const snapshots = makeTrendSnapshots([10, 10, 10, 10])
      const analysis = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
      expect(analysis.direction).toBe('stable')
      expect(analysis.anomalies).toHaveLength(0)
    })

    it('handles empty snapshot list for trend analysis', () => {
      const analysis = analyzer.analyzeTrend([], 'avgCyclomatic')
      expect(analysis.dataPoints).toHaveLength(0)
      expect(analysis.changePercent).toBe(0)
    })

    it('handles single-line file content', () => {
      const calc = new ComplexityCalculator()
      const metrics = calc.calculateForFile('const x: number = 1;', 'single.ts')
      expect(metrics.linesOfCode).toBe(1)
      expect(metrics.functionCount).toBe(0)
    })

    it('handles deeply nested code', () => {
      const calc = new ComplexityCalculator()
      const deepCode = '{'.repeat(10) + '}'.repeat(10)
      const metrics = calc.calculateForFile(deepCode, 'deep.ts')
      expect(metrics.maxNestingDepth).toBe(10)
    })

    it('handles file trends with new files not in first snapshot', () => {
      const firstMetrics = [
        makeMetrics({ filePath: 'existing.ts', cyclomaticComplexity: 5 }),
      ]
      const lastMetrics = [
        makeMetrics({ filePath: 'existing.ts', cyclomaticComplexity: 10 }),
        makeMetrics({ filePath: 'new.ts', cyclomaticComplexity: 3 }),
      ]
      const snapshots = [
        makeSnapshot({ timestamp: 1000, metrics: firstMetrics }),
        makeSnapshot({ timestamp: 2000, metrics: lastMetrics }),
      ]
      const degrading = analyzer.getTopDegradingFiles(snapshots)
      expect(degrading).toHaveLength(1)
      expect(degrading[0]!.filePath).toBe('existing.ts')
    })
  })
})
