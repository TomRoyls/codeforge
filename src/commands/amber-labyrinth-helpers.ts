// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ClarityGrade = 'golden-corridor' | 'clear-path' | 'proper-hallway' | 'winding-tunnel' | 'dark-passage' | 'dead-end'
export type AmberGrade = 'perfect-amber' | 'golden-resin' | 'proper-preservation' | 'fading-memory' | 'cracked-amber' | 'no-amber'
export type TwistGrade = 'logical-labyrinth' | 'proper-maze' | 'decent-winding' | 'random-twists' | 'chaotic-turns' | 'no-coherence'
export type MinotaurGrade = 'beast-tamer' | 'skilled-handler' | 'proper-management' | 'overwhelmed' | 'fleeing-hero' | 'no-handling'
export type ThreadGrade = 'golden-thread' | 'clear-trace' | 'proper-path' | 'tangled-yarn' | 'broken-thread' | 'no-thread'
export type PathCondition = 'golden-maze' | 'amber-sanctuary' | 'proper-labyrinth' | 'crumbling-maze' | 'dark-tunnel' | 'collapsed'
export type WingType = 'grand-labyrinth' | 'proper-maze' | 'decent-wing' | 'narrow-corridor' | 'dead-end-hall' | 'no-wing'
export type WingCondition = 'magnificent-maze' | 'golden-labyrinth' | 'decent-maze' | 'crumbling-walls' | 'ruined-passages' | 'void'
export type ArchitectGrade = 'daedalus' | 'master-architect' | 'skilled-builder' | 'apprentice' | 'novice' | 'lost-soul'

export interface NavigatingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasReadableFlow: boolean
  hasLogicalSequence: boolean
  hasNoSpaghetti: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasClearPath: boolean
  hasNoConfusing: boolean
  hasNavigable: boolean
  spaghettiCount: number
  chaoticCount: number
}

export interface PreservingMeasure {
  preservation: number
  amber: AmberGrade
  hasHighPreservation: boolean
  hasDocumented: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasCommented: boolean
  hasNoSilent: boolean
  hasDescriptive: boolean
  hasNoVague: boolean
  hasMeaningful: boolean
  hasNoArbitrary: boolean
  hasPreserved: boolean
  crypticCount: number
  silentCount: number
}

export interface TwistingMeasure {
  coherence: number
  twist: TwistGrade
  hasHighCoherence: boolean
  hasLogicalBranching: boolean
  hasConsistentConditions: boolean
  hasNoContradictory: boolean
  hasStructuredIfElse: boolean
  hasNoNestedMess: boolean
  hasClearConditions: boolean
  hasNoVague: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasCoherent: boolean
  contradictoryCount: number
  nestedMessCount: number
}

export interface TamingMeasure {
  handling: number
  minotaur: MinotaurGrade
  hasHighHandling: boolean
  hasComplexityManaged: boolean
  hasAbstractionUsed: boolean
  hasNoGodFunctions: boolean
  hasDecomposed: boolean
  hasNoMonolithic: boolean
  hasPatternApplied: boolean
  hasNoSpaghetti: boolean
  hasSimplified: boolean
  hasNoOverComplicated: boolean
  hasControlled: boolean
  godFunctionCount: number
  monolithicCount: number
}

export interface TracingMeasure {
  followability: number
  thread: ThreadGrade
  hasHighFollowability: boolean
  hasTraceable: boolean
  hasNoHiddenCalls: boolean
  hasObservable: boolean
  hasNoBlackBoxes: boolean
  hasDebuggable: boolean
  hasNoOpaque: boolean
  hasLogged: boolean
  hasNoSilent: boolean
  hasTransparent: boolean
  hasNoMysterious: boolean
  hiddenCallCount: number
  blackBoxCount: number
}

export interface AmberPath {
  file: string
  pathClarity: number
  amberPreservation: number
  twistCoherence: number
  minotaurHandling: number
  threadFollowability: number
  navigating: NavigatingMeasure
  preserving: PreservingMeasure
  twisting: TwistingMeasure
  taming: TamingMeasure
  tracing: TracingMeasure
  condition: PathCondition
  qualityScore: number
}

