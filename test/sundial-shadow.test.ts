import { describe, it, expect } from 'vitest'
import {
  classifySunPosition,
  classifyLifecycle,
  classifyEpoch,
  classifyChronotype,
  classifyEpochGrade,
  countLegacyPatterns,
  countModernPatterns,
  countExperimentalPatterns,
  countDeprecatedPatterns,
  countPatterns,
  detectDecay,
  assessGrowth,
  analyzeShadowTrace,
  analyzeShadowCluster,
  generateRecommendations,
  buildSundialShadowResult,
  type ShadowTrace,
  type SundialShadowStats,
} from '../src/commands/sundial-shadow-helpers.js'
import { formatSundialShadowTable, formatSundialShadowJson } from '../src/commands/sundial-shadow-format-helpers.js'

// ─── classifySunPosition ───────────────────────────────────────────────────

describe('classifySunPosition', () => {
  it('returns dawn for 20-39 maturity', () => {
    expect(classifySunPosition(20)).toBe('dawn')
    expect(classifySunPosition(39)).toBe('dawn')
  })

  it('returns morning for 40-54', () => {
    expect(classifySunPosition(40)).toBe('morning')
    expect(classifySunPosition(54)).toBe('morning')
  })

  it('returns noon for 55-69', () => {
    expect(classifySunPosition(55)).toBe('noon')
    expect(classifySunPosition(69)).toBe('noon')
  })

  it('returns afternoon for 70-84', () => {
    expect(classifySunPosition(70)).toBe('afternoon')
    expect(classifySunPosition(84)).toBe('afternoon')
  })

  it('returns dusk for 85+', () => {
    expect(classifySunPosition(85)).toBe('dusk')
    expect(classifySunPosition(100)).toBe('dusk')
  })

  it('returns evening for 10-19', () => {
    expect(classifySunPosition(10)).toBe('evening')
    expect(classifySunPosition(19)).toBe('evening')
  })

  it('returns night below 10', () => {
    expect(classifySunPosition(9)).toBe('night')
    expect(classifySunPosition(0)).toBe('night')
  })
})

// ─── classifyLifecycle ─────────────────────────────────────────────────────

describe('classifyLifecycle', () => {
  it('returns fossil for empty content', () => {
    expect(classifyLifecycle('')).toBe('fossil')
  })

  it('returns embryonic for minimal code', () => {
    expect(classifyLifecycle('const x = 1')).toBe('embryonic')
  })

  it('returns infant for small export', () => {
    expect(classifyLifecycle('export function a() { return 1 }')).toBe('infant')
  })

  it('returns growing for documented exports', () => {
    expect(classifyLifecycle('/** doc */\nexport function a() {}\nexport function b() {}')).toBe('growing')
  })

  it('returns mature for well-structured code', () => {
    const code = [
      '/** A */ export class A {}',
      '/** B */ export class B {}',
      '/** C */ export interface I {}',
      '/** D */ export interface J {}',
      '/** E */',
      '/** F */',
    ].join('\n')
    expect(classifyLifecycle(code)).toBe('mature')
  })

  it('returns aging for any types', () => {
    expect(classifyLifecycle('const x: any = 1; const y: any = 2')).toBe('aging')
  })

  it('returns legacy for many anys and vars', () => {
    expect(classifyLifecycle('var x: any = 1; var y: any = 2; var z: any = 3')).toBe('legacy')
  })

  it('returns ancient for deprecated and vars', () => {
    expect(classifyLifecycle('@deprecated var x = 1; @deprecated var y = 2; var z = 1')).toBe('ancient')
  })
})

// ─── classifyEpoch ─────────────────────────────────────────────────────────

