import { describe, it, expect } from 'vitest'
import {
  countExports, countImports, countFunctions, countArrows, countClasses,
  countInterfaces, countTypeAliases, countEnums, countJSDoc, countBlockComments,
  countComments, countAsync, countAwaits, countTryCatch, countCatches,
  countFinallys, countThrows, countIfs, countSwitches, countForLoops,
  countWhileLoops, countNestedBlocks, countDeepNested, countTernaries,
  countConsole, countTodos, countErrors, countReturns, countSpreads,
  countDestructures, countGenerics, countAccessModifiers, countStatic,
  countAny, countReadonly, countPromises, countCommentedCode,
  countCallbackNesting, countPromiseChains, countEarlyReturns,
  countReexports, countDynamicImports,
  measureClarity, measureLattice, measureResonance, measureFacet,
  measureTransmission, measurePerfection, analyzeCrystalSpecimen,
  buildQuartzCrystalResult, classifyCondition, classifyGemologistGrade,
  classifyCaveType, classifyCaveCondition,
} from '../src/commands/quartz-crystal-helpers.js'
import {
  scoreColor, conditionColor, gradeColor, caveTypeColor,
  formatQuartzCrystalJson, formatQuartzCrystalTable,
} from '../src/commands/quartz-crystal-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY = ''

const RICH = `import { Command } from '@oclif/core'
import type { Result } from './types.js'

/** Documentation for helper */
export interface Config {
  name: string
  version: number
  options: Record<string, unknown>
}

export type ResultType = Config | null

export enum Status { Active, Inactive, Pending }

export class Analyzer {
  private data: Map<string, number> = new Map()
  protected helper: ReadonlyArray<string> = []
  public name: string = 'default'

  static create(): Analyzer {
    return new Analyzer()
  }

  async analyze(content: string): Promise<Result> {
    try {
      if (!content) {
        return { success: false, data: null }
      }

      const lines = content.split('\\n')
      for (const line of lines) {
        if (line.includes('TODO')) continue
        await this.processLine(line)
      }

      const result = this.transform(lines)
      return { success: true, data: result }
    } catch (error) {
      throw new Error(\`Analysis failed: \${error}\`)
    } finally {
      this.cleanup()
    }
  }

  private transform(data: string[]): Result {
    return { success: true, data }
  }

  private async processLine(line: string): Promise<void> {
    const trimmed = line.trim()
    if (trimmed.length === 0) return
    this.data.set(trimmed, trimmed.length)
  }

  private cleanup(): void {
    this.data.clear()
  }
}

export function buildResult<T>(items: T[]): T[] {
  return [...items]
}

export default Analyzer`

const SIMPLE = `export function hello() {
  return "world"
}
`

const BAD = `var x = 1
console.log(x)
// TODO: fix this
// function oldCode() {}
var any = true
`

// ─── Counter Functions ─────────────────────────────────────────────────────

