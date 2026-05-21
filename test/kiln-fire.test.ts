import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countTestIndicators,
  measureClay, measureGreen, measureBisque, measureGlaze,
  measureFiring, measureFinished,
  classifyPieceCondition, classifyKilnType,
  classifyLoadCondition, classifyPotterGrade,
  analyzePotteryPiece, analyzeKilnLoad,
  generateRecommendations, buildKilnFireResult,
} from '../src/commands/kiln-fire-helpers.js'
import { formatKilnFireTable, formatKilnFireJson } from '../src/commands/kiln-fire-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' */',
  'export function calculateResult(x: number): number {',
  '  try {',
  '    const result: number = helper(x)',
  '    if (result > 0) { return result }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  'export interface CalcOptions { value: number; label: string }',
  'export type CalcResult = number | string',
].join('\n')

const diverseCode = [
  'import { helper } from "./utils.js"',
  'export function calc(): void {}',
  'export class Calculator {',
  '  constructor() {}',
  '  compute(): number { return 1 }',
  '}',
  'export interface Shape { area: number }',
  'export type Result = string | number',
  '// TODO: fix this',
  'const x = 1',
].join('\n')

const testCode = [
  'import { describe, it, expect } from "vitest"',
  'describe("calc", () => {',
  '  it("works", () => {',
  '    expect(calc(1)).toBe(1)',
  '  })',
  '  it("handles zero", () => {',
  '    expect(calc(0)).toBe(0)',
  '  })',
  '})',
].join('\n')

const consoleCode = [
  'export function logStuff(x: number): void {',
  '  console.log("debug:", x)',
  '  console.error("err")',
  '}',
].join('\n')

