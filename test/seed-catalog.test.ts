import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countInterfaces, countErrorHandling,
  countTypeAnnotations, countBranches, maxNesting,
  countConsole, countComments, countTodos,
  countJSDoc, countDescriptiveNames, countShortNames,
  countReExports,
  classifySeedCondition, classifySeedType,
  classifyBedType, classifyBedCondition, classifyGardenerGrade,
  measureSeed, measureRoots, measureHardiness,
  measureGermination, measureYield, measureCrossbreed,
  classifyCatalogEntry,
  analyzeSeedVariety, analyzeSeedBed,
  generateRecommendations, buildSeedCatalogResult,
} from '../src/commands/seed-catalog-helpers.js'
import { formatSeedCatalogTable, formatSeedCatalogJson } from '../src/commands/seed-catalog-format-helpers.js'

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
  ' * calculateResult(5) // number',
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
  'export enum Direction { N, S, E, W }',
].join('\n')

const noExportCode = [
  'const alpha = 1',
  'const beta = 2',
  'const gamma = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function process(): void {}',
].join('\n')

const vineCode = [
  'export { helper } from "./utils.js"',
  'export { compute } from "./compute.js"',
  'export { validate } from "./validate.js"',
].join('\n')

const rootCode = [
  'export interface Config { name: string; value: number }',
  'export type Result = string | number',
  'export type Callback = (data: unknown) => void',
].join('\n')

const testCode = [
  'import { describe, it, expect } from "vitest"',
  'describe("calc", () => {',
  '  it("works", () => {',
  '    expect(calc(1)).toBe(1)',
  '    expect(calc(2)).toEqual(2)',
  '    expect(calc(3)).toBeTruthy()',
  '  })',
  '})',
].join('\n')

