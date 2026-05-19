import { describe, expect, it } from 'vitest'

import {
  buildBaselineResult,
  captureMetrics,
  classifyMetricDirection,
  compareBaselines,
  computeHealthDelta,
  createBaseline,
  deserializeBaseline,
  listBaselines,
  serializeBaseline,
  type BaselineMetrics,
} from '../src/commands/baseline-helpers.js'

import {
  formatBaselineJson,
  formatBaselineMetrics,
  formatComparison,
  formatDelta,
  formatDiffTable,
  statusIcon,
} from '../src/commands/baseline-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

function makeMetrics(overrides: Partial<BaselineMetrics> = {}): BaselineMetrics {
  return {
    avgComplexity: 10,
    avgFunctionLength: 15,
    codeLines: 1000,
    deadCodeItems: 3,
    directoryCounts: { src: 10 },
    fixmeCount: 2,
    languages: { TypeScript: 10 },
    name: 'test',
    securityIssues: 0,
    testFiles: 5,
    timestamp: '2025-01-01T00:00:00.000Z',
    todoCount: 8,
    topFiles: [{ file: 'src/main.ts', lines: 200 }],
    totalFiles: 20,
    totalLines: 2000,
    sourceFiles: 15,
    ...overrides,
  }
}

const sampleFiles = [
  { absolutePath: '/src/index.ts', path: 'src/index.ts' },
  { absolutePath: '/src/utils.ts', path: 'src/utils.ts' },
  { absolutePath: '/src/index.test.ts', path: 'src/index.test.ts' },
]

const sampleContents = new Map<string, string>([
  ['/src/index.ts', 'function main() {\n  if (true) {\n    console.log("hello")\n  }\n}\n// TODO: fix this\n'],
  ['/src/utils.ts', 'const add = (a: number, b: number) => a + b\n// FIXME: broken\nfunction helper() {\n  return 42\n}\n'],
  ['/src/index.test.ts', 'describe("test", () => {\n  it("works", () => {\n    expect(1).toBe(1)\n  })\n})\n'],
])

// ─── classifyMetricDirection ────────────────────────────

describe('classifyMetricDirection', () => {
  it('classifies totalFiles as good', () => {
    expect(classifyMetricDirection('totalFiles')).toBe('good')
  })

  it('classifies totalLines as good', () => {
    expect(classifyMetricDirection('totalLines')).toBe('good')
  })

  it('classifies codeLines as good', () => {
    expect(classifyMetricDirection('codeLines')).toBe('good')
  })

  it('classifies testFiles as good', () => {
    expect(classifyMetricDirection('testFiles')).toBe('good')
  })

  it('classifies sourceFiles as good', () => {
    expect(classifyMetricDirection('sourceFiles')).toBe('good')
  })

  it('classifies avgComplexity as bad', () => {
    expect(classifyMetricDirection('avgComplexity')).toBe('bad')
  })

  it('classifies avgFunctionLength as bad', () => {
    expect(classifyMetricDirection('avgFunctionLength')).toBe('bad')
  })

  it('classifies todoCount as bad', () => {
    expect(classifyMetricDirection('todoCount')).toBe('bad')
  })

  it('classifies fixmeCount as bad', () => {
    expect(classifyMetricDirection('fixmeCount')).toBe('bad')
  })

  it('classifies securityIssues as bad', () => {
    expect(classifyMetricDirection('securityIssues')).toBe('bad')
  })

  it('classifies deadCodeItems as bad', () => {
    expect(classifyMetricDirection('deadCodeItems')).toBe('bad')
  })

  it('classifies unknown as neutral', () => {
    expect(classifyMetricDirection('unknownMetric')).toBe('neutral')
  })
})

// ─── captureMetrics ─────────────────────────────────────

