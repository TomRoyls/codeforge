// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Maze solvability grade */
export type SolvabilityGrade =
  | 'open-garden'
  | 'clear-maze'
  | 'proper-labyrinth'
  | 'confusing-maze'
  | 'impossible-labyrinth'
  | 'no-exit'

/** Path clarity grade */
export type PathClarityGrade =
  | 'golden-thread'
  | 'well-marked'
  | 'proper-path'
  | 'faint-trail'
  | 'overgrown'
  | 'invisible'

/** Minotaur resistance defense */
export type ResistanceDefense =
  | 'invincible'
  | 'well-armed'
  | 'proper-shield'
  | 'vulnerable'
  | 'defenseless'
  | 'devoured'

/** Thread strength grade */
export type ThreadStrengthGrade =
  | 'unbreakable'
  | 'strong-cord'
  | 'proper-thread'
  | 'fraying-cord'
  | 'thin-thread'
  | 'snapped'

/** Exit accessibility grade */
export type ExitGrade =
  | 'grand-gate'
  | 'clear-exit'
  | 'proper-door'
  | 'hidden-exit'
  | 'locked-door'
  | 'no-exit'

/** Path condition */
export type PathCondition =
  | 'theseus-victory'
  | 'clever-navigator'
  | 'proper-explorer'
  | 'lost-wanderer'
  | 'trapped-soul'
  | 'minotaur-victim'

/** Level type */
export type LevelType =
  | 'grand-labyrinth'
  | 'proper-maze'
  | 'garden-maze'
  | 'hedge-maze'
  | 'straw-maze'
  | 'no-maze'

/** Level condition */
export type LevelCondition =
  | 'well-charted'
  | 'navigable'
  | 'explorable'
  | 'confusing'
  | 'treacherous'
  | 'death-trap'

/** Navigator grade */
export type NavigatorGrade =
  | 'ariadne'
  | 'master-navigator'
  | 'skilled-explorer'
  | 'apprentice'
  | 'lost-soul'
  | 'minotaur-food'

/** Navigating measurement */
export interface NavigatingMeasure {
  solvability: number
  grade: SolvabilityGrade
  hasHighSolvability: boolean
  hasNavigable: boolean
  hasTraversable: boolean
  hasNoImpassable: boolean
  hasClear: boolean
  hasNoDeadEnd: boolean
  hasReachable: boolean
  hasNoBlocked: boolean
  hasAccessible: boolean
  hasNoWalled: boolean
  hasOpen: boolean
  impassableCount: number
  deadEndCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  path: PathClarityGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasUnderstandable: boolean
  hasNoCryptic: boolean
  hasObvious: boolean
  hasNoHidden: boolean
  hasExplicit: boolean
  hasNoImplicit: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  hasLuminous: boolean
  crypticCount: number
  hiddenCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  defense: ResistanceDefense
  hasHighResistance: boolean
  hasBugFree: boolean
  hasHardened: boolean
  hasNoBuggy: boolean
  hasDefensive: boolean
  hasNoExposed: boolean
  hasProtected: boolean
  hasNoVulnerable: boolean
  hasGuarded: boolean
  hasNoUnguarded: boolean
  hasSafe: boolean
  buggyCount: number
  exposedCount: number
}

/** Threading measurement */
export interface ThreadingMeasure {
  strength: number
  thread: ThreadStrengthGrade
  hasHighStrength: boolean
  hasTraceable: boolean
  hasTrackable: boolean
  hasNoUntraceable: boolean
  hasFollowable: boolean
  hasNoLost: boolean
  hasDebuggable: boolean
  hasNoOpaque: boolean
  hasObservable: boolean
  hasNoInvisible: boolean
  hasVisible: boolean
  untraceableCount: number
  lostCount: number
}

/** Exiting measurement */
export interface ExitingMeasure {
  accessibility: number
  exit: ExitGrade
  hasHighAccessibility: boolean
  hasEscapable: boolean
  hasRecoverable: boolean
  hasNoTrapped: boolean
  hasGraceful: boolean
  hasNoAbrupt: boolean
  hasClean: boolean
  hasNoMessy: boolean
  hasSafe: boolean
  hasNoCrash: boolean
  hasHandled: boolean
  trappedCount: number
  abruptCount: number
}

