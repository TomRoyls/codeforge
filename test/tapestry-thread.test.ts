import { describe, expect, it } from 'vitest'

import {
  traceFeatureThreads,
  traceDataTypeThreads,
  traceErrorPathThreads,
  traceLoggingThreads,
  computeContinuity,
  computeVisibility,
  computeCompleteness,
  detectTangles,
  analyzeSpools,
  computeThreadCoverage,
  computeThreadIntegrity,
  classifyOverallWeave,
  generateRecommendations,
  buildTapestryThreadResult,
  type Thread,
  type ThreadPoint,
  type TapestryThreadStats,
} from '../src/commands/tapestry-thread-helpers.js'

import { formatTapestryThreadTable, formatTapestryThreadJson } from '../src/commands/tapestry-thread-format-helpers.js'

// ─── traceFeatureThreads ────────────────────────────────────────────────────

describe('traceFeatureThreads', () => {
  it('returns an array', () => {
    const result = traceFeatureThreads('const x = 1', 'a.ts')
    expect(Array.isArray(result)).toBe(true)
  })

  it('traces exported functions', () => {
    const result = traceFeatureThreads('export function process() { return 1 }', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('feature')
    expect(result[0].concern).toBe('process')
  })

  it('sets entry point for function', () => {
    const result = traceFeatureThreads('export function process() {}', 'a.ts')
    expect(result[0].startPoint.role).toBe('entry')
    expect(result[0].startPoint.symbol).toBe('process')
  })

  it('detects branches', () => {
    const code = 'export function check(x: number) {\n  if (x > 0) { return true }\n  return false\n}'
    const result = traceFeatureThreads(code, 'a.ts')
    expect(result[0].path.some(p => p.role === 'branch')).toBe(true)
  })

  it('detects exit points', () => {
    const code = 'export function calc() { return 42 }'
    const result = traceFeatureThreads(code, 'a.ts')
    expect(result[0].path.some(p => p.role === 'exit')).toBe(true)
  })

  it('marks complete when has exit', () => {
    const code = 'export function f() { return 1 }'
    const result = traceFeatureThreads(code, 'a.ts')
    expect(result[0].isComplete).toBe(true)
  })

  it('marks broken when no exit and multiple points', () => {
    const code = 'export function f() {\n  if (x) { g() }\n}'
    const result = traceFeatureThreads(code, 'a.ts')
    expect(result[0].isBroken).toBe(true)
  })

  it('returns empty for no exports', () => {
    const result = traceFeatureThreads('const x = 1', 'a.ts')
    expect(result).toEqual([])
  })

  it('each thread has required fields', () => {
    const result = traceFeatureThreads('export function f() { return 1 }', 'a.ts')
    for (const t of result) {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('concern')
      expect(t).toHaveProperty('type')
      expect(t).toHaveProperty('path')
      expect(t).toHaveProperty('continuity')
      expect(t).toHaveProperty('visibility')
      expect(t).toHaveProperty('completeness')
      expect(t).toHaveProperty('isBroken')
      expect(t).toHaveProperty('isComplete')
    }
  })
})

// ─── traceDataTypeThreads ───────────────────────────────────────────────────

describe('traceDataTypeThreads', () => {
  it('returns an array', () => {
    expect(Array.isArray(traceDataTypeThreads('const x = 1', 'a.ts'))).toBe(true)
  })

  it('traces interfaces', () => {
    const result = traceDataTypeThreads('interface Config { name: string }', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('data-type')
  })

  it('traces type aliases', () => {
    const result = traceDataTypeThreads('type Result = string | number', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].concern).toBe('Result')
  })

  it('marks exported types as complete', () => {
    const result = traceDataTypeThreads('export interface Config { name: string }', 'a.ts')
    expect(result[0].isComplete).toBe(true)
  })

  it('detects usage points', () => {
    const code = 'interface Config { name: string }\nconst cfg: Config = { name: "test" }'
    const result = traceDataTypeThreads(code, 'a.ts')
    expect(result[0].path.some(p => p.role === 'pass-through')).toBe(true)
  })

  it('returns empty for no types', () => {
    expect(traceDataTypeThreads('const x = 1', 'a.ts')).toEqual([])
  })
})

// ─── traceErrorPathThreads ──────────────────────────────────────────────────

describe('traceErrorPathThreads', () => {
  it('returns an array', () => {
    expect(Array.isArray(traceErrorPathThreads('const x = 1', 'a.ts'))).toBe(true)
  })

  it('traces try-catch blocks', () => {
    const code = 'try {\n  doSomething()\n} catch(e) {\n  log(e)\n}'
    const result = traceErrorPathThreads(code, 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('error-path')
  })

  it('detects catch as branch', () => {
    const code = 'try {\n  x()\n} catch(e) {\n  log(e)\n}'
    const result = traceErrorPathThreads(code, 'a.ts')
    expect(result[0].path.some(p => p.role === 'branch')).toBe(true)
  })

  it('detects throw as exit', () => {
    const code = 'try {\n  throw new Error("fail")\n} catch(e) {\n  log(e)\n}'
    const result = traceErrorPathThreads(code, 'a.ts')
    expect(result[0].path.some(p => p.role === 'exit')).toBe(true)
  })

  it('marks as complete with catch', () => {
    const code = 'try {\n  x()\n} catch(e) {\n  handle(e)\n}'
    const result = traceErrorPathThreads(code, 'a.ts')
    expect(result[0].isComplete).toBe(true)
  })

  it('returns empty for no try blocks', () => {
    expect(traceErrorPathThreads('const x = 1', 'a.ts')).toEqual([])
  })
})

// ─── traceLoggingThreads ────────────────────────────────────────────────────

describe('traceLoggingThreads', () => {
  it('returns an array', () => {
    expect(Array.isArray(traceLoggingThreads('const x = 1', 'a.ts'))).toBe(true)
  })

  it('traces console.log calls', () => {
    const result = traceLoggingThreads('console.log("msg")', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].type).toBe('logging')
  })

  it('traces console.warn calls', () => {
    const result = traceLoggingThreads('console.warn("warning")', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
  })

  it('traces console.error calls', () => {
    const result = traceLoggingThreads('console.error("err")', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
  })

  it('traces logger calls', () => {
    const result = traceLoggingThreads('logger.info("msg")', 'a.ts')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty for no logging', () => {
    expect(traceLoggingThreads('const x = 1', 'a.ts')).toEqual([])
  })

  it('maps multiple log calls to path', () => {
    const code = 'console.log("a")\nconst x = 1\nconsole.log("b")'
    const result = traceLoggingThreads(code, 'a.ts')
    expect(result[0].path.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── computeContinuity ──────────────────────────────────────────────────────

describe('computeContinuity', () => {
  it('returns 0 for empty path', () => {
    expect(computeContinuity([])).toBe(0)
  })

  it('returns 50 for single point', () => {
    expect(computeContinuity([{ file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' }])).toBe(50)
  })

  it('returns 100 for entry+exit', () => {
    const path: ThreadPoint[] = [
      { file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' },
      { file: 'a.ts', line: 5, symbol: 'f', role: 'exit', description: '' },
    ]
    expect(computeContinuity(path)).toBe(100)
  })

  it('returns 70 for entry only', () => {
    const path: ThreadPoint[] = [
      { file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' },
      { file: 'a.ts', line: 3, symbol: 'f', role: 'pass-through', description: '' },
    ]
    expect(computeContinuity(path)).toBe(70)
  })
})

// ─── computeVisibility ──────────────────────────────────────────────────────

describe('computeVisibility', () => {
  it('returns a number between 0 and 100', () => {
    const result = computeVisibility('const x = 1', [])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher for documented code', () => {
    const doc = computeVisibility('/** docs */\nexport function f() {}', [{ file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: 'Entry point' }])
    const bare = computeVisibility('const x = 1', [{ file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' }])
    expect(doc).toBeGreaterThan(bare)
  })
})

// ─── computeCompleteness ────────────────────────────────────────────────────

describe('computeCompleteness', () => {
  it('returns 0 for empty path', () => {
    expect(computeCompleteness([])).toBe(0)
  })

  it('returns 30 for single point', () => {
    expect(computeCompleteness([{ file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' }])).toBe(30)
  })

  it('returns 100 for entry+exit', () => {
    const path: ThreadPoint[] = [
      { file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' },
      { file: 'a.ts', line: 5, symbol: 'f', role: 'exit', description: '' },
    ]
    expect(computeCompleteness(path)).toBe(100)
  })

  it('returns 40 for entry+dead-end', () => {
    const path: ThreadPoint[] = [
      { file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' },
      { file: 'a.ts', line: 3, symbol: 'f', role: 'dead-end', description: '' },
    ]
    expect(computeCompleteness(path)).toBe(40)
  })

  it('returns 80 for entry+exit+dead-end', () => {
    const path: ThreadPoint[] = [
      { file: 'a.ts', line: 1, symbol: 'f', role: 'entry', description: '' },
      { file: 'a.ts', line: 3, symbol: 'f', role: 'dead-end', description: '' },
      { file: 'a.ts', line: 5, symbol: 'f', role: 'exit', description: '' },
    ]
    expect(computeCompleteness(path)).toBe(80)
  })
})

// ─── detectTangles ──────────────────────────────────────────────────────────

describe('detectTangles', () => {
  it('returns empty for no threads', () => {
    expect(detectTangles([])).toEqual([])
  })

  it('returns empty for single thread', () => {
    const threads = [makeThread('t1', 'a.ts')]
    expect(detectTangles(threads)).toEqual([])
  })

  it('detects crossing for different types in same file', () => {
    const threads = [
      makeThread('t1', 'a.ts', 'feature'),
      makeThread('t2', 'a.ts', 'error-path'),
    ]
    const tangles = detectTangles(threads)
    expect(tangles.some(t => t.type === 'crossing')).toBe(true)
  })

  it('detects knot for 4+ threads in same file', () => {
    const threads = [
      makeThread('t1', 'a.ts', 'feature'),
      makeThread('t2', 'a.ts', 'data-type'),
      makeThread('t3', 'a.ts', 'error-path'),
      makeThread('t4', 'a.ts', 'logging'),
    ]
    const tangles = detectTangles(threads)
    expect(tangles.some(t => t.type === 'knot' && t.severity === 'severe')).toBe(true)
  })

  it('detects fray for broken threads', () => {
    const t1 = makeThread('t1', 'a.ts')
    t1.isBroken = true
    const t2 = makeThread('t2', 'a.ts')
    t2.isBroken = true
    const tangles = detectTangles([t1, t2])
    expect(tangles.some(t => t.type === 'fray')).toBe(true)
  })

  it('each tangle has required fields', () => {
    const threads = [
      makeThread('t1', 'a.ts', 'feature'),
      makeThread('t2', 'a.ts', 'error-path'),
    ]
    for (const t of detectTangles(threads)) {
      expect(t).toHaveProperty('location')
      expect(t).toHaveProperty('threads')
      expect(t).toHaveProperty('type')
      expect(t).toHaveProperty('severity')
      expect(t).toHaveProperty('description')
    }
  })
})

// ─── analyzeSpools ──────────────────────────────────────────────────────────

describe('analyzeSpools', () => {
  it('returns spools for all files', () => {
    const threads = [makeThread('t1', 'a.ts')]
    const spools = analyzeSpools(threads, ['a.ts', 'b.ts'])
    expect(spools).toHaveLength(2)
  })

  it('detects spool hubs', () => {
    const threads = Array(6).fill(0).map((_, i) => makeThread(`t${i}`, 'a.ts'))
    const spools = analyzeSpools(threads, ['a.ts'])
    expect(spools[0].isSpoolHub).toBe(true)
  })

  it('detects dead ends', () => {
    const thread = makeThread('t1', 'a.ts')
    thread.path[0].role = 'entry'
    const spools = analyzeSpools([thread], ['b.ts'])
    expect(spools[0].isDeadEnd).toBe(false)
  })

  it('computes thread density', () => {
    const threads = [makeThread('t1', 'a.ts')]
    const spools = analyzeSpools(threads, ['a.ts'])
    expect(spools[0].threadDensity).toBeGreaterThanOrEqual(0)
    expect(spools[0].threadDensity).toBeLessThanOrEqual(100)
  })
})

// ─── computeThreadCoverage ──────────────────────────────────────────────────

describe('computeThreadCoverage', () => {
  it('returns 0 for no files', () => {
    expect(computeThreadCoverage([], [])).toBe(0)
  })

  it('returns 100 when all files covered', () => {
    const threads = [makeThread('t1', 'a.ts'), makeThread('t2', 'b.ts')]
    expect(computeThreadCoverage(threads, ['a.ts', 'b.ts'])).toBe(100)
  })

  it('returns 50 when half files covered', () => {
    const threads = [makeThread('t1', 'a.ts')]
    expect(computeThreadCoverage(threads, ['a.ts', 'b.ts'])).toBe(50)
  })
})

// ─── computeThreadIntegrity ─────────────────────────────────────────────────

describe('computeThreadIntegrity', () => {
  it('returns 50 for no threads', () => {
    expect(computeThreadIntegrity([])).toBe(50)
  })

  it('penalizes broken threads', () => {
    const good = makeThread('t1', 'a.ts')
    good.continuity = 100
    good.completeness = 100
    const broken = makeThread('t2', 'a.ts')
    broken.continuity = 100
    broken.completeness = 100
    broken.isBroken = true
    expect(computeThreadIntegrity([good])).toBeGreaterThan(computeThreadIntegrity([broken]))
  })
})

// ─── classifyOverallWeave ───────────────────────────────────────────────────

describe('classifyOverallWeave', () => {
  it('returns seamless for perfect score', () => {
    expect(classifyOverallWeave(85, 0, 0)).toBe('seamless')
  })

  it('returns woven for good score', () => {
    expect(classifyOverallWeave(65, 1, 2)).toBe('woven')
  })

  it('returns tangled for medium score', () => {
    expect(classifyOverallWeave(50, 3, 5)).toBe('tangled')
  })

  it('returns frayed for low score', () => {
    expect(classifyOverallWeave(35, 5, 10)).toBe('frayed')
  })

  it('returns unraveled for very low score', () => {
    expect(classifyOverallWeave(15, 10, 20)).toBe('unraveled')
  })

  it('seamless requires no severe tangles', () => {
    expect(classifyOverallWeave(90, 1, 0)).not.toBe('seamless')
  })

  it('seamless requires no broken threads', () => {
    expect(classifyOverallWeave(90, 0, 1)).not.toBe('seamless')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty for healthy codebase', () => {
    const threads = [makeThread('t1', 'a.ts')]
    threads[0].isComplete = true
    threads[0].isBroken = false
    threads[0].visibility = 80
    const stats = makeThreadStats({ threadIntegrity: 80, threadCoverage: 80, avgVisibility: 80 })
    const recs = generateRecommendations(threads, [], [], stats)
    expect(recs.length).toBe(0)
  })

  it('recommends fixing broken threads', () => {
    const broken = makeThread('t1', 'a.ts')
    broken.isBroken = true
    const stats = makeThreadStats({})
    const recs = generateRecommendations([broken], [], [], stats)
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })

  it('recommends separating severe tangles', () => {
    const tangles = [{ location: 'a.ts', threads: ['t1', 't2'], type: 'knot' as const, severity: 'severe' as const, description: 'knotted' }]
    const stats = makeThreadStats({})
    const recs = generateRecommendations([], tangles, [], stats)
    expect(recs.some(r => r.includes('tangled'))).toBe(true)
  })

  it('recommends connecting dead ends', () => {
    const stats = makeThreadStats({ deadEnds: 2 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('dead-end'))).toBe(true)
  })

  it('recommends improving visibility', () => {
    const stats = makeThreadStats({ avgVisibility: 30 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('visibility'))).toBe(true)
  })

  it('recommends improving coverage', () => {
    const stats = makeThreadStats({ threadCoverage: 20 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('coverage'))).toBe(true)
  })

  it('recommends review for low integrity', () => {
    const stats = makeThreadStats({ threadIntegrity: 30 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('integrity'))).toBe(true)
  })

  it('recommends review for high broken rate', () => {
    const threads = Array(5).fill(0).map((_, i) => {
      const t = makeThread(`t${i}`, 'a.ts')
      t.isBroken = i < 2
      return t
    })
    const stats = makeThreadStats({ brokenThreads: 2, totalThreads: 5 })
    const recs = generateRecommendations(threads, [], [], stats)
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })
})

// ─── buildTapestryThreadResult ──────────────────────────────────────────────

describe('buildTapestryThreadResult', () => {
  it('returns result with correct structure', () => {
    const result = buildTapestryThreadResult([], [], {})
    expect(result).toHaveProperty('threads')
    expect(result).toHaveProperty('tangles')
    expect(result).toHaveProperty('spools')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('traces threads from code', () => {
    const result = buildTapestryThreadResult(
      ['a.ts'],
      ['export function f(): number { return 1 }\ninterface Config { name: string }\ntry { f() } catch(e) { console.log(e) }'],
      {},
    )
    expect(result.threads.length).toBeGreaterThan(0)
  })

  it('populates stats correctly', () => {
    const result = buildTapestryThreadResult(
      ['a.ts'],
      ['export function f() { return 1 }'],
      {},
    )
    expect(result.stats.totalThreads).toBeGreaterThan(0)
    expect(result.stats.featureThreads).toBeGreaterThan(0)
  })

  it('computes thread coverage', () => {
    const result = buildTapestryThreadResult(
      ['a.ts', 'b.ts'],
      ['export function f() { return 1 }', 'const x = 1'],
      {},
    )
    expect(result.stats.threadCoverage).toBeGreaterThanOrEqual(0)
    expect(result.stats.threadCoverage).toBeLessThanOrEqual(100)
  })

  it('classifies overall weave', () => {
    const result = buildTapestryThreadResult(['a.ts'], ['export function f() { return 1 }'], {})
    expect(['seamless', 'woven', 'tangled', 'frayed', 'unraveled']).toContain(result.stats.overallWeave)
  })

  it('handles empty input', () => {
    const result = buildTapestryThreadResult([], [], {})
    expect(result.threads).toHaveLength(0)
    expect(result.stats.totalThreads).toBe(0)
  })

  it('detects tangles with many threads', () => {
    const code = 'export function f() { return 1 }\ninterface I {}\ntry { f() } catch(e) {}\nconsole.log("hi")'
    const result = buildTapestryThreadResult(['a.ts'], [code], {})
    expect(result.threads.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── formatTapestryThreadTable ──────────────────────────────────────────────

describe('formatTapestryThreadTable', () => {
  it('returns a string', () => {
    const result = buildTapestryThreadResult([], [], {})
    const formatted = formatTapestryThreadTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildTapestryThreadResult(['a.ts'], ['export function f() { return 1 }'], {})
    const formatted = formatTapestryThreadTable(result, false)
    expect(formatted).toContain('Threads')
    expect(formatted).toContain('Statistics')
  })

  it('shows no threads message when empty', () => {
    const result = buildTapestryThreadResult([], [], {})
    const formatted = formatTapestryThreadTable(result, false)
    expect(formatted).toContain('No threads detected')
  })

  it('shows recommendations when present', () => {
    const result = buildTapestryThreadResult([], [], {})
    const stats = makeThreadStats({ threadIntegrity: 20, threadCoverage: 20, avgVisibility: 20 })
    result.stats = stats
    result.recommendations = generateRecommendations([], [], [], stats)
    const formatted = formatTapestryThreadTable(result, false)
    expect(formatted).toContain('Recommendations')
  })

  it('respects verbose flag', () => {
    const code = 'export function f() { if (x) { return 1 } return 0 }'
    const result = buildTapestryThreadResult(['a.ts'], [code], {})
    const nonVerbose = formatTapestryThreadTable(result, false)
    const verbose = formatTapestryThreadTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(nonVerbose.length)
  })
})

// ─── formatTapestryThreadJson ───────────────────────────────────────────────

describe('formatTapestryThreadJson', () => {
  it('returns valid JSON', () => {
    const result = buildTapestryThreadResult([], [], {})
    const json = formatTapestryThreadJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains threads in JSON', () => {
    const result = buildTapestryThreadResult([], [], {})
    const parsed = JSON.parse(formatTapestryThreadJson(result))
    expect(parsed).toHaveProperty('threads')
  })

  it('contains stats in JSON', () => {
    const result = buildTapestryThreadResult(['a.ts'], ['export function f() { return 1 }'], {})
    const parsed = JSON.parse(formatTapestryThreadJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalThreads).toBeGreaterThan(0)
  })
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeThread(id: string, file: string, type: 'feature' | 'data-type' | 'error-path' | 'logging' = 'feature'): Thread {
  return {
    id,
    concern: id,
    type,
    startPoint: { file, line: 1, symbol: 'f', role: 'entry', description: 'entry' },
    endPoint: { file, line: 5, symbol: 'f', role: 'exit', description: 'exit' },
    path: [
      { file, line: 1, symbol: 'f', role: 'entry', description: 'entry' },
      { file, line: 5, symbol: 'f', role: 'exit', description: 'exit' },
    ],
    continuity: 80,
    visibility: 70,
    completeness: 80,
    length: 1,
    tangles: [],
    isBroken: false,
    isComplete: true,
    color: 'blue',
  }
}

function makeThreadStats(overrides: Partial<TapestryThreadStats> = {}): TapestryThreadStats {
  return {
    totalThreads: 1,
    featureThreads: 1,
    dataTypeThreads: 0,
    errorPathThreads: 0,
    loggingThreads: 0,
    completeThreads: 1,
    brokenThreads: 0,
    avgContinuity: 80,
    avgVisibility: 70,
    avgCompleteness: 80,
    avgLength: 1,
    totalTangles: 0,
    severeTangles: 0,
    spoolHubs: 0,
    deadEnds: 0,
    threadCoverage: 80,
    threadIntegrity: 80,
    overallWeave: 'seamless',
    ...overrides,
  }
}