describe('quartz-crystal counter functions', () => {
  it('countExports counts export keywords', () => {
    expect(countExports(RICH)).toBe(6)
  })

  it('countImports counts import keywords', () => {
    expect(countImports(RICH)).toBe(2)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBe(1)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(RICH)).toBe(0)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(RICH)).toBe(1)
  })

  it('countInterfaces counts interface declarations', () => {
    expect(countInterfaces(RICH)).toBe(1)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(RICH)).toBe(1)
  })

  it('countEnums counts enum declarations', () => {
    expect(countEnums(RICH)).toBe(1)
  })

  it('countJSDoc counts JSDoc comments', () => {
    expect(countJSDoc(RICH)).toBe(1)
  })

  it('countBlockComments counts block comments', () => {
    expect(countBlockComments(RICH)).toBe(1)
  })

  it('countComments counts line comments', () => {
    expect(countComments(RICH)).toBe(0)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBe(2)
  })

  it('countAwaits counts await keywords', () => {
    expect(countAwaits(RICH)).toBe(1)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBe(1)
  })

  it('countCatches counts catch keywords', () => {
    expect(countCatches(RICH)).toBe(1)
  })

  it('countFinallys counts finally blocks', () => {
    expect(countFinallys(RICH)).toBe(1)
  })

  it('countThrows counts throw keywords', () => {
    expect(countThrows(RICH)).toBe(1)
  })

  it('countIfs counts if statements', () => {
    expect(countIfs(RICH)).toBe(3)
  })

  it('countSwitches counts switch statements', () => {
    expect(countSwitches(RICH)).toBe(0)
  })

  it('countForLoops counts for loops', () => {
    expect(countForLoops(RICH)).toBe(1)
  })

  it('countWhileLoops counts while loops', () => {
    expect(countWhileLoops(RICH)).toBe(0)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(RICH)).toBe(4)
  })

  it('countDeepNested counts deeply nested blocks', () => {
    expect(countDeepNested(RICH)).toBe(1)
  })

  it('countTernaries counts ternary operators', () => {
    expect(countTernaries(RICH)).toBe(0)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole(RICH)).toBe(0)
  })

  it('countTodos counts TODO/FIXME comments', () => {
    expect(countTodos(RICH)).toBe(0)
  })

  it('countTodos counts TODOs in BAD code', () => {
    expect(countTodos(BAD)).toBe(1)
  })

  it('countErrors counts new Error calls', () => {
    expect(countErrors(RICH)).toBe(1)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(RICH)).toBe(6)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBe(1)
  })

  it('countDestructures counts destructure patterns', () => {
    expect(countDestructures(RICH)).toBe(0)
  })

  it('countGenerics counts generic type parameters', () => {
    expect(countGenerics(RICH)).toBe(6)
  })

  it('countAccessModifiers counts private/protected/public', () => {
    expect(countAccessModifiers(RICH)).toBe(6)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBe(1)
  })

  it('countAny counts any keywords', () => {
    expect(countAny(RICH)).toBe(0)
  })

  it('countAny counts any in BAD code', () => {
    expect(countAny(BAD)).toBe(1)
  })

  it('countReadonly counts readonly keywords', () => {
    expect(countReadonly(RICH)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBe(2)
  })

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode(BAD)).toBe(1)
  })

  it('countCallbackNesting counts nested callbacks', () => {
    expect(countCallbackNesting(RICH)).toBe(0)
  })

  it('countPromiseChains counts .then() chains', () => {
    expect(countPromiseChains(RICH)).toBe(0)
  })

  it('countEarlyReturns counts early return patterns', () => {
    expect(countEarlyReturns(RICH)).toBe(1)
  })

  it('countReexports counts re-export statements', () => {
    expect(countReexports(RICH)).toBe(0)
  })

  it('countDynamicImports counts dynamic import calls', () => {
    expect(countDynamicImports(RICH)).toBe(0)
  })

  it('countConsole counts console calls in BAD code', () => {
    expect(countConsole(BAD)).toBe(1)
  })

  it('countExports returns 0 for empty string', () => {
    expect(countExports(EMPTY)).toBe(0)
  })
})

// ─── Measure Functions ─────────────────────────────────────────────────────

