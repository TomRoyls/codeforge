import { describe, it, expect } from 'vitest'
import {
  detectPorosity,
  detectSlag,
  detectShrinkage,
  detectColdShuts,
  detectHotTears,
  detectMisruns,
  detectInclusions,
  detectSurfaceDefects,
  classifyMetalType,
  classifyCastingMethod,
  classifyHeatTreatment,
  classifyGrade,
  classifyFoundryGrade,
  analyzeCastPiece,
  analyzeFoundryBatch,
  generateFoundryRecommendations,
  buildFoundryResult,
  type FoundryStats,
} from '../src/commands/foundry-helpers.js'
import { formatFoundryTable, formatFoundryJson } from '../src/commands/foundry-format-helpers.js'

// ─── detectPorosity ──────────────────────────────────────────────────────────

describe('detectPorosity', () => {
  it('detects empty blocks', () => {
    expect(detectPorosity('function empty() { }')).toBe(1)
  })

  it('returns 0 for solid code', () => {
    expect(detectPorosity('const x = 1\nconst y = 2')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectPorosity('')).toBe(0)
  })

  it('detects stubs', () => {
    expect(detectPorosity('// stub implementation')).toBe(1)
  })

  it('detects placeholders', () => {
    expect(detectPorosity('// placeholder for later')).toBe(1)
  })
})

// ─── detectSlag ──────────────────────────────────────────────────────────────

