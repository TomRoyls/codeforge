import { describe, it, expect } from 'vitest'

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  countLoc,
  countFunctions,
  countClasses,
  countInterfaces,
  countTypes,
  countExports,
  countImports,
  countJSDoc,
  countComments,
  countErrorHandling,
  countTypeAnnotations,
  countTodos,
  countConsole,
  countBranches,
  countDescriptiveNames,
  countDefaults,
  countDeprecated,
  countReturnTypes,
  countGenerics,
  countPrivateMembers,
  countAsync,
  countAwait,
  countReturns,
  countThrow,
  countLoops,
  countImplements,
  measureWater,
  measureSpecies,
  measureChain,
  measureOxygen,
  measureNutrient,
  measureBalance,
  analyzePondOrganism,
  classifyOrganismCondition,
  classifyEcologistGrade,
  classifyHabitatCondition,
  classifyHabitatType,
  analyzePondHabitat,
  generateRecommendations,
  buildEcosystemPondResult,
} from '../src/commands/ecosystem-pond-helpers.js'

import {
  scoreColor,
  clarityColor,
  conditionColor,
  speciesRoleColor,
  oxygenStateColor,
  nutrientEfficiencyColor,
  balanceStateColor,
  ecologistGradeColor,
  habitatCondColor,
  formatOrganism,
  formatHabitat,
  formatStats,
  formatEcosystemPondTable,
  formatEcosystemPondJson,
} from '../src/commands/ecosystem-pond-format-helpers.js'

import type {
  WaterMeasure,
  SpeciesMeasure,
  ChainMeasure,
  OxygenMeasure,
  NutrientMeasure,
  BalanceMeasure,
} from '../src/commands/ecosystem-pond-helpers.js'

// ─── Test Content Fixtures ──────────────────────────────────────────────────

const EMPTY_CONTENT = ''

/** @example minimal export */
const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

/** @example rich content with many features */
const RICH_CONTENT = `import { foo } from './bar.js'
import type { Bar } from './types.js'

/** Docs for interface */
export interface Data {
  name: string
  value: number
}

/** Docs for class */
export class Processor implements Data {
  private name: string = ''
  private value: number = 0

  constructor(name: string) {
    this.name = name
  }

  process(): void {
    try {
      this.validate()
    } catch (e) {
      console.error(e)
    }
  }

  validate(): boolean {
    return this.value > 0
  }
}

export function getData(): Data {
  return { name: 'test', value: 42 }
}

export default Processor
`

// ─── countLoc ───────────────────────────────────────────────────────────────

describe('countLoc', () => {
  it('counts empty content as 0', () => { expect(countLoc('')).toBe(0) })
  it('counts lines', () => { expect(countLoc('a\n\nb\nc')).toBe(3) })
})

// ─── countFunctions ─────────────────────────────────────────────────────────

describe('countFunctions', () => {
  it('counts zero for empty', () => { expect(countFunctions('')).toBe(0) })
  it('counts function declarations', () => { expect(countFunctions('function foo() {}')).toBe(1) })
})

// ─── countClasses ───────────────────────────────────────────────────────────

describe('countClasses', () => {
  it('counts zero for empty', () => { expect(countClasses('')).toBe(0) })
  it('counts class declarations', () => { expect(countClasses('class A {}')).toBe(1) })
})

// ─── countInterfaces ────────────────────────────────────────────────────────

describe('countInterfaces', () => {
  it('counts zero for empty', () => { expect(countInterfaces('')).toBe(0) })
  it('counts interface declarations', () => { expect(countInterfaces('interface Foo {}')).toBe(1) })
})

// ─── countTypes ─────────────────────────────────────────────────────────────

describe('countTypes', () => {
  it('counts zero for empty', () => { expect(countTypes('')).toBe(0) })
  it('counts type aliases', () => { expect(countTypes('type X = string')).toBe(1) })
})

// ─── countExports ───────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts zero for empty', () => { expect(countExports('')).toBe(0) })
  it('counts exports', () => { expect(countExports('export const a = 1')).toBe(1) })
})

