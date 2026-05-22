import { describe, expect, it } from 'vitest'

import {
  measureConstruction,
  measureDepth,
  measureMaterial,
  measureColony,
  measureIncubation,
  measureFledging,
  buildRookeryNestResult,
  classifyCondition,
  classifyOrnithologistGrade,
  classifyTreeType,
  classifyTreeCondition,
  analyzeNestStructure,
  analyzeRookeryTree,
  countExports,
  countImports,
  countFunctions,
  countArrows,
  countClasses,
  countInterfaces,
  countTypeAliases,
  countEnums,
  countComments,
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
  generateRecommendations,
} from '../src/commands/rookery-nest-helpers.js'

import {
  formatRookeryNestJson,
  formatRookeryNestTable,
  scoreColor,
  conditionColor,
  gradeColor,
  treeTypeColor,
} from '../src/commands/rookery-nest-format-helpers.js'

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

describe('rookery-nest counters', () => {
  it('countExports counts export keywords', () => {
    expect(countExports(RICH)).toBeGreaterThanOrEqual(6)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports counts import keywords', () => {
    expect(countImports(RICH)).toBeGreaterThanOrEqual(2)
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBeGreaterThanOrEqual(1)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(RICH)).toBeGreaterThanOrEqual(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces counts interface declarations', () => {
    expect(countInterfaces(RICH)).toBeGreaterThanOrEqual(1)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countEnums counts enum declarations', () => {
    expect(countEnums(RICH)).toBeGreaterThanOrEqual(1)
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countComments counts line comments', () => {
    expect(countComments(EMPTY)).toBe(0)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(RICH)).toBeGreaterThanOrEqual(1)
    expect(countJSDoc(EMPTY)).toBe(0)
  })

  it('countBlockComments counts block comments', () => {
    expect(countBlockComments(RICH)).toBeGreaterThanOrEqual(1)
    expect(countBlockComments(EMPTY)).toBe(0)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBeGreaterThanOrEqual(2)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countAwaits counts await keywords', () => {
    expect(countAwaits(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAwaits(EMPTY)).toBe(0)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTryCatch(EMPTY)).toBe(0)
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

  it('countIfs counts if statements', () => {
    expect(countIfs(RICH)).toBeGreaterThanOrEqual(3)
    expect(countIfs(EMPTY)).toBe(0)
  })

  it('countElses counts else statements', () => {
    expect(countElses(EMPTY)).toBe(0)
  })

  it('countSwitches counts switch statements', () => {
    expect(countSwitches(EMPTY)).toBe(0)
  })

  it('countForLoops counts for loops', () => {
    expect(countForLoops(RICH)).toBeGreaterThanOrEqual(1)
    expect(countForLoops(EMPTY)).toBe(0)
  })

  it('countWhileLoops counts while loops', () => {
    expect(countWhileLoops(EMPTY)).toBe(0)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(RICH)).toBeGreaterThanOrEqual(4)
    expect(countNestedBlocks(EMPTY)).toBe(0)
  })

  it('countDeepNested counts deeply nested blocks', () => {
    expect(countDeepNested(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDeepNested(EMPTY)).toBe(0)
  })

  it('countTernaries counts ternary expressions', () => {
    expect(countTernaries(EMPTY)).toBe(0)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(BAD)).toBeGreaterThanOrEqual(1)
    expect(countConsole(EMPTY)).toBe(0)
  })

  it('countTodos counts TODO/FIXME comments', () => {
    expect(countTodos(BAD)).toBeGreaterThanOrEqual(1)
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countErrors counts Error instantiations', () => {
    expect(countErrors(RICH)).toBeGreaterThanOrEqual(1)
    expect(countErrors(EMPTY)).toBe(0)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReturns(EMPTY)).toBe(0)
  })

  it('countDefaultParams counts default parameters', () => {
    expect(countDefaultParams(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDefaultParams(EMPTY)).toBe(0)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBeGreaterThanOrEqual(1)
    expect(countSpreads(EMPTY)).toBe(0)
  })

  it('countDestructures counts destructuring patterns', () => {
    expect(countDestructures(EMPTY)).toBe(0)
  })

  it('countGenerics counts generic type parameters', () => {
    expect(countGenerics(RICH)).toBeGreaterThanOrEqual(1)
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countAccessModifiers counts private/protected/public', () => {
    expect(countAccessModifiers(RICH)).toBeGreaterThanOrEqual(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBeGreaterThanOrEqual(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countAny counts any keywords', () => {
    expect(countAny(BAD)).toBeGreaterThanOrEqual(1)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countReadonly counts readonly keywords', () => {
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBeGreaterThanOrEqual(1)
    expect(countPromises(EMPTY)).toBe(0)
  })

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode(BAD)).toBeGreaterThanOrEqual(1)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countCallbackNesting counts nested functions', () => {
    expect(countCallbackNesting(EMPTY)).toBe(0)
  })

  it('countPromiseChains counts .then() calls', () => {
    expect(countPromiseChains(EMPTY)).toBe(0)
  })

  it('countEarlyReturns counts early return patterns', () => {
    expect(countEarlyReturns(RICH)).toBeGreaterThanOrEqual(1)
    expect(countEarlyReturns(EMPTY)).toBe(0)
  })

  it('countReexports counts re-export statements', () => {
    expect(countReexports(EMPTY)).toBe(0)
  })

  it('countDynamicImports counts dynamic imports', () => {
    expect(countDynamicImports(EMPTY)).toBe(0)
  })

  it('countBreaks counts break statements', () => {
    expect(countBreaks(EMPTY)).toBe(0)
  })

  it('countContinues counts continue statements', () => {
    expect(countContinues(EMPTY)).toBe(0)
  })

  it('countYields counts yield expressions', () => {
    expect(countYields(EMPTY)).toBe(0)
  })
})