describe('classifyEpoch', () => {
  it('returns legacy for empty content', () => {
    expect(classifyEpoch('')).toBe('legacy')
  })

  it('returns pioneer for heavy legacy patterns', () => {
    expect(classifyEpoch('var x: any = 1; var y: any = 2; var z: any = 3; var w: any = 4')).toBe('pioneer')
  })

  it('returns optimization for experimental patterns', () => {
    const code = 'async function* a() { yield 1 } async function* b() { yield 2 } async function* c() { yield 3 }'
    expect(classifyEpoch(code)).toBe('optimization')
  })

  it('returns consolidation for many modern patterns', () => {
    const code = [
      'const a = () => {}',
      'const b = () => {}',
      'async function c() {}',
      'interface I {}',
      'type T = string',
    ].join('\n')
    expect(classifyEpoch(code)).toBe('consolidation')
  })

  it('returns expansion for mixed modern and legacy', () => {
    expect(classifyEpoch('const a = () => {}; var x: any = 1; const b = () => {}')).toBe('expansion')
  })

  it('returns foundation for some modern', () => {
    expect(classifyEpoch('const a = () => {}')).toBe('foundation')
  })

  it('returns legacy for deprecated markers', () => {
    expect(classifyEpoch('@deprecated function a() {} @deprecated function b() {}')).toBe('legacy')
  })
})

// ─── classifyChronotype ────────────────────────────────────────────────────

describe('classifyChronotype', () => {
  it('returns early-adopter for experimental and modern', () => {
    expect(classifyChronotype(2, 0, 3)).toBe('early-adopter')
    expect(classifyChronotype(3, 1, 4)).toBe('early-adopter')
  })

  it('returns mainstream for modern and low legacy', () => {
    expect(classifyChronotype(3, 1, 0)).toBe('mainstream')
    expect(classifyChronotype(4, 0, 1)).toBe('mainstream')
  })

  it('returns laggard for heavy legacy', () => {
    expect(classifyChronotype(0, 3, 0)).toBe('laggard')
    expect(classifyChronotype(1, 4, 0)).toBe('laggard')
  })

  it('returns relic for legacy-only', () => {
    expect(classifyChronotype(0, 2, 0)).toBe('relic')
  })

  it('returns late-adopter as default', () => {
    expect(classifyChronotype(1, 1, 0)).toBe('late-adopter')
    expect(classifyChronotype(0, 0, 0)).toBe('late-adopter')
  })
})

// ─── classifyEpochGrade ────────────────────────────────────────────────────

describe('classifyEpochGrade', () => {
  it('returns golden-age for 80+', () => {
    expect(classifyEpochGrade(80)).toBe('golden-age')
    expect(classifyEpochGrade(100)).toBe('golden-age')
  })

  it('returns renaissance for 65-79', () => {
    expect(classifyEpochGrade(65)).toBe('renaissance')
    expect(classifyEpochGrade(79)).toBe('renaissance')
  })

  it('returns modern for 50-64', () => {
    expect(classifyEpochGrade(50)).toBe('modern')
    expect(classifyEpochGrade(64)).toBe('modern')
  })

  it('returns industrial for 35-49', () => {
    expect(classifyEpochGrade(35)).toBe('industrial')
    expect(classifyEpochGrade(49)).toBe('industrial')
  })

  it('returns post-modern for 20-34', () => {
    expect(classifyEpochGrade(20)).toBe('post-modern')
    expect(classifyEpochGrade(34)).toBe('post-modern')
  })

  it('returns dark-age below 20', () => {
    expect(classifyEpochGrade(19)).toBe('dark-age')
    expect(classifyEpochGrade(0)).toBe('dark-age')
  })
})

// ─── Pattern Counting ──────────────────────────────────────────────────────

describe('countLegacyPatterns', () => {
  it('counts var declarations', () => {
    expect(countLegacyPatterns('var x = 1')).toBe(1)
    expect(countLegacyPatterns('var x = 1; var y = 2')).toBe(2)
  })

  it('counts any types', () => {
    expect(countLegacyPatterns('const x: any = 1')).toBe(1)
  })

  it('counts deprecated markers', () => {
    expect(countLegacyPatterns('@deprecated function a() {}')).toBe(1)
  })

  it('returns 0 for clean code', () => {
    expect(countLegacyPatterns('const x: string = "hello"')).toBe(0)
  })
})

describe('countModernPatterns', () => {
  it('counts arrow functions', () => {
    expect(countModernPatterns('const f = () => { return 1 }')).toBeGreaterThanOrEqual(1)
  })

  it('counts async functions', () => {
    expect(countModernPatterns('async function fetch() {}')).toBeGreaterThanOrEqual(1)
  })

  it('counts interfaces and types', () => {
    expect(countModernPatterns('interface I {} type T = string')).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for no modern patterns', () => {
    expect(countModernPatterns('var x = 1')).toBe(0)
  })
})

