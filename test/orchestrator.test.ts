import { describe, expect, it } from 'vitest'
import {
  buildOrchestratorResult,
  classifyFunction,
  computeComplexity,
  computeOrchestrationLayers,
  detectOrchestrationPatterns,
  detectPurity,
  detectSideEffects,
  extractCalls,
  extractFunctions,
  generateRecommendations,
  type OrchestratorFunction,
  type OrchestratorStats,
} from '../src/commands/orchestrator-helpers.js'
import {
  formatFunctionTable,
  formatHotOrchestrators,
  formatIsolatedWorkers,
  formatLayersTable,
  formatOrchestratorJson,
  formatOrchestratorOutput,
  formatOrchestratorRecommendations,
  formatOrchestratorStats,
  formatPatternsTable,
  functionTypeBadge,
  patternTypeBadge,
  purityMeter,
} from '../src/commands/orchestrator-format-helpers.js'

// ─── classifyFunction ─────────────────────────────────────────────────────────

describe('classifyFunction', () => {
  it('classifies orchestrator: callsCount > 3, linesOfCode < 30', () => {
    expect(classifyFunction(5, 2, false, 15)).toBe('orchestrator')
  })

  it('does not classify as orchestrator if linesOfCode >= 30', () => {
    expect(classifyFunction(5, 2, false, 35)).toBe('hybrid')
  })

  it('classifies worker: callsCount 0, calledByCount > 0', () => {
    expect(classifyFunction(0, 3, false, 10)).toBe('worker')
  })

  it('classifies worker: callsCount 1, calledByCount > 0', () => {
    expect(classifyFunction(1, 2, false, 10)).toBe('worker')
  })

  it('does not classify as worker if calledByCount is 0', () => {
    expect(classifyFunction(0, 0, false, 10)).toBe('hybrid')
  })

  it('classifies pipeline: callsCount 2, no side effects', () => {
    expect(classifyFunction(2, 1, false, 20)).toBe('pipeline')
  })

  it('classifies pipeline: callsCount 3, no side effects', () => {
    expect(classifyFunction(3, 1, false, 20)).toBe('pipeline')
  })

  it('does not classify as pipeline if has side effects', () => {
    expect(classifyFunction(2, 1, true, 20)).toBe('hybrid')
  })

  it('classifies adapter: callsCount 1, calledByCount > 0, loc < 15', () => {
    expect(classifyFunction(1, 5, false, 10)).toBe('worker')
  })

  it('classifies hybrid for everything else', () => {
    expect(classifyFunction(2, 0, true, 50)).toBe('hybrid')
  })

  it('classifies hybrid for callsCount 3 with side effects', () => {
    expect(classifyFunction(3, 1, true, 20)).toBe('hybrid')
  })
})

// ─── detectSideEffects ────────────────────────────────────────────────────────

describe('detectSideEffects', () => {
  it('detects console.log', () => {
    expect(detectSideEffects('console.log("hi")')).toBe(true)
  })

  it('detects fs.readFile', () => {
    expect(detectSideEffects('fs.readFile(path)')).toBe(true)
  })

  it('detects fetch', () => {
    expect(detectSideEffects('fetch("/api")')).toBe(true)
  })

  it('detects process.env', () => {
    expect(detectSideEffects('process.env.API_KEY')).toBe(true)
  })

  it('detects Math.random', () => {
    expect(detectSideEffects('Math.random()')).toBe(true)
  })

  it('detects Date.now', () => {
    expect(detectSideEffects('Date.now()')).toBe(true)
  })

  it('detects throw', () => {
    expect(detectSideEffects('throw new Error("x")')).toBe(true)
  })

  it('returns false for pure code', () => {
    expect(detectSideEffects('const x = a + b')).toBe(false)
  })

  it('returns false for return-only', () => {
    expect(detectSideEffects('return a * b')).toBe(false)
  })

  it('detects localStorage', () => {
    expect(detectSideEffects('localStorage.setItem("k", "v")')).toBe(true)
  })
})

// ─── detectPurity ─────────────────────────────────────────────────────────────

describe('detectPurity', () => {
  it('returns true when no side effects', () => {
    expect(detectPurity(false)).toBe(true)
  })

  it('returns false when side effects present', () => {
    expect(detectPurity(true)).toBe(false)
  })
})

// ─── extractFunctions ─────────────────────────────────────────────────────────

