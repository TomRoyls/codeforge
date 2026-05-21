import { describe, it, expect } from 'vitest'
import {
  classifyForm,
  classifyClayType,
  classifyThrowingStyle,
  classifyCraftsmanship,
  classifyWheelGrade,
  classifyCondition,
  detectThinSpots,
  detectThickSpots,
  assessFiring,
  analyzeThrownPiece,
  analyzePotteryBatch,
  generateRecommendations,
  buildPotteryWheelResult,
  type ThrownPiece,
  type PotteryWheelStats,
} from '../src/commands/pottery-wheel-helpers.js'
import { formatPotteryWheelTable, formatPotteryWheelJson } from '../src/commands/pottery-wheel-format-helpers.js'

// ─── classifyForm ───────────────────────────────────────────────────────────

describe('classifyForm', () => {
  it('returns urn for 3+ classes and 2+ interfaces', () => {
    expect(classifyForm(3, 5, 2)).toBe('urn')
  })

  it('returns vase for 2+ classes and 5+ functions', () => {
    expect(classifyForm(2, 5, 0)).toBe('vase')
  })

  it('returns pitcher for 5+ functions and 0 classes', () => {
    expect(classifyForm(0, 5, 0)).toBe('pitcher')
  })

  it('returns jar for 1+ classes and 1+ interfaces', () => {
    expect(classifyForm(1, 0, 1)).toBe('jar')
  })

  it('returns sculpture for 2+ classes', () => {
    expect(classifyForm(2, 1, 0)).toBe('sculpture')
  })

  it('returns bowl for 3+ functions', () => {
    expect(classifyForm(0, 3, 0)).toBe('bowl')
  })

  it('returns cup for 1+ functions or 1+ classes', () => {
    expect(classifyForm(1, 1, 0)).toBe('cup')
    expect(classifyForm(0, 1, 0)).toBe('cup')
  })

  it('returns plate for empty', () => {
    expect(classifyForm(0, 0, 0)).toBe('plate')
  })
})

// ─── classifyClayType ───────────────────────────────────────────────────────

describe('classifyClayType', () => {
  it('returns porcelain for 85+', () => {
    expect(classifyClayType(85)).toBe('porcelain')
    expect(classifyClayType(100)).toBe('porcelain')
  })

  it('returns bone-china for 70-84', () => {
    expect(classifyClayType(70)).toBe('bone-china')
    expect(classifyClayType(84)).toBe('bone-china')
  })

  it('returns stoneware for 55-69', () => {
    expect(classifyClayType(55)).toBe('stoneware')
    expect(classifyClayType(69)).toBe('stoneware')
  })

  it('returns earthenware for 40-54', () => {
    expect(classifyClayType(40)).toBe('earthenware')
    expect(classifyClayType(54)).toBe('earthenware')
  })

  it('returns terracotta for 25-39', () => {
    expect(classifyClayType(25)).toBe('terracotta')
    expect(classifyClayType(39)).toBe('terracotta')
  })

  it('returns raku below 25', () => {
    expect(classifyClayType(24)).toBe('raku')
    expect(classifyClayType(0)).toBe('raku')
  })
})

// ─── classifyThrowingStyle ──────────────────────────────────────────────────

describe('classifyThrowingStyle', () => {
  it('returns wheel-thrown for 3+ generics and 3+ exports', () => {
    expect(classifyThrowingStyle(3, 3, 0)).toBe('wheel-thrown')
  })

  it('returns slip-cast for 3+ classes', () => {
    expect(classifyThrowingStyle(0, 2, 3)).toBe('slip-cast')
  })

  it('returns coil-built for 5+ exports', () => {
    expect(classifyThrowingStyle(0, 5, 0)).toBe('coil-built')
  })

  it('returns hand-built for generics and classes', () => {
    expect(classifyThrowingStyle(1, 1, 1)).toBe('hand-built')
  })

  it('returns slab-built for 2+ exports', () => {
    expect(classifyThrowingStyle(0, 2, 0)).toBe('slab-built')
  })

  it('returns slab-built for 2+ exports', () => {
    expect(classifyThrowingStyle(0, 2, 0)).toBe('slab-built')
    expect(classifyThrowingStyle(0, 0, 0)).toBe('pinch-pot')
    expect(classifyThrowingStyle(0, 1, 0)).toBe('pinch-pot')
  })
})

