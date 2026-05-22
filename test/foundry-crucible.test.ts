import { describe, expect, it } from 'vitest'

import {
  measureMetal,
  measureCasting,
  measureForging,
  measureTemper,
  measureHeat,
  measureAlloy,
  analyzeFoundryCasting,
  analyzeFoundryFloor,
  buildFoundryCrucibleResult,
  classifyCondition,
  classifyMetallurgistGrade,
  classifyFloorType,
  classifyFloorCondition,
  generateRecommendations,
  countExports,
  countImports,
  countFunctions,
  countArrows,
  countClasses,
  countInterfaces,
  countTypeAliases,
  countEnums,
  countJSDoc,
  countBlockComments,
  countAsync,
  countAwaits,
  countTryCatch,
  countCatches,
  countFinallys,
  countThrows,
  countIfs,
  countElses,
  countSwitches,
  countForLoops,
  countWhileLoops,
  countNestedBlocks,
  countDeepNested,
  countTernaries,
  countConsole,
  countTodos,
  countErrors,
  countReturns,
  countDefaultParams,
  countSpreads,
  countDestructures,
  countGenerics,
  countAccessModifiers,
  countStatic,
  countAny,
  countReadonly,
  countPromises,
  countCommentedCode,
  countCallbackNesting,
  countPromiseChains,
  countEarlyReturns,
  countReexports,
  countDynamicImports,
  countBreaks,
  countContinues,
  countYields,
} from '../src/commands/foundry-crucible-helpers.js'

import {
  formatFoundryCrucibleJson,
  formatFoundryCrucibleTable,
  scoreColor,
  conditionColor,
  gradeColor,
  floorTypeColor,
} from '../src/commands/foundry-crucible-format-helpers.js'

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

// ─── Counter Tests ─────────────────────────────────────────────────────────

describe('foundry-crucible counters', () => {
  it('countExports counts exports', () => {
    expect(countExports(RICH)).toBeGreaterThanOrEqual(6)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports(RICH)).toBeGreaterThanOrEqual(2)
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(RICH)).toBeGreaterThanOrEqual(1)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countClasses counts classes', () => {
    expect(countClasses(RICH)).toBeGreaterThanOrEqual(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(RICH)).toBeGreaterThanOrEqual(1)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(RICH)).toBeGreaterThanOrEqual(1)
    expect(countJSDoc(EMPTY)).toBe(0)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBeGreaterThanOrEqual(2)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTryCatch(EMPTY)).toBe(0)
  })

  it('countIfs counts if statements', () => {
    expect(countIfs(RICH)).toBeGreaterThanOrEqual(3)
    expect(countIfs(EMPTY)).toBe(0)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(RICH)).toBeGreaterThanOrEqual(4)
    expect(countNestedBlocks(EMPTY)).toBe(0)
  })

  it('countGenerics counts generics', () => {
    expect(countGenerics(RICH)).toBeGreaterThanOrEqual(1)
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countAccessModifiers counts access modifiers', () => {
    expect(countAccessModifiers(RICH)).toBeGreaterThanOrEqual(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(BAD)).toBeGreaterThanOrEqual(1)
    expect(countConsole(EMPTY)).toBe(0)
  })

  it('countTodos counts TODO/FIXME', () => {
    expect(countTodos(BAD)).toBeGreaterThanOrEqual(1)
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countAny counts any keyword', () => {
    expect(countAny(BAD)).toBeGreaterThanOrEqual(1)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode(BAD)).toBeGreaterThanOrEqual(1)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBeGreaterThanOrEqual(1)
    expect(countSpreads(EMPTY)).toBe(0)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBeGreaterThanOrEqual(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBeGreaterThanOrEqual(1)
    expect(countPromises(EMPTY)).toBe(0)
  })

  it('countEarlyReturns counts early returns', () => {
    expect(countEarlyReturns(RICH)).toBeGreaterThanOrEqual(1)
    expect(countEarlyReturns(EMPTY)).toBe(0)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countEnums counts enums', () => {
    expect(countEnums(RICH)).toBeGreaterThanOrEqual(1)
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countBlockComments counts block comments', () => {
    expect(countBlockComments(RICH)).toBeGreaterThanOrEqual(1)
    expect(countBlockComments(EMPTY)).toBe(0)
  })

  it('countAwaits counts await keywords', () => {
    expect(countAwaits(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAwaits(EMPTY)).toBe(0)
  })

  it('countCatches counts catch blocks', () => {
    expect(countCatches(RICH)).toBeGreaterThanOrEqual(1)
    expect(countCatches(EMPTY)).toBe(0)
  })

  it('countFinallys counts finally blocks', () => {
    expect(countFinallys(RICH)).toBeGreaterThanOrEqual(1)
    expect(countFinallys(EMPTY)).toBe(0)
  })

  it('countThrows counts throw statements', () => {
    expect(countThrows(RICH)).toBeGreaterThanOrEqual(1)
    expect(countThrows(EMPTY)).toBe(0)
  })

  it('countForLoops counts for loops', () => {
    expect(countForLoops(RICH)).toBeGreaterThanOrEqual(1)
    expect(countForLoops(EMPTY)).toBe(0)
  })

  it('countDeepNested counts deep nesting', () => {
    expect(countDeepNested(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDeepNested(EMPTY)).toBe(0)
  })

  it('countErrors counts Error instantiation', () => {
    expect(countErrors(RICH)).toBeGreaterThanOrEqual(1)
    expect(countErrors(EMPTY)).toBe(0)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReturns(EMPTY)).toBe(0)
  })

  it('countCallbackNesting counts callback nesting', () => {
    expect(countCallbackNesting(EMPTY)).toBe(0)
  })

  it('countReexports counts re-exports', () => {
    expect(countReexports(EMPTY)).toBe(0)
  })

  it('countDynamicImports counts dynamic imports', () => {
    expect(countDynamicImports(EMPTY)).toBe(0)
  })
})

