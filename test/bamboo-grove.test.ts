import { describe, it, expect } from 'vitest'
import {
  countExports, countImports, countFunctions, countArrows, countClasses,
  countInterfaces, countTypeAliases, countEnums, countJSDoc, countBlockComments,
  countComments, countAsync, countAwaits, countTryCatch, countCatches,
  countFinallys, countThrows, countIfs, countSwitches, countForLoop_count,
  countWhileLoops, countNestedBlocks, countDeepNested, countTernaries,
  countConsole, countTodos, countErrors, countReturns, countSpreads,
  countDestructures, countGenerics, countAccessModifiers, countStatic,
  countAny, countReadonly, countPromises, countCommentedCode,
  countCallbackNesting, countPromiseChains, countEarlyReturns,
  countReexports, countDynamicImports,
  measureStrength, measureNodes, measureRhizome, measureCanopy,
  measureFlexibility, measureHealth, analyzeBambooCulm,
  buildBambooGroveResult, classifyCondition, classifyGardenerGrade,
  classifyClusterType, classifyClusterCondition,
} from '../src/commands/bamboo-grove-helpers.js'
import {
  scoreColor, conditionColor, gradeColor, clusterTypeColor,
  formatBambooGroveJson, formatBambooGroveTable,
} from '../src/commands/bamboo-grove-format-helpers.js'

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

// ─── Measure Functions ─────────────────────────────────────────────────────

