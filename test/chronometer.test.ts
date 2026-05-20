import { describe, it, expect } from 'vitest'
import {
  type TemporalPattern,
  type TimeDependency,
  type TemporalFile,
  type TemporalAnomaly,
  type ChronometerStats,
  type ChronometerResult,
  detectTemporalPatterns,
  measureCallbackDepth,
  detectTimeDependencies,
  detectTemporalAnomalies,
  detectCircularAwait,
  computeAsyncScore,
  computeTimeoutHandling,
  computeTemporalComplexity,
  computeErrorRecovery,
  classifyTemporalFile,
  computeChronometerScore,
  classifyTemporalHealth,
  generateRecommendations,
  buildChronometerResult,
} from '../src/commands/chronometer-helpers.js'
import {
  formatPatternType,
  formatRisk,
  formatPattern,
  formatPatterns,
  formatFileClassification,
  formatTemporalFile,
  formatMiniBar,
  formatTemporalFiles,
  formatAnomalySeverity,
  formatAnomalyType,
  formatAnomaly,
  formatAnomalies,
  formatTemporalHealth,
  formatStats,
  formatRecommendations,
  formatChronometerResult,
  formatChronometerJson,
} from '../src/commands/chronometer-format-helpers.js'

// ─── detectTemporalPatterns ───────────────────────────────────────────────────

describe('detectTemporalPatterns', () => {
  it('detects sequential await', () => {
    const p = detectTemporalPatterns('const x = await foo()', 'a.ts')
    expect(p.some(pp => pp.type === 'sequential')).toBe(true)
  })

  it('detects Promise.all', () => {
    const p = detectTemporalPatterns('const r = Promise.all([a, b])', 'a.ts')
    expect(p.some(pp => pp.type === 'parallel')).toBe(true)
  })

  it('detects Promise.allSettled', () => {
    const p = detectTemporalPatterns('const r = Promise.allSettled([a, b])', 'a.ts')
    expect(p.some(pp => pp.type === 'parallel')).toBe(true)
  })

  it('detects Promise.race', () => {
    const p = detectTemporalPatterns('const r = Promise.race([a, b])', 'a.ts')
    expect(p.some(pp => pp.type === 'promise-race')).toBe(true)
  })

  it('detects setTimeout', () => {
    const p = detectTemporalPatterns('setTimeout(() => {}, 1000)', 'a.ts')
    expect(p.some(pp => pp.type === 'timeout')).toBe(true)
  })

  it('detects setInterval', () => {
    const p = detectTemporalPatterns('setInterval(() => {}, 1000)', 'a.ts')
    expect(p.some(pp => pp.type === 'interval')).toBe(true)
  })

  it('detects event-driven patterns', () => {
    const p = detectTemporalPatterns('emitter.on("data", handler)', 'a.ts')
    expect(p.some(pp => pp.type === 'event-driven')).toBe(true)
  })

  it('detects addEventListener', () => {
    const p = detectTemporalPatterns('el.addEventListener("click", fn)', 'a.ts')
    expect(p.some(pp => pp.type === 'event-driven')).toBe(true)
  })

  it('detects synchronous blocking readFileSync', () => {
    const p = detectTemporalPatterns("const d = readFileSync('f.txt')", 'a.ts')
    expect(p.some(pp => pp.type === 'synchronous-block')).toBe(true)
  })

  it('detects synchronous blocking writeFileSync', () => {
    const p = detectTemporalPatterns("writeFileSync('f.txt', data)", 'a.ts')
    expect(p.some(pp => pp.type === 'synchronous-block')).toBe(true)
  })

  it('detects async chains', () => {
    const code = 'const a = await x()\nconst b = await y()\nconst c = await z()'
    const p = detectTemporalPatterns(code, 'a.ts')
    expect(p.some(pp => pp.type === 'async-chain')).toBe(true)
  })

  it('returns patterns with file path', () => {
    const p = detectTemporalPatterns('await foo()', 'src/a.ts')
    expect(p.every(pp => pp.file === 'src/a.ts')).toBe(true)
  })

  it('returns patterns with location', () => {
    const p = detectTemporalPatterns('await foo()', 'a.ts')
    expect(p.every(pp => pp.location > 0)).toBe(true)
  })

  it('returns patterns with complexity 0-100', () => {
    const p = detectTemporalPatterns('await foo()', 'a.ts')
    expect(p.every(pp => pp.complexity >= 0 && pp.complexity <= 100)).toBe(true)
  })

  it('returns empty for plain code', () => {
    const p = detectTemporalPatterns('const x = 1', 'a.ts')
    expect(p.length).toBe(0)
  })

  it('detects emit patterns as event-driven', () => {
    const p = detectTemporalPatterns('emitter.emit("done")', 'a.ts')
    expect(p.some(pp => pp.type === 'event-driven')).toBe(true)
  })
})

