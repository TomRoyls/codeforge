import { describe, expect, it } from 'vitest'
import {
  buildThreadsResult,
  checkErrorHandling,
  computeAsyncStats,
  detectCallbackHell,
  detectFloatingPromises,
  detectMissingAwait,
  detectNestedPromises,
  detectSequentialParallelizable,
  detectSyncInAsync,
  detectUnhandledPromises,
  findAsyncFunctions,
  findCallbacks,
  findEventHandlers,
  findGenerators,
  findPromises,
  findTimers,
  generateRecommendations,
  type AsyncAntiPattern,
  type AsyncPattern,
  type AsyncStats,
} from '../src/commands/threads-helpers.js'
import {
  complexityBadge,
  errorHandlingMeter,
  formatAntiPatternRow,
  formatAntiPatternTable,
  formatPatternRow,
  formatPatternTable,
  formatRecommendations,
  formatStats,
  formatSuggestions,
  formatThreadsJson,
  formatThreadsReport,
  severityBadge,
  typeIcon,
} from '../src/commands/threads-format-helpers.js'

// ─── findAsyncFunctions ───────────────────────────────────────────────────────

describe('findAsyncFunctions', () => {
  it('finds async function declarations', () => {
    const patterns = findAsyncFunctions('async function fetch() {}', 'a.ts')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns[0].type).toBe('async-function')
  })

  it('finds async arrow functions', () => {
    const patterns = findAsyncFunctions('const load = async () => {}', 'a.ts')
    expect(patterns.some((p) => p.type === 'async-function')).toBe(true)
  })

  it('finds functions returning Promise', () => {
    const patterns = findAsyncFunctions('function getData(): Promise<string> {}', 'a.ts')
    expect(patterns.some((p) => p.type === 'async-function')).toBe(true)
  })

  it('skips non-async functions', () => {
    const patterns = findAsyncFunctions('function sync() {}', 'a.ts')
    expect(patterns.every((p) => p.type !== 'async-function')).toBe(true)
  })

  it('skips comment lines', () => {
    const patterns = findAsyncFunctions('// async function ignored() {}', 'a.ts')
    expect(patterns.length).toBe(0)
  })

  it('detects error handling', () => {
    const code = 'async function foo() { try { await bar() } catch (e) {} }'
    const patterns = findAsyncFunctions(code, 'a.ts')
    expect(patterns.some((p) => p.hasErrorHandling)).toBe(true)
  })

  it('detects missing error handling', () => {
    const code = 'async function foo() { await bar() }'
    const patterns = findAsyncFunctions(code, 'a.ts')
    expect(patterns.some((p) => !p.hasErrorHandling)).toBe(true)
  })

  it('detects timeouts', () => {
    const code = 'async function foo() { setTimeout(() => {}, 100) }'
    const patterns = findAsyncFunctions(code, 'a.ts')
    expect(patterns.some((p) => p.hasTimeout)).toBe(true)
  })
})

// ─── findPromises ─────────────────────────────────────────────────────────────