// ─── Measure Tests ─────────────────────────────────────────────────────────

describe('rookery-nest measures', () => {
  it('measureConstruction returns correct values for RICH', () => {
    const c = measureConstruction(RICH)
    expect(c.quality).toBe(95)
    expect(c.type).toBe('weaver')
    expect(c.isWellBuilt).toBe(true)
    expect(c.hasProperFoundation).toBe(true)
    expect(c.hasStructuralIntegrity).toBe(true)
    expect(c.hasProperEntrance).toBe(true)
    expect(c.hasVentilation).toBe(true)
    expect(c.hasInsulation).toBe(true)
    expect(c.hasReinforcement).toBe(true)
    expect(c.hasWeatherproofing).toBe(true)
    expect(c.hasCamouflage).toBe(true)
    expect(c.hasNoStructuralFlaws).toBe(true)
    expect(c.flawCount).toBe(0)
  })

  it('measureConstruction returns correct values for EMPTY', () => {
    const c = measureConstruction(EMPTY)
    expect(c.quality).toBe(5)
    expect(c.type).toBe('cuckoo')
    expect(c.isWellBuilt).toBe(false)
    expect(c.hasProperFoundation).toBe(false)
    expect(c.hasStructuralIntegrity).toBe(false)
    expect(c.flawCount).toBe(0)
  })

  it('measureConstruction returns correct values for BAD', () => {
    const c = measureConstruction(BAD)
    expect(c.flawCount).toBe(4)
    expect(c.hasNoStructuralFlaws).toBe(false)
    expect(c.type).toBe('cuckoo')
  })

  it('measureDepth returns correct values for RICH', () => {
    const d = measureDepth(RICH)
    expect(d.level).toBe(39)
    expect(d.category).toBe('moderate')
    expect(d.hasAsyncAwait).toBe(true)
    expect(d.hasClosureCapture).toBe(true)
    expect(d.hasEarlyReturns).toBe(true)
    expect(d.hasProperAbstraction).toBe(true)
    expect(d.maxDepth).toBe(5)
    expect(d.earlyReturnCount).toBe(1)
  })

  it('measureDepth returns correct values for EMPTY', () => {
    const d = measureDepth(EMPTY)
    expect(d.level).toBe(0)
    expect(d.category).toBe('flat')
    expect(d.isAppropriate).toBe(true)
    expect(d.maxDepth).toBe(0)
  })

  it('measureMaterial returns correct values for RICH', () => {
    const m = measureMaterial(RICH)
    expect(m.quality).toBe(100)
    expect(m.type).toBe('silk')
    expect(m.isHighQuality).toBe(true)
    expect(m.hasCleanImports).toBe(true)
    expect(m.hasCleanExports).toBe(true)
    expect(m.hasNoDebris).toBe(true)
    expect(m.hasNoParasites).toBe(true)
    expect(m.hasRecycledMaterial).toBe(true)
    expect(m.debrisCount).toBe(0)
    expect(m.parasiteCount).toBe(0)
  })

  it('measureMaterial returns correct values for EMPTY', () => {
    const m = measureMaterial(EMPTY)
    expect(m.quality).toBe(35)
    expect(m.type).toBe('mud')
    expect(m.isHighQuality).toBe(false)
    expect(m.hasNoDebris).toBe(true)
  })

  it('measureColony returns correct values for RICH', () => {
    const c = measureColony(RICH, 'src/commands/analyzer.ts')
    expect(c.organization).toBe(85)
    expect(c.pattern).toBe('communal')
    expect(c.isOrganized).toBe(true)
    expect(c.hasProperGrouping).toBe(true)
    expect(c.hasModuleBoundaries).toBe(true)
    expect(c.hasConsistentStructure).toBe(true)
    expect(c.hasDocumentation).toBe(true)
    expect(c.hasNoOrphans).toBe(true)
    expect(c.orphanCount).toBe(0)
  })

  it('measureColony returns correct values for EMPTY', () => {
    const c = measureColony(EMPTY, 'empty.ts')
    expect(c.organization).toBe(0)
    expect(c.pattern).toBe('solitary')
    expect(c.isOrganized).toBe(false)
    expect(c.hasNoOrphans).toBe(false)
    expect(c.orphanCount).toBe(1)
  })

  it('measureColony detects index files', () => {
    const c = measureColony(SIMPLE, 'src/index.ts')
    expect(c.hasIndexFile).toBe(true)
  })

  it('measureColony detects test files', () => {
    const c = measureColony(SIMPLE, 'src/foo.test.ts')
    expect(c.hasTestFile).toBe(true)
  })

  it('measureIncubation returns correct values for RICH', () => {
    const i = measureIncubation(RICH)
    expect(i.quality).toBe(48)
    expect(i.stage).toBe('juvenile')
    expect(i.isMature).toBe(true)
    expect(i.maturityScore).toBe(70)
    expect(i.hasTesting).toBe(true)
    expect(i.hasTypeChecking).toBe(true)
    expect(i.hasLinting).toBe(true)
    expect(i.hasCodeReview).toBe(true)
    expect(i.hasVersioning).toBe(true)
    expect(i.hasChangelog).toBe(true)
  })

  it('measureIncubation returns correct values for EMPTY', () => {
    const i = measureIncubation(EMPTY)
    expect(i.quality).toBe(0)
    expect(i.stage).toBe('fossil')
    expect(i.isMature).toBe(false)
    expect(i.maturityScore).toBe(0)
  })

  it('measureFledging returns correct values for RICH', () => {
    const f = measureFledging(RICH)
    expect(f.success).toBe(35)
    expect(f.readiness).toBe('too-young')
    expect(f.hasErrorHandling).toBe(true)
    expect(f.hasNoKnownBugs).toBe(true)
    expect(f.isReady).toBe(false)
    expect(f.knownBugCount).toBe(0)
  })

  it('measureFledging returns correct values for EMPTY', () => {
    const f = measureFledging(EMPTY)
    expect(f.success).toBe(10)
    expect(f.readiness).toBe('grounded')
    expect(f.hasErrorHandling).toBe(false)
    expect(f.isReady).toBe(false)
  })
})