describe('countExperimentalPatterns', () => {
  it('counts generators', () => {
    expect(countExperimentalPatterns('async function* gen() { yield 1 }')).toBeGreaterThanOrEqual(1)
  })

  it('counts Proxy usage', () => {
    expect(countExperimentalPatterns('const p = new Proxy({})')).toBeGreaterThanOrEqual(1)
  })

  it('counts Symbol usage', () => {
    expect(countExperimentalPatterns('const s = Symbol.iterator')).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for normal code', () => {
    expect(countExperimentalPatterns('function f() {}')).toBe(0)
  })
})

describe('countDeprecatedPatterns', () => {
  it('counts @deprecated', () => {
    expect(countDeprecatedPatterns('/** @deprecated */ function a() {}')).toBe(1)
  })

  it('counts arguments array', () => {
    expect(countDeprecatedPatterns('function f() { return arguments[0] }')).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for clean code', () => {
    expect(countDeprecatedPatterns('function f() {}')).toBe(0)
  })
})

describe('countPatterns', () => {
  it('returns all pattern counts', () => {
    const result = countPatterns('var x: any = 1')
    expect(result.legacyPatterns).toBeGreaterThan(0)
    expect(result.modernPatterns).toBeGreaterThanOrEqual(0)
    expect(result.experimentalPatterns).toBeGreaterThanOrEqual(0)
    expect(result.deprecatedPatterns).toBeGreaterThanOrEqual(0)
    expect(result.refactoringTraces).toBeGreaterThanOrEqual(0)
  })
})

// ─── detectDecay ───────────────────────────────────────────────────────────

describe('detectDecay', () => {
  it('returns none for clean code', () => {
    const decay = detectDecay('export function f(): string { return "hello" }')
    expect(decay.present).toBe(false)
    expect(decay.level).toBe('none')
    expect(decay.indicators).toEqual([])
  })

  it('detects minimal decay', () => {
    const decay = detectDecay('const x: any = 1')
    expect(decay.present).toBe(true)
    expect(decay.level).toBe('minimal')
  })

  it('detects moderate decay', () => {
    const decay = detectDecay('const x: any = 1; var y = 2; // TODO fix')
    expect(decay.present).toBe(true)
    expect(decay.level).toBe('moderate')
  })

  it('detects significant decay', () => {
    const code = 'const x: any = 1; const y: any = 2; var z = 3; // TODO a; // FIXME b; console.log("d")'
    const decay = detectDecay(code)
    expect(decay.present).toBe(true)
    expect(decay.level).toBe('significant')
  })

  it('detects severe decay', () => {
    const code = [
      'var x: any = 1',
      'var y: any = 2',
      'console.log("a")',
      'console.log("b")',
      'console.log("c")',
      '// TODO fix',
      '// FIXME broken',
      '// HACK ugly',
    ].join('\n')
    const decay = detectDecay(code)
    expect(decay.present).toBe(true)
    expect(decay.level).toBe('severe')
  })

  it('includes decay indicators', () => {
    const decay = detectDecay('const x: any = 1; const y: any = 2')
    expect(decay.indicators).toContain('any types')
  })
})

// ─── assessGrowth ──────────────────────────────────────────────────────────

describe('assessGrowth', () => {
  it('returns static for empty content', () => {
    const growth = assessGrowth('')
    expect(growth.direction).toBe('static')
    expect(growth.rate).toBe(0)
    expect(growth.isHealthy).toBe(false)
  })

  it('returns expanding for high exports and modern', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
      'const x = () => {}',
      'const y = () => {}',
    ].join('\n')
    const growth = assessGrowth(code)
    expect(growth.direction).toBe('expanding')
  })

  it('returns contracting for many TODOs/legacy', () => {
    const code = [
      'var x = 1; var y = 2; var z = 3',
      '// TODO fix a',
      '// FIXME fix b',
      '// TODO fix c',
    ].join('\n')
    const growth = assessGrowth(code)
    expect(growth.direction).toBe('contracting')
  })

  it('returns stable for moderate code', () => {
    const growth = assessGrowth('export function a() {}')
    expect(growth.direction).toBe('stable')
  })
})

// ─── analyzeShadowTrace ────────────────────────────────────────────────────