// ─── countImports ───────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts zero for empty', () => { expect(countImports('')).toBe(0) })
  it('counts imports', () => { expect(countImports("import { x } from 'y'")).toBe(1) })
})

// ─── countJSDoc ─────────────────────────────────────────────────────────────

describe('countJSDoc', () => {
  it('counts zero for empty', () => { expect(countJSDoc('')).toBe(0) })
  it('counts JSDoc blocks', () => { expect(countJSDoc('/** doc */')).toBe(1) })
})

// ─── countComments ──────────────────────────────────────────────────────────

describe('countComments', () => {
  it('counts zero for empty', () => { expect(countComments('')).toBe(0) })
  it('counts mixed comments', () => { expect(countComments('// inline\n/* block */')).toBe(2) })
})

// ─── countErrorHandling ─────────────────────────────────────────────────────

describe('countErrorHandling', () => {
  it('counts zero for empty', () => { expect(countErrorHandling('')).toBe(0) })
  it('counts try blocks', () => { expect(countErrorHandling('try {} catch(e) {}')).toBe(1) })
})

// ─── countTypeAnnotations ───────────────────────────────────────────────────

describe('countTypeAnnotations', () => {
  it('counts zero for empty', () => { expect(countTypeAnnotations('')).toBe(0) })
  it('counts annotations', () => { expect(countTypeAnnotations('const x: number = 1')).toBe(1) })
})

// ─── countTodos ─────────────────────────────────────────────────────────────

describe('countTodos', () => {
  it('counts zero for empty', () => { expect(countTodos('')).toBe(0) })
  it('counts TODOs', () => { expect(countTodos('// TODO: fix')).toBe(1) })
})

// ─── countConsole ───────────────────────────────────────────────────────────

describe('countConsole', () => {
  it('counts zero for empty', () => { expect(countConsole('')).toBe(0) })
  it('counts console calls', () => { expect(countConsole('console.log(1)')).toBe(1) })
})

// ─── countBranches ──────────────────────────────────────────────────────────

describe('countBranches', () => {
  it('counts zero for empty', () => { expect(countBranches('')).toBe(0) })
  it('counts if statements', () => { expect(countBranches('if (x) {}')).toBe(1) })
})

// ─── countDescriptiveNames ──────────────────────────────────────────────────

describe('countDescriptiveNames', () => {
  it('counts zero for empty', () => { expect(countDescriptiveNames('')).toBe(0) })
  it('counts descriptive names', () => { expect(countDescriptiveNames('function getData() {}')).toBe(1) })
})

// ─── countDefaults ──────────────────────────────────────────────────────────

describe('countDefaults', () => {
  it('counts zero for empty', () => { expect(countDefaults('')).toBe(0) })
  it('counts default exports', () => { expect(countDefaults('export default class {}')).toBe(1) })
})

// ─── countDeprecated ────────────────────────────────────────────────────────

describe('countDeprecated', () => {
  it('counts zero for empty', () => { expect(countDeprecated('')).toBe(0) })
  it('counts deprecated', () => { expect(countDeprecated('@deprecated')).toBe(1) })
})

// ─── countReturnTypes ───────────────────────────────────────────────────────

describe('countReturnTypes', () => {
  it('counts zero for empty', () => { expect(countReturnTypes('')).toBe(0) })
  it('counts return types', () => { expect(countReturnTypes('function foo(): string {}')).toBe(1) })
})

// ─── countGenerics ──────────────────────────────────────────────────────────

describe('countGenerics', () => {
  it('counts zero for empty', () => { expect(countGenerics('')).toBe(0) })
  it('counts generics', () => { expect(countGenerics('function foo<T>() {}')).toBe(1) })
})

// ─── countPrivateMembers ────────────────────────────────────────────────────

describe('countPrivateMembers', () => {
  it('counts zero for empty', () => { expect(countPrivateMembers('')).toBe(0) })
  it('counts private members', () => { expect(countPrivateMembers('private x: number')).toBe(1) })
})