// ─── Measure Tests ─────────────────────────────────────────────────────────

describe('foundry-crucible measures', () => {
  it('measureMetal returns correct values for RICH', () => {
    const m = measureMetal(RICH)
    expect(m.purity).toBe(100)
    expect(m.grade).toBe('titanium')
    expect(m.isPure).toBe(true)
    expect(m.hasNoImpurities).toBe(true)
    expect(m.hasNoSlag).toBe(true)
    expect(m.impurityCount).toBe(0)
    expect(m.blowholeCount).toBe(0)
  })

  it('measureMetal returns correct values for EMPTY', () => {
    const m = measureMetal(EMPTY)
    expect(m.purity).toBe(90)
    expect(m.isPure).toBe(true)
    expect(m.hasNoPorosity).toBe(false)
  })

  it('measureCasting returns correct values for RICH', () => {
    const c = measureCasting(RICH)
    expect(c.quality).toBe(100)
    expect(c.method).toBe('investment')
    expect(c.isWellCast).toBe(true)
    expect(c.hasSharpDetails).toBe(true)
    expect(c.hasSmoothSurface).toBe(true)
    expect(c.hasNoShrinkage).toBe(true)
    expect(c.hasNoMisruns).toBe(true)
    expect(c.hasProperDraft).toBe(true)
    expect(c.shrinkageCount).toBe(0)
    expect(c.misrunCount).toBe(0)
  })

  it('measureCasting returns correct values for EMPTY', () => {
    const c = measureCasting(EMPTY)
    expect(c.quality).toBe(15)
    expect(c.method).toBe('hand-poured')
    expect(c.isWellCast).toBe(false)
    expect(c.shrinkageCount).toBe(1)
    expect(c.misrunCount).toBe(1)
  })

  it('measureForging returns correct values for RICH', () => {
    const f = measureForging(RICH)
    expect(f.strength).toBe(90)
    expect(f.technique).toBe('closed-die')
    expect(f.isStrong).toBe(true)
    expect(f.hasProperGrain).toBe(true)
    expect(f.hasWorkHardening).toBe(true)
    expect(f.hasProperFlow).toBe(true)
    expect(f.hasNoCracking).toBe(true)
    expect(f.crackCount).toBe(0)
    expect(f.lapCount).toBe(0)
  })

  it('measureForging returns correct values for EMPTY', () => {
    const f = measureForging(EMPTY)
    expect(f.strength).toBe(35)
    expect(f.technique).toBe('roll')
    expect(f.isStrong).toBe(false)
    expect(f.hasProperGrain).toBe(false)
  })

  it('measureTemper returns correct values for RICH', () => {
    const t = measureTemper(RICH)
    expect(t.hardness).toBe(70)
    expect(t.scale).toBe('rockwell-50')
    expect(t.isHardened).toBe(true)
    expect(t.hasProperTemper).toBe(true)
    expect(t.hasSpringTemper).toBe(true)
    expect(t.hasMartensite).toBe(true)
    expect(t.hasNoQuenchCracks).toBe(true)
    expect(t.quenchCrackCount).toBe(0)
  })

  it('measureTemper returns correct values for EMPTY', () => {
    const t = measureTemper(EMPTY)
    expect(t.hardness).toBe(20)
    expect(t.scale).toBe('rockwell-20')
    expect(t.isHardened).toBe(false)
    expect(t.hasProperTemper).toBe(false)
  })

  it('measureHeat returns correct values for RICH', () => {
    const h = measureHeat(RICH)
    expect(h.treatment).toBe(70)
    expect(h.process).toBe('normalizing')
    expect(h.isOptimized).toBe(true)
    expect(h.hasQuenching).toBe(true)
    expect(h.hasCaseHardening).toBe(true)
    expect(h.hasNormalizing).toBe(true)
    expect(h.hasNoOverheating).toBe(true)
    expect(h.overheatingCount).toBe(0)
  })

  it('measureHeat returns correct values for EMPTY', () => {
    const h = measureHeat(EMPTY)
    expect(h.treatment).toBe(10)
    expect(h.process).toBe('raw')
    expect(h.isOptimized).toBe(false)
  })

  it('measureAlloy returns correct values for RICH', () => {
    const a = measureAlloy(RICH)
    expect(a.composition).toBe(100)
    expect(a.type).toBe('stainless-steel')
    expect(a.isWellProportioned).toBe(true)
    expect(a.hasBalancedComposition).toBe(true)
    expect(a.hasNoUndesirable).toBe(true)
    expect(a.undesirableCount).toBe(0)
    expect(a.segregationCount).toBe(0)
  })

  it('measureAlloy returns correct values for EMPTY', () => {
    const a = measureAlloy(EMPTY)
    expect(a.composition).toBe(15)
    expect(a.type).toBe('pot-metal')
    expect(a.isWellProportioned).toBe(false)
    expect(a.hasBalancedComposition).toBe(false)
  })
})