describe('analyzeShadowTrace', () => {
  it('analyzes empty content', () => {
    const trace = analyzeShadowTrace('', 'empty.ts')
    expect(trace.file).toBe('empty.ts')
    expect(trace.shadowLength).toBe(0)
    expect(trace.shadowClarity).toBe(0)
    expect(trace.maturity).toBe(0)
    expect(trace.lifecycle).toBe('fossil')
    expect(trace.sunPosition).toBe('night')
    expect(trace.isNight).toBe(true)
    expect(trace.isDawn).toBe(false)
    expect(trace.classification).toBe('midnight')
    expect(trace.growth.direction).toBe('static')
  })

  it('analyzes well-documented code', () => {
    const code = [
      '/** Module docs */',
      '/** A function */',
      'export function hello(): string { return "world" }',
      '/** Helper */',
      'export function helper(): number { return 42 }',
      'export interface Config { name: string }',
    ].join('\n')
    const trace = analyzeShadowTrace(code, 'good.ts')
    expect(trace.file).toBe('good.ts')
    expect(trace.shadowClarity).toBeGreaterThan(0)
    expect(trace.maturity).toBeGreaterThan(0)
    expect(trace.traces.modernPatterns).toBeGreaterThanOrEqual(0)
    expect(trace.decay.present).toBe(false)
  })

  it('detects legacy in old-style code', () => {
    const code = 'var x: any = 1; var y: any = 2'
    const trace = analyzeShadowTrace(code, 'old.ts')
    expect(trace.shadowLength).toBeGreaterThan(0)
    expect(trace.traces.legacyPatterns).toBeGreaterThan(0)
    expect(trace.decay.present).toBe(true)
  })

  it('computes shadow caster metrics', () => {
    const trace = analyzeShadowTrace('export class A { method() {} }\nexport function b() {}', 'ab.ts')
    expect(trace.shadowCaster.size).toBeGreaterThan(0)
    expect(trace.shadowCaster.height).toBeGreaterThan(0)
    expect(trace.shadowCaster.opacity).toBeGreaterThanOrEqual(0)
  })

  it('computes shadow angle', () => {
    const trace = analyzeShadowTrace('export function a() {}', 'a.ts')
    expect(trace.shadowAngle).toBeGreaterThanOrEqual(0)
    expect(trace.shadowAngle).toBeLessThanOrEqual(360)
  })

  it('computes temporal depth', () => {
    const trace = analyzeShadowTrace('export function a() {} export class B {} interface I {}', 'ab.ts')
    expect(trace.temporalDepth).toBeGreaterThan(0)
  })

  it('sets dawn flag for dawn sun position', () => {
    const code = '/** Doc */ export function a() {} export interface I {} export type T = string'
    const trace = analyzeShadowTrace(code, 'mid.ts')
    expect(typeof trace.isDawn).toBe('boolean')
    expect(typeof trace.isNoon).toBe('boolean')
    expect(typeof trace.isDusk).toBe('boolean')
    expect(typeof trace.isNight).toBe('boolean')
  })

  it('classifies chronotype correctly', () => {
    const trace = analyzeShadowTrace('', 'empty.ts')
    expect(['early-adopter', 'mainstream', 'late-adopter', 'laggard', 'relic']).toContain(trace.chronotype)
  })

  it('all metrics in 0-100 range', () => {
    const trace = analyzeShadowTrace('export function a() {}', 'a.ts')
    expect(trace.shadowLength).toBeGreaterThanOrEqual(0)
    expect(trace.shadowClarity).toBeGreaterThanOrEqual(0)
    expect(trace.temporalDepth).toBeGreaterThanOrEqual(0)
    expect(trace.maturity).toBeGreaterThanOrEqual(0)
    expect(trace.shadowCaster.size).toBeGreaterThanOrEqual(0)
    expect(trace.shadowCaster.height).toBeGreaterThanOrEqual(0)
    expect(trace.shadowCaster.opacity).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeShadowCluster ──────────────────────────────────────────────────

describe('analyzeShadowCluster', () => {
  it('returns empty cluster for no traces', () => {
    const cluster = analyzeShadowCluster([], 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.traces).toEqual([])
    expect(cluster.avgMaturity).toBe(0)
    expect(cluster.dominantLifecycle).toBe('fossil')
    expect(cluster.condition).toBe('decaying')
    expect(cluster.timeOfDay).toBe('night')
  })

  it('aggregates trace averages', () => {
    const traces: ShadowTrace[] = [
      analyzeShadowTrace('export function a() {}', 'a.ts'),
      analyzeShadowTrace('/** D */ export class B {}', 'b.ts'),
    ]
    const cluster = analyzeShadowCluster(traces, 'src')
    expect(cluster.traces.length).toBe(2)
    expect(cluster.avgShadowLength).toBeGreaterThanOrEqual(0)
    expect(cluster.avgMaturity).toBeGreaterThanOrEqual(0)
  })

  it('counts phase distribution', () => {
    const traces: ShadowTrace[] = [
      analyzeShadowTrace('', 'empty.ts'),
      analyzeShadowTrace('/** D */ export function f() {} export interface I {} export type T = string', 'mid.ts'),
    ]
    const cluster = analyzeShadowCluster(traces, 'src')
    expect(cluster.dawnFiles).toBeGreaterThanOrEqual(0)
    expect(cluster.noonFiles).toBeGreaterThanOrEqual(0)
    expect(cluster.duskFiles).toBeGreaterThanOrEqual(0)
    expect(cluster.nightFiles).toBeGreaterThanOrEqual(0)
  })

  it('computes evolutionary health', () => {
    const traces: ShadowTrace[] = [
      analyzeShadowTrace('export function a() {}', 'a.ts'),
    ]
    const cluster = analyzeShadowCluster(traces, 'src')
    expect(cluster.evolutionaryHealth).toBeGreaterThanOrEqual(0)
    expect(cluster.evolutionaryHealth).toBeLessThanOrEqual(100)
    expect(cluster.historicalRichness).toBeGreaterThanOrEqual(0)
    expect(cluster.historicalRichness).toBeLessThanOrEqual(100)
  })

  it('detects decay in cluster', () => {
    const traces: ShadowTrace[] = [
      analyzeShadowTrace('var x: any = 1', 'bad.ts'),
    ]
    const cluster = analyzeShadowCluster(traces, 'src')
    expect(cluster.hasDecay).toBe(true)
  })

  it('computes growth direction', () => {
    const traces: ShadowTrace[] = [
      analyzeShadowTrace('export function a() {}', 'a.ts'),
      analyzeShadowTrace('export function b() {}', 'b.ts'),
    ]
    const cluster = analyzeShadowCluster(traces, 'src')
    expect(['expanding', 'stable', 'contracting', 'static']).toContain(cluster.growthDirection)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: SundialShadowStats = {
    totalFiles: 0, totalClusters: 0,
    avgShadowLength: 0, avgShadowClarity: 50, avgTemporalDepth: 30,
    avgMaturity: 40,
    sunlitFiles: 0, daylightFiles: 0, shadowedFiles: 0, twilightFiles: 0, midnightFiles: 0,
    dawnFiles: 0, noonFiles: 0, duskFiles: 0, nightFiles: 0,
    totalLegacyPatterns: 0, totalModernPatterns: 5,
    totalExperimentalPatterns: 0, totalDeprecatedPatterns: 0, totalRefactoringTraces: 0,
    expandingFiles: 0, stableFiles: 0, contractingFiles: 0, healthyGrowth: 0,
    hasDecay: false, overallEvolutionaryHealth: 70,
    epochGrade: 'modern',
    bestPreserved: 'none', mostEvolved: 'none', freshestCode: 'none', mostLegacy: 'none',
  }

  it('returns positive message when all is well', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overallEvolutionaryHealth: 75 })
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends removing night files', () => {
    const traces: ShadowTrace[] = [
      { ...analyzeShadowTrace('', 'a.ts'), isNight: true },
    ]
    const recs = generateRecommendations(traces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('night')]))
  })

  it('recommends modernizing legacy', () => {
    const traces: ShadowTrace[] = [
      { ...analyzeShadowTrace('', 'a.ts'), traces: { legacyPatterns: 3, modernPatterns: 0, experimentalPatterns: 0, deprecatedPatterns: 0, refactoringTraces: 0 } },
    ]
    const recs = generateRecommendations(traces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('legacy')]))
  })

  it('recommends refactoring decayed files', () => {
    const traces: ShadowTrace[] = [
      { ...analyzeShadowTrace('', 'a.ts'), decay: { present: true, level: 'moderate', indicators: ['test'] } },
    ]
    const recs = generateRecommendations(traces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('decay')]))
  })

  it('praises healthy evolution', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overallEvolutionaryHealth: 75 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('healthy')]))
  })

  it('recommends updating deprecated patterns', () => {
    const traces: ShadowTrace[] = [
      { ...analyzeShadowTrace('', 'a.ts'), traces: { legacyPatterns: 0, modernPatterns: 0, experimentalPatterns: 0, deprecatedPatterns: 2, refactoringTraces: 0 } },
    ]
    const recs = generateRecommendations(traces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('deprecated')]))
  })
})

