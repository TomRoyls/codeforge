import { describe, expect, it } from 'vitest'

import {
  measurePath,
  measureMaze,
  measureDeadEnd,
  measureThread,
  measureMinotaur,
  measureExit,
  buildLabyrinthPathResult,
  classifyCondition,
  classifyArchitectGrade,
  classifyWingType,
  classifyWingCondition,
  analyzeLabyrinthCell,
  generateRecommendations,
  countExports,
  countImports,
  countFunctions,
  countArrows,
  countClasses,
  countInterfaces,
  countTypeAliases,
  countComments,
  countJSDoc,
  countStrings,
  countAsync,
  countAwaits,
  countTryCatch,
  countThrows,
  countCatches,
  countFinallys,
  countIfs,
  countElses,
  countSwitches,
  countFors,
  countWhile,
  countNestedBlocks,
  countDeepNested,
  countTernaries,
  countLogicalAnd,
  countLogicalOr,
  countConsoleLog,
  countConsole,
  countTodos,
  countErrors,
  countReturns,
  countBreaks,
  countContinues,
  countDefaultParams,
  countSpreads,
  countDestructures,
  countGenerics,
  countEnums,
  countNamespaces,
  countAccessModifiers,
  countReadonly,
  countStatic,
  countDecorators,
  countCommentedCode,
  countAny,
  countNever,
  countYields,
  countPromises,
  countReexports,
  countDynamicImports,
  countAbstracts,
  countOverrides,
  countConstAssertions,
  countTypeGuards,
} from '../src/commands/labyrinth-path-helpers.js'

import {
  formatLabyrinthPathJson,
  formatLabyrinthPathTable,
  scoreColor,
  conditionColor,
  gradeColor,
  pathTypeColor,
  mazeDesignColor,
} from '../src/commands/labyrinth-path-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY = ''

const SIMPLE = 'const x = 1'

const RICH = `/** Documentation for foo */
export function foo(a: string): number {
  // calculate length
  return a.length
}
/** Documentation for bar */
export function bar(b: number): string { return String(b) }
export interface IFoo { a: string; b: number }
export interface IBar { c: boolean }
export type TResult = IFoo | IBar
type THelper = { x: number }
class MyClass {
  private x: number = 1
  protected y: string = 'hello'
  public z: boolean = true
  static w: number = 42
  readonly r: number = 10
}
try { foo('test') } catch (e) { throw new Error('fail') } finally {}
if (x) { if (y) { if (z) {} } }
const arr = [1, 2, 3]
const [first, ...rest] = arr
const obj = { a: 1, b: 2 }
const { a, b } = obj
function def(x = 10, y = 20) { return x + y }
async function af() { await Promise.resolve(1) }
const f = () => 1
console.log('debug')
// TODO: fix this later
`

// ─── Counter Tests ─────────────────────────────────────────────────────────