/** Single file analysis */
export interface LabyrinthPath {
  file: string
  mazeSolvability: number
  pathClarity: number
  minotaurResistance: number
  threadStrength: number
  exitAccessibility: number
  navigating: NavigatingMeasure
  clarifying: ClarifyingMeasure
  resisting: ResistingMeasure
  threading: ThreadingMeasure
  exiting: ExitingMeasure
  condition: PathCondition
  qualityScore: number
}

/** Directory-level */
export interface LabyrinthLevel {
  directory: string
  paths: LabyrinthPath[]
  avgSolvability: number
  avgClarity: number
  avgResistance: number
  theseusVictoryCount: number
  minotaurVictimCount: number
  levelType: LevelType
  condition: LevelCondition
}

/** Maze summary */
export interface MazeSummary {
  avgSolvability: number
  avgClarity: number
  avgResistance: number
  isNavigable: boolean
  overallNavigability: number
}

/** Full stats */
export interface LabyrinthThreadStats {
  totalFiles: number
  totalLevels: number
  avgMazeSolvability: number
  avgPathClarity: number
  avgMinotaurResistance: number
  avgThreadStrength: number
  avgExitAccessibility: number
  theseusVictoryCount: number
  cleverNavigatorCount: number
  properExplorerCount: number
  lostWandererCount: number
  trappedSoulCount: number
  minotaurVictimCount: number
  hasHighSolvabilityCount: number
  hasHighClarityCount: number
  hasHighResistanceCount: number
  hasHighStrengthCount: number
  hasHighAccessibilityCount: number
  overallNavigability: number
  navigatorGrade: NavigatorGrade
  bestPath: string
  mostSolvable: string
  clearest: string
  mostResistant: string
  strongestThread: string
}

/** Full result */
export interface LabyrinthThreadResult {
  paths: LabyrinthPath[]
  levels: LabyrinthLevel[]
  maze: MazeSummary
  stats: LabyrinthThreadStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure maze solvability
 * @example
 * const m = measureNavigating(content)
 * console.log(m.grade) // 'open-garden'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 10 : 0

  const hasNavigable = hasExport(content) && hasImport(content)
  const hasTraversable = hasInterface(content) && hasClass(content)
  const hasClear = hasGenerics(content) && hasTypeAlias(content)
  const hasReachable = hasNamedExport(content) && hasReturnType(content)
  const hasAccessible = hasAsync(content) && hasDocComments(content)
  const hasOpen = hasExport(content) && hasGenerics(content)

  score += hasNavigable ? 5 : 0
  score += hasTraversable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasReachable ? 5 : 0
  score += hasAccessible ? 5 : 0
  score += hasOpen ? 5 : 0

  const solvability = Math.min(score, 100)
  const impassableCount = count(/\bvar\b/, content)
  const deadEndCount = count(/\bany\b/, content)

  const hasNoImpassable = impassableCount === 0
  const hasNoDeadEnd = deadEndCount === 0
  const hasNoBlocked = !has(/\beval\b/, content)
  const hasNoWalled = !has(/\bdebugger\b/, content)
  const hasHighSolvability = solvability >= 70

  let grade: SolvabilityGrade
  if (solvability >= 85) grade = 'open-garden'
  else if (solvability >= 70) grade = 'clear-maze'
  else if (solvability >= 55) grade = 'proper-labyrinth'
  else if (solvability >= 40) grade = 'confusing-maze'
  else if (solvability >= 25) grade = 'impossible-labyrinth'
  else grade = 'no-exit'

  return {
    solvability, grade, hasHighSolvability, hasNavigable, hasTraversable, hasNoImpassable,
    hasClear, hasNoDeadEnd, hasReachable, hasNoBlocked, hasAccessible, hasNoWalled,
    hasOpen, impassableCount, deadEndCount,
  }
}

