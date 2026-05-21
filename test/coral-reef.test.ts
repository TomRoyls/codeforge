import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countInterfaces, countTypeAliases, countEnums,
  countConstructors, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments, countTodos,
  classifyPolypCondition, classifySpeciesVariety, classifyGrowthForm,
  classifyZoneType, classifyReefCondition, classifyMarineBiologistGrade,
  measureSpecies, measureSymbiosis, measureWaterQuality,
  measureBleaching, measureEcosystem, measureReefGrowth,
  analyzeCoralPolyp, analyzeReefZone,
  generateRecommendations, buildCoralReefResult,
} from '../src/commands/coral-reef-helpers.js'
import { formatCoralReefTable, formatCoralReefJson } from '../src/commands/coral-reef-format-helpers.js'

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
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

const noisyCode = [
  'console.log("a")',
  'console.log("b")',
  'console.log("c")',
  'console.log("d")',
  'export function f() {}',
].join('\n')

const branchyCode = [
  'if (a) {}',
  'if (b) {}',
  'if (c) {}',
  'if (d) {}',
  'function x() {}',
].join('\n')

const testCode = [
  'import { describe, it, expect } from "vitest"',
  'describe("calc", () => {',
  '  it("works", () => {',
  '    expect(calc(1)).toBe(1)',
  '  })',
  '})',
].join('\n')

const heavyImportCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'import { f } from "f"',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('coral-reef primitives', () => {
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

  it('countTypeAliases counts types', () => {
    expect(countTypeAliases(emptyCode)).toBe(0)
    expect(countTypeAliases('type Foo = string')).toBe(1)
  })

  it('countEnums counts enums', () => {
    expect(countEnums(emptyCode)).toBe(0)
    expect(countEnums('enum Dir { N, S }')).toBe(1)
  })

  it('countConstructors counts constructors', () => {
    expect(countConstructors(emptyCode)).toBe(0)
    expect(countConstructors('constructor() {}')).toBe(1)
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
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('coral-reef classifications', () => {
  it('classifyPolypCondition returns correct conditions', () => {
    expect(classifyPolypCondition(90)).toBe('thriving')
    expect(classifyPolypCondition(70)).toBe('healthy')
    expect(classifyPolypCondition(50)).toBe('stressed')
    expect(classifyPolypCondition(25)).toBe('bleaching')
    expect(classifyPolypCondition(10)).toBe('damaged')
    expect(classifyPolypCondition(3)).toBe('dead')
  })

  it('classifySpeciesVariety returns correct varieties', () => {
    expect(classifySpeciesVariety(6)).toBe('thriving')
    expect(classifySpeciesVariety(5)).toBe('thriving')
    expect(classifySpeciesVariety(4)).toBe('rich')
    expect(classifySpeciesVariety(3)).toBe('diverse')
    expect(classifySpeciesVariety(2)).toBe('moderate')
    expect(classifySpeciesVariety(1)).toBe('low-diversity')
    expect(classifySpeciesVariety(0)).toBe('mono-culture')
  })

  it('classifyGrowthForm returns correct forms', () => {
    expect(classifyGrowthForm(deepCode)).toBe('columnar')
    expect(classifyGrowthForm(diverseCode)).toBe('branching')
    expect(classifyGrowthForm(heavyImportCode)).toBe('encrusting')
  })

  it('classifyZoneType returns atoll for empty', () => {
    expect(classifyZoneType([])).toBe('atoll')
  })

  it('classifyReefCondition returns correct conditions', () => {
    expect(classifyReefCondition(85)).toBe('pristine-reef')
    expect(classifyReefCondition(65)).toBe('healthy-reef')
    expect(classifyReefCondition(45)).toBe('stressed-reef')
    expect(classifyReefCondition(25)).toBe('degraded-reef')
    expect(classifyReefCondition(10)).toBe('bleached-reef')
    expect(classifyReefCondition(3)).toBe('dead-reef')
  })

  it('classifyMarineBiologistGrade returns correct grades', () => {
    expect(classifyMarineBiologistGrade(85)).toBe('marine-biologist')
    expect(classifyMarineBiologistGrade(70)).toBe('reef-scientist')
    expect(classifyMarineBiologistGrade(50)).toBe('aquarist')
    expect(classifyMarineBiologistGrade(35)).toBe('diver')
    expect(classifyMarineBiologistGrade(18)).toBe('tourist')
    expect(classifyMarineBiologistGrade(5)).toBe('polluter')
  })

  it('classifyZoneType detects dead-zone', () => {
    const deadPolyps = Array.from({ length: 3 }, () => analyzeCoralPolyp(emptyCode, 'x.ts'))
    expect(classifyZoneType(deadPolyps)).toBe('dead-zone')
  })

  it('classifyZoneType detects reef-crest', () => {
    const goodPolyps = Array.from({ length: 3 }, (_, i) => analyzeCoralPolyp(strongCode, `${i}.ts`))
    expect(classifyZoneType(goodPolyps)).toBe('reef-crest')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('coral-reef measurements', () => {
  it('measureSpecies returns correct structure', () => {
    const s = measureSpecies(diverseCode)
    expect(s.functions).toBeGreaterThan(0)
    expect(s.classes).toBeGreaterThan(0)
    expect(s.interfaces).toBeGreaterThan(0)
    expect(s.types).toBeGreaterThan(0)
    expect(s.enums).toBeGreaterThan(0)
    expect(s.constructors).toBeGreaterThan(0)
    expect(s.total).toBeGreaterThan(0)
    expect(typeof s.dominant).toBe('string')
    expect(typeof s.variety).toBe('string')
  })

  it('measureSpecies detects thriving diversity', () => {
    expect(measureSpecies(diverseCode).variety).toBe('thriving')
  })

  it('measureSpecies detects mono-culture for simple code', () => {
    expect(measureSpecies(simpleCode).variety).toBe('mono-culture')
  })

  it('measureSpecies counts total correctly', () => {
    const s = measureSpecies(diverseCode)
    expect(s.total).toBe(s.constructors + s.functions + s.classes + s.interfaces + s.types + s.enums)
  })

  it('measureSymbiosis returns correct structure', () => {
    const s = measureSymbiosis(strongCode)
    expect(s.mutualismCount).toBeGreaterThanOrEqual(0)
    expect(s.commensalismCount).toBeGreaterThanOrEqual(0)
    expect(s.parasitismCount).toBeGreaterThanOrEqual(0)
    expect(typeof s.hasZooxanthellae).toBe('boolean')
    expect(s.mutualism).toBeGreaterThanOrEqual(0)
    expect(s.mutualism).toBeLessThanOrEqual(100)
    expect(s.parasitism).toBeGreaterThanOrEqual(0)
    expect(s.parasitism).toBeLessThanOrEqual(100)
    expect(s.symbiosisScore).toBeGreaterThanOrEqual(0)
    expect(s.symbiosisScore).toBeLessThanOrEqual(100)
  })

  it('measureSymbiosis detects zooxanthellae with helper imports', () => {
    expect(measureSymbiosis('import { helper } from "./utils.js"').hasZooxanthellae).toBe(true)
    expect(measureSymbiosis(simpleCode).hasZooxanthellae).toBe(false)
  })

  it('measureSymbiosis gives better score for strong code', () => {
    const good = measureSymbiosis(strongCode)
    const bad = measureSymbiosis(simpleCode)
    expect(good.symbiosisScore).toBeGreaterThan(bad.symbiosisScore)
  })

  it('measureWaterQuality returns correct structure', () => {
    const w = measureWaterQuality(strongCode)
    expect(w.temperature).toBeGreaterThanOrEqual(0)
    expect(w.acidity).toBeGreaterThanOrEqual(0)
    expect(w.turbidity).toBeGreaterThanOrEqual(0)
    expect(w.oxygenLevel).toBeGreaterThanOrEqual(0)
    expect(typeof w.isClean).toBe('boolean')
    expect(typeof w.isPolluted).toBe('boolean')
    expect(Array.isArray(w.pollutionSources)).toBe(true)
  })

  it('measureWaterQuality detects clean water for good code', () => {
    const w = measureWaterQuality(strongCode)
    expect(w.oxygenLevel).toBeGreaterThan(50)
  })

  it('measureWaterQuality detects pollution sources', () => {
    const w = measureWaterQuality(todoCode)
    expect(w.pollutionSources.length).toBeGreaterThan(0)
  })

  it('measureBleaching returns correct structure', () => {
    const b = measureBleaching(strongCode)
    expect(b.risk).toBeGreaterThanOrEqual(0)
    expect(b.risk).toBeLessThanOrEqual(100)
    expect(typeof b.isBleaching).toBe('boolean')
    expect(typeof b.hasRecovered).toBe('boolean')
    expect(typeof b.hasNecrosis).toBe('boolean')
    expect(b.deadPortions).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(b.bleachingCauses)).toBe(true)
  })

  it('measureBleaching gives high risk for empty code', () => {
    const b = measureBleaching(emptyCode)
    expect(b.risk).toBeGreaterThanOrEqual(80)
  })

  it('measureBleaching detects necrosis with todos', () => {
    expect(measureBleaching(todoCode).hasNecrosis).toBe(true)
  })

  it('measureBleaching detects recovery for strong code', () => {
    expect(measureBleaching(strongCode).hasRecovered).toBe(true)
  })

  it('measureEcosystem returns correct structure', () => {
    const e = measureEcosystem(strongCode)
    expect(typeof e.providesHabitat).toBe('boolean')
    expect(e.habitatComplexity).toBeGreaterThanOrEqual(0)
    expect(typeof e.hasNursery).toBe('boolean')
    expect(e.nurseryQuality).toBeGreaterThanOrEqual(0)
    expect(e.supportsSpecies).toBeGreaterThanOrEqual(0)
    expect(typeof e.isKeystone).toBe('boolean')
    expect(typeof e.isIndicator).toBe('boolean')
  })

  it('measureEcosystem detects habitat from exports', () => {
    expect(measureEcosystem(typedCode).providesHabitat).toBe(true)
    expect(measureEcosystem(noExportCode).providesHabitat).toBe(false)
  })

  it('measureEcosystem detects nursery from test patterns', () => {
    expect(measureEcosystem(testCode).hasNursery).toBe(true)
    expect(measureEcosystem(simpleCode).hasNursery).toBe(false)
  })

  it('measureEcosystem detects keystone', () => {
    expect(measureEcosystem(strongCode).isKeystone).toBe(true)
  })

  it('measureReefGrowth returns correct structure', () => {
    const r = measureReefGrowth(strongCode)
    expect(typeof r.isFoundation).toBe('boolean')
    expect(typeof r.isBranching).toBe('boolean')
    expect(typeof r.isMassive).toBe('boolean')
    expect(typeof r.isEncrusting).toBe('boolean')
    expect(typeof r.isTable).toBe('boolean')
    expect(typeof r.isFreeLiving).toBe('boolean')
    expect(typeof r.growthForm).toBe('string')
  })

  it('measureReefGrowth detects foundation', () => {
    expect(measureReefGrowth(diverseCode).isFoundation).toBe(true)
  })
})

// ─── Polyp Analysis Tests ─────────────────────────────────────────────────────

describe('coral-reef polyp analysis', () => {
  it('analyzeCoralPolyp returns correct structure', () => {
    const p = analyzeCoralPolyp(strongCode, 'calc.ts')
    expect(p.file).toBe('calc.ts')
    expect(p.coralHealth).toBeGreaterThanOrEqual(0)
    expect(p.coralHealth).toBeLessThanOrEqual(100)
    expect(p.speciesDiversity).toBeGreaterThanOrEqual(0)
    expect(p.symbiosisQuality).toBeGreaterThanOrEqual(0)
    expect(p.waterClarity).toBeGreaterThanOrEqual(0)
    expect(p.biodiversityIndex).toBeGreaterThanOrEqual(0)
    expect(p.reefResilience).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof p.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeCoralPolyp(strongCode, 'good.ts')
    const bad = analyzeCoralPolyp(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('empty code polyp is dead', () => {
    const p = analyzeCoralPolyp(emptyCode, 'empty.ts')
    expect(p.condition).toBe('dead')
    expect(p.qualityScore).toBe(0)
    expect(p.coralHealth).toBe(0)
  })

  it('diverse code has high species diversity', () => {
    const p = analyzeCoralPolyp(diverseCode, 'diverse.ts')
    expect(p.speciesDiversity).toBeGreaterThan(80)
  })

  it('species info is populated', () => {
    const p = analyzeCoralPolyp(diverseCode, 'a.ts')
    expect(p.species.total).toBeGreaterThan(0)
    expect(p.species.variety).toBe('thriving')
  })

  it('symbiosis info is populated', () => {
    const p = analyzeCoralPolyp(strongCode, 'a.ts')
    expect(p.symbiosis.symbiosisScore).toBeGreaterThan(0)
  })

  it('reef growth info is populated', () => {
    const p = analyzeCoralPolyp(strongCode, 'a.ts')
    expect(typeof p.reef.growthForm).toBe('string')
  })

  it('water quality info is populated', () => {
    const p = analyzeCoralPolyp(strongCode, 'a.ts')
    expect(p.water.oxygenLevel).toBeGreaterThan(0)
  })

  it('bleaching info is populated', () => {
    const p = analyzeCoralPolyp(strongCode, 'a.ts')
    expect(p.bleaching.risk).toBeLessThan(50)
  })

  it('ecosystem info is populated', () => {
    const p = analyzeCoralPolyp(strongCode, 'a.ts')
    expect(p.ecosystem.providesHabitat).toBe(true)
    expect(p.ecosystem.isKeystone).toBe(true)
  })
})

// ─── Reef Zone Tests ──────────────────────────────────────────────────────────

describe('coral-reef zone analysis', () => {
  it('analyzeReefZone handles empty polyps', () => {
    const z = analyzeReefZone([], 'src')
    expect(z.directory).toBe('src')
    expect(z.polyps).toHaveLength(0)
    expect(z.zoneType).toBe('atoll')
    expect(z.condition).toBe('pristine-reef')
  })

  it('analyzeReefZone computes averages', () => {
    const polyps = [
      analyzeCoralPolyp(strongCode, 'a.ts'),
      analyzeCoralPolyp(typedCode, 'b.ts'),
    ]
    const z = analyzeReefZone(polyps, 'src')
    expect(z.avgHealth).toBeGreaterThanOrEqual(0)
    expect(z.avgDiversity).toBeGreaterThanOrEqual(0)
    expect(z.avgSymbiosis).toBeGreaterThanOrEqual(0)
    expect(z.avgClarity).toBeGreaterThanOrEqual(0)
    expect(typeof z.zoneType).toBe('string')
    expect(typeof z.condition).toBe('string')
    expect(z.totalSpecies).toBeGreaterThan(0)
  })

  it('analyzeReefZone counts conditions', () => {
    const polyps = [
      analyzeCoralPolyp(strongCode, 'a.ts'),
      analyzeCoralPolyp(emptyCode, 'b.ts'),
    ]
    const z = analyzeReefZone(polyps, 'src')
    expect(z.deadCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('coral-reef build result', () => {
  it('buildCoralReefResult returns correct structure', () => {
    const result = buildCoralReefResult(['a.ts'], [typedCode], {})
    expect(result.polyps).toHaveLength(1)
    expect(result.zones).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.marineBiologistGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.ocean.overallReefHealth).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildCoralReefResult([], [], {})
    expect(result.polyps).toHaveLength(0)
    expect(result.stats.healthiestPolyp).toBe('none')
    expect(result.stats.mostDiverse).toBe('none')
    expect(result.stats.bestSymbiosis).toBe('none')
    expect(result.stats.mostPolluted).toBe('none')
    expect(result.stats.mostBleached).toBe('none')
  })

  it('groups polyps into zones by directory', () => {
    const result = buildCoralReefResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.zones).toHaveLength(2)
  })

  it('identifies healthiest polyp', () => {
    const result = buildCoralReefResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.healthiestPolyp).toBe('good.ts')
  })

  it('identifies most bleached', () => {
    const result = buildCoralReefResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.mostBleached).toBe('bad.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildCoralReefResult(['a.ts'], [], {})
    expect(result.polyps).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildCoralReefResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgCoralHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSpeciesDiversity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSymbiosisQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWaterClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBiodiversityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgReefResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalSpecies).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMutualism).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgParasitism).toBeGreaterThanOrEqual(0)
    expect(result.stats.foundationModules).toBeGreaterThanOrEqual(0)
    expect(result.stats.keystoneModules).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasZooxanthellaeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.providesHabitatCount).toBeGreaterThanOrEqual(0)
  })

  it('computes ocean fields', () => {
    const result = buildCoralReefResult(['a.ts'], [strongCode], {})
    expect(result.ocean.avgHealth).toBeGreaterThanOrEqual(0)
    expect(result.ocean.avgDiversity).toBeGreaterThanOrEqual(0)
    expect(result.ocean.avgSymbiosis).toBeGreaterThanOrEqual(0)
    expect(result.ocean.avgClarity).toBeGreaterThanOrEqual(0)
    expect(typeof result.ocean.isHealthy).toBe('boolean')
    expect(result.ocean.overallReefHealth).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('coral-reef recommendations', () => {
  it('returns array', () => {
    const result = buildCoralReefResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about dead zones', () => {
    const result = buildCoralReefResult(['a.ts'], [emptyCode], {})
    if (result.stats.deadCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Dead zones')]),
      )
    }
  })

  it('includes healthy reef message for good code', () => {
    const result = buildCoralReefResult(['a.ts'], [strongCode], {})
    if (result.stats.overallReefHealth >= 70) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Healthy reef')]),
      )
    }
  })

  it('warns about pollution', () => {
    const result = buildCoralReefResult(['a.ts'], [todoCode], {})
    if (result.stats.isPollutedCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Pollution')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('coral-reef formatters', () => {
  const sampleResult = buildCoralReefResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatCoralReefTable returns string with header', () => {
    const table = formatCoralReefTable(sampleResult, false)
    expect(table).toContain('Coral Reef')
    expect(table).toContain('Coral Polyps')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatCoralReefTable verbose shows detail', () => {
    const table = formatCoralReefTable(sampleResult, true)
    expect(table).toContain('species:')
    expect(table).toContain('bleaching:')
  })

  it('formatCoralReefTable handles empty', () => {
    const empty = buildCoralReefResult([], [], {})
    const table = formatCoralReefTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatCoralReefTable truncates polyps at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildCoralReefResult(files, contents, {})
    const table = formatCoralReefTable(big, false)
    expect(table).toContain('more')
  })

  it('formatCoralReefTable shows zones', () => {
    const result = buildCoralReefResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, typedCode],
      {},
    )
    const table = formatCoralReefTable(result, false)
    expect(table).toContain('Reef Zones')
  })

  it('formatCoralReefJson returns valid JSON', () => {
    const json = formatCoralReefJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.polyps).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ocean).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('coral-reef edge cases', () => {
  it('handles deeply nested code', () => {
    const p = analyzeCoralPolyp(deepCode, 'deep.ts')
    expect(p.reef.growthForm).toBe('columnar')
    expect(p.water.turbidity).toBeGreaterThan(0)
  })

  it('handles code with only comments', () => {
    const p = analyzeCoralPolyp('// just a comment\n/* block */', 'comment.ts')
    expect(p.species.total).toBeGreaterThanOrEqual(0)
  })

  it('handles single file with no directory', () => {
    const result = buildCoralReefResult(['single.ts'], [typedCode], {})
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildCoralReefResult(files, contents, {})
    expect(result.zones).toHaveLength(1)
    expect(result.zones[0].polyps).toHaveLength(3)
  })

  it('empty code has dead condition', () => {
    const p = analyzeCoralPolyp(emptyCode, 'empty.ts')
    expect(p.condition).toBe('dead')
    expect(p.bleaching.risk).toBeGreaterThanOrEqual(80)
  })

  it('detects nursery in test code', () => {
    const p = analyzeCoralPolyp(testCode, 'calc.test.ts')
    expect(p.ecosystem.hasNursery).toBe(true)
    expect(p.ecosystem.nurseryQuality).toBeGreaterThan(0)
  })

  it('detects encrusting growth for heavy imports', () => {
    const p = analyzeCoralPolyp(heavyImportCode, 'consumer.ts')
    expect(p.reef.growthForm).toBe('encrusting')
    expect(p.reef.isEncrusting).toBe(true)
  })

  it('diverse code has thriving species', () => {
    const p = analyzeCoralPolyp(diverseCode, 'diverse.ts')
    expect(p.species.variety).toBe('thriving')
    expect(p.species.enums).toBe(1)
    expect(p.species.constructors).toBe(1)
  })

  it('noisy code has high temperature', () => {
    const p = analyzeCoralPolyp(noisyCode, 'noisy.ts')
    expect(p.water.temperature).toBeGreaterThan(0)
  })

  it('branchy code without errors triggers bleaching causes', () => {
    const b = measureBleaching(branchyCode)
    expect(b.risk).toBeGreaterThan(0)
  })
})