export interface LabyrinthWing {
  directory: string
  paths: AmberPath[]
  avgClarity: number
  avgCoherence: number
  avgFollowability: number
  goldenMazeCount: number
  collapsedCount: number
  wingType: WingType
  condition: WingCondition
}

export interface MazeSummary {
  avgClarity: number
  avgCoherence: number
  avgFollowability: number
  isNavigable: boolean
  overallDesign: number
}

export interface AmberLabyrinthStats {
  totalFiles: number
  totalWings: number
  avgPathClarity: number
  avgAmberPreservation: number
  avgTwistCoherence: number
  avgMinotaurHandling: number
  avgThreadFollowability: number
  goldenMazeCount: number
  amberSanctuaryCount: number
  properLabyrinthCount: number
  crumblingMazeCount: number
  darkTunnelCount: number
  collapsedCount: number
  hasHighClarityCount: number
  hasHighPreservationCount: number
  hasHighCoherenceCount: number
  hasHighHandlingCount: number
  hasHighFollowabilityCount: number
  overallDesign: number
  architectGrade: ArchitectGrade
  bestPath: string
  clearest: string
  bestPreserved: string
  mostCoherent: string
  bestThread: string
}

export interface AmberLabyrinthResult {
  paths: AmberPath[]
  wings: LabyrinthWing[]
  maze: MazeSummary
  stats: AmberLabyrinthStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasSwitch = (c: string) => has(/\bswitch\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasTernary = (c: string) => has(/\?[^?]*:/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure path clarity (navigating)
 * @example
 * const m = measureNavigating(content)
 * console.log(m.grade) // 'golden-corridor'
 */
export function measureNavigating(content: string): NavigatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasReadableFlow = hasExport(content) && hasReturnType(content)
  const hasLogicalSequence = hasImport(content) && hasExport(content)
  const hasWellStructured = hasInterface(content) && hasConst(content)
  const hasOrganized = hasNamedExport(content) && hasReturnType(content)
  const hasClearPath = hasConst(content) && hasImport(content)
  const hasNavigable = hasDocComments(content) && hasReturnType(content)

  score += hasReadableFlow ? 5 : 0
  score += hasLogicalSequence ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasClearPath ? 5 : 0
  score += hasNavigable ? 5 : 0

  const clarity = Math.min(score, 100)
  const spaghettiCount = countMatches(/\bvar\b/, content)
  const chaoticCount = countMatches(/\bany\b/, content)

  const hasNoSpaghetti = spaghettiCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoConfusing = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'golden-corridor'
  else if (clarity >= 70) grade = 'clear-path'
  else if (clarity >= 55) grade = 'proper-hallway'
  else if (clarity >= 40) grade = 'winding-tunnel'
  else if (clarity >= 25) grade = 'dark-passage'
  else grade = 'dead-end'

  return {
    clarity, grade, hasHighClarity, hasReadableFlow, hasLogicalSequence,
    hasNoSpaghetti, hasWellStructured, hasNoChaotic, hasOrganized,
    hasNoScattered, hasClearPath, hasNoConfusing, hasNavigable,
    spaghettiCount, chaoticCount,
  }
}

/**
 * Measure amber preservation (preserving)
 * @example
 * const m = measurePreserving(content)
 * console.log(m.amber) // 'perfect-amber'
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasWellNamed = hasNamedExport(content) && hasExport(content)
  const hasCommented = hasDocComments(content) && hasInterface(content)
  const hasDescriptive = hasReturnType(content) && hasConst(content)
  const hasMeaningful = hasInterface(content) && hasTypeAlias(content)
  const hasPreserved = hasStrictEq(content) && hasConst(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasCommented ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasPreserved ? 5 : 0

  const preservation = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const silentCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoSilent = silentCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoArbitrary = !has(/\bdebugger\b/, content)
  const hasHighPreservation = preservation >= 70

  let amber: AmberGrade
  if (preservation >= 85) amber = 'perfect-amber'
  else if (preservation >= 70) amber = 'golden-resin'
  else if (preservation >= 55) amber = 'proper-preservation'
  else if (preservation >= 40) amber = 'fading-memory'
  else if (preservation >= 25) amber = 'cracked-amber'
  else amber = 'no-amber'

  return {
    preservation, amber, hasHighPreservation, hasDocumented, hasWellNamed,
    hasNoCryptic, hasCommented, hasNoSilent, hasDescriptive, hasNoVague,
    hasMeaningful, hasNoArbitrary, hasPreserved, crypticCount, silentCount,
  }
}

/**
 * Measure twist coherence (twisting)
 * @example
 * const m = measureTwisting(content)
 * console.log(m.twist) // 'logical-labyrinth'
 */
export function measureTwisting(content: string): TwistingMeasure {
  let score = 0
  score += hasConditional(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasSwitch(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0

  const hasLogicalBranching = hasConditional(content) && hasStrictEq(content)
  const hasConsistentConditions = hasEnum(content) && hasSwitch(content)
  const hasStructuredIfElse = hasConditional(content) && hasReturnType(content)
  const hasClearConditions = hasStrictEq(content) && hasConst(content)
  const hasOrdered = hasUnionType(content) && hasEnum(content)
  const hasCoherent = hasOptional(content) && hasDefaultParam(content)

  score += hasLogicalBranching ? 5 : 0
  score += hasConsistentConditions ? 5 : 0
  score += hasStructuredIfElse ? 5 : 0
  score += hasClearConditions ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasCoherent ? 5 : 0

  const coherence = Math.min(score, 100)
  const contradictoryCount = countMatches(/\bvar\b/, content)
  const nestedMessCount = countMatches(/\bany\b/, content)

  const hasNoContradictory = contradictoryCount === 0
  const hasNoNestedMess = nestedMessCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoRandom = !has(/\bdebugger\b/, content)
  const hasHighCoherence = coherence >= 70

  let twist: TwistGrade
  if (coherence >= 85) twist = 'logical-labyrinth'
  else if (coherence >= 70) twist = 'proper-maze'
  else if (coherence >= 55) twist = 'decent-winding'
  else if (coherence >= 40) twist = 'random-twists'
  else if (coherence >= 25) twist = 'chaotic-turns'
  else twist = 'no-coherence'

  return {
    coherence, twist, hasHighCoherence, hasLogicalBranching,
    hasConsistentConditions, hasNoContradictory, hasStructuredIfElse,
    hasNoNestedMess, hasClearConditions, hasNoVague, hasOrdered,
    hasNoRandom, hasCoherent, contradictoryCount, nestedMessCount,
  }
}

/**
 * Measure minotaur handling (taming)
 * @example
 * const m = measureTaming(content)
 * console.log(m.minotaur) // 'beast-tamer'
 */
export function measureTaming(content: string): TamingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0

  const hasComplexityManaged = hasInterface(content) && hasGenerics(content)
  const hasAbstractionUsed = hasExport(content) && hasInterface(content)
  const hasDecomposed = hasNamedExport(content) && hasConst(content)
  const hasPatternApplied = hasMapFunction(content) && hasArrowFunction(content)
  const hasSimplified = hasAsync(content) && hasConst(content)
  const hasControlled = hasPrivate(content) && hasReadonly(content)

  score += hasComplexityManaged ? 5 : 0
  score += hasAbstractionUsed ? 5 : 0
  score += hasDecomposed ? 5 : 0
  score += hasPatternApplied ? 5 : 0
  score += hasSimplified ? 5 : 0
  score += hasControlled ? 5 : 0

  const handling = Math.min(score, 100)
  const godFunctionCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoGodFunctions = godFunctionCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoSpaghetti = !has(/\beval\b/, content)
  const hasNoOverComplicated = !has(/\bdebugger\b/, content)
  const hasHighHandling = handling >= 70

  let minotaur: MinotaurGrade
  if (handling >= 85) minotaur = 'beast-tamer'
  else if (handling >= 70) minotaur = 'skilled-handler'
  else if (handling >= 55) minotaur = 'proper-management'
  else if (handling >= 40) minotaur = 'overwhelmed'
  else if (handling >= 25) minotaur = 'fleeing-hero'
  else minotaur = 'no-handling'

  return {
    handling, minotaur, hasHighHandling, hasComplexityManaged, hasAbstractionUsed,
    hasNoGodFunctions, hasDecomposed, hasNoMonolithic, hasPatternApplied,
    hasNoSpaghetti, hasSimplified, hasNoOverComplicated, hasControlled,
    godFunctionCount, monolithicCount,
  }
}

/**
 * Measure thread followability (tracing)
 * @example
 * const m = measureTracing(content)
 * console.log(m.thread) // 'golden-thread'
 */
export function measureTracing(content: string): TracingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0

  const hasTraceable = hasReturnType(content) && hasExport(content)
  const hasObservable = hasExport(content) && hasImport(content)
  const hasDebuggable = hasReturnType(content) && hasStrictEq(content)
  const hasLogged = hasTryCatch(content) && hasAsync(content)
  const hasTransparent = hasDocComments(content) && hasReturnType(content)
  const hasNoMysterious = hasConst(content) && hasStrictEq(content)

  score += hasTraceable ? 5 : 0
  score += hasObservable ? 5 : 0
  score += hasDebuggable ? 5 : 0
  score += hasLogged ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasNoMysterious ? 5 : 0

  const followability = Math.min(score, 100)
  const hiddenCallCount = countMatches(/\bvar\b/, content)
  const blackBoxCount = countMatches(/\bany\b/, content)

  const hasNoHiddenCalls = hiddenCallCount === 0
  const hasNoBlackBoxes = blackBoxCount === 0
  const hasNoOpaque = !has(/\beval\b/, content)
  const hasNoSilent = !has(/\bdebugger\b/, content)
  const hasHighFollowability = followability >= 70

  let thread: ThreadGrade
  if (followability >= 85) thread = 'golden-thread'
  else if (followability >= 70) thread = 'clear-trace'
  else if (followability >= 55) thread = 'proper-path'
  else if (followability >= 40) thread = 'tangled-yarn'
  else if (followability >= 25) thread = 'broken-thread'
  else thread = 'no-thread'

  return {
    followability, thread, hasHighFollowability, hasTraceable,
    hasNoHiddenCalls, hasObservable, hasNoBlackBoxes, hasDebuggable,
    hasNoOpaque, hasLogged, hasNoSilent, hasTransparent, hasNoMysterious,
    hiddenCallCount, blackBoxCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify path condition
 * @example
 * classifyPathCondition(90) // 'golden-maze'
 */
export function classifyPathCondition(score: number): PathCondition {
  if (score >= 85) return 'golden-maze'
  if (score >= 70) return 'amber-sanctuary'
  if (score >= 55) return 'proper-labyrinth'
  if (score >= 40) return 'crumbling-maze'
  if (score >= 25) return 'dark-tunnel'
  return 'collapsed'
}

/**
 * Classify wing type
 * @example
 * classifyWingType(paths) // 'grand-labyrinth'
 */
export function classifyWingType(paths: AmberPath[]): WingType {
  if (paths.length === 0) return 'no-wing'
  const avgQs = Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length)
  const goldenRatio = paths.filter(p => p.condition === 'golden-maze').length / paths.length
  if (avgQs >= 75 && goldenRatio >= 0.5) return 'grand-labyrinth'
  if (avgQs >= 60) return 'proper-maze'
  if (avgQs >= 45) return 'decent-wing'
  if (avgQs >= 30) return 'narrow-corridor'
  if (avgQs >= 15) return 'dead-end-hall'
  return 'no-wing'
}

/**
 * Classify wing condition
 * @example
 * classifyWingCondition(80) // 'magnificent-maze'
 */
export function classifyWingCondition(avgQs: number): WingCondition {
  if (avgQs >= 75) return 'magnificent-maze'
  if (avgQs >= 60) return 'golden-labyrinth'
  if (avgQs >= 45) return 'decent-maze'
  if (avgQs >= 30) return 'crumbling-walls'
  if (avgQs >= 15) return 'ruined-passages'
  return 'void'
}

/**
 * Classify architect grade
 * @example
 * classifyArchitectGrade(85) // 'daedalus'
 */
export function classifyArchitectGrade(avgDesign: number): ArchitectGrade {
  if (avgDesign >= 80) return 'daedalus'
  if (avgDesign >= 65) return 'master-architect'
  if (avgDesign >= 50) return 'skilled-builder'
  if (avgDesign >= 35) return 'apprentice'
  if (avgDesign >= 20) return 'novice'
  return 'lost-soul'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(paths, wings, maze, stats)
 */
export function generateRecommendations(
  paths: AmberPath[],
  wings: LabyrinthWing[],
  maze: MazeSummary,
  stats: AmberLabyrinthStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPathClarity < 50) {
    recs.push('Improve path clarity with readable flow, logical sequences, and well-structured exports')
  }
  if (stats.avgAmberPreservation < 50) {
    recs.push('Strengthen amber preservation with documentation, meaningful names, and descriptive types')
  }
  if (stats.avgTwistCoherence < 50) {
    recs.push('Enhance twist coherence with logical branching, consistent conditions, and structured control flow')
  }
  if (stats.avgMinotaurHandling < 50) {
    recs.push('Improve minotaur handling with abstraction, decomposition, and pattern application')
  }
  if (stats.avgThreadFollowability < 50) {
    recs.push('Sharpen thread followability with traceable exports, observable patterns, and transparent types')
  }
  if (stats.collapsedCount > 0) {
    recs.push(`${stats.collapsedCount} file(s) are collapsed — they need complete labyrinth restoration`)
  }
  if (maze.overallDesign < 40) {
    recs.push('Overall maze design is poor — focus on path clarity and thread followability first')
  }
  const allCollapsed = wings.every(w => w.wingType === 'no-wing' || w.wingType === 'dead-end-hall')
  if (allCollapsed && wings.length > 0) {
    recs.push('All labyrinth wings are collapsed — consider a major amber reconstruction')
  }
  const collapsedFiles = paths.filter(p => p.condition === 'collapsed').map(p => p.file)
  if (collapsedFiles.length > 0 && collapsedFiles.length <= 3) {
    recs.push(`Restore these collapsed files into amber paths: ${collapsedFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your amber labyrinth achieves Daedalus-grade architecture! Every path gleams with golden clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as amber path
 * @example
 * const p = analyzeAmberPath(content, 'index.ts')
 * console.log(p.condition) // 'golden-maze'
 */
export function analyzeAmberPath(content: string, filePath: string): AmberPath {
  const navigating = measureNavigating(content)
  const preserving = measurePreserving(content)
  const twisting = measureTwisting(content)
  const taming = measureTaming(content)
  const tracing = measureTracing(content)

  const qualityScore = Math.round(
    navigating.clarity * 0.2 +
    preserving.preservation * 0.2 +
    twisting.coherence * 0.2 +
    taming.handling * 0.2 +
    tracing.followability * 0.2,
  )

  return {
    file: filePath,
    pathClarity: navigating.clarity,
    amberPreservation: preserving.preservation,
    twistCoherence: twisting.coherence,
    minotaurHandling: taming.handling,
    threadFollowability: tracing.followability,
    navigating,
    preserving,
    twisting,
    taming,
    tracing,
    condition: classifyPathCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as labyrinth wing
 * @example
 * const w = analyzeLabyrinthWing(paths, 'src')
 * console.log(w.wingType) // 'grand-labyrinth'
 */
export function analyzeLabyrinthWing(paths: AmberPath[], dirPath: string): LabyrinthWing {
  if (paths.length === 0) {
    return {
      directory: dirPath, paths: [], avgClarity: 0, avgCoherence: 0,
      avgFollowability: 0, goldenMazeCount: 0, collapsedCount: 0,
      wingType: 'no-wing', condition: 'void',
    }
  }

  const avgClarity = Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length)
  const avgCoherence = Math.round(paths.reduce((s, p) => s + p.twistCoherence, 0) / paths.length)
  const avgFollowability = Math.round(paths.reduce((s, p) => s + p.threadFollowability, 0) / paths.length)
  const goldenMazeCount = paths.filter(p => p.condition === 'golden-maze').length
  const collapsedCount = paths.filter(p => p.condition === 'collapsed').length
  const avgQs = Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length)

  return {
    directory: dirPath, paths, avgClarity, avgCoherence, avgFollowability,
    goldenMazeCount, collapsedCount,
    wingType: classifyWingType(paths),
    condition: classifyWingCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete amber labyrinth result
 * @example
 * const result = await buildAmberLabyrinthResult(files, contents)
 * console.log(result.stats.architectGrade) // 'daedalus'
 */
export async function buildAmberLabyrinthResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberLabyrinthResult> {
  const amberPaths = files.map((file, i) => analyzeAmberPath(contents[i] ?? '', file))

  const dirMap = new Map<string, AmberPath[]>()
  for (const ap of amberPaths) {
    const dir = path.dirname(ap.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ap) } else { dirMap.set(dir, [ap]) }
  }

  const wings = Array.from(dirMap.entries()).map(([dir, dirPaths]) =>
    analyzeLabyrinthWing(dirPaths, dir),
  )

  const avgClarity = amberPaths.length > 0
    ? Math.round(amberPaths.reduce((s, p) => s + p.pathClarity, 0) / amberPaths.length) : 0
  const avgCoherence = amberPaths.length > 0
    ? Math.round(amberPaths.reduce((s, p) => s + p.twistCoherence, 0) / amberPaths.length) : 0
  const avgFollowability = amberPaths.length > 0
    ? Math.round(amberPaths.reduce((s, p) => s + p.threadFollowability, 0) / amberPaths.length) : 0

  const overallDesign = amberPaths.length > 0
    ? Math.round((avgClarity + avgCoherence + avgFollowability) / 3) : 0
  const isNavigable = avgClarity >= 60

  const maze: MazeSummary = { avgClarity, avgCoherence, avgFollowability, isNavigable, overallDesign }

  const avgAmberPreservation = amberPaths.length > 0
    ? Math.round(amberPaths.reduce((s, p) => s + p.amberPreservation, 0) / amberPaths.length) : 0
  const avgMinotaurHandling = amberPaths.length > 0
    ? Math.round(amberPaths.reduce((s, p) => s + p.minotaurHandling, 0) / amberPaths.length) : 0

  const bestPath = amberPaths.length > 0
    ? amberPaths.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const clearest = amberPaths.length > 0
    ? amberPaths.reduce((best, p) => p.pathClarity > best.pathClarity ? p : best).file : ''
  const bestPreserved = amberPaths.length > 0
    ? amberPaths.reduce((best, p) => p.amberPreservation > best.amberPreservation ? p : best).file : ''
  const mostCoherent = amberPaths.length > 0
    ? amberPaths.reduce((best, p) => p.twistCoherence > best.twistCoherence ? p : best).file : ''
  const bestThread = amberPaths.length > 0
    ? amberPaths.reduce((best, p) => p.threadFollowability > best.threadFollowability ? p : best).file : ''

  const stats: AmberLabyrinthStats = {
    totalFiles: amberPaths.length,
    totalWings: wings.length,
    avgPathClarity: avgClarity,
    avgAmberPreservation,
    avgTwistCoherence: avgCoherence,
    avgMinotaurHandling,
    avgThreadFollowability: avgFollowability,
    goldenMazeCount: amberPaths.filter(p => p.condition === 'golden-maze').length,
    amberSanctuaryCount: amberPaths.filter(p => p.condition === 'amber-sanctuary').length,
    properLabyrinthCount: amberPaths.filter(p => p.condition === 'proper-labyrinth').length,
    crumblingMazeCount: amberPaths.filter(p => p.condition === 'crumbling-maze').length,
    darkTunnelCount: amberPaths.filter(p => p.condition === 'dark-tunnel').length,
    collapsedCount: amberPaths.filter(p => p.condition === 'collapsed').length,
    hasHighClarityCount: amberPaths.filter(p => p.navigating.hasHighClarity).length,
    hasHighPreservationCount: amberPaths.filter(p => p.preserving.hasHighPreservation).length,
    hasHighCoherenceCount: amberPaths.filter(p => p.twisting.hasHighCoherence).length,
    hasHighHandlingCount: amberPaths.filter(p => p.taming.hasHighHandling).length,
    hasHighFollowabilityCount: amberPaths.filter(p => p.tracing.hasHighFollowability).length,
    overallDesign,
    architectGrade: classifyArchitectGrade(overallDesign),
    bestPath, clearest, bestPreserved, mostCoherent, bestThread,
  }

  const recommendations = generateRecommendations(amberPaths, wings, maze, stats)

  return { paths: amberPaths, wings, maze, stats, recommendations }
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