// ─── Classifier Tests ──────────────────────────────────────────────────────

describe('foundry-crucible classifiers', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(85)).toBe('damascus-steel')
    expect(classifyCondition(70)).toBe('tool-steel')
    expect(classifyCondition(55)).toBe('structural-steel')
    expect(classifyCondition(40)).toBe('cast-iron')
    expect(classifyCondition(25)).toBe('pig-iron')
    expect(classifyCondition(10)).toBe('slag')
  })

  it('classifyMetallurgistGrade returns correct grades', () => {
    expect(classifyMetallurgistGrade(85)).toBe('master-metallurgist')
    expect(classifyMetallurgistGrade(70)).toBe('metallurgist')
    expect(classifyMetallurgistGrade(55)).toBe('blacksmith')
    expect(classifyMetallurgistGrade(40)).toBe('apprentice')
    expect(classifyMetallurgistGrade(25)).toBe('tinker')
    expect(classifyMetallurgistGrade(10)).toBe('scrap-dealer')
  })

  it('classifyFloorCondition returns correct conditions', () => {
    expect(classifyFloorCondition(85)).toBe('world-class-foundry')
    expect(classifyFloorCondition(70)).toBe('modern-steel-works')
    expect(classifyFloorCondition(55)).toBe('traditional-forge')
    expect(classifyFloorCondition(40)).toBe('backyard-foundry')
    expect(classifyFloorCondition(25)).toBe('scrap-metal')
    expect(classifyFloorCondition(10)).toBe('cold-ashes')
  })

  it('classifyFloorType handles empty castings', () => {
    expect(classifyFloorType([])).toBe('volcano')
  })
})

// ─── Analysis Tests ────────────────────────────────────────────────────────

describe('foundry-crucible analysis', () => {
  it('analyzeFoundryCasting returns correct structure for RICH', () => {
    const c = analyzeFoundryCasting(RICH, 'src/commands/analyzer.ts')
    expect(c.file).toBe('src/commands/analyzer.ts')
    expect(c.qualityScore).toBe(91)
    expect(c.condition).toBe('damascus-steel')
    expect(c.metalPurity).toBe(100)
    expect(c.castingQuality).toBe(100)
    expect(c.forgingStrength).toBe(90)
    expect(c.temperHardness).toBe(70)
    expect(c.heatTreatment).toBe(70)
    expect(c.alloyComposition).toBe(100)
  })

  it('analyzeFoundryCasting returns correct structure for EMPTY', () => {
    const c = analyzeFoundryCasting(EMPTY, 'empty.ts')
    expect(c.file).toBe('empty.ts')
    expect(c.qualityScore).toBe(34)
    expect(c.condition).toBe('pig-iron')
    expect(c.metalPurity).toBe(90)
    expect(c.castingQuality).toBe(15)
    expect(c.forgingStrength).toBe(35)
    expect(c.temperHardness).toBe(20)
    expect(c.heatTreatment).toBe(10)
    expect(c.alloyComposition).toBe(15)
  })

  it('analyzeFoundryFloor groups castings correctly', () => {
    const castings = [
      analyzeFoundryCasting(RICH, 'src/a.ts'),
      analyzeFoundryCasting(SIMPLE, 'src/b.ts'),
    ]
    const floor = analyzeFoundryFloor(castings, 'src')
    expect(floor.directory).toBe('src')
    expect(floor.castings).toHaveLength(2)
    expect(floor.floorType).toBeDefined()
    expect(floor.condition).toBeDefined()
  })
})