// ─── countAsync ─────────────────────────────────────────────────────────────

describe('countAsync', () => {
  it('counts zero for empty', () => { expect(countAsync('')).toBe(0) })
  it('counts async functions', () => { expect(countAsync('async function foo() {}')).toBe(1) })
})

// ─── countAwait ─────────────────────────────────────────────────────────────

describe('countAwait', () => {
  it('counts zero for empty', () => { expect(countAwait('')).toBe(0) })
  it('counts await', () => { expect(countAwait('await foo()')).toBe(1) })
})

// ─── countReturns ───────────────────────────────────────────────────────────

describe('countReturns', () => {
  it('counts zero for empty', () => { expect(countReturns('')).toBe(0) })
  it('counts returns', () => { expect(countReturns('return x')).toBe(1) })
})

// ─── countThrow ─────────────────────────────────────────────────────────────

describe('countThrow', () => {
  it('counts zero for empty', () => { expect(countThrow('')).toBe(0) })
  it('counts throw', () => { expect(countThrow('throw new Error()')).toBe(1) })
})

// ─── countLoops ─────────────────────────────────────────────────────────────

describe('countLoops', () => {
  it('counts zero for empty', () => { expect(countLoops('')).toBe(0) })
  it('counts for loops', () => { expect(countLoops('for (let i = 0; i < n; i++) {}')).toBe(1) })
})

// ─── countImplements ────────────────────────────────────────────────────────

describe('countImplements', () => {
  it('counts zero for empty', () => { expect(countImplements('')).toBe(0) })
  it('counts implements', () => { expect(countImplements('class A implements B')).toBe(1) })
})

// ─── measureWater ───────────────────────────────────────────────────────────

describe('measureWater', () => {
  it('returns toxic water for empty content', () => {
    const w = measureWater(EMPTY_CONTENT)
    expect(w.quality).toBe(10)
    expect(w.clarity).toBe('toxic')
    expect(w.isClean).toBe(false)
    expect(w.hasNoPollutants).toBe(true)
    expect(w.pollutantCount).toBe(0)
    expect(w.hasOxygenated).toBe(false)
  })

  it('returns polluted water for minimal content', () => {
    const w = measureWater(MINIMAL_CONTENT)
    expect(w.quality).toBe(39)
    expect(w.clarity).toBe('polluted')
    expect(w.isClean).toBe(false)
    expect(w.hasOxygenated).toBe(true)
    expect(w.hasProperTemperature).toBe(true)
  })

  it('returns crystal water for rich content', () => {
    const w = measureWater(RICH_CONTENT)
    expect(w.quality).toBe(90)
    expect(w.clarity).toBe('crystal')
    expect(w.isClean).toBe(true)
    expect(w.hasNaturalFiltration).toBe(true)
    expect(w.hasAeration).toBe(true)
    expect(w.hasSedimentControl).toBe(true)
    expect(w.pollutantCount).toBe(1)
  })
})

// ─── measureSpecies ─────────────────────────────────────────────────────────

describe('measureSpecies', () => {
  it('returns parasite for empty content', () => {
    const s = measureSpecies(EMPTY_CONTENT)
    expect(s.diversity).toBe(10)
    expect(s.role).toBe('parasite')
    expect(s.isNative).toBe(false)
    expect(s.isKeystone).toBe(false)
    expect(s.symbiosisCount).toBe(0)
  })

  it('returns primary-consumer for minimal content', () => {
    const s = measureSpecies(MINIMAL_CONTENT)
    expect(s.diversity).toBe(23)
    expect(s.role).toBe('primary-consumer')
    expect(s.hasAdaptation).toBe(true)
    expect(s.symbiosisCount).toBe(0)
  })

  it('returns producer for rich content', () => {
    const s = measureSpecies(RICH_CONTENT)
    expect(s.diversity).toBe(56)
    expect(s.role).toBe('producer')
    expect(s.isNative).toBe(true)
    expect(s.isKeystone).toBe(true)
    expect(s.hasMutualism).toBe(true)
    expect(s.hasCommensalism).toBe(true)
    expect(s.symbiosisCount).toBe(4)
  })
})

