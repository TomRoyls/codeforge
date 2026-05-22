import { describe, it, expect } from 'vitest'
import {
  countExports, countImports, countFunctions, countClasses,
  countInterfaces, countTypeAliases, countEnums, countJSDoc,
  countAsync, countAwaits, countTryCatch, countCatches,
  countFinallys, countThrows, countIfs, countSwitches, countForLoop_count,
  countWhileLoops, countNestedBlocks, countDeepNested, countTernaries,
  countConsole, countTodos, countErrors, countReturns, countSpreads,
  countGenerics, countAccessModifiers, countStatic,
  countAny, countReadonly, countPromises, countCommentedCode,
  countReexports, countDynamicImports,
  measureSharpness, measureTemper, measureFolding, measureHamon,
  measureSaya, measureBushido, analyzeForgedBlade,
  buildSamuraiForgeResult, classifyCondition, classifySmithGrade,
  classifyForgeType, classifyClusterCondition,
} from '../src/commands/samurai-forge-helpers.js'
import {
  scoreColor, conditionColor, gradeColor, forgeTypeColor,
  formatSamuraiForgeJson, formatSamuraiForgeTable,
} from '../src/commands/samurai-forge-format-helpers.js'

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

describe('samurai-forge measure functions', () => {
  it('measureSharpness on RICH returns edge 65 sharp', () => {
    const result = measureSharpness(RICH)
    expect(result.edge).toBe(65)
    expect(result.grade).toBe('sharp')
    expect(result.isRazorSharp).toBe(false)
    expect(result.hasProperEdge).toBe(true)
    expect(result.hasNoNicks).toBe(false)
    expect(result.hasNoChips).toBe(true)
    expect(result.hasNoBurr).toBe(true)
    expect(result.hasMirrorPolish).toBe(false)
    expect(result.hasProperBevel).toBe(true)
    expect(result.hasConsistentEdge).toBe(false)
    expect(result.hasNoEdgeRolling).toBe(true)
    expect(result.hasNoCorrosion).toBe(true)
    expect(result.nickCount).toBe(1)
    expect(result.chipCount).toBe(0)
  })

  it('measureSharpness on EMPTY returns edge 70 sharp', () => {
    const result = measureSharpness(EMPTY)
    expect(result.edge).toBe(70)
    expect(result.grade).toBe('sharp')
    expect(result.isRazorSharp).toBe(false)
  })

  it('measureTemper on RICH returns hardness 85 differential', () => {
    const result = measureTemper(RICH)
    expect(result.hardness).toBe(85)
    expect(result.method).toBe('differential')
    expect(result.isProperlyTempered).toBe(false)
    expect(result.hasProperHardness).toBe(true)
    expect(result.hasNoCracking).toBe(false)
    expect(result.hasNoWarping).toBe(true)
    expect(result.hasGoodEdgeRetention).toBe(true)
    expect(result.hasProperSpineFlex).toBe(true)
    expect(result.hasNoBrittleEdge).toBe(true)
    expect(result.hasNoSoftSpots).toBe(true)
    expect(result.hasNoRust).toBe(true)
    expect(result.crackCount).toBe(1)
    expect(result.warpCount).toBe(0)
  })

  it('measureTemper on EMPTY returns hardness 60 uneven', () => {
    const result = measureTemper(EMPTY)
    expect(result.hardness).toBe(60)
    expect(result.method).toBe('uneven')
    expect(result.isProperlyTempered).toBe(false)
  })

  it('measureFolding on RICH returns fifteen-fold', () => {
    const result = measureFolding(RICH)
    expect(result.technique).toBe('fifteen-fold')
    expect(result.layers).toBe(5)
    expect(result.isWellRefined).toBe(false)
    expect(result.hasUniformGrain).toBe(false)
    expect(result.hasNoImpurities).toBe(true)
    expect(result.hasProperCarbon).toBe(true)
    expect(result.hasNoSlag).toBe(true)
    expect(result.hasFineStructure).toBe(true)
    expect(result.hasLayerVisibility).toBe(true)
    expect(result.hasNoDelamination).toBe(true)
    expect(result.hasProperHeatCycle).toBe(true)
    expect(result.hasNoBurnoff).toBe(true)
    expect(result.impurityCount).toBe(0)
    expect(result.slagCount).toBe(0)
  })

  it('measureFolding on EMPTY returns unforged', () => {
    const result = measureFolding(EMPTY)
    expect(result.technique).toBe('unforged')
    expect(result.layers).toBe(0)
    expect(result.isWellRefined).toBe(false)
  })

  it('measureHamon on RICH returns clarity 95 gunome', () => {
    const result = measureHamon(RICH)
    expect(result.clarity).toBe(95)
    expect(result.style).toBe('gunome')
    expect(result.hasClearBoundaries).toBe(true)
    expect(result.hasProperInterface).toBe(true)
    expect(result.hasNoBoundaryLeak).toBe(true)
    expect(result.hasUtsuri).toBe(true)
    expect(result.hasNie).toBe(false)
    expect(result.hasNioi).toBe(true)
    expect(result.hasNoHataraki).toBe(true)
    expect(result.hasActivity).toBe(true)
    expect(result.hasNoKizu).toBe(true)
    expect(result.hasAshi).toBe(true)
    expect(result.leakCount).toBe(0)
    expect(result.kizuCount).toBe(0)
  })

  it('measureHamon on EMPTY returns clarity 30 absent', () => {
    const result = measureHamon(EMPTY)
    expect(result.clarity).toBe(30)
    expect(result.style).toBe('absent')
    expect(result.hasClearBoundaries).toBe(false)
  })

  it('measureSaya on RICH returns fit 100 honoki', () => {
    const result = measureSaya(RICH)
    expect(result.fit).toBe(100)
    expect(result.material).toBe('honoki')
    expect(result.isWellEncapsulated).toBe(true)
    expect(result.hasProperScabbard).toBe(true)
    expect(result.hasGoodTolerance).toBe(true)
    expect(result.hasKojiri).toBe(true)
    expect(result.hasKurikata).toBe(true)
    expect(result.hasHabaki).toBe(true)
    expect(result.hasSeppa).toBe(true)
    expect(result.hasTsuba).toBe(true)
    expect(result.hasNoRattle).toBe(true)
    expect(result.hasNoSticking).toBe(true)
    expect(result.rattleCount).toBe(0)
    expect(result.stickingCount).toBe(0)
  })

  it('measureSaya on EMPTY returns fit 20 cardboard', () => {
    const result = measureSaya(EMPTY)
    expect(result.fit).toBe(20)
    expect(result.material).toBe('cardboard')
    expect(result.isWellEncapsulated).toBe(false)
  })

  it('measureBushido on RICH returns spirit 100 perfect-harmony', () => {
    const result = measureBushido(RICH)
    expect(result.spirit).toBe(100)
    expect(result.virtue).toBe('perfect-harmony')
    expect(result.hasDiscipline).toBe(true)
    expect(result.hasGi).toBe(true)
    expect(result.hasYu).toBe(true)
    expect(result.hasJin).toBe(true)
    expect(result.hasRei).toBe(true)
    expect(result.hasMakoto).toBe(true)
    expect(result.hasMeiyo).toBe(true)
    expect(result.hasChugi).toBe(true)
    expect(result.hasNoKiri).toBe(true)
    expect(result.hasNoShame).toBe(true)
    expect(result.shameCount).toBe(0)
    expect(result.kiriCount).toBe(0)
  })

  it('measureBushido on EMPTY returns spirit 45 respect', () => {
    const result = measureBushido(EMPTY)
    expect(result.spirit).toBe(45)
    expect(result.virtue).toBe('respect')
    expect(result.hasDiscipline).toBe(true)
  })
})

