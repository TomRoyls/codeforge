import { describe, expect, it } from 'vitest'
import {
  analyzeHoneycombCell,
  analyzeHoneycombFrame,
  buildHoneycombMatrixResult,
  classifyBeekeeperGrade,
  classifyFrameType,
  generateRecommendations,
  measureDensity,
  measureEfficiency,
  measureHexagon,
  measureNectar,
  measureStructure,
  measureWall,
} from '../src/commands/honeycomb-matrix-helpers.js'
import { formatHoneycombMatrixJson, formatHoneycombMatrixTable } from '../src/commands/honeycomb-matrix-format-helpers.js'

// ─── measureStructure ───────────────────────────────────────────────────────

describe('measureStructure', () => {
  it('returns brood for empty content', () => {
    const r = measureStructure('')
    expect(r.quality).toBe(15)
    expect(r.cellType).toBe('brood')
    expect(r.isRegularHexagon).toBe(false)
    expect(r.irregularityCount).toBe(0)
  })

  it('detects worker from exports and imports', () => {
    const code = 'import { X } from "y"\nexport function a(): void {}'
    const r = measureStructure(code)
    expect(r.cellType).toBe('worker')
    expect(r.hasSharedWalls).toBe(true)
  })

  it('detects queen from class with many exports', () => {
    const code = 'class Handler {}\nexport function a() {}\nexport function b() {}\nexport function c() {}'
    const r = measureStructure(code)
    expect(r.cellType).toBe('queen')
    expect(r.hasProperGeometry).toBe(true)
  })

  it('detects honey from exports without imports', () => {
    const code = 'export function a(): void {}'
    const r = measureStructure(code)
    expect(r.cellType).toBe('honey')
  })

  it('detects drone from many functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const r = measureStructure(code)
    expect(r.cellType).toBe('drone')
  })

  it('detects proper geometry from functions with classes', () => {
    const code = 'class Handler {}\nfunction run() {}'
    const r = measureStructure(code)
    expect(r.hasProperGeometry).toBe(true)
  })

  it('detects consistent angles from types', () => {
    const code = 'function a(): void {}\ntype X = { a: number }'
    const r = measureStructure(code)
    expect(r.hasConsistentAngles).toBe(true)
  })

  it('detects flat tops from interfaces', () => {
    const code = 'interface I { x: number }'
    const r = measureStructure(code)
    expect(r.hasFlatTops).toBe(true)
  })

  it('detects proper ventilation from if/else', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureStructure(code)
    expect(r.hasProperVentilation).toBe(true)
  })

  it('detects irregularities from any and debugger', () => {
    const code = 'function bad(x: any): any { debugger; return x }'
    const r = measureStructure(code)
    expect(r.irregularityCount).toBeGreaterThan(0)
  })

  it('computes quality within valid range', () => {
    const r = measureStructure('function a() {}')
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureDensity ─────────────────────────────────────────────────────────

describe('measureDensity', () => {
  it('returns low packing for empty content', () => {
    const r = measureDensity('')
    expect(r.packing).toBe(15)
    expect(r.isOptimallyPacked).toBe(false)
    expect(r.voidCount).toBe(0)
  })

  it('detects hexagonal packing from exports, functions, consts', () => {
    const code = 'export function a(): void {}\nconst x = 1\nconst y = 2'
    const r = measureDensity(code)
    expect(r.hasHexagonalPacking).toBe(true)
  })

  it('detects square packing from var', () => {
    const code = 'var x = 1'
    const r = measureDensity(code)
    expect(r.hasSquarePacking).toBe(true)
  })

  it('detects loose packing from non-empty no functions', () => {
    const code = 'const x = 1'
    const r = measureDensity(code)
    expect(r.hasLoosePacking).toBe(true)
  })

  it('detects over packing from many functions', () => {
    const code = Array(22).fill('function fn() {}').join('\n')
    const r = measureDensity(code)
    expect(r.hasOverPacking).toBe(true)
  })

  it('detects void spaces', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureDensity(code)
    expect(r.hasVoidSpaces).toBe(true)
  })

  it('detects dead space from debugger', () => {
    const code = 'debugger;'
    const r = measureDensity(code)
    expect(r.hasDeadSpace).toBe(true)
    expect(r.deadSpaceCount).toBeGreaterThan(0)
  })

  it('detects tight junctions', () => {
    const code = 'export function a() {}'
    const r = measureDensity(code)
    expect(r.hasTightJunctions).toBe(true)
  })

  it('computes packing within valid range', () => {
    const r = measureDensity('function a() {}')
    expect(r.packing).toBeGreaterThanOrEqual(0)
    expect(r.packing).toBeLessThanOrEqual(100)
  })
})

// ─── measureWall ────────────────────────────────────────────────────────────

describe('measureWall', () => {
  it('returns moderate thickness for empty content', () => {
    const r = measureWall('')
    expect(r.thickness).toBe(25)
    expect(r.isStrong).toBe(true)
    expect(r.damageCount).toBe(0)
  })

  it('detects proper encapsulation from private', () => {
    const code = 'class Handler { private x: number }'
    const r = measureWall(code)
    expect(r.hasProperEncapsulation).toBe(true)
  })

  it('detects thin walls from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureWall(code)
    expect(r.hasThinWalls).toBe(true)
    expect(r.isStrong).toBe(false)
  })

  it('detects reinforced joints from classes with types', () => {
    const code = 'class Handler {}\ntype Config = { name: string }'
    const r = measureWall(code)
    expect(r.hasReinforcedJoints).toBe(true)
  })

  it('detects wax capping from exports with types', () => {
    const code = 'export function a(): void {}\ntype X = { a: number }'
    const r = measureWall(code)
    expect(r.hasWaxCapping).toBe(true)
  })

  it('detects propolis seal from try/catch', () => {
    const code = 'try { run() } catch (e) { handle(e) }'
    const r = measureWall(code)
    expect(r.hasPropolisSeal).toBe(true)
  })

  it('detects structural damage from debugger', () => {
    const code = 'debugger;'
    const r = measureWall(code)
    expect(r.hasStructuralDamage).toBe(true)
  })

  it('detects moisture barrier from try', () => {
    const code = 'try { run() } catch {}'
    const r = measureWall(code)
    expect(r.hasMoistureBarrier).toBe(true)
  })

  it('computes thickness within valid range', () => {
    const r = measureWall('class A {}')
    expect(r.thickness).toBeGreaterThanOrEqual(0)
    expect(r.thickness).toBeLessThanOrEqual(100)
  })
})