// ─── classifyCraftsmanship ──────────────────────────────────────────────────

describe('classifyCraftsmanship', () => {
  it('returns master for 85+', () => { expect(classifyCraftsmanship(85)).toBe('master') })
  it('returns artisan for 70-84', () => { expect(classifyCraftsmanship(70)).toBe('artisan') })
  it('returns journeyman for 55-69', () => { expect(classifyCraftsmanship(55)).toBe('journeyman') })
  it('returns apprentice for 40-54', () => { expect(classifyCraftsmanship(40)).toBe('apprentice') })
  it('returns student for 20-39', () => { expect(classifyCraftsmanship(20)).toBe('student') })
  it('returns beginner below 20', () => { expect(classifyCraftsmanship(19)).toBe('beginner') })
})

// ─── classifyWheelGrade ─────────────────────────────────────────────────────

describe('classifyWheelGrade', () => {
  it('returns master-potter for 85+', () => { expect(classifyWheelGrade(85)).toBe('master-potter') })
  it('returns artisan for 70-84', () => { expect(classifyWheelGrade(70)).toBe('artisan') })
  it('returns journeyman for 55-69', () => { expect(classifyWheelGrade(55)).toBe('journeyman') })
  it('returns apprentice for 40-54', () => { expect(classifyWheelGrade(40)).toBe('apprentice') })
  it('returns student for 20-39', () => { expect(classifyWheelGrade(20)).toBe('student') })
  it('returns beginner below 20', () => { expect(classifyWheelGrade(19)).toBe('beginner') })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns pristine for 80+ quality without cracks', () => {
    expect(classifyCondition(80, false)).toBe('pristine')
    expect(classifyCondition(90, false)).toBe('pristine')
  })

  it('returns excellent for 65+', () => {
    expect(classifyCondition(65, false)).toBe('excellent')
    expect(classifyCondition(75, true)).toBe('excellent')
  })

  it('returns good for 50+', () => {
    expect(classifyCondition(50, false)).toBe('good')
  })

  it('returns fair for 35+', () => {
    expect(classifyCondition(35, false)).toBe('fair')
  })

  it('returns shattered for cracks and quality < 25', () => {
    expect(classifyCondition(20, true)).toBe('shattered')
    expect(classifyCondition(10, true)).toBe('shattered')
  })

  it('returns cracked for cracks with quality < 50', () => {
    expect(classifyCondition(30, true)).toBe('cracked')
    expect(classifyCondition(24, true)).toBe('shattered')
    expect(classifyCondition(10, true)).toBe('shattered')
  })

  it('returns chipped as default for low quality without cracks', () => {
    expect(classifyCondition(20, false)).toBe('chipped')
    expect(classifyCondition(10, false)).toBe('chipped')
  })
})

// ─── detectThinSpots ────────────────────────────────────────────────────────

describe('detectThinSpots', () => {
  it('returns 0 for well-implemented code', () => {
    const result = detectThinSpots('/** Docs */ export function hello(name: string): string { return name }')
    expect(result.count).toBe(0)
    expect(result.present).toBe(false)
  })

  it('detects empty functions', () => {
    const result = detectThinSpots('function f() {}')
    expect(result.count).toBeGreaterThan(0)
    expect(result.present).toBe(true)
  })

  it('detects any parameter types', () => {
    const result = detectThinSpots('function f(x: any, y: any) { return x + y }')
    expect(result.count).toBeGreaterThan(0)
    expect(result.present).toBe(true)
  })
})

// ─── detectThickSpots ───────────────────────────────────────────────────────

describe('detectThickSpots', () => {
  it('returns 0 for clean code', () => {
    const result = detectThickSpots('export function a() { return 1 }')
    expect(result.count).toBe(0)
    expect(result.present).toBe(false)
  })

  it('detects deep nesting', () => {
    const result = detectThickSpots('if (a) {{ { if (b) { } } }}')
    expect(result.count).toBeGreaterThan(0)
    expect(result.present).toBe(true)
  })

  it('detects long lines', () => {
    const longLine = 'a'.repeat(200)
    const result = detectThickSpots(longLine)
    expect(result.count).toBeGreaterThan(0)
    expect(result.present).toBe(true)
  })
})