describe('labyrinth-path counters', () => {
  it('countExports counts exports', () => {
    expect(countExports('export function foo() {}')).toBe(1)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports("import { foo } from 'bar'")).toBe(1)
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBeGreaterThanOrEqual(3)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(RICH)).toBeGreaterThanOrEqual(1)
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countClasses counts classes', () => {
    expect(countClasses(RICH)).toBeGreaterThanOrEqual(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(RICH)).toBeGreaterThanOrEqual(2)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(RICH)).toBeGreaterThanOrEqual(2)
    expect(countJSDoc(EMPTY)).toBe(0)
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

  it('countIfs counts if statements', () => {
    expect(countIfs(RICH)).toBeGreaterThanOrEqual(2)
    expect(countIfs(EMPTY)).toBe(0)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(RICH)).toBeGreaterThanOrEqual(1)
    expect(countNestedBlocks(EMPTY)).toBe(0)
  })

  it('countDeepNested counts triple-nested blocks', () => {
    expect(countDeepNested(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDeepNested(EMPTY)).toBe(0)
  })

  it('countConsoleLog counts console.log', () => {
    expect(countConsoleLog(RICH)).toBeGreaterThanOrEqual(1)
    expect(countConsoleLog(EMPTY)).toBe(0)
  })

  it('countConsole counts all console calls', () => {
    expect(countConsole(RICH)).toBeGreaterThanOrEqual(1)
    expect(countConsole(EMPTY)).toBe(0)
  })

  it('countTodos counts TODO/FIXME/HACK comments', () => {
    expect(countTodos(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode('// function foo() {}')).toBeGreaterThanOrEqual(1)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countAny counts any keyword', () => {
    expect(countAny('const x: any = 1')).toBeGreaterThanOrEqual(1)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countNever counts never keyword', () => {
    expect(countNever('type X = never')).toBeGreaterThanOrEqual(1)
    expect(countNever(EMPTY)).toBe(0)
  })

  it('countErrors counts new Error', () => {
    expect(countErrors(RICH)).toBeGreaterThanOrEqual(1)
    expect(countErrors(EMPTY)).toBe(0)
  })

  it('countReturns counts return statements', () => {
    expect(countReturns(RICH)).toBeGreaterThanOrEqual(2)
    expect(countReturns(EMPTY)).toBe(0)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBeGreaterThanOrEqual(1)
    expect(countSpreads(EMPTY)).toBe(0)
  })

  it('countDestructures counts destructuring', () => {
    expect(countDestructures(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDestructures(EMPTY)).toBe(0)
  })

  it('countDefaultParams counts default parameters', () => {
    expect(countDefaultParams(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDefaultParams(EMPTY)).toBe(0)
  })

  it('countReadonly counts readonly keywords', () => {
    expect(countReadonly(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBeGreaterThanOrEqual(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countAccessModifiers counts private/protected/public', () => {
    expect(countAccessModifiers(RICH)).toBeGreaterThanOrEqual(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countGenerics counts generic parameters', () => {
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBeGreaterThanOrEqual(1)
    expect(countPromises(EMPTY)).toBe(0)
  })

  it('countElses counts else keywords', () => {
    expect(countElses(EMPTY)).toBe(0)
  })

  it('countSwitches counts switch statements', () => {
    expect(countSwitches(EMPTY)).toBe(0)
  })

  it('countFors counts for loops', () => {
    expect(countFors(EMPTY)).toBe(0)
  })

  it('countWhile counts while loops', () => {
    expect(countWhile(EMPTY)).toBe(0)
  })

  it('countTernaries counts ternary expressions', () => {
    expect(countTernaries(EMPTY)).toBe(0)
  })

  it('countBreaks counts break statements', () => {
    expect(countBreaks(EMPTY)).toBe(0)
  })

  it('countContinues counts continue statements', () => {
    expect(countContinues(EMPTY)).toBe(0)
  })

  it('countYields counts yield keywords', () => {
    expect(countYields(EMPTY)).toBe(0)
  })

  it('countEnums counts enum declarations', () => {
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countNamespaces counts namespace declarations', () => {
    expect(countNamespaces(EMPTY)).toBe(0)
  })

  it('countDecorators counts decorators', () => {
    expect(countDecorators(EMPTY)).toBe(0)
  })

  it('countReexports counts re-exports', () => {
    expect(countReexports(EMPTY)).toBe(0)
  })

  it('countDynamicImports counts dynamic imports', () => {
    expect(countDynamicImports(EMPTY)).toBe(0)
  })

  it('countAbstracts counts abstract keywords', () => {
    expect(countAbstracts(EMPTY)).toBe(0)
  })

  it('countOverrides counts override keywords', () => {
    expect(countOverrides(EMPTY)).toBe(0)
  })

  it('countConstAssertions counts as const', () => {
    expect(countConstAssertions(EMPTY)).toBe(0)
  })

  it('countTypeGuards counts typeof/instanceof', () => {
    expect(countTypeGuards(EMPTY)).toBe(0)
  })
})

// ─── MeasurePath Tests ─────────────────────────────────────────────────────

describe('measurePath', () => {
  it('returns right-angle for empty content', () => {
    const m = measurePath(EMPTY)
    expect(m.clarity).toBe(50)
    expect(m.type).toBe('right-angle')
    expect(m.isClear).toBe(false)
    expect(m.hasSmoothFloor).toBe(true)
    expect(m.hasNoObstacles).toBe(true)
    expect(m.hasHandrails).toBe(false)
    expect(m.hasSignage).toBe(false)
    expect(m.obstacleCount).toBe(0)
  })

  it('returns right-angle for RICH content', () => {
    const m = measurePath(RICH)
    expect(m.clarity).toBe(59)
    expect(m.type).toBe('right-angle')
    expect(m.hasProperLighting).toBe(true)
    expect(m.hasHandrails).toBe(true)
    expect(m.hasSignage).toBe(true)
    expect(m.hasFloorPlan).toBe(true)
    expect(m.hasEmergencyExit).toBe(true)
    expect(m.hasShortcut).toBe(true)
    expect(m.obstacleCount).toBe(3)
  })
})

// ─── MeasureMaze Tests ─────────────────────────────────────────────────────

describe('measureMaze', () => {
  it('returns classical for empty content', () => {
    const m = measureMaze(EMPTY)
    expect(m.complexity).toBe(5)
    expect(m.design).toBe('classical')
    expect(m.isNavigable).toBe(true)
    expect(m.hasNoTraps).toBe(true)
    expect(m.trapCount).toBe(0)
  })

  it('returns medieval for RICH content', () => {
    const m = measureMaze(RICH)
    expect(m.complexity).toBe(17)
    expect(m.design).toBe('medieval')
    expect(m.hasProperWalls).toBe(true)
    expect(m.hasConsistentRules).toBe(true)
    expect(m.hasLogicalLayout).toBe(true)
    expect(m.hasNoTraps).toBe(false)
    expect(m.trapCount).toBe(1)
    expect(m.hiddenPassageCount).toBe(1)
  })
})

// ─── MeasureDeadEnd Tests ──────────────────────────────────────────────────

describe('measureDeadEnd', () => {
  it('returns none for empty content', () => {
    const m = measureDeadEnd(EMPTY)
    expect(m.detection).toBe(90)
    expect(m.type).toBe('none')
    expect(m.hasNoDeadEnds).toBe(true)
    expect(m.hasDeadCode).toBe(false)
    expect(m.hasCommentedCode).toBe(false)
    expect(m.deadCodeCount).toBe(0)
    expect(m.orphanImportCount).toBe(0)
  })

  it('returns none for RICH content', () => {
    const m = measureDeadEnd(RICH)
    expect(m.detection).toBe(90)
    expect(m.type).toBe('none')
    expect(m.hasNoDeadEnds).toBe(true)
    expect(m.deadCodeCount).toBe(0)
  })

  it('detects commented code', () => {
    const m = measureDeadEnd('// function foo() {}')
    expect(m.hasCommentedCode).toBe(true)
    expect(m.deadCodeCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── MeasureThread Tests ───────────────────────────────────────────────────

describe('measureThread', () => {
  it('returns severed for empty content', () => {
    const m = measureThread(EMPTY)
    expect(m.guidance).toBe(5)
    expect(m.type).toBe('severed')
    expect(m.hasGoldenThread).toBe(false)
    expect(m.hasNoSeveredThread).toBe(true)
    expect(m.severedCount).toBe(0)
    expect(m.warningCount).toBe(0)
  })

  it('returns trail-of-crumbs for RICH content', () => {
    const m = measureThread(RICH)
    expect(m.guidance).toBe(32)
    expect(m.type).toBe('trail-of-crumbs')
    expect(m.hasAriadnesThread).toBe(true)
    expect(m.hasTrailMarking).toBe(true)
    expect(m.hasBreadcrumbTrail).toBe(true)
    expect(m.hasMap).toBe(true)
    expect(m.hasCompass).toBe(true)
    expect(m.hasMinotaurWarning).toBe(true)
    expect(m.severedCount).toBe(0)
    expect(m.warningCount).toBe(2)
  })
})

// ─── MeasureMinotaur Tests ─────────────────────────────────────────────────

describe('measureMinotaur', () => {
  it('returns skeleton for empty content', () => {
    const m = measureMinotaur(EMPTY)
    expect(m.danger).toBe(5)
    expect(m.type).toBe('skeleton')
    expect(m.isSafe).toBe(true)
    expect(m.hasKnownDangers).toBe(false)
    expect(m.dangerCount).toBe(0)
    expect(m.lairCount).toBe(0)
  })

  it('returns ancient for RICH content', () => {
    const m = measureMinotaur(RICH)
    expect(m.danger).toBe(13)
    expect(m.type).toBe('ancient')
    expect(m.isSafe).toBe(true)
    expect(m.hasKnownDangers).toBe(true)
    expect(m.hasGuardian).toBe(true)
    expect(m.hasShield).toBe(true)
    expect(m.hasWeapon).toBe(true)
    expect(m.hasEscapeRoute).toBe(true)
    expect(m.hasThesesShip).toBe(true)
    expect(m.dangerCount).toBe(2)
    expect(m.lairCount).toBe(1)
  })
})

// ─── MeasureExit Tests ─────────────────────────────────────────────────────

describe('measureExit', () => {
  it('returns tunnel for empty content', () => {
    const m = measureExit(EMPTY)
    expect(m.strategy).toBe(50)
    expect(m.type).toBe('tunnel')
    expect(m.hasClearExit).toBe(false)
    expect(m.hasNoLockIn).toBe(true)
    expect(m.lockInCount).toBe(0)
  })

  it('returns secret-door for RICH content', () => {
    const m = measureExit(RICH)
    expect(m.strategy).toBe(72)
    expect(m.type).toBe('secret-door')
    expect(m.hasClearExit).toBe(true)
    expect(m.hasEmergencyExit).toBe(true)
    expect(m.hasMultipleExits).toBe(true)
    expect(m.hasGradualExit).toBe(true)
    expect(m.hasBacktracking).toBe(true)
    expect(m.hasSlack).toBe(true)
    expect(m.hasNoLockIn).toBe(false)
    expect(m.lockInCount).toBe(1)
  })
})

// ─── Classification Tests ──────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies garden-maze for >= 80', () => {
    expect(classifyCondition(85)).toBe('garden-maze')
  })
  it('classifies navigable-labyrinth for >= 60', () => {
    expect(classifyCondition(65)).toBe('navigable-labyrinth')
  })
  it('classifies challenging-puzzle for >= 40', () => {
    expect(classifyCondition(45)).toBe('challenging-puzzle')
  })
  it('classifies confusing-maze for >= 20', () => {
    expect(classifyCondition(25)).toBe('confusing-maze')
  })
  it('classifies minotaur-lair for >= 10', () => {
    expect(classifyCondition(12)).toBe('minotaur-lair')
  })
  it('classifies inescapable-trap for < 10', () => {
    expect(classifyCondition(5)).toBe('inescapable-trap')
  })
})

describe('classifyArchitectGrade', () => {
  it('returns daedalus for >= 85', () => {
    expect(classifyArchitectGrade(90)).toBe('daedalus')
  })
  it('returns master-architect for >= 70', () => {
    expect(classifyArchitectGrade(75)).toBe('master-architect')
  })
  it('returns labyrinth-designer for >= 55', () => {
    expect(classifyArchitectGrade(60)).toBe('labyrinth-designer')
  })
  it('returns maze-builder for >= 40', () => {
    expect(classifyArchitectGrade(45)).toBe('maze-builder')
  })
  it('returns novice for >= 25', () => {
    expect(classifyArchitectGrade(30)).toBe('novice')
  })
  it('returns theseus for < 25', () => {
    expect(classifyArchitectGrade(10)).toBe('theseus')
  })
})

describe('classifyWingType', () => {
  it('returns pit for empty cells', () => {
    expect(classifyWingType([])).toBe('pit')
  })
})

describe('classifyWingCondition', () => {
  it('returns collapsed for 0', () => {
    expect(classifyWingCondition(0)).toBe('collapsed')
  })
  it('returns master-architect for 85', () => {
    expect(classifyWingCondition(85)).toBe('master-architect')
  })
})

// ─── AnalyzeLabyrinthCell Tests ─────────────────────────────────────────────

describe('analyzeLabyrinthCell', () => {
  it('returns correct cell for RICH content', () => {
    const cell = analyzeLabyrinthCell(RICH, 'rich.ts')
    expect(cell.file).toBe('rich.ts')
    expect(cell.pathClarity).toBe(59)
    expect(cell.mazeComplexity).toBe(17)
    expect(cell.deadEndDetection).toBe(90)
    expect(cell.threadGuidance).toBe(32)
    expect(cell.minotaurDanger).toBe(13)
    expect(cell.exitStrategy).toBe(72)
    expect(cell.qualityScore).toBe(71)
    expect(cell.condition).toBe('navigable-labyrinth')
  })

  it('returns correct cell for empty content', () => {
    const cell = analyzeLabyrinthCell(EMPTY, 'empty.ts')
    expect(cell.pathClarity).toBe(50)
    expect(cell.mazeComplexity).toBe(5)
    expect(cell.deadEndDetection).toBe(90)
    expect(cell.threadGuidance).toBe(5)
    expect(cell.minotaurDanger).toBe(5)
    expect(cell.exitStrategy).toBe(50)
    expect(cell.qualityScore).toBe(64)
    expect(cell.condition).toBe('navigable-labyrinth')
  })
})

// ─── BuildLabyrinthPathResult Tests ────────────────────────────────────────

describe('buildLabyrinthPathResult', () => {
  it('handles empty file list', () => {
    const result = buildLabyrinthPathResult([], [])
    expect(result.cells).toHaveLength(0)
    expect(result.wings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallNavigability).toBe(0)
    expect(result.labyrinth.isNavigable).toBe(false)
    expect(result.stats.architectGrade).toBe('theseus')
  })

  it('computes correct stats for 3-file mix', () => {
    const result = buildLabyrinthPathResult(['a.ts', 'b.ts', 'c.ts'], [RICH, SIMPLE, EMPTY])
    expect(result.cells).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.labyrinth.overallNavigability).toBe(66)
    expect(result.labyrinth.isNavigable).toBe(true)
    expect(result.stats.architectGrade).toBe('labyrinth-designer')
    expect(result.stats.avgPathClarity).toBe(53)
    expect(result.stats.avgMazeComplexity).toBe(9)
    expect(result.stats.avgDeadEndDetection).toBe(90)
    expect(result.stats.avgThreadGuidance).toBe(14)
    expect(result.stats.avgMinotaurDanger).toBe(8)
    expect(result.stats.avgExitStrategy).toBe(58)
    expect(result.stats.gardenMazeCount).toBe(0)
    expect(result.stats.navigableLabyrinthCount).toBe(3)
  })

  it('groups files into wings by directory', () => {
    const result = buildLabyrinthPathResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], [RICH, SIMPLE, EMPTY])
    expect(result.wings).toHaveLength(2)
    expect(result.wings.some(w => w.directory === 'src')).toBe(true)
    expect(result.wings.some(w => w.directory === 'test')).toBe(true)
  })

  it('populates best/worst stats', () => {
    const result = buildLabyrinthPathResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stats.bestCell).toBe('a.ts')
    expect(result.stats.clearestPath).toBe('a.ts')
    expect(result.stats.safest).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildLabyrinthPathResult(['a.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('generates positive recommendation for well-designed code', () => {
    const result = buildLabyrinthPathResult(['a.ts'], [RICH])
    expect(result.recommendations).toContain('Labyrinth is well-designed — maintain current architecture and documentation standards')
  })
})

// ─── GenerateRecommendations Tests ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns well-designed message when no issues', () => {
    const cells = [analyzeLabyrinthCell(RICH, 'a.ts')]
    const recs = generateRecommendations(cells, [], { avgPathClarity: 80, avgMazeComplexity: 10, avgExitStrategy: 80, isNavigable: true, overallNavigability: 85 }, {
      totalFiles: 1, totalWings: 0, avgPathClarity: 80, avgMazeComplexity: 10, avgDeadEndDetection: 90,
      avgThreadGuidance: 80, avgMinotaurDanger: 5, avgExitStrategy: 80, gardenMazeCount: 1,
      navigableLabyrinthCount: 0, challengingPuzzleCount: 0, confusingMazeCount: 0, minotaurLairCount: 0,
      inescapableTrapCount: 0, isClearCount: 1, hasNoObstaclesCount: 1, isNavigableCount: 1,
      hasNoDeadEndsCount: 1, hasDeadCodeCount: 0, hasGoldenThreadCount: 1, hasNoSeveredThreadCount: 1,
      isSafeCount: 1, hasKnownDangersCount: 0, hasClearExitCount: 1, hasNoLockInCount: 1,
      overallNavigability: 85, architectGrade: 'daedalus' as const, bestCell: 'a.ts',
      clearestPath: 'a.ts', simplestMaze: 'a.ts', bestGuided: 'a.ts', safest: 'a.ts',
    })
    expect(recs).toContain('Labyrinth is well-designed — maintain current architecture and documentation standards')
  })
})

// ─── Format Helper Tests ───────────────────────────────────────────────────

describe('format helpers', () => {
  const result = buildLabyrinthPathResult(['a.ts'], [RICH])

  it('formatLabyrinthPathJson returns valid JSON', () => {
    const json = formatLabyrinthPathJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatLabyrinthPathTable returns non-empty string', () => {
    const table = formatLabyrinthPathTable(result, false)
    expect(table).toContain('Labyrinth Path Analysis')
    expect(table).toContain('Overall Navigability')
  })

  it('formatLabyrinthPathTable with verbose shows per-cell', () => {
    const table = formatLabyrinthPathTable(result, true)
    expect(table).toContain('a.ts')
    expect(table).toContain('Per-Cell Breakdown')
  })

  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    for (const c of ['garden-maze', 'navigable-labyrinth', 'challenging-puzzle', 'confusing-maze', 'minotaur-lair', 'inescapable-trap', 'unknown']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('gradeColor returns string for all grades', () => {
    for (const g of ['daedalus', 'master-architect', 'labyrinth-designer', 'maze-builder', 'novice', 'theseus', 'unknown']) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })

  it('pathTypeColor returns string for all types', () => {
    for (const t of ['straight-corridor', 'gentle-curve', 'right-angle', 'spiral', 'zigzag', 'tangle', 'unknown']) {
      expect(typeof pathTypeColor(t)).toBe('string')
    }
  })

  it('mazeDesignColor returns string for all designs', () => {
    for (const d of ['classical', 'medieval', 'hedge', 'crystal', 'mirror', 'chaos', 'unknown']) {
      expect(typeof mazeDesignColor(d)).toBe('string')
    }
  })
})