const untypedCode = [
  'function process(data) {',
  '  if (data) { return data.value }',
  '  return null',
  '}',
  'function transform(input) { return input }',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('kiln-fire primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBe(3)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting measures brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting('if (a) { x }')).toBe(1)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole(consoleCode)).toBe(2)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODO markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countTestIndicators counts test patterns', () => {
    expect(countTestIndicators(emptyCode)).toBe(0)
    expect(countTestIndicators(testCode)).toBeGreaterThanOrEqual(3)
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('kiln-fire measurements', () => {
  it('measureClay handles empty code', () => {
    const c = measureClay(emptyCode)
    expect(c.type).toBe('mud')
    expect(c.quality).toBe(0)
    expect(c.hasImpurities).toBe(false)
    expect(c.isWorkable).toBe(false)
  })

  it('measureClay classifies strong code as stoneware or porcelain', () => {
    const c = measureClay(strongCode)
    expect(c.quality).toBeGreaterThan(0)
    expect(['porcelain', 'stoneware']).toContain(c.type)
  })

  it('measureClay detects impurities', () => {
    const c = measureClay(diverseCode)
    expect(c.hasImpurities).toBe(true)
    expect(c.impurityCount).toBeGreaterThan(0)
  })

  it('measureClay detects air bubbles (untyped functions)', () => {
    const c = measureClay(untypedCode)
    expect(c.hasAirBubbles).toBe(true)
    expect(c.bubbleCount).toBeGreaterThan(0)
  })

  it('measureGreen handles empty code', () => {
    const g = measureGreen(emptyCode)
    expect(g.strength).toBe(0)
    expect(g.isBoneDry).toBe(false)
    expect(g.isReadyForKiln).toBe(false)
  })

  it('measureGreen detects bone dry code', () => {
    const g = measureGreen(strongCode)
    expect(g.isBoneDry).toBe(true)
    expect(g.strength).toBeGreaterThan(0)
  })

  it('measureGreen detects cracks', () => {
    const g = measureGreen('if (a) { if (b) { if (c) { x } } }')
    expect(g.hasCracks).toBe(true)
    expect(g.crackCount).toBeGreaterThan(0)
  })

  it('measureBisque handles empty code', () => {
    const b = measureBisque(emptyCode)
    expect(b.hardness).toBe(0)
    expect(b.isFired).toBe(false)
    expect(b.coverage).toBe(0)
  })

  it('measureBisque detects fired code', () => {
    const b = measureBisque(testCode)
    expect(b.isFired).toBe(true)
    expect(b.hardness).toBeGreaterThan(0)
  })

  it('measureBisque detects bisque (basic tests)', () => {
    const b = measureBisque(testCode)
    expect(b.isBisque).toBe(true)
  })

  it('measureGlaze handles empty code', () => {
    const g = measureGlaze(emptyCode)
    expect(g.quality).toBe(0)
    expect(g.hasBaseCoat).toBe(false)
    expect(g.hasProtective).toBe(false)
  })

  it('measureGlaze detects documentation', () => {
    const g = measureGlaze(strongCode)
    expect(g.hasBaseCoat).toBe(true)
    expect(g.hasDecorative).toBe(true)
    expect(g.hasProtective).toBe(true)
    expect(g.quality).toBeGreaterThan(0)
  })

  it('measureGlaze detects crawling', () => {
    const g = measureGlaze('export function a() {}')
    expect(g.hasCrawling).toBe(true)
    expect(g.crawlingCount).toBeGreaterThan(0)
  })

  it('measureGlaze detects pinholing', () => {
    const g = measureGlaze(untypedCode)
    expect(g.hasPinholing).toBe(true)
  })

  it('measureFiring handles empty code', () => {
    const f = measureFiring(emptyCode)
    expect(f.temperature).toBe(0)
    expect(f.atmosphere).toBe('raw')
    expect(f.isProperlyFired).toBe(false)
  })

  it('measureFiring detects test thoroughness', () => {
    const f = measureFiring(testCode)
    expect(f.temperature).toBeGreaterThan(0)
    expect(f.isProperlyFired).toBe(true)
  })

  it('measureFiring classifies atmosphere', () => {
    expect(measureFiring(testCode).atmosphere).toBeDefined()
    expect(measureFiring(emptyCode).atmosphere).toBe('raw')
  })

  it('measureFiring detects under-fired', () => {
    const f = measureFiring('function a() {}')
    expect(f.isUnderFired).toBe(true)
  })

  it('measureFinished handles empty code', () => {
    const f = measureFinished(emptyCode)
    expect(f.hardness).toBe(0)
    expect(f.ring).toBe('thud')
    expect(f.isVitrified).toBe(false)
    expect(f.grade).toBe('amateur')
  })

  it('measureFinished evaluates strong code', () => {
    const f = measureFinished(strongCode)
    expect(f.hardness).toBeGreaterThan(0)
    expect(f.isVitrified).toBe(true)
    expect(f.hasStructuralIntegrity).toBe(true)
  })

  it('measureFinished detects fragile code', () => {
    const f = measureFinished('if (a) { if (b) { x } }')
    expect(f.isFragile).toBe(true)
  })

  it('measureFinished classifies grades', () => {
    const f = measureFinished(strongCode)
    expect(f.grade).toBeDefined()
    expect(['masterwork', 'fine-craft', 'studio-pottery', 'production', 'craft-fair', 'amateur']).toContain(f.grade)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('kiln-fire classification', () => {
  it('classifyPieceCondition returns correct conditions', () => {
    expect(classifyPieceCondition(90)).toBe('masterwork-porcelain')
    expect(classifyPieceCondition(65)).toBe('fine-stoneware')
    expect(classifyPieceCondition(45)).toBe('quality-earthenware')
    expect(classifyPieceCondition(25)).toBe('greenware')
    expect(classifyPieceCondition(10)).toBe('raw-clay')
    expect(classifyPieceCondition(0)).toBe('cracked-pot')
  })

  it('classifyKilnType returns cold for empty', () => {
    expect(classifyKilnType([])).toBe('cold')
  })

  it('classifyLoadCondition returns correct conditions', () => {
    expect(classifyLoadCondition(80)).toBe('gallery-exhibition')
    expect(classifyLoadCondition(60)).toBe('studio-collection')
    expect(classifyLoadCondition(42)).toBe('craft-market')
    expect(classifyLoadCondition(28)).toBe('pottery-class')
    expect(classifyLoadCondition(12)).toBe('messy-bench')
    expect(classifyLoadCondition(5)).toBe('clay-pit')
  })

  it('classifyPotterGrade returns correct grades', () => {
    expect(classifyPotterGrade(80)).toBe('master-potter')
    expect(classifyPotterGrade(65)).toBe('studio-potter')
    expect(classifyPotterGrade(48)).toBe('production-potter')
    expect(classifyPotterGrade(32)).toBe('hobbyist')
    expect(classifyPotterGrade(18)).toBe('student')
    expect(classifyPotterGrade(8)).toBe('child')
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('kiln-fire core analysis', () => {
  it('analyzePotteryPiece returns cracked-pot for empty code', () => {
    const p = analyzePotteryPiece(emptyCode, 'empty.ts')
    expect(p.condition).toBe('cracked-pot')
    expect(p.qualityScore).toBe(0)
    expect(p.clay.type).toBe('mud')
    expect(p.file).toBe('empty.ts')
  })

  it('analyzePotteryPiece returns non-zero scores for strong code', () => {
    const p = analyzePotteryPiece(strongCode, 'strong.ts')
    expect(p.qualityScore).toBeGreaterThan(0)
    expect(p.clayQuality).toBeGreaterThan(0)
    expect(p.greenStrength).toBeGreaterThan(0)
  })

  it('analyzePotteryPiece assigns file path correctly', () => {
    const p = analyzePotteryPiece(simpleCode, 'src/test.ts')
    expect(p.file).toBe('src/test.ts')
  })

  it('analyzePotteryPiece detects vitrified code', () => {
    const p = analyzePotteryPiece(strongCode, 'strong.ts')
    expect(p.finished.isVitrified).toBe(true)
  })
})

// ─── Kiln Load Analysis ───────────────────────────────────────────────────────

describe('kiln-fire kiln load analysis', () => {
  it('analyzeKilnLoad returns clay-pit for empty', () => {
    const k = analyzeKilnLoad([], 'empty-dir')
    expect(k.condition).toBe('clay-pit')
    expect(k.kilnType).toBe('cold')
    expect(k.pieces).toHaveLength(0)
  })

  it('analyzeKilnLoad aggregates piece scores', () => {
    const pieces = [
      analyzePotteryPiece(strongCode, 'a.ts'),
      analyzePotteryPiece(typedCode, 'b.ts'),
    ]
    const k = analyzeKilnLoad(pieces, 'src')
    expect(k.pieces).toHaveLength(2)
    expect(k.avgClayQuality).toBeGreaterThan(0)
    expect(k.directory).toBe('src')
  })

  it('analyzeKilnLoad counts masterworks and cracked', () => {
    const pieces = [analyzePotteryPiece(strongCode, 'a.ts')]
    const k = analyzeKilnLoad(pieces, 'src')
    expect(typeof k.masterworkCount).toBe('number')
    expect(typeof k.crackedCount).toBe('number')
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('kiln-fire build result', () => {
  it('buildKilnFireResult handles empty input', () => {
    const result = buildKilnFireResult([], [], {})
    expect(result.pieces).toHaveLength(0)
    expect(result.loads).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallHardness).toBe(0)
    expect(result.stats.potterGrade).toBe('child')
    expect(result.stats.bestPiece).toBe('none')
    expect(result.stats.hardestPiece).toBe('none')
    expect(result.stats.bestGlazed).toBe('none')
    expect(result.stats.mostFragile).toBe('none')
    expect(result.stats.needsFiring).toBe('none')
  })

  it('buildKilnFireResult processes single file', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    expect(result.pieces).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestPiece).toBe('a.ts')
  })

  it('buildKilnFireResult processes multiple files', () => {
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildKilnFireResult(multiFilePaths, contents, {})
    expect(result.pieces).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalLoads).toBe(1)
  })

  it('buildKilnFireResult groups by directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildKilnFireResult(paths, contents, {})
    expect(result.loads).toHaveLength(2)
  })

  it('buildKilnFireResult computes studio averages', () => {
    const result = buildKilnFireResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    expect(result.studio.avgClayQuality).toBeGreaterThanOrEqual(0)
    expect(result.studio.overallHardness).toBeGreaterThanOrEqual(0)
    expect(typeof result.studio.isProductionReady).toBe('boolean')
  })

  it('buildKilnFireResult counts clay types', () => {
    const result = buildKilnFireResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.porcelainCount + result.stats.stonewareCount +
      result.stats.earthenwareCount + result.stats.terraCottaCount
    expect(total).toBeLessThanOrEqual(3)
  })

  it('buildKilnFireResult counts condition types', () => {
    const result = buildKilnFireResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.masterworkPorcelainCount +
      result.stats.fineStonewareCount +
      result.stats.qualityEarthenwareCount +
      result.stats.greenwareCount +
      result.stats.rawClayCount +
      result.stats.crackedPotCount
    expect(total).toBe(3)
  })

  it('buildKilnFireResult handles mismatched contents', () => {
    const result = buildKilnFireResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.pieces).toHaveLength(2)
    expect(result.pieces[1].qualityScore).toBe(0)
  })

  it('buildKilnFireResult identifies extremes', () => {
    const result = buildKilnFireResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.bestPiece).toBeTruthy()
    expect(result.stats.hardestPiece).toBeTruthy()
    expect(result.stats.bestGlazed).toBeTruthy()
    expect(result.stats.mostFragile).toBeTruthy()
    expect(result.stats.needsFiring).toBeTruthy()
  })

  it('buildKilnFireResult counts feature flags', () => {
    const result = buildKilnFireResult(
      ['a.ts', 'b.ts'],
      [strongCode, consoleCode],
      {},
    )
    expect(typeof result.stats.hasTestsCount).toBe('number')
    expect(typeof result.stats.properlyFiredCount).toBe('number')
    expect(typeof result.stats.overFiredCount).toBe('number')
    expect(typeof result.stats.underFiredCount).toBe('number')
    expect(typeof result.stats.hasDocsCount).toBe('number')
    expect(typeof result.stats.hasTypesCount).toBe('number')
    expect(typeof result.stats.vitrifiedCount).toBe('number')
    expect(typeof result.stats.fragileCount).toBe('number')
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('kiln-fire recommendations', () => {
  it('generateRecommendations warns about cracked pots', () => {
    const result = buildKilnFireResult(['a.ts'], [simpleCode], {})
    if (result.stats.crackedPotCount > 0) {
      expect(result.recommendations.some(r => r.includes('Cracked pots'))).toBe(true)
    }
  })

  it('generateRecommendations praises high hardness', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    if (result.stats.overallHardness >= 60) {
      expect(result.recommendations.some(r => r.includes('Well-fired'))).toBe(true)
    }
  })

  it('generateRecommendations warns about fragile pieces', () => {
    const result = buildKilnFireResult(
      Array.from({ length: 5 }, (_, i) => `f${i}.ts`),
      Array.from({ length: 5 }, () => 'if (a) { if (b) { x } }'),
      {},
    )
    if (result.stats.fragileCount > 3) {
      expect(result.recommendations.some(r => r.includes('Fragile'))).toBe(true)
    }
  })

  it('generateRecommendations returns deduplicated array', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toEqual(unique)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('kiln-fire format helpers', () => {
  it('formatKilnFireTable returns string with header', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const table = formatKilnFireTable(result, false)
    expect(table).toContain('Kiln Fire')
    expect(table).toContain('Pieces')
    expect(table).toContain('Statistics')
  })

  it('formatKilnFireTable includes recommendations', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const table = formatKilnFireTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatKilnFireTable handles empty result', () => {
    const result = buildKilnFireResult([], [], {})
    const table = formatKilnFireTable(result, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatKilnFireTable verbose shows details', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const verbose = formatKilnFireTable(result, true)
    expect(verbose).toContain('clay:')
    expect(verbose).toContain('green:')
    expect(verbose).toContain('bisque:')
    expect(verbose).toContain('glaze:')
    expect(verbose).toContain('firing:')
    expect(verbose).toContain('finished:')
  })

  it('formatKilnFireTable truncates at 15 pieces', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleCode)
    const result = buildKilnFireResult(paths, contents, {})
    const table = formatKilnFireTable(result, false)
    expect(table).toContain('... and 5 more')
  })

  it('formatKilnFireTable shows loads section', () => {
    const result = buildKilnFireResult(['src/a.ts', 'src/b.ts'], [strongCode, diverseCode], {})
    const table = formatKilnFireTable(result, false)
    expect(table).toContain('Kiln Loads')
  })

  it('formatKilnFireTable shows studio section', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const table = formatKilnFireTable(result, false)
    expect(table).toContain('Studio')
  })

  it('formatKilnFireJson returns valid JSON', () => {
    const result = buildKilnFireResult(['a.ts'], [strongCode], {})
    const json = formatKilnFireJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json) as { pieces: unknown[] }
    expect(parsed.pieces).toHaveLength(1)
  })

  it('formatKilnFireJson handles empty result', () => {
    const result = buildKilnFireResult([], [], {})
    const json = formatKilnFireJson(result)
    const parsed = JSON.parse(json) as { stats: { totalFiles: number } }
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('kiln-fire edge cases', () => {
  it('handles code with only comments', () => {
    const p = analyzePotteryPiece('// just a comment\n/* block */', 'comment.ts')
    expect(p.file).toBe('comment.ts')
    expect(typeof p.qualityScore).toBe('number')
  })

  it('handles untyped functions', () => {
    const p = analyzePotteryPiece(untypedCode, 'untyped.ts')
    expect(p.clay.hasAirBubbles).toBe(true)
    expect(p.glaze.hasPinholing).toBe(true)
  })

  it('quality score is bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, diverseCode, testCode, consoleCode, untypedCode]
    for (const code of codes) {
      const p = analyzePotteryPiece(code, 'test.ts')
      expect(p.qualityScore).toBeGreaterThanOrEqual(0)
      expect(p.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('all sub-scores are bounded 0-100', () => {
    const p = analyzePotteryPiece(strongCode, 'test.ts')
    expect(p.clayQuality).toBeGreaterThanOrEqual(0)
    expect(p.clayQuality).toBeLessThanOrEqual(100)
    expect(p.greenStrength).toBeGreaterThanOrEqual(0)
    expect(p.greenStrength).toBeLessThanOrEqual(100)
    expect(p.bisqueHardness).toBeGreaterThanOrEqual(0)
    expect(p.bisqueHardness).toBeLessThanOrEqual(100)
    expect(p.glazeQuality).toBeGreaterThanOrEqual(0)
    expect(p.glazeQuality).toBeLessThanOrEqual(100)
    expect(p.firingTemperature).toBeGreaterThanOrEqual(0)
    expect(p.firingTemperature).toBeLessThanOrEqual(100)
    expect(p.finalHardness).toBeGreaterThanOrEqual(0)
    expect(p.finalHardness).toBeLessThanOrEqual(100)
  })

  it('overall hardness is bounded 0-100', () => {
    const result = buildKilnFireResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.overallHardness).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHardness).toBeLessThanOrEqual(100)
  })

  it('test code gets high firing temperature', () => {
    const p = analyzePotteryPiece(testCode, 'test.ts')
    expect(p.firing.temperature).toBeGreaterThan(0)
    expect(p.firing.isProperlyFired).toBe(true)
  })
})