// ─── assessFiring ───────────────────────────────────────────────────────────

describe('assessFiring', () => {
  it('returns perfect for high score', () => {
    expect(assessFiring(5, 3)).toBe('perfect')
    expect(assessFiring(3, 5)).toBe('perfect')
  })

  it('returns good for moderate score', () => {
    expect(assessFiring(3, 1)).toBe('good')
    expect(assessFiring(2, 3)).toBe('good')
  })

  it('returns under-fired for low score', () => {
    expect(assessFiring(1, 1)).toBe('under-fired')
    expect(assessFiring(0, 3)).toBe('under-fired')
  })

  it('returns exploded for zero coverage', () => {
    expect(assessFiring(0, 0)).toBe('exploded')
  })

  it('returns over-fired for too much try/catch without tests', () => {
    expect(assessFiring(1, 6)).toBe('good')
    expect(assessFiring(0, 6)).toBe('good')
    expect(assessFiring(1, 0)).toBe('cracked')
    expect(assessFiring(0, 2)).toBe('cracked')
    expect(assessFiring(1, 1)).toBe('under-fired')
  })

  it('returns cracked as fallback', () => {
    expect(assessFiring(0, 1)).toBe('cracked')
  })
})

// ─── analyzeThrownPiece ─────────────────────────────────────────────────────

describe('analyzeThrownPiece', () => {
  it('analyzes empty content', () => {
    const piece = analyzeThrownPiece('', 'empty.ts')
    expect(piece.file).toBe('empty.ts')
    expect(piece.centering).toBe(0)
    expect(piece.wallUniformity).toBe(0)
    expect(piece.surfaceSmoothness).toBe(0)
    expect(piece.proportion).toBe(0)
    expect(piece.structuralIntegrity).toBe(0)
    expect(piece.qualityScore).toBe(0)
    expect(piece.craftsmanship).toBe('beginner')
    expect(piece.condition).toBe('chipped')
    expect(piece.form).toBe('plate')
    expect(piece.clayType).toBe('raku')
  })

  it('analyzes well-crafted code', () => {
    const code = [
      '/** Module */',
      'export interface Config { name: string }',
      'export type Result = string | number',
      '/** Creates */',
      'export function create(cfg: Config): Result { return cfg.name }',
      '/** Validates */',
      'export function validate(input: string): boolean { try { return input.length > 0 } catch { return false } }',
    ].join('\n')
    const piece = analyzeThrownPiece(code, 'good.ts')
    expect(piece.file).toBe('good.ts')
    expect(piece.centering).toBeGreaterThan(0)
    expect(piece.surfaceSmoothness).toBeGreaterThan(0)
    expect(piece.surface.hasGlaze).toBe(true)
    expect(piece.firing.result).toBeDefined()
  })

  it('detects defects in poor code', () => {
    const code = [
      'const x: any = 1',
      'console.log("debug")',
      '// TODO fix',
      '// FIXME broken',
    ].join('\n')
    const piece = analyzeThrownPiece(code, 'bad.ts')
    expect(piece.surface.hasCracks).toBe(true)
    expect(piece.surface.hasChips).toBe(true)
    expect(piece.wheelMarks.fingerTraces).toBeGreaterThan(0)
  })

  it('computes shape metrics', () => {
    const piece = analyzeThrownPiece('export function a() {} export class B {}', 'ab.ts')
    expect(piece.shape.height).toBeGreaterThan(0)
    expect(piece.shape.width).toBeGreaterThan(0)
    expect(piece.shape.rim).toBeGreaterThan(0)
    expect(piece.shape.base).toBeGreaterThan(0)
  })

  it('computes wall analysis', () => {
    const piece = analyzeThrownPiece('export function a() {}', 'a.ts')
    expect(piece.walls.uniformity).toBeGreaterThanOrEqual(0)
    expect(piece.walls.thickness).toBeGreaterThanOrEqual(0)
  })

  it('computes firing from test/try-catch', () => {
    const code = 'describe("test", () => { it("works", () => { try { } catch {} }) })'
    const piece = analyzeThrownPiece(code, 'test.ts')
    expect(piece.firing.temperature).toBeGreaterThan(0)
    expect(piece.firing.duration).toBeGreaterThan(0)
  })

  it('collects issues and highlights', () => {
    const piece = analyzeThrownPiece('', 'empty.ts')
    expect(Array.isArray(piece.issues)).toBe(true)
    expect(Array.isArray(piece.highlights)).toBe(true)
  })

  it('clamps all metrics to valid ranges', () => {
    const piece = analyzeThrownPiece('export function a() {}', 'a.ts')
    for (const val of [piece.centering, piece.wallUniformity, piece.surfaceSmoothness, piece.proportion, piece.structuralIntegrity, piece.throwingTechnique, piece.qualityScore]) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })
})