describe('captureMetrics', () => {
  it('counts total files', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.totalFiles).toBe(3)
  })

  it('counts total lines', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.totalLines).toBeGreaterThan(0)
  })

  it('counts code lines excluding blanks and comments', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.codeLines).toBeLessThan(m.totalLines)
  })

  it('detects test files', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.testFiles).toBeGreaterThanOrEqual(1)
  })

  it('counts source files', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.sourceFiles).toBeGreaterThanOrEqual(1)
  })

  it('counts TODOs', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.todoCount).toBeGreaterThanOrEqual(1)
  })

  it('counts FIXMEs', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.fixmeCount).toBeGreaterThanOrEqual(1)
  })

  it('detects dead code (console.log)', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.deadCodeItems).toBeGreaterThanOrEqual(1)
  })

  it('detects security issues (eval)', () => {
    const files = [{ absolutePath: '/src/bad.ts', path: 'src/bad.ts' }]
    const contents = new Map([['/src/bad.ts', 'eval("alert(1)")']])
    const m = captureMetrics(files, contents)
    expect(m.securityIssues).toBeGreaterThanOrEqual(1)
  })

  it('computes avg complexity', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.avgComplexity).toBeGreaterThanOrEqual(0)
  })

  it('returns empty metrics for no files', () => {
    const m = captureMetrics([], new Map())
    expect(m.totalFiles).toBe(0)
    expect(m.totalLines).toBe(0)
    expect(m.codeLines).toBe(0)
  })

  it('populates languages', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(Object.keys(m.languages).length).toBeGreaterThan(0)
  })

  it('populates topFiles', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(m.topFiles.length).toBeGreaterThan(0)
  })

  it('populates directoryCounts', () => {
    const m = captureMetrics(sampleFiles, sampleContents)
    expect(Object.keys(m.directoryCounts).length).toBeGreaterThan(0)
  })

  it('limits topFiles to 10', () => {
    const manyFiles = Array.from({ length: 15 }, (_, i) => ({
      absolutePath: `/f${i}.ts`, path: `f${i}.ts`,
    }))
    const manyContents = new Map(manyFiles.map((f) => [f.absolutePath, 'line\n']))
    const m = captureMetrics(manyFiles, manyContents)
    expect(m.topFiles.length).toBeLessThanOrEqual(10)
  })
})

// ─── createBaseline ─────────────────────────────────────

describe('createBaseline', () => {
  it('sets the name', () => {
    const m = makeMetrics()
    const b = createBaseline('v1', m)
    expect(b.name).toBe('v1')
  })

  it('sets timestamp', () => {
    const m = makeMetrics()
    const b = createBaseline('v1', m)
    expect(b.timestamp).toBeTruthy()
  })

  it('preserves metrics', () => {
    const m = makeMetrics({ totalFiles: 42 })
    const b = createBaseline('v1', m)
    expect(b.totalFiles).toBe(42)
  })

  it('does not mutate original', () => {
    const m = makeMetrics({ name: 'original' })
    createBaseline('v1', m)
    expect(m.name).toBe('original')
  })
})

// ─── compareBaselines ───────────────────────────────────