// ─── Classifier Tests ──────────────────────────────────────────────────────

describe('rookery-nest classifiers', () => {
  it('classifyCondition returns correct grades', () => {
    expect(classifyCondition(85)).toBe('master-weaver')
    expect(classifyCondition(70)).toBe('eagle-nest')
    expect(classifyCondition(55)).toBe('swallow-colony')
    expect(classifyCondition(40)).toBe('pigeon-roost')
    expect(classifyCondition(25)).toBe('ground-nest')
    expect(classifyCondition(10)).toBe('cuckoo-laying')
  })

  it('classifyOrnithologistGrade returns correct grades', () => {
    expect(classifyOrnithologistGrade(85)).toBe('master-ornithologist')
    expect(classifyOrnithologistGrade(70)).toBe('bird-bander')
    expect(classifyOrnithologistGrade(55)).toBe('birdwatcher')
    expect(classifyOrnithologistGrade(40)).toBe('amateur')
    expect(classifyOrnithologistGrade(25)).toBe('nest-inspector')
    expect(classifyOrnithologistGrade(10)).toBe('egg-collector')
  })

  it('classifyTreeCondition returns correct conditions', () => {
    expect(classifyTreeCondition(85)).toBe('prime-rookery')
    expect(classifyTreeCondition(70)).toBe('healthy-colony')
    expect(classifyTreeCondition(55)).toBe('established-nesting')
    expect(classifyTreeCondition(40)).toBe('new-settlement')
    expect(classifyTreeCondition(25)).toBe('abandoned-rookery')
    expect(classifyTreeCondition(10)).toBe('fallen-tree')
  })

  it('classifyTreeType handles empty nests', () => {
    expect(classifyTreeType([])).toBe('ground')
  })
})