/**
 * Measure path clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.path) // 'golden-thread'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasReadable = hasExport(content) && hasNamedExport(content)
  const hasUnderstandable = hasInterface(content) && hasClass(content)
  const hasObvious = hasDocComments(content) && hasReturnType(content)
  const hasExplicit = hasGenerics(content) && hasTypeAlias(content)
  const hasTransparent = hasConst(content) && hasExport(content)
  const hasLuminous = hasDocComments(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasObvious ? 5 : 0
  score += hasExplicit ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasLuminous ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = count(/\bvar\b/, content)
  const hiddenCount = count(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoImplicit = !has(/\beval\b/, content)
  const hasNoOpaque = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let pathGrade: PathClarityGrade
  if (clarity >= 85) pathGrade = 'golden-thread'
  else if (clarity >= 70) pathGrade = 'well-marked'
  else if (clarity >= 55) pathGrade = 'proper-path'
  else if (clarity >= 40) pathGrade = 'faint-trail'
  else if (clarity >= 25) pathGrade = 'overgrown'
  else pathGrade = 'invisible'

  return {
    clarity, path: pathGrade, hasHighClarity, hasReadable, hasUnderstandable, hasNoCryptic,
    hasObvious, hasNoHidden, hasExplicit, hasNoImplicit, hasTransparent, hasNoOpaque,
    hasLuminous, crypticCount, hiddenCount,
  }
}

/**
 * Measure minotaur resistance
 * @example
 * const m = measureResisting(content)
 * console.log(m.defense) // 'invincible'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0

  const hasBugFree = hasConst(content) && hasReadonly(content)
  const hasHardened = hasStrictEq(content) && hasReturnType(content)
  const hasDefensive = hasInterface(content) && hasGenerics(content)
  const hasProtected = hasClass(content) && hasPrivate(content)
  const hasGuarded = hasTypeAlias(content) && hasExport(content)
  const hasSafe = hasConst(content) && hasInterface(content)

  score += hasBugFree ? 5 : 0
  score += hasHardened ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasGuarded ? 5 : 0
  score += hasSafe ? 5 : 0

  const resistance = Math.min(score, 100)
  const buggyCount = count(/\bvar\b/, content)
  const exposedCount = count(/\bany\b/, content)

  const hasNoBuggy = buggyCount === 0
  const hasNoExposed = exposedCount === 0
  const hasNoVulnerable = !has(/\beval\b/, content)
  const hasNoUnguarded = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let defense: ResistanceDefense
  if (resistance >= 85) defense = 'invincible'
  else if (resistance >= 70) defense = 'well-armed'
  else if (resistance >= 55) defense = 'proper-shield'
  else if (resistance >= 40) defense = 'vulnerable'
  else if (resistance >= 25) defense = 'defenseless'
  else defense = 'devoured'

  return {
    resistance, defense, hasHighResistance, hasBugFree, hasHardened, hasNoBuggy,
    hasDefensive, hasNoExposed, hasProtected, hasNoVulnerable, hasGuarded,
    hasNoUnguarded, hasSafe, buggyCount, exposedCount,
  }
}

/**
 * Measure thread strength
 * @example
 * const m = measureThreading(content)
 * console.log(m.thread) // 'unbreakable'
 */
export function measureThreading(content: string): ThreadingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasTraceable = hasStrictEq(content) && hasConst(content)
  const hasTrackable = hasReturnType(content) && hasReadonly(content)
  const hasDebuggable = hasPrivate(content) && hasClass(content)
  const hasObservable = hasInterface(content) && hasGenerics(content)
  const hasVisible = hasExport(content) && hasTypeAlias(content)
  const hasFollowable = hasStrictEq(content) && hasReturnType(content)

  score += hasTraceable ? 5 : 0
  score += hasTrackable ? 5 : 0
  score += hasDebuggable ? 5 : 0
  score += hasObservable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasFollowable ? 5 : 0

  const strength = Math.min(score, 100)
  const untraceableCount = count(/\bvar\b/, content)
  const lostCount = count(/\bany\b/, content)

  const hasNoUntraceable = untraceableCount === 0
  const hasNoLost = lostCount === 0
  const hasNoInvisible = !has(/\beval\b/, content)
  const hasNoOpaque = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let thread: ThreadStrengthGrade
  if (strength >= 85) thread = 'unbreakable'
  else if (strength >= 70) thread = 'strong-cord'
  else if (strength >= 55) thread = 'proper-thread'
  else if (strength >= 40) thread = 'fraying-cord'
  else if (strength >= 25) thread = 'thin-thread'
  else thread = 'snapped'

  return {
    strength, thread, hasHighStrength, hasTraceable, hasTrackable, hasNoUntraceable,
    hasFollowable, hasNoLost, hasDebuggable, hasNoOpaque, hasObservable,
    hasNoInvisible, hasVisible, untraceableCount, lostCount,
  }
}

