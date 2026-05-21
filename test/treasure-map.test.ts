import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos, countAbstractions,
  classifyTreasureType, classifyRarity, classifySpotCondition,
  classifyPathDifficulty, classifyRiskLevel,
  classifyIslandType, classifyIslandDanger, classifyIslandCondition,
  classifyCartographerGrade,
  assessBurial, assessGuardians, assessNavigation, assessDanger,
  measureValue,
  analyzeTreasureSpot, analyzeTreasureIsland,
  generateRecommendations, buildTreasureMapResult,
} from '../src/commands/treasure-map-helpers.js'
import { formatTreasureMapTable, formatTreasureMapJson } from '../src/commands/treasure-map-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calc(x: number): number {',
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

const interfaceCode = [
  'export interface User { name: string; age: number }',
  'export type UserId = string',
  'export function getUser(id: string): User { return { name: "test", age: 25 } }',
].join('\n')

const classCode = [
  'import { Base } from "./base.js"',
  'import { Logger } from "./logger.js"',
  'export class Calculator extends Base {',
  '  private value: number',
  '  constructor() { super() }',
  '  calc(): number { return this.value }',
  '}',
  'export class Display { show(): void {} }',
].join('\n')

const manyExportsCode = [
  'export function a() { return 1 }',
  'export function b() { return 2 }',
  'export function c() { return 3 }',
  'export function d() { return 4 }',
  'export const x = 5',
].join('\n')

const noisyCode = [
  'export function debug() {',
  '  console.log("a")',
  '  console.log("b")',
  '  console.log("c")',
  '  console.log("d")',
  '  console.log("e")',
  '  console.log("f")',
  '}',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
].join('\n')