// ─── Analysis Tests ────────────────────────────────────────────────────────

describe('rookery-nest analysis', () => {
  it('analyzeNestStructure returns correct structure for RICH', () => {
    const nest = analyzeNestStructure(RICH, 'src/commands/analyzer.ts')
    expect(nest.file).toBe('src/commands/analyzer.ts')
    expect(nest.qualityScore).toBe(72)
    expect(nest.condition).toBe('eagle-nest')
    expect(nest.nestConstruction).toBe(95)
    expect(nest.nestingDepth).toBe(39)
    expect(nest.nestingMaterial).toBe(100)
    expect(nest.colonyOrganization).toBe(85)
    expect(nest.incubationQuality).toBe(48)
    expect(nest.fledgingSuccess).toBe(35)
  })

  it('analyzeNestStructure returns correct structure for EMPTY', () => {
    const nest = analyzeNestStructure(EMPTY, 'empty.ts')
    expect(nest.file).toBe('empty.ts')
    expect(nest.qualityScore).toBe(10)
    expect(nest.condition).toBe('cuckoo-laying')
    expect(nest.nestConstruction).toBe(5)
    expect(nest.nestingDepth).toBe(0)
    expect(nest.nestingMaterial).toBe(35)
    expect(nest.colonyOrganization).toBe(0)
    expect(nest.incubationQuality).toBe(0)
    expect(nest.fledgingSuccess).toBe(10)
  })

  it('analyzeRookeryTree groups nests correctly', () => {
    const nests = [
      analyzeNestStructure(RICH, 'src/a.ts'),
      analyzeNestStructure(SIMPLE, 'src/b.ts'),
    ]
    const tree = analyzeRookeryTree(nests, 'src')
    expect(tree.directory).toBe('src')
    expect(tree.nests).toHaveLength(2)
    expect(tree.treeType).toBeDefined()
    expect(tree.condition).toBeDefined()
  })
})