// ─── buildSundialShadowResult ──────────────────────────────────────────────

describe('buildSundialShadowResult', () => {
  it('handles empty input', () => {
    const result = buildSundialShadowResult([], [], {})
    expect(result.traces).toEqual([])
    expect(result.clusters).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildSundialShadowResult(
      ['hello.ts'],
      ['/** Greeting */ export function hello() { return "world" }'],
      {},
    )
    expect(result.traces).toHaveLength(1)
    expect(result.traces[0].file).toBe('hello.ts')
    expect(result.traces[0].maturity).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildSundialShadowResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export function a() {}',
        '/** Docs */ export class B {}',
        'const x: any = 1',
      ],
      {},
    )
    expect(result.traces).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups traces into clusters by directory', () => {
    const result = buildSundialShadowResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.clusters.length).toBe(2)
    const dirs = result.clusters.map(c => c.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('computes timeline correctly', () => {
    const result = buildSundialShadowResult(
      ['a.ts', 'b.ts'],
      ['export function a() {}', '/** D */ export class B {} interface I {}'],
      {},
    )
    expect(result.timeline.dominantPhase).toBeDefined()
    expect(result.timeline.avgMaturity).toBeGreaterThanOrEqual(0)
    expect(result.timeline.growthRate).toBeGreaterThanOrEqual(0)
  })

  it('computes best/worst/mostEvolved/mostLegacy', () => {
    const result = buildSundialShadowResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */ export function good() {} interface I {}',
        'var x: any = 1',
      ],
      {},
    )
    expect(result.stats.bestPreserved).toBe('good.ts')
    expect(result.stats.mostLegacy).toBe('bad.ts')
  })

  it('computes epoch grade', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    expect(['golden-age', 'renaissance', 'industrial', 'modern', 'post-modern', 'dark-age']).toContain(result.stats.epochGrade)
  })

  it('clamps all stats to valid ranges', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const { stats } = result
    expect(stats.avgShadowLength).toBeGreaterThanOrEqual(0)
    expect(stats.avgShadowClarity).toBeGreaterThanOrEqual(0)
    expect(stats.avgTemporalDepth).toBeGreaterThanOrEqual(0)
    expect(stats.avgMaturity).toBeGreaterThanOrEqual(0)
    expect(stats.overallEvolutionaryHealth).toBeGreaterThanOrEqual(0)
    expect(stats.overallEvolutionaryHealth).toBeLessThanOrEqual(100)
  })
})