// ─── measureCallbackDepth ─────────────────────────────────────────────────────

describe('measureCallbackDepth', () => {
  it('returns 0 for flat code', () => {
    expect(measureCallbackDepth('const x = 1')).toBe(0)
  })

  it('returns 0 for shallow callbacks', () => {
    expect(measureCallbackDepth('a(() => { b() })')).toBe(0)
  })

  it('detects deep nesting with callbacks', () => {
    const deep = 'a(() => {\nb(() => {\nc(() => {\nd(() => {\ne(() => {\nf() }) }) }) }) })'
    expect(measureCallbackDepth(deep)).toBeGreaterThanOrEqual(3)
  })

  it('returns 0 for deep braces without callbacks', () => {
    expect(measureCallbackDepth('{ { { { } } } }')).toBe(0)
  })
})

// ─── detectTimeDependencies ───────────────────────────────────────────────────

describe('detectTimeDependencies', () => {
  it('detects data flow dependencies', () => {
    const code = 'const x = await a()\nconst y = compute(x)'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => d.from === 'x' && d.type === 'data-flow')).toBe(true)
  })

  it('detects state mutation dependencies', () => {
    const code = 'const items = []\nitems.push(1)'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => d.from === 'items')).toBe(true)
  })

  it('detects lock patterns', () => {
    const code = 'mutex.lock()\ndoWork()\nmutex.unlock()'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => d.type === 'resource-access')).toBe(true)
  })

  it('marks dependencies as implicit by default', () => {
    const code = 'const x = 1\nconsole.log(x)'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => d.isImplicit)).toBe(true)
  })

  it('marks explicit when comment present', () => {
    const code = 'const x = 1\n// depends on x\nconst y = x + 1'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => !d.isImplicit)).toBe(true)
  })

  it('returns empty for no dependencies', () => {
    const deps = detectTimeDependencies('const x = 1', 'f.ts')
    expect(deps.length).toBe(0)
  })

  it('assigns critical strength for initialization', () => {
    const code = 'const config = loadConfig()\nconst a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconst e = 5\nconst db = connect(config)'
    const deps = detectTimeDependencies(code, 'f.ts')
    expect(deps.some(d => d.strength === 'critical')).toBe(true)
  })
})

// ─── detectTemporalAnomalies ──────────────────────────────────────────────────

