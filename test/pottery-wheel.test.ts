import { describe, expect, it } from 'vitest'
import {
  analyzePotteryPiece,
  analyzePotteryStudio,
  buildPotteryWheelResult,
  classifyPotterGrade,
  classifyStudioType,
  generateRecommendations,
  measureArtistry,
  measureClay,
  measureGlaze,
  measureKiln,
  measureShaping,
  measureWheel,
} from '../src/commands/pottery-wheel-helpers.js'
import { formatPotteryWheelJson, formatPotteryWheelTable } from '../src/commands/pottery-wheel-format-helpers.js'

// ─── measureClay ────────────────────────────────────────────────────────────

describe('measureClay', () => {
  it('returns raku for empty content', () => {
    const r = measureClay('')
    expect(r.quality).toBe(25)
    expect(r.type).toBe('raku')
    expect(r.isWellPrepared).toBe(false)
    expect(r.impurityCount).toBe(0)
  })

  it('detects proper consistency from const-only', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureClay(code)
    expect(r.hasProperConsistency).toBe(true)
    expect(r.hasCorrectPlasticity).toBe(true)
  })

  it('detects impurities from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureClay(code)
    expect(r.hasImpurities).toBe(true)
    expect(r.impurityCount).toBeGreaterThan(0)
    expect(r.hasNoAirBubbles).toBe(false)
  })

  it('detects proper wedging from functions with classes', () => {
    const code = 'class Handler {}\nfunction run() {}'
    const r = measureClay(code)
    expect(r.hasProperWedging).toBe(true)
  })

  it('detects workable from functions', () => {
    const code = 'function a() {}'
    const r = measureClay(code)
    expect(r.isWorkable).toBe(true)
  })

  it('detects porcelain for high quality', () => {
    const code = [
      '/** Doc */',
      'class Handler {}',
      'interface Config {}',
      'const x: number = 1',
      'function a(): void {}',
      'function b(): void {}',
    ].join('\n')
    const r = measureClay(code)
    expect(r.quality).toBeGreaterThanOrEqual(70)
    expect(r.isWellPrepared).toBe(true)
  })

  it('detects impurities from debugger and TODO', () => {
    const code = 'debugger;\n// TODO: fix this'
    const r = measureClay(code)
    expect(r.hasImpurities).toBe(true)
  })

  it('computes quality within valid range', () => {
    const r = measureClay('function a() {}')
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureWheel ───────────────────────────────────────────────────────────

describe('measureWheel', () => {
  it('returns low speed for empty content', () => {
    const r = measureWheel('')
    expect(r.speed).toBe(15)
    expect(r.isCentered).toBe(false)
    expect(r.wobbleCount).toBe(0)
  })

  it('detects centered from exports and functions', () => {
    const code = 'export function a() {}'
    const r = measureWheel(code)
    expect(r.isCentered).toBe(true)
    expect(r.hasCentering).toBe(true)
  })

  it('detects steady rotation from multiple functions', () => {
    const code = 'function a() {}\nfunction b() {}'
    const r = measureWheel(code)
    expect(r.hasSteadyRotation).toBe(true)
  })

  it('detects balanced from exports and imports', () => {
    const code = 'import { X } from "y"\nexport function a() {}'
    const r = measureWheel(code)
    expect(r.isBalanced).toBe(true)
  })

  it('detects wobble from var', () => {
    const code = 'var x = 1'
    const r = measureWheel(code)
    expect(r.hasWobble).toBe(true)
    expect(r.wobbleCount).toBeGreaterThan(0)
  })

  it('detects vibration from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureWheel(code)
    expect(r.hasVibration).toBe(true)
  })

  it('detects good control without var or any', () => {
    const code = 'const x = 1\nfunction a(): void {}'
    const r = measureWheel(code)
    expect(r.hasGoodControl).toBe(true)
  })

  it('computes speed within valid range', () => {
    const r = measureWheel('function a() {}')
    expect(r.speed).toBeGreaterThanOrEqual(0)
    expect(r.speed).toBeLessThanOrEqual(100)
  })
})

// ─── measureShaping ─────────────────────────────────────────────────────────

describe('measureShaping', () => {
  it('returns pinch for empty content', () => {
    const r = measureShaping('')
    expect(r.skill).toBe(30)
    expect(r.technique).toBe('pinch')
    expect(r.isWellShaped).toBe(false)
    expect(r.crackingCount).toBe(0)
  })

  it('detects slab from single function', () => {
    const code = 'function a() {}'
    const r = measureShaping(code)
    expect(r.technique).toBe('slab')
  })

  it('detects coil from multiple functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const r = measureShaping(code)
    expect(r.technique).toBe('coil')
  })

  it('detects throwing from class with many functions', () => {
    const code = 'class Handler {}\n' + Array(7).fill('function fn() {}').join('\n')
    const r = measureShaping(code)
    expect(r.technique).toBe('throwing')
  })

  it('detects symmetry from else branches', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureShaping(code)
    expect(r.hasSymmetry).toBe(true)
  })

  it('detects cracking from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureShaping(code)
    expect(r.hasCracking).toBe(true)
    expect(r.crackingCount).toBeGreaterThan(0)
  })

  it('detects warping from console', () => {
    const code = 'console.log("debug")'
    const r = measureShaping(code)
    expect(r.hasWarping).toBe(true)
  })

  it('detects collapsing from debugger', () => {
    const code = 'debugger;'
    const r = measureShaping(code)
    expect(r.hasCollapsing).toBe(true)
  })

  it('detects smooth surface without issues', () => {
    const code = 'function clean(): void {}'
    const r = measureShaping(code)
    expect(r.hasSmoothSurface).toBe(true)
  })

  it('computes skill within valid range', () => {
    const r = measureShaping('function a() {}')
    expect(r.skill).toBeGreaterThanOrEqual(0)
    expect(r.skill).toBeLessThanOrEqual(100)
  })
})