describe('detectSlag', () => {
  it('detects var usage', () => {
    expect(detectSlag('var x = 1')).toBe(1)
  })

  it('detects console calls', () => {
    expect(detectSlag('console.log("debug")')).toBe(1)
  })

  it('detects debugger statement', () => {
    expect(detectSlag('debugger')).toBe(1)
  })

  it('detects any types', () => {
    expect(detectSlag('function f(x: any): any { return x }')).toBe(2)
  })

  it('returns 0 for clean code', () => {
    expect(detectSlag('const x: number = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectSlag('')).toBe(0)
  })
})

// ─── detectShrinkage ─────────────────────────────────────────────────────────

describe('detectShrinkage', () => {
  it('detects TODO markers', () => {
    expect(detectShrinkage('// TODO implement this')).toBe(1)
  })

  it('detects FIXME markers', () => {
    expect(detectShrinkage('// FIXME broken')).toBe(1)
  })

  it('detects HACK markers', () => {
    expect(detectShrinkage('// HACK workaround')).toBe(1)
  })

  it('returns 0 for clean code', () => {
    expect(detectShrinkage('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectShrinkage('')).toBe(0)
  })
})

// ─── detectColdShuts ─────────────────────────────────────────────────────────

describe('detectColdShuts', () => {
  it('detects many returns', () => {
    const code = 'function a() { return 1 }\nfunction b() { return 2 }\nfunction c() { return 3 }\nfunction d() { return 4 }'
    expect(detectColdShuts(code)).toBeGreaterThanOrEqual(1)
  })

  it('detects try without catch', () => {
    expect(detectColdShuts('try { x() }')).toBeGreaterThanOrEqual(1)
  })

  it('returns 0 for clean code', () => {
    expect(detectColdShuts('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectColdShuts('')).toBe(0)
  })
})

// ─── detectHotTears ──────────────────────────────────────────────────────────

describe('detectHotTears', () => {
  it('detects loose equality', () => {
    expect(detectHotTears('if (x == null)')).toBe(1)
  })

  it('detects loose inequality', () => {
    expect(detectHotTears('if (x != undefined)')).toBe(1)
  })

  it('detects nested ternary', () => {
    expect(detectHotTears('const x = a ? b ? c : d : e')).toBe(1)
  })

  it('returns 0 for clean code', () => {
    expect(detectHotTears('const x = a === b')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectHotTears('')).toBe(0)
  })
})

// ─── detectMisruns ───────────────────────────────────────────────────────────

describe('detectMisruns', () => {
  it('detects exported empty functions', () => {
    expect(detectMisruns('export function empty() { }')).toBe(1)
  })

  it('returns 0 for implemented functions', () => {
    expect(detectMisruns('export function add(a: number, b: number) { return a + b }')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectMisruns('')).toBe(0)
  })
})

// ─── detectInclusions ────────────────────────────────────────────────────────

describe('detectInclusions', () => {
  it('detects this outside class', () => {
    expect(detectInclusions('function Foo() { this.x = 1 }')).toBe(1)
  })

  it('detects prototype usage', () => {
    expect(detectInclusions('Foo.prototype.bar = function() {}')).toBe(1)
  })

  it('detects require calls', () => {
    expect(detectInclusions("const fs = require('fs')")).toBe(1)
  })

  it('detects eval usage', () => {
    expect(detectInclusions('eval("x + 1")')).toBe(1)
  })

  it('returns 0 for clean code', () => {
    expect(detectInclusions('export function clean() { return 1 }')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectInclusions('')).toBe(0)
  })
})

// ─── detectSurfaceDefects ────────────────────────────────────────────────────

describe('detectSurfaceDefects', () => {
  it('returns 0 for clean content', () => {
    expect(detectSurfaceDefects('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectSurfaceDefects('')).toBe(0)
  })

  it('detects double semicolons', () => {
    expect(detectSurfaceDefects('const x = 1;;')).toBe(1)
  })
})

// ─── classifyMetalType ───────────────────────────────────────────────────────

describe('classifyMetalType', () => {
  it('returns titanium for top properties', () => {
    expect(classifyMetalType({ hardness: 90, ductility: 80, toughness: 85, malleability: 80, conductivity: 70, magnetism: 30 })).toBe('titanium')
  })

  it('returns steel for good properties', () => {
    expect(classifyMetalType({ hardness: 75, ductility: 70, toughness: 70, malleability: 50, conductivity: 50, magnetism: 40 })).toBe('steel')
  })

  it('returns lead for poor properties', () => {
    expect(classifyMetalType({ hardness: 10, ductility: 10, toughness: 10, malleability: 10, conductivity: 10, magnetism: 10 })).toBe('lead')
  })

  it('returns bronze for moderate ductile', () => {
    expect(classifyMetalType({ hardness: 45, ductility: 55, toughness: 50, malleability: 40, conductivity: 40, magnetism: 20 })).toBe('bronze')
  })

  it('returns tin for low properties', () => {
    expect(classifyMetalType({ hardness: 25, ductility: 20, toughness: 25, malleability: 30, conductivity: 20, magnetism: 10 })).toBe('tin')
  })
})

// ─── classifyCastingMethod ───────────────────────────────────────────────────

describe('classifyCastingMethod', () => {
  it('returns hand-poured for empty content', () => {
    expect(classifyCastingMethod('')).toBe('hand-poured')
  })

  it('returns die-cast for well-documented precise code', () => {
    const code = '/** doc */\nexport interface I { x: number }\n/** doc */\nexport function f(): number { return 1 }'
    expect(classifyCastingMethod(code)).toBe('die-cast')
  })

  it('returns continuous for basic exports without any', () => {
    expect(classifyCastingMethod('export function a() { return 1 }')).toBe('continuous')
  })
})

// ─── classifyHeatTreatment ───────────────────────────────────────────────────

describe('classifyHeatTreatment', () => {
  it('returns annealed for high quality no defects', () => {
    expect(classifyHeatTreatment({
      qualityScore: 90,
      defects: { porosity: 0, slag: 0, shrinkage: 0, coldShuts: 0, hotTears: 0, misruns: 0, inclusions: 0, surfaceDefects: 0 },
    })).toBe('annealed')
  })

  it('returns normalized for good quality few defects', () => {
    expect(classifyHeatTreatment({
      qualityScore: 65,
      defects: { porosity: 1, slag: 0, shrinkage: 0, coldShuts: 0, hotTears: 0, misruns: 0, inclusions: 0, surfaceDefects: 0 },
    })).toBe('normalized')
  })

  it('returns tempered for moderate quality', () => {
    expect(classifyHeatTreatment({
      qualityScore: 45,
      defects: { porosity: 2, slag: 1, shrinkage: 1, coldShuts: 0, hotTears: 0, misruns: 0, inclusions: 0, surfaceDefects: 0 },
    })).toBe('tempered')
  })

  it('returns quenched for low quality', () => {
    expect(classifyHeatTreatment({
      qualityScore: 25,
      defects: { porosity: 5, slag: 3, shrinkage: 2, coldShuts: 1, hotTears: 1, misruns: 1, inclusions: 1, surfaceDefects: 1 },
    })).toBe('quenched')
  })

  it('returns untreated for very low quality', () => {
    expect(classifyHeatTreatment({
      qualityScore: 10,
      defects: { porosity: 5, slag: 3, shrinkage: 2, coldShuts: 1, hotTears: 1, misruns: 1, inclusions: 1, surfaceDefects: 1 },
    })).toBe('untreated')
  })
})

// ─── classifyGrade ───────────────────────────────────────────────────────────

describe('classifyGrade', () => {
  it('returns aerospace for high score', () => {
    expect(classifyGrade(90)).toBe('aerospace')
  })

  it('returns industrial for good score', () => {
    expect(classifyGrade(65)).toBe('industrial')
  })

  it('returns commercial for moderate score', () => {
    expect(classifyGrade(45)).toBe('commercial')
  })

  it('returns scrap for low score', () => {
    expect(classifyGrade(25)).toBe('scrap')
  })

  it('returns slag for very low score', () => {
    expect(classifyGrade(10)).toBe('slag')
  })

  it('handles boundary at 80', () => {
    expect(classifyGrade(80)).toBe('aerospace')
  })

  it('handles boundary at 60', () => {
    expect(classifyGrade(60)).toBe('industrial')
  })

  it('handles boundary at 40', () => {
    expect(classifyGrade(40)).toBe('commercial')
  })

  it('handles boundary at 20', () => {
    expect(classifyGrade(20)).toBe('scrap')
  })

  it('handles zero', () => {
    expect(classifyGrade(0)).toBe('slag')
  })
})

// ─── classifyFoundryGrade ────────────────────────────────────────────────────

describe('classifyFoundryGrade', () => {
  it('returns world-class for high quality', () => {
    expect(classifyFoundryGrade(90)).toBe('world-class')
  })

  it('returns certified for good quality', () => {
    expect(classifyFoundryGrade(65)).toBe('certified')
  })

  it('returns standard for moderate quality', () => {
    expect(classifyFoundryGrade(45)).toBe('standard')
  })

  it('returns substandard for low quality', () => {
    expect(classifyFoundryGrade(25)).toBe('substandard')
  })

  it('returns condemned for very low quality', () => {
    expect(classifyFoundryGrade(10)).toBe('condemned')
  })
})

// ─── analyzeCastPiece ────────────────────────────────────────────────────────

describe('analyzeCastPiece', () => {
  it('returns correct structure for well-crafted code', () => {
    const code = '/** Add two numbers */\nexport function add(a: number, b: number): number { return a + b }\nexport interface Calc { add: (a: number, b: number) => number }'
    const result = analyzeCastPiece(code, 'calc.ts')

    expect(result.file).toBe('calc.ts')
    expect(result.meltingPoint).toBeGreaterThanOrEqual(0)
    expect(result.meltingPoint).toBeLessThanOrEqual(100)
    expect(result.moldQuality).toBeGreaterThanOrEqual(0)
    expect(result.castingPrecision).toBeGreaterThanOrEqual(0)
    expect(result.alloyComposition).toBeGreaterThanOrEqual(0)
    expect(result.finishingQuality).toBeGreaterThanOrEqual(0)
    expect(result.structuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(result.weight).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(result.issues)).toBe(true)
    expect(Array.isArray(result.strengths)).toBe(true)
  })

  it('returns low scores for empty content', () => {
    const result = analyzeCastPiece('', 'empty.ts')
    expect(result.meltingPoint).toBe(0)
    expect(result.moldQuality).toBe(0)
    expect(result.castingPrecision).toBe(0)
    expect(result.weight).toBe(0)
    expect(result.grade).toBe('slag')
  })

  it('detects any types as slag', () => {
    const code = 'export function bad(x: any): any { return x }'
    const result = analyzeCastPiece(code, 'bad.ts')
    expect(result.defects.slag).toBeGreaterThan(0)
  })

  it('detects TODO as shrinkage', () => {
    const code = 'export function todo() { // TODO fix this\n return 1 }'
    const result = analyzeCastPiece(code, 'todo.ts')
    expect(result.defects.shrinkage).toBeGreaterThan(0)
  })

  it('computes material properties', () => {
    const code = 'export function a() {}'
    const result = analyzeCastPiece(code, 'props.ts')
    expect(result.properties.hardness).toBeGreaterThanOrEqual(0)
    expect(result.properties.ductility).toBeGreaterThanOrEqual(0)
    expect(result.properties.malleability).toBeGreaterThanOrEqual(0)
    expect(result.properties.toughness).toBeGreaterThanOrEqual(0)
    expect(result.properties.conductivity).toBeGreaterThanOrEqual(0)
    expect(result.properties.magnetism).toBeGreaterThanOrEqual(0)
  })

  it('has valid metalType', () => {
    const code = 'const x = 1'
    const result = analyzeCastPiece(code, 'c.ts')
    expect(['titanium', 'steel', 'iron', 'bronze', 'copper', 'brass', 'tin', 'lead']).toContain(result.metalType)
  })

  it('has valid castingMethod', () => {
    const code = 'const x = 1'
    const result = analyzeCastPiece(code, 'c.ts')
    expect(['die-cast', 'sand-cast', 'investment', 'centrifugal', 'continuous', 'hand-poured']).toContain(result.castingMethod)
  })

  it('has valid heatTreatment', () => {
    const code = 'const x = 1'
    const result = analyzeCastPiece(code, 'c.ts')
    expect(['annealed', 'normalized', 'quenched', 'tempered', 'untreated']).toContain(result.heatTreatment)
  })

  it('has valid grade', () => {
    const code = 'const x = 1'
    const result = analyzeCastPiece(code, 'c.ts')
    expect(['aerospace', 'industrial', 'commercial', 'scrap', 'slag']).toContain(result.grade)
  })
})

// ─── analyzeFoundryBatch ─────────────────────────────────────────────────────

describe('analyzeFoundryBatch', () => {
  it('returns default batch for empty pieces', () => {
    const batch = analyzeFoundryBatch([], 'empty-dir')
    expect(batch.directory).toBe('empty-dir')
    expect(batch.batchCondition).toBe('scrap-heap')
    expect(batch.dominantMetal).toBe('lead')
    expect(batch.pieces.length).toBe(0)
    expect(batch.batchQuality).toBe(0)
  })

  it('aggregates metrics from pieces', () => {
    const code = 'export function a() {}'
    const pieces = [
      analyzeCastPiece(code, 'dir/a.ts'),
      analyzeCastPiece(code, 'dir/b.ts'),
    ]
    const batch = analyzeFoundryBatch(pieces, 'dir')
    expect(batch.directory).toBe('dir')
    expect(batch.pieces.length).toBe(2)
    expect(batch.batchQuality).toBeGreaterThanOrEqual(0)
    expect(batch.totalDefects).toBeGreaterThanOrEqual(0)
  })

  it('identifies dominant metal', () => {
    const code = 'export function a() {}'
    const pieces = [analyzeCastPiece(code, 'a.ts')]
    const batch = analyzeFoundryBatch(pieces, 'dir')
    expect(typeof batch.dominantMetal).toBe('string')
  })

  it('computes foundry health', () => {
    const code = 'export function a() {}'
    const pieces = [analyzeCastPiece(code, 'a.ts')]
    const batch = analyzeFoundryBatch(pieces, 'dir')
    expect(batch.foundryHealth).toBeGreaterThanOrEqual(0)
    expect(batch.foundryHealth).toBeLessThanOrEqual(100)
  })
})

// ─── generateFoundryRecommendations ──────────────────────────────────────────

describe('generateFoundryRecommendations', () => {
  it('returns positive message when no issues', () => {
    const stats = createMockStats()
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('World-class'))).toBe(true)
  })

  it('recommends for scrap grade', () => {
    const stats = createMockStats({ scrapGrade: 2 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('scrap-grade'))).toBe(true)
  })

  it('recommends for high porosity', () => {
    const stats = createMockStats({ totalPorosity: 10 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('porosity'))).toBe(true)
  })

  it('recommends for slag', () => {
    const stats = createMockStats({ totalSlag: 3 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('slag'))).toBe(true)
  })

  it('recommends for shrinkage', () => {
    const stats = createMockStats({ totalShrinkage: 5 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('shrinkage'))).toBe(true)
  })

  it('recommends for low finishing quality', () => {
    const stats = createMockStats({ avgFinishingQuality: 30 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('finishing'))).toBe(true)
  })

  it('recommends for low mold quality', () => {
    const stats = createMockStats({ avgMoldQuality: 30 })
    const recs = generateFoundryRecommendations([], [], stats)
    expect(recs.some(r => r.includes('mold'))).toBe(true)
  })
})

// ─── buildFoundryResult ──────────────────────────────────────────────────────

describe('buildFoundryResult', () => {
  it('handles empty input', () => {
    const result = buildFoundryResult([], [], {})
    expect(result.pieces.length).toBe(0)
    expect(result.batches.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.foundryGrade).toBe('condemned')
  })

  it('analyzes single file', () => {
    const code = '/** Add numbers */\nexport function add(a: number, b: number): number { return a + b }'
    const result = buildFoundryResult(['add.ts'], [code], {})
    expect(result.pieces.length).toBe(1)
    expect(result.batches.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestPiece).toBe('add.ts')
    expect(result.stats.worstPiece).toBe('add.ts')
    expect(result.stats.heaviestPiece).toBe('add.ts')
    expect(result.stats.lightestPiece).toBe('add.ts')
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildFoundryResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.pieces.length).toBe(3)
    expect(result.batches.length).toBe(2)
    expect(result.stats.totalBatches).toBe(2)
  })

  it('computes all stats fields', () => {
    const code = '/** doc */\nexport function a(): number { return 1 }'
    const result = buildFoundryResult(['a.ts'], [code], {})
    const s = result.stats
    expect(typeof s.avgMeltingPoint).toBe('number')
    expect(typeof s.avgMoldQuality).toBe('number')
    expect(typeof s.avgCastingPrecision).toBe('number')
    expect(typeof s.avgFinishingQuality).toBe('number')
    expect(typeof s.avgStructuralIntegrity).toBe('number')
    expect(typeof s.titaniumFiles).toBe('number')
    expect(typeof s.steelFiles).toBe('number')
    expect(typeof s.leadFiles).toBe('number')
    expect(typeof s.aerospaceGrade).toBe('number')
    expect(typeof s.industrialGrade).toBe('number')
    expect(typeof s.commercialGrade).toBe('number')
    expect(typeof s.scrapGrade).toBe('number')
    expect(typeof s.totalPorosity).toBe('number')
    expect(typeof s.totalSlag).toBe('number')
    expect(typeof s.totalShrinkage).toBe('number')
    expect(typeof s.totalColdShuts).toBe('number')
    expect(typeof s.totalHotTears).toBe('number')
    expect(typeof s.totalMisruns).toBe('number')
    expect(typeof s.totalInclusions).toBe('number')
    expect(typeof s.totalSurfaceDefects).toBe('number')
    expect(typeof s.avgHardness).toBe('number')
    expect(typeof s.avgDuctility).toBe('number')
    expect(typeof s.avgMalleability).toBe('number')
    expect(typeof s.avgToughness).toBe('number')
    expect(typeof s.overallQuality).toBe('number')
    expect(typeof s.foundryGrade).toBe('string')
    expect(typeof s.bestPiece).toBe('string')
    expect(typeof s.worstPiece).toBe('string')
    expect(typeof s.heaviestPiece).toBe('string')
    expect(typeof s.lightestPiece).toBe('string')
  })

  it('identifies best and worst by quality', () => {
    const goodCode = '/** doc */\nexport function a(): number { return 1 }\nexport function b(): number { return 2 }\nexport interface I { x: number }'
    const badCode = '// TODO\nvar x: any = 1\nconsole.log("debug")'
    const result = buildFoundryResult(
      ['src/good.ts', 'test/bad.ts'],
      [goodCode, badCode],
      {},
    )
    expect(result.stats.bestPiece).toBe('src/good.ts')
    expect(result.stats.worstPiece).toBe('test/bad.ts')
  })
})

// ─── formatFoundryTable ──────────────────────────────────────────────────────

describe('formatFoundryTable', () => {
  it('formats result as table string', () => {
    const result = buildFoundryResult(['a.ts'], ['export function a() {}'], {})
    const output = formatFoundryTable(result, false)
    expect(output).toContain('Foundry')
    expect(output).toContain('Cast Pieces')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildFoundryResult(['a.ts'], ['export function a() {}'], {})
    const output = formatFoundryTable(result, true)
    expect(output).toContain('porosity:')
    expect(output).toContain('hard:')
  })

  it('handles empty result', () => {
    const result = buildFoundryResult([], [], {})
    const output = formatFoundryTable(result, false)
    expect(output).toContain('No cast pieces detected')
  })

  it('shows recommendations', () => {
    const result = buildFoundryResult(['a.ts'], ['export function a() {}'], {})
    const output = formatFoundryTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatFoundryJson ───────────────────────────────────────────────────────

describe('formatFoundryJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildFoundryResult(['a.ts'], ['export function a() {}'], {})
    const output = formatFoundryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pieces).toBeDefined()
    expect(parsed.batches).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildFoundryResult([], [], {})
    const output = formatFoundryJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pieces.length).toBe(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockStats(overrides: Partial<FoundryStats> = {}): FoundryStats {
  return {
    totalFiles: 0,
    totalBatches: 0,
    avgMeltingPoint: 50,
    avgMoldQuality: 70,
    avgCastingPrecision: 70,
    avgFinishingQuality: 70,
    avgStructuralIntegrity: 70,
    titaniumFiles: 0,
    steelFiles: 0,
    leadFiles: 0,
    aerospaceGrade: 0,
    industrialGrade: 0,
    commercialGrade: 0,
    scrapGrade: 0,
    totalPorosity: 0,
    totalSlag: 0,
    totalShrinkage: 0,
    totalColdShuts: 0,
    totalHotTears: 0,
    totalMisruns: 0,
    totalInclusions: 0,
    totalSurfaceDefects: 0,
    avgHardness: 50,
    avgDuctility: 50,
    avgMalleability: 50,
    avgToughness: 50,
    overallQuality: 70,
    foundryGrade: 'certified',
    bestPiece: 'none',
    worstPiece: 'none',
    heaviestPiece: 'none',
    lightestPiece: 'none',
    ...overrides,
  }
}