describe('detectTemporalAnomalies', () => {
  it('detects race condition with async + mutable state', () => {
    const patterns: TemporalPattern[] = [{ type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: 'await' }]
    const anomalies = detectTemporalAnomalies(patterns, 'let x = 0\nx = await foo()')
    expect(anomalies.some(a => a.type === 'race-condition')).toBe(true)
  })

  it('detects callback hell from patterns', () => {
    const patterns: TemporalPattern[] = [{ type: 'callback-pyramid', file: 'a.ts', location: 1, complexity: 65, risk: 'risky', description: 'deep nesting' }]
    const anomalies = detectTemporalAnomalies(patterns, 'nested callbacks')
    expect(anomalies.some(a => a.type === 'callback-hell')).toBe(true)
  })

  it('detects unhandled timeout', () => {
    const patterns: TemporalPattern[] = [
      { type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: 'await1' },
      { type: 'sequential', file: 'a.ts', location: 2, complexity: 20, risk: 'safe', description: 'await2' },
      { type: 'sequential', file: 'a.ts', location: 3, complexity: 20, risk: 'safe', description: 'await3' },
    ]
    const anomalies = detectTemporalAnomalies(patterns, 'await a(); await b(); await c()')
    expect(anomalies.some(a => a.type === 'unhandled-timeout')).toBe(true)
  })

  it('detects zombie process from setInterval without clearInterval', () => {
    const patterns: TemporalPattern[] = []
    const anomalies = detectTemporalAnomalies(patterns, 'setInterval(fn, 1000)')
    expect(anomalies.some(a => a.type === 'zombie-process')).toBe(true)
  })

  it('does not flag zombie when clearInterval present', () => {
    const patterns: TemporalPattern[] = []
    const anomalies = detectTemporalAnomalies(patterns, 'const id = setInterval(fn, 1000)\nclearInterval(id)')
    expect(anomalies.some(a => a.type === 'zombie-process')).toBe(false)
  })

  it('detects time bomb from date-dependent logic', () => {
    const patterns: TemporalPattern[] = []
    const code = 'const now = new Date()\nif (now.getHours() > 17) { shutdown() }'
    const anomalies = detectTemporalAnomalies(patterns, code)
    expect(anomalies.some(a => a.type === 'time-bomb')).toBe(true)
  })

  it('detects stale state', () => {
    const patterns: TemporalPattern[] = [
      { type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: 'await' },
    ]
    const code = 'let x = 1\nlet y = 2\nawait foo()\nx = await bar()'
    const anomalies = detectTemporalAnomalies(patterns, code)
    expect(anomalies.some(a => a.type === 'stale-state')).toBe(true)
  })

  it('returns anomalies with mitigation', () => {
    const patterns: TemporalPattern[] = [{ type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: 'await' }]
    const anomalies = detectTemporalAnomalies(patterns, 'let x = 0\nawait foo()')
    expect(anomalies.every(a => a.mitigation.length > 0)).toBe(true)
  })

  it('returns anomalies with severity', () => {
    const patterns: TemporalPattern[] = [{ type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: 'await' }]
    const anomalies = detectTemporalAnomalies(patterns, 'let x = 0\nawait foo()')
    expect(anomalies.every(a => ['low', 'medium', 'high', 'critical'].includes(a.severity))).toBe(true)
  })
})

// ─── detectCircularAwait ──────────────────────────────────────────────────────

describe('detectCircularAwait', () => {
  it('returns false for simple code', () => {
    expect(detectCircularAwait('const x = 1')).toBe(false)
  })

  it('returns false for single import-export', () => {
    expect(detectCircularAwait("import { a } from './b'\nexport function c() {}")).toBe(false)
  })

  it('detects potential circular patterns', () => {
    const code = "import { a, b } from './x'\nimport { c, d } from './y'\nexport async function e() { await a() }\nexport async function f() { await c() }"
    expect(detectCircularAwait(code)).toBe(true)
  })
})

// ─── computeAsyncScore ────────────────────────────────────────────────────────

describe('computeAsyncScore', () => {
  it('gives higher score for async/await', () => {
    const good = computeAsyncScore([], 'async function foo() { await bar() }')
    const bare = computeAsyncScore([], 'const x = 1')
    expect(good).toBeGreaterThan(bare)
  })

  it('penalizes synchronous blocks', () => {
    const patterns: TemporalPattern[] = [{ type: 'synchronous-block', file: 'a.ts', location: 1, complexity: 15, risk: 'risky', description: 'sync' }]
    const bare = computeAsyncScore([], 'const x = 1')
    const bad = computeAsyncScore(patterns, 'readFileSync()')
    expect(bare).toBeGreaterThan(bad)
  })

  it('rewards Promise.all', () => {
    const withPromise = computeAsyncScore([], 'Promise.all([a, b])')
    const without = computeAsyncScore([], 'const x = 1')
    expect(withPromise).toBeGreaterThan(without)
  })

  it('rewards try-catch', () => {
    const good = computeAsyncScore([], 'try { await foo() } catch(e) {}')
    const bare = computeAsyncScore([], 'await foo()')
    expect(good).toBeGreaterThan(bare)
  })

  it('score is between 0 and 100', () => {
    expect(computeAsyncScore([], 'code')).toBeGreaterThanOrEqual(0)
    expect(computeAsyncScore([], 'code')).toBeLessThanOrEqual(100)
  })
})

// ─── computeTimeoutHandling ───────────────────────────────────────────────────