describe('bamboo-grove measure functions', () => {
  it('measureStrength on RICH returns level 65 stone-bamboo', () => {
    const result = measureStrength(RICH)
    expect(result.level).toBe(65)
    expect(result.grade).toBe('stone-bamboo')
    expect(result.isStrong).toBe(false)
    expect(result.hasFiberDensity).toBe(false)
    expect(result.hasLoadBearing).toBe(true)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasNoSplitCulm).toBe(true)
    expect(result.hasNoPithRot).toBe(true)
    expect(result.hasNoBorerDamage).toBe(true)
    expect(result.hasWindResistance).toBe(false)
    expect(result.hasProperWallThickness).toBe(true)
    expect(result.hasTensileStrength).toBe(true)
    expect(result.crackCount).toBe(1)
    expect(result.borerCount).toBe(0)
  })

  it('measureStrength on EMPTY returns level 75 stone-bamboo', () => {
    const result = measureStrength(EMPTY)
    expect(result.level).toBe(75)
    expect(result.grade).toBe('stone-bamboo')
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasTensileStrength).toBe(true)
  })

  it('measureNodes on RICH returns spacing 85 alternating', () => {
    const result = measureNodes(RICH)
    expect(result.spacing).toBe(85)
    expect(result.pattern).toBe('alternating')
    expect(result.isWellSpaced).toBe(false)
    expect(result.hasProperInternodes).toBe(true)
    expect(result.hasBranchNodes).toBe(true)
    expect(result.hasSheathNodes).toBe(true)
    expect(result.hasNoCrowdedNodes).toBe(false)
    expect(result.hasNoGaps).toBe(true)
    expect(result.hasEmergentShoots).toBe(true)
    expect(result.hasRootNodes).toBe(true)
    expect(result.hasAerialRoots).toBe(true)
    expect(result.hasPropRoots).toBe(true)
    expect(result.gapCount).toBe(0)
    expect(result.crowdedCount).toBe(1)
  })

  it('measureNodes on EMPTY returns spacing 15 absent', () => {
    const result = measureNodes(EMPTY)
    expect(result.spacing).toBe(15)
    expect(result.pattern).toBe('absent')
    expect(result.isWellSpaced).toBe(false)
  })

  it('measureRhizome on RICH returns depth 90 mixed', () => {
    const result = measureRhizome(RICH)
    expect(result.depth).toBe(90)
    expect(result.type).toBe('mixed')
    expect(result.isDeepRooted).toBe(true)
    expect(result.hasRhizomeNetwork).toBe(true)
    expect(result.hasProperSpread).toBe(true)
    expect(result.hasNoInvasiveRoots).toBe(true)
    expect(result.hasNoRootRot).toBe(true)
    expect(result.hasMycorrhizae).toBe(false)
    expect(result.hasWaterStorage).toBe(true)
    expect(result.hasNutrientCycling).toBe(true)
    expect(result.hasNoRootCompetition).toBe(true)
    expect(result.hasNoGirdlingRoots).toBe(true)
    expect(result.invasiveCount).toBe(0)
    expect(result.girdlingCount).toBe(0)
  })

  it('measureRhizome on EMPTY returns depth 40 absent', () => {
    const result = measureRhizome(EMPTY)
    expect(result.depth).toBe(40)
    expect(result.type).toBe('absent')
    expect(result.isDeepRooted).toBe(false)
  })

  it('measureCanopy on RICH returns spread 90 open', () => {
    const result = measureCanopy(RICH)
    expect(result.spread).toBe(90)
    expect(result.density).toBe('open')
    expect(result.hasFullCoverage).toBe(true)
    expect(result.hasProperShade).toBe(true)
    expect(result.hasLeafCanopy).toBe(true)
    expect(result.hasBranchStructure).toBe(true)
    expect(result.hasNoDeadwood).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.hasPhotosynthesis).toBe(true)
    expect(result.hasTranspiration).toBe(false)
    expect(result.hasNoParasiticGrowth).toBe(true)
    expect(result.hasUnderstory).toBe(false)
    expect(result.deadwoodCount).toBe(0)
    expect(result.parasiticCount).toBe(0)
  })

  it('measureCanopy on EMPTY returns spread 30 bare', () => {
    const result = measureCanopy(EMPTY)
    expect(result.spread).toBe(30)
    expect(result.density).toBe('bare')
    expect(result.hasFullCoverage).toBe(false)
  })

  it('measureFlexibility on RICH returns index 100 supple', () => {
    const result = measureFlexibility(RICH)
    expect(result.index).toBe(100)
    expect(result.resilience).toBe('supple')
    expect(result.isFlexible).toBe(true)
    expect(result.hasElasticResponse).toBe(true)
    expect(result.hasDampingCapacity).toBe(true)
    expect(result.hasNoRigidJoints).toBe(true)
    expect(result.hasBendWithoutBreak).toBe(true)
    expect(result.hasSelfRighting).toBe(true)
    expect(result.hasAdaptiveGrowth).toBe(true)
    expect(result.hasNoBrittleFracture).toBe(true)
    expect(result.hasStressRelief).toBe(true)
    expect(result.hasThermalExpansion).toBe(true)
    expect(result.brittleCount).toBe(0)
    expect(result.rigidCount).toBe(0)
  })

  it('measureFlexibility on EMPTY returns index 25 brittle', () => {
    const result = measureFlexibility(EMPTY)
    expect(result.index).toBe(25)
    expect(result.resilience).toBe('brittle')
    expect(result.isFlexible).toBe(false)
  })

  it('measureHealth on RICH returns score 100 flourishing', () => {
    const result = measureHealth(RICH)
    expect(result.score).toBe(100)
    expect(result.vitality).toBe('flourishing')
    expect(result.isHealthy).toBe(true)
    expect(result.hasNewGrowth).toBe(true)
    expect(result.hasProperIrrigation).toBe(true)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasNoPests).toBe(true)
    expect(result.hasProperNutrition).toBe(true)
    expect(result.hasNoFungalInfection).toBe(true)
    expect(result.hasGoodSoilContact).toBe(true)
    expect(result.hasSunExposure).toBe(true)
    expect(result.hasNoWindDamage).toBe(true)
    expect(result.diseaseCount).toBe(0)
    expect(result.pestCount).toBe(0)
  })

  it('measureHealth on EMPTY returns score 45 stressed', () => {
    const result = measureHealth(EMPTY)
    expect(result.score).toBe(45)
    expect(result.vitality).toBe('stressed')
    expect(result.isHealthy).toBe(false)
  })
})

// ─── Specimen Analysis ─────────────────────────────────────────────────────