// ─── Specimen Analysis ─────────────────────────────────────────────────────

describe('samurai-forge specimen analysis', () => {
  it('analyzeForgedBlade on RICH returns masterwork', () => {
    const result = analyzeForgedBlade(RICH, 'src/analyzer.ts')
    expect(result.qualityScore).toBe(78)
    expect(result.condition).toBe('masterwork')
    expect(result.bladeSharpness).toBe(65)
    expect(result.steelTemper).toBe(85)
    expect(result.foldingTechnique).toBe(20)
    expect(result.hamonLine).toBe(95)
    expect(result.sayaFit).toBe(100)
    expect(result.bushidoSpirit).toBe(100)
  })

  it('analyzeForgedBlade on EMPTY returns serviceable', () => {
    const result = analyzeForgedBlade(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(43)
    expect(result.condition).toBe('serviceable')
    expect(result.bladeSharpness).toBe(70)
  })

  it('analyzeForgedBlade on SIMPLE returns serviceable', () => {
    const result = analyzeForgedBlade(SIMPLE, 'src/simple.ts')
    expect(result.qualityScore).toBe(44)
    expect(result.condition).toBe('serviceable')
  })

  it('analyzeForgedBlade on BAD returns scrap-iron', () => {
    const result = analyzeForgedBlade(BAD, 'src/bad.ts')
    expect(result.qualityScore).toBe(10)
    expect(result.condition).toBe('scrap-iron')
  })

  it('blade has file and all measure fields', () => {
    const result = analyzeForgedBlade(RICH, 'test.ts')
    expect(result.file).toBe('test.ts')
    expect(result.sharpness).toBeDefined()
    expect(result.temper).toBeDefined()
    expect(result.folding).toBeDefined()
    expect(result.hamon).toBeDefined()
    expect(result.saya).toBeDefined()
    expect(result.bushido).toBeDefined()
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('samurai-forge classification functions', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('masterpiece')
    expect(classifyCondition(75)).toBe('masterwork')
    expect(classifyCondition(60)).toBe('fine-blade')
    expect(classifyCondition(50)).toBe('fine-blade')
    expect(classifyCondition(35)).toBe('serviceable')
    expect(classifyCondition(20)).toBe('practice-blade')
    expect(classifyCondition(5)).toBe('scrap-iron')
  })

  it('classifySmithGrade returns correct grades', () => {
    expect(classifySmithGrade(95)).toBe('divine-smith')
    expect(classifySmithGrade(65)).toBe('master-smith')
    expect(classifySmithGrade(50)).toBe('journeyman-smith')
    expect(classifySmithGrade(35)).toBe('apprentice-smith')
    expect(classifySmithGrade(20)).toBe('village-smith')
    expect(classifySmithGrade(10)).toBe('scrap-collector')
  })

  it('classifyClusterCondition returns correct conditions', () => {
    expect(classifyClusterCondition(90)).toBe('shogun-collection')
    expect(classifyClusterCondition(75)).toBe('daimyo-armory')
    expect(classifyClusterCondition(55)).toBe('samurai-rack')
    expect(classifyClusterCondition(40)).toBe('ashigaru-stand')
    expect(classifyClusterCondition(25)).toBe('rusty-pile')
    expect(classifyClusterCondition(10)).toBe('scrap-bin')
  })

  it('classifyForgeType returns scrap-heap for empty array', () => {
    expect(classifyForgeType([])).toBe('scrap-heap')
  })

  it('classifyForgeType returns imperial-armory for high quality', () => {
    const blades = [
      { qualityScore: 90, condition: 'masterpiece' } as any,
      { qualityScore: 85, condition: 'masterpiece' } as any,
      { qualityScore: 80, condition: 'masterwork' } as any,
    ]
    expect(classifyForgeType(blades)).toBe('imperial-armory')
  })

  it('classifyForgeType returns scrap-heap for very low quality', () => {
    const blades = [
      { qualityScore: 5, condition: 'scrap-iron' } as any,
    ]
    expect(classifyForgeType(blades)).toBe('scrap-heap')
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────

describe('samurai-forge buildSamuraiForgeResult', () => {
  it('returns correct structure for 3-file mix', () => {
    const result = buildSamuraiForgeResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.armory.overallQuality).toBe(44)
    expect(result.armory.isMasterwork).toBe(false)
    expect(result.armory.avgSharpness).toBe(50)
    expect(result.armory.avgTemper).toBe(57)
    expect(result.armory.avgSpirit).toBe(48)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalClusters).toBe(1)
    expect(result.stats.masterpieceCount).toBe(0)
    expect(result.stats.scrapIronCount).toBe(1)
    expect(result.stats.smithGrade).toBe('apprentice-smith')
    expect(result.stats.bestBlade).toBe('src/a.ts')
    expect(result.stats.sharpest).toBe('src/b.ts')
    expect(result.blades).toHaveLength(3)
    expect(result.clusters).toHaveLength(1)
    expect(result.clusters[0].directory).toBe('src')
    expect(result.clusters[0].forgeType).toBe('village-forge')
    expect(result.clusters[0].condition).toBe('ashigaru-stand')
    expect(result.clusters[0].blades).toHaveLength(3)
    expect(result.clusters[0].razorSharpCount).toBe(0)
    expect(result.clusters[0].disciplinedCount).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input gracefully', () => {
    const result = buildSamuraiForgeResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalClusters).toBe(0)
    expect(result.armory.overallQuality).toBe(0)
    expect(result.armory.isMasterwork).toBe(false)
    expect(result.stats.smithGrade).toBe('scrap-collector')
    expect(result.blades).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('samurai-forge format helpers', () => {
  it('scoreColor returns a string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('masterpiece')).toBe('string')
    expect(typeof conditionColor('masterwork')).toBe('string')
    expect(typeof conditionColor('fine-blade')).toBe('string')
    expect(typeof conditionColor('serviceable')).toBe('string')
    expect(typeof conditionColor('practice-blade')).toBe('string')
    expect(typeof conditionColor('scrap-iron')).toBe('string')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns a string for each grade', () => {
    expect(typeof gradeColor('divine-smith')).toBe('string')
    expect(typeof gradeColor('master-smith')).toBe('string')
    expect(typeof gradeColor('journeyman-smith')).toBe('string')
    expect(typeof gradeColor('apprentice-smith')).toBe('string')
    expect(typeof gradeColor('village-smith')).toBe('string')
    expect(typeof gradeColor('scrap-collector')).toBe('string')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('forgeTypeColor returns a string for each type', () => {
    expect(typeof forgeTypeColor('imperial-armory')).toBe('string')
    expect(typeof forgeTypeColor('master-forge')).toBe('string')
    expect(typeof forgeTypeColor('village-forge')).toBe('string')
    expect(typeof forgeTypeColor('field-forge')).toBe('string')
    expect(typeof forgeTypeColor('backyard-anvil')).toBe('string')
    expect(typeof forgeTypeColor('scrap-heap')).toBe('string')
  })

  it('forgeTypeColor handles unknown type', () => {
    expect(forgeTypeColor('unknown')).toBe('unknown')
  })

  it('formatSamuraiForgeJson returns valid JSON', () => {
    const result = buildSamuraiForgeResult(['test.ts'], [SIMPLE])
    const json = formatSamuraiForgeJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatSamuraiForgeTable returns non-empty string', () => {
    const result = buildSamuraiForgeResult(['test.ts'], [SIMPLE])
    const table = formatSamuraiForgeTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatSamuraiForgeTable verbose includes per-blade', () => {
    const result = buildSamuraiForgeResult(['test.ts'], [SIMPLE])
    const table = formatSamuraiForgeTable(result, true)
    expect(table).toContain('test.ts')
  })
})

// ─── Counter Functions (sample) ────────────────────────────────────────────

describe('samurai-forge counter functions', () => {
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

  it('countJSDoc counts JSDoc comments', () => {
    expect(countJSDoc(RICH)).toBe(1)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBe(2)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBe(1)
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

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode(BAD)).toBe(1)
  })

  it('countExports returns 0 for empty string', () => {
    expect(countExports(EMPTY)).toBe(0)
  })
})

// ─── SIMPLE Measure Details ────────────────────────────────────────────────

describe('samurai-forge SIMPLE fixture measures', () => {
  it('measureSharpness on SIMPLE returns edge 70 sharp with no nicks', () => {
    const result = measureSharpness(SIMPLE)
    expect(result.edge).toBe(70)
    expect(result.grade).toBe('sharp')
    expect(result.isRazorSharp).toBe(false)
    expect(result.hasNoNicks).toBe(true)
    expect(result.hasNoChips).toBe(true)
    expect(result.hasNoBurr).toBe(true)
    expect(result.hasProperBevel).toBe(false)
    expect(result.hasProperEdge).toBe(false)
    expect(result.hasNoCorrosion).toBe(true)
    expect(result.nickCount).toBe(0)
  })

  it('measureTemper on SIMPLE returns hardness 60 uneven', () => {
    const result = measureTemper(SIMPLE)
    expect(result.hardness).toBe(60)
    expect(result.method).toBe('uneven')
    expect(result.isProperlyTempered).toBe(false)
    expect(result.hasProperHardness).toBe(false)
    expect(result.hasGoodEdgeRetention).toBe(false)
    expect(result.hasProperSpineFlex).toBe(false)
  })

  it('measureFolding on SIMPLE returns single-fold with 1 layer', () => {
    const result = measureFolding(SIMPLE)
    expect(result.technique).toBe('single-fold')
    expect(result.layers).toBe(1)
    expect(result.isWellRefined).toBe(false)
    expect(result.hasNoImpurities).toBe(true)
    expect(result.hasProperHeatCycle).toBe(true)
    expect(result.hasFineStructure).toBe(false)
  })

  it('measureHamon on SIMPLE returns clarity 30 absent', () => {
    const result = measureHamon(SIMPLE)
    expect(result.clarity).toBe(30)
    expect(result.style).toBe('absent')
    expect(result.hasNoBoundaryLeak).toBe(true)
    expect(result.hasNoKizu).toBe(true)
  })

  it('measureSaya on SIMPLE returns fit 30 cardboard', () => {
    const result = measureSaya(SIMPLE)
    expect(result.fit).toBe(30)
    expect(result.material).toBe('cardboard')
    expect(result.hasKurikata).toBe(true)
    expect(result.hasProperScabbard).toBe(false)
  })

  it('measureBushido on SIMPLE returns spirit 45 respect with discipline', () => {
    const result = measureBushido(SIMPLE)
    expect(result.spirit).toBe(45)
    expect(result.virtue).toBe('respect')
    expect(result.hasDiscipline).toBe(true)
    expect(result.hasGi).toBe(true)
    expect(result.hasRei).toBe(false)
    expect(result.hasJin).toBe(false)
    expect(result.hasYu).toBe(false)
    expect(result.shameCount).toBe(0)
  })
})

// ─── BAD Measure Details ───────────────────────────────────────────────────

describe('samurai-forge BAD fixture measures', () => {
  it('measureSharpness on BAD returns edge 15 rusty', () => {
    const result = measureSharpness(BAD)
    expect(result.edge).toBe(15)
    expect(result.grade).toBe('rusty')
    expect(result.hasNoChips).toBe(false)
    expect(result.hasNoBurr).toBe(false)
    expect(result.chipCount).toBe(2)
  })

  it('measureTemper on BAD returns hardness 25 raw', () => {
    const result = measureTemper(BAD)
    expect(result.hardness).toBe(25)
    expect(result.method).toBe('raw')
    expect(result.hasNoBrittleEdge).toBe(false)
    expect(result.hasNoSoftSpots).toBe(false)
  })

  it('measureFolding on BAD has impurities and slag', () => {
    const result = measureFolding(BAD)
    expect(result.hasNoImpurities).toBe(false)
    expect(result.hasNoSlag).toBe(false)
    expect(result.impurityCount).toBe(2)
    expect(result.slagCount).toBe(1)
  })

  it('measureBushido on BAD returns spirit 0 dishonor', () => {
    const result = measureBushido(BAD)
    expect(result.spirit).toBe(0)
    expect(result.virtue).toBe('dishonor')
    expect(result.hasDiscipline).toBe(false)
    expect(result.hasGi).toBe(false)
    expect(result.hasMakoto).toBe(false)
    expect(result.kiriCount).toBe(1)
    expect(result.shameCount).toBe(2)
  })

  it('measureHamon on BAD returns clarity 0 with leaks', () => {
    const result = measureHamon(BAD)
    expect(result.clarity).toBe(0)
    expect(result.leakCount).toBe(1)
    expect(result.kizuCount).toBe(1)
    expect(result.hasNoBoundaryLeak).toBe(false)
  })

  it('measureSaya on BAD returns fit 0 none', () => {
    const result = measureSaya(BAD)
    expect(result.fit).toBe(0)
    expect(result.material).toBe('none')
    expect(result.rattleCount).toBe(1)
    expect(result.stickingCount).toBe(1)
  })
})

// ─── Forge Cluster Tests ───────────────────────────────────────────────────

describe('samurai-forge forge cluster classification', () => {
  it('classifyForgeType returns field-forge for avg 25', () => {
    expect(classifyForgeType([{ qualityScore: 25, condition: 'practice-blade' } as any])).toBe('field-forge')
  })

  it('classifyForgeType returns backyard-anvil for avg 10', () => {
    expect(classifyForgeType([{ qualityScore: 10, condition: 'scrap-iron' } as any])).toBe('backyard-anvil')
  })

  it('classifyForgeType returns village-forge for avg 45', () => {
    expect(classifyForgeType([{ qualityScore: 45, condition: 'serviceable' } as any])).toBe('village-forge')
  })

  it('classifyCondition at boundaries', () => {
    expect(classifyCondition(79)).toBe('masterwork')
    expect(classifyCondition(64)).toBe('fine-blade')
    expect(classifyCondition(49)).toBe('serviceable')
    expect(classifyCondition(34)).toBe('practice-blade')
    expect(classifyCondition(19)).toBe('scrap-iron')
  })

  it('classifySmithGrade at boundaries', () => {
    expect(classifySmithGrade(79)).toBe('master-smith')
    expect(classifySmithGrade(64)).toBe('journeyman-smith')
    expect(classifySmithGrade(49)).toBe('apprentice-smith')
    expect(classifySmithGrade(34)).toBe('village-smith')
    expect(classifySmithGrade(19)).toBe('scrap-collector')
  })
})

// ─── Recommendations Tests ─────────────────────────────────────────────────

describe('samurai-forge recommendations', () => {
  it('generates quality warning when overallQuality below 50', () => {
    const result = buildSamuraiForgeResult(['src/a.ts'], [SIMPLE])
    expect(result.recommendations).toContain('Forge quality is poor — focus on removing code impurities and improving structural integrity')
  })

  it('generates sharpness warning for non-razor blades', () => {
    const result = buildSamuraiForgeResult(['src/a.ts'], [SIMPLE])
    expect(result.recommendations).toContain('1 blade(s) lack sharpness — add JSDoc, types, and remove any usage')
  })

  it('generates scrap iron warning for bad blades', () => {
    const result = buildSamuraiForgeResult(['src/a.ts', 'src/b.ts', 'src/c.ts'], [SIMPLE, BAD, BAD])
    expect(result.recommendations).toContain('2 blade(s) are scrap iron — consider complete rewrite')
  })

  it('generates bushido warning for undisciplined blades', () => {
    const result = buildSamuraiForgeResult(['src/a.ts', 'src/b.ts', 'src/c.ts'], [SIMPLE, BAD, BAD])
    expect(result.recommendations).toContain('2 blade(s) lack bushido discipline — remove console, TODO, and commented-out code')
  })

  it('generates temper and sharpness warnings for RICH single file', () => {
    const result = buildSamuraiForgeResult(['src/a.ts'], [RICH])
    expect(result.recommendations).toContain('1 blade(s) lack sharpness — add JSDoc, types, and remove any usage')
    expect(result.recommendations).toContain('1 blade(s) are improperly tempered — add error handling and remove nesting')
  })

  it('empty input generates quality warning', () => {
    const result = buildSamuraiForgeResult([], [])
    expect(result.recommendations).toContain('Forge quality is poor — focus on removing code impurities and improving structural integrity')
  })
})

// ─── Build Result Stats Edge Cases ─────────────────────────────────────────

describe('samurai-forge buildSamuraiForgeResult stats', () => {
  it('tracks bestBlade and sharpest for single SIMPLE file', () => {
    const result = buildSamuraiForgeResult(['src/a.ts'], [SIMPLE])
    expect(result.stats.bestBlade).toBe('src/a.ts')
    expect(result.stats.sharpest).toBe('src/a.ts')
    expect(result.stats.bestTempered).toBe('src/a.ts')
    expect(result.stats.mostDisciplined).toBe('src/a.ts')
    expect(result.stats.smithGrade).toBe('apprentice-smith')
    expect(result.stats.serviceableCount).toBe(1)
    expect(result.stats.scrapIronCount).toBe(0)
  })

  it('computes correct averages for mixed input', () => {
    const result = buildSamuraiForgeResult(['src/a.ts', 'src/b.ts', 'src/c.ts'], [SIMPLE, BAD, BAD])
    expect(result.armory.avgSharpness).toBe(33)
    expect(result.armory.avgTemper).toBe(37)
    expect(result.armory.avgSpirit).toBe(15)
    expect(result.armory.overallQuality).toBe(21)
    expect(result.stats.scrapIronCount).toBe(2)
    expect(result.stats.serviceableCount).toBe(1)
    expect(result.stats.hasDisciplineCount).toBe(1)
    expect(result.stats.smithGrade).toBe('village-smith')
  })

  it('cluster has correct directory grouping', () => {
    const result = buildSamuraiForgeResult(['src/a.ts', 'src/b.ts'], [SIMPLE, BAD])
    expect(result.clusters).toHaveLength(1)
    expect(result.clusters[0].directory).toBe('src')
    expect(result.clusters[0].blades).toHaveLength(2)
    expect(result.clusters[0].disciplinedCount).toBe(1)
  })
})