// ─── measureChain ───────────────────────────────────────────────────────────

describe('measureChain', () => {
  it('returns sediment position for empty content', () => {
    const c = measureChain(EMPTY_CONTENT)
    expect(c.health).toBe(10)
    expect(c.trophicLevel).toBe(0)
    expect(c.position).toBe('sediment')
    expect(c.hasBalancedDiet).toBe(false)
    expect(c.dependencyCount).toBe(0)
  })

  it('returns base position for minimal content', () => {
    const c = measureChain(MINIMAL_CONTENT)
    expect(c.health).toBe(35)
    expect(c.trophicLevel).toBe(1)
    expect(c.position).toBe('base')
    expect(c.hasNoStarvation).toBe(true)
    expect(c.dependentCount).toBe(1)
  })

  it('returns apex position for rich content', () => {
    const c = measureChain(RICH_CONTENT)
    expect(c.health).toBe(78)
    expect(c.trophicLevel).toBe(6)
    expect(c.position).toBe('apex')
    expect(c.hasBalancedDiet).toBe(true)
    expect(c.hasNutrientRecycling).toBe(true)
    expect(c.dependencyCount).toBe(2)
    expect(c.dependentCount).toBe(4)
  })
})

// ─── measureOxygen ──────────────────────────────────────────────────────────

describe('measureOxygen', () => {
  it('returns anoxic for empty content', () => {
    const o = measureOxygen(EMPTY_CONTENT)
    expect(o.level).toBe(10)
    expect(o.state).toBe('anoxic')
    expect(o.isFresh).toBe(false)
    expect(o.pollutionCount).toBe(0)
  })

  it('returns hypoxic for minimal content', () => {
    const o = measureOxygen(MINIMAL_CONTENT)
    expect(o.level).toBe(32)
    expect(o.state).toBe('hypoxic')
    expect(o.hasDissolvedOxygen).toBe(true)
    expect(o.hasPhotosynthesis).toBe(true)
  })

  it('returns healthy for rich content', () => {
    const o = measureOxygen(RICH_CONTENT)
    expect(o.level).toBe(67)
    expect(o.state).toBe('healthy')
    expect(o.isFresh).toBe(true)
    expect(o.hasDecomposition).toBe(true)
    expect(o.hasStratification).toBe(true)
    expect(o.pollutionCount).toBe(1)
  })
})

// ─── measureNutrient ────────────────────────────────────────────────────────

describe('measureNutrient', () => {
  it('returns absent for empty content', () => {
    const n = measureNutrient(EMPTY_CONTENT)
    expect(n.cycle).toBe(10)
    expect(n.efficiency).toBe('absent')
    expect(n.cycleCount).toBe(0)
    expect(n.hasEutrophication).toBe(false)
  })

  it('returns broken for minimal content', () => {
    const n = measureNutrient(MINIMAL_CONTENT)
    expect(n.cycle).toBe(32)
    expect(n.efficiency).toBe('broken')
    expect(n.hasRelease).toBe(true)
    expect(n.cycleCount).toBe(1)
  })

  it('returns moderate for rich content', () => {
    const n = measureNutrient(RICH_CONTENT)
    expect(n.cycle).toBe(64)
    expect(n.efficiency).toBe('moderate')
    expect(n.hasNitrogenCycle).toBe(true)
    expect(n.hasCarbonCycle).toBe(true)
    expect(n.hasDecomposition).toBe(true)
    expect(n.hasFixation).toBe(true)
    expect(n.cycleCount).toBe(3)
  })
})

// ─── measureBalance ─────────────────────────────────────────────────────────