describe('findPromises', () => {
  it('finds new Promise', () => {
    const patterns = findPromises('const p = new Promise((resolve) => resolve(1))', 'a.ts')
    expect(patterns.length).toBe(1)
    expect(patterns[0].type).toBe('promise')
  })

  it('finds Promise.all', () => {
    const patterns = findPromises('await Promise.all([a(), b()])', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('finds Promise.resolve', () => {
    const patterns = findPromises('return Promise.resolve(42)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('skips comments', () => {
    const patterns = findPromises('// new Promise', 'a.ts')
    expect(patterns.length).toBe(0)
  })

  it('detects .catch as error handling', () => {
    const patterns = findPromises('new Promise((r) => r(1)).catch(() => {})', 'a.ts')
    expect(patterns[0].hasErrorHandling).toBe(true)
  })
})

// ─── findCallbacks ────────────────────────────────────────────────────────────

describe('findCallbacks', () => {
  it('finds map callbacks', () => {
    const patterns = findCallbacks('arr.map((x) => x * 2)', 'a.ts')
    expect(patterns.length).toBe(1)
    expect(patterns[0].type).toBe('callback')
  })

  it('finds forEach callbacks', () => {
    const patterns = findCallbacks('arr.forEach(function(item) { process(item) })', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('finds filter callbacks', () => {
    const patterns = findCallbacks('arr.filter((x) => x > 0)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('skips comments', () => {
    const patterns = findCallbacks('// arr.map((x) => x)', 'a.ts')
    expect(patterns.length).toBe(0)
  })
})

// ─── findEventHandlers ────────────────────────────────────────────────────────

describe('findEventHandlers', () => {
  it('finds .on() calls', () => {
    const patterns = findEventHandlers('emitter.on("data", handler)', 'a.ts')
    expect(patterns.length).toBe(1)
    expect(patterns[0].type).toBe('event-handler')
  })

  it('finds addEventListener', () => {
    const patterns = findEventHandlers('button.addEventListener("click", onClick)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('finds .once() calls', () => {
    const patterns = findEventHandlers('emitter.once("connect", onConnect)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('skips comments', () => {
    const patterns = findEventHandlers('// emitter.on("x", fn)', 'a.ts')
    expect(patterns.length).toBe(0)
  })
})

// ─── findTimers ───────────────────────────────────────────────────────────────

describe('findTimers', () => {
  it('finds setTimeout', () => {
    const patterns = findTimers('setTimeout(() => {}, 1000)', 'a.ts')
    expect(patterns.length).toBe(1)
    expect(patterns[0].type).toBe('timer')
    expect(patterns[0].hasTimeout).toBe(true)
  })

  it('finds setInterval', () => {
    const patterns = findTimers('setInterval(tick, 100)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('finds process.nextTick', () => {
    const patterns = findTimers('process.nextTick(callback)', 'a.ts')
    expect(patterns.length).toBe(1)
  })

  it('skips comments', () => {
    const patterns = findTimers('// setTimeout(fn, 100)', 'a.ts')
    expect(patterns.length).toBe(0)
  })
})

// ─── findGenerators ───────────────────────────────────────────────────────────

describe('findGenerators', () => {
  it('finds generator functions', () => {
    const patterns = findGenerators('function* gen() { yield 1 }', 'a.ts')
    expect(patterns.length).toBe(1)
    expect(patterns[0].type).toBe('generator')
  })

  it('finds yield expressions', () => {
    const patterns = findGenerators('yield getValue()', 'a.ts')
    expect(patterns.some((p) => p.type === 'generator')).toBe(true)
  })

  it('skips comments', () => {
    const patterns = findGenerators('// function* gen() {}', 'a.ts')
    expect(patterns.length).toBe(0)
  })
})

// ─── detectUnhandledPromises ──────────────────────────────────────────────────

describe('detectUnhandledPromises', () => {
  it('detects unhandled fetch', () => {
    const anti = detectUnhandledPromises('fetch("/api")', 'a.ts')
    expect(anti.length).toBe(1)
    expect(anti[0].type).toBe('unhandled-promise')
    expect(anti[0].severity).toBe('error')
  })

  it('allows awaited fetch', () => {
    const anti = detectUnhandledPromises('await fetch("/api")', 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('allows fetch with .then', () => {
    const anti = detectUnhandledPromises('fetch("/api").then(r => r.json())', 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('allows assigned promises', () => {
    const anti = detectUnhandledPromises('const p = fetch("/api")', 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('skips comments', () => {
    const anti = detectUnhandledPromises('// fetch("/api")', 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('provides suggestion', () => {
    const anti = detectUnhandledPromises('fetch("/api")', 'a.ts')
    expect(anti[0].suggestion).toBeTruthy()
  })
})

// ─── detectCallbackHell ───────────────────────────────────────────────────────

describe('detectCallbackHell', () => {
  it('detects deep nesting', () => {
    const code = '    {        {            {                { function() {} }            }        }    }'
    const anti = detectCallbackHell(code, 'a.ts')
    expect(anti.some((a) => a.type === 'callback-hell')).toBe(true)
  })

  it('allows shallow nesting', () => {
    const code = '{ function() {} }'
    const anti = detectCallbackHell(code, 'a.ts')
    expect(anti.length).toBe(0)
  })
})

// ─── detectNestedPromises ─────────────────────────────────────────────────────

describe('detectNestedPromises', () => {
  it('detects long .then() chains', () => {
    const code = 'p.then(x).then(y).then(z).then(w)'
    const anti = detectNestedPromises(code, 'a.ts')
    expect(anti.length).toBe(1)
    expect(anti[0].type).toBe('nested-promises')
  })

  it('allows short .then() chains', () => {
    const code = 'p.then(x).then(y)'
    const anti = detectNestedPromises(code, 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('suggests async/await', () => {
    const code = 'p.then(x).then(y).then(z).then(w)'
    const anti = detectNestedPromises(code, 'a.ts')
    expect(anti[0].suggestion).toContain('async/await')
  })
})

// ─── detectSequentialParallelizable ───────────────────────────────────────────

describe('detectSequentialParallelizable', () => {
  it('detects sequential awaits', () => {
    const code = 'async function foo() {\nawait a()\nawait b()\nawait c()\n}'
    const anti = detectSequentialParallelizable(code, 'a.ts')
    expect(anti.length).toBeGreaterThan(0)
    expect(anti[0].type).toBe('sequential-parallelizable')
  })

  it('allows single await', () => {
    const code = 'async function foo() {\nawait a()\n}'
    const anti = detectSequentialParallelizable(code, 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('suggests Promise.all', () => {
    const code = 'async function foo() {\nawait a()\nawait b()\nawait c()\n}'
    const anti = detectSequentialParallelizable(code, 'a.ts')
    expect(anti[0].suggestion).toContain('Promise.all')
  })
})

// ─── detectFloatingPromises ───────────────────────────────────────────────────

describe('detectFloatingPromises', () => {
  it('detects floating fetch', () => {
    const anti = detectFloatingPromises('const p = fetch("/api")', 'a.ts')
    expect(anti.length).toBe(1)
    expect(anti[0].type).toBe('floating-promise')
  })

  it('allows awaited promise', () => {
    const anti = detectFloatingPromises('const p = await fetch("/api")', 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('allows caught promise', () => {
    const anti = detectFloatingPromises('const p = fetch("/api").catch(handle)', 'a.ts')
    expect(anti.length).toBe(0)
  })
})

// ─── detectSyncInAsync ────────────────────────────────────────────────────────

describe('detectSyncInAsync', () => {
  it('detects readFileSync in async function', () => {
    const code = 'async function foo() {\nfs.readFileSync("x")\n}'
    const anti = detectSyncInAsync(code, 'a.ts')
    expect(anti.length).toBe(1)
    expect(anti[0].type).toBe('sync-in-async')
  })

  it('detects writeFileSync in async function', () => {
    const code = 'async function save() {\nfs.writeFileSync("out", data)\n}'
    const anti = detectSyncInAsync(code, 'a.ts')
    expect(anti.length).toBe(1)
  })

  it('allows sync in non-async', () => {
    const code = 'function foo() {\nfs.readFileSync("x")\n}'
    const anti = detectSyncInAsync(code, 'a.ts')
    expect(anti.length).toBe(0)
  })

  it('suggests async equivalent', () => {
    const code = 'async function foo() {\nfs.readFileSync("x")\n}'
    const anti = detectSyncInAsync(code, 'a.ts')
    expect(anti[0].suggestion).toContain('async')
  })
})

// ─── checkErrorHandling ───────────────────────────────────────────────────────

describe('checkErrorHandling', () => {
  it('returns true for handled pattern', () => {
    const pattern: AsyncPattern = {
      type: 'async-function', file: 'a.ts', line: 1, code: '',
      complexity: 'simple', hasErrorHandling: true, hasTimeout: false, nestingLevel: 0,
    }
    expect(checkErrorHandling(pattern)).toBe(true)
  })

  it('returns false for unhandled pattern', () => {
    const pattern: AsyncPattern = {
      type: 'async-function', file: 'a.ts', line: 1, code: '',
      complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 0,
    }
    expect(checkErrorHandling(pattern)).toBe(false)
  })
})

// ─── computeAsyncStats ────────────────────────────────────────────────────────

describe('computeAsyncStats', () => {
  it('computes empty stats', () => {
    const stats = computeAsyncStats([], [])
    expect(stats.totalAsyncFunctions).toBe(0)
    expect(stats.errorHandlingRate).toBe(100)
    expect(stats.averageNesting).toBe(0)
  })

  it('counts pattern types', () => {
    const patterns: AsyncPattern[] = [
      { type: 'async-function', file: 'a.ts', line: 1, code: '', complexity: 'simple', hasErrorHandling: true, hasTimeout: false, nestingLevel: 2 },
      { type: 'promise', file: 'a.ts', line: 2, code: '', complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 0 },
      { type: 'timer', file: 'a.ts', line: 3, code: '', complexity: 'simple', hasErrorHandling: false, hasTimeout: true, nestingLevel: 0 },
    ]
    const stats = computeAsyncStats(patterns, [])
    expect(stats.totalAsyncFunctions).toBe(1)
    expect(stats.totalPromises).toBe(1)
    expect(stats.totalTimers).toBe(1)
  })

  it('computes error handling rate', () => {
    const patterns: AsyncPattern[] = [
      { type: 'async-function', file: 'a.ts', line: 1, code: '', complexity: 'simple', hasErrorHandling: true, hasTimeout: false, nestingLevel: 0 },
      { type: 'async-function', file: 'a.ts', line: 2, code: '', complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 0 },
    ]
    const stats = computeAsyncStats(patterns, [])
    expect(stats.errorHandlingRate).toBe(50)
  })

  it('computes average nesting', () => {
    const patterns: AsyncPattern[] = [
      { type: 'async-function', file: 'a.ts', line: 1, code: '', complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 3 },
      { type: 'async-function', file: 'a.ts', line: 2, code: '', complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 1 },
    ]
    const stats = computeAsyncStats(patterns, [])
    expect(stats.averageNesting).toBe(2)
  })

  it('counts anti-patterns', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'unhandled-promise', file: 'a.ts', line: 1, code: '', severity: 'error', description: '', suggestion: '' },
    ]
    const stats = computeAsyncStats([], anti)
    expect(stats.antiPatternCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: AsyncStats = {
    totalAsyncFunctions: 5, totalPromises: 3, totalCallbacks: 2,
    totalEventHandlers: 1, totalTimers: 1, totalGenerators: 0,
    antiPatternCount: 0, errorHandlingRate: 80, averageNesting: 1.5,
  }

  it('recommends healthy when good', () => {
    const recs = generateRecommendations([], baseStats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('warns about low error handling', () => {
    const recs = generateRecommendations([], { ...baseStats, errorHandlingRate: 30 })
    expect(recs.some((r) => r.includes('error handling'))).toBe(true)
  })

  it('warns about anti-patterns', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'unhandled-promise', file: 'a.ts', line: 1, code: '', severity: 'error', description: '', suggestion: '' },
    ]
    const recs = generateRecommendations(anti, { ...baseStats, antiPatternCount: 1 })
    expect(recs.some((r) => r.includes('anti-pattern'))).toBe(true)
  })

  it('warns about callback hell', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'callback-hell', file: 'a.ts', line: 1, code: '', severity: 'warning', description: '', suggestion: '' },
    ]
    const recs = generateRecommendations(anti, baseStats)
    expect(recs.some((r) => r.includes('callback hell'))).toBe(true)
  })

  it('suggests parallelization', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'sequential-parallelizable', file: 'a.ts', line: 1, code: '', severity: 'warning', description: '', suggestion: '' },
    ]
    const recs = generateRecommendations(anti, baseStats)
    expect(recs.some((r) => r.includes('Promise.all'))).toBe(true)
  })
})

// ─── buildThreadsResult ───────────────────────────────────────────────────────

describe('buildThreadsResult', () => {
  it('returns empty for no files', () => {
    const result = buildThreadsResult([], [])
    expect(result.patterns).toEqual([])
    expect(result.antiPatterns).toEqual([])
  })

  it('detects patterns from code', () => {
    const result = buildThreadsResult(
      ['a.ts'],
      ['async function fetch() { await load() }'],
    )
    expect(result.patterns.length).toBeGreaterThan(0)
    expect(result.stats.totalAsyncFunctions).toBeGreaterThan(0)
  })

  it('detects anti-patterns', () => {
    const result = buildThreadsResult(
      ['a.ts'],
      ['fetch("/api")'],
    )
    expect(result.antiPatterns.length).toBeGreaterThan(0)
  })

  it('computes complexity distribution', () => {
    const result = buildThreadsResult(
      ['a.ts'],
      ['async function foo() { await bar() }'],
    )
    expect(result.complexityDistribution).toBeDefined()
    expect(result.complexityDistribution.simple).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildThreadsResult(['a.ts'], ['async function foo() {}'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('typeIcon', () => {
  it('returns icon for async-function', () => {
    expect(typeIcon('async-function')).toBeTruthy()
  })
  it('returns icon for promise', () => {
    expect(typeIcon('promise')).toBeTruthy()
  })
  it('returns fallback for unknown', () => {
    expect(typeIcon('unknown')).toBeTruthy()
  })
})

describe('complexityBadge', () => {
  it('returns simple badge', () => {
    expect(complexityBadge('simple')).toContain('simple')
  })
  it('returns complex badge', () => {
    expect(complexityBadge('complex')).toContain('complex')
  })
})

describe('severityBadge', () => {
  it('returns error badge', () => {
    expect(severityBadge('error')).toContain('ERROR')
  })
  it('returns warning badge', () => {
    expect(severityBadge('warning')).toContain('WARN')
  })
})

describe('errorHandlingMeter', () => {
  it('renders meter with percentage', () => {
    expect(errorHandlingMeter(75)).toContain('75%')
  })
  it('renders 0%', () => {
    expect(errorHandlingMeter(0)).toContain('0%')
  })
  it('renders 100%', () => {
    expect(errorHandlingMeter(100)).toContain('100%')
  })
})

describe('formatPatternRow', () => {
  it('formats pattern as row', () => {
    const p: AsyncPattern = {
      type: 'async-function', file: 'a.ts', line: 1, code: 'async function foo() {}',
      complexity: 'simple', hasErrorHandling: true, hasTimeout: false, nestingLevel: 1,
    }
    const row = formatPatternRow(p)
    expect(row).toContain('a.ts')
    expect(row).toContain('1')
  })
})

describe('formatPatternTable', () => {
  it('formats table with header', () => {
    const patterns: AsyncPattern[] = [
      { type: 'promise', file: 'a.ts', line: 1, code: 'new Promise()', complexity: 'simple', hasErrorHandling: false, hasTimeout: false, nestingLevel: 0 },
    ]
    const table = formatPatternTable(patterns)
    expect(table).toContain('Type')
    expect(table).toContain('promise')
  })
})

describe('formatAntiPatternTable', () => {
  it('shows no anti-patterns message', () => {
    const table = formatAntiPatternTable([])
    expect(table).toContain('No anti-patterns')
  })

  it('formats anti-pattern table', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'unhandled-promise', file: 'a.ts', line: 1, code: 'fetch()', severity: 'error', description: 'Unhandled promise', suggestion: 'Add .catch()' },
    ]
    const table = formatAntiPatternTable(anti)
    expect(table).toContain('unhandled-promise')
  })
})

describe('formatSuggestions', () => {
  it('returns empty for no anti-patterns', () => {
    expect(formatSuggestions([])).toBe('')
  })

  it('deduplicates suggestions', () => {
    const anti: AsyncAntiPattern[] = [
      { type: 'unhandled-promise', file: 'a.ts', line: 1, code: '', severity: 'error', description: '', suggestion: 'Add await' },
      { type: 'missing-await', file: 'a.ts', line: 2, code: '', severity: 'warning', description: '', suggestion: 'Add await' },
    ]
    const output = formatSuggestions(anti)
    const count = (output.match(/Add await/g) || []).length
    expect(count).toBe(1)
  })
})

describe('formatStats', () => {
  it('formats all stats', () => {
    const stats: AsyncStats = {
      totalAsyncFunctions: 10, totalPromises: 5, totalCallbacks: 3,
      totalEventHandlers: 2, totalTimers: 1, totalGenerators: 1,
      antiPatternCount: 2, errorHandlingRate: 75, averageNesting: 1.8,
    }
    const output = formatStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('5')
    expect(output).toContain('75%')
    expect(output).toContain('1.8')
  })
})

describe('formatRecommendations', () => {
  it('formats numbered list', () => {
    const output = formatRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1.')
    expect(output).toContain('Fix A')
  })
})

describe('formatThreadsReport', () => {
  it('formats full report', () => {
    const result = buildThreadsResult(['a.ts'], ['async function foo() { await bar() }'])
    const report = formatThreadsReport(result)
    expect(report).toContain('Async Pattern Statistics')
    expect(report).toContain('Anti-Patterns')
    expect(report).toContain('Recommendations')
  })
})

describe('formatThreadsJson', () => {
  it('outputs valid JSON', () => {
    const result = buildThreadsResult(['a.ts'], ['async function foo() {}'])
    const json = formatThreadsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.patterns).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