/**
 * Measure exit accessibility
 * @example
 * const m = measureExiting(content)
 * console.log(m.exit) // 'grand-gate'
 */
export function measureExiting(content: string): ExitingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasEscapable = hasDocComments(content) && hasReturnType(content)
  const hasRecoverable = hasExport(content) && hasDocComments(content)
  const hasGraceful = hasInterface(content) && hasGenerics(content)
  const hasClean = hasNamedExport(content) && hasReturnType(content)
  const hasSafe = hasClass(content) && hasDocComments(content)
  const hasHandled = hasConst(content) && hasTypeAlias(content)

  score += hasEscapable ? 5 : 0
  score += hasRecoverable ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasSafe ? 5 : 0
  score += hasHandled ? 5 : 0

  const accessibility = Math.min(score, 100)
  const trappedCount = count(/\bvar\b/, content)
  const abruptCount = count(/\bany\b/, content)

  const hasNoTrapped = trappedCount === 0
  const hasNoAbrupt = abruptCount === 0
  const hasNoMessy = !has(/\beval\b/, content)
  const hasNoCrash = !has(/\bdebugger\b/, content)
  const hasHighAccessibility = accessibility >= 70

  let exitGrade: ExitGrade
  if (accessibility >= 85) exitGrade = 'grand-gate'
  else if (accessibility >= 70) exitGrade = 'clear-exit'
  else if (accessibility >= 55) exitGrade = 'proper-door'
  else if (accessibility >= 40) exitGrade = 'hidden-exit'
  else if (accessibility >= 25) exitGrade = 'locked-door'
  else exitGrade = 'no-exit'

  return {
    accessibility, exit: exitGrade, hasHighAccessibility, hasEscapable, hasRecoverable, hasNoTrapped,
    hasGraceful, hasNoAbrupt, hasClean, hasNoMessy, hasSafe, hasNoCrash,
    hasHandled, trappedCount, abruptCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify path condition
 * @example
 * classifyPathCondition(90) // 'theseus-victory'
 */
export function classifyPathCondition(score: number): PathCondition {
  if (score >= 85) return 'theseus-victory'
  if (score >= 70) return 'clever-navigator'
  if (score >= 55) return 'proper-explorer'
  if (score >= 40) return 'lost-wanderer'
  if (score >= 25) return 'trapped-soul'
  return 'minotaur-victim'
}

/**
 * Classify level type
 * @example
 * classifyLevelType(paths) // 'grand-labyrinth'
 */
export function classifyLevelType(paths: LabyrinthPath[]): LevelType {
  if (paths.length === 0) return 'no-maze'
  const avgQs = Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length)
  const masterRatio = paths.filter(p => p.condition === 'theseus-victory').length / paths.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'grand-labyrinth'
  if (avgQs >= 60) return 'proper-maze'
  if (avgQs >= 45) return 'garden-maze'
  if (avgQs >= 30) return 'hedge-maze'
  if (avgQs >= 15) return 'straw-maze'
  return 'no-maze'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'ariadne'
 */
export function classifyNavigatorGrade(avgNav: number): NavigatorGrade {
  if (avgNav >= 80) return 'ariadne'
  if (avgNav >= 65) return 'master-navigator'
  if (avgNav >= 50) return 'skilled-explorer'
  if (avgNav >= 35) return 'apprentice'
  if (avgNav >= 20) return 'lost-soul'
  return 'minotaur-food'
}

/**
 * Classify level condition
 * @example
 * classifyLevelCondition(80) // 'well-charted'
 */
export function classifyLevelCondition(avgQs: number): LevelCondition {
  if (avgQs >= 75) return 'well-charted'
  if (avgQs >= 60) return 'navigable'
  if (avgQs >= 45) return 'explorable'
  if (avgQs >= 30) return 'confusing'
  if (avgQs >= 15) return 'treacherous'
  return 'death-trap'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(paths, levels, maze, stats)
 */
export function generateRecommendations(
  paths: LabyrinthPath[],
  levels: LabyrinthLevel[],
  maze: MazeSummary,
  stats: LabyrinthThreadStats,
): string[] {
  const recs: string[] = []
  if (stats.avgMazeSolvability < 50) {
    recs.push('Improve maze solvability with navigable exports, traversable interfaces, and clear type signatures')
  }
  if (stats.avgPathClarity < 50) {
    recs.push('Enhance path clarity with readable exports, understandable interfaces, and obvious documentation')
  }
  if (stats.avgMinotaurResistance < 50) {
    recs.push('Strengthen minotaur resistance with bug-free const usage, hardened strict equality, and defensive patterns')
  }
  if (stats.avgThreadStrength < 50) {
    recs.push('Reinforce thread strength with traceable strict equality, trackable return types, and debuggable patterns')
  }
  if (stats.avgExitAccessibility < 50) {
    recs.push('Improve exit accessibility with escapable documentation, recoverable exports, and graceful error handling')
  }
  if (stats.minotaurVictimCount > 0) {
    recs.push(`${stats.minotaurVictimCount} file(s) fell to the minotaur — consider significant refactoring`)
  }
  if (maze.overallNavigability < 40) {
    recs.push('Overall labyrinth navigability is poor — focus on solvability and path clarity first')
  }
  const allNoMaze = levels.every(l => l.levelType === 'no-maze' || l.levelType === 'straw-maze')
  if (allNoMaze && levels.length > 0) {
    recs.push('All levels are bare or minimal — consider a major navigability overhaul')
  }
  const victims = paths.filter(p => p.condition === 'minotaur-victim').map(p => p.file)
  if (victims.length > 0 && victims.length <= 3) {
    recs.push(`Rescue these minotaur victims: ${victims.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Ariadne\'s thread guides true! Every path in your labyrinth leads to victory')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a labyrinth path
 * @example
 * const path = analyzeLabyrinthPath(content, 'index.ts')
 * console.log(path.condition) // 'theseus-victory'
 */
export function analyzeLabyrinthPath(content: string, filePath: string): LabyrinthPath {
  const navigating = measureNavigating(content)
  const clarifying = measureClarifying(content)
  const resisting = measureResisting(content)
  const threading = measureThreading(content)
  const exiting = measureExiting(content)

  const qualityScore = Math.round(
    navigating.solvability * 0.2 +
    clarifying.clarity * 0.2 +
    resisting.resistance * 0.2 +
    threading.strength * 0.2 +
    exiting.accessibility * 0.2,
  )

  return {
    file: filePath,
    mazeSolvability: navigating.solvability,
    pathClarity: clarifying.clarity,
    minotaurResistance: resisting.resistance,
    threadStrength: threading.strength,
    exitAccessibility: exiting.accessibility,
    navigating,
    clarifying,
    resisting,
    threading,
    exiting,
    condition: classifyPathCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a labyrinth level
 * @example
 * const level = analyzeLabyrinthLevel(paths, 'src')
 * console.log(level.levelType) // 'grand-labyrinth'
 */
export function analyzeLabyrinthLevel(paths: LabyrinthPath[], dirPath: string): LabyrinthLevel {
  if (paths.length === 0) {
    return {
      directory: dirPath, paths: [], avgSolvability: 0, avgClarity: 0, avgResistance: 0,
      theseusVictoryCount: 0, minotaurVictimCount: 0, levelType: 'no-maze', condition: 'death-trap',
    }
  }

  const avgSolvability = Math.round(paths.reduce((s, p) => s + p.mazeSolvability, 0) / paths.length)
  const avgClarity = Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length)
  const avgResistance = Math.round(paths.reduce((s, p) => s + p.minotaurResistance, 0) / paths.length)
  const theseusVictoryCount = paths.filter(p => p.condition === 'theseus-victory').length
  const minotaurVictimCount = paths.filter(p => p.condition === 'minotaur-victim').length
  const avgQs = Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length)

  return {
    directory: dirPath, paths, avgSolvability, avgClarity, avgResistance,
    theseusVictoryCount, minotaurVictimCount, levelType: classifyLevelType(paths),
    condition: classifyLevelCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete labyrinth thread result
 * @example
 * const result = await buildLabyrinthThreadResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'ariadne'
 */
export async function buildLabyrinthThreadResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<LabyrinthThreadResult> {
  const paths = files.map((file, i) => analyzeLabyrinthPath(contents[i] ?? '', file))

  const dirMap = new Map<string, LabyrinthPath[]>()
  for (const p of paths) {
    const dir = path.dirname(p.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(p) } else { dirMap.set(dir, [p]) }
  }

  const levels = Array.from(dirMap.entries()).map(([dir, dirPaths]) =>
    analyzeLabyrinthLevel(dirPaths, dir),
  )

  const avgSolvability = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.mazeSolvability, 0) / paths.length) : 0
  const avgClarity = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length) : 0
  const avgResistance = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.minotaurResistance, 0) / paths.length) : 0

  const overallNavigability = paths.length > 0
    ? Math.round((avgSolvability + avgClarity + avgResistance) / 3) : 0
  const isNavigable = avgClarity >= 60

  const maze: MazeSummary = { avgSolvability, avgClarity, avgResistance, isNavigable, overallNavigability }

  const avgThreadStrength = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.threadStrength, 0) / paths.length) : 0
  const avgExitAccessibility = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.exitAccessibility, 0) / paths.length) : 0

  const bestPath = paths.length > 0
    ? paths.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const mostSolvable = paths.length > 0
    ? paths.reduce((best, p) => p.mazeSolvability > best.mazeSolvability ? p : best).file : ''
  const clearest = paths.length > 0
    ? paths.reduce((best, p) => p.pathClarity > best.pathClarity ? p : best).file : ''
  const mostResistant = paths.length > 0
    ? paths.reduce((best, p) => p.minotaurResistance > best.minotaurResistance ? p : best).file : ''
  const strongestThread = paths.length > 0
    ? paths.reduce((best, p) => p.threadStrength > best.threadStrength ? p : best).file : ''

  const stats: LabyrinthThreadStats = {
    totalFiles: paths.length,
    totalLevels: levels.length,
    avgMazeSolvability: avgSolvability,
    avgPathClarity: avgClarity,
    avgMinotaurResistance: avgResistance,
    avgThreadStrength,
    avgExitAccessibility,
    theseusVictoryCount: paths.filter(p => p.condition === 'theseus-victory').length,
    cleverNavigatorCount: paths.filter(p => p.condition === 'clever-navigator').length,
    properExplorerCount: paths.filter(p => p.condition === 'proper-explorer').length,
    lostWandererCount: paths.filter(p => p.condition === 'lost-wanderer').length,
    trappedSoulCount: paths.filter(p => p.condition === 'trapped-soul').length,
    minotaurVictimCount: paths.filter(p => p.condition === 'minotaur-victim').length,
    hasHighSolvabilityCount: paths.filter(p => p.navigating.hasHighSolvability).length,
    hasHighClarityCount: paths.filter(p => p.clarifying.hasHighClarity).length,
    hasHighResistanceCount: paths.filter(p => p.resisting.hasHighResistance).length,
    hasHighStrengthCount: paths.filter(p => p.threading.hasHighStrength).length,
    hasHighAccessibilityCount: paths.filter(p => p.exiting.hasHighAccessibility).length,
    overallNavigability,
    navigatorGrade: classifyNavigatorGrade(overallNavigability),
    bestPath, mostSolvable, clearest, mostResistant, strongestThread,
  }

  const recommendations = generateRecommendations(paths, levels, maze, stats)

  return { paths, levels, maze, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