describe('measureBalance', () => {
  it('returns dead for empty content', () => {
    const b = measureBalance(EMPTY_CONTENT)
    expect(b.score).toBe(10)
    expect(b.state).toBe('dead')
    expect(b.isBalanced).toBe(false)
    expect(b.nicheCount).toBe(0)
  })

  it('returns collapsing for minimal content', () => {
    const b = measureBalance(MINIMAL_CONTENT)
    expect(b.score).toBe(34)
    expect(b.state).toBe('collapsing')
    expect(b.hasCarryingCapacity).toBe(true)
    expect(b.nicheCount).toBe(2)
  })

  it('returns stable for rich content', () => {
    const b = measureBalance(RICH_CONTENT)
    expect(b.score).toBe(76)
    expect(b.state).toBe('stable')
    expect(b.isBalanced).toBe(true)
    expect(b.hasPredatorPreyBalance).toBe(true)
    expect(b.hasResilience).toBe(true)
    expect(b.nicheCount).toBe(5)
  })
})

// ─── analyzePondOrganism ────────────────────────────────────────────────────

describe('analyzePondOrganism', () => {
  it('returns dead-zone for empty content', () => {
    const o = analyzePondOrganism(EMPTY_CONTENT, 'empty.ts')
    expect(o.file).toBe('empty.ts')
    expect(o.qualityScore).toBe(10)
    expect(o.condition).toBe('dead-zone')
  })

  it('returns polluted-water for minimal content', () => {
    const o = analyzePondOrganism(MINIMAL_CONTENT, 'minimal.ts')
    expect(o.qualityScore).toBe(33)
    expect(o.condition).toBe('polluted-water')
  })

  it('returns healthy-pond for rich content', () => {
    const o = analyzePondOrganism(RICH_CONTENT, 'rich.ts')
    expect(o.qualityScore).toBe(72)
    expect(o.condition).toBe('healthy-pond')
    expect(o.water.isClean).toBe(true)
    expect(o.balance.isBalanced).toBe(true)
  })
})

// ─── classifyOrganismCondition ──────────────────────────────────────────────

describe('classifyOrganismCondition', () => {
  it('classifies pristine-ecosystem', () => {
    expect(classifyOrganismCondition(90, { isClean: true } as Partial<WaterMeasure> as WaterMeasure, { isBalanced: true, hasEcologicalNiche: true } as Partial<BalanceMeasure> as BalanceMeasure)).toBe('pristine-ecosystem')
  })
  it('classifies healthy-pond', () => {
    expect(classifyOrganismCondition(70, { isClean: true } as Partial<WaterMeasure> as WaterMeasure, { isBalanced: false, hasEcologicalNiche: false } as Partial<BalanceMeasure> as BalanceMeasure)).toBe('healthy-pond')
  })
  it('classifies balanced-habitat', () => {
    expect(classifyOrganismCondition(55, { isClean: false } as Partial<WaterMeasure> as WaterMeasure, { isBalanced: false, hasEcologicalNiche: true } as Partial<BalanceMeasure> as BalanceMeasure)).toBe('balanced-habitat')
  })
  it('classifies stressed-pond', () => {
    expect(classifyOrganismCondition(40, { isClean: false } as Partial<WaterMeasure> as WaterMeasure, { isBalanced: false, hasEcologicalNiche: false } as Partial<BalanceMeasure> as BalanceMeasure)).toBe('stressed-pond')
  })
  it('classifies polluted-water', () => {
    expect(classifyOrganismCondition(25, {} as Partial<WaterMeasure> as WaterMeasure, {} as Partial<BalanceMeasure> as BalanceMeasure)).toBe('polluted-water')
  })
  it('classifies dead-zone', () => {
    expect(classifyOrganismCondition(10, {} as Partial<WaterMeasure> as WaterMeasure, {} as Partial<BalanceMeasure> as BalanceMeasure)).toBe('dead-zone')
  })
})

// ─── classifyEcologistGrade ────────────────────────────────────────────────

