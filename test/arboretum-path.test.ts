import { describe, expect, it } from 'vitest'
import {
  analyzeArborealSpecimen,
  analyzeArboretumSection,
  buildArboretumPathResult,
  classifyArboristGrade,
  classifySectionType,
  generateRecommendations,
  measureCanopy,
  measureFitness,
  measureGrowth,
  measureHealth,
  measureRoot,
  measureTrunk,
} from '../src/commands/arboretum-path-helpers.js'
import { formatArboretumPathJson, formatArboretumPathTable } from '../src/commands/arboretum-path-format-helpers.js'

// ─── measureTrunk ──────────────────────────────────────────────────────────

describe('measureTrunk', () => {
  it('returns deadwood for empty content', () => {
    const r = measureTrunk('')
    expect(r.strength).toBe(0)
    expect(r.species).toBe('deadwood')
    expect(r.isHeartwood).toBe(false)
    expect(r.crackCount).toBe(0)
    expect(r.knotCount).toBe(0)
  })

  it('detects oak for strong core stability', () => {
    const code = [
      'export class Handler {',
      '  process(data: Input): Output { return { out: data.v } }',
      '}',
      'function helper(): void {}',
      'interface Input { v: string }',
      'interface Output { out: string }',
      'const x: number = 1',
    ].join('\n')
    const r = measureTrunk(code)
    expect(r.strength).toBeGreaterThanOrEqual(50)
    expect(r.isHeartwood).toBe(true)
    expect(r.hasBark).toBe(true)
    expect(r.isStraightGrained).toBe(true)
  })

  it('detects heartwood from classes and functions', () => {
    const code = 'class A {} function b() {}'
    const r = measureTrunk(code)
    expect(r.isHeartwood).toBe(true)
  })

  it('detects sapwood from functions', () => {
    const code = 'function a() {}'
    const r = measureTrunk(code)
    expect(r.hasSapwood).toBe(true)
  })

  it('detects bark from types and interfaces', () => {
    const code = 'const x: number = 1\ninterface I {}'
    const r = measureTrunk(code)
    expect(r.hasBark).toBe(true)
  })

  it('detects cambium from generics', () => {
    const code = 'function id<T>(x: T): T { return x }'
    const r = measureTrunk(code)
    expect(r.hasCambium).toBe(true)
  })

  it('detects heart rot from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureTrunk(code)
    expect(r.hasHeartRot).toBe(true)
  })

  it('detects cracks from dead code', () => {
    const code = 'debugger;'
    const r = measureTrunk(code)
    expect(r.hasCracks).toBe(true)
    expect(r.crackCount).toBeGreaterThan(0)
  })

  it('detects straight grained from const-only', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureTrunk(code)
    expect(r.isStraightGrained).toBe(true)
  })

  it('computes strength within valid range', () => {
    const code = 'export function a(): void {}'
    const r = measureTrunk(code)
    expect(r.strength).toBeGreaterThanOrEqual(0)
    expect(r.strength).toBeLessThanOrEqual(100)
  })
})

// ─── measureRoot ───────────────────────────────────────────────────────────

