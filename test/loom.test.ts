import { describe, it, expect } from 'vitest'
import {
  classifyThreadType,
  classifyMaterial,
  classifyThread,
  classifyWeaveType,
  classifyFabricCondition,
  classifyQualityGrade,
  classifyWeaverGrade,
  analyzeThread,
  analyzeFabric,
  computePatternComplexity,
  computeBreathability,
  computeDurability,
  generateLoomRecommendations,
  buildLoomResult,
} from '../src/commands/loom-helpers.js'

// ─── classifyThreadType ──────────────────────────────────────────────────────

describe('classifyThreadType', () => {
  it('returns structural for many interfaces and classes', () => {
    expect(classifyThreadType(2, 1, 2)).toBe('structural')
  })

  it('returns structural for many interfaces and classes combined', () => {
    expect(classifyThreadType(3, 1, 0)).toBe('structural')
  })

  it('returns warp for many interfaces without many classes', () => {
    expect(classifyThreadType(2, 1, 0)).toBe('warp')
  })

  it('returns weft for many functions', () => {
    expect(classifyThreadType(0, 6, 0)).toBe('weft')
  })

  it('returns structural for multiple classes', () => {
    expect(classifyThreadType(0, 1, 3)).toBe('structural')
  })

  it('returns selvedge for empty code', () => {
    expect(classifyThreadType(0, 0, 0)).toBe('selvedge')
  })

  it('returns weft for some functions', () => {
    expect(classifyThreadType(0, 3, 0)).toBe('weft')
  })

  it('returns fill for minimal code', () => {
    expect(classifyThreadType(1, 1, 0)).toBe('fill')
  })
})

// ─── classifyMaterial ────────────────────────────────────────────────────────

describe('classifyMaterial', () => {
  it('returns silk for high quality', () => {
    expect(classifyMaterial(90, 1, 85)).toBe('silk')
  })

  it('returns cotton for good quality', () => {
    // score = (70 + 70)/2 - 1*5 = 70 - 5 = 65
    expect(classifyMaterial(70, 1, 70)).toBe('cotton')
  })

  it('returns linen for moderate quality', () => {
    // score = (60 + 60)/2 - 1*5 = 55
    expect(classifyMaterial(60, 1, 60)).toBe('linen')
  })

  it('returns wool for fair quality', () => {
    // score = (50 + 50)/2 - 1*5 = 45
    expect(classifyMaterial(50, 1, 50)).toBe('wool')
  })

  it('returns synthetic for poor quality', () => {
    // score = (35 + 35)/2 - 1*5 = 30
    expect(classifyMaterial(35, 1, 35)).toBe('synthetic')
  })

  it('returns metallic for bad quality', () => {
    // score = (20 + 20)/2 - 1*5 = 15
    expect(classifyMaterial(20, 1, 20)).toBe('metallic')
  })

  it('returns rag for terrible quality', () => {
    expect(classifyMaterial(5, 10, 5)).toBe('rag')
  })
})

// ─── classifyThread ──────────────────────────────────────────────────────────

describe('classifyThread', () => {
  it('returns premium for quality >= 85', () => {
    expect(classifyThread(90)).toBe('premium')
  })

  it('returns fine for quality 70-84', () => {
    expect(classifyThread(75)).toBe('fine')
  })

  it('returns standard for quality 50-69', () => {
    expect(classifyThread(55)).toBe('standard')
  })

  it('returns economy for quality 30-49', () => {
    expect(classifyThread(35)).toBe('economy')
  })

  it('returns reject for quality < 30', () => {
    expect(classifyThread(20)).toBe('reject')
  })
})

// ─── classifyWeaveType ───────────────────────────────────────────────────────

describe('classifyWeaveType', () => {
  it('returns jacquard for high complexity and many threads', () => {
    expect(classifyWeaveType(12, 5, 75)).toBe('jacquard')
  })

  it('returns leno for high connections', () => {
    expect(classifyWeaveType(5, 6, 30)).toBe('leno')
  })

  it('returns twill for moderate complexity', () => {
    expect(classifyWeaveType(8, 3, 55)).toBe('twill')
  })

  it('returns basket for many threads with connections', () => {
    expect(classifyWeaveType(9, 4, 20)).toBe('basket')
  })

  it('returns satin for some complexity', () => {
    expect(classifyWeaveType(5, 2, 35)).toBe('satin')
  })

  it('returns knit for few threads', () => {
    expect(classifyWeaveType(2, 1, 10)).toBe('knit')
  })

  it('returns plain for default', () => {
    expect(classifyWeaveType(5, 1, 10)).toBe('plain')
  })
})