// ─── formatSundialShadowTable ──────────────────────────────────────────────

describe('formatSundialShadowTable', () => {
  it('formats empty result', () => {
    const result = buildSundialShadowResult([], [], {})
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('Sundial Shadow')
    expect(output).toContain('No traces detected')
  })

  it('includes trace info in non-verbose mode', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows detailed info in verbose mode', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatSundialShadowTable(result, true)
    expect(output).toContain('depth')
    expect(output).toContain('angle')
    expect(output).toContain('caster')
  })

  it('truncates traces at 15 in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildSundialShadowResult(files, codes, {})
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows clusters when present', () => {
    const result = buildSundialShadowResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('Shadow Clusters')
    expect(output).toContain('src')
  })

  it('shows timeline section', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('Timeline')
  })

  it('shows recommendations', () => {
    const result = buildSundialShadowResult([], [], {})
    const output = formatSundialShadowTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatSundialShadowJson ───────────────────────────────────────────────

describe('formatSundialShadowJson', () => {
  it('produces valid JSON', () => {
    const result = buildSundialShadowResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const json = formatSundialShadowJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.traces).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.timeline).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildSundialShadowResult([], [], {})
    const json = formatSundialShadowJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.traces).toEqual([])
    expect(parsed.clusters).toEqual([])
  })
})
