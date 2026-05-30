// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const COMMENT_REGEX = /\/\/.*$/gm
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
const STRING_REGEX = /(["'`])(?:(?!\1|\\).|\\.)*\1/g
const TEMPLATE_REGEX = /`[^`]*`/g
const ASYNC_REGEX = /\basync\s+/g
const AWAIT_REGEX = /\bawait\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const THROW_REGEX = /\bthrow\b/g
const CATCH_REGEX = /\bcatch\b/g
const FINALLY_REGEX = /\bfinally\b/g
const IF_REGEX = /\bif\s*\(/g
const ELSE_REGEX = /\belse\b/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const FOR_REGEX = /\bfor\s*[\(;]/g
const WHILE_REGEX = /\bwhile\s*\(/g
const NESTED_BLOCK_REGEX = /\{[^{}]*\{[^{}]*\}/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const TERNARY_REGEX = /\?[^:]+:/g
const LOGICAL_AND_REGEX = /&&/g
const LOGICAL_OR_REGEX = /\|\|/g
const CONSOLE_LOG_REGEX = /\bconsole\.log\b/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const ERROR_REGEX = /\bnew\s+Error\b/g
const RETURN_REGEX = /\breturn\b/g
const BREAK_REGEX = /\bbreak\b/g
const CONTINUE_REGEX = /\bcontinue\b/g
const DEFAULT_PARAM_REGEX = /\w+\s*=\s*[^,)]+/g
const SPREAD_REGEX = /\.\.\./g
const DESTRUCTURE_REGEX = /\{[^{}]*\}\s*=/g
const GENERICS_REGEX = /<[^>]+>/g
const DECORATOR_REGEX = /@\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const NAMESPACE_REGEX = /\bnamespace\s+\w+/g
const ABSTRACT_REGEX = /\babstract\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const READONLY_REGEX = /\breadonly\b/g
const OVERRIDE_REGEX = /\boverride\b/g
const PROMISE_REGEX = /\bPromise\b/g
const TYPE_GUARD_REGEX = /\b(?:typeof|instanceof)\b/g
const CONST_ASSERTION_REGEX = /\bas\s+const\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const ANY_REGEX = /\bany\b/g
const NEVER_REGEX = /\bnever\b/g
const ASSERT_REGEX = /\bassert\b/g
const YIELD_REGEX = /\byield\b/g
const REGEX_LITERAL_REGEX = /\/[^/\n]+\//g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface PathMeasure {
  clarity: number
  type: 'straight-corridor' | 'gentle-curve' | 'right-angle' | 'spiral' | 'zigzag' | 'tangle'
  isClear: boolean
  hasProperLighting: boolean
  hasSmoothFloor: boolean
  hasNoObstacles: boolean
  hasHandrails: boolean
  hasSignage: boolean
  hasFloorPlan: boolean
  hasEmergencyExit: boolean
  hasShortcut: boolean
  obstacleCount: number
}

export interface MazeMeasure {
  complexity: number
  design: 'classical' | 'medieval' | 'hedge' | 'crystal' | 'mirror' | 'chaos'
  isNavigable: boolean
  hasProperWalls: boolean
  hasConsistentRules: boolean
  hasLogicalLayout: boolean
  hasNoTraps: boolean
  hasNoIllusions: boolean
  hasSolutionPath: boolean
  hasHiddenPassages: boolean
  hasCollapsingWalls: boolean
  hasShiftingMaze: boolean
  trapCount: number
  hiddenPassageCount: number
}

export interface DeadEndMeasure {
  detection: number
  type: 'cul-de-sac' | 'blind-alley' | 'loop' | 'trap' | 'pocket' | 'none'
  hasNoDeadEnds: boolean
  hasIsolatedSections: boolean
  hasUnusedReturns: boolean
  hasUnreachableCatch: boolean
  hasDeadCode: boolean
  hasCommentedCode: boolean
  hasUnvisitedBranches: boolean
  hasOrphanImports: boolean
  hasStaleExports: boolean
  deadCodeCount: number
  orphanImportCount: number
}

export interface ThreadMeasure {
  guidance: number
  type: 'golden-thread' | 'ribbon' | 'string' | 'trail-of-crumbs' | 'invisible' | 'severed'
  hasGoldenThread: boolean
  hasAriadnesThread: boolean
  hasTrailMarking: boolean
  hasBreadcrumbTrail: boolean
  hasMap: boolean
  hasCompass: boolean
  hasGuideposts: boolean
  hasLandmarks: boolean
  hasRestPoints: boolean
  hasNoSeveredThread: boolean
  hasMinotaurWarning: boolean
  severedCount: number
  warningCount: number
}

export interface MinotaurMeasure {
  danger: number
  type: 'sleeping' | 'prowling' | 'hunting' | 'dormant' | 'ancient' | 'skeleton'
  isSafe: boolean
  hasKnownDangers: boolean
  hasHiddenDangers: boolean
  hasMinotaurLair: boolean
  hasMonster: boolean
  hasGuardian: boolean
  hasShield: boolean
  hasWeapon: boolean
  hasEscapeRoute: boolean
  hasSacredThread: boolean
  hasThesesShip: boolean
  dangerCount: number
  lairCount: number
}

export interface ExitMeasure {
  strategy: number
  type: 'main-entrance' | 'secret-door' | 'tunnel' | 'rope-ladder' | 'leap-of-faith' | 'no-exit'
  hasClearExit: boolean
  hasEmergencyExit: boolean
  hasMultipleExits: boolean
  hasGradualExit: boolean
  hasCleanExit: boolean
  hasExitStrategy: boolean
  hasNoLockIn: boolean
  hasBacktracking: boolean
  hasSlack: boolean
  hasDaylight: boolean
  lockInCount: number
}

export interface LabyrinthCell {
  file: string
  pathClarity: number
  mazeComplexity: number
  deadEndDetection: number
  threadGuidance: number
  minotaurDanger: number
  exitStrategy: number
  path: PathMeasure
  maze: MazeMeasure
  deadEnd: DeadEndMeasure
  thread: ThreadMeasure
  minotaur: MinotaurMeasure
  exit: ExitMeasure
  condition: 'garden-maze' | 'navigable-labyrinth' | 'challenging-puzzle' | 'confusing-maze' | 'minotaur-lair' | 'inescapable-trap'
  qualityScore: number
}

export interface LabyrinthWing {
  directory: string
  cells: LabyrinthCell[]
  avgPathClarity: number
  avgMazeComplexity: number
  avgExitStrategy: number
  gardenMazeCount: number
  inescapableTrapCount: number
  clearPathCount: number
  safeCount: number
  wingType: 'palace-garden' | 'castle-labyrinth' | 'temple-maze' | 'cave-system' | 'mine-shaft' | 'pit'
  condition: 'master-architect' | 'labyrinth-designer' | 'maze-builder' | 'hole-digger' | 'trap-layer' | 'collapsed'
}

export interface LabyrinthPathResult {
  cells: LabyrinthCell[]
  wings: LabyrinthWing[]
  labyrinth: {
    avgPathClarity: number
    avgMazeComplexity: number
    avgExitStrategy: number
    isNavigable: boolean
    overallNavigability: number
  }
  stats: {
    totalFiles: number
    totalWings: number
    avgPathClarity: number
    avgMazeComplexity: number
    avgDeadEndDetection: number
    avgThreadGuidance: number
    avgMinotaurDanger: number
    avgExitStrategy: number
    gardenMazeCount: number
    navigableLabyrinthCount: number
    challengingPuzzleCount: number
    confusingMazeCount: number
    minotaurLairCount: number
    inescapableTrapCount: number
    isClearCount: number
    hasNoObstaclesCount: number
    isNavigableCount: number
    hasNoDeadEndsCount: number
    hasDeadCodeCount: number
    hasGoldenThreadCount: number
    hasNoSeveredThreadCount: number
    isSafeCount: number
    hasKnownDangersCount: number
    hasClearExitCount: number
    hasNoLockInCount: number
    overallNavigability: number
    architectGrade: 'daedalus' | 'master-architect' | 'labyrinth-designer' | 'maze-builder' | 'novice' | 'theseus'
    bestCell: string
    clearestPath: string
    simplestMaze: string
    bestGuided: string
    safest: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

/** @example countExports('export function foo() {}') returns 1 */
export function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

/** @example countImports("import { foo } from 'bar'") returns 1 */
export function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX)
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return countMatches(content, ARROW_REGEX)
}

/** @example countClasses('class Foo {}') returns 1 */
export function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

/** @example countTypeAliases('type Foo = string') returns 1 */
export function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

/** @example countComments('// hello') returns 1 */
export function countComments(content: string): number {
  return countMatches(content, COMMENT_REGEX) + countMatches(content, BLOCK_COMMENT_REGEX)
}

/** @example countJSDoc('/** docs *​/') returns 1 */
export function countJSDoc(content: string): number {
  return countMatches(content, JSDOC_REGEX)
}

/** @example countStrings("'hello'") returns 1 */
export function countStrings(content: string): number {
  return countMatches(content, STRING_REGEX) + countMatches(content, TEMPLATE_REGEX)
}

/** @example countAsync('async function foo() {}') returns 1 */
export function countAsync(content: string): number {
  return countMatches(content, ASYNC_REGEX)
}

/** @example countAwaits('await x') returns 1 */
export function countAwaits(content: string): number {
  return countMatches(content, AWAIT_REGEX)
}

/** @example countTryCatch('try {') returns 1 */
export function countTryCatch(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

/** @example countThrows('throw new Error()') returns 1 */
export function countThrows(content: string): number {
  return countMatches(content, THROW_REGEX)
}

/** @example countCatches('catch') returns 1 */
export function countCatches(content: string): number {
  return countMatches(content, CATCH_REGEX)
}

/** @example countFinallys('finally') returns 1 */
export function countFinallys(content: string): number {
  return countMatches(content, FINALLY_REGEX)
}

/** @example countIfs('if (x)') returns 1 */
export function countIfs(content: string): number {
  return countMatches(content, IF_REGEX)
}

/** @example countElses('else') returns 1 */
export function countElses(content: string): number {
  return countMatches(content, ELSE_REGEX)
}

/** @example countSwitches('switch (x)') returns 1 */
export function countSwitches(content: string): number {
  return countMatches(content, SWITCH_REGEX)
}

/** @example countFors('for (let i)') returns 1 */
export function countFors(content: string): number {
  return countMatches(content, FOR_REGEX)
}

/** @example countWhile('while (x)') returns 1 */
export function countWhile(content: string): number {
  return countMatches(content, WHILE_REGEX)
}

/** @example countNestedBlocks('if { if {} }') returns 1 */
export function countNestedBlocks(content: string): number {
  return countMatches(content, NESTED_BLOCK_REGEX)
}

/** @example countDeepNested('if { if { if } }') returns 1 */
export function countDeepNested(content: string): number {
  return countMatches(content, DEEP_NESTED_REGEX)
}

/** @example countTernaries('x ? 1 : 0') returns 1 */
export function countTernaries(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

/** @example countLogicalAnd('x && y') returns 1 */
export function countLogicalAnd(content: string): number {
  return countMatches(content, LOGICAL_AND_REGEX)
}

/** @example countLogicalOr('x || y') returns 1 */
export function countLogicalOr(content: string): number {
  return countMatches(content, LOGICAL_OR_REGEX)
}

/** @example countConsoleLog('console.log(x)') returns 1 */
export function countConsoleLog(content: string): number {
  return countMatches(content, CONSOLE_LOG_REGEX)
}

/** @example countConsole('console.warn(x)') returns 1 */
export function countConsole(content: string): number {
  return countMatches(content, CONSOLE_REGEX)
}

/** @example countTodos('// TODO: fix') returns 1 */
export function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX)
}

/** @example countErrors('new Error()') returns 1 */
export function countErrors(content: string): number {
  return countMatches(content, ERROR_REGEX)
}

/** @example countReturns('return x') returns 1 */
export function countReturns(content: string): number {
  return countMatches(content, RETURN_REGEX)
}

/** @example countBreaks('break') returns 1 */
export function countBreaks(content: string): number {
  return countMatches(content, BREAK_REGEX)
}

/** @example countContinues('continue') returns 1 */
export function countContinues(content: string): number {
  return countMatches(content, CONTINUE_REGEX)
}

/** @example countDefaultParams('function f(x = 1)') returns 1 */
export function countDefaultParams(content: string): number {
  return countMatches(content, DEFAULT_PARAM_REGEX)
}

/** @example countSpreads('...args') returns 1 */
export function countSpreads(content: string): number {
  return countMatches(content, SPREAD_REGEX)
}

/** @example countDestructures('{ a, b } = obj') returns 1 */
export function countDestructures(content: string): number {
  return countMatches(content, DESTRUCTURE_REGEX)
}

/** @example countGenerics('function foo<T>() {}') returns 1 */
export function countGenerics(content: string): number {
  return countMatches(content, GENERICS_REGEX)
}

/** @example countEnums('enum Foo { A }') returns 1 */
export function countEnums(content: string): number {
  return countMatches(content, ENUM_REGEX)
}

/** @example countNamespaces('namespace Foo {}') returns 1 */
export function countNamespaces(content: string): number {
  return countMatches(content, NAMESPACE_REGEX)
}

/** @example countAccessModifiers('private x') returns 1 */
export function countAccessModifiers(content: string): number {
  return countMatches(content, PRIVATE_REGEX) + countMatches(content, PROTECTED_REGEX) + countMatches(content, PUBLIC_REGEX)
}

/** @example countReadonly('readonly x') returns 1 */
export function countReadonly(content: string): number {
  return countMatches(content, READONLY_REGEX)
}

/** @example countStatic('static x') returns 1 */
export function countStatic(content: string): number {
  return countMatches(content, STATIC_REGEX)
}

/** @example countDecorators('@Injectable()') returns 1 */
export function countDecorators(content: string): number {
  return countMatches(content, DECORATOR_REGEX)
}

/** @example countCommentedCode('// function foo()') returns 1 */
export function countCommentedCode(content: string): number {
  return countMatches(content, COMMENTED_CODE_REGEX)
}

/** @example countAny('any') returns 1 */
export function countAny(content: string): number {
  return countMatches(content, ANY_REGEX)
}

/** @example countNever('never') returns 1 */
export function countNever(content: string): number {
  return countMatches(content, NEVER_REGEX)
}

/** @example countYields('yield x') returns 1 */
export function countYields(content: string): number {
  return countMatches(content, YIELD_REGEX)
}

/** @example countPromises('Promise<string>') returns 1 */
export function countPromises(content: string): number {
  return countMatches(content, PROMISE_REGEX)
}

/** @example countReexports("export { foo } from 'bar'") returns 1 */
export function countReexports(content: string): number {
  return countMatches(content, REEXPORT_REGEX)
}

/** @example countDynamicImports("import('foo')") returns 1 */
export function countDynamicImports(content: string): number {
  return countMatches(content, DYNAMIC_IMPORT_REGEX)
}

/** @example countAbstracts('abstract class Foo') returns 1 */
export function countAbstracts(content: string): number {
  return countMatches(content, ABSTRACT_REGEX)
}

/** @example countOverrides('override foo()') returns 1 */
export function countOverrides(content: string): number {
  return countMatches(content, OVERRIDE_REGEX)
}

/** @example countConstAssertions('x as const') returns 1 */
export function countConstAssertions(content: string): number {
  return countMatches(content, CONST_ASSERTION_REGEX)
}

/** @example countTypeGuards('typeof x') returns 1 */
export function countTypeGuards(content: string): number {
  return countMatches(content, TYPE_GUARD_REGEX)
}

// ─── Path Measure ───────────────────────────────────────────────────────────

/** @example measurePath('function foo() {}') returns PathMeasure */
export function measurePath(content: string): PathMeasure {
  const commentCount = countComments(content)
  const jsdocCount = countJSDoc(content)
  const arrowCount = countArrows(content)
  const returnCount = countReturns(content)
  const tryCatchCount = countTryCatch(content)
  const catchCount = countCatches(content)
  const finallyCount = countFinallys(content)
  const throwCount = countThrows(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)
  const ternaryCount = countTernaries(content)
  const lineCount = content.split('\n').length

  const obstacleCount = nestedCount + deepNestedCount * 2 + ternaryCount

  let clarity = 50
  clarity += Math.min(Math.round(commentCount * 0.5), 10)
  clarity += Math.min(jsdocCount * 2, 10)
  clarity -= Math.min(nestedCount * 2, 15)
  clarity -= Math.min(deepNestedCount * 3, 15)
  clarity -= Math.min(Math.round(ternaryCount * 0.5), 5)
  clarity -= Math.min(Math.round(Math.max(lineCount - 300, 0) * 0.05), 10)
  if (tryCatchCount > 0) clarity += 3
  if (jsdocCount > 0) clarity += 5
  clarity = Math.max(0, Math.min(Math.round(clarity), 100))

  const type = clarity >= 80 ? 'straight-corridor' : clarity >= 60 ? 'gentle-curve' : clarity >= 40 ? 'right-angle' : clarity >= 25 ? 'spiral' : clarity >= 10 ? 'zigzag' : 'tangle'

  return {
    clarity,
    type,
    isClear: clarity >= 60,
    hasProperLighting: commentCount > lineCount * 0.1,
    hasSmoothFloor: nestedCount < 5,
    hasNoObstacles: obstacleCount < 5,
    hasHandrails: tryCatchCount > 0 || catchCount > 0,
    hasSignage: commentCount > 0,
    hasFloorPlan: jsdocCount > 0,
    hasEmergencyExit: finallyCount > 0 || (tryCatchCount > 0 && throwCount > 0),
    hasShortcut: returnCount > 0 && arrowCount > 0,
    obstacleCount,
  }
}

// ─── Maze Measure ───────────────────────────────────────────────────────────

/** @example measureMaze('if (x) { if (y) {} }') returns MazeMeasure */
export function measureMaze(content: string): MazeMeasure {
  const ifCount = countIfs(content)
  const elseCount = countElses(content)
  const switchCount = countSwitches(content)
  const forCount = countFors(content)
  const whileCount = countWhile(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)
  const ternaryCount = countTernaries(content)
  const logicalAndCount = countLogicalAnd(content)
  const logicalOrCount = countLogicalOr(content)
  const breakCount = countBreaks(content)
  const continueCount = countContinues(content)
  const functionCount = countFunctions(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)

  const trapCount = anyCount + consoleCount + breakCount
  const hiddenPassageCount = deepNestedCount + continueCount

  let complexity = 5
  complexity += Math.min(ifCount * 2, 12)
  complexity += Math.min(elseCount, 5)
  complexity += Math.min(switchCount * 3, 10)
  complexity += Math.min(forCount * 2, 8)
  complexity += Math.min(whileCount * 2, 8)
  complexity += Math.min(nestedCount * 3, 15)
  complexity += Math.min(deepNestedCount * 5, 15)
  complexity += Math.min(ternaryCount, 5)
  complexity += Math.min(logicalAndCount, 5)
  complexity += Math.min(logicalOrCount, 5)
  complexity -= Math.min(Math.round(interfaceCount * 0.5), 5)
  complexity -= Math.min(Math.round(typeCount * 0.3), 3)
  complexity = Math.max(0, Math.min(Math.round(complexity), 100))

  const design = complexity >= 80 ? 'chaos' : complexity >= 60 ? 'mirror' : complexity >= 40 ? 'crystal' : complexity >= 20 ? 'hedge' : complexity >= 10 ? 'medieval' : 'classical'

  return {
    complexity,
    design,
    isNavigable: complexity < 70,
    hasProperWalls: classCount > 0 || interfaceCount > 0,
    hasConsistentRules: functionCount > 0 && (interfaceCount > 0 || typeCount > 0),
    hasLogicalLayout: functionCount > 0,
    hasNoTraps: anyCount === 0 && consoleCount === 0,
    hasNoIllusions: anyCount === 0,
    hasSolutionPath: functionCount > 0 || classCount > 0,
    hasHiddenPassages: hiddenPassageCount > 0,
    hasCollapsingWalls: deepNestedCount > 3,
    hasShiftingMaze: switchCount > 3 || anyCount > 0,
    trapCount,
    hiddenPassageCount,
  }
}

// ─── DeadEnd Measure ────────────────────────────────────────────────────────

/** @example measureDeadEnd('// function foo()') returns DeadEndMeasure */
export function measureDeadEnd(content: string): DeadEndMeasure {
  const commentedCodeCount = countCommentedCode(content)
  const importCount = countImports(content)
  const exportCount = countExports(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const anyCount = countAny(content)
  const neverCount = countNever(content)
  const catchCount = countCatches(content)
  const tryCatchCount = countTryCatch(content)
  const returnCount = countReturns(content)
  const ifCount = countIfs(content)
  const elseCount = countElses(content)

  const deadCodeCount = commentedCodeCount + anyCount + neverCount
  const orphanImportCount = Math.max(0, importCount - (functionCount + arrowCount + classCount + interfaceCount + typeCount))

  let detection = 90
  detection -= Math.min(commentedCodeCount * 3, 15)
  detection -= Math.min(orphanImportCount * 2, 10)
  detection -= Math.min(anyCount * 2, 10)
  detection -= Math.min(neverCount * 2, 5)
  detection -= Math.min(Math.max(importCount - exportCount * 2, 0), 10)
  detection = Math.max(0, Math.min(detection, 100))

  const type2 = detection >= 80 ? 'none' : detection >= 60 ? 'pocket' : detection >= 40 ? 'blind-alley' : detection >= 25 ? 'loop' : detection >= 10 ? 'cul-de-sac' : 'trap'

  return {
    detection,
    type: type2,
    hasNoDeadEnds: deadCodeCount === 0 && orphanImportCount === 0,
    hasIsolatedSections: commentedCodeCount > 2,
    hasUnusedReturns: returnCount > functionCount * 3,
    hasUnreachableCatch: catchCount > tryCatchCount,
    hasDeadCode: commentedCodeCount > 0,
    hasCommentedCode: commentedCodeCount > 0,
    hasUnvisitedBranches: elseCount > ifCount,
    hasOrphanImports: orphanImportCount > 0,
    hasStaleExports: exportCount > 0 && functionCount === 0 && classCount === 0,
    deadCodeCount,
    orphanImportCount,
  }
}

// ─── Thread Measure ─────────────────────────────────────────────────────────

/** @example measureThread('/** docs *​/') returns ThreadMeasure */
export function measureThread(content: string): ThreadMeasure {
  const jsdocCount = countJSDoc(content)
  const commentCount = countComments(content)
  const lineCount = content.split('\n').length
  const consoleCount = countConsole(content)
  const consoleLogCount = countConsoleLog(content)
  const todoCount = countTodos(content)
  const errorCount = countErrors(content)
  const tryCatchCount = countTryCatch(content)
  const functionCount = countFunctions(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)

  const severedCount = Math.max(0, functionCount + classCount - jsdocCount - commentCount)
  const warningCount = todoCount + errorCount

  let guidance = 5
  guidance += Math.min(jsdocCount * 5, 20)
  guidance += Math.min(Math.round(commentCount * 0.5), 15)
  guidance += Math.min(todoCount * 2, 5)
  guidance += Math.min(Math.round(consoleCount * 0.5), 5)
  guidance += Math.min(errorCount * 2, 5)
  guidance += Math.min(tryCatchCount * 2, 5)
  if (interfaceCount > 0) guidance += 5
  if (typeCount > 0) guidance += 3
  if (jsdocCount > functionCount) guidance += 5
  guidance = Math.max(0, Math.min(Math.round(guidance), 100))

  const type2 = guidance >= 80 ? 'golden-thread' : guidance >= 60 ? 'ribbon' : guidance >= 40 ? 'string' : guidance >= 25 ? 'trail-of-crumbs' : guidance >= 10 ? 'invisible' : 'severed'

  return {
    guidance,
    type: type2,
    hasGoldenThread: guidance >= 80,
    hasAriadnesThread: consoleCount > 0 || consoleLogCount > 0,
    hasTrailMarking: commentCount > 0,
    hasBreadcrumbTrail: consoleLogCount > 0,
    hasMap: jsdocCount > 0,
    hasCompass: interfaceCount > 0 || typeCount > 0,
    hasGuideposts: jsdocCount > 0,
    hasLandmarks: jsdocCount > 0 && functionCount > 0,
    hasRestPoints: commentCount > lineCount * 0.05,
    hasNoSeveredThread: severedCount === 0,
    hasMinotaurWarning: todoCount > 0 || errorCount > 0,
    severedCount,
    warningCount,
  }
}

// ─── Minotaur Measure ───────────────────────────────────────────────────────

/** @example measureMinotaur('throw new Error()') returns MinotaurMeasure */
export function measureMinotaur(content: string): MinotaurMeasure {
  const anyCount = countAny(content)
  const neverCount = countNever(content)
  const todoCount = countTodos(content)
  const throwCount = countThrows(content)
  const tryCatchCount = countTryCatch(content)
  const catchCount = countCatches(content)
  const finallyCount = countFinallys(content)
  const consoleCount = countConsole(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)
  const anyRegexCount = countMatches(content, REGEX_LITERAL_REGEX)
  const assertCount = countMatches(content, ASSERT_REGEX)

  const dangerCount = anyCount + neverCount + todoCount + deepNestedCount
  const lairCount = deepNestedCount + (anyCount > 0 ? 1 : 0)

  let danger = 5
  danger += Math.min(anyCount * 5, 15)
  danger += Math.min(neverCount * 3, 10)
  danger += Math.min(todoCount * 3, 10)
  danger += Math.min(deepNestedCount * 5, 15)
  danger += Math.min(nestedCount * 2, 10)
  danger += Math.min(anyRegexCount, 5)
  danger -= Math.min(tryCatchCount * 2, 5)
  danger -= Math.min(catchCount, 3)
  danger -= Math.min(finallyCount, 2)
  danger = Math.max(0, Math.min(danger, 100))

  const type2 = danger >= 80 ? 'hunting' : danger >= 60 ? 'prowling' : danger >= 40 ? 'sleeping' : danger >= 20 ? 'dormant' : danger >= 10 ? 'ancient' : 'skeleton'

  return {
    danger,
    type: type2,
    isSafe: danger < 30,
    hasKnownDangers: todoCount > 0,
    hasHiddenDangers: anyCount > 0 || neverCount > 0,
    hasMinotaurLair: deepNestedCount > 3,
    hasMonster: danger >= 60,
    hasGuardian: tryCatchCount > 0,
    hasShield: catchCount > 0,
    hasWeapon: consoleCount > 0 || assertCount > 0,
    hasEscapeRoute: finallyCount > 0,
    hasSacredThread: tryCatchCount > 0 && consoleCount > 0,
    hasThesesShip: finallyCount > 0 || (tryCatchCount > 0 && throwCount > 0),
    dangerCount,
    lairCount,
  }
}

// ─── Exit Measure ───────────────────────────────────────────────────────────

/** @example measureExit('export function foo() {}') returns ExitMeasure */
export function measureExit(content: string): ExitMeasure {
  const exportCount = countExports(content)
  const functionCount = countFunctions(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const spreadCount = countSpreads(content)
  const destructureCount = countDestructures(content)
  const defaultParamCount = countDefaultParams(content)
  const readonlyCount = countReadonly(content)
  const accessModCount = countAccessModifiers(content)
  const abstractCount = countAbstracts(content)
  const nestedCount = countNestedBlocks(content)
  const deepNestedCount = countDeepNested(content)
  const anyCount = countAny(content)

  const lockInCount = deepNestedCount + anyCount + Math.max(0, nestedCount - 5)

  let strategy = 50
  strategy += Math.min(Math.round(exportCount * 1.5), 8)
  strategy += Math.min(interfaceCount * 2, 8)
  strategy += Math.min(typeCount * 2, 8)
  strategy += Math.min(Math.round(readonlyCount * 1.5), 5)
  strategy += Math.min(Math.round(accessModCount * 0.5), 5)
  strategy += Math.min(abstractCount * 2, 5)
  strategy += Math.min(spreadCount, 3)
  strategy += Math.min(destructureCount, 3)
  strategy += Math.min(Math.round(defaultParamCount * 0.5), 3)
  strategy -= Math.min(deepNestedCount * 3, 15)
  strategy -= Math.min(anyCount * 3, 10)
  strategy -= Math.min(Math.max(nestedCount - 5, 0) * 2, 10)
  strategy = Math.max(0, Math.min(Math.round(strategy), 100))

  const type2 = strategy >= 80 ? 'main-entrance' : strategy >= 60 ? 'secret-door' : strategy >= 40 ? 'tunnel' : strategy >= 20 ? 'rope-ladder' : strategy >= 10 ? 'leap-of-faith' : 'no-exit'

  return {
    strategy,
    type: type2,
    hasClearExit: strategy >= 60,
    hasEmergencyExit: exportCount > 0,
    hasMultipleExits: exportCount > 1,
    hasGradualExit: interfaceCount > 0 && functionCount > 0,
    hasCleanExit: lockInCount === 0,
    hasExitStrategy: exportCount > 0 && (interfaceCount > 0 || typeCount > 0),
    hasNoLockIn: lockInCount === 0,
    hasBacktracking: readonlyCount > 0 || accessModCount > 0,
    hasSlack: spreadCount > 0 || destructureCount > 0,
    hasDaylight: strategy >= 40,
    lockInCount,
  }
}

// ─── Classification Helpers ─────────────────────────────────────────────────

/** @example classifyCondition(80) returns 'garden-maze' */
export function classifyCondition(score: number): 'garden-maze' | 'navigable-labyrinth' | 'challenging-puzzle' | 'confusing-maze' | 'minotaur-lair' | 'inescapable-trap' {
  if (score >= 80) return 'garden-maze'
  if (score >= 60) return 'navigable-labyrinth'
  if (score >= 40) return 'challenging-puzzle'
  if (score >= 20) return 'confusing-maze'
  if (score >= 10) return 'minotaur-lair'
  return 'inescapable-trap'
}

/** @example classifyWingType(cells) returns wing type */
export function classifyWingType(cells: LabyrinthCell[]): 'palace-garden' | 'castle-labyrinth' | 'temple-maze' | 'cave-system' | 'mine-shaft' | 'pit' {
  if (cells.length === 0) return 'pit'
  const avg = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  if (avg >= 80) return 'palace-garden'
  if (avg >= 60) return 'castle-labyrinth'
  if (avg >= 40) return 'temple-maze'
  if (avg >= 20) return 'cave-system'
  if (avg >= 10) return 'mine-shaft'
  return 'pit'
}

/** @example classifyWingCondition(avg) returns wing condition */
export function classifyWingCondition(avg: number): 'master-architect' | 'labyrinth-designer' | 'maze-builder' | 'hole-digger' | 'trap-layer' | 'collapsed' {
  if (avg >= 80) return 'master-architect'
  if (avg >= 60) return 'labyrinth-designer'
  if (avg >= 40) return 'maze-builder'
  if (avg >= 20) return 'hole-digger'
  if (avg >= 10) return 'trap-layer'
  return 'collapsed'
}

/** @example classifyArchitectGrade(80) returns 'daedalus' */
export function classifyArchitectGrade(navigability: number): 'daedalus' | 'master-architect' | 'labyrinth-designer' | 'maze-builder' | 'novice' | 'theseus' {
  if (navigability >= 85) return 'daedalus'
  if (navigability >= 70) return 'master-architect'
  if (navigability >= 55) return 'labyrinth-designer'
  if (navigability >= 40) return 'maze-builder'
  if (navigability >= 25) return 'novice'
  return 'theseus'
}

// ─── Analyze Cell ───────────────────────────────────────────────────────────

/** @example analyzeLabyrinthCell(content, 'foo.ts') returns LabyrinthCell */
export function analyzeLabyrinthCell(content: string, filePath: string): LabyrinthCell {
  const path2 = measurePath(content)
  const maze = measureMaze(content)
  const deadEnd = measureDeadEnd(content)
  const thread = measureThread(content)
  const minotaur = measureMinotaur(content)
  const exit = measureExit(content)

  const qualityScore = Math.round((path2.clarity + (100 - maze.complexity) + deadEnd.detection + thread.guidance + (100 - minotaur.danger) + exit.strategy) / 6)
  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    pathClarity: path2.clarity,
    mazeComplexity: maze.complexity,
    deadEndDetection: deadEnd.detection,
    threadGuidance: thread.guidance,
    minotaurDanger: minotaur.danger,
    exitStrategy: exit.strategy,
    path: path2,
    maze,
    deadEnd,
    thread,
    minotaur,
    exit,
    condition,
    qualityScore,
  }
}

// ─── Analyze Wing ───────────────────────────────────────────────────────────

/** @example analyzeLabyrinthWing(cells, 'src/') returns LabyrinthWing */
export function analyzeLabyrinthWing(cells: LabyrinthCell[], dirPath: string): LabyrinthWing {
  const avgPathClarity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pathClarity, 0) / cells.length) : 0
  const avgMazeComplexity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.mazeComplexity, 0) / cells.length) : 0
  const avgExitStrategy = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.exitStrategy, 0) / cells.length) : 0

  return {
    directory: dirPath,
    cells,
    avgPathClarity,
    avgMazeComplexity,
    avgExitStrategy,
    gardenMazeCount: cells.filter(c => c.condition === 'garden-maze').length,
    inescapableTrapCount: cells.filter(c => c.condition === 'inescapable-trap').length,
    clearPathCount: cells.filter(c => c.path.isClear).length,
    safeCount: cells.filter(c => c.minotaur.isSafe).length,
    wingType: classifyWingType(cells),
    condition: classifyWingCondition(cells.length > 0 ? cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length : 0),
  }
}

// ─── Generate Recommendations ───────────────────────────────────────────────

/** @example generateRecommendations(cells, [], labyrinth, stats) returns string[] */
export function generateRecommendations(_cells: LabyrinthCell[], wings: LabyrinthWing[], labyrinth: LabyrinthPathResult['labyrinth'], stats: LabyrinthPathResult['stats']): string[] {
  const recs: string[] = []

  if (labyrinth.overallNavigability < 40) {
    recs.push('Overall labyrinth navigability is critically low — consider major refactoring')
  }
  if (stats.avgMazeComplexity > 60) {
    recs.push('High average maze complexity — reduce nesting and branching')
  }
  if (stats.hasDeadCodeCount > 0) {
    recs.push('Remove commented-out code and unused declarations')
  }
  if (stats.avgThreadGuidance < 30) {
    recs.push('Add JSDoc comments and inline documentation to improve thread guidance')
  }
  if (stats.avgMinotaurDanger > 50) {
    recs.push('Reduce bug risk by eliminating `any` types and deep nesting')
  }
  if (stats.hasNoDeadEndsCount < stats.totalFiles * 0.5) {
    recs.push('Clean up dead code and orphan imports in more than half of files')
  }
  if (stats.inescapableTrapCount > 0) {
    recs.push(`Address ${stats.inescapableTrapCount} inescapable trap(s) — these files need immediate attention`)
  }
  if (stats.avgExitStrategy < 30) {
    recs.push('Improve exit strategy by adding interfaces, types, and reducing lock-in patterns')
  }
  if (wings.some(w => w.condition === 'collapsed')) {
    recs.push('One or more wings have collapsed — restructure directories with low-quality files')
  }
  if (recs.length === 0) {
    recs.push('Labyrinth is well-designed — maintain current architecture and documentation standards')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildLabyrinthPathResult(['a.ts'], ['export const x = 1']) returns LabyrinthPathResult */
export function buildLabyrinthPathResult(
  files: string[],
  contents: string[],
  options?: { verbose?: boolean },
): LabyrinthPathResult {
  const cells: LabyrinthCell[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    return analyzeLabyrinthCell(content, file)
  })

  const dirMap = new Map<string, LabyrinthCell[]>()
  for (const cell of cells) {
    const dir = cell.file.includes('/') ? cell.file.substring(0, cell.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(cell)
    } else {
      dirMap.set(dir, [cell])
    }
  }

  const wings: LabyrinthWing[] = Array.from(dirMap.entries()).map(([dir, dirCells]) =>
    analyzeLabyrinthWing(dirCells, dir),
  )

  const avgPathClarity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.pathClarity, 0) / cells.length) : 0
  const avgMazeComplexity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.mazeComplexity, 0) / cells.length) : 0
  const avgDeadEndDetection = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.deadEndDetection, 0) / cells.length) : 0
  const avgThreadGuidance = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.threadGuidance, 0) / cells.length) : 0
  const avgMinotaurDanger = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.minotaurDanger, 0) / cells.length) : 0
  const avgExitStrategy = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.exitStrategy, 0) / cells.length) : 0

  const overallNavigability = cells.length > 0
    ? Math.round((avgPathClarity + (100 - avgMazeComplexity) + avgDeadEndDetection + avgThreadGuidance + (100 - avgMinotaurDanger) + avgExitStrategy) / 6)
    : 0

  const labyrinth = {
    avgPathClarity,
    avgMazeComplexity,
    avgExitStrategy,
    isNavigable: overallNavigability >= 50,
    overallNavigability,
  }

  const architectGrade = classifyArchitectGrade(overallNavigability)

  const bestCell = cells.length > 0
    ? cells.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best, cells[0] as typeof cells[number]).file
    : ''
  const clearestPath = cells.length > 0
    ? cells.reduce((best, c) => c.path.clarity > best.path.clarity ? c : best, cells[0] as typeof cells[number]).file
    : ''
  const simplestMaze = cells.length > 0
    ? cells.reduce((best, c) => c.maze.complexity < best.maze.complexity ? c : best, cells[0] as typeof cells[number]).file
    : ''
  const bestGuided = cells.length > 0
    ? cells.reduce((best, c) => c.thread.guidance > best.thread.guidance ? c : best, cells[0] as typeof cells[number]).file
    : ''
  const safest = cells.length > 0
    ? cells.reduce((best, c) => c.minotaur.danger < best.minotaur.danger ? c : best, cells[0] as typeof cells[number]).file
    : ''

  void options

  const stats = {
    totalFiles: cells.length,
    totalWings: wings.length,
    avgPathClarity,
    avgMazeComplexity,
    avgDeadEndDetection,
    avgThreadGuidance,
    avgMinotaurDanger,
    avgExitStrategy,
    gardenMazeCount: cells.filter(c => c.condition === 'garden-maze').length,
    navigableLabyrinthCount: cells.filter(c => c.condition === 'navigable-labyrinth').length,
    challengingPuzzleCount: cells.filter(c => c.condition === 'challenging-puzzle').length,
    confusingMazeCount: cells.filter(c => c.condition === 'confusing-maze').length,
    minotaurLairCount: cells.filter(c => c.condition === 'minotaur-lair').length,
    inescapableTrapCount: cells.filter(c => c.condition === 'inescapable-trap').length,
    isClearCount: cells.filter(c => c.path.isClear).length,
    hasNoObstaclesCount: cells.filter(c => c.path.hasNoObstacles).length,
    isNavigableCount: cells.filter(c => c.maze.isNavigable).length,
    hasNoDeadEndsCount: cells.filter(c => c.deadEnd.hasNoDeadEnds).length,
    hasDeadCodeCount: cells.filter(c => c.deadEnd.hasDeadCode).length,
    hasGoldenThreadCount: cells.filter(c => c.thread.hasGoldenThread).length,
    hasNoSeveredThreadCount: cells.filter(c => c.thread.hasNoSeveredThread).length,
    isSafeCount: cells.filter(c => c.minotaur.isSafe).length,
    hasKnownDangersCount: cells.filter(c => c.minotaur.hasKnownDangers).length,
    hasClearExitCount: cells.filter(c => c.exit.hasClearExit).length,
    hasNoLockInCount: cells.filter(c => c.exit.hasNoLockIn).length,
    overallNavigability,
    architectGrade,
    bestCell,
    clearestPath,
    simplestMaze,
    bestGuided,
    safest,
  }

  const recommendations = generateRecommendations(cells, wings, labyrinth, stats)

  return {
    cells,
    wings,
    labyrinth,
    stats,
    recommendations,
  }
}