// ─── Builder Tests ─────────────────────────────────────────────────────────

describe('foundry-crucible builder', () => {
  it('buildFoundryCrucibleResult handles 3-file mix', () => {
    const result = buildFoundryCrucibleResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.castings).toHaveLength(3)
    expect(result.floors).toHaveLength(1)
    expect(result.guild.overallStrength).toBe(50)
    expect(result.guild.isHighGrade).toBe(true)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalFloors).toBe(1)
    expect(result.stats.metallurgistGrade).toBe('blacksmith')
    expect(result.stats.damascusSteelCount).toBe(1)
    expect(result.stats.slagCount).toBe(1)
    expect(result.stats.bestCasting).toBe('src/a.ts')
    expect(result.stats.purestMetal).toBe('src/a.ts')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('buildFoundryCrucibleResult handles empty input', () => {
    const result = buildFoundryCrucibleResult([], [])
    expect(result.castings).toHaveLength(0)
    expect(result.floors).toHaveLength(0)
    expect(result.guild.overallStrength).toBe(0)
    expect(result.guild.isHighGrade).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestCasting).toBe('')
  })

  it('buildFoundryCrucibleResult groups files by directory', () => {
    const result = buildFoundryCrucibleResult(
      ['src/a.ts', 'test/b.ts'],
      [RICH, SIMPLE],
    )
    expect(result.floors).toHaveLength(2)
  })

  it('generateRecommendations returns array of strings', () => {
    const result = buildFoundryCrucibleResult(['x.ts'], [BAD])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
    for (const rec of result.recommendations) {
      expect(typeof rec).toBe('string')
    }
  })
})

// ─── Format Helper Tests ───────────────────────────────────────────────────

describe('foundry-crucible format helpers', () => {
  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('damascus-steel')).toBe('string')
    expect(typeof conditionColor('tool-steel')).toBe('string')
    expect(typeof conditionColor('structural-steel')).toBe('string')
    expect(typeof conditionColor('cast-iron')).toBe('string')
    expect(typeof conditionColor('pig-iron')).toBe('string')
    expect(typeof conditionColor('slag')).toBe('string')
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('master-metallurgist')).toBe('string')
    expect(typeof gradeColor('metallurgist')).toBe('string')
    expect(typeof gradeColor('blacksmith')).toBe('string')
    expect(typeof gradeColor('apprentice')).toBe('string')
    expect(typeof gradeColor('tinker')).toBe('string')
    expect(typeof gradeColor('scrap-dealer')).toBe('string')
  })

  it('floorTypeColor returns string for all types', () => {
    expect(typeof floorTypeColor('precision-foundry')).toBe('string')
    expect(typeof floorTypeColor('steel-mill')).toBe('string')
    expect(typeof floorTypeColor('iron-works')).toBe('string')
    expect(typeof floorTypeColor('brass-foundry')).toBe('string')
    expect(typeof floorTypeColor('scrap-yard')).toBe('string')
    expect(typeof floorTypeColor('volcano')).toBe('string')
    expect(floorTypeColor('unknown')).toBe('unknown')
  })

  it('formatFoundryCrucibleJson returns valid JSON', () => {
    const result = buildFoundryCrucibleResult(['x.ts'], [RICH])
    const json = formatFoundryCrucibleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.castings).toHaveLength(1)
  })

  it('formatFoundryCrucibleTable returns string with overview', () => {
    const result = buildFoundryCrucibleResult(['x.ts'], [RICH])
    const table = formatFoundryCrucibleTable(result, false)
    expect(table).toContain('Foundry Crucible Analysis')
    expect(table).toContain('Guild Overview')
    expect(table).toContain('Statistics')
  })

  it('formatFoundryCrucibleTable shows verbose per-casting breakdown', () => {
    const result = buildFoundryCrucibleResult(['x.ts'], [RICH])
    const table = formatFoundryCrucibleTable(result, true)
    expect(table).toContain('Per-Casting Breakdown')
    expect(table).toContain('Condition:')
  })
})
