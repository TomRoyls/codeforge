import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { ComplexityCalculator } from '../src/core/trends/complexity-calculator.js'
import { TrendStore } from '../src/core/trends/trend-store.js'
import { TrendAnalyzer } from '../src/core/trends/trend-analyzer.js'
import { DEFAULT_CONFIG, DEFAULT_THRESHOLDS } from '../src/core/trends/types.js'
import type { TrendSnapshot, TrendSummary, ComplexityMetrics } from '../src/core/trends/types.js'

// ─── ComplexityCalculator ───

describe('ComplexityCalculator: cyclomatic complexity', () => {
  const calc = new ComplexityCalculator()

  it('returns 1 for simple code with no branches', () => {
    expect(calc.countCyclomatic('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(calc.countCyclomatic('if (a) {} if (b) {}')).toBe(3)
  })

  it('counts for, while, case, catch', () => {
    const code = 'for(;;){} while(false){} switch(x){case 1:} try{}catch(e){}'
    const cc = calc.countCyclomatic(code)
    expect(cc).toBeGreaterThanOrEqual(5)
  })

  it('counts logical operators', () => {
    expect(calc.countCyclomatic('a && b || c')).toBeGreaterThanOrEqual(3)
  })
})

describe('ComplexityCalculator: cognitive complexity', () => {
  const calc = new ComplexityCalculator()

  it('returns 0 for simple code', () => {
    expect(calc.countCognitive('const x = 1')).toBe(0)
  })

  it('counts nested structures with increment', () => {
    const code = 'if (a) { if (b) { if (c) {} } }'
    const cc = calc.countCognitive(code)
    expect(cc).toBeGreaterThan(3)
  })

  it('ignores code inside strings', () => {
    const code = 'const s = "if (a) { if (b) }"'
    expect(calc.countCognitive(code)).toBe(0)
  })

  it('ignores code in line comments', () => {
    const code = '// if (a) { if (b) }\nconst x = 1'
    expect(calc.countCognitive(code)).toBe(0)
  })

  it('ignores code in block comments', () => {
    const code = '/* if (a) { if (b) } */ const x = 1'
    expect(calc.countCognitive(code)).toBe(0)
  })
})

describe('ComplexityCalculator: lines of code', () => {
  const calc = new ComplexityCalculator()

  it('counts total and effective lines', () => {
    const code = 'const x = 1\n\n// comment\nconst y = 2'
    const result = calc.countLinesOfCode(code)
    expect(result.total).toBe(4)
    expect(result.effective).toBe(2)
  })

  it('skips empty and comment-only lines', () => {
    const code = '\n  \n// comment\n/* block */\n* middle'
    const result = calc.countLinesOfCode(code)
    expect(result.effective).toBe(0)
  })
})

describe('ComplexityCalculator: function counting', () => {
  const calc = new ComplexityCalculator()

  it('counts function declarations', () => {
    expect(calc.countFunctions('function foo() {}')).toBeGreaterThanOrEqual(1)
  })

  it('counts arrow functions', () => {
    expect(calc.countFunctions('const f = () => 1')).toBeGreaterThanOrEqual(1)
  })
})

describe('ComplexityCalculator: nesting depth', () => {
  const calc = new ComplexityCalculator()

  it('calculates max nesting depth', () => {
    expect(calc.calculateMaxNesting('{{{}}}')).toBe(3)
    expect(calc.calculateMaxNesting('no braces')).toBe(0)
  })
})

describe('ComplexityCalculator: full file analysis', () => {
  const calc = new ComplexityCalculator()

  it('calculateForFile returns full metrics', () => {
    const code = 'function add(a, b) {\n  if (a > 0) {\n    return a + b\n  }\n  return b\n}'
    const metrics = calc.calculateForFile(code, 'test.ts')
    expect(metrics.filePath).toBe('test.ts')
    expect(metrics.linesOfCode).toBe(6)
    expect(metrics.functionCount).toBeGreaterThanOrEqual(1)
    expect(metrics.maintainabilityIndex).toBeGreaterThanOrEqual(0)
    expect(metrics.timestamp).toBeGreaterThan(0)
  })

  it('calculateForFunction returns complexity and nesting', () => {
    const result = calc.calculateForFunction('if (a) { if (b) {} }')
    expect(result.cyclomatic).toBeGreaterThanOrEqual(1)
    expect(result.cognitive).toBeGreaterThanOrEqual(1)
    expect(result.nesting).toBeGreaterThanOrEqual(1)
  })

  it('returns 100 maintainability for empty effective lines', () => {
    const metrics = calc.calculateForFile('', 'empty.ts')
    expect(metrics.maintainabilityIndex).toBe(100)
  })
})

// ─── TrendAnalyzer ───

function makeSnapshot(id: string, ts: number, avgCC: number, avgCog: number, avgMaint: number, totalLOC: number): TrendSnapshot {
  return {
    id,
    timestamp: ts,
    metrics: [],
    summary: {
      totalFiles: 1,
      avgCyclomatic: avgCC,
      avgCognitive: avgCog,
      avgMaintainability: avgMaint,
      totalLOC,
      totalEffectiveLOC: totalLOC,
      totalFunctions: 10,
      maxComplexityFile: 'a.ts',
      complexityDistribution: { low: 1, medium: 0, high: 0, critical: 0 },
    },
  }
}

describe('TrendAnalyzer: analyzeTrend', () => {
  const analyzer = new TrendAnalyzer()

  it('detects improving trend', () => {
    const snapshots = [
      makeSnapshot('1', 1000, 15, 10, 50, 200),
      makeSnapshot('2', 2000, 12, 8, 55, 180),
      makeSnapshot('3', 3000, 10, 6, 60, 150),
    ]
    const result = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
    expect(result.direction).toBe('improving')
    expect(result.changePercent).toBeLessThan(0)
    expect(result.dataPoints).toHaveLength(3)
  })

  it('detects degrading trend', () => {
    const snapshots = [
      makeSnapshot('1', 1000, 10, 5, 60, 100),
      makeSnapshot('2', 2000, 15, 8, 55, 150),
      makeSnapshot('3', 3000, 20, 12, 45, 200),
    ]
    const result = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
    expect(result.direction).toBe('degrading')
  })

  it('detects stable trend', () => {
    const snapshots = [
      makeSnapshot('1', 1000, 10, 5, 60, 100),
      makeSnapshot('2', 2000, 10, 5, 60, 100),
    ]
    const result = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
    expect(result.direction).toBe('stable')
  })

  it('returns forecast data points', () => {
    const snapshots = [
      makeSnapshot('1', 1000, 10, 5, 60, 100),
      makeSnapshot('2', 2000, 12, 6, 58, 120),
    ]
    const result = analyzer.analyzeTrend(snapshots, 'avgCyclomatic')
    expect(result.forecast).toHaveLength(3)
  })
})

describe('TrendAnalyzer: change rate', () => {
  const analyzer = new TrendAnalyzer()

  it('returns 0 for fewer than 2 points', () => {
    expect(analyzer.calculateChangeRate([{ timestamp: 1, value: 5 }])).toBe(0)
  })

  it('calculates change rate', () => {
    const points = [
      { timestamp: 1, value: 10 },
      { timestamp: 2, value: 20 },
    ]
    const rate = analyzer.calculateChangeRate(points)
    expect(rate).toBeGreaterThan(0)
  })
})

describe('TrendAnalyzer: anomaly detection', () => {
  const analyzer = new TrendAnalyzer()

  it('returns empty for fewer than 3 snapshots', () => {
    const snapshots = [makeSnapshot('1', 1, 10, 5, 60, 100), makeSnapshot('2', 2, 10, 5, 60, 100)]
    expect(analyzer.detectAnomalies(snapshots, 'avgCyclomatic')).toEqual([])
  })

  it('detects anomalies in data with spikes', () => {
    const snapshots = [
      makeSnapshot('1', 1, 10, 5, 60, 100),
      makeSnapshot('2', 2, 10, 5, 60, 100),
      makeSnapshot('3', 3, 100, 5, 60, 100),
      makeSnapshot('4', 4, 10, 5, 60, 100),
      makeSnapshot('5', 5, 10, 5, 60, 100),
    ]
    const anomalies = analyzer.detectAnomalies(snapshots, 'avgCyclomatic')
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies[0]!.metric).toBe('avgCyclomatic')
  })
})

describe('TrendAnalyzer: compareSnapshots', () => {
  const analyzer = new TrendAnalyzer()

  it('compares two snapshots', () => {
    const a = makeSnapshot('1', 1, 10, 5, 60, 100)
    const b = makeSnapshot('2', 2, 15, 8, 55, 150)
    const comparisons = analyzer.compareSnapshots(a, b)
    expect(comparisons.length).toBeGreaterThan(0)
    const ccComp = comparisons.find(c => c.metric === 'avgCyclomatic')
    expect(ccComp!.previous).toBe(10)
    expect(ccComp!.current).toBe(15)
    expect(ccComp!.change).toBe(5)
  })
})

describe('TrendAnalyzer: complexity distribution', () => {
  const analyzer = new TrendAnalyzer()

  it('returns distribution object', () => {
    const metrics: ComplexityMetrics[] = [
      { filePath: 'a.ts', cyclomaticComplexity: 5, cognitiveComplexity: 3, linesOfCode: 10, linesOfCodeEffective: 8, functionCount: 1, maxNestingDepth: 1, maintainabilityIndex: 80, timestamp: 1 },
      { filePath: 'b.ts', cyclomaticComplexity: 25, cognitiveComplexity: 15, linesOfCode: 20, linesOfCodeEffective: 18, functionCount: 2, maxNestingDepth: 3, maintainabilityIndex: 40, timestamp: 1 },
    ]
    const snapshot: TrendSnapshot = {
      id: '1', timestamp: 1, metrics, summary: {
        totalFiles: 2, avgCyclomatic: 15, avgCognitive: 9, avgMaintainability: 60, totalLOC: 30, totalEffectiveLOC: 26, totalFunctions: 3, maxComplexityFile: 'b.ts', complexityDistribution: { low: 1, medium: 0, high: 1, critical: 0 },
      },
    }
    const dist = analyzer.getComplexityDistribution(snapshot)
    expect(dist.low).toBe(1)
    expect(dist.high).toBe(1)
  })
})

describe('TrendAnalyzer: file trends', () => {
  const analyzer = new TrendAnalyzer()

  it('returns empty for fewer than 2 snapshots', () => {
    expect(analyzer.getTopDegradingFiles([makeSnapshot('1', 1, 10, 5, 60, 100)])).toEqual([])
    expect(analyzer.getTopImprovingFiles([makeSnapshot('1', 1, 10, 5, 60, 100)])).toEqual([])
  })
})

// ─── TrendStore ───

describe('TrendStore: import/export', () => {
  it('exportToJSON serializes snapshots', () => {
    const store = new TrendStore(DEFAULT_CONFIG)
    const snapshots = [makeSnapshot('1', 1000, 10, 5, 60, 100)]
    const json = store.exportToJSON(snapshots)
    expect(JSON.parse(json)).toHaveLength(1)
  })

  it('importFromJSON parses valid JSON', () => {
    const store = new TrendStore(DEFAULT_CONFIG)
    const snapshots = [makeSnapshot('1', 1000, 10, 5, 60, 100)]
    const json = store.exportToJSON(snapshots)
    const parsed = store.importFromJSON(json)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]!.id).toBe('1')
  })

  it('importFromJSON rejects non-array JSON', () => {
    const store = new TrendStore(DEFAULT_CONFIG)
    expect(() => store.importFromJSON('{}')).toThrow(/expected an array/)
  })

  it('importFromJSON rejects invalid snapshot format', () => {
    const store = new TrendStore(DEFAULT_CONFIG)
    expect(() => store.importFromJSON('[{"bad": true}]')).toThrow(/Invalid snapshot/)
  })
})