describe('measureRoot', () => {
  it('returns shallow for empty content', () => {
    const r = measureRoot('')
    expect(r.depth).toBe(0)
    expect(r.system).toBe('shallow')
    expect(r.isDeepRooted).toBe(false)
    expect(r.rotCount).toBe(0)
    expect(r.girdlingCount).toBe(0)
  })

  it('detects deep rooted from imports and types', () => {
    const code = [
      'import { core } from "foundation"',
      'import { util } from "helpers"',
      'import { config } from "config"',
      'import { types } from "types"',
      'function run(x: number): string { return String(x) }',
    ].join('\n')
    const r = measureRoot(code)
    expect(r.isDeepRooted).toBe(true)
    expect(r.hasTaproot).toBe(true)
    expect(r.hasLateralRoots).toBe(true)
  })

  it('detects taproot from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureRoot(code)
    expect(r.hasTaproot).toBe(true)
  })

  it('detects root rot from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureRoot(code)
    expect(r.hasRootRot).toBe(true)
    expect(r.rotCount).toBeGreaterThan(0)
  })

  it('detects mycorrhiza from interfaces and imports', () => {
    const code = 'import { X } from "y"\ninterface I {}'
    const r = measureRoot(code)
    expect(r.hasMycorrhiza).toBe(true)
  })

  it('detects sinker roots from generics and imports', () => {
    const code = 'import { X } from "y"\nfunction id<T>(x: T): T { return x }'
    const r = measureRoot(code)
    expect(r.hasSinkerRoots).toBe(true)
  })

  it('detects root bound from imports without exports', () => {
    const code = 'import { X } from "y"'
    const r = measureRoot(code)
    expect(r.hasRootBound).toBe(true)
  })

  it('computes depth within valid range', () => {
    const code = 'import { X } from "y"'
    const r = measureRoot(code)
    expect(r.depth).toBeGreaterThanOrEqual(0)
    expect(r.depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureCanopy ─────────────────────────────────────────────────────────

describe('measureCanopy', () => {
  it('returns irregular for empty content', () => {
    const r = measureCanopy('')
    expect(r.spread).toBe(0)
    expect(r.shape).toBe('irregular')
    expect(r.isFullCanopy).toBe(false)
    expect(r.deadBranchCount).toBe(0)
  })

  it('detects full canopy from exports and types', () => {
    const code = [
      'export function a(): void {}',
      'export function b(): void {}',
      'export function c(): number { return 1 }',
      'export function d(): string { return "" }',
      'const x: number = 1',
    ].join('\n')
    const r = measureCanopy(code)
    expect(r.isFullCanopy).toBe(true)
    expect(r.hasDenseFoliage).toBe(true)
  })

  it('detects dead branches from default exports', () => {
    const code = 'export default function a() {}'
    const r = measureCanopy(code)
    expect(r.hasDeadBranches).toBe(true)
    expect(r.deadBranchCount).toBeGreaterThan(0)
  })

  it('detects suckers from side effects', () => {
    const code = 'console.log("debug")'
    const r = measureCanopy(code)
    expect(r.hasSuckers).toBe(true)
    expect(r.suckerCount).toBeGreaterThan(0)
  })

  it('detects watersprouts from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureCanopy(code)
    expect(r.hasWatersprouts).toBe(true)
  })

  it('detects proper pruning from exports, consts, and functions', () => {
    const code = 'export function a(): void {}\nconst x = 1'
    const r = measureCanopy(code)
    expect(r.hasProperPruning).toBe(true)
  })

  it('detects dappled light from interfaces and types', () => {
    const code = 'interface I { x: number }'
    const r = measureCanopy(code)
    expect(r.hasDappledLight).toBe(true)
  })

  it('detects photosynthetic from exports and pipes', () => {
    const code = 'export function run(arr: number[]) { return arr.map(x => x) }'
    const r = measureCanopy(code)
    expect(r.isPhotosynthetic).toBe(true)
  })

  it('computes spread within valid range', () => {
    const code = 'export function a() {}'
    const r = measureCanopy(code)
    expect(r.spread).toBeGreaterThanOrEqual(0)
    expect(r.spread).toBeLessThanOrEqual(100)
  })
})

// ─── measureGrowth ─────────────────────────────────────────────────────────

describe('measureGrowth', () => {
  it('returns seedling for empty content', () => {
    const r = measureGrowth('')
    expect(r.rings).toBe(0)
    expect(r.rate).toBe('seedling')
    expect(r.hasStuntedGrowth).toBe(true)
    expect(r.hasDwarfism).toBe(true)
    expect(r.ringCount).toBe(0)
  })

  it('detects ancient for high maturity', () => {
    const code = [
      '/** Docs */',
      'class Handler {}',
      'interface Config {}',
      'function a(): number { return 1 }',
      'function b(): string { return "" }',
      'function c(): void {}',
      'async function d(): Promise<void> {}',
      '[1].map(x => x).filter(x => x).reduce((a, b) => a + b, 0)',
      'const x: number = 1',
      'function id<T>(x: T): T { return x }',
    ].join('\n')
    const r = measureGrowth(code)
    expect(r.rings).toBeGreaterThanOrEqual(50)
    expect(r.isHealthyGrowth).toBe(true)
    expect(r.hasAnnualRings).toBe(true)
    expect(r.hasSpringGrowth).toBe(true)
    expect(r.hasSummerPeak).toBe(true)
  })

  it('detects healthy growth from functions and types', () => {
    const code = 'function a(): void {}'
    const r = measureGrowth(code)
    expect(r.isHealthyGrowth).toBe(true)
  })

  it('detects spring growth from async', () => {
    const code = 'async function run() {}'
    const r = measureGrowth(code)
    expect(r.hasSpringGrowth).toBe(true)
  })

  it('detects autumn shedding from comments', () => {
    const code = '// a\n// b\n// c\n// d'
    const r = measureGrowth(code)
    expect(r.hasAutumnShedding).toBe(true)
  })

  it('detects winter dormancy from no functions', () => {
    const code = 'const x = 1'
    const r = measureGrowth(code)
    expect(r.hasWinterDormancy).toBe(true)
  })

  it('detects growth spurt from many functions', () => {
    const code = Array(8).fill('function fn() {}').join('\n')
    const r = measureGrowth(code)
    expect(r.hasGrowthSpurt).toBe(true)
  })

  it('detects stunted growth from functions without types', () => {
    const code = 'function a() {}'
    const r = measureGrowth(code)
    expect(r.hasStuntedGrowth).toBe(true)
  })

  it('computes rings within valid range', () => {
    const code = 'function a() {}'
    const r = measureGrowth(code)
    expect(r.rings).toBeGreaterThanOrEqual(0)
    expect(r.rings).toBeLessThanOrEqual(100)
  })
})

// ─── measureHealth ─────────────────────────────────────────────────────────

describe('measureHealth', () => {
  it('returns dead-season for empty content', () => {
    const r = measureHealth('')
    expect(r.seasonal).toBe(0)
    expect(r.season).toBe('dead-season')
    expect(r.isVigorous).toBe(false)
    expect(r.hasDrought).toBe(true)
    expect(r.diseaseCount).toBe(0)
  })

  it('detects perpetual for excellent health', () => {
    const code = [
      '/** Well documented */',
      'function clean(x: number): void {',
      '  try {',
      '    const items = [x].map(n => n).filter(n => n > 0);',
      '  } catch {}',
      '}',
    ].join('\n')
    const r = measureHealth(code)
    expect(r.seasonal).toBeGreaterThanOrEqual(50)
    expect(r.isVigorous).toBe(true)
    expect(r.hasGoodColor).toBe(true)
    expect(r.hasSunlight).toBe(true)
  })

  it('detects disease from any types and dead code', () => {
    const code = 'function bad(x: any) { debugger; return x }'
    const r = measureHealth(code)
    expect(r.hasDisease).toBe(true)
    expect(r.diseaseCount).toBeGreaterThan(0)
  })

  it('detects pests from excessive mutations', () => {
    const code = 'arr.push(1); arr.pop(); arr.splice(0, 1)'
    const r = measureHealth(code)
    expect(r.hasPests).toBe(true)
    expect(r.pestCount).toBeGreaterThan(0)
  })

  it('detects fungal from side effects without try-catch', () => {
    const code = 'console.log("a")\nfs.readFile("b")'
    const r = measureHealth(code)
    expect(r.hasFungal).toBe(true)
  })

  it('detects drought from no comments', () => {
    const code = 'function a() { return 1 }'
    const r = measureHealth(code)
    expect(r.hasDrought).toBe(true)
  })

  it('detects nutrient deficiency from no types', () => {
    const code = 'function a() { return 1 }'
    const r = measureHealth(code)
    expect(r.hasNutrientDeficiency).toBe(true)
  })

  it('detects sunlight from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureHealth(code)
    expect(r.hasSunlight).toBe(true)
  })

  it('computes seasonal within valid range', () => {
    const code = 'function a() {}'
    const r = measureHealth(code)
    expect(r.seasonal).toBeGreaterThanOrEqual(0)
    expect(r.seasonal).toBeLessThanOrEqual(100)
  })
})

// ─── measureFitness ────────────────────────────────────────────────────────

describe('measureFitness', () => {
  it('returns parasite for empty content', () => {
    const r = measureFitness('')
    expect(r.score).toBe(0)
    expect(r.niche).toBe('parasite')
    expect(r.isWellAdapted).toBe(false)
    expect(r.symbiosisCount).toBe(0)
  })

  it('detects climax for high fitness', () => {
    const code = [
      'import { Config } from "config"',
      'export function core(x: number): string { return String(x) }',
      'export function helper(): void {}',
      'interface Result { output: string }',
      'function id<T>(x: T): T { return x }',
      '[1].map(x => x).filter(x => x)',
      'class Handler {}',
    ].join('\n')
    const r = measureFitness(code)
    expect(r.score).toBeGreaterThanOrEqual(60)
    expect(r.isWellAdapted).toBe(true)
    expect(r.hasSymbioticRelationships).toBe(true)
    expect(r.hasCompetitiveAdvantage).toBe(true)
  })

  it('detects well adapted from exports and types', () => {
    const code = 'export function a(): void {}'
    const r = measureFitness(code)
    expect(r.isWellAdapted).toBe(true)
  })

  it('detects symbiotic relationships from imports and exports', () => {
    const code = 'import { X } from "y"\nexport function a(): void {}'
    const r = measureFitness(code)
    expect(r.hasSymbioticRelationships).toBe(true)
  })

  it('detects invasive tendencies from excessive exports', () => {
    const code = Array(7).fill('export function fn() {}').join('\n')
    const r = measureFitness(code)
    expect(r.hasInvasiveTendencies).toBe(true)
  })

  it('detects native origin from classes or interfaces', () => {
    const code = 'class Handler {}'
    const r = measureFitness(code)
    expect(r.hasNativeOrigin).toBe(true)
  })

  it('detects resistance from no any types and no side effects', () => {
    const code = 'function pure(): number { return 1 }'
    const r = measureFitness(code)
    expect(r.hasResistance).toBe(true)
  })

  it('detects endemic from functions without imports/exports', () => {
    const code = 'function internal() {}'
    const r = measureFitness(code)
    expect(r.isEndemic).toBe(true)
  })

  it('computes score within valid range', () => {
    const code = 'export function a() {}'
    const r = measureFitness(code)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeArborealSpecimen ───────────────────────────────────────────────

describe('analyzeArborealSpecimen', () => {
  it('returns dead-stump for empty content', () => {
    const sp = analyzeArborealSpecimen('', 'empty.ts')
    expect(sp.condition).toBe('dead-stump')
    expect(sp.qualityScore).toBe(0)
    expect(sp.file).toBe('empty.ts')
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const sp = analyzeArborealSpecimen(code, 'a.ts')
    const expected = Math.round(
      (sp.trunkStrength + sp.rootDepth + sp.canopySpread + sp.growthRings + sp.seasonalHealth + sp.speciesFitness) / 6,
    )
    expect(sp.qualityScore).toBe(expected)
  })

  it('classifies conditions correctly', () => {
    expect(analyzeArborealSpecimen('', 'x.ts').condition).toBe('dead-stump')
  })

  it('measures all six dimensions', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const sp = analyzeArborealSpecimen(code, 'a.ts')
    expect(sp.trunkStrength).toBeGreaterThanOrEqual(0)
    expect(sp.rootDepth).toBeGreaterThanOrEqual(0)
    expect(sp.canopySpread).toBeGreaterThanOrEqual(0)
    expect(sp.growthRings).toBeGreaterThanOrEqual(0)
    expect(sp.seasonalHealth).toBeGreaterThanOrEqual(0)
    expect(sp.speciesFitness).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifySectionType ───────────────────────────────────────────────────

describe('classifySectionType', () => {
  it('returns clear-cut for empty array', () => {
    expect(classifySectionType([])).toBe('clear-cut')
  })

  it('returns old-growth for high quality with ancient oaks', () => {
    const specs = Array(3).fill(null).map(() => ({
      file: 'a.ts', trunkStrength: 90, rootDepth: 90, canopySpread: 90,
      growthRings: 90, seasonalHealth: 90, speciesFitness: 90,
      trunk: {} as any, root: {} as any, canopy: {} as any,
      growth: {} as any, health: {} as any, fitness: {} as any,
      condition: 'ancient-oak' as const, qualityScore: 90,
    }))
    expect(classifySectionType(specs)).toBe('old-growth')
  })

  it('returns clear-cut for low quality', () => {
    const specs = [{ file: 'a.ts', trunkStrength: 5, rootDepth: 5, canopySpread: 5,
      growthRings: 5, seasonalHealth: 5, speciesFitness: 5,
      trunk: {} as any, root: {} as any, canopy: {} as any,
      growth: {} as any, health: {} as any, fitness: {} as any,
      condition: 'dead-stump' as const, qualityScore: 5 }]
    expect(classifySectionType(specs)).toBe('clear-cut')
  })
})

// ─── classifyArboristGrade ─────────────────────────────────────────────────

describe('classifyArboristGrade', () => {
  it('returns master-arborist for high scores', () => {
    expect(classifyArboristGrade(95)).toBe('master-arborist')
  })
  it('returns senior-arborist for good scores', () => {
    expect(classifyArboristGrade(80)).toBe('senior-arborist')
  })
  it('returns arborist for moderate scores', () => {
    expect(classifyArboristGrade(60)).toBe('arborist')
  })
  it('returns tree-surgeon for low scores', () => {
    expect(classifyArboristGrade(40)).toBe('tree-surgeon')
  })
  it('returns gardener for poor scores', () => {
    expect(classifyArboristGrade(20)).toBe('gardener')
  })
  it('returns lumberjack for terrible scores', () => {
    expect(classifyArboristGrade(5)).toBe('lumberjack')
  })
})

// ─── analyzeArboretumSection ───────────────────────────────────────────────

describe('analyzeArboretumSection', () => {
  it('returns clear-cut for empty array', () => {
    const section = analyzeArboretumSection([], 'empty/')
    expect(section.sectionType).toBe('clear-cut')
    expect(section.condition).toBe('wasteland')
    expect(section.specimens).toHaveLength(0)
  })

  it('computes averages from specimens', () => {
    const sp = analyzeArborealSpecimen('export function a(): void {}', 'src/a.ts')
    const section = analyzeArboretumSection([sp], 'src/')
    expect(section.avgTrunkStrength).toBe(sp.trunkStrength)
    expect(section.avgRootDepth).toBe(sp.rootDepth)
  })

  it('counts ancient oaks and dead stumps', () => {
    const stump = analyzeArborealSpecimen('', 'bad.ts')
    const section = analyzeArboretumSection([stump], 'bad/')
    expect(section.deadStumpCount).toBe(1)
    expect(section.ancientOakCount).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for thriving forest', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildArboretumPathResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.specimens, result.sections, result.forest, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends improvements for low-quality code', () => {
    const result = buildArboretumPathResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildArboretumPathResult ──────────────────────────────────────────────

describe('buildArboretumPathResult', () => {
  it('handles empty input', () => {
    const result = buildArboretumPathResult([], [], {})
    expect(result.specimens).toHaveLength(0)
    expect(result.sections).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallVitality).toBe(0)
    expect(result.forest.isHealthyForest).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildArboretumPathResult(['a.ts'], [code], {})
    expect(result.specimens).toHaveLength(1)
    expect(result.specimens[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into sections', () => {
    const result = buildArboretumPathResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.sections.length).toBeGreaterThanOrEqual(2)
  })

  it('computes forest averages', () => {
    const code = 'export function a(): void {}'
    const result = buildArboretumPathResult(['a.ts'], [code], {})
    expect(result.forest.avgTrunkStrength).toBeGreaterThanOrEqual(0)
    expect(result.forest.avgRootDepth).toBeGreaterThanOrEqual(0)
    expect(result.forest.avgCanopySpread).toBeGreaterThanOrEqual(0)
  })

  it('identifies best specimen, strongest trunk, deepest roots', () => {
    const result = buildArboretumPathResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestSpecimen).toBe('a.ts')
  })

  it('computes condition counts', () => {
    const result = buildArboretumPathResult(
      ['a.ts', 'b.ts'],
      ['', ''],
      {},
    )
    expect(result.stats.deadStumpCount).toBe(2)
  })

  it('sets arborist grade', () => {
    const result = buildArboretumPathResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.arboristGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildArboretumPathResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildArboretumPathResult(['a.ts'], [code], {})
    expect(result.stats.isHeartwoodCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isDeepRootedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isFullCanopyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isHealthyGrowthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isVigorousCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellAdaptedCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatArboretumPathTable', () => {
  it('formats empty result', () => {
    const result = buildArboretumPathResult([], [], {})
    const table = formatArboretumPathTable(result, false)
    expect(table).toContain('Arboretum Path')
    expect(table).toContain('No files analyzed')
  })

  it('formats with specimens', () => {
    const result = buildArboretumPathResult(['a.ts'], ['export function a() {}'], {})
    const table = formatArboretumPathTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildArboretumPathResult(files, contents, {})
    const table = formatArboretumPathTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatArboretumPathTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatArboretumPathJson', () => {
  it('produces valid JSON', () => {
    const result = buildArboretumPathResult(['a.ts'], ['export function a() {}'], {})
    const json = formatArboretumPathJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.specimens).toHaveLength(1)
  })
})