describe('quartz-crystal measure functions', () => {
  it('measureClarity on RICH returns level 75 vvs', () => {
    const result = measureClarity(RICH)
    expect(result.level).toBe(75)
    expect(result.grade).toBe('vvs')
    expect(result.isTransparent).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasNoFractures).toBe(false)
    expect(result.hasNoFeathers).toBe(true)
    expect(result.hasNoClouding).toBe(true)
    expect(result.hasNoColorZoning).toBe(true)
    expect(result.isWaterClear).toBe(false)
    expect(result.hasBrilliance).toBe(true)
    expect(result.hasDispersion).toBe(true)
    expect(result.hasLuminescence).toBe(true)
    expect(result.inclusionCount).toBe(0)
    expect(result.fractureCount).toBe(1)
  })

  it('measureClarity on EMPTY returns level 80 flawless', () => {
    const result = measureClarity(EMPTY)
    expect(result.level).toBe(80)
    expect(result.grade).toBe('flawless')
    expect(result.isTransparent).toBe(true)
    expect(result.isWaterClear).toBe(true)
  })

  it('measureLattice on RICH returns structure 100 hexagonal', () => {
    const result = measureLattice(RICH)
    expect(result.structure).toBe(100)
    expect(result.system).toBe('hexagonal')
    expect(result.isWellOrdered).toBe(true)
    expect(result.hasProperSymmetry).toBe(true)
    expect(result.hasCrystalAxes).toBe(true)
    expect(result.hasUnitCell).toBe(true)
    expect(result.hasMillerIndices).toBe(true)
    expect(result.hasCleavagePlanes).toBe(true)
    expect(result.hasTwinBoundaries).toBe(true)
    expect(result.hasNoDislocations).toBe(true)
    expect(result.hasNoGrainBoundaries).toBe(true)
    expect(result.hasNoStackingFaults).toBe(true)
  })

  it('measureLattice on EMPTY returns structure 25 monoclinic', () => {
    const result = measureLattice(EMPTY)
    expect(result.structure).toBe(25)
    expect(result.system).toBe('monoclinic')
    expect(result.isWellOrdered).toBe(false)
  })

  it('measureResonance on RICH returns frequency 90 ultra-stable', () => {
    const result = measureResonance(RICH)
    expect(result.frequency).toBe(90)
    expect(result.stability).toBe('ultra-stable')
    expect(result.isConsistent).toBe(true)
    expect(result.hasPreciseFrequency).toBe(true)
    expect(result.hasNoFrequencyDrift).toBe(true)
    expect(result.hasOvertoneModes).toBe(false)
    expect(result.hasTemperatureStability).toBe(true)
    expect(result.hasPiezoelectric).toBe(true)
    expect(result.hasNoSpurious).toBe(true)
    expect(result.hasProperQFactor).toBe(true)
    expect(result.hasNoNoiseFloor).toBe(true)
    expect(result.noiseCount).toBe(0)
    expect(result.spuriousCount).toBe(0)
  })

  it('measureResonance on EMPTY returns frequency 40 unstable', () => {
    const result = measureResonance(EMPTY)
    expect(result.frequency).toBe(40)
    expect(result.stability).toBe('unstable')
    expect(result.isConsistent).toBe(false)
  })

  it('measureFacet on RICH returns quality 100 brilliant', () => {
    const result = measureFacet(RICH)
    expect(result.quality).toBe(100)
    expect(result.cut).toBe('brilliant')
    expect(result.isWellCut).toBe(true)
    expect(result.hasTable).toBe(true)
    expect(result.hasCrown).toBe(true)
    expect(result.hasPavilion).toBe(true)
    expect(result.hasSymmetry).toBe(true)
    expect(result.hasProportions).toBe(true)
    expect(result.hasProperAngles).toBe(true)
    expect(result.hasPolish).toBe(true)
    expect(result.hasNoChips).toBe(true)
    expect(result.hasNoScratches).toBe(true)
    expect(result.chipCount).toBe(0)
    expect(result.scratchCount).toBe(0)
  })

  it('measureFacet on EMPTY returns quality 0 shattered', () => {
    const result = measureFacet(EMPTY)
    expect(result.quality).toBe(0)
    expect(result.cut).toBe('shattered')
    expect(result.isWellCut).toBe(false)
  })

  it('measureTransmission on RICH returns quality 85 full-spectrum', () => {
    const result = measureTransmission(RICH)
    expect(result.quality).toBe(85)
    expect(result.spectrum).toBe('full-spectrum')
    expect(result.hasHighTransmission).toBe(true)
    expect(result.hasNoAbsorption).toBe(true)
    expect(result.hasProperRefraction).toBe(true)
    expect(result.hasBirefringence).toBe(true)
    expect(result.hasFluorescence).toBe(false)
    expect(result.hasPleochroism).toBe(false)
    expect(result.hasNoInternalReflections).toBe(true)
    expect(result.hasNoScattering).toBe(true)
    expect(result.isTransmissive).toBe(true)
    expect(result.absorptionCount).toBe(0)
    expect(result.scatteringCount).toBe(0)
  })

  it('measureTransmission on EMPTY returns quality 20 narrow-band', () => {
    const result = measureTransmission(EMPTY)
    expect(result.quality).toBe(20)
    expect(result.spectrum).toBe('narrow-band')
    expect(result.hasHighTransmission).toBe(false)
  })

  it('measurePerfection on RICH returns score 87', () => {
    const result = measurePerfection(RICH)
    expect(result.score).toBe(87)
    expect(result.carat).toBe(64)
    expect(result.flawCount).toBe(1)
    expect(result.hasGemQuality).toBe(true)
    expect(result.hasNoFlaws).toBe(false)
    expect(result.hasPerfectTermination).toBe(false)
    expect(result.hasPhantomGrowth).toBe(true)
    expect(result.hasEnhydro).toBe(true)
    expect(result.hasMuseumQuality).toBe(false)
    expect(result.hasCollectorGrade).toBe(false)
    expect(result.hasInvestmentGrade).toBe(true)
    expect(result.hasCommercialGrade).toBe(true)
    expect(result.hasIndustrialGrade).toBe(true)
  })

  it('measurePerfection on EMPTY returns score 32', () => {
    const result = measurePerfection(EMPTY)
    expect(result.score).toBe(32)
    expect(result.carat).toBe(1)
    expect(result.flawCount).toBe(0)
    expect(result.hasGemQuality).toBe(false)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasPerfectTermination).toBe(true)
  })
})