describe('TrendStore: file operations', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trend-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('saves and loads snapshots', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    const snapshot = makeSnapshot('test-1', 1000, 10, 5, 60, 100)
    store.saveSnapshot(snapshot)
    const loaded = store.loadSnapshots()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]!.id).toBe('test-1')
  })

  it('returns empty array when directory does not exist', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: path.join(tmpDir, 'nonexistent') })
    expect(store.loadSnapshots()).toEqual([])
  })

  it('getLatestSnapshot returns most recent', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    store.saveSnapshot(makeSnapshot('old', 1000, 10, 5, 60, 100))
    store.saveSnapshot(makeSnapshot('new', 2000, 15, 8, 55, 150))
    const latest = store.getLatestSnapshot()
    expect(latest!.id).toBe('new')
  })

  it('getLatestSnapshot returns null when empty', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    expect(store.getLatestSnapshot()).toBeNull()
  })

  it('getSnapshotRange filters by timestamp', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    store.saveSnapshot(makeSnapshot('1', 1000, 10, 5, 60, 100))
    store.saveSnapshot(makeSnapshot('2', 2000, 10, 5, 60, 100))
    store.saveSnapshot(makeSnapshot('3', 3000, 10, 5, 60, 100))
    const range = store.getSnapshotRange(1500, 2500)
    expect(range).toHaveLength(1)
    expect(range[0]!.id).toBe('2')
  })

  it('getSnapshotByCommit finds by commit hash', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    const snap = makeSnapshot('1', 1000, 10, 5, 60, 100)
    snap.commitHash = 'abc123'
    store.saveSnapshot(snap)
    const found = store.getSnapshotByCommit('abc123')
    expect(found!.id).toBe('1')
    expect(store.getSnapshotByCommit('missing')).toBeNull()
  })

  it('pruneSnapshots removes oldest snapshots', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    store.saveSnapshot(makeSnapshot('1', 1000, 10, 5, 60, 100))
    store.saveSnapshot(makeSnapshot('2', 2000, 10, 5, 60, 100))
    store.saveSnapshot(makeSnapshot('3', 3000, 10, 5, 60, 100))
    const removed = store.pruneSnapshots(2)
    expect(removed).toBe(1)
    expect(store.loadSnapshots()).toHaveLength(2)
  })

  it('pruneSnapshots does nothing when under max', () => {
    const store = new TrendStore({ ...DEFAULT_CONFIG, storagePath: tmpDir })
    store.saveSnapshot(makeSnapshot('1', 1000, 10, 5, 60, 100))
    expect(store.pruneSnapshots(10)).toBe(0)
  })
})

// ─── Default Constants ───

describe('Trends: default constants', () => {
  it('DEFAULT_THRESHOLDS has expected values', () => {
    expect(DEFAULT_THRESHOLDS.low).toBe(10)
    expect(DEFAULT_THRESHOLDS.medium).toBe(20)
    expect(DEFAULT_THRESHOLDS.high).toBe(30)
  })

  it('DEFAULT_CONFIG has expected values', () => {
    expect(DEFAULT_CONFIG.storagePath).toBe('.codeforge/trends')
    expect(DEFAULT_CONFIG.maxSnapshots).toBe(100)
  })
})