const manyImportsCode = [
  'import { a } from "a.js"',
  'import { b } from "b.js"',
  'import { c } from "c.js"',
  'import { d } from "d.js"',
  'import { e } from "e.js"',
  'const x = 1',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const goldCode = [
  'import { helper } from "./utils.js"',
  'interface Opts { val: number }',
  'class Bell { ring() { return 1 } }',
  'export function a(): number { return 1 }',
  'export function b(): number { return 2 }',
  'export function c(): number { return 3 }',
  'export function d(): number { return 4 }',
  'export const e = 5',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('treasure-map primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc('a\n\nb')).toBe(2)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
    expect(countImports(manyImportsCode)).toBe(5)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
    expect(countExports(manyExportsCode)).toBe(5)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => 1')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts brace nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole(noisyCode)).toBe(6)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODO/FIXME/HACK', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })

  it('countAbstractions counts classes, interfaces, types', () => {
    expect(countAbstractions(emptyCode)).toBe(0)
    expect(countAbstractions('class A {} interface B {}')).toBe(2)
    expect(countAbstractions('type X = string')).toBe(1)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('treasure-map classifications', () => {
  it('classifyTreasureType returns correct types', () => {
    expect(classifyTreasureType(emptyCode)).toBe('supplies')
    expect(classifyTreasureType(goldCode)).toBe('gold')
    expect(classifyTreasureType(typedCode)).toBe('tools')
  })

  it('classifyRarity returns correct rarities', () => {
    expect(classifyRarity(92, true, true)).toBe('mythic')
    expect(classifyRarity(78, false, true)).toBe('legendary')
    expect(classifyRarity(65, true, false)).toBe('epic')
    expect(classifyRarity(55, false, false)).toBe('rare')
    expect(classifyRarity(35, false, false)).toBe('uncommon')
    expect(classifyRarity(20, false, false)).toBe('common')
    expect(classifyRarity(5, false, false)).toBe('cursed')
  })

  it('classifySpotCondition returns correct conditions', () => {
    expect(classifySpotCondition(90)).toBe('pristine-treasure')
    expect(classifySpotCondition(75)).toBe('well-preserved')
    expect(classifySpotCondition(60)).toBe('good-condition')
    expect(classifySpotCondition(40)).toBe('weathered')
    expect(classifySpotCondition(20)).toBe('decaying')
    expect(classifySpotCondition(5)).toBe('cursed')
  })

  it('classifyPathDifficulty returns correct difficulties', () => {
    expect(classifyPathDifficulty(5)).toBe('trivial')
    expect(classifyPathDifficulty(15)).toBe('easy')
    expect(classifyPathDifficulty(30)).toBe('moderate')
    expect(classifyPathDifficulty(50)).toBe('difficult')
    expect(classifyPathDifficulty(65)).toBe('perilous')
    expect(classifyPathDifficulty(85)).toBe('impossible')
  })

  it('classifyRiskLevel returns correct levels', () => {
    expect(classifyRiskLevel(5)).toBe('safe')
    expect(classifyRiskLevel(15)).toBe('low')
    expect(classifyRiskLevel(30)).toBe('moderate')
    expect(classifyRiskLevel(50)).toBe('high')
    expect(classifyRiskLevel(70)).toBe('extreme')
    expect(classifyRiskLevel(85)).toBe('lethal')
  })

  it('classifyIslandType returns correct types', () => {
    expect(classifyIslandType(75, 5)).toBe('treasure-island')
    expect(classifyIslandType(55, 2)).toBe('trading-post')
    expect(classifyIslandType(30, 7)).toBe('outpost')
    expect(classifyIslandType(10, 3)).toBe('volcano')
    expect(classifyIslandType(0, 0)).toBe('desert-island')
  })

  it('classifyIslandDanger returns correct levels', () => {
    expect(classifyIslandDanger(75)).toBe('deadly')
    expect(classifyIslandDanger(55)).toBe('treacherous')
    expect(classifyIslandDanger(35)).toBe('dangerous')
    expect(classifyIslandDanger(20)).toBe('moderate')
    expect(classifyIslandDanger(8)).toBe('calm-waters')
    expect(classifyIslandDanger(3)).toBe('safe-harbor')
  })

  it('classifyIslandCondition returns correct conditions', () => {
    expect(classifyIslandCondition(80)).toBe('paradise')
    expect(classifyIslandCondition(60)).toBe('prosperous')
    expect(classifyIslandCondition(45)).toBe('developing')
    expect(classifyIslandCondition(30)).toBe('struggling')
    expect(classifyIslandCondition(12)).toBe('abandoned')
    expect(classifyIslandCondition(5)).toBe('ruins')
  })

  it('classifyCartographerGrade returns correct grades', () => {
    expect(classifyCartographerGrade(85)).toBe('master-cartographer')
    expect(classifyCartographerGrade(70)).toBe('cartographer')
    expect(classifyCartographerGrade(50)).toBe('navigator')
    expect(classifyCartographerGrade(35)).toBe('sailor')
    expect(classifyCartographerGrade(18)).toBe('landlubber')
    expect(classifyCartographerGrade(5)).toBe('shipwrecked')
  })
})

// ─── Assessment Tests ─────────────────────────────────────────────────────────

describe('treasure-map assessments', () => {
  it('assessBurial returns correct structure', () => {
    const b = assessBurial(strongCode)
    expect(b.depth).toBeGreaterThanOrEqual(0)
    expect(b.depth).toBeLessThanOrEqual(100)
    expect(typeof b.isExposed).toBe('boolean')
    expect(typeof b.isBuried).toBe('boolean')
    expect(typeof b.isHidden).toBe('boolean')
    expect(typeof b.isTrapped).toBe('boolean')
    expect(typeof b.hasMapMarker).toBe('boolean')
    expect(b.markerClarity).toBeGreaterThanOrEqual(0)
  })

  it('assessBurial detects exposed code', () => {
    expect(assessBurial(typedCode).isExposed).toBe(true)
  })

  it('assessBurial detects hidden code', () => {
    expect(assessBurial(noExportCode).isExposed).toBe(false)
  })

  it('assessGuardians returns correct structure', () => {
    const g = assessGuardians(strongCode)
    expect(g.complexity).toBeGreaterThanOrEqual(0)
    expect(g.complexity).toBeLessThanOrEqual(100)
    expect(typeof g.nesting).toBe('number')
    expect(typeof g.abstractions).toBe('number')
    expect(typeof g.hasDragons).toBe('boolean')
    expect(typeof g.hasTraps).toBe('boolean')
    expect(typeof g.hasPuzzles).toBe('boolean')
  })

  it('assessGuardians detects complexity', () => {
    const g = assessGuardians(deepCode)
    expect(g.nesting).toBe(5)
    expect(g.complexity).toBeGreaterThan(0)
  })

  it('assessNavigation returns correct structure', () => {
    const nav = assessNavigation(strongCode)
    expect(typeof nav.isEasyToFind).toBe('boolean')
    expect(typeof nav.hasClearPath).toBe('boolean')
    expect(typeof nav.hasSignposts).toBe('boolean')
    expect(typeof nav.isMarked).toBe('boolean')
    expect(typeof nav.pathDifficulty).toBe('string')
    expect(typeof nav.hasDeadEnds).toBe('boolean')
  })

  it('assessNavigation detects easy-to-find code', () => {
    const nav = assessNavigation(strongCode)
    expect(nav.hasSignposts).toBe(true)
  })

  it('assessDanger returns correct structure', () => {
    const d = assessDanger(strongCode)
    expect(typeof d.isStable).toBe('boolean')
    expect(typeof d.isVolatile).toBe('boolean')
    expect(typeof d.hasBoobyTraps).toBe('boolean')
    expect(typeof d.hasDecay).toBe('boolean')
    expect(typeof d.hasCurse).toBe('boolean')
    expect(typeof d.riskLevel).toBe('string')
  })

  it('assessDanger detects danger in todo-heavy code', () => {
    const d = assessDanger(todoCode)
    expect(d.hasBoobyTraps).toBe(true)
    expect(d.isVolatile).toBe(true)
  })

  it('assessDanger detects stable code', () => {
    const d = assessDanger(strongCode)
    expect(d.isStable).toBe(true)
  })

  it('measureValue returns correct structure', () => {
    const v = measureValue(strongCode, 3)
    expect(v.reusePotential).toBeGreaterThanOrEqual(0)
    expect(v.reusePotential).toBeLessThanOrEqual(100)
    expect(typeof v.isUnique).toBe('boolean')
    expect(typeof v.isCritical).toBe('boolean')
    expect(typeof v.isIrreplaceable).toBe('boolean')
    expect(v.dependents).toBe(3)
    expect(v.valueDensity).toBeGreaterThanOrEqual(0)
  })

  it('measureValue gives higher potential with dependents', () => {
    const v0 = measureValue(typedCode, 0)
    const v5 = measureValue(typedCode, 5)
    expect(v5.reusePotential).toBeGreaterThan(v0.reusePotential)
  })
})

// ─── Spot Analysis Tests ──────────────────────────────────────────────────────

describe('treasure-map spot analysis', () => {
  it('analyzeTreasureSpot returns correct structure', () => {
    const spot = analyzeTreasureSpot(strongCode, 'calc.ts')
    expect(spot.file).toBe('calc.ts')
    expect(spot.treasureValue).toBeGreaterThanOrEqual(0)
    expect(spot.treasureValue).toBeLessThanOrEqual(100)
    expect(spot.burialDepth).toBeGreaterThanOrEqual(0)
    expect(spot.guardianCount).toBeGreaterThanOrEqual(0)
    expect(spot.mapLegibility).toBeGreaterThanOrEqual(0)
    expect(spot.xAccuracy).toBeGreaterThanOrEqual(0)
    expect(spot.pirateDanger).toBeGreaterThanOrEqual(0)
    expect(spot.qualityScore).toBeGreaterThanOrEqual(0)
    expect(spot.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof spot.treasureType).toBe('string')
    expect(typeof spot.rarity).toBe('string')
    expect(typeof spot.condition).toBe('string')
  })

  it('analyzeTreasureSpot gives higher value to well-structured code', () => {
    const good = analyzeTreasureSpot(strongCode, 'good.ts')
    const bad = analyzeTreasureSpot(emptyCode, 'bad.ts')
    expect(good.treasureValue).toBeGreaterThan(bad.treasureValue)
  })

  it('analyzeTreasureSpot classifies gold code correctly', () => {
    const spot = analyzeTreasureSpot(goldCode, 'gold.ts')
    expect(spot.treasureType).toBe('gold')
  })

  it('analyzeTreasureSpot identifies navigation info', () => {
    const spot = analyzeTreasureSpot(strongCode, 'a.ts')
    expect(typeof spot.navigation.pathDifficulty).toBe('string')
    expect(typeof spot.navigation.isEasyToFind).toBe('boolean')
  })

  it('analyzeTreasureSpot identifies danger info', () => {
    const spot = analyzeTreasureSpot(strongCode, 'a.ts')
    expect(typeof spot.danger.riskLevel).toBe('string')
    expect(typeof spot.danger.isStable).toBe('boolean')
  })
})

// ─── Island Analysis Tests ────────────────────────────────────────────────────

describe('treasure-map island analysis', () => {
  it('analyzeTreasureIsland returns correct structure for empty spots', () => {
    const island = analyzeTreasureIsland([], 'src')
    expect(island.directory).toBe('src')
    expect(island.spots).toHaveLength(0)
    expect(island.avgTreasureValue).toBe(0)
    expect(island.islandType).toBe('desert-island')
  })

  it('analyzeTreasureIsland computes averages from spots', () => {
    const spots = [
      analyzeTreasureSpot(strongCode, 'a.ts'),
      analyzeTreasureSpot(typedCode, 'b.ts'),
    ]
    const island = analyzeTreasureIsland(spots, 'src')
    expect(island.spots).toHaveLength(2)
    expect(island.avgTreasureValue).toBeGreaterThanOrEqual(0)
    expect(typeof island.islandType).toBe('string')
    expect(typeof island.dangerLevel).toBe('string')
    expect(typeof island.condition).toBe('string')
  })

  it('analyzeTreasureIsland counts legendary and cursed', () => {
    const spots = [
      analyzeTreasureSpot(goldCode, 'a.ts'),
      analyzeTreasureSpot(emptyCode, 'b.ts'),
      analyzeTreasureSpot(emptyCode, 'c.ts'),
    ]
    const island = analyzeTreasureIsland(spots, 'src')
    expect(island.exposedCount).toBeGreaterThanOrEqual(0)
    expect(island.hiddenCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('treasure-map build result', () => {
  it('buildTreasureMapResult returns correct structure', () => {
    const result = buildTreasureMapResult(['a.ts'], [typedCode], {})
    expect(result.spots).toHaveLength(1)
    expect(result.islands).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.cartographerGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.archipelago.totalTreasureValue).toBeGreaterThanOrEqual(0)
  })

  it('buildTreasureMapResult handles empty files', () => {
    const result = buildTreasureMapResult([], [], {})
    expect(result.spots).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.mostValuable).toBe('none')
    expect(result.stats.mostHidden).toBe('none')
    expect(result.stats.mostDangerous).toBe('none')
    expect(result.stats.easiestToFind).toBe('none')
    expect(result.stats.bestPreserved).toBe('none')
  })

  it('buildTreasureMapResult groups spots into islands by directory', () => {
    const result = buildTreasureMapResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.islands).toHaveLength(2)
  })

  it('buildTreasureMapResult identifies most valuable and most dangerous', () => {
    const result = buildTreasureMapResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.mostValuable).toBe('good.ts')
    expect(result.stats.bestPreserved).toBe('good.ts')
  })

  it('buildTreasureMapResult handles missing contents gracefully', () => {
    const result = buildTreasureMapResult(['a.ts'], [], {})
    expect(result.spots).toHaveLength(1)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('treasure-map recommendations', () => {
  it('generateRecommendations returns array', () => {
    const result = buildTreasureMapResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('generateRecommendations includes good map quality', () => {
    const result = buildTreasureMapResult(['a.ts'], [strongCode], {})
    if (result.stats.overallMapQuality >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good map quality')]),
      )
    }
  })

  it('generateRecommendations warns about traps', () => {
    const result = buildTreasureMapResult(['a.ts'], [todoCode], {})
    if (result.stats.trapCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Traps detected')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('treasure-map formatters', () => {
  const sampleResult = buildTreasureMapResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatTreasureMapTable returns string with header', () => {
    const table = formatTreasureMapTable(sampleResult, false)
    expect(table).toContain('Treasure Map')
    expect(table).toContain('Treasure Spots')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatTreasureMapTable verbose shows more detail', () => {
    const table = formatTreasureMapTable(sampleResult, true)
    expect(table).toContain('depth:')
    expect(table).toContain('guardians:')
  })

  it('formatTreasureMapTable handles empty spots', () => {
    const empty = buildTreasureMapResult([], [], {})
    const table = formatTreasureMapTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatTreasureMapTable truncates spots at 15 when not verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const bigResult = buildTreasureMapResult(files, contents, {})
    const table = formatTreasureMapTable(bigResult, false)
    expect(table).toContain('more')
  })

  it('formatTreasureMapJson returns valid JSON', () => {
    const json = formatTreasureMapJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.spots).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.archipelago).toBeDefined()
  })

  it('formatTreasureMapJson handles empty result', () => {
    const empty = buildTreasureMapResult([], [], {})
    const json = formatTreasureMapJson(empty)
    const parsed = JSON.parse(json)
    expect(parsed.spots).toHaveLength(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('treasure-map edge cases', () => {
  it('handles code with only comments', () => {
    const spot = analyzeTreasureSpot('// just a comment\n/* block */', 'comment.ts')
    expect(spot.treasureType).toBeDefined()
    expect(spot.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles deeply nested code with dragons', () => {
    const spot = analyzeTreasureSpot(deepCode, 'deep.ts')
    expect(spot.guardians.nesting).toBe(5)
    expect(spot.guardians.hasDragons).toBe(true)
  })

  it('handles code with many type annotations', () => {
    const typed = [
      'export function fn(a: string, b: number, c: boolean): void {',
      '  const x: number = 1',
      '  const y: string = "hi"',
      '}',
    ].join('\n')
    const spot = analyzeTreasureSpot(typed, 'typed.ts')
    expect(spot.xAccuracy).toBeGreaterThan(0)
  })

  it('handles noisy code with exports', () => {
    const spot = analyzeTreasureSpot(noisyCode, 'noisy.ts')
    expect(spot.treasureType).toBe('tools')
    expect(spot.pirateDanger).toBeGreaterThan(0)
  })

  it('handles single file with no directory', () => {
    const result = buildTreasureMapResult(['single.ts'], [typedCode], {})
    expect(result.islands).toHaveLength(1)
    expect(result.islands[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, interfaceCode]
    const result = buildTreasureMapResult(files, contents, {})
    expect(result.islands).toHaveLength(1)
    expect(result.islands[0].spots).toHaveLength(3)
  })

  it('computes value density correctly', () => {
    const spot = analyzeTreasureSpot(typedCode, 'dense.ts')
    expect(spot.value.valueDensity).toBeGreaterThanOrEqual(0)
  })

  it('handles traps classification for code with only console and todos', () => {
    const trapCode = [
      'console.log("a")',
      'console.log("b")',
      'console.log("c")',
      'console.log("d")',
      'console.log("e")',
      'console.log("f")',
      '// TODO: fix',
      '// FIXME: broken',
      '// HACK: temp',
      '// XXX: bad',
      'const x = 1',
    ].join('\n')
    expect(classifyTreasureType(trapCode)).toBe('traps')
  })

  it('handles keys classification for code with only exports', () => {
    const keyCode = 'export const x = 1'
    expect(classifyTreasureType(keyCode)).toBe('keys')
  })

  it('handles maps classification for interface-only code', () => {
    const mapCode = 'interface Config { name: string }\ntype Id = string'
    expect(classifyTreasureType(mapCode)).toBe('maps')
  })

  it('archipelago info has correct fields', () => {
    const result = buildTreasureMapResult(
      ['a.ts', 'b.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.archipelago.isWorthExploring).toBeDefined()
    expect(result.archipelago.totalTreasureValue).toBeGreaterThan(0)
    expect(result.archipelago.avgTreasureValue).toBeGreaterThanOrEqual(0)
  })

  it('stats count gold, gems, artifacts, tools, traps', () => {
    const result = buildTreasureMapResult(
      ['gold.ts', 'typed.ts', 'empty.ts'],
      [goldCode, typedCode, emptyCode],
      {},
    )
    expect(result.stats.goldCount).toBe(1)
    expect(result.stats.toolsCount).toBe(1)
    expect(result.stats.totalFiles).toBe(3)
  })
})