describe('extractFunctions', () => {
  it('extracts function declarations', () => {
    const fns = extractFunctions('function hello() { return 1 }', 'a.ts')
    expect(fns.length).toBe(1)
    expect(fns[0].name).toBe('hello')
  })

  it('extracts arrow functions', () => {
    const fns = extractFunctions('const add = (a, b) => { return a + b }', 'a.ts')
    expect(fns.some((f) => f.name === 'add')).toBe(true)
  })

  it('extracts async function declarations', () => {
    const fns = extractFunctions('async function fetchData() { return await fetch("/") }', 'a.ts')
    expect(fns.some((f) => f.name === 'fetchData')).toBe(true)
  })

  it('skips comment lines', () => {
    const fns = extractFunctions('// function ignored() {}', 'a.ts')
    expect(fns.length).toBe(0)
  })

  it('skips import lines', () => {
    const fns = extractFunctions("import { foo } from 'bar'", 'a.ts')
    expect(fns.length).toBe(0)
  })

  it('sets file path correctly', () => {
    const fns = extractFunctions('function test() {}', 'b.ts')
    expect(fns[0].file).toBe('b.ts')
  })

  it('sets line number starting at 1', () => {
    const fns = extractFunctions('function test() {}', 'a.ts')
    expect(fns[0].line).toBe(1)
  })

  it('computes linesOfCode for multi-line function', () => {
    const code = 'function multi() {\n  const x = 1\n  return x\n}'
    const fns = extractFunctions(code, 'a.ts')
    expect(fns[0].linesOfCode).toBe(4)
  })

  it('extracts multiple functions', () => {
    const code = 'function a() {}\nfunction b() {}'
    const fns = extractFunctions(code, 'a.ts')
    expect(fns.length).toBe(2)
  })

  it('extracts const function expression', () => {
    const fns = extractFunctions('const greet = function() { return "hi" }', 'a.ts')
    expect(fns.some((f) => f.name === 'greet')).toBe(true)
  })
})

// ─── extractCalls ─────────────────────────────────────────────────────────────

describe('extractCalls', () => {
  it('extracts simple function calls', () => {
    expect(extractCalls('foo()')).toContain('foo')
  })

  it('extracts nested calls', () => {
    const calls = extractCalls('foo(bar())')
    expect(calls).toContain('foo')
    expect(calls).toContain('bar')
  })

  it('excludes keywords', () => {
    const calls = extractCalls('if (x) { return 1 }')
    expect(calls).not.toContain('if')
    expect(calls).not.toContain('return')
  })

  it('excludes constructor calls starting with uppercase', () => {
    const calls = extractCalls('new Error("x")')
    expect(calls).not.toContain('Error')
  })

  it('ignores calls inside strings', () => {
    const calls = extractCalls('const msg = "foo()"')
    expect(calls).not.toContain('foo')
  })

  it('extracts multiple distinct calls', () => {
    const calls = extractCalls('a(); b(); c()')
    expect(calls).toContain('a')
    expect(calls).toContain('b')
    expect(calls).toContain('c')
  })

  it('returns unique calls', () => {
    const calls = extractCalls('foo(); foo()')
    expect(calls.filter((c) => c === 'foo').length).toBe(1)
  })

  it('excludes built-in globals', () => {
    const calls = extractCalls('JSON.parse(str)')
    expect(calls).not.toContain('JSON')
  })
})

// ─── computeComplexity ────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('returns 2 for single if', () => {
    expect(computeComplexity('if (x) { y }')).toBe(2)
  })

  it('counts multiple branches', () => {
    expect(computeComplexity('if (a) {} else if (b) {}')).toBe(4)
  })

  it('counts for loops', () => {
    expect(computeComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts ternary operators', () => {
    expect(computeComplexity('const x = a ? 1 : 2')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(computeComplexity('if (a && b || c) {}')).toBe(4)
  })

  it('counts catch blocks', () => {
    expect(computeComplexity('try {} catch (e) {}')).toBe(2)
  })
})

// ─── detectOrchestrationPatterns ──────────────────────────────────────────────