// ─── Builder Tests ─────────────────────────────────────────────────────────

describe('rookery-nest builder', () => {
  it('buildRookeryNestResult handles 3-file mix', () => {
    const result = buildRookeryNestResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.nests).toHaveLength(3)
    expect(result.trees).toHaveLength(1)
    expect(result.rookery.overallColony).toBe(32)
    expect(result.rookery.isHealthyColony).toBe(false)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalTrees).toBe(1)
    expect(result.stats.ornithologistGrade).toBe('nest-inspector')
    expect(result.stats.cuckooCount).toBe(1)
    expect(result.stats.bestNest).toBe('src/a.ts')
    expect(result.stats.bestConstructed).toBe('src/a.ts')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('buildRookeryNestResult handles empty input', () => {
    const result = buildRookeryNestResult([], [])
    expect(result.nests).toHaveLength(0)
    expect(result.trees).toHaveLength(0)
    expect(result.rookery.overallColony).toBe(0)
    expect(result.rookery.isHealthyColony).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestNest).toBe('')
  })

  it('buildRookeryNestResult groups files by directory', () => {
    const result = buildRookeryNestResult(
      ['src/a.ts', 'test/b.ts'],
      [RICH, SIMPLE],
    )
    expect(result.trees).toHaveLength(2)
  })

  it('generateRecommendations returns array of strings', () => {
    const result = buildRookeryNestResult(['x.ts'], [BAD])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
    for (const rec of result.recommendations) {
      expect(typeof rec).toBe('string')
    }
  })
})

// ─── Format Helper Tests ───────────────────────────────────────────────────

describe('rookery-nest format helpers', () => {
  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('master-weaver')).toBe('string')
    expect(typeof conditionColor('eagle-nest')).toBe('string')
    expect(typeof conditionColor('swallow-colony')).toBe('string')
    expect(typeof conditionColor('pigeon-roost')).toBe('string')
    expect(typeof conditionColor('ground-nest')).toBe('string')
    expect(typeof conditionColor('cuckoo-laying')).toBe('string')
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('master-ornithologist')).toBe('string')
    expect(typeof gradeColor('bird-bander')).toBe('string')
    expect(typeof gradeColor('birdwatcher')).toBe('string')
    expect(typeof gradeColor('amateur')).toBe('string')
    expect(typeof gradeColor('nest-inspector')).toBe('string')
    expect(typeof gradeColor('egg-collector')).toBe('string')
  })

  it('treeTypeColor returns string for all types', () => {
    expect(typeof treeTypeColor('ancient-oak')).toBe('string')
    expect(typeof treeTypeColor('mature-tree')).toBe('string')
    expect(typeof treeTypeColor('young-tree')).toBe('string')
    expect(typeof treeTypeColor('hedgerow')).toBe('string')
    expect(typeof treeTypeColor('cliff-face')).toBe('string')
    expect(typeof treeTypeColor('ground')).toBe('string')
    expect(treeTypeColor('unknown')).toBe('unknown')
  })

  it('formatRookeryNestJson returns valid JSON', () => {
    const result = buildRookeryNestResult(['x.ts'], [RICH])
    const json = formatRookeryNestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.nests).toHaveLength(1)
  })

  it('formatRookeryNestTable returns string with overview', () => {
    const result = buildRookeryNestResult(['x.ts'], [RICH])
    const table = formatRookeryNestTable(result, false)
    expect(table).toContain('Rookery Nest Analysis')
    expect(table).toContain('Colony Overview')
    expect(table).toContain('Statistics')
  })

  it('formatRookeryNestTable shows verbose per-nest breakdown', () => {
    const result = buildRookeryNestResult(['x.ts'], [RICH])
    const table = formatRookeryNestTable(result, true)
    expect(table).toContain('Per-Nest Breakdown')
    expect(table).toContain('Condition:')
  })
})