describe('computeTimeoutHandling', () => {
  it('gives higher score with setTimeout', () => {
    const withTimeout = computeTimeoutHandling('setTimeout(fn, 1000)')
    const bare = computeTimeoutHandling('const x = 1')
    expect(withTimeout).toBeGreaterThan(bare)
  })

  it('rewards clearTimeout', () => {
    const good = computeTimeoutHandling('const t = setTimeout(fn, 1000)\nclearTimeout(t)')
    const bare = computeTimeoutHandling('setTimeout(fn, 1000)')
    expect(good).toBeGreaterThan(bare)
  })

  it('rewards AbortController', () => {
    const good = computeTimeoutHandling('const ac = new AbortController()')
    const bare = computeTimeoutHandling('const x = 1')
    expect(good).toBeGreaterThan(bare)
  })

  it('score is between 0 and 100', () => {
    expect(computeTimeoutHandling('code')).toBeGreaterThanOrEqual(0)
    expect(computeTimeoutHandling('code')).toBeLessThanOrEqual(100)
  })
})

// ─── computeTemporalComplexity ────────────────────────────────────────────────

describe('computeTemporalComplexity', () => {
  it('returns 0 for empty patterns', () => {
    expect(computeTemporalComplexity([], [])).toBe(0)
  })

  it('increases with more patterns', () => {
    const p1: TemporalPattern[] = [{ type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: '' }]
    const p3: TemporalPattern[] = [
      { type: 'sequential', file: 'a.ts', location: 1, complexity: 30, risk: 'safe', description: '' },
      { type: 'parallel', file: 'a.ts', location: 2, complexity: 40, risk: 'safe', description: '' },
      { type: 'timeout', file: 'a.ts', location: 3, complexity: 25, risk: 'safe', description: '' },
    ]
    expect(computeTemporalComplexity(p3, [])).toBeGreaterThan(computeTemporalComplexity(p1, []))
  })

  it('increases with dependencies', () => {
    const patterns: TemporalPattern[] = [{ type: 'sequential', file: 'a.ts', location: 1, complexity: 20, risk: 'safe', description: '' }]
    const deps: TimeDependency[] = [{ from: 'a', to: 'b', type: 'data-flow', strength: 'moderate', isImplicit: true, description: '' }]
    expect(computeTemporalComplexity(patterns, deps)).toBeGreaterThan(computeTemporalComplexity(patterns, []))
  })
})

// ─── computeErrorRecovery ─────────────────────────────────────────────────────

describe('computeErrorRecovery', () => {
  it('gives higher score with try-catch', () => {
    const good = computeErrorRecovery('try { foo() } catch(e) { handle(e) }')
    const bare = computeErrorRecovery('foo()')
    expect(good).toBeGreaterThan(bare)
  })

  it('rewards finally blocks', () => {
    const good = computeErrorRecovery('try { foo() } finally { cleanup() }')
    const bare = computeErrorRecovery('foo()')
    expect(good).toBeGreaterThan(bare)
  })

  it('rewards throw statements', () => {
    const good = computeErrorRecovery('throw new Error("fail")')
    const bare = computeErrorRecovery('foo()')
    expect(good).toBeGreaterThan(bare)
  })

  it('score is between 0 and 100', () => {
    expect(computeErrorRecovery('code')).toBeGreaterThanOrEqual(0)
    expect(computeErrorRecovery('code')).toBeLessThanOrEqual(100)
  })
})

// ─── classifyTemporalFile ─────────────────────────────────────────────────────

describe('classifyTemporalFile', () => {
  it('classifies clockwork for high async + low complexity', () => {
    expect(classifyTemporalFile(80, 20, [])).toBe('clockwork')
  })

  it('classifies racing for race condition', () => {
    const anomalies: TemporalAnomaly[] = [{ type: 'race-condition', file: 'a.ts', severity: 'high', description: '', mitigation: '' }]
    expect(classifyTemporalFile(50, 30, anomalies)).toBe('racing')
  })

  it('classifies racing for deadlock', () => {
    const anomalies: TemporalAnomaly[] = [{ type: 'deadlock-risk', file: 'a.ts', severity: 'high', description: '', mitigation: '' }]
    expect(classifyTemporalFile(50, 30, anomalies)).toBe('racing')
  })

  it('classifies frozen for low async + low complexity', () => {
    expect(classifyTemporalFile(10, 10, [])).toBe('frozen')
  })

  it('classifies erratic for high complexity', () => {
    expect(classifyTemporalFile(40, 70, [])).toBe('erratic')
  })

  it('classifies flowing as default moderate', () => {
    expect(classifyTemporalFile(55, 40, [])).toBe('flowing')
  })
})