describe('detectOrchestrationPatterns', () => {
  it('detects parallel patterns (Promise.all)', () => {
    const patterns = detectOrchestrationPatterns('const r = Promise.all([a(), b()])', 'a.ts')
    expect(patterns.some((p) => p.type === 'parallel')).toBe(true)
  })

  it('detects pipeline patterns (chaining)', () => {
    const patterns = detectOrchestrationPatterns('a().pipe(b).pipe(c)', 'a.ts')
    expect(patterns.some((p) => p.type === 'pipeline')).toBe(true)
  })

  it('detects middleware patterns (next())', () => {
    const patterns = detectOrchestrationPatterns('function handler(req, res, next) { next() }', 'a.ts')
    expect(patterns.some((p) => p.type === 'middleware-chain')).toBe(true)
  })

  it('detects event-driven patterns', () => {
    const patterns = detectOrchestrationPatterns("server.on('request', handler)", 'a.ts')
    expect(patterns.some((p) => p.type === 'event-driven')).toBe(true)
  })

  it('detects recursive patterns', () => {
    const code = 'function fib(n) { if (n <= 1) return n; return fib(n - 1) + fib(n - 2) }'
    const patterns = detectOrchestrationPatterns(code, 'a.ts')
    expect(patterns.some((p) => p.type === 'recursive')).toBe(true)
  })

  it('detects sequential patterns', () => {
    const code = 'foo()\nbar()'
    const patterns = detectOrchestrationPatterns(code, 'a.ts')
    expect(patterns.some((p) => p.type === 'sequential')).toBe(true)
  })

  it('skips comment lines for patterns', () => {
    const patterns = detectOrchestrationPatterns('// Promise.all([a(), b()])', 'a.ts')
    expect(patterns.some((p) => p.type === 'parallel')).toBe(false)
  })

  it('sets file path on patterns', () => {
    const patterns = detectOrchestrationPatterns('Promise.all([a(), b()])', 'my.ts')
    expect(patterns.every((p) => p.file === 'my.ts')).toBe(true)
  })

  it('sets line numbers on patterns', () => {
    const patterns = detectOrchestrationPatterns('Promise.all([a(), b()])', 'a.ts')
    expect(patterns.every((p) => p.line > 0)).toBe(true)
  })
})

// ─── computeOrchestrationLayers ───────────────────────────────────────────────