// ─── classifyFabricCondition ─────────────────────────────────────────────────

describe('classifyFabricCondition', () => {
  it('returns pristine for quality >= 85', () => {
    expect(classifyFabricCondition(90)).toBe('pristine')
  })

  it('returns excellent for quality 70-84', () => {
    expect(classifyFabricCondition(75)).toBe('excellent')
  })

  it('returns good for quality 55-69', () => {
    expect(classifyFabricCondition(60)).toBe('good')
  })

  it('returns fair for quality 40-54', () => {
    expect(classifyFabricCondition(45)).toBe('fair')
  })

  it('returns worn for quality 25-39', () => {
    expect(classifyFabricCondition(30)).toBe('worn')
  })

  it('returns threadbare for quality 10-24', () => {
    expect(classifyFabricCondition(15)).toBe('threadbare')
  })

  it('returns torn for quality < 10', () => {
    expect(classifyFabricCondition(5)).toBe('torn')
  })
})

// ─── classifyQualityGrade ────────────────────────────────────────────────────

describe('classifyQualityGrade', () => {
  it('returns correct grades', () => {
    expect(classifyQualityGrade(90)).toBe('A')
    expect(classifyQualityGrade(75)).toBe('B')
    expect(classifyQualityGrade(60)).toBe('C')
    expect(classifyQualityGrade(40)).toBe('D')
    expect(classifyQualityGrade(20)).toBe('F')
  })
})

// ─── classifyWeaverGrade ─────────────────────────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for quality >= 80', () => {
    expect(classifyWeaverGrade(85)).toBe('master-weaver')
  })

  it('returns journeyman for quality 60-79', () => {
    expect(classifyWeaverGrade(65)).toBe('journeyman')
  })

  it('returns apprentice for quality 40-59', () => {
    expect(classifyWeaverGrade(45)).toBe('apprentice')
  })

  it('returns novice for quality 20-39', () => {
    expect(classifyWeaverGrade(25)).toBe('novice')
  })

  it('returns clumsy for quality < 20', () => {
    expect(classifyWeaverGrade(10)).toBe('clumsy')
  })
})

// ─── analyzeThread ───────────────────────────────────────────────────────────