describe('bamboo-grove specimen analysis', () => {
  it('analyzeBambooCulm on RICH returns moso-bamboo', () => {
    const result = analyzeBambooCulm(RICH, 'src/analyzer.ts')
    expect(result.qualityScore).toBe(88)
    expect(result.condition).toBe('moso-bamboo')
    expect(result.culmStrength).toBe(65)
    expect(result.nodeSpacing).toBe(85)
    expect(result.rhizomeDepth).toBe(90)
    expect(result.canopySpread).toBe(90)
    expect(result.flexibilityIndex).toBe(100)
    expect(result.groveHealth).toBe(100)
  })

  it('analyzeBambooCulm on EMPTY returns lucky-bamboo', () => {
    const result = analyzeBambooCulm(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(41)
    expect(result.condition).toBe('lucky-bamboo')
    expect(result.culmStrength).toBe(75)
    expect(result.nodeSpacing).toBe(15)
    expect(result.rhizomeDepth).toBe(40)
    expect(result.canopySpread).toBe(30)
    expect(result.flexibilityIndex).toBe(25)
    expect(result.groveHealth).toBe(45)
  })

  it('analyzeBambooCulm on SIMPLE returns lucky-bamboo', () => {
    const result = analyzeBambooCulm(SIMPLE, 'src/simple.ts')
    expect(result.qualityScore).toBe(48)
    expect(result.condition).toBe('lucky-bamboo')
  })

  it('analyzeBambooCulm on BAD returns mulch', () => {
    const result = analyzeBambooCulm(BAD, 'src/bad.ts')
    expect(result.qualityScore).toBe(15)
    expect(result.condition).toBe('mulch')
  })

  it('culm has file and all measure fields', () => {
    const result = analyzeBambooCulm(RICH, 'test.ts')
    expect(result.file).toBe('test.ts')
    expect(result.strength).toBeDefined()
    expect(result.nodes).toBeDefined()
    expect(result.rhizome).toBeDefined()
    expect(result.canopy).toBeDefined()
    expect(result.flexibility).toBeDefined()
    expect(result.health).toBeDefined()
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('bamboo-grove classification functions', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('moso-bamboo')
    expect(classifyCondition(75)).toBe('giant-bamboo')
    expect(classifyCondition(60)).toBe('black-bamboo')
    expect(classifyCondition(50)).toBe('black-bamboo')
    expect(classifyCondition(35)).toBe('lucky-bamboo')
    expect(classifyCondition(20)).toBe('dried-cane')
    expect(classifyCondition(5)).toBe('mulch')
  })

  it('classifyGardenerGrade returns correct grades', () => {
    expect(classifyGardenerGrade(95)).toBe('master-gardener')
    expect(classifyGardenerGrade(65)).toBe('horticulturist')
    expect(classifyGardenerGrade(50)).toBe('gardener')
    expect(classifyGardenerGrade(35)).toBe('landscaper')
    expect(classifyGardenerGrade(20)).toBe('weekend-warrior')
    expect(classifyGardenerGrade(10)).toBe('concrete-paver')
  })

  it('classifyClusterCondition returns correct conditions', () => {
    expect(classifyClusterCondition(90)).toBe('ancient-forest')
    expect(classifyClusterCondition(75)).toBe('mature-grove')
    expect(classifyClusterCondition(55)).toBe('young-plantation')
    expect(classifyClusterCondition(40)).toBe('nursery')
    expect(classifyClusterCondition(25)).toBe('cleared-field')
    expect(classifyClusterCondition(10)).toBe('desert')
  })

  it('classifyClusterType returns wasteland for empty array', () => {
    expect(classifyClusterType([])).toBe('wasteland')
  })

  it('classifyClusterType returns forest for high quality culms', () => {
    const culms = [
      { qualityScore: 90, condition: 'moso-bamboo' } as any,
      { qualityScore: 85, condition: 'moso-bamboo' } as any,
      { qualityScore: 80, condition: 'giant-bamboo' } as any,
    ]
    expect(classifyClusterType(culms)).toBe('forest')
  })

  it('classifyClusterType returns wasteland for very low quality', () => {
    const culms = [
      { qualityScore: 5, condition: 'mulch' } as any,
    ]
    expect(classifyClusterType(culms)).toBe('wasteland')
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────

describe('bamboo-grove buildBambooGroveResult', () => {
  it('returns correct structure for 3-file mix', () => {
    const result = buildBambooGroveResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.grove.overallHealth).toBe(50)
    expect(result.grove.isFlourishing).toBe(true)
    expect(result.grove.avgStrength).toBe(55)
    expect(result.grove.avgSpacing).toBe(53)
    expect(result.grove.avgHealth).toBe(52)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.mosoBambooCount).toBe(1)
    expect(result.stats.mulchCount).toBe(1)
    expect(result.stats.gardenerGrade).toBe('gardener')
    expect(result.stats.bestCulm).toBe('src/a.ts')
    expect(result.stats.strongest).toBe('src/b.ts')
    expect(result.stats.bestSpaced).toBe('src/a.ts')
    expect(result.stats.deepestRooted).toBe('src/a.ts')
    expect(result.stats.bestCoverage).toBe('src/a.ts')
    expect(result.stats.mostFlexible).toBe('src/a.ts')
    expect(result.culms).toHaveLength(3)
    expect(result.clusters).toHaveLength(1)
    expect(result.clusters[0].directory).toBe('src')
    expect(result.clusters[0].clusterType).toBe('thicket')
    expect(result.clusters[0].condition).toBe('young-plantation')
    expect(result.clusters[0].culms).toHaveLength(3)
    expect(result.clusters[0].mosoCount).toBe(1)
    expect(result.clusters[0].strongCount).toBe(0)
    expect(result.clusters[0].flexibleCount).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input gracefully', () => {
    const result = buildBambooGroveResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalClusters).toBe(0)
    expect(result.grove.overallHealth).toBe(0)
    expect(result.grove.isFlourishing).toBe(false)
    expect(result.stats.gardenerGrade).toBe('concrete-paver')
    expect(result.culms).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('bamboo-grove format helpers', () => {
  it('scoreColor returns a string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('scoreColor returns a string for low score', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('moso-bamboo')).toBe('string')
    expect(typeof conditionColor('giant-bamboo')).toBe('string')
    expect(typeof conditionColor('black-bamboo')).toBe('string')
    expect(typeof conditionColor('lucky-bamboo')).toBe('string')
    expect(typeof conditionColor('dried-cane')).toBe('string')
    expect(typeof conditionColor('mulch')).toBe('string')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns a string for each grade', () => {
    expect(typeof gradeColor('master-gardener')).toBe('string')
    expect(typeof gradeColor('horticulturist')).toBe('string')
    expect(typeof gradeColor('gardener')).toBe('string')
    expect(typeof gradeColor('landscaper')).toBe('string')
    expect(typeof gradeColor('weekend-warrior')).toBe('string')
    expect(typeof gradeColor('concrete-paver')).toBe('string')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('clusterTypeColor returns a string for each type', () => {
    expect(typeof clusterTypeColor('forest')).toBe('string')
    expect(typeof clusterTypeColor('grove')).toBe('string')
    expect(typeof clusterTypeColor('thicket')).toBe('string')
    expect(typeof clusterTypeColor('hedge')).toBe('string')
    expect(typeof clusterTypeColor('stand')).toBe('string')
    expect(typeof clusterTypeColor('wasteland')).toBe('string')
  })

  it('clusterTypeColor handles unknown type', () => {
    expect(clusterTypeColor('unknown')).toBe('unknown')
  })

  it('formatBambooGroveJson returns valid JSON', () => {
    const result = buildBambooGroveResult(['test.ts'], [SIMPLE])
    const json = formatBambooGroveJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatBambooGroveTable returns non-empty string', () => {
    const result = buildBambooGroveResult(['test.ts'], [SIMPLE])
    const table = formatBambooGroveTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatBambooGroveTable verbose includes per-culm', () => {
    const result = buildBambooGroveResult(['test.ts'], [SIMPLE])
    const table = formatBambooGroveTable(result, true)
    expect(table).toContain('test.ts')
  })
})

// ─── Counter Functions (sample) ────────────────────────────────────────────

describe('bamboo-grove counter functions', () => {
  it('countExports counts export keywords', () => {
    expect(countExports(RICH)).toBe(6)
  })

  it('countImports counts import keywords', () => {
    expect(countImports(RICH)).toBe(2)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBe(1)
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

  it('countTodos counts TODO/FIXME comments', () => {
    expect(countTodos(BAD)).toBe(1)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole(BAD)).toBe(1)
  })

  it('countAny counts any keywords', () => {
    expect(countAny(BAD)).toBe(1)
  })

  it('countExports returns 0 for empty string', () => {
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countJSDoc counts JSDoc comments', () => {
    expect(countJSDoc(RICH)).toBe(1)
  })

  it('countBlockComments counts block comments', () => {
    expect(countBlockComments(RICH)).toBe(1)
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

  it('countForLoop_count counts for loops', () => {
    expect(countForLoop_count(RICH)).toBe(1)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(RICH)).toBe(4)
  })

  it('countDeepNested counts deeply nested blocks', () => {
    expect(countDeepNested(RICH)).toBe(1)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(RICH)).toBe(6)
  })

  it('countGenerics counts generic type parameters', () => {
    expect(countGenerics(RICH)).toBe(6)
  })

  it('countAccessModifiers counts access modifiers', () => {
    expect(countAccessModifiers(RICH)).toBe(6)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBe(1)
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

  it('countEarlyReturns counts early return patterns', () => {
    expect(countEarlyReturns(RICH)).toBe(1)
  })
})