// ─── measureGlaze ───────────────────────────────────────────────────────────

describe('measureGlaze', () => {
  it('returns shino for empty content', () => {
    const r = measureGlaze('')
    expect(r.finish).toBe(40)
    expect(r.type).toBe('shino')
    expect(r.isWellApplied).toBe(false)
    expect(r.flawCount).toBe(0)
  })

  it('detects well applied from jsdoc and exports', () => {
    const code = '/** Doc */\nexport function a() {}'
    const r = measureGlaze(code)
    expect(r.isWellApplied).toBe(true)
  })

  it('detects even coating from jsdoc with types', () => {
    const code = '/** Doc */\ntype X = { a: number }'
    const r = measureGlaze(code)
    expect(r.hasEvenCoating).toBe(true)
  })

  it('detects food safe from no any types', () => {
    const code = 'function a(): void {}'
    const r = measureGlaze(code)
    expect(r.hasFoodSafe).toBe(true)
  })

  it('detects decorative finish from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureGlaze(code)
    expect(r.hasDecorativeFinish).toBe(true)
  })

  it('detects proper firing from jsdoc, exports, and types', () => {
    const code = '/** Doc */\nexport function a(): void {}\ntype Config = { name: string }'
    const r = measureGlaze(code)
    expect(r.hasProperFiring).toBe(true)
  })

  it('detects signature from comments', () => {
    const code = '// Author: dev'
    const r = measureGlaze(code)
    expect(r.hasSignature).toBe(true)
  })

  it('computes finish within valid range', () => {
    const r = measureGlaze('function a() {}')
    expect(r.finish).toBeGreaterThanOrEqual(0)
    expect(r.finish).toBeLessThanOrEqual(100)
  })
})

// ─── measureKiln ────────────────────────────────────────────────────────────

describe('measureKiln', () => {
  it('returns bisque for empty content', () => {
    const r = measureKiln('')
    expect(r.strength).toBe(30)
    expect(r.temperature).toBe('bisque')
    expect(r.isVitrified).toBe(false)
    expect(r.flawCount).toBe(0)
  })

  it('detects vitrified from try/catch', () => {
    const code = 'try { run() } catch (e) { handle(e) }'
    const r = measureKiln(code)
    expect(r.isVitrified).toBe(true)
    expect(r.hasProperFiring).toBe(true)
  })

  it('detects no dunting from try/catch/finally', () => {
    const code = 'try {} catch {} finally {}'
    const r = measureKiln(code)
    expect(r.hasNoDunting).toBe(true)
  })

  it('detects no bloating from no debugger', () => {
    const code = 'function a() {}'
    const r = measureKiln(code)
    expect(r.hasNoBloating).toBe(true)
  })

  it('detects no shivering from no any types', () => {
    const code = 'function a(): void {}'
    const r = measureKiln(code)
    expect(r.hasNoShivering).toBe(true)
  })

  it('detects witness cone from try and throw', () => {
    const code = 'try { run() } catch (e) { throw e }'
    const r = measureKiln(code)
    expect(r.hasWitnessCone).toBe(true)
  })

  it('detects pyrometric from Error', () => {
    const code = 'throw new Error("fail")'
    const r = measureKiln(code)
    expect(r.hasPyrometric).toBe(true)
  })

  it('counts flaws from debugger and any', () => {
    const code = 'debugger;\nfunction bad(x: any): any { return x }'
    const r = measureKiln(code)
    expect(r.flawCount).toBeGreaterThan(0)
  })

  it('computes strength within valid range', () => {
    const r = measureKiln('try {} catch {}')
    expect(r.strength).toBeGreaterThanOrEqual(0)
    expect(r.strength).toBeLessThanOrEqual(100)
  })
})