describe('classifyEcologistGrade', () => {
  it('returns chief-ecologist for >= 85', () => { expect(classifyEcologistGrade(90)).toBe('chief-ecologist') })
  it('returns senior-ecologist for >= 70', () => { expect(classifyEcologistGrade(70)).toBe('senior-ecologist') })
  it('returns ecologist for >= 50', () => { expect(classifyEcologistGrade(50)).toBe('ecologist') })
  it('returns naturalist for >= 30', () => { expect(classifyEcologistGrade(30)).toBe('naturalist') })
  it('returns angler for >= 15', () => { expect(classifyEcologistGrade(15)).toBe('angler') })
  it('returns polluter for < 15', () => { expect(classifyEcologistGrade(5)).toBe('polluter') })
})

// ─── classifyHabitatCondition ───────────────────────────────────────────────

describe('classifyHabitatCondition', () => {
  it('returns nature-reserve for >= 80', () => { expect(classifyHabitatCondition(80)).toBe('nature-reserve') })
  it('returns botanical-garden for >= 65', () => { expect(classifyHabitatCondition(65)).toBe('botanical-garden') })
  it('returns park-pond for >= 50', () => { expect(classifyHabitatCondition(50)).toBe('park-pond') })
  it('returns farm-pond for >= 35', () => { expect(classifyHabitatCondition(35)).toBe('farm-pond') })
  it('returns drainage-basin for >= 20', () => { expect(classifyHabitatCondition(20)).toBe('drainage-basin') })
  it('returns toxic-dump for low', () => { expect(classifyHabitatCondition(5)).toBe('toxic-dump') })
})

// ─── classifyHabitatType ────────────────────────────────────────────────────

describe('classifyHabitatType', () => {
  it('returns cesspool for empty', () => { expect(classifyHabitatType([], 0)).toBe('cesspool') })
  it('returns retention-pond for moderate avg water', () => {
    const o = analyzePondOrganism(MINIMAL_CONTENT, 'mod.ts')
    expect(classifyHabitatType([o], o.waterQuality)).toBe('retention-pond')
  })
})

// ─── analyzePondHabitat ────────────────────────────────────────────────────

describe('analyzePondHabitat', () => {
  it('returns empty habitat for no organisms', () => {
    const h = analyzePondHabitat([], 'empty')
    expect(h.directory).toBe('empty')
    expect(h.organisms).toHaveLength(0)
    expect(h.avgWaterQuality).toBe(0)
    expect(h.habitatType).toBe('cesspool')
    expect(h.condition).toBe('toxic-dump')
  })

  it('aggregates multiple organisms', () => {
    const o1 = analyzePondOrganism(EMPTY_CONTENT, 'a.ts')
    const o2 = analyzePondOrganism(MINIMAL_CONTENT, 'b.ts')
    const h = analyzePondHabitat([o1, o2], 'src')
    expect(h.directory).toBe('src')
    expect(h.organisms).toHaveLength(2)
    expect(h.avgWaterQuality).toBe(25)
    expect(h.deadZoneCount).toBe(1)
    expect(h.pollutedWaterCount !== undefined || h.deadZoneCount === 1).toBe(true)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns pristine message for clean ecosystem', () => {
    const w = { pollutantCount: 0, hasOxygenated: true, hasNaturalFiltration: true } as Partial<WaterMeasure> as WaterMeasure
    const s = { isNative: true, isInvasive: false } as Partial<SpeciesMeasure> as SpeciesMeasure
    const c = { hasBalancedDiet: true } as Partial<ChainMeasure> as ChainMeasure
    const o = { hasDecomposition: true } as Partial<OxygenMeasure> as OxygenMeasure
    const n = { hasEutrophication: false } as Partial<NutrientMeasure> as NutrientMeasure
    const b = { hasResilience: true, hasEcologicalNiche: true } as Partial<BalanceMeasure> as BalanceMeasure
    const recs = generateRecommendations(w, s, c, o, n, b)
    expect(recs).toContain('Ecosystem is in pristine condition — maintain current biodiversity and balance')
  })

  it('returns multiple recommendations for dirty ecosystem', () => {
    const w = { pollutantCount: 2, hasOxygenated: false, hasNaturalFiltration: false } as Partial<WaterMeasure> as WaterMeasure
    const s = { isNative: false, isInvasive: true } as Partial<SpeciesMeasure> as SpeciesMeasure
    const c = { hasBalancedDiet: false } as Partial<ChainMeasure> as ChainMeasure
    const o = { hasDecomposition: false } as Partial<OxygenMeasure> as OxygenMeasure
    const n = { hasEutrophication: true } as Partial<NutrientMeasure> as NutrientMeasure
    const b = { hasResilience: false, hasEcologicalNiche: false } as Partial<BalanceMeasure> as BalanceMeasure
    const recs = generateRecommendations(w, s, c, o, n, b)
    expect(recs.length).toBeGreaterThanOrEqual(8)
    expect(recs).toContain('Remove pollutants (TODOs, deprecated markers, console calls) to improve water quality')
    expect(recs).toContain('Reduce excessive imports to prevent nutrient eutrophication')
  })
})