// ─── computeChronometerScore ──────────────────────────────────────────────────

describe('computeChronometerScore', () => {
  it('returns 100 for empty files', () => {
    expect(computeChronometerScore([], [], [])).toBe(100)
  })

  it('returns lower score with anomalies', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 80, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 70, errorRecovery: 60, temporalComplexity: 20, classification: 'clockwork' }
    const a: TemporalAnomaly[] = [{ type: 'race-condition', file: 'a.ts', severity: 'high', description: '', mitigation: '' }]
    const clean = computeChronometerScore([f], [], [])
    const dirty = computeChronometerScore([f], [], a)
    expect(clean).toBeGreaterThan(dirty)
  })

  it('score is between 0 and 100', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 50, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 50, errorRecovery: 50, temporalComplexity: 50, classification: 'flowing' }
    const score = computeChronometerScore([f], [], [])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── classifyTemporalHealth ───────────────────────────────────────────────────

describe('classifyTemporalHealth', () => {
  it('classifies synchronized for high scores', () => {
    expect(classifyTemporalHealth(90, [])).toBe('synchronized')
  })

  it('classifies flowing for moderate scores', () => {
    expect(classifyTemporalHealth(60, [])).toBe('flowing')
  })

  it('classifies turbulent for low scores', () => {
    expect(classifyTemporalHealth(40, [])).toBe('turbulent')
  })

  it('classifies frozen for very low scores', () => {
    expect(classifyTemporalHealth(10, [])).toBe('frozen')
  })

  it('classifies chaotic with many critical anomalies', () => {
    const anomalies: TemporalAnomaly[] = [
      { type: 'race-condition', file: 'a.ts', severity: 'critical', description: '', mitigation: '' },
      { type: 'deadlock-risk', file: 'a.ts', severity: 'critical', description: '', mitigation: '' },
      { type: 'zombie-process', file: 'a.ts', severity: 'critical', description: '', mitigation: '' },
    ]
    expect(classifyTemporalHealth(80, anomalies)).toBe('chaotic')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends fixing race conditions', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 50, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 50, errorRecovery: 50, temporalComplexity: 50, classification: 'flowing' }
    const a: TemporalAnomaly[] = [{ type: 'race-condition', file: 'a.ts', severity: 'medium', description: '', mitigation: '' }]
    const stats = { avgAsyncScore: 50, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([f], [], a, stats)
    expect(recs.some(r => r.includes('race condition'))).toBe(true)
  })

  it('recommends converting callbacks', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 30, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 30, errorRecovery: 30, temporalComplexity: 50, classification: 'flowing' }
    const a: TemporalAnomaly[] = [{ type: 'callback-hell', file: 'a.ts', severity: 'medium', description: '', mitigation: '' }]
    const stats = { avgAsyncScore: 30, avgTimeoutHandling: 30 } as ChronometerStats
    const recs = generateRecommendations([f], [], a, stats)
    expect(recs.some(r => r.includes('callback'))).toBe(true)
  })

  it('recommends adding timeouts', () => {
    const a: TemporalAnomaly[] = [{ type: 'unhandled-timeout', file: 'a.ts', severity: 'medium', description: '', mitigation: '' }]
    const stats = { avgAsyncScore: 50, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([], [], a, stats)
    expect(recs.some(r => r.includes('timeout'))).toBe(true)
  })

  it('recommends cleaning up zombies', () => {
    const a: TemporalAnomaly[] = [{ type: 'zombie-process', file: 'a.ts', severity: 'low', description: '', mitigation: '' }]
    const stats = { avgAsyncScore: 50, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([], [], a, stats)
    expect(recs.some(r => r.includes('zombie'))).toBe(true)
  })

  it('recommends for low async score', () => {
    const stats = { avgAsyncScore: 20, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('async'))).toBe(true)
  })

  it('recommends for erratic files', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 30, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 30, errorRecovery: 30, temporalComplexity: 80, classification: 'erratic' }
    const stats = { avgAsyncScore: 50, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([f], [], [], stats)
    expect(recs.some(r => r.includes('erratic'))).toBe(true)
  })

  it('recommends for racing files', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 30, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 30, errorRecovery: 30, temporalComplexity: 50, classification: 'racing' }
    const stats = { avgAsyncScore: 50, avgTimeoutHandling: 50 } as ChronometerStats
    const recs = generateRecommendations([f], [], [], stats)
    expect(recs.some(r => r.includes('racing'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const f: TemporalFile = { file: 'a.ts', patterns: [], dependencies: [], asyncScore: 80, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 70, errorRecovery: 80, temporalComplexity: 20, classification: 'clockwork' }
    const stats = { avgAsyncScore: 80, avgTimeoutHandling: 70 } as ChronometerStats
    const recs = generateRecommendations([f], [], [], stats)
    expect(recs.length).toBe(0)
  })
})