// ─── measureArtistry ────────────────────────────────────────────────────────

describe('measureArtistry', () => {
  it('returns industrial for empty content', () => {
    const r = measureArtistry('')
    expect(r.merit).toBe(10)
    expect(r.style).toBe('industrial')
    expect(r.hasAestheticValue).toBe(false)
    expect(r.expressionCount).toBe(0)
  })

  it('detects aesthetic value from functions without any', () => {
    const code = 'function a(): void {}'
    const r = measureArtistry(code)
    expect(r.hasAestheticValue).toBe(true)
  })

  it('detects functional beauty from exports and functions', () => {
    const code = 'export function a(): void {}'
    const r = measureArtistry(code)
    expect(r.hasFunctionalBeauty).toBe(true)
  })

  it('detects artistic expression from array methods', () => {
    const code = 'arr.map(x => x).filter(x => x)'
    const r = measureArtistry(code)
    expect(r.hasArtisticExpression).toBe(true)
    expect(r.expressionCount).toBeGreaterThan(0)
  })

  it('detects cultural significance from jsdoc with types', () => {
    const code = '/** Doc */\ntype X = { a: number }'
    const r = measureArtistry(code)
    expect(r.hasCulturalSignificance).toBe(true)
  })

  it('detects provenance from jsdoc', () => {
    const code = '/** Doc */'
    const r = measureArtistry(code)
    expect(r.hasProvenance).toBe(true)
  })

  it('detects unique character from generics or async', () => {
    const code = 'function id<T>(x: T): T { return x }'
    const r = measureArtistry(code)
    expect(r.hasUniqueCharacter).toBe(true)
  })

  it('detects harmonious form from exports and imports', () => {
    const code = 'import { X } from "y"\nexport function a() {}'
    const r = measureArtistry(code)
    expect(r.hasHarmoniousForm).toBe(true)
  })

  it('computes merit within valid range', () => {
    const r = measureArtistry('function a() {}')
    expect(r.merit).toBeGreaterThanOrEqual(0)
    expect(r.merit).toBeLessThanOrEqual(100)
  })
})

// ─── analyzePotteryPiece ────────────────────────────────────────────────────