// ─── buildEcosystemPondResult ──────────────────────────────────────────────

describe('buildEcosystemPondResult', () => {
  it('builds result from empty inputs', () => {
    const r = buildEcosystemPondResult([], [])
    expect(r.organisms).toHaveLength(0)
    expect(r.habitats).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.overallHealth).toBe(0)
  })

  it('builds result from mixed content', () => {
    const r = buildEcosystemPondResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(r.organisms).toHaveLength(2)
    expect(r.habitats).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgWaterQuality).toBe(25)
    expect(r.stats.avgBiodiversity).toBe(17)
    expect(r.stats.avgFoodChain).toBe(23)
    expect(r.stats.avgOxygenLevel).toBe(21)
    expect(r.stats.avgNutrientCycle).toBe(21)
    expect(r.stats.avgEcosystemBalance).toBe(22)
    expect(r.stats.overallHealth).toBe(22)
    expect(r.stats.ecologistGrade).toBe('angler')
    expect(r.stats.pollutedWaterCount).toBe(1)
    expect(r.stats.deadZoneCount).toBe(1)
    expect(r.stats.bestOrganism).toBe('b.ts')
  })

  it('tracks watershed correctly', () => {
    const r = buildEcosystemPondResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(r.watershed.avgWaterQuality).toBe(25)
    expect(r.watershed.avgBiodiversity).toBe(17)
    expect(r.watershed.avgBalance).toBe(22)
    expect(r.watershed.isHealthy).toBe(false)
    expect(r.watershed.overallHealth).toBe(22)
  })

  it('tracks counts correctly', () => {
    const r = buildEcosystemPondResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(r.stats.isCleanCount).toBe(0)
    expect(r.stats.hasNoPollutantsCount).toBe(2)
    expect(r.stats.isNativeCount).toBe(0)
    expect(r.stats.hasSymbiosisCount).toBe(0)
    expect(r.stats.hasBalancedDietCount).toBe(0)
    expect(r.stats.isFreshCount).toBe(0)
    expect(r.stats.isBalancedCount).toBe(0)
    expect(r.stats.hasResilienceCount).toBe(0)
    expect(r.stats.hasEcologicalNicheCount).toBe(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for any score', () => {
    expect(typeof scoreColor(10)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(90)).toBe('string')
  })
})

describe('clarityColor', () => {
  it('returns string for each clarity', () => {
    expect(typeof clarityColor('crystal')).toBe('string')
    expect(typeof clarityColor('toxic')).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns string for each condition', () => {
    expect(typeof conditionColor('pristine-ecosystem')).toBe('string')
    expect(typeof conditionColor('dead-zone')).toBe('string')
  })
})

describe('speciesRoleColor', () => {
  it('returns string for each role', () => {
    expect(typeof speciesRoleColor('producer')).toBe('string')
    expect(typeof speciesRoleColor('parasite')).toBe('string')
  })
})