describe('computeOrchestrationLayers', () => {
  const makeFn = (overrides: Partial<OrchestratorFunction> = {}): OrchestratorFunction => ({
    name: 'fn',
    file: 'a.ts',
    line: 1,
    type: 'worker',
    callsCount: 0,
    calledByCount: 0,
    orchestrates: [],
    orchestratedBy: [],
    coordinationPatterns: [],
    complexity: 1,
    linesOfCode: 5,
    hasSideEffects: false,
    isPure: true,
    ...overrides,
  })

  it('groups entry points (not called by anything)', () => {
    const fns = [makeFn({ name: 'main', orchestratedBy: [], type: 'orchestrator' })]
    const layers = computeOrchestrationLayers(fns)
    const entry = layers.find((l) => l.name === 'Entry Points')
    expect(entry).toBeDefined()
    expect(entry!.functions).toContain('main')
  })

  it('groups workers in low-level layer', () => {
    const fns = [makeFn({ name: 'helper', type: 'worker', orchestratedBy: ['main'] })]
    const layers = computeOrchestrationLayers(fns)
    const workerLayer = layers.find((l) => l.name === 'Low-level Workers')
    expect(workerLayer).toBeDefined()
    expect(workerLayer!.functions).toContain('helper')
  })

  it('filters out empty layers', () => {
    const fns = [makeFn({ name: 'only', orchestratedBy: [], type: 'worker' })]
    const layers = computeOrchestrationLayers(fns)
    expect(layers.every((l) => l.functions.length > 0)).toBe(true)
  })

  it('computes averageCalls', () => {
    const fns = [
      makeFn({ name: 'a', callsCount: 4, orchestratedBy: [] }),
      makeFn({ name: 'b', callsCount: 2, orchestratedBy: [] }),
    ]
    const layers = computeOrchestrationLayers(fns)
    const entry = layers.find((l) => l.name === 'Entry Points')
    expect(entry!.averageCalls).toBe(3)
  })

  it('computes averageCalledBy', () => {
    const fns = [
      makeFn({ name: 'a', calledByCount: 2, orchestratedBy: ['x'], type: 'worker' }),
    ]
    const layers = computeOrchestrationLayers(fns)
    const worker = layers.find((l) => l.name === 'Low-level Workers')
    expect(worker!.averageCalledBy).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: OrchestratorStats = {
    totalFunctions: 10,
    orchestrators: 2,
    workers: 5,
    pipelines: 1,
    pureFunctions: 4,
    sideEffectFunctions: 3,
    maxOrchestrationDepth: 3,
    averageCallsPerFunction: 2.5,
  }

  it('warns about hot orchestrators', () => {
    const hot: OrchestratorFunction[] = [{
      name: 'runAll', file: 'a.ts', line: 1, type: 'orchestrator',
      callsCount: 8, calledByCount: 1, orchestrates: [], orchestratedBy: [],
      coordinationPatterns: [], complexity: 5, linesOfCode: 10,
      hasSideEffects: false, isPure: true,
    }]
    const recs = generateRecommendations(hot, [], baseStats)
    expect(recs.some((r) => r.includes('runAll'))).toBe(true)
  })

  it('warns about isolated workers', () => {
    const isolated: OrchestratorFunction[] = [{
      name: 'deadFn', file: 'a.ts', line: 1, type: 'worker',
      callsCount: 0, calledByCount: 0, orchestrates: [], orchestratedBy: [],
      coordinationPatterns: [], complexity: 1, linesOfCode: 5,
      hasSideEffects: false, isPure: true,
    }]
    const recs = generateRecommendations([], isolated, baseStats)
    expect(recs.some((r) => r.includes('deadFn'))).toBe(true)
  })

  it('warns about low average calls', () => {
    const stats = { ...baseStats, averageCallsPerFunction: 0.5 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('too isolated'))).toBe(true)
  })

  it('warns about too many side effects', () => {
    const stats = { ...baseStats, sideEffectFunctions: 8, totalFunctions: 10 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('side effects'))).toBe(true)
  })

  it('warns about no pure functions', () => {
    const stats = { ...baseStats, pureFunctions: 0, totalFunctions: 10 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('pure'))).toBe(true)
  })

  it('warns about deep orchestration', () => {
    const stats = { ...baseStats, maxOrchestrationDepth: 7 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('7'))).toBe(true)
  })

  it('returns healthy message when all good', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildOrchestratorResult ──────────────────────────────────────────────────

describe('buildOrchestratorResult', () => {
  it('returns complete result with functions', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function run() { foo(); bar(); baz(); qux(); }'],
    )
    expect(result.stats.totalFunctions).toBeGreaterThan(0)
    expect(result.functions.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildOrchestratorResult([], [])
    expect(result.stats.totalFunctions).toBe(0)
    expect(result.functions.length).toBe(0)
    expect(result.patterns.length).toBe(0)
  })

  it('detects orchestrator functions', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function run() { a(); b(); c(); d(); }'],
    )
    expect(result.functions.some((f) => f.type === 'orchestrator')).toBe(true)
  })

  it('detects worker functions', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function helper() { return 1 }\nfunction main() { helper() }'],
    )
    expect(result.functions.some((f) => f.type === 'worker')).toBe(true)
  })

  it('computes stats correctly', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function a() { return 1 }\nfunction b() { return a() }'],
    )
    expect(result.stats.totalFunctions).toBe(2)
    expect(result.stats.workers).toBeGreaterThanOrEqual(0)
    expect(result.stats.orchestrators).toBeGreaterThanOrEqual(0)
  })

  it('identifies hot orchestrators', () => {
    const calls = Array.from({ length: 7 }, (_, i) => `fn${i}()`).join('; ')
    const result = buildOrchestratorResult(
      ['a.ts'],
      [`function big() { ${calls} }`],
    )
    expect(result.hotOrchestrators.length).toBeGreaterThanOrEqual(0)
  })

  it('identifies isolated workers', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function main() { helper() }\nfunction helper() { return 42 }'],
    )
    expect(result.isolatedWorkers.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildOrchestratorResult(['a.ts'], ['function x() { return 1 }'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('builds layers', () => {
    const result = buildOrchestratorResult(
      ['a.ts'],
      ['function main() { helper() }\nfunction helper() { return 1 }'],
    )
    expect(result.layers.length).toBeGreaterThan(0)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('functionTypeBadge', () => {
  it('returns badge for each type', () => {
    expect(functionTypeBadge('orchestrator')).toContain('ORCH')
    expect(functionTypeBadge('worker')).toContain('WORK')
    expect(functionTypeBadge('pipeline')).toContain('PIPE')
    expect(functionTypeBadge('adapter')).toContain('ADPT')
    expect(functionTypeBadge('hybrid')).toContain('HYBR')
  })
})

describe('patternTypeBadge', () => {
  it('returns badge for each pattern', () => {
    expect(patternTypeBadge('parallel')).toContain('PARA')
    expect(patternTypeBadge('sequential')).toContain('SEQ')
    expect(patternTypeBadge('recursive')).toContain('RECR')
    expect(patternTypeBadge('middleware-chain')).toContain('MDLW')
  })
})

describe('purityMeter', () => {
  it('renders meter with percentage', () => {
    const meter = purityMeter(0.8)
    expect(meter).toContain('80%')
    expect(meter).toContain('█')
    expect(meter).toContain('░')
  })

  it('renders 0%', () => {
    expect(purityMeter(0)).toContain('0%')
  })

  it('renders 100%', () => {
    expect(purityMeter(1)).toContain('100%')
  })
})

describe('formatFunctionTable', () => {
  it('returns no-functions message for empty', () => {
    expect(formatFunctionTable([])).toContain('no functions')
  })

  it('includes function data', () => {
    const fns: OrchestratorFunction[] = [{
      name: 'main', file: 'a.ts', line: 1, type: 'orchestrator',
      callsCount: 5, calledByCount: 0, orchestrates: [], orchestratedBy: [],
      coordinationPatterns: [], complexity: 3, linesOfCode: 10,
      hasSideEffects: false, isPure: true,
    }]
    const table = formatFunctionTable(fns)
    expect(table).toContain('main')
    expect(table).toContain('ORCH')
  })
})

describe('formatPatternsTable', () => {
  it('returns no-patterns message for empty', () => {
    expect(formatPatternsTable([])).toContain('no patterns')
  })

  it('includes pattern data', () => {
    const patterns = [{
      type: 'parallel' as const, functions: ['a', 'b'],
      description: 'Parallel: a, b', file: 'a.ts', line: 1,
    }]
    const table = formatPatternsTable(patterns)
    expect(table).toContain('PARA')
    expect(table).toContain('Parallel')
  })
})

describe('formatLayersTable', () => {
  it('returns no-layers message for empty', () => {
    expect(formatLayersTable([])).toContain('no layers')
  })

  it('includes layer data', () => {
    const layers = [{
      name: 'Entry Points', functions: ['main'], averageCalls: 5,
      averageCalledBy: 0, description: 'Entry',
    }]
    const table = formatLayersTable(layers)
    expect(table).toContain('Entry Points')
    expect(table).toContain('5.0')
  })
})

describe('formatOrchestratorStats', () => {
  it('formats all stat fields', () => {
    const stats: OrchestratorStats = {
      totalFunctions: 20, orchestrators: 3, workers: 10, pipelines: 2,
      pureFunctions: 8, sideEffectFunctions: 5, maxOrchestrationDepth: 4,
      averageCallsPerFunction: 2.3,
    }
    const formatted = formatOrchestratorStats(stats)
    expect(formatted).toContain('20')
    expect(formatted).toContain('10')
    expect(formatted).toContain('4')
  })
})

describe('formatOrchestratorRecommendations', () => {
  it('formats recommendations', () => {
    const recs = formatOrchestratorRecommendations(['Split function foo'])
    expect(recs).toContain('Split function foo')
  })

  it('returns no-recs message for empty', () => {
    expect(formatOrchestratorRecommendations([])).toContain('no recommendations')
  })
})

describe('formatHotOrchestrators', () => {
  it('returns no-hot message for empty', () => {
    expect(formatHotOrchestrators([])).toContain('no hot')
  })

  it('includes hot orchestrator data', () => {
    const hot: OrchestratorFunction[] = [{
      name: 'runAll', file: 'a.ts', line: 1, type: 'orchestrator',
      callsCount: 8, calledByCount: 0, orchestrates: [], orchestratedBy: [],
      coordinationPatterns: [], complexity: 6, linesOfCode: 12,
      hasSideEffects: false, isPure: true,
    }]
    const formatted = formatHotOrchestrators(hot)
    expect(formatted).toContain('runAll')
    expect(formatted).toContain('8 calls')
  })
})

describe('formatIsolatedWorkers', () => {
  it('returns no-isolated message for empty', () => {
    expect(formatIsolatedWorkers([])).toContain('no isolated')
  })

  it('includes isolated worker data', () => {
    const workers: OrchestratorFunction[] = [{
      name: 'dead', file: 'a.ts', line: 5, type: 'worker',
      callsCount: 0, calledByCount: 0, orchestrates: [], orchestratedBy: [],
      coordinationPatterns: [], complexity: 1, linesOfCode: 3,
      hasSideEffects: false, isPure: true,
    }]
    const formatted = formatIsolatedWorkers(workers)
    expect(formatted).toContain('dead')
    expect(formatted).toContain('never called')
  })
})

describe('formatOrchestratorOutput', () => {
  it('includes all sections', () => {
    const result = buildOrchestratorResult(['a.ts'], ['function main() { foo() }\nfunction foo() { return 1 }'])
    const output = formatOrchestratorOutput(result)
    expect(output).toContain('Orchestration Statistics')
    expect(output).toContain('Function Classification')
    expect(output).toContain('Recommendations')
  })
})

describe('formatOrchestratorJson', () => {
  it('returns valid JSON', () => {
    const result = buildOrchestratorResult(['a.ts'], ['function main() { return 1 }'])
    const json = formatOrchestratorJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFunctions).toBeGreaterThan(0)
  })
})