// ─── buildChronometerResult ───────────────────────────────────────────────────

describe('buildChronometerResult', () => {
  it('returns complete result structure', () => {
    const result = buildChronometerResult(['src/a.ts'], ['await foo()'], {})
    expect(result.files).toHaveLength(1)
    expect(result.stats.totalPatterns).toBeGreaterThan(0)
    expect(result.stats.temporalHealth).toBeTruthy()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty files', () => {
    const result = buildChronometerResult([], [], {})
    expect(result.files).toHaveLength(0)
    expect(result.stats.totalPatterns).toBe(0)
    expect(result.stats.chronometerScore).toBe(100)
    expect(result.stats.temporalHealth).toBe('synchronized')
  })

  it('computes avg scores', () => {
    const result = buildChronometerResult(['a.ts', 'b.ts'], ['await foo()', 'Promise.all([a, b])'], {})
    expect(result.stats.avgAsyncScore).toBeGreaterThan(0)
    expect(result.stats.avgTimeoutHandling).toBeGreaterThanOrEqual(0)
  })

  it('counts pattern types', () => {
    const result = buildChronometerResult(['a.ts'], ['await foo()\nPromise.all([a, b])'], {})
    expect(result.stats.sequentialPatterns).toBeGreaterThan(0)
    expect(result.stats.parallelPatterns).toBeGreaterThan(0)
  })

  it('detects anomalies in result', () => {
    const result = buildChronometerResult(['a.ts'], ['let x = 0\nawait foo()'], {})
    expect(result.anomalies.length).toBeGreaterThan(0)
  })

  it('computes dependencies in result', () => {
    const result = buildChronometerResult(['a.ts'], ['const x = await a()\nconst y = x + 1'], {})
    expect(result.dependencies.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatPatternType colors types', () => {
    expect(formatPatternType('sequential')).toContain('SEQUENTIAL')
    expect(formatPatternType('parallel')).toContain('PARALLEL')
  })

  it('formatRisk colors risks', () => {
    expect(formatRisk('safe')).toContain('SAFE')
    expect(formatRisk('dangerous')).toContain('DANGEROUS')
  })

  it('formatPattern formats a pattern', () => {
    const p: TemporalPattern = { type: 'sequential', file: 'a.ts', location: 12, complexity: 20, risk: 'safe', description: 'await call' }
    expect(formatPattern(p)).toContain('SEQUENTIAL')
    expect(formatPattern(p)).toContain('L 12')
  })

  it('formatPatterns handles empty', () => {
    expect(formatPatterns([])).toContain('No temporal patterns')
  })

  it('formatFileClassification colors classes', () => {
    expect(formatFileClassification('clockwork')).toContain('CLOCKWORK')
    expect(formatFileClassification('racing')).toContain('RACING')
  })

  it('formatMiniBar has fill chars', () => {
    expect(formatMiniBar(50)).toContain('█')
    expect(formatMiniBar(50)).toContain('░')
  })

  it('formatTemporalFile includes file name', () => {
    const f: TemporalFile = { file: 'src/a.ts', patterns: [], dependencies: [], asyncScore: 80, syncBlocks: 0, asyncBlocks: 0, timeoutHandling: 70, errorRecovery: 60, temporalComplexity: 20, classification: 'clockwork' }
    expect(formatTemporalFile(f)).toContain('src/a.ts')
  })

  it('formatTemporalFiles handles empty', () => {
    expect(formatTemporalFiles([])).toContain('No files analyzed')
  })

  it('formatAnomalySeverity colors severity', () => {
    expect(formatAnomalySeverity('critical')).toContain('CRITICAL')
    expect(formatAnomalySeverity('low')).toContain('LOW')
  })

  it('formatAnomalyType colors types', () => {
    expect(formatAnomalyType('race-condition')).toContain('RACE-CONDITION')
    expect(formatAnomalyType('zombie-process')).toContain('ZOMBIE-PROCESS')
  })

  it('formatAnomaly formats anomaly', () => {
    const a: TemporalAnomaly = { type: 'race-condition', file: 'a.ts', severity: 'high', description: 'bad timing', mitigation: 'fix it' }
    expect(formatAnomaly(a)).toContain('bad timing')
  })

  it('formatAnomalies shows all-clear when empty', () => {
    expect(formatAnomalies([])).toContain('well-synchronized')
  })

  it('formatTemporalHealth colors health', () => {
    expect(formatTemporalHealth('synchronized')).toContain('SYNCHRONIZED')
    expect(formatTemporalHealth('chaotic')).toContain('CHAOTIC')
  })

  it('formatStats produces summary', () => {
    const stats: ChronometerStats = {
      totalPatterns: 10, sequentialPatterns: 5, parallelPatterns: 3, asyncChains: 1, callbackPyramids: 0,
      totalDependencies: 4, criticalDependencies: 1, implicitDependencies: 3,
      totalAnomalies: 2, raceConditions: 1, deadlockRisks: 0, callbackHells: 0,
      avgAsyncScore: 70, avgTimeoutHandling: 60, avgTemporalComplexity: 35,
      clockworkFiles: 2, erraticFiles: 0, racingFiles: 1,
      temporalHealth: 'flowing', chronometerScore: 75,
    }
    const result = formatStats(stats)
    expect(result).toContain('CHRONOMETER ANALYSIS SUMMARY')
    expect(result).toContain('75/100')
  })

  it('formatRecommendations numbers items', () => {
    expect(formatRecommendations(['First', 'Second'])).toContain('1.')
  })

  it('formatRecommendations shows optimal when empty', () => {
    expect(formatRecommendations([])).toContain('optimal')
  })

  it('formatChronometerResult produces full output', () => {
    const result = buildChronometerResult(['src/a.ts'], ['await foo()'], {})
    const output = formatChronometerResult(result)
    expect(output).toContain('CHRONOMETER ANALYSIS SUMMARY')
    expect(output).toContain('Files')
  })

  it('formatChronometerJson produces valid JSON', () => {
    const result = buildChronometerResult(['src/a.ts'], ['await foo()'], {})
    const json = formatChronometerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('chronometer integration', () => {
  it('full analysis of async codebase', () => {
    const files = ['src/async.ts', 'src/sync.ts', 'src/events.ts']
    const contents = [
      'async function main() {\n  const a = await fetch(url)\n  const b = await process(a)\n  try { await save(b) } catch(e) { throw new Error("fail") }\n}\nconst id = setTimeout(() => {}, 5000)\nclearTimeout(id)',
      "const data = readFileSync('input.txt')\nwriteFileSync('output.txt', data)",
      'emitter.on("data", handler)\nsetInterval(poll, 1000)',
    ]
    const result = buildChronometerResult(files, contents, {})
    expect(result.stats.totalPatterns).toBeGreaterThan(5)
    expect(result.files).toHaveLength(3)
    expect(result.stats.chronometerScore).toBeGreaterThan(0)
    expect(result.stats.temporalHealth).toBeTruthy()
  })

  it('well-written async code gets high score', () => {
    const code = 'async function processAll(items: Item[]): Promise<Result[]> {\n  try {\n    const results = await Promise.all(items.map(processItem))\n    return results\n  } catch (e) {\n    throw new Error("Process failed")\n  } finally {\n    cleanup()\n  }\n}\nconst controller = new AbortController()\nconst tid = setTimeout(() => controller.abort(), 5000)\nclearTimeout(tid)'
    const result = buildChronometerResult(['src/clean.ts'], [code], {})
    expect(result.stats.avgAsyncScore).toBeGreaterThan(60)
    expect(result.stats.chronometerScore).toBeGreaterThan(40)
  })
})