// ─── Specimen Analysis ─────────────────────────────────────────────────────

describe('quartz-crystal specimen analysis', () => {
  it('analyzeCrystalSpecimen on RICH returns herkimer-diamond', () => {
    const result = analyzeCrystalSpecimen(RICH, 'src/analyzer.ts')
    expect(result.qualityScore).toBe(89)
    expect(result.condition).toBe('herkimer-diamond')
    expect(result.crystalClarity).toBe(75)
    expect(result.latticeStructure).toBe(100)
    expect(result.resonantFrequency).toBe(90)
    expect(result.facetQuality).toBe(100)
    expect(result.lightTransmission).toBe(85)
    expect(result.crystalPerfection).toBe(87)
  })

  it('analyzeCrystalSpecimen on EMPTY returns smoky-quartz', () => {
    const result = analyzeCrystalSpecimen(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(35)
    expect(result.condition).toBe('smoky-quartz')
    expect(result.crystalClarity).toBe(80)
    expect(result.latticeStructure).toBe(25)
    expect(result.resonantFrequency).toBe(40)
    expect(result.facetQuality).toBe(0)
    expect(result.lightTransmission).toBe(20)
    expect(result.crystalPerfection).toBe(32)
  })

  it('analyzeCrystalSpecimen on SIMPLE returns smoky-quartz', () => {
    const result = analyzeCrystalSpecimen(SIMPLE, 'src/simple.ts')
    expect(result.qualityScore).toBe(44)
    expect(result.condition).toBe('smoky-quartz')
  })

  it('analyzeCrystalSpecimen on BAD returns milky-quartz', () => {
    const result = analyzeCrystalSpecimen(BAD, 'src/bad.ts')
    expect(result.qualityScore).toBe(22)
    expect(result.condition).toBe('milky-quartz')
  })

  it('specimen has file and all measure fields', () => {
    const result = analyzeCrystalSpecimen(RICH, 'test.ts')
    expect(result.file).toBe('test.ts')
    expect(result.clarity).toBeDefined()
    expect(result.lattice).toBeDefined()
    expect(result.resonance).toBeDefined()
    expect(result.facet).toBeDefined()
    expect(result.transmission).toBeDefined()
    expect(result.perfection).toBeDefined()
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('quartz-crystal classification functions', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('herkimer-diamond')
    expect(classifyCondition(75)).toBe('clear-quartz')
    expect(classifyCondition(60)).toBe('rutilated')
    expect(classifyCondition(35)).toBe('smoky-quartz')
    expect(classifyCondition(20)).toBe('milky-quartz')
    expect(classifyCondition(5)).toBe('sand')
  })

  it('classifyGemologistGrade returns correct grades', () => {
    expect(classifyGemologistGrade(95)).toBe('master-gemologist')
    expect(classifyGemologistGrade(65)).toBe('gemologist')
    expect(classifyGemologistGrade(50)).toBe('lapidary')
    expect(classifyGemologistGrade(35)).toBe('collector')
    expect(classifyGemologistGrade(20)).toBe('rockhound')
    expect(classifyGemologistGrade(10)).toBe('tourist')
  })

  it('classifyCaveCondition returns correct conditions', () => {
    expect(classifyCaveCondition(95)).toBe('crystal-cathedral')
    expect(classifyCaveCondition(75)).toBe('gem-gallery')
    expect(classifyCaveCondition(55)).toBe('mineral-museum')
    expect(classifyCaveCondition(40)).toBe('rock-shop')
    expect(classifyCaveCondition(25)).toBe('gravel-pit')
    expect(classifyCaveCondition(10)).toBe('beach')
  })

  it('classifyCaveType returns sandbox for empty array', () => {
    expect(classifyCaveType([])).toBe('sandbox')
  })

  it('classifyCaveType returns geode for high quality specimens', () => {
    const specimens = [
      { qualityScore: 90, condition: 'herkimer-diamond' } as any,
      { qualityScore: 85, condition: 'herkimer-diamond' } as any,
      { qualityScore: 80, condition: 'clear-quartz' } as any,
    ]
    expect(classifyCaveType(specimens)).toBe('geode')
  })

  it('classifyCaveType returns sandbox for very low quality', () => {
    const specimens = [
      { qualityScore: 5, condition: 'sand' } as any,
    ]
    expect(classifyCaveType(specimens)).toBe('sandbox')
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────

describe('quartz-crystal buildQuartzCrystalResult', () => {
  it('returns correct structure for 3-file mix', () => {
    const result = buildQuartzCrystalResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.collection.overallClarity).toBe(52)
    expect(result.collection.isGemQuality).toBe(true)
    expect(result.collection.avgClarity).toBe(60)
    expect(result.collection.avgStructure).toBe(57)
    expect(result.collection.avgPerfection).toBe(49)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalCaves).toBe(1)
    expect(result.stats.herkimerDiamondCount).toBe(1)
    expect(result.stats.sandCount).toBe(0)
    expect(result.stats.gemologistGrade).toBe('lapidary')
    expect(result.stats.bestSpecimen).toBe('src/a.ts')
    expect(result.stats.clearestCrystal).toBe('src/b.ts')
    expect(result.stats.bestStructure).toBe('src/a.ts')
    expect(result.specimens).toHaveLength(3)
    expect(result.caves).toHaveLength(1)
    expect(result.caves[0].directory).toBe('src')
    expect(result.caves[0].caveType).toBe('pegmatite')
    expect(result.caves[0].condition).toBe('mineral-museum')
    expect(result.caves[0].specimens).toHaveLength(3)
    expect(result.caves[0].herkimerCount).toBe(1)
    expect(result.caves[0].transparentCount).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input gracefully', () => {
    const result = buildQuartzCrystalResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCaves).toBe(0)
    expect(result.collection.overallClarity).toBe(0)
    expect(result.collection.isGemQuality).toBe(false)
    expect(result.specimens).toHaveLength(0)
    expect(result.caves).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('quartz-crystal format helpers', () => {
  it('scoreColor returns a string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('scoreColor returns a string for low score', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('herkimer-diamond')).toBe('string')
    expect(typeof conditionColor('clear-quartz')).toBe('string')
    expect(typeof conditionColor('rutilated')).toBe('string')
    expect(typeof conditionColor('smoky-quartz')).toBe('string')
    expect(typeof conditionColor('milky-quartz')).toBe('string')
    expect(typeof conditionColor('sand')).toBe('string')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns a string for each grade', () => {
    expect(typeof gradeColor('master-gemologist')).toBe('string')
    expect(typeof gradeColor('gemologist')).toBe('string')
    expect(typeof gradeColor('lapidary')).toBe('string')
    expect(typeof gradeColor('collector')).toBe('string')
    expect(typeof gradeColor('rockhound')).toBe('string')
    expect(typeof gradeColor('tourist')).toBe('string')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('caveTypeColor returns a string for each cave type', () => {
    expect(typeof caveTypeColor('geode')).toBe('string')
    expect(typeof caveTypeColor('vein')).toBe('string')
    expect(typeof caveTypeColor('pegmatite')).toBe('string')
    expect(typeof caveTypeColor('alluvial')).toBe('string')
    expect(typeof caveTypeColor('mine-tailings')).toBe('string')
    expect(typeof caveTypeColor('sandbox')).toBe('string')
  })

  it('caveTypeColor handles unknown cave type', () => {
    expect(caveTypeColor('unknown')).toBe('unknown')
  })

  it('formatQuartzCrystalJson returns valid JSON', () => {
    const result = buildQuartzCrystalResult(['test.ts'], [SIMPLE])
    const json = formatQuartzCrystalJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatQuartzCrystalTable returns non-empty string', () => {
    const result = buildQuartzCrystalResult(['test.ts'], [SIMPLE])
    const table = formatQuartzCrystalTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatQuartzCrystalTable verbose includes per-specimen', () => {
    const result = buildQuartzCrystalResult(['test.ts'], [SIMPLE])
    const table = formatQuartzCrystalTable(result, true)
    expect(table).toContain('test.ts')
  })
})