describe('oxygenStateColor', () => {
  it('returns string for each state', () => {
    expect(typeof oxygenStateColor('saturated')).toBe('string')
    expect(typeof oxygenStateColor('anoxic')).toBe('string')
  })
})

describe('nutrientEfficiencyColor', () => {
  it('returns string for each efficiency', () => {
    expect(typeof nutrientEfficiencyColor('closed-loop')).toBe('string')
    expect(typeof nutrientEfficiencyColor('absent')).toBe('string')
  })
})

describe('balanceStateColor', () => {
  it('returns string for each state', () => {
    expect(typeof balanceStateColor('equilibrium')).toBe('string')
    expect(typeof balanceStateColor('dead')).toBe('string')
  })
})

describe('ecologistGradeColor', () => {
  it('returns string for each grade', () => {
    expect(typeof ecologistGradeColor('chief-ecologist')).toBe('string')
    expect(typeof ecologistGradeColor('polluter')).toBe('string')
  })
})

describe('habitatCondColor', () => {
  it('returns string for each condition', () => {
    expect(typeof habitatCondColor('nature-reserve')).toBe('string')
    expect(typeof habitatCondColor('toxic-dump')).toBe('string')
  })
})

// ─── formatOrganism ─────────────────────────────────────────────────────────

describe('formatOrganism', () => {
  it('formats organism as string', () => {
    const o = analyzePondOrganism(EMPTY_CONTENT, 'test.ts')
    const f = formatOrganism(o, false)
    expect(typeof f).toBe('string')
    expect(f).toContain('test.ts')
  })

  it('formats verbose organism', () => {
    const o = analyzePondOrganism(MINIMAL_CONTENT, 'verbose.ts')
    const f = formatOrganism(o, true)
    expect(typeof f).toBe('string')
    expect(f.length).toBeGreaterThan(0)
  })
})

// ─── formatHabitat ──────────────────────────────────────────────────────────

describe('formatHabitat', () => {
  it('formats habitat as string', () => {
    const o = analyzePondOrganism(EMPTY_CONTENT, 'a.ts')
    const h = analyzePondHabitat([o], 'src')
    const f = formatHabitat(h, false)
    expect(typeof f).toBe('string')
    expect(f).toContain('src')
  })
})

// ─── formatStats ────────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats as string', () => {
    const r = buildEcosystemPondResult(['a.ts'], [MINIMAL_CONTENT])
    const f = formatStats(r.stats)
    expect(typeof f).toBe('string')
    expect(f.length).toBeGreaterThan(0)
  })
})

// ─── formatEcosystemPondTable ──────────────────────────────────────────────

describe('formatEcosystemPondTable', () => {
  it('formats full table', () => {
    const r = buildEcosystemPondResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const f = formatEcosystemPondTable(r, false)
    expect(typeof f).toBe('string')
    expect(f.length).toBeGreaterThan(0)
  })
})

// ─── formatEcosystemPondJson ───────────────────────────────────────────────

describe('formatEcosystemPondJson', () => {
  it('formats as valid JSON', () => {
    const r = buildEcosystemPondResult(['a.ts'], [MINIMAL_CONTENT])
    const j = formatEcosystemPondJson(r)
    const parsed = JSON.parse(j)
    expect(parsed.organisms).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })

  it('includes all top-level keys', () => {
    const r = buildEcosystemPondResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    const p = JSON.parse(formatEcosystemPondJson(r))
    expect(p).toHaveProperty('organisms')
    expect(p).toHaveProperty('habitats')
    expect(p).toHaveProperty('watershed')
    expect(p).toHaveProperty('stats')
    expect(p).toHaveProperty('recommendations')
  })

  it('serializes empty results', () => {
    const r = buildEcosystemPondResult([], [])
    const p = JSON.parse(formatEcosystemPondJson(r))
    expect(p.organisms).toHaveLength(0)
    expect(p.habitats).toHaveLength(0)
  })
})