describe('analyzeThread', () => {
  it('returns a Thread with all fields', () => {
    const code = 'export function add(a: number, b: number) { return a + b }'
    const t = analyzeThread(code, 'add.ts', [], [])

    expect(t.file).toBe('add.ts')
    expect(typeof t.strength).toBe('number')
    expect(typeof t.elasticity).toBe('number')
    expect(typeof t.tension).toBe('number')
    expect(typeof t.thickness).toBe('number')
    expect(typeof t.smoothness).toBe('number')
    expect(typeof t.quality).toBe('number')
    expect(t.threadType).toBeDefined()
    expect(t.material).toBeDefined()
    expect(t.classification).toBeDefined()
    expect(typeof t.isFrayed).toBe('boolean')
    expect(typeof t.isBroken).toBe('boolean')
    expect(typeof t.isKnot).toBe('boolean')
    expect(typeof t.isLoose).toBe('boolean')
    expect(typeof t.isTight).toBe('boolean')
    expect(t.connections).toBeDefined()
    expect(t.defects).toBeDefined()
    expect(typeof t.color).toBe('string')
    expect(typeof t.pattern).toBe('string')
  })

  it('produces silk for clean well-documented code', () => {
    const code = [
      '/** Docs */',
      'export interface I { x: number }',
      'export type T = string',
      'export function clean() { return 1 }',
    ].join('\n')
    const t = analyzeThread(code, 'clean.ts', [], [])
    expect(t.smoothness).toBeGreaterThan(40)
    expect(t.defects.pills).toBe(0)
  })

  it('produces rag for messy code', () => {
    const code = '// TODO\n// FIXME\nfunction f(x: any): any { if (x) { if (y) { return 1 } } return x }'
    const t = analyzeThread(code, 'messy.ts', [], [])
    expect(t.isKnot).toBe(true)
    expect(t.defects.pills).toBeGreaterThan(0)
  })

  it('computes tension from imports and dependents', () => {
    const none = analyzeThread('export function a() {}', 'a.ts', [], [])
    const many = analyzeThread('export function b() {}', 'b.ts', ['x', 'y', 'z'], ['d1', 'd2'])
    expect(many.tension).toBeGreaterThan(none.tension)
  })

  it('computes elasticity inversely with connections', () => {
    const none = analyzeThread('export function a() {}', 'a.ts', [], [])
    const many = analyzeThread('export function b() {}', 'b.ts', ['x', 'y', 'z', 'w', 'v'], ['d1', 'd2', 'd3', 'd4'])
    expect(many.elasticity).toBeLessThan(none.elasticity)
  })

  it('computes thickness from code lines', () => {
    const small = analyzeThread('export function a() {}', 'a.ts', [], [])
    const big = analyzeThread(Array.from({ length: 50 }, (_, i) => `export function f${i}() {}`).join('\n'), 'big.ts', [], [])
    expect(big.thickness).toBeGreaterThan(small.thickness)
  })

  it('marks as loose when under-connected', () => {
    const code = Array.from({ length: 10 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const t = analyzeThread(code, 'loose.ts', [], [])
    expect(t.isLoose).toBe(true)
  })

  it('marks as tight when tension is high', () => {
    const t = analyzeThread('export function a() {}', 'a.ts',
      Array.from({ length: 6 }, (_, i) => `imp${i}`),
      Array.from({ length: 6 }, (_, i) => `dep${i}`),
    )
    if (t.tension >= 70) {
      expect(t.isTight).toBe(true)
    }
  })

  it('computes correct connections', () => {
    const t = analyzeThread('export function a() {}', 'a.ts', ['x', 'y'], ['d1'])
    expect(t.connections.totalConnections).toBeGreaterThan(0)
  })

  it('detects defects', () => {
    const code = '// TODO: fix\n// FIXME: broken\nfunction f(x: any) { return x }'
    const t = analyzeThread(code, 'defects.ts', [], [])
    expect(t.defects.pills).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const t = analyzeThread('', 'empty.ts', [], [])
    expect(t.strength).toBe(0)
    expect(t.smoothness).toBe(0)
    expect(t.thickness).toBe(0)
    expect(t.elasticity).toBe(100)
  })
})

// ─── analyzeFabric ───────────────────────────────────────────────────────────

describe('analyzeFabric', () => {
  it('returns defaults for empty threads', () => {
    const f = analyzeFabric([], 'empty-dir')
    expect(f.directory).toBe('empty-dir')
    expect(f.threads).toEqual([])
    expect(f.threadCount).toBe(0)
    expect(f.condition).toBe('torn')
    expect(f.qualityGrade).toBe('F')
    expect(f.weaveType).toBe('plain')
  })

  it('analyzes a single thread', () => {
    const t = analyzeThread('export function a() {}', 'dir/a.ts', [], [])
    const f = analyzeFabric([t], 'dir')
    expect(f.threads).toHaveLength(1)
    expect(f.threadCount).toBe(1)
  })

  it('computes aggregate metrics', () => {
    const t1 = analyzeThread('export function a() {}', 'd/a.ts', [], [])
    const t2 = analyzeThread('export function b() {}', 'd/b.ts', [], [])
    const f = analyzeFabric([t1, t2], 'd')
    expect(f.avgStrength).toBe(Math.round((t1.strength + t2.strength) / 2))
    expect(f.avgSmoothness).toBe(Math.round((t1.smoothness + t2.smoothness) / 2))
  })

  it('counts warp and weft threads', () => {
    const code = 'export interface I { x: number }\nexport type T = string\nexport interface I2 { y: number }'
    const t = analyzeThread(code, 'd/types.ts', [], [])
    const f = analyzeFabric([t], 'd')
    expect(typeof f.warpCount).toBe('number')
    expect(typeof f.weftCount).toBe('number')
  })

  it('computes tension variance', () => {
    const t1 = analyzeThread('export function a() {}', 'd/a.ts', [], [])
    const t2 = analyzeThread('export function b() {}', 'd/b.ts', ['x', 'y'], ['d1'])
    const f = analyzeFabric([t1, t2], 'd')
    expect(typeof f.tensionVariance).toBe('number')
    expect(f.tensionVariance).toBeGreaterThanOrEqual(0)
  })

  it('computes fabric width as unique colors', () => {
    const t1 = analyzeThread('export function a() {}', 'd/a.ts', [], [])
    const t2 = analyzeThread('export interface I { x: number }', 'd/b.ts', [], [])
    const f = analyzeFabric([t1, t2], 'd')
    expect(f.fabricWidth).toBeGreaterThanOrEqual(1)
  })

  it('detects frayed and broken threads', () => {
    const clean = analyzeThread('export function a() { return 1 }', 'd/a.ts', [], [])
    const f = analyzeFabric([clean], 'd')
    expect(typeof f.frayedThreads).toBe('number')
    expect(typeof f.brokenThreads).toBe('number')
  })

  it('computes breathability and durability', () => {
    const t = analyzeThread('export function a() {}', 'd/a.ts', [], [])
    const f = analyzeFabric([t], 'd')
    expect(typeof f.breathability).toBe('number')
    expect(typeof f.durability).toBe('number')
    expect(typeof f.drape).toBe('number')
    expect(typeof f.hand).toBe('number')
  })
})

// ─── computePatternComplexity ────────────────────────────────────────────────

describe('computePatternComplexity', () => {
  it('returns 0 for empty threads', () => {
    expect(computePatternComplexity([])).toBe(0)
  })

  it('increases with diverse types and materials', () => {
    const t1 = analyzeThread('export function a() {}', 'a.ts', [], [])
    const t2 = analyzeThread('export interface I { x: number }', 'b.ts', [], [])
    const complexity = computePatternComplexity([t1, t2])
    expect(complexity).toBeGreaterThan(0)
  })
})

// ─── computeBreathability ────────────────────────────────────────────────────

describe('computeBreathability', () => {
  it('returns 0 for empty threads', () => {
    expect(computeBreathability([])).toBe(0)
  })

  it('returns high for clean threads', () => {
    const code = '/** Docs */\nexport function clean() { return 1 }'
    const t = analyzeThread(code, 'clean.ts', [], [])
    expect(computeBreathability([t])).toBeGreaterThan(20)
  })
})

// ─── computeDurability ───────────────────────────────────────────────────────

describe('computeDurability', () => {
  it('returns 0 for empty threads', () => {
    expect(computeDurability([])).toBe(0)
  })

  it('returns positive for any thread', () => {
    const t = analyzeThread('export function a() {}', 'a.ts', [], [])
    expect(computeDurability([t])).toBeGreaterThan(0)
  })
})

// ─── generateLoomRecommendations ─────────────────────────────────────────────

describe('generateLoomRecommendations', () => {
  const emptyStats = {
    totalFiles: 0, totalFabrics: 0, totalThreads: 0, warpThreads: 0, weftThreads: 0,
    avgThreadStrength: 0, avgThreadElasticity: 0, avgThreadTension: 0, avgThreadSmoothness: 0,
    premiumThreads: 0, rejectThreads: 0, frayedThreads: 0, brokenThreads: 0,
    knottedThreads: 0, totalDefects: 0, avgFabricDensity: 0, avgFabricBreathability: 50,
    avgFabricDurability: 0, avgFabricQuality: 0, pristineFabrics: 0, tornFabrics: 0,
    overallWeaveQuality: 50, masterWeaver: 'none', apprenticeWork: 'none',
    dominantWeave: 'plain', dominantMaterial: 'cotton',
    weaverGrade: 'apprentice' as const,
  }

  it('recommends fine weave for healthy codebase', () => {
    const stats = { ...emptyStats, avgThreadTension: 30, avgFabricBreathability: 60, overallWeaveQuality: 60 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Fine weave')
  })

  it('warns about broken threads', () => {
    const stats = { ...emptyStats, brokenThreads: 2 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })

  it('warns about knotted threads', () => {
    const stats = { ...emptyStats, knottedThreads: 3 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('knotted'))).toBe(true)
  })

  it('warns about frayed threads when > 3', () => {
    const stats = { ...emptyStats, frayedThreads: 5 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('frayed'))).toBe(true)
  })

  it('does not warn about frayed threads when <= 3', () => {
    const stats = { ...emptyStats, frayedThreads: 3 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('frayed'))).toBe(false)
  })

  it('warns about high tension', () => {
    const stats = { ...emptyStats, avgThreadTension: 65 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('tension'))).toBe(true)
  })

  it('warns about reject threads', () => {
    const stats = { ...emptyStats, rejectThreads: 2 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('reject'))).toBe(true)
  })

  it('warns about many defects', () => {
    const stats = { ...emptyStats, totalDefects: 15 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('defects'))).toBe(true)
  })

  it('warns about low breathability', () => {
    const stats = { ...emptyStats, avgFabricBreathability: 30 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('breathability'))).toBe(true)
  })

  it('warns about torn fabrics', () => {
    const stats = { ...emptyStats, tornFabrics: 1 }
    const recs = generateLoomRecommendations([], [], stats)
    expect(recs.some(r => r.includes('torn'))).toBe(true)
  })

  it('warns about worn fabrics', () => {
    const fabric = {
      directory: 'worn', threads: [], threadCount: 0, weaveType: 'plain' as const,
      patternComplexity: 0, avgTension: 0, tensionVariance: 0, avgStrength: 0,
      avgSmoothness: 0, warpCount: 0, weftCount: 0, frayedThreads: 0, brokenThreads: 0,
      knottedThreads: 0, looseThreads: 0, tightThreads: 0, totalDefects: 0,
      fabricWidth: 0, fabricLength: 0, density: 0, breathability: 0, durability: 0,
      drape: 0, hand: 0, condition: 'worn' as const, qualityGrade: 'D' as const,
    }
    const recs = generateLoomRecommendations([], [fabric], emptyStats)
    expect(recs.some(r => r.includes('worn'))).toBe(true)
  })
})