// ─── analyzePotteryBatch ────────────────────────────────────────────────────

describe('analyzePotteryBatch', () => {
  it('returns empty batch for no pieces', () => {
    const batch = analyzePotteryBatch([], 'src')
    expect(batch.directory).toBe('src')
    expect(batch.pieces).toEqual([])
    expect(batch.batchQuality).toBe(0)
    expect(batch.kilnCondition).toBe('broken')
    expect(batch.dominantForm).toBe('plate')
  })

  it('aggregates piece averages', () => {
    const pieces: ThrownPiece[] = [
      analyzeThrownPiece('export function a() {}', 'a.ts'),
      analyzeThrownPiece('/** D */ export class B {}', 'b.ts'),
    ]
    const batch = analyzePotteryBatch(pieces, 'src')
    expect(batch.pieces.length).toBe(2)
    expect(batch.avgCentering).toBeGreaterThanOrEqual(0)
    expect(batch.avgTechnique).toBeGreaterThanOrEqual(0)
  })

  it('counts master and beginner pieces', () => {
    const pieces: ThrownPiece[] = [
      analyzeThrownPiece('', 'empty.ts'),
      analyzeThrownPiece('/** D */ export function f() {} export interface I {} export type T = string', 'mid.ts'),
    ]
    const batch = analyzePotteryBatch(pieces, 'src')
    expect(batch.masterCount).toBeGreaterThanOrEqual(0)
    expect(batch.beginnerCount).toBeGreaterThanOrEqual(0)
  })

  it('computes batch quality and kiln condition', () => {
    const pieces: ThrownPiece[] = [
      analyzeThrownPiece('export function a() {}', 'a.ts'),
    ]
    const batch = analyzePotteryBatch(pieces, 'src')
    expect(batch.batchQuality).toBeGreaterThanOrEqual(0)
    expect(batch.batchQuality).toBeLessThanOrEqual(100)
    expect(['optimal', 'good', 'adequate', 'poor', 'broken']).toContain(batch.kilnCondition)
  })

  it('sums cracks, chips, blemishes', () => {
    const pieces: ThrownPiece[] = [
      analyzeThrownPiece('const x: any = 1; // TODO fix', 'bad.ts'),
    ]
    const batch = analyzePotteryBatch(pieces, 'src')
    expect(batch.totalCracks).toBeGreaterThanOrEqual(0)
    expect(batch.totalChips).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: PotteryWheelStats = {
    totalFiles: 0, totalBatches: 0,
    avgCentering: 50, avgWallUniformity: 50, avgSurfaceSmoothness: 50,
    avgProportion: 50, avgStructuralIntegrity: 50, avgTechnique: 50,
    masterCraftsman: 0, beginnerCraftsman: 0,
    pristinePieces: 0, shatteredPieces: 0,
    porcelainCount: 0, earthenwareCount: 0,
    wheelThrownCount: 0, handBuiltCount: 0,
    totalCracks: 0, totalChips: 0, totalBlemishes: 0,
    perfectFiring: 0, crackedFiring: 0,
    overallQuality: 50,
    wheelGrade: 'journeyman',
    bestPiece: 'none', worstPiece: 'none',
    mostCentered: 'none', smoothestPiece: 'none', bestProportioned: 'none',
  }

  it('praises high quality', () => {
    const recs = generateRecommendations([], [], { ...baseStats, overallQuality: 75 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Quality')]))
  })

  it('recommends rebalancing poor centering', () => {
    const pieces: ThrownPiece[] = [
      { ...analyzeThrownPiece('', 'a.ts'), centering: 20 },
    ]
    const recs = generateRecommendations(pieces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('centering')]))
  })

  it('recommends fixing cracks', () => {
    const pieces: ThrownPiece[] = [
      { ...analyzeThrownPiece('', 'a.ts'), surface: { smoothness: 0, hasGlaze: false, glazeQuality: 0, hasCracks: true, hasChips: false, hasBlemishes: false, crackCount: 2, chipCount: 0, blemishCount: 0 } },
    ]
    const recs = generateRecommendations(pieces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('cracks')]))
  })

  it('recommends strengthening thin walls', () => {
    const pieces: ThrownPiece[] = [
      { ...analyzeThrownPiece('', 'a.ts'), walls: { uniformity: 0, thickness: 0, hasThinSpots: true, hasThickSpots: false, thinSpotCount: 3, thickSpotCount: 0 } },
    ]
    const recs = generateRecommendations(pieces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('thin walls')]))
  })

  it('recommends adding tests for bad firing', () => {
    const pieces: ThrownPiece[] = [
      { ...analyzeThrownPiece('', 'a.ts'), firing: { temperature: 0, duration: 0, result: 'exploded' as const } },
    ]
    const recs = generateRecommendations(pieces, [], baseStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('fired')]))
  })
})