describe('compareBaselines', () => {
  it('detects unchanged when identical', () => {
    const m = makeMetrics()
    const c = compareBaselines(m, m)
    expect(c.overallStatus).toBe('unchanged')
  })

  it('detects improvement when testFiles increase', () => {
    const base = makeMetrics({ testFiles: 5 })
    const curr = makeMetrics({ testFiles: 10 })
    const c = compareBaselines(base, curr)
    const testDiff = c.diffs.find((d) => d.metric === 'testFiles')!
    expect(testDiff.status).toBe('improved')
  })

  it('detects regression when todoCount increases', () => {
    const base = makeMetrics({ todoCount: 2 })
    const curr = makeMetrics({ todoCount: 10 })
    const c = compareBaselines(base, curr)
    const todoDiff = c.diffs.find((d) => d.metric === 'todoCount')!
    expect(todoDiff.status).toBe('regressed')
  })

  it('detects regression when avgComplexity increases', () => {
    const base = makeMetrics({ avgComplexity: 5 })
    const curr = makeMetrics({ avgComplexity: 20 })
    const c = compareBaselines(base, curr)
    const diff = c.diffs.find((d) => d.metric === 'avgComplexity')!
    expect(diff.status).toBe('regressed')
  })

  it('computes delta correctly', () => {
    const base = makeMetrics({ totalFiles: 10 })
    const curr = makeMetrics({ totalFiles: 15 })
    const c = compareBaselines(base, curr)
    const diff = c.diffs.find((d) => d.metric === 'totalFiles')!
    expect(diff.delta).toBe(5)
  })

  it('computes deltaPercent correctly', () => {
    const base = makeMetrics({ totalFiles: 100 })
    const curr = makeMetrics({ totalFiles: 120 })
    const c = compareBaselines(base, curr)
    const diff = c.diffs.find((d) => d.metric === 'totalFiles')!
    expect(diff.deltaPercent).toBe(20)
  })

  it('marks status new when baseline is zero and current nonzero', () => {
    const base = makeMetrics({ securityIssues: 0 })
    const curr = makeMetrics({ securityIssues: 5 })
    const c = compareBaselines(base, curr)
    const diff = c.diffs.find((d) => d.metric === 'securityIssues')!
    expect(diff.status).toBe('new')
  })

  it('marks unchanged when both zero', () => {
    const base = makeMetrics({ securityIssues: 0 })
    const curr = makeMetrics({ securityIssues: 0 })
    const c = compareBaselines(base, curr)
    const diff = c.diffs.find((d) => d.metric === 'securityIssues')!
    expect(diff.status).toBe('unchanged')
  })

  it('populates regressions list', () => {
    const base = makeMetrics({ todoCount: 1 })
    const curr = makeMetrics({ todoCount: 20 })
    const c = compareBaselines(base, curr)
    expect(c.regressions.length).toBeGreaterThan(0)
  })

  it('populates improvements list', () => {
    const base = makeMetrics({ testFiles: 1 })
    const curr = makeMetrics({ testFiles: 20 })
    const c = compareBaselines(base, curr)
    expect(c.improvements.length).toBeGreaterThan(0)
  })

  it('sets baselineName', () => {
    const base = makeMetrics({ name: 'v1' })
    const curr = makeMetrics()
    const c = compareBaselines(base, curr)
    expect(c.baselineName).toBe('v1')
  })

  it('sets timestamps', () => {
    const base = makeMetrics({ timestamp: '2025-01-01' })
    const curr = makeMetrics({ timestamp: '2025-06-01' })
    const c = compareBaselines(base, curr)
    expect(c.baselineTimestamp).toBe('2025-01-01')
    expect(c.currentTimestamp).toBe('2025-06-01')
  })

  it('computes healthDelta', () => {
    const base = makeMetrics({ testFiles: 2 })
    const curr = makeMetrics({ testFiles: 10 })
    const c = compareBaselines(base, curr)
    expect(typeof c.healthDelta).toBe('number')
  })
})

// ─── computeHealthDelta ─────────────────────────────────

describe('computeHealthDelta', () => {
  it('returns 0 for empty', () => {
    expect(computeHealthDelta([])).toBe(0)
  })

  it('adds 1 per improvement', () => {
    const diffs = [{ status: 'improved' as const, metric: 'x', baseline: 0, current: 0, delta: 0, deltaPercent: 0 }]
    expect(computeHealthDelta(diffs)).toBe(1)
  })

  it('subtracts 2 per regression', () => {
    const diffs = [{ status: 'regressed' as const, metric: 'x', baseline: 0, current: 0, delta: 0, deltaPercent: 0 }]
    expect(computeHealthDelta(diffs)).toBe(-2)
  })

  it('ignores unchanged', () => {
    const diffs = [{ status: 'unchanged' as const, metric: 'x', baseline: 0, current: 0, delta: 0, deltaPercent: 0 }]
    expect(computeHealthDelta(diffs)).toBe(0)
  })

  it('combines improvements and regressions', () => {
    const diffs = [
      { status: 'improved' as const, metric: 'a', baseline: 0, current: 0, delta: 0, deltaPercent: 0 },
      { status: 'improved' as const, metric: 'b', baseline: 0, current: 0, delta: 0, deltaPercent: 0 },
      { status: 'regressed' as const, metric: 'c', baseline: 0, current: 0, delta: 0, deltaPercent: 0 },
    ]
    expect(computeHealthDelta(diffs)).toBe(0)
  })
})

// ─── serializeBaseline / deserializeBaseline ────────────