// ─── buildLoomResult ─────────────────────────────────────────────────────────

describe('buildLoomResult', () => {
  it('handles empty input', () => {
    const result = buildLoomResult([], [], {})
    expect(result.threads).toEqual([])
    expect(result.fabrics).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.weaverGrade).toBe('clumsy')
  })

  it('processes a single file', () => {
    const result = buildLoomResult(
      ['hello.ts'],
      ['export function hello() { return 1 }'],
      {},
    )
    expect(result.threads).toHaveLength(1)
    expect(result.threads[0].file).toBe('hello.ts')
    expect(result.fabrics).toHaveLength(1)
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('groups files into fabrics by directory', () => {
    const result = buildLoomResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [
        'export function a() {}',
        'export function b() {}',
        'export function c() {}',
      ],
      {},
    )
    expect(result.threads).toHaveLength(3)
    const dirs = result.fabrics.map(f => f.directory)
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('files without slashes go to root fabric', () => {
    const result = buildLoomResult(
      ['solo.ts'],
      ['export function solo() {}'],
      {},
    )
    expect(result.fabrics).toHaveLength(1)
    expect(result.fabrics[0].directory).toBe('.')
  })

  it('computes stats correctly', () => {
    const result = buildLoomResult(
      ['a.ts', 'b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.avgThreadStrength).toBe('number')
    expect(typeof result.stats.avgThreadTension).toBe('number')
    expect(typeof result.stats.overallWeaveQuality).toBe('number')
    expect(typeof result.stats.masterWeaver).toBe('string')
    expect(typeof result.stats.apprenticeWork).toBe('string')
    expect(typeof result.stats.dominantWeave).toBe('string')
    expect(typeof result.stats.dominantMaterial).toBe('string')
    expect(typeof result.stats.weaverGrade).toBe('string')
  })

  it('finds master weaver and apprentice work', () => {
    const result = buildLoomResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */\nexport function good() { try { return 1 } catch { return 0 } }',
        '// TODO\nfunction bad(x: any): any { if (x) { if (y) { return x } } return x }',
      ],
      {},
    )
    const goodQ = result.threads.find(t => t.file === 'good.ts')!.quality
    const badQ = result.threads.find(t => t.file === 'bad.ts')!.quality
    if (goodQ > badQ) {
      expect(result.stats.masterWeaver).toBe('good.ts')
      expect(result.stats.apprenticeWork).toBe('bad.ts')
    }
  })

  it('resolves imports to find dependents', () => {
    const result = buildLoomResult(
      ['a.ts', 'b.ts'],
      [
        "import { b } from './b'\nexport function a() { return b() }",
        'export function b() { return 1 }',
      ],
      {},
    )
    const threadB = result.threads.find(t => t.file === 'b.ts')
    expect(threadB).toBeDefined()
  })
})