// ─── measureEfficiency ──────────────────────────────────────────────────────

describe('measureEfficiency', () => {
  it('returns inefficient for empty content', () => {
    const r = measureEfficiency('')
    expect(r.score).toBe(15)
    expect(r.type).toBe('inefficient')
    expect(r.wastePercent).toBe(0)
  })

  it('detects minimal wax from reasonable function count', () => {
    const code = 'function a() {}\nfunction b() {}'
    const r = measureEfficiency(code)
    expect(r.hasMinimalWax).toBe(true)
  })

  it('detects maximum storage from exports', () => {
    const code = 'export function a(): void {}'
    const r = measureEfficiency(code)
    expect(r.hasMaximumStorage).toBe(true)
  })

  it('detects resource conservation from functional ops only', () => {
    const code = 'arr.map(x => x).filter(x => x)'
    const r = measureEfficiency(code)
    expect(r.hasResourceConservation).toBe(true)
  })

  it('detects energy efficiency', () => {
    const code = 'arr.map(x => x).filter(x => x)\nfor (let i = 0; i < 2; i++) {}'
    const r = measureEfficiency(code)
    expect(r.hasEnergyEfficiency).toBe(true)
  })

  it('detects wing beat from map/filter', () => {
    const code = 'arr.map(x => x)'
    const r = measureEfficiency(code)
    expect(r.hasWingBeat).toBe(true)
  })

  it('detects thermoregulation from generics', () => {
    const code = 'function id<T>(x: T): T { return x }'
    const r = measureEfficiency(code)
    expect(r.hasThermoregulation).toBe(true)
  })

  it('detects dance language from exports and imports', () => {
    const code = 'import { X } from "y"\nexport function a(): void {}'
    const r = measureEfficiency(code)
    expect(r.hasDanceLanguage).toBe(true)
  })

  it('computes score within valid range', () => {
    const r = measureEfficiency('function a() {}')
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
})

// ─── measureNectar ──────────────────────────────────────────────────────────

describe('measureNectar', () => {
  it('returns buckwheat for empty content', () => {
    const r = measureNectar('')
    expect(r.quality).toBe(35)
    expect(r.source).toBe('buckwheat')
    expect(r.isPure).toBe(true)
    expect(r.hasNoContamination).toBe(true)
  })

  it('detects pure output', () => {
    const code = 'function a(): void {}'
    const r = measureNectar(code)
    expect(r.isPure).toBe(true)
  })

  it('detects rich flavor from exports with types', () => {
    const code = 'export function a(): void {}\ntype X = { a: number }'
    const r = measureNectar(code)
    expect(r.hasRichFlavor).toBe(true)
  })

  it('detects proper consistency from functions with returns', () => {
    const code = 'function a(): number { return 1 }'
    const r = measureNectar(code)
    expect(r.hasProperConsistency).toBe(true)
  })

  it('detects contamination from console', () => {
    const code = 'console.log("debug")'
    const r = measureNectar(code)
    expect(r.hasNoContamination).toBe(false)
    expect(r.contaminationCount).toBeGreaterThan(0)
  })

  it('detects proper moisture from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureNectar(code)
    expect(r.hasProperMoisture).toBe(true)
  })

  it('detects been capped from exports and jsdoc', () => {
    const code = '/** Doc */\nexport function a() {}'
    const r = measureNectar(code)
    expect(r.hasBeenCapped).toBe(true)
  })

  it('detects been ripened from jsdoc with types', () => {
    const code = '/** Doc */\ntype X = { a: number }'
    const r = measureNectar(code)
    expect(r.hasBeenRipened).toBe(true)
  })

  it('computes quality within valid range', () => {
    const r = measureNectar('function a() {}')
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureHexagon ─────────────────────────────────────────────────────────

describe('measureHexagon', () => {
  it('returns collapsed for empty content', () => {
    const r = measureHexagon('')
    expect(r.perfection).toBe(10)
    expect(r.isGeometrically).toBe('collapsed')
    expect(r.symmetryScore).toBe(10)
    expect(r.angleDeviation).toBe(0)
  })

  it('detects equal sides from reasonable function count', () => {
    const code = 'function a() {}\nfunction b() {}'
    const r = measureHexagon(code)
    expect(r.hasEqualSides).toBe(true)
  })

  it('detects proper angles from types', () => {
    const code = 'type X = { a: number }'
    const r = measureHexagon(code)
    expect(r.hasProperAngles).toBe(true)
  })

  it('detects flat bottom from classes', () => {
    const code = 'class Handler {}'
    const r = measureHexagon(code)
    expect(r.hasFlatBottom).toBe(true)
  })

  it('detects mirror symmetry from exports and imports', () => {
    const code = 'import { X } from "y"\nexport function a() {}'
    const r = measureHexagon(code)
    expect(r.hasMirrorSymmetry).toBe(true)
  })

  it('detects rotational symmetry from classes with functions', () => {
    const code = 'class Handler {}\nfunction run() {}'
    const r = measureHexagon(code)
    expect(r.hasRotationalSymmetry).toBe(true)
  })

  it('calculates angle deviation from anys and vars', () => {
    const code = 'function bad(x: any): any { return x }\nvar y = 1'
    const r = measureHexagon(code)
    expect(r.angleDeviation).toBeGreaterThan(0)
  })

  it('computes perfection within valid range', () => {
    const r = measureHexagon('function a() {}')
    expect(r.perfection).toBeGreaterThanOrEqual(0)
    expect(r.perfection).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeHoneycombCell ───────────────────────────────────────────────────

describe('analyzeHoneycombCell', () => {
  it('returns damaged-comb for empty content', () => {
    const c = analyzeHoneycombCell('', 'empty.ts')
    expect(c.condition).toBe('damaged-comb')
    expect(c.qualityScore).toBe(19)
    expect(c.file).toBe('empty.ts')
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const c = analyzeHoneycombCell(code, 'a.ts')
    const expected = Math.round(
      (c.cellStructure + c.packingDensity + c.wallThickness + c.combEfficiency + c.nectarQuality + c.hexagonalPerfection) / 6,
    )
    expect(c.qualityScore).toBe(expected)
  })

  it('measures all six dimensions', () => {
    const code = 'export function a(): void {}'
    const c = analyzeHoneycombCell(code, 'a.ts')
    expect(c.cellStructure).toBeGreaterThanOrEqual(0)
    expect(c.packingDensity).toBeGreaterThanOrEqual(0)
    expect(c.wallThickness).toBeGreaterThanOrEqual(0)
    expect(c.combEfficiency).toBeGreaterThanOrEqual(0)
    expect(c.nectarQuality).toBeGreaterThanOrEqual(0)
    expect(c.hexagonalPerfection).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifyFrameType ──────────────────────────────────────────────────────

describe('classifyFrameType', () => {
  it('returns feral for empty array', () => {
    expect(classifyFrameType([])).toBe('feral')
  })

  it('returns langstroth for high quality', () => {
    const cells = Array(3).fill(null).map(() => ({
      ...analyzeHoneycombCell('/** Doc */\nexport function a(): void {}', 'a.ts'),
      qualityScore: 90,
    }))
    expect(classifyFrameType(cells)).toBe('langstroth')
  })
})

// ─── classifyBeekeeperGrade ─────────────────────────────────────────────────

describe('classifyBeekeeperGrade', () => {
  it('returns master-beekeeper for high scores', () => {
    expect(classifyBeekeeperGrade(95)).toBe('master-beekeeper')
  })
  it('returns senior-beekeeper for good scores', () => {
    expect(classifyBeekeeperGrade(75)).toBe('senior-beekeeper')
  })
  it('returns beekeeper for moderate scores', () => {
    expect(classifyBeekeeperGrade(55)).toBe('beekeeper')
  })
  it('returns apprentice for low scores', () => {
    expect(classifyBeekeeperGrade(35)).toBe('apprentice')
  })
  it('returns novice for poor scores', () => {
    expect(classifyBeekeeperGrade(18)).toBe('novice')
  })
  it('returns swarm-catcher for terrible scores', () => {
    expect(classifyBeekeeperGrade(5)).toBe('swarm-catcher')
  })
})

// ─── analyzeHoneycombFrame ──────────────────────────────────────────────────

describe('analyzeHoneycombFrame', () => {
  it('returns feral for empty array', () => {
    const f = analyzeHoneycombFrame([], 'empty/')
    expect(f.frameType).toBe('feral')
    expect(f.condition).toBe('colony-collapse')
    expect(f.cells).toHaveLength(0)
  })

  it('computes averages from cells', () => {
    const c = analyzeHoneycombCell('export function a(): void {}', 'src/a.ts')
    const f = analyzeHoneycombFrame([c], 'src/')
    expect(f.avgStructure).toBe(c.cellStructure)
    expect(f.avgDensity).toBe(c.packingDensity)
  })

  it('counts conditions correctly', () => {
    const good = analyzeHoneycombCell('/** Doc */\nexport function a(): void { if (x) {} else {} }\ninterface I {}\ntry {} catch {}', 'good.ts')
    const bad = analyzeHoneycombCell('', 'bad.ts')
    const f = analyzeHoneycombFrame([good, bad], 'mix/')
    expect(f.cells).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for healthy apiary', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildHoneycombMatrixResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.cells, result.frames, result.apiary, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends fixes for low-quality code', () => {
    const result = buildHoneycombMatrixResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildHoneycombMatrixResult ─────────────────────────────────────────────

describe('buildHoneycombMatrixResult', () => {
  it('handles empty input', () => {
    const result = buildHoneycombMatrixResult([], [], {})
    expect(result.cells).toHaveLength(0)
    expect(result.frames).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallApiary).toBe(0)
    expect(result.apiary.isThriving).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildHoneycombMatrixResult(['a.ts'], [code], {})
    expect(result.cells).toHaveLength(1)
    expect(result.cells[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into frames', () => {
    const result = buildHoneycombMatrixResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.frames.length).toBeGreaterThanOrEqual(2)
  })

  it('computes apiary averages', () => {
    const code = 'export function a(): void {}'
    const result = buildHoneycombMatrixResult(['a.ts'], [code], {})
    expect(result.apiary.avgStructure).toBeGreaterThanOrEqual(0)
    expect(result.apiary.avgDensity).toBeGreaterThanOrEqual(0)
    expect(result.apiary.avgEfficiency).toBeGreaterThanOrEqual(0)
  })

  it('identifies best cell, structured, dense, efficient', () => {
    const result = buildHoneycombMatrixResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestCell).toBe('a.ts')
  })

  it('sets beekeeper grade', () => {
    const result = buildHoneycombMatrixResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.beekeeperGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildHoneycombMatrixResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildHoneycombMatrixResult(['a.ts'], [code], {})
    expect(result.stats.isRegularHexagonCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasSharedWallsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isOptimallyPackedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasVoidSpacesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasDeadSpaceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isStrongCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasProperEncapsulationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasMinimalWaxCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isPureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasBeenCappedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasEqualSidesCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatHoneycombMatrixTable', () => {
  it('formats empty result', () => {
    const result = buildHoneycombMatrixResult([], [], {})
    const table = formatHoneycombMatrixTable(result, false)
    expect(table).toContain('Honeycomb Matrix')
    expect(table).toContain('No files analyzed')
  })

  it('formats with cells', () => {
    const result = buildHoneycombMatrixResult(['a.ts'], ['export function a() {}'], {})
    const table = formatHoneycombMatrixTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildHoneycombMatrixResult(files, contents, {})
    const table = formatHoneycombMatrixTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatHoneycombMatrixTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatHoneycombMatrixJson', () => {
  it('produces valid JSON', () => {
    const result = buildHoneycombMatrixResult(['a.ts'], ['export function a() {}'], {})
    const json = formatHoneycombMatrixJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.cells).toHaveLength(1)
  })
})