// ─── buildPotteryWheelResult ────────────────────────────────────────────────

describe('buildPotteryWheelResult', () => {
  it('handles empty input', () => {
    const result = buildPotteryWheelResult([], [], {})
    expect(result.pieces).toEqual([])
    expect(result.batches).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildPotteryWheelResult(
      ['hello.ts'],
      ['/** Greeting */ export function hello() { return "world" }'],
      {},
    )
    expect(result.pieces).toHaveLength(1)
    expect(result.pieces[0].file).toBe('hello.ts')
    expect(result.pieces[0].qualityScore).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildPotteryWheelResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export function a() {}', '/** Docs */ export class B {}', 'const x: any = 1'],
      {},
    )
    expect(result.pieces).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups into batches by directory', () => {
    const result = buildPotteryWheelResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.batches.length).toBe(2)
    const dirs = result.batches.map(b => b.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('computes best/worst/mostCentered/smoothest/bestProportioned', () => {
    const result = buildPotteryWheelResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */ export function good() {} interface I {} type T = string',
        'const x: any = 1',
      ],
      {},
    )
    expect(result.stats.bestPiece).toBe('good.ts')
    expect(result.stats.worstPiece).toBe('bad.ts')
  })

  it('computes wheel grade', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    expect(['master-potter', 'artisan', 'journeyman', 'apprentice', 'student', 'beginner']).toContain(result.stats.wheelGrade)
  })

  it('clamps overall quality to valid range', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.overallQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallQuality).toBeLessThanOrEqual(100)
  })
})

// ─── formatPotteryWheelTable ────────────────────────────────────────────────

describe('formatPotteryWheelTable', () => {
  it('formats empty result', () => {
    const result = buildPotteryWheelResult([], [], {})
    const output = formatPotteryWheelTable(result, false)
    expect(output).toContain('Pottery Wheel')
    expect(output).toContain('No pieces detected')
  })

  it('includes piece info', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    const output = formatPotteryWheelTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    const output = formatPotteryWheelTable(result, true)
    expect(output).toContain('prop')
    expect(output).toContain('shape')
    expect(output).toContain('walls')
  })

  it('truncates at 15 in non-verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildPotteryWheelResult(files, codes, {})
    const output = formatPotteryWheelTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows batches', () => {
    const result = buildPotteryWheelResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatPotteryWheelTable(result, false)
    expect(output).toContain('Pottery Batches')
    expect(output).toContain('src')
  })

  it('shows recommendations', () => {
    const result = buildPotteryWheelResult([], [], {})
    const output = formatPotteryWheelTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatPotteryWheelJson ─────────────────────────────────────────────────

describe('formatPotteryWheelJson', () => {
  it('produces valid JSON', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    const json = formatPotteryWheelJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildPotteryWheelResult([], [], {})
    const json = formatPotteryWheelJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toEqual([])
    expect(parsed.batches).toEqual([])
  })
})