describe('analyzePotteryPiece', () => {
  it('returns student-work for empty content', () => {
    const p = analyzePotteryPiece('', 'empty.ts')
    expect(p.condition).toBe('student-work')
    expect(p.qualityScore).toBe(25)
    expect(p.file).toBe('empty.ts')
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const p = analyzePotteryPiece(code, 'a.ts')
    const expected = Math.round(
      (p.clayQuality + p.wheelSpeed + p.shapingSkill + p.glazeFinish + p.kilnStrength + p.artisticMerit) / 6,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('measures all six dimensions', () => {
    const code = 'export function a(): void {}'
    const p = analyzePotteryPiece(code, 'a.ts')
    expect(p.clayQuality).toBeGreaterThanOrEqual(0)
    expect(p.wheelSpeed).toBeGreaterThanOrEqual(0)
    expect(p.shapingSkill).toBeGreaterThanOrEqual(0)
    expect(p.glazeFinish).toBeGreaterThanOrEqual(0)
    expect(p.kilnStrength).toBeGreaterThanOrEqual(0)
    expect(p.artisticMerit).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifyStudioType ─────────────────────────────────────────────────────

describe('classifyStudioType', () => {
  it('returns mud-pie for empty array', () => {
    expect(classifyStudioType([])).toBe('mud-pie')
  })

  it('returns master-studio for high quality', () => {
    const pieces = Array(3).fill(null).map(() => ({
      ...analyzePotteryPiece('/** Doc */\nexport function a(): void {}', 'a.ts'),
      qualityScore: 90,
    }))
    expect(classifyStudioType(pieces)).toBe('master-studio')
  })
})

// ─── classifyPotterGrade ────────────────────────────────────────────────────

describe('classifyPotterGrade', () => {
  it('returns master-potter for high scores', () => {
    expect(classifyPotterGrade(95)).toBe('master-potter')
  })
  it('returns artisan for good scores', () => {
    expect(classifyPotterGrade(75)).toBe('artisan')
  })
  it('returns journeyman for moderate scores', () => {
    expect(classifyPotterGrade(55)).toBe('journeyman')
  })
  it('returns apprentice for low scores', () => {
    expect(classifyPotterGrade(35)).toBe('apprentice')
  })
  it('returns student for poor scores', () => {
    expect(classifyPotterGrade(18)).toBe('student')
  })
  it('returns toddler for terrible scores', () => {
    expect(classifyPotterGrade(5)).toBe('toddler')
  })
})

// ─── analyzePotteryStudio ───────────────────────────────────────────────────

describe('analyzePotteryStudio', () => {
  it('returns mud-pie for empty array', () => {
    const s = analyzePotteryStudio([], 'empty/')
    expect(s.studioType).toBe('mud-pie')
    expect(s.condition).toBe('mud-hole')
    expect(s.pieces).toHaveLength(0)
  })

  it('computes averages from pieces', () => {
    const p = analyzePotteryPiece('export function a(): void {}', 'src/a.ts')
    const s = analyzePotteryStudio([p], 'src/')
    expect(s.avgClayQuality).toBe(p.clayQuality)
    expect(s.avgShapingSkill).toBe(p.shapingSkill)
  })

  it('counts conditions correctly', () => {
    const good = analyzePotteryPiece('/** Doc */\nexport function a(): void { if (x) {} else {} }\ninterface I {}', 'good.ts')
    const bad = analyzePotteryPiece('', 'bad.ts')
    const s = analyzePotteryStudio([good, bad], 'mix/')
    expect(s.pieces).toHaveLength(2)
    expect(s.crackedPotCount + s.museumPieceCount).toBeLessThanOrEqual(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for good pottery', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildPotteryWheelResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.pieces, result.studios, result.kiln, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends fixes for low-quality code', () => {
    const result = buildPotteryWheelResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildPotteryWheelResult ────────────────────────────────────────────────

describe('buildPotteryWheelResult', () => {
  it('handles empty input', () => {
    const result = buildPotteryWheelResult([], [], {})
    expect(result.pieces).toHaveLength(0)
    expect(result.studios).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallCraftsmanship).toBe(0)
    expect(result.kiln.isWellFired).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildPotteryWheelResult(['a.ts'], [code], {})
    expect(result.pieces).toHaveLength(1)
    expect(result.pieces[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into studios', () => {
    const result = buildPotteryWheelResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.studios.length).toBeGreaterThanOrEqual(2)
  })

  it('computes kiln averages', () => {
    const code = 'export function a(): void {}'
    const result = buildPotteryWheelResult(['a.ts'], [code], {})
    expect(result.kiln.avgClayQuality).toBeGreaterThanOrEqual(0)
    expect(result.kiln.avgShapingSkill).toBeGreaterThanOrEqual(0)
    expect(result.kiln.avgKilnStrength).toBeGreaterThanOrEqual(0)
  })

  it('identifies best piece, clay, shaped, glazed, strongest', () => {
    const result = buildPotteryWheelResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestPiece).toBe('a.ts')
  })

  it('sets potter grade', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.potterGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildPotteryWheelResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildPotteryWheelResult(['a.ts'], [code], {})
    expect(result.stats.isWellPreparedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasImpuritiesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isCenteredCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasWobbleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellShapedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasCrackingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellAppliedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isVitrifiedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasProperFiringCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasAestheticValueCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isMuseumQualityCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('formatPotteryWheelTable', () => {
  it('formats empty result', () => {
    const result = buildPotteryWheelResult([], [], {})
    const table = formatPotteryWheelTable(result, false)
    expect(table).toContain('Pottery Wheel')
    expect(table).toContain('No files analyzed')
  })

  it('formats with pieces', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    const table = formatPotteryWheelTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildPotteryWheelResult(files, contents, {})
    const table = formatPotteryWheelTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatPotteryWheelTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatPotteryWheelJson', () => {
  it('produces valid JSON', () => {
    const result = buildPotteryWheelResult(['a.ts'], ['export function a() {}'], {})
    const json = formatPotteryWheelJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toHaveLength(1)
  })
})