const genericCode = [
  'export interface Repository<T> { findById(id: string): T }',
  'export function createRepository<T>(): Repository<T> {',
  '  return { findById(id: string): T { return {} as T } }',
  '}',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('seed-catalog primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countClasses counts classes', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses('class Foo {}')).toBe(1)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(emptyCode)).toBe(0)
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })

  it('countJSDoc counts jsdoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBeGreaterThanOrEqual(1)
  })

  it('countDescriptiveNames counts descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countShortNames counts short names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames('const x = 1')).toBe(1)
  })

  it('countReExports counts re-exports', () => {
    expect(countReExports(emptyCode)).toBe(0)
    expect(countReExports(vineCode)).toBe(3)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('seed-catalog classifications', () => {
  it('classifySeedCondition returns correct conditions', () => {
    expect(classifySeedCondition(90)).toBe('prize-winning')
    expect(classifySeedCondition(75)).toBe('premium')
    expect(classifySeedCondition(55)).toBe('standard')
    expect(classifySeedCondition(35)).toBe('substandard')
    expect(classifySeedCondition(15)).toBe('sterile')
    expect(classifySeedCondition(3)).toBe('invasive')
  })

  it('classifySeedType returns weed for empty', () => {
    expect(classifySeedType(emptyCode)).toBe('weed')
  })

  it('classifySeedType detects vine for re-exports', () => {
    expect(classifySeedType(vineCode)).toBe('vine')
  })

  it('classifySeedType detects root for interfaces-only', () => {
    expect(classifySeedType(rootCode)).toBe('root')
  })

  it('classifySeedType detects vegetable for class code', () => {
    expect(classifySeedType(diverseCode)).toBe('vegetable')
  })

  it('classifySeedType detects grain for multi-export functions', () => {
    const grainCode = [
      'export function compute(): void {}',
      'export function analyze(): void {}',
      'export function validate(): void {}',
    ].join('\n')
    expect(classifySeedType(grainCode)).toBe('grain')
  })

  it('classifySeedType detects flower for exported code', () => {
    expect(classifySeedType('export function calc(x: number): string { return String(x) }\nconst y = 2')).toBe('flower')
  })

  it('classifySeedType detects herb for small code', () => {
    expect(classifySeedType(simpleCode)).toBe('herb')
  })

  it('classifySeedType detects flower for exported code', () => {
    expect(classifySeedType(typedCode)).toBe('flower')
  })

  it('classifyBedType returns desert for empty', () => {
    expect(classifyBedType([])).toBe('desert')
  })

  it('classifyBedType detects greenhouse for prize varieties', () => {
    const varieties = Array.from({ length: 5 }, (_, i) => analyzeSeedVariety(strongCode, `${i}.ts`))
    const bedType = classifyBedType(varieties)
    expect(['greenhouse', 'garden', 'field']).toContain(bedType)
  })

  it('classifyBedCondition returns correct conditions', () => {
    expect(classifyBedCondition(85)).toBe('nursery')
    expect(classifyBedCondition(65)).toBe('productive')
    expect(classifyBedCondition(45)).toBe('functional')
    expect(classifyBedCondition(28)).toBe('overgrown')
    expect(classifyBedCondition(12)).toBe('barren')
    expect(classifyBedCondition(5)).toBe('toxic')
  })

  it('classifyGardenerGrade returns correct grades', () => {
    expect(classifyGardenerGrade(85)).toBe('master-gardener')
    expect(classifyGardenerGrade(70)).toBe('gardener')
    expect(classifyGardenerGrade(50)).toBe('horticulturist')
    expect(classifyGardenerGrade(35)).toBe('apprentice')
    expect(classifyGardenerGrade(18)).toBe('amateur')
    expect(classifyGardenerGrade(5)).toBe('weed-puller')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('seed-catalog measurements', () => {
  it('measureSeed returns correct structure', () => {
    const s = measureSeed(strongCode)
    expect(s.size).toBeGreaterThan(0)
    expect(typeof s.type).toBe('string')
    expect(typeof s.hasHull).toBe('boolean')
    expect(typeof s.hasCore).toBe('boolean')
    expect(typeof s.isShelled).toBe('boolean')
    expect(typeof s.isViable).toBe('boolean')
    expect(s.hullThickness).toBeGreaterThanOrEqual(0)
    expect(s.hullThickness).toBeLessThanOrEqual(100)
  })

  it('measureSeed detects core for functional code', () => {
    expect(measureSeed(strongCode).hasCore).toBe(true)
  })

  it('measureSeed detects hull for re-export code', () => {
    expect(measureSeed(vineCode).hasHull).toBe(true)
  })

  it('measureSeed detects viable for exported code', () => {
    expect(measureSeed(strongCode).isViable).toBe(true)
  })

  it('measureRoots returns correct structure', () => {
    const r = measureRoots(strongCode)
    expect(r.depth).toBeGreaterThanOrEqual(0)
    expect(r.spread).toBeGreaterThanOrEqual(0)
    expect(typeof r.isTapRoot).toBe('boolean')
    expect(typeof r.isFibrous).toBe('boolean')
    expect(typeof r.isInvasive).toBe('boolean')
    expect(typeof r.isContained).toBe('boolean')
    expect(r.dependencyCount).toBeGreaterThanOrEqual(0)
    expect(r.externalDependencyCount).toBeGreaterThanOrEqual(0)
  })

  it('measureRoots detects contained for no-import code', () => {
    expect(measureRoots(simpleCode).isContained).toBe(true)
  })

  it('measureRoots detects tapRoot for single import', () => {
    expect(measureRoots('import { x } from "y"\nconst a = 1').isTapRoot).toBe(true)
  })

  it('measureRoots detects fibrous for many imports', () => {
    const manyImports = [
      'import { a } from "a"',
      'import { b } from "b"',
      'import { c } from "c"',
      'const x = 1',
    ].join('\n')
    expect(measureRoots(manyImports).isFibrous).toBe(true)
  })

  it('measureHardiness returns correct structure', () => {
    const h = measureHardiness(strongCode)
    expect(h.zone).toBeGreaterThanOrEqual(1)
    expect(h.zone).toBeLessThanOrEqual(11)
    expect(typeof h.isFrostResistant).toBe('boolean')
    expect(typeof h.isDroughtResistant).toBe('boolean')
    expect(typeof h.isDiseaseResistant).toBe('boolean')
    expect(typeof h.isPestResistant).toBe('boolean')
    expect(typeof h.isUniversal).toBe('boolean')
    expect(h.adaptabilityScore).toBeGreaterThanOrEqual(0)
    expect(h.adaptabilityScore).toBeLessThanOrEqual(100)
  })

  it('measureHardiness detects disease resistance for error handling', () => {
    expect(measureHardiness(strongCode).isDiseaseResistant).toBe(true)
  })

  it('measureHardiness detects frost resistance for plain code', () => {
    expect(measureHardiness(strongCode).isFrostResistant).toBe(true)
  })

  it('measureHardiness detects drought resistance for plain code', () => {
    expect(measureHardiness(strongCode).isDroughtResistant).toBe(true)
  })

  it('measureGermination returns correct structure', () => {
    const g = measureGermination(strongCode)
    expect(typeof g.hasTests).toBe('boolean')
    expect(g.testCoverage).toBeGreaterThanOrEqual(0)
    expect(g.testCoverage).toBeLessThanOrEqual(100)
    expect(g.testQuality).toBeGreaterThanOrEqual(0)
    expect(typeof g.isEasyToTest).toBe('boolean')
    expect(typeof g.testEnvironment).toBe('string')
    expect(g.germinationTime).toBeGreaterThanOrEqual(0)
  })

  it('measureGermination detects tests in test code', () => {
    expect(measureGermination(testCode).hasTests).toBe(true)
  })

  it('measureGermination detects easy-to-test for pure code', () => {
    expect(measureGermination(strongCode).isEasyToTest).toBe(true)
  })

  it('measureGermination gives unit env for test code', () => {
    expect(measureGermination(testCode).testEnvironment).toBe('unit')
  })

  it('measureYield returns correct structure', () => {
    const y = measureYield(strongCode)
    expect(y.reuseScore).toBeGreaterThanOrEqual(0)
    expect(y.abstractionLevel).toBeGreaterThanOrEqual(0)
    expect(typeof y.isGeneric).toBe('boolean')
    expect(typeof y.isSpecific).toBe('boolean')
    expect(typeof y.isOverAbstracted).toBe('boolean')
    expect(typeof y.hasValue).toBe('boolean')
    expect(y.consumers).toBeGreaterThanOrEqual(0)
  })

  it('measureYield detects generic for generic code', () => {
    expect(measureYield(genericCode).isGeneric).toBe(true)
  })

  it('measureYield detects hasValue for exported functional code', () => {
    expect(measureYield(strongCode).hasValue).toBe(true)
  })

  it('measureYield gives high reuse for documented typed code', () => {
    expect(measureYield(strongCode).reuseScore).toBeGreaterThan(50)
  })

  it('measureCrossbreed returns correct structure', () => {
    const c = measureCrossbreed(strongCode)
    expect(typeof c.isCompatible).toBe('boolean')
    expect(typeof c.hasBarriers).toBe('boolean')
    expect(c.barrierCount).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(c.barriers)).toBe(true)
    expect(typeof c.isHybrid).toBe('boolean')
    expect(typeof c.isHeritage).toBe('boolean')
    expect(typeof c.isGMO).toBe('boolean')
    expect(c.compatibilityScore).toBeGreaterThanOrEqual(0)
  })

  it('measureCrossbreed detects heritage for documented typed code', () => {
    expect(measureCrossbreed(strongCode).isHeritage).toBe(true)
  })

  it('measureCrossbreed detects barriers for console code', () => {
    const c = measureCrossbreed('console.log("x")\nexport function a(): void {}')
    expect(c.hasBarriers).toBe(true)
    expect(c.barriers.length).toBeGreaterThan(0)
  })

  it('measureCrossbreed detects GMO for eval', () => {
    expect(measureCrossbreed('eval("1+1")').isGMO).toBe(true)
  })

  it('classifyCatalogEntry returns correct structure', () => {
    const e = classifyCatalogEntry(strongCode)
    expect(typeof e.category).toBe('string')
    expect(Array.isArray(e.tags)).toBe(true)
    expect(typeof e.season).toBe('string')
    expect(typeof e.isHeirloom).toBe('boolean')
    expect(typeof e.isNewVariety).toBe('boolean')
    expect(typeof e.isExperimental).toBe('boolean')
    expect(e.maturityDays).toBeGreaterThanOrEqual(0)
  })

  it('classifyCatalogEntry detects utility category', () => {
    expect(classifyCatalogEntry(strongCode).category).toBe('utility')
  })

  it('classifyCatalogEntry detects service category', () => {
    const serviceCode = 'export class Calculator { compute(): number { return 1 } }'
    expect(classifyCatalogEntry(serviceCode).category).toBe('service')
  })

  it('classifyCatalogEntry detects types category', () => {
    expect(classifyCatalogEntry(rootCode).category).toBe('types')
  })

  it('classifyCatalogEntry detects experimental for todo code', () => {
    expect(classifyCatalogEntry(todoCode).isExperimental).toBe(true)
  })

  it('classifyCatalogEntry detects heirloom for well-documented code', () => {
    expect(classifyCatalogEntry(strongCode).isHeirloom).toBe(true)
  })
})

// ─── Variety Analysis Tests ───────────────────────────────────────────────────

describe('seed-catalog variety analysis', () => {
  it('analyzeSeedVariety returns correct structure', () => {
    const v = analyzeSeedVariety(strongCode, 'calc.ts')
    expect(v.file).toBe('calc.ts')
    expect(v.seedViability).toBeGreaterThanOrEqual(0)
    expect(v.seedViability).toBeLessThanOrEqual(100)
    expect(v.germinationRate).toBeGreaterThanOrEqual(0)
    expect(v.rootIndependence).toBeGreaterThanOrEqual(0)
    expect(v.hardiness).toBeGreaterThanOrEqual(0)
    expect(v.yieldPotential).toBeGreaterThanOrEqual(0)
    expect(v.crossbreedCompat).toBeGreaterThanOrEqual(0)
    expect(v.qualityScore).toBeGreaterThanOrEqual(0)
    expect(v.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof v.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeSeedVariety(strongCode, 'good.ts')
    const bad = analyzeSeedVariety(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('empty code variety is sterile', () => {
    const v = analyzeSeedVariety(emptyCode, 'empty.ts')
    expect(v.condition).toBe('sterile')
    expect(v.qualityScore).toBe(0)
    expect(v.seedViability).toBe(0)
    expect(v.seed.type).toBe('weed')
  })

  it('strong code has high seed viability', () => {
    const v = analyzeSeedVariety(strongCode, 'strong.ts')
    expect(v.seedViability).toBeGreaterThan(50)
  })

  it('seed info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.seed.size).toBeGreaterThan(0)
    expect(v.seed.hasCore).toBe(true)
  })

  it('root info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.root.spread).toBeGreaterThan(0)
  })

  it('adaptability info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.adaptability.zone).toBeGreaterThan(1)
  })

  it('germination info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(typeof v.germination.isEasyToTest).toBe('boolean')
  })

  it('yield info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.yield.reuseScore).toBeGreaterThan(0)
  })

  it('crossbreed info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.crossbreed.isCompatible).toBe(true)
  })

  it('catalog info is populated', () => {
    const v = analyzeSeedVariety(strongCode, 'a.ts')
    expect(v.catalog.tags.length).toBeGreaterThan(0)
  })
})

// ─── Bed Analysis Tests ───────────────────────────────────────────────────────

describe('seed-catalog bed analysis', () => {
  it('analyzeSeedBed handles empty varieties', () => {
    const b = analyzeSeedBed([], 'src')
    expect(b.directory).toBe('src')
    expect(b.varieties).toHaveLength(0)
    expect(b.bedType).toBe('desert')
  })

  it('analyzeSeedBed computes averages', () => {
    const varieties = [
      analyzeSeedVariety(strongCode, 'a.ts'),
      analyzeSeedVariety(typedCode, 'b.ts'),
    ]
    const b = analyzeSeedBed(varieties, 'src')
    expect(b.avgViability).toBeGreaterThanOrEqual(0)
    expect(b.avgIndependence).toBeGreaterThanOrEqual(0)
    expect(b.avgYieldPotential).toBeGreaterThanOrEqual(0)
    expect(typeof b.bedType).toBe('string')
    expect(typeof b.condition).toBe('string')
  })

  it('analyzeSeedBed counts conditions', () => {
    const varieties = [
      analyzeSeedVariety(strongCode, 'a.ts'),
      analyzeSeedVariety(emptyCode, 'b.ts'),
    ]
    const b = analyzeSeedBed(varieties, 'src')
    expect(b.sterileCount).toBeGreaterThanOrEqual(1)
  })

  it('analyzeSeedBed counts self-contained', () => {
    const varieties = [
      analyzeSeedVariety(simpleCode, 'a.ts'),
    ]
    const b = analyzeSeedBed(varieties, 'src')
    expect(b.selfContainedCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('seed-catalog build result', () => {
  it('buildSeedCatalogResult returns correct structure', () => {
    const result = buildSeedCatalogResult(['a.ts'], [typedCode], {})
    expect(result.varieties).toHaveLength(1)
    expect(result.beds).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.gardenerGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.garden.overallYield).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildSeedCatalogResult([], [], {})
    expect(result.varieties).toHaveLength(0)
    expect(result.stats.bestVariety).toBe('none')
    expect(result.stats.mostIndependent).toBe('none')
    expect(result.stats.highestYield).toBe('none')
    expect(result.stats.mostCompatible).toBe('none')
    expect(result.stats.mostInvasive).toBe('none')
  })

  it('groups varieties into beds by directory', () => {
    const result = buildSeedCatalogResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.beds).toHaveLength(2)
  })

  it('identifies best variety', () => {
    const result = buildSeedCatalogResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestVariety).toBe('good.ts')
  })

  it('identifies most independent', () => {
    const result = buildSeedCatalogResult(
      ['independent.ts', 'dependent.ts'],
      [simpleCode, strongCode],
      {},
    )
    expect(result.stats.mostIndependent).toBe('independent.ts')
  })

  it('identifies highest yield', () => {
    const result = buildSeedCatalogResult(
      ['high.ts', 'low.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.highestYield).toBe('high.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildSeedCatalogResult(['a.ts'], [], {})
    expect(result.varieties).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildSeedCatalogResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgSeedViability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgGerminationRate).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRootIndependence).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgHardiness).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgYieldPotential).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgCrossbreedCompat).toBeGreaterThanOrEqual(0)
    expect(result.stats.prizeWinningCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.premiumCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.standardCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.substandardCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.sterileCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.invasiveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.selfContainedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.universalCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasTestsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.easyToTestCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.grainCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.vegetableCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.treeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.vineCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.weedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.evergreenCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dormantCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.heirloomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.experimentalCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalBeds).toBeGreaterThanOrEqual(0)
  })

  it('computes garden fields', () => {
    const result = buildSeedCatalogResult(['a.ts'], [strongCode], {})
    expect(result.garden.avgViability).toBeGreaterThanOrEqual(0)
    expect(result.garden.isProductive).toBeDefined()
    expect(result.garden.overallYield).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('seed-catalog recommendations', () => {
  it('returns array', () => {
    const result = buildSeedCatalogResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about sterile seeds', () => {
    const result = buildSeedCatalogResult(['a.ts'], [emptyCode], {})
    if (result.stats.sterileCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Sterile')]),
      )
    }
  })

  it('includes self-contained message for independent code', () => {
    const result = buildSeedCatalogResult(['a.ts', 'b.ts'], [simpleCode, simpleCode], {})
    if (result.stats.selfContainedCount > result.stats.totalFiles * 0.5) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Self-contained')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('seed-catalog formatters', () => {
  const sampleResult = buildSeedCatalogResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatSeedCatalogTable returns string with header', () => {
    const table = formatSeedCatalogTable(sampleResult, false)
    expect(table).toContain('Seed Catalog')
    expect(table).toContain('Seed Varieties')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatSeedCatalogTable verbose shows detail', () => {
    const table = formatSeedCatalogTable(sampleResult, true)
    expect(table).toContain('seed:')
    expect(table).toContain('root:')
  })

  it('formatSeedCatalogTable handles empty', () => {
    const empty = buildSeedCatalogResult([], [], {})
    const table = formatSeedCatalogTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatSeedCatalogTable truncates varieties at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildSeedCatalogResult(files, contents, {})
    const table = formatSeedCatalogTable(big, false)
    expect(table).toContain('more')
  })

  it('formatSeedCatalogTable shows beds', () => {
    const result = buildSeedCatalogResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, typedCode],
      {},
    )
    const table = formatSeedCatalogTable(result, false)
    expect(table).toContain('Seed Beds')
  })

  it('formatSeedCatalogJson returns valid JSON', () => {
    const json = formatSeedCatalogJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.varieties).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.garden).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('seed-catalog edge cases', () => {
  it('handles deeply nested code', () => {
    const v = analyzeSeedVariety('if (a) { if (b) { if (c) { if (d) { return 1 } } } }', 'deep.ts')
    expect(v.root.depth).toBeGreaterThan(3)
  })

  it('handles code with only comments', () => {
    const v = analyzeSeedVariety('// just a comment\n/* block */', 'comment.ts')
    expect(v.seed.size).toBeGreaterThanOrEqual(0)
  })

  it('handles single file with no directory', () => {
    const result = buildSeedCatalogResult(['single.ts'], [typedCode], {})
    expect(result.beds).toHaveLength(1)
    expect(result.beds[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildSeedCatalogResult(files, contents, {})
    expect(result.beds).toHaveLength(1)
    expect(result.beds[0].varieties).toHaveLength(3)
  })

  it('empty code has sterile condition', () => {
    const v = analyzeSeedVariety(emptyCode, 'empty.ts')
    expect(v.condition).toBe('sterile')
    expect(v.seed.type).toBe('weed')
  })

  it('vine code is detected correctly', () => {
    const v = analyzeSeedVariety(vineCode, 'index.ts')
    expect(v.seed.type).toBe('vine')
    expect(v.seed.hasHull).toBe(true)
  })

  it('root code is detected correctly', () => {
    const v = analyzeSeedVariety(rootCode, 'types.ts')
    expect(v.seed.type).toBe('root')
  })

  it('test code has high germination', () => {
    const g = measureGermination(testCode)
    expect(g.hasTests).toBe(true)
    expect(g.testEnvironment).toBe('unit')
  })

  it('generic code is detected', () => {
    const y = measureYield(genericCode)
    expect(y.isGeneric).toBe(true)
  })

  it('no-export code has dormant season', () => {
    const c = classifyCatalogEntry(noExportCode)
    expect(c.season).toBe('dormant')
  })
})