describe('serializeBaseline / deserializeBaseline', () => {
  it('roundtrips metrics', () => {
    const m = makeMetrics({ name: 'roundtrip', totalFiles: 99 })
    const json = serializeBaseline(m)
    const parsed = deserializeBaseline(json)
    expect(parsed.name).toBe('roundtrip')
    expect(parsed.totalFiles).toBe(99)
  })

  it('produces valid JSON', () => {
    const m = makeMetrics()
    const json = serializeBaseline(m)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('preserves languages', () => {
    const m = makeMetrics({ languages: { TypeScript: 10, Python: 3 } })
    const parsed = deserializeBaseline(serializeBaseline(m))
    expect(parsed.languages.TypeScript).toBe(10)
    expect(parsed.languages.Python).toBe(3)
  })

  it('preserves topFiles', () => {
    const m = makeMetrics({ topFiles: [{ file: 'big.ts', lines: 500 }] })
    const parsed = deserializeBaseline(serializeBaseline(m))
    expect(parsed.topFiles[0].file).toBe('big.ts')
  })
})

// ─── listBaselines ──────────────────────────────────────

describe('listBaselines', () => {
  it('returns empty for empty store', () => {
    const store = { baselines: new Map<string, BaselineMetrics>() }
    expect(listBaselines(store)).toEqual([])
  })

  it('returns stored baselines', () => {
    const store = { baselines: new Map<string, BaselineMetrics>() }
    const m = makeMetrics({ name: 'v1' })
    store.baselines.set('v1', m)
    const list = listBaselines(store)
    expect(list.length).toBe(1)
    expect(list[0].name).toBe('v1')
  })

  it('returns multiple baselines', () => {
    const store = { baselines: new Map<string, BaselineMetrics>() }
    store.baselines.set('v1', makeMetrics({ name: 'v1' }))
    store.baselines.set('v2', makeMetrics({ name: 'v2' }))
    const list = listBaselines(store)
    expect(list.length).toBe(2)
  })
})

// ─── buildBaselineResult ────────────────────────────────

describe('buildBaselineResult', () => {
  it('creates metrics for create action', async () => {
    const reader = async () => 'function main() { return 1 }'
    const result = await buildBaselineResult(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      reader,
      { action: 'create', name: 'v1' },
    )
    expect(result.action).toBe('create')
    expect(result.metrics).toBeTruthy()
    expect(result.metrics!.name).toBe('v1')
  })

  it('returns names for list action', async () => {
    const result = await buildBaselineResult([], async () => '', { action: 'list' })
    expect(result.action).toBe('list')
    expect(result.names).toEqual([])
  })

  it('skips unreadable files', async () => {
    const reader = async () => { throw new Error('nope') }
    const result = await buildBaselineResult(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      reader,
      { action: 'create' },
    )
    expect(result.metrics).toBeTruthy()
    expect(result.metrics!.totalFiles).toBe(1)
    expect(result.metrics!.totalLines).toBeGreaterThanOrEqual(0)
  })

  it('defaults to create action', async () => {
    const reader = async () => 'code'
    const result = await buildBaselineResult(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      reader,
    )
    expect(result.action).toBe('create')
  })

  it('uses default name when not specified', async () => {
    const reader = async () => 'code'
    const result = await buildBaselineResult(
      [{ absolutePath: '/a.ts', path: 'a.ts' }],
      reader,
    )
    expect(result.metrics!.name).toBe('default')
  })
})

// ─── statusIcon ─────────────────────────────────────────

describe('statusIcon', () => {
  it('returns green arrow for improved', () => {
    const result = statusIcon('improved')
    expect(result).toContain('↑')
  })

  it('returns red arrow for regressed', () => {
    const result = statusIcon('regressed')
    expect(result).toContain('↓')
  })

  it('returns cyan plus for new', () => {
    const result = statusIcon('new')
    expect(result).toContain('+')
  })

  it('returns gray dot for unchanged', () => {
    const result = statusIcon('unchanged')
    expect(result).toContain('·')
  })
})

// ─── formatDelta ────────────────────────────────────────

describe('formatDelta', () => {
  it('shows positive sign', () => {
    const result = formatDelta(12.5, 'improved')
    expect(result).toContain('+12.5%')
  })

  it('shows negative without extra sign', () => {
    const result = formatDelta(-5, 'regressed')
    expect(result).toContain('-5%')
  })

  it('shows zero for unchanged', () => {
    const result = formatDelta(0, 'unchanged')
    expect(result).toContain('0%')
  })
})

// ─── formatDiffTable ────────────────────────────────────

describe('formatDiffTable', () => {
  it('renders header', () => {
    const result = formatDiffTable([])
    expect(result).toContain('Metric Diffs')
  })

  it('renders diff rows', () => {
    const diffs = [{
      baseline: 10, current: 15, delta: 5, deltaPercent: 50,
      metric: 'totalFiles', status: 'improved' as const,
    }]
    const result = formatDiffTable(diffs)
    expect(result).toContain('totalFiles')
  })

  it('renders multiple diffs', () => {
    const diffs = [
      { baseline: 10, current: 15, delta: 5, deltaPercent: 50, metric: 'totalFiles', status: 'improved' as const },
      { baseline: 5, current: 20, delta: 15, deltaPercent: 300, metric: 'todoCount', status: 'regressed' as const },
    ]
    const result = formatDiffTable(diffs)
    expect(result).toContain('totalFiles')
    expect(result).toContain('todoCount')
  })
})

// ─── formatBaselineMetrics ──────────────────────────────

describe('formatBaselineMetrics', () => {
  it('renders baseline name', () => {
    const result = formatBaselineMetrics(makeMetrics({ name: 'v1' }))
    expect(result).toContain('v1')
  })

  it('renders total files', () => {
    const result = formatBaselineMetrics(makeMetrics({ totalFiles: 42 }))
    expect(result).toContain('42')
  })

  it('renders languages section', () => {
    const result = formatBaselineMetrics(makeMetrics({ languages: { TypeScript: 10 } }))
    expect(result).toContain('TypeScript')
  })

  it('renders top files section', () => {
    const result = formatBaselineMetrics(makeMetrics({ topFiles: [{ file: 'big.ts', lines: 500 }] }))
    expect(result).toContain('big.ts')
  })

  it('omits languages when empty', () => {
    const result = formatBaselineMetrics(makeMetrics({ languages: {} }))
    expect(result).not.toContain('Languages')
  })

  it('omits top files when empty', () => {
    const result = formatBaselineMetrics(makeMetrics({ topFiles: [] }))
    expect(result).not.toContain('Top Files')
  })
})

// ─── formatComparison ───────────────────────────────────

describe('formatComparison', () => {
  it('renders header', () => {
    const m = makeMetrics()
    const c = compareBaselines(m, m)
    const result = formatComparison(c)
    expect(result).toContain('Baseline Comparison')
  })

  it('renders baseline name', () => {
    const m = makeMetrics({ name: 'v2' })
    const c = compareBaselines(m, m)
    const result = formatComparison(c)
    expect(result).toContain('v2')
  })

  it('renders overall status', () => {
    const base = makeMetrics({ testFiles: 1 })
    const curr = makeMetrics({ testFiles: 20 })
    const c = compareBaselines(base, curr)
    const result = formatComparison(c)
    expect(result).toContain('Overall')
  })

  it('renders improvements section when present', () => {
    const base = makeMetrics({ testFiles: 1 })
    const curr = makeMetrics({ testFiles: 20 })
    const c = compareBaselines(base, curr)
    const result = formatComparison(c)
    expect(result).toContain('Improvements')
  })

  it('renders regressions section when present', () => {
    const base = makeMetrics({ todoCount: 1 })
    const curr = makeMetrics({ todoCount: 20 })
    const c = compareBaselines(base, curr)
    const result = formatComparison(c)
    expect(result).toContain('Regressions')
  })

  it('omits regressions when none', () => {
    const m = makeMetrics()
    const c = compareBaselines(m, m)
    const result = formatComparison(c)
    expect(result).not.toContain('Regressions')
  })

  it('renders health delta', () => {
    const base = makeMetrics({ testFiles: 1 })
    const curr = makeMetrics({ testFiles: 20 })
    const c = compareBaselines(base, curr)
    const result = formatComparison(c)
    expect(result).toContain('Health')
  })
})

// ─── formatBaselineJson ─────────────────────────────────

describe('formatBaselineJson', () => {
  it('produces valid JSON for metrics', () => {
    const json = formatBaselineJson(makeMetrics())
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes name', () => {
    const parsed = JSON.parse(formatBaselineJson(makeMetrics({ name: 'v1' })))
    expect(parsed.name).toBe('v1')
  })

  it('produces valid JSON for comparison', () => {
    const m = makeMetrics()
    const c = compareBaselines(m, m)
    const json = formatBaselineJson(c)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
